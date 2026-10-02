// Grader for the non-code exercise kinds used by the mathematics course.
// Shared by app.js (browser) and test_course.js (node); no DOM here.
//
//   kind: 'answer'  parts: [{ label, answer: 'x' | ['x','y'], re?: RegExp, wrong?: [{ match: 'z' | ['z'], msg }], exact?: true }]
//                   (exact: compare as text, so a string of digits such as '01' is not read as the number 1;
//                   table cells accept exact: true too)
//                   answers = one string per part
//   kind: 'choice'  options: [{ text, ok?: true, why? }], multi?: true
//                   answers = array of selected option indexes
//   kind: 'table'   head: [...], rows: [[ 'given', { a: 'F' | ['F','0'], why?: {match: msg} }, ... ]]
//                   answers = one string per blank cell, in reading order
//   kind: 'trace'   code: 'program text', lang?, vars: ['i', 'total'],
//                   steps: [{ line: 3, values: { i: '0', total: ['0'] }, show?: true | ['i'], why?: { total: { '1': msg } } }]
//                   A trace table: one row per time execution passes a watched line, the values of vars just after it ('-' for
//                   a variable that does not exist yet). Graded as the table traceTable(ex) builds; test_course.js runs the program
//                   with a capture after each watched line and checks that the steps are what really happens.
(function () {
  const norm = s => String(s == null ? '' : s).trim().toLowerCase()
    .replace(/[\u2212\u2013\u2014]/g, '-').replace(/\u00d7/g, '*').replace(/\u00b7/g, '*')
    .replace(/\u00b2/g, '^2').replace(/\u00b3/g, '^3')
    .replace(/\s+/g, '').replace(/\.$/, '');
  const asNum = s => { let t = norm(s); if (/^[-+]?\d{1,3}(,\d{3})+(\.\d*)?$/.test(t)) t = t.replace(/,/g, ''); return /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/.test(t) ? Number(t) : null; };
  const same = (got, want) => {
    const g = norm(got), w = norm(want);
    if (g === '' && w !== '') return false;
    if (g === w) return true;
    const gn = asNum(got), wn = asNum(want);
    if (gn !== null && wn !== null) {
      if (Number.isInteger(gn) && Number.isInteger(wn) && Math.abs(wn) > 2 ** 31) return gn === wn;   // a relative tolerance would accept off-by-one big integers
      return Math.abs(gn - wn) <= Math.max(1e-12, 1e-9 * Math.abs(wn));
    }
    // true/false answers: yes/no/t/f are accepted, but only when the expected answer is itself such a word
    const tf = { t: 'true', f: 'false', yes: 'true', no: 'false', true: 'true', false: 'false' };
    if (tf[w] && (tf[g] || g === '1' || g === '0') && (tf[g] || (g === '1' ? 'true' : 'false')) === tf[w]) return true;
    return false;
  };
  const list = x => (Array.isArray(x) ? x : [x]);
  const matches = (got, want, re) => list(want).some(w => same(got, w)) || (re instanceof RegExp && re.test(String(got == null ? '' : got).trim()));

  // a trace as a table: Step, After line, then one column per variable; shown cells are given, the rest are blanks
  function traceTable(ex) {
    return { kind: 'table', head: ['Step', 'After line'].concat(ex.vars),
      rows: ex.steps.map((s, k) => [String(k + 1), String(s.line)].concat(ex.vars.map((v) => {
        const want = list(s.values[v]).map(String);
        const shown = s.show === true || (Array.isArray(s.show) && s.show.includes(v));
        return shown ? want[0] : { a: want, name: 'step ' + (k + 1) + ', ' + v, why: s.why && s.why[v], line: s.line };
      }))) };
  }
  function blanks(ex) {   // table: flat list of blank cells in reading order
    if (ex.kind === 'trace') ex = traceTable(ex);
    const out = []; for (const row of ex.rows) for (const c of row) if (c && typeof c === 'object') out.push(c); return out;
  }

  function grade(ex, answers) {
    if (ex.kind === 'trace') return grade(traceTable(ex), answers);
    answers = answers || [];
    const results = [];
    if (ex.kind === 'answer') {
      ex.parts.forEach((p, i) => {
        const got = answers[i] == null ? '' : String(answers[i]);
        // exact: compare as text only (so '01' is not the number 1), for answers that are strings of digits
        const eq = p.exact ? (a, b) => norm(a) !== '' && norm(a) === norm(b) : same;
        const ok = p.exact ? list(p.answer).some(w => eq(got, w)) || (p.re instanceof RegExp && p.re.test(got.trim())) : matches(got, p.answer, p.re);
        let msg = '';
        if (!ok) {
          if (norm(got) === '') msg = 'No answer given.';
          else if (p.wrong) { const w = p.wrong.find(w => list(w.match).some(m => eq(got, m))); if (w) msg = w.msg; }
        }
        results.push({ name: p.name || (ex.parts.length > 1 ? 'Part ' + String.fromCharCode(97 + i) : 'Answer'), ok, got, msg });
      });
    } else if (ex.kind === 'choice') {
      const chosen = new Set((answers || []).map(Number).filter(i => Number.isInteger(i) && i >= 0 && i < ex.options.length));
      const correct = new Set(ex.options.map((o, i) => o.ok ? i : -1).filter(i => i >= 0));
      const ok = chosen.size === correct.size && [...chosen].every(i => correct.has(i));
      let msg = '';
      if (!ok) {
        if (!chosen.size) msg = 'Choose an option first.';
        else { const wrongPick = [...chosen].find(i => !correct.has(i)); msg = wrongPick != null && ex.options[wrongPick] && ex.options[wrongPick].why ? ex.options[wrongPick].why : (ex.multi ? 'Not quite. More than one option may be right — or fewer.' : 'Not that one.'); }
      }
      results.push({ name: 'Choice', ok, got: [...chosen].map(i => String.fromCharCode(65 + i)).join(', '), msg });
    } else if (ex.kind === 'table') {
      blanks(ex).forEach((c, i) => {
        const got = answers[i] == null ? '' : String(answers[i]);
        const eq = c.exact ? (a, b) => norm(a) !== '' && norm(a) === norm(b) : same;
        const ok = c.exact ? list(c.a).some(w => eq(got, w)) || (c.re instanceof RegExp && c.re.test(got.trim())) : matches(got, c.a, c.re);
        let msg = '';
        if (!ok && c.why) { for (const k in c.why) if (eq(got, k)) msg = c.why[k]; }
        results.push({ name: c.name || 'Cell ' + (i + 1), ok, got, msg });
      });
    } else {
      return { passed: false, results: [], error: 'Unknown exercise kind ' + ex.kind };
    }
    return { passed: results.length > 0 && results.every(r => r.ok), results };
  }

  // The reference answers, in the shape grade() expects (used by the tests).
  function reference(ex) {
    if (ex.kind === 'answer') return ex.parts.map(p => list(p.answer)[0]);
    if (ex.kind === 'choice') return ex.options.map((o, i) => o.ok ? i : -1).filter(i => i >= 0);
    if (ex.kind === 'table' || ex.kind === 'trace') return blanks(ex).map(c => list(c.a)[0]);
    return [];
  }
  function empty(ex) {
    if (ex.kind === 'choice') return [];
    if (ex.kind === 'answer') return ex.parts.map(() => '');
    if (ex.kind === 'table' || ex.kind === 'trace') return blanks(ex).map(() => '');
    return [];
  }
  const api = { grade, reference, empty, blanks, traceTable, isMath: ex => ['answer', 'choice', 'table', 'trace'].includes(ex.kind) };
  if (typeof window !== 'undefined') window.MATHGRADE = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
