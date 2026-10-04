/* A Scheme program that stays running (Bot Arena persistent mode). Scheme normally runs in the page, which cannot wait for input; a bot that stays
   running is given its own Web Worker, where (read) and (read-line) wait for the next turn (src/botio.js). Loaded after lockdown.js and scheme.js.
   Messages from the page: {t:'bot', id, code, sab}       Messages to the page: {t:'ready'} {t:'out', id, text} {t:'idle', id} {t:'done', id, err} */
(function () {
  'use strict';
  const post = (m) => self.postMessage(m);
  let busy = false;
  self.onmessage = (e) => {
    const m = e.data;
    if (!m || typeof m !== 'object' || m.t !== 'bot') return;
    if (busy) { post({ t: 'done', id: m.id, err: 'The Scheme sandbox is busy with another program.' }); return; }
    busy = true;
    const io = BOTIO.make(m.sab, post, m.id);
    let err = null;
    try { err = Scheme.runProgram(String(m.code), { stdin: '', moreInput: io.more, onOutput: io.write, stepLimit: 1e15 }).error; }   // no step limit: the page ends a turn that takes too long
    catch (x) { err = 'Internal error: ' + (x && x.message ? x.message : String(x)); }
    io.flush(); busy = false;
    post({ t: 'done', id: m.id, err });
  };
  post({ t: 'ready' });
})();
