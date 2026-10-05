/* Algorithms in motion: games and learning. Three demos for the #/algorithms page (see src/algos.js for the frame):
   - reversi: Reversi (Othello) against Monte Carlo tree search (UCT), with the search's visit counts and win rates drawn on the board
     while it thinks, and a ten-game match of MCTS against a greedy player, with a bet first;
   - genetic: a genetic algorithm, in two modes: Dawkins' weasel (a known target phrase, with a bet on the number of generations) and
     rolling shapes (polygons evolved to roll furthest down a hilly track in a small physics simulation: no known answer);
   - huffman: Huffman coding of a text you type: the counts, the tree built by merging the two lightest nodes, the codes, the bits,
     the size against 8-bit ASCII and the entropy bound, and decoding by walking the tree.
   The algorithms are pure (no DOM) and checked by selfTest() in node (test_algos.js). */
(function () {
  const A = (typeof window !== 'undefined' && window.ALGOS) || require('./algos.js');

  // =====================================================================================================================
  // Reversi. A 10 x 10 "mailbox" board: the 8 x 8 squares are at (r + 1) * 10 + (c + 1), the ring around them is a wall (3), so a
  // ray stops by itself at the edge without bounds checks. 0 empty, 1 black (moves first), 2 white. A move is a square index, or
  // PASS when the player to move has no legal move.
  // =====================================================================================================================
  const WALL = 3, PASS = -1, DIRS = [-11, -10, -9, -1, 1, 9, 10, 11];
  const SQUARES = []; for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) SQUARES.push((r + 1) * 10 + c + 1);
  const sqName = (s) => (s === PASS ? 'pass' : 'abcdefgh'[s % 10 - 1] + Math.floor(s / 10));
  const sqAt = (name) => (name.charCodeAt(0) - 96) + 10 * +name[1];
  function rvNew() {
    const b = new Int8Array(100).fill(WALL);
    for (const s of SQUARES) b[s] = 0;
    b[sqAt('d4')] = 2; b[sqAt('e5')] = 2; b[sqAt('e4')] = 1; b[sqAt('d5')] = 1;
    return b;
  }
  /** The discs that playing p at s would flip (an empty array when the move is illegal). */
  function rvFlips(b, s, p) {
    const out = [];
    if (b[s] !== 0) return out;
    const q = 3 - p;
    for (const d of DIRS) {
      let t = s + d, n = 0;
      while (b[t] === q) { t += d; n++; }
      if (n && b[t] === p) for (let k = 1; k <= n; k++) out.push(s + k * d);
    }
    return out;
  }
  /** Is playing p at s legal? (the same rays, stopping at the first that flips something) */
  function rvLegalAt(b, s, p) {
    if (b[s] !== 0) return false;
    const q = 3 - p;
    for (let i = 0; i < 8; i++) { const d = DIRS[i]; let t = s + d; if (b[t] !== q) continue; t += d; while (b[t] === q) t += d; if (b[t] === p) return true; }
    return false;
  }
  function rvMoves(b, p) { const m = []; for (const s of SQUARES) if (rvLegalAt(b, s, p)) m.push(s); return m; }
  /** Plays p at s (which must be legal) and returns the flipped squares. */
  function rvPlay(b, s, p) { const f = rvFlips(b, s, p); b[s] = p; for (const t of f) b[t] = p; return f; }
  function rvCount(b) { let x = 0, o = 0; for (const s of SQUARES) { if (b[s] === 1) x++; else if (b[s] === 2) o++; } return [x, o]; }
  /** Who is to move after p moved: the other player, or p again when the other must pass, or 0 when nobody can move (game over). */
  function rvNext(b, p) { if (rvMoves(b, 3 - p).length) return 3 - p; if (rvMoves(b, p).length) return p; return 0; }
  const rvWinner = (b) => { const [x, o] = rvCount(b); return x > o ? 1 : o > x ? 2 : 0; };

  /** A random game from here to the end, played on b (changed). p is to move. Returns the winner (0 a draw). The empty squares are
      kept in a list and tried in random order, so a move costs a few legality tests, not a scan of the whole board. */
  function rvPlayout(b, p, rand, empt) {
    let n = 0;
    for (const s of SQUARES) if (b[s] === 0) empt[n++] = s;
    let passes = 0;
    while (n && passes < 2) {
      let found = -1;
      for (let k = n; k > 0; k--) {   // a random untried empty square each time: a partial shuffle
        const j = Math.floor(rand() * k), s = empt[j]; empt[j] = empt[k - 1]; empt[k - 1] = s;
        if (rvLegalAt(b, s, p)) { found = k - 1; break; }
      }
      if (found < 0) { passes++; p = 3 - p; continue; }
      passes = 0;
      const s = empt[found]; rvPlay(b, s, p); empt[found] = empt[n - 1]; n--; p = 3 - p;
    }
    return rvWinner(b);
  }

  /** Monte Carlo tree search with UCT (Kocsis and Szepesvári 2006). A node is the position after `move` by `by`; `toMove` is who
      plays next (0 when the game is over). wins counts wins for `by` (a draw is half), so a parent picks the child that is best for
      the player choosing it. */
  function mctsNode(parent, move, by, toMove, moves) { return { parent, move, by, toMove, untried: moves, kids: [], visits: 0, wins: 0 }; }
  function mctsNew(board, toMove, seed, c) {
    const b = Int8Array.from(board);
    const root = mctsNode(null, null, 3 - toMove, toMove, toMove ? movesOrPass(b, toMove) : []);
    return { board: b, root, rand: A.rng(seed || 1), c: c == null ? Math.SQRT2 : c, scratch: new Int8Array(100), empt: new Int16Array(64), playouts: 0 };
  }
  function movesOrPass(b, p) { const m = rvMoves(b, p); return m.length ? m : rvMoves(b, 3 - p).length ? [PASS] : []; }
  /** n more iterations: select by UCB1 down the tree, expand one move, play a random game, and back the result up. */
  function mctsRun(t, n) {
    const b = t.scratch, c = t.c;
    for (let it = 0; it < n; it++) {
      b.set(t.board);
      let node = t.root;
      // selection: while every move of the node has a child, go to the child with the best upper confidence bound
      while (!node.untried.length && node.kids.length) {
        const ln = Math.log(node.visits); let best = null, bv = -Infinity;
        for (const k of node.kids) { const v = k.wins / k.visits + c * Math.sqrt(ln / k.visits); if (v > bv) { bv = v; best = k; } }
        node = best; if (node.move !== PASS) rvPlay(b, node.move, node.by);
      }
      // expansion: one untried move, chosen at random
      if (node.untried.length) {
        const j = Math.floor(t.rand() * node.untried.length), m = node.untried[j];
        node.untried[j] = node.untried[node.untried.length - 1]; node.untried.pop();
        const p = node.toMove; if (m !== PASS) rvPlay(b, m, p);
        const nx = m === PASS ? 3 - p : rvNext(b, p);
        const kid = mctsNode(node, m, p, nx, nx ? movesOrPass(b, nx) : []);
        node.kids.push(kid); node = kid;
      }
      // simulation: a random game to the end
      const w = node.toMove ? rvPlayout(b, node.toMove, t.rand, t.empt) : rvWinner(b);
      t.playouts++;
      // backpropagation
      for (let x = node; x; x = x.parent) { x.visits++; x.wins += w === x.by ? 1 : w === 0 ? 0.5 : 0; }
    }
  }
  /** The root's moves with their statistics (win rate for the player to move at the root), and the most visited move. */
  function mctsStats(t) {
    const kids = t.root.kids.map((k) => ({ move: k.move, visits: k.visits, rate: k.visits ? k.wins / k.visits : 0 }));
    let best = null; for (const k of kids) if (!best || k.visits > best.visits || (k.visits === best.visits && k.rate > best.rate)) best = k;
    return { kids, best, playouts: t.playouts };
  }
  function mctsMove(board, p, playouts, seed) { const t = mctsNew(board, p, seed); mctsRun(t, playouts); return mctsStats(t).best.move; }
  /** The greedy player: the move that flips the most discs now (ties: the first in rand's order). */
  function greedyMove(b, p, rand) {
    const ms = rvMoves(b, p); if (!ms.length) return PASS;
    let best = [], bn = -1;
    for (const s of ms) { const n = rvFlips(b, s, p).length; if (n > bn) { bn = n; best = [s]; } else if (n === bn) best.push(s); }
    return best[Math.floor(rand() * best.length)];
  }
  const randomMove = (b, p, rand) => { const ms = rvMoves(b, p); return ms.length ? ms[Math.floor(rand() * ms.length)] : PASS; };
  /** A whole game between two move functions (f1 plays black). Returns { winner, discs, moves }. */
  function rvGame(f1, f2) {
    const b = rvNew(); let p = 1; const moves = [];
    while (p) {
      const m = (p === 1 ? f1 : f2)(b, p);
      if (m === PASS) { moves.push(PASS); p = rvMoves(b, 3 - p).length ? 3 - p : 0; continue; }
      if (!rvLegalAt(b, m, p)) throw new Error('illegal move ' + sqName(m));
      rvPlay(b, m, p); moves.push(m); p = rvNext(b, p);
    }
    return { winner: rvWinner(b), discs: rvCount(b), moves, board: b };
  }

  // =====================================================================================================================
  // A genetic algorithm on strings (Dawkins' weasel). Letters are A-Z and space. Fitness is the number of places that match.
  // =====================================================================================================================
  const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ ';
  const WEASEL = 'METHINKS IT IS LIKE A WEASEL';
  /** A typed target: capitals, letters and spaces only, 1 to 40 characters. Returns { target } or { error }. */
  function cleanTarget(s) {
    const t = String(s || '').toUpperCase().replace(/\s+/g, ' ').trim();
    if (!t) return { error: 'Type a phrase of letters and spaces.' };
    if (t.length > 40) return { error: 'At most 40 letters and spaces, please (that one has ' + t.length + ').' };
    const bad = [...new Set(t.replace(/[A-Z ]/g, ''))];
    if (bad.length) return { error: 'Only the letters A to Z and spaces: take out ' + bad.slice(0, 6).join(' ') + '.' };
    return { target: t };
  }
  const fitnessOf = (s, target) => { let f = 0; for (let i = 0; i < target.length; i++) if (s[i] === target[i]) f++; return f; };
  const randomString = (n, rand) => { let s = ''; for (let i = 0; i < n; i++) s += ABC[Math.floor(rand() * ABC.length)]; return s; };
  /** A new weasel run. method: 'ga' (tournament selection of two parents, one-point crossover, mutation) or 'dawkins' (the best of
      each generation is the only parent; its children are mutated copies). rate is the chance that each letter mutates. */
  function weaselNew(target, size, rate, method, seed) {
    const rand = A.rng(seed || 1), pop = [];
    for (let i = 0; i < size; i++) { const s = randomString(target.length, rand); pop.push({ s, f: fitnessOf(s, target), cut: -1, mut: [] }); }
    pop.sort((a, b) => b.f - a.f);
    return { target, size, rate, method, rand, pop, gen: 0, history: [summary(pop)], done: pop[0].f === target.length };
  }
  function summary(pop) { let sum = 0; for (const x of pop) sum += x.f; return { best: pop[0].f, mean: sum / pop.length }; }
  function mutate(s, rate, rand, mut) {
    let out = '';
    for (let i = 0; i < s.length; i++) {
      if (rand() < rate) { let ch; do ch = ABC[Math.floor(rand() * ABC.length)]; while (ch === s[i]); out += ch; mut.push(i); } else out += s[i];
    }
    return out;
  }
  /** One generation. The population is kept sorted, best first. */
  function weaselStep(w) {
    const { pop, rand, target, rate } = w, n = w.size, next = [];
    const pick = () => { let best = pop[Math.floor(rand() * pop.length)]; for (let k = 1; k < 3; k++) { const x = pop[Math.floor(rand() * pop.length)]; if (x.f > best.f) best = x; } return best; };
    for (let i = 0; i < n; i++) {
      let s, cut = -1;
      if (w.method === 'dawkins') s = pop[0].s;
      else { const a = pick(), b = pick(); cut = 1 + Math.floor(rand() * (target.length - 1)); s = a.s.slice(0, cut) + b.s.slice(cut); if (target.length < 2) cut = -1; }
      const mut = []; s = mutate(s, rate, rand, mut);
      next.push({ s, f: fitnessOf(s, target), cut, mut });
    }
    next.sort((a, b) => b.f - a.f);
    w.pop = next; w.gen++; w.history.push(summary(next));
    if (next[0].f === target.length) w.done = true;
    return w;
  }

  // =====================================================================================================================
  // Rolling shapes: a rigid polygon rolls under gravity along a hilly track. The genome is K radii, one per spoke; the shape is
  // the polygon through the spoke ends. Fitness is how far it gets before it stops, or the time runs out. Units are metres.
  // =====================================================================================================================
  const K = 16, R_MIN = 0.15, R_MAX = 0.75, TRACK = 120, G = 9.8, DT = 1 / 120, T_MAX = 30;
  /** The track: a height every metre, downhill at first, then bumps and climbs that need a shape to keep its speed. */
  function makeTrack(seed) {
    const rand = A.rng(seed || 7), hs = [];
    // on average downhill (a quarter of a metre a metre), so each hilltop is lower than the last and a shape that loses little
    // energy gets over all of them; hills of random size, and bumps that grow along the track, take energy from shapes that bounce
    const amp = [];
    for (let k = 0; k < 20; k++) amp.push(0.8 + 1.6 * rand());
    for (let x = 0; x <= TRACK + 20; x++) {
      const hill = x < 8 ? 0 : amp[Math.floor((x - 8) / 12) % amp.length] * (1 - Math.cos((x - 8) / 12 * 2 * Math.PI)) / 2;   // zero between hills
      const bump = x < 8 ? 0 : (rand() - 0.5) * 0.5 * Math.min(1, x / TRACK * 1.5);
      hs.push(-0.25 * x - 0.3 * Math.min(x, 8) + hill + bump);   // a steeper ramp to start
    }
    return hs;
  }
  const trackY = (hs, x) => { const i = Math.max(0, Math.min(hs.length - 2, Math.floor(x))), f = Math.max(0, Math.min(1, x - i)); return hs[i] + (hs[i + 1] - hs[i]) * f; };
  const trackSlope = (hs, x) => { const i = Math.max(0, Math.min(hs.length - 2, Math.floor(x))); return hs[i + 1] - hs[i]; };
  /** The rigid body of a genome: vertices about the centre of mass, mass and moment of inertia (uniform density 1). */
  function shapeBody(genes) {
    const raw = genes.map((r, i) => [r * Math.cos(2 * Math.PI * i / K), r * Math.sin(2 * Math.PI * i / K)]);
    let area = 0, cx = 0, cy = 0, inertia = 0;
    for (let i = 0; i < K; i++) {
      const [x0, y0] = raw[i], [x1, y1] = raw[(i + 1) % K], cr = x0 * y1 - x1 * y0;
      area += cr / 2; cx += (x0 + x1) * cr / 6; cy += (y0 + y1) * cr / 6;
      inertia += cr * (x0 * x0 + x0 * x1 + x1 * x1 + y0 * y0 + y0 * y1 + y1 * y1) / 12;
    }
    cx /= area; cy /= area;
    inertia -= area * (cx * cx + cy * cy);   // parallel axes: about the centre of mass
    return { verts: raw.map(([x, y]) => [x - cx, y - cy]), mass: area, inertia };
  }
  function rollerNew(genes, hs) {
    const body = shapeBody(genes);
    let low = 0; for (const [, y] of body.verts) low = Math.min(low, y);
    return { genes, body, x: 1.5, y: trackY(hs, 1.5) - low + 0.3, a: 0, vx: 0, vy: 0, w: 0, t: 0, best: 1.5, lastGain: 0, stopped: false };
  }
  /** One step of the simulation: gravity, then contact impulses with friction at every vertex below the ground (a few passes, so
      that two contacts settle together), then a push out of the ground. */
  function rollerStep(o, hs) {
    if (o.stopped) return;
    const { verts, mass: m, inertia: I } = o.body, e = 0.15, mu = 0.9;
    o.vy -= G * DT;
    const ca = Math.cos(o.a), sa = Math.sin(o.a);
    for (let pass = 0; pass < 3; pass++) {
      for (const [lx, ly] of verts) {
        const rx = lx * ca - ly * sa, ry = lx * sa + ly * ca, px = o.x + rx, py = o.y + ry, gy = trackY(hs, px);
        if (py > gy) continue;
        const sl = trackSlope(hs, px), nl = Math.hypot(sl, 1), nx = -sl / nl, ny = 1 / nl, tx = ny, ty = -nx;
        const vx = o.vx - o.w * ry, vy = o.vy + o.w * rx, vn = vx * nx + vy * ny;
        if (vn >= 0) continue;
        const rn = rx * ny - ry * nx, jn = -(1 + (pass ? 0 : e)) * vn / (1 / m + rn * rn / I);
        o.vx += jn * nx / m; o.vy += jn * ny / m; o.w += rn * jn / I;
        const vx2 = o.vx - o.w * ry, vy2 = o.vy + o.w * rx, vt = vx2 * tx + vy2 * ty, rt = rx * ty - ry * tx;
        let jt = -vt / (1 / m + rt * rt / I); jt = Math.max(-mu * jn, Math.min(mu * jn, jt));
        o.vx += jt * tx / m; o.vy += jt * ty / m; o.w += rt * jt / I;
      }
    }
    o.x += o.vx * DT; o.y += o.vy * DT; o.a += o.w * DT; o.t += DT;
    let push = 0;
    for (const [lx, ly] of verts) { const px = o.x + lx * Math.cos(o.a) - ly * Math.sin(o.a), py = o.y + lx * Math.sin(o.a) + ly * Math.cos(o.a); push = Math.max(push, trackY(hs, px) - py); }
    if (push > 0) o.y += push * 0.8;
    if (o.x > o.best + 0.05) { o.best = o.x; o.lastGain = o.t; }
    if (o.x >= TRACK || o.t >= T_MAX || o.t - o.lastGain > 2.5 || o.x < 0) o.stopped = true;
  }
  /** Fitness: the furthest point reached; finishing early earns a bonus for the time left. */
  const rollerFitness = (o) => Math.min(o.best, TRACK) + (o.x >= TRACK ? (T_MAX - o.t) : 0);
  function rollerRun(genes, hs) { const o = rollerNew(genes, hs); while (!o.stopped) rollerStep(o, hs); return rollerFitness(o); }
  const randomGenes = (rand) => Array.from({ length: K }, () => R_MIN + (R_MAX - R_MIN) * rand());
  /** The next generation of shapes: the best two survive unchanged, the rest are children of tournament-chosen parents, by
      uniform crossover (each spoke from either parent) and mutation (a spoke moved a little). scored: [{ genes, f, hue? }].
      Returns [{ genes, hue, elite }]: a child takes the colour of its first parent, a little shifted, so families can be seen. */
  function shapesBreed(scored, rate, rand) {
    const s = scored.slice().sort((a, b) => b.f - a.f), hueOf = (x) => (x.hue == null ? 360 * rand() : x.hue);
    const out = s.slice(0, Math.min(2, s.length)).map((x) => ({ genes: x.genes.slice(), hue: hueOf(x), elite: true }));
    const pick = () => { let b = s[Math.floor(rand() * s.length)]; for (let k = 0; k < 2; k++) { const x = s[Math.floor(rand() * s.length)]; if (x.f > b.f) b = x; } return b; };
    while (out.length < s.length) {
      const pa = pick(), b = pick().genes;
      const genes = pa.genes.map((g, i) => {
        let v = rand() < 0.5 ? g : b[i];
        if (rand() < rate) v = Math.max(R_MIN, Math.min(R_MAX, v + (rand() - 0.5) * 0.3));
        return v;
      });
      out.push({ genes, hue: (hueOf(pa) + (rand() - 0.5) * 30 + 360) % 360, elite: false });
    }
    return out;
  }

  // =====================================================================================================================
  // Huffman coding (David Huffman, 1952). A leaf is { sym, w }, an inner node { w, l, r }; ties are broken by the order nodes
  // were made, so the result is the same every time.
  // =====================================================================================================================
  function countSymbols(text) {
    const m = new Map(); for (const ch of Array.from(text)) m.set(ch, (m.get(ch) || 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
  }
  /** The steps of the construction: yields { forest, merged } after each merge (forest sorted lightest first); returns the root. */
  function* huffmanSteps(counts) {
    let id = 0;
    let forest = counts.map(([sym, w]) => ({ sym, w, id: id++ }));
    const order = (a, b) => a.w - b.w || a.id - b.id;
    forest.sort(order);
    yield { forest: forest.slice(), merged: null };
    while (forest.length > 1) {
      const l = forest.shift(), r = forest.shift(), n = { w: l.w + r.w, l, r, id: id++ };
      forest.push(n); forest.sort(order);
      yield { forest: forest.slice(), merged: n };
    }
    return forest[0] || null;
  }
  function huffmanTree(counts) { const g = huffmanSteps(counts); let r; do r = g.next(); while (!r.done); return r.value; }
  /** The code of each symbol: left 0, right 1. A text with one symbol gets the code "0", so that each letter still costs a bit. */
  function huffmanCodes(root) {
    const codes = new Map();
    if (!root) return codes;
    if (root.sym !== undefined) { codes.set(root.sym, '0'); return codes; }
    const walk = (n, pre) => { if (n.sym !== undefined) codes.set(n.sym, pre); else { walk(n.l, pre + '0'); walk(n.r, pre + '1'); } };
    walk(root, ''); return codes;
  }
  const encode = (text, codes) => Array.from(text).map((ch) => codes.get(ch)).join('');
  function decode(bits, root) {
    if (!root) return '';
    if (root.sym !== undefined) return root.sym.repeat(bits.length);
    let out = '', n = root;
    for (const b of bits) { n = b === '0' ? n.l : n.r; if (n.sym !== undefined) { out += n.sym; n = root; } }
    return out;
  }
  /** Shannon's entropy in bits per symbol: no code for these frequencies can average less. */
  function entropy(counts) { const n = counts.reduce((s, [, w]) => s + w, 0); let h = 0; for (const [, w] of counts) { const p = w / n; h -= p * Math.log2(p); } return h; }

  // the rest of the file (the pages) follows
  const PURE = { rvNew, rvFlips, rvLegalAt, rvMoves, rvPlay, rvCount, rvNext, rvWinner, rvPlayout, mctsNew, mctsRun, mctsStats, mctsMove, greedyMove, randomMove, rvGame, sqName, sqAt, PASS,
    cleanTarget, fitnessOf, weaselNew, weaselStep, WEASEL, makeTrack, trackY, shapeBody, rollerNew, rollerStep, rollerFitness, rollerRun, randomGenes, shapesBreed, K, TRACK,
    countSymbols, huffmanSteps, huffmanTree, huffmanCodes, encode, decode, entropy };

  // =====================================================================================================================
  // Shared view helpers
  // =====================================================================================================================
  const CSS = `
.pl-wrap { display: flex; flex-wrap: wrap; gap: 1.2rem 1.6rem; align-items: flex-start; margin: 0.6rem 0; }
.pl-side { flex: 1 1 15rem; min-width: 0; font-family: var(--sans); font-size: 0.92rem; color: var(--ink-2); }
.pl-side h3, .pl-h3 { font-family: var(--sans); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-3); margin: 0.2rem 0 0.4rem; font-weight: 600; }
.pl-side p { margin: 0.3rem 0 0.7rem; }
.pl-msg { font-family: var(--sans); font-size: 1.05rem; color: var(--ink); margin: 0.5rem 0; min-height: 1.5em; }
.pl-note { font-family: var(--sans); font-size: 0.85rem; color: var(--ink-3); }
.pl-kv { display: grid; grid-template-columns: 1fr auto; gap: 0.15rem 0.9rem; margin: 0.2rem 0 0.7rem; }
.pl-kv b { color: var(--ink); font-variant-numeric: tabular-nums; text-align: right; font-weight: 600; }
.pl-good { color: var(--ok); font-weight: 600; } .pl-bad { color: var(--err); font-weight: 600; }
.pl-tabs { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0 0 0.6rem; }
.pl-tabs .btn[aria-pressed=true] { background: var(--ink); color: var(--paper); border-color: var(--ink); }
.pl-field { display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem 0.6rem; font-family: var(--sans); font-size: 0.92rem; color: var(--ink-2); margin: 0.5rem 0; }
.pl-field input[type=text], .pl-field textarea { font-family: var(--mono); font-size: 0.92rem; color: var(--ink); background: var(--paper); border: 1px solid var(--rule); border-radius: 3px; padding: 0.35rem 0.5rem; flex: 1 1 14rem; min-width: 0; max-width: 100%; box-sizing: border-box; }
.pl-field textarea { width: 100%; flex-basis: 100%; resize: vertical; min-height: 3.6rem; }
.pl-err { color: var(--err); font-family: var(--sans); font-size: 0.88rem; }
.pl-val { font-variant-numeric: tabular-nums; color: var(--ink); min-width: 3.2em; display: inline-block; }
/* Reversi */
.pl-rvwrap { flex: 0 1 26rem; min-width: 0; width: min(26rem, 100%); }
.pl-rv { display: grid; grid-template-columns: repeat(8, 1fr); gap: 2px; padding: 6px; border-radius: 8px; background: color-mix(in srgb, #14532d 90%, var(--paper)); box-shadow: inset 0 0 0 1px rgba(0,0,0,0.25); }
.pl-sq { position: relative; aspect-ratio: 1; min-width: 0; padding: 0; margin: 0; border: 0; border-radius: 3px; background: color-mix(in srgb, #23804a 90%, var(--paper)); cursor: default; display: flex; align-items: center; justify-content: center; }
.pl-sq.pl-can { cursor: pointer; }
.pl-sq.pl-can:hover { background: color-mix(in srgb, #2f9a5c 90%, var(--paper)); }
.pl-sq:focus-visible { outline: 3px solid var(--link); outline-offset: 1px; z-index: 2; }
.pl-disc { position: absolute; inset: 9%; border-radius: 50%; display: none; }
.pl-disc.pl-b, .pl-disc.pl-w { display: block; }
.pl-b { background: radial-gradient(circle at 35% 30%, #5a5d63, #141517 62%); box-shadow: 0 2px 3px rgba(0,0,0,0.45); }
.pl-w { background: radial-gradient(circle at 35% 30%, #ffffff, #d9d9d2 70%); box-shadow: 0 2px 3px rgba(0,0,0,0.4); }
.pl-dot { position: absolute; width: 22%; height: 22%; border-radius: 50%; background: rgba(0,0,0,0.28); display: none; }
.pl-sq.pl-can .pl-dot.pl-show { display: block; }
.pl-last::after { content: ''; position: absolute; width: 14%; height: 14%; border-radius: 50%; background: #e2463a; top: 43%; left: 43%; }
.pl-ring { position: absolute; inset: 6%; border-radius: 50%; transform: scale(0); transition: transform 0.12s linear; opacity: 0.85; }
.pl-st { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: var(--sans); line-height: 1.05; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.7); pointer-events: none; }
.pl-st b { font-size: clamp(0.62rem, 2.6vw, 0.86rem); font-weight: 700; font-variant-numeric: tabular-nums; }
.pl-st span { font-size: clamp(0.52rem, 2vw, 0.66rem); opacity: 0.95; font-variant-numeric: tabular-nums; }
.pl-co { position: absolute; font-family: var(--sans); font-size: clamp(0.5rem, 1.8vw, 0.62rem); color: rgba(255,255,255,0.6); pointer-events: none; line-height: 1; }
.pl-cor { top: 3px; left: 3px; } .pl-coc { bottom: 2px; right: 3px; }
.pl-sq.pl-pick { box-shadow: inset 0 0 0 3px #ffd34d; }
@keyframes pl-tob { 0% { transform: scaleX(1); background: radial-gradient(circle at 35% 30%, #ffffff, #d9d9d2 70%); } 50% { transform: scaleX(0.04); background: radial-gradient(circle at 35% 30%, #ffffff, #d9d9d2 70%); } 50.1% { background: radial-gradient(circle at 35% 30%, #5a5d63, #141517 62%); } 100% { transform: scaleX(1); } }
@keyframes pl-tow { 0% { transform: scaleX(1); background: radial-gradient(circle at 35% 30%, #5a5d63, #141517 62%); } 50% { transform: scaleX(0.04); background: radial-gradient(circle at 35% 30%, #5a5d63, #141517 62%); } 50.1% { background: radial-gradient(circle at 35% 30%, #ffffff, #d9d9d2 70%); } 100% { transform: scaleX(1); } }
@keyframes pl-pop { from { transform: scale(0.2); opacity: 0.3; } to { transform: scale(1); opacity: 1; } }
.pl-disc.pl-fb { animation: pl-tob 0.42s ease-in-out both; } .pl-disc.pl-fw { animation: pl-tow 0.42s ease-in-out both; }
.pl-disc.pl-pop { animation: pl-pop 0.22s ease-out both; }
.pl-score { display: flex; gap: 1.2rem; align-items: center; font-family: var(--sans); font-size: 1.1rem; color: var(--ink); margin: 0.2rem 0 0.4rem; font-variant-numeric: tabular-nums; }
.pl-chip { display: inline-block; width: 1em; height: 1em; border-radius: 50%; vertical-align: -0.15em; margin-right: 0.35em; }
.pl-cands { display: grid; grid-template-columns: auto 1fr auto; gap: 0.2rem 0.5rem; align-items: center; margin: 0.3rem 0 0.7rem; font-variant-numeric: tabular-nums; font-size: 0.85rem; }
.pl-cands i { display: block; height: 0.6rem; border-radius: 2px; background: var(--k-fig); min-width: 1px; }
.pl-cands .pl-top { color: var(--ink); font-weight: 600; }
.pl-match { border-top: 1px solid var(--rule); margin-top: 1.4rem; padding-top: 0.8rem; }
.pl-mini { width: min(17rem, 100%); }
/* the weasel */
.pl-best { font-family: var(--mono); font-size: clamp(0.85rem, 3.6vw, 1.35rem); letter-spacing: 0.04em; margin: 0.4rem 0; color: var(--ink-3); overflow-wrap: anywhere; white-space: pre-wrap; }
.pl-people { font-family: var(--mono); font-size: clamp(0.7rem, 2.7vw, 0.92rem); line-height: 1.55; margin: 0.4rem 0; overflow: hidden; }
.pl-row { display: flex; gap: 0.6rem; white-space: pre; }
.pl-row .pl-f { color: var(--ink-3); width: 2.2em; text-align: right; flex: none; font-variant-numeric: tabular-nums; }
.pl-row .pl-s { overflow: hidden; text-overflow: clip; }
.pl-m { color: var(--ok); font-weight: 600; } .pl-x { color: var(--ink-3); }
.pl-mut { background: color-mix(in srgb, var(--warn) 30%, transparent); border-radius: 2px; }
.pl-cut { box-shadow: -2px 0 0 var(--k-quiz); }
.pl-legend { display: flex; flex-wrap: wrap; gap: 0.3rem 1rem; font-family: var(--sans); font-size: 0.82rem; color: var(--ink-2); margin: 0.2rem 0 0.5rem; }
.pl-legend > span { min-width: 0; }
/* Huffman */
.pl-counts { display: flex; flex-wrap: wrap; gap: 0.3rem; margin: 0.4rem 0; font-family: var(--mono); font-size: 0.85rem; }
.pl-cnt { display: inline-flex; flex-direction: column; align-items: center; justify-content: flex-end; min-width: 1.7rem; }
.pl-cnt i { display: block; width: 1.1rem; border-radius: 2px 2px 0 0; }
.pl-cnt b { font-weight: 600; } .pl-cnt span { color: var(--ink-3); font-size: 0.75rem; font-family: var(--sans); }
.pl-sym { --l: 36%; color: hsl(var(--h) 70% var(--l)); }
.pl-symbg { --l: 46%; background: hsl(var(--h) 65% var(--l)); }
.pl-queue { display: flex; flex-wrap: wrap; gap: 0.25rem; align-items: center; font-family: var(--sans); font-size: 0.85rem; color: var(--ink-2); margin: 0.4rem 0; min-height: 1.8em; }
.pl-q { border: 1px solid var(--rule); border-radius: 3px; padding: 0.05rem 0.35rem; font-family: var(--mono); background: var(--paper); font-variant-numeric: tabular-nums; }
.pl-q.pl-lo { border-color: var(--k-fig); box-shadow: 0 0 0 1px var(--k-fig); }
.pl-codes { border-collapse: collapse; font-family: var(--mono); font-size: 0.88rem; margin: 0.3rem 0 0.8rem; }
.pl-codes td, .pl-codes th { padding: 0.12rem 0.55rem; text-align: left; border-bottom: 1px solid var(--rule-2); }
.pl-codes th { font-family: var(--sans); font-weight: 600; color: var(--ink-3); font-size: 0.78rem; }
.pl-codes td.pl-n { text-align: right; font-variant-numeric: tabular-nums; }
.pl-bits { font-family: var(--mono); font-size: 0.86rem; line-height: 1.7; overflow-wrap: anywhere; word-break: break-all; margin: 0.4rem 0; max-height: 14rem; overflow-y: auto; }
.pl-bits span { padding: 0 1px; border-radius: 2px; }
.pl-bits span.pl-now { outline: 2px solid var(--ink); }
.pl-bits span.pl-done { opacity: 0.45; }
.pl-sizes { display: grid; grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr)); gap: 0.5rem; margin: 0.6rem 0; font-family: var(--sans); }
.pl-size { border: 1px solid var(--rule); border-radius: 4px; padding: 0.45rem 0.65rem; background: var(--paper); }
.pl-size b { display: block; font-size: 1.25rem; font-weight: 600; color: var(--ink); font-variant-numeric: tabular-nums; }
.pl-size span { font-size: 0.82rem; color: var(--ink-2); }
.pl-size i { display: block; height: 0.4rem; border-radius: 2px; background: var(--ink-3); margin-top: 0.35rem; }
.pl-size.pl-hu { border-color: var(--k-fig); } .pl-size.pl-hu i { background: var(--k-fig); }
.pl-out { font-family: var(--mono); font-size: 0.95rem; color: var(--ink); white-space: pre-wrap; overflow-wrap: anywhere; min-height: 1.5em; border-left: 3px solid var(--k-fig); padding: 0.3rem 0.6rem; background: var(--paper-2); margin: 0.4rem 0; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .pl-sym { --l: 72%; } :root:not([data-theme="light"]) .pl-symbg { --l: 36%; } }
:root[data-theme="dark"] .pl-sym { --l: 72%; } :root[data-theme="dark"] .pl-symbg { --l: 36%; }
@media (prefers-reduced-motion: reduce) { .pl-disc.pl-fb, .pl-disc.pl-fw, .pl-disc.pl-pop { animation: none; } .pl-ring { transition: none; } }
`;
  function injectCss() {
    if (document.getElementById('algo-play-css')) return;
    const s = document.createElement('style'); s.id = 'algo-play-css'; s.textContent = CSS; document.head.appendChild(s);
  }
  const fmt = (n) => Math.round(n).toLocaleString('en-US');
  const pct = (x) => Math.round(100 * x) + '%';
  /** Call fn at most once per animation frame (the counters and the canvas are redrawn once, however many steps were taken). */
  function onceAFrame(fn) { let raf = 0; const go = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; fn(); }); }; go.cancel = () => { if (raf) cancelAnimationFrame(raf); raf = 0; }; return go; }
  function select(el, label, options, value, onchange) {
    const s = el('select', { 'aria-label': label, style: 'max-width: 100%', onchange: () => onchange(s.value) }, options.map(([v, t]) => el('option', { value: v }, t)));
    s.value = value; return s;
  }
  /** A labelled range slider with its value shown beside it. map turns the slider's 0..100 into the value, show into text. */
  function slider(el, label, value, map, show, onchange) {
    const input = el('input', { type: 'range', min: 0, max: 100, value, class: 'algo-speed', 'aria-label': label });
    const out = el('span', { class: 'pl-val', 'aria-hidden': 'true' });
    const upd = () => { out.textContent = show(map(+input.value)); input.setAttribute('aria-valuetext', show(map(+input.value))); };
    input.addEventListener('input', () => { upd(); if (onchange) onchange(map(+input.value)); });
    upd();
    return { label: el('label', { class: 'algo-speed-label' }, label + ' ', input, out), get: () => map(+input.value), input };
  }
  const isDark = (c) => { const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(c.paper || ''); return m ? (parseInt(m[1], 16) + parseInt(m[2], 16) + parseInt(m[3], 16)) < 300 : false; };
  /** A small line chart: series [{ values, color, width }], y from 0 to ymax, x the index. */
  function lineChart(ctx, x0, y0, w, h, series, ymax, c, labels) {
    ctx.strokeStyle = c.rule; ctx.lineWidth = 1; ctx.strokeRect(x0 + 0.5, y0 + 0.5, w, h);
    ctx.fillStyle = c.ink3; ctx.font = '11px ' + (c.sans || 'sans-serif'); ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (const v of labels.y) { const y = y0 + h - v / ymax * h; ctx.fillText(String(v), x0 - 5, y); ctx.strokeStyle = c.rule2; ctx.beginPath(); ctx.moveTo(x0 + 1, Math.round(y) + 0.5); ctx.lineTo(x0 + w, Math.round(y) + 0.5); ctx.stroke(); }
    const n = Math.max(2, ...series.map((s) => s.values.length));
    const X = (i) => x0 + i / (n - 1) * w, Y = (v) => y0 + h - Math.max(0, Math.min(ymax, v)) / ymax * h;
    for (const s of series) {
      if (s.values.length < 1) continue;
      ctx.strokeStyle = s.color; ctx.lineWidth = s.width || 2; ctx.lineJoin = 'round'; ctx.beginPath();
      s.values.forEach((v, i) => { if (i) ctx.lineTo(X(i), Y(v)); else ctx.moveTo(X(i), Y(v)); });
      if (s.values.length === 1) ctx.lineTo(X(0) + 2, Y(s.values[0]));
      ctx.stroke();
    }
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillStyle = c.ink3; ctx.fillText(labels.x0 || '0', x0, y0 + h + 4);
    ctx.textAlign = 'right'; ctx.fillText(labels.x1 || String(n - 1), x0 + w, y0 + h + 4);
  }

  // =====================================================================================================================
  // Demo 1: Reversi against Monte Carlo tree search
  // =====================================================================================================================
  const strengthOf = (v) => { const x = 50 * Math.pow(100, v / 100), p = Math.pow(10, Math.floor(Math.log10(x)) - 1); return Math.round(x / p) * p; };   // 50..5000, two significant figures
  function mountReversi(host, api) {
    injectCss();
    const el = api.el;
    let b = rvNew(), toMove = 1, human = 1, ai = 2, gen = 0, timer = 0, tree = null, thinking = false, last = -1, flipped = [], placed = -1, focusSq = sqAt('d3'), picked = -1, info = null, note = '', over = false;
    const firstSel = select(el, 'Your colour', [['b', 'You play Black and move first'], ['w', 'You play White; the computer starts']], 'b', () => newGame());
    const strength = slider(el, 'Random games a move', 50, strengthOf, (n) => fmt(n));
    const searchBox = el('input', { type: 'checkbox', checked: 'checked', onchange: () => paint() });
    const movesBox = el('input', { type: 'checkbox', checked: 'checked', onchange: () => paint() });
    host.append(el('div', { class: 'algo-controls' }, firstSel, el('button', { class: 'btn primary', type: 'button', onclick: () => newGame() }, 'New game'), strength.label),
      el('div', { class: 'algo-controls' }, el('label', { class: 'algo-speed-label' }, searchBox, 'Show the search on the board'), el('label', { class: 'algo-speed-label' }, movesBox, 'Show my legal moves')));
    const grid = el('div', { class: 'pl-rv', role: 'grid', 'aria-label': 'Reversi board, 8 by 8. Arrow keys move, Enter plays.' });
    const cells = new Map();
    for (let r = 1; r <= 8; r++) {
      const row = el('div', { role: 'row', style: 'display: contents' });
      for (let c = 1; c <= 8; c++) {
        const s = r * 10 + c;
        const disc = el('span', { class: 'pl-disc', 'aria-hidden': 'true' }), dot = el('span', { class: 'pl-dot', 'aria-hidden': 'true' }), ring = el('span', { class: 'pl-ring', 'aria-hidden': 'true' });
        const stB = el('b'), stS = el('span'), st = el('span', { class: 'pl-st', 'aria-hidden': 'true' }, stB, stS);
        const btn = el('button', { class: 'pl-sq', type: 'button', role: 'gridcell', tabindex: s === focusSq ? '0' : '-1', onclick: () => humanMove(s), onkeydown: (e) => keys(e, s), onfocus: () => { focusSq = s; roving(); } }, ring, disc, dot, st, c === 1 ? el('span', { class: 'pl-co pl-cor', 'aria-hidden': 'true' }, String(r)) : null, r === 8 ? el('span', { class: 'pl-co pl-coc', 'aria-hidden': 'true' }, 'abcdefgh'[c - 1]) : null);
        cells.set(s, { btn, disc, dot, ring, stB, stS }); row.append(btn);
      }
      grid.append(row);
    }
    function roving() { for (const [s, x] of cells) x.btn.tabIndex = s === focusSq ? 0 : -1; }
    function keys(e, s) {
      const d = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -10, ArrowDown: 10, Home: -(s % 10 - 1), End: 8 - s % 10 }[e.key];
      if (d === undefined) return;
      e.preventDefault(); const t = s + d;
      if (cells.has(t)) { focusSq = t; roving(); cells.get(t).btn.focus(); }
    }
    const score = el('div', { class: 'pl-score', 'aria-live': 'off' }), msg = el('p', { class: 'pl-msg', 'aria-live': 'polite' });
    const side = el('div', { class: 'pl-side' });
    host.append(el('div', { class: 'pl-wrap' }, el('div', { class: 'pl-rvwrap' }, grid, score, msg), side));
    const later = onceAFrame(() => paint());

    function paint() {
      const legal = !over && !thinking && toMove === human ? new Set(rvMoves(b, human)) : new Set();
      const stats = info && thinking && searchBox.checked ? new Map(info.kids.map((k) => [k.move, k])) : null;
      const maxV = info && info.kids.length ? Math.max(...info.kids.map((k) => k.visits)) : 1;
      const fl = new Map(flipped.map((s) => [s, Math.max(Math.abs(s % 10 - placed % 10), Math.abs(Math.floor(s / 10) - Math.floor(placed / 10)))]));
      for (const [s, x] of cells) {
        const p = b[s];
        let cls = 'pl-disc' + (p === 1 ? ' pl-b' : p === 2 ? ' pl-w' : '');
        if (fl.has(s)) { cls += p === 1 ? ' pl-fb' : ' pl-fw'; x.disc.style.animationDelay = (api.reducedMotion() ? 0 : fl.get(s) * 70) + 'ms'; }
        else if (s === placed) cls += ' pl-pop';
        if (x.disc.className !== cls) x.disc.className = cls;
        x.btn.classList.toggle('pl-can', legal.has(s));
        x.btn.classList.toggle('pl-last', s === last);
        x.btn.classList.toggle('pl-pick', s === picked);
        x.dot.classList.toggle('pl-show', movesBox.checked);
        const k = stats && !p ? stats.get(s) : null;
        if (k) {
          x.ring.style.transform = 'scale(' + (0.25 + 0.75 * Math.sqrt(k.visits / maxV)).toFixed(3) + ')';
          x.ring.style.background = 'hsl(' + Math.round(k.rate * 120) + ', 75%, 45%)';
          x.stB.textContent = pct(k.rate); x.stS.textContent = fmt(k.visits);
        } else if (x.stB.textContent || x.ring.style.transform !== 'scale(0)') { x.ring.style.transform = 'scale(0)'; x.stB.textContent = ''; x.stS.textContent = ''; }
        const col = 'abcdefgh'[s % 10 - 1] + Math.floor(s / 10);
        x.btn.setAttribute('aria-label', col + ': ' + (p === 1 ? 'black' : p === 2 ? 'white' : legal.has(s) ? 'empty, you can play here' : 'empty') + (k ? ', computer: ' + fmt(k.visits) + ' random games, wins ' + pct(k.rate) : ''));
        x.btn.setAttribute('aria-disabled', legal.has(s) ? 'false' : 'true');
      }
      const [nb, nw] = rvCount(b);
      score.replaceChildren(el('span', {}, el('span', { class: 'pl-chip pl-b', 'aria-hidden': 'true' }), 'Black ', el('b', {}, String(nb)), human === 1 ? ' (you)' : ''),
        el('span', {}, el('span', { class: 'pl-chip pl-w', 'aria-hidden': 'true' }), 'White ', el('b', {}, String(nw)), human === 2 ? ' (you)' : ''));
      if (over) { const w = rvWinner(b); msg.replaceChildren(w === human ? el('span', { class: 'pl-good' }, 'You win, ' + Math.max(nb, nw) + ' to ' + Math.min(nb, nw) + '! Try more random games a move.') : w ? 'The computer wins, ' + Math.max(nb, nw) + ' to ' + Math.min(nb, nw) + '.' : 'A draw, 32 each.'); }
      else msg.textContent = (note ? note + ' ' : '') + (thinking ? 'The computer is playing random games…' : toMove === human ? 'Your move (' + (human === 1 ? 'Black' : 'White') + '): click a square with a dot, or use the arrow keys and Enter.' : '');
      paintSide();
    }
    function paintSide() {
      side.replaceChildren(el('h3', {}, 'The computer’s search'));
      if (!info) { side.append(el('p', {}, 'When the computer is to move, it plays thousands of random games from the position, choosing its trial moves cleverly, and watches which first move wins most often. Its numbers appear on the board as it thinks: the win rate of each move and how many random games began with it.')); return; }
      side.append(el('div', { class: 'pl-kv' },
        el('span', {}, 'Random games played'), el('b', {}, fmt(info.playouts)),
        el('span', {}, 'Games a second'), el('b', {}, info.ms > 30 ? fmt(info.raw / info.cpu * 1000) : '–'),
        el('span', {}, info.done ? 'It played' : 'Best so far'), el('b', {}, info.best ? sqName(info.best.move) : '–'),
        el('span', {}, 'Its chance of winning'), el('b', {}, info.best ? pct(info.best.rate) : '–')));
      const ks = info.kids.slice().sort((a, b2) => b2.visits - a.visits).slice(0, 8), mv = ks.length ? ks[0].visits : 1;
      const list = el('div', { class: 'pl-cands', 'aria-hidden': 'true' });
      for (const k of ks) list.append(el('span', { class: k === info.best ? 'pl-top' : '' }, sqName(k.move)), el('i', { style: 'width:' + (100 * k.visits / mv).toFixed(1) + '%' }), el('span', { class: k === info.best ? 'pl-top' : '' }, fmt(k.visits) + ' · ' + pct(k.rate)));
      side.append(list, el('p', { class: 'pl-note' }, info.done
        ? 'It plays the move it tried most often, not the one with the best rate: a move with few games may just have been lucky. Moves that win more get more games, so the most-tried move is the one it trusts.'
        : 'Each new random game starts with the move whose rate plus a bonus for being little tried is highest (UCT). Watch good moves soak up the games.'));
    }
    function after(p) {
      // p has just moved: who is next?
      const nx = rvNext(b, p); note = '';
      if (!nx) { over = true; toMove = 0; return; }
      if (nx === p) note = p === human ? 'The computer has no legal move, so it passes.' : 'You have no legal move, so you pass.';
      toMove = nx;
    }
    function move(s, p) { flipped = rvPlay(b, s, p); placed = s; last = s; after(p); }
    function humanMove(s) {
      if (over || thinking || toMove !== human || !rvLegalAt(b, s, human)) return;
      info = null; picked = -1; move(s, human); paint();
      if (toMove === ai) think();
    }
    function think() {
      const myGen = gen, target = strength.get(), minMs = api.reducedMotion() ? 0 : 650, delay = api.reducedMotion() ? 0 : 450;
      thinking = true; picked = -1;
      tree = mctsNew(b, ai, 1 + Math.floor(Math.random() * 1e9));
      let t0 = 0, cpu = 0;
      info = { kids: [], playouts: 0, raw: 0, cpu: 1, ms: 0, best: null, done: false }; paint();
      const tick = () => {
        timer = 0;
        if (myGen !== gen || !host.isConnected) return;
        const now = performance.now(); if (!t0) t0 = now;
        const allowed = minMs ? Math.min(target, Math.ceil(target * (now - t0 + 30) / minMs)) : target, end = now + 12;
        while (tree.playouts < allowed && performance.now() < end) mctsRun(tree, Math.min(20, allowed - tree.playouts));
        cpu += performance.now() - now;
        const st = mctsStats(tree);
        info = { kids: st.kids, playouts: st.playouts, raw: st.playouts, cpu: Math.max(1, cpu), ms: performance.now() - t0, best: st.best, done: false };
        if (tree.playouts >= target) {
          info.done = true; picked = st.best.move; later();
          timer = setTimeout(() => { timer = 0; if (myGen !== gen) return; thinking = false; picked = -1; move(st.best.move, ai); paint(); if (toMove === ai) timer = setTimeout(think, delay); }, delay);
          return;
        }
        later(); timer = setTimeout(tick, 0);
      };
      timer = setTimeout(tick, delay);
    }
    function newGame() {
      gen++; if (timer) clearTimeout(timer); timer = 0; thinking = false;
      b = rvNew(); toMove = 1; last = -1; flipped = []; placed = -1; picked = -1; info = null; note = ''; over = false;
      human = firstSel.value === 'b' ? 1 : 2; ai = 3 - human; paint();
      if (ai === 1) think();
    }

    // ---- the match: MCTS against the greedy player, ten games, with a bet first
    const mStrength = select(el, 'Random games a move for MCTS in the match', [['5', 'MCTS with 5 random games a move'], ['20', 'MCTS with 20'], ['200', 'MCTS with 200']], '20', () => {});
    const bet = select(el, 'Your bet', [['', 'Who wins more games? (bet)'], ['m', 'MCTS wins more'], ['g', 'Greedy wins more'], ['e', 'They tie, 5 to 5']], '', () => {});
    const matchBtn = el('button', { class: 'btn', type: 'button', onclick: () => (mRunning ? stopMatch('Stopped.') : startMatch()) }, 'Play the match');
    const mStatus = el('p', { class: 'pl-msg', 'aria-live': 'polite' }, 'Make your bet, then press Play the match.');
    const mWrap = el('div', { class: 'pl-mini' });
    host.append(el('section', { class: 'pl-match' }, el('h3', { class: 'pl-h3' }, 'A match: MCTS against a greedy player'),
      el('p', { class: 'pl-note' }, 'The greedy player always takes the move that flips the most discs right now. MCTS knows nothing about Reversi except the rules and how to count discs at the end. Ten games, each side Black in five. Who will win more?'),
      el('div', { class: 'algo-controls' }, mStrength, bet, matchBtn)));
    const mHost = host.lastChild; mHost.append(mWrap, mStatus);
    let mb = rvNew(), mP = 1, mGame = 0, mResults = [], mRunning = false, mTimer = 0, mRand = null, mLast = -1;
    const mcv = api.canvas(mWrap, { label: 'The match board and the results so far', maxWidth: 272, height: (w) => w + 34, draw: drawMatch });
    function drawMatch(ctx, w, h, c) {
      ctx.fillStyle = c.paper; ctx.fillRect(0, 0, w, h);
      const s = w / 8, dark = isDark(c);
      ctx.fillStyle = dark ? '#1f5a37' : '#2f8a55'; ctx.fillRect(0, 0, w, w);
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1;
      for (let k = 1; k < 8; k++) { ctx.beginPath(); ctx.moveTo(k * s + 0.5, 0); ctx.lineTo(k * s + 0.5, w); ctx.moveTo(0, k * s + 0.5); ctx.lineTo(w, k * s + 0.5); ctx.stroke(); }
      for (const q of SQUARES) if (mb[q]) {
        const x = (q % 10 - 0.5) * s, y = (Math.floor(q / 10) - 0.5) * s;
        ctx.beginPath(); ctx.arc(x, y, s * 0.4, 0, 2 * Math.PI); ctx.fillStyle = mb[q] === 1 ? '#18191b' : '#f2f2ec'; ctx.fill();
        if (q === mLast) { ctx.beginPath(); ctx.arc(x, y, s * 0.08, 0, 2 * Math.PI); ctx.fillStyle = '#e2463a'; ctx.fill(); }
      }
      // ten result dots: who won each game
      for (let g = 0; g < 10; g++) {
        const x = (g + 0.5) * w / 10, y = w + 17, r = Math.min(9, w / 26), res = mResults[g];
        ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = res === 'm' ? c.ok : res === 'g' ? c.err : res === 'd' ? c.ink3 : c.paper2; ctx.fill();
        ctx.strokeStyle = g === mGame && mRunning ? c.ink : c.rule; ctx.lineWidth = g === mGame && mRunning ? 2 : 1; ctx.stroke();
        if (res) { ctx.fillStyle = c.paper; ctx.font = '700 ' + Math.round(r) + 'px ' + (c.sans || 'sans-serif'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(res === 'm' ? 'M' : res === 'g' ? 'G' : '=', x, y + 0.5); }
      }
    }
    const mTally = () => ({ m: mResults.filter((r) => r === 'm').length, g: mResults.filter((r) => r === 'g').length, d: mResults.filter((r) => r === 'd').length });
    function startMatch() {
      mResults = []; mGame = 0; mb = rvNew(); mP = 1; mLast = -1; mRunning = true; mRand = A.rng(1 + Math.floor(Math.random() * 1e9));
      matchBtn.textContent = 'Stop'; mStatus.textContent = 'Game 1: MCTS plays Black.'; mcv.redraw(); mTimer = setTimeout(mStep, 200);
    }
    function stopMatch(text) { mRunning = false; if (mTimer) clearTimeout(mTimer); mTimer = 0; matchBtn.textContent = 'Play the match'; if (text) mStatus.textContent = text; mcv.redraw(); }
    function mStep() {
      mTimer = 0;
      if (!mRunning || !host.isConnected) { mRunning = false; return; }
      const mctsIs = mGame % 2 === 0 ? 1 : 2;   // MCTS is Black in the even games
      const m = mP === mctsIs ? mctsMove(mb, mP, +mStrength.value, mRand.int(1e9)) : greedyMove(mb, mP, mRand);
      if (m !== PASS) { rvPlay(mb, m, mP); mLast = m; }
      const nx = rvNext(mb, mP);
      if (!nx) {
        const w = rvWinner(mb), [x, o] = rvCount(mb);
        mResults.push(w === 0 ? 'd' : w === mctsIs ? 'm' : 'g');
        const t = mTally();
        mGame++;
        if (mGame >= 10) {
          const res = t.m > t.g ? 'm' : t.g > t.m ? 'g' : 'e', who = { m: 'MCTS wins the match', g: 'Greedy wins the match', e: 'The match is a tie' }[res];
          stopMatch(null);
          mStatus.replaceChildren(who + ', ' + t.m + ' to ' + t.g + (t.d ? ' with ' + t.d + ' drawn' : '') + '. ', bet.value ? (bet.value === res ? el('span', { class: 'pl-good' }, 'Your bet won!') : 'Your bet lost.') : 'You made no bet.',
            ' Greedy grabs discs now; MCTS has seen, in its random games, that discs in the middle of the game matter less than corners and edges, which can never be flipped back.');
          return;
        }
        mStatus.textContent = 'Game ' + mGame + ': ' + (w === mctsIs ? 'MCTS' : w ? 'greedy' : 'nobody') + ' won, ' + Math.max(x, o) + ' to ' + Math.min(x, o) + '. So far MCTS ' + t.m + ', greedy ' + t.g + '. Game ' + (mGame + 1) + ': MCTS plays ' + (mGame % 2 === 0 ? 'Black' : 'White') + '.';
        mb = rvNew(); mP = 1; mLast = -1; mcv.redraw();
        mTimer = setTimeout(mStep, api.reducedMotion() ? 0 : 500); return;
      }
      mP = nx; mcv.redraw();
      mTimer = setTimeout(mStep, api.reducedMotion() ? 0 : 45);
    }
    newGame();
    return () => { gen++; if (timer) clearTimeout(timer); timer = 0; later.cancel(); stopMatch(null); mcv.stop(); };
  }

  // =====================================================================================================================
  // Demo 2: a genetic algorithm (the weasel, and rolling shapes)
  // =====================================================================================================================
  function mountGenetic(host, api) {
    injectCss();
    const el = api.el;
    const weaselBtn = el('button', { class: 'btn', type: 'button', 'aria-pressed': 'true', onclick: () => show('weasel') }, 'The weasel: a known target');
    const shapesBtn = el('button', { class: 'btn', type: 'button', 'aria-pressed': 'false', onclick: () => show('shapes') }, 'Rolling shapes: no known answer');
    const pane = el('div');
    host.append(el('div', { class: 'pl-tabs', role: 'group', 'aria-label': 'Which experiment' }, weaselBtn, shapesBtn), pane);
    let stop = null;
    function show(which) {
      if (stop) { try { stop(); } catch (e) { /* ignore */ } stop = null; }
      weaselBtn.setAttribute('aria-pressed', String(which === 'weasel')); shapesBtn.setAttribute('aria-pressed', String(which === 'shapes'));
      pane.replaceChildren();
      stop = which === 'weasel' ? mountWeasel(pane, api) : mountShapes(pane, api);
    }
    show('weasel');
    return () => { if (stop) stop(); stop = null; };
  }

  const BETS = [[0, 50, 'fewer than 50'], [50, 100, '50 to 99'], [100, 200, '100 to 199'], [200, 500, '200 to 499'], [500, Infinity, '500 or more (or never)']];
  const GIVE_UP = 3000;
  function mountWeasel(host, api) {
    const el = api.el;
    let target = WEASEL, w = null, seed = 1;
    const input = el('input', { type: 'text', maxlength: '60', value: WEASEL, 'aria-label': 'Target phrase', spellcheck: 'false', autocomplete: 'off' });
    const err = el('span', { class: 'pl-err', role: 'status' });
    const useIt = () => { const r = cleanTarget(input.value); if (r.error) { err.textContent = r.error; return; } err.textContent = ''; target = r.target; input.value = target; pl.reset(); };
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); useIt(); } });
    host.append(el('div', { class: 'pl-field' }, el('span', {}, 'Target'), input, el('button', { class: 'btn quiet', type: 'button', onclick: useIt }, 'Use it'), err));
    const method = select(el, 'Method', [['ga', 'Genetic algorithm: crossover and mutation'], ['dawkins', 'Dawkins’ way: copies of the best']], 'ga', () => pl.reset());
    const size = slider(el, 'Population', 40, (v) => Math.round(10 * Math.pow(50, v / 100)), (n) => String(n), () => pl.reset());
    const rate = slider(el, 'Mutation', 45, (v) => 0.002 * Math.pow(125, v / 100), (x) => (x * 100 < 1 ? (x * 100).toFixed(1) : Math.round(x * 100)) + '%', () => pl.reset());
    const bet = el('select', { 'aria-label': 'Your bet: how many generations?' }, el('option', { value: '' }, 'no bet'), BETS.map((x, i) => el('option', { value: String(i) }, x[2])));
    host.append(el('div', { class: 'algo-controls' }, method), el('div', { class: 'algo-controls' }, size.label, rate.label, el('label', {}, 'How many generations? ', bet)));
    const big = el('p', { class: 'pl-best', 'aria-live': 'off' }), msg = el('p', { class: 'pl-msg', 'aria-live': 'polite' });
    const popBox = el('div', { class: 'pl-people', 'aria-hidden': 'true' });
    host.append(big, el('div', { class: 'pl-legend' }, el('span', {}, el('span', { class: 'pl-m' }, 'A'), ' right letter in the right place'), el('span', {}, el('span', { class: 'pl-mut' }, 'B'), ' mutated in this generation'), el('span', {}, el('span', { class: 'pl-cut' }, ' C'), ' crossover point: the left part from one parent, the right from the other')));
    const cv = api.canvas(host, { label: 'Best and average fitness by generation', maxWidth: 1100, height: (wd) => (wd < 500 ? 130 : 160), draw });
    host.append(msg);
    const pl = api.player(host, {
      speeds: [1, 300], speed: 45,
      start: () => { seed = 1 + Math.floor(Math.random() * 1e9); w = weaselNew(target, size.get(), rate.get(), method.value, seed); later(); return run(); },
      onStep: () => later(),
      onDone: () => { later.cancel(); paint(); finish(); },
      onReset: () => { w = weaselNew(target, size.get(), rate.get(), method.value, 1 + Math.floor(Math.random() * 1e9)); msg.textContent = 'Make your bet, then press Play.'; later(); }
    });
    host.append(el('h3', { class: 'pl-h3' }, 'The population, best first'), popBox);
    function* run() { msg.textContent = 'Breeding: each generation is made from the one before.'; while (!w.done && w.gen < GIVE_UP) { weaselStep(w); yield w.gen; } }
    function finish() {
      const g = w.gen, found = w.done, bi = BETS.findIndex(([lo, hi]) => (found ? g : Infinity) >= lo && (found ? g : Infinity) < hi);
      const betText = bet.value === '' ? '' : +bet.value === bi ? ' Your bet won!' : ' Your bet was ' + BETS[+bet.value][2] + '.';
      msg.replaceChildren(found ? el('span', { class: 'pl-good' }, 'Found after ' + fmt(g) + ' generations, ' + fmt(g * w.size) + ' phrases in all.') : 'Gave up after ' + fmt(GIVE_UP) + ' generations: the mutation rate is too high to keep what selection finds.', betText);
    }
    const later = onceAFrame(() => paint());
    function chars(s, x) {
      const out = [];
      for (let i = 0; i < s.length; i++) {
        let c = s[i] === target[i] ? 'pl-m' : 'pl-x';
        if (x && x.mut.includes(i)) c += ' pl-mut';
        if (x && i === x.cut) c += ' pl-cut';
        out.push(el('span', { class: c }, s[i]));
      }
      return out;
    }
    function paint() {
      if (!w) return;
      const best = w.pop[0], n = target.length;
      big.replaceChildren(...chars(best.s, null));
      big.setAttribute('aria-label', 'Best phrase: ' + best.s);
      const rows = Math.min(w.pop.length, (host.clientWidth || 600) < 500 ? 8 : 12);
      popBox.replaceChildren(...w.pop.slice(0, rows).map((x) => el('div', { class: 'pl-row' }, el('span', { class: 'pl-f' }, String(x.f)), el('span', { class: 'pl-s' }, ...chars(x.s, w.gen ? x : null)))),
        w.pop.length > rows ? el('div', { class: 'pl-note' }, '… and ' + (w.pop.length - rows) + ' more') : null);
      if (pl.isRunning() || w.gen) pl.status('Generation ' + fmt(w.gen) + ' · best ' + best.f + ' of ' + n);
      else pl.status('Pure chance: 1 in ' + chance(n) + ' for each random phrase.');
      cv.redraw();
    }
    function chance(n) { const e = n * Math.log10(27); return e < 6 ? fmt(Math.pow(27, n)) : '10^' + Math.floor(e); }
    function draw(ctx, wd, h, c) {
      ctx.fillStyle = c.paper; ctx.fillRect(0, 0, wd, h);
      if (!w) return;
      const n = target.length, ys = []; for (let k = 0; k <= n; k += Math.max(1, Math.ceil(n / 4))) ys.push(k); if (ys[ys.length - 1] !== n) ys.push(n);
      lineChart(ctx, 34, 12, wd - 46, h - 34, [{ values: w.history.map((x) => x.mean), color: c.ink3, width: 1.5 }, { values: w.history.map((x) => x.best), color: c.accent, width: 2.5 }], n, c, { y: ys, x0: 'generation 0', x1: fmt(w.gen) });
      ctx.font = '12px ' + (c.sans || 'sans-serif'); ctx.textBaseline = 'top'; ctx.textAlign = 'left';
      ctx.fillStyle = c.accent; ctx.fillText('best', 42, 16); ctx.fillStyle = c.ink3; ctx.fillText('average', 80, 16);
    }
    msg.textContent = 'Make your bet, then press Play.';
    w = weaselNew(target, size.get(), rate.get(), method.value, 1 + Math.floor(Math.random() * 1e9)); paint();
    return () => { pl.stop(); cv.stop(); later.cancel(); };
  }

  function mountShapes(host, api) {
    const el = api.el;
    let trackSeed = 7, hs = makeTrack(trackSeed), rand = A.rng(1 + Math.floor(Math.random() * 1e9)), gen = 0, pop = [], rollers = [], history = [], champs = [], camX = 0, camY = 0;
    const size = select(el, 'Population', [['8', '8 shapes'], ['12', '12 shapes'], ['20', '20 shapes'], ['30', '30 shapes']], '20', () => pl.reset());
    const rate = slider(el, 'Mutation', 50, (v) => 0.01 * Math.pow(60, v / 100), (x) => Math.round(x * 100) + '%');
    host.append(el('p', { class: 'pl-note' }, 'Each shape is a body with 16 spokes; its genes are the 16 spoke lengths. All of a generation are let go at the top of the same hilly track, and each one’s fitness is how far it rolls before it stops. The two best go on unchanged; the others are replaced by children of good parents: each spoke from one parent or the other, sometimes nudged by a mutation. Nobody told the program what a good shape looks like.'),
      el('div', { class: 'algo-controls' }, size, rate.label,
        el('button', { class: 'btn quiet', type: 'button', onclick: () => { trackSeed = 1 + Math.floor(Math.random() * 9999); hs = makeTrack(trackSeed); pl.reset(); } }, 'New track'),
        el('button', { class: 'btn quiet', type: 'button', onclick: () => fast(10) }, 'Evolve 10 generations quickly')));
    const cv = api.canvas(host, { label: 'The shapes rolling down the track', maxWidth: 1100, height: (w) => Math.round(Math.max(220, Math.min(380, w * 0.42))), draw });
    const msg = el('p', { class: 'pl-msg', 'aria-live': 'polite' });
    host.append(msg);
    const pl = api.player(host, {
      speeds: [30, 3000], speed: 50,
      start: () => { if (!gen) msg.textContent = 'Generation 1 is rolling. Which shapes keep going?'; return (function* () { for (;;) yield 1; })(); },
      onStep: () => { tick(); later(); },
      onReset: () => { rand = A.rng(1 + Math.floor(Math.random() * 1e9)); gen = 0; history = []; champs = []; pop = Array.from({ length: +size.value }, () => ({ genes: randomGenes(rand), hue: 360 * rand(), elite: false })); release(); msg.textContent = 'Generation 1: random shapes. Press Play and watch which ones roll.'; later(); }
    });
    host.append(el('h3', { class: 'pl-h3' }, 'Distance by generation, and each generation’s champion'));
    const chart = api.canvas(host, { label: 'Best and average distance of each generation, and the best shape of each', maxWidth: 1100, height: (w) => (w < 500 ? 190 : 210), draw: drawChart });
    const later = onceAFrame(() => { cv.redraw(); chart.redraw(); });
    function release() { rollers = pop.map((p) => Object.assign(rollerNew(p.genes, hs), { hue: p.hue, elite: p.elite })); camX = 0; camY = trackY(hs, 4); }
    function endGeneration() {
      const scored = rollers.map((o) => ({ genes: o.genes, f: rollerFitness(o), hue: o.hue }));
      const fs = scored.map((x) => x.f), best = scored.reduce((a, x) => (x.f > a.f ? x : a));
      history.push({ best: best.f, mean: fs.reduce((a, x) => a + x, 0) / fs.length }); champs.push({ genes: best.genes, hue: best.hue, f: best.f });
      gen++;
      const fin = rollers.filter((o) => o.x >= TRACK).length;
      msg.textContent = 'Generation ' + gen + ': the best rolled ' + (best.f >= TRACK ? 'to the finish' + (fin > 1 ? ' (' + fin + ' finished)' : '') : best.f.toFixed(1) + ' m') + '. Now generation ' + (gen + 1) + ', bred from the best.';
      pop = shapesBreed(scored, rate.get(), rand); release();
    }
    function tick() { let alive = 0; for (const o of rollers) { rollerStep(o, hs); if (!o.stopped) alive++; } if (!alive) endGeneration(); }
    function fast(n) {
      pl.pause();
      // whole generations without drawing; a generation of 30 shapes takes a few tens of milliseconds
      for (let k = 0; k < n; k++) { let guard = 0; while (rollers.some((o) => !o.stopped) && guard++ < 1e5) for (const o of rollers) rollerStep(o, hs); endGeneration(); }
      later();
    }
    function leader() { let L = null; for (const o of rollers) if (!L || o.x > L.x) L = o; return L; }
    function draw(ctx, w, h, c) {
      ctx.fillStyle = c.paper; ctx.fillRect(0, 0, w, h);
      if (!rollers.length) return;
      const L = leader(), s = Math.max(30, Math.min(46, w / 18));
      // the camera eases toward the leader, keeping it a third of the way in
      const tx = L.x - w / s * 0.35, ty = L.y;
      camX += (tx - camX) * (api.reducedMotion() ? 1 : 0.15); camY += (ty - camY) * (api.reducedMotion() ? 1 : 0.15);
      if (Math.abs(tx - camX) > 30) camX = tx;
      if (Math.abs(ty - camY) > 30) camY = ty;
      const X = (x) => (x - camX) * s, Y = (y) => h * 0.5 - (y - camY) * s;
      const dark = isDark(c);
      // ground
      const x0 = Math.max(0, Math.floor(camX) - 1), x1 = Math.min(hs.length - 1, Math.ceil(camX + w / s) + 1);
      ctx.beginPath(); ctx.moveTo(X(x0), h + 2);
      for (let x = x0; x <= x1; x++) ctx.lineTo(X(x), Y(hs[x]));
      ctx.lineTo(X(x1), h + 2); ctx.closePath();
      ctx.fillStyle = dark ? '#21301f' : '#dfeccf'; ctx.fill();
      ctx.strokeStyle = dark ? '#6f9a5c' : '#5c8a45'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
      ctx.beginPath(); for (let x = x0; x <= x1; x++) { if (x === x0) ctx.moveTo(X(x), Y(hs[x])); else ctx.lineTo(X(x), Y(hs[x])); } ctx.stroke();
      // distance posts every 10 m and the finish
      ctx.font = '11px ' + (c.sans || 'sans-serif'); ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      for (let m = 10; m <= TRACK; m += 10) {
        if (m < x0 || m > x1) continue;
        const gx = X(m), gy = Y(trackY(hs, m));
        if (m === TRACK) {
          ctx.strokeStyle = c.ink2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy - 2.2 * s); ctx.stroke();
          for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { ctx.fillStyle = (i + j) % 2 ? c.ink : c.paper; ctx.fillRect(gx + i * 0.2 * s, gy - 2.2 * s + j * 0.2 * s, 0.2 * s, 0.2 * s); }
          ctx.fillStyle = c.ink2; ctx.fillText('finish', gx, gy - 2.3 * s);
        } else { ctx.strokeStyle = c.rule; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy - 0.8 * s); ctx.stroke(); ctx.fillStyle = c.ink3; ctx.fillText(m + ' m', gx, gy - 0.85 * s); }
      }
      // shapes: the stopped ones faded, the champions of the last generation outlined
      const order = rollers.slice().sort((a, b) => (a.stopped === b.stopped ? 0 : a.stopped ? -1 : 1));
      for (const o of order) {
        const ca = Math.cos(o.a), sa = Math.sin(o.a), cx = X(o.x), cy = Y(o.y);
        if (cx < -60 || cx > w + 60) continue;
        ctx.beginPath();
        o.body.verts.forEach(([lx, ly], i) => { const px = cx + (lx * ca - ly * sa) * s, py = cy - (lx * sa + ly * ca) * s; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); });
        ctx.closePath();
        const light = dark ? 62 : 52;
        ctx.fillStyle = 'hsla(' + o.hue.toFixed(0) + ', 70%, ' + light + '%, ' + (o.stopped ? 0.18 : 0.55) + ')'; ctx.fill();
        ctx.strokeStyle = o.elite ? c.ink : 'hsla(' + o.hue.toFixed(0) + ', 70%, ' + (light - 12) + '%, ' + (o.stopped ? 0.35 : 0.95) + ')'; ctx.lineWidth = o.elite ? 2 : 1.4; ctx.stroke();
        // two spokes, so that the turning shows
        ctx.strokeStyle = 'hsla(' + o.hue.toFixed(0) + ', 60%, ' + (light - 20) + '%, ' + (o.stopped ? 0.3 : 0.8) + ')'; ctx.lineWidth = 1;
        ctx.beginPath(); for (const i of [0, K / 2]) { const [lx, ly] = o.body.verts[i]; ctx.moveTo(cx, cy); ctx.lineTo(cx + (lx * ca - ly * sa) * s, cy - (lx * sa + ly * ca) * s); } ctx.stroke();
      }
      const alive = rollers.filter((o) => !o.stopped).length;
      ctx.fillStyle = c.ink; ctx.font = '600 13px ' + (c.sans || 'sans-serif'); ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('Generation ' + (gen + 1), 10, 8);
      ctx.fillStyle = c.ink2; ctx.font = '12px ' + (c.sans || 'sans-serif');
      ctx.fillText(alive + ' of ' + rollers.length + ' still rolling · leader at ' + Math.min(TRACK, L.x).toFixed(1) + ' m', 10, 26);
    }
    function drawChart(ctx, w, h, c) {
      ctx.fillStyle = c.paper; ctx.fillRect(0, 0, w, h);
      const ch = h - 92, top = TRACK + 30;
      lineChart(ctx, 36, 10, w - 48, ch, [{ values: history.map((x) => x.mean), color: c.ink3, width: 1.5 }, { values: history.map((x) => x.best), color: c.accent, width: 2.5 }], top, c, { y: [0, 40, 80, 120], x0: history.length ? 'generation 1' : 'no generations yet', x1: history.length ? String(history.length) : ' ' });
      ctx.font = '12px ' + (c.sans || 'sans-serif'); ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillStyle = c.accent; ctx.fillText('best (m)', 44, 14); ctx.fillStyle = c.ink3; ctx.fillText('average', 104, 14);
      // the champions, the latest on the right
      const box = 52, n = Math.max(1, Math.floor((w - 20) / (box + 6))), show = champs.slice(-n), y0 = h - 64, dark = isDark(c);
      show.forEach((ch2, k) => {
        const gx = 10 + k * (box + 6) + box / 2, gy = y0 + 26, body = shapeBody(ch2.genes), sc = 30;
        ctx.beginPath(); body.verts.forEach(([lx, ly], i) => { if (i) ctx.lineTo(gx + lx * sc, gy - ly * sc); else ctx.moveTo(gx + lx * sc, gy - ly * sc); }); ctx.closePath();
        ctx.fillStyle = 'hsla(' + ch2.hue.toFixed(0) + ', 70%, ' + (dark ? 62 : 52) + '%, 0.55)'; ctx.fill(); ctx.strokeStyle = c.ink2; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = c.ink3; ctx.font = '10px ' + (c.sans || 'sans-serif'); ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText(String(champs.length - show.length + k + 1), gx, y0 + 52);
      });
      if (!champs.length) { ctx.fillStyle = c.ink3; ctx.font = '12px ' + (c.sans || 'sans-serif'); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('The best shape of each generation will appear here.', 10, y0 + 26); }
    }
    pl.reset();
    return () => { pl.stop(); cv.stop(); chart.stop(); later.cancel(); };
  }

  // =====================================================================================================================
  // Demo 3: Huffman coding
  // =====================================================================================================================
  const HUFF_MAX = 400;
  const showSym = (ch) => (ch === ' ' ? '␣' : ch === '\n' ? '↵' : ch === '\t' ? '⇥' : /[\u0000-\u001f\u007f]/.test(ch) ? '·' : ch);
  function mountHuffman(host, api) {
    injectCss();
    const el = api.el;
    const area = el('textarea', { rows: '3', maxlength: String(HUFF_MAX), 'aria-label': 'Text to compress', spellcheck: 'false' });
    area.value = 'she sells sea shells by the sea shore';
    const err = el('span', { class: 'pl-note', role: 'status' });
    const bet = el('select', { 'aria-label': 'Your bet' }, el('option', { value: '' }, 'no bet'), el('option', { value: 'y' }, 'Yes, fewer than 5 bits a letter'), el('option', { value: 'n' }, 'No, 5 or more'));
    host.append(el('div', { class: 'pl-field' }, el('label', { style: 'flex-basis: 100%' }, 'Your text (up to ' + HUFF_MAX + ' characters):'), area, el('button', { class: 'btn quiet', type: 'button', onclick: () => useText() }, 'Use this text'), err),
      el('div', { class: 'algo-controls' }, el('label', {}, 'Will Huffman beat 5 bits a letter on this text? ', bet)));
    const countsBox = el('div', { class: 'pl-counts', 'aria-label': 'How often each character appears' });
    const queue = el('div', { class: 'pl-queue', 'aria-live': 'off' });
    host.append(el('h3', { class: 'pl-h3' }, 'How often each character appears'), countsBox, queue);
    const cv = api.canvas(host, { label: 'The Huffman tree', maxWidth: 1100, height: (w) => (w < 500 ? 280 : 340), draw });
    const msg = el('p', { class: 'pl-msg', 'aria-live': 'polite' });
    host.append(msg);
    const pl = api.player(host, {
      speeds: [1, 60], speed: 40,
      start: () => { prepare(); return run(); },
      onStep: () => later(),
      onDone: () => { phase = 'end'; cur = null; later(); },
      onReset: () => { prepare(); later(); }
    });
    const result = el('div');
    host.append(result);
    let text = '', counts = [], root = null, codes = new Map(), hue = new Map(), pos = new Map(), present = new Set(), forest = [], lo = [], phase = 'start', decoded = '', cur = null, pathSet = new Set(), letters = [];
    function useText() {
      let t = area.value; const arr = Array.from(t);
      if (arr.length > HUFF_MAX) { t = arr.slice(0, HUFF_MAX).join(''); area.value = t; err.textContent = 'Cut to ' + HUFF_MAX + ' characters.'; } else err.textContent = '';
      if (!arr.length) { err.textContent = 'Type some text first.'; return; }
      pl.reset();
    }
    function prepare() {
      text = Array.from(area.value).slice(0, HUFF_MAX).join('') || 'a';
      letters = Array.from(text); counts = countSymbols(text); root = huffmanTree(counts); codes = huffmanCodes(root);
      hue = new Map(counts.map(([s], i) => [s, Math.round((i * 137.508) % 360)]));
      layout(); forest = counts.map(([sym, w2], i) => ({ sym, w: w2, id: i })).sort((a, b) => a.w - b.w || a.id - b.id);
      present = new Set(); for (const n of leavesOf(root)) present.add(n);
      lo = []; phase = 'build'; decoded = ''; cur = null; pathSet = new Set();
      msg.textContent = 'Press Play: the two lightest nodes are joined, again and again, until one tree is left.';
      paintCounts(); paintResult();
    }
    function leavesOf(n) { if (!n) return []; return n.sym !== undefined ? [n] : [...leavesOf(n.l), ...leavesOf(n.r)]; }
    // the final tree's shape: leaves left to right in the tree's order, each inner node above the middle of its children, at a
    // height one more than its taller child, so that the tree grows upward as it is built, and every node already has its place
    let maxH = 0;
    function layout() {
      pos = new Map(); let k = 0; const nl = leavesOf(root).length;
      const walk = (n) => { if (n.sym !== undefined) { pos.set(n, { x: (k++ + 0.5) / nl, h: 0 }); return 0; } const a = walk(n.l), b = walk(n.r); const hh = 1 + Math.max(a, b); pos.set(n, { x: (pos.get(n.l).x + pos.get(n.r).x) / 2, h: hh }); return hh; };
      maxH = root ? walk(root) : 0;
    }
    function* run() {
      if (root.sym === undefined) {
        const g = huffmanSteps(counts); g.next();
        for (;;) {
          lo = forest.slice(0, 2); msg.textContent = 'The two lightest: ' + lo.map(nodeName).join(' and ') + '. Join them under a new node of weight ' + (lo[0].w + lo[1].w) + '.';
          yield 1;
          const r = g.next(); if (r.done) break;
          forest = r.value.forest; present.add(r.value.merged); lo = [];
          // the node made by the pure algorithm is a new object; find its place by its children
          yield 1;
          if (forest.length === 1) break;
        }
      }
      phase = 'codes'; lo = [];
      msg.textContent = 'One tree. Read each letter’s code from the top: 0 for a step left, 1 for a step right. Common letters are near the top, so their codes are short.';
      paintResult(); yield 1;
      phase = 'decode';
      const bits = encode(text, codes);
      let n = root, path = [root];
      for (let i = 0; i < letters.length; i++) {
        const code = codes.get(letters[i]);
        path = [root]; n = root;
        if (root.sym === undefined) for (const bch of code) { n = bch === '0' ? n.l : n.r; path.push(n); }
        cur = i; pathSet = new Set(path); decoded += n.sym;
        msg.textContent = 'Decoding: read ' + code + ' from the top of the tree, ' + (root.sym === undefined ? code.split('').map((x) => (x === '0' ? 'left' : 'right')).join(', ') : 'the only letter') + ', and land on “' + showSym(n.sym) + '”. Back to the top for the next bit.';
        paintBits(); paintOut(); yield 1;
      }
      cur = null; pathSet = new Set(); paintBits();
      msg.replaceChildren(decode(bits, root) === text ? el('span', { class: 'pl-good' }, 'Decoded every letter: the same text, from ' + fmt(bits.length) + ' bits instead of ' + fmt(8 * letters.length) + '.') : 'Decoding went wrong.');
    }
    function nodeName(n) { return n.sym !== undefined ? '“' + showSym(n.sym) + '” (' + n.w + ')' : 'a tree of weight ' + n.w; }
    const later = onceAFrame(() => { paintQueue(); cv.redraw(); });
    // the pure algorithm makes its own node objects; the drawing uses the final tree, so match a forest node to it by its leaves
    function sameNode(a, b) { return a.w === b.w && leafKey(a) === leafKey(b); }
    const keyCache = new WeakMap();
    function leafKey(n) { if (keyCache.has(n)) return keyCache.get(n); const k = n.sym !== undefined ? n.sym : leafKey(n.l) + '\u0001' + leafKey(n.r); keyCache.set(n, k); return k; }
    function finalOf(n) { let found = null; const walk = (x) => { if (found) return; if (sameNode(x, n)) { found = x; return; } if (x.sym === undefined) { walk(x.l); walk(x.r); } }; walk(root); return found; }
    function shown() {
      // the final-tree nodes that exist so far: the leaves, and every inner node of the final tree whose subtree is already built
      const s = new Set(leavesOf(root)), done = [...present].map((n) => (pos.has(n) ? n : finalOf(n))).filter(Boolean);
      const mark = (x) => { s.add(x); if (x.sym === undefined) { mark(x.l); mark(x.r); } };
      for (const n of done) mark(n);
      return s;
    }
    function paintCounts() {
      const mx = counts.length ? counts[0][1] : 1;
      countsBox.replaceChildren(...counts.map(([sym, w2]) => el('span', { class: 'pl-cnt', title: showSym(sym) + ': ' + w2 },
        el('i', { class: 'pl-symbg', style: '--h:' + hue.get(sym) + '; height:' + (4 + 46 * w2 / mx).toFixed(1) + 'px' }), el('b', { class: 'pl-sym', style: '--h:' + hue.get(sym) }, showSym(sym)), el('span', {}, String(w2)))));
    }
    function paintQueue() {
      if (phase !== 'build') { queue.replaceChildren(); return; }
      const lowIds = new Set(lo.map((n) => n.id));
      queue.replaceChildren(el('span', {}, 'Waiting to be joined, lightest first:'), ...forest.slice(0, 24).map((n) => el('span', { class: 'pl-q' + (lowIds.has(n.id) ? ' pl-lo' : '') }, n.sym !== undefined ? el('span', { class: 'pl-sym', style: '--h:' + hue.get(n.sym) }, showSym(n.sym)) : '•', ' ' + n.w)), forest.length > 24 ? ' …' : null);
    }
    let bitsBox = null, outBox = null;
    function paintResult() {
      result.replaceChildren();
      if (phase === 'build' || phase === 'start') return;
      const n = letters.length, k = counts.length, bits = encode(text, codes), fixed = Math.max(1, Math.ceil(Math.log2(Math.max(2, k)))), H = entropy(counts);
      const tb = el('table', { class: 'pl-codes' }, el('tr', {}, el('th', {}, 'letter'), el('th', {}, 'count'), el('th', {}, 'code'), el('th', {}, 'bits')));
      for (const [sym, w2] of counts) tb.append(el('tr', {}, el('td', { class: 'pl-sym', style: '--h:' + hue.get(sym) }, showSym(sym)), el('td', { class: 'pl-n' }, String(w2)), el('td', {}, codes.get(sym)), el('td', { class: 'pl-n' }, String(w2 * codes.get(sym).length))));
      const mx = 8 * n, box = (label, value, cls, sub) => el('div', { class: 'pl-size' + (cls ? ' ' + cls : '') }, el('b', {}, value), el('span', {}, label), sub ? el('span', {}, ' ' + sub) : null, el('i', { style: 'width:' + (100 * parseFloat(String(value).replace(/,/g, '')) / mx).toFixed(1) + '%' }));
      const per = bits.length / n, win = per < 5;
      bitsBox = el('div', { class: 'pl-bits', 'aria-label': 'The text in bits' }); outBox = el('div', { class: 'pl-out', 'aria-live': 'off' });
      result.append(el('h3', { class: 'pl-h3' }, 'The codes'), el('div', { style: 'overflow-x: auto' }, tb),
        el('h3', { class: 'pl-h3' }, 'The text in bits, each letter’s code in its colour'), bitsBox,
        el('div', { class: 'pl-sizes' },
          box('bits in 8-bit ASCII', fmt(8 * n), '', '(8 a letter)'),
          box('bits with a fixed-length code', fmt(fixed * n), '', '(' + fixed + ' a letter for ' + k + ' different)'),
          box('bits with Huffman’s code', fmt(bits.length), 'pl-hu', '(' + per.toFixed(2) + ' a letter)'),
          box('bits: Shannon’s limit', (H * n).toFixed(1), '', '(' + H.toFixed(2) + ' a letter)')),
        el('p', { class: 'pl-msg' }, 'Huffman uses ' + per.toFixed(2) + ' bits a letter: ' + (win ? 'fewer' : 'not fewer') + ' than 5. ', bet.value ? (bet.value === (win ? 'y' : 'n') ? el('span', { class: 'pl-good' }, 'Your bet won!') : 'Your bet lost.') : '',
          ' That is ' + pct(1 - bits.length / (8 * n)) + ' smaller than ASCII, and within ' + (per - H).toFixed(2) + ' bits a letter of the limit no code can beat.'),
        el('h3', { class: 'pl-h3' }, 'Decoded, by walking the tree'), outBox);
      paintBits(); paintOut();
    }
    function paintBits() {
      if (!bitsBox) return;
      const spans = []; const lim = 400;
      letters.slice(0, lim).forEach((ch, i) => spans.push(el('span', { class: 'pl-sym' + (cur === i ? ' pl-now' : cur !== null && i < cur ? ' pl-done' : ''), style: '--h:' + hue.get(ch), title: showSym(ch) }, codes.get(ch))));
      bitsBox.replaceChildren(...spans);
      const now = bitsBox.querySelector('.pl-now'); if (now && bitsBox.scrollHeight > bitsBox.clientHeight) bitsBox.scrollTop = Math.max(0, now.offsetTop - bitsBox.offsetTop - 40);
    }
    function paintOut() { if (outBox) outBox.textContent = decoded; }
    function draw(ctx, w, h, c) {
      ctx.fillStyle = c.paper; ctx.fillRect(0, 0, w, h);
      if (!root) return;
      const show = shown(), dark = isDark(c), pad = 26, top = 30, bottom = h - 40, lh = maxH ? Math.min(60, (bottom - top) / maxH) : 0;
      const nl = leavesOf(root).length, cell = (w - 2 * pad) / nl, P = (n) => { const p = pos.get(n); return [pad + p.x * (w - 2 * pad), bottom - p.h * lh]; };
      const r = Math.max(6, Math.min(14, cell * 0.42)), font = Math.max(9, Math.min(14, cell * 0.55));
      const lows = new Set(lo.map((n) => (pos.has(n) ? n : finalOf(n))).filter(Boolean));
      // edges, with 0 and 1
      for (const n of show) if (n.sym === undefined && show.has(n.l)) {
        const [x, y] = P(n);
        for (const [kid, bit] of [[n.l, '0'], [n.r, '1']]) {
          const [kx, ky] = P(kid), on = pathSet.has(n) && pathSet.has(kid);
          ctx.strokeStyle = on ? c.accent : c.ink3; ctx.lineWidth = on ? 3.5 : 1.3;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(kx, ky); ctx.stroke();
          if (lh > 16 && phase !== 'build' || on) { ctx.fillStyle = on ? c.accent : c.ink2; ctx.font = '600 ' + Math.min(12, font) + 'px ' + (c.mono || 'monospace'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(bit, (x + kx) / 2 + (bit === '0' ? -7 : 7), (y + ky) / 2 - 3); }
        }
      }
      // nodes
      for (const n of show) {
        const [x, y] = P(n), on = pathSet.has(n), low = lows.has(n);
        if (n.sym !== undefined) {
          const hh = hue.get(n.sym);
          ctx.fillStyle = 'hsl(' + hh + ', 65%, ' + (dark ? 32 : 92) + '%)'; ctx.strokeStyle = 'hsl(' + hh + ', 65%, ' + (dark ? 65 : 40) + '%)';
          ctx.lineWidth = on || low ? 3 : 1.5;
          ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - r, y - r, 2 * r, 2 * r, 4) : ctx.rect(x - r, y - r, 2 * r, 2 * r); ctx.fill(); ctx.stroke();
          ctx.fillStyle = 'hsl(' + hh + ', 70%, ' + (dark ? 75 : 30) + '%)'; ctx.font = '600 ' + font + 'px ' + (c.mono || 'monospace'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(showSym(n.sym), x, y + 1);
          ctx.fillStyle = c.ink3; ctx.font = Math.max(9, font - 3) + 'px ' + (c.sans || 'sans-serif'); ctx.textBaseline = 'top'; ctx.fillText(String(n.w), x, y + r + 3);
          if (phase !== 'build' && cell > 40) { ctx.fillStyle = c.ink2; ctx.font = Math.max(9, font - 3) + 'px ' + (c.mono || 'monospace'); ctx.fillText(codes.get(n.sym), x, y + r + 15); }
        } else {
          ctx.beginPath(); ctx.arc(x, y, r * 0.95, 0, 2 * Math.PI);
          ctx.fillStyle = on ? c.accent : c.paper2; ctx.fill(); ctx.strokeStyle = low ? c.fig : on ? c.accent : c.ink3; ctx.lineWidth = low ? 3 : 1.5; ctx.stroke();
          ctx.fillStyle = on ? c.paper : c.ink; ctx.font = '600 ' + Math.max(9, font - 2) + 'px ' + (c.sans || 'sans-serif'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(n.w), x, y + 0.5);
        }
        if (low) { ctx.strokeStyle = c.fig; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(x, y, r + 6, 0, 2 * Math.PI); ctx.stroke(); ctx.setLineDash([]); }
      }
      ctx.fillStyle = c.ink3; ctx.font = '12px ' + (c.sans || 'sans-serif'); ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(phase === 'build' ? 'Building: ' + forest.length + ' tree' + (forest.length === 1 ? '' : 's') + ' left' : 'Left is 0, right is 1', 8, 6);
    }
    prepare(); later();
    return () => { pl.stop(); cv.stop(); later.cancel(); };
  }

  // =====================================================================================================================
  // Registration
  // =====================================================================================================================
  A.register({
    id: 'reversi', group: 'Games and adversarial search', title: 'Reversi against Monte Carlo tree search',
    blurb: 'Play Reversi against a computer that knows only the rules. It plays thousands of random games from the position and keeps the move that wins most often; watch the win rates grow on the board as it thinks.',
    mount: mountReversi,
    about: `<h2>The game</h2>
<p>Reversi was sold in London in the 1880s (Lewis Waterman published its rules in 1883). Othello, the same game with a fixed start of four discs in the middle, was patented by Goro Hasegawa in Japan in 1971 and went on sale there in 1973. A move must trap a straight line of the opponent's discs between the new disc and one of yours, in any of the eight directions, and every trapped disc flips. If you cannot move, you pass; when neither player can, the one with more discs wins. In 1997 the program Logistello beat the world champion, Takeshi Murakami, six games to none, and in 2023 Hiroki Takizawa announced a computer proof that with perfect play on both sides the game is a draw.</p>
<h2>Search without knowing what is good</h2>
<p>The Connect Four demo scores positions with an <em>evaluation function</em>, a rule of thumb written by a person. Monte Carlo tree search needs none. To judge a move, it plays the game to the end many times with random moves, and counts how often it wins. A random game is a poor player, but the average of thousands of them says a lot: a move that leaves the opponent many ways to win will lose more of its random games. The only knowledge it needs is the rules and who won at the end.</p>
<p>The search is cleverer than trying each move equally often. It grows a tree of the positions it has visited and, at each step down, chooses the move with the highest score <em>win rate + c × √(ln N / n)</em>, where <em>n</em> is how many games began with that move and <em>N</em> how many began here. The first part favours moves that have done well; the second, a bonus that shrinks as a move is tried, makes sure no move is written off on a few unlucky games. This rule, UCT, came from Levente Kocsis and Csaba Szepesvári in 2006, borrowed from the mathematics of choosing between slot machines (the "multi-armed bandit"); the same year Rémi Coulom named the method Monte Carlo tree search and used it in his Go program Crazy Stone. Each round of the search has four steps: <strong>select</strong> down the tree by that rule, <strong>expand</strong> one new move, <strong>simulate</strong> a random game to the end, and <strong>back up</strong> the result along the path. In the end the computer plays the move it tried most often.</p>
<h2>Cost, and AlphaGo</h2>
<p>Each random game here takes a few hundredths of a millisecond, so a few thousand a move take a fraction of a second, and more random games make a stronger player. Because MCTS needs no evaluation function, it transformed computer Go, a game where nobody could write a good one. In March 2016 DeepMind's AlphaGo beat Lee Sedol, one of the world's best players, four games to one. It used Monte Carlo tree search, but guided by two neural networks trained on human games and on games against itself: one suggested which moves to search, the other judged positions, together with fast simulated games. Its successors AlphaGo Zero (2017) and AlphaZero dropped the random games and learned everything by playing themselves.</p>
<p>The greedy player in the match takes the most discs every move. In Reversi that is a weak strategy, because discs flip back and forth until the end; corners, which can never be flipped, matter far more. MCTS was never told that: it finds it out from its random games.</p>`,
    taught: [{ href: '#/python/12', text: 'SC 101 Lesson 12: Randomness and simulation' }, { href: '#/cpp/11', text: 'SC 103 Lesson 11: Randomness and simulation' }]
  });
  A.register({
    id: 'genetic', group: 'More to explore', title: 'A genetic algorithm',
    blurb: 'Breed a population: the fittest have children, children mix their parents and mutate. Watch random letters become METHINKS IT IS LIKE A WEASEL, bet on how long it takes, then evolve shapes that roll down a hill with no answer given.',
    mount: mountGenetic,
    about: `<h2>The weasel</h2>
<p>In <em>The Blind Watchmaker</em> (1986), the biologist Richard Dawkins asked how long a monkey at a typewriter would take to type a line from Hamlet, METHINKS IT IS LIKE A WEASEL: 28 characters from 27 (the letters and the space). Typed at random, a whole line is right with a chance of 1 in 27<sup>28</sup>, about 1 in 10<sup>40</sup>: never, in practice. Then he wrote a program that keeps the best attempt and makes mutated copies of it, again and again. It reached the phrase in 43 generations in his first run, 64 in the second and 41 in the third. The difference is <em>cumulative selection</em>: each small improvement is kept, and the next one builds on it.</p>
<p>Be honest about what this shows. The weasel program knows its target and measures every phrase against it. Real evolution has no target: nothing is aiming for a weasel, or for anything. Dawkins said so himself; the program only shows how much faster selection that keeps small gains is than pure chance.</p>
<h2>A genetic algorithm</h2>
<p>John Holland's book <em>Adaptation in Natural and Artificial Systems</em> (1975) made this a general way of searching. Keep a <strong>population</strong> of candidate answers, each written as a string of genes. Score each one with a <strong>fitness</strong> function. Choose parents with a bias toward the fit (here by a <em>tournament</em>: pick three at random, take the best). Make each child by <strong>crossover</strong>, the left part from one parent and the right part from the other, then <strong>mutate</strong> a few genes at random. Repeat. Try the sliders: with a mutation rate of 20% or more, each child has so many changes that whatever selection finds is wrecked again, and the best never settles; with a tiny rate, the population waits a long time for each new letter. A bigger population finds the target in fewer generations, but each generation costs more.</p>
<h2>Rolling shapes</h2>
<p>In the second experiment nobody knows the answer, the program included. Each shape is a body with 16 spokes; its genes are the spoke lengths, and its fitness is how far it rolls down a hilly track in a small physics simulation (gravity, bounces and friction, 120 steps a second). Spiky shapes tip over and stop. Within a few generations most of the population rolls, and once some reach the finish, a bonus for finishing sooner keeps favouring the faster ones. The shapes it finds are seldom perfect circles: selection only asks for good enough, and it gets there by trying, not by being told. Genetic algorithms are used like this for problems with no formula for the best answer: in 2006 NASA's ST5 spacecraft flew radio antennas whose odd, bent shapes were evolved by a genetic algorithm.</p>
<p>The cost is many evaluations: a generation of <em>n</em> candidates costs <em>n</em> fitness tests, and there is no promise of the best answer, only of better and better ones.</p>`,
    taught: [{ href: '#/ml/6', text: 'SC 109 Lesson 6: Walking downhill' }, { href: '#/python/12', text: 'SC 101 Lesson 12: Randomness and simulation' }]
  });
  A.register({
    id: 'huffman', group: 'More to explore', title: 'Huffman coding',
    blurb: 'Common letters get short codes, rare ones long codes. Type a text, watch the two lightest nodes join again and again into a tree, read off the codes, count the bits saved, and decode by walking the tree.',
    mount: mountHuffman,
    about: `<h2>A term paper</h2>
<p>In 1951 David Huffman was a graduate student at MIT in Robert Fano's class on information theory. Fano gave the students a choice: a final exam, or a term paper on finding the most efficient binary code. Huffman, about to give up and study for the exam, hit on the method, and found that it beat the one Fano and Claude Shannon had been using. He published it in 1952 as "A Method for the Construction of Minimum-Redundancy Codes".</p>
<h2>The method</h2>
<p>Count how often each character appears. Each character starts as a tree of one node, weighed by its count. Then repeat: take the two lightest trees, and join them under a new node whose weight is their sum. When one tree is left, every character is a leaf, and its code is the path from the top: 0 for left, 1 for right. Frequent characters are joined last, so they end up near the top with short codes; rare ones end up deep, with long codes.</p>
<p>No code is the beginning of another one, because each character is a leaf, not a stop on the way to another leaf: such a code is called <em>prefix-free</em>. So the bits can be decoded without anything between the letters: start at the top, follow the bits, write the character when you reach a leaf, and go back to the top. Huffman proved that no prefix-free code that gives each character its own code uses fewer bits for these counts.</p>
<h2>Cost, and the limit</h2>
<p>Finding the two lightest trees is a job for a priority queue (a heap), so building the tree for <em>k</em> different characters costs about <em>k</em> log <em>k</em> steps. Claude Shannon showed in 1948 that no code can average fewer bits per character than the <em>entropy</em>, −Σ <em>p</em> log<sub>2</sub> <em>p</em> over the characters' frequencies <em>p</em>; Huffman's code is always within one bit a character of that limit. Huffman coding is still inside things you use every day: ZIP files, gzip and PNG images (whose DEFLATE format uses it after another step that finds repeated phrases), JPEG photos and MP3 music.</p>`,
    taught: [{ href: '#/computer/6', text: 'SC 099 Lesson 6: Everything is numbers' }, { href: '#/dsa/12', text: 'SC 107 Lesson 12: Heaps and priority queues' }]
  });

  // =====================================================================================================================
  // Tests (node: test_algos.js)
  // =====================================================================================================================
  function selfTest() {
    const fails = [];
    const check = (ok, m) => { if (!ok) fails.push(m); };
    const names = (xs) => xs.map(sqName).sort().join(' ');
    // --- Reversi: the opening, a known position's flips, passes, and random games
    const b = rvNew();
    check(names(rvMoves(b, 1)) === 'c4 d3 e6 f5', 'reversi: Black’s opening moves are ' + names(rvMoves(b, 1)));
    check(names(rvMoves(b, 2)) === 'c5 d6 e3 f4', 'reversi: White’s replies to the empty opening are ' + names(rvMoves(b, 2)));
    check(rvCount(b).join() === '2,2', 'reversi: the start has 2 discs each');
    check(names(rvFlips(b, sqAt('d3'), 1)) === 'd4' && rvFlips(b, sqAt('a1'), 1).length === 0 && rvFlips(b, sqAt('d4'), 1).length === 0, 'reversi: d3 should flip d4 only; a1 and an occupied square nothing');
    {
      // a position where one move flips in three directions: Black at a1, a8 and h1 is not needed; build by hand
      const p = rvNew(); for (const s of SQUARES) p[s] = 0;
      for (const s of ['c3', 'd3', 'e3', 'c4', 'e4', 'c5', 'd5', 'e5']) p[sqAt(s)] = 2;
      for (const s of ['b2', 'd2', 'f2', 'b4', 'f4', 'b6', 'd6', 'f6']) p[sqAt(s)] = 1;
      // d4 is empty and surrounded by white, with black one beyond in all eight directions: all eight white discs flip
      check(names(rvFlips(p, sqAt('d4'), 1)) === 'c3 c4 c5 d3 d5 e3 e4 e5', 'reversi: d4 should flip all eight neighbours, got ' + names(rvFlips(p, sqAt('d4'), 1)));
      p[sqAt('f6')] = 0;   // without the black disc beyond e5, the diagonal no longer flips
      check(names(rvFlips(p, sqAt('d4'), 1)) === 'c3 c4 c5 d3 d5 e3 e4', 'reversi: an open-ended ray flipped');
      // no wrap-around: a row ending at the edge flips nothing
      const q = rvNew(); for (const s of SQUARES) q[s] = 0; q[sqAt('h3')] = 2; q[sqAt('a4')] = 1;
      check(!rvLegalAt(q, sqAt('g3'), 1), 'reversi: a ray wrapped around the edge of the board');
      // a pass: White has no move, Black has
      const r = rvNew(); for (const s of SQUARES) r[s] = 0; r[sqAt('a1')] = 1; r[sqAt('b1')] = 2; r[sqAt('d1')] = 1;
      check(rvMoves(r, 2).length === 0 && rvMoves(r, 1).join() === String(sqAt('c1')), 'reversi: pass position moves');
      check(rvNext(r, 1) === 1, 'reversi: after Black moves and White cannot, Black should move again');
      rvPlay(r, sqAt('c1'), 1); check(rvNext(r, 1) === 0 && rvWinner(r) === 1, 'reversi: a board with only black discs should be over, won by Black');
    }
    // the move generator agrees with the flip finder everywhere in random games, and a random game ends properly
    const rand = A.rng(42), empt = new Int16Array(64);
    for (let g = 0; g < 200; g++) {
      const x = rvNew(); let p = 1, plies = 0;
      while (p && plies < 100) {
        for (const s of SQUARES) if (rvLegalAt(x, s, p) !== (rvFlips(x, s, p).length > 0)) { fails.push('reversi: legality and flips disagree at ' + sqName(s)); break; }
        const ms = rvMoves(x, p); if (!ms.length) { p = rvMoves(x, 3 - p).length ? 3 - p : 0; continue; }
        const before = rvCount(x), s = ms[rand.int(ms.length)], f = rvPlay(x, s, p), after = rvCount(x);
        if (after[p - 1] !== before[p - 1] + f.length + 1 || after[2 - p] !== before[2 - p] - f.length) fails.push('reversi: disc counts wrong after a move');
        p = rvNext(x, p); plies++;
      }
      const [nb, nw] = rvCount(x);
      if (p !== 0 || nb + nw > 64 || rvMoves(x, 1).length || rvMoves(x, 2).length) fails.push('reversi: a random game did not end properly');
      if (rvWinner(x) !== (nb > nw ? 1 : nw > nb ? 2 : 0)) fails.push('reversi: wrong winner');
      const y = rvNew(), w = rvPlayout(y, 1, rand, empt), [yb, yw] = rvCount(y);
      if (yb + yw > 64 || rvMoves(y, 1).length || rvMoves(y, 2).length || w !== (yb > yw ? 1 : yw > yb ? 2 : 0)) fails.push('reversi: a playout did not end properly, or named the wrong winner');
    }
    // MCTS: its statistics add up, it leaves the board alone, and it beats random play in most of 20 seeded games
    {
      const t = mctsNew(b, 1, 5); mctsRun(t, 400); const st = mctsStats(t);
      check(st.playouts === 400 && st.kids.reduce((s, k) => s + k.visits, 0) === 400 && t.root.visits === 400, 'mcts: visits do not add up');
      check(names(st.kids.map((k) => k.move)) === 'c4 d3 e6 f5', 'mcts: the root’s moves are not the legal moves');
      check(rvCount(t.board).join() === '2,2' && b.every((v, i) => v === rvNew()[i]), 'mcts: the search changed the board');
      // a forced pass at the root
      const r = rvNew(); for (const s of SQUARES) r[s] = 0; r[sqAt('a1')] = 1; r[sqAt('b1')] = 2; r[sqAt('d1')] = 1;
      check(mctsMove(r, 2, 50, 1) === PASS && mctsMove(r, 1, 50, 1) === sqAt('c1'), 'mcts: the pass position');
      // a corner that wins at once: Black takes a1, which flips the whole diagonal and leaves White without discs
      const cw = rvNew(); for (const s of SQUARES) cw[s] = 0; for (const s of ['b2', 'c3', 'd4']) cw[sqAt(s)] = 2; cw[sqAt('e5')] = 1; cw[sqAt('h8')] = 1; cw[sqAt('g8')] = 2;
      check(mctsMove(cw, 1, 300, 3) === sqAt('a1'), 'mcts: missed the move that wins the game at once');
    }
    let wins = 0;
    for (let g = 0; g < 20; g++) {
      const rr = A.rng(900 + g), mc = (bd, p) => mctsMove(bd, p, 200, 77 + g * 1000 + rr.int(1000)), op = (bd, p) => randomMove(bd, p, rr);
      const res = g % 2 ? rvGame(op, mc) : rvGame(mc, op);
      if (res.winner === (g % 2 ? 2 : 1)) wins++;
      if (res.discs[0] + res.discs[1] > 64) fails.push('reversi: more than 64 discs');
    }
    check(wins >= 16, 'mcts: with 200 random games a move it beat random play in only ' + wins + ' of 20 games');
    { const rr = A.rng(3), res = rvGame((bd, p) => greedyMove(bd, p, rr), (bd, p) => greedyMove(bd, p, rr)); check(res.moves.length >= 30, 'greedy: a game of greedy against greedy ended too soon'); }
    check(greedyMove(b, 1, A.rng(1)) !== PASS && rvFlips(b, greedyMove(b, 1, A.rng(1)), 1).length === 1, 'greedy: an opening move');

    // --- the weasel
    check(cleanTarget('methinks it is like a weasel').target === WEASEL, 'weasel: lower case should be accepted');
    check(cleanTarget('  two   words ').target === 'TWO WORDS', 'weasel: spaces should be tidied');
    check(!!cleanTarget('').error && !!cleanTarget('héllo').error && !!cleanTarget('a1').error && !!cleanTarget('<b>').error && !!cleanTarget('X'.repeat(41)).error && !!cleanTarget(null).error, 'weasel: a bad target was accepted');
    check(cleanTarget('X'.repeat(40)).target.length === 40, 'weasel: 40 letters should be accepted');
    check(fitnessOf('METHINKS', 'METHINKX') === 7, 'weasel: fitness');
    for (const method of ['ga', 'dawkins']) for (const seed of [1, 2, 3]) {
      const w = weaselNew(WEASEL, 100, 0.04, method, seed);
      while (!w.done && w.gen < 1500) weaselStep(w);
      check(w.done && w.pop[0].s === WEASEL, 'weasel (' + method + ', seed ' + seed + '): not found in 1,500 generations');
      check(w.history.length === w.gen + 1 && w.pop.every((x, i) => i === 0 || x.f <= w.pop[i - 1].f), 'weasel: history or order wrong');
      check(w.pop.every((x) => x.s.length === WEASEL.length && /^[A-Z ]+$/.test(x.s)), 'weasel: a phrase has the wrong letters or length');
    }
    { const w = weaselNew('AB', 20, 0.2, 'ga', 9); while (!w.done && w.gen < 2000) weaselStep(w); check(w.done, 'weasel: a two-letter target was not found'); }
    { const w = weaselNew('Q', 5, 0.05, 'ga', 9); while (!w.done && w.gen < 2000) weaselStep(w); check(w.done && w.pop.every((x) => x.cut === -1), 'weasel: a one-letter target'); }
    { const w = weaselNew(WEASEL, 100, 0.3, 'ga', 4); for (let k = 0; k < 300; k++) weaselStep(w); check(!w.done, 'weasel: a 30% mutation rate should not settle on the phrase in 300 generations'); }

    // --- rolling shapes: the body's geometry, the physics settles, and evolution improves
    {
      const circle = shapeBody(new Array(K).fill(0.5)), A16 = K / 2 * 0.25 * Math.sin(2 * Math.PI / K);
      check(Math.abs(circle.mass - A16) < 1e-9, 'shapes: the area of a regular polygon');
      const cx = circle.verts.reduce((s, v) => s + v[0], 0) / K, cy = circle.verts.reduce((s, v) => s + v[1], 0) / K;
      check(Math.abs(cx) < 1e-9 && Math.abs(cy) < 1e-9 && circle.inertia > 0, 'shapes: the centre of mass of a regular polygon');
      const lop = shapeBody(new Array(K).fill(0.2).map((r, i) => (i < 3 ? 0.7 : r)));
      check(lop.inertia > 0 && lop.mass > 0 && lop.verts.length === K, 'shapes: a lopsided body');
      const hs = makeTrack(7), round = rollerRun(new Array(K).fill(0.4), hs), spiky = rollerRun(new Array(K).fill(0).map((_, i) => (i % 2 ? 0.15 : 0.75)), hs);
      check(round > spiky, 'shapes: a round shape should roll further than a star (' + round.toFixed(1) + ' vs ' + spiky.toFixed(1) + ')');
      check(round === rollerRun(new Array(K).fill(0.4), hs), 'shapes: the simulation is not repeatable');
      const o = rollerNew(new Array(K).fill(0.4), hs); let deepest = 0;
      while (!o.stopped) { rollerStep(o, hs); for (const [lx, ly] of o.body.verts) { const px = o.x + lx * Math.cos(o.a) - ly * Math.sin(o.a), py = o.y + lx * Math.sin(o.a) + ly * Math.cos(o.a); deepest = Math.max(deepest, trackY(hs, px) - py); } }
      check(deepest < 0.25 && o.t <= 30 + 1e-9, 'shapes: a shape sank ' + deepest.toFixed(2) + ' m into the ground');
      let improved = 0, report = [];
      for (const seed of [31, 32, 33]) {   // evolution is chancy: two runs of three must improve a lot in 30 generations
        const r = A.rng(seed); let pop = Array.from({ length: 20 }, () => ({ genes: randomGenes(r) })), first = 0, best = 0;
        for (let g = 0; g < 30; g++) {
          const sc = pop.map((p) => ({ genes: p.genes, hue: p.hue, f: rollerRun(p.genes, hs) })), top = Math.max(...sc.map((x) => x.f));
          if (g === 0) first = top;
          check(top >= best - 1e-9, 'shapes: the best fell from one generation to the next (the best two are kept)');
          best = top; pop = shapesBreed(sc, 0.08, r);
          check(pop.length === 20 && pop.every((p) => p.genes.length === K && p.genes.every((v) => v >= 0.15 - 1e-12 && v <= 0.75 + 1e-12)), 'shapes: a child has bad genes');
          if (best > first + 50) break;   // enough: the rest of the run would only cost time
        }
        if (best > first + 50) improved++;
        if (improved >= 2) break;
        report.push(first.toFixed(0) + ' to ' + best.toFixed(0));
      }
      check(improved >= 2, 'shapes: 30 generations improved the best only from ' + report.join(', '));
    }

    // --- Huffman: prefix-free, decodes, optimal (against a brute force over code lengths on small alphabets)
    const texts = ['she sells sea shells by the sea shore', 'abracadabra', 'aaaa', 'a', 'ab', 'mississippi river', 'the quick brown fox jumps over the lazy dog', 'zzzzzzzzzzyx', '😀😀🙂 émigré', 'aabbccddeeffgghh', '\n\t <tag> & "quotes"'];
    const brute = (ws) => {   // the fewest bits of any prefix-free code: every vector of lengths that satisfies Kraft's inequality
      const k = ws.length; if (k === 1) return ws[0];
      let best = Infinity; const ls = new Array(k).fill(1);
      const rec = (i, kraft) => {
        if (kraft > 1 + 1e-12) return;
        if (i === k) { const tot = ws.reduce((s, w, j) => s + w * ls[j], 0); if (tot < best) best = tot; return; }
        for (let l = 1; l < k; l++) { ls[i] = l; rec(i + 1, kraft + Math.pow(2, -l)); }
      };
      rec(0, 0); return best;
    };
    for (const t of texts) {
      const counts = countSymbols(t), root = huffmanTree(counts), codes = huffmanCodes(root), bits = encode(t, codes);
      check(decode(bits, root) === t, 'huffman: "' + t + '" did not decode to itself');
      check(codes.size === counts.length, 'huffman: not every symbol has a code in "' + t + '"');
      const cs = [...codes.values()];
      check(cs.every((a, i) => cs.every((c, j) => i === j || !c.startsWith(a))), 'huffman: a code is the prefix of another in "' + t + '"');
      check(/^[01]*$/.test(bits) && bits.length >= entropy(counts) * Array.from(t).length - 1e-9, 'huffman: beat the entropy bound in "' + t + '"');
      const n = Array.from(t).length;
      if (counts.length > 1) check(bits.length < (entropy(counts) + 1) * n + 1e-9, 'huffman: more than one bit a letter above the entropy in "' + t + '"');
      if (counts.length <= 6) check(bits.length === brute(counts.map((c) => c[1])), 'huffman: "' + t + '" took ' + bits.length + ' bits, the best is ' + brute(counts.map((c) => c[1])));
    }
    // random small alphabets against the brute force
    const hr = A.rng(77);
    for (let k = 0; k < 150; k++) {
      const m = 2 + hr.int(5), ws = Array.from({ length: m }, () => 1 + hr.int(20));
      const counts = ws.map((w, i) => [String.fromCharCode(97 + i), w]), codes = huffmanCodes(huffmanTree(counts));
      const tot = counts.reduce((s, [c, w]) => s + w * codes.get(c).length, 0);
      if (tot !== brute(ws)) { fails.push('huffman: weights ' + ws + ' cost ' + tot + ', the best is ' + brute(ws)); break; }
    }
    // a textbook case: counts 45 13 12 16 9 5 (Cormen et al.) cost 224 bits
    { const counts = [['a', 45], ['b', 13], ['c', 12], ['d', 16], ['e', 9], ['f', 5]], codes = huffmanCodes(huffmanTree(counts)); check(counts.reduce((s, [c, w]) => s + w * codes.get(c).length, 0) === 224, 'huffman: the textbook example should cost 224 bits'); }
    // the steps: one merge at a time, lightest first, k - 1 merges
    { const counts = countSymbols('abracadabra'), g = huffmanSteps(counts); let r = g.next(), merges = 0; check(r.value.forest.length === 5, 'huffman: the first step should be the five leaves');
      for (;;) { const before = r.value.forest; r = g.next(); if (r.done) break; merges++; const m = r.value.merged; check(m.l === before[0] && m.r === before[1], 'huffman: did not join the two lightest'); }
      check(merges === 4 && r.value.w === 11, 'huffman: abracadabra should take 4 merges to one tree of weight 11'); }
    check(huffmanTree([]) === null && huffmanCodes(null).size === 0 && decode('', null) === '', 'huffman: the empty text');
    check(Math.abs(entropy([['a', 1], ['b', 1]]) - 1) < 1e-12 && entropy([['a', 5]]) === 0, 'huffman: entropy');
    return fails;
  }
  if (typeof module !== 'undefined') module.exports = Object.assign({ selfTest }, PURE);
})();
