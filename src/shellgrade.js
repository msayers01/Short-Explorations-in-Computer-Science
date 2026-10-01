/* The shell course's files and grader (SC 108). Loaded in the page (window.SHELLGRADE) and in node (test_course.js).
   A lesson names the files its examples and exercises start from: course.setups = { lesson1: tree, … }. A tree is an object whose keys are
   paths from the home directory and whose values are the text of a file (null for an empty directory; a key ending in / is a directory,
   a key ending in ! is an executable file): { 'notes/': null, 'notes/todo.txt': 'milk\n', 'tidy.sh!': '#!/bin/bash\n…' }.
   An exercise of kind 'shell' has tests on the state of the terminal after the student worked: see grade() for the kinds. */
(function (factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./shell.js'));
  else window.SHELLGRADE = factory(window.SHELL);
})(function (SHELL) {
  'use strict';
  const HOME = SHELL.HOME;
  const norm = (s) => String(s == null ? '' : s).replace(/\r/g, '').split('\n').map((l) => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');
  const courses = () => (typeof window !== 'undefined' && Array.isArray(window.COURSES) ? window.COURSES : []);

  /** the tree a name stands for, looked up in one course or in all of them */
  function setupFor(name, course) {
    if (name && typeof name === 'object') return name;
    if (typeof name !== 'string') return null;
    const list = course ? [course] : courses();
    for (const c of list) if (c && c.setups && Object.prototype.hasOwnProperty.call(c.setups, name)) return c.setups[name];
    return null;
  }
  /** write a tree into a file system, under the home directory (existing files are replaced) */
  function populate(fs, tree) {
    for (const key of Object.keys(tree || {})) {
      let p = key, exec = false;
      if (p.endsWith('!')) { exec = true; p = p.slice(0, -1); }
      const isDir = p.endsWith('/') || tree[key] === null;
      p = p.replace(/\/+$/, '');
      const abs = fs.resolve(p, HOME);
      if (isDir) { if (!fs.isDir(abs)) { if (fs.exists(abs)) fs.unlink(abs); fs.mkdir(abs, true); } continue; }
      const dir = abs.slice(0, abs.lastIndexOf('/')) || '/';
      if (!fs.isDir(dir)) fs.mkdir(dir, true);
      if (fs.isDir(abs)) fs.rmTree(abs);
      fs.write(abs, String(tree[key]));
      if (exec) fs.chmod(abs, true);
    }
  }
  /** a fresh file system holding a setup (a name or a tree), the shell at home */
  function makeFS(setup, course, opts) {
    const fs = SHELL.makeFS(null, opts);
    const tree = setupFor(setup, course);
    if (tree) populate(fs, tree);
    fs.cwd = HOME;
    return fs;
  }

  /* Tests, one object each (name is optional; shown in the verdict):
       { exists: path }          the path exists (file or directory)       { file: path }    it is a file        { dir: path }   it is a directory
       { missing: path }         nothing is there any more                 { exec: path }    the file is executable
       { content: path, expect } the file's text, compared with trailing spaces and blank lines at the end ignored
       { contains: path, text }  the file's text has this in it            { cmd, expect }   a command run in the home directory prints this
       { ran: /regex/, name }    a command matching this was typed (name is required: it says what was expected)
       { cwd: '~/notes' }        the shell is in this directory */
  async function grade(ex, sh) {
    const fs = sh.fs, results = [];
    const show = (p) => p.replace(/^\/home\/student(?=\/|$)/, '~');
    const abs = (p) => fs.resolve(p, HOME);
    for (const t of ex.tests || []) {
      let name = t.name, expected = '', got = '', ok = false, io = false;
      if (t.exists !== undefined) { name = name || show(t.exists) + ' exists'; expected = 'exists'; ok = fs.exists(abs(t.exists)); got = ok ? 'exists' : 'missing'; }
      else if (t.file !== undefined) { name = name || show(t.file) + ' is a file'; expected = 'a file'; const n = fs.stat(abs(t.file)); ok = !!n && n.t === 'f'; got = !n ? 'missing' : n.t === 'd' ? 'a directory' : 'a file'; }
      else if (t.dir !== undefined) { name = name || show(t.dir) + ' is a directory'; expected = 'a directory'; const n = fs.stat(abs(t.dir)); ok = !!n && n.t === 'd'; got = !n ? 'missing' : n.t === 'd' ? 'a directory' : 'a file'; }
      else if (t.missing !== undefined) { name = name || show(t.missing) + ' is gone'; expected = 'gone'; ok = !fs.exists(abs(t.missing)); got = ok ? 'gone' : 'still there'; }
      else if (t.exec !== undefined) { name = name || show(t.exec) + ' can run (chmod +x)'; expected = 'executable'; const n = fs.stat(abs(t.exec)); ok = !!n && n.t === 'f' && n.x; got = !n ? 'missing' : ok ? 'executable' : 'not executable'; }
      else if (t.content !== undefined) { name = name || show(t.content) + ' holds the right text'; io = true; expected = t.expect; const n = fs.stat(abs(t.content)); got = !n ? '(no such file)' : n.t === 'd' ? '(a directory)' : n.d; ok = !!n && n.t === 'f' && norm(n.d) === norm(t.expect); }
      else if (t.contains !== undefined) { name = name || show(t.contains) + ' mentions ' + JSON.stringify(t.text); io = true; expected = '… ' + t.text + ' …'; const n = fs.stat(abs(t.contains)); got = !n ? '(no such file)' : n.t === 'd' ? '(a directory)' : n.d; ok = !!n && n.t === 'f' && n.d.includes(t.text); }
      else if (t.cmd !== undefined) {
        name = name || t.cmd + ' prints the right thing'; io = true; expected = t.expect;
        const cwd = fs.cwd; fs.cwd = HOME; let out = '';
        const hist = sh.history.length;
        try { await sh.exec(t.cmd, { out: (s) => { out += s; }, err: (s) => { out += s; }, tty: false }); } catch (e) { out += 'error: ' + (e && e.message || e); }
        sh.history.length = hist;   // the check's own command is not the student's
        fs.cwd = cwd; got = out; ok = norm(out) === norm(t.expect);
      }
      else if (t.ran !== undefined) { name = name || 'a command like ' + String(t.ran); expected = 'typed'; ok = sh.history.some((h) => t.ran.test(h)); got = ok ? 'typed' : 'not typed yet'; }
      else if (t.cwd !== undefined) { name = name || 'you are in ' + t.cwd; expected = t.cwd; got = show(fs.cwd); ok = fs.cwd === abs(t.cwd); }
      else { name = name || 'unknown test'; got = 'this test kind is unknown'; }
      results.push({ name, expected, got, ok, io });
    }
    return { passed: results.length > 0 && results.every((r) => r.ok), results };
  }
  return { setupFor, populate, makeFS, grade, norm };
});
