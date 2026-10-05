/* Algorithms in motion: geometry and fractals. Four demos for the #/algorithms page (see src/algos.js for the frame):
   - hull-race: the convex hull of a set of points, found by gift wrapping (Jarvis), Graham's scan and Quickhull side by side, one
     orientation test each per tick, after the reader bets on the winner; a table keeps the results of several races;
   - mandelbrot: the Mandelbrot set by escape time, rendered coarse to fine in slices of a frame, with click to zoom, drag to pan, famous
     places to fly to, a dive that zooms until double precision gives out, the orbit of the point under the pointer and its Julia set;
   - lsystem: Lindenmayer systems, rewritten generation by generation and drawn by a turtle, with presets, an editable (checked,
     size-capped) grammar and wind for the plants;
   - voronoi: points to drag, their Voronoi cells and Delaunay triangulation (Bowyer-Watson) redrawn live, and Lloyd's relaxation.
   The algorithms are pure (no DOM) and checked by selfTest() in node (test_algos.js). */
(function () {
  const A = (typeof window !== 'undefined' && window.ALGOS) || require('./algos.js');
  const GROUP = 'Geometry and fractals';

  // ================================================================== pure algorithms

  // ---------- convex hull. Points are [x, y] with integer coordinates (the demo's world is 10,000,000 wide), so every orientation
  // test below is exact in doubles (products stay under 2^53) and the three algorithms can be compared point for point.
  /** Twice the signed area of the triangle a b c: > 0 when c is on one side of the line a→b, < 0 on the other, 0 when collinear. */
  const orient = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const d2 = (a, b) => (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]);
  const same = (a, b) => a[0] === b[0] && a[1] === b[1];
  /** The point with the smallest x (then smallest y): on the hull for certain, and where all three algorithms start. */
  function lowest(pts) { let s = 0; for (let i = 1; i < pts.length; i++) if (pts[i][0] < pts[s][0] || (pts[i][0] === pts[s][0] && pts[i][1] < pts[s][1])) s = i; return s; }
  // Each algorithm is a generator that yields once per orientation test (the step the race counts) and returns the hull as point
  // indexes, starting at lowest() and going round with the inside on the positive side of every edge, with no point that lies on an
  // edge. v is a view it updates for the picture (what it has found so far, the three points it is testing); the tests pass {}.

  /** Gift wrapping (Jarvis 1973): from a hull point p, the next one is the point q with every other point on the inside of p→q. Finding
      it looks at all n points, once for each of the h hull points: n·h tests. */
  function* giftWrap(pts, v) {
    v = v || {}; v.hull = []; v.test = null; v.cand = -1;
    const n = pts.length; if (!n) return [];
    const s = lowest(pts), hull = v.hull; let p = s;
    for (let guard = 0; guard <= n; guard++) {
      hull.push(p);
      let q = -1;
      for (let r = 0; r < n; r++) {
        if (same(pts[r], pts[p])) continue;   // p itself, and copies of it
        if (q < 0) { q = r; v.cand = q; continue; }
        const o = orient(pts[p], pts[q], pts[r]); v.test = [p, q, r];
        if (o < 0 || (o === 0 && d2(pts[p], pts[r]) > d2(pts[p], pts[q]))) q = r;   // r is further out, or further along the same line
        v.cand = q;
        yield 1;
      }
      if (q < 0 || same(pts[q], pts[s])) break;
      p = q;
    }
    v.test = null; v.cand = -1;
    return hull.slice();
  }

  /** Graham's scan (1972): sort the points by angle around the lowest one (here a merge sort whose comparisons are orientation tests),
      then walk round them keeping a stack, and pop the top whenever the last three points do not turn the right way. n log n to sort,
      then at most 2n tests, because every point is pushed once and popped at most once. */
  function* graham(pts, v) {
    v = v || {}; v.stack = []; v.test = null; v.phase = 'sort'; v.order = [];
    const n = pts.length; if (!n) return [];
    const s = lowest(pts), P = pts[s];
    let a = []; for (let i = 0; i < n; i++) if (!same(pts[i], P)) a.push(i);
    let b = new Array(a.length); v.order = a; v.pivot = s;
    for (let width = 1; width < a.length; width *= 2) {
      for (let lo = 0; lo < a.length; lo += 2 * width) {
        const mid = Math.min(lo + width, a.length), hi = Math.min(lo + 2 * width, a.length);
        let i = lo, j = mid, k = lo;
        while (i < mid && j < hi) {
          const o = orient(P, pts[a[i]], pts[a[j]]); v.test = [s, a[i], a[j]];
          b[k++] = (o > 0 || (o === 0 && d2(P, pts[a[i]]) <= d2(P, pts[a[j]]))) ? a[i++] : a[j++];   // nearer first on the same ray
          yield 1;
        }
        while (i < mid) b[k++] = a[i++];
        while (j < hi) b[k++] = a[j++];
        for (let t = lo; t < hi; t++) a[t] = b[t];   // merged back in place, so the picture's order is always a whole array
      }
    }
    v.phase = 'scan'; const st = v.stack; st.push(s);
    for (const i of a) {
      while (st.length >= 2) {
        const o = orient(pts[st[st.length - 2]], pts[st[st.length - 1]], pts[i]); v.test = [st[st.length - 2], st[st.length - 1], i];
        yield 1;
        if (o > 0) break;
        st.pop();   // a turn the wrong way (or straight on): the middle point is inside, or on an edge
      }
      st.push(i);
    }
    v.test = null; v.phase = 'done';
    return st.slice();
  }

  /** Quickhull (Eddy 1977, Bykat 1978): the leftmost and rightmost points split the rest into two sides. On each side the point
      furthest from the dividing line is on the hull; the triangle it makes holds points that can be thrown away, and the two new edges
      split what is left. Like quicksort: n log n on average, n² when the splits are lopsided. The distances come free with the tests. */
  function* quickhull(pts, v) {
    v = v || {}; v.poly = []; v.test = null; v.tri = null;
    const n = pts.length; if (!n) return [];
    const a = lowest(pts); let b = a;
    for (let i = 0; i < n; i++) if (pts[i][0] > pts[b][0] || (pts[i][0] === pts[b][0] && pts[i][1] > pts[b][1])) b = i;
    if (same(pts[a], pts[b])) { v.poly.push(a); return [a]; }
    const poly = v.poly; poly.push(a, b);
    const right = [], left = [];
    for (let i = 0; i < n; i++) {
      if (i === a || i === b) continue;
      const o = orient(pts[a], pts[b], pts[i]); v.test = [a, b, i]; yield 1;
      if (o < 0) right.push([i, -o]); else if (o > 0) left.push([i, o]);
    }
    yield* side(a, b, right);
    yield* side(b, a, left);
    v.test = null; v.tri = null;
    return poly.slice();
    // S: the points outside the edge p→q, each with its distance from the line (times |pq|), all positive
    function* side(p, q, S) {
      if (!S.length) return;
      let c = -1, best = 0;
      for (const [i, dist] of S) if (dist > best) { best = dist; c = i; }
      poly.splice(poly.indexOf(p) + 1, 0, c); v.tri = [p, c, q];
      const S1 = [], S2 = [];
      for (const [i] of S) {
        if (i === c) continue;
        const o1 = orient(pts[p], pts[c], pts[i]); v.test = [p, c, i]; yield 1;
        if (o1 < 0) { S1.push([i, -o1]); continue; }
        const o2 = orient(pts[c], pts[q], pts[i]); v.test = [c, q, i]; yield 1;
        if (o2 < 0) S2.push([i, -o2]);   // neither: inside the triangle, gone for good
      }
      yield* side(p, c, S1);
      yield* side(c, q, S2);
    }
  }
  const HULL_W = 10000000, HULL_H = 7000000;
  /** n seeded points of a shape, with integer coordinates in the world box. */
  function hullPoints(n, shape, seed) {
    const r = A.rng(seed), pts = [], cx = HULL_W / 2, cy = HULL_H / 2, R = HULL_H * 0.44;
    const gauss = () => { let u = 0; for (let k = 0; k < 6; k++) u += r(); return (u - 3) * 1.4142; };
    const put = (x, y) => pts.push([Math.round(Math.max(0, Math.min(HULL_W, x))), Math.round(Math.max(0, Math.min(HULL_H, y)))]);
    if (shape === 'circle') { const off = r() * 6.283; for (let k = 0; k < n; k++) { const t = off + 2 * Math.PI * k / n; put(cx + R * Math.cos(t), cy + R * Math.sin(t)); } }
    else if (shape === 'disc') for (let k = 0; k < n; k++) { const t = 2 * Math.PI * r(), q = R * Math.sqrt(r()); put(cx + q * Math.cos(t), cy + q * Math.sin(t)); }
    else if (shape === 'clusters') {
      const centres = []; for (let k = 0; k < 5; k++) centres.push([HULL_W * (0.15 + 0.7 * r()), HULL_H * (0.18 + 0.64 * r())]);
      for (let k = 0; k < n; k++) { const c = centres[k % 5]; put(c[0] + gauss() * HULL_W * 0.045, c[1] + gauss() * HULL_W * 0.045); }
    } else if (shape === 'triangle') {
      const T = [[HULL_W * 0.1, HULL_H * 0.9], [HULL_W * 0.9, HULL_H * 0.85], [HULL_W * 0.45, HULL_H * 0.08]];
      for (const p of T) put(p[0], p[1]);
      for (let k = 3; k < n; k++) { let u = r(), w = r(); if (u + w > 1) { u = 1 - u; w = 1 - w; } const s = 0.04 + 0.92 * r(), m = [(T[0][0] + T[1][0] + T[2][0]) / 3, (T[0][1] + T[1][1] + T[2][1]) / 3];
        const x = T[0][0] + u * (T[1][0] - T[0][0]) + w * (T[2][0] - T[0][0]), y = T[0][1] + u * (T[1][1] - T[0][1]) + w * (T[2][1] - T[0][1]);
        put(m[0] + (x - m[0]) * s, m[1] + (y - m[1]) * s); }   // pulled in a little, so the corners stay the only hull points
    } else for (let k = 0; k < n; k++) put(HULL_W * (0.04 + 0.92 * r()), HULL_H * (0.05 + 0.9 * r()));
    return pts;
  }
  /** Run a hull generator to the end: the hull and the number of orientation tests. */
  function runHull(gen, pts) { const it = gen(pts, {}); let r, tests = 0; while (!(r = it.next()).done) tests++; return { hull: r.value, tests }; }

  // ---------- the Mandelbrot set: c is inside when z → z² + c, from z = 0, never leaves the disc of radius 2
  const BAIL = 1 << 16;   // escaping to |z| = 256 rather than 2 makes the smooth colouring below smooth
  /** The smooth escape time of c = cx + i·cy: about the number of steps before |z| > 2, as a real number so colours blend; -1 when it
      has not escaped after max steps (inside, as far as max steps can tell). */
  function escape(cx, cy, max) {
    // the main cardioid and the disc to its left are inside: skipping them saves most of the work in the wide view
    const xq = cx - 0.25, q = xq * xq + cy * cy;
    if (q * (q + xq) <= 0.25 * cy * cy || (cx + 1) * (cx + 1) + cy * cy <= 0.0625) return -1;
    // Brent's cycle check: remember z now and then (at doubling intervals); an orbit that comes back to exactly the same double is in
    // a cycle and will never escape. Inside points are the costly ones at deep zooms, and most of them fall into a cycle early.
    let x = 0, y = 0, x2 = 0, y2 = 0, n = 0, sx = 0, sy = 0, lap = 0, len = 8;
    while (n < max && x2 + y2 <= BAIL) {
      y = 2 * x * y + cy; x = x2 - y2 + cx; x2 = x * x; y2 = y * y; n++;
      if (x === sx && y === sy) return -1;
      if (++lap === len) { lap = 0; len += len; sx = x; sy = y; }
    }
    if (x2 + y2 <= BAIL) return -1;
    return Math.max(0, n + 1 - Math.log2(0.5 * Math.log2(x2 + y2)));
  }
  /** The same for the Julia set of c: start from z itself. */
  function escapeJulia(zx, zy, cx, cy, max) {
    let x = zx, y = zy, x2 = x * x, y2 = y * y, n = 0;
    while (n < max && x2 + y2 <= BAIL) { y = 2 * x * y + cy; x = x2 - y2 + cx; x2 = x * x; y2 = y * y; n++; }
    if (x2 + y2 <= BAIL) return -1;
    return Math.max(0, n + 1 - Math.log2(0.5 * Math.log2(x2 + y2)));
  }
  /** The orbit z0 = 0, z1 = c, z2, ... until |z| > 2 (that point included) or max steps. */
  function orbit(cx, cy, max) {
    const out = [[0, 0]]; let x = 0, y = 0;
    for (let n = 0; n < max; n++) { const nx = x * x - y * y + cx; y = 2 * x * y + cy; x = nx; out.push([x, y]); if (x * x + y * y > 4) break; }
    return out;
  }

  // ---------- L-systems: rewrite every symbol at once by its rule, then read the string as turtle commands
  const LS_CAP = 300000;   // symbols: past this the string (and the drawing) would take too long, so rewriting stops
  const LS_BODY = /^[A-Za-z+\-[\]|]*$/;
  /** Rules from text, one per line: "F=F+F--F+F" (also "F -> ..." or "F → ..."). Returns { rules } (a null-prototype map) or { error }. */
  function parseRules(text) {
    const rules = Object.create(null), lines = String(text || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    if (lines.length > 12) return { error: 'At most 12 rules.' };
    for (const line of lines) {
      const m = /^([A-Za-z])\s*(?:=|->|→)\s*(\S*)$/.exec(line);
      if (!m) return { error: 'Each rule is one letter, then = and what it becomes, like F=F+F--F+F. This one is not: "' + line.slice(0, 40) + '"' };
      const body = m[2];
      if (body.length > 200) return { error: 'The rule for ' + m[1] + ' is longer than 200 symbols.' };
      if (!LS_BODY.test(body)) return { error: 'The rule for ' + m[1] + ' has a symbol the turtle does not know: use letters, + - [ ] and |.' };
      if (!balanced(body)) return { error: 'The brackets in the rule for ' + m[1] + ' do not match: every [ needs a ] after it.' };
      if (m[1] in rules) return { error: 'There are two rules for ' + m[1] + '.' };
      rules[m[1]] = body;
    }
    return { rules };
  }
  function balanced(s) { let d = 0; for (const ch of s) { if (ch === '[') d++; else if (ch === ']' && --d < 0) return false; } return d === 0; }
  function checkAxiom(ax) {
    if (!ax || ax.length > 200) return 'The start (axiom) must be 1 to 200 symbols.';
    if (!LS_BODY.test(ax)) return 'The start (axiom) has a symbol the turtle does not know: use letters, + - [ ] and |.';
    if (!balanced(ax)) return 'The brackets in the start (axiom) do not match.';
    return '';
  }
  /** The length of the next generation, counted without building it. */
  function nextLength(s, rules) { let n = 0; for (let i = 0; i < s.length; i++) { const r = rules[s[i]]; n += r === undefined ? 1 : r.length; } return n; }
  /** Generations 0..gens of the system, stopping early when the next one would pass cap symbols. Returns { strings, capped, wanted }:
      capped is true when it stopped early, and wanted the length the next generation would have had. */
  function rewrite(axiom, rules, gens, cap) {
    cap = cap || LS_CAP;
    const strings = [axiom]; let s = axiom;
    for (let g = 1; g <= gens; g++) {
      const len = nextLength(s, rules);
      if (len > cap) return { strings, capped: true, wanted: len };
      let out = ''; const parts = [];
      for (let i = 0; i < s.length; i++) { const r = rules[s[i]]; parts.push(r === undefined ? s[i] : r); if (parts.length >= 4096) { out += parts.join(''); parts.length = 0; } }
      s = out + parts.join(''); strings.push(s);
    }
    return { strings, capped: false, wanted: 0 };
  }
  /** The turtle: F and G draw a step forward, f steps without drawing, + turns left, - right, | turns round, [ saves the place and
      ] returns to it. Writes segments (x1, y1, x2, y2, depth) into out (grown when too small) and returns { seg, count, box, depth }.
      bend(depth), when given, is added to the heading before every step: the wind. */
  function turtle(str, angleDeg, headingDeg, bend, out) {
    let need = 0; for (let i = 0; i < str.length; i++) { const ch = str.charCodeAt(i); if (ch === 70 || ch === 71) need++; }
    const seg = out && out.length >= need * 5 ? out : new Float32Array(Math.max(5, need * 5));
    const da = angleDeg * Math.PI / 180, stack = [];
    let x = 0, y = 0, a = headingDeg * Math.PI / 180, d = 0, k = 0, maxD = 0, x0 = 0, x1 = 0, y0 = 0, y1 = 0;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      if (ch === 70 || ch === 71 || ch === 102) {   // F G f
        if (bend) a += bend(d);
        const nx = x + Math.cos(a), ny = y + Math.sin(a);
        if (ch !== 102) { seg[k++] = x; seg[k++] = y; seg[k++] = nx; seg[k++] = ny; seg[k++] = d; }
        x = nx; y = ny;
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      } else if (ch === 43) a += da;
      else if (ch === 45) a -= da;
      else if (ch === 124) a += Math.PI;
      else if (ch === 91) { stack.push(x, y, a); d++; if (d > maxD) maxD = d; }
      else if (ch === 93) { if (stack.length) { a = stack.pop(); y = stack.pop(); x = stack.pop(); d--; } }
    }
    return { seg, count: k / 5, box: [x0, y0, x1, y1], depth: maxD };
  }

  // ---------- Voronoi cells and the Delaunay triangulation of points [x, y] in the box 0..W × 0..H
  /** Cut a convex polygon down to the half nearer to a than to b (the perpendicular bisector of a and b is the cut). */
  function clipHalf(poly, a, b) {
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, nx = b[0] - a[0], ny = b[1] - a[1], out = [];
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i], q = poly[(i + 1) % poly.length];
      const dp = (p[0] - mx) * nx + (p[1] - my) * ny, dq = (q[0] - mx) * nx + (q[1] - my) * ny;
      if (dp <= 0) out.push(p);
      if ((dp < 0 && dq > 0) || (dp > 0 && dq < 0)) { const t = dp / (dp - dq); out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]); }
    }
    return out;
  }
  /** The Voronoi cell of every point: the part of the box nearer to it than to any other point, as a convex polygon. The box, cut by
      the bisector with every other point, nearest first; once the next point is more than twice as far as the cell's furthest corner,
      no later bisector can cut it, so the loop stops (about n·√n cuts instead of n²). A repeated point gets an empty cell. */
  function voronoi(pts, W, H) {
    const n = pts.length, cells = [];
    for (let i = 0; i < n; i++) {
      const p = pts[i];
      if (pts.slice(0, i).some((q) => q[0] === p[0] && q[1] === p[1])) { cells.push([]); continue; }
      const others = []; for (let j = 0; j < n; j++) if (j !== i && !(pts[j][0] === p[0] && pts[j][1] === p[1])) others.push([d2(p, pts[j]), j]);
      others.sort((x, y) => x[0] - y[0]);
      let cell = [[0, 0], [W, 0], [W, H], [0, H]];
      for (const [dd, j] of others) {
        let R = 0; for (const c of cell) R = Math.max(R, d2(p, c));
        if (dd > 4 * R) break;
        cell = clipHalf(cell, p, pts[j]);
        if (!cell.length) break;
      }
      cells.push(cell);
    }
    return cells;
  }
  function polyArea(poly) { let s = 0; for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length]; s += p[0] * q[1] - q[0] * p[1]; } return s / 2; }
  function centroid(poly) {
    let a = 0, x = 0, y = 0;
    for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length], c = p[0] * q[1] - q[0] * p[1]; a += c; x += (p[0] + q[0]) * c; y += (p[1] + q[1]) * c; }
    if (Math.abs(a) < 1e-12) return poly.length ? poly[0].slice() : [0, 0];
    return [x / (3 * a), y / (3 * a)];
  }
  function circum(P, a, b, c) {
    const [ax, ay] = P[a], [bx, by] = P[b], [cx, cy] = P[c];
    const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
    if (Math.abs(d) < 1e-12) return { a, b, c, x: 0, y: 0, r2: Infinity };
    const A2 = ax * ax + ay * ay, B2 = bx * bx + by * by, C2 = cx * cx + cy * cy;
    const x = (A2 * (by - cy) + B2 * (cy - ay) + C2 * (ay - by)) / d, y = (A2 * (cx - bx) + B2 * (ax - cx) + C2 * (bx - ax)) / d;
    return { a, b, c, x, y, r2: (ax - x) * (ax - x) + (ay - y) * (ay - y) };
  }
  /** Bowyer-Watson (1981): start with one huge triangle round everything; add the points one at a time; the triangles whose circumcircle
      holds the new point are no longer Delaunay, so remove them and join the new point to every edge of the hole they leave. Finally
      drop the triangles that use a corner of the huge one. O(n²) as written here (each point checks every triangle). Returns [i, j, k]. */
  function delaunay(pts) {
    const n = pts.length; if (n < 3) return [];
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of pts) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
    const dm = Math.max(x1 - x0, y1 - y0, 1e-9), mx = (x0 + x1) / 2, my = (y0 + y1) / 2, F = 2000;
    const P = pts.map((p) => [p[0], p[1]]);
    P.push([mx - F * dm, my - F * dm], [mx + F * dm, my - F * dm], [mx, my + F * dm]);
    let tris = [circum(P, n, n + 1, n + 2)];
    const seen = new Set();
    for (let i = 0; i < n; i++) {
      const key = P[i][0] + ',' + P[i][1]; if (seen.has(key)) continue; seen.add(key);
      const [px, py] = P[i], keep = [], edges = new Map();
      for (const t of tris) {
        const dx = px - t.x, dy = py - t.y;
        if (dx * dx + dy * dy < t.r2 * (1 - 1e-12)) {
          for (const [u, w] of [[t.a, t.b], [t.b, t.c], [t.c, t.a]]) { const k = u < w ? u + ':' + w : w + ':' + u; const e = edges.get(k); if (e) e.n++; else edges.set(k, { u, w, n: 1 }); }
        } else keep.push(t);
      }
      for (const e of edges.values()) if (e.n === 1) keep.push(circum(P, e.u, e.w, i));
      tris = keep;
    }
    return tris.filter((t) => t.a < n && t.b < n && t.c < n).map((t) => [t.a, t.b, t.c]);
  }

  // ================================================================== the pages

  const CSS = `
.geo-note { font-family: var(--sans); font-size: 0.92rem; color: var(--ink-2); margin: 0.3rem 0 0.5rem; }
.geo-stats { display: flex; flex-wrap: wrap; gap: 0.3rem 1.3rem; font-family: var(--sans); font-size: 0.92rem; color: var(--ink-2); margin: 0.45rem 0; font-variant-numeric: tabular-nums; min-height: 1.4em; }
.geo-stats b { color: var(--ink); font-weight: 600; }
.geo-warn { color: var(--warn); font-weight: 600; }
.geo-win { color: var(--ok); font-weight: 600; }
.geo-err { color: var(--err); font-family: var(--sans); font-size: 0.92rem; min-height: 1.3em; margin: 0.2rem 0; }
.geo-canvas canvas { touch-action: none; cursor: crosshair; }
.geo-wrap { overflow-x: auto; max-width: 100%; }
.geo-table { border-collapse: collapse; font-family: var(--sans); font-size: 0.88rem; font-variant-numeric: tabular-nums; margin: 0.4rem 0; min-width: 100%; }
.geo-table th, .geo-table td { text-align: right; padding: 0.22rem 0.55rem; border-bottom: 1px solid var(--rule); white-space: nowrap; }
.geo-table th:first-child, .geo-table td:first-child { text-align: left; }
.geo-table th { color: var(--ink-2); font-weight: 600; }
.geo-table td.geo-win { color: var(--ok); }
.geo-table caption { text-align: left; font-family: var(--sans); color: var(--ink-2); font-size: 0.88rem; padding-bottom: 0.2rem; }
.geo-gens { list-style: none; margin: 0.4rem 0; padding: 0; font-family: var(--mono); font-size: 0.78rem; color: var(--ink-2); }
.geo-gens li { padding: 0.18rem 0; border-bottom: 1px solid var(--rule); overflow-wrap: anywhere; word-break: break-all; }
.geo-gens li b { font-family: var(--sans); color: var(--ink); font-weight: 600; margin-right: 0.5rem; word-break: normal; }
.geo-gens li.geo-cur { color: var(--ink); }
.geo-edit { display: grid; grid-template-columns: minmax(0, 12rem) minmax(0, 1fr); gap: 0.5rem 0.8rem; align-items: start; font-family: var(--sans); font-size: 0.9rem; margin: 0.5rem 0; }
.geo-edit label { display: flex; flex-direction: column; gap: 0.2rem; color: var(--ink-2); min-width: 0; }
.geo-edit input, .geo-edit textarea { font-family: var(--mono); font-size: 0.85rem; color: var(--ink); background: var(--paper); border: 1px solid var(--rule); border-radius: 3px; padding: 0.3rem 0.4rem; width: 100%; box-sizing: border-box; }
.geo-edit textarea { min-height: 3.6rem; resize: vertical; }
@media (max-width: 560px) { .geo-edit { grid-template-columns: minmax(0, 1fr); } .geo-table th, .geo-table td { padding: 0.2rem 0.3rem; font-size: 0.82rem; } }
.geo-range { display: inline-flex; align-items: center; gap: 0.4rem; color: var(--ink-2); }
.geo-range input { width: 7.5rem; accent-color: var(--accent); }
.geo-range output { min-width: 2.6em; font-variant-numeric: tabular-nums; color: var(--ink); }
`;
  function injectCss() {
    if (document.getElementById('algo-geometry-css')) return;
    const s = document.createElement('style'); s.id = 'algo-geometry-css'; s.textContent = CSS; document.head.appendChild(s);
  }
  const fmt = (x) => Math.round(x).toLocaleString('en-US');
  /** Call fn at most once per animation frame, however many steps asked for it. */
  function onceAFrame(fn) { let raf = 0; const go = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; fn(); }); }; go.cancel = () => { if (raf) cancelAnimationFrame(raf); raf = 0; }; return go; }
  function select(el, label, options, value, onchange) {
    const s = el('select', { onchange: () => onchange(s.value) }, options.map(([v, t]) => el('option', { value: String(v) }, t)));
    s.value = String(value);
    return { label: el('label', {}, label + ' ', s), sel: s };
  }
  /** A labelled slider with its value shown beside it. */
  function slider(el, label, min, max, step, value, show, oninput) {
    const out = el('output', {}, show(value));
    const r = el('input', { type: 'range', min, max, step, value, 'aria-label': label, oninput: () => { out.textContent = show(+r.value); oninput(+r.value); } });
    return { label: el('label', { class: 'geo-range' }, label + ' ', r, out), input: r, set: (v) => { r.value = v; out.textContent = show(+r.value); } };
  }
  /** A CSS colour as [r, g, b] (the canvas parses it). */
  let probe = null;
  function rgb(css) {
    if (!probe) { const c = document.createElement('canvas'); c.width = c.height = 1; probe = c.getContext('2d', { willReadFrequently: true }); }
    probe.clearRect(0, 0, 1, 1); probe.fillStyle = '#000'; probe.fillStyle = css || '#000'; probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2]];
  }
  const isDark = (c) => { const [r, g, b] = rgb(c.paper); return 0.299 * r + 0.587 * g + 0.114 * b < 110; };
  const mix = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
  const css = (v, a) => 'rgba(' + Math.round(v[0]) + ',' + Math.round(v[1]) + ',' + Math.round(v[2]) + ',' + (a == null ? 1 : a) + ')';
  const pointerPos = (cv, e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };

  // ---------------------------------------------------------------- demo: the convex hull race
  const HULL_ALGS = [
    { id: 'jarvis', name: 'Gift wrapping', sub: 'Jarvis, 1973 · n·h', gen: giftWrap },
    { id: 'graham', name: 'Graham scan', sub: 'Graham, 1972 · n log n', gen: graham },
    { id: 'quick', name: 'Quickhull', sub: '1977-78 · n log n on average', gen: quickhull }];
  const HULL_SHAPES = [['square', 'Random in a rectangle'], ['disc', 'Random in a disc'], ['circle', 'On a circle (all on the hull)'], ['clusters', 'Five clusters'], ['triangle', 'In a triangle (3 on the hull)']];
  const PLACES = ['1st', '2nd', '3rd'];
  function mountHull(host, api) {
    injectCss();
    const el = api.el;
    let n = 100, shape = 'square', seed = 1 + Math.floor(Math.random() * 99999), pts = hullPoints(n, shape, seed), custom = false;
    let lanes = [], bet = '', history = [], raceNo = 0;
    const fN = select(el, 'Points', [10, 30, 100, 300, 1000, 3000].map((k) => [k, String(k)]), n, (v) => { n = +v; fresh(); });
    const fShape = select(el, 'Shape', HULL_SHAPES, shape, (v) => { shape = v; fresh(); });
    const betSel = el('select', { 'aria-label': 'Your bet', onchange: () => { bet = betSel.value; } }, el('option', { value: '' }, 'no bet'), HULL_ALGS.map((a) => el('option', { value: a.id }, a.name)));
    host.append(el('div', { class: 'algo-controls' }, fN.label, fShape.label,
      el('button', { class: 'btn', type: 'button', onclick: () => { seed = 1 + Math.floor(Math.random() * 999999); fresh(); } }, 'New points'),
      el('button', { class: 'btn quiet', type: 'button', onclick: () => { pts = []; custom = true; pl.reset(); } }, 'Clear'),
      el('label', {}, 'Who will win? ', betSel)));
    host.append(el('p', { class: 'geo-note' }, 'Stretch a rubber band round all the nails on a board and let go: the shape it makes is the convex hull. Three algorithms find it, one test each per tick. A test asks of three points: does the path turn left or right? Click or tap a picture to add your own points before the race.'));
    const wide = () => cv.size().w >= 720;
    const panels = (w, h) => (wide() ? HULL_ALGS.map((_, k) => ({ x: k * w / 3, y: 0, w: w / 3, h })) : HULL_ALGS.map((_, k) => ({ x: 0, y: k * h / 3, w, h: h / 3 })));
    const geom = (P) => { const top = 38, pad = 10, s = Math.min((P.w - 2 * pad) / HULL_W, (P.h - top - pad) / HULL_H); return { s, ox: P.x + (P.w - s * HULL_W) / 2, oy: P.y + top + (P.h - top - pad - s * HULL_H) / 2 }; };
    const cv = api.canvas(host, { label: 'Three convex hull algorithms on the same points', maxWidth: 1100, height: (w) => (w >= 720 ? Math.round(w / 3 * 0.86) : Math.round(w * 0.58 + 40) * 3), draw });
    cv.canvas.parentNode.classList.add('geo-canvas');
    const stats = el('p', { class: 'geo-stats', role: 'status' });
    const later = onceAFrame(() => { cv.redraw(); table(); });
    const pl = api.player(host, {
      speeds: [3, 300000], speed: 42,
      start: () => { build(); return race(); },
      onStep: () => later(),
      onDone: () => finish(),
      onReset: () => { build(); later(); pl.status('Who will win? Make your bet, then press Play.'); }
    });
    const finishBtn = el('button', { class: 'btn quiet', type: 'button', onclick: () => { if (lanes.length && lanes.every((l) => l.done)) return; pl.pause(); let k = 0; while (pl.step() && ++k < 5e7); } }, 'Finish');   // every remaining step now (a few million at most)
    pl.controls.insertBefore(finishBtn, pl.controls.children[3]);
    const tableBox = el('div', { class: 'geo-wrap' }), histBox = el('div', { class: 'geo-wrap' });
    host.append(stats, tableBox, histBox);
    function build() { lanes = HULL_ALGS.map((alg) => { const v = {}; return { alg, v, it: alg.gen(pts, v), tests: 0, done: false, place: 0, hull: null }; }); }
    function* race() {
      let tick = 0, finished = 0, lastAt = -1, lastPlace = 0;
      while (lanes.some((l) => !l.done)) {
        tick++;
        for (const ln of lanes) {
          if (ln.done) continue;
          const r = ln.it.next();
          if (r.done) { ln.done = true; ln.hull = r.value; finished++; ln.place = tick === lastAt ? lastPlace : finished; lastAt = tick; lastPlace = ln.place; }
          else ln.tests++;
        }
        yield tick;
      }
    }
    function finish() {
      const order = lanes.slice().sort((a, b) => a.place - b.place), mine = lanes.find((l) => l.alg.id === bet), h = lanes[0].hull ? lanes[0].hull.length : 0;
      pl.status((mine ? (mine.place === 1 ? 'Your bet won! ' : 'Your bet came ' + PLACES[mine.place - 1] + '. ') : '') + 'Finished: ' + order.map((l) => PLACES[l.place - 1] + ' ' + l.alg.name + ' (' + fmt(l.tests) + ' tests)').join(', ') + '.');
      raceNo++;
      history.unshift({ no: raceNo, n: pts.length, shape: custom ? 'your own' : HULL_SHAPES.find((s) => s[0] === shape)[1].replace(/ \(.*/, ''), h, tests: lanes.map((l) => l.tests), places: lanes.map((l) => l.place), bet: mine ? mine.place === 1 : null });
      if (history.length > 10) history.length = 10;
      later(); hist();
    }
    function fresh() { pts = hullPoints(n, shape, seed); custom = false; pl.reset(); }
    function table() {
      const h = lanes.find((l) => l.done);
      stats.replaceChildren(el('span', {}, 'Points ', el('b', {}, fmt(pts.length))), el('span', {}, 'On the hull ', el('b', {}, h ? String(h.hull.length) : '?')),
        el('span', {}, 'For scale: n·h = ', el('b', {}, h ? fmt(pts.length * h.hull.length) : '?'), ', n log₂ n ≈ ', el('b', {}, fmt(pts.length > 1 ? pts.length * Math.log2(pts.length) : 0))));
      tableBox.replaceChildren(el('table', { class: 'geo-table' },
        el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, 'Algorithm'), el('th', { scope: 'col' }, 'Orientation tests'), el('th', { scope: 'col' }, 'Hull points'), el('th', { scope: 'col' }, 'Place'))),
        el('tbody', {}, lanes.map((l) => el('tr', {}, el('td', { class: l.place === 1 ? 'geo-win' : null }, l.alg.name), el('td', {}, fmt(l.tests)), el('td', {}, l.hull ? String(l.hull.length) : '…'), el('td', { class: l.place === 1 ? 'geo-win' : null }, l.done ? PLACES[l.place - 1] : '…'))))));
    }
    function hist() {
      if (!history.length) { histBox.replaceChildren(); return; }
      histBox.replaceChildren(el('table', { class: 'geo-table' }, el('caption', {}, 'Races so far (newest first)'),
        el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, 'Race'), el('th', { scope: 'col' }, 'Points'), el('th', { scope: 'col' }, 'Shape'), el('th', { scope: 'col' }, 'Hull'), HULL_ALGS.map((a) => el('th', { scope: 'col' }, a.name)), el('th', { scope: 'col' }, 'Your bet'))),
        el('tbody', {}, history.map((r) => el('tr', {}, el('td', {}, String(r.no)), el('td', {}, fmt(r.n)), el('td', {}, r.shape), el('td', {}, String(r.h)),
          r.tests.map((t, k) => el('td', { class: r.places[k] === 1 ? 'geo-win' : null }, fmt(t))), el('td', {}, r.bet == null ? '–' : r.bet ? 'won' : 'lost'))))));
    }
    cv.canvas.addEventListener('pointerdown', (e) => {
      if (pl.isRunning() || pts.length >= 5000) return;
      const [x, y] = pointerPos(cv.canvas, e), { w, h } = cv.size();
      for (const P of panels(w, h)) {
        if (x < P.x || x > P.x + P.w || y < P.y || y > P.y + P.h) continue;
        const g = geom(P), wx = Math.round((x - g.ox) / g.s), wy = Math.round((y - g.oy) / g.s);
        if (wx < 0 || wy < 0 || wx > HULL_W || wy > HULL_H) return;
        if (!custom) custom = true;
        pts = pts.concat([[wx, wy]]); pl.reset(); return;
      }
    });
    function draw(ctx, w, h, c) {
      ctx.fillStyle = c.paper; ctx.fillRect(0, 0, w, h);
      const ink3 = rgb(c.ink3), acc = rgb(c.accent), warn = rgb(c.warn), okc = rgb(c.ok), dark = isDark(c);
      const big = pts.length > 600, rad = big ? 1.3 : pts.length > 150 ? 2 : 3;
      panels(w, h).forEach((P, k) => {
        const ln = lanes[k]; if (!ln) return;
        const g = geom(P), X = (i) => g.ox + pts[i][0] * g.s, Y = (i) => g.oy + pts[i][1] * g.s, v = ln.v;
        if (k) { ctx.fillStyle = c.rule; if (wide()) ctx.fillRect(P.x, 0, 1, h); else ctx.fillRect(0, P.y, w, 1); }
        ctx.textBaseline = 'top'; ctx.textAlign = 'left'; ctx.font = '600 13px ' + (c.sans || 'sans-serif');
        ctx.fillStyle = ln.place === 1 ? c.ok : c.ink; ctx.fillText(ln.alg.name, P.x + 10, P.y + 6);
        ctx.font = '11px ' + (c.sans || 'sans-serif'); ctx.fillStyle = c.ink3; ctx.fillText(ln.alg.sub, P.x + 10, P.y + 22);
        ctx.textAlign = 'right'; ctx.font = '600 12px ' + (c.sans || 'sans-serif'); ctx.fillStyle = ln.done ? c.ok : c.ink2;
        ctx.fillText(fmt(ln.tests) + ' tests' + (ln.done ? ' · ' + PLACES[ln.place - 1] : ''), P.x + P.w - 10, P.y + 6);
        ctx.save(); ctx.beginPath(); ctx.rect(P.x + 1, P.y + 34, P.w - 2, P.h - 35); ctx.clip();
        const poly = (ids, close) => { ctx.beginPath(); ids.forEach((i, j) => (j ? ctx.lineTo(X(i), Y(i)) : ctx.moveTo(X(i), Y(i)))); if (close) ctx.closePath(); };
        const line = (i, j, col, wd, dash) => { ctx.beginPath(); ctx.moveTo(X(i), Y(i)); ctx.lineTo(X(j), Y(j)); ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]); };
        // the hull found so far: filled softly, drawn in the accent; green once done
        let shown = null, closed = false;
        if (ln.done) { shown = ln.hull; closed = true; }
        else if (ln.alg.id === 'jarvis') shown = v.hull;
        else if (ln.alg.id === 'graham') shown = v.phase === 'scan' ? v.stack : null;
        else { shown = v.poly; closed = true; }
        if (ln.alg.id === 'graham' && v.phase === 'sort' && v.order && v.order.length) {
          // the fan: every point coloured by where the sort has put it so far; a finished sort is a smooth rainbow round the pivot
          const m = v.order.length;
          v.order.forEach((i, j) => { ctx.fillStyle = 'hsl(' + Math.round(200 + 260 * j / m) + ',70%,' + (dark ? 62 : 46) + '%)'; ctx.fillRect(X(i) - rad, Y(i) - rad, 2 * rad, 2 * rad); });
          if (m < 400) { ctx.strokeStyle = css(ink3, 0.18); ctx.lineWidth = 1; ctx.beginPath(); for (const i of v.order) { ctx.moveTo(X(v.pivot), Y(v.pivot)); ctx.lineTo(X(i), Y(i)); } ctx.stroke(); }
        } else {
          ctx.fillStyle = css(ink3, 0.9);
          if (big) for (let i = 0; i < pts.length; i++) ctx.fillRect(X(i) - rad, Y(i) - rad, 2 * rad, 2 * rad);
          else { ctx.beginPath(); for (let i = 0; i < pts.length; i++) { ctx.moveTo(X(i) + rad, Y(i)); ctx.arc(X(i), Y(i), rad, 0, 2 * Math.PI); } ctx.fill(); }
        }
        if (shown && shown.length) {
          if (closed && shown.length > 2) { poly(shown, true); ctx.fillStyle = css(ln.done ? okc : acc, dark ? 0.16 : 0.12); ctx.fill(); }
          poly(shown, closed); ctx.strokeStyle = ln.done ? c.ok : c.accent; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
          for (const i of shown) { ctx.beginPath(); ctx.arc(X(i), Y(i), rad + 1.8, 0, 2 * Math.PI); ctx.fillStyle = ln.done ? c.ok : c.accent; ctx.fill(); }
        }
        if (!ln.done) {
          if (v.tri) { ctx.beginPath(); v.tri.forEach((i, j) => (j ? ctx.lineTo(X(i), Y(i)) : ctx.moveTo(X(i), Y(i)))); ctx.closePath(); ctx.fillStyle = css(warn, 0.14); ctx.fill(); }
          if (ln.alg.id === 'jarvis' && v.hull && v.hull.length && v.cand >= 0) line(v.hull[v.hull.length - 1], v.cand, c.warn, 2, [6, 4]);
          if (v.test) {
            const [a, b, t] = v.test;
            line(a, b, c.ink2, 1.2); line(b, t, c.warn, 1.6);
            ctx.beginPath(); ctx.arc(X(t), Y(t), rad + 4, 0, 2 * Math.PI); ctx.strokeStyle = c.warn; ctx.lineWidth = 2; ctx.stroke();
          }
        }
        ctx.restore();
      });
      if (!pts.length) { ctx.fillStyle = c.ink3; ctx.font = '14px ' + (c.sans || 'sans-serif'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Click or tap to add points', w / 2, h / 2); }
    }
    build(); table();
    pl.status('Who will win? Make your bet, then press Play.');   // no autoplay: the bet comes first
    return () => { pl.stop(); cv.stop(); later.cancel(); };
  }

  // ---------------------------------------------------------------- demo: the Mandelbrot set
  const PLACES_M = [
    { id: 'home', name: 'The whole set', cx: -0.6, cy: 0, w: 3.4 },
    { id: 'seahorse', name: 'Seahorse Valley', cx: -0.7453, cy: 0.1127, w: 0.0135 },
    { id: 'elephant', name: 'Elephant Valley', cx: 0.2925, cy: 0.0149, w: 0.022 },
    { id: 'mini', name: 'A mini-brot on the needle', cx: -1.7685, cy: 0, w: 0.042 },
    { id: 'spiral', name: 'Triple spiral', cx: -0.0886, cy: 0.6542, w: 0.012 },
    { id: 'deep', name: 'A spiral without end', cx: -0.7756837680090538, cy: 0.1364673682946901, w: 0.00004 }];
  // The dive heads for a Misiurewicz point in Seahorse Valley (found by Newton's method on z₂₅ = z₂₄): the spiral round it repeats at
  // every scale, so the picture stays full of colour all the way down instead of turning into a black blob, and the steps needed
  // grow slowly (about 60 more for each factor of 10).
  const DIVE = { cx: -0.7756837680090538, cy: 0.1364673682946901 };
  const W_MIN = 3e-14;   // the narrowest view: by now a pixel is far smaller than the gap between neighbouring doubles
  function makeLut(c, palette) {
    const N = 1024, lut = new Uint32Array(N);
    let stops;
    if (palette === 'classic') stops = [[0, [0, 7, 100]], [0.16, [32, 107, 203]], [0.42, [237, 255, 255]], [0.6425, [255, 170, 0]], [0.8575, [0, 2, 0]], [1, [0, 7, 100]]];
    else if (palette === 'fire') stops = [[0, [10, 0, 20]], [0.3, [160, 20, 30]], [0.55, [250, 140, 20]], [0.75, [255, 240, 170]], [1, [10, 0, 20]]];
    else {   // from the page's own colours: the paper fading into the accent and the link colour, warm near the edge of the set
      const paper = rgb(c.paper), acc = rgb(c.accent), link = rgb(c.link), warn = rgb(c.warn), ink = rgb(c.ink), soft = rgb(c.accentSoft);
      stops = [[0, soft], [0.3, mix(soft, acc, 0.5)], [0.46, acc], [0.6, link], [0.74, warn], [0.86, mix(paper, warn, 0.35)], [1, soft]];
    }
    for (let i = 0; i < N; i++) {
      const t = i / N; let k = 0; while (k < stops.length - 2 && stops[k + 1][0] < t) k++;
      const [t0, c0] = stops[k], [t1, c1] = stops[k + 1], u = (t - t0) / Math.max(1e-9, t1 - t0), s = u * u * (3 - 2 * u), v = mix(c0, c1, s);
      lut[i] = ((255 << 24) | (Math.round(v[2]) << 16) | (Math.round(v[1]) << 8) | Math.round(v[0])) >>> 0;
    }
    return lut;
  }
  function mountMandel(host, api) {
    injectCss();
    const el = api.el;
    let view = { cx: -0.6, cy: 0, w: 3.4 }, maxIt = 250, palette = 'theme', lut = null, lutKey = '', insideCol = 0xff000000;
    let showOrbit = true, showJulia = false, probeC = null, diving = false, alive = true, raf = 0, lastT = 0, msPerPx = 0.0005;
    let rw = 0, rh = 0, buf = null, bctx = null, img = null, u32 = null, val = null, job = null, imgDirty = false, overlayDirty = false;
    let jbuf = null, jctx = null, jimg = null, jc = null;
    const fly = select(el, 'Fly to', PLACES_M.map((p) => [p.id, p.name]), 'home', (id) => { const p = PLACES_M.find((x) => x.id === id); stopDive(); view = { cx: p.cx, cy: p.cy, w: p.w }; autoIter(); restart(); });
    const fPal = select(el, 'Colours', [['theme', 'The page\'s colours'], ['classic', 'Classic blue and gold'], ['fire', 'Fire']], palette, (v) => { palette = v; lutKey = ''; overlayDirty = true; restart(); });
    const iters = slider(el, 'Steps', 0, 100, 1, toSlider(maxIt), (v) => String(fromSlider(v)), (v) => { maxIt = fromSlider(v); restart(); });
    function toSlider(m) { return Math.round(Math.log(m / 50) / Math.log(100) * 100); }
    function fromSlider(v) { const m = 50 * Math.pow(100, v / 100); return m < 1000 ? Math.round(m / 10) * 10 : Math.round(m / 100) * 100; }   // 50 to 5,000, on a log scale
    const orbitBox = el('input', { type: 'checkbox', checked: '', onchange: () => { showOrbit = orbitBox.checked; overlayDirty = true; schedule(); } });
    const juliaBox = el('input', { type: 'checkbox', onchange: () => { showJulia = juliaBox.checked; jc = null; overlayDirty = true; schedule(); } });
    const diveBtn = el('button', { class: 'btn primary', type: 'button', onclick: () => (diving ? stopDive() : startDive()) }, 'Dive');
    host.append(el('div', { class: 'algo-controls' }, diveBtn,
      el('button', { class: 'btn', type: 'button', onclick: () => zoomAt(null, 3) }, 'Zoom out'),
      el('button', { class: 'btn quiet', type: 'button', onclick: () => { stopDive(); fly.sel.value = 'home'; view = { cx: -0.6, cy: 0, w: 3.4 }; maxIt = 250; iters.set(toSlider(maxIt)); restart(); } }, 'Reset'),
      fly.label, fPal.label));
    host.append(el('div', { class: 'algo-controls' }, iters.label, el('label', {}, orbitBox, ' Orbit under the pointer'), el('label', {}, juliaBox, ' Its Julia set')));
    host.append(el('p', { class: 'geo-note' }, 'Click or tap to zoom in three times, there; drag to move. The black shape is the set itself; the colours outside say how fast a point escapes. Move the pointer over the picture to see a point\'s orbit: the path of z as z² + c is worked out again and again.'));
    const cv = api.canvas(host, { label: 'The Mandelbrot set', maxWidth: 1100, height: (w) => Math.round(Math.max(280, Math.min(640, w * 0.64))), draw });
    cv.canvas.parentNode.classList.add('geo-canvas'); cv.canvas.tabIndex = 0;
    const stats = el('p', { class: 'geo-stats', role: 'status' }), probeLine = el('p', { class: 'geo-stats' });
    host.append(stats, probeLine);

    // ---- rendering, coarse to fine, a slice of each frame at a time
    const SIZES = [16, 8, 4, 2, 1];
    function restart(start) { job = { sizes: SIZES.filter((s) => s <= (start || 8)), k: 0, y: 0 }; schedule(); }
    function schedule() { if (!raf && alive) raf = requestAnimationFrame(tick); }
    function alloc(w, h) {
      const res = Math.min(1.5, window.devicePixelRatio || 1), W = Math.max(1, Math.round(w * res)), H = Math.max(1, Math.round(h * res));
      if (W === rw && H === rh && buf) return false;
      rw = W; rh = H; buf = document.createElement('canvas'); buf.width = rw; buf.height = rh; bctx = buf.getContext('2d');
      img = bctx.createImageData(rw, rh); u32 = new Uint32Array(img.data.buffer); val = new Float32Array(rw * rh);
      return true;
    }
    // the palette position: a square root for the first few steps (the wide bands far from the set), then straight on at the same
    // slope, about 67 steps a cycle, so a deep view, where every pixel takes hundreds of steps, still gets several colours
    const colour = (nu) => (nu < 0 ? insideCol : lut[Math.floor((nu < 16 ? Math.max(0, 0.12 * (Math.sqrt(nu) - 1)) : 0.36 + 0.015 * (nu - 16)) * 1024) & 1023]);
    function work(budget) {
      const t0 = performance.now(), scale = view.w / rw, x0 = view.cx - view.w / 2, y0 = view.cy + rh * scale / 2;
      let px = 0;
      while (job && performance.now() - t0 < budget) {
        const s = job.sizes[job.k], prev = job.k ? job.sizes[job.k - 1] : 0, y = job.y, ci = y0 - (y + 0.5) * scale;
        for (let x = 0; x < rw; x += s) {
          const i = y * rw + x;
          let nu;
          if (prev && x % prev === 0 && y % prev === 0) nu = val[i];   // worked out in the coarser pass, at this very pixel
          else { nu = escape(x0 + (x + 0.5) * scale, ci, maxIt); val[i] = nu; px++; }
          const col = colour(nu), xe = Math.min(rw, x + s), ye = Math.min(rh, y + s);
          for (let yy = y; yy < ye; yy++) u32.fill(col, yy * rw + x, yy * rw + xe);
        }
        job.y += s;
        if (job.y >= rh) { job.k++; job.y = 0; if (job.k >= job.sizes.length) job = null; }
      }
      const dt = performance.now() - t0;
      if (px > 2000) msPerPx = 0.7 * msPerPx + 0.3 * (dt / px);
      imgDirty = true;
    }
    function tick(t) {
      raf = 0;
      if (!alive) return;
      if (!host.isConnected) { cleanup(); return; }
      if (diving) diveStep(t);
      if (job) work(diving ? 40 : 12);
      if (imgDirty) { bctx.putImageData(img, 0, 0); imgDirty = false; overlayDirty = true; }
      if (overlayDirty) { overlayDirty = false; cv.redraw(); info(); }
      if (job || diving) schedule();
    }
    // ---- the dive: halve the view's width about every 0.9 seconds, heading for DIVE, until doubles run out
    function startDive() {
      diving = true; diveBtn.textContent = 'Stop'; lastT = 0;
      if (view.w < W_MIN * 4) view = { cx: -0.6, cy: 0, w: 3.4 };
      schedule();
    }
    function stopDive() { if (!diving) return; diving = false; diveBtn.textContent = 'Dive'; restart(8); }
    function diveStep(t) {
      const dt = lastT ? Math.min(100, t - lastT) : 16; lastT = t;
      view.w *= Math.pow(0.5, dt / 900);
      const k = Math.min(1, dt / 600); view.cx += (DIVE.cx - view.cx) * k; view.cy += (DIVE.cy - view.cy) * k;
      autoIter();
      if (view.w <= W_MIN) { view.w = W_MIN; stopDive(); return; }
      // the finest pass that fits in a frame, judged by how long pixels have been taking
      let s = 16; for (const z of [2, 4, 8]) if ((rw * rh / (z * z)) * msPerPx < 30) { s = z; break; }
      job = { sizes: [s], k: 0, y: 0 };
    }
    function autoIter() { const want = Math.round(Math.min(5000, 200 + 140 * Math.max(0, Math.log10(3.4 / view.w)))); if (want > maxIt || diving) { maxIt = Math.max(250, want); iters.set(toSlider(maxIt)); } }
    function zoomAt(p, f) {
      stopDive();
      if (p) { const c = toC(p[0], p[1]); view.cx = c[0]; view.cy = c[1]; }
      view.w = Math.min(6, Math.max(W_MIN, view.w * f)); if (f < 1) autoIter();
      restart();
    }
    // ---- complex numbers and the canvas's CSS pixels
    const toC = (x, y) => { const { w, h } = cv.size(), s = view.w / w; return [view.cx + (x - w / 2) * s, view.cy - (y - h / 2) * s]; };
    const toP = (re, im) => { const { w, h } = cv.size(), s = view.w / w; return [w / 2 + (re - view.cx) / s, h / 2 - (im - view.cy) / s]; };
    function draw(ctx, w, h, c) {
      const key = c.paper + c.accent + c.ink + palette;
      if (key !== lutKey) { lutKey = key; lut = makeLut(c, palette); const ink = palette === 'theme' ? rgb(isDark(c) ? '#050505' : c.ink) : [0, 0, 0]; insideCol = ((255 << 24) | (ink[2] << 16) | (ink[1] << 8) | ink[0]) >>> 0; if (rw) restart(); }
      if (alloc(w, h)) restart();
      ctx.imageSmoothingEnabled = true; ctx.drawImage(buf, 0, 0, w, h);
      if (showJulia && probeC) drawJulia(ctx, w, h, c);
      if (showOrbit && probeC) {
        const o = orbit(probeC[0], probeC[1], 120), escaped = o.length < 122 && o[o.length - 1][0] ** 2 + o[o.length - 1][1] ** 2 > 4;
        ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath();
        o.forEach(([re, im], k) => { const [x, y] = toP(re, im); if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); }); ctx.stroke();
        ctx.lineWidth = 0.8; ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.stroke();
        o.forEach(([re, im], k) => { const [x, y] = toP(re, im); ctx.beginPath(); ctx.arc(x, y, k === 1 ? 4.5 : 2.6, 0, 2 * Math.PI); ctx.fillStyle = k === 1 ? '#ffd166' : escaped && k === o.length - 1 ? '#ff6b6b' : '#ffffff'; ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.7)'; ctx.lineWidth = 1; ctx.stroke(); });
      }
      if (job && !diving) { ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(8, h - 24, 92, 16); ctx.fillStyle = '#fff'; ctx.font = '11px ' + (c.sans || 'sans-serif'); ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText('drawing… ' + job.sizes[job.k] + ' px', 13, h - 16); }
    }
    function drawJulia(ctx, w, h) {
      const JW = w < 500 ? 120 : 180, JH = Math.round(JW * 0.75), res = 1;
      if (!jbuf || jbuf.width !== JW * res) { jbuf = document.createElement('canvas'); jbuf.width = JW * res; jbuf.height = JH * res; jctx = jbuf.getContext('2d'); jimg = jctx.createImageData(jbuf.width, jbuf.height); }
      if (!jc || jc[0] !== probeC[0] || jc[1] !== probeC[1] || jc[2] !== lutKey) {
        jc = [probeC[0], probeC[1], lutKey];
        const u = new Uint32Array(jimg.data.buffer), W = jbuf.width, H = jbuf.height, s = 3.4 / W;
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) u[y * W + x] = colour(escapeJulia((x - W / 2) * s, (H / 2 - y) * s, probeC[0], probeC[1], 150));
        jctx.putImageData(jimg, 0, 0);
      }
      const x = w - JW - 8, y = h - JH - 8;
      ctx.drawImage(jbuf, x, y, JW, JH); ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1.5; ctx.strokeRect(x + 0.5, y + 0.5, JW - 1, JH - 1);
      ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(x, y, JW, 15); ctx.fillStyle = '#fff'; ctx.font = '10px sans-serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText('Julia set of this c', x + 5, y + 8);
    }
    const num = (v, d) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(d);
    function info() {
      const zoom = 3.4 / view.w, d = Math.max(4, Math.ceil(Math.log10(zoom)) + 3), px = view.w / (rw || 1), ulp = Math.max(Math.abs(view.cx), Math.abs(view.cy), 1e-3) * 2.2e-16;
      stats.replaceChildren(el('span', {}, 'Centre ', el('b', {}, num(view.cx, Math.min(16, d)) + (view.cy < 0 ? ' − ' : ' + ') + Math.abs(view.cy).toFixed(Math.min(16, d)) + 'i')),
        el('span', {}, 'Zoom ', el('b', {}, '×' + (zoom < 1e4 ? zoom.toPrecision(3) : zoom.toExponential(1).replace('e+', ' × 10^')))),
        el('span', {}, 'Steps ', el('b', {}, fmt(maxIt))),
        px < 8 * ulp ? el('span', { class: 'geo-warn' }, 'Double precision is giving out: neighbouring pixels are now closer together than the numbers a double can tell apart, so the picture breaks into blocks.') : null);
      if (probeC) {
        const e = escape(probeC[0], probeC[1], maxIt), c0 = num(probeC[0], Math.min(16, d)) + (probeC[1] < 0 ? ' − ' : ' + ') + Math.abs(probeC[1]).toFixed(Math.min(16, d)) + 'i';
        const o = orbit(probeC[0], probeC[1], maxIt), n = o.length - 1;
        probeLine.replaceChildren(el('span', {}, 'c = ', el('b', {}, c0)), e < 0 ? el('span', {}, 'stays within 2 of 0 for all ' + fmt(maxIt) + ' steps: inside the set, as far as we can tell') : el('span', {}, '|z| passes 2 after ', el('b', {}, fmt(n)), n === 1 ? ' step: outside' : ' steps: outside'));
      } else probeLine.replaceChildren(el('span', {}, 'Point at the picture to see where z goes.'));
    }
    // ---- pointer: a click zooms, a drag pans, hovering shows the orbit
    let down = null;
    cv.canvas.addEventListener('pointerdown', (e) => { down = { p: pointerPos(cv.canvas, e), v: { ...view }, moved: false }; try { cv.canvas.setPointerCapture(e.pointerId); } catch (x) { /* old browser */ } });
    cv.canvas.addEventListener('pointermove', (e) => {
      const p = pointerPos(cv.canvas, e);
      if (down) {
        const dx = p[0] - down.p[0], dy = p[1] - down.p[1];
        if (!down.moved && Math.hypot(dx, dy) > 6) { down.moved = true; stopDive(); }
        if (down.moved) { const s = view.w / cv.size().w; view.cx = down.v.cx - dx * s; view.cy = down.v.cy + dy * s; restart(16); }
        return;
      }
      if (e.pointerType !== 'touch') { probeC = toC(p[0], p[1]); overlayDirty = true; schedule(); }
    });
    const up = (e) => { if (!down) return; const d = down; down = null; if (!d.moved && e.type === 'pointerup') { const p = pointerPos(cv.canvas, e); zoomAt(p, 1 / 3); probeC = toC(p[0], p[1]); } else if (d.moved) restart(8); };
    cv.canvas.addEventListener('pointerup', up); cv.canvas.addEventListener('pointercancel', up);
    cv.canvas.addEventListener('pointerleave', (e) => { if (!down && e.pointerType !== 'touch') { probeC = null; overlayDirty = true; schedule(); } });
    cv.canvas.addEventListener('keydown', (e) => {
      const s = view.w / 8, k = e.key;
      if (k === '+' || k === '=') zoomAt(null, 1 / 2); else if (k === '-') zoomAt(null, 2);
      else if (k === 'ArrowLeft') { view.cx -= s; restart(); } else if (k === 'ArrowRight') { view.cx += s; restart(); }
      else if (k === 'ArrowUp') { view.cy += s; restart(); } else if (k === 'ArrowDown') { view.cy -= s; restart(); } else return;
      e.preventDefault();
    });
    const onHide = () => { if (document.hidden) stopDive(); };
    document.addEventListener('visibilitychange', onHide);
    function cleanup() { if (!alive) return; alive = false; diving = false; if (raf) cancelAnimationFrame(raf); raf = 0; cv.stop(); document.removeEventListener('visibilitychange', onHide); }
    info();
    return cleanup;
  }

  // ---------------------------------------------------------------- demo: L-systems
  const LSYS = [
    { id: 'plant', name: 'Fractal plant', axiom: 'X', rules: 'X=F+[[X]-X]-F[-FX]+X\nF=FF', angle: 25, gen: 5, max: 7, heading: 70, plant: true },
    { id: 'bush', name: 'Bush', axiom: 'F', rules: 'F=FF+[+F-F-F]-[-F+F+F]', angle: 22.5, gen: 4, max: 5, heading: 90, plant: true },
    { id: 'seaweed', name: 'Seaweed', axiom: 'F', rules: 'F=F[+F]F[-F]F', angle: 25.7, gen: 4, max: 6, heading: 90, plant: true },
    { id: 'koch', name: 'Koch snowflake', axiom: 'F--F--F', rules: 'F=F+F--F+F', angle: 60, gen: 4, max: 7, heading: 0 },
    { id: 'sierpinski', name: 'Sierpiński arrowhead', axiom: 'F', rules: 'F=G-F-G\nG=F+G+F', angle: 60, gen: 6, max: 10, heading: 0 },
    { id: 'dragon', name: 'Dragon curve', axiom: 'FX', rules: 'X=X+YF+\nY=-FX-Y', angle: 90, gen: 11, max: 16, heading: 0 },
    { id: 'hilbert', name: 'Hilbert curve', axiom: 'X', rules: 'X=+YF-XFX-FY+\nY=-XF+YFY+FX-', angle: 90, gen: 5, max: 8, heading: 0 }];
  function mountLsys(host, api) {
    injectCss();
    const el = api.el;
    let P = { ...LSYS[0] }, gens = null, cur = P.gen, angle = P.angle, axiom = P.axiom, rules = parseRules(P.rules).rules;
    let tur = null, box = null, segBuf = null, windSeg = null, shown = Infinity, wind = false, alive = true, raf = 0, t0 = 0;
    const fPreset = select(el, 'Grammar', LSYS.map((p) => [p.id, p.name]).concat([['custom', 'Your own rules']]), P.id, (id) => choose(id));
    const fGen = slider(el, 'Generation', 0, P.max, 1, cur, String, (v) => { cur = v; rebuild(false); });
    const fAng = slider(el, 'Angle', 1, 180, 0.5, angle, (v) => v + '°', (v) => { angle = v; rebuild(false); });
    const windBox = el('input', { type: 'checkbox', onchange: () => { wind = windBox.checked; if (wind) loop(); else redraw(); } });
    host.append(el('div', { class: 'algo-controls' }, fPreset.label, fGen.label, fAng.label, el('label', {}, windBox, ' Wind')));
    const axIn = el('input', { type: 'text', value: axiom, spellcheck: 'false', 'aria-label': 'Start (axiom)' });
    const ruleIn = el('textarea', { spellcheck: 'false', 'aria-label': 'Rules, one per line' }); ruleIn.value = P.rules;
    const err = el('p', { class: 'geo-err', role: 'alert' });
    const applyBtn = el('button', { class: 'btn', type: 'button', onclick: () => applyEdit() }, 'Use these rules');
    host.append(el('div', { class: 'geo-edit' }, el('label', {}, 'Start (axiom)', axIn), el('label', {}, 'Rules, one per line', ruleIn)), el('div', { class: 'algo-controls' }, applyBtn, el('span', { class: 'geo-note' }, 'F and G draw a step, f steps without drawing, + turns left, − turns right, [ remembers where the turtle is and ] goes back there. Other letters only grow.')), err);
    const cv = api.canvas(host, { label: 'A turtle drawing an L-system', maxWidth: 1100, height: (w) => Math.round(Math.max(300, Math.min(620, w * 0.66))), draw });
    const stats = el('p', { class: 'geo-stats', role: 'status' }), list = el('ol', { class: 'geo-gens', 'aria-label': 'The string, generation by generation' });
    host.append(stats);
    const later = onceAFrame(() => redraw());
    const pl = api.player(host, {
      speeds: [20, 3000], speed: 50,
      start: () => (function* () { const n = tur ? tur.count : 0, chunk = Math.max(1, Math.ceil(n / 400)); for (let k = 0; k < n; k += chunk) { shown = k; yield k; } shown = Infinity; })(),
      onStep: () => later(),
      onDone: () => { shown = Infinity; later(); },
      onReset: () => { shown = Infinity; later(); }
    });
    pl.controls.prepend(el('span', { class: 'geo-note' }, 'Play: watch the turtle draw it.'));
    host.append(list);
    function choose(id) {
      pl.reset();
      if (id === 'custom') { P = { id: 'custom', name: 'Your own rules', axiom: axIn.value, rules: ruleIn.value, angle, gen: cur, max: 12, heading: 90, plant: /\[/.test(ruleIn.value) }; fGen.input.max = 12; applyEdit(); return; }
      P = { ...LSYS.find((p) => p.id === id) };
      axiom = P.axiom; rules = parseRules(P.rules).rules; cur = P.gen; angle = P.angle; axIn.value = P.axiom; ruleIn.value = P.rules; err.textContent = '';
      fGen.input.max = P.max; fGen.set(cur); fAng.set(angle); windBox.checked = wind = !!P.plant && !api.reducedMotion();
      rebuild(true);
    }
    function applyEdit() {
      const ax = axIn.value.trim(), pr = parseRules(ruleIn.value), bad = checkAxiom(ax) || pr.error;
      if (bad) { err.textContent = bad; return; }
      err.textContent = ''; axiom = ax; rules = pr.rules;
      if (P.id !== 'custom') { P = { id: 'custom', name: 'Your own rules', axiom: ax, rules: ruleIn.value, angle, gen: cur, max: 12, heading: /\[/.test(ruleIn.value) ? 90 : 0, plant: /\[/.test(ruleIn.value) }; fPreset.sel.value = 'custom'; fGen.input.max = 12; }
      P.plant = /\[/.test(ruleIn.value); P.heading = P.plant ? 90 : 0;
      rebuild(true);
    }
    function rebuild(animate) {
      pl.reset();
      gens = rewrite(axiom, rules, Math.min(cur, +fGen.input.max), LS_CAP);
      const g = Math.min(cur, gens.strings.length - 1);
      tur = turtle(gens.strings[g], angle, P.heading, null, segBuf); segBuf = tur.seg; box = tur.box.slice();
      showList(g);
      if (wind) loop(); else redraw();
      if (animate && !api.reducedMotion()) pl.play();
    }
    function showList(g) {
      const items = gens.strings.map((s, k) => el('li', { class: k === g ? 'geo-cur' : null }, el('b', {}, 'Generation ' + k + ' · ' + fmt(s.length) + (s.length === 1 ? ' symbol' : ' symbols')), s.length > 150 ? s.slice(0, 150) + '…' : s));
      if (gens.capped) items.push(el('li', {}, el('b', { class: 'geo-warn' }, 'Generation ' + gens.strings.length + ' would have ' + fmt(gens.wanted) + ' symbols:'), ' more than the limit of ' + fmt(LS_CAP) + ', so it is not made. Each generation multiplies the length; that is the point, and also the danger.'));
      list.replaceChildren(...items);
      stats.replaceChildren(el('span', {}, 'Generation ', el('b', {}, String(g))), el('span', {}, 'Symbols ', el('b', {}, fmt(gens.strings[g].length))), el('span', {}, 'Lines drawn ', el('b', {}, fmt(tur.count))),
        g > 0 ? el('span', {}, 'Growth per generation ', el('b', {}, '×' + (gens.strings[g].length / Math.max(1, gens.strings[g - 1].length)).toFixed(2))) : null);
    }
    function redraw() { cv.redraw(); }
    function loop() {
      if (raf || !alive) return;
      const go = (t) => {
        raf = 0;
        if (!alive || !wind) { redraw(); return; }
        if (!host.isConnected) { cleanup(); return; }
        if (!t0) t0 = t;
        const s = (t - t0) / 1000, H = Math.max(1, box[3] - box[1]), g = 0.55 * Math.sin(s * 1.3) + 0.25 * Math.sin(s * 3.1 + 1) + 0.35;
        // the wind bends each step a little, more out at the tips (deeper in the brackets): the total bend over the plant's height is
        // a fraction of a radian, whatever the generation
        const per = 0.22 / H;
        windSeg = turtle(gens.strings[Math.min(cur, gens.strings.length - 1)], angle, P.heading, (d) => per * g * (1 + 0.6 * d) + 0.002 * Math.sin(s * 5 + d), windSeg ? windSeg.seg : null);
        redraw();
        if (!document.hidden) raf = requestAnimationFrame(go); else setTimeout(() => { if (alive && wind) loop(); }, 500);
      };
      raf = requestAnimationFrame(go);
    }
    function draw(ctx, w, h, c) {
      ctx.fillStyle = c.paper; ctx.fillRect(0, 0, w, h);
      if (!tur || !tur.count) { ctx.fillStyle = c.ink3; ctx.font = '14px ' + (c.sans || 'sans-serif'); ctx.textAlign = 'center'; ctx.fillText('Nothing to draw: no F or G in this generation.', w / 2, h / 2); return; }
      const T = wind && windSeg && P.plant ? windSeg : tur, bw = Math.max(1e-9, box[2] - box[0]), bh = Math.max(1e-9, box[3] - box[1]);
      const pad = 18, sc = Math.min((w - 2 * pad) / bw, (h - 2 * pad) / bh), ox = (w - bw * sc) / 2 - box[0] * sc, oy = (h + bh * sc) / 2 + box[1] * sc;
      const n = Math.min(T.count, shown === Infinity ? T.count : shown), seg = T.seg, dark = isDark(c);
      const B = 24, paths = Array.from({ length: B }, () => new Path2D());
      const maxD = Math.max(1, T.depth);
      for (let k = 0; k < n; k++) {
        const o = k * 5, b = P.plant ? Math.min(B - 1, Math.floor(seg[o + 4] / maxD * (B - 1))) : Math.min(B - 1, Math.floor(k / Math.max(1, T.count) * B));
        const p = paths[b]; p.moveTo(ox + seg[o] * sc, oy - seg[o + 1] * sc); p.lineTo(ox + seg[o + 2] * sc, oy - seg[o + 3] * sc);
      }
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const lw = Math.max(0.6, Math.min(2.2, sc * 0.5));
      for (let b = 0; b < B; b++) {
        const t = b / (B - 1);
        if (P.plant) { ctx.strokeStyle = 'hsl(' + Math.round(28 + 90 * t) + ',' + Math.round(45 + 15 * t) + '%,' + Math.round(dark ? 42 + 18 * t : 30 + 10 * t) + '%)'; ctx.lineWidth = Math.max(0.6, lw * (2.2 - 1.6 * t)); }
        else { ctx.strokeStyle = 'hsl(' + Math.round(185 + 140 * t) + ',65%,' + (dark ? 62 : 42) + '%)'; ctx.lineWidth = lw; }
        ctx.stroke(paths[b]);
      }
      if (n < T.count) { // the turtle itself, at the end of the last line drawn
        const o = Math.max(0, n - 1) * 5, x = ox + seg[o + 2] * sc, y = oy - seg[o + 3] * sc, a = Math.atan2(-(seg[o + 3] - seg[o + 1]), seg[o + 2] - seg[o]);
        ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(-6, 6); ctx.lineTo(-3, 0); ctx.lineTo(-6, -6); ctx.closePath(); ctx.fillStyle = c.warn; ctx.fill(); ctx.strokeStyle = c.ink; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
      }
    }
    function cleanup() { if (!alive) return; alive = false; if (raf) cancelAnimationFrame(raf); raf = 0; pl.stop(); cv.stop(); later.cancel(); }
    windBox.checked = wind = !!P.plant && !api.reducedMotion();
    rebuild(true);
    return cleanup;
  }

  // ---------------------------------------------------------------- demo: Voronoi and Delaunay
  function mountVoronoi(host, api) {
    injectCss();
    const el = api.el;
    let count = 24, seed = 1 + Math.floor(Math.random() * 99999), pts = randomPts(count, seed), hover = null, drag = -1, unevenStart = null;
    let showCells = true, showTri = true, showCirc = false;
    function randomPts(k, s) { const r = A.rng(s), out = []; for (let i = 0; i < k; i++) out.push([0.03 + 0.94 * r(), 0.03 + 0.94 * r()]); return out; }
    const fN = select(el, 'Points', [5, 12, 24, 48, 96, 160].map((k) => [k, String(k)]), count, (v) => { count = +v; fresh(); });
    const box = (label, on, set) => { const b = el('input', { type: 'checkbox', onchange: () => { set(b.checked); later(); } }); b.checked = on; return el('label', {}, b, ' ' + label); };
    const relaxBtn = el('button', { class: 'btn', type: 'button', onclick: () => (pl.isRunning() ? pl.pause() : pl.play()) }, 'Relax');
    host.append(el('div', { class: 'algo-controls' }, fN.label,
      el('button', { class: 'btn', type: 'button', onclick: () => { seed = 1 + Math.floor(Math.random() * 999999); fresh(); } }, 'New points'),
      el('button', { class: 'btn quiet', type: 'button', onclick: () => { pts = []; pl.reset(); later(); } }, 'Clear'), relaxBtn));
    host.append(el('div', { class: 'algo-controls' }, box('Voronoi cells', showCells, (v) => { showCells = v; }), box('Delaunay triangles', showTri, (v) => { showTri = v; }), box('Empty circles', showCirc, (v) => { showCirc = v; })));
    host.append(el('p', { class: 'geo-note' }, 'Each point is a school, and each coloured cell is the part of town nearer to that school than to any other. Drag a point and watch its neighbours\' borders move; click or tap an empty place to add a school; double-click one to close it. Press Relax and every point moves to the middle of its cell, again and again: the cells even out.'));
    const cv = api.canvas(host, { label: 'Points, their Voronoi cells and their Delaunay triangulation', maxWidth: 1100, height: (w) => Math.round(Math.max(280, Math.min(600, w * 0.6))), draw });
    cv.canvas.parentNode.classList.add('geo-canvas');
    const stats = el('p', { class: 'geo-stats', role: 'status' });
    host.append(stats);
    let geomCache = null;
    const px = () => { const { w, h } = cv.size(); return pts.map((p) => [p[0] * w, p[1] * h]); };
    function compute() { const { w, h } = cv.size(), P = px(); geomCache = { P, cells: voronoi(P, w, h), tris: delaunay(P), w, h }; return geomCache; }
    function uneven(cells) { const a = cells.map(polyArea).filter((x) => x > 0); if (a.length < 2) return 0; const m = a.reduce((s, x) => s + x, 0) / a.length; return Math.sqrt(a.reduce((s, x) => s + (x - m) * (x - m), 0) / a.length) / m; }
    const later = onceAFrame(() => { compute(); cv.redraw(); info(); });
    const pl = api.player(host, {
      speeds: [1, 60], speed: 70,
      start: () => { unevenStart = null; return relax(); },
      onStep: () => later(),
      onDone: () => { relaxBtn.textContent = 'Relax'; later(); pl.status('Settled: every point sits at the centre of its own cell.'); },
      onReset: () => { relaxBtn.textContent = 'Relax'; later(); }
    });
    pl.controls.prepend(el('span', { class: 'geo-note' }, 'Play: Lloyd\'s relaxation.'));
    const syncBtn = () => { relaxBtn.textContent = pl.isRunning() ? 'Pause' : 'Relax'; };
    const obs = new MutationObserver(syncBtn); obs.observe(pl.controls.firstElementChild.nextElementSibling, { childList: true, characterData: true, subtree: true });
    function* relax() {
      for (let step = 0; step < 400; step++) {
        const { w, h } = cv.size(), cells = voronoi(px(), w, h);
        if (unevenStart == null) unevenStart = uneven(cells);
        let moved = 0;
        pts = pts.map((p, i) => {
          if (!cells[i].length || i === drag) return p;
          const [cx, cy] = centroid(cells[i]), nx = p[0] + (cx / w - p[0]) * 0.5, ny = p[1] + (cy / h - p[1]) * 0.5;   // half way each step, so it glides
          moved = Math.max(moved, Math.hypot((nx - p[0]) * w, (ny - p[1]) * h));
          return [nx, ny];
        });
        yield step;
        if (moved < 0.05) return;
      }
    }
    function fresh() { pts = randomPts(count, seed); pl.reset(); later(); }
    function info() {
      const g = geomCache; if (!g) return;
      const u = uneven(g.cells), near = hover ? nearest(hover) : -1;
      stats.replaceChildren(el('span', {}, 'Points ', el('b', {}, String(pts.length))), el('span', {}, 'Triangles ', el('b', {}, String(g.tris.length))),
        el('span', {}, 'Unevenness of the cells ', el('b', {}, Math.round(u * 100) + '%'), unevenStart != null && pts.length > 1 ? ' (it was ' + Math.round(unevenStart * 100) + '%)' : ''),
        near >= 0 ? el('span', {}, 'The pointer is nearest to point ', el('b', {}, String(near + 1))) : null);
    }
    function nearest(p) { let b = -1, bd = Infinity; const P = geomCache ? geomCache.P : px(); P.forEach((q, i) => { const d = d2(p, q); if (d < bd) { bd = d; b = i; } }); return b; }
    function hit(p, touch) { const P = px(), r = touch ? 22 : 13; let b = -1, bd = r * r; P.forEach((q, i) => { const d = d2(p, q); if (d < bd) { bd = d; b = i; } }); return b; }
    cv.canvas.addEventListener('pointerdown', (e) => {
      const p = pointerPos(cv.canvas, e), { w, h } = cv.size(), i = hit(p, e.pointerType === 'touch');
      if (i >= 0) drag = i;
      else if (pts.length < 400) { pts.push([Math.max(0, Math.min(1, p[0] / w)), Math.max(0, Math.min(1, p[1] / h))]); drag = pts.length - 1; }
      try { cv.canvas.setPointerCapture(e.pointerId); } catch (x) { /* old browser */ }
      hover = p; later();
    });
    cv.canvas.addEventListener('pointermove', (e) => {
      const p = pointerPos(cv.canvas, e), { w, h } = cv.size(); hover = p;
      if (drag >= 0 && pts[drag]) pts[drag] = [Math.max(0, Math.min(1, p[0] / w)), Math.max(0, Math.min(1, p[1] / h))];
      later();
    });
    const up = () => { drag = -1; }; cv.canvas.addEventListener('pointerup', up); cv.canvas.addEventListener('pointercancel', up);
    cv.canvas.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch' && drag < 0) { hover = null; later(); } });
    cv.canvas.addEventListener('dblclick', (e) => { const i = hit(pointerPos(cv.canvas, e), false); if (i >= 0) { pts.splice(i, 1); drag = -1; later(); } });
    function draw(ctx, w, h, c) {
      const g = geomCache && geomCache.w === w && geomCache.h === h && geomCache.P.length === pts.length ? geomCache : compute();
      ctx.fillStyle = c.paper; ctx.fillRect(0, 0, w, h);
      const dark = isDark(c), near = hover ? nearest(hover) : -1;
      if (showCells) g.cells.forEach((cell, i) => {
        if (cell.length < 3) return;
        ctx.beginPath(); cell.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
        const hue = Math.round((i * 137.508 + 190) % 360);
        ctx.fillStyle = i === near ? 'hsl(' + hue + ',' + (dark ? '45%,34%' : '75%,76%') + ')' : 'hsl(' + hue + ',' + (dark ? '38%,24%' : '62%,90%') + ')'; ctx.fill();
        ctx.strokeStyle = dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.28)'; ctx.lineWidth = 1.2; ctx.stroke();
      });
      if (showCirc) {
        ctx.strokeStyle = css(rgb(c.warn), 0.35); ctx.lineWidth = 1;
        for (const [a, b, k] of g.tris) { const t = circum(g.P, a, b, k); if (t.r2 < 4 * (w * w + h * h)) { ctx.beginPath(); ctx.arc(t.x, t.y, Math.sqrt(t.r2), 0, 2 * Math.PI); ctx.stroke(); } }
      }
      if (showTri) {
        ctx.beginPath();
        for (const [a, b, k] of g.tris) { const A2 = g.P[a], B2 = g.P[b], C2 = g.P[k]; ctx.moveTo(A2[0], A2[1]); ctx.lineTo(B2[0], B2[1]); ctx.lineTo(C2[0], C2[1]); ctx.closePath(); }
        ctx.strokeStyle = css(rgb(c.ink2), 0.75); ctx.lineWidth = 1.1; ctx.stroke();
      }
      if (hover && near >= 0) { ctx.beginPath(); ctx.moveTo(hover[0], hover[1]); ctx.lineTo(g.P[near][0], g.P[near][1]); ctx.strokeStyle = c.accent; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.stroke(); ctx.setLineDash([]); }
      g.P.forEach((p, i) => { ctx.beginPath(); ctx.arc(p[0], p[1], i === drag ? 7 : 5, 0, 2 * Math.PI); ctx.fillStyle = i === near ? c.accent : c.ink; ctx.fill(); ctx.strokeStyle = c.paper; ctx.lineWidth = 2; ctx.stroke(); });
      if (!pts.length) { ctx.fillStyle = c.ink3; ctx.font = '14px ' + (c.sans || 'sans-serif'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Click or tap to place points', w / 2, h / 2); }
    }
    later();
    return () => { pl.stop(); cv.stop(); later.cancel(); obs.disconnect(); };
  }

  // ================================================================== registration
  A.register({ id: 'hull-race', group: GROUP, title: 'Convex hull race',
    blurb: 'Stretch a rubber band round a cloud of points. Gift wrapping, Graham\'s scan and Quickhull race to find its shape: bet first, then see why the shape of the cloud picks the winner.',
    mount: mountHull,
    about: `<h2>The convex hull</h2>
<p>The convex hull of a set of points is the smallest convex shape that holds them all: the shape a rubber band takes when it is stretched round nails and let go. It is one of the first questions of computational geometry. Robots plan paths round the hulls of obstacles, games test whether two objects collide by their hulls, and statisticians peel hulls off a cloud of data to find its middle.</p>
<p>All three algorithms here are built on one question, asked of three points a, b and c: going from a to b, is c on the left, on the right, or straight ahead? The answer is the sign of a cross product, (b − a) × (c − a), which needs only two multiplications and no angles. That <em>orientation test</em> is what the race counts. (The points have whole-number coordinates, so every test is exact: with fractions, a computer can get the sign wrong for points that are almost in a line, and real geometry libraries take great care over that.)</p>
<h2>Three algorithms</h2>
<ul><li><b>Gift wrapping</b> (R. A. Jarvis, 1973, also called the Jarvis march). Start at the leftmost point. The next hull point is the one with every other point on its left: find it by looking at all n points. Repeat until you come back. That is n tests for each of the h points on the hull: <b>n·h</b>. When the hull has few points it is very fast; when every point is on the hull (try <em>On a circle</em>) it is n², the slowest of the three by far.</li>
<li><b>Graham scan</b> (Ronald Graham, 1972). Sort the points by their angle round the lowest one; this is the coloured fan you see, turning into a smooth rainbow as the merge sort finishes. Then walk round them, keeping the hull so far on a stack: whenever the last three points turn the wrong way, the middle one cannot be on the hull, so pop it. Each point is pushed once and popped at most once, so the walk takes at most about 2n tests; the sort takes n log₂ n. Always <b>n log n</b>, whatever the points. Graham wrote it at Bell Labs, for a program that needed the hulls of thousands of points.</li>
<li><b>Quickhull</b> (William Eddy, 1977, and Alex Bykat, 1978). The leftmost and rightmost points are on the hull and split the rest in two. On each side, the point furthest from the line is on the hull too; everything in the triangle it makes can be thrown away at once, and the rest is split between the two new edges. Like quicksort: about <b>n log n</b> on average, and often much less, because a big triangle throws away most of the points in one go; but n² when the splits are lopsided.</li></ul>
<h2>Things to try</h2>
<ul><li><b>Few hull points.</b> With <em>In a triangle</em> the hull has 3 points, so gift wrapping needs only about 3n tests and wins easily. In a random rectangle of 1000 points the hull has only a few dozen, so it is close.</li>
<li><b>Every point on the hull.</b> <em>On a circle</em> with 1000 points: gift wrapping needs about a million tests, n² of them. Graham's scan does not care what the points look like.</li>
<li><b>Bet first.</b> Guess before each race, and keep score in the table below the pictures.</li></ul>
<p>Could anything beat n log n? Not in general: any algorithm that lists the hull in order could be used to sort numbers (put each number x at the point (x, x²) on a parabola: every point is on the hull, in order), so it cannot be faster than sorting. But that argument needs every point on the hull. In 1986 David Kirkpatrick and Raimund Seidel found an algorithm that takes n log h, which is never worse than either; Timothy Chan found a simpler one in 1996 by running gift wrapping on hulls of small groups found by Graham's scan.</p>`,
    taught: [{ href: '#/dsa/1', text: 'SC 107 Lesson 1: Counting the cost' }, { href: '#/dsa/4', text: 'SC 107 Lesson 4: Divide and conquer' }, { href: '#/math/13', text: 'SC 104 Lesson 13: Counting steps' }] });
  A.register({ id: 'mandelbrot', group: GROUP, title: 'The Mandelbrot set',
    blurb: 'Square a number, add c, repeat: does it fly away? Colour every point by how fast it escapes, then zoom in for ever, or until the computer\'s numbers run out.',
    mount: mountMandel,
    about: `<h2>One rule, repeated</h2>
<p>Pick a point c of the plane, thought of as a complex number. Start with z = 0 and repeat z → z² + c. For some c, z stays close to 0 for ever (for c = 0 it never moves; for c = −1 it jumps between −1 and 0). For others it flies off to infinity (for c = 1: 0, 1, 2, 5, 26, 677…). The <b>Mandelbrot set</b> is the set of points c whose z never escapes. Once |z| is more than 2 it is certain to escape, so a program counts the steps until |z| > 2 and gives up after a fixed number of steps (the slider): points that have not escaped by then are drawn as inside. This is the <em>escape-time</em> algorithm, and the orbit you see under the pointer is exactly that sequence of z's.</p>
<p>The colours come from the number of steps. Counting whole steps gives stripes; the smooth colours use the size of z when it escapes to find a fraction of a step, n + 1 − log₂(log₂ |z|), so the bands melt into each other. Points on the boundary itself are the slowest of all: c = −2 sits right on the edge, its orbit 0, −2, 2, 2, 2… never escapes, but −2.01 does.</p>
<h2>History</h2>
<p>Pierre Fatou and Gaston Julia studied repeating z → z² + c around 1918, by hand. For each c, the starting points that stay bounded make the <em>Julia set</em> of c (tick "Its Julia set" to see it for the point under the pointer): it is all in one piece exactly when c is in the Mandelbrot set, and crumbles into dust when c is outside. Nobody could see these shapes until computers could draw them. Robert Brooks and Peter Matelski printed a first crude picture of the set in 1978; Benoit Mandelbrot, at IBM, published pictures of it in 1980 and made it famous; Adrien Douady and John Hubbard named it after him and proved in 1982 that it is all in one piece.</p>
<h2>What it costs, and where the zoom gives out</h2>
<p>Every pixel is its own calculation, of up to the step limit, so a picture of a million pixels at 1,000 steps can take a billion multiplications. Points inside the set are the most expensive, because they use every step; this program skips the two biggest inside parts (the heart-shaped cardioid and the disc beside it) with a formula. It draws a rough picture first, one pixel in every 8 × 8 block, then fills in, a little in each frame, so the page never freezes.</p>
<p>The zoom has a limit. A JavaScript number is a 64-bit <em>double</em>, which keeps about 16 significant digits. Near c = −0.74, neighbouring doubles are about 10<sup>−16</sup> apart, so once the picture is about 10<sup>−13</sup> wide, a pixel is smaller than the gap between two numbers the computer can tell apart. Press <b>Dive</b> and watch: at a zoom of about 10<sup>13</sup> the fine detail turns into blocks. Programs that go deeper use numbers with more digits, and a clever trick: work out one orbit exactly, and only the small differences from it in ordinary doubles.</p>
<h2>Places to visit</h2>
<ul><li><b>Seahorse Valley</b>, the gap between the cardioid and the big disc on its left: curled tails that become spirals of spirals.</li>
<li><b>Elephant Valley</b>, on the right, near the cardioid's notch: rows of trunks.</li>
<li><b>A mini-brot</b> on the needle to the left: a tiny copy of the whole set. There are infinitely many, all joined to the main one by thin filaments.</li>
<li><b>A spiral without end</b>, where the Dive goes: a <em>Misiurewicz point</em>, a c whose orbit lands after 24 steps on a point that z² + c leaves where it is. Round such a point the picture repeats itself, turning a little, at every scale, so the spiral goes on for ever; only the computer's numbers stop.</li></ul>`,
    taught: [{ href: '#/python/4', text: 'SC 101 Lesson 4: Repetition' }] });
  A.register({ id: 'lsystem', group: GROUP, title: 'L-system plants',
    blurb: 'A few rewriting rules and a turtle grow ferns, bushes, snowflakes and dragons. Watch the string grow generation by generation, change the angle, write your own rules, and let the wind blow.',
    mount: mountLsys,
    about: `<h2>Rewriting, then drawing</h2>
<p>An L-system is a start string (the <em>axiom</em>) and rules that say what each symbol becomes. In every generation, every symbol is replaced at once. With the rule F → F+F−−F+F, the string F becomes F+F−−F+F, then every F of that becomes F+F−−F+F again, and so on: four times as many F's in each generation, so 4<sup>n</sup> after n. Then a <em>turtle</em> reads the string: F means draw a step forward, + and − turn by the angle, and [ and ] save the turtle's place and go back to it, which is how a branch grows out and the turtle returns to the stem. The list under the picture shows the string itself in every generation.</p>
<h2>History</h2>
<p>The biologist Aristid Lindenmayer invented these systems in 1968 to describe how simple organisms, algae and fungi, grow cell by cell: every cell divides by the same rules at the same time. In the 1980s Przemysław Prusinkiewicz, a computer scientist, gave them the turtle and drew plants with them, and in 1990 the two wrote <em>The Algorithmic Beauty of Plants</em>; the fractal plant, bush and seaweed here are from that book. The curves are older than the systems: Helge von Koch described his snowflake in 1904, Wacław Sierpiński his triangle in 1915, David Hilbert his space-filling curve in 1891, and the dragon curve came from three physicists at NASA in the 1960s, John Heighway, Bruce Banks and William Harter, made famous by Martin Gardner in 1967.</p>
<h2>Exponential growth, and the limit</h2>
<p>Each generation multiplies the length of the string, so a few more generations go from a few thousand symbols to millions. That is why the generation slider stops where it does, and why a rule of your own is cut off at ${fmt(LS_CAP)} symbols: the program counts the next generation's length first, without building it, and refuses to make it if it is too long. The Koch snowflake's length grows by 4 each generation while the curve gets no wider: after infinitely many steps it is infinitely long round a finite area.</p>
<h2>Things to try</h2>
<ul><li>Change the angle of the fractal plant a degree at a time: the same rules make a different species.</li>
<li>Write F=F+F-F-F+F with angle 90 (the quadratic Koch curve), or F=FF-[-F+F+F]+[+F-F-F] with angle 22.5.</li>
<li>Give the bush one more generation and watch the string length.</li></ul>`,
    taught: [{ href: '#/scratch/9', text: 'SC 100 Lesson 9: Project: turtle art' }, { href: '#/python/13', text: 'SC 101 Lesson 13: Recursion' }] });
  A.register({ id: 'voronoi', group: GROUP, title: 'Voronoi and Delaunay',
    blurb: 'Drag the schools around a town and watch who is nearest to which. The Voronoi cells and their twin, the Delaunay triangulation, redraw as you move; press Relax and the cells even out.',
    mount: mountVoronoi,
    about: `<h2>Who is nearest?</h2>
<p>Put some points on a map: schools, post offices, mobile phone masts, fire stations. The <b>Voronoi cell</b> of a point is the part of the map nearer to it than to any other point. Between two neighbours the border is the line exactly halfway, at right angles to the line joining them, and the cells fit together with no gaps. Asking "which school is nearest to my house?" is asking which cell the house is in. The same picture appears in nature (the cells of a giraffe's coat, a dragonfly's wing, cracked mud) and in the nearest-neighbour method of machine learning, where each example claims the region nearest to it.</p>
<p>The cells are named after Georgy Voronoy, who wrote about them in 1908; Peter Gustav Lejeune Dirichlet used them in 1850, and they are also called Dirichlet tessellations. In his report on the London cholera outbreak of 1854, John Snow marked the streets that were nearer, by walking, to the Broad Street pump than to any other pump: nearly all the deaths were inside.</p>
<h2>The Delaunay triangulation</h2>
<p>Join two points whenever their cells share a border and you get triangles: the <b>Delaunay triangulation</b>, after Boris Delaunay (1934). Its defining property: the circle through the three corners of any triangle has no other point inside it (tick "Empty circles"). Among all ways to triangulate the points it makes the fewest thin slivers, which is why it is used to build the meshes for engineering simulations, terrain models in maps and games, and the shapes of 3-D scans.</p>
<p>This demo builds it with the <b>Bowyer–Watson</b> algorithm (Adrian Bowyer and David Watson, both 1981, in the same issue of <em>The Computer Journal</em>): start with one huge triangle round everything; add the points one at a time; the triangles whose circles contain the new point are no longer Delaunay, so remove them and join the new point to the edges of the hole they leave. As written here it checks every triangle for each new point, about n² work; with a search structure it is n log n. The cells are found separately, by cutting the whole box down to the part nearer each point than each of its neighbours.</p>
<h2>Lloyd's relaxation</h2>
<p>Press Relax: every point moves to the centre of mass of its own cell, the cells are drawn again, and it repeats. Big cells shrink, small ones grow, and the points spread out as evenly as they can, ending close to a honeycomb of hexagons. Stuart Lloyd at Bell Labs invented this in 1957, to choose the levels for turning sound into numbers; the same loop is k-means clustering, which groups data in machine learning, and it is used to place stippling dots in drawings and to make even meshes.</p>`,
    taught: [{ href: '#/ml/2', text: 'SC 109 Lesson 2: Your nearest neighbours' }] });

  // ================================================================== tests (node test_algos.js)
  function selfTest() {
    const fails = [];
    // ---- convex hull: the three algorithms agree, point for point, on many seeded sets, including collinear points and repeats
    const coords = (pts, h) => h.map((i) => pts[i][0] + ',' + pts[i][1]).join(' ');
    const r = A.rng(4242), sets = [];
    for (const shape of ['square', 'disc', 'circle', 'clusters', 'triangle']) for (const n of [3, 4, 5, 10, 50, 200]) for (let k = 0; k < 3; k++) sets.push(hullPoints(n, shape, 1 + r.int(1e6)));
    for (let k = 0; k < 60; k++) {   // small grids: lots of collinear points and repeated points
      const n = 1 + r.int(40), g = 1 + r.int(5), pts = []; for (let i = 0; i < n; i++) pts.push([r.int(g), r.int(g)]); sets.push(pts);
    }
    sets.push([], [[5, 5]], [[5, 5], [5, 5], [5, 5]], [[0, 0], [1, 1]], [[0, 0], [1, 1], [2, 2], [3, 3]], [[0, 0], [0, 3], [0, 1], [0, 2]], [[0, 0], [4, 0], [4, 4], [0, 4], [2, 0], [4, 2], [2, 4], [0, 2], [2, 2], [2, 2]]);
    sets.push(hullPoints(1000, 'circle', 7));
    for (const pts of sets) {
      const res = HULL_ALGS.map((a) => runHull(a.gen, pts)), want = coords(pts, res[0].hull);
      for (let k = 1; k < 3; k++) if (coords(pts, res[k].hull) !== want) { fails.push('hull: ' + HULL_ALGS[k].name + ' gives ' + coords(pts, res[k].hull).slice(0, 80) + ' but gift wrapping ' + want.slice(0, 80) + ' on ' + JSON.stringify(pts.slice(0, 12))); break; }
      // and the hull is right: strictly convex, every point inside or on it, and its distinct points are the extreme ones
      const H = res[0].hull.map((i) => pts[i]), m = H.length;
      if (pts.length && !m) fails.push('hull: empty for ' + pts.length + ' points');
      for (let i = 0; i < m && m >= 3; i++) if (orient(H[(i + m - 1) % m], H[i], H[(i + 1) % m]) <= 0) { fails.push('hull: not strictly convex at a corner: ' + JSON.stringify(pts.slice(0, 12))); break; }
      outer: for (let i = 0; i < m && m >= 2; i++) for (const p of pts) if (orient(H[i], H[(i + 1) % m], p) < 0) { fails.push('hull: a point lies outside: ' + JSON.stringify(pts.slice(0, 12))); break outer; }
      if (new Set(H.map((p) => p.join())).size !== m) fails.push('hull: a point appears twice in the hull');
    }
    // the costs the page promises: gift wrapping n·h, the others near n log n; on a circle every point is on the hull
    { const pts = hullPoints(1000, 'circle', 3), gw = runHull(giftWrap, pts), gr = runHull(graham, pts);
      if (gw.hull.length !== 1000) fails.push('hull: only ' + gw.hull.length + ' of 1000 points on a circle are on the hull');
      if (gw.tests < 0.9 * 1000 * 1000) fails.push('hull: gift wrapping took ' + gw.tests + ' tests on a circle, not about n²');
      if (gr.tests > 1000 * Math.log2(1000) + 2 * 1000) fails.push('hull: Graham took ' + gr.tests + ' tests, more than n log n + 2n'); }
    { const pts = hullPoints(1000, 'triangle', 3), gw = runHull(giftWrap, pts), q = runHull(quickhull, pts);
      if (gw.hull.length !== 3) fails.push('hull: the triangle shape has ' + gw.hull.length + ' hull points, not 3');
      if (gw.tests > 3 * 1000 + 5) fails.push('hull: gift wrapping took ' + gw.tests + ' tests for 3 hull points');
      if (q.tests > 4 * 1000) fails.push('hull: Quickhull took ' + q.tests + ' tests for 3 hull points'); }
    // ---- the Mandelbrot set
    if (escape(0, 0, 500) !== -1) fails.push('mandelbrot: 0 should be inside');
    if (escape(-1, 0, 500) !== -1) fails.push('mandelbrot: -1 should be inside');
    if (escape(0, 1, 500) !== -1) fails.push('mandelbrot: i should be inside (its orbit repeats)');
    { const e = escape(1, 0, 500); if (!(e > 0 && e < 8)) fails.push('mandelbrot: 1 should escape within a few steps, got ' + e); }
    if (escape(-2, 0, 5000) !== -1) fails.push('mandelbrot: -2, on the boundary, never escapes');
    if (!(escape(-2.01, 0, 500) > 0)) fails.push('mandelbrot: -2.01 should escape');
    if (!(escape(0.26, 0, 5000) > 10)) fails.push('mandelbrot: 0.26, just past the cusp, should escape slowly');
    if (!(escape(0.5, 0.5, 100) > 0) || !(escape(-0.75, 0.1, 100) > 0)) fails.push('mandelbrot: points outside should escape');
    if (escape(-0.1226, 0.7449, 2000) !== -1) fails.push('mandelbrot: -0.1226 + 0.7449i, the centre of the period-3 bulb, should be inside');
    // the shortcut for the cardioid and the disc agrees with plain iteration
    for (let k = 0; k < 400; k++) {
      const cx = -2 + 2.5 * r(), cy = -1.2 + 2.4 * r(); let x = 0, y = 0, n = 0;
      while (n < 400 && x * x + y * y <= BAIL) { const t = x * x - y * y + cx; y = 2 * x * y + cy; x = t; n++; }
      const plain = x * x + y * y <= BAIL ? -1 : n;
      if ((escape(cx, cy, 400) < 0) !== (plain < 0)) { fails.push('mandelbrot: the shortcut disagrees at ' + cx + ', ' + cy); break; }
    }
    { const o = orbit(1, 0, 10); if (o.map((z) => z[0]).join() !== '0,1,2,5') fails.push('mandelbrot: the orbit of 1 should be 0, 1, 2, 5, not ' + o.map((z) => z[0]).join()); }
    if (escapeJulia(0, 0, 0, 0, 100) !== -1 || !(escapeJulia(1.5, 0, 0, 0, 100) > 0)) fails.push('julia: for c = 0 the set is the unit disc');
    // ---- L-systems
    const koch = parseRules('F=F+F--F+F').rules;
    for (let n = 0; n <= 6; n++) { const s = rewrite('F', koch, n).strings[n]; const f = (s.match(/F/g) || []).length; if (f !== Math.pow(4, n)) fails.push('lsystem: Koch generation ' + n + ' has ' + f + ' segments, not 4^' + n); if (turtle(s, 60, 0).count !== f) fails.push('lsystem: the turtle drew a different number of lines than F\'s'); }
    { const t = turtle(rewrite('F--F--F', koch, 3).strings[3], 60, 0); if (t.count !== 3 * 64) fails.push('lsystem: the snowflake has ' + t.count + ' sides at generation 3'); const b = t.box; if (Math.abs((b[2] - b[0]) - 27) > 1e-3) fails.push('lsystem: the snowflake is ' + (b[2] - b[0]) + ' wide, not 27 steps'); }
    for (const p of LSYS) {
      const pr = parseRules(p.rules); if (pr.error) { fails.push('lsystem: preset ' + p.id + ': ' + pr.error); continue; }
      if (checkAxiom(p.axiom)) fails.push('lsystem: preset ' + p.id + ' axiom: ' + checkAxiom(p.axiom));
      const g = rewrite(p.axiom, pr.rules, p.max); if (g.capped) fails.push('lsystem: preset ' + p.id + ' reaches the cap before its last generation ' + p.max);
      for (let k = 1; k < g.strings.length; k++) if (g.strings[k].length !== nextLength(g.strings[k - 1], pr.rules)) fails.push('lsystem: nextLength is wrong for ' + p.id);
    }
    { const g = rewrite('F', parseRules('F=FFFFFFFFFF').rules, 20, 50000); if (!g.capped || g.strings.length !== 5 || g.strings[4].length !== 10000 || g.wanted !== 100000) fails.push('lsystem: the cap did not stop at 10^4 symbols: ' + g.strings.length + ' generations'); }
    { const g = rewrite('F', parseRules('F=FF').rules, 40); if (!g.capped || g.strings[g.strings.length - 1].length > LS_CAP) fails.push('lsystem: doubling 40 times was not capped'); }
    for (const bad of ['F', 'FF=F', 'F=F+[F', 'F=F]F[', 'F=F*F', 'F=' + 'F'.repeat(201), 'F=F\nF=FF', '1=F', Array(14).fill('F=F').join('\n')]) if (!parseRules(bad).error) fails.push('lsystem: the rule ' + JSON.stringify(bad.slice(0, 30)) + ' should be refused');
    for (const good of ['F=F+F--F+F', 'X -> F[+X]F[-X]+X\nF → FF', '', 'A=B\nB=AB']) if (parseRules(good).error) fails.push('lsystem: the rule ' + JSON.stringify(good) + ' should be accepted: ' + parseRules(good).error);
    if (Object.getPrototypeOf(parseRules('F=F').rules) !== null || rewrite('toString', parseRules('F=F').rules, 1).strings[1] !== 'toString') fails.push('lsystem: rules must be a null-prototype map (a letter like t must not find Object.prototype)');
    if (!checkAxiom('') || !checkAxiom('F]') || checkAxiom('F--F--F')) fails.push('lsystem: checkAxiom is wrong');
    { const t = turtle('F[+F]F', 90, 90); if (t.count !== 3 || t.depth !== 1) fails.push('lsystem: brackets: ' + t.count + ' lines, depth ' + t.depth); }
    // ---- Delaunay and Voronoi
    for (let k = 0; k < 30; k++) {
      const n = 3 + r.int(80), W = 800, H = 500, pts = []; for (let i = 0; i < n; i++) pts.push([W * r(), H * r()]);
      const tris = delaunay(pts);
      let bad = 0;
      for (const [a, b, c] of tris) { const t = circum(pts, a, b, c); for (let i = 0; i < n; i++) if (i !== a && i !== b && i !== c && d2(pts[i], [t.x, t.y]) < t.r2 * (1 - 1e-9)) bad++; }
      if (bad) fails.push('delaunay: ' + bad + ' points inside circumcircles, n = ' + n);
      const h = runHull(giftWrap, pts).hull.length;
      if (tris.length !== 2 * n - 2 - h) fails.push('delaunay: ' + tris.length + ' triangles for ' + n + ' points with ' + h + ' on the hull, not 2n - 2 - h = ' + (2 * n - 2 - h));
      const cells = voronoi(pts, W, H), area = cells.reduce((s, c) => s + polyArea(c), 0);
      if (Math.abs(area - W * H) > 1e-6 * W * H) fails.push('voronoi: the cells cover ' + area + ' of ' + W * H);
      for (let q = 0; q < 40; q++) {   // a random spot is inside the cell of its nearest point
        const p = [W * r(), H * r()]; let best = 0; for (let i = 1; i < n; i++) if (d2(p, pts[i]) < d2(p, pts[best])) best = i;
        const c = cells[best]; let inside = true; for (let i = 0; i < c.length; i++) if (orient(c[i], c[(i + 1) % c.length], p) < -1e-6) { inside = false; break; }
        if (!inside) { fails.push('voronoi: a spot is not in the cell of its nearest point'); break; }
      }
    }
    { const cells = voronoi([[10, 10], [10, 10], [30, 10]], 40, 20); if (cells[1].length || Math.abs(polyArea(cells[0]) + polyArea(cells[2]) - 800) > 1e-9) fails.push('voronoi: a repeated point should get an empty cell'); }
    if (delaunay([[0, 0], [1, 0], [0, 1], [0, 0]]).length !== 1) fails.push('delaunay: a repeated point should be skipped');
    { const c = centroid([[0, 0], [4, 0], [4, 2], [0, 2]]); if (c[0] !== 2 || c[1] !== 1) fails.push('voronoi: centroid of a rectangle is ' + c); }
    return fails;
  }

  if (typeof module !== 'undefined') module.exports = { selfTest, orient, giftWrap, graham, quickhull, hullPoints, runHull, escape, escapeJulia, orbit,
    parseRules, rewrite, nextLength, turtle, LSYS, LS_CAP, voronoi, delaunay, centroid, polyArea };
})();
