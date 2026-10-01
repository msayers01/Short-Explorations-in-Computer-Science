/* How an exercise written for Full C++ (real Clang; see runner.js CLANGRUN) is turned into programs to run. The page's grade() and test_course.js
   both use this, so the tests check exactly what a student's program meets.

   harness(ex, code) → {error} or {src, stdins, shift}
     Real C++ takes a second or two to compile, so a program is compiled once and run once for each test (CLANGRUN.runMany).
     Tests that call a function share one main(), which reads the number of the test to run from the first line of its input.
     shift is how many lines the checker put before the student's code (error messages are moved back by that much). */
(function () {
  'use strict';
  function harness(ex, code) {
    const tests = ex.tests || [];
    const calls = tests.filter((t) => t.call !== undefined || t.main !== undefined).length;
    if (calls && calls !== tests.length) return { error: 'This exercise mixes two kinds of test; the checker cannot run it.' };
    if (!calls) return { src: code, stdins: tests.map((t) => t.stdin || ''), shift: 0 };
    if (/\bint\s+main\s*\(/.test(code)) return { error: 'For this exercise write only the function(s) — the checker supplies its own main() to call them.' };
    const pre = ex.prelude || '#include <iostream>\nusing namespace std;\n';
    const cases = tests.map((t, i) => '    case ' + i + ': {\n' + (t.main !== undefined ? t.main : (t.setup || '') + '\n        cout << (' + t.call + ') << endl;') + '\n    } break;').join('\n');
    return {
      src: pre + '\n' + code + '\n\nint main() {\n    int which_test = -1;\n    cin >> which_test;\n    switch (which_test) {\n' + cases + '\n    }\n    return 0;\n}\n',
      stdins: tests.map((t, i) => i + '\n' + (t.stdin || '')),
      shift: (pre + '\n').split('\n').length - 1
    };
  }
  const shiftLines = (text, shift) => (shift ? String(text).replace(/main\.cpp:(\d+):/g, (m, n) => 'main.cpp:' + Math.max(1, n - shift) + ':') : String(text));
  const api = { harness, shiftLines };
  if (typeof window !== 'undefined') window.CPPFULL = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
