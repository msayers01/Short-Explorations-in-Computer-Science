/* Parsons problems: the parts that need no page, shared by app.js (window.PARSONS) and test_course.js (module.exports).
   An exercise { kind: 'parsons', id, lang, lines: [the solution, indented with 4 spaces a level], distractors?: [...], indent?, tests? }.
   Blocks are the solution's lines (trimmed, with their indent level) followed by the distractors; their shuffled order depends only on
   the exercise id, so it is the same on every visit, and is never the solution order. A placement is [[block index, indent level], ...]. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PARSONS = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  /** Does the student set the indentation? Yes in Python, where it is part of the program; elsewhere braces decide it. */
  const indent = (ex) => (ex.indent != null ? !!ex.indent : ex.lang === 'python');
  function blocks(ex) {
    const all = ex.lines.map((l) => ({ text: l.trim(), indent: Math.floor(l.match(/^ */)[0].length / 4), real: true }))
      .concat((ex.distractors || []).map((l) => ({ text: l.trim(), indent: 0, real: false })));
    let h = 2166136261; for (let i = 0; i < ex.id.length; i++) { h ^= ex.id.charCodeAt(i); h = Math.imul(h, 16777619); }
    const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
    const order = all.map((b, i) => i);
    for (let tries = 0; tries < 5; tries++) {
      for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
      if (order.some((b, i) => b !== i)) break;   // never hand out the answer in order
    }
    return { blocks: all, order };
  }
  /** placement → program text. Without student indentation, braces set it. */
  function code(ex, all, placed) {
    if (indent(ex)) return placed.map(([b, n]) => '    '.repeat(n) + all[b].text).join('\n');
    let depth = 0;
    return placed.map(([b]) => { const t = all[b].text; if (/^[}\])]/.test(t)) depth = Math.max(0, depth - 1); const line = '    '.repeat(depth) + t; if (/[{([]\s*$/.test(t)) depth++; return line; }).join('\n');
  }
  const solutionPlacement = (ex) => { const B = blocks(ex); return ex.lines.map((l, i) => [i, B.blocks[i].indent]); };
  const solution = (ex) => code(ex, blocks(ex).blocks, solutionPlacement(ex));
  /** what the page saved ({ p: placement } while unfinished, the program once passed) → program text */
  function program(ex, saved) {
    if (saved == null) return '';
    let s = null; try { s = JSON.parse(saved); } catch (e) { return String(saved); }
    if (!s || typeof s !== 'object' || !Array.isArray(s.p)) return String(saved);
    const B = blocks(ex);
    return code(ex, B.blocks, s.p.filter((x) => Array.isArray(x) && Number.isInteger(x[0]) && x[0] >= 0 && x[0] < B.blocks.length).map(([b, n]) => [b, Math.max(0, Math.min(8, n | 0))]));
  }
  const tidy = (c) => String(c).replace(/\r/g, '').split('\n').map((l) => l.replace(/\s+$/, '')).filter((l) => l !== '').join('\n');
  /** without tests: the program must be the solution, line for line and indent for indent */
  const orderOk = (ex, prog) => tidy(prog) === tidy(solution(ex));
  return { indent, blocks, code, solution, solutionPlacement, program, orderOk };
});
