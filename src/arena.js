/* Bot Arena: the #/arena page (write a bot, play it against the built-in bots or your other bots, watch and share the match) and the
   #/arena/tournament page (load a class's bots, run a round robin, show it on a projector). ARCHITECTURE §9j.
   The rules, the referee and the bots are in src/tron.js; running a program and saving bots in src/arena_run.js; drawing in src/arena_view.js.
   A bot (or replay) link is  #/arena?bot=<packed>  or  #/arena?replay=<packed>: the data is in the fragment, so it is never sent to a server.
   Student bots loaded for a tournament stay in this browser. */
(function () {
  'use strict';
  const T = window.TRON, B = window.TRONBOTS, A = window.ARENA;
  const el = (...a) => window.__app.internal.el(...a);
  const armConfirm = (...a) => window.__app.internal.armConfirm(...a);
  const LABEL = A.LANG_LABEL;
  const BUILTIN_VALUE = (id) => 'b:' + id;
  const tick = () => new Promise((r) => setTimeout(r, 0));   // let the browser draw and answer clicks between matches
  const intIn = (input, lo, hi, d) => { const n = Math.round(Number(input.value)); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d; };
  const langName = (l) => (l === 'js' ? 'built in' : LABEL[l] || l);
  const pristine = (src) => !src.trim() || Object.values(B.templates).includes(src) || Object.values(B.solutions).includes(src);
  const MAX_FILE = 1024 * 1024;

  function subnav(here) {
    return el('p', { class: 'arena-subnav small' }, here === 'play' ? el('b', {}, 'Write a bot') : el('a', { href: '#/arena' }, 'Write a bot'), ' · ',
      here === 'tournament' ? el('b', {}, 'Run a tournament (for teachers)') : el('a', { href: '#/arena/tournament' }, 'Run a tournament (for teachers)'));
  }
  const howItWorks = () => el('details', { class: 'arena-how' }, el('summary', {}, 'How a bot talks to the arena'),
    el('p', {}, 'A bot is a normal program, in Python, Java, C++ or Scheme. Every turn the arena runs it afresh, gives it the board on its standard input (what ', el('code', {}, 'input()'), ', ', el('code', {}, 'cin'), ' or ', el('code', {}, 'Scanner'), ' read), and the bot prints ONE move: ', el('code', {}, 'UP'), ', ', el('code', {}, 'DOWN'), ', ', el('code', {}, 'LEFT'), ' or ', el('code', {}, 'RIGHT'), '. A bot starts fresh each turn, so it remembers nothing from the last one.'),
    el('pre', { class: 'arena-sample' }, '20 20          the board: width height\n1 2            you are player 1; 2 players are still alive\n3 2 1          where each player’s head is: x y player\n16 17 2\n....................   one line per row, top row first:\n..#1................   . empty   # a wall (a trail)   1-4 a head\n...                    (20 rows in all; (0, 0) is the top left)'),
    el('p', {}, 'All players move at the same time. A player crashes by leaving the board, running into a wall or a head, or moving into the same cell as another player; the last player left wins. A bot that prints something that is not a move, takes too long, or fails is moved UP for that turn (you can make that a forfeit instead), and the reason appears in the log.'),
    el('p', {}, 'To see what your bot is thinking, print a line that starts with ', el('code', {}, 'LOG '), ', for example ', el('code', {}, 'print("LOG going", move)'), '. Those lines go to your bot’s tab in the log and the arena ignores them (the sandboxes have no separate error channel). Anything else you print counts as your move.'),
    el('p', {}, el('b', {}, 'Restart or persistent. '), 'In restart mode (the default) the arena runs your program afresh every turn: it reads one board, prints one move and ends, so it remembers nothing. In persistent mode the program is started once and kept running: the arena sends the first turn after a line ', el('code', {}, 'TRON 1'), ', ends every turn with a line ', el('code', {}, 'END'), ', and sends ', el('code', {}, 'GAMEOVER'), ' when the match is over. The starter bots already loop until their input ends, so they work in both modes; in persistent mode a variable kept outside the loop remembers things from turn to turn, and nothing is parsed or started again. A bot that takes too long is ended, and starts again, forgetting everything, on the next turn. Persistent mode needs the site to be opened from its web address (not from a file, and not inside another page\u2019s frame).'),
    el('p', {}, 'Time: each move gets 500 ms (2 seconds for C++, which this site runs on a slower interpreter), unless the match says otherwise. The same seed and the same moves always replay the same match.'));

  // =================================================================== the play page
  function playPage(query) {
    const S = A.store(), main = el('main', { class: 'arena' });
    if (!S.bots.length) { const b = A.addBot({ name: 'My first bot', lang: 'python', source: B.templates.python }); S.current = b.id; A.save(); }
    let bot = A.byId(S.current) || S.bots[0];
    S.current = bot.id;
    let editor = null, running = false, stopFlag = false, current = null, series = null, logTab = 'ref', saveTimer = 0;
    const alive = () => main.isConnected;
    const saveSoon = () => { clearTimeout(saveTimer); saveTimer = setTimeout(() => { saveTimer = 0; A.save(); }, 400); };
    // an edit still waiting for its save is written when the page goes; nothing else is, or a restored backup would be overwritten by this page's older copy
    window.addEventListener('pagehide', () => { if (saveTimer) { clearTimeout(saveTimer); saveTimer = 0; A.save(); } });

    // ---- editor pane
    const nameInput = el('input', { type: 'text', class: 'arena-name', maxlength: 40, 'aria-label': 'Bot name', value: bot.name });
    const langSel = el('select', { 'aria-label': 'Language' }, T.LANGS.map((l) => el('option', { value: l }, LABEL[l])));
    const botSel = el('select', { 'aria-label': 'My bots', class: 'arena-botsel' });
    const editorHost = el('div', { class: 'arena-editor' });
    const paneNote = el('div', { class: 'arena-panenote', role: 'status' });
    const linkSlot = el('div');
    const fileIn = el('input', { type: 'file', accept: '.json,application/json', hidden: '', 'aria-label': 'Open a bot or replay file' });
    const pasteBox = el('textarea', { rows: 3, class: 'arena-paste', placeholder: 'Paste a bot or replay link, or the contents of a .tronbot.json or .tronreplay.json file', 'aria-label': 'Paste a link or file' });
    const note = (text, bad) => { paneNote.textContent = text || ''; paneNote.className = 'arena-panenote' + (bad ? ' err' : ''); };
    function mountEditor() {
      editorHost.textContent = '';
      editor = window.__app.makeEditor(bot.lang, bot.source, (v) => { bot.source = v; bot.at = Date.now(); saveSoon(); });
      editorHost.append(editor.el);
      langSel.value = bot.lang; nameInput.value = bot.name;
    }
    function fillBotSel() {
      botSel.textContent = '';
      for (const b of S.bots) botSel.append(el('option', { value: b.id, selected: b.id === bot.id ? '' : null }, b.name + ' (' + LABEL[b.lang] + ')'));
      botSel.value = bot.id;
    }
    function useBot(b) { bot = b; S.current = b.id; A.save(); mountEditor(); fillBotSel(); fillSlots(); note(''); linkSlot.textContent = ''; }
    botSel.addEventListener('change', () => { const b = A.byId(botSel.value); if (b) useBot(b); });
    nameInput.addEventListener('input', () => { bot.name = T.cleanText(nameInput.value, 40) || 'Unnamed bot'; fillBotSel(); fillSlots(); saveSoon(); });
    const swapBox = el('div', { class: 'arena-swap', hidden: '' });
    langSel.addEventListener('change', () => {
      const to = langSel.value, from = bot.lang;
      if (to === from) return;
      const doSwitch = () => { bot.lang = to; bot.source = B.templates[to]; swapBox.hidden = true; mountEditor(); fillBotSel(); fillSlots(); saveSoon(); note('Switched to ' + LABEL[to] + ' with its starter bot.'); };
      if (pristine(bot.source)) { doSwitch(); return; }
      langSel.value = from;
      swapBox.hidden = false; swapBox.textContent = '';
      swapBox.append(el('span', {}, 'Switching to ' + LABEL[to] + ' replaces your ' + LABEL[from] + ' code with the ' + LABEL[to] + ' starter. To keep it, make a new bot instead. '),
        el('button', { class: 'btn sm', onclick: () => { langSel.value = to; doSwitch(); } }, 'Replace my code'), ' ',
        el('button', { class: 'btn quiet sm', onclick: () => { swapBox.hidden = true; } }, 'Cancel'));
    });
    const newBtn = el('button', { class: 'btn sm', onclick: () => { const b = A.addBot({ name: 'Bot ' + (S.bots.length + 1), lang: langSel.value, source: B.templates[langSel.value] }); useBot(b); } }, 'New bot');
    const dupBtn = el('button', { class: 'btn quiet sm', onclick: () => { const b = A.addBot({ name: T.cleanText(bot.name + ' copy', 40), lang: bot.lang, source: bot.source }); useBot(b); } }, 'Copy');
    const delBtn = el('button', { class: 'btn quiet sm', onclick: () => armConfirm(delBtn, 'Delete this bot?', () => {
      S.bots.splice(S.bots.indexOf(bot), 1);
      if (!S.bots.length) A.addBot({ name: 'My first bot', lang: 'python', source: B.templates.python });
      A.save(); useBot(S.bots[0]);
    }) }, 'Delete');
    const starterBtn = el('button', { class: 'btn quiet sm', onclick: () => {
      const go = () => { editor.value = B.templates[bot.lang]; bot.source = B.templates[bot.lang]; A.save(); note('The starter bot is loaded.'); };
      if (pristine(bot.source)) go(); else armConfirm(starterBtn, 'Replace your code?', go);
    } }, 'Load the starter');
    const solBtn = el('button', { class: 'btn quiet sm', onclick: () => armConfirm(solBtn, 'Show the solution?', () => { editor.value = B.solutions[bot.lang]; bot.source = B.solutions[bot.lang]; A.save(); note('The Flood Fill solution is loaded: read it, then try to beat it.'); }) }, 'Reveal the Flood Fill solution');
    const exportBtn = el('button', { class: 'btn quiet sm', onclick: () => A.download(T.fileSafe(bot.name) + '.tronbot.json', JSON.stringify(T.botFile(bot), null, 1) + '\n') }, 'Export bot');
    const linkBtn = el('button', { class: 'btn quiet sm', onclick: async () => { const l = await A.linkFor('bot', T.botFile(bot)); linkSlot.textContent = ''; linkSlot.append(A.linkBox(l.url, l.long, () => { linkSlot.textContent = ''; })); } }, 'Copy link');
    const importBtn = el('button', { class: 'btn quiet sm', onclick: () => fileIn.click() }, 'Import file');
    async function openShared(text) {
      try {
        const r = await A.readShared(text);
        if (r.bot) { useBot(A.addBot(r.bot)); note('Opened “' + r.bot.name + '” (' + LABEL[r.bot.lang] + ') as a new bot of yours. Read it before you run it.'); }
        else { showReplay(r.replay, 'file'); note('Opened a replay: ' + r.replay.players.map((p) => p.name).join(' vs ') + '.'); }
      } catch (e) { note(e.message || String(e), true); }
    }
    fileIn.addEventListener('change', async () => {
      const f = fileIn.files && fileIn.files[0]; fileIn.value = '';
      if (!f) return;
      if (f.size > MAX_FILE) { note('That file is too big to be a bot or a replay.', true); return; }
      openShared(await f.text());
    });
    const pasteDetails = el('details', { class: 'arena-pastebox' }, el('summary', {}, 'Paste a link or file'), pasteBox,
      el('div', { class: 'toolbar' }, el('button', { class: 'btn sm', onclick: () => { const t = pasteBox.value; pasteBox.value = ''; pasteDetails.open = false; openShared(t); } }, 'Open')));
    const solutionNote = el('details', { class: 'arena-teacher' }, el('summary', {}, 'For teachers: the finished Flood Fill bot'),
      el('p', { class: 'small' }, 'A complete Flood Fill bot in each language, with the same structure as the starter. It counts the cells it could still reach after each move and takes the move with the most room. Revealing it replaces the code in the editor.'), solBtn);

    // ---- the match setup bar
    const players = el('select', { 'aria-label': 'Number of players' }, [2, 3, 4].map((n) => el('option', { value: n }, n + ' players')));
    const slotsBox = el('div', { class: 'arena-slots' });
    const widthIn = el('input', { type: 'number', min: 10, max: 40, value: S.setup.width, 'aria-label': 'Board width' });
    const heightIn = el('input', { type: 'number', min: 10, max: 40, value: S.setup.height, 'aria-label': 'Board height' });
    const timeSel = el('select', { 'aria-label': 'Time per move' }, [[0, 'By language (500 ms, C++ 2 s)'], [100, '100 ms'], [250, '250 ms'], [500, '500 ms'], [1000, '1 second'], [2000, '2 seconds'], [5000, '5 seconds']].map(([v, t]) => el('option', { value: v }, t)));
    const seedIn = el('input', { type: 'text', inputmode: 'numeric', placeholder: 'random', value: S.setup.seed, 'aria-label': 'Seed', class: 'arena-seed' });
    const invalidSel = el('select', { 'aria-label': 'An invalid move' }, [['up', 'is moved UP'], ['forfeit', 'forfeits the match']].map(([v, t]) => el('option', { value: v }, t)));
    const canPersist = A.persistentAvailable();
    const modeSel = el('select', { 'aria-label': 'How bots are run' }, [el('option', { value: 'restart' }, 'Restart: afresh every turn'), el('option', Object.assign({ value: 'persistent' }, canPersist ? {} : { disabled: '' }), 'Persistent: keeps running' + (canPersist ? '' : ' (not available here)'))]);
    modeSel.title = canPersist ? '' : 'Persistent mode needs the site to be opened from its web address, outside another page\u2019s frame.';
    modeSel.value = canPersist && S.setup.mode === 'persistent' ? 'persistent' : 'restart';
    players.value = String(S.setup.players); timeSel.value = String([0, 100, 250, 500, 1000, 2000, 5000].includes(S.setup.timeMs) ? S.setup.timeMs : 0); invalidSel.value = S.setup.invalid;
    const slotValues = () => { const d = ['me', BUILTIN_VALUE('random'), BUILTIN_VALUE('hugger'), BUILTIN_VALUE('flood')]; return d.map((v, i) => S.setup.slots[i] || v); };
    function slotOptions(i) {
      const opts = [];
      if (i === 0) opts.push(el('option', { value: 'me' }, 'My bot (the one in the editor)'));
      else opts.push(el('option', { value: 'me' }, 'My bot again'));
      for (const d of T.BUILTINS) opts.push(el('option', { value: BUILTIN_VALUE(d.id) }, d.name + ' (built in)'));
      for (const b of S.bots) opts.push(el('option', { value: 'bot:' + b.id }, b.name + ' (' + LABEL[b.lang] + ')'));
      return opts;
    }
    function fillSlots() {
      const n = +players.value, vals = slotValues();
      slotsBox.textContent = '';
      for (let i = 0; i < n; i++) {
        const sel = el('select', { 'aria-label': 'Player ' + (i + 1) }, slotOptions(i));
        sel.value = [...sel.options].some((o) => o.value === vals[i]) ? vals[i] : (i === 0 ? 'me' : BUILTIN_VALUE('random'));
        S.setup.slots[i] = sel.value;
        sel.addEventListener('change', () => { S.setup.slots[i] = sel.value; saveSoon(); });
        slotsBox.append(el('label', { class: 'arena-slot' }, el('i', { class: 'arena-dot', style: 'background:' + A.PLAYER_COLORS[i] }), 'Player ' + (i + 1) + ' ', sel));
      }
    }
    players.addEventListener('change', () => { fillSlots(); saveSoon(); });
    for (const x of [widthIn, heightIn, timeSel, seedIn, invalidSel, modeSel]) x.addEventListener('change', () => { remember(); });
    function remember() { Object.assign(S.setup, { width: intIn(widthIn, 10, 40, 20), height: intIn(heightIn, 10, 40, 20), players: +players.value, timeMs: +timeSel.value, seed: seedIn.value.replace(/[^0-9]/g, '').slice(0, 10), invalid: invalidSel.value, mode: modeSel.value }); saveSoon(); }
    const settingsNow = () => { remember(); return T.settingsOf({ width: S.setup.width, height: S.setup.height, players: +players.value, timeMs: +timeSel.value, invalid: invalidSel.value, mode: modeSel.value }); };
    const seedNow = () => { const t = seedIn.value.replace(/[^0-9]/g, ''); return t ? T.seedOf(Number(t)) : (Math.floor(Math.random() * 4294967296) >>> 0) || 1; };
    function entryOf(value) {
      if (value === 'me') return { name: bot.name, lang: bot.lang, source: bot.source };
      if (value.startsWith('bot:')) { const b = A.byId(value.slice(4)); if (b) return { name: b.name, lang: b.lang, source: b.source }; }
      const d = T.builtinById(value.startsWith('b:') ? value.slice(2) : '') || T.builtinById('random');
      return { name: d.name, lang: 'js', builtin: d.id };
    }
    const playBtn = el('button', { class: 'btn primary', onclick: () => playOne() }, 'Play');
    const seriesBtn = el('button', { class: 'btn', onclick: () => playSeries(10) }, 'Play 10');
    const stopBtn = el('button', { class: 'btn quiet', hidden: '', onclick: () => { stopFlag = true; A.stopAll(); } }, 'Stop');
    const testBtn = el('button', { class: 'btn quiet', onclick: () => testRun() }, 'Test my bot once');
    const status = el('div', { class: 'arena-status', role: 'status' });
    function setRunning(on) { running = on; playBtn.disabled = seriesBtn.disabled = testBtn.disabled = on; stopBtn.hidden = !on; }

    // ---- the viewer, the logs
    const viewerHost = el('div', { class: 'arena-viewer-host' });
    const tabs = el('div', { class: 'arena-tabs', role: 'tablist' });
    const logOut = el('pre', { class: 'arena-log', tabindex: '0', 'aria-label': 'Log' });
    const inputOut = el('pre', { class: 'arena-log arena-input', tabindex: '0', 'aria-label': 'The input the bot was sent', hidden: '' });
    const inputHead = el('div', { class: 'small arena-inputhead', hidden: '' });
    const showInput = el('input', { type: 'checkbox', id: 'arena-showinput' });
    const matchTools = el('div', { class: 'toolbar arena-matchtools', hidden: '' });
    const matchLink = el('div');
    const v = A.viewer(viewerHost, { maxWidth: 640, onTurn: () => refreshInput() });   // after the boxes refreshInput reads: the viewer calls it as it is built
    function newResult(entries, settings, seed) {
      return { entries, settings, seed, players: entries.map((e) => ({ name: e.name, lang: e.lang })), logs: { ref: [], p: entries.map(() => []) }, replay: null, frames: null, dropped: 0 };
    }
    function addLog(res, p, kind, text, turn) {
      if (stopFlag) return;
      const list = kind === 'referee' ? res.logs.ref : res.logs.p[p];
      if (list.length >= 400) { res.dropped++; return; }
      list.push({ turn: turn || 0, p, text: String(text).slice(0, 4000) });
      if (current === res) renderLog();
    }
    function renderTabs() {
      tabs.textContent = '';
      const mk = (key, label, color) => tabs.append(el('button', { role: 'tab', class: 'arena-tab', 'aria-selected': String(logTab === key), onclick: () => { logTab = key; renderTabs(); renderLog(); refreshInput(); } }, color ? el('i', { class: 'arena-dot', style: 'background:' + color }) : null, label));
      mk('ref', 'Referee');
      if (current) current.players.forEach((p, i) => mk(i, (i + 1) + ' · ' + p.name, A.PLAYER_COLORS[i]));
    }
    function renderLog() {
      const res = current;
      if (!res) { logOut.textContent = 'Nothing has been played yet. Press Play, or "Test my bot once".'; return; }
      const list = logTab === 'ref' ? res.logs.ref : (res.logs.p[logTab] || []);
      const txt = list.map((l) => (l.turn ? 'turn ' + l.turn + '  ' : 'start   ') + l.text.replace(/\n/g, '\n          ')).join('\n');
      logOut.textContent = (txt || (logTab === 'ref' ? 'No problems so far: every move was valid and on time.' : 'This bot printed nothing to its log. (A line that starts with LOG goes here.)')) + (res.dropped ? '\n… and ' + res.dropped + ' more lines that are not shown.' : '');
    }
    function refreshInput() {
      const on = showInput.checked && current && typeof logTab === 'number';
      inputOut.hidden = inputHead.hidden = !on;
      if (!on) return;
      const f = v.frames[v.index];
      if (!f) { inputOut.textContent = ''; return; }
      const st = T.fromFrame(current.settings, f);
      inputHead.textContent = f.over ? 'The match was over at this turn, so nothing was sent.' : f.heads[logTab] && f.heads[logTab].alive ? 'What ' + current.players[logTab].name + ' was sent to choose the move for turn ' + (f.turn + 1) + ' (the board you are looking at):' : current.players[logTab].name + ' had crashed by this turn, so nothing was sent.';
      inputOut.textContent = f.over || !(f.heads[logTab] && f.heads[logTab].alive) ? '' : T.serialize(st, logTab);
    }
    showInput.addEventListener('change', refreshInput);
    function showMatchTools(res) {
      matchTools.hidden = !res.replay; matchTools.textContent = ''; matchLink.textContent = '';
      if (!res.replay) return;
      matchTools.append(el('span', { class: 'small' }, 'Seed ' + res.replay.seed + ' · ' + res.replay.result.turns + ' turns'),
        el('button', { class: 'btn quiet sm', onclick: () => A.download(T.fileSafe(res.players.map((p) => p.name).join('-vs-')) + '-' + res.replay.seed + '.tronreplay.json', JSON.stringify(res.replay) + '\n') }, 'Download replay'),
        el('button', { class: 'btn quiet sm', onclick: async () => { const l = await A.linkFor('replay', res.replay); matchLink.textContent = ''; matchLink.append(A.linkBox(l.url, l.long, () => { matchLink.textContent = ''; })); } }, 'Copy replay link'));
    }
    function showReplay(replay, from) {
      const clean = v.show(replay);
      current = { entries: clean.players, settings: clean.settings, seed: clean.seed, players: clean.players, logs: { ref: [], p: clean.players.map(() => []) }, replay: clean, frames: v.frames, dropped: 0, from };
      current.logs.ref.push({ turn: 0, p: 0, text: 'This replay was opened from ' + (from === 'link' ? 'a link' : 'a file') + '. The bots’ own logs are not part of a replay file.' });
      logTab = 'ref'; renderTabs(); renderLog(); showMatchTools(current); series = null; seriesBox.hidden = true;
      status.textContent = ''; refreshInput();
    }

    // ---- playing
    async function playOne() {
      if (running) return;
      stopFlag = false; seriesBox.hidden = true; series = null; setRunning(true);
      const s = settingsNow(), seed = seedNow(), entries = [...slotsBox.querySelectorAll('select')].map((sel) => entryOf(sel.value));
      const res = newResult(entries, s, seed); current = res; logTab = 'ref'; renderTabs(); renderLog(); showMatchTools(res);
      status.textContent = 'Starting' + (entries.some((e) => !e.builtin && e.lang !== 'scheme') ? ' (the first move of a language can be slow: its engine is starting)' : '') + '…';
      try {
        const drivers = entries.map((e, p) => A.driverFor(e, s, seed, p));
        v.live(s, res.players);
        const m = await T.playMatch({ settings: s, seed, drivers, shouldStop: () => stopFlag || !alive(), onLog: (p, k, t, turn) => addLog(res, p, k, t, turn), onTurn: ({ frame, turn }) => { if (alive()) { v.push(frame); status.textContent = 'Turn ' + turn + '…'; } } });
        if (!alive()) return;
        res.replay = m.replay; res.frames = m.frames;
        v.finish(m.aborted ? ['Stopped.'] : T.describeResult(m.replay, m.replay.result));
        status.textContent = m.aborted ? 'Stopped after ' + m.replay.moves.length + ' turns.' : 'Done.';
        showMatchTools(res); renderLog(); refreshInput();
      } catch (e) { status.textContent = 'The match could not be played: ' + (e && e.message || e); }
      finally { setRunning(false); }
    }
    async function playSeries(n) {
      if (running) return;
      stopFlag = false; setRunning(true);
      const s = settingsNow(), base = seedNow(), entries = [...slotsBox.querySelectorAll('select')].map((sel) => entryOf(sel.value));
      series = { entries, rows: [], wins: entries.map(() => 0), draws: 0, base };
      seriesBox.hidden = false; matchTools.hidden = true; renderSeries();
      try {
        for (let i = 0; i < n && !stopFlag && alive(); i++) {
          const swap = entries.length === 2 && i % 2 === 1, order = entries.map((_, k) => k); if (swap) order.reverse();   // two players take turns at the first start
          const seed = T.seedOf(base + i), res = newResult(order.map((k) => entries[k]), s, seed);
          status.textContent = 'Match ' + (i + 1) + ' of ' + n + '…';
          const m = await T.playMatch({ settings: s, seed, drivers: order.map((k, slot) => A.driverFor(entries[k], s, seed, slot)), shouldStop: () => stopFlag || !alive(), onLog: (p, k, t, turn) => addLog(res, p, k, t, turn) });
          if (m.aborted) break;
          res.replay = m.replay; res.frames = m.frames;
          const w = m.replay.result.winner;
          if (w) series.wins[order[w - 1]]++; else series.draws++;
          series.rows.push({ res, winner: w ? order[w - 1] : -1 });
          renderSeries(); await tick();
        }
        status.textContent = stopFlag ? 'Stopped.' : 'Done: ' + series.rows.length + ' matches.';
      } catch (e) { status.textContent = 'The series could not be played: ' + (e && e.message || e); }
      finally { setRunning(false); }
    }
    const seriesBox = el('div', { class: 'arena-series', hidden: '' });
    function renderSeries() {
      if (!series) return;
      seriesBox.textContent = '';
      const total = series.rows.length;
      seriesBox.append(el('h3', {}, 'Series: ' + total + ' match' + (total === 1 ? '' : 'es')),
        el('p', { class: 'arena-wins' }, series.entries.map((e, k) => el('span', {}, el('b', {}, e.name), ' ' + series.wins[k] + (series.wins[k] === 1 ? ' win' : ' wins') + (k < series.entries.length - 1 ? ' · ' : ''))), ' · ' + series.draws + (series.draws === 1 ? ' draw' : ' draws')),
        el('table', { class: 'arena-table small' }, el('thead', {}, el('tr', {}, ['Match', 'Seed', 'Result', 'Turns', ''].map((h) => el('th', {}, h)))),
          el('tbody', {}, series.rows.map((r, i) => el('tr', {}, el('td', {}, i + 1), el('td', {}, r.res.seed), el('td', {}, r.winner < 0 ? 'Draw' : series.entries[r.winner].name + ' won'), el('td', {}, r.res.replay.result.turns),
            el('td', {}, el('button', { class: 'btn quiet sm', onclick: () => { current = r.res; logTab = 'ref'; v.show(r.res.replay); renderTabs(); renderLog(); showMatchTools(r.res); window.scrollTo({ top: viewerHost.getBoundingClientRect().top + window.scrollY - 80 }); } }, 'Watch')))))));
    }
    async function testRun() {
      if (running) return;
      stopFlag = false; setRunning(true);
      const s = settingsNow(), st = T.create(s, 1), input = T.serialize(st, 0), res = newResult([entryOf('me')], s, 1);
      current = res; logTab = 0; renderTabs(); renderLog();
      status.textContent = 'Running your bot on the empty board…';
      try {
        const t0 = performance.now(), d = A.driverFor(entryOf('me'), s, 1, 0), start = await d.start({ settings: s, player: 0, input }), r = start.ok ? await d.move(input) : { text: '', err: start.error, status: 'error' };
        if (d.stop) d.stop();
        const sp = T.splitOutput(r.text), pm = T.parseMove(sp.text), ms = Math.round(performance.now() - t0);
        const out = [];
        if (!start.ok) out.push('The program did not start:\n' + String(start.error).slice(0, 3000));
        else {
          if (sp.log) out.push('LOG lines:\n' + sp.log);
          if (r.status === 'timeout') out.push('It took longer than its ' + d.limitMs + ' ms.');
          else if (r.status !== 'ok') out.push('It failed:\n' + String(r.err).slice(0, 3000));
          else out.push(pm.move ? 'It chose ' + pm.move + '.' : 'That is not a move: it ' + pm.error + '.');
          out.push('(The whole test took ' + ms + ' ms, which includes starting the engine the first time.)');
        }
        res.logs.p[0].push({ turn: 0, p: 0, text: out.join('\n\n') }); renderLog();
        status.textContent = start.ok && pm.move ? 'Your bot printed a valid move.' : 'Your bot has a problem: see its tab in the log.';
      } catch (e) { status.textContent = 'The test could not be run: ' + (e && e.message || e); }
      finally { setRunning(false); }
    }

    // ---- assemble
    mountEditor(); fillBotSel(); fillSlots(); renderTabs(); renderLog();
    const editorPane = el('section', { class: 'arena-pane', 'aria-label': 'Your bot' },
      el('div', { class: 'toolbar' }, botSel, newBtn, dupBtn, delBtn),
      el('div', { class: 'toolbar' }, el('label', { class: 'arena-field' }, 'Name ', nameInput), el('label', { class: 'arena-field' }, 'Language ', langSel)),
      swapBox, editorHost,
      el('div', { class: 'toolbar' }, starterBtn, exportBtn, linkBtn, importBtn, fileIn),
      linkSlot, pasteDetails, paneNote, solutionNote);
    const setup = el('section', { class: 'arena-setup', 'aria-label': 'The match' },
      el('div', { class: 'toolbar' }, el('label', { class: 'arena-field' }, 'Players ', players), slotsBox),
      el('div', { class: 'toolbar arena-opts' }, el('label', { class: 'arena-field' }, 'Board ', widthIn, ' × ', heightIn), el('label', { class: 'arena-field' }, 'Time per move ', timeSel), el('label', { class: 'arena-field' }, 'Seed ', seedIn), el('label', { class: 'arena-field' }, 'An invalid move ', invalidSel), el('label', { class: 'arena-field' }, 'Run bots ', modeSel)),
      el('div', { class: 'toolbar' }, playBtn, seriesBtn, stopBtn, testBtn, status));
    const watchPane = el('section', { class: 'arena-pane', 'aria-label': 'The match' }, viewerHost, matchTools, matchLink, seriesBox,
      el('div', { class: 'arena-logs' }, el('div', { class: 'toolbar' }, tabs, el('label', { class: 'arena-showinput small' }, showInput, ' Show input')), inputHead, inputOut, logOut));
    main.append(el('header', { class: 'algos-head' }, el('h1', {}, 'Bot Arena'),
        el('p', { class: 'lede' }, 'Write a program that plays Tron: it moves its head one cell a turn, leaves a wall behind, and the last bot still moving wins. Your bot can be in Python, Java, C++ or Scheme, and it can play bots written in any of the others.'), subnav('play')),
      howItWorks(), setup, el('div', { class: 'arena-cols' }, editorPane, watchPane));

    // ---- a bot or replay in the link
    const q = new URLSearchParams(query || '');
    const shared = q.get('bot') ? 'bot=' + q.get('bot') : q.get('replay') ? 'replay=' + q.get('replay') : '';
    if (shared) (async () => {
      try {
        const r = await A.readShared('?' + shared);
        if (r.replay) { showReplay(r.replay, 'link'); note('This replay came in a link.'); return; }
        const box = el('div', { class: 'arena-incoming' }, el('p', {}, el('b', {}, 'Someone sent you a bot: “' + r.bot.name + '”'), ' (' + LABEL[r.bot.lang] + ', ' + r.bot.source.split('\n').length + ' lines). It has not been run. Read it first: it will run in a sandbox in this browser, with no way to reach anything of yours.'),
          el('pre', { class: 'arena-peek' }, r.bot.source.slice(0, 1500) + (r.bot.source.length > 1500 ? '\n…' : '')),
          el('div', { class: 'toolbar' }, el('button', { class: 'btn primary', onclick: () => { box.remove(); useBot(A.addBot(r.bot)); note('Opened as a new bot of yours.'); } }, 'Open it as a new bot'), el('button', { class: 'btn quiet', onclick: () => box.remove() }, 'No thanks')));
        main.querySelector('.algos-head').after(box);
      } catch (e) { main.querySelector('.algos-head').after(el('p', { class: 'arena-incoming err' }, 'The link could not be opened: ' + (e.message || e))); }
    })();
    return main;
  }

  // =================================================================== the tournament page
  function tournamentPage() {
    const S = A.store(), main = el('main', { class: 'arena' });
    const alive = () => main.isConnected;
    let entries = [], out = null, running = false, stopFlag = false, sort = { key: 'points', dir: -1 }, projector = null;
    const MAX_BOTS = 40;
    const list = el('ul', { class: 'arena-entries' }), msg = el('div', { class: 'arena-panenote', role: 'status' });
    const say = (t, bad) => { msg.textContent = t || ''; msg.className = 'arena-panenote' + (bad ? ' err' : ''); };
    const uniqueName = (name) => { let n = name, k = 2; while (entries.some((e) => e.name === n)) n = name + ' (' + k++ + ')'; return n; };
    function add(e) {
      if (entries.length >= MAX_BOTS) { say('A tournament holds at most ' + MAX_BOTS + ' bots.', true); return false; }
      entries.push(Object.assign({ id: A.newId() }, e, { name: uniqueName(T.cleanText(e.name, 40) || 'Unnamed bot') })); return true;
    }
    function renderEntries() {
      list.textContent = '';
      if (!entries.length) list.append(el('li', { class: 'small' }, 'No bots yet. Add some below.'));
      entries.forEach((e, i) => list.append(el('li', {}, el('b', {}, e.name), ' ', el('span', { class: 'small' }, langName(e.lang)), ' ',
        el('button', { class: 'btn quiet sm', 'aria-label': 'Remove ' + e.name, onclick: () => { entries.splice(i, 1); renderEntries(); } }, 'Remove'))));
      runBtn.disabled = running || entries.length < 2;
      count.textContent = entries.length + (entries.length === 1 ? ' bot' : ' bots') + (entries.length >= 2 ? ' · ' + (entries.length * (entries.length - 1) / 2 * intIn(roundsIn, 1, 10, 2)) + ' matches' : '');
    }
    const count = el('span', { class: 'small' });
    // ---- adding bots: built in, saved here, files (also by dropping them), pasted links
    const builtinBtns = T.BUILTINS.map((d) => el('button', { class: 'btn quiet sm', title: d.blurb, onclick: () => { add({ name: d.name, lang: 'js', builtin: d.id }); renderEntries(); } }, '+ ' + d.name));
    const saved = el('div', { class: 'arena-saved' });
    function renderSaved() {
      saved.textContent = '';
      if (!S.bots.length) { saved.append(el('span', { class: 'small' }, 'You have no saved bots on this device yet.')); return; }
      const boxes = S.bots.map((b) => ({ b, box: el('input', { type: 'checkbox' }) }));
      saved.append(...boxes.map(({ b, box }) => el('label', { class: 'arena-check' }, box, ' ' + b.name + ' (' + LABEL[b.lang] + ')')),
        el('button', { class: 'btn sm', onclick: () => { for (const { b, box } of boxes) if (box.checked) { add({ name: b.name, lang: b.lang, source: b.source }); box.checked = false; } renderEntries(); } }, 'Add the ticked bots'));
    }
    async function addTexts(texts) {
      const problems = []; let added = 0;
      for (const [label, text] of texts) {
        try { const r = await A.readShared(text); if (!r.bot) throw new Error('that is a replay, not a bot'); if (add({ name: r.bot.name, lang: r.bot.lang, source: r.bot.source })) added++; }
        catch (e) { problems.push(label + ': ' + (e.message || e)); }
      }
      renderEntries();
      say((added ? 'Added ' + added + (added === 1 ? ' bot. ' : ' bots. ') : '') + problems.join(' '), problems.length > 0 && !added);
    }
    async function addFiles(files) {
      const texts = [];
      for (const f of [...files].slice(0, 100)) { if (f.size > MAX_FILE) { texts.push([f.name, '']); continue; } texts.push([f.name, await f.text()]); }
      await addTexts(texts);
    }
    const fileIn = el('input', { type: 'file', multiple: '', accept: '.json,application/json', 'aria-label': 'Choose bot files' });
    fileIn.addEventListener('change', () => { addFiles(fileIn.files); fileIn.value = ''; });
    const drop = el('div', { class: 'arena-drop', tabindex: '0' }, 'Drop .tronbot.json files here, or ', fileIn);
    drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('over'));
    drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); if (e.dataTransfer && e.dataTransfer.files.length) addFiles(e.dataTransfer.files); });
    const paste = el('textarea', { rows: 3, class: 'arena-paste', placeholder: 'Or paste bot links, one to a line', 'aria-label': 'Paste bot links' });
    const pasteBtn = el('button', { class: 'btn sm', onclick: () => { const lines = paste.value.split('\n').map((l) => l.trim()).filter(Boolean); paste.value = ''; addTexts(lines.map((l, i) => ['line ' + (i + 1), l])); } }, 'Add the pasted links');

    // ---- settings and running
    const widthIn = el('input', { type: 'number', min: 10, max: 40, value: 20, 'aria-label': 'Board width' }), heightIn = el('input', { type: 'number', min: 10, max: 40, value: 20, 'aria-label': 'Board height' });
    const roundsIn = el('input', { type: 'number', min: 1, max: 10, value: 2, 'aria-label': 'Matches per pairing' });
    const seedIn = el('input', { type: 'text', inputmode: 'numeric', placeholder: 'random', 'aria-label': 'Seed', class: 'arena-seed' });
    const timeSel = el('select', { 'aria-label': 'Time per move' }, [[0, 'By language'], [250, '250 ms'], [500, '500 ms'], [1000, '1 second'], [2000, '2 seconds']].map(([v, t]) => el('option', { value: v }, t)));
    const invalidSel = el('select', { 'aria-label': 'An invalid move' }, [['up', 'is moved UP'], ['forfeit', 'forfeits the match']].map(([v, t]) => el('option', { value: v }, t)));
    const canPersist = A.persistentAvailable();
    const modeSel = el('select', { 'aria-label': 'How bots are run' }, [el('option', { value: 'restart' }, 'Restart: afresh every turn'), el('option', Object.assign({ value: 'persistent' }, canPersist ? {} : { disabled: '' }), 'Persistent: keeps running' + (canPersist ? '' : ' (not available here)'))]);
    roundsIn.addEventListener('input', renderEntries);
    const bar = el('progress', { max: 1, value: 0, 'aria-label': 'Progress', hidden: '' }), barText = el('span', { class: 'small', role: 'status' });
    const runBtn = el('button', { class: 'btn primary', onclick: () => run() }, 'Run the tournament');
    const stopBtn = el('button', { class: 'btn quiet', hidden: '', onclick: () => { stopFlag = true; A.stopAll(); } }, 'Stop');
    const resultsBox = el('div', { class: 'arena-results', hidden: '' }), viewerHost = el('div', { class: 'arena-viewer-host' });
    viewerHost.hidden = true;   // until a match is chosen
    const v = A.viewer(viewerHost, { maxWidth: 560 });
    const watching = el('p', { class: 'small', role: 'status' });

    async function run() {
      if (running || entries.length < 2) return;
      stopFlag = false; running = true; runBtn.disabled = true; stopBtn.hidden = false; bar.hidden = false; say(''); resultsBox.hidden = true;
      const s = T.settingsOf({ width: intIn(widthIn, 10, 40, 20), height: intIn(heightIn, 10, 40, 20), players: 2, timeMs: +timeSel.value, invalid: invalidSel.value, mode: canPersist ? modeSel.value : 'restart' });
      const seedText = seedIn.value.replace(/[^0-9]/g, ''), seed = seedText ? T.seedOf(Number(seedText)) : (Math.floor(Math.random() * 4294967296) >>> 0) || 1;
      const snapshot = entries.slice(), bots = snapshot.map((e) => ({ name: e.name, lang: e.lang, driver: (sd) => A.driverFor(e, s, sd, 0) }));
      const rounds = intIn(roundsIn, 1, 10, 2);
      try {
        const r = await T.runTournament({ bots, rounds, settings: s, seed, shouldStop: () => stopFlag || !alive(),
          onProgress: async (done, total) => { bar.max = total; bar.value = done; barText.textContent = 'Match ' + done + ' of ' + total; if (done % 4 === 0) await tick(); } });
        if (!alive()) return;
        out = { entries: snapshot, results: r.results, settings: s, seed, rounds, aborted: r.aborted };
        barText.textContent = (r.aborted ? 'Stopped after ' : 'Done: ') + r.results.length + ' matches (seed ' + seed + ').';
        renderResults();
      } catch (e) { barText.textContent = 'The tournament could not be run: ' + (e && e.message || e); }
      finally { running = false; stopBtn.hidden = true; runBtn.disabled = entries.length < 2; }
    }

    // ---- the results: a sortable table, a head-to-head grid, the exports
    const COLS = [['rank', 'Rank'], ['name', 'Bot'], ['played', 'Played'], ['wins', 'Wins'], ['draws', 'Draws'], ['losses', 'Losses'], ['points', 'Points'], ['turns', 'Turns survived']];
    function renderResults() {
      resultsBox.textContent = ''; resultsBox.hidden = false;
      const names = out.entries.map((e) => e.name), rows = T.standings(out.entries.length, out.results), ranked = T.rank(rows), place = new Map(ranked.map((r, i) => [r.bot, i + 1]));
      const key = sort.key, val = (r) => (key === 'name' ? names[r.bot].toLowerCase() : key === 'rank' ? place.get(r.bot) : r[key]);
      const shown = rows.slice().sort((a, b) => { const x = val(a), y = val(b); return (x < y ? -1 : x > y ? 1 : 0) * sort.dir || place.get(a.bot) - place.get(b.bot); });
      const head = el('tr', {}, COLS.map(([k, label]) => el('th', { 'aria-sort': sort.key === k ? (sort.dir > 0 ? 'ascending' : 'descending') : 'none' },
        el('button', { class: 'arena-sortbtn', onclick: () => { sort = { key: k, dir: sort.key === k ? -sort.dir : (k === 'name' || k === 'rank' || k === 'losses' ? 1 : -1) }; renderResults(); } }, label + (sort.key === k ? (sort.dir > 0 ? ' ▲' : ' ▼') : '')))));
      const table = el('table', { class: 'arena-table' }, el('thead', {}, head), el('tbody', {}, shown.map((r) => el('tr', {},
        el('td', {}, place.get(r.bot)), el('td', {}, el('b', {}, names[r.bot]), ' ', el('span', { class: 'small' }, langName(out.entries[r.bot].lang))), el('td', {}, r.played), el('td', {}, r.wins), el('td', {}, r.draws), el('td', {}, r.losses), el('td', {}, el('b', {}, r.points)), el('td', {}, r.turns)))));
      // head to head: each small button is one match, from the row bot's side; press it to watch
      const order = ranked.map((r) => r.bot);
      const grid = el('table', { class: 'arena-grid small' }, el('thead', {}, el('tr', {}, el('th', {}, ''), order.map((b) => el('th', { title: names[b] }, place.get(b))))),
        el('tbody', {}, order.map((a) => el('tr', {}, el('th', { class: 'arena-rowhead' }, place.get(a) + ' ' + names[a]), order.map((b) => {
          if (a === b) return el('td', { class: 'arena-self' }, '–');
          const ms = out.results.filter((m) => (m.a === a && m.b === b) || (m.a === b && m.b === a));
          return el('td', {}, ms.map((m) => { const mine = m.winner === null ? 'D' : ((m.a === a) === (m.winner === 'a') ? 'W' : 'L');
            return el('button', { class: 'arena-cell ' + mine, 'aria-label': names[a] + ' against ' + names[b] + ', seed ' + m.seed + ': ' + (mine === 'W' ? 'won' : mine === 'L' ? 'lost' : 'draw') + '. Watch.', title: 'Seed ' + m.seed + ' · ' + m.replay.result.turns + ' turns', onclick: () => watch(m) }, mine); }));
        })))));
      resultsBox.append(el('h2', {}, 'Standings'), el('div', { class: 'arena-scroll' }, table),
        el('div', { class: 'toolbar' },
          el('button', { class: 'btn', onclick: () => projectorMode() }, 'Projector mode'),
          el('button', { class: 'btn quiet', onclick: () => A.download('standings.csv', T.standingsCsv(names, rows), 'text/csv') }, 'Download standings (CSV)'),
          el('button', { class: 'btn quiet', onclick: () => A.download('replays.zip', new Blob([T.zip(zipFiles(names, rows))], { type: 'application/zip' })) }, 'Download all replays (zip)')),
        el('h2', {}, 'Head to head'), el('p', { class: 'small' }, 'Read across: each box is one match for the bot in that row against the bot in that column (W won, L lost, D drew). Press a box to watch it.'), el('div', { class: 'arena-scroll' }, grid),
        watching, viewerHost);
    }
    function zipFiles(names, rows) {
      const files = [{ name: 'standings.csv', text: T.standingsCsv(names, rows) }];
      out.results.forEach((m, i) => files.push({ name: 'replays/' + String(i + 1).padStart(3, '0') + '-' + T.fileSafe(names[m.a]) + '-vs-' + T.fileSafe(names[m.b]) + '-' + (m.k + 1) + '.tronreplay.json', text: JSON.stringify(m.replay) + '\n' }));
      return files;
    }
    function watch(m) {
      viewerHost.hidden = false; v.show(m.replay);
      watching.textContent = 'Watching: ' + m.replay.players.map((p, i) => (i + 1) + ' ' + p.name).join(' vs ') + ' · seed ' + m.seed;
      viewerHost.scrollIntoView({ block: 'center' });
    }

    // ---- projector mode: matches one after another, big names, standings that grow as matches finish
    function projectorMode() {
      if (projector || !out || !out.results.length) return;
      const names = out.entries.map((e) => e.name), n = out.entries.length;
      const title = el('div', { class: 'proj-title' }), stand = el('div', { class: 'proj-stand' }), host = el('div', { class: 'proj-board' });
      let pv = null, index = 0, paused = false, timer = 0, token = 0;
      const close = () => { token++; clearTimeout(timer); if (pv) pv.destroy(); overlay.remove(); projector = null; document.removeEventListener('keydown', onKey); if (document.fullscreenElement) document.exitFullscreen().catch(() => { }); };
      const pauseBtn = el('button', { class: 'btn sm', onclick: () => togglePause() }, 'Pause');
      const overlay = el('div', { class: 'arena-projector', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Tournament on the projector' },
        el('div', { class: 'proj-bar' }, el('span', { class: 'proj-count' }), el('span', { class: 'spacer' }), el('button', { class: 'btn sm', onclick: () => step(-1) }, 'Previous'), pauseBtn, el('button', { class: 'btn sm', onclick: () => step(1) }, 'Next'), el('button', { class: 'btn sm', onclick: close }, 'Close')),
        el('div', { class: 'proj-main' }, el('div', { class: 'proj-left' }, title, host), stand));
      const countEl = overlay.querySelector('.proj-count');
      function standings(upto) {
        const rows = T.rank(T.standings(n, out.results.slice(0, upto)));
        stand.textContent = '';
        stand.append(el('h2', {}, upto >= out.results.length ? 'Final standings' : 'Standings after ' + upto + ' of ' + out.results.length),
          el('ol', {}, rows.map((r) => el('li', {}, el('span', { class: 'proj-name' }, names[r.bot]), el('span', { class: 'proj-pts' }, r.points + ' pts')))));
      }
      function showMatch(i) {
        const m = out.results[i], my = ++token; clearTimeout(timer);
        countEl.textContent = 'Match ' + (i + 1) + ' of ' + out.results.length;
        title.textContent = '';
        title.append(...m.replay.players.flatMap((p, k) => [k ? el('span', { class: 'proj-vs' }, 'vs') : '', el('span', { class: 'proj-player' }, el('i', { class: 'arena-dot', style: 'background:' + A.PLAYER_COLORS[k] }), p.name)]).filter(Boolean));   // not null: the DOM's append prints it
        standings(i);
        if (!pv) pv = A.viewer(host, { maxWidth: 900, maxHeight: Math.max(300, window.innerHeight - 260), big: true });
        pv.show(m.replay);
        const wait = () => { if (my !== token) return; if (paused) { timer = setTimeout(wait, 300); return; } if (pv.playing) { timer = setTimeout(wait, 250); return; } timer = setTimeout(() => { if (my === token) { standings(i + 1); timer = setTimeout(() => { if (my === token) step(1); }, 1800); } }, 1500); };
        timer = setTimeout(wait, 400);
      }
      function step(d) { index += d; if (index < 0) index = 0; if (index >= out.results.length) { index = out.results.length - 1; standings(out.results.length); return; } showMatch(index); }
      function togglePause() { paused = !paused; pauseBtn.textContent = paused ? 'Resume' : 'Pause'; if (pv) { if (paused) pv.pause(); else if (!pv.playing && pv.index < pv.frames.length - 1) pv.play(); } }
      function onKey(e) { if (e.key === 'Escape') close(); else if (e.key === ' ') { e.preventDefault(); togglePause(); } else if (e.key === 'ArrowRight') step(1); else if (e.key === 'ArrowLeft') step(-1); }
      document.addEventListener('keydown', onKey);
      document.body.append(overlay); projector = overlay;
      if (overlay.requestFullscreen) overlay.requestFullscreen().catch(() => { });
      overlay.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && projector) close(); });
      showMatch(0);
    }

    // ---- assemble
    renderEntries(); renderSaved();
    main.append(el('header', { class: 'algos-head' }, el('h1', {}, 'Tournament'),
        el('p', { class: 'lede' }, 'Load a class’s bots, play every bot against every other, and show the matches on a projector. Nothing is sent anywhere: the bots you load stay in this browser, and every bot runs in a sandbox.'), subnav('tournament')),
      el('section', {}, el('h2', {}, '1. The bots'), list, count,
        el('div', { class: 'toolbar' }, el('span', { class: 'small' }, 'Built-in bots to compare against:'), builtinBtns),
        el('h3', {}, 'My saved bots'), saved, el('h3', {}, 'Bot files and links'), drop, paste, el('div', { class: 'toolbar' }, pasteBtn), msg),
      el('section', {}, el('h2', {}, '2. The tournament'),
        el('div', { class: 'toolbar arena-opts' }, el('label', { class: 'arena-field' }, 'Board ', widthIn, ' × ', heightIn), el('label', { class: 'arena-field' }, 'Matches per pairing ', roundsIn), el('label', { class: 'arena-field' }, 'Time per move ', timeSel), el('label', { class: 'arena-field' }, 'Seed ', seedIn), el('label', { class: 'arena-field' }, 'An invalid move ', invalidSel), el('label', { class: 'arena-field' }, 'Run bots ', modeSel)),
        el('p', { class: 'small' }, 'Every pair plays the number of matches you choose, and the two bots swap starting corners each time. A win is 3 points, a draw 1; ties are broken by the turns a bot survived in all its matches.'),
        el('div', { class: 'toolbar' }, runBtn, stopBtn, bar, barText)),
      resultsBox);
    return main;
  }

  A.page = function (sub, query) {
    document.title = (sub === 'tournament' ? 'Tournament — Bot Arena' : 'Bot Arena') + ' — ' + ((window.SITE && window.SITE.name) || 'Short Explorations in Computer Science');
    return sub === 'tournament' ? tournamentPage() : playPage(query);
  };
})();
