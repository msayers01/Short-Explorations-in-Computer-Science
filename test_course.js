// Emulates app.js grade() for scheme / python / cpp in node.
global.window = global;
const Scheme = require('./src/scheme.js');
const MG = require('./src/mathgrade.js');
const norm = s => (s == null ? '' : String(s)).replace(/\r/g,'').split('\n').map(l=>l.replace(/\s+$/,'')).join('\n').trim();
const which = process.argv[2];
require('./src/course_' + which + '.js');
const course = window.COURSES[0];

let py = null, JSCPP = null;
if (course.lang === 'python') {
  require('./node_modules/skulpt/dist/skulpt.min.js'); require('./node_modules/skulpt/dist/skulpt-stdlib.js');
  py = async (code, stdin) => {
    let out = ''; let inp = (stdin||'').split('\n'); let err = null;
    Sk.configure({ output: t => out += t, read: f => { if (!Sk.builtinFiles.files[f]) throw 'not found ' + f; return Sk.builtinFiles.files[f]; }, __future__: Sk.python3, execLimit: 5000, inputfun: () => Promise.resolve(inp.shift() || ''), inputfunTakesPrompt: true });
    try { await Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('<stdin>', false, code, true)); } catch (e) { err = e.toString(); }
    return { out, err };
  };
}
if (course.lang === 'cpp') {
  JSCPP = require('./node_modules/JSCPP/lib/commonjs.js');
  if (!require('fs').readFileSync('./node_modules/JSCPP/lib/defaults.js', 'utf8').includes('integer division by zero')) console.log('WARNING: node_modules/JSCPP is unpatched; run  patch -p0 < patches/jscpp-iostream.patch  so results match the browser bundle.');
}
// The site's own ensureMainReturns (app.js), read from the source so the tests run C++ exactly as the site does.
const ensureMainReturns = (() => {
  const src = require('fs').readFileSync(__dirname + '/src/app.js', 'utf8');
  const i = src.indexOf('  function ensureMainReturns('), j = src.indexOf('\n  }\n', i);
  if (i < 0 || j < 0) throw new Error('ensureMainReturns not found in src/app.js');
  return new Function(src.slice(i, j + 4) + '\nreturn ensureMainReturns;')();
})();
async function grade(ex, code) {
  const lang = ex.lang || course.lang;
  if (ex.mustContain) for (const r of ex.mustContain) if (!r.re.test(code)) return { passed: false, error: r.msg };
  if (ex.mustNotContain) for (const r of ex.mustNotContain) if (r.re.test(code)) return { passed: false, error: r.msg };
  const results = [];
  if (lang === 'scheme') {
    const r = Scheme.runProgram(code);
    if (r.error) return { passed: false, error: r.error };
    for (const t of ex.tests) {
      try { const b = r.it.output.length; const v = r.it.evaluate(Scheme.parseAll(t.call)[0], r.it.G); const got = t.output ? r.it.output.slice(b).join('') : Scheme.write(v); results.push({ name: t.call, expected: t.expect, got, ok: norm(got) === norm(t.expect) }); }
      catch (e) { results.push({ name: t.call, expected: t.expect, got: 'ERR ' + e.message, ok: false }); }
    }
  } else if (lang === 'python') {
    const exprTests = ex.tests.filter(t => t.call !== undefined), ioTests = ex.tests.filter(t => t.call === undefined);
    if (exprTests.length) {
      const M = '\x00GRADE\x00';
      const harness = '\n\nprint("' + M + '")\ndef __g(f):\n    try:\n        print("R:" + repr(f()))\n    except Exception as __e:\n        print("E:" + type(__e).__name__ + ": " + str(__e))\n' + exprTests.map(t => '__g(lambda: ' + t.call + ')\n').join('');
      const r = await py(code + harness, '');
      if (r.err && !r.out.includes(M)) return { passed: false, error: r.err };
      const lines = r.out.split(M + '\n')[1] ? r.out.split(M + '\n')[1].split('\n') : [];
      exprTests.forEach((t, i) => { const line = lines[i] || 'E: none'; const got = line.startsWith('R:') ? line.slice(2) : line; results.push({ name: t.call, expected: t.expect, got, ok: line.startsWith('R:') && got === t.expect }); });
    }
    for (const t of ioTests) { const r = await py(code, t.stdin || ''); results.push({ name: t.name || 'io', expected: t.expect, got: r.err ? 'ERR ' + r.err : r.out, ok: !r.err && norm(r.out) === norm(t.expect) }); }
  } else if (lang === 'cpp') {
    for (const t of ex.tests) {
      let src = code;
      if (t.call !== undefined || t.main !== undefined) { if (/\bint\s+main\s*\(/.test(code)) return { passed: false, error: 'no main allowed' }; const body = t.main !== undefined ? t.main : (t.setup || '') + '\n    cout << (' + t.call + ') << endl;'; src = (ex.prelude || '#include <iostream>\nusing namespace std;\n') + '\n' + code + '\n\nint main() {\n' + body + '\n    return 0;\n}\n'; }
      let out = '', err = null;
      try { JSCPP.run(ensureMainReturns(src), t.stdin || '', { stdio: { write: s => out += s }, maxTimeout: 5000, unsigned_overflow: 'warn' }); } catch (e) { err = e.message || String(e); }
      results.push({ name: t.call !== undefined ? t.call : (t.name || 'io'), expected: t.expect, got: err ? 'ERR ' + err : out, ok: !err && norm(out) === norm(t.expect) });
    }
  }
  return { passed: results.length > 0 && results.every(x => x.ok), results };
}
(async () => {
  let bad = 0;
  for (const lesson of course.lessons) for (const b of lesson.blocks) {
    if (!b || !b.ex) continue;
    const ex = b.ex; ex.lang = ex.lang || course.lang;
    if (MG.isMath(ex)) {   // answer / choice / table: reference answers must pass, empty answers must fail, and the specific-feedback keys must not equal a right answer
      const s = MG.grade(ex, MG.reference(ex)), st = MG.grade(ex, MG.empty(ex));
      const probs = [];
      if (ex.kind === 'answer') ex.parts.forEach((p, i) => (p.wrong || []).forEach(w => [].concat(w.match).forEach(m => { if (MG.grade({ kind: 'answer', parts: [p] }, [m]).passed) probs.push('part ' + (i + 1) + ' wrong-answer key "' + m + '" is actually accepted'); })));
      if (ex.kind === 'choice' && !ex.options.some(o => o.ok)) probs.push('no correct option');
      if (ex.kind === 'choice' && !ex.multi && ex.options.filter(o => o.ok).length > 1) probs.push('several correct options but multi is not set');
      if (!ex.solution) probs.push('no solution text');
      const ok = s.passed && !st.passed && !probs.length; if (!ok) bad++;
      console.log((ok ? 'OK  ' : 'BAD ') + ex.id + '  [' + ex.kind + ']  reference:' + (s.passed ? 'pass' : 'FAIL') + '  empty:' + (st.passed ? 'PASSES(!)' : 'fails') + (probs.length ? '  ' + probs.join('; ') : ''));
      continue;
    }
    const s = await grade(ex, ex.solution);
    const st = await grade(ex, ex.starter);
    const ok = s.passed && !st.passed;
    if (!ok) bad++;
    console.log((ok ? 'OK  ' : 'BAD ') + ex.id + '  solution:' + (s.passed ? 'pass' : 'FAIL') + '  starter:' + (st.passed ? 'PASSES(!)' : 'fails'));
    if (!s.passed) console.log('   ', s.error || s.results.filter(r => !r.ok));
  }
  // also run playgrounds to make sure they execute without error
  for (const [li, lesson] of course.lessons.entries()) for (const b of lesson.blocks) {
    if (!b || !b.play || b.expectError) continue;   // expectError: the playground deliberately raises
    if (course.lang === 'scheme') { const r = Scheme.runProgram(b.play); if (r.error) console.log('PLAY L' + (li+1) + ' error:', r.error, '\n   ', b.play.slice(0, 60)); }
    else if (course.lang === 'python') { const r = await py(b.play, (b.testStdin || b.stdin || 'Ada\n1990\n5\n')); if (r.err) console.log('PLAY L' + (li+1) + ' error:', r.err, '\n   ', b.play.slice(0, 60)); }
    else if (course.lang === 'cpp') { let out=''; try { JSCPP.run(b.play, b.stdin || '', { stdio: { write: s => out += s }, maxTimeout: 5000, unsigned_overflow: 'warn' }); } catch (e) { console.log('PLAY L' + (li+1) + ' error:', e.message, '\n   ', b.play.slice(0, 80)); } }
  }
  console.log(bad ? bad + ' problems' : 'all exercises OK');
})();
