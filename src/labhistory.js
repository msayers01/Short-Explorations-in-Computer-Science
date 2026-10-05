/* The Code Lab's file history ("local history", as IDEs have), its line diff, and find/replace across files. Pure: no DOM, no storage;
   lab.js draws and saves. Exposed as window.LABHIST or module.exports (test_labhistory.js).

     diff(a, b)               line diff of two texts: [{k: ' ' | '-' | '+', text, a?, b?, noEol?}] (a, b: line numbers in each text; noEol: the
                              last line, without a newline at the end, as git's "\ No newline at end of file"). A pair too large to compare line by
                              line (more than MAX_CELLS between the common start and end) comes out as everything removed, then everything added.
     hunks(ops, ctx)          the same with unchanged runs longer than 2 * ctx folded into {k: '…', skip: n}
     stats(ops)               {added, removed}                firstChange(a, b) → the first line number where they differ, or 0
     clean(raw)               a stored history, checked and rebuilt (storage is untrusted: null-prototype maps, names and languages checked,
                              sizes capped, reasons from a fixed list) → {v: 1, files: {lang: {name: [{t, why, code}] oldest first}}}
     add(h, lang, name, code, why, now)   a snapshot: skipped when empty, too large, or the same as the newest one; a copy of an older
                              identical version is dropped first (so no text is stored twice); then the caps. Returns true if stored.
     list(h, lang, name)      the versions, newest first       rename(h, lang, from, to)       drop(h, lang, name)      size(h)
     prune(h)                 PER_FILE versions a file; TOTAL characters of code in all, the oldest versions anywhere going first
     search(files, q, opts)   [{i, matches: [{line, col, s, e, text}]}] for files [{code}]: opts.matchCase, opts.word (whole words);
                              at most MAX_HITS matches in all          replaceIn(code, q, rep, opts) → {code, n}                         */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LABHIST = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const KEY = 'shortcourses.labhistory.v1';
  const PER_FILE = 30, TOTAL = 400000, MAX_SNAP = 100000, MAX_FILES = 400, MAX_CELLS = 4e6, MAX_HITS = 1000;
  // what made a version, and how the History panel says it
  const WHY = { run: 'run', edit: 'edit', opened: 'as it was when opened', restore: 'before restore', replace: 'before replace all', reset: 'before reset', terminal: 'before the terminal changed it' };
  const dict = () => Object.create(null);
  const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  // Languages and file names become keys: nothing that is a member of Object.prototype, no control characters, the Lab's own limits
  const langOk = (l) => typeof l === 'string' && /^[a-z][a-z0-9+]{0,11}$/.test(l) && !(l in Object.prototype);
  const nameOk = (n) => typeof n === 'string' && n.length >= 1 && n.length <= 100 && !/[\u0000-\u001f\u007f]/.test(n) && !(n in Object.prototype);

  /* ---------- the line diff ---------- */
  // Lines are compared with their newline, so "a" and "a\n" differ in their last line (and say so with noEol)
  function lines(s) {
    s = String(s == null ? '' : s); if (s === '') return [];
    const parts = s.split('\n'), out = [];
    for (let i = 0; i < parts.length; i++) { if (i === parts.length - 1) { if (parts[i] !== '') out.push({ text: parts[i], key: parts[i], noEol: true }); } else out.push({ text: parts[i], key: parts[i] + '\n' }); }
    return out;
  }
  function diff(a, b) {
    const A = lines(a), B = lines(b), ops = [];
    let p = 0; while (p < A.length && p < B.length && A[p].key === B[p].key) p++;
    let ea = A.length, eb = B.length; while (ea > p && eb > p && A[ea - 1].key === B[eb - 1].key) { ea--; eb--; }
    const same = (i, j) => ops.push(Object.assign({ k: ' ', text: A[i].text, a: i + 1, b: j + 1 }, A[i].noEol ? { noEol: true } : {}));
    const del = (i) => ops.push(Object.assign({ k: '-', text: A[i].text, a: i + 1 }, A[i].noEol ? { noEol: true } : {}));
    const ins = (j) => ops.push(Object.assign({ k: '+', text: B[j].text, b: j + 1 }, B[j].noEol ? { noEol: true } : {}));
    for (let i = 0; i < p; i++) same(i, i);
    const n = ea - p, m = eb - p;
    if (n && m && n * m <= MAX_CELLS) {
      // longest common subsequence of the middle, from the end, so the walk from the start can read it: L[i][j] = LCS of A[p+i..], B[p+j..]
      const W = m + 1, L = new Uint32Array((n + 1) * W);
      for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i * W + j] = A[p + i].key === B[p + j].key ? L[(i + 1) * W + j + 1] + 1 : Math.max(L[(i + 1) * W + j], L[i * W + j + 1]);
      let i = 0, j = 0;
      while (i < n && j < m) {
        if (A[p + i].key === B[p + j].key) { same(p + i, p + j); i++; j++; }
        else if (L[(i + 1) * W + j] >= L[i * W + j + 1]) { del(p + i); i++; }   // removals before additions, as diff -u shows them
        else { ins(p + j); j++; }
      }
      while (i < n) del(p + i++); while (j < m) ins(p + j++);
    } else { for (let i = p; i < ea; i++) del(i); for (let j = p; j < eb; j++) ins(j); }
    for (let i = ea, j = eb; i < A.length; i++, j++) same(i, j);
    return ops;
  }
  function hunks(ops, ctx) {
    ctx = ctx == null ? 3 : ctx; const out = []; let i = 0;
    while (i < ops.length) {
      if (ops[i].k !== ' ') { out.push(ops[i++]); continue; }
      let j = i; while (j < ops.length && ops[j].k === ' ') j++;
      const run = j - i, head = i === 0 ? 0 : ctx, tail = j === ops.length ? 0 : ctx;
      if (run > head + tail + 1) { for (let k = i; k < i + head; k++) out.push(ops[k]); out.push({ k: '…', skip: run - head - tail }); for (let k = j - tail; k < j; k++) out.push(ops[k]); }
      else for (let k = i; k < j; k++) out.push(ops[k]);
      i = j;
    }
    return out;
  }
  const stats = (ops) => { let added = 0, removed = 0; for (const o of ops) { if (o.k === '+') added++; else if (o.k === '-') removed++; } return { added, removed }; };
  function firstChange(a, b) { const A = lines(a), B = lines(b); for (let i = 0; i < Math.max(A.length, B.length); i++) if (!A[i] || !B[i] || A[i].key !== B[i].key) return i + 1; return 0; }

  /* ---------- the history ---------- */
  const empty = () => ({ v: 1, files: dict() });
  function clean(raw) {
    const h = empty();
    if (!isObj(raw) || raw.v !== 1 || !isObj(raw.files)) return h;
    let nfiles = 0;
    for (const l of Object.keys(raw.files).slice(0, 20)) {
      if (!langOk(l) || !isObj(raw.files[l])) continue;
      for (const name of Object.keys(raw.files[l])) {
        if (nfiles >= MAX_FILES) break;
        const vs = raw.files[l][name]; if (!nameOk(name) || !Array.isArray(vs)) continue;
        const seen = new Set(), keep = [];
        for (const v of vs.slice(-PER_FILE)) {
          if (!isObj(v) || typeof v.code !== 'string' || v.code.length > MAX_SNAP || !v.code.trim() || seen.has(v.code) || !Number.isFinite(v.t)) continue;
          seen.add(v.code); keep.push({ t: Math.max(0, Math.min(1e15, v.t)), why: typeof v.why === 'string' && has(WHY, v.why) ? v.why : 'edit', code: v.code });
        }
        if (!keep.length) continue;
        keep.sort((x, y) => x.t - y.t);
        if (!h.files[l]) h.files[l] = dict();
        h.files[l][name] = keep; nfiles++;
      }
    }
    prune(h);
    return h;
  }
  const versions = (h, l, name) => (langOk(l) && nameOk(name) && h.files[l] && h.files[l][name]) || null;
  function list(h, l, name) { const vs = versions(h, l, name); return vs ? vs.slice().reverse() : []; }
  function size(h) { let n = 0; for (const l in h.files) for (const name in h.files[l]) for (const v of h.files[l][name]) n += v.code.length; return n; }
  function prune(h) {
    for (const l in h.files) for (const name in h.files[l]) { const vs = h.files[l][name]; if (vs.length > PER_FILE) vs.splice(0, vs.length - PER_FILE); }
    let total = size(h);
    while (total > TOTAL) {
      let best = null;   // the oldest version anywhere (each list is oldest first, so only the heads compete)
      for (const l in h.files) for (const name in h.files[l]) { const v = h.files[l][name][0]; if (v && (!best || v.t < best.v.t)) best = { l, name, v }; }
      if (!best) break;
      h.files[best.l][best.name].shift(); total -= best.v.code.length;
      if (!h.files[best.l][best.name].length) drop(h, best.l, best.name);
    }
    return h;
  }
  function add(h, l, name, code, why, now) {
    if (!langOk(l) || !nameOk(name) || typeof code !== 'string' || !code.trim() || code.length > MAX_SNAP) return false;
    if (!h.files[l]) h.files[l] = dict();
    let vs = h.files[l][name];
    if (!vs) {
      let n = 0; for (const k in h.files) n += Object.keys(h.files[k]).length;
      if (n >= MAX_FILES) return false;
      vs = h.files[l][name] = [];
    }
    if (vs.length && vs[vs.length - 1].code === code) return false;   // nothing new since the last version
    const old = vs.findIndex((v) => v.code === code); if (old >= 0) vs.splice(old, 1);   // the same text earlier: it moves up, stored once
    const t = Number.isFinite(now) ? now : Date.now();
    vs.push({ t: vs.length ? Math.max(t, vs[vs.length - 1].t) : t, why: has(WHY, why) ? why : 'edit', code });
    prune(h);
    return !!versions(h, l, name);
  }
  // A renamed file keeps its history; if the new name had one (a file deleted before history could hear of it), the two are merged by time
  function rename(h, l, from, to) {
    const vs = versions(h, l, from); if (!vs || from === to || !nameOk(to)) return;
    const there = versions(h, l, to) || [];
    const seen = new Set(), all = there.concat(vs).sort((x, y) => x.t - y.t).reverse().filter((v) => !seen.has(v.code) && seen.add(v.code)).reverse();
    delete h.files[l][from]; h.files[l][to] = all; prune(h);
  }
  function drop(h, l, name) { if (versions(h, l, name)) { delete h.files[l][name]; if (!Object.keys(h.files[l]).length) delete h.files[l]; } }

  /* ---------- find in all files ---------- */
  const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
  function pattern(q, opts) {
    opts = opts || {}; if (typeof q !== 'string' || !q) return null;
    let src = reEsc(q);
    // whole word: no word character just outside an end of the match that is itself a word character ("x" in "max" no, ".x" after "a" yes)
    if (opts.word) { if (/^\w/.test(q)) src = '(?<![A-Za-z0-9_])' + src; if (/\w$/.test(q)) src += '(?![A-Za-z0-9_])'; }
    return new RegExp(src, opts.matchCase ? 'g' : 'gi');
  }
  function search(files, q, opts) {
    const re = pattern(q, opts), out = []; if (!re) return out;
    let hits = 0;
    (files || []).forEach((f, i) => {
      if (hits >= MAX_HITS || !f || typeof f.code !== 'string') return;
      const code = f.code, matches = []; let m, line = 1, ls = 0, scanned = 0;
      re.lastIndex = 0;
      while (hits < MAX_HITS && (m = re.exec(code))) {
        if (!m[0].length) { re.lastIndex++; continue; }
        for (let k = code.indexOf('\n', scanned); k >= 0 && k < m.index; k = code.indexOf('\n', k + 1)) { line++; ls = k + 1; scanned = k + 1; }
        scanned = Math.max(scanned, ls);
        let le = code.indexOf('\n', m.index); if (le < 0) le = code.length;
        matches.push({ line, col: m.index - ls + 1, s: m.index, e: m.index + m[0].length, text: code.slice(ls, le) });
        hits++;
      }
      if (matches.length) out.push({ i, matches });
    });
    return out;
  }
  function replaceIn(code, q, rep, opts) {
    const re = pattern(q, opts); if (!re || typeof code !== 'string') return { code, n: 0 };
    let n = 0; const outCode = code.replace(re, () => { n++; return String(rep == null ? '' : rep); });   // a function: "$&" in the replacement stays as typed
    return { code: outCode, n };
  }

  return { KEY, WHY, PER_FILE, TOTAL, MAX_SNAP, MAX_HITS, diff, hunks, stats, firstChange, clean, empty, add, list, rename, drop, prune, size, search, replaceIn };
});
