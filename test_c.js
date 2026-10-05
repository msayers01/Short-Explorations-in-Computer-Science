// C in the Code Lab and the terminal: the real worker (src/clangworker.js, the same source the page builds) run in node's worker_threads with the
// same Clang toolchain the browser downloads (node's build of it). Checks: a C program compiles and runs, a compile error names main.c and its line,
// -std= is honoured (C23 refused in C99), argv, the exit status, a crashed or failed compile never runs the previous program, the C++ path is
// unchanged, and typed input (runner.js typedRunner's replay protocol): the prompt is on the screen before the program asks, and srand(time(0))
// gives the same numbers in every replay. About half a minute: every compile is real.
'use strict';
const fs = require('fs'), path = require('path'), { Worker } = require('worker_threads');
let fails = 0, passes = 0;
const check = (name, ok, extra) => { if (ok) passes++; else { fails++; console.log('FAIL ' + name + (extra !== undefined ? '\n   ' + JSON.stringify(extra) : '')); } };

const W = require('./src/clangworker.js');
// pure helpers first
check('stdFor: C standards pass, others become gnu17', W.stdFor('c', 'c99') === 'c99' && W.stdFor('c', 'gnu23') === 'gnu23' && W.stdFor('c', 'c89') === 'c89' && W.stdFor('c', 'gnu++20') === 'gnu17' && W.stdFor('c', '-O2 x') === 'gnu17' && W.stdFor('c', undefined) === 'gnu17');
check('stdFor: C++ is as before', W.stdFor('cpp', 'gnu++17') === 'gnu++17' && W.stdFor('cpp', 'c17') === 'gnu++20' && W.stdFor('cpp', 'gnu++98') === 'gnu++20');
const src1 = 'int main(void) {\n  return 0;\n}';
check('cSource: the student\'s lines come first, unchanged', W.cSource(src1).startsWith(src1 + '\n') && W.cSource(src1).split('\n').slice(0, 3).join('\n') === src1);

// the Lab's helpers (labutil.js): C has Arguments, and its errors are marked at the line main.c names (an error before a warning's line)
const LU = require('./src/labutil.js');
check('labutil: C keeps its Arguments', LU.cleanArgs({ c: 'a "b c"', cpp: 'x' }).c === 'a "b c"' && !('cpp' in LU.cleanArgs({ cpp: 'x' })));
check('labutil: a C error line', LU.errorLine('c', "main.c:2:5: warning: unused variable 'u'\nmain.c:7:3: error: expected ';' after expression") === 7 && LU.errorLine('c', 'main.c:4:1: warning: x') === 4 && LU.errorLine('c', 'main.cpp:3:1: error: x') === 0 && LU.errorLine('c', 'Time limit exceeded') === 0);

// the terminal's gcc / cc / clang: a .c is compiled as C, g++ and clang++ keep compiling it as C++ (as the real drivers do)
const SHELL = require('./src/shell.js');
async function shellRun(line) {
  const calls = [];
  const fs = SHELL.makeFS(null, { now: () => 1759330000000 });
  const sh = SHELL.makeShell({ fs, now: fs.now,
    compile: async (lang, src, o) => { calls.push(['compile', lang, o.std, o.name]); return /bad/.test(src) ? { err: o.name + ':1:1: error: bad' } : { err: null, std: lang === 'c' ? 'gnu17' : undefined }; },
    run: async (lang, src, o) => { calls.push(['run', lang, o.std, o.args.join(',')]); o.onOutput(lang + ' ran\n'); return { err: null, exit: 0 }; },
    typedInput: (lang) => lang === 'c' });
  let out = '';
  await sh.exec('echo "int main(void) { return 0; }" > hello.c; echo "int main(void) { bad }" > bad.c; echo "int main() {}" > m.cpp', { out: () => { }, err: () => { } });
  const exit = await sh.exec(line, { out: (s) => { out += s; }, err: (s) => { out += s; }, tty: true, ask: async () => '' });
  return { out, exit, calls };
}
const shellChecks = (async () => {
  let r = await shellRun('gcc hello.c -o hello && ./hello one two');
  check('shell: gcc on a .c compiles C and ./hello runs it as C with its arguments', r.exit === 0 && r.out === 'c ran\n' && JSON.stringify(r.calls) === JSON.stringify([['compile', 'c', undefined, 'hello.c'], ['run', 'c', 'gnu17', 'one,two']]), r);
  for (const cmd of ['cc', 'clang']) { r = await shellRun(cmd + ' -std=c99 hello.c'); check('shell: ' + cmd + ' compiles a .c as C with its -std', r.calls[0][1] === 'c' && r.calls[0][2] === 'c99', r.calls); }
  r = await shellRun('g++ hello.c -o h; clang++ hello.c -o h2; g++ m.cpp -o m && ./m');
  check('shell: g++ and clang++ compile a .c as C++, and .cpp is unchanged', r.calls.map((c) => c[1]).join() === 'cpp,cpp,cpp,cpp', r.calls);
  r = await shellRun('gcc bad.c -o b; ls b');
  check('shell: a C compile error is printed and makes no program', /bad\.c:1:1: error: bad/.test(r.out) && /cannot access 'b'/.test(r.out), r.out);
  r = await shellRun('gcc hello.c && file a.out');
  check('shell: gcc without -o makes a.out', /a\.out: ELF/.test(r.out), r.out);
})();

const shim ="const { parentPort, workerData } = require('worker_threads'); global.self = global; global.postMessage = (m) => parentPort.postMessage(m); parentPort.on('message', (m) => { if (global.onmessage) global.onmessage({ data: m }); });" +
  " import(workerData.tc).then((T) => { global.clangWasmToolchain = T; global.module = undefined; global.exports = undefined; global.require = undefined; (0, eval)(workerData.source); });";
function spawn() {
  const w = new Worker(shim, { eval: true, workerData: { source: fs.readFileSync(path.join(__dirname, 'src/clangworker.js'), 'utf8'), tc: require.resolve('@live-codes/clang-wasm/toolchain').replace(/[^/\\]+$/, 'toolchain.node.js') } });
  let ready, onMsg = null, nextId = 1;
  const started = new Promise((r) => { ready = r; });
  w.on('message', (m) => { if (m && m.t === 'ready') ready(); else if (onMsg) onMsg(m); });
  w.on('error', (e) => { console.log('worker error', e); process.exit(1); });
  return {
    async run(payload) {
      await started;
      const id = nextId++; let out = '', notes = '';
      const parts = [];
      return new Promise((resolve) => {
        onMsg = (m) => { if (m.id !== id) return; if (m.t === 'out') out += m.text; else if (m.t === 'note') notes += m.text; else if (m.t === 'part') parts.push(m); else if (m.t === 'done') resolve({ out, notes, parts, err: m.err || null, needInput: m.needInput === true }); };
        w.postMessage(Object.assign({ t: 'run', id, stdins: [''] }, payload));
      });
    },
    end: () => w.terminate()
  };
}
// the page's loop (runner.js typedRunner), with the answers given in advance
async function typed(w, code, answers, opts) {
  const lines = [], times = [], t0 = Date.now(); let out = '', rounds = 0; const shown = [];
  for (;;) {
    const r = await w.run(Object.assign({ code, lang: 'c', typed: { lines, times, t0, seed: 4242, skip: out.length } }, opts));
    rounds++; out += r.out;
    if (!r.needInput) return { out, err: r.err || (r.parts[0] && r.parts[0].err) || null, exit: r.parts[0] ? r.parts[0].exit : 0, rounds, shown };
    shown.push(out);   // what is on the screen when the program asks
    if (lines.length >= answers.length) return { out, err: 'asked for more than the test gives', rounds, shown };
    lines.push(answers[lines.length]); times.push(Date.now() + 1500 * lines.length);   // the student takes a while to answer
  }
}

(async () => {
  await shellChecks;
  const w = spawn();
  const t0 = Date.now();
  // 1. a program runs: output, argv, sizes on wasm32, the exit status
  const hello = '#include <stdio.h>\n#include <string.h>\nint main(int argc, char *argv[]) {\n    printf("Hello, C! %zu %zu\\n", sizeof(long), sizeof(void *));\n    for (int i = 1; i < argc; i++) printf("[%s]", argv[i]);\n    printf(" %s\\n", strrchr(argv[0], \'/\') ? "path" : argv[0]);\n    return 3;\n}\n';
  let r = await w.run({ code: hello, lang: 'c', std: 'gnu17', args: ['one', 'two words'], argv0: 'hello' });
  check('C: runs, long and pointers are 4 bytes', r.err === null && r.parts[0] && r.parts[0].out.startsWith('Hello, C! 4 4\n'), r);
  check('C: argv has the arguments and argv[0] the program name', r.parts[0] && r.parts[0].out.includes('[one][two words] hello\n'), r.parts[0]);
  check('C: the exit status comes back', r.parts[0] && r.parts[0].exit === 3, r.parts[0] && r.parts[0].exit);
  check('C: output is sent as it is printed (one input)', r.out === r.parts[0].out, r.out);
  // 2. the same source again: compiled once (lastGood), and several inputs
  r = await w.run({ code: '#include <stdio.h>\nint main(void) { int a, b; if (scanf("%d %d", &a, &b) == 2) printf("%d\\n", a + b); else puts("none"); return 0; }\n', lang: 'c', stdins: ['2 3\n', '40 2', ''] });
  check('C: one compile, one run per input', r.err === null && r.parts.map((p) => p.out).join('|') === '5\n|42\n|none\n', r.parts);
  // 3. a compile error names main.c and the line; nothing runs
  r = await w.run({ code: '#include <stdio.h>\n\nint main(void) {\n    int x = 1\n    printf("%d\\n", x);\n}\n', lang: 'c' });
  check('C: a compile error is reported with main.c:line', /main\.c:4:\d+: error: expected ';'/.test(r.err || ''), r.err);
  check('C: a failed compile runs nothing', !r.parts.length && r.out === '', r);
  // 4. -std: C23's bool, auto and nullptr are refused in C99 and accepted in C23
  const c23 = '#include <stdio.h>\nint main(void) {\n    auto n = 5;\n    bool ok = true;\n    int *p = nullptr;\n    printf("%d %d %d\\n", n, ok, p == nullptr);\n    return 0;\n}\n';
  r = await w.run({ code: c23, lang: 'c', std: 'c99' });
  check('C99 refuses C23', /error:/.test(r.err || '') && /nullptr|bool|implicit int|type specifier/.test(r.err || ''), r.err);
  r = await w.run({ code: c23, lang: 'c', std: 'gnu23' });
  check('C23 accepts it', r.err === null && r.parts[0] && r.parts[0].out === '5 1 1\n', r);
  r = await w.run({ code: c23, lang: 'c', std: 'not-a-standard' });
  check('an unknown standard falls back to gnu17 (which refuses nullptr)', /error:/.test(r.err || ''), r.err);
  // 5. warnings come back as a note; implicit declarations are errors, as in clang
  r = await w.run({ code: '#include <stdio.h>\nint main(void) {\n    int unused;\n    printf("ok\\n");\n    return 0;\n}\n', lang: 'c' });
  check('C: warnings are a note, and the program still runs', /main\.c:3:\d+: warning: unused variable/.test(r.notes) && r.parts[0].out === 'ok\n', r);
  r = await w.run({ code: 'int main(void) {\n    printf("hi\\n");\n    return 0;\n}\n', lang: 'c' });
  check('C: printf without #include <stdio.h> is an error', /main\.c:2:\d+: error: call to undeclared library function 'printf'/.test(r.err || ''), r.err);
  // 6. clock() links and counts from the start; a crash is reported, not run on
  r = await w.run({ code: '#include <stdio.h>\n#include <time.h>\nint main(void) {\n    clock_t c = clock();\n    printf("%d\\n", c >= 0 && c < CLOCKS_PER_SEC);\n    return 0;\n}\n', lang: 'c' });
  check('C: clock() works and starts near zero', r.err === null && r.parts[0] && r.parts[0].out === '1\n', r);
  r = await w.run({ code: '#include <stdio.h>\n#include <stdlib.h>\nint main(void) {\n    int *p = NULL;\n    puts("before");\n    abort();\n}\n', lang: 'c' });
  check('C: abort() is reported as a crash after the output so far', r.parts[0] && r.parts[0].out === 'before\n' && /stopped abnormally/.test(r.parts[0].err || ''), r.parts[0]);
  // 7. a source that fails after a good compile must not run the good one (lastGood is per language and source)
  await w.run({ code: hello, lang: 'c' });
  r = await w.run({ code: hello.replace('return 3;', 'return 3') , lang: 'c' });
  check('C: after a good program, a broken one runs nothing', !!r.err && !r.parts.length, r);
  // 8. C++ through the same worker is unchanged, and a .cpp after a .c (same file names in the build) is compiled as C++
  r = await w.run({ code: '#include <iostream>\nint main() { std::cout << "C++ " << sizeof(long) << std::endl; return 0; }\n', std: 'gnu++20' });
  check('C++: still compiles and runs', r.err === null && r.parts[0] && r.parts[0].out === 'C++ 4\n', r);
  r = await w.run({ code: '#include <iostream>\nint main() { std::cout << "x"; }\n', lang: 'c' });
  check('C: C++ source given as C is refused', /iostream/.test(r.err || ''), r.err);
  // 9. typed input: a prompt without a newline is shown before the program waits, and the answers come back in order
  const ask = '#include <stdio.h>\nint main(void) {\n    char name[40];\n    int age;\n    printf("Name? ");\n    scanf("%39s", name);\n    printf("Age? ");\n    scanf("%d", &age);\n    printf("Hello %s, %d next year\\n", name, age + 1);\n    return 0;\n}\n';
  let t = await typed(w, ask, ['Ada', '36']);
  check('typed C: the prompt is on the screen when the program asks', t.shown[0] === 'Name? ' && t.shown[1] === 'Name? Age? ', t.shown);
  check('typed C: the program finishes with the answers', t.out === 'Name? Age? Hello Ada, 37 next year\n' && t.rounds === 3 && !t.err, t);
  // Ctrl+D: the end of the input, scanf sees EOF
  t = await typed(w, '#include <stdio.h>\nint main(void) { int n, sum = 0; printf("> "); while (scanf("%d", &n) == 1) { sum += n; printf("> "); } printf("\\nsum %d\\n", sum); return 0; }\n', ['4', '5', null]);
  check('typed C: a loop until the end of the input', t.out === '> > > \nsum 9\n' && !t.err, t);
  // srand(time(0)): the same numbers in every replay, so what is on the screen stays true
  const guess = '#include <stdio.h>\n#include <stdlib.h>\n#include <time.h>\nint main(void) {\n    srand(time(NULL));\n    int secret = rand() % 1000, g;\n    printf("secret %d\\n", secret);\n    while (printf("Guess: "), scanf("%d", &g) == 1) {\n        if (g == secret) break;\n    }\n    printf("again %d, at %ld\\n", secret, (long)time(NULL));\n    return 0;\n}\n';
  t = await typed(w, guess, ['1', '2', '3', null]);
  const secrets = (t.out.match(/secret (\d+)/g) || []);
  const again = (t.out.match(/again (\d+)/) || [])[1];
  check('typed C: srand(time(0)) gives the same secret in every replay', secrets.length === 1 && again === secrets[0].split(' ')[1], t.out);
  check('typed C: the clock has moved on by the time the student answered', (() => { const at = +(t.out.match(/at (\d+)/) || [])[1]; return at * 1000 >= Date.now() + 3000; })(), t.out);
  // random bytes (getentropy) also replay the same
  t = await typed(w, '#include <stdio.h>\n#include <unistd.h>\nint main(void) { unsigned char b[4]; getentropy(b, 4); printf("%u %u\\n", b[0], b[1]); int x; scanf("%d", &x); printf("%u %u %d\\n", b[0], b[1], x); return 0; }\n', ['7']);
  const nums = t.out.split('\n');
  check('typed C: random bytes are the same in a replay', nums[1] === nums[0] + ' 7', t.out);
  // output already on the screen is not sent twice (a long output before the question)
  t = await typed(w, '#include <stdio.h>\nint main(void) { for (int i = 0; i < 3000; i++) printf("%d\\n", i); int x; scanf("%d", &x); printf("got %d\\n", x); return 0; }\n', ['5']);
  check('typed C: the output before a question is shown once', (t.out.match(/^2999$/gm) || []).length === 1 && t.out.endsWith('2999\ngot 5\n'), t.out.slice(-40));
  // warnings in typed mode: once, in the first run only
  let notes = 0;
  { const lines = [], times = []; for (;;) { const rr = await w.run({ code: '#include <stdio.h>\nint main(void) { int unused; int x; scanf("%d", &x); printf("%d\\n", x); return 0; }\n', lang: 'c', typed: { lines, times, t0: Date.now(), seed: 1, skip: 0 } }); if (rr.notes) notes++; if (!rr.needInput) break; lines.push('1'); times.push(Date.now()); } }
  check('typed C: warnings only in the first run', notes === 1, notes);
  w.end();
  console.log('C: ' + passes + ' passed, ' + fails + ' failed (' + Math.round((Date.now() - t0) / 1000) + ' s)');
  if (fails) process.exit(1);
})();
