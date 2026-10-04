/* Algorithms in motion: paths, graphs and mazes. Three demos for the #/algorithms page (see src/algos.js for the frame):
   - pathfinding: a grid the reader draws on (walls, mud that costs more, start and goal), searched by BFS, DFS, Dijkstra, A* and
     greedy best-first search, with a table that compares all five on the same grid;
   - maze: seven maze generators (recursive backtracker, Prim, Kruskal, Wilson, Aldous-Broder, recursive division, sidewinder) and six
     solvers (BFS, DFS, A*, greedy, the right-hand rule, dead-end filling), all seeded so a maze can be made again;
   - graph-traversal: BFS, DFS (with a stack and with recursion) and Dijkstra on small node-link graphs, with the queue or stack
     shown beside the graph and a sentence for every step.
   The algorithms are pure generators that yield one event per step and know nothing of the page; the demos replay the events.
   selfTest() checks them on hundreds of seeded random grids and mazes (node test_algos.js). */
(function () {
  const A = (typeof window !== 'undefined' && window.ALGOS) || require('./algos.js');
  const SQRT2 = Math.SQRT2, MUD = 5, EPS = 1e-9;

  // ================================================================== pure algorithms (no DOM)

  /** A binary heap of entries { key: [numbers...] }, smallest key first (keys compared element by element). */
  function Heap() {
    const a = [];
    const less = (x, y) => { for (let k = 0; k < x.key.length; k++) if (x.key[k] !== y.key[k]) return x.key[k] < y.key[k]; return false; };
    const swap = (i, j) => { const t = a[i]; a[i] = a[j]; a[j] = t; };
    return {
      size: () => a.length,
      items: () => a.slice().sort((x, y) => (less(x, y) ? -1 : less(y, x) ? 1 : 0)),
      push(e) { a.push(e); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (!less(a[i], a[p])) break; swap(i, p); i = p; } },
      pop() {
        const top = a[0], last = a.pop();
        if (a.length) {
          a[0] = last; let i = 0;
          for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < a.length && less(a[l], a[m])) m = l; if (r < a.length && less(a[r], a[m])) m = r; if (m === i) break; swap(i, m); i = m; }
        }
        return top;
      }
    };
  }

  const ALGS = { bfs: 'Breadth-first search', dfs: 'Depth-first search', dijkstra: 'Dijkstra', astar: 'A*', greedy: 'Greedy best-first' };
  const edgeCost = (g, a, b) => { for (const [j, c] of g.nbrs(a)) if (j === b) return c; return NaN; };

  /** Search a graph g = { n, start, goal, nbrs(i) → [[j, cost], ...], h(i) } with one of ALGS.
      Yields { t: 'push', i } when a vertex joins the frontier and { t: 'pop', i } when it is taken out and explored.
      Returns { found, path (start..goal), cost, visited (vertices taken out) }. */
  function* search(g, algo) {
    const n = g.n, s = g.start, goal = g.goal;
    const parent = new Int32Array(n).fill(-1), state = new Uint8Array(n);   // 0 unseen, 1 in the frontier, 2 explored
    let visited = 0;
    const done = (found) => {
      const path = []; let cost = 0;
      if (found) {
        for (let v = goal; v !== s; v = parent[v]) path.push(v);
        path.push(s); path.reverse();
        for (let k = 1; k < path.length; k++) cost += edgeCost(g, path[k - 1], path[k]);
      }
      return { found, path, cost, visited };
    };
    if (algo === 'bfs') {
      const q = [s]; let head = 0; state[s] = 1; yield { t: 'push', i: s };
      while (head < q.length) {
        const v = q[head++]; state[v] = 2; visited++; yield { t: 'pop', i: v };
        if (v === goal) return done(true);
        for (const [w] of g.nbrs(v)) if (!state[w]) { state[w] = 1; parent[w] = v; q.push(w); yield { t: 'push', i: w }; }
      }
      return done(false);
    }
    if (algo === 'dfs') {
      // the textbook stack version: a vertex may be pushed more than once; it is explored the first time it is popped, and its
      // parent is the vertex that pushed that copy. Neighbours are pushed in reverse, so the first neighbour is explored first.
      const st = [[s, -1]]; state[s] = 1; yield { t: 'push', i: s };
      while (st.length) {
        const [v, p] = st.pop();
        if (state[v] === 2) continue;
        state[v] = 2; parent[v] = p; visited++; yield { t: 'pop', i: v };
        if (v === goal) return done(true);
        const ns = g.nbrs(v);
        for (let k = ns.length - 1; k >= 0; k--) { const w = ns[k][0]; if (state[w] !== 2) { state[w] = 1; st.push([w, v]); yield { t: 'push', i: w }; } }
      }
      return done(false);
    }
    // Dijkstra, A* and greedy: a priority queue, with stale entries skipped when they come out (lazy deletion)
    const h = (i) => (algo === 'dijkstra' ? 0 : g.h(i));
    const gs = new Float64Array(n).fill(Infinity), heap = Heap(); let seq = 0;
    const key = (gv, hv) => (algo === 'astar' ? [gv + hv, hv, seq++] : algo === 'greedy' ? [hv, seq++] : [gv, seq++]);
    gs[s] = 0; state[s] = 1; heap.push({ key: key(0, h(s)), v: s, g: 0 }); yield { t: 'push', i: s };
    while (heap.size()) {
      const e = heap.pop(), v = e.v;
      if (state[v] === 2 || e.g > gs[v]) continue;
      state[v] = 2; visited++; yield { t: 'pop', i: v };
      if (v === goal) return done(true);
      for (const [w, c] of g.nbrs(v)) {
        if (state[w] === 2) continue;
        if (algo === 'greedy') {
          if (state[w]) continue;                     // greedy keeps the first way it found to w
          gs[w] = 0; parent[w] = v; state[w] = 1; heap.push({ key: key(0, h(w)), v: w, g: 0 }); yield { t: 'push', i: w };
        } else {
          const ng = gs[v] + c;
          if (ng < gs[w] - EPS) { gs[w] = ng; parent[w] = v; state[w] = 1; heap.push({ key: key(ng, h(w)), v: w, g: ng }); yield { t: 'push', i: w }; }
        }
      }
    }
    return done(false);
  }
  /** Run a generator to the end and return what it returns. */
  function runToEnd(it) { let r; do r = it.next(); while (!r.done); return r.value; }

  // ---------- the grid of the path-finding demo
  function makeGrid(R, C) {
    const n = R * C, mid = (R / 2) | 0;
    return { R, C, wall: new Uint8Array(n), mud: new Uint8Array(n), start: mid * C + Math.min(2, C - 1), goal: mid * C + Math.max(0, C - 3) };
  }
  /** The grid as a graph. A move costs 1, or MUD into a mud cell; a diagonal move costs √2 times that and may not cut the corner of a
      wall. h is the Manhattan distance (four directions) or the octile distance (eight): neither ever overestimates, as every move costs at least its length. */
  function gridGraph(G, diag) {
    const { R, C, wall, mud } = G, gr = (G.goal / C) | 0, gc = G.goal % C;
    const open = (r, c) => r >= 0 && c >= 0 && r < R && c < C && !wall[r * C + c];
    const wt = (i) => (mud[i] ? MUD : 1);
    const nbrs = (i) => {
      const r = (i / C) | 0, c = i % C, out = [];
      if (open(r - 1, c)) out.push([i - C, wt(i - C)]);
      if (open(r, c + 1)) out.push([i + 1, wt(i + 1)]);
      if (open(r + 1, c)) out.push([i + C, wt(i + C)]);
      if (open(r, c - 1)) out.push([i - 1, wt(i - 1)]);
      if (diag) for (const [dr, dc] of [[-1, 1], [1, 1], [1, -1], [-1, -1]]) {
        if (open(r + dr, c + dc) && open(r + dr, c) && open(r, c + dc)) { const j = (r + dr) * C + c + dc; out.push([j, wt(j) * SQRT2]); }
      }
      return out;
    };
    const h = (i) => { const dr = Math.abs(((i / C) | 0) - gr), dc = Math.abs(i % C - gc); return diag ? dr + dc + (SQRT2 - 2) * Math.min(dr, dc) : dr + dc; };
    return { n: R * C, start: G.start, goal: G.goal, nbrs, h };
  }

  // ---------- mazes: R x C cells; e[i] = passage from i to its east neighbour, s[i] = to its south neighbour
  function newMaze(R, C, open) {
    const n = R * C, m = { R, C, n, e: new Uint8Array(n), s: new Uint8Array(n) };
    if (open) for (let i = 0; i < n; i++) { if (i % C < C - 1) m.e[i] = 1; if (i < n - C) m.s[i] = 1; }
    return m;
  }
  function setPass(m, a, b, v) { if (b < a) { const t = a; a = b; b = t; } if (b === a + m.C) m.s[a] = v; else m.e[a] = v; }
  function cellNbrs(m, i) {
    const C = m.C, r = (i / C) | 0, c = i % C, out = [];
    if (r > 0) out.push(i - C); if (c < C - 1) out.push(i + 1); if (r < m.R - 1) out.push(i + C); if (c > 0) out.push(i - 1);
    return out;
  }
  function openNbrs(m, i) {
    const C = m.C, r = (i / C) | 0, c = i % C, out = [];
    if (r > 0 && m.s[i - C]) out.push(i - C); if (c < C - 1 && m.e[i]) out.push(i + 1); if (r < m.R - 1 && m.s[i]) out.push(i + C); if (c > 0 && m.e[i - 1]) out.push(i - 1);
    return out;
  }
  /* Generators carve the maze m in place (all walls to begin with, or no inner walls for division) and yield events for the picture:
     { t:'in', i } a cell joins the maze; { t:'carve', a, b, k? } a passage a-b is opened (both cells join; k sets their mark);
     { t:'mark', i, k, cur? } a cell's mark (1 frontier, 2 stack or run, 3 random walk, 0 none); { t:'cur', i } the current cell;
     { t:'wall', a, b } a wall is built (division); { t:'room', x, y, w, h } the chamber being divided. */
  function* genBacktracker(m, rnd) {
    const inn = new Uint8Array(m.n), s0 = rnd.int(m.n), st = [s0];
    inn[s0] = 1; yield { t: 'in', i: s0 }; yield { t: 'mark', i: s0, k: 2, cur: s0 };
    while (st.length) {
      const v = st[st.length - 1], opts = cellNbrs(m, v).filter((w) => !inn[w]);
      if (!opts.length) { st.pop(); yield { t: 'mark', i: v, k: 0, cur: st.length ? st[st.length - 1] : -1 }; continue; }
      const w = opts[rnd.int(opts.length)];
      setPass(m, v, w, 1); inn[w] = 1; st.push(w); yield { t: 'carve', a: v, b: w, k: 2 };
    }
  }
  function* genPrim(m, rnd) {
    const inn = new Uint8Array(m.n), fr = new Uint8Array(m.n), F = [], s0 = rnd.int(m.n);
    inn[s0] = 1; yield { t: 'in', i: s0 };
    for (const w of cellNbrs(m, s0)) { fr[w] = 1; F.push(w); yield { t: 'mark', i: w, k: 1 }; }
    while (F.length) {
      const k = rnd.int(F.length), f = F[k]; F[k] = F[F.length - 1]; F.pop(); fr[f] = 0;
      const ins = cellNbrs(m, f).filter((w) => inn[w]), w = ins[rnd.int(ins.length)];
      setPass(m, f, w, 1); inn[f] = 1; yield { t: 'carve', a: w, b: f, k: 0 };
      for (const x of cellNbrs(m, f)) if (!inn[x] && !fr[x]) { fr[x] = 1; F.push(x); yield { t: 'mark', i: x, k: 1 }; }
    }
  }
  function* genKruskal(m, rnd) {
    const C = m.C, edges = [], up = new Int32Array(m.n).map((_, i) => i), size = new Int32Array(m.n).fill(1);
    for (let i = 0; i < m.n; i++) { if (i % C < C - 1) edges.push([i, i + 1]); if (i < m.n - C) edges.push([i, i + C]); }
    rnd.shuffle(edges);
    const find = (x) => { while (up[x] !== x) { up[x] = up[up[x]]; x = up[x]; } return x; };
    for (const [a, b] of edges) {
      let ra = find(a), rb = find(b);
      if (ra === rb) continue;                       // already joined: a passage here would make a loop
      if (size[ra] < size[rb]) { const t = ra; ra = rb; rb = t; }
      up[rb] = ra; size[ra] += size[rb];
      setPass(m, a, b, 1); yield { t: 'carve', a, b };
    }
  }
  function* genWilson(m, rnd) {
    const n = m.n, inn = new Uint8Array(n), pos = new Int32Array(n).fill(-1), root = rnd.int(n);
    inn[root] = 1; yield { t: 'in', i: root };
    const order = rnd.shuffle(Array.from({ length: n }, (_, i) => i));
    for (const s of order) {
      if (inn[s]) continue;
      const path = [s]; pos[s] = 0; yield { t: 'mark', i: s, k: 3, cur: s };
      for (;;) {                                     // a random walk from s until it meets the maze, erasing every loop it makes
        const v = path[path.length - 1], ns = cellNbrs(m, v), w = ns[rnd.int(ns.length)];
        if (inn[w]) { path.push(w); break; }
        if (pos[w] >= 0) { while (path.length - 1 > pos[w]) { const x = path.pop(); pos[x] = -1; yield { t: 'mark', i: x, k: 0, cur: w }; } }
        else { pos[w] = path.length; path.push(w); yield { t: 'mark', i: w, k: 3, cur: w }; }
      }
      for (let k = 0; k + 1 < path.length; k++) { setPass(m, path[k], path[k + 1], 1); inn[path[k]] = 1; pos[path[k]] = -1; yield { t: 'carve', a: path[k], b: path[k + 1], k: 0 }; }
    }
  }
  function* genAldousBroder(m, rnd) {
    const inn = new Uint8Array(m.n); let v = rnd.int(m.n), count = 1;
    inn[v] = 1; yield { t: 'in', i: v }; yield { t: 'cur', i: v };
    while (count < m.n) {
      const ns = cellNbrs(m, v), w = ns[rnd.int(ns.length)];
      if (!inn[w]) { setPass(m, v, w, 1); inn[w] = 1; count++; yield { t: 'carve', a: v, b: w }; } else yield { t: 'cur', i: w };
      v = w;
    }
  }
  function* genDivision(m, rnd) {
    const C = m.C, st = [[0, 0, C, m.R]];
    while (st.length) {
      const [x, y, w, h] = st.pop();
      if (w < 2 || h < 2) continue;
      yield { t: 'room', x, y, w, h };
      const horiz = w < h ? true : h < w ? false : rnd() < 0.5;
      if (horiz) {                                   // a wall under row k with one gap, then each half on its own
        const k = y + rnd.int(h - 1), gap = x + rnd.int(w);
        for (let c = x; c < x + w; c++) if (c !== gap) { const a = k * C + c; m.s[a] = 0; yield { t: 'wall', a, b: a + C }; }
        st.push([x, k + 1, w, y + h - k - 1]); st.push([x, y, w, k - y + 1]);
      } else {
        const k = x + rnd.int(w - 1), gap = y + rnd.int(h);
        for (let r = y; r < y + h; r++) if (r !== gap) { const a = r * C + k; m.e[a] = 0; yield { t: 'wall', a, b: a + 1 }; }
        st.push([k + 1, y, x + w - k - 1, h]); st.push([x, y, k - x + 1, h]);
      }
    }
  }
  function* genSidewinder(m, rnd) {
    const C = m.C;
    for (let r = 0; r < m.R; r++) {
      let run = [];
      for (let c = 0; c < C; c++) {
        const i = r * C + c; run.push(i); yield { t: 'mark', i, k: 2, cur: i };
        const close = c === C - 1 || (r > 0 && rnd() < 0.5);
        if (close) {
          if (r > 0) { const p = run[rnd.int(run.length)]; setPass(m, p, p - C, 1); yield { t: 'carve', a: p - C, b: p, k: 0 }; }
          for (const x of run) yield { t: 'mark', i: x, k: 0 };
          run = [];
        } else { setPass(m, i, i + 1, 1); yield { t: 'carve', a: i, b: i + 1, k: 2 }; }
      }
    }
  }
  const MAZE_GENS = {
    backtracker: { name: 'Recursive backtracker', run: genBacktracker },
    prim: { name: 'Randomized Prim', run: genPrim },
    kruskal: { name: 'Randomized Kruskal', run: genKruskal },
    wilson: { name: 'Wilson (uniform)', run: genWilson },
    aldous: { name: 'Aldous-Broder (uniform)', run: genAldousBroder },
    division: { name: 'Recursive division', run: genDivision, open: true },
    sidewinder: { name: 'Sidewinder', run: genSidewinder }
  };
  /** Make a whole maze at once. */
  function makeMaze(gen, R, C, seed) { const m = newMaze(R, C, !!MAZE_GENS[gen].open); runToEnd(MAZE_GENS[gen].run(m, A.rng(seed))); return m; }

  // ---------- maze solvers: from the top-left cell (0) to the bottom-right one (n - 1)
  function mazeGraph(m) {
    const goal = m.n - 1, gr = m.R - 1, gc = m.C - 1;
    return { n: m.n, start: 0, goal, nbrs: (i) => openNbrs(m, i).map((j) => [j, 1]), h: (i) => Math.abs(((i / m.C) | 0) - gr) + Math.abs(i % m.C - gc) };
  }
  /** Remove the loops from a walk, leaving a path. */
  function loopErase(walk, n) {
    const st = [], pos = new Int32Array(n).fill(-1);
    for (const x of walk) { if (pos[x] >= 0) { while (st.length - 1 > pos[x]) pos[st.pop()] = -1; } else { pos[x] = st.length; st.push(x); } }
    return st;
  }
  /** The right-hand rule: keep a hand on the wall to your right. Yields { t: 'walk', i } for every step. */
  function* wallFollower(m) {
    const C = m.C, goal = m.n - 1, DR = [-C, 1, C, -1], seen = new Uint8Array(m.n);
    const can = (i, d) => { const r = (i / C) | 0, c = i % C; return d === 0 ? r > 0 && !!m.s[i - C] : d === 1 ? c < C - 1 && !!m.e[i] : d === 2 ? r < m.R - 1 && !!m.s[i] : c > 0 && !!m.e[i - 1]; };
    let v = 0, d = 1, steps = 0, visited = 1; const walk = [0]; seen[0] = 1;
    yield { t: 'walk', i: 0 };
    while (v !== goal && steps++ < 4 * m.n + 8) {
      let moved = false;
      for (const turn of [1, 0, 3, 2]) { const nd = (d + turn) % 4; if (can(v, nd)) { d = nd; v += DR[nd]; moved = true; break; } }   // right, ahead, left, back
      if (!moved) break;
      if (!seen[v]) { seen[v] = 1; visited++; }
      walk.push(v); yield { t: 'walk', i: v };
    }
    if (v !== goal) return { found: false, path: [], cost: 0, visited };
    const path = loopErase(walk, m.n);
    return { found: true, path, cost: path.length - 1, visited, steps: walk.length - 1 };
  }
  /** Dead-end filling: fill every dead end, and the corridor behind it, until none is left. Yields { t: 'fill', i }. */
  function* deadEndFill(m) {
    const n = m.n, goal = n - 1, deg = new Int32Array(n), filled = new Uint8Array(n), q = [];
    for (let i = 0; i < n; i++) { deg[i] = openNbrs(m, i).length; if (i !== 0 && i !== goal && deg[i] <= 1) q.push(i); }
    let head = 0, count = 0;
    while (head < q.length) {
      const v = q[head++]; if (filled[v]) continue;
      filled[v] = 1; count++; yield { t: 'fill', i: v };
      for (const w of openNbrs(m, v)) if (!filled[w]) { deg[w]--; if (w !== 0 && w !== goal && deg[w] === 1) q.push(w); }
    }
    const path = [0]; let prev = -1, cur = 0;
    while (cur !== goal) {
      const nx = openNbrs(m, cur).filter((w) => !filled[w] && w !== prev);
      if (nx.length !== 1) return { found: false, path: [], cost: 0, visited: count };   // not a perfect maze, or no way through
      prev = cur; cur = nx[0]; path.push(cur);
      if (path.length > n) return { found: false, path: [], cost: 0, visited: count };
    }
    return { found: true, path, cost: path.length - 1, visited: count };
  }
  const SOLVERS = { bfs: 'Breadth-first search', dfs: 'Depth-first search', astar: 'A* (Manhattan)', greedy: 'Greedy best-first', wall: 'Wall follower (right hand)', deadend: 'Dead-end filling' };
  function mazeSolve(m, solver) {
    if (solver === 'wall') return wallFollower(m);
    if (solver === 'deadend') return deadEndFill(m);
    return search(mazeGraph(m), solver);
  }
  /** A maze of r x c cells as a grid of (2r + 1) x (2c + 1) squares: cells and passages open, the rest wall. */
  function gridFromMaze(m) {
    const R = 2 * m.R + 1, C = 2 * m.C + 1, G = makeGrid(R, C); G.wall.fill(1);
    for (let i = 0; i < m.n; i++) {
      const r = 2 * ((i / m.C) | 0) + 1, c = 2 * (i % m.C) + 1;
      G.wall[r * C + c] = 0; if (m.e[i]) G.wall[r * C + c + 1] = 0; if (m.s[i]) G.wall[(r + 1) * C + c] = 0;
    }
    G.start = C + 1; G.goal = (R - 2) * C + C - 2;
    return G;
  }

  // ---------- small graphs for the traversal demo
  const parseGraph = (labels, pos, edges) => ({
    labels: labels.split(''), pos,
    edges: edges.split(/\s+/).map((e) => [e.charCodeAt(0) - 65, e.charCodeAt(1) - 65, +e.slice(2)])
  });
  const PRESETS = {
    loops: { name: 'Two loops and a bridge', ...parseGraph('ABCDEFGHIJKL',
      [[0.06, 0.5], [0.2, 0.1], [0.38, 0.1], [0.47, 0.5], [0.38, 0.9], [0.2, 0.9], [0.66, 0.5], [0.76, 0.12], [0.96, 0.3], [0.96, 0.75], [0.78, 0.9], [0.27, 0.5]],
      'AB2 BC3 CD2 DE4 EF1 FA3 BL2 LE2 DG5 GH1 HI2 IJ3 JK2 KG4 HK6') },
    tree: { name: 'A tree', ...parseGraph('ABCDEFGHIJKLM',
      [[0.5, 0.05], [0.18, 0.36], [0.5, 0.36], [0.82, 0.36], [0.06, 0.66], [0.28, 0.66], [0.5, 0.66], [0.7, 0.66], [0.94, 0.66], [0.02, 0.95], [0.16, 0.95], [0.5, 0.95], [0.94, 0.95]],
      'AB2 AC4 AD1 BE3 BF2 CG5 DH2 DI6 EJ1 EK4 GL3 IM2') },
    grid: { name: 'A grid with gaps', ...parseGraph('ABCDEFGHIJKL',
      [0, 1, 2].flatMap((r) => [0, 1, 2, 3].map((c) => [0.05 + 0.3 * c, 0.08 + 0.42 * r])),
      'AB1 BC4 CD2 EF3 GH1 IJ2 JK1 KL5 AE2 BF1 DH3 EI1 FJ6 GK2 HL1 CG2') },
    towns: { name: 'Towns and roads (weighted)', ...parseGraph('ABCDEFGHIJ',
      [[0.03, 0.5], [0.32, 0.06], [0.2, 0.78], [0.4, 0.52], [0.66, 0.08], [0.6, 0.6], [0.84, 0.32], [0.46, 0.95], [0.78, 0.9], [0.97, 0.62]],
      'AB7 AC2 CD2 DB2 BE8 DF3 FE2 EG4 FH6 CH9 GI3 HI1 IJ5 GJ9') }
  };
  function buildGraph(P) {
    const n = P.labels.length, adj = Array.from({ length: n }, () => []);
    for (const [a, b, w] of P.edges) { adj[a].push([b, w]); adj[b].push([a, w]); }
    for (const l of adj) l.sort((x, y) => x[0] - y[0]);
    return { n, labels: P.labels, pos: P.pos, edges: P.edges, adj };
  }
  const TRAVERSALS = { bfs: 'Breadth-first (queue)', dfs: 'Depth-first (stack)', rdfs: 'Depth-first (recursion)', dijkstra: 'Dijkstra (priority queue)' };
  const BOX = { bfs: 'Queue, front first', dfs: 'Stack, top first', rdfs: 'Call stack, innermost first', dijkstra: 'Priority queue, smallest first' };
  /** Traverse graph G from s, one snapshot per step: { state[] (0 not reached, 1 in the queue/stack, 2 done), parent[], dist[], order[],
      strip: [{ text, stale }], say, cur, edge }. Neighbours are read in alphabetical order. Returns { order, parent, dist }. */
  function* graphTraverse(G, s, algo) {
    const n = G.n, L = G.labels, state = new Array(n).fill(0), parent = new Array(n).fill(-1), dist = new Array(n).fill(Infinity), order = [];
    let strip = () => [];
    const snap = (say, cur, edge) => ({ state: state.slice(), parent: parent.slice(), dist: dist.slice(), order: order.slice(), strip: strip(), say, cur: cur == null ? -1 : cur, edge: edge || null });
    const nth = () => order.length;
    if (algo === 'bfs') {
      const q = [s]; let head = 0; strip = () => q.slice(head).map((v) => ({ text: L[v] }));
      state[s] = 1; dist[s] = 0;
      yield snap(`Start at ${L[s]}: give it the label 0 and put it in the queue.`, s);
      while (head < q.length) {
        const v = q[head++]; state[v] = 2; order.push(v);
        yield snap(`Take ${L[v]} from the front of the queue (visit number ${nth()}) and look at its neighbours.`, v);
        for (const [w] of G.adj[v]) {
          if (state[w] === 0) { state[w] = 1; dist[w] = dist[v] + 1; parent[w] = v; q.push(w); yield snap(`${L[w]} has no label yet: label it ${dist[v]} + 1 = ${dist[w]} and add it to the back of the queue.`, v, [v, w]); }
          else yield snap(`${L[w]} already has a label: leave it alone.`, v, [v, w]);
        }
      }
      yield snap(`The queue is empty: done. The labels are the distances from ${L[s]}, and the thick edges form a breadth-first search tree.`);
    } else if (algo === 'dfs') {
      const st = [[s, -1]]; strip = () => st.slice().reverse().map(([v]) => ({ text: L[v], stale: state[v] === 2 }));
      state[s] = 1;
      yield snap(`Start: push ${L[s]} on the stack.`, s);
      while (st.length) {
        const [v, p] = st.pop();
        if (state[v] === 2) { yield snap(`Pop ${L[v]}: it was visited already, so throw this copy away.`, v); continue; }
        state[v] = 2; parent[v] = p; order.push(v);
        yield snap(`Pop ${L[v]} from the top of the stack: visit it (number ${nth()}).`, v, p >= 0 ? [p, v] : null);
        const ns = G.adj[v];
        for (let k = ns.length - 1; k >= 0; k--) {
          const w = ns[k][0];
          if (state[w] !== 2) { state[w] = 1; st.push([w, v]); yield snap(`Push ${L[w]}. (Neighbours go on in reverse order, so the first one ends up on top.)`, v, [v, w]); }
          else yield snap(`${L[w]} is visited: do not push it.`, v, [v, w]);
        }
      }
      yield snap('The stack is empty: done. The thick edges form a depth-first search tree.');
    } else if (algo === 'rdfs') {
      const calls = []; strip = () => calls.slice().reverse().map((v) => ({ text: 'dfs(' + L[v] + ')' }));
      const rec = function* (v, p) {
        state[v] = 1; parent[v] = p; order.push(v); calls.push(v);
        yield snap(`Call dfs(${L[v]}): visit ${L[v]} (number ${nth()}).`, v, p >= 0 ? [p, v] : null);
        for (const [w] of G.adj[v]) {
          if (state[w] === 0) { yield snap(`${L[w]} is not visited: call dfs(${L[w]}). dfs(${L[v]}) waits on the call stack until it returns.`, v, [v, w]); yield* rec(w, v); }
          else yield snap(`${L[w]} is visited already: skip it.`, v, [v, w]);
        }
        calls.pop(); state[v] = 2;
        yield snap(`dfs(${L[v]}) has tried every neighbour: it returns${calls.length ? ' to dfs(' + L[calls[calls.length - 1]] + ')' : ''}.`, calls.length ? calls[calls.length - 1] : v);
      };
      yield* rec(s, -1);
      yield snap('The first call has returned: done. Same visit order as the stack version, but the call stack only ever holds the current path.');
    } else {
      const heap = Heap(); let seq = 0;
      strip = () => heap.items().map((e) => ({ text: L[e.v] + ' ' + e.d, stale: state[e.v] === 2 || e.d > dist[e.v] }));
      dist[s] = 0; state[s] = 1; heap.push({ key: [0, seq++], v: s, d: 0 });
      yield snap(`Start at ${L[s]}: its distance is 0. Put (${L[s]}, 0) in the priority queue.`, s);
      while (heap.size()) {
        const e = heap.pop(), v = e.v;
        if (state[v] === 2) { yield snap(`Take (${L[v]}, ${e.d}): ${L[v]} is final already, so this old entry is thrown away.`, v); continue; }
        state[v] = 2; order.push(v);
        yield snap(`Take the smallest entry, (${L[v]}, ${e.d}). No route to ${L[v]} can be cheaper now: ${e.d} is final (visit number ${nth()}).`, v, parent[v] >= 0 ? [parent[v], v] : null);
        for (const [w, wt] of G.adj[v]) {
          if (state[w] === 2) { yield snap(`${L[w]} is final: skip it.`, v, [v, w]); continue; }
          const nd = e.d + wt, old = dist[w];
          if (nd < old) {
            dist[w] = nd; parent[w] = v; state[w] = 1; heap.push({ key: [nd, seq++], v: w, d: nd });
            yield snap(old === Infinity ? `${L[w]} is reached for the first time: ${e.d} + ${wt} = ${nd}. Add (${L[w]}, ${nd}).` : `Through ${L[v]}, ${L[w]} costs ${e.d} + ${wt} = ${nd}, less than ${old}: update it and add (${L[w]}, ${nd}).`, v, [v, w]);
          } else yield snap(`Through ${L[v]}, ${L[w]} would cost ${e.d} + ${wt} = ${nd}, which is not less than ${old}: no change.`, v, [v, w]);
        }
      }
      yield snap(`The priority queue is empty: done. Each number is the cheapest total weight from ${L[s]}; the thick edges form a shortest-path tree.`);
    }
    return { order, parent, dist };
  }

  // ================================================================== the page (DOM only from here, and only inside mount)

  const CSS = `
.ap-hint { font-family: var(--sans); font-size: 0.88rem; color: var(--ink-3); margin: 0.2rem 0 0.4rem; }
.ap-controls label { display: inline-flex; align-items: center; gap: 0.35rem; color: var(--ink-2); }
.ap-controls input[type=checkbox] { accent-color: var(--accent); }
.ap-seed { width: 6.5rem; }
.ap-compare { overflow-x: auto; margin: 0.6rem 0; }
.ap-compare table { border-collapse: collapse; font-family: var(--sans); font-size: 0.9rem; font-variant-numeric: tabular-nums; }
.ap-compare caption { text-align: left; color: var(--ink-2); padding-bottom: 0.3rem; }
.ap-compare th, .ap-compare td { text-align: left; padding: 0.3rem 0.7rem 0.3rem 0; border-bottom: 1px solid var(--rule); }
.ap-compare td.num { text-align: right; padding-right: 1.2rem; }
.ap-good { color: var(--ok); } .ap-bad { color: var(--err); }
.ap-graph { display: grid; grid-template-columns: minmax(0, 1fr) 15rem; gap: 1rem; align-items: start; }
@media (max-width: 720px) { .ap-graph { grid-template-columns: minmax(0, 1fr); } }
.ap-side { font-family: var(--sans); font-size: 0.92rem; color: var(--ink-2); }
.ap-side-title { font-weight: 600; color: var(--ink); margin: 0 0 0.4rem; }
.ap-strip { display: flex; flex-wrap: wrap; gap: 0.3rem; min-height: 1.9rem; margin-bottom: 0.6rem; }
.ap-chip { font-family: var(--mono); font-size: 0.85rem; border: 1px solid var(--rule); border-radius: 3px; padding: 0.12rem 0.45rem; background: var(--paper); color: var(--ink); }
.ap-chip.next { border-color: var(--k-quiz); box-shadow: inset 0 0 0 1px var(--k-quiz); }
.ap-chip.stale { text-decoration: line-through; color: var(--ink-3); }
.ap-empty { color: var(--ink-3); font-style: italic; }
.ap-say { min-height: 4.2em; color: var(--ink); margin: 0.4rem 0; line-height: 1.4; }
.ap-order { font-family: var(--mono); font-size: 0.85rem; overflow-wrap: anywhere; color: var(--ink); }
`;
  function injectCss() {
    if (document.getElementById('algo-paths-css')) return;
    const s = document.createElement('style'); s.id = 'algo-paths-css'; s.textContent = CSS; document.head.appendChild(s);
  }
  function selectBox(el, label, options, value, onchange) {
    const s = el('select', { onchange: () => onchange(s.value) }, options.map(([v, t]) => el('option', { value: v }, t)));
    s.value = value;
    return [el('label', {}, label + ' ', s), s];
  }
  const legend = (el, items) => el('div', { class: 'algo-legend' }, items.map(([style, text]) => el('span', {}, el('i', { style }), text)));
  /** Redraw at most once per animation frame. */
  function painter(cv, before) {
    let raf = 0;
    const fn = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; if (before) before(); cv.redraw(); }); };
    fn.cancel = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
    return fn;
  }
  const fmt = (x) => (Math.abs(x - Math.round(x)) < 1e-6 ? String(Math.round(x)) : x.toFixed(1));
  function lineCells(a, b, C) {
    const out = []; let r0 = (a / C) | 0, c0 = a % C; const r1 = (b / C) | 0, c1 = b % C;
    const dr = Math.abs(r1 - r0), dc = Math.abs(c1 - c0), sr = r0 < r1 ? 1 : -1, sc = c0 < c1 ? 1 : -1; let err = dc - dr;
    for (let k = 0; k < 400; k++) { out.push(r0 * C + c0); if (r0 === r1 && c0 === c1) break; const e2 = 2 * err; if (e2 > -dr) { err -= dr; c0 += sc; } if (e2 < dc) { err += dc; r0 += sr; } }
    return out;
  }
  /** Step the player to the end at once (the Finish button). */
  function finish(p) { p.pause(); for (let k = 0; k < 3e6 && p.step(); k++); }

  // ---------------------------------------------------------------- demo 1: path-finding on a grid
  function mountPathfinding(host, api) {
    injectCss();
    const el = api.el, rm = api.reducedMotion();
    const SIZES = [[15, 25, 'Small (15 × 25)'], [21, 35, 'Medium (21 × 35)'], [31, 51, 'Large (31 × 51)'], [45, 75, 'Huge (45 × 75)']];
    const wide = host.clientWidth || 800;
    let sizeIdx = wide < 560 ? 0 : wide < 900 ? 1 : 2, algo = 'astar', diag = false, tool = 'wall', pattern = 'random';
    let G, st, front, visited, cur, path, phase = 'idle', result = null, best = null;
    const fresh = () => { st = new Uint8Array(G.R * G.C); front = 0; visited = 0; cur = -1; path = []; result = null; best = null; };
    const newGrid = () => { const [R, C] = SIZES[sizeIdx]; G = makeGrid(R, C); fresh(); };
    newGrid();

    const [algoL] = selectBox(el, 'Algorithm', Object.entries(ALGS), algo, (v) => { algo = v; restart(); });
    const diagBox = el('input', { type: 'checkbox', onchange: () => { diag = diagBox.checked; restart(); } });
    const [sizeL] = selectBox(el, 'Size', SIZES.map((s, k) => [String(k), s[2]]), String(sizeIdx), (v) => { sizeIdx = +v; newGrid(); compareBox.textContent = ''; p.reset(); dirty(); });
    const [toolL] = selectBox(el, 'Draw', [['wall', 'Walls'], ['mud', 'Mud (costs ' + MUD + ')'], ['erase', 'Eraser']], tool, (v) => { tool = v; });
    const [patL] = selectBox(el, 'Pattern', [['random', 'Random walls'], ['mud', 'Random walls and mud'], ['backtracker', 'Maze: recursive backtracker'], ['prim', 'Maze: Prim'], ['kruskal', 'Maze: Kruskal'], ['wilson', 'Maze: Wilson'], ['division', 'Maze: recursive division'], ['loops', 'Maze with loops']], pattern, (v) => { pattern = v; });
    host.append(
      el('div', { class: 'algo-controls ap-controls' }, algoL, el('label', {}, diagBox, 'Diagonal moves'), sizeL),
      el('div', { class: 'algo-controls ap-controls' }, toolL, patL,
        el('button', { class: 'btn', onclick: makePattern }, 'Make'),
        el('button', { class: 'btn quiet', onclick: () => { G.wall.fill(0); G.mud.fill(0); edited(true); } }, 'Clear'),
        el('button', { class: 'btn', onclick: compare }, 'Compare all')),
      el('p', { class: 'ap-hint' }, 'Drag on the grid to draw. Drag the green start (S) or the red goal (G) to move them; after a run, the result follows as you drag.'));

    let geo = { ox: 0, oy: 0, cs: 1 };
    const cv = api.canvas(host, { label: 'A grid with walls, a start and a goal, searched by the chosen algorithm', height: (w) => Math.round(w * 0.6), draw });
    const dirty = painter(cv, flushStatus);
    const finishBtn = el('button', { class: 'btn quiet', onclick: () => finish(p) }, 'Finish');
    const p = api.player(host, {
      speeds: rm ? [200, 300000] : [4, 4000], speed: rm ? 100 : 55, extra: [finishBtn],
      start: () => { fresh(); phase = 'running'; return run(); },
      onStep: (ev) => { apply(ev); dirty(); },
      onDone: (r) => { phase = 'done'; result = r; best = bestCost(); dirty(); },
      onReset: () => { fresh(); phase = 'idle'; dirty(); }
    });
    host.append(legend(el, [['background:var(--k-ink);border:2px solid var(--ok)', 'Start'], ['background:var(--k-ink);border:2px solid var(--err)', 'Goal'], ['background:var(--ink)', 'Wall'],
      ['background:var(--warn);opacity:.45', 'Mud (each step in costs ' + MUD + ')'], ['background:var(--k-quiz);opacity:.6', 'Frontier (waiting)'], ['background:var(--k-fig);opacity:.4', 'Explored'], ['background:var(--warn)', 'Path']]));
    const compareBox = el('div', { class: 'ap-compare', 'aria-live': 'polite' });
    host.append(compareBox);

    function* run() { const r = yield* search(gridGraph(G, diag), algo); for (const i of r.path) yield { t: 'path', i }; return r; }
    function apply(ev) {
      const i = ev.i;
      if (ev.t === 'push') { if (!st[i]) { st[i] = 1; front++; } }
      else if (ev.t === 'pop') { if (st[i] === 1) front--; st[i] = 2; visited++; cur = i; }
      else if (ev.t === 'path') { path.push(i); cur = -1; }
    }
    const bestCost = () => runToEnd(search(gridGraph(G, diag), 'dijkstra'));
    function instant() { fresh(); const it = run(); let r; while (!(r = it.next()).done) apply(r.value); result = r.value; best = bestCost(); phase = 'done'; }
    function restart() { compareBox.textContent = ''; if (phase === 'done') instant(); else if (phase !== 'idle') p.reset(); dirty(); }
    function edited(hard) { compareBox.textContent = ''; if (phase === 'done' && !hard) instant(); else if (phase !== 'idle' || hard) { p.reset(); phase = 'idle'; } dirty(); }
    function describe(r) {
      if (!r.found) return `No path: the goal cannot be reached. Explored ${r.visited} cells.`;
      const steps = r.path.length - 1, shortest = best && best.found && Math.abs(r.cost - best.cost) < 1e-6;
      let s = `Explored ${r.visited} cells · path ${steps} steps, cost ${fmt(r.cost)} · `;
      if (shortest) s += 'the cheapest path';
      else s += `not the cheapest (best costs ${fmt(best.cost)})` + (algo === 'bfs' ? ': BFS counts steps, not cost' : '');
      return s;
    }
    function flushStatus() {
      p.status(phase === 'idle' ? `${ALGS[algo]}: press Play.` : phase === 'running' ? `Explored ${visited} · frontier ${front}${path.length ? ' · tracing the path back' : ''}` : result ? describe(result) : '');
    }
    function makePattern() {
      const R = G.R, C = G.C, rnd = A.rng((Math.random() * 1e9) >>> 0);
      G.mud.fill(0);
      if (pattern === 'random' || pattern === 'mud') {
        for (let i = 0; i < R * C; i++) G.wall[i] = rnd() < (pattern === 'mud' ? 0.2 : 0.3) ? 1 : 0;
        if (pattern === 'mud') for (let k = 0; k < 4 + rnd.int(4); k++) {
          const cr = rnd.int(R), cc = rnd.int(C), rad = 2 + rnd.int(Math.max(2, (R / 5) | 0));
          for (let r = cr - rad; r <= cr + rad; r++) for (let c = cc - rad; c <= cc + rad; c++) if (r >= 0 && c >= 0 && r < R && c < C && (r - cr) ** 2 + (c - cc) ** 2 <= rad * rad) { G.mud[r * C + c] = 1; G.wall[r * C + c] = 0; }
        }
      } else {
        const gen = pattern === 'loops' ? 'backtracker' : pattern;
        const M = gridFromMaze(makeMaze(gen, (R - 1) / 2, (C - 1) / 2, rnd.int(1e9) + 1));
        G.wall.set(M.wall); G.start = M.start; G.goal = M.goal;
        if (pattern === 'loops') for (let r = 1; r < R - 1; r++) for (let c = 1; c < C - 1; c++) {
          const i = r * C + c;
          if (G.wall[i] && ((!G.wall[i - 1] && !G.wall[i + 1] && G.wall[i - C] && G.wall[i + C]) || (!G.wall[i - C] && !G.wall[i + C] && G.wall[i - 1] && G.wall[i + 1])) && rnd() < 0.12) G.wall[i] = 0;
        }
      }
      G.wall[G.start] = 0; G.wall[G.goal] = 0; G.mud[G.start] = 0; G.mud[G.goal] = 0;
      edited(true);
    }
    function compare() {
      const g = gridGraph(G, diag), rows = Object.keys(ALGS).map((k) => [k, runToEnd(search(g, k))]), b = runToEnd(search(g, 'dijkstra'));
      const td = (t, cls) => el('td', cls ? { class: cls } : null, t);
      compareBox.textContent = '';
      compareBox.append(el('table', {},
        el('caption', {}, 'All five on this grid' + (diag ? ', with diagonal moves' : '') + '.'),
        el('thead', {}, el('tr', {}, ['Algorithm', 'Explored', 'Steps', 'Cost', 'Cheapest?'].map((h) => el('th', { scope: 'col' }, h)))),
        el('tbody', {}, rows.map(([k, r]) => el('tr', {}, el('th', { scope: 'row' }, ALGS[k]), td(String(r.visited), 'num'),
          td(r.found ? String(r.path.length - 1) : '-', 'num'), td(r.found ? fmt(r.cost) : '-', 'num'),
          r.found ? (Math.abs(r.cost - b.cost) < 1e-6 ? td('yes', 'ap-good') : td('no', 'ap-bad')) : td('no path'))))));
    }

    // drawing on the grid with a mouse, a pen or a finger
    const cvEl = cv.canvas; let drag = null;
    const cellAt = (e) => {
      const rect = cvEl.getBoundingClientRect(), c = Math.floor((e.clientX - rect.left - geo.ox) / geo.cs), r = Math.floor((e.clientY - rect.top - geo.oy) / geo.cs);
      return c < 0 || r < 0 || c >= G.C || r >= G.R ? -1 : r * G.C + c;
    };
    const paint = (i) => {
      if (i === G.start || i === G.goal) return;
      if (drag.val === 'wall') { G.wall[i] = 1; G.mud[i] = 0; } else if (drag.val === 'mud') { G.mud[i] = 1; G.wall[i] = 0; } else { G.wall[i] = 0; G.mud[i] = 0; }
    };
    cvEl.addEventListener('pointerdown', (e) => {
      const i = cellAt(e); if (i < 0) return;
      e.preventDefault(); try { cvEl.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ }
      if (i === G.start) drag = { mode: 'start' }; else if (i === G.goal) drag = { mode: 'goal' };
      else {
        const val = tool === 'erase' ? 'clear' : tool === 'wall' ? (G.wall[i] ? 'clear' : 'wall') : (G.mud[i] ? 'clear' : 'mud');
        drag = { mode: 'paint', val, last: i }; paint(i); edited();
      }
    });
    cvEl.addEventListener('pointermove', (e) => {
      if (!drag) return; const i = cellAt(e); if (i < 0) return;
      if (drag.mode === 'paint') { if (i === drag.last) return; for (const j of lineCells(drag.last, i, G.C)) paint(j); drag.last = i; edited(); return; }
      const key = drag.mode, other = key === 'start' ? G.goal : G.start;
      if (i === G[key] || i === other) return;
      G[key] = i; G.wall[i] = 0; edited();
    });
    const up = (e) => { drag = null; try { cvEl.releasePointerCapture(e.pointerId); } catch (x) { /* ignore */ } };
    cvEl.addEventListener('pointerup', up); cvEl.addEventListener('pointercancel', up);

    function draw(ctx, w, h, c) {
      const R = G.R, C = G.C, n = R * C, cs = Math.min(w / C, h / R), ox = (w - cs * C) / 2, oy = (h - cs * R) / 2;
      geo = { ox, oy, cs };
      const X = (k) => Math.round(ox + k * cs), Y = (k) => Math.round(oy + k * cs);
      const box = (i, inset) => { const r = (i / C) | 0, cc = i % C, d = inset || 0; ctx.fillRect(X(cc) + d, Y(r) + d, X(cc + 1) - X(cc) - 2 * d, Y(r + 1) - Y(r) - 2 * d); };
      const layer = (test, color, alpha) => { ctx.globalAlpha = alpha; ctx.fillStyle = color; for (let i = 0; i < n; i++) if (test(i)) box(i); ctx.globalAlpha = 1; };
      ctx.fillStyle = c.paper; ctx.fillRect(0, 0, w, h);
      layer((i) => G.mud[i], c.warn, 0.3);
      if (cs >= 8) { ctx.fillStyle = c.warn; ctx.globalAlpha = 0.7; const d = Math.max(1, cs * 0.09); for (let i = 0; i < n; i++) if (G.mud[i]) { const r = (i / C) | 0, cc = i % C; ctx.fillRect(ox + (cc + 0.3) * cs - d / 2, oy + (r + 0.35) * cs - d / 2, d, d); ctx.fillRect(ox + (cc + 0.7) * cs - d / 2, oy + (r + 0.65) * cs - d / 2, d, d); } ctx.globalAlpha = 1; }
      layer((i) => st[i] === 2, c.fig, 0.3);
      layer((i) => st[i] === 1, c.quiz, 0.5);
      if (cs >= 7) {
        ctx.strokeStyle = c.rule2; ctx.lineWidth = 1; ctx.beginPath();
        for (let k = 0; k <= C; k++) { ctx.moveTo(X(k) + 0.5, Y(0)); ctx.lineTo(X(k) + 0.5, Y(R)); }
        for (let k = 0; k <= R; k++) { ctx.moveTo(X(0), Y(k) + 0.5); ctx.lineTo(X(C), Y(k) + 0.5); }
        ctx.stroke();
      }
      layer((i) => G.wall[i], c.ink, 1);
      if (cur >= 0 && phase === 'running') { ctx.fillStyle = c.fig; box(cur); }
      if (path.length > 1) {
        ctx.strokeStyle = c.warn; ctx.lineWidth = Math.max(2, cs * 0.34); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath();
        path.forEach((i, k) => { const x = ox + (i % C + 0.5) * cs, y = oy + (((i / C) | 0) + 0.5) * cs; if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
        ctx.stroke();
      }
      for (const [i, col, t] of [[G.start, c.ok, 'S'], [G.goal, c.err, 'G']]) {
        ctx.fillStyle = col; box(i, cs >= 10 ? 1 : 0);
        if (cs >= 13) { ctx.fillStyle = c.paper; ctx.font = `600 ${Math.round(cs * 0.6)}px ${c.sans}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, ox + (i % C + 0.5) * cs, oy + (((i / C) | 0) + 0.55) * cs); }
      }
    }
    makePattern();   // open on the pattern the menu shows (random walls), not an empty grid with a straight-line answer
    return () => { p.stop(); cv.stop(); dirty.cancel(); };
  }

  // ---------------------------------------------------------------- demo 2: maze generation and solving
  function mountMaze(host, api) {
    injectCss();
    const el = api.el, rm = api.reducedMotion();
    const SIZES = [[10, 16, 'Small (10 × 16)'], [16, 26, 'Medium (16 × 26)'], [24, 40, 'Large (24 × 40)'], [36, 60, 'Huge (36 × 60)']];
    const wide = host.clientWidth || 800;
    let sizeIdx = wide < 560 ? 0 : wide < 900 ? 1 : 2, gen = 'backtracker', solver = 'deadend', seed = 1 + Math.floor(Math.random() * 99999);
    let m, built = false, phase = 'idle', inn, mark, cur, room, up, carved, walls, deadEnds = 0;
    let sst, trail, filled, path, scur, svisited, sfront, result = null, solving = false;
    const findUp = (x) => { while (up[x] !== x) { up[x] = up[up[x]]; x = up[x]; } return x; };
    function blank() {
      const [R, C] = SIZES[sizeIdx], open = !!MAZE_GENS[gen].open; m = newMaze(R, C, open);
      inn = new Uint8Array(m.n).fill(open ? 1 : 0); mark = new Uint8Array(m.n); cur = -1; room = null; carved = open ? m.n : 0; walls = 0;
      up = new Int32Array(m.n).map((_, i) => i); built = false;
    }
    function clearSolve() { sst = new Uint8Array(m.n); trail = new Uint16Array(m.n); filled = new Uint8Array(m.n); path = []; scur = -1; svisited = 0; sfront = 0; result = null; solving = false; }
    blank(); clearSolve();

    const [genL] = selectBox(el, 'Generator', Object.entries(MAZE_GENS).map(([k, g]) => [k, g.name]), gen, (v) => { gen = v; unbuild(); });
    const [sizeL] = selectBox(el, 'Size', SIZES.map((s, k) => [String(k), s[2]]), String(sizeIdx), (v) => { sizeIdx = +v; unbuild(); });
    const seedIn = el('input', { type: 'number', min: 1, max: 999999, step: 1, value: seed, class: 'ap-seed', onchange: () => { const v = parseInt(seedIn.value, 10); if (v >= 1 && v <= 999999) { seed = v; unbuild(); } else seedIn.value = seed; } });
    const [solL] = selectBox(el, 'Solver', [...Object.entries(SOLVERS), ['none', "Don't solve"]], solver, (v) => { solver = v; p.reset(); dirty(); });
    host.append(el('div', { class: 'algo-controls ap-controls' }, genL, sizeL, el('label', {}, 'Seed', seedIn),
      el('button', { class: 'btn', onclick: () => { seed = 1 + Math.floor(Math.random() * 999999); seedIn.value = seed; unbuild(); p.play(); } }, 'New maze')),
    el('div', { class: 'algo-controls ap-controls' }, solL));
    function unbuild() { built = false; p.reset(); dirty(); }

    let geo = { ox: 0, oy: 0, cs: 1 };
    const cv = api.canvas(host, { label: 'A maze being carved and then solved', height: (w) => Math.round(w * 0.6), draw });
    const dirty = painter(cv, flushStatus);
    const p = api.player(host, {
      speeds: rm ? [500, 300000] : [5, 20000], speed: rm ? 100 : 50, extra: [el('button', { class: 'btn quiet', onclick: () => finish(p) }, 'Finish')],
      start: () => { phase = 'running'; return run(); },
      onStep: (ev) => { apply(ev); dirty(); },
      onDone: (r) => { phase = 'done'; result = r || null; dirty(); },
      onReset: () => { if (!built) blank(); clearSolve(); phase = 'idle'; dirty(); }
    });
    host.append(legend(el, [['background:var(--rule-2);border:1px solid var(--rule)', 'Not carved yet'], ['background:var(--k-quiz);opacity:.45', 'Frontier, or the current walk'], ['background:var(--k-fig);opacity:.4', 'Stack, or explored by the solver'],
      ['background:var(--err);opacity:.3', 'Filled dead end'], ['background:var(--warn)', 'Path']]));

    function* run() {
      if (!built) {
        blank(); clearSolve();
        yield* MAZE_GENS[gen].run(m, A.rng(seed));
        built = true; mark.fill(0); cur = -1; room = null;
        deadEnds = 0; for (let i = 0; i < m.n; i++) if (openNbrs(m, i).length === 1) deadEnds++;
        yield { t: 'built' };
      }
      clearSolve();
      if (solver === 'none') return null;
      solving = true;
      const r = yield* mazeSolve(m, solver);
      scur = -1;
      for (const i of r.path) yield { t: 'path', i };
      return r;
    }
    function apply(ev) {
      const t = ev.t, i = ev.i;
      if (t === 'in') { if (!inn[i]) { inn[i] = 1; carved++; } }
      else if (t === 'carve') {
        for (const x of [ev.a, ev.b]) { if (!inn[x]) { inn[x] = 1; carved++; } if (ev.k != null) mark[x] = ev.k; }
        const ra = findUp(ev.a), rb = findUp(ev.b); if (ra !== rb) up[rb] = ra;
        cur = ev.b;
      } else if (t === 'mark') { mark[i] = ev.k; if ('cur' in ev) cur = ev.cur; }
      else if (t === 'cur') cur = i;
      else if (t === 'wall') { walls++; cur = ev.a; }
      else if (t === 'room') room = ev;
      else if (t === 'push') { if (!sst[i]) { sst[i] = 1; sfront++; } }
      else if (t === 'pop') { if (sst[i] === 1) sfront--; sst[i] = 2; svisited++; scur = i; }
      else if (t === 'walk') { if (!trail[i]) svisited++; if (trail[i] < 60000) trail[i]++; scur = i; }
      else if (t === 'fill') { filled[i] = 1; svisited++; scur = i; }
      else if (t === 'path') { path.push(i); }
    }
    function flushStatus() {
      const n = m.n, [R, C] = SIZES[sizeIdx], g = MAZE_GENS[gen].name;
      let s;
      if (!built) s = phase === 'idle' ? `Seed ${seed}: press Play to make a ${R} × ${C} maze with ${g}.` : gen === 'division' ? `${g}: ${walls} wall pieces built` : `${g}: ${carved} of ${n} cells carved`;
      else {
        s = `${n} cells · ${n - 1} passages · ${deadEnds} dead ends`;
        if (solving && phase !== 'done') s += ` · ${SOLVERS[solver]}: ${solver === 'deadend' ? 'filled' : 'explored'} ${svisited}`;
        if (phase === 'done' && result) {
          s += result.found ? ` · path ${result.path.length} cells; ${solver === 'deadend' ? 'filled' : 'explored'} ${svisited} cells (${Math.round(100 * svisited / n)}%)` : ' · no path found';
          if (solver === 'wall' && result.steps != null) s += `, walked ${result.steps} steps`;
        }
      }
      p.status(s);
    }
    function draw(ctx, w, h, c) {
      const R = m.R, C = m.C, n = m.n, cs = Math.min((w - 8) / C, (h - 8) / R), ox = (w - cs * C) / 2, oy = (h - cs * R) / 2;
      geo = { ox, oy, cs };
      const X = (k) => Math.round(ox + k * cs), Y = (k) => Math.round(oy + k * cs);
      const box = (i) => { const r = (i / C) | 0, cc = i % C; ctx.fillRect(X(cc), Y(r), X(cc + 1) - X(cc), Y(r + 1) - Y(r)); };
      const layer = (test, color, alpha) => { ctx.globalAlpha = alpha; ctx.fillStyle = color; for (let i = 0; i < n; i++) if (test(i)) box(i); ctx.globalAlpha = 1; };
      ctx.fillStyle = c.paper; ctx.fillRect(0, 0, w, h);
      layer((i) => !inn[i], c.rule2, 1);
      if (gen === 'kruskal' && !built) {
        ctx.globalAlpha = 0.32;
        for (let i = 0; i < n; i++) if (inn[i]) { const root = findUp(i); ctx.fillStyle = `hsl(${Math.round((root * 137.508) % 360)}, 60%, 55%)`; box(i); }
        ctx.globalAlpha = 1;
      }
      layer((i) => mark[i] === 1, c.quiz, 0.35);
      layer((i) => mark[i] === 2, c.fig, 0.35);
      layer((i) => mark[i] === 3, c.quiz, 0.5);
      if (room && !built) { ctx.globalAlpha = 0.12; ctx.fillStyle = c.quiz; ctx.fillRect(X(room.x), Y(room.y), X(room.x + room.w) - X(room.x), Y(room.y + room.h) - Y(room.y)); ctx.globalAlpha = 1; }
      layer((i) => filled[i], c.err, 0.2);
      layer((i) => sst[i] === 2, c.fig, 0.3);
      layer((i) => sst[i] === 1, c.quiz, 0.5);
      for (let i = 0; i < n; i++) if (trail[i]) { ctx.globalAlpha = Math.min(0.6, 0.25 * trail[i]); ctx.fillStyle = c.fig; box(i); }
      ctx.globalAlpha = 1;
      if (!built && cur >= 0) { ctx.fillStyle = c.quiz; box(cur); }
      if (scur >= 0 && phase === 'running') { ctx.fillStyle = c.fig; box(scur); }
      // start and goal
      ctx.globalAlpha = 0.85; ctx.fillStyle = c.ok; box(0); ctx.fillStyle = c.err; box(n - 1); ctx.globalAlpha = 1;
      if (path.length > 1) {
        ctx.strokeStyle = c.warn; ctx.lineWidth = Math.max(2, cs * 0.3); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath();
        path.forEach((i, k) => { const x = ox + (i % C + 0.5) * cs, y = oy + (((i / C) | 0) + 0.5) * cs; if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
        ctx.stroke();
      }
      // walls
      ctx.strokeStyle = c.ink; ctx.lineWidth = Math.max(1, Math.min(4, cs * 0.12)); ctx.lineCap = 'square'; ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const r = (i / C) | 0, cc = i % C;
        if (cc < C - 1 && !m.e[i]) { ctx.moveTo(X(cc + 1), Y(r)); ctx.lineTo(X(cc + 1), Y(r + 1)); }
        if (r < R - 1 && !m.s[i]) { ctx.moveTo(X(cc), Y(r + 1)); ctx.lineTo(X(cc + 1), Y(r + 1)); }
      }
      ctx.moveTo(X(0), Y(1)); ctx.lineTo(X(0), Y(R)); ctx.lineTo(X(C), Y(R));          // the outside, open at the start's left and the goal's right
      ctx.moveTo(X(C), Y(R - 1)); ctx.lineTo(X(C), Y(0)); ctx.lineTo(X(0), Y(0));
      ctx.stroke();
    }
    return () => { p.stop(); cv.stop(); dirty.cancel(); };
  }

  // ---------------------------------------------------------------- demo: the maze race
  /** Open some extra walls of a perfect maze, so that it has loops: about frac of the closed inner walls, chosen by rnd. */
  function addLoops(m, rnd, frac) {
    for (let i = 0; i < m.n; i++) {
      if (i % m.C < m.C - 1 && !m.e[i] && rnd() < frac) m.e[i] = 1;
      if (i < m.n - m.C && !m.s[i] && rnd() < frac) m.s[i] = 1;
    }
    return m;
  }
  // A race step is one cell explored (a pop), walked or filled; pushes onto the frontier come free with the pop that made them.
  const RACE_STEP = { pop: 1, walk: 1, fill: 1 };
  /** Race solvers on one maze, one step each per tick, as the demo does. → [{ solver, steps, found, pathLen, place }] (pure, for tests). */
  function runMazeRace(m, solvers) {
    const lanes = solvers.map((s) => ({ solver: s, it: mazeSolve(m, s), steps: 0, done: false, result: null, at: 0, place: 0 }));
    let tick = 0, finished = 0, lastAt = -1, lastPlace = 0;
    while (lanes.some((l) => !l.done) && tick < 50 * m.n + 100) {
      tick++;
      for (const l of lanes) {
        if (l.done) continue;
        for (;;) {
          const r = l.it.next();
          if (r.done) { l.done = true; l.result = r.value; finished++; l.at = tick; l.place = tick === lastAt ? lastPlace : finished; lastAt = tick; lastPlace = l.place; break; }
          if (RACE_STEP[r.value.t]) { l.steps++; break; }
        }
      }
    }
    return lanes.map((l) => ({ solver: l.solver, steps: l.steps, found: !!(l.result && l.result.found), pathLen: l.result && l.result.found ? l.result.path.length : 0, place: l.place }));
  }
  const MEDALS = ['1st', '2nd', '3rd', '4th'];
  function mountMazeRace(host, api) {
    injectCss();
    const el = api.el, rm = api.reducedMotion();
    const SIZES = [[8, 12, 'Small (8 × 12)'], [12, 18, 'Medium (12 × 18)'], [18, 28, 'Large (18 × 28)']];
    const picks = ['bfs', 'dfs', 'astar', 'wall'];
    let sizeIdx = (host.clientWidth || 800) < 600 ? 0 : 1, gen = 'backtracker', loops = false, seed = 1 + Math.floor(Math.random() * 99999), bet = '';
    let m = null, lanes = [], tick = 0;
    function buildMaze() { const [R, C] = SIZES[sizeIdx]; m = makeMaze(gen, R, C, seed); if (loops) addLoops(m, A.rng(seed + 7), 0.1); }
    function buildLanes() {
      tick = 0;
      lanes = picks.map((s) => ({ solver: s, it: null, steps: 0, done: false, result: null, place: 0, sst: new Uint8Array(m.n), trail: new Uint16Array(m.n), filled: new Uint8Array(m.n), path: [], cur: -1 }));
    }
    buildMaze(); buildLanes();
    const solverOpts = Object.entries(SOLVERS);
    const laneSel = picks.map((pk, k) => selectBox(el, 'Lane ' + (k + 1), solverOpts, pk, (v) => { picks[k] = v; betOptions(); p.reset(); }));
    const [sizeL] = selectBox(el, 'Size', SIZES.map((s2, k) => [String(k), s2[2]]), String(sizeIdx), (v) => { sizeIdx = +v; fresh(); });
    const [genL] = selectBox(el, 'Maze', Object.entries(MAZE_GENS).map(([k, g]) => [k, g.name]), gen, (v) => { gen = v; fresh(); });
    const loopBox = el('input', { type: 'checkbox', onchange: () => { loops = loopBox.checked; fresh(); } });
    const betSel = el('select', { 'aria-label': 'Your bet', onchange: () => { bet = betSel.value; } });
    function betOptions() {
      const keep = bet; betSel.replaceChildren(el('option', { value: '' }, 'no bet'), ...picks.map((s2, k) => el('option', { value: String(k) }, 'Lane ' + (k + 1) + ': ' + SOLVERS[s2])));
      betSel.value = keep && +keep < picks.length ? keep : ''; bet = betSel.value;
    }
    betOptions();
    host.append(el('div', { class: 'algo-controls ap-controls' }, laneSel.map((x) => x[0])),
      el('div', { class: 'algo-controls ap-controls' }, genL, sizeL, el('label', {}, loopBox, 'Add loops'),
        el('button', { class: 'btn', onclick: () => { seed = 1 + Math.floor(Math.random() * 999999); fresh(); } }, 'New maze'),
        el('label', {}, 'Who will win? ', betSel)));
    function fresh() { buildMaze(); p.reset(); }

    const cols = () => ((host.clientWidth || 800) < 560 ? 1 : 2);
    const cv = api.canvas(host, { label: 'Four maze solvers racing through copies of the same maze', maxWidth: 1100,
      height: (w) => { const c2 = w < 560 ? 1 : 2, rows = Math.ceil(4 / c2), cellW = w / c2, [R, C] = SIZES[sizeIdx]; return Math.round(rows * (cellW * R / C + 26)); },
      draw: (ctx, w, h, c) => {
        ctx.fillStyle = c.paper; ctx.fillRect(0, 0, w, h);
        const c2 = cols(), rows = Math.ceil(lanes.length / c2), lw = w / c2, lh = h / rows;
        lanes.forEach((ln, k) => drawLane(ctx, (k % c2) * lw, Math.floor(k / c2) * lh, lw, lh, ln, c));
      } });
    const dirty = painter(cv);
    const p = api.player(host, {
      speeds: rm ? [200, 20000] : [3, 4000], speed: 45, extra: [el('button', { class: 'btn quiet', onclick: () => finish(p) }, 'Finish')],
      start: () => { buildLanes(); for (const l of lanes) l.it = mazeSolve(m, l.solver); return race(); },
      onStep: () => dirty(),
      onDone: () => {
        const order = lanes.slice().sort((x, y) => x.place - y.place);
        let msg = 'Finished: ' + order.map((l) => MEDALS[l.place - 1] + ' ' + SOLVERS[l.solver] + ' (' + l.steps + ' steps' + (l.result && l.result.found ? ', path ' + l.result.path.length : ', no path') + ')').join(', ') + '.';
        if (bet !== '') { const b = lanes[+bet]; msg = (b && b.place === 1 ? 'Your bet won! ' : 'Your bet came ' + (b ? MEDALS[b.place - 1] : '?') + '. ') + msg; }
        p.status(msg); dirty();
      },
      onReset: () => { buildLanes(); p.status('Make your bet, then press Play.'); dirty(); }
    });
    host.append(legend(el, [['background:var(--k-quiz);opacity:.5', 'Frontier (waiting to be explored)'], ['background:var(--k-fig);opacity:.35', 'Explored or walked'],
      ['background:var(--err);opacity:.3', 'Filled dead end'], ['background:var(--warn)', 'The path found']]));
    let lastAt = -1, lastPlace = 0, finished = 0;
    function* race() {
      lastAt = -1; lastPlace = 0; finished = 0;
      while (lanes.some((l) => !l.done)) {
        tick++;
        for (const l of lanes) {
          if (l.done) continue;
          for (;;) {
            const r = l.it.next();
            if (r.done) {
              l.done = true; l.result = r.value; l.path = r.value && r.value.found ? r.value.path : []; l.cur = -1;
              finished++; l.place = tick === lastAt ? lastPlace : finished; lastAt = tick; lastPlace = l.place; break;
            }
            const ev = r.value, i = ev.i;
            if (ev.t === 'push') { if (!l.sst[i]) l.sst[i] = 1; }
            else if (ev.t === 'pop') { l.sst[i] = 2; l.cur = i; }
            else if (ev.t === 'walk') { if (l.trail[i] < 60000) l.trail[i]++; l.cur = i; }
            else if (ev.t === 'fill') { l.filled[i] = 1; l.cur = i; }
            if (RACE_STEP[ev.t]) { l.steps++; break; }
          }
        }
        yield tick;
      }
    }
    function drawLane(ctx, x0, y0, lw, lh, ln, c) {
      const R = m.R, C = m.C, n = m.n, top = 22, cs = Math.min((lw - 12) / C, (lh - top - 6) / R), ox = x0 + (lw - cs * C) / 2, oy = y0 + top;
      const X = (k) => Math.round(ox + k * cs), Y = (k) => Math.round(oy + k * cs);
      const box = (i) => { const r = (i / C) | 0, cc = i % C; ctx.fillRect(X(cc), Y(r), X(cc + 1) - X(cc), Y(r + 1) - Y(r)); };
      ctx.font = '600 13px ' + (c.sans || 'sans-serif'); ctx.textBaseline = 'top'; ctx.textAlign = 'left';
      ctx.fillStyle = ln.place === 1 ? c.ok : c.ink;
      ctx.fillText(SOLVERS[ln.solver], x0 + 8, y0 + 4);
      ctx.textAlign = 'right'; ctx.fillStyle = ln.done ? c.ok : c.ink2;
      ctx.fillText(ln.steps + ' steps' + (ln.done ? ' · ' + MEDALS[ln.place - 1] + (ln.result && ln.result.found ? '' : ' (stuck)') : ''), x0 + lw - 8, y0 + 4);
      ctx.textAlign = 'left';
      for (let i = 0; i < n; i++) {
        if (ln.filled[i]) { ctx.globalAlpha = 0.3; ctx.fillStyle = c.err; box(i); }
        else if (ln.sst[i] === 2) { ctx.globalAlpha = 0.35; ctx.fillStyle = c.fig; box(i); }
        else if (ln.sst[i] === 1) { ctx.globalAlpha = 0.5; ctx.fillStyle = c.quiz; box(i); }
        if (ln.trail[i]) { ctx.globalAlpha = Math.min(0.6, 0.22 * ln.trail[i]); ctx.fillStyle = c.fig; box(i); }
      }
      ctx.globalAlpha = 1;
      if (ln.cur >= 0) { ctx.fillStyle = c.fig; box(ln.cur); }
      ctx.globalAlpha = 0.85; ctx.fillStyle = c.ok; box(0); ctx.fillStyle = c.err; box(n - 1); ctx.globalAlpha = 1;
      if (ln.path.length > 1) {
        ctx.strokeStyle = c.warn; ctx.lineWidth = Math.max(2, cs * 0.3); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath();
        ln.path.forEach((i, k) => { const x = ox + (i % C + 0.5) * cs, y = oy + (((i / C) | 0) + 0.5) * cs; if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
        ctx.stroke();
      }
      ctx.strokeStyle = c.ink; ctx.lineWidth = Math.max(1, Math.min(3, cs * 0.12)); ctx.lineCap = 'square'; ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const r = (i / C) | 0, cc = i % C;
        if (cc < C - 1 && !m.e[i]) { ctx.moveTo(X(cc + 1), Y(r)); ctx.lineTo(X(cc + 1), Y(r + 1)); }
        if (r < R - 1 && !m.s[i]) { ctx.moveTo(X(cc), Y(r + 1)); ctx.lineTo(X(cc + 1), Y(r + 1)); }
      }
      ctx.moveTo(X(0), Y(1)); ctx.lineTo(X(0), Y(R)); ctx.lineTo(X(C), Y(R));
      ctx.moveTo(X(C), Y(R - 1)); ctx.lineTo(X(C), Y(0)); ctx.lineTo(X(0), Y(0));
      ctx.stroke();
    }
    p.status('Who will win? Make your bet, then press Play.');
    return () => { p.stop(); cv.stop(); dirty.cancel(); };
  }

  // ---------------------------------------------------------------- demo 3: BFS and DFS on a small graph
  function mountGraph(host, api) {
    injectCss();
    const el = api.el;
    let preset = 'loops', algo = 'bfs', G = buildGraph(PRESETS[preset]), start = 0, snap = null;
    const [presetL] = selectBox(el, 'Graph', Object.entries(PRESETS).map(([k, P]) => [k, P.name]), preset, (v) => { preset = v; G = buildGraph(PRESETS[v]); start = 0; fillStarts(); p.reset(); });
    const [startL, startSel] = selectBox(el, 'Start', [], '0', (v) => { start = +v; p.reset(); });
    const fillStarts = () => { startSel.textContent = ''; G.labels.forEach((l, i) => startSel.append(el('option', { value: String(i) }, l))); startSel.value = String(start); };
    fillStarts();
    const [algoL] = selectBox(el, 'Algorithm', Object.entries(TRAVERSALS), algo, (v) => { algo = v; p.reset(); });
    host.append(el('div', { class: 'algo-controls ap-controls' }, presetL, startL, algoL),
      el('p', { class: 'ap-hint' }, 'Click a vertex (or choose it above) to start from there. Neighbours are always read in alphabetical order.'));
    const wrap = el('div', { class: 'ap-graph' }), left = el('div'), side = el('div', { class: 'ap-side' });
    wrap.append(left, side); host.append(wrap);
    const boxTitle = el('p', { class: 'ap-side-title' }), strip = el('div', { class: 'ap-strip' }), say = el('p', { class: 'ap-say', 'aria-live': 'polite' }), order = el('p', { class: 'ap-order' });
    side.append(boxTitle, strip, say, order);

    let geo = null;
    const cv = api.canvas(left, { label: 'A graph of lettered vertices joined by edges, being traversed', height: (w) => Math.round(Math.min(460, Math.max(250, w * 0.62))), draw });
    const dirty = painter(cv);
    const p = api.player(host, {
      speeds: [0.4, 25], speed: 40,
      start: () => graphTraverse(G, start, algo),
      onStep: (s) => { snap = s; side_(); dirty(); },
      onDone: () => { p.status(`Done: ${snap ? snap.order.length : 0} of ${G.n} vertices visited.`); },
      onReset: () => { snap = null; side_(); dirty(); }
    });
    host.append(legend(el, [['background:var(--paper);border:1px solid var(--ink-3)', 'Not reached'], ['background:var(--k-quiz);opacity:.5', 'In the queue or stack (or a call still running)'],
      ['background:var(--k-fig)', 'Visited and finished'], ['background:var(--k-fig);height:.25rem', 'Tree edge'], ['background:var(--warn);height:.25rem', 'Edge being looked at']]));
    function side_() {
      boxTitle.textContent = BOX[algo];
      strip.textContent = '';
      const items = snap ? snap.strip : [];
      if (!items.length) strip.append(el('span', { class: 'ap-empty' }, snap ? 'empty' : 'press Play or Step'));
      items.forEach((it, k) => strip.append(el('span', { class: 'ap-chip' + (k === 0 ? ' next' : '') + (it.stale ? ' stale' : '') }, it.text)));
      say.textContent = snap ? snap.say : `Start at ${G.labels[start]}.`;
      order.textContent = 'Visit order: ' + (snap && snap.order.length ? snap.order.map((v) => G.labels[v]).join(' ') : '(none yet)');
      if (snap) p.status(`Visited ${snap.order.length} of ${G.n}`); else p.status('');
    }
    side_();

    const radius = (w) => Math.max(11, Math.min(18, w * 0.028));
    const xy = (i, w, h) => { const r = radius(w), pad = r + 16; return [pad + G.pos[i][0] * (w - 2 * pad), pad + G.pos[i][1] * (h - 2 * pad)]; };
    cv.canvas.addEventListener('pointerdown', (e) => {
      if (!geo) return;
      const rect = cv.canvas.getBoundingClientRect(), x = e.clientX - rect.left, y = e.clientY - rect.top;
      let best = -1, bd = Infinity;
      for (let i = 0; i < G.n; i++) { const [px, py] = xy(i, geo.w, geo.h), d = Math.hypot(px - x, py - y); if (d < bd) { bd = d; best = i; } }
      if (best >= 0 && bd < radius(geo.w) * 1.8) { start = best; startSel.value = String(best); p.reset(); }
    });
    function draw(ctx, w, h, c) {
      geo = { w, h };
      const r = radius(w), S = snap, weights = algo === 'dijkstra';
      ctx.fillStyle = c.paper; ctx.fillRect(0, 0, w, h);
      const isTree = (a, b) => S && ((S.parent[b] === a && S.state[b] > 0) || (S.parent[a] === b && S.state[a] > 0));
      const tentative = (a, b) => algo === 'dijkstra' && S && ((S.parent[b] === a && S.state[b] === 1) || (S.parent[a] === b && S.state[a] === 1));
      for (const [a, b] of G.edges) {
        const [x1, y1] = xy(a, w, h), [x2, y2] = xy(b, w, h);
        const look = S && S.edge && ((S.edge[0] === a && S.edge[1] === b) || (S.edge[0] === b && S.edge[1] === a));
        ctx.setLineDash(tentative(a, b) ? [6, 5] : []);
        ctx.strokeStyle = look ? c.warn : isTree(a, b) ? c.fig : c.ink3; ctx.lineWidth = look || isTree(a, b) ? 4.5 : 1.5;
        ctx.globalAlpha = look || isTree(a, b) ? 1 : 0.7;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }
      ctx.setLineDash([]); ctx.globalAlpha = 1;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (weights) for (const [a, b, wt] of G.edges) {
        const [x1, y1] = xy(a, w, h), [x2, y2] = xy(b, w, h), mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        ctx.fillStyle = c.paper; ctx.fillRect(mx - 8, my - 8, 16, 16);
        ctx.fillStyle = c.ink2; ctx.font = `600 12px ${c.sans}`; ctx.fillText(String(wt), mx, my + 0.5);
      }
      for (let i = 0; i < G.n; i++) {
        const [x, y] = xy(i, w, h), st = S ? S.state[i] : 0;
        if (i === start) { ctx.strokeStyle = c.ok; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, r + 4, 0, 2 * Math.PI); ctx.stroke(); }
        if (S && S.cur === i) { ctx.strokeStyle = c.warn; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(x, y, r + (i === start ? 8 : 4), 0, 2 * Math.PI); ctx.stroke(); }
        ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = c.paper; ctx.fill();
        if (st === 1) { ctx.globalAlpha = 0.4; ctx.fillStyle = c.quiz; ctx.fill(); ctx.globalAlpha = 1; }
        if (st === 2) { ctx.fillStyle = c.fig; ctx.fill(); }
        ctx.strokeStyle = st === 1 ? c.quiz : st === 2 ? c.fig : c.ink3; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = st === 2 ? c.paper : c.ink; ctx.font = `600 ${Math.round(r * 0.95)}px ${c.sans}`; ctx.fillText(G.labels[i], x, y + 1);
        if (S) {
          const k = S.order.indexOf(i);
          if (k >= 0) { const bx = x + r * 0.9, by = y - r * 0.9; ctx.fillStyle = c.ink; ctx.beginPath(); ctx.arc(bx, by, 8, 0, 2 * Math.PI); ctx.fill(); ctx.fillStyle = c.paper; ctx.font = `600 10px ${c.sans}`; ctx.fillText(String(k + 1), bx, by + 0.5); }
          if ((algo === 'bfs' || algo === 'dijkstra') && S.dist[i] !== Infinity) { ctx.fillStyle = c.ink2; ctx.font = `12px ${c.sans}`; ctx.fillText('d=' + S.dist[i], x, y + r + 11); }
        }
      }
    }
    return () => { p.stop(); cv.stop(); dirty.cancel(); };
  }

  // ================================================================== registration
  A.register({
    id: 'pathfinding', group: 'Paths and graphs', title: 'Path-finding on a grid',
    blurb: 'Draw walls and mud, then watch breadth-first search, depth-first search, Dijkstra, A* and greedy best-first search look for the goal. Compare how much each explores and whether its path is the cheapest.',
    mount: mountPathfinding,
    about: `<h2>One loop, five rules for choosing</h2>
<p>All five algorithms keep a <em>frontier</em>: the cells they have found but not yet explored (purple). Each step takes one cell out of the frontier, explores it (teal), and adds its unexplored neighbours. They differ only in <em>which</em> frontier cell comes out next, that is, in the data structure that holds the frontier.</p>
<ul>
<li><b>Breadth-first search</b> takes the oldest cell: the frontier is a <em>queue</em>. It explores in rings of equal step count around the start, so the first path it finds to the goal has the fewest possible steps. It ignores mud: fewest steps is not the same as cheapest when steps cost different amounts.</li>
<li><b>Depth-first search</b> takes the newest cell: the frontier is a <em>stack</em>. It runs down one corridor until it is stuck, then backs up to the last cell with an untried neighbour. It finds a path whenever one exists, but often a long, winding one; it promises nothing about length.</li>
<li><b>Dijkstra's algorithm</b> takes the cell with the smallest total cost from the start: the frontier is a <em>priority queue</em>. When every step costs zero or more, a cell's cost is final the moment it comes out, so the path it finds is the cheapest. Without mud and diagonals it explores in the same rings as BFS.</li>
<li><b>A*</b> takes the cell with the smallest <i>g</i> + <i>h</i>, where <i>g</i> is the cost so far and <i>h</i> is an estimate of the cost still to go. Here <i>h</i> is the Manhattan distance (rows apart plus columns apart) or, with diagonal moves, the octile distance (diagonal steps of cost √2, then straight ones). Neither ever overestimates, because every step costs at least 1 and mud only adds; an estimate like that is called <em>admissible</em>, and with it A* still returns a cheapest path. It explores fewer cells than Dijkstra because it leans toward the goal; with <i>h</i> = 0 it <em>is</em> Dijkstra.</li>
<li><b>Greedy best-first search</b> uses the estimate alone. In open country it heads straight for the goal and explores very little, but a wall in the way can lure it into a pocket, and mud does not slow it down: its path is often not the cheapest.</li>
</ul>
<p>A diagonal move costs √2 ≈ 1.41 times the cost of the cell it enters, and may not squeeze between two walls that touch at a corner.</p>
<h2>What they cost</h2>
<p>With <i>V</i> cells and <i>E</i> moves between them (at most 4<i>V</i>, or 8<i>V</i> with diagonals), BFS and DFS take time proportional to <i>V</i> + <i>E</i>: each cell enters and leaves the frontier a bounded number of times. Dijkstra and A* with a binary heap take time proportional to (<i>V</i> + <i>E</i>) log <i>V</i>, the log for the heap. A* has the same worst case as Dijkstra; how much it saves depends on how good the estimate is. The <b>Compare all</b> button runs the five on the same grid.</p>
<h2>Where they are used</h2>
<ul>
<li>Edward F. Moore published breadth-first search in 1959 as a way to find the shortest path through a maze. Edsger Dijkstra designed his algorithm in 1956, by his own account in about twenty minutes at a café in Amsterdam, and published it in 1959.</li>
<li>The internet's link-state routing protocols, OSPF and IS-IS, have every router run Dijkstra's algorithm ("shortest path first") over a map of the network's links.</li>
<li>A* was published in 1968 by Peter Hart, Nils Nilsson and Bertram Raphael at the Stanford Research Institute, for the Shakey robot. It is still the standard way characters in video games find their way across a map.</li>
<li>Map and satnav route planners build on Dijkstra and A*, adding preprocessing (such as contraction hierarchies) so that a route across a continent's road network takes milliseconds.</li>
</ul>`,
    taught: [{ href: '#/math/6', text: 'SC 104, Graphs and paths (BFS and its proof)' }, { href: '#/dsa/7', text: 'SC 107, Stacks and queues' }]
  });

  A.register({
    id: 'maze', group: 'Mazes', title: 'Maze generator and solver',
    blurb: 'Carve a maze with seven different algorithms (backtracker, Prim, Kruskal, Wilson, Aldous-Broder, recursive division, sidewinder), then solve it six ways, from BFS to following the wall with your right hand.',
    mount: mountMaze,
    about: `<h2>A perfect maze is a tree</h2>
<p>Think of each cell as a vertex and each opening between two cells as an edge. A <em>perfect</em> maze has exactly one route between any two cells: no loops and no unreachable corners. In graph language that is a <em>spanning tree</em> of the grid, so a perfect maze of <i>n</i> cells always has exactly <i>n</i> − 1 passages. Every generator here makes one, and each tries the same idea differently: open walls without ever closing a loop or leaving a cell out. They leave different textures, which you can see and which the status line measures by counting dead ends.</p>
<ul>
<li><b>Recursive backtracker</b> (a randomized depth-first search). Walk to a random unvisited neighbour, carving as you go, and back up along the stack (teal) when stuck. Long winding corridors and relatively few dead ends.</li>
<li><b>Randomized Prim</b>. Grow the maze from one cell: repeatedly pick a random cell on the frontier (purple) and join it to a neighbour already in the maze. Many short dead ends that radiate from the start. Prim published the minimum spanning tree algorithm in 1957 (Jarník had found it in 1930); giving every wall a random weight turns it into a maze generator.</li>
<li><b>Randomized Kruskal</b>. Visit the walls in random order and open a wall when the cells on its two sides are not yet connected. Each coloured region is one connected piece; a union-find structure answers "already connected?" almost instantly. Kruskal published it in 1956.</li>
<li><b>Wilson's algorithm</b> (1996). From a cell not yet in the maze, take a random walk (purple), erasing every loop the walk makes, until it hits the maze; then carve the walk. Slow to start, quicker as the maze grows. It picks each possible perfect maze with exactly equal probability: a <em>uniform spanning tree</em>.</li>
<li><b>Aldous-Broder</b>. Wander at random; whenever you step into a cell for the first time, open the wall you came through. Also uniform (found independently by David Aldous and Andrei Broder around 1990), but it can take a very long time to visit the last few cells: use Finish.</li>
<li><b>Recursive division</b>. Start with no inner walls. Split the room with a wall that has one gap, then divide each half the same way. Long straight walls and a boxy look.</li>
<li><b>Sidewinder</b>. Work row by row: carve east for a random run of cells, then open one passage north from a random cell of the run. The top row is one long corridor, and every cell has a route north with no backtracking, so it is easy to solve from the bottom up.</li>
</ul>
<h2>Six ways out</h2>
<p>Every solver runs from the green cell at the top left to the red cell at the bottom right. In a perfect maze there is exactly one path, so all of them find the same one; what differs is how much they look at first.</p>
<ul>
<li><b>BFS</b> floods outward in rings; <b>DFS</b> follows one corridor to its end before trying another; <b>A*</b> and <b>greedy best-first</b> prefer cells closer to the goal, which helps far less in a maze than in the open, because the way out often leads away from the goal first.</li>
<li><b>The wall follower</b> keeps its right hand on the wall: turn right if you can, else go straight, else left, else back. It needs no map and no memory, only the wall. It works whenever the walls around the start and the goal are all one connected piece, as in every perfect maze, and then walks each corridor at most twice. In a maze with loops it can circle an island for ever.</li>
<li><b>Dead-end filling</b> looks at the whole map: fill in every dead end, then the corridor behind it, until no dead end is left. In a perfect maze what remains is exactly the solution. A person inside the maze cannot do this; a person with a map can.</li>
</ul>
<p>The seed decides every random choice: the same generator, size and seed always make the same maze.</p>`,
    taught: [{ href: '#/dsa/7', text: 'SC 107, Stacks and queues' }, { href: '#/dsa/8', text: 'SC 107, Recursion' }, { href: '#/math/6', text: 'SC 104, Graphs and paths (trees)' }]
  });

  A.register({
    id: 'maze-race', group: 'Mazes', title: 'Maze race',
    blurb: 'Four solvers race through copies of the same maze, one step each per tick. Place your bet, then watch BFS flood, DFS dive, A* aim and the wall follower feel its way out.',
    mount: mountMazeRace,
    about: `<h2>How the race works</h2>
<p>Every lane gets its own copy of the same maze. At each tick every solver that has not finished takes one step: it explores one cell (BFS, DFS, A*, greedy), walks one cell (the wall follower) or fills one cell (dead-end filling). The first to reach the red corner wins. A step counts the same for all of them, so the race measures how much of the maze each one has to look at.</p>
<h2>Things to try</h2>
<ul>
<li><b>Bet first.</b> Choose a winner before you press Play, then see whether you were right. Then try the same solvers on a new maze: the winner often changes, because DFS and the wall follower can be lucky or very unlucky.</li>
<li><b>BFS is never fastest here, but it is never fooled.</b> It explores every cell nearer than the goal, ring by ring, so it nearly always comes last; but with <em>Add loops</em> on, its path is always the shortest one there is.</li>
<li><b>Add loops.</b> A perfect maze has exactly one path, so every solver finds the same one. With loops there are many paths: watch DFS bring back a long winding one, and dead-end filling get stuck, because a loop has no dead end to fill.</li>
<li><b>Change the maze.</b> Sidewinder and binary-style mazes have a long open top corridor that suits A*; the recursive backtracker's long twisting corridors make A*'s sense of direction almost useless.</li>
</ul>`,
    taught: [{ href: '#/dsa/7', text: 'SC 107, Stacks and queues' }, { href: '#/math/6', text: 'SC 104, Graphs and paths' }]
  });

  A.register({
    id: 'graph-traversal', group: 'Paths and graphs', title: 'Breadth-first and depth-first search',
    blurb: 'Run BFS and DFS on a small graph and watch the queue, the stack or the call stack beside it, with a sentence for every step, the visit order on each vertex, and the search tree they leave behind. Dijkstra too.',
    mount: mountGraph,
    about: `<h2>The same loop with a different container</h2>
<p>Both searches start at one vertex and keep a container of vertices still to deal with. <b>Breadth-first search</b> uses a <em>queue</em>: first in, first out. It labels the start 0, its neighbours 1, their new neighbours 2, and so on, so it visits the graph in layers and each label is the distance from the start (SC 104, lesson 5, proves it). <b>Depth-first search</b> uses a <em>stack</em>: last in, first out. It goes as deep as it can along one path and only backs up when it is stuck.</p>
<p>Depth-first search is shown two ways. The <b>stack</b> version pushes every unvisited neighbour, so a vertex can be on the stack more than once; a copy popped after the vertex has been visited is thrown away (struck through). The <b>recursive</b> version calls itself for each unvisited neighbour, and the program's own <em>call stack</em> (SC 107, lesson 7) holds the vertices on the current path. Because the stack version pushes neighbours in reverse order, both visit the vertices in the same order and build the same tree.</p>
<p>Each search leaves a <em>tree</em> behind (the thick edges): every visited vertex except the start remembers the edge it was reached by. The breadth-first tree contains a shortest path from the start to every vertex. The depth-first tree tends to be long and thin.</p>
<h2>Dijkstra: when edges have weights</h2>
<p>On the weighted graphs, "shortest" means smallest total weight, and BFS's count of edges is the wrong measure: on the towns graph, BFS reaches E from A in two roads costing 15, while the cheapest route uses four roads and costs 9. <b>Dijkstra's algorithm</b> replaces the queue with a <em>priority queue</em> ordered by the distance found so far. The smallest entry is final when it comes out, as long as no weight is negative; an entry for a vertex that has already come out is out of date and is thrown away. Dashed edges are the best routes found so far, which may still change.</p>
<h2>Cost and uses</h2>
<p>With the graph stored as lists of neighbours, BFS and DFS look at each vertex once and each edge twice (once from each end): time proportional to <i>V</i> + <i>E</i>. Dijkstra with a binary heap takes time proportional to (<i>V</i> + <i>E</i>) log <i>V</i>.</p>
<ul>
<li>BFS: fewest hops in a network, degrees of separation in a social network, solving puzzles move by move, and copying garbage collectors (Cheney's algorithm walks live objects breadth-first).</li>
<li>DFS: finding the connected pieces of a graph, detecting cycles, putting tasks in an order that respects their dependencies (topological sorting), and generating mazes (the recursive backtracker is a randomized DFS).</li>
<li>Dijkstra: route planning, and network routing (OSPF and IS-IS run it on every router).</li>
</ul>`,
    taught: [{ href: '#/math/6', text: 'SC 104, Graphs and paths' }, { href: '#/dsa/7', text: 'SC 107, Stacks and queues' }, { href: '#/dsa/8', text: 'SC 107, Recursion' }]
  });

  // ================================================================== tests (node test_algos.js)
  function selfTest() {
    const fails = [], fail = (m) => { if (fails.length < 40) fails.push(m); };
    const refDist = (g, unit) => {                 // plain O(n^2) Dijkstra, independent of the heap
      const n = g.n, d = new Float64Array(n).fill(Infinity), done = new Uint8Array(n); d[g.start] = 0;
      for (;;) {
        let v = -1, b = Infinity; for (let i = 0; i < n; i++) if (!done[i] && d[i] < b) { b = d[i]; v = i; }
        if (v < 0) break; done[v] = 1;
        for (const [w, c] of g.nbrs(v)) { const nd = d[v] + (unit ? 1 : c); if (nd < d[w]) d[w] = nd; }
      }
      return d;
    };
    const validPath = (g, r, G) => {
      const P = r.path; if (P[0] !== g.start || P[P.length - 1] !== g.goal) return 'path does not run from start to goal';
      let cost = 0;
      for (let k = 1; k < P.length; k++) { const c = edgeCost(g, P[k - 1], P[k]); if (Number.isNaN(c)) return 'path makes an illegal move'; cost += c; }
      if (G && P.some((i) => G.wall[i])) return 'path crosses a wall';
      if (new Set(P).size !== P.length) return 'path repeats a cell';
      if (Math.abs(cost - r.cost) > 1e-6) return 'reported cost ' + r.cost + ' but the path costs ' + cost;
      return null;
    };
    // 1. path-finding on 400 seeded random grids
    for (let t = 0; t < 400; t++) {
      const rnd = A.rng(1000 + t), R = 2 + rnd.int(14), C = 2 + rnd.int(20), G = makeGrid(R, C), n = R * C, dens = rnd() * 0.45;
      for (let i = 0; i < n; i++) { G.wall[i] = rnd() < dens ? 1 : 0; G.mud[i] = t % 2 && rnd() < 0.25 ? 1 : 0; }
      G.start = rnd.int(n); do G.goal = rnd.int(n); while (G.goal === G.start && n > 1);
      if (t % 10 === 3 && C > 3) { const c = 1 + rnd.int(C - 2); for (let r = 0; r < R; r++) G.wall[r * C + c] = 1; G.start = rnd.int(R) * C; G.goal = rnd.int(R) * C + C - 1; }
      G.wall[G.start] = 0; G.wall[G.goal] = 0;
      const diag = t % 4 >= 2, g = gridGraph(G, diag), dc = refDist(g, false)[G.goal], ds = refDist(g, true)[G.goal], reach = dc < Infinity;
      const where = `grid #${t} (${R}x${C}${diag ? ', diagonal' : ''}${t % 2 ? ', mud' : ''})`;
      for (const k of Object.keys(ALGS)) {
        let r; try { r = runToEnd(search(g, k)); } catch (e) { fail(`${where}: ${k} threw ${e.message}`); continue; }
        if (r.found !== reach) { fail(`${where}: ${k} found=${r.found} but reachable=${reach}`); continue; }
        if (!reach) continue;
        const bad = validPath(g, r, G); if (bad) { fail(`${where}: ${k}: ${bad}`); continue; }
        if ((k === 'dijkstra' || k === 'astar') && Math.abs(r.cost - dc) > 1e-6) fail(`${where}: ${k} cost ${r.cost}, shortest is ${dc}`);
        if (k === 'bfs' && r.path.length - 1 !== ds) fail(`${where}: bfs took ${r.path.length - 1} steps, fewest is ${ds}`);
        if (r.cost < dc - 1e-6) fail(`${where}: ${k} beat the reference (${r.cost} < ${dc})`);
      }
    }
    // A* explores no more than Dijkstra on an open grid
    { const G = makeGrid(21, 35), g = gridGraph(G, false); if (runToEnd(search(g, 'astar')).visited > runToEnd(search(g, 'dijkstra')).visited) fail('A* explored more than Dijkstra on an open grid'); }
    // 2. mazes: every generator makes a perfect maze, deterministically; every solver finds the unique path
    const sizes = [[2, 2], [2, 9], [7, 3], [8, 13], [15, 21]];
    for (const gen of Object.keys(MAZE_GENS)) for (const [R, C] of sizes) for (let sd = 1; sd <= 14; sd++) {
      const where = `maze ${gen} ${R}x${C} seed ${sd}`;
      const m = newMaze(R, C, !!MAZE_GENS[gen].open); let bad = null;
      for (const ev of MAZE_GENS[gen].run(m, A.rng(sd))) {
        if (ev.t === 'carve' || ev.t === 'wall') { const d = Math.abs(ev.a - ev.b); if (!(d === C || (d === 1 && ((ev.a / C) | 0) === ((ev.b / C) | 0)))) bad = 'an event joins cells that are not neighbours'; }
      }
      if (bad) { fail(`${where}: ${bad}`); continue; }
      let pass = 0; for (let i = 0; i < m.n; i++) { if (i % C < C - 1 && m.e[i]) pass++; if (i < m.n - C && m.s[i]) pass++; if (i % C === C - 1 && m.e[i]) bad = 'a passage through the east boundary'; if (i >= m.n - C && m.s[i]) bad = 'a passage through the south boundary'; }
      if (bad) { fail(`${where}: ${bad}`); continue; }
      if (pass !== m.n - 1) { fail(`${where}: ${pass} passages, a perfect maze has ${m.n - 1}`); continue; }
      const seen = new Uint8Array(m.n), q = [0]; seen[0] = 1;
      for (let h = 0; h < q.length; h++) for (const w of openNbrs(m, q[h])) if (!seen[w]) { seen[w] = 1; q.push(w); }
      if (q.length !== m.n) { fail(`${where}: only ${q.length} of ${m.n} cells are connected`); continue; }
      const m2 = makeMaze(gen, R, C, sd); if (m2.e.join() !== m.e.join() || m2.s.join() !== m.s.join()) fail(`${where}: the same seed made a different maze`);
      // the unique path, by following parents of a BFS from the start
      const par = new Int32Array(m.n).fill(-1), q2 = [0]; par[0] = 0;
      for (let h = 0; h < q2.length; h++) for (const w of openNbrs(m, q2[h])) if (par[w] < 0) { par[w] = q2[h]; q2.push(w); }
      const uniq = []; for (let v = m.n - 1; v !== 0; v = par[v]) uniq.push(v); uniq.push(0); uniq.reverse();
      for (const s of Object.keys(SOLVERS)) {
        let r; try { r = runToEnd(mazeSolve(m, s)); } catch (e) { fail(`${where}: solver ${s} threw ${e.message}`); continue; }
        if (!r.found || r.path.join() !== uniq.join()) fail(`${where}: solver ${s} did not return the unique path`);
      }
      if (sd === 1) {
        const G = gridFromMaze(m), r = runToEnd(search(gridGraph(G, false), 'bfs'));
        if (!r.found || r.path.length - 1 !== 2 * (uniq.length - 1)) fail(`${where}: the maze drawn as a grid has the wrong path`);
      }
    }
    if (makeMaze('wilson', 9, 9, 5).e.join() === makeMaze('wilson', 9, 9, 6).e.join()) fail('two seeds made the same Wilson maze');
    // the wall follower and dead-end filling report failure instead of looping when there is no way through
    { const m = newMaze(3, 3, false); m.e[0] = 1; m.s[0] = 1; for (const s of Object.keys(SOLVERS)) if (runToEnd(mazeSolve(m, s)).found) fail(`solver ${s} found a path in a maze with none`); }
    // 3. graph traversals on every preset from every start
    for (const [name, P] of Object.entries(PRESETS)) {
      const G = buildGraph(P);
      if (P.pos.length !== G.n || P.edges.some(([a, b, w]) => !(a >= 0 && b >= 0 && a < G.n && b < G.n && a !== b && w > 0))) { fail(`preset ${name} is malformed`); continue; }
      for (let s = 0; s < G.n; s++) {
        const bd = new Array(G.n).fill(Infinity), q = [s]; bd[s] = 0;
        for (let h = 0; h < q.length; h++) for (const [w] of G.adj[q[h]]) if (bd[w] === Infinity) { bd[w] = bd[q[h]] + 1; q.push(w); }
        const wd = new Array(G.n).fill(Infinity); wd[s] = 0;
        for (let k = 0; k < G.n; k++) for (const [a, b, w] of G.edges) { if (wd[a] + w < wd[b]) wd[b] = wd[a] + w; if (wd[b] + w < wd[a]) wd[a] = wd[b] + w; }
        const ref = []; const seen = new Array(G.n).fill(false);
        const rdfs = (v) => { seen[v] = true; ref.push(v); for (const [w] of G.adj[v]) if (!seen[w]) rdfs(w); }; rdfs(s);
        const res = {};
        for (const k of Object.keys(TRAVERSALS)) {
          let steps = 0; const it = graphTraverse(G, s, k); let r;
          while (!(r = it.next()).done) { steps++; if (typeof r.value.say !== 'string' || !Array.isArray(r.value.strip)) { fail(`${name} ${k}: a malformed step`); break; } if (steps > 2000) { fail(`${name} ${k}: does not end`); break; } }
          res[k] = r.value;
          if (!r.value || new Set(r.value.order).size !== r.value.order.length || r.value.order.length !== q.length) fail(`${name} from ${G.labels[s]}: ${k} does not visit every reachable vertex exactly once`);
        }
        if (res.bfs && res.bfs.dist.some((d, i) => d !== bd[i])) fail(`${name} from ${G.labels[s]}: BFS labels are not the distances`);
        if (res.bfs) for (let k = 1; k < res.bfs.order.length; k++) if (bd[res.bfs.order[k]] < bd[res.bfs.order[k - 1]]) fail(`${name}: BFS order is not by layers`);
        if (res.dijkstra && res.dijkstra.dist.some((d, i) => d !== wd[i])) fail(`${name} from ${G.labels[s]}: Dijkstra distances are wrong`);
        if (res.dfs && res.dfs.order.join() !== ref.join()) fail(`${name} from ${G.labels[s]}: stack DFS order ${res.dfs.order} differs from recursive ${ref}`);
        if (res.rdfs && (res.rdfs.order.join() !== ref.join() || res.rdfs.parent.join() !== res.dfs.parent.join())) fail(`${name} from ${G.labels[s]}: recursive DFS differs from the stack version`);
      }
    }
    { const G = buildGraph(PRESETS.towns), r = runToEnd(graphTraverse(G, 0, 'dijkstra')), b = runToEnd(graphTraverse(G, 0, 'bfs'));
      if (r.dist[4] !== 9 || b.dist[4] !== 2) fail('towns: the A to E example in the text no longer holds'); }
    { const lc = lineCells(0, 7 * 10 + 9, 10); for (let k = 1; k < lc.length; k++) { const a = lc[k - 1], b = lc[k]; if (Math.abs(((a / 10) | 0) - ((b / 10) | 0)) > 1 || Math.abs(a % 10 - b % 10) > 1) fail('lineCells skips a cell'); } }
    // the maze race: in a perfect maze every solver finds the one path; with loops BFS's path is never longer than another's, and
    // dead-end filling may give up; places follow the step counts
    for (let k = 0; k < 30; k++) {
      const gname = Object.keys(MAZE_GENS)[k % Object.keys(MAZE_GENS).length], R = 4 + (k % 7), C = 5 + ((k * 3) % 9);
      const ids = Object.keys(SOLVERS);
      const perfect = runMazeRace(makeMaze(gname, R, C, 1000 + k), ids);
      const lens = new Set(perfect.map((x) => x.pathLen));
      if (perfect.some((x) => !x.found) || lens.size !== 1) fail('maze race on a perfect ' + gname + ' maze: ' + JSON.stringify(perfect));
      for (const x of perfect) for (const y of perfect) if (x.steps < y.steps && x.place > y.place) fail('maze race places do not follow the steps: ' + JSON.stringify(perfect));
      const looped = runMazeRace(addLoops(makeMaze(gname, R, C, 2000 + k), A.rng(k + 1), 0.15), ['bfs', 'dfs', 'astar', 'wall', 'greedy']);
      const bfs = looped[0];
      if (!bfs.found) fail('maze race: BFS found no path in a maze with loops');
      for (const x of looped) if (x.found && x.pathLen < bfs.pathLen) fail('maze race: ' + x.solver + ' found a shorter path than BFS: ' + JSON.stringify(looped));
      if (looped.some((x) => !x.found && x.solver !== 'deadend')) fail('maze race: a solver gave up in a maze with loops: ' + JSON.stringify(looped));
    }
    return fails;
  }

  if (typeof module !== 'undefined') module.exports = { selfTest, runMazeRace, addLoops, search, runToEnd, makeGrid, gridGraph, newMaze, makeMaze, MAZE_GENS, SOLVERS, mazeSolve, mazeGraph, wallFollower, deadEndFill, gridFromMaze, PRESETS, buildGraph, graphTraverse };
})();
