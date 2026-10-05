/* Algorithms in motion: sorting. Two demonstrations, registered with ALGOS (src/algos.js):
   - 'sorting': one algorithm at a time on up to 1000 values, drawn as bars, rainbow bars, dots or a colour wheel, with live counts
     (comparisons, swaps, writes, array accesses), an optional sound that follows the values, and a green sweep when it is done;
   - 'sort-race': up to four algorithms on copies of the same input, one operation each per tick, to see n² against n log n.
   The sorts themselves are pure generators (no DOM): each takes an array, sorts it in place and yields what it does, as events
     {type: 'compare', i, j}            two cells were compared (held: true when j is only where a held value would go)
     {type: 'swap', i, j}               two cells exchanged
     {type: 'write', i, value}          a value was written into a cell (from a held value, a scratch array or another cell)
     {type: 'read', i}                  a cell was read (radix sort's counting pass)
     {type: 'pivot', i}                 the pivot of the current partition is at i
     {type: 'mark-sorted', i, to?}      cells i..to (inclusive; to defaults to i) hold their final values
     {type: 'aux', lo, hi}              cells lo..hi-1 were copied to a scratch array (merge sort)
   and optionally acc: the number of reads and writes of the array the event stands for, when it differs from the default for its
   type. Whoever watches applies swaps and writes to its own copy of the input; selfTest() checks that this copy ends sorted. */
(function () {
  const A = (typeof window !== 'undefined' && window.ALGOS) || require('./algos.js');

  // ---------- the sorts (pure)
  const C = (i, j, acc) => (acc == null ? { type: 'compare', i, j } : { type: 'compare', i, j, acc });
  const S = (i, j) => ({ type: 'swap', i, j });
  const W = (i, value, acc) => (acc == null ? { type: 'write', i, value } : { type: 'write', i, value, acc });
  const M = (i, to) => (to == null || to === i ? { type: 'mark-sorted', i } : { type: 'mark-sorted', i, to });
  const sw = (a, i, j) => { const t = a[i]; a[i] = a[j]; a[j] = t; };

  function* bubble(a) {
    const n = a.length;
    for (let end = n - 1; end > 0; end--) {
      let swapped = false;
      for (let j = 0; j < end; j++) {
        yield C(j, j + 1);
        if (a[j] > a[j + 1]) { sw(a, j, j + 1); yield S(j, j + 1); swapped = true; }
      }
      if (!swapped) { yield M(0, end); return; }   // a pass with no swap: everything left is in order
      yield M(end);
    }
    if (n) yield M(0);
  }

  function* cocktail(a) {
    let lo = 0, hi = a.length - 1;
    while (lo < hi) {
      let last = lo;
      for (let j = lo; j < hi; j++) { yield C(j, j + 1); if (a[j] > a[j + 1]) { sw(a, j, j + 1); yield S(j, j + 1); last = j; } }
      yield M(last + 1, hi); hi = last;
      if (lo >= hi) break;
      last = hi;
      for (let j = hi; j > lo; j--) { yield C(j - 1, j); if (a[j - 1] > a[j]) { sw(a, j - 1, j); yield S(j - 1, j); last = j; } }
      yield M(lo, last - 1); lo = last;
    }
    if (a.length) yield M(Math.max(0, lo), Math.max(0, lo));
  }

  function* selection(a) {
    const n = a.length;
    for (let i = 0; i < n - 1; i++) {
      let min = i;
      for (let j = i + 1; j < n; j++) { yield C(j, min); if (a[j] < a[min]) min = j; }
      if (min !== i) { sw(a, i, min); yield S(i, min); }
      yield M(i);
    }
    if (n) yield M(n - 1);
  }

  // insertion sort as lesson 3 writes it: hold a[i], shift larger values right with single moves, drop the value into the hole
  function* insertion(a) { yield* gappedInsertion(a, [1]); }
  function* gappedInsertion(a, gaps) {
    const n = a.length;
    for (const g of gaps) {
      for (let i = g; i < n; i++) {
        const v = a[i]; let j = i;
        while (j >= g) {
          yield C(j - g, j, 1);   // a[j - g] against the held value (one read)
          if (a[j - g] > v) { a[j] = a[j - g]; yield W(j, a[j], 2); j -= g; } else break;
        }
        if (j !== i) { a[j] = v; yield W(j, v); }
      }
    }
    if (n) yield M(0, n - 1);   // nothing is final until the last pass ends
  }
  // Shell sort with Ciura's gaps (2001), extended by a factor of 2.25 for larger arrays
  function shellGaps(n) {
    const g = [1, 4, 10, 23, 57, 132, 301, 701];
    while (g[g.length - 1] * 2.25 < n) g.push(Math.floor(g[g.length - 1] * 2.25));
    return g.filter((x) => x < Math.max(2, n)).reverse();
  }
  function* shell(a) { yield* gappedInsertion(a, shellGaps(a.length)); }

  function* comb(a) {
    const n = a.length; let gap = n, sorted = false;
    while (!sorted) {
      gap = Math.floor(gap / 1.3); if (gap <= 1) { gap = 1; sorted = true; }
      for (let i = 0; i + gap < n; i++) {
        yield C(i, i + gap);
        if (a[i] > a[i + gap]) { sw(a, i, i + gap); yield S(i, i + gap); sorted = false; }
      }
    }
    if (n) yield M(0, n - 1);
  }

  // top-down merge sort, as in lesson 4: copy the run to aux, merge back taking from the left on ties (stable)
  function* merge(a) {
    const aux = a.slice();
    function* sort(lo, hi) {   // a[lo..hi-1]
      if (hi - lo < 2) return;
      const mid = (lo + hi) >>> 1;
      yield* sort(lo, mid); yield* sort(mid, hi);
      for (let k = lo; k < hi; k++) aux[k] = a[k];
      yield { type: 'aux', lo, hi, acc: hi - lo };
      let i = lo, j = mid;
      for (let k = lo; k < hi; k++) {
        if (i >= mid) { a[k] = aux[j++]; }
        else if (j >= hi) { a[k] = aux[i++]; }
        else { yield C(i, j, 0); a[k] = aux[j] < aux[i] ? aux[j++] : aux[i++]; }   // compared in aux: no reads of a
        yield W(k, a[k]);
      }
    }
    yield* sort(0, a.length);
    if (a.length) yield M(0, a.length - 1);   // nothing is final until the last merge ends
  }

  // quicksort with Lomuto's partition, last value as pivot (lesson 4); an explicit stack, so a sorted input of 1000 is no problem
  function* quickLomuto(a) {
    const st = [[0, a.length - 1]];
    while (st.length) {
      const [lo, hi] = st.pop();
      if (lo > hi) continue;
      if (lo === hi) { yield M(lo); continue; }
      yield { type: 'pivot', i: hi };
      const p = a[hi]; let i = lo;
      for (let j = lo; j < hi; j++) {
        yield C(j, hi);
        if (a[j] < p) { if (i !== j) { sw(a, i, j); yield S(i, j); } i++; }
      }
      if (i !== hi) { sw(a, i, hi); yield S(i, hi); }
      yield M(i);
      st.push([i + 1, hi], [lo, i - 1]);
    }
  }
  // quicksort with Hoare's partition, middle value as pivot: two fingers walk in from both ends and swap misplaced pairs
  function* quickHoare(a) {
    const st = [[0, a.length - 1]];
    while (st.length) {
      const [lo, hi] = st.pop();
      if (lo > hi) continue;
      if (lo === hi) { yield M(lo); continue; }
      let pi = (lo + hi) >>> 1; const p = a[pi];
      yield { type: 'pivot', i: pi };
      let i = lo - 1, j = hi + 1, cut;
      for (;;) {
        do { i++; yield C(i, pi, 1); } while (a[i] < p);   // one read: the pivot's value is held
        do { j--; yield C(j, pi, 1); } while (a[j] > p);
        if (i >= j) { cut = j; break; }
        sw(a, i, j); yield S(i, j);
        if (pi === i) pi = j; else if (pi === j) pi = i;
      }
      st.push([cut + 1, hi], [lo, cut]);
    }
  }

  function* heap(a) {
    const n = a.length;
    function* sift(k, size) {
      for (;;) {
        let big = k; const l = 2 * k + 1, r = l + 1;
        if (l < size) { yield C(l, big); if (a[l] > a[big]) big = l; }
        if (r < size) { yield C(r, big); if (a[r] > a[big]) big = r; }
        if (big === k) return;
        sw(a, k, big); yield S(k, big); k = big;
      }
    }
    for (let k = (n >> 1) - 1; k >= 0; k--) yield* sift(k, n);
    for (let end = n - 1; end > 0; end--) { sw(a, 0, end); yield S(0, end); yield M(end); yield* sift(0, end); }
    if (n) yield M(0);
  }

  // LSD radix sort, base 10, for whole numbers >= 0: per digit, read every value and count, then write them back grouped by digit
  function* radix(a) {
    const n = a.length; if (!n) return;
    let max = 0; for (const v of a) if (v > max) max = v;
    for (let exp = 1; ; exp *= 10) {
      const snap = new Array(n), count = new Array(10).fill(0);
      for (let i = 0; i < n; i++) { snap[i] = a[i]; count[Math.floor(a[i] / exp) % 10]++; yield { type: 'read', i }; }
      const pos = new Array(10); for (let d = 0, s = 0; d < 10; d++) { pos[d] = s; s += count[d]; }
      for (let i = 0; i < n; i++) { const v = snap[i], k = pos[Math.floor(v / exp) % 10]++; a[k] = v; yield W(k, v); }
      if (exp * 10 > max) break;
    }
    yield M(0, n - 1);
  }

  const ALGS = [
    { id: 'bubble', name: 'Bubble sort', gen: bubble, best: 'n', avg: 'n²', worst: 'n²', mem: '1', stable: true,
      note: 'Compare neighbours and swap them when out of order; each pass carries the largest remaining value to the end. Stops after a pass with no swaps.' },
    { id: 'cocktail', name: 'Cocktail shaker sort', gen: cocktail, best: 'n', avg: 'n²', worst: 'n²', mem: '1', stable: true,
      note: 'Bubble sort in both directions: a pass right carries a large value to the end, a pass left carries a small one to the front.' },
    { id: 'selection', name: 'Selection sort', gen: selection, best: 'n²', avg: 'n²', worst: 'n²', mem: '1', stable: false,
      note: 'Find the smallest remaining value and swap it to the front. Always n(n−1)/2 comparisons, at most n − 1 swaps.' },
    { id: 'insertion', name: 'Insertion sort', gen: insertion, best: 'n', avg: 'n²', worst: 'n²', mem: '1', stable: true,
      note: 'Hold the next value and slide it left past every larger one, shifting with single moves (as in lesson 3). Fast on nearly sorted input.' },
    { id: 'shell', name: 'Shell sort', gen: shell, best: 'n log n', avg: 'about n^1.3', worst: 'depends on the gaps', mem: '1', stable: false,
      note: 'Insertion sort over cells far apart first (gaps 701, 301, 132, 57, 23, 10, 4, 1: Ciura’s sequence), so values travel far in few moves; the last pass is plain insertion sort on a nearly sorted array.' },
    { id: 'comb', name: 'Comb sort', gen: comb, best: 'n log n', avg: 'near n log n in practice', worst: 'n²', mem: '1', stable: false,
      note: 'Bubble sort over a gap that shrinks by 1.3 each pass, so small values near the end ("turtles") jump forward early.' },
    { id: 'merge', name: 'Merge sort (top-down)', gen: merge, best: 'n log n', avg: 'n log n', worst: 'n log n', mem: 'n', stable: true,
      note: 'Sort each half, then merge the two sorted halves through a scratch array, taking from the left on ties (lesson 4).' },
    { id: 'quick-lomuto', name: 'Quicksort (Lomuto, last value as pivot)', short: 'Quicksort (Lomuto)', gen: quickLomuto, best: 'n log n', avg: 'n log n', worst: 'n²', mem: 'log n to n (stack)', stable: false,
      note: 'Partition round the last value as in lesson 4: smaller values to its left, then the pivot drops into its final place; sort each side. Sorted input is its worst case.' },
    { id: 'quick-hoare', name: 'Quicksort (Hoare, middle value as pivot)', short: 'Quicksort (Hoare)', gen: quickHoare, best: 'n log n', avg: 'n log n', worst: 'n²', mem: 'log n to n (stack)', stable: false,
      note: 'Hoare’s own partition: two fingers walk in from both ends and swap each pair that is on the wrong side of the pivot (the middle value). Fewer swaps than Lomuto, and good on sorted input.' },
    { id: 'heap', name: 'Heap sort', gen: heap, best: 'n log n', avg: 'n log n', worst: 'n log n', mem: '1', stable: false,
      note: 'Arrange the array as a max-heap (each parent at least as large as its children), then swap the largest to the end and repair the heap, n times.' },
    { id: 'radix', name: 'Radix sort (LSD, base 10)', short: 'Radix sort (LSD)', gen: radix, best: 'd·n', avg: 'd·n', worst: 'd·n', mem: 'n + 10', stable: true,
      note: 'No comparisons at all: deal the values into ten groups by their last digit, keeping their order, then by the tens digit, then the hundreds. d is the number of digits.' }
  ];
  const byId = Object.create(null); for (const x of ALGS) byId[x.id] = x;
  const DEFAULT_ACC = { compare: 2, swap: 4, write: 1, read: 1 };
  const COSTED = { compare: 1, swap: 1, write: 1, read: 1 };

  // ---------- inputs
  const SHAPES = [['random', 'Random'], ['nearly', 'Nearly sorted'], ['reversed', 'Reversed'], ['few', 'Few unique values'], ['sorted', 'Sorted']];
  /** n values from 1..n in the given shape; the same seed gives the same array. */
  function makeInput(n, shape, seed) {
    const r = A.rng(seed), a = [];
    for (let i = 0; i < n; i++) a.push(i + 1);
    if (shape === 'random') r.shuffle(a);
    else if (shape === 'reversed') a.reverse();
    else if (shape === 'nearly') { for (let k = Math.max(1, Math.round(n / 25)); k > 0 && n > 1; k--) { const i = r.int(n), j = Math.min(n - 1, i + 1 + r.int(3)); sw(a, i, j); } }
    else if (shape === 'few') { const levels = n < 10 ? 3 : 5; for (let i = 0; i < n; i++) a[i] = Math.ceil((r.int(levels) + 1) * n / levels); }
    return a;
  }

  // ---------- drawing (shared by both demos)
  function isDark(c) {
    const m = /^#([0-9a-f]{6})$/i.exec(c.paper || ''); if (!m) return false;
    const x = parseInt(m[1], 16); return ((x >> 16) * 0.3 + ((x >> 8) & 255) * 0.59 + (x & 255) * 0.11) < 110;
  }
  const hueCache = { key: '', list: null };
  function hues(vmax, dark, wheel) {   // the wheel goes all the way round; bars and dots stop at violet, so the ends differ
    const key = vmax + (dark ? 'd' : 'l') + (wheel ? 'w' : '');
    if (hueCache.key !== key) {
      const span = wheel ? 360 : 285;
      const l = []; for (let v = 0; v <= vmax; v++) l.push('hsl(' + Math.round(span * Math.max(0, v - 1) / Math.max(1, wheel ? vmax : vmax - 1)) + ',' + (dark ? '70%,60%)' : '75%,47%)'));
      hueCache.key = key; hueCache.list = l;
    }
    return hueCache.list;
  }
  /** One array in the box (x0, y0, w, h). s: { arr, vmax, hiC, hiW, mark, pivot, swept, allDone }; view: bars | rainbow | dots | wheel. */
  function drawArray(ctx, x0, y0, w, h, s, view, c) {
    const n = s.arr.length; if (!n) return;
    const top = 9, strip = 5, ph = Math.max(10, h - top - strip - 2), base = y0 + top + ph;
    const bw = w / n, hue = hues(s.vmax, isDark(c), view === 'wheel');
    const isMarked = (i) => s.allDone || i < s.swept || s.mark[i] === 1;
    const hc = s.hiC, hw = s.hiW;
    if (view === 'wheel') {
      const cx = x0 + w / 2, cy = y0 + h / 2, R = Math.max(10, Math.min(w, h) / 2 - 10), da = 2 * Math.PI / n, a0 = -Math.PI / 2;
      const wedge = (i, r) => { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a0 + i * da, a0 + (i + 1) * da + 0.004); ctx.closePath(); ctx.fill(); };
      for (let i = 0; i < n; i++) { ctx.fillStyle = hue[s.arr[i]]; wedge(i, R); }
      ctx.fillStyle = c.ink; for (let k = 0; k < hc.length; k++) wedge(hc[k], R);
      ctx.fillStyle = c.paper; for (let k = 0; k < hw.length; k++) wedge(hw[k], R);
      ctx.strokeStyle = c.ok; ctx.lineWidth = 4;
      for (let i = 0; i < n;) { if (!isMarked(i)) { i++; continue; } let j = i; while (j < n && isMarked(j)) j++; ctx.beginPath(); ctx.arc(cx, cy, R + 5, a0 + i * da, a0 + j * da); ctx.stroke(); i = j; }
      if (s.pivot >= 0 && s.pivot < n) { ctx.strokeStyle = c.quiz; ctx.lineWidth = 2; const ang = a0 + (s.pivot + 0.5) * da; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * (R + 8), cy + Math.sin(ang) * (R + 8)); ctx.stroke(); }
      return;
    }
    const gapw = n <= 48 ? Math.min(3, bw * 0.2) : n <= 160 ? 1 : 0, bwid = Math.max(0.6, bw - gapw + (gapw ? 0 : 0.35));
    const hgt = (v) => Math.max(1, ph * v / s.vmax);
    if (view === 'dots') {
      const d = Math.max(2, Math.min(7, bw * 0.8));
      for (let i = 0; i < n; i++) { ctx.fillStyle = hue[s.arr[i]]; ctx.fillRect(x0 + (i + 0.5) * bw - d / 2, base - hgt(s.arr[i]) - d / 2 + d / 2, d, d); }
      const big = d + 3;
      ctx.fillStyle = c.ink; for (let k = 0; k < hc.length; k++) { const i = hc[k]; ctx.fillRect(x0 + (i + 0.5) * bw - big / 2, base - hgt(s.arr[i]) - big / 2, big, big); }
      ctx.fillStyle = c.err; for (let k = 0; k < hw.length; k++) { const i = hw[k]; ctx.fillRect(x0 + (i + 0.5) * bw - big / 2, base - hgt(s.arr[i]) - big / 2, big, big); }
    } else {
      const plain = view === 'bars';
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = plain ? (isMarked(i) ? c.ok : c.ink3) : hue[s.arr[i]];
        const v = hgt(s.arr[i]); ctx.fillRect(x0 + i * bw, base - v, bwid, v);
      }
      ctx.fillStyle = plain ? c.link : c.ink; for (let k = 0; k < hc.length; k++) { const i = hc[k], v = hgt(s.arr[i]); ctx.fillRect(x0 + i * bw, base - v, Math.max(bwid, 1.5), v); }
      ctx.fillStyle = c.err; for (let k = 0; k < hw.length; k++) { const i = hw[k], v = hgt(s.arr[i]); ctx.fillRect(x0 + i * bw, base - v, Math.max(bwid, 1.5), v); }
    }
    // the strip under the bars: green where values are known to be in their final place
    ctx.fillStyle = c.ok;
    for (let i = 0; i < n;) { if (!isMarked(i)) { i++; continue; } let j = i; while (j < n && isMarked(j)) j++; ctx.fillRect(x0 + i * bw, base + 2, (j - i) * bw, strip); i = j; }
    if (s.pivot >= 0 && s.pivot < n) {
      const x = x0 + (s.pivot + 0.5) * bw, y = base - hgt(s.arr[s.pivot]) - 2;
      ctx.fillStyle = c.quiz; ctx.beginPath(); ctx.moveTo(x - 5, y - 7); ctx.lineTo(x + 5, y - 7); ctx.lineTo(x, y); ctx.closePath(); ctx.fill();
    }
  }

  /** The state one watcher keeps for one sort: its copy of the array, the counts and the cells to highlight. */
  function newState(input) {
    let vmax = 1; for (const v of input) if (v > vmax) vmax = v;
    return { arr: input.slice(), vmax, mark: new Uint8Array(input.length), hiC: [], hiW: [], pivot: -1, swept: 0, allDone: false, fresh: false,
      cmp: 0, swaps: 0, writes: 0, reads: 0, acc: 0, ops: 0, sound: -1 };
  }
  const HI_CAP = 3000;
  function apply(s, ev) {
    if (s.fresh) { s.hiC.length = 0; s.hiW.length = 0; s.fresh = false; }
    const a = s.arr;
    switch (ev.type) {
      case 'compare': s.cmp++; if (s.hiC.length < HI_CAP) s.hiC.push(ev.i, ev.j); s.sound = a[ev.i]; break;
      case 'swap': { s.swaps++; const t = a[ev.i]; a[ev.i] = a[ev.j]; a[ev.j] = t; if (s.hiW.length < HI_CAP) s.hiW.push(ev.i, ev.j);
        if (s.pivot === ev.i) s.pivot = ev.j; else if (s.pivot === ev.j) s.pivot = ev.i; s.sound = a[ev.j]; break; }
      case 'write': s.writes++; a[ev.i] = ev.value; if (s.hiW.length < HI_CAP) s.hiW.push(ev.i); s.sound = ev.value; break;
      case 'read': s.reads++; if (s.hiC.length < HI_CAP) s.hiC.push(ev.i); s.sound = a[ev.i]; break;
      case 'pivot': s.pivot = ev.i; break;
      case 'mark-sorted': { const to = ev.to == null ? ev.i : ev.to; for (let k = ev.i; k <= to; k++) s.mark[k] = 1; if (s.pivot >= ev.i && s.pivot <= to) s.pivot = -1; break; }
      default: break;
    }
    s.acc += ev.acc != null ? ev.acc : (DEFAULT_ACC[ev.type] || 0);
    if (COSTED[ev.type]) s.ops++;
  }

  // ---------- the page's own CSS (injected once, only the site's variables)
  const CSS = `
.algo-sort-note { font-family: var(--sans); font-size: 0.92rem; color: var(--ink-2); margin: 0.2rem 0 0.6rem; min-height: 2.6em; }
.algo-sort-counts { display: flex; flex-wrap: wrap; gap: 0.2rem 1.2rem; font-family: var(--sans); font-size: 0.92rem; color: var(--ink-2); font-variant-numeric: tabular-nums; margin: 0.3rem 0; }
.algo-sort-counts b { color: var(--ink); font-weight: 600; }
.algo-sort-ref { font-family: var(--sans); font-size: 0.85rem; color: var(--ink-3); margin: 0.2rem 0 0.4rem; }
.algo-sort-btn[aria-pressed="true"] { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.algo-sort-wrap { overflow-x: auto; }
.algo-sort-table { border-collapse: collapse; font-family: var(--sans); font-size: 0.9rem; font-variant-numeric: tabular-nums; margin: 0.4rem 0; min-width: 100%; }
.algo-sort-table th, .algo-sort-table td { text-align: right; padding: 0.25rem 0.6rem; border-bottom: 1px solid var(--rule); white-space: nowrap; }
.algo-sort-table th:first-child, .algo-sort-table td:first-child { text-align: left; white-space: normal; }
.algo-sort-table th { color: var(--ink-2); font-weight: 600; }
.algo-sort-table tr.algo-sort-win td { color: var(--ok); font-weight: 600; }
@media (max-width: 560px) { .algo-sort-table th, .algo-sort-table td { padding: 0.2rem 0.3rem; font-size: 0.85rem; } }
`;
  function injectCss() {
    if (document.getElementById('algo-sort-css')) return;
    const st = document.createElement('style'); st.id = 'algo-sort-css'; st.textContent = CSS; document.head.appendChild(st);
  }

  const fmt = (x) => Math.round(x).toLocaleString('en-US');
  const SIZES = [8, 16, 32, 50, 100, 200, 300, 500, 1000];
  const VIEWS = [['bars', 'Bars'], ['rainbow', 'Rainbow bars'], ['dots', 'Dots'], ['wheel', 'Colour wheel']];
  function select(el, label, options, value, onchange) {
    const s = el('select', { onchange: () => onchange(s.value) }, options.map(([v, t]) => el('option', { value: String(v) }, t)));
    s.value = String(value);
    return { label: el('label', {}, label + ' ', s), sel: s };
  }
  function legend(el, view, c) {
    const sw2 = (col, text) => el('span', {}, el('i', { style: 'background:' + col }), text);
    const box = el('div', { class: 'algo-legend' });
    const colourful = view !== 'bars';
    box.append(
      colourful ? sw2('linear-gradient(90deg,hsl(0,75%,50%),hsl(120,75%,45%),hsl(240,75%,55%))', 'colour = value') : sw2(c.ink3, 'value'),
      sw2(colourful ? (view === 'wheel' ? c.ink : c.ink) : c.link, 'being compared or read'),
      sw2(view === 'wheel' ? c.paper + ';outline:1px solid ' + c.rule : c.err, 'just moved (swap or write)'),
      sw2(c.quiz, 'pivot'),
      sw2(c.ok, 'in its final place'));
    return box;
  }
  /** A small Web Audio voice: a short triangle-wave blip whose pitch follows a value from 0 to 1. Created on the user's click. */
  function makeSound() {
    const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
    if (!AC) return null;
    let ac = null, master = null;
    return {
      start() { if (!ac) { ac = new AC(); master = ac.createGain(); master.gain.value = 0.6; master.connect(ac.destination); } if (ac.state === 'suspended') ac.resume(); },
      blip(f) {
        if (!ac || ac.state !== 'running') return;
        const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
        o.type = 'triangle'; o.frequency.value = 140 + 1060 * Math.max(0, Math.min(1, f));
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.06, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
        o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.1);
      },
      stop() { if (ac) { try { ac.close(); } catch (e) { /* ignore */ } } ac = null; master = null; }
    };
  }

  // ---------- demo 1: one sort, watched closely
  function mountSorting(host, api) {
    const el = api.el; injectCss();
    let algo = 'quick-hoare', n = 200, shape = 'random', view = 'rainbow', seed = 20261002, base = makeInput(n, shape, seed);
    let st = newState(base), sweeping = false, sweepT0 = 0, alive = true, dirty = true, raf = 0, soundOn = false;
    const sound = makeSound();

    const fAlgo = select(el, 'Algorithm', ALGS.map((x) => [x.id, x.short || x.name]), algo, (v) => { algo = v; note.textContent = byId[algo].note; refreshLabel(); pl.reset(); });
    const fSize = select(el, 'Size', SIZES.map((x) => [x, String(x)]), n, (v) => { n = +v; fresh(); });
    const fShape = select(el, 'Input', SHAPES, shape, (v) => { shape = v; fresh(); });
    const fView = select(el, 'View', VIEWS, view, (v) => { view = v; legendBox.replaceWith(legendBox = legend(el, view, api.colors())); dirty = true; cv.redraw(); });
    const shuffleBtn = el('button', { class: 'btn', type: 'button', onclick: () => { seed = (seed * 1103515245 + 12345) >>> 0; fresh(); } }, 'New input');
    const soundBtn = el('button', { class: 'btn algo-sort-btn', type: 'button', 'aria-pressed': 'false', onclick: () => {
      if (!sound) return;
      soundOn = !soundOn; soundBtn.setAttribute('aria-pressed', String(soundOn)); soundBtn.textContent = soundOn ? 'Sound on' : 'Sound off';
      if (soundOn) sound.start();
    } }, sound ? 'Sound off' : 'No sound here');
    if (!sound) soundBtn.disabled = true;
    host.append(el('div', { class: 'algo-controls' }, fAlgo.label, fSize.label, fShape.label, fView.label, shuffleBtn, soundBtn));
    const note = el('p', { class: 'algo-sort-note' }, byId[algo].note);
    host.append(note);

    const cv = api.canvas(host, { label: 'Sorting', maxWidth: 1100, height: (w) => Math.round(Math.max(220, Math.min(440, w * 0.5))),
      draw: (ctx, w, h, c) => { ctx.fillStyle = c.paper; ctx.fillRect(0, 0, w, h); drawArray(ctx, 6, 0, w - 12, h, st, view, c); } });
    const refreshLabel = () => cv.canvas.setAttribute('aria-label', (byId[algo].short || byId[algo].name) + ' on ' + n + ' values, ' + view + ' view');
    refreshLabel();

    const pl = api.player(host, {
      speeds: [2, 20000], speed: 55,
      start: () => byId[algo].gen(base.slice()),
      onStep: (ev) => { apply(st, ev); dirty = true; },
      onDone: () => {
        st.pivot = -1; st.hiC.length = 0; st.hiW.length = 0;
        if (api.reducedMotion()) { st.allDone = true; dirty = true; } else { sweeping = true; sweepT0 = 0; }
        pl.status('Sorted: ' + fmt(st.cmp) + ' comparisons, ' + fmt(st.swaps) + ' swaps, ' + fmt(st.writes) + ' writes.');
      },
      onReset: () => { st = newState(base); sweeping = false; dirty = true; pl.status(''); }
    });
    const cnt = {}; const counts = el('div', { class: 'algo-sort-counts' });
    for (const [k, t] of [['cmp', 'Comparisons'], ['swaps', 'Swaps'], ['writes', 'Writes'], ['acc', 'Array accesses']]) { cnt[k] = el('b', {}, '0'); counts.append(el('span', {}, t + ' ', cnt[k])); }
    const ref = el('p', { class: 'algo-sort-ref' });
    let legendBox = legend(el, view, api.colors());
    host.append(counts, ref, legendBox);
    const refText = () => { const lg = n > 1 ? n * Math.log2(n) : 0; ref.textContent = 'For scale, with n = ' + n + ': n²/2 = ' + fmt(n * n / 2) + ', n log₂ n ≈ ' + fmt(lg) + '.'; };
    refText();

    function fresh() { base = makeInput(n, shape, seed); refText(); refreshLabel(); pl.reset(); }
    function frame(t) {
      raf = 0;
      if (!alive) return;
      if (!host.isConnected) { cleanup(); return; }
      if (sweeping) {
        if (!sweepT0) sweepT0 = t;
        const k = Math.min(1, (t - sweepT0) / 900), next = Math.floor(k * st.arr.length);
        if (soundOn && sound && next > st.swept && next > 0) sound.blip(st.arr[next - 1] / st.vmax);
        st.swept = next; dirty = true;
        if (k >= 1) { sweeping = false; st.allDone = true; }
      } else if (soundOn && sound && st.sound >= 0) sound.blip(st.sound / st.vmax);
      st.sound = -1;
      if (dirty) {
        dirty = false; cv.redraw(); st.fresh = true;
        cnt.cmp.textContent = fmt(st.cmp); cnt.swaps.textContent = fmt(st.swaps); cnt.writes.textContent = fmt(st.writes); cnt.acc.textContent = fmt(st.acc);
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    if (!api.reducedMotion()) requestAnimationFrame(() => { if (alive) pl.play(); });
    function cleanup() { if (!alive) return; alive = false; if (raf) cancelAnimationFrame(raf); pl.stop(); cv.stop(); if (sound) sound.stop(); }
    return cleanup;
  }

  // ---------- demo 2: the race
  const PLACES = ['1st', '2nd', '3rd', '4th'];
  function mountRace(host, api) {
    const el = api.el; injectCss();
    const picks = ['insertion', 'selection', 'merge', 'quick-hoare'];
    let n = 100, shape = 'random', view = 'rainbow', seed = 7051961, base = makeInput(n, shape, seed);
    let lanes = [], alive = true, dirty = true, raf = 0, tick = 0;

    const laneSel = picks.map((p, k) => select(el, 'Lane ' + (k + 1), (k >= 2 ? [['', '(empty)']] : []).concat(ALGS.map((x) => [x.id, x.short || x.name])), p,
      (v) => { picks[k] = v; betOptions(); pl.reset(); }));
    // a bet on the winner, made before the race: guessing first makes the result stick (and is more fun)
    let bet = '';
    const betSel = el('select', { 'aria-label': 'Your bet', onchange: () => { bet = betSel.value; } });
    function betOptions() {
      const keep = bet;
      betSel.replaceChildren(el('option', { value: '' }, 'no bet'), ...picks.map((p, k) => (p && byId[p] ? el('option', { value: p }, 'Lane ' + (k + 1) + ': ' + (byId[p].short || byId[p].name)) : null)).filter(Boolean));
      betSel.value = keep && picks.includes(keep) ? keep : ''; bet = betSel.value;
    }
    betOptions();
    const fSize = select(el, 'Size', SIZES.map((x) => [x, String(x)]), n, (v) => { n = +v; fresh(); });
    const fShape = select(el, 'Input', SHAPES, shape, (v) => { shape = v; fresh(); });
    const fView = select(el, 'View', VIEWS.filter((v) => v[0] !== 'wheel'), view, (v) => { view = v; dirty = true; cv.redraw(); });
    const shuffleBtn = el('button', { class: 'btn', type: 'button', onclick: () => { seed = (seed * 1103515245 + 12345) >>> 0; fresh(); } }, 'New input');
    host.append(el('div', { class: 'algo-controls' }, laneSel.map((s) => s.label)), el('div', { class: 'algo-controls' }, fSize.label, fShape.label, fView.label, shuffleBtn, el('label', {}, 'Who will win? ', betSel)));

    function build() {
      tick = 0;
      lanes = picks.filter((p) => p && byId[p]).map((p) => ({ algo: byId[p], st: newState(base), gen: null, done: false, place: 0, at: 0 }));
    }
    build();
    const cv = api.canvas(host, { label: 'Sorting race', maxWidth: 1100, height: (w) => Math.round(Math.max(300, Math.min(560, w * 0.7))),
      draw: (ctx, w, h, c) => {
        ctx.fillStyle = c.paper; ctx.fillRect(0, 0, w, h);
        const L = Math.max(1, lanes.length), lh = h / L;
        lanes.forEach((ln, k) => {
          const y = k * lh;
          if (k) { ctx.fillStyle = c.rule; ctx.fillRect(0, y, w, 1); }
          ctx.font = '600 12px ' + (c.sans || 'sans-serif'); ctx.textBaseline = 'top';
          ctx.fillStyle = ln.place === 1 ? c.ok : c.ink; ctx.textAlign = 'left';
          ctx.fillText(ln.algo.short || ln.algo.name, 8, y + 5);
          ctx.textAlign = 'right'; ctx.fillStyle = ln.done ? c.ok : c.ink2;
          ctx.fillText(fmt(ln.st.ops) + ' steps' + (ln.done ? ' · ' + PLACES[ln.place - 1] : ''), w - 8, y + 5);
          ctx.textAlign = 'left';
          drawArray(ctx, 6, y + 20, w - 12, lh - 22, ln.st, view, c);
        });
      } });
    const pl = api.player(host, {
      speeds: [5, 20000], speed: 50,
      start: () => { build(); for (const ln of lanes) ln.gen = ln.algo.gen(base.slice()); return race(); },
      onStep: () => { dirty = true; },
      onDone: () => {
        const order = lanes.slice().sort((x, y) => x.place - y.place);
        const mine = bet ? lanes.find((ln) => ln.algo.id === bet) : null;
        pl.status((mine ? (mine.place === 1 ? 'Your bet won! ' : 'Your bet came ' + PLACES[mine.place - 1] + '. ') : '') + 'Finished: ' + order.map((ln) => PLACES[ln.place - 1] + ' ' + (ln.algo.short || ln.algo.name) + ' (' + fmt(ln.st.ops) + ' steps)').join(', ') + '.');
        dirty = true;
      },
      onReset: () => { build(); dirty = true; pl.status('Make your bet, then press Play.'); }
    });
    function* race() {
      let finished = 0, lastAt = -1, lastPlace = 0;
      while (lanes.some((ln) => !ln.done)) {
        tick++;
        for (const ln of lanes) {
          if (ln.done) continue;
          for (;;) {
            const r = ln.gen.next();
            if (r.done) {
              ln.done = true; finished++; ln.at = tick;
              ln.place = tick === lastAt ? lastPlace : finished; lastAt = tick; lastPlace = ln.place;
              ln.st.allDone = true; ln.st.pivot = -1; ln.st.hiC.length = 0; ln.st.hiW.length = 0;
              break;
            }
            apply(ln.st, r.value);
            if (COSTED[r.value.type]) break;
          }
        }
        yield tick;
      }
    }
    const tableBox = el('div', { class: 'algo-sort-wrap' });
    host.append(tableBox);
    function table() {
      const rows = lanes.map((ln) => el('tr', { class: ln.place === 1 ? 'algo-sort-win' : null },
        el('td', {}, ln.algo.short || ln.algo.name), el('td', {}, fmt(ln.st.cmp)), el('td', {}, fmt(ln.st.swaps + ln.st.writes)),
        el('td', {}, fmt(ln.st.ops)), el('td', {}, ln.done ? PLACES[ln.place - 1] : '…')));
      tableBox.replaceChildren(el('table', { class: 'algo-sort-table' },
        el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, 'Algorithm'), el('th', { scope: 'col' }, 'Comparisons'), el('th', { scope: 'col' }, 'Moves'), el('th', { scope: 'col' }, 'Steps'), el('th', { scope: 'col' }, 'Place'))),
        el('tbody', {}, rows)));
    }
    const ref = el('p', { class: 'algo-sort-ref' });
    host.append(ref, legend(el, view, api.colors()));
    function fresh() { base = makeInput(n, shape, seed); const lg = n > 1 ? n * Math.log2(n) : 0; ref.textContent = 'A step is one comparison, swap, write or read. For scale, with n = ' + n + ': n²/2 = ' + fmt(n * n / 2) + ', n log₂ n ≈ ' + fmt(lg) + '.'; pl.reset(); }
    fresh();
    function frame() {
      raf = 0;
      if (!alive) return;
      if (!host.isConnected) { cleanup(); return; }
      if (dirty) { dirty = false; cv.redraw(); table(); for (const ln of lanes) ln.st.fresh = true; }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    pl.status('Who will win? Make your bet, then press Play.');   // no autoplay: the bet comes first
    function cleanup() { if (!alive) return; alive = false; if (raf) cancelAnimationFrame(raf); pl.stop(); cv.stop(); }
    return cleanup;
  }

  // ---------- registration
  const costRows = ALGS.map((x) => '<tr><td>' + x.name + '</td><td>' + x.best + '</td><td>' + x.avg + '</td><td>' + x.worst + '</td><td>' + x.mem + '</td><td>' + (x.stable ? 'yes' : 'no') + '</td></tr>').join('');
  const ABOUT_SORTING = `<h2>Reading the picture</h2>
<p>Each bar (or dot, or slice of the wheel) is one cell of the array; its height, or its colour, is its value. Highlighted cells are the ones the algorithm is looking at right now: dark (blue in the plain bars view) when compared or read, red when a value has just been moved. A triangle marks a quicksort's pivot. The green strip grows under cells the algorithm <em>knows</em> are final: selection sort and heap sort fix one cell per pass, a quicksort pivot is final once its partition is done, but insertion sort and merge sort fix nothing until the very end. In the colour views a sorted array is a smooth rainbow, which makes it easy to see how much order there already is at each moment.</p>
<p>The counts: a <b>comparison</b> is one test of two values; a <b>swap</b> exchanges two cells; a <b>write</b> puts one value in one cell (insertion sort's shifts, merge sort's merge, radix sort's dealing). <b>Array accesses</b> counts every read and write of the array itself: a comparison of two cells is two reads, a swap two reads and two writes. Merge sort compares values in its scratch array, so its comparisons cost no reads of the array; copying a run into the scratch array does.</p>
<h2>The algorithms</h2>
<div class="algo-sort-wrap"><table class="algo-sort-table"><thead><tr><th scope="col">Algorithm</th><th scope="col">Best</th><th scope="col">Average</th><th scope="col">Worst</th><th scope="col">Extra memory</th><th scope="col">Stable</th></tr></thead><tbody>${costRows}</tbody></table></div>
<p>Costs are counts of basic steps, written as orders of growth. <em>Stable</em> means equal values keep the order they had, which matters when sorting records by one key after another. Radix sort escapes the n log n barrier because it never compares two values: any sort that only compares needs about log₂(n!) ≈ n log₂ n comparisons in its worst case, and merge sort and heap sort meet that bound. Quicksort's worst case comes from bad pivots: try Lomuto on a sorted input, and then try Hoare's version, which takes the middle value. On "few unique values" Lomuto's version slows down badly: watch its partitions become lopsided, because every value equal to the pivot goes to the same side. Hoare's stops at values equal to the pivot and swaps them, so its partitions stay even.</p>
<h2>What real libraries do</h2>
<ul>
<li><b>Java</b>: <code>Arrays.sort</code> on primitive arrays is a dual-pivot quicksort (since Java 7); on object arrays, and <code>Collections.sort</code>, it is TimSort, because sorting objects must be stable.</li>
<li><b>Python</b>: <code>list.sort</code> and <code>sorted</code> use TimSort, a merge sort that first finds runs already in order and extends short runs with binary insertion sort; since Python 3.11 it decides which runs to merge by the Powersort rule.</li>
<li><b>JavaScript</b>: since 2019 the language requires <code>Array.prototype.sort</code> to be stable; V8 (Chrome, Node.js) uses TimSort.</li>
<li><b>C++</b>: <code>std::sort</code> is usually an introsort: quicksort that switches to heap sort if the recursion gets too deep, and to insertion sort for small parts; <code>std::stable_sort</code> is a merge sort.</li>
<li><b>The Linux kernel</b> sorts with heap sort: no recursion, no extra memory, and n log n guaranteed.</li>
<li><b>Insertion sort</b> survives inside nearly all of these, for parts of a few dozen values, where its short inner loop beats everything else. <b>Radix sort</b> is how graphics processors sort millions of keys, and how punched-card sorting machines worked a century ago: one column at a time, last digit first.</li>
</ul>
<p>Bubble sort, cocktail shaker sort and comb sort are here so you can recognise them; no library uses them.</p>`;
  const ABOUT_RACE = `<h2>How the race works</h2>
<p>Every lane sorts its own copy of the same input. At each tick every lane that has not finished does one step: one comparison, swap, write or read. So the finishing order is the order of total work, counted the way lesson 1 counts it, with no machine and no clock in the way. (On a real computer the steps do not all cost the same: merge sort's writes go to a second array, quicksort's inner loop is very short. The counts still decide who wins once n is large.)</p>
<h2>Things to try</h2>
<ul>
<li><b>Quadratic against n log n.</b> At 50 values insertion sort takes under three times as many steps as merge sort. At 1000 it does about 500,000 steps against merge sort's 19,000. Double the size and watch the quadratic lanes take four times as long, the others a little over twice.</li>
<li><b>The input matters.</b> On <em>Nearly sorted</em>, insertion sort beats everything: each value slides only a step or two. Selection sort makes exactly the same n(n−1)/2 comparisons on every input. Put Lomuto's quicksort in a lane and choose <em>Sorted</em>: its pivot is always the largest value and it becomes quadratic, while Hoare's, taking the middle value, has its best case.</li>
<li><b>No comparisons.</b> Radix sort's comparison count stays at zero. On 1000 values it reads and writes every value four times (one pass per decimal digit) and usually wins outright.</li>
<li><b>Equal values.</b> <em>Few unique values</em> slows Lomuto's quicksort down a great deal (every value equal to the pivot ends up on one side) and helps insertion sort.</li>
</ul>`;
  const TAUGHT = [{ href: '#/dsa/3', text: 'DSA lesson 3: Sorting, the slow way first' }, { href: '#/dsa/4', text: 'DSA lesson 4: merge sort and quicksort' }];

  A.register({ id: 'sorting', title: 'Sorting algorithms', group: 'Sorting',
    blurb: 'Eleven sorts on up to a thousand values, as bars, dots or a colour wheel, with every comparison and move counted, and sound if you want it.',
    mount: mountSorting, about: ABOUT_SORTING, taught: TAUGHT });
  A.register({ id: 'sort-race', title: 'Sorting race', group: 'Sorting',
    blurb: 'Up to four sorts on the same input, one step each per tick: see n² fall behind n log n, and how the input changes the winner.',
    mount: mountRace, about: ABOUT_RACE, taught: TAUGHT });

  // ---------- tests (node: test_algos.js)
  function selfTest() {
    const fails = [];
    const r = A.rng(12345);
    const cases = [];
    for (const len of [0, 1, 2, 3, 4, 5, 7, 8, 9, 13, 16, 31, 50, 64, 100, 129, 257]) {
      for (const sh of SHAPES) cases.push(makeInput(len, sh[0], 1 + r.int(1e9)));
      for (let k = 0; k < 6; k++) { const a = []; const span = 1 + r.int(k % 2 ? 4 : 3 * len + 1); for (let i = 0; i < len; i++) a.push(r.int(span)); cases.push(a); }
    }
    for (let k = 0; k < 40; k++) { const len = r.int(70), a = []; for (let i = 0; i < len; i++) a.push(r.int(100000)); cases.push(a); }
    cases.push([5, 5, 5, 5, 5], [0, 0, 1, 0], [1000, 1, 999, 2, 0], [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]);
    for (const al of ALGS) {
      let bad = 0;
      for (const input of cases) {
        if (bad >= 3) break;
        const n = input.length, want = input.slice().sort((x, y) => x - y);
        const work = input.slice(), s = newState(input);
        let err = '', count = 0;
        const inRange = (i) => Number.isInteger(i) && i >= 0 && i < n;
        for (const ev of al.gen(work)) {
          if (++count > 5 * n * n + 100 * n + 100) { err = 'too many events'; break; }
          if (!ev || !ev.type) { err = 'event without a type'; break; }
          if (ev.type === 'compare' || ev.type === 'swap') { if (!inRange(ev.i) || !inRange(ev.j)) { err = ev.type + ' out of range ' + ev.i + ',' + ev.j; break; } }
          else if (ev.type === 'write') { if (!inRange(ev.i) || typeof ev.value !== 'number') { err = 'bad write ' + JSON.stringify(ev); break; } }
          else if (ev.type === 'read' || ev.type === 'pivot') { if (!inRange(ev.i)) { err = ev.type + ' out of range ' + ev.i; break; } }
          else if (ev.type === 'mark-sorted') {
            const to = ev.to == null ? ev.i : ev.to;
            if (!inRange(ev.i) || !inRange(to) || to < ev.i) { err = 'bad mark ' + JSON.stringify(ev); break; }
          } else if (ev.type === 'aux') { if (!(ev.lo >= 0 && ev.hi <= n && ev.lo < ev.hi)) { err = 'bad aux'; break; } }
          else { err = 'unknown event ' + ev.type; break; }
          apply(s, ev);
          if (ev.type === 'mark-sorted') { const to = ev.to == null ? ev.i : ev.to; for (let k = ev.i; k <= to; k++) if (s.arr[k] !== want[k]) { err = 'cell ' + k + ' marked sorted too early'; break; } if (err) break; }
        }
        if (!err && s.arr.join() !== want.join()) err = 'watcher\'s copy ends ' + JSON.stringify(s.arr.slice(0, 12));
        if (!err && work.join() !== want.join()) err = 'the array itself ends ' + JSON.stringify(work.slice(0, 12));
        if (!err && n && !Array.prototype.every.call(s.mark, (m) => m === 1)) err = 'not every cell was marked sorted';
        if (err) { bad++; fails.push(al.id + ' on ' + JSON.stringify(input.slice(0, 16)) + (n > 16 ? '… (n=' + n + ')' : '') + ': ' + err); }
      }
    }
    // the counts lesson 3 and 4 promise
    const run = (id, a) => { const s = newState(a); for (const ev of byId[id].gen(a.slice())) apply(s, ev); return s; };
    for (const len of [1, 10, 100]) {
      for (const sh of ['random', 'sorted', 'reversed']) {
        const a = makeInput(len, sh, 99), sel = run('selection', a);
        if (sel.cmp !== len * (len - 1) / 2) fails.push('selection sort on ' + sh + ' n=' + len + ' made ' + sel.cmp + ' comparisons, not n(n-1)/2');
        if (sel.swaps > Math.max(0, len - 1)) fails.push('selection sort made more than n-1 swaps');
      }
      const ins = run('insertion', makeInput(len, 'sorted', 1));
      if (ins.cmp !== Math.max(0, len - 1) || ins.writes !== 0) fails.push('insertion sort on sorted n=' + len + ': ' + ins.cmp + ' comparisons, ' + ins.writes + ' writes');
      const rev = run('insertion', makeInput(len, 'reversed', 1));
      if (rev.cmp !== len * (len - 1) / 2) fails.push('insertion sort on reversed n=' + len + ': ' + rev.cmp + ' comparisons');
    }
    const lom = run('quick-lomuto', makeInput(1000, 'sorted', 1));
    if (lom.cmp !== 1000 * 999 / 2) fails.push('Lomuto quicksort on sorted 1000 made ' + lom.cmp + ' comparisons, expected n(n-1)/2');
    const mg = run('merge', makeInput(1000, 'random', 3));
    if (mg.cmp > 1000 * Math.ceil(Math.log2(1000))) fails.push('merge sort made more than n log n comparisons: ' + mg.cmp);
    if (run('radix', makeInput(1000, 'random', 3)).cmp !== 0) fails.push('radix sort compared');
    // stability: sort objects that compare by key (valueOf) and remember where they started; equal keys must keep that order.
    // The unstable sorts must show it on this input, or the table would be claiming too little.
    for (const al of ALGS) {
      const tagged = makeInput(200, 'few', 5).map((v, i) => ({ v, i, valueOf() { return this.v; } }));
      for (const ev of al.gen(tagged)) void ev;
      let stable = true;
      for (let k = 1; k < tagged.length; k++) {
        if (tagged[k - 1].v > tagged[k].v) { fails.push(al.id + ' does not sort objects by key'); stable = null; break; }
        if (tagged[k - 1].v === tagged[k].v && tagged[k - 1].i > tagged[k].i) stable = false;
      }
      if (stable !== null && stable !== al.stable) fails.push(al.id + (al.stable ? ' claims to be stable and is not' : ' is listed as unstable but kept ties in order on this input'));
    }
    return fails;
  }

  if (typeof module !== 'undefined') module.exports = { selfTest, makeInput, shellGaps, ALGS, apply, newState,
    bubble, cocktail, selection, insertion, shell, comb, merge, quickLomuto, quickHoare, heap, radix };
})();
