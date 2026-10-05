/* A small Unix-style shell with a virtual file system, for practising the command line.

   Nothing here touches the real computer: the file system is a tree in memory (saved to localStorage by the Code Lab), every command is
   written here, and programs (python, java, g++, scheme) are handed to the site's sandboxes through hooks. No eval, no network, no DOM:
   this file is loaded in the page and in node (test_shell.js).

   const fs = SHELL.makeFS(saved?)                    the file system; fs.toJSON() to save it; SHELL.makeFS(json) checks everything it loads
   const sh = SHELL.makeShell({ fs, run, compile, nano, edit, setup, now, typedInput })   typedInput(lang, src, std): true when run() asks for each line itself
   await sh.exec('ls -l | head -3', io)              → exit status; io = { out(text, cls?), err(text), ask(prompt) → Promise<string>, clear(), tty: true }
   sh.complete(lineUpToCursor)                       → { start, items }   (tab completion)
   sh.prompt()                                       → 'student@lab:~$ '
   sh.cancel()                                       ends the command that is running (Ctrl+C)

   What the shell knows: words with ' " and \ quoting, $VAR ${VAR} (and ${x:-d} ${x#pat} ${x%pat} ${x/a/b} ${x^^} ${x:1:2}) $? $# $@ $1, $(command), $((arithmetic)), {a,b} and {1..5}, ~, * ? [...] wildcards,
   > >> < 2> 2>&1 | ; && || and !, if/elif/else/fi, for/in/do/done, while/until, scripts with #! lines, and the commands listed in COMMANDS below. */
(function (factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else window.SHELL = factory();
})(function () {
  'use strict';
  const dict = () => Object.create(null);
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const LIMITS = { files: 500, bytes: 2000000, fileBytes: 256000, depth: 32, name: 100, steps: 20000, dirs: 500, brace: 10000, vars: 256000, out: 2000000, history: 500 };
  const USER = 'student', HOST = 'lab', HOME = '/home/student';
  const MSG = { ENOENT: 'No such file or directory', ENOTDIR: 'Not a directory', EISDIR: 'Is a directory', EEXIST: 'File exists', ENOTEMPTY: 'Directory not empty',
    EACCES: 'Permission denied', ENOSPC: 'No space left on device', ENAMETOOLONG: 'File name too long', EINVAL: 'Invalid argument', EMFILE: 'Too many files', EFBIG: 'File too large' };
  function FsError(code, path) { this.code = code; this.path = path; this.message = MSG[code] || code; }
  FsError.prototype = Object.create(Error.prototype);
  const fail = (code, path) => { throw new FsError(code, path); };

  /* ---------------- the file system ---------------- */
  // A directory is { t:'d', c:{name → node}, m:time }; a file is { t:'f', d:text, x:executable, m:time, bin? }. bin is a compiled program
  // ({ lang, src, std }): what g++ and javac write. Only /home and /tmp can be changed; the rest is the system, read-only.
  function makeFS(saved, opts) {
    opts = opts || {};
    const now = opts.now || (() => Date.now());
    const mkdir = () => ({ t: 'd', c: dict(), m: now() });
    const mkfile = (text, x, bin) => ({ t: 'f', d: text, x: !!x, m: now(), bin: bin || undefined });
    const root = mkdir();
    const fs = { root, cwd: HOME, now };
    const validName = (n) => typeof n === 'string' && n.length > 0 && n.length <= LIMITS.name && n !== '.' && n !== '..' && !/[\/\u0000-\u001f\u007f]/.test(n);
    fs.validName = validName;
    /** absolute, normalized path for p seen from the current directory (or from `from`) */
    fs.resolve = (p, from) => {
      p = String(p == null ? '' : p);
      if (p === '') p = '.';
      if (p === '~') p = HOME; else if (p.startsWith('~/')) p = HOME + p.slice(1);
      const abs = p.startsWith('/') ? p : (from || fs.cwd) + '/' + p;
      const out = [];
      for (const part of abs.split('/')) { if (part === '' || part === '.') continue; if (part === '..') out.pop(); else out.push(part); }
      return '/' + out.join('/');
    };
    const parts = (abs) => abs.split('/').filter(Boolean);
    /** the node at an absolute path, or null */
    fs.stat = (abs) => { let n = root; for (const p of parts(abs)) { if (n.t !== 'd' || !has(n.c, p)) return null; n = n.c[p]; } return n; };
    fs.exists = (abs) => !!fs.stat(abs);
    fs.isDir = (abs) => { const n = fs.stat(abs); return !!n && n.t === 'd'; };
    fs.isFile = (abs) => { const n = fs.stat(abs); return !!n && n.t === 'f'; };
    /** the directory that holds abs, and the last name; throws ENOENT/ENOTDIR when the directory is missing */
    const parent = (abs) => {
      const ps = parts(abs); if (!ps.length) fail('EINVAL', abs);
      const name = ps.pop(); let n = root;
      for (const p of ps) { if (n.t !== 'd') fail('ENOTDIR', abs); if (!has(n.c, p)) fail('ENOENT', abs); n = n.c[p]; }
      if (n.t !== 'd') fail('ENOTDIR', abs);
      return { dir: n, name };
    };
    let building = false;   // while the system part of the tree is made, the read-only rule is off
    const writable = (abs) => building || abs === '/home' || abs.startsWith('/home/') || abs === '/tmp' || abs.startsWith('/tmp/');
    const mustWrite = (abs) => { if (!writable(abs)) fail('EACCES', abs); if (parts(abs).length > LIMITS.depth) fail('ENAMETOOLONG', abs); };
    const count = (n, acc) => { if (n.t === 'd') { for (const k in n.c) count(n.c[k], acc); } else { acc.files++; acc.bytes += n.d.length; } return acc; };
    const countDirs = (n) => { let c = 0; if (n.t === 'd') { c = 1; for (const k in n.c) c += countDirs(n.c[k]); } return c; };   // empty directories cost memory and a saved copy too
    fs.usage = () => { const acc = { files: 0, bytes: 0 }; for (const k of ['home', 'tmp']) if (has(root.c, k)) count(root.c[k], acc); return acc; };   // the student's files; the system does not count
    const checkSpace = (extraFiles, extraBytes, extraDirs) => { const u = fs.usage(); if (extraDirs) { let d = 0; for (const k of ['home', 'tmp']) if (has(root.c, k)) d += countDirs(root.c[k]); if (d + extraDirs > LIMITS.dirs) fail('EMFILE'); } if (u.files + extraFiles > LIMITS.files) fail('EMFILE'); if (u.bytes + extraBytes > LIMITS.bytes) fail('ENOSPC'); };
    const touchDir = (d) => { d.m = now(); };
    fs.mkdir = (abs, parents) => {
      if (parents) { let cur = ''; for (const p of parts(abs)) { cur += '/' + p; const n = fs.stat(cur); if (!n) fs.mkdir(cur, false); else if (n.t !== 'd') fail('ENOTDIR', cur); } return; }
      const { dir, name } = parent(abs);
      if (!validName(name)) fail(name.length > LIMITS.name ? 'ENAMETOOLONG' : 'EINVAL', abs);
      if (has(dir.c, name)) fail('EEXIST', abs);
      mustWrite(abs); if (!building) checkSpace(0, 0, 1);
      dir.c[name] = mkdir(); touchDir(dir);
    };
    fs.read = (abs) => { const n = fs.stat(abs); if (!n) fail('ENOENT', abs); if (n.t === 'd') fail('EISDIR', abs); return n.d; };
    /** write (or append) text; creates the file; keeps the exec bit of an existing file */
    fs.write = (abs, text, append, bin) => {
      text = String(text);
      const { dir, name } = parent(abs);
      const old = has(dir.c, name) ? dir.c[name] : null;
      if (old && old.t === 'd') fail('EISDIR', abs);
      if (!old && !validName(name)) fail(name.length > LIMITS.name ? 'ENAMETOOLONG' : 'EINVAL', abs);
      mustWrite(abs);
      const next = append && old ? old.d + text : text;
      if (next.length > LIMITS.fileBytes) fail('EFBIG', abs);
      checkSpace(old ? 0 : 1, next.length - (old ? old.d.length : 0));
      if (old) { old.d = next; old.m = now(); if (bin !== undefined) old.bin = bin || undefined; if (!append && bin === undefined) old.bin = undefined; }
      else { dir.c[name] = mkfile(next, false, bin); touchDir(dir); }
    };
    fs.touch = (abs) => { const n = fs.stat(abs); if (n) { mustWrite(abs); n.m = now(); } else fs.write(abs, ''); };
    fs.chmod = (abs, exec) => { const n = fs.stat(abs); if (!n) fail('ENOENT', abs); mustWrite(abs); if (n.t === 'f') n.x = !!exec; };
    fs.unlink = (abs) => { const { dir, name } = parent(abs); if (!has(dir.c, name)) fail('ENOENT', abs); if (dir.c[name].t === 'd') fail('EISDIR', abs); mustWrite(abs); delete dir.c[name]; touchDir(dir); };
    fs.rmdir = (abs) => { const { dir, name } = parent(abs); if (!has(dir.c, name)) fail('ENOENT', abs); const n = dir.c[name]; if (n.t !== 'd') fail('ENOTDIR', abs); if (Object.keys(n.c).length) fail('ENOTEMPTY', abs); mustWrite(abs); delete dir.c[name]; touchDir(dir); };
    fs.rmTree = (abs) => { const { dir, name } = parent(abs); if (!has(dir.c, name)) fail('ENOENT', abs); mustWrite(abs); if (abs === fs.cwd || fs.cwd.startsWith(abs + '/')) { /* allowed, as in Unix: the shell is left in a directory that no longer exists */ } delete dir.c[name]; touchDir(dir); };
    fs.list = (abs) => { const n = fs.stat(abs); if (!n) fail('ENOENT', abs); if (n.t !== 'd') fail('ENOTDIR', abs); return Object.keys(n.c).sort(nameOrder); };
    const clone = (n) => n.t === 'd' ? Object.assign(mkdir(), { c: (() => { const c = dict(); for (const k in n.c) c[k] = clone(n.c[k]); return c; })() }) : mkfile(n.d, n.x, n.bin);
    const sizeOf = (n) => count(n, { files: 0, bytes: 0 });
    /** copy src to dst (dst is the new path itself, not a directory) */
    fs.copy = (src, dst, recursive) => {
      const s = fs.stat(src); if (!s) fail('ENOENT', src);
      if (s.t === 'd' && !recursive) fail('EISDIR', src);
      if (dst === src || dst.startsWith(src + '/')) fail('EINVAL', dst);
      const { dir, name } = parent(dst);
      const old = has(dir.c, name) ? dir.c[name] : null;
      if (old && old.t === 'd' && s.t !== 'd') fail('EISDIR', dst);
      if (old && old.t === 'f' && s.t === 'd') fail('ENOTDIR', dst);
      if (!old && !validName(name)) fail('EINVAL', dst);
      mustWrite(dst);
      const sz = sizeOf(s); checkSpace(sz.files, sz.bytes, countDirs(s));
      if (old && old.t === 'f') { old.d = s.d; old.m = now(); old.bin = s.bin; }
      else if (old && old.t === 'd') { for (const k in s.c) old.c[k] = clone(s.c[k]); old.m = now(); }
      else { dir.c[name] = clone(s); touchDir(dir); }
    };
    fs.move = (src, dst) => {
      const s = fs.stat(src); if (!s) fail('ENOENT', src);
      if (dst === src) return;
      if (dst.startsWith(src + '/')) fail('EINVAL', dst);
      const from = parent(src), to = parent(dst);
      const old = has(to.dir.c, to.name) ? to.dir.c[to.name] : null;
      if (old && old.t === 'd' && s.t !== 'd') fail('EISDIR', dst);
      if (old && old.t === 'f' && s.t === 'd') fail('ENOTDIR', dst);
      if (old && old.t === 'd' && Object.keys(old.c).length) fail('ENOTEMPTY', dst);
      if (!old && !validName(to.name)) fail('EINVAL', dst);
      mustWrite(src); mustWrite(dst);
      delete from.dir.c[from.name]; touchDir(from.dir);
      to.dir.c[to.name] = s; s.m = now(); touchDir(to.dir);
      if (fs.cwd === src || fs.cwd.startsWith(src + '/')) fs.cwd = dst + fs.cwd.slice(src.length);
    };
    /** every path under abs (depth first, parents before children), as [path, node] */
    fs.walk = (abs) => { const out = []; const go = (p, n) => { out.push([p, n]); if (n.t === 'd') for (const k of Object.keys(n.c).sort(nameOrder)) go(p === '/' ? '/' + k : p + '/' + k, n.c[k]); }; const n = fs.stat(abs); if (n) go(abs, n); return out; };
    fs.setBin = (abs, bin) => { const n = fs.stat(abs); if (n && n.t === 'f') n.bin = bin || undefined; };

    // ----- saving and loading. Everything loaded is checked: names, shapes, sizes and the caps, so a hostile saved copy cannot grow past them.
    const toJSON = (n) => n.t === 'd' ? { t: 'd', m: n.m, c: Object.keys(n.c).map((k) => [k, toJSON(n.c[k])]) } : { t: 'f', m: n.m, x: n.x || undefined, d: n.d, bin: n.bin };
    // only /home and /tmp are saved: the system part is rebuilt on every load
    fs.toJSON = () => ({ v: 1, cwd: fs.cwd, root: { t: 'd', m: root.m, c: ['home', 'tmp'].filter((k) => has(root.c, k)).map((k) => [k, toJSON(root.c[k])]) } });
    const fromJSON = (j, depth, acc) => {
      if (!j || typeof j !== 'object') return null;
      if (j.t === 'f') {
        if (typeof j.d !== 'string' || j.d.length > LIMITS.fileBytes) return null;
        if (acc.files >= LIMITS.files || acc.bytes + j.d.length > LIMITS.bytes) return null;
        acc.files++; acc.bytes += j.d.length;
        let bin;
        if (j.bin && typeof j.bin === 'object' && typeof j.bin.lang === 'string' && /^[a-z]+$/.test(j.bin.lang) && typeof j.bin.src === 'string' && j.bin.src.length <= LIMITS.fileBytes) bin = { lang: j.bin.lang, src: j.bin.src, std: typeof j.bin.std === 'string' && /^[a-z0-9+]+$/.test(j.bin.std) ? j.bin.std : undefined };
        const f = mkfile(j.d, j.x === true, bin); f.m = typeof j.m === 'number' && isFinite(j.m) ? j.m : now(); return f;
      }
      if (j.t === 'd') {
        if (depth >= LIMITS.depth || (acc.dirs = (acc.dirs || 0) + 1) > LIMITS.dirs) return null;
        const d = mkdir(); d.m = typeof j.m === 'number' && isFinite(j.m) ? j.m : now();
        if (Array.isArray(j.c)) for (const e of j.c) { if (!Array.isArray(e) || !validName(e[0])) continue; const child = fromJSON(e[1], depth + 1, acc); if (child) d.c[e[0]] = child; }
        return d;
      }
      return null;
    };
    // the system part of the tree: made fresh every time (it is never saved)
    const system = () => {
      building = true;
      fs.mkdir('/bin', true); fs.mkdir('/etc', true); fs.mkdir('/tmp', true); fs.mkdir('/usr/bin', true); fs.mkdir('/home', true); fs.mkdir('/dev', true);
      root.c.dev.c.null = mkfile('', false);
      const sys = (p, text) => { const { dir, name } = parent(p); dir.c[name] = mkfile(text, false); };
      sys('/etc/hostname', HOST + '\n'); sys('/etc/passwd', 'root:x:0:0:root:/root:/bin/bash\n' + USER + ':x:1000:1000:' + USER + ':' + HOME + ':/bin/bash\n');
      sys('/etc/motd', 'Welcome to the practice terminal. Type help to see what you can do.\n');
      for (const c of Object.keys(COMMANDS)) { if (!COMMANDS[c].builtin) { const n = mkfile('', true); n.bin = { lang: 'sys', src: '' }; root.c.bin.c[c] = n; } }
      building = false;
    };
    let loadedHome = null;
    if (saved && typeof saved === 'object' && saved.root && typeof saved.root === 'object' && saved.root.t === 'd') {
      const acc = { files: 0, bytes: 0 };
      const r = fromJSON(saved.root, 0, acc);
      // only /home and /tmp are taken from the saved copy; the system is always rebuilt
      if (r) { loadedHome = has(r.c, 'home') && r.c.home.t === 'd' ? r.c.home : null; if (has(r.c, 'tmp') && r.c.tmp.t === 'd') root.c.tmp = r.c.tmp; }
    }
    system();
    if (loadedHome) root.c.home = loadedHome;
    if (!fs.isDir(HOME)) { fs.mkdir(HOME, true); }
    if (saved && typeof saved.cwd === 'string' && fs.isDir(fs.resolve(saved.cwd, '/'))) fs.cwd = fs.resolve(saved.cwd, '/'); else fs.cwd = HOME;
    return fs;
  }
  // ls sorts the way a terminal in an English locale does: case and punctuation do not count first
  const fold = (s) => s.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
  const nameOrder = (a, b) => { const fa = fold(a), fb = fold(b); return fa < fb ? -1 : fa > fb ? 1 : a > b ? -1 : a < b ? 1 : 0; };   // a tie (a.txt, A.txt): lowercase first, as in a terminal

  /* ---------------- reading a command line ---------------- */
  // A word is a list of parts: { v, q } literal text (q: it was quoted, so no expansion, splitting or wildcards),
  // { x:'var', v:name, q }, { x:'sub', v:text, q } for $(...), { x:'arith', v:text, q } for $((...)). q is true inside "double quotes".
  function SyntaxError_(msg) { this.message = msg; this.syntax = true; }
  SyntaxError_.prototype = Object.create(Error.prototype);
  const synErr = (msg) => { throw new SyntaxError_(msg); };
  const RESERVED = ['if', 'then', 'elif', 'else', 'fi', 'for', 'in', 'do', 'done', 'while', 'until', '{', '}', '!'];

  function tokenize(src) {
    const toks = []; let i = 0, start = 0; const n = src.length;
    // each token knows its line (for "script.sh: line 3: ..." messages): the line where it starts
    const nls = []; for (let k = src.indexOf('\n'); k >= 0; k = src.indexOf('\n', k + 1)) nls.push(k);
    const lineAt = (pos) => { let lo = 0, hi = nls.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (nls[mid] < pos) lo = mid + 1; else hi = mid; } return lo + 1; };
    toks.push = (t) => { t.line = lineAt(start); return Array.prototype.push.call(toks, t); };
    try {
    const peek = (k) => src[i + (k || 0)];
    // read a balanced $( ... ) or $(( ... )) body; i is just after the opening
    const balanced = (open, close, dbl) => {
      let depth = 1, s = i, q = null;
      while (i < n) {
        const c = src[i];
        if (q) { if (c === '\\') i++; else if (c === q) q = null; i++; continue; }
        if (c === "'" || c === '"') { q = c; i++; continue; }
        if (c === open) depth++; else if (c === close) { depth--; if (depth === 0) { const body = src.slice(s, i); i++; if (dbl) { if (src[i] !== ')') synErr('unexpected EOF while looking for matching `))\''); i++; } return body; } }
        i++;
      }
      synErr('unexpected EOF while looking for matching `' + close + "'");
    };
    const dollar = (parts, q) => {   // i is at '$'
      i++;
      const c = peek();
      if (c === '(') { i++; if (peek() === '(') { i++; parts.push({ x: 'arith', v: balanced('(', ')', true), q }); } else parts.push({ x: 'sub', v: balanced('(', ')'), q }); return; }
      if (c === '{') {
        i++;
        let j = -1;   // the matching }: a ${...} inside the pattern of another (${f%.${ext}}) has its own
        for (let k = i, depth = 0; k < n; k++) { const ch = src[k]; if (ch === '\\') { k++; continue; } if (ch === '$' && src[k + 1] === '{') { depth++; k++; } else if (ch === '}') { if (!depth) { j = k; break; } depth--; } }
        if (j < 0) synErr('unexpected EOF while looking for matching `}\''); const body = src.slice(i, j); i = j + 1; let m;
        // ${NAME}, ${#NAME} (its length), ${NAME:offset} and ${NAME:offset:length} (either may be negative), ${NAME:-word} ${NAME:=word} ${NAME:+word} (and the same without the colon),
        // ${NAME#pat} ${NAME##pat} ${NAME%pat} ${NAME%%pat}, ${NAME/pat/new} ${NAME//pat/new} ${NAME/#pat/new} ${NAME/%pat/new}, ${NAME^} ${NAME^^} ${NAME,} ${NAME,,}; anything else is refused, as bash does
        if (/^([A-Za-z_][A-Za-z0-9_]*|[0-9]+|[?#@*$!])$/.test(body)) parts.push({ x: 'var', v: body, q });
        else if ((m = body.match(/^#([A-Za-z_][A-Za-z0-9_]*|[0-9]+|[@*])$/))) parts.push({ x: 'len', v: m[1], q });
        else if ((m = body.match(/^([A-Za-z_][A-Za-z0-9_]*|[0-9]+): ?\(?(-?\d+)\)?(?::\(?(-?\d+)\)?)?$/))) parts.push({ x: 'slice', v: m[1], from: +m[2], len: m[3] === undefined ? null : +m[3], q });   // a negative offset needs the space or the brackets, as in bash
        else if ((m = body.match(/^([A-Za-z_][A-Za-z0-9_]*|[0-9]+)(##?|%%?)([^]*)$/))) parts.push({ x: 'strip', v: m[1], op: m[2], pat: m[3], q });   // ${f%.txt} ${p##*/}: take a pattern off the start or the end
        else if ((m = body.match(/^([A-Za-z_][A-Za-z0-9_]*|[0-9]+)\/(\/|#|%)?([^]*)$/))) { const cut = splitSubst(m[3]); parts.push({ x: 'subst', v: m[1], all: m[2] === '/', anchor: m[2] === '#' || m[2] === '%' ? m[2] : '', pat: cut[0], repl: cut[1], q }); }   // ${s/a/b} ${s//a/b}
        else if ((m = body.match(/^([A-Za-z_][A-Za-z0-9_]*)(\^\^?|,,?)$/))) parts.push({ x: 'case', v: m[1], op: m[2], q });   // ${s^} ${s^^} ${s,} ${s,,}
        else if ((m = body.match(/^([A-Za-z_][A-Za-z0-9_]*|[0-9]+)(:?)([-=+])([^]*)$/))) parts.push({ x: 'def', v: m[1], colon: m[2] === ':', op: m[3], word: m[4], q });
        else parts.push({ x: 'bad', v: body, q });   // refused when it is expanded, as bash does
        return;
      }
      const m = src.slice(i).match(/^([A-Za-z_][A-Za-z0-9_]*|[0-9]|[?#@*$!])/);
      if (m) { parts.push({ x: 'var', v: m[1], q }); i += m[1].length; return; }
      parts.push({ v: '$', q });
    };
    while (i < n) {
      const c = src[i]; start = i;
      if (c === ' ' || c === '\t' || c === '\r') { i++; continue; }
      if (c === '\\' && src[i + 1] === '\n') { i += 2; continue; }
      if (c === '\n') { toks.push({ t: 'op', v: '\n' }); i++; continue; }
      if (c === '#') { while (i < n && src[i] !== '\n') i++; continue; }
      const two = src.substr(i, 2), four = src.substr(i, 4);
      if (four === '2>&1') { toks.push({ t: 'op', v: '2>&1' }); i += 4; continue; }
      if (src.substr(i, 3) === '2>>') { toks.push({ t: 'op', v: '2>>' }); i += 3; continue; }
      if (['||', '&&', '>>', '2>', '&>', ';;'].includes(two)) { if (two === ';;') synErr("syntax error near unexpected token `;;'"); toks.push({ t: 'op', v: two }); i += 2; continue; }
      if ('|;<>()&'.includes(c)) { if (c === '&') synErr('background jobs (&) are not available here'); toks.push({ t: 'op', v: c }); i++; continue; }
      // a word
      const parts = []; let q = null;
      while (i < n) {
        const ch = src[i];
        if (q === "'") { const j = src.indexOf("'", i); if (j < 0) synErr("unexpected EOF while looking for matching `''"); parts.push({ v: src.slice(i, j), q: true }); i = j + 1; q = null; continue; }
        if (q === '"') {
          if (ch === '"') { q = null; i++; continue; }
          if (ch === '\\' && i + 1 < n && '"\\$`\n'.includes(src[i + 1])) { if (src[i + 1] !== '\n') parts.push({ v: src[i + 1], q: true }); i += 2; continue; }
          if (ch === '\\') { parts.push({ v: '\\', q: true }); i++; continue; }   // \n inside "..." stays a backslash and an n
          if (ch === '$') { dollar(parts, true); continue; }
          if (ch === '`') { i++; const j = src.indexOf('`', i); if (j < 0) synErr('unexpected EOF while looking for matching ``\''); parts.push({ x: 'sub', v: src.slice(i, j), q: true }); i = j + 1; continue; }
          let j = i; while (j < n && !'"\\$`'.includes(src[j])) j++;
          parts.push({ v: src.slice(i, j), q: true }); i = j; continue;
        }
        if (ch === "'" || ch === '"') { q = ch; i++; if (q === "'" && src[i] === "'") { parts.push({ v: '', q: true }); i++; q = null; } else if (q === '"' && src[i] === '"') { parts.push({ v: '', q: true }); i++; q = null; } continue; }
        if (ch === '\\') { if (i + 1 >= n) synErr('unexpected EOF after \\'); if (src[i + 1] === '\n') { i += 2; continue; } parts.push({ v: src[i + 1], q: true }); i += 2; continue; }
        if (ch === '$') { dollar(parts, false); continue; }
        if (ch === '`') { i++; const j = src.indexOf('`', i); if (j < 0) synErr('unexpected EOF while looking for matching ``\''); parts.push({ x: 'sub', v: src.slice(i, j), q: false }); i = j + 1; continue; }
        if (' \t\r\n|;<>()&'.includes(ch)) break;
        if (ch === '#' && !parts.length) break;
        let j = i; while (j < n && !' \t\r\n|;<>()&\'"\\$`'.includes(src[j])) j++;
        parts.push({ v: src.slice(i, j), q: false }); i = j;
      }
      if (q) synErr('unexpected EOF while looking for matching `' + q + "'");
      toks.push({ t: 'word', parts });
    }
    return toks;
    } catch (e) { if (e instanceof SyntaxError_ && e.line === undefined) e.line = lineAt(start); throw e; }
  }
  const wordText = (w) => w.parts.map((p) => p.x ? '' : p.v).join('');
  const plainText = (w) => w.parts.every((p) => !p.x && !p.q) ? wordText(w) : null;   // the word if it is a bare literal, else null

  /* ---------------- the grammar ----------------
     list := andor ((';' | '\n')+ andor)*      andor := pipeline (('&&' | '||') pipeline)*      pipeline := ['!'] command ('|' command)*
     command := simple | if | for | while | until | '{' list '}' | '(' list ')'   each followed by redirections */
  function parse(src) {
    const toks = tokenize(src); let p = 0;
    try { return parseToks(); } catch (e) { if (e instanceof SyntaxError_ && e.line === undefined) e.line = (toks[p] || toks[toks.length - 1] || { line: 1 }).line; throw e; }
    function parseToks() {
    const peek = () => toks[p];
    const isOp = (v) => { const t = toks[p]; return !!t && t.t === 'op' && t.v === v; };
    const isWord = (v) => { const t = toks[p]; return !!t && t.t === 'word' && plainText(t) === v; };
    const expectWord = (v) => { if (!isWord(v)) synErr("syntax error near unexpected token `" + tokDesc(peek()) + "' (expected " + v + ')'); p++; };
    const skipNl = () => { while (isOp('\n') || isOp(';')) p++; };
    const tokDesc = (t) => !t ? 'end of line' : t.t === 'op' ? (t.v === '\n' ? 'newline' : t.v) : wordText(t);
    const REDIR = ['>', '>>', '<', '2>', '2>>', '&>', '2>&1'];
    const redirs = (list) => { while (peek() && peek().t === 'op' && REDIR.includes(peek().v)) { const op = toks[p++].v; if (op === '2>&1') { list.push({ op }); continue; } const t = toks[p++]; if (!t || t.t !== 'word') synErr("syntax error near unexpected token `" + tokDesc(t) + "'"); list.push({ op, target: t }); } };
    const listUntil = (stops) => {   // a list of commands ending before one of the stop words (not consumed)
      const items = []; skipNl();
      while (peek() && !stops.some(isWord) && !isOp(')')) {
        items.push(andor());
        if (isOp(';') || isOp('\n')) skipNl(); else if (peek() && !stops.some(isWord) && !isOp(')')) synErr("syntax error near unexpected token `" + tokDesc(peek()) + "'");
      }
      return { k: 'list', items };
    };
    const compound = () => {
      if (isWord('if')) {
        p++; const clauses = []; let els = null;
        const cond = listUntil(['then']); expectWord('then'); clauses.push({ cond, body: listUntil(['elif', 'else', 'fi']) });
        while (isWord('elif')) { p++; const c = listUntil(['then']); expectWord('then'); clauses.push({ cond: c, body: listUntil(['elif', 'else', 'fi']) }); }
        if (isWord('else')) { p++; els = listUntil(['fi']); }
        expectWord('fi');
        return { k: 'if', clauses, els };
      }
      if (isWord('for')) {
        p++; const t = toks[p++]; if (!t || t.t !== 'word' || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(plainText(t) || '') || RESERVED.includes(plainText(t))) synErr("syntax error near unexpected token `" + tokDesc(t) + "' (for needs a variable name)");
        let words = null;
        if (isWord('in')) { p++; words = []; while (peek() && peek().t === 'word') words.push(toks[p++]); }
        if (!isOp(';') && !isOp('\n')) synErr("syntax error near unexpected token `" + tokDesc(peek()) + "'");
        skipNl(); expectWord('do'); const body = listUntil(['done']); expectWord('done');
        return { k: 'for', name: plainText(t), words, body };
      }
      if (isWord('while') || isWord('until')) {
        const until = isWord('until'); p++;
        const cond = listUntil(['do']); expectWord('do'); const body = listUntil(['done']); expectWord('done');
        return { k: 'while', cond, body, until };
      }
      if (isWord('{')) { p++; const body = listUntil(['}']); expectWord('}'); return { k: 'group', body }; }
      if (isOp('(')) { p++; const body = listUntil([]); if (!isOp(')')) synErr("syntax error: unexpected end of file (expected `)')"); p++; return { k: 'group', body, sub: true }; }
      return null;
    };
    const command = () => {
      const c = compound();
      if (c) { c.redirs = []; redirs(c.redirs); return c; }
      const node = { k: 'simple', assigns: [], words: [], redirs: [], line: peek() ? peek().line : 0 };
      let first = true;
      while (peek() && (peek().t === 'word' || (peek().t === 'op' && REDIR.includes(peek().v)))) {
        if (peek().t === 'op') { redirs(node.redirs); continue; }
        const w = toks[p];
        const txt = plainText(w);
        if (first && txt !== null && RESERVED.includes(txt) && txt !== 'in') synErr("syntax error near unexpected token `" + txt + "'");
        const m = !node.words.length && w.parts.length && !w.parts[0].x && !w.parts[0].q ? w.parts[0].v.match(/^([A-Za-z_][A-Za-z0-9_]*)=/) : null;
        if (m) { const rest = { parts: w.parts.slice() }; rest.parts[0] = { v: w.parts[0].v.slice(m[0].length), q: false }; node.assigns.push([m[1], rest]); p++; first = false; continue; }
        node.words.push(w); p++; first = false;
      }
      if (!node.words.length && !node.assigns.length && !node.redirs.length) synErr("syntax error near unexpected token `" + tokDesc(peek()) + "'");
      return node;
    };
    const pipeline = () => {
      let neg = false; if (isWord('!')) { neg = true; p++; }
      const cmds = [command()];
      while (isOp('|')) { p++; skipNl(); if (!peek()) synErr('syntax error: unexpected end of file'); cmds.push(command()); }
      return { k: 'pipe', cmds, neg };
    };
    const andor = () => {
      const line = peek() ? peek().line : 0, first = pipeline(); const rest = [];
      while (isOp('&&') || isOp('||')) { const op = toks[p++].v; skipNl(); if (!peek()) synErr('syntax error: unexpected end of file'); rest.push({ op, p: pipeline() }); }
      return { k: 'andor', first, rest, line };
    };
    const list = listUntil([]);
    if (p < toks.length) synErr("syntax error near unexpected token `" + tokDesc(peek()) + "'");
    return list;
    }
  }

  /* ---------------- $(( arithmetic )) ---------------- */
  // bash's integer arithmetic: numbers in base 10, 0x hex and 0 octal; variables (their values are expressions too); = += -= *= /= %=,
  // x++ x-- ++x --x; unary - + ! bind tighter than **. Errors use bash's words: "EXPR: MESSAGE (error token is "REST")".
  function arith(src, vars, setVar, depth) {
    depth = depth || 0;
    const shown = src.replace(/^\s+/, '');
    const fail = (msg, at, tok) => { const e = new SyntaxError_((tok ? shown.replace(/\s+$/, '') : shown) + ': ' + msg + ' (error token is "' + (tok || src.slice(at)) + '")'); e.exit = 1; throw e; };
    // tokens, each with where it starts in src
    const toks = [], re = /(0[xX][0-9A-Fa-f]*|\d[A-Za-z0-9_]*)|([A-Za-z_][A-Za-z0-9_]*)|(\*\*|\+\+|--|<=|>=|==|!=|&&|\|\||[-+*\/%]=|[-+*\/%()<>!=])/y;
    for (let pos = 0; ;) {
      while (pos < src.length && /\s/.test(src[pos])) pos++;
      if (pos >= src.length) break;
      re.lastIndex = pos; const m = re.exec(src);
      if (!m) fail('syntax error: invalid arithmetic operator', pos);
      toks.push({ v: m[0], pos, k: m[1] ? 'num' : m[2] ? 'name' : 'op' }); pos = re.lastIndex;
    }
    // ++ and -- belong to a variable next to them; otherwise they are two signs (1--2 is 1 - -2)
    for (let k = 0; k < toks.length; k++) {
      const t = toks[k];
      if ((t.v === '++' || t.v === '--') && !(toks[k - 1] && toks[k - 1].k === 'name') && !(toks[k + 1] && toks[k + 1].k === 'name')) toks.splice(k, 1, { v: t.v[0], pos: t.pos, k: 'op' }, { v: t.v[0], pos: t.pos + 1, k: 'op' });
    }
    if (!toks.length) return 0;
    let i = 0; const peek = () => toks[i] && toks[i].v, at = () => (toks[i] || toks[toks.length - 1]).pos;
    const number = (text, pos) => {
      if (/^0[xX]/.test(text)) { if (!/^0[xX][0-9A-Fa-f]*$/.test(text)) fail('value too great for base', pos, text); return text.length > 2 ? parseInt(text.slice(2), 16) : 0; }
      if (/^0\d/.test(text)) { if (!/^0[0-7]+$/.test(text)) fail('value too great for base', pos, text); return parseInt(text, 8); }
      if (!/^\d+$/.test(text)) fail('value too great for base', pos, text);
      return parseInt(text, 10);
    };
    const value = (name) => {   // a variable's value is itself an expression (an empty or unset one is 0)
      const v = String(vars(name) || '').trim();
      if (v === '') return 0;
      if (depth > 10) { const e = new SyntaxError_(name + ': expression recursion level exceeded'); e.exit = 1; throw e; }
      return arith(v, vars, setVar, depth + 1);
    };
    const assign = (name, v) => { if (setVar) setVar(name, String(v)); return v; };
    const prim = () => {
      const t = toks[i];
      if (!t) fail('syntax error: operand expected', at());
      if (t.v === '(') { i++; const v = expr(); if (peek() !== ')') fail("missing `)'", at()); i++; return v; }
      if (t.k === 'num') { i++; return number(t.v, t.pos); }
      if (t.k === 'name') { i++; if (peek() === '++' || peek() === '--') { const op = toks[i++].v, old = value(t.v); assign(t.v, op === '++' ? old + 1 : old - 1); return old; } return value(t.v); }
      fail('syntax error: operand expected', t.pos);
    };
    const unary = () => {
      const t = peek();
      if (t === '-') { i++; return -unary(); } if (t === '+') { i++; return unary(); } if (t === '!') { i++; return unary() ? 0 : 1; }
      if ((t === '++' || t === '--') && toks[i + 1] && toks[i + 1].k === 'name') { i++; const name = toks[i++].v; return assign(name, value(name) + (t === '++' ? 1 : -1)); }
      return prim();
    };
    const pow = () => { const b = unary(); if (peek() === '**') { i++; const p0 = at(), e = pow(); if (e < 0) fail('exponent less than 0', p0); return Math.pow(b, e); } return b; };
    const mul = () => { let a = pow(); while (['*', '/', '%'].includes(peek())) { const op = toks[i++].v, p0 = at(), b = pow(); if (op === '*') a = a * b; else { if (b === 0) fail('division by 0', p0); a = op === '/' ? Math.trunc(a / b) : a % b; } } return a; };
    const add = () => { let a = mul(); while (peek() === '+' || peek() === '-') { const op = toks[i++].v; const b = mul(); a = op === '+' ? a + b : a - b; } return a; };
    const cmp = () => { let a = add(); while (['<', '>', '<=', '>='].includes(peek())) { const op = toks[i++].v; const b = add(); a = (op === '<' ? a < b : op === '>' ? a > b : op === '<=' ? a <= b : a >= b) ? 1 : 0; } return a; };
    const eq = () => { let a = cmp(); while (peek() === '==' || peek() === '!=') { const op = toks[i++].v; const b = cmp(); a = (op === '==' ? a === b : a !== b) ? 1 : 0; } return a; };
    const and = () => { let a = eq(); while (peek() === '&&') { i++; const b = eq(); a = a && b ? 1 : 0; } return a; };
    const or = () => { let a = and(); while (peek() === '||') { i++; const b = and(); a = a || b ? 1 : 0; } return a; };
    const expr = () => {   // NAME = value, NAME += value, ...: the lowest precedence, right to left
      const t = toks[i], op = toks[i + 1] && toks[i + 1].v;
      if (t && t.k === 'name' && ['=', '+=', '-=', '*=', '/=', '%='].includes(op)) {
        i += 2; const p0 = at(), b = expr(), old = op === '=' ? 0 : value(t.v);
        if ((op === '/=' || op === '%=') && b === 0) fail('division by 0', p0);
        return assign(t.v, op === '=' ? b : op === '+=' ? old + b : op === '-=' ? old - b : op === '*=' ? old * b : op === '/=' ? Math.trunc(old / b) : old % b);
      }
      return or();
    };
    const v = expr(); if (i < toks.length) fail(toks[i].v === '=' ? 'attempted assignment to non-variable' : 'syntax error in expression', toks[i].pos);
    return v;
  }

  /* ---------------- ${NAME#pat} ${NAME/pat/new} and the like ---------------- */
  // Unlike a file name pattern, * and ? here also match a slash. Quoted text and \x are literal. Returns a function: does the whole text match?
  function paramPattern(text) {
    let re = '', i = 0;
    const lit = (c) => c.replace(/[.*+?^${}()|[\]\\\/-]/g, '\\$&');
    while (i < text.length) {
      const c = text[i];
      if (c === '\\') { if (i + 1 < text.length) re += lit(text[i + 1]); i += 2; continue; }
      if (c === "'" || c === '"') { const j = text.indexOf(c, i + 1); if (j > 0) { re += lit(text.slice(i + 1, j)); i = j + 1; continue; } }
      if (c === '*') { re += '[\\s\\S]*'; i++; continue; }
      if (c === '?') { re += '[\\s\\S]'; i++; continue; }
      if (c === '[') { const j = text.indexOf(']', i + 2); if (j > 0) { let body = text.slice(i + 1, j); const neg = body[0] === '!' || body[0] === '^'; if (neg) body = body.slice(1); re += '[' + (neg ? '^' : '') + body.replace(/[\\\]^]/g, '\\$&') + ']'; i = j + 1; continue; } }
      re += lit(c); i++;
    }
    const full = new RegExp('^(?:' + re + ')$');
    return (t) => full.test(t);
  }
  // ${v/pat/repl}: the text after the first / that is not quoted or escaped is the replacement
  function splitSubst(text) {
    for (let i = 0, q = null; i < text.length; i++) {
      const c = text[i];
      if (c === '\\') { i++; continue; }
      if (q) { if (c === q) q = null; continue; }
      if (c === "'" || c === '"') { q = c; continue; }
      if (c === '/') return [text.slice(0, i), text.slice(i + 1)];
    }
    return [text, null];
  }
  // The replacement: quotes and \x are literal, and (as in bash 5.2) an unquoted & stands for the text that matched.
  function replacementText(text, matched) {
    let out = '';
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '\\' && i + 1 < text.length) { out += text[++i]; continue; }
      if (c === "'" || c === '"') { const j = text.indexOf(c, i + 1); if (j > 0) { out += text.slice(i + 1, j); i = j; continue; } }
      out += c === '&' ? matched : c;
    }
    return out;
  }
  function stripPattern(v, op, test) {
    const n = v.length;
    if (op[0] === '#') { if (op.length === 1) { for (let k = 0; k <= n; k++) if (test(v.slice(0, k))) return v.slice(k); } else { for (let k = n; k >= 0; k--) if (test(v.slice(0, k))) return v.slice(k); } }
    else { if (op.length === 1) { for (let k = n; k >= 0; k--) if (test(v.slice(k))) return v.slice(0, k); } else { for (let k = 0; k <= n; k++) if (test(v.slice(k))) return v.slice(0, k); } }
    return v;
  }
  function substitute(v, p, test, repl) {
    if (p.pat === '') return v;
    const n = v.length; let out = '', i = 0, did = false;
    const longest = (s) => { for (let e = n; e > s; e--) if (test(v.slice(s, e))) return e; return -1; };   // an empty match is no match
    if (p.anchor === '%') { for (let s = 0; s < n; s++) if (test(v.slice(s))) return v.slice(0, s) + repl(v.slice(s)); return v; }
    while (i < n) {
      const e = (p.anchor === '#' && i > 0) ? -1 : longest(i);
      if (e < 0) { out += v[i]; i++; if (p.anchor === '#') { out += v.slice(i); return out; } continue; }
      out += repl(v.slice(i, e)); i = e; did = true;
      if (!p.all || p.anchor === '#') { out += v.slice(i); return out; }
    }
    return did ? out : v;
  }

  /* ---------------- wildcards ---------------- */
  // A pattern is a string in which \ protects the next character (quoted text in the word). * ? [...] are the wildcards.
  const GLOB_CHARS = /[*?[]/;
  function globToRegExp(pat, anchored) {
    let re = ''; for (let i = 0; i < pat.length; i++) {
      const c = pat[i];
      if (c === '\\') { i++; if (i < pat.length) re += pat[i].replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&'); }
      else if (c === '*') re += '[^/]*'; else if (c === '?') re += '[^/]';
      else if (c === '[') { const j = pat.indexOf(']', i + 1); if (j < 0) { re += '\\['; continue; } let body = pat.slice(i + 1, j); if (body[0] === '!' || body[0] === '^') body = '^' + body.slice(1); re += '[' + body.replace(/\\/g, '\\\\') + ']'; i = j; }
      else re += c.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
    }
    return new RegExp(anchored === false ? re : '^' + re + '$');
  }
  const unescapeGlob = (s) => s.replace(/\\(.)/g, '$1');
  function globExpand(fs, pat) {
    const absolute = pat.startsWith('/');
    const comps = pat.split('/').filter((c, i, a) => c !== '' || false);
    let bases = [absolute ? '/' : ''];   // '' = relative to cwd
    const join = (b, c) => b === '' ? c : b === '/' ? '/' + c : b + '/' + c;
    for (let k = 0; k < comps.length; k++) {
      const comp = comps[k]; const next = [];
      for (const b of bases) {
        if (!GLOB_CHARS.test(comp.replace(/\\./g, ''))) { const name = unescapeGlob(comp); const cand = join(b, name); if (k === comps.length - 1 ? fs.exists(fs.resolve(cand)) : fs.isDir(fs.resolve(cand))) next.push(cand); continue; }
        const dir = fs.resolve(b === '' ? '.' : b); if (!fs.isDir(dir)) continue;
        const re = globToRegExp(comp);
        for (const name of fs.list(dir)) { if (name.startsWith('.') && !comp.startsWith('.')) continue; if (!re.test(name)) continue; const cand = join(b, name); if (k < comps.length - 1 && !fs.isDir(fs.resolve(cand))) continue; next.push(cand); }
      }
      bases = next;
    }
    const out = bases.filter((b) => b !== '' && b !== '/' || comps.length === 0).sort(nameOrder);
    // a pattern ending in / (*/) matches only directories, and keeps the slash, as in bash
    return /\/$/.test(pat) && comps.length ? out.filter((b) => fs.isDir(fs.resolve(b))).map((b) => b + '/') : out;
  }
  // {a,b,c} and {1..5}: one level, done before anything else
  function braceExpand(s) {
    const m = s.match(/^(.*?)\{([^{}]*)\}(.*)$/);
    if (!m) return [s];
    const body = m[2]; let items;
    const r = body.match(/^(-?\d+)\.\.(-?\d+)$/);
    const lr = body.match(/^([A-Za-z])\.\.([A-Za-z])$/);
    if (r) { const a = +r[1], b = +r[2]; if (Math.abs(b - a) > 1000) return [s]; items = []; for (let i = a; a <= b ? i <= b : i >= b; a <= b ? i++ : i--) items.push(String(i)); }
    else if (lr) { const a = lr[1].charCodeAt(0), b = lr[2].charCodeAt(0); items = []; for (let i = a; a <= b ? i <= b : i >= b; a <= b ? i++ : i--) items.push(String.fromCharCode(i)); }
    else if (body.includes(',')) items = body.split(',');
    else return [s];
    // the items hold no braces, so only the rest of the word can expand further; several braces in a row multiply, so the product is capped
    const tails = braceExpand(m[3]);
    if (items.length * tails.length > LIMITS.brace) return [s];
    const out = [];
    for (const it of items) for (const t of tails) out.push(m[1] + it + t);
    return out;
  }

  /* ---------------- running ---------------- */
  function Stop(kind, code) { this.kind = kind; this.code = code; }   // 'exit' (exit n), 'cancel' (Ctrl+C), 'steps', 'output'
  const cap = (s, n) => s.length > n ? s.slice(0, n) : s;

  function makeShell(opts) {
    opts = opts || {};
    const fs = opts.fs || makeFS();
    const now = opts.now || fs.now;
    const sh = { fs, vars: dict(), history: [], lastExit: 0, cancelled: false, steps: 0, outBytes: 0, LIMITS, hooks: opts };
    Object.assign(sh.vars, { HOME, USER, HOSTNAME: HOST, SHELL: '/bin/bash', PATH: '/usr/local/bin:/usr/bin:/bin', TERM: 'xterm-256color', LANG: 'en_US.UTF-8', PS1: '\\u@\\h:\\w\\$ ' });
    const getVar = (name, ctx) => {
      if (name === '?') return String(sh.lastExit);
      if (name === '#') return String(ctx.args.length);
      if (name === '@' || name === '*') return ctx.args.join(' ');
      if (name === '0') return ctx.name || 'bash';
      if (/^[0-9]+$/.test(name)) return ctx.args[+name - 1] || '';
      if (name === '$') return '4242';
      if (name === 'RANDOM') return String(Math.floor(Math.random() * 32768));
      if (name === 'PWD') return fs.cwd;
      if (name === 'OLDPWD') return sh.oldpwd || '';
      return has(sh.vars, name) ? sh.vars[name] : '';
    };
    const setVar = (name, v) => { if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) return; sh.vars[name] = cap(String(v), LIMITS.vars); };
    const tilde = (fsPath) => fsPath === HOME ? '~' : fsPath.startsWith(HOME + '/') ? '~' + fsPath.slice(HOME.length) : fsPath;
    sh.prompt = () => USER + '@' + HOST + ':' + tilde(fs.cwd) + '$ ';
    sh.cancel = () => { sh.cancelled = true; if (opts.cancel) opts.cancel(); };
    const tick = () => { if (sh.cancelled) throw new Stop('cancel', 130); if (++sh.steps > LIMITS.steps) throw new Stop('steps', 1); };

    // ----- expanding words
    async function expandWord(w, ctx, io) {
      // 1. brace expansion on a bare literal word
      if (!w.noBrace && w.parts.every((p) => !p.x && !p.q) && /\{.*\}/.test(wordText(w))) { const outs = []; for (const s of braceExpand(wordText(w))) outs.push(...await expandWord({ parts: [{ v: s, q: false }], noBrace: true }, ctx, io)); return outs; }
      // 2. parameters, commands, arithmetic → fields (lists of chunks; each chunk knows whether it was quoted)
      const fields = [[]]; let any = false;
      const push = (v, q) => { fields[fields.length - 1].push({ v, q }); };
      const quotedAt = (p) => p.x === 'var' && p.v === '@' && p.q;
      for (const p of w.parts) {
        if (!p.x) { push(p.v, p.q); any = any || p.v !== '' || p.q; continue; }
        // "$@": each argument is its own word; with no arguments, a word that is only "$@" disappears
        if (quotedAt(p)) { ctx.args.forEach((a, k) => { if (k > 0) fields.push([]); push(a, true); any = true; }); continue; }
        let v;
        if (p.x === 'bad') { const e = new SyntaxError_('${' + p.v + '}: bad substitution'); e.exit = 1; throw e; }
        if (p.x === 'var') v = getVar(p.v, ctx);
        else if (p.x === 'len') v = String(p.v === '@' || p.v === '*' ? ctx.args.length : getVar(p.v, ctx).length);
        else if (p.x === 'slice') {
          const cur = getVar(p.v, ctx), n = cur.length, from = p.from < 0 ? n + p.from : p.from;
          if (from < 0 || from > n) v = '';   // an offset before the start or past the end gives nothing
          else if (p.len === null) v = cur.slice(from);
          else { const end = p.len < 0 ? n + p.len : from + p.len; if (end < from) { const e = new SyntaxError_(p.v + ': substring expression < 0'); e.exit = 1; throw e; } v = cur.slice(from, end); }
        }
        else if (p.x === 'strip') { v = stripPattern(getVar(p.v, ctx), p.op, paramPattern(expandVarsIn(p.pat, ctx))); }
        else if (p.x === 'subst') { const repl = p.repl === null ? '' : expandVarsIn(p.repl, ctx); v = substitute(getVar(p.v, ctx), p, paramPattern(expandVarsIn(p.pat, ctx)), (m) => replacementText(repl, m)); }
        else if (p.x === 'case') { const cur = getVar(p.v, ctx), up = p.op[0] === '^'; v = p.op.length === 2 ? (up ? cur.toUpperCase() : cur.toLowerCase()) : (up ? cur.slice(0, 1).toUpperCase() : cur.slice(0, 1).toLowerCase()) + cur.slice(1); }
        else if (p.x === 'def') {
          const cur = getVar(p.v, ctx), isSet = /^[0-9]+$/.test(p.v) ? +p.v <= ctx.args.length : has(sh.vars, p.v);
          const word = () => p.word.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}|\$([A-Za-z_][A-Za-z0-9_]*|[0-9?#])/g, (m, a, b) => getVar(a || b, ctx));
          const filled = p.colon ? cur !== '' : isSet;
          if (p.op === '+') v = filled ? word() : '';
          else if (filled) v = cur;
          else { v = word(); if (p.op === '=') setVar(p.v, v); }
        }
        else if (p.x === 'arith') { const text = p.v.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*|[0-9]+|[?#])\}|\$([A-Za-z_][A-Za-z0-9_]*|[0-9?#])/g, (m, a, b) => getVar(a || b, ctx)); v = String(arith(text, (n) => getVar(n, ctx), setVar)); }   // $x inside is replaced first, as in bash
        else { v = (await capture(p.v, ctx, io)).replace(/\n+$/, ''); }
        if (p.q) { push(v, true); any = true; continue; }
        const pieces = v.split(/[ \t\n]+/);
        pieces.forEach((piece, k) => { if (k > 0) fields.push([]); if (piece !== '') { push(piece, false); any = true; } });
      }
      if (!any && !w.parts.some((p) => p.q)) return [];
      if (!ctx.args.length && w.parts.some(quotedAt) && w.parts.every((p) => quotedAt(p) || (!p.x && p.v === ''))) return [];
      const out = [];
      for (const f of fields) {
        if (!f.length) continue;
        // 3. ~ at the start, then wildcards on unquoted text; quoted characters are protected with \ in the pattern
        if (f[0].v.startsWith('~') && !f[0].q) { const m = f[0].v.match(/^~([^/]*)(.*)$/); if (m[1] === '' || m[1] === USER) f[0] = { v: HOME + m[2], q: false }; }
        const pat = f.map((c) => c.q ? c.v.replace(/[\\*?[\]]/g, '\\$&') : c.v).join('');
        if (f.some((c) => !c.q && GLOB_CHARS.test(c.v))) { const m = globExpand(fs, pat); if (m.length) { out.push(...m); continue; } }
        out.push(unescapeGlob(pat));
      }
      return out;
    }
    // $x and ${x} inside the pattern or the replacement of a ${...} are replaced first (text in single quotes is left alone)
    const expandVarsIn = (text, ctx) => text.replace(/'[^']*'|\$\{([A-Za-z_][A-Za-z0-9_]*)\}|\$([A-Za-z_][A-Za-z0-9_]*|[0-9?#])/g, (m, a, b) => (m[0] === "'" ? m : getVar(a || b, ctx)));
    const expandAll = async (words, ctx, io) => { const out = []; for (const w of words) out.push(...await expandWord(w, ctx, io)); return out; };
    const expandOne = async (w, ctx, io) => (await expandWord(w, ctx, io)).join(' ');   // a redirection target or an assignment value: one field, no splitting

    // ----- running a text and keeping its output (for $(...))
    async function capture(text, ctx, io) {
      let buf = ''; const sub = Object.assign({}, io, { out: (s) => { buf += s; if (buf.length > LIMITS.out) throw new Stop('output', 1); }, tty: false });
      await runList(parse(text), ctx, sub);
      return buf;
    }

    // ----- lists, pipelines, compound commands
    async function runList(node, ctx, io) {
      let exit = 0;
      for (const item of node.items) exit = await runAndOr(item, ctx, io);
      return exit;
    }
    async function runAndOr(node, ctx, io) {
      let exit = await runPipe(node.first, ctx, io);
      for (const r of node.rest) { if ((r.op === '&&' && exit === 0) || (r.op === '||' && exit !== 0)) exit = await runPipe(r.p, ctx, io); }
      return exit;
    }
    async function runPipe(node, ctx, io) {
      let input = io.stdin, exit = 0;
      for (let i = 0; i < node.cmds.length; i++) {
        const last = i === node.cmds.length - 1;
        let buf = '';
        const sub = Object.assign({}, io, { stdin: input, out: last ? io.out : (s) => { buf += s; if (buf.length > LIMITS.out) throw new Stop('output', 1); }, tty: last ? io.tty : false });
        if (i > 0) sub.stdin = stdinOf(input);
        exit = await runCommand(node.cmds[i], ctx, sub);
        input = buf;
      }
      sh.lastExit = node.neg ? (exit === 0 ? 1 : 0) : exit;
      return sh.lastExit;
    }
    // redirections wrap any command: stdin from a file, stdout and stderr to files (truncated when the command starts, as in bash)
    async function withRedirs(redirs, ctx, io, body) {
      if (!redirs || !redirs.length) return body(io);
      const sub = Object.assign({}, io); const writes = [];
      let outBuf = null, errBuf = null;
      for (const r of redirs) {
        // 2>&1 sends errors wherever the output goes at that point, so the order counts: > f 2>&1 puts both in f, 2>&1 > f only the output
        if (r.op === '2>&1') { errBuf = outBuf || 'out'; continue; }
        const target = await expandOne(r.target, ctx, io); const abs = fs.resolve(target);
        if (abs === '/dev/null') { if (r.op === '<') sub.stdin = stdinOf(''); else { const w = { abs: null, buf: '' }; if (r.op !== '2>' && r.op !== '2>>') outBuf = w; if (r.op !== '>' && r.op !== '>>') errBuf = w; } continue; }
        try {
          if (r.op === '<') { sub.stdin = stdinOf(fs.read(abs)); continue; }
          const append = r.op === '>>' || r.op === '2>>';
          fs.write(abs, '', append);
          const w = { abs, buf: '' }; writes.push(w);
          if (r.op === '>' || r.op === '>>' || r.op === '&>') { outBuf = w; }
          if (r.op === '2>' || r.op === '2>>' || r.op === '&>') { errBuf = w; }
        } catch (e) { if (e instanceof FsError) { io.err('bash: ' + target + ': ' + e.message + '\n'); return 1; } throw e; }
      }
      const limit = (w) => { if (w.buf.length > LIMITS.fileBytes) throw new Stop('output', 1); };
      if (outBuf) { sub.out = outBuf.abs === null ? () => { } : (s) => { outBuf.buf += s; limit(outBuf); }; sub.tty = false; }
      if (errBuf === 'out') sub.err = (s) => io.out(s);
      else if (errBuf) sub.err = errBuf.abs === null ? () => { } : (s) => { errBuf.buf += s; limit(errBuf); };
      let exit;
      try { exit = await body(sub); }
      finally { for (const w of writes) { try { fs.write(w.abs, w.buf, true); } catch (e) { io.err('bash: ' + tilde(w.abs) + ': ' + (e instanceof FsError ? e.message : e.message) + '\n'); } } }
      return exit;
    }
    async function runCommand(node, ctx, io) {
      return withRedirs(node.redirs, ctx, io, async (io2) => {
        if (node.k === 'simple') return runSimple(node, ctx, io2);
        if (node.k === 'group') { if (node.sub) { const cwd = fs.cwd; try { return await runList(node.body, ctx, io2); } finally { fs.cwd = cwd; } } return runList(node.body, ctx, io2); }
        if (node.k === 'if') {
          for (const c of node.clauses) { tick(); if (await runList(c.cond, ctx, io2) === 0) return runList(c.body, ctx, io2); }
          return node.els ? runList(node.els, ctx, io2) : 0;
        }
        if (node.k === 'for') {
          const items = node.words ? await expandAll(node.words, ctx, io2) : ctx.args.slice();
          let exit = 0;
          for (const it of items) { tick(); setVar(node.name, it); exit = await runList(node.body, ctx, io2); }
          return exit;
        }
        if (node.k === 'while') {
          let exit = 0;
          for (;;) { tick(); const c = await runList(node.cond, ctx, io2); if ((c === 0) === node.until) break; exit = await runList(node.body, ctx, io2); }
          return exit;
        }
        return 0;
      });
    }
    async function runSimple(node, ctx, io) {
      tick(); if (node.line) ctx.line = node.line;
      const words = await expandAll(node.words, ctx, io);
      if (!words.length) { for (const [name, w] of node.assigns) setVar(name, await expandOne(w, ctx, io)); return 0; }
      const saved = [];   // VAR=value cmd: the variable holds for that command only
      for (const [name, w] of node.assigns) { saved.push([name, has(sh.vars, name) ? sh.vars[name] : null]); setVar(name, await expandOne(w, ctx, io)); }
      try { return await runWords(words, ctx, io); }
      finally { for (const [name, old] of saved) { if (old === null) delete sh.vars[name]; else sh.vars[name] = old; } }
    }
    async function runWords(words, ctx, io) {
      const name = words[0], args = words.slice(1);
      if (has(COMMANDS, name)) {
        try { const r = await COMMANDS[name].run(args, io, sh, ctx); return typeof r === 'number' ? r : 0; }
        catch (e) { if (e instanceof FsError) { io.err(name + ': ' + (e.path ? tilde(e.path) + ': ' : '') + e.message + '\n'); return 1; } throw e; }
      }
      if (name.includes('/')) return runPath(name, args, ctx, io);
      io.err('bash: ' + name + ': command not found\n');
      return 127;
    }
    // ./program, ./script.sh, /bin/ls
    async function runPath(name, args, ctx, io) {
      const abs = fs.resolve(name), n = fs.stat(abs);
      if (!n) { io.err('bash: ' + name + ': No such file or directory\n'); return 127; }
      if (n.t === 'd') { io.err('bash: ' + name + ': Is a directory\n'); return 126; }
      if (abs.startsWith('/bin/') && has(COMMANDS, abs.slice(5))) return runWords([abs.slice(5)].concat(args), ctx, io);
      if (!n.x) { io.err('bash: ' + name + ': Permission denied\n'); return 126; }
      if (n.bin) return runProgram(n.bin, name, args, io);
      const m = n.d.match(/^#!\s*(\S+)(?:\s+(\S+))?/);
      const interp = m ? (m[1].endsWith('/env') ? m[2] || '' : m[1].split('/').pop()) : 'bash';
      if (/^python/.test(interp)) return runProgram({ lang: 'python', src: n.d }, name, args, io);
      if (interp === 'bash' || interp === 'sh') return runScript(n.d, name, args, io, true);
      io.err('bash: ' + name + ': cannot execute: ' + interp + ' is not available here\n');
      return 126;
    }
    // a script runs in this shell (its variables stay), with its own arguments; exit ends only the script
    // fromFile (bash s.sh, ./s.sh, source s.sh): the shell's own messages say where they come from, "s.sh: line 2: ...", as bash's do
    async function runScript(text, name, args, io, fromFile) {
      const ctx = { name, args, line: 1 };
      const where = (line) => fromFile ? name + ': line ' + line + ': ' : name + ': ';
      if (fromFile) io = Object.assign({}, io, { err: ((err) => (s) => err(String(s).replace(/^bash: /, where(ctx.line))))(io.err) });
      try {
        // an error in an expansion ($((1/0)), a bad ${...}) abandons the rest of its line, and the script goes on with the next one
        const list = parse(text); let exit = 0, skip = 0;
        for (const item of list.items) {
          if (item.line && item.line === skip) continue;
          try { exit = await runAndOr(item, ctx, io); }
          catch (e) { if (!(e instanceof SyntaxError_ && e.exit)) throw e; io.err(where(ctx.line) + e.message + '\n'); sh.lastExit = exit = e.exit; skip = item.line; }
        }
        return exit;
      }
      catch (e) {
        if (e instanceof Stop && e.kind === 'exit') return e.code;
        if (e instanceof SyntaxError_) { io.err(where(e.line || ctx.line) + e.message + '\n'); return e.exit || 2; }
        throw e;
      }
    }
    sh.runScript = runScript;
    // a program in one of the site's languages, through the sandbox hook. stdin: the pipe or file, or the keyboard.
    async function runProgram(bin, name, args, io) {
      if (!opts.run) { io.err(name + ': programs cannot run here\n'); return 126; }
      let stdin = io.stdin ? await readAll(io, name) : null;
      if (stdin == null && bin.lang !== 'python' && !(io.ask && opts.typedInput && opts.typedInput(bin.lang, bin.src, bin.std)) && readsInput(bin.lang, bin.src)) {   // typedInput: it asks a line at a time itself
        if (!io.ask) stdin = '';
        else { io.err('(this program reads input: type each value and press Enter; an empty line ends the input)\n'); const lines = []; while (lines.length < 10000) { const l = await io.ask(''); if (l === '' || l == null) break; lines.push(l); } stdin = lines.join('\n') + (lines.length ? '\n' : ''); }
      }
      const r = await opts.run(bin.lang, bin.src, { stdin: stdin == null ? null : stdin, args, std: bin.std, name, onOutput: (s) => { sh.outBytes += s.length; io.out(s); }, onInput: io.ask ? (p) => io.ask(p) : null });
      if (sh.cancelled) throw new Stop('cancel', 130);
      if (r && r.err) { io.err(r.err.replace(/\n?$/, '\n')); return r.exit || 1; }
      return (r && r.exit) || 0;
    }
    const readsInput = (lang, src) => lang === 'cpp' ? /\b(cin|getline|scanf|getchar)\b/.test(src) : lang === 'java' ? /\bScanner\b|System\.in/.test(src) : lang === 'scheme' ? /\(read\)/.test(src) : /\binput\s*\(/.test(src);
    sh.runProgram = runProgram;

    // ----- the entry point
    sh.exec = async (line, io) => {
      io = Object.assign({ out: () => { }, err: () => { }, tty: true }, io || {});
      if (!io.err) io.err = io.out;
      io.stdin = io.stdin == null ? null : (typeof io.stdin === 'string' ? stdinOf(io.stdin) : io.stdin);
      line = String(line).replace(/\u0000/g, '');
      if (line.trim() && (sh.history.length === 0 || sh.history[sh.history.length - 1] !== line)) { sh.history.push(line); if (sh.history.length > LIMITS.history) sh.history.shift(); }
      sh.cancelled = false; sh.steps = 0; sh.outBytes = 0;
      const ctx = { name: 'bash', args: [] };
      try { sh.lastExit = await runList(parse(line), ctx, io); }
      catch (e) {
        if (e instanceof SyntaxError_) { io.err('bash: ' + e.message + '\n'); sh.lastExit = e.exit || 2; }
        else if (e instanceof Stop) {
          if (e.kind === 'cancel') io.err('^C\n');
          else if (e.kind === 'steps') io.err('bash: stopped: more than ' + LIMITS.steps + ' commands ran from this line. Is there a loop that never ends?\n');
          else if (e.kind === 'output') io.err('bash: stopped: the command produced more output than this terminal keeps.\n');
          sh.lastExit = e.code;
        } else if (e instanceof FsError) { io.err('bash: ' + (e.path ? tilde(e.path) + ': ' : '') + e.message + '\n'); sh.lastExit = 1; }
        else { io.err('bash: internal error: ' + (e && e.message || e) + '\n'); sh.lastExit = 1; }
      }
      return sh.lastExit;
    };

    // ----- tab completion: the first word from the commands, later words from the files (only directories after cd and rmdir).
    // Returns { start, items, display }: the items replace the line from `start`; each ends in a space (a file) or a slash (a directory),
    // with spaces and quotes in names escaped; display holds the bare names for a list.
    sh.complete = (line) => {
      const m = line.match(/(?:^|[\s|;&()<>])((?:[^\s|;&()<>\\]|\\.)*)$/);
      let word = m ? m[1] : line, start = line.length - word.length;
      let quote = '';
      if (word[0] === '"' || word[0] === "'") { quote = word[0]; word = word.slice(1); }
      word = word.replace(/\\(.)/g, '$1');
      const before = line.slice(0, start).trim();
      const atCommand = before === '' || /(?:^|[|;&(]|&&|\|\|)\s*$/.test(before) || /\b(sudo|man|help|which|type|xargs)\s*$/.test(before);
      const cmdWord = (before.match(/(?:^|[|;&(]|&&|\|\|)\s*([^\s|;&()<>]+)[^|;&()]*$/) || [])[1];
      const dirsOnly = cmdWord === 'cd' || cmdWord === 'rmdir';
      const esc = (n) => quote ? n : n.replace(/([ "'\\$`()&|;<>*?[\]{}#~!])/g, '\\$1');
      let items = [], display = [];
      if (atCommand && !word.includes('/')) { display = Object.keys(COMMANDS).filter((c) => c.startsWith(word)).sort(); items = display.map((c) => c + ' '); }
      else {
        if (word === '.' || word === '..') return { start, items: [word + '/'], display: [word + '/'] };
        const slash = word.lastIndexOf('/'); const dirPart = slash >= 0 ? word.slice(0, slash + 1) : '', namePart = word.slice(slash + 1);
        const dir = fs.resolve(dirPart === '' ? '.' : dirPart);
        if (fs.isDir(dir)) for (const n of fs.list(dir)) {
          if (!n.startsWith(namePart) || (n.startsWith('.') && !namePart.startsWith('.'))) continue;
          const isDir = fs.isDir(dir === '/' ? '/' + n : dir + '/' + n);
          if (dirsOnly && !isDir) continue;
          display.push(n + (isDir ? '/' : '')); items.push(quote + dirPart + esc(n) + (isDir ? '/' : quote + ' '));
        }
      }
      return { start, items, display };
    };
    sh.tilde = tilde;
    sh.exec_words = (words, ctx, io) => runWords(words, ctx, io);
    sh.getVar = (n) => getVar(n, { name: 'bash', args: [] });
    sh.setVar = setVar;
    return sh;
  }

  /* ---------------- the commands ---------------- */
  // Each: { cat, use, desc, opts: [[flag, meaning]...], ex: [...], notes?, builtin?, run(args, io, sh, ctx) → exit }
  // io.stdin is null (the keyboard) or { text, pos }, shared by every command in a loop so that `read` consumes it line by line.
  const COMMANDS = dict();
  const def = (names, spec) => { for (const n of names.split(' ')) COMMANDS[n] = Object.assign({ name: n }, spec); };
  // -abc and -n 5 style options. spec: letters, ':' after one that takes a value. Returns { f: {flag: true|value}, args } or writes the error and returns null.
  function getopts(args, spec, io, name) {
    const f = dict(), rest = []; let i = 0;
    for (; i < args.length; i++) {
      const a = args[i];
      if (a === '--') { rest.push(...args.slice(i + 1)); break; }
      if (a === '-' || !a.startsWith('-') || /^-\d/.test(a) && !spec.includes(a[1])) { rest.push(a); continue; }
      if (a.startsWith('--')) { const long = a.slice(2); if (long === 'help') { f.help = true; continue; } if (LONG[long] && spec.includes(LONG[long])) { f[LONG[long]] = true; continue; } io.err(name + ": unrecognized option '" + a + "'\nTry 'man " + name + "' for help.\n"); return null; }
      for (let k = 1; k < a.length; k++) {
        const c = a[k], j = spec.indexOf(c);
        if (j < 0 || c === ':') { io.err(name + ": invalid option -- '" + c + "'\nTry 'man " + name + "' for help.\n"); return null; }
        if (spec[j + 1] === ':') { const v = k + 1 < a.length ? a.slice(k + 1) : args[++i]; if (v === undefined) { io.err(name + ": option requires an argument -- '" + c + "'\n"); return null; } f[c] = v; break; }
        f[c] = true;
      }
    }
    return { f, args: rest };
  }
  const LONG = { all: 'a', recursive: 'r', 'ignore-case': 'i', 'line-number': 'n', count: 'c', reverse: 'r', unique: 'u', parents: 'p', force: 'f', verbose: 'v', 'invert-match': 'v', numeric: 'n', 'numeric-sort': 'n', lines: 'l', words: 'w', bytes: 'c', version: 'V' };
  const q = (s) => s.includes("'") ? '"' + s + '"' : "'" + s + "'";
  const TRY = (name) => "\nTry '" + name + " --help' for more information.\n";   // the second line of a usage error, as in coreutils
  // a file name in a message, the way coreutils quotes it: bare when it is plain, quoted when it has spaces or special characters
  const qf = (s) => /^[A-Za-z0-9_.\/+,:@%=-]+$/.test(s) ? s : q(s);
  // how each command says it could not open a file (coreutils' and grep's words); the rest say "name: file: reason"
  const OPEN_ERR = { head: (a) => 'cannot open ' + q(a) + ' for reading', tail: (a) => 'cannot open ' + q(a) + ' for reading', tac: (a) => 'failed to open ' + q(a) + ' for reading',
    sort: (a) => 'cannot read: ' + qf(a), sed: (a) => "can't read " + a, rev: (a) => 'cannot open ' + a, grep: (a) => a };
  const stdinOf = (s) => s == null ? null : { text: String(s), pos: 0 };
  async function readAll(io, name) {
    if (io.stdin) { const s = io.stdin.text.slice(io.stdin.pos); io.stdin.pos = io.stdin.text.length; return s; }
    if (!io.ask || !io.tty) return '';
    io.err('(' + name + ' is reading from the keyboard: type lines and press Enter; an empty line ends the input)\n');
    const lines = []; while (lines.length < 10000) { const l = await io.ask(''); if (l == null || l === '') break; lines.push(l); }
    return lines.length ? lines.join('\n') + '\n' : '';
  }
  const lines = (s) => { const a = s.split('\n'); if (a.length && a[a.length - 1] === '') a.pop(); return a; };
  /** read every named file (or stdin when there are none) → [{name, text}]; a file that fails is null, and its error is printed when the
      command reaches it (each entry is a getter), so errors come out between the other files' output, in order, as in coreutils */
  async function inputs(args, io, sh, name) {
    if (!args.length) return [{ name: '-', text: await readAll(io, name) }];
    const out = [];
    for (const a of args) {
      if (a === '-') { out.push({ name: '-', text: await readAll(io, name) }); continue; }
      try { out.push({ name: a, text: sh.fs.read(sh.fs.resolve(a)) }); }
      catch (e) {
        if (!(e instanceof FsError)) throw e;
        const msg = name + ': ' + (e.code !== 'EISDIR' && OPEN_ERR[name] ? OPEN_ERR[name](a) : qf(a)) + ': ' + e.message + '\n'; let told = false;
        Object.defineProperty(out, out.length, { enumerable: true, configurable: true, get() { if (!told) { told = true; io.err(msg); } return null; } });
      }
    }
    return out;
  }
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const pad = (s, n) => { s = String(s); return s.length >= n ? s : ' '.repeat(n - s.length) + s; };
  const padR = (s, n) => { s = String(s); return s.length >= n ? s : s + ' '.repeat(n - s.length); };
  const lsDate = (t, now) => { const d = new Date(t); const old = Math.abs(now - t) > 182 * 86400000; return MONTHS[d.getMonth()] + ' ' + pad(d.getDate(), 2) + ' ' + (old ? pad(d.getFullYear(), 5) : pad(d.getHours(), 2).replace(' ', '0') + ':' + pad(d.getMinutes(), 2).replace(' ', '0')); };
  const perms = (n) => n.t === 'd' ? 'drwxr-xr-x' : n.x ? '-rwxr-xr-x' : '-rw-r--r--';
  const sizeOf = (n) => n.t === 'd' ? 4096 : n.d.length;
  const kind = (n) => n.t === 'd' ? 'dir' : n.x ? 'exe' : '';
  const WIDTH = 80;
  // names in columns, the way ls fills a terminal (down the columns, then across); io.cols is the terminal's width when the panel knows it
  function columns(items, io) {
    if (!items.length) return;
    const n = items.length, WIDTH = Math.max(20, io.cols || 80);
    for (let cols = Math.min(n, 30); cols >= 1; cols--) {
      const rows = Math.ceil(n / cols); if (Math.ceil(n / rows) < cols) continue;
      const widths = []; let total = 0;
      for (let c = 0; c < cols; c++) { let w = 0; for (let r = 0; r < rows; r++) { const it = items[c * rows + r]; if (it) w = Math.max(w, it.name.length); } widths.push(w); total += w + (c < cols - 1 ? 2 : 0); }
      if (total > WIDTH && cols > 1) continue;
      for (let r = 0; r < rows; r++) { for (let c = 0; c < cols; c++) { const it = items[c * rows + r]; if (!it) continue; io.out(it.name, it.cls); if (c < cols - 1 && items[(c + 1) * rows + r]) io.out(' '.repeat(widths[c] - it.name.length + 2)); } io.out('\n'); }
      return;
    }
  }

  // ----- where am I, moving around
  def('pwd', { cat: 'dirs', builtin: true, use: 'pwd', desc: 'Print the working directory: where you are now.', ex: ['pwd'], run(args, io, sh) { io.out(sh.fs.cwd + '\n'); return 0; } });
  def('cd', { cat: 'dirs', builtin: true, use: 'cd [directory]', desc: 'Change the working directory. With no argument, go home. cd .. goes up one level; cd - goes back to where you were.',
    ex: ['cd notes', 'cd ..', 'cd ~/projects', 'cd'],
    run(args, io, sh) {
      if (args.length > 1) { io.err('bash: cd: too many arguments\n'); return 1; }
      let target = args[0] === undefined ? HOME : args[0];
      if (target === '-') { if (!sh.oldpwd) { io.err('bash: cd: OLDPWD not set\n'); return 1; } target = sh.oldpwd; io.out(target + '\n'); }
      const abs = sh.fs.resolve(target), n = sh.fs.stat(abs);
      if (!n) { io.err('bash: cd: ' + args[0] + ': No such file or directory\n'); return 1; }
      if (n.t !== 'd') { io.err('bash: cd: ' + args[0] + ': Not a directory\n'); return 1; }
      sh.oldpwd = sh.fs.cwd; sh.fs.cwd = abs; return 0;
    } });
  def('ls dir', { cat: 'dirs', use: 'ls [-a] [-l] [-R] [-F] [-1] [path...]', desc: 'List the files in a directory (the current one if none is named). Directories are shown in blue, programs in green.',
    opts: [['-a', 'all: include hidden files, whose names start with a dot'], ['-l', 'long format: permissions, owner, size, date and name on each line'], ['-R', 'also list every directory inside, recursively'], ['-F', 'mark directories with / and programs with *'], ['-1', 'one name per line'], ['-d', 'list a directory itself, not what is inside it'], ['-t', 'newest first']],
    ex: ['ls', 'ls -l', 'ls -a ~', 'ls notes/*.txt'],
    run(args, io, sh) {
      const o = getopts(args, 'alRF1hrtd', io, 'ls'); if (!o) return 2;
      const fs = sh.fs, paths = o.args.length ? o.args : ['.']; let exit = 0;
      const files = [], dirs = [];
      for (const p of paths) { const n = fs.stat(fs.resolve(p)); if (!n) { io.err('ls: cannot access ' + q(p) + ': No such file or directory\n'); exit = 2; } else if (n.t === 'd' && !o.f.d) dirs.push(p); else files.push(p); }
      // as GNU ls: the files named first, sorted, then each directory, sorted (-r turns the directories round; show() turns the files)
      files.sort(nameOrder); dirs.sort(nameOrder); if (o.f.r) dirs.reverse();
      const show = (names, dirAbs) => {
        const items = names.map((name) => { const n = name === '.' ? fs.stat(dirAbs) : name === '..' ? fs.stat(fs.resolve('..', dirAbs)) : dirAbs === null ? fs.stat(fs.resolve(name)) : fs.stat(dirAbs === '/' ? '/' + name : dirAbs + '/' + name); return { name: name + (o.f.F ? (n.t === 'd' ? '/' : n.x ? '*' : '') : ''), node: n, cls: io.tty ? kind(n) : '' }; });
        if (o.f.t) items.sort((a, b) => b.node.m - a.node.m); if (o.f.r) items.reverse();
        if (o.f.l) {
          if (dirAbs !== null) io.out('total ' + items.reduce((s, it) => s + Math.ceil(sizeOf(it.node) / 1024) * 4, 0) + '\n');
          const w = Math.max(1, ...items.map((it) => String(sizeOf(it.node)).length));
          for (const it of items) { const n = it.node; io.out(perms(n) + ' ' + pad(n.t === 'd' ? 2 + Object.keys(n.c).filter((k) => n.c[k].t === 'd').length : 1, 1) + ' ' + USER + ' ' + USER + ' ' + pad(sizeOf(n), w) + ' ' + lsDate(n.m, sh.fs.now()) + ' '); io.out(it.name, it.cls); io.out('\n'); }
        } else if (o.f[1] || !io.tty) { for (const it of items) { io.out(it.name, it.cls); io.out('\n'); } }
        else columns(items, io);
      };
      if (files.length) show(files, null);
      const listDir = (p, abs, header) => {
        if (header) io.out((files.length || header === 'always' ? '\n' : '') + p + ':\n');
        const names = fs.list(abs).filter((n) => o.f.a || !n.startsWith('.'));
        show(o.f.a ? ['.', '..'].concat(names) : names, abs);
        if (o.f.R) for (const n of fs.list(abs)) { if (fs.isDir(abs === '/' ? '/' + n : abs + '/' + n) && (o.f.a || !n.startsWith('.'))) listDir(p.replace(/\/$/, '') + '/' + n, abs === '/' ? '/' + n : abs + '/' + n, 'always'); }
      };
      dirs.forEach((p, i) => listDir(p, fs.resolve(p), (dirs.length + files.length > 1 || o.f.R) ? (i === 0 && !files.length ? 'first' : 'always') : ''));
      return exit;
    } });
  def('mkdir', { cat: 'files', use: 'mkdir [-p] directory...', desc: 'Make a directory (a folder).', opts: [['-p', 'make the parents too (mkdir -p a/b/c), and do not complain if it exists']],
    ex: ['mkdir notes', 'mkdir -p projects/game/levels', 'mkdir {spring,summer,autumn}'],
    run(args, io, sh) {
      const o = getopts(args, 'pv', io, 'mkdir'); if (!o) return 1;
      if (!o.args.length) { io.err('mkdir: missing operand' + TRY('mkdir')); return 1; }
      let exit = 0;
      for (const a of o.args) { try { sh.fs.mkdir(sh.fs.resolve(a), !!o.f.p); } catch (e) { if (!(e instanceof FsError)) throw e; exit = 1; io.err('mkdir: cannot create directory ' + q(a) + ': ' + e.message + '\n'); } }
      return exit;
    } });
  def('rmdir', { cat: 'files', use: 'rmdir directory...', desc: 'Remove an empty directory. (rm -r removes one with things inside.)', ex: ['rmdir old'],
    run(args, io, sh) { if (!args.length) { io.err('rmdir: missing operand' + TRY('rmdir')); return 1; } let exit = 0; for (const a of args) { try { sh.fs.rmdir(sh.fs.resolve(a)); } catch (e) { if (!(e instanceof FsError)) throw e; exit = 1; io.err('rmdir: failed to remove ' + q(a) + ': ' + e.message + '\n'); } } return exit; } });
  def('touch', { cat: 'files', use: 'touch file...', desc: 'Make an empty file, or update the date of one that exists.', ex: ['touch notes.txt', 'touch day{1..7}.txt'],
    run(args, io, sh) { if (!args.length) { io.err('touch: missing file operand' + TRY('touch')); return 1; } let exit = 0; for (const a of args) { try { sh.fs.touch(sh.fs.resolve(a)); } catch (e) { if (!(e instanceof FsError)) throw e; exit = 1; io.err('touch: cannot touch ' + q(a) + ': ' + e.message + '\n'); } } return exit; } });
  def('rm', { cat: 'files', use: 'rm [-r] [-f] file...', desc: 'Remove files. There is no recycle bin: a removed file is gone.', opts: [['-r', 'recursive: remove a directory and everything in it'], ['-f', 'force: no complaint about files that do not exist']],
    ex: ['rm draft.txt', 'rm *.tmp', 'rm -r old-project'],
    async run(args, io, sh) {
      const o = getopts(args, 'rRfiv', io, 'rm'); if (!o) return 1;
      if (!o.args.length) { if (o.f.f) return 0; io.err('rm: missing operand' + TRY('rm')); return 1; }
      let exit = 0; const fs = sh.fs;
      for (const a of o.args) {
        const abs = fs.resolve(a), n = fs.stat(abs);
        try {
          if (!n) { if (!o.f.f) { exit = 1; io.err('rm: cannot remove ' + q(a) + ': No such file or directory\n'); } continue; }
          if (n.t === 'd') { if (!(o.f.r || o.f.R)) { exit = 1; io.err('rm: cannot remove ' + q(a) + ': Is a directory\n'); continue; } if (abs === '/' || abs === HOME) { exit = 1; io.err('rm: refusing to remove ' + q(a) + ': it is your home directory\n'); continue; } if (o.f.i && !await confirm(io, 'rm: remove directory ' + q(a) + '? ')) continue; fs.rmTree(abs); }
          else { if (o.f.i && !await confirm(io, 'rm: remove regular ' + (n.d === '' ? 'empty ' : '') + 'file ' + q(a) + '? ')) continue; fs.unlink(abs); }
        } catch (e) { if (!(e instanceof FsError)) throw e; exit = 1; io.err('rm: cannot remove ' + q(a) + ': ' + e.message + '\n'); }
      }
      return exit;
    } });
  const intoDir = (fs, dst, srcName) => { const abs = fs.resolve(dst); return fs.isDir(abs) ? (abs === '/' ? '/' : abs + '/') + srcName.split('/').filter(Boolean).pop() : abs; };
  // the destination as the student would name it: dir/name when copying or moving into a directory
  const shownDst = (fs, dst, srcName) => fs.isDir(fs.resolve(dst)) ? dst.replace(/\/+$/, '') + '/' + srcName.split('/').filter(Boolean).pop() : dst;
  /** -i: ask before removing or overwriting. The answer comes from the pipe or file on stdin, else the keyboard; anything but y means no. */
  async function confirm(io, prompt) {
    let ans = null;
    if (io.stdin) { io.err(prompt); const rest = io.stdin.text.slice(io.stdin.pos); const k = rest.indexOf('\n'); ans = k < 0 ? rest : rest.slice(0, k); io.stdin.pos += k < 0 ? rest.length : k + 1; }
    else if (io.ask) ans = await io.ask(prompt);
    else io.err(prompt);   // no answer to read: the question stays on the line, as when bash reads an empty stdin
    return /^\s*y/i.test(ans || '');
  }
  // cp and mv: the same file, or a directory into itself, are refused with the words coreutils uses; null when the copy or move may go ahead
  const sameOrInside = (verb, s, sabs, n, target, shown) => target === sabs ? verb + ': ' + q(s) + ' and ' + q(shown) + ' are the same file' : n.t === 'd' && target.startsWith(sabs + '/') ? (verb === 'cp' ? 'cp: cannot copy a directory, ' + q(s) + ', into itself, ' + q(shown) : 'mv: cannot move ' + q(s) + ' to a subdirectory of itself, ' + q(shown)) : null;
  def('cp', { cat: 'files', use: 'cp [-r] source... destination', desc: 'Copy files. The destination can be a new name or a directory to copy into.', opts: [['-r', 'recursive: copy a directory and everything in it']],
    ex: ['cp notes.txt backup.txt', 'cp *.py scripts/', 'cp -r project project-copy'],
    async run(args, io, sh) {
      const o = getopts(args, 'rRvi', io, 'cp'); if (!o) return 1;
      if (o.args.length < 2) { io.err((o.args.length ? 'cp: missing destination file operand after ' + q(o.args[0]) : 'cp: missing file operand') + TRY('cp')); return 1; }
      const dst = o.args.pop(), fs = sh.fs; let exit = 0;
      if (o.args.length > 1 && !fs.isDir(fs.resolve(dst))) { io.err('cp: target ' + q(dst) + (fs.exists(fs.resolve(dst)) ? ' is not a directory' : ': No such file or directory') + '\n'); return 1; }
      for (const s of o.args) {
        const sabs = fs.resolve(s), n = fs.stat(sabs);
        if (!n) { exit = 1; io.err('cp: cannot stat ' + q(s) + ': No such file or directory\n'); continue; }
        if (n.t === 'd' && !(o.f.r || o.f.R)) { exit = 1; io.err('cp: -r not specified; omitting directory ' + q(s) + '\n'); continue; }
        const target = intoDir(fs, dst, s), shown = shownDst(fs, dst, s), bad = sameOrInside('cp', s, sabs, n, target, shown);
        if (bad) { exit = 1; io.err(bad + '\n'); continue; }
        if (o.f.i && fs.isFile(target) && !await confirm(io, 'cp: overwrite ' + q(shown) + '? ')) continue;
        try { fs.copy(sabs, target, true); } catch (e) { if (!(e instanceof FsError)) throw e; exit = 1; io.err('cp: cannot copy ' + q(s) + ' to ' + q(dst) + ': ' + e.message + '\n'); }
      }
      return exit;
    } });
  def('mv', { cat: 'files', use: 'mv source... destination', desc: 'Move or rename files. mv old.txt new.txt renames; mv file.txt notes/ moves it into the directory.',
    ex: ['mv draft.txt essay.txt', 'mv *.jpg photos/', 'mv photos pictures'],
    async run(args, io, sh) {
      const o = getopts(args, 'vi', io, 'mv'); if (!o) return 1;
      if (o.args.length < 2) { io.err((o.args.length ? 'mv: missing destination file operand after ' + q(o.args[0]) : 'mv: missing file operand') + TRY('mv')); return 1; }
      const dst = o.args.pop(), fs = sh.fs; let exit = 0;
      if (o.args.length > 1 && !fs.isDir(fs.resolve(dst))) { io.err('mv: target ' + q(dst) + (fs.exists(fs.resolve(dst)) ? ' is not a directory' : ': No such file or directory') + '\n'); return 1; }
      for (const s of o.args) {
        const sabs = fs.resolve(s);
        if (!fs.exists(sabs)) { exit = 1; io.err('mv: cannot stat ' + q(s) + ': No such file or directory\n'); continue; }
        const target = intoDir(fs, dst, s), shown = shownDst(fs, dst, s), n = fs.stat(sabs), old = fs.stat(target);
        let bad = sameOrInside('mv', s, sabs, n, target, shown);
        if (!bad && old && target !== sabs) {   // what is already there decides, with GNU's words
          if (n.t === 'd' && old.t !== 'd') bad = 'mv: cannot overwrite non-directory ' + q(shown) + ' with directory ' + q(s);
          else if (n.t !== 'd' && old.t === 'd') bad = 'mv: cannot overwrite directory ' + q(shown) + ' with non-directory';
          else if (old.t === 'd' && Object.keys(old.c).length) bad = 'mv: cannot overwrite ' + q(shown) + ': Directory not empty';
        }
        if (bad) { exit = 1; io.err(bad + '\n'); continue; }
        if (o.f.i && fs.exists(target) && !await confirm(io, 'mv: overwrite ' + q(shown) + '? ')) continue;
        try { fs.move(sabs, target); } catch (e) { if (!(e instanceof FsError)) throw e; exit = 1; io.err('mv: cannot move ' + q(s) + ' to ' + q(dst) + ': ' + e.message + '\n'); }
      }
      return exit;
    } });
  def('chmod', { cat: 'files', use: 'chmod +x|-x file...', desc: 'Change whether a file may run as a program (the x permission). A script needs chmod +x before ./script.sh works.',
    ex: ['chmod +x tidy.sh', 'chmod 755 run.sh', 'chmod -x notes.txt'],
    run(args, io, sh) {
      if (args.length < 2) { io.err('chmod: missing operand' + (args.length ? ' after ' + q(args[0]) : '') + TRY('chmod')); return 1; }
      const mode = args[0]; let exec;
      if (/^[ugoa]*\+[rwx]+$/.test(mode)) exec = mode.includes('x') ? true : undefined; else if (/^[ugoa]*-[rwx]+$/.test(mode)) exec = mode.includes('x') ? false : undefined; else if (/^[0-7]{3,4}$/.test(mode)) exec = (parseInt(mode[mode.length - 3], 8) & 1) === 1; else { io.err('chmod: invalid mode: ' + q(mode) + '\n'); return 1; }
      let exit = 0;
      for (const a of args.slice(1)) { try { const n = sh.fs.stat(sh.fs.resolve(a)); if (!n) throw new FsError('ENOENT'); if (exec !== undefined) sh.fs.chmod(sh.fs.resolve(a), exec); } catch (e) { if (!(e instanceof FsError)) throw e; exit = 1; io.err('chmod: cannot access ' + q(a) + ': ' + e.message + '\n'); } }
      return exit;
    } });
  def('tree', { cat: 'dirs', use: 'tree [-a] [directory]', desc: 'Draw a directory and everything inside it as a tree.', opts: [['-a', 'include hidden files']], ex: ['tree', 'tree projects'],
    run(args, io, sh) {
      const o = getopts(args, 'a', io, 'tree'); if (!o) return 1;
      const fs = sh.fs, start = o.args[0] || '.', abs = fs.resolve(start);
      if (!fs.isDir(abs)) { io.out(start + ' [error opening dir]\n\n0 directories, 0 files\n'); return 1; }
      let nd = 0, nf = 0;
      io.out(start, io.tty ? 'dir' : ''); io.out('\n');
      const go = (dirAbs, prefix) => {
        const names = fs.list(dirAbs).filter((n) => o.f.a || !n.startsWith('.'));
        names.forEach((n, i) => {
          const last = i === names.length - 1, child = fs.stat(dirAbs === '/' ? '/' + n : dirAbs + '/' + n);
          io.out(prefix + (last ? '└── ' : '├── ')); io.out(n, io.tty ? kind(child) : ''); io.out('\n');
          if (child.t === 'd') { nd++; go(dirAbs === '/' ? '/' + n : dirAbs + '/' + n, prefix + (last ? '    ' : '│   ')); } else nf++;
        });
      };
      go(abs, '');
      io.out('\n' + nd + ' director' + (nd === 1 ? 'y' : 'ies') + ', ' + nf + ' file' + (nf === 1 ? '' : 's') + '\n');
      return 0;
    } });
  def('find', { cat: 'dirs', use: 'find [directory...] [-name pattern] [-iname pattern] [-type f|d] [-empty]', desc: 'Search for files by name or kind, in a directory and everything under it. Quote the pattern so the shell does not expand it first.',
    opts: [['-name P', 'names matching the wildcard pattern P, such as "*.txt"'], ['-iname P', 'the same, ignoring capitals'], ['-type f', 'only files; -type d only directories'], ['-empty', 'only empty files and directories']],
    ex: ['find . -name "*.py"', 'find projects -type d', 'find . -empty'],
    run(args, io, sh) {
      const fs = sh.fs, paths = []; let i = 0;
      while (i < args.length && !args[i].startsWith('-')) paths.push(args[i++]);
      if (!paths.length) paths.push('.');
      const tests = [];
      for (; i < args.length; i++) {
        const a = args[i], v = args[i + 1];
        if (a === '-name' || a === '-iname') { if (v === undefined) { io.err('find: missing argument to ' + q(a) + '\n'); return 1; } const re = globToRegExp(v); const re2 = a === '-iname' ? new RegExp(re.source, 'i') : re; tests.push((p, n) => re2.test(p.split('/').pop())); i++; }
        else if (a === '-type') { if (v !== 'f' && v !== 'd') { io.err('find: Unknown argument to -type: ' + (v === undefined ? '' : v) + '\n'); return 1; } tests.push((p, n) => (v === 'd') === (n.t === 'd')); i++; }
        else if (a === '-empty') tests.push((p, n) => n.t === 'd' ? !Object.keys(n.c).length : n.d.length === 0);
        else if (a === '-maxdepth') { const d = parseInt(v, 10); if (isNaN(d)) { io.err('find: Expected a positive decimal integer argument to -maxdepth\n'); return 1; } tests.push((p, n, depth) => depth <= d); i++; }
        else { io.err('find: unknown predicate ' + q(a) + '\n'); return 1; }
      }
      let exit = 0;
      for (const p of paths) {
        const abs = fs.resolve(p);
        if (!fs.exists(abs)) { exit = 1; io.err('find: ' + q(p) + ': No such file or directory\n'); continue; }
        const base = p.replace(/\/+$/, '') || '/';
        for (const [a, n] of fs.walk(abs)) { const rel = a === abs ? base : (base === '/' ? '' : base) + a.slice(abs.length); const depth = a === abs ? 0 : a.slice(abs.length).split('/').length - 1; if (tests.every((t) => t(rel, n, depth))) io.out(rel + '\n'); }
      }
      return exit;
    } });

  // ----- looking inside files
  def('cat less more', { cat: 'text', use: 'cat [-n] [file...]', desc: 'Print a file (or several, one after another: con-cat-enate). less and more do the same here.', opts: [['-n', 'number the lines']],
    ex: ['cat notes.txt', 'cat -n hello.py', 'cat a.txt b.txt > both.txt'],
    async run(args, io, sh, ctx, name) {
      const o = getopts(args, 'nAbEs', io, this.name); if (!o) return 1;
      let exit = 0, k = 0;
      for (const f of await inputs(o.args, io, sh, this.name)) {
        if (!f) { exit = 1; continue; }
        if (o.f.n) for (const l of lines(f.text)) io.out(pad(++k, 6) + '\t' + l + '\n'); else io.out(f.text);
      }
      return exit;
    } });
  def('tac', { cat: 'text', use: 'tac [file...]', desc: 'Print a file with its lines in reverse order (cat backwards).', ex: ['tac log.txt'],
    async run(args, io, sh) { let exit = 0; for (const f of await inputs(args, io, sh, 'tac')) { if (!f) { exit = 1; continue; } for (const l of lines(f.text).reverse()) io.out(l + '\n'); } return exit; } });
  def('head', { cat: 'text', use: 'head [-n N] [file...]', desc: 'Print the first lines of a file: ten, or N with -n N.', opts: [['-n N', 'how many lines (head -3 also works)'], ['-c N', 'how many characters (bytes) instead of lines']], ex: ['head story.txt', 'head -n 3 scores.csv', 'ls | head -5'],
    async run(args, io, sh) { return headTail(args, io, sh, 'head'); } });
  def('tail', { cat: 'text', use: 'tail [-n N] [file...]', desc: 'Print the last lines of a file: ten, or N with -n N.', opts: [['-n N', 'how many lines (tail -3 also works)'], ['-c N', 'how many characters (bytes) instead of lines']], ex: ['tail log.txt', 'tail -n 1 scores.csv'],
    async run(args, io, sh) { return headTail(args, io, sh, 'tail'); } });
  async function headTail(args, io, sh, name) {
    // head -3 means head -n 3, but the -2 in head -n -2 is the value of -n
    const o = getopts(args.map((a, i) => /^-\d+$/.test(a) && args[i - 1] !== '-n' && args[i - 1] !== '-c' ? '-n' + a.slice(1) : a), 'n:c:', io, name); if (!o) return 1;
    if (o.f.f) { io.err(name + ': -f is not available here\n'); return 1; }
    // head -n -N: all but the last N lines; tail -n +N: from line N on
    // -c N counts characters (bytes) instead of lines
    let n = 10, allBut = false, from = false; const bytes = o.f.c !== undefined;
    if (o.f.n !== undefined || bytes) {
      const v = String(bytes ? o.f.c : o.f.n), m = v.match(name === 'head' ? /^(-?)(\d+)$/ : /^(\+?)(\d+)$/);
      if (!m) { io.err(name + ': invalid number of ' + (bytes ? 'bytes' : 'lines') + ': ' + q(v) + '\n'); return 1; }
      n = parseInt(m[2], 10); allBut = name === 'head' && m[1] === '-'; from = name === 'tail' && m[1] === '+';
    }
    let exit = 0; const many = o.args.length > 1;
    (await inputs(o.args, io, sh, name)).forEach((f, i) => {
      if (!f) { exit = 1; return; }
      if (many) io.out((i ? '\n' : '') + '==> ' + f.name + ' <==\n');
      if (bytes) { const t = f.text; io.out(name === 'head' ? (allBut ? t.slice(0, Math.max(0, t.length - n)) : t.slice(0, n)) : (from ? t.slice(Math.max(0, n - 1)) : t.slice(Math.max(0, t.length - n)))); return; }
      const ls = lines(f.text); for (const l of name === 'head' ? (allBut ? ls.slice(0, Math.max(0, ls.length - n)) : ls.slice(0, n)) : (from ? ls.slice(Math.max(0, n - 1)) : ls.slice(Math.max(0, ls.length - n)))) io.out(l + '\n');
    });
    return exit;
  }
  def('wc', { cat: 'text', use: 'wc [-l] [-w] [-c] [file...]', desc: 'Count lines, words and characters. With no option it prints all three.', opts: [['-l', 'lines only'], ['-w', 'words only'], ['-c', 'characters (bytes) only']],
    ex: ['wc essay.txt', 'wc -l *.py', 'ls | wc -l'],
    async run(args, io, sh) {
      const o = getopts(args, 'lwcm', io, 'wc'); if (!o) return 1;
      const which = (o.f.l || o.f.w || o.f.c || o.f.m) ? ['l', 'w', 'c'].filter((k) => o.f[k] || (k === 'c' && o.f.m)) : ['l', 'w', 'c'];
      // the column width, worked out first as GNU wc does: 1 for one count of one input; 7 when an input is a pipe or the keyboard;
      // otherwise wide enough for the size of all the named files together. Rows and errors then come out in order.
      const named = o.args.length ? o.args : ['-'];
      const bytes = named.reduce((t, a) => { const n = a === '-' ? null : sh.fs.stat(sh.fs.resolve(a)); return t + (n && n.t === 'f' ? n.d.length : 0); }, 0);
      const w = which.length === 1 && named.length === 1 ? 1 : named.includes('-') ? 7 : Math.max(1, String(bytes).length);
      const row = (r) => io.out(which.map((k) => pad(r[k], w)).join(' ') + (r.name === '-' && !o.args.length ? '' : ' ' + r.name) + '\n');
      const tot = { l: 0, w: 0, c: 0, name: 'total' }; let exit = 0;
      for (const f of await inputs(o.args, io, sh, 'wc')) {
        if (!f) { exit = 1; continue; }
        const r = { l: (f.text.match(/\n/g) || []).length, w: (f.text.match(/\S+/g) || []).length, c: f.text.length, name: f.name };
        row(r); for (const k of which) tot[k] += r[k];
      }
      if (o.args.length > 1) row(tot);
      return exit;
    } });
  // POSIX regular expressions → JavaScript: [:digit:] and friends inside brackets, \< \> word edges, and in a basic expression (grep without -E,
  // sed) \( \) \| \{ \} \+ \? are the operators while ( ) | { } + ? are plain characters
  const POSIX_CLASSES = { alpha: 'a-zA-Z', digit: '0-9', alnum: 'a-zA-Z0-9', upper: 'A-Z', lower: 'a-z', space: ' \\t\\n\\r\\f\\v', blank: ' \\t', xdigit: '0-9A-Fa-f', punct: '!-\\/:-@\\[-`{-~' };
  function posixRegex(pat, extended) {
    let out = '';
    for (let i = 0; i < pat.length; i++) {
      const c = pat[i];
      if (c === '[') {
        let j = i + 1, body = '';
        if (pat[j] === '^' || pat[j] === '!') { body += '^'; j++; }
        if (pat[j] === ']') { body += '\\]'; j++; }
        while (j < pat.length && pat[j] !== ']') {
          const m = pat.slice(j).match(/^\[:([a-z]+):\]/);
          if (m && POSIX_CLASSES[m[1]]) { body += POSIX_CLASSES[m[1]]; j += m[0].length; continue; }
          body += pat[j] === '\\' || pat[j] === '[' ? '\\' + pat[j] : pat[j]; j++;
        }
        if (j >= pat.length) { out += '\\['; continue; }   // no closing bracket: a plain [
        out += '[' + body + ']'; i = j; continue;
      }
      if (c === '\\' && i + 1 < pat.length) {
        const d = pat[++i];
        if (d === '<' || d === '>') out += '\\b';
        else if (!extended && '()|{}+?'.includes(d)) out += d;
        else out += '\\' + d;
        continue;
      }
      if (!extended && '()|{}+?'.includes(c)) { out += '\\' + c; continue; }
      if (!extended && c === '*' && (out === '' || out === '^' || /[(|]$/.test(out) && !/\\[(|]$/.test(out))) { out += '\\*'; continue; }
      out += c;
    }
    return out;
  }
  def('grep', { cat: 'text', use: 'grep [-i] [-n] [-v] [-c] [-l] [-w] [-r] pattern [file...]', desc: 'Print the lines that contain a pattern. The pattern is a regular expression (plain words work as you expect); quote it.',
    opts: [['-i', 'ignore capitals'], ['-n', 'show line numbers'], ['-v', 'the lines that do NOT match'], ['-c', 'only count the matching lines'], ['-l', 'only the names of files with a match'], ['-w', 'whole words only'], ['-r', 'search every file in a directory'], ['-q', 'quiet: print nothing, only answer with the status (for if)'], ['-F', 'the pattern is plain text, not a regular expression']],
    ex: ['grep error log.txt', 'grep -n "def " game.py', 'grep -ri todo projects', 'ls | grep .txt'],
    async run(args, io, sh) {
      const o = getopts(args, 'invclLwxrRFhHEoqe:', io, 'grep'); if (!o) return 2;
      if (!o.args.length && o.f.e === undefined) { io.err('Usage: grep [OPTION]... PATTERNS [FILE]...\nTry \'man grep\' for more information.\n'); return 2; }
      const pat = o.f.e !== undefined ? o.f.e : o.args[0]; const flags = o.f.i ? 'i' : '';
      let re; try { re = o.f.F ? null : new RegExp(posixRegex(pat, !!o.f.E), flags); } catch (e) { re = null; }
      if (!re) re = new RegExp(pat.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&'), flags);
      if (o.f.x) re = new RegExp('^(?:' + re.source + ')$', flags);
      else if (o.f.w) re = new RegExp('(?:^|[^A-Za-z0-9_])(?:' + re.source + ')(?![A-Za-z0-9_])', flags);
      const fs = sh.fs; let files = o.f.e !== undefined ? o.args.slice() : o.args.slice(1);
      const rec = o.f.r || o.f.R;
      if (rec) { const expanded = []; for (const f of files.length ? files : ['.']) { const abs = fs.resolve(f); if (!fs.exists(abs)) { expanded.push(f); continue; } for (const [a, n] of fs.walk(abs)) if (n.t === 'f') expanded.push(a === abs ? f : (f.replace(/\/$/, '') + a.slice(abs.length))); } files = o.args.length > (o.f.e !== undefined ? 0 : 1) ? expanded : expanded.map((f) => f.replace(/^\.\//, '')); }   // grep -r with no directory names files without ./
      const many = files.length > 1 || rec; let found = false, exit = 0;
      const srcs = files.length ? files.map((f) => { const abs = fs.resolve(f), n = fs.stat(abs); if (!n) { io.err('grep: ' + f + ': No such file or directory\n'); exit = 2; return null; } if (n.t === 'd') { io.err('grep: ' + f + ': Is a directory\n'); exit = 2; return null; } return { name: f, text: n.d }; }) : [{ name: '(standard input)', text: await readAll(io, 'grep') }];
      for (const f of srcs) {
        if (!f) continue;
        const prefix = many && !o.f.h ? f.name + ':' : '';
        let count = 0;
        const quiet = o.f.c || o.f.l || o.f.L || o.f.q, all = new RegExp(re.source, flags + 'g');
        lines(f.text).forEach((l, i) => {
          const m = re.test(l); if (m === !!o.f.v) return;
          count++; found = true; if (quiet) return;
          const head = prefix + (o.f.n ? (i + 1) + ':' : '');
          if (!o.f.o) { io.out(head + l + '\n'); return; }
          if (o.f.v) return;   // -o -v prints nothing, as in GNU grep
          all.lastIndex = 0; let mm; while ((mm = all.exec(l))) { if (mm[0] === '') { all.lastIndex++; continue; } io.out(head + (o.f.w ? mm[0].replace(/^[^A-Za-z0-9_]/, '') : mm[0]) + '\n'); }   // -o: only the matching parts
        });
        if (o.f.q) continue;
        if (o.f.c) io.out(prefix + count + '\n'); else if (o.f.l && count) io.out(f.name + '\n'); else if (o.f.L && !count) io.out(f.name + '\n');
      }
      return exit || (found ? 0 : 1);
    } });
  def('sort', { cat: 'text', use: 'sort [-r] [-n] [-u] [-f] [-k N] [file...]', desc: 'Sort lines. Capitals come before lowercase letters unless -f; numbers sort as text unless -n.',
    opts: [['-r', 'reverse: largest or last first'], ['-n', 'numeric: 10 after 9'], ['-u', 'unique: drop repeated lines'], ['-f', 'fold: ignore capitals'], ['-k N', 'sort by the N-th column (columns are separated by spaces, or by -t)'], ['-t C', 'the column separator for -k']],
    ex: ['sort names.txt', 'sort -n scores.txt', 'sort -t , -k 2 -n grades.csv', 'sort words.txt | uniq -c'],
    async run(args, io, sh) {
      const o = getopts(args, 'rnufk:t:', io, 'sort'); if (!o) return 2;
      let all = [], exit = 0;
      for (const f of await inputs(o.args, io, sh, 'sort')) { if (!f) { exit = 2; continue; } all.push(...lines(f.text)); }
      // -k N: the key runs from field N to the end of the line; -k N,M from field N to field M
      const km = o.f.k ? String(o.f.k).match(/^(\d+)(?:,(\d+))?$/) : null;
      if (o.f.k && (!km || +km[1] < 1 || (km[2] !== undefined && +km[2] < +km[1]))) { io.err('sort: invalid number at field start: invalid count at start of ' + q(o.f.k) + '\n'); return 2; }
      const col = km ? +km[1] : 0, colEnd = km && km[2] !== undefined ? +km[2] : Infinity;
      const key = (l) => { let k = l; if (col) { if (o.f.t) k = l.split(o.f.t).slice(col - 1, colEnd).join(o.f.t); else k = (l.match(/\s*\S+/g) || []).slice(col - 1, colEnd).join('').replace(/^\s+/, ''); } if (o.f.f) k = k.toLowerCase(); return k; };
      const num = (s) => { const m = s.match(/^\s*-?\d+(\.\d+)?/); return m ? parseFloat(m[0]) : 0; };
      const keyCmp = (a, b) => { const ka = key(a), kb = key(b); return o.f.n ? num(ka) - num(kb) : (ka < kb ? -1 : ka > kb ? 1 : 0); };
      // equal keys fall back on the whole line, except with -u, where equal keys mean the same line (the first one is kept)
      const cmp = (a, b) => { let c = keyCmp(a, b); if (c === 0 && !o.f.u) c = a < b ? -1 : a > b ? 1 : 0; return o.f.r ? -c : c; };
      all.sort(cmp);
      if (o.f.u) all = all.filter((l, i) => i === 0 || keyCmp(all[i - 1], l) !== 0);
      for (const l of all) io.out(l + '\n');
      return exit;
    } });
  def('uniq', { cat: 'text', use: 'uniq [-c] [-d] [-i] [file]', desc: 'Drop repeated lines, when they are next to each other: sort first, then uniq.', opts: [['-c', 'count how many times each line appeared'], ['-d', 'only the lines that were repeated'], ['-i', 'ignore capitals']],
    ex: ['sort words.txt | uniq', 'sort words.txt | uniq -c | sort -rn'],
    async run(args, io, sh) {
      const o = getopts(args, 'cdui', io, 'uniq'); if (!o) return 1;
      const f = (await inputs(o.args.slice(0, 1), io, sh, 'uniq'))[0]; if (!f) return 1;
      const ls = lines(f.text); const same = (a, b) => o.f.i ? a.toLowerCase() === b.toLowerCase() : a === b;
      let i = 0;
      while (i < ls.length) { let j = i + 1; while (j < ls.length && same(ls[j], ls[i])) j++; const n = j - i; if ((o.f.d && n > 1) || (o.f.u && n === 1) || (!o.f.d && !o.f.u)) io.out((o.f.c ? pad(n, 7) + ' ' : '') + ls[i] + '\n'); i = j; }
      return 0;
    } });
  const fieldList = (spec, io, name) => { const ranges = []; for (const part of spec.split(',')) { const m = part.match(/^(\d*)(?:(-)(\d*))?$/); if (!m || (m[1] === '' && !m[2]) || (m[1] === '' && m[3] === '')) { io.err(name + ': invalid field range: ' + q(spec) + '\n'); return null; } const a = m[1] === '' ? 1 : +m[1], b = m[2] ? (m[3] === '' ? Infinity : +m[3]) : a; if (a < 1) { io.err(name + ': fields are numbered from 1\n'); return null; } ranges.push([a, b]); } return (i) => ranges.some(([a, b]) => i >= a && i <= b); };
  def('cut', { cat: 'text', use: 'cut -d DELIM -f LIST [file...]  |  cut -c LIST [file...]', desc: 'Keep only some columns of each line: fields separated by a character (-d, -f) or character positions (-c). LIST is like 1, 1,3 or 2-4.',
    opts: [['-d C', 'the character between fields (a tab if not given)'], ['-f LIST', 'which fields to keep'], ['-c LIST', 'which characters to keep'], ['-s', 'skip lines that have no delimiter']],
    ex: ['cut -d , -f 1 grades.csv', 'cut -d : -f 1 /etc/passwd', 'cut -c 1-3 codes.txt'],
    async run(args, io, sh) {
      const o = getopts(args, 'd:f:c:s', io, 'cut'); if (!o) return 1;
      if (!o.f.f && !o.f.c) { io.err('cut: you must specify a list of bytes, characters, or fields\nTry \'man cut\' for help.\n'); return 1; }
      const want = fieldList(o.f.f || o.f.c, io, 'cut'); if (!want) return 1;
      const delim = o.f.d === undefined ? '\t' : o.f.d; let exit = 0;
      if (o.f.d !== undefined && o.f.d.length !== 1) { io.err('cut: the delimiter must be a single character\n'); return 1; }
      for (const f of await inputs(o.args, io, sh, 'cut')) {
        if (!f) { exit = 1; continue; }
        for (const l of lines(f.text)) {
          if (o.f.c) { io.out([...l].filter((ch, i) => want(i + 1)).join('') + '\n'); continue; }
          if (!l.includes(delim)) { if (!o.f.s) io.out(l + '\n'); continue; }
          io.out(l.split(delim).filter((ch, i) => want(i + 1)).join(delim) + '\n');
        }
      }
      return exit;
    } });
  const trSet = (s) => { const out = []; s = s.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\\\/g, '\\'); const classes = { '[:alnum:]': 'a-zA-Z0-9', '[:blank:]': ' \t', '[:upper:]': 'A-Z', '[:lower:]': 'a-z', '[:digit:]': '0-9', '[:space:]': ' \t\n', '[:alpha:]': 'a-zA-Z', '[:punct:]': '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~' }; for (const k in classes) s = s.split(k).join(classes[k]); for (let i = 0; i < s.length; i++) { if (s[i + 1] === '-' && i + 2 < s.length) { for (let c = s.charCodeAt(i); c <= s.charCodeAt(i + 2); c++) out.push(String.fromCharCode(c)); i += 2; } else out.push(s[i]); } return out; };
  def('tr', { cat: 'text', use: 'tr [-d] [-s] SET1 [SET2]', desc: 'Translate characters: each character in SET1 becomes the matching one in SET2. Reads from a pipe or <, never from a file name.',
    opts: [['-d', 'delete the characters in SET1'], ['-s', 'squeeze repeats of a character into one'], ['a-z', 'ranges and [:upper:], [:lower:], [:digit:], [:space:] work in sets']],
    ex: ['echo hello | tr a-z A-Z', 'cat text.txt | tr -d ,', "tr ' ' '\\n' < words.txt"],
    async run(args, io, sh) {
      const o = getopts(args, 'dsc', io, 'tr'); if (!o) return 1;
      if (!o.args.length || (!o.f.d && !o.f.s && o.args.length < 2)) { io.err('tr: missing operand\nTry \'man tr\' for help.\n'); return 1; }
      const s1 = trSet(o.args[0]), s2 = o.args[1] !== undefined ? trSet(o.args[1]) : [];
      let text = await readAll(io, 'tr'), out = '';
      const inS1 = new Set(s1), c = !!o.f.c, pick = (ch) => inS1.has(ch) !== c;   // -c: the complement, every character NOT in SET1
      if (o.f.d) { for (const ch of text) if (!pick(ch)) out += ch; }
      else if (!s2.length) out = text;   // tr -s SET: squeeze only
      else if (c) { const to = s2[s2.length - 1]; for (const ch of text) out += pick(ch) ? to : ch; }
      else { const map = new Map(); s1.forEach((ch, i) => { if (!map.has(ch)) map.set(ch, s2[Math.min(i, s2.length - 1)]); }); for (const ch of text) out += map.has(ch) ? map.get(ch) : ch; }
      if (o.f.s) { const inS2 = new Set(s2), sq = s2.length ? (ch) => inS2.has(ch) : pick; let r = ''; for (const ch of out) if (!(sq(ch) && r.endsWith(ch))) r += ch; out = r; }
      io.out(out); return 0;
    } });
  def('sed', { cat: 'text', use: "sed [-i] 's/old/new/[g]' [file...]", desc: 'Replace text on every line: s/old/new/ changes the first match on each line, s/old/new/g every match. old is a regular expression.',
    opts: [['-i', 'change the file itself instead of printing the result'], ['-n with p', 'print only some lines: sed -n 2p (line 2), sed -n 2,4p (lines 2 to 4)']],
    ex: ["sed 's/colour/color/g' essay.txt", "sed -i 's/TODO/DONE/' notes.txt", 'sed -n 1,3p long.txt'],
    async run(args, io, sh) {
      const o = getopts(args, 'inEe:', io, 'sed'); if (!o) return 1;
      const script = o.f.e !== undefined ? o.f.e : o.args.shift();
      if (script === undefined) { io.err('Usage: sed [-i] [-n] SCRIPT [FILE]...\n'); return 1; }
      let fn;
      // s/old/new/flags, split by hand on the delimiter (a backslash protects the next character)
      const sm = (() => { if (script[0] !== 's' || script.length < 2) return null; const d = script[1], parts = ['']; for (let i = 2; i < script.length; i++) { const c = script[i]; if (c === '\\' && i + 1 < script.length) { parts[parts.length - 1] += c + script[++i]; continue; } if (c === d) { parts.push(''); continue; } parts[parts.length - 1] += c; } return parts.length === 3 && /^[gi]*$/.test(parts[2]) ? [script, d, parts[0], parts[1], parts[2]] : null; })();
      const pm = script.match(/^(\d+)(?:,(\d+|\$))?p$/);
      const dm = script.match(/^(\d+)(?:,(\d+|\$))?d$/);
      if (sm) { let re; try { re = new RegExp(posixRegex(sm[2], !!o.f.E), sm[4].includes('g') ? 'g' + (sm[4].includes('i') ? 'i' : '') : (sm[4].includes('i') ? 'i' : '')); } catch (e) { io.err('sed: -e expression #1, char 0: ' + e.message + '\n'); return 1; } const rep = sm[3].replace(/\\(\d)/g, '$$$1').replace(/&/g, '$$&').replace(/\\&/g, '&'); fn = (l, i, n) => [l.replace(re, rep), true]; }
      else if (pm || dm) { const m = pm || dm; const a = +m[1], b = m[2] === undefined ? a : m[2] === '$' ? Infinity : +m[2]; fn = pm ? (l, i) => [l, i >= a && i <= b] : (l, i) => [l, !(i >= a && i <= b)]; if (pm && !o.f.n) fn = (l, i) => [l, true, i >= a && i <= b]; }
      else if (script[0] === 's') { io.err("sed: -e expression #1, char " + script.length + ": unterminated `s' command\n"); return 1; }
      else { io.err('sed: -e expression #1, char 1: unknown command: ' + q(script[0] || '') + ' (only s/old/new/, Np and Nd are available here)\n'); return 1; }
      let exit = 0;
      for (const f of await inputs(o.args, io, sh, 'sed')) {
        if (!f) { exit = 2; continue; }
        let out = '';
        lines(f.text).forEach((l, i) => { const r = fn(l, i + 1); if (r[1]) out += r[0] + '\n'; if (r[2]) out += r[0] + '\n'; });
        if (o.f.i && f.name !== '-') sh.fs.write(sh.fs.resolve(f.name), out); else io.out(out);
      }
      return exit;
    } });
  def('rev', { cat: 'text', use: 'rev [file...]', desc: 'Reverse the characters of each line.', ex: ['echo stressed | rev'], async run(args, io, sh) { let exit = 0; for (const f of await inputs(args, io, sh, 'rev')) { if (!f) { exit = 1; continue; } for (const l of lines(f.text)) io.out([...l].reverse().join('') + '\n'); } return exit; } });
  def('nl', { cat: 'text', use: 'nl [file...]', desc: 'Number the lines of a file (like cat -n, but blank lines are not numbered).', ex: ['nl poem.txt'], async run(args, io, sh) { let exit = 0, k = 0; for (const f of await inputs(args, io, sh, 'nl')) { if (!f) { exit = 1; continue; } for (const l of lines(f.text)) io.out((l.trim() === '' ? '       ' : pad(++k, 6) + '\t') + l + '\n'); } return exit; } });
  def('diff', { cat: 'text', use: 'diff file1 file2', desc: 'Show the lines that differ between two files. < lines are from the first file, > lines from the second. Prints nothing when they are the same.',
    ex: ['diff draft.txt final.txt', 'diff expected.txt output.txt && echo same'],
    run(args, io, sh) {
      if (args.length !== 2) { io.err('diff: missing operand after ' + q(args[0] || 'diff') + '\ndiff: Try \'man diff\' for help.\n'); return 2; }
      const fs = sh.fs, texts = [];
      for (const a of args) { const n = fs.stat(fs.resolve(a)); if (!n) { io.err('diff: ' + a + ': No such file or directory\n'); return 2; } if (n.t === 'd') { io.err('diff: ' + a + ': Is a directory\n'); return 2; } texts.push(lines(n.d).slice(0, 2000)); }
      const [A, B] = texts; const n = A.length, m = B.length;
      // longest common subsequence, then the hunks in "normal" diff format
      const L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
      for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
      let i = 0, j = 0, changed = false;
      const hunk = (a0, a1, b0, b1) => {   // A[a0..a1) replaced by B[b0..b1)
        const ra = a1 - a0 <= 1 ? String(a1 > a0 ? a0 + 1 : a0) : (a0 + 1) + ',' + a1, rb = b1 - b0 <= 1 ? String(b1 > b0 ? b0 + 1 : b0) : (b0 + 1) + ',' + b1;
        io.out(ra + (a1 > a0 && b1 > b0 ? 'c' : a1 > a0 ? 'd' : 'a') + rb + '\n');
        for (let k = a0; k < a1; k++) io.out('< ' + A[k] + '\n'); if (a1 > a0 && b1 > b0) io.out('---\n'); for (let k = b0; k < b1; k++) io.out('> ' + B[k] + '\n');
        changed = true;
      };
      while (i < n || j < m) {
        if (i < n && j < m && A[i] === B[j]) { i++; j++; continue; }
        const a0 = i, b0 = j;
        while (i < n || j < m) { if (i < n && j < m && A[i] === B[j]) break; if (i < n && (j >= m || L[i + 1][j] >= L[i][j + 1])) i++; else j++; }
        hunk(a0, i, b0, j);
      }
      return changed ? 1 : 0;
    } });
  def('tee', { cat: 'text', use: 'tee [-a] file', desc: 'Write what comes in from a pipe both to the screen and to a file.', opts: [['-a', 'append to the file instead of replacing it']], ex: ['ls -l | tee listing.txt'],
    async run(args, io, sh) { const o = getopts(args, 'a', io, 'tee'); if (!o) return 1; const text = await readAll(io, 'tee'); io.out(text); let exit = 0; for (const a of o.args) { try { sh.fs.write(sh.fs.resolve(a), text, !!o.f.a); } catch (e) { if (!(e instanceof FsError)) throw e; exit = 1; io.err('tee: ' + a + ': ' + e.message + '\n'); } } return exit; } });
  def('xargs', { cat: 'text', use: 'xargs command [arguments]', desc: 'Run a command with the words from a pipe added as its arguments.', ex: ['find . -name "*.tmp" | xargs rm', 'echo a b c | xargs mkdir'],
    opts: [['-n N', 'at most N words for each run of the command']],
    async run(args, io, sh, ctx) {
      let per = Infinity; const m = args[0] && args[0].match(/^-n(\d*)$/);
      if (m) { const v = m[1] || args[1]; args = args.slice(m[1] ? 1 : 2); per = parseInt(v, 10); if (!(per >= 1)) { io.err('xargs: value ' + q(v === undefined ? '' : v) + ' for -n option should be >= 1\n'); return 1; } }
      const words = (await readAll(io, 'xargs')).split(/\s+/).filter(Boolean); const cmd = args.length ? args : ['echo'];
      // the command runs once for each group of words (once with none when nothing came in); a failure makes xargs answer 123, as GNU xargs does
      let exit = 0, k = 0;
      do { const r = await sh.exec_words(cmd.concat(words.slice(k, k + per)), ctx, Object.assign({}, io, { stdin: null })); if (r === 127 || r === 126) return r; if (r) exit = 123; k += per; } while (k < words.length);
      return exit;
    } });

  // ----- text out
  const unescape = (s) => s.replace(/\\(n|t|\\|a|0|e|r|")/g, (m, c) => ({ n: '\n', t: '\t', '\\': '\\', a: '', 0: '', e: '\u001b', r: '\r', '"': '"' })[c]);
  def('echo', { cat: 'shell', builtin: true, use: 'echo [-n] [-e] text...', desc: 'Print its arguments, with a space between them and a newline at the end.', opts: [['-n', 'no newline at the end'], ['-e', 'turn \\n and \\t into a newline and a tab']],
    ex: ['echo Hello, world', 'echo "two  spaces"', 'echo $HOME', 'echo "shopping" > list.txt'],
    run(args, io) { let n = false, e = false; while (args.length && /^-[neE]+$/.test(args[0])) { const a = args.shift(); if (a.includes('n')) n = true; if (a.includes('e')) e = true; if (a.includes('E')) e = false; } let s = args.join(' '); if (e) s = unescape(s); io.out(s + (n ? '' : '\n')); return 0; } });
  def('printf', { cat: 'shell', builtin: true, use: 'printf FORMAT [arguments...]', desc: 'Print with a format, as in C: %s a string, %d a whole number, %5.2f a decimal; \\n is a newline. The format is reused if there are more arguments than it needs.',
    ex: ['printf "%s is %d years old\\n" Ada 36', 'printf "%-10s|%5d|\\n" name 42', 'printf "%.2f\\n" 3.14159'],
    run(args, io) {
      if (!args.length) { io.err('printf: usage: printf format [arguments]\n'); return 2; }
      const fmt = unescape(args[0]); let rest = args.slice(1), out = '', rounds = 0, used = 0;
      const one = () => fmt.replace(/%(%|[-+ 0]*\d*(?:\.\d+)?[sdifoxXceE])/g, (m, spec) => {
        if (spec === '%') return '%';
        const s = spec.match(/^([-+ 0]*)(\d*)(?:\.(\d+))?([sdifoxXceE])$/); const flags = s[1], width = +s[2] || 0, prec = s[3] === undefined ? null : +s[3], conv = s[4];
        const a = rest.length ? (used++, rest.shift()) : ''; let v;
        if (conv === 's') v = prec === null ? a : a.slice(0, prec);
        else if (conv === 'c') v = a.slice(0, 1);
        else if (conv === 'e' || conv === 'E') { const x = parseFloat(a) || 0; v = x.toExponential(prec === null ? 6 : prec).replace(/e([+-])(\d)$/, 'e$10$2'); if (conv === 'E') v = v.toUpperCase(); if (flags.includes('+') && x >= 0) v = '+' + v; }
        else if (conv === 'f') { const x = parseFloat(a) || 0; v = x.toFixed(prec === null ? 6 : prec); if (flags.includes('+') && x >= 0) v = '+' + v; }
        else { const x = Math.trunc(parseFloat(a)) || 0; v = conv === 'x' ? x.toString(16) : conv === 'X' ? x.toString(16).toUpperCase() : conv === 'o' ? x.toString(8) : String(x); if (flags.includes('+') && x >= 0) v = '+' + v; }
        if (v.length < width) v = flags.includes('-') ? padR(v, width) : (flags.includes('0') && conv !== 's' ? (v[0] === '-' ? '-' + '0'.repeat(width - v.length) + v.slice(1) : '0'.repeat(width - v.length) + v) : pad(v, width));
        return v;
      });
      do { used = 0; out += one(); if (++rounds > 1000) break; } while (rest.length && used > 0);   // the format is reused only while it takes arguments
      io.out(out); return 0;
    } });
  def('seq', { cat: 'text', use: 'seq [first] [step] last', desc: 'Print the numbers from first to last, one per line.', ex: ['seq 5', 'seq 1 10', 'seq 0 5 20', 'for i in $(seq 3); do echo $i; done'],
    opts: [['-w', 'equal width: pad with leading zeros (08 09 10)']],
    run(args, io) { let wide = false; if (args[0] === '-w') { wide = true; args = args.slice(1); } const nums = args.map(Number); if (!args.length || nums.some(isNaN)) { io.err('seq: ' + (args.length ? 'invalid floating point argument: ' + q(args.find((a) => isNaN(Number(a)))) : 'missing operand') + '\n'); return 1; } let [a, s, b] = nums.length === 1 ? [1, 1, nums[0]] : nums.length === 2 ? [nums[0], 1, nums[1]] : nums; if (s === 0) { io.err('seq: invalid Zero increment value: \'0\'\n'); return 1; } // decimals: as many places as the first number and the step have (seq 0 0.1 0.3 → 0.0 0.1 0.2 0.3); each value is first + k*step, so no drift
      const places = (t) => { const m = String(t).match(/\.(\d+)$/); return m ? m[1].length : 0; };
      const dp = Math.max(places(nums.length === 1 ? 1 : args[0]), nums.length === 3 ? places(args[1]) : 0), eps = Math.abs(s) * 1e-9;
      const vals = [];
      for (let k = 0; k <= 100000; k++) { const x = a + k * s; if (s > 0 ? x > b + eps : x < b - eps) break; vals.push(dp ? x.toFixed(dp) : String(Math.round(x * 1e9) / 1e9)); }
      // -w: zeros after any minus sign, up to the widest number
      const w = wide ? Math.max(0, ...vals.map((v) => v.length)) : 0, zp = (v) => v.length >= w ? v : v[0] === '-' ? '-' + '0'.repeat(w - v.length) + v.slice(1) : '0'.repeat(w - v.length) + v;
      for (const v of vals) io.out(zp(v) + '\n');
      return 0; } });
  def('date', { cat: 'other', use: 'date [+FORMAT]', desc: 'Print the date and time. +FORMAT chooses the pieces: %Y year, %m month, %d day, %H:%M:%S time, %A weekday, %B month name.', ex: ['date', 'date +%Y-%m-%d', 'date "+%A, %d %B %Y"'],
    run(args, io, sh) {
      const d = new Date(sh.fs.now()); const two = (x) => String(x).padStart(2, '0');
      const LONGDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], LONGMONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const fmt = args[0] && args[0].startsWith('+') ? args[0].slice(1) : '%a %b %e %H:%M:%S %Z %Y';
      if (args[0] && !args[0].startsWith('+')) { io.err('date: invalid date ' + q(args[0]) + ' (only printing the date is available here)\n'); return 1; }
      const start = new Date(d.getFullYear(), 0, 0); const doy = Math.floor((d - start) / 86400000);
      io.out(fmt.replace(/%([YmdHMSAaBbjueFTDynsZ%])/g, (m, c) => ({ Y: d.getFullYear(), m: two(d.getMonth() + 1), d: two(d.getDate()), e: pad(d.getDate(), 2), H: two(d.getHours()), M: two(d.getMinutes()), S: two(d.getSeconds()), A: LONGDAYS[d.getDay()], a: DAYS[d.getDay()], B: LONGMONTHS[d.getMonth()], b: MONTHS[d.getMonth()], j: String(doy).padStart(3, '0'), u: d.getDay() || 7, F: d.getFullYear() + '-' + two(d.getMonth() + 1) + '-' + two(d.getDate()), T: two(d.getHours()) + ':' + two(d.getMinutes()) + ':' + two(d.getSeconds()), D: two(d.getMonth() + 1) + '/' + two(d.getDate()) + '/' + two(d.getFullYear() % 100), y: two(d.getFullYear() % 100), n: '\n', s: Math.floor(d / 1000), Z: 'UTC', '%': '%' })[c]) + '\n');
      return 0;
    } });
  def('cal', { cat: 'other', use: 'cal', desc: 'Show this month as a calendar.', ex: ['cal'],
    run(args, io, sh) { const d = new Date(sh.fs.now()); const y = d.getFullYear(), m = d.getMonth(); const title = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m] + ' ' + y; io.out(' '.repeat(Math.max(0, Math.floor((20 - title.length) / 2))) + title + '\nSu Mo Tu We Th Fr Sa\n'); const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate(); let line = '   '.repeat(first); for (let k = 1; k <= days; k++) { line += pad(k, 2) + ' '; if ((first + k) % 7 === 0) { io.out(line.replace(/\s+$/, '') + '\n'); line = ''; } } if (line.trim()) io.out(line.replace(/\s+$/, '') + '\n'); return 0; } });
  def('whoami', { cat: 'other', use: 'whoami', desc: 'Print your user name.', ex: ['whoami'], run(args, io) { io.out(USER + '\n'); return 0; } });
  def('hostname', { cat: 'other', use: 'hostname', desc: 'Print the name of this computer.', ex: ['hostname'], run(args, io) { io.out(HOST + '\n'); return 0; } });
  def('id', { cat: 'other', use: 'id', desc: 'Print your user and group ids.', ex: ['id'], run(args, io) { io.out('uid=1000(' + USER + ') gid=1000(' + USER + ') groups=1000(' + USER + ')\n'); return 0; } });
  def('uname', { cat: 'other', use: 'uname [-a]', desc: 'Print the name of the operating system.', opts: [['-a', 'all the details']], ex: ['uname -a'], run(args, io) { io.out((args.includes('-a') ? 'Linux ' + HOST + ' 6.1.0-practice #1 SMP x86_64 GNU/Linux' : 'Linux') + '\n'); return 0; } });
  def('file', { cat: 'text', use: 'file file...', desc: 'Say what kind of thing a file is.', ex: ['file *'],
    run(args, io, sh) { if (!args.length) { io.err('Usage: file FILE...\n'); return 1; } let exit = 0; const w = Math.max(...args.map((a) => a.length)) + 1; for (const a of args) { const n = sh.fs.stat(sh.fs.resolve(a)); let k; if (!n) { k = 'cannot open ' + q(a) + ' (No such file or directory)'; exit = 1; } else if (n.t === 'd') k = 'directory'; else if (n.bin) k = n.bin.lang === 'java' ? 'compiled Java class data' : 'ELF 64-bit LSB executable, x86-64'; else if (n.d === '') k = 'empty'; else if (n.d.startsWith('#!')) k = (n.d.match(/^#!\s*\S*?(\w+)\s*$/m) || [0, 'script'])[1] + ' script, ASCII text executable'; else if (/\.py$/.test(a)) k = 'Python script, ASCII text executable'; else if (/\.(csv)$/.test(a)) k = 'CSV text'; else k = 'ASCII text'; io.out(padR(a + ':', w) + ' ' + k + '\n'); } return exit; } });
  def('sleep', { cat: 'other', use: 'sleep seconds', desc: 'Wait for a number of seconds (at most 3 here).', ex: ['sleep 1'], run(args, io) { const s = parseFloat(args[0]); if (isNaN(s) || s < 0) { io.err('sleep: invalid time interval ' + q(args[0] === undefined ? '' : args[0]) + '\n'); return 1; } return new Promise((r) => setTimeout(() => r(0), Math.min(s, 3) * 1000)); } });

  // ----- the shell itself
  def('history', { cat: 'shell', builtin: true, use: 'history [-c]', desc: 'Show the commands you have typed. The up and down arrows bring them back; -c forgets them.', ex: ['history', 'history | grep mkdir'],
    run(args, io, sh) { if (args[0] === '-c') { sh.history.length = 0; return 0; } sh.history.forEach((h, i) => io.out(pad(i + 1, 5) + '  ' + h + '\n')); return 0; } });
  def('clear', { cat: 'shell', builtin: true, use: 'clear', desc: 'Clear the screen (Ctrl+L does the same).', ex: ['clear'], run(args, io) { if (io.clear) io.clear(); return 0; } });
  def('exit logout', { cat: 'shell', builtin: true, use: 'exit [status]', desc: 'End a script with a status: 0 means success, anything else a problem. At the prompt it does nothing but say so.', ex: ['exit', 'exit 1'],
    run(args, io, sh, ctx) { const code = args.length ? (parseInt(args[0], 10) & 255) || 0 : sh.lastExit; if (ctx.name === 'bash') { io.out('(this terminal stays open: close its panel to leave)\n'); return code; } throw new Stop('exit', code); } });
  def('shift', { cat: 'shell', builtin: true, use: 'shift [n]', desc: 'In a script, drop the first argument (or the first n): $2 becomes $1, and $# goes down by one.', ex: ['shift'],
    run(args, io, sh, ctx) { const n = args.length ? parseInt(args[0], 10) : 1; if (isNaN(n) || n < 0) { io.err('bash: shift: ' + args[0] + ': numeric argument required\n'); return 1; } if (n > ctx.args.length) return 1; ctx.args.splice(0, n); return 0; } });
  def(':', { cat: 'shell', builtin: true, use: ':', desc: 'Do nothing (a no-op; the body of a loop that only waits).', ex: [], run() { return 0; } });
  def('true', { cat: 'shell', builtin: true, use: 'true', desc: 'Do nothing, successfully (status 0).', ex: ['true && echo yes'], run() { return 0; } });
  def('false', { cat: 'shell', builtin: true, use: 'false', desc: 'Do nothing, unsuccessfully (status 1).', ex: ['false || echo no'], run() { return 1; } });
  def('export', { cat: 'shell', builtin: true, use: 'export NAME=value', desc: 'Set a variable (here the same as NAME=value). export alone lists them.', ex: ['export NAME=Ada', 'echo $NAME'],
    run(args, io, sh) { if (!args.length) { for (const k of Object.keys(sh.vars).sort()) io.out('declare -x ' + k + '="' + sh.vars[k] + '"\n'); return 0; } for (const a of args) { const m = a.match(/^([A-Za-z_][A-Za-z0-9_]*)(?:=(.*))?$/s); if (!m) { io.err("bash: export: `" + a + "': not a valid identifier\n"); return 1; } if (m[2] !== undefined) sh.setVar(m[1], m[2]); } return 0; } });
  def('unset', { cat: 'shell', builtin: true, use: 'unset NAME', desc: 'Forget a variable.', ex: ['unset NAME'], run(args, io, sh) { for (const a of args) delete sh.vars[a]; return 0; } });
  def('env printenv set', { cat: 'shell', builtin: true, use: 'env', desc: 'List the variables and their values.', ex: ['env', 'printenv HOME'],
    run(args, io, sh, ctx) {
      // set -- a b (or set a b): the positional parameters $1 $2 ... become a b; options such as -e are accepted and ignored here
      if (args.length && this.name === 'set') { let k = 0; while (k < args.length && /^[-+][a-z]+$/.test(args[k])) k++; if (args[k] === '--') k++; else if (k === args.length) return 0; ctx.args.splice(0, ctx.args.length, ...args.slice(k)); return 0; }
      if (args.length && this.name === 'printenv') { let exit = 0; for (const a of args) { const v = sh.getVar(a); if (v === '') exit = 1; else io.out(v + '\n'); } return exit; } for (const k of Object.keys(sh.vars).sort()) io.out(k + '=' + sh.vars[k] + '\n'); io.out('PWD=' + sh.fs.cwd + '\n'); return 0; } });
  def('which', { cat: 'shell', use: 'which command', desc: 'Show where a command lives.', ex: ['which python'], run(args, io) { let exit = 0; for (const a of args) { if (has(COMMANDS, a) && !COMMANDS[a].builtin) io.out('/bin/' + a + '\n'); else exit = 1; } return args.length ? exit : 1; } });
  def('type', { cat: 'shell', builtin: true, use: 'type command', desc: 'Say what kind of command a name is.', ex: ['type cd', 'type ls'], run(args, io) { let exit = 0; for (const a of args) { if (!has(COMMANDS, a)) { io.err('bash: type: ' + a + ': not found\n'); exit = 1; } else io.out(a + (COMMANDS[a].builtin ? ' is a shell builtin' : ' is /bin/' + a) + '\n'); } return exit; } });
  def('alias', { cat: 'shell', builtin: true, use: 'alias', desc: 'Aliases are not kept in this practice shell.', ex: [], run(args, io) { if (args.length) io.err('bash: alias: aliases are not available in this practice shell\n'); return args.length ? 1 : 0; } });
  def('test [', { cat: 'shell', builtin: true, use: 'test EXPRESSION   or   [ EXPRESSION ]', desc: 'Check something and answer with a status: 0 for true, 1 for false. Used by if and while. Leave spaces around the brackets.',
    opts: [['-f FILE', 'FILE exists and is a file'], ['-d DIR', 'DIR exists and is a directory'], ['-e PATH', 'PATH exists'], ['-s FILE', 'FILE is not empty'], ['-x FILE', 'FILE may run as a program'], ['-z S', 'the string S is empty; -n S: not empty'], ['A = B', 'the strings are the same; != different'], ['A -eq B', 'the numbers are equal; also -ne -lt -le -gt -ge'], ['! EXPR', 'not']],
    ex: ['if [ -f notes.txt ]; then echo "found"; fi', '[ $count -gt 10 ] && echo many', 'test -d projects || mkdir projects'],
    run(args, io, sh) {
      if (this.name === '[') { if (args[args.length - 1] !== ']') { io.err("bash: [: missing `]'\n"); return 2; } args = args.slice(0, -1); }
      const fs = sh.fs;
      const num = (s) => { if (!/^[-+]?\d+$/.test(String(s).trim())) { throw new Error(s + ': integer expression expected'); } return parseInt(s, 10); };
      const term = (a) => {
        if (a.length === 0) return false;
        if (a.length === 1) return a[0] !== '';
        if (a[0] === '!') return !term(a.slice(1));
        if (a.length === 2) { const n = fs.stat(fs.resolve(a[1])); switch (a[0]) { case '-e': return !!n; case '-f': return !!n && n.t === 'f'; case '-d': return !!n && n.t === 'd'; case '-s': return !!n && n.t === 'f' && n.d.length > 0; case '-x': return !!n && (n.t === 'd' || n.x); case '-r': case '-w': return !!n; case '-z': return a[1] === ''; case '-n': return a[1] !== ''; default: throw new Error(a[0] + ': unary operator expected'); } }
        if (a.length === 3) { const [x, op, y] = a; switch (op) { case '=': case '==': return x === y; case '!=': return x !== y; case '<': return x < y; case '>': return x > y; case '-eq': return num(x) === num(y); case '-ne': return num(x) !== num(y); case '-lt': return num(x) < num(y); case '-le': return num(x) <= num(y); case '-gt': return num(x) > num(y); case '-ge': return num(x) >= num(y); default: throw new Error(op + ': binary operator expected'); } }
        const i = a.indexOf('-a') >= 0 ? a.indexOf('-a') : a.indexOf('-o');
        if (i > 0) return a[i] === '-a' ? term(a.slice(0, i)) && term(a.slice(i + 1)) : term(a.slice(0, i)) || term(a.slice(i + 1));
        throw new Error('too many arguments');
      };
      try { return term(args) ? 0 : 1; } catch (e) { io.err('bash: ' + this.name + ': ' + e.message + '\n'); return 2; }
    } });
  def('read', { cat: 'shell', builtin: true, use: 'read [-p prompt] NAME...', desc: 'Read a line typed by the user (or the next line of the input) into a variable.', opts: [['-p TEXT', 'show TEXT as the prompt first']],
    ex: ['read -p "Your name: " name', 'echo "Hello, $name"', 'while read line; do echo "got: $line"; done < list.txt'],
    async run(args, io, sh) {
      const o = getopts(args, 'p:rs', io, 'read'); if (!o) return 1;
      let line, eof = false;
      if (io.stdin) { const rest = io.stdin.text.slice(io.stdin.pos); if (rest === '') eof = true; else { const k = rest.indexOf('\n'); line = k < 0 ? rest : rest.slice(0, k); io.stdin.pos += k < 0 ? rest.length : k + 1; } }
      else if (io.ask) { line = await io.ask(o.f.p || ''); if (line == null) eof = true; }
      else eof = true;
      const names = o.args.length ? o.args : ['REPLY'];
      if (eof) { for (const n of names) sh.setVar(n, ''); return 1; }
      // one word for each name; the last name takes the rest of the line as it is, only the spaces at its two ends removed
      let rest = line.replace(/^[ \t]+/, '');
      names.forEach((n, i) => { if (i === names.length - 1) { sh.setVar(n, rest.replace(/[ \t]+$/, '')); return; } const m = rest.match(/^(\S*)[ \t]*/); sh.setVar(n, m[1]); rest = rest.slice(m[0].length); });
      return 0;
    } });
  def('source .', { cat: 'shell', builtin: true, use: 'source script.sh', desc: 'Run a script in this shell, so its variables stay.', ex: ['source settings.sh'],
    async run(args, io, sh, ctx) { if (!args.length) { io.err('bash: ' + this.name + ': filename argument required\n'); return 2; } const abs = sh.fs.resolve(args[0]); const n = sh.fs.stat(abs); if (!n) { io.err('bash: ' + args[0] + ': No such file or directory\n'); return 1; } if (n.t === 'd') { io.err('bash: ' + args[0] + ': Is a directory\n'); return 1; } return sh.runScript(n.d, args[0], args.slice(1), io, true); } });
  def('bash sh', { cat: 'run', use: 'bash script.sh [arguments]', desc: 'Run a shell script: a file of commands, one per line. (./script.sh also works once the file is executable: chmod +x.)', opts: [['-c TEXT', 'run the commands in TEXT']],
    ex: ['bash tidy.sh', 'bash -c "echo hi; ls"'],
    async run(args, io, sh) {
      if (args[0] === '-c') { if (args[1] === undefined) { io.err(this.name + ': -c: option requires an argument\n'); return 2; } return sh.runScript(args[1], args.length > 2 ? args[2] : this.name, args.slice(3), io); }   // bash -c TEXT NAME ARGS: NAME is $0
      if (!args.length) { io.out('(you are already in a shell)\n'); return 0; }
      const abs = sh.fs.resolve(args[0]); const n = sh.fs.stat(abs);
      if (!n) { io.err(this.name + ': ' + args[0] + ': No such file or directory\n'); return 127; }
      if (n.t === 'd') { io.err(this.name + ': ' + args[0] + ': Is a directory\n'); return 126; }
      return sh.runScript(n.d, args[0], args.slice(1), io, true);
    } });

  // ----- running programs: the hooks hand the source to the site's sandboxes
  const CLASS_BYTES = 'Êþº¾\u0000\u0000\u0000A';
  const ELF_BYTES = '\u007fELF\u0002\u0001\u0001\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000';
  const className = (src) => { const m = src.match(/public\s+class\s+([A-Za-z_$][\w$]*)/) || src.match(/\bclass\s+([A-Za-z_$][\w$]*)/); return m ? m[1] : null; };
  def('python python3', { cat: 'run', use: 'python [file.py [arguments]]', desc: 'With no file, start Python\'s interactive shell (>>>; exit() or Ctrl+D leaves). With a file, run a Python program. Its input comes from the keyboard, or from a file with < input.txt; its output can go to a file with > out.txt.',
    ex: ['python hello.py', 'python game.py < moves.txt', 'python report.py > report.txt'],
    async run(args, io, sh) {
      if (args[0] === '-c') { if (args[1] === undefined) { io.err('Argument expected for the -c option\n'); return 2; } return sh.runProgram({ lang: 'python', src: args[1] }, 'python', args.slice(2), io); }
      if (args[0] === '--version' || args[0] === '-V') { io.out('Python 3.9.0 (Skulpt, in your browser)\n'); return 0; }
      if (!args.length && io.ask && !io.stdin && sh.hooks.repl) return sh.hooks.repl('python', io, sh);   // the interactive shell (src/repl.js)
      if (!args.length || args[0].startsWith('-')) { io.err('python: the interactive Python shell needs the keyboard. Give it a file: python hello.py\n'); return 2; }
      const abs = sh.fs.resolve(args[0]), n = sh.fs.stat(abs);
      if (!n) { io.err(this.name + ": can't open file " + q(abs) + ': [Errno 2] No such file or directory\n'); return 2; }
      if (n.t === 'd') { io.err(this.name + ": can't open file " + q(abs) + ': [Errno 21] Is a directory\n'); return 2; }
      return sh.runProgram({ lang: 'python', src: n.d }, args[0], args.slice(1), io);
    } });
  def('javac', { cat: 'run', use: 'javac File.java', desc: 'Compile a Java program: checks it and writes File.class, which java runs. The file must be named after its public class.',
    ex: ['javac Main.java', 'javac Main.java && java Main'],
    async run(args, io, sh) {
      const files = args.filter((a) => !a.startsWith('-'));
      if (!files.length) { io.err('error: no source files\n'); return 2; }
      let errors = 0;
      for (const f of files) {
        if (!f.endsWith('.java')) { io.err("error: Class names, '" + f + "', are only accepted if annotation processing is explicitly requested\n"); errors++; continue; }
        const abs = sh.fs.resolve(f), n = sh.fs.stat(abs);
        if (!n || n.t !== 'f') { io.err('error: file not found: ' + f + '\nUsage: javac <options> <source files>\n'); errors++; continue; }
        const base = f.split('/').pop().slice(0, -5), pub = (n.d.match(/public\s+class\s+([A-Za-z_$][\w$]*)/) || [])[1];
        if (pub && pub !== base) { io.err(f + ':1: error: class ' + pub + ' is public, should be declared in a file named ' + pub + '.java\n1 error\n'); errors++; continue; }
        const r = opts_compile(sh, 'java', n.d, { name: f }); const res = await r;
        if (res && res.err) { io.err(res.err.replace(/^\S+\.java:/gm, f + ':').replace(/\n?$/, '\n')); errors++; continue; }   // javac names the file as typed
        const cname = className(n.d) || base;
        sh.fs.write(sh.fs.resolve(cname + '.class', abs.slice(0, abs.lastIndexOf('/')) || '/'), CLASS_BYTES, false, { lang: 'java', src: n.d });
      }
      return errors ? 1 : 0;
    } });
  def('java', { cat: 'run', use: 'java Name [arguments]', desc: 'Run a compiled Java program: Name.class, made by javac Name.java. java Name.java compiles and runs in one step.',
    ex: ['javac Main.java', 'java Main', 'java Main < input.txt'],
    async run(args, io, sh) {
      if (args[0] === '-version' || args[0] === '--version') { io.out('java 17 (an interpreter in your browser)\n'); return 0; }
      if (!args.length || args[0].startsWith('-')) { io.err('Usage: java <mainclass> [args...]\n           (to execute a class)\n   or  java <sourcefile> [args...]\n           (to execute a single source-file program)\n'); return 1; }
      const name = args[0];
      if (name.endsWith('.java')) { const n = sh.fs.stat(sh.fs.resolve(name)); if (!n || n.t !== 'f') { io.err('error: file not found: ' + name + '\n'); return 2; } return sh.runProgram({ lang: 'java', src: n.d }, name, args.slice(1), io); }
      const cls = sh.fs.stat(sh.fs.resolve(name.replace(/\.class$/, '') + '.class'));
      if (!cls || cls.t !== 'f' || !cls.bin || cls.bin.lang !== 'java') { io.err('Error: Could not find or load main class ' + name + '\nCaused by: java.lang.ClassNotFoundException: ' + name + (sh.fs.isFile(sh.fs.resolve(name + '.java')) ? '\n(there is a ' + name + '.java: compile it first with javac ' + name + '.java)' : '') + '\n'); return 1; }
      return sh.runProgram(cls.bin, name, args.slice(1), io);
    } });
  def('g++ gcc clang++ cc c++', { cat: 'run', use: 'g++ file.cpp -o name', desc: 'Compile a C++ program into a program file, then run it with ./name. Without -o the program is called a.out.',
    opts: [['-o NAME', 'the name of the program to make'], ['-std=c++20', 'the language version (Full C++ only)'], ['-Wall', 'accepted and ignored, as are -O2 and friends']],
    ex: ['g++ hello.cpp -o hello', './hello', 'g++ game.cpp -o game && ./game < moves.txt'],
    async run(args, io, sh) {
      const name = this.name; let out = 'a.out', std; const srcs = [];
      for (let i = 0; i < args.length; i++) { const a = args[i]; if (a === '-o') { out = args[++i]; if (out === undefined) { io.err(name + ": error: missing filename after '-o'\n"); return 1; } } else if (a.startsWith('-std=')) std = a.slice(5); else if (a.startsWith('-')) { /* -Wall, -O2, -g: accepted */ } else srcs.push(a); }
      if (!srcs.length) { io.err(name + ': fatal error: no input files\ncompilation terminated.\n'); return 1; }
      const texts = [];
      for (const s of srcs) { const n = sh.fs.stat(sh.fs.resolve(s)); if (!n || n.t !== 'f') { io.err(name + ': error: ' + s + ': No such file or directory\n'); } else if (!/\.(cpp|cc|cxx|c\+\+|C|c)$/.test(s)) { io.err(name + ': error: ' + s + ': file not recognized: not a C++ source file\n'); } else texts.push(n.d); }
      if (texts.length !== srcs.length) { io.err(name + ': fatal error: no input files\ncompilation terminated.\n'); return 1; }
      if (texts.length > 1) { io.err(name + ': error: only one source file at a time is supported here\n'); return 1; }
      const r = await opts_compile(sh, 'cpp', texts[0], { std, name: srcs[0] });
      if (r && r.err) { io.err(r.err.replace(/\n?$/, '\n')); return 1; }
      sh.fs.write(sh.fs.resolve(out), ELF_BYTES + '(compiled from ' + srcs[0] + ')', false, { lang: 'cpp', src: texts[0], std: r && r.std || std });
      sh.fs.chmod(sh.fs.resolve(out), true);
      return 0;
    } });
  def('jshell', { cat: 'run', use: 'jshell', desc: 'Java\'s interactive shell: type a declaration, a statement or an expression and see its value at once (x ==> 5, $2 ==> 10). /help lists its commands; /exit or Ctrl+D leaves.', ex: ['jshell'],
    async run(args, io, sh) { if (io.ask && !io.stdin && sh.hooks.repl) return sh.hooks.repl('java', io, sh); io.err('jshell: the interactive Java shell needs the keyboard\n'); return 1; } });
  def('scheme mit-scheme racket', { cat: 'run', use: 'scheme [file.scm]', desc: 'Run a Scheme program; with no file, start the interactive Scheme shell (1 ]=>; (exit) or Ctrl+D leaves).', ex: ['scheme fact.scm'],
    async run(args, io, sh) { if (!args.length && io.ask && !io.stdin && sh.hooks.repl) return sh.hooks.repl('scheme', io, sh); if (!args.length) { io.err(this.name + ': the interactive Scheme shell needs the keyboard. Give it a file: scheme fact.scm\n'); return 2; } const n = sh.fs.stat(sh.fs.resolve(args[0])); if (!n || n.t !== 'f') { io.err(this.name + ': ' + args[0] + ': No such file or directory\n'); return 2; } return sh.runProgram({ lang: 'scheme', src: n.d }, args[0], args.slice(1), io); } });
  const opts_compile = (sh, lang, src, o) => sh.hooks.compile ? sh.hooks.compile(lang, src, o) : Promise.resolve({ err: null });

  // ----- editors
  def('nano', { cat: 'run', use: 'nano file', desc: 'Open a file in a small editor inside the terminal. Ctrl+S (or Ctrl+O) saves, Ctrl+X leaves; leaving with unsaved changes asks "Save modified buffer?": Y saves, N throws the changes away, Ctrl+C stays. A saved file ends with a newline, as in the real nano.', ex: ['nano notes.txt', 'nano hello.py'],
    async run(args, io, sh) {
      if (!sh.hooks.nano) { io.err('nano: no editor is available here\n'); return 1; }
      if (!args.length) { io.err('nano: give the name of a file to edit: nano notes.txt\n'); return 1; }
      const abs = sh.fs.resolve(args[0]), n = sh.fs.stat(abs);
      if (n && n.t === 'd') { io.err('nano: ' + args[0] + ': Is a directory\n'); return 1; }
      if (n && n.bin) { io.err('nano: ' + args[0] + ' is a compiled program, not text\n'); return 1; }
      // the editor saves through write() as the student goes; a hook may instead return the final text (the node tests do)
      const write = (t) => { try { sh.fs.write(abs, String(t)); return null; } catch (e) { if (!(e instanceof FsError)) throw e; return e.message; } };
      const text = await sh.hooks.nano(sh.tilde(abs), n ? n.d : '', write);
      if (text === null || text === undefined) return 0;
      const err = write(text); if (err) { io.err('nano: ' + args[0] + ': ' + err + '\n'); return 1; }
      return 0;
    } });
  def('vi vim emacs', { cat: 'run', use: 'vi file', desc: 'Not installed here. nano is.', ex: [], run(args, io) { io.err('bash: ' + this.name + ': command not found (use nano ' + (args[0] || 'file') + ')\n'); return 127; } });
  def('edit code open', { cat: 'run', use: 'edit file', desc: 'Open a file in the Code Lab editor above the terminal (a bigger editor, with highlighting). Saving there writes the file back here.', ex: ['edit hello.py'],
    run(args, io, sh) {
      if (!sh.hooks.edit) { io.err(this.name + ': the Code Lab editor is not available here\n'); return 1; }
      if (!args.length) { io.err(this.name + ': give the name of a file: edit hello.py\n'); return 1; }
      const abs = sh.fs.resolve(args[0]), n = sh.fs.stat(abs);
      if (n && n.t === 'd') { io.err(this.name + ': ' + args[0] + ': Is a directory\n'); return 1; }
      if (n && n.bin) { io.err(this.name + ': ' + args[0] + ' is a compiled program, not text\n'); return 1; }
      const msg = sh.hooks.edit(abs, n ? n.d : '');
      if (msg) io.out(msg + '\n');
      return 0;
    } });
  def('setup', { cat: 'run', use: 'setup NAME', desc: 'Prepare the files a lesson or exercise works with (the lesson tells you the name).', ex: ['setup lesson2'],
    run(args, io, sh) { if (!sh.hooks.setup) { io.err('setup: nothing to set up here\n'); return 1; } if (!args.length) { io.err('setup: which one? The lesson tells you, for example: setup lesson2\n'); return 1; } const msg = sh.hooks.setup(args[0], sh); if (msg === null || msg === undefined) { io.err('setup: there is no "' + args[0] + '" to set up\n'); return 1; } if (msg) io.out(String(msg).replace(/\n?$/, '\n')); return 0; } });
  def('sudo su', { cat: 'other', use: 'sudo command', desc: 'Run a command as the administrator. You are not one here.', ex: [], run(args, io) { io.err(this.name === 'su' ? 'su: Authentication failure\n' : USER + ' is not in the sudoers file.  This incident will be reported.\n'); return 1; } });
  def('apt apt-get pip pip3 npm git curl wget ssh ping brew', { cat: 'other', use: 'git ...', desc: 'Programs that need the internet or install things. There is no network in this practice terminal, so they only say so.', ex: [],
    run(args, io) { io.err(this.name + ': ' + (this.name === 'ping' ? 'connect: Network is unreachable' : 'not available in this practice terminal (there is no network here, and nothing to install)') + '\n'); return 1; } });
  def('ps top kill jobs fg bg', { cat: 'other', use: 'ps', desc: 'Programs about running processes. Only your commands run here, one at a time.', ex: [], run(args, io) { if (this.name === 'ps') { io.out('    PID TTY          TIME CMD\n   4242 pts/0    00:00:00 bash\n   4299 pts/0    00:00:00 ps\n'); return 0; } io.err(this.name + ': there are no other processes in this practice terminal\n'); return 1; } });
  def('man', { cat: 'shell', use: 'man command', desc: 'Show the manual page of a command. help lists them all.', ex: ['man ls', 'man grep'],
    run(args, io) {
      if (!args.length) { io.err('What manual page do you want?\nFor example, try \'man ls\'.\n'); return 1; }
      let exit = 0;
      for (const a of args) {
        if (!has(COMMANDS, a)) { io.err('No manual entry for ' + a + '\n'); exit = 16; continue; }
        const c = COMMANDS[a];
        io.out(a.toUpperCase() + '(1)' + ' '.repeat(Math.max(1, 30 - a.length * 2)) + 'User Commands\n\n', 'hd');
        io.out('NAME\n', 'hd'); io.out('    ' + a + ' - ' + c.desc.split('. ')[0].replace(/\.$/, '').replace(/^./, (ch) => ch.toLowerCase()) + '\n\n');
        io.out('SYNOPSIS\n', 'hd'); io.out('    ' + c.use + '\n\n');
        io.out('DESCRIPTION\n', 'hd'); io.out(wrap(c.desc, 4) + '\n');
        if (c.opts && c.opts.length) { io.out('\n'); io.out('OPTIONS\n', 'hd'); for (const [f, m] of c.opts) io.out('    ' + padR(f, 12) + (f.length > 11 ? '\n' + ' '.repeat(16) : '') + m + '\n'); }
        if (c.ex && c.ex.length) { io.out('\n'); io.out('EXAMPLES\n', 'hd'); for (const e of c.ex) io.out('    ' + e + '\n'); }
        if (c.notes) { io.out('\n'); io.out('NOTES\n', 'hd'); io.out(wrap(c.notes, 4) + '\n'); }
      }
      return exit;
    } });
  const wrap = (text, indent) => { const words = text.split(' '), ls = []; let cur = ''; for (const w of words) { if ((cur + ' ' + w).length > WIDTH - indent - 2 && cur) { ls.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; } if (cur) ls.push(cur); return ls.map((l) => ' '.repeat(indent) + l).join('\n'); };
  const CATS = [['dirs', 'Where am I, and what is here'], ['files', 'Making, copying, moving and removing'], ['text', 'Looking inside files, and text tools'], ['run', 'Writing and running programs'], ['shell', 'The shell itself'], ['other', 'Other']];
  def('help', { cat: 'shell', builtin: true, use: 'help [command]', desc: 'List the commands, with a line about each. help ls (or man ls) says more about one.', ex: ['help', 'help grep'],
    run(args, io) {
      if (args.length) return COMMANDS.man.run(args, io);
      io.out('These commands work in this terminal. Type man NAME (or help NAME) to read about one.\n');
      io.out('Paths: ~ is your home, . this directory, .. the one above. Wildcards: *.txt. Pipes and files: cmd1 | cmd2, cmd > out.txt, cmd < in.txt.\n');
      const seen = new Set();
      for (const [cat, title] of CATS) {
        io.out('\n' + title + '\n', 'hd');
        for (const name of Object.keys(COMMANDS)) { const c = COMMANDS[name]; if (c.cat !== cat || seen.has(c) || !c.ex || !c.ex.length) continue; seen.add(c); const names = Object.keys(COMMANDS).filter((k) => COMMANDS[k] === c).join(', '); io.out('  ' + padR(names, 14) + (names.length > 13 ? '\n' + ' '.repeat(16) : '') + c.desc.split('. ')[0].replace(/\.$/, '') + '\n'); }
      }
      io.out('\nUp and down arrows bring back earlier commands; Tab completes a command or a file name; Ctrl+C stops a program; Ctrl+L clears the screen.\n');
      return 0;
    } });

  return { makeFS, makeShell, parse, tokenize, arith, braceExpand, globToRegExp, COMMANDS, LIMITS, HOME, USER, HOST };
});
