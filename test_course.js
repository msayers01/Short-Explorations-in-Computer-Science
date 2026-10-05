// Emulates app.js grade() for scheme / python / cpp / java in node.
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
// Java: the site's own interpreter (src/java.js) and the same harness the page uses (src/javautil.js).
const JAVA = course.lang === 'java' ? require('./src/java.js') : null, JAVAUTIL = course.lang === 'java' ? require('./src/javautil.js') : null;
if (course.lang === 'cpp' && course.runtime !== 'full') {
  JSCPP = require('./node_modules/JSCPP/lib/commonjs.js');
  if (!require('fs').readFileSync('./node_modules/JSCPP/lib/defaults.js', 'utf8').includes('integer division by zero')) console.log('WARNING: node_modules/JSCPP is unpatched; run  patch -p0 < patches/jscpp-iostream.patch  so results match the browser bundle.');
}
// Real C++ (Clang built for WebAssembly), for the courses that say runtime: 'full'. The toolchain is the same one the browser downloads.
// Each program is compiled once and run once for each test, using the same harness the page uses (src/cppfull.js).
const CPPFULL = require('./src/cppfull.js');
// The shell course: exercises are graded on the state of a practice shell after the solution's commands ran (src/shellgrade.js).
const SHELL = course.lang === 'shell' ? require('./src/shell.js') : null, SG = course.lang === 'shell' ? require('./src/shellgrade.js') : null;
// Programs typed in the shell (python, javac/java, g++ and ./prog, scheme) run here through node's copies of the site's interpreters, with what
// the page's sandboxes add: sys.exit (src/pyworker.js) and main's return value as the status of a C++ program (src/cppworker.js).
const shellHooks = SHELL ? (() => {
  require('./node_modules/skulpt/dist/skulpt.min.js'); require('./node_modules/skulpt/dist/skulpt-stdlib.js');
  const SYS_EXIT = '\nvar $sysModule=$builtinmodule;$builtinmodule=function(n){var m=$sysModule(n);m.exit=new Sk.builtin.func(function(a){throw new Sk.builtin.SystemExit(a===undefined?Sk.builtin.none.none$:a);});return m;};';
  const J = require('./src/java.js'), JS = require('./node_modules/JSCPP/lib/commonjs.js'), { ensureMainReturns: emr } = require('./src/cpputil.js');
  const byte = (n) => ((Math.trunc(n) % 256) + 256) % 256;
  async function run(lang, src, o) {
    const stdin = o.stdin == null ? '' : o.stdin;
    if (lang === 'python') {
      const inp = stdin.split('\n'); let err = null, exit = 0;
      Sk.configure({ output: (t) => o.onOutput(t), read: (f) => { if (!Sk.builtinFiles.files[f]) throw 'not found ' + f; return f === 'src/builtin/sys.js' ? Sk.builtinFiles.files[f] + SYS_EXIT : Sk.builtinFiles.files[f]; }, __future__: Sk.python3, execLimit: 15000,
        inputfun: (q) => { if (q != null) o.onOutput(String(q)); return Promise.resolve(inp.length ? inp.shift() : ''); }, inputfunTakesPrompt: true, sysargv: [o.name || 'main.py'].concat(o.args || []) });
      try { await Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('<stdin>', false, src, true)); }
      catch (e) {
        if (e instanceof Sk.builtin.SystemExit) { const v = e.args.v.length ? e.args.v[0] : Sk.builtin.none.none$; if (v === Sk.builtin.none.none$) exit = 0; else if (Sk.builtin.checkInt(v)) exit = byte(Number(Sk.ffi.remapToJs(v))); else { err = new Sk.builtin.str(v).v; exit = 1; } }
        else { err = e.toString(); exit = 1; }
      }
      return { err, exit };
    }
    if (lang === 'java') { const r = J.run(src, stdin, { write: o.onOutput, args: o.args, mainClass: o.name && !/\.java$/.test(o.name) ? o.name.split('/').pop().replace(/\.class$/, '') : undefined }); return { err: r.err, exit: r.err ? 1 : r.exit || 0 }; }
    if (lang === 'cpp') { try { const ret = JS.run(emr(src), stdin, { stdio: { write: o.onOutput }, maxTimeout: 4000, unsigned_overflow: 'warn' }); return { err: null, exit: typeof ret === 'number' ? byte(ret) : 0 }; } catch (e) { return { err: String(e && e.message || e), exit: 1 }; } }
    if (lang === 'scheme') { const r = Scheme.runProgram(src); o.onOutput(r.it.output.join('')); return { err: r.error ? ';' + r.error : null, exit: r.error ? 1 : 0 }; }
    return { err: lang + ': no way to run this here', exit: 126 };
  }
  async function compile(lang, src) { if (lang === 'java') { const r = J.run(src, '', { checkOnly: true }); return { err: r.err }; } return { err: null }; }
  return { run, compile };
})() : null;
async function shellRun(setup, commands) { const fs = SG.makeFS(setup, course, { now: () => 1759330000000 }); const sh = SHELL.makeShell(Object.assign({ fs }, shellHooks)); const errs = []; for (const line of String(commands || '').split('\n')) { if (!line.trim()) continue; let err = ''; const exit = await sh.exec(line, { out: () => { }, err: (t) => { err += t; }, tty: true }); if (exit) errs.push(line + ' → exit ' + exit + ' ' + err.trim()); } return { sh, errs }; }
let full = null;
if (course.runtime === 'full') {
  full = (async () => {
    const T = await import('@live-codes/clang-wasm/toolchain');
    const tc = await T.createToolchain({});
    return async (src, stdins) => {
      const c = await tc.lock(() => tc.captureCompilerOutput(() => tc.runtime.compileArtifact(src, { language: 'CPP', fileName: 'main.cpp', compileArgs: [...T.CLANG_DRIVER_DEFAULT_ARGS, '-std=gnu++20', '-Wall'] })));
      const diag = T.compilerDiagnostics(c.raw).filter(l => !/^Error: process exited/.test(l));
      if (c.error) return { err: diag.join('\n') || String(c.error.message), parts: [], warnings: '' };
      const parts = [];
      for (const stdin of stdins) {
        let out = '', sent = false, err = null;
        try { await tc.execute(c.result, { args: [], stdin: () => { if (sent) return null; sent = true; return stdin; }, stdout: s => { out += s; }, stderr: () => {} }); } catch (e) { err = String(e.message); }
        parts.push({ out, err });
      }
      return { err: null, parts, warnings: diag.join('\n') };
    };
  })();
}
// The site's own ensureMainReturns (src/cpputil.js), so the tests run C++ exactly as the site does.
const { ensureMainReturns } = require('./src/cpputil.js');
async function grade(ex, code) {
  const lang = ex.lang || course.lang;
  if (ex.mustContain) for (const r of ex.mustContain) if (!r.re.test(code)) return { passed: false, error: r.msg };
  if (ex.mustNotContain) for (const r of ex.mustNotContain) if (r.re.test(code)) return { passed: false, error: r.msg };
  const results = [];
  if (lang === 'shell') {
    const { sh, errs } = await shellRun(ex.setup, code);
    const r = await SG.grade(ex, sh);
    if (errs.length && code === ex.solution) console.log('   (a command in the solution of ' + ex.id + ' failed: ' + errs.join('; ') + ')');
    return r;
  }
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
  } else if (lang === 'cpp' && course.runtime === 'full') {
    const h = CPPFULL.harness(ex, code);
    if (h.error) return { passed: false, error: h.error };
    const r = await (await full)(h.src, h.stdins);
    if (r.err) return { passed: false, error: CPPFULL.shiftLines(r.err, h.shift) };
    ex.tests.forEach((t, i) => { const p = r.parts[i]; results.push({ name: t.name || t.call || 'io', expected: t.expect, got: p.err ? 'ERR ' + p.err : p.out, ok: !p.err && norm(p.out) === norm(t.expect) }); });
    if (r.warnings && !ex.__warned) { ex.__warned = true; if (code === ex.solution) console.log('   (warnings in the solution of ' + ex.id + ')\n' + r.warnings.split('\n').slice(0, 4).join('\n')); }
  } else if (lang === 'java') {
    for (const t of ex.tests) {
      let src = code, shift = 0;
      if (t.call !== undefined || t.main !== undefined) { const h = JAVAUTIL.harness(ex, code, t); if (h.error) return { passed: false, error: h.error }; src = h.src; shift = h.shift; }
      const r = JAVA.run(src, t.stdin || '', { maxMs: 5000 });
      if (r.err && JAVAUTIL.isCompileError(r.err)) return { passed: false, error: JAVAUTIL.shiftLines(r.err, shift) };
      results.push({ name: t.name || t.call || 'io', expected: t.expect, got: r.err ? 'ERR ' + JAVAUTIL.shiftLines(r.err, shift) : r.out, ok: !r.err && norm(r.out) === norm(t.expect) });
    }
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
// A trace exercise's steps must be what really happens: run its program with a capture after every watched line (inside the block, for
// a line that opens one) and compare the values, in order, with the first accepted answer of every cell.
async function verifyTrace(ex) {
  const lang = ex.lang || course.lang, lines = ex.code.split('\n'), probs = [];
  const watched = [...new Set(ex.steps.map((st) => st.line))].sort((a, b) => b - a);
  const header = (l) => (lang === 'python' ? /:\s*(#.*)?$/.test(l) : /\{\s*$/.test(l));
  // Python reads every variable and reports one that does not exist as '-'. Java cannot even compile a read of a variable that is out of
  // scope, so a '-' there is left out of the capture, and checked separately: reading it must not compile.
  const missing = (n) => new Set(lang === 'python' ? [] : ex.vars.filter((v) => { const st = ex.steps.find((x) => x.line === n); return st && String([].concat(st.values[v])[0]) === '-'; }));
  if (lang === 'java') for (const n of watched) for (const v of missing(n)) {
    const L = ex.code.split('\n'), at = L[n - 1] || '', ind = (header(at) ? (L[n] || '') : at).match(/^\s*/)[0];
    L.splice(n, 0, ind + 'System.out.println(' + v + ');');
    const r = JAVA.run(L.join('\n'), '', { maxMs: 3000 });
    if (!(r.err && /cannot find symbol/.test(r.err))) probs.push('after line ' + n + ' the table says ' + v + ' does not exist, but it does');
  }
  for (const n of watched) {
    const at = lines[n - 1]; if (at === undefined) { probs.push('step line ' + n + ' is not in the program'); continue; }
    const ind = (header(at) ? (lines[n] || '') : at).match(/^\s*/)[0], gone = missing(n);
    const cap = lang === 'python' ? ind + '__t(' + n + ', [' + ex.vars.map((v) => gone.has(v) ? "'-'" : '__v(lambda: ' + v + ')').join(', ') + '])'
      : lang === 'cpp' ? ind + (course.runtime === 'full' ? 'std::cout' : 'cout') + ' << "@@' + n + '|"' + ex.vars.map((v) => ' << ' + (gone.has(v) ? '"-"' : '(' + v + ')')).join(' << "|"') + ' << ' + (course.runtime === 'full' ? 'std::endl' : 'endl') + ';'
      : ind + 'System.out.println("@@' + n + '|"' + ex.vars.map((v) => ' + ' + (gone.has(v) ? '"-"' : '(' + v + ')')).join(' + "|"') + ');';
    lines.splice(n, 0, cap);
  }
  let src = lines.join('\n'), out = '', err = null;
  if (lang === 'python') {
    src = "def __v(f):\n    try:\n        return str(f())\n    except NameError:\n        return '-'\ndef __t(n, vals):\n    print('@@' + str(n) + '|' + '|'.join(vals))\n" + src;
    const r = await py(src, ex.stdin || ''); out = r.out; err = r.err;
  } else if (lang === 'java') { const r = JAVA.run(src, ex.stdin || '', { maxMs: 5000 }); out = r.out; err = r.err; }
  else if (lang === 'cpp' && course.runtime === 'full') {   // real Clang: the capture lines are compiled in, the program run once
    const r = await (await full)(src, [ex.stdin || '']); err = r.err || r.parts[0].err; out = r.err ? '' : r.parts[0].out;
  } else if (lang === 'cpp') {
    try { JSCPP.run(ensureMainReturns(src), ex.stdin || '', { stdio: { write: (t) => out += t }, maxTimeout: 5000, unsigned_overflow: 'warn' }); } catch (e) { err = e.message || String(e); }   // C++ reads of an out-of-scope variable are not checked here
  } else return ['trace verification is not written for ' + lang];
  if (err) return ['the traced program fails: ' + String(err).split('\n')[0]];
  const events = out.split('\n').filter((l) => l.startsWith('@@')).map((l) => { const [n, ...vals] = l.slice(2).split('|'); return { line: +n, vals }; });
  const tidy = (x) => String(x).trim().toLowerCase().replace(/\s+/g, '');
  if (events.length !== ex.steps.length) probs.push('the program passes the watched lines ' + events.length + ' times, the table has ' + ex.steps.length + ' steps: ' + events.map((e) => e.line).join(','));
  ex.steps.forEach((st, k) => { const e = events[k]; if (!e) return;
    if (e.line !== st.line) probs.push('step ' + (k + 1) + ' is after line ' + st.line + ', but the program is after line ' + e.line);
    ex.vars.forEach((v, i) => { const want = String([].concat(st.values[v])[0]); if (tidy(want) !== tidy(e.vals[i])) probs.push('step ' + (k + 1) + ' ' + v + ': the table says ' + want + ', the program has ' + e.vals[i]); }); });
  return probs;
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
      if (ex.kind === 'trace') probs.push(...await verifyTrace(ex));
      const ok = s.passed && !st.passed && !probs.length; if (!ok) bad++;
      console.log((ok ? 'OK  ' : 'BAD ') + ex.id + '  [' + ex.kind + ']  reference:' + (s.passed ? 'pass' : 'FAIL') + '  empty:' + (st.passed ? 'PASSES(!)' : 'fails') + (probs.length ? '  ' + probs.join('; ') : ''));
      continue;
    }
    if (ex.kind === 'parsons') {   // Parsons: the solution passes, an empty program does not, and the blocks are handed out shuffled
      const PS = require('./src/parsons.js'), sol = PS.solution(ex), codeEx = Object.assign({}, ex, { kind: undefined });
      const s = ex.tests ? await grade(codeEx, sol) : { passed: PS.orderOk(ex, sol) };
      const st = ex.tests ? await grade(codeEx, '') : { passed: PS.orderOk(ex, '') };
      const shuffled = PS.blocks(ex).order.some((b, i) => b !== i);
      const ok = s.passed && !st.passed && shuffled;
      if (!ok) bad++;
      console.log((ok ? 'OK  ' : 'BAD ') + ex.id + '  [parsons' + (ex.tests ? ', run' : ', order') + ']  solution:' + (s.passed ? 'pass' : 'FAIL') + '  empty:' + (st.passed ? 'PASSES(!)' : 'fails') + (shuffled ? '' : '  NOT SHUFFLED'));
      if (!s.passed && s.results) console.log('   ', s.error || s.results.filter(r => !r.ok));
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
    if (!b || !b.play) continue;
    if (b.expectError) {   // the playground deliberately fails: make sure it does
      if (course.lang === 'java') { const r = JAVA.run(b.play, b.stdin || '', { maxMs: 6000 }); if (!r.err) console.log('PLAY L' + (li+1) + ' was expected to fail but ran:', b.play.slice(0, 80)); }
      continue;
    }
    if (course.lang === 'shell') { if (b.expectError) continue;   /* some commands fail on purpose */ const { errs } = await shellRun(b.setup, b.play); if (errs.length) console.log('PLAY L' + (li+1) + ' a command failed:', errs.join('; ')); continue; }
    if (course.lang === 'scheme') { const r = Scheme.runProgram(b.play, { stepLimit: 2e7 });   /* the page's limit for examples (app.js) */ if (r.error) console.log('PLAY L' + (li+1) + ' error:', r.error, '\n   ', b.play.slice(0, 60)); }
    else if (course.lang === 'python') { if (/\bimport\s+turtle\b/.test(b.play)) continue;   /* turtle needs a canvas: the browser test runs those */ const r = await py(b.play, (b.testStdin || b.stdin || 'Ada\n1990\n5\n')); if (r.err) console.log('PLAY L' + (li+1) + ' error:', r.err, '\n   ', b.play.slice(0, 60)); }
    else if (course.runtime === 'full') { const h = { src: b.play, stdins: [b.stdin || ''] }; const r = await (await full)(h.src, h.stdins); if (r.err) console.log('PLAY L' + (li+1) + ' error:', r.err.split('\n')[0], '\n   ', b.play.slice(0, 80)); else if (r.parts[0].err) console.log('PLAY L' + (li+1) + ' crashed:', r.parts[0].err.slice(0, 80), '\n   ', b.play.slice(0, 80)); else if (!r.parts[0].out.trim()) console.log('PLAY L' + (li+1) + ' printed nothing:', b.play.slice(0, 80)); }
    else if (course.lang === 'cpp') { let out=''; try { JSCPP.run(b.play, b.stdin || '', { stdio: { write: s => out += s }, maxTimeout: 5000, unsigned_overflow: 'warn' }); } catch (e) { console.log('PLAY L' + (li+1) + ' error:', e.message, '\n   ', b.play.slice(0, 80)); } }
    else if (course.lang === 'java') { const r = JAVA.run(b.play, b.stdin || '', { maxMs: 5000 }); if (r.err) console.log('PLAY L' + (li+1) + ' error:', r.err.split('\n')[0], '\n   ', b.play.slice(0, 80)); else if (!r.out.trim()) console.log('PLAY L' + (li+1) + ' printed nothing:', b.play.slice(0, 80)); }
  }
  console.log(bad ? bad + ' problems' : 'all exercises OK');
})();
