/* Student portfolio (#/portfolio): everything a student has completed on this device, as one
   document they can print, download as a web page, or send to a teacher as a link.
   A received link (#/portfolio?p=<packed>) is shown read-only, and the teacher can re-run every
   exercise's own tests on her computer, so a ✓ in the portfolio never has to be taken on trust.
   Exposed as window.PORTFOLIO { page(query), collect(settings), renderDoc(P, opts), exerciseIndex() }. */
(function () {
  'use strict';
  const KEY = 'shortcourses.portfolio.v1';
  const A = () => window.__app.internal;
  const el = (...a) => A().el(...a);
  const baseUrl = () => location.href.split('#')[0];
  const LANG_NAME = { python: 'Python', cpp: 'C++', java: 'Java', scheme: 'Scheme', lisp: 'Scheme' };
  const LANG_EXT = { python: 'py', cpp: 'cpp', java: 'java', scheme: 'scm', lisp: 'scm' };

  // ---------- settings (this device) ----------
  let S = null;
  function load() {
    if (S) return S;
    try { S = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { S = null; }
    if (!S) {
      S = { name: '', note: '', unfinished: false, tasks: false, lab: [] };
      try { const t = JSON.parse(localStorage.getItem('shortcourses.teach.v1') || 'null'); if (t && t.studentName) S.name = t.studentName; } catch (e) { }
    }
    S.lab = S.lab || [];
    return S;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }

  // ---------- where every exercise lives ----------
  let INDEX = null;
  function exerciseIndex() {
    if (INDEX) return INDEX;
    INDEX = Object.create(null);   // keyed by ids that come from a link: no prototype, so "constructor" and "__proto__" are not exercises
    for (const course of window.COURSES) course.lessons.forEach((lesson, li) => {
      for (const b of lesson.blocks) if (b && b.ex) INDEX[b.ex.id] = { ex: Object.assign({}, b.ex, { lang: b.ex.lang || course.lang, runtime: b.ex.runtime || course.runtime }), course, lessonIdx: li, lesson };
    });
    return INDEX;
  }
  const isMath = (ex) => !!(window.MATHGRADE && window.MATHGRADE.isMath(ex));
  function parseAnswers(code) { try { const a = JSON.parse(code); return Array.isArray(a) ? a : null; } catch (e) { return null; } }
  // The lesson page saves a choice exercise as [[indices]] and the grader takes [indices].
  function answersFor(ex, code) { const a = parseAnswers(code) || []; return ex.kind === 'choice' ? a.flat().map(Number) : a; }
  function started(ex, code) {
    if (code == null) return false;
    if (isMath(ex)) { const a = parseAnswers(code); return !!(a && a.flat().some(v => v != null && String(v).trim() !== '')); }
    return code.trim() !== '' && code.trim() !== String(ex.starter || '').trim();
  }
  function labState() { try { return JSON.parse(localStorage.getItem('shortcourses.lab.v1') || 'null') || {}; } catch (e) { return {}; } }
  function labFiles() {   // every Code Lab file except copies of course exercises
    const L = labState(); const out = [];
    for (const lang of Object.keys(L.files || {})) for (const f of L.files[lang] || []) if (f && !f.ex && (f.code || '').trim()) out.push({ key: lang + '/' + f.name, lang, name: f.name, code: f.code, asg: !!f.asg });
    return out;
  }
  function labCodeFor(exId) {
    const L = labState();
    for (const lang of Object.keys(L.files || {})) for (const f of L.files[lang] || []) if (f && f.ex && f.ex.id === exId && (f.code || '').trim()) return f.code;
    return null;
  }

  // ---------- the portfolio object (also what travels in the link) ----------
  // P = { v, name, note, made, tasks, items: [{ id, done, code }], lab: [{ lang, name, code }] }
  function collect(settings) {
    const s = settings || load();
    const d = A().Progress.load(); const pass = d.pass || {};
    const items = [];
    for (const id of Object.keys(exerciseIndex())) {
      const { ex } = INDEX[id];
      if (d.done[id]) {
        let code = pass[id] != null ? pass[id] : d.code[id];
        if (code == null && !isMath(ex)) code = labCodeFor(id);
        items.push({ id, done: d.done[id], code: code == null ? '' : code });
      } else if (s.unfinished && started(ex, d.code[id])) items.push({ id, done: 0, code: d.code[id] });
    }
    const pick = new Set(s.lab || []);
    const lab = labFiles().filter(f => pick.has(f.key)).map(f => ({ lang: f.lang, name: f.name, code: f.code }));
    return { v: 1, name: (s.name || '').trim(), note: (s.note || '').trim(), made: Date.now(), tasks: !!s.tasks, items, lab };
  }

  // ---------- rendering ----------
  const fmtDate = (t) => { try { return new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return ''; } };
  function codeBlock(code, lang) {
    return el('pre', { class: 'code pf-code' }, el('code', { html: A().highlight(String(code || '').replace(/\s+$/, ''), lang === 'lisp' ? 'scheme' : lang) }));
  }
  function paragraphs(text) {
    return String(text).split(/\n\s*\n/).map(p => el('p', {}, ...p.split('\n').flatMap((line, i) => i ? [el('br'), line] : [line])));
  }
  function mathAnswers(ex, code) {
    const a = parseAnswers(code);
    const blank = (v) => (v == null || String(v).trim() === '') ? el('span', { class: 'pf-empty' }, 'no answer') : el('code', {}, String(v));
    if (!a) return el('p', { class: 'pf-empty' }, 'No answer saved.');
    if (ex.kind === 'answer') {
      return el('dl', { class: 'pf-answers' }, ex.parts.map((p, i) => [el('dt', { html: p.label || ('Answer ' + (ex.parts.length > 1 ? i + 1 : '')).trim() }), el('dd', {}, blank(a[i]), p.unit ? el('span', { html: ' ' + p.unit }) : null)]));
    }
    if (ex.kind === 'choice') {
      const chosen = a.flat().map(Number).filter(i => ex.options[i]);
      if (!chosen.length) return el('p', { class: 'pf-empty' }, 'No option chosen.');
      return el('ul', { class: 'pf-choices' }, chosen.map(i => el('li', {}, el('span', { class: 'choice-letter' }, String.fromCharCode(65 + i) + '.'), ' ', el('span', { html: ex.options[i].text }))));
    }
    if (ex.kind === 'table') {
      let k = 0;
      const t = el('table', { class: 'fill pf-table' });
      if (ex.head) t.append(el('thead', {}, el('tr', {}, ex.head.map(h => el('th', { html: h })))));
      t.append(el('tbody', {}, ex.rows.map(row => el('tr', {}, row.map(c => (c && typeof c === 'object') ? el('td', { class: 'blank' }, blank(a[k++])) : el('td', { html: c == null ? '' : String(c) }))))));
      return el('div', { class: 'table-wrap' }, t);
    }
    return el('p', { class: 'pf-empty' }, 'This kind of answer cannot be shown.');
  }
  function itemBlock(item, P) {
    const found = INDEX[item.id]; const ex = found.ex;
    const box = el('article', { class: 'pf-item' + (item.done ? ' done' : ' open'), id: 'pf-' + item.id });
    box.append(el('header', { class: 'pf-item-head' },
      el('h4', {}, ex.title),
      el('span', { class: 'pf-status' }, item.done ? ['Completed', fmtDate(item.done) ? ' ' + fmtDate(item.done) : ''] : 'Not finished yet')));
    if (P.tasks) box.append(el('div', { class: 'prose pf-task', html: ex.prompt }));
    box.append(isMath(ex) ? mathAnswers(ex, item.code) : (item.code ? codeBlock(item.code, ex.lang) : el('p', { class: 'pf-empty' }, 'The program was not saved on this device.')));
    box.append(el('div', { class: 'pf-check', hidden: '' }));
    return box;
  }
  function renderDoc(P, opts) {
    exerciseIndex(); opts = opts || {};
    const doc = el('div', { class: 'pf-doc' });
    const known = P.items.filter(it => INDEX[it.id]); const unknown = P.items.filter(it => !INDEX[it.id]);
    doc.append(el('header', { class: 'pf-head' },
      el('p', { class: 'pf-school' }, window.SITE.name),
      el('h1', {}, P.name ? 'Portfolio of ' + P.name : 'Portfolio'),
      el('p', { class: 'pf-made' }, 'Made on ' + fmtDate(P.made))));
    if (P.note) doc.append(el('div', { class: 'pf-note' }, paragraphs(P.note)));
    // summary
    const rows = window.COURSES.map(c => {
      const ids = c.lessons.flatMap(L => L.blocks.filter(b => b && b.ex).map(b => b.ex.id));
      const done = known.filter(it => it.done && INDEX[it.id].course === c).length;
      return el('tr', { 'data-course': c.id }, el('td', { class: 'pf-code-cell' }, c.code), el('td', {}, c.title), el('td', { class: 'pf-num' }, done + ' of ' + ids.length));
    });
    doc.append(el('div', { class: 'table-wrap' }, el('table', { class: 'pf-summary' },
      el('thead', {}, el('tr', {}, el('th', {}, 'Course'), el('th', {}), el('th', { class: 'pf-num' }, 'Exercises completed'))),
      el('tbody', {}, rows, P.lab && P.lab.length ? el('tr', {}, el('td', { class: 'pf-code-cell' }, 'LAB'), el('td', {}, 'Programs from the Code Lab'), el('td', { class: 'pf-num' }, String(P.lab.length))) : null))));
    doc.append(el('div', { class: 'pf-verdict', hidden: '', role: 'status' }));
    if (!known.length && !(P.lab && P.lab.length)) doc.append(el('p', { class: 'pf-none' }, opts.own ? 'Nothing here yet. Every exercise you complete in a course is added to this page automatically; so are Code Lab programs you tick above.' : 'This portfolio has no work in it.'));
    // courses
    for (const c of window.COURSES) {
      const mine = known.filter(it => INDEX[it.id].course === c);
      if (!mine.length) continue;
      const sec = el('section', { class: 'pf-course', 'data-course': c.id }, el('h2', {}, el('span', { class: 'pf-ccode' }, c.code), ' ', c.title));
      c.lessons.forEach((L, li) => {
        const here = mine.filter(it => INDEX[it.id].lessonIdx === li);
        if (!here.length) return;
        sec.append(el('div', { class: 'pf-lesson' }, el('h3', {}, el('span', { class: 'pf-lnum' }, 'Lesson ' + (li + 1)), ' ', L.title), here.map(it => itemBlock(it, P))));
      });
      doc.append(sec);
    }
    if (P.lab && P.lab.length) {
      doc.append(el('section', { class: 'pf-course pf-labsec' }, el('h2', {}, 'Programs from the Code Lab'),
        P.lab.map(f => el('article', { class: 'pf-item' }, el('header', { class: 'pf-item-head' }, el('h4', {}, f.name), el('span', { class: 'pf-status' }, LANG_NAME[f.lang] || f.lang)), codeBlock(f.code, f.lang)))));
    }
    if (unknown.length) {
      doc.append(el('section', { class: 'pf-course' }, el('h2', {}, 'Other work'),
        el('p', { class: 'pf-empty' }, 'These exercises are not in this version of the courses (lessons may have been renumbered since the portfolio was made).'),
        unknown.map(it => el('article', { class: 'pf-item' }, el('header', { class: 'pf-item-head' }, el('h4', {}, it.id), el('span', { class: 'pf-status' }, it.done ? 'Completed ' + fmtDate(it.done) : 'Not finished yet')), el('pre', { class: 'code pf-code' }, el('code', {}, it.code || ''))))));
    }
    return doc;
  }

  // ---------- re-checking on this computer (teacher side) ----------
  async function checkAll(P, doc, btn, status) {
    exerciseIndex();
    const items = P.items.filter(it => INDEX[it.id]);
    let pass = 0, n = 0; const claimedBad = [];
    btn.disabled = true;
    for (const it of items) {
      n++; status.textContent = 'Checking ' + n + ' of ' + items.length + '…';
      const { ex } = INDEX[it.id]; let r;
      try { r = isMath(ex) ? window.MATHGRADE.grade(ex, answersFor(ex, it.code)) : await A().grade(ex, it.code || '', ex.runtime === 'full' ? status.parentElement || doc : undefined); }
      catch (e) { r = { passed: false, error: String(e && e.message || e), results: [] }; }
      const box = [...doc.querySelectorAll('.pf-item')].find(b => b.id === 'pf-' + it.id), slot = box && box.querySelector('.pf-check');
      if (it.done) { if (r.passed) pass++; else claimedBad.push(it); }
      if (slot) {
        slot.hidden = false; slot.className = 'pf-check ' + (r.passed ? 'ok' : 'bad');
        const res = r.results || []; const k = res.filter(x => x.ok).length;
        slot.textContent = r.passed ? 'Checked on this computer: passes' + (res.length && !isMath(ex) ? ' all ' + res.length + ' tests.' : '.')
          : 'Checked on this computer: does not pass' + (r.error ? ' (the program stops with an error).' : res.length ? ' (' + k + ' of ' + res.length + (isMath(ex) ? ' parts right).' : ' tests pass).') : '.');
      }
      await new Promise(res => setTimeout(res, 0));
    }
    const v = doc.querySelector('.pf-verdict'); v.hidden = false; v.innerHTML = '';
    v.className = 'pf-verdict ' + (claimedBad.length ? 'bad' : 'ok');
    const nDone = items.filter(it => it.done).length;
    v.append(...[el('p', {}, el('b', {}, nDone === 1 ? (pass ? 'The completed exercise passes' : 'The completed exercise does not pass') + ' when checked on this computer.' : pass + ' of ' + nDone + ' completed exercises pass when checked on this computer.'), ' ',
      claimedBad.length ? 'Marked completed but not passing here: ' : (nDone ? 'Every exercise marked completed passes.' : '')),
      claimedBad.length ? el('ul', {}, claimedBad.map(it => el('li', {}, el('a', { href: '#pf-' + it.id, onclick: (e) => { e.preventDefault(); const t = document.getElementById('pf-' + it.id); if (t) t.scrollIntoView({ block: 'start' }); } }, INDEX[it.id].course.code + ', Lesson ' + (INDEX[it.id].lessonIdx + 1) + ': ' + INDEX[it.id].ex.title)))) : null].filter(Boolean));
    status.textContent = 'Checked ' + fmtDate(Date.now()) + '.';
    btn.disabled = false; btn.textContent = 'Check again';
  }

  // ---------- saving: print, a standalone web page, a link ----------
  function download(doc, P) {
    // The site's typefaces are embedded in its stylesheet (about half a megabyte). A saved portfolio leaves them out and uses the reader's own
    // serif, sans and monospace fonts, which the stylesheet already falls back to, so the file stays small.
    const css = [...document.querySelectorAll('style')].map(s => s.textContent).join('\n').replace(/@font-face\s*\{[^}]*\}/g, '');
    const title = P.name ? 'Portfolio of ' + P.name : 'Portfolio';
    const clone = doc.cloneNode(true); clone.querySelectorAll('.pf-check[hidden], .pf-verdict[hidden]').forEach(n => n.remove());
    const html = '<!DOCTYPE html>\n<html lang="en" data-theme="light">\n<head>\n<meta charset="utf-8">\n<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'none\'; style-src \'unsafe-inline\'; font-src \'none\'; img-src data:">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>' + A().esc(title) + '</title>\n<style>\n' + css + '\n</style>\n</head>\n<body>\n<main class="pf pf-standalone">\n' + clone.outerHTML + '\n</main>\n</body>\n</html>\n';
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = el('a', { href: url, download: (title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'portfolio') + '.html' });
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  function linkBox(link) {
    const inp = el('input', { class: 'find-inp teach-link', readonly: '', value: link, 'aria-label': 'Portfolio link' });
    const copy = el('button', { class: 'btn tiny', onclick: () => { inp.select(); const done = (ok) => { copy.textContent = ok ? 'Copied' : 'Select and copy'; setTimeout(() => { copy.textContent = 'Copy link'; }, 2500); }; if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(() => done(true), () => done(false)); else done(false); } }, 'Copy link');
    return el('div', { class: 'teach-linkbox pf-linkbox' }, inp, copy, el('span', { class: 'muted small' }, (link.length / 1024).toFixed(1) + ' KB'));
  }

  // ---------- pages ----------
  function page(query) {
    const q = new URLSearchParams(query || '');
    const main = el('main', { class: 'pf' });
    if (q.get('p')) { receivedPage(main, q.get('p')); return main; }
    ownPage(main); return main;
  }

  function ownPage(main) {
    const s = load();
    const docWrap = el('div', { class: 'pf-docwrap' });
    let P = null;
    const refresh = () => { P = collect(s); docWrap.innerHTML = ''; docWrap.append(renderDoc(P, { own: true })); linkOut.innerHTML = ''; };
    let timer = 0; const later = () => { clearTimeout(timer); timer = setTimeout(() => { save(); refresh(); }, 250); };
    const name = el('input', { class: 'pf-input', type: 'text', value: s.name, autocomplete: 'name', 'aria-label': 'Your name', oninput: (e) => { s.name = e.target.value; later(); } });
    const note = el('textarea', { class: 'pf-input pf-notebox', rows: '3', 'aria-label': 'A note to go with your portfolio', placeholder: 'What you are proudest of, what was hard, what you want to learn next.', oninput: (e) => { s.note = e.target.value; later(); } });
    note.value = s.note;
    const tick = (label, key, hint) => { const c = el('input', { type: 'checkbox', onchange: (e) => { s[key] = e.target.checked; save(); refresh(); } }); c.checked = !!s[key]; return el('label', { class: 'pf-tick' }, c, el('span', {}, label, hint ? el('span', { class: 'muted' }, ' ' + hint) : null)); };
    const files = labFiles();
    const labList = files.length ? el('div', { class: 'pf-labpick' }, files.map(f => {
      const c = el('input', { type: 'checkbox', onchange: (e) => { const set = new Set(s.lab); e.target.checked ? set.add(f.key) : set.delete(f.key); s.lab = [...set]; save(); refresh(); } });
      c.checked = s.lab.includes(f.key);
      return el('label', { class: 'pf-tick' }, c, el('span', {}, el('code', {}, f.name + (/\.\w+$/.test(f.name) ? '' : '.' + (LANG_EXT[f.lang] || 'txt'))), el('span', { class: 'muted' }, ' ' + (LANG_NAME[f.lang] || f.lang) + (f.asg ? ', assignment' : ''))));
    })) : el('p', { class: 'muted small' }, 'You have no programs in the Code Lab yet.');
    const linkOut = el('div', { class: 'pf-linkout' });
    const makeLink = el('button', { class: 'btn', onclick: async () => {
      makeLink.disabled = true; save(); P = collect(s);
      try { const link = baseUrl() + '#/portfolio?p=' + await window.TEACH.pack(P); linkOut.innerHTML = ''; linkOut.append(el('p', { class: 'small' }, 'Send this link to your teacher (paste it into Google Classroom, a message or an email). It holds a copy of everything below as it is now; if you do more work, make a new link.'), linkBox(link)); }
      catch (e) { linkOut.textContent = 'Could not make the link: ' + e.message; }
      makeLink.disabled = false;
    } }, 'Make a link for my teacher');
    main.append(
      el('header', { class: 'pf-intro' },
        el('h1', {}, 'Your portfolio'),
        el('p', { class: 'lead' }, 'Everything you have completed on this device, in one document. Print it, keep it as a web page, or send your teacher a link.')),
      el('section', { class: 'pf-controls', 'aria-label': 'Portfolio settings' },
        el('label', { class: 'pf-field' }, el('span', { class: 'pf-label' }, 'Your name'), name),
        el('label', { class: 'pf-field' }, el('span', { class: 'pf-label' }, 'A note to go with it', el('span', { class: 'muted' }, ' (optional)')), note),
        el('div', { class: 'pf-field' }, el('span', { class: 'pf-label' }, 'Include'),
          tick('Exercises I started but have not finished', 'unfinished'),
          tick('The task for each exercise', 'tasks', '(makes it longer)')),
        el('div', { class: 'pf-field' }, el('span', { class: 'pf-label' }, 'Programs from the Code Lab'), labList),
        el('div', { class: 'toolbar pf-actions' },
          el('button', { class: 'btn primary', onclick: () => window.print() }, 'Print or save as PDF'),
          el('button', { class: 'btn', onclick: () => { save(); download(docWrap.firstChild, collect(s)); } }, 'Download as a web page'),
          makeLink),
        linkOut,
        el('p', { class: 'muted small pf-privacy' }, 'Your work is saved only in this browser. A portfolio is the way to take it somewhere else.')),
      docWrap);
    refresh();
  }

  async function receivedPage(main, packed) {
    main.append(el('p', { class: 'muted' }, 'Opening the portfolio…'));
    let P;
    try { P = await window.TEACH.unpack(packed); if (!P || !Array.isArray(P.items)) throw new Error('not a portfolio'); }
    catch (e) {
      main.innerHTML = '';
      main.append(el('header', { class: 'pf-intro' }, el('h1', {}, 'This portfolio link did not open'), el('p', { class: 'lead' }, 'The link is incomplete or damaged: it was probably cut short when it was copied. Ask for it again, and copy it with the Copy link button.'),
        typeof DecompressionStream === 'undefined' ? el('p', {}, 'This browser also cannot read compressed links. Open it in a current Chrome, Edge, Firefox or Safari.') : null));
      return;
    }
    P.items = P.items.filter(it => it && typeof it.id === 'string');
    P.lab = (Array.isArray(P.lab) ? P.lab : []).filter(f => f && typeof f.code === 'string' && (f.lang === 'python' || f.lang === 'cpp' || f.lang === 'java' || f.lang === 'scheme'));
    let doc;
    try { doc = renderDoc(P, { own: false }); }
    catch (e) { main.innerHTML = ''; main.append(el('header', { class: 'pf-intro' }, el('h1', {}, 'This portfolio link did not open'), el('p', { class: 'lead' }, 'The link opened, but its contents are not a portfolio this site can show.'))); return; }
    const status = el('span', { class: 'muted small', role: 'status' });
    const check = el('button', { class: 'btn primary', onclick: () => checkAll(P, doc, check, status) }, 'Check every exercise on this computer');
    main.innerHTML = '';
    main.append(
      el('section', { class: 'pf-controls pf-received' },
        el('p', {}, el('b', {}, 'A portfolio sent as a link.'), ' It was made on ' + fmtDate(P.made) + ' and lives entirely in the link; nothing has been saved on this computer.'),
        el('p', { class: 'small' }, 'The ✓ marks were recorded on the student\u2019s own device. Checking runs each exercise\u2019s tests, from this site, on the work shown here, so the result does not depend on anything the student sent.'),
        el('div', { class: 'toolbar pf-actions' }, check,
          el('button', { class: 'btn', onclick: () => window.print() }, 'Print or save as PDF'),
          el('button', { class: 'btn', onclick: () => download(doc, P) }, 'Download as a web page'), status)),
      el('div', { class: 'pf-docwrap' }, doc));
  }

  window.PORTFOLIO = { page, collect, renderDoc, exerciseIndex, checkAll };
})();
