// Differential tests: the site's own implementations against the real thing.
//   Java: src/java.js against javac/java (JDK 21) on every lesson example and exercise of SC 106 and SC 107, a corpus of probe programs
//         (difftest/java/) and programs generated from a seed (difftest/javagen.js). Output, the error text and the exit code must agree.
//   Shell: src/shell.js against bash and GNU coreutils on the command lines in difftest/shell.txt, run on the same files.
// Differences we accept on purpose are listed, with the reason, in difftest/known.json; anything else fails the run.
//
//   node test_diff.js                 both parts (a part whose real tool is missing is skipped; REQUIRE_DIFF=1 makes that a failure)
//   node test_diff.js java|shell      one part
//   SEED=n COUNT=n                    generated programs: COUNT of each kind from SEED (default 1 and 25); SEED=random picks one
//   -v                                print every case, not only the differences
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const KNOWN = JSON.parse(fs.readFileSync(path.join(__dirname, 'difftest/known.json'), 'utf8'));
const argv = process.argv.slice(2), VERBOSE = argv.includes('-v'), PART = argv.find((a) => a === 'java' || a === 'shell');
const REQUIRE = process.env.REQUIRE_DIFF === '1';
const SEED = process.env.SEED === 'random' ? 1 + Math.floor(Math.random() * 1e6) : +(process.env.SEED || 1), COUNT = +(process.env.COUNT || 25);
let problems = 0;
const seenKnown = new Set();
const has = (cmd, args) => { try { return cp.spawnSync(cmd, args, { encoding: 'utf8', env: cleanEnv() }).status === 0; } catch (e) { return false; } };
function cleanEnv() { const env = Object.assign({}, process.env, { LC_ALL: 'C' }); delete env.JAVA_TOOL_OPTIONS; return env; }   // JAVA_TOOL_OPTIONS makes the JVM print a notice
const firstDiff = (a, b) => { const x = a.split('\n'), y = b.split('\n'); for (let i = 0; i < Math.max(x.length, y.length); i++) if (x[i] !== y[i]) return { line: i + 1, real: x[i], ours: y[i] }; return null; };

function report(part, id, real, ours, extra) {
  if (real === ours) { if (VERBOSE) console.log('same ' + id); if (KNOWN[part] && KNOWN[part][id]) console.log('NOTE ' + id + ' now agrees: remove it from difftest/known.json'); return; }
  if (KNOWN[part] && KNOWN[part][id]) { seenKnown.add(part + ':' + id); if (VERBOSE) console.log('known ' + id + ': ' + KNOWN[part][id]); return; }
  problems++;
  const d = firstDiff(real, ours);
  console.log('DIFF ' + id + (extra ? '  ' + extra : ''));
  console.log('  first difference at line ' + d.line + ':\n    real: ' + JSON.stringify(d.real) + '\n    ours: ' + JSON.stringify(d.ours));
}

// ---------------------------------------------------------------- Java
async function javaPart() {
  if (!has('javac', ['-version']) || !has('java', ['-version'])) { console.log('java: skipped (no javac/java on the PATH)'); if (REQUIRE) problems++; return; }
  const ver = cp.spawnSync('java', ['-version'], { encoding: 'utf8', env: cleanEnv() }).stderr.split('\n')[0];
  global.window = global;
  const J = require('./src/java.js'), JU = require('./src/javautil.js');
  const cases = [];
  // lesson examples and exercises of the courses that run Java
  for (const file of ['course_java', 'course_dsa']) {
    window.COURSES = []; delete require.cache[require.resolve('./src/' + file + '.js')]; require('./src/' + file + '.js');
    const course = window.COURSES[0];
    course.lessons.forEach((L, li) => {
      let p = 0;
      for (const b of L.blocks) {
        if (b && b.play) cases.push({ id: course.id + '/' + (li + 1) + '/play' + (++p), code: b.play, stdin: b.stdin || '', expectError: !!b.expectError });
        const ex = b && b.ex;
        if (ex && ex.solution && !ex.kind) (ex.tests || []).forEach((t, ti) => {
          let code = ex.solution;
          if (t.call !== undefined || t.main !== undefined) { const h = JU.harness(ex, ex.solution, t); if (h.error) return; code = h.src; }
          cases.push({ id: ex.id + '/test' + (ti + 1), code, stdin: t.stdin || '', expect: t.expect });
        });
      }
    });
  }
  for (const f of fs.readdirSync(path.join(__dirname, 'difftest/java')).filter((f) => f.endsWith('.java')).sort()) {
    const inp = path.join(__dirname, 'difftest/java', f.replace(/\.java$/, '.in'));
    cases.push({ id: 'corpus/' + f, code: fs.readFileSync(path.join(__dirname, 'difftest/java', f), 'utf8'), stdin: fs.existsSync(inp) ? fs.readFileSync(inp, 'utf8') : '' });
  }
  for (const g of require('./difftest/javagen.js').generate(SEED, COUNT)) cases.push(g);
  console.log('java: ' + cases.length + ' programs (' + ver + '; generated from seed ' + SEED + ', ' + COUNT + ' of each kind)');

  // every program in its own package, all compiled by one javac; a program javac rejects is compiled again alone for its message
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'difftest-'));
  try {
    cases.forEach((c, n) => { c.pkg = 'p' + n; const d = path.join(dir, 'src', c.pkg); fs.mkdirSync(d, { recursive: true }); fs.writeFileSync(path.join(d, 'Main.java'), 'package ' + c.pkg + '; ' + c.code); });   // one file may hold several top-level classes
    const out = path.join(dir, 'out'); fs.mkdirSync(out);
    let todo = cases.slice();
    for (let round = 0; round < 3 && todo.length; round++) {
      const r = cp.spawnSync('javac', ['-encoding', 'UTF-8', '-nowarn', '-g', '-d', out, ...todo.map((c) => path.join(dir, 'src', c.pkg, 'Main.java'))], { encoding: 'utf8', env: cleanEnv(), maxBuffer: 1 << 26 });
      if (r.status === 0) { todo = []; break; }
      const bad = new Set((r.stderr + r.stdout).split('\n').map((l) => (l.match(/src[\\/](p\d+)[\\/]Main\.java:\d+: error:/) || [])[1]).filter(Boolean));
      if (!bad.size) throw new Error('javac failed without naming a file:\n' + r.stderr);
      for (const c of todo) if (bad.has(c.pkg)) c.compileFailed = true;
      todo = todo.filter((c) => !c.compileFailed);
    }
    for (const c of cases.filter((c) => c.compileFailed)) {
      const r = cp.spawnSync('javac', ['-encoding', 'UTF-8', '-nowarn', '-d', path.join(dir, 'err'), path.join(dir, 'src', c.pkg, 'Main.java')], { encoding: 'utf8', env: cleanEnv() });
      c.javacError = (r.stderr + r.stdout).split('\n')[0].replace(/^.*[\\/]Main\.java/, 'Main.java');
    }

    // run them on the JVM, a few at a time
    const runOne = (c) => new Promise((resolve) => {
      if (c.compileFailed) return resolve();
      // the class that holds main (the class exercises' checker calls it Check)
      const parts = c.code.split(/\bclass\s+(\w+)/), mainCls = (parts.findIndex((p, i) => i % 2 === 0 && i > 0 && /static\s+void\s+main\s*\(/.test(p.split(/\bclass\s/)[0])) - 1);
      const cls = parts[mainCls] || 'Main';
      const child = cp.spawn('java', ['-Xshare:auto', '-XX:TieredStopAtLevel=1', '-Dstdout.encoding=UTF-8', '-Dstderr.encoding=UTF-8', '-cp', out, c.pkg + '.' + cls], { env: cleanEnv() });
      let so = '', se = ''; const timer = setTimeout(() => { c.timedOut = true; child.kill('SIGKILL'); }, 15000);
      child.stdout.on('data', (d) => { so += d; }); child.stderr.on('data', (d) => { se += d; });
      child.on('close', (code) => { clearTimeout(timer); const unpkg = (t) => t.replace(new RegExp('\\b' + c.pkg + '\\.', 'g'), ''); c.real = { out: unpkg(so), err: unpkg(se).replace(/\n$/, ''), exit: code }; resolve(); });
      child.stdin.end(c.stdin);
    });
    const queue = cases.slice(), workers = Array.from({ length: Math.max(2, os.cpus().length) }, async () => { while (queue.length) await runOne(queue.shift()); });
    await Promise.all(workers);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }

  let n = 0;
  for (const c of cases) {
    const ours = J.run(c.code, c.stdin, { maxMs: 10000 });
    if (c.compileFailed) {   // compare the first line of the compiler's message
      const mine = (ours.err || '').split('\n')[0];
      if (c.id.startsWith('gen/')) { problems++; console.log('GENERATOR BUG ' + c.id + ': javac says ' + c.javacError); continue; }
      report('java', c.id, 'compile error: ' + c.javacError, ours.compile ? 'compile error: ' + mine : 'compiled; printed ' + JSON.stringify(ours.out.slice(0, 80)));
      n++; continue;
    }
    if (c.timedOut) { if (ours.err) { n++; continue; } /* a program that never ends: ours must stop it with a limit */ report('java', c.id, 'timed out on the JVM', 'finished: ' + JSON.stringify((ours.out || '').slice(-80))); n++; continue; }
    if (ours.err && /took too long|stopped after/i.test(ours.err)) { report('java', c.id, 'finished on the JVM', 'ours timed out: ' + ours.err.split('\n')[0]); n++; continue; }
    // Object's own toString prints the class and an identity hash code, which differs from run to run on the JVM too (an array prints as
    // [I@1b6d3586): compare the class, not the number
    const idHash = (t) => t.replace(/(\[*[A-Za-z_$][\w.$]*)@[0-9a-f]{1,8}\b/g, '$1@<hash>');
    const fmt = (r) => idHash(r.out + (r.err ? '\n[stderr]\n' + r.err : '') + '\n[exit ' + (r.exit || 0) + ']');
    report('java', c.id, fmt(c.real), fmt({ out: ours.out || '', err: (ours.err || '').replace(/\n$/, ''), exit: ours.exit || (ours.err ? 1 : 0) }));
    // the course's expected answer is what the real JVM prints, not only what our interpreter prints
    if (c.expect !== undefined) { const norm = (s) => String(s).replace(/\r/g, '').split('\n').map((l) => l.replace(/\s+$/, '')).join('\n').trim(); if (norm(c.real.out) !== norm(c.expect)) report('java', c.id + ' (expected answer)', norm(c.real.out), norm(c.expect)); }
    n++;
  }
  console.log('java: ' + n + ' compared');
}

// ---------------------------------------------------------------- shell
async function shellPart() {
  if (!has('bash', ['-c', 'true']) || !has('sort', ['--version'])) { console.log('shell: skipped (needs bash and GNU coreutils)'); if (REQUIRE) problems++; return; }
  const SHELL = require('./src/shell.js');
  const spec = fs.readFileSync(path.join(__dirname, 'difftest/shell.txt'), 'utf8');
  // the file starts with the files every case gets, as  @file path\ncontents\n@end ; then command lines separated by lines of ===
  const FILES = {}; let body = spec;
  body = body.replace(/^@file (\S+)\n([\s\S]*?)@end\n/gm, (m, p, text) => { FILES[p] = text.replace(/\\noeol\n$/, ''); return ''; });
  const cmds = body.replace(/^# .*\n/gm, '').split(/\n===\n/).map((s) => s.replace(/^\n+|\n+$/g, '')).filter(Boolean);
  console.log('shell: ' + cmds.length + ' command lines (' + cp.spawnSync('bash', ['--version'], { encoding: 'utf8' }).stdout.split('\n')[0] + ')');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'difftest-sh-'));
  try {
    for (const line of cmds) {
      const vfs = SHELL.makeFS(null, {});
      for (const [p, t] of Object.entries(FILES)) { const abs = '/home/student/' + p; vfs.mkdir(abs.slice(0, abs.lastIndexOf('/')), true); vfs.write(abs, t); }
      const sh = SHELL.makeShell({ fs: vfs });
      let mine = '';
      const exit = await sh.exec(line, { out: (s) => { mine += s; }, err: (s) => { mine += s; }, tty: false });
      mine += '[exit ' + exit + ']\n';
      // the real side runs in <tmp>/home/student, and <tmp> is cut from what it prints; the case is a script file of its own (outside the
      // home directory), so a line that ends in | or && is the syntax error it would be when typed
      const home = path.join(tmp, 'home', 'student'); fs.rmSync(path.join(tmp, 'home'), { recursive: true, force: true }); fs.mkdirSync(home, { recursive: true });
      for (const [p, t] of Object.entries(FILES)) { const abs = path.join(home, p); fs.mkdirSync(path.dirname(abs), { recursive: true }); fs.writeFileSync(abs, t); }
      const script = path.join(tmp, 'case.sh'); fs.writeFileSync(script, line + '\n');
      const r = cp.spawnSync('bash', ['-c', 'bash "$0" 2>&1; echo "[exit $?]"', script], { cwd: home, env: { HOME: home, PATH: process.env.PATH, LC_ALL: 'C', USER: 'student' }, encoding: 'utf8', input: '', timeout: 10000 });
      const real = (r.stdout || '').split(script + ': line ').join('bash: line ').split(tmp).join('').replace(/bash: line \d+: /g, 'bash: ');
      report('shell', line, real, mine);
    }
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
}

(async () => {
  const t0 = Date.now();
  if (!PART || PART === 'java') await javaPart();
  if (!PART || PART === 'shell') await shellPart();
  for (const part of Object.keys(KNOWN)) if (!PART || PART === part) for (const id of Object.keys(KNOWN[part])) if (!seenKnown.has(part + ':' + id) && VERBOSE) console.log('(known difference not seen this run: ' + id + ')');
  console.log((problems ? problems + ' differences' : 'differential tests OK') + ' (' + Math.round((Date.now() - t0) / 1000) + ' s)');
  process.exit(problems ? 1 : 0);
})();
