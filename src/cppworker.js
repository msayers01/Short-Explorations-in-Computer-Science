/* The C++ runtime. JSCPP and this file are loaded into a Web Worker (or, where workers are unavailable, a sandboxed iframe; see
   runner.js), never into the page, so a program can reach nothing but this interpreter, and a program that does not finish is
   stopped by the page ending the worker.

   Messages from the page: {t:'run', id, code, stdin, maxTimeout}   {t:'trace', id, code, stdin, maxSteps}   (the memory stepper)
   Messages to the page:   {t:'ready'} {t:'out', id, text} {t:'result', id, trace} {t:'done', id, err} */
(function () {
  'use strict';
  const isWorker = typeof document === 'undefined';
  const post = (m) => { if (isWorker) self.postMessage(m); else parent.postMessage(m, '*'); };
  const listen = (f) => { if (isWorker) self.onmessage = (e) => f(e.data); else addEventListener('message', (e) => { if (e.source === parent) f(e.data); }); };
  let busy = false;

  function start(msg) {
    busy = true;
    const id = msg.id, stdin = typeof msg.stdin === 'string' ? msg.stdin : '';
    let buf = '';
    const flush = () => { if (buf) { post({ t: 'out', id, text: buf }); buf = ''; } };
    let err = null;
    try {
      if (msg.t === 'trace') {
        const trace = CPPSTEP.trace(String(msg.code), stdin, { prepare: CPPUTIL.ensureMainReturns, errorText: CPPUTIL.cppErrorText, maxSteps: msg.maxSteps || 1500 });
        post({ t: 'result', id, trace });
      } else {
        JSCPP.run(CPPUTIL.ensureMainReturns(String(msg.code)), stdin, { stdio: { write: (s) => { buf += s; if (buf.length >= 4096) flush(); } }, maxTimeout: msg.maxTimeout || 4000, unsigned_overflow: 'warn' });
      }
    } catch (e) { err = CPPUTIL.cppErrorText(e && e.message ? e.message : String(e)); }
    flush(); busy = false;
    post({ t: 'done', id, err });
  }

  listen((m) => {
    if (!m || typeof m !== 'object' || (m.t !== 'run' && m.t !== 'trace')) return;
    if (busy) post({ t: 'done', id: m.id, err: 'The C++ sandbox is busy with another program.' }); else start(m);
  });
  post({ t: 'ready' });
})();
