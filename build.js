// Builds dist/index.html (every style and script inlined into one file) and dist/teacher-guide.html.
const fs = require('fs');
const crypto = require('crypto');
const r = p => fs.readFileSync(p, 'utf8');
const scriptSafe = s => s.replace(/<\/script/gi, '<\\/script');
// Content Security Policy. Every inline script is allowed by its hash, so a <script> or an onerror= handler that gets into the page
// by any route does not run; nothing may load from, or be sent to, any other origin: the typefaces are embedded in the page, so the page makes no requests at all.
// connect-src 'self' is there for one purpose: the optional real-C++ compiler (see CLANG_DIR below) downloads its files from this site, once. Nothing
// else is ever requested, and nothing can be sent to another origin.
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
  "font-src data:", "img-src 'self' data: blob:", "connect-src 'self'", "media-src 'none'", "frame-src 'none'", "worker-src blob:",
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
  'src/domsafe.js',   // first: the DOM's own append() and friends skip null, undefined and false instead of printing them
  'src/cppstep.js',   // only render() and describe() run in the page; the program is traced in the C++ sandbox
  'src/javastep.js',  // the Java step-through's drawing; the program is traced in the Java sandbox (JAVA.trace)

  'src/scheme.js',
  'src/subst.js',
  'src/site.js',
  'src/course_computer.js',   // SC 099, first in the catalogue: what a computer is
  'src/course_scratch.js',
  'src/course_python.js',
  'src/course_lisp.js',
  'src/course_cpp.js',
  'src/course_math.js',
  'src/course_modern.js',
  'src/course_java.js',
  'src/course_dsa.js',
  'src/course_shell.js',
  'src/course_ml.js',      // SC 109 How Machines Learn: the first course written to LESSON_STANDARD.md
  'src/mathgrade.js',
  'src/cppfull.js',
  'src/javautil.js',
  'src/outdiff.js',    // what differs between the expected and the printed output, for an exercise's verdict (also loaded by node: test_outdiff.js)
  'src/javaproject.js', // several Java files as one program: joining and line mapping (the Lab's Run, the terminal's javac; also loaded by node)
  'src/labutil.js',    // the Code Lab's pure helpers: program arguments, error lines (also loaded by node and backup.js)
  'src/labhistory.js', // the Code Lab's file history, line diff and find in all files (also loaded by node: test_labhistory.js)
  'src/botsession.js', // a bot that stays running (Bot Arena persistent mode): the page's side of the shared-memory channel (also loaded by node)
  'src/runner.js',
  'src/parsons.js',    // Parsons problems: blocks, order, program (also loaded by node: test_course.js)
  'src/app.js',
  'src/tour.js',       // the guided tour (the Tour button in the top bar)
  'src/shell.js',      // the practice shell and its file system (also loaded by node: test_shell.js)
  'src/shellgit.js',   // the practice git, a command of that shell (also loaded by node: test_git.js)
  'src/shellwin.js',   // cmd and PowerShell over the same file system: commands of that shell (also loaded by node: test_win.js, shellgrade.js)
  'src/shellgrade.js', // the shell course's files and grader (also loaded by node: test_course.js shell)
  'src/repl.js',       // python and scheme with no file in the terminal: the interactive shells (also loaded by node: test_repl.js)
  'src/terminal.js',   // the Terminal panel of the Code Lab, in front of the shell
  'src/lab.js',
  'src/guide.js',
  'src/qr.js',
  'src/teach.js',
  'src/backup.js',
  'src/review.js',     // spaced review (#/today) and the skills map
  'src/widgets.js',
  'src/portfolio.js',
  'src/classroom.js',
  'src/ojibwe.js',
  'src/about.js',
  'src/tron.js',       // Bot Arena: the game, the referee, the built-in bots (also loaded by node: test_arena.js)
  'src/arena_bots.js', // the starter and solution bots, in each language
  'src/arena_run.js',  // how a bot is run, saved, shared
  'src/arena_view.js', // the match viewer
  'src/arena.js',      // the #/arena and #/arena/tournament pages
  'src/algos.js',      // the #/algorithms page: the frame and the shared player; the demos follow
  'src/algo_search.js',
  'src/algo_sort.js',
  'src/algo_paths.js',
  'src/algo_games.js',
  'src/algo_puzzles.js',
  'src/algo_nature.js',   // flocking, ants, sandpiles, slime moulds: simple rules, surprising patterns
  'src/algo_geometry.js', // convex hulls, the Mandelbrot set, L-system plants, Voronoi cells
  'src/algo_logic.js',    // backtracking and greedy choices: Sudoku, the eight queens, minimum spanning trees
  'src/algo_play.js',     // Reversi against Monte Carlo tree search, a genetic algorithm, Huffman coding
  'src/applied.js',    // the #/real-world page: where the ideas of the courses are used
  'src/standards.js',  // the #/standards page and the standards box under each lesson's summary
  'src/showcase.js'    // the #/showcase page: student projects from showcase/ (scripts/showcase.js reads the folders)
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
  { name: 'Clang and LLVM, as packaged by clang-wasm', pkg: '@live-codes/clang-wasm', file: 'LICENSE', url: 'https://github.com/live-codes/clang-wasm', role: 'is the real C and C++ compiler (Clang 22 built for WebAssembly), downloaded only when a student chooses Full C++ or runs C',
    extra: 'THIRD-PARTY-NOTICES.md' },
  { name: 'PEG.js', pkg: 'pegjs', file: 'LICENSE', url: 'https://pegjs.org/', role: 'generated the C++ parser inside JSCPP' }
].map(t => { const j = pkg(t.pkg); return { name: t.name, version: j.version, licence: j.license, url: t.url, role: t.role, changes: t.changes || '', text: licenceText(t.pkg, t.file) + (t.extra ? '\n\n' + licenceText(t.pkg, t.extra) : '') }; });
// Real C++ (Clang compiled to WebAssembly). Its files are not in the page: they are about 29 MB, so build.js copies them next to it, to dist/clang/<version>/,
// and the page downloads them (once; the browser keeps them) only when a student picks Full C++ or opens the Modern C++ course.
// The directory name carries the version, so the files can be cached forever (see _headers below).
const CLANG_PKG = pkg('@live-codes/clang-wasm');
const CLANG_DIR = 'clang/' + CLANG_PKG.version + '/';
const clangFiles = ['runtime-manifest.v1.json', 'bin/clang.wasm.gz', 'bin/lld.wasm.gz', 'bin/memfs.wasm.gz', 'bin/sysroot.tar.gz'].map(f => ['assets/' + f, f]).concat([['dist/clang-wasm-toolchain.global.js', 'toolchain.js'], ['LICENSE', 'LICENSE'], ['THIRD-PARTY-NOTICES.md', 'THIRD-PARTY-NOTICES.md']]);
let clangBytes = 0;
fs.rmSync('dist/clang', { recursive: true, force: true });
for (const [from, to] of clangFiles) {
  const dest = 'dist/' + CLANG_DIR + to;
  fs.mkdirSync(require('path').dirname(dest), { recursive: true });
  fs.copyFileSync('node_modules/@live-codes/clang-wasm/' + from, dest);
  clangBytes += fs.statSync(dest).size;
}
console.log('copied the real-C++ compiler to dist/' + CLANG_DIR, (clangBytes / 1024 / 1024).toFixed(1), 'MB');
// Pictures for the lessons (img/: a JPEG and a JSON of its credits each; scripts/fetch-image.js makes both). They are files next to the
// page, not data in it, so a lesson's pictures are downloaded only when it is read. The name carries a hash of the content, so a
// picture can be cached forever; the credits (title, alt text, author, licence, source) go into the page as window.BUILD.images.
const IMAGES = {};
fs.rmSync('dist/img', { recursive: true, force: true });
if (fs.existsSync('img')) {
  fs.mkdirSync('dist/img', { recursive: true });
  for (const f of fs.readdirSync('img').filter((f) => f.endsWith('.json')).sort()) {
    const meta = JSON.parse(fs.readFileSync('img/' + f, 'utf8')), data = fs.readFileSync('img/' + meta.file);
    const name = meta.id + '.' + crypto.createHash('sha256').update(data).digest('hex').slice(0, 10) + '.jpg';
    fs.writeFileSync('dist/img/' + name, data);
    IMAGES[meta.id] = { src: 'img/' + name, title: meta.title, alt: meta.alt, author: meta.author, license: meta.license, licenseUrl: meta.licenseUrl, source: meta.source, credit: meta.credit, date: meta.date || '', width: meta.width, height: meta.height };
  }
  console.log('copied', Object.keys(IMAGES).length, 'pictures to dist/img/');
}
// Language logos (img/icons/<lang>.svg + .json, from scripts/fetch-image.js --icon): a few KB each, so they go into the page as data URIs.
const ICONS = {};
if (fs.existsSync('img/icons')) for (const f of fs.readdirSync('img/icons').filter((f) => f.endsWith('.json')).sort()) {
  const meta = JSON.parse(fs.readFileSync('img/icons/' + f, 'utf8'));
  ICONS[meta.id] = { src: 'data:image/' + (meta.file.endsWith('.png') ? 'png' : 'svg+xml') + ';base64,' + fs.readFileSync('img/icons/' + meta.file).toString('base64'), title: meta.title, author: meta.author, license: meta.license, licenseUrl: meta.licenseUrl, source: meta.source, credit: meta.credit };
}
// Student Showcase: showcase/<slug>/ folders (see showcase/README.md). A folder that breaks a rule fails the build, so a project
// never goes live without its consent line, and never carries more than the page shows.
const SHOWCASE = require('./scripts/showcase.js').load('showcase');
if (SHOWCASE.errors.length) { console.error('Student Showcase:\n  ' + SHOWCASE.errors.join('\n  ')); process.exit(1); }
for (const s of SHOWCASE.skipped) console.log('showcase: left out', s);
console.log('showcase:', SHOWCASE.projects.length, 'project(s)');
const BUILD = { showcase: SHOWCASE.projects, date: new Date().toISOString().slice(0, 10), thirdParty: THIRD_PARTY, images: IMAGES, icons: ICONS, clang: { path: CLANG_DIR, mb: Math.round(clangBytes / 1024 / 1024), llvm: CLANG_PKG.version,
  // The page checks the compiler script it downloads against this before running it. (The script then checks every compiler file it fetches against hashes it carries.)
  sha256: crypto.createHash('sha256').update(fs.readFileSync('dist/' + CLANG_DIR + 'toolchain.js')).digest('hex') } };
// The same notices as a file at the repository root, for copies of the source and of dist/index.html.
fs.writeFileSync('THIRD-PARTY-NOTICES.md', '# Third-party notices\n\nThe built site (dist/index.html) and vendor/jscpp.min.js include the '
  + 'following software. Each is used under the licence reproduced here.\n'
  + THIRD_PARTY.map(t => `\n## ${t.name} ${t.version}\n\n${t.url}. ${t.role[0].toUpperCase() + t.role.slice(1)}. Licence: ${t.licence}.`
    + (t.changes ? ' ' + t.changes : '') + '\n\n```\n' + t.text + '\n```\n').join(''));
// The interpreters are not scripts of this page. Each sits in an inert <script type="text/plain"> block, and src/runner.js builds a
// Web Worker (or a sandboxed iframe) from its text, so Python, C++ and Java programs run where they can reach nothing of the page.
const clean = (text) => scriptSafe(text.replace(/\r\n?/g, '\n'));   // the HTML parser turns CR and CRLF into LF, so do it here, and the hashes match
// (Skulpt looks at importScripts to learn what kind of place it is running in, so for Python the lockdown comes just after Skulpt loads.)
const WS = require('./scripts/worker-sources.js');   // which files make each worker (test_arena.js uses the same list)
const pySrc = WS.py.map(r).join(';\n');
const cppSrc = WS.cpp.map(r).join(';\n');
const javaSrc = WS.java.map(r).join(';\n');
const schemeSrc = WS.scheme.map(r).join(';\n');   // Scheme runs in the page, except for a Bot Arena bot that stays running between turns
const bootSrc = r('src/pyboot.js');
const clangSrc = r('src/clangworker.js');   // the toolchain itself is downloaded (see CLANG_DIR); only this glue is in the page
const dataBlock = (id, text) => `<script type="text/plain" id="${id}">${clean(text)}</script>\n`;
const inline = [];   // the exact text of every inline script, for the CSP hashes
const scriptTag = (text) => { inline.push(text); return `<script>${text}</script>\n`; };
let body = scriptTag(`/* build info and third-party licences (build.js) */\nwindow.BUILD = ${scriptSafe(JSON.stringify(BUILD))};\n`);
// All of the site's own scripts go into ONE inline <script>, so the policy carries one hash for them. (One hash per file put the
// Content-Security-Policy line of dist/_headers past the 2000 characters Cloudflare allows for a line of that file, and the deploy failed.)
// The files are joined with a semicolon between them, so a file that ends in `})()` cannot call the next file's opening parenthesis.
body += scriptTag(scripts.map((s) => `/* ${s} */\n${scriptSafe(r(s))}\n`).join(';\n'));
body += dataBlock('py-src', pySrc) + dataBlock('cpp-src', cppSrc) + dataBlock('java-src', javaSrc) + dataBlock('scheme-src', schemeSrc) + dataBlock('py-boot', bootSrc) + dataBlock('clang-src', clangSrc);
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
// The main page is also cross-origin isolated (COOP and COEP), which a SharedArrayBuffer needs: the Bot Arena's persistent mode shares memory with a worker
// so that a bot can wait for its next turn (written as one rule for "/*", below). The page loads nothing from any other origin (see the policy), so COEP require-corp costs it nothing. In a frame
// of another site, or opened from a file, the page is not isolated, and persistent mode says so and is off.
const isolation = ['Cross-Origin-Opener-Policy: same-origin', 'Cross-Origin-Embedder-Policy: require-corp'];
const rule = (paths, hashes, extra) => paths.map(p => p + '\n').join('') + ['Content-Security-Policy: ' + csp(hashes)].concat(common, extra || []).map(h => '  ' + h + '\n').join('') + '\n';
const immutable = ['/' + CLANG_DIR + '*', '/img/*'].map((p) => p + '\n  Cache-Control: public, max-age=31536000, immutable\n  X-Content-Type-Options: nosniff\n\n').join('');
// Cloudflare serves the page at "/" from index.html, and a rule written for "/" or "/index.html" is not applied to that response (a request for /index.html only gets
// a redirect to "/", which carries the headers: the document itself does not), so the isolation headers are on "/*", which matches "/" too. They do no harm to the other
// files (every page and file here is same-origin). The policy above stays in the page's <meta> as well, which is what applies at "/".
const isolationRule = '/*\n' + isolation.map(h => '  ' + h + '\n').join('') + '\n';
const headersText = '# Written by build.js. Do not edit.\n' + immutable + isolationRule + rule(['/', '/index.html'], indexHashes) + rule(['/teacher-guide', '/teacher-guide.html'], guideHashes);
const longLine = headersText.split('\n').findIndex((l) => l.length > 2000);
if (longLine >= 0) throw new Error('dist/_headers line ' + (longLine + 1) + ' is ' + headersText.split('\n')[longLine].length + ' characters; Cloudflare refuses lines over 2000');
fs.writeFileSync('dist/_headers', headersText);
console.log('wrote dist/_headers');
