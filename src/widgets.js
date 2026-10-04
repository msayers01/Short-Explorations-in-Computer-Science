/* Interactive figures used in the lessons: window.WIDGETS[name](mount, block, course). */
(function () {
  'use strict';
  const { el, esc } = window.__h;
  const NS = 'http://www.w3.org/2000/svg';
  function sv(tag, attrs, ...kids) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) if (attrs[k] !== null && attrs[k] !== undefined) e.setAttribute(k, attrs[k]);
    for (const k of kids.flat()) if (k != null) e.appendChild(typeof k === 'string' ? document.createTextNode(k) : k);
    return e;
  }
  const txt = (x, y, s, attrs) => sv('text', Object.assign({ x, y, 'font-size': 13, fill: 'var(--ink)' }, attrs || {}), s);
  const mono = (x, y, s, attrs) => txt(x, y, s, Object.assign({ 'font-family': 'var(--mono)' }, attrs || {}));

  /** Generic step controls: Back / Step / Play / Reset over n steps. */
  function stepper(n, render, opts) {
    opts = opts || {};
    let i = 0, timer = null;
    const status = el('span', { class: 'fig-note', role: 'status' });
    const set = (k) => { i = Math.max(0, Math.min(n - 1, k)); render(i); status.textContent = 'step ' + (i + 1) + ' of ' + n; back.disabled = i === 0; fwd.disabled = i === n - 1; if (i === n - 1) stop(); };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; play.textContent = 'Play'; } };
    const back = el('button', { class: 'btn sm', onclick: () => { stop(); set(i - 1); } }, 'Back');
    const fwd = el('button', { class: 'btn sm primary', onclick: () => { stop(); set(i + 1); } }, 'Step');
    const play = el('button', { class: 'btn sm', onclick: () => { if (timer) return stop(); if (i === n - 1) set(0); play.textContent = 'Pause'; timer = setInterval(() => set(i + 1), opts.interval || 700); } }, 'Play');
    const reset = el('button', { class: 'btn sm quiet', onclick: () => { stop(); set(0); } }, 'Reset');
    const bar = el('div', { class: 'fig-tools' }, back, fwd, play, reset, status);
    set(0);
    return { el: bar, set, get index() { return i; }, stop };
  }

  const W = window.WIDGETS = {};

  /* ---------- 1. Python names → objects ---------- */
  W.names = function (mount) {
    const steps = [
      { code: 'x = 5', names: { x: 'a' }, objs: { a: { v: '5', t: 'int' } }, note: 'Python makes an int object 5 and attaches the name x to it.' },
      { code: 'y = x', names: { x: 'a', y: 'a' }, objs: { a: { v: '5', t: 'int' } }, note: 'No copy is made: y is a second name for the same object.' },
      { code: 'x = x + 1', names: { x: 'b', y: 'a' }, objs: { a: { v: '5', t: 'int' }, b: { v: '6', t: 'int' } }, note: 'x + 1 makes a new object 6 and x moves to it. y still points at 5 — that is why y did not change.' },
      { code: 'name = "Ada"', names: { x: 'b', y: 'a', name: 'c' }, objs: { a: { v: '5', t: 'int' }, b: { v: '6', t: 'int' }, c: { v: '"Ada"', t: 'str' } }, note: 'A name can point at any kind of object; the type belongs to the object, not the name.' },
      { code: 'x = name', names: { x: 'c', y: 'a', name: 'c' }, objs: { a: { v: '5', t: 'int' }, b: { v: '6', t: 'int' }, c: { v: '"Ada"', t: 'str' } }, note: 'x now names a string. Nothing points at 6 any more, so Python will quietly reclaim it.' }
    ];
    const svg = sv('svg', { viewBox: '0 0 520 200', role: 'img', 'aria-label': 'Names pointing to objects' });
    const codeLine = el('div', { class: 'subst' });
    const note = el('div', { class: 'trace-note', role: 'status' });
    function render(i) {
      const s = steps[i]; svg.innerHTML = '';
      codeLine.innerHTML = steps.map((st, k) => '<span class="' + (k === i ? 'now' : k < i ? '' : 'dim') + '">' + esc(st.code) + '</span>').join('\n');
      note.textContent = s.note;
      const objKeys = ['a', 'b', 'c']; const objY = { a: 40, b: 100, c: 160 };
      const nameKeys = ['x', 'y', 'name']; const nameY = { x: 40, y: 100, name: 160 };
      svg.append(txt(20, 18, 'names', { fill: 'var(--ink-3)', 'font-size': 11 }), txt(330, 18, 'objects', { fill: 'var(--ink-3)', 'font-size': 11 }));
      for (const k of objKeys) if (s.objs[k]) {
        const o = s.objs[k]; const live = Object.values(s.names).includes(k);
        svg.append(sv('rect', { x: 330, y: objY[k] - 18, width: 120, height: 36, rx: 3, fill: live ? 'var(--paper)' : 'var(--paper-2)', stroke: live ? 'var(--ink)' : 'var(--rule)', 'stroke-width': 1.2 }));
        svg.append(mono(342, objY[k] + 5, o.v, { fill: live ? 'var(--ink)' : 'var(--ink-3)', 'font-size': 14 }));
        svg.append(txt(456, objY[k] + 4, o.t, { fill: 'var(--ink-3)', 'font-size': 11 }));
      }
      for (const nm of nameKeys) if (s.names[nm]) {
        const y = nameY[nm], target = s.names[nm];
        svg.append(sv('rect', { x: 20, y: y - 16, width: 70, height: 32, rx: 16, fill: 'var(--accent-soft)', stroke: 'var(--accent)' }));
        svg.append(mono(55, y + 5, nm, { 'text-anchor': 'middle', 'font-size': 14 }));
        const ty = objY[target];
        svg.append(sv('path', { d: `M92 ${y} C 200 ${y}, 220 ${ty}, 326 ${ty}`, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 1.6, 'marker-end': 'url(#arr)' }));
      }
      svg.prepend(sv('defs', {}, sv('marker', { id: 'arr', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, sv('path', { d: 'M0 0L10 5L0 10z', fill: 'var(--accent)' }))));
    }
    const ctl = stepper(steps.length, render);
    mount.append(codeLine, svg, note, ctl.el);
  };

  /* ---------- 2. generic trace stepper (frames + line highlight) ---------- */
  W.trace = function (mount, b) {
    const lines = b.code.split('\n');
    const pre = el('pre', {}, lines.map((l, i) => el('span', { class: 'ln', html: (i + 1 < 10 ? ' ' : '') + (i + 1) + '  ' + window.__highlight(l, b.lang || 'python').replace(/\n$/, '') })));
    const state = el('div', { class: 'trace-state' });
    const note = el('div', { class: 'trace-note', role: 'status' });
    const box = el('div', { class: 'trace' }, pre, el('div', {}, state, note));
    let prev = null;
    function render(i) {
      const s = b.steps[i];
      pre.querySelectorAll('.ln').forEach((ln, k) => ln.classList.toggle('on', k + 1 === s.line));
      state.innerHTML = '';
      const prevVars = prev && i > 0 ? b.steps[i - 1].frames : null;
      (s.frames || []).forEach((f, fi) => {
        const fr = el('div', { class: 'frame' }, el('div', { class: 'frame-name' }, f.name));
        const vars = el('div', { class: 'frame-vars' });
        const pv = prevVars && prevVars[fi] && prevVars[fi].name === f.name ? prevVars[fi].vars : {};
        for (const k in f.vars) vars.append(el('span', { class: pv[k] !== f.vars[k] ? 'changed' : '' }, k), el('span', { class: pv[k] !== f.vars[k] ? 'changed' : '' }, String(f.vars[k])));
        if (!Object.keys(f.vars).length) vars.append(el('span', { style: 'color:var(--ink-3)' }, '(empty)'));
        fr.append(vars); state.append(fr);
      });
      if (s.out !== undefined) state.append(el('div', { class: 'trace-out' }, el('span', { class: 'lbl' }, 'output so far\n'), s.out || '(nothing yet)'));
      note.textContent = s.note || ''; prev = s;
    }
    const ctl = stepper(b.steps.length, render, { interval: 900 });
    mount.append(box, ctl.el);
  };

  /* ---------- 3. list index ruler + slice explorer ---------- */
  W.indexer = function (mount, b) {
    const items = b.items || ['p', 'y', 't', 'h', 'o', 'n'];
    const n = items.length, cw = 54, x0 = 30;
    const svg = sv('svg', { viewBox: '0 0 ' + (x0 * 2 + cw * n) + ' 150', role: 'img', 'aria-label': 'List indices' });
    const startIn = el('input', { type: 'text', value: '1', size: 4, 'aria-label': 'start' }), stopIn = el('input', { type: 'text', value: '4', size: 4, 'aria-label': 'stop' });
    const status = el('div', { class: 'fig-status', role: 'status' });
    function parse(s) { s = s.trim(); if (s === '') return null; const v = parseInt(s, 10); return isNaN(v) ? undefined : v; }
    function render() {
      svg.innerHTML = '';
      let a = parse(startIn.value), z = parse(stopIn.value);
      const bad = a === undefined || z === undefined;
      let lo = a == null ? 0 : a < 0 ? Math.max(0, n + a) : Math.min(n, a);
      let hi = z == null ? n : z < 0 ? Math.max(0, n + z) : Math.min(n, z);
      svg.append(txt(x0, 22, 'index', { fill: 'var(--ink-3)', 'font-size': 11 }), txt(x0, 130, 'negative index', { fill: 'var(--ink-3)', 'font-size': 11 }));
      items.forEach((it, i) => {
        const x = x0 + i * cw, sel = !bad && i >= lo && i < hi;
        svg.append(sv('rect', { x, y: 40, width: cw, height: 50, fill: sel ? 'var(--accent-soft)' : 'var(--paper)', stroke: 'var(--ink)', 'stroke-width': 1.2 }));
        svg.append(mono(x + cw / 2, 71, typeof it === 'string' ? "'" + it + "'" : String(it), { 'text-anchor': 'middle', 'font-size': 15 }));
        svg.append(mono(x + cw / 2, 34, String(i), { 'text-anchor': 'middle', fill: 'var(--accent)', 'font-size': 12 }));
        svg.append(mono(x + cw / 2, 108, String(i - n), { 'text-anchor': 'middle', fill: 'var(--ink-3)', 'font-size': 12 }));
      });
      // slice boundaries are between cells
      if (!bad) {
        for (const [pos, label] of [[lo, 'start'], [hi, 'stop']]) {
          const x = x0 + pos * cw;
          svg.append(sv('line', { x1: x, y1: 36, x2: x, y2: 94, stroke: 'var(--accent)', 'stroke-width': 2.5 }));
          svg.append(txt(x, 146, label, { 'text-anchor': 'middle', fill: 'var(--accent)', 'font-size': 11 }));
        }
        const res = items.slice(lo, hi);
        status.innerHTML = 'items[' + esc(startIn.value.trim()) + ':' + esc(stopIn.value.trim()) + ']  →  <span class="ok">' + esc(JSON.stringify(res).replace(/"/g, "'")) + '</span>';
      } else status.innerHTML = '<span class="err">start and stop must be integers or empty</span>';
    }
    startIn.addEventListener('input', render); stopIn.addEventListener('input', render);
    mount.append(svg, el('div', { class: 'fig-tools' }, el('span', {}, 'items = ' + JSON.stringify(items).replace(/"/g, "'")), el('span', {}, 'items['), startIn, el('span', {}, ':'), stopIn, el('span', {}, ']')), status);
    render();
  };

  /* ---------- 4. binary search ---------- */
  W.search = function (mount, b) {
    const arr = b.items || [2, 5, 8, 12, 16, 23, 38, 42, 56, 61, 72, 79, 85, 91, 97, 104];
    const n = arr.length, cw = 40, x0 = 14;
    const svg = sv('svg', { viewBox: '0 0 ' + (x0 * 2 + n * cw) + ' 120', role: 'img', 'aria-label': 'Binary search' });
    const target = el('input', { type: 'number', value: '61', 'aria-label': 'target' });
    const log = el('div', { class: 'fig-status', role: 'status' });
    let steps = [];
    function compute() {
      const t = parseInt(target.value, 10); steps = [];
      if (isNaN(t)) { steps.push({ lo: 0, hi: n - 1, mid: null, msg: 'Type a whole number to search for.' }); return; }
      let lo = 0, hi = n - 1, k = 0;
      steps.push({ lo, hi, mid: null, msg: 'Search for ' + t + ' in a sorted list of ' + n + '. Start with the whole range.' });
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2); k++;
        if (arr[mid] === t) { steps.push({ lo, hi, mid, found: true, msg: 'Compare with the middle, arr[' + mid + '] = ' + arr[mid] + ': equal. Found after ' + k + ' comparison' + (k > 1 ? 's' : '') + '.' }); return; }
        if (arr[mid] < t) { steps.push({ lo, hi, mid, msg: 'arr[' + mid + '] = ' + arr[mid] + ' < ' + t + ', so the answer can only be to the right. Discard the left half.' }); lo = mid + 1; }
        else { steps.push({ lo, hi, mid, msg: 'arr[' + mid + '] = ' + arr[mid] + ' > ' + t + ', so the answer can only be to the left. Discard the right half.' }); hi = mid - 1; }
      }
      steps.push({ lo, hi, mid: null, msg: 'The range is empty: ' + t + ' is not in the list. That took ' + k + ' comparisons; a linear scan would take up to ' + n + '.' });
    }
    function render(i) {
      const s = steps[i]; svg.innerHTML = '';
      arr.forEach((v, k) => {
        const x = x0 + k * cw, inRange = k >= s.lo && k <= s.hi;
        const fill = s.mid === k ? (s.found ? 'var(--ok)' : 'var(--accent)') : inRange ? 'var(--accent-soft)' : 'var(--paper-2)';
        svg.append(sv('rect', { x, y: 40, width: cw - 4, height: 40, fill, stroke: inRange ? 'var(--ink)' : 'var(--rule)' }));
        svg.append(mono(x + cw / 2 - 2, 65, String(v), { 'text-anchor': 'middle', fill: s.mid === k ? 'var(--accent-ink)' : inRange ? 'var(--ink)' : 'var(--ink-3)', 'font-size': 12 }));
        svg.append(mono(x + cw / 2 - 2, 30, String(k), { 'text-anchor': 'middle', fill: 'var(--ink-3)', 'font-size': 10 }));
      });
      if (s.lo <= s.hi) {
        const lx = x0 + s.lo * cw, hx = x0 + s.hi * cw + cw - 4;
        svg.append(sv('path', { d: `M${lx} 92 v6 H${hx} v-6`, fill: 'none', stroke: 'var(--ink-2)' }));
        svg.append(txt(lx, 112, 'lo = ' + s.lo, { 'font-size': 11, fill: 'var(--ink-2)' }), txt(hx, 112, 'hi = ' + s.hi, { 'font-size': 11, fill: 'var(--ink-2)', 'text-anchor': 'end' }));
        if (s.mid !== null) svg.append(txt(x0 + s.mid * cw + cw / 2 - 2, 112, 'mid', { 'font-size': 11, fill: 'var(--accent)', 'text-anchor': 'middle', 'font-weight': 600 }));
      }
      log.textContent = s.msg;
    }
    compute();
    let ctl = stepper(steps.length, render, { interval: 1100 });
    const tools = el('div', { class: 'fig-tools' }, el('span', {}, 'target'), target, el('button', { class: 'btn sm', onclick: () => { compute(); ctl.stop(); const old = ctl.el; ctl = stepper(steps.length, render, { interval: 1100 }); old.replaceWith(ctl.el); } }, 'Search'));
    mount.append(el('div', { class: 'fig-scroll' }, svg), tools, log, ctl.el);
  };

  /* ---------- 5. sorting animation ---------- */
  W.sort = function (mount, b) {
    const algo = b.algo || 'bubble';
    let arr = (b.items || [7, 3, 9, 1, 6, 8, 2, 5, 4]).slice();
    const n = arr.length, cw = 48, x0 = 10, H = 150;
    const svg = sv('svg', { viewBox: '0 0 ' + (x0 * 2 + n * cw) + ' ' + (H + 30), role: 'img', 'aria-label': algo + ' sort' });
    const log = el('div', { class: 'fig-status', role: 'status' });
    let steps = [];
    function record(a, opts) { steps.push(Object.assign({ a: a.slice() }, opts)); }
    function compute() {
      steps = []; const a = arr.slice();
      if (algo === 'bubble') {
        record(a, { msg: 'Bubble sort: repeatedly compare neighbours and swap them if they are out of order.' });
        for (let i = 0; i < n - 1; i++) {
          let swapped = false;
          for (let j = 0; j < n - 1 - i; j++) {
            record(a, { cmp: [j, j + 1], sortedFrom: n - i, msg: 'Compare ' + a[j] + ' and ' + a[j + 1] + (a[j] > a[j + 1] ? ': out of order, swap.' : ': in order, leave them.') });
            if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; swapped = true; record(a, { swap: [j, j + 1], sortedFrom: n - i, msg: 'Swapped.' }); }
          }
          record(a, { sortedFrom: n - i - 1, msg: 'End of pass ' + (i + 1) + ': the largest remaining value (' + a[n - 1 - i] + ') has bubbled to its final place.' });
          if (!swapped) break;
        }
        record(a, { sortedFrom: 0, msg: 'Sorted.' });
      } else if (algo === 'selection') {
        record(a, { msg: 'Selection sort: find the smallest of the unsorted part and move it to the front.' });
        for (let i = 0; i < n - 1; i++) {
          let m = i;
          for (let j = i + 1; j < n; j++) { record(a, { cmp: [m, j], sortedTo: i, msg: 'Smallest so far is ' + a[m] + '; compare with ' + a[j] + '.' }); if (a[j] < a[m]) m = j; }
          if (m !== i) { [a[i], a[m]] = [a[m], a[i]]; record(a, { swap: [i, m], sortedTo: i + 1, msg: 'Swap ' + a[m] + ' with the smallest, ' + a[i] + '.' }); }
          else record(a, { sortedTo: i + 1, msg: a[i] + ' is already the smallest — no swap needed.' });
        }
        record(a, { sortedTo: n, msg: 'Sorted.' });
      } else {
        record(a, { msg: 'Insertion sort: take each value and slide it left into the sorted prefix.' });
        for (let i = 1; i < n; i++) {
          let j = i;
          record(a, { cmp: [j], sortedTo: i, msg: 'Take ' + a[i] + '.' });
          while (j > 0 && a[j - 1] > a[j]) { [a[j - 1], a[j]] = [a[j], a[j - 1]]; j--; record(a, { swap: [j, j + 1], sortedTo: i + 1, msg: 'Slide it left past ' + a[j + 1] + '.' }); }
          record(a, { sortedTo: i + 1, msg: 'The first ' + (i + 1) + ' values are sorted.' });
        }
        record(a, { sortedTo: n, msg: 'Sorted.' });
      }
    }
    const max = Math.max(...arr);
    function render(i) {
      const s = steps[i]; svg.innerHTML = '';
      s.a.forEach((v, k) => {
        const x = x0 + k * cw, h = (v / max) * H;
        const sorted = (s.sortedFrom !== undefined && k >= s.sortedFrom) || (s.sortedTo !== undefined && k < s.sortedTo);
        const active = (s.cmp && s.cmp.includes(k)) || (s.swap && s.swap.includes(k));
        const fill = s.swap && s.swap.includes(k) ? 'var(--ok)' : active ? 'var(--accent)' : sorted ? 'var(--ink-3)' : 'var(--accent-soft)';
        svg.append(sv('rect', { x: x + 4, y: H - h + 5, width: cw - 8, height: h, fill, stroke: active ? 'var(--ink)' : 'var(--rule)' }));
        svg.append(mono(x + cw / 2, H + 22, String(v), { 'text-anchor': 'middle', 'font-size': 12, fill: active ? 'var(--ink)' : 'var(--ink-2)' }));
      });
      log.textContent = s.msg;
    }
    compute();
    let ctl = stepper(steps.length, render, { interval: 550 });
    const shuffle = el('button', { class: 'btn sm', onclick: () => { for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } compute(); ctl.stop(); const old = ctl.el; ctl = stepper(steps.length, render, { interval: 550 }); old.replaceWith(ctl.el); } }, 'Shuffle');
    mount.append(svg, log, ctl.el, el('div', { class: 'fig-tools' }, shuffle));
  };

  /* ---------- 6. Caesar wheel ---------- */
  W.caesar = function (mount) {
    const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const svg = sv('svg', { viewBox: '0 0 560 90', role: 'img', 'aria-label': 'Caesar shift' });
    const range = el('input', { type: 'range', min: 0, max: 25, value: 3, 'aria-label': 'shift' });
    const text = el('input', { type: 'text', value: 'MEET ME AT NOON', size: 24, 'aria-label': 'message' });
    const status = el('div', { class: 'fig-status', role: 'status' });
    function render() {
      const k = +range.value; svg.innerHTML = '';
      svg.append(txt(6, 22, 'plain', { fill: 'var(--ink-3)', 'font-size': 11 }), txt(6, 72, 'cipher', { fill: 'var(--ink-3)', 'font-size': 11 }));
      for (let i = 0; i < 26; i++) {
        const x = 50 + i * 19.5;
        svg.append(mono(x, 24, A[i], { 'text-anchor': 'middle', 'font-size': 13 }));
        svg.append(sv('line', { x1: x, y1: 32, x2: x, y2: 56, stroke: 'var(--rule)' }));
        svg.append(mono(x, 74, A[(i + k) % 26], { 'text-anchor': 'middle', 'font-size': 13, fill: 'var(--accent)', 'font-weight': 600 }));
      }
      const out = text.value.toUpperCase().split('').map(c => A.includes(c) ? A[(A.indexOf(c) + k) % 26] : c).join('');
      status.innerHTML = 'shift ' + k + ':  ' + esc(text.value.toUpperCase()) + '  →  <span class="ok">' + esc(out) + '</span>';
    }
    range.addEventListener('input', render); text.addEventListener('input', render);
    mount.append(svg, el('div', { class: 'fig-tools' }, el('span', {}, 'shift'), range, el('span', {}, 'message'), text), status);
    render();
  };

  /* ---------- 7. SICP evaluation tree ---------- */
  W.evaltree = function (mount, b) {
    const input = el('input', { type: 'text', value: b.expr || '(* (+ 2 (* 4 6)) (+ 3 5 7))', size: 34, 'aria-label': 'expression' });
    const holder = el('div', { class: 'fig-scroll' });
    const status = el('div', { class: 'fig-status', role: 'status' });
    function build(x, it) {
      if (x instanceof Scheme.Pair) {
        const kids = []; let p = x; while (p instanceof Scheme.Pair) { kids.push(build(p.car, it)); p = p.cdr; }
        let value, err = null; try { value = it.evaluate(x, it.G); } catch (e) { err = e.message; }
        return { label: kids[0].label, kids: kids.slice(1), value: err ? '?' : Scheme.write(value), err };
      }
      let value; try { value = it.evaluate(x, it.G); } catch (e) { value = x; }
      return { label: Scheme.write(x), kids: [], value: Scheme.write(value), leaf: true };
    }
    function render() {
      holder.innerHTML = ''; status.textContent = '';
      let forms; try { forms = Scheme.parseAll(input.value); } catch (e) { status.innerHTML = '<span class="err">' + esc(e.message) + '</span>'; return; }
      if (!forms.length) return;
      const it = Scheme.makeEvaluator();
      const tree = build(forms[0], it);
      const LW = 44, LH = 70;
      const width = (t) => { t.w = t.kids.length ? Math.max(LW, t.kids.reduce((s, k) => s + width(k), 0) + (t.kids.length - 1) * 10) : LW; return t.w; };
      width(tree);
      const depth = (t) => 1 + (t.kids.length ? Math.max(...t.kids.map(depth)) : 0);
      const H = depth(tree) * LH + 20, Wd = tree.w + 40;
      const svg = sv('svg', { viewBox: '0 0 ' + Wd + ' ' + H, width: Math.min(Wd, 700), role: 'img', 'aria-label': 'Evaluation tree' });
      svg.style.width = Math.min(Wd, 760) + 'px'; svg.style.maxWidth = '100%';
      function draw(t, x, y) {
        const cx = x + t.w / 2;
        if (t.kids.length) {
          let kx = x;
          for (const k of t.kids) {
            const kcx = kx + k.w / 2;
            svg.append(sv('line', { x1: cx, y1: y + 12, x2: kcx, y2: y + LH - 14, stroke: 'var(--rule)', 'stroke-width': 1.5 }));
            draw(k, kx, y + LH); kx += k.w + 10;
          }
          svg.append(sv('circle', { cx, cy: y, r: 16, fill: 'var(--accent)' }));
          svg.append(mono(cx, y + 5, t.label, { 'text-anchor': 'middle', fill: 'var(--accent-ink)', 'font-size': 14, 'font-weight': 600 }));
          svg.append(mono(cx + 22, y + 5, t.value, { fill: t.err ? 'var(--err)' : 'var(--ink)', 'font-size': 13 }));
        } else {
          svg.append(mono(cx, y + 5, t.label, { 'text-anchor': 'middle', 'font-size': 14 }));
          if (t.value !== t.label) svg.append(mono(cx, y + 22, '= ' + t.value, { 'text-anchor': 'middle', fill: 'var(--ink-3)', 'font-size': 11 }));
        }
      }
      draw(tree, 20, 22);
      holder.append(svg);
      if (tree.err) status.innerHTML = '<span class="err">' + esc(tree.err) + '</span>';
      else status.innerHTML = 'value of the whole combination: <span class="ok">' + esc(tree.value) + '</span>';
    }
    input.addEventListener('input', render);
    mount.append(el('div', { class: 'fig-tools' }, el('span', {}, 'expression'), input), holder, status);
    render();
  };

  /* ---------- 8. substitution model / process shapes ---------- */
  function factorialSteps(n) {   // Lesson 4's factorial: base case (= n 0)
    const s = ['(factorial ' + n + ')'];
    let pre = '', post = '';
    for (let k = n; k >= 1; k--) { pre += '(* ' + k + ' '; post += ')'; s.push(pre + '(factorial ' + (k - 1) + ')' + post); }
    s.push(pre + '1' + post);
    let acc = 1;
    for (let k = 1; k <= n; k++) { acc *= k; pre = pre.slice(0, -('(* ' + k + ' ').length); post = post.slice(0, -1); s.push(pre + acc + post); }
    return s;
  }
  function factIterSteps(n) {
    const s = ['(factorial ' + n + ')'];
    let p = 1, c = 1;
    while (c <= n + 1) { s.push('(fact-iter ' + p + ' ' + c + ' ' + n + ')'); if (c > n) break; p *= c; c++; }
    s.push(String(p));
    return s;
  }
  W.subst = function (mount, b) {
    if (b.mode === 'shapes') {
      const n = b.n || 6;
      const rec = factorialSteps(n), iter = factIterSteps(n);
      const left = el('div', { class: 'subst' }), right = el('div', { class: 'subst' });
      const box = el('div', { class: 'shapes' }, el('div', {}, el('h4', {}, 'Linear recursive process'), left), el('div', {}, el('h4', {}, 'Linear iterative process'), right));
      const N = Math.max(rec.length, iter.length);
      function render(i) {
        left.innerHTML = rec.slice(0, i + 1).map((s, k) => '<span class="' + (k === Math.min(i, rec.length - 1) ? 'now' : 'dim') + '">' + esc(s) + '</span>').join('\n');
        right.innerHTML = iter.slice(0, Math.min(i + 1, iter.length)).map((s, k) => '<span class="' + (k === Math.min(i, iter.length - 1) ? 'now' : 'dim') + '">' + esc(s) + '</span>').join('\n');
      }
      const ctl = stepper(N, render, { interval: 600 });
      mount.append(box, ctl.el);
      return;
    }
    const steps = b.steps;
    const box = el('div', { class: 'subst' });
    const note = el('div', { class: 'trace-note', role: 'status' });
    function render(i) {
      box.innerHTML = steps.slice(0, i + 1).map((s, k) => '<span class="' + (k === i ? 'now' : 'dim') + '">' + esc(typeof s === 'string' ? s : s.text) + '</span>').join('\n');
      note.textContent = typeof steps[i] === 'string' ? '' : steps[i].note || '';
    }
    const ctl = stepper(steps.length, render, { interval: 900 });
    mount.append(box, note, ctl.el);
  };

  /* ---------- 9. two-set Venn diagram (math lesson 2) ---------- */
  W.venn = function (mount, b) {
    const parse = s => { const seen = [], raw = s.split(/[,\s]+/).map(t => t.trim()).filter(Boolean); for (const t of raw) if (!seen.includes(t)) seen.push(t); return { items: seen, dup: raw.length - seen.length }; };
    const inA = el('input', { type: 'text', value: (b.a || [1, 2, 3, 4, 5, 6]).join(', '), size: 22, 'aria-label': 'elements of A', oninput: render });
    const inB = el('input', { type: 'text', value: (b.b || [4, 5, 6, 7, 8]).join(', '), size: 22, 'aria-label': 'elements of B', oninput: render });
    const svg = sv('svg', { viewBox: '0 0 520 230', role: 'img', 'aria-label': 'Venn diagram of two sets' });
    const status = el('div', { class: 'fig-status', role: 'status' });
    function region(items, cx) {
      const per = 2, maxLines = 5, lines = [];
      for (let i = 0; i < items.length && lines.length < maxLines; i += per) lines.push(items.slice(i, i + per).join(', '));
      if (items.length > per * maxLines) lines[maxLines - 1] = '… ' + (items.length - per * (maxLines - 1)) + ' more';
      const top = 118 - (lines.length - 1) * 10;
      lines.forEach((ln, k) => svg.append(mono(cx, top + k * 20, ln, { 'text-anchor': 'middle', 'font-size': 13 })));
      if (!items.length) svg.append(txt(cx, 122, '(none)', { 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--ink-3)' }));
    }
    function render() {
      const A = parse(inA.value), B = parse(inB.value);
      const onlyA = A.items.filter(x => !B.items.includes(x)), both = A.items.filter(x => B.items.includes(x)), onlyB = B.items.filter(x => !A.items.includes(x));
      svg.innerHTML = '';
      svg.append(sv('circle', { cx: 190, cy: 115, r: 100, fill: 'var(--accent-soft)', 'fill-opacity': 0.55, stroke: 'var(--accent)', 'stroke-width': 1.5 }));
      svg.append(sv('circle', { cx: 330, cy: 115, r: 100, fill: 'var(--accent-soft)', 'fill-opacity': 0.55, stroke: 'var(--accent)', 'stroke-width': 1.5 }));
      svg.append(txt(110, 22, 'A', { 'font-size': 15, 'font-weight': 600, 'font-style': 'italic' }), txt(402, 22, 'B', { 'font-size': 15, 'font-weight': 600, 'font-style': 'italic' }));
      region(onlyA, 138); region(both, 260); region(onlyB, 382);
      svg.append(txt(138, 224, 'A − B: ' + onlyA.length, { 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--ink-3)' }), txt(260, 224, 'A ∩ B: ' + both.length, { 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--ink-3)' }), txt(382, 224, 'B − A: ' + onlyB.length, { 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--ink-3)' }));
      const a = A.items.length, bb = B.items.length, c = both.length, u = onlyA.length + c + onlyB.length;
      status.innerHTML = '|A| + |B| − |A ∩ B| = ' + a + ' + ' + bb + ' − ' + c + ' = <span class="ok">' + (a + bb - c) + '</span> &nbsp;and &nbsp;|A ∪ B| = ' + u +
        (A.dup + B.dup ? ' &nbsp;<span style="color:var(--ink-3)">(repeated elements ignored: a set has no repeats)</span>' : '');
    }
    mount.append(el('div', { class: 'fig-tools' }, el('label', {}, 'A = { ', inA, ' }'), el('label', {}, 'B = { ', inB, ' }')), el('div', { class: 'fig-scroll' }, svg), status);
    render();
  };

  /* ---------- 10. box-and-pointer ---------- */
  W.boxptr = function (mount, b) {
    const input = el('input', { type: 'text', value: b.expr || '(list 1 (list 2 3) 4)', size: 34, 'aria-label': 'expression' });
    const holder = el('div', { class: 'fig-scroll' });
    const status = el('div', { class: 'fig-status', role: 'status' });
    const CW = 28, GAP = 26, ROW = 64;
    function render() {
      holder.innerHTML = ''; status.textContent = '';
      let v;
      try { const r = Scheme.runProgram(input.value); if (r.error) throw new Error(r.error); if (!r.results.length) return; v = r.results[r.results.length - 1].value; }
      catch (e) { status.innerHTML = '<span class="err">' + esc(e.message) + '</span>'; return; }
      status.innerHTML = 'printed form: <span class="ok">' + esc(Scheme.write(v)) + '</span>';
      const items = [];
      const atomW = (x) => Math.max(CW, Scheme.write(x).length * 8 + 10);
      // layout pass: measure width of a chain
      function measure(p, seen) {
        if (!(p instanceof Scheme.Pair)) return atomW(p);
        let w = 0; let q = p; let guard = 0;
        while (q instanceof Scheme.Pair && guard++ < 200) {
          const carW = q.car instanceof Scheme.Pair ? measure(q.car) : atomW(q.car);
          w += Math.max(CW * 2, carW) + GAP;
          q = q.cdr;
        }
        if (q !== Scheme.NIL) w += atomW(q);
        return w;
      }
      function draw(p, x, y, depthMax) {
        let q = p, guard = 0;
        while (q instanceof Scheme.Pair && guard++ < 200) {
          items.push(sv('rect', { x, y, width: CW, height: CW, fill: 'var(--paper)', stroke: 'var(--ink)', 'stroke-width': 1.3 }));
          items.push(sv('rect', { x: x + CW, y, width: CW, height: CW, fill: 'var(--paper)', stroke: 'var(--ink)', 'stroke-width': 1.3 }));
          let carW;
          if (q.car instanceof Scheme.Pair) {
            carW = measure(q.car);
            items.push(sv('circle', { cx: x + CW / 2, cy: y + CW / 2, r: 3, fill: 'var(--ink)' }));
            items.push(sv('line', { x1: x + CW / 2, y1: y + CW / 2, x2: x + CW / 2, y2: y + ROW - 4, stroke: 'var(--accent)', 'stroke-width': 1.5, 'marker-end': 'url(#bp-arr)' }));
            depthMax.v = Math.max(depthMax.v, draw(q.car, x, y + ROW, depthMax));
          } else if (q.car === Scheme.NIL) {
            carW = CW; items.push(sv('line', { x1: x + 3, y1: y + CW - 3, x2: x + CW - 3, y2: y + 3, stroke: 'var(--ink)' }));
          } else {
            carW = atomW(q.car);
            items.push(sv('circle', { cx: x + CW / 2, cy: y + CW / 2, r: 3, fill: 'var(--ink)' }));
            items.push(sv('line', { x1: x + CW / 2, y1: y + CW / 2, x2: x + CW / 2, y2: y + ROW - 22, stroke: 'var(--accent)', 'stroke-width': 1.5, 'marker-end': 'url(#bp-arr)' }));
            items.push(sv('rect', { x: x + CW / 2 - carW / 2, y: y + ROW - 20, width: carW, height: 22, fill: 'var(--accent-soft)', stroke: 'var(--accent)' }));
            items.push(mono(x + CW / 2, y + ROW - 5, Scheme.write(q.car), { 'text-anchor': 'middle', 'font-size': 12 }));
            depthMax.v = Math.max(depthMax.v, y + ROW + 10);
          }
          const cellW = Math.max(CW * 2, carW);
          if (q.cdr instanceof Scheme.Pair) {
            items.push(sv('circle', { cx: x + CW * 1.5, cy: y + CW / 2, r: 3, fill: 'var(--ink)' }));
            items.push(sv('line', { x1: x + CW * 1.5, y1: y + CW / 2, x2: x + cellW + GAP - 4, y2: y + CW / 2, stroke: 'var(--accent)', 'stroke-width': 1.5, 'marker-end': 'url(#bp-arr)' }));
          } else if (q.cdr === Scheme.NIL) {
            items.push(sv('line', { x1: x + CW + 3, y1: y + CW - 3, x2: x + CW * 2 - 3, y2: y + 3, stroke: 'var(--ink)' }));
          } else {
            items.push(sv('circle', { cx: x + CW * 1.5, cy: y + CW / 2, r: 3, fill: 'var(--ink)' }));
            items.push(sv('line', { x1: x + CW * 1.5, y1: y + CW / 2, x2: x + cellW + GAP - 4, y2: y + CW / 2, stroke: 'var(--accent)', 'stroke-width': 1.5, 'marker-end': 'url(#bp-arr)' }));
            const aw = atomW(q.cdr);
            items.push(sv('rect', { x: x + cellW + GAP, y: y + 3, width: aw, height: 22, fill: 'var(--accent-soft)', stroke: 'var(--accent)' }));
            items.push(mono(x + cellW + GAP + aw / 2, y + 18, Scheme.write(q.cdr), { 'text-anchor': 'middle', 'font-size': 12 }));
          }
          x += cellW + GAP; q = q.cdr;
        }
        depthMax.v = Math.max(depthMax.v, y + CW + 10);
        return depthMax.v;
      }
      items.length = 0;
      if (!(v instanceof Scheme.Pair)) { holder.append(el('p', { style: 'color:var(--ink-2)' }, 'That value is not a pair, so there is nothing to draw: ' + Scheme.write(v))); return; }
      const dm = { v: 0 };
      const w = measure(v) + 40, h = draw(v, 20, 14, dm) + 10;
      const svg = sv('svg', { viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'aria-label': 'Box and pointer diagram' });
      svg.style.width = Math.min(w, 760) + 'px'; svg.style.maxWidth = '100%';
      svg.append(sv('defs', {}, sv('marker', { id: 'bp-arr', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, sv('path', { d: 'M0 0L10 5L0 10z', fill: 'var(--accent)' }))));
      items.forEach(i => svg.append(i));
      holder.append(svg);
    }
    input.addEventListener('input', render);
    mount.append(el('div', { class: 'fig-tools' }, el('span', {}, 'expression'), input), holder, status);
    render();
  };

  /* ---------- 11. higher-order pipeline ---------- */
  W.hof = function (mount) {
    const mapSel = el('select', { 'aria-label': 'map' }, ['square', '(lambda (x) (+ x 1))', '(lambda (x) (* 2 x))', 'fib'].map(o => el('option', { value: o }, o)));
    const filtSel = el('select', { 'aria-label': 'filter' }, ['odd?', 'even?', '(lambda (x) (> x 10))', '(lambda (x) #t)'].map(o => el('option', { value: o }, o)));
    const accSel = el('select', { 'aria-label': 'accumulate' }, ['+', '*', 'max', 'cons'].map(o => el('option', { value: o }, o)));
    const listIn = el('input', { type: 'text', value: '(1 2 3 4 5 6)', size: 18, 'aria-label': 'list' });
    const svg = sv('svg', { viewBox: '0 0 640 150', role: 'img', 'aria-label': 'map filter accumulate pipeline' });
    const status = el('div', { class: 'fig-status', role: 'status' });
    function render() {
      svg.innerHTML = '';
      const prog = `(define (fib n) (if (< n 2) n (+ (fib (- n 1)) (fib (- n 2)))))
(define (accumulate op initial sequence) (if (null? sequence) initial (op (car sequence) (accumulate op initial (cdr sequence)))))
(define xs '${listIn.value})
(define mapped (map ${mapSel.value} xs))
(define kept (filter ${filtSel.value} mapped))
(define init ${accSel.value === '+' ? 0 : accSel.value === '*' ? 1 : accSel.value === 'max' ? '-1000000' : "'()"})
(define result (accumulate ${accSel.value} init kept))
xs mapped kept result`;
      const r = Scheme.runProgram(prog);
      if (r.error) { status.innerHTML = '<span class="err">' + esc(r.error) + '</span>'; return; }
      const vals = r.results.slice(-4).map(x => x.text);
      const stages = [['list', vals[0]], ['(map ' + mapSel.value + ' …)', vals[1]], ['(filter ' + filtSel.value + ' …)', vals[2]], ['(accumulate ' + accSel.value + ' …)', vals[3]]];
      stages.forEach(([name, val], i) => {
        const x = 20 + i * 155;
        svg.append(sv('rect', { x, y: 30, width: 140, height: 70, rx: 4, fill: i === 3 ? 'var(--accent)' : 'var(--paper)', stroke: i === 3 ? 'var(--accent)' : 'var(--ink)' }));
        svg.append(txt(x + 70, 22, name.length > 24 ? name.slice(0, 23) + '…' : name, { 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--ink-2)', 'font-family': 'var(--mono)' }));
        svg.append(mono(x + 70, 70, val.length > 18 ? val.slice(0, 17) + '…' : val, { 'text-anchor': 'middle', 'font-size': 13, fill: i === 3 ? 'var(--accent-ink)' : 'var(--ink)' }));
        if (i < 3) svg.append(sv('path', { d: `M${x + 142} 65 h10`, stroke: 'var(--accent)', 'stroke-width': 2, 'marker-end': 'url(#hof-arr)' }));
      });
      svg.prepend(sv('defs', {}, sv('marker', { id: 'hof-arr', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, sv('path', { d: 'M0 0L10 5L0 10z', fill: 'var(--accent)' }))));
      status.innerHTML = 'map → ' + esc(vals[1]) + '<br>filter → ' + esc(vals[2]) + '<br>accumulate → <span class="ok">' + esc(vals[3]) + '</span>';
    }
    [mapSel, filtSel, accSel].forEach(s => s.addEventListener('change', render)); listIn.addEventListener('input', render);
    mount.append(el('div', { class: 'fig-tools' }, el('span', {}, 'list'), listIn, el('span', {}, 'map'), mapSel, el('span', {}, 'filter'), filtSel, el('span', {}, 'accumulate'), accSel), svg, status);
    render();
  };

  /* ---------- 12. C++ compile pipeline ---------- */
  /* ---------- SC 099: the parts of a computer, clickable ---------- */
  W.parts = function (mount) {
    const P = {
      input: ['Input devices', 'Keyboard, mouse, touchscreen, microphone, camera. They turn what you do into signals the computer can read. Nothing goes in any other way.'],
      cpu: ['CPU (processor)', 'The central processing unit carries out instructions, one after another, billions of times a second: arithmetic, comparisons, moving data. It does nothing on its own; it only follows the program it is given.'],
      ram: ['Memory (RAM)', 'The working memory. The programs that are running and the data they are using sit here, where the CPU can reach them in a few billionths of a second. It is emptied when the power goes off.'],
      storage: ['Storage (SSD or hard drive)', 'The long-term memory: files, programs and the operating system, kept when the power is off. Slower than RAM but far larger, and it does not forget.'],
      output: ['Output devices', 'Screen, speakers, printer, the lights on a keyboard. They turn the computer\'s results into something a person can see or hear.'],
      net: ['Network', 'The connection to other computers: Wi-Fi, Ethernet, mobile data. To a computer, the internet is input and output that happens to come from far away.']
    };
    const svg = sv('svg', { viewBox: '0 0 640 300', role: 'img', 'aria-label': 'The parts of a computer' });
    const box = (key, x, y, w, h, label) => { const g = sv('g', { class: 'parts-box', tabindex: '0', role: 'button', 'data-key': key }); g.append(sv('rect', { x, y, width: w, height: h, rx: 6, fill: 'var(--paper)', stroke: 'var(--ink)', 'stroke-width': 1.4 }), txt(x + w / 2, y + h / 2 + 5, label, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 600 })); svg.append(g); return g; };
    const arrow = (x1, y1, x2, y2, both) => svg.append(sv('path', { d: `M${x1} ${y1} L${x2} ${y2}`, stroke: 'var(--ink-2)', 'stroke-width': 1.5, 'marker-end': 'url(#pt-arr)', 'marker-start': both ? 'url(#pt-arr2)' : null }));
    svg.append(sv('defs', {}, sv('marker', { id: 'pt-arr', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, sv('path', { d: 'M0 0L10 5L0 10z', fill: 'var(--ink-2)' })), sv('marker', { id: 'pt-arr2', viewBox: '0 0 10 10', refX: 1, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, sv('path', { d: 'M10 0L0 5L10 10z', fill: 'var(--ink-2)' }))));
    svg.append(sv('rect', { x: 200, y: 20, width: 240, height: 260, rx: 10, fill: 'var(--accent-soft)', stroke: 'var(--rule)' }), txt(320, 42, 'inside the case', { 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--ink-3)' }));
    box('input', 20, 60, 140, 50, 'Input');
    box('cpu', 260, 70, 120, 56, 'CPU');
    box('ram', 260, 150, 120, 50, 'Memory (RAM)');
    box('storage', 260, 220, 120, 50, 'Storage');
    box('output', 480, 60, 140, 50, 'Output');
    box('net', 480, 190, 140, 50, 'Network');
    arrow(160, 85, 258, 92); arrow(382, 92, 478, 85); arrow(320, 128, 320, 148, true); arrow(320, 202, 320, 218, true); arrow(382, 110, 478, 200, true);
    const info = el('div', { class: 'fig-note parts-info' }, 'Click a part to read what it does.');
    svg.querySelectorAll('.parts-box').forEach((g) => { const pick = () => { svg.querySelectorAll('.parts-box').forEach((o) => o.classList.remove('on')); g.classList.add('on'); const [name, text] = P[g.dataset.key]; info.replaceChildren(el('b', {}, name + '. '), text); }; g.addEventListener('click', pick); g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } }); });
    mount.append(svg, info);
  };

  /* ---------- SC 099: a tiny CPU running a four-instruction program, one phase at a time ---------- */
  // memory: 0 LOAD 5 · 1 ADD 6 · 2 STORE 7 · 3 HALT · 5: 3 · 6: 4 · 7: (result). Registers: PC, IR, ACC.
  W.cpu = function (mount) {
    const prog = ['LOAD 5', 'ADD 6', 'STORE 7', 'HALT', '', '3', '4', ''];
    const steps = [];
    let mem = prog.slice(), pc = 0, acc = 0, ir = '';
    const snap = (phase, note, hl) => steps.push({ mem: mem.slice(), pc, acc, ir, phase, note, hl });
    snap('start', 'The program is in memory at addresses 0 to 3, the data at 5 and 6. PC (program counter) points at address 0.', -1);
    for (;;) {
      ir = mem[pc]; const at = pc; pc++;
      snap('fetch', 'Fetch: copy the instruction at address ' + at + ' into IR, and move PC on to ' + pc + '.', at);
      const [op, a] = ir.split(' ');
      snap('decode', 'Decode: the instruction is ' + ir + ', so ' + (op === 'LOAD' ? 'copy memory[' + a + '] into ACC' : op === 'ADD' ? 'add memory[' + a + '] to ACC' : op === 'STORE' ? 'copy ACC into memory[' + a + ']' : 'stop') + '.', at);
      if (op === 'LOAD') acc = +mem[+a]; else if (op === 'ADD') acc += +mem[+a]; else if (op === 'STORE') mem[+a] = String(acc);
      snap('execute', op === 'HALT' ? 'Execute: HALT. The CPU stops. memory[7] now holds the sum, 7.' : 'Execute: done. ACC is now ' + acc + (op === 'STORE' ? ' and memory[' + a + '] holds ' + mem[+a] : '') + '.', op === 'HALT' ? at : +a);
      if (op === 'HALT') break;
    }
    const regs = el('div', { class: 'cpu-regs' });
    const memT = el('table', { class: 'fill cpu-mem' });
    const note = el('p', { class: 'fig-note' });
    const render = (i) => {
      const st = steps[i];
      regs.replaceChildren(...[['PC', st.pc], ['IR', st.ir || '—'], ['ACC', st.acc]].map(([k, v]) => el('div', { class: 'cpu-reg' }, el('span', { class: 'cpu-k' }, k), el('code', {}, String(v)))), el('div', { class: 'cpu-phase ' + st.phase }, st.phase));
      memT.replaceChildren(el('thead', {}, el('tr', {}, el('th', {}, 'address'), el('th', {}, 'contents'))), el('tbody', {}, st.mem.map((v, a) => el('tr', { class: (a === st.hl ? 'hl' : '') + (a === st.pc ? ' pc' : '') }, el('td', {}, el('code', {}, String(a))), el('td', {}, el('code', {}, v === '' ? '' : v), a === st.pc ? el('span', { class: 'fig-note' }, ' ← PC') : null)))));
      note.textContent = st.note;
    };
    const ctl = stepper(steps.length, render, { interval: 1100 });
    mount.append(el('div', { class: 'cpu-fig' }, el('div', {}, regs, note), memT), ctl.el);
  };

  /* ---------- SC 099: one byte, eight switches ---------- */
  W.bits = function (mount, b) {
    const n = 8; let bits = Array(n).fill(0);
    if (typeof b.value === 'number') bits = bits.map((_, i) => (b.value >> (n - 1 - i)) & 1);
    const row = el('div', { class: 'bits-row' });
    const out = el('p', { class: 'bits-out' });
    const render = () => {
      row.replaceChildren(...bits.map((v, i) => el('button', { class: 'bit' + (v ? ' on' : ''), type: 'button', 'aria-pressed': v ? 'true' : 'false', 'aria-label': 'bit worth ' + (1 << (n - 1 - i)), onclick: () => { bits[i] = 1 - bits[i]; render(); } }, el('span', { class: 'bit-w' }, String(1 << (n - 1 - i))), el('span', { class: 'bit-v' }, String(v)))));
      const value = bits.reduce((a, v) => a * 2 + v, 0);
      const terms = bits.map((v, i) => v ? String(1 << (n - 1 - i)) : null).filter(Boolean);
      out.replaceChildren(el('code', {}, bits.join('')), ' = ' + (terms.length ? terms.join(' + ') + ' = ' : '') , el('b', {}, String(value)), value >= 32 && value < 127 ? el('span', { class: 'fig-note' }, '  (as a character in ASCII: ' + JSON.stringify(String.fromCharCode(value)) + ')') : null);
    };
    render();
    mount.append(row, out, el('p', { class: 'fig-note' }, 'Click a switch to flip it. Each one is worth twice the one to its right; the number is the sum of the ones that are on. Eight switches give 256 different patterns, 0 to 255.'));
  };

  /* ---------- the directory tree of a shell lesson: click a name to see its paths; "go here" moves the marker ---------- */
  // params: tree (the same shape as a lesson's setup, keys as paths from the home directory), cwd ('~' or '~/x'), the home is /home/student
  W.fstree = function (mount, b) {
    const HOME = '/home/student';
    const nodes = new Map([['/', { name: '/', dir: true, kids: [] }]]);
    const add = (abs, dir) => { if (nodes.has(abs)) return nodes.get(abs); const parent = add(abs.slice(0, abs.lastIndexOf('/')) || '/', true); const n = { name: abs.slice(abs.lastIndexOf('/') + 1), abs, dir, kids: [] }; nodes.set(abs, n); parent.kids.push(n); return n; };
    nodes.get('/').abs = '/';
    for (const p of ['/bin', '/etc', '/tmp', HOME]) add(p, true);
    for (const key of Object.keys(b.tree || {})) { const dir = key.endsWith('/') || b.tree[key] === null; const abs = HOME + '/' + key.replace(/[!/]+$/, ''); add(abs, dir); }
    const order = (a, c) => (a.dir === c.dir ? a.name.localeCompare(c.name) : a.dir ? -1 : 1);
    let cwd = b.cwd && b.cwd !== '~' ? HOME + b.cwd.slice(1) : HOME, picked = null;
    const info = el('div', { class: 'fstree-info' });
    const rel = (from, to) => {   // the relative path from one directory to a node
      const f = from.split('/').filter(Boolean), t = to.split('/').filter(Boolean); let i = 0;
      while (i < f.length && i < t.length && f[i] === t[i]) i++;
      const parts = f.slice(i).map(() => '..').concat(t.slice(i)); return parts.length ? parts.join('/') : '.';
    };
    const tilde = (abs) => abs === HOME ? '~' : abs.startsWith(HOME + '/') ? '~' + abs.slice(HOME.length) : abs;
    const draw = () => {
      mount.querySelectorAll('.fstree').forEach((e) => e.remove());
      const li = (n) => { const btn = el('button', { class: (n.dir ? 'dir' : '') + (n.abs === cwd ? ' here' : '') + (n.abs === picked ? ' picked' : ''), onclick: () => { picked = n.abs; show(n); draw(); } }, n.name + (n.dir && n.abs !== '/' ? '/' : '')); return el('li', {}, btn, n.abs === cwd ? el('span', { class: 'fig-note' }, ' ← you are here') : null, n.kids.length ? el('ul', {}, n.kids.sort(order).map(li)) : null); };
      mount.prepend(el('div', { class: 'fstree' }, el('ul', {}, li(nodes.get('/')))));
    };
    const show = (n) => {
      const from = cwd;   // where the reader is when they click: "go here" reports the cd from there
      info.replaceChildren(
        el('div', { class: 'fst-row' }, el('span', { class: 'fst-k' }, n.dir ? 'directory' : 'file'), el('code', {}, n.name)),
        el('div', { class: 'fst-row' }, el('span', { class: 'fst-k' }, 'absolute path'), el('code', {}, n.abs)),
        n.abs.startsWith(HOME) ? el('div', { class: 'fst-row' }, el('span', { class: 'fst-k' }, 'from home, with ~'), el('code', {}, tilde(n.abs))) : null,
        el('div', { class: 'fst-row' }, el('span', { class: 'fst-k' }, 'from where you are (' + tilde(cwd) + ')'), el('code', {}, rel(cwd, n.abs))),
        n.dir && n.abs !== cwd ? el('div', { class: 'fst-row' }, el('button', { class: 'btn sm', onclick: () => { cwd = n.abs; picked = null; info.replaceChildren(el('div', { class: 'fst-row' }, el('span', { class: 'fst-k' }, 'you moved:'), el('code', {}, 'cd ' + rel(from, n.abs)), el('span', {}, ' and now pwd prints '), el('code', {}, n.abs))); draw(); } }, 'go here (cd)')) : null);
    };
    info.textContent = 'Click a name to see its paths.';
    mount.append(info);
    draw();
  };

  W.pipeline = function (mount, b) {
    const svg = sv('svg', { viewBox: '0 0 640 130', role: 'img', 'aria-label': 'From source code to a running program' });
    // param lang: 'java' draws javac, bytecode and the JVM instead of a native compiler
    const stages = b && b.lang === 'java'
      ? [['Hello.java', 'source code', 'text you write'], ['javac', 'the compiler', 'checks types, translates'], ['Hello.class', 'bytecode', 'instructions for the JVM'], ['JVM', 'runs it', 'Hello, world!']]
      : [['hello.cpp', 'source code', 'text you write'], ['compiler', 'g++ / clang++', 'checks types, translates'], ['a.out', 'machine code', 'CPU instructions'], ['CPU', 'runs it', 'Hello, world!']];
    stages.forEach(([a, b, c], i) => {
      const x = 15 + i * 160;
      svg.append(sv('rect', { x, y: 25, width: 130, height: 76, rx: 4, fill: i === 1 ? 'var(--accent)' : 'var(--paper)', stroke: i === 1 ? 'var(--accent)' : 'var(--ink)', 'stroke-width': 1.3 }));
      svg.append(mono(x + 65, 50, a, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 600, fill: i === 1 ? 'var(--accent-ink)' : 'var(--ink)' }));
      svg.append(txt(x + 65, 70, b, { 'text-anchor': 'middle', 'font-size': 12, fill: i === 1 ? 'var(--accent-ink)' : 'var(--ink-2)' }));
      svg.append(txt(x + 65, 88, c, { 'text-anchor': 'middle', 'font-size': 11, fill: i === 1 ? 'var(--accent-ink)' : 'var(--ink-3)' }));
      if (i < 3) svg.append(sv('path', { d: `M${x + 133} 63 h16`, stroke: 'var(--ink)', 'stroke-width': 1.6, 'marker-end': 'url(#pl-arr)' }));
    });
    svg.append(txt(95, 122, 'compile time — errors caught here never reach the user', { 'font-size': 11, fill: 'var(--ink-3)' }), txt(560, 122, 'run time', { 'font-size': 11, fill: 'var(--ink-3)', 'text-anchor': 'end' }));
    svg.prepend(sv('defs', {}, sv('marker', { id: 'pl-arr', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, sv('path', { d: 'M0 0L10 5L0 10z', fill: 'var(--ink)' }))));
    mount.append(svg);
  };

  /* ---------- 13. C++ type footprints in memory ---------- */
  W.memory = function (mount) {
    const types = { char: { size: 1, sample: "'A'", bytes: [0x41], note: 'one byte: the ASCII code of the character (65)' }, bool: { size: 1, sample: 'true', bytes: [0x01], note: 'one byte holding 0 or 1' }, int: { size: 4, sample: '42', bytes: [0x2a, 0, 0, 0], note: 'four bytes, two’s complement; the range is about ±2.1 billion' }, double: { size: 8, sample: '2.5', bytes: [0, 0, 0, 0, 0, 0, 0x04, 0x40], note: 'eight bytes in IEEE-754 floating-point format' }, 'long long': { size: 8, sample: '42', bytes: [0x2a, 0, 0, 0, 0, 0, 0, 0], note: 'eight bytes, range about ±9.2 quintillion' } };
    const svg = sv('svg', { viewBox: '0 0 640 110', role: 'img', 'aria-label': 'Bytes in memory' });
    const status = el('div', { class: 'fig-status', role: 'status' });
    let cur = 'int';
    const btns = Object.keys(types).map(t => el('button', { class: 'btn sm' + (t === cur ? ' primary' : ''), 'aria-pressed': String(t === cur), onclick: () => { cur = t; btns.forEach(b => { b.classList.toggle('primary', b.textContent === t); b.setAttribute('aria-pressed', String(b.textContent === t)); }); render(); } }, t));
    function render() {
      svg.innerHTML = ''; const T = types[cur]; const base = 0x1000;
      for (let i = 0; i < 16; i++) {
        const x = 12 + i * 38, on = i < T.size;
        svg.append(sv('rect', { x, y: 30, width: 36, height: 36, fill: on ? 'var(--accent-soft)' : 'var(--paper)', stroke: on ? 'var(--accent)' : 'var(--rule)', 'stroke-width': on ? 1.5 : 1 }));
        svg.append(mono(x + 18, 53, on ? T.bytes[i].toString(16).padStart(2, '0') : '··', { 'text-anchor': 'middle', 'font-size': 12, fill: on ? 'var(--ink)' : 'var(--ink-3)' }));
        svg.append(mono(x + 18, 84, '0x' + (base + i).toString(16), { 'text-anchor': 'middle', 'font-size': 9, fill: 'var(--ink-3)' }));
      }
      svg.append(txt(12, 18, cur + ' x = ' + T.sample + ';   sizeof(x) = ' + T.size, { 'font-size': 13, 'font-family': 'var(--mono)' }));
      svg.append(txt(12, 104, 'addresses (each cell is one byte; little-endian, so the low byte comes first)', { 'font-size': 11, fill: 'var(--ink-3)' }));
      status.textContent = T.note;
    }
    mount.append(el('div', { class: 'fig-tools' }, btns), el('div', { class: 'fig-scroll' }, svg), status);
    render();
  };

  /* ---------- 14. arrays and pointer arithmetic ---------- */
  W.array = function (mount) {
    const vals = [10, 20, 30, 40, 50, 60], base = 0x7ffc10, n = vals.length;
    const svg = sv('svg', { viewBox: '0 0 640 130', role: 'img', 'aria-label': 'An int array in memory' });
    const range = el('input', { type: 'range', min: 0, max: n - 1, value: 2, 'aria-label': 'index' });
    const status = el('div', { class: 'fig-status', role: 'status' });
    function render() {
      const i = +range.value; svg.innerHTML = '';
      svg.append(txt(12, 18, 'int arr[6] = {10, 20, 30, 40, 50, 60};', { 'font-family': 'var(--mono)', 'font-size': 13 }));
      vals.forEach((v, k) => {
        const x = 12 + k * 100, on = k === i;
        svg.append(sv('rect', { x, y: 30, width: 96, height: 40, fill: on ? 'var(--accent)' : 'var(--paper)', stroke: on ? 'var(--accent)' : 'var(--ink)' }));
        svg.append(mono(x + 48, 56, String(v), { 'text-anchor': 'middle', 'font-size': 15, fill: on ? 'var(--accent-ink)' : 'var(--ink)' }));
        svg.append(mono(x + 48, 88, '0x' + (base + 4 * k).toString(16), { 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--ink-3)' }));
        svg.append(mono(x + 48, 104, 'arr[' + k + ']', { 'text-anchor': 'middle', 'font-size': 11, fill: on ? 'var(--accent)' : 'var(--ink-2)' }));
        for (let b = 1; b < 4; b++) svg.append(sv('line', { x1: x + b * 24, y1: 30, x2: x + b * 24, y2: 70, stroke: on ? 'var(--accent-ink)' : 'var(--rule)', 'stroke-opacity': 0.5 }));
      });
      svg.append(txt(12, 124, 'each int is 4 bytes, so consecutive elements are 4 addresses apart', { 'font-size': 11, fill: 'var(--ink-3)' }));
      status.innerHTML = 'i = ' + i + '   arr[i] = <span class="ok">' + vals[i] + '</span>   &arr[i] = arr + i = 0x' + (base + 4 * i).toString(16) + '   *(arr + i) = <span class="ok">' + vals[i] + '</span>';
    }
    range.addEventListener('input', render);
    mount.append(el('div', { class: 'fig-scroll' }, svg), el('div', { class: 'fig-tools' }, el('span', {}, 'i'), range), status);
    render();
  };

  /* ---------- 15. sieve of Eratosthenes ---------- */
  W.sieve = function (mount, b) {
    const N = b.n || 100;
    const grid = el('div', { class: 'sieve' });
    const cells = [];
    for (let i = 1; i <= N; i++) { const c = el('div', {}, String(i)); cells.push(c); grid.append(c); }
    const log = el('div', { class: 'fig-status', role: 'status' });
    const steps = [];
    const marked = new Array(N + 1).fill(false);
    steps.push({ state: [], msg: 'Every number from 2 up starts as "possibly prime". 1 is not prime by definition.' });
    for (let p = 2; p * p <= N; p++) {
      if (marked[p]) continue;
      const m = [];
      for (let k = p * p; k <= N; k += p) if (!marked[k]) { marked[k] = true; m.push(k); }
      steps.push({ p, m, msg: p + ' is prime. Cross out its multiples starting at ' + p + '×' + p + ' = ' + (p * p) + ' (smaller multiples were already crossed out).' });
    }
    steps.push({ done: true, msg: 'Anything still uncrossed is prime: no need to check beyond √' + N + ' ≈ ' + Math.floor(Math.sqrt(N)) + '.' });
    function render(i) {
      const crossed = new Set(), primes = new Set();
      for (let k = 1; k <= i; k++) { const s = steps[k]; if (s.m) { s.m.forEach(x => crossed.add(x)); primes.add(s.p); } }
      const s = steps[i];
      cells.forEach((c, k) => {
        const v = k + 1; c.className = '';
        if (v === 1) c.className = 'cross';
        else if (crossed.has(v)) c.className = 'cross' + (s.m && s.m.includes(v) ? ' marking' : '');
        else if (primes.has(v)) c.className = 'prime' + (s.p === v ? ' cur' : '');
        else if (s.done) c.className = 'prime';
      });
      log.textContent = s.msg;
    }
    const ctl = stepper(steps.length, render, { interval: 1200 });
    mount.append(grid, log, ctl.el);
  };

  /* ---------- 16. call-stack recursion diagram (scheme fib tree) ---------- */
  W.fibtree = function (mount, b) {
    const n = b.n || 5;
    let id = 0;
    function build(k, depth) { const node = { k, depth, id: id++, kids: [] }; if (k >= 2) { node.kids.push(build(k - 1, depth + 1)); node.kids.push(build(k - 2, depth + 1)); } return node; }
    const root = build(n, 0);
    const width = (t) => { t.w = t.kids.length ? t.kids.reduce((s, k) => s + width(k), 0) : 40; return t.w; }; width(root);
    const H = (n + 1) * 56;
    const svg = sv('svg', { viewBox: '0 0 ' + (root.w + 20) + ' ' + H, role: 'img', 'aria-label': 'Tree of recursive fib calls' });
    svg.style.width = Math.min(root.w + 20, 760) + 'px'; svg.style.maxWidth = '100%';
    let count = 0;
    function draw(t, x, y) {
      const cx = x + t.w / 2; count++;
      let kx = x;
      for (const k of t.kids) { const kcx = kx + k.w / 2; svg.append(sv('line', { x1: cx, y1: y + 10, x2: kcx, y2: y + 46, stroke: 'var(--rule)' })); draw(k, kx, y + 56); kx += k.w; }
      const leaf = t.k < 2;
      svg.append(sv('rect', { x: cx - 18, y: y - 10, width: 36, height: 22, rx: 11, fill: leaf ? 'var(--accent)' : 'var(--paper)', stroke: 'var(--accent)' }));
      svg.append(mono(cx, y + 5, 'fib ' + t.k, { 'text-anchor': 'middle', 'font-size': 11, fill: leaf ? 'var(--accent-ink)' : 'var(--ink)' }));
    }
    draw(root, 10, 18);
    const call = b.lang === 'python' ? (k) => 'fib(' + k + ')' : (k) => '(fib ' + k + ')';
    mount.append(el('div', { class: 'fig-scroll' }, svg), el('div', { class: 'fig-status', role: 'status' }, call(n) + ' makes ' + count + ' calls to compute the answer ' + (function f(k) { return k < 2 ? k : f(k - 1) + f(k - 2); })(n) + '. Notice how ' + call(n - 2) + ' is computed twice, ' + call(n - 3) + ' three times…'));
  };
  /* ---------- 17. breadth-first search on the towns graph (math course) ---------- */
  W.graphbfs = function (mount, b) {
    const pos = { Ash: [70, 60], Birch: [190, 40], Cedar: [150, 130], Dell: [310, 60], Elm: [420, 110], Fir: [520, 50], Gum: [600, 120] };
    const graph = { Ash: ['Birch', 'Cedar'], Birch: ['Ash', 'Cedar', 'Dell'], Cedar: ['Ash', 'Birch'], Dell: ['Birch', 'Elm'], Elm: ['Dell'], Fir: ['Gum'], Gum: ['Fir'] };
    const start = b.start || 'Ash';
    const edges = []; for (const v in graph) for (const w of graph[v]) if (v < w) edges.push([v, w]);
    const steps = [];
    const dist = { [start]: 0 }; const queue = [start]; const done = [];
    steps.push({ dist: { ...dist }, queue: queue.slice(), done: [], cur: null, edge: null, msg: 'Start at ' + start + ' (distance 0) and put it in the queue.' });
    while (queue.length) {
      const v = queue.shift(); 
      let found = 0;
      for (const w of graph[v]) {
        if (!(w in dist)) { dist[w] = dist[v] + 1; queue.push(w); found++; steps.push({ dist: { ...dist }, queue: queue.slice(), done: done.slice(), cur: v, edge: [v, w], msg: 'From ' + v + ': ' + w + ' is new. Its distance is ' + dist[v] + ' + 1 = ' + dist[w] + '; it joins the back of the queue.' }); }
      }
      done.push(v);
      steps.push({ dist: { ...dist }, queue: queue.slice(), done: done.slice(), cur: v, edge: null, msg: 'Take ' + v + ' off the front of the queue' + (found ? '' : ': all of its neighbours were already seen') + '. ' + v + ' is finished.' });
    }
    const unreached = Object.keys(graph).filter(v => !(v in dist));
    steps.push({ dist: { ...dist }, queue: [], done: done.slice(), cur: null, edge: null, msg: 'The queue is empty, so the search is over. ' + (unreached.length ? unreached.join(' and ') + ' were never reached: no road connects them to ' + start + '.' : 'Every vertex was reached.') });
    const svg = sv('svg', { viewBox: '0 0 660 170', role: 'img', 'aria-label': 'Breadth-first search on a graph of seven towns' });
    const qbox = el('div', { class: 'fig-status', role: 'status' });
    const log = el('div', { class: 'fig-status', role: 'status' });
    function render(i) {
      const s = steps[i]; svg.innerHTML = '';
      for (const [v, w] of edges) {
        const hot = s.edge && ((s.edge[0] === v && s.edge[1] === w) || (s.edge[0] === w && s.edge[1] === v));
        svg.append(sv('line', { x1: pos[v][0], y1: pos[v][1], x2: pos[w][0], y2: pos[w][1], stroke: hot ? 'var(--accent)' : 'var(--rule)', 'stroke-width': hot ? 3 : 1.5 }));
      }
      for (const v in pos) {
        const [x, y] = pos[v]; const seen = v in s.dist; const fin = s.done.includes(v); const inq = s.queue.includes(v);
        const fill = fin ? 'var(--accent)' : inq ? 'var(--accent-soft)' : 'var(--paper-2)';
        svg.append(sv('circle', { cx: x, cy: y, r: 18, fill, stroke: s.cur === v ? 'var(--ink)' : seen ? 'var(--accent)' : 'var(--rule)', 'stroke-width': s.cur === v ? 2.5 : 1.5 }));
        svg.append(txt(x, y - 24, v, { 'text-anchor': 'middle', 'font-size': 12, fill: 'var(--ink-2)' }));
        if (seen) svg.append(mono(x, y + 5, String(s.dist[v]), { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 600, fill: fin ? 'var(--accent-ink)' : 'var(--ink)' }));
      }
      qbox.textContent = 'queue: [' + s.queue.join(', ') + ']';
      log.textContent = s.msg;
    }
    const ctl = stepper(steps.length, render, { interval: 1100 });
    mount.append(el('div', { class: 'fig-scroll' }, svg), qbox, log, ctl.el);
  };

  let dfaCount = 0;
  /* ---------- 18. finite automaton, stepping through an input string ---------- */
  W.dfa = function (mount, b) {
    const mk = 'dfa-arrow-' + (++dfaCount);   // marker ids unique to this figure (a lesson can show several)
    const MACHINES = {
      ends01: { start: 'a', accept: ['c'], states: { a: [80, 80], b: [240, 80], c: [400, 80] }, alphabet: '01',
        delta: { a: { 0: 'b', 1: 'a' }, b: { 0: 'b', 1: 'c' }, c: { 0: 'b', 1: 'a' } }, sample: '1101', what: 'ends in 01', whatNot: 'does not end in 01' },
      div3: { start: 'r0', accept: ['r0'], states: { r0: [80, 80], r1: [240, 80], r2: [400, 80] }, alphabet: '01',
        delta: { r0: { 0: 'r0', 1: 'r1' }, r1: { 0: 'r2', 1: 'r0' }, r2: { 0: 'r1', 1: 'r2' } }, sample: '1001', what: 'is divisible by 3', whatNot: 'is not divisible by 3' }
    };
    const m = MACHINES[b.machine] || MACHINES.ends01;
    const names = Object.keys(m.states);
    // group transitions by (from, to) so parallel labels merge
    const arcs = {};
    for (const q of names) for (const ch of m.alphabet) { const k = q + '>' + m.delta[q][ch]; (arcs[k] = arcs[k] || { from: q, to: m.delta[q][ch], labels: [] }).labels.push(ch); }
    const input = el('input', { type: 'text', value: b.sample || m.sample, 'aria-label': 'input string', size: 12, maxlength: 16 });
    const log = el('div', { class: 'fig-status', role: 'status' });
    let steps = [];
    function compute() {
      const s = input.value.replace(/[^01]/g, ''); input.value = s; steps = [];
      let q = m.start;
      steps.push({ q, i: 0, s, arc: null, msg: 'Start in state ' + q + '.' + (s ? '' : ' The input is empty, so we are already at the end.') });
      for (let i = 0; i < s.length; i++) { const nq = m.delta[q][s[i]]; steps.push({ q: nq, i: i + 1, s, arc: q + '>' + nq, msg: 'Read ' + s[i] + ' in state ' + q + ': go to ' + nq + '.' }); q = nq; }
      const acc = m.accept.includes(q);
      steps.push({ q, i: s.length, s, arc: null, end: true, msg: 'Input finished in state ' + q + ', which is ' + (acc ? 'an accepting state: ACCEPT. ' : 'not accepting: REJECT. ') + (s ? '"' + s + '" ' + (acc ? m.what : m.whatNot) + '.' : '') });
    }
    const svg = sv('svg', { viewBox: '0 0 480 190', role: 'img', 'aria-label': 'Finite automaton' });
    svg.append(sv('defs', {}, sv('marker', { id: mk, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, sv('path', { d: 'M0 0 L10 5 L0 10 z', fill: 'var(--ink-2)' })),
      sv('marker', { id: mk + '-hot', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, sv('path', { d: 'M0 0 L10 5 L0 10 z', fill: 'var(--accent)' }))));
    const R = 24;
    function render(k) {
      const st = steps[k];
      while (svg.childNodes.length > 1) svg.removeChild(svg.lastChild);
      // start arrow
      const [sx, sy] = m.states[m.start];
      svg.append(sv('line', { x1: sx - R - 34, y1: sy, x2: sx - R - 2, y2: sy, stroke: 'var(--ink-2)', 'marker-end': 'url(#' + mk + ')' }));
      for (const key in arcs) {
        const a = arcs[key]; const hot = st.arc === key; const col = hot ? 'var(--accent)' : 'var(--ink-2)';
        const [x1, y1] = m.states[a.from], [x2, y2] = m.states[a.to]; const label = a.labels.join(', ');
        if (a.from === a.to) {
          svg.append(sv('path', { d: `M${x1 - 12} ${y1 - R + 4} C ${x1 - 40} ${y1 - 80}, ${x1 + 40} ${y1 - 80}, ${x1 + 12} ${y1 - R + 4}`, fill: 'none', stroke: col, 'stroke-width': hot ? 2.5 : 1.5, 'marker-end': hot ? 'url(#' + mk + '-hot)' : 'url(#' + mk + ')' }));
          svg.append(mono(x1, y1 - R - 42, label, { 'text-anchor': 'middle', 'font-size': 13, fill: col }));
        } else {
          const forward = x2 > x1; const dx = x2 - x1; const bend = Math.abs(dx) > 200 ? 70 : 34;
          const yoff = forward ? -1 : 1; // forward arcs curve above, backward below
          const cy = y1 + yoff * bend;
          const ax = x1 + (forward ? R : -R) * 0.9, ay = y1 + yoff * R * 0.45, bx = x2 - (forward ? R : -R) * 0.9, by = y2 + yoff * R * 0.45;
          svg.append(sv('path', { d: `M${ax} ${ay} Q ${(x1 + x2) / 2} ${cy}, ${bx} ${by}`, fill: 'none', stroke: col, 'stroke-width': hot ? 2.5 : 1.5, 'marker-end': hot ? 'url(#' + mk + '-hot)' : 'url(#' + mk + ')' }));
          svg.append(mono((x1 + x2) / 2, (y1 + cy) / 2 + (forward ? -2 : 12), label, { 'text-anchor': 'middle', 'font-size': 13, fill: col }));
        }
      }
      for (const q of names) {
        const [x, y] = m.states[q]; const cur = st.q === q; const acc = m.accept.includes(q);
        svg.append(sv('circle', { cx: x, cy: y, r: R, fill: cur ? (st.end ? (acc ? 'var(--ok)' : 'var(--err)') : 'var(--accent)') : 'var(--paper)', stroke: cur ? 'var(--ink)' : 'var(--ink-2)', 'stroke-width': 1.5 }));
        if (acc) svg.append(sv('circle', { cx: x, cy: y, r: R - 5, fill: 'none', stroke: cur ? 'var(--accent-ink)' : 'var(--ink-2)', 'stroke-width': 1.5 }));
        svg.append(mono(x, y + 5, q, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 600, fill: cur ? 'var(--accent-ink)' : 'var(--ink)' }));
      }
      // the input, with the read position marked
      const s = st.s; const cw = 22; const x0 = 240 - (s.length * cw) / 2;
      for (let i = 0; i < s.length; i++) {
        const read = i < st.i;
        svg.append(sv('rect', { x: x0 + i * cw, y: 150, width: cw - 2, height: 26, fill: read ? 'var(--accent-soft)' : 'var(--paper)', stroke: i === st.i - 1 && !st.end ? 'var(--accent)' : 'var(--rule)', 'stroke-width': i === st.i - 1 && !st.end ? 2 : 1 }));
        svg.append(mono(x0 + i * cw + cw / 2 - 1, 168, s[i], { 'text-anchor': 'middle', 'font-size': 14, fill: read ? 'var(--ink-3)' : 'var(--ink)' }));
      }
      if (!s.length) svg.append(txt(240, 168, '(empty input)', { 'text-anchor': 'middle', 'font-size': 12, fill: 'var(--ink-3)' }));
      log.textContent = st.msg;
    }
    compute();
    let ctl = stepper(steps.length, render, { interval: 900 });
    const run = () => { compute(); ctl.stop(); const old = ctl.el; ctl = stepper(steps.length, render, { interval: 900 }); old.replaceWith(ctl.el); };
    input.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
    const tools = el('div', { class: 'fig-tools' }, el('span', {}, 'input (0s and 1s)'), input, el('button', { class: 'btn sm', onclick: run }, 'Load'));
    mount.append(el('div', { class: 'fig-scroll' }, svg), tools, log, ctl.el);
  };

  /* ---------- 19. Turing machine tape ---------- */
  W.tape = function (mount, b) {
    // rules: { 'state,symbol': [write, move, next] }; '_' is the blank
    const MACHINES = {
      increment: {
        start: 'right', rules: {
          'right,0': ['0', 'R', 'right'], 'right,1': ['1', 'R', 'right'], 'right,_': ['_', 'L', 'add'],
          'add,1': ['0', 'L', 'add'], 'add,0': ['1', 'L', 'done'], 'add,_': ['1', 'L', 'done']
        }, sample: '1011', what: 'Adds one to a binary number: walk to the right end, then carry leftwards.'
      },
      flip: {
        start: 'go', rules: { 'go,0': ['1', 'R', 'go'], 'go,1': ['0', 'R', 'go'], 'go,_': ['_', 'L', 'done'] },
        sample: '1001', what: 'Flips every bit, then stops at the blank.'
      },
      beaver: {
        start: 'A', rules: {
          'A,_': ['1', 'R', 'B'], 'A,1': ['1', 'L', 'B'],
          'B,_': ['1', 'L', 'A'], 'B,1': ['1', 'R', 'H']
        }, sample: '', what: 'The two-state busy beaver: started on a blank tape, it writes four 1s in six steps and halts in state H. No two-state machine that halts does better.'
      }
    };
    const m = MACHINES[b.machine] || MACHINES.increment;
    const input = el('input', { type: 'text', value: b.sample != null ? b.sample : m.sample, 'aria-label': 'tape', size: 12, maxlength: 10, placeholder: '(blank)' });
    const log = el('div', { class: 'fig-status', role: 'status' });
    const rulebox = el('div', { class: 'fig-status', role: 'status' });
    let steps = [];
    function compute() {
      const s = input.value.replace(/[^01]/g, ''); input.value = s;
      let tape = {}; for (let i = 0; i < s.length; i++) tape[i] = s[i];
      let head = 0, q = m.start; steps = [];
      const snap = (rule, msg) => steps.push({ tape: { ...tape }, head, q, rule, msg });
      snap(null, 'Start in state ' + q + ' with the head on the leftmost cell.');
      for (let n = 0; n < 200; n++) {
        const sym = tape[head] === undefined ? '_' : tape[head];
        const key = q + ',' + sym; const r = m.rules[key];
        if (!r) { snap(null, 'No rule for (' + q + ', ' + sym + '): the machine halts. Tape: ' + tapeString(tape)); break; }
        if (r[0] === '_') delete tape[head]; else tape[head] = r[0];
        head += r[1] === 'R' ? 1 : -1; q = r[2];
        snap(key, 'In state ' + steps[steps.length - 1].q + ' reading ' + sym + ': write ' + r[0] + ', move ' + (r[1] === 'R' ? 'right' : 'left') + ', go to ' + r[2] + '.');
        if (!Object.keys(m.rules).some(k => k.startsWith(q + ','))) { snap(null, 'State ' + q + ' has no rules: the machine halts. Tape: ' + tapeString(tape)); break; }
      }
    }
    function tapeString(t) { const ks = Object.keys(t).map(Number); if (!ks.length) return '(blank)'; let out = ''; for (let i = Math.min(...ks); i <= Math.max(...ks); i++) out += t[i] === undefined ? '_' : t[i]; return out; }
    const svg = sv('svg', { viewBox: '0 0 520 110', role: 'img', 'aria-label': 'Turing machine tape' });
    const cw = 34, N = 13;
    function render(k) {
      const st = steps[k]; svg.innerHTML = '';
      const lo = Math.min(...Object.keys(st.tape).map(Number).concat([st.head])) - 1;
      for (let i = 0; i < N; i++) {
        const cell = lo + i; const x = 20 + i * cw; const isHead = cell === st.head; const sym = st.tape[cell] === undefined ? '' : st.tape[cell];
        svg.append(sv('rect', { x, y: 40, width: cw, height: 34, fill: isHead ? 'var(--accent-soft)' : 'var(--paper)', stroke: 'var(--ink-2)' }));
        if (sym) svg.append(mono(x + cw / 2, 63, sym, { 'text-anchor': 'middle', 'font-size': 16, fill: 'var(--ink)' }));
        if (isHead) {
          svg.append(sv('path', { d: `M${x + cw / 2 - 8} 20 L${x + cw / 2 + 8} 20 L${x + cw / 2} 34 z`, fill: 'var(--accent)' }));
          svg.append(mono(x + cw / 2, 96, st.q, { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 600, fill: 'var(--accent)' }));
        }
      }
      svg.append(txt(20, 14, 'blank cells stretch on forever in both directions', { 'font-size': 11, fill: 'var(--ink-3)' }));
      rulebox.textContent = st.rule ? 'rule used: (' + st.rule + ') → write ' + m.rules[st.rule][0] + ', move ' + m.rules[st.rule][1] + ', state ' + m.rules[st.rule][2] : 'rules: ' + Object.keys(m.rules).map(k => '(' + k + ')→' + m.rules[k].join('')).join('  ');
      log.textContent = st.msg;
    }
    compute();
    let ctl = stepper(steps.length, render, { interval: 800 });
    const run = () => { compute(); ctl.stop(); const old = ctl.el; ctl = stepper(steps.length, render, { interval: 800 }); old.replaceWith(ctl.el); };
    input.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
    const tools = el('div', { class: 'fig-tools' }, el('span', {}, 'tape'), input, el('button', { class: 'btn sm', onclick: run }, 'Load'));
    mount.append(el('div', { class: 'fig-scroll' }, svg), tools, rulebox, log, ctl.el, el('div', { class: 'fig-status', role: 'status' }, m.what));
  };

  /* ---------- 21. orders of growth (DSA lesson 1): curves and a table of step counts ---------- */
  W.growth = function (mount, b) {
    const FUNS = [
      { key: '1', label: '1', f: () => 1 }, { key: 'log', label: 'log n', f: (n) => (n < 2 ? 1 : Math.log2(n)) }, { key: 'n', label: 'n', f: (n) => n },
      { key: 'nlog', label: 'n log n', f: (n) => (n < 2 ? 1 : n * Math.log2(n)) }, { key: 'n2', label: 'n²', f: (n) => n * n }, { key: 'exp', label: '2ⁿ', f: (n) => Math.pow(2, n) }
    ];
    const on = new Set(b.show ? b.show.split(' ') : ['1', 'log', 'n', 'nlog', 'n2']);
    let nmax = b.n || 32;
    const W0 = 640, H0 = 300, L = 54, R = 16, T = 14, B = 34;
    const svg = sv('svg', { viewBox: '0 0 ' + W0 + ' ' + H0, role: 'img', 'aria-label': 'Orders of growth' });
    const COLORS = { '1': 'var(--ink-3)', log: 'var(--ok)', n: 'var(--accent)', nlog: 'var(--hl-p)', n2: 'var(--err)', exp: 'var(--hl-k)' };
    function render() {
      svg.innerHTML = '';
      const sel = FUNS.filter(f => on.has(f.key));
      const ymax = Math.max(10, ...sel.map(f => Math.min(f.f(nmax), 1e6)));
      const X = (n) => L + (n / nmax) * (W0 - L - R), Y = (v) => T + (1 - Math.min(v, ymax) / ymax) * (H0 - T - B);
      svg.append(sv('line', { x1: L, y1: Y(0), x2: W0 - R, y2: Y(0), stroke: 'var(--ink-2)' }), sv('line', { x1: L, y1: T, x2: L, y2: Y(0), stroke: 'var(--ink-2)' }));
      for (let k = 0; k <= 4; k++) { const v = (ymax * k) / 4; svg.append(txt(L - 6, Y(v) + 4, v >= 1e5 ? v.toExponential(0).replace('e+', 'e') : String(Math.round(v)), { 'text-anchor': 'end', 'font-size': 11, fill: 'var(--ink-3)' }), sv('line', { x1: L, y1: Y(v), x2: W0 - R, y2: Y(v), stroke: 'var(--rule)', 'stroke-dasharray': '2 4' })); }
      for (let n = 0; n <= nmax; n += nmax / 4) svg.append(txt(X(n), H0 - B + 16, String(Math.round(n)), { 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--ink-3)' }));
      svg.append(txt(W0 - R, H0 - 4, 'n (size of the input)', { 'text-anchor': 'end', 'font-size': 11, fill: 'var(--ink-2)' }), txt(L + 4, T + 10, 'steps', { 'font-size': 11, fill: 'var(--ink-2)' }));
      const labels = [];
      for (const f of sel) {
        const pts = []; for (let n = 1; n <= nmax; n += nmax / 128) { const v = f.f(n); if (v > ymax * 1.05) { pts.push(X(n) + ',' + (T - 2)); break; } pts.push(X(n) + ',' + Y(v)); }
        svg.append(sv('polyline', { points: pts.join(' '), fill: 'none', stroke: COLORS[f.key], 'stroke-width': 2.2 }));
        const last = pts[pts.length - 1].split(','); labels.push({ f, x: Math.min(+last[0] + 4, W0 - 34), y: Math.max(+last[1], T + 10) });
      }
      // labels of curves that end close together are spread apart so that each can be read
      labels.sort((a, b) => b.y - a.y); let floor = Y(0) + 4;
      for (const l of labels) { l.y = Math.min(l.y, floor - 13); floor = l.y; svg.append(txt(l.x, l.y + 4, l.f.label, { 'font-size': 12, fill: COLORS[l.f.key], 'font-weight': 600 })); }
    }
    const fmt = (v) => (v < 1e6 ? Math.round(v).toLocaleString('en-US') : v === Infinity ? '∞' : v.toExponential(1).replace('e+', ' × 10^'));
    const time = (v) => { const s = v / 1e9; if (s < 1e-6) return 'under a microsecond'; if (s < 1e-3) return Math.round(s * 1e6) + ' µs'; if (s < 1) return Math.round(s * 1e3) + ' ms'; if (s < 60) return s.toFixed(1) + ' s'; if (s < 3600) return (s / 60).toFixed(1) + ' min'; if (s < 86400) return (s / 3600).toFixed(1) + ' hours'; if (s < 3.15e7) return (s / 86400).toFixed(1) + ' days'; if (s < 3.15e7 * 1e4) return Math.round(s / 3.15e7).toLocaleString('en-US') + ' years'; if (s < 3.15e7 * 1.4e10) return (s / 3.15e7).toExponential(1).replace('e+', ' × 10^') + ' years'; return 'longer than the universe has existed'; };
    const NS = [10, 100, 1000, 1e6, 1e9];
    const table = el('table', { class: 'small growth-table' });
    function renderTable() {
      table.innerHTML = '';
      table.append(el('tr', {}, el('th', {}, 'steps'), NS.map(n => el('th', {}, 'n = ' + fmt(n)))));
      for (const f of FUNS) if (on.has(f.key)) table.append(el('tr', {}, el('td', {}, el('b', {}, f.label)), NS.map(n => { const v = f.f(n); return el('td', { title: 'about ' + time(v) + ' at a billion steps a second' }, fmt(v), el('span', { class: 'muted' }, ' ' + (v >= 1e9 ? time(v) : ''))); })));
    }
    const boxes = el('div', { class: 'fig-tools' }, FUNS.map(f => el('label', {}, el('input', { type: 'checkbox', checked: on.has(f.key) ? '' : null, onchange: (e) => { if (e.target.checked) on.add(f.key); else on.delete(f.key); render(); renderTable(); } }), ' ', f.label)));
    const slider = el('input', { type: 'range', min: '8', max: '256', step: '8', value: String(nmax), 'aria-label': 'largest n', oninput: (e) => { nmax = +e.target.value; nlabel.textContent = 'n up to ' + nmax; render(); } });
    const nlabel = el('span', { class: 'fig-note' }, 'n up to ' + nmax);
    render(); renderTable();
    mount.append(svg, boxes, el('div', { class: 'fig-tools' }, el('span', {}, 'range'), slider, nlabel), el('div', { class: 'tbl-wrap' }, table), el('p', { class: 'fig-status' }, 'Hover a cell for how long that many steps take at a billion a second.'));
  };

  /* ---------- 22. operations on an array: get, insert, remove, with every move shown (DSA lesson 1) ---------- */
  W.arrayops = function (mount, b) {
    const cap = 8; let a = (b.items || [12, 7, 3, 9, 15, 4]).slice(); let n = a.length;
    const cw = 56, x0 = 14, base = 1000;
    const svg = sv('svg', { viewBox: '0 0 ' + (x0 * 2 + cap * cw) + ' 128', role: 'img', 'aria-label': 'An array in memory' });
    const idx = el('input', { type: 'number', value: '2', min: '0', max: String(cap - 1), 'aria-label': 'index' });
    const val = el('input', { type: 'number', value: '21', 'aria-label': 'value' });
    const log = el('div', { class: 'fig-status', role: 'status' });
    let steps = [{ a: a.slice(), n, msg: 'Six values in an array with room for eight. Each cell is 4 bytes, so cell i lives at address ' + base + ' + 4·i.' }];
    function render(i) {
      const s = steps[i]; svg.innerHTML = '';
      for (let k = 0; k < cap; k++) {
        const x = x0 + k * cw, used = k < s.n;
        const hot = s.hot === k, from = s.from === k;
        svg.append(sv('rect', { x, y: 34, width: cw - 4, height: 44, fill: hot ? 'var(--accent)' : from ? 'var(--accent-soft)' : used ? 'var(--paper)' : 'var(--paper-2)', stroke: used || hot ? 'var(--ink)' : 'var(--rule)', 'stroke-dasharray': used || hot ? null : '3 3' }));
        if (k < s.n || (hot && s.a[k] !== undefined)) svg.append(mono(x + cw / 2 - 2, 62, String(s.a[k]), { 'text-anchor': 'middle', 'font-size': 14, fill: hot ? 'var(--accent-ink)' : 'var(--ink)' }));
        svg.append(mono(x + cw / 2 - 2, 24, String(k), { 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--ink-3)' }));
        svg.append(mono(x + cw / 2 - 2, 96, String(base + 4 * k), { 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--ink-3)' }));
      }
      if (s.from !== undefined && s.hot !== undefined) { const fx = x0 + s.from * cw + cw / 2 - 2, tx = x0 + s.hot * cw + cw / 2 - 2; svg.append(sv('path', { d: `M${fx} 112 C ${fx} 124, ${tx} 124, ${tx} 112`, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 1.5, 'marker-end': 'url(#ao-arr)' })); }
      svg.prepend(sv('defs', {}, sv('marker', { id: 'ao-arr', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, sv('path', { d: 'M0 0L10 5L0 10z', fill: 'var(--accent)' }))));
      log.textContent = s.msg + (s.moves !== undefined ? '   moves so far: ' + s.moves : '');
    }
    let ctl = stepper(steps.length, render, { interval: 700 });
    const restart = () => { ctl.stop(); const old = ctl.el; ctl = stepper(steps.length, render, { interval: 700 }); old.replaceWith(ctl.el); };
    const k = () => Math.max(0, Math.min(+idx.value || 0, cap - 1));
    const get = el('button', { class: 'btn sm', onclick: () => { const i = k(); steps = i < n ? [{ a: a.slice(), n, hot: i, msg: 'a[' + i + ']: the address is ' + base + ' + 4·' + i + ' = ' + (base + 4 * i) + '. One step, whichever cell it is: ' + a[i] + '.', moves: 0 }] : [{ a: a.slice(), n, msg: 'Index ' + i + ' is past the end (' + n + ' values): ArrayIndexOutOfBoundsException.' }]; restart(); } }, 'Get');
    const ins = el('button', { class: 'btn sm', onclick: () => {
      const i = Math.min(k(), n), v = +val.value || 0; steps = [];
      if (n >= cap) { steps.push({ a: a.slice(), n, msg: 'The array is full: there is no cell to shift into. A fixed array cannot grow; see the next figure.' }); restart(); return; }
      steps.push({ a: a.slice(), n, msg: 'Insert ' + v + ' at index ' + i + ': every value from index ' + i + ' onward must move one cell to the right, starting from the end.', moves: 0 });
      const w = a.slice(); let moves = 0;
      for (let j = n - 1; j >= i; j--) { w[j + 1] = w[j]; moves++; steps.push({ a: w.slice(), n: n + 1, hot: j + 1, from: j, msg: 'Move a[' + j + '] = ' + w[j] + ' to a[' + (j + 1) + '].', moves }); }
      w[i] = v; steps.push({ a: w.slice(), n: n + 1, hot: i, msg: 'Now cell ' + i + ' is free: write ' + v + '. ' + moves + ' move' + (moves === 1 ? '' : 's') + ' for an insert at index ' + i + ' of ' + n + ' values.', moves });
      a = w; n++; restart();
    } }, 'Insert');
    const rem = el('button', { class: 'btn sm', onclick: () => {
      const i = k(); steps = [];
      if (i >= n) { steps.push({ a: a.slice(), n, msg: 'Index ' + i + ' is past the end (' + n + ' values).' }); restart(); return; }
      steps.push({ a: a.slice(), n, hot: i, msg: 'Remove a[' + i + '] = ' + a[i] + ': every value after it moves one cell to the left, so no gap is left.', moves: 0 });
      const w = a.slice(); let moves = 0;
      for (let j = i; j < n - 1; j++) { w[j] = w[j + 1]; moves++; steps.push({ a: w.slice(), n, hot: j, from: j + 1, msg: 'Move a[' + (j + 1) + '] = ' + w[j] + ' to a[' + j + '].', moves }); }
      steps.push({ a: w.slice(), n: n - 1, msg: 'Done: ' + (n - 1) + ' values, ' + moves + ' move' + (moves === 1 ? '' : 's') + '. Removing the last value costs 0 moves; removing the first costs n − 1.', moves });
      a = w; n--; restart();
    } }, 'Remove');
    render(0);
    mount.append(el('div', { class: 'fig-scroll' }, svg), el('div', { class: 'fig-tools' }, el('span', {}, 'index'), idx, el('span', {}, 'value'), val, get, ins, rem), log, ctl.el);
  };

  /* ---------- 23. a growing array: capacity doubling and the copies it costs (DSA lesson 1) ---------- */
  W.dynarray = function (mount, b) {
    let cap = 4, n = 0, appends = 0, copies = 0, grows = 0, a = [];
    const cw = 30, x0 = 10, maxCells = 32;
    const svg = sv('svg', { viewBox: '0 0 ' + (x0 * 2 + maxCells * cw) + ' 150', role: 'img', 'aria-label': 'A growing array' });
    const log = el('div', { class: 'fig-status', role: 'status' });
    let steps = [{ a: [], cap, n, msg: 'Start: capacity 4, nothing stored. Append values and watch what happens when the array is full.' }];
    function row(y, arr, c, used, label, hot) {
      svg.append(txt(x0, y - 6, label, { 'font-size': 11, fill: 'var(--ink-2)' }));
      for (let k = 0; k < c; k++) { const x = x0 + k * cw; svg.append(sv('rect', { x, y, width: cw - 3, height: 30, fill: hot === k ? 'var(--accent)' : k < used ? 'var(--accent-soft)' : 'var(--paper-2)', stroke: k < used ? 'var(--ink)' : 'var(--rule)', 'stroke-dasharray': k < used ? null : '3 3' })); if (k < used) svg.append(mono(x + cw / 2 - 1, y + 20, String(arr[k]), { 'text-anchor': 'middle', 'font-size': 11, fill: hot === k ? 'var(--accent-ink)' : 'var(--ink)' })); }
    }
    function render(i) {
      const s = steps[i]; svg.innerHTML = ''; svg.setAttribute('viewBox', '0 0 ' + (x0 * 2 + Math.max(8, s.cap) * cw) + ' 150');   // the view grows with the array
      if (s.old) { row(26, s.old, s.oldCap, s.oldCap, 'old array (capacity ' + s.oldCap + ')', s.hotOld); row(96, s.a, s.cap, s.n, 'new array (capacity ' + s.cap + ')', s.hot); }
      else row(60, s.a, s.cap, s.n, 'capacity ' + s.cap + ', ' + s.n + ' stored', s.hot);
      log.textContent = s.msg + '   appends: ' + (s.appends === undefined ? appends : s.appends) + ' · copies: ' + (s.copies === undefined ? copies : s.copies) + ' · grows: ' + (s.grows === undefined ? grows : s.grows);
    }
    let ctl = stepper(steps.length, render, { interval: 450 });
    const restart = () => { ctl.stop(); const old = ctl.el; ctl = stepper(steps.length, render, { interval: 450 }); old.replaceWith(ctl.el); ctl.set(steps.length - 1); };
    function append(count) {
      steps = [];
      for (let t = 0; t < count; t++) {
        if (cap >= maxCells && n >= cap) { steps.push({ a: a.slice(), cap, n, msg: 'The figure stops at ' + maxCells + ' cells; the pattern continues.' }); break; }
        appends++; const v = appends;
        if (n === cap) {
          const old = a.slice(), oldCap = cap; cap *= 2; grows++; const w = [];
          steps.push({ a: [], old, oldCap, cap, n: 0, msg: 'Full (' + n + ' of ' + oldCap + '). Make a new array twice as big and copy everything across: ' + n + ' copies.', appends, copies, grows });
          for (let k = 0; k < n; k++) { w[k] = old[k]; copies++; steps.push({ a: w.slice(), old, oldCap, cap, n: k + 1, hot: k, hotOld: k, msg: 'Copy old[' + k + '] into the new array.', appends, copies, grows }); }
          a = w;
        }
        a[n] = v; n++;
        steps.push({ a: a.slice(), cap, n, hot: n - 1, msg: 'Append ' + v + ' into cell ' + (n - 1) + ': one step, since there was room.', appends, copies, grows });
      }
      restart();
    }
    const reset = el('button', { class: 'btn sm quiet', onclick: () => { cap = 4; n = 0; appends = 0; copies = 0; grows = 0; a = []; steps = [{ a: [], cap, n, msg: 'Reset.' }]; restart(); } }, 'Reset');
    render(0);
    mount.append(el('div', { class: 'fig-scroll' }, svg), el('div', { class: 'fig-tools' }, el('button', { class: 'btn sm primary', onclick: () => append(1) }, 'Append one'), el('button', { class: 'btn sm', onclick: () => append(8) }, 'Append eight'), reset), log, ctl.el);
  };

  /* ---------- 24. sorting laboratory: algorithm, input shape, counters, and a doubling experiment (DSA lesson 3) ---------- */
  W.sortlab = function (mount, b) {
    const algoSel = el('select', { 'aria-label': 'algorithm' }, [['selection', 'selection sort'], ['insertion', 'insertion sort'], ['bubble', 'bubble sort']].map(([v, t]) => el('option', { value: v, selected: v === (b.algo || 'insertion') ? '' : null }, t)));
    const shapeSel = el('select', { 'aria-label': 'input' }, [['random', 'random'], ['sorted', 'already sorted'], ['reversed', 'reversed'], ['nearly', 'nearly sorted']].map(([v, t]) => el('option', { value: v }, t)));
    const sizeSel = el('select', { 'aria-label': 'size' }, ['8', '12', '16'].map(v => el('option', { value: v, selected: v === '12' ? '' : null }, v + ' values')));
    const log = el('div', { class: 'fig-status', role: 'status' });
    let arr = [], steps = [];
    function makeInput() {
      const n = +sizeSel.value; arr = [];
      for (let i = 0; i < n; i++) arr.push(i + 1);
      const shuffle = () => { for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } };
      if (shapeSel.value === 'random') shuffle(); else if (shapeSel.value === 'reversed') arr.reverse(); else if (shapeSel.value === 'nearly') { for (let t = 0; t < 2; t++) { const i = Math.floor(Math.random() * (n - 1)); [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]; } }
    }
    // the same three algorithms, with every comparison and move counted
    function run(algo, a, record) {
      let cmp = 0, moves = 0; const n = a.length; const R = !!record; const rec = (o) => { record(Object.assign({ a: a.slice(), cmp, moves }, o)); };
      if (algo === 'selection') {
        R && rec({ msg: 'Selection sort: find the smallest of the unsorted part, swap it to the front, repeat.' });
        for (let i = 0; i < n - 1; i++) { let m = i; for (let j = i + 1; j < n; j++) { cmp++; R && rec({ cmp2: [m, j], sortedTo: i, msg: 'Is a[' + j + '] = ' + a[j] + ' smaller than the smallest so far, ' + a[m] + '?' }); if (a[j] < a[m]) m = j; } if (m !== i) { [a[i], a[m]] = [a[m], a[i]]; moves += 3; R && rec({ swap: [i, m], sortedTo: i + 1, msg: 'Swap ' + a[m] + ' and ' + a[i] + ' (one swap = 3 moves).' }); } else R && rec({ sortedTo: i + 1, msg: a[i] + ' is already in place.' }); }
        R && rec({ sortedTo: n, msg: 'Sorted.' });
      } else if (algo === 'insertion') {
        R && rec({ msg: 'Insertion sort: take the next value and slide it left until it is in order.' });
        for (let i = 1; i < n; i++) { const v = a[i]; let j = i; R && rec({ cmp2: [i], sortedTo: i, msg: 'Take a[' + i + '] = ' + v + '.' }); while (j > 0) { cmp++; if (a[j - 1] > v) { a[j] = a[j - 1]; moves++; j--; R && rec({ cmp2: [j, j + 1], sortedTo: i + 1, msg: a[j + 1] + ' > ' + v + ': shift it right.' }); } else { R && rec({ cmp2: [j - 1], sortedTo: i + 1, msg: a[j - 1] + ' ≤ ' + v + ': stop here.' }); break; } } a[j] = v; moves++; R && rec({ swap: [j], sortedTo: i + 1, msg: 'Put ' + v + ' in cell ' + j + '. The first ' + (i + 1) + ' values are sorted.' }); }
        R && rec({ sortedTo: n, msg: 'Sorted.' });
      } else {
        R && rec({ msg: 'Bubble sort: compare neighbours, swap when out of order, until a pass makes no swap.' });
        for (let i = 0; i < n - 1; i++) { let swapped = false; for (let j = 0; j < n - 1 - i; j++) { cmp++; R && rec({ cmp2: [j, j + 1], sortedFrom: n - i, msg: 'Compare ' + a[j] + ' and ' + a[j + 1] + '.' }); if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; moves += 3; swapped = true; R && rec({ swap: [j, j + 1], sortedFrom: n - i, msg: 'Out of order: swap.' }); } } R && rec({ sortedFrom: n - i - 1, msg: 'End of pass ' + (i + 1) + '.' }); if (!swapped) break; }
        R && rec({ sortedFrom: 0, msg: 'Sorted.' });
      }
      return { cmp, moves };
    }
    const cw = 36, x0 = 10, H = 140;
    const svg = sv('svg', { viewBox: '0 0 ' + (x0 * 2 + 16 * cw) + ' ' + (H + 30), role: 'img', 'aria-label': 'Sorting' });
    function render(i) {
      const s = steps[i]; svg.innerHTML = ''; const n = s.a.length, max = Math.max(...s.a); const w = (16 * cw) / n;
      s.a.forEach((v, k) => { const x = x0 + k * w, h = (v / max) * H; const sorted = (s.sortedFrom !== undefined && k >= s.sortedFrom) || (s.sortedTo !== undefined && k < s.sortedTo); const active = (s.cmp2 && s.cmp2.includes(k)) || (s.swap && s.swap.includes(k)); const fill = s.swap && s.swap.includes(k) ? 'var(--ok)' : active ? 'var(--accent)' : sorted ? 'var(--ink-3)' : 'var(--accent-soft)'; svg.append(sv('rect', { x: x + 3, y: H - h + 5, width: w - 6, height: h, fill, stroke: active ? 'var(--ink)' : 'var(--rule)' })); svg.append(mono(x + w / 2, H + 22, String(v), { 'text-anchor': 'middle', 'font-size': 11, fill: active ? 'var(--ink)' : 'var(--ink-2)' })); });
      log.textContent = s.msg + '   comparisons: ' + s.cmp + ' · moves: ' + s.moves;
    }
    let ctl = null;
    function rebuild() { makeInput(); steps = []; run(algoSel.value, arr.slice(), (st) => steps.push(st)); if (ctl) ctl.stop(); const old = ctl && ctl.el; ctl = stepper(steps.length, render, { interval: 500 }); if (old) old.replaceWith(ctl.el); }
    // the doubling experiment: the same algorithm on random inputs of n, 2n, 4n, 8n, timed here in the page (not in the Java sandbox)
    const expo = el('div', { class: 'tbl-wrap' });
    const measure = el('button', { class: 'btn sm', onclick: () => {
      const algo = algoSel.value; const rows = []; let prev = null;
      for (const n of [1000, 2000, 4000, 8000]) {
        const a = []; for (let i = 0; i < n; i++) a.push(Math.floor(Math.random() * 1e6));
        const t0 = performance.now(); const c = run(algo, a, null); const ms = performance.now() - t0;
        rows.push([n, c.cmp, ms, prev ? c.cmp / prev : null]); prev = c.cmp;
      }
      const t = el('table', { class: 'small' }, el('tr', {}, ['n', 'comparisons', 'time (ms)', 'ratio to the row above'].map(h => el('th', {}, h))), rows.map(r => el('tr', {}, el('td', {}, r[0].toLocaleString('en-US')), el('td', {}, r[1].toLocaleString('en-US')), el('td', {}, r[2].toFixed(1)), el('td', {}, r[3] ? r[3].toFixed(2) : '—'))));
      expo.innerHTML = ''; expo.append(t, el('p', { class: 'fig-status' }, 'Doubling n multiplies the comparisons by about 4: the signature of n². (The times are this computer’s, in JavaScript; they are noisy for small n but the ratio tells the same story.)'));
    } }, 'Run the doubling experiment');
    rebuild();
    for (const sel of [algoSel, shapeSel, sizeSel]) sel.addEventListener('change', rebuild);
    mount.append(el('div', { class: 'fig-tools' }, algoSel, shapeSel, sizeSel, el('button', { class: 'btn sm', onclick: rebuild }, 'New input')), svg, log, ctl.el, el('div', { class: 'fig-tools' }, measure), expo);
  };

  /* ---------- 25. Scratch blocks beside Python (From Scratch to Python) ----------
     block: [category, text, children?, elseChildren?]; in text, [words] is a text input, (10) a number or reporter, <cond> a boolean.
     categories: event looks motion control sensing operators variables myblocks pen sound */
  // A stack of Scratch-style blocks: [[category, text, children?, elseChildren?], ...]. In text, [words] is a text input, (10) a number,
  // <cond> a boolean. Shared by the blocks figure and the translate-the-block quiz.
  function blockStack(stack) {
    // [words] is a text input, (10) a number, <cond> a boolean. Booleans nest (<<a> and <b>>), and a > inside one is a comparison
    // when an operand follows it ("(x) > (5)"); otherwise it closes the boolean.
    const inline = (text) => {
      const out = []; let i = 0, plain = '';
      const flush = () => { if (plain) { out.push(plain); plain = ''; } };
      const isCompare = (k) => /^ [(\[<]/.test(text.slice(k + 1, k + 3));   // "(x) < (5)": a comparison, not a bracket
      const closeAt = (from) => { let depth = 0; for (let k = from; k < text.length; k++) { const c = text[k]; if (c === '<' && !isCompare(k)) depth++; else if (c === '>' && !isCompare(k)) { if (depth === 0) return k; depth--; } } return -1; };
      while (i < text.length) {
        const c = text[i];
        if (c === '[') { const j = text.indexOf(']', i); if (j > i) { flush(); out.push(el('span', { class: 'sb-in sb-text' }, text.slice(i + 1, j))); i = j + 1; continue; } }
        if (c === '(') { const j = text.indexOf(')', i); if (j > i) { flush(); out.push(el('span', { class: 'sb-in sb-num' }, text.slice(i + 1, j))); i = j + 1; continue; } }
        if (c === '<' && !isCompare(i)) { const j = closeAt(i + 1); if (j > i) { flush(); out.push(el('span', { class: 'sb-in sb-bool' }, inline(text.slice(i + 1, j)))); i = j + 1; continue; } }
        plain += c; i++;
      }
      flush();
      return out;
    };
    const render = (block, first) => {
      const [cat, text, kids, elseKids] = block;
      if (kids) {
        const c = el('div', { class: 'sb sb-c sb-' + cat });
        c.append(el('div', { class: 'sb-row' }, inline(text)), el('div', { class: 'sb-body' }, (kids.length ? kids : [['empty', '']]).map(k => render(k))));
        if (elseKids) c.append(el('div', { class: 'sb-row' }, 'else'), el('div', { class: 'sb-body' }, (elseKids.length ? elseKids : [['empty', '']]).map(k => render(k))));
        c.append(el('div', { class: 'sb-cap' }));
        return c;
      }
      return el('div', { class: 'sb sb-' + cat + (first && cat === 'event' ? ' sb-hat' : '') }, el('div', { class: 'sb-row' }, inline(text)));
    };
    return el('div', { class: 'sb-stack' }, (stack || []).map((blk, i) => render(blk, i === 0)));
  }
  W.blocks = function (mount, b) {
    const code = el('pre', { class: 'code sb-py' }, el('code', { html: window.__highlight ? window.__highlight(b.python || '', 'python') : esc(b.python || '') }));
    mount.append(el('div', { class: 'sb-pair' },
      el('div', { class: 'sb-col' }, el('div', { class: 'sb-head' }, b.leftLabel || 'In Scratch'), blockStack(b.stack)),
      el('div', { class: 'sb-arrow', 'aria-hidden': 'true' }, '→'),
      el('div', { class: 'sb-col' }, el('div', { class: 'sb-head' }, b.rightLabel || 'In Python'), code)));
  };

  /* ---------- 25b. translate the block: a Scratch block is shown, the student types the Python line (From Scratch to Python) ---------- */
  // items: [{ stack, answer: 'print("Hi")' | ['...', '...'], hint }]. Answers are compared with the spaces outside quotes removed and
  // single quotes read as double, so print ('Hi') passes; capitals and the colon are not forgiven, because Python does not forgive them.
  W.blockquiz = function (mount, b) {
    const items = (b.items || []).filter((it) => it && it.stack && it.answer);
    if (!items.length) return;
    const norm = (s) => { let out = '', q = null; for (const ch of String(s).trim()) { if (q) { out += ch === q ? '"' : ch; if (ch === q) q = null; } else if (ch === '"' || ch === "'") { q = ch; out += '"'; } else if (!/\s/.test(ch)) out += ch; } return out; };
    let k = 0, tries = 0, right = 0, done = false;
    const stackBox = el('div', { class: 'bq-stack' });
    const input = el('input', { type: 'text', class: 'bq-input', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', 'aria-label': 'the Python line' });
    const msg = el('div', { class: 'fig-status bq-msg', role: 'status' });
    const score = el('span', { class: 'fig-note' });
    const check = el('button', { class: 'btn sm primary' }, 'Check');
    const next = el('button', { class: 'btn sm', hidden: '' }, 'Next');
    const show = el('button', { class: 'btn sm quiet' }, 'Show me');
    const again = el('button', { class: 'btn sm quiet', hidden: '' }, 'Play again');
    const answers = (it) => (Array.isArray(it.answer) ? it.answer : [it.answer]);
    function load() {
      const it = items[k]; tries = 0; stackBox.replaceChildren(blockStack(it.stack)); input.value = ''; input.disabled = false; msg.textContent = ''; msg.classList.remove('ok', 'err');
      check.hidden = false; next.hidden = true; show.hidden = false; score.textContent = 'block ' + (k + 1) + ' of ' + items.length + (right ? ' · ' + right + ' right' : '');
      input.focus();
    }
    function finish() {
      done = true; stackBox.replaceChildren(); input.hidden = true; check.hidden = true; next.hidden = true; show.hidden = true; again.hidden = false;
      msg.classList.add('ok');
      msg.textContent = right === items.length ? 'All ' + items.length + ' right! You can read Scratch and write Python.' : right + ' of ' + items.length + ' right. Play again and try the ones you missed.';
      score.textContent = '';
    }
    function reveal(it, text) { input.value = answers(it)[0]; input.disabled = true; msg.textContent = text; check.hidden = true; show.hidden = true; next.hidden = false; next.focus(); }
    check.onclick = () => {
      const it = items[k]; const got = norm(input.value);
      if (!got) { msg.textContent = 'Type the Python line, then Check.'; return; }
      if (answers(it).some((a) => norm(a) === got)) { right++; msg.classList.remove('err'); msg.classList.add('ok'); msg.textContent = ['Yes!', 'Right!', 'Exactly.', 'That is it.'][right % 4]; input.disabled = true; check.hidden = true; show.hidden = true; next.hidden = false; next.focus(); return; }
      tries++; msg.classList.remove('ok'); msg.classList.add('err');
      const a = answers(it)[0], raw = input.value.trim();
      let why = it.hint || 'Not quite. Look at the block again.';
      if (raw.toLowerCase() === a.toLowerCase() && raw !== a) why = 'Almost: check the capital letters. Python cares about them.';
      else if (a.endsWith(':') && !raw.endsWith(':')) why = 'Close. A line that opens a C-block ends with a colon.';
      else if (/==/.test(a) && /[^=!<>]=[^=]/.test(raw) && !/==/.test(raw)) why = 'One = sets a variable. Two (==) ask "are these the same?".';
      else if (/"/.test(a) && !/["']/.test(raw)) why = 'The words that get shown need quotation marks.';
      msg.textContent = (tries >= 2 ? 'Still not it. ' : 'Not quite. ') + why + (tries >= 2 ? ' Press Show me if you are stuck.' : '');
    };
    show.onclick = () => reveal(items[k], 'The answer is ' + answers(items[k])[0] + '. Type it once to remember it, then press Next.');
    next.onclick = () => { k++; if (k >= items.length) finish(); else load(); };
    again.onclick = () => { k = 0; right = 0; done = false; input.hidden = false; again.hidden = true; msg.classList.remove('ok'); load(); };
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); if (!next.hidden) next.click(); else if (!done) check.click(); } });
    mount.append(el('div', { class: 'bq' }, el('div', { class: 'sb-head' }, b.title || 'Translate the block'), stackBox,
      el('div', { class: 'bq-row' }, el('span', { class: 'bq-arrow', 'aria-hidden': 'true' }, '→'), input),
      el('div', { class: 'fig-tools' }, check, next, show, again, score), msg));
    load();
  };

  /* ---------- 26. merge sort, bottom up: runs doubling in size, every merge step shown (DSA lesson 4) ---------- */
  W.mergeviz = function (mount, b) {
    let arr = (b.items || [38, 27, 43, 3, 9, 82, 10, 1, 56, 14, 71, 5, 29, 66, 48, 12]).slice();
    const n = arr.length, cw = 36, x0 = 10;
    const svg = sv('svg', { viewBox: '0 0 ' + (x0 * 2 + n * cw) + ' 150', role: 'img', 'aria-label': 'Merge sort' });
    const log = el('div', { class: 'fig-status', role: 'status' });
    let steps = [];
    function compute() {
      steps = []; let a = arr.slice(); let cmp = 0;
      steps.push({ a: a.slice(), width: 1, msg: 'Every single value is a sorted run of length 1. Merge neighbouring runs, doubling the run length each round.', cmp });
      for (let width = 1; width < n; width *= 2) {
        const out = a.slice();
        for (let lo = 0; lo < n; lo += 2 * width) {
          const mid = Math.min(lo + width, n), hi = Math.min(lo + 2 * width, n);
          if (mid >= hi) continue;
          let i = lo, j = mid, k = lo;
          steps.push({ a: a.slice(), out: null, width, run: [lo, mid, hi], msg: 'Merge the runs ' + lo + '…' + (mid - 1) + ' and ' + mid + '…' + (hi - 1) + ': take the smaller front value each time.', cmp });
          while (i < mid && j < hi) { cmp++; const takeLeft = a[i] <= a[j]; const v = takeLeft ? a[i] : a[j]; out[k] = v; steps.push({ a: a.slice(), out: out.slice(), width, run: [lo, mid, hi], i, j, k, msg: a[i] + (takeLeft ? ' ≤ ' : ' > ') + a[j] + ': take ' + v + ' from the ' + (takeLeft ? 'left' : 'right') + ' run.', cmp }); if (takeLeft) i++; else j++; k++; }
          while (i < mid) { out[k] = a[i]; steps.push({ a: a.slice(), out: out.slice(), width, run: [lo, mid, hi], i, k, msg: 'The right run is used up: copy ' + a[i] + ' across, no comparison needed.', cmp }); i++; k++; }
          while (j < hi) { out[k] = a[j]; steps.push({ a: a.slice(), out: out.slice(), width, run: [lo, mid, hi], j, k, msg: 'The left run is used up: copy ' + a[j] + ' across, no comparison needed.', cmp }); j++; k++; }
        }
        a = out;
        steps.push({ a: a.slice(), width: width * 2, msg: 'Runs of length ' + Math.min(width * 2, n) + ' are now sorted. Comparisons so far: ' + cmp + '.', cmp });
      }
      steps.push({ a: a.slice(), width: n, done: true, msg: 'Sorted, with ' + cmp + ' comparisons: about n log₂ n = ' + n + ' × ' + Math.log2(n) + ' = ' + (n * Math.log2(n)) + ' at most, against n²/2 = ' + (n * n / 2) + ' for the quadratic sorts.', cmp });
    }
    function render(s) {
      const st = steps[s]; svg.innerHTML = '';
      const row = (vals, y, hot, label) => {
        svg.append(txt(x0, y - 6, label, { 'font-size': 11, fill: 'var(--ink-2)' }));
        vals.forEach((v, k) => {
          const x = x0 + k * cw; const inRun = st.run && k >= st.run[0] && k < st.run[2];
          const side = st.run ? (k < st.run[1] ? 'L' : 'R') : null;
          let fill = 'var(--paper)'; if (st.done) fill = 'var(--ok-soft)'; else if (inRun) fill = side === 'L' ? 'var(--accent-soft)' : 'var(--paper-2)';
          if (hot !== undefined && hot === k) fill = 'var(--accent)';
          svg.append(sv('rect', { x, y, width: cw - 3, height: 30, fill, stroke: inRun ? 'var(--ink)' : 'var(--rule)' }));
          if (v !== undefined && v !== null) svg.append(mono(x + cw / 2 - 1, y + 20, String(v), { 'text-anchor': 'middle', 'font-size': 12, fill: hot === k ? 'var(--accent-ink)' : 'var(--ink)' }));
          if (!st.done && st.width < n && k % st.width === 0 && k > 0) svg.append(sv('line', { x1: x - 1.5, y1: y - 4, x2: x - 1.5, y2: y + 34, stroke: 'var(--accent)', 'stroke-width': 2 }));
        });
      };
      if (st.out) {
        const top = st.a.map((v, k) => ((st.i !== undefined && k === st.i) || (st.j !== undefined && k === st.j) ? v : (k >= st.run[0] && k < st.run[2] ? v : v)));
        row(top, 24, st.i !== undefined && st.j !== undefined ? (st.a[st.i] <= st.a[st.j] ? st.i : st.j) : (st.i !== undefined ? st.i : st.j), 'the two runs being merged (left shaded)');
        const outVals = st.out.map((v, k) => (k >= st.run[0] && k < st.run[2] && k <= st.k ? v : (k >= st.run[0] && k < st.run[2] ? null : v)));
        row(outVals, 96, st.k, 'the merged run being built');
      } else row(st.a, 60, undefined, st.done ? 'sorted' : 'runs of length ' + Math.min(st.width, n));
      log.textContent = st.msg;
    }
    compute();
    let ctl = stepper(steps.length, render, { interval: 650 });
    const shuffle = el('button', { class: 'btn sm', onclick: () => { for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } compute(); ctl.stop(); const old = ctl.el; ctl = stepper(steps.length, render, { interval: 650 }); old.replaceWith(ctl.el); } }, 'Shuffle');
    mount.append(el('div', { class: 'fig-scroll' }, svg), log, ctl.el, el('div', { class: 'fig-tools' }, shuffle));
  };

  /* ---------- 27. quicksort's partition (Lomuto), one comparison at a time (DSA lesson 4) ---------- */
  W.partition = function (mount, b) {
    let arr = (b.items || [29, 10, 14, 37, 13, 7, 41, 22, 18, 25]).slice();
    const n = arr.length, cw = 48, x0 = 10, H = 120;
    const svg = sv('svg', { viewBox: '0 0 ' + (x0 * 2 + n * cw) + ' ' + (H + 60), role: 'img', 'aria-label': 'Partition' });
    const log = el('div', { class: 'fig-status', role: 'status' });
    let steps = [];
    function compute() {
      steps = []; const a = arr.slice(); const pivot = a[n - 1]; let i = 0, cmp = 0;
      steps.push({ a: a.slice(), i, j: null, pivot, msg: 'The pivot is the last value, ' + pivot + '. Walk j across the rest; i marks where the next small value goes.', cmp });
      for (let j = 0; j < n - 1; j++) {
        cmp++;
        if (a[j] < pivot) { [a[i], a[j]] = [a[j], a[i]]; steps.push({ a: a.slice(), i, j, pivot, swap: true, msg: a[j] === a[i] ? a[i] + ' < ' + pivot + ': it is already at position i, so just move i on.' : a[i] + ' < ' + pivot + ': swap it into position i, then move i on.', cmp }); i++; }
        else steps.push({ a: a.slice(), i, j, pivot, msg: a[j] + ' ≥ ' + pivot + ': leave it, it belongs on the right.', cmp });
      }
      [a[i], a[n - 1]] = [a[n - 1], a[i]];
      steps.push({ a: a.slice(), i, j: null, pivot, done: true, msg: 'Finally swap the pivot into position i = ' + i + '. Everything left of it is smaller, everything right is at least as big: the pivot is in its final place after ' + cmp + ' comparisons. Quicksort now sorts the two sides the same way.', cmp });
    }
    const max = Math.max(...arr);
    function render(s) {
      const st = steps[s]; svg.innerHTML = '';
      st.a.forEach((v, k) => {
        const x = x0 + k * cw, h = (v / max) * H;
        const isPivot = st.done ? k === st.i : k === n - 1;
        const small = st.done ? k < st.i : k < st.i;
        const fill = isPivot ? 'var(--accent)' : (st.j === k ? 'var(--hl-p)' : small ? 'var(--ok-soft)' : (st.j !== null && st.j !== undefined && k < st.j && !st.done) ? 'var(--paper-2)' : 'var(--accent-soft)');
        svg.append(sv('rect', { x: x + 4, y: H - h + 5, width: cw - 8, height: h, fill, stroke: st.j === k || isPivot ? 'var(--ink)' : 'var(--rule)' }));
        svg.append(mono(x + cw / 2, H + 22, String(v), { 'text-anchor': 'middle', 'font-size': 12, fill: 'var(--ink-2)' }));
      });
      if (!st.done) { svg.append(txt(x0 + st.i * cw + cw / 2, H + 44, 'i', { 'text-anchor': 'middle', 'font-size': 12, fill: 'var(--ok)', 'font-weight': 700 })); if (st.j !== null && st.j !== undefined) svg.append(txt(x0 + st.j * cw + cw / 2, H + 56, 'j', { 'text-anchor': 'middle', 'font-size': 12, fill: 'var(--hl-p)', 'font-weight': 700 })); svg.append(txt(x0 + (n - 1) * cw + cw / 2, H + 44, 'pivot', { 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--accent)', 'font-weight': 700 })); }
      else { svg.append(txt(x0 + st.i * cw + cw / 2, H + 44, 'pivot, final', { 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--accent)', 'font-weight': 700 })); if (st.i > 0) svg.append(txt(x0 + 4, H + 56, '← smaller', { 'font-size': 11, fill: 'var(--ok)' })); if (st.i < n - 1) svg.append(txt(x0 + n * cw - 4, H + 56, 'larger or equal →', { 'font-size': 11, fill: 'var(--ink-2)', 'text-anchor': 'end' })); }
      log.textContent = st.msg + '   comparisons: ' + st.cmp;
    }
    compute();
    let ctl = stepper(steps.length, render, { interval: 800 });
    const shuffle = el('button', { class: 'btn sm', onclick: () => { for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } compute(); ctl.stop(); const old = ctl.el; ctl = stepper(steps.length, render, { interval: 800 }); old.replaceWith(ctl.el); } }, 'Shuffle');
    mount.append(el('div', { class: 'fig-scroll' }, svg), log, ctl.el, el('div', { class: 'fig-tools' }, shuffle));
  };

  /* ---------- 28. a linked list: nodes with a value and a next arrow, operations with hops counted (DSA lesson 5) ---------- */
  W.linkedlist = function (mount, b) {
    let list = (b.items || [12, 7, 3, 9]).slice();
    const maxN = 8, bw = 68, gap = 28, x0 = 54;
    const svg = sv('svg', { viewBox: '0 0 ' + (x0 + maxN * (bw + gap) + 20) + ' 130', role: 'img', 'aria-label': 'A linked list' });
    const idx = el('input', { type: 'number', value: '2', min: '0', max: '7', 'aria-label': 'index' });
    const val = el('input', { type: 'number', value: '21', 'aria-label': 'value' });
    const log = el('div', { class: 'fig-status', role: 'status' });
    let steps = [{ a: list.slice(), msg: 'Four nodes. Each holds a value and the address of the next node; head holds the address of the first; the last node’s next is null. The nodes can be anywhere in memory: only the arrows connect them.', hops: 0 }];
    function render(s) {
      const st = steps[s]; svg.innerHTML = '';
      svg.setAttribute('viewBox', '0 0 ' + (x0 + Math.max(st.a.length, 4) * (bw + gap) + 20) + ' 130');   // few nodes: draw them larger
      svg.prepend(sv('defs', {}, sv('marker', { id: 'll-arr', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, sv('path', { d: 'M0 0L10 5L0 10z', fill: 'var(--ink)' }))));
      svg.append(mono(8, 62, 'head', { 'font-size': 12, fill: 'var(--ink-2)' }));
      const nodes = st.a; const X = (k) => x0 + k * (bw + gap);
      if (!nodes.length) svg.append(mono(x0, 62, 'null', { 'font-size': 12, fill: 'var(--ink-3)' }));
      else svg.append(sv('path', { d: 'M38 58 H' + (X(0) - 2), stroke: 'var(--ink)', 'stroke-width': 1.5, 'marker-end': 'url(#ll-arr)' }));
      nodes.forEach((v, k) => {
        const x = X(k), hot = st.hot === k, nu = st.isNew === k;
        svg.append(sv('rect', { x, y: 40, width: bw * 0.6, height: 36, fill: hot ? 'var(--accent)' : nu ? 'var(--ok-soft)' : 'var(--paper)', stroke: 'var(--ink)' }));
        svg.append(sv('rect', { x: x + bw * 0.6, y: 40, width: bw * 0.4, height: 36, fill: hot ? 'var(--accent-soft)' : 'var(--paper-2)', stroke: 'var(--ink)' }));
        svg.append(mono(x + bw * 0.3, 63, String(v), { 'text-anchor': 'middle', 'font-size': 13, fill: hot ? 'var(--accent-ink)' : 'var(--ink)' }));
        svg.append(mono(x + bw * 0.8, 63, k < nodes.length - 1 ? '•' : '∅', { 'text-anchor': 'middle', 'font-size': 13, fill: 'var(--ink-2)' }));
        if (k < nodes.length - 1) svg.append(sv('path', { d: 'M' + (x + bw * 0.8) + ' 58 H' + (X(k + 1) - 2), stroke: 'var(--ink)', 'stroke-width': 1.5, 'marker-end': 'url(#ll-arr)' }));
        svg.append(mono(x + bw * 0.3, 30, 'index ' + k, { 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--ink-3)' }));
        if (st.cur === k) svg.append(txt(x + bw * 0.3, 100, 'current', { 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--accent)', 'font-weight': 700 }));
      });
      log.textContent = st.msg + (st.hops !== undefined ? '   hops: ' + st.hops : '');
    }
    let ctl = stepper(steps.length, render, { interval: 700 });
    const restart = () => { ctl.stop(); const old = ctl.el; ctl = stepper(steps.length, render, { interval: 700 }); old.replaceWith(ctl.el); };
    const k = () => Math.max(0, +idx.value || 0), v = () => +val.value || 0;
    const walk = (target, what) => { const out = []; for (let c = 0; c < target; c++) out.push({ a: list.slice(), cur: c, hops: c, msg: 'At node ' + c + '; follow its next arrow (' + what + ').' }); return out; };
    const addFirst = el('button', { class: 'btn sm', onclick: () => { if (list.length >= maxN) return; list.unshift(v()); steps = [{ a: list.slice(), isNew: 0, hot: 0, hops: 0, msg: 'Add ' + v() + ' at the front: make a node whose next is the old head, and point head at it. No walking: O(1) however long the list is.' }]; restart(); } }, 'Add first');
    const addLast = el('button', { class: 'btn sm', onclick: () => { if (list.length >= maxN) return; steps = walk(list.length - 1, 'looking for the last node'); if (list.length) steps.push({ a: list.slice(), cur: list.length - 1, hops: list.length - 1, msg: 'This node’s next is null: it is the last. Point it at the new node.' }); list.push(v()); steps.push({ a: list.slice(), isNew: list.length - 1, hot: list.length - 1, hops: Math.max(0, list.length - 2), msg: 'Added ' + v() + ' at the end after walking the whole list: O(n). (Keeping a tail pointer makes this O(1); the Java LinkedList does.)' }); restart(); } }, 'Add last');
    const removeFirst = el('button', { class: 'btn sm', onclick: () => { if (!list.length) return; const gone = list.shift(); steps = [{ a: list.slice(), hot: 0, hops: 0, msg: 'Remove the first: point head at the second node. ' + gone + ' is no longer reachable and the garbage collector reclaims it. O(1).' }]; restart(); } }, 'Remove first');
    const get = el('button', { class: 'btn sm', onclick: () => { const i = k(); if (i >= list.length) { steps = [{ a: list.slice(), msg: 'Index ' + i + ' does not exist: the list has ' + list.length + ' nodes. (A list cannot jump to an index; it walks.)', hops: 0 }]; restart(); return; } steps = walk(i, 'counting'); steps.push({ a: list.slice(), hot: i, cur: i, hops: i, msg: 'Index ' + i + ' holds ' + list[i] + ', found after ' + i + ' hop' + (i === 1 ? '' : 's') + '. An array would have gone straight there.' }); restart(); } }, 'Get index');
    const insertAt = el('button', { class: 'btn sm', onclick: () => { const i = k(); if (list.length >= maxN || i > list.length) return; if (i === 0) { addFirst.onclick(); return; } steps = walk(i - 1, 'looking for the node before index ' + i); steps.push({ a: list.slice(), cur: i - 1, hops: i - 1, msg: 'Node ' + (i - 1) + ' is the one before the insertion point. The new node’s next becomes this node’s next; then this node’s next becomes the new node.' }); list.splice(i, 0, v()); steps.push({ a: list.slice(), isNew: i, hot: i, hops: i - 1, msg: 'Inserted ' + v() + ' at index ' + i + ': two arrows changed, nothing shifted. The walk cost ' + (i - 1) + ' hop' + (i - 1 === 1 ? '' : 's') + '; the insert itself cost nothing.' }); restart(); } }, 'Insert at index');
    render(0);
    mount.append(el('div', { class: 'fig-scroll' }, svg), el('div', { class: 'fig-tools' }, el('span', {}, 'index'), idx, el('span', {}, 'value'), val, get, insertAt, addFirst, addLast, removeFirst), log, ctl.el);
  };

  /* ---------- 29. a stack or a ring-buffer queue in an array of 8 cells, one operation at a time (DSA lesson 6) ---------- */
  W.stackqueue = function (mount, b) {
    const kind = b.kind === 'queue' ? 'queue' : 'stack', cap = 8, cw = 44, x0 = 40;
    let cells = new Array(cap).fill(null), top = 0, head = 0, tail = 0, count = 0, nextVal = 1, hot = -1;
    const svg = sv('svg', { viewBox: '0 0 ' + (x0 * 2 + cap * cw) + ' 120', role: 'img', 'aria-label': kind === 'stack' ? 'A stack in an array' : 'A queue in a ring buffer' });
    const log = el('div', { class: 'fig-status', role: 'status' });
    const val = el('input', { type: 'number', value: String(nextVal), 'aria-label': 'value' });
    function render(msg) {
      svg.innerHTML = '';
      for (let i = 0; i < cap; i++) {
        const x = x0 + i * cw, used = cells[i] !== null;
        svg.append(sv('rect', { x, y: 30, width: cw, height: 40, fill: i === hot ? 'var(--accent)' : used ? 'var(--accent-soft, var(--paper-2))' : 'var(--paper)', stroke: 'var(--rule)' }));
        if (used) svg.append(mono(x + cw / 2, 56, String(cells[i]), { 'text-anchor': 'middle', 'font-size': 14, fill: i === hot ? '#fff' : 'var(--ink)' }));
        svg.append(mono(x + cw / 2, 20, String(i), { 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--ink-3)' }));
      }
      const mark = (i, label, y, color) => { const x = x0 + i * cw + cw / 2; svg.append(sv('path', { d: 'M' + x + ' ' + (y - 14) + ' l-5 -8 h10 z', fill: color })); svg.append(mono(x, y, label, { 'text-anchor': 'middle', 'font-size': 12, fill: color, 'font-weight': 'bold' })); };
      if (kind === 'stack') mark(Math.min(top, cap - 1) , 'top' + (top === cap ? ' (full)' : ''), 100, 'var(--accent)');
      else if (head === tail) mark(head, 'head, tail', 100, 'var(--accent)');
      else { mark(head, 'head', 100, 'var(--accent)'); mark(tail, 'tail', 100, 'var(--ok)'); }
      const n = kind === 'stack' ? top : count;
      const order = []; if (kind === 'stack') for (let i = top - 1; i >= 0; i--) order.push(cells[i]); else for (let k = 0; k < count; k++) order.push(cells[(head + k) % cap]);
      log.textContent = msg + '   size ' + n + (order.length ? (kind === 'stack' ? '   top → bottom: ' : '   front → back: ') + order.join(' ') : '');
    }
    const v = () => { const x = parseInt(val.value, 10); return Number.isFinite(x) ? x : nextVal; };
    const add = el('button', { class: 'btn sm primary', onclick: () => {
      const x = v(); nextVal = x + 1; val.value = String(nextVal);
      if (kind === 'stack') { if (top === cap) { hot = -1; render('Full. A growing stack would now copy into an array of 16 (lesson 1: doubling), then push.'); return; } cells[top] = x; hot = top; top++; render('push(' + x + '): write at top, then top++. One write: O(1).'); }
      else { if (count === cap) { hot = -1; render('Full. A growing queue copies the ' + cap + ' items, in order from head, into an array of 16, and resets head to 0.'); return; } cells[tail] = x; hot = tail; const was = tail; tail = (tail + 1) % cap; count++; render('enqueue(' + x + '): write at tail (' + was + '), then tail = (tail + 1) % ' + cap + (tail < was ? ' = ' + tail + ': wrapped round to the start' : '') + '. O(1).'); }
    } }, kind === 'stack' ? 'Push' : 'Enqueue');
    const remove = el('button', { class: 'btn sm', onclick: () => {
      if (kind === 'stack') { if (top === 0) { hot = -1; render('Empty: pop() has nothing to give. A real stack throws here.'); return; } top--; const x = cells[top]; cells[top] = null; hot = -1; render('pop(): top--, return cells[top] = ' + x + '. Nothing else moves: O(1).'); }
      else { if (count === 0) { hot = -1; render('Empty: dequeue() has nothing to give.'); return; } const x = cells[head]; cells[head] = null; const was = head; head = (head + 1) % cap; count--; hot = -1; render('dequeue(): take cells[head] = ' + x + ' (cell ' + was + '), head = (head + 1) % ' + cap + (head < was ? ' = 0: wrapped' : '') + '. Nothing shifts: O(1).'); }
    } }, kind === 'stack' ? 'Pop' : 'Dequeue');
    const peek = el('button', { class: 'btn sm quiet', onclick: () => { if (kind === 'stack') { hot = top > 0 ? top - 1 : -1; render(top ? 'peek(): cells[top − 1] = ' + cells[top - 1] + ', without removing it.' : 'Empty: nothing to peek at.'); } else { hot = count ? head : -1; render(count ? 'peek(): cells[head] = ' + cells[head] + ', the front, without removing it.' : 'Empty: nothing to peek at.'); } } }, 'Peek');
    const reset = el('button', { class: 'btn sm quiet', onclick: () => { cells.fill(null); top = head = tail = count = 0; nextVal = 1; val.value = '1'; hot = -1; render(kind === 'stack' ? 'Empty stack: top is 0.' : 'Empty queue: head and tail both 0.'); } }, 'Reset');
    mount.append(svg, el('div', { class: 'fig-tools' }, el('label', {}, 'value ', val), add, remove, peek, reset), log);
    render(kind === 'stack' ? 'An array of ' + cap + ' cells and an index, top: the number of items, and the cell the next push writes to.' : 'An array of ' + cap + ' cells and two indices. head is the front; tail is where the next item goes. Both move right and wrap round: a ring.');
  };

  /* ---------- 30. the call stack of a recursive function, frame by frame (DSA lesson 7) ---------- */
  W.callstack = function (mount, b) {
    const fn = b.fn === 'fact' ? 'fact' : b.fn === 'sum' ? 'sum' : 'fib';
    const maxN = fn === 'fib' ? 7 : 8;
    const nIn = el('input', { type: 'number', value: String(b.n || (fn === 'fib' ? 5 : 4)), min: '0', max: String(maxN), 'aria-label': 'n' });
    const svg = sv('svg', { viewBox: '0 0 420 ' + 40, role: 'img', 'aria-label': 'The call stack' });
    const log = el('div', { class: 'fig-status', role: 'status' });
    const host = el('div');
    let steps = [], calls = 0;
    function trace(n) {
      steps = []; calls = 0; const stack = [];
      const snap = (msg, extra) => steps.push(Object.assign({ stack: stack.map(f => Object.assign({}, f)), msg, calls }, extra || {}));
      function fib(n) {
        calls++; stack.push({ label: 'fib(' + n + ')', note: '' }); snap('Call fib(' + n + '): a new frame on top of the stack. Calls so far: ' + calls + '.');
        let r;
        if (n < 2) { r = n; stack[stack.length - 1].note = '= ' + r; snap('fib(' + n + ') is a base case: return ' + r + ' without calling anything.'); }
        else { stack[stack.length - 1].note = 'needs fib(' + (n - 1) + ')'; const a = fib(n - 1); stack[stack.length - 1].note = 'fib(' + (n - 1) + ') = ' + a + ', needs fib(' + (n - 2) + ')'; snap('Back in fib(' + n + '): fib(' + (n - 1) + ') gave ' + a + '. Now call fib(' + (n - 2) + ').'); const c = fib(n - 2); r = a + c; stack[stack.length - 1].note = '= ' + a + ' + ' + c + ' = ' + r; snap('Back in fib(' + n + '): ' + a + ' + ' + c + ' = ' + r + '. Return it.'); }
        stack.pop(); return r;
      }
      function fact(n) {
        calls++; stack.push({ label: 'fact(' + n + ')', note: '' }); snap('Call fact(' + n + '): push a frame. Calls so far: ' + calls + '.');
        let r;
        if (n <= 1) { r = 1; stack[stack.length - 1].note = '= 1'; snap('fact(' + n + ') is the base case: return 1.'); }
        else { stack[stack.length - 1].note = 'needs fact(' + (n - 1) + ')'; const a = fact(n - 1); r = n * a; stack[stack.length - 1].note = '= ' + n + ' × ' + a + ' = ' + r; snap('Back in fact(' + n + '): fact(' + (n - 1) + ') gave ' + a + '. ' + n + ' × ' + a + ' = ' + r + '. Return it.'); }
        stack.pop(); return r;
      }
      const arr = [3, 1, 4, 1, 5, 9, 2, 6];
      function sum(i) {
        calls++; stack.push({ label: 'sum(a, ' + i + ')', note: '' }); snap('Call sum(a, ' + i + '): the sum of a[' + i + '..]. Calls so far: ' + calls + '.');
        let r;
        if (i >= n) { r = 0; stack[stack.length - 1].note = '= 0 (past the end)'; snap('i = ' + i + ' is past the end: the sum of nothing is 0. Base case.'); }
        else { stack[stack.length - 1].note = 'a[' + i + '] = ' + arr[i] + ' + rest'; const rest = sum(i + 1); r = arr[i] + rest; stack[stack.length - 1].note = '= ' + arr[i] + ' + ' + rest + ' = ' + r; snap('Back in sum(a, ' + i + '): ' + arr[i] + ' + ' + rest + ' = ' + r + '. Return it.'); }
        stack.pop(); return r;
      }
      const result = fn === 'fib' ? fib(n) : fn === 'fact' ? fact(n) : sum(0);
      snap((fn === 'sum' ? 'sum(a, 0)' : fn + '(' + n + ')') + ' = ' + result + '. The stack is empty again. ' + calls + ' calls in all' + (fn === 'fib' && n >= 4 ? ': fib(' + (n - 2) + ') was computed ' + fibCalls(n - 2, n) + ' times over' : '') + '.', { done: true });
    }
    function fibCalls(k, n) { const c = (m) => m < 2 ? 1 : c(m - 1) + c(m - 2); let t = 0; const walk = (m) => { if (m === k) { t++; return; } if (m < 2) return; walk(m - 1); walk(m - 2); }; walk(n); return t; }
    function render(s) {
      const st = steps[s]; const h = Math.max(1, st.stack.length) * 34 + 30; svg.setAttribute('viewBox', '0 0 420 ' + h); svg.innerHTML = '';
      svg.append(mono(8, 16, 'the call stack (top of the stack is at the top)', { 'font-size': 11, fill: 'var(--ink-3)' }));
      st.stack.forEach((f, i) => { const y = h - 30 - i * 34 - 4; const topMost = i === st.stack.length - 1; svg.append(sv('rect', { x: 8, y, width: 404, height: 30, rx: 4, fill: topMost ? 'var(--accent)' : 'var(--paper-2, var(--paper))', stroke: topMost ? 'var(--accent)' : 'var(--rule)' })); svg.append(mono(18, y + 20, f.label, { 'font-size': 13, 'font-weight': 'bold', fill: topMost ? '#fff' : 'var(--ink)' })); svg.append(mono(130, y + 20, f.note, { 'font-size': 12, fill: topMost ? '#fff' : 'var(--ink-2)' })); });
      if (!st.stack.length) svg.append(mono(18, h - 14, st.done ? '(empty)' : '', { 'font-size': 12, fill: 'var(--ink-3)' }));
      log.textContent = st.msg;
    }
    let ctl = null;
    function restart() { let n = parseInt(nIn.value, 10); if (!Number.isFinite(n)) n = 0; n = Math.max(0, Math.min(maxN, n)); nIn.value = String(n); trace(n); if (ctl) ctl.el.remove(); ctl = stepper(steps.length, render, { interval: 900 }); host.replaceChildren(ctl.el); }
    nIn.addEventListener('change', restart);
    mount.append(svg, el('div', { class: 'fig-tools' }, el('label', {}, (fn === 'sum' ? 'n (first n of [3, 1, 4, 1, 5, 9, 2, 6]) ' : 'n ') , nIn)), host, log);
    restart();
  };

  /* ---------- 20. splitting double vowel spelling into letters (math lesson 7) ---------- */
  W.letters = function (mount, b) {
    const CHARS = "abcdeghijkmnopstwyz'";             // the characters the system writes with (c only in ch)
    const TWO = ['aa', 'ii', 'oo', 'ch', 'sh', 'zh'];   // the letters written with two characters
    const LONG = ['aa', 'ii', 'oo', 'e'], SHORT = ['a', 'i', 'o'];
    const kindOf = l => LONG.includes(l) ? 'long vowel' : SHORT.includes(l) ? 'short vowel' : 'consonant';
    const WORDS = ['Boozhoo', 'Miigwech', 'Gikinoo\'amaagoowin', 'Niizho-giizhigad'];
    const input = el('input', { type: 'text', value: b.sample || 'Boozhoo', 'aria-label': 'word to split', size: 20, lang: 'ciw', spellcheck: 'false', autocapitalize: 'off' });
    const mode = el('select', { 'aria-label': 'how to read' },
      el('option', { value: 'long' }, 'longest letter that fits'), el('option', { value: 'short' }, 'shortest letter that fits'));
    const log = el('div', { class: 'fig-status', role: 'status' });
    const svg = sv('svg', { viewBox: '0 0 480 150', role: 'img', 'aria-label': 'A word split into letters' });
    let steps = [];
    function compute() {
      const s = input.value.toLowerCase().replace(/[\u2018\u2019\u02bc]/g, "'").replace(/\s+/g, '').slice(0, 30);
      input.value = s; steps = [];
      const longest = mode.value === 'long';
      const pieces = [];   // { from, to, letter } ; letter null for a hyphen
      steps.push({ s, pieces: [], cur: -1, msg: s ? 'Start before the first character.' : 'Type a word, or choose one below.' });
      let i = 0, stuck = '';
      while (i < s.length) {
        const c = s[i], two = s.slice(i, i + 2);
        if (c === '-') { pieces.push({ from: i, to: i + 1, letter: null }); steps.push({ s, pieces: pieces.slice(), cur: pieces.length - 1, msg: 'A hyphen joins two parts of the word. It is not a letter; skip it.' }); i += 1; continue; }
        if (!CHARS.includes(c) && c !== 'c') { stuck = '\u201c' + c + '\u201d is not a character of the double vowel system, so no split exists.'; break; }
        let letter;
        if (c === 'c') { if (two !== 'ch') { stuck = 'A c must be followed by h: c alone is not a letter, so no split exists.'; break; } letter = 'ch'; }
        else letter = longest && TWO.includes(two) ? two : c;
        pieces.push({ from: i, to: i + letter.length, letter });
        const why = letter === 'ch' ? ' (c is not a letter by itself, so ch is the only choice)' : longest && letter.length === 2 ? ' (two characters: the longer letter fits, so take it)' : !longest && TWO.includes(two) ? ' (the shorter letter, although ' + two + ' would also fit)' : '';
        steps.push({ s, pieces: pieces.slice(), cur: pieces.length - 1, msg: 'Take \u201c' + letter + '\u201d: a ' + kindOf(letter) + why + '.' });
        i += letter.length;
      }
      const L = pieces.filter(p => p.letter);
      const n = k => L.filter(p => kindOf(p.letter) === k).length;
      steps.push({ s, pieces: pieces.slice(), cur: -1, end: true, stuck, at: i,
        msg: stuck ? 'STUCK at character ' + (i + 1) + '. ' + stuck
          : s ? 'Done: ' + L.length + ' letters from ' + s.replace(/-/g, '').length + ' characters: ' + n('long vowel') + ' long vowels, ' + n('short vowel') + ' short vowels, ' + n('consonant') + ' consonants.' : '' });
    }
    function render(k) {
      const st = steps[k], s = st.s, cw = 22, W0 = Math.max(400, s.length * cw + 60), x0 = (W0 - s.length * cw) / 2;
      svg.setAttribute('viewBox', '0 0 ' + W0 + ' 150');
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      // legend
      [['long vowel', 'var(--accent)'], ['short vowel', 'var(--accent-soft)'], ['consonant', 'var(--paper)']].forEach(([t, f], j) => {
        const lx = W0 / 2 - 165 + j * 115;
        svg.append(sv('rect', { x: lx, y: 10, width: 14, height: 14, fill: f, stroke: 'var(--ink-3)' }), txt(lx + 20, 22, t, { 'font-size': 12, fill: 'var(--ink-2)' }));
      });
      // letters taken so far, above the characters
      st.pieces.forEach((p, j) => {
        const x = x0 + p.from * cw, w = (p.to - p.from) * cw - 2, hot = j === st.cur;
        if (!p.letter) { svg.append(txt(x + w / 2, 70, '\u2013', { 'text-anchor': 'middle', fill: 'var(--ink-3)' })); return; }
        const kd = kindOf(p.letter), fill = kd === 'long vowel' ? 'var(--accent)' : kd === 'short vowel' ? 'var(--accent-soft)' : 'var(--paper)';
        svg.append(sv('rect', { x, y: 46, width: w, height: 32, rx: 4, fill, stroke: hot ? 'var(--ink)' : 'var(--ink-3)', 'stroke-width': hot ? 2.5 : 1 }));
        svg.append(mono(x + w / 2, 67, p.letter, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 600, fill: kd === 'long vowel' ? 'var(--accent-ink)' : 'var(--ink)' }));
      });
      // the characters, as typed
      const done = st.pieces.length ? st.pieces[st.pieces.length - 1].to : 0;
      for (let i = 0; i < s.length; i++) {
        const bad = st.stuck && i === st.at;
        svg.append(sv('rect', { x: x0 + i * cw, y: 96, width: cw - 2, height: 26, fill: i < done ? 'var(--paper-2)' : 'var(--paper)', stroke: bad ? 'var(--err)' : 'var(--rule)', 'stroke-width': bad ? 2 : 1 }));
        svg.append(mono(x0 + i * cw + cw / 2 - 1, 114, s[i], { 'text-anchor': 'middle', 'font-size': 14, fill: i < done ? 'var(--ink-3)' : 'var(--ink)' }));
      }
      if (!s.length) svg.append(txt(W0 / 2, 114, '(empty input)', { 'text-anchor': 'middle', 'font-size': 12, fill: 'var(--ink-3)' }));
      svg.append(txt(x0 - 6, 67, 'letters', { 'text-anchor': 'end', 'font-size': 11, fill: 'var(--ink-3)' }), txt(x0 - 6, 114, 'typed', { 'text-anchor': 'end', 'font-size': 11, fill: 'var(--ink-3)' }));
      log.textContent = st.msg;
      log.className = 'fig-status' + (st.end && st.stuck ? ' err' : '');
    }
    compute();
    let ctl = stepper(steps.length, render, { interval: 900 });
    const run = () => { compute(); ctl.stop(); const old = ctl.el; ctl = stepper(steps.length, render, { interval: 900 }); old.replaceWith(ctl.el); };
    input.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
    mode.addEventListener('change', run);
    const presets = el('div', { class: 'fig-tools' }, el('span', {}, 'words from this site:'),
      WORDS.map(w => el('button', { class: 'btn sm quiet', lang: 'ciw', onclick: () => { input.value = w; run(); } }, w)));
    const tools = el('div', { class: 'fig-tools' }, el('span', {}, 'word'), input, el('button', { class: 'btn sm', onclick: run }, 'Load'), el('span', {}, 'read the'), mode);
    mount.append(el('div', { class: 'fig-scroll' }, svg), tools, presets, log, ctl.el);
  };
  /* ---------- k nearest neighbours: drag a fruit, choose k, watch the label and the boundary (SC 109 lessons 2-3) ---------- */
  // Fruit measured as width and height in cm. Most lemons are tall and narrow and most oranges round, but one lemon is round: the
  // point that k = 1 believes and a larger k outvotes. With b.test the figure also shows fruit it was not trained on, and how many of
  // each set k-NN labels right, so overfitting (k = 1: every training fruit right) and underfitting (k = 15: the majority) are visible.
  W.knn = function (mount, b) {
    const TRAIN = [[7.4, 7.2, 'o'], [7.8, 7.6, 'o'], [7.0, 7.1, 'o'], [7.6, 7.3, 'o'], [8.0, 7.8, 'o'], [7.2, 7.0, 'o'], [7.5, 7.7, 'o'], [7.9, 7.3, 'o'],
      [6.0, 8.0, 'l'], [6.2, 8.4, 'l'], [5.8, 7.6, 'l'], [6.5, 8.6, 'l'], [6.1, 7.9, 'l'], [6.4, 8.2, 'l'], [6.9, 7.4, 'l'], [6.3, 7.7, 'l']];
    const TEST = [[7.3, 7.4, 'o'], [7.7, 7.9, 'o'], [7.0, 7.6, 'o'], [6.1, 8.3, 'l'], [6.6, 8.1, 'l'], [5.9, 7.8, 'l']];
    const NAME = { o: 'orange', l: 'lemon' }, FILL = { o: '#e67e22', l: '#e3c614' };
    const KS = [1, 3, 5, 7, 9];
    let k = KS.includes(b.k) ? b.k : 1, q = [6.8, 7.6], showTest = !!b.test;
    const X0 = 5.5, X1 = 8.5, Y0 = 6.8, Y1 = 8.9;
    const W0 = 560, H0 = 380, L = 46, R = 14, T = 12, B = 40;
    const X = (v) => L + (v - X0) / (X1 - X0) * (W0 - L - R), Y = (v) => T + (1 - (v - Y0) / (Y1 - Y0)) * (H0 - T - B);
    const dist = (a, p) => Math.hypot(a[0] - p[0], a[1] - p[1]);
    // the k nearest training fruit; equal distances keep the order of the list, as a stable sort does in Python
    const nearest = (p, kk, skip) => TRAIN.map((t, i) => ({ t, i, d: dist(t, p) })).filter((x) => x.i !== skip).sort((a, c) => a.d - c.d).slice(0, kk);
    const vote = (ns) => { const o = ns.filter((x) => x.t[2] === 'o').length; return { o, l: ns.length - o, label: o > ns.length / 2 ? 'o' : 'l' }; };
    const svg = sv('svg', { viewBox: '0 0 ' + W0 + ' ' + H0, role: 'img', 'aria-label': 'Fruit plotted by width and height, with a new fruit to label' });
    const status = el('p', { class: 'fig-status', role: 'status' });
    const score = el('p', { class: 'fig-status' });
    const mark = (p, kind, attrs) => kind === 'o'
      ? sv('circle', Object.assign({ cx: X(p[0]), cy: Y(p[1]), r: 7, fill: FILL.o, stroke: 'var(--ink)', 'stroke-width': 1.2 }, attrs || {}))
      : sv('polygon', Object.assign({ points: [[0, -9], [8, 6], [-8, 6]].map(([dx, dy]) => (X(p[0]) + dx) + ',' + (Y(p[1]) + dy)).join(' '), fill: FILL.l, stroke: 'var(--ink)', 'stroke-width': 1.2 }, attrs || {}));
    function render() {
      svg.replaceChildren();
      // the regions: every small square coloured by the label k-NN would give a fruit there
      const cell = 0.1;
      for (let x = X0; x < X1 - 1e-9; x += cell) for (let y = Y0; y < Y1 - 1e-9; y += cell) {
        const lab = vote(nearest([x + cell / 2, y + cell / 2], k)).label;
        svg.append(sv('rect', { x: X(x), y: Y(y + cell), width: X(x + cell) - X(x), height: Y(y) - Y(y + cell), fill: FILL[lab], 'fill-opacity': 0.16, 'shape-rendering': 'crispEdges' }));
      }
      svg.append(sv('line', { x1: L, y1: Y(Y0), x2: W0 - R, y2: Y(Y0), stroke: 'var(--ink-2)' }), sv('line', { x1: L, y1: T, x2: L, y2: Y(Y0), stroke: 'var(--ink-2)' }));
      for (let v = 6; v <= 8.5; v += 0.5) svg.append(txt(X(v), H0 - B + 16, v.toFixed(1), { 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--ink-3)' }));
      for (let v = 7; v <= 8.9; v += 0.5) svg.append(txt(L - 6, Y(v) + 4, v.toFixed(1), { 'text-anchor': 'end', 'font-size': 11, fill: 'var(--ink-3)' }));
      svg.append(txt(W0 - R, H0 - 6, 'width (cm)', { 'text-anchor': 'end', 'font-size': 11, fill: 'var(--ink-2)' }), txt(L + 6, T + 10, 'height (cm)', { 'font-size': 11, fill: 'var(--ink-2)' }));
      const ns = nearest(q, k), v = vote(ns), far = ns[ns.length - 1].d;
      svg.append(sv('circle', { cx: X(q[0]), cy: Y(q[1]), r: X(q[0] + far) - X(q[0]), fill: 'none', stroke: 'var(--ink-3)', 'stroke-dasharray': '4 4' }));
      for (const n of ns) svg.append(sv('line', { x1: X(q[0]), y1: Y(q[1]), x2: X(n.t[0]), y2: Y(n.t[1]), stroke: 'var(--ink-2)', 'stroke-width': 1.2 }));
      for (const t of TRAIN) svg.append(mark(t, t[2]));
      if (showTest) for (const t of TEST) svg.append(mark(t, t[2], { fill: 'var(--paper)', stroke: t[2] === 'o' ? FILL.o : '#a08a00', 'stroke-width': 2.5 }));
      const g = sv('g', { class: 'knn-new', tabindex: '0', role: 'slider', 'aria-label': 'The new fruit: arrow keys move it', 'aria-valuetext': 'width ' + q[0].toFixed(1) + ' cm, height ' + q[1].toFixed(1) + ' cm' },
        sv('circle', { cx: X(q[0]), cy: Y(q[1]), r: 11, fill: 'var(--paper)', stroke: 'var(--ink)', 'stroke-width': 2.5 }),
        txt(X(q[0]), Y(q[1]) + 5, '?', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700 }));
      svg.append(g);
      status.textContent = 'New fruit ' + q[0].toFixed(1) + ' cm wide, ' + q[1].toFixed(1) + ' cm tall. The ' + (k === 1 ? 'nearest fruit is' : k + ' nearest are ' + v.o + ' orange and ' + v.l + ' lemon') + (k === 1 ? ' a' + (v.label === 'o' ? 'n orange' : ' lemon') : '') + ', so k-NN says: ' + NAME[v.label] + '.';
      if (showTest) {
        // a training fruit is labelled by the training set, itself included: that is what "accuracy on the training set" means
        const trainRight = TRAIN.filter((t) => vote(nearest(t, k)).label === t[2]).length, testRight = TEST.filter((t) => vote(nearest(t, k)).label === t[2]).length;
        score.replaceChildren('k = ' + k + ': training fruit ', el('b', {}, trainRight + ' of ' + TRAIN.length), ' right; test fruit (never seen) ', el('b', {}, testRight + ' of ' + TEST.length), ' right.');
      }
    }
    // dragging: pointer events on the whole picture, so a touch anywhere moves the new fruit there
    const toData = (e) => { const r = svg.getBoundingClientRect(), sx = W0 / r.width, sy = H0 / r.height; const px = (e.clientX - r.left) * sx, py = (e.clientY - r.top) * sy;
      return [Math.max(X0, Math.min(X1, X0 + (px - L) / (W0 - L - R) * (X1 - X0))), Math.max(Y0, Math.min(Y1, Y0 + (1 - (py - T) / (H0 - T - B)) * (Y1 - Y0)))]; };
    let dragging = false;
    svg.addEventListener('pointerdown', (e) => { if (e.button) return; dragging = true; try { svg.setPointerCapture(e.pointerId); } catch (x) { /* old browser */ } q = toData(e); render(); e.preventDefault(); });
    svg.addEventListener('pointermove', (e) => { if (!dragging) return; q = toData(e); render(); });
    const end = () => { dragging = false; const f = svg.querySelector('.knn-new'); if (f && document.activeElement === document.body) f.focus({ preventScroll: true }); };
    svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
    svg.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 0.5 : 0.1, mv = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
      if (!mv) return; e.preventDefault();
      q = [Math.max(X0, Math.min(X1, Math.round((q[0] + mv[0]) * 10) / 10)), Math.max(Y0, Math.min(Y1, Math.round((q[1] + mv[1]) * 10) / 10))];
      render(); const f = svg.querySelector('.knn-new'); if (f) f.focus();
    });
    svg.style.touchAction = 'none';
    const pick = el('select', { 'aria-label': 'k, the number of neighbours that vote', onchange: (e) => { k = +e.target.value; render(); } }, KS.map((n) => el('option', { value: String(n), selected: n === k ? '' : null }, String(n))));
    const tools = el('div', { class: 'fig-tools' }, el('label', {}, 'k = ', pick),
      b.test ? el('label', {}, el('input', { type: 'checkbox', checked: showTest ? '' : null, onchange: (e) => { showTest = e.target.checked; score.hidden = !showTest; render(); } }), ' show the test fruit (hollow)') : null,
      el('span', { class: 'fig-note' }, 'drag the ? (or focus it and use the arrow keys)'));
    const key = el('p', { class: 'fig-note knn-key' }, el('span', { class: 'knn-sw knn-o', 'aria-hidden': 'true' }), ' orange (circle)  ', el('span', { class: 'knn-sw knn-l', 'aria-hidden': 'true' }), ' lemon (triangle)  · shading: the label a new fruit there would get');
    render();
    mount.append(svg, tools, status, ...(b.test ? [score] : []), key);
  };
  /* ---------- the perceptron: every mistake moves the line (SC 109 lesson 5) ---------- */
  // The sixteen fruit of the knn figure, lemons +1 and oranges -1, trained with Rosenblatt's rule at a rate of 0.1, one step per
  // fruit looked at. The line w0·width + w1·height + b = 0 is drawn after every step; a mistake moves it.
  W.perceptron = function (mount) {
    const DATA = [[7.4, 7.2, -1], [6.0, 8.0, 1], [7.8, 7.6, -1], [6.2, 8.4, 1], [7.0, 7.1, -1], [5.8, 7.6, 1], [7.6, 7.3, -1], [6.5, 8.6, 1],
      [8.0, 7.8, -1], [6.1, 7.9, 1], [7.2, 7.0, -1], [6.4, 8.2, 1], [7.5, 7.7, -1], [6.9, 7.4, 1], [7.9, 7.3, -1], [6.3, 7.7, 1]];
    const RATE = 0.1, MAX_EPOCHS = 60;
    // the whole run, worked out once: one state per fruit looked at
    const steps = [{ w: [0, 0], b: 0, at: -1, epoch: 0, mistake: false, errs: 0 }];
    let w = [0, 0], bias = 0, done = false;
    for (let ep = 1; ep <= MAX_EPOCHS && !done; ep++) {
      let errs = 0;
      DATA.forEach((d, i) => {
        const s = w[0] * d[0] + w[1] * d[1] + bias, guess = s > 0 ? 1 : -1, wrong = guess !== d[2];
        if (wrong) { w = [w[0] + RATE * d[2] * d[0], w[1] + RATE * d[2] * d[1]]; bias += RATE * d[2]; errs++; }
        steps.push({ w: w.slice(), b: bias, at: i, epoch: ep, mistake: wrong, errs });
      });
      if (!errs) done = true;
    }
    const X0 = 5.5, X1 = 8.5, Y0 = 6.8, Y1 = 8.9, W0 = 560, H0 = 360, L = 46, R = 14, T = 12, B = 40;
    const X = (v) => L + (v - X0) / (X1 - X0) * (W0 - L - R), Y = (v) => T + (1 - (v - Y0) / (Y1 - Y0)) * (H0 - T - B);
    const svg = sv('svg', { viewBox: '0 0 ' + W0 + ' ' + H0, role: 'img', 'aria-label': 'Sixteen fruit and the perceptron\'s dividing line' });
    const status = el('p', { class: 'fig-status', role: 'status' });
    const r1 = (v) => (Math.round(v * 100) / 100).toFixed(2);
    // the part of the line w0·x + w1·y + b = 0 inside the plot
    function segment(st) {
      const [a, c] = st.w, b = st.b, pts = [];
      if (Math.abs(c) > 1e-9) for (const x of [X0, X1]) { const y = -(a * x + b) / c; if (y >= Y0 - 1e-9 && y <= Y1 + 1e-9) pts.push([x, y]); }
      if (Math.abs(a) > 1e-9) for (const y of [Y0, Y1]) { const x = -(c * y + b) / a; if (x > X0 && x < X1) pts.push([x, y]); }
      return pts.length >= 2 ? pts.slice(0, 2) : null;
    }
    function render(k) {
      const st = steps[k];
      svg.replaceChildren();
      svg.append(sv('line', { x1: L, y1: Y(Y0), x2: W0 - R, y2: Y(Y0), stroke: 'var(--ink-2)' }), sv('line', { x1: L, y1: T, x2: L, y2: Y(Y0), stroke: 'var(--ink-2)' }));
      for (let v = 6; v <= 8.5; v += 0.5) svg.append(txt(X(v), H0 - B + 16, v.toFixed(1), { 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--ink-3)' }));
      for (let v = 7; v <= 8.9; v += 0.5) svg.append(txt(L - 6, Y(v) + 4, v.toFixed(1), { 'text-anchor': 'end', 'font-size': 11, fill: 'var(--ink-3)' }));
      svg.append(txt(W0 - R, H0 - 6, 'width (cm)', { 'text-anchor': 'end', 'font-size': 11, fill: 'var(--ink-2)' }), txt(L + 6, T + 10, 'height (cm)', { 'font-size': 11, fill: 'var(--ink-2)' }));
      const seg = segment(st);
      if (seg) svg.append(sv('line', { x1: X(seg[0][0]), y1: Y(seg[0][1]), x2: X(seg[1][0]), y2: Y(seg[1][1]), stroke: 'var(--accent)', 'stroke-width': 3 }));
      DATA.forEach((d, i) => {
        const hot = i === st.at, guess = st.w[0] * d[0] + st.w[1] * d[1] + st.b > 0 ? 1 : -1, wrongNow = guess !== d[2];
        const attrs = { stroke: wrongNow ? 'var(--err)' : 'var(--ink)', 'stroke-width': wrongNow ? 2.5 : 1.2 };
        svg.append(d[2] < 0 ? sv('circle', Object.assign({ cx: X(d[0]), cy: Y(d[1]), r: 7, fill: '#e67e22' }, attrs))
          : sv('polygon', Object.assign({ points: [[0, -9], [8, 6], [-8, 6]].map(([dx, dy]) => (X(d[0]) + dx) + ',' + (Y(d[1]) + dy)).join(' '), fill: '#e3c614' }, attrs)));
        if (hot) svg.append(sv('circle', { cx: X(d[0]), cy: Y(d[1]), r: 15, fill: 'none', stroke: st.mistake ? 'var(--err)' : 'var(--ok)', 'stroke-width': 2.5 }));
      });
      const wrongAll = DATA.filter((d) => (st.w[0] * d[0] + st.w[1] * d[1] + st.b > 0 ? 1 : -1) !== d[2]).length;
      const head = k === 0 ? 'Before training: all weights 0, so every score is 0 and every fruit is called an orange.'
        : 'Pass ' + st.epoch + ', fruit ' + (st.at + 1) + ' (' + (DATA[st.at][2] > 0 ? 'lemon' : 'orange') + '): ' + (st.mistake ? 'a mistake, so the weights move.' : 'right, so nothing changes.');
      status.textContent = head + ' Weights ' + r1(st.w[0]) + ' and ' + r1(st.w[1]) + ', bias ' + r1(st.b) + '. Fruit on the wrong side now: ' + wrongAll + ' of 16.' + (seg ? '' : ' The dividing line is outside this part of the graph for now.') + (k === steps.length - 1 ? ' A whole pass with no mistake: training stops after ' + st.epoch + ' passes.' : '');
    }
    const ctl = stepper(steps.length, render, { interval: 120 });
    const mistakesOnly = el('button', { class: 'btn sm', onclick: () => { let k = ctl.index + 1; while (k < steps.length - 1 && !steps[k].mistake) k++; ctl.stop(); ctl.set(k); } }, 'Next mistake');
    const endBtn = el('button', { class: 'btn sm quiet', onclick: () => { ctl.stop(); ctl.set(steps.length - 1); } }, 'To the end');
    ctl.el.insertBefore(mistakesOnly, ctl.el.lastChild); ctl.el.insertBefore(endBtn, ctl.el.lastChild);
    mount.append(svg, ctl.el, status);
  };

  /* ---------- walking downhill: gradient descent on one weight, with a choice of learning rate (SC 109 lesson 6) ---------- */
  // The error of the line y = w·x on the points (1, 2), (2, 4), (3, 6) is (14/3)(w − 2)², so its slope is (28/3)(w − 2). Each step
  // moves w by −rate × slope. Rates below 3/28 ≈ 0.107 walk straight down; up to 3/14 ≈ 0.214 they zigzag in; above it they fly off.
  W.descent = function (mount, b) {
    const RATES = [0.01, 0.05, 0.1, 0.2, 0.25];
    let rate = RATES.includes(b.rate) ? b.rate : 0.05;
    const err = (w) => 14 / 3 * (w - 2) * (w - 2), slope = (w) => 28 / 3 * (w - 2);
    const N = 12, W0 = 560, H0 = 300, L = 46, R = 14, T = 14, B = 34, WL = -1, WR = 5, EMAX = 45;
    const X = (w) => L + (w - WL) / (WR - WL) * (W0 - L - R), Y = (e) => T + (1 - Math.min(e, EMAX) / EMAX) * (H0 - T - B);
    const svg = sv('svg', { viewBox: '0 0 ' + W0 + ' ' + H0, role: 'img', 'aria-label': 'The error as a valley, and the steps of gradient descent' });
    const status = el('p', { class: 'fig-status', role: 'status' });
    let path = [];
    const compute = () => { path = [0]; for (let i = 0; i < N; i++) path.push(path[i] - rate * slope(path[i])); };
    function render(k) {
      svg.replaceChildren();
      svg.append(sv('line', { x1: L, y1: Y(0), x2: W0 - R, y2: Y(0), stroke: 'var(--ink-2)' }), sv('line', { x1: L, y1: T, x2: L, y2: Y(0), stroke: 'var(--ink-2)' }));
      for (let w = WL; w <= WR; w++) svg.append(txt(X(w), H0 - B + 16, String(w), { 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--ink-3)' }));
      for (let e = 0; e <= EMAX; e += 15) svg.append(txt(L - 6, Y(e) + 4, String(e), { 'text-anchor': 'end', 'font-size': 11, fill: 'var(--ink-3)' }));
      svg.append(txt(W0 - R, H0 - 4, 'w (the weight)', { 'text-anchor': 'end', 'font-size': 11, fill: 'var(--ink-2)' }), txt(L + 6, T + 10, 'error', { 'font-size': 11, fill: 'var(--ink-2)' }));
      const pts = []; for (let w = WL; w <= WR + 1e-9; w += 0.05) pts.push(X(w) + ',' + Y(err(w)));
      svg.append(sv('polyline', { points: pts.join(' '), fill: 'none', stroke: 'var(--ink-3)', 'stroke-width': 2 }));
      const inView = (w) => w >= WL && w <= WR && err(w) <= EMAX;
      for (let i = 0; i < k; i++) if (inView(path[i]) && inView(path[i + 1])) svg.append(sv('line', { x1: X(path[i]), y1: Y(err(path[i])), x2: X(path[i + 1]), y2: Y(err(path[i + 1])), stroke: 'var(--accent)', 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }));
      for (let i = 0; i <= k; i++) if (inView(path[i])) svg.append(sv('circle', { cx: X(path[i]), cy: Y(err(path[i])), r: i === k ? 8 : 4, fill: i === k ? 'var(--accent)' : 'var(--paper)', stroke: 'var(--accent)', 'stroke-width': 2 }));
      const w = path[k], off = !inView(w);
      status.textContent = 'Rate ' + rate + ', step ' + k + ': w = ' + (Math.abs(w) < 1e6 ? (Math.round(w * 1000) / 1000) : w.toExponential(2)) + ', error = ' + (err(w) < 1e6 ? (Math.round(err(w) * 1000) / 1000) : err(w).toExponential(2)) + '. ' +
        (k === 0 ? 'Start at w = 0. The best line is w = 2, at the bottom of the valley.' : off ? 'The step was so big it jumped right over the valley and landed higher up the other side: off the picture.' : Math.abs(w - 2) < 0.005 ? 'At the bottom.' : (path[k] - 2) * (path[k - 1] - 2) < 0 ? 'It stepped over the bottom to the other side.' : 'Still walking down.');
    }
    const box = el('div', {});
    let ctl = null;
    const reset = () => { compute(); if (ctl) ctl.stop(); const fresh = stepper(N + 1, render, { interval: 700 }); if (ctl) ctl.el.replaceWith(fresh.el); else box.append(fresh.el); ctl = fresh; };
    const pick = el('select', { 'aria-label': 'learning rate', onchange: (e) => { rate = +e.target.value; reset(); } }, RATES.map((r) => el('option', { value: String(r), selected: r === rate ? '' : null }, String(r))));
    mount.append(svg, el('div', { class: 'fig-tools' }, el('label', {}, 'learning rate ', pick)), box, status);
    reset();
  };

  /* ---------- building a decision tree on Quinlan's Saturday mornings (SC 109 lesson 7) ---------- */
  // Table 1 of J. R. Quinlan, "Induction of Decision Trees", Machine Learning 1 (1986): fourteen mornings, four attributes, classes P and N.
  // Any group that is not pure can be split by any attribute not used above it; each choice shows its information gain.
  W.dtree = function (mount) {
    const ATTRS = ['outlook', 'temperature', 'humidity', 'windy'];
    const ROWS = [['sunny', 'hot', 'high', 'false', 'N'], ['sunny', 'hot', 'high', 'true', 'N'], ['overcast', 'hot', 'high', 'false', 'P'], ['rain', 'mild', 'high', 'false', 'P'],
      ['rain', 'cool', 'normal', 'false', 'P'], ['rain', 'cool', 'normal', 'true', 'N'], ['overcast', 'cool', 'normal', 'true', 'P'], ['sunny', 'mild', 'high', 'false', 'N'],
      ['sunny', 'cool', 'normal', 'false', 'P'], ['rain', 'mild', 'normal', 'false', 'P'], ['sunny', 'mild', 'normal', 'true', 'P'], ['overcast', 'mild', 'high', 'true', 'P'],
      ['overcast', 'hot', 'normal', 'false', 'P'], ['rain', 'mild', 'high', 'true', 'N']];
    const entropy = (rows) => { let h = 0; for (const c of ['P', 'N']) { const p = rows.filter((r) => r[4] === c).length / rows.length; if (p > 0) h -= p * Math.log2(p); } return h; };
    const groups = (rows, a) => { const g = new Map(); for (const r of rows) { if (!g.has(r[a])) g.set(r[a], []); g.get(r[a]).push(r); } return g; };
    const gain = (rows, a) => { let after = 0; for (const g of groups(rows, a).values()) after += g.length / rows.length * entropy(g); return entropy(rows) - after; };
    const root = { rows: ROWS, used: [], split: null, kids: null };
    const out = el('div', { class: 'dt-tree' });
    const status = el('p', { class: 'fig-status', role: 'status' });
    const f3 = (v) => (Math.round(v * 1000) / 1000).toFixed(3);
    const countText = (rows) => { const p = rows.filter((r) => r[4] === 'P').length; return p + ' P, ' + (rows.length - p) + ' N'; };
    function nodeEl(node, label) {
      const pure = entropy(node.rows) === 0, li = el('li', { class: 'dt-node' + (pure ? ' dt-pure' : '') });
      li.append(el('div', { class: 'dt-head' }, label ? el('b', {}, label + ': ') : null, node.rows.length + ' mornings, ' + countText(node.rows) + ' · entropy ' + f3(entropy(node.rows)) + ' bits',
        pure ? el('span', { class: 'dt-leaf' }, ' → always ' + node.rows[0][4]) : null));
      if (node.split != null) {
        li.append(el('div', { class: 'dt-q' }, 'Ask: ', el('b', {}, ATTRS[node.split] + '?'), ' (gain ' + f3(gain(node.rows, node.split)) + ' bits) ',
          el('button', { class: 'btn sm quiet', onclick: () => { node.split = null; node.kids = null; draw('Undone.'); } }, 'undo')));
        li.append(el('ul', {}, [...node.kids.entries()].map(([v, k]) => nodeEl(k, v))));
      } else if (!pure) {
        const free = ATTRS.map((a, i) => i).filter((i) => !node.used.includes(i));
        li.append(el('div', { class: 'dt-q' }, 'Split by: ', free.map((i) => el('button', { class: 'btn sm', onclick: () => {
          node.split = i; node.kids = new Map([...groups(node.rows, i).entries()].map(([v, rows]) => [v, { rows, used: node.used.concat(i), split: null, kids: null }]));
          draw('Split ' + node.rows.length + ' mornings by ' + ATTRS[i] + ': information gain ' + f3(gain(node.rows, i)) + ' bits.');
        } }, ATTRS[i] + ' (' + f3(gain(node.rows, i)) + ')'))));
      }
      return li;
    }
    const leaves = (n) => (n.split == null ? [n] : [...n.kids.values()].flatMap(leaves));
    function draw(msg) {
      out.replaceChildren(el('ul', {}, nodeEl(root, '')));
      const ls = leaves(root), impure = ls.filter((n) => entropy(n.rows) > 0).length;
      status.textContent = (msg ? msg + ' ' : '') + (impure ? impure + (impure === 1 ? ' group is' : ' groups are') + ' still mixed.' : 'Every group is pure: the tree has ' + ls.length + ' leaves and gets all 14 mornings right.');
    }
    draw('Each button shows how much a question would reduce the uncertainty (its information gain, in bits).');
    mount.append(out, status);
  };
})();
