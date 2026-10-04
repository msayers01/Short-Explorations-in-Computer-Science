/* The Python runtime. Skulpt and this file are loaded into a Web Worker, or (for turtle graphics, which needs a canvas) into a
   sandboxed iframe with no access to the page; see runner.js. They are never loaded into the page itself, so a program can reach
   nothing but this interpreter: no DOM, no localStorage, no network (the page's Content Security Policy is inherited), and a
   runaway program is stopped by the page ending the worker. sandbox.js has already removed Skulpt's modules that reach the page.

   Messages from the page (all carry the id of the run they belong to):
     {t:'run', id, code, stdin, execLimit, turtle}   run a program; stdin is a string, or null to ask the page for each input()
     {t:'trace', id, ...}                            the same, paused before every line (the page answers each pause)
     {t:'input', id, value}   the answer to an input request       {t:'next'}  run the next line       {t:'fast'}  run to the end
   Messages to the page: {t:'ready'} {t:'out', id, text} {t:'input', id, prompt} {t:'step', id, line, depth, vars}
                         {t:'tick', id} {t:'done', id, err} */
(function () {
  'use strict';
  const isWorker = typeof document === 'undefined';
  const post = (m) => { if (isWorker) self.postMessage(m); else parent.postMessage(m, '*'); };
  const listen = (f) => { if (isWorker) self.onmessage = (e) => f(e.data); else addEventListener('message', (e) => { if (e.source === parent) f(e.data); }); };
  const read = (x) => { if (Sk.builtinFiles === undefined || Sk.builtinFiles.files[x] === undefined) throw "File not found: '" + x + "'"; return Sk.builtinFiles.files[x]; };

  function errText(e) {
    let s = e && e.toString ? e.toString() : String(e);
    if (e && e.traceback && e.traceback.length) { const tb = e.traceback[0]; if (tb && tb.lineno && !/line \d+/.test(s)) s += ' on line ' + tb.lineno; }
    return s.replace(/^TimeLimitError: .*$/, 'Time limit exceeded: the program ran for too long. Is there a loop that never ends?');
  }
  // How the step-through shows a value.
  const show = (v) => {
    if (v === undefined) return null;
    try {
      if (v.tp$name === 'function' || v.tp$name === 'builtin_function_or_method') return '<function>';
      if (v.tp$name === 'module') return '<module>';
      if (v.tp$name === 'type') return '<class ' + (v.prototype && v.prototype.tp$name || '?') + '>';
      return Sk.builtin.repr(v).v;
    } catch (e) { return '?'; }
  };

  let cur = null;   // the run in progress: { id, waitInput, waitStep, fast }

  function start(msg) {
    const id = msg.id, trace = msg.t === 'trace';
    const run = cur = { id, waitInput: null, waitStep: null, fast: false };
    let buf = '', timer = 0;
    const flush = () => { if (timer) { clearTimeout(timer); timer = 0; } if (buf) { post({ t: 'out', id, text: buf }); buf = ''; } };
    const output = (s) => { buf += s; if (buf.length >= 4096) flush(); else if (!timer) timer = setTimeout(flush, 0); };
    const inputs = msg.stdin != null ? String(msg.stdin).split('\n') : null;
    const inputfun = (prompt) => {
      if (inputs) { const v = inputs.shift(); return v === undefined ? '' : v; }
      flush();
      return new Promise((resolve) => { run.waitInput = resolve; post({ t: 'input', id, prompt: String(prompt == null ? '' : prompt) }); });
    };
    const cfg = { output, read, __future__: Sk.python3, execLimit: msg.execLimit || 6000, yieldLimit: 100, inputfun, inputfunTakesPrompt: true, retainglobals: false, debugging: trace };
    if (trace) cfg.breakpoints = () => true;
    Sk.configure(cfg);
    if (msg.turtle) Sk.TurtleGraphics = { target: 'turtle', width: msg.turtle.width, height: msg.turtle.height };
    const later = (susp) => new Promise((resolve) => { flush(); post({ t: 'tick', id }); setTimeout(() => resolve(susp.resume()), 0); });
    const handlers = { 'Sk.yield': later, 'Sk.delay': later };
    if (trace) handlers['Sk.debug'] = (susp) => new Promise((resolve) => {
      if (run.fast) { resolve(susp.resume()); return; }
      step(susp); flush();
      run.waitStep = () => resolve(susp.resume());
    });
    function step(susp) {
      let s = susp; const frames = []; while (s) { if (s.$lineno !== undefined) frames.push(s); s = s.child; }
      const inner = frames[frames.length - 1]; if (!inner) return;
      const depth = frames.length, src = depth > 1 ? (inner.$tmps || {}) : (inner.$loc || {});
      const vars = []; for (const k in src) { if (k.startsWith('$') || k.startsWith('__')) continue; const t = show(src[k]); if (t != null) vars.push([k, t]); }
      post({ t: 'step', id, line: inner.$lineno, depth, vars });
    }
    Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('<stdin>', false, String(msg.code), true), handlers)
      .then(() => null, (e) => errText(e))
      .then((err) => { flush(); cur = null; post({ t: 'done', id, err }); });
  }

  // A program that stays running (Bot Arena persistent mode): input() waits, in this worker, for the next turn (src/botio.js), and the
  // program is never ended by a clock here: the page ends the worker when a turn takes too long.
  function startBot(msg) {
    const id = msg.id, io = BOTIO.make(msg.sab, post, id);
    cur = { id, waitInput: null, waitStep: null, fast: false };
    let pending = '';
    const inputfun = () => {   // one line; '' when the input has ended
      for (;;) {
        const i = pending.indexOf('\n');
        if (i >= 0) { const line = pending.slice(0, i); pending = pending.slice(i + 1); return line; }
        const t = io.more();
        if (!t) { const rest = pending; pending = ''; return rest; }
        pending += t;
      }
    };
    Sk.configure({ output: io.write, read, __future__: Sk.python3, execLimit: 1e9, yieldLimit: null, inputfun, inputfunTakesPrompt: false, retainglobals: false });
    Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('<stdin>', false, String(msg.code), true))
      .then(() => null, (e) => errText(e))
      .then((err) => { io.flush(); cur = null; post({ t: 'done', id, err }); });
  }

  listen((m) => {
    if (!m || typeof m !== 'object') return;
    if (m.t === 'bot') { if (cur) post({ t: 'done', id: m.id, err: 'The Python sandbox is busy with another program.' }); else startBot(m); return; }
    if (m.t === 'run' || m.t === 'trace') { if (cur) post({ t: 'done', id: m.id, err: 'The Python sandbox is busy with another program.' }); else start(m); }
    else if (m.t === 'input' && cur && cur.waitInput && m.id === cur.id) { const f = cur.waitInput; cur.waitInput = null; f(String(m.value == null ? '' : m.value)); }
    else if (m.t === 'next' && cur && cur.waitStep) { const f = cur.waitStep; cur.waitStep = null; f(); }
    else if (m.t === 'fast' && cur) { cur.fast = true; if (cur.waitStep) { const f = cur.waitStep; cur.waitStep = null; f(); } }
  });

  // Fail closed: if the lockdown of the dangerous modules did not happen, no program may run.
  if (typeof SANDBOX === 'undefined' || !SANDBOX.removed) post({ t: 'fatal', error: 'The Python sandbox could not be locked down.' });
  else post({ t: 'ready' });
})();
