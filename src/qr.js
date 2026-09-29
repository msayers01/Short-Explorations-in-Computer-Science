/* A small QR code encoder: byte mode, versions 1-40, error-correction L or M, all 8 masks.
   qr.encode(text, {ec}) -> {size, get(x,y)}; qr.svg(text, {ec, scale}) -> SVG string.
   Exposed as window.QR (browser) or module.exports (node). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(); else root.QR = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  // ---- Galois field GF(256) with the QR polynomial 0x11d
  const EXP = new Array(512), LOG = new Array(256);
  (function () { let x = 1; for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d; } for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]; })();
  const mul = (a, b) => (a && b) ? EXP[LOG[a] + LOG[b]] : 0;
  function rsGenerator(n) { let g = [1]; for (let i = 0; i < n; i++) { const ng = new Array(g.length + 1).fill(0); for (let j = 0; j < g.length; j++) { ng[j] ^= g[j]; ng[j + 1] ^= mul(g[j], EXP[i]); } g = ng; } return g; }
  function rsEncode(data, n) { const gen = rsGenerator(n); const res = new Array(n).fill(0); for (const d of data) { const f = d ^ res[0]; res.shift(); res.push(0); if (f) for (let j = 0; j < n; j++) res[j] ^= mul(gen[j + 1], f); } return res; }

  // ---- capacity tables: [total codewords, EC codewords per block for L, blocks L, ec M, blocks M] per version
  // ecPerBlock and numBlocks from the QR spec (ISO 18004 table 9), levels L and M only.
  const TABLE = [
    [26, 7, 1, 10, 1], [44, 10, 1, 16, 1], [70, 15, 1, 26, 1], [100, 20, 1, 18, 2], [134, 26, 1, 24, 2], [172, 18, 2, 16, 4], [196, 20, 2, 18, 4], [242, 24, 2, 22, 4], [292, 30, 2, 22, 5], [346, 18, 4, 26, 5],
    [404, 20, 4, 30, 5], [466, 24, 4, 22, 8], [532, 26, 4, 22, 9], [581, 30, 4, 24, 9], [655, 22, 6, 24, 10], [733, 24, 6, 28, 10], [815, 28, 6, 28, 11], [901, 30, 6, 26, 13], [991, 28, 7, 26, 14], [1085, 28, 8, 26, 16],
    [1156, 28, 8, 26, 17], [1258, 28, 9, 28, 17], [1364, 30, 9, 28, 18], [1474, 30, 10, 28, 20], [1588, 26, 12, 28, 21], [1706, 28, 12, 28, 23], [1828, 30, 12, 28, 25], [1921, 30, 13, 28, 26], [2051, 30, 14, 28, 28], [2185, 30, 15, 28, 29],
    [2323, 30, 16, 28, 31], [2465, 30, 17, 28, 33], [2611, 30, 18, 30, 35], [2761, 30, 19, 30, 37], [2876, 30, 19, 30, 38], [3034, 30, 20, 30, 40], [3196, 30, 21, 30, 43], [3362, 30, 22, 30, 45], [3532, 30, 24, 30, 47], [3706, 30, 25, 30, 49]
  ];
  const ALIGN = [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]];

  function capacity(version, ec) { const t = TABLE[version - 1]; const ecw = ec === 'M' ? t[3] : t[1], blocks = ec === 'M' ? t[4] : t[2]; return { total: t[0], data: t[0] - ecw * blocks, ecw, blocks }; }
  function toBytes(text) { if (typeof TextEncoder !== 'undefined') return Array.from(new TextEncoder().encode(text)); const s = unescape(encodeURIComponent(text)); return Array.from(s, c => c.charCodeAt(0)); }

  function encode(text, opts) {
    opts = opts || {}; const ec = opts.ec === 'M' ? 'M' : 'L';
    const bytes = toBytes(text);
    let version = 0;
    for (let v = 1; v <= 40; v++) { const c = capacity(v, ec); const lenBits = v < 10 ? 8 : 16; if (4 + lenBits + bytes.length * 8 <= c.data * 8) { version = v; break; } }
    if (!version) throw new Error('Text too long for a QR code (' + bytes.length + ' bytes; the maximum is about 2950).');
    const cap = capacity(version, ec);
    // bit stream: mode 0100, length, data, terminator, pad
    const bits = [];
    const push = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >> i) & 1); };
    push(4, 4); push(bytes.length, version < 10 ? 8 : 16); for (const b of bytes) push(b, 8);
    const maxBits = cap.data * 8; push(0, Math.min(4, maxBits - bits.length)); while (bits.length % 8) bits.push(0);
    const data = []; for (let i = 0; i < bits.length; i += 8) { let b = 0; for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j]; data.push(b); }
    for (let p = 0; data.length < cap.data; p++) data.push(p % 2 ? 0x11 : 0xec);
    // split into blocks (the first group has shorter blocks)
    const nShort = cap.blocks - (cap.data % cap.blocks), shortLen = Math.floor(cap.data / cap.blocks);
    const blocks = [], ecs = []; let pos = 0;
    for (let b = 0; b < cap.blocks; b++) { const len = shortLen + (b < nShort ? 0 : 1); const blk = data.slice(pos, pos + len); pos += len; blocks.push(blk); ecs.push(rsEncode(blk, cap.ecw)); }
    const out = [];
    for (let i = 0; i <= shortLen; i++) for (const blk of blocks) if (i < blk.length) out.push(blk[i]);
    for (let i = 0; i < cap.ecw; i++) for (const e of ecs) out.push(e[i]);
    // matrix
    const size = version * 4 + 17;
    const m = new Array(size * size).fill(-1);   // -1 = free, 0/1 = fixed
    const set = (x, y, v) => { m[y * size + x] = v; };
    const get = (x, y) => m[y * size + x];
    const finder = (cx, cy) => { for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const x = cx + dx, y = cy + dy; if (x < 0 || y < 0 || x >= size || y >= size) continue; const d = Math.max(Math.abs(dx), Math.abs(dy)); set(x, y, d <= 3 && d !== 2 ? 1 : 0); } };
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    const al = ALIGN[version - 1];
    const inFinder = (cx, cy) => (cx <= 8 && cy <= 8) || (cx >= size - 9 && cy <= 8) || (cx <= 8 && cy >= size - 9);
    for (const cy of al) for (const cx of al) { if (inFinder(cx, cy)) continue; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1 ? 1 : 0); }
    for (let i = 8; i < size - 8; i++) { if (get(i, 6) < 0) set(i, 6, i % 2 === 0 ? 1 : 0); if (get(6, i) < 0) set(6, i, i % 2 === 0 ? 1 : 0); }
    // reserve format areas (and version areas)
    for (let i = 0; i < 9; i++) { if (get(i, 8) < 0) set(i, 8, 0); if (get(8, i) < 0) set(8, i, 0); }
    for (let i = 0; i < 8; i++) { if (get(size - 1 - i, 8) < 0) set(size - 1 - i, 8, 0); if (get(8, size - 1 - i) < 0) set(8, size - 1 - i, 0); }
    set(8, size - 8, 1);
    if (version >= 7) for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) { set(i, size - 11 + j, 0); set(size - 11 + j, i, 0); }
    // place data
    const isFree = (x, y) => get(x, y) < 0;
    const dataBits = []; for (const b of out) for (let i = 7; i >= 0; i--) dataBits.push((b >> i) & 1);
    let bi = 0, upward = true;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let k = 0; k < size; k++) {
        const y = upward ? size - 1 - k : k;
        for (const x of [right, right - 1]) if (isFree(x, y)) { const bit = bi < dataBits.length ? dataBits[bi] : 0; bi++; set(x, y, bit); }
      }
      upward = !upward;
    }
    // masks and penalty
    const MASKS = [(x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x, y) => x % 3 === 0, (x, y) => (x + y) % 3 === 0, (x, y) => (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0, (x, y) => (x * y) % 2 + (x * y) % 3 === 0, (x, y) => ((x * y) % 2 + (x * y) % 3) % 2 === 0, (x, y) => ((x + y) % 2 + (x * y) % 3) % 2 === 0];
    const isData = new Array(size * size).fill(false);
    // data modules are those not in function patterns: recompute by replaying reservation on a fresh map
    (function () { const f = new Array(size * size).fill(false); const mark = (x, y) => { f[y * size + x] = true; };
      const fin = (cx, cy) => { for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const x = cx + dx, y = cy + dy; if (x >= 0 && y >= 0 && x < size && y < size) mark(x, y); } };
      fin(3, 3); fin(size - 4, 3); fin(3, size - 4);
      for (let i = 0; i < size; i++) { mark(i, 6); mark(6, i); }
      for (const cy of al) for (const cx of al) { if ((cx <= 8 && cy <= 8) || (cx >= size - 9 && cy <= 8) || (cx <= 8 && cy >= size - 9)) continue; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) mark(cx + dx, cy + dy); }
      for (let i = 0; i < 9; i++) { mark(i, 8); mark(8, i); } for (let i = 0; i < 8; i++) { mark(size - 1 - i, 8); mark(8, size - 1 - i); }
      if (version >= 7) for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) { mark(i, size - 11 + j); mark(size - 11 + j, i); }
      for (let i = 0; i < size * size; i++) isData[i] = !f[i]; })();
    const applyMask = (k) => { const r = m.slice(); const f = MASKS[k]; for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (isData[y * size + x] && f(x, y)) r[y * size + x] ^= 1; writeFormat(r, k); return r; };
    function writeFormat(r, k) {
      const ecBits = ec === 'M' ? 0 : 1; let v = (ecBits << 3) | k; let d = v << 10;
      for (let i = 14; i >= 10; i--) if ((d >> i) & 1) d ^= 0x537 << (i - 10);
      const fmt = ((v << 10) | d) ^ 0x5412;
      const bit = (i) => (fmt >> i) & 1;
      const S = (x, y, val) => { r[y * size + x] = val; };
      for (let i = 0; i < 6; i++) S(8, i, bit(i)); S(8, 7, bit(6)); S(8, 8, bit(7)); S(7, 8, bit(8)); for (let i = 9; i < 15; i++) S(14 - i, 8, bit(i));
      for (let i = 0; i < 8; i++) S(size - 1 - i, 8, bit(i)); for (let i = 8; i < 15; i++) S(8, size - 15 + i, bit(i));
      S(8, size - 8, 1);
      if (version >= 7) { let vv = version << 12; for (let i = 17; i >= 12; i--) if ((vv >> i) & 1) vv ^= 0x1f25 << (i - 12); const vi = (version << 12) | vv; for (let i = 0; i < 18; i++) { const b = (vi >> i) & 1; S(Math.floor(i / 3), size - 11 + (i % 3), b); S(size - 11 + (i % 3), Math.floor(i / 3), b); } }
    }
    const penalty = (r) => {
      let p = 0; const at = (x, y) => r[y * size + x];
      for (let y = 0; y < size; y++) { let run = 1; for (let x = 1; x < size; x++) { if (at(x, y) === at(x - 1, y)) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; } }
      for (let x = 0; x < size; x++) { let run = 1; for (let y = 1; y < size; y++) { if (at(x, y) === at(x, y - 1)) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; } }
      for (let y = 0; y < size - 1; y++) for (let x = 0; x < size - 1; x++) { const a = at(x, y); if (a === at(x + 1, y) && a === at(x, y + 1) && a === at(x + 1, y + 1)) p += 3; }
      const pat1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0], pat2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
      for (let y = 0; y < size; y++) for (let x = 0; x <= size - 11; x++) { let a = true, b = true; for (let i = 0; i < 11; i++) { if (at(x + i, y) !== pat1[i]) a = false; if (at(x + i, y) !== pat2[i]) b = false; } if (a || b) p += 40; }
      for (let x = 0; x < size; x++) for (let y = 0; y <= size - 11; y++) { let a = true, b = true; for (let i = 0; i < 11; i++) { if (at(x, y + i) !== pat1[i]) a = false; if (at(x, y + i) !== pat2[i]) b = false; } if (a || b) p += 40; }
      let dark = 0; for (const v of r) if (v === 1) dark++; p += Math.floor(Math.abs(dark * 100 / (size * size) - 50) / 5) * 10;
      return p;
    };
    let best = null, bestP = Infinity;
    for (let k = 0; k < 8; k++) { const r = applyMask(k); const p = penalty(r); if (p < bestP) { bestP = p; best = r; } }
    return { size, version, get: (x, y) => best[y * size + x] === 1, modules: best };
  }
  function svg(text, opts) {
    opts = opts || {}; const q = encode(text, opts); const quiet = 4, scale = opts.scale || 4, dim = (q.size + 2 * quiet) * scale;
    let path = '';
    for (let y = 0; y < q.size; y++) for (let x = 0; x < q.size; x++) if (q.get(x, y)) path += 'M' + ((x + quiet) * scale) + ' ' + ((y + quiet) * scale) + 'h' + scale + 'v' + scale + 'h-' + scale + 'z';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + dim + ' ' + dim + '" width="' + dim + '" height="' + dim + '" shape-rendering="crispEdges" role="img" aria-label="QR code"><rect width="100%" height="100%" fill="#fff"/><path d="' + path + '" fill="#000"/></svg>';
  }
  return { encode, svg };
});
