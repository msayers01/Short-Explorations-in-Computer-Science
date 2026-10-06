/* The C++ runtime. JSCPP and this file are loaded into a Web Worker (or, where workers are unavailable, a sandboxed iframe; see
   runner.js), never into the page, so a program can reach nothing but this interpreter, and a program that does not finish is
   stopped by the page ending the worker.

   Messages from the page: {t:'run', id, code, stdin, maxTimeout, typed}   {t:'trace', id, code, stdin, maxSteps}   (the memory stepper)
                           typed: {lines, times, t0, skip}, input typed as the program asks: replayed as in javaworker.js (runner.js)
                           {t:'check', id, code}   (g++ in the practice terminal: parse the program, run nothing)
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
    let err = null, needInput = false, exit = 0;
    try {
      if (msg.t === 'check') {
        // JSCPP's debugger parses the program and prepares it without running a statement; the parse errors are what g++ would report here
        JSCPP.run(CPPUTIL.ensureMainReturns(String(msg.code)), '', { stdio: { write: () => { } }, debug: true, maxTimeout: msg.maxTimeout || 4000, unsigned_overflow: 'warn' });
      } else if (msg.t === 'trace') {
        const trace = CPPSTEP.trace(String(msg.code), stdin, { prepare: CPPUTIL.ensureMainReturns, errorText: CPPUTIL.cppErrorText, maxSteps: msg.maxSteps || 1500 });
        post({ t: 'result', id, trace });
      } else {
        let write = (s) => { buf += s; if (buf.length >= 4096) flush(); };
        if (msg.typed && typeof msg.typed === 'object') { typed = typedInput(msg.typed); const w = write; let skip = Math.max(0, Number(msg.typed.skip) || 0); write = (s) => { if (skip) { if (s.length <= skip) { skip -= s.length; return; } s = s.slice(skip); skip = 0; } w(s); }; }
        const ret = JSCPP.run(CPPUTIL.ensureMainReturns(String(msg.code)), typed ? '' : stdin, { stdio: { write }, maxTimeout: msg.maxTimeout || 4000, unsigned_overflow: 'warn' });
        if (typeof ret === 'number' && isFinite(ret)) exit = ((Math.trunc(ret) % 256) + 256) % 256;   // what main returns is the program's exit status, as a byte
      }
    } catch (e) { if (e === NEED_INPUT || (e && e.needInput)) needInput = true; else err = CPPUTIL.cppErrorText(e && e.message ? e.message : String(e)); }
    typed = null; flush(); busy = false;
    post({ t: 'done', id, err, exit: err ? undefined : exit, needInput });
  }

  // Typed input: a run that wants a line nobody has typed yet ends (needInput) and is run again with one more line. time() follows a clock that
  // reaches each line's time when the line is read, so srand(time(0)) picks the same numbers in every replay (rand() itself starts the same each run).
  const NEED_INPUT = { needInput: true };
  let typed = null;
  function typedInput(ty) {
    const lines = Array.isArray(ty.lines) ? ty.lines : [], times = Array.isArray(ty.times) ? ty.times : [];
    const t0 = Number(ty.t0) || Date.now(), began = Date.now();
    let k = 0, ended = false, shift = 0;
    const clock = () => t0 + (Date.now() - began) + shift;
    return {
      clock,
      more() {
        if (ended) return '';
        if (k >= lines.length) throw NEED_INPUT;
        const at = Number(times[k]) || 0; if (at > clock()) shift += at - clock();
        const v = lines[k++];
        if (v == null) { ended = true; return ''; }
        return String(v) + '\n';
      }
    };
  }

  // A program that stays running (Bot Arena persistent mode). JSCPP reads cin from a string it takes once, so cin's buffer is replaced by one that,
  // whenever nothing but white space is left, waits here for the next turn (src/botio.js). A normal run (botIO is null) is untouched.
  // Typed input (typed, above) uses the same buffer, but there each read waits only as a console would: >> until there is a word, getline() and
  // get() until there is anything at all, so the newline left by cin >> n ends a getline() at once, as in real C++.
  let botIO = null;
  const plainLoad = JSCPP.includes.iostream.load;
  JSCPP.includes.iostream.load = function (rt) {
    plainLoad.call(this, rt);
    if (!botIO && !typed) return;
    const io = botIO || typed, cin = rt.scope[0].variables.cin;
    let buf = cin.v.buf || '', lineRead = false;
    const need = () => (lineRead ? buf === '' : !/\S/.test(buf));
    Object.defineProperty(cin.v, 'buf', { get() { while (need()) { const t = io.more(); if (!t) break; buf += t; } return buf; }, set(v) { buf = v; } });
    if (!typed) return;
    const h = rt.types[rt.getTypeSignature(cin.t)].handlers;
    for (const name of ['getline', 'get']) {
      const fs = h[name] && h[name].functions; if (!fs) continue;
      for (const sig of Object.keys(fs)) { const f = fs[sig]; fs[sig] = function () { lineRead = true; try { return f.apply(this, arguments); } finally { lineRead = false; } }; }
    }
  };
  const plainTime = JSCPP.includes.ctime && JSCPP.includes.ctime.load;
  if (plainTime) JSCPP.includes.ctime.load = function (rt) {
    if (!typed) return plainTime.call(this, rt);
    const clock = typed.clock;
    return rt.regFunc((rt) => rt.val(rt.intTypeLiteral, Math.floor(clock() / 1000)), 'global', 'time', [rt.longTypeLiteral], rt.longTypeLiteral);
  };
  function startBot(msg) {
    busy = true;
    const id = msg.id, io = BOTIO.make(msg.sab, post, id);
    let err = null;
    botIO = io;
    try { JSCPP.run(CPPUTIL.ensureMainReturns(String(msg.code)), '', { stdio: { write: io.write }, unsigned_overflow: 'warn' }); }   // no maxTimeout: the page ends a turn that takes too long
    catch (e) { err = CPPUTIL.cppErrorText(e && e.message ? e.message : String(e)); }
    botIO = null; io.flush(); busy = false;
    post({ t: 'done', id, err });
  }

  listen((m) => {
    if (m && typeof m === 'object' && m.t === 'bot') { if (busy) post({ t: 'done', id: m.id, err: 'The C++ sandbox is busy with another program.' }); else startBot(m); return; }
    if (!m || typeof m !== 'object' || (m.t !== 'run' && m.t !== 'trace' && m.t !== 'check')) return;
    if (busy) post({ t: 'done', id: m.id, err: 'The C++ sandbox is busy with another program.' }); else start(m);
  });
  post({ t: 'ready' });
})();
