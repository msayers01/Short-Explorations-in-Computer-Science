// Browser tests (need a built site: `npm run build`, and Chromium: `npx playwright-core install chromium`).  node test_browser.js
// They check what node cannot: that programs run in sandboxes the page cannot be reached from, that a runaway program cannot freeze
// the page, and that the whole site works under its Content Security Policy.
const path = require('path');
const { chromium } = require('playwright-core');
const SITE = 'file://' + path.join(__dirname, 'dist/index.html');
let bad = 0;
const check = (name, ok, detail) => { if (!ok) { bad++; console.log('BAD  ' + name + (detail !== undefined ? '\n  ' + JSON.stringify(detail) : '')); } else console.log('ok   ' + name); };

(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  const violations = [], errors = [], dialogs = [];
  page.on('console', (m) => { if (/Content Security Policy|Refused to/i.test(m.text())) violations.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('dialog', (d) => { dialogs.push(d.message()); d.dismiss(); });
  const goto = async (hash) => { await page.goto(SITE + hash); await page.reload(); await page.waitForSelector('#app > *'); };
  const py = (code, opts) => page.evaluate(([c, o]) => window.PYRUN.run(c, o), [code, opts || {}]);
  const cpp = (code, opts) => page.evaluate(([c, o]) => window.CPPRUN.run(c, o), [code, opts || {}]);

  // ---- 1. the interpreters are not in the page
  await goto('#/lab');
  check('no Skulpt or JSCPP in the page', (await page.evaluate(() => [typeof Sk, typeof JSCPP])).join() === 'undefined,undefined');
  check('CSP is in the page', (await page.locator('meta[http-equiv="Content-Security-Policy"]').count()) === 1);

  // ---- 2. programs run, and are confined
  let r = await py('print(sum(range(5)))\nimport math\nprint(math.sqrt(16))');
  check('python runs', r.out === '10\n4.0\n' && !r.err, r);
  r = await py('x = input("a? ")\nprint(x + "!")', { stdin: 'hi' });
  check('python input from stdin', r.out === 'hi!\n', r);
  r = await py('print(1/0)'); check('python error text', /ZeroDivisionError.*line 1/.test(r.err || ''), r);
  for (const mod of ['document', 'urllib.request', 'webbrowser', 'image', 'processing', 'webgl']) {
    r = await py('import ' + mod + '\nprint("IMPORTED")'); check('python cannot import ' + mod, !r.out.includes('IMPORTED') && /No module named/.test(r.err || ''), r);
  }
  r = await cpp('#include <iostream>\nusing namespace std;\nint main() { cout << 6 * 7 << endl; }'); check('c++ runs', r.out === '42\n' && !r.err, r);
  r = await cpp('#include <iostream>\nusing namespace std;\nint main() { int x = 1 / 0; }'); check('c++ error text', /division by zero/i.test(r.err || ''), r);

  // ---- 3. even an interpreter that was fully compromised could not reach the page
  // The sandboxes run whatever they are sent, so send them hostile JavaScript directly, built the way runner.js builds them.
  const common = `try { localStorage.getItem('x'); out.push('localStorage reachable'); } catch (e) { out.push('no localStorage'); }
    out.push(typeof document === 'undefined' ? 'no document' : 'has its own document');`;
  const net = `fetch('https://example.com/').then(() => out.push('fetch worked'), () => out.push('fetch blocked')).then(() => post(out));`;
  const workerProbe = `const out = []; const post = (o) => self.postMessage(o);\n${common}\n${net}`;
  const frameProbe = `const out = []; const post = (o) => parent.postMessage({ t: 'probe', out: o }, '*');\n${common}
    try { parent.document.title; out.push('parent.document reachable'); } catch (e) { out.push('parent.document blocked'); }
    try { parent.localStorage.getItem('x'); out.push('parent.localStorage reachable'); } catch (e) { out.push('parent.localStorage blocked'); }
    try { top.location.href = 'https://example.com/'; out.push('navigated top'); } catch (e) { out.push('top navigation blocked'); }
    ${net}`;
  const verdicts = await page.evaluate(async ([workerProbe, frameProbe]) => {
    const out = {};
    // a worker, as the page makes it
    const url = URL.createObjectURL(new Blob([workerProbe], { type: 'text/javascript' }));
    out.worker = await new Promise((resolve) => { const w = new Worker(url); w.onmessage = (e) => { resolve(e.data); w.terminate(); }; w.onerror = (e) => resolve(['worker error: ' + e.message]); setTimeout(() => resolve(['timeout']), 5000); });
    // a sandboxed iframe, as the page makes it, sent the probe as its "interpreter"
    const boot = document.getElementById('py-boot').textContent;
    const f = document.createElement('iframe'); f.setAttribute('sandbox', 'allow-scripts'); f.style.display = 'none';
    f.srcdoc = '<!DOCTYPE html><html><body><script>' + boot + '<' + '/script></body></html>'; document.body.append(f);
    out.frame = await new Promise((resolve) => {
      window.addEventListener('message', function on(e) { if (e.source !== f.contentWindow) return; if (e.data && e.data.t === 'booted') f.contentWindow.postMessage({ t: 'init', src: frameProbe }, '*'); else if (e.data && e.data.t === 'probe') { window.removeEventListener('message', on); resolve(e.data.out); } });
      setTimeout(() => resolve(['timeout']), 8000);
    });
    f.remove();
    return out;
  }, [workerProbe, frameProbe]);
  check('the policy blocked the probes\' network requests', violations.some((v) => /connect-src/.test(v)));
  violations.length = 0;   // those were the point of the probes, not a problem
  const w = verdicts.worker.join(' | '), fr = verdicts.frame.join(' | ');
  check('worker: no localStorage', /no localStorage/.test(w), w);
  check('worker: no document', /no document/.test(w), w);
  check('worker: no network', /fetch blocked/.test(w) && !/fetch worked/.test(w), w);
  check('frame: no localStorage of its own', /no localStorage/.test(fr), fr);
  check('frame: cannot reach the page\'s document', /parent.document blocked/.test(fr) && !/reachable/.test(fr), fr);
  check('frame: cannot reach the page\'s storage', /parent.localStorage blocked/.test(fr), fr);
  check('frame: cannot navigate the page', /top navigation blocked/.test(fr) && !/navigated/.test(fr), fr);
  check('frame: no network', /fetch blocked/.test(fr), fr);

  // ---- 4. a runaway program cannot freeze the page, and can be stopped
  const t0 = Date.now();
  const running = page.evaluate(() => { window.__r = window.PYRUN.run('while True:\n    pass', { execLimit: 4000 }); return 1; });
  await running; await page.waitForTimeout(1200);
  const lag = await page.evaluate(() => new Promise((res) => { const t = performance.now(); setTimeout(() => res(performance.now() - t), 0); }));
  check('page stays responsive during an infinite loop', lag < 400, lag);
  await page.evaluate(() => window.PYRUN.cancel());
  r = await page.evaluate(() => window.__r);
  check('Stop ends an infinite loop at once', r.err === 'Stopped.' && Date.now() - t0 < 4000, { r, ms: Date.now() - t0 });
  r = await py('while True:\n    pass', { execLimit: 2000 });
  check('an infinite loop ends by itself', /Time limit exceeded/.test(r.err || ''), r);
  r = await py('print("fine")'); check('python works after the loop was ended', r.out === 'fine\n', r);
  r = await py('while True:\n    print("x" * 1000)', { execLimit: 20000 });
  check('a print flood is stopped', /more than it was allowed/.test(r.err || ''), r.err);
  r = await cpp('#include <iostream>\nusing namespace std;\nint main() { for (;;) { } }'); check('a c++ infinite loop ends', /Time limit exceeded/.test(r.err || ''), r);

  // ---- 5. the Code Lab, end to end, under the policy
  await goto('#/lab');
  const setCode = (c) => page.evaluate((c) => { const t = document.querySelector('.lab-editor textarea'); t.value = c; t.dispatchEvent(new Event('input', { bubbles: true })); }, c);
  const outText = async () => (await page.locator('.out-text').allInnerTexts()).join('|');
  await setCode('name = input("Name? ")\nprint("Hi", name)'); await page.click('.lab-toolbar button:has-text("Run")');
  await page.waitForSelector('.inline-input'); await page.fill('.inline-input', 'Ada'); await page.press('.inline-input', 'Enter'); await page.waitForTimeout(800);
  check('Lab: input() asks in the output panel', /Hi Ada/.test(await outText()), await outText());
  await setCode('import turtle\nt = turtle.Turtle()\nt.forward(50)\nturtle.done()\nprint("drawn")'); await page.click('.lab-toolbar button:has-text("Run")'); await page.waitForFunction(() => /finished in/.test(document.querySelector('.out-text').textContent), null, { timeout: 15000 }).catch(() => { });
  check('Lab: turtle draws in a sandboxed frame and the run finishes', (await page.locator('#lab-turtle iframe').getAttribute('sandbox')) === 'allow-scripts' && (await page.frameLocator('#lab-turtle iframe').locator('canvas').count()) > 0 && /drawn[\s\S]*finished in/.test(await outText()), await outText());
  await setCode('x = 1\ny = x + 1'); await page.click('.lab-toolbar button:has-text("Step through")'); await page.waitForSelector('.trace-vars table', { timeout: 8000 });
  await page.keyboard.press('Enter'); await page.waitForTimeout(300); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  check('Lab: step-through shows variables', /x\s+1/.test(await page.locator('.trace-vars').innerText()), await page.locator('.trace-vars').innerText());
  await page.click('.trace-box button:has-text("Run to end")'); await page.waitForTimeout(600);
  await page.click('.lang-btn:has-text("C++")'); await page.waitForSelector('.lab-editor textarea');
  await setCode('#include <iostream>\nusing namespace std;\nint main() { int a = 3; int *p = &a; cout << *p << endl; return 0; }');
  await page.click('.lab-toolbar button:has-text("Run")'); await page.waitForTimeout(1500);
  check('Lab: C++ runs', /^3/.test((await outText()).trim()), await outText());
  await page.click('.lab-toolbar button:has-text("Step through memory")'); await page.waitForSelector('.mem-view', { timeout: 10000 }); await page.waitForTimeout(400);
  check('Lab: memory stepper shows the program', /step 1 of/.test(await page.locator('.mem-box .panel-head .panel-note').innerText()));
  await page.click('.lang-btn:has-text("Scheme")'); await page.waitForSelector('.repl-inp');
  await page.fill('.repl-inp', '(* 6 7)'); await page.press('.repl-inp', 'Enter');
  check('Lab: Scheme REPL', /;Value: 42/.test(await page.locator('.repl-log').innerText()));

  // ---- 6. a graded exercise and a lesson example, under the policy
  await goto('#/python/1');
  await page.click('.play button:has-text("Run")'); await page.waitForTimeout(1500);
  check('lesson example runs', (await page.locator('.play .out-text').first().innerText()).length > 0);
  await goto('#/cpp/2'); await page.click('.play button:has-text("Run")'); await page.waitForTimeout(1500);
  check('C++ lesson example runs', (await page.locator('.play .out-text').first().innerText()).length > 0);
  // graded exercises go through the same sandboxes: every starter fails, every solution passes
  for (const course of ['python', 'cpp']) {
    const res = await page.evaluate(async (id) => {
      const c = window.COURSES.find((x) => x.id === id); const ex = []; for (const L of c.lessons) for (const b of L.blocks) if (b.ex && b.ex.solution && b.ex.starter != null && !b.ex.kind) ex.push(b.ex);
      const out = []; for (const e of ex.slice(0, 4)) { e.lang = e.lang || c.lang; const good = await window.__app.grade(e, e.solution), poor = await window.__app.grade(e, e.starter); out.push({ id: e.id, solution: good.passed, starter: poor.passed }); } return out;
    }, course);
    check(course + ' exercises are graded in the sandbox (' + res.length + ' checked)', res.length > 0 && res.every((x) => x.solution === true && x.starter === false), res);
  }
  for (const h of ['#/', '#/lisp/2', '#/math/1', '#/guide', '#/about', '#/portfolio']) await goto(h);

  // ---- 6b. saving and restoring work
  const fs = require('fs');
  await goto('#/');
  await page.evaluate(() => localStorage.clear());
  await page.reload(); await page.waitForSelector('.backup');
  await page.click('.backup button:has-text("Save my work")'); await page.waitForTimeout(300);
  check('backup: saving with nothing saved says so', /nothing saved on this device/.test(await page.locator('.backup-status').innerText()));
  await page.evaluate(() => {
    localStorage.setItem('shortcourses.progress.v1', JSON.stringify({ done: { 'py-1-1': 111, 'py-2-1': 222 }, code: { 'py-1-1': 'print("kept")' }, pass: { 'py-1-1': 'print("kept")' } }));
    localStorage.setItem('shortcourses.lab.v1', JSON.stringify({ lang: 'python', files: { python: [{ name: 'main.py', code: 'print("lab file")' }], cpp: [], scheme: [] }, active: { python: 0 }, fontSize: 15, panels: {} }));
  });
  await page.reload(); await page.waitForSelector('.backup');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('.backup button:has-text("Save my work")')]);
  const saved = fs.readFileSync(await dl.path(), 'utf8'); const savedJson = JSON.parse(saved);
  check('backup: a file is downloaded with the work in it', /^short-explorations-work-\d{4}-\d\d-\d\d\.json$/.test(dl.suggestedFilename()) && savedJson.app === 'short-explorations-backup' && Object.keys(savedJson.data.progress.done).length === 2 && savedJson.data.lab.files.python[0].code === 'print("lab file")', dl.suggestedFilename());
  check('backup: the status says what was saved', /2 completed exercises and 1 Code Lab program/.test(await page.locator('.backup-status').innerText()), await page.locator('.backup-status').innerText());
  // a hostile or wrong file changes nothing and says why
  await page.setInputFiles('.backup input[type=file]', { name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{"app":"short-explorations-backup","v":1,"data":{"progress":{"done":{"__proto__":1}}}}') });
  await page.waitForTimeout(400);
  check('backup: a file with nothing usable in it is refused', /empty/.test(await page.locator('.backup-status').innerText()), await page.locator('.backup-status').innerText());
  await page.setInputFiles('.backup input[type=file]', { name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('this is not json') });
  await page.waitForTimeout(400);
  check('backup: a file that is not a backup is refused', /not a backup file/.test(await page.locator('.backup-status').innerText()));
  check('backup: nothing was changed by the refused files', (await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('shortcourses.progress.v1')).done).length)) === 2);
  // wipe the site's storage (a new computer), then restore
  await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForSelector('.backup');
  await page.setInputFiles('.backup input[type=file]', { name: 'work.json', mimeType: 'application/json', buffer: Buffer.from(saved) });
  await page.waitForSelector('.backup-review:not([hidden])');
  check('backup: the review says what the file holds', /2 completed exercises, 1 Code Lab program/.test(await page.locator('.backup-review').innerText()), await page.locator('.backup-review').innerText());
  await Promise.all([page.waitForNavigation({ waitUntil: 'load' }).catch(() => { }), page.click('.backup-review button:has-text("Restore")')]);
  await page.waitForSelector('.backup'); await page.waitForTimeout(300);
  const after = await page.evaluate(() => ({ p: JSON.parse(localStorage.getItem('shortcourses.progress.v1')), l: JSON.parse(localStorage.getItem('shortcourses.lab.v1')) }));
  check('backup: restoring on an empty device brings the work back', after.p.done['py-2-1'] === 222 && after.p.code['py-1-1'] === 'print("kept")' && after.l.files.python[0].code === 'print("lab file")', after);
  check('backup: the home page shows the restored progress', /completed 2 exercises/.test(await page.locator('main.home').innerText()));
  // "replace" asks for a second click
  await page.evaluate(() => localStorage.setItem('shortcourses.progress.v1', JSON.stringify({ done: { 'py-9-9': 1 }, code: {}, pass: {} }))); await page.reload(); await page.waitForSelector('.backup');
  await page.setInputFiles('.backup input[type=file]', { name: 'work.json', mimeType: 'application/json', buffer: Buffer.from(saved) });
  await page.waitForSelector('.backup-review:not([hidden])');
  await page.check('.backup-review input[value=replace]'); await page.click('.backup-review button:has-text("Restore")');
  check('backup: replacing needs a second click', /Click again/.test(await page.locator('.backup-review button.primary').innerText()) && (await page.evaluate(() => 'py-9-9' in JSON.parse(localStorage.getItem('shortcourses.progress.v1')).done)));
  await Promise.all([page.waitForNavigation({ waitUntil: 'load' }).catch(() => { }), page.click('.backup-review button.primary')]);
  await page.waitForSelector('.backup'); await page.waitForTimeout(300);
  check('backup: after the second click the file has replaced it', await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('shortcourses.progress.v1')).done; return !('py-9-9' in d) && 'py-1-1' in d; }));

  // ---- 6c. a saved portfolio page is small: the embedded typefaces are left out
  await goto('#/portfolio');
  const [pdl] = await Promise.all([page.waitForEvent('download'), page.click('button:has-text("Download as a web page")')]);
  const pf = fs.readFileSync(await pdl.path(), 'utf8');
  check('saved portfolio page is small (' + Math.round(pf.length / 1024) + ' KB)', pf.length < 200 * 1024 && !/@font-face/.test(pf) && /font-src 'none'/.test(pf) && /script-src 'none'/.test(pf), pf.length);

  // ---- 7. a browser that cannot make a worker (or an embedding that forbids it) falls back to a hidden sandboxed iframe
  const fb = await browser.newPage(); const fbViolations = [];
  fb.on('console', (m) => { if (/Content Security Policy|Refused to/i.test(m.text())) fbViolations.push(m.text().slice(0, 160)); });
  await fb.addInitScript(() => { window.Worker = undefined; });
  await fb.goto(SITE + '#/'); await fb.waitForSelector('#app > *');
  let f1 = await fb.evaluate(() => window.PYRUN.run('print(6 * 7)\nimport document'));
  check('fallback (no Worker): python runs in a sandboxed frame', f1.out === '42\n' && /No module named document/.test(f1.err || ''), f1);
  let f2 = await fb.evaluate(() => window.CPPRUN.run('#include <iostream>\nusing namespace std;\nint main() { cout << 7 << endl; }'));
  check('fallback (no Worker): c++ runs in a sandboxed frame', f2.out === '7\n' && !f2.err, f2);
  check('fallback uses a sandboxed iframe', (await fb.evaluate(() => [...document.querySelectorAll('iframe')].map((f) => f.getAttribute('sandbox')))).every((x) => x === 'allow-scripts'));
  check('fallback has no policy violations', fbViolations.length === 0, fbViolations);
  await fb.close();

  check('no Content Security Policy violations', violations.length === 0, violations.slice(0, 3));
  check('no page errors', errors.length === 0, errors.slice(0, 3));
  check('no dialogs', dialogs.length === 0, dialogs);
  await browser.close();
  if (bad) { console.log(bad + ' problems'); process.exit(1); }
  console.log('browser OK');
})().catch((e) => { console.log('FAILED to run: ' + e.stack); process.exit(1); });
