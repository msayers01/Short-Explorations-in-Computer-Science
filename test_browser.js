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
  const java = (code, opts) => page.evaluate(([c, o]) => window.JAVARUN.run(c, o), [code, opts || {}]);

  // ---- 1. the interpreters are not in the page
  await goto('#/lab');
  check('no Skulpt, JSCPP or the Java interpreter in the page', (await page.evaluate(() => [typeof Sk, typeof JSCPP, typeof JAVA])).join() === 'undefined,undefined,undefined');
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
  r = await java('import java.util.Scanner;\npublic class Main { public static void main(String[] args) { Scanner in = new Scanner(System.in); int n = in.nextInt(); System.out.println("Twice " + n + " is " + 2 * n); } }', { stdin: '21' }); check('java runs, with input', r.out === 'Twice 21 is 42\n' && !r.err, r);
  r = await java('public class Main { public static void main(String[] args) { int x = "a"; } }'); check('java compile error text', /Main\.java:1: error: incompatible types: String cannot be converted to int/.test(r.err || ''), r);
  r = await java('public class Main { public static void main(String[] args) { int[] a = new int[2]; a[2] = 1; } }'); check('java exception text', /ArrayIndexOutOfBoundsException: Index 2 out of bounds for length 2/.test(r.err || ''), r);

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

  // ---- 3b. the interpreters' own workers have every way of making requests, starting workers or reaching stored data removed (src/lockdown.js)
  const lockProbe = `try { const have = []; for (const n of ['fetch', 'XMLHttpRequest', 'WebSocket', 'WebTransport', 'EventSource', 'importScripts', 'Worker', 'SharedWorker', 'BroadcastChannel', 'indexedDB', 'caches', 'RTCPeerConnection']) { if (typeof self[n] !== 'undefined') have.push(n); for (let o = self; o; o = Object.getPrototypeOf(o)) if (Object.prototype.hasOwnProperty.call(o, n) && typeof o[n] !== 'undefined') have.push(n + ' (inherited)'); } self.postMessage({ t: 'probe', have }); } catch (e) { self.postMessage({ t: 'probe', error: String(e) }); }`;
  for (const src of ['py-src', 'cpp-src', 'java-src']) {
    const res = await page.evaluate(([src, probe]) => new Promise((ok) => {
      const w = new Worker(URL.createObjectURL(new Blob([document.getElementById(src).textContent + ';\n' + probe], { type: 'text/javascript' })));
      w.onmessage = (e) => { if (e.data && e.data.t === 'probe') { ok(e.data); w.terminate(); } };
      setTimeout(() => ok({ error: 'no answer' }), 15000);
    }), [src, lockProbe]);
    check(src + ': no request, worker or storage API is left in the sandbox', Array.isArray(res.have) && res.have.length === 0, res);
  }

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
  r = await java('public class Main { public static void main(String[] args) { while (true) { } } }'); check('a java infinite loop ends', /Time limit exceeded/.test(r.err || ''), r);
  r = await java('public class Main { public static void main(String[] args) { System.out.println("fine"); } }'); check('java works after the loop was ended', r.out === 'fine\n', r);

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
  await page.click('.lang-btn:has-text("Java")'); await page.waitForSelector('.lab-editor textarea');
  await setCode('public class Main {\n    public static void main(String[] args) {\n        System.out.println("Lab " + (6 * 7));\n    }\n}');
  await page.click('.lab-toolbar button:has-text("Run")'); await page.waitForFunction(() => /finished in/.test(document.querySelector('.out-text').textContent), null, { timeout: 15000 }).catch(() => { });
  check('Lab: Java runs', /Lab 42/.test(await outText()), await outText());
  await setCode('public class Main {\n    public static void main(String[] args) {\n        int x = 5\n    }\n}');
  await page.click('.lab-toolbar button:has-text("Run")'); await page.waitForTimeout(1500);
  check('Lab: a Java compile error names its line and gets a tip', /Main\.java:3: error: ';' expected/.test(await outText()) && (await page.locator('.out-text .goto').count()) === 1, await outText());
  await page.click('.lang-btn:has-text("C++")'); await page.waitForSelector('.lab-editor textarea');
  await setCode('#include <iostream>\nusing namespace std;\nint main() { int a = 3; int *p = &a; cout << *p << endl; return 0; }');
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
  await goto('#/java/1'); await page.click('.play button:has-text("Run")'); await page.waitForTimeout(2500);
  check('Java lesson example runs', /Hello, world!/.test(await page.locator('.play .out-text').first().innerText()), await page.locator('.play .out-text').first().innerText());
  // graded exercises go through the same sandboxes: every starter fails, every solution passes
  for (const course of ['scratch', 'python', 'cpp', 'java', 'dsa']) {
    const res = await page.evaluate(async (id) => {
      const c = window.COURSES.find((x) => x.id === id); const ex = []; for (const L of c.lessons) for (const b of L.blocks) if (b.ex && b.ex.solution && b.ex.starter != null && !b.ex.kind) ex.push(b.ex);
      const out = []; for (const e of ex.slice(0, 4)) { e.lang = e.lang || c.lang; const good = await window.__app.grade(e, e.solution), poor = await window.__app.grade(e, e.starter); out.push({ id: e.id, solution: good.passed, starter: poor.passed }); } return out;
    }, course);
    check(course + ' exercises are graded in the sandbox (' + res.length + ' checked)', res.length > 0 && res.every((x) => x.solution === true && x.starter === false), res);
  }
  await goto('#/scratch/3');
  check('Scratch blocks render beside Python', (await page.locator('.sb-stack .sb').count()) >= 3);
  const turtlePlay = page.locator('.play').filter({ hasText: 'import turtle' }).first();
  await turtlePlay.locator('button:has-text("Run")').click(); await page.waitForSelector('.play-turtle iframe', { timeout: 15000 }).catch(() => { });
  check('a lesson example draws with turtle in a sandboxed frame', (await page.locator('.play-turtle iframe').count()) === 1 && (await page.locator('.play-turtle iframe').getAttribute('sandbox')) === 'allow-scripts' && (await page.frameLocator('.play-turtle iframe').locator('canvas').count()) > 0);
  await goto('#/dsa/1');
  check('DSA figures render', (await page.locator('.fig-mount svg').count()) >= 3);
  check('the Under development tag is shown', (await page.locator('.dev-tag').count()) >= 1);
  await goto('#/dsa/5');
  check('the linked-list figure renders', (await page.locator('.fig-mount svg').count()) >= 1);
  await goto('#/dsa/6');
  const sq = page.locator('.fig-mount').first(); await sq.locator('button:has-text("Push")').click(); await sq.locator('button:has-text("Push")').click(); await sq.locator('button:has-text("Pop")').click();
  check('the stack figure pops what was pushed last', /pop\(\).*= 2/.test(await sq.locator('.fig-status').textContent()));
  await goto('#/dsa/7');
  const cs = page.locator('.fig-mount').first(); for (let i = 0; i < 4; i++) await cs.locator('button:has-text("Step")').click();
  check('the call-stack figure piles up frames', (await cs.locator('svg rect').count()) >= 4);
  await goto('#/scratch/4');
  check('a Scratch if-else block renders with an else arm', (await page.locator('.sb-c .sb-row:has-text("else")').count()) >= 1);
  const qc = page.locator('.qc').first();
  await qc.locator('.qc-opt').nth(0).click();
  const qcFirst = await qc.locator('.qc-why').textContent();
  await qc.locator('.qc-opt').nth(1).click();
  check('a quick check marks a wrong option and then the right one, with an explanation', /Not that one/.test(qcFirst) && (await qc.locator('.qc-opt.right').count()) === 1 && /Yes\./.test(await qc.locator('.qc-why').textContent()));
  check('the lesson map lists the parts and the side column follows the page', (await page.locator('.lesson-map li').count()) >= 4 && (await page.locator('.onpage li').count()) >= 4);
  const quiz = page.locator('.bq').first();
  await quiz.locator('.bq-input').fill('if score > 100'); await quiz.locator('button:has-text("Check")').click();
  const quizWrong = await quiz.locator('.bq-msg').textContent();
  await quiz.locator('.bq-input').fill("if score > 100:"); await quiz.locator('button:has-text("Check")').click();
  check('the translate-the-block quiz marks a missing colon and accepts the right line', /colon/.test(quizWrong) && (await quiz.locator('.bq-msg.ok').count()) === 1, quizWrong);
  for (const h of ['#/', '#/lisp/2', '#/math/1', '#/dsa/2', '#/dsa/3', '#/dsa/4', '#/scratch/5', '#/scratch/6', '#/scratch/7', '#/guide', '#/about', '#/portfolio']) await goto(h);

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

  // ---- 7b. Full C++: the real compiler, downloaded on demand (needs the site served over http, so start a small web server)
  check('full c++ is unavailable when the site is opened as a file', /web address/.test(await page.evaluate(() => window.CLANGRUN.unavailable() || '')));
  const http = require('http');
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.gz': 'application/gzip', '.md': 'text/plain' };
  const root = path.join(__dirname, 'dist');
  let tamper = false;   // when set, the server hands out a changed compiler script
  const server = http.createServer((req, res) => {
    const p = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
    if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end('no'); return; }
    if (tamper && p.endsWith('toolchain.js')) { const body = Buffer.concat([fs.readFileSync(p), Buffer.from(';self.__tampered = true;')]); res.writeHead(200, { 'Content-Type': 'text/javascript', 'Content-Length': body.length }); res.end(body); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream', 'Content-Length': fs.statSync(p).size }); fs.createReadStream(p).pipe(res);
  });
  await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
  const origin = 'http://127.0.0.1:' + server.address().port;
  const hp = await browser.newPage({ viewport: { width: 1100, height: 900 } }); const hpViolations = [], hpErrors = [], clangReqs = [], otherReqs = [];
  hp.on('console', (m) => { if (/Content Security Policy|Refused to/i.test(m.text())) hpViolations.push(m.text().slice(0, 200)); });
  hp.on('pageerror', (e) => hpErrors.push(e.message));
  hp.on('request', (rq) => { const u = rq.url(); if (u.includes('/clang/')) clangReqs.push(u); else if (!u.startsWith(origin) && !u.startsWith('blob:') && !u.startsWith('data:')) otherReqs.push(u); });
  await hp.goto(origin + '/index.html#/lab'); await hp.waitForSelector('#app > *');
  check('full c++: available over http', (await hp.evaluate(() => window.CLANGRUN.unavailable())) === null);
  await hp.click('.lang-btn:has-text("C++")');
  check('full c++: the Lab offers the choice of engine, teaching by default', (await hp.locator('button:has-text("Engine: Teaching")').count()) === 1 && (await hp.locator('button:has-text("Step through memory")').count()) === 1);
  await hp.click('button:has-text("Engine: Teaching")');
  check('full c++: choosing it hides the memory stepper', (await hp.locator('button:has-text("Engine: Full C++")').count()) === 1 && (await hp.locator('button:has-text("Step through memory")').count()) === 0);
  const setHpCode = async (code) => { await hp.fill('.lab-editor-area textarea', code); };
  const hpOut = () => hp.locator('.lab-out').innerText();
  await setHpCode('#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\nint main() { vector<string> v = {"a", "b"}; int unused; for (auto& s : v) cout << s << "\\n"; return 0; }\n');
  await hp.click('button:has-text("Run")');
  await hp.waitForSelector('.clang-gate');
  check('full c++: the first run asks before downloading anything', clangReqs.length === 0 && /about \d+ MB/.test(await hp.locator('.clang-gate').innerText()), clangReqs);
  await hp.click('button:has-text("Download it and continue")');
  await hp.waitForFunction(() => /\ba\nb\n/.test(document.querySelector('.lab-out .out-text').textContent), null, { timeout: 120000 });
  r = await hpOut();
  check('full c++: a program with std::string and vector runs', /\na\nb\n/.test('\n' + r.replace(/^[\s\S]*generated\.\n/, '')) || /a\nb/.test(r), r);
  check('full c++: compiler warnings are shown', /unused variable 'unused'/.test(r), r);
  check('full c++: the download came from this site only, under /clang/<version>/', clangReqs.length > 3 && clangReqs.every((u) => u.startsWith(origin + '/clang/')) && otherReqs.length === 0, [clangReqs, otherReqs]);
  check('full c++: agreeing is remembered', (await hp.evaluate(() => localStorage.getItem('se.realcpp'))) === '1');
  await setHpCode('#include <iostream>\nint main() { int x = "a"; return y; }\n');
  await hp.click('button:has-text("Run")');
  await hp.waitForFunction(() => /error/.test(document.querySelector('.lab-out .out-text').textContent), null, { timeout: 60000 });
  r = await hpOut();
  check('full c++: compiler errors are shown, with a link to the line', /error: use of undeclared identifier 'y'/.test(r) && /go to line 2/.test(r), r);
  check('full c++: no "process exited" noise in the error', !/process exited/.test(r), r);
  await setHpCode('#include <iostream>\nint main() { std::cout << "start" << std::endl; for (;;) {} }\n');
  await hp.click('button:has-text("Run")');
  await hp.waitForFunction(() => /start/.test(document.querySelector('.lab-out .out-text').textContent), null, { timeout: 60000 });
  await hp.click('button:has-text("Stop")');
  await hp.waitForFunction(() => /Stopped/.test(document.querySelector('.lab-out .out-text').textContent), null, { timeout: 10000 });
  check('full c++: Stop ends a program that never finishes', true);
  await setHpCode('#include <iostream>\n#include <vector>\nint main() { std::vector<int> v(2); std::cout << "hi\\n"; std::cout << v.at(5); }\n');
  await hp.click('button:has-text("Run")');
  await hp.waitForFunction(() => /stopped abnormally/.test(document.querySelector('.lab-out .out-text').textContent), null, { timeout: 60000 });
  check('full c++: a program that aborts is stopped with an explanation, and its earlier output is kept', /hi\n/.test(await hpOut()), await hpOut());
  check('full c++: the engine choice is remembered', (await hp.evaluate(() => JSON.parse(localStorage.getItem('shortcourses.lab.v1')).fullCpp)) === true);
  // the course: every exercise of SC 105 is graded by compiling once and running once for each test
  await hp.goto(origin + '/index.html#/modern'); await hp.reload(); await hp.waitForSelector('#app > *');
  check('full c++: the Modern C++ course is listed with its code', /SC 105/.test(await hp.locator('main').innerText()));
  await hp.goto(origin + '/index.html#/modern/1'); await hp.reload(); await hp.waitForSelector('.exercise');   // rendering the lesson is what gives each exercise its language and runtime
  const graded = await hp.evaluate(async () => {
    const ex = window.COURSES.find((c) => c.id === 'modern').lessons[0].blocks.filter((b) => b.ex).map((b) => b.ex)[1];
    const host = document.createElement('div'); document.body.append(host);
    const good = await window.__app.grade(ex, ex.solution, host), bad = await window.__app.grade(ex, ex.starter, host);
    const broken = await window.__app.grade(ex, 'bool isPalindrome(string s) { return s.size( }', host);
    const hasMain = await window.__app.grade(ex, 'bool isPalindrome(string s) { return true; }\nint main() { return 0; }', host);
    return { runtime: ex.runtime, good: good.passed + ':' + good.results.length, bad: bad.passed, broken: broken.error, hasMain: hasMain.error };
  });
  check('full c++: an exercise of the course is graded on the real compiler (solution passes, starter fails)', graded.runtime === 'full' && graded.good === 'true:7' && graded.bad === false, graded);
  check('full c++: a compile error in an exercise is reported with the student\'s own line numbers', /main\.cpp:\d+:\d+: error/.test(graded.broken || '') && /main\.cpp:1:/.test(graded.broken || ''), graded.broken);
  check('full c++: an exercise that supplies main() refuses the student\'s own', /write only the function/.test(graded.hasMain || ''), graded.hasMain);
  // the language standard: C++17 refuses what C++20 allows, C++23 reports its own version
  await hp.goto(origin + '/index.html#/lab'); await hp.reload(); await hp.waitForSelector('.lab-editor-area textarea');
  check('full c++: the standard picker is offered with Full C++ (C++20 by default)', (await hp.locator('select.std-sel').count()) === 1 && (await hp.locator('select.std-sel').inputValue()) === 'gnu++20');
  const fmt = '#include <iostream>\n#include <format>\nint main() { std::cout << std::format("v{}", __cplusplus) << std::endl; }\n';
  await setHpCode(fmt); await hp.click('.lab-toolbar button:has-text("Run")');
  await hp.waitForFunction(() => /v\d+/.test(document.querySelector('.lab-out .out-text').textContent), null, { timeout: 90000 });
  check('full c++: C++20 is the default standard', /v202002/.test(await hpOut()), await hpOut());
  await hp.selectOption('select.std-sel', 'gnu++23'); await hp.click('.lab-toolbar button:has-text("Run")');
  await hp.waitForFunction(() => /v202302/.test(document.querySelector('.lab-out .out-text').textContent), null, { timeout: 90000 });
  check('full c++: C++23 can be chosen', true);
  await hp.selectOption('select.std-sel', 'gnu++17'); await hp.click('.lab-toolbar button:has-text("Run")');
  await hp.waitForFunction(() => /error/.test(document.querySelector('.lab-out .out-text').textContent), null, { timeout: 90000 });
  check('full c++: C++17 does not have std::format', /no member named 'format'/.test(await hpOut()), await hpOut());
  check('full c++: the chosen standard is remembered', (await hp.evaluate(() => JSON.parse(localStorage.getItem('shortcourses.lab.v1')).cppStd)) === 'gnu++17');
  await hp.selectOption('select.std-sel', 'gnu++20');
  // a teacher's assignment can ask for Full C++; the student's copy carries that, and the Lab then insists on it
  const aLink = await hp.evaluate(async () => {
    const a = { v: 1, id: 'wordsfull', title: 'Count the letters', lang: 'cpp', runtime: 'full', text: 'Print how many letters the word has.', starter: '#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    string w;\n    cin >> w;\n    // your code\n}\n', tests: [{ k: 'stdin', in: 'hello', expect: '5' }, { k: 'stdin', in: 'a', expect: '1' }], hints: [], roster: [], author: 'Ms T', due: '', created: 1 };
    return location.href.split('#')[0] + '#/assign?a=' + await window.TEACH.pack(window.TEACH.studentCopy(window.TEACH.normalize(a)));
  });
  await hp.goto('about:blank'); await hp.goto(aLink); await hp.waitForSelector('.asg-bar');
  check('full c++ assignment: the bar says Full C++ and the engine is fixed', /Full C\+\+/.test(await hp.locator('.asg-bar').innerText()) && (await hp.locator('button:has-text("Engine: Full C++")').isDisabled()), await hp.locator('.asg-bar').innerText());
  await setHpCode('#include <iostream>\n#include <string>\nusing namespace std;\nint main() { string w; cin >> w; cout << w.size() << endl; }\n');
  await hp.click('.asg-bar button:has-text("Check")');
  await hp.waitForSelector('.asg-bar .verdict:not([hidden]) .v-title', { timeout: 120000 });
  check('full c++ assignment: the student\'s program is checked on the real compiler', /2 of 2 tests passed|passes every test|Correct|Yes|Exactly|That works/.test(await hp.locator('.asg-bar .verdict').innerText()), await hp.locator('.asg-bar .verdict').innerText());
  // limits: a program's memory is capped, endless output is cut off while grading too, and a link never starts the download by itself
  const memProg = '#include <cstdlib>\n#include <cstdio>\nint main(){ long mb = 0; for (int i = 0; i < 400; i++) { volatile char* p = (volatile char*)malloc(8u << 20); if (!p) { printf("NULL after %ld MB\\n", mb); return 0; } for (unsigned k = 0; k < (8u << 20); k += 4096) p[k] = 1; mb += 8; } printf("reached %ld MB\\n", mb); }';
  const memRes = await hp.evaluate((c) => window.CLANGRUN.run(c), memProg);
  check('full c++: a program cannot take more than 256 MB of memory (malloc says no)', /NULL after (\d+) MB/.test(memRes.out) && +memRes.out.match(/NULL after (\d+) MB/)[1] <= 256 && +memRes.out.match(/NULL after (\d+) MB/)[1] >= 128, memRes.out);
  const floodStart = Date.now();
  const flood = await hp.evaluate(() => window.CLANGRUN.runMany('#include <cstdio>\nint main(){ for(;;) puts("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"); }', ['', '']));
  check('full c++: endless output is cut off while grading too, and the next run still happens', flood.parts.length === 2 && flood.parts.every((x) => /printed more than it was allowed/.test(x.err || '') && x.all.length <= 2e6), [flood.err, flood.parts.map((x) => [x.all.length, x.err])]);
  check('full c++: that took seconds, not the whole time allowance', Date.now() - floodStart < 15000, Date.now() - floodStart);
  tamper = true;
  const tp = await (await browser.newContext()).newPage(); const tReqs = [];
  tp.on('request', (rq) => { if (rq.url().includes('/clang/') && !rq.url().endsWith('toolchain.js')) tReqs.push(rq.url()); });
  await tp.goto(origin + '/index.html#/'); await tp.waitForSelector('#app > *'); await tp.evaluate(() => window.CLANGRUN.allow());
  const tampered = await tp.evaluate(() => window.CLANGRUN.run('int main() { return 0; }'));
  check('full c++: a compiler script that is not the one the site was built with is refused, and nothing else is downloaded', /not the one this version of the site expects/.test(tampered.err || '') && tReqs.length === 0, [tampered.err, tReqs]);
  tamper = false; await tp.close();
  // a compile that crashes the compiler must never run the previous compile's program (it used to: the old object file was still there)
  const prevProg = '#include <iostream>\nint main(){ std::cout << "PREVIOUS PROGRAM\\n"; }';
  const rr = (c) => hp.evaluate((c) => window.CLANGRUN.run(c).then((r) => ({ out: r.out, err: r.err })), c);
  const s1 = await rr(prevProg), s1b = await rr(prevProg);
  const sNested = await rr('#include <cstdio>\nint main(){ puts("NEW PROGRAM"); return ' + '('.repeat(200000) + '1' + ')'.repeat(200000) + '; }');
  const sHuge = await rr('#include <cstdio>\nint a[1<<29];\nint main(){ puts("NEW PROGRAM"); }');
  const s6 = await rr(prevProg);
  check('full c++: the same program can be run again straight away', s1.out === 'PREVIOUS PROGRAM\n' && s1b.out === 'PREVIOUS PROGRAM\n', [s1, s1b]);
  check('full c++: a program that crashes the compiler (too deeply nested) reports that and runs nothing', !!sNested.err && !/PREVIOUS|NEW/.test(sNested.out) && /could not finish|too large/.test(sNested.err), sNested);
  check('full c++: a program that exhausts the compiler\'s memory reports that and runs nothing', !!sHuge.err && !/PREVIOUS|NEW/.test(sHuge.out), sHuge);
  check('full c++: after those failures the earlier program still builds and runs', s6.out === 'PREVIOUS PROGRAM\n' && !s6.err, s6);
  const sGrade = await hp.evaluate(() => window.CLANGRUN.runMany('#include <iostream>\nint main(){ std::cout << "PREVIOUS PROGRAM\\n"; }', ['']).then(() => window.CLANGRUN.runMany('int a[1<<29];\nint main(){ return a[1]; }', ['', ''])).then((r) => ({ err: r.err, parts: r.parts.length })));
  check('full c++: while grading, a failed build leaves no results at all', !!sGrade.err && sGrade.parts === 0, sGrade);
  const fresh = await browser.newContext(); const fp = await fresh.newPage(); const freshReqs = [];
  fp.on('request', (rq) => { if (rq.url().includes('/clang/')) freshReqs.push(rq.url()); });
  await fp.goto('about:blank'); await fp.goto(aLink); await fp.waitForSelector('.asg-bar');
  await fp.waitForTimeout(1500);
  check('full c++ assignment: opening its link downloads nothing', freshReqs.length === 0 && (await fp.evaluate(() => localStorage.getItem('se.realcpp'))) === null, freshReqs);
  await fp.click('.asg-bar button:has-text("Check")');
  await fp.waitForSelector('.clang-gate');
  check('full c++ assignment: Check asks first, and still nothing is downloaded', freshReqs.length === 0, freshReqs);
  await fp.click('.clang-gate button:has-text("Not now")'); await fp.waitForTimeout(500);
  check('full c++ assignment: "Not now" downloads nothing and says so', freshReqs.length === 0 && /not downloaded/.test(await fp.locator('.asg-bar .verdict').innerText()), freshReqs);
  await fresh.close();
  check('full c++: no policy violations, no page errors', hpViolations.length === 0 && hpErrors.length === 0, [hpViolations, hpErrors]);
  await hp.close(); server.close();

  check('no Content Security Policy violations', violations.length === 0, violations.slice(0, 3));
  check('no page errors', errors.length === 0, errors.slice(0, 3));
  check('no dialogs', dialogs.length === 0, dialogs);
  await browser.close();
  if (bad) { console.log(bad + ' problems'); process.exit(1); }
  console.log('browser OK');
})().catch((e) => { console.log('FAILED to run: ' + e.stack); process.exit(1); });
