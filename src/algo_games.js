/* Algorithms in motion: games and adversarial search. Four demos:
   - minimax-tree: a small game tree evaluated by minimax, then by alpha-beta, step by step, with the effect of move ordering;
   - tic-tac-toe: play a perfect opponent (minimax with alpha-beta) and see the score of every square;
   - connect-four: play a depth-limited alpha-beta search with an evaluation function and iterative deepening, run in slices so the
     page never freezes;
   - nim: a game solved by a formula (the XOR rule), with no search at all.
   The game logic and the searches at the top of this file are pure (no DOM): test_algos.js runs selfTest() in node. */
(function () {
  const A = (typeof window !== 'undefined' && window.ALGOS) || require('./algos.js');
  const GROUP = 'Games and adversarial search';
  const INF = Infinity;

  // =====================================================================================================================
  // Game trees: minimax and alpha-beta on a tree of numbers. A node is { value } (a leaf) or { children: [nodes] }.
  // The root is a MAX node; levels alternate MAX, MIN, MAX...
  // =====================================================================================================================

  /** A random tree. shape: an array of branching factors, one per level (e.g. [3, 3, 3]), or 'mixed' (depth 3, 2 or 3 moves at
      each node). Leaf values are whole numbers 0..9. */
  function makeTree(rand, shape) {
    const levels = shape === 'mixed' ? [0, 0, 0] : shape;
    const build = (d) => {
      if (d === levels.length) return { value: rand.int(10) };
      const b = shape === 'mixed' ? 2 + rand.int(2) : levels[d];
      const children = [];
      for (let i = 0; i < b; i++) children.push(build(d + 1));
      return { children };
    };
    return build(0);
  }
  const isLeaf = (n) => !n.children;
  function leavesOf(t) { const out = []; const walk = (n) => { if (isLeaf(n)) out.push(n); else n.children.forEach(walk); }; walk(t); return out; }
  function depthOf(t) { let d = 0; for (let n = t; !isLeaf(n); n = n.children[0]) d++; return d; }
  function cloneTree(n) { return isLeaf(n) ? { value: n.value } : { children: n.children.map(cloneTree) }; }

  /** Plain minimax. stats.leaves counts the leaves looked at. */
  function minimax(n, isMax, stats) {
    if (isLeaf(n)) { if (stats) stats.leaves++; return n.value; }
    let v = isMax ? -INF : INF;
    for (const c of n.children) { const x = minimax(c, !isMax, stats); v = isMax ? Math.max(v, x) : Math.min(v, x); }
    return v;
  }
  /** Alpha-beta (the textbook form): alpha is the most MAX can already guarantee on the way to this node, beta the least MIN can.
      A node stops looking at its children as soon as alpha >= beta. Returns the minimax value when called with (-inf, +inf). */
  function alphabeta(n, isMax, alpha, beta, stats) {
    if (isLeaf(n)) { if (stats) stats.leaves++; return n.value; }
    let v = isMax ? -INF : INF;
    for (const c of n.children) {
      const x = alphabeta(c, !isMax, alpha, beta, stats);
      if (isMax) { v = Math.max(v, x); alpha = Math.max(alpha, v); } else { v = Math.min(v, x); beta = Math.min(beta, v); }
      if (alpha >= beta) break;
    }
    return v;
  }
  /** The same tree with the children of every node sorted: best: the mover's best child first (the order alpha-beta loves);
      otherwise the worst first. */
  function orderTree(n, isMax, best) {
    if (isLeaf(n)) return { value: n.value };
    const kids = n.children.map((c) => ({ t: orderTree(c, !isMax, best), v: minimax(c, !isMax) }));
    const up = isMax === best;   // MAX wants big values first in the best order
    kids.sort((a, b) => (up ? b.v - a.v : a.v - b.v));
    return { children: kids.map((k) => k.t) };
  }
  /** Knuth and Moore's count of the leaves alpha-beta must examine with perfect ordering on a uniform tree. */
  const minimalLeaves = (b, d) => Math.pow(b, Math.ceil(d / 2)) + Math.pow(b, Math.floor(d / 2)) - 1;
  const leafCount = (t, ab) => { const s = { leaves: 0 }; if (ab) alphabeta(t, true, -INF, INF, s); else minimax(t, true, s); return s.leaves; };

  /** The animated search. st (a Map from node to its display state) is changed in place; each yield is one step to show:
      { focus, msg }. Returns the root's value. The logic is exactly alphabeta()/minimax() above (selfTest checks this). */
  function* treeSearch(root, prune, st, names) {
    const S = (n) => { let s = st.get(n); if (!s) { s = { state: 'idle' }; st.set(n, s); } return s; };
    st.leaves = 0;
    const fmt = (x) => (x === INF ? '+∞' : x === -INF ? '−∞' : String(x));
    function* visit(n, isMax, alpha, beta) {
      const s = S(n);
      s.state = 'active'; s.alpha = alpha; s.beta = beta;
      if (isLeaf(n)) {
        st.leaves++; s.value = n.value; s.state = 'done';
        yield { focus: n, msg: 'A leaf: its score is ' + n.value + '. Leaves looked at so far: ' + st.leaves + '.' };
        return n.value;
      }
      const who = isMax ? 'MAX' : 'MIN', nm = names.get(n);
      yield { focus: n, msg: nm + ' is a ' + who + ' node: it will take the ' + (isMax ? 'largest' : 'smallest') + ' value among its ' + n.children.length + ' children.' + (prune ? ' It starts with α = ' + fmt(alpha) + ', β = ' + fmt(beta) + '.' : '') };
      let v = isMax ? -INF : INF;
      for (let i = 0; i < n.children.length; i++) {
        const c = n.children[i];
        const x = yield* visit(c, !isMax, alpha, beta);
        const better = isMax ? x > v : x < v;
        if (better) { v = x; s.value = v; s.best = i; }
        let msg = nm + ' (' + who + ') gets ' + x + ' from child ' + (i + 1) + '. ' + (better ? (i ? 'Better for ' + who + ': ' : 'Best so far: ') + v + '.' : 'Not better than ' + v + '.');
        if (prune) {
          if (isMax) alpha = Math.max(alpha, v); else beta = Math.min(beta, v);
          s.alpha = alpha; s.beta = beta;
          msg += ' Now α = ' + fmt(alpha) + ', β = ' + fmt(beta) + '.';
        }
        yield { focus: n, msg };
        if (prune && alpha >= beta && i < n.children.length - 1) {
          const rest = n.children.length - 1 - i;
          s.cut = i; s.bound = isMax ? '≥' : '≤';
          const mark = (m) => { const t = S(m); t.state = 'pruned'; if (!isLeaf(m)) m.children.forEach(mark); };
          for (let j = i + 1; j < n.children.length; j++) mark(n.children[j]);
          yield { focus: n, cut: true, msg: isMax
            ? 'Prune! ' + nm + ' can already get ' + v + ' ≥ β = ' + fmt(beta) + '. The MIN node above has a move that holds MAX to ' + fmt(beta) + ', so it will never let the game reach ' + nm + '. The other ' + rest + ' ' + (rest === 1 ? 'child is' : 'children are') + ' skipped; ' + nm + ' is worth at least ' + v + ', and that is all we need to know.'
            : 'Prune! ' + nm + ' can hold MAX to ' + v + ' ≤ α = ' + fmt(alpha) + '. MAX already has a way to get ' + fmt(alpha) + ' elsewhere, so it will never choose ' + nm + '. The other ' + rest + ' ' + (rest === 1 ? 'child is' : 'children are') + ' skipped; ' + nm + ' is worth at most ' + v + '.' };
          break;
        }
      }
      s.state = 'done';
      return v;
    }
    return yield* visit(root, true, -INF, INF);
  }

  // =====================================================================================================================
  // Tic-tac-toe. A board is an array of 9 cells: 0 empty, 1 X, 2 O. X moves first. Scores are from the point of view of the
  // player to move: a win is worth 1 + the number of empty squares left when it happens (so a faster win scores higher),
  // a loss the negative of that, a draw 0.
  // =====================================================================================================================
  const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  function tttWinner(b) {
    for (const l of LINES) if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[0]] === b[l[2]]) return { p: b[l[0]], line: l };
    return null;
  }
  const empties = (b) => { let k = 0; for (let i = 0; i < 9; i++) if (!b[i]) k++; return k; };
  const tttDone = (b) => !!tttWinner(b) || empties(b) === 0;
  /** Plain minimax (negamax form): counts every position visited in stats.nodes. */
  function tttMinimax(b, p, stats) {
    if (stats) stats.nodes++;
    if (tttWinner(b)) return -(1 + empties(b));   // the previous player has just won
    let best = -INF, any = false;
    for (let i = 0; i < 9; i++) if (!b[i]) { any = true; b[i] = p; const v = -tttMinimax(b, 3 - p, stats); b[i] = 0; if (v > best) best = v; }
    return any ? best : 0;
  }
  function tttAlphaBeta(b, p, alpha, beta, stats) {
    if (stats) stats.nodes++;
    if (tttWinner(b)) return -(1 + empties(b));
    let best = -INF, any = false;
    for (let i = 0; i < 9; i++) if (!b[i]) {
      any = true; b[i] = p; const v = -tttAlphaBeta(b, 3 - p, -beta, -alpha, stats); b[i] = 0;
      if (v > best) best = v;
      if (best > alpha) alpha = best;
      if (alpha >= beta) break;
    }
    return any ? best : 0;
  }
  // exact values with a memo: tic-tac-toe has only 5,478 legal positions, so after the first call everything is instant
  const tttMemo = new Map();
  function tttValue(b, p) {
    const key = b.join('') + p;
    let v = tttMemo.get(key);
    if (v === undefined) { v = tttAlphaBeta(b.slice(), p, -INF, INF, null); tttMemo.set(key, v); }
    return v;
  }
  /** The score of every empty square for the player to move (null for filled squares). */
  function tttScores(b, p) {
    return b.map((c, i) => { if (c) return null; const x = b.slice(); x[i] = p; return tttWinner(x) ? 1 + empties(x) : -tttValue(x, 3 - p); });
  }
  /** The best moves (all squares with the highest score). */
  function tttBest(b, p) {
    const s = tttScores(b, p); let m = -INF; s.forEach((v) => { if (v !== null && v > m) m = v; });
    return s.map((v, i) => (v === m ? i : -1)).filter((i) => i >= 0);
  }
  const tttCountCache = new Map();
  /** How many positions plain minimax and alpha-beta visit to choose a move here (the root counts). */
  function tttCounts(b, p) {
    const key = b.join('') + p; let c = tttCountCache.get(key);
    if (!c) { const m = { nodes: 0 }, a = { nodes: 0 }; tttMinimax(b.slice(), p, m); tttAlphaBeta(b.slice(), p, -INF, INF, a); c = { minimax: m.nodes, alphabeta: a.nodes }; tttCountCache.set(key, c); }
    return c;
  }

  // =====================================================================================================================
  // Connect Four. 7 columns, 6 rows; cell index = row * 7 + column, row 0 at the bottom. A state is
  // { b: cells (0, 1, 2), h: height of each column, n: discs played, toMove }.
  // =====================================================================================================================
  const C4W = 7, C4H = 6, WIN = 1000000;
  function c4New() { return { b: new Array(C4W * C4H).fill(0), h: new Array(C4W).fill(0), n: 0, toMove: 1 }; }
  function c4Clone(s) { return { b: s.b.slice(), h: s.h.slice(), n: s.n, toMove: s.toMove }; }
  const c4Legal = (s) => { const out = []; for (let c = 0; c < C4W; c++) if (s.h[c] < C4H) out.push(c); return out; };
  /** Drops the mover's disc in column c; returns the cell index, or -1 if the column is full or does not exist. */
  function c4Play(s, c) {
    if (!(c >= 0 && c < C4W) || s.h[c] >= C4H) return -1;
    const i = s.h[c] * C4W + c; s.b[i] = s.toMove; s.h[c]++; s.n++; s.toMove = 3 - s.toMove; return i;
  }
  function c4Undo(s, c) { s.h[c]--; s.b[s.h[c] * C4W + c] = 0; s.n--; s.toMove = 3 - s.toMove; }
  /** Does the disc at cell i make four in a row? */
  function c4WinAt(b, i) {
    const p = b[i]; if (!p) return false;
    const r = Math.floor(i / C4W), c = i % C4W;
    for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
      let k = 1;
      for (let s = 1; s < 4; s++) { const rr = r + dr * s, cc = c + dc * s; if (rr < 0 || rr >= C4H || cc < 0 || cc >= C4W || b[rr * C4W + cc] !== p) break; k++; }
      for (let s = 1; s < 4; s++) { const rr = r - dr * s, cc = c - dc * s; if (rr < 0 || rr >= C4H || cc < 0 || cc >= C4W || b[rr * C4W + cc] !== p) break; k++; }
      if (k >= 4) return true;
    }
    return false;
  }
  // every window of four cells in a line: 24 horizontal, 21 vertical, 12 + 12 diagonal = 69
  const WINDOWS = [];
  for (let r = 0; r < C4H; r++) for (let c = 0; c < C4W; c++) for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    const er = r + 3 * dr, ec = c + 3 * dc;
    if (er >= 0 && er < C4H && ec >= 0 && ec < C4W) WINDOWS.push([0, 1, 2, 3].map((k) => (r + k * dr) * C4W + c + k * dc));
  }
  /** The four winning cells if someone has won, else null. */
  function c4WinLine(b) { for (const w of WINDOWS) { const p = b[w[0]]; if (p && b[w[1]] === p && b[w[2]] === p && b[w[3]] === p) return { p, line: w }; } return null; }
  /** The evaluation function: a guess at how good the position is for player p, used where the search stops.
      +3 for each of p's discs in the centre column; for each window of four that holds no enemy disc: +5 for three of p's, +2 for two;
      the same, negated, for the opponent. */
  function c4Evaluate(b, p) {
    let score = 0;
    for (let r = 0; r < C4H; r++) { const x = b[r * C4W + 3]; if (x === p) score += 3; else if (x) score -= 3; }
    for (const w of WINDOWS) {
      let mine = 0, theirs = 0;
      for (let k = 0; k < 4; k++) { const x = b[w[k]]; if (x === p) mine++; else if (x) theirs++; }
      if (!theirs) { if (mine === 3) score += 5; else if (mine === 2) score += 2; }
      else if (!mine) { if (theirs === 3) score -= 5; else if (theirs === 2) score -= 2; }
    }
    return score;
  }
  const CENTRE_FIRST = [3, 2, 4, 1, 5, 0, 6], LEFT_TO_RIGHT = [0, 1, 2, 3, 4, 5, 6];
  /** Depth-limited alpha-beta in negamax form, as a generator so it can be run a slice at a time: it yields every 512 positions.
      Scores are for the player to move. A win found ply moves from the root scores WIN - ply, so a quicker win is preferred. */
  function* c4Negamax(s, depth, alpha, beta, ply, ctx) {
    ctx.nodes++;
    if ((ctx.nodes & 511) === 0) yield;
    if (depth === 0) return c4Evaluate(s.b, s.toMove);
    let best = -INF;
    for (const c of ctx.order) {
      if (s.h[c] >= C4H) continue;
      const i = c4Play(s, c);
      let v;
      if (c4WinAt(s.b, i)) v = WIN - ply - 1;
      else if (s.n === C4W * C4H) v = 0;
      else v = -(yield* c4Negamax(s, depth - 1, -beta, -alpha, ply + 1, ctx));
      c4Undo(s, c);
      if (v > best) best = v;
      if (best > alpha) alpha = best;
      if (alpha >= beta) break;
    }
    return best;
  }
  /** One iteration at the root: every legal column, best first if a previous iteration said which. Returns { col, score, scores,
      depth }; scores[c] = { v, exact } (exact false: v is only an upper bound; alpha-beta proved the move is no better than v).
      With ctx.exactRoot every column is searched with a full window, so every score is exact (it costs a little more). */
  function* c4Root(s, depth, ctx, rootOrder) {
    let alpha = -INF, best = -INF, col = -1;
    const scores = new Array(C4W).fill(null);
    for (const c of rootOrder) {
      if (s.h[c] >= C4H) continue;
      const i = c4Play(s, c);
      let v;
      if (c4WinAt(s.b, i)) v = WIN - 1;
      else if (s.n === C4W * C4H) v = 0;
      else v = -(yield* c4Negamax(s, depth - 1, -INF, ctx.exactRoot ? INF : -alpha, 1, ctx));
      c4Undo(s, c);
      scores[c] = { v, exact: ctx.exactRoot || col < 0 || v > alpha };
      if (v > best) { best = v; col = c; }
      if (best > alpha) alpha = best;
    }
    return { col, score: best, scores, depth };
  }
  const c4Decided = (v) => Math.abs(v) >= WIN - 100;
  /** The next root order: the previous iteration's best move first, then the others in the usual order. */
  function c4NextOrder(prev, order) { if (!prev || prev.col < 0) return order.slice(); return [prev.col].concat(order.filter((c) => c !== prev.col)); }
  /** Iterative deepening run to the end, synchronously (for the tests): depth 1, 2, ... maxDepth. */
  function c4Search(state, maxDepth, opts) {
    const s = c4Clone(state), ctx = { nodes: 0, order: (opts && opts.order) || CENTRE_FIRST, exactRoot: !!(opts && opts.exactRoot) };
    let res = null;
    for (let d = 1; d <= maxDepth; d++) {
      const g = c4Root(s, d, ctx, c4NextOrder(res, ctx.order)); let r;
      do r = g.next(); while (!r.done);
      res = r.value;
      if (c4Decided(res.score) || d >= C4W * C4H - s.n) break;
    }
    res.nodes = ctx.nodes;
    return res;
  }
  /** Plain negamax without pruning, for the tests. */
  function c4Plain(s, depth, ply, stats) {
    stats.nodes++;
    if (depth === 0) return c4Evaluate(s.b, s.toMove);
    let best = -INF;
    for (const c of LEFT_TO_RIGHT) {
      if (s.h[c] >= C4H) continue;
      const i = c4Play(s, c); let v;
      if (c4WinAt(s.b, i)) v = WIN - ply - 1; else if (s.n === C4W * C4H) v = 0; else v = -c4Plain(s, depth - 1, ply + 1, stats);
      c4Undo(s, c);
      if (v > best) best = v;
    }
    return best;
  }

  // =====================================================================================================================
  // Nim: heaps of counters; a move takes any number (at least one) from one heap; whoever takes the last counter wins.
  // =====================================================================================================================
  const nimSum = (heaps) => heaps.reduce((x, h) => x ^ h, 0);
  /** Bouton's rule: make the nim-sum zero. If it already is zero, every move loses against perfect play: take one from the
      biggest heap and hope. Returns { heap, take }. */
  function nimMove(heaps) {
    const x = nimSum(heaps);
    if (x) for (let i = 0; i < heaps.length; i++) { const t = heaps[i] ^ x; if (t < heaps[i]) return { heap: i, take: heaps[i] - t }; }
    let big = 0; heaps.forEach((h, i) => { if (h > heaps[big]) big = i; });
    return { heap: big, take: 1 };
  }
  /** Brute force: can the player to move win? (for the tests) */
  function nimWinsBrute(heaps, memo) {
    const key = heaps.slice().sort((a, b) => a - b).join(','); if (memo.has(key)) return memo.get(key);
    let win = false;
    for (let i = 0; i < heaps.length && !win; i++) for (let t = 1; t <= heaps[i] && !win; t++) { const h = heaps.slice(); h[i] -= t; if (!nimWinsBrute(h, memo)) win = true; }
    memo.set(key, win); return win;
  }

  // =====================================================================================================================
  // Shared view helpers
  // =====================================================================================================================
  const CSS = `
.ag-bar { margin-top: 0; }
.ag-narr { font-family: var(--sans); font-size: 0.95rem; color: var(--ink); min-height: 3.2em; margin: 0.5rem 0; padding: 0.55rem 0.8rem; border-left: 3px solid var(--k-fig); background: var(--paper-2); border-radius: 0 4px 4px 0; }
.ag-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr)); gap: 0.5rem; margin: 0.7rem 0; font-family: var(--sans); }
.ag-stat { border: 1px solid var(--rule); border-radius: 4px; padding: 0.45rem 0.65rem; background: var(--paper); }
.ag-stat b { display: block; font-size: 1.35rem; font-weight: 600; color: var(--ink); font-variant-numeric: tabular-nums; }
.ag-stat span { font-size: 0.82rem; color: var(--ink-2); }
.ag-stat.ag-hi { border-color: var(--k-fig); }
.ag-field { display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem 0.6rem; font-family: var(--sans); font-size: 0.9rem; color: var(--ink-2); margin: 0.5rem 0; }
.ag-field input[type=text] { font-family: var(--mono); font-size: 0.9rem; color: var(--ink); background: var(--paper); border: 1px solid var(--rule); border-radius: 3px; padding: 0.3rem 0.45rem; flex: 1 1 12rem; min-width: 0; }
.ag-note { font-family: var(--sans); font-size: 0.85rem; color: var(--ink-3); }
.ag-swatch-max { background: var(--k-fig); clip-path: polygon(50% 0, 100% 100%, 0 100%); }
.ag-swatch-min { background: var(--k-quiz); clip-path: polygon(0 0, 100% 0, 50% 100%); }
.ag-wrap { display: flex; flex-wrap: wrap; gap: 1.2rem 1.6rem; align-items: flex-start; margin: 0.6rem 0; }
.ag-main { flex: 0 1 19rem; min-width: 0; }
.ag-side { flex: 1 1 15rem; min-width: 0; font-family: var(--sans); font-size: 0.92rem; color: var(--ink-2); }
.ag-side h3 { font-family: var(--sans); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-3); margin: 0 0 0.4rem; font-weight: 600; }
.ag-side p { margin: 0.3rem 0 0.7rem; }
.ag-msg { font-family: var(--sans); font-size: 1.05rem; color: var(--ink); margin: 0.4rem 0; min-height: 1.5em; }
.ag-ttt { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; width: min(300px, 100%); }
.ag-cell { aspect-ratio: 1; font-family: var(--sans); font-size: clamp(2rem, 9vw, 3rem); line-height: 1; border: 1px solid var(--rule); background: var(--paper); color: var(--ink); border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; padding: 0; min-width: 0; }
.ag-cell:hover:not([aria-disabled=true]) { border-color: var(--ink-3); background: var(--paper-2); }
.ag-cell:focus-visible, .ag-col:focus-visible, .ag-tok:focus-visible { outline: 2px solid var(--link); outline-offset: 2px; }
.ag-cell[aria-disabled=true] { cursor: default; }
.ag-x { color: var(--k-fig); font-weight: 600; } .ag-o { color: var(--k-quiz); font-weight: 600; }
.ag-cell.ag-win { background: var(--ok-soft); border-color: var(--ok); }
.ag-cell.ag-last { border-color: var(--ink-2); border-width: 2px; }
.ag-score { font-size: 0.78rem; font-weight: 600; letter-spacing: 0.02em; }
.ag-good { color: var(--ok); } .ag-bad { color: var(--err); } .ag-even { color: var(--ink-3); }
.ag-mini { display: inline-grid; grid-template-columns: repeat(3, 3.1rem); gap: 3px; margin: 0.2rem 0 0.4rem; }
.ag-mini span { border: 1px solid var(--rule); height: 2.3rem; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; border-radius: 3px; background: var(--paper); }
.ag-mini span.ag-pick { outline: 2px solid var(--ok); outline-offset: -1px; }
.ag-kv { display: grid; grid-template-columns: 1fr auto; gap: 0.15rem 0.9rem; margin: 0.2rem 0 0.7rem; }
.ag-kv b { color: var(--ink); font-variant-numeric: tabular-nums; text-align: right; font-weight: 600; }
.ag-c4wrap { width: min(440px, 100%); }
.ag-c4scores { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; padding: 0 6px; font-family: var(--sans); font-size: 0.72rem; text-align: center; font-variant-numeric: tabular-nums; color: var(--ink-3); min-height: 1.2em; }
.ag-c4scores .ag-pickc { color: var(--ok); font-weight: 700; }
.ag-c4 { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; padding: 6px; background: var(--paper-2); border: 1px solid var(--rule); border-radius: 6px; }
.ag-col { display: flex; flex-direction: column-reverse; gap: 4px; padding: 3px; margin: 0; border: 1px solid transparent; background: transparent; border-radius: 4px; cursor: pointer; min-width: 0; }
.ag-col:hover:not([aria-disabled=true]) { background: var(--rule-2); border-color: var(--rule); }
.ag-col[aria-disabled=true] { cursor: default; }
.ag-hole { display: block; width: 100%; aspect-ratio: 1; border-radius: 50%; background: var(--paper); border: 1px solid var(--rule); box-sizing: border-box; }
.ag-hole.ag-p1 { background: var(--err); border-color: var(--err); }
.ag-hole.ag-p2 { background: var(--warn); border-color: var(--warn); box-shadow: inset 0 0 0 4px var(--paper-2); }
.ag-hole.ag-wonc { outline: 3px solid var(--ok); outline-offset: 1px; }
.ag-hole.ag-lastc { outline: 2px dashed var(--ink-2); outline-offset: 1px; }
.ag-disc1, .ag-disc2 { display: inline-block; width: 0.85em; height: 0.85em; border-radius: 50%; vertical-align: -0.1em; margin-right: 0.25em; }
.ag-disc1 { background: var(--err); } .ag-disc2 { background: var(--warn); box-shadow: inset 0 0 0 2px var(--paper); }
@keyframes ag-drop { from { transform: translateY(-260%); opacity: 0.4; } to { transform: none; opacity: 1; } }
.ag-hole.ag-drop { animation: ag-drop 0.28s ease-in; }
.ag-nim { display: flex; flex-direction: column; gap: 0.55rem; }
.ag-heap { display: flex; flex-wrap: wrap; align-items: center; gap: 0.3rem; font-family: var(--sans); }
.ag-heap-name { width: 4.8rem; color: var(--ink-2); font-size: 0.9rem; }
.ag-tok { width: 1.9rem; height: 1.9rem; border-radius: 50%; border: 2px solid var(--k-fig); background: var(--paper); cursor: pointer; padding: 0; }
.ag-tok:hover:not([aria-disabled=true]), .ag-tok.ag-hover { background: var(--err-soft); border-color: var(--err); }
.ag-tok[aria-disabled=true] { cursor: default; }
.ag-bin { font-family: var(--mono); border-collapse: collapse; font-size: 0.92rem; margin: 0.2rem 0 0.6rem; }
.ag-bin td, .ag-bin th { padding: 0.15rem 0.45rem; text-align: right; }
.ag-bin th { font-family: var(--sans); font-weight: 600; color: var(--ink-3); font-size: 0.78rem; }
.ag-bin tr.ag-sum td { border-top: 1px solid var(--ink-3); color: var(--ink); font-weight: 600; }
.ag-bin td.ag-odd { color: var(--err); font-weight: 600; }
@media (prefers-reduced-motion: reduce) { .ag-hole.ag-drop { animation: none; } }
`;
  function injectCss() {
    if (document.getElementById('algo-games-css')) return;
    const s = document.createElement('style'); s.id = 'algo-games-css'; s.textContent = CSS; document.head.appendChild(s);
  }
  const fmtInt = (n) => n.toLocaleString('en-US');
  function select(el, label, options, value, onchange) {
    const s = el('select', { 'aria-label': label, onchange: () => onchange(s.value) }, options.map(([v, t]) => el('option', { value: v }, t)));
    s.value = value; return s;
  }
  const stat = (el, label) => { const b = el('b', {}, '–'); const box = el('div', { class: 'ag-stat' }, b, el('span', {}, label)); return { box, set: (v) => { b.textContent = v; } }; };

  // =====================================================================================================================
  // Demo 1: the game tree
  // =====================================================================================================================
  const SHAPES = [['3,3', 'Depth 2, 3 moves each (9 leaves)'], ['2,2,2', 'Depth 3, 2 moves each (8 leaves)'], ['3,3,3', 'Depth 3, 3 moves each (27 leaves)'],
    ['2,2,2,2', 'Depth 4, 2 moves each (16 leaves)'], ['mixed', 'Depth 3, 2 or 3 moves (mixed)']];
  const parseShape = (v) => (v === 'mixed' ? 'mixed' : v.split(',').map(Number));

  function mountTree(host, api) {
    injectCss();
    const { el } = api;
    let shape = (host.clientWidth || 600) < 520 ? '2,2,2,2' : '3,3,3';
    let seed = 2, prune = true;
    let tree = makeTree(api.rng(seed), parseShape(shape));
    let st = new Map(), focus = null, finished = false, names = new Map();
    const narr = el('p', { class: 'ag-narr', 'aria-live': 'polite' });
    const sThis = stat(el, 'looked at so far'), sAll = stat(el, 'plain minimax'), sAb = stat(el, 'alpha-beta, this order'),
      sBest = stat(el, 'alpha-beta, best order'), sWorst = stat(el, 'alpha-beta, worst order');
    sThis.box.classList.add('ag-hi');
    const formula = el('p', { class: 'ag-note' });
    const leafInput = el('input', { type: 'text', 'aria-label': 'Leaf values, left to right', spellcheck: 'false' });
    const leafMsg = el('span', { class: 'ag-note', role: 'status' });

    function nameNodes() {
      names = new Map(); let k = 0; const q = [tree];
      while (q.length) { const n = q.shift(); if (isLeaf(n)) continue; names.set(n, String.fromCharCode(65 + k++)); q.push(...n.children); }
    }
    function intro() {
      narr.textContent = prune
        ? 'Alpha-beta: the same depth-first search as minimax, but each node carries α (the most MAX is sure of so far) and β (the least MIN is sure of). When they cross, the rest of that node’s children cannot matter. Press Step or Play.'
        : 'Minimax: MAX (▲) picks the largest value of its children, MIN (▼) the smallest. The search goes depth-first, left to right, and values move up as each subtree finishes. Press Step or Play.';
    }
    function refreshStats() {
      const d = depthOf(tree), lv = leavesOf(tree);
      sAll.set(String(lv.length)); sAb.set(String(leafCount(tree, true)));
      sBest.set(String(leafCount(orderTree(tree, true, true), true))); sWorst.set(String(leafCount(orderTree(tree, true, false), true)));
      if (shape !== 'mixed') { const b = parseShape(shape)[0]; formula.textContent = 'Knuth and Moore (1975): with perfect ordering alpha-beta looks at b^⌈d/2⌉ + b^⌊d/2⌋ − 1 = ' + b + '^' + Math.ceil(d / 2) + ' + ' + b + '^' + Math.floor(d / 2) + ' − 1 = ' + minimalLeaves(b, d) + ' leaves (for distinct leaf values), instead of b^d = ' + Math.pow(b, d) + '.'; }
      else formula.textContent = 'In the best order alpha-beta looks at about the square root of the leaves plain minimax needs (Knuth and Moore, 1975).';
      leafInput.value = lv.map((n) => n.value).join(' ');
      sThis.set(String(st.leaves || 0));
    }
    function newTree(t) { tree = t; nameNodes(); pl.reset(); refreshStats(); }

    // ----- drawing
    let pos = new Map(), leafR = 10;
    function layout(w, h) {
      pos = new Map();
      const d = depthOf(tree), lv = leavesOf(tree);
      const L = w < 480 ? 28 : 50, R = 6, top = 24, bottom = 14;
      const span = (w - L - R) / lv.length;
      leafR = Math.max(5.5, Math.min(15, span * 0.38));
      const gap = (h - top - bottom - leafR) / d;
      const place = (n, depth) => {
        let x;
        if (isLeaf(n)) { const i = lv.indexOf(n); x = L + span * (i + 0.5); }
        else { n.children.forEach((c) => place(c, depth + 1)); x = (pos.get(n.children[0]).x + pos.get(n.children[n.children.length - 1]).x) / 2; }
        pos.set(n, { x, y: top + depth * gap, depth });
      };
      place(tree, 0);
      return { d, L, gap, top };
    }
    function draw(ctx, w, h, C) {
      ctx.clearRect(0, 0, w, h);
      const { d, gap, top } = layout(w, h);
      const levelCount = []; for (const p of pos.values()) levelCount[p.depth] = (levelCount[p.depth] || 0) + 1;
      // the radius of internal nodes: as large as their level's spacing allows
      const radius = (depth) => (depth === d ? leafR : Math.max(8, Math.min(17, (w - 60) / levelCount[depth] * 0.3)));
      // level labels
      ctx.font = '600 ' + (w < 480 ? 9 : 11) + 'px ' + C.sans; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      for (let k = 0; k <= d; k++) { ctx.fillStyle = k === d ? C.ink3 : k % 2 ? C.quiz : C.fig; ctx.fillText(k === d ? 'leaf' : k % 2 ? 'MIN' : 'MAX', 2, top + k * gap); }
      // principal variation once finished
      const pv = new Set();
      if (finished) { let n = tree; pv.add(n); while (!isLeaf(n)) { const s = st.get(n); if (!s || s.best == null) break; n = n.children[s.best]; pv.add(n); } }
      const S = (n) => st.get(n) || { state: 'idle' };
      // edges
      const edges = (n) => {
        if (isLeaf(n)) return;
        const p = pos.get(n), sn = S(n), rp = radius(p.depth);
        n.children.forEach((c, i) => {
          const q = pos.get(c), sc = S(c), rq = radius(q.depth);
          const y1 = p.y + rp * (p.depth % 2 ? 0.25 : 0.8), y2 = q.y - rq * (q.depth % 2 && q.depth !== d ? 0.85 : 0.9);
          ctx.beginPath(); ctx.moveTo(p.x, y1); ctx.lineTo(q.x, y2);
          ctx.setLineDash([]);
          if (pv.has(n) && pv.has(c)) { ctx.strokeStyle = C.ok; ctx.lineWidth = 3; }
          else if (sc.state === 'pruned') { ctx.strokeStyle = C.rule; ctx.lineWidth = 1.2; ctx.setLineDash([4, 4]); }
          else if (sc.state === 'active') { ctx.strokeStyle = C.warn; ctx.lineWidth = 2.5; }
          else if (sc.state === 'done') { ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.4; }
          else { ctx.strokeStyle = C.rule; ctx.lineWidth = 1.2; }
          ctx.stroke(); ctx.setLineDash([]);
          if (sn.cut != null && i > sn.cut) {   // the cut: a cross on each edge alpha-beta never followed
            const mx = (p.x + q.x) / 2, my = (y1 + y2) / 2, k = Math.max(4, Math.min(7, rq * 0.6));
            ctx.strokeStyle = C.err; ctx.lineWidth = 2.2; ctx.beginPath();
            ctx.moveTo(mx - k, my - k); ctx.lineTo(mx + k, my + k); ctx.moveTo(mx + k, my - k); ctx.lineTo(mx - k, my + k); ctx.stroke();
          }
          edges(c);
        });
      };
      edges(tree);
      // nodes
      const fmt = (x) => (x === INF ? '∞' : x === -INF ? '−∞' : String(x));
      for (const [n, p] of pos) {
        const s = S(n), r = radius(p.depth), leaf = isLeaf(n), isMax = p.depth % 2 === 0;
        const col = leaf ? C.ink3 : isMax ? C.fig : C.quiz;
        ctx.beginPath();
        if (leaf) ctx.rect(p.x - r, p.y - r, 2 * r, 2 * r);
        else if (isMax) { ctx.moveTo(p.x, p.y - r * 1.15); ctx.lineTo(p.x + r * 1.15, p.y + r * 0.8); ctx.lineTo(p.x - r * 1.15, p.y + r * 0.8); ctx.closePath(); }
        else { ctx.moveTo(p.x, p.y + r * 1.15); ctx.lineTo(p.x + r * 1.15, p.y - r * 0.8); ctx.lineTo(p.x - r * 1.15, p.y - r * 0.8); ctx.closePath(); }
        ctx.fillStyle = s.state === 'pruned' ? C.paper2 : C.paper; ctx.fill();
        if (s.state === 'done' || s.state === 'active') { ctx.save(); ctx.globalAlpha = s.state === 'done' ? 0.2 : 0.1; ctx.fillStyle = leaf ? C.ink3 : col; ctx.fill(); ctx.restore(); }
        ctx.setLineDash(s.state === 'pruned' ? [3, 3] : []);
        ctx.strokeStyle = pv.has(n) ? C.ok : s.state === 'pruned' ? C.rule : s.state === 'active' ? C.warn : col;
        ctx.lineWidth = pv.has(n) ? 3 : s.state === 'active' ? 2.5 : 1.6; ctx.stroke(); ctx.setLineDash([]);
        if (n === focus) {
          ctx.beginPath(); ctx.arc(p.x, p.y, (leaf ? r * 1.45 : r * 1.3) + 2, 0, Math.PI * 2); ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.stroke();
        }
        // the value
        let text = null;
        if (leaf) text = String(n.value);
        else if (s.value != null) text = (s.bound || '') + s.value;
        if (text != null) {
          const fs = Math.max(8, Math.min(15, r * (leaf ? 1.05 : 0.85) * (text.length > 2 ? 0.8 : 1)));
          ctx.font = (leaf && s.state !== 'done' ? '' : '600 ') + fs + 'px ' + C.sans; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = s.state === 'pruned' ? C.ink3 : leaf && s.state !== 'done' ? C.ink3 : C.ink;
          ctx.fillText(text, p.x, p.y + (leaf ? 0.5 : isMax ? r * 0.22 : -r * 0.2));
          if (s.state === 'pruned' && leaf) { ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x - r * 0.7, p.y + r * 0.7); ctx.lineTo(p.x + r * 0.7, p.y - r * 0.7); ctx.stroke(); }
        }
        // the node's name and its alpha and beta
        if (!leaf) {
          ctx.font = '600 10px ' + C.sans; ctx.fillStyle = C.ink3; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
          ctx.fillText(names.get(n) || '', p.x - r * 1.2 - 2, p.y - r * 0.5);
          if (prune && s.alpha !== undefined && s.state !== 'pruned') {
            ctx.font = '10px ' + C.mono; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
            ctx.fillStyle = s.state === 'active' ? C.warn : C.ink2;
            const yb = p.y + r * 1.15 + 3;
            if (levelCount[p.depth] * 64 < w - 60) ctx.fillText('α' + fmt(s.alpha) + ' β' + fmt(s.beta), p.x, yb);
            else { ctx.fillText('α' + fmt(s.alpha), p.x, yb); ctx.fillText('β' + fmt(s.beta), p.x, yb + 11); }
          }
        }
      }
    }

    // ----- controls
    const modeSel = select(el, 'Search', [['ab', 'Alpha-beta'], ['mm', 'Plain minimax']], 'ab', (v) => { prune = v === 'ab'; pl.reset(); });
    const shapeSel = select(el, 'Tree shape', SHAPES, shape, (v) => { shape = v; newTree(makeTree(api.rng(seed), parseShape(shape))); });
    const bar = el('div', { class: 'algo-controls ag-bar' }, modeSel, shapeSel,
      el('button', { class: 'btn', onclick: () => { seed = 1 + Math.floor(Math.random() * 1e9); newTree(makeTree(api.rng(seed), parseShape(shape))); } }, 'New tree'),
      el('button', { class: 'btn', onclick: () => newTree(orderTree(tree, true, true)), title: 'Sort every node’s children so the mover’s best move comes first' }, 'Best order'),
      el('button', { class: 'btn', onclick: () => newTree(orderTree(tree, true, false)), title: 'Sort every node’s children so the mover’s worst move comes first' }, 'Worst order'));
    host.append(bar);
    const cv = api.canvas(host, { label: 'A game tree. MAX nodes are triangles pointing up, MIN nodes triangles pointing down, leaves squares. Click a leaf to change its value.', height: (w) => (w < 480 ? 340 : 380), draw });
    host.append(el('div', { class: 'algo-legend' },
      el('span', {}, el('i', { class: 'ag-swatch-max' }), 'MAX: takes the largest'), el('span', {}, el('i', { class: 'ag-swatch-min' }), 'MIN: takes the smallest'),
      el('span', {}, el('i', { style: 'background: var(--warn)' }), 'being searched'), el('span', {}, el('i', { style: 'background: var(--rule)' }), 'pruned (never looked at)'),
      el('span', {}, el('i', { style: 'background: var(--ok)' }), 'best line of play')));
    host.append(narr);
    const pl = api.player(host, {
      speeds: [0.4, 25], speed: 30,
      start: () => { st = new Map(); focus = null; finished = false; return treeSearch(tree, prune, st, names); },
      onStep: (s) => { focus = s.focus; narr.textContent = s.msg; sThis.set(String(st.leaves)); pl.status('Leaves looked at: ' + st.leaves + ' of ' + leavesOf(tree).length); cv.redraw(); },
      onDone: (v) => {
        finished = true; focus = null;
        const b = st.get(tree).best, k = tree.children.length;
        const where = k === 2 ? ['left', 'right'][b] : k === 3 ? ['left', 'middle', 'right'][b] : 'number ' + (b + 1);
        narr.textContent = 'Done. The root is worth ' + v + ': MAX’s best move is the ' + where + ' branch, and the green line is the game both sides would play. ' +
          (prune ? 'Alpha-beta looked at ' + st.leaves + ' of ' + leavesOf(tree).length + ' leaves and got exactly the same answer as minimax would.' : 'Minimax looked at every one of the ' + st.leaves + ' leaves. Switch to alpha-beta to see how many it can skip.');
        sThis.set(String(st.leaves)); cv.redraw();
      },
      onReset: () => { st = new Map(); st.leaves = 0; focus = null; finished = false; sThis.set('0'); intro(); pl.status(''); cv.redraw(); }
    });
    host.append(el('p', { class: 'ag-note' }, 'Leaves examined:'), el('div', { class: 'ag-stats' }, sThis.box, sAll.box, sAb.box, sBest.box, sWorst.box), formula);
    const applyLeaves = () => {
      const nums = (leafInput.value.match(/-?\d+/g) || []).map((x) => Math.max(-99, Math.min(99, parseInt(x, 10))));
      const lv = leavesOf(tree);
      if (nums.length !== lv.length) { leafMsg.textContent = 'Type ' + lv.length + ' whole numbers (you typed ' + nums.length + ').'; return; }
      lv.forEach((n, i) => { n.value = nums[i]; }); leafMsg.textContent = ''; pl.reset(); refreshStats();
    };
    host.append(el('label', { class: 'ag-field' }, 'Leaf values, left to right:', leafInput,
      el('button', { class: 'btn quiet', onclick: applyLeaves }, 'Use these'), leafMsg));
    leafInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); applyLeaves(); } });
    host.append(el('p', { class: 'ag-note' }, 'Click a leaf to add 1 to it (Shift-click to subtract 1), or type all of them above, for example a tree from a textbook.'));
    cv.canvas.addEventListener('click', (e) => {
      const r = cv.canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      for (const n of leavesOf(tree)) {
        const p = pos.get(n);
        if (p && Math.abs(p.x - x) <= Math.max(leafR, 9) + 3 && Math.abs(p.y - y) <= Math.max(leafR, 9) + 3) {
          n.value = Math.max(-99, Math.min(99, n.value + (e.shiftKey ? -1 : 1))); pl.reset(); refreshStats(); return;
        }
      }
    });
    nameNodes(); st.leaves = 0; intro(); refreshStats();
    return () => { pl.stop(); cv.stop(); };
  }

  // =====================================================================================================================
  // Demo 2: tic-tac-toe
  // =====================================================================================================================
  function scoreWord(v) { return v > 0 ? 'win' : v < 0 ? 'lose' : 'draw'; }
  function scoreClass(v) { return v > 0 ? 'ag-good' : v < 0 ? 'ag-bad' : 'ag-even'; }
  function scoreLong(v, emptyNow) {
    if (v === 0) return 'a draw';
    const plies = emptyNow - (Math.abs(v) - 1);   // moves until the game ends
    return (v > 0 ? 'a win' : 'a loss') + ' in ' + plies + ' move' + (plies === 1 ? '' : 's');
  }
  const SQ = ['top left', 'top middle', 'top right', 'middle left', 'centre', 'middle right', 'bottom left', 'bottom middle', 'bottom right'];

  function mountTicTacToe(host, api) {
    injectCss();
    const { el } = api;
    let b = new Array(9).fill(0), human = 1, ai = 2, showScores = true, last = -1, timer = 0, lastAi = null;
    const cells = [], msg = el('p', { class: 'ag-msg', 'aria-live': 'polite' });
    const grid = el('div', { class: 'ag-ttt', role: 'group', 'aria-label': 'Tic-tac-toe board' });
    for (let i = 0; i < 9; i++) {
      const c = el('button', { class: 'ag-cell', type: 'button', onclick: () => humanMove(i), onkeydown: (e) => arrows(e, i) });
      cells.push(c); grid.append(c);
    }
    function arrows(e, i) {
      const m = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 }[e.key]; if (m === undefined) return;
      e.preventDefault(); const j = i + m;
      if (j >= 0 && j < 9 && !(Math.abs(m) === 1 && Math.floor(j / 3) !== Math.floor(i / 3))) cells[j].focus();
    }
    const side = el('div', { class: 'ag-side' });
    const firstSel = select(el, 'Who starts', [['h', 'You play X and go first'], ['c', 'Computer plays X and goes first']], 'h', () => newGame());
    const scoresBox = el('input', { type: 'checkbox', checked: 'checked', onchange: () => { showScores = scoresBox.checked; render(); } });
    host.append(el('div', { class: 'algo-controls' }, firstSel, el('button', { class: 'btn primary', onclick: () => newGame() }, 'New game'),
      el('label', { class: 'algo-speed-label' }, scoresBox, 'Show the score of each square')));
    host.append(el('div', { class: 'ag-wrap' }, el('div', { class: 'ag-main' }, grid, msg), side));

    const toMove = () => (empties(b) % 2 === 1 ? 1 : 2);   // X moves when the number of empty squares is odd
    const sym = (p) => (p === 1 ? 'X' : 'O');
    function render() {
      const w = tttWinner(b), over = tttDone(b), mover = toMove();
      const scores = !over && mover === human && showScores ? tttScores(b, human) : null;
      for (let i = 0; i < 9; i++) {
        const c = cells[i]; c.textContent = ''; c.className = 'ag-cell';
        const disabled = over || !!b[i] || mover !== human;
        c.setAttribute('aria-disabled', disabled ? 'true' : 'false');
        let label = 'Row ' + (Math.floor(i / 3) + 1) + ', column ' + (i % 3 + 1) + ': ';
        if (b[i]) { c.append(el('span', { class: b[i] === 1 ? 'ag-x' : 'ag-o', 'aria-hidden': 'true' }, sym(b[i]))); label += sym(b[i]); }
        else { label += 'empty'; if (scores) { c.append(el('span', { class: 'ag-score ' + scoreClass(scores[i]), 'aria-hidden': 'true' }, scoreWord(scores[i]))); label += ', with perfect play from here you ' + scoreWord(scores[i]); } }
        if (w && w.line.includes(i)) c.classList.add('ag-win');
        if (i === last) c.classList.add('ag-last');
        c.setAttribute('aria-label', label);
      }
      if (w) msg.textContent = w.p === human ? 'You won! (That should not be possible: please tell us how.)' : 'The computer wins. Look at its scores: it saw this coming.';
      else if (over) msg.textContent = 'A draw. With perfect play on both sides, tic-tac-toe is always a draw.';
      else if (mover === human) msg.textContent = 'Your move (' + sym(human) + ').' + (scores ? ' Each empty square shows what happens if you play there and both sides then play perfectly.' : '');
      else msg.textContent = 'The computer is thinking…';
      renderSide();
    }
    function renderSide() {
      side.textContent = '';
      side.append(el('h3', {}, 'The computer’s last move'));
      if (!lastAi) { side.append(el('p', {}, 'The computer has not moved yet. When it does, this panel shows what it saw: the score of each square for it, and how many positions it had to examine.')); return; }
      const mini = el('div', { class: 'ag-mini', 'aria-hidden': 'true' });
      lastAi.scores.forEach((v, i) => mini.append(el('span', { class: (v === null ? '' : scoreClass(v)) + (i === lastAi.move ? ' ag-pick' : '') }, v === null ? (lastAi.board[i] ? sym(lastAi.board[i]) : '') : scoreWord(v))));
      const best = lastAi.scores[lastAi.move];
      side.append(mini,
        el('p', {}, 'It played the ' + SQ[lastAi.move] + ' square (outlined). For the computer that move leads to ' + scoreLong(best, lastAi.emptyBefore) + ' if you play perfectly from there; no square scored higher.'),
        el('div', { class: 'ag-kv' },
          el('span', {}, 'Positions examined, plain minimax'), el('b', {}, fmtInt(lastAi.counts.minimax)),
          el('span', {}, 'Positions examined, alpha-beta'), el('b', {}, fmtInt(lastAi.counts.alphabeta)),
          el('span', {}, 'Work saved by pruning'), el('b', {}, Math.round(100 * (1 - lastAi.counts.alphabeta / lastAi.counts.minimax)) + '%')),
        el('p', { class: 'ag-note' }, 'Both searches give the same move. Alpha-beta simply proves sooner that the other moves are no better. To show the score of every square the page also remembers positions it has already solved; tic-tac-toe has only 5,478 different legal positions.'));
    }
    function aiMove() {
      timer = 0;
      if (!host.isConnected || tttDone(b) || toMove() !== ai) return;
      const scores = tttScores(b, ai), best = tttBest(b, ai), counts = tttCounts(b, ai);
      const move = best[Math.floor(Math.random() * best.length)];
      lastAi = { scores, move, counts, board: b.slice(), emptyBefore: empties(b) };
      b[move] = ai; last = move; render();
    }
    function humanMove(i) {
      if (b[i] || tttDone(b) || toMove() !== human) return;
      b[i] = human; last = i; render();
      if (!tttDone(b)) timer = setTimeout(aiMove, api.reducedMotion() ? 50 : 350);
    }
    function newGame() {
      if (timer) clearTimeout(timer); timer = 0;
      b = new Array(9).fill(0); last = -1; lastAi = null;
      human = firstSel.value === 'h' ? 1 : 2; ai = 3 - human; render();
      if (ai === 1) timer = setTimeout(aiMove, 300);
    }
    newGame();
    return () => { if (timer) clearTimeout(timer); timer = 0; };
  }

  // =====================================================================================================================
  // Demo 3: Connect Four
  // =====================================================================================================================
  function c4Word(sc) {
    if (!sc) return '';
    const v = sc.v, pre = sc.exact ? '' : '≤';
    if (v >= WIN - 100) return pre + 'win';
    if (v <= -(WIN - 100)) return 'loss';
    return pre + (v > 0 ? '+' : '') + v;
  }

  function mountConnectFour(host, api) {
    injectCss();
    const { el } = api;
    let s = c4New(), human = 1, ai = 2, maxDepth = 6, timeCap = 2000, order = CENTRE_FIRST, exactRoot = true, timer = 0, thinking = false, lastCell = -1, dropCell = -1, info = null, gen = 0;
    const cols = [], holes = [];
    const board = el('div', { class: 'ag-c4', role: 'group', 'aria-label': 'Connect Four board, 7 columns' });
    for (let c = 0; c < C4W; c++) {
      const col = el('button', { class: 'ag-col', type: 'button', onclick: () => humanMove(c), onkeydown: (e) => {
        const m = { ArrowLeft: -1, ArrowRight: 1, Home: -99, End: 99 }[e.key]; if (m === undefined) return;
        e.preventDefault(); cols[Math.max(0, Math.min(C4W - 1, c + m))].focus();
      } });
      holes.push([]);
      for (let r = 0; r < C4H; r++) { const h = el('span', { class: 'ag-hole', 'aria-hidden': 'true' }); holes[c].push(h); col.append(h); }
      cols.push(col); board.append(col);
    }
    const scoreRow = el('div', { class: 'ag-c4scores', 'aria-hidden': 'true' });
    const msg = el('p', { class: 'ag-msg', 'aria-live': 'polite' });
    const side = el('div', { class: 'ag-side' });
    const firstSel = select(el, 'Who starts', [['h', 'You go first'], ['c', 'Computer goes first']], 'h', () => newGame());
    const depthSel = select(el, 'Search depth', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => [String(d), 'Look ahead ' + d + ' move' + (d > 1 ? 's' : '')]), '6', (v) => { maxDepth = +v; });
    const timeSel = select(el, 'Time limit per move', [['500', '0.5 s a move'], ['2000', '2 s a move'], ['5000', '5 s a move']], '2000', (v) => { timeCap = +v; });
    const orderBox = el('input', { type: 'checkbox', checked: 'checked', onchange: () => { order = orderBox.checked ? CENTRE_FIRST : LEFT_TO_RIGHT; } });
    const exactBox = el('input', { type: 'checkbox', checked: 'checked', onchange: () => { exactRoot = exactBox.checked; } });
    host.append(el('div', { class: 'algo-controls' }, firstSel, el('button', { class: 'btn primary', onclick: () => newGame() }, 'New game'), depthSel, timeSel,
      el('label', { class: 'algo-speed-label' }, orderBox, 'Try centre columns first'),
      el('label', { class: 'algo-speed-label' }, exactBox, 'Score every column exactly')));
    host.append(el('div', { class: 'ag-wrap' }, el('div', { class: 'ag-c4wrap' }, scoreRow, board, msg), side));

    const who = (p) => (p === human ? 'yours' : 'the computer’s');
    function render() {
      const w = c4WinLine(s.b), full = s.n === C4W * C4H, over = !!w || full;
      for (let c = 0; c < C4W; c++) {
        const counts = [];
        for (let r = 0; r < C4H; r++) {
          const i = r * C4W + c, h = holes[c][r], p = s.b[i];
          h.className = 'ag-hole' + (p ? (p === human ? ' ag-p1' : ' ag-p2') : '') + (w && w.line.includes(i) ? ' ag-wonc' : '') + (i === lastCell && !w ? ' ag-lastc' : '') + (i === dropCell && !api.reducedMotion() ? ' ag-drop' : '');
          if (p) counts.push(p === human ? 'yours' : 'computer’s');
        }
        const dis = over || thinking || s.toMove !== human || s.h[c] >= C4H;
        cols[c].setAttribute('aria-disabled', dis ? 'true' : 'false');
        cols[c].setAttribute('aria-label', 'Column ' + (c + 1) + ': ' + (counts.length ? 'from the bottom ' + counts.join(', ') : 'empty') + '. ' + (s.h[c] >= C4H ? 'Full.' : (C4H - s.h[c]) + ' free.'));
      }
      dropCell = -1;
      if (w) msg.textContent = w.p === human ? 'Four in a row: you win! The computer’s look-ahead was too short to see it coming. Try a deeper search.' : 'Four in a row for the computer.';
      else if (full) msg.textContent = 'The board is full: a draw.';
      else if (thinking) msg.textContent = 'The computer is thinking…';
      else msg.textContent = 'Your move: choose a column (click it, or use the arrow keys and Enter). You are ' + (human === 1 ? 'red' : 'red, and move second') + '.';
      scoreRow.textContent = '';
      for (let c = 0; c < C4W; c++) scoreRow.append(el('span', { class: info && info.res && info.res.col === c ? 'ag-pickc' : '' }, info && info.res ? c4Word(info.res.scores[c]) : ''));
      renderSide();
    }
    function renderSide() {
      side.textContent = '';
      side.append(el('h3', {}, 'The computer’s search'),
        el('p', {}, el('span', { class: 'ag-disc1', 'aria-hidden': 'true' }), 'You   ', el('span', { class: 'ag-disc2', 'aria-hidden': 'true' }), 'Computer'));
      if (!info) { side.append(el('p', {}, 'When the computer moves, this panel shows how deep it looked, how many positions it examined and how long it took. The numbers above the board are its score for each column (higher is better for it; ≤ means alpha-beta proved the column is no better than that and stopped).')); return; }
      const kv = el('div', { class: 'ag-kv' },
        el('span', {}, 'Depth searched completely'), el('b', {}, String(info.depth || 0)),
        el('span', {}, info.running ? 'Now searching depth' : 'Depth asked for'), el('b', {}, String(info.running ? info.depth + 1 : maxDepth)),
        el('span', {}, 'Positions examined'), el('b', {}, fmtInt(info.nodes)),
        el('span', {}, 'Time'), el('b', {}, (info.ms / 1000).toFixed(2) + ' s'),
        el('span', {}, 'Positions a second'), el('b', {}, info.ms > 20 ? fmtInt(Math.round(info.nodes / info.ms * 1000)) : '–'));
      side.append(kv);
      if (!info.running && info.res) {
        const sc = info.res.score;
        side.append(el('p', {}, info.stoppedByTime
          ? 'The time limit ran out during depth ' + (info.depth + 1) + ', so the computer used the move from depth ' + info.depth + ', the deepest search it finished. That is what iterative deepening is for.'
          : c4Decided(sc) ? (sc > 0 ? 'The computer has found a forced win: whatever you do, it can make four in a row.' : 'The computer sees that it loses against perfect play, so it plays the move that delays the loss longest.')
            : 'It looked ' + info.depth + ' moves ahead and scored the positions there with its evaluation function: a guess, not a certainty. Its choice scored ' + (sc > 0 ? '+' : '') + sc + '.'));
      }
    }
    function finish(res, nodes, ms, depth, stoppedByTime, myGen) {
      if (myGen !== gen) return;
      thinking = false; timer = 0;
      info = { res, nodes, ms, depth, stoppedByTime, running: false };
      lastCell = c4Play(s, res.col); dropCell = lastCell; render();
    }
    function think() {
      const myGen = gen, work = c4Clone(s), ctx = { nodes: 0, order, exactRoot };
      const t0 = performance.now(); let depth = 1, res = null, g = c4Root(work, 1, ctx, order.slice());
      thinking = true; info = { nodes: 0, ms: 0, depth: 0, running: true }; render();
      const tick = () => {
        timer = 0;
        if (myGen !== gen || !host.isConnected) return;
        const slice = performance.now() + 12;
        for (;;) {
          const r = g.next();
          if (r.done) {
            res = r.value;
            if (depth >= maxDepth || c4Decided(res.score) || depth >= C4W * C4H - work.n) { finish(res, ctx.nodes, performance.now() - t0, depth, false, myGen); return; }
            depth++; g = c4Root(work, depth, ctx, c4NextOrder(res, order));
          }
          const now = performance.now();
          if (now - t0 > timeCap && res) {
            // abandon the unfinished iteration (work is a copy, so nothing needs undoing)
            finish(res, ctx.nodes, now - t0, depth - 1, true, myGen); return;
          }
          if (now > slice) break;
        }
        info = { nodes: ctx.nodes, ms: performance.now() - t0, depth: depth - 1, running: true, res: null }; renderSide();
        timer = setTimeout(tick, 0);
      };
      timer = setTimeout(tick, api.reducedMotion() ? 0 : 120);
    }
    function humanMove(c) {
      if (thinking || s.toMove !== human || c4WinLine(s.b) || s.n === C4W * C4H) return;
      const i = c4Play(s, c); if (i < 0) return;
      lastCell = i; dropCell = i; render();
      if (!c4WinAt(s.b, i) && s.n < C4W * C4H) think();
    }
    function newGame() {
      gen++; if (timer) clearTimeout(timer); timer = 0; thinking = false;
      s = c4New(); lastCell = -1; info = null;
      human = firstSel.value === 'h' ? 1 : 2; ai = 3 - human;
      // red is always the person, whichever side moves first
      render();
      if (ai === 1) think();
    }
    newGame();
    return () => { gen++; if (timer) clearTimeout(timer); timer = 0; };
  }

  // =====================================================================================================================
  // Demo 4: Nim
  // =====================================================================================================================
  function mountNim(host, api) {
    injectCss();
    const { el } = api;
    let heaps = [3, 4, 5], human = true, timer = 0, lastMove = null, showMath = true, kb = false;
    const NAMES = ['A', 'B', 'C', 'D'];
    const rows = el('div', { class: 'ag-nim', role: 'group', 'aria-label': 'Heaps' });
    const msg = el('p', { class: 'ag-msg', 'aria-live': 'polite' });
    const side = el('div', { class: 'ag-side' });
    const firstSel = select(el, 'Who starts', [['h', 'You go first'], ['c', 'Computer goes first']], 'h', () => newGame(false));
    const mathBox = el('input', { type: 'checkbox', checked: 'checked', onchange: () => { showMath = mathBox.checked; render(); } });
    host.append(el('div', { class: 'algo-controls' }, firstSel,
      el('button', { class: 'btn primary', onclick: () => newGame(true) }, 'New heaps'),
      el('button', { class: 'btn', onclick: () => newGame(false) }, 'Start again'),
      el('label', { class: 'algo-speed-label' }, mathBox, 'Show the computer’s arithmetic')));
    host.append(el('div', { class: 'ag-wrap' }, el('div', { style: 'flex: 1 1 18rem; min-width: 0' }, rows, msg), side));
    let start = heaps.slice();
    const over = () => heaps.every((h) => h === 0);
    function render() {
      rows.textContent = '';
      heaps.forEach((h, i) => {
        const row = el('div', { class: 'ag-heap' }, el('span', { class: 'ag-heap-name' }, 'Heap ' + NAMES[i] + ' (' + h + ')'));
        const toks = [];
        for (let k = 0; k < h; k++) {
          const take = h - k;
          const t = el('button', { class: 'ag-tok', type: 'button', 'aria-label': 'Heap ' + NAMES[i] + ': take ' + take + ', leaving ' + k, 'aria-disabled': !human || over() ? 'true' : 'false',
            onclick: () => humanMove(i, take),
            onmouseenter: () => { for (let j = k; j < h; j++) toks[j].classList.add('ag-hover'); },
            onmouseleave: () => toks.forEach((x) => x.classList.remove('ag-hover')),
            onfocus: () => { for (let j = k; j < h; j++) toks[j].classList.add('ag-hover'); },
            onblur: () => toks.forEach((x) => x.classList.remove('ag-hover')) });
          toks.push(t); row.append(t);
        }
        if (!h) row.append(el('span', { class: 'ag-note' }, 'empty'));
        rows.append(row);
      });
      if (over()) msg.textContent = human ? 'The computer took the last counter: it wins.' : 'You took the last counter: you win!';
      else if (human) msg.textContent = 'Your move: click a counter to take it and every counter to its right. Whoever takes the last counter wins.';
      else msg.textContent = 'The computer is choosing…';
      renderSide();
    }
    function renderSide() {
      side.textContent = '';
      side.append(el('h3', {}, 'No search needed'));
      if (lastMove) side.append(el('p', {}, lastMove));
      if (!showMath) return;
      const bits = Math.max(1, ...start.map((h) => h.toString(2).length));
      const x = nimSum(heaps);
      const tb = el('table', { class: 'ag-bin' }, el('tr', {}, el('th', {}, 'heap'), el('th', {}, 'size'), el('th', {}, 'binary')));
      heaps.forEach((h, i) => tb.append(el('tr', {}, el('td', {}, NAMES[i]), el('td', {}, String(h)), el('td', {}, h.toString(2).padStart(bits, '0')))));
      const sumRow = el('tr', { class: 'ag-sum' }, el('td', {}, 'XOR'), el('td', {}, String(x)));
      const cell = el('td', {});
      x.toString(2).padStart(bits, '0').split('').forEach((ch) => cell.append(ch === '1' ? el('span', { class: 'ag-bad' }, '1') : '0'));
      sumRow.append(cell); tb.append(sumRow);
      side.append(tb,
        el('p', {}, x
          ? 'The nim-sum (each binary column added without carrying: odd count gives 1) is ' + x + ', not zero. Whoever is to move can win: there is always a move that makes every column even.'
          : 'The nim-sum is 0: every binary column has an even number of 1s. Whoever is to move will lose against perfect play, because every move makes some column odd again.'),
        el('p', { class: 'ag-note' }, 'The computer does no search at all: it computes one XOR and knows the answer. Bouton proved this rule in 1901.'));
    }
    function apply(i, take) { heaps[i] -= take; }
    function computer() {
      timer = 0;
      if (!host.isConnected || over() || human) return;
      const x = nimSum(heaps), m = nimMove(heaps);
      apply(m.heap, m.take);
      lastMove = x ? 'The computer took ' + m.take + ' from heap ' + NAMES[m.heap] + ', which makes the nim-sum 0 again: every column of 1s now has an even count.'
        : 'The nim-sum was 0, so the computer had no winning move; it took 1 from the biggest heap and hopes you slip.';
      human = true; render();
      const t = rows.querySelector('.ag-tok'); if (t && kb) t.focus();
    }
    function humanMove(i, take) {
      if (!human || over() || take < 1 || take > heaps[i]) return;
      kb = rows.contains(document.activeElement);
      apply(i, take); lastMove = 'You took ' + take + ' from heap ' + NAMES[i] + '.'; human = false; render();
      if (!over()) timer = setTimeout(computer, api.reducedMotion() ? 50 : 500);
    }
    function newGame(fresh) {
      if (timer) clearTimeout(timer); timer = 0;
      if (fresh) { const k = 3 + (Math.random() < 0.35 ? 1 : 0); start = []; for (let i = 0; i < k; i++) start.push(1 + Math.floor(Math.random() * 7)); }
      heaps = start.slice(); lastMove = null; human = firstSel.value === 'h'; render();
      if (!human) timer = setTimeout(computer, 400);
    }
    newGame(false);
    return () => { if (timer) clearTimeout(timer); timer = 0; };
  }

  // =====================================================================================================================
  // Registration
  // =====================================================================================================================
  A.register({
    id: 'minimax-tree', title: 'Minimax and alpha-beta pruning', group: GROUP,
    blurb: 'Two players, one tree of moves. Watch values rise from the leaves, then watch alpha-beta reach the same answer while skipping whole branches, and see how the order of the moves decides how much it skips.',
    mount: mountTree,
    about: `<h2>Minimax</h2>
<p>In a two-player game where one side's gain is the other's loss, call the players MAX and MIN. MAX wants the final score as high as possible, MIN as low as possible. A game tree lists every way the game can go: the root is the position now, each branch a move, each leaf a finished game (or, in a big game, a position we stop at and score with a guess). The value of a leaf is its score. The value of a MAX node is the <em>largest</em> value of its children, because MAX will choose that move; the value of a MIN node is the <em>smallest</em>. Working this out from the leaves up is <strong>minimax</strong>. It assumes the opponent plays perfectly, which is the safe assumption.</p>
<p>The computation is a recursion: to know a node's value, first find the values of its children. The program walks the tree depth-first, finishing each subtree before moving to the next, exactly like the recursive tree procedures in the courses. Its cost is the trouble: with <em>b</em> moves in each position and <em>d</em> moves of look-ahead it must examine <em>b</em><sup><em>d</em></sup> leaves. Chess has about 35 legal moves in a typical position, so looking ten moves ahead means about 35<sup>10</sup> ≈ 2.8 × 10<sup>15</sup> positions.</p>
<h2>Alpha-beta pruning</h2>
<p>Often a branch cannot change the answer, and it can be skipped without looking at it. Suppose MAX already has a move worth 5. It starts to examine a second move and finds that MIN's first reply there scores 2. MIN would give at most 2 here, so this move is worse for MAX than the 5 it already has, whatever the other replies are worth. They are never examined.</p>
<p>Alpha-beta keeps two numbers as it goes down the tree. <strong>α</strong> is the most that MAX is already sure of on the path from the root, and <strong>β</strong> is the least that MIN is sure of. A node whose α has reached its β stops looking at its children. The value it returns is then only a bound (shown as ≤ or ≥ in the tree), but the bound is always good enough for the node above. The root's value, and so the move chosen, is <em>exactly</em> the one minimax finds.</p>
<h2>Order matters</h2>
<p>How much alpha-beta saves depends on the order in which moves are tried. If the best move is always tried first, Donald Knuth and Ronald Moore showed in 1975 that it examines only <em>b</em><sup>⌈<em>d</em>/2⌉</sup> + <em>b</em><sup>⌊<em>d</em>/2⌋</sup> − 1 leaves, about <em>b</em><sup><em>d</em>/2</sup>: in the same time it can look twice as deep. If the worst move always comes first, it saves almost nothing. Use the Best order and Worst order buttons to see both. A real program does not know the best move in advance (that is what it is searching for) so it guesses: captures first in chess, the centre first in Connect Four, or the best move from a shallower search it has just done.</p>
<h2>Where it is used</h2>
<p>The idea of pruning was found independently by several researchers in the late 1950s and early 1960s; Knuth and Moore's paper gave its full analysis. IBM's Deep Blue, which beat the world chess champion Garry Kasparov in a six-game match in 1997, ran alpha-beta search on hundreds of special-purpose chess chips, examining up to about 200 million positions a second. Stockfish, the strongest chess program today, still searches with alpha-beta (with many refinements) and since 2020 scores positions with a small neural network called NNUE. DeepMind's AlphaGo (2016) and AlphaZero (2017) took a different road: Monte Carlo tree search guided by a neural network, which samples promising lines instead of trying to examine all of them.</p>`,
    taught: [{ href: '#/dsa/8', text: 'SC 107 Lesson 8: Recursion' }, { href: '#/lisp/6', text: 'SC 102 Lesson 6: tree recursion' }, { href: '#/python/13', text: 'SC 101 Lesson 13: Recursion' }, { href: '#/math/13', text: 'SC 104 Lesson 13: Counting steps' }]
  });
  A.register({
    id: 'tic-tac-toe', title: 'Tic-tac-toe against minimax', group: GROUP,
    blurb: 'Play a computer that cannot lose. Every empty square shows whether it wins, draws or loses with perfect play, and the computer reports how many positions it examined, with and without pruning.',
    mount: mountTicTacToe,
    about: `<h2>How the computer plays</h2>
<p>Tic-tac-toe is small enough to search to the very end. For each empty square, the computer plays there in its head, then considers every reply, every reply to that, and so on until each game is won or drawn. A finished game scores +1 for a win, 0 for a draw and −1 for a loss (here a win is worth a little more the sooner it comes, so the computer finishes quickly and, when it is losing, holds out as long as it can). Minimax carries those scores back up, assuming each side picks its best move, and the computer plays a square with the highest score. Because it looks at everything, it never loses.</p>
<p>The scores on the empty squares are the same numbers, seen from your side: <em>win</em> means you can force a win by playing there, <em>lose</em> means the computer can then force one. From the empty board every square says <em>draw</em>: perfect play by both sides always ends in a draw.</p>
<h2>How much work it is</h2>
<p>Plain minimax from the empty board visits 549,946 positions, counting the empty board itself: the whole game tree, which contains 255,168 different games. Alpha-beta, trying squares in reading order, reaches the same decision after visiting far fewer; the panel shows the exact counts for each move. Most of those positions are the same ones reached by different move orders: tic-tac-toe has only 5,478 distinct legal positions. A program that remembers positions it has already solved (a <em>transposition table</em>, which real chess programs use too) does even less work. This page uses one to show the score of every square instantly.</p>`,
    taught: [{ href: '#/python/13', text: 'SC 101 Lesson 13: Recursion' }, { href: '#/dsa/8', text: 'SC 107 Lesson 8: Recursion' }]
  });
  A.register({
    id: 'connect-four', title: 'Connect Four: search with a horizon', group: GROUP,
    blurb: 'A game too big to search to the end. The computer looks a few moves ahead with alpha-beta, scores what it sees with an evaluation function, and deepens its search until its time runs out.',
    mount: mountConnectFour,
    about: `<h2>Too big to search to the end</h2>
<p>Connect Four has 4,531,985,219,092 legal positions (John Tromp's count), so no program can play it like tic-tac-toe by searching every game to the end in a fraction of a second. (It has been solved, in 1988, by James D. Allen and independently by Victor Allis: the first player wins by starting in the middle column. Their programs used much more knowledge and time than a web page has.) Instead the computer here does a <strong>depth-limited search</strong>: it looks ahead a fixed number of moves, the depth you choose, and at that horizon it stops and scores the position with an <strong>evaluation function</strong>, a quick guess at who is better off.</p>
<h2>The evaluation function</h2>
<p>This one is simple. It looks at all 69 lines of four cells on the board. A line holding three of the computer's discs and no discs of yours is worth +5; two of its discs and none of yours, +2; the same patterns for you count against it. Each of its discs in the centre column adds 3, because the centre takes part in the most lines. A real four in a row is found by the search itself and scored as a win (or loss), worth more than any guess, and a quicker win more than a slower one. The numbers above the board are the computer's scores for each column at the end of its search, from its point of view. Untick <em>Score every column exactly</em> and the computer prunes at the top of the tree too: the scores of the columns it rejects become bounds such as ≤ −4, meaning alpha-beta proved that column is no better than −4 and did not spend time finding out exactly how bad it is. That search examines fewer positions and plays the same move.</p>
<p>The guess can be wrong, and the search cannot see anything beyond its horizon: a threat that takes one more move than the depth to appear is invisible to it (the <em>horizon effect</em>). Set the depth to 1 or 2 and you can beat it; at 7 or more it is hard to beat.</p>
<h2>Iterative deepening and move ordering</h2>
<p>The computer first searches 1 move deep, then 2, then 3, and so on, up to the depth you asked for. That looks wasteful but is not: each search costs several times more than the one before, so the earlier ones add only a small fraction, and they pay for themselves. Each search starts with the best move of the previous one, which is exactly the good move ordering alpha-beta needs to prune well. And when the time limit runs out in the middle of a search, the computer plays the move from the deepest search it finished. Inside the search it tries the centre columns first, since central moves are usually better; untick that box to see the number of positions grow. The search runs in slices of a few milliseconds, so the page stays responsive while it thinks.</p>`,
    taught: [{ href: '#/dsa/8', text: 'SC 107 Lesson 8: Recursion' }, { href: '#/dsa/1', text: 'SC 107 Lesson 1: Counting the cost' }]
  });
  A.register({
    id: 'nim', title: 'Nim: a game solved by arithmetic', group: GROUP,
    blurb: 'Take counters from heaps; whoever takes the last one wins. The computer does no search at all: one XOR of the heap sizes tells it who is winning and what to do.',
    mount: mountNim,
    about: `<h2>A game with a formula</h2>
<p>Minimax works for any game but costs time that grows exponentially with the look-ahead. Some games have a shortcut. In 1901 Charles Bouton, a mathematician at Harvard, published the complete solution of Nim. Write each heap size in binary and add the columns without carrying (odd number of 1s gives 1, even gives 0). This is the bitwise XOR, and the result is called the <strong>nim-sum</strong>.</p>
<ul><li>If the nim-sum is 0, the player to move loses against perfect play: any move changes one heap, which flips at least one column from even to odd.</li>
<li>If it is not 0, the player to move can always make it 0 again: pick a heap whose binary form has a 1 in the leftmost odd column and reduce it to (that heap XOR the nim-sum).</li></ul>
<p>The player who keeps handing back a nim-sum of 0 eventually hands back the empty board, so they take the last counter. The computer here wins every game it can win, and it decides each move with one line of arithmetic instead of a search.</p>
<p>Nim matters beyond itself: the Sprague–Grundy theorem (Roland Sprague 1935, Patrick Grundy 1939) shows that every impartial game, one where both players have the same moves available, played under this last-move-wins rule, behaves exactly like a single Nim heap of some size. Most games, chess and Connect Four included, are not impartial, and for them no such formula is known: they need search.</p>`,
    taught: [{ href: '#/computer/2', text: 'SC 099 Lesson 2: bits and bytes' }]
  });

  // =====================================================================================================================
  // Tests (node: test_algos.js)
  // =====================================================================================================================
  function selfTest() {
    const fails = [];
    const check = (ok, m) => { if (!ok) fails.push(m); };
    // --- minimax and alpha-beta on random trees
    const shapes = [[2, 2], [3, 3], [2, 2, 2], [3, 3, 3], [2, 2, 2, 2], [3, 2, 3], [4, 4, 4], 'mixed'];
    let trees = 0;
    for (let seed = 1; seed <= 400; seed++) {
      const shape = shapes[seed % shapes.length], t = makeTree(A.rng(seed), shape);
      const m = { leaves: 0 }, a = { leaves: 0 };
      const vm = minimax(t, true, m), va = alphabeta(t, true, -INF, INF, a);
      check(vm === va, 'tree ' + seed + ': alpha-beta value ' + va + ' differs from minimax ' + vm);
      check(a.leaves <= m.leaves, 'tree ' + seed + ': alpha-beta looked at more leaves than minimax');
      check(m.leaves === leavesOf(t).length, 'tree ' + seed + ': minimax skipped a leaf');
      // the animated search does exactly the same thing
      for (const prune of [false, true]) {
        const st = new Map(), names = new Map(), g = treeSearch(t, prune, st, names); let r;
        do r = g.next(); while (!r.done);
        check(r.value === vm, 'tree ' + seed + ': animated search (prune ' + prune + ') value ' + r.value + ' differs from ' + vm);
        check(st.leaves === (prune ? a.leaves : m.leaves), 'tree ' + seed + ': animated search counted ' + st.leaves + ' leaves');
      }
      // ordering: the value never changes; the best order never needs more leaves than any other (distinct leaf values)
      const best = orderTree(t, true, true), worst = orderTree(t, true, false);
      check(minimax(best, true) === vm && minimax(worst, true) === vm, 'tree ' + seed + ': reordering changed the value');
      if (Array.isArray(shape) && shape.every((x) => x === shape[0])) {
        const u = cloneTree(t), lv = leavesOf(u), vals = A.rng(seed + 99).shuffle(lv.map((_, i) => i));
        lv.forEach((n, i) => { n.value = vals[i]; });
        const ub = orderTree(u, true, true), uw = orderTree(u, true, false);
        const nb = leafCount(ub, true), nu = leafCount(u, true), nw = leafCount(uw, true);
        check(nb === minimalLeaves(shape[0], shape.length), 'tree ' + seed + ': best order looked at ' + nb + ' leaves, Knuth-Moore says ' + minimalLeaves(shape[0], shape.length));
        check(nb <= nu && nu <= leavesOf(u).length && nw >= nb, 'tree ' + seed + ': ordering counts out of order ' + [nb, nu, nw]);
      }
      trees++;
    }
    check(trees === 400, 'not all trees tested');
    // a textbook example (Russell and Norvig, figure 5.2/5.5): MAX of three MIN nodes; value 3, and alpha-beta skips two leaves
    const tb = { children: [[3, 12, 8], [2, 4, 6], [14, 5, 2]].map((xs) => ({ children: xs.map((v) => ({ value: v })) })) };
    const tbs = { leaves: 0 };
    check(alphabeta(tb, true, -INF, INF, tbs) === 3 && tbs.leaves === 7, 'textbook tree: expected value 3 with 7 leaves, got ' + tbs.leaves);

    // --- tic-tac-toe
    const B = (s) => s.split('').map((ch) => (ch === 'X' ? 1 : ch === 'O' ? 2 : 0));
    check(tttWinner(B('XXX......')).p === 1, 'ttt: top row');
    check(tttWinner(B('...OOO...')).p === 2, 'ttt: middle row');
    check(tttWinner(B('X..X..X..')).p === 1, 'ttt: column');
    check(tttWinner(B('O...O...O')).p === 2, 'ttt: diagonal');
    check(tttWinner(B('..X.X.X..')).p === 1, 'ttt: anti-diagonal');
    check(tttWinner(B('XOXXOOOXX')) === null, 'ttt: a full board with no line');
    check(tttWinner(B('XX.O.O...')) === null, 'ttt: no winner yet');
    const empty = new Array(9).fill(0);
    check(tttValue(empty, 1) === 0, 'ttt: the empty board is not a draw');
    check(tttScores(empty, 1).every((v) => v === 0), 'ttt: some first move is not a draw');
    const mmEmpty = { nodes: 0 }; tttMinimax(empty.slice(), 1, mmEmpty);
    check(mmEmpty.nodes === 549946, 'ttt: minimax visited ' + mmEmpty.nodes + ' positions from the empty board, expected 549,946');
    const abEmpty = { nodes: 0 }; check(tttAlphaBeta(empty.slice(), 1, -INF, INF, abEmpty) === 0 && abEmpty.nodes < mmEmpty.nodes, 'ttt: alpha-beta on the empty board');
    check(tttBest(B('XX.OO....'), 1).join() === '2', 'ttt: X does not take the win');
    check(tttBest(B('XX.O.....'), 2).join() === '2', 'ttt: O does not block');
    // alpha-beta equals minimax on every position reachable in up to 4 moves
    const seen = new Set();
    const walk = (b, p, k) => {
      const key = b.join(''); if (seen.has(key)) return; seen.add(key);
      const m = { nodes: 0 }, a = { nodes: 0 };
      const vm = tttMinimax(b.slice(), p, m), va = tttAlphaBeta(b.slice(), p, -INF, INF, a);
      if (vm !== va || a.nodes > m.nodes) fails.push('ttt: alpha-beta and minimax disagree at ' + key);
      if (k === 0 || tttDone(b)) return;
      for (let i = 0; i < 9; i++) if (!b[i]) { b[i] = p; walk(b, 3 - p, k - 1); b[i] = 0; }
    };
    walk(empty.slice(), 1, 4);
    // the computer never loses: every possible line of the opponent, and every move the computer might choose among its best
    let games = 0, losses = 0;
    for (const aiP of [1, 2]) {
      const play = (b, p) => {
        const w = tttWinner(b);
        if (w || empties(b) === 0) { games++; if (w && w.p !== aiP) losses++; return; }
        const moves = p === aiP ? tttBest(b, p) : b.map((c, i) => (c ? -1 : i)).filter((i) => i >= 0);
        for (const i of moves) { b[i] = p; play(b, 3 - p); b[i] = 0; }
      };
      play(empty.slice(), 1);
    }
    check(losses === 0, 'ttt: the computer lost ' + losses + ' of ' + games + ' games');
    check(games > 1000, 'ttt: only ' + games + ' games played');

    // --- Connect Four
    const fromCols = (cols) => { const s = c4New(); for (const c of cols) c4Play(s, c); return s; };
    let s = c4New();
    check(c4Legal(s).length === 7, 'c4: a new board has 7 legal moves');
    for (let k = 0; k < 6; k++) c4Play(s, 0);
    check(c4Legal(s).join() === '1,2,3,4,5,6', 'c4: a full column is still legal');
    check(c4Play(s, 0) === -1 && c4Play(s, 7) === -1 && c4Play(s, -1) === -1, 'c4: played into a full or missing column');
    check(s.b[5 * 7] !== 0 && s.h[0] === 6 && s.n === 6, 'c4: discs do not stack');
    // horizontal: X at 0..3 on the bottom row (O on top of them)
    s = fromCols([0, 0, 1, 1, 2, 2, 3]);
    check(c4WinAt(s.b, 3) && c4WinLine(s.b).p === 1, 'c4: horizontal win not seen');
    s = fromCols([0, 0, 1, 1, 2, 2]);
    check(!c4WinLine(s.b) && !c4WinAt(s.b, 2), 'c4: three in a row counted as a win');
    // vertical
    s = fromCols([4, 5, 4, 5, 4, 5, 4]);
    check(c4WinAt(s.b, 3 * 7 + 4) && c4WinLine(s.b).p === 1, 'c4: vertical win not seen');
    // diagonal up-right: X at (0,0) (1,1) (2,2) (3,3)
    s = fromCols([0, 1, 1, 2, 2, 3, 2, 3, 3, 6, 3]);
    check(c4WinAt(s.b, 3 * 7 + 3) && c4WinLine(s.b) && c4WinLine(s.b).p === 1, 'c4: rising diagonal win not seen');
    // diagonal up-left: X at (0,6) (1,5) (2,4) (3,3)
    s = fromCols([6, 5, 5, 4, 4, 3, 4, 3, 3, 0, 3]);
    check(c4WinAt(s.b, 3 * 7 + 3) && c4WinLine(s.b) && c4WinLine(s.b).p === 1, 'c4: falling diagonal win not seen');
    // no wrap-around: bottom-row cells 4,5,6 and the next row's cell 0 are consecutive in the array but not in a line
    s = c4New(); [4, 5, 6].forEach((c) => { s.b[c] = 1; s.h[c] = 1; }); s.b[7] = 1; s.b[0] = 2; s.h[0] = 2; s.n = 5;
    check(!c4WinLine(s.b) && !c4WinAt(s.b, 7) && !c4WinAt(s.b, 6), 'c4: a line wrapped around the edge counted as a win');
    check(WINDOWS.length === 69, 'c4: expected 69 lines of four, found ' + WINDOWS.length);
    // takes an immediate win: X has 0,1,2 on the bottom row and is to move (O stacked on them)
    for (const d of [1, 2, 4, 6]) {
      const w = c4Search(fromCols([0, 0, 1, 1, 2, 2]), d);
      check(w.col === 3, 'c4: depth ' + d + ' did not take the horizontal win (played ' + w.col + ')');
      const v = c4Search(fromCols([6, 0, 6, 1, 6, 2]), d);   // X has 6,6,6 and O has 0,1,2: X should win at 6
      check(v.col === 6, 'c4: depth ' + d + ' did not take the vertical win (played ' + v.col + ')');
    }
    // blocks an immediate loss
    for (const d of [2, 3, 4, 6]) {
      const b1 = c4Search(fromCols([0, 6, 0, 5, 0]), d);   // X has three in column 0; O to move must play 0
      check(b1.col === 0, 'c4: depth ' + d + ' did not block the vertical threat (played ' + b1.col + ')');
      const b3 = c4Search(fromCols([0, 6, 1, 6, 2]), d);   // X on 0,1,2 bottom; only 3 completes it
      check(b3.col === 3, 'c4: depth ' + d + ' did not block at column 3 (played ' + b3.col + ')');
    }
    // alpha-beta gives the same root value as plain negamax, with fewer positions; move order does not change the value
    const rand = A.rng(2024);
    for (let k = 0; k < 12; k++) {
      const st = c4New(); const n = 4 + rand.int(10);
      for (let j = 0; j < n; j++) { const legal = c4Legal(st), c = legal[rand.int(legal.length)], i = c4Play(st, c); if (c4WinAt(st.b, i)) { c4Undo(st, c); break; } }
      const depth = 4, plain = { nodes: 0 };
      const vp = c4Plain(c4Clone(st), depth, 0, plain);
      const g = c4Root(c4Clone(st), depth, { nodes: 0, order: CENTRE_FIRST }, CENTRE_FIRST.slice()); let r; do r = g.next(); while (!r.done);
      const g2 = c4Root(c4Clone(st), depth, { nodes: 0, order: LEFT_TO_RIGHT }, LEFT_TO_RIGHT.slice()); let r2; do r2 = g2.next(); while (!r2.done);
      check(r.value.score === vp && r2.value.score === vp, 'c4: random position ' + k + ': alpha-beta ' + r.value.score + '/' + r2.value.score + ' vs plain ' + vp);
      const ab = c4Search(st, depth);
      check(ab.nodes < plain.nodes, 'c4: alpha-beta did not save work at position ' + k);
      check(ab.scores[ab.col] && ab.scores[ab.col].exact, 'c4: the chosen move’s score is not exact');
      const ex = c4Search(st, depth, { exactRoot: true });
      check(ex.score === ab.score && ex.nodes >= ab.nodes, 'c4: exact root scoring changed the result at position ' + k);
      const g3 = c4Root(c4Clone(st), depth, { nodes: 0, order: CENTRE_FIRST, exactRoot: true }, CENTRE_FIRST.slice()); let r3; do r3 = g3.next(); while (!r3.done);
      for (const c of c4Legal(st)) {   // each exact column score is the plain negamax value of that move
        const t = c4Clone(st), i = c4Play(t, c), pl = { nodes: 0 };
        const want = c4WinAt(t.b, i) ? WIN - 1 : t.n === C4W * C4H ? 0 : -c4Plain(t, depth - 1, 1, pl);
        check(r3.value.scores[c].v === want && r3.value.scores[c].exact, 'c4: column ' + c + ' scored ' + r3.value.scores[c].v + ', plain search says ' + want);
      }
    }
    // the search leaves the position as it found it
    const before = fromCols([3, 3, 2, 4]), copy = JSON.stringify(before); c4Search(before, 5);
    check(JSON.stringify(before) === copy, 'c4: the search changed the board it was given');

    // --- Nim: the XOR rule agrees with brute force, and its move always leaves a nim-sum of 0
    const memo = new Map();
    for (let a = 0; a <= 5; a++) for (let b = 0; b <= 5; b++) for (let c = 0; c <= 6; c++) {
      const h = [a, b, c], win = nimWinsBrute(h, memo);
      check(win === (nimSum(h) !== 0), 'nim: ' + h + ' brute force says ' + (win ? 'win' : 'loss'));
      if (win) { const m = nimMove(h); const g = h.slice(); g[m.heap] -= m.take; check(m.take >= 1 && m.take <= h[m.heap] && nimSum(g) === 0, 'nim: bad move from ' + h); }
      else if (a + b + c) { const m = nimMove(h); check(m.take === 1 && h[m.heap] >= 1, 'nim: illegal move from a lost position ' + h); }
    }
    return fails;
  }

  if (typeof module !== 'undefined') module.exports = { selfTest, makeTree, minimax, alphabeta, orderTree, minimalLeaves, treeSearch, leavesOf,
    tttWinner, tttMinimax, tttAlphaBeta, tttValue, tttScores, tttBest, tttCounts,
    c4New, c4Play, c4Undo, c4Legal, c4WinAt, c4WinLine, c4Evaluate, c4Search, nimSum, nimMove };
})();
