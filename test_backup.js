// Node tests for saving and restoring work (src/backup.js): round trips, the two restore modes, and hostile files.
global.window = global;
require('./src/teach.js');
const BACKUP = require('./src/backup.js');
let bad = 0;
const check = (name, ok, detail) => { if (!ok) { bad++; console.log('BAD  ' + name + (detail !== undefined ? '\n  ' + JSON.stringify(detail) : '')); } };
const store = (init) => { const m = new Map(Object.entries(init || {})); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, dump: (k) => JSON.parse(m.get(k) || 'null') }; };
const J = JSON.stringify;

const progress = { done: { 'py-1-1': 1000, 'py-2-1': 2000 }, code: { 'py-1-1': 'print(1)', 'py-3-1': 'draft' }, pass: { 'py-1-1': 'print(1)' } };
const lab = { lang: 'scheme', files: { python: [{ name: 'main.py', code: 'print("hi")' }, { name: 'ex.py', code: 'x = 1', ex: { id: 'py-1-1', course: 'python', lesson: 1 } }], cpp: [], java: [], scheme: [{ name: 'main.scm', code: '(+ 1 2)' }] }, active: { python: 1, cpp: 0, java: 0, scheme: 0 }, fontSize: 18, wrap: true, panels: { ref: true } };
const portfolio = { name: 'Ada', note: 'my work', unfinished: true, tasks: false, lab: ['python/main.py'] };
const asg = { id: 'abcd2345', v: 1, title: 'Sum', lang: 'python', text: 't', starter: 's', tests: [{ k: 'stdin', in: '1 2', expect: '3', hidden: true }, { k: 'stdin', in: '2 2', expect: '4', hidden: false }], hints: ['h'], roster: ['Ann'], author: 'T', due: 'Fri', created: 5 };
const teach = { teacher: true, name: 'Ms T', studentName: 'Ada', assignments: { abcd2345: asg }, book: { abcd2345: { Ann: { name: 'Ann', at: 10, code: 'print(3)', reviewed: 20, title: 'Sum', claimed: { passed: 1, total: 2 }, result: { passed: 2, total: 2, hiddenPassed: 1, hiddenTotal: 1, results: [{ name: 't', ok: true, expected: '3', got: '3' }], error: null } } } }, received: { zzzz9999: Object.assign({}, asg, { id: 'zzzz9999' }) } };
const SHELL = require('./src/shell.js');
const shellFS = () => { const fs = SHELL.makeFS(null); fs.mkdir('/home/student/notes'); fs.write('/home/student/notes/a.txt', 'alpha'); fs.write('/home/student/run.sh', 'echo hi'); fs.chmod('/home/student/run.sh', true); fs.cwd = '/home/student/notes'; return fs; };
const shell = { v: 1, fs: shellFS().toJSON(), history: ['ls', 'cat notes/a.txt'] };
const full = () => store({ 'shortcourses.progress.v1': J(progress), 'shortcourses.lab.v1': J(lab), 'shortcourses.portfolio.v1': J(portfolio), 'shortcourses.teach.v1': J(teach), 'shortcourses.shell.v1': J(shell) });

// ---- a student's file leaves the teacher tools out unless asked
const s1 = full();
const file = BACKUP.collect(s1, {});
check('file has the format marker and version', file.app === 'short-explorations-backup' && file.v === 1 && /^\d{4}-\d\d-\d\dT/.test(file.saved));
check('teacher data is left out by default', !file.data.teach.assignments && !file.data.teach.book && !('teacher' in file.data.teach), Object.keys(file.data.teach));
check('student data is in', file.data.teach.studentName === 'Ada' && Object.keys(file.data.teach.received).join() === 'zzzz9999');
const withT = BACKUP.collect(s1, { teacher: true });
check('teacher data is in when asked', Object.keys(withT.data.teach.assignments).join() === 'abcd2345' && withT.data.teach.assignments.abcd2345.tests[0].hidden === true && withT.data.teach.book.abcd2345.Ann.result.hiddenPassed === 1);
check('hidden tests are never in a received assignment', withT.data.teach.received.zzzz9999.tests.every((t) => t.hidden === false));

// ---- round trip: replace into an empty device gives back the same work
const parsed = BACKUP.parse(J(withT));
check('summary counts', parsed.summary.exercises === 2 && parsed.summary.programs === 3 && parsed.summary.received === 1 && parsed.summary.assignments === 1 && parsed.summary.submissions === 1 && parsed.summary.hasTeacher, parsed.summary);
const s2 = store();
BACKUP.apply(s2, parsed.data, 'replace');
check('progress round trip', J(s2.dump('shortcourses.progress.v1')) === J(progress), s2.dump('shortcourses.progress.v1'));
check('lab round trip', J(s2.dump('shortcourses.lab.v1')) === J(lab), s2.dump('shortcourses.lab.v1'));
check('portfolio round trip', J(s2.dump('shortcourses.portfolio.v1')) === J(portfolio));
{ const t = SHELL.makeFS(s2.dump('shortcourses.shell.v1').fs); check('terminal files round trip', t.read('/home/student/notes/a.txt') === 'alpha' && t.stat('/home/student/run.sh').x === true && t.cwd === '/home/student/notes' && parsed.summary.terminal === 2, [t.walk('/home').map((e) => e[0]), parsed.summary.terminal]); check('terminal history is not in the file', !('history' in parsed.data.shell)); }
check('teacher data round trip', s2.dump('shortcourses.teach.v1').assignments.abcd2345.tests[0].hidden === true && s2.dump('shortcourses.teach.v1').teacher === true && s2.dump('shortcourses.teach.v1').book.abcd2345.Ann.code === 'print(3)');
const s3 = store(); BACKUP.apply(s3, BACKUP.parse(J(file)).data, 'replace');
check('a student file restores no teacher data', !s3.dump('shortcourses.teach.v1').assignments && s3.dump('shortcourses.teach.v1').studentName === 'Ada');

// ---- merge keeps what is here and adds what is missing
const here = store({
  'shortcourses.progress.v1': J({ done: { 'py-1-1': 5000, 'py-9-1': 1 }, code: { 'py-1-1': 'LOCAL' }, pass: {} }),
  'shortcourses.lab.v1': J({ lang: 'python', files: { python: [{ name: 'main.py', code: 'print("different")' }, { name: 'mine.py', code: 'x' }, { name: 'ex.py', code: 'LOCAL EXERCISE', ex: { id: 'py-1-1', course: 'python', lesson: 1 } }], cpp: [], scheme: [] }, active: { python: 0 }, fontSize: 12, panels: {} }),
  'shortcourses.portfolio.v1': J({ name: '', note: 'local note', unfinished: false, tasks: true, lab: [] }),
  'shortcourses.teach.v1': J({ teacher: false, studentName: '', assignments: { other123: Object.assign({}, asg, { id: 'other123', title: 'Mine' }) }, book: {}, received: {} })
});
BACKUP.apply(here, parsed.data, 'merge');
const mp = here.dump('shortcourses.progress.v1');
check('merge: done is the union, newest time wins', mp.done['py-1-1'] === 5000 && mp.done['py-2-1'] === 2000 && mp.done['py-9-1'] === 1, mp.done);
check('merge: local code wins, missing code is added', mp.code['py-1-1'] === 'LOCAL' && mp.code['py-3-1'] === 'draft', mp.code);
const ml = here.dump('shortcourses.lab.v1');
check('merge: lab settings stay local', ml.lang === 'python' && ml.fontSize === 12, [ml.lang, ml.fontSize]);
const pyNames = ml.files.python.map((f) => f.name).sort().join();
check('merge: a same-named different file is kept, not overwritten', ml.files.python.find((f) => f.name === 'main.py').code === 'print("different")' && pyNames === 'ex.py,main-restored.py,main.py,mine.py', pyNames);
check('merge: one file per exercise (local kept)', ml.files.python.filter((f) => f.ex).length === 1 && ml.files.python.find((f) => f.ex).code === 'LOCAL EXERCISE');
check('merge: files in other languages are added', ml.files.scheme.map((f) => f.name).join() === 'main.scm');
const mpf = here.dump('shortcourses.portfolio.v1');
check('merge: portfolio fills the blanks only', mpf.name === 'Ada' && mpf.note === 'local note' && mpf.tasks === true && mpf.unfinished === true, mpf);
{ const mineFS = SHELL.makeFS(null); mineFS.write('/home/student/mine.txt', 'kept'); mineFS.mkdir('/home/student/notes'); mineFS.write('/home/student/notes/a.txt', 'LOCAL'); const hs = store({ 'shortcourses.shell.v1': J({ v: 1, fs: mineFS.toJSON(), history: ['pwd'] }) }); BACKUP.apply(hs, parsed.data, 'merge'); const got = hs.dump('shortcourses.shell.v1'); const t = SHELL.makeFS(got.fs); check('merge: terminal keeps local files and adds missing ones', t.read('/home/student/notes/a.txt') === 'LOCAL' && t.read('/home/student/mine.txt') === 'kept' && t.read('/home/student/run.sh') === 'echo hi' && t.stat('/home/student/run.sh').x === true && got.history.join() === 'pwd', t.walk('/home').map((e) => e[0])); }
const mt = here.dump('shortcourses.teach.v1');
check('merge: assignments are the union', Object.keys(mt.assignments).sort().join() === 'abcd2345,other123' && mt.assignments.other123.title === 'Mine');
check('merge: submissions and names come across', mt.book.abcd2345.Ann.reviewed === 20 && mt.studentName === 'Ada' && Object.keys(mt.received).join() === 'zzzz9999');

// ---- a newer local submission beats an older one from the file
const newer = store({ 'shortcourses.teach.v1': J({ assignments: { abcd2345: asg }, book: { abcd2345: { Ann: { name: 'Ann', at: 99, code: 'NEWER', reviewed: 100 } } } }) });
BACKUP.apply(newer, parsed.data, 'merge');
check('merge: the newer submission wins', newer.dump('shortcourses.teach.v1').book.abcd2345.Ann.code === 'NEWER');

// ---- replace overwrites
const rep = store({ 'shortcourses.progress.v1': J({ done: { 'py-9-9': 1 }, code: {}, pass: {} }) });
BACKUP.apply(rep, parsed.data, 'replace');
check('replace: the file takes the place of what is here', !('py-9-9' in rep.dump('shortcourses.progress.v1').done) && 'py-1-1' in rep.dump('shortcourses.progress.v1').done);

// ---- hostile and broken files
// a hostile terminal part: bad names and system files are dropped, caps hold
{ const hostile = J({ app: 'short-explorations-backup', v: 1, saved: 'x', data: { shell: { v: 1, fs: { cwd: '/etc', root: { t: 'd', c: [['home', { t: 'd', c: [['student', { t: 'd', c: [['../x', { t: 'f', d: 'bad' }], ['ok.txt', { t: 'f', d: 'fine', x: 'maybe' }], ['big', { t: 'f', d: 'x'.repeat(300000) }]] }]] }], ['etc', { t: 'd', c: [['passwd', { t: 'f', d: 'root::0:0::/:/bin/sh' }]] }], ['bin', { t: 'd', c: [['ls', { t: 'f', d: 'evil', x: true }]] }]] } } } } });
  const hp = BACKUP.parse(hostile); const t = SHELL.makeFS(hp.data.shell.fs);
  check('hostile terminal part is rebuilt', t.list('/home/student').join() === 'ok.txt' && t.stat('/home/student/ok.txt').x === false && t.read('/etc/passwd').startsWith('root:x:0:0:root') && t.stat('/bin/ls').d === '' && hp.summary.terminal === 1, [t.list('/home/student'), hp.summary.terminal]); }
const fails = (name, text, re) => { try { BACKUP.parse(text); check(name + ' is refused', false, 'it was accepted'); } catch (e) { check(name + ' is refused with a clear message', re.test(e.message), e.message); } };
fails('not JSON', 'hello', /not valid JSON/);
fails('JSON of another kind', J([1, 2, 3]), /not made by/);
fails('another site\'s file', J({ app: 'something-else', v: 1, data: {} }), /not made by/);
fails('a newer version', J({ app: 'short-explorations-backup', v: 2, data: {} }), /newer version/);
fails('an old version', J({ app: 'short-explorations-backup', v: 0, data: {} }), /no longer reads/);
fails('no data', J({ app: 'short-explorations-backup', v: 1 }), /no saved work/);
fails('an empty backup', J({ app: 'short-explorations-backup', v: 1, data: {} }), /empty/);
fails('a huge file', 'x'.repeat(9 * 1024 * 1024), /too large/);

const evil = '{"app":"short-explorations-backup","v":1,"data":{"progress":{"done":{"__proto__":5,"constructor":6,"py-1-1":7,"bad key":8,"../x":9},"code":{"__proto__":"x","py-1-1":{"a":1},"py-2-1":"ok"},"pass":[]},' +
  '"lab":{"lang":"constructor","files":{"python":[{"name":"<img src=x onerror=alert(1)>.py","code":"print(1)","asg":"__proto__","ex":{"id":"../../etc","course":5}},{"name":5,"code":"x"},null,"str"],"__proto__":[{"name":"x","code":"y"}],"cpp":"nope"},"active":{"python":99},"fontSize":1e9},' +
  '"portfolio":{"name":' + J('N'.repeat(1000)) + ',"lab":[1,"a/b",null]},' +
  '"teach":{"studentName":{"x":1},"received":{"__proto__":{"id":"__proto__","lang":"python"},"constructor":{"id":"constructor","lang":"python"},"okid":{"id":"okid","lang":"python","tests":[{"k":"call","in":"f()","expect":"1","hidden":true}]},"bad":{"id":"mismatch","lang":"python"}},' +
  '"assignments":{"toString":{"id":"toString","lang":"cpp"}},"book":{"__proto__":{"x":{"code":"y"}},"abcd2345":{"__proto__":{"code":"q"},"a":{"code":5},"b":{"code":"fine"}}},"teacher":"yes"}}}';
const ev = BACKUP.parse(evil);
check('hostile file: no prototype pollution', ({}).polluted === undefined && ({}).x === undefined && Object.keys(Object.prototype).length === 0);
check('hostile file: bad progress ids and types are dropped', J(Object.keys(ev.data.progress.done)) === '["py-1-1"]', Object.keys(ev.data.progress.done));
check('hostile file: only a string is code', Object.keys(ev.data.progress.code).join() === 'py-2-1', Object.keys(ev.data.progress.code));
check('hostile file: unknown language becomes python, font size is clamped', ev.data.lab.lang === 'python' && ev.data.lab.fontSize === 24, [ev.data.lab.lang, ev.data.lab.fontSize]);
check('hostile file: only well-formed lab files survive, with clean fields', ev.data.lab.files.python.length === 1 && !('asg' in ev.data.lab.files.python[0]) && !('ex' in ev.data.lab.files.python[0]) && ev.data.lab.files.cpp.length === 0, ev.data.lab.files);
check('hostile file: active index is repaired', ev.data.lab.active.python === 0);
check('hostile file: long text is cut, junk entries dropped', ev.data.portfolio.name.length === 200 && J(ev.data.portfolio.lab) === '["a/b"]', ev.data.portfolio.lab);
check('hostile file: received assignments are checked (ids must match, no hidden tests)', Object.keys(ev.data.teach.received).join() === 'okid' && ev.data.teach.received.okid.tests[0].hidden === false, Object.keys(ev.data.teach.received));
check('hostile file: bad language / ids in teacher data are dropped', Object.keys(ev.data.teach.assignments).length === 0, ev.data.teach.assignments);
check('hostile file: grade book keeps only well-formed entries', J(Object.keys(ev.data.teach.book.abcd2345)) === '["b"]' && ev.data.teach.teacher === true, ev.data.teach.book);
const sev = store(); BACKUP.apply(sev, ev.data, 'replace'); BACKUP.apply(sev, ev.data, 'merge');
check('hostile file: applying it pollutes nothing', ({}).polluted === undefined && Object.keys(Object.prototype).length === 0 && ({}).code === undefined);

// ---- empty or odd storage
const empty = store();
const e1 = BACKUP.collect(empty, {}); check('empty storage collects to nothing', Object.keys(e1.data).length === 0, e1.data);
const broken = store({ 'shortcourses.progress.v1': 'not json', 'shortcourses.lab.v1': '[]', 'shortcourses.teach.v1': '"str"' });
check('broken storage does not throw', Object.keys(BACKUP.collect(broken, { teacher: true }).data).length === 0);


// ---- the C++ engine choice: assignments carry "runtime" and the Lab remembers a standard; nothing else gets through
{
  const T = window.TEACH;
  const cppAsg = { id: 'cppasg23', v: 1, title: 'Words', lang: 'cpp', runtime: 'full', text: '', starter: '', tests: [], hints: [], roster: [], author: '', due: '', created: 5 };
  check('assignment: Full C++ is kept for a C++ assignment', T.normalize(cppAsg).runtime === 'full');
  check('assignment: no runtime key when the teaching interpreter is meant', !('runtime' in T.normalize(Object.assign({}, cppAsg, { runtime: undefined }))));
  check('assignment: a runtime on a Python assignment is dropped', !('runtime' in T.normalize(Object.assign({}, cppAsg, { lang: 'python' }))));
  for (const evil of ['FULL', 'teaching', 1, true, {}, ['full'], '__proto__']) check('assignment: runtime ' + J(evil) + ' is dropped', !('runtime' in T.normalize(Object.assign({}, cppAsg, { runtime: evil }))), T.normalize(Object.assign({}, cppAsg, { runtime: evil })));
  const copy = T.studentCopy(T.normalize(cppAsg));
  check('assignment: the student copy carries Full C++', copy.runtime === 'full' && T.toEx(copy, false).runtime === 'full');
  check('assignment: the teaching interpreter gives an exercise with no runtime', T.toEx(T.normalize(Object.assign({}, cppAsg, { runtime: undefined })), false).runtime === undefined);
  const labC = Object.assign({}, lab, { fullCpp: true, cppStd: 'gnu++23' });
  const sc = store(); BACKUP.apply(sc, BACKUP.parse(J({ app: 'short-explorations-backup', v: 1, saved: new Date().toISOString(), data: { lab: labC } })).data, 'replace');
  check('lab: the engine and the standard survive a backup', sc.dump('shortcourses.lab.v1').fullCpp === true && sc.dump('shortcourses.lab.v1').cppStd === 'gnu++23', sc.dump('shortcourses.lab.v1'));
  for (const evil of ['gnu++99', 'c++20', 20, {}, null, '-std=gnu++20 -fsomething']) {
    const sh = store(); BACKUP.apply(sh, BACKUP.parse(J({ app: 'short-explorations-backup', v: 1, saved: new Date().toISOString(), data: { lab: Object.assign({}, lab, { cppStd: evil }) } })).data, 'replace');
    check('lab: standard ' + J(evil) + ' is dropped', !('cppStd' in sh.dump('shortcourses.lab.v1')), sh.dump('shortcourses.lab.v1'));
  }
}

// ---- the review schedule (review.js): round trip, merge by the copy answered last, and hostile items
{
  const fileOf = (data) => J({ app: 'short-explorations-backup', v: 1, saved: new Date().toISOString(), data });
  const review = { v: 1, items: { 'python:abc123': { box: 2, due: 5000, n: 3, miss: 1, last: 4000 }, 'java:zz9': { box: 0, due: 900, n: 1, miss: 1, last: 800 } } };
  const sr = store({ 'shortcourses.review.v1': J(review) });
  const f = BACKUP.collect(sr, {});
  check('review: collected into the file', f.data.review && Object.keys(f.data.review.items).length === 2 && f.data.review.items['python:abc123'].box === 2, f.data.review);
  const p = BACKUP.parse(J(f));
  check('review: a file with only review questions is not empty, and they are counted', p.summary.reviews === 2, p.summary);
  const s0 = store(); BACKUP.apply(s0, p.data, 'replace');
  check('review: round trip', J(s0.dump('shortcourses.review.v1').items) === J(review.items), s0.dump('shortcourses.review.v1'));
  const here = store({ 'shortcourses.review.v1': J({ v: 1, items: { 'python:abc123': { box: 4, due: 9000, n: 6, miss: 1, last: 8000 }, 'cpp:q1': { box: 1, due: 10, n: 1, miss: 0, last: 5 } } }) });
  BACKUP.apply(here, p.data, 'merge');
  const m = here.dump('shortcourses.review.v1').items;
  check('review: merge keeps the copy answered last, and adds what is missing', m['python:abc123'].box === 4 && m['java:zz9'] && m['cpp:q1'], m);
  const evil = '{"app":"short-explorations-backup","v":1,"data":{"review":{"v":1,"items":{"__proto__":{"box":1},"constructor":{"box":1},"python:ok1":{"box":99,"due":-5,"n":"x","miss":null,"last":1e30},"Bad Id":{"box":1},"python:../x":{"box":1},"java:fine":[1,2],"x:y":"str"}}}}';
  const ev = BACKUP.parse(evil);
  const ei = ev.data.review.items;
  check('review: hostile ids and values are dropped or bounded', Object.keys(ei).join() === 'python:ok1' && ei['python:ok1'].box === 4 && ei['python:ok1'].due === 0 && ei['python:ok1'].n === 0 && ei['python:ok1'].last === 1e15 && Object.getPrototypeOf(ei) === null, ei);
}

if (bad) { console.log(bad + ' problems'); process.exit(1); }
console.log('backup OK');
