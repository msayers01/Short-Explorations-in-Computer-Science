/* The worker's end of a bot that stays running (Bot Arena persistent mode). The page and the worker share a small block of memory
   (a SharedArrayBuffer, so the site must be cross-origin isolated: see build.js, the COOP and COEP headers). The page writes the text of a turn
   into it and wakes the worker; a program that wants more input calls more(), which tells the page it is waiting ({t:'idle'}) and then sleeps
   (Atomics.wait) until the page has written the next turn. A worker may block like this; the page never does.
     layout: Int32 [0] a counter the page bumps for every message, [1] the message's length in bytes; the bytes start at offset 16.
   more() gives the text the page sent, or '' once the page has sent GAMEOVER (the end of the match). Output goes out as it is written. */
(function (g) {
  'use strict';
  g.BOTIO = {
    make(sab, post, id) {
      const ctl = new Int32Array(sab, 0, 4), data = new Uint8Array(sab, 16), dec = new TextDecoder();
      let seen = 0, over = false, out = '';
      const flush = () => { if (out) { post({ t: 'out', id, text: out }); out = ''; } };
      return {
        write(s) { out += s; if (out.length >= 2048 || s.indexOf('\n') >= 0) flush(); },
        flush,
        more() {
          if (over) return '';
          flush(); post({ t: 'idle', id });
          Atomics.wait(ctl, 0, seen);   // sleeps while the counter is still what it was
          seen = Atomics.load(ctl, 0);
          const text = dec.decode(data.slice(0, Math.min(Atomics.load(ctl, 1), data.length)));   // slice copies out of shared memory, which decode will not read
          if (text === 'GAMEOVER\n') over = true;
          return text;
        }
      };
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : self);
