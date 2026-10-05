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
   > >> < 2> 2>&1 | ; && || and !, <<EOF here-documents (<<'EOF' <<-EOF) and <<< here-strings, $'...', if/elif/else/fi, for/in/do/done, for ((;;)),
   while/until, case/esac, (( )), [[ ]] (== != < > =~ -eq -f ... && || ! ( )), break/continue, functions (name() { ...; }, local, return), indexed and
   associative arrays (a=(x y), declare -A m=([k]=v), ${a[i]}, ${m[key]}, "${a[@]}", ${#a[@]}, ${!a[@]}), ${x@Q}, aliases, history expansion at the prompt
   (!! !$ !n !prefix ^old^new), time, $RANDOM (bash's generator), $SECONDS, shopt nullglob/failglob/dotglob, scripts with #! lines, and the commands
   listed in COMMANDS below. */
(function (factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else window.SHELL = factory();
})(function () {
  'use strict';
  const dict = () => Object.create(null);
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const LIMITS = { files: 500, bytes: 2000000, fileBytes: 256000, depth: 32, name: 100, steps: 20000, dirs: 500, brace: 10000, vars: 256000, out: 2000000, history: 500, funcDepth: 500, array: 10000, aliases: 100, awk: 1000000 };
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
  const RESERVED = ['if', 'then', 'elif', 'else', 'fi', 'for', 'in', 'do', 'done', 'while', 'until', 'case', 'esac', '{', '}', '!'];
  const KEYWORDS = RESERVED.concat(['function', 'time', 'select', '[[', ']]']);   // what type calls "a shell keyword"

  // whole: the text is one word, spaces and operators included (an associative array's key, ${m[two words]})
  function tokenize(src, whole) {
    const toks = []; let i = 0, start = 0, n = src.length;
    // here-documents: <<WORD (or <<-WORD) waits for the end of its line; then the lines up to WORD are its text. pending: the ones waiting
    const pending = []; let hdNext = null, cond = false;
    // each token knows its line (for "script.sh: line 3: ..." messages): the line where it starts
    const nls = []; for (let k = src.indexOf('\n'); k >= 0; k = src.indexOf('\n', k + 1)) nls.push(k);
    const lineAt = (pos) => { let lo = 0, hi = nls.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (nls[mid] < pos) lo = mid + 1; else hi = mid; } return lo + 1; };
    toks.push = (t) => { t.line = lineAt(start); t.pos = start; return Array.prototype.push.call(toks, t); };
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
      // $'...': backslash escapes (\n \t \' \x41 ...) worked out, the rest literal; $"..." is "..." (no translations here). Inside "..." both are plain text
      if (c === "'" && !q) { let j = i + 1; while (j < n && src[j] !== "'") j += src[j] === '\\' ? 2 : 1; if (j >= n) synErr("unexpected EOF while looking for matching `''"); parts.push({ v: escapesE(src.slice(i + 1, j)), q: true }); i = j + 1; return; }
      if (c === '"' && !q) return;
      if (c === '(') { i++; if (peek() === '(') { i++; parts.push({ x: 'arith', v: balanced('(', ')', true), q }); } else parts.push({ x: 'sub', v: balanced('(', ')'), q }); return; }
      if (c === '{') {
        i++;
        let j = -1;   // the matching }: a ${...} inside the pattern of another (${f%.${ext}}) has its own
        for (let k = i, depth = 0; k < n; k++) { const ch = src[k]; if (ch === '\\') { k++; continue; } if (ch === '$' && src[k + 1] === '{') { depth++; k++; } else if (ch === '}') { if (!depth) { j = k; break; } depth--; } }
        if (j < 0) synErr('unexpected EOF while looking for matching `}\''); const body = src.slice(i, j); i = j + 1; let m;
        // ${NAME}, ${#NAME} (its length), ${NAME:offset} and ${NAME:offset:length} (either may be negative), ${NAME:-word} ${NAME:=word} ${NAME:+word} (and the same without the colon),
        // ${NAME#pat} ${NAME##pat} ${NAME%pat} ${NAME%%pat}, ${NAME/pat/new} ${NAME//pat/new} ${NAME/#pat/new} ${NAME/%pat/new}, ${NAME^} ${NAME^^} ${NAME,} ${NAME,,}; anything else is refused, as bash does
        if (/^([A-Za-z_][A-Za-z0-9_]*|[0-9]+|[?#@*$!])$/.test(body)) parts.push({ x: 'var', v: body, q });
        // arrays: ${a[i]} (i is arithmetic), ${a[@]} ${a[*]}, ${#a[@]} (how many), ${#a[i]} (one length), ${!a[@]} (the indices), ${a[@]:1:2} (a slice)
        else if ((m = body.match(/^([A-Za-z_][A-Za-z0-9_]*)\[([^\]]+)\]$/))) parts.push({ x: 'elem', v: m[1], idx: m[2], q });
        else if ((m = body.match(/^#([A-Za-z_][A-Za-z0-9_]*)\[([^\]]+)\]$/))) parts.push({ x: 'len', v: m[1], idx: m[2], q });
        else if ((m = body.match(/^!([A-Za-z_][A-Za-z0-9_]*)\[([@*])\]$/))) parts.push({ x: 'keys', v: m[1], idx: m[2], q });
        else if ((m = body.match(/^([A-Za-z_][A-Za-z0-9_]*)\[([@*])\]: ?\(?(-?\d+)\)?(?::\(?(-?\d+)\)?)?$/))) parts.push({ x: 'aslice', v: m[1], idx: m[2], from: +m[3], len: m[4] === undefined ? null : +m[4], q });
        else if ((m = body.match(/^#([A-Za-z_][A-Za-z0-9_]*|[0-9]+|[@*])$/))) parts.push({ x: 'len', v: m[1], q });
        else if ((m = body.match(/^([A-Za-z_][A-Za-z0-9_]*|[0-9]+): ?\(?(-?\d+)\)?(?::\(?(-?\d+)\)?)?$/))) parts.push({ x: 'slice', v: m[1], from: +m[2], len: m[3] === undefined ? null : +m[3], q });   // a negative offset needs the space or the brackets, as in bash
        else if ((m = body.match(/^([A-Za-z_][A-Za-z0-9_]*|[0-9]+)(##?|%%?)([^]*)$/))) parts.push({ x: 'strip', v: m[1], op: m[2], pat: m[3], q });   // ${f%.txt} ${p##*/}: take a pattern off the start or the end
        else if ((m = body.match(/^([A-Za-z_][A-Za-z0-9_]*|[0-9]+)\/(\/|#|%)?([^]*)$/))) { const cut = splitSubst(m[3]); parts.push({ x: 'subst', v: m[1], all: m[2] === '/', anchor: m[2] === '#' || m[2] === '%' ? m[2] : '', pat: cut[0], repl: cut[1], q }); }   // ${s/a/b} ${s//a/b}
        else if ((m = body.match(/^([A-Za-z_][A-Za-z0-9_]*)(\^\^?|,,?)$/))) parts.push({ x: 'case', v: m[1], op: m[2], q });   // ${s^} ${s^^} ${s,} ${s,,}
        else if ((m = body.match(/^([A-Za-z_][A-Za-z0-9_]*|[0-9]+|[@*])(?:\[([^\]]+)\])?@([QEULua])$/))) parts.push({ x: 'xform', v: m[1], idx: m[2], op: m[3], q });   // ${x@Q} ${a[@]@U}: a transformation
        else if ((m = body.match(/^([A-Za-z_][A-Za-z0-9_]*|[0-9]+)(:?)([-=+])([^]*)$/))) parts.push({ x: 'def', v: m[1], colon: m[2] === ':', op: m[3], word: m[4], q });
        else parts.push({ x: 'bad', v: body, q });   // refused when it is expanded, as bash does
        return;
      }
      const m = src.slice(i).match(/^([A-Za-z_][A-Za-z0-9_]*|[0-9]|[?#@*$!])/);
      if (m) { parts.push({ x: 'var', v: m[1], q }); i += m[1].length; return; }
      parts.push({ v: '$', q });
    };
    // [[ x =~ RE ]]: find where RE ends (an unquoted space outside brackets, or a ) that closes a group of the condition), then read it as one word
    const condRegex = () => {
      let j = i, depth = 0;
      for (; j < n; j++) {
        const ch = src[j];
        if (ch === '\\') { j++; continue; }
        if (ch === "'") { const e = src.indexOf("'", j + 1); if (e < 0) return null; j = e; continue; }
        if (ch === '"') { let e = j + 1; while (e < n && src[e] !== '"') e += src[e] === '\\' ? 2 : 1; if (e >= n) return null; j = e; continue; }
        if (ch === '\n' || (depth === 0 && /[ \t\r;&]/.test(ch))) break;
        if (ch === '(') depth++; else if (ch === ')') { if (!depth) break; depth--; }
      }
      if (j === i || src.slice(i, j) === ']]') return null;
      if (depth) { const e = new SyntaxError_("unexpected EOF while looking for matching `)'"); e.more = ['unexpected argument to conditional binary operator']; throw e; }   // bash reads to the end looking for the )
      const text = src.slice(i, j), w = tokenize(text, true)[0]; i = j;
      return { t: 'word', parts: w ? w.parts : [], raw: text, end: j, regex: true };
    };
    // the text of an unquoted here-document: $ ` and \ work as inside "...", but a " is only a character
    const hereParts = (text) => {
      const keep = [src, i, n], parts = []; src = text; i = 0; n = text.length;
      try {
        while (i < n) {
          const ch = src[i];
          if (ch === '\\' && i + 1 < n && '\\$`\n'.includes(src[i + 1])) { if (src[i + 1] !== '\n') parts.push({ v: src[i + 1], q: true }); i += 2; continue; }
          if (ch === '$') { dollar(parts, true); continue; }
          if (ch === '`') { i++; const j = src.indexOf('`', i); if (j < 0) synErr('unexpected EOF while looking for matching ``\''); parts.push({ x: 'sub', v: src.slice(i, j), q: true }); i = j + 1; continue; }
          let j = i + 1; while (j < n && !'\\$`'.includes(src[j])) j++;
          parts.push({ v: src.slice(i, j), q: true }); i = j;
        }
      } finally { [src, i, n] = keep; }
      return parts;
    };
    // at the end of a line: each waiting here-document takes the lines up to its word (with <<-, leading tabs removed first)
    const readBodies = () => {
      for (const hd of pending.splice(0)) {
        let body = '', done = false;
        while (i < n) {
          let e = src.indexOf('\n', i); if (e < 0) e = n;
          let ln = src.slice(i, e); i = Math.min(n, e + 1);
          if (hd.strip) ln = ln.replace(/^\t+/, '');
          if (ln === hd.delim) { done = true; break; }
          body += ln + '\n';
        }
        if (!done) { hd.warn = 'warning: here-document at line ' + hd.line + " delimited by end-of-file (wanted `" + hd.delim + "')"; toks.open = true; }
        hd.text = body; if (!hd.quoted) hd.parts = hereParts(body);
      }
    };
    while (i < n) {
      const c = src[i]; start = i;
      if (!whole) {
      if (c === ' ' || c === '\t' || c === '\r') { i++; continue; }
      if (c === '\\' && src[i + 1] === '\n') { i += 2; continue; }
      if (c === '\n') { toks.push({ t: 'op', v: '\n' }); i++; hdNext = null; if (pending.length) readBodies(); continue; }
      if (c === '#') { while (i < n && src[i] !== '\n') i++; continue; }
      const two = src.substr(i, 2), four = src.substr(i, 4);
      if (src.substr(i, 3) === '<<<') { toks.push({ t: 'op', v: '<<<' }); i += 3; continue; }
      if (two === '<<') { const strip = src[i + 2] === '-', t = { t: 'op', v: strip ? '<<-' : '<<' }; toks.push(t); i += strip ? 3 : 2; hdNext = t; continue; }
      // inside [[ ]], the regular expression after =~ is one word: ( ) | are part of it, and spaces too inside brackets
      if (cond && toks.length && toks[toks.length - 1].raw === '=~') { const w = condRegex(); if (w) { toks.push(w); continue; } }
      if (four === '2>&1') { toks.push({ t: 'op', v: '2>&1' }); i += 4; continue; }
      if (src.substr(i, 3) === '2>>') { toks.push({ t: 'op', v: '2>>' }); i += 3; continue; }
      // ;; ;& ;;& end a case item (the parser refuses them anywhere else, with bash's words)
      if (src.substr(i, 3) === ';;&') { toks.push({ t: 'op', v: ';;&' }); i += 3; continue; }
      if (['||', '&&', '>>', '2>', '&>', ';;', ';&'].includes(two)) { toks.push({ t: 'op', v: two }); i += 2; continue; }
      // (( arithmetic )) as a command: only when the brackets balance as one expression, otherwise ((a); b) is two subshells
      if (two === '((' && !cond) { let depth = 0, end = -1; for (let k = i + 2; k < n; k++) { const ch = src[k]; if (ch === '(') depth++; else if (ch === ')') { if (depth === 0) { if (src[k + 1] === ')') end = k; break; } depth--; } } if (end >= 0) { toks.push({ t: 'arith', v: src.slice(i + 2, end), raw: src.slice(i, end + 2) }); i = end + 2; continue; } }
      if ('|;<>()&'.includes(c)) { if (c === '&') synErr('background jobs (&) are not available here'); toks.push({ t: 'op', v: c }); i++; continue; }
      }
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
        if (!whole && ' \t\r\n|;<>()&'.includes(ch)) break;
        if (ch === '#' && !parts.length && !whole) break;
        let j = i + 1; while (j < n && !(whole ? '\'"\\$`' : ' \t\r\n|;<>()&\'"\\$`').includes(src[j])) j++;
        parts.push({ v: src.slice(i, j), q: false }); i = j;
      }
      if (q) synErr('unexpected EOF while looking for matching `' + q + "'");
      const w = { t: 'word', parts, raw: src.slice(start, i), end: i };
      toks.push(w);
      if (hdNext) {   // the word after << is the delimiter; quoting any of it means the text is taken as it is
        const quoted = /['"\\]/.test(w.raw), delim = parts.every((x) => !x.x) ? parts.map((x) => x.v).join('') : w.raw.replace(/['"\\]/g, '');
        pending.push(hdNext.hd = { strip: hdNext.v === '<<-', quoted, delim, line: hdNext.line }); hdNext = null;
      }
      if (w.raw === '[[') cond = true; else if (w.raw === ']]') cond = false;
    }
    if (pending.length) readBodies();   // a here-document on the last line, with no lines after it
    return toks;
    } catch (e) { if (e instanceof SyntaxError_ && e.line === undefined) e.line = lineAt(start); throw e; }
  }
  const wordText = (w) => w.parts.map((p) => p.x ? '' : p.v).join('');
  const plainText = (w) => w.parts.every((p) => !p.x && !p.q) ? wordText(w) : null;   // the word if it is a bare literal, else null

  /* ---------------- the grammar ----------------
     list := andor ((';' | '\n')+ andor)*      andor := pipeline (('&&' | '||') pipeline)*      pipeline := ['time' ['-p']] ['!'] command ('|' command)*
     command := simple | if | for | for (( )) | while | until | case | (( arith )) | '{' list '}' | '(' list ')' | name '()' command | 'function' name command
                each followed by redirections
     parser(src, { aliases }).next() gives the commands up to the next newline, so that a line runs before the next one is read: as in bash,
     an alias defined on one line works from the next line on. parse(src) reads everything at once. */
  function parse(src, opts) { const ps = parser(src, opts), items = []; for (let c; (c = ps.next());) items.push(...c.items); return { k: 'list', items }; }
  const DECL = ['local', 'declare', 'typeset', 'export', 'readonly'];   // builtins whose NAME=value arguments are assignments (no splitting, arrays allowed)
  function parser(src, opts) {
    const toks = tokenize(src); let p = 0, spliced = 0;
    const aliases = opts && opts.aliases;
    const peek = () => toks[p];
    const isOp = (v) => { const t = toks[p]; return !!t && t.t === 'op' && t.v === v; };
    const isWord = (v) => { const t = toks[p]; return !!t && t.t === 'word' && plainText(t) === v; };
    const expectWord = (v) => { if (!isWord(v)) synErr("syntax error near unexpected token `" + tokDesc(peek()) + "' (expected " + v + ')'); p++; };
    const skipNl = () => { while (isOp('\n') || isOp(';')) p++; };
    const tokDesc = (t) => !t ? 'newline' : t.t === 'op' ? (t.v === '\n' ? 'newline' : t.v) : t.t === 'arith' ? t.raw : wordText(t);
    const caseEnd = () => isOp(';;') || isOp(';&') || isOp(';;&');
    const REDIR = ['>', '>>', '<', '2>', '2>>', '&>', '2>&1', '<<', '<<-', '<<<'];
    // a here-document's warning (no line with its word) is given as the command is read, before anything runs, as bash does
    const redirs = (list) => { while (peek() && peek().t === 'op' && REDIR.includes(peek().v)) { const ot = toks[p++], op = ot.v; if (op === '2>&1') { list.push({ op }); continue; } const t = toks[p++]; if (!t || t.t !== 'word') synErr("syntax error near unexpected token `" + tokDesc(t) + "'"); list.push({ op, target: t, hd: ot.hd }); if (ot.hd && ot.hd.warn && !ot.hd.told && opts && opts.warn) { ot.hd.told = true; opts.warn(ot.hd.warn); } } };
    const listUntil = (stops) => {   // a list of commands ending before one of the stop words, a ) or a ;; (not consumed)
      const items = []; skipNl();
      const stop = () => stops.some(isWord) || isOp(')') || caseEnd();
      while (peek() && !stop()) {
        items.push(andor());
        if (isOp(';') || isOp('\n')) skipNl(); else if (peek() && !stop()) synErr("syntax error near unexpected token `" + tokDesc(peek()) + "'");
      }
      return { k: 'list', items };
    };
    // an alias: the first word of a command, if it is plain and unquoted, is replaced by the alias's text, which is read as tokens (so it may
    // hold ; and |). A name is not expanded again inside its own text; a text ending in a space makes the next word a candidate too.
    const expandAlias = () => {
      const table = typeof aliases === 'function' ? aliases() : aliases;   // a function: looked up as each line is read
      if (!table) return;
      for (;;) {
        const t = toks[p]; if (!t || t.t !== 'word') return;
        const txt = plainText(t);
        if (txt === null || !has(table, txt) || (t.seen && t.seen.includes(txt))) return;
        const val = table[txt], seen = (t.seen || []).concat(txt), sub = tokenize(val);
        for (const s of sub) { s.line = t.line; s.seen = seen; delete s.end; }
        if ((spliced += sub.length + 1) > 10000) synErr(txt + ': alias expansion is too long');   // aliases that name each other several times over
        toks.splice(p, 1, ...sub);
        if (/[ \t]$/.test(val) && toks[p + sub.length] && toks[p + sub.length].t === 'word') toks[p + sub.length].aliasNext = true;
      }
    };
    // NAME=value, NAME+=value, NAME[index]=value (the index may hold $i): the part before the = is plain, unquoted text
    const assignment = (w) => {
      const p0 = w.parts[0]; if (!p0 || p0.x || p0.q) return null;
      let m = p0.v.match(/^([A-Za-z_][A-Za-z0-9_]*)(\+?)=/);
      if (m) { const rest = { parts: w.parts.slice() }; rest.parts[0] = { v: p0.v.slice(m[0].length), q: false }; return { name: m[1], append: !!m[2], idx: null, rest }; }
      m = p0.v.match(/^([A-Za-z_][A-Za-z0-9_]*)\[/); if (!m) return null;
      const ps = [{ v: p0.v.slice(m[0].length), q: false }].concat(w.parts.slice(1)), idx = [];
      for (let k = 0; k < ps.length; k++) {
        const pt = ps[k], e = !pt.x && !pt.q ? pt.v.match(/\](\+?)=/) : null;
        if (e) { if (e.index) idx.push({ v: pt.v.slice(0, e.index), q: false }); return { name: m[1], append: !!e[1], idx: { parts: idx }, rawIdx: rawIdx(w.raw || '', m[0].length), rest: { parts: [{ v: pt.v.slice(e.index + e[0].length), q: false }].concat(ps.slice(k + 1)) } }; }
        idx.push(pt);
      }
      return null;
    };
    // the subscript as typed (for messages): from just after NAME[ to the ] before = or +=, quotes skipped over
    const rawIdx = (raw, from) => { for (let k = from, q = null; k < raw.length; k++) { const c = raw[k]; if (q) { if (c === q) q = null; else if (c === '\\' && q === '"') k++; continue; } if (c === '\\') { k++; continue; } if (c === "'" || c === '"') { q = c; continue; } if (c === ']' && (raw[k + 1] === '=' || raw.startsWith('+=', k + 1))) return raw.slice(from, k); } return raw.slice(from); };
    const arrayList = () => {   // after NAME=( : words, across lines, up to ); [key]=value words get .sub (the key and the value)
      p++; const list = [];
      for (;;) {
        while (isOp('\n')) p++; if (isOp(')')) { p++; return list; }
        const t = toks[p]; if (!t || t.t !== 'word') synErr("syntax error near unexpected token `" + tokDesc(t) + "'");
        const p0 = t.parts[0];
        if (p0 && !p0.x && !p0.q && p0.v[0] === '[') { const a = assignment({ parts: [{ v: 'X' + p0.v, q: false }].concat(t.parts.slice(1)), raw: 'X' + t.raw }); if (a && a.idx) t.sub = a; }
        list.push(t); p++;
      }
    };
    /* [[ expression ]]: || && ! ( ), unary tests (-f x), binary ones (a == b, a =~ re, a -lt b, a < b) and a lone word (-n). Its errors are
       bash's: a message saying what was wrong, then "syntax error near `X'", where X is the word at fault, or the operator after it when one
       follows (bash's reader has looked one token ahead by then); an operator shows only its last character. */
    const UNOPS = 'abcdefghknoprstuvwxzGLNOSR', BINOPS = ['=', '==', '!=', '=~', '-eq', '-ne', '-lt', '-le', '-gt', '-ge', '-nt', '-ot', '-ef'];
    const condExpr = () => {
      const isW = (t) => !!t && t.t === 'word' && t.raw !== ']]', isEnd = (t) => !!t && t.t === 'word' && t.raw === ']]', isNl = (t) => !t || (t.t === 'op' && t.v === '\n');
      const etext = (t) => isNl(t) ? 'newline' : t.t === 'op' ? t.v : isEnd(t) ? ']]' : t.t === 'arith' ? t.raw : null;   // what bash names in its message: tokens, not words
      const fail = (lead, at, silent) => {
        const E = toks[at];
        if (!E && at >= toks.length) { const e = new SyntaxError_("unexpected EOF while looking for `]]'"); e.more = ['syntax error: unexpected end of file']; throw e; }
        let near = E;
        if (isNl(E)) near = toks[at - 1];
        else if (E.t === 'word') { const N = toks[at + 1]; if (N && N.t === 'op' && N.v !== '\n') near = N; }
        const txt = near.t === 'word' || near.t === 'arith' ? near.raw : near.v.slice(-1);
        const e = new SyntaxError_(lead.length ? lead[0] : 'syntax error near `' + txt + "'"); e.more = lead.length ? lead.slice(1).concat('syntax error near `' + txt + "'") : []; e.near = true; e.line = near.line; e.silent = silent; throw e;
      };
      const skip = () => { while (isOp('\n')) p++; };
      const or = () => { let l = and(); while (isOp('||')) { p++; skip(); l = { k: 'or', l, r: and() }; } return l; };
      const and = () => { let l = term(); while (isOp('&&')) { p++; skip(); l = { k: 'and', l, r: term() }; } return l; };
      const term = () => {
        const t = toks[p];
        if (!t) fail([], p);
        if (isEnd(t)) fail([], p, true);   // nothing where a test should be: [[ ]], [[ a && ]], [[ ! ]]
        if (isOp('(')) {
          p++; skip(); let e;
          try { e = or(); } catch (x) { if (x.silent) { x.more.unshift(x.message); x.message = "expected `)'"; x.silent = false; } throw x; }
          if (!isOp(')')) { const et = toks[p] ? etext(toks[p]) : null; fail([et ? 'unexpected token `' + et + "', expected `)'" : "expected `)'"], p); }
          p++; skip(); return { k: 'group', e };
        }
        if (isWord('!')) { p++; return { k: 'not', e: term() }; }
        if (t.t !== 'word') fail(['unexpected token `' + etext(t) + "' in conditional command"], p);
        const w = plainText(t);
        if (w && w.length === 2 && w[0] === '-' && UNOPS.includes(w[1])) {
          p++; const a = toks[p];
          if (!isW(a)) fail([a && etext(a) || !a ? 'unexpected argument `' + (a ? etext(a) : 'newline') + "' to conditional unary operator" : 'unexpected argument to conditional unary operator'], a ? p : p - 1);
          p++; skip(); return { k: 'unary', op: w, a };
        }
        p++; const o = toks[p];
        let op = null;
        if (o && o.t === 'word' && BINOPS.includes(plainText(o))) op = plainText(o);
        else if (o && o.t === 'op' && (o.v === '<' || o.v === '>')) op = o.v;
        else if (isEnd(o) || (o && o.t === 'op' && ['&&', '||', ')'].includes(o.v))) return { k: 'unary', op: '-n', a: t };   // a lone word: is it non-empty?
        else fail([o && o.t !== 'word' || !o ? 'unexpected token `' + (o ? etext(o) : 'newline') + "', conditional binary operator expected" : 'conditional binary operator expected'], o ? p : p - 1);
        p++; const b = toks[p];
        if (!isW(b)) fail(['unexpected argument `' + (b ? etext(b) : 'newline') + "' to conditional binary operator"], b ? p : p - 1);
        p++; skip(); return { k: 'binary', op, a: t, b };
      };
      const e = or();
      if (!isEnd(toks[p])) { if (!toks[p]) fail([], p); const et = toks[p].t === 'word' ? null : etext(toks[p]); fail(['syntax error in conditional expression' + (et ? ': unexpected token `' + et + "'" : '')], p); }
      p++; return e;
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
        p++;
        if (peek() && peek().t === 'arith') {   // for ((i = 0; i < 3; i++)): three arithmetic expressions
          const t = toks[p++], parts = t.v.split(';'); if (parts.length !== 3) synErr("syntax error: arithmetic expression required in `" + t.raw + "'");
          if (isOp(';')) p++; skipNl(); expectWord('do'); const body = listUntil(['done']); expectWord('done');
          return { k: 'cfor', init: parts[0], cond: parts[1], step: parts[2], body, raw: t.raw };
        }
        const t = toks[p++]; if (!t || t.t !== 'word' || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(plainText(t) || '') || RESERVED.includes(plainText(t))) synErr("syntax error near unexpected token `" + tokDesc(t) + "' (for needs a variable name)");
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
      if (isWord('case')) {   // case WORD in pat|pat) list ;; ... esac   (;& runs the next list too, ;;& goes on testing)
        p++; const word = toks[p++]; if (!word || word.t !== 'word') synErr("syntax error near unexpected token `" + tokDesc(word) + "'");
        while (isOp('\n')) p++; expectWord('in');
        const items = [];
        for (;;) {
          while (isOp('\n')) p++;
          if (isWord('esac')) { p++; break; }
          if (!peek()) synErr('syntax error: unexpected end of file');
          if (isOp('(')) p++;
          const pats = [];
          for (;;) { const t = toks[p]; if (!t || t.t !== 'word') synErr("syntax error near unexpected token `" + tokDesc(t) + "'"); pats.push(t); p++; if (isOp('|')) { p++; continue; } break; }
          if (!isOp(')')) synErr("syntax error near unexpected token `" + tokDesc(peek()) + "'");
          p++;
          const body = listUntil(['esac']); let end = ';;';
          if (caseEnd()) end = toks[p++].v; else if (!peek()) synErr('syntax error: unexpected end of file'); else if (!isWord('esac')) synErr("syntax error near unexpected token `" + tokDesc(peek()) + "'");
          items.push({ pats, body, end });
        }
        return { k: 'case', word, items };
      }
      if (peek() && peek().t === 'arith') { const t = toks[p++]; return { k: 'arith', v: t.v, raw: t.raw }; }
      if (isWord('[[')) { const p0 = ++p, e = condExpr(); return { k: 'cond', e, raw: toks.slice(p0, p - 1).filter((t) => t.v !== '\n').map((t) => t.t === 'op' ? t.v : t.raw).join(' ') }; }
      if (isWord('{')) { p++; const body = listUntil(['}']); expectWord('}'); return { k: 'group', body }; }
      if (isOp('(')) { p++; const body = listUntil([]); if (!isOp(')')) synErr("syntax error: unexpected end of file (expected `)')"); p++; return { k: 'group', body, sub: true }; }
      return null;
    };
    const command = () => {
      expandAlias();
      const line = peek() ? peek().line : 0;
      // a function: name () body, or function name [()] body; the body is any compound command, and is kept to run later
      const t0 = peek(), named = t0 && t0.t === 'word' && plainText(t0) !== null && !plainText(t0).includes('=') && !RESERVED.includes(plainText(t0)) && toks[p + 1] && toks[p + 1].t === 'op' && toks[p + 1].v === '(' && toks[p + 2] && toks[p + 2].t === 'op' && toks[p + 2].v === ')';
      if (named || isWord('function')) {
        if (!named) p++;
        const t = toks[p++], name = t && t.t === 'word' ? plainText(t) : null;
        if (name === null || !/^[^\s'"\\$`=|;&<>()]+$/.test(name) || RESERVED.includes(name)) synErr("syntax error near unexpected token `" + tokDesc(t) + "'");
        if (isOp('(')) { p++; if (!isOp(')')) synErr("syntax error near unexpected token `" + tokDesc(peek()) + "'"); p++; }
        while (isOp('\n')) p++;
        const body = compound(); if (!body) synErr("syntax error near unexpected token `" + tokDesc(peek()) + "'");
        body.redirs = []; redirs(body.redirs);
        return { k: 'func', name, body, redirs: [], line };
      }
      const c = compound();
      if (c) { c.redirs = []; redirs(c.redirs); return c; }
      const node = { k: 'simple', assigns: [], words: [], redirs: [], line, raw: [] };
      let first = true;
      while (peek() && (peek().t === 'word' || (peek().t === 'op' && REDIR.includes(peek().v)))) {
        if (peek().t === 'op') { redirs(node.redirs); continue; }
        const w = toks[p];
        if (w.aliasNext && node.words.length) { w.aliasNext = false; expandAlias(); continue; }   // the word after an alias whose text ends in a space
        const txt = plainText(w);
        if (first && txt !== null && RESERVED.includes(txt) && txt !== 'in') synErr("syntax error near unexpected token `" + txt + "'");
        const asg = !node.words.length || DECL.includes(plainText(node.words[0]) || '') ? assignment(w) : null;   // also local x=$y, declare -a a=(1 2)
        if (asg) {
          p++; first = false;
          if (!asg.idx && asg.rest.parts.length === 1 && asg.rest.parts[0].v === '' && isOp('(') && w.end !== undefined && peek().pos === w.end) { asg.list = arrayList(); node.raw.push(w.raw + '(' + asg.list.map((x) => x.raw).join(' ') + ')'); }
          else node.raw.push(w.raw);
          if (node.words.length) node.words.push({ parts: w.parts, decl: asg }); else node.assigns.push([asg.name, asg.rest, asg]);
          continue;
        }
        node.words.push(w); node.raw.push(w.raw); p++; first = false;
      }
      if (!node.words.length && !node.assigns.length && !node.redirs.length) synErr("syntax error near unexpected token `" + tokDesc(peek()) + "'");
      return node;
    };
    const pipeline = () => {
      let time = null; if (isWord('time')) { p++; time = 'bash'; if (isWord('-p')) { p++; time = 'posix'; } }   // time is a keyword: it times the whole pipeline
      let neg = false; if (isWord('!')) { neg = true; p++; }
      if (time && (!peek() || (peek().t === 'op' && ['\n', ';', '&&', '||', ')'].includes(peek().v)))) return { k: 'pipe', cmds: [], neg, time };
      const cmds = [command()];
      while (isOp('|')) { p++; skipNl(); if (!peek()) synErr('syntax error: unexpected end of file'); cmds.push(command()); }
      return { k: 'pipe', cmds, neg, time };
    };
    const andor = () => {
      const line = peek() ? peek().line : 0, first = pipeline(); const rest = [];
      while (isOp('&&') || isOp('||')) { const op = toks[p++].v; skipNl(); if (!peek()) synErr('syntax error: unexpected end of file'); rest.push({ op, p: pipeline() }); }
      return { k: 'andor', first, rest, line };
    };
    return {
      next() {
        try {
          while (isOp('\n') || isOp(';')) p++;
          if (p >= toks.length) return null;
          const items = [];
          while (p < toks.length && !isOp('\n')) {
            items.push(andor());
            if (isOp(';')) { while (isOp(';')) p++; continue; }
            if (p < toks.length && !isOp('\n')) synErr("syntax error near unexpected token `" + tokDesc(peek()) + "'");
          }
          return { k: 'list', items };
        } catch (e) { if (e instanceof SyntaxError_ && e.line === undefined) e.line = (toks[p] || toks[toks.length - 1] || { line: 1 }).line; throw e; }
      }
    };
  }

  /* ---------------- printing a function, the way bash's type and declare -f do ----------------
     bash prints its own layout, not the text as typed: one command a line, four spaces a level, a ; after each command inside if/for/while,
     elif as else + if. Words are printed as they were typed. */
  function printFunc(name, body) {
    const IND = '    ';
    const words = (n) => n.raw.concat(n.redirs.map(redir)).join(' ') + bodies(n);
    const redir = (r) => r.op === '2>&1' ? '2>&1' : r.op + (r.hd ? '' : ' ') + r.target.raw;
    const bodies = (n) => n.redirs.filter((r) => r.hd).map((r) => '\n' + r.hd.text + r.hd.delim).join('') + (n.redirs.some((r) => r.hd) ? '\n' : '');   // a here-document's lines follow its command
    const redirs = (n) => n.redirs && n.redirs.length ? ' ' + n.redirs.map(redir).join(' ') + bodies(n) : '';
    const inline = (list, ind) => list.items.map((it) => andor(it, ind)).join('; ');
    const block = (list, ind, semi) => list.items.map((it) => ind + andor(it, ind)).join(';\n') + (semi && list.items.length ? ';' : '');
    const andor = (n, ind) => pipe(n.first, ind) + n.rest.map((r) => ' ' + r.op + ' ' + pipe(r.p, ind)).join('');
    const pipe = (n, ind) => (n.time ? 'time ' + (n.time === 'posix' ? '-p ' : '') : '') + (n.neg ? '! ' : '') + n.cmds.map((c) => cmd(c, ind)).join(' | ');
    const ifNode = (clauses, els, ind) => {
      const [c, ...more] = clauses; let s = 'if ' + inline(c.cond, ind) + '; then\n' + block(c.body, ind + IND, true) + '\n';
      if (more.length) s += ind + 'else\n' + ind + IND + ifNode(more, els, ind + IND) + ';\n';
      else if (els) s += ind + 'else\n' + block(els, ind + IND, true) + '\n';
      return s + ind + 'fi';
    };
    const cmd = (n, ind) => {
      if (n.k === 'simple') return words(n);
      if (n.k === 'if') return ifNode(n.clauses, n.els, ind) + redirs(n);
      if (n.k === 'for') return 'for ' + n.name + ' in ' + (n.words ? n.words.map((w) => w.raw).join(' ') : '"$@"') + ';\n' + ind + 'do\n' + block(n.body, ind + IND, true) + '\n' + ind + 'done' + redirs(n);
      if (n.k === 'cfor') return 'for ((' + [n.init, n.cond, n.step].map((x) => x.trim()).join('; ') + '))\n' + ind + 'do\n' + block(n.body, ind + IND, true) + '\n' + ind + 'done' + redirs(n);
      if (n.k === 'while') return (n.until ? 'until ' : 'while ') + inline(n.cond, ind) + '; do\n' + block(n.body, ind + IND, true) + '\n' + ind + 'done' + redirs(n);
      if (n.k === 'case') return 'case ' + n.word.raw + ' in \n' + n.items.map((it) => ind + IND + it.pats.map((t) => t.raw).join(' | ') + ')\n' + block(it.body, ind + IND + IND, false) + '\n' + ind + IND + it.end).join('\n') + '\n' + ind + 'esac' + redirs(n);
      if (n.k === 'arith') return '(( ' + n.v.trim() + ' ))' + redirs(n);
      if (n.k === 'cond') return '[[ ' + n.raw + ' ]]' + redirs(n);
      if (n.k === 'group' && n.sub) return '( ' + n.body.items.map((it) => andor(it, ind)).join(';\n' + ind) + ' )' + redirs(n);
      if (n.k === 'group') return '{ \n' + block(n.body, ind + IND, false) + '\n' + ind + '}' + redirs(n);
      if (n.k === 'func') return func(n.name, n.body, ind);
      return '';
    };
    const func = (name, b, ind) => name + ' () \n' + ind + '{ \n' + (b.k === 'group' && !b.sub ? block(b.body, ind + IND, false) : ind + IND + cmd(b, ind + IND)) + '\n' + ind + '}' + (b.k === 'group' && !b.sub ? redirs(b) : '');
    return func(name, body, '');
  }

  /* ---------------- $(( arithmetic )) ---------------- */
  // bash's integer arithmetic: numbers in base 10, 0x hex and 0 octal; variables (their values are expressions too); = += -= *= /= %=,
  // x++ x-- ++x --x; unary - + ! bind tighter than **. Errors use bash's words: "EXPR: MESSAGE (error token is "REST")".
  function arith(src, vars, setVar, depth, assocP) {   // assocP(name): an associative array, whose [key] is text, not arithmetic
    depth = depth || 0;
    const shown = src.replace(/^\s+/, '');
    const fail = (msg, at, tok) => { const e = new SyntaxError_((tok ? shown.replace(/\s+$/, '') : shown) + ': ' + msg + ' (error token is "' + (tok || src.slice(at)) + '")'); e.exit = 1; throw e; };
    // tokens, each with where it starts in src
    const toks = [], re = /(0[xX][0-9A-Fa-f]*|\d[A-Za-z0-9_]*)|([A-Za-z_][A-Za-z0-9_]*)|(\*\*|\+\+|--|<=|>=|==|!=|&&|\|\||[-+*\/%]=|[-+*\/%()<>!=?:\[\]])/y;
    for (let pos = 0; ;) {
      while (pos < src.length && /\s/.test(src[pos])) pos++;
      if (pos >= src.length) break;
      re.lastIndex = pos; const m = re.exec(src);
      if (!m) fail('syntax error: invalid arithmetic operator', pos);
      toks.push({ v: m[0], pos, k: m[1] ? 'num' : m[2] ? 'name' : 'op' }); pos = re.lastIndex;
      if (m[2] && assocP && src[pos] === '[' && assocP(m[2])) { let d = 0, e = pos; for (; e < src.length; e++) { if (src[e] === '[') d++; else if (src[e] === ']' && --d === 0) break; } if (e < src.length) { toks.push({ v: '[', pos, k: 'op' }, { v: src.slice(pos + 1, e), pos: pos + 1, k: 'key' }, { v: ']', pos: e, k: 'op' }); pos = e + 1; } }
    }
    // ++ and -- belong to a variable next to them; otherwise they are two signs (1--2 is 1 - -2)
    for (let k = 0; k < toks.length; k++) {
      const t = toks[k];
      if ((t.v === '++' || t.v === '--') && !(toks[k - 1] && (toks[k - 1].k === 'name' || toks[k - 1].v === ']')) &&!(toks[k + 1] && toks[k + 1].k === 'name')) toks.splice(k, 1, { v: t.v[0], pos: t.pos, k: 'op' }, { v: t.v[0], pos: t.pos + 1, k: 'op' });
    }
    if (!toks.length) return 0;
    let i = 0; const peek = () => toks[i] && toks[i].v, at = () => (toks[i] || toks[toks.length - 1]).pos;
    const number = (text, pos) => {
      if (/^0[xX]/.test(text)) { if (!/^0[xX][0-9A-Fa-f]*$/.test(text)) fail('value too great for base', pos, text); return text.length > 2 ? parseInt(text.slice(2), 16) : 0; }
      if (/^0\d/.test(text)) { if (!/^0[0-7]+$/.test(text)) fail('value too great for base', pos, text); return parseInt(text, 8); }
      if (!/^\d+$/.test(text)) fail('value too great for base', pos, text);
      return parseInt(text, 10);
    };
    const value = (name, ix) => {   // a variable's value is itself an expression (an empty or unset one is 0); ix: an array element
      const v = String(vars(name, ix) || '').trim();
      if (v === '') return 0;
      if (depth > 10) { const e = new SyntaxError_(name + ': expression recursion level exceeded'); e.exit = 1; throw e; }
      return arith(v, vars, setVar, depth + 1, assocP);
    };
    const assign = (name, v, ix) => { if (setVar) setVar(name, String(v), ix); return v; };
    const index = () => { if (peek() !== '[') return undefined; i++; if (toks[i].k === 'key') { i += 2; return toks[i - 2].v; } const v = expr(); if (peek() !== ']') fail("missing `]'", at()); i++; return v; };   // a[i+1]
    const prim = () => {
      const t = toks[i];
      if (!t) fail('syntax error: operand expected', at());
      if (t.v === '(') { i++; const v = expr(); if (peek() !== ')') fail("missing `)'", at()); i++; return v; }
      if (t.k === 'num') { i++; return number(t.v, t.pos); }
      if (t.k === 'name') { i++; const ix = index(); if (peek() === '++' || peek() === '--') { const op = toks[i++].v, old = value(t.v, ix); assign(t.v, op === '++' ? old + 1 : old - 1, ix); return old; } return value(t.v, ix); }
      fail('syntax error: operand expected', t.pos);
    };
    const unary = () => {
      const t = peek();
      if (t === '-') { i++; return -unary(); } if (t === '+') { i++; return unary(); } if (t === '!') { i++; return unary() ? 0 : 1; }
      if ((t === '++' || t === '--') && toks[i + 1] && toks[i + 1].k === 'name') { i++; const name = toks[i++].v, ix = index(); return assign(name, value(name, ix) + (t === '++' ? 1 : -1), ix); }
      return prim();
    };

    const pow = () => { const b = unary(); if (peek() === '**') { i++; const p0 = at(), e = pow(); if (e < 0) fail('exponent less than 0', p0); return Math.pow(b, e); } return b; };
    const mul = () => { let a = pow(); while (['*', '/', '%'].includes(peek())) { const op = toks[i++].v, p0 = at(), b = pow(); if (op === '*') a = a * b; else { if (b === 0) fail('division by 0', p0); a = op === '/' ? Math.trunc(a / b) : a % b; } } return a; };
    const add = () => { let a = mul(); while (peek() === '+' || peek() === '-') { const op = toks[i++].v; const b = mul(); a = op === '+' ? a + b : a - b; } return a; };
    const cmp = () => { let a = add(); while (['<', '>', '<=', '>='].includes(peek())) { const op = toks[i++].v; const b = add(); a = (op === '<' ? a < b : op === '>' ? a > b : op === '<=' ? a <= b : a >= b) ? 1 : 0; } return a; };
    const eq = () => { let a = cmp(); while (peek() === '==' || peek() === '!=') { const op = toks[i++].v; const b = cmp(); a = (op === '==' ? a === b : a !== b) ? 1 : 0; } return a; };
    const and = () => { let a = eq(); while (peek() === '&&') { i++; const b = eq(); a = a && b ? 1 : 0; } return a; };
    const or = () => { let a = and(); while (peek() === '||') { i++; const b = and(); a = a || b ? 1 : 0; } return a; };
    const cond = () => { const c = or(); if (peek() !== '?') return c; i++; const a = expr(); if (peek() !== ':') fail("`:' expected for conditional expression", at()); i++; const b = expr(); return c ? a : b; };
    const expr = () => {   // NAME = value, NAME[i] += value, ...: the lowest precedence, right to left
      const t = toks[i];
      // look past a [...] index for the operator first, so that the index is worked out (and a[i++] counted) only once
      let j = i + 1; if (t && t.k === 'name' && toks[j] && toks[j].v === '[') { for (let d = 0; j < toks.length; j++) { if (toks[j].v === '[') d++; else if (toks[j].v === ']' && --d === 0) break; } j++; }
      const op = toks[j] && toks[j].v;
      if (t && t.k === 'name' && ['=', '+=', '-=', '*=', '/=', '%='].includes(op)) {
        i++; const ix = index(); i++; const p0 = at(), b = expr(), old = op === '=' ? 0 : value(t.v, ix);
        if ((op === '/=' || op === '%=') && b === 0) fail('division by 0', p0);
        return assign(t.v, op === '=' ? b : op === '+=' ? old + b : op === '-=' ? old - b : op === '*=' ? old * b : op === '/=' ? Math.trunc(old / b) : old % b, ix);
      }
      return cond();
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
  function globExpand(fs, pat, dotglob) {   // dotglob: * matches names starting with a dot too
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
        for (const name of fs.list(dir)) { if (name.startsWith('.') && !comp.startsWith('.') && !dotglob) continue; if (!re.test(name)) continue; const cand = join(b, name); if (k < comps.length - 1 && !fs.isDir(fs.resolve(cand))) continue; next.push(cand); }
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

  /* ---------------- history expansion (lines typed at the prompt only) ----------------
     !! the last command, !n command n, !-n the n-th last, !prefix the last one starting with prefix, !?text? the last one holding text; each may
     be followed by a word of it: !$ (the last), !^ (the first argument), !* (all the arguments), :n. ^old^new: the last command with old
     replaced. As in bash, nothing happens inside '...', or when the ! is followed by a space, = or (, or in [!...], ${!...} and $!. */
  function histExpand(line, hist) {
    const words = (s) => s.match(/(?:'[^']*'|"(?:\\.|[^"\\])*"|\\.|[^\s|;&<>()'"\\])+|[|;&<>()]+/g) || [];
    if (line[0] === '^') {
      const m = line.match(/^\^([^^]*)\^([^^\n]*)\^?([^]*)$/), last = hist[hist.length - 1];
      if (!m || !m[1] || last === undefined || !last.includes(m[1])) return { error: ':s' + line.split('\n')[0] + ': substitution failed' };
      return { line: last.replace(m[1], () => m[2]) + m[3], changed: true };
    }
    let out = '', changed = false, sq = false, dq = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i], nx = line[i + 1];
      if (c === "'" && !dq) { sq = !sq; out += c; continue; }
      if (sq) { out += c; continue; }
      if (c === '\\') { out += c + (i + 1 < line.length ? line[++i] : ''); continue; }
      if (c === '"') { dq = !dq; out += c; continue; }
      if (c !== '!' || nx === undefined || /[\s=(]/.test(nx) || (dq && nx === '"') || (line[i - 1] === '[' && line.indexOf(']', i + 1) > 0) || (line[i - 1] === '{' && line[i - 2] === '$') || line[i - 1] === '$') { out += c; continue; }
      let ev = -1, j = i + 1;
      if (nx === '!') { ev = hist.length - 1; j = i + 2; }
      else if ('$^*:'.includes(nx)) ev = hist.length - 1;
      else if (/\d/.test(nx) || (nx === '-' && /\d/.test(line[i + 2] || ''))) { const m = line.slice(i + 1).match(/^-?\d+/), n = +m[0]; ev = n < 0 ? hist.length + n : n - 1; j = i + 1 + m[0].length; }
      else if (nx === '?') { const m = line.slice(i + 2).match(/^([^?\n]*)\??/); j = i + 2 + m[0].length; for (let k = hist.length - 1; k >= 0 && m[1]; k--) if (hist[k].includes(m[1])) { ev = k; break; } }
      else { const m = line.slice(i + 1).match(/^[^\s:;&|<>()"'`]+/); j = i + 1 + m[0].length; for (let k = hist.length - 1; k >= 0; k--) if (hist[k].startsWith(m[0])) { ev = k; break; } }
      if (ev < 0 || ev >= hist.length) return { error: line.slice(i, j) + ': event not found' };
      let text = hist[ev], d = null;
      const colon = line[j] === ':' && /[\d$^*]/.test(line[j + 1] || '');
      if (colon) j++;
      if (line[j] !== undefined && '$^*'.includes(line[j])) d = line[j++];
      else if (colon) { const m = line.slice(j).match(/^\d+/); d = +m[0]; j += m[0].length; }
      if (line[j] === ':' && /[a-z&]/.test(line[j + 1] || '')) return { error: line.slice(j).split(/\s/)[0] + ': history modifiers (:s, :h, ...) are not available in this practice shell' };
      if (d !== null) { const ws = words(text), pick = d === '$' ? ws.slice(-1) : d === '^' ? ws.slice(1, 2) : d === '*' ? ws.slice(1) : ws.slice(d, d + 1); if (!pick.length && d !== '*') return { error: ':' + d + ': bad word specifier' }; text = pick.join(' '); }
      out += text; changed = true; i = j - 1;
    }
    return { line: out, changed };
  }

  /* ---------------- running ---------------- */
  function Stop(kind, code) { this.kind = kind; this.code = code; }   // 'exit' (exit n), 'cancel' (Ctrl+C), 'steps', 'output', 'array'
  function Return(code) { this.code = code; }   // return n: caught by the function (or the sourced script) it ends
  function LoopCtl(kind, n) { this.kind = kind; this.n = n; }   // break n and continue n: caught by the loops, one level each
  // $'...', as bash writes a value that holds control characters (declare -p, ${x@Q})
  const ansiQ = (s) => "$'" + String(s).replace(/[\\'\u0000-\u001f\u007f]/g, (c) => ({ '\\': '\\\\', "'": "\\'", '\u0007': '\\a', '\b': '\\b', '\u001b': '\\E', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t', '\v': '\\v' })[c] || '\\' + c.charCodeAt(0).toString(8).padStart(3, '0')) + "'";
  // ${x@Q}: quoted so the shell would read it back; ${x@E}: backslash escapes worked out, as in $'...'
  const quoteQ = (s) => /[\u0000-\u001f\u007f]/.test(s) ? ansiQ(s) : "'" + s.replace(/'/g, "'\\''") + "'";
  const escapesE = (s) => s.replace(/\\(x[0-9A-Fa-f]{1,2}|u[0-9A-Fa-f]{1,4}|[0-7]{1,3}|.)/g, (m, c) => c[0] === 'x' || c[0] === 'u' ? String.fromCharCode(parseInt(c.slice(1), 16)) : /^[0-7]/.test(c) ? String.fromCharCode(parseInt(c, 8) & 255) : ({ a: '\u0007', b: '\b', e: '\u001b', E: '\u001b', f: '\f', n: '\n', r: '\r', t: '\t', v: '\v', '\\': '\\', "'": "'", '"': '"', '?': '?' })[c] || m);
  const cap = (s, n) => s.length > n ? s.slice(0, n) : s;
  // time's report: real is the wall-clock time; user is given the same (the commands run in this one thread) and sys 0, in bash's two formats
  const clock = (s) => Math.floor(s / 60) + 'm' + (s % 60).toFixed(3) + 's';
  const timeReport = (s, posix) => posix ? 'real ' + s.toFixed(2) + '\nuser ' + s.toFixed(2) + '\nsys 0.00\n' : '\nreal\t' + clock(s) + '\nuser\t' + clock(s) + '\nsys\t' + clock(0) + '\n';
  const globEsc = (v) => v.replace(/[\\*?[\]'"]/g, '\\$&');   // quoted text inside a case pattern matches itself

  // bash's hash of a string (FNV-1, 32 bits, over the UTF-8 bytes taken as signed chars): where an associative array's key goes
  function fnv(s) {
    let h = 2166136261;
    const add = (b) => { h = Math.imul(h, 16777619) ^ (b > 127 ? b - 256 : b); };
    for (const ch of s) {
      const c = ch.codePointAt(0);
      if (c < 0x80) add(c); else if (c < 0x800) { add(0xc0 | c >> 6); add(0x80 | c & 63); }
      else if (c < 0x10000) { add(0xe0 | c >> 12); add(0x80 | c >> 6 & 63); add(0x80 | c & 63); }
      else { add(0xf0 | c >> 18); add(0x80 | c >> 12 & 63); add(0x80 | c >> 6 & 63); add(0x80 | c & 63); }
    }
    return h >>> 0;
  }
  function makeShell(opts) {
    opts = opts || {};
    const fs = opts.fs || makeFS();
    const now = opts.now || fs.now;
    // funcs: name → the body (a compound command); arrays: name → { v: a sparse array of strings, n: how many are set, bytes }; a name is
    // a plain variable or an array, not both. aliases: name → text. Aliases and functions last as long as the shell (the terminal's session).
    const sh = { fs, vars: dict(), arrays: dict(), funcs: dict(), aliases: dict(), shopt: dict(), exported: new Set(ENV), history: [], lastExit: 0, cancelled: false, steps: 0, outBytes: 0, LIMITS, hooks: opts };
    Object.assign(sh.vars, { HOME, USER, HOSTNAME: HOST, SHELL: '/bin/bash', PATH: '/usr/local/bin:/usr/bin:/bin', TERM: 'xterm-256color', LANG: 'en_US.UTF-8', PS1: '\\u@\\h:\\w\\$ ' });
    const getVar = (name, ctx) => {
      if (name === '?') return String(sh.lastExit);
      if (name === '#') return String(ctx.args.length);
      if (name === '@' || name === '*') return ctx.args.join(' ');
      if (name === '0') return ctx.name || 'bash';
      if (/^[0-9]+$/.test(name)) return ctx.args[+name - 1] || '';
      if (name === '$') return '4242';
      if (name === 'RANDOM') return String(random());
      if (name === 'SECONDS') return String(sh.secs + Math.floor((now() - sh.t0) / 1000));
      if (name === 'PWD') return fs.cwd;
      if (name === 'OLDPWD') return sh.oldpwd || '';
      if (has(sh.arrays, name)) { const a = sh.arrays[name].v[0]; return a === undefined ? '' : a; }   // $a is ${a[0]}
      return has(sh.vars, name) ? sh.vars[name] : '';
    };
    const isSet = (name) => has(sh.vars, name) || (has(sh.arrays, name) && sh.arrays[name].v[0] !== undefined);
    // $RANDOM is bash's own generator (variables.c: a Park-Miller step, the two halves XORed, never the same number twice in a row), so
    // RANDOM=n gives the numbers bash gives; unseeded it starts from the clock. $SECONDS counts from the start or from SECONDS=n.
    let rseed = (Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0, lastRandom = 0;
    const random = () => {
      let rv;
      do { let last = rseed || 123459876; const h = Math.floor(last / 127773), l = last % 127773; let t = (16807 * l - 2836 * h) | 0; if (t < 0) t += 0x7fffffff; rseed = t >>> 0; rv = ((rseed >>> 16) ^ (rseed & 65535)) & 32767; } while (rv === lastRandom);
      return (lastRandom = rv);
    };
    sh.t0 = now(); sh.secs = 0;
    const special = (name, v) => { const n = (String(v).match(/^\s*\d+/) || ['0'])[0].trim(); if (name === 'RANDOM') { rseed = Number(BigInt(n) & 0xffffffffn); lastRandom = 0; } else { sh.secs = parseInt(n, 10) || 0; sh.t0 = now(); } };
    const setVar = (name, v) => { if (name === 'RANDOM' || name === 'SECONDS') { special(name, v); return; } if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) return; if (has(sh.arrays, name)) { arrSet(sh.arrays[name], 0, v); return; } sh.vars[name] = cap(String(v), LIMITS.vars); };
    // ----- arrays. Each is capped (LIMITS.array values, four times LIMITS.vars characters), so a loop cannot fill the memory with one.
    // An associative one (declare -A: assoc) keeps its values in a null-prototype dictionary (a key may be __proto__ or hold spaces) and its
    // keys in bash's own order (${!m[@]}, declare -p): a hash table of 1024 buckets (FNV-1 over the key's UTF-8 bytes), the newest key first in
    // its bucket, the buckets made four times as many once it holds twice as many keys as buckets (hashlib.c)
    const newArr = (assoc) => assoc ? { v: dict(), n: 0, bytes: 0, assoc: true, b: [], nb: 1024 } : { v: [], n: 0, bytes: 0 };
    const arrMake = (name, assoc) => { if (has(sh.arrays, name)) return sh.arrays[name]; const a = newArr(assoc); if (has(sh.vars, name)) { arrSet(a, 0, sh.vars[name]); delete sh.vars[name]; } sh.arrays[name] = a; return a; };
    const into = (a, k) => { const j = fnv(k) & (a.nb - 1); (a.b[j] || (a.b[j] = [])).unshift(k); };
    const arrSet = (a, i, val) => {
      val = cap(String(val), LIMITS.vars);
      if (a.assoc) i = String(i);
      const old = a.v[i];
      if (old === undefined) {
        if (a.n >= LIMITS.array) throw new Stop('array', 1);
        if (a.assoc) { if (a.n >= a.nb * 2) { const was = a.b; a.nb *= 4; a.b = []; for (const l of was) if (l) for (const k of l) into(a, k); } into(a, i); a.bytes += i.length; }
        a.n++;
      }
      a.bytes += val.length - (old === undefined ? 0 : old.length); if (a.bytes > LIMITS.vars * 4) throw new Stop('array', 1);
      a.v[i] = val; a.bare = false;
    };
    const arrUnset = (a, i) => { if (a.assoc) i = String(i); if (a.v[i] === undefined) return; a.n--; a.bytes -= a.v[i].length; if (a.assoc) { const l = a.b[fnv(i) & (a.nb - 1)]; l.splice(l.indexOf(i), 1); a.bytes -= i.length; } delete a.v[i]; };
    const arrKeys = (a) => { if (!a.assoc) return Object.keys(a.v).map(Number); const out = []; for (const l of a.b) if (l) out.push(...l); return out; };   // a sparse array lists its indices in order
    const arrVals = (a) => arrKeys(a).map((k) => a.v[k]);
    const arrMax = (a) => { if (a.assoc) return -1; const k = arrKeys(a); return k.length ? k[k.length - 1] : -1; };
    const isAssoc = (name) => has(sh.arrays, name) && !!sh.arrays[name].assoc;
    const badSub = (what) => { const e = new SyntaxError_(what + ': bad array subscript'); e.exit = 1; throw e; };
    // an index is arithmetic; a negative one counts back from the end, as in bash. An associative array's key is text, and may not be empty.
    const subscript = (name, a, i, shown) => { if (a && a.assoc) { if (String(i) === '') badSub(shown); return String(i); } if (i < 0) { i += (a ? arrMax(a) : isSet(name) ? 0 : -1) + 1; if (i < 0) badSub(shown); } if (i > 2147483647) badSub(shown); return i; };
    const elemGet = (name, i) => { const a = has(sh.arrays, name) ? sh.arrays[name] : null; i = subscript(name, a, i, name); if (a) return a.v[i] === undefined ? '' : a.v[i]; return i === 0 ? getVar(name, { args: [] }) : ''; };
    const elemSet = (name, i, v) => { const a = arrMake(name); arrSet(a, subscript(name, a, i, name + '[' + i + ']'), v); };
    // NAME=(...): items are values, or { k, v, raw } for [key]=value (k: the key, still text). kind 'A' or 'a' makes the array that kind; otherwise
    // an existing one keeps its kind. An associative array takes [key]=value items, or else the words as key value key value...
    const assignArray = (name, items, append, kind, io) => {
      const assoc = kind ? kind === 'A' : isAssoc(name);
      let a; if (append) a = arrMake(name, assoc); else { delete sh.vars[name]; a = sh.arrays[name] = newArr(assoc); }
      if (a.assoc) {
        if (!items.some((it) => typeof it === 'object')) { for (let k = 0; k < items.length; k += 2) arrSet(a, subscript(name, a, items[k], name + '[' + items[k] + ']'), k + 1 < items.length ? items[k + 1] : ''); return; }
        for (const it of items) {
          if (typeof it !== 'object') { if (io) io.err('bash: ' + name + ": '" + it + "': must use subscript when assigning associative array\n"); continue; }
          const k = subscript(name, a, it.k, name + '[' + it.raw + ']'); arrSet(a, k, it.append ? (a.v[k] || '') + it.v : it.v);
        }
        return;
      }
      let i = arrMax(a) + 1;
      for (const it of items) {
        if (typeof it === 'object') { i = subscript(name, a, arithOf(it.k, { args: [] }), name + '[' + it.raw + ']'); arrSet(a, i, it.append ? (a.v[i] || '') + it.v : it.v); i++; continue; }
        arrSet(a, i++, it);
      }
    };
    // $(( )), (( )) and for (( )): $x inside is replaced first, as in bash; a[i] reads and writes array elements
    const arithOf = (text, ctx) => arith(text.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*|[0-9]+|[?#])\}|\$([A-Za-z_][A-Za-z0-9_]*|[0-9?#])/g, (m, a, b) => getVar(a || b, ctx)),
      (n, ix) => ix === undefined ? getVar(n, ctx) : elemGet(n, ix), (n, v, ix) => ix === undefined ? setVar(n, v) : elemSet(n, ix, v), 0, isAssoc);   // m[key] of an associative array: the key is text
    const tilde = (fsPath) => fsPath === HOME ? '~' : fsPath.startsWith(HOME + '/') ? '~' + fsPath.slice(HOME.length) : fsPath;
    sh.prompt = () => USER + '@' + HOST + ':' + tilde(fs.cwd) + '$ ';
    sh.cancel = () => { sh.cancelled = true; if (opts.cancel) opts.cancel(); };
    const tick = () => { if (sh.cancelled) throw new Stop('cancel', 130); if (++sh.steps > LIMITS.steps) throw new Stop('steps', 1); };
    // aliases are expanded at the prompt, as in an interactive bash; in a script only after shopt -s expand_aliases
    const aliasTable = () => sh.interactive || sh.shopt.expand_aliases ? sh.aliases : null;

    // ----- expanding words
    // the parts with many values: "$@" ${a[@]} ${!a[@]} ${a[@]:1:2} (each value its own word when quoted); null for the others
    const listOf = (p, ctx) => {
      const all = (name) => has(sh.arrays, name) ? arrVals(sh.arrays[name]) : isSet(name) ? [getVar(name, ctx)] : [];
      if (p.x === 'xform' && (p.idx === '@' || p.idx === '*' || p.v === '@' || p.v === '*')) { const base = listOf(p.idx ? { x: 'elem', v: p.v, idx: p.idx } : { x: 'var', v: p.v }, ctx); return base.map((v) => xform(p.op, v, p.v)); }
      if (p.x === 'var' && (p.v === '@' || p.v === '*')) return ctx.args.slice();
      if (p.x === 'elem' && (p.idx === '@' || p.idx === '*')) return all(p.v);
      if (p.x === 'keys') return has(sh.arrays, p.v) ? arrKeys(sh.arrays[p.v]).map(String) : isSet(p.v) ? ['0'] : [];
      if (p.x === 'aslice') {
        if (isAssoc(p.v)) { const vs = arrVals(sh.arrays[p.v]), from = p.from < 0 ? Math.max(0, vs.length + p.from) : p.from; return vs.slice(from, p.len === null ? undefined : from + Math.max(0, p.len)); }   // in bash's order
        const a = has(sh.arrays, p.v) ? sh.arrays[p.v] : null, keys = a ? arrKeys(a) : isSet(p.v) ? [0] : [], from = p.from < 0 ? (keys.length ? keys[keys.length - 1] + 1 : 0) + p.from : p.from;
        if (p.len !== null && p.len < 0) { const e = new SyntaxError_(p.len + ': substring expression < 0'); e.exit = 1; throw e; }
        const picked = keys.filter((k) => k >= from).slice(0, p.len === null ? undefined : p.len);
        return picked.map((k) => a ? a.v[k] : getVar(p.v, ctx));
      }
      return null;
    };
    // ${m[key]}: the key is a word of its own (quotes removed, $x and $(...) expanded, spaces kept)
    const keyText = (p, ctx, io) => { if (!p.idxw) { try { p.idxw = tokenize(p.idx, true)[0] || { parts: [] }; } catch (e) { p.idxw = { parts: [{ v: p.idx, q: true }] }; } } return expandSingle(p.idxw, ctx, io); };
    const xform = (op, v, name) => op === 'Q' ? quoteQ(v) : op === 'E' ? escapesE(v) : op === 'U' ? v.toUpperCase() : op === 'L' ? v.toLowerCase() : op === 'u' ? v.slice(0, 1).toUpperCase() + v.slice(1) : (isAssoc(name) ? 'A' : has(sh.arrays, name) ? 'a' : '') + (sh.exported.has(name) ? 'x' : '');
    const joined = (p) => p.v === '*' || p.idx === '*';   // "$*" and "${a[*]}" are one word
    // the value of a part with one value
    async function partValue(p, ctx, io) {
      if (p.x === 'bad') { const e = new SyntaxError_('${' + p.v + '}: bad substitution'); e.exit = 1; throw e; }
      if (p.x === 'var') return getVar(p.v, ctx);
      if (p.x === 'xform') {   // an unset name gives nothing, even for @Q
        const v = p.idx !== undefined ? await partValue({ x: 'elem', v: p.v, idx: p.idx }, ctx, io) : getVar(p.v, ctx);
        const set = p.idx !== undefined ? v !== '' || has(sh.arrays, p.v) : /^[0-9]+$/.test(p.v) ? +p.v <= ctx.args.length : isSet(p.v);
        return p.op === 'a' ? xform('a', v, p.v) : set || v !== '' ? xform(p.op, v, p.v) : '';
      }
      if (p.x === 'elem') { try { return elemGet(p.v, isAssoc(p.v) ? await keyText(p, ctx, io) : arithOf(p.idx, ctx)); } catch (e) { if (!(e instanceof SyntaxError_ && / bad array subscript$/.test(e.message))) throw e; io.err('bash: ' + e.message + '\n'); return ''; } }   // reading ${a[-9]}: a message, then nothing
      if (p.x === 'len') {
        if (p.idx === '@' || p.idx === '*') return String(has(sh.arrays, p.v) ? sh.arrays[p.v].n : isSet(p.v) ? 1 : 0);
        if (p.idx !== undefined) return String(elemGet(p.v, isAssoc(p.v) ? await keyText(p, ctx, io) : arithOf(p.idx, ctx)).length);
        return String(p.v === '@' || p.v === '*' ? ctx.args.length : getVar(p.v, ctx).length);
      }
      if (p.x === 'slice') {
        const cur = getVar(p.v, ctx), n = cur.length, from = p.from < 0 ? n + p.from : p.from;
        if (from < 0 || from > n) return '';   // an offset before the start or past the end gives nothing
        if (p.len === null) return cur.slice(from);
        const end = p.len < 0 ? n + p.len : from + p.len; if (end < from) { const e = new SyntaxError_(p.v + ': substring expression < 0'); e.exit = 1; throw e; }
        return cur.slice(from, end);
      }
      if (p.x === 'strip') return stripPattern(getVar(p.v, ctx), p.op, paramPattern(expandVarsIn(p.pat, ctx)));
      if (p.x === 'subst') { const repl = p.repl === null ? '' : expandVarsIn(p.repl, ctx); return substitute(getVar(p.v, ctx), p, paramPattern(expandVarsIn(p.pat, ctx)), (m) => replacementText(repl, m)); }
      if (p.x === 'case') { const cur = getVar(p.v, ctx), up = p.op[0] === '^'; return p.op.length === 2 ? (up ? cur.toUpperCase() : cur.toLowerCase()) : (up ? cur.slice(0, 1).toUpperCase() : cur.slice(0, 1).toLowerCase()) + cur.slice(1); }
      if (p.x === 'def') {
        const cur = getVar(p.v, ctx), set = /^[0-9]+$/.test(p.v) ? +p.v <= ctx.args.length : isSet(p.v);
        const word = () => p.word.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}|\$([A-Za-z_][A-Za-z0-9_]*|[0-9?#])/g, (m, a, b) => getVar(a || b, ctx));
        const filled = p.colon ? cur !== '' : set;
        if (p.op === '+') return filled ? word() : '';
        if (filled) return cur;
        const v = word(); if (p.op === '=') setVar(p.v, v); return v;
      }
      if (p.x === 'arith') return String(arithOf(await arithSubs(p.v, ctx, io), ctx));
      return (await capture(p.v, ctx, io)).replace(/\n+$/, '');
    }
    async function expandWord(w, ctx, io) {
      // 1. brace expansion on a bare literal word
      if (!w.noBrace && w.parts.every((p) => !p.x && !p.q) && /\{.*\}/.test(wordText(w))) { const outs = []; for (const s of braceExpand(wordText(w))) outs.push(...await expandWord({ parts: [{ v: s, q: false }], noBrace: true }, ctx, io)); return outs; }
      // 2. parameters, commands, arithmetic → fields (lists of chunks; each chunk knows whether it was quoted)
      const fields = [[]]; let any = false, lists = 0, onlyEmptyLists = true;
      const push = (v, q) => { fields[fields.length - 1].push({ v, q }); };
      for (const p of w.parts) {
        if (!p.x) { push(p.v, p.q); any = any || p.v !== '' || p.q; if (p.v !== '') onlyEmptyLists = false; continue; }
        const list = listOf(p, ctx);
        // "$@" and "${a[@]}": each value is its own word; with no values, a word that is only that disappears
        if (list && p.q && !joined(p)) { lists++; if (list.length) onlyEmptyLists = false; list.forEach((a, k) => { if (k > 0) fields.push([]); push(a, true); any = true; }); continue; }
        onlyEmptyLists = false;
        const v = list ? list.join(' ') : await partValue(p, ctx, io);
        if (p.q) { push(v, true); any = true; continue; }
        const pieces = v.split(/[ \t\n]+/);
        pieces.forEach((piece, k) => { if (k > 0) fields.push([]); if (piece !== '') { push(piece, false); any = true; } });
      }
      if (!any && !w.parts.some((p) => p.q)) return [];
      if (lists && onlyEmptyLists) return [];
      const out = [];
      for (const f of fields) {
        if (!f.length) continue;
        // 3. ~ at the start, then wildcards on unquoted text; quoted characters are protected with \ in the pattern
        if (f[0].v.startsWith('~') && !f[0].q) { const m = f[0].v.match(/^~([^/]*)(.*)$/); if (m[1] === '' || m[1] === USER) f[0] = { v: HOME + m[2], q: false }; }
        const pat = f.map((c) => c.q ? c.v.replace(/[\\*?[\]]/g, '\\$&') : c.v).join('');
        if (f.some((c) => !c.q && GLOB_CHARS.test(c.v))) {
          const m = globExpand(fs, pat, sh.shopt.dotglob); if (m.length) { out.push(...m); continue; }
          if (sh.shopt.failglob) { const e = new SyntaxError_('no match: ' + unescapeGlob(pat)); e.exit = 1; throw e; }   // shopt -s failglob: an error, and the line stops
          if (sh.shopt.nullglob) continue;   // shopt -s nullglob: the word goes away
        }
        out.push(unescapeGlob(pat));
      }
      return out;
    }
    // an assignment's value, case's word (one string: no splitting, no wildcards; ~ at the start is still home) and, with pattern, a case
    // pattern: there the unquoted text keeps * ? [...] and the quoted text is escaped
    async function expandSingle(w, ctx, io, pattern) {
      let s = '';
      for (let k = 0; k < w.parts.length; k++) {
        const p = w.parts[k];
        const list = p.x ? listOf(p, ctx) : null;
        let v = !p.x ? p.v : list ? list.join(' ') : await partValue(p, ctx, io);
        if (!p.x && k === 0 && !p.q && pattern !== true && /^~(\/|$)/.test(v)) v = HOME + v.slice(1);   // pattern 'tilde': [[ x == ~/* ]]
        // in a case pattern an unquoted expansion keeps its wildcards and its backslashes (bash: p='a\*' matches only "a*"), so only quotes,
        // which the pattern reader would take as quoting, are made literal
        s += pattern ? (p.q ? globEsc(v) : p.x ? v.replace(/['"]/g, (c) => '\\' + c) : v) : v;
      }
      return s;
    }
    // $x and ${x} inside the pattern or the replacement of a ${...} are replaced first (text in single quotes is left alone)
    const expandVarsIn = (text, ctx) => text.replace(/'[^']*'|\$\{([A-Za-z_][A-Za-z0-9_]*)\}|\$([A-Za-z_][A-Za-z0-9_]*|[0-9?#])/g, (m, a, b) => (m[0] === "'" ? m : getVar(a || b, ctx)));
    const expandAll = async (words, ctx, io) => { const out = []; for (const w of words) out.push(...await expandWord(w, ctx, io)); return out; };
    const expandOne = async (w, ctx, io) => (await expandWord(w, ctx, io)).join(' ');   // a redirection target: one field, no splitting

    // ----- running a text and keeping its output (for $(...))
    async function capture(text, ctx, io) {
      let buf = ''; const sub = Object.assign({}, io, { out: (s) => { buf += s; if (buf.length > LIMITS.out) throw new Stop('output', 1); }, tty: false });
      await runList(parse(text, { aliases: aliasTable(), warn: (m) => io.err('bash: ' + m + '\n') }), ctx, sub);
      return buf;
    }

    // $(...), `...` and $((...)) inside an arithmetic expression are worked out first, as in bash: $(( $1 * $(fact $(( $1 - 1 ))) ))
    async function arithSubs(text, ctx, io) {
      if (!/\$\(|`/.test(text)) return text;
      let out = '';
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '$' && text[i + 1] === '(') {
          let d = 0, j = i + 1; for (; j < text.length; j++) { if (text[j] === '(') d++; else if (text[j] === ')' && --d === 0) break; }
          if (text[i + 2] === '(' && text[j - 1] === ')') out += '(' + await arithSubs(text.slice(i + 3, j - 1), ctx, io) + ')';
          else out += (await capture(text.slice(i + 2, j), ctx, io)).replace(/\n+$/, '');
          i = j; continue;
        }
        if (c === '`') { const j = text.indexOf('`', i + 1); if (j > 0) { out += (await capture(text.slice(i + 1, j), ctx, io)).replace(/\n+$/, ''); i = j; continue; } }
        out += c;
      }
      return out;
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
      let input = io.stdin, exit = 0; const t0 = node.time ? Date.now() : 0;
      for (let i = 0; i < node.cmds.length; i++) {
        const last = i === node.cmds.length - 1;
        let buf = '';
        const sub = Object.assign({}, io, { stdin: input, out: last ? io.out : (s) => { buf += s; if (buf.length > LIMITS.out) throw new Stop('output', 1); }, tty: last ? io.tty : false, pipe: !last });
        if (i > 0) sub.stdin = stdinOf(input);
        exit = await runCommand(node.cmds[i], ctx, sub);
        input = buf;
      }
      sh.lastExit = node.neg ? (exit === 0 ? 1 : 0) : exit;
      if (node.time) io.err(timeReport((Date.now() - t0) / 1000, node.time === 'posix'));
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
        // <<EOF: the lines, expanded unless the word was quoted; <<< word: the word (not split, no wildcards) and a newline
        if (r.hd) { sub.stdin = stdinOf(r.hd.quoted ? r.hd.text : await expandSingle({ parts: r.hd.parts }, ctx, io)); continue; }
        if (r.op === '<<<') { sub.stdin = stdinOf(await expandSingle(r.target, ctx, io) + '\n'); continue; }
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
    // break n / continue n: the innermost loop takes one level and hands the rest on
    const loopCtl = (e) => { if (!(e instanceof LoopCtl)) throw e; if (e.n > 1) { e.n--; throw e; } return e.kind; };
    async function loop(ctx, each) { ctx.loops = (ctx.loops || 0) + 1; try { return await each(); } finally { ctx.loops--; } }
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
          return loop(ctx, async () => { for (const it of items) { tick(); setVar(node.name, it); try { exit = await runList(node.body, ctx, io2); } catch (e) { if (loopCtl(e) === 'break') break; } } return exit; });
        }
        if (node.k === 'while') {
          let exit = 0;
          return loop(ctx, async () => { for (;;) { tick(); const c = await runList(node.cond, ctx, io2); if ((c === 0) === node.until) break; try { exit = await runList(node.body, ctx, io2); } catch (e) { if (loopCtl(e) === 'break') break; } } return exit; });
        }
        if (node.k === 'cfor') {
          const ev = async (t, dflt) => { if (t.trim() === '') return dflt; try { return arithOf(await arithSubs(t, ctx, io2), ctx); } catch (e) { if (e instanceof SyntaxError_ && e.exit && !/^\(\(: /.test(e.message)) e.message = '((: ' + e.message; throw e; } };
          let exit = 0; await ev(node.init, 0);
          return loop(ctx, async () => { for (;;) { tick(); if (!await ev(node.cond, 1)) break; try { exit = await runList(node.body, ctx, io2); } catch (e) { if (loopCtl(e) === 'break') break; } await ev(node.step, 0); } return exit; });
        }
        if (node.k === 'case') {
          const word = await expandSingle(node.word, ctx, io2); let exit = 0, run = false;
          for (const it of node.items) {
            tick();
            if (!run) for (const pw of it.pats) { if (paramPattern(await expandSingle(pw, ctx, io2, true))(word)) { run = true; break; } }
            if (!run) continue;
            exit = await runList(it.body, ctx, io2);
            if (it.end === ';;') break; if (it.end === ';;&') run = false;   // ;& runs the next list as well
          }
          return exit;
        }
        if (node.k === 'arith') { tick(); try { return arithOf(await arithSubs(node.v, ctx, io2), ctx) !== 0 ? 0 : 1; } catch (e) { if (!(e instanceof SyntaxError_ && e.exit)) throw e; io2.err('bash: ((: ' + e.message + '\n'); return 1; } }
        if (node.k === 'func') { tick(); sh.funcs[node.name] = node.body; return 0; }
        if (node.k === 'cond') { tick(); try { return await condEval(node.e, ctx, io2) ? 0 : 1; } catch (e) { if (e === BAD_RE) return 2; throw e; } }   // [[ ]]: 0 true, 1 false, 2 a regular expression that does not compile
        return 0;
      });
    }
    // the tests of [[ ]]: the words are expanded but not split or globbed; the right side of == != is a pattern (quoted parts literal), of =~ an
    // extended regular expression (quoted parts literal), whose match and groups go into BASH_REMATCH; -eq and friends compare arithmetic
    const BAD_RE = {};
    async function condEval(e, ctx, io) {
      if (e.k === 'and') return await condEval(e.l, ctx, io) && condEval(e.r, ctx, io);
      if (e.k === 'or') return await condEval(e.l, ctx, io) || condEval(e.r, ctx, io);
      if (e.k === 'not') return !await condEval(e.e, ctx, io);
      if (e.k === 'group') return condEval(e.e, ctx, io);
      const a = await expandSingle(e.a, ctx, io);
      if (e.k === 'unary') {
        if (e.op === '-n') return a !== ''; if (e.op === '-z') return a === '';
        if (e.op === '-v') { const m = a.match(/^([A-Za-z_][A-Za-z0-9_]*)(?:\[(.+)\])?$/); if (!m) return false; if (m[2] === undefined) return isSet(m[1]); const arr = has(sh.arrays, m[1]) ? sh.arrays[m[1]] : null; if (m[2] === '@' || m[2] === '*') return !!arr && arr.n > 0; if (arr && arr.assoc) return arr.v[m[2]] !== undefined; try { const i = arithOf(m[2], ctx); return arr ? arr.v[i < 0 ? i + arrMax(arr) + 1 : i] !== undefined : i === 0 && isSet(m[1]); } catch (x) { return false; } }
        if (e.op === '-o' || e.op === '-t' || e.op === '-R') return false;
        const n = a === '' ? null : fs.stat(fs.resolve(a));
        if (!n) return false;
        switch (e.op) {
          case '-a': case '-e': case '-r': case '-w': case '-N': return true;
          case '-f': return n.t === 'f'; case '-d': return n.t === 'd'; case '-s': return n.t === 'd' || n.d.length > 0; case '-x': return n.t === 'd' || n.x;
          case '-c': return fs.resolve(a) === '/dev/null';
          case '-O': case '-G': { const p = fs.resolve(a); return p === '/home' || p.startsWith('/home/') || p === '/tmp' || p.startsWith('/tmp/'); }   // the student owns their files
          default: return false;   // -b -p -S -h -L -g -u -k: no devices, pipes, sockets, links or special bits here
        }
      }
      if (e.op === '=~') {
        let re = '';
        for (const p of e.b.parts) { const list = p.x ? listOf(p, ctx) : null, v = !p.x ? p.v : list ? list.join(' ') : await partValue(p, ctx, io); re += p.q ? v.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&') : v; }
        let rx; try { rx = new RegExp(posixRegex(re, true)); } catch (x) { throw BAD_RE; }
        const m = rx.exec(a);
        assignArray('BASH_REMATCH', m ? Array.from(m, (g) => g === undefined ? '' : g) : [], false);
        return !!m;
      }
      if (e.op === '==' || e.op === '=' || e.op === '!=') { const hit = paramPattern(await expandSingle(e.b, ctx, io, 'tilde'))(a); return e.op === '!=' ? !hit : hit; }
      const b = await expandSingle(e.b, ctx, io);
      if (e.op === '<') return a < b; if (e.op === '>') return a > b;
      if (e.op === '-nt' || e.op === '-ot' || e.op === '-ef') {
        const na = a === '' ? null : fs.stat(fs.resolve(a)), nb = b === '' ? null : fs.stat(fs.resolve(b));
        if (e.op === '-ef') return !!na && !!nb && fs.resolve(a) === fs.resolve(b);
        const [x, y] = e.op === '-nt' ? [na, nb] : [nb, na];
        return !!x && (!y || x.m > y.m);
      }
      let x, y;
      try { x = arithOf(a, ctx); y = arithOf(b, ctx); } catch (er) { if (!(er instanceof SyntaxError_ && er.exit)) throw er; io.err('bash: [[: ' + er.message + '\n'); return false; }   // said, and that test is false
      return e.op === '-eq' ? x === y : e.op === '-ne' ? x !== y : e.op === '-lt' ? x < y : e.op === '-le' ? x <= y : e.op === '-gt' ? x > y : x >= y;
    }
    async function runSimple(node, ctx, io) {
      tick(); if (node.line) { ctx.line = node.line; if (ctx.root) ctx.root.line = node.line; }
      // local, declare, export...: their NAME=value arguments are not split, and NAME=(a b) reaches them as an array (io.arrays)
      const decl = node.words.length && DECL.includes(plainText(node.words[0]) || '');
      const words = [], arrays = dict();
      for (const w of node.words) {
        if (decl && w.decl) { if (w.decl.list) { arrays[words.length - 1] = { name: w.decl.name, values: await compoundItems(w.decl.list, ctx, io), append: w.decl.append }; words.push(w.decl.name + '=(...)'); } else words.push(await expandSingle(w, ctx, io)); continue; }
        words.push(...await expandWord(w, ctx, io));
      }
      if (!words.length) { for (const a of node.assigns) await assignOne(a, ctx, io); return 0; }
      const saved = [];   // VAR=value cmd: the variable holds for that command only
      for (const [name, w, a] of node.assigns) { if (a.idx) io.err('bash: `' + name + '[' + a.rawIdx + "]': not a valid identifier\n"); if (a.list || a.idx) continue; saved.push([name, has(sh.vars, name) ? sh.vars[name] : null]); setVar(name, await expandSingle(w, ctx, io)); }
      try { return await runWords(words, ctx, Object.keys(arrays).length ? Object.assign({}, io, { arrays }) : io); }
      finally { for (const [name, old] of saved) { if (old === null) delete sh.vars[name]; else sh.vars[name] = old; } }
    }
    // NAME=value, NAME+=value, NAME[i]=value, NAME=(a b c), NAME+=(d)
    async function assignOne([name, w, a], ctx, io) {
      if (a && a.list) { assignArray(name, await compoundItems(a.list, ctx, io), a.append, undefined, io); return; }
      const v = await expandSingle(w, ctx, io);
      if (a && a.idx) { const shown = await expandSingle(a.idx, ctx, io), arr = arrMake(name), i = subscript(name, arr, arr.assoc ? shown : arithOf(shown, ctx), name + '[' + (arr.assoc ? a.rawIdx : shown) + ']'); arrSet(arr, i, a.append ? (arr.v[i] || '') + v : v); return; }
      setVar(name, a && a.append ? getVar(name, { args: [] }) + v : v);
    }
    // the words of NAME=(...): [key]=value gives { k, v, raw } (neither split nor globbed, as an assignment), other words their values
    async function compoundItems(list, ctx, io) {
      const out = [];
      for (const w of list) { if (w.sub) out.push({ k: await expandSingle(w.sub.idx, ctx, io), v: await expandSingle(w.sub.rest, ctx, io), raw: w.sub.rawIdx, append: w.sub.append }); else out.push(...await expandWord(w, ctx, io)); }
      return out;
    }
    async function runWords(words, ctx, io, noFunc) {
      const name = words[0], args = words.slice(1);
      if (!noFunc && has(sh.funcs, name)) return callFunction(name, args, ctx, io);   // a function comes before a builtin or a command of the same name
      if (has(COMMANDS, name)) {
        try { const r = await COMMANDS[name].run(args, io, sh, ctx); return typeof r === 'number' ? r : 0; }
        catch (e) { if (e instanceof FsError) { io.err(name + ': ' + (e.path ? tilde(e.path) + ': ' : '') + e.message + '\n'); return 1; } throw e; }
      }
      if (name.includes('/')) return runPath(name, args, ctx, io);
      io.err('bash: ' + name + ': command not found\n');
      return 127;
    }
    // a function runs in this shell with its own $1 $2 ... ($0 stays); local variables are put back when it returns. FUNCNEST, or
    // LIMITS.funcDepth, bounds the nesting, with bash's message; the rest of that line is then dropped, as bash does.
    async function callFunction(name, args, ctx, io) {
      const depth = (ctx.depth || 0) + 1, nest = parseInt(sh.vars.FUNCNEST, 10), limit = nest > 0 ? Math.min(nest, LIMITS.funcDepth) : LIMITS.funcDepth;
      if (depth > limit) { const e = new SyntaxError_(name + ': maximum function nesting level exceeded (' + limit + ')'); e.exit = 1; throw e; }
      const fctx = { name: ctx.name, args: args.slice(), line: ctx.line, fn: name, depth, locals: [], root: ctx.root || ctx };
      try { return await runCommand(sh.funcs[name], fctx, io); }
      catch (e) { if (e instanceof Return) return e.code; throw e; }
      finally { for (let k = fctx.locals.length - 1; k >= 0; k--) { const l = fctx.locals[k]; if (l.v === null) delete sh.vars[l.name]; else sh.vars[l.name] = l.v; if (l.a === null) delete sh.arrays[l.name]; else sh.arrays[l.name] = l.a; } }
    }
    // local NAME: what it held is kept, to be put back when the function returns
    sh.makeLocal = (ctx, name) => { if (!ctx.locals.some((l) => l.name === name)) ctx.locals.push({ name, v: has(sh.vars, name) ? sh.vars[name] : null, a: has(sh.arrays, name) ? sh.arrays[name] : null }); delete sh.vars[name]; delete sh.arrays[name]; };
    // ./program, ./script.sh, /bin/ls
    async function runPath(name, args, ctx, io) {
      const abs = fs.resolve(name), n = fs.stat(abs);
      if (!n) { io.err('bash: ' + name + ': No such file or directory\n'); return 127; }
      if (n.t === 'd') { io.err('bash: ' + name + ': Is a directory\n'); return 126; }
      if (abs.startsWith('/bin/') && has(COMMANDS, abs.slice(5))) return runWords([abs.slice(5)].concat(args), ctx, io, true);
      if (!n.x) { io.err('bash: ' + name + ': Permission denied\n'); return 126; }
      if (n.bin) return runProgram(n.bin, name, args, io);
      const m = n.d.match(/^#!\s*(\S+)(?:\s+(\S+))?/);
      const interp = m ? (m[1].endsWith('/env') ? m[2] || '' : m[1].split('/').pop()) : 'bash';
      if (/^python/.test(interp)) return runProgram({ lang: 'python', src: n.d }, name, args, io);
      if (interp === 'bash' || interp === 'sh') return runScript(n.d, name, args, io, true);
      io.err('bash: ' + name + ': cannot execute: ' + interp + ' is not available here\n');
      return 126;
    }
    // a script runs in this shell (its variables and functions stay), with its own arguments; exit ends only the script. It is read a line at
    // a time, so a syntax error further down stops it there, as in bash. sourced (source s.sh): return ends it, and aliases work as at the prompt.
    // fromFile (bash s.sh, ./s.sh, source s.sh): the shell's own messages say where they come from, "s.sh: line 2: ...", as bash's do
    async function runScript(text, name, args, io, fromFile, sourced) {
      const ctx = { name, args, line: 1, sourced: !!sourced };
      const where = (line) => fromFile ? name + ': line ' + line + ': ' : name + ': ';
      const err0 = io.err, lastLine = (text.match(/\n/g) || []).length + (text.endsWith('\n') ? 0 : 1);
      if (fromFile) io = Object.assign({}, io, { err: (s) => err0(String(s).replace(/^bash: /, where(ctx.line))) });
      const keep = { interactive: sh.interactive, shopt: Object.assign(dict(), sh.shopt) };   // a script's shopt -s ends with it, as a child bash's would
      if (!sourced) sh.interactive = false;
      try {
        // an error in an expansion ($((1/0)), a bad ${...}) abandons the rest of its line, and the script goes on with the next one
        const ps = parser(text, { aliases: aliasTable, warn: (m) => err0(where(lastLine) + m + '\n') }); let exit = 0;
        for (let chunk; (chunk = ps.next());) {
          for (const item of chunk.items) {
            try { exit = await runAndOr(item, ctx, io); }
            catch (e) { if (!(e instanceof SyntaxError_ && e.exit)) throw e; io.err(where(ctx.line) + e.message + '\n'); sh.lastExit = exit = e.exit; break; }
          }
        }
        return exit;
      }
      catch (e) {
        if (e instanceof Stop && e.kind === 'exit') return e.code;
        if (e instanceof Return && sourced) return e.code;
        if (e instanceof SyntaxError_) { io.err(synText(e, where(e.line || ctx.line), text, false)); return e.exit || 2; }
        throw e;
      }
      finally { if (!sourced) { sh.interactive = keep.interactive; sh.shopt = keep.shopt; } }
    }
    sh.runScript = runScript;
    // a syntax error's message (and the lines that came with it); run as a script, bash also shows the line at fault ("near" errors only)
    const synText = (e, prefix, src, tty) => {
      let s = ''; for (const m of [e.message].concat(e.more || [])) s += prefix + m + '\n';
      if (!tty && (e.near || /^syntax error near unexpected token/.test(e.message))) { const l = String(src).split('\n')[(e.line || 1) - 1]; if (l !== undefined) s += prefix + '`' + l + "'\n"; }
      return s;
    };
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

    // ----- the entry point. A line typed at the terminal (io.tty) gets history expansion and aliases, as in an interactive bash; other
    // callers (the grader, the differential tests) get a script's rules. The text is run a line at a time.
    sh.exec = async (line, io) => {
      io = Object.assign({ out: () => { }, err: () => { }, tty: true }, io || {});
      if (!io.err) io.err = io.out;
      io.stdin = io.stdin == null ? null : (typeof io.stdin === 'string' ? stdinOf(io.stdin) : io.stdin);
      line = String(line).replace(/\u0000/g, '');
      if (io.tty && /[!^]/.test(line)) {   // a line whose ! finds nothing is not run and not kept, as in bash
        const h = histExpand(line, sh.history);
        if (h.error) { io.err('bash: ' + h.error + '\n'); return sh.lastExit; }
        if (h.changed) { line = h.line; io.out(line + '\n'); }
      }
      const typed = line;   // what the history keeps: the first line (the command line cannot hold a here-document's lines)
      // a here-document typed at the prompt: its lines are asked for with bash's "> " until its word (Ctrl+D: the end of the text, with bash's warning)
      if (io.tty && io.ask && line.includes('<<')) {
        sh.cancelled = false;
        const open = (s) => { try { return !!tokenize(s).open; } catch (e) { return false; } };
        for (let k = 0; k < 10000 && line.length < LIMITS.fileBytes && open(line); k++) {
          const more = await io.ask('> ', 'here-document: type its lines, then the word that ends it');
          if (sh.cancelled) { io.err('^C\n'); return (sh.lastExit = 130); }
          if (more == null) break;
          line += '\n' + String(more).replace(/\u0000/g, '');
        }
      }
      if (typed.trim() && (sh.history.length === 0 || sh.history[sh.history.length - 1] !== typed)) { sh.history.push(typed); if (sh.history.length > LIMITS.history) sh.history.shift(); }
      sh.cancelled = false; sh.steps = 0; sh.outBytes = 0; sh.interactive = !!io.tty;
      const ctx = { name: 'bash', args: [] };
      try {
        const ps = parser(line, { aliases: aliasTable, warn: (m) => io.err('bash: ' + m + '\n') });
        for (let chunk; (chunk = ps.next());) {
          try { sh.lastExit = await runList(chunk, ctx, io); }
          catch (e) { if (!(e instanceof SyntaxError_ && e.exit)) throw e; io.err('bash: ' + e.message + '\n'); sh.lastExit = e.exit; }   // an expansion error drops the rest of its line
        }
      }
      catch (e) {
        if (e instanceof SyntaxError_) { io.err(synText(e, 'bash: ', line, io.tty)); sh.lastExit = e.exit || 2; }
        else if (e instanceof Stop) {
          if (e.kind === 'cancel') io.err('^C\n');
          else if (e.kind === 'steps') io.err('bash: stopped: more than ' + LIMITS.steps + ' commands ran from this line. Is there a loop that never ends?\n');
          else if (e.kind === 'output') io.err('bash: stopped: the command produced more output than this terminal keeps.\n');
          else if (e.kind === 'array') io.err('bash: stopped: an array here holds at most ' + LIMITS.array + ' values and ' + LIMITS.vars * 4 + ' characters.\n');
          sh.lastExit = e.code;
        } else if (e instanceof FsError) { io.err('bash: ' + (e.path ? tilde(e.path) + ': ' : '') + e.message + '\n'); sh.lastExit = 1; }
        else if (e instanceof Return || e instanceof LoopCtl) { sh.lastExit = e.code || 0; }
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
      const atCommand = before === '' || /(?:^|[|;&(]|&&|\|\|)\s*$/.test(before) || /\b(sudo|man|help|which|type|xargs|time|command)\s*$/.test(before);
      const cmdWord = (before.match(/(?:^|[|;&(]|&&|\|\|)\s*([^\s|;&()<>]+)[^|;&()]*$/) || [])[1];
      const dirsOnly = cmdWord === 'cd' || cmdWord === 'rmdir';
      const esc = (n) => quote ? n : n.replace(/([ "'\\$`()&|;<>*?[\]{}#~!])/g, '\\$1');
      let items = [], display = [];
      if (atCommand && !word.includes('/')) { display = [...new Set(Object.keys(COMMANDS).concat(Object.keys(sh.funcs), Object.keys(sh.aliases)))].filter((c) => c.startsWith(word)).sort(); items = display.map((c) => c + ' '); }
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
    sh.exec_words = (words, ctx, io, noFunc) => runWords(words, ctx, io, noFunc);
    sh.getVar = (n) => getVar(n, { name: 'bash', args: [] });
    sh.setVar = setVar;
    // NAME or NAME[sub] (printf -v): an indexed array's sub is arithmetic, an associative one's is the key
    sh.assignTo = (spec, v, ctx) => { const m = spec.match(/^([A-Za-z_][A-Za-z0-9_]*)(?:\[(.+)\])?$/); if (m[2] === undefined) setVar(m[1], v); else elemSet(m[1], isAssoc(m[1]) ? m[2] : arithOf(m[2], ctx), v); };
    Object.assign(sh, { arrMake, arrSet, arrKeys, arrVals, arrUnset, assignArray, isSet, isAssoc, elemSet, arithOf, printFunc: (name) => printFunc(name, sh.funcs[name]) });
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
        const items = names.map((name) => { const n = dirAbs === null ? fs.stat(fs.resolve(name)) : name === '.' ? fs.stat(dirAbs) : name === '..' ? fs.stat(fs.resolve('..', dirAbs)) : dirAbs === null ? fs.stat(fs.resolve(name)) : fs.stat(dirAbs === '/' ? '/' + name : dirAbs + '/' + name); return { name: name + (o.f.F ? (n.t === 'd' ? '/' : n.x ? '*' : '') : ''), node: n, cls: io.tty ? kind(n) : '' }; });
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
  // sed: a script of commands separated by ; or newlines (or given by several -e), each with an optional address (N, $, /re/, a range of two,
  // ! for "not") and one of  s/old/new/[g i p N]  p  d  q  =  , run on each line in turn as GNU sed does (-n: print only what p prints)
  function sedParse(text, E) {
    const cmds = []; let i = 0, n = 0;
    const err = (msg) => { throw new Error('-e expression #1, char ' + Math.max(1, i) + ': ' + msg); };
    const ws = () => { while (i < text.length && (text[i] === ' ' || text[i] === '\t')) i++; };
    const delimited = (d) => { let out = ''; for (; i < text.length; i++) { const c = text[i]; if (c === '\\' && i + 1 < text.length) { out += text[i + 1] === d && d !== '\\' ? d : c + text[i + 1]; i++; continue; } if (c === d) { i++; return out; } if (c === '\n') break; out += c; } return null; };
    const regex = (src, flags) => { try { return new RegExp(posixRegex(src, E), flags); } catch (e) { err('invalid regular expression: ' + e.message); } };
    const addr = () => {
      if (/\d/.test(text[i] || '')) { let v = ''; while (/\d/.test(text[i] || '')) v += text[i++]; return { n: +v }; }
      if (text[i] === '$') { i++; return { last: true }; }
      if (text[i] === '/' || text[i] === '\\') { const d = text[i] === '\\' ? text[++i] : '/'; i++; const r = delimited(d); if (r == null) err('unterminated address regex'); return { re: regex(r, '') }; }
      return null;
    };
    while (i < text.length) {
      while (i < text.length && /[\s;]/.test(text[i])) i++;
      if (i >= text.length) break;
      if (++n > 1000) err('too many commands for this practice sed');
      const c = { a1: addr(), a2: null, not: false, on: false };
      if (c.a1 && text[i] === ',') { i++; c.a2 = addr(); if (!c.a2) err('unexpected `,\''); }
      ws(); if (text[i] === '!') { c.not = true; i++; ws(); }
      const k = text[i++];
      if (k === undefined) err('missing command');
      c.k = k;
      if (k === 's') {
        const d = text[i++]; if (!d || d === '\n' || d === '\\') err("unterminated `s' command");
        const pat = delimited(d), rep = pat == null ? null : delimited(d); if (pat == null || rep == null) err("unterminated `s' command");
        let fl = ''; while (i < text.length && /[gGiIpP0-9]/.test(text[i])) fl += text[i++];
        if (i < text.length && !/[\s;}]/.test(text[i])) { i++; err("unknown option to `s'"); }   // GNU counts the character it stopped at
        const nth = +(fl.match(/\d+/) || [1])[0];
        c.re = regex(pat, 'g' + (/[iI]/.test(fl) ? 'i' : '')); c.all = /g/i.test(fl); c.nth = nth; c.print = /p/i.test(fl);
        // the replacement: \1..\9 a group, & the whole match, \& a real &, \n a newline, \\ a backslash
        c.rep = []; for (let j = 0; j < rep.length; j++) { const ch = rep[j]; if (ch === '\\' && j + 1 < rep.length) { const nx = rep[++j]; c.rep.push(/\d/.test(nx) ? { g: +nx } : nx === 'n' ? '\n' : nx === 't' ? '\t' : nx); } else if (ch === '&') c.rep.push({ g: 0 }); else c.rep.push(ch); }
      } else if (k === 'y') {   // y/abc/xyz/: each character of the first list becomes the one at its place in the second
        const d = text[i++]; const from = d && d !== '\n' ? delimited(d) : null, to = from == null ? null : delimited(d); if (from == null || to == null) err("unterminated `y' command");
        const fa = [...from.replace(/\\(.)/g, (m, x) => (x === 'n' ? '\n' : x))], ta = [...to.replace(/\\(.)/g, (m, x) => (x === 'n' ? '\n' : x))];
        if (fa.length !== ta.length) err("strings for `y' command are different lengths");
        c.map = new Map(fa.map((ch, j) => [ch, ta[j]]));
      } else if (!'pdq='.includes(k)) { i--; err('unknown command: `' + k + "'"); }
      ws(); if (i < text.length && !/[;\n]/.test(text[i])) err('extra characters after command');
      cmds.push(c);
    }
    return cmds;
  }
  function sedMatch(c, line, n, last) {
    const at = (a) => a.n !== undefined ? n === a.n : a.last ? last : (a.re.lastIndex = 0, a.re.test(line));
    let m;
    if (!c.a1) m = true;
    else if (!c.a2) m = at(c.a1);
    else if (!c.on) { m = at(c.a1); if (m) c.on = !(c.a2.n !== undefined ? c.a2.n <= n : c.a2.last ? last : false); }   // a range starts; a second number already passed ends it at once
    else { m = true; if (c.a2.n !== undefined ? n >= c.a2.n : c.a2.last ? last : (c.a2.re.lastIndex = 0, c.a2.re.test(line))) c.on = false; }
    return c.not ? !m : m;
  }
  function sedSub(c, line) {   // replace() passes the match, its groups, then offset, string and maybe the named groups
    let count = 0, did = false;
    const out = line.replace(c.re, (...m) => { const groups = m.slice(0, m.length - (m[m.length - 1] && typeof m[m.length - 1] === 'object' ? 3 : 2)); count++; if (count < c.nth || (!c.all && count > c.nth)) return m[0]; did = true; return c.rep.map((p) => typeof p === 'string' ? p : (groups[p.g] === undefined ? '' : groups[p.g])).join(''); });
    return [out, did];
  }
  def('sed', { cat: 'text', use: "sed [-n] [-i] [-E] 'script' [file...]", desc: 'Edit text line by line. The script is one or more commands, separated by ; or given by several -e: s/old/new/ replaces the first match of old on each line (g every match, i ignoring case, p print the line too); y/abc/xyz/ changes each a to x, b to y, c to z; p prints, d deletes, q quits, = prints the line number. A command can start with an address: a line number, $ (the last line), /pattern/, or a range like 2,4 or /start/,/end/; ! means the lines it does not match.',
    opts: [['-i', 'change the file itself instead of printing the result'], ['-n', 'print only the lines a p prints: sed -n 2p (line 2), sed -n 2,4p, sed -n /error/p'], ['-e SCRIPT', 'add a command (several -e run one after another)'], ['-E', 'extended regular expressions: + ? | ( ) without backslashes']],
    ex: ["sed 's/colour/color/g' essay.txt", "sed -i 's/TODO/DONE/' notes.txt", 'sed -n 1,3p long.txt', "sed '/^#/d; s/  */ /g' config.txt", "sed -n '/BEGIN/,/END/p' log.txt"],
    async run(args, io, sh) {
      const fl = dict(), scripts = [], rest = [];
      for (let k = 0; k < args.length; k++) {
        const a = args[k];
        if (a === '--') { rest.push(...args.slice(k + 1)); break; }
        if (a === '-e' || a === '--expression') { if (k + 1 >= args.length) { io.err("sed: option requires an argument -- 'e'\n"); return 1; } scripts.push(args[++k]); continue; }
        if (a.startsWith('--expression=')) { scripts.push(a.slice(13)); continue; }
        if (a === '--quiet' || a === '--silent') { fl.n = true; continue; }
        if (a === '--in-place' || a.startsWith('--in-place=')) { fl.i = true; continue; }
        if (a === '--regexp-extended') { fl.E = true; continue; }
        if (/^-[^-]/.test(a)) { let ok = true; for (let j = 1; j < a.length; j++) { const ch = a[j]; if (ch === 'n' || ch === 'E' || ch === 'r' || ch === 's') fl[ch === 'r' ? 'E' : ch] = true; else if (ch === 'i') { fl.i = true; break; } else if (ch === 'e') { const v = j + 1 < a.length ? a.slice(j + 1) : args[++k]; if (v === undefined) { io.err("sed: option requires an argument -- 'e'\n"); return 1; } scripts.push(v); break; } else { io.err("sed: invalid option -- '" + ch + "'\nUsage: sed [OPTION]... {script-only-if-no-other-script} [input-file]...\n"); ok = false; break; } } if (!ok) return 1; continue; }
        rest.push(a);
      }
      if (!scripts.length) { if (!rest.length) { io.err('Usage: sed [OPTION]... {script-only-if-no-other-script} [input-file]...\n'); return 1; } scripts.push(rest.shift()); }
      let cmds; try { cmds = sedParse(scripts.join('\n'), !!fl.E); } catch (e) { io.err('sed: ' + e.message + '\n'); return 1; }
      const files = await inputs(rest, io, sh, 'sed');
      let exit = files.some((f) => !f) ? 2 : 0, quit = false;
      // one stream over all the files (line numbers and $ run across them), except with -i, where each file is edited on its own
      const groups = fl.i ? files.filter(Boolean).map((f) => [f]) : [files.filter(Boolean)];
      for (const g of groups) {
        if (quit) break;
        for (const c of cmds) c.on = false;
        const all = []; for (const f of g) for (const l of lines(f.text)) all.push(l);
        let out = '';
        for (let n = 1; n <= all.length && !quit; n++) {
          let line = all[n - 1], del = false; const last = n === all.length;
          if ((sh.steps += cmds.length) > LIMITS.steps * 50) { io.err('sed: stopped: the script ran too long\n'); return 1; }
          for (const c of cmds) {
            if (!sedMatch(c, line, n, last)) continue;
            if (c.k === 's') { const r = sedSub(c, line); line = r[0]; if (r[1] && c.print) out += line + '\n'; }
            else if (c.k === 'y') line = [...line].map((ch) => (c.map.has(ch) ? c.map.get(ch) : ch)).join('');
            else if (c.k === 'p') out += line + '\n';
            else if (c.k === '=') out += n + '\n';
            else if (c.k === 'd') { del = true; break; }
            else if (c.k === 'q') { quit = true; break; }
          }
          if (!del && !fl.n) out += line + '\n';
          if (out.length > LIMITS.out) { io.err('sed: the output is too long\n'); return 1; }
        }
        if (fl.i && g[0].name !== '-') sh.fs.write(sh.fs.resolve(g[0].name), out); else io.out(out);
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

  // ----- names, paths and sizes. basename and dirname work on the text of the path, not on the file system, as in coreutils
  const baseOf = (p) => { if (/^\/+$/.test(p)) return '/'; const t = p.replace(/\/+$/, ''); return t.slice(t.lastIndexOf('/') + 1); };
  const dirOf = (p) => { if (/^\/+$/.test(p)) return '/'; const t = p.replace(/\/+$/, ''), k = t.lastIndexOf('/'); if (k < 0) return '.'; const d = t.slice(0, k).replace(/\/+$/, ''); return d === '' ? '/' : d; };
  def('basename', { cat: 'files', use: 'basename path [suffix]', desc: 'Print the last part of a path: basename /home/student/notes.txt prints notes.txt. With a suffix, that is cut off the end too.',
    opts: [['-a', 'every argument is a path'], ['-s SUF', 'cut SUF off each name (and every argument is a path)']], ex: ['basename /home/student/notes.txt', 'basename notes.txt .txt', 'for f in *.txt; do basename "$f" .txt; done'],
    run(args, io) {
      const o = getopts(args, 'as:', io, 'basename'); if (!o) return 1;
      if (!o.args.length) { io.err('basename: missing operand' + TRY('basename')); return 1; }
      const many = o.f.a || o.f.s !== undefined, suf = o.f.s !== undefined ? o.f.s : many ? undefined : o.args[1];
      if (!many && o.args.length > 2) { io.err('basename: extra operand ' + q(o.args[2]) + TRY('basename')); return 1; }
      for (const p of many ? o.args : [o.args[0]]) { let b = baseOf(p); if (suf && b !== suf && b.endsWith(suf)) b = b.slice(0, -suf.length); io.out(b + '\n'); }
      return 0;
    } });
  def('dirname', { cat: 'files', use: 'dirname path...', desc: 'Print a path without its last part: dirname /home/student/notes.txt prints /home/student, and dirname notes.txt prints . (this directory).', ex: ['dirname /home/student/notes.txt', 'dirname notes.txt'],
    run(args, io) { if (!args.length) { io.err('dirname: missing operand' + TRY('dirname')); return 1; } for (const p of args) io.out(dirOf(p) + '\n'); return 0; } });
  def('realpath', { cat: 'files', use: 'realpath [-e] [-m] path...', desc: 'Print the full path of a file, starting from the root: in /home/student, realpath ../x.txt prints /home/x.txt. Every directory on the way must exist.', opts: [['-e', 'the last part must exist too'], ['-m', 'nothing needs to exist']], ex: ['realpath notes.txt', 'realpath ../..'],
    run(args, io, sh) {
      const o = getopts(args, 'em', io, 'realpath'); if (!o) return 1;
      if (!o.args.length) { io.err('realpath: missing operand' + TRY('realpath')); return 1; }
      let exit = 0;
      for (const p of o.args) {
        // walk the path a part at a time, as the real one does: x/../y needs x to be a directory
        const comps = p.split('/'), cur = p.startsWith('/') ? [] : sh.fs.cwd.split('/').filter(Boolean); let bad = null;
        comps.forEach((c, i) => {
          if (bad || c === '' || c === '.') return;
          if (c === '..') { cur.pop(); return; }
          cur.push(c); const a = '/' + cur.join('/'), n = sh.fs.stat(a), last = comps.slice(i + 1).every((x) => x === '' || x === '.');
          if (o.f.m) return;
          if (n && n.t !== 'd' && !last) bad = 'Not a directory'; else if (!n && (!last || o.f.e)) bad = 'No such file or directory';
        });
        if (bad) { io.err('realpath: ' + p + ': ' + bad + '\n'); exit = 1; continue; }
        io.out('/' + cur.join('/') + '\n');
      }
      return exit;
    } });
  // du counts what an ext4 disk would: a file takes whole 4 KB blocks (an empty one none), a directory one block; sizes in KB
  const blocks = (n) => n.t === 'd' ? 4 : Math.ceil(n.d.length / 4096) * 4;
  const humanK = (k) => { if (k === 0) return '0'; const [v, u] = k < 1024 ? [k, 'K'] : [k / 1024, 'M']; return (v < 10 ? (Math.ceil(v * 10) / 10).toFixed(1) : String(Math.ceil(v))) + u; };   // -h rounds up, as du does
  def('du', { cat: 'dirs', use: 'du [-s] [-h] [-a] [path...]', desc: 'Show how much disk space each directory takes, in kilobytes, everything inside it included; the last line is the directory named. A file takes whole blocks of 4 KB.',
    opts: [['-s', 'only the total for each path'], ['-h', 'human-readable sizes: 4.0K, 12K, 1.5M'], ['-a', 'files too, not only directories'], ['-c', 'a grand total at the end']], ex: ['du', 'du -sh notes', 'du -ah projects'],
    run(args, io, sh) {
      const o = getopts(args, 'shac', io, 'du'); if (!o) return 1;
      const show = (k) => o.f.h ? humanK(k) : String(k); let exit = 0, grand = 0;
      for (const p of o.args.length ? o.args : ['.']) {
        const n = sh.fs.stat(sh.fs.resolve(p));
        if (!n) { io.err('du: cannot access ' + q(p) + ': No such file or directory\n'); exit = 1; continue; }
        const go = (node, path, top) => { let k = blocks(node); if (node.t === 'd') for (const c of Object.keys(node.c).sort(nameOrder)) k += go(node.c[c], (path === '/' ? '' : path) + '/' + c, false); if (top || (!o.f.s && (node.t === 'd' || o.f.a))) io.out(show(k) + '\t' + path + '\n'); return k; };
        grand += go(n, p.length > 1 ? p.replace(/\/+$/, '') || '/' : p, true);
      }
      if (o.f.c) io.out(show(grand) + '\ttotal\n');
      return exit;
    } });

  // ----- expr: GNU's grammar, whole numbers of any size (BigInt). Exit status 0 when the result is neither empty nor 0, 1 when it is, 2 for a bad expression
  def('expr', { cat: 'shell', use: 'expr EXPRESSION', desc: 'Work out an expression and print the answer. Each number and operator is a separate word, and * < > | & ( ) need a backslash or quotes so that the shell leaves them alone. $(( )) does arithmetic more easily.',
    opts: [['A + B', 'also - \\* / % on whole numbers'], ['A \\< B', 'also \\<= = != \\>= \\>: 1 if true, 0 if not (numbers compare as numbers, other words as text)'], ['A \\| B', 'A if it is neither empty nor 0, else B; A \\& B: A if both are, else 0'], ['length S', 'the number of characters in S'], ['substr S P N', 'N characters of S from position P (counting from 1)'], ['index S C', 'where the first of the characters C is in S (0: nowhere)'], ['S : RE', 'how many characters at the start of S match the regular expression RE (or what \\( \\) caught)']],
    ex: ['expr 2 + 3', 'expr 7 \\* 6', 'n=$(expr $n + 1)', 'expr length hello', 'expr report.txt : \'\\(.*\\)\\.txt\''],
    run(args, io) {
      if (!args.length) { io.err('expr: missing operand' + TRY('expr')); return 2; }
      let i = 0; const fail = (m) => { const e = new Error(m); e.expr = true; throw e; };
      const isInt = (s) => /^-?\d+$/.test(s), num = (s) => { if (!isInt(s)) fail('non-integer argument'); return BigInt(s); };
      const truthy = (s) => !(s === '' || (isInt(s) && BigInt(s) === 0n));
      const more = (k) => i + k <= args.length;
      const prim = () => {
        if (i >= args.length) fail('syntax error: missing argument after ' + q(args[i - 1]));
        const t = args[i++];
        if (t === '(') { const v = or(); if (args[i] !== ')') fail(i < args.length ? "syntax error: expecting ')' instead of " + q(args[i]) : "syntax error: expecting ')' after " + q(args[i - 1])); i++; return v; }
        if (t === '+' && more(1)) return args[i++];   // + WORD: the word itself, even if it is an operator
        if (t === 'length' && more(1)) return String([...prim()].length);
        if (t === 'index' && more(2)) { const s = prim(), c = prim(); const k = [...s].findIndex((ch) => c.includes(ch)); return String(k + 1); }
        if (t === 'substr' && more(3)) { const s = [...prim()], p = prim(), n = prim(); if (!isInt(p) || !isInt(n) || +p < 1 || +n < 1) return ''; return s.slice(+p - 1, +p - 1 + +n).join(''); }
        if (t === 'match' && more(2)) { const s = prim(); return matchRe(s, prim()); }
        return t;
      };
      // STRING : REGEX, anchored at the start: what \( \) caught, or how many characters matched
      const matchRe = (s, re) => { let r; try { r = new RegExp('^(?:' + posixRegex(re, false) + ')'); } catch (e) { fail('Invalid regular expression'); } const m = s.match(r), group = /\\\(/.test(re); return group ? (m && m[1] !== undefined ? m[1] : '') : String(m ? [...m[0]].length : 0); };
      const colon = () => { let a = prim(); while (args[i] === ':') { i++; a = matchRe(a, prim()); } return a; };
      const mul = () => { let a = colon(); while (['*', '/', '%'].includes(args[i])) { const op = args[i++], b = colon(), x = num(a), y = num(b); if (op !== '*' && y === 0n) fail('division by zero'); a = String(op === '*' ? x * y : op === '/' ? x / y : x % y); } return a; };
      const add = () => { let a = mul(); while (args[i] === '+' || args[i] === '-') { const op = args[i++], b = mul(), x = num(a), y = num(b); a = String(op === '+' ? x + y : x - y); } return a; };
      const cmp = () => { let a = add(); while (['<', '<=', '=', '==', '!=', '>=', '>'].includes(args[i])) { const op = args[i++], b = add(); const c = isInt(a) && isInt(b) ? (BigInt(a) < BigInt(b) ? -1 : BigInt(a) > BigInt(b) ? 1 : 0) : (a < b ? -1 : a > b ? 1 : 0); a = (op === '<' ? c < 0 : op === '<=' ? c <= 0 : op === '=' || op === '==' ? c === 0 : op === '!=' ? c !== 0 : op === '>=' ? c >= 0 : c > 0) ? '1' : '0'; } return a; };
      const and = () => { let a = cmp(); while (args[i] === '&') { i++; const b = cmp(); a = truthy(a) && truthy(b) ? a : '0'; } return a; };
      const or = () => { let a = and(); while (args[i] === '|') { i++; const b = and(); a = truthy(a) ? a : truthy(b) ? b : '0'; } return a; };
      try {
        const v = or(); if (i < args.length) fail('syntax error: unexpected argument ' + q(args[i]));
        io.out(v + '\n'); return truthy(v) ? 0 : 1;
      } catch (e) { if (!e.expr) throw e; io.err('expr: ' + e.message + '\n'); return 2; }
    } });
  def('time', { cat: 'shell', builtin: true, use: 'time command', desc: 'Run a command, then say how long it took: real is the time by the clock (user and sys, the processor\'s time, are shown here as the same and as 0).', opts: [['-p', 'the shorter POSIX format: real 0.12']], ex: ['time ls -R', 'time python slow.py'],
    async run(args, io, sh, ctx) {   // reached through xargs or command only: time is a keyword, and the parser times the whole pipeline
      const posix = args[0] === '-p'; if (posix) args = args.slice(1);
      const t0 = Date.now(), r = args.length ? await sh.exec_words(args, ctx, io) : 0; io.err(timeReport((Date.now() - t0) / 1000, posix)); return r;
    } });
  def('yes', { cat: 'text', use: 'yes [text]', desc: 'Print y (or the text) again and again, for a program that keeps asking questions: yes | rm -i *.tmp. Into a pipe it stops by itself after a megabyte; anywhere else the terminal\'s output limit stops it.', ex: ['yes | head -3', 'yes no | head -2'],
    run(args, io) {
      const line = (args.length ? args.join(' ') : 'y') + '\n', chunk = line.repeat(Math.max(1, Math.floor(65536 / line.length)));
      for (let total = 0; ; total += chunk.length) { if (io.pipe && total >= LIMITS.out / 2) return 0; if (total > LIMITS.out) throw new Stop('output', 1); io.out(chunk); }
    } });

  // ----- more text tools
  def('fold', { cat: 'text', use: 'fold [-w N] [-s] [file...]', desc: 'Break long lines so that none is wider than N columns (80 if not given). A tab counts up to the next multiple of 8.', opts: [['-w N', 'the width'], ['-s', 'break after the last space that fits, not in the middle of a word']], ex: ['fold -w 20 story.txt', 'fold -s -w 40 essay.txt'],
    async run(args, io, sh) {
      const o = getopts(args.map((a) => /^-\d+$/.test(a) ? '-w' + a.slice(1) : a), 'w:sb', io, 'fold'); if (!o) return 1;
      const wv = o.f.w === undefined ? '80' : String(o.f.w), w = parseInt(wv, 10);
      if (!/^\d+$/.test(wv) || w < 1) { io.err('fold: invalid number of columns: ' + q(wv) + (/^\d+$/.test(wv) ? ': Numerical result out of range' : '') + '\n'); return 1; }
      const adv = (c, x) => o.f.b ? x + 1 : c === '\b' ? Math.max(0, x - 1) : c === '\r' ? 0 : c === '\t' ? x + 8 - x % 8 : x + 1;
      let exit = 0;
      for (const f of await inputs(o.args, io, sh, 'fold')) {
        if (!f) { exit = 1; continue; }
        let out = '', buf = '', col = 0;
        for (const c of f.text) {
          if (c === '\n') { out += buf + '\n'; buf = ''; col = 0; continue; }
          for (;;) {   // GNU's way: a character that does not fit ends the line (after the last blank with -s) and is tried again
            const nc = adv(c, col);
            if (nc <= w) { buf += c; col = nc; break; }
            if (o.f.s) { const k = Math.max(buf.lastIndexOf(' '), buf.lastIndexOf('\t')); if (k >= 0) { out += buf.slice(0, k + 1) + '\n'; buf = buf.slice(k + 1); col = 0; for (const ch of buf) col = adv(ch, col); continue; } }
            if (buf === '') { buf = c; col = nc; break; }
            out += buf + '\n'; buf = ''; col = 0;
          }
        }
        io.out(out + buf);
      }
      return exit;
    } });
  const delimList = (s) => { const out = []; for (let i = 0; i < s.length; i++) { if (s[i] === '\\' && i + 1 < s.length) { const c = s[++i]; out.push(c === 't' ? '\t' : c === 'n' ? '\n' : c === '0' ? '' : c); } else out.push(s[i]); } return out.length ? out : ['']; };
  def('paste', { cat: 'text', use: 'paste [-d LIST] [-s] file...', desc: 'Join files side by side: line 1 of each file on one line, with a tab between, then line 2, and so on. - stands for the standard input, and each - takes the next line of it.',
    opts: [['-d LIST', 'the characters to put between instead of a tab, used in turn (\\t is a tab)'], ['-s', 'one file at a time: all its lines joined into one line']], ex: ['paste names.txt scores.txt', 'paste -d , a.txt b.txt', 'seq 6 | paste - - -', 'paste -s -d + nums.txt'],
    async run(args, io, sh) {
      const o = getopts(args, 'd:s', io, 'paste'); if (!o) return 1;
      const delims = o.f.d === undefined ? ['\t'] : delimList(o.f.d), names = o.args.length ? o.args : ['-'];
      // every file is opened before anything is printed, as GNU paste does: a missing one prints only its error
      const srcs = []; let stdin = null;
      for (const n of names) {
        if (n === '-') { if (stdin === null) stdin = { lines: lines(await readAll(io, 'paste')), i: 0 }; srcs.push(stdin); continue; }
        const node = sh.fs.stat(sh.fs.resolve(n)); if (!node || node.t === 'd') { io.err('paste: ' + n + ': ' + (node ? 'Is a directory' : 'No such file or directory') + '\n'); return 1; }
        srcs.push({ lines: lines(node.d), i: 0 });
      }
      if (o.f.s) { for (const s of srcs) { let line = ''; s.lines.forEach((l, k) => { line += (k ? delims[(k - 1) % delims.length] : '') + l; }); io.out(line + '\n'); } return 0; }
      for (;;) {
        let any = false, line = '';
        srcs.forEach((s, k) => { const l = s.i < s.lines.length ? s.lines[s.i++] : undefined; if (l !== undefined) any = true; line += (k ? delims[(k - 1) % delims.length] : '') + (l === undefined ? '' : l); });
        if (!any) break; io.out(line + '\n');
      }
      return 0;
    } });
  def('comm', { cat: 'text', use: 'comm [-1] [-2] [-3] file1 file2', desc: 'Compare two sorted files line by line, in three columns: lines only in file1, lines only in file2 (after a tab), lines in both (after two tabs). Sort the files first.',
    opts: [['-1', 'hide the lines only in file1'], ['-2', 'hide the lines only in file2'], ['-3', 'hide the lines in both: comm -12 shows only those']], ex: ['comm a.txt b.txt', 'comm -12 a.txt b.txt', 'comm -3 old.txt new.txt'],
    async run(args, io, sh) {
      const o = getopts(args, '123', io, 'comm'); if (!o) return 1;
      if (o.args.length < 2) { io.err((o.args.length ? 'comm: missing operand after ' + q(o.args[0]) : 'comm: missing operand') + TRY('comm')); return 1; }
      if (o.args.length > 2) { io.err('comm: extra operand ' + q(o.args[2]) + TRY('comm')); return 1; }
      const fl = await inputs(o.args, io, sh, 'comm'), fa = fl[0]; if (!fa) return 1; const fb = fl[1]; if (!fb) return 1;
      const A = lines(fa.text), B = lines(fb.text), col2 = o.f[1] ? '' : '\t', col3 = col2 + (o.f[2] ? '' : '\t');
      const told = [false, false]; let unsorted = false;
      const order = (L, k, w) => { if (k > 0 && L[k - 1] > L[k] && !told[w]) { told[w] = true; unsorted = true; io.err('comm: file ' + (w + 1) + ' is not in sorted order\n'); } };
      for (let i = 0, j = 0; i < A.length || j < B.length;) {
        const c = i >= A.length ? 1 : j >= B.length ? -1 : A[i] < B[j] ? -1 : A[i] > B[j] ? 1 : 0;
        if (c < 0) { order(A, i, 0); if (!o.f[1]) io.out(A[i] + '\n'); i++; }
        else if (c > 0) { order(B, j, 1); if (!o.f[2]) io.out(col2 + B[j] + '\n'); j++; }
        else { order(A, i, 0); order(B, j, 1); if (!o.f[3]) io.out(col3 + A[i] + '\n'); i++; j++; }
      }
      if (unsorted) { io.err('comm: input is not in sorted order\n'); return 1; }
      return 0;
    } });
  def('column', { cat: 'text', use: 'column -t [-s SEP] [-o SEP] [file...]', desc: 'Line words up into a table (-t): each column as wide as its widest entry, with two spaces between. Empty lines are left out.',
    opts: [['-t', 'make a table (the only mode here)'], ['-s SEP', 'the characters that separate the columns in the input (spaces and tabs if not given)'], ['-o SEP', 'what goes between the columns (two spaces if not given)']], ex: ['column -t -s , grades.csv', 'ls -l | column -t'],
    async run(args, io, sh) {
      const o = getopts(args, 'ts:o:', io, 'column'); if (!o) return 1;
      if (!o.f.t) { io.err('column: only column -t (a table) is available in this practice shell\n'); return 1; }
      const rows = [], sep = o.f.o === undefined ? '  ' : o.f.o; let exit = 0;
      const split = o.f.s !== undefined ? (l) => l.split(new RegExp('[' + o.f.s.replace(/[\\\]^-]/g, '\\$&') + ']+')) : (l) => l.trim().split(/[ \t]+/);
      for (const f of await inputs(o.args, io, sh, 'column')) { if (!f) { exit = 1; continue; } for (const l of lines(f.text)) if (l.trim()) rows.push(split(l)); }
      const widths = []; for (const r of rows) r.forEach((c, k) => { widths[k] = Math.max(widths[k] || 0, c.length); });
      for (const r of rows) io.out(r.map((c, k) => k < r.length - 1 ? padR(c, widths[k]) : c).join(sep) + '\n');
      return exit;
    } });

  // ----- checksums, worked out here in plain JavaScript (a worker has no crypto to lean on), over the UTF-8 bytes of the text
  const utf8 = (s) => { const b = []; for (const ch of s) { const c = ch.codePointAt(0); if (c < 0x80) b.push(c); else if (c < 0x800) b.push(0xc0 | c >> 6, 0x80 | c & 63); else if (c < 0x10000) b.push(0xe0 | c >> 12, 0x80 | c >> 6 & 63, 0x80 | c & 63); else b.push(0xf0 | c >> 18, 0x80 | c >> 12 & 63, 0x80 | c >> 6 & 63, 0x80 | c & 63); } return b; };
  const padMsg = (bytes, little) => { const n = bytes.length, len = ((n + 8) >> 6 << 6) + 64, m = new Uint8Array(len); m.set(bytes); m[n] = 0x80; const bits = n * 8; for (let k = 0; k < 8; k++) m[little ? len - 8 + k : len - 1 - k] = Math.floor(bits / Math.pow(2, 8 * k)) & 255; return m; };
  const PRIMES = []; for (let n = 2; PRIMES.length < 64; n++) if (PRIMES.every((p) => n % p)) PRIMES.push(n);
  const frac32 = (x) => Math.floor((x - Math.floor(x)) * 4294967296) | 0;
  const SHA_K = PRIMES.map((p) => frac32(Math.cbrt(p))), SHA_H = PRIMES.slice(0, 8).map((p) => frac32(Math.sqrt(p)));
  function sha256(bytes) {
    const m = padMsg(bytes, false), W = new Int32Array(64), H = SHA_H.slice();
    const ror = (x, s) => x >>> s | x << (32 - s);
    for (let off = 0; off < m.length; off += 64) {
      for (let t = 0; t < 16; t++) W[t] = m[off + 4 * t] << 24 | m[off + 4 * t + 1] << 16 | m[off + 4 * t + 2] << 8 | m[off + 4 * t + 3];
      for (let t = 16; t < 64; t++) { const x = W[t - 15], y = W[t - 2]; W[t] = W[t - 16] + (ror(x, 7) ^ ror(x, 18) ^ x >>> 3) + W[t - 7] + (ror(y, 17) ^ ror(y, 19) ^ y >>> 10) | 0; }
      let [a, b, c, d, e, f, g, h] = H;
      for (let t = 0; t < 64; t++) {
        const t1 = h + (ror(e, 6) ^ ror(e, 11) ^ ror(e, 25)) + (e & f ^ ~e & g) + SHA_K[t] + W[t] | 0, t2 = (ror(a, 2) ^ ror(a, 13) ^ ror(a, 22)) + (a & b ^ a & c ^ b & c) | 0;
        h = g; g = f; f = e; e = d + t1 | 0; d = c; c = b; b = a; a = t1 + t2 | 0;
      }
      [a, b, c, d, e, f, g, h].forEach((v, k) => { H[k] = H[k] + v | 0; });
    }
    return H.map((x) => (x >>> 0).toString(16).padStart(8, '0')).join('');
  }
  const MD5_K = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) | 0), MD5_S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
  function md5(bytes) {
    const m = padMsg(bytes, true), H = [0x67452301, 0xefcdab89 | 0, 0x98badcfe | 0, 0x10325476];
    for (let off = 0; off < m.length; off += 64) {
      const M = []; for (let t = 0; t < 16; t++) M[t] = m[off + 4 * t] | m[off + 4 * t + 1] << 8 | m[off + 4 * t + 2] << 16 | m[off + 4 * t + 3] << 24;
      let [A, B, C, D] = H;
      for (let i = 0; i < 64; i++) {
        const r = i >> 4, F = r === 0 ? B & C | ~B & D : r === 1 ? D & B | ~D & C : r === 2 ? B ^ C ^ D : C ^ (B | ~D), g = r === 0 ? i : r === 1 ? (5 * i + 1) % 16 : r === 2 ? (3 * i + 5) % 16 : 7 * i % 16;
        const x = F + A + MD5_K[i] + M[g] | 0, s = MD5_S[r * 4 + i % 4];
        A = D; D = C; C = B; B = B + (x << s | x >>> (32 - s)) | 0;
      }
      H[0] = H[0] + A | 0; H[1] = H[1] + B | 0; H[2] = H[2] + C | 0; H[3] = H[3] + D | 0;
    }
    return H.map((x) => [0, 8, 16, 24].map((s) => (x >>> s & 255).toString(16).padStart(2, '0')).join('')).join('');
  }
  def('sha256sum md5sum', { cat: 'text', use: 'sha256sum [file...]', desc: 'Print a checksum of each file: a long number that changes completely if even one character of the file changes, so two files with the same sum are (almost certainly) the same. md5sum is an older, shorter kind.',
    ex: ['sha256sum notes.txt', 'md5sum *.txt', 'echo hello | sha256sum'],
    async run(args, io, sh) {
      const o = getopts(args, 'bt', io, this.name); if (!o) return 1;
      let exit = 0;
      for (const f of await inputs(o.args, io, sh, this.name)) { if (!f) { exit = 1; continue; } io.out((this.name === 'md5sum' ? md5 : sha256)(utf8(f.text)) + '  ' + f.name + '\n'); }
      return exit;
    } });

  /* ---------------- awk: a useful part of the language ----------------
     Patterns (/re/, expressions, ranges p1, p2, BEGIN, END), print (commas put OFS between; > and >> write a file), printf, if/else, while,
     do, for (;;), for (k in a), break, continue, next, nextfile, exit, delete; $0 $1 ... NF NR FNR FS OFS ORS RS FILENAME SUBSEP RSTART
     RLENGTH CONVFMT OFMT ENVIRON; arithmetic, concatenation, comparisons (as numbers when both sides look like numbers, else as text), ~ !~,
     && || !, ?:, in, associative arrays; length substr index split sub gsub match sprintf tolower toupper int sqrt exp log sin cos atan2 rand
     srand. Refused with a message: functions of your own, getline, print | "command", system(). Output follows mawk, the awk on Debian. */
  function AwkErr(msg) { this.message = msg; }
  const AWK_KW = ['BEGIN', 'END', 'function', 'func', 'if', 'else', 'while', 'for', 'do', 'break', 'continue', 'next', 'nextfile', 'exit', 'return', 'delete', 'in', 'getline', 'print', 'printf'];
  // each builtin with its smallest and largest number of arguments
  const AWK_FN = { length: [0, 1], substr: [2, 3], index: [2, 2], split: [2, 3], sub: [2, 3], gsub: [2, 3], match: [2, 2], sprintf: [1, 99], sin: [1, 1], cos: [1, 1], atan2: [2, 2], exp: [1, 1], log: [1, 1], sqrt: [1, 1], int: [1, 1], rand: [0, 0], srand: [0, 1], tolower: [1, 1], toupper: [1, 1], system: [1, 1], close: [1, 2], fflush: [0, 1] };
  const awkUnesc = (s) => s.replace(/\\([0-7]{1,3}|.)/g, (m, c) => /^[0-7]/.test(c) ? String.fromCharCode(parseInt(c, 8)) : ({ n: '\n', t: '\t', r: '\r', '\\': '\\', '"': '"', '/': '/', a: '\u0007', b: '\b', f: '\f', v: '\v' })[c] || m);
  function awkLex(src) {
    const toks = []; let i = 0, line = 1;
    const err = (m) => { throw new AwkErr('line ' + line + ': ' + m); };
    const operand = () => { const t = toks[toks.length - 1]; return !!t && (['num', 'str', 'ere', 'name'].includes(t.t) || (t.t === 'fn' && t.v === 'length') || (t.t === 'op' && [')', ']', '++', '--'].includes(t.v))); };   // then / divides
    while (i < src.length) {
      const c = src[i], push = (t) => { t.line = line; t.sp = i > 0 && /[ \t]/.test(src[i - 1]); toks.push(t); };
      if (c === ' ' || c === '\t' || c === '\r') { i++; continue; }
      if (c === '\\' && src[i + 1] === '\n') { i += 2; line++; continue; }
      if (c === '#') { while (i < src.length && src[i] !== '\n') i++; continue; }
      if (c === '\n') { push({ t: 'nl' }); line++; i++; continue; }
      const rest = src.slice(i);
      let m = rest.match(/^(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/);
      if (m) { push({ t: 'num', v: parseFloat(m[0]), raw: m[0] }); i += m[0].length; continue; }
      if ((m = rest.match(/^[A-Za-z_][A-Za-z0-9_]*/))) { const w = m[0]; push({ t: AWK_KW.includes(w) ? 'kw' : has(AWK_FN, w) ? 'fn' : 'name', v: w, raw: w }); i += w.length; continue; }
      if (c === '"') {
        let j = i + 1, s = '';
        for (; j < src.length && src[j] !== '"'; j++) { if (src[j] === '\n') err('runaway string constant "' + s.slice(0, 10) + ' ...'); if (src[j] === '\\' && j + 1 < src.length) { s += src[j] + src[j + 1]; j++; } else s += src[j]; }
        if (j >= src.length) err('runaway string constant "' + s.slice(0, 10) + ' ...');
        push({ t: 'str', v: awkUnesc(s), raw: '"' + s + '"' }); i = j + 1; continue;
      }
      if (c === '/' && !operand()) {   // a regular expression, not a division: /.../ with \/ for a slash; [...] may hold a /
        let j = i + 1, s = '', br = false;
        for (; j < src.length; j++) { const d = src[j]; if (d === '\n') err('runaway regular expression /' + s.slice(0, 10) + ' ...'); if (d === '\\' && j + 1 < src.length) { s += src[j + 1] === '/' ? '/' : d + src[j + 1]; j++; continue; } if (d === '[') br = true; else if (d === ']') br = false; else if (d === '/' && !br) break; s += d; }
        if (j >= src.length) err('runaway regular expression /' + s.slice(0, 10) + ' ...');
        push({ t: 'ere', v: s, raw: '/' + s + '/' }); i = j + 1; continue;
      }
      if ((m = rest.match(/^(?:\*\*=|\*\*|[-+*\/%^!=<>]=|\+\+|--|&&|\|\||>>|!~|[-+*\/%^!<>=?:~${}()[\];,|])/))) { const v = m[0] === '**' ? '^' : m[0] === '**=' ? '^=' : m[0]; push({ t: 'op', v, raw: m[0] }); i += m[0].length; continue; }
      err('syntax error at or near ' + c);
    }
    toks.push({ t: 'eof', line });
    return toks;
  }
  function awkParse(src) {
    const toks = awkLex(src); let p = 0, noGt = 0, loops = 0;
    const peek = () => toks[p], isOp = (v) => toks[p].t === 'op' && toks[p].v === v, isKw = (v) => toks[p].t === 'kw' && toks[p].v === v;
    const syntax = () => { const t = toks[p]; throw new AwkErr('line ' + t.line + ': syntax error at or near ' + (t.t === 'eof' ? 'end of file' : t.t === 'nl' ? 'end of line' : t.raw)); };
    const refuse = (what) => { throw new AwkErr('line ' + toks[p].line + ': ' + what + ' not available in this practice awk'); };
    const expect = (v) => { if (!isOp(v)) syntax(); p++; };
    const nl = () => { while (toks[p].t === 'nl') p++; };
    const terms = () => { while (toks[p].t === 'nl' || isOp(';')) p++; };
    const isLv = (n) => n.k === 'var' || n.k === 'index' || n.k === 'field';
    const ASSIGN = ['=', '+=', '-=', '*=', '/=', '%=', '^='];
    const expr = () => { const left = ternary(); if (toks[p].t === 'op' && ASSIGN.includes(toks[p].v)) { if (!isLv(left)) syntax(); const op = toks[p++].v; nl(); return { k: 'assign', op, lv: left, e: expr() }; } return left; };
    const ternary = () => { const c = or(); if (!isOp('?')) return c; p++; nl(); const a = expr(); nl(); expect(':'); nl(); return { k: 'cond', c, a, b: expr() }; };
    const or = () => { let l = and(); while (isOp('||')) { p++; nl(); l = { k: 'or', l, r: and() }; } return l; };
    const and = () => { let l = inop(); while (isOp('&&')) { p++; nl(); l = { k: 'and', l, r: inop() }; } return l; };
    const inop = () => { let l = match(); while (isKw('in')) { p++; if (toks[p].t !== 'name') syntax(); l = { k: 'in', idx: l.k === 'list' ? l.list : [l], a: toks[p++].v }; } return l; };
    const match = () => { let l = rel(); while (isOp('~') || isOp('!~')) { const neg = toks[p++].v === '!~'; l = { k: 'match', l, r: rel(), neg }; } return l; };
    const rel = () => { const l = concat(); const t = toks[p]; if (t.t === 'op' && ['<', '<=', '==', '!=', '>=', '>'].includes(t.v) && !(noGt && t.v === '>')) { p++; return { k: 'cmp', op: t.v, l, r: concat() }; } return l; };
    const startsCat = () => { const t = toks[p]; return ['num', 'str', 'ere', 'name', 'fn'].includes(t.t) || (t.t === 'op' && (t.v === '$' || t.v === '(')) || (t.t === 'kw' && t.v === 'getline'); };
    const concat = () => { let l = additive(); while (startsCat()) l = { k: 'cat', l, r: additive() }; return l; };
    const additive = () => { let l = mul(); while (isOp('+') || isOp('-')) { const op = toks[p++].v; l = { k: 'bin', op, l, r: mul() }; } return l; };
    const mul = () => { let l = unary(); while (isOp('*') || isOp('/') || isOp('%')) { const op = toks[p++].v; l = { k: 'bin', op, l, r: unary() }; } return l; };
    const unary = () => { if (isOp('!')) { p++; return { k: 'not', e: unary() }; } if (isOp('-')) { p++; return { k: 'neg', e: unary() }; } if (isOp('+')) { p++; return { k: 'pos', e: unary() }; } return pow(); };
    const pow = () => { const b = post(); if (!isOp('^')) return b; p++; return { k: 'bin', op: '^', l: b, r: isOp('-') || isOp('+') || isOp('!') ? unary() : pow() }; };
    const post = () => {
      if (isOp('++') || isOp('--')) { const op = toks[p++].v, lv = post(); if (!isLv(lv)) syntax(); return { k: 'pre', op, lv }; }
      const e = primary();
      if ((isOp('++') || isOp('--')) && isLv(e)) return { k: 'post', op: toks[p++].v, lv: e };
      return e;
    };
    const inner = (fn) => { const keep = noGt; noGt = 0; try { return fn(); } finally { noGt = keep; } };   // inside ( ) and [ ], > compares again
    const list = (close) => { const out = [expr()]; while (isOp(',')) { p++; nl(); out.push(expr()); } expect(close); return out; };
    const primary = () => {
      const t = toks[p];
      if (t.t === 'num') { p++; return { k: 'num', v: t.v }; }
      if (t.t === 'str') { p++; return { k: 'str', v: t.v }; }
      if (t.t === 'ere') { p++; return { k: 'ere', re: t.v }; }
      if (isOp('$')) { p++; if (isOp('++') || isOp('--')) return { k: 'field', e: post() }; if (isOp('-')) { p++; return { k: 'field', e: { k: 'neg', e: primary() } }; } return { k: 'field', e: primary() }; }
      if (isOp('(')) { p++; const l = inner(() => list(')')); return l.length > 1 ? { k: 'list', list: l } : { k: 'group', e: l[0] }; }
      if (t.t === 'fn') {
        p++; if (t.v === 'system') refuse('system() is');
        let args = [];
        if (isOp('(')) { p++; args = isOp(')') ? (p++, []) : inner(() => list(')')); } else if (t.v !== 'length') syntax();
        const [lo, hi] = AWK_FN[t.v]; if (args.length < lo || args.length > hi) throw new AwkErr('line ' + t.line + ': wrong number of arguments in call to ' + t.v);
        if (t.v === 'split' && args[1].k !== 'var' || (t.v === 'sub' || t.v === 'gsub') && args[2] && !isLv(args[2])) syntax();
        return { k: 'call', name: t.v, args };
      }
      if (t.t === 'name') {
        p++;
        if (isOp('(') && !toks[p].sp) refuse('functions of your own are');
        if (isOp('[')) { p++; return { k: 'index', a: t.v, idx: inner(() => list(']')) }; }
        return { k: 'var', name: t.v };
      }
      if (isKw('getline')) refuse('getline is');
      syntax();
    };
    const endsPrint = () => { const t = toks[p]; return t.t === 'nl' || t.t === 'eof' || (t.t === 'op' && [';', '}', '>', '>>', '|'].includes(t.v)); };
    const endSimple = () => { if (isOp(';') || toks[p].t === 'nl') { p++; return; } if (isOp('}') || toks[p].t === 'eof') return; syntax(); };
    const simple = () => {
      if (isKw('print') || isKw('printf')) {
        const kind = toks[p++].v; let args = [];
        if (isOp('(')) {   // print (a, b) > "f": the brackets hold the list, unless more of an expression follows them
          const save = p; p++; const l = inner(() => list(')'));
          if (endsPrint()) args = l; else { p = save; noGt++; args = (() => { const out = [expr()]; while (isOp(',')) { p++; nl(); out.push(expr()); } return out; })(); noGt--; }
        } else if (!endsPrint()) { noGt++; args = [expr()]; while (isOp(',')) { p++; nl(); args.push(expr()); } noGt--; }
        let redir = null;
        if (isOp('>') || isOp('>>')) { const op = toks[p++].v; noGt++; redir = { op, target: ternary() }; noGt--; }
        else if (isOp('|')) refuse('print | "command" is');
        if (kind === 'printf' && !args.length) syntax();
        return { k: kind, args, redir };
      }
      if (isKw('next') || isKw('nextfile')) return { k: toks[p++].v };
      if (isKw('exit')) { p++; const t = toks[p]; return { k: 'exit', e: t.t === 'nl' || t.t === 'eof' || isOp(';') || isOp('}') ? null : expr() }; }
      if (isKw('break') || isKw('continue')) { if (!loops) throw new AwkErr('line ' + toks[p].line + ': ' + toks[p].v + ' statement outside of loop'); return { k: toks[p++].v }; }
      if (isKw('return')) refuse('return (functions of your own) is');
      if (isKw('delete')) { p++; if (toks[p].t !== 'name') syntax(); const a = toks[p++].v; if (isOp('[')) { p++; return { k: 'delete', a, idx: inner(() => list(']')) }; } return { k: 'delete', a }; }
      if (isKw('getline')) refuse('getline is');
      return { k: 'expr', e: expr() };
    };
    const body = () => { loops++; try { if (isOp(';')) { p++; return { k: 'block', list: [] }; } nl(); return stmt(); } finally { loops--; } };
    const stmt = () => {
      if (isOp('{')) return block();
      if (isKw('if')) {
        p++; expect('('); const c = inner(expr); expect(')'); nl(); const a = isOp(';') ? (p++, { k: 'block', list: [] }) : stmt();
        const save = p; terms(); if (isKw('else')) { p++; nl(); return { k: 'if', c, a, b: stmt() }; } p = save; return { k: 'if', c, a };
      }
      if (isKw('while')) { p++; expect('('); const c = inner(expr); expect(')'); return { k: 'while', c, body: body() }; }
      if (isKw('do')) { p++; loops++; nl(); const b = stmt(); loops--; terms(); if (!isKw('while')) syntax(); p++; expect('('); const c = inner(expr); expect(')'); endSimple(); return { k: 'do', body: b, c }; }
      if (isKw('for')) {
        p++; expect('(');
        const t = toks;
        if (t[p].t === 'name' && t[p + 1].t === 'kw' && t[p + 1].v === 'in' && t[p + 2].t === 'name' && t[p + 3].t === 'op' && t[p + 3].v === ')') { const v = t[p].v, a = t[p + 2].v; p += 4; return { k: 'forin', v, a, body: body() }; }
        const init = isOp(';') ? null : inner(simple); expect(';'); nl(); const c = isOp(';') ? null : inner(expr); expect(';'); nl(); const step = isOp(')') ? null : inner(simple); expect(')');
        return { k: 'for', init, c, step, body: body() };
      }
      if (isOp(';')) { p++; return { k: 'block', list: [] }; }
      const s = simple(); endSimple(); return s;
    };
    const block = () => { expect('{'); const out = []; for (;;) { terms(); if (isOp('}')) { p++; break; } if (toks[p].t === 'eof') throw new AwkErr('line ' + (toks[p].line + (src.endsWith('\n') ? 0 : 1)) + ': missing } near end of file'); out.push(stmt()); } return { k: 'block', list: out }; };
    const prog = { begin: [], main: [], end: [] };
    for (;;) {
      terms(); if (toks[p].t === 'eof') break;
      if (isKw('function') || isKw('func')) refuse('functions of your own are');
      if (isKw('BEGIN') || isKw('END')) { const which = toks[p++].v === 'BEGIN' ? prog.begin : prog.end; nl(); if (!isOp('{')) syntax(); which.push(block()); continue; }
      let pat = null, pat2 = null;
      if (!isOp('{')) { pat = expr(); if (isOp(',')) { p++; nl(); pat2 = expr(); } }
      const b = isOp('{') ? block() : null;
      if (!b && !(toks[p].t === 'nl' || toks[p].t === 'eof' || isOp(';'))) syntax();
      prog.main.push({ pat, pat2, body: b, on: false });
    }
    return prog;
  }
  // C's printf for awk: %d %i %o %x %X %u %c %s %e %E %f %F %g %G %%, with - + space # 0, widths and precisions (and *)
  function awkFormat(fmt, vals, toNum, toStr) {
    let out = '', k = 0;
    const next = () => k < vals.length ? vals[k++] : '';
    const pad = (sign, body, width, flags, zeroOk) => { const all = sign + body; if (width <= all.length) return all; if (flags.includes('-')) return all + ' '.repeat(width - all.length); if (flags.includes('0') && zeroOk) return sign + '0'.repeat(width - all.length) + body; return ' '.repeat(width - all.length) + all; };
    const fixed = (a, prec) => { const sc = a * Math.pow(10, prec); if (Number.isInteger(sc * 2) && !Number.isInteger(sc) && Math.abs(sc) < 4e15) { const f = Math.floor(sc); return ((f % 2 === 0 ? f : f + 1) / Math.pow(10, prec)).toFixed(prec); } return a.toFixed(prec); };   // a tie rounds to even, as C does
    const expo = (a, prec) => a.toExponential(prec).replace(/e([+-])(\d)$/, 'e$10$2');
    for (let i = 0; i < fmt.length; i++) {
      if (fmt[i] !== '%') { out += fmt[i]; continue; }
      const m = fmt.slice(i).match(/^%([-+ #0]*)(\*|\d+)?(?:\.(\*|\d*))?([a-zA-Z%])/);
      if (!m) { out += '%'; continue; }
      i += m[0].length - 1;
      let flags = m[1], width = m[2] === '*' ? Math.trunc(toNum(next())) : m[2] ? +m[2] : 0; const prec = m[3] === undefined ? null : m[3] === '*' ? Math.max(0, Math.trunc(toNum(next()))) : +m[3] || 0, conv = m[4];
      if (width < 0) { flags += '-'; width = -width; }
      if (width > LIMITS.vars || prec > LIMITS.vars) throw new AwkErr('a width of ' + Math.max(width, prec) + ' is more than this practice awk allows');
      if (conv === '%') { out += '%'; continue; }
      if (conv === 'c') { const v = next(); const s = typeof v === 'number' || v instanceof Object && 's' in v && /^ *[-+]?[0-9.]+ *$/.test(v.s) ? String.fromCharCode(toNum(v)) : toStr(v).slice(0, 1); out += pad('', s, width, flags.replace('0', ''), false); continue; }
      if (conv === 's') { let s = toStr(next()); if (prec !== null) s = s.slice(0, prec); out += pad('', s, width, flags.replace('0', ''), false); continue; }
      if ('diouxX'.includes(conv)) {
        const v = Math.trunc(toNum(next())), signed = conv === 'd' || conv === 'i';
        let digits = !isFinite(v) ? (v > 0 ? 'inf' : '-inf') : signed ? String(Math.abs(v)) : (v < 0 ? BigInt(v) + (1n << 64n) : BigInt(v)).toString(conv === 'o' ? 8 : conv === 'u' ? 10 : 16);
        if (conv === 'X') digits = digits.toUpperCase();
        if (prec !== null) digits = prec === 0 && v === 0 ? '' : digits.padStart(prec, '0');
        if (flags.includes('#') && conv === 'o' && digits[0] !== '0') digits = '0' + digits;
        const sign = signed && v < 0 ? '-' : signed ? (flags.includes('+') ? '+' : flags.includes(' ') ? ' ' : '') : flags.includes('#') && v !== 0 && (conv === 'x' || conv === 'X') ? '0' + conv : '';
        out += pad(sign, digits, width, flags, prec === null); continue;
      }
      if ('eEfFgG'.includes(conv)) {
        const v = toNum(next()), a = Math.abs(v), P = prec === null ? 6 : prec, lc = conv.toLowerCase(); let body;
        if (!isFinite(v)) body = isNaN(v) ? '-nan' : 'inf';
        else if (lc === 'f') body = fixed(a, P) + (flags.includes('#') && P === 0 ? '.' : '');
        else if (lc === 'e') body = expo(a, P);
        else { const G = P === 0 ? 1 : P, X = a === 0 ? 0 : +expo(a, G - 1).split('e')[1]; body = G > X && X >= -4 ? fixed(a, G - 1 - X) : expo(a, G - 1); if (!flags.includes('#') && body.includes('.')) body = body.replace(/\.?0+(?=e|$)/, ''); }
        if (conv === 'E' || conv === 'G' || conv === 'F') body = body.toUpperCase();
        const sign = v < 0 || Object.is(v, -0) ? '-' : flags.includes('+') ? '+' : flags.includes(' ') ? ' ' : '';
        out += pad(sign, body, width, flags, isFinite(v)); continue;
      }
      out += m[0];   // an unknown conversion is printed as it is
    }
    return out;
  }
  // runs a parsed program. env: { assigns: [[name, value]], fs, operands, read(name) → text or null, stdin() → a promise of the text (read only when the program gets there), out, err, write(name, text, append) → error or null, environ }
  async function awkRun(prog, env) {
    const UNINIT = { uninit: true };
    function StrNum(s) { this.s = s; }   // input text: a number if it looks like one
    const G = dict(), A = dict();   // the variables, the arrays
    let rec = '', F = [], steps = 0, outBytes = 0, elems = 0, exitCode = 0, seed = 0, prevSeed = 0;
    const NEXT = {}, NEXTFILE = {}, EXIT = {}, BRK = {}, CONT = {};
    const looksNum = (s) => /^[ \t\n]*[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?[ \t\n]*$/.test(s);
    const prefixNum = (s) => { const m = s.match(/^[ \t\n]*([-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)/); return m ? parseFloat(m[1]) : 0; };
    const toNum = (v) => typeof v === 'number' ? v : v === UNINIT ? 0 : prefixNum(v instanceof StrNum ? v.s : v);
    const numStr = (n, fmt) => Number.isInteger(n) && Math.abs(n) < 1e16 ? String(n) : isNaN(n) ? '-nan' : !isFinite(n) ? (n > 0 ? 'inf' : '-inf') : awkFormat(fmt, [n], toNum, toStr);
    const toStr = (v, fmt) => typeof v === 'string' ? v : v instanceof StrNum ? v.s : v === UNINIT ? '' : numStr(v, fmt || toStr(getVar('CONVFMT')));
    const numish = (v) => typeof v === 'number' || v === UNINIT || (v instanceof StrNum && looksNum(v.s));
    const truth = (v) => typeof v === 'number' ? v !== 0 : v === UNINIT ? false : v instanceof StrNum ? (looksNum(v.s) ? toNum(v) !== 0 : v.s !== '') : v !== '';
    const compare = (a, b) => { if (numish(a) && numish(b)) { const x = toNum(a), y = toNum(b); return x < y ? -1 : x > y ? 1 : 0; } const x = toStr(a), y = toStr(b); return x < y ? -1 : x > y ? 1 : 0; };
    const step = () => { if (++steps > LIMITS.awk) throw new AwkErr('stopped: the program ran more than ' + LIMITS.awk + ' steps. Is there a loop that never ends?'); };
    const big = (s) => { if (s.length > LIMITS.vars * 4) throw new AwkErr('stopped: a string grew past ' + LIMITS.vars * 4 + ' characters'); return s; };
    const reCache = new Map();
    const re = (src) => { if (reCache.has(src)) return reCache.get(src); let r; try { r = new RegExp(posixRegex(src, true)); } catch (e) { throw new AwkErr('regular expression compile failed (' + e.message.replace(/^Invalid regular expression: /, '') + ')'); } if (reCache.size < 200) reCache.set(src, r); return r; };
    const splitBy = (s, fs) => {
      if (fs instanceof RegExp) return s === '' ? [] : s.split(new RegExp(fs.source, 'g'));
      if (fs === ' ') { const t = s.replace(/^[ \t\n]+|[ \t\n]+$/g, ''); return t === '' ? [] : t.split(/[ \t\n]+/); }
      if (s === '') return [];
      return fs.length === 1 && fs !== '\\' ? s.split(fs) : s.split(new RegExp(re(fs).source, 'g'));
    };
    const setRec = (s) => { rec = big(s); F = splitBy(rec, toStr(getVar('FS'))); };
    const rebuild = () => { rec = big(F.join(toStr(getVar('OFS')))); };
    const getField = (v) => { const i = Math.trunc(toNum(v)); if (i < 0) throw new AwkErr('trying to access out of range field ' + i); return i === 0 ? new StrNum(rec) : i <= F.length ? new StrNum(F[i - 1]) : UNINIT; };
    const setField = (v, x) => { const i = Math.trunc(toNum(v)); if (i < 0) throw new AwkErr('trying to access out of range field ' + i); if (i === 0) { setRec(toStr(x)); return; } if (i > 100000) throw new AwkErr('field $' + i + ' is more than this practice awk allows'); while (F.length < i) F.push(''); F[i - 1] = toStr(x); rebuild(); };
    const getVar = (n) => { if (n === 'NF') return F.length; if (has(A, n)) throw new AwkErr("can't use array " + n + ' in scalar context'); return has(G, n) ? G[n] : UNINIT; };
    const setVar = (n, v) => {
      if (has(A, n)) throw new AwkErr("can't assign to " + n + '; it is an array name.');
      if (n === 'NF') { const k = Math.max(0, Math.trunc(toNum(v))); if (k > 100000) throw new AwkErr('NF set to ' + k + ' is more than this practice awk allows'); F.length = Math.min(F.length, k); while (F.length < k) F.push(''); rebuild(); return; }
      G[n] = typeof v === 'string' ? big(v) : v;
    };
    const arr = (n) => { if (has(G, n)) throw new AwkErr("can't use scalar " + n + ' as array'); if (!has(A, n)) A[n] = dict(); return A[n]; };
    const key = (idx) => idx.map((e) => toStr(ev(e))).join(toStr(getVar('SUBSEP')));
    const arrGet = (n, k) => { const a = arr(n); if (!has(a, k)) { if (++elems > LIMITS.array * 10) throw new AwkErr('stopped: the arrays hold more than ' + LIMITS.array * 10 + ' elements'); a[k] = UNINIT; } return a[k]; };
    const arrSet = (n, k, v) => { const a = arr(n); if (!has(a, k) && ++elems > LIMITS.array * 10) throw new AwkErr('stopped: the arrays hold more than ' + LIMITS.array * 10 + ' elements'); a[k] = typeof v === 'string' ? big(v) : v; };
    const getLv = (lv) => lv.k === 'var' ? getVar(lv.name) : lv.k === 'index' ? arrGet(lv.a, key(lv.idx)) : getField(ev(lv.e));
    const setLv = (lv, v) => { if (lv.k === 'var') setVar(lv.name, v); else if (lv.k === 'index') arrSet(lv.a, key(lv.idx), v); else setField(ev(lv.e), v); };
    const arith = (op, a, b) => { if ((op === '/' || op === '%') && b === 0) throw new AwkErr('division by zero' + (op === '%' ? ' in %' : '')); return op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : op === '/' ? a / b : op === '%' ? a % b : Math.pow(a, b); };
    // sub and gsub: & is what matched, \& a real &; an empty match just after another match does not count, as in awk
    const replace = (s, r, repl, global) => {
      const g = new RegExp(r.source, 'g'); let out = '', i = 0, n = 0, lastEnd = -1;
      const text = (mt) => { let o = ''; for (let k = 0; k < repl.length; k++) { const c = repl[k]; if (c === '\\' && (repl[k + 1] === '&' || repl[k + 1] === '\\')) { o += repl[++k]; continue; } o += c === '&' ? mt : c; } return o; };
      while (i <= s.length) {
        g.lastIndex = i; const m = g.exec(s); if (!m) break;
        if (m[0] === '' && m.index === lastEnd) { if (m.index >= s.length) break; out += s.slice(i, m.index + 1); i = m.index + 1; continue; }
        out += s.slice(i, m.index) + text(m[0]); n++; lastEnd = m.index + m[0].length;
        if (m[0] === '') { if (m.index < s.length) out += s[m.index]; i = m.index + 1; } else i = lastEnd;
        if (!global) break;
      }
      return [big(out + s.slice(i)), n];
    };
    const call = (n) => {
      const a = n.args, rx = (x) => x.k === 'ere' ? re(x.re) : re(toStr(ev(x)));
      switch (n.name) {
        case 'length': if (!a.length) return rec.length; if (a[0].k === 'var' && has(A, a[0].name)) return Object.keys(A[a[0].name]).length; return toStr(ev(a[0])).length;
        case 'substr': { const s = toStr(ev(a[0])), st = Math.round(toNum(ev(a[1]))), end = a[2] ? st + Math.round(toNum(ev(a[2]))) : Infinity, from = Math.max(st, 1), to = Math.min(end, s.length + 1); return to > from ? s.slice(from - 1, to - 1) : ''; }
        case 'index': return toStr(ev(a[0])).indexOf(toStr(ev(a[1]))) + 1;
        case 'split': { const s = toStr(ev(a[0])), fs = a[2] ? (a[2].k === 'ere' ? re(a[2].re) : toStr(ev(a[2]))) : toStr(getVar('FS')), parts = splitBy(s, fs), d = arr(a[1].name); elems -= Object.keys(d).length; for (const k of Object.keys(d)) delete d[k]; parts.forEach((x, k) => arrSet(a[1].name, String(k + 1), new StrNum(x))); return parts.length; }
        case 'sub': case 'gsub': { const r = rx(a[0]), repl = toStr(ev(a[1])), lv = a[2] || { k: 'field', e: { k: 'num', v: 0 } }, [res, cnt] = replace(toStr(getLv(lv)), r, repl, n.name === 'gsub'); if (cnt) setLv(lv, res); return cnt; }
        case 'match': { const s = toStr(ev(a[0])), m = s.match(rx(a[1])); setVar('RSTART', m ? m.index + 1 : 0); setVar('RLENGTH', m ? m[0].length : -1); return m ? m.index + 1 : 0; }
        case 'sprintf': { const v = a.map(ev); return big(awkFormat(toStr(v[0]), v.slice(1), toNum, toStr)); }
        case 'sin': return Math.sin(toNum(ev(a[0]))); case 'cos': return Math.cos(toNum(ev(a[0]))); case 'exp': return Math.exp(toNum(ev(a[0])));
        case 'log': return Math.log(toNum(ev(a[0]))); case 'sqrt': return Math.sqrt(toNum(ev(a[0]))); case 'int': return Math.trunc(toNum(ev(a[0])));
        case 'atan2': return Math.atan2(toNum(ev(a[0])), toNum(ev(a[1])));
        case 'rand': seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648;
        case 'srand': { const old = prevSeed; prevSeed = a.length ? toNum(ev(a[0])) : Math.floor(Date.now() / 1000); seed = Math.abs(Math.trunc(prevSeed)) % 2147483648; return old; }
        case 'tolower': return toStr(ev(a[0])).toLowerCase(); case 'toupper': return toStr(ev(a[0])).toUpperCase();
        default: return 0;   // close, fflush: nothing to do here
      }
    };
    const ev = (n) => {
      switch (n.k) {
        case 'num': case 'str': return n.v;
        case 'ere': return re(n.re).test(rec) ? 1 : 0;
        case 'group': return ev(n.e);
        case 'var': return getVar(n.name);
        case 'index': return arrGet(n.a, key(n.idx));
        case 'field': return getField(ev(n.e));
        case 'assign': { const v = ev(n.e), x = n.op === '=' ? v : arith(n.op[0], toNum(getLv(n.lv)), toNum(v)); setLv(n.lv, x); return x; }
        case 'cond': return truth(ev(n.c)) ? ev(n.a) : ev(n.b);
        case 'or': return truth(ev(n.l)) || truth(ev(n.r)) ? 1 : 0;
        case 'and': return truth(ev(n.l)) && truth(ev(n.r)) ? 1 : 0;
        case 'in': return has(arr(n.a), key(n.idx)) ? 1 : 0;
        case 'match': { const s = toStr(ev(n.l)), r = n.r.k === 'ere' ? re(n.r.re) : re(toStr(ev(n.r))); return r.test(s) !== n.neg ? 1 : 0; }
        case 'cmp': { const c = compare(ev(n.l), ev(n.r)); return (n.op === '<' ? c < 0 : n.op === '<=' ? c <= 0 : n.op === '==' ? c === 0 : n.op === '!=' ? c !== 0 : n.op === '>=' ? c >= 0 : c > 0) ? 1 : 0; }
        case 'cat': { const l = toStr(ev(n.l)); return big(l + toStr(ev(n.r))); }
        case 'bin': { const l = toNum(ev(n.l)); return arith(n.op, l, toNum(ev(n.r))); }
        case 'not': return truth(ev(n.e)) ? 0 : 1;
        case 'neg': return -toNum(ev(n.e));
        case 'pos': return toNum(ev(n.e));
        case 'pre': { const v = toNum(getLv(n.lv)) + (n.op === '++' ? 1 : -1); setLv(n.lv, v); return v; }
        case 'post': { const v = toNum(getLv(n.lv)); setLv(n.lv, v + (n.op === '++' ? 1 : -1)); return v; }
        case 'call': return call(n);
        default: throw new AwkErr('syntax error: a list (a, b) is only allowed before in');
      }
    };
    const files = new Map();
    const write = (redir, text) => {
      if (!redir) { if ((outBytes += text.length) > LIMITS.out) throw new Stop('output', 1); env.out(text); return; }
      const name = toStr(ev(redir.target));
      if (name === '/dev/stdout' || name === '-') { env.out(text); return; } if (name === '/dev/stderr') { env.err(text); return; }
      if (!files.has(name)) files.set(name, { text: '', append: redir.op === '>>' });
      const f = files.get(name); f.text += text; if (f.text.length > LIMITS.fileBytes) throw new Stop('output', 1);
    };
    const loopBody = (b) => { try { run(b); } catch (e) { if (e === BRK) return 'break'; if (e === CONT) return 'continue'; throw e; } return null; };
    const run = (s) => {
      step();
      switch (s.k) {
        case 'block': for (const x of s.list) run(x); return;
        case 'expr': ev(s.e); return;
        case 'print': { const ofmt = toStr(getVar('OFMT')), vals = s.args.length ? s.args.map((e) => toStr(ev(e), ofmt)) : [rec]; write(s.redir, vals.join(toStr(getVar('OFS'))) + toStr(getVar('ORS'))); return; }
        case 'printf': { const v = s.args.map(ev); write(s.redir, big(awkFormat(toStr(v[0]), v.slice(1), toNum, toStr))); return; }
        case 'if': if (truth(ev(s.c))) run(s.a); else if (s.b) run(s.b); return;
        case 'while': while (truth(ev(s.c))) { step(); if (loopBody(s.body) === 'break') break; } return;
        case 'do': do { step(); if (loopBody(s.body) === 'break') break; } while (truth(ev(s.c))); return;
        case 'for': if (s.init) run(s.init); for (;;) { step(); if (s.c && !truth(ev(s.c))) break; if (loopBody(s.body) === 'break') break; if (s.step) run(s.step); } return;
        case 'forin': { const a = arr(s.a); for (const k of Object.keys(a)) { if (!has(a, k)) continue; step(); setVar(s.v, new StrNum(k)); if (loopBody(s.body) === 'break') break; } return; }
        case 'next': throw NEXT; case 'nextfile': throw NEXTFILE;
        case 'exit': if (s.e) exitCode = Math.trunc(toNum(ev(s.e))) & 255; throw EXIT;
        case 'break': throw BRK; case 'continue': throw CONT;
        case 'delete': { const a = arr(s.a); if (!s.idx) { elems -= Object.keys(a).length; for (const k of Object.keys(a)) delete a[k]; } else { const k = key(s.idx); if (has(a, k)) { elems--; delete a[k]; } } return; }
      }
    };
    const records = (text) => {
      const rs = toStr(getVar('RS'));
      if (rs === '\n') return lines(text);
      if (rs === '') return text.replace(/^\n+/, '').replace(/\n+$/, '').split(/\n\n+/).filter((r, k, all) => r !== '' || all.length > 1);   // paragraph mode
      const parts = text.split(rs.length === 1 ? rs : new RegExp(re(rs).source)); if (parts.length && parts[parts.length - 1] === '') parts.pop(); return parts;
    };
    const fileOf = (name, text) => {
      G.FILENAME = name; G.FNR = 0;
      for (const r of records(text)) {
        G.NR = toNum(G.NR) + 1; G.FNR = toNum(G.FNR) + 1; setRec(r);
        try {
          for (const it of prog.main) {
            let hit;
            if (!it.pat) hit = true;
            else if (!it.pat2) hit = truth(ev(it.pat));
            else if (it.on) { hit = true; if (truth(ev(it.pat2))) it.on = false; }
            else if (truth(ev(it.pat))) { hit = true; it.on = !truth(ev(it.pat2)); }
            if (!hit) continue;
            if (it.body) run(it.body); else write(null, rec + toStr(getVar('ORS')));
          }
        } catch (e) { if (e === NEXT) continue; if (e === NEXTFILE) return; throw e; }
      }
    };
    Object.assign(G, { FS: ' ', OFS: ' ', ORS: '\n', RS: '\n', NR: 0, FNR: 0, SUBSEP: '\u001c', CONVFMT: '%.6g', OFMT: '%.6g', RSTART: 0, RLENGTH: -1, FILENAME: '' });
    A.ENVIRON = dict(); for (const k of Object.keys(env.environ || {})) A.ENVIRON[k] = new StrNum(String(env.environ[k]));
    A.ARGV = dict(); A.ARGV[0] = 'awk'; env.operands.forEach((o, k) => { A.ARGV[k + 1] = new StrNum(o); }); G.ARGC = env.operands.length + 1;
    try {
      if (env.fs !== null) G.FS = awkUnesc(env.fs) === 't' ? '\t' : awkUnesc(env.fs);
      for (const [k, v] of env.assigns) setVar(k, new StrNum(awkUnesc(v)));
      let done = false;
      try { for (const b of prog.begin) run(b); } catch (e) { if (e !== EXIT) throw e === NEXT || e === NEXTFILE ? new AwkErr('next used in a BEGIN action') : e; done = true; }
      if (!done && (prog.main.length || prog.end.length)) {
        try {
          let any = false;
          for (const o of env.operands) {
            const m = o.match(/^([A-Za-z_][A-Za-z0-9_]*)=([^]*)$/);
            if (m) { setVar(m[1], new StrNum(awkUnesc(m[2]))); continue; }
            any = true;
            const text = o === '-' ? await env.stdin() : env.read(o); if (text === null) throw new AwkErr('cannot open "' + o + '" (No such file or directory)');
            fileOf(o === '-' ? '-' : o, text);
          }
          if (!any) fileOf('', await env.stdin());
        } catch (e) { if (e !== EXIT) throw e; done = true; }
      }
      try { for (const b of prog.end) run(b); } catch (e) { if (e !== EXIT) throw e === NEXT || e === NEXTFILE ? new AwkErr('next used in an END action') : e; }
    } catch (e) {
      if (!(e instanceof AwkErr)) throw e;
      env.err('awk: ' + e.message + '\n'); exitCode = 2;
    }
    for (const [name, f] of files) { const msg = env.write(name, f.text, f.append); if (msg) { env.err('awk: cannot open "' + name + '" for output (' + msg + ')\n'); exitCode = 2; } }
    return exitCode;
  }
  def('awk', { cat: 'text', use: "awk [-F SEP] [-v NAME=value] 'program' [file...]", desc: 'A small language for text in columns. The program is pattern { action } pairs: for each line, every action whose pattern matches runs. $1 is the first field, $0 the whole line, NF the number of fields, NR the line number. Here: patterns, BEGIN and END, print, printf, if, while, for, arrays and the usual functions; not functions of your own, getline or pipes.',
    opts: [['-F SEP', 'the field separator (spaces and tabs if not given): -F , for CSV'], ['-v N=V', 'set the variable N to V before the program starts'], ['-f FILE', 'read the program from FILE']],
    ex: ["awk '{ print $1 }' grades.csv", "awk -F , '$2 > 85 { print $1 }' grades.csv", "awk '{ total += $2 } END { print total / NR }' scores.txt", "awk 'NR % 2 == 0' list.txt", "awk '{ n[$1]++ } END { for (w in n) print w, n[w] }' words.txt"],
    async run(args, io, sh) {
      let i = 0, fsArg = null, prog = null; const assigns = [];
      for (; i < args.length; i++) {
        const a = args[i];
        if (a === '--') { i++; break; }
        if (a.startsWith('-F')) { fsArg = a.length > 2 ? a.slice(2) : args[++i]; if (fsArg === undefined) { io.err('awk: option requires an argument -- F\n'); return 2; } continue; }
        if (a.startsWith('-v')) { const v = a.length > 2 ? a.slice(2) : args[++i], m = v !== undefined && v.match(/^([A-Za-z_][A-Za-z0-9_]*)=([^]*)$/); if (!m) { io.err('awk: improper assignment: -v ' + (v || '') + '\n'); return 2; } assigns.push([m[1], m[2]]); continue; }
        if (a === '-f') { const f = args[++i]; if (f === undefined) { io.err('awk: option requires an argument -- f\n'); return 2; } try { prog = (prog || '') + sh.fs.read(sh.fs.resolve(f)) + '\n'; } catch (e) { if (!(e instanceof FsError)) throw e; io.err('awk: cannot open "' + f + '" (No such file or directory)\n'); return 2; } continue; }
        if (a.length > 1 && a[0] === '-') { io.err('awk: not an option: ' + a + '\n'); return 2; }
        break;
      }
      if (prog === null) { if (i >= args.length) { io.err("usage: awk [-F value] [-v var=value] [--] 'program text' [file ...]\n"); return 2; } prog = args[i++]; }
      let ast; try { ast = awkParse(prog); } catch (e) { if (!(e instanceof AwkErr)) throw e; io.err('awk: ' + e.message + '\n'); return 2; }
      const operands = args.slice(i);
      // the standard input is read only when the program gets to it: BEGIN { exit } never waits for the keyboard
      return awkRun(ast, { assigns, fs: fsArg, operands, stdin: () => readAll(io, 'awk'), environ: sh.vars, out: (s) => io.out(s), err: (s) => io.err(s),
        read: (n) => { try { return sh.fs.read(sh.fs.resolve(n)); } catch (e) { if (e instanceof FsError) return null; throw e; } },
        write: (n, text, append) => { try { sh.fs.write(sh.fs.resolve(n), text, append); return null; } catch (e) { if (e instanceof FsError) return e.message; throw e; } } });
    } });

  // ----- text out
  const unescape = (s) => s.replace(/\\(n|t|\\|a|0|e|r|")/g, (m, c) => ({ n: '\n', t: '\t', '\\': '\\', a: '', 0: '', e: '\u001b', r: '\r', '"': '"' })[c]);
  def('echo', { cat: 'shell', builtin: true, use: 'echo [-n] [-e] text...', desc: 'Print its arguments, with a space between them and a newline at the end.', opts: [['-n', 'no newline at the end'], ['-e', 'turn \\n and \\t into a newline and a tab']],
    ex: ['echo Hello, world', 'echo "two  spaces"', 'echo $HOME', 'echo "shopping" > list.txt'],
    run(args, io) { let n = false, e = false; while (args.length && /^-[neE]+$/.test(args[0])) { const a = args.shift(); if (a.includes('n')) n = true; if (a.includes('e')) e = true; if (a.includes('E')) e = false; } let s = args.join(' '); if (e) s = unescape(s); io.out(s + (n ? '' : '\n')); return 0; } });
  def('printf', { cat: 'shell', builtin: true, use: 'printf FORMAT [arguments...]', desc: 'Print with a format, as in C: %s a string, %d a whole number, %5.2f a decimal; \\n is a newline. The format is reused if there are more arguments than it needs.',
    ex: ['printf "%s is %d years old\\n" Ada 36', 'printf "%-10s|%5d|\\n" name 42', 'printf "%.2f\\n" 3.14159'],
    run(args, io, sh, ctx) {
      let into = null;   // printf -v NAME: the text goes into the variable (or NAME[i]) instead
      if (args[0] === '-v') {
        if (args.length < 2) { io.err('bash: printf: -v: option requires an argument\nprintf: usage: printf [-v var] format [arguments]\n'); return 2; }
        into = args[1]; args = args.slice(2);
        if (!/^[A-Za-z_][A-Za-z0-9_]*(\[.+\])?$/.test(into)) { io.err("bash: printf: `" + into + "': not a valid identifier\n"); return 2; }
      }
      if (!args.length) { io.err('printf: usage: printf [-v var] format [arguments]\n'); return 2; }
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
      if (into !== null) { sh.assignTo(into, out, ctx); return 0; }
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
    run(args, io, sh) { if (!args.length) { for (const k of Object.keys(sh.vars).sort()) io.out('declare -x ' + k + '="' + sh.vars[k] + '"\n'); return 0; } for (const a of args) { const m = a.match(/^([A-Za-z_][A-Za-z0-9_]*)(?:=(.*))?$/s); if (!m) { io.err("bash: export: `" + a + "': not a valid identifier\n"); return 1; } sh.exported.add(m[1]); if (m[2] !== undefined) sh.setVar(m[1], m[2]); } return 0; } });
  def('unset', { cat: 'shell', builtin: true, use: 'unset [-f] [-v] NAME...', desc: 'Forget a variable, an array, one element of an array (unset "a[1]"), or with -f a function. Without -f or -v, a name that is no variable is taken as a function.',
    opts: [['-f', 'forget functions'], ['-v', 'forget variables only']], ex: ['unset NAME', 'unset "list[0]"', 'unset -f greet'],
    run(args, io, sh) {
      let mode = '';
      for (const a of args) {
        if (/^-[fv]+$/.test(a)) { mode = a.slice(-1); continue; }
        if (mode === 'f') { delete sh.funcs[a]; continue; }
        const m = a.match(/^([A-Za-z_][A-Za-z0-9_]*)\[(.+)\]$/);
        if (m && sh.isAssoc(m[1])) { sh.arrUnset(sh.arrays[m[1]], m[2]); continue; }   // the key as it is (bash 5.2: m[@] is the key @)
        if (m) { if (m[2] === '@' || m[2] === '*') delete sh.arrays[m[1]]; else if (has(sh.arrays, m[1])) sh.arrUnset(sh.arrays[m[1]], sh.arithOf(m[2], { args: [] })); else if (has(sh.vars, m[1]) && sh.arithOf(m[2], { args: [] }) === 0) delete sh.vars[m[1]]; continue; }
        if (has(sh.vars, a) || has(sh.arrays, a)) { delete sh.vars[a]; delete sh.arrays[a]; } else if (mode !== 'v') delete sh.funcs[a];
      }
      return 0;
    } });
  def('env printenv set', { cat: 'shell', builtin: true, use: 'env', desc: 'List the variables and their values.', ex: ['env', 'printenv HOME'],
    run(args, io, sh, ctx) {
      // set -- a b (or set a b): the positional parameters $1 $2 ... become a b; options such as -e are accepted and ignored here
      if (args.length && this.name === 'set') { let k = 0; while (k < args.length && /^[-+][a-z]+$/.test(args[k])) k++; if (args[k] === '--') k++; else if (k === args.length) return 0; ctx.args.splice(0, ctx.args.length, ...args.slice(k)); return 0; }
      if (args.length && this.name === 'printenv') { let exit = 0; for (const a of args) { const v = sh.getVar(a); if (v === '') exit = 1; else io.out(v + '\n'); } return exit; } for (const k of Object.keys(sh.vars).sort()) io.out(k + '=' + sh.vars[k] + '\n'); io.out('PWD=' + sh.fs.cwd + '\n'); return 0; } });
  def('which', { cat: 'shell', use: 'which command', desc: 'Show where a command lives.', ex: ['which python'], run(args, io) { let exit = 0; for (const a of args) { if (has(COMMANDS, a) && !COMMANDS[a].builtin) io.out('/bin/' + a + '\n'); else exit = 1; } return args.length ? exit : 1; } });
  // what a name is, in the order bash looks: an alias, a keyword, a function, a builtin, a program in /bin
  const whatIs = (sh, a) => has(sh.aliases, a) ? 'alias' : KEYWORDS.includes(a) ? 'keyword' : has(sh.funcs, a) ? 'function' : has(COMMANDS, a) ? (COMMANDS[a].builtin ? 'builtin' : 'file') : null;
  def('type', { cat: 'shell', builtin: true, use: 'type [-t] name...', desc: 'Say what kind of command a name is: an alias, a shell keyword, a function (and its definition), a builtin or a program.', opts: [['-t', 'only the kind: alias, keyword, function, builtin or file']], ex: ['type cd', 'type ls', 'type greet'],
    run(args, io, sh) {
      const t = args[0] === '-t'; if (t) args = args.slice(1);
      let exit = 0;
      for (const a of args) {
        const k = whatIs(sh, a);
        if (!k) { if (!t) io.err('bash: type: ' + a + ': not found\n'); exit = 1; continue; }
        if (t) { io.out(k + '\n'); continue; }
        io.out(k === 'alias' ? a + " is aliased to `" + sh.aliases[a] + "'\n" : k === 'keyword' ? a + ' is a shell keyword\n' : k === 'function' ? a + ' is a function\n' + sh.printFunc(a) + '\n' : k === 'builtin' ? a + ' is a shell builtin\n' : a + ' is /bin/' + a + '\n');
      }
      return exit;
    } });
  def('command', { cat: 'shell', builtin: true, use: 'command [-v] name [arguments]', desc: 'Run a builtin or a program even when a function has the same name. -v says what the name would run.', opts: [['-v', 'print the program\'s path, or the name of a builtin or function']], ex: ['command ls', 'command -v python'],
    run(args, io, sh, ctx) {
      if (args[0] === '-v') { let found = false; for (const a of args.slice(1)) { const k = whatIs(sh, a); if (!k) continue; found = true; io.out(k === 'alias' ? 'alias ' + a + '=' + shq(sh.aliases[a]) + '\n' : k === 'file' ? '/bin/' + a + '\n' : a + '\n'); } return found ? 0 : 1; }
      return args.length ? sh.exec_words(args, ctx, io, true) : 0;
    } });
  // a value in single quotes, as alias and bash's other listings write it: ' becomes '\''
  const shq = (s) => "'" + String(s).replace(/'/g, "'\\''") + "'";
  def('alias', { cat: 'shell', builtin: true, use: "alias [name='command'...]", desc: 'Give a command a short name: after alias ll=\'ls -l\', typing ll runs ls -l. alias alone lists them; unalias forgets one. They last until the terminal is reset (they are not saved).',
    ex: ["alias ll='ls -l'", 'alias', 'unalias ll'],
    run(args, io, sh) {
      if (!args.length) { for (const k of Object.keys(sh.aliases).sort()) io.out('alias ' + k + '=' + shq(sh.aliases[k]) + '\n'); return 0; }
      let exit = 0;
      for (const a of args) {
        const k = a.indexOf('=');
        if (k < 0) { if (has(sh.aliases, a)) io.out('alias ' + a + '=' + shq(sh.aliases[a]) + '\n'); else { io.err('bash: alias: ' + a + ': not found\n'); exit = 1; } continue; }
        const name = a.slice(0, k), val = a.slice(k + 1);
        if (!name || /[\s\/$`='"\\|&;()<>]/.test(name)) { io.err("bash: alias: `" + name + "': invalid alias name\n"); exit = 1; continue; }
        if (!has(sh.aliases, name) && Object.keys(sh.aliases).length >= LIMITS.aliases) { io.err('bash: alias: ' + name + ': this practice shell keeps at most ' + LIMITS.aliases + ' aliases\n'); exit = 1; continue; }
        if (val.length > 1000) { io.err('bash: alias: ' + name + ': the text is too long (at most 1000 characters here)\n'); exit = 1; continue; }
        sh.aliases[name] = val;
      }
      return exit;
    } });
  def('unalias', { cat: 'shell', builtin: true, use: 'unalias [-a] name...', desc: 'Forget an alias (-a: all of them).', ex: ['unalias ll'],
    run(args, io, sh) {
      if (!args.length) { io.err('unalias: usage: unalias [-a] name [name ...]\n'); return 2; }
      let exit = 0;
      for (const a of args) { if (a === '-a') { for (const k of Object.keys(sh.aliases)) delete sh.aliases[k]; continue; } if (has(sh.aliases, a)) delete sh.aliases[a]; else { io.err('bash: unalias: ' + a + ': not found\n'); exit = 1; } }
      return exit;
    } });
  def('local', { cat: 'shell', builtin: true, use: 'local NAME[=value]...', desc: 'Inside a function, make a variable that belongs to the function: whatever the name held before comes back when the function returns.', opts: [['-a', 'the names are arrays']],
    ex: ['greet() { local name=$1; echo "Hello, $name"; }', 'f() { local list=(a b c); echo ${#list[@]}; }'],
    run(args, io, sh, ctx) {
      if (!ctx.fn) { io.err('bash: local: can only be used in a function\n'); return 1; }
      const flags = new Set(); let k = 0;
      for (; k < args.length && /^-[a-zA-Z]+$/.test(args[k]); k++) for (const c of args[k].slice(1)) flags.add(c);
      return declareNames(sh, ctx, io, 'local', args.slice(k), k, flags, true);
    } });
  def('return', { cat: 'shell', builtin: true, use: 'return [n]', desc: 'Leave a function (or a script run with source) with status n: 0 means success. Without n, the status of the last command.', ex: ['is_even() { return $(( $1 % 2 )); }', 'is_even 4 && echo even'],
    run(args, io, sh, ctx) {
      if (!ctx.fn && !ctx.sourced) { io.err("bash: return: can only `return' from a function or sourced script\n"); return 2; }
      if (args.length && !/^[-+]?\d+$/.test(args[0])) { io.err('bash: return: ' + args[0] + ': numeric argument required\n'); throw new Return(2); }
      if (args.length > 1) { io.err('bash: return: too many arguments\n'); return 1; }
      throw new Return(args.length ? ((parseInt(args[0], 10) % 256) + 256) % 256 : sh.lastExit);
    } });
  def('break continue', { cat: 'shell', builtin: true, use: 'break [n]   or   continue [n]', desc: 'In a loop: break leaves the loop at once; continue goes on with its next turn. With n, the n-th loop counting outwards.',
    ex: ['for f in *; do [ -d "$f" ] && continue; echo "$f"; done', 'while read line; do [ "$line" = end ] && break; echo "$line"; done < list.txt'],
    run(args, io, sh, ctx) {
      const v = args.length ? args[0] : '1';
      if (!/^\d+$/.test(v)) { io.err('bash: ' + this.name + ': ' + v + ': numeric argument required\n'); return 128; }
      if (+v < 1) { io.err('bash: ' + this.name + ': ' + v + ': loop count out of range\n'); return 1; }
      if (!ctx.loops) { io.err('bash: ' + this.name + ": only meaningful in a `for', `while', or `until' loop\n"); return 0; }
      throw new LoopCtl(this.name, Math.min(+v, ctx.loops));
    } });
  // a value the way declare -p writes it; an associative array's key is quoted only when it holds a character the shell would read
  const dqs = (s) => /[\u0000-\u001f\u007f]/.test(s) ? ansiQ(s) : '"' + String(s).replace(/[\\"$`]/g, '\\$&') + '"';
  const keyQ = (k) => /[ \t\n'"\\|&;()<>!{}*[\]?^$`]|^[~#]|[=:]~/.test(k) ? dqs(k) : k;
  const elems = (sh, a) => a.assoc ? sh.arrKeys(a).map((k) => '[' + keyQ(k) + ']=' + dqs(a.v[k]) + ' ').join('') : sh.arrKeys(a).map((i) => '[' + i + ']=' + dqs(a.v[i])).join(' ');
  // declare and local: NAME, NAME=value, NAME=(...) with -a (indexed), -A (associative), -x; inside a function (local, or declare without -g)
  // each name is the function's own. io.arrays[offset + i]: the NAME=(...) list of the i-th name, already expanded (runSimple)
  function declareNames(sh, ctx, io, cmd, names, offset, flags, local) {
    let exit = 0;
    const kind = flags.has('A') ? 'A' : flags.has('a') ? 'a' : undefined;
    names.forEach((a, i) => {
      const list = io.arrays && io.arrays[offset + i], m = list ? [null, list.name] : a.match(/^([A-Za-z_][A-Za-z0-9_]*)(?:=([^]*))?$/);
      if (!m) { io.err('bash: ' + cmd + ": `" + a + "': not a valid identifier\n"); exit = 1; return; }
      const n = m[1];
      if (flags.has('A') && flags.has('a')) { io.err('bash: ' + cmd + ': ' + n + ': cannot convert associative to indexed array\n'); exit = 1; return; }
      if (local || (ctx.fn && !flags.has('g'))) sh.makeLocal(ctx, n);
      if (kind && has(sh.arrays, n) && !!sh.arrays[n].assoc !== (kind === 'A')) { io.err('bash: ' + cmd + ': ' + n + ': cannot convert ' + (kind === 'A' ? 'indexed to associative' : 'associative to indexed') + ' array\n'); exit = 1; return; }
      if (flags.has('x')) sh.exported.add(n);
      if (list) { sh.assignArray(n, list.values, list.append, kind, io); return; }
      if (kind && !has(sh.arrays, n)) { const bare = !has(sh.vars, n); sh.arrMake(n, kind === 'A').bare = bare; }   // declared with no values yet: declare -p shows no =()
      if (m[2] !== undefined) sh.setVar(n, m[2]);
    });
    return exit;
  }
  const ENV = ['HOME', 'USER', 'SHELL', 'PATH', 'TERM', 'LANG'];   // the variables the shell starts with that are exported
  def('declare typeset', { cat: 'shell', builtin: true, use: 'declare [-a] [-p] [-f] [-F] [NAME[=value]...]', desc: 'Make variables and arrays, or show them. Inside a function the names are local to it, as with local.',
    opts: [['-a', 'the names are (indexed) arrays'], ['-p', 'show each name as a declare command that would make it again'], ['-f', 'show the definitions of functions'], ['-F', 'only the names of the functions']],
    ex: ['declare -a list=(x y z)', 'declare -p list', 'declare -f', 'declare -F'],
    run(args, io, sh, ctx) {
      const flags = new Set(); let k = 0;
      for (; k < args.length && /^[-+][a-zA-Z]+$/.test(args[k]); k++) for (const c of args[k].slice(1)) flags.add(c);
      const names = args.slice(k), bad = [...flags].find((c) => !'aApfFxg'.includes(c));
      if (bad) { io.err('bash: ' + this.name + ': -' + bad + ': this option is not available in this practice shell\n'); return 2; }
      const show = (n) => { const x = sh.exported.has(n) ? 'x' : '', a = sh.arrays[n]; return has(sh.arrays, n) ? 'declare -' + (a.assoc ? 'A' : 'a') + x + ' ' + n + (a.bare ? '' : '=(' + elems(sh, a) + ')') : has(sh.vars, n) ? 'declare -' + (x || '-') + ' ' + n + '=' + dqs(sh.vars[n]) : null; };
      if (flags.has('f') || flags.has('F')) {
        const fs = names.length ? names : Object.keys(sh.funcs).sort(); let exit = 0;
        for (const n of fs) { if (!has(sh.funcs, n)) { exit = 1; continue; } io.out(flags.has('F') ? (names.length ? n : 'declare -f ' + n) + '\n' : sh.printFunc(n) + '\n'); }
        return exit;
      }
      if (flags.has('p') || !names.length) {
        if (!names.length) { for (const n of [...new Set(Object.keys(sh.vars).concat(Object.keys(sh.arrays)))].sort().filter((n) => flags.has('A') ? sh.isAssoc(n) : !flags.has('a') || (has(sh.arrays, n) && !sh.isAssoc(n)))) io.out(flags.has('p') ? show(n) + '\n' : has(sh.arrays, n) ? n + '=(' + elems(sh, sh.arrays[n]) + ')\n' : n + '=' + sh.vars[n] + '\n'); return 0; }
        let exit = 0; for (const n of names) { const s = show(n); if (s === null) { io.err('bash: ' + this.name + ': ' + n + ': not found\n'); exit = 1; } else io.out(s + '\n'); } return exit;
      }
      return declareNames(sh, ctx, io, this.name, names, k, flags, false);
    } });
  const SHOPTS = 'autocd cdable_vars cdspell checkhash checkjobs checkwinsize cmdhist execfail extdebug extglob extquote force_fignore globasciiranges globstar gnu_errfmt histappend histreedit histverify hostcomplete huponexit inherit_errexit interactive_comments lastpipe lithist localvar_inherit login_shell mailwarn no_empty_cmd_completion nocaseglob nocasematch progcomp promptvars shift_verbose sourcepath xpg_echo'.split(' ');   // bash's other options
  const SHOPT_HERE = ['dotglob', 'expand_aliases', 'failglob', 'nullglob'];
  def('shopt', { cat: 'shell', builtin: true, use: 'shopt [-s|-u] [-p] [-q] [option...]', desc: 'Turn shell options on (-s) or off (-u), or show them. The ones here: nullglob (a pattern that matches nothing goes away), failglob (it is an error), dotglob (* matches hidden files too), expand_aliases (aliases in scripts; at the prompt they always work).',
    opts: [['-s', 'set: turn on'], ['-u', 'unset: turn off'], ['-p', 'print as shopt commands'], ['-q', 'quiet: only the status says whether it is on']], ex: ['shopt -s nullglob', 'shopt -s expand_aliases', 'shopt'],
    run(args, io, sh) {
      let mode = null, print = false, quiet = false, k = 0;
      for (; k < args.length && /^-[supq]+$/.test(args[k]); k++) for (const c of args[k].slice(1)) { if (c === 's' || c === 'u') mode = '-' + c; else if (c === 'p') print = true; else quiet = true; }
      const names = args.slice(k);
      const on = (n) => n === 'expand_aliases' ? !!(sh.shopt.expand_aliases || sh.interactive) : !!sh.shopt[n];
      const line = (n) => print ? 'shopt ' + (on(n) ? '-s ' : '-u ') + n + '\n' : padR(n, 15) + '\t' + (on(n) ? 'on' : 'off') + '\n';
      if (!names.length) { for (const n of SHOPT_HERE) if (!mode || on(n) === (mode === '-s')) io.out(line(n)); return 0; }   // shopt -s alone lists those that are on
      let exit = 0;
      for (const n of names) {
        if (!SHOPT_HERE.includes(n)) { io.err('bash: shopt: ' + n + ': ' + (SHOPTS.includes(n) ? 'not available in this practice shell (' + SHOPT_HERE.join(', ') + ' are)' : 'invalid shell option name') + '\n'); exit = 1; continue; }
        if (mode) sh.shopt[n] = mode === '-s'; else { if (!quiet) io.out(line(n)); if (!on(n)) exit = 1; }
      }
      return exit;
    } });
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
  def('read', { cat: 'shell', builtin: true, use: 'read [-r] [-p prompt] [-a array] [-d delim] [NAME...]', desc: 'Read a line typed by the user (or the next line of the input) into variables: one word each, the last one taking the rest. IFS says what separates the words (spaces, tabs and newlines unless it is set). Without -r a backslash keeps the next character as it is (and joins a line ending in one to the next). The status is 1 at the end of the input.',
    opts: [['-r', 'raw: a backslash is an ordinary character (use it almost always)'], ['-p TEXT', 'show TEXT as the prompt first'], ['-a NAME', 'put the words of the line into the array NAME'], ['-d C', 'read up to the character C instead of a newline']],
    ex: ['read -p "Your name: " name', 'echo "Hello, $name"', 'while read -r line; do echo "got: $line"; done < list.txt', 'IFS=, read -r name score <<< "Ada,90"'],
    async run(args, io, sh) {
      const o = getopts(args, 'p:a:rsd:n:t:', io, 'read'); if (!o) return 1;
      const names = o.args.length ? o.args : [];
      for (const n of o.f.a !== undefined ? [o.f.a] : names) if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(n)) { io.err("bash: read: `" + n + "': not a valid identifier\n"); return 1; }
      const delim = o.f.d === undefined ? '\n' : o.f.d === '' ? '\u0000' : o.f.d[0], max = o.f.n !== undefined ? parseInt(o.f.n, 10) : Infinity;
      let line = '', eof = false;
      if (io.stdin) {   // up to the delimiter; without -r, a backslash just before it joins the next piece
        const st = io.stdin, t = st.text;
        if (st.pos >= t.length) eof = true;
        while (!eof) {
          let k = t.indexOf(delim, st.pos); if (k < 0) k = t.length;
          if (line.length + (k - st.pos) >= max) { const take = max - line.length; line += t.slice(st.pos, st.pos + take); st.pos += take; break; }   // -n N: N characters at most
          line += t.slice(st.pos, k); st.pos = Math.min(t.length, k + 1);
          if (k >= t.length) { eof = true; break; }
          if (!o.f.r && /(^|[^\\])(\\\\)*\\$/.test(line)) { line = line.slice(0, -1); if (st.pos >= t.length) { eof = true; break; } continue; }
          break;
        }
      } else if (io.ask) { line = await io.ask(o.f.p || ''); if (line == null) { line = ''; eof = true; } }
      else eof = true;
      // the characters, each marked when a backslash protected it (so it neither splits nor is trimmed)
      const ch = [], esc = [];
      for (let k = 0; k < line.length; k++) { if (!o.f.r && line[k] === '\\') { if (k + 1 < line.length) { ch.push(line[++k]); esc.push(true); } continue; } ch.push(line[k]); esc.push(false); }
      const N = ch.length, ifs = sh.isSet('IFS') ? sh.getVar('IFS') : ' \t\n';
      const isIfs = (i) => !esc[i] && ifs.includes(ch[i]), isWs = (i) => isIfs(i) && ' \t\n'.includes(ch[i]);
      const skipWs = (i) => { while (i < N && isWs(i)) i++; return i; };
      const field = (i) => {   // one word from i, and where the next starts: spaces, at most one other IFS character, spaces
        let f = ''; while (i < N && !isIfs(i)) f += ch[i++];
        if (i < N) { if (isWs(i)) { i = skipWs(i); if (i < N && isIfs(i)) i = skipWs(i + 1); } else i = skipWs(i + 1); }
        return [f, i];
      };
      const text = (a, b) => ch.slice(a, b).join('');
      if (o.f.a !== undefined) { const vals = []; for (let i = skipWs(0); i < N;) { const [f, j] = field(i); vals.push(f); i = j; } sh.assignArray(o.f.a, vals, false, 'a'); return eof ? 1 : 0; }   // read -a words
      if (!names.length) { sh.setVar('REPLY', text(0, N)); return eof ? 1 : 0; }   // REPLY: the line as it is
      let i = skipWs(0);
      names.forEach((n, k) => {
        if (k < names.length - 1) { const [f, j] = field(i); sh.setVar(n, f); i = j; return; }
        // the last name: the rest of the line, unless it is a single word (then without the separator after it)
        const [f, j] = field(i); if (j >= N) { sh.setVar(n, f); return; }
        let e = N; while (e > i && isWs(e - 1)) e--; sh.setVar(n, text(i, e));
      });
      return eof ? 1 : 0;
    } });
  def('mapfile readarray', { cat: 'shell', builtin: true, use: 'mapfile [-t] [-n count] [-s count] [-O origin] [-d delim] [array]', desc: 'Read the lines of the input into an array, one line an element (MAPFILE if no name is given). Each keeps its newline unless -t is given.',
    opts: [['-t', 'take the newline (or the -d character) off each line'], ['-n N', 'at most N lines'], ['-s N', 'skip the first N lines'], ['-O N', 'start at index N (and keep what the array held)'], ['-d C', 'lines end with C instead of a newline']],
    ex: ['mapfile -t lines < notes.txt', 'echo "${#lines[@]} lines; the first is ${lines[0]}"', 'readarray -t words <<< "$(tr \' \' \'\\n\' < story.txt)"'],
    async run(args, io, sh) {
      const name = this.name, usage = name + ': usage: ' + name + ' [-d delim] [-n count] [-O origin] [-s count] [-t] [-u fd] [-C callback] [-c quantum] [array]\n';
      const f = dict(); let k = 0;
      for (; k < args.length && /^-./.test(args[k]); k++) {
        const a = args[k]; if (a === '--') { k++; break; }
        for (let j = 1; j < a.length; j++) {
          const c = a[j];
          if (c === 't') { f.t = true; continue; }
          if ('nsOdu'.includes(c)) { const v = j + 1 < a.length ? a.slice(j + 1) : args[++k]; if (v === undefined) { io.err('bash: ' + name + ': -' + c + ': option requires an argument\n' + usage); return 2; } f[c] = v; break; }
          io.err('bash: ' + name + ': -' + c + ': invalid option\n' + usage); return 2;
        }
      }
      const arr = args[k] === undefined ? 'MAPFILE' : args[k];
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(arr)) { io.err('bash: ' + name + ": `" + arr + "': not a valid identifier\n"); return 1; }
      for (const c of ['n', 's', 'O']) if (f[c] !== undefined && !/^\d+$/.test(f[c])) { io.err('bash: ' + name + ': ' + f[c] + ': invalid ' + (c === 'O' ? 'array origin' : 'line count') + '\n'); return 1; }
      const delim = f.d === undefined ? '\n' : f.d === '' ? '\u0000' : f.d[0], text = await readAll(io, name);
      const pieces = []; for (let i = 0; i < text.length;) { let e = text.indexOf(delim, i); e = e < 0 ? text.length : e + 1; pieces.push(text.slice(i, e)); i = e; }
      const skip = +(f.s || 0), count = +(f.n || 0), origin = +(f.O || 0);
      const take = pieces.slice(skip, count ? skip + count : undefined).map((l) => f.t && l.endsWith(delim) ? l.slice(0, -1) : l);
      if (f.O === undefined) sh.assignArray(arr, [], false, 'a');
      const a = sh.arrMake(arr); a.bare = false;
      take.forEach((l, i) => sh.arrSet(a, origin + i, l));
      return 0;
    } });
  def('source .', { cat: 'shell', builtin: true, use: 'source script.sh', desc: 'Run a script in this shell, so its variables, functions and aliases stay. return ends it.', ex: ['source settings.sh'],
    async run(args, io, sh, ctx) { if (!args.length) { io.err('bash: ' + this.name + ': filename argument required\n'); return 2; } const abs = sh.fs.resolve(args[0]); const n = sh.fs.stat(abs); if (!n) { io.err('bash: ' + args[0] + ': No such file or directory\n'); return 1; } if (n.t === 'd') { io.err('bash: ' + args[0] + ': Is a directory\n'); return 1; } return sh.runScript(n.d, args[0], args.slice(1), io, true, true); } });
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
  def('javac', { cat: 'run', use: 'javac File.java...', desc: 'Compile a Java program: checks it and writes a .class file for each class, which java runs. Several files are compiled together (javac *.java), so one can use the classes of another. A public class must be in a file of its own name.',
    ex: ['javac Main.java', 'javac Main.java && java Main', 'javac *.java && java Main'],
    async run(args, io, sh) {
      const files = args.filter((a) => !a.startsWith('-'));
      if (!files.length) { io.err('error: no source files\n'); return 2; }
      const srcs = [];
      for (const f of files) {
        if (!f.endsWith('.java')) { io.err("error: Class names, '" + f + "', are only accepted if annotation processing is explicitly requested\n"); return 2; }
        const abs = sh.fs.resolve(f), n = sh.fs.stat(abs);
        if (!n || n.t !== 'f') { io.err('error: file not found: ' + f + '\nUsage: javac <options> <source files>\n'); return 2; }   // as javac: nothing is compiled
        srcs.push({ name: f, code: n.d, dir: abs.slice(0, abs.lastIndexOf('/')) || '/' });
      }
      // The files become one program (javaproject.js: imports hoisted, a marker line before each file, so lines map back); one file is compiled as it is.
      const proj = JPROJ().join(srcs, { rule: 'always' }), one = srcs.length === 1;
      if (proj.error) { io.err(proj.error + '\n1 error\n'); return 1; }
      const src = one ? srcs[0].code : proj.src;
      const res = await opts_compile(sh, 'java', src, { name: files[0], files: srcs.map((x) => x.name) });
      if (res && res.err) { io.err((one ? res.err.replace(/^\S+\.java:/gm, files[0] + ':') : JPROJ().mapError(proj, res.err)).replace(/\n?$/, '\n')); return 1; }   // javac names the file as typed
      const classes = proj.classes.length ? proj.classes : [{ name: className(src) || files[0].split('/').pop().slice(0, -5), file: 0 }];
      for (const c of classes) sh.fs.write(sh.fs.resolve(c.name + '.class', srcs[c.file].dir), CLASS_BYTES, false, { lang: 'java', src });   // every class gets its .class, as javac writes them
      return 0;
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
  const JPROJ = () => (typeof globalThis.JPROJ !== 'undefined' ? globalThis.JPROJ : require('./javaproject.js'));   // the page has it as a global; node requires it
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
  def('apt apt-get pip pip3 npm curl wget ssh ping brew', { cat: 'other', use: 'curl ...', desc: 'Programs that need the internet or install things. There is no network in this practice terminal, so they only say so.', ex: [],
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

  // the aliases of a saved session (terminal.js keeps them with the history): untrusted, so only names and texts the alias builtin would take
  function cleanAliases(o) {
    const out = dict(); if (!o || typeof o !== 'object' || Array.isArray(o)) return out;
    for (const name of Object.keys(o).slice(0, 1000)) {
      const val = o[name];
      if (Object.keys(out).length >= LIMITS.aliases || typeof val !== 'string' || val.length > 1000 || /\u0000/.test(val) || !name || name.length > 100 || /[\s\/$`='"\\|&;()<>\u0000]/.test(name)) continue;
      out[name] = val;
    }
    return out;
  }
  // register(names, spec): how another file adds a command (shellgit.js adds git). It must run before the first makeFS, which puts a stub
  // for each command in /bin.
  return { makeFS, makeShell, cleanAliases, parse, tokenize, arith, braceExpand, globToRegExp, COMMANDS, LIMITS, HOME, USER, HOST, FsError, register: def };
});
