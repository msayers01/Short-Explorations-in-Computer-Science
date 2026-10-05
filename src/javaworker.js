/* The Java runtime. src/java.js (the interpreter) and this file are loaded into a Web Worker (or, where workers are unavailable, a sandboxed
   iframe; see runner.js), never into the page, so a program can reach nothing but this interpreter, and a program that does not finish is
   stopped by the page ending the worker.

   Messages from the page: {t:'run', id, code, stdin, maxTimeout, checkOnly}   (checkOnly: compile as javac would, run nothing)   {t:'trace', id, code, stdin, maxSteps}
   Messages to the page:   {t:'ready'} {t:'out', id, text} {t:'result', id, trace} {t:'done', id, err, exit} */
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
    let r;
    try { r = JAVA.run(String(msg.code), stdin, { maxMs: msg.maxTimeout || 5000, checkOnly: msg.checkOnly === true, write: (s) => { buf += s; if (buf.length >= 4096) flush(); } }); }
    catch (e) { r = { err: 'Internal error in the Java interpreter: ' + (e && e.message ? e.message : String(e)), exit: 1 }; }
    flush(); busy = false;
    post({ t: 'done', id, err: r.err, exit: r.exit });
  }

  // A program that stays running (Bot Arena persistent mode): a Scanner on System.in waits, in this worker, for the next turn (src/botio.js).
  function startBot(msg) {
    busy = true;
    const id = msg.id, io = BOTIO.make(msg.sab, (m) => post(m), id);
    let r;
    try { r = JAVA.run(String(msg.code), '', { maxMs: 0, write: io.write, more: io.more }); }   // no clock here: the page ends a turn that takes too long
    catch (e) { r = { err: 'Internal error in the Java interpreter: ' + (e && e.message ? e.message : String(e)), exit: 1 }; }
    io.flush(); busy = false;
    post({ t: 'done', id, err: r.err, exit: r.exit });
  }

  // The step-through (src/javastep.js draws it): the whole run is recorded here and sent back in one message
  function startTrace(msg) {
    busy = true;
    let trace;
    try { trace = JAVA.trace(String(msg.code), typeof msg.stdin === 'string' ? msg.stdin : '', { maxSteps: Math.min(5000, Number(msg.maxSteps) || 2000), maxMs: 5000 }); }
    catch (e) { trace = { steps: [], output: '', error: 'Internal error in the Java interpreter: ' + (e && e.message ? e.message : String(e)) }; }
    busy = false;
    post({ t: 'result', id: msg.id, trace });
    post({ t: 'done', id: msg.id, err: null });
  }

  listen((m) => {
    if (m && typeof m === 'object' && m.t === 'bot') { if (busy) post({ t: 'done', id: m.id, err: 'The Java sandbox is busy with another program.' }); else startBot(m); return; }
    if (m && typeof m === 'object' && m.t === 'trace') { if (busy) post({ t: 'done', id: m.id, err: 'The Java sandbox is busy with another program.' }); else startTrace(m); return; }
    if (!m || typeof m !== 'object' || m.t !== 'run') return;
    if (busy) post({ t: 'done', id: m.id, err: 'The Java sandbox is busy with another program.' }); else start(m);
  });
  post({ t: 'ready' });
})();
