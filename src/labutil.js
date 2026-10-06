/* Small pure helpers of the Code Lab, shared with the node tests (test_javaproject.js) and backup.js. Exposed as window.LABUTIL or module.exports.

     splitArgs(text)      the Arguments box as words, the way a shell splits  python app.py one "two words"  (quotes and backslashes; no
                          variables or wildcards: what is typed is what the program gets)
     cleanArgs(saved)     the saved Arguments of each language (Python, Java and C; the teaching C++ cannot pass argv): strings only, one line,
                          at most MAX characters. Saved state and backups arrive from storage and files, so nothing else is kept.
     errorLine(lang, err) the line an error message names in the current file, or 0 (the editor marks it). Java is mapped by javaproject.js;
                          C's compiler calls the file main.c whatever its tab is called. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LABUTIL = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const MAX = 1000, MAX_WORDS = 100, ARG_LANGS = ['python', 'java', 'c'];
  function splitArgs(text) {
    if (typeof text !== 'string') return [];
    const out = []; let cur = null, q = null;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === q) q = null; else if (c === '\\' && q === '"' && /["\\]/.test(text[i + 1] || '')) cur += text[++i]; else cur += c; continue; }
      if (c === '"' || c === "'") { q = c; if (cur === null) cur = ''; continue; }
      if (c === '\\' && i + 1 < text.length) { cur = (cur || '') + text[++i]; continue; }
      if (/\s/.test(c)) { if (cur !== null) { out.push(cur); cur = null; } continue; }
      cur = (cur || '') + c;
    }
    if (cur !== null) out.push(cur);
    return out.slice(0, MAX_WORDS);
  }
  function cleanArgs(saved) {
    const out = {};
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return out;
    for (const l of ARG_LANGS) if (Object.prototype.hasOwnProperty.call(saved, l) && typeof saved[l] === 'string') out[l] = saved[l].replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, MAX);
    return out;
  }
  function errorLine(lang, err) {
    const s = String(err || '');
    const m = lang === 'cpp' || lang === 'cppfull' ? (s.match(/main\.cpp:(\d+)/) || s.match(/\bline (\d+)/i)) : lang === 'c' ? (s.match(/main\.c:(\d+):\d+: (?:fatal )?error/) || s.match(/main\.c:(\d+):/)) : lang === 'python' ? s.match(/\bline (\d+)\b(?! of )/i) : null;   // "on line 2 of helper.py" is in another tab
    return m ? +m[1] : 0;
  }
  return { splitArgs, cleanArgs, errorLine, ARG_LANGS, MAX };
});
