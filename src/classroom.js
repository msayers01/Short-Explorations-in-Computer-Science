/* Classroom (projector) mode. A switch in the top bar makes every page readable from the back of a
   room: larger type, stronger contrast, the lesson list hidden, the lesson using the whole width.
   On a lesson page the teacher then moves through the lesson one step at a time (a paragraph, a
   "Try it" box, a figure, an exercise) with the arrow keys or a presentation clicker; a bar in the
   left margin marks the current step, and "spotlight" dims the rest. Enter opens a "predict, then
   reveal" answer or runs the current example. There is a thinking timer and a blank screen (B).
   Settings are kept in localStorage under shortcourses.classroom.v1 = { on, scale, spot }.
   Exposed as window.CLASSROOM { button(), toggle(on), isOn() }. */
(function () {
  'use strict';
  const KEY = 'shortcourses.classroom.v1';
  const SCALES = [1.1, 1.25, 1.4, 1.6, 1.8];
  const root = document.documentElement;
  const h = (...a) => window.__app.internal.el(...a);
  const reduced = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  let S = { on: false, scale: 1, spot: true };
  try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { }
  S.scale = Math.max(0, Math.min(SCALES.length - 1, S.scale | 0));
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } };

  // page state (rebuilt after every route)
  let steps = [], cur = -1, body = null, cursor = null, bar = null, counter = null, nextLabel = null, actBtn = null, spotBtn = null, ro = null;
  let blank = null, help = null, timerBtn = null, timerMenu = null, timerEnd = 0, timerTick = 0;

  function apply() {
    root.classList.toggle('classroom', !!S.on);
    root.style.setProperty('--cls-scale', String(SCALES[S.scale]));
    root.classList.toggle('cls-spot', !!(S.on && S.spot && cur >= 0));
    document.querySelectorAll('.cls-toggle').forEach(b => { b.setAttribute('aria-pressed', S.on ? 'true' : 'false'); b.title = S.on ? 'Leave classroom mode' : 'Classroom mode: large type for a projector'; });
  }
  // Lesson editors size their textarea to the highlighted text; re-measure after the type size changes.
  function remeasure() {
    requestAnimationFrame(() => document.querySelectorAll('.editor').forEach(w => {
      const pre = w.querySelector('pre.hl'), ta = w.querySelector('textarea');
      if (pre && ta && !w.classList.contains('lab-editor')) { ta.style.height = 'auto'; ta.style.height = pre.offsetHeight + 'px'; }
    }));
    placeCursor();
  }
  function toggle(on) {
    S.on = on === undefined ? !S.on : !!on; save();
    if (!S.on) { stopTimer(); unblank(); }
    teardown(); apply(); setup(); remeasure();
  }
  function setScale(d) { S.scale = Math.max(0, Math.min(SCALES.length - 1, S.scale + d)); save(); apply(); remeasure(); if (cur >= 0) scrollToStep(); }
  function setSpot(v) { S.spot = v === undefined ? !S.spot : v; save(); apply(); if (spotBtn) spotBtn.setAttribute('aria-pressed', S.spot ? 'true' : 'false'); }

  function button() {
    const b = h('button', { class: 'theme-btn cls-toggle', 'aria-pressed': S.on ? 'true' : 'false', 'aria-label': 'Classroom mode', title: S.on ? 'Leave classroom mode' : 'Classroom mode: large type for a projector', onclick: () => toggle() });
    b.innerHTML = '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><rect x="2" y="3" width="16" height="10.5" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 13.5v3M6.5 17.2h7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M5.5 10.5l2.8-3 2.2 2 3.5-4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    return b;
  }

  // ---------- steps ----------
  function buildSteps() {
    steps = []; let pending = [];
    const push = (els) => { const s = pending.concat(els); pending = []; s.forEach(e => e.classList.add('cls-item')); steps.push(s); };
    for (const child of body.children) {
      if (child === cursor || child.matches('footer.lesson-foot')) continue;
      if (child.classList.contains('prose')) {
        // a heading, or a sentence that ends in a colon ("Then:"), belongs with whatever follows it
        for (const k of child.children) { if (/^H[1-6]$/.test(k.tagName) || (k.tagName === 'P' && /:\s*$/.test(k.textContent))) pending.push(k); else push([k]); }
      } else push([child]);
    }
    if (pending.length) push([]);
  }
  function indexOf(node) { for (let i = 0; i < steps.length; i++) if (steps[i].some(e => e === node || e.contains(node))) return i; return -1; }
  function barHeight() { return bar ? bar.getBoundingClientRect().height : 0; }
  function placeCursor() {
    if (!cursor || !body) return;
    if (cur < 0) { cursor.hidden = true; return; }
    const s = steps[cur], br = body.getBoundingClientRect();
    const top = s[0].getBoundingClientRect().top - br.top, bottom = s[s.length - 1].getBoundingClientRect().bottom - br.top;
    cursor.hidden = false; cursor.style.transform = 'translateY(' + top + 'px)'; cursor.style.height = Math.max(8, bottom - top) + 'px';
  }
  function scrollToStep() {
    if (cur < 0) return;
    const s = steps[cur];
    const top = s[0].getBoundingClientRect().top + window.scrollY, bottom = s[s.length - 1].getBoundingClientRect().bottom + window.scrollY;
    const vh = window.innerHeight - barHeight(), ht = bottom - top;
    const y = ht < vh * 0.8 ? top - Math.min(vh * 0.2, (vh - ht) / 2) : top - 16;
    window.scrollTo({ top: Math.max(0, y), behavior: reduced() ? 'auto' : 'smooth' });
  }
  function go(i, scroll) {
    if (!steps.length) return;
    i = Math.max(-1, Math.min(steps.length - 1, i));
    if (cur >= 0 && steps[cur]) steps[cur].forEach(e => e.classList.remove('cls-cur'));
    cur = i;
    if (cur >= 0) steps[cur].forEach(e => e.classList.add('cls-cur'));
    apply(); placeCursor(); if (scroll !== false) scrollToStep(); updateBar();
  }
  const nextHref = () => { const n = document.querySelector('.lesson-foot .pager.next'); return n ? n.getAttribute('href') : null; };
  function next() { if (cur < steps.length - 1) go(cur + 1); else { const href = nextHref(); if (href) location.hash = href.replace(/^#/, ''); } }
  function prev() { if (cur > 0) go(cur - 1); else if (cur === 0) go(-1); }
  function actionFor() {
    if (cur < 0) return null;
    for (const e of steps[cur]) {
      const d = e.matches('details') ? e : e.querySelector('details');
      if (d) return { label: d.open ? 'Hide the answer' : 'Reveal', run: () => { d.open = !d.open; updateBar(); placeCursor(); } };
      const run = e.matches('.play') ? e.querySelector('.toolbar .btn.primary') : null;
      if (run) return { label: 'Run', run: () => { run.click(); setTimeout(placeCursor, 300); } };
    }
    return null;
  }
  function act() { const a = actionFor(); if (a) a.run(); }
  function updateBar() {
    if (!counter) return;
    counter.textContent = cur < 0 ? 'Start' : 'Step ' + (cur + 1) + ' of ' + steps.length;
    const atEnd = cur === steps.length - 1, href = nextHref();
    nextLabel.textContent = atEnd && href ? (href.split('/').length > 2 ? 'Next lesson' : 'Finish') : 'Next';
    const a = actionFor(); actBtn.hidden = !a; if (a) actBtn.textContent = a.label;
  }

  // ---------- thinking timer ----------
  const fmt = (ms) => { const t = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); };
  function startTimer(min) {
    stopTimer(); timerEnd = Date.now() + min * 60000; timerMenu.hidden = true;
    const tick = () => {
      const left = timerEnd - Date.now();
      if (left <= 0) { timerBtn.textContent = 'Time'; timerBtn.classList.add('cls-time-up'); clearInterval(timerTick); timerTick = 0; setTimeout(() => { if (!timerTick && timerBtn) { timerBtn.classList.remove('cls-time-up'); timerBtn.textContent = 'Timer'; } }, 8000); return; }
      timerBtn.textContent = fmt(left);
    };
    tick(); timerTick = setInterval(tick, 250); timerBtn.setAttribute('aria-label', 'Stop the timer');
  }
  function stopTimer() { if (timerTick) clearInterval(timerTick); timerTick = 0; timerEnd = 0; if (timerBtn) { timerBtn.textContent = 'Timer'; timerBtn.classList.remove('cls-time-up'); timerBtn.setAttribute('aria-label', 'Thinking timer'); } }

  // ---------- blank screen and key help ----------
  function toggleBlank() { if (blank) return unblank(); blank = h('div', { class: 'cls-blank', role: 'button', 'aria-label': 'Blank screen: press any key or click to return', tabindex: '-1', onclick: unblank }); document.body.append(blank); blank.focus(); }
  function unblank() { if (blank) { blank.remove(); blank = null; } }
  function toggleHelp() {
    if (help) { help.remove(); help = null; return; }
    const row = (k, what) => h('tr', {}, h('td', {}, k), h('td', {}, what));
    help = h('div', { class: 'cls-help', role: 'dialog', 'aria-label': 'Classroom mode keys' },
      h('h2', {}, 'Classroom mode keys'),
      h('table', {}, h('tbody', {},
        row('→  Page Down  Space', 'next step (at the end: next lesson)'),
        row('←  Page Up', 'previous step'),
        row('Home  End', 'first step, last step'),
        row('Enter', 'reveal the answer, or run the example'),
        row('S', 'spotlight on or off'),
        row('+  −', 'larger or smaller type'),
        row('B  or  .', 'blank the screen'),
        row('?', 'show or hide these keys'))),
      h('p', {}, 'A presentation clicker works too: its buttons send Page Down, Page Up and B. Click any paragraph to move the marker there.'),
      h('button', { class: 'btn', onclick: toggleHelp }, 'Close'));
    document.body.append(help);
  }

  // ---------- bar ----------
  function makeBar(onLesson) {
    const b = (label, attrs, fn) => h('button', Object.assign({ class: 'btn quiet cls-btn', onclick: fn }, attrs || {}), label);
    timerMenu = h('div', { class: 'cls-menu', hidden: '' }, [1, 2, 3, 5].map(m => b(m + ' min', {}, () => startTimer(m))));
    timerBtn = b('Timer', { 'aria-label': 'Thinking timer' }, () => { if (timerTick || timerBtn.classList.contains('cls-time-up')) stopTimer(); else timerMenu.hidden = !timerMenu.hidden; });
    const kids = [];
    if (onLesson) {
      counter = h('span', { class: 'cls-count', 'aria-live': 'polite' });
      nextLabel = h('span', {}, 'Next');
      actBtn = b('Reveal', { hidden: '' }, act);
      spotBtn = b('Spotlight', { 'aria-pressed': S.spot ? 'true' : 'false', title: 'Dim everything but the current step (S)' }, () => setSpot());
      kids.push(h('div', { class: 'cls-group' }, b('Back', { title: 'Previous step (←)' }, prev), counter, h('button', { class: 'btn primary cls-btn', title: 'Next step (→)', onclick: next }, nextLabel)), actBtn, spotBtn);
    }
    kids.push(h('div', { class: 'cls-group cls-timer' }, timerBtn, timerMenu),
      b('A−', { 'aria-label': 'Smaller type', title: 'Smaller type (−)' }, () => setScale(-1)),
      b('A+', { 'aria-label': 'Larger type', title: 'Larger type (+)' }, () => setScale(1)),
      b('Blank', { title: 'Blank the screen (B)' }, toggleBlank),
      b('?', { 'aria-label': 'Keys', title: 'Keys' }, toggleHelp),
      b('Leave classroom mode', { class: 'btn quiet cls-btn cls-leave' }, () => toggle(false)));
    return h('div', { class: 'cls-bar' + (onLesson ? '' : ' compact'), role: 'toolbar', 'aria-label': 'Classroom mode' }, kids);
  }

  function teardown() {
    if (bar) bar.remove(); bar = null; counter = null; actBtn = null; spotBtn = null;
    if (ro) ro.disconnect(); ro = null;
    if (cursor) cursor.remove(); cursor = null;
    document.querySelectorAll('.cls-item').forEach(e => e.classList.remove('cls-item', 'cls-cur'));
    if (help) toggleHelp();
    steps = []; cur = -1; body = null; apply();
  }
  function setup() {
    if (!S.on) return;
    body = document.querySelector('.lesson-body');
    if (body) {
      cursor = h('div', { class: 'cls-cursor', hidden: '', 'aria-hidden': 'true' });
      body.prepend(cursor);
      buildSteps();
      body.addEventListener('click', (e) => { if (!S.on) return; const i = indexOf(e.target); if (i >= 0 && i !== cur) go(i, false); });
      if (window.ResizeObserver) { let raf = 0; ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(placeCursor); }); ro.observe(body); }
      // a link to an exercise (#/python/3/py-3-1) starts the marker there
      const parts = location.hash.replace(/^#\/?/, '').split('?')[0].split('/');
      const target = parts[2] && document.getElementById(parts[2]);
      if (target) { const i = indexOf(target); if (i >= 0) { cur = i; steps[i].forEach(e => e.classList.add('cls-cur')); } }
    }
    bar = makeBar(!!body);
    document.body.append(bar);
    apply(); updateBar(); placeCursor();
  }

  document.addEventListener('keydown', (e) => {
    if (!S.on || e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || document.body.classList.contains('tour-on')) return;   // the tour has the arrow keys while it runs
    if (blank) { e.preventDefault(); unblank(); return; }
    const t = e.target;
    if (t && t.closest && t.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""]')) return;
    const onControl = t && t.closest && t.closest('button, a, summary');
    const k = e.key;
    if (k === 'Escape') { if (help) { e.preventDefault(); toggleHelp(); } else if (timerMenu && !timerMenu.hidden) timerMenu.hidden = true; return; }
    if (k === '?') { e.preventDefault(); toggleHelp(); return; }
    if (k === 'b' || k === 'B' || k === '.') { e.preventDefault(); toggleBlank(); return; }
    if (k === '+' || k === '=') { e.preventDefault(); setScale(1); return; }
    if (k === '-' || k === '_') { e.preventDefault(); setScale(-1); return; }
    if (!body) return;
    if (k === 'ArrowRight' || k === 'PageDown' || (k === ' ' && !onControl)) { e.preventDefault(); next(); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); prev(); }
    else if (k === 'Home') { e.preventDefault(); go(0); }
    else if (k === 'End') { e.preventDefault(); go(steps.length - 1); }
    else if (k === 'Enter' && !onControl) { e.preventDefault(); act(); }
    else if (k === 's' || k === 'S') { e.preventDefault(); setSpot(); }
  });
  document.addEventListener('routed', () => { teardown(); setup(); });
  window.addEventListener('resize', () => { if (S.on) placeCursor(); });
  apply();

  window.CLASSROOM = { button, toggle, isOn: () => !!S.on };
})();
