/* Algorithms in motion: puzzles and simulations. Four demos for the #/algorithms page (see src/algos.js for the frame):
   - hanoi: the Towers of Hanoi, to play by hand (click a peg, or press 1, 2, 3) or to watch solved by recursion, with the move count
     against the fewest possible, 2^n - 1;
   - tour: the travelling salesman: click the towns in order to draw your own round trip, then race the computer, which builds a tour
     with the nearest-neighbour rule and untangles it with 2-opt until no two roads cross;
   - life: Conway's Game of Life on a grid you draw on, with gliders, oscillators and a glider gun to start from;
   - raindrops: estimating pi by letting random drops fall on a square with a quarter circle in it (the Monte Carlo method).
   The algorithms are pure (no DOM) and checked by selfTest() in node (test_algos.js). */
(function () {
  const A = (typeof window !== 'undefined' && window.ALGOS) || require('./algos.js');
  const GROUP = 'Puzzles and simulations';

  // ================================================================== pure algorithms

  /** The recursive solution of the Towers of Hanoi: yields [from, to] for each move of n discs from peg a to peg c by way of b. */
  function* hanoi(n, a, c, b) {
    if (n === 0) return;
    yield* hanoi(n - 1, a, b, c);
    yield [a, c];
    yield* hanoi(n - 1, b, c, a);
  }
  /** A move is legal when the source peg has a disc and the target is empty or has a bigger disc on top. */
  const legal = (pegs, f, t) => f !== t && pegs[f].length > 0 && (pegs[t].length === 0 || pegs[t][pegs[t].length - 1] > pegs[f][pegs[f].length - 1]);
  const startPegs = (n) => [Array.from({ length: n }, (_, k) => n - k), [], []];

  // ---------- the travelling salesman: points [x, y], a tour is an order of the point indexes
  const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  function tourLength(pts, t) { let s = 0; for (let k = 0; k < t.length; k++) s += dist(pts[t[k]], pts[t[(k + 1) % t.length]]); return s; }
  /** Nearest neighbour: from the first town, always go to the nearest town not yet visited. Yields the tour after each town is added. */
  function* nearestNeighbour(pts) {
    const n = pts.length; if (!n) return [];
    const used = new Uint8Array(n), t = [0]; used[0] = 1; yield t.slice();
    while (t.length < n) {
      const last = pts[t[t.length - 1]]; let best = -1, bd = Infinity;
      for (let j = 0; j < n; j++) if (!used[j]) { const d = dist(last, pts[j]); if (d < bd - 1e-12) { bd = d; best = j; } }
      used[best] = 1; t.push(best); yield t.slice();
    }
    return t;
  }
  /** Do the segments p1-p2 and p3-p4 cross (properly, not just touch at an end)? */
  function crosses(p1, p2, p3, p4) {
    const o = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    const d1 = o(p3, p4, p1), d2 = o(p3, p4, p2), d3 = o(p1, p2, p3), d4 = o(p1, p2, p4);
    return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
  }
  function crossings(pts, t) {
    const n = t.length; let c = 0;
    for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;   // neighbouring roads share a town
      if (crosses(pts[t[i]], pts[t[(i + 1) % n]], pts[t[j]], pts[t[(j + 1) % n]])) c++;
    }
    return c;
  }
  /** 2-opt: while some pair of roads a-b and c-d can be swapped for a-c and b-d to make the tour shorter, do it (reversing the part
      between). Two roads that cross can always be uncrossed this way, so the result has no crossings. Yields { tour, i, j } after each
      improvement, i and j being the positions of the two roads that were swapped. */
  function* twoOpt(pts, start) {
    const t = start.slice(), n = t.length;
    if (n < 4) return t;
    let improved = true, guard = 0;
    while (improved && guard++ < 10000) {
      improved = false;
      for (let i = 0; i < n - 1; i++) for (let j = i + 2; j < n; j++) {
        if (i === 0 && j === n - 1) continue;
        const a = pts[t[i]], b = pts[t[i + 1]], c = pts[t[j]], d = pts[t[(j + 1) % n]];
        if (dist(a, c) + dist(b, d) < dist(a, b) + dist(c, d) - 1e-9) {
          for (let lo = i + 1, hi = j; lo < hi; lo++, hi--) { const x = t[lo]; t[lo] = t[hi]; t[hi] = x; }
          improved = true;
          yield { tour: t.slice(), i, j };
        }
      }
    }
    return t;
  }
  /** n towns in the unit square, seeded, at least minGap apart so that they can be clicked. */
  function makeTowns(n, seed) {
    const r = A.rng(seed), pts = [], gap = 0.55 / Math.sqrt(n);
    for (let tries = 0; pts.length < n && tries < 20000; tries++) {
      const p = [0.06 + 0.88 * r(), 0.06 + 0.88 * r()];
      if (pts.every((q) => dist(p, q) >= gap)) pts.push(p);
    }
    return pts;
  }

  // ---------- the Game of Life on an R x C grid (cells 0/1), the edges wrapping round
  function lifeStep(g, R, C) {
    const out = new Uint8Array(R * C);
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      let k = 0;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if (dr || dc) k += g[((r + dr + R) % R) * C + ((c + dc + C) % C)];
      const i = r * C + c;
      out[i] = (k === 3 || (k === 2 && g[i])) ? 1 : 0;
    }
    return out;
  }
  // patterns as rows of text, # alive
  const PATTERNS = {
    glider: { name: 'Glider', rows: ['.#.', '..#', '###'] },
    lwss: { name: 'Spaceship', rows: ['.#..#', '#....', '#...#', '####.'] },
    blinker: { name: 'Blinker, toad and beacon', rows: ['.............', '###..........', '.............', '.............', '.............', '.###.....##..', '###......##..', '...........##', '...........##'] },
    pulsar: { name: 'Pulsar', rows: ['..###...###..', '.............', '#....#.#....#', '#....#.#....#', '#....#.#....#', '..###...###..', '.............', '..###...###..', '#....#.#....#', '#....#.#....#', '#....#.#....#', '.............', '..###...###..'] },
    rpent: { name: 'R-pentomino', rows: ['.##', '##.', '.#.'] },
    acorn: { name: 'Acorn', rows: ['.#.....', '...#...', '##..###'] },
    gun: { name: 'Gosper glider gun', rows: [
      '........................#...........', '......................#.#...........', '............##......##............##',
      '...........#...#....##............##', '##........#.....#...##..............', '##........#...#.##....#.#...........',
      '..........#.....#.......#...........', '...........#...#....................', '............##......................'] }
  };
  function placePattern(R, C, key) {
    const g = new Uint8Array(R * C), rows = PATTERNS[key].rows, h = rows.length, w = rows[0].length;
    const r0 = Math.max(0, Math.floor((R - h) / 2)), c0 = key === 'gun' ? 2 : key === 'glider' || key === 'lwss' ? 3 : Math.max(0, Math.floor((C - w) / 2));
    rows.forEach((row, dr) => { for (let dc = 0; dc < row.length; dc++) if (row[dc] === '#' && r0 + dr < R && c0 + dc < C) g[(r0 + dr) * C + c0 + dc] = 1; });
    return g;
  }

  // ---------- raindrops: drops in the unit square; inside the quarter circle when x² + y² ≤ 1
  function drops(n, seed) { const r = A.rng(seed); let inside = 0; for (let k = 0; k < n; k++) { const x = r(), y = r(); if (x * x + y * y <= 1) inside++; } return inside; }

  // ================================================================== the page

  const CSS = `
.pz-row { display: flex; flex-wrap: wrap; gap: 0.6rem 1.2rem; align-items: center; font-family: var(--sans); margin: 0.4rem 0; }
.pz-big { font-family: var(--sans); font-size: 1.05rem; margin: 0.5rem 0; min-height: 1.6em; }
.pz-big b { font-variant-numeric: tabular-nums; }
.pz-win { color: var(--ok); font-weight: 600; }
.pz-stats { display: flex; flex-wrap: wrap; gap: 0.4rem 1.4rem; font-family: var(--sans); font-size: 0.95rem; color: var(--ink-2); margin: 0.4rem 0; font-variant-numeric: tabular-nums; }
.pz-stats b { color: var(--ink); }
.pz-canvas canvas { touch-action: none; cursor: pointer; }
`;
  function injectCss() {
    if (document.getElementById('algo-puzzles-css')) return;
    const s = document.createElement('style'); s.id = 'algo-puzzles-css'; s.textContent = CSS; document.head.appendChild(s);
  }
  const fmt = (x) => Math.round(x).toLocaleString('en-US');
  const DISC_HUES = [8, 32, 50, 95, 160, 200, 235, 280, 320];
  /** Cheerful little notes for a win, made on the reader's click (Web Audio). */
  function chime() {
    const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
    if (!AC) return null;
    let ac = null;
    return {
      start() { if (!ac) ac = new AC(); if (ac.state === 'suspended') ac.resume(); },
      play(freqs, gap) {
        if (!ac || ac.state !== 'running') return;
        freqs.forEach((f, k) => {
          const t = ac.currentTime + k * (gap || 0.09), o = ac.createOscillator(), g = ac.createGain();
          o.type = 'triangle'; o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.08, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
          o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 0.3);
        });
      },
      stop() { if (ac) { try { ac.close(); } catch (e) { /* ignore */ } } ac = null; }
    };
  }
  function soundToggle(el, snd) {
    let on = false;
    const b = el('button', { class: 'btn quiet', type: 'button', 'aria-pressed': 'false', onclick: () => { if (!snd) return; on = !on; b.setAttribute('aria-pressed', String(on)); b.textContent = on ? 'Sound on' : 'Sound off'; if (on) snd.start(); } }, snd ? 'Sound off' : 'No sound here');
    if (!snd) b.disabled = true;
    return { button: b, on: () => on };
  }

  /** Call fn at most once per animation frame (the counters and the canvas are redrawn once, however many steps were taken). */
  function onceAFrame(fn) { let raf = 0; const go = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; fn(); }); }; go.cancel = () => { if (raf) cancelAnimationFrame(raf); raf = 0; }; return go; }

  // ---------------------------------------------------------------- demo: the Towers of Hanoi
  function mountHanoi(host, api) {
    injectCss();
    const el = api.el, snd = chime(), sound = soundToggle(el, snd);
    let n = 4, pegs = startPegs(n), held = -1, moves = 0, watching = false, wonShown = false, shake = 0;
    const sizeSel = el('select', { 'aria-label': 'Number of discs', onchange: () => { n = +sizeSel.value; pl.reset(); } }, [3, 4, 5, 6, 7, 8].map((k) => el('option', { value: String(k) }, k + ' discs')));
    sizeSel.value = String(n);
    const big = el('p', { class: 'pz-big', role: 'status' });
    host.append(el('div', { class: 'algo-controls' }, el('label', {}, 'Size ', sizeSel), el('button', { class: 'btn', onclick: () => pl.reset() }, 'Start again'), sound.button));
    host.append(el('p', { class: 'ap-hint pz-hint' }, 'Move the whole tower to the right-hand peg. Click a peg to pick up its top disc, then click the peg to put it on (or press 1, 2 and 3). A disc may never sit on a smaller one.'));
    const cv = api.canvas(host, { label: 'Three pegs and a tower of discs', maxWidth: 900, height: (w) => Math.round(Math.max(200, Math.min(360, w * 0.42))), draw });
    cv.canvas.parentNode.classList.add('pz-canvas');
    cv.canvas.tabIndex = 0;
    host.append(big);
    const pl = api.player(host, {
      speeds: [1, 60], speed: 35,
      start: () => { pegs = startPegs(n); held = -1; moves = 0; watching = true; wonShown = false; return hanoi(n, 0, 2, 1); },
      onStep: ([f, t]) => { pegs[t].push(pegs[f].pop()); moves++; if (sound.on() && snd) snd.play([220 + 40 * pegs[t][pegs[t].length - 1]], 0); later(); },
      onDone: () => { update(); },
      onReset: () => { restart(); }
    });
    pl.controls.prepend(el('span', { class: 'ap-hint' }, 'Play: watch the computer solve it.'));
    const later = onceAFrame(() => update());
    const min = () => Math.pow(2, n) - 1;
    function restart() { pegs = startPegs(n); held = -1; moves = 0; watching = false; wonShown = false; update(); }
    function solved() { return pegs[2].length === n; }
    function update() {
      const best = min();
      if (solved()) {
        big.replaceChildren(el('span', { class: 'pz-win' }, watching ? 'Done: the recursive solution takes ' + fmt(best) + ' moves, the fewest possible.' : moves === best ? 'Perfect! ' + moves + ' moves, the fewest possible.' : 'Solved in ' + moves + ' moves. The fewest possible is ' + best + ': can you do it in ' + best + '?'));
        if (!wonShown && !watching && sound.on() && snd) snd.play(moves === best ? [523, 659, 784, 1047] : [523, 659, 784]);
        wonShown = true;
      } else big.replaceChildren('Moves: ', el('b', {}, String(moves)), ' · fewest possible: ', el('b', {}, fmt(best)), held >= 0 ? ' · holding the disc of size ' + pegs[held][pegs[held].length - 1] : '');
      cv.redraw();
    }
    function tap(peg) {
      if (pl.isRunning()) return;
      if (watching) pl.reset();
      if (solved()) return;
      if (held < 0) { if (pegs[peg].length) held = peg; }
      else if (held === peg) held = -1;
      else if (legal(pegs, held, peg)) { pegs[peg].push(pegs[held].pop()); held = -1; moves++; if (sound.on() && snd) snd.play([220 + 40 * pegs[peg][pegs[peg].length - 1]], 0); }
      else { shake = performance.now(); setTimeout(() => cv.redraw(), 260); }
      update();
    }
    cv.canvas.addEventListener('pointerdown', (e) => { const r = cv.canvas.getBoundingClientRect(); tap(Math.max(0, Math.min(2, Math.floor((e.clientX - r.left) / r.width * 3)))); });
    cv.canvas.addEventListener('keydown', (e) => { if (e.key === '1' || e.key === '2' || e.key === '3') { e.preventDefault(); tap(+e.key - 1); } });
    function draw(ctx, w, h, c) {
      ctx.fillStyle = c.paper; ctx.fillRect(0, 0, w, h);
      const base = h - 24, pegH = h - 70, dh = Math.min(26, (pegH - 10) / (n + 1.5)), maxW = w / 3 - 24, minW = Math.min(46, maxW * 0.3);
      const shaking = performance.now() - shake < 250;
      ctx.fillStyle = c.ink3; ctx.fillRect(12, base, w - 24, 6);
      for (let p = 0; p < 3; p++) {
        const cx = w / 6 + p * w / 3;
        ctx.fillStyle = c.ink3; ctx.fillRect(cx - 4, base - pegH, 8, pegH);
        ctx.fillStyle = c.ink2; ctx.font = '600 13px ' + (c.sans || 'sans-serif'); ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText(String(p + 1), cx, base + 8);
        pegs[p].forEach((d, k) => {
          const lifted = p === held && k === pegs[p].length - 1, dw = minW + (maxW - minW) * (d - 1) / Math.max(1, n - 1);
          const x = cx - dw / 2 + (lifted && shaking ? Math.sin(performance.now() / 20) * 4 : 0), y = lifted ? base - pegH - dh - 8 : base - (k + 1) * dh;
          ctx.fillStyle = 'hsl(' + DISC_HUES[(d - 1) % DISC_HUES.length] + ', 70%, 55%)';
          ctx.beginPath(); const rr = Math.min(8, dh / 2); ctx.moveTo(x + rr, y); ctx.arcTo(x + dw, y, x + dw, y + dh - 2, rr); ctx.arcTo(x + dw, y + dh - 2, x, y + dh - 2, rr); ctx.arcTo(x, y + dh - 2, x, y, rr); ctx.arcTo(x, y, x + dw, y, rr); ctx.fill();
          ctx.strokeStyle = c.ink; ctx.lineWidth = lifted ? 2 : 1; ctx.stroke();
        });
      }
    }
    update();
    return () => { pl.stop(); cv.stop(); later.cancel(); if (snd) snd.stop(); };
  }

  // ---------------------------------------------------------------- demo: untangle the tour
  function mountTour(host, api) {
    injectCss();
    const el = api.el, snd = chime(), sound = soundToggle(el, snd);
    let count = 12, seed = 1 + Math.floor(Math.random() * 99999), pts = makeTowns(count, seed), mine = [], comp = [], phase = 'nn', swapAt = null, compDone = false;
    const sizeSel = el('select', { 'aria-label': 'Number of towns', onchange: () => { count = +sizeSel.value; fresh(); } }, [6, 8, 12, 16, 25, 40, 80].map((k) => el('option', { value: String(k) }, k + ' towns')));
    sizeSel.value = String(count);
    const fromMine = el('input', { type: 'checkbox' });
    host.append(el('div', { class: 'algo-controls' }, el('label', {}, 'Size ', sizeSel),
      el('button', { class: 'btn', onclick: () => { seed = 1 + Math.floor(Math.random() * 999999); fresh(); } }, 'New towns'),
      el('button', { class: 'btn quiet', onclick: () => { mine = []; pl.reset(); update(); } }, 'Clear my tour'),
      el('label', {}, fromMine, 'Computer starts from my tour'), sound.button));
    host.append(el('p', { class: 'ap-hint' }, 'A salesperson must visit every town once and come home. Click the towns in the order you would visit them; your tour closes by itself after the last one. Then press Play and see whether the computer can beat you.'));
    const stats = el('div', { class: 'pz-stats' }), big = el('p', { class: 'pz-big', role: 'status' });
    const cv = api.canvas(host, { label: 'Towns to visit, your tour and the computer\'s', maxWidth: 1000, height: (w) => Math.round(Math.min(560, w * 0.62)), draw });
    cv.canvas.parentNode.classList.add('pz-canvas');
    host.append(stats, big);
    const pl = api.player(host, {
      speeds: [1, 400], speed: 30,
      start: () => { comp = []; swapAt = null; compDone = false; return run(); },
      onStep: (ev) => { comp = ev.tour; phase = ev.phase; swapAt = ev.swap || null; if (ev.swap && sound.on() && snd) snd.play([300 + 600 * Math.random()], 0); later(); },
      onDone: () => { compDone = true; swapAt = null; update(); },
      onReset: () => { comp = []; swapAt = null; compDone = false; update(); }
    });
    function* run() {
      let t;
      if (fromMine.checked && mine.length === pts.length) { t = mine.slice(); yield { tour: t, phase: 'start' }; }
      else { const it = nearestNeighbour(pts); for (;;) { const r = it.next(); if (r.done) { t = r.value; break; } yield { tour: r.value, phase: 'nn' }; } }
      const it2 = twoOpt(pts, t);
      for (;;) { const r = it2.next(); if (r.done) break; yield { tour: r.value.tour, phase: '2opt', swap: [r.value.i, r.value.j] }; }
    }
    const later = onceAFrame(() => update());
    function fresh() { pts = makeTowns(count, seed); mine = []; pl.reset(); update(); }
    const W = () => cv.size().w, H = () => cv.size().h;
    const toPx = (p) => { const w = W(), h = H(), s = Math.min(w, h * 1.6); return [(w - s) / 2 + p[0] * s, 8 + p[1] * (h - 16)]; };
    cv.canvas.addEventListener('pointerdown', (e) => {
      if (pl.isRunning() || mine.length === pts.length) return;
      const r = cv.canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      let best = -1, bd = 30;
      pts.forEach((p, i) => { const [px, py] = toPx(p), d = Math.hypot(px - x, py - y); if (d < bd && !mine.includes(i)) { bd = d; best = i; } });
      if (best >= 0) { mine.push(best); if (sound.on() && snd) snd.play([330 + 20 * mine.length], 0); if (mine.length === pts.length && sound.on() && snd) snd.play([392, 523, 659]); update(); }
    });
    function update() {
      const ml = mine.length === pts.length ? tourLength(pts, mine) : null, cl = comp.length === pts.length ? tourLength(pts, comp) : null;
      const unit = (x) => (x * 100).toFixed(1);
      stats.replaceChildren(
        el('span', {}, 'Your tour: ', el('b', {}, ml != null ? unit(ml) + ' km' : mine.length + ' of ' + pts.length + ' towns'), ml != null ? ' · ' + crossings(pts, mine) + ' crossings' : ''),
        el('span', {}, 'Computer: ', el('b', {}, cl != null ? unit(cl) + ' km' : comp.length ? 'building…' : 'not started'), cl != null ? ' · ' + crossings(pts, comp) + ' crossings' : ''));
      let msg = '';
      if (compDone && cl != null) {
        if (ml == null) msg = 'The computer\'s tour: ' + unit(cl) + ' km, with no crossings. Draw your own and try to beat it.';
        else if (ml < cl - 1e-9) msg = 'You beat the computer by ' + unit(cl - ml) + ' km! Its quick rules found a good tour, not the best one.';
        else if (Math.abs(ml - cl) < 1e-6) msg = 'A tie: you found the same length as the computer.';
        else msg = 'The computer wins by ' + unit(ml - cl) + ' km. Look for places where your roads cross.';
      } else if (comp.length) msg = phase === '2opt' ? 'Untangling: two roads swapped for two shorter ones.' : phase === 'start' ? 'Starting from your tour.' : 'Nearest neighbour: always drive to the closest town not yet visited.';
      big.replaceChildren(compDone && ml != null && ml < cl - 1e-9 ? el('span', { class: 'pz-win' }, msg) : msg);
      if (compDone && ml != null && ml < cl - 1e-9 && sound.on() && snd) snd.play([523, 659, 784, 1047]);
      cv.redraw();
    }
    function path(ctx, t, closed) { t.forEach((i, k) => { const [x, y] = toPx(pts[i]); if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); }); if (closed && t.length > 2) ctx.closePath(); }
    function draw(ctx, w, h, c) {
      ctx.fillStyle = c.paper; ctx.fillRect(0, 0, w, h);
      if (comp.length > 1) { ctx.beginPath(); path(ctx, comp, comp.length === pts.length); ctx.strokeStyle = c.accent; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke(); }
      if (swapAt && comp.length === pts.length) {
        const n = comp.length; ctx.strokeStyle = c.ok; ctx.lineWidth = 5;
        for (const k of swapAt) { const a = toPx(pts[comp[k]]), b = toPx(pts[comp[(k + 1) % n]]); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
      }
      if (mine.length > 1) { ctx.beginPath(); path(ctx, mine, mine.length === pts.length); ctx.strokeStyle = c.warn; ctx.lineWidth = 2; ctx.setLineDash([7, 5]); ctx.stroke(); ctx.setLineDash([]); }
      pts.forEach((p, i) => {
        const [x, y] = toPx(p), k = mine.indexOf(i);
        ctx.beginPath(); ctx.arc(x, y, 9, 0, 2 * Math.PI); ctx.fillStyle = i === 0 ? c.ok : c.paper; ctx.fill(); ctx.strokeStyle = c.ink; ctx.lineWidth = 2; ctx.stroke();
        if (k >= 0) { ctx.fillStyle = i === 0 ? c.paper : c.ink; ctx.font = '600 10px ' + (c.sans || 'sans-serif'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(k + 1), x, y + 0.5); }
      });
    }
    update();
    return () => { pl.stop(); cv.stop(); later.cancel(); if (snd) snd.stop(); };
  }

  // ---------------------------------------------------------------- demo: the Game of Life
  function mountLife(host, api) {
    injectCss();
    const el = api.el, wide = (host.clientWidth || 800) >= 640;
    const R = wide ? 48 : 36, C = wide ? 80 : 40;
    let g = placePattern(R, C, 'gun'), age = new Uint16Array(R * C), gen = 0, peak = 0;
    const presetSel = el('select', { 'aria-label': 'Start from', onchange: () => load(presetSel.value) },
      [...Object.entries(PATTERNS).map(([k, p]) => el('option', { value: k }, p.name)), el('option', { value: 'random' }, 'Random soup'), el('option', { value: 'empty' }, 'Empty: draw your own')]);
    presetSel.value = 'gun';
    host.append(el('div', { class: 'algo-controls' }, el('label', {}, 'Start from ', presetSel), el('button', { class: 'btn', onclick: () => load(presetSel.value) }, 'Load again')));
    host.append(el('p', { class: 'ap-hint' }, 'Click or drag on the grid to bring cells to life or clear them, at any time, even while it runs. Every cell looks at its eight neighbours: a live cell with two or three live neighbours survives; an empty cell with exactly three comes to life; every other cell is empty in the next generation.'));
    const stats = el('div', { class: 'pz-stats' });
    let geo = { ox: 0, oy: 0, cs: 1 };
    const cv = api.canvas(host, { label: 'The Game of Life', maxWidth: 1100, height: (w) => Math.round(w * R / C), draw });
    cv.canvas.parentNode.classList.add('pz-canvas');
    host.append(stats);
    const pl = api.player(host, {
      speeds: [1, 60], speed: 75,
      start: () => (function* () { for (;;) yield 1; })(),
      onStep: () => { const nx = lifeStep(g, R, C); for (let i = 0; i < g.length; i++) age[i] = nx[i] ? (g[i] ? Math.min(60000, age[i] + 1) : 1) : 0; g = nx; gen++; later(); },
      onReset: () => load(presetSel.value)
    });
    const later = onceAFrame(() => update());
    function load(key) {
      if (key === 'random') { const r = A.rng(1 + Math.floor(Math.random() * 1e6)); g = new Uint8Array(R * C).map(() => (r() < 0.3 ? 1 : 0)); }
      else if (key === 'empty') g = new Uint8Array(R * C);
      else g = placePattern(R, C, key);
      age = new Uint16Array(R * C).map((_, i) => (g[i] ? 1 : 0)); gen = 0; peak = 0; update();
    }
    function update() {
      let pop = 0; for (let i = 0; i < g.length; i++) pop += g[i]; peak = Math.max(peak, pop);
      stats.replaceChildren(el('span', {}, 'Generation ', el('b', {}, fmt(gen))), el('span', {}, 'Alive ', el('b', {}, fmt(pop))), el('span', {}, 'Most alive at once ', el('b', {}, fmt(peak))));
      cv.redraw();
    }
    let paint = -1;
    const cellAt = (e) => { const r = cv.canvas.getBoundingClientRect(), x = e.clientX - r.left - geo.ox, y = e.clientY - r.top - geo.oy; const cc = Math.floor(x / geo.cs), rr = Math.floor(y / geo.cs); return rr >= 0 && cc >= 0 && rr < R && cc < C ? rr * C + cc : -1; };
    cv.canvas.addEventListener('pointerdown', (e) => { const i = cellAt(e); if (i < 0) return; paint = g[i] ? 0 : 1; g[i] = paint; age[i] = paint; try { cv.canvas.setPointerCapture(e.pointerId); } catch (x) { /* old browser */ } update(); });
    cv.canvas.addEventListener('pointermove', (e) => { if (paint < 0) return; const i = cellAt(e); if (i >= 0 && g[i] !== paint) { g[i] = paint; age[i] = paint; update(); } });
    const up = () => { paint = -1; }; cv.canvas.addEventListener('pointerup', up); cv.canvas.addEventListener('pointercancel', up);
    function draw(ctx, w, h, c) {
      ctx.fillStyle = c.paper; ctx.fillRect(0, 0, w, h);
      const cs = Math.min(w / C, h / R), ox = (w - cs * C) / 2, oy = (h - cs * R) / 2; geo = { ox, oy, cs };
      if (cs >= 6) { ctx.strokeStyle = c.rule2; ctx.lineWidth = 1; ctx.beginPath(); for (let k = 0; k <= C; k++) { ctx.moveTo(Math.round(ox + k * cs) + 0.5, oy); ctx.lineTo(Math.round(ox + k * cs) + 0.5, oy + R * cs); } for (let k = 0; k <= R; k++) { ctx.moveTo(ox, Math.round(oy + k * cs) + 0.5); ctx.lineTo(ox + C * cs, Math.round(oy + k * cs) + 0.5); } ctx.stroke(); }
      for (let i = 0; i < g.length; i++) if (g[i]) {
        const r = (i / C) | 0, cc = i % C, a = Math.min(age[i], 40);
        ctx.fillStyle = 'hsl(' + (190 + a * 2.2) + ', 70%, ' + (52 - a * 0.3) + '%)';
        ctx.fillRect(ox + cc * cs + 1, oy + r * cs + 1, cs - 1, cs - 1);
      }
    }
    update();
    return () => { pl.stop(); cv.stop(); later.cancel(); };
  }

  // ---------------------------------------------------------------- demo: raindrops for pi
  function mountRain(host, api) {
    injectCss();
    const el = api.el;
    let seed = 1 + Math.floor(Math.random() * 99999), rnd = A.rng(seed), n = 0, inside = 0, recent = [], history = [];
    const stats = el('div', { class: 'pz-stats' }), big = el('p', { class: 'pz-big', role: 'status' });
    host.append(el('p', { class: 'ap-hint' }, 'Rain falls at random on a square tile 1 metre across. A quarter of a circle is painted on it, with the corner as its centre. The painted part is π/4 of the square, so 4 × (drops inside) ÷ (all drops) should come close to π. Does it? Watch the estimate on the right as more drops fall.'));
    const cv = api.canvas(host, { label: 'Random drops on a square, and the estimate of pi as they fall', maxWidth: 1100, height: (w) => Math.round(Math.max(240, Math.min(440, w * 0.45))), draw });
    host.append(stats, big);
    const pl = api.player(host, {
      speeds: [2, 30000], speed: 40,
      start: () => (function* () { for (;;) yield 1; })(),
      onStep: () => {
        const x = rnd(), y = rnd(), hit = x * x + y * y <= 1; n++; if (hit) inside++;
        recent.push([x, y, hit]); if (recent.length > 4500) recent.splice(0, recent.length - 4000);
        if (n <= 100 || n % Math.ceil(n / 200) === 0) history.push([n, 4 * inside / n]);
        if (history.length > 600) history = history.filter((_, k) => k % 2 === 0);
        later();
      },
      onReset: () => { seed = 1 + Math.floor(Math.random() * 99999); rnd = A.rng(seed); n = 0; inside = 0; recent = []; history = []; update(); }
    });
    const later = onceAFrame(() => update());
    function update() {
      const est = n ? 4 * inside / n : 0;
      stats.replaceChildren(el('span', {}, 'Drops ', el('b', {}, fmt(n))), el('span', {}, 'Inside the circle ', el('b', {}, fmt(inside))), el('span', {}, 'Estimate 4 × ' + fmt(inside) + ' ÷ ' + fmt(n) + ' = ', el('b', {}, n ? est.toFixed(5) : '–')));
      if (n) {
        const err = Math.abs(est - Math.PI), digits = err < 0.0005 ? 3 : err < 0.005 ? 2 : err < 0.05 ? 1 : 0;
        big.replaceChildren('Off by ' + err.toFixed(4) + '. ', digits ? el('span', { class: 'pz-win' }, digits + (digits === 1 ? ' decimal place' : ' decimal places') + ' right.') : 'Not even one decimal place right yet.');
      } else big.replaceChildren('Press Play to start the rain.');
      cv.redraw();
    }
    function draw(ctx, w, h, c) {
      ctx.fillStyle = c.paper; ctx.fillRect(0, 0, w, h);
      const s = Math.min(h - 20, w * 0.45), ox = 10, oy = (h - s) / 2;
      ctx.fillStyle = c.paper2; ctx.fillRect(ox, oy, s, s);
      ctx.beginPath(); ctx.moveTo(ox, oy + s); ctx.arc(ox, oy + s, s, -Math.PI / 2, 0); ctx.closePath(); ctx.fillStyle = c.accentSoft; ctx.fill();
      ctx.strokeStyle = c.ink2; ctx.lineWidth = 1.5; ctx.strokeRect(ox, oy, s, s); ctx.beginPath(); ctx.arc(ox, oy + s, s, -Math.PI / 2, 0); ctx.stroke();
      const r = recent.length > 1500 ? 1.4 : 2.2;
      for (const [x, y, hit] of recent) { ctx.fillStyle = hit ? c.link : c.warn; ctx.fillRect(ox + x * s - r / 2, oy + s - y * s - r / 2, r, r); }
      // the estimate as drops fall (log scale of drops), with pi as a line
      const gx = ox + s + 50, gw = w - gx - 14, gy = oy, gh = s - 20, lo = 2.6, hi = 3.7;
      if (gw < 80) return;
      const Y = (v) => gy + (1 - (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * gh, nmax = Math.max(10, n), X = (k) => gx + Math.log10(Math.max(1, k)) / Math.log10(nmax) * gw;
      ctx.strokeStyle = c.rule; ctx.lineWidth = 1; ctx.strokeRect(gx, gy, gw, gh);
      ctx.fillStyle = c.ink3; ctx.font = '11px ' + (c.sans || 'sans-serif'); ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      for (const v of [2.8, 3.0, 3.2, 3.4, 3.6]) ctx.fillText(v.toFixed(1), gx - 6, Y(v));
      ctx.strokeStyle = c.ok; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(gx, Y(Math.PI)); ctx.lineTo(gx + gw, Y(Math.PI)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = c.ok; ctx.textAlign = 'left'; ctx.fillText('π = 3.14159…', gx + 6, Y(Math.PI) - 10);
      if (history.length > 1) { ctx.strokeStyle = c.accent; ctx.lineWidth = 2; ctx.beginPath(); history.forEach(([k, v], j) => { if (j) ctx.lineTo(X(k), Y(v)); else ctx.moveTo(X(k), Y(v)); }); ctx.stroke(); }
      ctx.fillStyle = c.ink3; ctx.textBaseline = 'top'; ctx.strokeStyle = c.rule;
      for (let k = 1; k <= nmax; k *= 10) { const x = X(k); ctx.beginPath(); ctx.moveTo(x, gy + gh); ctx.lineTo(x, gy + gh + 5); ctx.stroke(); ctx.textAlign = k === 1 ? 'left' : 'center'; ctx.fillText(fmt(k), x, gy + gh + 6); }
      ctx.textAlign = 'right'; ctx.fillText('drops →', gx + gw, gy + gh - 14);
    }
    update();
    return () => { pl.stop(); cv.stop(); later.cancel(); };
  }

  // ================================================================== registration
  const RECURSION = [{ href: '#/python/11', text: 'SC 101 Lesson 11: Recursion' }, { href: '#/dsa/7', text: 'SC 107 Lesson 7: Recursion' }];
  A.register({ id: 'hanoi', group: GROUP, title: 'Towers of Hanoi',
    blurb: 'Move the tower one disc at a time, never a big disc on a small one. Play it yourself and try for the fewest moves, then watch recursion do it perfectly.',
    mount: mountHanoi,
    about: `<h2>The puzzle and its legend</h2>
<p>The French mathematician Édouard Lucas sold the puzzle in 1883, with a story: in a temple, monks move 64 golden discs by the same rules, and when they finish, the world ends. Moving n discs takes at least 2<sup>n</sup> − 1 moves, so 64 discs take 18,446,744,073,709,551,615. At one move a second, that is about 585 billion years: the world is safe for a while.</p>
<h2>Why the recursion works</h2>
<p>To move n discs from peg 1 to peg 3: move the top n − 1 discs out of the way to peg 2, move the biggest disc to peg 3, then move the n − 1 discs from peg 2 on top of it. Moving n − 1 discs is the same puzzle, one disc smaller, so the same three steps solve it, down to a single disc, which simply moves. In Python:</p>
<pre class="code"><code>def hanoi(n, start, goal, spare):
    if n == 0:
        return
    hanoi(n - 1, start, spare, goal)
    print("move a disc from", start, "to", goal)
    hanoi(n - 1, spare, goal, start)</code></pre>
<p>Counting the moves gives the formula: moves(n) = 2 × moves(n − 1) + 1, and moves(1) = 1, so moves(n) = 2<sup>n</sup> − 1. One disc more doubles the work: the clearest example of exponential growth there is.</p>
<h2>Things to try</h2>
<ul><li>Solve 3 discs in 7 moves, then 4 in 15. Notice that the smallest disc moves every other turn, always round the pegs in the same direction.</li>
<li>Watch the computer with 6 discs and count how often the biggest disc moves. (Once.)</li></ul>`,
    taught: RECURSION });
  A.register({ id: 'tour', group: 'Paths and graphs', title: 'Untangle the tour',
    blurb: 'Plan a round trip through every town, then race the computer: it drives to the nearest town each time, then uncrosses roads until none cross. Can you beat it?',
    mount: mountTour,
    about: `<h2>The travelling salesman problem</h2>
<p>Visit every town once and come back, by the shortest round trip. It sounds simple, but the number of possible tours grows faster than any power: with 12 towns there are 19,958,400 different round trips, with 25 towns more than 3 × 10<sup>23</sup>. Nobody knows a method that is guaranteed to find the best tour quickly for every map; it is one of the NP-hard problems of SC 104 lesson 12. In practice programs find very good tours with quick rules, and this demo uses two of them.</p>
<h2>The computer's two rules</h2>
<ul><li><b>Nearest neighbour.</b> From the green town, always drive to the closest town not yet visited. Quick, and usually 20 to 25% longer than the best tour, because the last roads have to come a long way home.</li>
<li><b>2-opt.</b> Look at every pair of roads. If replacing roads a–b and c–d by a–c and b–d makes the trip shorter, do it, and reverse the part in between. Two roads that cross can always be uncrossed this way, so when 2-opt stops, no roads cross. The result is usually within about 5% of the best tour, but not always the best: which is why you can sometimes win.</li></ul>
<h2>Where it is used</h2>
<p>Delivery routes, the order in which a machine drills holes in a circuit board, and planning which stars a telescope looks at in one night are all travelling salesman problems. In 2006 a team including William Cook solved one with 85,900 points, from the layout of a computer chip, and proved its tour the shortest.</p>`,
    taught: [{ href: '#/math/12', text: 'SC 104 Lesson 12: Easy to check, hard to find' }, { href: '#/math/5', text: 'SC 104 Lesson 5: Graphs and paths' }] });
  A.register({ id: 'life', group: GROUP, title: 'The Game of Life',
    blurb: 'Draw living cells on a grid and press Play. Three simple rules make gliders that fly, oscillators that pulse, and a gun that fires gliders for ever.',
    mount: mountLife,
    about: `<h2>Three rules</h2>
<p>The mathematician John Horton Conway invented the Game of Life in 1970, and Martin Gardner made it famous in his column in <em>Scientific American</em> that October. Every cell of the grid is alive or empty, and all of them change at once, by counting their eight neighbours: a live cell with 2 or 3 live neighbours stays alive; an empty cell with exactly 3 comes to life; every other cell is empty in the next generation. Here the grid wraps around: what leaves at the right comes back at the left.</p>
<h2>What to look for</h2>
<ul><li><b>Still lifes</b> never change, like the 2 × 2 block. <b>Oscillators</b> repeat: the blinker every 2 generations, the pulsar every 3.</li>
<li><b>Spaceships</b> move. The glider travels one cell diagonally every 4 generations.</li>
<li>Conway offered a $50 prize for a pattern that grows for ever. Bill Gosper won it in 1970 with the <b>glider gun</b>, which fires a new glider every 30 generations.</li>
<li>The <b>R-pentomino</b>, five cells, takes 1,103 generations to settle down on an endless grid (on this small wrapped grid its gliders crash back into it). Colours show age: new cells are blue, old ones purple.</li></ul>
<p>Life is a <em>cellular automaton</em>, and it can compute: people have built logic gates, and even a whole computer, out of gliders and guns. Simple rules, applied everywhere at once, can do anything a program can.</p>` });
  A.register({ id: 'raindrops', group: GROUP, title: 'Raindrops for π',
    blurb: 'Let random raindrops fall on a square with a quarter circle on it, and count. The more drops, the closer 4 × inside ÷ all comes to π: the Monte Carlo method.',
    mount: mountRain,
    about: `<h2>Why it works</h2>
<p>The square is 1 by 1, so its area is 1. The quarter circle has radius 1, so its area is π × 1² ÷ 4 = π/4. A drop that lands anywhere in the square at random lands in the circle with probability π/4, so the fraction of drops inside comes close to π/4, and 4 times that fraction comes close to π. A drop at (x, y) is inside exactly when x² + y² ≤ 1: Pythagoras again.</p>
<h2>How fast it gets better</h2>
<p>Slowly. The error shrinks like 1/√n: to get one more decimal place right you need about 100 times as many drops. A thousand drops usually land within about 0.05 of π; a million drops usually get 3.14 right, and only sometimes 3.141. That is why the graph has a log scale, each mark ten times more drops than the one before.</p>
<p>The method is named after the casino in Monte Carlo. Stanisław Ulam and John von Neumann developed it in the 1940s, at Los Alamos, to simulate neutrons, which no formula could follow. Today Monte Carlo simulations price insurance, forecast weather, plan cancer radiation treatment and render the light in animated films.</p>`,
    taught: [{ href: '#/python/10', text: 'SC 101 Lesson 10: Randomness and simulation' }] });

  // ================================================================== tests (node test_algos.js)
  function selfTest() {
    const fails = [];
    // Hanoi: the recursion makes 2^n - 1 legal moves and ends with the whole tower on the goal peg
    for (let n = 0; n <= 10; n++) {
      const pegs = startPegs(n); let moves = 0, ok = true;
      for (const [f, t] of hanoi(n, 0, 2, 1)) { if (!legal(pegs, f, t)) { ok = false; break; } pegs[t].push(pegs[f].pop()); moves++; }
      if (!ok) fails.push('hanoi ' + n + ': an illegal move');
      if (moves !== Math.pow(2, n) - 1) fails.push('hanoi ' + n + ': ' + moves + ' moves, not 2^n - 1');
      if (pegs[2].length !== n || pegs[2].some((d, k) => d !== n - k)) fails.push('hanoi ' + n + ': the tower did not end on peg 3 in order');
    }
    if (legal([[2, 1], [], []], 1, 0) || !legal([[2, 1], [], []], 0, 1) || legal([[1], [2], []], 1, 0)) fails.push('hanoi: legal() is wrong');
    // the tour: nearest neighbour visits every town once; 2-opt never lengthens, ends with no improving swap and no crossings
    for (let k = 0; k < 40; k++) {
      const n = 4 + (k % 20), pts = makeTowns(n, 100 + k);
      if (pts.length !== n) { fails.push('makeTowns gave ' + pts.length + ' of ' + n); continue; }
      let r, it = nearestNeighbour(pts); do r = it.next(); while (!r.done);
      const nn = r.value;
      if (nn.length !== n || new Set(nn).size !== n) { fails.push('nearest neighbour did not visit every town once'); continue; }
      let prev = tourLength(pts, nn), t = nn; it = twoOpt(pts, nn);
      for (;;) { r = it.next(); if (r.done) { t = r.value; break; } const L = tourLength(pts, r.value.tour); if (L > prev + 1e-9) fails.push('2-opt made a tour longer'); prev = L; }
      if (new Set(t).size !== n) fails.push('2-opt lost a town');
      if (crossings(pts, t)) fails.push('2-opt left ' + crossings(pts, t) + ' crossings on ' + n + ' towns');
    }
    // a square visited in a bow-tie order has one crossing; 2-opt finds the square
    const sq = [[0, 0], [1, 0], [0, 1], [1, 1]];
    if (crossings(sq, [0, 1, 2, 3]) !== 1) fails.push('crossings: the bow-tie should cross once');
    { let r, it = twoOpt(sq, [0, 1, 2, 3]); do r = it.next(); while (!r.done); if (Math.abs(tourLength(sq, r.value) - 4) > 1e-9) fails.push('2-opt did not turn the bow-tie into the square'); }
    // Life: a block stays, a blinker has period 2, a glider moves one cell diagonally in 4 generations
    const R = 12, C = 12, at = (cells) => { const g = new Uint8Array(R * C); for (const [r, c] of cells) g[r * C + c] = 1; return g; };
    const same = (a, b) => a.every((v, i) => v === b[i]);
    const block = at([[3, 3], [3, 4], [4, 3], [4, 4]]); if (!same(lifeStep(block, R, C), block)) fails.push('life: the block changed');
    const blink = at([[5, 4], [5, 5], [5, 6]]), b1 = lifeStep(blink, R, C);
    if (same(b1, blink) || !same(lifeStep(b1, R, C), blink)) fails.push('life: the blinker is not period 2');
    let gl = at([[1, 2], [2, 3], [3, 1], [3, 2], [3, 3]]); for (let k = 0; k < 4; k++) gl = lifeStep(gl, R, C);
    if (!same(gl, at([[2, 3], [3, 4], [4, 2], [4, 3], [4, 4]]))) fails.push('life: the glider did not move one cell diagonally in 4 generations');
    for (const key of Object.keys(PATTERNS)) { const rows = PATTERNS[key].rows; if (rows.some((r) => r.length !== rows[0].length || /[^.#]/.test(r))) fails.push('life pattern ' + key + ' is ragged'); }
    // the gun: after 30 generations it has made one glider more (its population grows by 5 every 30 generations)
    { const GR = 40, GC = 60; let g = placePattern(GR, GC, 'gun'); const pop = (x) => x.reduce((s, v) => s + v, 0), p0 = pop(g); for (let k = 0; k < 60; k++) g = lifeStep(g, GR, GC); if (pop(g) !== p0 + 10) fails.push('life: the glider gun made ' + (pop(g) - p0) + ' new cells in 60 generations, not 10'); }
    // raindrops: 200,000 seeded drops estimate pi to within 0.02
    const est = 4 * drops(200000, 12345) / 200000;
    if (Math.abs(est - Math.PI) > 0.02) fails.push('raindrops: 200,000 drops gave ' + est);
    return fails;
  }

  if (typeof module !== 'undefined') module.exports = { selfTest, hanoi, legal, startPegs, nearestNeighbour, twoOpt, tourLength, crossings, makeTowns, lifeStep, PATTERNS, placePattern, drops };
})();
