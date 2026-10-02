// The lesson linter: the house style of CLAUDE.md ("Lesson text style") and the rules that protect students' saved work, checked on
// every course instead of remembered. Errors fail the run; warnings are printed.
//
//   node test_lessons.js            check every course
//   node test_lessons.js --update   also record new exercise ids in lint/exercise-ids.txt (ids are never renumbered or removed)
'use strict';
const fs = require('fs'), path = require('path');
global.window = global;
const FILES = ['computer', 'scratch', 'python', 'lisp', 'cpp', 'math', 'modern', 'java', 'dsa', 'shell'];
const ID_PREFIX = { computer: 'cs', scratch: 'sp', python: 'py', lisp: 'ls', cpp: 'cp', math: 'ma', modern: 'mc', java: 'jv', dsa: 'ds', shell: 'sh' };
const IDS_FILE = path.join(__dirname, 'lint/exercise-ids.txt');
let errors = 0, warnings = 0;
const err = (where, msg) => { errors++; console.log('ERROR ' + where + ': ' + msg); };
const warn = (where, msg) => { warnings++; console.log('warn  ' + where + ': ' + msg); };
const text = (html) => html.replace(/<pre[\s\S]*?<\/pre>/g, ' ').replace(/<code>[\s\S]*?<\/code>/g, 'code').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;|&#\d+;/g, ' ');

// ---- HTML: every tag that is opened is closed, in order (a lost </code> turns the rest of a lesson into code)
const VOID = new Set(['br', 'hr', 'img', 'input', 'wbr', 'col', 'source']);
// a name that is not an HTML element is text the browser swallows: #include <ctime> in a caption shows as "#include "; write &lt;ctime&gt;
const TAGS = new Set([...VOID, 'p', 'b', 'i', 'em', 'strong', 'code', 'pre', 'span', 'div', 'a', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'sup', 'sub', 'details', 'summary', 'kbd', 'small', 'blockquote', 'figure', 'figcaption', 'dl', 'dt', 'dd', 'mark', 's', 'u', 'q', 'cite', 'abbr', 'var', 'samp', 'svg', 'path', 'circle', 'rect', 'line', 'text', 'g', 'polygon', 'polyline', 'ellipse', 'caption', 'colgroup', 'section', 'aside', 'nav', 'header', 'footer']);
function checkHtml(where, html) {
  const stack = [];
  for (const m of html.replace(/<pre[\s\S]*?<\/pre>/g, '').matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g)) {
    const [, close, tag0, selfClose] = m, tag = tag0.toLowerCase();
    if (!TAGS.has(tag)) { err(where, 'HTML: <' + (close ? '/' : '') + tag0 + '> is not an HTML element, so the browser hides it: write &lt;' + tag0 + '&gt;'); continue; }
    if (VOID.has(tag) || selfClose) continue;
    if (!close) { stack.push(tag); continue; }
    if (stack[stack.length - 1] === tag) { stack.pop(); continue; }
    return err(where, 'HTML: </' + tag + '> closes <' + (stack[stack.length - 1] || 'nothing') + '> (near "' + html.slice(Math.max(0, m.index - 40), m.index + 10).replace(/\s+/g, ' ') + '")');
  }
  if (stack.length) err(where, 'HTML: <' + stack.join('>, <') + '> never closed');
}

// ---- reading level (Flesch-Kincaid grade), for the course written for ages 10-13
const syllables = (w) => { w = w.toLowerCase().replace(/[^a-z]/g, ''); if (!w) return 0; if (w.length <= 3) return 1; w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, ''); const m = w.match(/[aeiouy]{1,2}/g); return Math.max(1, m ? m.length : 1); };
function fkGrade(prose) {
  const sentences = prose.split(/[.!?]+(?=\s|$)/).map((s) => s.trim()).filter((s) => /[a-zA-Z]/.test(s));
  const words = prose.split(/\s+/).filter((w) => /[a-zA-Z]/.test(w));
  if (sentences.length < 3 || words.length < 30) return null;
  const syl = words.reduce((a, w) => a + syllables(w), 0);
  return { grade: 0.39 * words.length / sentences.length + 11.8 * syl / words.length - 15.59, wps: words.length / sentences.length };
}

// ---- a newline inside a string literal of a Java or C++ example (in a template literal, \n must be written \\n)
function brokenString(code) {
  for (const [i, line] of code.split('\n').entries()) {
    const l = line.replace(/\/\/.*$/, '').replace(/'(\\.|[^'\\])'/g, "''").replace(/\\./g, '');
    if ((l.match(/"/g) || []).length % 2) return i + 1;
  }
  return 0;
}

const allIds = new Map();
// ---- pictures: img/<id>.json (made by scripts/fetch-image.js) beside img/<id>.jpg
const IMG_DIR = path.join(__dirname, 'img'), pictures = new Map(), usedPictures = new Set();
const LICENCE_OK = (l) => /^(public domain|pd\b|pd-|cc0|cc[ -]by(-sa)?[ -]\d(\.\d)?|cc[ -]by(-sa)?$)/i.test(String(l || '').trim()) && !/\b(nc|nd)\b/i.test(l);
if (fs.existsSync(IMG_DIR)) for (const f of fs.readdirSync(IMG_DIR).filter((f) => f.endsWith('.json'))) {
  const where = 'img/' + f; let m;
  try { m = JSON.parse(fs.readFileSync(path.join(IMG_DIR, f), 'utf8')); } catch (e) { err(where, 'not valid JSON'); continue; }
  if (m.id + '.json' !== f) err(where, 'id ' + JSON.stringify(m.id) + ' does not match the file name');
  if (!m.file || !fs.existsSync(path.join(IMG_DIR, m.file))) err(where, 'its picture ' + m.file + ' is missing');
  else if (fs.statSync(path.join(IMG_DIR, m.file)).size > 250 * 1024) err(where, m.file + ' is over 250 KB: run it through scripts/fetch-image.js (960 px, quality 78)');
  if (!m.alt || m.alt.length < 25) err(where, 'needs alt text that describes the picture (at least a sentence)');
  if (!m.title) err(where, 'no title');
  if (!LICENCE_OK(m.license)) err(where, 'licence ' + JSON.stringify(m.license) + ' is not public domain, CC0, CC BY or CC BY-SA');
  if (!/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(m.source || '')) err(where, 'source must be its Wikimedia Commons page');
  if (!(m.width > 0 && m.height > 0)) err(where, 'width and height are needed (they keep the page from jumping as it loads)');
  pictures.set(m.id, m);
}
for (const file of FILES) {
  window.COURSES = []; const mod = require.resolve('./src/course_' + file + '.js'); delete require.cache[mod]; require(mod);
  const course = window.COURSES[0], C = course.code || course.id;
  const prefix = ID_PREFIX[file];
  if (!course.lessons.length) err(C, 'no lessons');
  course.lessons.forEach((L, li) => {
    const where = C + ' lesson ' + (li + 1);
    const B = L.blocks || [];
    const kind = (b) => typeof b === 'string' ? (/class="recap"/.test(b) ? 'recap' : 'html') : b.play !== undefined ? 'play' : b.check ? 'check' : b.ex ? 'ex' : b.fig ? 'fig' : 'other';
    const ks = B.map(kind);
    if (!L.title) err(where, 'no title');
    // the shape of a lesson: a story first, three quick checks, exercises, then a recap (or, in a project lesson, stretch goals)
    if (!(typeof B[0] === 'string' && /^\s*<p>/.test(B[0]))) err(where, 'does not open with a story (a <p> of prose)');
    const checks = ks.filter((k) => k === 'check').length;
    if (checks !== 3) err(where, checks + ' quick checks (the style is three, one after each main idea)');
    if (!ks.includes('ex')) err(where, 'no graded exercise');
    const lastEx = ks.lastIndexOf('ex'), recap = ks.lastIndexOf('recap'), stretch = B.findIndex((b, i) => i > lastEx && typeof b === 'string' && /<h2>Stretch goals<\/h2>/.test(b));
    if (recap < lastEx && stretch < 0) err(where, 'no recap after the exercises');
    for (let k = 1; k < ks.length; k++) if (ks[k] === 'play' && ks[k - 1] === 'play') warn(where, 'two examples in a row (block ' + (k + 1) + '): put prose, a figure or a check between them');
    for (const h of (B.filter((b) => typeof b === 'string').join('').match(/<h2>([\s\S]*?)<\/h2>/g) || []).map((h) => text(h).trim())) if (h.length > 45) warn(where, 'long heading for the lesson map (' + h.length + ' characters): "' + h + '"');
    B.forEach((b, bi) => {
      const at = where + ' block ' + (bi + 1);
      if (typeof b === 'string') { checkHtml(at, b); return; }
      if (b.caption) checkHtml(at + ' caption', b.caption);
      if (b.photo !== undefined) {
        const ids = Array.isArray(b.photo) ? b.photo : [b.photo];
        if (!ids.length || ids.length > 3) err(at, 'a picture block shows one to three pictures');
        for (const id of ids) { if (!pictures.has(id)) err(at, 'picture ' + JSON.stringify(id) + ' is not in img/'); usedPictures.add(id); }
        if (!b.caption) err(at, 'a picture needs a caption that says what it shows and why it is here');
      }
      if (b.check) {   // a quick check: the answer is one of the options, and the explanation is there
        if (!Array.isArray(b.options) || b.options.length < 2) err(at, 'quick check with fewer than two options');
        else if (!Number.isInteger(b.answer) || b.answer < 0 || b.answer >= b.options.length) err(at, 'quick check answer ' + b.answer + ' is not one of the ' + b.options.length + ' options');
        if (!b.why) err(at, 'quick check without a why');
        else checkHtml(at + ' why', b.why);
        checkHtml(at + ' question', b.check); (b.options || []).forEach((o, oi) => checkHtml(at + ' option ' + (oi + 1), String(o)));
        if (new Set((b.options || []).map(String)).size !== (b.options || []).length) err(at, 'quick check with two identical options');
      }
      if (b.play !== undefined && (course.lang === 'java' || course.lang === 'cpp')) { const ln = brokenString(b.play); if (ln) err(at, 'line ' + ln + ' of the example has an unclosed string: a \\n inside a string must be written \\\\n in the lesson source'); }
      const ex = b.ex;
      if (!ex) return;
      const exAt = C + ' ' + ex.id;
      // the lesson number in an id is the one it was written under: lessons have moved since, and ids never change
      if (!ex.id || !new RegExp('^' + prefix + '-\\d+-\\d+$').test(ex.id)) err(at, 'exercise id ' + JSON.stringify(ex.id) + ' should look like ' + prefix + '-<lesson>-<n>');
      if (allIds.has(ex.id)) err(exAt, 'id used twice (also in ' + allIds.get(ex.id) + ')'); allIds.set(ex.id, where);
      if (!ex.title) err(exAt, 'no title');
      if (!ex.prompt) err(exAt, 'no prompt'); else checkHtml(exAt + ' prompt', ex.prompt);
      if (ex.followup) checkHtml(exAt + ' followup', ex.followup);
      (ex.options || []).forEach((o, oi) => o && o.text && checkHtml(exAt + ' option ' + (oi + 1), o.text));
      // hints are HTML in answer and terminal exercises, plain text in code exercises (app.js), where markup would show as written
      (ex.hints || []).forEach((h, hi) => { if (ex.kind) checkHtml(exAt + ' hint ' + (hi + 1), h); else if (/<\/?(code|b|i|em|p|br|pre)\b[^>]*>|&(lt|gt|amp|nbsp);/.test(h)) err(exAt + ' hint ' + (hi + 1), 'markup in a code exercise hint, which is shown as plain text: ' + JSON.stringify(h.slice(0, 60))); });
      if (!ex.kind) {   // a code exercise
        if (ex.solution == null) err(exAt, 'no solution');
        if (ex.starter == null && course.lang !== 'shell') err(exAt, 'no starter');
        if (!Array.isArray(ex.tests) || !ex.tests.length) err(exAt, 'no tests');
        if (!Array.isArray(ex.hints) || !ex.hints.length) warn(exAt, 'no hints');
        if ((course.lang === 'java' || course.lang === 'cpp') && ex.solution) { const ln = brokenString(ex.solution); if (ln) err(exAt, 'line ' + ln + ' of the solution has an unclosed string'); }
      }
      if (file === 'scratch' && !ex.followup) err(exAt, 'no followup stretch challenge (every Scratch exercise has one)');
    });
    // the course for ages 10-13 is written at a grade 3-4 reading level: measure it
    if (file === 'scratch') {
      const prose = text(B.filter((b) => typeof b === 'string' && !/class="recap"/.test(b)).join(' '));
      const fk = fkGrade(prose);
      if (fk && fk.grade > 5) err(where, 'reading level grade ' + fk.grade.toFixed(1) + ' (the course is written for grade 3-4; shorter sentences and words)');
      else if (fk && fk.grade > 4.5) warn(where, 'reading level grade ' + fk.grade.toFixed(1) + ' (aim for 3-4)');
      const story = fkGrade(text(B[0] || ''));
      if (story && story.wps > 12) warn(where, 'the story averages ' + story.wps.toFixed(1) + ' words a sentence (under 12 for this course)');
      if (!B.some((b) => b && b.fig === 'blockquiz')) err(where, 'no blockquiz figure before the exercises');
    }
  });
}

for (const id of pictures.keys()) if (!usedPictures.has(id)) err('img/' + id + '.json', 'this picture is not used by any lesson (remove it, or use it)');

// ---- exercise ids are never renumbered or removed: progress and portfolios are keyed by them
const known = fs.existsSync(IDS_FILE) ? fs.readFileSync(IDS_FILE, 'utf8').split('\n').map((s) => s.trim()).filter((s) => s && !s.startsWith('#')) : [];
for (const id of known) if (!allIds.has(id)) err(id, 'this exercise id existed and is gone: ids are never removed or renumbered, because students\' progress is saved under them');
const added = [...allIds.keys()].filter((id) => !known.includes(id));
if (added.length) {
  if (process.argv.includes('--update')) { fs.mkdirSync(path.dirname(IDS_FILE), { recursive: true }); fs.writeFileSync(IDS_FILE, '# Every exercise id ever published (test_lessons.js). Never remove a line: saved progress is keyed by these.\n' + [...known, ...added].join('\n') + '\n'); console.log('recorded ' + added.length + ' new exercise ids in lint/exercise-ids.txt'); }
  else err('lint/exercise-ids.txt', added.length + ' new exercise ids are not recorded yet (' + added.slice(0, 5).join(', ') + (added.length > 5 ? ', ...' : '') + '): run node test_lessons.js --update and commit the file');
}

console.log(errors ? errors + ' errors, ' + warnings + ' warnings' : 'lessons OK (' + allIds.size + ' exercises in ' + FILES.length + ' courses, ' + pictures.size + ' pictures; ' + warnings + ' warnings)');
process.exit(errors ? 1 : 0);
