#!/usr/bin/env node
// Builds STANDARDS_ALIGNMENT.md: which lessons address which standards (CSTA K-12 CS Standards 2017, Minnesota 2022 Mathematics).
// The standards are in src/standards.js; which lessons address them is written on the lessons (`standards: [...]` in src/course_*.js).
//   node scripts/standards-map.js          writes STANDARDS_ALIGNMENT.md
//   node scripts/standards-map.js --check  fails if STANDARDS_ALIGNMENT.md is not what the lessons and src/standards.js say
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const S = require('../src/standards.js');

global.window = { COURSES: [], BUILD: {} };
const order = ['computer', 'scratch', 'python', 'lisp', 'cpp', 'math', 'modern', 'java', 'dsa', 'shell', 'ml'];
for (const f of fs.readdirSync(path.join(root, 'src')).filter((f) => /^course_.*\.js$/.test(f))) {
  new Function('window', fs.readFileSync(path.join(root, 'src', f), 'utf8'))(global.window);
}
const courses = order.map((id) => global.window.COURSES.find((c) => c.id === id)).filter(Boolean);

const hits = {};   // code -> ['SC 101 L7', ...]
for (const c of courses) c.lessons.forEach((l, i) => { for (const code of l.standards || []) (hits[code] = hits[code] || []).push(c.code + ' L' + (i + 1)); });
const supportOf = {};
for (const s of S.SUPPORT) for (const code of s.codes) (supportOf[code] = supportOf[code] || []).push(s.name);

const out = [];
const w = (s) => out.push(s === undefined ? '' : s);
w('# Standards alignment');
w();
w('Which lessons address which standards. **Generated** by `node scripts/standards-map.js`; do not edit this page. The tags live on the lessons (`standards: [...]` in `src/course_*.js`) and the standards in `src/standards.js`. The same data is shown on the site at `#/standards` and under each lesson\'s summary.');
w();
w('## Read this first');
w();
w('- **Method.** Each lesson was mapped from its title, its summary and the skills it teaches, not by re-reading every paragraph. A lesson is listed under a standard when it *teaches or practises* it, not when it merely mentions it. Treat the map as a first draft for a teacher to confirm.');
w('- **CSTA wording.** The standard names are short paraphrases written from memory of the 2017 CSTA K-12 CS Standards, so check the codes against the official list at <https://csteachers.org/k12standards/> before quoting the table to anyone (a district, a grant). Codes whose numbering I could not vouch for (3B-AP-19 and the four 3B-IC standards) are left out.');
w('- **Grade bands.** CSTA level 2 is grades 6-8, 3A is 9-10, 3B is 11-12. A lesson is listed against the standards its content reaches, whatever its course\'s stated grades: an 8th grader in SC 101 meets 3A standards.');
w('- **Minnesota.** Only the 2022 Mathematics CS-integrated benchmarks are mapped (the document I was given). Other subjects\' benchmarks are not.');
w('- **The teacher standards.** The 2020 *CSTA Standards for CS Teachers* describe what teachers know and do, not what students learn, so they cannot be mapped to lessons. The last section says where a teacher can build the content knowledge they name.');
w();
w('## By course');
for (const c of courses) {
  w();
  w('### ' + c.code + ' ' + c.title);
  w();
  w('| Lesson | Standards |');
  w('|---|---|');
  c.lessons.forEach((l, i) => w('| ' + (i + 1) + '. ' + (l.title || '').replace(/\|/g, '/') + ' | ' + ((l.standards || []).length ? l.standards.join(', ') : '(enrichment, no standard)') + ' |'));
}
w();
w('## By CSTA standard');
w();
w('"Also on" means the standard is practised on that page but no lesson teaches it.');
w();
w('| Standard | Lessons | Also on |');
w('|---|---|---|');
const csta = Object.keys(S.CSTA);
for (const code of csta) {
  if (!hits[code] && !supportOf[code]) continue;
  w('| **' + code + '** ' + S.CSTA[code] + ' | ' + (hits[code] || []).join(', ') + ' | ' + (supportOf[code] || []).join('; ') + ' |');
}
w();
w('## Other parts of the site');
w();
for (const s of S.SUPPORT) w('- ' + s.name + ' (' + s.note + '): ' + s.codes.join(', '));
w();
w('## CSTA standards with no lesson');
w();
const gaps = csta.filter((c) => !hits[c] && !supportOf[c]);
for (const k of Object.keys(S.CONCEPTS)) {
  const g = gaps.filter((c) => c.split('-')[1] === k);
  if (g.length) { w('**' + S.CONCEPTS[k] + '**'); w(); for (const c of g) w('- ' + c + ' (' + S.band(c) + '): ' + S.CSTA[c]); w(); }
}
const thin = csta.filter((c) => hits[c] && hits[c].length === 1);
w('Standards met by exactly one lesson (thin coverage): ' + (thin.length ? thin.join(', ') : 'none') + '.');
w();
w('## Minnesota (2022 Mathematics standards, CS-integrated benchmarks)');
w();
w('Source: *2022 Minnesota Academic Standards in Mathematics, Computer Science Learning Progressions* (Minnesota Department of Education). Minnesota has no stand-alone CS standards; this document lists the mathematics benchmarks the standards committee marked as CS-integrated, in the CSTA concepts Data and Analysis and Algorithms and Programming. It is the only Minnesota source mapped here.');
w();
w('Benchmark codes read grade.strand.standard.benchmark (9 = high school). "Taught" means a lesson teaches or practises the benchmark\'s content; "in part" means it touches part of it (the note says what is missing). Checked against the lesson text by searching it for the key terms, not by reading every lesson. Kindergarten to grade 5 benchmarks in the document are below the site\'s youngest course and are not mapped.');
w();
w('| Benchmark | Lessons | Fit |');
w('|---|---|---|');
const mnHit = S.MN.filter((b) => hits[b[0]]);
for (const b of mnHit) w('| **' + b[0] + '** ' + b[1] + ' | ' + hits[b[0]].join(', ') + ' | ' + (b[2] === 'yes' ? 'Taught. ' : 'In part. ') + b[3] + ' |');
w();
w('**Benchmarks with no lesson:**');
w();
for (const b of S.MN.filter((b) => !hits[b[0]])) w('- ' + b[0] + ' ' + b[1]);
w();
w('Most Minnesota matches are in the probability and logic strands; the site\'s lessons are programming lessons, so a math teacher should expect to use them as applications of these benchmarks, not as the teaching of them.');
w();
w('## The 2020 CSTA teacher standards (1a-1f, knowledge and skills)');
w();
w('A teacher can use the site to build, or refresh, the content knowledge named in Standard 1:');
w();
w('| Teacher standard | Where on this site |');
w('|---|---|');
w('| 1a Apply CS practices | Every course; the project lessons (SC 100 L7-8, SC 101 L13, SC 102 L11, SC 103 L11, SC 104 L13, SC 105 L8, SC 109 L8) |');
w('| 1b Apply knowledge of computing systems | SC 099, SC 108 |');
w('| 1c Model networks and the Internet | Little: SC 099 L3 touches networks; there is no networks lesson (see the gaps) |');
w('| 1d Use and analyze data | SC 109, SC 101 L9-10, SC 108 L3-4 |');
w('| 1e Develop programs and interpret algorithms | SC 100-103, 105-107; Algorithms page |');
w('| 1f Analyze impacts of computing | Real world page; SC 109 L1 and L3 stories; little else (see the gaps) |');
w();
w('Standards 2-5 (equity, professional growth, instructional design, classroom practice) are about teaching, not content. Standard 4 is where `LESSON_STANDARD.md` applies: it is the written design standard for the lessons.');

const text = out.join('\n') + '\n';
const file = path.join(root, 'STANDARDS_ALIGNMENT.md');
if (process.argv.includes('--check')) {
  if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== text) { console.error('STANDARDS_ALIGNMENT.md is out of date: run node scripts/standards-map.js'); process.exit(1); }
  console.log('STANDARDS_ALIGNMENT.md is up to date'); process.exit(0);
}
fs.writeFileSync(file, text);
console.log('wrote STANDARDS_ALIGNMENT.md (' + out.length + ' lines)');
