// Node tests for the Bot Arena (src/tron.js, src/arena_bots.js): the rules of Tron, the protocol, seeds and replays, hostile files, the built-in bots,
// the starter and solution bots in every language run on the real runtimes (Skulpt, the site's Java interpreter, JSCPP, the Scheme interpreter),
// timeouts and bad bots, share files, the zip and CSV writers, and a round-robin tournament.
//   node test_arena.js          the default run (about a minute)
//   ARENA_FULL=1 node test_arena.js   100 matches for every starter bot, as the spec's acceptance test says (several minutes)
global.window = global;
const { execFileSync } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');
const T = require('./src/tron.js'), B = require('./src/arena_bots.js');
const Scheme = require('./src/scheme.js'), JAVA = require('./src/java.js');
require('./node_modules/skulpt/dist/skulpt.min.js'); require('./node_modules/skulpt/dist/skulpt-stdlib.js');
const JSCPP = require('./node_modules/JSCPP/lib/commonjs.js');
const { ensureMainReturns } = require('./src/cpputil.js');
const FULL = !!process.env.ARENA_FULL;
let bad = 0;
const check = (name, ok, detail) => { if (!ok) { bad++; console.log('BAD  ' + name + (detail !== undefined ? '\n  ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : '')); } };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const throws = (f) => { try { f(); return null; } catch (e) { return e.message || String(e); } };

// ---- the runtimes, as the page's runners give them: run(source, stdin, limitMs) → {out, err, timedOut}
const RUN = {
  python: async (code, stdin, ms) => {
    let out = '', err = null; const inp = String(stdin).split('\n');
    Sk.configure({ output: (t) => { out += t; }, read: (f) => { if (!Sk.builtinFiles.files[f]) throw 'not found ' + f; return Sk.builtinFiles.files[f]; }, __future__: Sk.python3, execLimit: ms, inputfun: () => inp.shift() || '', inputfunTakesPrompt: true });
    try { await Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('<stdin>', false, code, true)); } catch (e) { err = e.toString(); }
    const to = /TimeLimitError/.test(err || '');
    return { out, err: to ? null : err, timedOut: to };
  },
  java: async (code, stdin, ms) => { const r = JAVA.run(code, stdin, { maxMs: ms }); return { out: r.out, err: r.err, timedOut: /time limit|too long/i.test(r.err || '') }; },
  cpp: async (code, stdin, ms) => { let out = '', err = null; try { JSCPP.run(ensureMainReturns(code), stdin, { stdio: { write: (s) => { out += s; } }, maxTimeout: ms, unsigned_overflow: 'warn' }); } catch (e) { err = e.message || String(e); } return { out, err, timedOut: /timeout|time limit/i.test(err || '') }; },
  scheme: async (code, stdin, ms) => { const r = Scheme.runProgram(code, { stdin, stepLimit: ms * 6000 }); return { out: r.output, err: r.error, timedOut: /too long/.test(r.error || '') }; }
};
const student = (name, lang, source, limitMs) => T.botDriver({ name, lang, source, limitMs: limitMs || T.limitFor(lang, 0) }, RUN[lang]);
const builtin = (id, seed, p) => T.builtinDriver(T.builtinById(id), { rng: T.rng(seed), player: p || 0 });

(async () => {
  // ================= the rules
  const mk = (rows, n) => {   // a board from pictures: digits are heads (a player with no digit is out), # is player 2's trail; padded to 10 x 10 at least
    const w = Math.max(10, ...rows.map((r) => r.length)), h = Math.max(10, rows.length), st = T.create({ width: w, height: h, players: n || 2 }, 1);
    st.heads.forEach((hd) => { hd.alive = false; });
    rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === '#') st.grid[y * w + x] = 2; else if (/[1-4]/.test(c)) st.heads[+c - 1] = { x, y, alive: true, at: null, reason: '' }; }));
    return st;
  };
  {
    const st = T.create({}, 1);
    check('default board 20x20, two players at opposite corners offset by two', st.w === 20 && st.h === 20 && st.n === 2 && same(st.heads.map((h) => [h.x, h.y]), [[2, 2], [17, 17]]), st.heads);
    check('four players start in the four corners', same(T.startCells(20, 20, 4), [[2, 2], [17, 17], [17, 2], [2, 17]]));
    check('board sizes are limited to 10..40 and players to 2..4', same([T.settingsOf({ width: 5, height: 99, players: 9 })].map((s) => [s.width, s.height, s.players])[0], [10, 40, 4]));
    const ev = T.step(st, ['RIGHT', 'LEFT']);
    check('a move advances the head and leaves a wall behind', st.heads[0].x === 3 && st.grid[2 * 20 + 2] === 1 && st.heads[1].x === 16 && !ev.length && st.turn === 1);
  }
  {
    const st = mk(['', '', '1', '', '', '     2']);
    const ev = T.step(st, ['LEFT', 'UP']);
    check('leaving the board crashes, with the cell named', ev.length === 1 && ev[0].player === 1 && /left the board at \(-1, 2\)/.test(ev[0].reason) && st.over && st.winner === 2, ev);
    check('the crashed player\u2019s head cell stays as a wall', st.grid[2 * st.w + 0] === 1 && !st.heads[0].alive);
  }
  {
    const st = mk(['1#', '', '', '', '', '     2']);
    const ev = T.step(st, ['RIGHT', 'UP']);
    check('moving into a wall crashes', ev.length === 1 && /ran into player 2\u2019s trail at \(1, 0\)/.test(ev[0].reason), ev);
  }
  {
    const st = T.create({}, 1);
    T.step(st, ['RIGHT', 'LEFT']);
    const ev = T.step(st, ['LEFT', 'RIGHT']);   // reversing into your own trail
    check('reversing into your own trail crashes both here (each reversed)', ev.length === 2 && /own trail/.test(ev[0].reason) && /own trail/.test(ev[1].reason) && st.draw && st.winner === 0, ev);
  }
  {
    const st = mk(['1.2']);
    const ev = T.step(st, ['RIGHT', 'LEFT']);   // both move into (1, 0)
    check('two heads moving into the same empty cell both crash: a draw', ev.length === 2 && /head-on/.test(ev[0].reason) && st.over && st.draw && st.winner === 0, ev);
    check('the contested cell stays empty', st.grid[1] === 0);
  }
  {
    const st = mk(['12']);
    const ev = T.step(st, ['RIGHT', 'LEFT']);   // swap places
    check('swapping places crashes both (each runs into the other’s head)', ev.length === 2 && /head of player 2/.test(ev[0].reason) && /head of player 1/.test(ev[1].reason) && st.draw, ev);
  }
  {
    const st = mk(['', '12']);
    const ev = T.step(st, ['RIGHT', 'UP']);   // player 1 steps into player 2's cell; player 2 leaves it, but the rule is about the start of the turn
    check('moving into a cell a head is leaving still crashes (the board is as at the start of the turn)', ev.length === 1 && ev[0].player === 1 && /head of player 2/.test(ev[0].reason) && st.winner === 2, ev);
  }
  {
    const st = T.create({ players: 3 }, 1);
    st.heads[0] = { x: 5, y: 5, alive: true }; st.heads[1] = { x: 7, y: 5, alive: true }; st.heads[2] = { x: 15, y: 15, alive: true };
    const ev = T.step(st, ['RIGHT', 'LEFT', 'UP']);
    check('three players: two collide, the third is the winner', ev.length === 2 && st.over && st.winner === 3 && !st.draw, [ev, st.winner]);
    const s2 = T.create({ players: 3 }, 1); s2.heads[0] = { x: 5, y: 5, alive: true }; s2.heads[1] = { x: 7, y: 5, alive: true }; s2.heads[2] = { x: 15, y: 15, alive: true };
    const e2 = T.step(s2, ['UP', 'UP', 'UP']);
    check('three players: the game goes on while two are alive', !e2.length && !s2.over && T.aliveList(s2).length === 3);
  }
  {
    const st = T.create({ players: 3 }, 1);
    st.heads[2].alive = false;
    const ev = T.step(st, ['X', 'X', null]);
    check('the last players dropping out together is a draw', st.over && st.draw && st.winner === 0 && ev.length === 2, ev);
    const s2 = T.create({}, 1); T.step(s2, ['X', 'UP'], ['', '']);
    check('a forfeit (X) removes the player and the other wins', s2.over && s2.winner === 2 && !s2.draw);
  }
  {
    const st = T.create({ width: 10, height: 10 }, 1);
    st.turn = 99;   // one turn short of the cap, 10 x 10
    const ev = T.step(st, ['DOWN', 'UP']);
    check('reaching width x height turns with two alive is a draw', st.turn === 100 && st.over && st.draw && st.capped && st.winner === 0 && !ev.length);
    check('a finished game ignores further moves', T.step(st, ['UP', 'UP']).length === 0 && st.turn === 100);
    check('an illegal move name is a programming error, not a crash', /no legal move/.test(throws(() => T.step(T.create({}, 1), ['SIDEWAYS', 'UP']))));
  }

  // ================= the protocol
  {
    const st = T.create({}, 1);
    T.step(st, ['RIGHT', 'LEFT']);
    const text = T.serialize(st, 1), lines = text.split('\n');
    check('turn text: size, "you alive", one line per head, then the rows', lines[0] === '20 20' && lines[1] === '2 2' && lines[2] === '3 2 1' && lines[3] === '16 17 2' && lines.length === 4 + 20 + 1 && lines[24] === '', lines.slice(0, 6));
    check('rows: # for a trail, digits for heads, . for empty', lines[4 + 2] === '..#1................' && lines[4 + 17] === '................2#..', [lines[6], lines[21]]);
    check('serialize and parseObs agree with observe', same(T.parseObs(text), T.observe(st, 1)));
    const st3 = T.create({ players: 3 }, 1); st3.heads[1].alive = false;
    const t3 = T.serialize(st3, 2).split('\n');
    check('players that are out are left off the list and the count', t3[1] === '3 2' && t3[2] === '2 2 1' && t3[3] === '17 2 3', t3.slice(0, 4));
    check('the exact layout from the spec (width height / you alive / heads / grid)', /^\d+ \d+\n\d+ \d+\n(\d+ \d+ \d+\n)+[.#1-4]+\n/.test(text));
  }
  {
    const ok = (t, m) => T.parseMove(t).move === m;
    check('moves: any case, spaces ignored, blank lines ignored', ok('UP\n', 'UP') && ok('  right  ', 'RIGHT') && ok('\n\nLeft\n\n', 'LEFT') && ok('down', 'DOWN'));
    check('bad replies give a reason', /nothing/.test(T.parseMove('').error) && /2 lines/.test(T.parseMove('UP\nDOWN').error) && /not UP, DOWN/.test(T.parseMove('north').error) && /not UP/.test(T.parseMove('UP DOWN').error));
    check('a reply with control characters cannot spoil the log', !/\u0007/.test(T.parseMove('\u0007x').error));
    const sp = T.splitOutput('LOG thinking 1\nUP\nLOG\nLOG again\n');
    check('LOG lines are split off from the move', sp.text.trim() === 'UP' && sp.log === 'thinking 1\n\nagain', sp);
    check('a line that merely starts with LOG... letters stays a reply', T.splitOutput('LOGIC\n').text.trim() === 'LOGIC');
  }

  // ================= seeds and replays
  {
    const play = (seed) => T.playMatch({ settings: {}, seed, drivers: [builtin('random', seed * 3 + 1), builtin('random', seed * 3 + 2, 1)] });
    const a = await play(7), b = await play(7), c = await play(8);
    check('the same seed always gives the same replay', same(a.replay, b.replay));
    check('a different seed gives a different match', !same(a.replay.moves, c.replay.moves));
    const sim = T.simulate(T.cleanReplay(JSON.parse(JSON.stringify(a.replay))));
    check('re-simulating a replay file gives the live frames and result', same(sim.frames, a.frames) && same(sim.result.crashes, a.replay.result.crashes) && sim.result.winner === a.replay.result.winner && sim.result.turns === a.replay.result.turns);
    check('the replay is small (well under 10 KB)', JSON.stringify(a.replay).length < 10000, JSON.stringify(a.replay).length);
    check('frames: one per turn plus the empty board', a.frames.length === a.replay.result.turns + 1 && a.frames[0].turn === 0);
    check('the banner words name the winner and every crash', (() => { const r = T.cleanReplay(a.replay); const lines = T.describeResult(r, sim.result); return /wins after \d+ turns?\./.test(lines[0]) || /draw/i.test(lines[0]); })());
  }
  {
    const t0 = Date.now(), wins = { 0: 0, 1: 0, 2: 0 }; let first = null;
    for (let i = 0; i < 100; i++) {
      const m = await T.playMatch({ settings: {}, seed: i + 1, drivers: [builtin('random', i * 2 + 1), builtin('flood', i * 2 + 2, 1)] });
      wins[m.replay.result.winner]++; if (i === 0) first = m.replay;
    }
    const ms = Date.now() - t0;
    check('Random vs Flood Fill: 100 matches headless in under 5 s', ms < 5000, ms + ' ms');
    check('Flood Fill beats Random in nearly every match', wins[2] >= 95, wins);
    const again = await T.playMatch({ settings: {}, seed: 1, drivers: [builtin('random', 1), builtin('flood', 2, 1)] });
    check('and match 1 of the 100 is reproduced exactly by its seed', same(again.replay, first));
    console.log('     100 matches Random vs Flood Fill: ' + ms + ' ms, wins ' + JSON.stringify(wins));
  }
  {
    const wins = { hugger: 0, random: 0, draw: 0 };
    for (let i = 0; i < 40; i++) { const sw = i % 2, ids = sw ? ['random', 'hugger'] : ['hugger', 'random']; const m = await T.playMatch({ settings: {}, seed: i + 1, drivers: ids.map((id, k) => builtin(id, i * 3 + k, k)) }); const w = m.replay.result.winner; if (!w) wins.draw++; else wins[ids[w - 1]]++; }
    check('the Wall Hugger beats Random most of the time', wins.hugger >= 28, wins);
    const f = { flood: 0, hugger: 0, draw: 0 };
    for (let i = 0; i < 20; i++) { const sw = i % 2, ids = sw ? ['hugger', 'flood'] : ['flood', 'hugger']; const m = await T.playMatch({ settings: {}, seed: i + 1, drivers: ids.map((id, k) => builtin(id, i * 3 + k, k)) }); const w = m.replay.result.winner; if (!w) f.draw++; else f[ids[w - 1]]++; }
    check('Flood Fill never loses to the Wall Hugger', f.hugger === 0, f);
  }
  {
    const four = await T.playMatch({ settings: { players: 4 }, seed: 3, drivers: ['random', 'hugger', 'flood', 'random'].map((id, k) => builtin(id, k + 1, k)) });
    check('a four-player match ends with a winner or a draw and a replay that re-simulates', four.state.over && same(T.simulate(four.replay).result.winner, four.replay.result.winner) && four.replay.moves.every((m) => m.length === 4));
    const big = await T.playMatch({ settings: { width: 40, height: 40 }, seed: 3, drivers: [builtin('flood', 1), builtin('flood', 2, 1)] });
    check('a 40 x 40 match runs to the end', big.state.over);
  }

  // ================= hostile replays and bot files
  {
    const good = (await T.playMatch({ settings: {}, seed: 4, drivers: [builtin('hugger', 1), builtin('random', 2, 1)] })).replay;
    const bad1 = (mut) => throws(() => T.cleanReplay(mut(JSON.parse(JSON.stringify(good)))));
    check('a good replay passes', !throws(() => T.cleanReplay(good)));
    check('not a replay at all', !!throws(() => T.cleanReplay(null)) && !!throws(() => T.cleanReplay('x')) && !!throws(() => T.cleanReplay({})) && !!throws(() => T.cleanReplay([])));
    check('wrong version', /different version/.test(bad1((r) => { r.version = 2; return r; })));
    check('a turn with the wrong number of moves', /one move per player/.test(bad1((r) => { r.moves[0] = 'UDL'; return r; })));
    check('a move letter that does not exist', /one move per player/.test(bad1((r) => { r.moves[0] = 'Q?'; return r; })));
    check('moves that are not strings', !!bad1((r) => { r.moves[0] = ['U', 'D']; return r; }) && !!bad1((r) => { r.moves = 'UDUD'; return r; }));
    check('more turns than the board can hold', /too many turns/.test(bad1((r) => { r.moves = new Array(401).fill('UD'); return r; })));
    const huge = T.cleanReplay((() => { const r = JSON.parse(JSON.stringify(good)); r.settings = { width: 1e9, height: -5, players: 'x', timeMs: Infinity, invalid: { evil: 1 } }; r.moves = []; return r; })());
    check('absurd settings are clamped', huge.settings.width === 40 && huge.settings.height === 10 && huge.settings.players === 2 && huge.settings.invalid === 'up' && huge.settings.timeMs >= 0 && huge.settings.timeMs <= 10000, huge.settings);
    const poison = T.cleanReplay((() => { const r = JSON.parse('{"format":"tronreplay","version":1,"__proto__":{"polluted":1},"settings":{"__proto__":{"polluted":2}},"players":[{"name":"<img src=x onerror=alert(1)>\\u0000\\u0007","lang":"__proto__"},{"name":"b","lang":"constructor"}],"moves":[],"result":{"crashes":[{"player":7,"turn":-3,"at":[1e99,"x"],"reason":"' + 'x'.repeat(5000) + '"}]}}'); return r; })());
    check('prototype pollution and odd keys do nothing', ({}).polluted === undefined && poison.settings.polluted === undefined);
    check('names are text, cut short, with control characters removed; languages must be known', poison.players[0].name === '<img src=x onerror=alert(1)>' && poison.players[0].lang === 'js' && poison.players[1].lang === 'js');
    check('crash records are clamped and their text is cut', poison.result.crashes[0].player === 2 && poison.result.crashes[0].reason.length <= 200 && poison.result.crashes[0].turn >= 1 && poison.result.crashes[0].at[0] <= 1000);
    const manyCrashes = T.cleanReplay((() => { const r = JSON.parse(JSON.stringify(good)); r.result.crashes = new Array(500).fill({ player: 1, turn: 1, at: [0, 0], reason: 'x' }); return r; })());
    check('at most a few crash records are kept', manyCrashes.result.crashes.length <= 8);
    const fromFile = T.simulate(T.cleanReplay(JSON.parse(JSON.stringify(good))));
    check('a replay whose moves lie about the end simply plays until the rules end it', fromFile.state.over);
    const drive = T.simulate(T.cleanReplay((() => { const r = JSON.parse(JSON.stringify(good)); r.moves = new Array(40).fill('UU'); r.result = { winner: 1 }; return r; })()));
    check('simulate ignores a lying result field and stops when the game is over', drive.state.over && drive.result.winner === 2 && drive.frames.length === 4, [drive.result, drive.frames.length]);
  }
  {
    const f = T.botFile({ name: 'My bot', lang: 'python', source: 'print("UP")' });
    check('bot file round trip', same(T.cleanBot(JSON.parse(JSON.stringify(f))), { name: 'My bot', lang: 'python', source: 'print("UP")' }) && f.format === 'tronbot' && f.version === 1);
    const msg = (o) => throws(() => T.cleanBot(o));
    check('bad bot files are refused with a reason', /not a Bot Arena bot/.test(msg({})) && /language/.test(msg({ format: 'tronbot', version: 1, lang: 'ruby', source: 'x' })) && /no program/.test(msg({ format: 'tronbot', version: 1, lang: 'java', source: '  ' })) && /different version/.test(msg({ format: 'tronbot', version: 7, lang: 'java', source: 'x' })) && /longer than/.test(msg({ format: 'tronbot', version: 1, lang: 'java', source: 'x'.repeat(30000) })) && !!msg(null) && !!msg({ format: 'tronbot', version: 1, lang: 'java', source: 5 }));
    const n = T.cleanBot({ format: 'tronbot', version: 1, name: '\u0000'.repeat(3) + 'n'.repeat(100), lang: 'scheme', source: 'a\r\nb' });
    check('bot names are cut and sources get Unix line ends', n.name.length === 40 && n.source === 'a\nb');
    check('file names are safe', T.fileSafe('../../etc/passwd') === 'etc-passwd' && T.fileSafe('') === 'bot' && T.fileSafe('Ünï cødé!') === 'n-c-d');
  }

  // ================= the starter and solution bots, on the real runtimes
  {
    const st = T.create({}, 1), text = T.serialize(st, 0);
    for (const kind of ['templates', 'solutions']) for (const lang of B.langs) {
      const src = B[kind][lang], r = await RUN[lang](src, text, 5000);
      const mv = T.parseMove(T.splitOutput(r.out).text);
      check(kind + ' ' + lang + ' prints one legal move on the first turn', !r.err && !!mv.move, [r.err, r.out]);
      if (kind === 'templates') check('the ' + lang + ' starter is under 80 lines and is commented', src.split('\n').length < 80 && /^(#|\/\/|;)/.test(src) && (src.match(/(#|\/\/|;)/g) || []).length >= 6);
    }
    check('the Python starter is under 40 lines of code (as the spec asks)', B.templates.python.split('\n').filter((l) => l.trim() && !/^\s*#/.test(l)).length <= 40);
    // a boxed-in head: every move crashes, the bots still print a move
    const boxed = T.create({}, 1); for (const [x, y] of [[2, 1], [2, 3], [1, 2], [3, 2]]) boxed.grid[y * 20 + x] = 2;
    for (const lang of B.langs) for (const kind of ['templates', 'solutions']) { const r = await RUN[lang](B[kind][lang], T.serialize(boxed, 0), 5000); check(kind + ' ' + lang + ' still prints a move when boxed in', !r.err && !!T.parseMove(T.splitOutput(r.out).text).move, [r.err, r.out]); }
    // each language's bot must read the same board the same way: all say the same legal moves on a mid-game board
    const mid = T.create({}, 5); const rnd = T.rng(5); for (let i = 0; i < 30; i++) { const ok = T.legalMoves(T.observe(mid, 0)); if (mid.over) break; const o0 = T.observe(mid, 0), o1 = T.observe(mid, 1); T.step(mid, [T.legalMoves(o0).length ? T.legalMoves(o0)[rnd.int(T.legalMoves(o0).length)] : 'UP', T.legalMoves(o1).length ? T.legalMoves(o1)[rnd.int(T.legalMoves(o1).length)] : 'UP']); void ok; }
    const midText = T.serialize(mid, 0), moves = {};
    for (const lang of B.langs) { const r = await RUN[lang](B.solutions[lang], midText, 8000); moves[lang] = T.splitOutput(r.out).text.trim(); check('solution ' + lang + ' runs on a mid-game board', !r.err, r.err); }
    check('all four Flood Fill solutions choose the same move (same algorithm, same tie-breaks)', new Set(Object.values(moves)).size === 1, moves);
  }
  // The starters, the solutions and Random, played out. (The starter only prints the first move that does not crash, so it beats Random about
  // as often as not; the Flood Fill solutions are what reach 90%. The spec's own acceptance test cannot hold for a first-legal-move starter.)
  const versus = async (lang, kind, n, minWins, limit) => {
    let win = 0, turns = 0, slowest = 0; const t0 = Date.now();
    for (let i = 0; i < n; i++) {
      const sw = i % 2, bot = student(kind + '-' + lang, lang, B[kind][lang], limit), rnd = builtin('random', i + 11, sw ? 0 : 1);
      const m = await T.playMatch({ settings: {}, seed: i + 1, drivers: sw ? [rnd, bot] : [bot, rnd] });
      if (m.replay.result.winner === (sw ? 2 : 1)) win++; turns += m.replay.result.turns;
    }
    console.log('     ' + lang + ' ' + kind + ' vs Random: ' + win + '/' + n + ' (' + Math.round((Date.now() - t0) / n) + ' ms a match, ' + Math.round(turns / n) + ' turns)');
    check(lang + ' ' + kind + ' beats Random in at least ' + minWins + ' of ' + n, win >= minWins, win + '/' + n);
    void slowest;
  };
  await versus('python', 'solutions', FULL ? 100 : 20, FULL ? 90 : 17, 5000);
  await versus('python', 'templates', FULL ? 100 : 40, FULL ? 40 : 16, 5000);
  for (const lang of ['java', 'scheme', 'cpp']) { await versus(lang, 'templates', FULL ? 100 : 10, FULL ? 40 : 4, 20000); }
  if (FULL) for (const lang of ['java', 'scheme']) await versus(lang, 'solutions', 100, 90, 20000);
  {
    // Every language's bot must make the same choice as Python's on the same boards, all the way through a game (the same algorithm and tie-breaks).
    const m = await T.playMatch({ settings: {}, seed: 21, drivers: [student('Py', 'python', B.solutions.python, 5000), builtin('random', 3, 1)] });
    const st = T.create(m.replay.settings, m.replay.seed), rows = [];
    for (const mv of m.replay.moves) { rows.push(T.serialize(st, 0)); T.step(st, [...mv].map((c, p) => (st.heads[p].alive ? { U: 'UP', D: 'DOWN', L: 'LEFT', R: 'RIGHT' }[c] || 'X' : null))); }
    const every = { java: 3, scheme: 3, cpp: 9 };
    for (const kind of ['solutions', 'templates']) for (const lang of ['python', 'java', 'scheme', 'cpp']) {
      if (kind === 'solutions' && lang === 'python') continue;
      let diffs = 0, tried = 0;
      for (let t = 0; t < rows.length; t += (lang === 'cpp' && kind === 'solutions') ? every.cpp : (every[lang] || 3)) {
        const r = await RUN[lang](B[kind][lang], rows[t], 20000), got = T.parseMove(T.splitOutput(r.out).text).move;
        const ref = kind === 'solutions' ? { U: 'UP', D: 'DOWN', L: 'LEFT', R: 'RIGHT' }[m.replay.moves[t][0]] : (await RUN.python(B.templates.python, rows[t], 5000), T.parseMove(T.splitOutput((await RUN.python(B.templates.python, rows[t], 5000)).out).text).move);
        tried++; if (got !== ref) diffs++;
      }
      check(lang + ' ' + kind + ' choose the same move as the Python ones on every board of a ' + rows.length + '-turn game (' + tried + ' boards)', diffs === 0, diffs + ' differ');
    }
  }

  // ================= bad bots
  {
    const run2 = (a, b, settings) => T.playMatch({ settings: Object.assign({}, settings), seed: 2, drivers: [a, b] });
    // a bot that never ends
    const loop = student('Looper', 'python', 'while True:\n    pass\n', 150);
    const logs = [];
    const m = await T.playMatch({ settings: {}, seed: 2, drivers: [loop, builtin('flood', 1, 1)], onLog: (p, k, t) => logs.push([p, k, t]) });
    check('an infinite loop times out, the referee logs it, and the match still ends', m.state.over && logs.some((l) => l[1] === 'referee' && /took longer than 150 ms/.test(l[2])) && m.replay.moves.length > 1, logs.slice(0, 3));
    check('the timed-out bot is moved UP by default (rule 9)', m.replay.moves[0][0] === 'U');
    const fm = await T.playMatch({ settings: { invalid: 'forfeit' }, seed: 2, drivers: [student('Looper', 'python', 'while True:\n    pass\n', 150), builtin('flood', 1, 1)] });
    check('with "forfeit" a timeout drops the bot out on that turn', fm.replay.moves[0][0] === 'X' && fm.replay.result.winner === 2 && fm.replay.result.crashes[0].turn === 1 && /forfeit: took longer/.test(fm.replay.result.crashes[0].reason), fm.replay.result.crashes);
    // a syntax error forfeits before turn 1
    const lg2 = [];
    const se = await T.playMatch({ settings: {}, seed: 2, drivers: [student('Broken', 'python', 'def f(:\n  pass\n'), builtin('random', 1, 1)], onLog: (p, k, t) => lg2.push(t) });
    check('a syntax error forfeits before turn 1 and the error is shown', se.replay.result.winner === 2 && se.replay.result.turns === 1 && lg2.some((t) => /forfeits before turn 1/.test(t) && /\w/.test(t)) && /did not start/.test(se.replay.result.crashes[0].reason), [lg2, se.replay.result.crashes]);
    check('...and the replay of it still re-simulates', T.simulate(T.cleanReplay(se.replay)).result.winner === 2);
    const jse = await T.playMatch({ settings: {}, seed: 2, drivers: [student('BrokenJ', 'java', 'public class Main { public static void main(String[] a) { int x = "s"; } }'), builtin('random', 1, 1)], onLog: (p, k, t) => lg2.push(t) });
    check('a Java compile error forfeits too, with javac’s words', jse.replay.result.winner === 2 && lg2.some((t) => /incompatible types/.test(t)), lg2.slice(-1));
    const sch = await T.playMatch({ settings: {}, seed: 2, drivers: [student('BrokenS', 'scheme', '(display (+ 1'), builtin('random', 1, 1)], onLog: () => { } });
    check('an unfinished Scheme program forfeits', sch.replay.result.winner === 2);
    const cpp = await T.playMatch({ settings: {}, seed: 2, drivers: [student('BrokenC', 'cpp', 'int main() { return 0 }'), builtin('random', 1, 1)], onLog: () => { } });
    check('a C++ syntax error forfeits', cpp.replay.result.winner === 2);
    // a bot that prints rubbish, a bot that prints two lines, a bot that fails only sometimes, LOG lines
    const lg3 = [];
    const rub = await T.playMatch({ settings: {}, seed: 2, drivers: [student('Rubbish', 'python', 'print("NORTH")'), builtin('flood', 1, 1)], onLog: (p, k, t) => lg3.push(t) });
    check('a reply that is not a move is logged with what was printed', lg3.some((t) => /printed “NORTH”/.test(t)) && rub.replay.moves.every((m) => m[0] === 'U'), lg3.slice(0, 2));
    const two = [];
    await T.playMatch({ settings: {}, seed: 2, drivers: [student('Chatty', 'python', 'print("hello")\nprint("RIGHT")'), builtin('flood', 1, 1)], onLog: (p, k, t) => two.push(t) });
    check('two lines of output is an invalid reply (debug output belongs in a LOG line)', two.some((t) => /2 lines/.test(t)));
    const sometimes = student('Sometimes', 'python', 'import sys\nw, h = map(int, input().split())\nyou, alive = map(int, input().split())\nx, y, p = map(int, input().split())\nif x > 4:\n    raise ValueError("too far east")\nprint("RIGHT")');
    const lg4 = [];
    const sm = await T.playMatch({ settings: {}, seed: 2, drivers: [sometimes, builtin('flood', 1, 1)], onLog: (p, k, t) => lg4.push([k, t]) });
    check('a bot that raises an error on some turn is moved UP that turn and its traceback goes to its log', lg4.some((l) => l[0] === 'stderr' && /ValueError/.test(l[1])) && lg4.some((l) => l[0] === 'referee' && /crashed/.test(l[1])), lg4.slice(0, 3));
    const lg5 = [];
    await T.playMatch({ settings: {}, seed: 2, drivers: [student('Talker', 'python', 'print("LOG hello from the bot")\nprint("DOWN")'), builtin('flood', 1, 1)], onLog: (p, k, t) => lg5.push([p, k, t]) });
    check('a LOG line reaches the bot’s log and does not spoil the move', lg5.some((l) => l[0] === 0 && l[1] === 'stderr' && l[2] === 'hello from the bot') && !lg5.some((l) => l[1] === 'referee'), lg5.slice(0, 3));
    // a runtime error in each of the other languages: caught, not fatal
    for (const [lang, src] of [['java', 'public class Main { public static void main(String[] a) { int[] x = new int[1]; x[3] = 1; } }'], ['scheme', '(car 5)'], ['cpp', '#include <iostream>\nusing namespace std;\nint main() { int a = 0; cout << 5 / a; return 0; }']]) {
      const lg = [];
      const r = await T.playMatch({ settings: { invalid: 'up' }, seed: 2, drivers: [student('Err-' + lang, lang, src), builtin('random', 1, 1)], onLog: (p, k, t) => lg.push(t) });
      check(lang + ': a program that fails on every run forfeits at the start, with its error shown', r.state.over && lg.length > 0, lg);
    }
    // a driver that throws
    const bomb = { name: 'Bomb', lang: 'js', start: async () => ({ ok: true }), move: async () => { throw new Error('boom'); }, stop() { } };
    const lg6 = [];
    const bm = await T.playMatch({ settings: {}, seed: 2, drivers: [bomb, builtin('flood', 1, 1)], onLog: (p, k, t) => lg6.push(t) });
    check('a driver that throws is treated as a crashed bot, not as a failure of the referee', bm.state.over && lg6.some((t) => /crashed/.test(t)));
    // stopping
    let stop = false, n = 0;
    const sp = await T.playMatch({ settings: {}, seed: 2, drivers: [builtin('hugger', 1), builtin('hugger', 2, 1)], shouldStop: () => stop, onTurn: () => { if (++n === 3) stop = true; } });
    check('a match can be stopped between turns', sp.aborted && sp.replay.moves.length === 3);
    void run2;
  }
  {
    // two languages at once: a Python bot against a C++ bot, no extra work from either student
    const lg = [];
    const m = await T.playMatch({ settings: {}, seed: 9, drivers: [student('Py', 'python', B.solutions.python, 5000), student('Cpp', 'cpp', B.templates.cpp, 20000)], onLog: (p, k, t) => lg.push([p, k, t]) });
    check('a Python bot plays a C++ bot', m.state.over && m.replay.players[0].lang === 'python' && m.replay.players[1].lang === 'cpp' && m.replay.moves.length > 5 && !lg.some((l) => l[1] === 'referee'), lg.slice(0, 2));
    check('the replay of a mixed match names both languages and re-simulates', T.simulate(T.cleanReplay(m.replay)).result.winner === m.replay.result.winner);
    const m2 = await T.playMatch({ settings: { players: 3 }, seed: 9, drivers: [student('Py', 'python', B.templates.python, 5000), student('Jv', 'java', B.templates.java, 5000), student('Sc', 'scheme', B.templates.scheme, 5000)] });
    check('three bots in three languages play one match', m2.state.over && m2.replay.moves.every((x) => x.length === 3));
  }

  // ================= tournaments, CSV and zip
  {
    check('the schedule has every pair, `rounds` times, with starts swapped on alternate rounds', (() => { const j = T.schedule(12, 2); return j.length === 132 && j.filter((x) => x.flip).length === 66 && j.every((x) => x.a < x.b); })());
    const rows = T.standings(3, [{ a: 0, b: 1, winner: 'a', turns: { a: 30, b: 20 } }, { a: 0, b: 2, winner: null, turns: { a: 10, b: 10 } }, { a: 1, b: 2, winner: 'b', turns: { a: 5, b: 40 } }]);
    check('3 points for a win, 1 for a draw, 0 for a loss', rows[0].points === 4 && rows[1].points === 0 && rows[2].points === 4 && rows[0].wins === 1 && rows[0].draws === 1 && rows[1].losses === 2, rows);
    check('ties are broken by turns survived', T.rank(rows)[0].bot === 2 && T.rank(rows)[1].bot === 0 && rows[2].turns === 50, T.rank(rows));
    const csv = T.standingsCsv(['=HYPERLINK("http://x","y")', 'a,b', 'say "hi"'], rows);
    check('CSV: header, one row per bot, quotes doubled, formulas defused', csv.split('\r\n')[0] === 'Rank,Bot,Played,Wins,Draws,Losses,Points,Turns survived' && csv.includes("\"'=HYPERLINK(\"\"http://x\"\",\"\"y\"\")\"") && csv.includes('"a,b"') && csv.includes('"say ""hi"""') && csv.split('\r\n').length === 5, csv);
    check('CRC-32 of "123456789" is the standard check value', T.crc32(new TextEncoder().encode('123456789')) === 0xCBF43926);
    const z = T.zip([{ name: 'a.json', text: '{"x":1}' }, { name: 'b/ünï.txt', text: 'héllo\n'.repeat(50) }]);
    const tmp = path.join(os.tmpdir(), 'arena-test-' + process.pid + '.zip'); fs.writeFileSync(tmp, z);
    let listing = '';
    try { listing = execFileSync('python3', ['-c', 'import zipfile,sys; z=zipfile.ZipFile(sys.argv[1]); assert z.testzip() is None; print("|".join(n + ":" + z.read(n).decode()[:6] for n in z.namelist()))', tmp]).toString().trim(); } catch (e) { listing = 'ERR ' + e.message; }
    fs.unlinkSync(tmp);
    check('the zip opens in a real unzipper, with every file intact', /^a\.json:\{"x":1\|b\/ünï\.txt:héllo/.test(listing), listing);
    check('an empty zip is valid too', T.zip([]).length === 22);

    const bots = [];
    for (const id of ['random', 'hugger', 'flood']) for (let k = 0; k < 4; k++) bots.push({ name: id + k, lang: 'js', driver: (sd) => T.builtinDriver(T.builtinById(id), { rng: T.rng(sd), player: 0 }) });
    let prog = 0;
    const t0 = Date.now();
    const out = await T.runTournament({ bots, rounds: 2, settings: {}, seed: 5, onProgress: (d, total) => { prog = d; if (total !== 132) prog = -1; } });
    check('12 bots, 2 matches a pairing: 132 matches, with progress reported', out.results.length === 132 && prog === 132 && !out.aborted, [out.results.length, prog]);
    const table = T.rank(T.standings(12, out.results));
    check('every match gives 3 points (a win) or 2 (a draw)', table.reduce((n, r) => n + r.points, 0) === out.results.reduce((n, r) => n + (r.winner ? 3 : 2), 0));
    check('Flood Fill bots top the table and Random bots are at the bottom', table.slice(0, 4).every((r) => /^flood/.test(bots[r.bot].name)) && table.slice(-4).filter((r) => /^random/.test(bots[r.bot].name)).length >= 3, table.map((r) => bots[r.bot].name + ':' + r.points).join(' '));
    check('each match carries a replay that re-simulates to its winner', out.results.every((r) => { const s = T.simulate(T.cleanReplay(r.replay)); return s.result.winner === r.replay.result.winner; }));
    check('the swapped rounds put the second bot in slot 1', out.results.some((r) => r.flip && r.winner === (r.replay.result.winner === 1 ? 'b' : r.replay.result.winner === 2 ? 'a' : null)));
    const again = await T.runTournament({ bots, rounds: 2, settings: {}, seed: 5 });
    check('the same seed gives the same tournament', same(again.results.map((r) => [r.winner, r.turns]), out.results.map((r) => [r.winner, r.turns])));
    let stopAt = 0; const part = await T.runTournament({ bots, rounds: 2, settings: {}, seed: 5, shouldStop: () => stopAt++ >= 10 });
    check('a tournament can be stopped, keeping what finished', part.aborted && part.results.length === 10);
    console.log('     132 built-in matches: ' + (Date.now() - t0) + ' ms');
  }

  if (bad) { console.log(bad + ' problems'); process.exit(1); }
  console.log('arena OK');
})().catch((e) => { console.log('CRASH ' + (e && e.stack || e)); process.exit(1); });
