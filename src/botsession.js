/* The page's end of a bot that stays running (Bot Arena persistent mode; the worker's end is src/botio.js). Loaded by the page and by node
   (test_arena.js runs the real workers in worker_threads). A session is one program in one worker: it is started once, is sent a turn at a time,
   and answers each by printing; it is done with a turn when it asks for more input ({t:'idle'}), so a bot that prints one line is told apart
   from one that prints two, and a bot that is still thinking is told apart from one that is waiting.
     BOTSESSION.open(spawn, source, {startMs, maxOut}) → Promise<{err} | {session}>
       spawn() → {postMessage(m), terminate(), set onmessage(f)}: makes the worker (the page: a Web Worker built from a data block; node: a worker_thread).
     session.turn(text, limitMs) → Promise<{out, err, timedOut, exited}>      session.close()
       exited: the program ended during this turn (what it printed is still the answer; err is set only if it failed)
   A turn that is not answered within limitMs ends the worker (a bot that never finishes cannot be asked to stop); the session is then dead. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BOTSESSION = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const CAP = 16384;   // bytes of one message; the biggest turn (a 40 x 40 board) is under 2 KB
  const available = () => typeof SharedArrayBuffer !== 'undefined' && typeof Atomics !== 'undefined' && (typeof crossOriginIsolated === 'undefined' || crossOriginIsolated === true);

  function open(spawn, source, opts) {
    opts = opts || {};
    return new Promise((resolve) => {
      let sab;
      try { sab = new SharedArrayBuffer(16 + CAP); } catch (e) { resolve({ err: 'This browser cannot share memory with a worker here (the site needs to be cross-origin isolated).' }); return; }
      const ctl = new Int32Array(sab, 0, 4), data = new Uint8Array(sab, 16), enc = new TextEncoder();
      let w; try { w = spawn(); } catch (e) { resolve({ err: 'The sandbox could not be started: ' + (e && e.message || e) }); return; }
      let dead = false, why = '', cur = null, waiter = null, started = false, timer = 0, startTimer = 0;
      const maxOut = opts.maxOut || 200000;
      const kill = (reason) => { if (dead) return; dead = true; why = reason || why; clearTimeout(timer); clearTimeout(startTimer); try { w.terminate(); } catch (e) { /* already gone */ } };
      const finish = (r) => { clearTimeout(timer); const f = waiter; waiter = null; cur = null; if (f) f(r); };
      const send = (text) => {
        const bytes = enc.encode(text);
        if (bytes.length > CAP) return false;
        data.set(bytes, 0); Atomics.store(ctl, 1, bytes.length); Atomics.add(ctl, 0, 1); Atomics.notify(ctl, 0);
        return true;
      };
      const session = {
        get alive() { return !dead; },
        turn(text, limitMs) {
          if (dead) return Promise.resolve({ out: '', err: why || 'the program has ended', exited: true });
          if (waiter) return Promise.resolve({ out: '', err: 'a turn is already being played', exited: false });
          cur = { out: '' };
          return new Promise((res) => {
            waiter = res;
            timer = setTimeout(() => { const out = cur ? cur.out : ''; kill('timed out'); finish({ out, err: null, timedOut: true }); }, limitMs);
            if (!send(text)) { kill('turn too long'); finish({ out: '', err: 'this turn is too long to send', exited: true }); }
          });
        },
        close() { if (dead) return; try { send('GAMEOVER\n'); } catch (e) { /* ignore */ } dead = true; why = 'closed'; clearTimeout(timer); setTimeout(() => { try { w.terminate(); } catch (e) { /* ignore */ } }, 150); }   // the program may read GAMEOVER and finish; either way it ends soon
      };
      w.onmessage = (m) => {
        if (!m || typeof m !== 'object') return;
        if (m.t === 'ready' && !started) { started = true; w.postMessage({ t: 'bot', id: 1, code: String(source), sab }); }
        else if (m.t === 'out' && typeof m.text === 'string') {
          if (cur) { cur.out += m.text; if (cur.out.length > maxOut) { const out = cur.out.slice(0, 2000); kill('printed too much'); finish({ out, err: 'It printed more than it was allowed to, so it was stopped.', exited: true }); } }
        } else if (m.t === 'idle') {
          if (!session.opened) { session.opened = true; clearTimeout(startTimer); resolve({ session }); }
          else finish({ out: cur ? cur.out : '', err: null });
        } else if (m.t === 'done') {
          const err = typeof m.err === 'string' && m.err ? m.err.slice(0, 20000) : null;
          kill(err || 'the program ended');
          if (!session.opened) { session.opened = true; resolve({ err: err || 'The program ended without waiting for a turn. A bot that stays running keeps reading turns until it reads GAMEOVER, or until there is no more input.' }); }
          else finish({ out: cur ? cur.out : '', err, exited: true });   // a program that printed its move and ended (as a restart-mode bot does) has answered; only an error is a failure
        } else if (m.t === 'fatal') {
          kill(String(m.error || 'the sandbox failed'));
          if (!session.opened) { session.opened = true; resolve({ err: String(m.error || 'the sandbox failed') }); } else finish({ out: '', err: why, exited: true });
        }
      };
      w.onerror = (e) => { const msg = (e && e.message) || 'the sandbox failed'; kill(msg); if (!session.opened) { session.opened = true; resolve({ err: msg }); } else finish({ out: cur ? cur.out : '', err: msg, exited: true }); };
      startTimer = setTimeout(() => { if (!session.opened) { session.opened = true; kill('did not start'); resolve({ err: 'The program did not start within ' + Math.round((opts.startMs || 8000) / 1000) + ' seconds.' }); } }, opts.startMs || 8000);
    });
  }
  return { open, available, CAP };
});
