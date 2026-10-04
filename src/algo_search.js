/* Algorithms in motion: the Searching demos (see src/algos.js for the frame).
   - linear-vs-binary: one sorted array, linear search and binary search stepping together, comparisons racing.
   - guess-number: binary search as a game; the computer halves, or the reader plays and is scored against the halving bound.
   - interpolation-search: binary search against interpolation search on evenly spread, growing and steep data.
   The searches are generators that yield one step per comparison (no DOM); the drawing is in the mount functions. */
(function () {
  const A = (typeof window !== 'undefined' && window.ALGOS) || require('./algos.js');

  // ---------- pure algorithms (no DOM)
  /** floor(log2 n) for n >= 1, by doubling (no floating point). */
  function floorLog2(n) { let k = 0, p = 1; while (p * 2 <= n) { p *= 2; k++; } return k; }
  /** The most comparisons binary search can make on n cells: floor(log2 n) + 1. */
  const maxBinaryComparisons = (n) => (n < 1 ? 0 : floorLog2(n) + 1);
  /** The fewest guesses that always find a number in 1..N with higher/lower answers: ceil(log2(N + 1)), which equals floor(log2 N) + 1. */
  const optimalGuesses = (N) => maxBinaryComparisons(N);

  const KINDS = [
    { id: 'even', label: 'Spread evenly' },
    { id: 'squares', label: 'Growing (squares)' },
    { id: 'steep', label: 'Steep (mostly small, a few huge)' }
  ];
  /** A strictly increasing array of n whole numbers. even: gaps of 2 to 5; squares: about i²; steep: i + 2^(40 i / n). */
  function makeArray(n, kind, rnd) {
    const a = [];
    if (kind === 'squares') for (let i = 0; i < n; i++) a.push(i * i + rnd.int(2 * i + 1) + 1);
    else if (kind === 'steep') for (let i = 0; i < n; i++) a.push(i + Math.floor(Math.pow(2, 40 * i / Math.max(1, n))));
    else { let v = 1 + rnd.int(4); for (let i = 0; i < n; i++) { a.push(v); v += 2 + rnd.int(4); } }
    return a;
  }
  /** A value that is not in the sorted array a: usually one that falls between two cells, sometimes one beyond either end. */
  function absentValue(a, rnd) {
    const n = a.length;
    if (!n) return 1;
    const gaps = [];
    for (let k = 0; k + 1 < n; k++) if (a[k + 1] - a[k] >= 2) gaps.push(k);
    const r = rnd();
    if (gaps.length && r < 0.8) { const k = gaps[rnd.int(gaps.length)]; return a[k] + 1 + rnd.int(Math.min(1e9, a[k + 1] - a[k] - 1)); }
    return r < 0.9 ? a[0] - 1 - rnd.int(3) : a[n - 1] + 1 + rnd.int(3);
  }
  /** The first index whose value is >= t (where t would be inserted). */
  function lowerBound(a, t) { let lo = 0, hi = a.length; while (lo < hi) { const m = lo + ((hi - lo) >> 1); if (a[m] < t) lo = m + 1; else hi = m; } return lo; }
  const relOf = (v, t) => (v === t ? 0 : v < t ? -1 : 1);

  /* Each search yields { lo, hi, cur, comparisons, rel } once per comparison (lo..hi: the cells that can still hold the target; cur: the
     cell compared; rel: -1 if a[cur] < t, 0 if equal, 1 if greater) and returns { index (or -1), comparisons, lo, hi }. */
  function* linearSteps(a, t) {
    const n = a.length;
    for (let i = 0; i < n; i++) {
      const rel = relOf(a[i], t);
      yield { lo: i, hi: n - 1, cur: i, comparisons: i + 1, rel };
      if (rel === 0) return { index: i, comparisons: i + 1, lo: i, hi: i };
    }
    return { index: -1, comparisons: n, lo: n, hi: n - 1 };
  }
  function* binarySteps(a, t) {
    let lo = 0, hi = a.length - 1, c = 0;
    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2);   // never (lo + hi) / 2: lesson 2's overflow bug
      c++;
      const rel = relOf(a[mid], t);
      yield { lo, hi, cur: mid, comparisons: c, rel };
      if (rel === 0) return { index: mid, comparisons: c, lo, hi };
      if (rel < 0) lo = mid + 1; else hi = mid - 1;
    }
    return { index: -1, comparisons: c, lo, hi };
  }
  function* interpolationSteps(a, t) {
    let lo = 0, hi = a.length - 1, c = 0;
    while (lo <= hi && t >= a[lo] && t <= a[hi]) {
      const pos = a[hi] === a[lo] ? lo : lo + Math.floor((t - a[lo]) * (hi - lo) / (a[hi] - a[lo]));
      c++;
      const rel = relOf(a[pos], t);
      yield { lo, hi, cur: pos, comparisons: c, rel };
      if (rel === 0) return { index: pos, comparisons: c, lo, hi };
      if (rel < 0) lo = pos + 1; else hi = pos - 1;
    }
    return { index: -1, comparisons: c, lo, hi };
  }
  /** Runs several searches on the same array and target in lock step: each tick advances every search that has not finished by one
      comparison and yields a snapshot of all of them; a finished search has result set (its index, or -1). Returns the final snapshot. */
  function* race(a, t, makers) {
    const gens = makers.map((m) => m(a, t));
    let st = makers.map(() => ({ lo: 0, hi: a.length - 1, cur: -1, comparisons: 0, rel: null, result: null }));
    for (;;) {
      let moved = false;
      st = st.map((s, k) => {
        if (s.result !== null) return s;
        moved = true;
        const r = gens[k].next();
        if (r.done) return { lo: r.value.lo, hi: r.value.hi, cur: r.value.index, comparisons: r.value.comparisons, rel: r.value.index >= 0 ? 0 : null, result: r.value.index };
        return Object.assign({ result: null }, r.value);
      });
      if (!moved) return st;
      yield st;
    }
  }
  /** Guess my number by halving: yields { lo, hi, guess, reply, count } for each guess (reply: 'higher' if the secret is above the guess,
      'lower' if below, 'correct'); returns { guess, count }. */
  function* guessSteps(N, secret) {
    let lo = 1, hi = N, count = 0;
    while (lo <= hi) {
      const guess = lo + Math.floor((hi - lo) / 2);
      count++;
      const reply = secret === guess ? 'correct' : secret > guess ? 'higher' : 'lower';
      yield { lo, hi, guess, reply, count };
      if (reply === 'correct') return { guess, count };
      if (reply === 'higher') lo = guess + 1; else hi = guess - 1;
    }
    return { guess: -1, count };
  }

  // ---------- drawing helpers (only called from mount)
  const fmt = (v) => (Math.abs(v) >= 10000 ? Math.round(v).toLocaleString('en-US') : String(v));
  const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
  function injectCss() {
    if (document.getElementById('algo-search-css')) return;
    const s = document.createElement('style');
    s.id = 'algo-search-css';
    s.textContent = [
      '.as-sw-pos { background: var(--accent-soft); box-shadow: inset 0 0 0 1px var(--ink-3); }',
      '.as-sw-cur { background: var(--accent); }',
      '.as-sw-elim { background: var(--paper-2); box-shadow: inset 0 0 0 1px var(--rule); }',
      '.as-sw-ok { background: var(--ok); }',
      '.as-sw-err { background: var(--err); }',
      '.as-setup label { display: inline-flex; align-items: center; gap: 0.4rem; color: var(--ink-2); }',
      '.as-setup input[type=range] { width: 8rem; accent-color: var(--accent); }',
      '.as-setup input[type=number] { width: 6.5rem; }',
      '.as-n { display: inline-block; min-width: 2.6em; color: var(--ink); font-variant-numeric: tabular-nums; }',
      '.as-seg { display: inline-flex; border: 1px solid var(--rule); border-radius: 4px; overflow: hidden; }',
      '.as-seg button { font: inherit; border: 0; background: var(--paper); color: var(--ink-2); padding: 0.38rem 0.85rem; cursor: pointer; }',
      '.as-seg button + button { border-left: 1px solid var(--rule); }',
      '.as-seg button[aria-pressed="true"] { background: var(--accent); color: var(--accent-ink); }',
      '.as-seg button:focus-visible { outline: 2px solid var(--link); outline-offset: -2px; }',
      '.as-history { list-style: none; margin: 0.5rem 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0.35rem; font-family: var(--mono); font-size: 0.82rem; min-height: 1.6rem; }',
      '.as-history li { border: 1px solid var(--rule); border-radius: 3px; padding: 0.12rem 0.45rem; color: var(--ink-2); background: var(--paper); }',
      '.as-history li.as-ok { border-color: var(--ok); color: var(--ok); }',
      '.as-history li.as-waste { border-color: var(--err); color: var(--err); }',
      '.as-feedback { font-family: var(--sans); min-height: 1.5em; margin: 0.4rem 0; color: var(--ink); }',
      '.as-feedback.as-ok { color: var(--ok); }',
      '.as-feedback.as-err { color: var(--err); }',
      '.algo-canvas canvas.as-click { cursor: pointer; }',
      '.as-off { display: none !important; }'
    ].join('\n');
    document.head.append(s);
  }
  /** Text clamped to [minX, maxX]. */
  function textAt(ctx, s, x, y, align, minX, maxX) {
    const tw = ctx.measureText(s).width;
    let L = align === 'center' ? x - tw / 2 : align === 'right' ? x - tw : x;
    L = Math.max(minX, Math.min(maxX - tw, L));
    ctx.textAlign = 'left'; ctx.fillText(s, L, y);
    return tw;
  }
  function triangle(ctx, x, y, size, down) {
    ctx.beginPath();
    if (down) { ctx.moveTo(x - size, y - size); ctx.lineTo(x + size, y - size); ctx.lineTo(x, y); }
    else { ctx.moveTo(x - size, y + size); ctx.lineTo(x + size, y + size); ctx.lineTo(x, y); }
    ctx.closePath(); ctx.fill();
  }
  /** Smoothly moves a set of numbers from their last values to new ones; redraw() is called on every frame until they arrive. */
  function tweener(redraw, alive, reduced) {
    let from = null, to = {}, t0 = 0, raf = 0;
    const DUR = 180, now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const ease = (p) => 1 - Math.pow(1 - p, 3);
    function progress() { return reduced || !from ? 1 : Math.min(1, (now() - t0) / DUR); }
    function get() {
      const p = ease(progress()), out = {};
      for (const k in to) { const f = from && Number.isFinite(from[k]) ? from[k] : to[k]; out[k] = f + (to[k] - f) * p; }
      return out;
    }
    function tick() { raf = 0; redraw(); if (progress() < 1 && alive()) raf = requestAnimationFrame(tick); }
    return {
      get,
      set(next, jump) {
        const cur = get();
        from = jump ? null : cur; to = next; t0 = now();
        // a pointer that was hidden (-1) appears in place instead of sliding in from the left
        if (from) for (const k in next) if (/cur$/.test(k) && !(from[k] >= 0)) from[k] = next[k];
        if (!raf) raf = requestAnimationFrame(tick);
      },
      stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
    };
  }
  function legend(el, items) {
    return el('div', { class: 'algo-legend', 'aria-hidden': 'true' }, items.map(([cls, text]) => el('span', {}, el('i', { class: cls }), text)));
  }

  // ---------- demos 1 and 3: several searches racing over one array
  const ROW = { label: 20, top: 18, zone: 48, bottom: 26, meter: 6, gap: 18 };
  const ROW_H = ROW.label + ROW.top + ROW.zone + ROW.bottom + ROW.meter + ROW.gap;

  function mountRace(host, api, cfg) {
    injectCss();
    const el = api.el, reduced = api.reducedMotion();
    let seed = cfg.seed, kind = cfg.kinds ? cfg.kinds[0].id : 'even', size = cfg.size;
    let a = [], target = 0, states = [], insertAt = 0;
    const pick = api.rng(seed ^ 0x5bd1e995);

    // setup controls
    const sizeOut = el('span', { class: 'as-n' }, String(size));
    const sizeIn = el('input', { type: 'range', min: 0, max: cfg.sizes.length - 1, step: 1, value: cfg.sizes.indexOf(size), 'aria-label': 'Number of cells' });
    const targetIn = el('input', { type: 'number', step: 1, 'aria-label': 'Target value' });
    const kindSel = cfg.kinds ? el('select', { 'aria-label': 'How the values are spread' }, cfg.kinds.map((k) => el('option', { value: k.id }, k.label))) : null;
    const setup = el('div', { class: 'algo-controls as-setup' },
      el('label', {}, 'Cells', sizeIn, sizeOut),
      kindSel ? el('label', {}, 'Values', kindSel) : null,
      el('label', {}, 'Target', targetIn),
      el('button', { class: 'btn', type: 'button', onclick: () => setTarget(a[pick.int(a.length)], true) }, 'Random target'),
      el('button', { class: 'btn', type: 'button', onclick: () => setTarget(absentValue(a, pick), true) }, 'Absent value'),
      el('button', { class: 'btn quiet', type: 'button', onclick: () => { seed = (seed + 0x9e3779b9) >>> 0; build(); setTarget(a[pick.int(a.length)], true); } }, 'New array'));
    host.append(setup);

    const cv = api.canvas(host, { label: cfg.label, height: () => 8 + cfg.rows.length * ROW_H, draw });
    cv.canvas.classList.add('as-click');
    const tw = tweener(cv.redraw, () => host.isConnected, reduced);
    host.append(legend(el, [['as-sw-pos', 'can still hold the target'], ['as-sw-cur', 'being compared'], ['as-sw-elim', 'ruled out'], ['as-sw-ok', 'found'], ['as-sw-err', 'not in the array']]));
    host.append(el('p', { class: 'algo-taught' }, cfg.hint));

    const p = api.player(host, {
      speeds: cfg.speeds || [1, 300], speed: cfg.speed != null ? cfg.speed : 40,
      start: () => race(a, target, cfg.rows.map((r) => r.make)),
      onStep: (st) => { states = st; tw.set(nums()); status(); },
      onDone: () => status(true),
      onReset: () => { states = fresh(); tw.set(nums(), true); status(); }
    });

    function fresh() { return cfg.rows.map(() => ({ lo: 0, hi: a.length - 1, cur: -1, comparisons: 0, rel: null, result: null })); }
    function nums() {
      const o = {};
      states.forEach((s, k) => {
        const miss = s.result === -1;
        o['r' + k + 'lo'] = miss ? a.length : s.lo; o['r' + k + 'hi'] = miss ? a.length - 1 : s.hi; o['r' + k + 'cur'] = s.cur;
      });
      return o;
    }
    function build() {
      a = makeArray(size, kind, api.rng(seed + size * 7919));
      sizeOut.textContent = String(size);
      sizeIn.setAttribute('aria-valuetext', size + ' cells');
    }
    function setTarget(v, play) {
      target = v; targetIn.value = String(v); insertAt = lowerBound(a, v);
      p.reset();
      if (play && !reduced) p.play();
    }
    function status(final) {
      const parts = cfg.rows.map((r, k) => r.short + ' ' + plural(states[k].comparisons, 'comparison'));
      let s = 'Looking for ' + fmt(target) + '. ' + parts.join(', ') + '.';
      if (final) {
        const res = states[0].result;
        s += res >= 0 ? ' Found at index ' + res + '.' : ' Not in the array: it would go at index ' + insertAt + '.';
      }
      p.status(s);
    }

    sizeIn.addEventListener('input', () => { size = cfg.sizes[+sizeIn.value] || cfg.size; build(); setTarget(a[pick.int(a.length)], false); });
    if (kindSel) kindSel.addEventListener('change', () => { kind = kindSel.value; build(); setTarget(a[pick.int(a.length)], false); });
    targetIn.addEventListener('change', () => { const v = Number(targetIn.value); if (targetIn.value.trim() !== '' && Number.isInteger(v) && Math.abs(v) < 1e15) setTarget(v, true); else targetIn.value = String(target); });
    cv.canvas.addEventListener('click', (e) => {
      const r = cv.canvas.getBoundingClientRect(), w = cv.size().w, PAD = 12;
      const k = Math.floor((e.clientX - r.left - PAD) / ((w - 2 * PAD) / a.length));
      if (k >= 0 && k < a.length) setTarget(a[k], true);
    });

    function draw(ctx, w, h, C) {
      ctx.clearRect(0, 0, w, h);
      if (!a.length || !states.length) return;
      const PAD = 12, n = a.length, cw = (w - 2 * PAD) / n, d = tw.get();
      const cells = !cfg.bars && n <= 64 && cw >= 18;
      const min = a[0], max = a[n - 1], span = Math.max(1, max - min);
      ctx.textBaseline = 'alphabetic';
      cfg.rows.forEach((row, k) => {
        const s = states[k], y = 6 + k * ROW_H, y1 = y + ROW.label + ROW.top, y2 = y1 + ROW.zone, y3 = y2 + ROW.bottom;
        const lo = d['r' + k + 'lo'], hi = d['r' + k + 'hi'], curT = d['r' + k + 'cur'];
        const done = s.result !== null, found = done && s.result >= 0, missed = s.result === -1;
        // label line: name, what just happened, the count
        ctx.font = '600 13px ' + C.sans; ctx.fillStyle = C.ink;
        const nameW = textAt(ctx, row.name, PAD, y + 14, 'left', PAD, w - PAD);
        ctx.font = '12px ' + C.mono; ctx.fillStyle = done ? (found ? C.ok : C.err) : C.ink2;
        let right = plural(s.comparisons, 'comparison') + ' (at most ' + fmt(row.worst(n)) + ')';
        if (ctx.measureText(right).width + nameW + 14 > w - 2 * PAD) right = s.comparisons + ' of at most ' + fmt(row.worst(n));
        if (ctx.measureText(right).width + nameW + 14 > w - 2 * PAD) right = s.comparisons + ' / ' + fmt(row.worst(n));
        const rightW = textAt(ctx, right, w - PAD, y + 14, 'right', PAD, w - PAD);
        let say = '';
        if (found) say = 'found at index ' + s.result;
        else if (missed) say = 'not in the array';
        else if (s.cur >= 0) say = 'a[' + s.cur + '] = ' + fmt(a[s.cur]) + (s.rel === 0 ? ' = ' : s.rel < 0 ? ' < ' : ' > ') + fmt(target) + (s.rel === 0 ? '' : row.range ? (s.rel < 0 ? ': go right' : ': go left') : ': next');
        ctx.font = '12px ' + C.sans; ctx.fillStyle = done ? (found ? C.ok : C.err) : C.ink2;
        if (say && ctx.measureText(say).width < w - 2 * PAD - nameW - rightW - 28) textAt(ctx, say, PAD + nameW + 14, y + 14, 'left', PAD, w - PAD);
        // the cells
        const boxH = 34, by = y1 + (ROW.zone - boxH) / 2;
        ctx.font = '11px ' + C.mono;
        for (let i = 0; i < n; i++) {
          const x = PAD + i * cw;
          if (cells) {
            ctx.fillStyle = C.accentSoft; ctx.fillRect(x + 1, by, cw - 2, boxH);
            ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.strokeRect(x + 1.5, by + 0.5, cw - 3, boxH - 1);
            const t = fmt(a[i]);
            if (ctx.measureText(t).width <= cw - 5) { ctx.fillStyle = C.ink; textAt(ctx, t, x + cw / 2, by + boxH / 2 + 4, 'center', x, x + cw); }
          } else {
            const bh = 2 + (a[i] - min) / span * (ROW.zone - 4);
            ctx.fillStyle = C.ink3; ctx.fillRect(x, y2 - bh, cw >= 4 ? cw - 1 : cw + 0.4, bh);
          }
        }
        // ruled-out cells fade under a veil of the paper colour (lo and hi glide between steps)
        ctx.fillStyle = C.paper; ctx.globalAlpha = 0.78;
        const xl = PAD + Math.max(0, Math.min(n, lo)) * cw, xr = PAD + Math.max(0, Math.min(n, hi + 1)) * cw;
        if (xl > PAD) ctx.fillRect(PAD - 1, y1, xl - PAD + 1, ROW.zone);
        if (xr < w - PAD) ctx.fillRect(Math.max(xr, xl), y1, w - PAD - Math.max(xr, xl) + 1, ROW.zone);
        ctx.globalAlpha = 1;
        // the cell being compared, or the one found
        if (s.cur >= 0 && !missed) {
          const x = PAD + s.cur * cw, col = s.rel === 0 ? C.ok : C.accent;
          ctx.fillStyle = col;
          if (cells) {
            ctx.fillRect(x + 1, by, cw - 2, boxH);
            ctx.fillStyle = C.paper; ctx.font = '600 11px ' + C.mono;
            const t = fmt(a[s.cur]); if (ctx.measureText(t).width <= cw - 5) textAt(ctx, t, x + cw / 2, by + boxH / 2 + 4, 'center', x, x + cw);
          } else {
            const bw = Math.max(2, cw - 1), bh = 2 + (a[s.cur] - min) / span * (ROW.zone - 4);
            ctx.fillRect(x + cw / 2 - bw / 2, y2 - Math.max(bh, 10), bw, Math.max(bh, 10));
          }
          // pointer above, gliding
          const px = PAD + (curT + 0.5) * cw;
          ctx.fillStyle = col; triangle(ctx, px, y1 - 3, 5, true);
          ctx.font = '600 11px ' + C.mono; textAt(ctx, row.ptr, px + 8, y1 - 5, 'left', PAD, w - PAD);
        }
        // below: the lo..hi bracket, or the verdict
        ctx.font = '11px ' + C.mono;
        if (found) {
          ctx.fillStyle = C.ok; textAt(ctx, 'index ' + s.result, PAD + (s.result + 0.5) * cw, y2 + 18, 'center', PAD, w - PAD);
        } else if (missed) {
          const x = PAD + insertAt * cw;
          ctx.fillStyle = C.err; ctx.fillRect(x - 1, y1 - 2, 2, ROW.zone + 6);
          textAt(ctx, 'not here: it would go at index ' + insertAt, x, y2 + 18, 'center', PAD, w - PAD);
        } else if (row.range && hi >= lo - 0.01 && s.cur >= 0) {
          const bl = PAD + lo * cw + 1, br = PAD + (hi + 1) * cw - 1, yb = y2 + 4;
          ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(bl, yb); ctx.lineTo(bl, yb + 5); ctx.lineTo(Math.max(bl, br), yb + 5); ctx.lineTo(Math.max(bl, br), yb); ctx.stroke();
          ctx.fillStyle = C.ink2;
          const tl = 'lo ' + s.lo, th = 'hi ' + s.hi, wl = ctx.measureText(tl).width, wh = ctx.measureText(th).width;
          textAt(ctx, tl, Math.max(bl, PAD + wl), y2 + 21, 'right', PAD, w - PAD);
          textAt(ctx, th, Math.min(br, w - PAD - wh), y2 + 21, 'left', PAD, w - PAD);
        }
        // the race: comparisons so far, on a track as long as the array
        ctx.fillStyle = C.rule2; ctx.fillRect(PAD, y3, w - 2 * PAD, ROW.meter);
        if (s.comparisons) { ctx.fillStyle = done ? (found ? C.ok : C.err) : C.accent; ctx.fillRect(PAD, y3, Math.max(3, s.comparisons / n * (w - 2 * PAD)), ROW.meter); }
      });
    }

    build();
    setTarget(cfg.firstTarget ? cfg.firstTarget(a) : a[pick.int(a.length)], !cfg.noAutoplay);
    return () => { p.stop(); cv.stop(); tw.stop(); };
  }

  const SIZES = [8, 16, 24, 32, 48, 64, 128, 256, 512, 1024];

  A.register({
    id: 'linear-vs-binary', group: 'Searching', title: 'Linear search against binary search',
    blurb: 'The same sorted array searched two ways at once. One looks at every cell in turn; the other halves the range with each comparison. Watch the counts race, then make the array a thousand cells long.',
    mount: (host, api) => mountRace(host, api, {
      seed: 1006, size: 32, sizes: SIZES, speed: 38, label: 'Linear search and binary search on the same sorted array',
      hint: 'Click a cell to search for its value, or type any number as the target. Try the first cell, the last cell, and a value that is missing.',
      firstTarget: (a) => a[Math.floor(a.length * 0.72)],
      rows: [
        { name: 'Linear search', short: 'Linear', make: linearSteps, ptr: 'i', range: false, worst: (n) => n },
        { name: 'Binary search', short: 'Binary', make: binarySteps, ptr: 'mid', range: true, worst: maxBinaryComparisons }
      ]
    }),
    about: '<p><b>Linear search</b> looks at the cells in order until it finds the target or runs out of cells. It works on any array, sorted or not, and it costs O(n): a miss looks at all n cells, and a hit looks at about half of them on average.</p>' +
      '<p><b>Binary search</b> needs the array to be sorted. It keeps a range, <code>lo</code> to <code>hi</code>, that must hold the target if the target is there at all. It compares the target with the middle cell, <code>mid = lo + (hi − lo) / 2</code>, and throws away the half that cannot hold it. Each comparison halves the range, so it never needs more than ⌊log₂ n⌋ + 1 comparisons: 6 for 32 cells, 11 for 1,024, 20 for a million. That is O(log n).</p>' +
      '<p>The price is the sorting. A sorted array is worth it when you search it many times. Java’s <code>Arrays.binarySearch</code>, Python’s <code>bisect</code> module and C++’s <code>std::lower_bound</code> all do this, and <code>git bisect</code> uses the same halving to find the commit that introduced a bug.</p>',
    taught: [{ href: '#/dsa/1', text: 'SC 107 lesson 1: Counting the cost' }, { href: '#/dsa/2', text: 'SC 107 lesson 2: Searching' }, { href: '#/python/14', text: 'SC 101 lesson 14: Searching and sorting' }, { href: '#/cpp/12', text: 'SC 103 lesson 12: Searching and sorting' }]
  });

  // ---------- demo 2: guess my number
  const NS = [10, 100, 1000, 1000000];

  function mountGuess(host, api) {
    injectCss();
    const el = api.el, reduced = api.reducedMotion(), rnd = api.rng((Date.now() ^ 0x2545f491) >>> 0);
    let N = 100, mode = 'computer', secret = 1 + rnd.int(N);
    // the picture: band lo..hi (what is still possible), the latest guess and its reply, earlier guesses as marks
    let view = null, history = [];
    // the reader's game
    let game = null;

    const nSel = el('select', { 'aria-label': 'Range of numbers' }, NS.map((v) => el('option', { value: v }, '1 to ' + fmt(v))));
    nSel.value = String(N);
    const compBtn = el('button', { type: 'button', 'aria-pressed': 'true', onclick: () => setMode('computer') }, 'The computer guesses');
    const youBtn = el('button', { type: 'button', 'aria-pressed': 'false', onclick: () => setMode('you') }, 'You guess');
    host.append(el('div', { class: 'algo-controls as-setup' }, el('span', { class: 'as-seg', role: 'group', 'aria-label': 'Who guesses' }, compBtn, youBtn), el('label', {}, 'Numbers', nSel)));

    const secretIn = el('input', { type: 'number', min: 1, step: 1, 'aria-label': 'Your secret number' });
    const compRow = el('div', { class: 'algo-controls as-setup' },
      el('label', {}, 'Your secret number', secretIn),
      el('button', { class: 'btn', type: 'button', onclick: () => setSecret(1 + rnd.int(N), true) }, 'Random secret'));
    const guessIn = el('input', { type: 'number', min: 1, step: 1, 'aria-label': 'Your guess' });
    const hintBox = el('input', { type: 'checkbox' });
    const youRow = el('form', { class: 'algo-controls as-setup', onsubmit: (e) => { e.preventDefault(); playerGuess(); } },
      el('label', {}, 'Your guess', guessIn),
      el('button', { class: 'btn primary', type: 'submit' }, 'Guess'),
      el('button', { class: 'btn quiet', type: 'button', onclick: () => newGame() }, 'New number'),
      el('label', {}, hintBox, 'Show the halving guess'));
    host.append(compRow, youRow);

    const cv = api.canvas(host, { label: 'A number line: the range of numbers that can still be the secret, and the guesses so far', height: 206, draw });
    const tw = tweener(cv.redraw, () => host.isConnected, reduced);
    const feedback = el('p', { class: 'as-feedback', role: 'status' });
    const hist = el('ol', { class: 'as-history', 'aria-label': 'Guesses so far' });
    host.append(feedback, hist, legend(el, [['as-sw-pos', 'can still be the secret'], ['as-sw-cur', 'the latest guess'], ['as-sw-ok', 'correct'], ['as-sw-err', 'a guess that could not help']]));

    const p = api.player(host, {
      speeds: [0.5, 12], speed: 45,
      start: () => guessSteps(N, secret),
      onStep: (s) => {
        view = { lo: s.lo, hi: s.hi, guess: s.guess, reply: s.reply, count: s.count, marks: history.map((h) => h.guess) };
        history.push(s); addChip(s.guess, s.reply, false);
        show();
        p.status('Guess ' + s.count + ': ' + fmt(s.guess) + '. ' + (s.reply === 'correct' ? 'Correct.' : 'The answer: ' + s.reply + '.'));
      },
      onDone: (r) => p.status('Found ' + fmt(r.guess) + ' in ' + guesses(r.count) + '. Halving never needs more than ' + optimalGuesses(N) + ' for 1 to ' + fmt(N) + '.'),
      onReset: () => { history = []; hist.textContent = ''; view = { lo: 1, hi: N, guess: null, reply: null, count: 0, marks: [] }; show(true); p.status('The secret is ' + fmt(secret) + '. Press Play and the computer guesses by halving.'); }
    });

    function guesses(n) { return n + (n === 1 ? ' guess' : ' guesses'); }
    function show(jump) { tw.set({ lo: view.lo, hi: view.hi, g: view.guess == null ? -1 : view.guess }, jump); }
    function addChip(g, reply, waste) {
      hist.append(el('li', { class: reply === 'correct' ? 'as-ok' : waste ? 'as-waste' : null }, fmt(g) + (reply === 'correct' ? ' ✓' : reply === 'higher' ? ' higher ↑' : ' lower ↓')));
    }
    function setSecret(v, play) {
      secret = v; secretIn.value = String(v);
      p.reset();
      if (play && !reduced) p.play();
    }
    function newGame() {
      game = { secret: 1 + rnd.int(N), lo: 1, hi: N, count: 0, done: false };
      history = []; hist.textContent = '';
      view = { lo: 1, hi: N, guess: null, reply: null, count: 0, marks: [] }; show(true);
      guessIn.value = ''; guessIn.max = String(N); guessIn.disabled = false;
      say('I am thinking of a whole number from 1 to ' + fmt(N) + '. Halving always finds it in ' + optimalGuesses(N) + ' guesses or fewer. Can you?', '');
    }
    function say(text, cls) { feedback.textContent = text; feedback.className = 'as-feedback' + (cls ? ' ' + cls : ''); }
    function playerGuess() {
      if (!game || game.done) { newGame(); return; }
      const raw = guessIn.value.trim(), g = Number(raw);
      if (raw === '' || !Number.isInteger(g) || g < 1 || g > N) { say('Type a whole number from 1 to ' + fmt(N) + '.', 'as-err'); return; }
      const waste = g < game.lo || g > game.hi, before = [game.lo, game.hi];
      game.count++;
      const reply = g === game.secret ? 'correct' : game.secret > g ? 'higher' : 'lower';
      if (reply === 'higher') game.lo = Math.max(game.lo, g + 1); else if (reply === 'lower') game.hi = Math.min(game.hi, g - 1);
      view = { lo: reply === 'correct' ? g : game.lo, hi: reply === 'correct' ? g : game.hi, guess: g, reply, count: game.count, marks: view.marks.concat(view.guess == null ? [] : [view.guess]) };
      addChip(g, reply, waste && reply !== 'correct'); show();
      const opt = optimalGuesses(N);
      if (reply === 'correct') {
        game.done = true; guessIn.disabled = true;
        say('Correct: ' + fmt(g) + ' in ' + guesses(game.count) + '. ' + (game.count <= opt ? 'That is within the ' + opt + ' that halving guarantees.' : 'Halving would have needed at most ' + opt + '.') + ' Press Guess or New number to play again.', 'as-ok');
      } else if (waste) {
        say('Higher or lower: ' + reply + '. But you already knew it was between ' + fmt(before[0]) + ' and ' + fmt(before[1]) + ', so that guess told you nothing new.', 'as-err');
      } else {
        const left = game.hi - game.lo + 1;
        say(reply === 'higher' ? 'Higher. ' : 'Lower. ', '');
        feedback.textContent += left === 1 ? 'Only one number is left.' : fmt(left) + ' numbers are still possible: ' + fmt(game.lo) + ' to ' + fmt(game.hi) + '.';
      }
      guessIn.value = ''; if (!game.done) guessIn.focus();
    }
    function setMode(m) {
      mode = m;
      compBtn.setAttribute('aria-pressed', String(m === 'computer')); youBtn.setAttribute('aria-pressed', String(m === 'you'));
      compRow.classList.toggle('as-off', m !== 'computer'); youRow.classList.toggle('as-off', m !== 'you');
      p.controls.classList.toggle('as-off', m !== 'computer'); feedback.classList.toggle('as-off', m !== 'you');
      if (m === 'you') { p.pause(); newGame(); } else { secretIn.max = String(N); if (secret > N) secret = 1 + rnd.int(N); setSecret(secret, false); }
    }
    nSel.addEventListener('change', () => { N = +nSel.value || 100; if (mode === 'you') newGame(); else { secretIn.max = String(N); setSecret(secret > N ? 1 + rnd.int(N) : secret, false); } });
    secretIn.addEventListener('change', () => { const v = Number(secretIn.value); if (Number.isInteger(v) && v >= 1 && v <= N) setSecret(v, true); else secretIn.value = String(secret); });
    hintBox.addEventListener('change', cv.redraw);

    function draw(ctx, w, h, C) {
      ctx.clearRect(0, 0, w, h);
      if (!view) return;
      const PAD = 16, W = w - 2 * PAD, d = tw.get(), lo = d.lo, hi = d.hi;
      const edge = (v, A, B) => PAD + (v - A) / (B - A + 1) * W;          // left edge of number v on a line from A to B
      const mid = (v, A, B) => edge(v + 0.5, A, B);
      const correct = view.reply === 'correct';
      const gcol = correct ? C.ok : C.accent;
      // the whole range 1..N
      const yT = 50;
      ctx.fillStyle = C.rule; ctx.fillRect(PAD, yT - 2, W, 4);
      const bl = edge(lo, 1, N), br = Math.max(bl + 2, edge(hi + 1, 1, N));
      ctx.fillStyle = C.accent; ctx.globalAlpha = 0.22; ctx.fillRect(bl, yT - 8, br - bl, 16); ctx.globalAlpha = 1;
      ctx.strokeStyle = C.accent; ctx.lineWidth = 1.5; ctx.strokeRect(bl, yT - 8, br - bl, 16);
      ctx.font = '11px ' + C.mono; ctx.fillStyle = C.ink3;
      textAt(ctx, '1', PAD, yT + 24, 'left', PAD, w - PAD); textAt(ctx, fmt(N), w - PAD, yT + 24, 'right', PAD, w - PAD);
      ctx.fillStyle = C.ink3;
      for (const m of view.marks) ctx.fillRect(mid(m, 1, N) - 0.75, yT - 11, 1.5, 22);
      if (view.guess != null) {
        const gx = mid(d.g >= 1 ? d.g : view.guess, 1, N);
        ctx.fillStyle = gcol; triangle(ctx, gx, yT - 11, 6, true);
        ctx.font = '600 12px ' + C.mono; textAt(ctx, fmt(view.guess), gx, yT - 21, 'center', PAD, w - PAD);
      }
      // the zoom: the range that is still possible, stretched across the width
      const yZ = 128, zl = lo, zh = hi, count = zh - zl + 1;
      ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(bl, yT + 9); ctx.lineTo(PAD, yZ - 16); ctx.moveTo(br, yT + 9); ctx.lineTo(w - PAD, yZ - 16); ctx.stroke();
      ctx.setLineDash([]);
      const showCells = count <= 64 && W / count >= 5;
      if (showCells) {
        ctx.font = '11px ' + C.mono;
        for (let v = Math.ceil(zl - 1e-6); v <= Math.floor(zh + 1e-6); v++) {
          const x0 = edge(v, zl, zh), x1 = edge(v + 1, zl, zh), cw = x1 - x0, isG = view.guess === v && view.guess != null;
          ctx.fillStyle = isG ? gcol : C.accentSoft; ctx.fillRect(x0 + 1, yZ - 14, Math.max(1, cw - 2), 28);
          if (!isG) { ctx.strokeStyle = C.ink3; ctx.strokeRect(x0 + 1.5, yZ - 13.5, Math.max(1, cw - 3), 27); }
          const t = fmt(v);
          if (ctx.measureText(t).width <= cw - 4) { ctx.fillStyle = isG ? C.paper : C.ink; textAt(ctx, t, (x0 + x1) / 2, yZ + 4, 'center', x0, x1); }
        }
      } else {
        ctx.fillStyle = C.accent; ctx.globalAlpha = 0.22; ctx.fillRect(PAD, yZ - 9, W, 18); ctx.globalAlpha = 1;
        ctx.strokeStyle = C.accent; ctx.lineWidth = 1.5; ctx.strokeRect(PAD, yZ - 9, W, 18);
      }
      ctx.font = '11px ' + C.mono; ctx.fillStyle = C.ink2;
      textAt(ctx, 'lo ' + fmt(view.lo), PAD, yZ + 30, 'left', PAD, w - PAD);
      textAt(ctx, 'hi ' + fmt(view.hi), w - PAD, yZ + 30, 'right', PAD, w - PAD);
      if (view.guess != null && view.guess >= view.lo && view.guess <= view.hi) {
        const gx = mid(view.guess, zl, zh);
        ctx.fillStyle = gcol;
        if (!showCells) ctx.fillRect(gx - 1, yZ - 12, 2, 24);
        triangle(ctx, gx, yZ - 17, 6, true);
        ctx.font = '600 13px ' + C.sans;
        const msg = correct ? 'correct!' : view.reply === 'higher' ? 'higher →' : '← lower';
        textAt(ctx, msg, correct ? gx : view.reply === 'higher' ? gx + 10 : gx - 10, yZ - 24, correct ? 'center' : view.reply === 'higher' ? 'left' : 'right', PAD, w - PAD);
      } else if (view.guess != null && !correct) {
        ctx.font = '600 13px ' + C.sans; ctx.fillStyle = C.accent;
        textAt(ctx, view.reply === 'higher' ? fmt(view.guess) + ' was too low' : fmt(view.guess) + ' was too high', w / 2, yZ - 24, 'center', PAD, w - PAD);
      }
      if (mode === 'you' && hintBox.checked && game && !game.done) {
        const m = game.lo + Math.floor((game.hi - game.lo) / 2), x = mid(m, zl, zh);
        ctx.strokeStyle = C.ink2; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(x, yZ - 12); ctx.lineTo(x, yZ + 14); ctx.stroke(); ctx.setLineDash([]);
        ctx.font = '11px ' + C.mono; ctx.fillStyle = C.ink2; textAt(ctx, 'halving guess: ' + fmt(m), x, yZ + 30, 'center', PAD + 60, w - PAD - 60);
      }
      // the count: one dot per guess, against the number halving needs at worst
      const opt = optimalGuesses(N), total = Math.max(opt, view.count), yB = h - 18;
      ctx.font = '12px ' + C.sans; ctx.fillStyle = C.ink2;
      const lw = textAt(ctx, 'Guesses', PAD, yB + 4, 'left', PAD, w - PAD);
      ctx.font = '12px ' + C.mono;
      const tail = view.count + ' / ' + opt, tWid = ctx.measureText(tail).width;
      textAt(ctx, tail, w - PAD, yB + 4, 'right', PAD, w - PAD);
      const x0 = PAD + lw + 12, room = w - PAD - tWid - 12 - x0, step = Math.min(16, room / total), r = Math.max(2, Math.min(5, step / 2 - 1));
      for (let i = 0; i < total; i++) {
        const x = x0 + i * step + step / 2;
        ctx.beginPath(); ctx.arc(x, yB, r, 0, Math.PI * 2);
        if (i < view.count) { ctx.fillStyle = i >= opt ? C.err : (correct && i === view.count - 1 ? C.ok : C.accent); ctx.fill(); }
        else { ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.stroke(); }
      }
    }

    secretIn.value = String(secret); secretIn.max = String(N);
    setMode('computer');
    return () => { p.stop(); cv.stop(); tw.stop(); };
  }

  A.register({
    id: 'guess-number', group: 'Searching', title: 'Guess my number',
    blurb: 'Binary search as a game. Pick a secret and watch the computer find it by halving, or let the computer pick and see whether you can match it.',
    mount: mountGuess,
    about: '<p>Every answer of "higher" or "lower" rules out about half of the numbers that were left. Guessing the middle each time is binary search, and it never needs more than ⌈log₂(N + 1)⌉ guesses: 4 for 1 to 10, 7 for 1 to 100, 10 for 1 to 1,000 and 20 for 1 to 1,000,000. That is O(log N).</p>' +
      '<p>No method can promise to do better. With k guesses you can tell apart at most 1 + 2 + 4 + … + 2<sup>k−1</sup> = 2<sup>k</sup> − 1 numbers: one you guess first, then one for each answer to that, and so on. So 100 numbers need 7 guesses in the worst case, because 2⁶ − 1 = 63 is too few.</p>' +
      '<p>The same idea is the game of twenty questions (2²⁰ is just over a million), and <code>git bisect</code>, which finds the commit that broke a program by testing the one halfway between a good version and a bad one.</p>',
    taught: [{ href: '#/python/14', text: 'SC 101 lesson 14: Searching and sorting' }, { href: '#/dsa/2', text: 'SC 107 lesson 2: Searching' }, { href: '#/math/13', text: 'SC 104 lesson 13: Counting steps' }]
  });

  // ---------- demo 3: interpolation search
  A.register({
    id: 'interpolation-search', group: 'Searching', title: 'Interpolation search',
    blurb: 'Binary search always looks in the middle. Interpolation search guesses where the value should be, the way you open a dictionary near the end for a word starting with W. Sometimes that is much faster, and sometimes much slower.',
    mount: (host, api) => mountRace(host, api, {
      seed: 4242, size: 256, sizes: SIZES, speed: 25, speeds: [0.7, 120], bars: true, kinds: KINDS,
      label: 'Binary search and interpolation search on the same sorted array; each bar is as tall as its value',
      hint: 'Each bar is as tall as its value. Try each way of spreading the values, and look for small targets when they are steep.',
      rows: [
        { name: 'Binary search', short: 'Binary', make: binarySteps, ptr: 'mid', range: true, worst: maxBinaryComparisons },
        { name: 'Interpolation search', short: 'Interpolation', make: interpolationSteps, ptr: 'guess', range: true, worst: (n) => n }
      ]
    }),
    about: '<p><b>Interpolation search</b> works on a sorted array, like binary search, but instead of comparing with the middle cell of <code>lo</code> to <code>hi</code> it estimates where the target should be from the values at the two ends: <code>pos = lo + (target − a[lo]) × (hi − lo) / (a[hi] − a[lo])</code>. Then it keeps the part that can still hold the target, exactly as binary search does.</p>' +
      '<p>When the values are spread evenly the estimate is very good, and it needs about log₂(log₂ n) comparisons on average: about 5 for a million values, where binary search needs about 20. When the values are bunched, the estimate can be poor every time, and in the worst case it looks at the cells almost one at a time: O(n). Each step also costs a multiplication and a division instead of a halving, and it checks the target against both ends of the range (the counts here, like binary search’s, count only the comparisons with the cell it picks).</p>' +
      '<p>That is why libraries use binary search: its worst case is guaranteed. Interpolation search pays off only when you know the keys are spread evenly, for example numbers drawn at random, and people use it without thinking whenever they open a dictionary or a phone book near the right letter.</p>',
    taught: [{ href: '#/dsa/2', text: 'SC 107 lesson 2: Searching' }]
  });

  // ---------- self-test (node): the searches end with the right answer, within their bounds
  function runAll(gen) {
    const steps = [];
    for (;;) { const r = gen.next(); if (r.done) return { steps, value: r.value }; steps.push(r.value); }
  }
  function selfTest() {
    const fails = [];
    const fail = (m) => { if (fails.length < 30) fails.push(m); };
    const rnd = A.rng(20261002);
    // known values of the bounds
    [[1, 1], [2, 2], [3, 2], [8, 4], [32, 6], [1000, 10], [1024, 11], [1000000, 20]].forEach(([n, k]) => { if (maxBinaryComparisons(n) !== k) fail('maxBinaryComparisons(' + n + ') = ' + maxBinaryComparisons(n) + ', expected ' + k); });
    [[10, 4], [100, 7], [1000, 10], [1000000, 20]].forEach(([n, k]) => { if (optimalGuesses(n) !== k) fail('optimalGuesses(' + n + ') = ' + optimalGuesses(n) + ', expected ' + k); });
    for (let N = 1; N <= 5000; N++) { const c = Math.ceil(Math.log2(N + 1) - 1e-12); if (optimalGuesses(N) !== c) { fail('optimalGuesses(' + N + ') is not ceil(log2(N+1))'); break; } }
    // the searches on many random arrays and targets
    const searches = [['linear', linearSteps], ['binary', binarySteps], ['interpolation', interpolationSteps]];
    for (let c = 0; c < 600; c++) {
      const n = c < 20 ? c + 1 : 1 + rnd.int(c % 3 ? 70 : 1100), kind = KINDS[c % 3].id;
      const a = makeArray(n, kind, A.rng(c * 31 + 7));
      for (let i = 1; i < n; i++) if (!(a[i] > a[i - 1])) { fail(kind + ' array of ' + n + ' is not strictly increasing at ' + i); break; }
      if (!a.every(Number.isSafeInteger)) fail(kind + ' array of ' + n + ' holds a value that is not a safe integer');
      const present = rnd() < 0.6, t = present ? a[rnd.int(n)] : absentValue(a, rnd);
      const expect = a.indexOf(t);
      if (!present && expect !== -1) { fail('absentValue gave ' + t + ', which is in the array'); continue; }
      const lb = lowerBound(a, t);
      if (lb < 0 || lb > n || (lb < n && a[lb] < t) || (lb > 0 && a[lb - 1] >= t)) fail('lowerBound wrong for ' + t + ' in ' + kind + ' n=' + n);
      const results = {};
      for (const [name, f] of searches) {
        const { steps, value } = runAll(f(a, t));
        results[name] = value;
        const where = name + ' search, ' + kind + ' n=' + n + ' t=' + t;
        if (value.index !== expect) fail(where + ': returned ' + value.index + ', expected ' + expect);
        if (value.comparisons !== steps.length) fail(where + ': counted ' + value.comparisons + ' comparisons but made ' + steps.length);
        steps.forEach((s, k) => {
          if (s.comparisons !== k + 1) fail(where + ': step ' + k + ' says ' + s.comparisons + ' comparisons');
          if (!(s.cur >= s.lo && s.cur <= s.hi && s.lo >= 0 && s.hi < n)) fail(where + ': compared cell ' + s.cur + ' outside ' + s.lo + '..' + s.hi);
          if (s.rel !== relOf(a[s.cur], t)) fail(where + ': wrong comparison at step ' + k);
        });
        if (value.comparisons > n) fail(where + ': ' + value.comparisons + ' comparisons on ' + n + ' cells');
      }
      if (results.linear.comparisons !== (expect >= 0 ? expect + 1 : n)) fail('linear search on n=' + n + ' made ' + results.linear.comparisons + ' comparisons');
      if (results.binary.comparisons > maxBinaryComparisons(n)) fail('binary search on n=' + n + ' made ' + results.binary.comparisons + ' comparisons, more than floor(log2 n)+1 = ' + maxBinaryComparisons(n));
      if (expect < 0 && results.binary.lo !== lb) fail('binary search miss on n=' + n + ' ended with lo=' + results.binary.lo + ', not the insertion point ' + lb);
      // the race ends in the same place as the searches run alone, and stops when the slowest has finished
      const { steps: ticks, value: fin } = runAll(race(a, t, searches.map((s) => s[1])));
      searches.forEach(([name], k) => {
        if (fin[k].result !== results[name].index || fin[k].comparisons !== results[name].comparisons) fail('race: ' + name + ' ended differently from the search run alone');
      });
      const longest = Math.max(...searches.map(([name]) => results[name].comparisons));
      if (ticks.length !== longest + 1) fail('race on n=' + n + ' took ' + ticks.length + ' ticks, expected ' + (longest + 1));
    }
    // the binary bound is reached: for every n up to 300 some target needs exactly floor(log2 n)+1 comparisons
    for (let n = 1; n <= 300; n++) {
      const a = makeArray(n, 'even', A.rng(n));
      let worst = 0;
      for (let i = 0; i < n; i++) worst = Math.max(worst, runAll(binarySteps(a, a[i])).value.comparisons);
      worst = Math.max(worst, runAll(binarySteps(a, a[n - 1] + 1)).value.comparisons);
      if (worst !== maxBinaryComparisons(n)) fail('binary search worst case on n=' + n + ' is ' + worst + ', expected ' + maxBinaryComparisons(n));
    }
    if (runAll(binarySteps([], 5)).value.index !== -1 || runAll(linearSteps([], 5)).value.index !== -1 || runAll(interpolationSteps([], 5)).value.index !== -1) fail('a search of an empty array did not return -1');
    // interpolation search is fast on even data: a million evenly spread values, a few comparisons
    const big = makeArray(1000000, 'even', A.rng(99));
    let total = 0;
    for (let c = 0; c < 200; c++) { const r = runAll(interpolationSteps(big, big[rnd.int(big.length)])).value; total += r.comparisons; if (r.index < 0) fail('interpolation search missed a present value in a million'); }
    if (total / 200 > 8) fail('interpolation search averaged ' + (total / 200) + ' comparisons on a million even values (expected about 5)');
    // guess my number: every secret found, within the bound, and the bound is reached
    for (let N = 1; N <= 300; N++) {
      let worst = 0;
      for (let s = 1; s <= N; s++) {
        const { steps, value } = runAll(guessSteps(N, s));
        if (value.guess !== s) { fail('guess my number 1..' + N + ': secret ' + s + ' not found'); break; }
        if (value.count !== steps.length) fail('guess my number 1..' + N + ': miscounted');
        if (steps.some((st) => st.guess < st.lo || st.guess > st.hi || st.lo < 1 || st.hi > N)) fail('guess my number 1..' + N + ': guessed outside the range');
        worst = Math.max(worst, value.count);
      }
      if (worst !== optimalGuesses(N)) fail('guess my number 1..' + N + ': worst case ' + worst + ', expected ' + optimalGuesses(N));
    }
    for (const N of [1000, 1000000]) for (let c = 0; c < 300; c++) {
      const s = 1 + rnd.int(N), r = runAll(guessSteps(N, s)).value;
      if (r.guess !== s || r.count > optimalGuesses(N)) fail('guess my number 1..' + N + ': secret ' + s + ' took ' + r.count);
    }
    return fails;
  }

  if (typeof module !== 'undefined') module.exports = { selfTest, linearSteps, binarySteps, interpolationSteps, race, guessSteps, makeArray, absentValue, lowerBound, maxBinaryComparisons, optimalGuesses };
})();
