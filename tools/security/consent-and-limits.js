// Security probe (manual; needs Playwright with Chromium, and a built site: `npm run build`).
//   node tools/security/consent-and-limits.js
// Links that change teacher data must ask first; decompression bomb; a bad ?l= value must not break the Code Lab.
// Exit code is not used: read the printed lines. Anything marked XSS!! or "polluted" with a value is a finding.
const path = require('path');
const { pathToFileURL } = require('url');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright'))); }
const executablePath = process.env.CHROMIUM_PATH || undefined;
const SITE = pathToFileURL(path.join(__dirname, '../../dist/index.html')).href;
const U = SITE;
(async () => {
  const b = await chromium.launch(executablePath ? { executablePath } : {});
  const ctx = await b.newContext(); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(U + '#/'); await p.waitForSelector('#app');
  const pack = (o) => p.evaluate((o) => window.TEACH.pack(o), o);
  const go = async (h) => { await p.goto(U + h); await p.reload(); await p.waitForTimeout(600); };
  const teach = () => p.evaluate(() => JSON.parse(localStorage.getItem('shortcourses.teach.v1') || '{}'));
  const asg = { id: 'abcd2345', v: 1, title: 'Sum', lang: 'python', text: 'add', starter: '', tests: [{ k: 'stdin', in: '1 2', expect: '3', hidden: true }], hints: [], roster: [], author: '', due: '', created: 1 };
  await p.evaluate((a) => localStorage.setItem('shortcourses.teach.v1', JSON.stringify({ teacher: true, assignments: { [a.id]: a }, book: { [a.id]: { Ann: { name: 'Ann', code: 'REAL WORK', at: 1, reviewed: 1 } } }, received: {} })), asg);

  // 1. review link: nothing may change until the teacher clicks
  const evil = await pack({ v: 1, a: asg.id, t: 'Sum', name: 'Ann', code: 'print(3)', at: 5 });
  await go('#/review?s=' + evil);
  console.log('confirm shown:', await p.locator('.teach-panel:has-text("A submission link was opened")').count(), '| mentions replacing:', await p.locator('.teach-panel:has-text("replaces the submission from Ann")').count());
  console.log('book untouched before click:', (await teach()).book[asg.id].Ann.code);
  await p.click('button:has-text("Add it and run the tests")'); await p.waitForTimeout(1500);
  console.log('after click:', (await teach()).book[asg.id].Ann.code, '| hidden test ran:', JSON.stringify((await teach()).book[asg.id].Ann.result && { p: (await teach()).book[asg.id].Ann.result.hiddenPassed, t: (await teach()).book[asg.id].Ann.result.hiddenTotal }));
  // cancel path
  await go('#/review?s=' + await pack({ v: 1, a: asg.id, t: 'x', name: 'Mallory', code: 'x', at: 1 })); await p.click('button:has-text("Cancel")');
  console.log('cancelled: Mallory stored?', !!(await teach()).book[asg.id].Mallory);

  // 2. back-up link: would replace the teacher's assignment (hidden tests) — must wait for a click
  const sabotage = await pack({ v: 1, assignments: { [asg.id]: { ...asg, title: 'SABOTAGED', tests: [] } } });
  await go('#/lab?b=' + sabotage);
  console.log('backup confirm warns REPLACE:', await p.locator('.teach-panel:has-text("would REPLACE")').count(), '| title before click:', (await teach()).assignments[asg.id].title, '| hidden tests kept:', (await teach()).assignments[asg.id].tests.length);
  await p.click('button:has-text("Cancel")'); console.log('after cancel:', (await teach()).assignments[asg.id].title);

  // 3. pollution through the confirm flow
  await go('#/review?s=' + await pack({ v: 1, a: '__proto__', t: 't', name: 'polluted', code: 'x', at: 1 })); console.log('a=__proto__ rejected, confirm shown:', await p.locator('.teach-panel:has-text("A submission link")').count());
  await go('#/review?s=' + await pack({ v: 1, a: 'abcd2345', t: 't', name: '__proto__', code: 'x', at: 1 })); await p.click('button:has-text("Add it and run the tests")').catch(() => { }); await p.waitForTimeout(800);
  console.log('Object.prototype polluted:', await p.evaluate(() => Object.keys(Object.prototype).concat(Object.getOwnPropertyNames({}.__proto__).filter(k => !['constructor','__defineGetter__','__defineSetter__','hasOwnProperty','__lookupGetter__','__lookupSetter__','isPrototypeOf','propertyIsEnumerable','toString','valueOf','__proto__','toLocaleString'].includes(k)))));

  // 4. a decompression bomb opens as a clean error and the tab stays responsive
  const bomb = await p.evaluate(async () => window.TEACH.pack({ v: 1, junk: '0'.repeat(60 * 1024 * 1024) }));
  const t0 = Date.now(); await go('#/portfolio?p=' + bomb);
  console.log('bomb link (' + bomb.length + ' chars):', (await p.locator('#app h1').first().innerText()), '|', Date.now() - t0, 'ms');

  // 5. ?l=constructor no longer breaks the lab for good
  await go('#/lab?l=constructor&c=YQ'); await go('#/lab');
  console.log('lab after l=constructor link renders:', await p.locator('.lab-editor textarea').count(), '| lang:', JSON.parse(await p.evaluate(() => localStorage.getItem('shortcourses.lab.v1'))).lang);
  await p.evaluate(() => { const S = JSON.parse(localStorage.getItem('shortcourses.lab.v1')); S.lang = 'constructor'; S.files = { python: 'x' }; localStorage.setItem('shortcourses.lab.v1', JSON.stringify(S)); }); await go('#/lab');
  console.log('lab with corrupted stored state renders:', await p.locator('.lab-editor textarea').count());
  console.log('page errors:', errs.slice(0, 3));
  await b.close();
})();
