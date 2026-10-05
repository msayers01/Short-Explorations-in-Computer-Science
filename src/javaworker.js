/* The Java runtime. src/java.js (the interpreter) and this file are loaded into a Web Worker (or, where workers are unavailable, a sandboxed
   iframe; see runner.js), never into the page, so a program can reach nothing but this interpreter, and a program that does not finish is
   stopped by the page ending the worker.

   Messages from the page: {t:'run', id, code, stdin, maxTimeout, checkOnly, typed, args, mainClass}   (checkOnly: compile as javac would, run nothing)
   Messages to the page:   {t:'ready'} {t:'out', id, text} {t:'done', id, err, exit, needInput}

   typed: {lines, times, t0, seed, skip}, a program whose input is typed as it asks (runner.js). A worker cannot wait for the page here, so a run
   that wants a line nobody has typed yet ends with needInput, and the page runs it again from the start with one more line. To make the replay
   print what the last run printed, it gets the same random numbers (seed) and a clock that reaches each line's time (times, ms) when the line
   is read; the first skip characters of output, already on the screen, are not sent again. A null in lines is the end of the input (Ctrl+D). */
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
    const opts = { maxMs: msg.maxTimeout || 5000, checkOnly: msg.checkOnly === true, write: (s) => { buf += s; if (buf.length >= 4096) flush(); } };
    if (msg.typed && typeof msg.typed === 'object') typedInput(msg.typed, opts);
    let r;
    opts.args = Array.isArray(msg.args) ? msg.args.slice(0, 1000).map(String) : []; opts.mainClass = typeof msg.mainClass === 'string' ? msg.mainClass : undefined;   // main(String[] args), and the class  java Name  names
    try { r = JAVA.run(String(msg.code), stdin, opts); }
    catch (e) { r = { err: 'Internal error in the Java interpreter: ' + (e && e.message ? e.message : String(e)), exit: 1 }; }
    flush(); busy = false;
    post({ t: 'done', id, err: r.err, exit: r.exit, needInput: r.needInput === true });
  }

  function typedInput(ty, opts) {
    const lines = Array.isArray(ty.lines) ? ty.lines : [], times = Array.isArray(ty.times) ? ty.times : [];
    let skip = Math.max(0, Number(ty.skip) || 0), k = 0, ended = false, shift = 0;
    const write = opts.write;
    opts.write = (s) => { if (skip) { if (s.length <= skip) { skip -= s.length; return; } s = s.slice(skip); skip = 0; } write(s); };
    let a = (Number(ty.seed) | 0) || 1;   // mulberry32
    opts.random = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const t0 = Number(ty.t0) || Date.now(), began = Date.now();
    opts.clock = () => t0 + (Date.now() - began) + shift;
    opts.more = () => {
      if (ended) return '';
      if (k >= lines.length) throw JAVA.NEED_INPUT;
      const at = Number(times[k]) || 0; if (at > opts.clock()) shift += at - opts.clock();
      const v = lines[k++];
      if (v == null) { ended = true; return ''; }
      return String(v) + '\n';
    };
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

  listen((m) => {
    if (m && typeof m === 'object' && m.t === 'bot') { if (busy) post({ t: 'done', id: m.id, err: 'The Java sandbox is busy with another program.' }); else startBot(m); return; }
    if (!m || typeof m !== 'object' || m.t !== 'run') return;
    if (busy) post({ t: 'done', id: m.id, err: 'The Java sandbox is busy with another program.' }); else start(m);
  });
  post({ t: 'ready' });
})();
