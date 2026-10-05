/* What is different between the output an exercise expects and the output the program printed: line by line, where on the line the
   first difference is, and a plain sentence for the usual reasons (capitals, spaces, a number written another way, lines missing or
   extra). Used by the verdict of an exercise (app.js); pure, so test_outdiff.js checks it in node. Registered as window.OUTDIFF.

     OUTDIFF.compare(expected, got) → { rows: [{ n, kind: 'same'|'diff'|'missing'|'extra', exp, got, col }], note, firstBad }
       Lines are compared as the grader compares them: trailing spaces and blank lines at the end do not count. col is the index of the first
       character that differs on a 'diff' row, eEnd and gEnd where the differing part ends (what follows is the same on both lines).
       note is one sentence, or '' when no reason is recognised.
     OUTDIFF.visible(text) → the text with spaces as · and tabs as → (for showing a line where white space matters) */
(function (factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else window.OUTDIFF = factory();
})(function () {
  'use strict';
  const MAX_ROWS = 200;
  const linesOf = (s) => String(s == null ? '' : s).replace(/\r/g, '').split('\n').map((l) => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '').split('\n');
  const visible = (t) => String(t).replace(/ /g, '·').replace(/\t/g, '→');
  const firstDiff = (a, b) => { let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++; return i; };
  const squash = (s) => s.replace(/\s+/g, '');
  const NUM = /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
  const sameNumbers = (a, b) => { const x = a.match(NUM) || [], y = b.match(NUM) || []; return x.length > 0 && x.length === y.length && x.every((v, i) => Number(v) === Number(y[i])) && a.replace(NUM, '#') === b.replace(NUM, '#'); };

  function compare(expected, got) {
    const E = linesOf(expected), G = got === '' || got == null ? [] : linesOf(got);
    if (E.length === 1 && E[0] === '') E.length = 0;   // nothing expected is no lines, not one empty line
    const rows = [], n = Math.min(MAX_ROWS, Math.max(E.length, G.length));
    for (let i = 0; i < n; i++) {
      const e = E[i], g = G[i];
      if (e === undefined) rows.push({ n: i + 1, kind: 'extra', exp: null, got: g });
      else if (g === undefined) rows.push({ n: i + 1, kind: 'missing', exp: e, got: null });
      else if (e === g) rows.push({ n: i + 1, kind: 'same', exp: e, got: g });
      else { const col = firstDiff(e, g); let k = 0; while (k < e.length - col && k < g.length - col && e[e.length - 1 - k] === g[g.length - 1 - k]) k++; rows.push({ n: i + 1, kind: 'diff', exp: e, got: g, col, eEnd: e.length - k, gEnd: g.length - k }); }   // the differing part is [col, end) of each
    }
    const bad = rows.filter((r) => r.kind !== 'same'), first = bad[0] || null;
    return { rows, note: first ? noteFor(E, G, rows, first) : '', firstBad: first ? first.n : 0 };
  }

  function noteFor(E, G, rows, first) {
    const plural = (k, w) => k + ' ' + w + (k === 1 ? '' : 's');
    if (!G.length) return 'Your program printed nothing. Check that it prints its answer, not only works it out.';
    const diffs = rows.filter((r) => r.kind === 'diff');
    // the same lines with one more or one fewer before them: an extra or a missing line shifted everything after it
    if (first.kind === 'diff' && E.length !== G.length) {
      if (G.length > E.length && G.slice(first.n).join('\n') === E.slice(first.n - 1).join('\n')) return 'Line ' + first.n + ' of your output is one the exercise does not expect; after it, your lines match.';
      if (E.length > G.length && E.slice(first.n).join('\n') === G.slice(first.n - 1).join('\n')) return 'Line ' + first.n + ' of the expected output is missing from yours; after it, your lines match.';
    }
    if (!diffs.length) {
      const extra = rows.filter((r) => r.kind === 'extra').length, missing = rows.filter((r) => r.kind === 'missing').length;
      if (missing) return 'Your output stops early: the first ' + plural(first.n - 1, 'line') + ' match, then ' + plural(missing, 'line') + ' are missing.';
      return 'Everything expected is there, then your program printed ' + plural(extra, 'more line') + '. A debugging print left in?';
    }
    const d = diffs[0];
    if (d.exp.toLowerCase() === d.got.toLowerCase()) return 'Line ' + d.n + ' has the right letters but different capitals.';
    if (squash(d.exp) === squash(d.got)) return 'Line ' + d.n + ' differs only in its spaces: compare the · marks, where each · is one space.';
    if (sameNumbers(d.exp, d.got)) return 'Line ' + d.n + ' has the right numbers written another way (for example 3 and 3.0): check whole-number and decimal division, and the format.';
    const numAt = (s, i) => { NUM.lastIndex = 0; let m; while ((m = NUM.exec(s))) { if (m.index <= i && i <= m.index + m[0].length) return m[0]; } return null; };
    const ne = numAt(d.exp, d.col), ng = numAt(d.got, d.col);
    if (ne !== null && ng !== null && ne !== ng && d.exp.replace(NUM, '#') === d.got.replace(NUM, '#')) return 'Line ' + d.n + ' prints ' + ng + ' where ' + ne + ' is expected.';
    if (d.col >= d.exp.length && d.got.length > d.exp.length) return 'Line ' + d.n + ' starts right but has more after it: “' + d.got.slice(d.col, d.col + 30) + '”.';
    if (d.col >= d.got.length && d.exp.length > d.got.length) return 'Line ' + d.n + ' starts right but stops early: “' + d.exp.slice(d.col, d.col + 30) + '” is missing.';
    return 'Line ' + d.n + ' first differs at character ' + (d.col + 1) + '.';
  }
  return { compare, visible, _internal: { linesOf, sameNumbers } };
});
