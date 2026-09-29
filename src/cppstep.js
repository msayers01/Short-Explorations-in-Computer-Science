/* cppstep.js — step through a C++ program and look at its memory.
 *
 * CPPSTEP.trace(code, stdin, opts) runs the program under JSCPP's debugger and records a snapshot
 * each time execution reaches a new line: the call stack (one frame per active function, plus the
 * global variables), every variable's type, a made-up but consistent address, and its value.
 * Arrays are shown cell by cell and pointers show the address they hold and what lives there.
 * The result is plain data (testable in node); CPPSTEP.render(mount, trace, i) draws step i.
 *
 * Addresses are invented, but laid out the way a compiler would: each variable is aligned to its
 * size, frames sit one after another from 1000 (globals from 100), and a returning function's space
 * is reused by the next call. So they are stable while a variable lives, and they match the address
 * tables in the C++ lessons (an int at 1000 followed by a pointer at 1008).
 */
(function () {
  const J = () => (typeof JSCPP !== 'undefined' ? JSCPP : (typeof require === 'function' ? require('JSCPP/lib/commonjs.js') : null));
  const SIZE = { char: 1, 'signed char': 1, 'unsigned char': 1, bool: 1, short: 2, 'unsigned short': 2, int: 4, 'unsigned int': 4, unsigned: 4, long: 8, 'unsigned long': 8, 'long long': 8, 'unsigned long long': 8, float: 4, double: 8, 'long double': 8 };
  const HIDDEN = new Set(['cin', 'cout', 'cerr', 'endl']);
  const MAX_CELLS = 64;

  function sizeOf(t) {
    if (!t) return 4;
    if (t.type === 'primitive') return SIZE[t.name] || 4;
    if (t.type === 'pointer' && t.ptrType === 'array') return (t.size || 0) * sizeOf(t.eleType);
    return 8;
  }
  function alignOf(t) {
    if (t && t.type === 'pointer' && t.ptrType === 'array') return alignOf(t.eleType);
    return Math.min(8, Math.max(1, sizeOf(t)));
  }
  const align = (n, a) => Math.ceil(n / a) * a;
  function baseType(t) { while (t && t.type === 'pointer' && t.ptrType === 'array') t = t.eleType; return t; }
  function typeName(t) {
    if (!t) return '?';
    if (t.type === 'primitive') return t.name;
    if (t.type === 'pointer' && t.ptrType === 'normal') return typeName(t.targetType) + '*';
    if (t.type === 'pointer' && t.ptrType === 'array') { let s = ''; let u = t; while (u && u.type === 'pointer' && u.ptrType === 'array') { s += '[' + u.size + ']'; u = u.eleType; } return typeName(u) + s; }
    return t.name || t.type || '?';
  }
  function charText(c) {
    if (c === 0) return "'\\0'"; if (c === 10) return "'\\n'"; if (c === 9) return "'\\t'";
    if (c >= 32 && c < 127) return "'" + String.fromCharCode(c) + "'";
    return String(c);
  }
  function valueText(t, v) {
    if (typeof v !== 'number' || Number.isNaN(v)) return '?';
    const n = t && t.name;
    if (n === 'char' || n === 'signed char' || n === 'unsigned char') return charText(v);
    if (n === 'bool') return v ? 'true' : 'false';
    if (n === 'float' || n === 'double' || n === 'long double') return String(Number(v.toPrecision(12)));
    return String(v);
  }
  function defaultErrorText(m) {
    return String(m || 'error').replace(/^<position unavailable> /, '').replace(/^(\d+):(\d+) /, 'line $1: ').replace(/^ERROR: Parsing Failure:\s*/, 'Syntax error: ').split('\n')[0];
  }

  function trace(code, stdin, opts) {
    opts = opts || {};
    const maxSteps = opts.maxSteps || 1500, maxMs = opts.maxMs || 5000;
    const errorText = opts.errorText || defaultErrorText;
    const src = opts.prepare ? opts.prepare(code) : code;
    const lines = code.split('\n');
    const result = { steps: [], output: '', error: null, errorLine: 0, truncated: false, finished: false };
    let out = '';
    let dbg;
    try {
      dbg = J().run(src, stdin || '', { stdio: { write: (s) => { out += s; } }, debug: true, unsigned_overflow: 'warn' });
    } catch (e) {
      result.error = errorText(e && e.message ? e.message : String(e));
      const m = result.error.match(/line (\d+)/); if (m) result.errorLine = +m[1];
      return result;
    }

    // Identity bookkeeping that survives from one snapshot to the next.
    const ids = new WeakMap(); let nextId = 1;
    const idOf = (o) => { let i = ids.get(o); if (!i) { i = nextId++; ids.set(o, i); } return i; };
    const kinds = new WeakMap();      // variable object -> 'value' | 'array' | 'pointer'
    const owners = new WeakMap();     // JS array (element storage) -> owning array variable object
    const lastSeen = new WeakMap();   // object -> { label, addr } from the last snapshot it appeared in
    const literals = new WeakMap(); let nextLiteral = 400;   // unnamed arrays (string literals) get addresses from 400
    let prevValues = new Map();       // id -> value text in the previous snapshot
    let prevLine = 0;

    function kindOf(v, name, isParam, declLine) {
      let k = kinds.get(v); if (k) return k;
      const t = v.t;
      if (t.type === 'primitive') k = 'value';
      else if (t.ptrType === 'normal') k = 'pointer';
      else if (isParam) k = 'pointer';                                  // an array parameter is really a pointer
      else {
        const text = declLine != null ? (lines[declLine - 1] || '') : code;
        const esc = name.replace(/[$]/g, '\\$&');
        if (new RegExp('\\*\\s*' + esc + '\\b').test(text) && !new RegExp('\\b' + esc + '\\s*\\[').test(text)) k = 'pointer';
        else if (new RegExp('\\b' + esc + '\\s*\\[').test(text)) k = 'array';
        else k = owners.has(v.v.target) ? 'pointer' : 'array';
      }
      if (k === 'array' && v.v && Array.isArray(v.v.target) && !owners.has(v.v.target)) owners.set(v.v.target, v);
      kinds.set(v, k);
      return k;
    }

    function snapshot(line) {
      const rt = dbg.rt;
      // 1. group scopes into frames
      const frames = [{ name: 'global variables', global: true, raw: [] }];
      for (const sc of rt.scope) {
        const nm = sc.$name || '';
        if (nm === 'global') { for (const k of Object.keys(sc.variables)) frames[0].raw.push({ name: k, v: sc.variables[k], param: false }); continue; }
        if (nm.indexOf('function ') === 0) { frames.push({ name: nm.slice(9), raw: [], fn: true }); for (const k of Object.keys(sc.variables)) frames[frames.length - 1].raw.push({ name: k, v: sc.variables[k], param: true }); continue; }
        const f = frames[frames.length - 1];
        for (const k of Object.keys(sc.variables)) f.raw.push({ name: k, v: sc.variables[k], param: false });
      }
      // 2. layout: addresses, kinds, and a registry of everything a pointer could point at
      const reg = new Map();       // object -> { label, addr, id }
      const arrays = new Map();    // JS element array -> { label, addr, eleSize, size, eleType }
      let cur = 1000;
      const data = (x) => x.v && typeof x.v === 'object' && x.v.t && x.v.left !== false && !HIDDEN.has(x.name) && (x.v.t.type === 'primitive' || x.v.t.type === 'pointer');
      function registerArray(label, jsArr, addr, t) {
        const eleSize = sizeOf(t.eleType);
        arrays.set(jsArr, { label, addr, eleSize, size: t.size, eleType: t.eleType });
        jsArr.forEach((el, i) => {
          const a = addr + i * eleSize, lab = label + '[' + i + ']';
          reg.set(el, { label: lab, addr: a, id: idOf(el) });
          if (el && el.t && el.t.type === 'pointer' && el.t.ptrType === 'array' && el.v && Array.isArray(el.v.target)) registerArray(lab, el.v.target, a, el.t);
        });
      }
      for (const f of frames) {
        let base = f.global ? 100 : align(cur, 8);
        let p = base;
        f.vars = [];
        for (const x of f.raw) {
          if (!data(x)) continue;
          const v = x.v, t = v.t;
          const kind = kindOf(v, x.name, x.param, f.global ? null : prevLine || null);
          const size = kind === 'array' ? sizeOf(t) : (t.type === 'pointer' ? 8 : sizeOf(t));
          const addr = align(p, kind === 'pointer' ? 8 : alignOf(t)); p = addr + size;
          const entry = { id: idOf(v), name: x.name, kind, addr, bytes: size, param: x.param, _v: v };
          reg.set(v, { label: x.name, addr, id: entry.id });
          if (kind === 'array') registerArray(x.name, v.v.target, addr, t);
          f.vars.push(entry);
        }
        if (!f.global) cur = p;
      }
      // 3. values
      const values = new Map();
      const outFrames = [];
      for (const f of frames) {
        if (f.global && !f.vars.length) continue;
        const vars = [];
        for (const e of f.vars) {
          const v = e._v, t = v.t;
          const o = { id: e.id, name: e.name, kind: e.kind, addr: e.addr, bytes: e.bytes };
          if (e.param) o.param = true;
          if (e.kind === 'value') { o.type = typeName(t); o.value = valueText(t, v.v); if (o.value === '?') o.unset = true; }
          else if (e.kind === 'array') {
            o.type = typeName(t);
            const jsArr = v.v.target, info = arrays.get(jsArr);
            const cells = [];
            const n = Math.min(jsArr.length, MAX_CELLS);
            for (let i = 0; i < n; i++) {
              const el = jsArr[i]; const c = { id: idOf(el), index: i, addr: info.addr + i * info.eleSize };
              if (el.t && el.t.type === 'pointer' && el.t.ptrType === 'array') {   // a row of a 2-D array
                c.row = el.v.target.slice(0, MAX_CELLS).map((x, j) => ({ id: idOf(x), index: j, addr: c.addr + j * sizeOf(el.t.eleType), value: valueText(el.t.eleType, x.v) }));
                c.value = '[' + c.row.map(x => x.value).join(', ') + ']';
                c.row.forEach(x => values.set(x.id, x.value));
              } else c.value = valueText(t.eleType, el.v);
              values.set(c.id, c.value); cells.push(c);
            }
            o.cells = cells; if (jsArr.length > n) o.more = jsArr.length - n;
            const bt = baseType(t);
            if (bt && bt.name === 'char' && !cells.some(c => c.row)) {
              let s = ''; for (const x of jsArr) { if (!(x.v > 0)) break; s += String.fromCharCode(x.v); }
              o.text = s;
            }
            o.value = o.cells.map(c => c.value).join(', ');
          } else {   // pointer
            const tv = v.v || {};
            o.type = t.ptrType === 'array' ? typeName(t.eleType) + '*' : typeName(t);
            let tgt = null;
            if (t.ptrType === 'normal') {
              if (tv.target == null) o.value = '?', o.unset = true, o.note = 'not pointing anywhere yet';
              else {
                const r = reg.get(tv.target);
                if (r) tgt = { id: r.id, label: r.label, addr: r.addr };
                else { const l = lastSeen.get(tv.target); tgt = { id: 0, label: l ? l.label : 'something', addr: l ? l.addr : 0, gone: true }; }
              }
            } else if (Array.isArray(tv.target)) {
              const info = arrays.get(tv.target), pos = tv.position || 0;
              if (info) {
                const addr = info.addr + pos * info.eleSize;
                if (pos >= 0 && pos < tv.target.length) { const el = tv.target[pos]; const r = reg.get(el); tgt = { id: r ? r.id : 0, label: info.label + '[' + pos + ']', addr }; }
                else tgt = { id: 0, label: pos === tv.target.length ? 'one past the end of ' + info.label : 'outside ' + info.label, addr, outside: true };
              } else {
                const l = lastSeen.get(tv.target);
                if (l) tgt = { id: 0, label: l.label + '[' + pos + ']', addr: l.addr + pos * (l.eleSize || 1), gone: true };
                else {
                  let s = ''; for (const x of tv.target) { if (!(x.v > 0)) break; s += String.fromCharCode(x.v); }
                  let base = literals.get(tv.target); if (base == null) { base = nextLiteral; literals.set(tv.target, base); nextLiteral += tv.target.length + (8 - tv.target.length % 8) % 8; }
                  tgt = { id: 0, label: 'an unnamed array' + (s ? ' holding "' + s + '"' : ''), addr: base + pos * sizeOf(t.eleType), literal: true };
                }
              }
            }
            if (tgt) { o.target = tgt; o.value = tgt.addr ? String(tgt.addr) : '(address of ' + tgt.label + ')'; }
          }
          values.set(o.id, o.value);
          o.changed = prevValues.has(o.id) ? prevValues.get(o.id) !== o.value : false;
          o.fresh = !prevValues.has(o.id);
          if (o.cells) o.cells.forEach(c => { c.changed = prevValues.has(c.id) && prevValues.get(c.id) !== c.value; if (c.row) c.row.forEach(x => { x.changed = prevValues.has(x.id) && prevValues.get(x.id) !== x.value; }); });
          vars.push(o);
        }
        outFrames.push({ name: f.name, global: !!f.global, vars });
      }
      for (const [obj, r] of reg) lastSeen.set(obj, { label: r.label, addr: r.addr });
      for (const [jsArr, info] of arrays) lastSeen.set(jsArr, { label: info.label, addr: info.addr, eleSize: info.eleSize });
      prevValues = values;
      return { line, frames: outFrames, outLen: out.length };
    }

    const t0 = Date.now();
    let ticks = 0;
    try {
      // run the setup before main's first line (global initialisers, entering main)
      while (!(dbg.nextNode() && dbg.nextNode().sLine > 0)) { if (dbg.next() !== false) { result.finished = true; break; } }
      while (!result.finished) {
        const node = dbg.nextNode();
        const line = node && node.sLine > 0 ? node.sLine : 0;
        result.steps.push(snapshot(line));
        prevLine = line;
        if (result.steps.length >= maxSteps) { result.truncated = true; break; }
        // run to the next line
        let done = false;
        while (true) {
          const r = dbg.next();
          if (r !== false) { done = true; break; }
          const nn = dbg.nextNode();
          if (dbg.conditions.lineChanged(dbg.prevNode, nn)) break;
          if ((++ticks & 1023) === 0 && Date.now() - t0 > maxMs) throw new Error('Time limit exceeded: the program ran for too long. Is there a loop that never ends?');
        }
        if (done) {
          result.finished = true;
          const last = snapshot(0); last.done = true;
          result.steps.push(last);
          break;
        }
        if (Date.now() - t0 > maxMs) throw new Error('Time limit exceeded: the program ran for too long. Is there a loop that never ends?');
      }
    } catch (e) {
      result.error = errorText(e && e.message ? e.message : String(e));
      const m = result.error.match(/line (\d+)/); result.errorLine = m ? +m[1] : prevLine;
    }
    result.output = out;
    return result;
  }

  // ---------- rendering ----------
  function h(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) { const a = attrs[k]; if (a == null || a === false) continue; if (k === 'class') n.className = a; else if (k === 'text') n.textContent = a; else if (k.startsWith('on')) n.addEventListener(k.slice(2), a); else n.setAttribute(k, a === true ? '' : a); }
    for (const k of kids.flat()) if (k != null && k !== false) n.append(k.nodeType ? k : document.createTextNode(String(k)));
    return n;
  }

  function render(mount, tr, i) {
    mount.innerHTML = '';
    const st = tr.steps[i];
    if (!st) { mount.append(h('p', { class: 'mem-empty' }, 'Nothing to show.')); return; }
    const box = h('div', { class: 'mem' });
    if (!st.frames.length) box.append(h('p', { class: 'mem-empty' }, 'No variables: the program has finished and every function\u2019s memory has been given back.'));
    st.frames.forEach((f, fi) => {
      const active = fi === st.frames.length - 1 && !f.global && !st.done;
      const fr = h('div', { class: 'mem-frame' + (f.global ? ' global' : '') + (active ? ' active' : '') },
        h('div', { class: 'mem-frame-name' }, f.global ? 'global variables' : f.name + '()', active ? h('span', { class: 'mem-running' }, 'running') : null));
      if (!f.vars.length) fr.append(h('div', { class: 'mem-none' }, 'no variables yet'));
      else {
        const tb = h('table', { class: 'mem-vars' }, h('thead', {}, h('tr', {}, h('th', {}, 'name'), h('th', {}, 'type'), h('th', {}, 'address'), h('th', {}, 'value'))));
        const body = h('tbody');
        for (const v of f.vars) {
          const row = h('tr', { 'data-mem': v.id, class: [v.changed ? 'changed' : '', v.fresh && i > 0 ? 'fresh' : ''].join(' ').trim() || null });
          row.append(h('td', {}, h('code', {}, v.name), v.param ? h('span', { class: 'mem-tag' }, 'parameter') : null));
          row.append(h('td', {}, h('code', {}, v.type)));
          row.append(h('td', { class: 'mem-addr' }, String(v.addr), v.bytes > 1 ? h('span', { class: 'mem-bytes' }, ' (' + v.bytes + ' bytes)') : null));
          const val = h('td', { class: 'mem-val' });
          if (v.kind === 'array') {
            const cells = h('div', { class: 'mem-cells' });
            for (const c of v.cells) {
              if (c.row) {
                const rowBox = h('div', { class: 'mem-subrow' }, h('span', { class: 'mem-idx' }, '[' + c.index + ']'));
                for (const x of c.row) rowBox.append(h('span', { class: 'mem-cell' + (x.changed ? ' changed' : ''), 'data-mem': x.id, title: v.name + '[' + c.index + '][' + x.index + '] at address ' + x.addr }, h('span', { class: 'mem-idx' }, x.index), h('code', {}, x.value)));
                cells.append(rowBox);
              } else cells.append(h('span', { class: 'mem-cell' + (c.changed ? ' changed' : '') + (c.value === '?' ? ' unset' : ''), 'data-mem': c.id, title: v.name + '[' + c.index + '] at address ' + c.addr }, h('span', { class: 'mem-idx' }, c.index), h('code', {}, c.value)));
            }
            if (v.more) cells.append(h('span', { class: 'mem-more' }, '… ' + v.more + ' more'));
            val.append(cells);
            if (v.text != null) val.append(h('div', { class: 'mem-text' }, 'as text: ', h('code', {}, '"' + v.text + '"')));
          } else if (v.kind === 'pointer') {
            if (v.target) {
              const t = v.target;
              val.append(h('code', {}, v.value), ' ', h('span', { class: 'mem-arrow' + (t.gone || t.outside ? ' bad' : ''), 'data-target': t.id || null }, '\u2192 ' + t.label + (t.gone ? ' (no longer exists)' : '')));
            } else val.append(h('code', { class: 'unset' }, '?'), ' ', h('span', { class: 'mem-note' }, v.note || ''));
          } else {
            val.append(h('code', { class: v.unset ? 'unset' : null, title: v.unset ? 'never given a value: its bytes hold whatever was there before' : null }, v.value));
            if (v.unset) val.append(' ', h('span', { class: 'mem-note' }, 'never given a value'));
          }
          row.append(val);
          body.append(row);
        }
        tb.append(body);
        fr.append(h('div', { class: 'mem-scroll' }, tb));
      }
      box.append(fr);
    });
    // hovering a pointer lights up what it points at
    box.addEventListener('mouseover', (e) => {
      const a = e.target.closest && e.target.closest('[data-target]'); box.querySelectorAll('.mem-hit').forEach(x => x.classList.remove('mem-hit'));
      if (a) { const t = box.querySelector('[data-mem="' + a.getAttribute('data-target') + '"]'); if (t) t.classList.add('mem-hit'); }
    });
    box.addEventListener('mouseleave', () => box.querySelectorAll('.mem-hit').forEach(x => x.classList.remove('mem-hit')));
    mount.append(box);
  }

  function describe(tr, i) {
    const st = tr.steps[i]; if (!st) return '';
    const n = tr.steps.length;
    if (st.done) return 'step ' + (i + 1) + ' of ' + n + ': the program has finished';
    const last = i === n - 1;
    if (last && tr.error) return 'step ' + (i + 1) + ' of ' + n + ': stopped with an error on line ' + (tr.errorLine || st.line);
    return 'step ' + (i + 1) + ' of ' + n + ': about to run line ' + st.line;
  }

  const api = { trace, render, describe, _typeName: typeName };
  if (typeof window !== 'undefined') window.CPPSTEP = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
