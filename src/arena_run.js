/* Bot Arena, the page's plumbing: how a student's bot is run (the same sandboxes as the Code Lab), the bots saved in this browser, and the
   links and files that carry bots and replays. The pages themselves are src/arena_view.js (the viewer) and src/arena.js.
   Exposed as window.ARENA (the other two files add to it).

   Running a bot. Python, C++ and Java programs run in their Web Workers (src/runner.js); Scheme runs in the page, on its own interpreter, and is
   stopped by a step limit instead of a clock (the page cannot interrupt it). run(lang)(source, stdin, limitMs) → Promise<{out, err, timedOut}>.
   - Bots of one language take turns (they share that language's one worker), so the clock of a move starts when that bot's program starts, not
     while it waits behind another.
   - A program that runs past its limit is stopped by ending its worker; the next run starts a fresh worker, which takes a moment, so a new worker is
     warmed up with a trivial program first, outside the clock.
   Nothing a bot prints is trusted: it is read by the referee (src/tron.js) as a move, or shown in the log as text. */
(function () {
  'use strict';
  const T = window.TRON;
  const A = window.ARENA = window.ARENA || {};
  const el = (...a) => window.__app.internal.el(...a);
  const LANG_LABEL = { python: 'Python', cpp: 'C++', java: 'Java', scheme: 'Scheme' };
  const WARM = { python: 'print(1)', cpp: '#include <iostream>\nint main() { return 0; }', java: 'public class Main { public static void main(String[] a) { } }' };
  const SCHEME_STEPS_PER_MS = 5000;   // the interpreter does about 13 million steps a second on a laptop; this leaves room for a slow device

  // ---------- running a program
  const locks = {}, cold = { python: true, cpp: true, java: true };
  const runners = () => window.__runners;
  function once(lang, source, stdin, ms) {
    const R = runners();
    if (lang === 'python') return R.python.run(source, { stdin, execLimit: ms });
    if (lang === 'cpp') return R.cpp.run(source, { stdin, maxMs: ms });
    if (lang === 'java') return R.java.run(source, { stdin, maxMs: ms });
    return Promise.reject(new Error('no runner for ' + lang));
  }
  const cancel = (lang) => { if (lang === 'python') window.PYRUN.cancel(); else if (lang === 'cpp') window.CPPRUN.cancel(); else if (lang === 'java') window.JAVARUN.cancel(); };
  const isLimit = (err) => /^Time limit exceeded|^;Aborting!: program ran for too long/.test(String(err || ''));
  /** Start a language's worker ahead of the first move (a worker takes a moment to start; that must not count against a bot). */
  async function warm(lang) {
    if (!cold[lang] || !WARM[lang]) return;
    try { await once(lang, WARM[lang], '', 5000); cold[lang] = false; } catch (e) { /* the first real run reports the failure */ }
  }
  function run(lang) {
    return (source, stdin, limitMs) => {
      const go = async () => {
        if (lang === 'scheme') {
          const r = await runners().scheme.run(source, { stdin, stepLimit: Math.round(limitMs * SCHEME_STEPS_PER_MS) });
          return { out: r.output || '', err: r.error || null, timedOut: isLimit(r.error) };
        }
        await warm(lang);
        let timer = 0, guarded = false;
        const r = await Promise.race([
          once(lang, source, stdin, limitMs),
          new Promise((resolve) => { timer = setTimeout(() => { guarded = true; cancel(lang); cold[lang] = true; resolve({ out: '', err: null }); }, limitMs + 400); })   // the sandbox's own limit did not fire in time
        ]);
        clearTimeout(timer);
        if (guarded) return { out: '', err: null, timedOut: true };
        if (isLimit(r.err)) { cold[lang] = true; return { out: r.out || '', err: null, timedOut: true }; }   // a sandbox that hit its limit has ended its worker
        if (r.err === 'Stopped.') { cold[lang] = true; return { out: r.out || '', err: 'stopped', timedOut: false }; }
        return { out: r.out || '', err: r.err || null, timedOut: false };
      };
      const p = (locks[lang] || Promise.resolve()).then(go, go);
      locks[lang] = p.then(() => { }, () => { });
      return p;
    };
  }
  /** End whatever a language's sandbox is doing (the Stop button). */
  function stopAll() { for (const l of ['python', 'cpp', 'java']) { cancel(l); cold[l] = true; } }

  /** A driver (see TRON.botDriver) for a saved or loaded bot, or for a built-in one. */
  function driverFor(entry, settings, seed, slot) {
    if (entry.builtin) { const def = T.builtinById(entry.builtin); return T.builtinDriver(def, { rng: T.rng(T.seedOf(seed) * 4 + slot), player: slot }); }
    return T.botDriver({ name: entry.name, lang: entry.lang, source: entry.source, limitMs: T.limitFor(entry.lang, settings.timeMs) }, run(entry.lang));
  }

  // ---------- the bots saved in this browser (everything a student makes lives in localStorage)
  const KEY = 'shortcourses.arena.v1';
  const ID_RE = /^[a-z0-9]{4,12}$/;
  const newId = () => { const a = 'abcdefghjkmnpqrstuvwxyz23456789'; let s = ''; for (let i = 0; i < 8; i++) s += a[Math.floor(Math.random() * a.length)]; return s; };
  let S = null;
  function cleanStore(raw) {
    const out = { v: 1, bots: [], current: '', setup: {} };
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) raw = {};
    const seen = new Set();
    for (const b of (Array.isArray(raw.bots) ? raw.bots : []).slice(0, 60)) {
      if (!b || typeof b !== 'object' || typeof b.id !== 'string' || !ID_RE.test(b.id) || seen.has(b.id)) continue;
      let c; try { c = T.cleanBot({ format: 'tronbot', version: 1, name: b.name, lang: b.lang, source: b.source }); } catch (e) { continue; }
      seen.add(b.id); out.bots.push({ id: b.id, name: c.name, lang: c.lang, source: c.source, at: Number.isFinite(b.at) ? b.at : 0 });
    }
    out.current = typeof raw.current === 'string' && seen.has(raw.current) ? raw.current : '';
    const u = raw.setup && typeof raw.setup === 'object' && !Array.isArray(raw.setup) ? raw.setup : {};
    const s = T.settingsOf(u);
    out.setup = { width: s.width, height: s.height, players: s.players, timeMs: s.timeMs, invalid: s.invalid, seed: typeof u.seed === 'string' ? u.seed.replace(/[^0-9]/g, '').slice(0, 10) : '',
      slots: (Array.isArray(u.slots) ? u.slots : []).slice(0, 4).map((x) => (typeof x === 'string' && /^(me|b:[a-z]{1,12}|bot:[a-z0-9]{4,12})$/.test(x) ? x : '')) };
    return out;
  }
  function store() {
    if (S) return S;
    let raw = null; try { raw = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { raw = null; }
    S = cleanStore(raw);
    return S;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable: the work lasts until the page closes */ } }
  window.addEventListener('storage', (e) => { if (e.key === KEY || e.key === null) S = null; });   // another tab saved: do not write our copy over it
  function addBot(bot) {
    const s = store(), b = { id: newId(), name: bot.name, lang: bot.lang, source: bot.source, at: Date.now() };
    s.bots.unshift(b); if (s.bots.length > 60) s.bots.length = 60;
    save(); return b;
  }
  const byId = (id) => store().bots.find((b) => b.id === id) || null;

  // ---------- files and links
  function download(name, data, type) {
    const url = URL.createObjectURL(data instanceof Blob ? data : new Blob([data], { type: type || 'application/json' }));
    const a = el('a', { href: url, download: name }); document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
  const LINK_WARN = 8192;
  /** A link that carries an object in its fragment (so it is never sent to a server): → Promise<{url, long}> */
  async function linkFor(kind, obj) {
    const packed = await window.TEACH.pack(obj);
    const url = location.href.split('#')[0] + '#/arena?' + kind + '=' + packed;
    return { url, long: url.length > LINK_WARN };
  }
  /** What a pasted link, token or file text holds → {bot} or {replay}, checked; throws an Error with words for the student. */
  async function readShared(text) {
    text = String(text || '').trim();
    if (!text) throw new Error('There is nothing to read here.');
    if (text.length > 4 * 1024 * 1024) throw new Error('This is too big to be a bot or a replay.');
    let obj = null;
    if (text[0] === '{') { try { obj = JSON.parse(text); } catch (e) { throw new Error('This file is not valid JSON.'); } }
    else {
      const m = /[?&](bot|replay)=([A-Za-z0-9_-]+)/.exec(text), token = m ? m[2] : text.replace(/\s+/g, '');
      if (!/^[A-Za-z0-9_-]+$/.test(token)) throw new Error('This is not a Bot Arena link or file.');
      obj = await window.TEACH.unpack(token);
    }
    if (obj && obj.format === 'tronbot') return { bot: T.cleanBot(obj) };
    if (obj && obj.format === 'tronreplay') return { replay: T.cleanReplay(obj) };
    throw new Error('This is not a Bot Arena bot or replay.');
  }
  /** A box that shows a link to copy (a button copies it where the browser allows; otherwise the text is selected for the student). */
  function linkBox(url, long, onClose) {
    const input = el('input', { type: 'text', readonly: '', value: url, class: 'arena-link', 'aria-label': 'Link' });
    const done = el('span', { class: 'small', role: 'status' });
    const box = el('div', { class: 'arena-linkbox' },
      long ? el('p', { class: 'small arena-warn' }, 'This link is ' + Math.round(url.length / 1024) + ' KB long. Some chat and email programs cut long links short; download the file instead if you can.') : null,
      el('div', { class: 'toolbar' }, input,
        el('button', { class: 'btn sm', onclick: async () => { input.select(); try { await navigator.clipboard.writeText(url); done.textContent = 'Copied.'; } catch (e) { done.textContent = 'Press Ctrl+C (or ⌘C) to copy.'; } } }, 'Copy'),
        onClose ? el('button', { class: 'btn quiet sm', onclick: () => { box.remove(); onClose(); } }, 'Close') : null, done));
    setTimeout(() => input.select(), 0);
    return box;
  }

  Object.assign(A, { LANG_LABEL, run, stopAll, driverFor, store, save, addBot, byId, newId, download, linkFor, readShared, linkBox, LINK_WARN, cleanStore });
})();
