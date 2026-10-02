// Node tests for the spaced review (src/review.js): the schedule, the ids, the cleaning, and every quick check having an id of its own.
global.window = global;
const R = require('./src/review.js');
let bad = 0;
const check = (name, ok, detail) => { if (!ok) { bad++; console.log('BAD  ' + name + (detail !== undefined ? '\n  ' + JSON.stringify(detail) : '')); } };
const DAY = 86400000, t0 = Date.UTC(2026, 9, 2, 12);

// ---- the schedule: 1, 3, 10, 30, 90 days; a miss goes back to 1 day; a right guess stays where it is
let it = R.next(null, true, 'sure', t0);
check('a first right answer comes back in a day', it.box === 0 && it.due === t0 + DAY && it.n === 1 && it.miss === 0, it);
const gaps = [];
for (let i = 0; i < 6; i++) { it = R.next(it, true, 'sure', it.due); gaps.push(Math.round((it.due - it.last) / DAY)); }
check('right answers stretch the gap: 3, 10, 30, 90, then stay at 90', gaps.join() === '3,10,30,90,90,90', gaps);
const missed = R.next(it, false, 'sure', it.due);
check('a miss goes back to one day and is counted', missed.box === 0 && missed.due - missed.last === DAY && missed.miss === 1, missed);
const g1 = R.next({ box: 2, due: 0, n: 3, miss: 0, last: 0 }, true, 'guess', t0);
check('a right guess stays at the same gap', g1.box === 2 && g1.due === t0 + 10 * DAY, g1);
check('a first right guess comes back in a day', R.next(null, true, 'guess', t0).box === 0);
check('"think so" moves on like "sure"', R.next({ box: 1, due: 0, n: 2, miss: 0, last: 0 }, true, 'think', t0).box === 2);
check('a first wrong answer comes back in a day', R.next(null, false, 'guess', t0).due === t0 + DAY);

// ---- what is due: by the end of today, only known questions, most overdue first
const data = R.clean({ v: 1, items: { 'a:1': { box: 0, due: t0 - 3 * DAY, n: 1, miss: 0, last: 0 }, 'a:2': { box: 0, due: t0 - DAY, n: 1, miss: 0, last: 0 }, 'a:3': { box: 0, due: t0 + 2 * DAY, n: 1, miss: 0, last: 0 }, 'a:4': { box: 0, due: R.endOfToday(t0) - 1, n: 1, miss: 0, last: 0 }, 'gone:9': { box: 0, due: 0, n: 1, miss: 0, last: 0 } } });
const due = R.dueIds(data, (id) => !id.startsWith('gone'), t0);
check('due: overdue first, later today included, the future and unknown questions left out', due.join() === 'a:1,a:2,a:4', due);

// ---- ids: every quick check on the site has its own, and they ignore lesson order
const files = ['computer', 'scratch', 'python', 'lisp', 'cpp', 'math', 'modern', 'java', 'dsa', 'shell', 'ml'];
const seen = new Map(); let n = 0;
for (const f of files) { window.COURSES = []; require('./src/course_' + f + '.js'); const c = window.COURSES[0];
  c.lessons.forEach((L, li) => L.blocks.forEach((b) => { if (!b || !b.check) return; n++; const id = R.itemId(c.id, b);
    if (!/^[a-z0-9]{1,20}:[0-9a-z]{1,8}$/.test(id)) check('id shape ' + id, false);
    if (seen.has(id)) check('two quick checks share the id ' + id + ': ' + seen.get(id) + ' and ' + c.id + ' lesson ' + (li + 1), false);
    seen.set(id, c.id + ' lesson ' + (li + 1)); })); }
check('every quick check has an id (' + n + ')', seen.size === n && n > 200, n);
const q = { check: 'What is 1 + 1?', options: ['1', '2'], answer: 1, why: 'x' };
check('an id depends on the question and options, not on the explanation', R.itemId('python', q) === R.itemId('python', Object.assign({}, q, { why: 'changed' })) && R.itemId('python', q) !== R.itemId('python', Object.assign({}, q, { options: ['1', '3'] })));

// ---- cleaning and merging
const cleaned = R.clean({ v: 1, items: { 'python:a1': { box: 7, due: 'x', n: -2, miss: 3.6, last: 5 }, '__proto__': { box: 1 }, 'toString': {}, 'python:a2': null } });
check('clean: bounds, drops bad ids and non-objects, no prototype', Object.keys(cleaned.items).join() === 'python:a1' && cleaned.items['python:a1'].box === 4 && cleaned.items['python:a1'].due === 0 && cleaned.items['python:a1'].n === 0 && cleaned.items['python:a1'].miss === 4 && Object.getPrototypeOf(cleaned.items) === null, cleaned);
check('clean: rubbish gives an empty review', Object.keys(R.clean('nope').items).length === 0 && Object.keys(R.clean({ items: [1, 2] }).items).length === 0);
const merged = R.merge({ items: { 'a:1': { box: 1, due: 1, n: 1, miss: 0, last: 50 } } }, { items: { 'a:1': { box: 3, due: 1, n: 4, miss: 0, last: 90 }, 'b:2': { box: 0, due: 1, n: 1, miss: 0, last: 1 } } });
check('merge: the copy answered last wins, and nothing is lost', merged.items['a:1'].box === 3 && merged.items['b:2'], merged);

// ---- named skills (course.skills): where each is first taught, what counts towards it, and its three states
{
  const ex1 = { id: 'zz-1-1' }, ex2 = { id: 'zz-2-1' };
  const qa = { check: 'A?', options: ['x', 'y'], answer: 0, skill: 'one' }, qb = { check: 'B?', options: ['x', 'y'], answer: 0, skill: ['one', 'two'] };
  const course = { id: 'zz', skills: [{ id: 'one', name: 'One' }, { id: 'two', name: 'Two' }, { id: 'unused', name: 'Unused' }],
    lessons: [{ blocks: ['<p>s</p>', qa, { ex: Object.assign({ skill: 'one' }, ex1) }] }, { blocks: ['<p>s</p>', qb, { ex: Object.assign({ skill: 'two' }, ex2) }] }] };
  const parts = R.skillParts(course), by = Object.fromEntries(parts.map((p) => [p.skill.id, p]));
  check('skills: first taught where first tagged; checks and exercises collected; untagged skills have no lesson',
    by.one.lesson === 0 && by.one.checks.length === 2 && by.one.exs.length === 1 && by.two.lesson === 1 && by.two.checks.length === 1 && by.unused.lesson === -1, parts.map((p) => [p.skill.id, p.lesson, p.checks.length, p.exs.length]));
  const done = new Set();
  window.__app = { internal: { Progress: { isDone: (id) => done.has(id) } } };
  global.localStorage = { store: {}, getItem(k) { return this.store[k] || null; }, setItem(k, v) { this.store[k] = String(v); } };
  R._reset();
  check('skills: nothing done is not started', R.skillStatus(course, by.one) === 'none');
  done.add('zz-1-1');
  check('skills: an exercise done is practising', R.skillStatus(course, by.one) === 'practising');
  localStorage.setItem(R.KEY, JSON.stringify({ v: 1, items: { [R.itemId('zz', qa)]: { box: 2, due: 0, n: 3, miss: 0, last: 1 } } })); R._reset();
  check('skills: exercises done and every met check at box 2 is secure, even with a check not met yet', R.skillStatus(course, by.one) === 'secure');
  localStorage.setItem(R.KEY, JSON.stringify({ v: 1, items: { [R.itemId('zz', qa)]: { box: 2, due: 0, n: 3, miss: 0, last: 1 }, [R.itemId('zz', qb)]: { box: 0, due: 0, n: 1, miss: 1, last: 2 } } })); R._reset();
  check('skills: a met check still at box 0 keeps it practising', R.skillStatus(course, by.one) === 'practising');
  done.clear(); localStorage.setItem(R.KEY, JSON.stringify({ v: 1, items: { [R.itemId('zz', qb)]: { box: 3, due: 0, n: 4, miss: 0, last: 2 } } })); R._reset();
  check('skills: checks secure but its exercise not done is practising', R.skillStatus(course, by.two) === 'practising');
  R._reset(); delete global.localStorage; delete window.__app;
}

if (bad) { console.log(bad + ' problems'); process.exit(1); }
console.log('review OK (' + n + ' quick checks, each with its own id)');
