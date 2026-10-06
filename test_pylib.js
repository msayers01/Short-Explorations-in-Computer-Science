// The Python sandbox's additions (src/pylib.js): files through open() and os, json, functools, heapq, typing, sys.stderr and sys.platform,
// run in Skulpt in node as the worker runs them, and compared with what CPython 3 prints for the same programs on the same files.
//   node test_pylib.js            compare with difftest/pylib-expected.json (recorded from CPython)
//   node test_pylib.js --update   run every case in the local python3 (in a scratch folder holding the case's files) and record its output
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
global.window = global; global.self = global;
require('./node_modules/skulpt/dist/skulpt.min.js'); require('./node_modules/skulpt/dist/skulpt-stdlib.js');
const SANDBOX = require('./src/sandbox.js');
const PYLIB = require('./src/pylib.js');
global.PYLIB = PYLIB;
SANDBOX.lockDown(Sk);
PYLIB.install(Sk);
const SYS_PATCH = '\nvar $sysModule=$builtinmodule;$builtinmodule=function(n){var m=$sysModule(n);if(self.PYLIB)self.PYLIB.patchSys(m,Sk);return m;};';
const read = (f) => { if (Sk.builtinFiles.files[f] !== undefined) return f === 'src/builtin/sys.js' ? Sk.builtinFiles.files[f] + SYS_PATCH : Sk.builtinFiles.files[f]; const own = PYLIB.moduleFile(f); if (own !== undefined) return own; throw 'File not found: ' + f; };
Sk.configure({ output: () => {}, read, __future__: Sk.python3 });
PYLIB.setup(Sk);

let failed = 0;
const check = (name, got, want) => { if (got !== want) { failed++; console.log('FAIL ' + name + '\n  got:  ' + JSON.stringify(got) + '\n  want: ' + JSON.stringify(want)); } };

const HOME = '/home/student';
async function runSk(c) {
  const entries = [[HOME, 'd'], [HOME + '/lab', 'd'], ['/etc', 'd']];
  for (const [rel, text] of Object.entries(c.files || {})) entries.push([HOME + '/lab/' + rel, 'f', text]);
  PYLIB.begin({ cwd: HOME + '/lab', home: HOME, entries, env: { HOME, USER: 'student' } });
  let out = '', err = '';
  PYLIB.onErr = (s) => { err += s; };
  Sk.configure({ output: (t) => { out += t; }, read, __future__: Sk.python3, execLimit: 20000, inputfun: () => '', inputfunTakesPrompt: true, sysargv: ['main.py'] });
  let exc = '';
  try { await Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('<stdin>', false, c.code, true)); }
  catch (e) { exc = String(e.toString()).replace(/ on line \d+$/, ''); }
  const ch = PYLIB.changes();
  return { out, err, exc, changes: ch ? JSON.stringify(ch).split(HOME + '/lab/').join('') : '' };
}
// CPython, in a scratch folder holding the same files; the error is the last line of the traceback
function runPy(c) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pylib-'));
  for (const [rel, text] of Object.entries(c.files || {})) { fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true }); fs.writeFileSync(path.join(dir, rel), text); }
  const r = cp.spawnSync('python3', ['-c', c.code], { cwd: dir, encoding: 'utf8', env: { PATH: process.env.PATH, HOME: '/home/student', USER: 'student', LANG: 'C.UTF-8' } });
  fs.rmSync(dir, { recursive: true, force: true });
  const lines = r.stderr.split('\n').filter(Boolean), tb = lines.findIndex((l) => l.startsWith('Traceback'));
  const exc = tb >= 0 ? lines[lines.length - 1] : '';
  return { out: r.stdout, err: tb >= 0 ? lines.slice(0, tb).map((l) => l + '\n').join('') : r.stderr, exc };
}

const FILES = { 'data.txt': 'one\ntwo\nthree', 'notes.txt': 'café\n', 'sub/a.txt': 'A\n', 'sub/deep/b.txt': 'B\n' };
const CASES = [
  { name: 'read a file: whole, lines, a last line without a newline', files: FILES, code: `
f = open('data.txt')
print(repr(f.read()))
f.close()
with open('data.txt') as f:
    print(f.readlines())
with open('data.txt') as f:
    for line in f:
        print(repr(line))
with open('data.txt', 'r') as f:
    print(repr(f.readline()), repr(f.readline(2)), repr(f.readline()), repr(f.read()), repr(f.readline()))
print(f.closed)
try:
    f.read()
except ValueError as e:
    print('ValueError', e)
print([l.strip() for l in open('data.txt')])
print(len(open('notes.txt').read()))
` },
  { name: 'write, append, x, print(file=), writelines, seek and tell', files: FILES, code: `
with open('out.txt', 'w') as f:
    n = f.write('hello\\n')
    print('one', 2, sep='-', file=f)
    f.writelines(['a\\n', 'b\\n'])
print(n, repr(open('out.txt').read()))
with open('out.txt', 'a') as f:
    f.write('more\\n')
print(open('out.txt').read().splitlines())
with open('new.txt', 'x') as f:
    f.write('x')
try:
    open('new.txt', 'x')
except FileExistsError as e:
    print(type(e).__name__, e.errno, e)
f = open('data.txt', 'r+')
print(f.read(3), f.tell())
f.seek(0)
f.write('ONE')
f.close()
print(repr(open('data.txt').read()))
f = open('empty.txt', 'w')
f.close()
print(repr(open('empty.txt').read()))
w = open('w.txt', 'w')
w.write('kept even if never closed')
` },
  { name: 'errors: missing file, a folder, no folder, the wrong mode, not str', files: FILES, code: `
for name, mode in [('nope.txt', 'r'), ('sub', 'r'), ('nofolder/x.txt', 'w'), ('sub', 'w')]:
    try:
        open(name, mode)
    except OSError as e:
        print(type(e).__name__, e.errno, repr(e.strerror), repr(e.filename), isinstance(e, OSError), e)
try:
    open('nope.txt')
except IOError as e:
    print('IOError catches it:', type(e).__name__)
try:
    open('data.txt').write('x')
except Exception as e:
    print(type(e).__name__, e)
try:
    open('o.txt', 'w').read()
except Exception as e:
    print(type(e).__name__, e)
try:
    open('o.txt', 'w').write(5)
except TypeError as e:
    print('TypeError', e)
try:
    open('o.txt', 'rw')
except ValueError as e:
    print('ValueError', e)
print(OSError(2, 'No such file or directory', 'x.txt'))
print(OSError('plain message'))
print(FileNotFoundError(2, 'No such file or directory'))
open('missing.txt')
` },
  { name: 'os and os.path on the files', files: FILES, code: `
import os
import os.path
print(sorted(os.listdir('.')), sorted(os.listdir()), os.listdir('sub/deep'))
print(os.path.exists('data.txt'), os.path.isfile('data.txt'), os.path.isdir('data.txt'), os.path.isdir('sub'), os.path.exists('nope'))
print(os.path.getsize('data.txt'), os.path.getsize('notes.txt'))
os.mkdir('made')
os.makedirs('a/b/c')
os.makedirs('a/b/c', exist_ok=True)
try:
    os.makedirs('a/b/c')
except FileExistsError as e:
    print('FileExistsError', e.errno)
try:
    os.mkdir('made')
except FileExistsError as e:
    print(e)
os.rename('data.txt', 'made/data2.txt')
print(sorted(os.listdir('made')), os.path.exists('data.txt'))
os.remove('made/data2.txt')
os.rmdir('made')
try:
    os.rmdir('sub')
except OSError as e:
    print(type(e).__name__, e.errno, e.strerror)
try:
    os.remove('sub')
except OSError as e:
    print(type(e).__name__, e)
try:
    os.listdir('notes.txt')
except NotADirectoryError as e:
    print('NotADirectoryError', e)
try:
    os.remove('gone.txt')
except FileNotFoundError as e:
    print(e)
for root, dirs, files in os.walk('sub'):
    print(root, sorted(dirs), sorted(files))
before = os.getcwd()
os.chdir('sub')
print(open('a.txt').read().strip(), os.path.basename(os.getcwd()))
os.chdir('..')
print(os.getcwd() == before, os.sep, os.name, repr(os.linesep), os.curdir, os.pardir)
print(os.path.abspath('x.txt') == os.path.join(os.getcwd(), 'x.txt'))
print(os.getenv('NOPE'), os.getenv('NOPE', 'dflt'), os.environ.get('USER'))
` },
  { name: 'os.path: pure string functions', code: `
import os.path as p
for a in ['', '/', 'a', 'a/', '/a/b', 'a/b/', '//a', '///a/b', 'a/./b/../c', '../x', '/..', 'a/..', '.hidden', 'f.tar.gz', 'dir.d/file', '...', 'a..b']:
    print(repr(a), p.split(a), p.basename(a), repr(p.dirname(a)), p.splitext(a), p.normpath(a), p.isabs(a))
print(p.join('a', 'b', 'c'), p.join('a/', 'b'), p.join('a', '/b', 'c'), p.join('', 'x'), p.join('a', ''))
print(p.relpath('/a/b/c', '/a'), p.relpath('/a', '/a/b/c'), p.relpath('/a/b', '/a/b'), p.relpath('/x/y', '/a/b'))
print(p.commonprefix(['/usr/lib', '/usr/local']), p.expanduser('~/x'), p.expanduser('~'), p.expanduser('a~'))
` },
  { name: 'json: dumps', code: `
import json
print(json.dumps({'name': 'Ada', 'age': 36, 'langs': ['en', 'fr'], 'ok': True, 'none': None, 'pi': 3.14}))
print(json.dumps([1, 2.5, -0.0, 1e20, 1.5e-7, 10**20, 'a"b\\\\c\\n\\t\\x01']))
print(json.dumps({'b': 1, 'a': [1, {'c': 2}], 'e': {}, 'f': []}, indent=2))
print(json.dumps({'b': 1, 'a': 2}, sort_keys=True, indent='\\t'))
print(json.dumps([1, 2], separators=(',', ':')), json.dumps({'a': 1}, separators=(',', ':')))
print(json.dumps('café ☃ 😀'), json.dumps('café ☃ 😀', ensure_ascii=False))
print(json.dumps({1: 'one', 2.5: 'x', True: 't', None: 'n'}))
print(json.dumps((1, 2)), json.dumps(float('inf')), json.dumps(float('nan')), json.dumps(-float('inf')))
try:
    json.dumps({(1, 2): 3})
except TypeError as e:
    print('TypeError', e)
try:
    json.dumps({1, 2})
except TypeError as e:
    print('TypeError', e)
print(json.dumps({1, 2}, default=sorted))
print(json.dumps({'x': 1, 'y': None}, indent=0))
` },
  { name: 'json: loads, errors, files', files: FILES, code: `
import json
s = ' {"a": [1, 2.0, -3e2, true, false, null], "b": "x\\\\u00e9\\\\n\\\\"q\\\\"", "c": {}, "d": [], "e": "\\\\ud83d\\\\ude00", "f": 0.5} '
v = json.loads(s)
print(v)
print(type(v['a'][0]).__name__, type(v['a'][1]).__name__, type(v['a'][2]).__name__, v['e'] == '\\U0001F600')
print(json.loads('"plain"'), json.loads('12'), json.loads('-0'), json.loads('[NaN, Infinity]'))
for bad in ['', '[1, 2', '{"a" 1}', '{a: 1}', '[1,]', '[1 2]', '1 2', '"abc', 'tru', '{"a": 1,}', '"a\\\\qb"', '\\n\\n  x']:
    try:
        json.loads(bad)
    except json.JSONDecodeError as e:
        print(repr(bad), '->', e, '|', e.msg, e.lineno, e.colno, e.pos, isinstance(e, ValueError))
data = {'scores': [3, 1, 2], 'name': 'test'}
with open('d.json', 'w') as f:
    json.dump(data, f, indent=2)
with open('d.json') as f:
    print(json.load(f) == data)
print(open('d.json').read())
print(json.loads('{"a": 1, "a": 2}'), json.loads('[1.5]', parse_float=str), json.loads('{"x": 1}', object_hook=lambda d: sorted(d)))
` },
  { name: 'functools', code: `
from functools import reduce, partial, lru_cache, cache, wraps, total_ordering, cmp_to_key
import functools
print(reduce(lambda a, b: a * b, [1, 2, 3, 4]), reduce(lambda a, b: a + b, [], 10))
try:
    reduce(lambda a, b: a, [])
except TypeError as e:
    print('TypeError', e)
base2 = partial(int, base=2)
print(base2('1011'), partial(max, 5)(3, 9), base2.args, base2.keywords)
@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)
print(fib(80), fib.cache_info())
@lru_cache
def sq(x):
    return x * x
print(sq(3), sq(3), sq(4), sq.cache_info())
@lru_cache(maxsize=2)
def f(x):
    return x
for x in [1, 2, 1, 3, 2, 1]:
    f(x)
print(f.cache_info())
f.cache_clear()
print(f.cache_info())
@cache
def g(a, b=1):
    return a + b
print(g(1), g(1, b=1), g(1), g.cache_info())
def deco(fn):
    @wraps(fn)
    def inner(*a):
        return fn(*a)
    return inner
@deco
def hello():
    "says hi"
    return 'hi'
print(hello(), hello.__name__, hello.__doc__, hello.__wrapped__.__name__)
@total_ordering
class V:
    def __init__(self, n):
        self.n = n
    def __eq__(self, o):
        return self.n == o.n
    def __lt__(self, o):
        return self.n < o.n
print(V(1) < V(2), V(1) <= V(1), V(2) > V(1), V(1) >= V(2), V(3) >= V(3))
def cmp(a, b):
    return (len(a) > len(b)) - (len(a) < len(b)) or (a > b) - (a < b)
print(sorted(['pear', 'fig', 'apple', 'kiwi'], key=cmp_to_key(cmp)))
print(sorted([3, 1, 2], key=functools.cmp_to_key(lambda a, b: b - a)))
` },
  { name: 'heapq', code: `
import heapq
h = []
for x in [5, 3, 8, 1, 9, 2, 7, 3]:
    heapq.heappush(h, x)
    print(h)
out = []
while h:
    out.append(heapq.heappop(h))
    print(h)
print(out)
data = [9, 4, 7, 1, 8, 2, 6, 3, 5, 0]
heapq.heapify(data)
print(data)
print(heapq.heappushpop(data, -1), heapq.heappushpop(data, 4), data)
print(heapq.heapreplace(data, 10), data)
print(heapq.nlargest(3, [5, 1, 8, 3, 9, 2]), heapq.nsmallest(2, [5, 1, 8, 3, 9, 2]), heapq.nsmallest(10, [3, 1]))
words = ['pear', 'fig', 'banana', 'kiwi', 'apple', 'date']
print(heapq.nlargest(2, words, key=len), heapq.nsmallest(3, words, key=len))
print(list(heapq.merge([1, 4, 7], [2, 5, 8], [0, 9])))
t = []
for item in [(2, 'b'), (1, 'z'), (2, 'a'), (1, 'y')]:
    heapq.heappush(t, item)
print([heapq.heappop(t) for _ in range(4)])
try:
    heapq.heappop([])
except IndexError as e:
    print('IndexError', e)
` },
  { name: 'import the student\'s own modules from the folder', files: { 'helper.py': 'def twice(x):\n    return 2 * x\nNAME = "helper"\n', 'pkg/__init__.py': 'P = 1\n', 'pkg/m.py': 'V = 7\n', 'evil.js': 'throw 1' }, code: `
import helper
from pkg import m
import pkg
print(helper.twice(21), helper.NAME, m.V, pkg.P)
try:
    import evil
except ImportError as e:
    print('ImportError')
` },
  { name: 'typing, sys.platform, sys.stderr', code: `
from typing import List, Dict, Optional, Tuple, Any, Union, Callable
import sys
def total(xs: List[int], extra: Optional[int] = None) -> int:
    return sum(xs) + (extra or 0)
pairs: Dict[str, Tuple[int, int]] = {'a': (1, 2)}
print(total([1, 2, 3]), total([1], 5), pairs)
print(sys.platform)
print('to stderr', 42, file=sys.stderr)
sys.stderr.write('written\\n')
print('to stdout')
` }
];

const EXPECT_FILE = 'difftest/pylib-expected.json';
(async () => {
  if (process.argv.includes('--update')) {
    const v = cp.spawnSync('python3', ['--version'], { encoding: 'utf8' });
    const rec = { python: (v.stdout || v.stderr).trim(), cases: {} };
    for (const c of CASES) rec.cases[c.name] = runPy(c);
    fs.writeFileSync(EXPECT_FILE, JSON.stringify(rec, null, 1) + '\n');
    console.log('recorded ' + CASES.length + ' cases from ' + rec.python + ' in ' + EXPECT_FILE);
    return;
  }
  const want = JSON.parse(fs.readFileSync(EXPECT_FILE, 'utf8'));
  for (const c of CASES) {
    const w = want.cases[c.name]; if (!w) { failed++; console.log('FAIL ' + c.name + ': not recorded (node test_pylib.js --update)'); continue; }
    const g = await runSk(c);
    check(c.name + ': stdout', g.out, w.out);
    check(c.name + ': stderr', g.err, w.err);
    check(c.name + ': error', g.exc, w.exc);
  }
  // what the program changed comes back to the page as one list (the terminal applies it; nothing outside /home and /tmp is written)
  {
    const r = await runSk({ files: FILES, code: "import os\nopen('new.txt','w').write('n')\nopen('data.txt','a').write('!')\nos.remove('notes.txt')\nos.makedirs('x/y')\nos.rename('sub', 'moved')\nopen('/tmp/t.txt','w').write('t')" });
    check('changes: written, made, removed, renamed', r.changes, JSON.stringify({ rm: ['notes.txt', 'sub'], mkdir: ['moved', 'moved/deep', 'x', 'x/y'], write: [['data.txt', 'one\ntwo\nthree!'], ['moved/a.txt', 'A\n'], ['moved/deep/b.txt', 'B\n'], ['new.txt', 'n'], ['/tmp/t.txt', 't']] }));
    const ro = await runSk({ code: "try:\n    open('/etc/x', 'w')\nexcept PermissionError as e:\n    print(e)\ntry:\n    open('big.txt', 'w').write('x' * 300000)\nexcept OSError as e:\n    print(e.errno, e.strerror)" });
    check('changes: outside /home and /tmp, and over the size limit', ro.out, "[Errno 13] Permission denied: '/etc/x'\n27 File too large\n");
    check('changes: nothing changed is null', (await runSk({ files: FILES, code: "print(open('data.txt').read()[:3])" })).changes, '');
    // a hostile snapshot from the page side (below): bad entries are skipped, the run still works
    // an error raised inside the library names the student's line, and the file when it is one of their modules
    const at = async (files, code) => { PYLIB.begin({ cwd: HOME, entries: [[HOME, 'd']].concat(Object.entries(files).map(([n, t]) => [HOME + '/' + n, 'f', t])) }); try { await Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('<stdin>', false, code, true)); return 'no error'; } catch (e) { return PYLIB.place(e); } };
    check('error place: open() in the program', await at({}, "x = 1\nopen('nope.txt')"), ' on line 2');
    check('error place: json in a function', await at({}, "import json\ndef g():\n    json.loads('[')\ng()"), ' on line 3');
    check('error place: a module of the student\'s', await at({ 'helper.py': 'def f():\n    return 1/0\n' }, 'import helper\n\nhelper.f()'), ' on line 2 of helper.py');
    PYLIB.begin({ cwd: 5, entries: [null, ['rel', 'f', 'x'], ['/home/student/a', 'f', 7], ['/home/student/__proto__', 'f', 'p'], ['/home/student/ok.txt', 'f', 'ok']], env: { 'BAD NAME': 'x', OK: 3, FINE: 'yes' } });
    check('hostile snapshot: files', JSON.stringify([...PYLIB.state.nodes.keys()].sort()), JSON.stringify(['/', '/home', '/home/student', '/home/student/__proto__', '/home/student/ok.txt', '/tmp']));
    check('hostile snapshot: env', JSON.stringify(PYLIB.state.env), JSON.stringify({ FINE: 'yes', HOME: '/home/student' }));
  }
  console.log(failed ? failed + ' FAILED' : 'pylib OK (' + CASES.length + ' programs as ' + want.python + ' runs them, and the file changes)');
  process.exit(failed ? 1 : 0);
})();
