// Builds dist/index.html (every style and script inlined into one file) and dist/teacher-guide.html.
const fs = require('fs');
const r = p => fs.readFileSync(p, 'utf8');
const scriptSafe = s => s.replace(/<\/script/gi, '<\\/script');
const head = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<title>Short Explorations in Computer Science</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=Source+Sans+3:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<style>
${r('src/style.css')}
</style>
</head>
<body>
<div id="app"><noscript>These pages need JavaScript to run the code examples.</noscript></div>
`;
const scripts = [
  'node_modules/skulpt/dist/skulpt.min.js',
  'node_modules/skulpt/dist/skulpt-stdlib.js',
  'vendor/jscpp.min.js',
  'src/cppstep.js',
  'src/scheme.js',
  'src/subst.js',
  'src/site.js',
  'src/course_python.js',
  'src/course_lisp.js',
  'src/course_cpp.js',
  'src/course_math.js',
  'src/mathgrade.js',
  'src/app.js',
  'src/lab.js',
  'src/guide.js',
  'src/qr.js',
  'src/teach.js',
  'src/widgets.js',
  'src/portfolio.js',
  'src/classroom.js',
  'src/ojibwe.js',
  'src/about.js'
];
// Third-party code bundled into the page, with each licence text read from the installed package, so the credits
// on #/about always match what is bundled (the MIT licence asks for its notice to accompany every copy).
const pkg = (name) => JSON.parse(r('node_modules/' + name + '/package.json'));
const licenceText = (name, file) => {
  if (file) return r('node_modules/' + name + '/' + file).replace(/\r\n/g, '\n').trim();
  const m = r('node_modules/' + name + '/README.md').match(/\nLicen[cs]e\n-+\n([\s\S]*?)(\n#|\n[A-Z][^\n]*\n-+\n|$)/);
  if (!m) throw new Error('no licence text found for ' + name);
  return m[1].trim();
};
const THIRD_PARTY = [
  { name: 'Skulpt', pkg: 'skulpt', file: 'LICENSE', url: 'https://skulpt.org/', role: 'runs the Python programs' },
  { name: 'JSCPP', pkg: 'JSCPP', file: 'LICENSE', url: 'https://github.com/felixhao28/JSCPP', role: 'runs the C++ programs',
    changes: 'Changed for this site: C++-style printing of decimals, integer division that truncates, a clear division-by-zero error, a repeatable srand, and a correct strcmp (patches/jscpp-iostream.patch).' },
  { name: 'Lodash', pkg: 'lodash', file: 'LICENSE', url: 'https://lodash.com/', role: 'part of the JSCPP bundle' },
  { name: 'printf', pkg: 'printf', file: 'LICENSE', url: 'https://github.com/adaltas/node-printf', role: 'part of the JSCPP bundle' },
  { name: 'pegjs-util', pkg: 'pegjs-util', file: null, url: 'https://github.com/rse/pegjs-util', role: 'part of the JSCPP bundle' },
  { name: 'PEG.js', pkg: 'pegjs', file: 'LICENSE', url: 'https://pegjs.org/', role: 'generated the C++ parser inside JSCPP' }
].map(t => { const j = pkg(t.pkg); return { name: t.name, version: j.version, licence: j.license, url: t.url, role: t.role, changes: t.changes || '', text: licenceText(t.pkg, t.file) }; });
const BUILD = { date: new Date().toISOString().slice(0, 10), thirdParty: THIRD_PARTY };
// The same notices as a file at the repository root, for copies of the source and of dist/index.html.
fs.writeFileSync('THIRD-PARTY-NOTICES.md', '# Third-party notices\n\nThe built site (dist/index.html) and vendor/jscpp.min.js include the '
  + 'following software. Each is used under the licence reproduced here.\n'
  + THIRD_PARTY.map(t => `\n## ${t.name} ${t.version}\n\n${t.url}. ${t.role[0].toUpperCase() + t.role.slice(1)}. Licence: ${t.licence}.`
    + (t.changes ? ' ' + t.changes : '') + '\n\n```\n' + t.text + '\n```\n').join(''));
let body = `<script>/* build info and third-party licences (build.js) */\nwindow.BUILD = ${scriptSafe(JSON.stringify(BUILD))};\n</script>\n`;
for (const s of scripts) body += `<script>/* ${s} */\n${scriptSafe(r(s))}\n</script>\n`;
const html = head + body + '</body>\n</html>\n';
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/index.html', html);
console.log('wrote dist/index.html', (html.length / 1024 / 1024).toFixed(2), 'MB');
// Standalone, printable teacher guide (same content and styles, no scripts).
const guideSrc = r('src/guide.js'); const gm = guideSrc.match(/const html = `([\s\S]*?)`;/);
if (gm) {
  const guide = head.replace('<title>Short Explorations in Computer Science</title>', '<title>A guide for teachers — Short Explorations in Computer Science</title>')
    .replace('<div id="app"><noscript>These pages need JavaScript to run the code examples.</noscript></div>', '<main class="guide"><div class="g-tools"><button class="btn quiet tiny" onclick="window.print()">Print or save as PDF</button></div>' + gm[1].replace(/href="#\/([a-z]+)"/g, 'href="index.html#/$1"') + '</main>')
    + '</body>\n</html>\n';
  fs.writeFileSync('dist/teacher-guide.html', guide);
  console.log('wrote dist/teacher-guide.html', (guide.length / 1024).toFixed(0), 'KB');
}
