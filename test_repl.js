// The terminal's interactive shells (src/repl.js): `python` with no file replays its entries in Skulpt (as the page's sandbox does),
// `scheme` with no file keeps one environment. Each test types lines as a student would and compares the screen.
'use strict';
const REPL = require('./src/repl.js'), Scheme = require('./src/scheme.js');
require('./node_modules/skulpt/dist/skulpt.min.js'); require('./node_modules/skulpt/dist/skulpt-stdlib.js');
let fails = 0, passes = 0;
const check = (name, ok, extra) => { if (ok) passes++; else { fails++; console.log('FAIL ' + name + (extra !== undefined ? '\n   ' + JSON.stringify(extra) : '')); } };

// the page's PYRUN.run, in node: Skulpt with an output and an input() that asks
async function run(code, o) {
  let err = null;
  Sk.configure({ output: (t) => o.onOutput(t), read: (f) => { if (!Sk.builtinFiles.files[f]) throw 'not found ' + f; return Sk.builtinFiles.files[f]; }, __future__: Sk.python3, execLimit: 5000, inputfun: (p) => Promise.resolve(o.onInput(p)), inputfunTakesPrompt: true });
  try { await Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('<stdin>', false, code, true)); } catch (e) { err = e.toString(); }
  return { err };
}
// a session: lines typed in order (null is Ctrl+D); the screen is everything shown, with each prompt and the typed line
async function session(lang, lines) {
  let screen = '', i = 0, asked = 0;
  const o = { out: (s) => { screen += s; }, err: (s) => { screen += s; }, ask: (p) => { asked++; const v = i < lines.length ? lines[i++] : null; screen += p + (v == null ? '^D' : v) + '\n'; return Promise.resolve(v); }, run, Scheme, cancelled: () => false };
  const exit = await REPL[lang](o);
  return { screen: screen.slice(screen.indexOf(lang === 'python' ? '>>> ' : '1 ]=> ')), exit, asked };   // without the banner
}

(async () => {
  let r = await session('python', ['1 + 2', 'x = 10', 'x * 4', 'print("hi", x)', 'None', null]);
  check('python: expressions show their value, statements show nothing, print prints once', r.screen === '>>> 1 + 2\n3\n>>> x = 10\n>>> x * 4\n40\n>>> print("hi", x)\nhi 10\n>>> None\n>>> ^D\n\n' && r.exit === 0, r.screen);

  r = await session('python', ['def square(n):', '    return n * n', '', 'square(7)', "'text'", 'exit()']);
  check('python: a block takes ... lines until an empty one; a string shows its repr', r.screen === '>>> def square(n):\n...     return n * n\n... \n>>> square(7)\n49\n>>> \'text\'\n\'text\'\n>>> exit()\n', r.screen);

  r = await session('python', ['y', 'z = 1 +', 'z = [1,', '2]', 'z', 'exit']);
  check('python: an error is shown and the entry is dropped; brackets continue; exit alone explains itself', /^>>> y\nTraceback \(most recent call last\):\n  File "<stdin>", line 1, in <module>\nNameError: name 'y' is not defined\n>>> z = 1 \+\n  File "<stdin>", line 1\n    z = 1 \+\nSyntaxError: invalid syntax\n>>> z = \[1,\n\.\.\. 2\]\n>>> z\n\[1, 2\]\n>>> exit\nUse exit\(\) or Ctrl\+D/.test(r.screen), r.screen);

  r = await session('python', ['import random', 'a = random.randint(1, 1000000)', 'b = random.randint(1, 1000000)', 'a == b', 'print(a > 0)', null]);
  check('python: random numbers stay the same as entries are replayed', /a == b\nFalse\n>>> print\(a > 0\)\nTrue\n/.test(r.screen), r.screen);

  r = await session('python', ['name = input("Name? ")', 'Ada', 'len(name)', 'name.upper()', null]);
  check('python: input() asks once, and its answer is reused when the entry is replayed', r.screen === '>>> name = input("Name? ")\nName? Ada\n>>> len(name)\n3\n>>> name.upper()\n\'ADA\'\n>>> ^D\n\n' && r.asked === 5, r.screen);

  r = await session('python', ['for i in range(3):', '    print(i)', '', 'i', null]);
  check('python: a loop runs once; its variable stays', r.screen === '>>> for i in range(3):\n...     print(i)\n... \n0\n1\n2\n>>> i\n2\n>>> ^D\n\n', r.screen);

  check('needsMore: colons, brackets, triple quotes, backslashes; not a colon in a string or comment', REPL.needsMore('if x:') && REPL.needsMore('f(1,') && REPL.needsMore('s = """a') && REPL.needsMore('x = 1 + \\') && !REPL.needsMore('d = {1: 2}') && !REPL.needsMore('print("a:")') && !REPL.needsMore('x = 1  # note:'));

  r = await session('scheme', ['(define (sq x) (* x x))', '(sq 12)', '(display "hi")', '(car (quote ()))', '(+ 1', '2)', '(exit)']);
  check('scheme: definitions stay, values are shown MIT-style, errors do not end the session, open parentheses continue', /1 \]=> \(define \(sq x\) \(\* x x\)\)\n;Value: sq\n1 \]=> \(sq 12\)\n;Value: 144\n1 \]=> \(display "hi"\)\nhi\n;Unspecified return value\n1 \]=> \(car \(quote \(\)\)\)\n;[^\n]+\n1 \]=> \(\+ 1\n2\)\n;Value: 3\n1 \]=> \(exit\)\n;Moriturus te saluto\./.test(r.screen) && r.exit === 0, r.screen);

  // jshell, with the site's Java interpreter as the runner
  const JAVA = require('./src/java.js');
  const jsession = async (lines) => { let screen = '', i = 0; const o = { out: (s) => { screen += s; }, err: (s) => { screen += s; }, ask: (p) => { const v = i < lines.length ? lines[i++] : null; screen += p + (v == null ? '^D' : v) + '\n'; return Promise.resolve(v); }, run: (code, p) => { const r = JAVA.run(code, '', { write: p.onOutput }); return Promise.resolve(r); }, cancelled: () => false }; const exit = await REPL.java(o); return { screen: screen.slice(screen.indexOf('jshell> ')), exit }; };
  r = await jsession(['int x = 5;', 'x * 2', 'String s = "hi"', 's.length()', 'int twice(int n) {', '  return 2 * n;', '}', 'twice(x)', 'System.out.println("printed " + x);', 'x = 9', 'twice(x)', '/exit']);
  check('jshell: variables, expressions as $n, methods that see the variables, printing once', r.screen === 'jshell> int x = 5;\nx ==> 5\njshell> x * 2\n$2 ==> 10\njshell> String s = "hi"\ns ==> "hi"\njshell> s.length()\n$4 ==> 2\njshell> int twice(int n) {\n   ...>   return 2 * n;\n   ...> }\n|  created method twice(int)\njshell> twice(x)\n$6 ==> 10\njshell> System.out.println("printed " + x);\nprinted 5\njshell> x = 9\n$8 ==> 9\njshell> twice(x)\n$9 ==> 18\njshell> /exit\n|  Goodbye\n', r.screen);
  r = await jsession(['y + 1', '10 / 0', 'int[] a = {3, 1, 2};', 'Arrays.sort(a);', 'a', 'class Dog { String name = "Rex"; }', 'new Dog().name', 'List<Integer> xs = new ArrayList<>();', 'xs.add(4);', 'xs', '/vars', null]);
  check('jshell: errors are reported and dropped, arrays and classes and lists work, /vars lists', /jshell> y \+ 1\n\|  Error:\n\|  cannot find symbol\n\|    symbol:   variable y\n/.test(r.screen) && /jshell> 10 \/ 0\n\|  Exception java.lang.ArithmeticException: \/ by zero\n/.test(r.screen) && /a ==> int\[3\] \{ 3, 1, 2 \}\n/.test(r.screen) && /jshell> a\n\$\d+ ==> int\[3\] \{ 1, 2, 3 \}\n/.test(r.screen) && /\|  created class Dog\n/.test(r.screen) && /\$\d+ ==> "Rex"\n/.test(r.screen) && /jshell> xs\n\$\d+ ==> \[4\]\n/.test(r.screen) && /\|    int\[\] a\n\|    List<Integer> xs\n/.test(r.screen), r.screen);

  console.log((fails ? 'FAILED ' : 'ok ') + passes + ' passed, ' + fails + ' failed (repl)');
  process.exit(fails ? 1 : 0);
})();
