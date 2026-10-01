/* Saving a person's work to a file and restoring it. Progress is kept only in the browser, so without this it is lost when the
   site's data is cleared, and cannot move to another computer. The file holds: exercise progress and the code that passed, the Code Lab's
   files, the portfolio settings, and (student side of teach.js) the student's name and the assignments they received. A teacher can also
   include the teacher tools' data: assignments with their hidden tests, and the grade book. That is off unless asked for.

   A backup file is untrusted input, like a link: anyone can hand someone a file. parse() checks and rebuilds every part of it (types,
   lengths, ids, no prototype keys) and apply() only ever writes what that produced. Restoring either REPLACES what is on the device or
   ADDS what is missing and keeps what is here when the two disagree.

   Exposed as window.BACKUP (browser) or module.exports (node tests; teach.js must be loaded first).
     BACKUP.collect(storage, {teacher})   → the file's content (an object)      BACKUP.parse(text) → { saved, data, summary }
     BACKUP.apply(storage, data, 'merge' | 'replace')                            BACKUP.panel() → the buttons for the home page
   `storage` is anything with getItem/setItem (localStorage, or a Map wrapper in tests). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BACKUP = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const FORMAT = 'short-explorations-backup', VERSION = 1, MAX_FILE = 8 * 1024 * 1024;
  const KEYS = { progress: 'shortcourses.progress.v1', lab: 'shortcourses.lab.v1', portfolio: 'shortcourses.portfolio.v1', teach: 'shortcourses.teach.v1' };
  const LANGS = ['python', 'cpp', 'java', 'scheme'];
  const TEACH = () => (typeof window !== 'undefined' && window.TEACH) || null;

  // ---------- small, strict helpers: everything from a file or from storage goes through these ----------
  const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
  const dict = () => Object.create(null);   // keys come from a file: no prototype, so "__proto__" is just a key
  const keys = (o) => (isObj(o) ? Object.keys(o) : []);
  // Ids and names become keys. Anything that is also a member of Object.prototype (__proto__, constructor, toString...) is refused outright,
  // even though the dictionaries here have no prototype: whatever reads the restored data later should not have to be as careful.
  const keyOk = (k) => typeof k === 'string' && !(k in Object.prototype);
  const idOk = (k) => keyOk(k) && /^[A-Za-z0-9_.:-]{1,80}$/.test(k);
  const str = (x, max) => (typeof x === 'string' ? x : '').slice(0, max);
  const fin = (x, lo, hi) => (Number.isFinite(x) ? Math.max(lo, Math.min(hi, x)) : 0);
  const MAX_ENTRIES = 5000;

  function read(storage, key) {
    try { const v = JSON.parse(storage.getItem(key) || 'null'); return isObj(v) ? v : null; } catch (e) { return null; }
  }
  function write(storage, key, value) { storage.setItem(key, JSON.stringify(value)); }

  // ---------- one function per part: raw (from storage or a file) → clean ----------
  function cleanProgress(p) {
    const out = { done: dict(), code: dict(), pass: dict() };
    if (!isObj(p)) return out;
    for (const k of keys(p.done).slice(0, MAX_ENTRIES)) if (idOk(k) && Number.isFinite(p.done[k])) out.done[k] = p.done[k];
    for (const part of ['code', 'pass']) for (const k of keys(p[part]).slice(0, MAX_ENTRIES)) if (idOk(k) && typeof p[part][k] === 'string') out[part][k] = p[part][k].slice(0, 200000);
    return out;
  }

  function cleanLabFile(f) {
    if (!isObj(f) || typeof f.name !== 'string' || typeof f.code !== 'string' || !f.name.trim()) return null;
    const o = { name: f.name.slice(0, 100), code: f.code.slice(0, 1000000) };
    if (idOk(f.asg)) o.asg = f.asg;
    if (isObj(f.ex) && idOk(f.ex.id)) o.ex = { id: f.ex.id, course: str(f.ex.course, 40), lesson: fin(f.ex.lesson, 0, 1000) };
    if (isObj(f.lastCheck)) o.lastCheck = { passed: fin(f.lastCheck.passed, 0, 1e6), total: fin(f.lastCheck.total, 0, 1e6), at: fin(f.lastCheck.at, 0, 1e15) };
    if (f.asgSeen) o.asgSeen = true;
    return o;
  }
  function cleanLab(l) {
    if (!isObj(l)) return null;
    const out = { lang: LANGS.includes(l.lang) ? l.lang : 'python', files: {}, active: {}, fontSize: l.fontSize === undefined ? 15 : fin(l.fontSize, 11, 24) || 15, wrap: !!l.wrap, panels: {} };
    if (l.fullCpp === true) out.fullCpp = true;
    if (['gnu++17', 'gnu++20', 'gnu++23'].includes(l.cppStd) && l.cppStd !== 'gnu++20') out.cppStd = l.cppStd;
    for (const lang of LANGS) {
      const files = (isObj(l.files) && Array.isArray(l.files[lang]) ? l.files[lang] : []).slice(0, 200).map(cleanLabFile).filter(Boolean);
      out.files[lang] = files;
      out.active[lang] = isObj(l.active) && Number.isInteger(l.active[lang]) && l.active[lang] >= 0 && l.active[lang] < files.length ? l.active[lang] : 0;
    }
    if (isObj(l.panels)) for (const k of ['tpl', 'ref']) if (k in l.panels) out.panels[k] = !!l.panels[k];
    return out;
  }

  function cleanPortfolio(p) {
    if (!isObj(p)) return null;
    return { name: str(p.name, 200), note: str(p.note, 2000), unfinished: !!p.unfinished, tasks: !!p.tasks, lab: (Array.isArray(p.lab) ? p.lab : []).filter((x) => typeof x === 'string').slice(0, 500).map((x) => x.slice(0, 200)) };
  }

  function cleanEntry(name, e) {
    if (!isObj(e) || typeof e.code !== 'string') return null;
    const o = { name, at: fin(e.at, 0, 1e15), code: e.code.slice(0, 200000), reviewed: fin(e.reviewed, 0, 1e15), title: str(e.title, 200), claimed: null };
    if (isObj(e.claimed)) o.claimed = { passed: fin(e.claimed.passed, 0, 1e6), total: fin(e.claimed.total, 0, 1e6), at: fin(e.claimed.at, 0, 1e15) };
    if (isObj(e.result)) {
      const r = e.result;
      o.result = { passed: fin(r.passed, 0, 1e6), total: fin(r.total, 0, 1e6), visPassed: fin(r.visPassed, 0, 1e6), visTotal: fin(r.visTotal, 0, 1e6), hiddenPassed: fin(r.hiddenPassed, 0, 1e6), hiddenTotal: fin(r.hiddenTotal, 0, 1e6), error: typeof r.error === 'string' ? r.error.slice(0, 2000) : null,
        results: (Array.isArray(r.results) ? r.results : []).filter(isObj).slice(0, 300).map((t) => ({ name: str(t.name, 500), ok: !!t.ok, expected: str(t.expected == null ? '' : String(t.expected), 2000), got: t.got == null ? null : str(String(t.got), 2000), err: typeof t.err === 'string' ? t.err.slice(0, 500) : null })) };
    }
    return o;
  }
  // Student side: the name and the assignments received. Teacher side (only when asked for): assignments with hidden tests, the grade book.
  function cleanTeach(t, withTeacher) {
    const T = TEACH();
    if (!isObj(t) || !T) return null;
    const out = { studentName: str(t.studentName, 200), received: dict() };
    for (const id of keys(t.received).slice(0, 500)) {
      const a = T.normalize(t.received[id]);
      if (idOk(id) && a && a.id === id) { for (const x of a.tests) x.hidden = false; out.received[id] = a; }   // a received assignment never has hidden tests
    }
    if (withTeacher && (isObj(t.assignments) || isObj(t.book))) {
      out.assignments = dict(); out.book = dict();
      for (const id of keys(t.assignments).slice(0, 500)) { const a = T.normalize(t.assignments[id]); if (idOk(id) && a && a.id === id) out.assignments[id] = a; }
      for (const id of keys(t.book).slice(0, 500)) {
        if (!idOk(id) || !isObj(t.book[id])) continue;
        const entries = dict();
        for (const name of keys(t.book[id]).slice(0, MAX_ENTRIES)) { if (!keyOk(name) || !name || name.length > 120) continue; const e = cleanEntry(name, t.book[id][name]); if (e) entries[name] = e; }
        out.book[id] = entries;
      }
      out.teacher = !!t.teacher; out.name = str(t.name, 200);
    }
    return out;
  }

  /** raw parts → clean parts. Only parts that are present come out. */
  function sanitize(raw, withTeacher) {
    const out = {};
    if (isObj(raw.progress)) out.progress = cleanProgress(raw.progress);
    const lab = cleanLab(raw.lab); if (lab) out.lab = lab;
    const pf = cleanPortfolio(raw.portfolio); if (pf) out.portfolio = pf;
    const th = cleanTeach(raw.teach, withTeacher); if (th) out.teach = th;
    return out;
  }

  function summarize(data) {
    const s = { exercises: 0, programs: 0, portfolio: false, received: 0, assignments: 0, submissions: 0, hasTeacher: false };
    if (data.progress) s.exercises = keys(data.progress.done).length;
    if (data.lab) s.programs = LANGS.reduce((n, l) => n + data.lab.files[l].filter((f) => !f.ex || f.code.trim()).length, 0);
    if (data.portfolio) s.portfolio = !!(data.portfolio.name || data.portfolio.note || data.portfolio.lab.length);
    if (data.teach) {
      s.received = keys(data.teach.received).length;
      if (data.teach.assignments) { s.hasTeacher = true; s.assignments = keys(data.teach.assignments).length; s.submissions = keys(data.teach.book).reduce((n, id) => n + keys(data.teach.book[id]).length, 0); }
    }
    return s;
  }

  // ---------- making and reading the file ----------
  function collect(storage, opts) {
    opts = opts || {};
    const raw = { progress: read(storage, KEYS.progress), lab: read(storage, KEYS.lab), portfolio: read(storage, KEYS.portfolio), teach: read(storage, KEYS.teach) };
    const data = sanitize(raw, !!opts.teacher);
    return { app: FORMAT, v: VERSION, saved: new Date().toISOString(), data };
  }
  function hasTeacherData(storage) {
    const t = read(storage, KEYS.teach);
    return !!t && (keys(t.assignments).length > 0 || keys(t.book).length > 0);
  }
  function parse(text) {
    if (typeof text !== 'string' || text.length > MAX_FILE) throw new Error('This file is too large to be a backup made by this site.');
    let o; try { o = JSON.parse(text); } catch (e) { throw new Error('This is not a backup file: it is not valid JSON.'); }
    if (!isObj(o) || o.app !== FORMAT) throw new Error('This file was not made by “Save my work to a file” on this site.');
    if (o.v !== VERSION) throw new Error(o.v > VERSION ? 'This backup was made by a newer version of the site. Open the newest version of the site to restore it.' : 'This backup file is in a format this site no longer reads.');
    if (!isObj(o.data)) throw new Error('This backup file has no saved work in it.');
    const data = sanitize(o.data, true);
    const summary = summarize(data);
    if (!summary.exercises && !summary.programs && !summary.portfolio && !summary.received && !summary.assignments && !summary.submissions && !(data.progress && keys(data.progress.code).length)) throw new Error('This backup file is empty: there is no saved work in it.');
    return { saved: typeof o.saved === 'string' ? o.saved.slice(0, 40) : '', data, summary };
  }

  // ---------- putting it back ----------
  const mergeDicts = (mine, theirs, pick) => { const out = dict(); for (const k of keys(theirs)) out[k] = theirs[k]; for (const k of keys(mine)) out[k] = k in out && pick ? pick(mine[k], out[k]) : mine[k]; return out; };

  function mergeProgress(mine, theirs) {
    return { done: mergeDicts(mine.done, theirs.done, (a, b) => Math.max(a, b)), code: mergeDicts(mine.code, theirs.code), pass: mergeDicts(mine.pass, theirs.pass) };
  }
  function mergeLab(mine, theirs) {
    const out = { lang: mine.lang, files: {}, active: Object.assign({}, mine.active), fontSize: mine.fontSize, wrap: mine.wrap, panels: Object.assign({}, theirs.panels, mine.panels) };
    if (mine.fullCpp) out.fullCpp = true;
    if (mine.cppStd) out.cppStd = mine.cppStd;
    for (const lang of LANGS) {
      const files = mine.files[lang].map((f) => Object.assign({}, f));
      for (const f of theirs.files[lang]) {
        if (files.some((g) => g.name === f.name && g.code === f.code)) continue;   // already here
        if (f.ex && files.some((g) => g.ex && g.ex.id === f.ex.id)) continue;         // one file per exercise: keep the one here
        if (f.asg && files.some((g) => g.asg === f.asg)) continue;                    // likewise per assignment
        let name = f.name, i = 2; const base = name.replace(/(\.\w+)$/, ''), ext = (name.match(/\.\w+$/) || [''])[0];
        while (files.some((g) => g.name === name)) name = base + '-restored' + (i > 2 ? i : '') + ext, i++;
        files.push(Object.assign({}, f, { name }));
      }
      out.files[lang] = files;
    }
    return out;
  }
  function mergePortfolio(mine, theirs) {
    return { name: mine.name || theirs.name, note: mine.note || theirs.note, unfinished: mine.unfinished || theirs.unfinished, tasks: mine.tasks || theirs.tasks, lab: Array.from(new Set(mine.lab.concat(theirs.lab))) };
  }
  function mergeBook(mine, theirs) {
    const out = dict();
    for (const id of new Set(keys(mine).concat(keys(theirs)))) out[id] = mergeDicts(mine[id] || dict(), theirs[id] || dict(), (a, b) => ((b.reviewed || b.at) > (a.reviewed || a.at) ? b : a));   // the newer submission wins
    return out;
  }

  /** Writes the parts in `data`. mode 'replace': they take the place of what is stored. 'merge': what is stored stays, and what is missing is added. */
  function apply(storage, data, mode) {
    const merge = mode !== 'replace';
    if (data.progress) { const mine = cleanProgress(read(storage, KEYS.progress)); write(storage, KEYS.progress, merge ? mergeProgress(mine, data.progress) : data.progress); }
    if (data.lab) {
      const mine = cleanLab(read(storage, KEYS.lab));
      write(storage, KEYS.lab, merge && mine ? mergeLab(mine, data.lab) : data.lab);
    }
    if (data.portfolio) { const mine = cleanPortfolio(read(storage, KEYS.portfolio)); write(storage, KEYS.portfolio, merge && mine ? mergePortfolio(mine, data.portfolio) : data.portfolio); }
    if (data.teach) {
      const raw = read(storage, KEYS.teach) || {}, mine = cleanTeach(raw, true) || { studentName: '', received: dict() };
      const next = Object.assign({}, raw);   // keeps whatever else is stored there (the teacher-tools switch, the teacher's name)
      next.studentName = merge ? (mine.studentName || data.teach.studentName) : data.teach.studentName;
      next.received = merge ? mergeDicts(mine.received, data.teach.received) : data.teach.received;
      if (data.teach.assignments) {
        next.assignments = merge ? mergeDicts(mine.assignments || dict(), data.teach.assignments) : data.teach.assignments;
        next.book = merge ? mergeBook(mine.book || dict(), data.teach.book) : data.teach.book;
        next.teacher = merge ? (!!raw.teacher || data.teach.teacher) : data.teach.teacher;
        next.name = merge ? (raw.name || data.teach.name) : data.teach.name;
      }
      write(storage, KEYS.teach, next);
    }
  }

  // ---------- the buttons on the home page ----------
  function panel() {
    const { el } = window.__h, internal = window.__app.internal;
    let storage; try { storage = window.localStorage; storage.getItem('x'); } catch (e) { storage = null; }
    const status = el('div', { class: 'backup-status small', role: 'status' });
    const review = el('div', { class: 'backup-review', hidden: '' });
    const box = el('div', { class: 'backup' });
    if (!storage) { box.append(el('p', { class: 'muted small' }, 'This browser does not let the site save anything, so there is nothing to back up here.')); return box; }

    const teacherChk = el('input', { type: 'checkbox', id: 'backup-teacher' });
    const teacherRow = hasTeacherData(storage) ? el('label', { class: 'backup-opt small' }, teacherChk, ' Include the teacher tools: assignments with their hidden tests, and the grade book') : null;
    const file = el('input', { type: 'file', accept: '.json,application/json', hidden: '', 'aria-label': 'Backup file' });
    const note = (text, bad) => { status.textContent = text; status.className = 'backup-status small' + (bad ? ' err' : ''); };

    const save = el('button', { class: 'btn', onclick: () => {
      const content = collect(storage, { teacher: !!(teacherRow && teacherChk.checked) });
      const s = summarize(content.data);
      if (!s.exercises && !s.programs && !s.portfolio && !s.received && !s.assignments && !(content.data.progress && keys(content.data.progress.code).length)) { note('There is nothing saved on this device yet, so there is nothing to put in a file.'); return; }
      const blob = new Blob([JSON.stringify(content, null, 1)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = el('a', { href: url, download: 'short-explorations-work-' + content.saved.slice(0, 10) + '.json' });
      document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000);
      note('Saved: ' + s.exercises + ' completed exercise' + (s.exercises === 1 ? '' : 's') + ' and ' + s.programs + ' Code Lab program' + (s.programs === 1 ? '' : 's') + (s.hasTeacher ? ', and the teacher tools' : '') + '. Keep the file somewhere safe; it holds your code and your name.');
    } }, 'Save my work to a file');
    const restore = el('button', { class: 'btn', onclick: () => file.click() }, 'Restore from a file…');

    file.addEventListener('change', async () => {
      const f = file.files && file.files[0]; file.value = '';
      review.hidden = true; review.textContent = '';
      if (!f) return;
      if (f.size > MAX_FILE) { note('That file is too large to be a backup made by this site.', true); return; }
      let parsed;
      try { parsed = parse(await f.text()); } catch (e) { note(e.message, true); return; }
      note('');
      const s = parsed.summary, when = parsed.saved && !isNaN(Date.parse(parsed.saved)) ? new Date(parsed.saved).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'an unknown time';
      const items = [s.exercises + ' completed exercise' + (s.exercises === 1 ? '' : 's'), s.programs + ' Code Lab program' + (s.programs === 1 ? '' : 's')];
      if (s.received) items.push(s.received + ' assignment' + (s.received === 1 ? '' : 's') + ' received');
      if (s.portfolio) items.push('portfolio settings');
      if (s.hasTeacher) items.push('teacher tools: ' + s.assignments + ' assignment' + (s.assignments === 1 ? '' : 's') + ', ' + s.submissions + ' submission' + (s.submissions === 1 ? '' : 's'));
      const mode = { v: 'merge' };
      const radio = (value, label, hint) => el('label', { class: 'backup-choice' }, el('input', { type: 'radio', name: 'backup-mode', value, checked: value === 'merge' ? '' : null, onchange: () => { mode.v = value; } }), el('span', {}, el('b', {}, label), el('span', { class: 'muted small' }, ' ' + hint)));
      const go = el('button', { class: 'btn primary', onclick: () => {
        const run = () => {
          try { apply(storage, parsed.data, mode.v); } catch (e) { note('Could not restore: this browser would not save it (' + (e && e.message || e) + ').', true); return; }
          review.hidden = true; note('Restored. Reloading…'); setTimeout(() => location.reload(), 600);
        };
        if (mode.v === 'replace') internal.armConfirm(go, 'Replace what is here? Click again', run); else run();
      } }, 'Restore');
      review.append(
        el('p', {}, el('b', {}, 'This file was saved ' + when + '.'), ' It holds ' + items.join(', ') + '.'),
        radio('merge', 'Add what is missing', '(keep what is on this device when the two differ)'),
        radio('replace', 'Replace what is on this device', '(your work here is overwritten by the file)'),
        el('div', { class: 'toolbar' }, go, el('button', { class: 'btn quiet', onclick: () => { review.hidden = true; review.textContent = ''; } }, 'Cancel')));
      review.hidden = false;
    });

    box.append(
      el('p', { class: 'small' }, 'Your work is saved only in this browser. To keep a copy, or to move it to another computer, save it to a file here and restore it there.'),
      el('div', { class: 'toolbar' }, save, restore, file), teacherRow, status, review);
    return box;
  }

  return { collect, parse, apply, panel, hasTeacherData, summarize, FORMAT, VERSION };
});
