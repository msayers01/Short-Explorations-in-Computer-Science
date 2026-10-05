/* Java programs made of several files (the Code Lab's Java tabs, the terminal's  javac A.java B.java). Exposed as window.JPROJ or module.exports.

   The interpreter (java.js) reads one source text, so the files are joined into one: their import lines are moved to the top (each once),
   and every top-level class is kept, in file order. Before each file a marker line  //@file Name.java  records where it starts, so the
   joined text carries its own map and a program compiled by the terminal's javac can be run later with its line numbers still right.
   Error messages and stack traces name lines of the joined text; mapError puts them back in the right file and line, as javac and java would.

     JPROJ.join(files, opts)   files: [{name, code}] in the order wanted (the class whose main runs is the first class with a main: put the
                               preferred file first). opts.dedupe: leave out a file that declares a class an earlier file declares (the Lab,
                               where tabs are often separate programs); otherwise that is javac's "duplicate class". opts.rule: 'always'
                               (javac) or 'multi' (only when two or more files are joined: one file alone keeps working whatever its name).
                               → { src, files: [{name, base}], map, classes: [{name, file, line, public, hasMain}], main, skipped: [{name, why}], error }
     JPROJ.fromJoined(src)     the same map read back from the marker lines (no markers: a single file, lines unchanged)
     JPROJ.mapLine(proj, n)    → { name, base, line } for line n of the joined text, or null
     JPROJ.mapError(proj, err) → err with  X.java:N:  (compile errors: the file as given) and  (X.java:N)  (stack frames: the base name) mapped
     JPROJ.where(err)          → { file, line } of the first place an error names: the compile error's line, or the innermost stack frame */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.JPROJ = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const MARK = '//@file ';
  const baseOf = (name) => String(name).split('/').pop();

  // The code with comments, strings and char literals blanked (newlines kept), so braces and words in them are not counted.
  function strip(code) {
    let out = '', i = 0;
    const n = code.length;
    const blank = (s) => s.replace(/[^\n]/g, ' ');
    while (i < n) {
      const c = code[i], d = code[i + 1];
      if (c === '/' && d === '/') { let j = code.indexOf('\n', i); if (j < 0) j = n; out += blank(code.slice(i, j)); i = j; }
      else if (c === '/' && d === '*') { let j = code.indexOf('*/', i + 2); j = j < 0 ? n : j + 2; out += blank(code.slice(i, j)); i = j; }
      else if (c === '"' && code.startsWith('"""', i)) { let j = code.indexOf('"""', i + 3); j = j < 0 ? n : j + 3; out += blank(code.slice(i, j)); i = j; }
      else if (c === '"' || c === "'") {   // to the closing quote, or the end of the line (an unclosed literal)
        let j = i + 1; while (j < n && code[j] !== c && code[j] !== '\n') j += code[j] === '\\' ? 2 : 1;
        j = Math.min(j, n); const closed = j < n && code[j] === c;
        out += c + blank(code.slice(i + 1, j)) + (closed ? c : ''); i = closed ? j + 1 : j;
      }
      else { out += c; i++; }
    }
    return out;
  }

  // What one file holds: the line numbers (1-based) of its leading import and package lines, and its top-level classes.
  function scan(code) {
    const s = strip(code), lines = s.split('\n'), head = [];
    for (let k = 0; k < lines.length; k++) {
      const t = lines[k].trim();
      if (!t) continue;
      const stmts = t.match(/^(?:(?:import|package)\s[^;]*;\s*)+$/) ? t.split(';').map((x) => x.trim()).filter(Boolean) : null;
      if (stmts) { for (const x of stmts) head.push({ line: k + 1, kind: x.startsWith('import') ? 'import' : 'package', text: x.replace(/\s*([.*])\s*/g, '$1').replace(/\s+/g, ' ') + ';' }); continue; }
      break;
    }
    // top-level declarations: words at brace depth 0; modifiers since the last ; or } at that depth
    const classes = []; let depth = 0, mods = [], line = 1, cur = null;
    const re = /[A-Za-z_$][\w$]*|[{};\n]|@\s*[A-Za-z_$][\w$.]*|[^\sA-Za-z_${};]/g; let m, want = null;
    while ((m = re.exec(s))) {
      const t = m[0];
      if (t === '\n') { line++; continue; }
      if (t === '{') { depth++; if (depth === 1 && cur) cur.open = m.index; continue; }
      if (t === '}') { depth = Math.max(0, depth - 1); if (depth === 0) { if (cur) { cur.close = m.index; cur = null; } mods = []; } continue; }
      if (depth > 0) continue;
      if (t === ';') { mods = []; want = null; continue; }
      if (want) { classes.push(cur = { name: t, line: want.line, public: want.public, kind: want.kind }); want = null; mods = []; continue; }
      if (/^(class|interface|enum|record)$/.test(t)) { want = { line, public: mods.includes('public'), kind: t }; continue; }
      mods.push(t);
    }
    for (const c of classes) { const body = c.open != null ? s.slice(c.open, c.close == null ? s.length : c.close) : ''; c.hasMain = /\bstatic\b[^;{}()=]*\bvoid\s+main\s*\(\s*(?:final\s+)?String\s*(?:\[\s*\]|\.\.\.)?\s*[A-Za-z_$][\w$]*(?:\s*\[\s*\])?\s*\)/.test(body); delete c.open; delete c.close; }
    return { head, classes };
  }

  function join(files, opts) {
    opts = opts || {};
    const used = [], skipped = [], seen = new Map();
    for (const f of files || []) {
      if (!f || typeof f.name !== 'string' || typeof f.code !== 'string') continue;
      const name = f.name.replace(/[\r\n]/g, '_'), base = baseOf(name);
      if (!/\.java$/.test(base)) { skipped.push({ name, why: 'not a .java file' }); continue; }
      if (!f.code.trim()) { skipped.push({ name, why: 'empty' }); continue; }
      const info = scan(f.code);
      if (opts.dedupe) { const clash = info.classes.find((c) => seen.has(c.name)); if (clash) { skipped.push({ name, why: 'it declares class ' + clash.name + ' again (' + seen.get(clash.name) + ' has it)', clash: true }); continue; } }
      for (const c of info.classes) if (!seen.has(c.name)) seen.set(c.name, name);
      used.push({ name, base, code: f.code, info });
    }
    const proj = { src: '', files: used.map((u) => ({ name: u.name, base: u.base })), map: [], classes: [], main: null, skipped, error: null };
    used.forEach((u, i) => { for (const c of u.info.classes) proj.classes.push({ name: c.name, file: i, line: c.line, public: c.public, kind: c.kind, hasMain: c.hasMain }); });
    const main = proj.classes.find((c) => c.hasMain && c.kind === 'class'); proj.main = main ? main.name : null;
    // javac: a public class lives in a file of its own name (JLS 7.6). Checked file by file, in order, as javac reports them.
    if (opts.rule === 'always' || (opts.rule === 'multi' && used.length > 1)) {
      for (const c of proj.classes) if (c.public && c.name + '.java' !== used[c.file].base) { proj.error = used[c.file].name + ':' + c.line + ': error: class ' + c.name + ' is public, should be declared in a file named ' + c.name + '.java'; proj.where = { file: used[c.file].name, line: c.line }; break; }
    }
    // the joined text: imports first (each once), then each file after its marker line, its own import and package lines left blank
    const lines = [], map = [], imports = new Set();
    used.forEach((u, i) => { for (const h of u.info.head) if (h.kind === 'import' && !imports.has(h.text)) { imports.add(h.text); lines.push(h.text); map.push({ f: i, line: h.line }); } });
    used.forEach((u, i) => {
      lines.push(MARK + u.name); map.push(null);
      const skip = new Set(u.info.head.map((h) => h.line));
      u.code.split('\n').forEach((l, k) => { lines.push(skip.has(k + 1) ? '' : l.replace(/\r$/, '')); map.push({ f: i, line: k + 1 }); });
    });
    proj.src = lines.join('\n'); proj.map = map;
    return proj;
  }

  function fromJoined(src) {
    const lines = String(src).split('\n'), files = [], map = [];
    for (const l of lines) {
      if (l.startsWith(MARK)) { const name = l.slice(MARK.length); files.push({ name, base: baseOf(name), n: 0 }); map.push(null); continue; }
      const f = files[files.length - 1];
      if (f) { f.n++; map.push({ f: files.length - 1, line: f.n }); } else map.push(null);   // a hoisted import: resolved to the next file's first line
    }
    if (!files.length) return { src: String(src), files: [], map: [], classes: [], main: null, skipped: [], error: null };
    return { src: String(src), files: files.map((f) => ({ name: f.name, base: f.base })), map, classes: [], main: null, skipped: [], error: null };
  }

  function mapLine(proj, n) {
    if (!proj || !proj.files || !proj.files.length || !(n >= 1)) return null;
    const map = proj.map; let i = Math.min(n, map.length) - 1, e = map[i];
    if (!e) { for (let j = i + 1; j < map.length && !e; j++) e = map[j]; for (let j = i - 1; j >= 0 && !e; j--) e = map[j]; }   // a marker line: the nearest real one
    if (!e) return null;
    const line = n > map.length ? e.line + (n - map.length) : e.line;   // past the end ("reached end of file"): the last file, counted on
    return { name: proj.files[e.f].name, base: proj.files[e.f].base, line };
  }

  function mapError(proj, err) {
    if (err == null || !proj || !proj.files || !proj.files.length) return err;
    return String(err)
      .replace(/^([^\s:()]*\.java):(\d+):/gm, (all, f, n) => { const p = mapLine(proj, +n); return p ? p.name + ':' + p.line + ':' : all; })
      .replace(/\(([\w$]+\.java):(\d+)\)/g, (all, f, n) => { const p = mapLine(proj, +n); return p ? '(' + p.base + ':' + p.line + ')' : all; });
  }

  function where(err) {
    const s = String(err || '');
    let m = s.match(/^([^\s:()]*\.java):(\d+): error:/m);
    if (m) return { file: m[1], line: +m[2] };
    m = s.match(/\n\s*at [\w$.<>]+\(([\w$]+\.java):(\d+)\)/);
    if (m) return { file: m[1], line: +m[2] };
    return null;
  }

  return { join, fromJoined, mapLine, mapError, where, scan, strip, MARK };
});
