/* More interactive figures for SC 107 Data Structures and Algorithms, added to window.WIDGETS[name](mount, block, course) as in widgets.js,
   with its drawing helpers (window.WIDGET_KIT: sv, txt, mono, stepper). Loaded after widgets.js.
     dptable  lesson 15: the longest-common-subsequence table filled cell by cell, then the answer read back from the corner
     mst      lesson 16: Kruskal's algorithm with union-find (mode 'kruskal') or Prim's with a priority queue (mode 'prim'), on lesson 13's map with other lengths
     avl      lesson 17: insert into an AVL tree: the search, the heights and balance factors on the way back up, and each rotation
   The figures reuse the classes of widgets.js's own figures (fig-tools, fig-status, bst-*, gr-*), and colour only with the theme's variables,
   so that they follow the light and dark themes. */
(function () {
  'use strict';
  if (!window.WIDGETS || !window.WIDGET_KIT) return;
  const W = window.WIDGETS, { el } = window.__h, { sv, txt, mono, stepper } = window.WIDGET_KIT;
  const btn = (label, fn, cls) => el('button', { class: 'btn sm' + (cls ? ' ' + cls : ''), type: 'button', onclick: fn }, label);
  // a stepper whose steps can be replaced; Finish jumps to the end (shared by the three figures)
  function steps(host, render, interval) {
    let ctl = null, list = [];
    const finish = btn('Finish', () => { if (ctl) ctl.set(list.length - 1); }, 'quiet');
    const box = el('div', { class: 'fig-tools' });
    host.append(box);
    return {
      show(next) { list = next; if (ctl) { ctl.stop(); ctl.el.remove(); } ctl = stepper(list.length, (i) => render(list[i], i, list), { interval }); box.replaceChildren(ctl.el, finish); ctl.el.setAttribute('aria-label', 'step through'); },
      get list() { return list; }
    };
  }

  /* ---------- the longest common subsequence, as a table filled cell by cell (SC 107 lesson 15) ---------- */
  W.dptable = function (mount, b) {
    const MAX = 10, CELL = 30, PAD = 46;
    const clean = (s, d) => { const t = String(s || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, MAX); return t || d; };
    let x = clean(b.x, 'HUMAN'), y = clean(b.y, 'CHIMPANZEE');
    const inX = el('input', { type: 'text', value: x, maxlength: String(MAX), size: '11', 'aria-label': 'first word (rows), up to ' + MAX + ' letters' });
    const inY = el('input', { type: 'text', value: y, maxlength: String(MAX), size: '11', 'aria-label': 'second word (columns), up to ' + MAX + ' letters' });
    const svg = sv('svg', { class: 'bst-svg', role: 'img', 'aria-label': 'A table of the longest common subsequence' });
    const msg = el('div', { class: 'fig-status', role: 'status', 'aria-live': 'polite' });
    const stats = el('div', { class: 'bst-stats' });

    function build() {
      const m = x.length, n = y.length, L = [];
      for (let i = 0; i <= m; i++) L.push(new Array(n + 1).fill(null));
      for (let i = 0; i <= m; i++) L[i][0] = 0;
      for (let j = 0; j <= n; j++) L[0][j] = 0;
      const snap = (o) => Object.assign({ L: L.map((r) => r.slice()), path: [], word: '' }, o);
      const list = [snap({ msg: 'Row 0 and column 0 are the empty word: it has nothing in common with anything, so they are all 0. Step to fill the table row by row, left to right.' })];
      for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
        const a = x[i - 1], c = y[j - 1];
        if (a === c) {
          L[i][j] = L[i - 1][j - 1] + 1;
          list.push(snap({ cur: [i, j], from: [[i - 1, j - 1]], same: true, msg: 'Row ' + a + ', column ' + c + ': the same letter. One more than the cell up and to the left: ' + L[i - 1][j - 1] + ' + 1 = ' + L[i][j] + '.' }));
        } else {
          const up = L[i - 1][j], left = L[i][j - 1];
          L[i][j] = Math.max(up, left);
          list.push(snap({ cur: [i, j], from: [[i - 1, j], [i, j - 1]], msg: 'Row ' + a + ', column ' + c + ': different letters. Drop one of them: the larger of the cell above (' + up + ') and the cell to the left (' + left + ') is ' + L[i][j] + '.' }));
        }
      }
      // read the answer back from the bottom-right corner
      let i = m, j = n, word = '';
      const path = [[i, j]];
      list.push(snap({ path: path.slice(), word, msg: 'The table is full. The bottom-right cell, ' + L[m][n] + ', is the length of the longest common subsequence of ' + x + ' and ' + y + '. To find the letters, walk back from that corner to where each number came from.' }));
      while (i > 0 && j > 0) {
        if (x[i - 1] === y[j - 1]) {
          word = x[i - 1] + word; i--; j--; path.push([i, j]);
          list.push(snap({ path: path.slice(), word, taken: [i + 1, j + 1], msg: 'Both words have ' + x[i] + ' here: it is in the answer. Go diagonally up to the left. Letters so far (each new one goes in front): ' + word + '.' }));
        } else if (L[i - 1][j] >= L[i][j - 1]) {
          i--; path.push([i, j]);
          list.push(snap({ path: path.slice(), word, msg: 'Different letters, and the cell above holds ' + L[i][j] + ', at least as much as the cell to the left: the number came from above. Go up.' }));
        } else {
          j--; path.push([i, j]);
          list.push(snap({ path: path.slice(), word, msg: 'Different letters, and the cell to the left holds more (' + L[i][j] + '): go left.' }));
        }
      }
      list.push(snap({ path: path.slice(), word, done: true, msg: (word ? 'Reached the edge. The answer is ' + word + ', ' + word.length + (word.length === 1 ? ' letter' : ' letters') + ': it appears, in order, in both words.' : 'Reached the edge. The words have no letter in common: the answer is the empty word.') + ' The table had ' + (m + 1) * (n + 1) + ' cells and each took one step: O(m × n).' }));
      return list;
    }

    function render(s) {
      const m = x.length, n = y.length, Wd = PAD + (n + 1) * CELL + 8, Ht = PAD + (m + 1) * CELL + 8;
      svg.setAttribute('viewBox', '0 0 ' + Wd + ' ' + Ht);
      svg.replaceChildren();
      const cx = (j) => PAD + j * CELL, cy = (i) => PAD + i * CELL;
      const onPath = new Set(s.path.map(([i, j]) => i + ',' + j)), from = new Set((s.from || []).map(([i, j]) => i + ',' + j));
      // the letters: the second word across the top, the first down the left; the letters of the current cell are marked
      for (let j = 0; j <= n; j++) {
        const hot = s.cur && s.cur[1] === j, letter = j ? y[j - 1] : '–';
        svg.append(mono(cx(j) + CELL / 2, PAD - 22, letter, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: hot ? 'var(--accent)' : 'var(--ink)', 'text-decoration': hot ? 'underline' : null }));
        svg.append(mono(cx(j) + CELL / 2, PAD - 8, String(j), { 'text-anchor': 'middle', 'font-size': 9, fill: 'var(--ink-3)' }));
      }
      for (let i = 0; i <= m; i++) {
        const hot = s.cur && s.cur[0] === i, letter = i ? x[i - 1] : '–';
        svg.append(mono(PAD - 26, cy(i) + CELL / 2 + 5, letter, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: hot ? 'var(--accent)' : 'var(--ink)', 'text-decoration': hot ? 'underline' : null }));
        svg.append(mono(PAD - 8, cy(i) + CELL / 2 + 4, String(i), { 'text-anchor': 'middle', 'font-size': 9, fill: 'var(--ink-3)' }));
      }
      for (let i = 0; i <= m; i++) for (let j = 0; j <= n; j++) {
        const k = i + ',' + j, isCur = s.cur && s.cur[0] === i && s.cur[1] === j, isFrom = from.has(k), path = onPath.has(k);
        const taken = s.taken && s.taken[0] === i && s.taken[1] === j || (path && i > 0 && j > 0 && x[i - 1] === y[j - 1] && s.path.some(([a, c]) => a === i - 1 && c === j - 1));
        const fill = isCur ? 'var(--accent)' : taken ? 'var(--ok-soft)' : isFrom ? 'var(--accent-soft)' : path ? 'var(--paper-2)' : 'var(--paper)';
        svg.append(sv('rect', { x: cx(j), y: cy(i), width: CELL, height: CELL, fill, stroke: isCur ? 'var(--ink)' : isFrom ? 'var(--accent)' : path ? 'var(--ink)' : 'var(--rule)', 'stroke-width': isCur || isFrom || path ? 2 : 1 }));
        const v = s.L[i][j];
        if (v !== null) svg.append(mono(cx(j) + CELL / 2, cy(i) + CELL / 2 + 5, String(v), { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': taken || isCur ? 700 : 400, fill: isCur ? 'var(--accent-ink)' : (i === 0 || j === 0) ? 'var(--ink-3)' : 'var(--ink)' }));
      }
      if (s.cur && s.same) { const [i, j] = s.cur; svg.append(sv('line', { x1: cx(j) + 6, y1: cy(i) + 6, x2: cx(j) - 6, y2: cy(i) - 6, stroke: 'var(--ok)', 'stroke-width': 2.5, 'stroke-linecap': 'round' })); }
      msg.textContent = s.msg;
      stats.textContent = s.done ? 'answer: ' + (s.word || '(the empty word)') : s.path.length ? 'answer so far, found from the end backwards: ' + (s.word || '(none yet)') : 'rows: ' + x + ' · columns: ' + y;
      svg.setAttribute('aria-label', 'Longest common subsequence table, ' + x + ' down the side and ' + y + ' across the top. ' + s.msg);
    }
    mount.append(el('div', { class: 'fig-tools' }, el('label', {}, 'rows ', inX), el('label', {}, 'columns ', inY), btn('Use these words', use, 'primary')),
      el('div', { class: 'fig-scroll bst-wrap' }, svg), stats, msg);
    const ctl = steps(mount, render, 500);
    function use() { x = clean(inX.value, x); y = clean(inY.value, y); inX.value = x; inY.value = y; ctl.show(build()); }
    for (const inp of [inX, inY]) inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); use(); } });
    ctl.show(build());
  };

  /* ---------- minimum spanning tree on eight villages (lesson 13's map with other lengths): Kruskal with union-find, or Prim with a priority queue (SC 107 lesson 16) ---------- */
  W.mst = function (mount, b) {
    const mode = b.mode === 'prim' ? 'prim' : 'kruskal';
    const N = 'ABCDEFGH', R = 17;
    const pos = [[40, 125], [120, 45], [120, 205], [230, 75], [230, 185], [340, 95], [340, 200], [450, 150]];
    const E = [[0, 1, 2], [0, 2, 3], [1, 3, 3], [2, 3, 1], [2, 4, 6], [3, 5, 7], [4, 5, 2], [4, 6, 4], [5, 7, 4], [6, 7, 5]];   // lesson 13's map with other lengths, so that Kruskal meets loops
    const name = (e) => N[e[0]] + '–' + N[e[1]] + ' ' + e[2];
    const list = [];

    function kruskal() {
      const order = E.map((e, k) => k).sort((p, q) => E[p][2] - E[q][2] || p - q);   // a stable sort: equal lengths keep the map's order
      const parent = [0, 1, 2, 3, 4, 5, 6, 7], size = new Array(8).fill(1), state = new Array(E.length).fill('');
      let total = 0, built = 0;
      const find = (v) => { if (parent[v] !== v) parent[v] = find(parent[v]); return parent[v]; };
      const snap = (cur, msg) => list.push({ cur, msg, state: state.slice(), parent: parent.slice(), total, built, chips: order.map((k) => ({ t: name(E[k]), s: state[k], hot: k === cur })) });
      snap(-1, 'Sort the roads by cost, cheapest first (the list on the right). Every village starts in a group of its own: each is its own parent.');
      for (const k of order) {
        if (built === 7) { state[k] = 'left'; continue; }
        const [a, c, w] = E[k];
        const chain = (v) => { const out = [v]; while (parent[out[out.length - 1]] !== out[out.length - 1]) out.push(parent[out[out.length - 1]]); return out; };
        const long = [chain(a), chain(c)].filter((ch) => ch.length > 2).map((ch) => ' find(' + N[ch[0]] + ') climbs ' + ch.map((v) => N[v]).join(' → ') + ', and path compression then points ' + N[ch[0]] + ' straight at ' + N[ch[ch.length - 1]] + '.').join('');
        const ra = find(a), rc = find(c);
        if (ra === rc) {
          state[k] = 'skip';
          snap(k, N[a] + '–' + N[c] + ' (' + w + '): find(' + N[a] + ') and find(' + N[c] + ') are both ' + N[ra] + '.' + long + ' The two villages are already joined, so this road would close a loop. Skip it.');
        } else {
          let big = ra, small = rc;
          if (size[big] < size[small]) { big = rc; small = ra; }
          const why = size[big] === size[small] ? 'the groups are the same size, so either root may go on top' : 'the smaller group goes under the larger';
          parent[small] = big; size[big] += size[small]; total += w; built++; state[k] = 'take';
          snap(k, N[a] + '–' + N[c] + ' (' + w + '): find(' + N[a] + ') = ' + N[ra] + ' and find(' + N[c] + ') = ' + N[rc] + ', different groups.' + long + ' Build it, and union: the root ' + N[small] + ' now points at ' + N[big] + ' (' + why + '). Roads built: ' + built + ', total ' + total + '.');
        }
      }
      snap(-1, 'Seven roads join all eight villages: a spanning tree has one road fewer than it has villages, so Kruskal can stop. Total cost ' + total + ', the least possible. The roads still on the list were never needed.');
    }

    function prim() {
      const inTree = new Array(8).fill(false), state = new Array(E.length).fill('');
      let pq = [], total = 0, built = 0, order = '';
      const adj = N.split('').map(() => []);
      E.forEach(([a, c, w], k) => { adj[a].push([c, w, k]); adj[c].push([a, w, k]); });
      adj.forEach((l) => l.sort((p, q) => p[0] - q[0]));
      const snap = (cur, msg) => list.push({ cur, msg, state: state.slice(), inTree: inTree.slice(), total, built, order, chips: pq.slice().sort((p, q) => p.w - q.w || p.k - q.k).map((e) => ({ t: N[e.from] + '–' + N[e.to] + ' ' + e.w, hot: false })) });
      const join = (v) => { inTree[v] = true; order += N[v]; for (const [w, wt, k] of adj[v]) if (!inTree[w]) pq.push({ from: v, to: w, w: wt, k }); };
      join(0);
      snap(-1, 'Start with village A alone in the tree. Every road from A to a village outside the tree goes into the priority queue: A–B 2 and A–C 3.');
      while (pq.length && built < 7) {
        pq.sort((p, q) => p.w - q.w || p.k - q.k);
        const e = pq.shift();
        if (inTree[e.to]) { state[e.k] = 'skip'; snap(e.k, 'Take the shortest road in the queue, ' + N[e.from] + '–' + N[e.to] + ' ' + e.w + '. But ' + N[e.to] + ' joined the tree after this road was queued: it would close a loop. Throw it away.'); continue; }
        state[e.k] = 'take'; total += e.w; built++;
        join(e.to);
        snap(e.k, 'Take the shortest road in the queue, ' + N[e.from] + '–' + N[e.to] + ' ' + e.w + '. ' + N[e.to] + ' is outside the tree, so build it: ' + N[e.to] + ' joins the tree, and its roads to villages still outside go into the queue. Total ' + total + '.');
      }
      snap(-1, 'All eight villages are in the tree, joined by seven roads of total cost ' + total + ': the same total as Kruskal, and here the very same roads, found in a different order. ' + (pq.length ? 'The roads left in the queue are never looked at.' : ''));
    }
    (mode === 'kruskal' ? kruskal : prim)();

    const svg = sv('svg', { class: 'gr-svg', viewBox: '0 0 490 250', role: 'img', 'aria-label': 'A map of eight villages and ten roads' });
    const chipRow = el('div', { class: 'gr-chips' }), extraRow = el('div', { class: 'gr-chips' });
    const msg = el('div', { class: 'fig-status gr-msg', role: 'status', 'aria-live': 'polite' });
    const sum = el('div', { class: 'bst-stats' });
    function render(s) {
      svg.replaceChildren();
      E.forEach(([a, c], k) => {
        const st = s.state[k], hot = k === s.cur;
        svg.append(sv('line', { x1: pos[a][0], y1: pos[a][1], x2: pos[c][0], y2: pos[c][1], stroke: hot ? 'var(--ink)' : st === 'take' ? 'var(--accent)' : 'var(--rule)', 'stroke-width': hot ? 4.5 : st === 'take' ? 4 : 1.8, 'stroke-dasharray': st === 'skip' ? '6 4' : null, 'stroke-linecap': 'round' }));
      });
      E.forEach(([a, c, w]) => {
        const x = (pos[a][0] + pos[c][0]) / 2, y = (pos[a][1] + pos[c][1]) / 2;
        svg.append(sv('rect', { x: x - 9, y: y - 9, width: 18, height: 17, rx: 3, fill: 'var(--paper)', stroke: 'var(--rule)' }), mono(x, y + 4, String(w), { 'text-anchor': 'middle', 'font-size': 12 }));
      });
      for (let v = 0; v < 8; v++) {
        const [x, y] = pos[v];
        const dark = mode === 'prim' ? s.inTree[v] : false;
        svg.append(sv('circle', { cx: x, cy: y, r: R, fill: dark ? 'var(--accent)' : 'var(--paper-2)', stroke: s.cur >= 0 && (E[s.cur][0] === v || E[s.cur][1] === v) ? 'var(--ink)' : 'var(--accent)', 'stroke-width': s.cur >= 0 && (E[s.cur][0] === v || E[s.cur][1] === v) ? 3.5 : 1.8 }));
        svg.append(txt(x, y + 5, N[v], { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: dark ? 'var(--accent-ink)' : 'var(--ink)' }));
        if (mode === 'kruskal') {   // under each village: its parent in the union-find forest (a root points at itself)
          const p = s.parent[v];
          svg.append(mono(x, y + R + 14, p === v ? 'root' : '→' + N[p], { 'text-anchor': 'middle', 'font-size': 11, 'font-weight': p === v ? 700 : 400, fill: p === v ? 'var(--ink)' : 'var(--ink-2)' }));
        }
      }
      chipRow.replaceChildren(...(s.chips.length ? s.chips.map((c) => el('span', { class: 'gr-chip' + (c.hot ? ' gr-next' : c.s === 'skip' || c.s === 'left' ? ' gr-empty' : ''), style: c.s === 'skip' ? 'text-decoration: line-through' : null }, c.t + (c.s === 'take' ? ' ✓' : ''))) : [el('span', { class: 'gr-chip gr-empty' }, 'empty')]));
      if (mode === 'kruskal') extraRow.replaceChildren(...s.parent.map((p, v) => el('span', { class: 'gr-chip' + (p === v ? ' gr-next' : '') }, N[v] + '→' + N[p])));
      else extraRow.replaceChildren(el('span', { class: 'gr-chip' }, s.order.split('').join(' ')));
      msg.textContent = s.msg;
      sum.textContent = 'roads built: ' + s.built + ' of 7 · total cost: ' + s.total;
      svg.setAttribute('aria-label', 'Map of eight villages and ten roads. ' + s.msg);
    }
    const lab1 = mode === 'kruskal' ? 'roads, cheapest first (✓ built, struck out: would close a loop)' : 'priority queue: roads out of the tree, cheapest first';
    const lab2 = mode === 'kruskal' ? 'parent array (a root points at itself)' : 'villages in the tree, in the order they joined';
    const key = mode === 'kruskal' ? 'Heavy lines: roads built. Dashed: a road skipped because it would close a loop. Under each village: its parent in the union-find forest.' : 'Dark villages: in the tree. Heavy lines: roads built. Dashed: a road thrown away because both its villages were already in the tree.';
    mount.append(el('div', { class: 'gr-wrap' }, el('div', { class: 'gr-left fig-scroll' }, svg),
      el('div', { class: 'gr-side' }, el('div', { class: 'gr-lab' }, lab1), chipRow, el('div', { class: 'gr-lab' }, lab2), extraRow)),
    el('p', { class: 'gr-key' }, key), sum, msg);
    steps(mount, render, 1300).show(list);
  };

  /* ---------- an AVL tree: insert, walk back up fixing heights, and rotate where a node is out of balance (SC 107 lesson 17) ---------- */
  W.avl = function (mount, b) {
    const MAXN = 15, DX = 36, DY = 50, PAD = 28, R = 15;
    const sign = (f) => (f > 0 ? '+' + f : f < 0 ? '−' + (-f) : '0'), h = (t) => (t ? t.h : 0), fix = (t) => { t.h = 1 + Math.max(h(t.l), h(t.r)); }, bf = (t) => h(t.l) - h(t.r);
    const clone = (t) => (t ? { key: t.key, h: t.h, l: clone(t.l), r: clone(t.r) } : null);
    const inorder = (t, out) => { if (t) { inorder(t.l, out); out.push(t.key); inorder(t.r, out); } return out; };
    const count = (t) => (t ? 1 + count(t.l) + count(t.r) : 0);
    const rotR = (y) => { const x = y.l; y.l = x.r; x.r = y; fix(y); fix(x); return x; };
    const rotL = (x) => { const y = x.r; x.r = y.l; y.l = x; fix(x); fix(y); return y; };
    let root = null, keys = [];
    const start = (b.keys || []).filter((k, i, a) => Number.isInteger(k) && k >= 1 && k <= 99 && a.indexOf(k) === i).slice(0, MAXN);

    /* insert key into the tree at `root`, recording frames; returns the new root */
    function insertFrames(key) {
      const fr = [], snap = (o) => fr.push(Object.assign({ root: clone(root) }, o));
      if (!root) { root = { key, h: 1, l: null, r: null }; snap({ nu: key, msg: 'The tree is empty, so ' + key + ' becomes the root, with height 1.' }); return fr; }
      const path = []; let c = root;
      while (c) {
        path.push(c);
        if (key === c.key) { snap({ cur: key, msg: key + ' is already in the tree: a search tree holds each key once. Nothing changes.' }); return fr; }
        snap({ cur: c.key, seen: path.slice(0, -1).map((n) => n.key), msg: 'Compare ' + key + ' with ' + c.key + ': ' + (key < c.key ? 'smaller, go left.' : 'larger, go right.') });
        c = key < c.key ? c.l : c.r;
      }
      const leaf = { key, h: 1, l: null, r: null }, last = path[path.length - 1];
      if (key < last.key) last.l = leaf; else last.r = leaf;
      snap({ nu: key, msg: 'The link is empty: ' + key + ' goes there as a new leaf, as in any search tree. Now walk back up the path, updating each height and checking each balance.' });
      for (let k = path.length - 1; k >= 0; k--) {
        const t = path[k], parent = k ? path[k - 1] : null;
        fix(t);
        const f = bf(t);
        if (Math.abs(f) <= 1) { snap({ cur: t.key, msg: t.key + ': left height ' + h(t.l) + ', right height ' + h(t.r) + ', balance ' + sign(f) + '. Within one: fine. Its height is now ' + t.h + '.' }); continue; }
        const left = f > 0, child = left ? t.l : t.r, outer = left ? key < child.key : key > child.key;
        const cas = left ? (outer ? 'left-left' : 'left-right') : (outer ? 'right-right' : 'right-left');
        snap({ cur: t.key, bad: t.key, msg: t.key + ': left height ' + h(t.l) + ', right height ' + h(t.r) + ', balance ' + sign(f) + '. Out of balance! The new key went ' + cas.replace('-', ' then ') + ' of ' + t.key + ': the ' + cas + ' case, which needs ' + (outer ? 'one rotation.' : 'two rotations.') });
        let sub = t;
        const hang = (s) => { if (!parent) root = s; else if (parent.l === t) parent.l = s; else parent.r = s; };
        if (!outer) {
          const kid = child;
          if (left) t.l = rotL(kid); else t.r = rotR(kid);
          snap({ cur: (left ? t.l : t.r).key, bad: t.key, msg: 'First rotate ' + (left ? 'left' : 'right') + ' at ' + kid.key + ': ' + (left ? t.l : t.r).key + ' moves up in its place. Now the extra height is on the outside, a ' + (left ? 'left-left' : 'right-right') + ' shape.' });
        }
        sub = left ? rotR(t) : rotL(t);
        hang(sub);
        snap({ cur: sub.key, nu: null, msg: 'Rotate ' + (left ? 'right' : 'left') + ' at ' + t.key + ': ' + sub.key + ' moves up and ' + t.key + ' goes down to its ' + (left ? 'right' : 'left') + '. The keys still read ' + inorder(root, []).join(' ') + ' in order, and ' + sub.key + '’s subtree is as tall as before the insert, so nothing above it can be out of balance: stop.' });
        break;
      }
      const n = count(root);
      snap({ msg: 'Done: ' + n + (n === 1 ? ' key' : ' keys') + ', height ' + h(root) + '. Every node’s two subtrees differ in height by at most one.' });
      return fr;
    }

    const svg = sv('svg', { class: 'bst-svg', viewBox: '0 0 300 120', role: 'img', 'aria-label': 'An AVL tree' });
    const msg = el('div', { class: 'fig-status', role: 'status', 'aria-live': 'polite' });
    const stats = el('div', { class: 'bst-stats' });
    const num = el('input', { type: 'number', value: '4', min: '1', max: '99', 'aria-label': 'key, 1 to 99', onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); doInsert(); } } });

    function render(s) {
      const t0 = s.root, nodes = []; let ix = 0;
      (function go(t, d) { if (!t) return; go(t.l, d + 1); t.ix = ix++; t.d = d; nodes.push(t); go(t.r, d + 1); })(t0, 0);
      (function real(t) { if (t) { real(t.l); real(t.r); fix(t); } })(t0);   // the true heights, for the picture (the walk up updates them one by one)
      const H = h(t0), cols = Math.max(nodes.length, 6), W2 = PAD * 2 + (cols - 1) * DX, H2 = PAD * 2 + (Math.max(H, 3) - 1) * DY + 18;
      const X = (t) => PAD + t.ix * DX + (cols - nodes.length) * DX / 2, Y = (t) => PAD + 10 + t.d * DY;
      svg.setAttribute('viewBox', '0 0 ' + W2 + ' ' + H2);
      svg.replaceChildren();
      const seen = new Set(s.seen || []);
      for (const t of nodes) for (const c of [t.l, t.r]) if (c) svg.append(sv('line', { class: 'bst-edge' + (seen.has(t.key) && (seen.has(c.key) || s.cur === c.key) ? ' bst-on' : ''), x1: X(t), y1: Y(t), x2: X(c), y2: Y(c) }));
      for (const t of nodes) {
        const f = bf(t), cls = 'bst-node' + (s.cur === t.key ? ' bst-cur' : '') + (s.nu === t.key ? ' bst-new' : '') + (seen.has(t.key) ? ' bst-seen' : '');
        const g = sv('g', { class: cls }, sv('circle', { cx: X(t), cy: Y(t), r: R }), sv('text', { x: X(t), y: Y(t) + 4.5, 'text-anchor': 'middle' }, String(t.key)));
        svg.append(g);
        if (s.bad === t.key) svg.append(sv('circle', { cx: X(t), cy: Y(t), r: R + 5, fill: 'none', stroke: 'var(--err)', 'stroke-width': 2.5, 'stroke-dasharray': '4 3' }));
        svg.append(mono(X(t) + R + 2, Y(t) - R + 2, sign(f), { 'font-size': 10, 'font-weight': Math.abs(f) > 1 ? 700 : 400, fill: Math.abs(f) > 1 ? 'var(--err)' : 'var(--ink-3)' }));
      }
      if (!nodes.length) svg.append(sv('text', { class: 'bst-nulltxt', x: W2 / 2, y: H2 / 2, 'text-anchor': 'middle' }, 'empty tree (root is null)'));
      svg.append(sv('text', { class: 'bst-h', x: W2 - 6, y: 14, 'text-anchor': 'end' }, 'height ' + H));
      const n = nodes.length;
      stats.textContent = n + (n === 1 ? ' key' : ' keys') + ', height ' + H + (n ? '. The small number beside each node is its balance: the height of its left subtree minus the height of its right.' : '');
      msg.textContent = s.msg;
      svg.setAttribute('aria-label', n ? 'AVL tree of ' + n + (n === 1 ? ' key' : ' keys') + ', height ' + H + ', root ' + t0.key + '. In order: ' + inorder(t0, []).join(' ') + '. ' + s.msg : 'An empty tree.');
    }
    mount.append(el('div', { class: 'fig-tools' }, el('label', {}, 'key ', num), btn('Insert', doInsert, 'primary')),
      el('div', { class: 'fig-scroll bst-wrap' }, svg), stats, msg);
    const ctl = steps(mount, render, 1100);
    function doInsert() {
      const k = Number(num.value);
      if (!Number.isInteger(k) || k < 1 || k > 99 || num.value.trim() === '') return ctl.show([{ root: clone(root), msg: 'Type a whole number from 1 to 99.' }]);
      if (count(root) >= MAXN && !inorder(root, []).includes(k)) return ctl.show([{ root: clone(root), msg: 'The figure holds at most ' + MAXN + ' keys. Load another tree, or Clear.' }]);
      keys.push(k);
      ctl.show(insertFrames(k));
      const next = (k % 99) + 1; num.value = String(next);
    }
    function load(ks, what) {   // insert the keys without showing the steps, then show the result
      root = null; keys = [];
      for (const k of ks) { insertFrames(k); keys.push(k); }
      ctl.show([{ root: clone(root), msg: ks.length ? what + ': ' + ks.join(', ') + ', inserted in that order. Insert another key and step through what happens.' : 'An empty tree. Insert a key: it becomes the root.' }]);
    }
    const random = () => { const pool = []; for (let k = 1; k <= 99; k++) pool.push(k); const out = []; while (out.length < 9) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]); return out; };
    mount.append(el('div', { class: 'fig-tools' }, el('span', { class: 'bst-lbl' }, 'load'),
      btn('1, 2, 3', () => { load([1, 2], 'Keys'); num.value = '3'; }, 'quiet'),
      btn('3, 1, 2', () => { load([3, 1], 'Keys'); num.value = '2'; }, 'quiet'),
      btn('Sorted 1–7', () => load([1, 2, 3, 4, 5, 6, 7], 'Sorted keys'), 'quiet'),
      btn('Random', () => load(random(), 'Random keys'), 'quiet'),
      btn('Clear', () => load([], 'Empty tree'), 'quiet')));
    if (start.length) load(start, 'Keys'); else load([], 'Empty tree');
    if (b.next) num.value = String(b.next);
  };
})();
