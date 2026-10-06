// Node tests for src/javaproject.js (several Java files run as one program) and src/labutil.js (program arguments, error locations),
// with the real interpreter (src/java.js) behind them. Expected messages are what javac/java of JDK 21 print for the same files.
const JP = require('./src/javaproject.js');
const JAVA = require('./src/java.js');
const LU = require('./src/labutil.js');
let bad = 0, n = 0;
const check = (name, got, want) => { n++; const g = JSON.stringify(got), w = JSON.stringify(want); if (g !== w) { bad++; console.log('BAD  ' + name + '\n  got:  ' + g + '\n  want: ' + w); } };
const ok = (name, cond, info) => { n++; if (!cond) { bad++; console.log('BAD  ' + name + (info !== undefined ? '\n  ' + JSON.stringify(info) : '')); } };
const runP = (proj, o) => { const r = JAVA.run(proj.src, (o && o.stdin) || '', Object.assign({}, o)); return { out: r.out, err: JP.mapError(proj, r.err), exit: r.exit }; };

const MAIN = 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Dog d = new Dog("Rex");\n        d.bark();\n        System.out.println(new ArrayList<String>(List.of("a")));\n    }\n}\n';
const DOG = 'import java.util.List;\nimport java.util.*;\n\npublic class Dog {\n    private String name;\n    Dog(String name) { this.name = name; }\n    void bark() { System.out.println(name + " says woof"); }\n}\n';

// ---- joining: imports hoisted once each, every class kept, two files run as one program
{
  const p = JP.join([{ name: 'Main.java', code: MAIN }, { name: 'Dog.java', code: DOG }], { rule: 'always' });
  check('no error', p.error, null);
  check('imports hoisted and de-duplicated', p.src.split('\n').slice(0, 2), ['import java.util.*;', 'import java.util.List;']);
  ok('no import left in the body', !/\n\s*import /.test(p.src.split('\n').slice(2).join('\n')));
  check('classes', p.classes.map((c) => [c.name, p.files[c.file].name, c.line, c.public, c.hasMain]), [['Main', 'Main.java', 3, true, true], ['Dog', 'Dog.java', 4, true, false]]);
  check('main class', p.main, 'Main');
  const r = runP(p);
  check('runs together', [r.out, r.err], ['Rex says woof\n[a]\n', null]);
  // every line of every file maps back to itself
  let all = true; for (let i = 1; i <= p.map.length; i++) { const m = JP.mapLine(p, i), e = p.map[i - 1]; if (e && (m.name !== p.files[e.f].name || m.line !== e.line)) all = false; }
  ok('mapLine is the map', all);
  const lineOf = (file, text) => { const ls = p.src.split('\n'); let f = null; for (let i = 0; i < ls.length; i++) { if (ls[i] === JP.MARK + file) f = file; else if (f === file && ls[i].includes(text)) return i + 1; } return 0; };
  check('a body line', JP.mapLine(p, lineOf('Dog.java', 'void bark')), { name: 'Dog.java', base: 'Dog.java', line: 7 });
  check('a hoisted import maps to its file', JP.mapLine(p, 2), { name: 'Dog.java', base: 'Dog.java', line: 1 });
  // the same map read back from the marker lines (what the terminal's .class file carries)
  const q = JP.fromJoined(p.src);
  check('fromJoined files', q.files, p.files);
  check('fromJoined body line', JP.mapLine(q, lineOf('Dog.java', 'void bark')), { name: 'Dog.java', base: 'Dog.java', line: 7 });
  const plain = JP.fromJoined('public class Main {}\n');
  check('fromJoined of a plain file leaves errors alone', JP.mapError(plain, 'Main.java:3: error: x'), 'Main.java:3: error: x');
}

// ---- compile errors in the second file, and stack traces through both (JDK 21: "at Dog.bark(Dog.java:6)", "at Main.main(Main.java:2)")
{
  const main = 'public class Main {\n  public static void main(String[] a) { new Dog().bark(); }\n}\n';
  const dog = 'import java.util.*;\n\npublic class Dog {\n  void bark() {\n    int[] a = new int[1];\n    a[2] = 1;\n  }\n}\n';
  const p = JP.join([{ name: 'Main.java', code: main }, { name: 'Dog.java', code: dog }], { rule: 'always' });
  const r = runP(p);
  check('stack trace mapped', r.err, 'Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 2 out of bounds for length 1\n\tat Dog.bark(Dog.java:6)\n\tat Main.main(Main.java:2)');
  check('where: the innermost frame', JP.where(r.err), { file: 'Dog.java', line: 6 });
  const broken = JP.join([{ name: 'Main.java', code: main }, { name: 'Dog.java', code: dog.replace('a[2] = 1;', 'a[2] = 1') }], { rule: 'always' });
  const e = runP(broken);
  check('compile error in the second file', e.err.split('\n')[0], "Dog.java:6: error: ';' expected");
  check('where: the compile error', JP.where(e.err), { file: 'Dog.java', line: 6 });
  const paths = JP.join([{ name: 'lab/Main.java', code: main }, { name: 'lab/Dog.java', code: dog.replace('a[2] = 1;', 'a[2] = 1') }], { rule: 'always' });
  check('compile errors name the file as given (javac lab/Dog.java)', runP(paths).err.split('\n')[0], "lab/Dog.java:6: error: ';' expected");
  check('stack frames name the base file', runP(JP.join([{ name: 'lab/Main.java', code: main }, { name: 'lab/Dog.java', code: dog }], { rule: 'always' })).err.split('\n')[1], '\tat Dog.bark(Dog.java:6)');
  const unknown = JP.join([{ name: 'Main.java', code: main }, { name: 'Dog.java', code: 'public class Dog {\n  void bark() {\n    Cat c = null;\n  }\n}\n' }], { rule: 'always' });
  check('cannot find symbol in the second file', runP(unknown).err.split('\n')[0], 'Dog.java:3: error: cannot find symbol');
  check('end of file in the last file', JP.mapLine(p, p.map.length + 1), { name: 'Dog.java', base: 'Dog.java', line: 10 });
}

// ---- the public-class rule (JLS 7.6), in javac's words
{
  const two = 'public class Main {\n    public static void main(String[] args) { }\n}\npublic class Dog {\n}\n';
  check('two public classes in one file', JP.join([{ name: 'Main.java', code: two }], { rule: 'always' }).error, 'Main.java:4: error: class Dog is public, should be declared in a file named Dog.java');
  check('a misnamed public class', JP.join([{ name: 'Dog2.java', code: 'public class Cat { }\n' }], { rule: 'always' }).error, 'Dog2.java:1: error: class Cat is public, should be declared in a file named Cat.java');
  check("rule 'multi' lets one file keep any name", JP.join([{ name: 'hello.java', code: 'public class Main { public static void main(String[] a) {} }' }], { rule: 'multi' }).error, null);
  check("rule 'multi' applies to two files", JP.join([{ name: 'hello.java', code: 'public class Main { public static void main(String[] a) { new Dog(); } }' }, { name: 'Dog.java', code: 'class Dog {}' }], { rule: 'multi' }).error, 'hello.java:1: error: class Main is public, should be declared in a file named Main.java');
  check('a class that is not public may be anywhere', JP.join([{ name: 'Main.java', code: 'public class Main {}\nclass Helper {}\ninterface Shape {}\n' }], { rule: 'always' }).error, null);
  check('public in a comment or string does not count', JP.join([{ name: 'Main.java', code: '// public class Dog {\n/* public class Cat { */\npublic class Main { String s = "public class Bird {"; char c = \'{\'; }\n' }], { rule: 'always' }).error, null);
  check('nested braces do not hide the second class', JP.join([{ name: 'Main.java', code: 'public class Main {\n  void f() { if (true) { } }\n}\n\npublic final class Box<T> extends Object {}\n' }], { rule: 'always' }).error, 'Main.java:5: error: class Box is public, should be declared in a file named Box.java');
  // duplicate classes across files: javac's message from the interpreter, put on the later file
  const d = JP.join([{ name: 'Main.java', code: 'public class Main { public static void main(String[] a) {} }\nclass Dog { }\n' }, { name: 'Other.java', code: '\nclass Dog { }\n' }], { rule: 'always' });
  check('duplicate class', runP(d).err, 'Other.java:2: error: duplicate class: Dog');
}

// ---- which files take part (the Lab), and which main runs
{
  const prog = (name, cls, msg) => ({ name, code: 'public class ' + cls + ' {\n  public static void main(String[] a) { System.out.println("' + msg + '"); }\n}\n' });
  const p = JP.join([prog('from-course.java', 'Main', 'one'), prog('Main.java', 'Main', 'two'), { name: 'notes.txt', code: 'x' }, { name: 'Empty.java', code: '  \n' }], { dedupe: true, rule: 'multi' });
  check('dedupe leaves out a clashing tab', p.files.map((f) => f.name), ['from-course.java']);
  check('why each file was left out', p.skipped.map((s) => [s.name, s.why]), [['Main.java', 'it declares class Main again (from-course.java has it)'], ['notes.txt', 'not a .java file'], ['Empty.java', 'empty']]);
  check('one file left: no file-name rule', p.error, null);
  check('runs the current tab', runP(p).out, 'one\n');
  const q = JP.join([{ name: 'Dog.java', code: 'public class Dog {\n  public static void main(String[] a) { System.out.println("dog"); }\n}\n' }, prog('Main.java', 'Main', 'main')], { dedupe: true, rule: 'multi' });
  check('the first file with a main wins (the current tab first)', [q.main, runP(q).out], ['Dog', 'dog\n']);
  const r = JP.join([{ name: 'Dog.java', code: 'public class Dog { void bark() {} }\n' }, prog('Main.java', 'Main', 'main')], { dedupe: true, rule: 'multi' });
  check('a tab without main runs the main of another', [r.main, runP(r).out], ['Main', 'main\n']);
  check('java Dog: mainClass picks the class', runP(q, { mainClass: 'Main' }).out, 'main\n');
  check('java Dog without a main: java\'s message', runP(r, { mainClass: 'Dog' }).err, 'Error: Main method not found in class Dog, please define the main method as:\n   public static void main(String[] args)\nor a JavaFX application class must extend javafx.application.Application');
  check('hasMain: String... and String args[]', [JP.scan('class A { public static void main(String... x) {} }').classes[0].hasMain, JP.scan('class A { static public void main(final String args[]) {} }').classes[0].hasMain, JP.scan('class A { void main(String[] a) {} }').classes[0].hasMain], [true, true, false]);
  check('imports on one line, static imports, package lines', JP.scan('package demo;\nimport java.util.List; import static java.lang.Math.max;\n\nclass A {}\n').head.map((h) => [h.line, h.kind, h.text]), [[1, 'package', 'package demo;'], [2, 'import', 'import java.util.List;'], [2, 'import', 'import static java.lang.Math.max;']]);
  const s = JP.join([{ name: 'A.java', code: 'package demo;\nimport java.util.ArrayList;\npublic class A { public static void main(String[] x) { ArrayList<Integer> a = new ArrayList<>(); a.add(B.three()); System.out.println(a); } }\n' }, { name: 'B.java', code: 'package demo;\nclass B { static int three() { return 3; } }\n' }], { rule: 'always' });
  check('package lines dropped, imports kept', runP(s).out, '[3]\n');
  check('hostile entries are skipped', JP.join([null, { name: 5, code: 'x' }, { name: 'A.java' }, { name: 'B\n.java', code: 'class B {}' }]).files, [{ name: 'B_.java', base: 'B_.java' }]);
  check('an import inside a comment is not hoisted', JP.join([{ name: 'A.java', code: '/*\nimport java.util.*;\n*/\npublic class A {}\n' }]).src.split('\n')[0], JP.MARK + 'A.java');
}

// ---- program arguments: main(String[] args) gets them
{
  const p = JP.join([{ name: 'Main.java', code: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println(args.length);\n    for (String s : args) System.out.println(s);\n  }\n}\n' }]);
  check('args reach main', runP(p, { args: ['one', 'two words'] }).out, '2\none\ntwo words\n');
  check('no args: an empty array', runP(p).out, '0\n');
}

// ---- labutil: splitting the Arguments box into words as a shell would, and sanitizing what is saved
{
  check('words', LU.splitArgs('one two'), ['one', 'two']);
  check('quotes', LU.splitArgs('a "b c" \'d e\' f\\ g ""'), ['a', 'b c', 'd e', 'f g', '']);
  check('spaces and tabs', LU.splitArgs('  x \t y  '), ['x', 'y']);
  check('empty', LU.splitArgs(''), []);
  check('not a string', LU.splitArgs(null), []);
  check('a quote left open runs to the end', LU.splitArgs('a "b c'), ['a', 'b c']);
  check('quotes inside a word', LU.splitArgs('x"y z"w'), ['xy zw']);
  check('at most 100 words', LU.splitArgs(Array(300).fill('w').join(' ')).length, 100);
  check('cleanArgs keeps two languages', LU.cleanArgs({ python: 'a b', java: 'c', cpp: 'x', scheme: 'y' }), { python: 'a b', java: 'c' });
  const evil = LU.cleanArgs(JSON.parse('{"__proto__": {"x": 1}, "python": 5, "java": "' + 'z'.repeat(5000) + '\\n\\u0000end"}'));
  check('cleanArgs: hostile values', [Object.keys(evil), evil.java.length <= 1000, /[\n\u0000]/.test(evil.java), ({}).x], [['java'], true, false, undefined]);
  check('cleanArgs: not an object', [LU.cleanArgs('x'), LU.cleanArgs(null), LU.cleanArgs(['a'])], [{}, {}, {}]);
  // error locations for the editor's marker
  check('python', LU.errorLine('python', "NameError: name 'x' is not defined on line 3"), 3);
  check('python: a line of another file is not marked here', LU.errorLine('python', 'ZeroDivisionError: integer division or modulo by zero on line 12 of helper.py'), 0);
  check('teaching C++', LU.errorLine('cpp', 'main.cpp:4:5 something'), 4);
  check('full C++', LU.errorLine('cppfull', "main.cpp:7:3: error: use of undeclared identifier 'x'"), 7);
  check('scheme has no lines', LU.errorLine('scheme', ';Unbound variable: x'), 0);
  check('no line', LU.errorLine('python', 'Time limit exceeded'), 0);
}

console.log(bad ? bad + ' of ' + n + ' javaproject checks FAILED' : 'javaproject: all ' + n + ' checks passed');
process.exit(bad ? 1 : 0);
