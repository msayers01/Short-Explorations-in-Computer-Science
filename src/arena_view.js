/* Bot Arena, the viewer: draws a match on a canvas and plays it back. It reads only frames (one snapshot of the board per turn, see
   TRON.snapshot), so a match that is still being played and a replay loaded from a file or a link go through the same code.
     const v = ARENA.viewer(host, { maxWidth, onTurn(index, frame) })
     v.live(settings, players)  start showing a match as it is played      v.push(frame)  one more turn       v.finish(lines)  the match is over
     v.show(replay)             a finished replay (checked by TRON.cleanReplay, then re-simulated)             v.destroy()
   Players are drawn in four colours AND with their number on the head, so the picture does not depend on telling colours apart. */
(function () {
  'use strict';
  const T = window.TRON;
  const A = window.ARENA = window.ARENA || {};
  const el = (...a) => window.__app.internal.el(...a);
  const PLAYER_COLORS = ['#2b7bd0', '#e07b00', '#2a9d4b', '#b04fc0'];
  A.PLAYER_COLORS = PLAYER_COLORS;
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  function viewer(host, opts) {
    opts = opts || {};
    let settings = T.settingsOf({}), players = [], frames = [], complete = true, lines = [], idx = 0, playing = false, speed = 8, raf = 0, last = 0, carry = 0, cell = 16, gone = false;
    const canvas = el('canvas', { class: 'arena-canvas', role: 'img', 'aria-label': 'The game board' });
    const legend = el('div', { class: 'arena-legend' });
    const banner = el('div', { class: 'arena-banner', role: 'status', hidden: '' });
    const hover = el('span', { class: 'arena-hover' }, ' ');
    const counter = el('span', { class: 'arena-turn', 'aria-live': 'off' });
    const scrub = el('input', { type: 'range', min: 0, max: 0, value: 0, class: 'arena-scrub', 'aria-label': 'Turn' });
    const speedBox = el('input', { type: 'range', min: 1, max: 30, value: speed, class: 'algo-speed', 'aria-label': 'Speed in turns per second' });
    const speedOut = el('span', { class: 'small arena-speed' }, speed + ' turns/s');
    const btn = (label, aria, fn, cls) => el('button', { class: 'btn sm' + (cls ? ' ' + cls : ''), 'aria-label': aria, title: aria, onclick: fn }, label);
    const playBtn = btn('Play', 'Play or pause', () => (playing ? pause() : play()), 'primary');
    const controls = el('div', { class: 'arena-controls' },
      btn('|<', 'Back to the start', () => { pause(); seek(0); }), btn('<', 'One turn back', () => { pause(); seek(idx - 1); }), playBtn,
      btn('>', 'One turn forward', () => { pause(); seek(idx + 1); }), btn('>|', 'Jump to the end', () => { pause(); seek(frames.length - 1); }),
      el('label', { class: 'algo-speed-label' }, 'Speed ', speedBox, speedOut), counter);
    const root = el('div', { class: 'arena-viewer' + (opts.big ? ' big' : '') }, legend, el('div', { class: 'arena-board' }, canvas), scrub, controls, hover, banner);
    host.append(root);
    const ctx = canvas.getContext('2d');

    function frame() { return frames[Math.min(idx, frames.length - 1)] || null; }
    function size() {
      const avail = Math.max(160, Math.min(opts.maxWidth || 640, (root.clientWidth || 600)));
      cell = Math.max(4, Math.floor(Math.min(avail / settings.width, (opts.maxHeight || 1e4) / settings.height)));
      const w = cell * settings.width, h = cell * settings.height, dpr = Math.min(3, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function draw() {
      const f = frame(); if (!f) return;
      const W = settings.width, H = settings.height, bg = css('--paper-2') || '#f5f5f3', grid = css('--rule-2') || '#ececea', ink = css('--ink') || '#000';
      ctx.fillStyle = bg; ctx.fillRect(0, 0, cell * W, cell * H);
      if (cell >= 10) { ctx.strokeStyle = grid; ctx.lineWidth = 1; ctx.beginPath(); for (let x = 1; x < W; x++) { ctx.moveTo(x * cell + 0.5, 0); ctx.lineTo(x * cell + 0.5, cell * H); } for (let y = 1; y < H; y++) { ctx.moveTo(0, y * cell + 0.5); ctx.lineTo(cell * W, y * cell + 0.5); } ctx.stroke(); }
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const o = f.grid[y * W + x]; if (!o) continue;
        const alive = f.heads[o - 1] && f.heads[o - 1].alive;
        ctx.globalAlpha = alive ? 0.85 : 0.35;   // a crashed player's trail fades
        ctx.fillStyle = PLAYER_COLORS[(o - 1) % 4]; ctx.fillRect(x * cell + 1, y * cell + 1, cell - 1, cell - 1);
      }
      ctx.globalAlpha = 1;
      f.heads.forEach((h, i) => {
        const col = PLAYER_COLORS[i % 4];
        if (h.alive) {
          ctx.fillStyle = col; ctx.fillRect(h.x * cell, h.y * cell, cell, cell);
          ctx.strokeStyle = ink; ctx.lineWidth = Math.max(1.5, cell / 8); ctx.strokeRect(h.x * cell + 1, h.y * cell + 1, cell - 2, cell - 2);
          if (cell >= 9) { ctx.fillStyle = '#fff'; ctx.font = '600 ' + Math.round(cell * 0.62) + 'px ' + (css('--sans') || 'sans-serif'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(i + 1), h.x * cell + cell / 2, h.y * cell + cell / 2 + 0.5); }
        } else if (h.at && h.at[0] >= 0 && h.at[1] >= 0 && h.at[0] < W && h.at[1] < H) {   // where it crashed: a cross
          ctx.strokeStyle = col; ctx.lineWidth = Math.max(2, cell / 6); const x = h.at[0] * cell, y = h.at[1] * cell, m = cell * 0.2;
          ctx.beginPath(); ctx.moveTo(x + m, y + m); ctx.lineTo(x + cell - m, y + cell - m); ctx.moveTo(x + cell - m, y + m); ctx.lineTo(x + m, y + cell - m); ctx.stroke();
        }
      });
    }
    function sync() {
      scrub.max = Math.max(0, frames.length - 1); scrub.value = Math.min(idx, frames.length - 1);
      const last = Math.max(0, frames.length - 1), f = frame();
      counter.textContent = 'Turn ' + (f ? f.turn : 0) + (complete ? ' of ' + last : (last ? ' (' + last + ' so far)' : ''));
      playBtn.textContent = playing ? 'Pause' : (complete && idx >= last && last > 0 ? 'Replay' : 'Play');
      const done = complete && idx >= last && lines.length > 0;
      banner.hidden = !done; banner.textContent = '';
      if (done) lines.forEach((l, i) => banner.append(el(i ? 'div' : 'strong', { class: i ? 'arena-banner-line' : '' }, l)));
      canvas.setAttribute('aria-label', 'The game board at turn ' + (f ? f.turn : 0) + (done ? '. ' + lines.join(' ') : ''));
      legend.textContent = '';
      players.forEach((p, i) => {
        const hd = f && f.heads[i], out = hd && !hd.alive;
        legend.append(el('span', { class: 'arena-chip' + (out ? ' is-out' : '') }, el('i', { style: 'background:' + PLAYER_COLORS[i % 4] }), el('b', {}, String(i + 1)), ' ' + p.name, el('small', {}, ' ' + (p.lang === 'js' ? 'built in' : (A.LANG_LABEL[p.lang] || p.lang)) + (out ? ' · crashed' : ''))));
      });
      if (opts.onTurn) opts.onTurn(Math.min(idx, frames.length - 1), f);
    }
    function seek(i) { idx = Math.max(0, Math.min(frames.length - 1, Math.round(i))); draw(); sync(); }
    function tick(t) {
      raf = 0;
      if (gone || !root.isConnected) { playing = false; return; }
      if (!playing) return;
      carry += Math.min(0.25, (t - last) / 1000) * speed; last = t;
      while (carry >= 1) { carry -= 1; if (idx < frames.length - 1) idx++; else break; }
      draw(); sync();
      if (idx >= frames.length - 1) { carry = 0; if (complete) { playing = false; sync(); return; } }
      raf = requestAnimationFrame(tick);
    }
    function play() {
      if (complete && idx >= frames.length - 1) idx = 0;
      playing = true; last = performance.now(); carry = 0; sync();
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function pause() { playing = false; sync(); }
    scrub.addEventListener('input', () => { pause(); seek(+scrub.value); });
    speedBox.addEventListener('input', () => { speed = +speedBox.value; speedOut.textContent = speed + ' turns/s'; });
    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) / cell), y = Math.floor((e.clientY - r.top) / cell), f = frame();
      if (!f || x < 0 || y < 0 || x >= settings.width || y >= settings.height) { hover.textContent = ' '; return; }
      const o = f.grid[y * settings.width + x], h = f.heads.findIndex((q) => q.alive && q.x === x && q.y === y);
      hover.textContent = '(' + x + ', ' + y + ')  ' + (h >= 0 ? 'head of player ' + (h + 1) : o ? 'trail of player ' + o : 'empty');
    });
    canvas.addEventListener('mouseleave', () => { hover.textContent = ' '; });
    const mo = new MutationObserver(draw); mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    let ro = null, pending = 0;
    if (window.ResizeObserver) { ro = new ResizeObserver(() => { if (!pending) pending = requestAnimationFrame(() => { pending = 0; if (!root.isConnected) return; size(); draw(); }); }); ro.observe(root); }   // setting a canvas's size clears it, so it is always drawn again

    function set(newSettings, newPlayers, newFrames, isComplete, newLines) {
      pause(); settings = T.settingsOf(newSettings); players = newPlayers; frames = newFrames; complete = isComplete; lines = newLines || []; idx = 0;
      size(); draw(); sync();
    }
    const api = {
      el: root,
      live(s, ps) { set(s, ps, [T.snapshot(T.create(s, 1), [])], false, []); play(); },
      push(f) { frames.push(f); sync(); },
      finish(l) { complete = true; lines = l; sync(); if (!playing && idx >= frames.length - 1) sync(); },
      show(replay, autoplay) { const clean = T.cleanReplay(replay), sim = T.simulate(clean); set(clean.settings, clean.players, sim.frames, true, T.describeResult(clean, sim.result)); if (autoplay !== false) play(); else seek(sim.frames.length - 1); return clean; },
      set, play, pause, seek,
      get index() { return idx; }, get playing() { return playing; }, get frames() { return frames; }, get settings() { return settings; },
      destroy() { gone = true; playing = false; if (raf) cancelAnimationFrame(raf); mo.disconnect(); if (ro) ro.disconnect(); root.remove(); }
    };
    size(); sync();
    return api;
  }
  A.viewer = viewer;
})();
