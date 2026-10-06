/* What the Python sandbox adds to Skulpt (loaded into the Python worker after sandbox.js, before pyworker.js; node tests require it).

   Files. A program can open(), read and write files, and use os and os.path, on a copy of the files it is given (PYLIB.begin): the practice
   terminal gives the whole of its virtual file system with the current directory, the Code Lab gives the tabs of the current language as
   ~/lab, a lesson or an exercise gives nothing (an empty home folder). The copy lives in this worker; when the run ends, PYLIB.changes() says
   what the program changed (files written, folders made, things removed) and the page decides what to keep: the terminal applies it to its
   file system through the same checks and limits as any shell command (src/shell.js: applyChanges), the Lab only reports it. Writing is
   allowed only under /home and /tmp, as in the shell, and the same size limits apply here, so a program fails at once with OSError
   instead of later.

   Modules that Skulpt lacks or only stubs: os and os.path (on the copy above), json, functools, heapq and typing, written in Python to
   behave as CPython 3's do (test_pylib.js compares them with a real CPython). open() and OSError with its subclasses (FileNotFoundError ...)
   replace Skulpt's (its file object loses a last line without a newline and cannot write). sys gains platform and stderr: what a program
   writes to sys.stderr goes to the page as fd 2 (PYLIB.onErr), so a grader that compares standard output does not see it.

   Exposed as self.PYLIB (worker) or module.exports (node). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PYLIB = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const HOME = '/home/student';
  const LIM = { files: 500, bytes: 2000000, fileBytes: 256000, depth: 32, name: 100, dirs: 500 };   // as src/shell.js LIMITS
  const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

  // ---------------- the copy of the files, for one run
  let V = null;
  const writable = (abs) => abs === '/home' || abs.startsWith('/home/') || abs === '/tmp' || abs.startsWith('/tmp/');
  const parentOf = (abs) => abs.slice(0, abs.lastIndexOf('/')) || '/';
  const baseOf = (abs) => abs.slice(abs.lastIndexOf('/') + 1);
  function resolve(p) {
    p = String(p);
    if (p === '') return null;
    if (p === '~') p = V.home; else if (p.startsWith('~/')) p = V.home + p.slice(1);
    const abs = p.startsWith('/') ? p : V.cwd + '/' + p, out = [];
    for (const part of abs.split('/')) { if (part === '' || part === '.') continue; if (part === '..') out.pop(); else out.push(part); }
    return '/' + out.join('/');
  }
  function addDir(abs) { if (!V.nodes.has(abs)) { V.nodes.set(abs, { t: 'd', c: new Set() }); if (abs !== '/') V.nodes.get(parentOf(abs)).c.add(baseOf(abs)); } }
  function addDirs(abs) { let cur = ''; addDir('/'); for (const part of abs.split('/').filter(Boolean)) { cur += '/' + part; const n = V.nodes.get(cur); if (n && n.t !== 'd') return false; addDir(cur); } return true; }
  /** spec: { cwd, home, env: {name: value}, entries: [[path, 'd'] | [path, 'f', text]], importDir } from the page; anything malformed is
      left out. importDir is the program's own folder, where import looks for the student's modules (moduleFile), as Python's sys.path[0]. */
  function begin(spec) {
    spec = spec && typeof spec === 'object' ? spec : {};
    V = { nodes: new Map(), cwd: '/', home: typeof spec.home === 'string' && spec.home.startsWith('/') ? spec.home : HOME, env: Object.create(null), init: new Map(), files: 0, bytes: 0, dirs: 0, onErr: null };
    addDir('/');
    const entries = Array.isArray(spec.entries) ? spec.entries.slice(0, 5000) : [];
    for (const e of entries) {
      if (!Array.isArray(e) || typeof e[0] !== 'string' || !e[0].startsWith('/')) continue;
      V.cwd = '/'; const abs = resolve(e[0]); if (abs === '/') continue;
      if (e[1] === 'd') addDirs(abs);
      else if (e[1] === 'f' && typeof e[2] === 'string' && addDirs(parentOf(abs)) && !V.nodes.has(abs)) { V.nodes.set(abs, { t: 'f', d: e[2] }); V.nodes.get(parentOf(abs)).c.add(baseOf(abs)); }
    }
    addDirs(V.home); addDirs('/tmp');
    if (spec.env && typeof spec.env === 'object') for (const k of Object.keys(spec.env).slice(0, 500)) if (typeof spec.env[k] === 'string' && /^[A-Za-z_][A-Za-z0-9_]*$/.test(k)) V.env[k] = spec.env[k];
    if (!V.env.HOME) V.env.HOME = V.home;
    V.cwd = '/'; const cwd = typeof spec.cwd === 'string' ? resolve(spec.cwd) : V.home;
    V.cwd = V.nodes.has(cwd) && V.nodes.get(cwd).t === 'd' ? cwd : V.home;
    const imp = typeof spec.importDir === 'string' ? resolve(spec.importDir) : V.cwd;
    V.importDir = V.nodes.has(imp) && V.nodes.get(imp).t === 'd' ? imp : V.cwd;
    for (const [abs, n] of V.nodes) if (writable(abs) && abs !== '/home' && abs !== '/tmp') { V.init.set(abs, n.t === 'd' ? 'd' : n.d); if (n.t === 'd') V.dirs++; else { V.files++; V.bytes += n.d.length; } }
    return V;
  }
  // every function below answers '' (done) or an error code, which the Python side turns into the OSError subclass and message
  function checkParent(abs) {
    const dir = V.nodes.get(parentOf(abs));
    if (!dir) { let cur = parentOf(abs); while (cur !== '/' && !V.nodes.has(cur)) cur = parentOf(cur); return V.nodes.get(cur).t === 'd' ? 'ENOENT' : 'ENOTDIR'; }
    return dir.t === 'd' ? '' : 'ENOTDIR';
  }
  function checkName(abs) {
    const name = baseOf(abs);
    if (name.length > LIM.name) return 'ENAMETOOLONG';
    if (/[\u0000-\u001f\u007f]/.test(name)) return 'EINVAL';
    if (abs.split('/').length - 1 > LIM.depth) return 'ENAMETOOLONG';
    return '';
  }
  const fs = {
    kind(p) { const abs = resolve(p); const n = abs && V.nodes.get(abs); return n ? n.t : ''; },
    list(p) { const abs = resolve(p); const n = abs && V.nodes.get(abs); if (!n) return 'ENOENT'; if (n.t !== 'd') return 'ENOTDIR'; return [...n.c].sort(); },
    read(p) { const abs = resolve(p); const n = abs && V.nodes.get(abs); if (!n) return ['ENOENT', '']; if (n.t === 'd') return ['EISDIR', '']; return ['', n.d]; },
    size(p) { const abs = resolve(p); const n = abs && V.nodes.get(abs); if (!n) return ['ENOENT', 0]; if (n.t === 'd') return ['', 4096]; let b = 0; for (const ch of n.d) { const c = ch.codePointAt(0); b += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4; } return ['', b]; },
    /** mode 'w' (create or empty), 'a' (create or add to the end), 'x' (create, must not exist) */
    write(p, text, mode) {
      const abs = resolve(p); if (!abs) return 'ENOENT'; if (abs === '/') return 'EISDIR';
      const n = V.nodes.get(abs);
      if (n && n.t === 'd') return 'EISDIR';
      if (mode === 'x' && n) return 'EEXIST';
      let e = checkParent(abs); if (e) return e;
      if (!writable(abs)) return 'EACCES';
      if (!n && (e = checkName(abs))) return e;
      const next = mode === 'a' && n ? n.d + text : text;
      if (next.length > LIM.fileBytes) return 'EFBIG';
      if (!n && V.files + 1 > LIM.files) return 'ENOSPC';
      if (V.bytes + next.length - (n ? n.d.length : 0) > LIM.bytes) return 'ENOSPC';
      V.bytes += next.length - (n ? n.d.length : 0);
      if (n) n.d = next; else { V.files++; V.nodes.set(abs, { t: 'f', d: next }); V.nodes.get(parentOf(abs)).c.add(baseOf(abs)); }
      return '';
    },
    mkdir(p) {
      const abs = resolve(p); if (!abs) return 'ENOENT'; if (V.nodes.has(abs)) return 'EEXIST';
      let e = checkParent(abs); if (e) return e;
      if (!writable(abs)) return 'EACCES';
      if ((e = checkName(abs))) return e;
      if (V.dirs + 1 > LIM.dirs) return 'ENOSPC';
      V.dirs++; addDir(abs); return '';
    },
    rmdir(p) {
      const abs = resolve(p); const n = abs && V.nodes.get(abs); if (!n) return 'ENOENT'; if (n.t !== 'd') return 'ENOTDIR';
      if (abs === '/') return 'EBUSY'; if (n.c.size) return 'ENOTEMPTY'; if (!writable(abs) || abs === '/home' || abs === '/tmp') return 'EACCES';
      V.nodes.delete(abs); V.nodes.get(parentOf(abs)).c.delete(baseOf(abs)); V.dirs--; return '';
    },
    remove(p) {
      const abs = resolve(p); const n = abs && V.nodes.get(abs); if (!n) return 'ENOENT'; if (n.t === 'd') return 'EISDIR'; if (!writable(abs)) return 'EACCES';
      V.nodes.delete(abs); V.nodes.get(parentOf(abs)).c.delete(baseOf(abs)); V.files--; V.bytes -= n.d.length; return '';
    },
    rename(a, b) {
      const src = resolve(a), dst = resolve(b); const s = src && V.nodes.get(src); if (!s) return 'ENOENT'; if (!dst) return 'ENOENT';
      if (src === dst) return '';
      if (dst.startsWith(src + '/') || src === '/') return 'EINVAL';
      let e = checkParent(dst); if (e) return e;
      if (!writable(src) || !writable(dst) || src === '/home' || src === '/tmp') return 'EACCES';
      const d = V.nodes.get(dst);
      if (d && d.t === 'd' && s.t !== 'd') return 'EISDIR';
      if (d && d.t !== 'd' && s.t === 'd') return 'ENOTDIR';
      if (d && d.t === 'd' && d.c.size) return 'ENOTEMPTY';
      if (!d && (e = checkName(dst))) return e;
      if (d) { if (d.t === 'd') V.dirs--; else { V.files--; V.bytes -= d.d.length; } V.nodes.delete(dst); V.nodes.get(parentOf(dst)).c.delete(baseOf(dst)); }
      const moved = [...V.nodes.keys()].filter((k) => k === src || k.startsWith(src + '/')).sort();
      V.nodes.get(parentOf(src)).c.delete(baseOf(src));
      for (const k of moved) { const n = V.nodes.get(k); V.nodes.delete(k); V.nodes.set(dst + k.slice(src.length), n); }
      V.nodes.get(parentOf(dst)).c.add(baseOf(dst));
      if (V.cwd === src || V.cwd.startsWith(src + '/')) V.cwd = dst + V.cwd.slice(src.length);
      return '';
    },
    chdir(p) { const abs = resolve(p); const n = abs && V.nodes.get(abs); if (!n) return 'ENOENT'; if (n.t !== 'd') return 'ENOTDIR'; V.cwd = abs; return ''; }
  };
  /** Skulpt looks for `import helper` as './helper.py' and './helper/__init__.py' (after its own library): the text of that file in the
      program's folder, or undefined. Only .py: Skulpt runs a .js module as JavaScript, which a student's file must never become. */
  function moduleFile(x) {
    if (!V || typeof x !== 'string' || !/^\.\/[A-Za-z_][A-Za-z0-9_]*(\/[A-Za-z_][A-Za-z0-9_]*)*\.py$/.test(x)) return undefined;
    const n = V.nodes.get((V.importDir === '/' ? '' : V.importDir) + '/' + x.slice(2));
    return n && n.t === 'f' ? n.d : undefined;
  }
  /** Where an error happened, for the message: the innermost frame of the student's own code (Skulpt names the innermost frame, which is
      now often a line of json/__init__.py or _labio.py). ' on line 3', or ' on line 2 of helper.py' for a module of theirs; '' if none. */
  function place(e) {
    const tb = e && Array.isArray(e.traceback) ? e.traceback : [];
    const own = tb.find((f) => f && f.lineno && !/^src\//.test(String(f.filename || '')));
    if (!own) return '';
    const file = String(own.filename || '');
    return ' on line ' + own.lineno + (file && file !== '<stdin>.py' ? ' of ' + file.replace(/^\.\//, '') : '');
  }
  /** what the program changed under /home and /tmp: { rm: [paths], mkdir: [paths], write: [[path, text]] }, or null when nothing */
  function changes() {
    if (!V) return null;
    const rm = [], mkdir = [], write = [];
    for (const [abs, was] of V.init) { const n = V.nodes.get(abs); if (!n || (n.t === 'd') !== (was === 'd')) rm.push(abs); }
    const gone = new Set(rm);
    for (const [abs, n] of V.nodes) {
      if (!writable(abs) || abs === '/home' || abs === '/tmp') continue;
      const was = V.init.has(abs) ? V.init.get(abs) : undefined, typeSame = was !== undefined && !gone.has(abs);
      if (n.t === 'd') { if (!typeSame) mkdir.push(abs); }
      else if (!typeSame || was !== n.d) write.push([abs, n.d]);
    }
    rm.sort(); mkdir.sort(); write.sort((x, y) => (x[0] < y[0] ? -1 : 1));
    const top = rm.filter((p) => !rm.some((q) => q !== p && p.startsWith(q + '/') && V.init.get(q) === 'd'));
    return top.length || mkdir.length || write.length ? { rm: top, mkdir, write } : null;
  }

  // ---------------- the bridge Python calls: import _labfs
  function bridge() {
    const Sk = (typeof self !== 'undefined' && self.Sk) || (typeof globalThis !== 'undefined' && globalThis.Sk);
    if (!V) begin(null);
    const S = (x) => new Sk.builtin.str(String(x)), J = (x) => Sk.ffi.remapToJs(x), N = Sk.builtin.none.none$;
    const str = (x, what) => { if (!(x instanceof Sk.builtin.str)) throw new Sk.builtin.TypeError(what + ' must be str, not ' + Sk.abstr.typeName(x)); return x.v; };
    const f = (fn) => new Sk.builtin.func(fn);
    const T = (a) => new Sk.builtin.tuple(a);
    return {
      __name__: S('_labfs'),
      getcwd: f(() => S(V.cwd)),
      home: f(() => S(V.home)),
      kind: f((p) => S(fs.kind(str(p, 'path')))),
      listdir: f((p) => { const r = fs.list(str(p, 'path')); return typeof r === 'string' ? S(r) : new Sk.builtin.list(r.map(S)); }),
      read: f((p) => { const r = fs.read(str(p, 'path')); return T([S(r[0]), S(r[1])]); }),
      size: f((p) => { const r = fs.size(str(p, 'path')); return T([S(r[0]), new Sk.builtin.int_(r[1])]); }),
      write: f((p, t, m) => S(fs.write(str(p, 'path'), str(t, 'text'), J(m)))),
      mkdir: f((p) => S(fs.mkdir(str(p, 'path')))),
      rmdir: f((p) => S(fs.rmdir(str(p, 'path')))),
      remove: f((p) => S(fs.remove(str(p, 'path')))),
      rename: f((a, b) => S(fs.rename(str(a, 'src'), str(b, 'dst')))),
      chdir: f((p) => S(fs.chdir(str(p, 'path')))),
      environ: f(() => { const kv = []; for (const k of Object.keys(V.env)) kv.push(S(k), S(V.env[k])); return new Sk.builtin.dict(kv); }),
      err: f((t) => { const s = str(t, 'write() argument'); if (V.onErr) V.onErr(s); return new Sk.builtin.int_(s.length); })
    };
  }

  // ---------------- Python sources
  const PY = {};
  PY['_labio'] = String.raw`
import _labfs

class OSError(Exception):
    def __init__(self, *args):
        Exception.__init__(self, *args)
        self.errno = args[0] if len(args) >= 2 else None
        self.strerror = args[1] if len(args) >= 2 else None
        self.filename = args[2] if len(args) >= 3 else None
        self.filename2 = args[4] if len(args) >= 5 else None
    def __str__(self):
        if self.errno is not None and self.strerror is not None:
            s = '[Errno %s] %s' % (self.errno, self.strerror)
            if self.filename is not None:
                s += ': %r' % (self.filename,)
                if self.filename2 is not None:
                    s += ' -> %r' % (self.filename2,)
            return s
        if len(self.args) == 1:
            return str(self.args[0])
        if not self.args:
            return ''
        return str(self.args)

class FileNotFoundError(OSError): pass
class FileExistsError(OSError): pass
class IsADirectoryError(OSError): pass
class NotADirectoryError(OSError): pass
class PermissionError(OSError): pass
class UnsupportedOperation(OSError): pass

ERRORS = {
    'ENOENT': (FileNotFoundError, 2, 'No such file or directory'),
    'EEXIST': (FileExistsError, 17, 'File exists'),
    'EISDIR': (IsADirectoryError, 21, 'Is a directory'),
    'ENOTDIR': (NotADirectoryError, 20, 'Not a directory'),
    'EACCES': (PermissionError, 13, 'Permission denied'),
    'ENOTEMPTY': (OSError, 39, 'Directory not empty'),
    'ENOSPC': (OSError, 28, 'No space left on device'),
    'EFBIG': (OSError, 27, 'File too large'),
    'EINVAL': (OSError, 22, 'Invalid argument'),
    'ENAMETOOLONG': (OSError, 36, 'File name too long'),
    'EBUSY': (OSError, 16, 'Device or resource busy'),
}

def fail(code, name, name2=None):
    cls, n, msg = ERRORS.get(code, (OSError, 5, 'Input/output error'))
    if name2 is None:
        raise cls(n, msg, name)
    raise cls(n, msg, name, None, name2)

class TextIOWrapper:
    def __init__(self, name, mode, text, readable, writable, append):
        self.name = name
        self.mode = mode
        self.encoding = 'UTF-8'
        self.closed = False
        self._data = text
        self._pos = len(text) if append else 0
        self._r = readable
        self._w = writable
        self._a = append

    def __repr__(self):
        return '<_io.TextIOWrapper name=%r mode=%r encoding=%r>' % (self.name, self.mode, self.encoding)

    def _check(self, reading):
        if self.closed:
            raise ValueError('I/O operation on closed file.')
        if reading and not self._r:
            raise UnsupportedOperation('not readable')
        if not reading and not self._w:
            raise UnsupportedOperation('not writable')

    def readable(self):
        if self.closed:
            raise ValueError('I/O operation on closed file.')
        return self._r

    def writable(self):
        if self.closed:
            raise ValueError('I/O operation on closed file.')
        return self._w

    def read(self, size=-1):
        self._check(True)
        if size is None or size < 0:
            s = self._data[self._pos:]
        else:
            s = self._data[self._pos:self._pos + size]
        self._pos += len(s)
        return s

    def readline(self, size=-1):
        self._check(True)
        end = self._data.find('\n', self._pos)
        end = len(self._data) if end < 0 else end + 1
        if size is not None and size >= 0:
            end = min(end, self._pos + size)
        s = self._data[self._pos:end]
        self._pos = end
        return s

    def readlines(self, hint=-1):
        self._check(True)
        lines = []
        total = 0
        while True:
            line = self.readline()
            if not line:
                break
            lines.append(line)
            total += len(line)
            if hint is not None and hint > 0 and total >= hint:
                break
        return lines

    def __iter__(self):
        if self.closed:
            raise ValueError('I/O operation on closed file.')
        return self

    def __next__(self):
        line = self.readline()
        if not line:
            raise StopIteration
        return line

    def write(self, s):
        self._check(False)
        if not isinstance(s, str):
            raise TypeError('write() argument must be str, not %s' % type(s).__name__)
        if self._a or self._pos >= len(self._data):
            code = _labfs.write(self.name, s, 'a')
            if code:
                fail(code, self.name)
            self._data += s
            self._pos = len(self._data)
        else:
            new = self._data[:self._pos] + s + self._data[self._pos + len(s):]
            code = _labfs.write(self.name, new, 'w')
            if code:
                fail(code, self.name)
            self._data = new
            self._pos += len(s)
        return len(s)

    def writelines(self, lines):
        for line in lines:
            self.write(line)

    def seek(self, offset, whence=0):
        if self.closed:
            raise ValueError('I/O operation on closed file.')
        if whence == 0:
            if offset < 0:
                raise ValueError('negative seek position %d' % offset)
            self._pos = offset
        elif whence == 2 and offset == 0:
            self._pos = len(self._data)
        elif whence == 1 and offset == 0:
            pass
        else:
            raise UnsupportedOperation("can't do nonzero cur-relative seeks" if whence == 1 else "can't do nonzero end-relative seeks")
        return self._pos

    def tell(self):
        if self.closed:
            raise ValueError('I/O operation on closed file.')
        return self._pos

    def truncate(self, size=None):
        self._check(False)
        size = self._pos if size is None else size
        new = self._data[:size]
        code = _labfs.write(self.name, new, 'w')
        if code:
            fail(code, self.name)
        self._data = new
        return size

    def flush(self):
        if self.closed:
            raise ValueError('I/O operation on closed file.')

    def isatty(self):
        return False

    def close(self):
        self.closed = True

    def __enter__(self):
        if self.closed:
            raise ValueError('I/O operation on closed file.')
        return self

    def __exit__(self, *exc):
        self.close()
        return False

def open(file, mode='r', buffering=-1, encoding=None, errors=None, newline=None, closefd=True, opener=None):
    if not isinstance(file, str):
        raise TypeError('expected str, bytes or os.PathLike object, not %s' % type(file).__name__)
    if not isinstance(mode, str):
        raise TypeError('open() argument \'mode\' must be str, not %s' % type(mode).__name__)
    kinds = [c for c in mode if c in 'rwax']
    if len(set(mode)) != len(mode) or any(c not in 'rwaxbt+' for c in mode):
        raise ValueError('invalid mode: %r' % (mode,))
    if len(kinds) != 1:
        raise ValueError('must have exactly one of create/read/write/append mode')
    if 'b' in mode:
        if 't' in mode:
            raise ValueError("can't have text and binary mode at once")
        raise ValueError('binary mode (%r) is not available here: open the file as text, with %r' % (mode, mode.replace('b', '')))
    k = kinds[0]
    plus = '+' in mode
    if k == 'r':
        code, text = _labfs.read(file)
        if code:
            fail(code, file)
    else:
        if _labfs.kind(file) == 'd':
            fail('EISDIR', file)
        code = _labfs.write(file, '', {'w': 'w', 'a': 'a', 'x': 'x'}[k])
        if code:
            fail(code, file)
        text = _labfs.read(file)[1] if k == 'a' else ''
    return TextIOWrapper(file, mode, text, k == 'r' or plus, k != 'r' or plus, k == 'a')

class _StdErr:
    name = '<stderr>'
    mode = 'w'
    encoding = 'utf-8'
    closed = False
    def write(self, s):
        if not isinstance(s, str):
            raise TypeError('write() argument must be str, not %s' % type(s).__name__)
        return _labfs.err(s)
    def writelines(self, lines):
        for line in lines:
            self.write(line)
    def flush(self):
        pass
    def isatty(self):
        return False
    def __repr__(self):
        return "<_io.TextIOWrapper name='<stderr>' mode='w' encoding='utf-8'>"

stderr = _StdErr()
`;

  PY['os/__init__'] = String.raw`
import _labfs
from os import path

name = 'posix'
sep = '/'
altsep = None
extsep = '.'
pathsep = ':'
linesep = '\n'
curdir = '.'
pardir = '..'
devnull = '/dev/null'
environ = _labfs.environ()

def _fail(code, p, p2=None):
    table = {
        'ENOENT': (FileNotFoundError, 2, 'No such file or directory'),
        'EEXIST': (FileExistsError, 17, 'File exists'),
        'EISDIR': (IsADirectoryError, 21, 'Is a directory'),
        'ENOTDIR': (NotADirectoryError, 20, 'Not a directory'),
        'EACCES': (PermissionError, 13, 'Permission denied'),
        'ENOTEMPTY': (OSError, 39, 'Directory not empty'),
        'ENOSPC': (OSError, 28, 'No space left on device'),
        'EINVAL': (OSError, 22, 'Invalid argument'),
        'ENAMETOOLONG': (OSError, 36, 'File name too long'),
        'EBUSY': (OSError, 16, 'Device or resource busy'),
    }
    cls, n, msg = table.get(code, (OSError, 5, 'Input/output error'))
    if p2 is None:
        raise cls(n, msg, p)
    raise cls(n, msg, p, None, p2)

def _str(p, fn):
    if not isinstance(p, str):
        raise TypeError('%s: path should be string, bytes or os.PathLike, not %s' % (fn, type(p).__name__))
    return p

def getcwd():
    return _labfs.getcwd()

def chdir(p):
    code = _labfs.chdir(_str(p, 'chdir'))
    if code:
        _fail(code, p)

def listdir(p='.'):
    r = _labfs.listdir(_str(p, 'listdir'))
    if isinstance(r, str):
        _fail(r, p)
    return r

def mkdir(p, mode=0o777):
    code = _labfs.mkdir(_str(p, 'mkdir'))
    if code:
        _fail(code, p)

def makedirs(p, mode=0o777, exist_ok=False):
    head, tail = path.split(p)
    if not tail:
        head, tail = path.split(head)
    if head and tail and not path.exists(head):
        try:
            makedirs(head, exist_ok=exist_ok)
        except FileExistsError:
            pass
        if tail == curdir:
            return
    try:
        mkdir(p, mode)
    except OSError:
        if not exist_ok or not path.isdir(p):
            raise

def remove(p):
    code = _labfs.remove(_str(p, 'remove'))
    if code:
        _fail(code, p)

unlink = remove

def rmdir(p):
    code = _labfs.rmdir(_str(p, 'rmdir'))
    if code:
        _fail(code, p)

def removedirs(p):
    rmdir(p)
    head, tail = path.split(p)
    if not tail:
        head, tail = path.split(head)
    while head and tail:
        try:
            rmdir(head)
        except OSError:
            break
        head, tail = path.split(head)

def rename(src, dst):
    code = _labfs.rename(_str(src, 'rename'), _str(dst, 'rename'))
    if code:
        _fail(code, src, dst)

def replace(src, dst):
    if path.isfile(dst) and path.isfile(src):
        remove(dst)
    rename(src, dst)

def getenv(key, default=None):
    return environ.get(key, default)

def putenv(key, value):
    environ[key] = value

def getlogin():
    return environ.get('USER', 'student')

def getpid():
    return 4242

def cpu_count():
    return 1

def walk(top, topdown=True, onerror=None, followlinks=False):
    try:
        names = listdir(top)
    except OSError as err:
        if onerror is not None:
            onerror(err)
        return
    dirs = []
    nondirs = []
    for n in names:
        if path.isdir(path.join(top, n)):
            dirs.append(n)
        else:
            nondirs.append(n)
    if topdown:
        yield top, dirs, nondirs
        for d in dirs:
            for x in walk(path.join(top, d), topdown, onerror, followlinks):
                yield x
    else:
        for d in dirs:
            for x in walk(path.join(top, d), topdown, onerror, followlinks):
                yield x
        yield top, dirs, nondirs

class stat_result:
    def __init__(self, size, isdir):
        self.st_size = size
        self.st_mode = 0o40755 if isdir else 0o100644
        self.st_mtime = 0.0
    def __repr__(self):
        return 'os.stat_result(st_mode=%d, st_size=%d)' % (self.st_mode, self.st_size)

def stat(p):
    code, size = _labfs.size(_str(p, 'stat'))
    if code:
        _fail(code, p)
    return stat_result(size, _labfs.kind(p) == 'd')

def system(command):
    raise OSError("os.system is not available here: Python runs in your browser, away from the terminal. Run the command in the terminal itself")
`;

  PY['os/path'] = String.raw`
import _labfs

sep = '/'
curdir = '.'
pardir = '..'

def _s(p, fn):
    if not isinstance(p, str):
        raise TypeError('%s() argument must be str, bytes, or os.PathLike object, not %r' % (fn, type(p).__name__) if fn == 'join' else 'expected str, bytes or os.PathLike object, not %s' % type(p).__name__)
    return p

def isabs(p):
    return _s(p, 'isabs').startswith('/')

def join(a, *p):
    path = _s(a, 'join')
    for b in p:
        _s(b, 'join')
        if b.startswith('/'):
            path = b
        elif not path or path.endswith('/'):
            path += b
        else:
            path += '/' + b
    return path

def split(p):
    _s(p, 'split')
    i = p.rfind('/') + 1
    head, tail = p[:i], p[i:]
    if head and head != '/' * len(head):
        head = head.rstrip('/')
    return head, tail

def basename(p):
    _s(p, 'basename')
    return p[p.rfind('/') + 1:]

def dirname(p):
    return split(p)[0]

def splitext(p):
    _s(p, 'splitext')
    sep_i = p.rfind('/')
    dot_i = p.rfind('.')
    if dot_i > sep_i:
        i = sep_i + 1
        while i < dot_i:
            if p[i] != '.':
                return p[:dot_i], p[dot_i:]
            i += 1
    return p, ''

def normpath(path):
    _s(path, 'normpath')
    if path == '':
        return '.'
    initial = 1 if path.startswith('/') else 0
    if initial and path.startswith('//') and not path.startswith('///'):
        initial = 2
    new = []
    for comp in path.split('/'):
        if comp in ('', '.'):
            continue
        if comp != '..' or (not initial and not new) or (new and new[-1] == '..'):
            new.append(comp)
        elif new:
            new.pop()
    path = '/'.join(new)
    if initial:
        path = '/' * initial + path
    return path or '.'

def abspath(p):
    _s(p, 'abspath')
    if not p.startswith('/'):
        p = join(_labfs.getcwd(), p)
    return normpath(p)

realpath = abspath

def expanduser(p):
    _s(p, 'expanduser')
    if not p.startswith('~'):
        return p
    i = p.find('/', 1)
    if i < 0:
        i = len(p)
    if i != 1:
        return p
    home = _labfs.home().rstrip('/')
    return (home + p[i:]) or '/'

def commonprefix(m):
    if not m:
        return ''
    s1 = min(m)
    s2 = max(m)
    for i, c in enumerate(s1):
        if c != s2[i]:
            return s1[:i]
    return s1

def relpath(path, start=None):
    if not path:
        raise ValueError('no path specified')
    if start is None:
        start = curdir
    start_list = [x for x in abspath(start).split('/') if x]
    path_list = [x for x in abspath(path).split('/') if x]
    i = len(commonprefix([start_list, path_list]))
    rel = [pardir] * (len(start_list) - i) + path_list[i:]
    if not rel:
        return curdir
    return join(*rel)

def exists(p):
    return isinstance(p, str) and p != '' and _labfs.kind(p) != ''

lexists = exists

def isfile(p):
    return isinstance(p, str) and p != '' and _labfs.kind(p) == 'f'

def isdir(p):
    return isinstance(p, str) and p != '' and _labfs.kind(p) == 'd'

def islink(p):
    return False

def getsize(p):
    code, size = _labfs.size(_s(p, 'getsize'))
    if code:
        raise FileNotFoundError(2, 'No such file or directory', p)
    return size
`;

  PY['json/__init__'] = String.raw`
class JSONDecodeError(ValueError):
    def __init__(self, msg, doc, pos):
        lineno = doc.count('\n', 0, pos) + 1
        colno = pos - doc.rfind('\n', 0, pos)
        ValueError.__init__(self, '%s: line %d column %d (char %d)' % (msg, lineno, colno, pos))
        self._text = '%s: line %d column %d (char %d)' % (msg, lineno, colno, pos)
        self.msg = msg
        self.doc = doc
        self.pos = pos
        self.lineno = lineno
        self.colno = colno
    def __str__(self):
        return self._text

_ESC = {'"': '\\"', '\\': '\\\\', '\n': '\\n', '\r': '\\r', '\t': '\\t', '\b': '\\b', '\f': '\\f'}

def _string(s, ascii_only):
    out = ['"']
    for c in s:
        n = ord(c)
        if c in _ESC:
            out.append(_ESC[c])
        elif n < 0x20 or (ascii_only and n > 0x7e):
            if n > 0xffff:
                n -= 0x10000
                out.append('\\u%04x\\u%04x' % (0xd800 | (n >> 10), 0xdc00 | (n & 0x3ff)))
            else:
                out.append('\\u%04x' % n)
        else:
            out.append(c)
    out.append('"')
    return ''.join(out)

def _float(f, allow_nan):
    if f != f:
        text = 'NaN'
    elif f == float('inf'):
        text = 'Infinity'
    elif f == -float('inf'):
        text = '-Infinity'
    else:
        return repr(f)
    if not allow_nan:
        raise ValueError('Out of range float values are not JSON compliant: ' + repr(f))
    return text

def _key(k, o):
    if isinstance(k, str):
        return k
    if k is True:
        return 'true'
    if k is False:
        return 'false'
    if k is None:
        return 'null'
    if isinstance(k, float):
        return _float(k, o['allow_nan'])
    if isinstance(k, int):
        return repr(k)
    if o['skipkeys']:
        return None
    raise TypeError('keys must be str, int, float, bool or None, not %s' % type(k).__name__)

def _encode(v, o, level, seen):
    if v is None:
        return 'null'
    if v is True:
        return 'true'
    if v is False:
        return 'false'
    if isinstance(v, str):
        return _string(v, o['ensure_ascii'])
    if isinstance(v, float):
        return _float(v, o['allow_nan'])
    if isinstance(v, int):
        return repr(v)
    if isinstance(v, (list, tuple, dict)):
        if id(v) in seen:
            raise ValueError('Circular reference detected')
        seen.add(id(v))
        indent = o['indent']
        item_sep, key_sep = o['separators']
        if isinstance(v, dict):
            items = []
            pairs = sorted(v.items(), key=lambda kv: kv[0]) if o['sort_keys'] else list(v.items())
            for k, val in pairs:
                ks = _key(k, o)
                if ks is not None:
                    items.append(_string(ks, o['ensure_ascii']) + key_sep + _encode(val, o, level + 1, seen))
            if not items:
                seen.discard(id(v))
                return '{}'
            open_, close_ = '{', '}'
        else:
            if not v:
                seen.discard(id(v))
                return '[]'
            items = [_encode(x, o, level + 1, seen) for x in v]
            open_, close_ = '[', ']'
        seen.discard(id(v))
        if indent is None:
            return open_ + item_sep.join(items) + close_
        inner = '\n' + indent * (level + 1)
        return open_ + inner + (item_sep + inner).join(items) + '\n' + indent * level + close_
    if o['default'] is not None:
        return _encode(o['default'](v), o, level, seen)
    raise TypeError('Object of type %s is not JSON serializable' % type(v).__name__)

def dumps(obj, skipkeys=False, ensure_ascii=True, check_circular=True, allow_nan=True, cls=None, indent=None, separators=None, default=None, sort_keys=False, **kw):
    if indent is not None and not isinstance(indent, str):
        indent = ' ' * indent
    if separators is None:
        separators = (', ', ': ') if indent is None else (',', ': ')
    o = {'skipkeys': skipkeys, 'ensure_ascii': ensure_ascii, 'allow_nan': allow_nan, 'indent': indent, 'separators': tuple(separators), 'default': default, 'sort_keys': sort_keys}
    return _encode(obj, o, 0, set())

def dump(obj, fp, **kw):
    fp.write(dumps(obj, **kw))

_WS = ' \t\n\r'
_UNESC = {'"': '"', '\\': '\\', '/': '/', 'b': '\b', 'f': '\f', 'n': '\n', 'r': '\r', 't': '\t'}
_DIGITS = '0123456789'

class _Parser:
    def __init__(self, s, hooks):
        self.s = s
        self.n = len(s)
        self.object_hook = hooks.get('object_hook')
        self.object_pairs_hook = hooks.get('object_pairs_hook')
        self.parse_float = hooks.get('parse_float') or float
        self.parse_int = hooks.get('parse_int') or int
        self.parse_constant = hooks.get('parse_constant')

    def ws(self, i):
        while i < self.n and self.s[i] in _WS:
            i += 1
        return i

    def value(self, i):
        s = self.s
        if i >= self.n:
            raise JSONDecodeError('Expecting value', s, i)
        c = s[i]
        if c == '"':
            return self.string(i + 1)
        if c == '{':
            return self.obj(i + 1)
        if c == '[':
            return self.arr(i + 1)
        if c == 'n' and s[i:i + 4] == 'null':
            return None, i + 4
        if c == 't' and s[i:i + 4] == 'true':
            return True, i + 4
        if c == 'f' and s[i:i + 5] == 'false':
            return False, i + 5
        if c == 'N' and s[i:i + 3] == 'NaN':
            return self.const('NaN'), i + 3
        if c == 'I' and s[i:i + 8] == 'Infinity':
            return self.const('Infinity'), i + 8
        if c == '-' and s[i:i + 9] == '-Infinity':
            return self.const('-Infinity'), i + 9
        return self.number(i)

    def const(self, name):
        if self.parse_constant is not None:
            return self.parse_constant(name)
        return float(name.replace('Infinity', 'inf').replace('NaN', 'nan'))

    def number(self, i):
        s = self.s
        j = i
        if j < self.n and s[j] == '-':
            j += 1
        if j < self.n and s[j] == '0':
            j += 1
        elif j < self.n and s[j] in '123456789':
            while j < self.n and s[j] in _DIGITS:
                j += 1
        else:
            raise JSONDecodeError('Expecting value', s, i)
        is_float = False
        if j + 1 < self.n and s[j] == '.' and s[j + 1] in _DIGITS:
            is_float = True
            j += 1
            while j < self.n and s[j] in _DIGITS:
                j += 1
        if j < self.n and s[j] in 'eE':
            k = j + 1
            if k < self.n and s[k] in '+-':
                k += 1
            if k < self.n and s[k] in _DIGITS:
                is_float = True
                j = k
                while j < self.n and s[j] in _DIGITS:
                    j += 1
        text = s[i:j]
        return (self.parse_float(text) if is_float else self.parse_int(text)), j

    def string(self, i):
        s = self.s
        start = i - 1
        out = []
        while True:
            j = i
            while j < self.n and s[j] != '"' and s[j] != '\\' and ord(s[j]) >= 0x20:
                j += 1
            out.append(s[i:j])
            if j >= self.n:
                raise JSONDecodeError('Unterminated string starting at', s, start)
            c = s[j]
            if c == '"':
                return ''.join(out), j + 1
            if c != '\\':
                raise JSONDecodeError('Invalid control character at', s, j)
            if j + 1 >= self.n:
                raise JSONDecodeError('Unterminated string starting at', s, start)
            e = s[j + 1]
            if e == 'u':
                code = self.hex4(j + 1)
                i = j + 6
                if 0xd800 <= code <= 0xdbff and s[i:i + 2] == '\\u':
                    low = self.hex4(i + 1)
                    if 0xdc00 <= low <= 0xdfff:
                        code = 0x10000 + (((code - 0xd800) << 10) | (low - 0xdc00))
                        i += 6
                out.append(chr(code))
            elif e in _UNESC:
                out.append(_UNESC[e])
                i = j + 2
            else:
                raise JSONDecodeError('Invalid \\escape', s, j)

    def hex4(self, i):
        h = self.s[i + 1:i + 5]
        if len(h) == 4 and all(c in '0123456789abcdefABCDEF' for c in h):
            return int(h, 16)
        raise JSONDecodeError('Invalid \\uXXXX escape', self.s, i - 1)

    def obj(self, i):
        s = self.s
        pairs = []
        i = self.ws(i)
        if i < self.n and s[i] == '}':
            return self.make(pairs), i + 1
        while True:
            if i >= self.n or s[i] != '"':
                raise JSONDecodeError('Expecting property name enclosed in double quotes', s, i)
            key, i = self.string(i + 1)
            i = self.ws(i)
            if i >= self.n or s[i] != ':':
                raise JSONDecodeError("Expecting ':' delimiter", s, i)
            i = self.ws(i + 1)
            val, i = self.value(i)
            pairs.append((key, val))
            i = self.ws(i)
            if i < self.n and s[i] == '}':
                return self.make(pairs), i + 1
            if i >= self.n or s[i] != ',':
                raise JSONDecodeError("Expecting ',' delimiter", s, i)
            i = self.ws(i + 1)

    def make(self, pairs):
        if self.object_pairs_hook is not None:
            return self.object_pairs_hook(pairs)
        d = {}
        for k, v in pairs:
            d[k] = v
        if self.object_hook is not None:
            return self.object_hook(d)
        return d

    def arr(self, i):
        s = self.s
        out = []
        i = self.ws(i)
        if i < self.n and s[i] == ']':
            return out, i + 1
        while True:
            val, i = self.value(i)
            out.append(val)
            i = self.ws(i)
            if i < self.n and s[i] == ']':
                return out, i + 1
            if i >= self.n or s[i] != ',':
                raise JSONDecodeError("Expecting ',' delimiter", s, i)
            i = self.ws(i + 1)

def loads(s, cls=None, object_hook=None, parse_float=None, parse_int=None, parse_constant=None, object_pairs_hook=None, **kw):
    if not isinstance(s, str):
        raise TypeError('the JSON object must be str, bytes or bytearray, not %s' % type(s).__name__)
    p = _Parser(s, {'object_hook': object_hook, 'parse_float': parse_float, 'parse_int': parse_int, 'parse_constant': parse_constant, 'object_pairs_hook': object_pairs_hook})
    i = p.ws(0)
    val, i = p.value(i)
    j = p.ws(i)
    if j != len(s):
        raise JSONDecodeError('Extra data', s, j)
    return val

def load(fp, **kw):
    return loads(fp.read(), **kw)
`;

  PY['functools'] = String.raw`
from collections import namedtuple

WRAPPER_ASSIGNMENTS = ('__module__', '__name__', '__qualname__', '__doc__')

def reduce(function, iterable, *initial):
    it = iter(iterable)
    if initial:
        value = initial[0]
    else:
        try:
            value = next(it)
        except StopIteration:
            raise TypeError('reduce() of empty iterable with no initial value')
    for element in it:
        value = function(value, element)
    return value

class partial:
    def __init__(self, func, *args, **keywords):
        if not callable(func):
            raise TypeError('the first argument must be callable')
        self.func = func
        self.args = args
        self.keywords = keywords
    def __call__(self, *args, **keywords):
        kw = dict(self.keywords)
        kw.update(keywords)
        return self.func(*(self.args + args), **kw)
    def __repr__(self):
        parts = [repr(self.func)] + [repr(a) for a in self.args] + ['%s=%r' % (k, v) for k, v in self.keywords.items()]
        return 'functools.partial(' + ', '.join(parts) + ')'

def update_wrapper(wrapper, wrapped, assigned=WRAPPER_ASSIGNMENTS, updated=('__dict__',)):
    for attr in assigned:
        try:
            setattr(wrapper, attr, getattr(wrapped, attr))
        except Exception:
            pass
    try:
        wrapper.__wrapped__ = wrapped
    except Exception:
        pass
    return wrapper

def wraps(wrapped, assigned=WRAPPER_ASSIGNMENTS, updated=('__dict__',)):
    def decorator(wrapper):
        return update_wrapper(wrapper, wrapped, assigned, updated)
    return decorator

CacheInfo = namedtuple('CacheInfo', ['hits', 'misses', 'maxsize', 'currsize'])

class _Mark:
    pass

_kwd_mark = _Mark()

def _make_key(args, kwds, typed):
    key = args
    if kwds:
        key += (_kwd_mark,)
        for item in kwds.items():
            key += item
    if typed:
        key += tuple(type(v) for v in args)
        if kwds:
            key += tuple(type(v) for v in kwds.values())
    elif len(key) == 1 and type(key[0]) in (int, str):
        return key[0]
    return key

def _lru_wrapper(user_function, maxsize, typed):
    cache = {}
    order = []
    stats = [0, 0]
    def wrapper(*args, **kwds):
        key = _make_key(args, kwds, typed)
        if key in cache:
            stats[0] += 1
            if maxsize is not None:
                order.remove(key)
                order.append(key)
            return cache[key]
        stats[1] += 1
        result = user_function(*args, **kwds)
        if maxsize is None:
            cache[key] = result
        elif maxsize > 0:
            if key not in cache:
                cache[key] = result
                order.append(key)
                if len(order) > maxsize:
                    del cache[order.pop(0)]
        return result
    def cache_info():
        return CacheInfo(stats[0], stats[1], maxsize, len(cache))
    def cache_clear():
        cache.clear()
        del order[:]
        stats[0] = 0
        stats[1] = 0
    def cache_parameters():
        return {'maxsize': maxsize, 'typed': typed}
    wrapper.cache_info = cache_info
    wrapper.cache_clear = cache_clear
    wrapper.cache_parameters = cache_parameters
    return update_wrapper(wrapper, user_function)

def lru_cache(maxsize=128, typed=False):
    if isinstance(maxsize, int) and not isinstance(maxsize, bool):
        if maxsize < 0:
            maxsize = 0
    elif callable(maxsize) and isinstance(typed, bool):
        user_function, maxsize = maxsize, 128
        return _lru_wrapper(user_function, maxsize, typed)
    elif maxsize is not None:
        raise TypeError('Expected first argument to be an integer, a callable, or None')
    def decorating_function(user_function):
        return _lru_wrapper(user_function, maxsize, typed)
    return decorating_function

def cache(user_function):
    return lru_cache(maxsize=None)(user_function)

def cmp_to_key(mycmp):
    class K(object):
        def __init__(self, obj):
            self.obj = obj
        def __lt__(self, other):
            return mycmp(self.obj, other.obj) < 0
        def __gt__(self, other):
            return mycmp(self.obj, other.obj) > 0
        def __eq__(self, other):
            return mycmp(self.obj, other.obj) == 0
        def __le__(self, other):
            return mycmp(self.obj, other.obj) <= 0
        def __ge__(self, other):
            return mycmp(self.obj, other.obj) >= 0
    return K

def total_ordering(cls):
    def has(name):
        for base in cls.__mro__:
            if base is object:
                return False
            if name in base.__dict__:
                return True
        return False
    roots = [op for op in ('__lt__', '__le__', '__gt__', '__ge__') if has(op)]
    if not roots:
        raise ValueError('must define at least one ordering operation: < > <= >=')
    root = '__lt__' if '__lt__' in roots else '__le__' if '__le__' in roots else '__gt__' if '__gt__' in roots else '__ge__'
    if root == '__lt__':
        conv = {'__gt__': lambda s, o: not s.__lt__(o) and s != o, '__le__': lambda s, o: s.__lt__(o) or s == o, '__ge__': lambda s, o: not s.__lt__(o)}
    elif root == '__le__':
        conv = {'__ge__': lambda s, o: not s.__le__(o) or s == o, '__lt__': lambda s, o: s.__le__(o) and not s == o, '__gt__': lambda s, o: not s.__le__(o)}
    elif root == '__gt__':
        conv = {'__lt__': lambda s, o: not s.__gt__(o) and s != o, '__ge__': lambda s, o: s.__gt__(o) or s == o, '__le__': lambda s, o: not s.__gt__(o)}
    else:
        conv = {'__le__': lambda s, o: not s.__ge__(o) or s == o, '__gt__': lambda s, o: s.__ge__(o) and not s == o, '__lt__': lambda s, o: not s.__ge__(o)}
    for name, fn in conv.items():
        if name not in roots:
            setattr(cls, name, fn)
    return cls
`;

  PY['heapq'] = String.raw`
__all__ = ['heappush', 'heappop', 'heapify', 'heapreplace', 'merge', 'nlargest', 'nsmallest', 'heappushpop']

def _check(heap):
    if not isinstance(heap, list):
        raise TypeError('heap argument must be a list')

def _siftdown(heap, startpos, pos):
    newitem = heap[pos]
    while pos > startpos:
        parentpos = (pos - 1) >> 1
        parent = heap[parentpos]
        if newitem < parent:
            heap[pos] = parent
            pos = parentpos
            continue
        break
    heap[pos] = newitem

def _siftup(heap, pos):
    endpos = len(heap)
    startpos = pos
    newitem = heap[pos]
    childpos = 2 * pos + 1
    while childpos < endpos:
        rightpos = childpos + 1
        if rightpos < endpos and not heap[childpos] < heap[rightpos]:
            childpos = rightpos
        heap[pos] = heap[childpos]
        pos = childpos
        childpos = 2 * pos + 1
    heap[pos] = newitem
    _siftdown(heap, startpos, pos)

def heappush(heap, item):
    _check(heap)
    heap.append(item)
    _siftdown(heap, 0, len(heap) - 1)

def heappop(heap):
    _check(heap)
    if not heap:
        raise IndexError('index out of range')
    lastelt = heap.pop()
    if heap:
        returnitem = heap[0]
        heap[0] = lastelt
        _siftup(heap, 0)
        return returnitem
    return lastelt

def heapreplace(heap, item):
    _check(heap)
    if not heap:
        raise IndexError('index out of range')
    returnitem = heap[0]
    heap[0] = item
    _siftup(heap, 0)
    return returnitem

def heappushpop(heap, item):
    _check(heap)
    if heap and heap[0] < item:
        item, heap[0] = heap[0], item
        _siftup(heap, 0)
    return item

def heapify(x):
    _check(x)
    n = len(x)
    for i in reversed(range(n // 2)):
        _siftup(x, i)

def nsmallest(n, iterable, key=None):
    return sorted(iterable, key=key)[:max(n, 0)]

def nlargest(n, iterable, key=None):
    return sorted(iterable, key=key, reverse=True)[:max(n, 0)]

def merge(*iterables, key=None, reverse=False):
    items = []
    for it in iterables:
        items.extend(it)
    return iter(sorted(items, key=key, reverse=reverse))
`;

  PY['typing'] = String.raw`
TYPE_CHECKING = False

class _Special:
    def __init__(self, name):
        self._name = name
    def __getitem__(self, params):
        return self
    def __call__(self, *args, **kwargs):
        raise TypeError('Cannot instantiate typing.%s' % self._name)
    def __repr__(self):
        return 'typing.' + self._name

Any = _Special('Any')
List = _Special('List')
Dict = _Special('Dict')
Tuple = _Special('Tuple')
Set = _Special('Set')
FrozenSet = _Special('FrozenSet')
Optional = _Special('Optional')
Union = _Special('Union')
Callable = _Special('Callable')
Iterable = _Special('Iterable')
Iterator = _Special('Iterator')
Sequence = _Special('Sequence')
Mapping = _Special('Mapping')
MutableMapping = _Special('MutableMapping')
Generator = _Special('Generator')
Type = _Special('Type')
NoReturn = _Special('NoReturn')
Literal = _Special('Literal')
Final = _Special('Final')
ClassVar = _Special('ClassVar')
Deque = _Special('Deque')
DefaultDict = _Special('DefaultDict')
Counter = _Special('Counter')

class TypeVar:
    def __init__(self, name, *constraints, **kwargs):
        self.__name__ = name
    def __repr__(self):
        return '~' + self.__name__

def cast(typ, val):
    return val

def overload(func):
    return func

def final(f):
    return f
`;

  /** add the modules to Skulpt's library, replacing its stubs (os.py, json/__init__.py, functools.py, heapq.py) */
  function install(Sk) {
    const files = Sk.builtinFiles.files;
    for (const k of Object.keys(files)) if (/^src\/lib\/(os\.py|json\/|functools\.py|heapq\.py|typing\.py)/.test(k)) delete files[k];
    for (const name of Object.keys(PY)) files['src/lib/' + name + '.py'] = PY[name].replace(/^\n/, '');
    files['src/lib/_labfs.js'] = 'var $builtinmodule = function (name) { return (typeof self !== "undefined" ? self : globalThis).PYLIB.bridge(name); };';
  }
  const BUILTINS = ['open', 'OSError', 'FileNotFoundError', 'FileExistsError', 'IsADirectoryError', 'NotADirectoryError', 'PermissionError'];
  let ready = false, stderrObj = null;
  /** once per worker, after install and a Sk.configure: compile _labio (without the step-through's breakpoints) and put open() and the
      OSError family into the builtins. IOError and EnvironmentError are OSError, as in Python 3. */
  function setup(Sk) {
    if (ready) return true;
    if (!V) begin(null);
    const mod = Sk.importModule('_labio', false, false);
    for (const n of BUILTINS) Sk.builtins[n] = mod.tp$getattr(new Sk.builtin.str(n));
    Sk.builtins.IOError = Sk.builtins.EnvironmentError = Sk.builtins.OSError;
    stderrObj = mod.tp$getattr(new Sk.builtin.str('stderr'));
    ready = true;
    return true;
  }
  /** for the sys module as it is made (pyworker.js adds this to sys's source): platform, and stderr when setup has run */
  function patchSys(m, Sk) {
    m.platform = new Sk.builtin.str('linux');
    if (stderrObj) m.stderr = m.__stderr__ = stderrObj;
  }
  return { install, setup, patchSys, begin, changes, moduleFile, place, bridge, fs, PY, LIM, set onErr(f) { if (V) V.onErr = f; }, get state() { return V; } };
});
