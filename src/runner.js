/* The page's side of the program sandboxes. Student programs (Python and C++) never run in the page. Each runs in a Web Worker that
   holds only its interpreter (src/pyworker.js, src/cppworker.js): no DOM, no localStorage, and no way to send anything out (the Content
   Security Policy is inherited: the only address a worker may ask for anything at is this site itself, whose files are public), and the page can end it at any moment. Python programs that draw with turtle need a canvas, so they run in a sandboxed
   iframe (no allow-same-origin: its origin is opaque, so it cannot touch this page) with the same interpreter. Where a browser cannot
   make a worker, the same interpreter is loaded into a hidden sandboxed iframe instead.

   Everything that comes back from a sandbox is untrusted data: it is checked, and shown only as text.

   window.PYRUN.run(code, {stdin, execLimit, turtle:{mount,width,height}, onOutput, onInput}) → Promise<{out, err}>
   window.PYRUN.trace(code, {…, onStep}) → {done, next(), finish(), stop()}        window.PYRUN.cancel()
   window.CPPRUN.run(code, {stdin, onOutput}) → Promise<{out, err}>      window.CPPRUN.trace(code, stdin) → Promise<{trace, err}>
   window.CLANGRUN.run(code, {stdin, std, onOutput, onNote}) → Promise<{out, err, exit, notes}>   (real C++; see below: downloaded on demand)
   window.CLANGRUN.runMany(code, [stdin…]) → Promise<{err, parts:[{out, all, err, exit}]}>        compile once, run once for each input */
(function () {
  'use strict';
  const MAX_OUT = 2e6;   // characters of output before a program is stopped
  const text = (id) => { const e = document.getElementById(id); return e ? e.textContent : ''; };
  const noop = () => { };
  let hidden = null;
  const hiddenHost = () => { if (!hidden) { hidden = document.createElement('div'); hidden.hidden = true; document.body.append(hidden); } return hidden; };

  function Engine(cfg) {
    let shared = null, workersWork = true, turtleFrame = null, queue = Promise.resolve(), active = null, nextId = 1;

    function state(st, v) { if (cfg.onState) cfg.onState({ state: st, v: v || 0 }); }

    async function workerChannel() {
      const src = cfg.source ? await cfg.source() : text(cfg.srcId);   // the real-C++ compiler's source is downloaded first
      state('loading', 0);
      return new Promise((resolve, reject) => {
        let w, url, ready = false, timer = 0;
        const arm = () => { clearTimeout(timer); timer = setTimeout(() => { if (!ready) { ch.kill(); state('failed'); reject(new Error('the worker did not start')); } }, cfg.startMs || 20000); };
        try { url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' })); w = new Worker(url); } catch (e) { state('failed'); reject(e); return; }
        const ch = { kind: 'worker', onmessage: null, send: (m) => w.postMessage(m), kill: () => { clearTimeout(timer); w.terminate(); URL.revokeObjectURL(url); if (ready) state('idle'); } };
        w.onmessage = (e) => {
          const m = e.data;
          if (!m || typeof m !== 'object') return;
          if (m.t === 'ready' && !ready) { ready = true; clearTimeout(timer); state('ready'); resolve(ch); }
          else if (m.t === 'progress' && !ready) { state('loading', Number(m.v) || 0); arm(); }
          else if (m.t === 'fatal') { ch.kill(); state('failed'); reject(new Error(String(m.error))); }
          else if (ch.onmessage) ch.onmessage(m);
        };
        w.onerror = (e) => { if (e.preventDefault) e.preventDefault(); if (!ready) { ch.kill(); state('failed'); reject(new Error(e.message || 'the worker failed to start')); } };
        arm();
      });
    }

    function frameChannel(mount, size) {
      return new Promise((resolve, reject) => {
        const f = document.createElement('iframe');
        f.setAttribute('sandbox', 'allow-scripts');   // no allow-same-origin: the frame is a stranger to this page
        f.setAttribute('title', 'Output of the program');
        f.style.cssText = size ? 'border:0;display:block;max-width:100%;width:' + size.width + 'px;height:' + size.height + 'px' : 'display:none';
        f.srcdoc = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:transparent}</style></head><body><div id="turtle"></div><script>' + text('py-boot') + '<' + '/script></body></html>';
        let ready = false;
        const ch = { kind: 'frame', el: f, onmessage: null, send: (m) => { if (f.contentWindow) f.contentWindow.postMessage(m, '*'); }, kill: () => { window.removeEventListener('message', onwin); f.remove(); } };
        const onwin = (e) => {
          if (e.source !== f.contentWindow) return;
          const m = e.data;
          if (!m || typeof m !== 'object') return;
          if (m.t === 'booted') f.contentWindow.postMessage({ t: 'init', src: text(cfg.srcId) }, '*');
          else if (m.t === 'ready' && !ready) { ready = true; resolve(ch); }
          else if (m.t === 'fatal') { ch.kill(); reject(new Error(String(m.error))); }
          else if (ch.onmessage) ch.onmessage(m);
        };
        window.addEventListener('message', onwin);
        (mount || hiddenHost()).append(f);
        setTimeout(() => { if (!ready) { ch.kill(); reject(new Error('the sandbox did not start')); } }, 20000);
      });
    }

    async function channelFor(o) {
      if (o.turtle && o.turtle.mount) {   // a canvas is needed: always a fresh frame, shown where the drawing goes
        if (turtleFrame) { turtleFrame.kill(); turtleFrame = null; }
        o.turtle.mount.textContent = '';
        turtleFrame = await frameChannel(o.turtle.mount, { width: o.turtle.width, height: o.turtle.height });
        return turtleFrame;
      }
      if (shared) return shared;
      if (cfg.workerOnly) {   // no fallback: the compiler needs a worker, and says so if it cannot have one
        // A download can fail for a moment (a dropped connection, a busy server), so a failed start is tried a second time before it is reported.
        try { shared = await workerChannel(); } catch (e) { shared = await workerChannel(); }
        return shared;
      }
      if (workersWork) { try { shared = await workerChannel(); return shared; } catch (e) { workersWork = false; } }
      shared = await frameChannel(null, null);
      return shared;
    }

    function dropChannel(ch) { if (!ch) return; ch.kill(); if (ch === shared) shared = null; if (ch === turtleFrame) turtleFrame = null; }

    function finish(r, extra) {
      if (r.finished) return;
      r.finished = true; clearInterval(r.timer);
      if (active === r) active = null;
      r.resolve(Object.assign({ out: r.out, err: null, parts: r.parts, notes: r.notes }, extra));
    }

    function exec(job) {
      const o = job.opts || {};
      return new Promise((resolve) => {
        const r = { id: nextId++, finished: false, resolve, ch: null, out: '', parts: [], notes: '', paused: false, waitingInput: false, last: Date.now(), timer: 0, busy: 0, totalMs: job.totalMs || 10000, idleMs: job.idleMs || 8000, result: undefined };
        active = r;
        channelFor(o).then((ch) => {
          if (r.finished) return;   // stopped while the sandbox was starting
          r.ch = ch; ch.onmessage = (m) => onMessage(r, o, m);
          r.last = Date.now();
          r.timer = setInterval(() => {
            // The sandbox's own time limit does not always work (a loop that never yields, a huge allocation), so the page keeps time too:
            // a program is ended when it has been busy for too long in total, or when it has said nothing for a while. Time spent
            // waiting for the student (input, or a pause in the step-through) does not count.
            if (r.finished || r.waitingInput || r.paused) return;
            r.busy += 500;
            if (r.busy > r.totalMs || Date.now() - r.last > r.idleMs) { dropChannel(r.ch); finish(r, { err: cfg.timeoutMessage }); }
          }, 500);
          ch.send(Object.assign({ t: job.t, id: r.id }, job.payload));
        }, (e) => finish(r, { err: cfg.startError ? cfg.startError(e) : 'This browser could not start the sandbox that runs programs (' + (e && e.message || e) + ').' }));
      });
    }

    function onMessage(r, o, m) {
      if (r.finished || !m || typeof m !== 'object' || m.id !== r.id) return;
      r.last = Date.now();
      if (m.t === 'out' && typeof m.text === 'string') {
        r.out += m.text;
        if (o.onOutput) o.onOutput(m.text);
        if (r.out.length > MAX_OUT) { dropChannel(r.ch); finish(r, { err: 'The program printed more than it was allowed to, so it was stopped.' }); }
      } else if (m.t === 'note' && typeof m.text === 'string') {
        r.notes += m.text;
        if (o.onNote) o.onNote(m.text);
      } else if (m.t === 'part') {
        if (r.parts.length < 500) r.parts.push({ out: String(m.out == null ? '' : m.out).slice(0, MAX_OUT), all: String(m.all == null ? '' : m.all).slice(0, MAX_OUT), err: typeof m.err === 'string' ? m.err : null, exit: Number(m.exit) || 0 });
      } else if (m.t === 'input') {
        r.waitingInput = true;
        Promise.resolve().then(() => (o.onInput ? o.onInput(String(m.prompt == null ? '' : m.prompt)) : '')).then((v) => v, () => '').then((v) => {
          if (r.finished) return;
          r.waitingInput = false; r.last = Date.now();
          r.ch.send({ t: 'input', id: r.id, value: String(v == null ? '' : v) });
        });
      } else if (m.t === 'step') {
        r.paused = true;
        if (o.onStep) o.onStep({ line: Number(m.line) || 0, depth: Number(m.depth) || 1, vars: (Array.isArray(m.vars) ? m.vars : []).filter((v) => Array.isArray(v) && v.length === 2).map((v) => [String(v[0]), String(v[1])]) });
      } else if (m.t === 'result' && m.trace && typeof m.trace === 'object') {
        r.result = m.trace;
      } else if (m.t === 'done') {
        finish(r, { err: typeof m.err === 'string' ? m.err : null, result: r.result });
      }
    }

    return {
      run(job) { const p = queue.then(() => exec(job)); queue = p.then(noop, noop); return p; },
      cancel() { const r = active; if (r) { dropChannel(r.ch); finish(r, { err: 'Stopped.' }); } },
      resume(msg) { const r = active; if (r && r.ch && r.paused) { r.paused = false; r.last = Date.now(); r.ch.send(msg); } },
      fast() { const r = active; if (r && r.ch) { r.paused = false; r.last = Date.now(); r.ch.send({ t: 'fast' }); } }
    };
  }

  const py = Engine({ srcId: 'py-src', timeoutMessage: 'Time limit exceeded: the program ran for too long. Is there a loop that never ends?' });
  const cpp = Engine({ srcId: 'cpp-src', timeoutMessage: 'Time limit exceeded: the program ran for too long. Is there a loop that never ends?' });

  // Real C++ (Clang built for WebAssembly, src/clangworker.js). Unlike the others it is not in the page: its files (about 29 MB, from dist/clang/) are
  // downloaded the first time they are needed, and the browser keeps them. A student agrees to that first (CLANGRUN.allow); nothing is fetched before.
  const CLANG = () => (window.BUILD && window.BUILD.clang) || null;
  const clangListeners = new Set();
  let clangState = { state: 'idle', v: 0 };
  let allowedNow = false;
  const KEY = 'se.realcpp';
  async function clangSource() {
    if (!CLANG()) throw new Error('this copy of the site was built without it');
    if (location.protocol !== 'http:' && location.protocol !== 'https:') throw new Error('it only works when the site is opened from a web address, not from a file on this computer');
    const base = new URL(CLANG().path, location.href).href;
    const r = await fetch(base + 'toolchain.js');
    if (!r.ok) throw new Error('the compiler files are not on this site (' + r.status + ')');
    return 'self.CLANG_BASE=' + JSON.stringify(base) + ';\n' + await r.text() + ';\n' + text('clang-src');
  }
  const clang = Engine({
    workerOnly: true, source: clangSource, startMs: 40000,
    onState: (s) => { clangState = s; clangListeners.forEach((f) => { try { f(s); } catch (e) { /* a listener's problem is its own */ } }); },
    startError: (e) => 'The real C++ compiler could not be loaded: ' + (e && e.message || e) + '.',
    timeoutMessage: 'Time limit exceeded: the program (or the compiler) ran for too long. Is there a loop that never ends?'
  });
  window.CLANGRUN = {
    /** can this copy of the site offer real C++ at all? → null, or the reason it cannot */
    unavailable() {
      if (!CLANG()) return 'this copy of the site does not include it';
      if (location.protocol !== 'http:' && location.protocol !== 'https:') return 'it needs the site to be opened from a web address (not as a file on this computer)';
      if (typeof Worker === 'undefined' || typeof WebAssembly === 'undefined') return 'this browser cannot run it';
      return null;
    },
    mb: () => (CLANG() ? CLANG().mb : 0),
    /** has the student agreed to the download? (remembered on this device) */
    allowed() { if (allowedNow) return true; try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } },
    allow() { allowedNow = true; try { localStorage.setItem(KEY, '1'); } catch (e) { /* kept for this visit only */ } },
    state: () => clangState,
    subscribe(f) { clangListeners.add(f); return () => clangListeners.delete(f); },
    /** compile once, run once for each input in stdins → Promise<{out, err, parts:[{out, all, err, exit}], notes}>; err is the compiler's messages */
    runMany: (code, stdins, opts) => { opts = opts || {}; const n = stdins.length; return clang.run({ t: 'run', totalMs: 10000 + 2000 * n, idleMs: 10000 + 2000 * n, opts, payload: { code: String(code), stdins: stdins.map(String), std: opts.std } }); },
    run: (code, opts) => { opts = opts || {}; return window.CLANGRUN.runMany(code, [opts.stdin == null ? '' : opts.stdin], opts).then((r) => Object.assign(r, { exit: r.parts[0] ? r.parts[0].exit : 0, err: r.err || (r.parts[0] && r.parts[0].err) || null })); },
    cancel: () => clang.cancel()
  };

  const pyJob = (t, code, opts) => {
    opts = opts || {};
    const execLimit = opts.execLimit || 6000;
    // A drawing takes as long as its animation, which the browser also slows down while the canvas is off screen: give it more time (Stop is always there).
    const turtle = !!opts.turtle;
    return { t, totalMs: turtle ? 90000 : execLimit + 1500, idleMs: turtle ? 90000 : 8000, opts, payload: { code: String(code), stdin: opts.stdin == null ? null : String(opts.stdin), execLimit, turtle: opts.turtle ? { width: opts.turtle.width, height: opts.turtle.height } : undefined } };
  };
  window.PYRUN = {
    run: (code, opts) => py.run(pyJob('run', code, opts)),
    trace(code, opts) {
      const done = py.run(pyJob('trace', code, Object.assign({ execLimit: 60000 }, opts)));
      return { done, next: () => py.resume({ t: 'next' }), finish: () => py.fast(), stop: () => py.cancel() };
    },
    cancel: () => py.cancel()
  };
  window.CPPRUN = {
    run: (code, opts) => { opts = opts || {}; return cpp.run({ t: 'run', totalMs: 7000, idleMs: 7000, opts, payload: { code: String(code), stdin: opts.stdin == null ? '' : String(opts.stdin), maxTimeout: 4000 } }); },
    trace: (code, stdin, opts) => { opts = opts || {}; return cpp.run({ t: 'trace', totalMs: 9000, idleMs: 9000, opts, payload: { code: String(code), stdin: String(stdin || ''), maxSteps: opts.maxSteps || 1500 } }); },
    cancel: () => cpp.cancel()
  };
})();
