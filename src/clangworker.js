/* The real C++ runtime: Clang (built for WebAssembly) compiles the program, and the result runs in this worker. It is never loaded in the page.
   runner.js downloads the toolchain script from this site, puts self.CLANG_BASE and the script in front of this file, and starts a Web Worker
   from the whole text, so a program can reach nothing but its own memory, and the page ends the worker if the program does not finish.

   Messages from the page: {t:'run', id, code, stdins:[string…], std, compileOnly, runMs, lang, args, argv0, typed}   compile once, then run once for each input
                           (or, compileOnly, not at all); after a good compile the worker posts {t:'phase', id, ms: runMs}, and the page times the program from then on.
                           lang 'c' compiles the source as C (main.c; std gnu99…gnu23 or c89…c23) instead of C++. args: the program's argv after its name (argv0).
                           typed: {lines, times, t0, seed, skip}, input typed as the program asks (runner.js typedRunner, as for Java). The worker cannot wait
                           for the page, so a read past the lines typed so far ends the run with {t:'done', needInput:true}, and the page runs it again with
                           one more line. A replay prints what the last run printed: its clock reaches each line's time as the line is read, its random bytes
                           come from seed, and the first skip characters of output, already on the screen, are not sent again. A null line ends the input.
   Messages to the page:   {t:'progress', v} (while the toolchain downloads)  {t:'ready'}  {t:'fatal', error}
                           {t:'note', id, text}                       compiler warnings
                           {t:'out', id, text}                        what the program prints, as it prints (only when there is a single input)
                           {t:'part', id, i, out, all, err, exit}     one finished run: out = stdout, all = stdout and stderr in order, err = why it crashed
                           {t:'done', id, err, needInput}             err = the compiler's error messages, when the program did not compile */
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

  // C as the Lab and the terminal run it: three lines go AFTER the student's code (so no line number moves). stdout is made unbuffered, as a
  // terminal shows it: a prompt printed without a newline (printf("Name? ")) would otherwise still sit in the buffer when scanf reads, and typed
  // input would ask before the question is on the screen. And clock(), which this C library leaves out (WASI has no process clock), becomes the
  // time since the program started, so a program that times its own loops links and works.
  const C_TAIL = '\n#include <stdio.h>\n#include <time.h>\n' +
    'static struct timespec se_start_; static void __attribute__((constructor)) se_lab_start_(void) { setvbuf(stdout, 0, _IONBF, 0); clock_gettime(CLOCK_MONOTONIC, &se_start_); }\n' +
    'clock_t clock(void) { struct timespec t; clock_gettime(CLOCK_MONOTONIC, &t); return (clock_t)((t.tv_sec - se_start_.tv_sec) * (long long)CLOCKS_PER_SEC + (t.tv_nsec - se_start_.tv_nsec) / (1000000000 / CLOCKS_PER_SEC)); }\n';
  const cSource = (code) => String(code) + C_TAIL;
  // the -std= each language takes; anything else becomes the default (the Lab's pickers and the terminal's gcc send only these)
  const stdFor = (lang, std) => (lang === 'c' ? (/^(gnu|c)(89|99|11|17|23)$/.test(std) ? std : 'gnu17') : (/^gnu\+\+(11|14|17|20|23)$/.test(std) ? std : 'gnu++20'));

  if (typeof self === 'undefined') { module.exports = { limitMemory, MAX_PAGES, cSource, stdFor }; return; }   // loaded by a test in node, not as a worker
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
    WebAssembly.instantiate = (x, imports) => (replay && x instanceof WebAssembly.Module && imports && imports.wasi_snapshot_preview1 ? replayed(instantiate, x, imports) : instantiate(capped(x), imports));
  }
  // Typed input replays a program (see above), so in a replay the program's clock and its random bytes must come out as they did the time before.
  // The student's program is the only module instantiated with WASI imports while a typed run goes on (replay is set): its clock_time_get reads
  // replay.clock() (ms) and its random_get takes bytes from replay.random(). rand() needs nothing: it starts from the same seed in every run, and
  // srand(time(0)) reads this clock.
  let replay = null;
  function replayed(instantiate, mod, imports) {
    const w = imports.wasi_snapshot_preview1, r = replay; let mem = null;
    const wasi = Object.assign({}, w, {
      clock_time_get(id, precision, ptr) { const e = w.clock_time_get(id, precision, ptr); if (e === 0 && mem) new DataView(mem.buffer).setBigUint64(ptr, BigInt(Math.floor(r.clock() * 1e6)), true); return e; },
      random_get(buf, len) { if (!mem) return w.random_get(buf, len); const b = new Uint8Array(mem.buffer, buf, len); for (let i = 0; i < len; i++) b[i] = (r.random() * 256) | 0; return 0; }
    });
    return instantiate(mod, Object.assign({}, imports, { wasi_snapshot_preview1: wasi, wasi_unstable: wasi })).then((res) => { mem = (res.instance || res).exports.memory; return res; });
  }
  const NEED_INPUT = { needInput: true };
  function typedInput(ty) {
    const lines = Array.isArray(ty.lines) ? ty.lines : [], times = Array.isArray(ty.times) ? ty.times : [];
    const t0 = Number(ty.t0) || Date.now(), began = Date.now();
    let k = 0, ended = false, shift = 0, a = (Number(ty.seed) | 0) || 1;
    const clock = () => t0 + (Date.now() - began) + shift;
    return {
      clock, skip: Math.max(0, Number(ty.skip) || 0),
      random: () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; },   // mulberry32, as in javaworker.js
      more() {   // stdin's next chunk: the next typed line, or null at the end of the input; past the last line typed so far, the run ends here
        if (ended) return null;
        if (k >= lines.length) throw NEED_INPUT;
        const at = Number(times[k]) || 0; if (at > clock()) shift += at - clock();
        const v = lines[k++];
        if (v == null) { ended = true; return null; }
        return String(v) + '\n';
      }
    };
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
    const isC = m.lang === 'c', std = stdFor(isC ? 'c' : 'cpp', m.std);
    const code = isC ? cSource(m.code) : String(m.code), key = (isC ? 'c' : 'cpp') + '\0' + std + '\0' + code;
    const ty = m.typed && typeof m.typed === 'object' && stdins.length === 1 ? typedInput(m.typed) : null;
    const args = Array.isArray(m.args) ? m.args.slice(0, 1000).map((a) => String(a).slice(0, 10000)) : [];
    let c;
    try {
      // If clang crashes or runs out of memory it can leave without an error code, and the build would then carry on with the object file and
      // program of the PREVIOUS compile (another student's, in a teacher's review). So both files are emptied first: a build that did not
      // really happen then fails to link, instead of running somebody else's program.
      c = await tc.lock(() => tc.captureCompilerOutput(() => { if (lastGood !== key) { for (const f of ['main.o', 'main.wasm']) tc.addFile(f, new Uint8Array(0)); tc.runtime.lastBuildKey = null; } return tc.runtime.compileArtifact(code, { language: isC ? 'C' : 'CPP', fileName: isC ? 'main.c' : 'main.cpp', compileArgs: [...T.CLANG_DRIVER_DEFAULT_ARGS, '-std=' + std, '-Wall'] }); }));
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
    lastGood = key;
    if (m.compileOnly !== true) post({ t: 'phase', id, ms: Number(m.runMs) || 0 });   // the program's own time limit starts now (runner.js)
    if (lines.length && !(ty && m.typed.lines.length)) post({ t: 'note', id, text: lines.join('\n').slice(0, 4000) });   // warnings once, not again in each replay
    if (m.compileOnly === true) { post({ t: 'done', id, err: null }); return; }   // g++ in the practice terminal: the program runs later, from ./name
    let art = c.result;
    try {
      const capped = limitMemory(art.bytes, MAX_PAGES);
      if (!capped) throw new Error('unexpected program layout');
      art = Object.assign({}, art, { bytes: capped, wasm: new WebAssembly.Module(capped) });
    } catch (e) { post({ t: 'done', id, err: 'The program could not be prepared to run safely (' + String(e && e.message || e).slice(0, 100) + ').' }); return; }
    for (let i = 0; i < stdins.length; i++) {
      let all = '', out = '', sent = false, err = null, exit = 0;
      const single = stdins.length === 1;
      let flooded = false, pending = '', sentAt = Date.now(), skip = ty ? ty.skip : 0, needInput = false;
      // C's stdout is unbuffered (C_TAIL), so a putchar loop would be one message a character: its output goes to the page a line at a time (or
      // 4 KB, or 50 ms), and all of it before the program reads, so a prompt is on the screen when it asks. The worker cannot use a timer while
      // the program runs, so text without a newline before a loop that never ends stays here, as a line-buffered terminal would keep it.
      // C++ is sent as it comes, as before (libc++ buffers it already).
      const flush = () => { if (pending) { post({ t: 'out', id, text: pending }); pending = ''; } sentAt = Date.now(); };
      const emit = (s, toOut) => {
        if (all.length + s.length > MAX_OUT) { flooded = true; throw new Error('output limit'); }   // ends the program: it cannot print without end into this worker's memory
        all += s; if (toOut) out += s;
        if (skip) { if (s.length <= skip) { skip -= s.length; return; } s = s.slice(skip); skip = 0; }   // a replay: this much is on the screen already
        if (single) { pending += s; if (!isC || s.includes('\n') || pending.length >= 4096 || Date.now() - sentAt > 50) flush(); }
      };
      const stdin = ty ? () => { flush(); return ty.more(); } : () => { if (sent) return null; sent = true; return stdins[i]; };
      replay = ty;
      try {
        const r = await tc.execute(art, { args, programName: typeof m.argv0 === 'string' && m.argv0 ? m.argv0.slice(0, 200) : undefined, stdin, stdout: (s) => emit(s, true), stderr: (s) => emit(s, false) });
        exit = r && typeof r.exitCode === 'number' ? r.exitCode : 0;
      } catch (e) { if (e === NEED_INPUT) needInput = true; else err = flooded ? 'The program printed more than it was allowed to, so it was stopped.' : crashText(e); }
      finally { replay = null; }
      flush();
      if (needInput) { post({ t: 'done', id, err: null, needInput: true }); return; }   // the page asks for a line and runs it again (runner.js)
      post({ t: 'part', id, i, out, all, err, exit });
    }
    post({ t: 'done', id, err: null });
  }

  let busy = false;
  self.onmessage = (e) => {
    const m = e.data;
    if (!m || typeof m !== 'object' || m.t !== 'run') return;
    if (busy) { post({ t: 'done', id: m.id, err: 'The compiler is busy with another program.' }); return; }
    busy = true;
    run(m).catch((x) => post({ t: 'done', id: m.id, err: 'The compiler stopped: ' + String(x && x.message || x).slice(0, 300) })).then(() => { busy = false; });
  };

  T.createToolchain({ baseUrl: self.CLANG_BASE, onProgress: (v) => { const p = Math.floor(Number(v) * 100); if (p > last) { last = p; post({ t: 'progress', v: p / 100 }); } } })
    .then((t) => { tc = t; post({ t: 'ready' }); }, (e) => post({ t: 'fatal', error: 'the compiler could not be loaded (' + String(e && e.message || e).slice(0, 200) + ')' }));
})();
