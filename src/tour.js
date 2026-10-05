/* A guided tour of the site: a spotlight on the real element and a short card beside it, stepping through the home page, a lesson
   and the Code Lab. Registered as window.TOUR; app.js puts the Tour button in the top bar (TOUR.button()) and the tour drives the
   router by setting location.hash, waiting for each step's target to appear. Nothing is saved except that the tour was opened once
   (shortcourses.tour.v1), which stops the button's first-visit pulse. Esc, Skip or any navigation the tour did not ask for ends it. */
(function () {
  'use strict';
  const KEY = 'shortcourses.tour.v1';
  const { el } = window.__h;
  const STEPS = [
    { route: '#/', target: '.hero', title: 'Welcome', text: 'Everything on this site runs in your browser: nothing to install, no account, nothing sent anywhere. Your progress is saved on this device. This tour takes two minutes; press Esc to leave it at any time.' },
    { route: '#/', target: '.catalog li', title: 'The courses', text: 'The courses come in three groups: start here, programming languages, and computer science. SC 099 is for anyone who has never programmed; SC 100 follows Scratch; SC 101 is the usual start. Each card says how many lessons and graded exercises the course has, and how many you have completed.' },
    { route: '#/', target: '.top-links', title: 'The top bar', text: 'From any page: Courses lists every course by group, with a search box; Algorithms shows searching, sorting, mazes, game search and puzzles in motion, with races to bet on; Real world says where each idea is used in software, security and engineering; Arena is where you write a bot that plays Tron against other bots; Showcase shows finished student projects; and the Code Lab. Once you have answered a few quick checks, Review appears too, with the number of questions due today. The circle at the right switches between light and dark.', place: 'bottom' },
    { route: '#/', target: '.backup', title: 'Your work', text: 'Exercises you pass and programs you write stay on this device. Save them to a file here to keep them safe or carry them to another computer, and restore them from the file later.', optional: true },
    { route: '#/python/1', target: '.lesson-map', title: 'Inside a lesson', text: 'Every lesson has the same parts: a short true story, numbered sections, runnable examples, quick checks, graded exercises and a recap. This map jumps to any of them, and the list on the side follows you as you read.' },
    { route: '#/python/1', target: '.blk-play', title: 'Examples run here', text: 'Press Run and the program runs in the page. Change something and run again; Reset puts it back. Open in Code Lab copies it into your own workspace.', place: 'top' },
    { route: '#/python/1', target: '.blk-check', title: 'Quick checks', text: 'One question after each idea. Pick an answer, then say how sure you are: that button checks it. Being sure and wrong is the most useful result of all. Your first answer comes back in Review tomorrow, then after longer gaps; no score is kept.', place: 'top' },
    { route: '#/python/1', target: '.blk-ex', title: 'Exercises', text: 'Check answer runs your program against tests and shows which passed. Hints help one at a time; Solution is there when you are stuck (it asks you to try twice first). A passed exercise is ticked in the course and counts on the home page.', place: 'top' },
    { route: '#/lab', target: '.lab-langs', title: 'The Code Lab', text: 'Your own programs, in Python, C++, C, Java or Scheme. Files live in tabs and are saved as you type, and History under the editor keeps earlier versions of each one; in Java, Run compiles all the tabs together, so Main.java can use a class in Dog.java. Share link puts a whole program inside a link you can send to anyone.' },
    { route: '#/lab', target: '.lab-toolbar', title: 'The tools', text: 'Run, and Stop if it gets stuck. Step through runs a Python or Java program a step at a time; C++ has Step through memory. Arguments gives a Python or Java program words to start with. Templates give you a start, Reference is a one-page cheat sheet, and Terminal opens a practice command line with your files in it.', place: 'bottom' },
    { route: '#/lab', target: '.teach-switch', title: 'For teachers', text: 'Teacher tools let you write an assignment with tests, share it as a link or a QR code, and collect submissions into a grade book. No server, no accounts: everything travels inside links.', optional: true, place: 'bottom' },
    { route: '#/', target: '.tour-btn', title: 'That is the tour', text: 'Press Tour whenever you want it again. The guide for teachers, linked at the bottom of the home page, has a plan for a first class. Enjoy.', place: 'bottom' }
  ];
  let state = null;   // { i, spot, card, block, onKey, onMove, navigating }

  const seen = () => { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return true; } };
  const markSeen = () => { try { localStorage.setItem(KEY, '1'); } catch (e) { /* ignore */ } document.querySelectorAll('.tour-btn').forEach((b) => b.classList.remove('pulse')); };

  function button() {
    return el('button', { class: 'tour-btn' + (seen() ? '' : ' pulse'), title: 'A two-minute tour of the site', onclick: () => start() }, 'Tour');
  }

  const waitFor = (sel, ms) => new Promise((resolve) => { const t0 = Date.now(); const look = () => { const e = document.querySelector(sel); if (e) resolve(e); else if (Date.now() - t0 > ms) resolve(null); else requestAnimationFrame(look); }; look(); });

  async function start(from) {
    end();
    markSeen();
    const block = el('div', { class: 'tour-block' });   // keeps the page still while the tour is on; clicking it does nothing
    const spot = el('div', { class: 'tour-spot', 'aria-hidden': 'true' });
    const card = el('div', { class: 'tour-card', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'tour-title' });
    document.body.append(block, spot, card);
    document.body.classList.add('tour-on');
    state = { i: -1, spot, card, block, navigating: false };
    state.onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); end(); } else if (e.key === 'ArrowRight' || (e.key === 'Enter' && !(e.target && e.target.closest && e.target.closest('button, a')))) { e.preventDefault(); go(state.i + 1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(state.i - 1); } };
    state.onMove = () => { if (state && state.target) place(); };
    state.onHash = () => { if (state && !state.navigating) end(); };   // the reader went somewhere else: the tour steps aside
    document.addEventListener('keydown', state.onKey);
    window.addEventListener('resize', state.onMove); window.addEventListener('scroll', state.onMove, true);
    window.addEventListener('hashchange', state.onHash);
    go(from || 0);
  }

  async function go(i) {
    if (!state) return;
    if (i < 0) i = 0;
    if (i >= STEPS.length) { end(); return; }
    const dir = i >= state.i ? 1 : -1;
    const step = STEPS[i];
    state.i = i; state.target = null; state.spot.classList.add('hidden'); state.card.classList.add('moving');
    if (location.hash !== step.route) { state.navigating = true; location.hash = step.route; await new Promise((r) => setTimeout(r, 50)); }
    const target = await waitFor(step.target, 4000);
    if (!state) return;   // the tour was closed while the page loaded
    state.navigating = false;
    if (state.i !== i) return;
    if (!target) { if (step.optional) { go(i + dir); return; } render(step, null); return; }
    state.target = target;
    reveal(target, step);
    render(step, target);
  }

  // scroll so the target shows: not at all if it is already in view, to the top edge (less a margin) for things in the top bar or
  // taller than the room left above the card, else to the middle
  function reveal(target, step) {
    const r = target.getBoundingClientRect(), vh = window.innerHeight;
    if (r.top >= 0 && r.bottom <= vh && step.place !== 'bottom') return;
    if (step.place === 'bottom' || r.height > vh * 0.5) window.scrollTo(0, Math.max(0, window.scrollY + r.top - 16));
    else target.scrollIntoView({ block: 'center', behavior: 'auto' });
  }

  function render(step, target) {
    const { card, spot } = state;
    const n = STEPS.length, i = state.i;
    card.replaceChildren(
      el('div', { class: 'tour-head' }, el('span', { class: 'tour-count' }, (i + 1) + ' of ' + n), el('button', { class: 'tour-x', 'aria-label': 'End the tour', onclick: end }, '×')),
      el('h3', { id: 'tour-title' }, step.title),
      el('p', {}, target ? step.text : 'This part is not on the page right now, so the tour goes on to the next one.'),
      el('div', { class: 'tour-dots', 'aria-hidden': 'true' }, STEPS.map((s, k) => el('span', { class: k === i ? 'on' : k < i ? 'done' : '' }))),
      el('div', { class: 'tour-btns' },
        el('button', { class: 'btn quiet', onclick: () => go(i - 1), disabled: i === 0 ? '' : null }, 'Back'),
        el('button', { class: 'btn quiet tour-skip', onclick: end }, 'Skip'),
        el('button', { class: 'btn primary', onclick: () => go(i + 1) }, i === n - 1 ? 'Finish' : 'Next')));
    card.classList.remove('moving');
    place();
    const next = card.querySelector('.btn.primary'); if (next) next.focus({ preventScroll: true });
  }

  // the spotlight hugs the target; the card sits below it, or above when there is no room, and at the bottom of a phone screen
  function place() {
    const { spot, card, target } = state; const step = STEPS[state.i];
    const vw = window.innerWidth, vh = window.innerHeight, pad = 8;
    if (!target) { spot.classList.add('hidden'); card.style.left = Math.max(8, (vw - card.offsetWidth) / 2) + 'px'; card.style.top = Math.max(8, (vh - card.offsetHeight) / 2) + 'px'; return; }
    const r = target.getBoundingClientRect();
    spot.classList.remove('hidden');
    spot.style.left = (r.left - pad) + 'px'; spot.style.top = (r.top - pad) + 'px'; spot.style.width = (r.width + 2 * pad) + 'px'; spot.style.height = (r.height + 2 * pad) + 'px';
    if (vw < 640) { card.style.left = '8px'; card.style.top = ''; card.style.bottom = '8px'; card.style.width = (vw - 16) + 'px'; return; }
    card.style.bottom = ''; card.style.width = '';
    const cw = card.offsetWidth, ch = card.offsetHeight;
    let top = r.bottom + pad + 10, left = r.left;
    const wantTop = step.place === 'top' || top + ch > vh - 8;
    if (wantTop && r.top - pad - 10 - ch >= 8) top = r.top - pad - 10 - ch;
    else if (top + ch > vh - 8) top = Math.max(8, vh - ch - 8);
    if (left + cw > vw - 8) left = Math.max(8, vw - cw - 8);
    card.style.left = left + 'px'; card.style.top = top + 'px';
  }

  function end() {
    if (!state) return;
    const s = state; state = null;
    document.removeEventListener('keydown', s.onKey);
    window.removeEventListener('resize', s.onMove); window.removeEventListener('scroll', s.onMove, true);
    window.removeEventListener('hashchange', s.onHash);
    s.spot.remove(); s.card.remove(); s.block.remove();
    document.body.classList.remove('tour-on');
    const btn = document.querySelector('.tour-btn'); if (btn) btn.focus({ preventScroll: true });
  }

  window.TOUR = { start, end, button, STEPS, KEY };
})();
