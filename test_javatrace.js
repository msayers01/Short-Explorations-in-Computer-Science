// node test_javatrace.js — checks the Java step-through recorder (JAVA.trace in src/java.js) and the page's cleaning of its record (src/javastep.js).
// 1. Hand-written cases: variables by name and value, scope, recursion, shared objects, arrays, collections, Scanner input, exceptions, the step cap.
// 2. Every Java lesson example, exercise solution and probe program: tracing must not crash, and a traced program that finishes must print exactly
//    what an ordinary run prints (the recorder only looks; it must never change what the program does).
global.window = global;
const fs = require('fs'), path = require('path');
const J = require('./src/java.js'), JU = require('./src/javautil.js');
let problems = 0, checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) { problems++; console.log('BAD  ' + msg); } };
const main = (body, extra) => 'import java.util.*; ' + (extra || '') + 'public class Main {\n' + body + '\n}\n';
const top = (st) => st.frames[st.frames.length - 1];
const v = (f, name) => { const x = f && f.vars.find(x => x[0] === name); return x ? x[2] : undefined; };
const obj = (st, id) => st.heap.find(o => o.id === id);
const at = (t, line) => t.steps.filter(s => s.line === line && !s.done && !s.error);

// ---- variables by name, types, Java's way of printing values
{
  const t = J.trace(main('  public static void main(String[] args) {\n    int n = 7;\n    double d = 3;\n    char c = \'x\';\n    String s = "hi\\n";\n    long big = 1L << 40;\n    boolean b = n > 5;\n    Integer boxed = 12;\n    Object o = 2.5;\n    float f = 0.1f;\n    System.out.println(n);\n  }'), '');
  ok(t.finished && !t.error && t.output === '7\n', 'a simple program runs to the end');
  const last = at(t, 12)[0], f = top(last);
  ok(f.name === 'main' && f.cls === 'Main', 'the frame is Main.main');
  ok(v(f, 'n') === '7' && v(f, 'd') === '3.0' && v(f, 'c') === "'x'" && v(f, 's') === '"hi\\n"', 'int, double, char and String print as Java writes them');
  ok(v(f, 'big') === '1099511627776' && v(f, 'b') === 'true' && v(f, 'boxed') === '12' && v(f, 'o') === '2.5' && v(f, 'f') === '0.1', 'long, boolean, Integer, a boxed double and float');
  ok(f.vars.find(x => x[0] === 'd')[1] === 'double' && f.vars.find(x => x[0] === 'args')[3] === 1, 'types are named and parameters are marked');
  ok(v(top(at(t, 3)[0]), 'n') === undefined && v(top(at(t, 4)[0]), 'n') === '7', 'a variable appears once its declaration has run');
  ok(t.steps[t.steps.length - 1].done && t.steps[t.steps.length - 1].frames.length === 0, 'the last step is the finished state');
  ok(at(t, 12)[0].outLen === 0 && t.steps[t.steps.length - 1].outLen === 2, 'each step knows how much had been printed');
}
// ---- scope: a loop variable disappears after its loop, a block's variable after its block
{
  const t = J.trace(main('  public static void main(String[] args) {\n    int sum = 0;\n    for (int i = 0; i < 3; i++) {\n      int sq = i * i;\n      sum += sq;\n    }\n    System.out.println(sum);\n    for (String w : new String[] {"a", "b"}) {\n      System.out.println(w);\n    }\n    int after = 1;\n  }'), '');
  ok(t.finished && t.output === '5\na\nb\n', 'the loops print 5, a, b');
  const body = at(t, 5);
  ok(body.length === 3 && body.map(s => v(top(s), 'i')).join() === '0,1,2', 'the loop body runs three times with i = 0, 1, 2');
  ok(v(top(body[0]), 'sq') === undefined && v(top(at(t, 6)[0]), 'sq') === '0', 'sq is visible only after its declaration');
  const heads = at(t, 4);
  ok(heads.length === 4 && v(top(heads[0]), 'i') === undefined && v(top(heads[3]), 'i') === '3', 'the loop header is a step each time round, with i once it exists');
  const print = at(t, 8)[0];
  ok(print && v(top(print), 'i') === undefined && v(top(print), 'sq') === undefined && v(top(print), 'sum') === '5', 'after the loop i and sq are gone and sum is 5');
  const each = at(t, 10);
  ok(each.map(s => v(top(s), 'w')).join() === '"a","b"', 'the for-each variable takes each element');
  ok(v(top(at(t, 12)[0]), 'w') === undefined, 'and is gone after the loop');
}
// ---- recursion: one frame per call, each with its own n
{
  const t = J.trace(main('  static int fact(int n) {\n    if (n <= 1) return 1;\n    return n * fact(n - 1);\n  }\n  public static void main(String[] args) {\n    int r = fact(4);\n    System.out.println(r);\n  }'), '');
  ok(t.finished && t.output === '24\n', 'fact(4) prints 24');
  const deepest = t.steps.reduce((a, s) => (s.frames.length > a.frames.length ? s : a));
  ok(deepest.frames.length === 5 && deepest.frames.slice(1).map(f => v(f, 'n')).join() === '4,3,2,1', 'four frames of fact, n = 4, 3, 2, 1');
  ok(deepest.frames.slice(1, -1).every(f => f.line === 4) && top(deepest).line === 3, 'the frames below are waiting on line 4, the top one is on line 3');
  ok(v(deepest.frames[0], 'r') === undefined, 'r in main is not set while fact runs');
  ok(at(t, 3).every(s => top(s).name === 'fact'), 'if (n <= 1) return 1; is one step per call (no separate step for its return)');
  const deep = J.trace(main('  static int f(int n) { return n == 0 ? 0 : 1 + f(n - 1); }\n  public static void main(String[] args) {\n    System.out.println(f(100));\n  }'), '');
  const d = deep.steps.reduce((a, s) => Math.max(a, s.frames.length + (s.skipped || 0)), 0);
  ok(deep.finished && deep.output === '100\n' && d === 102, '100 calls deep: every call is counted');
  ok(deep.steps.every(s => s.frames.length <= 24) && deep.steps.some(s => s.skipped), 'deep stacks show main and the innermost frames, and say how many are left out');
}
// ---- objects: the same object has the same number in every variable and every step; fields; inheritance; constructors
{
  const t = J.trace(main('  public static void main(String[] args) {\n    Dog a = new Dog("Rex", 3);\n    Dog b = a;\n    b.age++;\n    Dog c = new Dog("Fido", 1);\n    System.out.println(a.age);\n  }', 'class Animal {\n  protected String name;\n  Animal(String n) { name = n; }\n}\nclass Dog extends Animal {\n  int age;\n  Dog(String n, int age) {\n    super(n);\n    this.age = age;\n  }\n}\n'), '');
  ok(t.finished && t.output === '4\n', 'the dog program prints 4');
  const s = at(t, 18)[0], f = top(s);
  ok(typeof v(f, 'a') === 'number' && v(f, 'a') === v(f, 'b') && v(f, 'c') !== v(f, 'a'), 'a and b refer to the same object, c to another');
  const dog = obj(s, v(f, 'a'));
  ok(dog && dog.k === 'obj' && dog.cls === 'Dog' && JSON.stringify(dog.fields) === '[["name","\\"Rex\\""],["age","4"]]', 'the object shows its fields, the parent class\'s first');
  ok(v(top(at(t, 16)[0]), 'a') === v(f, 'a'), 'an object keeps its number from step to step');
  const inSuper = t.steps.find(x => x.frames.length === 3);
  ok(inSuper && inSuper.frames[1].name === '<init>' && v(inSuper.frames[1], 'n') === '"Rex"' && v(inSuper.frames[1], 'age') === '3' && typeof v(inSuper.frames[1], 'this') === 'number', 'inside super(n) the Dog constructor\'s frame shows this and its parameters');
  ok(v(inSuper.frames[2], 'n') === '"Rex"' && inSuper.frames[2].cls === 'Animal', 'and the Animal constructor runs above it');
  const s15 = at(t, 15)[0], s16 = at(t, 16)[0], s17 = at(t, 17)[0];
  ok(s15.heap.find(o => o.cls === 'Dog') === s16.heap.find(o => o.cls === 'Dog') && s16.heap.find(o => o.cls === 'Dog') !== s17.heap.find(o => o.cls === 'Dog'), 'an object that did not change between two steps is the same record');
}
// ---- arrays, collections, static fields
{
  const t = J.trace(main('  static int calls = 0;\n  static int[] memo = new int[3];\n  public static void main(String[] args) {\n    int[] a = {3, 1, 2};\n    int[] alias = a;\n    alias[0] = 9;\n    int[][] grid = new int[2][2];\n    grid[1][0] = 5;\n    ArrayList<String> list = new ArrayList<>(List.of("x", "y"));\n    HashMap<String, Integer> m = new HashMap<>();\n    m.put("one", 1);\n    m.put("two", 2);\n    TreeSet<Character> set = new TreeSet<>();\n    set.add(\'b\'); set.add(\'a\');\n    StringBuilder sb = new StringBuilder("ab");\n    double[] big = new double[100];\n    calls++;\n    System.out.println(a[0]);\n  }'), '');
  ok(t.finished && t.output === '9\n', 'the collections program prints 9');
  const s = at(t, 18)[0], f = top(s);
  const a = obj(s, v(f, 'a'));
  ok(a && a.k === 'array' && a.cls === 'int[]' && a.len === 3 && a.cells.join() === '9,1,2' && v(f, 'alias') === v(f, 'a'), 'int[] a and its alias: one array, changed through the alias');
  const g = obj(s, v(f, 'grid'));
  ok(g && g.cls === 'int[][]' && g.cells.every(c => typeof c === 'number') && obj(s, g.cells[1]).cells.join() === '5,0', 'a 2D array is an array of arrays');
  ok(obj(s, v(f, 'list')).k === 'list' && obj(s, v(f, 'list')).cells.join() === '"x","y"', 'an ArrayList shows its elements');
  const m = obj(s, v(f, 'm'));
  ok(m.k === 'map' && m.cls === 'HashMap' && JSON.stringify(m.entries) === JSON.stringify([['"one"', '1'], ['"two"', '2']]), 'a HashMap shows its entries in its iteration order');
  ok(obj(s, v(f, 'set')).cells.join() === "'a','b'", 'a TreeSet of Character is sorted and prints chars in quotes');
  ok(obj(s, v(f, 'sb')).text === '"ab"', 'a StringBuilder shows its text');
  const big = obj(s, v(f, 'big'));
  ok(big.len === 100 && big.cells.length === 40 && big.cells[0] === '0.0', 'a long array is cut to 40 cells and keeps its length');
  ok(JSON.stringify(s.statics.map(x => x[0] + '=' + (typeof x[2] === 'number' ? 'ref' : x[2]))) === '["Main.calls=0","Main.memo=ref"]', 'static fields are listed with their class');
  ok(at(t, 19)[0].statics[0][2] === '1', 'a static field changes');
}
// ---- Scanner input, and running out of it
{
  const code = main('  public static void main(String[] args) {\n    Scanner in = new Scanner(System.in);\n    int a = in.nextInt();\n    String w = in.next();\n    System.out.println(w + a);\n  }');
  const t = J.trace(code, '41 hello\n');
  ok(t.finished && t.output === 'hello41\n' && v(top(at(t, 6)[0]), 'a') === '41' && v(top(at(t, 6)[0]), 'w') === '"hello"', 'the input is read: a = 41, w = "hello"');
  ok(v(top(at(t, 5)[0]), 'in') === 'Scanner', 'a Scanner shows as Scanner');
  const e = J.trace(code, '41\n');
  ok(!e.finished && /NoSuchElementException/.test(e.error) && e.errorLine === 5 && e.steps[e.steps.length - 1].error, 'with too little input, the trace ends with the exception on line 5');
}
// ---- exceptions: caught ones go on, an uncaught one ends the trace with the frames as they were
{
  const t = J.trace(main('  static int get(int[] a, int i) {\n    return a[i];\n  }\n  public static void main(String[] args) {\n    int[] a = new int[2];\n    try {\n      get(a, 5);\n    } catch (ArrayIndexOutOfBoundsException e) {\n      System.out.println("caught");\n    }\n    int k = 3;\n    System.out.println(get(a, k));\n  }'), '');
  ok(!t.finished && t.output === 'caught\n' && /ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 2/.test(t.error), 'the uncaught exception is the error');
  const caught = at(t, 10)[0];
  ok(caught && typeof v(top(caught), 'e') === 'number' && obj(caught, v(top(caught), 'e')).fields.some(f => f[0] === 'message' && /Index 5/.test(f[1])), 'the caught exception is an object with its message');
  const last = t.steps[t.steps.length - 1];
  ok(last.error && last.frames.length === 2 && top(last).name === 'get' && v(top(last), 'i') === '3' && last.line === 3, 'the last step is the throw, inside get(a, 3) on line 3');
  ok(t.errorLine === 3, 'errorLine is the line that threw');
  const c = J.trace(main('  public static void main(String[] args) {\n    int x = "no";\n  }'), '');
  ok(c.compile && c.steps.length === 0 && /incompatible types/.test(c.error), 'a compile error gives no steps, only the error');
  const x = J.trace(main('  public static void main(String[] args) {\n    System.out.println("bye");\n    System.exit(3);\n  }'), '');
  ok(x.finished && x.output === 'bye\n' && x.steps[x.steps.length - 1].done, 'System.exit ends the trace as a finish');
}
// ---- limits: the step cap stops the program; strings are cut; the program's own compareTo is not run by the recorder
{
  const t = J.trace(main('  public static void main(String[] args) {\n    int i = 0;\n    while (true) i++;\n  }'), '', { maxSteps: 300 });
  ok(t.truncated && !t.finished && !t.error && t.steps.length === 300, 'a loop that never ends stops at the step cap without an error');
  const long = J.trace(main('  public static void main(String[] args) {\n    String s = "x".repeat(500);\n    System.out.println(s.length());\n  }'), '');
  ok(v(top(at(long, 4)[0]), 's').length < 70, 'a long string is cut');
  const cmp = J.trace(main('  public static void main(String[] args) {\n    TreeSet<P> s = new TreeSet<>();\n    s.add(new P(2)); s.add(new P(1));\n    System.out.println(P.n);\n  }', 'class P implements Comparable<P> {\n  static int n = 0;\n  int v;\n  P(int v) { this.v = v; }\n  public int compareTo(P o) { n++; return v - o.v; }\n}\n'), '');
  ok(cmp.finished && cmp.output === J.run(main('  public static void main(String[] args) {\n    TreeSet<P> s = new TreeSet<>();\n    s.add(new P(2)); s.add(new P(1));\n    System.out.println(P.n);\n  }', 'class P implements Comparable<P> {\n  static int n = 0;\n  int v;\n  P(int v) { this.v = v; }\n  public int compareTo(P o) { n++; return v - o.v; }\n}\n'), '').out, 'drawing a TreeSet of the program\'s objects does not call compareTo');
  const t0 = Date.now(); J.trace(main('  public static void main(String[] args) {\n    int[] a = new int[1000];\n    for (int i = 0; i < 100000; i++) a[i % 1000] += i;\n  }'), '');
  ok(Date.now() - t0 < 3000, 'a long run stops recording quickly (' + (Date.now() - t0) + ' ms)');
}
// ---- the page's cleaning (src/javastep.js clean): odd input from a sandbox does not break it
{
  const W = global.window; W.__h = { el: () => null };
  require('./src/javastep.js');
  const C = W.JAVASTEP.clean;
  ok(C(null) === null && C({ steps: 'x' }).steps.length === 0, 'nonsense gives an empty record');
  const r = C({ steps: [{ line: '3', frames: [{ cls: 'Main', name: 'main', vars: [['x', 'int', '<b>1</b>'], ['o', 'Dog', 4], 'junk'] }], heap: [{ id: 4, k: 'evil', cls: 'Dog', fields: [['a', 1.5]] }] }], output: 5 });
  const f = r.steps[0].frames[0];
  ok(r.steps[0].line === 3 && f.vars[0][2] === '<b>1</b>' && f.vars[1][2] === 4 && f.vars[2][0] === '?', 'values stay text (drawn as text), references stay numbers');
  ok(r.steps[0].heap[0].k === 'obj' && r.steps[0].heap[0].fields[0][1] === '1.5' && r.output === '5', 'an unknown kind becomes obj; a fractional number is not a reference');
  const real = J.trace(main('  public static void main(String[] args) {\n    int[] a = {1};\n    a[0] = 2;\n    int b = 3;\n  }'), '');
  const cr = C(real);
  const arrOf = (st) => st.heap.find(o => o.cls === 'int[]');
  ok(cr.steps.length === real.steps.length && cr.steps.every((s, i) => s.heap.length === real.steps[i].heap.length && s.line === real.steps[i].line), 'a real record survives cleaning');
  ok(arrOf(cr.steps[1]).cells.join() === '1' && arrOf(cr.steps[2]).cells.join() === '2' && arrOf(cr.steps[0]) === undefined, 'cleaning keeps steps apart');
}

// ---- 2. every lesson example, exercise solution and probe: a traced run prints what a plain run prints
{
  const cases = [];
  for (const file of ['course_java', 'course_dsa']) {
    window.COURSES = []; delete require.cache[require.resolve('./src/' + file + '.js')]; require('./src/' + file + '.js');
    const course = window.COURSES[0];
    course.lessons.forEach((L, li) => {
      let p = 0;
      for (const b of L.blocks) {
        if (b && b.play) cases.push({ id: course.id + '/' + (li + 1) + '/play' + (++p), code: b.play, stdin: b.stdin || '' });
        const ex = b && b.ex;
        if (ex && ex.solution && !ex.kind) (ex.tests || []).forEach((t, ti) => {
          let code = ex.solution;
          if (t.call !== undefined || t.main !== undefined) { const h = JU.harness(ex, ex.solution, t); if (h.error) return; code = h.src; }
          cases.push({ id: ex.id + '/test' + (ti + 1), code, stdin: t.stdin || '' });
        });
      }
    });
  }
  const dir = path.join(__dirname, 'difftest/java');
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.java')).sort()) {
    const inp = path.join(dir, f.replace(/\.java$/, '.in'));
    cases.push({ id: 'probe/' + f, code: fs.readFileSync(path.join(dir, f), 'utf8'), stdin: fs.existsSync(inp) ? fs.readFileSync(inp, 'utf8') : '' });
  }
  let traced = 0, full = 0;
  for (const c of cases) {
    let t;
    try { t = J.trace(c.code, c.stdin, { maxSteps: 4000 }); } catch (e) { ok(false, c.id + ': the recorder crashed: ' + e.message); continue; }
    const r = J.run(c.code, c.stdin);
    traced++;
    if (t.truncated) continue;
    full++;
    const hashless = (s) => String(s).replace(/@[0-9a-f]{6,8}\b/g, '@hash');   // identity hashes count the objects made so far in this process
    ok(hashless(t.output) === hashless(r.out), c.id + ': a traced run printed something else');
    ok((t.error || null) === (r.err || null) || /StackOverflowError/.test(r.err || ''), c.id + ': a traced run ended differently: ' + String(t.error).slice(0, 120) + ' / ' + String(r.err).slice(0, 120));
    ok(t.steps.every(s => Array.isArray(s.frames) && Array.isArray(s.heap) && s.heap.every(o => o.id > 0)), c.id + ': a step is malformed');
    try { JSON.stringify(t); } catch (e) { ok(false, c.id + ': the record cannot be sent as a message: ' + e.message); }
  }
  console.log('traced ' + traced + ' programs (' + full + ' to the end)');
}

console.log(problems ? problems + ' problem(s) in ' + checks + ' checks' : 'all ' + checks + ' checks ok');
process.exit(problems ? 1 : 0);
