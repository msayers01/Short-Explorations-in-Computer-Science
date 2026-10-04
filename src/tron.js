/* Bot Arena, the game side: Tron, its referee, the built-in bots, replays, bot files, round-robin tournaments, CSV and zip.
   Nothing here touches the page, so test_arena.js runs all of it in node. Exposed as window.TRON (browser) or module.exports (node).

   The protocol bots speak (see ARCHITECTURE §9j): a bot is a program that reads ONE turn on stdin and prints ONE move.
     width height / you alive / x y player (one line per player still alive) / height lines of width characters: . empty, # wall, 1-4 a head
   The move is UP, DOWN, LEFT or RIGHT. The referee runs the bot afresh every turn ("restart mode"), so a bot keeps no memory between turns.

   Everything random uses the seeded generator below, so a seed plus the moves reproduces a match exactly (that is what a replay is).
   Everything that arrives from a link or a file (a replay, a bot) is sanitised here before anything else sees it. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TRON = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const MOVES = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  const DELTA = { UP: [0, -1], DOWN: [0, 1], LEFT: [-1, 0], RIGHT: [1, 0] };
  const LETTER = { UP: 'U', DOWN: 'D', LEFT: 'L', RIGHT: 'R' };
  const FROM_LETTER = { U: 'UP', D: 'DOWN', L: 'LEFT', R: 'RIGHT' };
  const LANGS = ['python', 'cpp', 'java', 'scheme'];
  const LIMITS = { minSize: 10, maxSize: 40, minPlayers: 2, maxPlayers: 4, minTime: 50, maxTime: 10000, maxName: 40, maxSource: 20000, maxPlayerName: 40 };
  const DEFAULTS = { width: 20, height: 20, players: 2, timeMs: 0, invalid: 'up' };
  /** The time a bot gets per move when the match says 0 ("by language"): the teaching C++ interpreter is the slow one. */
  const LANG_TIME = { python: 500, java: 500, scheme: 500, cpp: 2000, js: 500 };
  const limitFor = (lang, timeMs) => timeMs || LANG_TIME[lang] || 500;
  const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const clampInt = (x, lo, hi, dflt) => { x = Math.round(Number(x)); return Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : dflt; };
  const cleanText = (x, max) => String(typeof x === 'string' ? x : x == null ? '' : x).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').slice(0, max);

  /** The settings of a match, every field forced into its allowed range (settings can come from a link). */
  function settingsOf(s) {
    s = s && typeof s === 'object' ? s : {};
    return {
      width: clampInt(s.width, LIMITS.minSize, LIMITS.maxSize, DEFAULTS.width),
      height: clampInt(s.height, LIMITS.minSize, LIMITS.maxSize, DEFAULTS.height),
      players: clampInt(s.players, LIMITS.minPlayers, LIMITS.maxPlayers, DEFAULTS.players),
      timeMs: Number(s.timeMs) === 0 ? 0 : clampInt(s.timeMs, LIMITS.minTime, LIMITS.maxTime, DEFAULTS.timeMs),
      invalid: s.invalid === 'forfeit' ? 'forfeit' : 'up'
    };
  }
  const seedOf = (x) => { x = Math.floor(Number(x)); return Number.isFinite(x) ? (x >>> 0) : 1; };

  /** mulberry32: the same seed always gives the same numbers. */
  function rng(seed) {
    let a = seedOf(seed) || 1;
    const next = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    next.int = (n) => Math.floor(next() * n);
    return next;
  }

  // ---------- the rules
  /** Fixed starting cells, two in from the corners: player 1 top-left, 2 bottom-right (opposite), 3 top-right, 4 bottom-left. */
  const startCells = (w, h, n) => [[2, 2], [w - 3, h - 3], [w - 3, 2], [2, h - 3]].slice(0, n);

  function create(settings, seed) {
    const s = settingsOf(settings);
    return { settings: s, w: s.width, h: s.height, n: s.players, seed: seedOf(seed), turn: 0,
      grid: new Uint8Array(s.width * s.height),   // 0 empty, p+1 a trail cell left by player p
      heads: startCells(s.width, s.height, s.players).map(([x, y]) => ({ x, y, alive: true, at: null, reason: '' })),
      over: false, winner: 0, draw: false, capped: false };
  }
  const aliveList = (st) => { const r = []; st.heads.forEach((h, i) => { if (h.alive) r.push(i); }); return r; };
  const inside = (st, x, y) => x >= 0 && y >= 0 && x < st.w && y < st.h;

  /** Apply one turn. moves[p] is UP/DOWN/LEFT/RIGHT, or 'X' (the player drops out: a forfeit); a dead player's entry is ignored.
      All players move together. Returns the crashes of this turn: [{player (1-based), turn, at:[x,y], reason}]. why[p] replaces the reason of an 'X'. */
  function step(st, moves, why) {
    if (st.over) return [];
    const turn = st.turn + 1, alive = aliveList(st), target = {}, crashed = {};
    for (const p of alive) {
      const m = moves[p];
      if (m === 'X') { crashed[p] = { at: [st.heads[p].x, st.heads[p].y], reason: (why && why[p]) || 'dropped out' }; continue; }
      if (!hasOwn(DELTA, m)) throw new Error('step: player ' + (p + 1) + ' has no legal move: ' + String(m));
      target[p] = [st.heads[p].x + DELTA[m][0], st.heads[p].y + DELTA[m][1]];
    }
    // Every crash is decided against the board as it was at the start of the turn.
    for (const p of alive) {
      if (crashed[p]) continue;
      const [x, y] = target[p], where = '(' + x + ', ' + y + ')';
      let reason = '';
      if (!inside(st, x, y)) reason = 'left the board at ' + where;
      else {
        const owner = st.grid[y * st.w + x];
        if (owner) reason = owner === p + 1 ? 'ran into its own trail at ' + where : 'ran into player ' + owner + '’s trail at ' + where;
        else {
          const head = alive.find((q) => q !== p && st.heads[q].x === x && st.heads[q].y === y);
          if (head !== undefined) reason = 'ran into the head of player ' + (head + 1) + ' at ' + where;
          else {
            const rival = alive.find((q) => q !== p && target[q] && target[q][0] === x && target[q][1] === y);
            if (rival !== undefined) reason = 'crashed head-on with player ' + (rival + 1) + ' at ' + where;
          }
        }
      }
      if (reason) crashed[p] = { at: [x, y], reason };
    }
    const events = [];
    for (const p of alive) {
      const h = st.heads[p];
      st.grid[h.y * st.w + h.x] = p + 1;   // the cell a head leaves, or dies on, is a wall for ever
      if (crashed[p]) { h.alive = false; h.at = crashed[p].at; h.reason = crashed[p].reason; events.push({ player: p + 1, turn, at: crashed[p].at, reason: crashed[p].reason }); }
      else { h.x = target[p][0]; h.y = target[p][1]; }
    }
    st.turn = turn;
    const left = aliveList(st);
    if (left.length <= 1) { st.over = true; st.winner = left.length ? left[0] + 1 : 0; st.draw = !left.length; }
    else if (turn >= st.w * st.h) { st.over = true; st.winner = 0; st.draw = true; st.capped = true; }   // the turn cap: a draw
    return events;
  }

  /** What player p (0-based) sees: the same information the text carries. */
  function observe(st, p) {
    const heads = [], digit = {};
    st.heads.forEach((h, i) => { if (h.alive) { heads.push({ x: h.x, y: h.y, p: i + 1 }); digit[h.y * st.w + h.x] = String(i + 1); } });
    const rows = [];
    for (let y = 0; y < st.h; y++) { let r = ''; for (let x = 0; x < st.w; x++) { const i = y * st.w + x; r += digit[i] || (st.grid[i] ? '#' : '.'); } rows.push(r); }
    return { w: st.w, h: st.h, you: p + 1, alive: heads.length, heads, rows };
  }
  /** The text a bot gets on stdin. */
  function serialize(st, p) {
    const o = observe(st, p);
    return o.w + ' ' + o.h + '\n' + o.you + ' ' + o.alive + '\n' + o.heads.map((h) => h.x + ' ' + h.y + ' ' + h.p + '\n').join('') + o.rows.join('\n') + '\n';
  }
  /** The text of a turn back into what observe() gives (the built-in bots and the tests use it; so does anyone writing a bot in JavaScript). */
  function parseObs(text) {
    const lines = String(text).split('\n'); let i = 0;
    const nums = (l) => String(l).trim().split(/\s+/).map(Number);
    const [w, h] = nums(lines[i++]), [you, alive] = nums(lines[i++]), heads = [];
    for (let k = 0; k < alive; k++) { const [x, y, p] = nums(lines[i++]); heads.push({ x, y, p }); }
    const rows = []; for (let y = 0; y < h; y++) rows.push(lines[i++]);
    return { w, h, you, alive, heads, rows };
  }
  /** A bot's reply → {move} or {error} (words for the student). Exactly one non-empty line: UP, DOWN, LEFT or RIGHT in any case. */
  function parseMove(text) {
    const lines = String(text == null ? '' : text).split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return { error: 'printed nothing' };
    if (lines.length > 1) return { error: 'printed ' + lines.length + ' lines (expected exactly one move). Debugging output belongs on stderr' };
    const m = lines[0].toUpperCase();
    return hasOwn(DELTA, m) ? { move: m } : { error: 'printed “' + cleanText(lines[0], 30) + '”, which is not UP, DOWN, LEFT or RIGHT' };
  }

  // ---------- the built-in bots (JavaScript, no runtime to start). make(ctx) returns {move(obs) → 'UP'…}; ctx = {rng, player}
  const open = (o, x, y) => x >= 0 && y >= 0 && x < o.w && y < o.h && o.rows[y][x] === '.';
  const myHead = (o) => o.heads.find((h) => h.p === o.you);
  const legalMoves = (o) => { const me = myHead(o); return MOVES.filter((m) => open(o, me.x + DELTA[m][0], me.y + DELTA[m][1])); };
  const openNeighbours = (o, x, y) => MOVES.reduce((n, m) => n + (open(o, x + DELTA[m][0], y + DELTA[m][1]) ? 1 : 0), 0);
  /** A breadth-first flood from several sources at once through empty cells: dist[i] is how many moves the nearest source needs to reach cell i
      (-1: none can), who[i] which source gets there first (-2: two arrive together, so the cell is nobody's). */
  function territory(o, sources) {
    const dist = new Int16Array(o.w * o.h).fill(-1), who = new Int8Array(o.w * o.h).fill(-1);
    let frontier = [];
    sources.forEach((s, k) => { const i = s.y * o.w + s.x; dist[i] = 0; who[i] = k; frontier.push(i); });
    for (let d = 1; frontier.length; d++) {
      const claim = new Map();
      for (const i of frontier) {
        if (who[i] < 0) continue;   // a contested cell is not spread from
        const x = i % o.w, y = (i - x) / o.w;
        for (const m of MOVES) {
          const nx = x + DELTA[m][0], ny = y + DELTA[m][1];
          if (!open(o, nx, ny)) continue;
          const j = ny * o.w + nx;
          if (dist[j] >= 0) continue;
          const c = claim.get(j);
          if (c === undefined) claim.set(j, who[i]); else if (c !== who[i]) claim.set(j, -2);
        }
      }
      frontier = [];
      for (const [j, k] of claim) { dist[j] = d; who[j] = k; frontier.push(j); }
    }
    return { dist, who };
  }
  const BUILTINS = [
    { id: 'random', name: 'Random', blurb: 'Picks any move that does not crash. Easy to beat.',
      make: (ctx) => ({ move(o) { const ok = legalMoves(o); return ok.length ? ok[ctx.rng.int(ok.length)] : 'UP'; } }) },
    { id: 'hugger', name: 'Wall Hugger', blurb: 'Goes straight until something is in the way, then turns toward the most open space.',
      make: () => { let dir = null; return { move(o) {
        const me = myHead(o), ok = legalMoves(o);
        if (!dir) dir = Math.abs(o.w / 2 - me.x) >= Math.abs(o.h / 2 - me.y) ? (me.x < o.w / 2 ? 'RIGHT' : 'LEFT') : (me.y < o.h / 2 ? 'DOWN' : 'UP');   // toward the middle
        if (!ok.length) return dir;
        if (!ok.includes(dir)) { let best = ok[0], bs = -1; for (const m of ok) { const s = openNeighbours(o, me.x + DELTA[m][0], me.y + DELTA[m][1]); if (s > bs) { bs = s; best = m; } } dir = best; }
        return dir;
      } }; } },
    { id: 'flood', name: 'Flood Fill', blurb: 'Picks the move that keeps the most room, counting only the cells it can reach before anyone else.',
      make: () => ({ move(o) {
        const me = myHead(o), ok = legalMoves(o);
        if (!ok.length) return 'UP';
        const foes = o.heads.filter((h) => h.p !== o.you).map((f) => ({ x: f.x, y: f.y }));
        let best = ok[0], bs = -Infinity;
        for (const m of ok) {
          const to = { x: me.x + DELTA[m][0], y: me.y + DELTA[m][1] };
          const race = territory(o, [to].concat(foes)).who;   // who gets to each cell first, if we all set off now
          let mine = 0, theirs = 0; for (let i = 0; i < race.length; i++) { if (race[i] === 0) mine++; else if (race[i] > 0) theirs++; }
          const alone = territory(o, [to]).dist; let reach = 0; for (let i = 0; i < alone.length; i++) if (alone[i] >= 0) reach++;
          const clash = foes.some((f) => Math.abs(f.x - to.x) + Math.abs(f.y - to.y) === 1);   // a foe could step there this turn too, and both would crash
          const score = (mine - theirs) * 10000 + reach * 10 - openNeighbours(o, to.x, to.y) - (clash ? 1e7 : 0);   // fewer open neighbours on a tie: hug walls, leave no pockets
          if (score > bs) { bs = score; best = m; }
        }
        return best;
      } }) }
  ];
  const builtinById = (id) => BUILTINS.find((b) => b.id === id) || null;

  // ---------- drivers and the referee
  /** A driver is what the referee talks to: {name, lang, start() → {ok, error?}, move(text, obs, turn) → {text, err, status, note}, stop()}.
      status: 'ok', 'timeout', 'error' (the program failed) or 'crash'. The page builds one per student bot (src/arena.js); this one is for the built-in bots. */
  function builtinDriver(def, ctx) {
    const bot = def.make(ctx);
    return { name: def.name, lang: 'js', builtin: true, start: async () => ({ ok: true }),
      move: async (text, obs) => { let m; try { m = bot.move(obs || parseObs(text)); } catch (e) { return { text: '', err: String(e && e.message || e), status: 'error' }; } return { text: m, err: '', status: 'ok' }; },
      stop() { } };
  }

  /** A bot's output → {text, log}: lines that start with "LOG" go to the bot's log tab, the rest is the reply to the referee. These runtimes
      have no stderr of their own, so this is how a bot says something without spoiling its move. */
  function splitOutput(out) {
    const keep = [], log = [];
    for (const line of String(out == null ? '' : out).split('\n')) { if (/^LOG(\s|$)/.test(line)) log.push(line.replace(/^LOG\s?/, '')); else keep.push(line); }
    return { text: keep.join('\n'), log: log.join('\n') };
  }
  /** A driver for a student's program. run(source, stdin, limitMs) is how the page (or a test) runs it: → Promise<{out, err, timedOut}>, err being
      the failure in words (a compile error, a traceback) or empty. start() runs the program once on the empty board, with plenty of time: a program
      that does not even start (a syntax error, a crash) forfeits before turn 1 with the compiler's words shown. */
  function botDriver(def, run) {
    const limit = () => def.limitMs || limitFor(def.lang, 0);
    return { name: def.name, lang: def.lang, builtin: false, limitMs: limit(),
      async start(ctx) {
        const r = await run(def.source, ctx.input, Math.max(4 * limit(), 3000));
        if (r.timedOut) return { ok: true };   // too slow is not broken: on the turns where it is too slow the referee logs that and moves it UP
        return r.err ? { ok: false, error: r.err } : { ok: true };
      },
      async move(text) {
        const r = await run(def.source, text, limit());
        if (r.timedOut) return { text: '', err: '', status: 'timeout' };
        if (r.err) return { text: r.out, err: String(r.err), status: 'error', note: String(r.err).split('\n')[0].slice(0, 120) };
        return { text: r.out, err: '', status: 'ok' };
      },
      stop() { } };
  }

  /** Play one match. opts: {settings, seed, drivers: one per player, onTurn(info), onLog(player, kind, text), shouldStop()}.
      Resolves to {replay, frames, state, aborted}. replay is the small file (settings, seed, moves, result); frames are snapshots, one per turn
      (frames[0] is the empty board), which the viewer draws. */
  async function playMatch(opts) {
    const s = settingsOf(Object.assign({}, opts.settings, { players: opts.drivers.length })), st = create(s, opts.seed);
    const drivers = opts.drivers, log = opts.onLog || (() => { });
    const frames = [snapshot(st, [])], moves = [], crashes = [];
    const starts = await Promise.all(drivers.map(async (d, p) => { try { return (await d.start({ settings: s, player: p, input: serialize(st, p) })) || { ok: true }; } catch (e) { return { ok: false, error: String(e && e.message || e) }; } }));
    const failed = starts.map((r) => (r.ok === false ? String(r.error || 'the bot did not start') : ''));
    failed.forEach((f, p) => { if (f) log(p, 'referee', 'Player ' + (p + 1) + ' (' + drivers[p].name + ') forfeits before turn 1: ' + f.split('\n')[0].slice(0, 300), 0);
      if (f.includes('\n')) log(p, 'stderr', f.slice(0, 2000), 0); });
    let aborted = false;
    while (!st.over) {
      if (opts.shouldStop && opts.shouldStop()) { aborted = true; break; }
      const turn = st.turn + 1, alive = aliveList(st), inputs = new Array(st.n).fill(''), chosen = new Array(st.n).fill(null), why = new Array(st.n).fill('');
      await Promise.all(alive.map(async (p) => {
        if (failed[p]) { chosen[p] = 'X'; why[p] = 'did not start: ' + failed[p].split('\n')[0].slice(0, 200); return; }
        const obs = observe(st, p); inputs[p] = serialize(st, p);
        let res;
        try { res = await drivers[p].move(inputs[p], obs, turn); } catch (e) { res = { text: '', err: String(e && e.message || e), status: 'crash' }; }
        res = res || { text: '', err: '', status: 'crash' };
        const sp = splitOutput(res.text); res = Object.assign({}, res, { text: sp.text });
        if (sp.log) log(p, 'stderr', sp.log, turn);
        if (res.err) log(p, 'stderr', res.err, turn);
        let problem = '';
        if (res.status === 'timeout') problem = 'took longer than ' + (drivers[p].limitMs || limitFor(drivers[p].lang, s.timeMs)) + ' ms';
        else if (res.status === 'error' || res.status === 'crash') problem = 'crashed' + (res.note ? ' (' + res.note + ')' : '');
        else { const r = parseMove(res.text); if (r.move) chosen[p] = r.move; else problem = r.error; }
        if (problem) {
          const act = s.invalid === 'forfeit' ? 'forfeits' : 'is moved UP';
          log(p, 'referee', 'Turn ' + turn + ': player ' + (p + 1) + ' (' + drivers[p].name + ') ' + problem + '; ' + act + '.', turn);
          if (s.invalid === 'forfeit') { chosen[p] = 'X'; why[p] = 'forfeit: ' + problem; } else chosen[p] = 'UP';
        }
      }));
      const events = step(st, chosen, why);
      moves.push(chosen.map((m, p) => (!alive.includes(p) ? '-' : m === 'X' ? 'X' : LETTER[m])).join(''));
      for (const e of events) crashes.push(e);
      const frame = snapshot(st, events); frames.push(frame);
      if (opts.onTurn) opts.onTurn({ turn, frame, moves: moves[moves.length - 1], inputs, events, state: st });
    }
    const replay = { format: 'tronreplay', version: 1, settings: s, seed: st.seed, players: drivers.map((d) => ({ name: cleanText(d.name, LIMITS.maxPlayerName), lang: LANGS.includes(d.lang) ? d.lang : 'js' })), moves,
      result: { winner: st.winner, draw: st.draw, capped: st.capped, turns: st.turn, crashes: crashes.map((c) => ({ player: c.player, turn: c.turn, at: c.at, reason: c.reason })) } };
    return { replay, frames, state: st, aborted };
  }
  /** A state (enough of one for observe() and serialize()) from a snapshot: what a bot was shown before the move that made the next frame. */
  function fromFrame(settings, frame) {
    const s = settingsOf(settings);
    return { w: s.width, h: s.height, n: s.players, grid: frame.grid, heads: frame.heads, turn: frame.turn };
  }
  function snapshot(st, events) {
    return { turn: st.turn, grid: st.grid.slice(), heads: st.heads.map((h) => ({ x: h.x, y: h.y, alive: h.alive, at: h.at })), over: st.over, winner: st.winner, draw: st.draw, events: events.map((e) => Object.assign({}, e)) };
  }

  // ---------- replays: a small file, checked on the way in
  const MOVE_CHARS = /^[UDLRX-]+$/;
  /** A replay object from a file or a link → a clean one, or throws an Error whose message says what is wrong. */
  function cleanReplay(r) {
    if (!r || typeof r !== 'object' || r.format !== 'tronreplay') throw new Error('This is not a Bot Arena replay.');
    if (r.version !== 1) throw new Error('This replay was made by a different version of the arena (' + cleanText(r.version, 10) + ').');
    const settings = settingsOf(r.settings), n = settings.players;
    if (!Array.isArray(r.moves) || r.moves.length > settings.width * settings.height) throw new Error('This replay has too many turns.');
    const moves = r.moves.map((m) => { if (typeof m !== 'string' || m.length !== n || !MOVE_CHARS.test(m)) throw new Error('This replay has a turn that is not one move per player.'); return m; });
    const players = []; for (let i = 0; i < n; i++) { const p = Array.isArray(r.players) && r.players[i] && typeof r.players[i] === 'object' ? r.players[i] : {}; players.push({ name: cleanText(p.name, LIMITS.maxPlayerName) || 'Player ' + (i + 1), lang: LANGS.includes(p.lang) ? p.lang : 'js' }); }
    const res = r.result && typeof r.result === 'object' ? r.result : {};
    const crashes = (Array.isArray(res.crashes) ? res.crashes : []).slice(0, 8).filter((c) => c && typeof c === 'object').map((c) => ({ player: clampInt(c.player, 1, n, 1), turn: clampInt(c.turn, 1, 1e5, 1), at: Array.isArray(c.at) ? [clampInt(c.at[0], -1, 1e3, 0), clampInt(c.at[1], -1, 1e3, 0)] : [0, 0], reason: cleanText(c.reason, 200) }));
    return { format: 'tronreplay', version: 1, settings, seed: seedOf(r.seed), players, moves, result: { winner: clampInt(res.winner, 0, n, 0), draw: !!res.draw, capped: !!res.capped, turns: clampInt(res.turns, 0, 1e5, moves.length), crashes } };
  }
  /** Re-run a (clean) replay: {frames, state, result} where result is what the rules say (crash reasons included). */
  function simulate(replay) {
    const st = create(replay.settings, replay.seed), frames = [snapshot(st, [])], crashes = [];
    for (const m of replay.moves) {
      if (st.over) break;
      const chosen = [...m].map((c, p) => (!st.heads[p].alive ? null : hasOwn(FROM_LETTER, c) ? FROM_LETTER[c] : 'X'));
      const ev = step(st, chosen); for (const e of ev) crashes.push(e);
      frames.push(snapshot(st, ev));
    }
    return { frames, state: st, result: { winner: st.winner, draw: st.draw, capped: st.capped, turns: st.turn, crashes } };
  }
  /** The sentence for the result banner. Uses the crash reasons the file carries (they can say why a bot forfeited), else the simulated ones. */
  function describeResult(replay, result) {
    const r = replay.result && replay.result.crashes && replay.result.crashes.length ? replay.result : result;
    const nm = (p) => 'Player ' + p + ' (' + (replay.players[p - 1] ? replay.players[p - 1].name : '?') + ')';
    const lines = [];
    const w = result.winner;
    lines.push(w ? nm(w) + ' wins after ' + result.turns + ' turn' + (result.turns === 1 ? '' : 's') + '.' : result.capped ? 'A draw: the turn limit (' + result.turns + ' turns) was reached.' : 'A draw after ' + result.turns + ' turns: the last players crashed together.');
    const reasons = {}; for (const c of (result.crashes || [])) reasons[c.player + ':' + c.turn] = c.reason;
    for (const c of r.crashes) lines.push(nm(c.player) + ' crashed on turn ' + c.turn + ': ' + (c.reason || reasons[c.player + ':' + c.turn] || 'crashed') + '.');
    return lines;
  }

  // ---------- bot files
  /** A bot from a file or a link → {name, lang, source}, or throws. */
  function cleanBot(b) {
    if (!b || typeof b !== 'object' || b.format !== 'tronbot') throw new Error('This is not a Bot Arena bot file.');
    if (b.version !== 1) throw new Error('This bot was made by a different version of the arena.');
    if (!LANGS.includes(b.lang)) throw new Error('This bot is written in a language the arena does not run.');
    if (typeof b.source !== 'string' || !b.source.trim()) throw new Error('This bot file has no program in it.');
    if (b.source.length > LIMITS.maxSource) throw new Error('This bot is longer than ' + LIMITS.maxSource + ' characters.');
    return { name: cleanText(b.name, LIMITS.maxName).trim() || 'Unnamed bot', lang: b.lang, source: b.source.replace(/\r\n?/g, '\n') };
  }
  const botFile = (b) => ({ format: 'tronbot', version: 1, name: cleanText(b.name, LIMITS.maxName), lang: b.lang, source: String(b.source) });
  const fileSafe = (s) => (String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'bot').slice(0, 40);

  // ---------- tournaments
  /** Round robin: every pair of bots plays `rounds` matches, swapping who starts where each time. → [{a, b, flip, k}] (indexes into the bots list) */
  function schedule(count, rounds) {
    const jobs = [];
    for (let a = 0; a < count; a++) for (let b = a + 1; b < count; b++) for (let k = 0; k < rounds; k++) jobs.push({ a, b, flip: k % 2 === 1, k });
    return jobs;
  }
  const survived = (replay, p) => { const c = replay.result.crashes.find((x) => x.player === p + 1); return c ? c.turn : replay.result.turns; };
  /** Run a round robin, one match at a time (student bots share their language's single sandbox, so matches cannot overlap).
      opts: {bots: [{name, lang, driver(slotSeed) → a fresh driver}], rounds, settings, seed, onProgress(done, total, result) → may return a promise
      (the page yields to the browser there), shouldStop()}. → Promise<{results, aborted}> with results as standings() wants them, plus the replay of each match. */
  async function runTournament(opts) {
    const jobs = schedule(opts.bots.length, opts.rounds), results = [];
    let aborted = false;
    for (let i = 0; i < jobs.length; i++) {
      if (opts.shouldStop && opts.shouldStop()) { aborted = true; break; }
      const j = jobs[i], seed = seedOf(seedOf(opts.seed) + i), order = j.flip ? [j.b, j.a] : [j.a, j.b];
      const m = await playMatch({ settings: Object.assign({}, opts.settings, { players: 2 }), seed, drivers: order.map((b, slot) => opts.bots[b].driver(seed * 4 + slot)) });
      const rep = m.replay, w = rep.result.winner;   // w is a slot (1 or 2), or 0 for a draw
      const first = j.flip ? 'b' : 'a', second = j.flip ? 'a' : 'b';
      const res = { a: j.a, b: j.b, k: j.k, flip: j.flip, seed, winner: w === 0 ? null : (w === 1 ? first : second), turns: { [first]: survived(rep, 0), [second]: survived(rep, 1) }, replay: rep };
      results.push(res);
      if (opts.onProgress) await opts.onProgress(i + 1, jobs.length, res);
    }
    return { results, aborted };
  }

  /** Standings from finished matches [{a, b, winner: 'a'|'b'|null, turns: {a, b}}]: 3 for a win, 1 for a draw; ties broken by turns survived. */
  function standings(count, results) {
    const rows = Array.from({ length: count }, (_, i) => ({ bot: i, played: 0, wins: 0, draws: 0, losses: 0, points: 0, turns: 0 }));
    for (const r of results) {
      const A = rows[r.a], B = rows[r.b]; A.played++; B.played++; A.turns += r.turns.a; B.turns += r.turns.b;
      if (r.winner === 'a') { A.wins++; A.points += 3; B.losses++; } else if (r.winner === 'b') { B.wins++; B.points += 3; A.losses++; } else { A.draws++; B.draws++; A.points++; B.points++; }
    }
    return rows;
  }
  const rank = (rows) => rows.slice().sort((x, y) => y.points - x.points || y.turns - x.turns || y.wins - x.wins || x.bot - y.bot);
  const csvCell = (v) => { let s = String(v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };   // names are student text: no formula injection into a spreadsheet
  function standingsCsv(names, rows) {
    return ['Rank,Bot,Played,Wins,Draws,Losses,Points,Turns survived'].concat(rank(rows).map((r, i) => [i + 1, names[r.bot], r.played, r.wins, r.draws, r.losses, r.points, r.turns].map(csvCell).join(','))).join('\r\n') + '\r\n';
  }

  // ---------- a zip file, stored (not compressed): the replays are already tiny, so no library is needed
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = (b) => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  /** files: [{name, text}] → Uint8Array of a zip archive. */
  function zip(files) {
    const enc = new TextEncoder(), parts = [], central = []; let offset = 0;
    const u16 = (v) => [v & 255, (v >>> 8) & 255], u32 = (v) => [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255];
    for (const f of files) {
      const name = enc.encode(f.name), data = enc.encode(f.text), crc = crc32(data);
      const head = Uint8Array.from([].concat(u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0)));   // 0x0800: names are UTF-8; date 1980-01-01
      parts.push(head, name, data);
      central.push(Uint8Array.from([].concat(u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset))), name);
      offset += head.length + name.length + data.length;
    }
    const cdSize = central.reduce((n, p) => n + p.length, 0);
    const end = Uint8Array.from([].concat(u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(cdSize), u32(offset), u16(0)));
    const all = parts.concat(central, [end]), out = new Uint8Array(all.reduce((n, p) => n + p.length, 0)); let at = 0;
    for (const p of all) { out.set(p, at); at += p.length; }
    return out;
  }

  return { MOVES, DELTA, LETTER, LANGS, LIMITS, DEFAULTS, LANG_TIME, limitFor, settingsOf, seedOf, rng, startCells, create, step, aliveList, observe, serialize, parseObs, parseMove, legalMoves,
    BUILTINS, builtinById, builtinDriver, botDriver, splitOutput, playMatch, snapshot, fromFrame, cleanReplay, simulate, describeResult, cleanBot, botFile, fileSafe, cleanText, schedule, runTournament, standings, rank, standingsCsv, zip, crc32 };
});
