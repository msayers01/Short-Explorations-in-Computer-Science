/* More interactive figures for SC 104 Introduction to the Mathematics of Computing, added to window.WIDGETS[name](mount, block, course) as in widgets.js,
   with its drawing helpers (window.WIDGET_KIT: sv, txt, mono, stepper). Loaded after widgets.js. */
(function () {
  'use strict';
  if (!window.WIDGETS || !window.WIDGET_KIT) return;
  const W = window.WIDGETS, { el } = window.__h, { sv, txt, mono, stepper } = window.WIDGET_KIT;   // eslint-disable-line no-unused-vars
  const comma = (v) => Math.round(v).toLocaleString('en-US');

  /* ---------- the birthday problem (SC 104 lesson 16): the chance that two of n share one of m days, or two of n keys one of m hash slots ---------- */
  W.birthday = function (mount, b) {
    const SPACES = [
      { m: 365, what: 'days of the year', who: 'people' },
      { m: 1000, what: 'hash slots', who: 'keys' },
      { m: 10000, what: 'hash slots', who: 'keys' },
      { m: 1000000, what: 'hash slots', who: 'keys' }
    ];
    let space = SPACES.find((s) => s.m === b.m) || SPACES[0], n = b.n || 23, curve = [];
    const nmax = () => Math.max(20, Math.round(4 * Math.sqrt(space.m)));
    // curve[k] = the chance that at least two of k share a slot (Theorem 2: 1 minus the product of (m - j)/m for j < k)
    const build = () => { curve = [0]; let all = 1; for (let k = 1; k <= nmax(); k++) { all *= (space.m - (k - 1)) / space.m; curve.push(1 - all); } };
    const half = () => curve.findIndex((p) => p >= 0.5);
    const pct = (p) => (p >= 0.9995 ? 'more than 99.9%' : p > 0 && p < 0.0005 ? 'less than 0.1%' : (100 * p).toFixed(1) + '%');
    const W0 = 640, H0 = 260, L = 50, R = 18, T = 14, B = 36;
    const svg = sv('svg', { viewBox: '0 0 ' + W0 + ' ' + H0, role: 'img', 'aria-label': 'The chance of a shared birthday or a hash collision, against the number of people or keys' });
    const status = el('div', { class: 'fig-status', role: 'status' });
    const nlabel = el('span', { class: 'fig-note' });
    const slider = el('input', { type: 'range', min: '1', step: '1', 'aria-label': 'number of people or keys', oninput: (e) => { n = +e.target.value; render(); } });
    const pick = el('select', { 'aria-label': 'number of days or slots', onchange: (e) => { space = SPACES[+e.target.value]; n = space.m === 365 ? 23 : Math.round(Math.sqrt(space.m)); build(); render(); } },
      SPACES.map((s, i) => el('option', { value: String(i), selected: s === space ? '' : null }, comma(s.m) + ' ' + s.what)));
    function render() {
      const top = nmax(), X = (k) => L + (k / top) * (W0 - L - R), Y = (p) => T + (1 - p) * (H0 - T - B);
      slider.max = String(top); slider.value = String(n);
      svg.innerHTML = '';
      svg.append(sv('line', { x1: L, y1: Y(0), x2: W0 - R, y2: Y(0), stroke: 'var(--ink-2)' }), sv('line', { x1: L, y1: T, x2: L, y2: Y(0), stroke: 'var(--ink-2)' }));
      for (const p of [0, 0.25, 0.5, 0.75, 1]) {
        svg.append(txt(L - 6, Y(p) + 4, Math.round(p * 100) + '%', { 'text-anchor': 'end', 'font-size': 11, fill: 'var(--ink-3)' }));
        if (p) svg.append(sv('line', { x1: L, y1: Y(p), x2: W0 - R, y2: Y(p), stroke: p === 0.5 ? 'var(--ink-3)' : 'var(--rule)', 'stroke-dasharray': p === 0.5 ? '6 4' : '2 4' }));
      }
      for (let i = 0; i <= 4; i++) { const k = Math.round((top * i) / 4); svg.append(txt(X(k), H0 - B + 16, comma(k), { 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--ink-3)' })); }
      svg.append(txt(W0 - R, H0 - 4, space.who, { 'text-anchor': 'end', 'font-size': 11, fill: 'var(--ink-2)' }));
      const pts = []; for (let k = 1; k <= top; k += Math.max(1, Math.floor(top / 200))) pts.push(X(k) + ',' + Y(curve[k])); pts.push(X(top) + ',' + Y(curve[top]));
      svg.append(sv('polyline', { points: pts.join(' '), fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2.2 }));
      const h = half();
      if (h > 0) svg.append(sv('line', { x1: X(h), y1: Y(0), x2: X(h), y2: Y(0.5), stroke: 'var(--ink-3)', 'stroke-dasharray': '2 3' }), txt(X(h) + 4, Y(0) - 6, comma(h), { 'font-size': 11, fill: 'var(--ink-2)' }));
      svg.append(sv('line', { x1: X(n), y1: Y(0), x2: X(n), y2: Y(curve[n]), stroke: 'var(--err)', 'stroke-width': 1.5 }), sv('circle', { cx: X(n), cy: Y(curve[n]), r: 5, fill: 'var(--err)' }));
      nlabel.textContent = comma(n) + ' ' + space.who;
      const pairs = (n * (n - 1)) / 2;
      status.textContent = 'With ' + comma(n) + ' ' + space.who + ' and ' + comma(space.m) + ' ' + space.what + ', the chance that at least two share one is ' + pct(curve[n]) + '. ' +
        comma(n) + ' ' + space.who + ' make ' + comma(pairs) + (pairs === 1 ? ' pair' : ' pairs') + '. The chance first passes 50% at ' + comma(h) + ' ' + space.who + ', about 1.18 × √' + comma(space.m) + '.';
    }
    build(); render();
    mount.append(el('div', { class: 'fig-scroll' }, svg), el('div', { class: 'fig-tools' }, el('label', {}, 'share one of ', pick)), el('div', { class: 'fig-tools' }, el('span', {}, 'how many'), slider, nlabel), status);
  };

  /* ---------- a recursion tree whose levels add up (SC 104 lesson 18): T(n) = a T(n/2) + f(n), level by level ---------- */
  W.rectree = function (mount, b) {
    const KINDS = {
      merge: { label: 'T(n) = 2T(n/2) + n, T(1) = 0 (merge sort)', a: 2, f: (s) => s, leaf: 0, total: (n, k) => n * k, form: (n, k) => n + ' × log₂ ' + n + ' = ' + n + ' × ' + k },
      binary: { label: 'T(n) = T(n/2) + 1, T(1) = 1 (binary search)', a: 1, f: () => 1, leaf: 1, total: (n, k) => k + 1, form: (n, k) => 'log₂ ' + n + ' + 1 = ' + k + ' + 1' },
      halves: { label: 'T(n) = 2T(n/2) + 1, T(1) = 1 (two halves, one step)', a: 2, f: () => 1, leaf: 1, total: (n) => 2 * n - 1, form: (n) => '2 × ' + n + ' − 1' },
      shrink: { label: 'T(n) = T(n/2) + n, T(1) = 1 (one half, n steps)', a: 1, f: (s) => s, leaf: 1, total: (n) => 2 * n - 1, form: (n) => n + ' + ' + n / 2 + ' + … + 1 = 2 × ' + n + ' − 1' }
    };
    let kind = KINDS[b.kind] ? b.kind : 'merge', n = [8, 16, 32].includes(b.n) ? b.n : 16, step = null;
    const W0 = 660, svg = sv('svg', { role: 'img', 'aria-label': 'Recursion tree: one row per level of calls, with the work of each call and the total of each level' });
    svg.style.minWidth = '560px';   // on a phone the tree scrolls sideways (fig-scroll) rather than shrinking its labels below reading size
    const status = el('div', { class: 'fig-status', role: 'status' });
    const tools = el('div');
    const levelsOf = () => { const K = KINDS[kind], k = Math.round(Math.log2(n)), rows = []; for (let j = 0; j <= k; j++) { const size = n / 2 ** j, calls = K.a ** j, work = j < k ? K.f(size) : K.leaf; rows.push({ j, size, calls, work, sum: calls * work }); } return rows; };
    function render(i) {
      const K = KINDS[kind], rows = levelsOf(), k = rows.length - 1, rowH = 44, H0 = 26 + rows.length * rowH + 10, left = 10, right = 150;
      svg.setAttribute('viewBox', '0 0 ' + W0 + ' ' + H0); svg.innerHTML = '';
      svg.append(txt(left, 16, 'calls on each level, with the steps each call does outside its recursive calls', { 'font-size': 11, fill: 'var(--ink-3)' }), txt(W0 - 8, 16, 'level total', { 'text-anchor': 'end', 'font-size': 11, fill: 'var(--ink-3)' }));
      const shown = Math.min(i, k), place = (j, c) => { const width = (W0 - left - right) / rows[j].calls; return left + width * c + width / 2; };
      rows.forEach((r, j) => {
        const y = 26 + j * rowH + 18, on = j <= shown, width = (W0 - left - right) / r.calls, bw = Math.max(10, Math.min(46, width - 4));
        if (on && j > 0) for (let c = 0; c < r.calls; c++) svg.append(sv('line', { x1: place(j - 1, Math.floor(c / K.a)), y1: y - rowH + 11, x2: place(j, c), y2: y - 11, stroke: 'var(--rule)' }));
        for (let c = 0; c < r.calls && on; c++) {
          const x = place(j, c);
          svg.append(sv('rect', { x: x - bw / 2, y: y - 11, width: bw, height: 22, rx: 6, fill: j === shown ? 'var(--accent-soft)' : 'var(--paper)', stroke: 'var(--accent)' }));
          if (bw >= 14 || String(r.work).length < 2) svg.append(mono(x, y + 4, String(r.work), { 'text-anchor': 'middle', 'font-size': bw < 20 ? 9 : 11 }));
        }
        if (on) svg.append(txt(W0 - 8, y + 4, (r.calls > 1 ? r.calls + ' × ' + r.work + ' = ' : '') + r.sum, { 'text-anchor': 'end', 'font-size': 12, 'font-weight': j === shown ? 600 : 400, fill: 'var(--ink)' }));
        else svg.append(txt(W0 - 8, y + 4, '?', { 'text-anchor': 'end', 'font-size': 12, fill: 'var(--ink-3)' }));
      });
      const r = rows[shown], done = i > k, sizes = r.calls === 1 ? 'one call' : r.calls + ' calls';
      if (done) { const total = rows.reduce((s, x) => s + x.sum, 0); status.textContent = 'All ' + rows.length + ' levels: ' + rows.map((x) => x.sum).join(' + ') + ' = ' + total + ', which is ' + K.form(n, k) + '.'; }
      else status.textContent = 'Level ' + shown + ': ' + sizes + ' on ' + r.size + (r.size === 1 ? ' item' : ' items') + (shown === k ? ', the base case, ' : ', ') + r.work + (r.work === 1 ? ' step' : ' steps') + ' each: ' + r.sum + ' on this level.';
    }
    function restart() {
      if (step) step.stop();
      const levels = Math.round(Math.log2(n)) + 1;
      step = stepper(levels + 1, render, { interval: 900 });
      tools.replaceChildren(step.el);
    }
    const pick = el('select', { 'aria-label': 'the recurrence', onchange: (e) => { kind = e.target.value; restart(); } }, Object.keys(KINDS).map((key) => el('option', { value: key, selected: key === kind ? '' : null }, KINDS[key].label)));
    const size = el('select', { 'aria-label': 'n', onchange: (e) => { n = +e.target.value; restart(); } }, [8, 16, 32].map((v) => el('option', { value: String(v), selected: v === n ? '' : null }, 'n = ' + v)));
    restart();
    mount.append(el('div', { class: 'fig-tools' }, pick, size), el('div', { class: 'fig-scroll' }, svg), tools, status);
  };
})();
