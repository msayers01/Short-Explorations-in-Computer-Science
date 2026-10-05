/* A practice git for the shell (shell.js): what a beginner does with version control, with git's own messages, exit statuses and formats.

   init, status (-s), add, rm, mv, restore, commit (-m -a --amend), log (--oneline -n --all -p --stat --format --graph), diff (--staged,
   commits, --stat), show (commit, tag, commit:path), branch, switch, checkout, merge (fast-forward, three-way, conflicts written into the
   files), reset (--soft --mixed --hard, paths), tag (lightweight and -a), stash, revert, cherry-pick, blame, clean, config, reflog,
   ls-files, cat-file, rev-parse, gc, help. Messages not given with -m are written in the terminal's nano (sh.hooks.nano), when there is one.
   clone, push, pull, fetch and remote need another computer: they say there is no network here.

   The repository is a .git directory in the virtual file system (so ls -a shows it and rm -rf .git removes it), laid out like a real one
   where that teaches something: HEAD, config, refs/heads/<branch>, refs/tags/<tag>, logs/HEAD, MERGE_HEAD, MERGE_MSG, ORIG_HEAD. What a real
   one keeps in binary is kept as readable JSON: every object (blob, tree, commit, tag) in .git/objects.json, the staging area in .git/index.
   Ids are real SHA-1s of git's own serialization, so the same files, name, email and time give the same commit id as real git.
   Everything under .git is checked when it is read (shapes, names, ids against their contents, links between objects): a hand-edited or
   hostile copy gives "fatal: ..." and never an exception. The file system's caps hold: a repository that outgrows them says so and the
   command changes nothing. No eval, no DOM; node loads it in test_git.js. */
(function (factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./shell.js'));
  else window.SHELLGIT = factory(window.SHELL);
})(function (SHELL) {
  'use strict';
  const dict = () => Object.create(null);
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const LIMITS = SHELL.LIMITS, FsError = SHELL.FsError, HOME = SHELL.HOME;
  const q = (s) => "'" + s + "'";
  const ZERO = '0'.repeat(40), HEX40 = /^[0-9a-f]{40}$/;
  const short = (id) => id.slice(0, 7);
  const MAX_PATHS = LIMITS.files * 2;   // a tree that names more files than this cannot be checked out here anyway (and a hostile one could name billions)

  /* ---------------- SHA-1 and objects ---------------- */
  const ENC = new TextEncoder();
  function sha1(bytes) {
    const n = bytes.length, blocks = ((n + 8) >> 6) + 1, w = new Int32Array(blocks * 16);
    for (let i = 0; i < n; i++) w[i >> 2] |= bytes[i] << (24 - (i & 3) * 8);
    w[n >> 2] |= 0x80 << (24 - (n & 3) * 8);
    w[blocks * 16 - 1] = n * 8; w[blocks * 16 - 2] = Math.floor(n / 0x20000000);
    let h0 = 0x67452301, h1 = 0xefcdab89 | 0, h2 = 0x98badcfe | 0, h3 = 0x10325476, h4 = 0xc3d2e1f0 | 0;
    const W = new Int32Array(80);
    for (let off = 0; off < w.length; off += 16) {
      for (let t = 0; t < 16; t++) W[t] = w[off + t];
      for (let t = 16; t < 80; t++) { const x = W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16]; W[t] = (x << 1) | (x >>> 31); }
      let a = h0, b = h1, c = h2, d = h3, e = h4;
      for (let t = 0; t < 80; t++) {
        const f = t < 20 ? (b & c) | (~b & d) : t < 40 ? b ^ c ^ d : t < 60 ? (b & c) | (b & d) | (c & d) : b ^ c ^ d;
        const k = t < 20 ? 0x5a827999 : t < 40 ? 0x6ed9eba1 : t < 60 ? 0x8f1bbcdc | 0 : 0xca62c1d6 | 0;
        const tmp = (((a << 5) | (a >>> 27)) + f + e + k + W[t]) | 0;
        e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = tmp;
      }
      h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0;
    }
    return [h0, h1, h2, h3, h4].map((h) => (h >>> 0).toString(16).padStart(8, '0')).join('');
  }
  const concat = (parts) => { let len = 0; for (const p of parts) len += p.length; const out = new Uint8Array(len); let k = 0; for (const p of parts) { out.set(p, k); k += p.length; } return out; };
  const hexBytes = (hex) => { const b = new Uint8Array(20); for (let i = 0; i < 20; i++) b[i] = parseInt(hex.substr(i * 2, 2), 16); return b; };
  // an object in memory: { type:'blob', text } | { type:'tree', entries:[{mode, name, id}] } | { type:'commit'|'tag', raw, ...parsed }
  // A tree's mode for a directory is '40000', as git writes it inside the object (cat-file prints 040000).
  const body = (o) => o.type === 'blob' ? ENC.encode(o.text) : o.type === 'tree' ? concat([].concat(...o.entries.map((e) => [ENC.encode(e.mode + ' ' + e.name + '\0'), hexBytes(e.id)]))) : ENC.encode(o.raw);
  const idOf = (o) => { const b = body(o); return sha1(concat([ENC.encode(o.type + ' ' + b.length + '\0'), b])); };
  const blobId = (text) => idOf({ type: 'blob', text });
  const FILE_MODES = { '100644': 1, '100755': 1 };
  const treeKey = (e) => e.name + (e.mode === '40000' ? '/' : '');
  const byTreeKey = (a, b) => { const x = treeKey(a), y = treeKey(b); return x < y ? -1 : x > y ? 1 : 0; };
  const modeOf = (node) => node.x ? '100755' : '100644';

  // commits and tags are kept as git writes them, and parsed with these
  const PERSON = '([^<>\\n]*) <([^<>\\n]*)> (\\d{1,13}) ([+-]\\d{4})';
  const COMMIT_RE = new RegExp('^tree ([0-9a-f]{40})\\n((?:parent [0-9a-f]{40}\\n){0,16})author ' + PERSON + '\\ncommitter ' + PERSON + '\\n\\n([\\s\\S]*)$');
  const TAG_RE = new RegExp('^object ([0-9a-f]{40})\\ntype commit\\ntag ([^\\n]{1,100})\\ntagger ' + PERSON + '\\n\\n([\\s\\S]*)$');
  const person = (m, k) => ({ name: m[k], email: m[k + 1], ts: +m[k + 2], tz: m[k + 3] });
  function parseCommit(raw) {
    const m = COMMIT_RE.exec(raw); if (!m) return null;
    return { type: 'commit', raw, tree: m[1], parents: m[2] ? m[2].trim().split('\n').map((l) => l.slice(7)) : [], author: person(m, 3), committer: person(m, 7), message: m[11] };
  }
  function parseTag(raw) { const m = TAG_RE.exec(raw); if (!m) return null; return { type: 'tag', raw, object: m[1], tagName: m[2], tagger: person(m, 3), message: m[7] }; }
  const fsName = (n) => typeof n === 'string' && n.length > 0 && n.length <= LIMITS.name && n !== '.' && n !== '..' && !/[\/\u0000-\u001f\u007f]/.test(n);
  const gitName = (n) => fsName(n) && n.toLowerCase() !== '.git';   // a tree or index entry named .git could plant a repository inside the files
  const validPath = (p) => typeof p === 'string' && p.length <= 4096 && p.split('/').length <= LIMITS.depth && p.split('/').every(gitName);
  // an object as stored in objects.json → the object, or null when its shape is wrong
  function fromStored(v) {
    if (!Array.isArray(v) || v.length !== 2) return null;
    if (v[0] === 'blob') return typeof v[1] === 'string' && v[1].length <= LIMITS.fileBytes ? { type: 'blob', text: v[1] } : null;
    if (v[0] === 'commit') return typeof v[1] === 'string' ? parseCommit(v[1]) : null;
    if (v[0] === 'tag') return typeof v[1] === 'string' ? parseTag(v[1]) : null;
    if (v[0] === 'tree') {
      if (!Array.isArray(v[1]) || v[1].length > MAX_PATHS) return null;
      const seen = dict(), entries = [];
      for (const e of v[1]) {
        if (!Array.isArray(e) || e.length !== 3 || !(FILE_MODES[e[0]] || e[0] === '40000') || !gitName(e[1]) || typeof e[2] !== 'string' || !HEX40.test(e[2]) || seen[e[1]]) return null;
        seen[e[1]] = 1; entries.push({ mode: e[0], name: e[1], id: e[2] });
      }
      return { type: 'tree', entries };
    }
    return null;
  }
  const toStored = (o) => o.type === 'blob' ? ['blob', o.text] : o.type === 'tree' ? ['tree', o.entries.map((e) => [e.mode, e.name, e.id])] : [o.type, o.raw];

  /* ---------------- errors ---------------- */
  // Fatal ends the git command with a message (on stderr, or stdout when toOut) and an exit status, as git's die() does.
  function Fatal(msg, code, toOut) { this.message = msg; this.code = code === undefined ? 128 : code; this.toOut = !!toOut; }
  const die = (msg, code, toOut) => { throw new Fatal(msg, code, toOut); };
  const damaged = (file, why) => die('fatal: .git/' + file + ' is damaged: ' + why + '\nhint: if it cannot be mended, rm -rf .git starts a new repository (the history is lost)');
  const badRev = (s) => die("fatal: ambiguous argument '" + s + "': unknown revision or path not in the working tree.\nUse '--' to separate paths from revisions, like this:\n'git <command> [<revision>...] -- [<file>...]'");

  /* ---------------- comparing texts ---------------- */
  // A text as lines that keep their newline (the last may have none), so "\ No newline at end of file" comes out right.
  const splitL = (t) => t === '' ? [] : t.match(/[^\n]*\n|[^\n]+$/g);
  // Myers' O(ND) difference, after the common start and end are taken off; past 1500 differences it gives up and replaces the middle.
  function myers(A, B) {
    const N = A.length, M = B.length, MAX = N + M, off = MAX + 1, V = new Int32Array(2 * MAX + 3), trace = [];
    const plain = () => Array(N).fill('-').concat(Array(M).fill('+'));
    if (!N || !M) return plain();
    for (let d = 0; d <= MAX; d++) {
      if (d > 1500) return plain();
      trace.push(V.slice(off - d, off + d + 1));
      for (let k = -d; k <= d; k += 2) {
        let x = (k === -d || (k !== d && V[off + k - 1] < V[off + k + 1])) ? V[off + k + 1] : V[off + k - 1] + 1, y = x - k;
        while (x < N && y < M && A[x] === B[y]) { x++; y++; }
        V[off + k] = x;
        if (x >= N && y >= M) {
          const out = []; let cx = N, cy = M;
          for (let dd = d; dd > 0; dd--) {
            const P = trace[dd], kk = cx - cy, down = kk === -dd || (kk !== dd && P[kk - 1 + dd] < P[kk + 1 + dd]);
            const pk = down ? kk + 1 : kk - 1, px = P[pk + dd], py = px - pk, mx = down ? px : px + 1;
            while (cx > mx) { out.push('='); cx--; cy--; }
            out.push(down ? '+' : '-'); cx = px; cy = py;
          }
          while (cx > 0) { out.push('='); cx--; }
          return out.reverse();
        }
      }
    }
    return plain();
  }
  /** the edit script from a to b: '=', '-', '+' per line; inside a changed block the removed lines come first, as git prints them */
  function diffOps(a, b) {
    const n = a.length, m = b.length; let pre = 0, suf = 0;
    while (pre < n && pre < m && a[pre] === b[pre]) pre++;
    while (suf < n - pre && suf < m - pre && a[n - 1 - suf] === b[m - 1 - suf]) suf++;
    const mid = myers(a.slice(pre, n - suf), b.slice(pre, m - suf)), ops = Array(pre).fill('=');
    for (let i = 0; i < mid.length;) {
      if (mid[i] === '=') { ops.push('='); i++; continue; }
      let j = i, del = 0, ins = 0; while (j < mid.length && mid[j] !== '=') { if (mid[j] === '-') del++; else ins++; j++; }
      for (let k = 0; k < del; k++) ops.push('-'); for (let k = 0; k < ins; k++) ops.push('+'); i = j;
    }
    for (let k = 0; k < suf; k++) ops.push('=');
    return ops;
  }
  /** unified diff hunks, 3 lines of context, with git's function-name header (the nearest earlier line that starts with a letter, _ or $) */
  function hunks(aText, bText) {
    const a = splitL(aText), b = splitL(bText), ops = diffOps(a, b), pos = [], ch = [], out = [];
    let ia = 0, ib = 0;
    ops.forEach((o, k) => { pos.push([ia, ib]); if (o !== '+') ia++; if (o !== '-') ib++; if (o !== '=') ch.push(k); }); pos.push([ia, ib]);
    for (let c = 0; c < ch.length;) {
      const first = ch[c]; let last = ch[c]; c++;
      while (c < ch.length && ch[c] - last - 1 <= 6) { last = ch[c]; c++; }
      const s = Math.max(0, first - 3), e = Math.min(ops.length, last + 4), [a0, b0] = pos[s], [a1, b1] = pos[e];
      const range = (st, cnt) => (cnt === 0 ? st : st + 1) + (cnt === 1 ? '' : ',' + cnt);
      let head = '@@ -' + range(a0, a1 - a0) + ' +' + range(b0, b1 - b0) + ' @@';
      for (let k = a0 - 1; k >= 0; k--) if (/^[A-Za-z_$]/.test(a[k])) { head += ' ' + a[k].replace(/\n$/, '').slice(0, 80).replace(/\s+$/, ''); break; }
      const lines = [];
      for (let k = s; k < e; k++) { const o = ops[k], [x, y] = pos[k]; lines.push(o === '+' ? ['+', b[y]] : o === '-' ? ['-', a[x]] : [' ', a[x]]); }
      out.push({ head, lines });
    }
    return out;
  }
  const countLines = (aText, bText) => { let add = 0, del = 0; for (const o of diffOps(splitL(aText), splitL(bText))) { if (o === '+') add++; else if (o === '-') del++; } return { add, del }; };
  /** three-way merge of texts, line by line (diff3 with git's "zealous" trimming of what both sides share inside a conflict) */
  function merge3(o, a, b, la, lb) {
    const O = splitL(o), A = splitL(a), B = splitL(b);
    const map = (X) => { const m = new Int32Array(O.length).fill(-1); let i = 0, j = 0; for (const op of diffOps(O, X)) { if (op === '=') m[i] = j; if (op !== '+') i++; if (op !== '-') j++; } return m; };
    const mA = map(A), mB = map(B), out = [], same = (x, y) => x.length === y.length && x.every((l, k) => l === y[k]), nl = (l) => l.endsWith('\n') ? l : l + '\n';
    let i = 0, ia = 0, ib = 0, conflicts = 0;
    while (i < O.length || ia < A.length || ib < B.length) {
      let k = 0; while (i + k < O.length && mA[i + k] === ia + k && mB[i + k] === ib + k) k++;
      if (k) { for (let t = 0; t < k; t++) out.push(O[i + t]); i += k; ia += k; ib += k; continue; }
      let j = i; while (j < O.length && !(mA[j] >= 0 && mB[j] >= 0)) j++;
      const ea = j < O.length ? mA[j] : A.length, eb = j < O.length ? mB[j] : B.length;
      const oc = O.slice(i, j), ac = A.slice(ia, ea), bc = B.slice(ib, eb);
      if (same(ac, oc)) out.push(...bc); else if (same(bc, oc) || same(ac, bc)) out.push(...ac);
      else {
        let p = 0; while (p < ac.length && p < bc.length && ac[p] === bc[p]) p++;
        let s = 0; while (s < ac.length - p && s < bc.length - p && ac[ac.length - 1 - s] === bc[bc.length - 1 - s]) s++;
        out.push(...ac.slice(0, p));
        out.push('<<<<<<< ' + la + '\n', ...ac.slice(p, ac.length - s).map(nl), '=======\n', ...bc.slice(p, bc.length - s).map(nl), '>>>>>>> ' + lb + '\n');
        out.push(...ac.slice(ac.length - s)); conflicts++;
      }
      i = j; ia = ea; ib = eb;
    }
    return { text: out.join(''), conflicts };
  }

  /* ---------------- config files ---------------- */
  // [section] or [section "sub"], then key = value lines; # and ; start comments. Keys are case-insensitive (kept in lower case).
  function parseConfig(text, file) {
    const secs = []; let cur = null;
    text.split('\n').forEach((line, n) => {
      const l = line.trim(); if (l === '' || l[0] === '#' || l[0] === ';') return;
      let m = /^\[\s*([A-Za-z0-9.-]+)(?:\s+"((?:[^"\\\n]|\\.){0,100})")?\s*\]\s*(?:[#;].*)?$/.exec(l);
      if (m) { cur = { name: m[1].toLowerCase(), sub: m[2] === undefined ? null : m[2].replace(/\\(.)/g, '$1'), entries: [] }; secs.push(cur); return; }
      m = /^([A-Za-z][A-Za-z0-9-]{0,60})\s*(?:=\s*(.*))?$/.exec(l);
      if (!m || !cur || secs.length > 200 || cur.entries.length > 200) die('fatal: bad config line ' + (n + 1) + ' in file ' + file);
      let v = m[2] === undefined ? 'true' : '', inQ = false; const src = m[2] || '';
      for (let i = 0; i < src.length; i++) {
        const c = src[i];
        if (c === '\\' && i + 1 < src.length) { const e = src[++i]; v += e === 'n' ? '\n' : e === 't' ? '\t' : e; }
        else if (c === '"') inQ = !inQ; else if (!inQ && (c === '#' || c === ';')) break; else v += c;
      }
      if (m[2] !== undefined) v = v.replace(/\s+$/, '');
      cur.entries.push([m[1].toLowerCase(), v.slice(0, 1000)]);
    });
    return secs;
  }
  const quoteValue = (v) => /^\s|\s$|[#;"\\\n\t]/.test(v) ? '"' + v.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\t/g, '\\t') + '"' : v;
  const configText = (secs) => secs.filter((s) => s.entries.length).map((s) => '[' + s.name + (s.sub === null ? '' : ' "' + s.sub.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"') + ']\n' + s.entries.map(([k, v]) => '\t' + k + ' = ' + quoteValue(v) + '\n').join('')).join('');
  // user.name → { sec: 'user', sub: null, key: 'name' }; a.b.c → section a, subsection b
  function splitKey(key) {
    const i = key.indexOf('.'), j = key.lastIndexOf('.');
    if (i < 0) die('error: key does not contain a section: ' + key, 1);
    if (j === key.length - 1 || !/^[A-Za-z][A-Za-z0-9-]*$/.test(key.slice(j + 1)) || !/^[A-Za-z0-9-]+$/.test(key.slice(0, i))) die('error: invalid key: ' + key, 1);
    return { sec: key.slice(0, i).toLowerCase(), sub: i === j ? null : key.slice(i + 1, j), key: key.slice(j + 1).toLowerCase() };
  }
  const fullKey = (s, k) => s.name + (s.sub === null ? '' : '.' + s.sub) + '.' + k;

  /* ---------------- the repository ---------------- */
  const join = (a, b) => a === '' ? b : a + '/' + b;
  const relPath = (from, to) => { const f = from ? from.split('/') : [], t = to ? to.split('/') : []; let k = 0; while (k < f.length && k < t.length && f[k] === t[k]) k++; return Array(f.length - k).fill('..').concat(t.slice(k)).join('/'); };
  // git quotes a path with unusual characters (and, in short status, spaces) in C style, with UTF-8 bytes in octal
  function cq(p, sp) {
    if (!/[\u0000-\u001f"\\\u007f-\uffff]/.test(p) && !(sp && p.includes(' '))) return p;
    let s = '"'; for (const b of ENC.encode(p)) { const c = String.fromCharCode(b); s += c === '"' ? '\\"' : c === '\\' ? '\\\\' : c === '\n' ? '\\n' : c === '\t' ? '\\t' : b < 32 || b >= 127 ? '\\' + b.toString(8).padStart(3, '0') : c; } return s + '"';
  }

  function findRoot(fs) {
    let d = fs.cwd;
    for (;;) { const gd = (d === '/' ? '' : d) + '/.git'; if (fs.isDir(gd)) return d; if (d === '/') return null; d = d.slice(0, d.lastIndexOf('/')) || '/'; }
  }
  function openRepo(sh) {
    const root = findRoot(sh.fs);
    if (root === null) die('fatal: not a git repository (or any of the parent directories): .git');
    return loadRepo(sh, root);
  }
  function loadRepo(sh, root) {
    const fs = sh.fs, gd = (root === '/' ? '' : root) + '/.git';
    const R = { sh, fs, root, gd, objs: dict(), fresh: dict(), objDirty: false, idxDirty: false, index: dict(), conflicts: dict() };
    R.abs = (p) => p === '' ? root : (root === '/' ? '' : root) + '/' + p;
    R.relOf = (abs) => abs === root ? '' : root === '/' ? abs.slice(1) : abs.startsWith(root + '/') ? abs.slice(root.length + 1) : null;
    R.cwdRel = R.relOf(fs.cwd) || '';
    R.rd = (p) => { const n = fs.stat(gd + '/' + p); return n && n.t === 'f' ? n.d : null; };
    R.now = () => ((sh.hooks && sh.hooks.now) || fs.now)();
    if (!fs.isFile(gd + '/HEAD')) die('fatal: not a git repository (or any of the parent directories): .git');
    // objects: every id is checked against its contents, then every link between them
    const text = R.rd('objects.json');
    if (text !== null && text.trim() !== '') {
      let j; try { j = JSON.parse(text); } catch (e) { damaged('objects.json', 'it is not valid JSON'); }
      if (!j || typeof j !== 'object' || !j.objects || typeof j.objects !== 'object' || Array.isArray(j.objects)) damaged('objects.json', 'it has no "objects" table');
      for (const id of Object.keys(j.objects)) {
        if (!HEX40.test(id)) damaged('objects.json', 'the id ' + JSON.stringify(id.slice(0, 50)) + ' is not 40 hexadecimal digits');
        const o = fromStored(j.objects[id]);
        if (!o) damaged('objects.json', 'object ' + short(id) + ' does not have the shape of a blob, tree, commit or tag');
        if (idOf(o) !== id) damaged('objects.json', 'object ' + short(id) + ' does not match its id (its contents were changed)');
        R.objs[id] = o;
      }
      const is = (id, type) => has(R.objs, id) && R.objs[id].type === type;
      for (const id in R.objs) {
        const o = R.objs[id], bad = (what) => damaged('objects.json', o.type + ' ' + short(id) + ' points to ' + what + ' that is not there');
        if (o.type === 'commit') { if (!is(o.tree, 'tree')) bad('a tree'); for (const p of o.parents) if (!is(p, 'commit')) bad('a parent'); }
        else if (o.type === 'tree') { for (const e of o.entries) if (!is(e.id, e.mode === '40000' ? 'tree' : 'blob')) bad(e.mode === '40000' ? 'a tree' : 'a blob'); }
        else if (o.type === 'tag' && !is(o.object, 'commit')) bad('a commit');
      }
    }
    // HEAD: a branch, or a commit (detached)
    const head = R.rd('HEAD'); let m;
    if ((m = /^ref: refs\/heads\/(\S+)\n?$/.exec(head)) && refOk(m[1])) R.head = { branch: m[1] };
    else if ((m = /^([0-9a-f]{40})\n?$/.exec(head)) && has(R.objs, m[1]) && R.objs[m[1]].type === 'commit') R.head = { id: m[1] };
    else damaged('HEAD', 'it should say "ref: refs/heads/main" (or hold the id of a commit)');
    readConfig(sh, R);   // as git, a config file it cannot read stops every command

    // the index: [path, mode, blob] entries, and the paths left in conflict by a merge
    const it = R.rd('index');
    if (it !== null && it.trim() !== '') {
      let j; try { j = JSON.parse(it); } catch (e) { damaged('index', 'it is not valid JSON'); }
      if (!j || typeof j !== 'object' || !Array.isArray(j.entries)) damaged('index', 'it has no "entries" list');
      const blob = (id) => typeof id === 'string' && has(R.objs, id) && R.objs[id].type === 'blob';
      const stage = (s) => s === null || (Array.isArray(s) && s.length === 2 && FILE_MODES[s[0]] && blob(s[1]));
      const seen = dict();
      const take = (p) => { if (!validPath(p) || seen[p]) damaged('index', 'the path ' + JSON.stringify(String(p).slice(0, 80)) + ' is not allowed (or comes twice)'); seen[p] = 1; };
      for (const e of j.entries) {
        if (!Array.isArray(e) || e.length !== 3 || !FILE_MODES[e[1]] || !blob(e[2])) damaged('index', 'an entry is not [path, mode, blob id] with a blob that exists');
        take(e[0]); R.index[e[0]] = { mode: e[1], id: e[2] };
      }
      for (const c of Array.isArray(j.conflicts) ? j.conflicts : []) {
        if (!Array.isArray(c) || c.length !== 4 || !stage(c[1]) || !stage(c[2]) || !stage(c[3]) || (!c[1] && !c[2] && !c[3])) damaged('index', 'a conflict is not [path, base, ours, theirs]');
        take(c[0]); const st = (s) => s ? { mode: s[0], id: s[1] } : null;
        R.conflicts[c[0]] = { base: st(c[1]), ours: st(c[2]), theirs: st(c[3]) };
      }
      const all = Object.keys(seen);
      if (all.length > MAX_PATHS) damaged('index', 'it names too many files');
      for (const p of all) { const parts = p.split('/'); for (let k = 1; k < parts.length; k++) if (seen[parts.slice(0, k).join('/')]) damaged('index', JSON.stringify(parts.slice(0, k).join('/')) + ' is both a file and a directory'); }
    }
    return R;
  }
  // a branch or tag name, by git's rules (check-ref-format), and short enough to be a file name here
  const refOk = (n) => typeof n === 'string' && n.length > 0 && n.length <= LIMITS.name && !n.startsWith('-') && n !== 'HEAD' && n !== '@' &&
    !/[\u0000-\u0020\u007f~^:?*[\\]|\.\.|@\{|\/\/|^\/|\/$|\.$|\.lock$|\.lock\/|\/\.|^\./.test(n) && n.split('/').length <= 8;

  // ----- writing .git files. A full disk or a file over the size cap is turned into one clear message.
  const KB = (n) => Math.ceil(n / 1000) + ' KB';
  function tooBig(R, file, e, size) {
    if (e.code === 'EFBIG') die('fatal: the repository is too big for this practice terminal: .git/' + file + ' would be ' + KB(size) + ', and a file here can hold at most ' + KB(LIMITS.fileBytes) + '.\nhint: keep big files out of the repository (list them in .gitignore), or start again with rm -rf .git');
    if (e.code === 'ENOSPC' || e.code === 'EMFILE') die('fatal: this practice terminal is out of space (' + (e.code === 'EMFILE' ? LIMITS.files + ' files' : KB(LIMITS.bytes)) + ' in all), so .git/' + file + ' cannot be written.\nhint: remove files you do not need (rm), or a repository you do not need (rm -rf .git)');
    throw e;
  }
  function gitWrite(R, file, text) {
    const abs = R.gd + '/' + file;
    try { R.fs.mkdir(abs.slice(0, abs.lastIndexOf('/')), true); R.fs.write(abs, text); }
    catch (e) { if (e instanceof FsError) tooBig(R, file, e, text.length); throw e; }
  }
  const gitRemove = (R, file) => { const abs = R.gd + '/' + file; if (R.fs.isFile(abs)) R.fs.unlink(abs); };
  function store(R, o) { const id = idOf(o); if (!has(R.objs, id)) { R.objs[id] = o; R.fresh[id] = 1; R.objDirty = true; } return id; }
  const objectsText = (R) => '{"v":1,"objects":{' + Object.keys(R.objs).map((id) => '\n' + JSON.stringify(id) + ':' + JSON.stringify(toStored(R.objs[id]))).join(',') + '\n}}\n';
  const indexText = (R) => '{"v":1,"entries":[' + Object.keys(R.index).sort().map((p) => '\n' + JSON.stringify([p, R.index[p].mode, R.index[p].id])).join(',') + '\n],"conflicts":[' +
    Object.keys(R.conflicts).sort().map((p) => { const c = R.conflicts[p], st = (s) => s ? [s.mode, s.id] : null; return '\n' + JSON.stringify([p, st(c.base), st(c.ours), st(c.theirs)]); }).join(',') + ']}\n';
  // objects first: when they do not fit, objects that nothing points to any more are dropped (git gc) and it is tried once more
  function flush(R) {
    if (R.objDirty) {
      let text = objectsText(R);
      try { R.fs.mkdir(R.gd, true); R.fs.write(R.gd + '/objects.json', text); }
      catch (e) {
        if (!(e instanceof FsError) || !/^(EFBIG|ENOSPC|EMFILE)$/.test(e.code)) throw e;
        prune(R); text = objectsText(R);
        try { R.fs.write(R.gd + '/objects.json', text); } catch (e2) { if (e2 instanceof FsError) tooBig(R, 'objects.json', e2, text.length); throw e2; }
      }
      R.objDirty = false;
    }
    if (R.idxDirty) { gitWrite(R, 'index', indexText(R)); R.idxDirty = false; }
  }
  /** drop the objects that no branch, tag, HEAD, merge or index entry reaches (and none made by this command) */
  function prune(R) {
    const keep = dict(), todo = [];
    const add = (id) => { if (id && has(R.objs, id) && !keep[id]) { keep[id] = 1; todo.push(id); } };
    add(headId(R, true)); for (const kind of ['heads', 'tags']) for (const r of listRefs(R, kind)) add(r.id);
    for (const f of ['MERGE_HEAD', 'ORIG_HEAD', 'CHERRY_PICK_HEAD', 'REVERT_HEAD']) add(readId(R, f));
    for (const l of (R.rd('logs/refs/stash') || '').split('\n')) { const m = /^[0-9a-f]{40} ([0-9a-f]{40}) /.exec(l); if (m) add(m[1]); }   // every stash entry
    for (const p in R.index) add(R.index[p].id);
    for (const p in R.conflicts) { const c = R.conflicts[p]; for (const s of [c.base, c.ours, c.theirs]) if (s) add(s.id); }
    for (const id in R.fresh) add(id);
    while (todo.length) { const o = R.objs[todo.pop()]; if (o.type === 'commit') { add(o.tree); o.parents.forEach(add); } else if (o.type === 'tree') o.entries.forEach((e) => add(e.id)); else if (o.type === 'tag') add(o.object); }
    let removed = 0; for (const id of Object.keys(R.objs)) if (!keep[id]) { delete R.objs[id]; removed++; }
    if (removed) R.objDirty = true;
    return removed;
  }

  // ----- refs
  // MERGE_HEAD, ORIG_HEAD: a commit's id, or null (anything else in them is ignored, so a merge cannot be given a blob as a parent)
  function readId(R, file) { const t = R.rd(file); const m = t === null ? null : /^([0-9a-f]{40})\s*$/.exec(t); return m && has(R.objs, m[1]) && R.objs[m[1]].type === 'commit' ? m[1] : null; }
  /** the commit a branch (heads) or tag (tags) names; null if there is none; 'broken' when the file says something else */
  function refId(R, kind, name) {
    if (!refOk(name)) return null;
    const t = R.rd('refs/' + kind + '/' + name); if (t === null) return null;
    const m = /^([0-9a-f]{40})\s*$/.exec(t), o = m && has(R.objs, m[1]) ? R.objs[m[1]] : null;
    return o && (o.type === 'commit' || (kind === 'tags' && o.type === 'tag')) ? m[1] : 'broken';
  }
  function listRefs(R, kind) {
    const base = R.gd + '/refs/' + kind, out = [];
    for (const [p, n] of R.fs.walk(base)) { if (n.t !== 'f' || out.length > 1000) continue; const name = p.slice(base.length + 1), id = refId(R, kind, name); if (id && id !== 'broken') out.push({ name, id }); }
    return out.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  }
  // refs/stash for log --all and the decorations: [{ id }] when it names a commit, else [] (git stash itself checks it more closely)
  const stashRef = (R) => { const id = readId(R, 'refs/stash'); return id ? [{ name: 'stash', id }] : []; };
  /** the commit HEAD is on, or null on a branch with no commits yet */
  function headId(R, quiet) {
    if (R.head.id) return R.head.id;
    const id = refId(R, 'heads', R.head.branch);
    if (id === 'broken') { if (quiet) return null; die('fatal: your current branch appears to be broken'); }
    return id;
  }
  function writeRef(R, kind, name, id) {
    const base = 'refs/' + kind + '/', parts = name.split('/');
    for (let k = 1; k < parts.length; k++) if (R.fs.isFile(R.gd + '/' + base + parts.slice(0, k).join('/'))) die("fatal: cannot lock ref '" + base + name + "': '" + base + parts.slice(0, k).join('/') + "' exists; cannot create '" + base + name + "'");
    if (R.fs.isDir(R.gd + '/' + base + name)) die("fatal: cannot lock ref '" + base + name + "': there is a non-empty directory '.git/" + base + name + "' blocking reference '" + base + name + "'");
    gitWrite(R, base + name, id + '\n');
  }
  function deleteRef(R, kind, name) {
    gitRemove(R, 'refs/' + kind + '/' + name);
    let d = R.gd + '/refs/' + kind + '/' + name; const stop = R.gd + '/refs/' + kind;
    for (d = d.slice(0, d.lastIndexOf('/')); d.length > stop.length; d = d.slice(0, d.lastIndexOf('/'))) { if (R.fs.isDir(d) && !R.fs.list(d).length) R.fs.rmdir(d); else break; }
  }
  /** move HEAD (its branch, or HEAD itself when detached) to id, with a line in the reflog */
  function setHead(R, id, msg) { const old = headId(R, true); if (R.head.branch) writeRef(R, 'heads', R.head.branch, id); else { gitWrite(R, 'HEAD', id + '\n'); R.head = { id }; } logHead(R, old, id, msg); }
  function attach(R, branch) { gitWrite(R, 'HEAD', 'ref: refs/heads/' + branch + '\n'); R.head = { branch }; }
  function detach(R, id) { gitWrite(R, 'HEAD', id + '\n'); R.head = { id }; }
  // .git/logs/HEAD: where HEAD has been, newest last (git reflog, git switch -). The last 100 moves are kept.
  function logHead(R, old, id, msg) {
    const lines = (R.rd('logs/HEAD') || '').split('\n').filter(Boolean).slice(-99);
    lines.push((old || ZERO) + ' ' + id + ' ' + who(R) + '\t' + msg.replace(/[\n\t]/g, ' ').slice(0, 200));
    gitWrite(R, 'logs/HEAD', lines.join('\n') + '\n');
  }
  function reflog(R) {
    const out = [];
    for (const l of (R.rd('logs/HEAD') || '').split('\n')) { const m = /^([0-9a-f]{40}) ([0-9a-f]{40}) [^\t]*\t(.*)$/.exec(l); if (m && has(R.objs, m[2])) out.push({ old: m[1], id: m[2], msg: m[3] }); }
    return out.reverse();
  }

  // ----- config: .git/config, then ~/.gitconfig
  function readConfig(sh, R, scope) {
    const files = [];
    if (scope !== 'local') { const n = sh.fs.stat(HOME + '/.gitconfig'); if (n && n.t === 'f') files.push(['global', '~/.gitconfig', n.d]); }
    if (R && scope !== 'global') { const t = R.rd('config'); if (t !== null) files.push(['local', '.git/config', t]); }
    return files.map(([s, label, text]) => ({ scope: s, label, secs: parseConfig(text, label) }));
  }
  function configGet(sh, R, key) {
    const k = splitKey(key); let v = null;
    for (const f of readConfig(sh, R)) for (const s of f.secs) if (s.name === k.sec && s.sub === k.sub) for (const [kk, vv] of s.entries) if (kk === k.key) v = vv;
    return v;
  }
  function who(R) {
    const name = configGet(R.sh, R, 'user.name') || 'Student', email = configGet(R.sh, R, 'user.email') || 'student@lab';
    const ms = R.now(), off = -new Date(ms).getTimezoneOffset(), a = Math.abs(off);
    return name.replace(/[<>\n]/g, '') + ' <' + email.replace(/[<>\n]/g, '') + '> ' + Math.floor(ms / 1000) + ' ' + (off < 0 ? '-' : '+') + String(Math.floor(a / 60)).padStart(2, '0') + String(a % 60).padStart(2, '0');
  }

  // ----- trees and revisions
  /** a tree as { path → {mode, id} } (files only) */
  function flat(R, treeId) {
    const out = dict(); let n = 0;
    const go = (id, prefix, depth) => {
      if (depth > LIMITS.depth) die('fatal: a tree in this repository is nested too deeply');
      for (const e of R.objs[id].entries) { const p = join(prefix, e.name); if (e.mode === '40000') go(e.id, p, depth + 1); else { if (++n > MAX_PATHS) die('fatal: a commit in this repository holds more files than this practice terminal can'); out[p] = { mode: e.mode, id: e.id }; } }
    };
    if (treeId) go(treeId, '', 0);
    return out;
  }
  const commitTree = (R, id) => id ? flat(R, R.objs[id].tree) : dict();
  /** make the tree objects for { path → {mode, id} }; → the root tree's id */
  function writeTree(R, files) {
    const root = { dirs: dict(), files: [] };
    for (const p of Object.keys(files)) { const parts = p.split('/'); let n = root; for (let i = 0; i < parts.length - 1; i++) n = n.dirs[parts[i]] || (n.dirs[parts[i]] = { dirs: dict(), files: [] }); n.files.push({ mode: files[p].mode, name: parts[parts.length - 1], id: files[p].id }); }
    const make = (n) => { const es = n.files.slice(); for (const d in n.dirs) es.push({ mode: '40000', name: d, id: make(n.dirs[d]) }); es.sort(byTreeKey); return store(R, { type: 'tree', entries: es }); };
    return make(root);
  }
  const text = (R, id) => R.objs[id].text;
  const peel = (R, id) => { let n = 0; while (id && R.objs[id] && R.objs[id].type === 'tag' && n++ < 10) id = R.objs[id].object; return id && R.objs[id] && R.objs[id].type === 'commit' ? id : null; };
  /** a name for an object, before ~ and ^: HEAD, a tag, a branch, or the start of an id (4 or more hex digits) */
  function nameToId(R, s) {
    if (s === 'HEAD' || s === '@') return headId(R);
    if (/^(MERGE_HEAD|ORIG_HEAD|CHERRY_PICK_HEAD|REVERT_HEAD)$/.test(s)) return readId(R, s);
    if (s === 'stash' || s === 'refs/stash') return readId(R, 'refs/stash');
    let m;
    if ((m = /^(?:refs\/)?stash@\{(\d{1,9})\}$/.exec(s))) { const e = stashList(R)[+m[1]]; return e ? e.id : null; }
    if ((m = /^refs\/(heads|tags)\/(.+)$/.exec(s))) { const id = refId(R, m[1], m[2]); return id === 'broken' ? null : id; }
    for (const kind of ['tags', 'heads']) { const id = refId(R, kind, s); if (id && id !== 'broken') return id; }
    if (/^[0-9a-f]{4,40}$/.test(s)) {
      const hits = Object.keys(R.objs).filter((id) => id.startsWith(s));
      if (hits.length > 1) die('error: short object ID ' + s + ' is ambiguous');
      if (hits.length === 1) return hits[0];
    }
    return null;
  }
  /** a revision (main, HEAD~2, v1.0, a1b2c3d, HEAD^2) → a commit id, or null */
  function resolve(R, spec) {
    const m = /^(.+?)((?:[~^][0-9]{0,4})*)$/.exec(spec); if (!m) return null;
    let id = peel(R, nameToId(R, m[1]));
    for (const op of m[2].match(/[~^][0-9]*/g) || []) {
      if (!id) return null;
      const n = op.length > 1 ? +op.slice(1) : 1;
      if (op[0] === '~') { for (let k = 0; k < n && id; k++) id = R.objs[id].parents[0] || null; }
      else if (n > 0) id = R.objs[id].parents[n - 1] || null;
    }
    return id;
  }
  const mustResolve = (R, spec) => resolve(R, spec) || badRev(spec);
  /** rev:path → the blob or tree it names; a plain name → the object (tags are not peeled, as in cat-file) */
  function resolveObject(R, spec) {
    const i = spec.indexOf(':');
    if (i < 0) { const id = nameToId(R, spec.replace(/[~^].*$/, '')); return /[~^]/.test(spec) ? resolve(R, spec) : id; }
    const c = i === 0 ? null : resolve(R, spec.slice(0, i)), p = spec.slice(i + 1).replace(/^\.?\//, '').replace(/\/$/, '');
    if (i === 0) { const e = R.index[p]; return e ? e.id : null; }
    if (!c) badRev(spec.slice(0, i));
    let id = R.objs[c].tree; if (p === '') return id;
    for (const part of p.split('/')) { const e = R.objs[id].type === 'tree' && R.objs[id].entries.find((x) => x.name === part); if (!e) die("fatal: path '" + p + "' does not exist in '" + spec.slice(0, i) + "'"); id = e.id; }
    return id;
  }
  const subject = (msg) => msg.split(/\n\s*\n/)[0].trim().split('\n').map((l) => l.trim()).join(' ');
  /** the commits reachable from the starts, newest first; ties are kept in the order they were met (as git's date queue does) */
  function walk(R, starts) {
    const seen = dict(), out = [], queue = []; let seq = 0;
    const push = (id) => { if (id && !seen[id]) { seen[id] = 1; queue.push({ id, ts: R.objs[id].committer.ts, seq: seq++ }); } };
    starts.forEach(push);
    while (queue.length) {
      let best = 0; for (let k = 1; k < queue.length; k++) { const a = queue[k], b = queue[best]; if (a.ts > b.ts || (a.ts === b.ts && a.seq < b.seq)) best = k; }
      const { id } = queue.splice(best, 1)[0]; out.push(id); R.objs[id].parents.forEach(push);
    }
    return out;
  }
  const ancestors = (R, id) => { const s = dict(), todo = [id]; while (todo.length) { const c = todo.pop(); if (!c || s[c]) continue; s[c] = 1; todo.push(...R.objs[c].parents); } return s; };
  /** the best common ancestor of two commits (one that is not an ancestor of another common one; the newest if there are several) */
  function mergeBase(R, a, b) {
    const A = ancestors(R, a), common = walk(R, [b]).filter((id) => A[id]);
    const best = common.filter((c) => !common.some((d) => d !== c && ancestors(R, d)[c]));
    return best[0] || null;
  }

  // ----- the working tree. Files under any .git are never part of it; .gitignore files (in any directory) mark files to leave alone.
  function ignoreRules(textOf, base) {
    const rules = [];
    for (let l of textOf.split('\n').slice(0, 300)) {
      l = l.replace(/(^|[^\\])\s+$/, '$1'); if (l === '' || l[0] === '#') continue;
      const neg = l[0] === '!'; if (neg) l = l.slice(1);
      const dirOnly = l.endsWith('/'); if (dirOnly) l = l.slice(0, -1);
      const anchored = l.includes('/'); l = l.replace(/^\//, '');
      if (!l) continue;
      let re = '';
      for (let i = 0; i < l.length; i++) {
        const c = l[i];
        if (c === '*') { if (l[i + 1] === '*') { if (l[i + 2] === '/') { re += '(?:.*/)?'; i += 2; } else { re += '.*'; i++; } } else re += '[^/]*'; }
        else if (c === '?') re += '[^/]';
        else if (c === '[') { const j = l.indexOf(']', i + 2); if (j < 0) { re += '\\['; continue; } let b = l.slice(i + 1, j); if (b[0] === '!') b = '^' + b.slice(1); re += '[' + b.replace(/\\/g, '\\\\') + ']'; i = j; }
        else if (c === '\\' && i + 1 < l.length) { i++; re += l[i].replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&'); }
        else re += c.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
      }
      try { rules.push({ re: new RegExp('^' + re + '$'), neg, dirOnly, anchored, base }); } catch (e) { /* a pattern git would not understand either: skipped */ }
    }
    return rules;
  }
  function ignored(rules, p, isDir) {
    let ign = false;
    for (const r of rules) {
      if (r.dirOnly && !isDir) continue;
      if (r.base && !p.startsWith(r.base + '/')) continue;
      const rel = r.base ? p.slice(r.base.length + 1) : p;
      if (r.re.test(r.anchored ? rel : rel.slice(rel.lastIndexOf('/') + 1))) ign = !r.neg;
    }
    return ign;
  }
  /** every file of the working tree: { path → { node, ign } } */
  function scan(R) {
    const out = dict(), fs = R.fs;
    const go = (abs, rel, rules, ign, depth) => {
      const n = fs.stat(abs); if (!n || n.t !== 'd' || depth > LIMITS.depth) return;
      if (has(n.c, '.gitignore') && n.c['.gitignore'].t === 'f') rules = rules.concat(ignoreRules(n.c['.gitignore'].d, rel));
      for (const name of Object.keys(n.c).sort()) {
        if (name === '.git') continue;
        const child = n.c[name], p = join(rel, name), childAbs = (abs === '/' ? '' : abs) + '/' + name;
        if (child.t === 'd') go(childAbs, p, rules, ign || ignored(rules, p, true), depth + 1);
        else out[p] = { node: child, ign: ign || ignored(rules, p, false) };
      }
    };
    go(R.root, '', [], false, 0);
    return out;
  }
  const workEntry = (w) => ({ mode: modeOf(w.node), text: w.node.d });
  const sameAsWork = (R, e, w) => !!e && !!w && w.node.d === text(R, e.id) && modeOf(w.node) === e.mode;
  const same = (x, y) => (!x && !y) || (!!x && !!y && x.id === y.id && x.mode === y.mode);
  function writeWork(R, p, e) {
    const abs = R.abs(p), fs = R.fs, n = fs.stat(abs);
    fs.mkdir(abs.slice(0, abs.lastIndexOf('/')) || '/', true);
    if (n && n.t === 'd') { if (fs.list(abs).length) die("error: cannot write '" + p + "': there is a directory with files in the way"); fs.rmdir(abs); }
    fs.write(abs, text(R, e.id)); fs.chmod(abs, e.mode === '100755');
  }
  function removeWork(R, p) {
    const fs = R.fs; let abs = R.abs(p);
    if (fs.isFile(abs)) fs.unlink(abs);
    for (abs = abs.slice(0, abs.lastIndexOf('/')); abs.length > R.root.length; abs = abs.slice(0, abs.lastIndexOf('/'))) { if (fs.isDir(abs) && !fs.list(abs).length && abs !== fs.cwd) fs.rmdir(abs); else break; }   // git removes directories it empties
  }
  /** before files are written: will they fit? (a checkout must not stop half way because the disk is full) */
  function room(R, plan, work) {
    const u = R.fs.usage(); let files = u.files, bytes = u.bytes;
    for (const [p, e] of plan) { const w = work[p]; if (w) { files--; bytes -= w.node.d.length; } if (e) { files++; bytes += text(R, e.id).length; } }
    if (files > LIMITS.files || bytes > LIMITS.bytes) die('fatal: there is not enough space in this practice terminal for those files (' + (files > LIMITS.files ? files + ' files; the limit is ' + LIMITS.files : KB(bytes) + '; the limit is ' + KB(LIMITS.bytes)) + ')');
  }
  function applyPlan(R, plan, work) { room(R, plan, work); for (const [p, e] of plan) { if (e) writeWork(R, p, e); else removeWork(R, p); } }

  // ----- paths named on the command line (relative to where you are; quoted wildcards are git's own: *.txt matches in every directory)
  function pathspec(R, arg) {
    const rel = R.relOf(R.fs.resolve(arg));
    if (rel === null) die('fatal: ' + arg + ": '" + arg + "' is outside repository at '" + R.root + "'");
    let re = null;
    if (/[*?[]/.test(arg)) { try { re = new RegExp('^' + rel.split('').map((c) => c === '*' ? '.*' : c === '?' ? '.' : c === '[' || c === ']' ? c : c.replace(/[.+^${}()|\\\/]/g, '\\$&')).join('') + '(?:/.*)?$'); } catch (e) { re = null; } }
    return { arg, rel, re };
  }
  const matches = (s, p) => s.re ? s.re.test(p) : (s.rel === '' || p === s.rel || p.startsWith(s.rel + '/'));
  const specs = (R, args) => args.map((a) => pathspec(R, a));
  const anyMatch = (ss, p) => ss.some((s) => matches(s, p));
  const shown = (R, p) => relPath(R.cwdRel, p);
  const shownDir = (R, d) => { const r = relPath(R.cwdRel, d); return r === '' ? './' : r + '/'; };

  /* ---------------- status ---------------- */
  function changes(R, work) {
    work = work || scan(R);
    const head = commitTree(R, R.statusBase !== undefined ? R.statusBase : headId(R)), idx = R.index, conf = R.conflicts;   // (git commit --amend's template compares with the commit before)
    const staged = [], unstaged = [], untracked = [], unmerged = [];
    const paths = Object.keys(Object.assign(dict(), head, idx)).filter((p) => !conf[p]).sort();
    for (const p of paths) { const h = head[p], i = idx[p]; if (!h) staged.push({ kind: 'new', path: p, id: i.id }); else if (!i) staged.push({ kind: 'deleted', path: p, id: h.id }); else if (!same(h, i)) staged.push({ kind: 'modified', path: p }); }
    // exact renames: a deleted file and a new one with the same contents
    for (const n of staged.filter((s) => s.kind === 'new')) { const d = staged.find((s) => s.kind === 'deleted' && s.id === n.id); if (d) { n.kind = 'renamed'; n.from = d.path; staged.splice(staged.indexOf(d), 1); } }
    for (const p of Object.keys(idx).sort()) { const w = work[p]; if (!w) unstaged.push({ kind: 'deleted', path: p }); else if (!sameAsWork(R, idx[p], w)) unstaged.push({ kind: 'modified', path: p }); }
    for (const p of Object.keys(conf).sort()) { const c = conf[p]; unmerged.push({ path: p, code: !c.base ? (c.ours && c.theirs ? 'AA' : c.ours ? 'AU' : 'UA') : c.ours && c.theirs ? 'UU' : c.ours ? 'UD' : c.theirs ? 'DU' : 'DD' }); }
    const trackedDirs = dict();
    for (const p of Object.keys(idx).concat(Object.keys(conf))) { const parts = p.split('/'); for (let k = 1; k < parts.length; k++) trackedDirs[parts.slice(0, k).join('/')] = 1; }
    const seen = dict();
    for (const p of Object.keys(work).sort()) {
      if (idx[p] || conf[p] || work[p].ign) continue;
      const parts = p.split('/'); let show = p, dir = false;
      for (let k = 1; k < parts.length; k++) { const d = parts.slice(0, k).join('/'); if (!trackedDirs[d]) { show = d; dir = true; break; } }   // a directory with nothing tracked shows as dir/
      if (!seen[show]) { seen[show] = 1; untracked.push({ path: show, dir }); }
    }
    return { staged, unstaged, untracked, unmerged, work };
  }
  const LABEL = { new: 'new file:   ', modified: 'modified:   ', deleted: 'deleted:    ', renamed: 'renamed:    ' };
  const CONFLICT_LABEL = { UU: 'both modified:   ', AA: 'both added:      ', UD: 'deleted by them: ', DU: 'deleted by us:   ', AU: 'added by us:     ', UA: 'added by them:   ', DD: 'both deleted:    ' };
  function branchLine(R) {
    if (R.head.branch) return 'On branch ' + R.head.branch;
    const last = reflog(R).find((e) => e.msg.startsWith('checkout: moving from '));
    const to = last ? last.msg.replace(/^checkout: moving from .* to /, '') : '';
    const at = last && last.id === R.head.id;
    const name = to && !HEX40.test(to) && (refId(R, 'tags', to) || refId(R, 'heads', to)) ? to : short(last ? last.id : R.head.id);
    return 'HEAD detached ' + (at || !last ? 'at ' : 'from ') + name;
  }
  /** a merge, cherry-pick or revert that stopped for the student: { kind, id } or null (MERGE_HEAD, CHERRY_PICK_HEAD, REVERT_HEAD hold commit ids) */
  function inProgress(R) {
    for (const [kind, file] of [['merge', 'MERGE_HEAD'], ['cherry-pick', 'CHERRY_PICK_HEAD'], ['revert', 'REVERT_HEAD']]) { const id = readId(R, file); if (id) return { kind, id }; }
    return null;
  }
  /** git status, long form; forCommit: the words git commit uses when there is nothing to commit; noHints: as in a commit message's template */
  function statusLong(R, out, forCommit, noHints) {
    const c = changes(R), unborn = !headId(R), op = inProgress(R), merging = !!op && op.kind === 'merge', hint = (t) => noHints ? '' : t;
    const fromCommit = !op || op.kind === 'revert';   // as git's "whence": during a merge or a cherry-pick there are no "to unstage" hints
    const unstageHint = fromCommit ? hint(unborn ? '  (use "git rm --cached <file>..." to unstage)\n' : '  (use "git restore --staged <file>..." to unstage)\n') : '';
    let s = branchLine(R) + '\n';
    if (unborn) s += '\n' + (forCommit ? 'Initial commit' : 'No commits yet') + '\n\n';
    if (merging) s += c.unmerged.length ? 'You have unmerged paths.\n' + hint('  (fix conflicts and run "git commit")\n  (use "git merge --abort" to abort the merge)\n') + '\n' : 'All conflicts fixed but you are still merging.\n' + hint('  (use "git commit" to conclude merge)\n') + '\n';
    else if (op) {
      const k = op.kind;
      s += 'You are currently ' + (k === 'revert' ? 'reverting' : 'cherry-picking') + ' commit ' + short(op.id) + '.\n' + hint((c.unmerged.length ? '  (fix conflicts and run "git ' + k + ' --continue")\n' : '  (all conflicts fixed: run "git ' + k + ' --continue")\n') +
        '  (use "git ' + k + ' --skip" to skip this patch)\n  (use "git ' + k + ' --abort" to cancel the ' + k + ' operation)\n') + '\n';
    }
    if (c.staged.length) {
      s += 'Changes to be committed:\n' + unstageHint;
      for (const e of c.staged) s += '\t' + LABEL[e.kind] + (e.kind === 'renamed' ? cq(shown(R, e.from)) + ' -> ' : '') + cq(shown(R, e.path)) + '\n';
      s += '\n';
    }
    if (c.unmerged.length) {
      s += 'Unmerged paths:\n' + unstageHint + hint(c.unmerged.every((e) => e.code === 'UU' || e.code === 'AA') ? '  (use "git add <file>..." to mark resolution)\n' : '  (use "git add/rm <file>..." as appropriate to mark resolution)\n');
      for (const e of c.unmerged) s += '\t' + CONFLICT_LABEL[e.code] + cq(shown(R, e.path)) + '\n';
      s += '\n';
    }
    if (c.unstaged.length) {
      s += 'Changes not staged for commit:\n' + hint('  (use "git add' + (c.unstaged.some((e) => e.kind === 'deleted') ? '/rm' : '') + ' <file>..." to update what will be committed)\n  (use "git restore <file>..." to discard changes in working directory)\n');
      for (const e of c.unstaged) s += '\t' + LABEL[e.kind] + cq(shown(R, e.path)) + '\n';
      s += '\n';
    }
    if (c.untracked.length) {
      s += 'Untracked files:\n' + hint('  (use "git add <file>..." to include in what will be committed)\n');
      for (const e of c.untracked) s += '\t' + cq(e.dir ? shownDir(R, e.path) : shown(R, e.path)) + '\n';
      s += '\n';
    }
    if (!c.staged.length && !noHints && R.statusAmend) s += 'No changes\n';   // (git commit --amend that would leave nothing)
    else if (!c.staged.length && !noHints) s += c.unstaged.length || c.unmerged.length ? 'no changes added to commit (use "git add" and/or "git commit -a")\n' : c.untracked.length ? 'nothing added to commit but untracked files present (use "git add" to track)\n' : unborn ? 'nothing to commit (create/copy files and use "git add" to track)\n' : 'nothing to commit, working tree clean\n';
    out(s);
    return c;
  }
  function statusShort(R, io, branch) {
    const c = changes(R), rows = dict();
    const row = (p) => rows[p] || (rows[p] = { x: ' ', y: ' ', p, from: null });
    for (const e of c.staged) { const r = row(e.path); r.x = e.kind === 'new' ? 'A' : e.kind === 'deleted' ? 'D' : e.kind === 'renamed' ? 'R' : 'M'; r.from = e.from || null; }
    for (const e of c.unstaged) row(e.path).y = e.kind === 'deleted' ? 'D' : 'M';
    for (const e of c.unmerged) { const r = row(e.path); r.x = e.code[0]; r.y = e.code[1]; }
    let s = '';
    if (branch) s += '## ' + (R.head.branch ? (headId(R) ? R.head.branch : 'No commits yet on ' + R.head.branch) : 'HEAD (no branch)') + '\n';
    for (const p of Object.keys(rows).sort()) { const r = rows[p]; s += r.x + r.y + ' ' + (r.from ? cq(shown(R, r.from), true) + ' -> ' : '') + cq(shown(R, p), true) + '\n'; }
    for (const e of c.untracked) s += '?? ' + cq(e.dir ? shownDir(R, e.path) : shown(R, e.path), true) + '\n';
    io.out(s);
  }

  /* ---------------- diffs ---------------- */
  // a change between two snapshots: { path, from?, a: {mode, id}|null, b: {mode, id?, text?}|null }; b.text when it is a file in the working tree
  const textOf = (R, e) => e.text !== undefined ? e.text : text(R, e.id);
  const idOfEntry = (e) => e.id || (e.id = blobId(e.text));
  function pairs(R, A, B, ss) {
    const out = [];
    for (const p of Object.keys(Object.assign(dict(), A, B)).sort()) {
      if (ss && ss.length && !anyMatch(ss, p)) continue;
      const a = A[p] || null, b = B[p] || null;
      if (a && b && a.mode === b.mode && (b.id ? a.id === b.id : textOf(R, a) === b.text)) continue;
      out.push({ path: p, a, b });
    }
    // exact renames
    for (const n of out.filter((x) => !x.a)) { const d = out.find((x) => !x.b && x.a && x.a.id === idOfEntry(n.b) && x.a.mode === n.b.mode); if (d) { n.from = d.path; n.a = d.a; out.splice(out.indexOf(d), 1); } }
    return out;
  }
  function patch(R, ch, io) {
    const tty = io.tty, put = (s, cls) => io.out(s, tty ? cls : undefined);
    for (const c of ch) {
      const ap = c.from || c.path, bp = c.path;
      let h = 'diff --git ' + cq('a/' + ap) + ' ' + cq('b/' + bp) + '\n';
      const aid = c.a ? c.a.id : ZERO, bid = c.b ? idOfEntry(c.b) : ZERO;
      if (!c.a) h += 'new file mode ' + c.b.mode + '\n'; else if (!c.b) h += 'deleted file mode ' + c.a.mode + '\n';
      else { if (c.from) h += 'similarity index 100%\nrename from ' + cq(ap) + '\nrename to ' + cq(bp) + '\n'; if (c.a.mode !== c.b.mode) h += 'old mode ' + c.a.mode + '\nnew mode ' + c.b.mode + '\n'; }
      if (aid !== bid) h += 'index ' + short(aid) + '..' + short(bid) + (c.a && c.b && c.a.mode === c.b.mode ? ' ' + c.a.mode : '') + '\n';
      const hs = aid === bid ? [] : hunks(c.a ? textOf(R, c.a) : '', c.b ? textOf(R, c.b) : '');
      if (hs.length) h += '--- ' + (c.a ? cq('a/' + ap) : '/dev/null') + '\n+++ ' + (c.b ? cq('b/' + bp) : '/dev/null') + '\n';
      put(h, 'hd');
      for (const hk of hs) {
        put(hk.head + '\n', 'dir');
        for (const [k, l] of hk.lines) put(k + l + (l.endsWith('\n') ? '' : '\n\\ No newline at end of file\n'), k === '+' ? 'exe' : k === '-' ? 'err' : undefined);
      }
    }
  }
  function renameName(a, b) {
    let p = 0; for (let i = 0; i < Math.min(a.length, b.length) && a[i] === b[i]; i++) if (a[i] === '/') p = i + 1;
    // as git's pprint_rename: the common end starts at a slash, and may share the prefix's last slash (src/{lib => }/util.py)
    const adj = p ? 1 : 0; let s = 0;
    for (let i = 1; a.length - i >= p - adj && b.length - i >= p - adj && a[a.length - i] === b[b.length - i]; i++) if (a[a.length - i] === '/') s = i;
    if (!p && !s) return a + ' => ' + b;
    return a.slice(0, p) + '{' + a.slice(p, Math.max(p, a.length - s)) + ' => ' + b.slice(p, Math.max(p, b.length - s)) + '}' + a.slice(a.length - s);
  }
  const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many);
  function summaryLine(rows) {
    const add = rows.reduce((s, r) => s + r.add, 0), del = rows.reduce((s, r) => s + r.del, 0);
    let s = ' ' + plural(rows.length, 'file changed', 'files changed');
    if (add || !del) s += ', ' + plural(add, 'insertion(+)', 'insertions(+)');
    if (del || !add) s += ', ' + plural(del, 'deletion(-)', 'deletions(-)');
    return s + '\n';
  }
  const statRows = (R, ch) => ch.map((c) => Object.assign({ name: c.from ? renameName(c.from, c.path) : c.path }, c.a && c.b && c.a.id === idOfEntry(c.b) ? { add: 0, del: 0 } : countLines(c.a ? textOf(R, c.a) : '', c.b ? textOf(R, c.b) : '')));
  function diffstat(R, ch, io, summaryOnly, unmerged) {
    const rows = statRows(R, ch); unmerged = unmerged || [];
    if (!summaryOnly) {
      const nameW = Math.max(0, ...rows.map((r) => r.name.length), ...unmerged.map((p) => p.length)), max = Math.max(0, ...rows.map((r) => r.add + r.del)), numW = Math.max(1, String(max).length);
      const width = Math.max(10, 80 - nameW - numW - 6);
      const scale = (n) => max <= width || !n ? n : Math.max(1, Math.round(n * width / max));
      let s = unmerged.map((p) => ' ' + p.padEnd(nameW) + ' | Unmerged\n').join('');
      for (const r of rows) s += ' ' + r.name.padEnd(nameW) + ' | ' + String(r.add + r.del).padStart(numW) + (r.add + r.del ? ' ' + '+'.repeat(scale(r.add)) + '-'.repeat(scale(r.del)) : '') + '\n';
      io.out(s);
    }
    if (rows.length) io.out(summaryLine(rows));
  }
  /** git diff during a conflict: the file against both sides at once (diff --cc). Column 1 is HEAD's side, column 2 the other branch's;
      as git's dense combined diff, only the parts that differ from both sides are shown */
  function combined(R, p, c, workText, io) {
    const res = splitL(workText), P = [c.ours, c.theirs].map((e) => splitL(text(R, e.id)));
    const inP = P.map(() => new Uint8Array(res.length)), lost = P.map(() => Array.from({ length: res.length + 1 }, () => []));
    P.forEach((pl, k) => { let i = 0, j = 0; for (const op of diffOps(pl, res)) { if (op === '=') { inP[k][j] = 1; i++; j++; } else if (op === '-') lost[k][j].push(pl[i++]); else j++; } });
    const rows = [];
    for (let j = 0; j <= res.length; j++) {
      const a = lost[0][j], b = lost[1][j]; let ia = 0, ib = 0;
      for (const op of diffOps(a, b)) { if (op === '=') { rows.push({ cols: '--', text: a[ia++], adv: [1, 1, 0] }); ib++; } else if (op === '-') rows.push({ cols: '- ', text: a[ia++], adv: [1, 0, 0] }); else rows.push({ cols: ' -', text: b[ib++], adv: [0, 1, 0] }); }
      if (j < res.length) rows.push({ cols: (inP[0][j] ? ' ' : '+') + (inP[1][j] ? ' ' : '+'), text: res[j], adv: [inP[0][j], inP[1][j], 1] });
    }
    const keep = new Uint8Array(rows.length);
    for (let s = 0; s < rows.length;) {
      if (rows[s].cols === '  ') { s++; continue; }
      let e = s; while (e < rows.length && rows[e].cols !== '  ') e++;
      const g = rows.slice(s, e);
      if ([0, 1].every((k) => g.some((r) => r.cols[k] !== ' '))) for (let t = Math.max(0, s - 3); t < Math.min(rows.length, e + 3); t++) keep[t] = 1;
      s = e;
    }
    io.out('diff --cc ' + cq(p) + '\nindex ' + short(c.ours.id) + ',' + short(c.theirs.id) + '..' + short(ZERO) + '\n--- ' + cq('a/' + p) + '\n+++ ' + cq('b/' + p) + '\n', io.tty ? 'hd' : undefined);
    const at = [0, 0, 0];
    for (let s = 0; s < rows.length;) {
      if (!keep[s]) { rows[s].adv.forEach((v, k) => { at[k] += v; }); s++; continue; }
      let e = s; const start = at.slice(), n = [0, 0, 0];
      while (e < rows.length && keep[e]) { rows[e].adv.forEach((v, k) => { n[k] += v; }); e++; }
      const range = (k) => (n[k] ? start[k] + 1 : start[k]) + ',' + n[k];
      io.out('@@@ -' + range(0) + ' -' + range(1) + ' +' + range(2) + ' @@@\n', io.tty ? 'dir' : undefined);
      for (let t = s; t < e; t++) { const r = rows[t]; io.out(r.cols + r.text + (r.text.endsWith('\n') ? '' : '\n\\ No newline at end of file\n')); }
      for (let k = 0; k < 3; k++) at[k] += n[k];
      s = e;
    }
  }
  // the lines under a commit's or merge's summary: create mode, delete mode, rename, mode change
  function modeLines(ch) {
    let s = '';
    for (const c of ch) {
      if (!c.a) s += ' create mode ' + c.b.mode + ' ' + cq(c.path) + '\n';
      else if (!c.b) s += ' delete mode ' + c.a.mode + ' ' + cq(c.path) + '\n';
      else { if (c.from) s += ' rename ' + renameName(c.from, c.path) + ' (100%)\n'; if (c.a.mode !== c.b.mode) s += ' mode change ' + c.a.mode + ' => ' + c.b.mode + ' ' + cq(c.path) + '\n'; }
    }
    return s;
  }

  /* ---------------- printing commits ---------------- */
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function gitDate(p) {
    const off = (p.tz[0] === '-' ? -1 : 1) * (+p.tz.slice(1, 3) * 60 + +p.tz.slice(3)), d = new Date((p.ts + off * 60) * 1000), two = (n) => String(n).padStart(2, '0');
    return DAYS[d.getUTCDay()] + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCDate() + ' ' + two(d.getUTCHours()) + ':' + two(d.getUTCMinutes()) + ':' + two(d.getUTCSeconds()) + ' ' + d.getUTCFullYear() + ' ' + p.tz;
  }
  /** id → the names to show beside it: (HEAD -> main, tag: v1, feature), in git's order */
  function decorations(R) {
    const out = dict(), add = (id, s) => { (out[id] || (out[id] = [])).push(s); };
    const refs = listRefs(R, 'heads').map((r) => ({ id: r.id, s: r.name, branch: r.name })).concat(stashRef(R).map((r) => ({ id: r.id, s: 'refs/stash' })), listRefs(R, 'tags').map((r) => ({ id: peel(R, r.id), s: 'tag: ' + r.name })));
    for (const r of refs.reverse()) if (r.id) add(r.id, r);
    const h = headId(R, true);
    if (h) { const list = out[h] || (out[h] = []); const k = R.head.branch ? list.findIndex((r) => r.branch === R.head.branch) : -1; const head = k >= 0 ? { s: 'HEAD -> ' + R.head.branch } : { s: 'HEAD' }; if (k >= 0) list.splice(k, 1); list.unshift(head); }
    const text = dict(); for (const id in out) text[id] = ' (' + out[id].map((r) => r.s).join(', ') + ')';
    return text;
  }
  const indent = (msg) => msg.replace(/\n+$/, '').split('\n').map((l) => '    ' + l).join('\n') + '\n';
  function format(R, id, fmt, deco) {
    const c = R.objs[id], parts = msg2(c.message);
    const map = { H: id, h: short(id), T: c.tree, t: short(c.tree), P: c.parents.join(' '), p: c.parents.map(short).join(' '), an: c.author.name, ae: c.author.email, ad: gitDate(c.author), cn: c.committer.name, ce: c.committer.email, cd: gitDate(c.committer), s: parts.subject, b: parts.body, B: c.message, n: '\n', d: deco[id] || '', D: (deco[id] || '').replace(/^ \(|\)$/g, ''), '%': '%' };
    return fmt.replace(/%(an|ae|ad|cn|ce|cd|[HhTtPpsbBndD%])/g, (m, k) => map[k]);
  }
  const msg2 = (m) => { const k = m.search(/\n\s*\n/); return { subject: subject(m), body: k < 0 ? '' : m.slice(k).replace(/^\s*\n/, '').replace(/\n*$/, '\n').replace(/^\n$/, '') }; };
  function showCommit(R, id, io, o, deco) {
    const c = R.objs[id], tty = io.tty, d = o.decorate ? deco[id] || '' : '';
    let line = null;
    if (o.format !== undefined) { line = format(R, id, o.format, deco); if (line !== '') io.out(line + '\n'); }
    else if (o.oneline) { io.out(short(id), tty ? 'hd' : undefined); io.out(d + ' ' + subject(c.message) + '\n'); }
    else {
      io.out('commit ' + id, tty ? 'hd' : undefined); io.out(d + '\n');
      if (c.parents.length > 1) io.out('Merge: ' + c.parents.map(short).join(' ') + '\n');
      io.out('Author: ' + c.author.name + ' <' + c.author.email + '>\nDate:   ' + gitDate(c.author) + '\n\n' + indent(c.message));
    }
    if (o.patch || o.stat) {
      if (c.parents.length > 1) return;   // a merge's combined diff is not shown here
      const ch = pairs(R, commitTree(R, c.parents[0]), commitTree(R, id));
      if (!ch.length) return;
      if (o.oneline ? false : o.format !== undefined ? line !== '' : true) io.out('\n');   // as git: a blank line after the message, none after --oneline or an empty --format
      if (o.stat) diffstat(R, ch, io); if (o.stat && o.patch) io.out('\n');
      if (o.patch) patch(R, ch, io);
    }
  }

  /* ---------------- git log --graph: git's graph.c, ported (without the colours) ---------------- */
  // --graph implies --topo-order: as git's sort_in_topological_order in "graph order", a commit comes after all its children, and the
  // tips and the parents that become ready are taken last-in first-out, so a merge's second parent's line is drawn first.
  function topo(R, list) {
    const indeg = dict(); for (const id of list) indeg[id] = 1;
    for (const id of list) for (const p of R.objs[id].parents) if (indeg[p]) indeg[p]++;
    const stack = list.filter((id) => indeg[id] === 1).reverse(), out = [];
    while (stack.length) {
      const c = stack.pop();
      for (const p of R.objs[c].parents) { if (!indeg[p]) continue; if (--indeg[p] === 1) stack.push(p); }
      indeg[c] = 0; out.push(c);
    }
    return out;
  }
  const MERGE_CHARS = ['/', '|', '\\'];
  function makeGraph(R) {
    const PADDING = 0, SKIP = 1, PRE_COMMIT = 2, COMMIT = 3, POST_MERGE = 4, COLLAPSING = 5;
    const g = { commit: null, parents: [], numParents: 0, width: 0, expansionRow: 0, state: PADDING, prevState: PADDING, commitIndex: 0, prevCommitIndex: 0, mergeLayout: 0, edgesAdded: 0, prevEdgesAdded: 0, columns: [], newColumns: [], mapping: [], oldMapping: [], mappingSize: 0 };
    const setState = (s) => { g.prevState = g.state; g.state = s; };
    const at = (a, i) => a[i] === undefined ? -1 : a[i];
    function insert(c, idx) {
      let i = g.newColumns.indexOf(c), mi;
      if (i < 0) { i = g.newColumns.length; g.newColumns.push(c); }
      if (g.numParents > 1 && idx > -1 && g.mergeLayout === -1) {
        // the first parent of a merge: the merge line's layout depends on whether that parent is in a column to the left
        const dist = idx - i, shift = dist > 1 ? 2 * dist - 3 : 1;
        g.mergeLayout = dist > 0 ? 0 : 1;
        g.edgesAdded = g.numParents + g.mergeLayout - 2;
        mi = g.width + (g.mergeLayout - 1) * shift;
        g.width += 2 * g.mergeLayout;
      } else if (g.edgesAdded > 0 && i === at(g.mapping, g.width - 2)) { mi = g.width - 2; g.edgesAdded = -1; }   // the two edges join at once
      else { mi = g.width; g.width += 2; }
      g.mapping[mi] = i;
    }
    function updateColumns() {
      g.columns = g.newColumns; g.newColumns = [];
      g.mappingSize = 2 * (g.columns.length + g.numParents); g.mapping = Array(g.mappingSize).fill(-1);
      g.width = 0; g.prevEdgesAdded = g.edgesAdded; g.edgesAdded = 0;
      let seen = false;
      for (let i = 0; i <= g.columns.length; i++) {
        let cc; if (i === g.columns.length) { if (seen) break; cc = g.commit; } else cc = g.columns[i];
        if (cc === g.commit) { seen = true; g.commitIndex = i; g.mergeLayout = -1; for (const p of g.parents) insert(p, i); if (g.numParents === 0) g.width += 2; }
        else insert(cc, -1);
      }
      while (g.mappingSize > 1 && at(g.mapping, g.mappingSize - 1) < 0) g.mappingSize--;
    }
    const dashed = () => g.numParents + g.mergeLayout - 3;
    const needsPre = () => g.numParents >= 3 && g.commitIndex < g.columns.length - 1 && g.expansionRow < dashed() * 2;
    const correct = () => { for (let i = 0; i < g.mappingSize; i++) { const t = at(g.mapping, i); if (t >= 0 && t !== (i >> 1)) return false; } return true; };
    function update(id) {
      g.commit = id; g.parents = R.objs[id].parents.slice(); g.numParents = g.parents.length;
      g.prevCommitIndex = g.commitIndex;
      updateColumns();
      g.expansionRow = 0;
      g.state = g.state !== PADDING ? SKIP : needsPre() ? PRE_COMMIT : COMMIT;
    }
    const each = (fn) => { let seen = false; for (let i = 0; i <= g.columns.length; i++) { let cc; if (i === g.columns.length) { if (seen) break; cc = g.commit; } else cc = g.columns[i]; if (cc === g.commit) seen = true; fn(cc, i, seen); } };
    const LINES = [
      () => '| '.repeat(g.newColumns.length),
      () => { setState(needsPre() ? PRE_COMMIT : COMMIT); return '...'; },
      () => {
        let s = '', seen = false;
        g.columns.forEach((col, i) => {
          if (col === g.commit) { seen = true; s += '|' + ' '.repeat(g.expansionRow); }
          else if (seen && g.expansionRow === 0) s += g.prevState === POST_MERGE && g.prevCommitIndex < i ? '\\' : '|';
          else s += seen ? '\\' : '|';
          s += ' ';
        });
        g.expansionRow++; if (!needsPre()) setState(COMMIT);
        return s;
      },
      () => {
        let s = '';
        each((cc, i, seen) => {
          if (cc === g.commit) { s += '*'; if (g.numParents > 2) for (let k = 0, d = dashed(); k < d; k++) s += '-' + (k === d - 1 ? '.' : '-'); }
          else if (seen && g.edgesAdded > 1) s += '\\';
          else if (seen && g.edgesAdded === 1) s += g.prevState === POST_MERGE && g.prevEdgesAdded > 0 && g.prevCommitIndex < i ? '\\' : '|';
          else if (g.prevState === COLLAPSING && at(g.oldMapping, 2 * i + 1) === i && at(g.mapping, 2 * i) < i) s += '/';
          else s += '|';
          s += ' ';
        });
        setState(g.numParents > 1 ? POST_MERGE : correct() ? PADDING : COLLAPSING);
        return s;
      },
      () => {
        let s = '', parentCol = false;
        each((cc, i, seen) => {
          if (cc === g.commit) {
            let idx = g.mergeLayout;
            for (let j = 0; j < g.numParents; j++) { s += MERGE_CHARS[idx]; if (idx === 2) { if (g.edgesAdded > 0 || j < g.numParents - 1) s += ' '; } else idx++; }
            if (g.edgesAdded === 0) s += ' ';
          } else if (seen) s += (g.edgesAdded > 0 ? '\\' : '|') + ' ';
          else { s += '|'; if (g.mergeLayout !== 0 || i !== g.commitIndex - 1) s += parentCol ? '_' : ' '; }
          if (cc === g.parents[0]) parentCol = true;
        });
        setState(correct() ? PADDING : COLLAPSING);
        return s;
      },
      () => {
        let s = '', usedH = false, hEdge = -1, hTarget = -1;
        const old = g.mapping; g.mapping = g.oldMapping; g.oldMapping = old;
        for (let i = 0; i < g.mappingSize; i++) g.mapping[i] = -1;
        for (let i = 0; i < g.mappingSize; i++) {
          const t = at(g.oldMapping, i); if (t < 0) continue;
          if (t * 2 === i) g.mapping[i] = t;   // already in its place
          else if (at(g.mapping, i - 1) < 0) {   // nothing to the left: one step left
            g.mapping[i - 1] = t;
            if (hEdge === -1) { hEdge = i; hTarget = t; for (let j = t * 2 + 3; j < i - 2; j += 2) g.mapping[j] = t; }
          } else if (at(g.mapping, i - 1) !== t) {   // a line to the left that is not ours: cross it
            g.mapping[i - 2] = t;
            if (hEdge === -1) { hTarget = t; hEdge = i - 1; for (let j = t * 2 + 3; j < i - 2; j += 2) g.mapping[j] = t; }
          }
        }
        if (at(g.mapping, g.mappingSize - 1) < 0) g.mappingSize--;
        for (let i = 0; i < g.mappingSize; i++) {
          const t = at(g.mapping, i);
          if (t < 0) s += ' ';
          else if (t * 2 === i) s += '|';
          else if (t === hTarget && i !== hEdge - 1) { if (i !== t * 2 + 3) g.mapping[i] = -1; usedH = true; s += '_'; }
          else { if (usedH && i < hEdge) g.mapping[i] = -1; s += '/'; }
        }
        if (correct()) setState(PADDING);
        g.oldMapping = g.mapping.slice();   // the next commit's line looks at where the lines went
        return s;
      },
    ];
    const pad = (s) => s.length < g.width ? s + ' '.repeat(g.width - s.length) : s;
    const next = () => { const shown = g.state === COMMIT; return { s: pad(LINES[g.state]()), shown }; };
    const finished = () => g.state === PADDING;
    return {
      update,
      /** the graph's lines down to the commit's own, that last one without its newline */
      showCommit() { let out = '', shown = false; while (!shown && !finished()) { const r = next(); out += r.s; shown = r.shown; if (!shown) out += '\n'; } return out; },
      /** the graph's next line, to go before a line of the message */
      oneline: () => next().s,
      /** the line between two commits (graph_show_padding) */
      padding() {
        if (g.state !== COMMIT) return next().s;
        let s = ''; for (const col of g.columns) s += '|' + (col === g.commit && g.numParents > 2 ? ' '.repeat((g.numParents - 2) * 2) : ' ');
        g.prevState = PADDING; return pad(s);
      },
      /** the message with the graph before each of its lines, and the rest of the graph for this commit after it */
      showMsg(sb) {
        let out = ''; const parts = sb.split(/(?<=\n)/);
        parts.forEach((p, k) => { out += p; if (p.endsWith('\n') && k < parts.length - 1) out += next().s; });
        if (!finished()) {
          const nl = sb.endsWith('\n'); if (!nl) out += '\n';
          for (;;) { out += next().s; if (finished()) break; out += '\n'; }
          if (nl) out += '\n';
        }
        return out;
      },
    };
  }

  /* ---------------- options ---------------- */
  // spec: { name: key } where key ending in '=' takes a value, '[]' collects values; '#' allows -3 for -n 3. → { o, rest, dd } (dd: where -- was)
  function getopt(args, spec, cmd) {
    const o = dict(), rest = []; let dd = -1;
    const set = (key, name, v, isShort) => {
      if (key.endsWith('[]')) { const k = key.slice(0, -2); (o[k] || (o[k] = [])).push(v); } else if (key.endsWith('=')) o[key.slice(0, -1)] = v; else o[key] = true;
    };
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (dd >= 0 || a === '-' || !a.startsWith('-')) { rest.push(a); continue; }
      if (a === '--') { dd = rest.length; continue; }
      if (spec['#'] && /^-\d+$/.test(a)) { o[spec['#']] = a.slice(1); continue; }
      if (a.startsWith('--')) {
        let name = a.slice(2), v; const eq = name.indexOf('='); if (eq >= 0) { v = name.slice(eq + 1); name = name.slice(0, eq); }
        if (!has(spec, name) && name.startsWith('no-') && has(spec, name.slice(3)) && !/[=\]]$/.test(spec[name.slice(3)]) && v === undefined) { o[spec[name.slice(3)]] = false; continue; }
        if (!has(spec, name)) die("error: unknown option `" + name + "'\nusage: " + SUB[cmd].use, 129);
        const key = spec[name];
        if (/[=\]]$/.test(key)) { if (v === undefined) { v = args[++i]; if (v === undefined) die("error: option `" + name + "' requires a value", 129); } set(key, name, v); }
        else { if (v !== undefined) die("error: option `" + name + "' takes no value", 129); set(key, name); }
        continue;
      }
      for (let k = 1; k < a.length; k++) {
        const c = a[k];
        if (!has(spec, c)) die("error: unknown switch `" + c + "'\nusage: " + SUB[cmd].use, 129);
        const key = spec[c];
        if (/[=\]]$/.test(key)) { let v = a.slice(k + 1); if (v === '') { v = args[++i]; if (v === undefined) die("error: switch `" + c + "' requires a value", 129); } set(key, c, v); break; }
        set(key, c);
      }
    }
    return { o, rest, dd };
  }

  /* ---------------- the commands ---------------- */
  const SUB = dict();
  const sub = (names, spec) => { for (const n of names.split(' ')) SUB[n] = Object.assign({ name: n }, spec); };

  sub('init', { use: 'git init [-q] [-b <branch-name>] [<directory>]', desc: 'Create an empty Git repository or reinitialize an existing one',
    run(args, io, sh) {
      const { o, rest } = getopt(args, { q: 'quiet', quiet: 'quiet', b: 'branch=', 'initial-branch': 'branch=' }, 'init');
      const fs = sh.fs, dir = fs.resolve(rest[0] || '.'), gd = (dir === '/' ? '' : dir) + '/.git';
      const branch = o.branch || configGet(sh, null, 'init.defaultBranch') || 'main';
      if (!refOk(branch)) die("fatal: invalid initial branch name: '" + branch + "'");
      const again = fs.isDir(gd) && fs.isFile(gd + '/HEAD');
      try {
        fs.mkdir(dir, true);
        if (!again) {
          for (const d of ['refs/heads', 'refs/tags']) fs.mkdir(gd + '/' + d, true);
          fs.write(gd + '/HEAD', 'ref: refs/heads/' + branch + '\n');
          fs.write(gd + '/config', '[core]\n\trepositoryformatversion = 0\n\tfilemode = true\n\tbare = false\n\tlogallrefupdates = true\n');
          fs.write(gd + '/description', "Unnamed repository; edit this file 'description' to name the repository.\n");
        }
      } catch (e) { if (e instanceof FsError) die('fatal: cannot mkdir ' + gd + ': ' + e.message); throw e; }
      if (!o.quiet) io.out((again ? 'Reinitialized existing' : 'Initialized empty') + ' Git repository in ' + gd + '/\n');
      return 0;
    } });

  sub('status', { use: 'git status [-s] [-b]', desc: 'Show the working tree status',
    run(args, io, sh) {
      const { o } = getopt(args, { s: 'short', short: 'short', b: 'branch', branch: 'branch', 'long': 'long', porcelain: 'short' }, 'status');
      const R = openRepo(sh);
      if (o.short && !o.long) statusShort(R, io, o.branch); else statusLong(R, (s) => io.out(s));
      return 0;
    } });

  sub('add', { use: 'git add [-A | -u] [-f] [--] <pathspec>...', desc: 'Add file contents to the index',
    run(args, io, sh) {
      const { o, rest } = getopt(args, { A: 'all', all: 'all', u: 'update', update: 'update', f: 'force', force: 'force', v: 'verbose', verbose: 'verbose', n: 'dry', 'dry-run': 'dry' }, 'add');
      const R = openRepo(sh);
      if (!rest.length && !o.all && !o.update) { io.err("Nothing specified, nothing added.\nhint: Maybe you wanted to say 'git add .'?\nhint: Turn this message off by running\nhint: \"git config advice.addEmptyPathspec false\"\n"); return 0; }
      const ss = rest.length ? specs(R, rest) : [{ arg: '.', rel: '', re: null }];
      const work = scan(R), ign = [], picked = dict();
      for (const s of ss) {
        let hit = false;
        for (const p in work) if (matches(s, p) && (!work[p].ign || o.force || R.index[p]) && (!o.update || R.index[p] || R.conflicts[p])) { picked[p] = 1; hit = true; }
        for (const p of Object.keys(R.index).concat(Object.keys(R.conflicts))) if (matches(s, p)) { if (!work[p]) picked[p] = 1; hit = true; }
        if (!hit) { const named = Object.keys(work).filter((p) => matches(s, p) && work[p].ign); if (named.length) ign.push(s.arg); else if (!o.update && rest.length) die("fatal: pathspec '" + s.arg + "' did not match any files"); }
      }
      for (const p of Object.keys(picked).sort()) {
        const w = work[p];
        if (o.verbose || o.dry) io.out((w ? 'add ' : 'remove ') + q(shown(R, p)) + '\n');
        if (o.dry) continue;
        delete R.conflicts[p];
        if (!w) { delete R.index[p]; continue; }
        for (const k of Object.keys(R.index)) if (k.startsWith(p + '/') || p.startsWith(k + '/')) delete R.index[k];   // a file where a directory was, or the other way round
        R.index[p] = { mode: modeOf(w.node), id: store(R, { type: 'blob', text: w.node.d }) };
      }
      R.idxDirty = true; flush(R);
      if (ign.length) { io.err('The following paths are ignored by one of your .gitignore files:\n' + ign.join('\n') + '\nhint: Use -f if you really want to add them.\nhint: Turn this message off by running\nhint: "git config advice.addIgnoredFile false"\n'); return 1; }
      return 0;
    } });

  sub('rm', { use: 'git rm [--cached] [-r] [-f] [-q] [--] <file>...', desc: 'Remove files from the working tree and from the index',
    run(args, io, sh) {
      const { o, rest } = getopt(args, { cached: 'cached', r: 'r', f: 'force', force: 'force', q: 'quiet', quiet: 'quiet', n: 'dry', 'dry-run': 'dry' }, 'rm');
      const R = openRepo(sh);
      if (!rest.length) die('fatal: No pathspec was given. Which files should I remove?');
      const work = scan(R), head = commitTree(R, headId(R)), picked = [];
      for (const s of specs(R, rest)) {
        const hit = Object.keys(R.index).concat(Object.keys(R.conflicts)).filter((p) => matches(s, p));
        if (!hit.length) die("fatal: pathspec '" + s.arg + "' did not match any files");
        if (!o.r && !s.re && hit.some((p) => p !== s.rel)) die("fatal: not removing '" + s.arg + "' recursively without -r");
        for (const p of hit) if (!picked.includes(p)) picked.push(p);
      }
      picked.sort();
      if (!o.force) {
        const both = [], staged = [], local = [];
        for (const p of picked) {
          const i = R.index[p], w = work[p]; if (!i) continue;
          const stagedDiff = !same(i, head[p]), localDiff = w && !sameAsWork(R, i, w);
          if (stagedDiff && localDiff && !(w && head[p] && sameAsWork(R, head[p], w))) both.push(p); else if (!o.cached && stagedDiff) staged.push(p); else if (!o.cached && localDiff) local.push(p);
        }
        const list = (ps, one, many, tail) => 'error: the following ' + (ps.length === 1 ? one : many) + ':\n' + ps.map((p) => '    ' + shown(R, p) + '\n').join('') + tail + '\n';
        let msg = '';
        if (both.length) msg += list(both, 'file has staged content different from both the\nfile and the HEAD', 'files have staged content different from both the\nfile and the HEAD', '(use -f to force removal)');
        if (staged.length) msg += list(staged, 'file has changes staged in the index', 'files have changes staged in the index', '(use --cached to keep the file, or -f to force removal)');
        if (local.length) msg += list(local, 'file has local modifications', 'files have local modifications', '(use --cached to keep the file, or -f to force removal)');
        if (msg) { io.err(msg); return 1; }
      }
      for (const p of picked) {
        if (!o.quiet) io.out('rm ' + q(p) + '\n');
        if (o.dry) continue;
        delete R.index[p]; delete R.conflicts[p];
        if (!o.cached) removeWork(R, p);
      }
      R.idxDirty = true; flush(R);
      return 0;
    } });

  sub('mv', { use: 'git mv [-f] [-k] <source>... <destination>', desc: 'Move or rename a file, a directory, or a symlink',
    run(args, io, sh) {
      const { o, rest } = getopt(args, { f: 'force', force: 'force', k: 'skip', n: 'dry', 'dry-run': 'dry', v: 'verbose' }, 'mv');
      const R = openRepo(sh), fs = sh.fs;
      if (rest.length < 2) die('usage: git mv [<options>] <source>... <destination>', 129);
      const dstArg = rest.pop(), dst = pathspec(R, dstArg).rel, dstIsDir = fs.isDir(R.abs(dst));
      if (rest.length > 1 && !dstIsDir) die("fatal: destination '" + dstArg + "' is not a directory");
      const moves = [];
      for (const a of rest) {
        const src = pathspec(R, a).rel, target = dstIsDir ? join(dst, src.split('/').pop()) : dst, msg = (why) => 'fatal: ' + why + ', source=' + src + ', destination=' + target;
        const n = fs.stat(R.abs(src)), tracked = Object.keys(R.index).filter((p) => p === src || p.startsWith(src + '/'));
        let bad = null;
        if (!n) bad = msg('bad source'); else if (R.conflicts[src]) bad = msg('conflicted'); else if (!tracked.length) bad = msg('not under version control');
        else if (target === src || target.startsWith(src + '/')) bad = msg('can not move directory into itself');
        else if (fs.exists(R.abs(target)) && !(o.force && n.t === 'f' && fs.isFile(R.abs(target)))) bad = msg('destination exists');
        if (bad) { if (o.skip) continue; die(bad); }
        moves.push({ src, target, tracked });
      }
      for (const m of moves) {
        if (o.verbose || o.dry) io.out('Renaming ' + m.src + ' to ' + m.target + '\n');
        if (o.dry) continue;
        const abs = R.abs(m.target); fs.mkdir(abs.slice(0, abs.lastIndexOf('/')), true);
        if (o.force && fs.isFile(abs)) fs.unlink(abs);
        fs.move(R.abs(m.src), abs);
        for (const p of m.tracked) { R.index[m.target + p.slice(m.src.length)] = R.index[p]; delete R.index[p]; }
      }
      R.idxDirty = true; flush(R);
      return 0;
    } });

  sub('restore', { use: 'git restore [--staged] [--worktree] [--source=<tree>] [--] <pathspec>...', desc: 'Restore working tree files',
    run(args, io, sh) {
      const { o, rest } = getopt(args, { S: 'staged', staged: 'staged', W: 'worktree', worktree: 'worktree', s: 'source=', source: 'source=', q: 'quiet', quiet: 'quiet' }, 'restore');
      const R = openRepo(sh);
      if (!rest.length) die('fatal: you must specify path(s) to restore');
      const wt = o.worktree || !o.staged;
      return restorePaths(R, specs(R, rest), { staged: !!o.staged, worktree: wt, source: o.source !== undefined ? mustResolve(R, o.source) : o.staged ? headId(R) : null, sourceGiven: o.source !== undefined || o.staged }, io);
    } });
  /** restore, and checkout with paths: the index from a commit (staged), the working tree from the index or a commit.
      o: { staged, worktree, source (commit id), sourceGiven, checkout (a commit's version is staged too), side ('ours'|'theirs'|'merge'), count (say how many) } */
  function restorePaths(R, ss, o, io) {
    const work = scan(R), src = o.sourceGiven ? commitTree(R, o.source) : null;
    const pool = src || R.index, picked = [];
    for (const s of ss) {
      const hit = Object.keys(pool).concat(o.staged ? Object.keys(R.index) : [], Object.keys(R.conflicts)).filter((p) => matches(s, p));
      if (!hit.length) { io.err("error: pathspec '" + s.arg + "' did not match any file(s) known to git\n"); return 1; }
      for (const p of hit) if (!picked.includes(p)) picked.push(p);
    }
    picked.sort();
    const plan = [];
    if (o.side) {
      // --ours / --theirs: one side of a conflict into the file; -m: the conflict markers again. The conflict stays until git add.
      for (const p of picked) {
        const c = R.conflicts[p];
        if (!c) { const e = R.index[p]; if (e && !sameAsWork(R, e, work[p])) plan.push([p, e]); continue; }
        if (o.side === 'merge') { if (!c.ours || !c.theirs) continue; const m = merge3(c.base ? text(R, c.base.id) : '', text(R, c.ours.id), text(R, c.theirs.id), 'ours', 'theirs'); plan.push([p, { mode: c.ours.mode, id: store(R, { type: 'blob', text: m.text }) }]); continue; }
        const e = c[o.side]; if (!e) { io.err("error: path '" + shown(R, p) + "' does not have " + (o.side === 'ours' ? 'our' : 'their') + ' version\n'); return 1; }
        plan.push([p, e]);
      }
    } else if (o.worktree && !o.sourceGiven) { const un = picked.filter((p) => R.conflicts[p]); if (un.length) { io.err(un.map((p) => "error: path '" + shown(R, p) + "' is unmerged\n").join('')); return 1; } }
    if (o.staged) for (const p of picked) { delete R.conflicts[p]; if (src[p]) R.index[p] = src[p]; else delete R.index[p]; }
    if (o.worktree && !o.side) {
      for (const p of picked) { const e = src ? src[p] : R.index[p]; if (e) { if (!sameAsWork(R, e, work[p])) plan.push([p, e]); } else if (work[p] && (src ? (R.index[p] || (o.staged && commitTree(R, headId(R))[p])) : false)) plan.push([p, null]); }
      if (o.checkout && src) for (const p of picked) if (src[p]) { R.index[p] = src[p]; delete R.conflicts[p]; }   // checkout <commit> -- path stages it too
    }
    flush(R); applyPlan(R, plan, work);
    R.idxDirty = true; flush(R);
    if (o.count) io.err(o.side === 'merge' ? 'Recreated ' + plural(plan.length, 'merge conflict', 'merge conflicts') + '\n' : 'Updated ' + plural(plan.length, 'path', 'paths') + ' from ' + (src ? short(R.objs[o.source].tree) : 'the index') + '\n');
    return 0;
  }

  /* ---------------- messages in the editor ---------------- */
  // When the terminal has its nano (sh.hooks.nano), git opens it on .git/<file> as real git opens $EDITOR, and reads the file back when the
  // student leaves. → the text, or null when there is no editor here (node tests, a shell without the hook): the caller then does what it
  // did before there was an editor (a message is needed with -m). The hook may also answer with the final text (the node tests' fake editor).
  const hasEditor = (sh) => !!(sh.hooks && sh.hooks.nano);
  async function editMessage(R, file, template) {
    const sh = R.sh; if (!hasEditor(sh)) return null;
    gitWrite(R, file, template);
    const abs = R.gd + '/' + file;
    const write = (t) => { try { R.fs.write(abs, String(t)); return null; } catch (e) { if (!(e instanceof FsError)) throw e; return e.message; } };
    const res = await sh.hooks.nano(sh.tilde(abs), template, write);
    if (typeof res === 'string') { const err = write(res); if (err) die('error: could not write .git/' + file + ': ' + err); }
    const t = R.rd(file); return t === null ? '' : t;
  }
  // a status as the comment lines of a template: "# " before each line, "#" alone before an empty one or a tab
  const commented = (t) => t.replace(/\n$/, '').split('\n').map((l) => l === '' ? '#' : l[0] === '\t' ? '#' + l : '# ' + l).join('\n') + '\n';
  /** what git commit puts in the editor: the message so far, the merge or cherry-pick note, the instructions, who and when, the status */
  function commitTemplate(R, msg, op, idents) {
    let t = msg || '';
    if (op && op.kind !== 'revert') t += '#\n# It looks like you may be committing a ' + op.kind + '.\n# If this is not correct, please run\n#\tgit update-ref -d ' + (op.kind === 'merge' ? 'MERGE_HEAD' : 'CHERRY_PICK_HEAD') + '\n# and try again.\n\n';
    t += "\n# Please enter the commit message for your changes. Lines starting\n# with '#' will be ignored, and an empty message aborts the commit.\n";
    if (idents.length) t += '#\n' + idents.map((l) => '# ' + l + '\n').join('');
    let st = ''; statusLong(R, (s) => { st += s; }, true, true);
    return t + '#\n' + commented(st);
  }
  const MERGE_TEMPLATE = "# Please enter a commit message to explain why this merge is necessary,\n# especially if it merges an updated upstream into a topic branch.\n#\n# Lines starting with '#' will be ignored, and an empty message aborts\n# the commit.\n";
  const personText = (p) => p.name + ' <' + p.email + '> ' + p.ts + ' ' + p.tz;
  /** the lines under "[main abc1234] subject" that say whose and when, when git thinks they are worth saying */
  function identLines(c, dateShown) {
    const out = [];
    if (c.author.name !== c.committer.name || c.author.email !== c.committer.email) out.push('Author: ' + c.author.name + ' <' + c.author.email + '>');
    if (dateShown) out.push('Date: ' + gitDate(c.author));
    return out;
  }
  /** the summary a commit, a cherry-pick or a revert prints: [main abc1234] subject, then the stat and the mode lines (none for a merge) */
  function commitSummary(R, id, io, parentTree, dateShown) {
    const c = R.objs[id];
    io.out('[' + (R.head.branch ? R.head.branch : 'detached HEAD') + (!c.parents.length ? ' (root-commit)' : '') + ' ' + short(id) + '] ' + subject(c.message) + '\n');
    io.out(identLines(c, dateShown).map((l) => ' ' + l + '\n').join(''));
    if (c.parents.length < 2) { const ch = pairs(R, parentTree ? flat(R, parentTree) : dict(), flat(R, c.tree)); diffstat(R, ch, io, true); if (!ch.length) io.out(' 0 files changed\n'); io.out(modeLines(ch)); }
  }

  sub('commit', { use: 'git commit [-a] [-q] [--amend] [--allow-empty] [-m <msg>]', desc: 'Record changes to the repository',
    async run(args, io, sh) {
      const { o, rest } = getopt(args, { m: 'm[]', message: 'm[]', a: 'all', all: 'all', q: 'quiet', quiet: 'quiet', amend: 'amend', 'no-edit': 'noedit', 'allow-empty': 'empty', 'allow-empty-message': 'emptymsg', v: 'verbose', e: 'edit', edit: 'edit', F: 'file=', file: 'file=', cleanup: 'cleanup=' }, 'commit');
      if (o.cleanup !== undefined && !/^(strip|whitespace|verbatim|default)$/.test(o.cleanup)) die('fatal: Invalid cleanup mode ' + o.cleanup);
      const R = openRepo(sh);
      if (rest.length) die('fatal: this practice git commits what is staged: git add ' + rest.join(' ') + ', then git commit -m "message" (naming files on git commit is not available here)');
      if (o.all) {
        // -a stages every tracked file as it is now, conflicted ones too (as git: whatever is in the file, markers and all). Only in memory
        // until the commit is made, as git's temporary index.
        const work = scan(R);
        for (const p of Object.keys(R.conflicts)) { const w = work[p]; delete R.conflicts[p]; if (w) R.index[p] = { mode: modeOf(w.node), id: store(R, { type: 'blob', text: w.node.d }) }; }
        for (const p of Object.keys(R.index)) { const w = work[p]; if (!w) delete R.index[p]; else if (!sameAsWork(R, R.index[p], w)) R.index[p] = { mode: modeOf(w.node), id: store(R, { type: 'blob', text: w.node.d }) }; }
        R.idxDirty = true;
      }
      if (Object.keys(R.conflicts).length) die('error: Committing is not possible because you have unmerged files.\nhint: Fix them up in the work tree, and then use \'git add/rm <file>\'\nhint: as appropriate to mark resolution and make a commit.\nfatal: Exiting because of an unresolved conflict.\n' + Object.keys(R.conflicts).sort().map((p) => 'U\t' + shown(R, p)).join('\n'));
      const head = headId(R), op = inProgress(R), merge = op && op.kind === 'merge' ? op.id : null, pick = op && op.kind === 'cherry-pick' ? op.id : null;
      if (o.amend && !head) die('fatal: You have nothing to amend.');
      if (o.amend && merge) die('fatal: You are in the middle of a merge -- cannot amend.');
      if (o.amend && pick) die('fatal: You are in the middle of a cherry-pick -- cannot amend.');
      let msg, cleanup = 'whitespace';
      const saved = op ? R.rd('MERGE_MSG') : null;
      if (o.file !== undefined) { try { msg = sh.fs.read(sh.fs.resolve(o.file)); } catch (e) { die("fatal: could not read log file '" + o.file + "': No such file or directory"); } cleanup = 'strip'; }
      else if (o.m) msg = o.m.join('\n\n');
      else if (merge || saved !== null) { msg = saved || (merge ? 'Merge commit ' + q(short(merge)) + '\n' : ''); cleanup = o.noedit ? 'whitespace' : 'strip'; }   // as git: --no-edit keeps the # Conflicts lines, the editor's message drops them
      else if (o.amend) msg = R.objs[head].message;
      else msg = null;   // (said only when there is something to commit, as git opens its editor only then)
      const editing = hasEditor(sh) && !o.noedit && (o.edit || (o.m === undefined && o.file === undefined));
      const noEditor = () => die('error: there is no text editor for commit messages in this practice terminal, so give the message with -m:\n    git commit -m "Say what you changed"\nAborting commit due to empty commit message.', 1);
      const tree = writeTree(R, R.index), parentTree = o.amend ? (R.objs[head].parents[0] ? R.objs[R.objs[head].parents[0]].tree : null) : head ? R.objs[head].tree : null;
      if (!o.amend && !o.empty && !merge && (head ? tree === R.objs[head].tree : !Object.keys(R.index).length)) { flush(R); statusLong(R, (s) => io.out(s), true); return 1; }
      if (o.amend && !o.empty && R.objs[head].parents.length < 2 && (parentTree ? tree === parentTree : !Object.keys(R.index).length)) {
        flush(R); io.err('You asked to amend the most recent commit, but doing so would make\nit empty. You can repeat your command with --allow-empty, or you can\nremove the commit entirely with "git reset HEAD^".\n');
        R.statusBase = R.objs[head].parents[0] || null; R.statusAmend = true; statusLong(R, (s) => io.out(s), true); delete R.statusBase; return 1;
      }
      // whose: an amended commit keeps its author, a cherry-pick the picked commit's (and both say when that was)
      const old = o.amend ? R.objs[head] : pick ? R.objs[pick] : null, me = who(R);
      const author = old ? personText(old.author) : me;
      if (editing) {
        const meP = parseCommit('tree ' + ZERO + '\nauthor ' + author + '\ncommitter ' + me + '\n\n');
        const idents = identLines(meP, !!old).map((l) => l.replace(/^(Author|Date): /, (m, k) => k + ':' + ' '.repeat(k === 'Date' ? 6 : 4)));
        if (o.amend) R.statusBase = R.objs[head].parents[0] || null;
        const template = commitTemplate(R, msg, op, idents); delete R.statusBase;
        msg = cleanMessage(await editMessage(R, 'COMMIT_EDITMSG', template), 'strip');
      } else {
        if (msg === null) noEditor();   // nothing is written: -a staged only in memory, as git's temporary index
        if (o.cleanup === 'strip' || o.cleanup === 'whitespace') cleanup = o.cleanup;
        if (o.cleanup !== 'verbatim') msg = cleanMessage(msg, cleanup);
      }
      if (msg === '' && !o.emptymsg) { io.err('Aborting commit due to empty commit message.\n'); return 1; }
      const parents = o.amend ? old.parents : (head ? [head] : []).concat(merge ? [merge] : []);
      const raw = 'tree ' + tree + '\n' + parents.map((p) => 'parent ' + p + '\n').join('') + 'author ' + author + '\ncommitter ' + me + '\n\n' + msg;
      const id = store(R, parseCommit(raw));
      flush(R);
      setHead(R, id, (o.amend ? 'commit (amend)' : !head ? 'commit (initial)' : merge ? 'commit (merge)' : pick ? 'commit (cherry-pick)' : 'commit') + ': ' + subject(msg));
      for (const f of ['MERGE_HEAD', 'MERGE_MSG', 'CHERRY_PICK_HEAD', 'REVERT_HEAD']) gitRemove(R, f);
      if (!o.quiet) commitSummary(R, id, io, parentTree, !!old);
      return 0;
    } });
  // as git's message cleanup: trailing spaces and blank lines at the ends go; runs of blank lines become one; strip also drops # comments
  function cleanMessage(msg, mode) {
    let lines = String(msg).split('\n').map((l) => l.replace(/\s+$/, ''));
    if (mode === 'strip') lines = lines.filter((l) => !l.startsWith('#'));
    const out = []; for (const l of lines) { if (l === '' && (out.length === 0 || out[out.length - 1] === '')) continue; out.push(l); }
    while (out.length && out[out.length - 1] === '') out.pop();
    return out.length ? out.join('\n') + '\n' : '';
  }

  sub('log', { use: 'git log [--oneline] [-n <number>] [--all] [-p] [--stat] [<revision>...] [-- <path>...]', desc: 'Show commit logs',
    run(args, io, sh) {
      const { o, rest, dd } = getopt(args, { oneline: 'oneline', n: 'n=', 'max-count': 'n=', '#': 'n', all: 'all', decorate: 'decorate', p: 'patch', patch: 'patch', u: 'patch', stat: 'stat', format: 'format=', pretty: 'pretty=', graph: 'graph', reverse: 'reverse', 'abbrev-commit': 'abbrev' }, 'log');
      const R = openRepo(sh);
      const revs = dd >= 0 ? rest.slice(0, dd) : rest.slice(), paths = dd >= 0 ? rest.slice(dd) : [];
      const starts = [];
      for (const r of revs) { const id = resolve(R, r); if (id) starts.push(id); else if (dd < 0 && sh.fs.exists(sh.fs.resolve(r))) paths.push(r); else badRev(r); }
      if (o.all) { for (const k of ['heads', 'stash', 'tags']) for (const r of k === 'stash' ? stashRef(R) : listRefs(R, k)) { const id = peel(R, r.id); if (id) starts.push(id); } const h = headId(R, true); if (h) starts.push(h); }   // as git: the refs in name order, then HEAD
      if (!starts.length && !o.all) { const h = headId(R); if (!h) die("fatal: your current branch '" + (R.head.branch || 'HEAD') + "' does not have any commits yet"); starts.push(h); }
      const n = o.n !== undefined ? parseInt(o.n, 10) : Infinity;
      if (isNaN(n)) die("fatal: '" + o.n + "': not an integer");
      if (o.graph) {
        if (o.reverse) die("fatal: options '--reverse' and '--graph' cannot be used together");
        if (paths.length) die('fatal: this practice git draws --graph for the whole history only (without paths)');
        if (o.patch || o.stat) die('fatal: this practice git draws --graph without -p or --stat');
      }
      let list = o.graph ? topo(R, walk(R, starts)) : walk(R, starts);
      if (paths.length) { const ss = specs(R, paths); list = list.filter((id) => { const c = R.objs[id], mine = commitTree(R, id), ps = c.parents.length ? c.parents : [null]; return ps.every((p) => pairs(R, commitTree(R, p), mine, ss).length > 0); }); }
      list = list.slice(0, Math.max(0, n));
      if (o.reverse) list.reverse();
      if (o.pretty !== undefined) { if (o.pretty === 'oneline') o.oneline = true; else if (/^(format|tformat):/.test(o.pretty)) o.format = o.pretty.replace(/^t?format:/, ''); else if (!/^(medium|short|full)$/.test(o.pretty)) die("fatal: invalid --pretty format: " + o.pretty); }
      const deco = decorations(R), show = { oneline: o.oneline, decorate: o.decorate === undefined ? io.tty : o.decorate, patch: o.patch, stat: o.stat, format: o.format };
      if (o.graph) {
        // as git's show_log: the graph down to the commit's line, the commit, its message with the graph before each line
        const G = makeGraph(R), hd = io.tty ? 'hd' : undefined;
        list.forEach((id, k) => {
          const c = R.objs[id], d = show.decorate ? deco[id] || '' : '';
          G.update(id);
          if (o.oneline || o.format !== undefined) {
            io.out(G.showCommit());
            if (o.format !== undefined) io.out(G.showMsg(format(R, id, o.format, deco)));
            else { io.out(short(id), hd); io.out(d + ' ' + G.showMsg(subject(c.message))); }
            io.out('\n');
          } else {
            if (k > 0) io.out(G.padding() + '\n');
            io.out(G.showCommit()); io.out('commit ' + id, hd); io.out(d + '\n' + G.oneline());
            io.out(G.showMsg((c.parents.length > 1 ? 'Merge: ' + c.parents.map(short).join(' ') + '\n' : '') + 'Author: ' + c.author.name + ' <' + c.author.email + '>\nDate:   ' + gitDate(c.author) + '\n\n' + indent(c.message)));
          }
        });
        return 0;
      }
      list.forEach((id, k) => { if (k > 0 && !o.oneline && o.format === undefined) io.out('\n'); showCommit(R, id, io, show, deco); });
      return 0;
    } });

  sub('show', { use: 'git show [--stat] [<object>]', desc: 'Show various types of objects',
    run(args, io, sh) {
      const { o, rest } = getopt(args, { stat: 'stat', oneline: 'oneline', format: 'format=', s: 'nopatch', 'no-patch': 'nopatch', 'name-only': 'nameonly' }, 'show');
      const R = openRepo(sh);
      const what = rest.length ? rest : ['HEAD'];
      if (!rest.length && !headId(R)) die("fatal: your current branch '" + (R.head.branch || 'HEAD') + "' does not have any commits yet");
      const deco = decorations(R);
      what.forEach((spec, k) => {
        const id = resolveObject(R, spec); if (!id) badRev(spec);
        const obj = R.objs[id];
        if (k > 0) io.out('\n');
        if (obj.type === 'blob') { io.out(obj.text); return; }
        if (obj.type === 'tree') { io.out('tree ' + spec + '\n\n' + obj.entries.map((e) => e.name + (e.mode === '40000' ? '/' : '') + '\n').join('')); return; }
        let c = id;
        if (obj.type === 'tag') { io.out('tag ' + obj.tagName + '\nTagger: ' + obj.tagger.name + ' <' + obj.tagger.email + '>\nDate:   ' + gitDate(obj.tagger) + '\n\n' + obj.message.replace(/\n*$/, '\n') + '\n'); c = peel(R, id); }
        showCommit(R, c, io, { oneline: o.oneline, decorate: io.tty, stat: o.stat, patch: !o.stat && !o.nopatch, format: o.format }, deco);
      });
      return 0;
    } });

  sub('diff', { use: 'git diff [--staged] [--stat] [<commit> [<commit>]] [--] [<path>...]', desc: 'Show changes between commits, commit and working tree, etc',
    run(args, io, sh) {
      const { o, rest, dd } = getopt(args, { staged: 'staged', cached: 'staged', stat: 'stat', 'name-only': 'nameonly', 'name-status': 'namestatus', quiet: 'quiet', 'exit-code': 'exitcode' }, 'diff');
      const R = openRepo(sh);
      let revs = dd >= 0 ? rest.slice(0, dd) : [], paths = dd >= 0 ? rest.slice(dd) : [];
      if (dd < 0) { for (const a of rest) { if (!paths.length && resolve(R, a)) revs.push(a); else if (sh.fs.exists(sh.fs.resolve(a)) || paths.length || R.index[pathspec(R, a).rel]) paths.push(a); else badRev(a); } }
      if (revs.length === 1 && /\.\./.test(revs[0])) revs = revs[0].split('..').map((s) => s || 'HEAD');
      revs = revs.map((r) => mustResolve(R, r));
      if (revs.length > 2) die('usage: git diff [<options>] [<commit>] [--] [<path>...]', 129);
      const ss = specs(R, paths), w = scan(R), work = () => { const out = dict(); for (const p in R.index) if (w[p]) out[p] = workEntry(w[p]); return out; };
      const un = Object.keys(R.conflicts).filter((p) => !ss.length || anyMatch(ss, p)).sort(), cc = [];
      let A, B;
      if (revs.length === 2) { A = commitTree(R, revs[0]); B = commitTree(R, revs[1]); un.length = 0; }
      else if (o.staged) { A = commitTree(R, revs[0] || headId(R)); B = R.index; for (const p of un) delete A[p]; }
      else if (revs.length === 1) { A = commitTree(R, revs[0]); B = work(); for (const p in A) if (!R.index[p] && w[p]) B[p] = workEntry(w[p]); un.length = 0; }
      else { A = Object.assign(dict(), R.index); B = work(); for (const p of un) { const c = R.conflicts[p]; if (c.ours && c.theirs && w[p]) cc.push(p); } }
      const ch = pairs(R, A, B, ss), unmerged = () => io.out(un.filter((p) => !cc.includes(p)).map((p) => '* Unmerged path ' + p + '\n').join(''));
      if (o.quiet || o.exitcode) { if (!o.quiet) patch(R, ch, io); return ch.length || un.length ? 1 : 0; }
      if (o.nameonly) io.out(un.concat(ch.map((c) => c.path)).map((p) => p + '\n').join(''));
      else if (o.namestatus) io.out(un.map((p) => 'U\t' + p + '\n').join('') + ch.map((c) => (c.from ? 'R100\t' + c.from + '\t' : (!c.a ? 'A' : !c.b ? 'D' : 'M') + '\t') + c.path + '\n').join(''));
      else if (o.stat) diffstat(R, ch.concat(cc.map((p) => ({ path: p, a: R.conflicts[p].ours, b: workEntry(w[p]) }))).sort((x, y) => x.path < y.path ? -1 : 1), io, false, un);
      else { patch(R, ch, io); for (const p of cc) combined(R, p, R.conflicts[p], w[p].node.d, io); unmerged(); }
      return 0;
    } });

  sub('branch', { use: 'git branch [-v] | git branch <name> [<start>] | git branch -d <name> | git branch -m [<old>] <new>', desc: 'List, create, or delete branches',
    run(args, io, sh) {
      const { o, rest } = getopt(args, { d: 'delete', delete: 'delete', D: 'force_delete', m: 'move', move: 'move', M: 'move', v: 'verbose', verbose: 'verbose', l: 'list', list: 'list', a: 'all', all: 'all', f: 'force', force: 'force', 'show-current': 'current', c: 'copy', copy: 'copy' }, 'branch');
      const R = openRepo(sh);
      if (o.current) { if (R.head.branch) io.out(R.head.branch + '\n'); return 0; }
      if (o.delete || o.force_delete) {
        if (!rest.length) die('fatal: branch name required');
        let exit = 0; const h = headId(R, true);
        for (const name of rest) {
          const id = refId(R, 'heads', name);
          if (!id || id === 'broken') { io.err("error: branch '" + name + "' not found\n"); exit = 1; continue; }
          if (name === R.head.branch) { io.err("error: cannot delete branch '" + name + "' used by worktree at '" + R.root + "'\n"); exit = 1; continue; }
          if (!o.force_delete && !o.force && !(h && ancestors(R, h)[id])) { io.err("error: the branch '" + name + "' is not fully merged.\nIf you are sure you want to delete it, run 'git branch -D " + name + "'\n"); exit = 1; continue; }
          deleteRef(R, 'heads', name); io.out('Deleted branch ' + name + ' (was ' + short(id) + ').\n');
        }
        return exit;
      }
      if (o.move || o.copy) {
        if (!rest.length || rest.length > 2) die('fatal: branch name required');
        const from = rest.length === 2 ? rest[0] : R.head.branch, to = rest[rest.length - 1];
        if (!from) die('fatal: cannot rename the current branch while not on any');
        if (!refOk(to)) die("fatal: '" + to + "' is not a valid branch name");
        const id = refId(R, 'heads', from);
        if (id === 'broken' || (!id && from !== R.head.branch)) die('error: refname refs/heads/' + from + ' not found\nfatal: Branch ' + (o.copy ? 'copy' : 'rename') + ' failed');
        if (refId(R, 'heads', to) && to !== from && !o.force) die("fatal: a branch named '" + to + "' already exists");
        if (id) { if (!o.copy) deleteRef(R, 'heads', from); writeRef(R, 'heads', to, id); }
        if (!o.copy && from === R.head.branch) attach(R, to);
        return 0;
      }
      if (rest.length && !o.list) {
        const name = rest[0];
        if (!refOk(name)) die("fatal: '" + name + "' is not a valid branch name");
        if (refId(R, 'heads', name) && !o.force) die("fatal: a branch named '" + name + "' already exists");
        if (o.force && name === R.head.branch) die("fatal: cannot force update the branch '" + name + "' used by worktree at '" + R.root + "'");
        const start = rest[1] ? resolve(R, rest[1]) : headId(R);
        if (!start) die("fatal: not a valid object name: '" + (rest[1] || R.head.branch || 'HEAD') + "'");
        writeRef(R, 'heads', name, start);
        return 0;
      }
      const tty = io.tty, h = headId(R, true), list = listRefs(R, 'heads'), w = Math.max(0, ...list.map((b) => b.name.length));
      if (!R.head.branch && h) io.out('* ', tty ? 'exe' : undefined), io.out('(' + branchLine(R) + ')' + (o.verbose ? ' ' + short(h) + ' ' + subject(R.objs[h].message) : '') + '\n', tty ? 'exe' : undefined);
      for (const b of list) {
        const cur = b.name === R.head.branch;
        io.out(cur ? '* ' : '  '); io.out(o.verbose ? b.name.padEnd(w) : b.name, cur && tty ? 'exe' : undefined);
        io.out((o.verbose ? ' ' + short(b.id) + ' ' + subject(R.objs[b.id].message) : '') + '\n');
      }
      return 0;
    } });

  // ----- switching: the files that differ between the two commits are written; local changes to other files come along
  function switchTo(R, target, io, how) {
    if (Object.keys(R.conflicts).length) die('error: you need to resolve your current index first\n' + Object.keys(R.conflicts).sort().map((p) => p + ': needs merge').join('\n'), 1);
    const old = headId(R, true), H = commitTree(R, old), T = commitTree(R, target), work = scan(R), local = [], untracked = [], plan = [];
    for (const p of Object.keys(Object.assign(dict(), H, T)).sort()) {
      if (same(H[p], T[p])) continue;
      const i = R.index[p], w = work[p];
      if (!same(i, H[p]) && !same(i, T[p])) { local.push(p); continue; }
      if (i ? (w && !sameAsWork(R, i, w)) || (!w && T[p]) : w && !w.ign && !sameAsWork(R, T[p], w)) { (i ? local : untracked).push(p); continue; }
      plan.push([p, T[p] || null]);
    }
    const verb = how.merge ? 'merge' : 'checkout', act = how.merge ? 'merge' : 'switch branches';
    if (local.length) die('error: Your local changes to the following files would be overwritten by ' + verb + ':\n' + local.map((p) => '\t' + p + '\n').join('') + 'Please commit your changes or stash them before you ' + (how.merge ? 'merge' : 'switch branches') + '.\nAborting', 1);
    if (untracked.length) die('error: The following untracked working tree files would be overwritten by ' + verb + ':\n' + untracked.map((p) => '\t' + p + '\n').join('') + 'Please move or remove them before you ' + act + '.\nAborting', how.merge ? 2 : 1);
    applyPlan(R, plan, work);
    for (const [p, e] of plan) { if (e) R.index[p] = e; else delete R.index[p]; }
    R.idxDirty = true; flush(R);
    return old;
  }
  /** the commits only reachable from a detached HEAD that is being left (git warns about them) */
  function orphans(R, from) {
    const keep = dict(); for (const k of ['heads', 'tags']) for (const r of listRefs(R, k)) Object.assign(keep, ancestors(R, peel(R, r.id)));
    return walk(R, [from]).filter((id) => !keep[id]);
  }
  // after a switch, the local changes that came along: M	notes.txt
  function carried(R, io) {
    const c = changes(R), rows = dict();
    for (const e of c.staged) rows[e.path] = e.kind === 'new' ? 'A' : e.kind === 'deleted' ? 'D' : 'M';
    for (const e of c.unstaged) if (!rows[e.path]) rows[e.path] = e.kind === 'deleted' ? 'D' : 'M';
    io.out(Object.keys(rows).sort().map((p) => rows[p] + '\t' + p + '\n').join(''));
  }
  function leaving(R, io, old) {
    if (R.head.branch || !old) return;
    const lost = orphans(R, old); if (!lost.length) { io.err('Previous HEAD position was ' + short(old) + ' ' + subject(R.objs[old].message) + '\n'); return; }
    const shownN = lost.length > 5 ? 4 : lost.length;
    io.err('Warning: you are leaving ' + plural(lost.length, 'commit', 'commits') + ' behind, not connected to\nany of your branches:\n\n' + lost.slice(0, shownN).map((id) => '  ' + short(id) + ' ' + subject(R.objs[id].message) + '\n').join('') + (lost.length > shownN ? ' ... and ' + (lost.length - shownN) + ' more.\n' : '') +
      '\nIf you want to keep ' + (lost.length === 1 ? 'it' : 'them') + ' by creating a new branch, this may be a good time\nto do so with:\n\n git branch <new-branch-name> ' + short(old) + '\n\n');
  }
  function goBranch(R, name, io, quiet) {
    const label = R.head.branch || headId(R, true);
    if (name === R.head.branch) { if (!quiet) io.err("Already on '" + name + "'\n"); return 0; }
    const id = refId(R, 'heads', name), wasDetached = !R.head.branch, old = headId(R, true);
    switchTo(R, id, io, {});
    if (wasDetached && !quiet && old !== id) leaving(R, io, old);
    attach(R, name); logHead(R, old, id, 'checkout: moving from ' + label + ' to ' + name); if (!quiet) carried(R, io);
    if (!quiet) io.err("Switched to branch '" + name + "'\n");
    return 0;
  }
  function newBranch(R, name, startSpec, io, quiet, force) {
    if (!refOk(name)) die("fatal: '" + name + "' is not a valid branch name");
    if (refId(R, 'heads', name) && !force) die("fatal: a branch named '" + name + "' already exists");
    const start = startSpec ? resolve(R, startSpec) : headId(R, true);
    if (startSpec && !start) die("fatal: invalid reference: " + startSpec);
    const label = R.head.branch || headId(R, true), old = headId(R, true);
    if (start) { switchTo(R, start, io, {}); writeRef(R, 'heads', name, start); }
    else if (startSpec || old) die("fatal: invalid reference: " + startSpec);
    attach(R, name); if (start) logHead(R, old, start, 'checkout: moving from ' + label + ' to ' + name); if (!quiet && start && startSpec) carried(R, io);   // git skips the checkout (and this list) for a new branch where HEAD is
    if (!quiet) io.err("Switched to a new branch '" + name + "'\n");
    return 0;
  }
  function goDetached(R, id, spec, io, quiet, advice) {
    const label = R.head.branch || headId(R, true), wasDetached = !R.head.branch, old = headId(R, true);
    switchTo(R, id, io, {});
    if (wasDetached && !quiet && old !== id) leaving(R, io, old);
    detach(R, id); logHead(R, old, id, 'checkout: moving from ' + label + ' to ' + spec); if (!quiet) carried(R, io);
    if (!quiet && advice) io.err("Note: switching to '" + spec + "'.\n\nYou are in 'detached HEAD' state. You can look around, make experimental\nchanges and commit them, and you can discard any commits you make in this\nstate without impacting any branches by switching back to a branch.\n\nIf you want to create a new branch to retain commits you create, you may\ndo so (now or later) by using -c with the switch command. Example:\n\n  git switch -c <new-branch-name>\n\nOr undo this operation with:\n\n  git switch -\n\nTurn off this advice by setting config variable advice.detachedHead to false\n\n");
    if (!quiet) io.err('HEAD is now at ' + short(id) + ' ' + subject(R.objs[id].message) + '\n');
    return 0;
  }
  // git switch - : the branch (or commit) HEAD was on before the last checkout
  function previous(R) { const e = reflog(R).find((x) => x.msg.startsWith('checkout: moving from ')); if (!e) die('fatal: invalid reference: @{-1}'); return e.msg.replace(/^checkout: moving from /, '').replace(/ to .*$/, ''); }

  sub('switch', { use: 'git switch [-c <new-branch>] [--detach] <branch>', desc: 'Switch branches',
    run(args, io, sh) {
      const { o, rest } = getopt(args, { c: 'create=', create: 'create=', C: 'forcecreate=', 'force-create': 'forcecreate=', d: 'detach', detach: 'detach', q: 'quiet', quiet: 'quiet' }, 'switch');
      const R = openRepo(sh), op = inProgress(R), create = o.create !== undefined || o.forcecreate !== undefined;
      if (!rest.length && !create) die('fatal: missing branch or commit argument');
      // as git switch (git checkout lets you): not in the middle of a merge, cherry-pick or revert
      if (op) die('fatal: cannot switch branch while ' + { merge: 'merging', 'cherry-pick': 'cherry-picking', revert: 'reverting' }[op.kind] + '\nConsider "git ' + op.kind + ' --quit" or "git worktree add".');
      if (create) return newBranch(R, o.create !== undefined ? o.create : o.forcecreate, rest[0], io, o.quiet, o.forcecreate !== undefined);
      let name = rest[0];
      if (name === '-') name = previous(R);
      if (o.detach) { const id = resolve(R, name); if (!id) die('fatal: invalid reference: ' + name); return goDetached(R, id, name, io, o.quiet, false); }
      const id = refId(R, 'heads', name);
      if (id && id !== 'broken') return goBranch(R, name, io, o.quiet);
      if (name === R.head.branch) { if (!o.quiet) io.err("Already on '" + name + "'\n"); return 0; }
      if (resolve(R, name)) die("fatal: a branch is expected, got " + (refId(R, 'tags', name) ? "tag '" : "commit '") + name + "'\nhint: If you want to detach HEAD at the commit, try again with the --detach option.");
      die('fatal: invalid reference: ' + name);
    } });

  sub('checkout', { use: 'git checkout [-b <new-branch>] <branch> | git checkout [<commit>] -- <file>...', desc: 'Switch branches or restore working tree files',
    run(args, io, sh) {
      const { o, rest, dd } = getopt(args, { b: 'create=', B: 'forcecreate=', q: 'quiet', quiet: 'quiet', detach: 'detach', f: 'force', force: 'force', ours: 'ours', theirs: 'theirs', m: 'merge', merge: 'merge' }, 'checkout');
      const R = openRepo(sh), side = o.ours ? 'ours' : o.theirs ? 'theirs' : o.merge ? 'merge' : null, count = !o.quiet && (dd < 0 || !!side);   // as git: "Updated 1 path" unless -- was given
      if (o.create !== undefined || o.forcecreate !== undefined) return newBranch(R, o.create !== undefined ? o.create : o.forcecreate, rest[0], io, o.quiet, o.forcecreate !== undefined);
      const before = dd >= 0 ? rest.slice(0, dd) : rest.slice(0, 1), paths = dd >= 0 ? rest.slice(dd) : rest.slice(1);
      if (dd >= 0 || paths.length) {
        if (before.length > 1) badRev(before[1]);
        const src = before[0] !== undefined ? resolve(R, before[0]) : null;
        if (before[0] !== undefined && !src) { if (dd >= 0) badRev(before[0]); paths.unshift(before[0]); return restorePaths(R, specs(R, paths), { worktree: true, side, count }, io); }
        return restorePaths(R, specs(R, paths), { worktree: true, source: src, sourceGiven: !!src, checkout: true, side: src ? null : side, count }, io);
      }
      if (!rest.length) { if (o.detach) { const h = headId(R); if (h) return goDetached(R, h, 'HEAD', io, o.quiet, false); } return 0; }
      if (side) return restorePaths(R, specs(R, rest), { worktree: true, side, count }, io);
      let name = rest[0]; if (name === '-') name = previous(R);
      const bid = refId(R, 'heads', name);
      if (bid && bid !== 'broken' && !o.detach) return goBranch(R, name, io, o.quiet);
      if (name === R.head.branch && !headId(R, true)) { if (!o.quiet) io.err("Already on '" + name + "'\n"); return 0; }
      const id = resolve(R, name);
      if (id) return goDetached(R, id, name, io, o.quiet, !R.head.branch ? false : true);
      return restorePaths(R, specs(R, [name]), { worktree: true, count }, io);
    } });

  /** the three-way merge of three snapshots, path by path: { result (the paths that merged), conflicts, wtext (what a conflicted path's file
      gets: the text with markers), notes (Auto-merging, CONFLICT lines) }. la and lb name the two sides in the markers and the notes. */
  function threeWay(R, B, O, T, la, lb) {
    const result = dict(), conflicts = dict(), wtext = dict(), notes = [];
    for (const p of Object.keys(Object.assign(dict(), B, O, T)).sort()) {
      const b = B[p], x = O[p], y = T[p];
      if (same(x, y)) { if (x) result[p] = x; continue; }
      if (same(b, x)) { if (y) result[p] = y; continue; }
      if (same(b, y)) { if (x) result[p] = x; continue; }
      if (x && y) {
        const mode = x.mode === y.mode ? x.mode : b && x.mode === b.mode ? y.mode : x.mode;
        if (x.id === y.id) { result[p] = { mode, id: x.id }; continue; }
        notes.push('Auto-merging ' + p);
        const m = merge3(b ? text(R, b.id) : '', text(R, x.id), text(R, y.id), la, lb);
        if (m.conflicts) { notes.push('CONFLICT (' + (b ? 'content' : 'add/add') + '): Merge conflict in ' + p); conflicts[p] = { base: b || null, ours: x, theirs: y }; wtext[p] = { mode, text: m.text }; }
        else result[p] = { mode, id: store(R, { type: 'blob', text: m.text }) };
      } else if (x) { notes.push('CONFLICT (modify/delete): ' + p + ' deleted in ' + lb + ' and modified in ' + la + '.  Version ' + la + ' of ' + p + ' left in tree.'); conflicts[p] = { base: b, ours: x, theirs: null }; }
      else { notes.push('CONFLICT (modify/delete): ' + p + ' deleted in ' + la + ' and modified in ' + lb + '.  Version ' + lb + ' of ' + p + ' left in tree.'); conflicts[p] = { base: b, ours: null, theirs: y }; wtext[p] = { mode: y.mode, text: text(R, y.id) }; }
    }
    return { result, conflicts, wtext, notes };
  }
  /** the files a merge into O writes, and the local changes or untracked files in its way: { plan, local, untracked } */
  function mergeWrites(R, O, m, work) {
    const { result, conflicts, wtext } = m, plan = [], local = [], untracked = [];
    for (const p of Object.keys(Object.assign(dict(), O, result, wtext)).sort()) {
      const want = wtext[p] || (conflicts[p] ? O[p] : result[p]) || null, w = work[p];
      const has_ = want && want.text !== undefined ? w && w.node.d === want.text && modeOf(w.node) === want.mode : want ? sameAsWork(R, want, w) : !w;
      if (same(O[p], result[p]) && !wtext[p] && !conflicts[p]) continue;
      if (conflicts[p] && O[p] && !wtext[p]) continue;
      if (has_) continue;
      // changed or deleted here, or an untracked file where the merge puts one
      if (O[p] ? !sameAsWork(R, O[p], w) : w && !w.ign) { (O[p] ? local : untracked).push(p); continue; }
      plan.push([p, want]);
    }
    return { plan, local, untracked };
  }
  // git's refusal when a merge (or a stash, cherry-pick, revert) would overwrite local work; tail: what git says after "Aborting"
  function wayMessage(local, untracked) {
    if (local.length) return 'error: Your local changes to the following files would be overwritten by merge:\n' + local.map((p) => '\t' + p + '\n').join('') + 'Please commit your changes or stash them before you merge.\nAborting';
    if (untracked.length) return 'error: The following untracked working tree files would be overwritten by merge:\n' + untracked.map((p) => '\t' + p + '\n').join('') + 'Please move or remove them before you merge.\nAborting';
    return null;
  }
  function inTheWay(local, untracked, tail, code) { const m = wayMessage(local, untracked); if (m) die(m + tail, code); }
  /** write the merged files (conflicted ones with their markers), then the index: the merged paths, and the conflicts */
  function writeMerge(R, plan, work, m) {
    const textPlan = plan.map(([p, e]) => [p, e && e.text !== undefined ? { mode: e.mode, id: store(R, { type: 'blob', text: e.text }) } : e]);
    flush(R);
    applyPlan(R, textPlan, work);
    R.index = m.result; R.conflicts = m.conflicts; R.idxDirty = true;
  }

  sub('merge', { use: 'git merge [--no-ff] [--ff-only] [-m <msg>] <commit> | git merge --abort', desc: 'Join two or more development histories together',
    async run(args, io, sh) {
      const { o, rest } = getopt(args, { 'no-ff': 'noff', ff: 'ff', 'ff-only': 'ffonly', m: 'm=', message: 'm=', abort: 'abort', continue: 'cont', quit: 'quit', 'no-edit': 'noedit', edit: 'edit', e: 'edit', q: 'quiet', quiet: 'quiet', commit: 'commit', 'no-commit': 'nocommit', squash: 'squash', stat: 'stat', 'no-stat': 'nostat', log: 'log' }, 'merge');
      const R = openRepo(sh), mh = readId(R, 'MERGE_HEAD');
      if (o.abort) { if (!mh) die('fatal: There is no merge to abort (MERGE_HEAD missing).'); hardReset(R, headId(R, true)); gitRemove(R, 'MERGE_HEAD'); gitRemove(R, 'MERGE_MSG'); return 0; }
      if (o.cont) { if (!mh) die('fatal: There is no merge in progress (MERGE_HEAD missing).'); return SUB.commit.run([], io, sh); }
      if (o.quit) { gitRemove(R, 'MERGE_HEAD'); gitRemove(R, 'MERGE_MSG'); return 0; }   // forget the merge, keep the files and the index as they are
      if (o.squash || o.nocommit) die('fatal: this practice git merges and commits in one step (--squash and --no-commit are not available here)');
      if (Object.keys(R.conflicts).length) die("error: Merging is not possible because you have unmerged files.\nhint: Fix them up in the work tree, and then use 'git add/rm <file>'\nhint: as appropriate to mark resolution and make a commit.\nfatal: Exiting because of an unresolved conflict.");
      if (mh) die('fatal: You have not concluded your merge (MERGE_HEAD exists).\nPlease, commit your changes before you merge.');
      if (!rest.length) die('fatal: No remote for the current branch.');
      if (rest.length > 1) die('fatal: this practice git merges one branch at a time');
      const spec = rest[0], theirs = resolve(R, spec);
      if (!theirs) { io.err('merge: ' + spec + ' - not something we can merge\n'); return 1; }
      const ours = headId(R), put = (s) => { if (!o.quiet) io.out(s); };
      if (!ours) { switchTo(R, theirs, io, { merge: true }); setHead(R, theirs, 'initial pull'); return 0; }
      const kind = refId(R, 'heads', spec) && refId(R, 'heads', spec) !== 'broken' ? 'branch' : refId(R, 'tags', spec) ? 'tag' : 'commit';
      const into = R.head.branch === 'main' || R.head.branch === 'master' ? '' : ' into ' + (R.head.branch || 'HEAD');
      const early = kind === 'commit' && /^(.+?)(?:~[0-9]*|\^)+$/.exec(spec), earlyId = early && refId(R, 'heads', early[1]);   // side~1: "branch 'side' (early part)", as git says
      const msg = o.m !== undefined ? o.m : earlyId && earlyId !== 'broken' ? 'Merge branch ' + q(early[1]) + ' (early part)' + into : 'Merge ' + kind + ' ' + q(spec) + into;
      const A = ancestors(R, ours);
      if (A[theirs]) { put('Already up to date.\n'); return 0; }
      const ff = ancestors(R, theirs)[ours];
      if (ff && !o.noff) {
        put('Updating ' + short(ours) + '..' + short(theirs) + '\n');
        switchTo(R, theirs, io, { merge: true });
        gitWrite(R, 'ORIG_HEAD', ours + '\n'); setHead(R, theirs, 'merge ' + spec + ': Fast-forward');
        put('Fast-forward\n'); const ch = pairs(R, commitTree(R, ours), commitTree(R, theirs)); if (!o.quiet) { diffstat(R, ch, io); io.out(modeLines(ch)); }
        return 0;
      }
      if (o.ffonly) die('fatal: Not possible to fast-forward, aborting.');
      // the three-way merge, path by path
      const base = mergeBase(R, ours, theirs), O = commitTree(R, ours);
      const m = threeWay(R, commitTree(R, base), O, commitTree(R, theirs), 'HEAD', spec);
      // local changes in the way? (as git: only for the files the merge changes; and nothing may be staged)
      const work = scan(R), staged = Object.keys(Object.assign(dict(), O, R.index)).filter((p) => !same(O[p], R.index[p])).sort();
      const { plan, local, untracked } = mergeWrites(R, O, m, work);
      if (staged.length) local.unshift(...staged.filter((p) => !local.includes(p)));
      inTheWay(local, untracked, '\nMerge with strategy ort failed.', 2);
      if (m.notes.length) io.out(m.notes.join('\n') + '\n');   // (as git: even with -q)
      const tree = writeTree(R, m.result);
      writeMerge(R, plan, work, m);
      gitWrite(R, 'ORIG_HEAD', ours + '\n');
      if (Object.keys(m.conflicts).length) {
        flush(R);
        gitWrite(R, 'MERGE_HEAD', theirs + '\n'); gitWrite(R, 'MERGE_MSG', msg + '\n\n# Conflicts:\n' + Object.keys(m.conflicts).sort().map((p) => '#\t' + p + '\n').join(''));
        io.out('Automatic merge failed; fix conflicts and then commit the result.\n');
        return 1;
      }
      // the merge commit's message: in the editor (as git at a terminal) unless -m was given or --no-edit
      let message = cleanMessage(msg, 'whitespace');
      if (hasEditor(sh) && !o.noedit && (o.edit || o.m === undefined)) {
        flush(R);
        message = cleanMessage(await editMessage(R, 'MERGE_MSG', msg + '\n' + MERGE_TEMPLATE), 'strip');
        if (message === '') { gitWrite(R, 'MERGE_HEAD', theirs + '\n'); gitWrite(R, 'MERGE_MSG', msg + '\n'); die("error: Empty commit message.\nNot committing merge; use 'git commit' to complete the merge.", 1); }
        gitRemove(R, 'MERGE_MSG');
      }
      const me = who(R), raw = 'tree ' + tree + '\nparent ' + ours + '\nparent ' + theirs + '\nauthor ' + me + '\ncommitter ' + me + '\n\n' + message;
      const id = store(R, parseCommit(raw)); flush(R);
      setHead(R, id, 'merge ' + spec + ": Merge made by the 'ort' strategy.");
      put("Merge made by the 'ort' strategy.\n"); const ch = pairs(R, O, commitTree(R, id)); if (!o.quiet) { diffstat(R, ch, io); io.out(modeLines(ch)); }
      return 0;
    } });

  /** reset --hard: the index and the tracked files become the commit's (untracked files stay) */
  function hardReset(R, id) {
    const T = commitTree(R, id), work = scan(R), plan = [];
    const tracked = Object.assign(dict(), commitTree(R, headId(R, true)), R.index, R.conflicts);
    for (const p of Object.keys(Object.assign(dict(), tracked, T)).sort()) { if (T[p]) { if (!sameAsWork(R, T[p], work[p])) plan.push([p, T[p]]); } else if (work[p]) plan.push([p, null]); }
    applyPlan(R, plan, work);
    R.index = T; R.conflicts = dict(); R.idxDirty = true; flush(R);
  }
  sub('reset', { use: 'git reset [--soft | --mixed | --hard] [<commit>] | git reset [<commit>] [--] <paths>...', desc: 'Reset current HEAD to the specified state',
    run(args, io, sh) {
      const { o, rest, dd } = getopt(args, { soft: 'soft', mixed: 'mixed', hard: 'hard', q: 'quiet', quiet: 'quiet', keep: 'keep', merge: 'mergemode' }, 'reset');
      const R = openRepo(sh);
      let revs = dd >= 0 ? rest.slice(0, dd) : [], paths = dd >= 0 ? rest.slice(dd) : [];
      if (dd < 0) { if (rest.length && resolve(R, rest[0])) { revs = [rest[0]]; paths = rest.slice(1); } else paths = rest.slice(); for (const p of paths) if (!sh.fs.exists(sh.fs.resolve(p)) && !Object.keys(R.index).concat(Object.keys(commitTree(R, headId(R, true)))).some((k) => matches(pathspec(R, p), k))) badRev(p); }
      if (revs.length > 1) badRev(revs[1]);
      const target = revs.length ? mustResolve(R, revs[0]) : headId(R, true);
      const unstagedList = () => { const c = changes(R); const s = c.unstaged.map((e) => (e.kind === 'deleted' ? 'D' : 'M') + '\t' + shown(R, e.path) + '\n').join(''); if (s && !o.quiet) io.out('Unstaged changes after reset:\n' + s); };
      if (paths.length) {
        if (o.soft || o.hard) die('fatal: Cannot do ' + (o.soft ? 'soft' : 'hard') + ' reset with paths.');
        const T = commitTree(R, target), ss = specs(R, paths);
        for (const p of Object.keys(Object.assign(dict(), T, R.index, R.conflicts))) if (anyMatch(ss, p)) { delete R.conflicts[p]; if (T[p]) R.index[p] = T[p]; else delete R.index[p]; }
        R.idxDirty = true; flush(R); unstagedList(); return 0;
      }
      if (o.soft && readId(R, 'MERGE_HEAD')) die('fatal: Cannot do a soft reset in the middle of a merge.');
      const old = headId(R, true);
      if (o.hard) hardReset(R, target);
      else if (!o.soft) { R.index = commitTree(R, target); R.conflicts = dict(); R.idxDirty = true; flush(R); }
      if (target) { if (old) gitWrite(R, 'ORIG_HEAD', old + '\n'); if (target !== old || revs.length) setHead(R, target, 'reset: moving to ' + (revs[0] || 'HEAD')); }
      if (!o.soft) { gitRemove(R, 'MERGE_HEAD'); gitRemove(R, 'MERGE_MSG'); }
      if (o.hard) { if (target && !o.quiet) io.out('HEAD is now at ' + short(target) + ' ' + subject(R.objs[target].message) + '\n'); }
      else if (!o.soft) unstagedList();
      return 0;
    } });

  // ----- the stash: refs/stash names the newest entry, logs/refs/stash lists them all (oldest first), as in git. An entry is a commit
  // "WIP on main: ..." whose tree is the working tree, with HEAD as its first parent, a commit of the index as its second and, with -u,
  // a commit of the untracked files as its third (so the ids are real git's). Both files are checked when read, like everything in .git.
  const STASH_MAX = 100;
  function stashList(R) {
    const t = R.rd('logs/refs/stash'), top = R.rd('refs/stash');
    if (t === null && top === null) return [];
    const out = [];
    for (const l of (t || '').split('\n')) {
      if (l === '') continue;
      const m = /^([0-9a-f]{40}) ([0-9a-f]{40}) ([^\t\n]*)\t([^\n]*)$/.exec(l);
      if (!m || out.length >= STASH_MAX) damaged('logs/refs/stash', 'a line is not "old-id new-id who<tab>message" (or there are more than ' + STASH_MAX + ')');
      const c = has(R.objs, m[2]) ? R.objs[m[2]] : null, p = c && c.type === 'commit' ? c.parents : null;
      const stashLike = p && (p.length === 2 || p.length === 3) && R.objs[p[1]].parents.length === 1 && R.objs[p[1]].parents[0] === p[0] && (p.length === 2 || R.objs[p[2]].parents.length === 0);
      if (!stashLike) damaged('logs/refs/stash', 'entry ' + short(m[2]) + ' is not a stash (a commit of the working tree whose parents are HEAD, the index and the untracked files)');
      out.push({ id: m[2], msg: m[4] });
    }
    out.reverse();
    const m = top === null ? null : /^([0-9a-f]{40})\s*$/.exec(top);
    if (!out.length || !m || m[1] !== out[0].id) damaged(top === null ? 'logs/refs/stash' : 'refs/stash', 'refs/stash should hold the id of the newest stash, the last line of .git/logs/refs/stash');
    return out;
  }
  function stashWrite(R, list) {
    if (!list.length) { gitRemove(R, 'refs/stash'); gitRemove(R, 'logs/refs/stash'); return; }
    const me = who(R), lines = list.slice().reverse().map((e, k, a) => (k ? a[k - 1].id : ZERO) + ' ' + e.id + ' ' + me + '\t' + e.msg.replace(/[\n\t]/g, ' ').slice(0, 200));
    gitWrite(R, 'logs/refs/stash', lines.join('\n') + '\n'); gitWrite(R, 'refs/stash', list[0].id + '\n');
  }
  /** stash@{n}, n, or nothing (the newest) → { n, name, id }; as git, a number past the end says how many entries there are */
  function stashPick(R, list, arg) {
    if (!list.length) die('No stash entries found.', 1);
    let n = 0, name = 'refs/stash@{0}', m;
    if (arg !== undefined) {
      if ((m = /^stash@\{(\d{1,9})\}$/.exec(arg))) { n = +m[1]; name = arg; if (n >= list.length) die("fatal: log for 'stash' only has " + list.length + ' entries'); }
      else if (/^\d{1,9}$/.test(arg)) { n = +arg; name = 'refs/stash@{' + n + '}'; if (n >= list.length) die("fatal: log for 'refs/stash' only has " + list.length + ' entries'); }
      else die('error: ' + arg + ' is not a valid reference', 1);
    }
    return { n, name, id: list[n].id };
  }
  const needsMerge = (R) => { const un = Object.keys(R.conflicts).sort(); if (un.length) die(un.map((p) => p + ': needs merge').join('\n'), 1); };
  function stashPush(R, io, o, message) {
    const head = headId(R);
    if (!head) die('You do not have the initial commit yet', 1);
    needsMerge(R);
    const H = commitTree(R, head), work = scan(R), wfiles = dict(), untracked = dict();
    for (const p in R.index) { const w = work[p]; if (w) wfiles[p] = sameAsWork(R, R.index[p], w) ? R.index[p] : { mode: modeOf(w.node), id: store(R, { type: 'blob', text: w.node.d }) }; }
    if (o.untracked || o.all) for (const p in work) if (!R.index[p] && (!work[p].ign || o.all)) untracked[p] = { mode: modeOf(work[p].node), id: store(R, { type: 'blob', text: work[p].node.d }) };
    const staged = Object.keys(Object.assign(dict(), H, R.index)).some((p) => !same(H[p], R.index[p]));
    const local = Object.keys(R.index).some((p) => !same(R.index[p], wfiles[p]));
    if (!staged && !local && !Object.keys(untracked).length) { io.err('No local changes to save\n'); return 0; }
    const list = stashList(R);
    if (list.length >= STASH_MAX) die('fatal: this practice git keeps at most ' + STASH_MAX + ' stash entries: drop some first (git stash drop, or git stash clear)');
    const on = (R.head.branch || '(no branch)') + ': ' + short(head) + ' ' + subject(R.objs[head].message), me = who(R);
    const commit = (tree, parents, msg) => store(R, parseCommit('tree ' + tree + '\n' + parents.map((p) => 'parent ' + p + '\n').join('') + 'author ' + me + '\ncommitter ' + me + '\n\n' + msg));
    const i = commit(writeTree(R, R.index), [head], 'index on ' + on + '\n');
    const u = Object.keys(untracked).length ? commit(writeTree(R, untracked), [], 'untracked files on ' + on + '\n') : null;
    const msg = message !== undefined ? 'On ' + (R.head.branch || '(no branch)') + ': ' + message : 'WIP on ' + on;
    const w = commit(writeTree(R, wfiles), [head, i].concat(u ? [u] : []), msg);   // (as git: this message has no newline at the end)
    flush(R);
    stashWrite(R, [{ id: w, msg }].concat(list));
    // then the working tree and the index go back to HEAD (and the untracked files that were saved go)
    hardReset(R, head);
    for (const p of Object.keys(untracked).sort()) removeWork(R, p);
    if (!o.quiet) io.out('Saved working directory and index state ' + msg + '\n');
    return 0;
  }
  /** git stash apply / pop: the stash's changes merged into the working tree and index of now ("Updated upstream" against "Stashed changes") */
  function stashApply(R, io, sh, id, quiet) {
    needsMerge(R);
    const w = R.objs[id], B = commitTree(R, w.parents[0]), O = Object.assign(dict(), R.index), T = commitTree(R, id);
    let ret = 0;
    if (w.tree === R.objs[w.parents[0]].tree) io.out('Already up to date.\n');
    else {
      const m = threeWay(R, B, O, T, 'Updated upstream', 'Stashed changes'), work = scan(R), { plan, local, untracked } = mergeWrites(R, O, m, work);
      const way = wayMessage(local, untracked);
      if (way) { io.err(way + '\n'); ret = 1; }
      else {
        if (m.notes.length) io.out(m.notes.join('\n') + '\n');
        writeMerge(R, plan, work, m);
        if (Object.keys(m.conflicts).length) ret = 1;
        else { const idx = Object.assign(dict(), O); for (const p in m.result) if (!O[p]) idx[p] = m.result[p]; R.index = idx; }   // as git: the index as it was, with the new files added
        flush(R);
      }
    }
    if (w.parents[2]) {
      const U = commitTree(R, w.parents[2]), work = scan(R), clash = Object.keys(U).sort().filter((p) => work[p] || R.index[p]);
      if (clash.length) { io.err(clash.map((p) => shown(R, p) + ' already exists, no checkout\n').join('') + 'error: could not restore untracked files from stash\n'); ret = 1; }
      else applyPlan(R, Object.keys(U).sort().map((p) => [p, U[p]]), work);
    }
    if (!quiet) statusLong(R, (s) => io.out(s));
    return ret;
  }
  sub('stash', { use: 'git stash [push [-u] [-m <message>]] | git stash (list | show [-p] | pop | apply | drop) [<stash>] | git stash clear', desc: 'Stash the changes in a dirty working directory away',
    run(args, io, sh) {
      const cmd = args[0] && !args[0].startsWith('-') ? args[0] : 'push', rest = args[0] === cmd ? args.slice(1) : args;
      if (!/^(push|save|list|show|pop|apply|drop|clear)$/.test(cmd)) {
        if (/^(branch|create|store)$/.test(cmd)) die('fatal: git stash ' + cmd + ' is not available in this practice git');
        die("fatal: subcommand wasn't specified; 'push' can't be assumed due to unexpected token '" + cmd + "'");
      }
      const R = openRepo(sh);
      if (cmd === 'push' || cmd === 'save') {
        const { o, rest: r } = getopt(rest, { m: 'm=', message: 'm=', u: 'untracked', 'include-untracked': 'untracked', a: 'all', all: 'all', q: 'quiet', quiet: 'quiet', p: 'patch', patch: 'patch', k: 'keep', 'keep-index': 'keep' }, 'stash');
        if (o.patch) die('fatal: git stash -p asks about each change, and this practice git cannot: stash everything, or commit what you want to keep first');
        if (o.keep) die('fatal: --keep-index is not available in this practice git');
        if (cmd === 'push' && r.length) die('fatal: this practice git stashes every change: git stash push without file names (naming files is not available here)');
        return stashPush(R, io, o, cmd === 'save' && r.length ? r.join(' ') : o.m);
      }
      const { o, rest: r } = getopt(rest, { q: 'quiet', quiet: 'quiet', p: 'patch', patch: 'patch', u: 'untracked', 'include-untracked': 'untracked', 'only-untracked': 'only', stat: 'stat', index: 'index' }, 'stash');
      if (o.index) die('fatal: --index is not available in this practice git (the staged changes come back as changes in the files)');
      const list = stashList(R);
      if (cmd === 'list') { io.out(list.map((e, k) => 'stash@{' + k + '}: ' + e.msg + '\n').join('')); return 0; }
      if (cmd === 'clear') { stashWrite(R, []); return 0; }
      if (r.length > 1) die('error: Too many revisions specified:' + r.map((x) => ' ' + q(x)).join(''), 1);
      const e = stashPick(R, list, r[0]);
      if (cmd === 'show') {
        // the stash against the commit it was made on; -u adds the untracked files it saved, --only-untracked shows only those
        const w = R.objs[e.id], B = o.only ? dict() : commitTree(R, w.parents[0]), T = o.only ? dict() : commitTree(R, e.id);
        if ((o.untracked || o.only) && w.parents[2]) Object.assign(T, commitTree(R, w.parents[2]));
        const ch = pairs(R, B, T);
        if (o.stat || !o.patch) diffstat(R, ch, io);
        if (o.patch) { if (o.stat && ch.length) io.out('\n'); patch(R, ch, io); }
        return 0;
      }
      if (cmd === 'drop') { stashWrite(R, list.filter((x, k) => k !== e.n)); if (!o.quiet) io.out('Dropped ' + e.name + ' (' + e.id + ')\n'); return 0; }
      const ret = stashApply(R, io, sh, e.id, o.quiet);
      if (cmd === 'pop') {
        if (ret) { io.err('The stash entry is kept in case you need it again.\n'); return ret; }
        stashWrite(R, list.filter((x, k) => k !== e.n));
        if (!o.quiet) io.out('Dropped ' + e.name + ' (' + e.id + ')\n');
      }
      return ret;
    } });

  // ----- revert and cherry-pick: a commit's change (or its undoing) as a three-way merge into HEAD, then a commit
  const PICK_OPTS = '    --quit                end revert or cherry-pick sequence\n    --continue            resume revert or cherry-pick sequence\n    --abort               cancel revert or cherry-pick sequence\n    --skip                skip current commit and continue\n    --[no-]cleanup <mode> how to strip spaces and #comments from message\n    -n, --no-commit       don\'t automatically commit\n    --commit              opposite of --no-commit\n    -e, --[no-]edit       edit the commit message\n    -s, --[no-]signoff    add a Signed-off-by trailer\n    -m, --[no-]mainline <parent-number>\n                          select mainline parent\n    --[no-]rerere-autoupdate\n                          update the index with reused conflict resolution if possible\n    --[no-]strategy <strategy>\n                          merge strategy\n    -X, --[no-]strategy-option <option>\n                          option for merge strategy\n    -S, --[no-]gpg-sign[=<key-id>]\n                          GPG sign commit\n';
  const PICK_USAGE = {
    revert: 'usage: git revert [--[no-]edit] [-n] [-m <parent-number>] [-s] [-S[<keyid>]] <commit>...\n   or: git revert (--continue | --skip | --abort | --quit)\n\n' + PICK_OPTS + "    --[no-]reference      use the 'reference' format to refer to commits\n\n",
    'cherry-pick': 'usage: git cherry-pick [--edit] [-n] [-m <parent-number>] [-s] [-x] [--ff]\n                       [-S[<keyid>]] <commit>...\n   or: git cherry-pick (--continue | --skip | --abort | --quit)\n\n' + PICK_OPTS +
      '    -x                    append commit name\n    --[no-]ff             allow fast-forward\n    --[no-]allow-empty    preserve initially empty commits\n    --[no-]allow-empty-message\n                          allow commits with empty messages\n    --[no-]keep-redundant-commits\n                          keep redundant, empty commits\n\n',
  };
  function pick(kind) {
    return async function (args, io, sh) {
      let parsed;
      try { parsed = getopt(args, { continue: 'cont', abort: 'abort', skip: 'skip', quit: 'quit', e: 'edit', edit: 'edit', x: 'x', n: 'nocommit', 'no-commit': 'nocommit', m: 'mainline=', mainline: 'mainline=', 'allow-empty': 'empty', ff: 'ff' }, kind); }
      catch (e) { if (e instanceof Fatal && e.code === 129) { io.err(PICK_USAGE[kind]); return 129; } throw e; }   // as git: an option it does not know gets the whole usage
      const { o, rest } = parsed;
      const R = openRepo(sh), revert = kind === 'revert', file = revert ? 'REVERT_HEAD' : 'CHERRY_PICK_HEAD', failed = 'fatal: ' + kind + ' failed';
      const done = () => { for (const f of ['CHERRY_PICK_HEAD', 'REVERT_HEAD', 'MERGE_MSG']) gitRemove(R, f); };
      if (o.cont || o.abort || o.skip || o.quit) {
        if (o.quit) { gitRemove(R, 'CHERRY_PICK_HEAD'); gitRemove(R, 'REVERT_HEAD'); return 0; }   // forget it, keep the files and the index
        if (o.skip && !readId(R, file)) die('error: no ' + kind + ' in progress\n' + failed);
        if (!readId(R, 'CHERRY_PICK_HEAD') && !readId(R, 'REVERT_HEAD')) die('error: no cherry-pick or revert in progress\n' + failed);
        if (o.abort || o.skip) { hardReset(R, headId(R, true)); done(); return 0; }
        return SUB.commit.run(hasEditor(sh) ? [] : ['--no-edit', '--cleanup=strip'], io, sh);   // as git: the editor at a terminal, otherwise the message as it is without its # lines
      }
      if (!rest.length) { io.err(PICK_USAGE[kind]); return 129; }
      if (rest.length > 1) die('fatal: this practice git takes one commit at a time: git ' + kind + ' ' + rest[0] + ', then the next');
      if (o.nocommit) die('fatal: this practice git commits the ' + kind + ' at once (-n is not available here)');
      const id = resolve(R, rest[0]);
      if (!id) die("fatal: bad revision '" + rest[0] + "'");
      const c = R.objs[id], head = headId(R);
      if (c.parents.length > 1) die('error: commit ' + id + ' is a merge but no -m option was given.\n' + failed);
      if (o.mainline !== undefined) die('error: mainline was specified but commit ' + id + ' is not a merge.\n' + failed);
      if (Object.keys(R.conflicts).length) die('error: ' + (revert ? 'Reverting' : 'Cherry-picking') + " is not possible because you have unmerged files.\nhint: Fix them up in the work tree, and then use 'git add/rm <file>'\nhint: as appropriate to mark resolution and make a commit.\n" + failed);
      if (!head) die("fatal: your current branch '" + (R.head.branch || 'HEAD') + "' does not have any commits yet");
      const H = commitTree(R, head);
      if (Object.keys(Object.assign(dict(), H, R.index)).some((p) => !same(H[p], R.index[p]))) die('error: your local changes would be overwritten by ' + kind + '.\nhint: commit your changes or stash them to proceed.\n' + failed);
      // a revert merges the parent's version in, with the commit as the base; a cherry-pick the commit's, with its parent as the base
      const parent = c.parents[0] || null, label = short(id) + ' (' + subject(c.message) + ')', subj = subject(c.message);
      const m = threeWay(R, commitTree(R, revert ? id : parent), H, commitTree(R, revert ? parent : id), 'HEAD', revert ? 'parent of ' + label : label);
      const work = scan(R), { plan, local, untracked } = mergeWrites(R, H, m, work);
      inTheWay(local, untracked, '\n' + failed, 128);
      let msg = revert ? (subj.startsWith('Revert "') && !subj.slice(8).startsWith('Revert "') ? 'Reapply "' + subj.slice(8) : 'Revert "' + subj + '"') + '\n\nThis reverts commit ' + id + '.\n'
        : o.x ? cleanMessage(c.message, 'whitespace').replace(/\n$/, '') + '\n\n(cherry picked from commit ' + id + ')\n' : c.message;
      if (m.notes.length) io.out(m.notes.join('\n') + '\n');
      writeMerge(R, plan, work, m);
      if (Object.keys(m.conflicts).length) {
        flush(R); gitWrite(R, file, id + '\n'); gitWrite(R, 'MERGE_MSG', msg + '\n# Conflicts:\n' + Object.keys(m.conflicts).sort().map((p) => '#\t' + p + '\n').join(''));
        io.err('error: could not ' + (revert ? 'revert' : 'apply') + ' ' + short(id) + '... ' + subj + '\nhint: After resolving the conflicts, mark them with\nhint: "git add/rm <pathspec>", then run\nhint: "git ' + kind + ' --continue".\nhint: You can instead skip this commit with "git ' + kind + ' --skip".\nhint: To abort and get back to the state before "git ' + kind + '",\nhint: run "git ' + kind + ' --abort".\n');
        return 1;
      }
      const tree = writeTree(R, m.result); flush(R);
      if (tree === R.objs[head].tree && !o.empty) {
        if (revert) { statusLong(R, (s) => io.out(s), true); return 1; }
        gitWrite(R, file, id + '\n'); gitWrite(R, 'MERGE_MSG', msg);
        io.err("The previous cherry-pick is now empty, possibly due to conflict resolution.\nIf you wish to commit it anyway, use:\n\n    git commit --allow-empty\n\nOtherwise, please use 'git cherry-pick --skip'\n");
        statusLong(R, (s) => io.out(s)); return 1;
      }
      const me = who(R), author = revert ? me : personText(c.author);
      // the message in the editor: a revert's by default (as git at a terminal), a cherry-pick's with -e
      const editing = hasEditor(sh) && (revert ? o.edit !== false : o.edit === true);
      if (editing) {
        if (!revert) gitWrite(R, file, id + '\n');   // as git: the template says a cherry-pick is going on
        const idents = identLines(parseCommit('tree ' + ZERO + '\nauthor ' + author + '\ncommitter ' + me + '\n\n'), !revert).map((l) => l.replace(/^(Author|Date): /, (x, k) => k + ':' + ' '.repeat(k === 'Date' ? 6 : 4)));
        const edited = cleanMessage(await editMessage(R, 'COMMIT_EDITMSG', commitTemplate(R, msg, revert ? null : { kind }, idents)), 'strip');
        if (edited === '') { gitWrite(R, file, id + '\n'); gitWrite(R, 'MERGE_MSG', msg); io.err('Aborting commit due to empty commit message.\n'); return 1; }
        msg = edited;
      }
      const raw = 'tree ' + tree + '\nparent ' + head + '\nauthor ' + author + '\ncommitter ' + me + '\n\n' + cleanMessage(msg, 'whitespace');
      const nid = store(R, parseCommit(raw)); flush(R);
      setHead(R, nid, kind + ': ' + subject(msg));
      done();
      commitSummary(R, nid, io, R.objs[head].tree, !(editing && revert));   // as git: a revert through the editor is an ordinary commit, which does not say the date
      return 0;
    };
  }
  sub('revert', { use: 'git revert [--no-edit] <commit> | git revert (--continue | --skip | --abort | --quit)', desc: 'Revert some existing commits', run: pick('revert') });
  sub('cherry-pick', { use: 'git cherry-pick [--edit] [-x] <commit> | git cherry-pick (--continue | --skip | --abort | --quit)', desc: 'Apply the changes introduced by some existing commits', run: pick('cherry-pick') });

  sub('tag', { use: 'git tag [-l [<pattern>]] | git tag [-a -m <msg>] <name> [<commit>] | git tag -d <name>', desc: 'Create, list, delete or verify a tag object signed with GPG',
    async run(args, io, sh) {
      const { o, rest } = getopt(args, { l: 'list', list: 'list', d: 'delete', delete: 'delete', a: 'annotate', annotate: 'annotate', m: 'm[]', message: 'm[]', f: 'force', force: 'force', n: 'lines' }, 'tag');
      const R = openRepo(sh);
      if (o.delete) {
        let exit = 0;
        for (const name of rest) { const id = refId(R, 'tags', name); if (!id || id === 'broken') { io.err("error: tag '" + name + "' not found.\n"); exit = 1; continue; } deleteRef(R, 'tags', name); io.out("Deleted tag '" + name + "' (was " + short(id) + ')\n'); }
        return exit;
      }
      if (o.list || !rest.length) {
        const re = rest.length ? new RegExp('^' + rest[0].split('').map((c) => c === '*' ? '.*' : c === '?' ? '.' : c.replace(/[.+^${}()|[\]\\\/]/g, '\\$&')).join('') + '$') : null;
        for (const t of listRefs(R, 'tags')) if (!re || re.test(t.name)) io.out(t.name + (o.lines ? ' '.repeat(Math.max(1, 16 - t.name.length)) + subject(R.objs[t.id].type === 'tag' ? R.objs[t.id].message : R.objs[peel(R, t.id)].message) : '') + '\n');
        return 0;
      }
      const name = rest[0];
      if (!refOk(name)) die("fatal: '" + name + "' is not a valid tag name.");
      if (refId(R, 'tags', name) && !o.force) die("fatal: tag '" + name + "' already exists");
      const target = rest[1] ? resolve(R, rest[1]) : headId(R, true);
      if (!target) die(rest[1] ? 'fatal: Failed to resolve ' + q(rest[1]) + ' as a valid ref.' : "fatal: Failed to resolve 'HEAD' as a valid ref.");
      let id = target;
      if (o.annotate || o.m) {
        let msg;
        if (o.m) msg = cleanMessage(o.m.join('\n\n'), 'whitespace');
        else if (hasEditor(sh)) { msg = cleanMessage(await editMessage(R, 'TAG_EDITMSG', '\n#\n# Write a message for tag:\n#   ' + name + "\n# Lines starting with '#' will be ignored.\n"), 'strip'); if (msg === '') die('fatal: no tag message?'); }
        else die('fatal: there is no text editor in this practice terminal: give the message with -m, as in git tag -a ' + name + ' -m "Version 1"');
        const raw = 'object ' + target + '\ntype commit\ntag ' + name + '\ntagger ' + who(R) + '\n\n' + msg;
        id = store(R, parseTag(raw)); flush(R);
      }
      writeRef(R, 'tags', name, id);
      return 0;
    } });

  // ----- blame: each line of a file, with the commit that last changed it. Lines pass from a commit to a parent while the parent has them
  // unchanged (by the same line diff as git diff); what is left stays with the commit. A root commit's lines are marked ^ (git's boundary).
  // Renames are not followed: a line is the commit's where the file first appears under its name.
  const isoDate = (p) => { const off = (p.tz[0] === '-' ? -1 : 1) * (+p.tz.slice(1, 3) * 60 + +p.tz.slice(3)), d = new Date((p.ts + off * 60) * 1000), two = (n) => String(n).padStart(2, '0'); return d.getUTCFullYear() + '-' + two(d.getUTCMonth() + 1) + '-' + two(d.getUTCDate()) + ' ' + two(d.getUTCHours()) + ':' + two(d.getUTCMinutes()) + ':' + two(d.getUTCSeconds()) + ' ' + p.tz; };
  sub('blame', { use: 'git blame [-s] [-e] [<rev>] [--] <file>', desc: 'Show what revision and author last modified each line of a file',
    run(args, io, sh) {
      const { o, rest, dd } = getopt(args, { s: 'nometa', e: 'email', 'show-email': 'email' }, 'blame');
      const R = openRepo(sh);
      const revs = dd >= 0 ? rest.slice(0, dd) : rest.slice(0, -1), files = dd >= 0 ? rest.slice(dd) : rest.slice(-1);
      if (files.length !== 1 || revs.length > 1) die('usage: git blame [<options>] [<rev-opts>] [<rev>] [--] <file>', 129);
      const rev = revs.length ? mustResolve(R, revs[0]) : null, p = pathspec(R, files[0]).rel, start = rev || headId(R, true);
      const blobAt = (id) => id ? commitTree(R, id)[p] : undefined;
      let finalText, entries = [];
      const pending = dict(), order = [], put = (id, e) => { if (!pending[id]) { pending[id] = []; order.push(id); } pending[id].push(e); };
      if (rev) { const b = blobAt(rev); if (!b) die("fatal: no such path " + p + ' in ' + revs[0]); finalText = text(R, b.id); }
      else {
        const w = scan(R)[p];
        if (!w) die(blobAt(start) || R.index[p] ? "fatal: Cannot lstat '" + files[0] + "': No such file or directory" : "fatal: no such path '" + p + "' in HEAD");
        if (!blobAt(start) && !R.index[p]) die("fatal: no such path '" + p + "' in HEAD");
        finalText = w.node.d;
      }
      const lines = splitL(finalText), owner = new Array(lines.length).fill(null);
      // the line numbers of b's lines in a: → array (−1 where the line is not in a)
      const lineMap = (aText, bText) => { const m = []; let i = 0, j = 0; for (const op of diffOps(splitL(aText), splitL(bText))) { if (op === '=') { m[j++] = i++; } else if (op === '-') i++; else m[j++] = -1; } return m; };
      if (rev) lines.forEach((l, k) => put(rev, [k, k]));
      else {
        // the working tree as a commit of its own, whose parents are HEAD and, during a merge, MERGE_HEAD (as git's fake working tree commit)
        let left = lines.map((l, k) => [k, k]);
        for (const par of [start, readId(R, 'MERGE_HEAD')]) {
          const pb = blobAt(par); if (!pb) continue;
          const m = lineMap(text(R, pb.id), finalText), next = [];
          for (const e of left) { if (m[e[1]] >= 0) put(par, [e[0], m[e[1]]]); else next.push(e); }
          left = next;
        }
      }
      // newest first, as git's queue by commit date; a commit is looked at again if more of its lines arrive later
      let steps = 0;
      while (order.length) {
        let best = 0; for (let k = 1; k < order.length; k++) if (R.objs[order[k]].committer.ts > R.objs[order[best]].committer.ts) best = k;
        const id = order.splice(best, 1)[0], es = pending[id]; delete pending[id];
        if (++steps > 20000) die('fatal: this file has too much history for git blame in this practice terminal');
        const c = R.objs[id], mine = blobAt(id);
        let left = es;
        const twin = c.parents.find((par) => { const pb = blobAt(par); return pb && pb.id === mine.id; });
        if (twin) { for (const e of left) put(twin, e); left = []; }
        for (const par of c.parents) {
          if (!left.length) break;
          const pb = blobAt(par); if (!pb) continue;
          const m = lineMap(text(R, pb.id), text(R, mine.id)), next = [];
          for (const e of left) { if (m[e[1]] >= 0) put(par, [e[0], m[e[1]]]); else next.push(e); }
          left = next;
        }
        for (const e of left) owner[e[0]] = id;
      }
      const meM = /^(.*) <(.*)> (\d+) ([+-]\d{4})$/.exec(who(R)), wt = { name: 'Not Committed Yet', email: 'not.committed.yet', ts: +meM[3], tz: meM[4] };
      const author = (id) => id ? R.objs[id].author : wt, label = (a) => o.email ? '<' + a.email + '>' : a.name;
      const nameW = Math.max(0, ...owner.map((id) => label(author(id)).length)), numW = String(lines.length).length;
      let out = '';
      lines.forEach((l, k) => {
        const id = owner[k], tag = !id ? '00000000' : R.objs[id].parents.length ? id.slice(0, 8) : '^' + id.slice(0, 7), a = author(id);
        out += tag + (o.nometa ? '' : ' (' + label(a).padEnd(nameW) + ' ' + isoDate(a)) + (o.nometa ? ' ' : ' ') + String(k + 1).padStart(numW) + ') ' + l + (l.endsWith('\n') ? '' : '\n');
      });
      io.out(out);
      return 0;
    } });

  // ----- clean: the untracked files go (and with -d the untracked directories); -n only says what would go
  sub('clean', { use: 'git clean [-d] [-f | -n] [-x | -X] [-q] [--] [<pathspec>...]', desc: 'Remove untracked files from the working tree',
    run(args, io, sh) {
      const { o, rest } = getopt(args, { n: 'dry', 'dry-run': 'dry', f: 'force', force: 'force', d: 'dirs', x: 'x', X: 'X', q: 'quiet', quiet: 'quiet', i: 'interactive', interactive: 'interactive', e: 'exclude[]', exclude: 'exclude[]' }, 'clean');
      const R = openRepo(sh), fs = R.fs;
      if (o.interactive) die('fatal: git clean -i asks about each file, and this practice git cannot: see what would go with git clean -n, then git clean -f');
      if (o.x && o.X) die('fatal: options \'-x\' and \'-X\' cannot be used together');
      if (!o.force && !o.dry && configGet(sh, R, 'clean.requireForce') !== 'false') die('fatal: clean.requireForce defaults to true and neither -i, -n, nor -f given; refusing to clean');
      const ss = rest.length ? specs(R, rest) : [{ arg: '.', rel: R.cwdRel, re: null }];
      const work = scan(R), trackedDirs = dict();
      for (const p of Object.keys(R.index).concat(Object.keys(R.conflicts))) { const parts = p.split('/'); for (let k = 1; k < parts.length; k++) trackedDirs[parts.slice(0, k).join('/')] = 1; }
      const want = (p) => o.X ? work[p].ign : o.x || !work[p].ign;
      // the untracked directories at their top (nothing tracked inside, and the one above has something tracked), empty ones too
      const tops = [];
      for (const [abs, n] of fs.walk(R.root)) {
        if (n.t !== 'd' || abs === R.root) continue;
        const rel = R.relOf(abs); if (rel === null || rel.split('/').includes('.git')) continue;
        const up = rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/')) : '';
        if (!trackedDirs[rel] && (up === '' || trackedDirs[up])) tops.push(rel);
      }
      const inTop = (p) => tops.find((d) => p.startsWith(d + '/'));
      const gone = [];
      for (const p of Object.keys(work)) if (!R.index[p] && !R.conflicts[p] && !inTop(p) && anyMatch(ss, p) && want(p)) gone.push({ p, dir: false });
      if (o.dirs) for (const d of tops) {
        if (!anyMatch(ss, d) && !ss.some((s) => !s.re && (s.rel === '' || d.startsWith(s.rel + '/')))) continue;
        const files = Object.keys(work).filter((p) => p.startsWith(d + '/')), picked = files.filter(want);
        if (picked.length === files.length && (files.length || !o.X)) gone.push({ p: d, dir: true });
        else for (const p of picked) gone.push({ p, dir: false });
      }
      gone.sort((a, b) => a.p < b.p ? -1 : a.p > b.p ? 1 : 0);
      for (const g of gone) {
        const name = g.dir ? shownDir(R, g.p) : shown(R, g.p);
        if (o.dry) { io.out('Would remove ' + name + '\n'); continue; }
        const abs = R.abs(g.p);
        if (g.dir && (fs.cwd === abs || fs.cwd.startsWith(abs + '/'))) { io.err('warning: could not remove ' + name + ': you are in it\n'); continue; }
        if (!o.quiet) io.out('Removing ' + name + '\n');
        if (g.dir) fs.rmTree(abs); else fs.unlink(abs);
      }
      return 0;
    } });

  sub('config', { use: 'git config [--global] <name> [<value>] | git config --list | git config --unset <name>', desc: 'Get and set repository or global options',
    run(args, io, sh) {
      const { o, rest } = getopt(args, { global: 'global', local: 'local', l: 'list', list: 'list', unset: 'unset', get: 'get', 'show-origin': 'origin' }, 'config');
      const root = findRoot(sh.fs), R = root === null ? null : loadRepo(sh, root);
      const scope = o.global ? 'global' : o.local ? 'local' : null;
      if (o.local && !R) die('fatal: --local can only be used inside a git repository');
      if (o.list) { for (const f of readConfig(sh, R, scope)) for (const s of f.secs) for (const [k, v] of s.entries) io.out((o.origin ? 'file:' + f.label + '\t' : '') + fullKey(s, k) + '=' + v + '\n'); return 0; }
      if (!rest.length) die('usage: git config [<options>]', 129);
      const k = splitKey(rest[0]);
      if (rest.length === 1 && !o.unset) { const v = configGet(sh, scope === 'global' ? null : R, rest[0]); if (scope === 'local') { const f = readConfig(sh, R, 'local'); let lv = null; for (const ff of f) for (const s of ff.secs) if (s.name === k.sec && s.sub === k.sub) for (const [kk, vv] of s.entries) if (kk === k.key) lv = vv; if (lv === null) return 1; io.out(lv + '\n'); return 0; } if (v === null) return 1; io.out(v + '\n'); return 0; }
      const where = scope || 'local';
      if (where === 'local' && !R) die('fatal: not in a git directory');
      const label = where === 'global' ? '~/.gitconfig' : '.git/config', abs = where === 'global' ? HOME + '/.gitconfig' : R.gd + '/config';
      const secs = sh.fs.isFile(abs) ? parseConfig(sh.fs.read(abs), label) : [];
      let sec = secs.find((s) => s.name === k.sec && s.sub === k.sub);
      if (o.unset) { const before = sec ? sec.entries.length : 0; if (sec) sec.entries = sec.entries.filter(([kk]) => kk !== k.key); if (!sec || sec.entries.length === before) return 5; }
      else {
        const v = String(rest[1]).slice(0, 1000);
        if (!sec) { sec = { name: k.sec, sub: k.sub, entries: [] }; secs.push(sec); }
        const e = sec.entries.find(([kk]) => kk === k.key); if (e) e[1] = v; else sec.entries.push([k.key, v]);
      }
      try { sh.fs.write(abs, configText(secs)); } catch (e) { if (e instanceof FsError) die('error: could not write config file ' + label + ': ' + e.message, 4); throw e; }
      return 0;
    } });

  sub('reflog', { use: 'git reflog', desc: 'Manage reflog information',
    run(args, io, sh) {
      const { rest } = getopt(args, { all: 'all' }, 'reflog');
      if (rest.length && rest[0] !== 'show') die('fatal: this practice git can show the reflog (git reflog), not ' + q(rest[0]) + ' it');
      const R = openRepo(sh), deco = io.tty ? decorations(R) : dict();
      reflog(R).forEach((e, k) => { io.out(short(e.id), io.tty ? 'hd' : undefined); io.out((k === 0 ? deco[e.id] || '' : '') + ' HEAD@{' + k + '}: ' + e.msg + '\n'); });
      return 0;
    } });

  sub('ls-files', { use: 'git ls-files [-s]', desc: 'Show information about files in the index and the working tree',
    run(args, io, sh) {
      const { o } = getopt(args, { s: 'stage', stage: 'stage' }, 'ls-files');
      const R = openRepo(sh);
      const all = Object.keys(R.index).concat(Object.keys(R.conflicts)).filter((p) => R.cwdRel === '' || p.startsWith(R.cwdRel + '/')).sort();
      for (const p of all) {
        if (!o.stage) { io.out(cq(shown(R, p)) + '\n'); continue; }
        if (R.index[p]) io.out(R.index[p].mode + ' ' + R.index[p].id + ' 0\t' + cq(shown(R, p)) + '\n');
        else { const c = R.conflicts[p]; [c.base, c.ours, c.theirs].forEach((s, k) => { if (s) io.out(s.mode + ' ' + s.id + ' ' + (k + 1) + '\t' + cq(shown(R, p)) + '\n'); }); }
      }
      return 0;
    } });

  sub('cat-file', { use: 'git cat-file (-p | -t | -s) <object>', desc: 'Provide contents or details of repository objects',
    run(args, io, sh) {
      const { o, rest } = getopt(args, { p: 'p', t: 't', s: 's', e: 'e' }, 'cat-file');
      const R = openRepo(sh);
      if (!rest.length || !(o.p || o.t || o.s || o.e)) die('usage: git cat-file (-p | -t | -s | -e) <object>', 129);
      const id = resolveObject(R, rest[0]);
      if (!id) { if (o.e) return 1; die('fatal: Not a valid object name ' + rest[0]); }
      const obj = R.objs[id];
      if (o.e) return 0;
      if (o.t) io.out(obj.type + '\n');
      else if (o.s) io.out(body(obj).length + '\n');
      else if (obj.type === 'tree') io.out(obj.entries.map((e) => (e.mode === '40000' ? '040000 tree ' : e.mode + ' blob ') + e.id + '\t' + e.name + '\n').join(''));
      else io.out(obj.type === 'blob' ? obj.text : obj.raw);
      return 0;
    } });

  sub('rev-parse', { use: 'git rev-parse [--short] [--abbrev-ref] [--show-toplevel] [--git-dir] <revision>...', desc: 'Pick out and massage parameters',
    run(args, io, sh) {
      const { o, rest } = getopt(args, { short: 'short', 'abbrev-ref': 'abbrev', 'show-toplevel': 'top', 'git-dir': 'gitdir', 'is-inside-work-tree': 'inside', verify: 'verify', q: 'quiet', quiet: 'quiet' }, 'rev-parse');
      const R = openRepo(sh);
      if (o.top) io.out(R.root + '\n'); if (o.gitdir) io.out((sh.fs.cwd === R.root ? '.git' : R.gd) + '\n'); if (o.inside) io.out('true\n');
      for (const r of rest) {
        if (o.abbrev && (r === 'HEAD' || r === '@')) { io.out((R.head.branch || 'HEAD') + '\n'); continue; }
        const id = resolveObject(R, r) || (o.quiet ? null : badRev(r)); if (!id) return 1;
        io.out((o.abbrev ? r : o.short ? short(id) : id) + '\n');
      }
      return 0;
    } });

  sub('gc', { use: 'git gc', desc: 'Cleanup unnecessary files and optimize the local repository',
    run(args, io, sh) { getopt(args, { prune: 'prune=', aggressive: 'aggr', q: 'quiet', quiet: 'quiet' }, 'gc'); const R = openRepo(sh); prune(R); flush(R); return 0; } });

  sub('help', { use: 'git help [<command>]', desc: 'Display help information about Git',
    run(args, io) {
      const { o, rest } = getopt(args, { a: 'all', all: 'all', g: 'guides', guides: 'guides' }, 'help');
      if (rest.length) return helpPage(rest[0], io);
      if (o.all) { io.out("See 'git help <command>' to read about a specific subcommand\n\nCommands in this practice git\n" + Object.keys(SUB).sort().map((n) => '   ' + n.padEnd(24) + SUB[n].desc + '\n').join('')); return 0; }
      io.out(usage()); return 0;
    } });
  function helpPage(name, io) {
    if (name === 'git') { return SHELL.COMMANDS.man.run(['git'], io); }
    if (!has(SUB, name)) { if (has(NETWORK, name) || has(MISSING, name)) { io.err('git ' + name + ' is not available in this practice terminal.\n'); return 1; } io.err("No manual entry for git" + name + "\n"); return 16; }
    const s = SUB[name];
    io.out('GIT-' + name.toUpperCase() + '(1)\n\n', 'hd'); io.out('NAME\n', 'hd'); io.out('    git-' + name + ' - ' + s.desc + '\n\n'); io.out('SYNOPSIS\n', 'hd'); io.out('    ' + s.use + '\n');
    const wrap = (t) => { const ls = []; let cur = ''; for (const w of t.split(' ')) { if (cur && (cur + ' ' + w).length > 74) { ls.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; } ls.push(cur); return ls.map((l) => '    ' + l + '\n').join(''); };
    if (HELP[name]) { io.out('\n'); io.out('DESCRIPTION\n', 'hd'); io.out(HELP[name].map(wrap).join('\n')); }
    return 0;
  }
  // a few sentences for git help <command>: what it does here, in plain words
  const HELP = {
    init: ['Makes the current directory (or the one named) a repository: a hidden .git directory that keeps the history.'],
    status: ['Says which branch you are on, what is staged (will go into the next commit), what changed but is not staged, and what git does not track yet.', '-s prints one line per file: the left column is the staging area, the right one the working tree (?? = untracked).'],
    add: ['Stages files: their contents now will go into the next commit. git add . stages everything in this directory and below, including deletions.', 'Files matched by a .gitignore are left out unless named with -f.'],
    rm: ['Removes files from the working tree and stages the removal. --cached keeps the file but stops tracking it.'],
    mv: ['Moves or renames a tracked file and stages the change (git status shows it as renamed).'],
    restore: ['git restore FILE throws away the changes to FILE since it was last staged. git restore --staged FILE unstages it (the file itself is not changed).'],
    commit: ['Records the staged files as a new commit on the current branch. -m gives the message; -a stages every change to tracked files first; --amend replaces the last commit.', 'Without -m, the terminal opens nano on the message, under lines starting with # that say what will be committed (they are left out): write the message at the top, save with Ctrl+S and leave with Ctrl+X. An empty message stops the commit.'],
    log: ['Lists the commits from the newest, with their ids, authors, dates and messages. --oneline is shorter; -n 3 shows three; --all includes every branch; -p shows each change; --graph draws the branches and merges beside the commits (git log --graph --oneline --all).'],
    stash: ['Puts your uncommitted changes aside, so the files are as in the last commit again: git stash (or git stash -m "what it is"; -u takes untracked files too). git stash list shows what is put aside, git stash show -p what it changed.', 'git stash pop brings the newest back and forgets it; git stash apply brings it back and keeps it; git stash drop forgets one. If bringing it back meets a conflict, the stash is kept until you fix the files and drop it.'],
    revert: ['Makes a new commit that undoes the changes of an earlier one, without rewriting history: git revert HEAD undoes the last commit. The message is opened in nano (--no-edit takes it as it is).', 'On a conflict, fix the files, git add them and git revert --continue; git revert --abort gives up.'],
    'cherry-pick': ['Copies the change of one commit (from another branch, say) onto the branch you are on, as a new commit with the same message and author: git cherry-pick feature~2. -x adds a line saying where it came from.', 'On a conflict, fix the files, git add them and git cherry-pick --continue; --skip leaves this commit out, --abort gives up.'],
    blame: ['Shows each line of a file with the commit that last changed it, who made that commit and when. A ^ before the id marks the first commit; 00000000 marks lines changed since the last commit.'],
    clean: ['Deletes the untracked files (the ones git status lists under "Untracked files"). git clean -n only says what it would delete; -f deletes; -d also deletes untracked directories; -x also the ignored files. Deleted files do not come back: look with -n first.'],
    diff: ['Shows what changed, line by line: + lines were added, - lines removed. git diff compares the working tree with the staging area; git diff --staged compares the staging area with the last commit; git diff A B compares two commits.'],
    show: ['Shows a commit (the last one if none is named) with its changes. git show HEAD~1:notes.txt prints a file as it was in a commit.'],
    branch: ['Lists the branches (* marks the one you are on), makes one (git branch NAME), deletes one (-d) or renames one (-m).'],
    switch: ['Moves to another branch: the files change to that branch\'s versions. -c NAME makes a new branch and switches to it. git switch - goes back.'],
    checkout: ['The older command for switch and restore: git checkout BRANCH, git checkout -b NEW, git checkout -- FILE.'],
    merge: ['Brings another branch\'s commits into this one. If this branch has not moved on, it fast-forwards; otherwise git makes a merge commit.', 'When both branches changed the same lines, git writes both versions into the file between <<<<<<< ======= >>>>>>> lines: edit the file to what it should be, git add it, then git commit. git merge --abort gives up.'],
    reset: ['git reset FILE unstages a file. git reset --hard COMMIT moves the branch back to COMMIT and makes every tracked file match it: changes since are lost (git reflog still knows the old commits).'],
    tag: ['Gives a commit a name that does not move, such as v1.0. -a makes an annotated tag with its own message (-m "message", or written in nano).'],
    config: ['Reads and sets options: git config --global user.name "Ada Lovelace" and git config --global user.email ada@example.com set who you are for every repository here.'],
    reflog: ['Lists where HEAD has been, newest first: a way to find a commit again after a reset.'],
    gc: ['Removes objects that nothing points to any more, to make space.'],
  };
  const NETWORK = { clone: 1, push: 1, pull: 1, fetch: 1, remote: 1, submodule: 1, 'ls-remote': 1, 'request-pull': 1, 'send-email': 1 };
  const MISSING = { rebase: 1, bisect: 1, worktree: 1, notes: 1, describe: 1, shortlog: 1, grep: 1, am: 1, apply: 1, archive: 1, 'format-patch': 1, mergetool: 1, difftool: 1, 'sparse-checkout': 1, fsck: 1, annotate: 1, 'show-branch': 1 };
  function usage() {
    const groups = [['start a working area', ['init', 'clone']], ['work on the current change', ['add', 'mv', 'restore', 'rm']], ['examine the history and state', ['diff', 'log', 'show', 'status']],
      ['grow, mark and tweak your common history', ['branch', 'commit', 'merge', 'reset', 'switch', 'tag']], ['put changes aside, undo and copy them', ['stash', 'revert', 'cherry-pick']], ['collaborate (not here: there is no network in this practice terminal)', ['fetch', 'pull', 'push']]];
    const descs = { clone: 'Clone a repository into a new directory', fetch: 'Download objects and refs from another repository', pull: 'Fetch from and integrate with another repository or a local branch', push: 'Update remote refs along with associated objects' };
    return 'usage: git [-v | --version] [-h | --help] <command> [<args>]\n\nThese are common Git commands used in various situations:\n' +
      groups.map(([t, cs]) => '\n' + t + '\n' + cs.map((c) => '   ' + c.padEnd(Math.max(10, c.length + 1)) + (SUB[c] ? SUB[c].desc : descs[c]) + '\n').join('')).join('') +
      "\n'git help -a' lists every command of this practice git. See 'git help <command>'\nto read about a specific subcommand. Also here: blame, clean, config, reflog, checkout, ls-files, cat-file, rev-parse, gc.\n";
  }
  // the nearest command names, for "The most similar command is"
  function lev(a, b) { const d = []; for (let i = 0; i <= a.length; i++) { d[i] = [i]; for (let j = 1; j <= b.length; j++) d[i][j] = i === 0 ? j : Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); } return d[a.length][b.length]; }

  /* ---------------- the command itself ---------------- */
  async function git(args, io, sh) {
    try {
      while (/^(--no-pager|-P|--paginate|-p)$/.test(args[0] || '')) args = args.slice(1);
      const cmd = args[0];
      if (cmd === undefined) { io.out(usage()); return 1; }
      if (cmd === '--version' || cmd === '-v' || cmd === 'version') { io.out('git version 2.43.0\n'); return 0; }
      if (cmd === '--help' || cmd === '-h') { io.out(usage()); return 0; }
      if (cmd.startsWith('-')) { io.err('unknown option: ' + cmd + '\nusage: git [-v | --version] [-h | --help] <command> [<args>]\n'); return 129; }
      if (has(NETWORK, cmd)) {
        if (cmd === 'remote' && (args.length === 1 || args[1] === '-v')) return 0;   // no remotes to list
        die('fatal: git ' + cmd + ' needs another computer, and there is no network in this practice terminal.\nEverything that works on your own repository (init, add, commit, log, diff, branch, switch, merge...) works here.');
      }
      if (has(MISSING, cmd)) { io.err('git: ' + q(cmd) + ' is not available in this practice git. See \'git help\' for the commands that are.\n'); return 1; }
      if (!has(SUB, cmd)) {
        const near = Object.keys(SUB).concat(Object.keys(NETWORK)).map((c) => [c, lev(cmd, c)]).filter(([c, d]) => d <= 2 && d < c.length).sort((a, b) => a[1] - b[1] || (a[0] < b[0] ? -1 : 1));
        const best = near.filter(([, d]) => d === (near[0] || [])[1]).map(([c]) => c);
        io.err('git: ' + q(cmd) + " is not a git command. See 'git --help'.\n" + (best.length ? '\nThe most similar command' + (best.length > 1 ? 's are' : ' is') + '\n' + best.map((c) => '\t' + c + '\n').join('') : ''));
        return 1;
      }
      const rest = args.slice(1);
      if (rest[0] === '--help') return helpPage(cmd, io);
      if (rest[0] === '-h' && cmd !== 'help') { io.out('usage: ' + SUB[cmd].use + '\n'); return 129; }
      const r = await SUB[cmd].run(rest, io, sh);
      return typeof r === 'number' ? r : 0;
    } catch (e) {
      if (e instanceof Fatal) { if (e.message) (e.toOut ? io.out : io.err)(e.message.replace(/\n?$/, '\n')); return e.code; }
      if (e instanceof FsError) { io.err('fatal: ' + (e.path ? sh.tilde(e.path) + ': ' : '') + e.message + '\n'); return 128; }
      throw e;
    }
  }
  SHELL.register('git', { cat: 'run', use: 'git COMMAND [options]', run: git,
    desc: 'Version control: keep the history of a project as commits, work on branches and merge them. This is a practice git that works on the files here: start with git init in a project directory, then git add and git commit -m "message". git help lists its commands; git help COMMAND says more about one.',
    opts: Object.keys(SUB).filter((n) => n !== 'help').map((n) => [n, SUB[n].desc]),
    ex: ['git init', 'git status', 'git add notes.txt', 'git commit -m "First version"', 'git log --oneline', 'git diff', 'git switch -c idea', 'git merge idea'],
    notes: 'The repository is the hidden .git directory (ls -a shows it): its objects are in .git/objects.json and the staging area in .git/index, both readable with cat. Ids are real SHA-1s, as in git. There is no network, so clone, push, pull and fetch only say so; rebase and bisect are not here. Without -m, git commit (and git merge, git revert, git tag -a) opens nano on the message, as git opens its editor: write it above the # lines, Ctrl+S saves and Ctrl+X goes back to git. Who you are: git config --global user.name "Your Name" (otherwise commits are by Student <student@lab>). A repository has to fit in the terminal\'s space: about 256 KB of history (git gc frees what nothing uses).' });

  return { sha1, blobId, idOf, merge3, hunks, cleanMessage, SUB };
});
