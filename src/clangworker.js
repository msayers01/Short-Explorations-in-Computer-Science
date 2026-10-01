/* The real C++ runtime: Clang (built for WebAssembly) compiles the program, and the result runs in this worker. It is never loaded in the page.
   runner.js downloads the toolchain script from this site, puts self.CLANG_BASE and the script in front of this file, and starts a Web Worker
   from the whole text, so a program can reach nothing but its own memory, and the page ends the worker if the program does not finish.

   Messages from the page: {t:'run', id, code, stdins:[string…], std}   compile once, then run once for each input
   Messages to the page:   {t:'progress', v} (while the toolchain downloads)  {t:'ready'}  {t:'fatal', error}
                           {t:'note', id, text}                       compiler warnings
                           {t:'out', id, text}                        what the program prints, as it prints (only when there is a single input)
                           {t:'part', id, i, out, all, err, exit}     one finished run: out = stdout, all = stdout and stderr in order, err = why it crashed
                           {t:'done', id, err}                        err = the compiler's error messages, when the program did not compile */
(function () {
  'use strict';
  const post = (m) => self.postMessage(m);
  let tc = null, last = 0, lastGood = null;   // lastGood: the std and source of the last compile that really succeeded

  // A program may use at most this much memory: 256 MB (4096 pages of 64 KiB). The wasm32 limit is 4 GB, enough to push a small
  // computer into trouble, so the limit is written into the program's own memory declaration before it runs.
  const MAX_PAGES = 4096, MAX_OUT = 2e6;
  const leb = (n) => { const o = []; do { let b = n & 0x7f; n >>>= 7; if (n) b |= 0x80; o.push(b); } while (n); return o; };
  const readLeb = (a, i) => { let v = 0, sh = 0, b; do { b = a[i++]; v |= (b & 0x7f) << sh; sh += 7; } while (b & 0x80); return [v >>> 0, i]; };
  /** the module's bytes with its memory capped at maxPages, or null if the module has no memory section of the usual shape */
  function limitMemory(bytes, maxPages) {
    if (bytes.length < 8 || bytes[0] !== 0 || bytes[1] !== 0x61 || bytes[2] !== 0x73 || bytes[3] !== 0x6d) return null;
    let i = 8;
    while (i < bytes.length) {
      const secStart = i; const id = bytes[i++]; let size; [size, i] = readLeb(bytes, i);
      if (id !== 5) { i += size; continue; }
      const end = i + size; let count; let j; [count, j] = readLeb(bytes, i);
      if (count !== 1) return null;                                    // exactly one memory, as the linker makes it
      const flags = bytes[j++]; if (flags & 0x6) return null;        // not shared, not 64-bit
      let min; [min, j] = readLeb(bytes, j);
      let max = maxPages;
      if (flags & 1) { let old; [old, j] = readLeb(bytes, j); max = Math.min(old, maxPages); }
      if (j !== end || min > max) return null;
      const body = [1, 1].concat(leb(min), leb(max));                    // one memory; flags 1 (has a maximum); minimum; maximum
      const head = bytes.subarray(0, secStart), tail = bytes.subarray(end), lenBytes = leb(body.length);
      const out = new Uint8Array(head.length + 1 + lenBytes.length + body.length + tail.length);
      out.set(head, 0); out[head.length] = 5; out.set(lenBytes, head.length + 1); out.set(body, head.length + 1 + lenBytes.length); out.set(tail, head.length + 1 + lenBytes.length + body.length);
      return out;
    }
    return null;
  }

  if (typeof self === 'undefined') { module.exports = { limitMemory, MAX_PAGES }; return; }   // loaded by a test in node, not as a worker
  const T = self.clangWasmToolchain;

  // The compiler is a program too: a source file built to make it use enormous amounts of memory (templates that multiply, a huge initializer)
  // could take 2 GB or more before the page ends the worker. Its modules are capped to 1 GB as they are compiled (a normal program needs a few
  // hundred MB at most); past that the compile fails and the worker reports it.
  const COMPILER_PAGES = 16384;
  {
    const compile = WebAssembly.compile.bind(WebAssembly), instantiate = WebAssembly.instantiate.bind(WebAssembly);
    const view = (x) => (x instanceof ArrayBuffer ? new Uint8Array(x) : ArrayBuffer.isView(x) ? new Uint8Array(x.buffer, x.byteOffset, x.byteLength) : null);
    const capped = (x) => { const b = view(x); if (!b || b.length < 1e6) return x; return limitMemory(b, COMPILER_PAGES) || x; };   // only the big modules (the compiler, the linker)
    WebAssembly.compile = (x) => compile(capped(x));
    WebAssembly.instantiate = (x, imports) => instantiate(capped(x), imports);
  }

  const crashText = (e) => {
    const msg = String(e && e.message ? e.message : e);
    if (/unreachable/i.test(msg)) return 'The program stopped abnormally: abort(), a failed assert, an .at() or [] that went out of range, a call that cannot continue, or a function that called itself until the stack was full.';
    if (/out of bounds|memory access/i.test(msg)) return 'The program used memory that is not its own, so it was stopped.';
    if (/call stack|stack overflow|too much recursion/i.test(msg)) return 'The program called itself (recursion) too deeply, until the stack was full.';
    if (/memory|allocation/i.test(msg)) return 'The program asked for more memory than it can have.';
    return 'The program crashed (' + msg.slice(0, 200) + ').';
  };

  async function run(m) {
    const id = m.id, stdins = Array.isArray(m.stdins) && m.stdins.length ? m.stdins.map(String) : [''];
    const std = /^gnu\+\+(11|14|17|20|23)$/.test(m.std) ? m.std : 'gnu++20';
    const code = String(m.code);
    let c;
    try {
      // If clang crashes or runs out of memory it can leave without an error code, and the build would then carry on with the object file and
      // program of the PREVIOUS compile (another student's, in a teacher's review). So both files are emptied first: a build that did not
      // really happen then fails to link, instead of running somebody else's program.
      c = await tc.lock(() => tc.captureCompilerOutput(() => { if (lastGood !== std + '\0' + code) { for (const f of ['main.o', 'main.wasm']) tc.addFile(f, new Uint8Array(0)); tc.runtime.lastBuildKey = null; } return tc.runtime.compileArtifact(code, { language: 'CPP', fileName: 'main.cpp', compileArgs: [...T.CLANG_DRIVER_DEFAULT_ARGS, '-std=' + std, '-Wall'] }); }));
    } catch (e) { post({ t: 'done', id, err: 'The compiler stopped: ' + String(e && e.message || e).slice(0, 300) }); return; }
    const lines = T.compilerDiagnostics(c.raw).filter((l) => !/^Error: process exited with code/.test(l) && !/^\s+at /.test(l));   // no stack traces
    // clang's own errors count too, whatever the exit code said
    const failed = !!c.error || lines.some((l) => /^\S+:\d+:\d+: (fatal )?error:/.test(l) || /^LLVM ERROR/.test(l) || /^(Range|Runtime|Type)?Error: /.test(l) && !/^Error: process exited/.test(l));
    if (failed) {
      const msg = String(c.error && c.error.message || c.error).split('\n')[0];
      const crash = lines.find((l) => /^LLVM ERROR/.test(l) || /^(Range|Runtime|Type)?Error: /.test(l));
      const hasMessage = lines.some((l) => /^\S+:\d+:\d+: (fatal )?error:/.test(l));
      const text = crash && !hasMessage || (!lines.length && /call stack|too much recursion|out of memory/i.test(msg))
        ? 'The compiler could not finish: this program is too large or too deeply nested for it (' + (crash || msg).slice(0, 80) + ').'
        : lines.length ? lines.join('\n') : 'The compiler stopped: ' + msg;
      post({ t: 'done', id, err: text.slice(0, 6000) });
      return;
    }
    lastGood = std + '\0' + code;
    if (lines.length) post({ t: 'note', id, text: lines.join('\n').slice(0, 4000) });
    let art = c.result;
    try {
      const capped = limitMemory(art.bytes, MAX_PAGES);
      if (!capped) throw new Error('unexpected program layout');
      art = Object.assign({}, art, { bytes: capped, wasm: new WebAssembly.Module(capped) });
    } catch (e) { post({ t: 'done', id, err: 'The program could not be prepared to run safely (' + String(e && e.message || e).slice(0, 100) + ').' }); return; }
    for (let i = 0; i < stdins.length; i++) {
      let all = '', out = '', sent = false, err = null, exit = 0;
      const single = stdins.length === 1;
      let flooded = false;
      const emit = (s, toOut) => {
        if (all.length + s.length > MAX_OUT) { flooded = true; throw new Error('output limit'); }   // ends the program: it cannot print without end into this worker's memory
        all += s; if (toOut) out += s; if (single) post({ t: 'out', id, text: s });
      };
      try {
        const r = await tc.execute(art, { args: [], stdin: () => { if (sent) return null; sent = true; return stdins[i]; }, stdout: (s) => emit(s, true), stderr: (s) => emit(s, false) });
        exit = r && typeof r.exitCode === 'number' ? r.exitCode : 0;
      } catch (e) { err = flooded ? 'The program printed more than it was allowed to, so it was stopped.' : crashText(e); }
      post({ t: 'part', id, i, out, all, err, exit });
    }
    post({ t: 'done', id, err: null });
  }

  let busy = false;
  self.onmessage = (e) => {
    const m = e.data;
    if (!m || typeof m !== 'object' || m.t !== 'run') return;
    if (busy) { post({ t: 'done', id: m.id, err: 'The C++ compiler is busy with another program.' }); return; }
    busy = true;
    run(m).catch((x) => post({ t: 'done', id: m.id, err: 'The compiler stopped: ' + String(x && x.message || x).slice(0, 300) })).then(() => { busy = false; });
  };

  T.createToolchain({ baseUrl: self.CLANG_BASE, onProgress: (v) => { const p = Math.floor(Number(v) * 100); if (p > last) { last = p; post({ t: 'progress', v: p / 100 }); } } })
    .then((t) => { tc = t; post({ t: 'ready' }); }, (e) => post({ t: 'fatal', error: 'the compiler could not be loaded (' + String(e && e.message || e).slice(0, 200) + ')' }));
})();
