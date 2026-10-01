// Builds dist/index.html (every style and script inlined into one file) and dist/teacher-guide.html.
const fs = require('fs');
const crypto = require('crypto');
const r = p => fs.readFileSync(p, 'utf8');
const scriptSafe = s => s.replace(/<\/script/gi, '<\\/script');
// Content Security Policy. Every inline script is allowed by its hash, so a <script> or an onerror= handler that gets into the page
// by any route does not run; nothing may load from, or be sent to, any other origin: the typefaces are embedded in the page, so the page makes no requests at all.
// 'unsafe-eval' is there because Skulpt and JSCPP compile programs with new Function(). Inline styles are needed by the page itself.
// The typefaces (SIL Open Font License, from the @fontsource packages) are embedded as data: URIs, Latin subsets only, so the
// page needs nothing from any other site. Characters outside Latin (some mathematical symbols) fall back to the system's fonts.
const FONTS = [
  ['Newsreader', 'normal', '200 800', '@fontsource-variable/newsreader/files/newsreader-latin-opsz-normal.woff2'],
  ['Newsreader', 'italic', '200 800', '@fontsource-variable/newsreader/files/newsreader-latin-opsz-italic.woff2'],
  ['Source Sans 3', 'normal', '200 900', '@fontsource-variable/source-sans-3/files/source-sans-3-latin-wght-normal.woff2'],
  ['Source Sans 3', 'italic', '200 900', '@fontsource-variable/source-sans-3/files/source-sans-3-latin-wght-italic.woff2'],
  ['IBM Plex Mono', 'normal', '400', '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2'],
  ['IBM Plex Mono', 'normal', '500', '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2'],
  ['IBM Plex Mono', 'italic', '400', '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-italic.woff2']
];
const fontFaces = FONTS.map(([family, style, weight, file]) => `@font-face { font-family: '${family}'; font-style: ${style}; font-weight: ${weight}; font-display: swap; src: url(data:font/woff2;base64,${fs.readFileSync('node_modules/' + file).toString('base64')}) format('woff2'); }`).join('\n');
const sha = (text) => "'sha256-" + crypto.createHash('sha256').update(text, 'utf8').digest('base64') + "'";
const csp = (hashes, extra) => ["default-src 'none'", "script-src " + hashes.join(' ') + " 'unsafe-eval'", "style-src 'unsafe-inline'",
  "font-src data:", "img-src data: blob:", "connect-src 'none'", "media-src 'none'", "frame-src 'none'", "worker-src blob:",
  "object-src 'none'", "base-uri 'none'", "form-action 'none'"].concat(extra || []).join('; ');
const headFor = (hashes) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<meta http-equiv="Content-Security-Policy" content="${csp(hashes)}">
<meta name="referrer" content="no-referrer">
<title>Short Explorations in Computer Science</title>
<style>
${fontFaces}
${r('src/style.css')}
</style>
</head>
<body>
<div id="app"><noscript>These pages need JavaScript to run the code examples.</noscript></div>
`;
const scripts = [
  'src/cppstep.js',   // only render() and describe() run in the page; the program is traced in the C++ sandbox

  'src/scheme.js',
  'src/subst.js',
  'src/site.js',
  'src/course_python.js',
  'src/course_lisp.js',
  'src/course_cpp.js',
  'src/course_math.js',
  'src/mathgrade.js',
  'src/runner.js',
  'src/app.js',
  'src/lab.js',
  'src/guide.js',
  'src/qr.js',
  'src/teach.js',
  'src/backup.js',
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
    changes: 'Changed for this site: C++-style printing of decimals, integer division that truncates, a clear division-by-zero error, a repeatable srand, a correct strcmp (patches/jscpp-iostream.patch), and correct wrap-around of unsigned integers (patches/jscpp-unsigned.patch).' },
  { name: 'Lodash', pkg: 'lodash', file: 'LICENSE', url: 'https://lodash.com/', role: 'part of the JSCPP bundle' },
  { name: 'printf', pkg: 'printf', file: 'LICENSE', url: 'https://github.com/adaltas/node-printf', role: 'part of the JSCPP bundle' },
  { name: 'pegjs-util', pkg: 'pegjs-util', file: null, url: 'https://github.com/rse/pegjs-util', role: 'part of the JSCPP bundle' },
  { name: 'Newsreader', pkg: '@fontsource-variable/newsreader', file: 'LICENSE', url: 'https://github.com/productiontype/Newsreader', role: 'is the typeface for text and headings' },
  { name: 'Source Sans 3', pkg: '@fontsource-variable/source-sans-3', file: 'LICENSE', url: 'https://github.com/adobe-fonts/source-sans', role: 'is the typeface for labels and buttons' },
  { name: 'IBM Plex Mono', pkg: '@fontsource/ibm-plex-mono', file: 'LICENSE', url: 'https://github.com/IBM/plex', role: 'is the typeface for code' },
  { name: 'PEG.js', pkg: 'pegjs', file: 'LICENSE', url: 'https://pegjs.org/', role: 'generated the C++ parser inside JSCPP' }
].map(t => { const j = pkg(t.pkg); return { name: t.name, version: j.version, licence: j.license, url: t.url, role: t.role, changes: t.changes || '', text: licenceText(t.pkg, t.file) }; });
const BUILD = { date: new Date().toISOString().slice(0, 10), thirdParty: THIRD_PARTY };
// The same notices as a file at the repository root, for copies of the source and of dist/index.html.
fs.writeFileSync('THIRD-PARTY-NOTICES.md', '# Third-party notices\n\nThe built site (dist/index.html) and vendor/jscpp.min.js include the '
  + 'following software. Each is used under the licence reproduced here.\n'
  + THIRD_PARTY.map(t => `\n## ${t.name} ${t.version}\n\n${t.url}. ${t.role[0].toUpperCase() + t.role.slice(1)}. Licence: ${t.licence}.`
    + (t.changes ? ' ' + t.changes : '') + '\n\n```\n' + t.text + '\n```\n').join(''));
// The interpreters are not scripts of this page. Each sits in an inert <script type="text/plain"> block, and src/runner.js builds a
// Web Worker (or a sandboxed iframe) from its text, so Python and C++ programs run where they can reach nothing of the page.
const clean = (text) => scriptSafe(text.replace(/\r\n?/g, '\n'));   // the HTML parser turns CR and CRLF into LF, so do it here, and the hashes match
const pySrc = ['node_modules/skulpt/dist/skulpt.min.js', 'node_modules/skulpt/dist/skulpt-stdlib.js', 'src/sandbox.js', 'src/pyworker.js'].map(r).join(';\n');
const cppSrc = ['vendor/jscpp.min.js', 'src/cpputil.js', 'src/cppstep.js', 'src/cppworker.js'].map(r).join(';\n');
const bootSrc = r('src/pyboot.js');
const dataBlock = (id, text) => `<script type="text/plain" id="${id}">${clean(text)}</script>\n`;
const inline = [];   // the exact text of every inline script, for the CSP hashes
const scriptTag = (text) => { inline.push(text); return `<script>${text}</script>\n`; };
let body = scriptTag(`/* build info and third-party licences (build.js) */\nwindow.BUILD = ${scriptSafe(JSON.stringify(BUILD))};\n`);
for (const s of scripts) body += scriptTag(`/* ${s} */\n${scriptSafe(r(s))}\n`);
body += dataBlock('py-src', pySrc) + dataBlock('cpp-src', cppSrc) + dataBlock('py-boot', bootSrc);
const indexHashes = inline.map(sha).concat(sha(clean(bootSrc)));   // the last one is the script inside the sandboxed iframe (see pyboot.js)
const html = headFor(indexHashes) + body + '</body>\n</html>\n';
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/index.html', html);
console.log('wrote dist/index.html', (html.length / 1024 / 1024).toFixed(2), 'MB');
// Standalone, printable teacher guide (same content and styles, no scripts).
const guideSrc = r('src/guide.js'); const gm = guideSrc.match(/const html = `([\s\S]*?)`;/);
const guideScript = "document.getElementById('g-print').addEventListener('click', function () { window.print(); });";
const guideHashes = [sha(guideScript)];
if (gm) {
  const guide = headFor(guideHashes).replace('<title>Short Explorations in Computer Science</title>', '<title>A guide for teachers — Short Explorations in Computer Science</title>')
    .replace('<div id="app"><noscript>These pages need JavaScript to run the code examples.</noscript></div>', '<main class="guide"><div class="g-tools"><button class="btn quiet tiny" id="g-print">Print or save as PDF</button></div>' + gm[1].replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/href="#\/([a-z]+)"/g, 'href="index.html#/$1"') + '</main>')
    + '<script>' + guideScript + '</script>\n</body>\n</html>\n';
  fs.writeFileSync('dist/teacher-guide.html', guide);
  console.log('wrote dist/teacher-guide.html', (guide.length / 1024).toFixed(0), 'KB');
}

// Response headers for hosts that read a _headers file (Cloudflare Workers static assets and Pages). The same policy as the <meta>
// tags in the pages, plus the headers a <meta> cannot carry. The site is allowed to be framed, because teachers embed it in
// learning-management systems; to forbid that, add "frame-ancestors 'none'" to the policy below (csp's second argument).
const common = ['X-Content-Type-Options: nosniff', 'Referrer-Policy: no-referrer', 'Permissions-Policy: accelerometer=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()'];
const rule = (paths, hashes) => paths.map(p => p + '\n').join('') + ['Content-Security-Policy: ' + csp(hashes)].concat(common).map(h => '  ' + h + '\n').join('') + '\n';
fs.writeFileSync('dist/_headers', '# Written by build.js. Do not edit.\n' + rule(['/', '/index.html'], indexHashes) + rule(['/teacher-guide', '/teacher-guide.html'], guideHashes));
console.log('wrote dist/_headers');
