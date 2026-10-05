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

  // ---- 1b. the DOM's own append() and friends skip null, undefined and false (src/domsafe.js): a stray "null" must never reach a page
  check('the DOM append skips null, undefined and false, flattens arrays, and keeps 0 and text', await page.evaluate(() => {
    const d = document.createElement('div'), b = document.createElement('b'); b.textContent = 'B';
    d.append('a', null, undefined, false, 0, [b, null, ['c', false]]);
    const p = document.createElement('p'); p.textContent = 'p'; d.append(p); p.after(null, 'z'); p.before(undefined, 'y'); d.prepend(null, '<');
    const f = document.createDocumentFragment(); f.append(null, 'f', [false]); d.append(f);
    const r = document.createElement('div'); r.append('x'); r.replaceChildren(null, 'r');
    const e = document.createElement('div'); e.append('x'); e.replaceChildren();
    return d.textContent === '<a0Bcypzf' && r.textContent === 'r' && e.textContent === '';
  }));
  await goto('#/algorithms/life');
  check('algorithms: a demonstration with no "about" or "taught in" text shows no stray null', !/\bnull\b/.test(await page.locator('main.algo-one').innerText()));
  await goto('#/ml/2');
  check('a figure without its optional score line shows no stray null', !/\bnull\b/.test(await page.locator('.fig-mount').first().innerText()));

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
  r = await java('public class Main {\n static int sum(int[] a, int i) { if (i == a.length) return 0; return a[i] + sum(a, i + 1); }\n public static void main(String[] x) { System.out.println(sum(new int[200], 0)); } }'); check('java recursion 200 deep works in the browser worker (the lessons stay under it)', r.out === '0\n', r);

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
  // the output panel is a terminal: its first line is the command that "ran" (python main.py …), so the program's own output starts on line 2
  // (the terminal panel is drawn like the output panel too, so these look only at output panels)
  const outText = async () => (await page.locator('.out-text:not(.term-scroll)').allInnerTexts()).map((t) => t.replace(/^[^\n]*\n?/, '')).join('|');
  const outStatus = async () => page.locator('.out:not(.lab-term) .term-status').last().textContent();
  await setCode('name = input("Name? ")\nprint("Hi", name)'); await page.click('.lab-toolbar button:has-text("Run")');
  await page.waitForSelector('.inline-input'); await page.fill('.inline-input', 'Ada'); await page.press('.inline-input', 'Enter'); await page.waitForTimeout(800);
  check('Lab: input() asks in the output panel', /Hi Ada/.test(await outText()), await outText());
  await setCode('import turtle\nt = turtle.Turtle()\nt.forward(50)\nturtle.done()\nprint("drawn")'); await page.click('.lab-toolbar button:has-text("Run")'); await page.waitForFunction(() => /^(exit|error|stopped)/.test(document.querySelector('.lab-out .term-status').textContent), null, { timeout: 15000 }).catch(() => { });
  check('Lab: turtle draws in a sandboxed frame and the run finishes', (await page.locator('#lab-turtle iframe').getAttribute('sandbox')) === 'allow-scripts' && (await page.frameLocator('#lab-turtle iframe').locator('canvas').count()) > 0 && /drawn/.test(await outText()) && /^exit 0/.test(await outStatus()), await outText());
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
  await page.click('.lab-toolbar button:has-text("Run")'); await page.waitForFunction(() => /^(exit|error|stopped)/.test(document.querySelector('.lab-out .term-status').textContent), null, { timeout: 15000 }).catch(() => { });
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

  // ---- the terminal (src/terminal.js in front of src/shell.js): commands, the ~/lab mirror, programs through the sandboxes, persistence
  await page.click('.lang-btn:has-text("Python")'); await page.waitForSelector('.lab-editor textarea');
  await setCode('print("from the lab")');
  await page.click('.lab-toolbar button:has-text("Terminal")'); await page.waitForSelector('.lab-term:not([hidden])');
  const term = async (cmd) => { await page.fill('.term-inp', cmd); await page.press('.term-inp', 'Enter'); await page.waitForFunction(() => /^exit/.test(document.querySelector('.lab-term .term-status').textContent), null, { timeout: 30000 }); return page.locator('.lab-term .term-scroll').innerText(); };
  const termStatus = () => page.locator('.lab-term .term-status').innerText();
  let tt = await term('mkdir notes; echo "hello there" > notes/a.txt; cat notes/a.txt | tr a-z A-Z; ls nope');
  check('terminal: commands, pipes and error text', /HELLO THERE\nls: cannot access 'nope': No such file or directory/.test(tt) && (await termStatus()) === 'exit 2', tt.slice(-200));
  tt = await term('cd notes; git init -q; git add a.txt; git commit -q -m first; git log --oneline; cd ~');
  check('terminal: git (shellgit.js) commits in the practice file system', /[0-9a-f]{7} \(HEAD -> main\) first\n/.test(tt) && (await termStatus()) === 'exit 0', tt.slice(-200));
  tt = await term('python lab/main.py');
  check('terminal: runs the Lab file through the Python sandbox', /python lab\/main\.py\nfrom the lab\n/.test(tt), tt.slice(-200));
  await page.fill('.term-inp', 'printf \'x = input("N? ")\\nprint("got", x)\\n\' > ask.py; python ask.py'); await page.press('.term-inp', 'Enter');
  await page.waitForFunction(() => document.querySelector('.lab-term .term-ps1').textContent === 'N? ', null, { timeout: 15000 });
  await page.fill('.term-inp', 'seven'); await page.press('.term-inp', 'Enter');
  await page.waitForFunction(() => /^exit/.test(document.querySelector('.lab-term .term-status').textContent), null, { timeout: 15000 });
  check('terminal: input() is answered on the command line', /N\? seven\ngot seven/.test(await page.locator('.lab-term .term-scroll').innerText()));
  tt = await term('printf \'public class Main { public static void main(String[] a) { System.out.println("from java"); } }\\n\' > Main.java; javac Main.java && java Main; printf \'class B { void f() { int x = "s"; } }\\n\' > B.java; javac B.java');
  check('terminal: javac and java through the Java sandbox, errors name the file', /from java\nB\.java:1: error: incompatible types/.test(tt), tt.slice(-300));
  tt = await term('printf \'#include <iostream>\\nusing namespace std;\\nint main() { cout << "from c++" << endl; }\\n\' > m.cpp; g++ m.cpp -o m && ./m; printf \'int main() { oops }\\n\' > bad.cpp; g++ bad.cpp -o bad; ls bad');
  check('terminal: g++ and ./program through the C++ sandbox; a bad program makes no file', /from c\+\+\n/.test(tt) && /Syntax error/.test(tt) && /ls: cannot access 'bad'/.test(tt), tt.slice(-400));
  tt = await term('echo "print(42)" > lab/fromterm.py; echo "int main() {}" > lab/m2.cpp; ls lab');
  const labFiles = async () => JSON.parse(await page.evaluate(() => localStorage.getItem('shortcourses.lab.v1'))).files;
  check('terminal: a new file in ~/lab becomes a Lab file', (await page.locator('.lab-tabs').innerText()).includes('fromterm.py') && (await labFiles()).cpp.some((f) => f.name === 'm2.cpp' && f.code === 'int main() {}\n'), tt.slice(-300));
  tt = await term('rm lab/m2.cpp; ls lab');
  check('terminal: rm in ~/lab removes the Lab file, and says so', /removed from the Code Lab too: m2\.cpp/.test(tt) && (await labFiles()).cpp.every((f) => f.name !== 'm2.cpp'), tt.slice(-300));
  // Tab completion: one fit is filled in; several show a list that the arrow keys and Enter choose from; cd offers directories only
  await page.fill('.term-inp', 'cat no'); await page.keyboard.press('Tab');
  check('terminal: Tab completes a file name', (await page.locator('.term-inp').inputValue()) === 'cat notes/' && (await page.locator('.term-ac').isHidden()), await page.locator('.term-inp').inputValue());
  await page.fill('.term-inp', 'cd '); await page.keyboard.press('Tab');
  const acText = await page.locator('.term-ac').innerText();
  check('terminal: Tab lists several fits, directories only after cd', !(await page.locator('.term-ac').isHidden()) && /lab\/\s+notes\//.test(acText) && !/ask\.py/.test(acText), acText);
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter');
  check('terminal: a listed fit can be chosen with the keyboard', (await page.locator('.term-inp').inputValue()) === 'cd notes/' && (await page.locator('.term-ac').isHidden()), await page.locator('.term-inp').inputValue());
  await page.fill('.term-inp', 'ec'); await page.keyboard.press('Tab');
  check('terminal: Tab completes a command', (await page.locator('.term-inp').inputValue()) === 'echo ');
  await page.fill('.term-inp', '');
  tt = await term('while true; do :; done');
  check('terminal: a loop that never ends is stopped', /stopped: more than 20000 commands/.test(tt) && (await termStatus()) === 'exit 1', tt.slice(-200));
  await page.fill('.term-inp', 'nano notes/b.txt'); await page.press('.term-inp', 'Enter'); await page.waitForSelector('.nano-ta');
  await page.fill('.nano-ta', 'from nano\n'); await page.keyboard.press('Control+s');
  check('terminal: nano says what it wrote', /\[ Wrote 1 line \]/.test(await page.locator('.nano-msg').innerText()), await page.locator('.nano-msg').innerText());
  await page.keyboard.press('Control+x');
  await page.waitForFunction(() => !document.querySelector('.nano-ta') && /^exit/.test(document.querySelector('.lab-term .term-status').textContent), null, { timeout: 5000 });
  // leaving with unsaved changes: Y saves, N does not, Ctrl+C stays; the buttons do the same without stealing the focus
  await page.fill('.term-inp', 'nano notes/c.txt'); await page.press('.term-inp', 'Enter'); await page.waitForSelector('.nano-ta');
  await page.type('.nano-ta', 'kept'); await page.keyboard.press('Control+x'); await page.waitForSelector('.nano-msg.nano-ask');
  await page.keyboard.press('Control+c'); check('terminal: nano Ctrl+C cancels the question', (await page.locator('.nano-msg.nano-ask').count()) === 0 && (await page.locator('.nano-ta').inputValue()) === 'kept');
  await page.keyboard.press('Control+x'); await page.waitForSelector('.nano-msg.nano-ask'); await page.keyboard.press('y');
  await page.waitForFunction(() => !document.querySelector('.nano-ta') && /^exit/.test(document.querySelector('.lab-term .term-status').textContent), null, { timeout: 5000 });
  await page.fill('.term-inp', 'nano notes/d.txt'); await page.press('.term-inp', 'Enter'); await page.waitForSelector('.nano-ta');
  await page.type('.nano-ta', 'lost'); await page.keyboard.press('Control+x'); await page.waitForSelector('.nano-msg.nano-ask'); await page.keyboard.press('n');
  await page.waitForFunction(() => !document.querySelector('.nano-ta') && /^exit/.test(document.querySelector('.lab-term .term-status').textContent), null, { timeout: 5000 });
  await page.fill('.term-inp', 'nano notes/e.txt'); await page.press('.term-inp', 'Enter'); await page.waitForSelector('.nano-ta');
  await page.type('.nano-ta', 'by button'); await page.click('.nano-key:has-text("Save")'); await page.keyboard.press('Control+x');
  await page.waitForFunction(() => !document.querySelector('.nano-ta') && /^exit/.test(document.querySelector('.lab-term .term-status').textContent), null, { timeout: 5000 });
  tt = await term('cat notes/c.txt; ls notes; cat notes/e.txt');
  check('terminal: nano Y saves, N does not, and the Save button keeps the keyboard in nano', /kept\na\.txt  b\.txt  c\.txt  e\.txt\nby button\n$/.test(tt), tt.slice(-200));
  tt = await term('cat notes/b.txt; edit notes/b.txt; edit ask.py');
  check('terminal: nano writes the file; edit opens a copy in the Lab', /from nano\n/.test(tt) && /use nano b\.txt/.test(tt) && /opened a copy of ask\.py/.test(tt) && (await page.locator('.lab-tabs .tab.on, .lab-tabs .on').innerText()).includes('ask.py'), tt.slice(-300));
  await page.reload(); await page.waitForSelector('.lab-term:not([hidden])');
  tt = await term('cat notes/a.txt; ls -F m');
  check('terminal: files, the exec bit and the open panel survive a reload', /hello there\nm\*\n/.test(tt), tt.slice(-100));
  await page.evaluate(() => localStorage.setItem('shortcourses.shell.v1', JSON.stringify({ v: 1, fs: { v: 1, cwd: '/etc', root: { t: 'd', c: [['bin', { t: 'd', c: [['ls', { t: 'f', d: 'evil', x: true }]] }], ['etc', { t: 'd', c: [['passwd', { t: 'f', d: 'hacked' }]] }], ['home', { t: 'd', c: [['student', { t: 'd', c: [['__proto__', { t: 'f', d: 'ok' }], ['a/b', { t: 'f', d: 'bad' }]] }]] }]] } }, history: ['x'] })));
  await page.reload(); await page.waitForSelector('.lab-term:not([hidden])');
  tt = await term('cat /etc/passwd | head -1; ls ~; cat ~/__proto__; /bin/ls ~ | wc -l');
  check('terminal: a hostile saved copy cannot replace the system or plant bad names', /root:x:0:0:root[^\n]*\nlab  __proto__\nok2\n$/.test(tt), tt.slice(-200));
  await page.click('.lab-term .term-close'); check('terminal: closes', await page.locator('.lab-term').getAttribute('hidden') !== null);

  // ---- the shell course: a lesson example is a live terminal, an exercise is graded on the files afterwards
  await goto('#/shell/1');
  await page.locator('.shell-play .toolbar button:has-text("Run")').first().click();
  await page.waitForFunction(() => /\/home\/student\n/.test(document.querySelector('.shell-play .term-scroll').textContent), null, { timeout: 15000 }).catch(() => { });
  check('shell lesson: Run types the example into its terminal', /pwd\n\/home\/student\n.*ls\ngarden +letters +README\.txt/s.test(await page.locator('.shell-play .term-scroll').first().innerText()));
  check('shell lesson: the tree figure names paths', (await page.locator('.fstree button').count()) > 5);
  await page.locator('.shell-play .term-inp').first().fill('cat gar'); await page.locator('.shell-play .term-inp').first().press('Tab');
  check('shell lesson: Tab completes in a lesson terminal', (await page.locator('.shell-play .term-inp').first().inputValue()) === 'cat garden/');
  await goto('#/shell/2');
  const exTerm = page.locator('#sh-2-1 .term-inp');
  for (const cmd of ['mkdir project', 'mkdir project/src project/docs', 'echo "My first project" > project/README.md', 'touch project/src/main.py']) { await exTerm.fill(cmd); await exTerm.press('Enter'); await page.waitForFunction(() => /^exit/.test(document.querySelector('#sh-2-1 .term-status').textContent), null, { timeout: 10000 }); }
  await page.click('#sh-2-1 .toolbar button:has-text("Check")'); await page.waitForSelector('#sh-2-1 .verdict.pass, #sh-2-1 .verdict.fail', { timeout: 10000 });
  check('shell lesson: an exercise is graded on the files and marked done', (await page.locator('#sh-2-1 .verdict').getAttribute('class')) === 'verdict pass' && (await page.locator('#sh-2-1.done').count()) === 1 && (await page.evaluate(() => JSON.parse(localStorage.getItem('shortcourses.progress.v1')).done['sh-2-1'] > 0)), await page.locator('#sh-2-1 .verdict').innerText());
  await page.click('#sh-2-2 .toolbar button:has-text("Check")'); await page.waitForSelector('#sh-2-2 .verdict.fail', { timeout: 10000 });
  check('shell lesson: an untouched exercise fails with the files named', /desk\/photos\/cat\.jpg exists/.test(await page.locator('#sh-2-2 .verdict').innerText()));
  // ---- Scratch lesson 8: a turtle example with fill and colour draws in its sandboxed frame and finishes
  await goto('#/scratch/9'); await page.waitForSelector('.play');
  await page.locator('.play').nth(2).scrollIntoViewIfNeeded(); await page.locator('.play').nth(2).locator('.toolbar button:has-text("Run")').click();
  await page.waitForFunction(() => /^(exit|error|stopped)/.test([...document.querySelectorAll('.play .term-status')][2].textContent), null, { timeout: 60000 }).catch(() => { });
  check('scratch lesson 8: the filled star draws and the run finishes', /^exit 0/.test(await page.locator('.play .term-status').nth(2).innerText()) && (await page.locator('.play').nth(2).locator('iframe').count()) === 1, await page.locator('.play .term-status').nth(2).innerText());
  // ---- the tour (src/tour.js): the button is in the top bar, the card and spotlight follow the steps across pages, Esc ends it
  await goto('#/'); await page.waitForSelector('.top-tools .tour-btn');
  await page.click('.tour-btn'); await page.waitForSelector('.tour-card:not(.moving)');
  check('tour: starts on the home page with a spotlight on the hero', /1 of \d+/i.test(await page.locator('.tour-count').innerText()) && (await page.locator('.tour-spot:not(.hidden)').count()) === 1 && (await page.locator('.tour-btn.pulse').count()) === 0);
  for (let i = 0; i < 4; i++) { await page.click('.tour-card .btn.primary'); await page.waitForSelector('.tour-card:not(.moving)'); }
  check('tour: the lesson steps change the route and wait for their target', (await page.evaluate(() => location.hash)) === '#/python/1' && /Inside a lesson/.test(await page.locator('.tour-card h3').innerText()) && (await page.locator('.tour-spot:not(.hidden)').count()) === 1, await page.locator('.tour-card h3').innerText());
  await page.keyboard.press('Escape');
  check('tour: Esc ends it and leaves the page as it was', (await page.locator('.tour-card, .tour-spot, .tour-block').count()) === 0 && !(await page.evaluate(() => document.body.classList.contains('tour-on'))) && (await page.locator('.lesson-map').count()) === 1);
  // ---- the top bar, the courses page (grouped, with search), Algorithms in motion and the real-world page
  await goto('#/');
  const topLinks = await page.locator('.top-links a').allInnerTexts();
  check('top bar: Courses, Algorithms, Real world, Arena and Code Lab instead of a link per course', topLinks.join('|') === 'Courses|Algorithms|Real world|Arena|Code Lab', topLinks);
  await goto('#/courses');
  const courseCount = await page.evaluate(() => window.COURSES.length);
  const listed = await page.locator('.courses-page .catalog li').evaluateAll((ls) => ls.map((l) => l.getAttribute('data-course')));
  check('courses page: every course is listed exactly once, in groups', listed.length === courseCount && new Set(listed).size === courseCount && (await page.locator('.course-group').count()) >= 3, listed);
  await page.fill('.course-search', 'java');
  const found = await page.locator('.courses-page .catalog li').evaluateAll((ls) => ls.map((l) => l.getAttribute('data-course')));
  check('courses page: the search box filters the list', found.includes('java') && !found.includes('python') && found.length < courseCount, found);
  await goto('#/python');
  check('top bar: Courses is marked on a course page', (await page.locator('.top-links a.current').allInnerTexts()).join() === 'Courses');
  const demoIds = await page.evaluate(() => (window.ALGOS ? window.ALGOS.demos.map((d) => d.id) : []));
  await goto('#/algorithms');
  check('algorithms: the index lists every demonstration', demoIds.length >= 8 && (await page.locator('.algo-card').count()) === demoIds.length, demoIds);
  const demoProblems = [];
  for (const [w, h] of [[1280, 900], [390, 844]]) {
    await page.setViewportSize({ width: w, height: h });
    for (const id of demoIds) {
      await goto('#/algorithms/' + id);
      await page.waitForFunction(() => document.querySelector('.algo-host') && document.querySelector('.algo-host').children.length > 0, null, { timeout: 5000 }).catch(() => { });
      const play = page.locator('.algo-host .algo-controls .btn.primary:visible').first();
      if (await play.count()) { await play.click(); await page.waitForTimeout(400); }
      const info = await page.evaluate(() => ({ kids: document.querySelector('.algo-host').children.length, error: !!document.querySelector('.algo-error'), wide: document.documentElement.scrollWidth > window.innerWidth + 1 }));
      if (!info.kids || info.error || info.wide) demoProblems.push(id + ' at ' + w + 'px: ' + JSON.stringify(info));
    }
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  check('algorithms: every demonstration starts and plays, on a wide screen and at phone width without sideways scrolling', demoProblems.length === 0, demoProblems);
  // the races wait for a bet; Hanoi can be solved from the keyboard in the fewest moves; the tour's computer leaves no crossing
  await goto('#/algorithms/maze-race');
  await page.locator('select[aria-label="Your bet"]').selectOption('0');
  await page.locator('.algo-host .algo-controls .btn.primary').first().click(); await page.locator('.algo-host button:has-text("Finish")').click();
  const mazeRace = await page.locator('.algo-status').first().textContent();
  await goto('#/algorithms/hanoi');
  await page.locator('.algo-host select').selectOption('3'); await page.locator('.algo-host canvas').focus();
  for (const [a, b] of [[1, 3], [1, 2], [3, 2], [1, 3], [2, 1], [2, 3], [1, 3]]) { await page.keyboard.press(String(a)); await page.keyboard.press(String(b)); }
  const hanoiMsg = await page.locator('.pz-big').textContent();
  await goto('#/algorithms/tour');
  await page.locator('.algo-host .algo-speed').fill('100'); await page.locator('.algo-host .algo-controls .btn.primary').first().click();
  await page.waitForFunction(() => /Play again/.test((document.querySelector('.algo-host .algo-controls .btn.primary') || {}).textContent || ''), null, { timeout: 20000 }).catch(() => { });
  const tourStats = await page.locator('.pz-stats').textContent();
  check('algorithms: a maze race reports the bet, Hanoi in 7 moves is perfect, the computer\'s tour has no crossings', /Your bet (won|came)/.test(mazeRace) && /Perfect! 7 moves/.test(hanoiMsg) && /Computer: [\d.]+ km · 0 crossings/.test(tourStats), { mazeRace, hanoiMsg, tourStats });
  await goto('#/real-world');
  const realLinks = await page.evaluate(() => [...document.querySelectorAll('main a[href^="#/"]')].map((a) => a.getAttribute('href')).filter((h) => /^#\/[a-z]+\/\d+/.test(h)));
  const badLinks = await page.evaluate((hs) => hs.filter((h) => { const [, c, n] = h.match(/^#\/([a-z]+)\/(\d+)/); const course = window.COURSES.find((x) => x.id === c); return !course || !course.lessons[+n - 1]; }), realLinks);
  check('real world: the page lists topics, and every lesson it links to exists', realLinks.length >= 20 && badLinks.length === 0, badLinks.slice(0, 5));
  // ---- standards: the page lists them with their lessons, filters work, and a lesson shows its own standards
  await goto('#/standards');
  const stdInfo = await page.evaluate(() => {
    const items = [...document.querySelectorAll('.std-item')].filter((li) => !li.hidden);
    const links = [...document.querySelectorAll('.std-lessons a')].map((a) => a.getAttribute('href')).filter((h) => /^#\/[a-z]+\/\d+$/.test(h));
    const badLinks = links.filter((h) => { const [, c, n] = h.match(/^#\/([a-z]+)\/(\d+)/); const course = window.COURSES.find((x) => x.id === c); return !course || !course.lessons[n - 1]; });
    return { shown: items.length, links: links.length, badLinks, first: items[0] && items[0].id };
  });
  check('standards: the CSTA list is shown with lesson links that all resolve', stdInfo.shown === 74 && stdInfo.links > 150 && stdInfo.badLinks.length === 0, stdInfo);
  await page.fill('#std-q', 'recursive');
  const stdSearch = await page.evaluate(() => [...document.querySelectorAll('.std-item')].filter((li) => !li.hidden).map((li) => li.id));
  check('standards: searching for "recursive" finds 3B-AP-13 and nothing unrelated', stdSearch.includes('std-3B-AP-13') && stdSearch.length < 10, stdSearch);
  await page.fill('#std-q', '');
  await page.click('.std-chips:nth-of-type(3) .std-chip:nth-child(4)');
  const stdNone = await page.evaluate(() => [...document.querySelectorAll('.std-item')].filter((li) => !li.hidden).every((li) => li.dataset.covered === 'no') && document.querySelectorAll('.std-item:not([hidden])').length > 10);
  check('standards: "No lesson yet" lists only standards without a lesson', stdNone);
  await goto('#/standards/9.2.4.5');
  const mnInfo = await page.evaluate(() => { const li = document.getElementById('std-9.2.4.5'); return { there: !!li && !li.hidden, lessons: li ? li.querySelectorAll('.std-lessons a').length : 0, shown: [...document.querySelectorAll('.std-item')].filter((x) => !x.hidden).length }; });
  check('standards: a Minnesota code in the address opens the Minnesota list at that benchmark', mnInfo.there && mnInfo.lessons >= 1 && mnInfo.shown === 32, mnInfo);
  await goto('#/python/8');
  const lessonStd = await page.evaluate(() => { const d = document.querySelector('.lesson-stds'); return d && { summary: d.querySelector('summary').textContent, link: !!d.querySelector('a[href="#/standards/3A-AP-17"]') }; });
  check('standards: a lesson shows its standards under the summary, linking to the standards page', lessonStd && /^Standards: \d+ CSTA/.test(lessonStd.summary) && lessonStd.link, lessonStd);
  await goto('#/math/11');
  check('standards: a lesson with no standard shows no box', (await page.locator('.lesson-stds').count()) === 0);
  // ---- pictures in lessons: they load (lazily), carry a credit, open larger and close with Esc; a missing file shows its description
  await goto('#/computer/1');
  const photo = page.locator('.blk-photo').first();
  await photo.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => { const i = document.querySelector('.blk-photo img'); return i && i.complete && i.naturalWidth > 0; }, null, { timeout: 10000 }).catch(() => { });
  const pinfo = await page.evaluate(() => { const i = document.querySelector('.blk-photo img'); return i && { w: i.naturalWidth, alt: i.alt, lazy: i.loading, credit: !!document.querySelector('.blk-photo .photo-credit a[href*="commons.wikimedia.org"]') }; });
  check('pictures: a lesson picture loads, with alt text and a credit linking to its source', pinfo && pinfo.w > 0 && pinfo.alt.length > 20 && pinfo.lazy === 'lazy' && pinfo.credit, pinfo);
  await page.click('.blk-photo .photo-open');
  const zoomed = (await page.locator('.photo-zoom img').count()) === 1;
  await page.keyboard.press('Escape');
  check('pictures: tapping a picture opens it larger, and Esc closes it', zoomed && (await page.locator('.photo-zoom').count()) === 0);
  await page.evaluate(() => { const i = document.querySelector('.blk-photo img'); i.src = 'img/missing.jpg'; });
  await page.waitForSelector('.blk-photo .photo-missing', { timeout: 5000 }).catch(() => { });
  check('pictures: a picture that cannot load is replaced by its title and description', (await page.locator('.blk-photo .photo-missing').count()) === 1);
  // ---- SC 099: no code; the figures render and the non-code exercises grade
  await goto('#/computer/2'); await page.waitForSelector('.cpu-fig');
  for (let i = 0; i < 4; i++) await page.locator('.fig-tools button:has-text("Step")').first().click();
  check('computer course: the CPU figure steps through fetch, decode, execute', /fetch|decode|execute/i.test(await page.locator('.cpu-phase').innerText()) && /Fetch|Decode|Execute/.test(await page.locator('.cpu-fig p.fig-note').innerText()));
  await page.locator('.bit').nth(4).click();
  check('computer course: the byte figure adds up its switches', /= 64 \+ 8 \+ 1 = 73/.test(await page.locator('.bits-out').innerText()), await page.locator('.bits-out').innerText());
  for (const [i, v] of ['7', '129', '00000101', '32', '3000000000'].entries()) await page.locator('#cs-2-1 input.ans').nth(i).fill(v);
  await page.click('#cs-2-1 .toolbar button:has-text("Check")'); await page.waitForSelector('#cs-2-1 .verdict.pass, #cs-2-1 .verdict.fail');
  check('computer course: an answer exercise grades', (await page.locator('#cs-2-1 .verdict').getAttribute('class')) === 'verdict pass', await page.locator('#cs-2-1 .verdict').innerText());
  // ---- SC 099 lessons 6-11: the figures
  await goto('#/computer/6'); await page.waitForSelector('.codes-tbl');
  await page.fill('.fig-mount input[type=text]', 'caf\u00e9');
  check('computer course: the text figure counts bytes (cafe with an accent is 5 bytes)', /4 characters take 5 bytes/.test(await page.locator('.codes-tbl + .fig-note').innerText()), await page.locator('.codes-tbl + .fig-note').innerText());
  await page.locator('.px-cell').first().click();
  check('computer course: the pixel figure turns a clicked square into a number', /^10111100/.test((await page.locator('.px-row').first().innerText()).trim()) && (await page.locator('.px-row span').first().innerText()).includes('188'), await page.locator('.px-row').first().innerText());
  await page.locator('.sw-fig button, .fig-mount button:has-text("White")').first().click().catch(() => {});
  await page.locator('.fig-mount button:has-text("White")').click();
  check('computer course: the colour figure shows hex for white and a filled swatch', /#FFFFFF/.test(await page.locator('.sw-fig + .bits-out').innerText()) && /rgb\(255, ?255, ?255\)/.test(await page.locator('.sw-chip').evaluate((e) => e.style.background)));
  await page.selectOption('.fig-mount select', '32');
  check('computer course: the sound figure redraws with more measurements', (await page.locator('.fig-mount svg circle').count()) === 32);
  await goto('#/computer/7'); await page.waitForSelector('.gate-fig');
  await page.locator('.fig-mount button[data-g="AND"]').click();
  await page.locator('.gate-in').nth(0).click(); await page.locator('.gate-in').nth(1).click();
  check('computer course: the AND gate gives 1 only with both inputs on', /AND/.test(await page.locator('.gate-fig svg').innerHTML()) && (await page.locator('.gate-tbl tr.hl td').last().innerText()) === '1' && (await page.locator('.gate-tbl tr.hl td').count()) === 3);
  await page.locator('.gate-in').nth(1).click();
  check('computer course: with one input off the AND output is 0', (await page.locator('.gate-tbl tr.hl td').last().innerText()) === '0');
  check('computer course: the adder adds 5 and 3 (= 8)', /= 8/.test(await page.locator('.adder-sum').innerText()), await page.locator('.adder-sum').innerText());
  await page.locator('.adder .bit').nth(3).click();   // A: 0101 -> 0100 (4) + 3 = 7
  check('computer course: flipping an adder bit changes the sum', /= 7/.test(await page.locator('.adder-sum').innerText()), await page.locator('.adder-sum').innerText());
  await goto('#/computer/8'); await page.waitForSelector('.fig-mount svg');
  for (let i = 0; i < 6; i++) await page.locator('.fig-tools button:has-text("Step")').first().click().catch(() => {});
  check('computer course: the packet figure ends with the message put back in order', /HELLO WORLD!/.test(await page.locator('.fig-mount .fig-note').first().innerText()), await page.locator('.fig-mount .fig-note').first().innerText());
  await goto('#/computer/10'); await page.waitForSelector('.pw-out');
  check('computer course: the password figure counts 8 lowercase letters as about 21 seconds', /about 21 seconds/.test(await page.locator('.pw-out').innerText()), await page.locator('.pw-out').innerText());
  await page.locator('.pw-kind input').nth(1).check(); await page.locator('.pw-kind input').nth(2).check();
  check('computer course: letters and digits at length 8 take about 6 hours', /about 6\.\d hours/.test(await page.locator('.pw-out').innerText()), await page.locator('.pw-out').innerText());
  await page.locator('.fig-tools input[type=range]').evaluate((e) => { e.value = '12'; e.dispatchEvent(new Event('input')); });
  check('computer course: four more characters make it thousands of years', /thousand years/.test(await page.locator('.pw-out').innerText()), await page.locator('.pw-out').innerText());
  await goto('#/computer/11'); await page.waitForSelector('.rb-fig');
  for (let i = 0; i < 3; i++) await page.locator('.rb-fig button:has-text("Forward")').click();
  await page.locator('.fig-mount button:has-text("Run")').click();
  await page.waitForFunction(() => /reached the star/.test(document.querySelector('.rb-fig').parentElement.textContent), null, { timeout: 10000 }).catch(() => { });
  check('computer course: the robot reaches the star with three Forward commands', /reached the star with 3 commands/.test(await page.locator('.rb-fig').locator('xpath=..').innerText()), await page.locator('.rb-fig').locator('xpath=..').innerText());
  await goto('#/computer/5');
  check('computer course: a checkpoint lesson has its mixed questions', (await page.locator('.qc').count()) >= 8);
  await goto('#/shell/4');
  const pipeTerm = page.locator('#sh-4-1 .term-inp');
  await pipeTerm.fill('tr -s " " "\\n" < speech.txt | sort | uniq -c | sort -rn | head -n 3 > top.txt'); await pipeTerm.press('Enter'); await page.waitForFunction(() => /^exit/.test(document.querySelector('#sh-4-1 .term-status').textContent), null, { timeout: 10000 });
  await page.click('#sh-4-1 .toolbar button:has-text("Check")'); await page.waitForSelector('#sh-4-1 .verdict.pass, #sh-4-1 .verdict.fail', { timeout: 10000 });
  check('shell lesson: a pipeline with redirection typed into an exercise terminal passes', (await page.locator('#sh-4-1 .verdict').getAttribute('class')) === 'verdict pass', await page.locator('#sh-4-1 .verdict').innerText());

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
  await page.frameLocator('.play-turtle iframe').locator('canvas').first().waitFor({ state: 'attached', timeout: 15000 }).catch(() => { });   // the frame draws its canvas a moment after it appears
  check('a lesson example draws with turtle in a sandboxed frame', (await page.locator('.play-turtle iframe').count()) === 1 && (await page.locator('.play-turtle iframe').getAttribute('sandbox')) === 'allow-scripts' && (await page.frameLocator('.play-turtle iframe').locator('canvas').count()) > 0);
  await goto('#/dsa/1');
  check('DSA figures render', (await page.locator('.fig-mount svg').count()) >= 3);
  await goto('#/scratch/1');
  check('the Under development tag is shown (on a course still being written)', (await page.locator('.dev-tag').count()) >= 1);
  await goto('#/dsa/6');
  check('the linked-list figure renders', (await page.locator('.fig-mount svg').count()) >= 1);
  await goto('#/dsa/7');
  const sq = page.locator('.fig-mount').first(); await sq.locator('button:has-text("Push")').click(); await sq.locator('button:has-text("Push")').click(); await sq.locator('button:has-text("Pop")').click();
  check('the stack figure pops what was pushed last', /pop\(\).*= 2/.test(await sq.locator('.fig-status').textContent()));
  await goto('#/dsa/8');
  const cs = page.locator('.fig-mount').first(); for (let i = 0; i < 4; i++) await cs.locator('button:has-text("Step")').click();
  check('the call-stack figure piles up frames', (await cs.locator('svg rect').count()) >= 4);
  {
  // ---- DSA lesson 8: the hash table figure (Insert, Step to the end of each insertion; the seventh key doubles the table)
  await goto('#/dsa/9');
  const ht = page.locator('.fig-mount').filter({ has: page.locator('.ht-rows') }).first();
  const htDone = async () => { for (let i = 0; i < 40; i++) { const st = ht.locator('.fig-tools button:has-text("Step")'); if (await st.isEnabled()) await st.click(); else break; } };
  const htInsert = async (word) => { await ht.locator('input.ht-input').fill(word); await ht.locator('button:has-text("Insert")').click(); await htDone(); };
  check('dsa: the hash table figure shows 8 empty buckets', (await ht.locator('.ht-row').count()) === 8 && (await ht.locator('.ht-rows .ht-node').count()) === 0);
  for (const w of ['cat', 'dog', 'bee', 'owl']) await htInsert(w);
  check('dsa: owl lands in the bucket where dog already is (a collision, shown in the log and the row)', (await ht.locator('.ht-row.ht-coll .ht-node').allTextContents()).join() === 'owl,dog' && /Load factor 4\/8 = 0\.50/.test(await ht.locator('.ht-log').textContent()));
  await ht.locator('input.ht-input').fill('dog'); await ht.locator('button:has-text("Search")').click(); await htDone();
  check('dsa: searching for dog compares owl, then dog, and says found after 2 comparisons', /Found, after 2 comparisons/.test(await ht.locator('.ht-log').textContent()) && (await ht.locator('.ht-node.ht-found').textContent()) === 'dog');
  for (const w of ['fox', 'ant']) await htInsert(w);
  check('dsa: six keys in 8 buckets: load factor 0.75 does not double the table', (await ht.locator('.ht-row').count()) === 8 && /0\.75, not over 0\.75/.test(await ht.locator('.ht-log').textContent()));
  await ht.locator('input.ht-input').fill('eel'); await ht.locator('button:has-text("Insert")').click();
  for (let i = 0; i < 3; i++) await ht.locator('.fig-tools button:has-text("Step")').click();
  check('dsa: the seventh key pushes the load factor over 0.75 and the figure announces the doubling', /over 0\.75: chains are getting long\. Double the table to 16/.test(await ht.locator('.ht-log').textContent()) && (await ht.locator('.ht-row').count()) === 8);
  await htDone();
  check('dsa: after the doubling there are 16 buckets, all 7 keys, and some are marked as moved', (await ht.locator('.ht-row').count()) === 16 && (await ht.locator('.ht-rows .ht-node').count()) === 7 && (await ht.locator('.ht-rows .ht-moved').count()) >= 1 && /placed again/.test(await ht.locator('.ht-log').textContent()));
  await ht.locator('select').selectOption('len'); await htInsert('cat'); await htInsert('dog'); await htInsert('bee');
  check('dsa: with the bad hash (length of the word) three 3-letter words share one bucket', (await ht.locator('.ht-row.ht-coll .ht-node').count()) === 3 && (await ht.locator('.ht-row').count()) === 8);
  }
  {
  await goto('#/dsa/11');
  const bst = page.locator('.fig-mount').first();
  check('dsa: the search-tree figure renders six nodes and their height', (await bst.locator('.bst-node').count()) === 6 && /6 keys, height 3/.test(await bst.locator('.bst-stats').textContent()));
  await bst.locator('input[type=number]').fill('7'); await bst.locator('button:has-text("Insert")').click();
  check('dsa: the search-tree figure starts an insertion at the root, comparing', /7 against 8: less, so go left/.test(await bst.locator('.fig-status').first().textContent()) && (await bst.locator('.bst-cur').count()) === 1);
  await bst.locator('button:has-text("Finish")').click();
  check('dsa: the search-tree figure adds 7 as a leaf under 6 and the height grows to 4', (await bst.locator('.bst-node').count()) === 7 && (await bst.locator('.bst-new').count()) === 1 && /7 keys, height 4/.test(await bst.locator('.bst-stats').textContent()));
  await bst.locator('input[type=number]').fill('5'); await bst.locator('button:has-text("Search")').click(); await bst.locator('button:has-text("Finish")').click();
  check('dsa: the search-tree figure shows the empty link where an absent key would go', (await bst.locator('.bst-slot').count()) === 1 && /5 is not in the tree/.test(await bst.locator('.fig-status').first().textContent()));
  await bst.locator('button:has-text("Walk in order")').click(); await bst.locator('button:has-text("Finish")').click();
  check('dsa: the search-tree figure walks the keys in increasing order', /out: 1 3 6 7 8 10 14/.test(await bst.locator('svg').textContent()) && (await bst.locator('.bst-done').count()) === 7);
  await bst.locator('button:has-text("Sorted 1–9")').click();
  check('dsa: sorted keys make a chain: height 9 for 9 keys', /9 keys, height 9/.test(await bst.locator('.bst-stats').textContent()));
  await bst.locator('button:has-text("Balanced")').click();
  check('dsa: the balanced example has height 3 for 7 keys', /7 keys, height 3/.test(await bst.locator('.bst-stats').textContent()));
  await bst.locator('input[type=number]').fill('40'); await bst.locator('button:has-text("Insert")').click(); await bst.locator('button:has-text("Finish")').click();
  check('dsa: inserting a key that is already there changes nothing', (await bst.locator('.bst-node').count()) === 7 && /already in the tree|Nothing to do/.test(await bst.locator('.fig-status').first().textContent()));
  await bst.locator('button:has-text("Random")').click();
  check('dsa: the random tree has nine keys', (await bst.locator('.bst-node').count()) === 9);
  await bst.locator('button:has-text("Clear")').click(); await bst.locator('input[type=number]').fill('12'); await bst.locator('input[type=number]').press('Enter');
  check('dsa: Enter inserts into the empty tree and the key becomes the root', (await bst.locator('.bst-node').count()) === 1 && /becomes the root/.test(await bst.locator('.fig-status').first().textContent()));
  }
  {
  await goto('#/dsa/12');
  const hp = page.locator('.fig-mount').first();
  const hpArr = async () => (await hp.locator('.hp-cell .hp-val').allTextContents()).join(' ');
  check('dsa: the heap figure draws the tree and the array side by side', (await hp.locator('.hp-node').count()) === 7 && (await hp.locator('.hp-cell:not(.is-empty)').count()) === 7 && (await hpArr()) === '2 5 3 9 6 4 8');
  await hp.locator('input[type=number]').fill('1'); await hp.locator('button:has-text("Insert")').click();
  check('dsa: an insert starts by putting the value in the next free cell', (await hpArr()) === '2 5 3 9 6 4 8 1' && (await hp.locator('.hp-cell.is-mover').count()) === 1);
  await hp.locator('button:has-text("Step")').click();
  check('dsa: the next step highlights the item and its parent in the tree and in the array', (await hp.locator('.hp-node.is-hot').count()) === 2 && (await hp.locator('.hp-cell.is-hot').count()) === 2);
  await hp.locator('button:has-text("Finish")').click();
  check('dsa: inserting 1 climbs to the root in 3 swaps', (await hpArr()) === '1 2 3 5 6 4 8 9' && /3 swaps/.test(await hp.locator('.hp-note').textContent()) && /swaps: 3/.test(await hp.locator('.hp-swaps').textContent()));
  await hp.locator('button:has-text("Remove min")').click(); await hp.locator('button:has-text("Step")').click(); await hp.locator('button:has-text("Step")').click();
  check('dsa: remove min moves the last item to the root and shows what was removed', (await hpArr()) === '9 2 3 5 6 4 8' && /removed: 1/.test(await hp.locator('svg').textContent()));
  await hp.locator('button:has-text("Finish")').click();
  check('dsa: it sinks past the smaller child, 2 swaps, and the heap is the start heap again', (await hpArr()) === '2 5 3 9 6 4 8' && /2 swaps/.test(await hp.locator('.hp-note').textContent()));
  await hp.locator('select').selectOption({ label: 'Full: 15 items' }); await hp.locator('button:has-text("Insert")').click();
  check('dsa: a full figure refuses an insert and says so', /holds 15 items/.test(await hp.locator('.hp-note').textContent()) && (await hp.locator('.hp-node').count()) === 15);
  await hp.locator('select').selectOption({ label: 'Empty' }); await hp.locator('button:has-text("Remove min")').click();
  check('dsa: removing from an empty heap says it is empty', /empty/.test(await hp.locator('.hp-note').textContent()));
  await hp.locator('input[type=number]').fill('5'); await hp.locator('input[type=number]').press('Enter');
  check('dsa: Enter in the value box inserts, and the figure describes itself to a screen reader', (await hpArr()) === '5' && /min-heap of 1 item/.test(await hp.locator('svg').getAttribute('aria-label')) && (await hp.locator('.hp-note').getAttribute('aria-live')) === 'polite');
  await hp.locator('select').selectOption({ label: 'Random: 10 items' });
  const rnd = (await hp.locator('.hp-cell .hp-val').allTextContents()).map(Number);
  check('dsa: the random starting heap obeys the heap rule', rnd.length === 10 && rnd.every((v, i) => i === 0 || rnd[(i - 1) >> 1] <= v), rnd);
  }
  {
  // ---- DSA lesson 11 (graphs): the three runs of the graph figure end where the lesson says they do
  await goto('#/dsa/13');
  const gfigs = page.locator('.fig-mount').filter({ has: page.locator('svg.gr-svg') });
  check('dsa: lesson 11 has three graph figures (BFS, DFS, Dijkstra)', (await gfigs.count()) === 3);
  const runGraph = async (fig) => { for (let i = 0; i < 80; i++) { const step = fig.locator('button:has-text("Step")'); if (await step.isDisabled()) break; await step.click(); } };
  const bfsG = gfigs.nth(0), dfsG = gfigs.nth(1), dijG = gfigs.nth(2);
  check('dsa: the graph figure draws eight vertices', (await bfsG.locator('svg.gr-svg circle').count()) === 8);
  await bfsG.locator('button:has-text("Step")').click();
  check('dsa: BFS starts by putting A in the queue, then takes it out', /A gets distance 0/.test(await bfsG.locator('.gr-msg').textContent()) === false && /Take A from the front/.test(await bfsG.locator('.gr-msg').textContent()));
  await bfsG.locator('button:has-text("Step")').click();
  check('dsa: BFS puts B in the queue with distance 1', /B is new: distance 0 \+ 1 = 1/.test(await bfsG.locator('.gr-msg').textContent()) && (await bfsG.locator('.gr-chips').first().textContent()).includes('B'));
  await runGraph(bfsG);
  check('dsa: BFS ends with the shortest route to H, four edges', /A → B → D → F → H: 4 edges/.test(await bfsG.locator('.gr-msg').textContent()), await bfsG.locator('.gr-msg').textContent());
  check('dsa: BFS finishes all eight vertices in the order of the rings', (await bfsG.locator('.gr-chips').nth(1).textContent()).replace(/\s/g, '') === 'ABCDEFGH');
  await bfsG.locator('button:has-text("Reset")').click();
  check('dsa: Reset returns the figure to its first step', /step 1 of/.test(await bfsG.locator('.fig-note').textContent()));
  await runGraph(dfsG);
  check('dsa: DFS visits A B D C E F H G', /order A B D C E F H G/.test(await dfsG.locator('.gr-msg').textContent()), await dfsG.locator('.gr-msg').textContent());
  await runGraph(dijG);
  check('dsa: Dijkstra ends with the distances 0 4 1 3 7 6 11 12', /A 0, B 4, C 1, D 3, E 7, F 6, G 11, H 12/.test(await dijG.locator('.gr-msg').textContent()), await dijG.locator('.gr-msg').textContent());
  check('dsa: Dijkstra shows the road lengths on the edges', (await dijG.locator('svg.gr-svg text').allTextContents()).includes('8'));
  await goto('#/dsa/13');
  const g2 = page.locator('.fig-mount').filter({ has: page.locator('svg.gr-svg') }).nth(0);
  await g2.locator('button:has-text("Play")').click(); await page.waitForTimeout(2800); await g2.locator('button:has-text("Pause")').click();
  check('dsa: the graph figure plays on its own and pauses', !/step 1 of/.test(await g2.locator('.fig-note').textContent()));
  }
  await goto('#/python/1');
  const pp = page.locator('.play').filter({ has: page.locator('.guess') }).nth(3);   // the apples example (the fourth with a prediction)
  const capHidden = await pp.locator('.play-cap').isHidden();
  await pp.locator('.toolbar .btn.primary').click();
  const nudged = await pp.locator('.guess-nudge').isVisible();
  await pp.locator('.guess-text').fill('7\n10\n14');
  await pp.locator('.toolbar .btn.primary').click();
  await pp.locator('.guess-result').waitFor({ state: 'visible', timeout: 20000 }).catch(() => { });
  const sum = await pp.locator('.guess-sum').textContent().catch(() => '');
  check('an example with a prediction asks for a guess, then compares it line by line and shows the explanation', capHidden && nudged && /2 of 3 lines/.test(sum) && (await pp.locator('.guess-lines .bad').count()) === 1 && await pp.locator('.play-cap').isVisible(), sum);
  // the new exercise kinds: a trace table and a Parsons problem in Python lesson 4
  await goto('#/python/4');
  const tr = page.locator('#py-4-3');
  const trInputs = tr.locator('input.ans');
  const trAnswers = ['7', '0', '0', '10', '7', '1', '3', '17', '2', '3', '17', '2'];
  check('a trace shows the numbered program and one blank per unknown value', (await tr.locator('.tr-line').count()) === 7 && (await trInputs.count()) === trAnswers.length);
  await trInputs.nth(4).focus();
  const lit = await tr.locator('.tr-line.lit').getAttribute('data-line').catch(() => null);
  for (let i = 0; i < trAnswers.length; i++) await trInputs.nth(i).fill(trAnswers[i]);
  await tr.locator('button:has-text("Check")').click();
  check('a trace lights up the line a blank asks about, and passes when filled in right', lit === '3' && (await tr.locator('.verdict.pass').count()) === 1, lit);
  const ps = page.locator('#py-4-4');
  await ps.locator('button:has-text("Check")').click();
  const psEmpty = await ps.locator('.verdict').textContent();
  const want = [['n = int(input())', 0], ['for i in range(2, n + 1):', 0], ['if i % 2 == 0:', 1], ['print(i)', 2], ['print("done")', 0]];
  for (const [text] of want) await ps.locator('.ps-pool').getByText(text, { exact: true }).click();
  for (let i = 0; i < want.length; i++) for (let k = 0; k < want[i][1]; k++) await ps.locator('.ps-prog .ps-line').nth(i).locator('button[aria-label="Indent more"]').click();
  await ps.locator('button:has-text("Check")').click();
  await ps.locator('.verdict.pass, .verdict.fail:not(:has-text("Add some blocks"))').waitFor({ timeout: 20000 }).catch(() => { });
  const psText = await ps.locator('.verdict').textContent();
  check('a Parsons problem refuses an empty program, then runs the built one against its tests and passes', /Add some blocks/.test(psEmpty) && (await ps.locator('.verdict.pass').count()) === 1 && (await ps.locator('.ps-pool .ps-block').count()) === 2, psText);
  await goto('#/scratch/4');
  check('a Scratch if-else block renders with an else arm', (await page.locator('.sb-c .sb-row:has-text("else")').count()) >= 1);
  const qc = page.locator('.qc').first();
  await qc.locator('.qc-opt').nth(0).click();
  const qcWaits = (await qc.locator('.qc-why').isHidden()) && (await qc.locator('.qc-sure').isVisible());
  await qc.locator('.qc-sure-btn:has-text("Sure")').click();
  const qcFirst = await qc.locator('.qc-why').textContent();
  await qc.locator('.qc-opt').nth(1).click();
  check('a quick check asks how sure before marking, marks a confident wrong option, then the right one with an explanation', qcWaits && /Not that one, and you were sure/.test(qcFirst) && (await qc.locator('.qc-opt.right').count()) === 1 && /Yes\./.test(await qc.locator('.qc-why').textContent()), qcFirst);
  // the spaced review: that answer joined the review; made due, it comes back on #/today, and the course page shows the skills map
  const rv = await page.evaluate(() => JSON.parse(localStorage.getItem('shortcourses.review.v1') || 'null'));
  const rvIds = rv ? Object.keys(rv.items) : [];
  check('a quick check answered in a lesson joins the review, due tomorrow', rvIds.length === 1 && /^scratch:/.test(rvIds[0]) && rv.items[rvIds[0]].box === 0 && rv.items[rvIds[0]].due > Date.now() + 20 * 3600 * 1000, rv);
  await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('shortcourses.review.v1')); for (const k in d.items) d.items[k].due = 0; localStorage.setItem('shortcourses.review.v1', JSON.stringify(d)); });
  await goto('#/today');
  const badge = await page.locator('.top .today-link .today-badge').textContent().catch(() => '');
  const tq = page.locator('.today-stage .qc');
  for (let i = 0; i < 6 && !(await tq.evaluate((n) => n.classList.contains('done'))); i++) {
    const opt = tq.locator('.qc-opt:not([disabled])').first(); await opt.click();
    if (await tq.locator('.qc-sure').isVisible()) await tq.locator('.qc-sure-btn:has-text("Sure")').click();
  }
  await page.locator('.today-next').click();
  const doneText = await page.locator('.today-done').textContent().catch(() => '');
  const rvAfter = await page.evaluate(() => JSON.parse(localStorage.getItem('shortcourses.review.v1')));
  const it = rvAfter.items[rvIds[0]];
  check('#/today asks the due question, reschedules it, and says what comes next', badge === '1' && /Done for today: [01] of 1/.test(doneText) && it.n === 2 && it.due > Date.now(), { badge, doneText, it });
  await goto('#/scratch');
  check('the course page shows the skills map once a course is started', (await page.locator('.review-panel .skills li').count()) === (await page.locator('ol.lessons > li').count()) && (await page.locator('.review-panel .sk-practising').count()) >= 1);
  // SC 109: the k-NN figure (k = 1 is perfect on its training fruit and misses a test fruit; k = 3 is the other way round), the arrow
  // keys move the new fruit, and a course with named skills lists them under its lessons
  await goto('#/ml/3');
  const knn = page.locator('.fig-mount').filter({ has: page.locator('.knn-new') }).first();
  const knnScore = () => knn.locator('.fig-status').nth(1).textContent();
  const k1 = await knnScore(); await knn.locator('select').selectOption('3'); const k3 = await knnScore();
  const knnBefore = await knn.locator('.fig-status').first().textContent();
  await knn.locator('.knn-new').focus(); await page.keyboard.press('ArrowRight');
  const knnAfter = await knn.locator('.fig-status').first().textContent();
  check('k-NN figure: training and test scores for each k, and the arrow keys move the new fruit', /16 of 16[\s\S]*5 of 6/.test(k1) && /15 of 16[\s\S]*6 of 6/.test(k3) && /6\.8 cm wide/.test(knnBefore) && /6\.9 cm wide/.test(knnAfter), { k1, k3, knnBefore, knnAfter });
  // SC 109 unit two: the perceptron stops after a clean pass, a learning rate of 0.25 flies off the valley, and the tree builder
  // reaches five pure leaves by outlook, then humidity and wind
  await goto('#/ml/5');
  const pfig = page.locator('.fig-mount').filter({ has: page.locator('button:has-text("Next mistake")') }).first();
  await pfig.locator('button:has-text("To the end")').click();
  const pEnd = await pfig.locator('.fig-status').last().textContent();
  await goto('#/ml/6');
  const dfig = page.locator('.fig-mount').filter({ has: page.locator('select[aria-label="learning rate"]') }).first();
  await dfig.locator('select').selectOption('0.25');
  for (let i = 0; i < 4; i++) await dfig.locator('button:has-text("Step")').click();
  const dEnd = await dfig.locator('.fig-status').last().textContent();
  await goto('#/ml/7');
  const tfig = page.locator('.fig-mount').filter({ has: page.locator('.dt-tree') }).first();
  await tfig.locator('button', { hasText: /^outlook/ }).click(); await tfig.locator('button', { hasText: /^humidity/ }).first().click(); await tfig.locator('button', { hasText: /^windy/ }).first().click();
  const tEnd = await tfig.locator('.fig-status').textContent();
  check('SC 109 figures: perceptron converges, a big learning rate diverges, the tree builder finds the 5-leaf tree', /0 of 16[\s\S]*after 4 passes/.test(pEnd) && /off the picture/.test(dEnd) && /5 leaves/.test(tEnd), { pEnd, dEnd, tEnd });
  await goto('#/ml/1');
  const mlq = page.locator('.qc').first();
  await mlq.locator('.qc-opt').nth(1).click(); await mlq.locator('.qc-sure button').first().click();
  await goto('#/ml');
  check('a course with named skills lists them in its skills map', (await page.locator('.review-panel .sk-chip').count()) === 21 && (await page.locator('.review-panel .sk-chip.sk-practising').count()) === 1, await page.locator('.review-panel').innerText().catch(() => 'no panel'));
  await goto('#/scratch/4');
  check('the lesson map lists the parts and the side column follows the page', (await page.locator('.lesson-map li').count()) >= 4 && (await page.locator('.onpage li').count()) >= 4);
  const quiz = page.locator('.bq').first();
  await quiz.locator('.bq-input').fill('if score > 100'); await quiz.locator('button:has-text("Check")').click();
  const quizWrong = await quiz.locator('.bq-msg').textContent();
  await quiz.locator('.bq-input').fill("if score > 100:"); await quiz.locator('button:has-text("Check")').click();
  check('the translate-the-block quiz marks a missing colon and accepts the right line', /colon/.test(quizWrong) && (await quiz.locator('.bq-msg.ok').count()) === 1, quizWrong);
  for (const h of ['#/', '#/lisp/2', '#/math/1', '#/dsa/2', '#/dsa/3', '#/dsa/4', '#/scratch/6', '#/scratch/7', '#/scratch/8', '#/guide', '#/about', '#/portfolio']) await goto(h);

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
  // The page is served with the headers of dist/_headers (its rules for /index.html and /*), so what ships is what is tested: cross-origin isolation among them.
  const indexHeaders = {}; { let on = false; for (const line of fs.readFileSync(path.join(root, '_headers'), 'utf8').split('\n')) { if (!line.trim()) { on = false; continue; } if (!/^\s/.test(line)) { if (line.trim() === '/index.html' || line.trim() === '/*') on = true; continue; } if (on) { const i = line.indexOf(':'); indexHeaders[line.slice(0, i).trim()] = line.slice(i + 1).trim(); } } }
  let tamper = false;   // when set, the server hands out a changed compiler script
  const server = http.createServer((req, res) => {
    const p = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
    if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end('no'); return; }
    if (tamper && p.endsWith('toolchain.js')) { const body = Buffer.concat([fs.readFileSync(p), Buffer.from(';self.__tampered = true;')]); res.writeHead(200, { 'Content-Type': 'text/javascript', 'Content-Length': body.length }); res.end(body); return; }
    res.writeHead(200, Object.assign({ 'Content-Type': types[path.extname(p)] || 'application/octet-stream', 'Content-Length': fs.statSync(p).size }, p.endsWith('index.html') ? indexHeaders : {})); fs.createReadStream(p).pipe(res);
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
  // ---- Bot Arena, persistent mode: needs the page to be cross-origin isolated, which the headers in dist/_headers make it (not so for a file)
  {
    check('arena persistent: the shipped headers isolate the page', indexHeaders['Cross-Origin-Opener-Policy'] === 'same-origin' && indexHeaders['Cross-Origin-Embedder-Policy'] === 'require-corp', indexHeaders);
    check('arena persistent: a page opened as a file is not isolated, so persistent mode is off and says so', await page.evaluate(() => !window.crossOriginIsolated && !window.BOTRUN.available()) && (await (async () => { await goto('#/arena'); return page.evaluate(() => document.querySelector('select[aria-label="How bots are run"] option[value=persistent]').disabled); })()));
    await hp.goto(origin + '/index.html#/arena'); await hp.waitForSelector('.arena');
    check('arena persistent: over http with the headers the page is isolated and persistent mode is on', await hp.evaluate(() => window.crossOriginIsolated === true && window.BOTRUN.available()) && !(await hp.evaluate(() => document.querySelector('select[aria-label="How bots are run"] option[value=persistent]').disabled)));
    // a Python turtle drawing (a sandboxed frame, an iframe inside a cross-origin isolated page) still works
    await hp.goto(origin + '/index.html#/lab'); await hp.waitForSelector('.editor textarea');
    await hp.click('.lang-btn:has-text("Python")');
    await hp.evaluate(() => { const t = document.querySelector('.editor textarea'); t.value = 'import turtle\nt = turtle.Turtle()\nt.forward(50)\nturtle.done()\nprint("drawn")'; t.dispatchEvent(new Event('input', { bubbles: true })); });
    await hp.click('.lab-toolbar button:has-text("Run")');
    await hp.waitForFunction(() => /^(exit|error|stopped)/.test(document.querySelector('.lab-out .term-status').textContent), null, { timeout: 20000 }).catch(() => { });
    check('arena persistent: turtle graphics (a sandboxed frame) still work in the isolated page', /^exit 0/.test(await hp.locator('.lab-out .term-status').textContent()) && (await hp.frameLocator('#lab-turtle iframe').locator('canvas').count()) > 0);
    await hp.goto(origin + '/index.html#/arena'); await hp.waitForSelector('.arena');
    await hp.selectOption('select[aria-label="How bots are run"]', 'persistent');
    const B = require('./src/arena_bots.js');
    const setCode = (code) => hp.evaluate((c) => { const t = document.querySelector('.arena-editor textarea'); t.value = c; t.dispatchEvent(new Event('input', { bubbles: true })); }, code);
    const playHp = async () => { await hp.click('.arena-setup button:text-is("Play")'); await hp.waitForSelector('.arena-banner:not([hidden])', { timeout: 120000 }); return hp.locator('.arena-banner').innerText(); };
    await hp.selectOption('select[aria-label="Player 2"]', 'b:flood');
    for (const lang of ['python', 'java', 'cpp', 'scheme']) {
      await hp.selectOption('select[aria-label="Language"]', lang);
      const t0 = Date.now(); const banner = await playHp();
      const log = await hp.locator('.arena-log').last().innerText();
      check('arena persistent: the ' + lang + ' starter plays a match with a bot that stays running, no invalid moves', /wins after|draw/i.test(banner) && !/is moved UP|forfeits/.test(log), [banner, log.slice(0, 200)]);
      console.log('     ' + lang + ' persistent match: ' + (Date.now() - t0) + ' ms');
    }
    // a bot that remembers: it turns right every third turn using a counter that restart mode would lose
    const counter = { python: 'n = 0\nwhile True:\n    line = input()\n    if line == "" or line == "GAMEOVER":\n        break\n    if line == "END":\n        n += 1\n        print("DOWN" if n % 3 == 0 else "RIGHT")\n',
      java: 'import java.util.Scanner;\npublic class Main { public static void main(String[] a) { Scanner in = new Scanner(System.in); int n = 0; while (in.hasNext()) { String w = in.next(); if (w.equals("END")) { n++; System.out.println(n % 3 == 0 ? "DOWN" : "RIGHT"); } if (w.equals("GAMEOVER")) break; } } }',
      cpp: '#include <iostream>\n#include <cstring>\nusing namespace std;\nint main() { int n = 0; char w[64]; while (cin >> w) { if (strcmp(w, "END") == 0) { n++; if (n % 3 == 0) cout << "DOWN" << endl; else cout << "RIGHT" << endl; } } return 0; }',
      scheme: '(define n 0)\n(let loop ((w (read)))\n  (cond ((eof-object? w) 0)\n        ((eq? w (quote END)) (set! n (+ n 1)) (display (if (= (remainder n 3) 0) "DOWN" "RIGHT")) (newline) (loop (read)))\n        (else (loop (read)))))' };
    await hp.selectOption('select[aria-label="Player 2"]', 'b:random');
    for (const lang of ['python', 'java', 'cpp', 'scheme']) {
      await hp.selectOption('select[aria-label="Language"]', lang);
      await hp.evaluate(() => { const l = document.querySelector('.arena-swap:not([hidden]) button'); if (l) l.click(); });   // "Replace my code" when the language is changed after an edit
      await setCode(counter[lang]);
      await hp.fill('input[aria-label="Seed"]', '5');
      await playHp();
      const dl = await Promise.all([hp.waitForEvent('download'), hp.click('button:has-text("Download replay")')]);
      const rep = JSON.parse(require('fs').readFileSync(await dl[0].path(), 'utf8'));
      const first = rep.moves.slice(0, 6).map((m) => m[0]).join('');
      check('arena persistent: the ' + lang + ' bot keeps its counter between turns (RIGHT, RIGHT, DOWN, RIGHT, ...)', first.startsWith('RRDR'.slice(0, Math.min(4, first.length))) && first.length >= 3, first);
    }
    // a bot that never finishes a turn is ended, the match goes on, and the page stays alive
    await hp.selectOption('select[aria-label="Language"]', 'python');
    await hp.evaluate(() => { const l = document.querySelector('.arena-swap:not([hidden]) button'); if (l) l.click(); });
    await setCode('n = 0\nwhile True:\n    line = input()\n    if line == "END":\n        n += 1\n        if n == 3:\n            while True:\n                pass\n        print("RIGHT")\n');   // answers twice, then gets stuck
    await hp.fill('input[aria-label="Seed"]', '');
    await hp.selectOption('select[aria-label="Time per move"]', '250');
    const bannerLoop = await playHp();
    check('arena persistent: a bot that gets stuck in a loop on turn 3 is ended (logged as too slow), and the match still ends', /wins|draw/i.test(bannerLoop) && /took longer than 250 ms/.test(await hp.locator('.arena-log').last().innerText()), bannerLoop);
    await setCode('def f(:\n');
    const bannerBad = await playHp();
    check('arena persistent: a syntax error forfeits before turn 1', /Player 2 .* wins after 1 turn/.test(bannerBad) && /forfeits before turn 1/.test(await hp.locator('.arena-log').last().innerText()), bannerBad);
    void B;
    await hp.goto(origin + '/index.html#/lab'); await hp.waitForSelector('#app > *');
  }
  check('full c++: no policy violations, no page errors', hpViolations.length === 0 && hpErrors.length === 0, [hpViolations, hpErrors]);
  await hp.close(); server.close();

  // ---- Bot Arena: a bot in each sandbox plays through the page, the viewer shows it, links and files carry it, a tournament runs
  {
    await goto('#/arena');
    await page.waitForSelector('.arena');
    const play = async () => { await page.click('.arena-setup button:text-is("Play")'); await page.waitForSelector('.arena-banner:not([hidden])', { timeout: 90000 }); return page.locator('.arena-banner').innerText(); };
    check('arena: the page opens with a starter bot and a canvas', (await page.locator('.arena-canvas').count()) === 1 && /readTurn/.test(await page.locator('.arena-editor textarea').inputValue()));
    let banner = await play();
    check('arena: the Python starter plays Random in its sandbox and the banner says who won', /wins after \d+ turns?|draw/i.test(banner), banner);
    const painted = await page.evaluate(() => { const c = document.querySelector('.arena-canvas'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; const seen = new Set(); for (let i = 0; i < d.length; i += 4 * 97) seen.add(d[i] + ',' + d[i + 1] + ',' + d[i + 2]); return seen.size; });
    check('arena: the board is painted (more than one colour on the canvas)', painted > 2, painted);
    await page.click('button[aria-label="Back to the start"]');
    check('arena: stepping back to the start shows turn 0', /^Turn 0 of/.test(await page.locator('.arena-turn').innerText()));
    // every language, against the built-in Flood Fill: a program in each sandbox answers within its limit
    for (const lang of ['java', 'cpp', 'scheme', 'python']) {
      await page.selectOption('select[aria-label="Language"]', lang);
      await page.selectOption('select[aria-label="Player 2"]', 'b:flood');
      banner = await play();
      const log = await page.locator('.arena-log').last().innerText();
      check('arena: the ' + lang + ' starter plays through the page with no invalid moves', /wins after|draw/i.test(banner) && !/is moved UP/.test(log), [banner, log.slice(0, 200)]);
    }
    // an infinite loop times out, the page stays alive, and the match still ends
    await page.selectOption('select[aria-label="Language"]', 'python');
    await page.evaluate(() => { const t = document.querySelector('.arena-editor textarea'); t.value = 'while True:\n    pass\n'; t.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.selectOption('select[aria-label="Time per move"]', '250');
    banner = await play();
    check('arena: a bot stuck in a loop times out (logged), and the page is not frozen', /wins|draw/i.test(banner) && /took longer than 250 ms/.test(await page.locator('.arena-log').last().innerText()), banner);
    await page.evaluate(() => { const t = document.querySelector('.arena-editor textarea'); t.value = 'def f(:\n'; t.dispatchEvent(new Event('input', { bubbles: true })); });
    banner = await play();
    check('arena: a bot with a syntax error forfeits and its error is shown', /Player 2 .* wins after 1 turn/.test(banner) && /forfeits before turn 1/.test(await page.locator('.arena-log').last().innerText()), banner);
    // saved in the browser, shared by link and by file
    await page.reload(); await page.waitForSelector('.arena');
    check('arena: the bot is still there after a reload', /def f\(:/.test(await page.locator('.arena-editor textarea').inputValue()));
    await page.evaluate(() => { const t = document.querySelector('.arena-editor textarea'); t.value = 'print("RIGHT")\n'; t.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.click('button:text-is("Copy link")');
    const link = await page.locator('.arena-link').inputValue();
    check('arena: a bot link carries the bot in the fragment', /#\/arena\?bot=[A-Za-z0-9_-]+$/.test(link), link.slice(0, 80));
    await goto('#/arena?' + link.split('?')[1]);
    check('arena: opening a bot link shows the code first and runs nothing', (await page.locator('.arena-incoming').count()) === 1 && /RIGHT/.test(await page.locator('.arena-peek').innerText()) && (await page.locator('.arena-banner:not([hidden])').count()) === 0);
    await page.click('.arena-incoming button:has-text("Open it as a new bot")');
    check('arena: the shared bot becomes a new bot of the student', /RIGHT/.test(await page.locator('.arena-editor textarea').inputValue()) && (await page.locator('.arena-botsel option').count()) === 2);
    banner = await play();
    const rl = await (async () => { await page.click('button:has-text("Copy replay link")'); return page.locator('.arena-linkbox .arena-link').last().inputValue(); })();
    const fresh = await browser.newPage({ viewport: { width: 1100, height: 900 } });
    await fresh.goto(SITE + '#/arena?' + rl.split('?')[1]); await fresh.reload(); await fresh.waitForSelector('.arena-banner:not([hidden])', { timeout: 20000 }).catch(() => { });
    await fresh.evaluate(() => { const b = document.querySelector('button[aria-label="Jump to the end"]'); if (b) b.click(); });
    const again = await fresh.locator('.arena-banner').innerText().catch(() => '');
    check('arena: a replay link opened in a fresh browser plays the same match', again === banner, [again, banner]);
    await fresh.close();
    await goto('#/arena?bot=not-a-real-token');
    check('arena: a broken link says so and does not run anything', /could not be opened/.test(await page.locator('.arena-incoming').innerText()));
    // the tournament page: built-in bots and a bot file, a round robin, a table, a head-to-head box that opens a replay, the exports, the projector
    await goto('#/arena/tournament');
    for (const n of ['Random', 'Wall Hugger', 'Flood Fill']) await page.click('button:has-text("+ ' + n + '")');
    await page.setInputFiles('input[type=file]', [{ name: 'a.tronbot.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ format: 'tronbot', version: 1, name: '<b>Evil</b>', lang: 'scheme', source: '(display "UP")' })) }, { name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"x":1}') }]);
    await page.waitForFunction(() => document.querySelectorAll('.arena-entries li').length === 4);
    check('arena tournament: a bad file is reported and does not stop the good one; names are text', /bad\.json/.test(await page.locator('.arena-panenote').first().innerText()) && (await page.locator('.arena-entries b:has-text("<b>Evil</b>")').count()) === 1 && (await page.locator('.arena-entries li b b').count()) === 0);
    await page.fill('input[aria-label="Matches per pairing"]', '2');
    const t0 = Date.now();
    await page.click('button:has-text("Run the tournament")');
    await page.waitForSelector('.arena-results:not([hidden])', { timeout: 120000 });
    check('arena tournament: 6 pairings x 2 matches finish with a standings table', (await page.locator('.arena-results table.arena-table tbody tr').count()) === 4 && /12 matches/.test(await page.locator('progress + span').innerText()), await page.locator('progress + span').innerText());
    console.log('     tournament of 12 matches took ' + (Date.now() - t0) + ' ms');
    await page.click('.arena-sortbtn:has-text("Bot")');
    const names = await page.locator('.arena-results table.arena-table tbody tr td:nth-child(2) b').allInnerTexts();
    check('arena tournament: the table sorts by a column', names.join('|') === names.slice().sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1).join('|'), names);
    await page.click('.arena-cell >> nth=0'); await page.waitForSelector('.arena-banner:not([hidden])', { timeout: 30000 });
    check('arena tournament: a box of the head-to-head grid opens that match in the viewer', /Watching:/.test(await page.locator('.arena-results p[role=status]').innerText()));
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('button:has-text("Download all replays")')]);
    check('arena tournament: the replays come as a zip', dl.suggestedFilename() === 'replays.zip');
    await page.click('button:has-text("Projector mode")'); await page.waitForSelector('.arena-projector');
    check('arena tournament: projector mode shows the match and standings', /Match 1 of 12/.test(await page.locator('.proj-count').innerText()) && !/null/.test(await page.locator('.proj-title').innerText()));
    await page.keyboard.press('Escape');
    check('arena tournament: Escape leaves projector mode', (await page.locator('.arena-projector').count()) === 0);
  }

  check('no Content Security Policy violations', violations.length === 0, violations.slice(0, 3));
  check('no page errors', errors.length === 0, errors.slice(0, 3));
  check('no dialogs', dialogs.length === 0, dialogs);
  await browser.close();
  if (bad) { console.log(bad + ' problems'); process.exit(1); }
  console.log('browser OK');
})().catch((e) => { console.log('FAILED to run: ' + e.stack); process.exit(1); });
