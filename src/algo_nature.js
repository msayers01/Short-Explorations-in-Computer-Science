/* Algorithms in motion: nature and emergence. Four demos for the #/algorithms page (see src/algos.js for the frame), each a crowd of
   simple parts following local rules, with no part in charge, and a pattern that nobody wrote down:
   - boids: Craig Reynolds's flock (1986): separation, alignment and cohesion with sliders, a hawk the pointer steers, a spatial grid;
   - ant: Langton's ant (1986) and its many-colour cousins: chaos for ten thousand steps, then a highway (bet first);
   - sandpile: the Abelian sandpile of Bak, Tang and Wiesenfeld (1987): grains topple, avalanches of every size, a fractal;
   - slime: a Physarum-style slime mould after Jeff Jones (2010): thousands of agents that follow and lay a fading trail make networks.
   All four run their own animation loop (one simulation step, or a measured batch of steps, per frame) rather than api.player, whose
   steps-per-second clock jitters at one step a frame; the counters and pictures are redrawn once a frame, never per step.
   The algorithms are pure (no DOM, typed arrays) and checked by selfTest() in node (test_algos.js). */
(function () {
  const A = (typeof window !== 'undefined' && window.ALGOS) || require('./algos.js');
  const GROUP = 'Nature and emergence';
  const TAU = Math.PI * 2;

  // ================================================================== pure algorithms

  // ---------- boids. A flock is parallel Float32Arrays; the world wraps round (a torus), so no bird meets a wall.
  const BOID = { sep: 1.5, ali: 1.0, coh: 1.0, view: 48, sepFrac: 0.5, maxSpeed: 3.2, minSpeed: 1.4, maxForce: 0.07, fear: 110 };
  function makeFlock(n, w, h, seed, p) {
    const r = A.rng(seed), P = p || BOID;
    const f = { n, w, h, x: new Float32Array(n), y: new Float32Array(n), vx: new Float32Array(n), vy: new Float32Array(n), ax: new Float32Array(n), ay: new Float32Array(n), next: new Int32Array(n), head: new Int32Array(1) };
    for (let i = 0; i < n; i++) { const a = r() * TAU, s = P.minSpeed + (P.maxSpeed - P.minSpeed) * r(); f.x[i] = r() * w; f.y[i] = r() * h; f.vx[i] = Math.cos(a) * s; f.vy[i] = Math.sin(a) * s; }
    return f;
  }
  /** Bucket the birds into square cells at least R wide, so a bird only looks at the 3 × 3 cells round it, not at every bird:
      about n × (birds per neighbourhood) work instead of n². With fewer than 3 cells across, the wrapped cells would repeat, so
      then every column (or row) is looked at once. */
  function buildGrid(f, R) {
    const cols = Math.max(1, Math.floor(f.w / R)), rows = Math.max(1, Math.floor(f.h / R)), cw = f.w / cols, ch = f.h / rows;
    if (f.head.length < cols * rows) f.head = new Int32Array(cols * rows);
    const head = f.head; head.fill(-1, 0, cols * rows);
    for (let i = 0; i < f.n; i++) {
      const c = Math.min(cols - 1, Math.max(0, Math.floor(f.x[i] / cw))), r = Math.min(rows - 1, Math.max(0, Math.floor(f.y[i] / ch))), k = r * cols + c;
      f.next[i] = head[k]; head[k] = i;
    }
    return { cols, rows, cw, ch, cs: new Int32Array(Math.min(3, cols)), rs: new Int32Array(Math.min(3, rows)) };
  }
  /** Call fn(j, dx, dy, d2) for every other bird within R of bird i (dx, dy pointing from i to j, the shortest way round). */
  function eachNeighbour(f, g, i, R, fn) {
    const { cols, rows, cw, ch, cs, rs } = g, R2 = R * R, hw = f.w / 2, hh = f.h / 2, xi = f.x[i], yi = f.y[i];
    const c0 = Math.min(cols - 1, Math.floor(xi / cw)), r0 = Math.min(rows - 1, Math.floor(yi / ch));
    if (cols >= 3) { cs[0] = (c0 + cols - 1) % cols; cs[1] = c0; cs[2] = (c0 + 1) % cols; } else for (let k = 0; k < cols; k++) cs[k] = k;
    if (rows >= 3) { rs[0] = (r0 + rows - 1) % rows; rs[1] = r0; rs[2] = (r0 + 1) % rows; } else for (let k = 0; k < rows; k++) rs[k] = k;
    for (let a = 0; a < rs.length; a++) for (let b = 0; b < cs.length; b++) {
      for (let j = f.head[rs[a] * cols + cs[b]]; j >= 0; j = f.next[j]) {
        if (j === i) continue;
        let dx = f.x[j] - xi, dy = f.y[j] - yi;
        if (dx > hw) dx -= f.w; else if (dx < -hw) dx += f.w;
        if (dy > hh) dy -= f.h; else if (dy < -hh) dy += f.h;
        const d2 = dx * dx + dy * dy; if (d2 < R2) fn(j, dx, dy, d2);
      }
    }
  }
  /** Reynolds's "steer = desired velocity − velocity", the desired one at full speed, the steer no stronger than maxForce. */
  function steer(dx, dy, vx, vy, P, out, wgt) {
    const L = Math.hypot(dx, dy); if (!L || !wgt) return;
    let sx = dx / L * P.maxSpeed - vx, sy = dy / L * P.maxSpeed - vy; const S = Math.hypot(sx, sy);
    if (S > P.maxForce) { sx *= P.maxForce / S; sy *= P.maxForce / S; }
    out[0] += sx * wgt; out[1] += sy * wgt;
  }
  /** One step of the flock. Every bird looks only at the birds within view (P.view) and steers by three rules: separation (away from
      birds that are too close, more strongly the closer they are), alignment (towards their average heading) and cohesion (towards their
      average position). preds are hawks {x, y}: a bird that sees one within P.fear flies away from it, three times as hard. All birds
      steer first and then move, so the order of the birds does not matter. dt is in frames of 1/60 s. */
  function flockStep(f, P, preds, dt) {
    const R = Math.max(4, Math.min(P.view, f.w / 2, f.h / 2)), S = R * P.sepFrac, S2 = S * S, g = buildGrid(f, R), acc = [0, 0];
    let ai = 0, n = 0, avx = 0, avy = 0, cx = 0, cy = 0, sx = 0, sy = 0;
    const visit = (j, dx, dy, d2) => { n++; avx += f.vx[j]; avy += f.vy[j]; cx += dx; cy += dy; if (d2 < S2 && d2 > 1e-6) { sx -= dx / d2; sy -= dy / d2; } };
    for (ai = 0; ai < f.n; ai++) {
      n = 0; avx = avy = cx = cy = sx = sy = 0; acc[0] = acc[1] = 0;
      eachNeighbour(f, g, ai, R, visit);
      const vx = f.vx[ai], vy = f.vy[ai];
      if (n) { steer(avx, avy, vx, vy, P, acc, P.ali); steer(cx, cy, vx, vy, P, acc, P.coh); steer(sx, sy, vx, vy, P, acc, P.sep); }
      for (const h of preds || []) {
        let dx = f.x[ai] - h.x, dy = f.y[ai] - h.y;
        if (dx > f.w / 2) dx -= f.w; else if (dx < -f.w / 2) dx += f.w;
        if (dy > f.h / 2) dy -= f.h; else if (dy < -f.h / 2) dy += f.h;
        if (dx * dx + dy * dy < P.fear * P.fear) steer(dx, dy, vx, vy, P, acc, 3);
      }
      f.ax[ai] = acc[0]; f.ay[ai] = acc[1];
    }
    for (let i = 0; i < f.n; i++) {
      let vx = f.vx[i] + f.ax[i] * dt, vy = f.vy[i] + f.ay[i] * dt; const s = Math.hypot(vx, vy);
      if (s > P.maxSpeed) { vx *= P.maxSpeed / s; vy *= P.maxSpeed / s; } else if (s < P.minSpeed) { if (s > 1e-9) { vx *= P.minSpeed / s; vy *= P.minSpeed / s; } else vx = P.minSpeed; }
      f.vx[i] = vx; f.vy[i] = vy;
      let x = f.x[i] + vx * dt, y = f.y[i] + vy * dt;
      x %= f.w; if (x < 0) x += f.w; y %= f.h; if (y < 0) y += f.h;
      f.x[i] = x; f.y[i] = y;
    }
  }
  /** How lined up the flock is: the length of the average of the unit headings, 0 for birds flying every way, 1 for all one way. */
  function order(f) { let sx = 0, sy = 0; for (let i = 0; i < f.n; i++) { const s = Math.hypot(f.vx[i], f.vy[i]) || 1; sx += f.vx[i] / s; sy += f.vy[i] / s; } return f.n ? Math.hypot(sx, sy) / f.n : 0; }

  // ---------- Langton's ant and its cousins. A rule is a string of L and R, one letter per colour: on a cell of colour k the ant turns
  // the way letter k says, moves the cell on to colour k + 1 (round to 0) and steps forward. "RL" is Langton's ant. The grid wraps round.
  const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];   // up, right, down, left: R adds 1, L takes 1
  const RING = 8192;                              // the last 8192 positions, for spotting the highway
  function makeAnt(rule, W, H) {
    const turns = Int8Array.from(rule, (ch) => (ch === 'R' ? 1 : 3));
    return { rule, W, H, grid: new Uint8Array(W * H), x: W >> 1, y: H >> 1, dir: 0, steps: 0, turns, k: turns.length, ux: 0, uy: 0, rx: new Int32Array(RING), ry: new Int32Array(RING) };
  }
  /** n steps, or fewer if stopAtEdge and the ant walks off one edge (and comes back at the other): returns the steps taken. */
  function antSteps(a, n, stopAtEdge) {
    let { x, y, dir, ux, uy, steps } = a; const { W, H, grid, turns, k, rx, ry } = a; let s = 0;
    while (s < n) {
      const i = y * W + x, c = grid[i];
      dir = (dir + turns[c]) & 3; grid[i] = c + 1 === k ? 0 : c + 1;
      x += DX[dir]; y += DY[dir]; ux += DX[dir]; uy += DY[dir]; s++;
      steps++; rx[steps & (RING - 1)] = ux; ry[steps & (RING - 1)] = uy;   // (ux, uy) never wrap, so a drift is a drift
      let wrapped = true;
      if (x < 0) x = W - 1; else if (x >= W) x = 0; else if (y < 0) y = H - 1; else if (y >= H) y = 0; else wrapped = false;
      if (wrapped) { a.wraps = (a.wraps || 0) + 1; if (stopAtEdge) break; }
    }
    a.x = x; a.y = y; a.dir = dir; a.ux = ux; a.uy = uy; a.steps = steps;
    return s;
  }
  /** Is the ant on a highway: has each of its last three runs of `period` steps moved it by the same (dx, dy), not (0, 0)? Returns
      { dx, dy, from } with from the first step of the repeating stretch still in memory, or null. */
  function highway(a, period) {
    const P = period || 104, t = a.steps; if (t < 3 * P + 1) return null;
    const at = (s) => [a.rx[s & (RING - 1)], a.ry[s & (RING - 1)]];
    const d = (s) => { const p = at(s), q = at(s - P); return [p[0] - q[0], p[1] - q[1]]; };
    const d0 = d(t); if (!d0[0] && !d0[1]) return null;
    for (let s = t - 1; s > t - 3 * P; s--) { const e = d(s); if (e[0] !== d0[0] || e[1] !== d0[1]) return null; }
    let from = t - 3 * P; while (from - P > t - RING + 1 && from - P > 0) { const e = d(from); if (e[0] !== d0[0] || e[1] !== d0[1]) break; from--; }
    return { dx: d0[0], dy: d0[1], from: from - P + 1 };
  }
  const ANT_RULES = [
    { rule: 'RL', name: 'RL: Langton\'s ant' },
    { rule: 'RLR', name: 'RLR: chaos that grows' },
    { rule: 'LLRR', name: 'LLRR: grows symmetrically' },
    { rule: 'LRRRRRLLR', name: 'LRRRRRLLR: fills a square' },
    { rule: 'LLRRRLRLRLLR', name: 'LLRRRLRLRLLR: a winding highway' },
    { rule: 'RRLLLRLLLRRR', name: 'RRLLLRLLLRRR: a filled triangle' }
  ];
  const validRule = (s) => /^[LR]{2,12}$/.test(s);

  // ---------- the Abelian sandpile on an N × N grid: a cell with 4 or more grains topples, one to each neighbour; grains that topple
  // over the edge are lost. Unstable cells wait in a queue (each at most once, flagged by inQ), and a cell that holds h ≥ 4 topples
  // h >> 2 times at once: Dhar's abelian property says the order of the topplings does not change the result or their number.
  function makePile(N) { return { N, h: new Int32Array(N * N), q: new Int32Array(N * N), inQ: new Uint8Array(N * N), qh: 0, qn: 0, dropped: 0, lost: 0, topples: 0 }; }
  function push(p, i) { if (!p.inQ[i]) { p.inQ[i] = 1; p.q[(p.qh + p.qn) % p.q.length] = i; p.qn++; } }
  function addGrains(p, i, k) { p.h[i] += k; p.dropped += k; if (p.h[i] >= 4) push(p, i); }
  /** Topple until stable or until `budget` cells have been toppled; true when stable. */
  function relax(p, budget) {
    const { N, h, q, inQ } = p, L = q.length; let b = budget == null ? Infinity : budget;
    while (p.qn && b-- > 0) {
      const i = q[p.qh]; p.qh = p.qh + 1 === L ? 0 : p.qh + 1; p.qn--; inQ[i] = 0;
      const v = h[i]; if (v < 4) continue;
      const t = v >> 2, r = (i / N) | 0, c = i - r * N; h[i] = v & 3; p.topples += t;
      if (r > 0) { h[i - N] += t; if (h[i - N] >= 4) push(p, i - N); } else p.lost += t;
      if (r < N - 1) { h[i + N] += t; if (h[i + N] >= 4) push(p, i + N); } else p.lost += t;
      if (c > 0) { h[i - 1] += t; if (h[i - 1] >= 4) push(p, i - 1); } else p.lost += t;
      if (c < N - 1) { h[i + 1] += t; if (h[i + 1] >= 4) push(p, i + 1); } else p.lost += t;
    }
    return p.qn === 0;
  }
  /** Drop one grain on cell i and let the avalanche run to the end; returns its size, the number of topplings. */
  function dropOne(p, i) { const t0 = p.topples; addGrains(p, i, 1); relax(p); return p.topples - t0; }
  const onGrid = (p) => { let s = 0; for (let i = 0; i < p.h.length; i++) s += p.h[i]; return s; };
  /** A grid big enough that n grains dropped on the centre settle without touching the edge (the stable pile is a disc with about 2.1
      grains a cell, so of radius about √(n / 6.7)). Odd, so there is a centre cell. */
  const pileSizeFor = (n) => 2 * Math.ceil(0.41 * Math.sqrt(n) + 3) + 1;
  const sizeBin = (s) => (s <= 0 ? 0 : 1 + Math.floor(Math.log2(s)));   // avalanche sizes in doubling bins: 1, 2-3, 4-7, ...

  // ---------- slime mould (Jones 2010): agents on a W × H trail map, which wraps round. Each agent smells the trail at three sensors
  // ahead of it (left, centre, right, sa radians apart, so cells ahead), turns towards the strongest by ra, steps ss forward and
  // deposits dep. Then the whole map diffuses (each cell becomes the mean of its 3 × 3 block) and fades (times 1 − decay).
  // presets: the agents as a share of the cells (Jones's networks form at a few per cent to about 15%), food on or off
  const SLIME_PRESETS = {
    network: { name: 'Networks', sa: 22.5, ra: 45, so: 9, decay: 0.1, density: 0.1 },
    food: { name: 'Joining up food', sa: 22.5, ra: 45, so: 9, decay: 0.1, density: 0.02, feed: 'cities' },
    mesh: { name: 'A fine mesh', sa: 45, ra: 45, so: 4, decay: 0.12, density: 0.1 },
    cells: { name: 'Big cells', sa: 11, ra: 30, so: 20, decay: 0.05, density: 0.1 },
    spore: { name: 'Growing from a spot', sa: 22.5, ra: 45, so: 9, decay: 0.1, density: 0.04, start: 'spore' }
  };
  function makeSlime(n, W, H, seed, start) {
    const r = A.rng(seed), s = { n, W, H, x: new Float32Array(n), y: new Float32Array(n), a: new Float32Array(n), trail: new Float32Array(W * H), tmp: new Float32Array(W * H), occ: new Uint16Array(W * H), rnd: r,
      xl: new Int32Array(W), xr: new Int32Array(W), yu: new Int32Array(H), yd: new Int32Array(H), steps: 0 };
    for (let x = 0; x < W; x++) { s.xl[x] = (x + W - 1) % W; s.xr[x] = (x + 1) % W; }
    for (let y = 0; y < H; y++) { s.yu[y] = ((y + H - 1) % H) * W; s.yd[y] = ((y + 1) % H) * W; }
    const R = Math.min(Math.min(W, H) * 0.45, Math.max(Math.min(W, H) * 0.18, Math.sqrt(n / (Math.PI * 0.5))));   // a disc at most half full
    for (let i = 0; i < n; i++) {
      if (start === 'random') { s.x[i] = r() * W; s.y[i] = r() * H; s.a[i] = r() * TAU; }
      else { const t = r() * TAU, d = Math.sqrt(r()) * R; s.x[i] = W / 2 + Math.cos(t) * d; s.y[i] = H / 2 + Math.sin(t) * d; s.a[i] = t; }   // a spore in the middle, spreading out
      if (s.x[i] >= W) s.x[i] = 0; if (s.y[i] >= H) s.y[i] = 0;
      s.occ[Math.min(H - 1, s.y[i] | 0) * W + Math.min(W - 1, s.x[i] | 0)]++;   // how many agents stand on each cell (a few may start together)
    }
    return s;
  }
  function slimeStep(s, P, food) {
    const { n, W, H, x, y, a, trail, rnd, occ } = s, sa = P.sa * Math.PI / 180, ra = P.ra * Math.PI / 180, so = P.so, ss = P.ss || 1, dep = P.dep || 5;
    const at = (px, py) => { let xi = Math.floor(px), yi = Math.floor(py); xi %= W; if (xi < 0) xi += W; yi %= H; if (yi < 0) yi += H; return trail[yi * W + xi]; };
    for (let i = 0; i < n; i++) {
      const ang = a[i], px = x[i], py = y[i];
      const F = at(px + Math.cos(ang) * so, py + Math.sin(ang) * so), FL = at(px + Math.cos(ang - sa) * so, py + Math.sin(ang - sa) * so), FR = at(px + Math.cos(ang + sa) * so, py + Math.sin(ang + sa) * so);
      let t = ang;
      if (F > FL && F > FR) { /* straight on */ } else if (F < FL && F < FR) t += rnd() < 0.5 ? -ra : ra; else if (FL < FR) t += ra; else if (FR < FL) t -= ra;
      let nx = px + Math.cos(t) * ss, ny = py + Math.sin(t) * ss;
      if (nx < 0) nx += W; else if (nx >= W) nx -= W;
      if (ny < 0) ny += H; else if (ny >= H) ny -= H;
      nx = Math.fround(nx); ny = Math.fround(ny); if (nx >= W) nx = 0; if (ny >= H) ny = 0;   // as the Float32Array will hold them, so the cell we count is the cell it is in
      const from = Math.min(H - 1, py | 0) * W + Math.min(W - 1, px | 0), to = Math.min(H - 1, ny | 0) * W + Math.min(W - 1, nx | 0);
      if (to !== from && occ[to]) { a[i] = rnd() * TAU; continue; }   // Jones: one agent a cell; a blocked agent stays, faces a random way, lays nothing
      if (to !== from) { occ[from]--; occ[to]++; } x[i] = nx; y[i] = ny; a[i] = t % TAU;
      trail[to] += dep;
    }
    if (food) for (const [fx, fy] of food) {   // a food source keeps calling: a strong smell over a small patch
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xi = ((Math.round(fx) + dx) % W + W) % W, yi = ((Math.round(fy) + dy) % H + H) % H; trail[yi * W + xi] += P.smell || 40; }
    }
    // diffuse as two passes of a 3-wide box (rows, then columns), and fade
    const tmp = s.tmp, { xl, xr, yu, yd } = s, k = (1 - P.decay) / 9;
    for (let yy = 0; yy < H; yy++) { const row = yy * W; for (let xx = 0; xx < W; xx++) tmp[row + xx] = trail[row + xl[xx]] + trail[row + xx] + trail[row + xr[xx]]; }
    for (let yy = 0; yy < H; yy++) { const row = yy * W, up = yu[yy], dn = yd[yy]; for (let xx = 0; xx < W; xx++) trail[row + xx] = (tmp[up + xx] + tmp[row + xx] + tmp[dn + xx]) * k; }
    s.steps++;
  }

  // ================================================================== the page

  const CSS = `
.nt-hint { font-family: var(--sans); font-size: 0.92rem; color: var(--ink-2); margin: 0.4rem 0 0.6rem; max-width: 46rem; }
.nt-stats { display: flex; flex-wrap: wrap; gap: 0.3rem 1.3rem; font-family: var(--sans); font-size: 0.92rem; color: var(--ink-2); margin: 0.4rem 0; font-variant-numeric: tabular-nums; }
.nt-stats b { color: var(--ink); font-weight: 600; }
.nt-big { font-family: var(--sans); font-size: 1.02rem; margin: 0.4rem 0; min-height: 1.6em; }
.nt-win { color: var(--ok); font-weight: 600; }
.nt-lose { color: var(--warn); font-weight: 600; }
.nt-slider { display: inline-flex; align-items: center; gap: 0.35rem; color: var(--ink-2); white-space: nowrap; }
.nt-slider input { width: 6.5rem; accent-color: var(--accent); }
.nt-slider output { min-width: 2.4em; color: var(--ink); font-variant-numeric: tabular-nums; }
.nt-check { display: inline-flex; align-items: center; gap: 0.3rem; color: var(--ink-2); }
.nt-rule { font: inherit; font-family: var(--mono); width: 9.5em; color: var(--ink); background: var(--paper); border: 1px solid var(--rule); border-radius: 3px; padding: 0.3rem 0.4rem; }
.nt-canvas canvas { cursor: crosshair; }
@media (max-width: 560px) { .nt-slider input { width: 5.5rem; } }
`;
  function injectCss() {
    if (document.getElementById('algo-nature-css')) return;
    const s = document.createElement('style'); s.id = 'algo-nature-css'; s.textContent = CSS; document.head.appendChild(s);
  }
  const fmt = (x) => Math.round(x).toLocaleString('en-US');

  // ---------- colours as numbers, for ImageData: the theme's CSS colours read back through a canvas, which normalises any syntax
  let probe = null;
  function rgb(css) {
    if (!probe) probe = document.createElement('canvas').getContext('2d');
    probe.fillStyle = '#000'; probe.fillStyle = css || '#000'; const s = String(probe.fillStyle);
    if (s[0] === '#') return [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
    const m = s.match(/[\d.]+/g) || [0, 0, 0]; return [+m[0], +m[1], +m[2]];
  }
  const mix = (a, b, t) => [0, 1, 2].map((k) => Math.round(a[k] + (b[k] - a[k]) * t));
  const pack = (c) => ((255 << 24) | (c[2] << 16) | (c[1] << 8) | c[0]) >>> 0;   // ImageData bytes are R, G, B, A: little-endian, as every browser is
  const css = (c) => 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
  const isDark = (c) => { const p = rgb(c.paper); return p[0] + p[1] + p[2] < 384; };

  /** A grid of cells drawn as an image: one pixel a cell in an offscreen canvas, scaled up in one drawImage. */
  function bitmap(W, H) {
    const off = document.createElement('canvas'); off.width = W; off.height = H;
    const octx = off.getContext('2d'), img = octx.createImageData(W, H), px = new Uint32Array(img.data.buffer);
    return { px, flush() { octx.putImageData(img, 0, 0); }, draw(ctx, x, y, w, h, smooth) { ctx.imageSmoothingEnabled = !!smooth; ctx.drawImage(off, x, y, w, h); ctx.imageSmoothingEnabled = true; } };
  }

  /** The animation loop under a demo: Play / Pause, an optional Step, Reset, an optional speed slider (0..100, read by the demo), and a
      status line. frame(dtFrames) is called once per animation frame while it runs. It pauses when the tab is hidden and stops for good
      once the host has left the document. */
  function loop(host, api, o) {
    const el = api.el; let running = false, raf = 0, last = 0, dead = false;
    const playBtn = el('button', { class: 'btn primary', type: 'button', onclick: () => (running ? pause() : play()) }, 'Play');
    const stepBtn = o.step ? el('button', { class: 'btn', type: 'button', onclick: () => { pause(); o.step(); } }, 'Step') : null;
    const resetBtn = el('button', { class: 'btn quiet', type: 'button', onclick: () => o.reset() }, o.resetText || 'Reset');
    const speed = o.speed ? el('input', { type: 'range', min: 0, max: 100, value: o.speed.value, class: 'algo-speed', 'aria-label': o.speed.label }) : null;
    const status = el('span', { class: 'algo-status', role: 'status' });
    const bar = el('div', { class: 'algo-controls' }, playBtn, stepBtn, resetBtn, speed ? el('label', { class: 'algo-speed-label' }, o.speed.label + ' ', speed) : null, status);
    host.append(bar);
    function tick(t) {
      raf = 0;
      if (!running || dead) return;
      if (!host.isConnected) { stop(); return; }   // the reader left the page
      const dt = last ? Math.min(3, Math.max(0.2, (t - last) / (1000 / 60))) : 1; last = t;
      o.frame(dt);
      if (running) raf = requestAnimationFrame(tick);
    }
    function play() { if (dead || running) return; running = true; last = 0; playBtn.textContent = 'Pause'; status.textContent = ''; raf = requestAnimationFrame(tick); if (o.onPlay) o.onPlay(); }
    function pause() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; playBtn.textContent = 'Play'; }
    const onHide = () => { if (document.hidden) pause(); };
    document.addEventListener('visibilitychange', onHide);
    function stop() { pause(); dead = true; document.removeEventListener('visibilitychange', onHide); }
    return { play, pause, stop, isRunning: () => running, controls: bar, status: (t) => { status.textContent = t; }, speed: () => (speed ? +speed.value : 50) };
  }
  /** A labelled slider with its value shown beside it. */
  function slider(el, label, min, max, step, value, onInput, show) {
    const out = el('output', {}, show ? show(value) : String(value));
    const inp = el('input', { type: 'range', min, max, step, value, 'aria-label': label, oninput: () => { out.textContent = show ? show(+inp.value) : inp.value; onInput(+inp.value); } });
    return { label: el('label', { class: 'nt-slider' }, label + ' ', inp, out), input: inp, set(v) { inp.value = v; out.textContent = show ? show(+v) : String(v); } };
  }
  const logScale = (v, lo, hi) => lo * Math.pow(hi / lo, v / 100);   // slider 0..100 to lo..hi, evenly in ratio

  // ---------------------------------------------------------------- demo: flocking
  function mountBoids(host, api) {
    injectCss();
    const el = api.el, wide = (host.clientWidth || 800) >= 640, P = Object.assign({}, BOID);
    let count = wide ? 350 : 160, flock = null, trails = false, showView = true, hawkOn = false, pointer = null, frames = 0;
    const hawk = { x: 0, y: 0, vx: 1.5, vy: 0 };
    host.append(el('p', { class: 'nt-hint' }, 'Every bird follows three rules, looking only at the birds near it: don\'t crowd them (separation), fly the way they fly (alignment), stay close to them (cohesion). Move your pointer over the sky, or drag a finger, to be a hawk; or let a hawk hunt by itself. Then change the rules and see the flock change.'));
    const sep = slider(el, 'Separation', 0, 4, 0.1, P.sep, (v) => { P.sep = v; }), ali = slider(el, 'Alignment', 0, 4, 0.1, P.ali, (v) => { P.ali = v; }), coh = slider(el, 'Cohesion', 0, 4, 0.1, P.coh, (v) => { P.coh = v; });
    const view = slider(el, 'View', 10, 120, 1, P.view, (v) => { P.view = v; }, (v) => v + ' px');
    const countSel = el('select', { 'aria-label': 'Number of birds', onchange: () => { count = +countSel.value; fresh(); } }, [50, 160, 350, 700, 1200].map((k) => el('option', { value: String(k) }, k + ' birds')));
    countSel.value = String(count);
    const check = (label, on, set) => { const b = el('input', { type: 'checkbox', onchange: () => set(b.checked) }); b.checked = on; return el('label', { class: 'nt-check' }, b, label); };
    const presets = el('select', { 'aria-label': 'Try a setting', onchange: () => { const k = presets.value; presets.value = ''; const s = ({ flock: [1.5, 1, 1, 48], swarm: [1.5, 0, 0.9, 48], gas: [1.5, 0, 0, 48], school: [2.2, 2.5, 0.3, 60], clump: [0.2, 0.6, 3, 70] })[k]; if (s) { [P.sep, P.ali, P.coh, P.view] = s; sep.set(s[0]); ali.set(s[1]); coh.set(s[2]); view.set(s[3]); } } },
      el('option', { value: '' }, 'Try…'), el('option', { value: 'flock' }, 'A flock (all three rules)'), el('option', { value: 'swarm' }, 'No alignment: a swarm of gnats'), el('option', { value: 'gas' }, 'Separation only: a gas'), el('option', { value: 'school' }, 'Strong alignment: a school of fish'), el('option', { value: 'clump' }, 'Too much cohesion: clumps'));
    host.append(el('div', { class: 'algo-controls' }, sep.label, ali.label, coh.label, view.label));
    host.append(el('div', { class: 'algo-controls' }, el('label', {}, 'Birds ', countSel), presets, check('A hawk hunts', hawkOn, (v) => { hawkOn = v; }), check('Show one bird\'s view', showView, (v) => { showView = v; cv.redraw(); }), check('Trails', trails, (v) => { trails = v; cv.redraw(); })));
    const stats = el('div', { class: 'nt-stats' });
    const cv = api.canvas(host, { label: 'A flock of birds, each steering by three rules', maxWidth: 1100, height: (w) => Math.round(w >= 640 ? Math.min(560, w * 0.52) : Math.max(320, w * 1.05)), draw });
    cv.canvas.parentNode.classList.add('nt-canvas');
    host.append(stats);
    const lp = loop(host, api, { frame, reset: () => { fresh(); }, resetText: 'New flock', step: () => { frame(1); } });
    function fresh() { const { w, h } = cv.size(); flock = makeFlock(count, w || 800, h || 400, 1 + Math.floor(Math.random() * 1e6), P); hawk.x = (w || 800) * 0.1; hawk.y = (h || 400) * 0.5; frames = 0; cv.redraw(); update(); }
    const local = (e) => { const r = cv.canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    cv.canvas.addEventListener('pointermove', (e) => { pointer = local(e); if (!lp.isRunning()) cv.redraw(); });
    cv.canvas.addEventListener('pointerdown', (e) => { pointer = local(e); try { cv.canvas.setPointerCapture(e.pointerId); } catch (x) { /* old browser */ } });
    cv.canvas.addEventListener('pointerleave', () => { pointer = null; });
    cv.canvas.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') pointer = null; });
    cv.canvas.addEventListener('pointercancel', () => { pointer = null; });
    function moveHawk(dt) {   // the hawk chases the nearest bird, a little slower than the birds can fly, so they get away
      let best = -1, bd = Infinity;
      for (let i = 0; i < flock.n; i++) { let dx = flock.x[i] - hawk.x, dy = flock.y[i] - hawk.y; if (dx > flock.w / 2) dx -= flock.w; else if (dx < -flock.w / 2) dx += flock.w; if (dy > flock.h / 2) dy -= flock.h; else if (dy < -flock.h / 2) dy += flock.h; const d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; hawk.tx = dx; hawk.ty = dy; } }
      if (best >= 0) { const L = Math.hypot(hawk.tx, hawk.ty) || 1; hawk.vx += (hawk.tx / L * 2.9 - hawk.vx) * 0.05 * dt; hawk.vy += (hawk.ty / L * 2.9 - hawk.vy) * 0.05 * dt; }
      hawk.x = ((hawk.x + hawk.vx * dt) % flock.w + flock.w) % flock.w; hawk.y = ((hawk.y + hawk.vy * dt) % flock.h + flock.h) % flock.h;
    }
    const hawks = () => [...(pointer ? [pointer] : []), ...(hawkOn ? [hawk] : [])];
    function frame(dt) {
      if (!flock) fresh();
      if (hawkOn) moveHawk(dt);
      flockStep(flock, P, hawks(), dt); frames++;
      paint(true); update();
    }
    function update() { if (!flock) return; const o = order(flock); stats.replaceChildren(el('span', {}, 'Birds ', el('b', {}, fmt(flock.n))), el('span', {}, 'Lined up ', el('b', {}, Math.round(o * 100) + '%'), o > 0.8 ? ' (one flock, one way)' : o < 0.3 ? ' (every which way)' : ''), el('span', {}, 'Steps ', el('b', {}, fmt(frames)))); }
    let col = null;
    function draw(ctx, w, h, c) { col = c; if (flock && (flock.w !== w || flock.h !== h)) { for (let i = 0; i < flock.n; i++) { flock.x[i] = flock.x[i] % w; flock.y[i] = flock.y[i] % h; } flock.w = w; flock.h = h; } paint(false); }
    function paint(fading) {
      const ctx = cv.ctx, { w, h } = cv.size(), c = col || api.colors(); if (!w || !flock) return;
      if (trails && fading) { ctx.globalAlpha = 0.16; ctx.fillStyle = c.paper; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1; } else { ctx.fillStyle = c.paper; ctx.fillRect(0, 0, w, h); }
      const { x, y, vx, vy, n } = flock;
      // one bird's view: its circle of sight and a line to every bird it can see
      if (showView && n) {
        ctx.fillStyle = c.accentSoft; ctx.globalAlpha = trails ? 0.25 : 1; ctx.beginPath(); ctx.arc(x[0], y[0], Math.min(P.view, w / 2, h / 2), 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
        const g = buildGrid(flock, Math.max(4, Math.min(P.view, w / 2, h / 2))); ctx.strokeStyle = c.ok; ctx.lineWidth = 1; ctx.beginPath();
        eachNeighbour(flock, g, 0, Math.max(4, Math.min(P.view, w / 2, h / 2)), (j, dx, dy) => { ctx.moveTo(x[0], y[0]); ctx.lineTo(x[0] + dx, y[0] + dy); }); ctx.stroke();
      }
      ctx.beginPath();
      const L = n > 700 ? 5 : 7, Wd = n > 700 ? 2.2 : 3;
      for (let i = showView ? 1 : 0; i < n; i++) {
        const s = Math.hypot(vx[i], vy[i]) || 1, ux = vx[i] / s, uy = vy[i] / s;
        ctx.moveTo(x[i] + ux * L, y[i] + uy * L); ctx.lineTo(x[i] - ux * L * 0.6 - uy * Wd, y[i] - uy * L * 0.6 + ux * Wd); ctx.lineTo(x[i] - ux * L * 0.6 + uy * Wd, y[i] - uy * L * 0.6 - ux * Wd); ctx.closePath();
      }
      ctx.fillStyle = c.accent; ctx.fill();
      if (showView && n) { const s = Math.hypot(vx[0], vy[0]) || 1, ux = vx[0] / s, uy = vy[0] / s, B = 10; ctx.beginPath(); ctx.moveTo(x[0] + ux * B, y[0] + uy * B); ctx.lineTo(x[0] - ux * B * 0.6 - uy * 4.5, y[0] - uy * B * 0.6 + ux * 4.5); ctx.lineTo(x[0] - ux * B * 0.6 + uy * 4.5, y[0] - uy * B * 0.6 - ux * 4.5); ctx.closePath(); ctx.fillStyle = c.ok; ctx.fill(); }
      for (const hk of hawks()) {
        ctx.strokeStyle = c.err; ctx.globalAlpha = 0.35; ctx.lineWidth = 1; ctx.setLineDash([4, 5]); ctx.beginPath(); ctx.arc(hk.x, hk.y, P.fear, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
        ctx.fillStyle = c.err; ctx.beginPath(); ctx.arc(hk.x, hk.y, 6, 0, TAU); ctx.fill();
      }
    }
    requestAnimationFrame(() => { fresh(); if (!api.reducedMotion()) lp.play(); else lp.status('Paused, because your system asks for less motion. Press Play to start.'); });
    return () => { lp.stop(); cv.stop(); };
  }

  // ---------------------------------------------------------------- demo: Langton's ant
  function mountAnt(host, api) {
    injectCss();
    const el = api.el, wide = (host.clientWidth || 800) >= 640, W = wide ? 160 : 96, H = wide ? 96 : 104;
    let rule = 'RL', ant = makeAnt(rule, W, H), hw = null, bet = '', lut = null, lutKey = '', told = false;
    const bm = bitmap(W, H);
    host.append(el('p', { class: 'nt-hint' }, 'An ant stands on a grid of white cells. On a white cell it turns right, on a black cell it turns left; then it flips the colour of the cell it is leaving and steps forward. That is all. Before you press Play: will its drawing ever settle into a pattern?'));
    const betSel = el('select', { 'aria-label': 'Your bet', onchange: () => { bet = betSel.value; lp.status(bet ? 'Bet made. Press Play.' : 'Make your bet, then press Play.'); } },
      el('option', { value: '' }, 'Make a bet…'), el('option', { value: 'soon' }, 'Yes, within 1,000 steps'), el('option', { value: 'late' }, 'Yes, but only after a long time'), el('option', { value: 'never' }, 'No, it stays a mess for ever'));
    const ruleSel = el('select', { 'aria-label': 'Rule', onchange: () => { if (ruleSel.value !== 'own') { ruleIn.value = ruleSel.value; load(ruleSel.value); } else ruleIn.focus(); } },
      ANT_RULES.map((r) => el('option', { value: r.rule }, r.name)), el('option', { value: 'own' }, 'Your own…'));
    const ruleIn = el('input', { class: 'nt-rule', type: 'text', value: 'RL', maxlength: 12, spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Your own rule: up to 12 letters, L or R',
      onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); tryOwn(); } }, onchange: () => tryOwn() });
    function tryOwn() { const s = ruleIn.value.toUpperCase().replace(/[^LR]/g, ''); ruleIn.value = s; if (!validRule(s)) { lp.status('A rule is 2 to 12 letters, each L or R.'); return; } const known = ANT_RULES.find((r) => r.rule === s); ruleSel.value = known ? s : 'own'; load(s); }
    const betRow = el('div', { class: 'algo-controls' }, el('label', {}, 'Will it ever settle? ', betSel));
    host.append(betRow);
    host.append(el('div', { class: 'algo-controls' }, el('label', {}, 'Rule ', ruleSel), el('label', {}, 'Letters ', ruleIn)));
    const stats = el('div', { class: 'nt-stats' }), big = el('p', { class: 'nt-big', role: 'status' });
    const cv = api.canvas(host, { label: 'Langton\'s ant drawing on a grid', maxWidth: 1100, height: (w) => Math.round(w * H / W), draw });
    host.append(stats, big);
    const lp = loop(host, api, { frame, reset: () => load(rule), speed: { label: 'Steps a frame', value: 34 }, step: () => { antSteps(ant, 1); after(); } });
    const perFrame = () => Math.max(1, Math.round(logScale(lp.speed(), 1, 5000)));
    function load(r) { rule = r; ant = makeAnt(r, W, H); hw = null; told = false; edge = false; betRow.style.display = r === 'RL' ? '' : 'none'; /* .algo-controls is display: flex, which beats the hidden attribute */ lutKey = ''; lp.pause(); big.replaceChildren(''); lp.status(r === 'RL' && !bet ? 'Make your bet, then press Play.' : ''); after(); }
    let edge = false;   // has the ant reached the edge since the highway began (the demo pauses there once)
    function frame() {
      const k = perFrame(), w0 = ant.wraps || 0; antSteps(ant, k, !edge);
      after();
      if (!edge && (ant.wraps || 0) > w0) { edge = true; lp.pause(); lp.status(hw ? 'The highway reached the edge. Press Play to let it wrap round.' : 'The ant reached the edge. Press Play to let it wrap round to the other side.'); }
    }
    function after() {
      if (rule === 'RL' && !hw) { hw = highway(ant, 104); if (hw) verdict(); }
      const now = rule === 'RL' && hw ? highway(ant, 104) : null;
      const phase = rule !== 'RL' ? '' : now ? 'the highway' : hw ? 'chaos again: the highway wrapped round into the mess' : ant.steps < 500 ? 'simple, symmetric shapes' : 'chaos';
      stats.replaceChildren(el('span', {}, 'Step ', el('b', {}, fmt(ant.steps))), el('span', {}, 'Colours ', el('b', {}, String(ant.k))), phase ? el('span', {}, 'Now: ', el('b', {}, phase)) : null,
        hw ? el('span', {}, 'First highway from about step ', el('b', {}, fmt(hw.from))) : null);
      if (rule === 'RL' && !hw && !told && ant.steps >= 1000 && bet === 'soon') { told = true; big.replaceChildren(el('span', { class: 'nt-lose' }, '1,000 steps and still a mess: not that soon. Keep watching.')); }
      cv.redraw();
    }
    function verdict() {
      const msg = 'At about step ' + fmt(hw.from) + ' the ant began repeating the same 104 steps, moving 2 cells diagonally each time: a highway, and it never stops building it. ';
      const res = bet === 'late' ? el('span', { class: 'nt-win' }, 'Your bet won! ') : bet === 'soon' ? el('span', { class: 'nt-lose' }, 'Your bet was too early: ') : bet === 'never' ? el('span', { class: 'nt-lose' }, 'Your bet lost: it did settle. ') : null;
      big.replaceChildren(res, msg, 'Here the grid\'s edges wrap round, so the highway will come back on the other side and crash into the mess. What happens then?');
      lp.status('');
    }
    function draw(ctx, w, h, c) {
      const key = c.paper + c.ink + c.accent + ant.k;
      if (key !== lutKey) {
        lutKey = key; const dark = isDark(c), paper = rgb(c.paper); lut = new Uint32Array(Math.max(2, ant.k));
        lut[0] = pack(paper);
        if (ant.k === 2) lut[1] = pack(rgb(c.ink2));
        else for (let j = 1; j < ant.k; j++) { const t = (j - 1) / (ant.k - 2); lut[j] = pack(rgb('hsl(' + Math.round(195 + 200 * t) + ', ' + (dark ? 60 : 55) + '%, ' + (dark ? 70 - 22 * t : 38 + 20 * t) + '%)')); }   // blue through purple to orange, darkest first on paper
      }
      const g = ant.grid, px = bm.px; for (let i = 0; i < g.length; i++) px[i] = lut[g[i]];
      bm.flush();
      ctx.fillStyle = c.paper; ctx.fillRect(0, 0, w, h);
      const cs = Math.min(w / W, h / H), ox = (w - cs * W) / 2, oy = (h - cs * H) / 2;
      bm.draw(ctx, ox, oy, cs * W, cs * H, false);
      ctx.fillStyle = c.err; ctx.beginPath(); ctx.arc(ox + (ant.x + 0.5) * cs, oy + (ant.y + 0.5) * cs, Math.max(2.5, cs * 0.9), 0, TAU); ctx.fill();
    }
    load('RL');
    return () => { lp.stop(); cv.stop(); };
  }

  // ---------------------------------------------------------------- demo: the sandpile
  function mountSand(host, api) {
    injectCss();
    const el = api.el, wide = (host.clientWidth || 800) >= 640, LIVE = wide ? 151 : 101, BINS = 26;
    let pile = makePile(LIVE), bm = bitmap(LIVE, LIVE), where = 'centre', hist = new Float64Array(BINS), quiet = 0, drops = 0, lastAv = 0, maxAv = 0, big = 0, lut = null, lutKey = '', rnd = A.rng(7);
    host.append(el('p', { class: 'nt-hint' }, 'Grains of sand fall on a grid, one at a time. A cell may hold up to 3 grains; one with 4 topples, giving a grain to each of its four neighbours, which may topple in turn: an avalanche. Grains that topple off the edge are lost. The colours show 0, 1, 2 and 3 grains.'));
    const whereSel = el('select', { 'aria-label': 'Where grains fall', onchange: () => { where = whereSel.value; } }, el('option', { value: 'centre' }, 'on the centre'), el('option', { value: 'random' }, 'anywhere at random'));
    const bigSel = el('select', { 'aria-label': 'How many grains to drop at once' }, [10, 12, 14, 15, 16, 17].map((k) => el('option', { value: String(k) }, '2^' + k + ' = ' + fmt(Math.pow(2, k)))));
    bigSel.value = wide ? '16' : '14';
    host.append(el('div', { class: 'algo-controls' }, el('label', {}, 'Drop grains ', whereSel), el('label', {}, 'or all at once: ', bigSel), el('button', { class: 'btn', type: 'button', onclick: () => bigDrop(+bigSel.value) }, 'Drop them')));
    const stats = el('div', { class: 'nt-stats' }), note = el('p', { class: 'nt-big' });
    const cv = api.canvas(host, { label: 'A sandpile and a chart of its avalanche sizes', maxWidth: 1100, height: (w) => Math.round(w >= 640 ? Math.min(520, w * 0.5) : w + 170), draw });
    host.append(stats, note);
    const lp = loop(host, api, { frame, reset, speed: { label: 'Grains a frame', value: 55 }, step: () => { if (pile.qn) relax(pile, 5000); else one(); paint(); } });
    const perFrame = () => Math.max(1, Math.round(logScale(lp.speed(), 1, 4000)));
    function fresh(N) { pile = makePile(N); bm = bitmap(N, N); hist = new Float64Array(BINS); quiet = 0; drops = 0; lastAv = 0; maxAv = 0; }
    function reset() { lp.pause(); big = 0; fresh(LIVE); note.replaceChildren(''); lp.status(''); paint(); }
    function one() {
      const N = pile.N, i = where === 'centre' ? (N >> 1) * N + (N >> 1) : rnd.int(N * N);
      const s = dropOne(pile, i); drops++; lastAv = s; if (s > maxAv) maxAv = s; if (s) hist[Math.min(BINS - 1, sizeBin(s))]++; else quiet++;
    }
    function bigDrop(k) {
      const n = Math.pow(2, k); lp.pause(); big = n; fresh(pileSizeFor(n));
      addGrains(pile, (pile.N >> 1) * pile.N + (pile.N >> 1), n);
      note.replaceChildren(fmt(n) + ' grains on one cell. Toppling…'); lp.play();
    }
    function frame() {
      const t0 = performance.now();
      if (pile.qn) {   // a big drop is relaxing: as much as fits in about 12 ms, then show it
        while (pile.qn && performance.now() - t0 < 12) relax(pile, 20000);
        if (!pile.qn) { lp.pause(); note.replaceChildren(el('span', { class: 'nt-win' }, 'Stable after ' + fmt(pile.topples) + ' topplings.'), ' Whatever order the cells topple in, the picture and the count come out the same. Press Play to keep dropping grains on it.'); }
      } else { const k = perFrame(); for (let g = 0; g < k && performance.now() - t0 < 12; g++) one(); }
      paint();
    }
    function paint() {
      const fell = pile.lost, on = onGrid(pile);   // counted, not worked out from the other two, so the bookkeeping on screen is a real check
      stats.replaceChildren(el('span', {}, 'Grains dropped ', el('b', {}, fmt(pile.dropped))), el('span', {}, 'on the grid ', el('b', {}, fmt(on))), el('span', {}, 'fell off ', el('b', {}, fmt(fell))),
        el('span', {}, 'Topplings ', el('b', {}, fmt(pile.topples))), drops ? el('span', {}, 'Last avalanche ', el('b', {}, fmt(lastAv)), ' · biggest ', el('b', {}, fmt(maxAv))) : null,
        drops ? el('span', {}, 'Drops with no avalanche ', el('b', {}, Math.round(100 * quiet / drops) + '%')) : null);
      cv.redraw();
    }
    function draw(ctx, w, h, c) {
      const key = c.paper + c.accent + c.link + c.warn;
      if (key !== lutKey) { lutKey = key; const dark = isDark(c), paper = rgb(c.paper); lut = new Uint32Array([pack(paper), pack(mix(paper, rgb(c.link), dark ? 0.55 : 0.45)), pack(rgb(c.accent)), pack(rgb(c.warn))]); }
      const hh = pile.h, px = bm.px; for (let i = 0; i < hh.length; i++) px[i] = lut[hh[i] > 3 ? 3 : hh[i]];
      bm.flush();
      ctx.fillStyle = c.paper; ctx.fillRect(0, 0, w, h);
      const side = w >= 640, S = side ? h - 16 : w - 16, ox = 8, oy = 8;
      ctx.fillStyle = c.paper2; ctx.fillRect(ox, oy, S, S);
      bm.draw(ctx, ox, oy, S, S, false);
      ctx.strokeStyle = c.rule; ctx.lineWidth = 1; ctx.strokeRect(ox + 0.5, oy + 0.5, S - 1, S - 1);
      // the key to the colours
      const kx = side ? ox + S + 24 : ox, ky = side ? oy + 4 : oy + S + 10;
      ctx.font = '12px ' + (c.sans || 'sans-serif'); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      ['0', '1', '2', '3'].forEach((t, k) => { const x = kx + k * 46; ctx.fillStyle = '#' + (lut[k] & 0xffffff).toString(16).padStart(6, '0').replace(/(..)(..)(..)/, '$3$2$1'); ctx.fillRect(x, ky, 14, 14); ctx.strokeStyle = c.rule; ctx.strokeRect(x + 0.5, ky + 0.5, 13, 13); ctx.fillStyle = c.ink2; ctx.fillText(t, x + 19, ky + 7.5); });
      ctx.fillText('grains in a cell', kx + 188, ky + 7.5);
      // the avalanche sizes: how many drops caused an avalanche of each size, both scales logarithmic
      const gx = side ? ox + S + 54 : ox + 40, gy = side ? oy + 56 : oy + S + 52, gw = side ? w - gx - 18 : w - gx - 14, gh = side ? h - gy - 50 : h - gy - 40;
      if (gw < 100 || gh < 50) return;
      ctx.fillStyle = c.ink; ctx.font = '600 13px ' + (c.sans || 'sans-serif'); ctx.textBaseline = 'bottom'; ctx.fillText('Avalanche sizes', gx - (side ? 0 : 0), gy - 8);
      ctx.strokeStyle = c.rule; ctx.strokeRect(gx + 0.5, gy + 0.5, gw - 1, gh - 1);
      let top = 0, last = 1; for (let b = 1; b < BINS; b++) { if (hist[b] > top) top = hist[b]; if (hist[b]) last = b; }
      const nb = Math.max(12, last + 1), bw = gw / nb, Ly = (v) => Math.log10(1 + v) / Math.log10(1 + Math.max(10, top));
      ctx.fillStyle = c.accent;
      for (let b = 1; b < nb; b++) if (hist[b]) { const bh = Ly(hist[b]) * (gh - 6); ctx.fillRect(gx + (b - 0.5) * bw + 1, gy + gh - bh, Math.max(1, bw - 2), bh); }
      ctx.fillStyle = c.ink3; ctx.font = '11px ' + (c.sans || 'sans-serif'); ctx.textBaseline = 'top'; ctx.textAlign = 'center';
      for (let p = 0; p <= 6; p++) { const b = sizeBin(Math.pow(10, p)); if (b >= nb) break; ctx.fillText(fmt(Math.pow(10, p)), gx + (b - 0.5) * bw + bw / 2, gy + gh + 4); }
      ctx.textAlign = 'right'; ctx.fillText('topplings in one avalanche →', gx + gw, gy + gh + 18);
      ctx.save(); ctx.translate(gx - 8, gy + gh / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText('how often (log)', 0, 0); ctx.restore();
      if (!drops) { ctx.fillStyle = c.ink3; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(big && !pile.qn ? 'Press Play to drop single grains' : 'Press Play to drop grains', gx + gw / 2, gy + gh / 2); }
    }
    paint();
    requestAnimationFrame(() => { if (!api.reducedMotion()) lp.play(); else lp.status('Paused, because your system asks for less motion. Press Play to start.'); });
    return () => { lp.stop(); cv.stop(); };
  }

  // ---------------------------------------------------------------- demo: slime mould
  function mountSlime(host, api) {
    injectCss();
    const el = api.el, wide = (host.clientWidth || 800) >= 640, W = wide ? 320 : 180, H = wide ? 190 : 200;
    const DENS = [0.01, 0.02, 0.04, 0.1, 0.15, 0.25], cells = W * H;
    let P = Object.assign({ ss: 1, dep: 5, smell: 40 }, SLIME_PRESETS.network), density = P.density, start = 'random', food = [], s = null, lut = null, lutKey = '', ref = 1;
    const bm = bitmap(W, H);
    host.append(el('p', { class: 'nt-hint' }, 'Thousands of tiny agents, each smelling the trail just ahead of it on the left, in the middle and on the right. Each turns towards the strongest smell, steps forward and leaves a little more; the trail spreads and fades. Click to put down food, or click food to take it away: try "Joining up food", and watch the network find the food.'));
    const presetSel = el('select', { 'aria-label': 'Preset', onchange: () => usePreset(presetSel.value) }, Object.entries(SLIME_PRESETS).map(([k, v]) => el('option', { value: k }, v.name)));
    const foodSel = el('select', { 'aria-label': 'Food', onchange: () => { food = makeFood(foodSel.value); foodSel.value = 'keep'; update(); if (!lp.isRunning()) cv.redraw(); } },
      el('option', { value: 'keep' }, 'Food…'), el('option', { value: 'none' }, 'No food'), el('option', { value: 'cities' }, 'Twelve towns'), el('option', { value: 'ring' }, 'A ring of eight'), el('option', { value: 'pair' }, 'Two far apart'));
    const countSel = el('select', { 'aria-label': 'Number of agents', onchange: () => { density = +countSel.value; fresh(); } }, DENS.map((d) => el('option', { value: String(d) }, fmt(d * cells) + ' agents')));
    countSel.value = String(density);
    const startSel = el('select', { 'aria-label': 'Start', onchange: () => { start = startSel.value; fresh(); } }, el('option', { value: 'random' }, 'scattered everywhere'), el('option', { value: 'spore' }, 'from a spot in the middle'));
    const sa = slider(el, 'Sensor angle', 5, 90, 1, P.sa, (v) => { P.sa = v; }, (v) => Math.round(v) + '°'), ra = slider(el, 'Turn', 5, 90, 1, P.ra, (v) => { P.ra = v; }, (v) => Math.round(v) + '°');
    const so = slider(el, 'Sensor distance', 1, 30, 1, P.so, (v) => { P.so = v; }), dc = slider(el, 'Fade', 1, 30, 1, Math.round(P.decay * 100), (v) => { P.decay = v / 100; }, (v) => v + '%');
    function usePreset(k) {
      const q = SLIME_PRESETS[k]; Object.assign(P, { sa: q.sa, ra: q.ra, so: q.so, decay: q.decay }); sa.set(P.sa); so.set(P.so); ra.set(P.ra); dc.set(Math.round(P.decay * 100));
      density = q.density; countSel.value = String(density); start = q.start || 'random'; startSel.value = start; food = makeFood(q.feed || 'none'); fresh();
    }
    host.append(el('div', { class: 'algo-controls' }, el('label', {}, 'Preset ', presetSel), foodSel, countSel, el('label', {}, 'Start ', startSel)));
    host.append(el('div', { class: 'algo-controls' }, sa.label, ra.label, so.label, dc.label));
    const stats = el('div', { class: 'nt-stats' });
    const cv = api.canvas(host, { label: 'A slime mould\'s trails forming a network', maxWidth: 1100, height: (w) => Math.round(w * H / W), draw });
    cv.canvas.parentNode.classList.add('nt-canvas');
    host.append(stats);
    const lp = loop(host, api, { frame, reset: () => fresh(), resetText: 'Start again', speed: { label: 'Speed', value: 50 }, step: () => { slimeStep(s, P, food); cv.redraw(); update(); } });
    function makeFood(kind) {
      const r = A.rng(kind.length * 977 + 3), out = [];
      if (kind === 'cities') { for (let t = 0; out.length < 12 && t < 4000; t++) { const p = [W * (0.08 + 0.84 * r()), H * (0.1 + 0.8 * r())]; if (out.every((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) > Math.min(W, H) * 0.17)) out.push(p); } }
      else if (kind === 'ring') for (let k = 0; k < 8; k++) out.push([W / 2 + Math.cos(k * TAU / 8) * H * 0.36, H / 2 + Math.sin(k * TAU / 8) * H * 0.36]);
      else if (kind === 'pair') out.push([W * 0.15, H * 0.3], [W * 0.85, H * 0.7]);
      return out;
    }
    function fresh() { s = makeSlime(Math.round(density * cells), W, H, 1 + Math.floor(Math.random() * 1e6), start); ref = 1; cv.redraw(); update(); }
    function frame() { const k = Math.max(1, Math.round(logScale(lp.speed(), 1, 4) - 0.25)); for (let i = 0; i < k; i++) slimeStep(s, P, food); cv.redraw(); update(); }
    function update() { stats.replaceChildren(el('span', {}, 'Agents ', el('b', {}, fmt(s.n))), el('span', {}, 'Food ', el('b', {}, String(food.length))), el('span', {}, 'Steps ', el('b', {}, fmt(s.steps)))); }
    cv.canvas.addEventListener('pointerdown', (e) => {
      const r = cv.canvas.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * H;
      const near = food.findIndex((f) => Math.hypot(f[0] - x, f[1] - y) < 6);
      if (near >= 0) food.splice(near, 1); else if (food.length < 40) food.push([x, y]);
      update(); if (!lp.isRunning()) cv.redraw();
    });
    function draw(ctx, w, h, c) {
      const key = c.paper + c.accent + c.ink;
      if (key !== lutKey) {   // paper → the accent → nearly the ink, so the busiest roads glow
        lutKey = key; const paper = rgb(c.paper), acc = rgb(c.accent), ink = rgb(c.ink); lut = new Uint32Array(256);
        for (let k = 0; k < 256; k++) { const t = k / 255; lut[k] = pack(t < 0.6 ? mix(paper, acc, t / 0.6) : mix(acc, mix(acc, ink, 0.7), (t - 0.6) / 0.4)); }
      }
      if (!s) return;
      const tr = s.trail, px = bm.px; let sum = 0;
      for (let i = 0; i < tr.length; i++) { const v = tr[i]; sum += v; px[i] = lut[Math.min(255, (255 * v / (v + ref)) | 0)]; }
      ref = ref * 0.9 + 0.1 * Math.max(0.05, 2.2 * sum / tr.length);   // the brightness follows the mean, smoothly, so the picture neither fades nor burns out
      bm.flush();
      bm.draw(ctx, 0, 0, w, h, true);
      if (food.length) { ctx.fillStyle = c.warn; ctx.strokeStyle = c.paper; ctx.lineWidth = 1.5; for (const [fx, fy] of food) { ctx.beginPath(); ctx.arc(fx / W * w, fy / H * h, Math.max(3.5, w / W * 2), 0, TAU); ctx.fill(); ctx.stroke(); } }
    }
    fresh();
    requestAnimationFrame(() => { if (!api.reducedMotion()) lp.play(); else lp.status('Paused, because your system asks for less motion. Press Play to start.'); });
    return () => { lp.stop(); cv.stop(); };
  }

  // ================================================================== registration
  A.register({ id: 'boids', group: GROUP, title: 'Flocking birds',
    blurb: 'Hundreds of birds, each following three simple rules about its nearest neighbours, and no leader: yet they fly as one flock. Chase them with a hawk.',
    mount: mountBoids,
    about: `<h2>Three rules and no leader</h2>
<p>In 1986 the computer graphics researcher Craig Reynolds found a way to animate a flock without planning the path of every bird. Each of his "boids" (bird-oids) follows three rules, using only the boids it can see nearby:</p>
<ul><li><b>Separation:</b> steer away from boids that are too close, harder the closer they are.</li>
<li><b>Alignment:</b> steer towards the average heading of the boids around you.</li>
<li><b>Cohesion:</b> steer towards the average position of the boids around you.</li></ul>
<p>No boid knows where the flock is going, and no boid leads. The flock's shape, its turns and its splitting round an obstacle (or a hawk) all <em>emerge</em> from many small local decisions. Reynolds presented the model at the SIGGRAPH conference in 1987, in the paper "Flocks, Herds, and Schools: A Distributed Behavioral Model". The short film <em>Stanley and Stella in: Breaking the Ice</em> (1987) was the first made with it, and the bat swarms and marching penguins of <em>Batman Returns</em> (1992) came from it too.</p>
<h2>What to try</h2>
<ul><li>Turn alignment to 0: the birds still stay together, but buzz about like gnats. Turn cohesion to 0 as well: a gas.</li>
<li>Make the view very small: many little flocks that never find each other. Make it large: one big flock.</li>
<li>The "lined up" number is the length of the average of every bird's direction: 100% when all fly the same way, near 0 when they fly every way. Watch it climb from a random start, with nobody telling the birds which way to go.</li></ul>
<h2>The cost, and the grid</h2>
<p>If every bird compared itself with every other bird, n birds would need about n² comparisons a step: 490,000 for 700 birds, sixty times a second. Instead the sky is cut into squares as wide as a bird can see, and each bird only looks in its own square and the eight around it. Each step then costs about n × (birds in a neighbourhood), which grows in step with n. Games and physics programs use the same trick to find what is near what.</p>`,
    taught: [{ href: '#/python/12', text: 'SC 101 Lesson 12: Randomness and simulation' }, { href: '#/dsa/1', text: 'SC 107 Lesson 1: Counting the cost' }] });
  A.register({ id: 'langtons-ant', group: GROUP, title: 'Langton\'s ant',
    blurb: 'An ant turns right on white, left on black, and flips the colour. For ten thousand steps it makes a mess. Will it ever settle down? Bet first.',
    mount: mountAnt,
    about: `<h2>Two rules</h2>
<p>Chris Langton, a pioneer of the field he named "artificial life", described the ant in 1986. It stands on a grid of white cells, facing up. On a white cell it turns right, on a black cell it turns left; it flips the colour of the cell and steps forward. Nothing else.</p>
<h2>Three acts</h2>
<ul><li>For the first few hundred steps it draws small, often symmetric shapes.</li>
<li>Then comes chaos: a growing blob with no visible pattern, for about ten thousand steps.</li>
<li>Then, at step 9,977 or so, it suddenly starts a <b>highway</b>: the same 104 steps over and over, each repeat moving it two cells diagonally, for ever. The demo spots it by checking that the ant's last three runs of 104 steps each moved it the same way.</li></ul>
<p>Nobody has proved that the ant always builds a highway, whatever black cells it starts among; every experiment so far says it does. Leonid Bunimovich and Serge Troubetzkoy did prove that it can never stay inside a bounded region for ever. A rule this simple, with a future we cannot prove: that is the point of the demo. In fact the ant can compute anything a computer can, given the right starting cells.</p>
<h2>More colours</h2>
<p>Greg Turk and Jim Propp gave the ant more colours. A rule is a string of letters, one per colour: on a cell of colour k the ant turns as letter k says (L or R) and moves the cell on to the next colour. Langton's ant is RL. LLRR grows a symmetric shape for ever, RLR grows chaos for ever, LRRRRRLLR fills a square. Type your own rule and find a pattern nobody has named. Each step costs the same small amount of work, so the demo can take thousands of steps in one frame.</p>`,
    taught: [{ href: '#/math/7', text: 'SC 104 Lesson 7: Machines with a finite memory' }, { href: '#/math/11', text: 'SC 104 Lesson 11: The universal machine' }] });
  A.register({ id: 'sandpile', group: GROUP, title: 'The sandpile',
    blurb: 'Drop grains of sand one at a time; a cell with four topples onto its neighbours. Most grains do nothing, some start avalanches across the whole pile, and a fractal grows.',
    mount: mountSand,
    about: `<h2>Self-organised criticality</h2>
<p>In 1987 the physicists Per Bak, Chao Tang and Kurt Wiesenfeld published this model in <em>Physical Review Letters</em>. Each cell holds 0 to 3 grains. A cell that reaches 4 topples: it loses 4 grains and each of its four neighbours gets one, which may make them topple too. Drop grains at random and the pile builds up by itself to a <em>critical</em> state, where one more grain may do nothing at all, or set off an avalanche that crosses the whole grid. Nobody tunes it there; it organises itself.</p>
<p>The chart counts the avalanches by size, on doubling bins with a logarithmic scale for how often. Small avalanches are common and big ones rare, but there is no typical size: over many sizes the bars fall away in a nearly straight line, the mark of a <em>power law</em>, until the edge of the grid cuts the biggest avalanches short. (Drop grains anywhere at random to see it best.) Earthquakes, forest fires and solar flares show the same kind of law, which is why the model became famous.</p>
<h2>Order does not matter</h2>
<p>In 1990 Deepak Dhar proved that the final pile, and even the number of times each cell topples, does not depend on the order in which unstable cells topple: the sandpile is <em>abelian</em>. So the demo can topple a cell holding 400 grains 100 times at once, and keep the cells still to topple in a queue, each in it at most once. That is how 2<sup>16</sup> = 65,536 grains dropped on one cell settle in seconds, into the fractal with its fourfold symmetry. The pattern is not fully understood: mathematicians (Lionel Levine, Wesley Pegden and Charles Smart among them) are still proving things about its shape.</p>
<h2>Check the bookkeeping</h2>
<p>No grain is made or destroyed: grains dropped = grains on the grid + grains that fell off. A pile of n grains needs a disc of about n / 2.1 cells, and the number of topplings grows faster than n: try 2<sup>14</sup> and then 2<sup>16</sup>.</p>`,
    taught: [{ href: '#/dsa/7', text: 'SC 107 Lesson 7: Stacks and queues' }] });
  A.register({ id: 'slime-mould', group: GROUP, title: 'Slime mould networks',
    blurb: 'Thousands of agents follow a fading scent and leave more of it. Together they grow living networks, and join up the food you put down, like a real slime mould.',
    mount: mountSlime,
    about: `<h2>A brainless network builder</h2>
<p><em>Physarum polycephalum</em> is a slime mould: one huge yellow cell with many nuclei, which creeps over the forest floor looking for food. It has no brain, yet it builds efficient networks of tubes between pieces of food. In 2000 Toshiyuki Nakagaki and colleagues showed that it can find the shortest way through a maze, and in January 2010 Atsushi Tero, Nakagaki and others reported in <em>Science</em> that, with oat flakes placed where the cities around Tokyo are, it grew a network much like the Tokyo railways, close in cost, speed and resistance to breakdowns.</p>
<h2>The model</h2>
<p>Jeff Jones described this agent model in 2010. Each agent has three sensors ahead of it, left, centre and right. Every step it turns towards the sensor with the strongest smell of trail (straight on if the centre is strongest, a random way if the centre is weakest), steps forward and deposits a little trail. Then the whole trail map diffuses, each cell becoming the average of its 3 × 3 block, and fades a little. A road that many agents use gets stronger and draws more agents: positive feedback. A road nobody uses fades away. The network is what is left.</p>
<ul><li>The <b>sensor angle</b> and <b>sensor distance</b> set the size of the holes in the net; the <b>turn</b> how sharply agents follow a trail; <b>fade</b> how long a road lasts without traffic.</li>
<li>Food sources keep giving off a strong smell, so the network grows towards them and joins them up, often close to a short network joining all the points (a problem related to shortest paths and the minimum spanning tree).</li></ul>
<h2>The cost</h2>
<p>Each step, every agent reads three cells and writes one, and every cell of the map is averaged: about (agents + cells) work a step, in plain arrays of numbers. That is why tens of thousands of agents can run sixty times a second in a web page.</p>`,
    taught: [{ href: '#/math/6', text: 'SC 104 Lesson 6: Graphs and paths' }] });

  // ================================================================== tests (node test_algos.js)
  function selfTest() {
    const fails = [];
    // boids: speeds stay between the limits; two close birds with only separation move apart; alignment brings headings together;
    // the grid finds exactly the neighbours that comparing every pair finds
    {
      const f = makeFlock(300, 600, 400, 11, BOID);
      for (let k = 0; k < 120; k++) flockStep(f, BOID, [{ x: 300, y: 200 }], 1);
      for (let i = 0; i < f.n; i++) { const s = Math.hypot(f.vx[i], f.vy[i]); if (!(s <= BOID.maxSpeed + 1e-4 && s >= BOID.minSpeed - 1e-4)) { fails.push('boids: a speed of ' + s + ' is outside the limits'); break; } if (!(f.x[i] >= 0 && f.x[i] < f.w && f.y[i] >= 0 && f.y[i] < f.h)) { fails.push('boids: a bird left the world'); break; } }
      if (order(f) < 0.3) fails.push('boids: 120 steps of all three rules left the flock unordered (' + order(f).toFixed(2) + ')');
      const g = buildGrid(f, 40);
      for (let i = 0; i < 40; i++) {
        let a = 0, b = 0; eachNeighbour(f, g, i, 40, () => { a++; });
        for (let j = 0; j < f.n; j++) if (j !== i) { let dx = Math.abs(f.x[j] - f.x[i]), dy = Math.abs(f.y[j] - f.y[i]); dx = Math.min(dx, f.w - dx); dy = Math.min(dy, f.h - dy); if (dx * dx + dy * dy < 1600) b++; }
        if (a !== b) { fails.push('boids: the grid found ' + a + ' neighbours, comparing every pair found ' + b); break; }
      }
      const two = makeFlock(2, 400, 400, 1, BOID); two.x.set([200, 204]); two.y.set([200, 200]); two.vx.set([0, 0]); two.vy.set([2, 2]);
      const onlySep = Object.assign({}, BOID, { ali: 0, coh: 0, sep: 1.5 });
      for (let k = 0; k < 20; k++) flockStep(two, onlySep, [], 1);
      if (!(Math.abs(two.x[1] - two.x[0]) > 8)) fails.push('boids: separation did not push two close birds apart (gap ' + (two.x[1] - two.x[0]).toFixed(2) + ')');
      const al = makeFlock(2, 400, 400, 1, BOID); al.x.set([200, 210]); al.y.set([200, 200]); al.vx.set([2, 0]); al.vy.set([0, 2]);
      const onlyAli = Object.assign({}, BOID, { ali: 1, coh: 0, sep: 0 }), ang = (f2) => Math.abs(Math.atan2(f2.vx[0] * f2.vy[1] - f2.vy[0] * f2.vx[1], f2.vx[0] * f2.vx[1] + f2.vy[0] * f2.vy[1]));
      const a0 = ang(al); for (let k = 0; k < 20; k++) flockStep(al, onlyAli, [], 1);
      if (!(ang(al) < a0 * 0.25)) fails.push('boids: alignment did not bring two headings together');
      const fl = makeFlock(1, 400, 400, 1, BOID); fl.x[0] = 200; fl.y[0] = 200; fl.vx[0] = 0; fl.vy[0] = 2;
      for (let k = 0; k < 10; k++) flockStep(fl, BOID, [{ x: 180, y: 200 }], 1);
      if (!(fl.vx[0] > 0.5)) fails.push('boids: a bird did not flee a hawk on its left');
    }
    // Langton's ant: after 11,000 steps it is on the highway: every 104 steps it moves by the same 2 cells diagonally
    {
      const a = makeAnt('RL', 300, 300); antSteps(a, 11000);
      const p0 = [a.ux, a.uy]; antSteps(a, 104); const p1 = [a.ux, a.uy]; antSteps(a, 104); const p2 = [a.ux, a.uy];
      const d1 = [p1[0] - p0[0], p1[1] - p0[1]], d2 = [p2[0] - p1[0], p2[1] - p1[1]];
      if (d1[0] !== d2[0] || d1[1] !== d2[1] || Math.abs(d1[0]) !== 2 || Math.abs(d1[1]) !== 2) fails.push('ant: no period-104 highway after 11,000 steps: ' + d1 + ' then ' + d2);
      const hw = highway(a, 104);
      if (!hw || hw.from < 9500 || hw.from > 10500) fails.push('ant: the highway was spotted from step ' + (hw && hw.from) + ', not about 10,000');
      const b = makeAnt('RL', 300, 300); antSteps(b, 9000); if (highway(b, 104)) fails.push('ant: a highway was seen during the chaos');
      // the first steps by hand: R on white at the start, so it faces right and the start cell is black
      const c = makeAnt('RL', 9, 9); antSteps(c, 1); if (c.dir !== 1 || c.grid[4 * 9 + 4] !== 1 || c.x !== 5 || c.y !== 4) fails.push('ant: the first step is wrong');
      // a rule of k colours keeps every cell below k, and LLRR's picture stays symmetric (it is known to grow symmetrically)
      const m = makeAnt('LRRRRRLLR', 120, 120); antSteps(m, 20000); if (m.grid.some((v) => v >= 9)) fails.push('ant: a colour out of range');
      if (!validRule('RL') || validRule('R') || validRule('RLX') || validRule('RLRLRLRLRLRLR')) fails.push('ant: validRule is wrong');
    }
    // sandpile: 4 grains make a cross; every grain is accounted for; one at a time or all at once gives the same pile and the same
    // number of topplings (Dhar); the pile of 2^12 grains on the centre is stable and has the square's eight symmetries
    {
      const N = 5, p = makePile(N), mid = 2 * N + 2; addGrains(p, mid, 4); relax(p);
      const cross = Array.from(p.h).join('');
      if (cross !== '0000000100010100010000000') fails.push('sandpile: 4 grains did not make a cross: ' + cross);
      const q = makePile(7), r = A.rng(5); let sizes = 0;
      for (let k = 0; k < 600; k++) sizes += dropOne(q, r.int(49));
      if (q.dropped !== onGrid(q) + q.lost) fails.push('sandpile: grains not conserved: ' + q.dropped + ' dropped, ' + onGrid(q) + ' on the grid, ' + q.lost + ' fell off');
      if (q.h.some((v) => v > 3 || v < 0)) fails.push('sandpile: a cell left unstable');
      if (sizes !== q.topples) fails.push('sandpile: avalanche sizes do not add up to the topplings');
      const n = 4096, M = pileSizeFor(n), one = makePile(M), all = makePile(M), c = (M >> 1) * M + (M >> 1);
      for (let k = 0; k < n; k++) dropOne(one, c);
      addGrains(all, c, n); relax(all);
      if (one.h.some((v, i) => v !== all.h[i]) || one.topples !== all.topples) fails.push('sandpile: one at a time and all at once disagree (topplings ' + one.topples + ' and ' + all.topples + ')');
      if (all.lost) fails.push('sandpile: the grid for ' + n + ' grains was too small (' + all.lost + ' fell off)');
      const at = (rr, cc) => all.h[rr * M + cc];
      let sym = true; for (let rr = 0; rr < M && sym; rr++) for (let cc = 0; cc < M; cc++) if (at(rr, cc) !== at(cc, rr) || at(rr, cc) !== at(M - 1 - rr, cc) || at(rr, cc) !== at(rr, M - 1 - cc)) { sym = false; break; }
      if (!sym) fails.push('sandpile: the centre pile is not symmetric');
      const b = makePile(3); addGrains(b, 4, 1000); let steps = 0; while (!relax(b, 7)) steps++;   // relaxing in small slices ends the same
      if (b.dropped !== onGrid(b) + b.lost || b.h.some((v) => v > 3)) fails.push('sandpile: relaxing in slices went wrong');
      if (sizeBin(0) !== 0 || sizeBin(1) !== 1 || sizeBin(3) !== 2 || sizeBin(4) !== 3) fails.push('sandpile: sizeBin is wrong');
    }
    // slime: the agents are all still there and on the map, the trail stays finite and not negative, and food keeps a trail
    {
      for (const key of Object.keys(SLIME_PRESETS)) {
        const P = Object.assign({ ss: 1, dep: 5, food: 10 }, SLIME_PRESETS[key]), s = makeSlime(3000, 120, 80, 3, key === 'cells' ? 'random' : 'spore');
        for (let k = 0; k < 150; k++) slimeStep(s, P, [[10, 10], [100, 60]]);
        if (s.x.length !== 3000 || s.y.length !== 3000) fails.push('slime: agents lost');
        let bad = false; for (let i = 0; i < s.n; i++) if (!(s.x[i] >= 0 && s.x[i] < 120 && s.y[i] >= 0 && s.y[i] < 80 && Number.isFinite(s.a[i]))) bad = true;
        if (bad) fails.push('slime ' + key + ': an agent left the map');
        let mx = 0, fin = true; for (const v of s.trail) { if (!Number.isFinite(v) || v < 0) fin = false; if (v > mx) mx = v; }
        if (!fin || mx > 1e5) fails.push('slime ' + key + ': the trail map is not finite (max ' + mx + ')');
        if (!(s.trail[10 * 120 + 10] > 1)) fails.push('slime ' + key + ': no trail at a food source');
        let on = 0; for (const v of s.occ) on += v; if (on !== s.n) fails.push('slime ' + key + ': ' + on + ' agents on the cells, not ' + s.n);
      }
      // with fading and no agents or food, the trail dies away; diffusion alone keeps the total
      const e = makeSlime(0, 20, 20, 1, 'random'); e.trail[50] = 900;
      slimeStep(e, { sa: 22, ra: 45, so: 9, decay: 0 }, null); let tot = 0; for (const v of e.trail) tot += v;
      if (Math.abs(tot - 900) > 1e-3) fails.push('slime: diffusion did not keep the total (' + tot + ')');
      for (let k = 0; k < 200; k++) slimeStep(e, { sa: 22, ra: 45, so: 9, decay: 0.1 }, null); tot = 0; for (const v of e.trail) tot += v;
      if (!(tot < 1e-3)) fails.push('slime: the trail did not fade');
    }
    return fails;
  }

  if (typeof module !== 'undefined') module.exports = { selfTest, BOID, makeFlock, buildGrid, eachNeighbour, flockStep, order, makeAnt, antSteps, highway, validRule, ANT_RULES, makePile, addGrains, relax, dropOne, onGrid, pileSizeFor, sizeBin, SLIME_PRESETS, makeSlime, slimeStep };
})();
