// Security probe (manual; needs Playwright with Chromium, and a built site: `npm run build`).
//   node tools/security/inputs-and-output.js
// About 150 figure/exercise inputs, program output and error text, steppers, tampered localStorage, the downloaded portfolio page.
// Exit code is not used: read the printed lines. Anything marked XSS!! or "polluted" with a value is a finding.
const path = require('path');
const { pathToFileURL } = require('url');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright'))); }
const executablePath = process.env.CHROMIUM_PATH || undefined;
const SITE = pathToFileURL(path.join(__dirname, '../../dist/index.html')).href;
const URL0 = SITE;
const PAY = ['"><img src=x onerror="window.__xss=\'img\'">', '<svg/onload="window.__xss=\'svg\'">', '</script><script>window.__xss="script"</script>', '<img/src=x/onerror=window.__xss=1>'];
const payload = PAY.join(' ');
(async () => {
  const b = await chromium.launch(executablePath ? { executablePath } : {});
  const ctx = await b.newContext(); const p = await ctx.newPage(); const dialogs = [], errs = [];
  p.on('dialog', d => { dialogs.push(d.message()); d.dismiss(); }); p.on('pageerror', e => errs.push(e.message));
  const xss = () => p.evaluate(() => window.__xss);
  const report = async (name) => { console.log((await xss() ? 'XSS!! ' : 'ok    ') + name + (dialogs.length ? ' DIALOGS ' + dialogs.length : '')); };
  await p.goto(URL0 + '#/'); await p.waitForSelector('#app');
  // positive control: the canary really detects an injected handler
  await p.evaluate(() => { document.body.insertAdjacentHTML('beforeend', '<img src=x onerror="window.__xss=\'control\'">'); }); await p.waitForTimeout(200);
  console.log('control detects injection:', await xss()); await p.evaluate(() => { window.__xss = undefined; });

  // 1. every text input in every lesson figure + exercises + math answers
  const routes = await p.evaluate(() => window.COURSES.flatMap(c => c.lessons.map((l, i) => '#/' + c.id + '/' + (i + 1))));
  let inputs = 0;
  for (const r of routes) {
    await p.goto(URL0 + r); await p.reload(); await p.waitForTimeout(150);
    const n = await p.locator('.fig-mount input[type=text], .fig-mount input[type=number], .fig-mount textarea, input.ans').count();
    for (let i = 0; i < n; i++) {
      const el = p.locator('.fig-mount input[type=text], .fig-mount input[type=number], .fig-mount textarea, input.ans').nth(i);
      for (const v of [payload, PAY[3]]) { await el.fill(v).catch(() => { }); await el.dispatchEvent('input').catch(() => { }); await el.dispatchEvent('change').catch(() => { }); }
      inputs++;
    }
    if (await xss()) { console.log('XSS!! on', r); break; }
  }
  console.log('fuzzed', inputs, 'inputs in', routes.length, 'lessons; xss =', await xss(), 'dialogs =', dialogs.length, 'pageerrors =', errs.length, errs.slice(0, 3));
  await report('figure + exercise inputs');

  // 2. program output / errors / tracer / memory stepper with payloads
  await p.goto(URL0 + '#/lab'); await p.reload(); await p.waitForSelector('.lab-editor textarea');
  const setCode = (c) => p.evaluate((c) => { const t = document.querySelector('.lab-editor textarea'); t.value = c; t.dispatchEvent(new Event('input', { bubbles: true })); }, c);
  const run = async (btn) => { await p.click('.lab-toolbar button:has-text("' + btn + '")'); await p.waitForTimeout(1200); };
  const bad = '<img src=x onerror=window.__xss=1>';
  await setCode('print("' + bad + '")\nx = "' + bad + '"\nprint(undefined_name_' + 'a' + ')\n'); await run('Run'); await report('python output + NameError');
  await setCode('x = "' + bad + '"\nfor i in range(2):\n    y = x\n'); await run('Step through'); for (let i = 0; i < 4; i++) await p.keyboard.press('Enter').catch(() => { }); await p.click('.trace-box button:has-text("Stop")').catch(() => { }); await p.waitForTimeout(300); await report('python tracer vars');
  await setCode('raise Exception("' + bad + '")'); await run('Run'); await report('python exception text');
  await p.click('.lang-btn:has-text("C++")'); await p.waitForSelector('.lab-editor textarea');
  await setCode('#include <iostream>\nusing namespace std;\nint main() { char s[] = "' + bad + '"; cout << s << endl; int x = 1 / 0; }'); await run('Run'); await report('c++ output + runtime error');
  await setCode('#include <iostream>\nusing namespace std;\nint main() { char s[] = "' + bad + '"; cout << s << endl; return 0; }'); await run('Step through memory'); for (let i = 0; i < 5; i++) await p.keyboard.press('Enter').catch(() => { }); await p.click('.mem-box button:has-text("Close")').catch(() => { }); await report('c++ memory view');
  await p.click('.lang-btn:has-text("Scheme")'); await p.waitForSelector('.lab-editor textarea');
  await setCode('(define (<img/src=x/onerror=window.__xss=1> x) x)\n(display "' + bad + '")\n(<img/src=x/onerror=window.__xss=1> "' + bad + '")\n(car (quote <svg/onload=window.__xss=1>))'); await run('Run'); await report('scheme output + errors');
  await setCode('(define (f x) (* x x))\n(f (quote <img/src=x/onerror=window.__xss=1>))\n(f "' + bad + '")'); await run('Substitution'); for (let i = 0; i < 6; i++) await p.keyboard.press('Enter').catch(() => { }); await report('scheme substitution stepper');
  await p.fill('.repl-inp', '"' + bad + '"'); await p.press('.repl-inp', 'Enter'); await p.fill('.repl-inp', '(<img/src=x/onerror=window.__xss=1>)'); await p.press('.repl-inp', 'Enter'); await report('scheme REPL');
  // file tabs named with payload, find bar, autocomplete, share
  await p.evaluate((n) => { const S = JSON.parse(localStorage.getItem('shortcourses.lab.v1')); S.files.scheme.push({ name: n, code: n }); localStorage.setItem('shortcourses.lab.v1', JSON.stringify(S)); }, payload);
  await p.reload(); await p.waitForTimeout(500); await report('lab state with payload file names');

  // 3. tampered localStorage: progress, theme, teach, portfolio
  await p.evaluate((n) => {
    localStorage.setItem('shortcourses.progress.v1', JSON.stringify({ done: { 'py-1-1': 1 }, code: { 'py-1-1': n, 'ma-1-1': n }, pass: { 'py-1-1': n } }));
    localStorage.setItem('shortcourses.theme', n);
    localStorage.setItem('shortcourses.teach.v1', JSON.stringify({ teacher: true, name: n, studentName: n, assignments: { a1: { id: 'a1', title: n, lang: 'python', text: n, starter: n, tests: [{ k: 'stdin', in: n, expect: n, hidden: true }], hints: [n], roster: [n], author: n, due: n, created: 1 } }, book: { a1: { [n]: { name: n, at: 1, code: n, reviewed: 1, title: n, claimed: { passed: 1, total: 2 }, result: { passed: 1, total: 2, hiddenPassed: 0, hiddenTotal: 1, results: [{ name: n, ok: false, expected: n, got: n }], error: n } } } }, received: { r1: { id: 'r1', title: n, lang: 'python', text: n, starter: n, tests: [{ k: 'stdin', in: n, expect: n }], hints: [n], roster: [n], author: n, due: n, created: 1 } } }));
  }, payload);
  for (const r of ['#/', '#/python/1', '#/math/1', '#/portfolio', '#/lab']) { await p.goto(URL0 + r); await p.reload(); await p.waitForTimeout(500); }
  await p.click('button:has-text("Assignments")').catch(() => { }); await p.click('button:has-text("Grade book")').catch(() => { }); await p.click('button:has-text("Open")').catch(() => { }); await p.click('button:has-text("Export CSV")').catch(() => { });
  await report('tampered localStorage (progress, theme, teach)');
  await p.goto(URL0 + '#/portfolio'); await p.reload(); await p.waitForTimeout(500);
  await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /link|Make/i.test(x.textContent)); if (b) b.click(); }); await p.waitForTimeout(500); await report('portfolio own page with payload data');

  // 4. standalone portfolio download: does the downloaded HTML execute anything?
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 4000 }).catch(() => null), p.click('button:has-text("Download as a web page")').catch(() => { })]);
  if (dl) { const path = await dl.path(); const html = require('fs').readFileSync(path, 'utf8'); require('fs').writeFileSync(require('os').tmpdir() + '/portfolio-dl.html', html); console.log('downloaded standalone portfolio:', html.length, 'bytes; <script count:', (html.match(/<script/gi) || []).length); }
  console.log('final xss =', await xss(), 'dialogs =', dialogs.length, 'pageerrors:', errs.length);
  await b.close();
})();
