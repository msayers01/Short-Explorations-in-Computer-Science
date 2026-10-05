// Typed input: a Java or C++ program that reads from the keyboard, answered a line at a time as it asks (src/runner.js javaTyped/cppTyped,
// src/javaworker.js and src/cppworker.js typedInput). The workers are run from the same sources the page builds, in node's worker_threads,
// and driven with the same replay protocol as runner.js: run, and while the run ends with needInput, add the next line and run again.
'use strict';
const fs = require('fs'), path = require('path'), { Worker } = require('worker_threads');
const WS = require('./scripts/worker-sources.js');
let fails = 0, passes = 0;
const check = (name, ok, extra) => { if (ok) passes++; else { fails++; console.log('FAIL ' + name + (extra !== undefined ? '\n   ' + JSON.stringify(extra) : '')); } };

const shim = "const { parentPort, workerData } = require('worker_threads'); global.module = undefined; global.exports = undefined; global.require = undefined; global.self = global; global.postMessage = (m) => parentPort.postMessage(m); parentPort.on('message', (m) => { if (global.onmessage) global.onmessage({ data: m }); }); (0, eval)(workerData.source);";
function spawn(lang) {
  const source = WS[lang].map((f) => fs.readFileSync(path.join(__dirname, f), 'utf8')).join(';\n');
  const w = new Worker(shim, { eval: true, workerData: { source } });
  let ready, onMsg = null, nextId = 1;
  const started = new Promise((r) => { ready = r; });
  w.on('message', (m) => { if (m && m.t === 'ready') ready(); else if (onMsg) onMsg(m); });
  return {
    async run(payload) {
      await started;
      const id = nextId++; let out = '';
      return new Promise((resolve) => {
        onMsg = (m) => { if (m.id !== id) return; if (m.t === 'out') out += m.text; else if (m.t === 'done') resolve({ out, err: m.err || null, exit: m.exit || 0, needInput: m.needInput === true }); };
        w.postMessage(Object.assign({ t: 'run', id }, payload));
      });
    },
    end: () => w.terminate()
  };
}
// the page's loop (runner.js), with the answers given in advance; answer(i, shown) may return a line, or null for Ctrl+D. waits[i]: ms the student "thinks".
async function typed(w, code, answers, waits) {
  const lines = [], times = [], t0 = Date.now(); let out = '', rounds = 0;
  for (;;) {
    const r = await w.run({ code, stdin: '', maxTimeout: 5000, typed: { lines, times, t0, seed: 12345, skip: out.length } });
    rounds++; out += r.out;
    if (!r.needInput) return { out, err: r.err, exit: r.exit, rounds };
    if (lines.length >= answers.length) return { out, err: 'asked for more than the test gives', rounds, asked: true };
    if (waits && waits[lines.length]) await new Promise((res) => setTimeout(res, waits[lines.length]));   // the student thinks, for real
    lines.push(answers[lines.length]); times.push(Date.now());
  }
}

(async () => {
  const java = spawn('java'), cpp = spawn('cpp');
  try {
    // ---------------- Java
    const sum = 'import java.util.Scanner;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner in = new Scanner(System.in);\n    System.out.print("First number: ");\n    int a = in.nextInt();\n    System.out.print("Second number: ");\n    int b = in.nextInt();\n    System.out.println(a + " + " + b + " = " + (a + b));\n  }\n}\n';
    let r = await typed(java, sum, ['3', '4']);
    check('Java: each prompt is printed once, before its line is asked for', r.out === 'First number: Second number: 3 + 4 = 7\n' && r.rounds === 3 && !r.err, r);
    r = await java.run({ code: sum, stdin: '3\n4\n', maxTimeout: 5000 });
    check('Java: a run with stdin given is untouched', r.out === 'First number: Second number: 3 + 4 = 7\n' && !r.needInput, r);
    r = await java.run({ code: sum, stdin: '', maxTimeout: 5000 });
    check('Java: no stdin and no typing is the end of the input, as before', /NoSuchElementException/.test(r.err) && !r.needInput, r);

    const mixed = 'import java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    System.out.print("Age? ");\n    int age = sc.nextInt();\n    sc.nextLine();\n    System.out.print("Name? ");\n    String name = sc.nextLine();\n    System.out.println(name + " is " + age);\n  }\n}\n';
    r = await typed(java, mixed, ['15', 'Ada Lovelace']);
    check('Java: nextInt then nextLine() eats the rest of the line without asking', r.out === 'Age? Name? Ada Lovelace is 15\n' && r.rounds === 3, r);

    const twoScanners = 'import java.util.Scanner;\npublic class Main {\n  static int read(String q) { Scanner s = new Scanner(System.in); System.out.print(q); return s.nextInt(); }\n  public static void main(String[] args) {\n    int a = read("a? "), b = read("b? ");\n    System.out.println(a * b);\n  }\n}\n';
    r = await typed(java, twoScanners, ['6', '7']);
    check('Java: a new Scanner on System.in in each call reads the next line, as on a console', r.out === 'a? b? 42\n', r);
    r = await java.run({ code: twoScanners, stdin: '6\n7\n', maxTimeout: 5000 });
    check('Java: and the same with the input given at once', r.out === 'a? b? 42\n', r);

    const untilEof = 'import java.util.Scanner;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    int total = 0, n = 0;\n    while (sc.hasNextInt()) { total += sc.nextInt(); n++; }\n    System.out.println(n + " numbers, total " + total);\n  }\n}\n';
    r = await typed(java, untilEof, ['1 2', '3', null]);
    check('Java: hasNextInt() waits for typing, and Ctrl+D (null) ends the input', r.out === '3 numbers, total 6\n' && r.rounds === 4, r);

    const guess = 'import java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Random rng = new Random();\n    int secret = rng.nextInt(1000000);\n    double m = Math.random();\n    Scanner sc = new Scanner(System.in);\n    System.out.println("secret " + secret + " " + m);\n    while (true) { System.out.print("Guess: "); if (sc.nextInt() == secret) break; }\n  }\n}\n';
    r = await typed(java, guess, ['1', '2', '3', null]);
    check('Java: an unseeded Random and Math.random give the same numbers in every replay', /^secret \d+ 0\.\d+\nGuess: Guess: Guess: Guess: $/.test(r.out) && /NoSuchElementException/.test(r.err || ''), r);

    const timer = 'import java.util.Scanner;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    long t = System.currentTimeMillis();\n    System.out.print("Press Enter: ");\n    sc.nextLine();\n    long ms = System.currentTimeMillis() - t;\n    System.out.println(ms >= 1500 ? "slow" : "fast " + ms);\n  }\n}\n';
    r = await typed(java, timer, [''], [2000]);
    check('Java: the clock moves on while the student types, in the replay too', r.out === 'Press Enter: slow\n', r);

    const fin = 'import java.util.Scanner;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    try { System.out.print("n? "); int n = sc.nextInt(); System.out.println(n * 2); }\n    catch (Exception e) { System.out.println("caught " + e); }\n    finally { System.out.println("finally"); }\n  }\n}\n';
    r = await typed(java, fin, ['21']);
    check('Java: waiting for a line runs no catch or finally block', r.out === 'n? 42\nfinally\n', r);
    r = await typed(java, fin, ['x']);
    check('Java: a typed word that is not a number is an InputMismatchException, as in Java', r.out === 'n? caught java.util.InputMismatchException\nfinally\n', r);

    // ---------------- C++ (JSCPP, the teaching engine)
    const csum = '#include <iostream>\nusing namespace std;\nint main() {\n  int a, b;\n  cout << "First number: ";\n  cin >> a;\n  cout << "Second number: ";\n  cin >> b;\n  cout << a << " + " << b << " = " << a + b << endl;\n  return 0;\n}\n';
    r = await typed(cpp, csum, ['3', '4']);
    check('C++: each prompt is printed once, before its line is asked for', r.out === 'First number: Second number: 3 + 4 = 7\n' && r.rounds === 3 && !r.err, r);
    r = await typed(cpp, csum, ['3 4']);
    check('C++: two numbers on one line answer two reads', r.out === 'First number: Second number: 3 + 4 = 7\n' && r.rounds === 2, r);
    r = await cpp.run({ code: csum, stdin: '3\n4\n', maxTimeout: 4000 });
    check('C++: a run with stdin given is untouched', r.out === 'First number: Second number: 3 + 4 = 7\n' && !r.needInput, r);

    const cline = '#include <iostream>\nusing namespace std;\nint main() {\n  int n; char name[50];\n  cout << "Age? ";\n  cin >> n;\n  cin.getline(name, 50);\n  cout << "[" << name << "]" << endl;\n  cout << "Name? ";\n  cin.getline(name, 50);\n  cout << name << " is " << n << endl;\n  return 0;\n}\n';
    r = await typed(cpp, cline, ['15', 'Ada']);
    check('C++: getline after cin >> n reads the rest of that line at once, as real C++ does', r.out === 'Age? []\nName? Ada is 15\n' && r.rounds === 3, r);

    const cgame = '#include <iostream>\n#include <cstdlib>\n#include <ctime>\nusing namespace std;\nint main() {\n  srand(time(0));\n  int secret = rand() % 1000000;\n  cout << "secret " << secret << endl;\n  int g;\n  while (cin >> g) { if (g == secret) { cout << "yes" << endl; return 0; } cout << "no" << endl; }\n  cout << "bye" << endl;\n  return 0;\n}\n';
    r = await typed(cpp, cgame, ['1', '2', null], [1100, 1100, 0]);
    check('C++: srand(time(0)) picks the same secret in every replay, even seconds later', /^secret \d+\nno\nno\nbye\n$/.test(r.out), r);

    const ceof = '#include <iostream>\nusing namespace std;\nint main() {\n  int x, total = 0;\n  while (cin >> x) total += x;\n  cout << "total " << total << endl;\n  return 0;\n}\n';
    r = await typed(cpp, ceof, ['1 2', '3', null]);
    check('C++: while (cin >> x) waits for typing, and Ctrl+D ends it', r.out === 'total 6\n', r);
    r = await cpp.run({ code: ceof, stdin: '5 6', maxTimeout: 4000 });
    check('C++: and reads given input to its end as before', r.out === 'total 11\n', r);
  } finally { java.end(); cpp.end(); }
  console.log((fails ? 'FAILED ' : 'ok ') + passes + ' passed, ' + fails + ' failed (typed input)');
  process.exit(fails ? 1 : 0);
})();
