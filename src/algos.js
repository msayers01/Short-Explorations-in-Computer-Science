/* Algorithms in motion: the #/algorithms page. Interactive demos of searching, sorting, path-finding, mazes and game search.
   This file is the frame: a registry of demos, the index page, the page of one demo, and the helpers every demo shares (a player
   with Play / Pause / Step / Reset and a speed slider, a canvas that follows the page's size and theme, a seeded random number
   generator). The demos themselves are in src/algo_*.js; each registers itself with
     ALGOS.register({ id, title, group, blurb, mount(host, api) → cleanup?, about?, taught? })
   - group: one of ALGOS.GROUPS (the index lists demos by group, in the order they registered)
   - mount builds the demo inside host (an empty <div>); it may return a function that stops it. The page calls it when the reader
     leaves; a demo's animation must also stop by itself once its host is no longer in the document.
   - about: HTML shown under the demo (how it works, its cost); taught: [{ href, text }] links to the lessons that teach it.
   Nothing here runs student code; everything on these pages is drawn by the page itself. In node (test_algos.js) only the pure parts
   are used, so nothing touches the DOM until page() is called. */
(function () {
  const GROUPS = ['Searching', 'Sorting', 'Paths and graphs', 'Mazes', 'Games and adversarial search', 'Puzzles and simulations', 'More to explore'];
  const demos = [];
  const register = (d) => { if (!d || !d.id || demos.some((x) => x.id === d.id)) return; demos.push(d); };
  const el = (...a) => window.__app.internal.el(...a);

  // ---------- helpers for demos
  /** A small seeded random generator (mulberry32): the same seed gives the same maze or array. */
  function rng(seed) {
    let a = (seed >>> 0) || 1;
    const next = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    next.int = (n) => Math.floor(next() * n);
    next.shuffle = (xs) => { for (let i = xs.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [xs[i], xs[j]] = [xs[j], xs[i]]; } return xs; };
    return next;
  }
  /** The page's colours, read from the CSS variables, so canvases follow the light and dark themes. */
  function colors() {
    const s = getComputedStyle(document.documentElement), v = (n) => s.getPropertyValue(n).trim();
    return { paper: v('--paper'), paper2: v('--paper-2'), ink: v('--ink'), ink2: v('--ink-2'), ink3: v('--ink-3'), rule: v('--rule'), rule2: v('--rule-2'),
      accent: v('--accent'), accentSoft: v('--accent-soft'), ok: v('--ok'), okSoft: v('--ok-soft'), err: v('--err'), errSoft: v('--err-soft'), warn: v('--warn'),
      fig: v('--k-fig'), quiz: v('--k-quiz'), link: v('--link'), mono: v('--mono'), sans: v('--sans') };
  }
  const reducedMotion = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  /** A canvas as wide as its container (at most maxWidth), sharp on high-density screens. draw(ctx, width, height, colors) is called
      on every resize and theme change, and by redraw(). height may be a number or a function of the width. */
  function canvas(host, opts) {
    const wrap = el('div', { class: 'algo-canvas' }), cv = el('canvas', { role: 'img', 'aria-label': opts.label || 'Animation' });
    wrap.append(cv); host.append(wrap);
    const ctx = cv.getContext('2d'); let w = 0, h = 0;
    const size = () => {
      const avail = Math.max(200, Math.min(opts.maxWidth || 1100, wrap.clientWidth || 600));
      w = avail; h = typeof opts.height === 'function' ? opts.height(w) : (opts.height || Math.round(w * 0.55));
      const dpr = Math.min(3, window.devicePixelRatio || 1);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.width = w + 'px'; cv.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); redraw();
    };
    const redraw = () => { if (w) opts.draw(ctx, w, h, colors()); };
    let ro = null, pending = 0; if (window.ResizeObserver) { ro = new ResizeObserver(() => { if (!pending && Math.abs((wrap.clientWidth || 0) - w) > 1) pending = requestAnimationFrame(() => { pending = 0; size(); }); }); ro.observe(wrap); }   // resizing in the next frame, not inside the observer's callback
    const mo = new MutationObserver(redraw); mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null; if (mq && mq.addEventListener) mq.addEventListener('change', redraw);
    requestAnimationFrame(size);
    return { canvas: cv, ctx, redraw, size: () => ({ w, h }), stop: () => { if (ro) ro.disconnect(); mo.disconnect(); if (mq && mq.removeEventListener) mq.removeEventListener('change', redraw); } };
  }

  /** The player under every demo: Play / Pause, Step, Reset and a speed slider.
      start() returns an iterator (usually a generator) of steps; onStep(value) is called with each value it yields and should update
      the picture; onDone() when it finishes. speeds: steps per second at the slider's ends (log scale). extra: more controls. */
  function player(host, opts) {
    let it = null, timer = 0, running = false, done = false, last = 0, carry = 0;
    const minS = (opts.speeds && opts.speeds[0]) || 1, maxS = (opts.speeds && opts.speeds[1]) || 400;
    const speed = el('input', { type: 'range', min: 0, max: 100, value: opts.speed != null ? opts.speed : 45, 'aria-label': 'Speed', class: 'algo-speed' });
    const rate = () => minS * Math.pow(maxS / minS, speed.value / 100);
    const playBtn = el('button', { class: 'btn primary', onclick: () => (running ? pause() : play()) }, 'Play');
    const stepBtn = el('button', { class: 'btn', onclick: () => { pause(); step(); } }, 'Step');
    const resetBtn = el('button', { class: 'btn quiet', onclick: () => reset() }, 'Reset');
    const status = el('span', { class: 'algo-status', role: 'status' });
    const bar = el('div', { class: 'algo-controls' }, playBtn, stepBtn, resetBtn, el('label', { class: 'algo-speed-label' }, 'Speed ', speed), ...(opts.extra || []), status);
    host.append(bar);
    const ensure = () => { if (!it) { it = opts.start(); done = false; } };
    function step() {
      ensure(); if (done) return false;
      const r = it.next();
      if (r.done) { done = true; pause(); playBtn.textContent = 'Play again'; if (opts.onDone) opts.onDone(r.value); return false; }
      opts.onStep(r.value); return true;
    }
    function frame(t) {
      timer = 0;
      if (!running) return;
      if (!host.isConnected) { pause(); return; }   // the reader left the page
      const dt = Math.min(250, t - (last || t)); last = t;
      carry += dt / 1000 * rate();
      let n = Math.floor(carry); carry -= n; if (n > 5000) n = 5000;
      for (let i = 0; i < n; i++) if (!step()) return;
      timer = requestAnimationFrame(frame);
    }
    function play() { if (done) reset(); running = true; last = 0; carry = 1; playBtn.textContent = 'Pause'; timer = requestAnimationFrame(frame); }
    function pause() { running = false; if (timer) cancelAnimationFrame(timer); timer = 0; playBtn.textContent = done ? 'Play again' : 'Play'; }
    function reset() { pause(); it = null; done = false; playBtn.textContent = 'Play'; if (opts.onReset) opts.onReset(); }
    const onHide = () => { if (document.hidden) pause(); };
    document.addEventListener('visibilitychange', onHide);
    return { play, pause, step, reset, status: (t) => { status.textContent = t; }, isRunning: () => running, controls: bar,
      stop: () => { pause(); document.removeEventListener('visibilitychange', onHide); } };
  }

  // ---------- the pages
  function card(d) {
    return el('li', { class: 'algo-card' },
      el('a', { class: 'algo-card-link', href: '#/algorithms/' + d.id }, el('span', { class: 'algo-card-title' }, d.title)),
      el('p', { class: 'algo-card-blurb' }, d.blurb));
  }
  function indexPage() {
    const main = el('main', { class: 'algos' });
    main.append(el('header', { class: 'algos-head' },
      el('h1', {}, 'Algorithms in motion'),
      el('p', { class: 'tagline' }, 'Watch the algorithms from the courses work, one step at a time: searching and sorting, finding a way through a maze, playing a game against a computer that looks ahead, and puzzles to solve yourself. Bet on the races, change the input, slow it down, and count what each one costs.')));
    for (const g of GROUPS) {
      const list = demos.filter((d) => (GROUPS.includes(d.group) ? d.group : GROUPS[GROUPS.length - 1]) === g);
      if (!list.length) continue;
      main.append(el('section', { class: 'algos-group' }, el('h2', {}, g), el('ul', { class: 'algo-cards' }, list.map(card))));
    }
    if (!demos.length) main.append(el('p', {}, 'No demonstrations are loaded.'));
    return main;
  }
  let stopCurrent = null;
  function demoPage(d) {
    const main = el('main', { class: 'algos algo-one' });
    const host = el('div', { class: 'algo-host' });
    const i = demos.indexOf(d), prev = demos[i - 1], next = demos[i + 1];
    main.append(
      el('nav', { class: 'crumbs' }, el('a', { href: '#/algorithms' }, 'Algorithms'), ' / ', d.group),
      el('h1', {}, d.title),
      el('p', { class: 'tagline' }, d.blurb),
      host,
      d.about ? el('div', { class: 'prose algo-about', html: d.about }) : null,
      d.taught && d.taught.length ? el('p', { class: 'algo-taught' }, 'Taught in: ', d.taught.map((t, k) => [k ? ' · ' : null, el('a', { href: t.href }, t.text)])) : null,
      el('nav', { class: 'algo-pager' }, prev ? el('a', { href: '#/algorithms/' + prev.id }, '← ' + prev.title) : el('span'), el('a', { href: '#/algorithms' }, 'All demonstrations'), next ? el('a', { href: '#/algorithms/' + next.id }, next.title + ' →') : el('span')));
    // mount once the page is in the document, so the canvas can measure itself
    requestAnimationFrame(() => {
      if (!host.isConnected) return;   // the reader moved on before the first frame: nothing to start, nothing to clean up
      try { const stop = d.mount(host, api); stopCurrent = typeof stop === 'function' ? stop : null; }
      catch (e) { host.append(el('p', { class: 'algo-error' }, 'This demonstration could not start: ' + (e && e.message ? e.message : String(e)))); }
    });
    return main;
  }
  function page(sub) {
    if (stopCurrent) { try { stopCurrent(); } catch (e) { /* ignore */ } stopCurrent = null; }
    const d = sub && demos.find((x) => x.id === sub);
    document.title = (d ? d.title + ' — ' : '') + 'Algorithms in motion';
    return d ? demoPage(d) : indexPage();
  }
  // leaving the page (any route change) stops the running demo
  if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('hashchange', () => { if (!/^#\/algorithms\//.test(location.hash) && stopCurrent) { try { stopCurrent(); } catch (e) { /* ignore */ } stopCurrent = null; } });

  const api = { rng, colors, canvas, player, reducedMotion, el };
  const ALGOS = { GROUPS, register, demos, page, rng, colors, canvas, player, reducedMotion, api };
  if (typeof window !== 'undefined') window.ALGOS = ALGOS;
  if (typeof module !== 'undefined') module.exports = ALGOS;
})();
