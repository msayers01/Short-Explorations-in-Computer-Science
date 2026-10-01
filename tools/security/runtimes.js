// Security probe (manual; needs Playwright with Chromium, and a built site: `npm run build`).
//   node tools/security/runtimes.js
// Can untrusted Python, C++ or Scheme reach the page or the network, or pollute prototypes? Skulpt module imports are tried one by one.
// Exit code is not used: read the printed lines. Anything marked XSS!! or "polluted" with a value is a finding.
const path = require('path');
const { pathToFileURL } = require('url');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright'))); }
const executablePath = process.env.CHROMIUM_PATH || undefined;
const SITE = pathToFileURL(path.join(__dirname, '../../dist/index.html')).href;
const URL0 = SITE;
(async () => {
  const b = await chromium.launch(executablePath ? { executablePath } : {});
  const p = await b.newPage(); const dialogs = []; p.on('dialog', d => { dialogs.push(d.message()); d.dismiss(); });
  await p.goto(URL0 + '#/lab'); await p.reload(); await p.waitForSelector('.lab-editor textarea');
  const pol = () => p.evaluate(() => { const ks = []; for (const k in {}) ks.push(k); return { enumerable: ks, canary: window.__x, assign: typeof Object.assign, polluted: ({}).polluted }; });
  const runIn = async (lang, code) => {
    await p.click('.lang-btn:has-text("' + lang + '")'); await p.waitForSelector('.lab-editor textarea');
    await p.evaluate((c) => { const t = document.querySelector('.lab-editor textarea'); t.value = c; t.dispatchEvent(new Event('input', { bubbles: true })); }, code);
    await p.click('.lab-toolbar button:has-text("Run")'); await p.waitForTimeout(1500);
    return (await p.locator('.out-text').allInnerTexts()).join('|').replace(/\s+/g, ' ').slice(0, 150);
  };
  const tests = {
    python: [
      ['import document', 'import document\nprint(document)'],
      ['import urllib.request', 'import urllib.request\nprint(urllib.request)'],
      ['import webbrowser', 'import webbrowser\nprint(webbrowser)'],
      ['import image', 'import image\nprint(image)'],
      ['import processing', 'import processing\nprint(processing)'],
      ['import webgl', 'import webgl\nprint(webgl)'],
      ['__import__ document', "d = __import__('document')\nprint(d)"],
      ['importlib-style', "import sys\nprint([m for m in sys.modules if 'doc' in m or 'url' in m])"],
      ['turtle still works', 'import turtle\nt = turtle.Turtle()\nt.forward(10)\nprint("turtle ok")'],
      ['random/math still work', 'import random, math\nprint(math.sqrt(16), random.randint(1,1))'],
    ],
    'C++': [
      ['proto identifiers', '#include <iostream>\nusing namespace std;\nint main() { int __proto__ = 5; int constructor = 6; int polluted = 7; cout << __proto__ << constructor << endl; return 0; }'],
      ['#include injection', '#include <iostream>\n#include <../../etc/passwd>\n#include <constructor>\nusing namespace std;\nint main() { return 0; }'],
    ],
    Scheme: [
      ['define __proto__', '(define __proto__ 1)\n(define constructor 2)\n(display (+ __proto__ constructor))'],
    ],
  };
  for (const lang in tests) for (const [name, code] of tests[lang]) console.log(lang.padEnd(7), name.padEnd(26), '→', await runIn(lang, code));
  console.log('after:', JSON.stringify(await pol()), 'dialogs', dialogs.length);
  await b.close();
})();
