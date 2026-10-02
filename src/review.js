/* Spaced review and the skills map. Every quick check a student answers in a lesson joins their review; it comes back on the #/today
   page after 1 day, then after 3, 10, 30 and 90 days as long as it is answered right, and back to 1 day after a miss. A right answer
   marked "Guessing" stays at the same gap. Up to ten items a day, the most overdue first, mixed across lessons and courses, with the
   options in a new order each time. Spaced retrieval is the best-supported way to make learning last (LESSON_STANDARD.md §5): this is
   that, with nothing more than localStorage.

   An item's id is the course id and a hash of the question and its options, so it survives lessons being reordered; editing a question
   makes a new item, and the old one, which no longer matches any question, is never shown (and is dropped when the data is cleaned).

   A course may also name its skills (course.skills, tagged on quick checks and exercises with skill: 'id'): the map then lists them
   too, each with the same three states, worked out from the checks and exercises that carry its tag.

   A lesson is "secure" in the skills map when every exercise is done and every quick check has been answered right at least twice more,
   days apart (box 2 or higher: right at the 1-day and the 3-day review); "practising" when something has been done; "not yet" otherwise.

   Storage: shortcourses.review.v1 = { v: 1, items: { id: { box, due, n, miss, last } } }. In the backup file (backup.js uses clean()).
   Exposed as window.REVIEW (browser) and module.exports (node tests: the scheduling and cleaning need no page). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.REVIEW = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const KEY = 'shortcourses.review.v1';
  const GAPS = [1, 3, 10, 30, 90];   // days until the next review, by box
  const SECURE_BOX = 2;
  const PER_DAY = 10;
  const DAY = 86400000;
  const MAX_ITEMS = 5000;
  const ID_RE = /^[a-z0-9]{1,20}:[0-9a-z]{1,8}$/;

  // ---------- pure parts (node tests use these) ----------
  function hash(s) { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(36); }
  const itemId = (courseId, b) => courseId + ':' + hash(String(b.check) + '\u0001' + (b.options || []).map(String).join('\u0001'));
  /** The state after an answer. sure: 'sure' | 'think' | 'guess' | null. */
  function next(item, correct, sure, now) {
    const box = item ? item.box : -1;
    const b = !correct ? 0 : sure === 'guess' ? Math.max(0, box) : Math.min(GAPS.length - 1, box + 1);
    return { box: b, due: now + GAPS[b] * DAY, n: (item ? item.n : 0) + 1, miss: (item ? item.miss : 0) + (correct ? 0 : 1), last: now };
  }
  const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
  const int = (x, lo, hi) => (Number.isFinite(x) ? Math.max(lo, Math.min(hi, Math.round(x))) : lo);
  /** Raw data (from storage or a backup file: untrusted) → clean data. Ids are checked, numbers bounded, the dictionary has no prototype. */
  function clean(raw) {
    const items = Object.create(null);
    if (isObj(raw) && isObj(raw.items)) for (const id of Object.keys(raw.items).slice(0, MAX_ITEMS)) {
      const it = raw.items[id];
      if (!ID_RE.test(id) || (id in Object.prototype) || !isObj(it)) continue;
      items[id] = { box: int(it.box, 0, GAPS.length - 1), due: int(it.due, 0, 1e15), n: int(it.n, 0, 1e6), miss: int(it.miss, 0, 1e6), last: int(it.last, 0, 1e15) };
    }
    return { v: 1, items };
  }
  /** Two copies of the review → one: for each item, the copy answered last wins. */
  function merge(mine, theirs) {
    const out = clean(theirs);
    for (const [id, it] of Object.entries(clean(mine).items)) if (!out.items[id] || it.last >= out.items[id].last) out.items[id] = it;
    return out;
  }
  const endOfToday = (now) => { const d = new Date(now); d.setHours(0, 0, 0, 0); return d.getTime() + DAY; };
  /** The items due by the end of today (only those whose question still exists), most overdue first. */
  function dueIds(data, known, now) {
    const by = endOfToday(now);
    return Object.keys(data.items).filter((id) => known(id) && data.items[id].due < by).sort((a, b) => data.items[a].due - data.items[b].due);
  }

  // ---------- storage ----------
  let data = null;
  function load() {
    if (data) return data;
    try { data = clean(JSON.parse(localStorage.getItem(KEY) || 'null')); } catch (e) { data = clean(null); }
    return data;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(load())); } catch (e) { /* storage unavailable */ } }

  // ---------- the questions: every quick check of every course, by id ----------
  let index = null;
  function buildIndex() {
    if (index) return index;
    index = new Map();
    for (const c of (typeof window !== 'undefined' && window.COURSES) || []) c.lessons.forEach((L, li) => (L.blocks || []).forEach((b) => { if (b && b.check) index.set(itemId(c.id, b), { course: c, lesson: li, block: b }); }));
    return index;
  }
  const known = (id) => buildIndex().has(id);
  const classroom = () => !!(window.CLASSROOM && window.CLASSROOM.isOn && window.CLASSROOM.isOn());

  /** A quick check answered in a lesson. Only the first answer to a question counts: re-reading a lesson does not reset its schedule. */
  function fromLesson(course, b, correct, sure) {
    if (classroom()) return;   // a teacher's projector is not a student's memory
    const id = itemId(course.id, b), d = load();
    if (d.items[id]) return;
    d.items[id] = next(null, correct, sure, Date.now()); save(); changed();
  }
  function answer(id, correct, sure) { const d = load(); d.items[id] = next(d.items[id], correct, sure, Date.now()); save(); changed(); }
  const changed = () => { try { document.dispatchEvent(new CustomEvent('review-changed')); } catch (e) { /* not in a page */ } };
  const count = () => Object.keys(load().items).filter(known).length;
  const dueCount = () => Math.min(PER_DAY, dueIds(load(), known, Date.now()).length);

  /** not yet / practising / secure, for one lesson. */
  function lessonStatus(course, L) {
    const P = window.__app.internal.Progress;
    const checks = (L.blocks || []).filter((b) => b && b.check).map((b) => load().items[itemId(course.id, b)]);
    const exs = (L.blocks || []).filter((b) => b && b.ex).map((b) => P.isDone(b.ex.id));
    if (!checks.some(Boolean) && !exs.some(Boolean)) return 'none';
    if (exs.every(Boolean) && checks.every((it) => it && it.box >= SECURE_BOX)) return 'secure';
    return 'practising';
  }
  const STATUS = { none: 'Not started', practising: 'Practising', secure: 'Secure' };
  /** A course's named skills (course.skills, LESSON_STANDARD.md §4): what tags each, and where each is first taught. Quick checks and
      exercises name theirs with skill: 'id' or skill: ['id', ...]. */
  const tagsOf = (x) => [].concat(x && x.skill != null ? x.skill : []).map(String);
  function skillParts(course) {
    const parts = new Map((course.skills || []).map((s) => [s.id, { skill: s, lesson: -1, checks: [], exs: [] }]));
    course.lessons.forEach((L, li) => (L.blocks || []).forEach((b) => {
      if (!b) return;
      const tagged = b.check ? tagsOf(b) : b.ex ? tagsOf(b.ex) : [];
      for (const id of tagged) { const p = parts.get(id); if (!p) continue; if (p.lesson < 0) p.lesson = li; if (b.check) p.checks.push(b); else p.exs.push(b.ex); }
    }));
    return [...parts.values()];
  }
  /** not yet / practising / secure, for one named skill: secure when its exercises are done and every quick check of it the student
      has met has been answered right at two reviews, days apart (as a lesson; a checkpoint's checks count once they are answered). */
  function skillStatus(course, part) {
    const P = window.__app.internal.Progress;
    const its = part.checks.map((b) => load().items[itemId(course.id, b)]).filter(Boolean), exs = part.exs.map((ex) => P.isDone(ex.id));
    if (!its.length && !exs.some(Boolean)) return 'none';
    if (exs.every(Boolean) && its.length && its.every((it) => it.box >= SECURE_BOX)) return 'secure';
    return 'practising';
  }

  // ---------- the page parts ----------
  const el = (...a) => window.__app.internal.el(...a);
  /** The skills map of one course: one square per lesson, coloured by status, each a link to the lesson. */
  function skillsMap(course, opts) {
    opts = opts || {};
    const st = course.lessons.map((L) => lessonStatus(course, L));
    const n = (k) => st.filter((s) => s === k).length;
    const list = el('ol', { class: 'skills' }, course.lessons.map((L, i) => el('li', { class: 'sk sk-' + st[i] },
      el('a', { href: '#/' + course.id + '/' + (i + 1), title: (i + 1) + '. ' + L.title + ': ' + STATUS[st[i]] }, el('span', { class: 'sk-num' }, String(i + 1)), el('span', { class: 'sk-title' }, L.title), el('span', { class: 'sk-state' }, STATUS[st[i]])))));
    let named = null;
    if (course.skills && course.skills.length) {   // the named skills, under the lessons: each links to the lesson that teaches it
      const ps = skillParts(course).filter((p) => p.lesson >= 0), ss = ps.map((p) => skillStatus(course, p));
      const m = (k) => ss.filter((s) => s === k).length;
      named = el('details', { class: 'sk-named', open: opts.compact ? null : '' },
        el('summary', {}, 'Skills: ' + m('secure') + ' of ' + ps.length + ' secure' + (m('practising') ? ', ' + m('practising') + ' practising' : '')),
        el('ul', { class: 'sk-chips' }, ps.map((p, i) => el('li', { class: 'sk-chip sk-' + ss[i] },
          el('a', { href: '#/' + course.id + '/' + (p.lesson + 1), title: p.skill.name + ' (lesson ' + (p.lesson + 1) + '): ' + STATUS[ss[i]] }, p.skill.name, el('span', { class: 'sr-only' }, ': ' + STATUS[ss[i]]))))));
    }
    return el('div', { class: 'skills-map' + (opts.compact ? ' compact' : '') },
      opts.title ? el('h3', {}, opts.title) : null,
      el('p', { class: 'sk-sum small' }, n('secure') + ' secure · ' + n('practising') + ' practising · ' + n('none') + ' not started'), list, named);
  }
  /** For the course page: what is due in this course, and the map. Nothing if the student has not started the course. */
  function coursePanel(course) {
    const mine = Object.keys(load().items).filter((id) => id.startsWith(course.id + ':') && known(id));
    const exDone = course.lessons.some((L) => (L.blocks || []).some((b) => b && b.ex && window.__app.internal.Progress.isDone(b.ex.id)));
    if (!mine.length && !exDone) return null;
    const due = dueIds(load(), (id) => id.startsWith(course.id + ':') && known(id), Date.now()).length;
    return el('section', { class: 'review-panel' },
      el('h2', {}, 'Your skills'),
      due ? el('p', {}, el('a', { class: 'btn primary', href: '#/today' }, 'Review now'), ' ', due + (due === 1 ? ' question from this course is' : ' questions from this course are') + ' due today.') : el('p', { class: 'small muted' }, mine.length ? 'Nothing from this course is due today. Questions come back after 1, 3, 10, 30 and 90 days.' : 'Answer the quick checks in the lessons, and they will come back here for review on later days.'),
      skillsMap(course, { compact: true }));
  }
  /** The top-bar link: shown once there is anything to review, with the number due today. */
  function topLink(current) {
    if (!count()) return null;
    const due = dueCount();
    return el('a', { href: '#/today', class: 'today-link' + (current ? ' current' : ''), 'aria-label': due ? 'Review: ' + due + ' due today' : 'Review' }, 'Review', due ? el('span', { class: 'today-badge', 'aria-hidden': 'true' }, String(due)) : null);
  }

  const shuffle = (xs) => { for (let i = xs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [xs[i], xs[j]] = [xs[j], xs[i]]; } return xs; };
  /** The question with its options in a new order (wrong[] and answer follow them), so a position is never what is remembered. */
  function shuffled(b) {
    const order = shuffle((b.options || []).map((o, i) => i));
    return Object.assign({}, b, { options: order.map((i) => b.options[i]), wrong: b.wrong ? order.map((i) => b.wrong[i]) : undefined, answer: order.indexOf(b.answer) });
  }
  function whenText(ms) { const days = Math.round((ms - Date.now()) / DAY); return days <= 1 ? 'tomorrow' : 'in ' + days + ' days'; }

  /** #/today */
  function page() {
    const I = window.__app.internal;
    const main = el('main', { class: 'today' });
    const ids = shuffle(dueIds(load(), known, Date.now()).slice(0, PER_DAY));   // most overdue first, then mixed
    const stage = el('div', { class: 'today-stage' });
    main.append(el('header', { class: 'today-head' }, el('h1', {}, 'Today’s review'),
      el('p', { class: 'lead' }, 'Questions from lessons you have done, coming back after a gap. Remembering something after a few days is what makes it stick, so these are meant to feel a little hard.')));
    let k = 0, right = 0;
    const finish = () => {
      const d = load(), upcoming = Object.keys(d.items).filter(known).map((id) => d.items[id].due).filter((t) => t >= endOfToday(Date.now())).sort((a, b) => a - b);
      const nextDue = upcoming[0], nextN = nextDue ? upcoming.filter((t) => endOfToday(t) === endOfToday(nextDue)).length : 0;
      stage.replaceChildren(el('div', { class: 'today-done' },
        el('p', { class: 'today-big' }, ids.length ? 'Done for today: ' + right + ' of ' + ids.length + ' right first time.' : count() ? 'Nothing is due today.' : 'Nothing to review yet.'),
        el('p', {}, !count() ? 'Every quick check you answer in a lesson comes back here a day later, then after longer and longer gaps.' : nextDue ? 'Next review ' + whenText(nextDue) + ': ' + nextN + (nextN === 1 ? ' question.' : ' questions.') : ''),
        ids.length && right < ids.length ? el('p', { class: 'small muted' }, 'The ones you missed come back tomorrow.') : null));
    };
    const show = () => {
      if (k >= ids.length) { finish(); return; }
      const id = ids[k], ref = buildIndex().get(id), L = ref.course.lessons[ref.lesson];
      const nextBtn = el('button', { class: 'btn primary today-next', hidden: '' }, k + 1 < ids.length ? 'Next question' : 'Finish');
      const box = I.checkBlock(shuffled(ref.block), { onFirstAnswer: (correct, sure) => { if (correct) right++; answer(id, correct, sure); }, onRight: () => { nextBtn.hidden = false; nextBtn.focus(); } });
      nextBtn.addEventListener('click', () => { k++; show(); });
      stage.replaceChildren(
        el('p', { class: 'today-count small' }, 'Question ' + (k + 1) + ' of ' + ids.length + ' · from ', el('a', { href: '#/' + ref.course.id + '/' + (ref.lesson + 1) }, ref.course.code + ' lesson ' + (ref.lesson + 1) + ', ' + L.title)),
        box, el('div', { class: 'toolbar' }, nextBtn));
      const first = box.querySelector('.qc-opt'); if (first) first.focus();
    };
    main.append(stage);
    show();
    const started = (window.COURSES || []).filter((c) => Object.keys(load().items).some((id) => id.startsWith(c.id + ':')) || c.lessons.some((L) => (L.blocks || []).some((b) => b && b.ex && I.Progress.isDone(b.ex.id))));
    if (started.length) main.append(el('section', { class: 'today-skills' }, el('h2', {}, 'Your skills'),
      el('p', { class: 'small muted' }, 'A lesson is secure when its exercises are done and its quick checks have been answered right at two reviews, days apart.'),
      ...started.map((c) => skillsMap(c, { title: c.code + ' ' + c.title, compact: true }))));
    return main;
  }

  return { KEY, GAPS, PER_DAY, SECURE_BOX, itemId, hash, next, clean, merge, dueIds, endOfToday, load, fromLesson, answer, count, dueCount, lessonStatus, skillParts, skillStatus, skillsMap, coursePanel, topLink, page, reset: () => { data = clean(null); save(); changed(); }, _reset: () => { data = null; index = null; } };
});
