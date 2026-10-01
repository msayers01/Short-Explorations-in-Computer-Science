// node test_cppstep.js — checks the C++ memory stepper (src/cppstep.js).
// 1. Hand-written cases: addresses, frames, arrays, pointers, dangling pointers, errors, limits.
// 2. Every C++ playground and exercise solution in the course: stepping must not crash, and a program
//    that finishes must print exactly what an ordinary run prints.
global.window = global;
const J = require('JSCPP/lib/commonjs.js');
global.JSCPP = J;
const C = require('./src/cppstep.js');
require('./src/course_cpp.js');
let problems = 0;
const ok = (cond, msg) => { if (!cond) { problems++; console.log('BAD  ' + msg); } };
const H = '#include <iostream>\nusing namespace std;\n\n';

// ---- 1. hand-written cases
{
  const t = C.trace(H + 'void swap(int* a, int* b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}\n\nint main() {\n    int x = 1, y = 2;\n    swap(&x, &y);\n    cout << x << y << endl;\n    return 0;\n}', '');
  ok(t.finished && !t.error && t.output === '21\n', 'swap runs to the end and prints 21');
  const inSwap = t.steps.find(s => s.frames.some(f => f.name === 'swap'));
  ok(inSwap && inSwap.frames.length === 2, 'a call makes a second frame');
  const main = inSwap.frames[0], sw = inSwap.frames[1];
  const x = main.vars.find(v => v.name === 'x'), a = sw.vars.find(v => v.name === 'a');
  ok(x && x.addr === 1000 && x.type === 'int', 'first int in main is at 1000');
  ok(a && a.kind === 'pointer' && a.type === 'int*' && a.addr === 1008 && a.param, 'parameter a is an int* at 1008');
  ok(a && a.target && a.target.label === 'x' && a.value === '1000', 'a holds 1000 and points to x');
  const after = t.steps.find(s => s.frames.length === 1 && s.frames[0].vars.find(v => v.name === 'y' && v.value === '1'));
  ok(after && after.frames[0].vars.find(v => v.name === 'y').changed, 'y is marked changed after the swap returns');
  ok(t.steps[t.steps.length - 1].done, 'the last step is the finished state');
}
{
  const t = C.trace(H + 'int sum(int arr[], int n) {\n    int total = 0;\n    for (int i = 0; i < n; i++) {\n        total += arr[i];\n    }\n    return total;\n}\n\nint main() {\n    int data[4] = {1, 2, 3, 4};\n    int* p = &data[2];\n    char word[] = "hi";\n    int m[2][2] = {{1, 2}, {3, 4}};\n    int s = sum(data, 4);\n    int unset;\n    return 0;\n}', '');
  ok(t.finished && !t.error, 'arrays program finishes');
  const st = t.steps.find(s => s.frames.some(f => f.name === 'sum'));
  const data = st.frames[0].vars.find(v => v.name === 'data'), p = st.frames[0].vars.find(v => v.name === 'p');
  ok(data.kind === 'array' && data.type === 'int[4]' && data.cells.length === 4 && data.cells[2].addr === data.addr + 8, 'data is an int[4] shown cell by cell');
  ok(p.kind === 'pointer' && p.target.label === 'data[2]' && +p.value === data.addr + 8, 'p points to data[2]');
  const arr = st.frames[1].vars.find(v => v.name === 'arr');
  ok(arr.kind === 'pointer' && arr.type === 'int*' && arr.target.label === 'data[0]', 'an array parameter is a pointer to the caller\'s first element');
  const word = st.frames[0].vars.find(v => v.name === 'word');
  ok(word.type === 'char[3]' && word.text === 'hi' && word.cells[2].value === "'\\0'", 'char array shows its characters, terminator and text');
  const m = st.frames[0].vars.find(v => v.name === 'm');
  ok(m.type === 'int[2][2]' && m.cells[1].row[0].value === '3', '2-D array shows rows');
  const last = t.steps[t.steps.length - 2];
  const unset = last.frames[0].vars.find(v => v.name === 'unset');
  ok(unset && unset.unset && unset.value === '?', 'a variable never given a value shows ?');
}
{
  const t = C.trace(H + 'int* bad() {\n    int local = 7;\n    return &local;\n}\n\nint main() {\n    int* p = bad();\n    return 0;\n}', '');
  const st = t.steps.find(s => s.frames.length && s.frames[s.frames.length - 1].vars.some(v => v.name === 'p'));
  const p = st.frames[st.frames.length - 1].vars.find(v => v.name === 'p');
  ok(p.target && p.target.gone && p.target.label === 'local', 'a pointer to a returned function\'s local is shown as dangling');
}
{
  const t = C.trace(H + 'int main() {\n    int a[3] = {1, 2, 3};\n    int t = 0;\n    for (int i = 0; i <= 3; i++) {\n        t += a[i];\n    }\n    return 0;\n}', '');
  ok(t.error && /line 8/.test(t.error) && t.errorLine === 8 && !t.finished, 'out-of-bounds read is reported at its line: ' + t.error);
}
{
  const t = C.trace(H + 'int main() {\n    int n = 1;\n    while (n != 10) {\n        n = n + 2;\n    }\n    return 0;\n}', '', { maxSteps: 200 });
  ok(t.truncated && t.steps.length === 200, 'a never-ending multi-line loop stops at maxSteps');
  const u = C.trace(H + 'int main() {\n    int n = 1;\n    while (n != 10) n = n + 2;\n    return 0;\n}', '', { maxMs: 500 });
  ok(u.error && /Time limit/.test(u.error), 'a never-ending one-line loop hits the time limit');
}
{
  const t = C.trace(H + 'int main() {\n    int n;\n    cin >> n;\n    cout << n * 2 << endl;\n    return 0;\n}', '21');
  ok(t.finished && t.output === '42\n', 'input is read from stdin');
  const s = C.trace(H + 'int main() {\n    int x = 5\n    return 0;\n}', '');
  ok(!s.steps.length && s.error, 'a syntax error gives no steps and an error');
}

// ---- 2. every C++ example and solution in the course
const course = window.COURSES.find(c => c.id === 'cpp');
// The site's own ensureMainReturns (src/cpputil.js), so the tests run C++ exactly as the site does.
const { ensureMainReturns } = require('./src/cpputil.js');
const prepare = ensureMainReturns;
let checked = 0;
course.lessons.forEach((L, li) => {
  const progs = [];
  for (const b of L.blocks) {
    if (b && b.play && !b.expectError) progs.push({ code: b.play, stdin: b.stdin || '', name: 'lesson ' + (li + 1) + ' playground' });
    if (b && b.ex && b.ex.solution && /int\s+main\s*\(/.test(b.ex.solution)) progs.push({ code: b.ex.solution, stdin: b.ex.sampleStdin || '', name: b.ex.id + ' solution' });
  }
  for (const p of progs) {
    if (/\brand\s*\(/.test(p.code) && !/\bsrand\s*\(/.test(p.code)) continue;   // unseeded rand: the two runs could differ
    let t;
    try { t = C.trace(p.code, p.stdin, { prepare, maxSteps: 4000, maxMs: 8000 }); } catch (e) { ok(false, p.name + ' crashed the stepper: ' + e.message); continue; }
    let plain = '';
    try { J.run(prepare(p.code), p.stdin, { stdio: { write: (s) => { plain += s; } }, maxTimeout: 8000, unsigned_overflow: 'warn' }); } catch (e) { plain = null; }
    checked++;
    if (t.error) ok(false, p.name + ': ' + t.error);
    else if (t.finished) ok(t.output === plain, p.name + ': stepping printed something different from a normal run');
  }
});
console.log(problems ? problems + ' problems' : 'cppstep OK (' + checked + ' course programs stepped)');
process.exit(problems ? 1 : 0);
