// Standards tags: every lesson's `standards` codes exist in src/standards.js, each Minnesota fit matches the lessons, and
// STANDARDS_ALIGNMENT.md is what scripts/standards-map.js writes from them.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const S = require('./src/standards.js');

global.window = { COURSES: [], BUILD: {} };
for (const f of fs.readdirSync(path.join(__dirname, 'src')).filter((f) => /^course_.*\.js$/.test(f))) new Function('window', fs.readFileSync(path.join(__dirname, 'src', f), 'utf8'))(global.window);
const courses = global.window.COURSES;

let failed = 0;
const check = (name, ok, detail) => { if (!ok) { failed++; console.log('FAIL ' + name + (detail ? ': ' + JSON.stringify(detail) : '')); } else console.log('ok   ' + name); };

// the tables
check('CSTA codes look like CSTA codes', Object.keys(S.CSTA).every((c) => S.CSTA_RE.test(c)));
check('Minnesota codes look like Minnesota codes and are unique', S.MN.every((b) => S.MN_RE.test(b[0])) && new Set(S.MN.map((b) => b[0])).size === S.MN.length);
check('every standard has text', Object.values(S.CSTA).every((t) => t.length > 10) && S.MN.every((b) => b[1].length > 10));
check('every Minnesota fit is yes, partial or empty, and a fit comes with a note', S.MN.every((b) => ['yes', 'partial', ''].includes(b[2]) && (!b[2] || b[3].length > 10)));
check('supporting pages name known codes', S.SUPPORT.every((s) => /^#\//.test(s.href) && s.codes.length && s.codes.every(S.known)));

// the lessons
const bad = [], dup = [], untagged = [], used = new Set();
for (const c of courses) c.lessons.forEach((l, i) => {
  const at = c.id + '/' + (i + 1);
  if (!Array.isArray(l.standards)) { untagged.push(at); return; }
  for (const code of l.standards) { used.add(code); if (!S.known(code)) bad.push(at + ' ' + code); }
  if (new Set(l.standards).size !== l.standards.length) dup.push(at);
});
check('every lesson has a standards list', untagged.length === 0, untagged.slice(0, 5));
check('every code on a lesson is a known standard', bad.length === 0, bad.slice(0, 5));
check('no lesson lists a code twice', dup.length === 0, dup);
check('most lessons are tagged (at most 3 untagged theory lessons)', courses.reduce((n, c) => n + c.lessons.filter((l) => !(l.standards || []).length).length, 0) <= 3);
check('a Minnesota benchmark has a fit exactly when some lesson is tagged with it', S.MN.every((b) => !!b[2] === used.has(b[0])), S.MN.filter((b) => !!b[2] !== used.has(b[0])).map((b) => b[0]));

// the generated page is current
let md = true;
try { execFileSync('node', ['scripts/standards-map.js', '--check'], { cwd: __dirname, stdio: 'pipe' }); } catch (e) { md = String(e.stderr); }
check('STANDARDS_ALIGNMENT.md is up to date', md === true, md);

console.log(failed ? failed + ' failed' : 'all standards checks passed');
process.exit(failed ? 1 : 0);
