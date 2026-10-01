/* Helpers for grading Java exercises, needed by the page (app.js) and by the node tests, not by the sandbox that runs the program.
   Exposed as window.JAVAUTIL (browser) or module.exports (node).

   Exercises that ask for a method: the checker supplies the class and a main that prints the test's expression.
     test.call  → System.out.println(<call>) in main       test.main → that text is the body of main       test.setup → statements before the println
     ex.prelude → imports, placed before the class
   Exercises that ask for a whole class or classes (ex.classes: true): the student's code stays as it is, and a class Check with the test's main
   is put in front of it. Lines in error messages are moved back by `shift`, the number of lines added before the student's code. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.JAVAUTIL = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  function harness(ex, code, test) {
    const prelude = ex.prelude ? ex.prelude.replace(/\s*$/, '\n') : '';
    const body = test.main !== undefined ? test.main : (test.setup ? test.setup + '\n' : '') + '        System.out.println(' + test.call + ');';
    if (ex.classes) {
      const several = /class[\s\S]*class/.test(ex.starter || '');
      if (/\bstatic\s+void\s+main\s*\(/.test(code)) return { error: 'For this exercise write only the class' + (several ? 'es' : '') + ': the checker supplies its own main to test ' + (several ? 'them' : 'it') + '.' };
      const head = prelude + 'class Check {\n    public static void main(String[] args) {\n' + body + '\n    }\n}\n';
      return { src: head + code, shift: head.split('\n').length - 1 };
    }
    if (/\bstatic\s+void\s+main\s*\(/.test(code)) return { error: 'For this exercise write only the method: the checker supplies its own main() to call it.' };
    if (/\bclass\s+\w+/.test(code)) return { error: 'For this exercise write only the method, without a class around it: the checker supplies the class and a main() to call it.' };
    const head = prelude + 'public class Main {\n';
    return { src: head + code + '\n\n    public static void main(String[] args) {\n' + body + '\n    }\n}\n', shift: head.split('\n').length - 1 };
  }
  // Error messages name lines of the file the checker built; move them back to the student's lines.
  const shiftLines = (err, shift) => (shift ? String(err).replace(/(\.java:)(\d+)/g, (m, a, n) => a + Math.max(1, +n - shift)) : err);
  const isCompileError = (err) => /\.java:\d+: error:/.test(String(err || ''));
  return { harness, shiftLines, isCompileError };
});
