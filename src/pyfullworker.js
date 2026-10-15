/* Full Python: CPython 3.14 (Pyodide, built for WebAssembly) in a Web Worker. It is never loaded in the page.
   runner.js (PYFULLRUN) downloads Pyodide's files from this site, checks each against the SHA-256 the build recorded, and starts a worker from
   lockdown.js + Pyodide's loader + its engine script + this file. lockdown.js has already removed fetch, importScripts, Worker, IndexedDB and the
   rest, so nothing here can reach the network: the 'init' message carries the engine and the standard library as bytes, and the fetch below,
   which serves only those, exists while Pyodide starts and is removed before any program runs.

   Messages from the page: {t:'init', base, lock, files: {name: ArrayBuffer}}   start Python; answers {t:'ready'} or {t:'fatal', error}
                           {t:'run', id, code, stdin, args, argv0, fs, typed, maxOut}   run a program:
                             stdin   the whole input (a string), or null when it is typed as the program asks (typed below)
                             fs      the files it sees: {cwd, home, env, entries: [[path,'d'] | [path,'f',text]], importDir} (as pylib.js); absent: an empty home
                             typed   {lines: [string|null], seed, skip}: the lines typed so far (runner.js typedRunner). A read past them ends the run
                                     with needInput; the page asks the student and runs the program again from the start with one more line. random is
                                     seeded with seed, so a replay draws the same numbers; the first skip characters of output are already on the screen.
   Messages to the page:   {t:'out', id, text, fd?}   what the program prints (fd 2: stderr)
                           {t:'done', id, err, exit, needInput, files}   err: the traceback, as python prints it; files: what it changed (pylib.js shape) */
(function () {
  'use strict';
  const post = (m) => self.postMessage(m);
  let py = null, files = null, busy = false;
  const RealResponse = self.Response;
  // While Pyodide starts it fetches its engine and standard library; this answers with the checked bytes the page sent, and nothing else.
  self.fetch = async (url) => {
    const name = String(url).split('/').pop().split('?')[0];
    if (files && Object.prototype.hasOwnProperty.call(files, name)) return new RealResponse(files[name], { headers: { 'Content-Type': name.endsWith('.wasm') ? 'application/wasm' : 'application/octet-stream' } });
    throw new TypeError('Full Python has no network access (' + name + ')');
  };

  // The Python side: runs each program as `python file.py` would, in a fresh __main__, and puts the interpreter back as it was afterwards.
  const HARNESS = String.raw`
import sys, os, io, builtins, traceback, linecache, random, json, shutil, types

sys.dont_write_bytecode = True
_se_builtins = dict(builtins.__dict__)
_se_path = [p for p in sys.path if p]
_se_hidden_names = ('js', 'pyodide_js', 'pyodide', '_pyodide', 'pyodide.ffi', 'pyodide.code', 'pyodide.http', 'pyodide.console', 'micropip')
_se_stdout = sys.stdout
_se_stderr = sys.stderr
_se_limit = sys.getrecursionlimit()
_se_modules = None
_se_saved = {}
_se_main = sys.modules['__main__']

class _SENeed(BaseException):
    pass

def _se_need():
    # Every line the program runs from now on raises again, so a bare except: around input() cannot keep it going
    def tracer(frame, event, arg):
        raise _SENeed()
    f = sys._getframe(1)
    while f is not None and f.f_code is not _se_run.__code__:
        f.f_trace = tracer
        f.f_trace_lines = True
        f = f.f_back
    sys.settrace(tracer)
    raise _SENeed()

class _SEStdin(io.TextIOBase):
    def __init__(self, text, lines):
        self._text = text
        self._pos = 0
        self._lines = lines
        self._i = 0
    def readable(self):
        return True
    def isatty(self):
        return self._lines is not None
    def fileno(self):
        raise io.UnsupportedOperation('fileno')
    def readline(self, size=-1):
        if self._lines is None:
            end = self._text.find('\n', self._pos)
            end = len(self._text) if end < 0 else end + 1
            if size is not None and size >= 0:
                end = min(end, self._pos + size)
            s = self._text[self._pos:end]
            self._pos = end
            return s
        if self._i < len(self._lines):
            line = self._lines[self._i]
            if line is None:
                return ''
            self._i += 1
            return line + '\n'
        _se_need()
    def read(self, size=-1):
        if self._lines is None:
            s = self._text[self._pos:] if size is None or size < 0 else self._text[self._pos:self._pos + size]
            self._pos += len(s)
            return s
        out = []
        while True:
            line = self.readline()
            if not line:
                return ''.join(out)
            out.append(line)
    def readlines(self, hint=-1):
        return list(iter(self.readline, ''))
    def __iter__(self):
        return self
    def __next__(self):
        line = self.readline()
        if not line:
            raise StopIteration
        return line

class _SEHide:
    # import js (and the rest of Pyodide's bridge to JavaScript) is not for programs; the worker has nothing to reach anyway
    def find_spec(self, name, path=None, target=None):
        if name.split('.')[0] in ('js', 'pyodide_js', 'pyodide', '_pyodide', 'micropip'):
            raise ModuleNotFoundError("No module named '%s'" % name, name=name)
        return None

_se_hide = _SEHide()

def _se_write_tree(entries):
    os.chdir('/')
    for top in ('/home', '/tmp'):
        if os.path.isdir(top):
            os.chmod(top, 0o777)
            for n in os.listdir(top):
                p = top + '/' + n
                if os.path.isdir(p) and not os.path.islink(p):
                    shutil.rmtree(p)
                else:
                    os.remove(p)
        else:
            os.makedirs(top)
    os.chmod('/', 0o755)
    known = {}
    for e in entries:
        path = e[0]
        if not isinstance(path, str) or not path.startswith('/') or '/../' in path + '/' or path.startswith('/lib') or path.startswith('/dev') or path.startswith('/proc'):
            continue
        inside = path.startswith('/home/') or path.startswith('/tmp/')
        try:
            if e[1] == 'd':
                os.makedirs(path, exist_ok=True)
                if inside:
                    known[path] = None
            elif e[1] == 'f' and len(e) > 2 and isinstance(e[2], str):
                os.makedirs(os.path.dirname(path), exist_ok=True)
                if inside or not os.path.exists(path):
                    with open(path, 'w', encoding='utf-8', newline='') as f:
                        f.write(e[2])
                if inside:
                    known[path] = e[2]
        except OSError:
            pass
    # Writing is for /home and /tmp, as in the shell: everything else is read-only
    for top in ('/', '/etc', '/usr', '/bin', '/opt', '/var'):
        if os.path.isdir(top):
            os.chmod(top, 0o555)
    return known

def _se_changes(known):
    now = {}
    for top in ('/home', '/tmp'):
        for root, dirs, names in os.walk(top):
            dirs.sort()
            for d in dirs:
                now[root + '/' + d] = None
            for n in sorted(names):
                p = root + '/' + n
                try:
                    with open(p, encoding='utf-8', errors='replace', newline='') as f:
                        now[p] = f.read(300000)
                except OSError:
                    pass
    rm = [p for p in known if p not in now or (known[p] is None) != (now[p] is None)]
    top_rm = sorted(p for p in rm if not any(p.startswith(q + '/') and known[q] is None for q in rm if q != p))
    gone = set(rm)
    mkdir = sorted(p for p, v in now.items() if v is None and (p not in known or p in gone))
    write = sorted([p, v] for p, v in now.items() if v is not None and (p not in known or p in gone or known[p] != v))
    if not (top_rm or mkdir or write):
        return None
    return {'rm': top_rm, 'mkdir': mkdir, 'write': write}

def _se_run(spec_json, code):
    global _se_modules
    spec = json.loads(spec_json)
    if _se_modules is None:
        _se_modules = set(sys.modules)
        for m, mod in sys.modules.items():
            if mod is not None and m not in ('sys', 'builtins', '__main__') and m.split('.')[0] not in ('js', 'pyodide_js', 'pyodide', '_pyodide', 'micropip'):
                _se_saved[m] = (mod, dict(mod.__dict__))
    for m in list(sys.modules):
        if m not in _se_modules:
            del sys.modules[m]
    # a module the interpreter had loaded before goes back as it was (a program may have changed math.tau or random.choice)
    for m, (mod, saved) in _se_saved.items():
        d = mod.__dict__
        for k in [k for k in d if k not in saved]:
            del d[k]
        for k, v in saved.items():
            if d.get(k, _se_saved) is not v:
                d[k] = v
        sys.modules[m] = mod
    builtins.__dict__.clear()
    builtins.__dict__.update(_se_builtins)
    sys.setrecursionlimit(_se_limit)
    sys.settrace(None)
    sys.stdout = _se_stdout
    sys.stderr = _se_stderr
    fs = spec.get('fs')
    known = _se_write_tree((fs.get('entries') or []) if fs else [])
    home = (fs or {}).get('home') or '/home/student'
    os.makedirs(home, exist_ok=True)
    p = home
    while p.startswith('/home/') or p.startswith('/tmp/'):   # made here, not by the program
        known.setdefault(p, None)
        p = os.path.dirname(p)
    cwd = (fs or {}).get('cwd') or home
    try:
        os.chdir(cwd)
    except OSError:
        os.chdir(home)
    os.environ.clear()
    os.environ.update({'HOME': home, 'USER': 'student', 'LANG': 'C.UTF-8', 'PWD': os.getcwd()})
    os.environ.update({k: v for k, v in ((fs or {}).get('env') or {}).items() if isinstance(v, str)})
    name = spec.get('name') or 'main.py'
    sys.argv = [spec.get('argv0') or name] + list(spec.get('args') or [])
    sys.path[:] = [(fs or {}).get('importDir') or os.getcwd()] + _se_path
    typed = spec.get('typed')
    sys.stdin = _SEStdin(spec.get('stdin') or '', typed['lines'] if typed else None)
    if typed and typed.get('seed') is not None:
        random.seed(typed['seed'])
    else:
        random.seed()
    linecache.cache[name] = (len(code), None, code.splitlines(True), name)
    hidden = {k: sys.modules.pop(k) for k in list(sys.modules) if k.split('.')[0] in ('js', 'pyodide_js', 'pyodide', '_pyodide', 'micropip')}
    sys.meta_path.insert(0, _se_hide)
    status, err, need = 0, None, False
    try:
        try:
            compiled = compile(code, name, 'exec', dont_inherit=True)
        except SyntaxError as e:
            return json.dumps({'exit': 1, 'err': ''.join(traceback.format_exception_only(type(e), e)), 'files': None})
        main = types.ModuleType('__main__')
        main.__file__ = name
        main.__builtins__ = builtins
        sys.modules['__main__'] = main
        exec(compiled, main.__dict__)
    except _SENeed:
        need = True
    except SystemExit as e:
        c = e.code
        if c is None:
            status = 0
        elif isinstance(c, int) and not isinstance(c, bool):
            status = c & 0xff
        else:
            err = str(c)
            status = 1
    except BaseException as e:
        tb = e.__traceback__
        while tb is not None and tb.tb_frame.f_code is _se_run.__code__:
            tb = tb.tb_next
        err = ''.join(traceback.format_exception(type(e), e, tb))
        status = 1
    finally:
        sys.settrace(None)
        if _se_hide in sys.meta_path:
            sys.meta_path.remove(_se_hide)
        sys.modules.update(hidden)
        sys.modules['__main__'] = _se_main
        for s in (sys.stdout, sys.stderr, _se_stdout, _se_stderr):
            try:
                s.flush()
            except Exception:
                pass
        sys.stdout = _se_stdout
        sys.stderr = _se_stderr
        os.chdir('/')
    changes = None if need else _se_changes(known)
    return json.dumps({'exit': status, 'err': err, 'need': need, 'files': changes})
`;

  async function init(m) {
    files = m.files || {};
    py = await loadPyodide({ indexURL: String(m.base || './'), createPyodideModule: self.__createPyodideModule, lockFileContents: String(m.lock || ''), packages: [], fullStdLib: false, env: { HOME: '/home/student' } });
    files = null;
    try { delete self.fetch; } catch (e) { self.fetch = undefined; }
    py.runPython(HARNESS);
  }

  let cur = null;   // the run in progress: { id, skip: {1, 2}, seen: {1, 2}, out, maxOut }
  let decoders = null;
  function emit(fd, bytes) {
    const text = decoders ? decoders[fd].decode(bytes, { stream: true }) : '';
    if (!cur || !text) return bytes.length;
    let t = text;
    if (cur.seen[fd] < cur.skip[fd]) { const drop = Math.min(t.length, cur.skip[fd] - cur.seen[fd]); cur.seen[fd] += drop; t = t.slice(drop); }   // already on the screen (a replay)
    if (t) { cur.out += t.length; if (cur.out <= cur.maxOut) post(fd === 2 ? { t: 'out', id: cur.id, text: t, fd: 2 } : { t: 'out', id: cur.id, text: t }); }
    return bytes.length;
  }

  function run(m) {
    const typed = m.typed && Array.isArray(m.typed.lines) ? { lines: m.typed.lines.slice(0, 5000).map((l) => (l == null ? null : String(l))), seed: Number(m.typed.seed) | 0 } : null;
    cur = { id: m.id, skip: { 1: typed ? Math.max(0, Number(m.typed.skip) || 0) : 0, 2: typed ? Math.max(0, Number(m.typed.skipErr) || 0) : 0 }, seen: { 1: 0, 2: 0 }, out: 0, maxOut: Number(m.maxOut) || 2e6 };
    decoders = { 1: new TextDecoder(), 2: new TextDecoder() };
    const spec = { fs: m.fs && typeof m.fs === 'object' ? m.fs : null, stdin: typeof m.stdin === 'string' ? m.stdin : null, args: Array.isArray(m.args) ? m.args.slice(0, 1000).map(String) : [],
      argv0: typeof m.argv0 === 'string' ? m.argv0 : null, name: typeof m.name === 'string' ? m.name : 'main.py', typed };
    let r;
    try {
      py.globals.set('_se_spec', JSON.stringify(spec));
      py.globals.set('_se_code', String(m.code));
      r = JSON.parse(py.runPython('_se_run(_se_spec, _se_code)'));
    } catch (e) {
      r = { exit: 1, err: 'Full Python stopped unexpectedly: ' + String(e && e.message || e).split('\n').slice(-3).join('\n'), files: null };
    }
    const id = cur.id; cur = null;
    post({ t: 'done', id, err: r.err == null ? null : String(r.err).replace(/\n+$/, ''), exit: Number(r.exit) || 0, needInput: r.need === true, files: r.files || null });
  }

  self.onmessage = async (e) => {
    const m = e.data;
    if (!m || typeof m !== 'object') return;
    if (m.t === 'init' && !py) {
      try {
        await init(m);
        py.setStdout({ write: (b) => emit(1, b), isatty: true });
        py.setStderr({ write: (b) => emit(2, b), isatty: true });
        post({ t: 'ready' });
      } catch (err) { post({ t: 'fatal', error: 'Full Python could not start (' + String(err && err.message || err).split('\n')[0] + ')' }); }
    } else if (m.t === 'run' && py) {
      if (busy) { post({ t: 'done', id: m.id, err: 'Full Python is busy with another program.', exit: 1 }); return; }
      busy = true;
      try { run(m); } finally { busy = false; }
    }
  };
})();
