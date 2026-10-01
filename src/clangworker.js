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
  const T = self.clangWasmToolchain;
  let tc = null, last = 0;

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
    let c;
    try {
      c = await tc.lock(() => tc.captureCompilerOutput(() => tc.runtime.compileArtifact(String(m.code), { language: 'CPP', fileName: 'main.cpp', compileArgs: [...T.CLANG_DRIVER_DEFAULT_ARGS, '-std=' + std, '-Wall'] })));
    } catch (e) { post({ t: 'done', id, err: 'The compiler stopped: ' + String(e && e.message || e).slice(0, 300) }); return; }
    const lines = T.compilerDiagnostics(c.raw).filter((l) => !/^Error: process exited with code/.test(l));
    if (c.error) {
      post({ t: 'done', id, err: (lines.length ? lines.join('\n') : String(c.error && c.error.message || c.error)).slice(0, 6000) });
      return;
    }
    if (lines.length) post({ t: 'note', id, text: lines.join('\n').slice(0, 4000) });
    for (let i = 0; i < stdins.length; i++) {
      let all = '', out = '', sent = false, err = null, exit = 0;
      const single = stdins.length === 1;
      const emit = (s, toOut) => { all += s; if (toOut) out += s; if (single) post({ t: 'out', id, text: s }); };
      try {
        const r = await tc.execute(c.result, { args: [], stdin: () => { if (sent) return null; sent = true; return stdins[i]; }, stdout: (s) => emit(s, true), stderr: (s) => emit(s, false) });
        exit = r && typeof r.exitCode === 'number' ? r.exitCode : 0;
      } catch (e) { err = crashText(e); }
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
