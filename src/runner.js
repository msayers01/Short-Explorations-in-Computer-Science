/* The page's side of the program sandboxes. Student programs (Python and C++) never run in the page. Each runs in a Web Worker that
   holds only its interpreter (src/pyworker.js, src/cppworker.js): no DOM, no localStorage, no network (the Content Security Policy is
   inherited), and the page can end it at any moment. Python programs that draw with turtle need a canvas, so they run in a sandboxed
   iframe (no allow-same-origin: its origin is opaque, so it cannot touch this page) with the same interpreter. Where a browser cannot
   make a worker, the same interpreter is loaded into a hidden sandboxed iframe instead.

   Everything that comes back from a sandbox is untrusted data: it is checked, and shown only as text.

   window.PYRUN.run(code, {stdin, execLimit, turtle:{mount,width,height}, onOutput, onInput}) → Promise<{out, err}>
   window.PYRUN.trace(code, {…, onStep}) → {done, next(), finish(), stop()}        window.PYRUN.cancel()
   window.CPPRUN.run(code, {stdin, onOutput}) → Promise<{out, err}>      window.CPPRUN.trace(code, stdin) → Promise<{trace, err}> */
(function () {
  'use strict';
  const MAX_OUT = 2e6;   // characters of output before a program is stopped
  const text = (id) => { const e = document.getElementById(id); return e ? e.textContent : ''; };
  const noop = () => { };
  let hidden = null;
  const hiddenHost = () => { if (!hidden) { hidden = document.createElement('div'); hidden.hidden = true; document.body.append(hidden); } return hidden; };

  function Engine(cfg) {
    let shared = null, workersWork = true, turtleFrame = null, queue = Promise.resolve(), active = null, nextId = 1;

    function workerChannel() {
      return new Promise((resolve, reject) => {
        let w, url, ready = false;
        try { url = URL.createObjectURL(new Blob([text(cfg.srcId)], { type: 'text/javascript' })); w = new Worker(url); } catch (e) { reject(e); return; }
        const ch = { kind: 'worker', onmessage: null, send: (m) => w.postMessage(m), kill: () => { w.terminate(); URL.revokeObjectURL(url); } };
        w.onmessage = (e) => {
          const m = e.data;
          if (!m || typeof m !== 'object') return;
          if (m.t === 'ready' && !ready) { ready = true; resolve(ch); }
          else if (m.t === 'fatal') { ch.kill(); reject(new Error(String(m.error))); }
          else if (ch.onmessage) ch.onmessage(m);
        };
        w.onerror = (e) => { if (e.preventDefault) e.preventDefault(); if (!ready) { ch.kill(); reject(new Error(e.message || 'the worker failed to start')); } };
        setTimeout(() => { if (!ready) { ch.kill(); reject(new Error('the worker did not start')); } }, 20000);
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
      if (workersWork) { try { shared = await workerChannel(); return shared; } catch (e) { workersWork = false; } }
      shared = await frameChannel(null, null);
      return shared;
    }

    function dropChannel(ch) { if (!ch) return; ch.kill(); if (ch === shared) shared = null; if (ch === turtleFrame) turtleFrame = null; }

    function finish(r, extra) {
      if (r.finished) return;
      r.finished = true; clearInterval(r.timer);
      if (active === r) active = null;
      r.resolve(Object.assign({ out: r.out, err: null }, extra));
    }

    function exec(job) {
      const o = job.opts || {};
      return new Promise((resolve) => {
        const r = { id: nextId++, finished: false, resolve, ch: null, out: '', paused: false, waitingInput: false, last: Date.now(), timer: 0, busy: 0, totalMs: job.totalMs || 10000, idleMs: job.idleMs || 8000, result: undefined };
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
        }, (e) => finish(r, { err: 'This browser could not start the sandbox that runs programs (' + (e && e.message || e) + ').' }));
      });
    }

    function onMessage(r, o, m) {
      if (r.finished || !m || typeof m !== 'object' || m.id !== r.id) return;
      r.last = Date.now();
      if (m.t === 'out' && typeof m.text === 'string') {
        r.out += m.text;
        if (o.onOutput) o.onOutput(m.text);
        if (r.out.length > MAX_OUT) { dropChannel(r.ch); finish(r, { err: 'The program printed more than it was allowed to, so it was stopped.' }); }
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
