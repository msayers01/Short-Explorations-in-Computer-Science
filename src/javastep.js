/* The Java step-through, the page's half. The program is run once in the Java sandbox (JAVA.trace in src/java.js, JAVARUN.trace in
   src/runner.js), which records before each statement the line, the call stack with each frame's variables by name, the static fields and
   the objects reachable from them, each with a number that stays the same from step to step. Here the record is drawn, one step at a time:

   JAVASTEP.clean(trace) → the same record with every field checked (it comes from the sandbox, so it is untrusted: shown only as text)
   JAVASTEP.render(mount, trace, i)    JAVASTEP.describe(trace, i) → 'step 3 of 40: about to run line 7' */
(function () {
  'use strict';
  const el = (...a) => window.__h.el(...a);   // app.js's el(): text nodes only, null and false skipped
  const str = (v, n) => String(v == null ? '' : v).slice(0, n || 400);
  const val = (v) => (typeof v === 'number' && v > 0 && v === Math.floor(v) ? v : str(v, 200));   // a number is a reference to object #v; anything else is the value as Java prints it
  const arr = (a, f, n) => (Array.isArray(a) ? a.slice(0, n || 200).map(f) : []);

  function clean(tr) {
    if (!tr || typeof tr !== 'object') return null;
    const vars = (v) => arr(v, (x) => (Array.isArray(x) ? [str(x[0], 80), str(x[1], 80), val(x[2]), x[3] ? 1 : 0] : ['?', '', '', 0]), 400);
    const heapObj = (o) => {
      o = o && typeof o === 'object' ? o : {};
      return { id: Number(o.id) || 0, k: ['obj', 'array', 'list', 'set', 'map', 'sb'].includes(o.k) ? o.k : 'obj', cls: str(o.cls, 80), len: Number(o.len) || 0, text: str(o.text, 200),
        cells: arr(o.cells, val), entries: arr(o.entries, (e) => (Array.isArray(e) ? [val(e[0]), val(e[1])] : ['', ''])), fields: arr(o.fields, (f) => (Array.isArray(f) ? [str(f[0], 80), val(f[1])] : ['', ''])) };
    };
    // the worker shares one record between the steps where an object did not change; keep that sharing (it is what keeps a long trace small)
    const seenHeap = new Map(), seenFrame = new Map();
    const once = (map, o, f) => { if (o && typeof o === 'object') { if (!map.has(o)) map.set(o, f(o)); return map.get(o); } return f(o); };
    const steps = arr(tr.steps, (s) => {
      s = s && typeof s === 'object' ? s : {};
      return { line: Number(s.line) || 0, outLen: Number(s.outLen) || 0, done: !!s.done, error: !!s.error, more: !!s.more, skipped: Number(s.skipped) || 0,
        frames: arr(s.frames, (f) => once(seenFrame, f, (f) => { f = f && typeof f === 'object' ? f : {}; return { cls: str(f.cls, 80), name: str(f.name, 80), line: Number(f.line) || 0, vars: vars(f.vars) }; }), 100),
        statics: vars(s.statics), heap: arr(s.heap, (o) => once(seenHeap, o, heapObj), 100) };
    }, 5000);
    return { steps, output: str(tr.output, 2e6), error: tr.error ? str(tr.error, 20000) : null, errorLine: Number(tr.errorLine) || 0, truncated: !!tr.truncated, finished: !!tr.finished };
  }

  const frameName = (f) => (f.name === '<init>' ? 'new ' + f.cls + '(…)' : f.name === '<clinit>' ? f.cls + ' (static setup)' : f.cls + '.' + f.name + '()');
  const shortCls = (o) => (o.k === 'array' ? o.cls.replace(/\[\]$/, '[' + o.len + ']') : o.cls);

  function render(mount, tr, i) {
    mount.textContent = '';
    const st = tr.steps[i];
    if (!st) { mount.append(el('p', { class: 'mem-empty' }, 'Nothing to show.')); return; }
    const prev = i > 0 ? tr.steps[i - 1] : null;
    const heap = new Map(st.heap.map(o => [o.id, o])), prevHeap = new Map(prev ? prev.heap.map(o => [o.id, o]) : []);
    const ref = (v) => (typeof v === 'number' ? el('span', { class: 'mem-arrow', 'data-target': String(v), title: 'a reference to object #' + v }, '→ #' + v + (heap.has(v) ? ' ' + shortCls(heap.get(v)) : '')) : el('code', {}, v));
    const varTable = (vars, before) => {
      const old = new Map((before || []).map(v => [v[0], v[2]]));
      return el('div', { class: 'mem-scroll' }, el('table', { class: 'mem-vars' },
        el('thead', {}, el('tr', {}, el('th', {}, 'name and type'), el('th', {}, 'value'))),
        el('tbody', {}, vars.map(v => el('tr', { class: before && !old.has(v[0]) ? 'fresh' : before && old.get(v[0]) !== v[2] ? 'changed' : null },
          el('td', {}, el('code', {}, v[0]), v[3] ? el('span', { class: 'mem-tag' }, 'parameter') : null, el('span', { class: 'jstep-type' }, v[1])),
          el('td', { class: 'mem-val' }, ref(v[2])))))));
    };
    const stack = el('div', { class: 'jstep-col' }, el('div', { class: 'jstep-title' }, 'Call stack'));
    if (st.statics.length) stack.append(el('div', { class: 'mem-frame global' }, el('div', { class: 'mem-frame-name' }, 'static fields'), varTable(st.statics, prev ? prev.statics : null)));
    if (!st.frames.length) stack.append(el('p', { class: 'mem-empty' }, st.done ? 'The program has finished: main has returned, so no method is running.' : 'No method is running.'));
    st.frames.forEach((f, fi) => {
      const active = fi === st.frames.length - 1 && !st.done;
      const pf = prev && prev.frames[fi] && prev.frames[fi].cls === f.cls && prev.frames[fi].name === f.name ? prev.frames[fi] : null;
      if (fi === 1 && st.skipped) stack.append(el('p', { class: 'mem-empty jstep-skipped' }, '… ' + st.skipped + ' more calls, not shown'));
      stack.append(el('div', { class: 'mem-frame' + (active ? ' active' : '') + (active && st.error ? ' jstep-threw' : '') },
        el('div', { class: 'mem-frame-name' }, frameName(f), el('span', { class: 'mem-note' }, 'line ' + f.line), active ? el('span', { class: 'mem-running' }, st.error ? 'threw an exception' : 'running') : null),
        f.vars.length ? varTable(f.vars, pf ? pf.vars : (prev ? [] : null)) : el('div', { class: 'mem-none' }, 'no variables yet')));
    });
    const objs = el('div', { class: 'jstep-col' }, el('div', { class: 'jstep-title' }, 'Objects'));
    const list = st.heap.slice().sort((a, b) => a.id - b.id);
    if (!list.length) objs.append(el('p', { class: 'mem-empty' }, 'No objects yet. Arrays, string builders, lists, maps and objects made with new appear here.'));
    const cell = (v, idx, changed) => el('span', { class: 'mem-cell' + (changed ? ' changed' : '') }, idx != null ? el('span', { class: 'mem-idx' }, idx) : null, typeof v === 'number' ? el('span', { class: 'mem-arrow', 'data-target': String(v) }, '#' + v) : el('code', {}, v));
    for (const o of list) {
      const p = prevHeap.get(o.id), body = el('div', { class: 'jstep-body' });
      const more = (shown) => (o.len > shown ? el('span', { class: 'mem-more' }, '… ' + (o.len - shown) + ' more') : null);
      if (o.k === 'array' || o.k === 'list' || o.k === 'set') {
        body.append(o.cells.length ? el('div', { class: 'mem-cells' }, o.cells.map((c, j) => cell(c, o.k === 'set' ? null : j, p && p.cells[j] !== c)), more(o.cells.length)) : el('span', { class: 'mem-none' }, 'empty'));
      } else if (o.k === 'map') {
        const old = new Map(p ? p.entries.map(e => [String(e[0]), e[1]]) : []);
        body.append(o.entries.length ? el('table', { class: 'mem-vars' }, el('tbody', {}, o.entries.map(e => el('tr', { class: p && old.get(String(e[0])) !== e[1] ? 'changed' : null }, el('td', {}, ref(e[0])), el('td', { class: 'jstep-maps' }, '↦'), el('td', { class: 'mem-val' }, ref(e[1])))))) : el('span', { class: 'mem-none' }, 'empty'), more(o.entries.length));
      } else if (o.k === 'sb') body.append(el('code', { class: p && p.text !== o.text ? 'jstep-changed' : null }, o.text));
      else body.append(o.fields.length ? el('table', { class: 'mem-vars' }, el('tbody', {}, o.fields.map((f, j) => el('tr', { class: p && p.fields[j] && p.fields[j][1] !== f[1] ? 'changed' : null }, el('td', {}, el('code', {}, f[0])), el('td', { class: 'mem-val' }, ref(f[1])))))) : el('span', { class: 'mem-none' }, 'no fields'));
      objs.append(el('div', { class: 'jstep-obj' + (p ? '' : i > 0 ? ' fresh' : ''), 'data-mem': String(o.id) },
        el('div', { class: 'mem-frame-name' }, '#' + o.id + ' ' + shortCls(o), o.k === 'list' || o.k === 'set' || o.k === 'map' ? el('span', { class: 'mem-note' }, 'size ' + o.len) : null), body));
    }
    if (st.more) objs.append(el('p', { class: 'mem-empty' }, 'More objects are reachable than are shown here.'));
    const box = el('div', { class: 'jstep' }, stack, objs);
    // pointing at a reference lights up the object it refers to
    box.addEventListener('mouseover', (e) => {
      box.querySelectorAll('.mem-hit').forEach(x => x.classList.remove('mem-hit'));
      const a = e.target.closest && e.target.closest('[data-target]');
      if (a) { const t = box.querySelector('[data-mem="' + Number(a.getAttribute('data-target')) + '"]'); if (t) t.classList.add('mem-hit'); }
    });
    box.addEventListener('mouseleave', () => box.querySelectorAll('.mem-hit').forEach(x => x.classList.remove('mem-hit')));
    mount.append(box);
  }

  function describe(tr, i) {
    const st = tr.steps[i]; if (!st) return '';
    const n = tr.steps.length, top = st.frames[st.frames.length - 1];
    const head = 'step ' + (i + 1) + ' of ' + n + ': ';
    if (st.done) return head + 'the program has finished';
    if (st.error) return head + 'line ' + st.line + ' threw an exception';
    return head + 'about to run line ' + st.line + (st.frames.length > 1 && top ? ' in ' + frameName(top) : '');
  }

  window.JAVASTEP = { clean, render, describe };
})();
