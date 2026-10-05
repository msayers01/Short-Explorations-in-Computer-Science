/* Reads showcase/<slug>/ folders for the Student Showcase page (src/showcase.js). Used by build.js and test_showcase.js.
   A folder holds project.json and the student's files. Nothing is shipped without "consent": true. The page gets only what it shows:
   no consent notes, no folder paths, no file that is not source text. Every limit here is a cap on what a folder may add to the page. */
'use strict';
const fs = require('fs');
const path = require('path');

const LANG_OF = { py: 'python', java: 'java', cpp: 'cpp', cc: 'cpp', cxx: 'cpp', hpp: 'cpp', h: 'cpp', c: 'c', scm: 'scheme', ss: 'scheme', lisp: 'scheme' };
const TEXT = ['txt', 'md'];                       // shown, never run
const LIMITS = { files: 20, fileBytes: 60 * 1024, projectBytes: 200 * 1024, name: 30, title: 60, note: 600, projects: 200 };
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,40}$/;
const GRADES = /^(K|[1-9]|1[0-2])(-(K|[1-9]|1[0-2]))?$/;

const ext = (n) => (n.match(/\.([A-Za-z0-9]+)$/) || [, ''])[1].toLowerCase();
const clean = (s) => String(s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');

function walk(dir, rel, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    if (e.name.startsWith('.') || e.name === '__pycache__' || e.name === 'node_modules' || e.name === 'project.json') continue;
    if (e.isSymbolicLink()) continue;
    const r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) walk(path.join(dir, e.name), r, out); else if (e.isFile()) out.push(r);
  }
}

/** → { projects: [...], errors: [...], skipped: [...] }. A folder with an error is left out and named in errors (build.js fails on any). */
function load(root) {
  const projects = [], errors = [], skipped = [];
  if (!fs.existsSync(root)) return { projects, errors, skipped };
  const dirs = fs.readdirSync(root, { withFileTypes: true }).filter((e) => e.isDirectory() && !e.name.startsWith('_') && !e.name.startsWith('.')).map((e) => e.name).sort();
  for (const slug of dirs) {
    const bad = (msg) => errors.push('showcase/' + slug + ': ' + msg);
    if (projects.length >= LIMITS.projects) { bad('more than ' + LIMITS.projects + ' projects'); continue; }
    if (!SLUG_RE.test(slug)) { bad('the folder name must be lower-case letters, digits and hyphens (it becomes the web address)'); continue; }
    let meta;
    try { meta = JSON.parse(fs.readFileSync(path.join(root, slug, 'project.json'), 'utf8')); } catch (e) { bad('project.json is missing or not valid JSON'); continue; }
    if (!meta || typeof meta !== 'object' || Array.isArray(meta)) { bad('project.json must be an object'); continue; }
    const n0 = errors.length;
    if (meta.consent !== true) bad('"consent": true is required (the student and a parent or guardian agreed to show it)');
    for (const k of ['title', 'name']) if (typeof meta[k] !== 'string' || !clean(meta[k]).trim()) bad('"' + k + '" is required');
    if (typeof meta.title === 'string' && meta.title.length > LIMITS.title) bad('"title" is over ' + LIMITS.title + ' characters');
    if (typeof meta.name === 'string' && meta.name.length > LIMITS.name) bad('"name" is over ' + LIMITS.name + ' characters (a first name or nickname)');
    if (typeof meta.name === 'string' && /\S+\s+\S+/.test(meta.name.trim()) && !meta.nameOk) bad('"name" has two words: use a first name or nickname only (add "nameOk": true to keep it)');
    if (meta.grade != null && !(typeof meta.grade === 'string' && GRADES.test(meta.grade))) bad('"grade" must look like "7" or "9-10" (or leave it out)');
    if (meta.note != null && (typeof meta.note !== 'string' || meta.note.length > LIMITS.note)) bad('"note" must be text of at most ' + LIMITS.note + ' characters');
    if (meta.date != null && !(typeof meta.date === 'string' && /^\d{4}-\d{2}(-\d{2})?$/.test(meta.date))) bad('"date" must be YYYY-MM or YYYY-MM-DD');
    if (meta.stdin != null && typeof meta.stdin !== 'string') bad('"stdin" must be text');
    if (errors.length > n0) continue;

    const rels = []; walk(path.join(root, slug), '', rels);
    const files = []; let total = 0;
    for (const rel of rels) {
      const e = ext(rel), full = path.join(root, slug, rel);
      if (!LANG_OF[e] && !TEXT.includes(e)) { skipped.push('showcase/' + slug + '/' + rel + ' (not source text)'); continue; }
      const buf = fs.readFileSync(full);
      if (buf.length > LIMITS.fileBytes) { bad(rel + ' is over ' + LIMITS.fileBytes / 1024 + ' KB'); continue; }
      if (buf.includes(0)) { skipped.push('showcase/' + slug + '/' + rel + ' (binary)'); continue; }
      const code = clean(buf.toString('utf8').replace(/\r\n?/g, '\n'));
      total += Buffer.byteLength(code);
      files.push({ name: rel, code });
    }
    if (files.length > LIMITS.files) bad('more than ' + LIMITS.files + ' files');
    if (total > LIMITS.projectBytes) bad('the files add up to more than ' + LIMITS.projectBytes / 1024 + ' KB');
    const code = files.filter((f) => LANG_OF[ext(f.name)]);
    if (!code.length) bad('no source files (.py .java .cpp .c .scm ...)');
    if (errors.length > n0) continue;

    const lang = meta.lang || LANG_OF[ext(code[0].name)];
    if (!Object.values(LANG_OF).includes(lang)) { bad('"lang" must be python, java, cpp, c or scheme'); continue; }
    let main = meta.main;
    if (main != null && !files.some((f) => f.name === main)) { bad('"main" names a file that is not in the folder'); continue; }
    if (main == null) main = (code.find((f) => /^(main|app|game|project)\.\w+$/i.test(f.name) && LANG_OF[ext(f.name)] === lang) || code.find((f) => LANG_OF[ext(f.name)] === lang) || code[0]).name;
    // the file that runs first, then the others in name order
    files.sort((a, b) => (a.name === main ? -1 : b.name === main ? 1 : 0));
    projects.push({
      id: slug, title: clean(meta.title).trim(), name: clean(meta.name).trim(), grade: meta.grade || '', note: clean(meta.note || '').trim(),
      date: meta.date || '', lang, main, stdin: meta.stdin == null ? null : clean(meta.stdin), files
    });
  }
  projects.sort((a, b) => (b.date || '').localeCompare(a.date || '') || (a.id < b.id ? -1 : 1));
  return { projects, errors, skipped };
}

module.exports = { load, LIMITS, LANG_OF };
