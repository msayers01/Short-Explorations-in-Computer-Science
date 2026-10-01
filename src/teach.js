/* Assignments without a server. A teacher builds an assignment in the Code Lab and shares a link
   (or QR code) that carries the whole assignment. A student opens it, works, checks, and submits:
   the submission is itself a link that carries the code. The teacher opens submissions in her own
   Code Lab, where the tests come from HER stored copy of the assignment (including hidden tests),
   and results collect in a grade book on her device. Exposed as window.TEACH. */
(function () {
  const KEY = 'shortcourses.teach.v1';
  const LANG_LABEL = { python: 'Python', cpp: 'C++', scheme: 'Scheme' };
  let T = null;
  // Assignment ids, student names and the like come from links anyone can craft. They are used as object keys, so every
  // dictionary has no prototype: with a normal object a key of "__proto__" or "constructor" would reach Object.prototype
  // (prototype pollution of the whole page) or Object itself.
  const dict = (o) => { const d = Object.create(null); if (o && typeof o === 'object') for (const k of Object.keys(o)) d[k] = o[k]; return d; };
  const ID_RE = /^[A-Za-z0-9_-]{1,40}$/;
  const str = (x, max) => (typeof x === 'string' ? x : x == null ? '' : String(x)).slice(0, max || 20000);
  const strs = (x, max) => (Array.isArray(x) ? x : []).filter(v => typeof v === 'string').slice(0, 500).map(v => v.slice(0, max || 2000));
  function load() {
    if (T) return T;
    try { T = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { T = null; }
    if (!T || typeof T !== 'object' || Array.isArray(T)) T = {};
    T.assignments = dict(T.assignments); T.received = dict(T.received); T.book = dict(T.book);
    for (const k of Object.keys(T.book)) T.book[k] = dict(T.book[k]);
    return T;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(T)); } catch (e) { } }
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const newId = () => { const a = 'abcdefghjkmnpqrstuvwxyz23456789'; let s = ''; for (let i = 0; i < 8; i++) s += a[Math.floor(Math.random() * a.length)]; return s; };
  const fmtDate = (t) => { try { return new Date(t).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return String(t); } };

  // ---------- packing: JSON -> deflate (when the browser has CompressionStream) -> base64url
  const b64 = (bytes) => { let s = ''; for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const unb64 = (s) => { const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)); const out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out; };
  const encodeUtf8 = (str) => typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(str) : Uint8Array.from(unescape(encodeURIComponent(str)), c => c.charCodeAt(0));
  const decodeUtf8 = (bytes) => typeof TextDecoder !== 'undefined' ? new TextDecoder().decode(bytes) : decodeURIComponent(escape(String.fromCharCode.apply(null, bytes)));
  async function pack(obj) {
    const json = JSON.stringify(obj); const bytes = encodeUtf8(json);
    if (typeof CompressionStream !== 'undefined') {
      try { const cs = new CompressionStream('deflate-raw'); const w = cs.writable.getWriter(); w.write(bytes).catch(() => { }); w.close().catch(() => { }); const buf = await new Response(cs.readable).arrayBuffer(); return 'z' + b64(new Uint8Array(buf)); } catch (e) { }
    }
    return 'p' + b64(bytes);
  }
  // A few hundred bytes of deflate can expand to gigabytes (a "decompression bomb"), which would freeze or crash the tab of
  // anyone who opens the link. No real assignment, submission or portfolio comes near these limits.
  const MAX_LINK = 4 * 1024 * 1024, MAX_UNPACKED = 8 * 1024 * 1024;
  async function inflate(body) {
    const ds = new DecompressionStream('deflate-raw'); const w = ds.writable.getWriter(); w.write(body).catch(() => { }); w.close().catch(() => { });
    const reader = ds.readable.getReader(); const chunks = []; let total = 0;
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      total += value.length;
      if (total > MAX_UNPACKED) { reader.cancel().catch(() => { }); throw new Error('This link expands to more data than the site accepts, so it was not opened.'); }
      chunks.push(value);
    }
    const out = new Uint8Array(total); let off = 0; for (const c of chunks) { out.set(c, off); off += c.length; }
    return out;
  }
  async function unpack(s) {
    if (!s) return null;
    if (typeof s !== 'string' || s.length > MAX_LINK) throw new Error('This link is too long to open.');
    const kind = s[0], body = unb64(s.slice(1));
    let bytes = body;
    if (kind === 'z') { if (typeof DecompressionStream === 'undefined') throw new Error('This browser cannot open compressed links; try a current version of Chrome, Safari or Firefox.'); bytes = await inflate(body); }
    else if (kind !== 'p') throw new Error('This is not a link this site made.');
    if (bytes.length > MAX_UNPACKED) throw new Error('This link expands to more data than the site accepts, so it was not opened.');
    return JSON.parse(decodeUtf8(bytes));
  }
  const baseUrl = () => location.href.split('#')[0];

  // Anything that arrives in a link or a back-up is checked and coerced here: ids are short plain words (they become object keys),
  // the language is one we run, and every field has the type the rest of the code expects. Returns null if it is not an assignment.
  function normalize(a) {
    if (!a || typeof a !== 'object' || typeof a.id !== 'string' || !ID_RE.test(a.id) || !Object.prototype.hasOwnProperty.call(LANG_LABEL, a.lang)) return null;
    return { id: a.id, v: 1, title: str(a.title, 200), lang: a.lang, text: str(a.text), starter: str(a.starter, 100000),
      tests: (Array.isArray(a.tests) ? a.tests : []).filter(t => t && typeof t === 'object').slice(0, 200).map(t => ({ k: t.k === 'call' ? 'call' : 'stdin', in: str(t.in, 5000), expect: str(t.expect, 5000), hidden: !!t.hidden })),
      hints: strs(a.hints), roster: strs(a.roster, 200), author: str(a.author, 200), due: str(a.due, 200), created: Number.isFinite(a.created) ? a.created : Date.now() };
  }
  // The same for a submission link: who, which assignment, the program, and what the student's own check showed.
  function cleanSub(sub) {
    if (!sub || typeof sub !== 'object' || typeof sub.a !== 'string' || !ID_RE.test(sub.a) || typeof sub.name !== 'string' || !sub.name.trim() || typeof sub.code !== 'string') throw new Error('this is not a submission link');
    const num = (x) => (Number.isFinite(x) ? Math.max(0, Math.min(1e6, x)) : 0);
    return { v: 1, a: sub.a, t: str(sub.t, 200), name: sub.name.trim().slice(0, 120), code: sub.code.slice(0, 200000), at: Number.isFinite(sub.at) ? sub.at : Date.now(), check: sub.check && typeof sub.check === 'object' ? { passed: num(sub.check.passed), total: num(sub.check.total), at: num(sub.check.at) } : null };
  }

  // ---------- assignment model
  function studentCopy(a) { return { v: 1, id: a.id, title: a.title, lang: a.lang, text: a.text, starter: a.starter, tests: (a.tests || []).filter(t => !t.hidden).map(t => ({ k: t.k, in: t.in, expect: t.expect })), hints: a.hints || [], roster: a.roster || [], author: a.author || '', due: a.due || '', created: a.created }; }
  function toEx(a, includeHidden) {
    const tests = (a.tests || []).filter(t => includeHidden === 'hidden' ? t.hidden : (includeHidden || !t.hidden)).map(t => t.k === 'call' ? { call: t.in, expect: t.expect } : { stdin: t.in, expect: t.expect, name: t.in ? 'input ' + JSON.stringify(t.in) : 'output' });
    return { id: 'asg-' + a.id, lang: a.lang, title: a.title, tests, hints: a.hints || [], followup: '' };
  }
  function textToHtml(t) {   // plain text with paragraphs, `code`, and lines starting with "- " as bullets
    const paras = String(t || '').replace(/\r/g, '').split(/\n{2,}/);
    return paras.map(p => { const lines = p.split('\n'); if (lines.every(l => /^\s*- /.test(l))) return '<ul>' + lines.map(l => '<li>' + inline(l.replace(/^\s*- /, '')) + '</li>').join('') + '</ul>'; return '<p>' + lines.map(inline).join('<br>') + '</p>'; }).join('');
    function inline(s) { return esc(s).replace(/`([^`]+)`/g, '<code>$1</code>'); }
  }

  // ---------- mounting into the Lab
  function mount(ctx) {
    const { el } = ctx; load();
    const ui = {};
    // teacher switch (in the page head)
    const teacherChk = el('input', { type: 'checkbox' }); teacherChk.checked = !!T.teacher;
    ui.teacherSwitch = el('label', { class: 'teach-switch', title: 'Show the tools for making assignments and reviewing submissions' }, teacherChk, ' Teacher tools');
    teacherChk.addEventListener('change', () => { T.teacher = teacherChk.checked; save(); ctx.renderToolbar(); if (!T.teacher) panel.hidden = true; });
    // toolbar button
    ui.toolbarButton = () => T.teacher ? el('button', { class: 'btn', onclick: () => { panel.hidden = !panel.hidden; if (!panel.hidden) showList(); } }, 'Assignments') : null;

    // ----- the teacher panel
    const panel = el('section', { class: 'teach-panel', hidden: '' });
    ui.panel = panel;
    function showList() {
      panel.innerHTML = '';
      const list = Object.values(T.assignments).sort((a, b) => b.created - a.created);
      panel.append(el('div', { class: 'panel-head' }, el('b', {}, 'Assignments'), el('span', { class: 'spacer' }), el('button', { class: 'btn primary tiny', onclick: () => editAssignment(null) }, '+ New assignment'), el('button', { class: 'btn quiet tiny', onclick: importBox }, 'Import'), el('button', { class: 'btn quiet tiny', onclick: backupAll }, 'Back up all'), el('button', { class: 'btn quiet tiny', onclick: () => { panel.hidden = true; } }, '×')));
      if (!list.length) panel.append(el('p', { class: 'teach-empty' }, 'No assignments yet. An assignment is a task, a starter program and tests; students open it from a link or a QR code, and their submissions come back to you as links.'));
      const tbl = el('table', { class: 'teach-table' }, el('thead', {}, el('tr', {}, el('th', {}, 'Title'), el('th', {}, 'Language'), el('th', {}, 'Tests'), el('th', {}, 'Submissions'), el('th', {}, ''))));
      const tb = el('tbody');
      for (const a of list) {
        const n = Object.keys(T.book[a.id] || {}).length;
        tb.append(el('tr', {}, el('td', {}, el('b', {}, a.title || '(untitled)'), a.due ? el('div', { class: 'muted small' }, 'due ' + a.due) : null), el('td', {}, LANG_LABEL[a.lang]), el('td', {}, String((a.tests || []).length) + ((a.tests || []).some(t => t.hidden) ? ' (' + a.tests.filter(t => t.hidden).length + ' hidden)' : '')), el('td', {}, String(n)),
          el('td', { class: 'teach-actions' }, el('button', { class: 'btn quiet tiny', onclick: () => editAssignment(a.id) }, 'Edit'), el('button', { class: 'btn quiet tiny', onclick: () => shareAssignment(a.id) }, 'Share'), el('button', { class: 'btn quiet tiny', onclick: () => gradeBook(a.id) }, 'Grade book'), el('button', { class: 'btn quiet tiny', onclick: (e) => ctx.armConfirm(e.currentTarget, 'Delete? Click again', () => { delete T.assignments[a.id]; delete T.book[a.id]; save(); showList(); }) }, 'Delete'))));
      }
      tbl.append(tb); if (list.length) panel.append(el('div', { class: 'table-wrap' }, tbl));
      const paste = el('textarea', { class: 'teach-paste', rows: 2, placeholder: 'Paste one or more submission links here (one per line) and press Review' });
      panel.append(el('div', { class: 'teach-review-in' }, el('b', {}, 'Review submissions'), paste, el('button', { class: 'btn tiny', onclick: async () => { const links = paste.value.split(/\s+/).filter(Boolean); if (!links.length) return; paste.value = ''; await reviewLinks(links); } }, 'Review')));
      panel.hidden = false;
    }
    function importBox() {
      panel.innerHTML = '';
      const ta = el('textarea', { class: 'teach-paste', rows: 3, placeholder: 'Paste an assignment link, a back-up link, or the JSON of a back-up' });
      panel.append(el('div', { class: 'panel-head' }, el('b', {}, 'Import'), el('span', { class: 'spacer' }), el('button', { class: 'btn quiet tiny', onclick: showList }, 'Back')), el('p', { class: 'muted small teach-p' }, 'Importing an assignment link made on another device gives you an editable copy. Note that a student link does not contain hidden tests; import from a back-up to keep those.'), ta,
        el('div', { class: 'toolbar' }, el('button', { class: 'btn primary tiny', onclick: async () => { try { const s = ta.value.trim(); let obj; if (s.startsWith('{') || s.startsWith('[')) obj = JSON.parse(s); else { const m = s.match(/[?&](a|b)=([^&#\s]+)/); if (!m) throw new Error('That is not an assignment or back-up link.'); obj = await unpack(m[2]); } const items = Array.isArray(obj) ? obj : (obj.assignments ? Object.values(obj.assignments) : [obj]); let n = 0; for (const a of items) { const na = normalize(a); if (!na) continue; T.assignments[na.id] = na; n++; } save(); ctx.status('imported ' + n + ' assignment' + (n === 1 ? '' : 's')); showList(); } catch (e) { ctx.status('could not import: ' + e.message); } } }, 'Import')));
    }
    // A link that changes what is stored for the teacher (a submission, a back-up) asks first. Otherwise anyone who can get
    // a link in front of a teacher could overwrite assignments (hidden tests included), replace a student's submission, or make
    // the page run a stranger's program, just by being opened.
    function confirmLink(title, lines, yesLabel, onYes) {
      panel.hidden = false; panel.innerHTML = '';
      const done = () => { if (T.teacher) showList(); else panel.hidden = true; };
      panel.append(el('div', { class: 'panel-head' }, el('b', {}, title)), ...lines.map(l => el('p', { class: 'small teach-p' }, l)),
        el('div', { class: 'toolbar' }, el('button', { class: 'btn primary', onclick: async () => { try { await onYes(); } catch (e) { ctx.status('could not finish: ' + e.message); done(); } } }, yesLabel), el('button', { class: 'btn quiet', onclick: done }, 'Cancel')));
    }
    async function backupAll() {
      const link = baseUrl() + '#/lab?b=' + await pack({ v: 1, assignments: T.assignments });
      panel.innerHTML = '';
      panel.append(el('div', { class: 'panel-head' }, el('b', {}, 'Back up'), el('span', { class: 'spacer' }), el('button', { class: 'btn quiet tiny', onclick: showList }, 'Back')),
        el('p', { class: 'muted small teach-p' }, 'Your assignments live only in this browser. Keep this link somewhere safe (a note, an email to yourself): opening it in any Code Lab re-imports every assignment, hidden tests included. The JSON below is the same data in plain form.'),
        linkBox(link), jsonBox(JSON.stringify(Object.values(T.assignments))));
    }
    function jsonBox(text) { const ta = el('textarea', { class: 'teach-paste', rows: 4, readonly: '', 'aria-label': 'Back-up JSON' }); ta.value = text; return ta; }
    function linkBox(link, label) {
      const inp = el('input', { class: 'find-inp teach-link', readonly: '', value: link, 'aria-label': label || 'Link' });
      const copy = el('button', { class: 'btn tiny', onclick: () => { inp.select(); const done = (ok) => { copy.textContent = ok ? 'Copied' : 'Select and copy'; setTimeout(() => { copy.textContent = 'Copy link'; }, 2500); }; if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(() => done(true), () => done(false)); else done(false); } }, 'Copy link');
      return el('div', { class: 'teach-linkbox' }, inp, copy, el('span', { class: 'muted small' }, (link.length / 1024).toFixed(1) + ' KB'));
    }
    function qrBox(link) {
      const box = el('div', { class: 'teach-qr' });
      try { if (!window.QR) throw new Error('no QR'); box.innerHTML = window.QR.svg(link, { ec: 'L', scale: 3 }); box.append(el('div', { class: 'muted small' }, 'Scan with a phone camera to open the link.')); }
      catch (e) { box.append(el('p', { class: 'muted small' }, 'This link is too long for a QR code (about 2.9 KB is the limit). Share the link itself; shortening the instructions or starter code makes the QR possible.')); }
      return box;
    }

    // ----- assignment editor
    function editAssignment(id) {
      const a = id ? T.assignments[id] : { id: newId(), v: 1, title: '', lang: ctx.S.lang, text: '', starter: '', tests: [], hints: [], roster: [], author: T.name || '', due: '', created: Date.now() };
      panel.innerHTML = '';
      const f = {};
      const field = (label, input, note) => el('label', { class: 'teach-field' }, el('span', { class: 'teach-label' }, label), input, note ? el('span', { class: 'muted small' }, note) : null);
      f.title = el('input', { class: 'find-inp wide', value: a.title, placeholder: 'e.g. Leap years' });
      f.lang = el('select', { class: 'teach-select' }, Object.keys(LANG_LABEL).map(l => { const o = el('option', { value: l }, LANG_LABEL[l]); if (l === a.lang) o.selected = true; return o; }));
      f.author = el('input', { class: 'find-inp', value: a.author, placeholder: 'shown to students' });
      f.due = el('input', { class: 'find-inp', value: a.due, placeholder: 'e.g. Friday 10 October' });
      f.text = el('textarea', { class: 'teach-ta', rows: 6, placeholder: 'What the student must do. Blank lines make paragraphs, `backticks` make code, lines starting with "- " make a list.' }); f.text.value = a.text;
      f.starter = el('textarea', { class: 'teach-ta mono', rows: 6, spellcheck: 'false', placeholder: 'The code students start from' }); f.starter.value = a.starter;
      f.hints = el('textarea', { class: 'teach-ta', rows: 3, placeholder: 'One hint per line, shown in order' }); f.hints.value = (a.hints || []).join('\n');
      f.roster = el('textarea', { class: 'teach-ta', rows: 3, placeholder: 'One name per line. If empty, students type their name. The names are carried in the assignment link, so anyone who gets the link can read them.' }); f.roster.value = (a.roster || []).join('\n');
      // tests table
      const rows = [];
      const testsBody = el('tbody');
      const addRow = (t) => {
        t = t || { k: 'stdin', in: '', expect: '', hidden: false };
        const kind = el('select', { class: 'teach-select' }, el('option', { value: 'stdin' }, 'input → output'), el('option', { value: 'call' }, 'call → value')); kind.value = t.k;
        const inp = el('textarea', { class: 'teach-ta mono', rows: 1, spellcheck: 'false' }); inp.value = t.in;
        const exp = el('textarea', { class: 'teach-ta mono', rows: 1, spellcheck: 'false' }); exp.value = t.expect;
        const hid = el('input', { type: 'checkbox' }); hid.checked = !!t.hidden;
        const tr = el('tr', {}, el('td', {}, kind), el('td', {}, inp), el('td', {}, exp), el('td', { class: 'center' }, hid), el('td', {}, el('button', { class: 'btn quiet tiny', onclick: () => { tr.remove(); rows.splice(rows.indexOf(row), 1); } }, '×')));
        const row = { kind, inp, exp, hid, tr }; rows.push(row); testsBody.append(tr);
      };
      (a.tests || []).forEach(addRow); if (!a.tests || !a.tests.length) addRow();
      const testsTable = el('table', { class: 'teach-table tests' }, el('thead', {}, el('tr', {}, el('th', {}, 'Kind'), el('th', {}, 'Input given / expression called'), el('th', {}, 'Expected output / value'), el('th', {}, 'Hidden'), el('th', {}, ''))), testsBody);
      const collect = () => ({
        id: a.id, v: 1, title: f.title.value.trim(), lang: f.lang.value, text: f.text.value, starter: f.starter.value, author: f.author.value.trim(), due: f.due.value.trim(), created: a.created,
        hints: f.hints.value.split('\n').map(s => s.trim()).filter(Boolean), roster: f.roster.value.split('\n').map(s => s.trim()).filter(Boolean),
        tests: rows.map(r => ({ k: r.kind.value, in: r.inp.value.replace(/\r/g, ''), expect: r.exp.value.replace(/\r/g, ''), hidden: r.hid.checked })).filter(t => t.in !== '' || t.expect !== '')
      });
      const tryOut = el('div', { class: 'verdict', hidden: '', role: 'status' });
      const saveBtn = el('button', { class: 'btn primary', onclick: () => { const na = collect(); if (!na.title) { f.title.focus(); ctx.status('give the assignment a title'); return; } T.assignments[a.id] = na; T.name = na.author; save(); ctx.status('saved'); shareAssignment(a.id); } }, 'Save');
      const tryBtn = el('button', { class: 'btn', title: 'Run these tests on the code in the editor (write your own solution there first)', onclick: async () => { const na = collect(); tryOut.hidden = false; tryOut.innerHTML = ''; const r = await ctx.grade(toEx(na, true), ctx.editor.value); ctx.renderVerdict(tryOut, r, toEx(na, true), 1); } }, 'Run tests on the editor code');
      panel.append(el('div', { class: 'panel-head' }, el('b', {}, id ? 'Edit assignment' : 'New assignment'), el('span', { class: 'spacer' }), el('button', { class: 'btn quiet tiny', onclick: showList }, 'Back to the list')),
        el('div', { class: 'teach-grid' }, field('Title', f.title), field('Language', f.lang), field('Teacher', f.author), field('Due', f.due)),
        field('Instructions', f.text),
        field('Starter code', f.starter, ''), el('div', { class: 'toolbar' }, el('button', { class: 'btn quiet tiny', onclick: () => { f.starter.value = ctx.editor.value; } }, 'Use the editor code as the starter'), el('button', { class: 'btn quiet tiny', onclick: () => { ctx.editor.value = f.starter.value; } }, 'Put the starter in the editor')),
        el('div', { class: 'teach-field' }, el('span', { class: 'teach-label' }, 'Tests'), el('span', { class: 'muted small' }, 'Input → output: the program is run with the input (one value per line) and must print exactly the output. Call → value: for a function the student writes, e.g. is_leap(2024) → True (Python shows strings in quotes: \'yes\'). Hidden tests are never sent to students; they run only when you review a submission.')),
        el('div', { class: 'table-wrap' }, testsTable), el('div', { class: 'toolbar' }, el('button', { class: 'btn quiet tiny', onclick: () => addRow() }, '+ Add test'), tryBtn), tryOut,
        el('div', { class: 'teach-grid' }, field('Hints', f.hints), field('Class roster', f.roster)),
        el('div', { class: 'toolbar' }, saveBtn));
    }
    async function shareAssignment(id) {
      const a = T.assignments[id]; if (!a) return;
      panel.innerHTML = '';
      const link = baseUrl() + '#/assign?a=' + await pack(studentCopy(a));
      panel.append(el('div', { class: 'panel-head' }, el('b', {}, 'Share: ' + a.title), el('span', { class: 'spacer' }), el('button', { class: 'btn quiet tiny', onclick: () => editAssignment(id) }, 'Edit'), el('button', { class: 'btn quiet tiny', onclick: showList }, 'Back to the list')),
        el('p', { class: 'muted small teach-p' }, 'Students open this link (or scan the code) in any browser. It carries the task, starter and visible tests' + (a.tests.some(t => t.hidden) ? '; the ' + a.tests.filter(t => t.hidden).length + ' hidden test' + (a.tests.filter(t => t.hidden).length === 1 ? ' stays' : 's stay') + ' here with you' : '') + '. Post it in Google Classroom, email it, or put the QR code on the projector.'),
        linkBox(link, 'Assignment link'), qrBox(link),
        el('div', { class: 'toolbar' }, el('a', { class: 'btn quiet tiny', href: link }, 'Preview as a student')));
    }

    // ----- student side: a file that belongs to an assignment
    ui.assignmentBar = (file) => {
      const a = file.asg && T.received[file.asg]; if (!a) return null;
      const bar = el('div', { class: 'ex-bar asg-bar' });
      const ex = toEx(a, false);
      const instr = el('div', { class: 'prose ex-prompt', html: textToHtml(a.text) + (a.hints && a.hints.length ? '' : '') });
      instr.hidden = !!file.asgSeen;
      const verdict = el('div', { class: 'verdict', hidden: '', role: 'status' }); let attempts = 0, hintIdx = 0;
      const hintBox = el('div', { class: 'hints' });
      const check = el('button', { class: 'btn primary', onclick: async () => { if (!ex.tests.length) { verdict.hidden = false; verdict.className = 'verdict'; verdict.textContent = 'This assignment has no visible tests; run your program and read the task carefully, then submit.'; return; } check.disabled = true; attempts++; verdict.hidden = false; verdict.innerHTML = ''; const r = await ctx.grade(ex, ctx.editor.value); ctx.renderVerdict(verdict, r, ex, attempts); file.lastCheck = { passed: r.results ? r.results.filter(x => x.ok).length : 0, total: r.results ? r.results.length : 0, at: Date.now() }; ctx.save(); check.disabled = false; } }, 'Check');
      const hintBtn = el('button', { class: 'btn quiet', onclick: () => { if (hintIdx < a.hints.length) hintBox.append(el('p', { class: 'hint' }, el('b', {}, 'Hint ' + (hintIdx + 1) + '. '), a.hints[hintIdx++])); hintBtn.textContent = hintIdx < a.hints.length ? 'Hint (' + (a.hints.length - hintIdx) + ' left)' : 'No more hints'; hintBtn.disabled = hintIdx >= a.hints.length; } }, a.hints.length ? 'Hint (' + a.hints.length + ')' : 'No hints');
      if (!a.hints.length) hintBtn.disabled = true;
      const submitBox = el('div', { class: 'submit-box', hidden: '' });
      const submitBtn = el('button', { class: 'btn', onclick: () => { submitBox.hidden = !submitBox.hidden; if (!submitBox.hidden) renderSubmit(); } }, 'Submit');
      function renderSubmit() {
        submitBox.innerHTML = '';
        let nameInp;
        if (a.roster && a.roster.length) { nameInp = el('select', { class: 'teach-select' }, el('option', { value: '' }, 'Choose your name…'), a.roster.map(n => el('option', { value: n }, n))); if (T.studentName && a.roster.includes(T.studentName)) nameInp.value = T.studentName; }
        else { nameInp = el('input', { class: 'find-inp', placeholder: 'Your name', value: T.studentName || '' }); }
        const outBox = el('div');
        const make = el('button', { class: 'btn primary tiny', onclick: async () => {
          const name = nameInp.value.trim(); if (!name) { nameInp.focus(); return; }
          T.studentName = name; save();
          const sub = { v: 1, a: a.id, t: a.title, name, code: ctx.editor.value, at: Date.now(), check: file.lastCheck || null };
          const link = baseUrl() + '#/review?s=' + await pack(sub);
          outBox.innerHTML = '';
          outBox.append(el('p', { class: 'small' }, 'This link is your submission. Send it to your teacher the way your class shares work (Google Classroom, email, a message). It contains your program exactly as it is now; submit again if you change it.'), linkBox(link, 'Submission link'), qrBox(link));
        } }, 'Make my submission link');
        submitBox.append(el('div', { class: 'toolbar' }, el('span', { class: 'small' }, 'Name:'), nameInp, make), outBox);
      }
      bar.append(
        el('div', { class: 'ex-bar-text' }, el('span', { class: 'ex-label' }, 'Assignment'), ' ', el('b', {}, a.title), el('span', { class: 'ex-bar-where' }, (a.author ? ' · ' + a.author : '') + (a.due ? ' · due ' + a.due : '') + ' · ' + ex.tests.length + ' visible test' + (ex.tests.length === 1 ? '' : 's'))),
        el('div', { class: 'toolbar' }, check, submitBtn, el('button', { class: 'btn quiet', onclick: () => { instr.hidden = !instr.hidden; file.asgSeen = true; ctx.save(); } }, 'Task'), hintBtn, el('button', { class: 'btn quiet', title: 'Put the starter code back', onclick: (e) => ctx.armConfirm(e.currentTarget, 'Replace your code with the starter?', () => { ctx.editor.value = a.starter; }) }, 'Reset to starter')),
        instr, verdict, hintBox, submitBox);
      file.asgSeen = true; ctx.save();
      return bar;
    };

    // ----- handling links: assignment (student), submission (teacher), back-up
    ui.handleQuery = async (kind, query) => {
      const q = new URLSearchParams(query);
      try {
        if (kind === 'assign' && q.get('a')) {
          const a = normalize(await unpack(q.get('a'))); if (!a) throw new Error('not an assignment');
          for (const t of a.tests) t.hidden = false;   // a student link never carries hidden tests; do not trust one that claims to
          T.received[a.id] = a; save();
          ctx.openAssignmentFile(a);
          ctx.status('assignment opened: ' + a.title);
        } else if (kind === 'review' && q.get('s')) {
          const sub = cleanSub(await unpack(q.get('s')));
          const mine = T.assignments[sub.a], had = (T.book[sub.a] || {})[sub.name];
          confirmLink('A submission link was opened', [
            sub.name + ' submitted ' + (sub.t ? '\u201c' + sub.t + '\u201d' : 'an assignment') + ' (' + sub.code.length + ' characters of code).',
            mine ? 'You have this assignment, so the tests (hidden ones too) will be run on the program now. The program is run on this device.' : 'You do not have this assignment on this device, so the tests cannot be run; the code will only be stored.',
            had ? 'This replaces the submission from ' + sub.name + ' that is already in the grade book.' : 'It will be added to the grade book.',
            T.teacher ? '' : 'Opening it also turns on the teacher tools.',
            'Anyone can make a link with any name in it, so only continue if you expect this submission.'
          ].filter(Boolean), 'Add it and run the tests', () => reviewSubmission(sub, true));
        } else if (q.get('b')) {
          const b = await unpack(q.get('b'));
          const list = Object.values((b && b.assignments && typeof b.assignments === 'object') ? b.assignments : {}).map(normalize).filter(Boolean);
          if (!list.length) throw new Error('that back-up holds no assignments');
          const clash = list.filter(a => T.assignments[a.id]);
          confirmLink('A back-up link was opened', [
            'It holds ' + list.length + ' assignment' + (list.length === 1 ? '' : 's') + ' (' + list.map(a => a.title || '(untitled)').slice(0, 6).join(', ') + (list.length > 6 ? ', \u2026' : '') + '), with their hidden tests.',
            clash.length ? clash.length + ' of them ' + (clash.length === 1 ? 'has' : 'have') + ' the same id as an assignment you already have, and would REPLACE it (tests included).' : 'None of them clashes with an assignment you already have.',
            'Only continue if you made this back-up yourself.'
          ], 'Restore these assignments', () => { for (const a of list) T.assignments[a.id] = a; T.teacher = true; save(); ctx.renderToolbar(); ctx.status('restored ' + list.length + ' assignment' + (list.length === 1 ? '' : 's')); showList(); });
        }
      } catch (e) { ctx.status('could not open that link: ' + e.message); }
      history.replaceState(null, '', '#/lab');
    };
    async function reviewLinks(links) {
      let n = 0, bad = 0, last = null;
      for (const l of links) { const m = l.match(/[?&]s=([^&#\s]+)/); if (!m) { bad++; continue; } try { const sub = cleanSub(await unpack(m[1])); await reviewSubmission(sub, false); last = sub; n++; } catch (e) { bad++; } }
      ctx.status(n + ' submission' + (n === 1 ? '' : 's') + ' reviewed' + (bad ? '; ' + bad + ' could not be read (is each one a complete submission link?)' : ''));
      if (last) gradeBook(last.a); else showList();
    }
    async function runAll(a, code) {
      // Visible and hidden tests are graded separately: a grader may return its results in a different order from the tests.
      const vex = toEx(a, false), hex = toEx(a, 'hidden');
      if (!vex.tests.length && !hex.tests.length) return { passed: 0, total: 0, hiddenPassed: 0, hiddenTotal: 0, results: [], error: null };
      const vr = vex.tests.length ? await ctx.grade(vex, code) : { results: [] };
      const hr = hex.tests.length ? await ctx.grade(hex, code) : { results: [] };
      const vres = vr.results || [], hres = hr.results || [];
      const res = vres.concat(hres);
      const total = vex.tests.length + hex.tests.length;   // tests that could not run (syntax error...) still count
      return { passed: res.filter(x => x.ok).length, total, visPassed: vres.filter(x => x.ok).length, visTotal: vex.tests.length, hiddenPassed: hres.filter(x => x.ok).length, hiddenTotal: hex.tests.length, error: vr.error || hr.error || null, results: res };
    }
    async function reviewSubmission(sub, show) {
      const a = T.assignments[sub.a];
      sub = cleanSub(sub);
      const entry = { name: sub.name, at: sub.at, code: sub.code, reviewed: Date.now(), claimed: sub.check || null, title: sub.t };
      if (a) entry.result = await runAll(a, sub.code);
      T.book[sub.a] = T.book[sub.a] || dict(); T.book[sub.a][sub.name] = entry; save();
      if (show) { T.teacher = true; save(); ctx.renderToolbar(); showSubmission(sub.a, sub.name); }
    }
    function showSubmission(aid, name) {
      const a = T.assignments[aid], e = (T.book[aid] || {})[name]; if (!e) return;
      panel.innerHTML = ''; panel.hidden = false;
      const head = el('div', { class: 'panel-head' }, el('b', {}, (e.title || (a && a.title) || 'Submission') + ' — ' + name), el('span', { class: 'spacer' }), el('button', { class: 'btn quiet tiny', onclick: () => gradeBook(aid) }, 'Grade book'), el('button', { class: 'btn quiet tiny', onclick: showList }, 'Assignments'));
      panel.append(head, el('p', { class: 'muted small teach-p' }, 'Submitted ' + fmtDate(e.at) + (e.claimed ? ' · the student\u2019s last check showed ' + e.claimed.passed + ' of ' + e.claimed.total : '') + (a ? '' : ' · You do not have this assignment on this device, so the tests could not be run. Import it from a back-up link, then re-check.')));
      if (e.result) {
        const r = e.result; const v = el('div', { class: 'verdict ' + (r.total && r.passed === r.total ? 'pass' : 'fail') });
        v.append(el('p', { class: 'v-title' }, r.total ? r.passed + ' of ' + r.total + ' tests passed' + (r.hiddenTotal ? ' (' + r.hiddenPassed + ' of ' + r.hiddenTotal + ' hidden)' : '') : 'No tests in this assignment'));
        if (r.error) v.append(el('p', { class: 'v-tip' }, r.error));
        const ul = el('ul', { class: 't-list' }); for (const t of r.results) ul.append(el('li', { class: t.ok ? 'ok' : 'bad' }, el('span', { class: 't-name' }, (t.ok ? '✓ ' : '✗ ') + t.name), t.ok ? null : el('div', { class: 't-detail' }, 'expected ', el('code', {}, String(t.expected)), ' got ', el('code', {}, String(t.got == null ? (t.err || '') : t.got))))); v.append(ul);
        panel.append(v);
      }
      const diff = a ? lineDiff(a.starter || '', e.code) : null;
      panel.append(el('div', { class: 'teach-code-head' }, el('b', {}, 'Submitted code'), diff ? el('span', { class: 'muted small' }, ' · lines added or changed from the starter are marked') : null),
        el('pre', { class: 'code teach-code', html: diff ? diff : esc(e.code) }),
        el('div', { class: 'toolbar' }, el('button', { class: 'btn quiet tiny', onclick: () => ctx.openReviewFile(a ? a.lang : ctx.S.lang, name + '-' + aid, e.code) }, 'Open in the editor'), a ? el('button', { class: 'btn quiet tiny', onclick: async () => { e.result = await runAll(a, e.code); e.reviewed = Date.now(); save(); showSubmission(aid, name); } }, 'Re-check') : null));
    }
    function lineDiff(oldText, newText) {
      const A = oldText.replace(/\r/g, '').split('\n'), B = newText.replace(/\r/g, '').split('\n');
      const n = A.length, m = B.length; if (n * m > 250000) return esc(newText);
      const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
      for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
      const out = []; let i = 0, j = 0;
      while (i < n && j < m) { if (A[i] === B[j]) { out.push(esc(B[j])); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else { out.push('<span class="diff-add">' + esc(B[j]) + '</span>'); j++; } }
      while (j < m) { out.push('<span class="diff-add">' + esc(B[j]) + '</span>'); j++; }
      return out.join('\n');
    }
    function gradeBook(aid) {
      const a = T.assignments[aid]; const book = T.book[aid] || {};
      panel.innerHTML = ''; panel.hidden = false;
      panel.append(el('div', { class: 'panel-head' }, el('b', {}, 'Grade book: ' + (a ? a.title : aid)), el('span', { class: 'spacer' }), el('button', { class: 'btn quiet tiny', onclick: async () => { if (!a) return; for (const e of Object.values(book)) e.result = await runAll(a, e.code); save(); gradeBook(aid); } }, 'Re-check all'), el('button', { class: 'btn quiet tiny', onclick: () => exportCsv(aid) }, 'Export CSV'), el('button', { class: 'btn quiet tiny', onclick: showList }, 'Assignments')));
      const names = Object.keys(book).sort((x, y) => x.localeCompare(y));
      if (!names.length) panel.append(el('p', { class: 'teach-empty' }, 'No submissions yet. Paste submission links on the Assignments screen, or open a submission link directly.'));
      else {
        const tbl = el('table', { class: 'teach-table' }, el('thead', {}, el('tr', {}, el('th', {}, 'Student'), el('th', {}, 'Submitted'), el('th', {}, 'Tests'), el('th', {}, 'Hidden'), el('th', {}, ''))));
        const tb = el('tbody');
        for (const nm of names) { const e = book[nm], r = e.result; tb.append(el('tr', { class: r && r.total && r.passed === r.total ? 'row-pass' : '' }, el('td', {}, el('b', {}, nm)), el('td', {}, fmtDate(e.at)), el('td', {}, r ? r.passed + ' / ' + r.total : (e.claimed ? '(student saw ' + e.claimed.passed + '/' + e.claimed.total + ')' : '—')), el('td', {}, r && r.hiddenTotal ? r.hiddenPassed + ' / ' + r.hiddenTotal : '—'), el('td', { class: 'teach-actions' }, el('button', { class: 'btn quiet tiny', onclick: () => showSubmission(aid, nm) }, 'Open'), el('button', { class: 'btn quiet tiny', onclick: (ev) => ctx.armConfirm(ev.currentTarget, 'Remove?', () => { delete book[nm]; save(); gradeBook(aid); }) }, 'Remove')))); }
        tbl.append(tb); panel.append(el('div', { class: 'table-wrap' }, tbl));
        if (a && a.roster && a.roster.length) { const missing = a.roster.filter(n => !book[n]); if (missing.length) panel.append(el('p', { class: 'muted small teach-p' }, 'Not yet submitted: ' + missing.join(', '))); }
      }
      const paste = el('textarea', { class: 'teach-paste', rows: 2, placeholder: 'Paste submission links here (one per line)' });
      panel.append(el('div', { class: 'teach-review-in' }, paste, el('button', { class: 'btn tiny', onclick: async () => { const links = paste.value.split(/\s+/).filter(Boolean); paste.value = ''; await reviewLinks(links); gradeBook(aid); } }, 'Review')));
    }
    function exportCsv(aid) {
      const a = T.assignments[aid]; const book = T.book[aid] || {};
      const q = (s) => { s = String(s == null ? '' : s); if (/^[=+\-@\t\r]/.test(s) && isNaN(Number(s))) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
      const lines = [['student', 'submitted', 'tests passed', 'tests total', 'hidden passed', 'hidden total', 'percent'].map(q).join(',')];
      for (const nm of Object.keys(book).sort()) { const e = book[nm], r = e.result || {}; lines.push([nm, fmtDate(e.at), r.passed, r.total, r.hiddenPassed, r.hiddenTotal, r.total ? Math.round(100 * r.passed / r.total) : ''].map(q).join(',')); }
      const csv = lines.join('\n');
      const ta = el('textarea', { class: 'teach-paste', rows: 6, readonly: '' }); ta.value = csv;
      const old = panel.querySelector('.csv-box'); if (old) old.remove();
      panel.append(el('div', { class: 'teach-field csv-box' }, el('span', { class: 'teach-label' }, 'CSV (select all and copy into a spreadsheet, or download)'), ta, el('div', { class: 'toolbar' }, el('button', { class: 'btn tiny', onclick: () => { const blob = new Blob([csv], { type: 'text/csv' }); const link = el('a', { href: URL.createObjectURL(blob), download: (a ? a.title.replace(/[^a-z0-9]+/gi, '_') : aid) + '.csv' }); document.body.append(link); link.click(); link.remove(); } }, 'Download CSV'))));
      ta.scrollIntoView && ta.scrollIntoView({ block: 'nearest' });
    }

    ui.showList = showList;
    return ui;
  }
  window.TEACH = { mount, pack, unpack, textToHtml, studentCopy, toEx, normalize, cleanSub, dict, ID_RE };
})();
