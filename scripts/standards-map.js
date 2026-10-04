#!/usr/bin/env node
// Builds STANDARDS_ALIGNMENT.md: which lessons address which CSTA K-12 CS Standards (2017).
// The data is below; the reverse index and the gap list are computed from it.
//   node scripts/standards-map.js          writes STANDARDS_ALIGNMENT.md
//   node scripts/standards-map.js --check  fails if a code is unknown or a lesson count no longer matches src/course_*.js
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

// Short labels (paraphrased, not the official wording). Check the exact text at https://csteachers.org/k12standards/
const STD = {
  '2-CS-01': 'Recommend improvements to device design from how users interact',
  '2-CS-02': 'Design projects combining hardware and software to collect and exchange data',
  '2-CS-03': 'Systematically identify and fix problems with computing devices',
  '2-NI-04': 'Model the role of protocols in sending data across networks',
  '2-NI-05': 'Explain how physical and digital security protect information',
  '2-NI-06': 'Apply several methods of information protection and model how well each works',
  '2-DA-07': 'Represent data using multiple encoding schemes',
  '2-DA-08': 'Collect data with computational tools and transform it',
  '2-DA-09': 'Refine computational models based on the data they generate',
  '2-AP-10': 'Use flowcharts or pseudocode to express algorithms',
  '2-AP-11': 'Create clearly named variables of different data types and operate on them',
  '2-AP-12': 'Design programs combining control structures (nested loops, compound conditionals)',
  '2-AP-13': 'Decompose problems into parts',
  '2-AP-14': 'Create procedures with parameters to organize and reuse code',
  '2-AP-15': 'Seek and use feedback from teammates and users',
  '2-AP-16': 'Incorporate existing code, media and libraries, with attribution',
  '2-AP-17': 'Systematically test and refine programs with a range of test cases',
  '2-AP-18': 'Distribute tasks and keep a timeline when collaborating',
  '2-AP-19': 'Document programs so they are easier to follow, test and debug',
  '2-IC-20': 'Compare tradeoffs of computing technologies in everyday life and careers',
  '2-IC-21': 'Discuss bias and accessibility in the design of technologies',
  '2-IC-22': 'Collaborate with many contributors on a computational artifact',
  '2-IC-23': 'Describe tradeoffs between public and private/secure information',
  '3A-CS-01': 'Explain how abstractions hide implementation details of computing systems',
  '3A-CS-02': 'Compare levels of abstraction: application software, system software, hardware',
  '3A-CS-03': 'Develop guidelines for systematic troubleshooting',
  '3A-NI-04': 'Evaluate scalability and reliability of networks (routers, switches, servers, topology, addressing)',
  '3A-NI-05': 'Give examples of how malware and attacks affect sensitive data',
  '3A-NI-06': 'Recommend security measures for scenarios (efficiency, feasibility, ethics)',
  '3A-NI-07': 'Compare security measures and the usability/security tradeoff',
  '3A-NI-08': 'Explain tradeoffs in selecting cybersecurity recommendations',
  '3A-DA-09': 'Translate between bit representations of characters, numbers, images',
  '3A-DA-10': 'Evaluate tradeoffs in how data is organized and where it is stored',
  '3A-DA-11': 'Create interactive data visualizations',
  '3A-DA-12': 'Create computational models of relationships among data elements',
  '3A-AP-13': 'Create prototypes that use algorithms to solve problems',
  '3A-AP-14': 'Use lists to simplify solutions instead of many simple variables',
  '3A-AP-15': 'Justify the choice of control structures and discuss tradeoffs',
  '3A-AP-16': 'Develop artifacts that use events to start instructions',
  '3A-AP-17': 'Decompose problems using procedures, modules and/or objects',
  '3A-AP-18': 'Build artifacts from procedures, data+procedures, or interrelated programs',
  '3A-AP-19': 'Design and develop programs for broad audiences using user feedback',
  '3A-AP-20': 'Evaluate licenses that limit use of computational artifacts',
  '3A-AP-21': 'Evaluate and refine artifacts to make them more usable and accessible',
  '3A-AP-22': 'Work in team roles using collaborative tools',
  '3A-AP-23': 'Document design decisions in text, graphics, presentations or demonstrations',
  '3A-IC-24': 'Evaluate how computing affects personal, ethical, social, economic, cultural practices',
  '3A-IC-25': 'Test and refine artifacts to reduce bias and equity deficits',
  '3A-IC-26': 'Show how an algorithm applies to problems across disciplines',
  '3A-IC-27': 'Use collaboration tools to connect people across cultures and fields',
  '3A-IC-28': 'Explain effects of intellectual property laws on innovation',
  '3A-IC-29': 'Explain privacy concerns of automated data collection',
  '3B-CS-01': 'Categorize the roles of operating system software',
  '3B-CS-02': 'Illustrate how hardware implements logic, input and output',
  '3B-NI-03': 'Describe issues that affect network functionality',
  '3B-NI-04': 'Compare ways developers protect devices and information from unauthorized access',
  '3B-DA-05': 'Use data analysis tools to find patterns in data from complex systems',
  '3B-DA-06': 'Select data collection tools to build data sets that support a claim',
  '3B-DA-07': 'Evaluate how well models and simulations test and refine hypotheses',
  '3B-AP-08': 'Describe how artificial intelligence drives software and physical systems',
  '3B-AP-09': 'Implement an AI algorithm to play a game or solve a problem',
  '3B-AP-10': 'Use and adapt classic algorithms',
  '3B-AP-11': 'Evaluate algorithms for efficiency, correctness and clarity',
  '3B-AP-12': 'Compare and contrast fundamental data structures and their uses',
  '3B-AP-13': 'Illustrate the flow of execution of a recursive algorithm',
  '3B-AP-14': 'Construct solutions from student-created procedures, modules, objects',
  '3B-AP-15': 'Analyze a large problem and find generalizable patterns',
  '3B-AP-16': 'Demonstrate code reuse with libraries and APIs',
  '3B-AP-17': 'Plan and develop programs for broad audiences with a software development process',
  '3B-AP-18': 'Explain security issues that can compromise programs',
  '3B-AP-20': 'Use version control, IDEs and collaborative tools in a group project',
  '3B-AP-21': 'Develop test cases to verify a program meets its specification',
  '3B-AP-22': 'Modify an existing program to add functionality and discuss implications',
  '3B-AP-23': 'Evaluate key qualities of a program through code review',
};
// Left out because I could not vouch for their numbering or wording: 3B-AP-19 and the four 3B-IC standards (named in the report).

const UNVERIFIED = new Set(['3B-AP-19', '3B-IC-24', '3B-IC-25', '3B-IC-26', '3B-IC-27']);

// course id -> { code, lessons: { n: [codes] }, enrich: [lesson numbers with no CSTA standard] }
const MAP = {
  computer: { code: 'SC 099', title: 'What Is a Computer?', lessons: {
    1: ['2-CS-02', '3A-CS-01'], 2: ['3B-CS-02', '2-DA-07', '3A-DA-09'], 3: ['2-CS-02', '3A-DA-10', '3B-CS-01'], 4: ['3A-CS-01', '3A-CS-02', '3B-CS-01'] } },
  scratch: { code: 'SC 100', title: 'From Scratch to Python', lessons: {
    1: ['2-AP-10', '2-AP-11'], 2: ['2-AP-11'], 3: ['2-AP-12'], 4: ['2-AP-12'], 5: ['2-AP-11', '3A-AP-14'], 6: ['2-AP-14', '2-AP-19'],
    7: ['2-AP-12', '2-AP-13', '2-AP-15', '2-AP-17'], 8: ['2-AP-12', '2-AP-14', '2-AP-16'], 9: ['2-AP-11'] } },
  python: { code: 'SC 101', title: 'Introduction to Python', lessons: {
    1: ['2-AP-11'], 2: ['2-AP-12', '2-AP-17'], 3: ['2-AP-12', '3A-AP-15'], 4: ['2-AP-12', '3A-AP-15'], 5: ['3A-AP-14', '3A-DA-10', '3B-AP-12'],
    6: ['2-AP-11', '3A-AP-14'], 7: ['2-AP-13', '2-AP-14', '2-AP-19', '3A-AP-17', '3A-AP-18', '3B-AP-14'], 8: ['2-AP-17', '3A-CS-03'],
    9: ['3A-AP-14', '3A-DA-10', '3B-AP-12'], 10: ['2-AP-16', '2-DA-09', '3A-DA-12', '3B-DA-07'], 11: ['3B-AP-10', '3B-AP-13'],
    12: ['3B-AP-10', '3B-AP-11'], 13: ['2-NI-06', '3A-AP-13', '3A-DA-09', '3B-DA-05'] } },
  lisp: { code: 'SC 102', title: 'Introduction to Lisp', lessons: {
    1: ['3A-CS-02'], 2: ['3A-CS-01', '3A-AP-17', '3A-AP-18'], 3: ['3A-AP-15'], 4: ['3B-AP-13'], 5: ['3B-AP-11', '3B-AP-13'], 6: ['3B-AP-12'],
    7: ['3B-AP-12', '3B-AP-13'], 8: ['3A-AP-17', '3B-AP-14'], 9: ['3B-AP-10', '3B-AP-14'], 10: ['3B-AP-12'], 11: ['3B-AP-14', '3B-AP-15'] } },
  cpp: { code: 'SC 103', title: 'Introduction to C++', lessons: {
    1: ['2-AP-11', '3A-CS-02'], 2: ['2-AP-12', '3A-AP-15'], 3: ['2-AP-12', '3A-AP-15'], 4: ['2-AP-14', '3A-AP-17', '3A-AP-18'], 5: ['3A-CS-02', '3B-AP-12'],
    6: ['3A-AP-14', '3B-AP-12', '3B-AP-18'], 7: ['3A-DA-09', '3B-AP-12'], 8: ['2-AP-17', '3A-CS-03', '3B-AP-18'], 9: ['2-DA-09', '3A-DA-12', '3B-DA-07'],
    10: ['3B-AP-10', '3B-AP-11'], 11: ['3B-AP-10', '3B-AP-11'] } },
  math: { code: 'SC 104', title: 'Mathematics of Computing', lessons: {
    1: ['2-AP-12', '3B-CS-02'], 2: ['3B-AP-12'], 3: ['3B-AP-11', '3B-AP-13'], 4: ['3B-AP-10', '3B-AP-11'], 5: ['3A-DA-12', '3B-AP-12'], 6: ['3A-DA-12', '3B-CS-02'],
    7: ['3A-IC-24', '3B-DA-05'], 8: [], 9: [], 10: [], 11: ['3B-AP-11'], 12: ['3B-AP-11'], 13: ['2-NI-06', '3A-NI-06', '3B-AP-10', '3B-NI-04'] },
    enrich: 'Lessons 8-10 (limits of finite memory, the universal machine, what no program can do) are theory beyond the CSTA standards.' },
  modern: { code: 'SC 105', title: 'Modern C++', lessons: {
    1: ['3B-AP-12', '3B-AP-16'], 2: ['3A-AP-14', '3B-AP-12', '3B-AP-16'], 3: ['3A-AP-17', '3A-CS-01'], 4: ['3A-AP-17', '3A-AP-18', '3B-AP-14'],
    5: ['3A-AP-17', '3B-AP-14', '3A-CS-01'], 6: ['3B-AP-10', '3B-AP-16'], 7: ['3A-DA-10', '3B-AP-12'], 8: ['3A-AP-13', '3B-AP-14'] } },
  java: { code: 'SC 106', title: 'Introduction to Java', lessons: {
    1: ['2-AP-11', '3A-CS-02'], 2: ['2-AP-12', '3A-AP-15'], 3: ['2-AP-12', '3A-AP-15'], 4: ['2-AP-14', '3A-AP-17', '3A-AP-18'], 5: ['3A-AP-14', '3B-AP-12'],
    6: ['2-AP-11', '3B-AP-16'], 7: ['3A-AP-14', '3B-AP-12', '3B-AP-16'], 8: ['3A-CS-01', '3A-AP-17', '3B-AP-14'] } },
  dsa: { code: 'SC 107', title: 'Data Structures and Algorithms', lessons: {
    1: ['3A-DA-10', '3B-AP-11', '3B-AP-12'], 2: ['3B-AP-10', '3B-AP-11'], 3: ['3B-AP-10', '3B-AP-11'], 4: ['3B-AP-10', '3B-AP-11', '3B-AP-13', '3B-AP-15'],
    5: ['3A-DA-10', '3B-AP-12'], 6: ['3B-AP-12'], 7: ['3B-AP-13'] } },
  shell: { code: 'SC 108', title: 'The Command Line', lessons: {
    1: ['3A-CS-02', '3B-CS-01'], 2: ['3A-DA-10', '3B-CS-01'], 3: ['2-DA-08', '3B-DA-05'], 4: ['3A-AP-18', '3A-CS-02', '3B-DA-05'] } },
  ml: { code: 'SC 109', title: 'How Machines Learn', lessons: {
    1: ['3A-DA-12', '3B-AP-08'], 2: ['3A-DA-12', '3B-AP-09', '3B-DA-05'], 3: ['3B-AP-11', '3B-DA-07'], 4: ['3B-AP-08', '3B-DA-07'],
    5: ['3B-AP-08', '3B-AP-09'], 6: ['2-DA-09', '3A-DA-12', '3B-AP-09'], 7: ['3B-AP-09', '3B-AP-12', '3B-DA-05'], 8: ['3B-AP-08', '3B-AP-09'] } },
};

// Parts of the site that are not courses. Marked "supporting": the standard is practised there but no lesson teaches it.
const SITE = [
  ['Algorithms (#/algorithms, 17 demos: sorting race, searching, paths, games, puzzles)', ['3B-AP-10', '3B-AP-11', '3A-IC-26']],
  ['Bot Arena (#/arena: Tron bots in Python, Java, C++ and Scheme)', ['3B-AP-09', '3A-AP-13']],
  ['Real world (#/real-world: 30 topics, 147 examples by field)', ['3A-IC-24', '3A-IC-26']],
  ['Code Lab (#/lab)', ['2-AP-17', '3A-AP-21']],
];

// Minnesota 2022 Mathematics CS-integrated benchmarks, grades 6-12 (from the MDE learning-progression PDF), with the lessons that meet them.
const MN = [
  ['6.1.2.3', 'Experimental probability from experiments where the theoretical probability is known; predict', ['SC 101 L10', 'SC 103 L9'], 'Yes: simulations compared with the exact probability (dice, birthday problem)'],
  ['7.1.2.2', 'Approximate a probability from long-run frequency', ['SC 101 L10', 'SC 103 L9'], 'Yes: "try it thousands of times"'],
  ['7.1.2.5', 'Design and use a simulation in a computational tool for compound events', ['SC 101 L10', 'SC 103 L9'], 'Partial: simulations of single dice and the birthday problem; no two-dice or other compound-event simulation'],
  ['7.1.2.6', 'Probabilities of compound events by lists, tables, trees or computational simulation', ['SC 101 L10'], 'Partial: simulation yes; no tree diagrams or organized-list method'],
  ['7.1.2.4', 'Sample spaces for compound events by decomposing them', ['SC 104 L2'], 'Partial: counting rules, not sample spaces named as such'],
  ['9.1.2.2', 'Events as subsets; Venn diagrams; unions, intersections, complements', ['SC 104 L2'], 'Partial: sets, Venn diagrams, union and complement are taught, but not framed as events'],
  ['9.2.4.5', 'if-then, converse, inverse, contrapositive', ['SC 104 L1'], 'Yes'],
  ['9.2.4.6', 'Validity of a logical argument; counterexamples', ['SC 104 L1', 'SC 104 L3'], 'Yes'],
  ['9.2.4.7', 'Construct logical arguments from definitions and theorems', ['SC 104 L2', 'SC 104 L3', 'SC 104 L4'], 'Yes: proofs, including induction and Euclid\'s algorithm'],
  ['9.3.7.4', 'Sequences defined recursively and by an explicit formula', ['SC 101 L11'], 'Partial: recursive definitions (Fibonacci, factorial); no arithmetic or geometric sequences with explicit formulas'],
  ['7.3.6.3', 'Evaluate algebraic expressions applying the order of operations', ['SC 101 L1'], 'Partial: arithmetic expressions and precedence; not algebraic expressions with exponents and absolute value as such'],
  ['8.1.1.4', 'Use a linear model; interpret the slope', ['SC 109 L6'], 'Partial: fits y = w x by minimizing squared error and reads the slope; no intercept, no bivariate data in context'],
  ['9.1.1.11', 'Statistical models with linear functions, including regression; judge fit', ['SC 109 L6'], 'Partial: fitting a line and measuring error; no residuals or correlation coefficient'],
  ['9.1.1.15', 'Identify and explain misleading uses of data', ['SC 109 L3'], 'Partial: accuracy misleads when labels are rare; not about distorted displays'],
];
const MN_NONE = [
  '6.1.1.2 design investigations and gather data', '6.1.1.4, 7.1.1.5, 8.1.1.5 create data visualizations (the lessons show visualizations; students do not make them)', '8.1.1.6 competing explanations for trends, correlation versus causation',
  '8.3.7.2 and 8.3.7.5 linear patterns, effect of m and b', '8.3.6.9 and 9.3.7.1 systems of equations', '9.1.1.8 inferences from random samples', '9.1.2.3 conditional probability and independence',
  '9.2.3.4, 6.2.3.1, 6.2.3.2 and 6.2.4.2 decomposition in geometry', '9.2.4.14 transformations', '9.3.5.4 matrices', '9.3.7.8 compound interest',
];

const order = ['computer', 'scratch', 'python', 'lisp', 'cpp', 'math', 'modern', 'java', 'dsa', 'shell', 'ml'];
const known = (c) => STD[c] && !UNVERIFIED.has(c);
const problems = [];

// Lesson counts from the sources.
global.window = { COURSES: [], BUILD: {} };
for (const f of fs.readdirSync(path.join(root, 'src')).filter((f) => /^course_.*\.js$/.test(f))) {
  new Function('window', fs.readFileSync(path.join(root, 'src', f), 'utf8'))(global.window);
}
const courses = Object.fromEntries(global.window.COURSES.map((c) => [c.id, c]));
for (const id of order) {
  const m = MAP[id], c = courses[id];
  if (!c) { problems.push('no course ' + id); continue; }
  if (Object.keys(m.lessons).length !== c.lessons.length) problems.push(id + ': map has ' + Object.keys(m.lessons).length + ' lessons, course has ' + c.lessons.length);
  for (const [n, codes] of Object.entries(m.lessons)) for (const code of codes) if (!known(code)) problems.push(id + ' L' + n + ': unknown code ' + code);
}
for (const [, codes] of SITE) for (const code of codes) if (!known(code)) problems.push('site: unknown code ' + code);
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
if (process.argv.includes('--check')) { console.log('standards map consistent'); process.exit(0); }

const band = (code) => (code[0] === '2' ? 'Grades 6-8' : code.startsWith('3A') ? 'Grades 9-10' : 'Grades 11-12');
const lessonRef = (id, n) => MAP[id].code + ' L' + n;
const rev = {};
for (const id of order) for (const [n, codes] of Object.entries(MAP[id].lessons)) for (const code of codes) (rev[code] = rev[code] || []).push(lessonRef(id, n));
const siteRev = {};
for (const [name, codes] of SITE) for (const code of codes) (siteRev[code] = siteRev[code] || []).push(name.split(' (')[0]);

const out = [];
const w = (s) => out.push(s === undefined ? '' : s);
w('# Standards alignment');
w();
w('Which lessons address which standards. **Generated** by `node scripts/standards-map.js` from the data in that file; edit the data, not this page.');
w();
w('## Read this first');
w();
w('- **Method.** Each lesson was mapped from its title, its summary and the skills it teaches, not by re-reading every paragraph. A lesson is listed under a standard when it *teaches or practises* it, not when it merely mentions it. Treat the map as a first draft for a teacher to confirm.');
w('- **CSTA wording.** The standard names below are short paraphrases written from memory of the 2017 CSTA K-12 CS Standards, so codes should be checked against the official list at <https://csteachers.org/k12standards/> before the table is quoted to anyone (a district, a grant). Five codes whose numbering I could not vouch for were left out (3B-AP-19, 3B-IC-24 to 27); see "Not mapped".');
w('- **Grade bands.** CSTA level 2 is grades 6-8, 3A is 9-10, 3B is 11-12. A course is listed against the standards its content reaches, whatever its stated grades: an 8th grader in SC 101 meets 3A standards.');
w('- **The teacher standards.** The 2020 *CSTA Standards for CS Teachers* describe what teachers know and do, not what students learn, so they cannot be mapped to lessons. The last section says where a teacher can build the content knowledge they name.');
w('- **Minnesota.** Only the 2022 Mathematics CS-integrated benchmarks are mapped (the document I was given). See the Minnesota section.');
w();
w('## By course');
for (const id of order) {
  const m = MAP[id], c = courses[id];
  w();
  w('### ' + m.code + ' ' + m.title);
  w();
  w('| Lesson | CSTA standards |');
  w('|---|---|');
  c.lessons.forEach((l, i) => {
    const codes = m.lessons[i + 1];
    w('| ' + (i + 1) + '. ' + (l.title || '').replace(/\|/g, '/') + ' | ' + (codes.length ? codes.join(', ') : '(enrichment, no CSTA standard)') + ' |');
  });
  if (m.enrich) { w(); w(m.enrich); }
}
w();
w('## By standard');
w();
w('Lessons that address each standard. "Supporting" means the standard is practised on that page but no lesson teaches it.');
w();
w('| Standard | Lessons | Supporting |');
w('|---|---|---|');
const codes = Object.keys(STD).filter(known);
for (const code of codes) {
  if (!rev[code] && !siteRev[code]) continue;
  w('| **' + code + '** ' + STD[code] + ' | ' + (rev[code] ? rev[code].join(', ') : '') + ' | ' + (siteRev[code] ? siteRev[code].join('; ') : '') + ' |');
}
w();
w('## Other parts of the site');
w();
for (const [name, cs] of SITE) w('- ' + name + ': ' + cs.join(', '));
w();
w('## Not mapped (gaps)');
w();
w('No lesson addresses these. Grouped so a gap reads as a topic.');
w();
const gaps = codes.filter((c) => !rev[c] && !siteRev[c]);
const topics = { CS: 'Computing systems', NI: 'Networks and the Internet', DA: 'Data and analysis', AP: 'Algorithms and programming', IC: 'Impacts of computing' };
for (const t of Object.keys(topics)) {
  const g = gaps.filter((c) => c.split('-')[1] === t);
  if (g.length) { w('**' + topics[t] + '**'); w(); for (const c of g) w('- ' + c + ' (' + band(c) + '): ' + STD[c]); w(); }
}
const weak = codes.filter((c) => rev[c] && rev[c].length === 1);
w('Standards met by exactly one lesson (thin coverage): ' + (weak.length ? weak.join(', ') : 'none') + '.');
w();
w('## Minnesota (2022 Mathematics standards, CS-integrated benchmarks)');
w();
w('Source: *2022 Minnesota Academic Standards in Mathematics, Computer Science Learning Progressions* (Minnesota Department of Education). Minnesota has no stand-alone CS standards; this document lists the mathematics benchmarks the standards committee marked "#" as CS-integrated, in the CSTA concepts Data and Analysis and Algorithms and Programming. It is the only Minnesota source mapped here: the CS-integrated benchmarks of other subjects (science and so on) are not in it, so they are not mapped.');
w();
w('Benchmark codes read grade.strand.standard.benchmark (9 = high school). "Yes" means a lesson teaches or practises the benchmark\'s content; "partial" means it touches part of it (what is missing is in the note). Checked against the lesson text by searching it for the key terms, not by reading every lesson.');
w();
w('| Benchmark | Lessons | Fit |');
w('|---|---|---|');
for (const b of MN) w('| **' + b[0] + '** ' + b[1] + ' | ' + b[2].join(', ') + ' | ' + b[3] + ' |');
w();
w('**Benchmarks with no lesson** (grades 6-12 in the progression): ' + MN_NONE.join('; ') + '.');
w();
w('**Out of range:** the kindergarten to grade 5 benchmarks in the document (0.x to 5.x) are below the site\'s youngest course (SC 100, grades 5-8) and are not mapped.');
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
w('| 1c Model networks and the Internet | Little: SC 099 L3 touches networks; there is no networks lesson (see gaps) |');
w('| 1d Use and analyze data | SC 109, SC 101 L9-10, SC 108 L3-4 |');
w('| 1e Develop programs and interpret algorithms | SC 100-103, 105-107; Algorithms page |');
w('| 1f Analyze impacts of computing | Real world page; SC 109 L1 and L3 stories; little else (see gaps) |');
w();
w('Standards 2-5 (equity, professional growth, instructional design, classroom practice) are about teaching, not content. Standard 4 is where `LESSON_STANDARD.md` applies: it is the written design standard for the lessons.');
fs.writeFileSync(path.join(root, 'STANDARDS_ALIGNMENT.md'), out.join('\n') + '\n');
console.log('wrote STANDARDS_ALIGNMENT.md (' + out.length + ' lines)');
