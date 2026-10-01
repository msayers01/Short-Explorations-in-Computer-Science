// Security probe (manual; needs Playwright with Chromium, and a built site: `npm run build`).
//   node tools/security/links.js
// Every link route (assignment, submission, back-up, portfolio, Code Lab share, odd routes) with script payloads and prototype keys.
// Exit code is not used: read the printed lines. Anything marked XSS!! or "polluted" with a value is a finding.
const path = require('path');
const { pathToFileURL } = require('url');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright'))); }
const executablePath = process.env.CHROMIUM_PATH || undefined;
const SITE = pathToFileURL(path.join(__dirname, '../../dist/index.html')).href;
const URL0 = SITE;
const P = [
  '"><img src=x onerror="window.__xss=\'img\'">',
  '<svg onload="window.__xss=\'svg\'">',
  '</script><script>window.__xss="script"</script>',
  '\'-window.__xss=\'js\'-\'',
  '<a href="javascript:window.__xss=\'href\'" id=a1>x</a>',
];
const payload = P.join(' ');
(async () => {
  const b = await chromium.launch(executablePath ? { executablePath } : {});
  const results = [];
  const fresh = async () => {
    const ctx = await b.newContext(); const p = await ctx.newPage(); const dialogs = [], errs = [];
    p.on('dialog', d => { dialogs.push(d.message()); d.dismiss(); }); p.on('pageerror', e => errs.push(e.message));
    await p.goto(URL0 + '#/'); await p.waitForSelector('#app');
    return { p, dialogs, errs, ctx };
  };
  const check = async (name, f) => {
    const t = await fresh();
    try { await f(t); } catch (e) { t.errs.push('HARNESS: ' + e.message.split('\n')[0]); }
    await t.p.waitForTimeout(300);
    const xss = await t.p.evaluate(() => window.__xss).catch(() => '?');
    const pol = await t.p.evaluate(() => { const o = {}; const ks = []; for (const k in o) ks.push(k); return ks.join(',') + '|' + Object.keys(Object.prototype).join(','); }).catch(() => '?');
    results.push({ name, xss, dialogs: t.dialogs.length, polluted: pol, errs: t.errs.slice(0, 2) });
    await t.ctx.close();
  };
  const pack = (p, o) => p.evaluate((o) => window.TEACH.pack(o), o);
  const go = async (p, hash) => { await p.goto(URL0 + hash); await p.reload(); await p.waitForTimeout(500); };

  const asg = { v: 1, id: 'abcd2345', title: payload, lang: 'python', text: payload + '\n\n`' + payload + '`\n\n- ' + payload, starter: payload, tests: [{ k: 'stdin', in: payload, expect: payload }, { k: 'call', in: 'f(1)', expect: payload }], hints: [payload], roster: [payload, 'Bob'], author: payload, due: payload, created: 1 };
  await check('assign link (all fields)', async ({ p }) => { const a = await pack(p, asg); await go(p, '#/assign?a=' + a); await p.click('button:has-text("Check")').catch(() => { }); await p.click('button:has-text("Hint")').catch(() => { }); await p.click('button:has-text("Task")').catch(() => { }); await p.click('button:has-text("Submit")').catch(() => { }); });
  await check('assign link with no hints/roster', async ({ p }) => { const a = await pack(p, { v: 1, id: 'zzzz2345', lang: 'python', title: 't' }); await go(p, '#/assign?a=' + a); });
  await check('review link (teacher has assignment)', async ({ p }) => {
    await p.evaluate((a) => { localStorage.setItem('shortcourses.teach.v1', JSON.stringify({ teacher: true, assignments: { [a.id]: a }, book: {}, received: {} })); }, asg);
    const s = await pack(p, { v: 1, a: asg.id, t: payload, name: payload, code: payload + '\nprint("<img src=x onerror=window.__xss=1>")', at: Date.now(), check: { passed: 1, total: 2 } });
    await go(p, '#/review?s=' + s); await p.click('button:has-text("Grade book")').catch(() => { }); await p.click('button:has-text("Export CSV")').catch(() => { }); });
  await check('review link (unknown assignment)', async ({ p }) => { const s = await pack(p, { v: 1, a: 'nope', t: payload, name: payload, code: payload, at: 1 }); await go(p, '#/review?s=' + s); });
  await check('backup link', async ({ p }) => { const bk = await pack(p, { v: 1, assignments: { [asg.id]: asg } }); await go(p, '#/lab?b=' + bk); await p.click('button:has-text("Share")').catch(() => { }); await p.click('button:has-text("Edit")').catch(() => { }); });
  await check('portfolio link', async ({ p }) => {
    const pf = await pack(p, { v: 1, name: payload, note: payload, made: 1, tasks: true, items: [{ id: 'py-1-1', done: 1, code: payload }, { id: payload, done: 1, code: payload }, { id: 'ma-1-1', done: 1, code: JSON.stringify([payload]) }], lab: [{ lang: 'python', name: payload, code: payload }, { lang: payload, name: 'x', code: 'y' }] });
    await go(p, '#/portfolio?p=' + pf); await p.click('button:has-text("Check every")').catch(() => { }); await p.waitForTimeout(1500); });
  await check('lab share link', async ({ p }) => { const c = Buffer.from(payload).toString('base64url'); await go(p, '#/lab?l=python&n=' + encodeURIComponent(payload) + '&c=' + c); });
  await check('lab share link l=constructor', async ({ p }) => { await go(p, '#/lab?l=constructor&c=YQ'); await go(p, '#/lab'); });
  await check('lab share link l=__proto__', async ({ p }) => { await go(p, '#/lab?l=__proto__&c=YQ'); await go(p, '#/lab'); });
  await check('route injection', async ({ p }) => { for (const h of ['#/python/1/' + encodeURIComponent(payload), '#/' + encodeURIComponent(payload), '#/python/' + encodeURIComponent(payload), '#/__proto__', '#/constructor/1', '#/lab/' + encodeURIComponent(payload)]) await go(p, h); });
  await check('proto-pollution review a=__proto__', async ({ p }) => { const s = await pack(p, { v: 1, a: '__proto__', t: 't', name: 'polluted', code: 'x', at: 1 }); await go(p, '#/review?s=' + s); });
  await check('proto-pollution review a=constructor', async ({ p }) => { const s = await pack(p, { v: 1, a: 'constructor', t: 't', name: 'assign', code: 'x', at: 1 }); await go(p, '#/review?s=' + s); });
  await check('assign a.id=__proto__', async ({ p }) => { const a = await pack(p, { v: 1, id: '__proto__', title: 't', lang: 'python', text: 'x', starter: 's', tests: [], hints: [], roster: [], created: 1 }); await go(p, '#/assign?a=' + a); });
  console.log(JSON.stringify(results, null, 1));
  await b.close();
})();
