// Student Showcase: scripts/showcase.js against good and hostile folders (consent, names, sizes, odd files, odd slugs, __proto__ keys).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const SC = require('./scripts/showcase.js');

let failed = 0;
const check = (name, ok, detail) => { if (!ok) { failed++; console.log('FAIL ' + name + (detail ? ': ' + JSON.stringify(detail) : '')); } else console.log('ok   ' + name); };

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'showcase-'));
const put = (slug, files) => { for (const [n, c] of Object.entries(files)) { const f = path.join(root, slug, n); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, c); } };
const meta = (o) => JSON.stringify(Object.assign({ title: 'T', name: 'Sam', consent: true }, o));

put('good', { 'project.json': meta({ grade: '9-10', note: 'hello', date: '2026-10', stdin: '1\n' }), 'main.py': 'print(1)\r\n', 'util.py': 'x = 1\n', 'notes.txt': 'n', 'pic.png': 'binary', '.hidden.py': 'x', 'sub/deep.py': 'y = 2\n' });
put('java-two', { 'project.json': meta({}), 'B.java': 'class B {}', 'Main.java': 'public class Main { public static void main(String[] a) {} }', 'project.json.bak': 'x' });
put('no-consent', { 'project.json': meta({ consent: 'yes' }), 'a.py': 'x' });
put('no-consent2', { 'project.json': JSON.stringify({ title: 'T', name: 'Sam' }), 'a.py': 'x' });
put('two-words', { 'project.json': meta({ name: 'Sam Smith' }), 'a.py': 'x' });
put('two-words-ok', { 'project.json': meta({ name: 'Mia R.', nameOk: true }), 'a.py': 'x' });
put('bad-grade', { 'project.json': meta({ grade: '13' }), 'a.py': 'x' });
put('bad-json', { 'project.json': '{nope', 'a.py': 'x' });
put('array-json', { 'project.json': '[]', 'a.py': 'x' });
put('no-code', { 'project.json': meta({}), 'notes.txt': 'x' });
put('big-file', { 'project.json': meta({}), 'a.py': 'x'.repeat(61 * 1024) });
put('bad-main', { 'project.json': meta({ main: 'nope.py' }), 'a.py': 'x' });
put('bad-lang', { 'project.json': meta({ lang: 'constructor' }), 'a.py': 'x' });
put('Bad_Slug', { 'project.json': meta({}), 'a.py': 'x' });
put('_draft', { 'project.json': meta({}), 'a.py': 'x' });
put('html-title', { 'project.json': meta({ title: '<img src=x onerror=alert(1)>', note: 'a\u0000b\u0007c' }), 'a.py': 'print(1)' });
put('proto', { 'project.json': '{"__proto__":{"consent":true},"title":"T","name":"Sam"}', 'a.py': 'x' });

const r = SC.load(root);
const ids = r.projects.map((p) => p.id);
const errOf = (slug) => r.errors.filter((e) => e.startsWith('showcase/' + slug + ':'));

check('a good folder loads', ids.includes('good'));
const g = r.projects.find((p) => p.id === 'good') || {};
check('the loaded project has only the fields the page shows', JSON.stringify(Object.keys(g).sort()) === JSON.stringify(['date', 'files', 'grade', 'id', 'lang', 'main', 'name', 'note', 'stdin', 'title']), Object.keys(g));
check('language and main file are inferred', g.lang === 'python' && g.main === 'main.py');
check('line endings are normalised', (g.files || []).find((f) => f.name === 'main.py').code === 'print(1)\n');
check('the main file comes first, nested files keep their path', (g.files || [])[0].name === 'main.py' && (g.files || []).some((f) => f.name === 'sub/deep.py'));
check('binary and hidden files are left out and reported', !(g.files || []).some((f) => /png|hidden/.test(f.name)) && r.skipped.some((s) => /pic\.png/.test(s)));
check('a project is not shipped with its consent note or paths', !JSON.stringify(g).includes('consent') && !JSON.stringify(g).includes(root));
const j = r.projects.find((p) => p.id === 'java-two') || {};
check('a Java project infers Java and picks Main.java', j.lang === 'java' && j.main === 'Main.java', j);
for (const slug of ['no-consent', 'no-consent2', 'proto']) check(slug + ': consent must be exactly true', errOf(slug).length > 0 && !ids.includes(slug), r.errors);
check('a surname is refused unless nameOk', errOf('two-words').length === 1 && !ids.includes('two-words') && ids.includes('two-words-ok'));
for (const slug of ['bad-grade', 'bad-json', 'array-json', 'no-code', 'big-file', 'bad-main', 'bad-lang', 'Bad_Slug']) check(slug + ' is refused', errOf(slug).length > 0 && !ids.includes(slug), r.errors);
check('folders starting with _ are ignored', !ids.includes('_draft') && !r.errors.some((e) => /_draft/.test(e)));
const h = r.projects.find((p) => p.id === 'html-title') || {};
check('markup in a title stays text (the page draws it as text) and control characters go', h.title === '<img src=x onerror=alert(1)>' && h.note === 'abc');
check('the newest project is first', ids.indexOf('good') < ids.indexOf('java-two'));
check('no folder, no projects', SC.load(path.join(root, 'nothing-here')).projects.length === 0);

fs.rmSync(root, { recursive: true, force: true });
if (failed) { console.log(failed + ' failed'); process.exit(1); }
console.log('showcase OK');
