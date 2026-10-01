/* Helpers for running C++ through JSCPP: they are needed both by the page (error wording) and by the sandbox that runs the
   program (the source is prepared there). Exposed as window.CPPUTIL (browser) or module.exports (node tests). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CPPUTIL = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  // JSCPP's own messages, put in words a student can act on.
  function cppErrorText(m) {
    if (/Time limit/.test(m)) return 'Time limit exceeded: the program ran for too long. Is there a loop that never ends?';
    if (/Parsing Failure/.test(m)) {
      const mm = m.match(/line (\d+) \(column (\d+)\): ([^\n]*)\n[^\n]*\n(Expected[^\n]*)/);
      if (mm) { const exp = mm[4].replace(/\[[^\]]*\]/g, '').replace(/Expected /, '').split(' or ')[0]; return 'Syntax error near line ' + mm[1] + ': ' + mm[3].trim() + '\n(expected one of ' + exp.slice(0, 80) + '…)'; }
      return 'Syntax error: ' + m.split('\n').slice(1, 3).join(' ');
    }
    return m.replace(/^<position unavailable> /, '').replace(/^(\d+):(\d+) /, 'line $1: ');
  }
  function ensureMainReturns(code) {
    // JSCPP cannot interrupt an empty-condition loop, which would freeze the page: for(;;) means for(;1;)
    code = code.replace(/\bfor\s*\(\s*;\s*;\s*\)/g, (m, off) => ((code.slice(code.lastIndexOf('\n', off) + 1, off).match(/"/g) || []).length % 2 ? m : 'for(;1;)'));
    const i = code.search(/\bint\s+main\s*\(/); if (i < 0) return code;
    const open = code.indexOf('{', i); if (open < 0) return code;
    let depth = 0, j = open, inStr = null;
    for (; j < code.length; j++) {
      const c = code[j];
      if (inStr) { if (c === '\\') j++; else if (c === inStr) inStr = null; continue; }
      if (c === '"' || c === "'") { inStr = c; continue; }
      if (c === '/' && code[j + 1] === '/') { j = code.indexOf('\n', j); if (j < 0) return code; continue; }
      if (c === '/' && code[j + 1] === '*') { j = code.indexOf('*/', j + 2); if (j < 0) return code; j++; continue; }
      if (c === '{') depth++; else if (c === '}') { depth--; if (depth === 0) break; }
    }
    if (j >= code.length) return code;
    const body = code.slice(open + 1, j);
    if (/\breturn\b[^;]*;\s*$/.test(body.replace(/\/\/[^\n]*/g, ''))) return code;
    return code.slice(0, j) + '\n    return 0;\n' + code.slice(j);
  }

  return { ensureMainReturns, cppErrorText };
});
