/* Algorithms in motion: backtracking and greedy choices. Three demos for the #/algorithms page (see src/algos.js for the frame):
   - sudoku: a race of three solvers on copies of one puzzle (plain backtracking in reading order; backtracking that fills the cell
     with the fewest candidates first; Norvig's constraint propagation with that search), with a bet, a results table over races,
     and a mode to solve the puzzle yourself with conflicts shown and hints that name the reasoning;
   - queens: the n queens puzzle solved by backtracking, attacked squares shaded, every solution counted and drawn, the search tree's
     size with and without pruning; and a mode where the reader places queens and is told how many solutions are still possible;
   - mst: towns joined by roads; the reader builds the shortest network they can, then Kruskal, Prim and Borůvka race to the optimum.
   The algorithms are pure (no DOM): generators that yield one event per step, and plain functions for counting and checking.
   selfTest() checks them in node (test_algos.js). */
(function () {
  const A = (typeof window !== 'undefined' && window.ALGOS) || require('./algos.js');

  // ================================================================== Sudoku (pure)
  // Cells are 0..80 in reading order. A unit is a row (0-8), a column (9-17) or a box (18-26). Candidates are bit masks: bit d for digit d.
  const UNITS = [], UNITS_OF = [], PEERS = [];
  for (let r = 0; r < 9; r++) UNITS.push(Array.from({ length: 9 }, (_, c) => r * 9 + c));
  for (let c = 0; c < 9; c++) UNITS.push(Array.from({ length: 9 }, (_, r) => r * 9 + c));
  for (let b = 0; b < 9; b++) UNITS.push(Array.from({ length: 9 }, (_, k) => (3 * ((b / 3) | 0) + ((k / 3) | 0)) * 9 + 3 * (b % 3) + (k % 3)));
  const boxOf = (i) => 3 * ((i / 27) | 0) + (((i % 9) / 3) | 0);
  for (let i = 0; i < 81; i++) {
    UNITS_OF.push([(i / 9) | 0, 9 + (i % 9), 18 + boxOf(i)]);
    const s = new Set(); for (const u of UNITS_OF[i]) for (const k of UNITS[u]) if (k !== i) s.add(k);
    PEERS.push(Int8Array.from(s));
  }
  const ALL = 0x3FE, POP = new Uint8Array(1024), LOW = new Uint8Array(1024);
  for (let m = 1; m < 1024; m++) { POP[m] = POP[m >> 1] + (m & 1); LOW[m] = m & 1 ? 0 : LOW[m >> 1] + 1; }
  const digitsOf = (m) => { const out = []; for (let d = 1; d <= 9; d++) if (m & (1 << d)) out.push(d); return out; };
  const unitName = (u) => (u < 9 ? 'row ' + (u + 1) : u < 18 ? 'column ' + (u - 8) : 'box ' + (u - 17));
  const cellName = (i) => 'row ' + (((i / 9) | 0) + 1) + ', column ' + ((i % 9) + 1);
  // why a value was written: given, guessed, a naked single (the cell's only candidate), or a hidden single in unit u (WHY_HIDDEN + u)
  const GIVEN = 0, GUESS = 1, NAKED = 2, WHY_HIDDEN = 10;

  /* Norvig's constraint propagation (2006): assign(c, i, v) removes every other candidate from cell i; eliminate(c, i, d) removes d,
     and (1) a cell left with one candidate gives that digit up in its 20 peers, (2) a unit left with one place for d puts d there.
     Both return false on a contradiction (a cell with no candidates, or a digit with no place in a unit). log, if given, receives
     [cell, digit, why] each time a cell is narrowed to one digit, in the order it happens; why is the reason passed down. */
  function assign(c, i, v, log, why) {
    let other = c[i] & ~(1 << v);
    while (other) { const d = LOW[other]; other &= other - 1; if (!eliminate(c, i, d, log, why)) return false; }
    return true;
  }
  function eliminate(c, i, d, log, why) {
    const b = 1 << d;
    if (!(c[i] & b)) return true;
    const m = (c[i] &= ~b);
    if (!m) return false;
    if (POP[m] === 1) {
      const d2 = LOW[m];
      if (log) log.push(i, d2, why);
      const P = PEERS[i];
      for (let k = 0; k < P.length; k++) if (!eliminate(c, P[k], d2, log, NAKED)) return false;
    }
    const U = UNITS_OF[i];
    for (let k = 0; k < 3; k++) {
      const cells = UNITS[U[k]]; let n = 0, at = -1;
      for (let j = 0; j < 9 && n < 2; j++) if (c[cells[j]] & b) { n++; at = cells[j]; }
      if (!n) return false;
      if (n === 1 && POP[c[at]] > 1 && !assign(c, at, d, log, WHY_HIDDEN + U[k])) return false;
    }
    return true;
  }
  /** Candidates after propagating the givens, or null if they contradict each other. */
  function propagateGivens(grid, log) {
    const c = new Uint16Array(81).fill(ALL);
    for (let i = 0; i < 81; i++) if (grid[i] && !(c[i] & (1 << grid[i]) && assign(c, i, grid[i], log, GIVEN))) return null;
    return c;
  }
  /** Count solutions up to limit (fast: propagation and fewest-candidates search). Returns { count, solution } (the first found). */
  function countSolutions(grid, limit) {
    const out = { count: 0, solution: null }, c0 = propagateGivens(grid, null);
    if (!c0) return out;
    const go = (c) => {
      let best = -1, bc = 10;
      for (let i = 0; i < 81; i++) { const p = POP[c[i]]; if (p > 1 && p < bc) { bc = p; best = i; if (p === 2) break; } }
      if (best < 0) { out.count++; if (!out.solution) out.solution = Array.from(c, (m) => LOW[m]); return; }
      let m = c[best];
      while (m && out.count < limit) { const d = LOW[m]; m &= m - 1; const c2 = c.slice(); if (assign(c2, best, d, null, GUESS)) go(c2); }
    };
    go(c0);
    return out;
  }
  /** Read a puzzle typed by the reader: 81 cells, digits 1-9, and 0 . _ * for empty cells; spaces, line breaks and | - + are ignored.
      Returns { ok: true, grid, solution, givens } or { ok: false, error } in words a reader can act on. */
  function parsePuzzle(text) {
    const s = String(text == null ? '' : text).replace(/[\s|+\-]/g, '');
    const bad = /[^0-9._*]/.exec(s);
    if (bad) return { ok: false, error: 'Use only the digits 1 to 9, and 0 or a dot for an empty cell (found "' + bad[0] + '").' };
    if (s.length !== 81) return { ok: false, error: 'A Sudoku has 81 cells; this has ' + s.length + '.' };
    const grid = Array.from(s, (ch) => (ch >= '1' && ch <= '9' ? +ch : 0));
    for (let u = 0; u < 27; u++) {
      const seen = new Array(10).fill(-1);
      for (const i of UNITS[u]) { const v = grid[i]; if (!v) continue; if (seen[v] >= 0) return { ok: false, error: 'There are two ' + v + 's in ' + unitName(u) + '.' }; seen[v] = i; }
    }
    const givens = grid.filter((v) => v).length;
    const r = countSolutions(grid, 2);
    if (!r.count) return { ok: false, error: 'This puzzle has no solution: the givens do not break any rule yet, but they cannot all be completed.' };
    if (r.count > 1) return { ok: false, error: 'This puzzle has more than one solution' + (givens < 17 ? ' (it has only ' + givens + ' givens; every proper Sudoku has at least 17)' : '') + '. A proper Sudoku has exactly one.' };
    return { ok: true, grid, solution: r.solution, givens };
  }
  const isSolution = (g, puzzle) => {
    if (!g || g.length !== 81) return false;
    for (let i = 0; i < 81; i++) if (!(g[i] >= 1 && g[i] <= 9) || (puzzle && puzzle[i] && puzzle[i] !== g[i])) return false;
    for (const U of UNITS) { let m = 0; for (const i of U) m |= 1 << g[i]; if (m !== ALL) return false; }
    return true;
  };

  /* The three racing solvers. Each takes a puzzle (81 digits, 0 empty) and yields events:
       { t: 'guess', i, v }          v written in cell i by choice (it may replace an earlier guess there)
       { t: 'deduce', i, v, why }    v written in cell i because the rules force it (propagation only)
       { t: 'erase', i }             cell i emptied while backing up
       { t: 'back', i }              the guess in cell i was wrong and is being taken back (not a step: it only counts)
     and return { solved, grid }. A step is one change to the grid: a guess, a deduction or an erase. */
  /** Backtracking that fills the cell pick() chooses with each digit that fits, in turn. pick(g, free) → [cell, mask] or null if full. */
  function* backtrack(puzzle, pick) {
    const g = Array.from(puzzle), row = new Uint16Array(9), col = new Uint16Array(9), box = new Uint16Array(9);
    const put = (i, v) => { const b = 1 << v; row[(i / 9) | 0] |= b; col[i % 9] |= b; box[boxOf(i)] |= b; g[i] = v; };
    const take = (i) => { const b = ~(1 << g[i]); row[(i / 9) | 0] &= b; col[i % 9] &= b; box[boxOf(i)] &= b; g[i] = 0; };
    const free = (i) => ALL & ~(row[(i / 9) | 0] | col[i % 9] | box[boxOf(i)]);
    for (let i = 0; i < 81; i++) if (g[i]) { const v = g[i]; if (!(free(i) & (1 << v))) return { solved: false, grid: g }; put(i, v); }
    const st = [];
    for (;;) {
      const p = pick(g, free);
      if (!p) return { solved: true, grid: g };
      let fail = !p[1];                              // a cell with no digit left: the last guess was wrong
      if (!fail) st.push({ i: p[0], opts: digitsOf(p[1]), k: 0 });
      for (;;) {
        const f = st[st.length - 1];
        if (!f) return { solved: false, grid: g };
        if (fail) yield { t: 'back', i: f.i };
        if (f.k < f.opts.length) { if (g[f.i]) take(f.i); put(f.i, f.opts[f.k++]); yield { t: 'guess', i: f.i, v: g[f.i] }; break; }
        if (g[f.i]) { take(f.i); yield { t: 'erase', i: f.i }; }
        st.pop(); fail = true;                       // every digit failed here: the guess before this one was wrong
      }
    }
  }
  const pickReading = (g, free) => { for (let i = 0; i < 81; i++) if (!g[i]) return [i, free(i)]; return null; };
  const pickFewest = (g, free) => {
    let best = -1, bm = 0, bc = 10;
    for (let i = 0; i < 81; i++) if (!g[i]) { const m = free(i), p = POP[m]; if (p < bc) { bc = p; bm = m; best = i; if (p <= 1) break; } }
    return best < 0 ? null : [best, bm];
  };
  function* solvePlain(puzzle) { return yield* backtrack(puzzle, pickReading); }
  function* solveMRV(puzzle) { return yield* backtrack(puzzle, pickFewest); }
  /** Norvig: propagate the givens, then guess in the cell with the fewest candidates, propagating after every guess. */
  function* solveNorvig(puzzle) {
    const log = [], g = Array.from(puzzle);
    const c0 = propagateGivens(puzzle, log);
    for (let k = 0; k < log.length; k += 3) if (log[k + 2] !== GIVEN && !puzzle[log[k]]) { g[log[k]] = log[k + 1]; yield { t: 'deduce', i: log[k], v: log[k + 1], why: log[k + 2] }; }
    if (!c0) return { solved: false, grid: g };
    const st = []; let cur = c0;
    for (;;) {
      let best = -1, bc = 10;
      for (let i = 0; i < 81; i++) { const p = POP[cur[i]]; if (p > 1 && p < bc) { bc = p; best = i; if (p === 2) break; } }
      if (best < 0) return { solved: true, grid: g };
      st.push({ base: cur, i: best, opts: digitsOf(cur[best]), k: 0, shown: null });
      let undoTop = false;
      for (;;) {
        const f = st[st.length - 1];
        if (!f) return { solved: false, grid: g };
        if (undoTop) {                               // the guess of this frame led to a dead end below: take it back
          yield { t: 'back', i: f.i };
          for (let k = f.shown.length - 1; k >= 0; k--) { g[f.shown[k]] = 0; yield { t: 'erase', i: f.shown[k] }; }
          f.shown = null; undoTop = false;
        }
        if (f.k >= f.opts.length) { st.pop(); undoTop = true; continue; }
        const v = f.opts[f.k++], c2 = f.base.slice(), lg = [], ok = assign(c2, f.i, v, lg, GUESS), shown = [f.i];
        g[f.i] = v; yield { t: 'guess', i: f.i, v };
        for (let k = 0; k < lg.length; k += 3) if (lg[k] !== f.i && !g[lg[k]]) { g[lg[k]] = lg[k + 1]; shown.push(lg[k]); yield { t: 'deduce', i: lg[k], v: lg[k + 1], why: lg[k + 2] }; }
        if (ok) { f.shown = shown; cur = c2; break; }
        yield { t: 'back', i: f.i };
        for (let k = shown.length - 1; k >= 0; k--) { g[shown[k]] = 0; yield { t: 'erase', i: shown[k] }; }
      }
    }
  }
  const SOLVERS = [
    { id: 'plain', name: 'Plain backtracking', short: 'Plain', gen: solvePlain, note: 'Fill the empty cells in reading order, trying 1 to 9 in each; back up when a cell has no digit left.' },
    { id: 'mrv', name: 'Fewest candidates first', short: 'Fewest first', gen: solveMRV, note: 'Backtracking, but always fill the empty cell with the fewest digits that fit (MRV).' },
    { id: 'norvig', name: 'Propagation + fewest first', short: 'Propagation', gen: solveNorvig, note: 'Norvig (2006): after every digit, fill every cell the rules force (singles), then guess in the cell with fewest candidates.' }
  ];

  /** The next step a person could take on grid g (their digits included): a hidden single (box first, then row, then column) or a
      naked single, with the reasoning in words. Returns { i, v, text } or null when no single is left (a solver would have to guess). */
  function nextHint(g) {
    const c = new Uint16Array(81);
    for (let i = 0; i < 81; i++) {
      if (g[i]) { c[i] = 1 << g[i]; continue; }
      let used = 0; const P = PEERS[i]; for (let k = 0; k < P.length; k++) if (g[P[k]]) used |= 1 << g[P[k]];
      c[i] = ALL & ~used;
    }
    for (const u of [18, 19, 20, 21, 22, 23, 24, 25, 26, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]) {
      for (let d = 1; d <= 9; d++) {
        let n = 0, at = -1, placed = false;
        for (const i of UNITS[u]) { if (g[i] === d) { placed = true; break; } if (!g[i] && c[i] & (1 << d)) { n++; at = i; } }
        if (!placed && n === 1) return { i: at, v: d, unit: u, text: 'The only place for ' + d + ' in ' + unitName(u) + ' is ' + cellName(at) + ': every other empty cell there already sees a ' + d + ' in its row, column or box.' };
      }
    }
    for (let i = 0; i < 81; i++) if (!g[i] && POP[c[i]] === 1) return { i, v: LOW[c[i]], text: cellName(i) + ' can only be ' + LOW[c[i]] + ': each of the other eight digits is already in its row, its column or its box.' };
    return null;
  }
  /** Cells whose digit also appears elsewhere in one of their units. */
  function conflicts(g) {
    const bad = new Uint8Array(81);
    for (const U of UNITS) for (let a = 0; a < 9; a++) for (let b = a + 1; b < 9; b++) if (g[U[a]] && g[U[a]] === g[U[b]]) { bad[U[a]] = 1; bad[U[b]] = 1; }
    return bad;
  }

  const P_ = (s) => s.replace(/\s/g, '');
  const PUZZLES = [
    { id: 'easy', name: 'Easy', grid: P_('200080300 060070084 030500209 000105408 000000000 402706000 301007040 720040060 004010003'),
      note: 'Grid 2 of Project Euler problem 96: singles alone solve it, so propagation never has to guess.' },
    { id: 'medium', name: 'Medium', grid: P_('100920000 524010000 000000070 050008102 000000000 402700090 060000000 000030945 000071006'),
      note: 'Grid 6 of Project Euler problem 96: 24 givens, and singles are not quite enough.' },
    { id: 'hard', name: 'Hard (17 givens)', grid: P_('6.....8.3.4.7.................5.4.7.3..2.....1.6.......2.....5.....8.6......1....'),
      note: 'Number 3 of the \u201ctop 95\u201d hard puzzles Norvig tested his solver on: 17 givens, the fewest a proper Sudoku can have.' },
    { id: 'inkala', name: 'Arto Inkala’s “hardest” (2012)', grid: P_('800000000 003600000 070090200 050007000 000045700 000100030 001000068 008500010 090000400'),
      note: 'Published in June 2012 as “the world’s hardest Sudoku” by the Finnish mathematician Arto Inkala. Hard for people; for a computer it is just a puzzle.' }
  ].map((p) => ({ ...p, grid: Array.from(p.grid, (ch) => (ch >= '1' && ch <= '9' ? +ch : 0)) }));

  // ================================================================== n queens (pure)
  // A queen in each column, column by column; rows[c] is the row of the queen in column c. Two queens attack along a row or a diagonal.
  /** Count every solution on an n x n board with bit masks. Returns { solutions, placed (nodes of the pruned tree, root excluded),
      tried (placements tried when every row is tried and an attacked one is taken back at once) }. */
  function countQueens(n) {
    let solutions = 0, placed = 0, tried = 0; const full = (1 << n) - 1;
    const go = (cols, d1, d2, depth) => {
      if (depth === n) { solutions++; return; }
      tried += n;
      let free = full & ~(cols | d1 | d2);
      while (free) { const b = free & -free; free -= b; placed++; go(cols | b, ((d1 | b) << 1) & full, (d2 | b) >> 1, depth + 1); }
    };
    go(0, 0, 0, 0);
    return { solutions, placed, tried };
  }
  /** Every arrangement with one queen per column, checked only when the board is full: n^n leaves (as a string, it is large). */
  const bruteLeaves = (n) => { let x = 1n; for (let k = 0; k < n; k++) x *= BigInt(n); return x; };
  /** How many solutions contain the queens already placed (q: array of [row, col])? 0 if two of them attack each other. */
  function solutionsFrom(n, q) {
    const fixed = new Int8Array(n).fill(-1);
    for (let a = 0; a < q.length; a++) {
      const [r, c] = q[a];
      if (fixed[c] >= 0) return 0;
      for (let b = 0; b < a; b++) { const [r2, c2] = q[b]; if (r === r2 || Math.abs(r - r2) === Math.abs(c - c2)) return 0; }
      fixed[c] = r;
    }
    let count = 0; const full = (1 << n) - 1;
    // columns go by depth; the diagonal masks shift one place per column, as in countQueens
    const go = (rows, d1, d2, c) => {
      if (c === n) { count++; return; }
      let free = full & ~(rows | d1 | d2);
      if (fixed[c] >= 0) free &= 1 << fixed[c];
      while (free) { const b = free & -free; free -= b; go(rows | b, ((d1 | b) << 1) & full, (d2 | b) >> 1, c + 1); }
    };
    go(0, 0, 0, 0);
    return count;
  }
  const attacks = (r1, c1, r2, c2) => r1 === r2 || c1 === c2 || Math.abs(r1 - r2) === Math.abs(c1 - c2);
  /** Backtracking, column by column, rows tried from the top. safeOnly: only rows no queen attacks (pruning); otherwise every row is
      tried, and a queen placed on an attacked square is seen to be attacked and taken back.
      Events: { t: 'place', c, r }, { t: 'reject', c, r } (an attacked square: placed and taken back), { t: 'remove', c, r },
      { t: 'solution', rows }. Returns the number of solutions. */
  function* queens(n, safeOnly) {
    const rows = new Int8Array(n).fill(-1); let solutions = 0;
    const safe = (c, r) => { for (let k = 0; k < c; k++) if (attacks(rows[k], k, r, c)) return false; return true; };
    let c = 0, r = 0;
    for (;;) {
      if (c === n) { solutions++; yield { t: 'solution', rows: Array.from(rows) }; c--; r = rows[c]; rows[c] = -1; yield { t: 'remove', c, r }; r++; continue; }
      let placedHere = false;
      while (r < n) {
        if (safe(c, r)) { rows[c] = r; yield { t: 'place', c, r }; placedHere = true; break; }
        if (!safeOnly) yield { t: 'reject', c, r };
        r++;
      }
      if (placedHere) { c++; r = 0; continue; }
      if (c === 0) return solutions;
      c--; r = rows[c]; rows[c] = -1; yield { t: 'remove', c, r }; r++;
    }
  }

  // ================================================================== minimum spanning trees (pure)
  /** n towns in the unit square scaled to [0,1] x [0,ar], at least a little apart; the same seed gives the same towns. */
  function makeTowns(n, seed, ar) {
    const rnd = A.rng(seed), pts = [], H = ar || 0.6; let gap = 0.9 / Math.sqrt(n / H), tries = 0;
    while (pts.length < n) {
      const p = [0.03 + rnd() * 0.94, 0.03 * H + rnd() * 0.94 * H];
      if (pts.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > gap * 0.55)) pts.push(p);
      if (++tries > 4000) { gap *= 0.9; tries = 0; }
    }
    return pts;
  }
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  function properCross(p1, p2, p3, p4) {
    const d1 = cross(p3, p4, p1), d2 = cross(p3, p4, p2), d3 = cross(p1, p2, p3), d4 = cross(p1, p2, p4);
    return ((d1 > 1e-12 && d2 < -1e-12) || (d1 < -1e-12 && d2 > 1e-12)) && ((d3 > 1e-12 && d4 < -1e-12) || (d3 < -1e-12 && d4 > 1e-12));
  }
  /** Roads: the greedy triangulation (shortest pairs first, skipping any that would cross a road already built), so the map is flat
      and connected, like real roads between neighbouring towns. Each road is [a, b, length]. */
  function makeRoads(pts) {
    const n = pts.length, pairs = [];
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) pairs.push([a, b, Math.hypot(pts[a][0] - pts[b][0], pts[a][1] - pts[b][1])]);
    pairs.sort((x, y) => x[2] - y[2]);
    const roads = [];
    for (const e of pairs) {
      if (e[2] > 0.5 && roads.length >= n - 1) continue;   // very long roads clutter the map and never belong to the tree
      let ok = true;
      for (const f of roads) if (f[0] !== e[0] && f[0] !== e[1] && f[1] !== e[0] && f[1] !== e[1] && properCross(pts[e[0]], pts[e[1]], pts[f[0]], pts[f[1]])) { ok = false; break; }
      if (ok) roads.push(e);
    }
    return roads;
  }
  /** Union-find with path halving and union by size. */
  function DSU(n) {
    const up = new Int32Array(n).map((_, i) => i), size = new Int32Array(n).fill(1);
    const find = (x) => { while (up[x] !== x) { up[x] = up[up[x]]; x = up[x]; } return x; };
    return { find, size, union(a, b) { let ra = find(a), rb = find(b); if (ra === rb) return null; if (size[ra] < size[rb]) { const t = ra; ra = rb; rb = t; } up[rb] = ra; size[ra] += size[rb]; return [ra, rb]; } };
  }
  const lighter = (E, x, y) => (E[x][2] < E[y][2] || (E[x][2] === E[y][2] && x < y));   // ties broken by index: every algorithm agrees
  /* The three algorithms, on n towns and roads E. Events (a step is one road looked at):
       { t: 'edge', e, ok }     road e considered; ok: it joins the tree (or the forest), else it would close a loop
       { t: 'scan', e }         Borůvka: road e compared with its components' cheapest so far
       { t: 'best', e }         Borůvka: e is now the cheapest road out of one of its components (not a step)
       { t: 'round', k }        Borůvka: round k begins (not a step)
       { t: 'push', e }         Prim: road e joins the priority queue (not a step)
     Each returns { edges, total }. */
  function* kruskal(n, E) {
    const order = E.map((_, k) => k).sort((x, y) => (lighter(E, x, y) ? -1 : 1)), d = DSU(n), out = [];
    for (const e of order) {
      if (out.length === n - 1) break;
      const ok = !!d.union(E[e][0], E[e][1]);
      if (ok) out.push(e);
      yield { t: 'edge', e, ok };
    }
    return { edges: out, total: out.reduce((s, e) => s + E[e][2], 0) };
  }
  function* prim(n, E) {
    const adj = Array.from({ length: n }, () => []);
    E.forEach((e, k) => { adj[e[0]].push(k); adj[e[1]].push(k); });
    const inT = new Uint8Array(n), heap = [], out = [];
    const less = (x, y) => lighter(E, x, y);
    const push = (e) => { heap.push(e); let i = heap.length - 1; while (i) { const p = (i - 1) >> 1; if (!less(heap[i], heap[p])) break; [heap[i], heap[p]] = [heap[p], heap[i]]; i = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && less(heap[l], heap[m])) m = l; if (r < heap.length && less(heap[r], heap[m])) m = r; if (m === i) break; [heap[i], heap[m]] = [heap[m], heap[i]]; i = m; } } return top; };
    const grow = function* (v) { inT[v] = 1; for (const e of adj[v]) { const w = E[e][0] === v ? E[e][1] : E[e][0]; if (!inT[w]) { push(e); yield { t: 'push', e }; } } };
    if (n) yield* grow(0);
    while (heap.length && out.length < n - 1) {
      const e = pop(), [a, b] = E[e], ok = !(inT[a] && inT[b]);
      if (ok) out.push(e);
      yield { t: 'edge', e, ok };
      if (ok) yield* grow(inT[a] ? b : a);
    }
    return { edges: out, total: out.reduce((s, e) => s + E[e][2], 0) };
  }
  function* boruvka(n, E) {
    const d = DSU(n), out = []; let live = E.map((_, k) => k), round = 0;
    while (out.length < n - 1 && live.length) {
      yield { t: 'round', k: ++round };
      const best = new Int32Array(n).fill(-1), next = [];
      for (const e of live) {
        const ra = d.find(E[e][0]), rb = d.find(E[e][1]);
        if (ra === rb) continue;                     // inside one component: dropped for good, as a real implementation would
        next.push(e);
        yield { t: 'scan', e };
        for (const r of [ra, rb]) if (best[r] < 0 || lighter(E, e, best[r])) { best[r] = e; yield { t: 'best', e }; }
      }
      live = next;
      const chosen = [];
      for (let v = 0; v < n; v++) if (best[v] >= 0 && !chosen.includes(best[v])) chosen.push(best[v]);
      if (!chosen.length) break;
      for (const e of chosen) { const ok = !!d.union(E[e][0], E[e][1]); if (ok) out.push(e); yield { t: 'edge', e, ok }; }
    }
    return { edges: out, total: out.reduce((s, e) => s + E[e][2], 0) };
  }
  const MSTS = [
    { id: 'kruskal', name: 'Kruskal (1956)', short: 'Kruskal', gen: kruskal, note: 'Shortest road first, anywhere on the map, unless it would close a loop.' },
    { id: 'prim', name: 'Jarník–Prim (1930, 1957)', short: 'Prim', gen: prim, note: 'Grow one network from the first town: always add the shortest road out of it.' },
    { id: 'boruvka', name: 'Borůvka (1926)', short: 'Borůvka', gen: boruvka, note: 'Every group of towns at once picks its shortest road out; repeat.' }
  ];
  const runToEnd = (it) => { let r; do r = it.next(); while (!r.done); return r.value; };

  // ================================================================== the page (DOM only from here, and only inside mount)
  /** Call fn at most once per animation frame: counters and canvases are redrawn once, however many steps were taken. */
  function onceAFrame(fn) { let raf = 0; const go = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; fn(); }); }; go.cancel = () => { if (raf) cancelAnimationFrame(raf); raf = 0; }; return go; }
  const fmt = (x) => Math.round(x).toLocaleString('en-US');
  const PLACES = ['1st', '2nd', '3rd', '4th'];
  /** Step a player to the end at once (the Finish button), a slice at a time so a long race does not freeze the page. */
  function finisher(p, isDone) {
    let t = 0;
    const run = () => { t = 0; const end = performance.now() + 40; while (performance.now() < end) { for (let k = 0; k < 2000; k++) if (!p.step()) return; } if (!isDone()) t = setTimeout(run, 0); };
    return { go: () => { p.pause(); clearTimeout(t); run(); }, cancel: () => clearTimeout(t) };
  }
  const CSS = `
.algo-host [hidden] { display: none !important; }
.lg-tabs { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0.4rem 0 0.2rem; }
.lg-tabs .btn[aria-pressed="true"] { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.lg-hint { font-family: var(--sans); font-size: 0.9rem; color: var(--ink-2); margin: 0.3rem 0 0.5rem; line-height: 1.45; }
.lg-msg { font-family: var(--sans); font-size: 1rem; margin: 0.5rem 0; min-height: 1.5em; line-height: 1.45; }
.lg-msg.win { color: var(--ok); font-weight: 600; }
.lg-msg.bad { color: var(--err); }
.lg-stats { display: flex; flex-wrap: wrap; gap: 0.3rem 1.3rem; font-family: var(--sans); font-size: 0.93rem; color: var(--ink-2); margin: 0.4rem 0; font-variant-numeric: tabular-nums; }
.lg-stats b { color: var(--ink); font-weight: 600; }
.lg-wrap { overflow-x: auto; max-width: 100%; }
.lg-table { border-collapse: collapse; font-family: var(--sans); font-size: 0.9rem; font-variant-numeric: tabular-nums; margin: 0.4rem 0; }
.lg-table caption { text-align: left; color: var(--ink-2); padding-bottom: 0.3rem; font-weight: 600; }
.lg-table th, .lg-table td { text-align: right; padding: 0.25rem 0.6rem; border-bottom: 1px solid var(--rule); white-space: nowrap; }
.lg-table th:first-child, .lg-table td:first-child { text-align: left; white-space: normal; }
.lg-table th { color: var(--ink-2); font-weight: 600; }
.lg-table tr.win td { color: var(--ok); font-weight: 600; }
.lg-custom { display: grid; gap: 0.4rem; margin: 0.4rem 0; max-width: 34rem; }
.lg-custom textarea { font-family: var(--mono); font-size: 0.9rem; line-height: 1.35; width: 100%; box-sizing: border-box; min-height: 7.5rem; color: var(--ink); background: var(--paper); border: 1px solid var(--rule); border-radius: 3px; padding: 0.4rem; resize: vertical; }
.lg-pad { display: grid; grid-template-columns: repeat(5, minmax(0, 3.2rem)); gap: 0.35rem; margin: 0.5rem 0; }
.lg-pad .btn { padding: 0.45rem 0; font-size: 1.05rem; font-variant-numeric: tabular-nums; min-width: 0; }
.lg-solo { display: grid; grid-template-columns: minmax(0, 30rem) minmax(0, 1fr); gap: 0.4rem 1.4rem; align-items: start; }
@media (max-width: 760px) { .lg-solo { grid-template-columns: minmax(0, 1fr); } }
.lg-canvas canvas { cursor: pointer; }
.lg-canvas canvas:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
@media (max-width: 560px) { .lg-table th, .lg-table td { padding: 0.2rem 0.3rem; font-size: 0.84rem; } }
`;
  function injectCss() {
    if (document.getElementById('algo-logic-css')) return;
    const s = document.createElement('style'); s.id = 'algo-logic-css'; s.textContent = CSS; document.head.appendChild(s);
  }
  function selectBox(el, label, options, value, onchange) {
    const s = el('select', { onchange: () => onchange(s.value) }, options.map(([v, t]) => el('option', { value: String(v) }, t)));
    s.value = String(value);
    return [el('label', {}, label + ' ', s), s];
  }
  const legend = (el, items) => el('div', { class: 'algo-legend' }, items.map(([style, text]) => el('span', {}, el('i', { style }), text)));
  /** Two or more buttons that work as tabs: one is pressed at a time. */
  function tabs(el, items, value, onchange) {
    const bs = items.map(([v, t]) => el('button', { class: 'btn', type: 'button', 'aria-pressed': String(v === value), onclick: () => { bs.forEach((b, k) => b.setAttribute('aria-pressed', String(items[k][0] === v))); onchange(v); } }, t));
    return el('div', { class: 'lg-tabs', role: 'group' }, bs);
  }
  const isDark = (c) => { const m = /^#([0-9a-f]{6})$/i.exec(c.paper || ''); if (!m) return false; const x = parseInt(m[1], 16); return ((x >> 16) * 0.3 + ((x >> 8) & 255) * 0.59 + (x & 255) * 0.11) < 110; };
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

  // ---------------------------------------------------------------- demo 1: the Sudoku race, and solving it yourself
  function mountSudoku(host, api) {
    injectCss();
    const el = api.el, rm = api.reducedMotion();
    let pz = PUZZLES[0], solution = countSolutions(pz.grid, 1).solution, bet = '', lanes = [], history = [], mode = 'race', raceOver = false;

    // ----- choosing the puzzle (shared by both modes)
    const [puzL, puzSel] = selectBox(el, 'Puzzle', PUZZLES.map((p) => [p.id, p.name]).concat([['custom', 'Type your own…']]), pz.id, (v) => {
      if (v === 'custom') { customBox.hidden = false; ta.focus(); return; }
      customBox.hidden = true; usePuzzle(PUZZLES.find((p) => p.id === v));
    });
    const ta = el('textarea', { 'aria-label': 'Your puzzle: 81 cells, row by row', spellcheck: 'false', placeholder: '81 cells, row by row: digits for the givens, 0 or . for empty cells. Spaces and line breaks are ignored.' });
    const customMsg = el('p', { class: 'lg-hint', role: 'status' });
    const customBox = el('div', { class: 'lg-custom' }, ta,
      el('div', { class: 'algo-controls' }, el('button', { class: 'btn', type: 'button', onclick: () => {
        const r = parsePuzzle(ta.value);
        if (!r.ok) { customMsg.textContent = r.error; customMsg.classList.add('bad'); return; }
        customMsg.classList.remove('bad'); customMsg.textContent = 'A proper puzzle: ' + r.givens + ' givens and exactly one solution.';
        usePuzzle({ id: 'custom', name: 'Your puzzle', grid: r.grid, note: 'Your own puzzle (' + r.givens + ' givens), checked: it breaks no rule and has exactly one solution.' }, r.solution);
      } }, 'Use this puzzle'),
      el('button', { class: 'btn quiet', type: 'button', onclick: () => { ta.value = pz.grid.map((v, i) => (v || '.') + (i % 9 === 8 && i < 80 ? '\n' : '')).join(''); } }, 'Copy the current puzzle here')),
      customMsg);
    customBox.hidden = true;
    const note = el('p', { class: 'lg-hint' }, pz.note);
    host.append(tabs(el, [['race', 'Race the solvers'], ['solo', 'Solve it yourself']], mode, (v) => { mode = v; raceBox.hidden = v !== 'race'; soloBox.hidden = v !== 'solo'; if (v === 'solo') { p.pause(); later(); soloCv.redraw(); } else cv.redraw(); }),
      el('div', { class: 'algo-controls' }, puzL), customBox, note);
    function usePuzzle(np, sol) {
      pz = np; solution = sol || countSolutions(pz.grid, 1).solution; note.textContent = pz.note;
      p.reset(); soloRestart();
    }

    // ----- the race
    const raceBox = el('div'); host.append(raceBox);
    const betSel = el('select', { 'aria-label': 'Your bet', onchange: () => { bet = betSel.value; } },
      el('option', { value: '' }, 'no bet'), SOLVERS.map((s) => el('option', { value: s.id }, s.name)));
    raceBox.append(el('div', { class: 'algo-controls' }, el('label', {}, 'Who will win? ', betSel)),
      el('p', { class: 'lg-hint' }, SOLVERS.map((s, k) => [k ? ' ' : '', el('b', {}, s.name + ': '), s.note])));
    function build() {
      raceOver = false;
      lanes = SOLVERS.map((s) => {
        const g = new Int8Array(81), kind = new Uint8Array(81);
        for (let i = 0; i < 81; i++) if (pz.grid[i]) { g[i] = pz.grid[i]; kind[i] = 1; }
        return { s, g, kind, heat: new Uint32Array(81), flash: new Float64Array(81), flashAt: new Float64Array(81), flashK: new Uint8Array(81), cur: -1, guesses: 0, backs: 0, deduced: 0, steps: 0, done: false, place: 0, it: null };
      });
    }
    build();
    const cv = api.canvas(raceBox, { label: 'Three Sudoku solvers racing on copies of the same puzzle', maxWidth: 1100,
      height: (w) => Math.round(Math.min(340, w / 3 - 8) + 48), draw: drawRace });
    const later = onceAFrame(() => { cv.redraw(); table(); });
    const fin = finisher({ pause: () => p.pause(), step: () => p.step() }, () => raceOver || !host.isConnected);
    const p = api.player(raceBox, {
      speeds: rm ? [50, 300000] : [3, 300000], speed: 42,
      extra: [el('button', { class: 'btn quiet', type: 'button', onclick: () => fin.go() }, 'Finish')],
      start: () => { build(); for (const l of lanes) l.it = l.s.gen(pz.grid); return race(); },
      onStep: () => later(),
      onDone: () => {
        raceOver = true;
        const order = lanes.slice().sort((x, y) => x.place - y.place), mine = bet ? lanes.find((l) => l.s.id === bet) : null;
        p.status((mine ? (mine.place === 1 ? 'Your bet won! ' : 'Your bet came ' + PLACES[mine.place - 1] + '. ') : '') + 'Finished: ' + order.map((l) => PLACES[l.place - 1] + ' ' + l.s.short + ' (' + fmt(l.steps) + ' steps)').join(', ') + '.');
        history.unshift({ name: pz.name, lanes: lanes.map((l) => ({ steps: l.steps, place: l.place })), bet: mine ? mine.place : 0 });
        if (history.length > 12) history.pop();
        hist(); later();
      },
      onReset: () => { fin.cancel(); build(); p.status('Who will win? Make your bet, then press Play.'); later(); }
    });
    raceBox.append(legend(el, [['background:var(--paper-2);border:1px solid var(--rule)', 'Given'], ['background:var(--k-quiz)', 'Guessed digit'], ['background:var(--ok)', 'Deduced (forced by the rules)'],
      ['background:var(--warn);opacity:.45', 'Warmer: rewritten more often'], ['background:var(--err);opacity:.6', 'Just erased (backing up)']]));
    const tableBox = el('div', { class: 'lg-wrap' }), histBox = el('div', { class: 'lg-wrap' });
    raceBox.append(tableBox, histBox);
    function* race() {
      let tick = 0, finished = 0, lastAt = -1, lastPlace = 0;
      while (lanes.some((l) => !l.done)) {
        tick++;
        const t = now();
        for (const l of lanes) {
          if (l.done) continue;
          for (;;) {
            const r = l.it.next();
            if (r.done) { l.done = true; l.cur = -1; finished++; l.place = tick === lastAt ? lastPlace : finished; lastAt = tick; lastPlace = l.place; break; }
            const ev = r.value;
            if (ev.t === 'back') { l.backs++; continue; }
            const i = ev.i; l.steps++; l.cur = i; l.heat[i]++; l.flash[i] = t; l.flashAt[i] = l.steps;
            if (ev.t === 'erase') { l.g[i] = 0; l.kind[i] = 0; l.flashK[i] = 2; }
            else { l.g[i] = ev.v; l.kind[i] = ev.t === 'guess' ? 2 : 3; l.flashK[i] = 1; if (ev.t === 'guess') l.guesses++; else l.deduced++; }
            break;
          }
        }
        yield tick;
      }
    }
    let rows = null;
    function table() {
      if (!rows || rows.length !== lanes.length) {
        rows = lanes.map(() => ({ tr: el('tr'), cells: [0, 1, 2, 3, 4, 5].map(() => el('td')) }));
        rows.forEach((r) => r.tr.append(...r.cells));
        tableBox.replaceChildren(el('table', { class: 'lg-table' }, el('caption', {}, 'This race'),
          el('thead', {}, el('tr', {}, ['Solver', 'Guesses', 'Taken back', 'Deduced', 'Steps', 'Place'].map((h) => el('th', { scope: 'col' }, h)))),
          el('tbody', {}, rows.map((r) => r.tr))));
      }
      lanes.forEach((l, k) => {
        const c = rows[k].cells, vals = [l.s.name, fmt(l.guesses), fmt(l.backs), fmt(l.deduced), fmt(l.steps), l.done ? PLACES[l.place - 1] : '…'];
        vals.forEach((v, j) => { if (c[j].textContent !== v) c[j].textContent = v; });
        rows[k].tr.className = l.done && l.place === 1 ? 'win' : '';
      });
    }
    function hist() {
      if (!history.length) { histBox.replaceChildren(); return; }
      histBox.replaceChildren(el('table', { class: 'lg-table' }, el('caption', {}, 'Races so far (steps; the winner in green)'),
        el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, 'Puzzle'), SOLVERS.map((s) => el('th', { scope: 'col' }, s.short)), el('th', { scope: 'col' }, 'Your bet'))),
        el('tbody', {}, history.map((h) => el('tr', {}, el('td', {}, h.name),
          h.lanes.map((x) => el('td', { style: x.place === 1 ? 'color:var(--ok);font-weight:600' : null }, fmt(x.steps))),
          el('td', {}, h.bet ? (h.bet === 1 ? 'won' : PLACES[h.bet - 1]) : '—'))))));
    }
    function drawRace(ctx, w, h, c) {
      ctx.fillStyle = c.paper; ctx.fillRect(0, 0, w, h);
      const lw = w / 3, t = now(), dark = isDark(c); let fading = false;
      lanes.forEach((l, k) => {
        const x0 = k * lw, side = Math.min(340, lw - 8), cs = side / 9, ox = Math.round(x0 + (lw - side) / 2), oy = 44, small = lw < 190;
        if (k) { ctx.fillStyle = c.rule; ctx.fillRect(Math.round(x0), 4, 1, h - 8); }
        ctx.textBaseline = 'top'; ctx.textAlign = 'left';
        ctx.font = '600 ' + (small ? 12 : 13) + 'px ' + c.sans; ctx.fillStyle = l.done && l.place === 1 ? c.ok : c.ink;
        ctx.fillText((small ? l.s.short : l.s.name) + (l.done ? ' · ' + PLACES[l.place - 1] : ''), ox, 6);
        ctx.font = (small ? 11 : 12) + 'px ' + c.sans; ctx.fillStyle = c.ink2;
        ctx.fillText(fmt(l.steps) + ' steps' + (small ? '' : ' · ' + fmt(l.guesses) + ' guesses · ' + fmt(l.backs) + ' back'), ox, 24);
        for (let i = 0; i < 81; i++) {
          const x = ox + (i % 9) * cs, y = oy + ((i / 9) | 0) * cs;
          if (l.kind[i] === 1) { ctx.fillStyle = c.paper2; ctx.fillRect(x, y, cs, cs); }
          if (l.heat[i] > 1) { ctx.globalAlpha = Math.min(dark ? 0.24 : 0.32, 0.045 * Math.log2(l.heat[i])); ctx.fillStyle = c.warn; ctx.fillRect(x, y, cs, cs); ctx.globalAlpha = 1; }
          const age = t - l.flash[i];
          if (!rm && l.flash[i] && age < 420 && l.steps - l.flashAt[i] < 8) { ctx.globalAlpha = 0.5 * (1 - age / 420) * (1 - (l.steps - l.flashAt[i]) / 8); ctx.fillStyle = l.flashK[i] === 2 ? c.err : c.accent; ctx.fillRect(x, y, cs, cs); ctx.globalAlpha = 1; fading = true; }
          if (l.g[i]) {
            ctx.fillStyle = l.kind[i] === 1 ? c.ink : l.kind[i] === 2 ? c.quiz : c.ok;
            ctx.font = (l.kind[i] === 1 ? '700 ' : '600 ') + Math.round(cs * 0.62) + 'px ' + c.sans; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(String(l.g[i]), x + cs / 2, y + cs / 2 + 1);
          }
        }
        ctx.strokeStyle = c.rule; ctx.lineWidth = 1; ctx.beginPath();
        for (let q = 1; q < 9; q++) if (q % 3) { ctx.moveTo(ox + q * cs, oy); ctx.lineTo(ox + q * cs, oy + side); ctx.moveTo(ox, oy + q * cs); ctx.lineTo(ox + side, oy + q * cs); }
        ctx.stroke();
        ctx.strokeStyle = c.ink2; ctx.lineWidth = 2; ctx.beginPath();
        for (let q = 0; q <= 9; q += 3) { ctx.moveTo(ox + q * cs, oy); ctx.lineTo(ox + q * cs, oy + side); ctx.moveTo(ox, oy + q * cs); ctx.lineTo(ox + side, oy + q * cs); }
        ctx.stroke();
        if (l.cur >= 0 && !l.done) { ctx.strokeStyle = c.accent; ctx.lineWidth = 2.5; ctx.strokeRect(ox + (l.cur % 9) * cs + 1.5, oy + ((l.cur / 9) | 0) * cs + 1.5, cs - 3, cs - 3); }
      });
      if (fading) later();   // keep drawing until the flashes have faded
    }

    // ----- solving it yourself
    const soloBox = el('div'); soloBox.hidden = true; host.append(soloBox);
    let u = [], sel = 0, mark = -1, pendingHint = null, wrongShown = null, showCands = false, solvedShown = false;
    const left = el('div'), right = el('div'), soloWrap = el('div', { class: 'lg-solo' }, left, right);
    soloBox.append(el('p', { class: 'lg-hint' }, 'Click a cell (or move with the arrow keys), then type a digit or press a button below. Backspace clears. Digits that clash with another in the same row, column or box turn red. Stuck? Hint names the next step a person can take, and the reason for it.'), soloWrap);
    const soloCv = api.canvas(left, { label: 'Sudoku grid to fill in', maxWidth: 480, height: (w) => w, draw: drawSolo });
    soloCv.canvas.parentNode.classList.add('lg-canvas'); soloCv.canvas.parentNode.style.maxWidth = '482px'; soloCv.canvas.tabIndex = 0;
    const msg = el('p', { class: 'lg-msg', role: 'status' }), where = el('p', { class: 'lg-hint', 'aria-live': 'polite' });
    const pad = el('div', { class: 'lg-pad', role: 'group', 'aria-label': 'Digits' },
      [1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => el('button', { class: 'btn', type: 'button', onclick: () => { write(d); soloCv.canvas.focus({ preventScroll: true }); } }, String(d))),
      el('button', { class: 'btn quiet', type: 'button', 'aria-label': 'Erase', onclick: () => { write(0); soloCv.canvas.focus({ preventScroll: true }); } }, '⌫'));
    const candBox = el('input', { type: 'checkbox', onchange: () => { showCands = candBox.checked; soloCv.redraw(); } });
    right.append(pad,
      el('div', { class: 'algo-controls' }, el('button', { class: 'btn primary', type: 'button', onclick: hint }, 'Hint'),
        el('button', { class: 'btn', type: 'button', onclick: check }, 'Check'),
        el('button', { class: 'btn quiet', type: 'button', onclick: () => { soloRestart(); msg.textContent = 'Back to the start.'; } }, 'Start again'),
        el('label', {}, candBox, ' Show candidates')),
      msg, where);
    function soloRestart() { u = Array.from(pz.grid); sel = u.indexOf(0); if (sel < 0) sel = 0; mark = -1; pendingHint = null; wrongShown = null; solvedShown = false; msg.className = 'lg-msg'; msg.textContent = ''; describe(); soloCv.redraw(); }
    function describe() {
      const v = u[sel], given = !!pz.grid[sel];
      where.textContent = 'Selected: ' + cellName(sel) + (v ? (given ? ', given ' : ', your ') + v : ', empty') + '.';
      soloCv.canvas.setAttribute('aria-label', 'Sudoku grid. ' + where.textContent + ' Arrow keys move, digits fill, Backspace clears.');
    }
    function write(d) {
      if (pz.grid[sel]) { msg.className = 'lg-msg'; msg.textContent = 'That cell is a given: it cannot change.'; return; }
      u[sel] = d; pendingHint = null; wrongShown = null; mark = -1;
      const bad = conflicts(u);
      if (d && bad[sel]) { msg.className = 'lg-msg bad'; msg.textContent = 'A ' + d + ' is already in the same ' + clashUnit(sel) + '.'; }
      else if (u.every((x) => x) && isSolution(u, pz.grid)) { msg.className = 'lg-msg win'; msg.textContent = 'Solved! Every row, column and box holds 1 to 9 exactly once.'; solvedShown = true; }
      else { msg.className = 'lg-msg'; msg.textContent = ''; }
      describe(); soloCv.redraw();
    }
    function clashUnit(i) { for (const k of UNITS_OF[i]) for (const j of UNITS[k]) if (j !== i && u[j] === u[i]) return unitName(k).replace(/ \d+$/, ''); return 'unit'; }
    function hint() {
      const bad = conflicts(u), bi = bad.indexOf(1);
      if (bi >= 0) { sel = bi; mark = bi; msg.className = 'lg-msg bad'; msg.textContent = 'First fix the clash: two ' + u[bi] + 's in the same ' + clashUnit(bi) + ' (marked in red).'; describe(); soloCv.redraw(); return; }
      const wrong = u.findIndex((v, i) => v && v !== solution[i]);
      if (wrong >= 0) { sel = wrong; mark = wrong; msg.className = 'lg-msg bad'; msg.textContent = 'The ' + u[wrong] + ' in ' + cellName(wrong) + ' breaks no rule yet, but it is not in the solution: it leads to a dead end later.'; describe(); soloCv.redraw(); return; }
      if (u.every((x) => x)) { msg.className = 'lg-msg win'; msg.textContent = 'Solved already!'; return; }
      if (pendingHint && pendingHint.i === sel && !u[sel]) { const h = pendingHint; pendingHint = null; write(h.v); if (!solvedShown) { msg.className = 'lg-msg'; msg.textContent = 'Filled in: ' + h.v + ' at ' + cellName(h.i) + '. Press Hint for the next step.'; } return; }
      const h = nextHint(u);
      if (h) { sel = h.i; mark = h.i; pendingHint = h; msg.className = 'lg-msg'; msg.textContent = h.text + ' Press Hint again to fill it in.'; describe(); soloCv.redraw(); return; }
      // no single anywhere: show the cell a solver would guess in, and offer the answer from the solution
      let best = -1, bc = 10, bm = 0;
      for (let i = 0; i < 81; i++) if (!u[i]) { let used = 0; for (const q of PEERS[i]) if (u[q]) used |= 1 << u[q]; const m = ALL & ~used; if (POP[m] < bc) { bc = POP[m]; best = i; bm = m; } }
      sel = best; mark = best; pendingHint = { i: best, v: solution[best] };
      msg.className = 'lg-msg'; msg.textContent = 'No single is left: every empty cell has two or more candidates, and every digit still has two or more places in each row, column and box. A solver would guess now, in a cell with the fewest candidates: ' + cellName(best) + ' can be ' + digitsOf(bm).join(' or ') + '. (People use cleverer patterns here.) Press Hint again to take the digit from the solution.';
      describe(); soloCv.redraw();
    }
    function check() {
      const wrong = []; let filled = 0;
      u.forEach((v, i) => { if (v && !pz.grid[i]) { filled++; if (v !== solution[i]) wrong.push(i); } });
      wrongShown = wrong; mark = -1;
      msg.className = wrong.length ? 'lg-msg bad' : 'lg-msg';
      msg.textContent = !filled ? 'Nothing filled in yet.' : wrong.length ? wrong.length + ' of your ' + filled + ' digits ' + (wrong.length === 1 ? 'is' : 'are') + ' not in the solution (crossed out).' : 'All ' + filled + ' of your digits are right so far.';
      soloCv.redraw();
    }
    soloCv.canvas.addEventListener('pointerdown', (e) => {
      const r = soloCv.canvas.getBoundingClientRect(), cs = r.width / 9, col = Math.floor((e.clientX - r.left) / cs), row = Math.floor((e.clientY - r.top) / cs);
      if (col < 0 || col > 8 || row < 0 || row > 8) return;
      sel = row * 9 + col; describe(); soloCv.redraw(); soloCv.canvas.focus({ preventScroll: true }); e.preventDefault();
    });
    soloCv.canvas.addEventListener('keydown', (e) => {
      const k = e.key; let r = (sel / 9) | 0, c2 = sel % 9;
      if (k === 'ArrowLeft') c2 = (c2 + 8) % 9; else if (k === 'ArrowRight') c2 = (c2 + 1) % 9; else if (k === 'ArrowUp') r = (r + 8) % 9; else if (k === 'ArrowDown') r = (r + 1) % 9;
      else if (/^[1-9]$/.test(k)) { e.preventDefault(); write(+k); return; }
      else if (k === 'Backspace' || k === 'Delete' || k === '0' || k === ' ' || k === '.') { e.preventDefault(); write(0); return; }
      else return;
      e.preventDefault(); sel = r * 9 + c2; describe(); soloCv.redraw();
    });
    soloCv.canvas.addEventListener('focus', () => soloCv.redraw()); soloCv.canvas.addEventListener('blur', () => soloCv.redraw());
    function drawSolo(ctx, w, h, c) {
      ctx.fillStyle = c.paper; ctx.fillRect(0, 0, w, h);
      const pd = 2, side = Math.min(w, h) - 2 * pd, cs = side / 9, ox = pd, oy = pd, bad = conflicts(u), sv = u[sel];
      const sr = (sel / 9) | 0, sc = sel % 9, sb = boxOf(sel), focused = document.activeElement === soloCv.canvas;
      for (let i = 0; i < 81; i++) {
        const x = ox + (i % 9) * cs, y = oy + ((i / 9) | 0) * cs;
        let bg = null;
        if (pz.grid[i]) bg = c.paper2;
        if (((i / 9) | 0) === sr || i % 9 === sc || boxOf(i) === sb) bg = c.accentSoft;
        if (sv && u[i] === sv) bg = c.okSoft;
        if (bad[i]) bg = c.errSoft;
        if (bg) { ctx.fillStyle = bg; ctx.fillRect(x, y, cs, cs); }
        if (pz.grid[i] && bg !== c.paper2 && !bad[i]) { ctx.globalAlpha = 0.5; ctx.fillStyle = c.paper2; ctx.fillRect(x, y, cs, cs); ctx.globalAlpha = 1; }
        if (u[i]) {
          ctx.fillStyle = bad[i] ? c.err : pz.grid[i] ? c.ink : c.link;
          ctx.font = (pz.grid[i] ? '700 ' : '500 ') + Math.round(cs * 0.6) + 'px ' + c.sans; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(String(u[i]), x + cs / 2, y + cs / 2 + 1);
          if (wrongShown && wrongShown.includes(i)) { ctx.strokeStyle = c.err; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + cs * 0.2, y + cs * 0.8); ctx.lineTo(x + cs * 0.8, y + cs * 0.2); ctx.stroke(); }
        } else if (showCands) {
          let used = 0; for (const q of PEERS[i]) if (u[q]) used |= 1 << u[q];
          ctx.fillStyle = c.ink3; ctx.font = Math.max(8, Math.round(cs * 0.24)) + 'px ' + c.sans; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          for (let d = 1; d <= 9; d++) if (!(used & (1 << d))) ctx.fillText(String(d), x + cs * (0.2 + 0.3 * ((d - 1) % 3)), y + cs * (0.22 + 0.29 * (((d - 1) / 3) | 0)) + 1);
        }
      }
      ctx.strokeStyle = c.rule2 || c.rule; ctx.lineWidth = 1; ctx.beginPath();
      for (let q = 1; q < 9; q++) if (q % 3) { ctx.moveTo(ox + q * cs, oy); ctx.lineTo(ox + q * cs, oy + side); ctx.moveTo(ox, oy + q * cs); ctx.lineTo(ox + side, oy + q * cs); }
      ctx.stroke();
      ctx.strokeStyle = c.ink; ctx.lineWidth = 2.5; ctx.beginPath();
      for (let q = 0; q <= 9; q += 3) { ctx.moveTo(ox + q * cs, oy); ctx.lineTo(ox + q * cs, oy + side); ctx.moveTo(ox, oy + q * cs); ctx.lineTo(ox + side, oy + q * cs); }
      ctx.stroke();
      if (mark >= 0) { ctx.strokeStyle = pendingHint ? c.ok : c.err; ctx.lineWidth = 3; ctx.setLineDash([5, 4]); ctx.strokeRect(ox + (mark % 9) * cs + 4, oy + ((mark / 9) | 0) * cs + 4, cs - 8, cs - 8); ctx.setLineDash([]); }
      ctx.strokeStyle = c.accent; ctx.lineWidth = focused ? 3.5 : 2.5; ctx.strokeRect(ox + sc * cs + 1.5, oy + sr * cs + 1.5, cs - 3, cs - 3);
    }
    soloRestart();
    p.status('Who will win? Make your bet, then press Play.');   // no autoplay: the bet comes first
    later();
    return () => { p.stop(); cv.stop(); soloCv.stop(); later.cancel(); fin.cancel(); };
  }
  // ---------------------------------------------------------------- demo 2: n queens
  /** A queen: a crown with five points on a base, centred at (x, y), s across. */
  function drawQueen(ctx, x, y, s, fill, line) {
    const w = s * 0.78, hgt = s * 0.62, top = y - hgt / 2, bot = y + hgt / 2, l = x - w / 2, r = x + w / 2;
    ctx.beginPath();
    ctx.moveTo(l + w * 0.1, bot);
    ctx.lineTo(l, top + hgt * 0.22);
    ctx.lineTo(l + w * 0.27, top + hgt * 0.55);
    ctx.lineTo(x - w * 0.12, top);
    ctx.lineTo(x, top + hgt * 0.5);
    ctx.lineTo(x + w * 0.12, top);
    ctx.lineTo(r - w * 0.27, top + hgt * 0.55);
    ctx.lineTo(r, top + hgt * 0.22);
    ctx.lineTo(r - w * 0.1, bot);
    ctx.closePath();
    ctx.fillStyle = fill; ctx.fill(); ctx.lineJoin = 'round'; ctx.strokeStyle = line; ctx.lineWidth = Math.max(1, s * 0.05); ctx.stroke();
    ctx.fillRect(l + w * 0.1, bot + s * 0.04, w * 0.8, s * 0.09);
    for (const px of [l, x - w * 0.12, x + w * 0.12, r]) { ctx.beginPath(); ctx.arc(px, (px === l || px === r ? top + hgt * 0.22 : top) - s * 0.04, s * 0.06, 0, 2 * Math.PI); ctx.fill(); }
  }
  function mountQueens(host, api) {
    injectCss();
    const el = api.el, rm = api.reducedMotion();
    let n = 8, safeOnly = true, mode = 'watch', rows = new Int8Array(n).fill(-1), reject = null, sols = [], counts = countQueens(n);
    let placed = 0, removed = 0, rejected = 0, flashSol = 0, mine = [], cursor = [0, 0], showLive = false, liveCache = null, done = false;
    const [sizeL] = selectBox(el, 'Board', [4, 5, 6, 7, 8, 9, 10, 11, 12].map((k) => [k, k + ' × ' + k]), n, (v) => { n = +v; counts = countQueens(n); p.reset(); mine = []; cursor = [0, 0]; liveCache = null; sizes(); update(); });
    const [searchL] = selectBox(el, 'Search', [['safe', 'Only safe rows (prune)'], ['all', 'Every row, then check']], 'safe', (v) => { safeOnly = v === 'safe'; p.reset(); });
    const pauseBox = el('input', { type: 'checkbox' });
    const watchBox = el('div', {}, el('div', { class: 'algo-controls' }, searchL, el('label', {}, pauseBox, ' Pause at each solution')),
      el('p', { class: 'lg-hint' }, 'The computer puts one queen in each column, left to right, trying the rows from the top. When a column has no square left that no queen attacks, it backs up: it takes back the queen in the column before and tries that queen lower down. Shaded squares are attacked by the queens on the board.'));
    const playBox = el('div', {}, el('p', { class: 'lg-hint' }, 'Click a square to put a queen there or take it away (or move with the arrow keys and press Enter). After every move the solver counts how many of the solutions still contain all your queens.'),
      el('div', { class: 'algo-controls' }, el('label', {}, el('input', { type: 'checkbox', onchange: (e) => { showLive = e.target.checked; liveCache = null; update(); } }), ' Show the squares that still lead to a solution'),
        el('button', { class: 'btn quiet', type: 'button', onclick: () => { mine = []; liveCache = null; update(); } }, 'Clear the board')));
    playBox.hidden = true;
    host.append(tabs(el, [['watch', 'Watch the computer'], ['play', 'Place queens yourself']], mode, (v) => {
      mode = v; watchBox.hidden = v !== 'watch'; playBox.hidden = v !== 'play'; p.controls.hidden = v !== 'watch'; galBox.hidden = v !== 'watch'; if (v === 'play') p.pause(); liveCache = null; update();
    }), el('div', { class: 'algo-controls' }, sizeL), watchBox, playBox);
    const cv = api.canvas(host, { label: 'A chessboard with queens', maxWidth: 520, height: (w) => w, draw });
    cv.canvas.parentNode.classList.add('lg-canvas'); cv.canvas.parentNode.style.maxWidth = '522px'; cv.canvas.tabIndex = 0;
    const msg = el('p', { class: 'lg-msg', role: 'status' }), stats = el('div', { class: 'lg-stats' });
    host.append(msg, stats);
    const later = onceAFrame(() => update());
    const p = api.player(host, {
      speeds: rm ? [20, 20000] : [1, 20000], speed: 38,
      start: () => { rows = new Int8Array(n).fill(-1); sols = []; placed = removed = rejected = 0; reject = null; done = false; return queens(n, safeOnly); },
      onStep: (ev) => {
        reject = null;
        if (ev.t === 'place') { rows[ev.c] = ev.r; placed++; }
        else if (ev.t === 'remove') { rows[ev.c] = -1; removed++; }
        else if (ev.t === 'reject') { reject = [ev.c, ev.r]; rejected++; }
        else if (ev.t === 'solution') { sols.push(ev.rows); flashSol = now(); if (pauseBox.checked) p.pause(); }
        later();
      },
      onDone: () => { done = true; reject = null; later(); },
      onReset: () => { rows = new Int8Array(n).fill(-1); sols = []; placed = removed = rejected = 0; reject = null; done = false; later(); }
    });
    // the search tree's size three ways, and the solutions found so far as small boards
    const sizeBox = el('div', { class: 'lg-wrap' });
    const galWrap = el('div', { class: 'algo-canvas', style: 'margin-top:0.6rem' }), gal = el('canvas', { role: 'img', 'aria-label': 'The solutions found so far, as small boards' });
    galWrap.append(gal); const galBox = el('div', {}, el('p', { class: 'lg-hint', style: 'margin-top:0.8rem' }, 'The solutions found so far (the newest in green):'), galWrap); host.append(sizeBox, galBox);
    function sizes() {
      const brute = bruteLeaves(n), f = (x) => BigInt(x).toLocaleString('en-US');
      sizeBox.replaceChildren(el('table', { class: 'lg-table' }, el('caption', {}, 'How much work, on ' + n + ' × ' + n + ' (' + fmt(counts.solutions) + ' solutions)'),
        el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, 'Method'), el('th', { scope: 'col' }, 'Queens placed'))),
        el('tbody', {},
          el('tr', {}, el('td', {}, 'Every arrangement with one queen per column, checked only when the board is full'), el('td', {}, f(brute))),
          el('tr', {}, el('td', {}, 'Backtracking: try every row, take a queen back as soon as it is attacked'), el('td', {}, f(counts.tried))),
          el('tr', { class: 'win' }, el('td', {}, 'Backtracking: choose the next queen only from safe rows'), el('td', {}, f(counts.placed))))));
    }
    sizes();
    const GAL_MAX = 120;
    function drawGallery() {
      const c = api.colors(), w = Math.max(200, galWrap.clientWidth || 600), list = mode === 'play' ? [] : sols, shown = Math.min(GAL_MAX, list.length);
      const t = n <= 6 ? 34 : n <= 9 ? 44 : 52, gap = 8, per = Math.max(1, Math.floor((w - gap) / (t + gap))), lines = Math.max(1, Math.ceil((shown + (list.length > shown ? 1 : 0)) / per));
      const h = gap + lines * (t + gap), dpr = Math.min(3, window.devicePixelRatio || 1);
      gal.width = Math.round(w * dpr); gal.height = Math.round(h * dpr); gal.style.width = w + 'px'; gal.style.height = h + 'px';
      const ctx = gal.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = c.paper; ctx.fillRect(0, 0, w, h);
      if (!list.length) { ctx.fillStyle = c.ink3; ctx.font = '13px ' + c.sans; ctx.textBaseline = 'middle'; ctx.fillText(mode === 'play' ? 'Shown while the computer searches.' : 'None yet: press Play.', gap, h / 2); return; }
      const q = t / n;
      for (let k = 0; k < shown; k++) {
        const R = list[k], x = gap + (k % per) * (t + gap), y = gap + Math.floor(k / per) * (t + gap);
        for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) { ctx.fillStyle = (a + b) % 2 ? c.paper2 : c.paper; ctx.fillRect(x + b * q, y + a * q, q, q); }
        ctx.fillStyle = k === list.length - 1 && !done ? c.ok : c.ink;
        for (let col = 0; col < n; col++) { ctx.beginPath(); ctx.arc(x + (col + 0.5) * q, y + (R[col] + 0.5) * q, Math.max(1.2, q * 0.36), 0, 2 * Math.PI); ctx.fill(); }
        ctx.strokeStyle = c.rule; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, t - 1, t - 1);
      }
      if (list.length > shown) { const x = gap + (shown % per) * (t + gap), y = gap + Math.floor(shown / per) * (t + gap); ctx.fillStyle = c.ink2; ctx.font = '600 12px ' + c.sans; ctx.textBaseline = 'middle'; ctx.fillText('+' + fmt(list.length - shown), x + 2, y + t / 2); }
    }
    const galLater = onceAFrame(drawGallery); let galCount = -1;
    const ro = window.ResizeObserver ? new ResizeObserver(() => galLater()) : null; if (ro) ro.observe(galWrap);
    const mo = new MutationObserver(() => galLater()); mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // play mode: how many solutions contain the reader's queens?
    const attackedBy = (qs, r, c2) => qs.filter(([a, b]) => !(a === r && b === c2) && attacks(a, b, r, c2)).length;
    function live() {
      if (liveCache) return liveCache;
      const total = solutionsFrom(n, mine), ok = new Uint8Array(n * n);
      if (showLive && total) for (let r = 0; r < n; r++) for (let c2 = 0; c2 < n; c2++) if (!mine.some(([a, b]) => a === r && b === c2) && !attackedBy(mine, r, c2) && !mine.some(([, b]) => b === c2)) ok[r * n + c2] = solutionsFrom(n, mine.concat([[r, c2]])) > 0 ? 1 : 0;
      return (liveCache = { total, ok });
    }
    function toggle(r, c2) {
      const k = mine.findIndex(([a, b]) => a === r && b === c2);
      if (k >= 0) mine.splice(k, 1); else mine.push([r, c2]);
      liveCache = null; update();
    }
    function update() {
      const plural = (x, one, many) => fmt(x) + ' ' + (x === 1 ? one : many);
      if (mode === 'watch') {
        const onBoard = rows.filter((r) => r >= 0).length;
        msg.className = 'lg-msg' + (done ? ' win' : '');
        msg.textContent = done ? 'Done: all ' + plural(sols.length, 'solution', 'solutions') + ' found, after placing ' + fmt(placed) + ' queens.' :
          reject ? 'Column ' + (reject[0] + 1) + ', row ' + (reject[1] + 1) + ' is attacked: take that queen back and try lower down.' :
          !placed ? 'Press Play to watch the search.' : onBoard === n ? 'A solution! ' + n + ' queens and not one attacks another.' : onBoard + ' of ' + n + ' queens on the board.';
        stats.replaceChildren(el('span', {}, 'Queens placed ', el('b', {}, fmt(placed))), el('span', {}, 'Taken back ', el('b', {}, fmt(removed + rejected))),
          el('span', {}, 'Solutions found ', el('b', {}, fmt(sols.length)), ' of ' + fmt(counts.solutions)));
      } else {
        const L = live(), clash = mine.some(([r, c2]) => attackedBy(mine, r, c2) > 0);
        msg.className = 'lg-msg' + (clash ? ' bad' : mine.length === n && L.total ? ' win' : '');
        msg.textContent = !mine.length ? 'Place a queen anywhere. ' + plural(counts.solutions, 'solution is', 'solutions are') + ' possible on an empty ' + n + ' × ' + n + ' board.' :
          clash ? 'Two of your queens attack each other (shown in red): no solution contains both. Take one away.' :
          mine.length === n ? 'Solved! This is one of the ' + fmt(counts.solutions) + ' solutions.' :
          L.total ? plural(mine.length, 'queen', 'queens') + ', none attacking another. ' + plural(L.total, 'solution is', 'solutions are') + ' still possible from here.' :
          'No queen attacks another, and yet no solution contains these ' + mine.length + ': further on, some column will have no safe square. Take one back.';
        stats.replaceChildren(el('span', {}, 'Your queens ', el('b', {}, String(mine.length)), ' of ' + n), el('span', {}, 'Solutions still possible ', el('b', {}, fmt(clash ? 0 : L.total))));
      }
      cv.redraw();
      const gc = mode === 'play' ? -2 : sols.length;
      if (gc !== galCount) { galCount = gc; galLater(); }
    }
    function cellAt(e) { const r = cv.canvas.getBoundingClientRect(), q = r.width / n; return [Math.floor((e.clientY - r.top) / q), Math.floor((e.clientX - r.left) / q)]; }
    cv.canvas.addEventListener('pointerdown', (e) => {
      if (mode !== 'play') return;
      const [r, c2] = cellAt(e); if (r < 0 || r >= n || c2 < 0 || c2 >= n) return;
      cursor = [r, c2]; toggle(r, c2); cv.canvas.focus({ preventScroll: true }); e.preventDefault();
    });
    cv.canvas.addEventListener('keydown', (e) => {
      if (mode !== 'play') return;
      const k = e.key; let [r, c2] = cursor;
      if (k === 'ArrowLeft') c2 = Math.max(0, c2 - 1); else if (k === 'ArrowRight') c2 = Math.min(n - 1, c2 + 1); else if (k === 'ArrowUp') r = Math.max(0, r - 1); else if (k === 'ArrowDown') r = Math.min(n - 1, r + 1);
      else if (k === 'Enter' || k === ' ') { e.preventDefault(); toggle(r, c2); return; } else return;
      e.preventDefault(); cursor = [r, c2]; cv.canvas.setAttribute('aria-label', 'Chessboard, ' + n + ' by ' + n + '. Square: row ' + (r + 1) + ', column ' + (c2 + 1) + '. Enter places or removes a queen.'); cv.redraw();
    });
    cv.canvas.addEventListener('focus', () => cv.redraw()); cv.canvas.addEventListener('blur', () => cv.redraw());
    function draw(ctx, w, h, c) {
      ctx.fillStyle = c.paper; ctx.fillRect(0, 0, w, h);
      const q = Math.min(w, h) / n, qs = mode === 'watch' ? Array.from(rows).map((r, col) => [r, col]).filter(([r]) => r >= 0) : mine;
      const dark = isDark(c), t = now(), L = mode === 'play' ? live() : null;
      for (let r = 0; r < n; r++) for (let col = 0; col < n; col++) {
        const x = col * q, y = r * q;
        ctx.fillStyle = c.paper2; ctx.fillRect(x, y, q, q); if ((r + col) % 2) { ctx.globalAlpha = dark ? 0.1 : 0.08; ctx.fillStyle = c.ink; ctx.fillRect(x, y, q, q); ctx.globalAlpha = 1; }
        const a = attackedBy(qs, r, col);
        if (a && !qs.some(([qr, qc]) => qr === r && qc === col)) { ctx.globalAlpha = Math.min(0.42, (dark ? 0.2 : 0.14) + 0.07 * (a - 1)); ctx.fillStyle = c.quiz; ctx.fillRect(x, y, q, q); ctx.globalAlpha = 1; }
        if (L && L.ok[r * n + col]) { ctx.fillStyle = c.ok; ctx.beginPath(); ctx.arc(x + q / 2, y + q / 2, q * 0.13, 0, 2 * Math.PI); ctx.fill(); }
      }
      if (mode === 'watch' && !done) {   // the column the search is working on
        let col = rows.indexOf(-1); if (reject) col = reject[0];
        if (col >= 0) { ctx.strokeStyle = c.accent; ctx.lineWidth = 3; ctx.strokeRect(col * q + 1.5, 1.5, q - 3, n * q - 3); }
      }
      const flash = mode === 'watch' && !rm && t - flashSol < 600 && qs.length === n;
      for (const [r, col] of qs) {
        const hit = attackedBy(qs, r, col) > 0;
        drawQueen(ctx, (col + 0.5) * q, (r + 0.5) * q, q * 0.82, hit ? c.err : flash ? c.ok : c.ink, c.paper);
      }
      if (reject) {
        const [col, r] = reject;
        ctx.globalAlpha = 0.85; drawQueen(ctx, (col + 0.5) * q, (r + 0.5) * q, q * 0.82, c.err, c.paper); ctx.globalAlpha = 1;
        ctx.strokeStyle = c.err; ctx.lineWidth = Math.max(2, q * 0.07); ctx.beginPath();
        ctx.moveTo(col * q + q * 0.18, r * q + q * 0.18); ctx.lineTo(col * q + q * 0.82, r * q + q * 0.82); ctx.moveTo(col * q + q * 0.82, r * q + q * 0.18); ctx.lineTo(col * q + q * 0.18, r * q + q * 0.82); ctx.stroke();
      }
      if (mode === 'play' && document.activeElement === cv.canvas) { ctx.strokeStyle = c.accent; ctx.lineWidth = 3; ctx.strokeRect(cursor[1] * q + 2, cursor[0] * q + 2, q - 4, q - 4); }
      if (flash) later();
    }
    update();
    p.status('');
    return () => { p.stop(); cv.stop(); later.cancel(); galLater.cancel(); if (ro) ro.disconnect(); mo.disconnect(); };
  }
  // ---------------------------------------------------------------- demo 3: the minimum spanning tree race
  const KM = 100;   // the map is one unit wide; call that 100 km
  function mountMST(host, api) {
    injectCss();
    const el = api.el, rm = api.reducedMotion(), AR = 0.6;
    let count = 12, seed = 1 + Math.floor(Math.random() * 99999), pts = makeTowns(count, seed, AR), E = makeRoads(pts), best = runToEnd(kruskal(pts.length, E));
    let mine = new Set(), clickMode = 'roads', overlay = false, bet = '', lanes = [], raceOver = false, focusRoad = -1, countAll = false;
    const [countL, countSel] = selectBox(el, 'Towns', [6, 8, 12, 16, 20, 30, 45].map((k) => [k, k + ' towns']), count, (v) => { count = +v; seed = 1 + Math.floor(Math.random() * 999999); newMap(makeTowns(count, seed, AR)); });
    const [modeL] = selectBox(el, 'Clicking the map', [['roads', 'builds or removes a road'], ['towns', 'adds or removes a town']], clickMode, (v) => { clickMode = v; update(); });
    const [measureL] = selectBox(el, 'Count', [['decide', 'roads decided'], ['touch', 'every road touched']], 'decide', (v) => { countAll = v === 'touch'; p.reset(); });
    const ovBox = el('input', { type: 'checkbox', onchange: () => { overlay = ovBox.checked; ovKey.hidden = !overlay; later(); } });
    const ovKey = legend(el, MSTS.map((a, k) => ['background:var(' + ['--link', '--k-quiz', '--accent'][k] + ')', a.short + ' on my map'])); ovKey.hidden = true;
    const betSel = el('select', { 'aria-label': 'Your bet', onchange: () => { bet = betSel.value; } }, el('option', { value: '' }, 'no bet'), MSTS.map((a) => el('option', { value: a.id }, a.name)));
    host.append(el('div', { class: 'algo-controls' }, countL,
      el('button', { class: 'btn', type: 'button', onclick: () => { seed = 1 + Math.floor(Math.random() * 999999); newMap(makeTowns(count, seed, AR)); } }, 'New towns'),
      el('button', { class: 'btn quiet', type: 'button', onclick: () => { mine.clear(); update(); } }, 'Clear my roads'), modeL),
      el('p', { class: 'lg-hint' }, 'The towns need electricity. Every grey line is a route where a cable could run; its length is the distance. Click the routes to build a network that reaches every town, as short as you can make it. Then bet on an algorithm and press Play: three of them race to the shortest network there is.'),
      el('div', { class: 'algo-controls' }, el('label', {}, 'Who will win? ', betSel), measureL, el('label', {}, ovBox, ' Draw the algorithms on my map too')));
    function newMap(np) { pts = np; E = makeRoads(pts); best = runToEnd(kruskal(pts.length, E)); mine = new Set(); focusRoad = -1; p.reset(); update(); }
    function build() {
      raceOver = false;
      lanes = MSTS.map((al) => ({ al, it: null, ok: new Set(), no: new Set(), front: new Set(), bestE: new Set(), inT: new Uint8Array(pts.length), up: Array.from(pts, (_, i) => i), size: new Array(pts.length).fill(1),
        looked: 0, cur: -1, curOk: false, round: 0, len: 0, done: false, place: 0 }));
    }
    build();
    const root = (l, x) => { while (l.up[x] !== x) x = l.up[x] = l.up[l.up[x]]; return x; };
    const join = (l, a, b) => { let ra = root(l, a), rb = root(l, b); if (ra === rb) return; if (l.size[ra] < l.size[rb]) [ra, rb] = [rb, ra]; l.up[rb] = ra; l.size[ra] += l.size[rb]; };
    const mapH = (w) => Math.round(Math.min(520, w * AR));
    const laneH = (w) => Math.round((w / 3) * AR * 0.92 + 40);
    const cv = api.canvas(host, { label: 'A map of towns and the routes between them', maxWidth: 1100, height: (w) => mapH(w) + 12 + laneH(w), draw });
    cv.canvas.parentNode.classList.add('lg-canvas'); cv.canvas.tabIndex = 0;
    const msg = el('p', { class: 'lg-msg', role: 'status' }), stats = el('div', { class: 'lg-stats' });
    host.insertBefore(stats, cv.canvas.parentNode); host.insertBefore(msg, cv.canvas.parentNode); host.insertBefore(ovKey, cv.canvas.parentNode);
    const later = onceAFrame(() => { cv.redraw(); table(); });
    const p = api.player(host, {
      speeds: rm ? [10, 2000] : [1, 2000], speed: 36,
      extra: [el('button', { class: 'btn quiet', type: 'button', onclick: () => { p.pause(); for (let k = 0; k < 1e6 && p.step(); k++); } }, 'Finish')],
      start: () => { build(); for (const l of lanes) l.it = l.al.gen(pts.length, E); return race(); },
      onStep: () => later(),
      onDone: () => {
        raceOver = true;
        const order = lanes.slice().sort((x, y) => x.place - y.place), b = bet ? lanes.find((l) => l.al.id === bet) : null;
        p.status((b ? (b.place === 1 ? 'Your bet won! ' : 'Your bet came ' + PLACES[b.place - 1] + '. ') : '') + order.map((l) => PLACES[l.place - 1] + ' ' + l.al.short + ' (' + l.looked + ' looked at)').join(', ') + '. All three built the same network: ' + (best.total * KM).toFixed(1) + ' km.');
        update();
      },
      onReset: () => { build(); p.status('Who will win? Make your bet, then press Play.'); update(); }
    });
    host.append(legend(el, [['background:var(--warn)', 'Your roads'], ['background:var(--ok);opacity:.45', 'The shortest network (after the race)'], ['background:var(--k-quiz)', 'Being looked at, or waiting in Prim’s queue (dashed)'],
      ['background:var(--err);opacity:.6', 'Rejected: it would close a loop'], ['background:linear-gradient(90deg,hsl(40,65%,46%),hsl(150,65%,40%),hsl(260,65%,55%))', 'Towns of one colour are already joined']]));
    const tableBox = el('div', { class: 'lg-wrap' }); host.append(tableBox);
    function* race() {
      let tick = 0, finished = 0, lastAt = -1, lastPlace = 0;
      while (lanes.some((l) => !l.done)) {
        tick++;
        for (const l of lanes) {
          if (l.done) continue;
          for (;;) {
            const r = l.it.next();
            if (r.done) { l.done = true; l.cur = -1; finished++; l.place = tick === lastAt ? lastPlace : finished; lastAt = tick; lastPlace = l.place; l.front.clear(); l.bestE.clear(); break; }
            const ev = r.value;
            if (ev.t === 'push') { l.front.add(ev.e); if (!countAll) continue; l.looked++; l.cur = ev.e; l.curOk = true; break; }
            if (ev.t === 'round') { l.round = ev.k; l.bestE.clear(); continue; }
            if (ev.t === 'best') { l.bestE.add(ev.e); continue; }
            l.looked++; l.cur = ev.e; l.curOk = !!ev.ok;
            if (ev.t === 'edge') {
              l.front.delete(ev.e);
              if (ev.ok) { l.ok.add(ev.e); l.len += E[ev.e][2]; join(l, E[ev.e][0], E[ev.e][1]); l.inT[E[ev.e][0]] = l.inT[E[ev.e][1]] = 1; } else l.no.add(ev.e);
            }
            break;
          }
        }
        yield tick;
      }
    }
    let rows = null;
    function table() {
      if (!rows) {
        rows = MSTS.map(() => ({ tr: el('tr'), cells: [0, 1, 2, 3, 4].map(() => el('td')) })).concat([{ tr: el('tr'), cells: [0, 1, 2, 3, 4].map(() => el('td')) }]);
        rows.forEach((r) => r.tr.append(...r.cells));
        tableBox.replaceChildren(el('table', { class: 'lg-table' }, el('thead', {}, el('tr', {}, ['', 'Routes looked at', 'Roads built', 'Length', 'Place'].map((h, k) => el('th', { scope: 'col' }, k ? h : 'Who')))), el('tbody', {}, rows.map((r) => r.tr))));
      }
      const set = (r, vals, cls) => { vals.forEach((v, j) => { if (r.cells[j].textContent !== v) r.cells[j].textContent = v; }); r.tr.className = cls || ''; };
      lanes.forEach((l, k) => set(rows[k], [l.al.name, String(l.looked), l.ok.size + ' of ' + (pts.length - 1), (l.len * KM).toFixed(1) + ' km', l.done ? PLACES[l.place - 1] : '…'], l.done && l.place === 1 ? 'win' : ''));
      const ml = myLength();
      set(rows[lanes.length], ['You', '', String(mine.size), (ml * KM).toFixed(1) + ' km', groups() === 1 ? 'all joined' : '']);
    }
    const myLength = () => { let s = 0; for (const e of mine) s += E[e][2]; return s; };
    function groups() { const d = DSU(pts.length); let g = pts.length; for (const e of mine) if (d.union(E[e][0], E[e][1])) g--; return g; }
    function hasLoop() { const d = DSU(pts.length); for (const e of mine) if (!d.union(E[e][0], E[e][1])) return true; return false; }
    function update() {
      const g = groups(), ml = myLength(), bt = best.total, loop = hasLoop(), extra = [...mine].filter((e) => !best.edges.includes(e)).length;
      stats.replaceChildren(el('span', {}, 'Your roads ', el('b', {}, String(mine.size))), el('span', {}, 'Length ', el('b', {}, (ml * KM).toFixed(1) + ' km')),
        el('span', {}, g === 1 ? el('b', {}, 'every town joined') : [el('b', {}, String(g)), ' separate groups of towns']));
      let t = '', cls = 'lg-msg';
      if (clickMode === 'towns') t = 'Click empty ground to found a town, or a town to remove it (' + pts.length + ' towns now, at most 60).';
      else if (!mine.size) t = 'Click a route to build a road on it. A network of ' + pts.length + ' towns needs at least ' + (pts.length - 1) + ' roads.';
      else if (g > 1) t = (loop ? 'One of your roads closes a loop: you could remove one road of the loop and keep every town joined. ' : '') + 'Keep going: ' + g + ' groups of towns are not yet joined to each other.';
      else if (!raceOver) t = 'Every town is joined: ' + (ml * KM).toFixed(1) + ' km of road' + (loop ? ', but your roads close a loop, so at least one of them is not needed' : '') + '. Now bet and press Play to see the shortest possible network.';
      else if (Math.abs(ml - bt) < 1e-9) { t = 'You found the shortest network there is: ' + (bt * KM).toFixed(1) + ' km. As short as the algorithms!'; cls += ' win'; }
      else t = 'Yours is ' + (ml * KM).toFixed(1) + ' km, ' + (100 * (ml - bt) / bt).toFixed(1) + '% longer than the shortest, ' + (bt * KM).toFixed(1) + ' km. ' + extra + ' of your roads ' + (extra === 1 ? 'is' : 'are') + ' not in it (red on the map). Clear your roads and try again, or try new towns.';
      if (raceOver && g > 1) t = 'The shortest network is ' + (bt * KM).toFixed(1) + ' km (green on the map). ' + t;
      msg.className = cls; msg.textContent = t;
      later();
    }
    // geometry of the big map and of the three small ones
    const frame = (x0, y0, w, h) => { const s = Math.min(w, h / AR); return { ox: x0 + (w - s) / 2, oy: y0 + (h - s * AR) / 2, s }; };
    const P = (f, i) => [f.ox + pts[i][0] * f.s, f.oy + pts[i][1] * f.s];
    let big = null;
    function segDist(x, y, a, b) { const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy, t = L2 ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / L2)) : 0; return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy); }
    cv.canvas.addEventListener('pointerdown', (e) => {
      if (!big) return;
      const r = cv.canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (y > big.oy + big.s * AR + 8) return;   // the small maps are only to watch
      e.preventDefault(); cv.canvas.focus({ preventScroll: true });
      if (clickMode === 'roads') {
        let bi = -1, bd = 16;
        E.forEach((road, k) => { const d = segDist(x, y, P(big, road[0]), P(big, road[1])); if (d < bd) { bd = d; bi = k; } });
        if (bi >= 0) { focusRoad = bi; flip(bi); }
        return;
      }
      let ti = -1, td = 14;
      pts.forEach((_, i) => { const [px, py] = P(big, i), d = Math.hypot(px - x, py - y); if (d < td) { td = d; ti = i; } });
      if (ti >= 0) { if (pts.length > 3) newMap(pts.filter((_, i) => i !== ti)); return; }
      const nx = (x - big.ox) / big.s, ny = (y - big.oy) / big.s;
      if (pts.length >= 60 || nx < 0.01 || nx > 0.99 || ny < 0.01 || ny > AR - 0.01) return;
      if (pts.some((q) => Math.hypot(q[0] - nx, q[1] - ny) < 0.025)) return;
      newMap(pts.concat([[nx, ny]]));
    });
    function flip(k) { if (mine.has(k)) mine.delete(k); else mine.add(k); update(); }
    // keyboard: the arrow keys walk through the routes from left to right, Enter or Space builds or removes the one marked
    cv.canvas.addEventListener('keydown', (e) => {
      if (clickMode !== 'roads' || !E.length) return;
      const order = E.map((_, k) => k).sort((a, b) => (pts[E[a][0]][0] + pts[E[a][1]][0]) - (pts[E[b][0]][0] + pts[E[b][1]][0]));
      const at = order.indexOf(focusRoad);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') focusRoad = order[(at + 1) % order.length];
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') focusRoad = order[(at - 1 + order.length) % order.length];
      else if ((e.key === 'Enter' || e.key === ' ') && focusRoad >= 0) { e.preventDefault(); flip(focusRoad); return; }
      else return;
      e.preventDefault(); const rd = E[focusRoad];
      cv.canvas.setAttribute('aria-label', 'Route ' + (order.indexOf(focusRoad) + 1) + ' of ' + E.length + ', ' + (rd[2] * KM).toFixed(1) + ' km' + (mine.has(focusRoad) ? ', built' : '') + '. Enter builds or removes it.');
      later();
    });
    cv.canvas.addEventListener('blur', () => later());
    const hue = (r, dark) => 'hsl(' + Math.round(35 + (r * 137.508) % 290) + ',' + (dark ? '60%,62%)' : '65%,44%)');
    function line(ctx, f, e, off) {
      let [x1, y1] = P(f, E[e][0]), [x2, y2] = P(f, E[e][1]);
      if (off) { const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, ox = -dy / L * off, oy = dx / L * off; x1 += ox; x2 += ox; y1 += oy; y2 += oy; }
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    function draw(ctx, w, h, c) {
      ctx.fillStyle = c.paper; ctx.fillRect(0, 0, w, h);
      const dark = isDark(c), mh = mapH(w), f = big = frame(8, 6, w - 16, mh - 12), focused = document.activeElement === cv.canvas;
      ctx.lineCap = 'round';
      // the big map: every route, the shortest network once known, the algorithms if asked, your roads on top
      ctx.strokeStyle = c.ink3; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.55; for (let e = 0; e < E.length; e++) line(ctx, f, e); ctx.globalAlpha = 1;
      if (raceOver) { ctx.strokeStyle = c.ok; ctx.globalAlpha = 0.4; ctx.lineWidth = 11; for (const e of best.edges) line(ctx, f, e); ctx.globalAlpha = 1; }
      if (overlay) lanes.forEach((l, k) => { ctx.strokeStyle = [c.link, c.quiz, c.accent][k]; ctx.lineWidth = 2.5; for (const e of l.ok) line(ctx, f, e, (k - 1) * 3.5); });
      ctx.lineWidth = 4.5;
      for (const e of mine) { ctx.strokeStyle = raceOver && !best.edges.includes(e) ? c.err : c.warn; line(ctx, f, e); }
      if (focused && focusRoad >= 0 && clickMode === 'roads') { ctx.strokeStyle = c.accent; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); line(ctx, f, focusRoad, 6); line(ctx, f, focusRoad, -6); ctx.setLineDash([]); }
      const touched = new Uint8Array(pts.length); for (const e of mine) touched[E[e][0]] = touched[E[e][1]] = 1;
      const tr = Math.max(4.5, Math.min(8, f.s / 90));
      pts.forEach((_, i) => { const [x, y] = P(f, i); ctx.beginPath(); ctx.arc(x, y, tr, 0, 2 * Math.PI); ctx.fillStyle = touched[i] ? c.ink : c.paper; ctx.fill(); ctx.strokeStyle = c.ink; ctx.lineWidth = 2; ctx.stroke(); });
      // the three small maps
      const y0 = mh + 6, lw = w / 3, lh = laneH(w);
      ctx.fillStyle = c.rule; ctx.fillRect(8, mh + 2, w - 16, 1);
      lanes.forEach((l, k) => {
        const x0 = k * lw, small = lw < 200, g = frame(x0 + 6, y0 + 36, lw - 12, lh - 42);
        if (k) { ctx.fillStyle = c.rule; ctx.fillRect(Math.round(x0), y0 + 6, 1, lh - 10); }
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.font = '600 ' + (small ? 12 : 13) + 'px ' + c.sans; ctx.fillStyle = l.done && l.place === 1 ? c.ok : c.ink;
        ctx.fillText((small ? l.al.short : l.al.name) + (l.done ? ' · ' + PLACES[l.place - 1] : ''), x0 + 8, y0 + 4);
        ctx.font = (small ? 11 : 12) + 'px ' + c.sans; ctx.fillStyle = c.ink2;
        ctx.fillText(l.looked + ' looked at · ' + l.ok.size + '/' + (pts.length - 1) + (l.al.id === 'boruvka' && l.round && !small ? ' · round ' + l.round : ''), x0 + 8, y0 + 20);
        ctx.strokeStyle = c.ink3; ctx.lineWidth = 1; ctx.globalAlpha = 0.45; for (let e = 0; e < E.length; e++) line(ctx, g, e); ctx.globalAlpha = 1;
        ctx.strokeStyle = c.err; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]); ctx.globalAlpha = 0.7; for (const e of l.no) line(ctx, g, e); ctx.globalAlpha = 1;
        ctx.strokeStyle = c.quiz; ctx.lineWidth = 1.5; for (const e of l.front) line(ctx, g, e); for (const e of l.bestE) line(ctx, g, e); ctx.setLineDash([]);
        ctx.lineWidth = small ? 3 : 3.5;
        for (const e of l.ok) { ctx.strokeStyle = l.al.id === 'prim' ? c.accent : hue(root(l, E[e][0]), dark); line(ctx, g, e); }
        if (l.cur >= 0 && !l.done) { ctx.strokeStyle = l.curOk ? c.quiz : c.err; ctx.lineWidth = small ? 4 : 5; ctx.globalAlpha = 0.9; line(ctx, g, l.cur); ctx.globalAlpha = 1; }
        const r = small ? 2.6 : 3.6;
        pts.forEach((_, i) => {
          const [x, y] = P(g, i); ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI);
          const joined = l.al.id === 'prim' ? l.inT[i] : l.size[root(l, i)] > 1;
          ctx.fillStyle = l.al.id === 'prim' ? (joined ? c.accent : c.paper) : hue(root(l, i), dark); ctx.fill();
          ctx.strokeStyle = l.al.id === 'prim' && !joined ? c.ink3 : c.paper; ctx.lineWidth = 1; ctx.stroke();
        });
      });
    }
    update();
    p.status('Who will win? Make your bet, then press Play.');
    return () => { p.stop(); cv.stop(); later.cancel(); };
  }
  // ================================================================== registration
  A.register({
    id: 'sudoku', group: 'Puzzles and simulations', title: 'Sudoku solver race',
    blurb: 'Bet on one of three solvers, then watch them race on the same puzzle, Arto Inkala’s “hardest” among them: plain backtracking, fewest-candidates-first, and constraint propagation. Or solve it yourself, with hints that give the reason.',
    mount: mountSudoku,
    about: `<h2>Three ways to search</h2>
<p>A Sudoku is a search problem: there are 9 digits for each empty cell, far too many combinations to try them all, so each solver cuts the search down in its own way. All three are <em>backtracking</em>: put a digit in a cell, carry on, and when a cell has no digit left that fits, go back and change the last choice.</p>
<ul>
<li><b>Plain backtracking</b> fills the empty cells in reading order and tries 1 to 9 in each, skipping digits already in the cell's row, column or box. It is the shortest program, and it can make a bad early choice and spend a long time below it before it finds out.</li>
<li><b>Fewest candidates first</b> is the same search, but it always fills the empty cell that has the fewest digits left (in AI this is called <em>minimum remaining values</em>). A cell with one candidate is filled at once with no real guess; a cell with none is found straight away, so a wrong guess is noticed early.</li>
<li><b>Propagation + fewest first</b> is Peter Norvig's solver from his 2006 essay <em>Solving Every Sudoku Puzzle</em>. It keeps the candidates of every cell, and after each digit it applies two rules until nothing changes: if a cell has only one candidate left, remove that digit from its 20 neighbours (a <em>naked single</em>); if a row, column or box has only one place left for a digit, put it there (a <em>hidden single</em>). Only when the rules are stuck does it guess, in the cell with the fewest candidates. Many puzzles need no guess at all.</li>
</ul>
<h2>How the race counts</h2>
<p>A step is one change to the grid: a digit guessed (purple), a digit deduced by the rules (green), or a digit erased while backing up (a red flash). At each tick every solver makes one change, so the race measures how much each one has to write and rub out. The warmer a cell's background, the more often it was rewritten: that is where a solver struggled. It is not the whole cost: propagation does a lot of checking behind each step, and choosing the cell with fewest candidates means looking at every empty cell. Even so it wins by a long way on hard puzzles, because a guess avoided saves a whole branch of the search.</p>
<h2>The puzzles</h2>
<ul>
<li><b>Easy</b> and <b>Medium</b> are grids 2 and 6 of Project Euler's problem 96, a set of 50 puzzles for writing a solver.</li>
<li><b>Hard</b> is number 3 of the 95 hard puzzles Norvig tested on. It has 17 givens: in 2012 Gary McGuire, Bastian Tugemann and Gilles Civario showed by an exhaustive computer search that no proper Sudoku has fewer.</li>
<li><b>Arto Inkala's puzzle</b> was published in June 2012 by the Finnish mathematician, and reported in newspapers as “the world's hardest Sudoku”. It is hard for people because the usual tricks run out early and long chains of reasoning are needed. Other ways of measuring difficulty rank other puzzles harder. To a solver it is just another search, though watch how much more fewest-first needs here than on the other puzzles.</li>
<li><b>Your own</b>: type or paste 81 cells. It is checked before use: only digits and empty cells, no digit twice in a row, column or box, and exactly one solution (a puzzle with two solutions is not a proper Sudoku, and the solver says so).</li>
</ul>
<h2>Solving it yourself</h2>
<p>Hint looks for the same two rules a person uses first: the only place for a digit in a box, row or column, and a cell with only one digit left. It names the reason rather than just filling in the answer. When neither rule applies, it shows the cell a solver would guess in. Puzzle books use further patterns (pairs, X-wings and more) that this hint does not know.</p>
<h2>Cost</h2>
<p>Sudoku on an n² × n² board is NP-complete (Takayuki Yato and Takahiro Seta, 2003): no method is known that is always fast as the board grows. For the ordinary 9 × 9 board, backtracking with propagation solves any proper puzzle in a fraction of a second, but Norvig found that the time has a long tail: a few puzzles take thousands of times longer than the typical one.</p>`,
    taught: [{ href: '#/dsa/8', text: 'SC 107, Recursion' }, { href: '#/math/14', text: 'SC 104, Easy to check, hard to find' }]
  });

  A.register({
    id: 'queens', group: 'Puzzles and simulations', title: 'Eight queens',
    blurb: 'Place n queens so that none attacks another. Watch backtracking find every solution (92 on the ordinary board) with the attacked squares shaded, see how much pruning saves, then place queens yourself and learn how many solutions are still possible.',
    mount: mountQueens,
    about: `<h2>The puzzle</h2>
<p>A queen attacks every square along its row, its column and its two diagonals. Can eight queens stand on a chessboard so that none attacks another? The chess composer Max Bezzel asked in 1848 in the Berlin chess magazine <i>Schachzeitung</i>. Franz Nauck published solutions in 1850 and asked the same about n queens on an n × n board. Carl Friedrich Gauss took an interest the same year and wrote to his friend Heinrich Schumacher that Nauck's count of 92 solutions could be confirmed by trial in a few hours. In 1972 Edsger Dijkstra used the puzzle to show how to build a program in small, clear steps (“structured programming”): his program is the depth-first backtracking you can watch here.</p>
<h2>Backtracking</h2>
<p>Each column needs exactly one queen, so the search places them column by column. In a column it tries the rows from the top; a queen that is attacked cannot stay. If a column has no safe square, an earlier choice was wrong: take back the queen in the previous column and move it down. When all n columns are filled, that is a solution: count it, and back up to look for the next one. Taken together the choices form a <em>search tree</em>, and backtracking is a depth-first walk through it that never enters a branch it can see is dead.</p>
<h2>How much pruning saves</h2>
<p>The table under the board counts queens placed three ways. Putting a queen in every column without looking, and checking only when the board is full, means n<sup>n</sup> arrangements (16,777,216 for n = 8). Backtracking that tries every row and takes a queen back as soon as it is attacked places 15,720. Choosing only from the safe rows places 2,056. The two backtracking searches find the same 92 solutions; switch the search with <b>Search</b> to see the difference.</p>
<h2>The numbers</h2>
<p>The number of solutions for n = 1, 2, 3, … is 1, 0, 0, 2, 10, 4, 40, 92, 352, 724, 2,680, 14,200 (for n = 12). Of the 92 for n = 8, only 12 are really different: the rest are rotations and reflections of those. There is a solution for every n from 4 up, and a construction is known that writes one down without searching, but nobody knows a formula for how many there are: they are counted by computer, and the largest boards counted so far took a very long time on many machines.</p>
<h2>Play</h2>
<p>When you place queens yourself, the solver counts the solutions that contain all of your queens after every move (it uses the same search with your queens fixed). A position with no attacks at all can still have no solution: you have run into a dead end that a backtracking search would only find further down.</p>`,
    taught: [{ href: '#/dsa/8', text: 'SC 107, Recursion' }, { href: '#/python/13', text: 'SC 101, Recursion' }]
  });

  A.register({
    id: 'mst', group: 'Paths and graphs', title: 'Shortest network race',
    blurb: 'Join every town with the least road you can, then bet and watch Kruskal, Prim and Borůvka race to the minimum spanning tree: a union-find of coloured groups merging, one tree growing, and every group reaching out at once.',
    mount: mountMST,
    about: `<h2>The problem</h2>
<p>Every town must be joined to every other, directly or through other towns, using as little road (or cable, or pipe) as possible. A network with no loops that reaches every town is a <em>spanning tree</em>; for n towns it has exactly n − 1 roads. The shortest one is the <em>minimum spanning tree</em>. When all the road lengths are different, as here, there is only one, so all three algorithms always build the same network, though they build it in very different orders.</p>
<h2>Why being greedy works: the cut property</h2>
<p>Split the towns into two groups, any way you like. Among the roads that cross from one group to the other, the shortest one belongs to the shortest network. Why? Take any network that leaves that road out. It still has to cross between the groups somewhere, using a longer road. Add the short road: that makes a loop, which crosses between the groups twice, once along the short road and once along a longer one. Remove the longer one. Every town is still joined and the network is shorter, so a network without the short road could not have been the shortest. All three algorithms are greedy, building one short road at a time and never taking one back, and the cut property is why they never need to.</p>
<ul>
<li><b>Kruskal</b> (Joseph Kruskal, 1956) takes all the roads from shortest to longest and builds each one unless its two towns are already joined, since then it would close a loop. To answer “already joined?” quickly it keeps a <em>union-find</em> structure: each group of joined towns has one colour, and a new road merges two colours into one (the smaller group takes the larger's colour). Its groups appear all over the map at once. Cost: sorting the m roads, m log m, then almost nothing per road.</li>
<li><b>Prim</b> grows one tree from the first town and always adds the shortest road from the tree to a town outside it (the cut: the tree against the rest). Vojtěch Jarník published it in 1930, Robert Prim found it again in 1957 and Edsger Dijkstra in 1959. Roads leaving the tree wait in a priority queue (dashed), and a road whose far end has joined the tree in the meantime is thrown away when it comes out. Cost: m log n with a binary heap.</li>
<li><b>Borůvka</b> came first. In 1926 Otakar Borůvka, in Brno, solved the problem for the West Moravian electricity company, which was planning a network to bring power to the villages of southern Moravia. In each round, every group of joined towns picks its own shortest road out (dashed), and all of those are built at once. Each round at least halves the number of groups, so there are at most log₂ n rounds. Because the groups work independently, it is the one used on parallel computers.</li>
</ul>
<h2>How the race counts</h2>
<p>With <b>Count: roads decided</b>, a step is one road that an algorithm decides about: the next road on Kruskal's sorted list, a road taken out of Prim's queue, or a road compared with the best so far by one of Borůvka's groups. Prim usually wins: it only ever decides about roads next to its tree, and few of those turn out to close a loop. With <b>every road touched</b>, a road put into Prim's queue counts too, and Kruskal wins instead. Neither count includes Kruskal's sorting, which it does before the race starts and which costs more than everything else (about m log m comparisons for m roads). Which algorithm is “fastest” depends on what you count, and on a real computer the costs are close; Borůvka comes last here, but its groups could all work at the same time.</p>
<h2>Where it is used</h2>
<ul>
<li>Designing networks of cables, pipes and roads, which is where the problem began.</li>
<li>Clustering: build the tree, then remove its k − 1 longest roads, and k groups of close points are left (single-linkage clustering).</li>
<li>An approximate travelling salesperson tour: walk round the minimum spanning tree and skip towns already visited. When distances obey the triangle inequality, the tour is at most twice as long as the best one (see the <a href="#/algorithms/tour">untangle the tour</a> demo).</li>
</ul>`,
    taught: [{ href: '#/dsa/13', text: 'SC 107, Graphs' }, { href: '#/dsa/12', text: 'SC 107, Heaps and priority queues' }, { href: '#/math/6', text: 'SC 104, Graphs and paths (trees)' }]
  });

  // ================================================================== tests (node test_algos.js)
  function selfTest() {
    const fails = [], fail = (m) => { if (fails.length < 40) fails.push(m); };
    // Sudoku: every bundled puzzle is proper, and all three solvers reach its one solution, replaying their events on a copy
    for (const pz of PUZZLES) {
      const r = countSolutions(pz.grid, 2);
      if (r.count !== 1) { fail('puzzle ' + pz.id + ' has ' + r.count + ' solutions'); continue; }
      if (!isSolution(r.solution, pz.grid)) fail('puzzle ' + pz.id + ': countSolutions gave a wrong grid');
      for (const s of SOLVERS) {
        const g = Array.from(pz.grid), it = s.gen(pz.grid); let res, steps = 0, err = '';
        for (;;) {
          const x = it.next(); if (x.done) { res = x.value; break; }
          const ev = x.value;
          if (ev.t === 'guess' || ev.t === 'deduce') { if (pz.grid[ev.i]) { err = 'wrote over a given'; break; } g[ev.i] = ev.v; steps++; }
          else if (ev.t === 'erase') { if (pz.grid[ev.i]) { err = 'erased a given'; break; } g[ev.i] = 0; steps++; }
          else if (ev.t !== 'back') { err = 'unknown event ' + ev.t; break; }
          if (steps > 5e6) { err = 'too many steps'; break; }
        }
        if (err) { fail(s.id + ' on ' + pz.id + ': ' + err); continue; }
        if (!res.solved || res.grid.join('') !== r.solution.join('')) fail(s.id + ' on ' + pz.id + ' did not reach the solution');
        if (g.join('') !== r.solution.join('')) fail(s.id + ' on ' + pz.id + ': replaying its events does not give the solution');
      }
    }
    // a puzzle with two solutions (two pairs of cells that can swap) and one with almost nothing given are refused; so are bad grids
    const sol = countSolutions(PUZZLES[0].grid, 1).solution;
    let twin = null;
    for (let a = 0; a < 81 && !twin; a++) for (let b = a + 1; b < 81 && !twin; b++) {
      if (((a / 9) | 0) !== ((b / 9) | 0) || boxOf(a) === boxOf(b)) continue;
      for (let r2 = (((a / 9) | 0) + 1); r2 < 9 && !twin; r2++) {
        const a2 = r2 * 9 + (a % 9), b2 = r2 * 9 + (b % 9);
        if (boxOf(a2) !== boxOf(a) || sol[a] !== sol[b2] || sol[b] !== sol[a2]) continue;
        twin = sol.slice(); twin[a] = twin[b] = twin[a2] = twin[b2] = 0;
      }
    }
    if (!twin) fail('could not build a puzzle with two solutions');
    else { const p = parsePuzzle(twin.join('')); if (p.ok || !/more than one/.test(p.error)) fail('a puzzle with two solutions was not refused: ' + JSON.stringify(p.error)); if (countSolutions(twin, 5).count !== 2) fail('the twin puzzle should have exactly 2 solutions'); }
    for (const [txt, want] of [['1' + '0'.repeat(80), /more than one/], ['12', /81 cells/], ['x'.repeat(81), /digits/], ['11' + '0'.repeat(79), /two 1s in row 1/],
      ['1' + '0'.repeat(8) + '1' + '0'.repeat(71), /two 1s in column 1/], ['1' + '0'.repeat(9) + '1' + '0'.repeat(70), /two 1s in box 1/],
      ['123456780' + '000000009' + '0'.repeat(63), /no solution/], [PUZZLES[2].grid.join('').replace(/0/g, '.'), null], [' 8 . . | . . .\n' + PUZZLES[3].grid.join('').slice(6), null]]) {
      const p = parsePuzzle(txt);
      if (want ? p.ok || !want.test(p.error) : !p.ok) fail('parsePuzzle(' + JSON.stringify(txt.slice(0, 20)) + '…) gave ' + JSON.stringify(p.ok ? 'ok' : p.error));
    }
    // hints: on the easy puzzle, following the hints alone solves it, and every hint agrees with the solution
    { const g = Array.from(PUZZLES[0].grid); let k = 0, h;
      while ((h = nextHint(g)) && k++ < 81) { if (sol[h.i] !== h.v) { fail('hint ' + h.text + ' disagrees with the solution'); break; } g[h.i] = h.v; }
      if (g.join('') !== sol.join('')) fail('hints alone did not solve the easy puzzle'); }
    if (conflicts([1, 1].concat(new Array(79).fill(0))).reduce((s, x) => s + x, 0) !== 2) fail('conflicts() missed two 1s in a row');
    // n queens: the known counts, the animated search agrees, solutionsFrom agrees with countQueens and rejects attacks
    const KNOWN = { 1: 1, 2: 0, 3: 0, 4: 2, 5: 10, 6: 4, 7: 40, 8: 92, 9: 352, 10: 724, 11: 2680, 12: 14200 };
    for (let n = 1; n <= 12; n++) {
      const q = countQueens(n);
      if (q.solutions !== KNOWN[n]) fail('countQueens(' + n + ') = ' + q.solutions + ', expected ' + KNOWN[n]);
      if (solutionsFrom(n, []) !== KNOWN[n]) fail('solutionsFrom(' + n + ', []) = ' + solutionsFrom(n, []));
      if (n <= 9) for (const safeOnly of [true, false]) {
        let placed = 0, rejected = 0, sols = 0, ok = true; const it = queens(n, safeOnly); let r;
        while (!(r = it.next()).done) {
          const ev = r.value;
          if (ev.t === 'place') placed++; else if (ev.t === 'reject') rejected++;
          else if (ev.t === 'solution') { sols++; const R = ev.rows; for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) if (attacks(R[a], a, R[b], b)) ok = false; }
        }
        if (r.value !== KNOWN[n] || sols !== KNOWN[n] || !ok) fail('queens(' + n + ', ' + safeOnly + ') found ' + sols + ' solutions' + (ok ? '' : ', some attacking'));
        if (placed !== q.placed) fail('queens(' + n + ') placed ' + placed + ' queens, countQueens says ' + q.placed);
        if (!safeOnly && placed + rejected !== q.tried) fail('queens(' + n + ', every row) tried ' + (placed + rejected) + ', countQueens says ' + q.tried);
      }
    }
    if (solutionsFrom(8, [[0, 0]]) !== 4) fail('solutionsFrom(8, a corner queen) should be 4');
    if (solutionsFrom(8, [[0, 0], [1, 1]]) !== 0 || solutionsFrom(8, [[0, 0], [0, 5]]) !== 0) fail('solutionsFrom counted queens that attack each other');
    { let sum = 0; for (let r = 0; r < 8; r++) sum += solutionsFrom(8, [[r, 3]]); if (sum !== 92) fail('solutions by the row of column 4 add up to ' + sum); }
    if (String(bruteLeaves(8)) !== '16777216') fail('8^8 is not ' + bruteLeaves(8));
    // minimum spanning trees: the three agree on the total, have n - 1 edges and connect everything; and match a plain O(n^2) Prim
    for (let k = 0; k < 40; k++) {
      const n = 2 + (k * 7) % 55, pts = makeTowns(n, 1000 + k), E = makeRoads(pts), totals = [];
      for (const al of MSTS) {
        const res = runToEnd(al.gen(n, E)), d = DSU(n);
        for (const e of res.edges) d.union(E[e][0], E[e][1]);
        if (res.edges.length !== n - 1) fail(al.id + ' on ' + n + ' towns gave ' + res.edges.length + ' roads');
        if (d.size[d.find(0)] !== n) fail(al.id + ' on ' + n + ' towns does not connect them all');
        totals.push(res.total);
      }
      const dist = new Float64Array(n).fill(Infinity), inT = new Uint8Array(n), W = Array.from({ length: n }, () => new Float64Array(n).fill(Infinity));
      for (const [a, b, w] of E) { W[a][b] = w; W[b][a] = w; }
      let ref = 0; dist[0] = 0;
      for (let s = 0; s < n; s++) { let v = -1; for (let i = 0; i < n; i++) if (!inT[i] && (v < 0 || dist[i] < dist[v])) v = i; inT[v] = 1; ref += dist[v]; for (let i = 0; i < n; i++) if (!inT[i] && W[v][i] < dist[i]) dist[i] = W[v][i]; }
      if (totals.some((t) => Math.abs(t - ref) > 1e-9)) fail('MST totals differ on ' + n + ' towns: ' + totals.join(', ') + ' against ' + ref);
      for (let a = 0; a < E.length; a++) for (let b = a + 1; b < E.length; b++) {
        const [p, q] = E[a], [r2, s2] = E[b];
        if (p !== r2 && p !== s2 && q !== r2 && q !== s2 && properCross(pts[p], pts[q], pts[r2], pts[s2])) { fail('two roads cross on ' + n + ' towns'); a = E.length; break; }
      }
    }
    return fails;
  }

  if (typeof module !== 'undefined') module.exports = { selfTest, parsePuzzle, countSolutions, solvePlain, solveMRV, solveNorvig, nextHint, conflicts, PUZZLES, SOLVERS,
    countQueens, solutionsFrom, queens, bruteLeaves, makeTowns, makeRoads, kruskal, prim, boruvka, MSTS };
})();
