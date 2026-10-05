/* Terminals in front of the practice shell (src/shell.js), drawn like the output panel.
   Registered as window.TERMINAL:
     mount(ctx)                    the Code Lab's Terminal panel (src/lab.js mounts it with { el, armConfirm, isTouch, Runners, isFull, cppStd, cStd, stop,
                                   labFiles, addLabFile, labChanged, openInEditor, onClose }). Its file system is saved under shortcourses.shell.v1
                                   (only /home and /tmp; the system part is rebuilt), and ~/lab mirrors the Code Lab's files both ways.
     playBlock(b, course)          a lesson example in a shell course: the commands as a listing, Run types them into a live terminal below
     exerciseBlock(ex, course, i)  an exercise of kind 'shell': a terminal over the exercise's setup, graded by src/shellgrade.js
   Every terminal is a makePanel(): one <input> is the command line, and while a program asks for input the same line answers it.
   Programs run through the same sandboxes as the Run button (Runners / PYRUN / CLANGRUN); their text comes back here as text only. */
(function () {
  'use strict';
  const KEY = 'shortcourses.shell.v1';
  const LAB_DIR = '/home/student/lab';
  const EXT = { '.py': 'python', '.cpp': 'cpp', '.cc': 'cpp', '.cxx': 'cpp', '.h': 'cpp', '.c': 'c', '.java': 'java', '.scm': 'scheme', '.ss': 'scheme', '.rkt': 'scheme' };
  const langOf = (name) => { const m = name.match(/\.\w+$/); return m && Object.prototype.hasOwnProperty.call(EXT, m[0].toLowerCase()) ? EXT[m[0].toLowerCase()] : null; };
  const MAX_SCROLLBACK = 300000;   // characters kept on screen
  const A = () => window.__app.internal;

  /* ---------------- the panel ----------------
     o: { fs, title, hooks: {edit?, setup?}, armConfirm, isFull?, cppStd?, cStd?, stop?, before?(), after?(), onReset?() → fs, resetTitle, onClose?, persist?: key, history?: [] } */
  function makePanel(o) {
    const { el } = window.__h;
    const SHELL = window.SHELL;
    let fs = o.fs;
    const stopAll = () => { for (const k of ['PYRUN', 'JAVARUN', 'CPPRUN', 'CLANGRUN']) if (window[k]) window[k].cancel(); };   // a lesson's terminal has no Lab to ask
    const repl = (lang, io2, sh2) => (window.REPL && window.REPL[lang] ? window.REPL[lang]({ ask: io2.ask, out: io2.out, err: io2.err, Scheme: window.Scheme, cancelled: () => sh2.cancelled,
      run: (code, p) => lang === 'java' ? window.JAVARUN.run(code, { stdin: '', onOutput: p.onOutput }) : window.PYRUN.run(code, { execLimit: 15000, onOutput: p.onOutput, onInput: p.onInput }) }) : Promise.resolve(127));
    const hooks = Object.assign({ fs, run, compile, nano, typedInput, repl, cancel: () => { if (o.stop) o.stop(); else stopAll(); } }, o.hooks || {});
    let sh = SHELL.makeShell(hooks);
    if (Array.isArray(o.history)) sh.history = o.history.filter((s) => typeof s === 'string' && s.length < 2000).slice(-SHELL.LIMITS.history);
    if (o.aliases) sh.aliases = SHELL.cleanAliases(o.aliases);   // a saved session's aliases come back (they are checked: a saved copy is untrusted)
    const save = () => { if (!o.persist) return; try { localStorage.setItem(o.persist, JSON.stringify({ v: 1, fs: fs.toJSON(), history: sh.history, aliases: Object.assign({}, sh.aliases) })); } catch (e) { /* storage full or off: the session still works */ } };

    const box = el('div', { class: 'out term lab-term', hidden: '' });
    const status = el('span', { class: 'term-status', role: 'status' });
    const resetBtn = o.onReset ? el('button', { class: 'linklike term-reset', title: o.resetTitle || 'Start again from the files this terminal began with', onclick: (e) => o.armConfirm(e.currentTarget, 'Reset the files? Click again to confirm', () => api.reset()) }, 'Reset files') : null;
    const closeBtn = o.onClose ? el('button', { class: 'linklike term-close', title: 'Close the terminal', onclick: () => o.onClose() }, '×') : null;
    const sizeBtn = el('button', { class: 'linklike term-size', type: 'button', title: 'Make the terminal taller', 'aria-pressed': 'false', onclick: () => { const big = box.classList.toggle('term-big'); sizeBtn.setAttribute('aria-pressed', String(big)); sizeBtn.title = big ? 'Make the terminal shorter' : 'Make the terminal taller'; sizeBtn.textContent = big ? 'Shorter' : 'Taller'; pre.scrollTop = pre.scrollHeight; inp.focus(); } }, 'Taller');
    const bar = el('div', { class: 'term-bar' }, el('span', { class: 'term-title' }, o.title || 'Terminal'), el('span', { class: 'term-spacer' }), status, resetBtn, sizeBtn, closeBtn);
    const pre = el('pre', { class: 'out-text term-scroll', 'aria-live': 'polite', 'aria-label': 'Terminal output' });
    const ps1 = el('span', { class: 'term-ps1' });
    const inp = el('input', { class: 'term-inp', type: 'text', 'aria-label': 'Command line', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', placeholder: 'type a command, for example: help' });
    const tabBtn = el('button', { class: 'term-tab', type: 'button', title: 'Complete the name (Tab)', 'aria-label': 'Complete the name', onmousedown: (e) => e.preventDefault(), onclick: () => complete() }, '⇥');
    const ac = el('ul', { class: 'term-ac', role: 'listbox', hidden: '' });   // the list of completions when several fit
    const inputRow = el('div', { class: 'term-input' }, ps1, inp, tabBtn);
    box.append(bar, pre, inputRow, ac);
    box.addEventListener('click', (e) => { if (e.target === pre || e.target === inputRow || e.target === box) inp.focus(); });

    // writing: text is batched into one node per class run, and the scrollback is trimmed from the top
    let buf = '', bufCls = '';
    const CLS = { dir: 't-dir', exe: 't-exe', hd: 't-hd', err: 'err', cmd: 'cmd', note: 'note' };
    const flush = () => { if (!buf) return; pre.append(bufCls ? el('span', { class: CLS[bufCls] || '' }, buf) : document.createTextNode(buf)); buf = ''; if (pre.textContent.length > MAX_SCROLLBACK) { while (pre.firstChild && pre.textContent.length > MAX_SCROLLBACK * 0.8) pre.removeChild(pre.firstChild); } pre.scrollTop = pre.scrollHeight; };
    let shown = 0;
    const write = (s, cls) => { if (!s) return; cls = cls || ''; if (cls !== bufCls) { flush(); bufCls = cls; } shown += s.length; if (shown > MAX_SCROLLBACK) { if (shown - s.length <= MAX_SCROLLBACK) buf += '\n(more output was not shown)\n'; return; } buf += s; if (buf.length > 4000) flush(); };
    const line = (s, cls) => { write(s + '\n', cls); flush(); };
    const setStatus = (cls, text) => { status.className = 'term-status' + (cls ? ' ' + cls : ''); status.textContent = text; };
    const setPrompt = () => { ps1.textContent = sh.prompt(); };

    // program input: a prompt from input()/Scanner reuses the command line, and so do a here-document's lines (prompt '> '; hint: the placeholder)
    let asking = null;   // { resolve, prompt }
    const ask = (prompt, hint) => new Promise((resolve) => { flush(); asking = { resolve, prompt: prompt || '' }; ps1.textContent = asking.prompt; inp.placeholder = (hint || 'the program is waiting for input') + ' (Ctrl+D: end of input)'; inp.focus(); });

    // ----- running a line
    let running = false;
    const io = { out: write, err: (s) => write(s, 'err'), ask, clear: () => { flush(); pre.textContent = ''; shown = 0; }, tty: true, cols: 80 };
    const measure = () => { try { const probe = el('span', { style: 'position:absolute;visibility:hidden;white-space:pre' }, 'MMMMMMMMMM'); pre.append(probe); const w = probe.getBoundingClientRect().width / 10; probe.remove(); if (w > 0) io.cols = Math.max(20, Math.floor((pre.clientWidth - 30) / w)); } catch (e) { /* keep 80 */ } };
    async function runLine(text) {
      if (running) return 0;
      running = true; shown = 0; inp.value = ''; setStatus('running', 'running'); measure();
      line(sh.prompt() + text, 'cmd');
      if (o.before) { try { o.before(fs); } catch (e) { /* a broken mirror must never stop a command */ } }
      let exit = 0;
      try { exit = await sh.exec(text, io); } catch (e) { write('bash: ' + (e && e.message || e) + '\n', 'err'); exit = 1; }
      flush();
      if (o.after) { try { o.after(fs, line); } catch (e) { /* as above */ } }
      running = false; asking = null; inp.placeholder = ''; setPrompt();
      setStatus(exit ? 'fail' : 'ok', 'exit ' + exit);
      save();
      return exit;
    }
    function onEnter() {
      const v = inp.value;
      if (asking) { const a = asking; asking = null; inp.value = ''; inp.placeholder = ''; line(a.prompt + v, ''); ps1.textContent = ''; a.resolve(v); return; }
      if (running) return;
      runLine(v);
    }
    // ----- Tab completion. One fit: it is filled in. Several: the longest common start is filled in, and the fits are listed under the line
    // (arrows choose, Tab or Enter accepts, Esc closes, typing goes on). Touch screens have the ⇥ button for it.
    let acItems = [], acStart = 0, acTail = '', acSel = -1;
    const acClose = () => { ac.hidden = true; ac.replaceChildren(); acItems = []; acSel = -1; };
    const acAccept = (i) => { const it = acItems[i]; if (!it) return; inp.value = inp.value.slice(0, acStart) + it.value + acTail; inp.selectionStart = inp.selectionEnd = acStart + it.value.length; acClose(); inp.focus(); };
    const acMove = (d) => { if (!acItems.length) return; acSel = (acSel + d + acItems.length) % acItems.length; [...ac.children].forEach((li, i) => { li.classList.toggle('on', i === acSel); li.setAttribute('aria-selected', i === acSel ? 'true' : 'false'); }); const cur = ac.children[acSel]; if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' }); };
    function complete() {
      const head = inp.value.slice(0, inp.selectionStart), tail = inp.value.slice(inp.selectionStart);
      const c = sh.complete(head);
      if (!c.items.length) { acClose(); return; }
      if (c.items.length === 1) { inp.value = head.slice(0, c.start) + c.items[0] + tail; inp.selectionStart = inp.selectionEnd = c.start + c.items[0].length; acClose(); return; }
      let common = c.items[0]; for (const it of c.items) { let k = 0; while (k < common.length && k < it.length && common[k] === it[k]) k++; common = common.slice(0, k); }
      const word = head.slice(c.start);
      let newHead = head;
      if (common.length > word.length) { newHead = head.slice(0, c.start) + common; inp.value = newHead + tail; inp.selectionStart = inp.selectionEnd = newHead.length; }
      acItems = c.items.map((value, i) => ({ value, label: (c.display || c.items)[i] })); acStart = c.start; acTail = tail; acSel = -1;
      ac.replaceChildren(...acItems.map((it, i) => el('li', { role: 'option', 'aria-selected': 'false', class: /\/$/.test(it.label) ? 't-dir' : '', onmousedown: (e) => e.preventDefault(), onclick: () => acAccept(i) }, it.label)));
      ac.hidden = false;
    }
    inp.addEventListener('input', () => { if (!ac.hidden) { const head = inp.value.slice(0, inp.selectionStart); const word = head.slice(acStart); const keep = acItems.filter((it) => it.value.startsWith(word)); if (!keep.length || word.length < 1) acClose(); else { acItems = keep; acSel = -1; ac.replaceChildren(...acItems.map((it, i) => el('li', { role: 'option', 'aria-selected': 'false', class: /\/$/.test(it.label) ? 't-dir' : '', onmousedown: (e) => e.preventDefault(), onclick: () => acAccept(i) }, it.label))); } } });
    inp.addEventListener('blur', () => setTimeout(acClose, 150));
    let hIdx = -1, hDraft = '';
    // Ctrl+R: bash's reverse-i-search. The prompt shows what is being searched for, the line shows the newest command that contains it;
    // Ctrl+R again looks further back, Enter runs the match, Esc or an arrow keeps it for editing, Ctrl+G or Ctrl+C gives the old line back.
    let rs = null;   // { q, at, draft, failed }
    const rsShow = () => { ps1.textContent = (rs.failed ? '(failed reverse-i-search)`' : '(reverse-i-search)`') + rs.q + "': "; };
    const rsFind = (from) => { const h = sh.history; for (let i = Math.min(from, h.length - 1); i >= 0; i--) if (rs.q && h[i].includes(rs.q)) { rs.at = i; rs.failed = false; inp.value = h[i]; return; } rs.failed = !!rs.q; };
    // the caret goes to the end now, not on the next frame: a late move would land in the middle of whatever is typed or pasted next
    const rsEnd = (keep) => { if (!rs) return; if (!keep) inp.value = rs.draft; rs = null; setPrompt(); inp.selectionStart = inp.selectionEnd = inp.value.length; };
    let killed = '';   // Ctrl+K and Ctrl+W keep what they cut, Ctrl+Y puts it back, as readline does
    const cut = (a, b) => { killed = inp.value.slice(a, b); inp.value = inp.value.slice(0, a) + inp.value.slice(b); inp.selectionStart = inp.selectionEnd = a; };
    inp.addEventListener('keydown', (e) => {
      if (rs) {
        const k = e.key;
        if (e.ctrlKey && (k === 'r' || k === 'R')) { e.preventDefault(); rsFind(rs.at - 1); rsShow(); return; }
        if ((e.ctrlKey && (k === 'g' || k === 'G' || k === 'c' || k === 'C'))) { e.preventDefault(); rsEnd(false); return; }
        if (k === 'Enter') { e.preventDefault(); rsEnd(true); hIdx = -1; onEnter(); return; }
        if (k === 'Escape' || k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowUp' || k === 'ArrowDown' || k === 'Tab' || k === 'Home' || k === 'End') { e.preventDefault(); rsEnd(true); return; }
        if (k === 'Backspace') { e.preventDefault(); rs.q = rs.q.slice(0, -1); if (rs.q) rsFind(sh.history.length - 1); else { rs.failed = false; inp.value = rs.draft; } rsShow(); return; }
        if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); rs.q += k; rsFind(rs.failed ? rs.at : (rs.at < sh.history.length ? rs.at : sh.history.length - 1)); rsShow(); return; }
        return;
      }
      if (e.ctrlKey && !e.altKey && (e.key === 'r' || e.key === 'R') && !running) { e.preventDefault(); acClose(); rs = { q: '', at: sh.history.length, draft: inp.value, failed: false }; rsShow(); return; }
      if (e.ctrlKey && !e.altKey && !e.shiftKey) {
        const k = e.key.toLowerCase(), s = inp.selectionStart, v = inp.value;
        if (k === 'a') { e.preventDefault(); inp.selectionStart = inp.selectionEnd = 0; return; }
        if (k === 'e') { e.preventDefault(); inp.selectionStart = inp.selectionEnd = v.length; return; }
        if (k === 'k') { e.preventDefault(); cut(s, v.length); return; }
        if (k === 'w') { e.preventDefault(); let a = s; while (a > 0 && v[a - 1] === ' ') a--; while (a > 0 && v[a - 1] !== ' ') a--; cut(a, s); return; }
        if (k === 'y') { e.preventDefault(); if (killed) { inp.value = v.slice(0, s) + killed + v.slice(inp.selectionEnd); inp.selectionStart = inp.selectionEnd = s + killed.length; } return; }
      }
      // the completion list first: its arrows, Enter, Tab and Esc are not the history's or the command line's
      if (!ac.hidden && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Escape' || ((e.key === 'Enter' || e.key === 'Tab') && acSel >= 0))) {
        e.preventDefault();
        if (e.key === 'Escape') acClose();
        else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') acMove(e.key === 'ArrowDown' ? 1 : -1);
        else acAccept(acSel);
        return;
      }
      if (e.key === 'Enter') { e.preventDefault(); hIdx = -1; acClose(); onEnter(); return; }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        if (running) return; e.preventDefault();
        const h = sh.history; if (!h.length) return;
        if (hIdx < 0) { hDraft = inp.value; hIdx = h.length; }
        hIdx = e.key === 'ArrowUp' ? Math.max(0, hIdx - 1) : Math.min(h.length, hIdx + 1);
        inp.value = hIdx === h.length ? hDraft : h[hIdx]; if (hIdx === h.length) hIdx = -1;
        requestAnimationFrame(() => { inp.selectionStart = inp.selectionEnd = inp.value.length; });
        return;
      }
      if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); if (!running) complete(); return; }
      if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) { if (!running && inp.selectionStart !== inp.selectionEnd) return; e.preventDefault(); if (running) { sh.cancel(); if (asking) { const a = asking; asking = null; a.resolve(''); } } else { line(sh.prompt() + inp.value + '^C', 'cmd'); inp.value = ''; } return; }
      if (e.ctrlKey && (e.key === 'd' || e.key === 'D') && asking && !inp.value) { e.preventDefault(); const a = asking; asking = null; inp.placeholder = ''; line(a.prompt + '^D', 'note'); ps1.textContent = ''; a.resolve(null); return; }   // end of input
      if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) { e.preventDefault(); io.clear(); return; }
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) { e.preventDefault(); cut(0, inp.selectionStart); return; }
    });

    // ----- hooks for the shell: programs through the site's sandboxes
    const R = () => A().Runners;
    async function run(lang, src, p) {
      const onOutput = (s) => p.onOutput(String(s));
      const args = Array.isArray(p.args) ? p.args.map(String) : [];   // the words after the program's name: sys.argv[1:], main(String[] args)
      if (lang === 'python') { const r = await window.PYRUN.run(src, { stdin: p.stdin == null ? null : p.stdin, execLimit: 15000, args, argv0: typeof p.name === 'string' ? p.name : 'main.py', onOutput, onInput: p.onInput ? (q) => p.onInput(q) : undefined }); return { err: r.err, exit: r.err ? (/^Stopped/.test(r.err) ? 130 : 1) : 0 }; }
      // Java and the teaching C++ read typed input a line at a time as they ask (runner.js); a pipe or a file (< in.txt) is given all at once
      const onInput = p.stdin == null && p.onInput ? (q) => p.onInput(q) : undefined;
      if (lang === 'java') {
        // a .class from javac holds the joined program of every file compiled with it (javaproject.js), and  java Name  runs Name's main
        const proj = window.JPROJ ? window.JPROJ.fromJoined(src) : null, cls = typeof p.name === 'string' && !/\.java$/.test(p.name) ? p.name.split('/').pop().replace(/\.class$/, '') : undefined;
        const r = await R().java.run(src, { stdin: onInput ? null : (p.stdin == null ? '' : p.stdin), onOutput, onInput, args, mainClass: cls });
        return { err: proj ? window.JPROJ.mapError(proj, r.err) : r.err, exit: r.err ? (r.exit === 130 ? 130 : 1) : (r.exit || 0) };
      }
      if (lang === 'c') {   // the real compiler, as C (cached: gcc compiled this source a moment ago); typed input as it asks, or the pipe or file
        const r = await R().c.run(src, { stdin: onInput ? null : (p.stdin == null ? '' : p.stdin), onInput, std: p.std, args, argv0: typeof p.name === 'string' ? p.name : './a.out', onOutput, onNote: (s) => write(s + '\n', 'note'), host: box });
        return { err: r.err, exit: r.err ? (r.err === 'Stopped.' ? 130 : (r.exit || 1)) : (r.exit || 0) };
      }
      if (lang === 'scheme') { const r = await R().scheme.run(src, { onOutput }); return { err: r.error ? ';' + String(r.error).replace(/^;/, '') : null, exit: r.error ? 1 : 0 }; }
      if (lang === 'cpp') {
        if (p.std) { const r = await R().cppFull.run(src, { stdin: p.stdin == null ? '' : p.stdin, std: p.std, onOutput, onNote: (s) => write(s + '\n', 'note'), host: box }); return { err: r.err, exit: r.err ? 1 : (r.exit || 0) }; }
        const typed = onInput && typedInput('cpp', src, null);
        const r = await R().cpp.run(src, { stdin: typed ? null : (p.stdin == null ? '' : p.stdin), onOutput, onInput: typed ? onInput : undefined }); return { err: r.err, exit: r.err ? (r.exit === 130 ? 130 : 1) : 0 };
      }
      return { err: lang + ': no way to run this here', exit: 126 };
    }
    // which programs take their input a line at a time as they ask; the shell collects the others' input before they start
    function typedInput(lang, src, std) { return lang === 'java' || lang === 'c' || (lang === 'cpp' && !std && !/\b(scanf|getchar)\b/.test(src)); }
    const stdOf = (s) => { const m = String(s || '').match(/(11|14|17|20|23)$/); return m ? 'gnu++' + m[1] : 'gnu++20'; };
    // gcc's -std= for C: c99 / gnu11 / c18 (= c17) / c2x (= c23) …; null for something that is not a C standard (-std=c++20 given to a .c)
    const cStdOf = (s) => { const m = String(s).match(/^(c|gnu|iso9899:)(89|90|99|11|17|18|2x|23)$/); return m ? (m[1] === 'gnu' ? 'gnu' : 'c') + ({ 90: '89', 18: '17', '2x': '23' }[m[2]] || m[2]) : null; };
    async function compile(lang, src, p) {
      if (lang === 'java') { const r = await window.JAVARUN.check(src); return { err: r.err }; }
      if (lang === 'c') {   // C has only the real compiler; its messages say main.c, so they are given the file's own name, as gcc prints it
        const std = p.std ? cStdOf(p.std) : ((o.cStd && o.cStd()) || 'gnu17');
        if (!std) return { err: "error: invalid value '" + p.std + "' in '-std=" + p.std + "'\nnote: use 'c99', 'c11', 'c17' or 'c23' for C (or the 'gnu' ones: gnu17 …)" };
        const name = typeof p.name === 'string' ? p.name : 'main.c', named = (t) => String(t).replace(/^main\.c:/gm, name + ':');
        const r = await R().c.compile(src, { std, host: box }); if (r.notes) write(named(r.notes) + '\n', 'note');
        return { err: r.err ? named(r.err) : null, std: r.err ? undefined : std };
      }
      if (lang === 'cpp') {
        const wantFull = (o.isFull && o.isFull()) || !!p.std;
        if (wantFull && R().cppFull.available()) { const std = p.std ? stdOf(p.std) : ((o.cppStd && o.cppStd()) || 'gnu++20'); const r = await R().cppFull.compile(src, { std, host: box }); if (r.notes) write(r.notes + '\n', 'note'); return { err: r.err, std: r.err ? undefined : std }; }
        if (wantFull && p.std) write('(Full C++ is not available here, so the teaching compiler was used; -std was ignored)\n', 'note');
        const r = await window.CPPRUN.check(src); return { err: r.err };
      }
      return { err: null };
    }
    // nano: a small editor inside the panel. write(text) saves the file at once (and returns an error message, or null); the promise resolves
    // when the student leaves. Keys work wherever the focus is while nano is open: Ctrl+S or Ctrl+O save, Ctrl+X leaves, and when there are
    // unsaved changes the "Save modified buffer?" question takes Y, N or Ctrl+C, as the real nano does. The buttons do the same by mouse.
    function nano(title, text, write) {
      return new Promise((resolve) => {
        flush(); inputRow.hidden = true;
        const ta = el('textarea', { class: 'nano-ta', 'aria-label': 'Editing ' + title, spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off' });
        ta.value = text; let dirty = false, mode = 'edit';
        const msg = el('div', { class: 'nano-msg' });
        const head = el('div', { class: 'nano-head' }, title);
        const bottom = el('div', { class: 'nano-bottom' });
        const ui = el('div', { class: 'nano' }, el('div', { class: 'nano-top' }, el('span', { class: 'nano-brand' }, 'nano'), head), ta, msg, bottom);
        // the buttons must not take the focus away from the text: Ctrl+S after a click would otherwise reach the browser, not nano
        const keys = (pairs) => el('div', { class: 'nano-keys' }, pairs.map(([k, label, fn]) => el('button', { class: 'nano-key', type: 'button', onmousedown: (e) => e.preventDefault(), onclick: () => { fn(); ta.focus(); } }, el('b', {}, k), ' ' + label)));
        const say = (t, ask) => { msg.textContent = t; msg.className = 'nano-msg' + (ask ? ' nano-ask' : ''); };
        const lineCount = (t) => (t === '' ? 0 : t.replace(/\n$/, '').split('\n').length);
        const close = () => { document.removeEventListener('keydown', onKey, true); ui.remove(); inputRow.hidden = false; inp.focus(); resolve(null); };
        const doSave = () => {
          let t = ta.value; if (t !== '' && !t.endsWith('\n')) { t += '\n'; ta.value = t; }   // nano ends a file with a newline, as every Unix tool expects
          const err = write ? write(t) : null;
          if (err) { say('[ Error writing ' + title + ': ' + err + ' ]'); return false; }
          dirty = false; head.textContent = title; say('[ Wrote ' + lineCount(t) + ' line' + (lineCount(t) === 1 ? '' : 's') + ' ]'); return true;
        };
        const askKeys = () => keys([[' Y', 'Yes', () => { if (doSave()) close(); }], [' N', 'No', () => close()], ['^C', 'Cancel', () => cancelAsk()]]);
        const mainKeys = () => keys([['^S', 'Save', () => doSave()], ['^X', 'Exit', () => doExit()], ['^G', 'Help', () => say('Ctrl+S saves. Ctrl+X leaves; with unsaved changes it asks: Y saves and leaves, N leaves without saving, Ctrl+C stays.')]]);
        const cancelAsk = () => { mode = 'edit'; ta.readOnly = false; say(''); bottom.replaceChildren(mainKeys()); ta.focus(); };
        const doExit = () => {
          if (!dirty) { close(); return; }
          mode = 'ask'; ta.readOnly = true; say('Save modified buffer?  (Y)es  (N)o  Ctrl+C to cancel', true); bottom.replaceChildren(askKeys()); ta.focus();
          if (bottom.scrollIntoView) bottom.scrollIntoView({ block: 'nearest' });
        };
        // one handler for every key, on the document while nano is open, so the focus does not matter
        const onKey = (e) => {
          if (!ui.isConnected) return;
          const k = e.key, ctrl = e.ctrlKey || e.metaKey;
          if (mode === 'ask') {
            if (k === 'y' || k === 'Y') { e.preventDefault(); if (doSave()) close(); }
            else if (k === 'n' || k === 'N') { e.preventDefault(); close(); }
            else if ((ctrl && (k === 'c' || k === 'C')) || k === 'Escape') { e.preventDefault(); cancelAsk(); }
            else if (k.length === 1 || k === 'Enter' || k === 'Tab' || k === 'Backspace') e.preventDefault();   // the text does not change while the question is open
            return;
          }
          if (ctrl && (k === 's' || k === 'S' || k === 'o' || k === 'O')) { e.preventDefault(); doSave(); ta.focus(); }
          else if (ctrl && (k === 'x' || k === 'X')) { e.preventDefault(); doExit(); }
          else if (ctrl && (k === 'g' || k === 'G')) { e.preventDefault(); say('Ctrl+S saves. Ctrl+X leaves; with unsaved changes it asks: Y saves and leaves, N leaves without saving, Ctrl+C stays.'); }
          else if (e.target === ta && k === 'Tab') { e.preventDefault(); const s = ta.selectionStart; ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = s + 4; ta.dispatchEvent(new Event('input')); }
          else if (e.target === ta && k === 'Enter' && !ctrl) { const s = ta.selectionStart, lineStart = ta.value.lastIndexOf('\n', s - 1) + 1, indent = (ta.value.slice(lineStart, s).match(/^[ \t]*/) || [''])[0]; if (indent) { e.preventDefault(); ta.value = ta.value.slice(0, s) + '\n' + indent + ta.value.slice(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = s + 1 + indent.length; ta.dispatchEvent(new Event('input')); } }
        };
        ta.addEventListener('input', () => { if (!dirty) { dirty = true; head.textContent = title + '  Modified'; } if (mode === 'edit' && /^\[ Wrote/.test(msg.textContent)) say(''); });
        document.addEventListener('keydown', onKey, true);
        bottom.append(mainKeys());
        box.insertBefore(ui, inputRow); ta.focus();
      });
    }

    const api = {
      el: box, io,
      show(focus) { box.hidden = false; setPrompt(); if (focus) inp.focus(); },
      hide() { box.hidden = true; },
      focus: () => inp.focus(),
      note: (s) => line(s, 'note'),
      clear: () => io.clear(),
      shell: () => sh, fs: () => fs, running: () => running,
      /** run a line as if it had been typed → Promise<exit> */
      exec: (text) => runLine(text),
      /** start again: a new file system (from onReset), the history kept */
      reset() { const next = o.onReset ? o.onReset() : fs; if (!next) return; fs = next; hooks.fs = fs; const hist = sh.history, als = sh.aliases; sh = SHELL.makeShell(hooks); sh.history = hist; sh.aliases = als; io.clear(); setStatus('', ''); setPrompt(); if (o.afterReset) o.afterReset(api); save(); }
    };
    setPrompt();
    return api;
  }

  /* ---------------- the Code Lab's terminal ---------------- */
  function mount(ctx) {
    const SHELL = window.SHELL;
    let saved = null; try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { saved = null; }
    let mirrored = new Set();   // names mirrored into ~/lab by the last syncIn
    function syncIn(fs) {
      if (!fs.isDir(LAB_DIR)) { if (fs.exists(LAB_DIR)) fs.unlink(LAB_DIR); fs.mkdir(LAB_DIR, true); }
      const files = ctx.labFiles(), names = new Set();
      for (const f of files) {
        if (!fs.validName(f.name) || names.has(f.name)) continue;
        const p = LAB_DIR + '/' + f.name, n = fs.stat(p);
        if (n && n.t === 'd') continue;
        if (!n || n.d !== f.code) { try { fs.write(p, f.code); } catch (e) { continue; /* over the limits: not shown here, and never treated as removed by the terminal */ } }
        names.add(f.name);
      }
      for (const name of mirrored) if (!names.has(name) && fs.isFile(LAB_DIR + '/' + name)) { try { fs.unlink(LAB_DIR + '/' + name); } catch (e) { /* ignore */ } }
      mirrored = names;
    }
    function syncOut(fs, line) {
      if (!fs.isDir(LAB_DIR)) return;   // the whole folder was removed: the Lab keeps its files, and the next command brings the folder back
      const files = ctx.labFiles(); let changed = false; const removed = [];
      const byName = new Map(); for (const f of files) if (!byName.has(f.name)) byName.set(f.name, f);
      for (const name of fs.list(LAB_DIR)) {
        const n = fs.stat(LAB_DIR + '/' + name); if (n.t !== 'f' || n.bin) continue;
        const f = byName.get(name);
        if (f) { if (f.code !== n.d) { f.set(n.d); changed = true; } }
        else if (langOf(name)) { ctx.addLabFile(langOf(name), name, n.d); changed = true; mirrored.add(name); }
      }
      for (const name of mirrored) if (!fs.exists(LAB_DIR + '/' + name) && byName.has(name)) { byName.get(name).remove(); removed.push(name); changed = true; }
      if (removed.length) line('(removed from the Code Lab too: ' + removed.join(', ') + ')', 'note');
      if (changed) ctx.labChanged();
    }
    const edit = (abs, text) => {
      const name = abs.split('/').pop(), lang = langOf(name);
      if (!lang) return 'edit works for .py, .cpp, .java and .scm files; for ' + name + ' use nano ' + name;
      if (abs.startsWith(LAB_DIR + '/') && !abs.slice(LAB_DIR.length + 1).includes('/')) { ctx.openInEditor(lang, name, text, false); return 'opened ' + name + ' in the editor above (it is a Code Lab file: lab/' + name + ')'; }
      ctx.openInEditor(lang, name, text, true); return 'opened a copy of ' + name + ' in the editor above, as lab/' + name;
    };
    // setup NAME: the files of a lesson, into the home directory (src/shellgrade.js finds the lesson)
    const setup = (name, sh) => { const SG = window.SHELLGRADE; if (!SG) return null; const tree = SG.setupFor(name); if (!tree) return null; SG.populate(sh.fs, tree); sh.fs.cwd = SHELL.HOME; return 'the files for ' + name + ' are in your home directory now (you are there: ls to see them)'; };
    const panel = makePanel({
      fs: SHELL.makeFS(saved && saved.fs), history: saved && saved.history, aliases: saved && saved.aliases, persist: KEY, armConfirm: ctx.armConfirm, isFull: ctx.isFull, cppStd: ctx.cppStd, cStd: ctx.cStd, stop: ctx.stop,
      hooks: { edit, setup }, before: syncIn, after: syncOut, onClose: ctx.onClose,
      onReset: () => { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } mirrored = new Set(); return SHELL.makeFS(null); },
      resetTitle: 'Forget every file and folder made in this terminal (the Code Lab files stay)',
      afterReset: (p) => p.note('(every file made in this terminal was removed; the Code Lab files are still in ~/lab)')
    });
    const show = panel.show;
    panel.show = (focus) => { if (!panel.el.querySelector('.term-scroll').textContent) { panel.note(panel.fs().read('/etc/motd').trim()); panel.note('Your Code Lab files are in the folder lab: try  ls lab  and  python lab/' + (ctx.labFiles()[0] || { name: 'main.py' }).name); } show(focus); };
    return panel;
  }

  /* ---------------- shell lessons ----------------
     An example: { play: 'commands, one per line', setup: 'lesson1' | tree, caption }. The commands are a listing; Run types them into the terminal
     below, one at a time; the student can then type their own. Reset rebuilds the files. */
  function lessonPanel(setup, course, extra) {
    const SG = window.SHELLGRADE;
    const make = () => SG.makeFS(setup, course);
    return makePanel(Object.assign({ fs: make(), armConfirm: A().armConfirm, title: 'Terminal', onReset: make, hooks: { setup: (name, sh) => { const tree = SG.setupFor(name, course); if (!tree) return null; SG.populate(sh.fs, tree); return 'the files are back'; } } }, extra || {}));
  }
  function playBlock(b, course) {
    const { el } = window.__h;
    const { highlight } = A();
    const box = el('div', { class: 'play shell-play' });
    if (b.caption) box.append(el('div', { class: 'play-cap' }, el('span', { class: 'play-label' }, A().lbl('tryIt')), el('span', { html: b.caption })));
    const lines = String(b.play).split('\n').filter((l) => l.trim() !== '');
    const listing = el('pre', { class: 'code shell-cmds' }, el('code', { html: lines.map((l) => '<span class="sh-ps">$</span> ' + highlight(l, 'shell').replace(/\n$/, '')).join('\n') }));
    const panel = lessonPanel(b.setup, course);
    let busy = false;
    const runBtn = el('button', { class: 'btn primary', onclick: async () => { if (busy) return; busy = true; runBtn.disabled = true; panel.show(false); for (const l of lines) await panel.exec(l); busy = false; runBtn.disabled = false; if (!(window.matchMedia && matchMedia('(hover: none)').matches)) panel.focus(); } }, 'Run');
    const resetBtn = el('button', { class: 'btn quiet', onclick: () => { panel.reset(); panel.hide(); } }, 'Reset');
    box.append(listing, el('div', { class: 'toolbar' }, runBtn, resetBtn, el('span', { class: 'shell-hint' }, 'Run types these into the terminal; then type your own.')), panel.el);
    return box;
  }
  /* An exercise: { id, title, prompt, setup, tests: [...], hints, solution: 'commands', followup }. Check grades the terminal's files and history. */
  function exerciseBlock(ex, course, lessonIdx) {
    const { el } = window.__h;
    const I = A(); const { Progress, renderVerdict, armConfirm, highlight, lbl } = I;
    const affirm = (course && Array.isArray(course.affirm) && course.affirm.length) ? course.affirm : null;
    const done = Progress.isDone(ex.id);
    const box = el('section', { class: 'exercise shell-ex' + (done ? ' done' : ''), id: ex.id });
    box.append(el('header', { class: 'ex-head' }, el('h3', {}, el('span', { class: 'ex-label' }, 'Exercise'), ' ', ex.title), el('span', { class: 'ex-check', title: 'Completed' }, I.checkSVG())), el('div', { class: 'prose', html: ex.prompt }));
    const panel = lessonPanel(ex.setup, course);
    panel.show(false);
    const verdict = el('div', { class: 'verdict', hidden: '', role: 'status' });
    let attempts = 0;
    const checkBtn = el('button', { class: 'btn primary', onclick: async () => {
      if (panel.running()) return;
      checkBtn.disabled = true; checkBtn.textContent = 'Checking…'; attempts++; verdict.hidden = false; verdict.innerHTML = '';
      try {
        const r = await window.SHELLGRADE.grade(ex, panel.shell());
        renderVerdict(verdict, r, ex, attempts, affirm);
        if (r.passed) { box.classList.add('done'); Progress.markDone(ex.id, panel.shell().history.join('\n')); document.dispatchEvent(new CustomEvent('progress-changed')); }
      } catch (e) { verdict.className = 'verdict fail'; verdict.append(el('p', { class: 'v-title' }, 'The checker failed unexpectedly: ' + (e && e.message || e))); }
      checkBtn.disabled = false; checkBtn.replaceChildren(lbl('check'));
    } }, lbl('check'));
    const resetBtn = el('button', { class: 'btn quiet', onclick: () => armConfirm(resetBtn, 'Start the files again?', () => { resetBtn.classList.remove('armed'); panel.reset(); verdict.hidden = true; }) }, 'Reset');
    let hintIdx = 0;
    const hintBox = el('div', { class: 'hints' });
    const hintBtn = el('button', { class: 'btn quiet', onclick: () => {
      if (hintIdx < ex.hints.length) { hintBox.appendChild(el('p', { class: 'hint' }, el('b', {}, 'Hint ' + (hintIdx + 1) + '. '), el('span', { html: ex.hints[hintIdx] }))); hintIdx++; }
      hintBtn.textContent = hintIdx < ex.hints.length ? 'Hint (' + (ex.hints.length - hintIdx) + ' left)' : 'No more hints'; hintBtn.disabled = hintIdx >= ex.hints.length;
    } }, ex.hints && ex.hints.length ? 'Hint (' + ex.hints.length + ')' : 'No hints');
    if (!ex.hints || !ex.hints.length) hintBtn.disabled = true;
    const solBox = el('div', { class: 'solution', hidden: '' });
    const solBtn = el('button', { class: 'btn quiet', onclick: () => {
      const show = () => { solBtn.classList.remove('armed'); solBox.hidden = !solBox.hidden; if (!solBox.hidden && !solBox.childNodes.length) solBox.append(el('p', {}, el('b', {}, 'One solution. '), 'Compare it with what you typed; there are usually several ways.'), el('pre', { class: 'code shell-cmds' }, el('code', { html: String(ex.solution).split('\n').filter((l) => l.trim()).map((l) => '<span class="sh-ps">$</span> ' + highlight(l, 'shell').replace(/\n$/, '')).join('\n') }))); };
      if (attempts < 2 && solBox.hidden) armConfirm(solBtn, 'Show before trying twice?', show); else show();
    } }, 'Solution');
    box.append(panel.el, el('div', { class: 'toolbar' }, checkBtn, resetBtn, el('span', { class: 'spacer' }), hintBtn, solBtn), verdict, hintBox, solBox);
    return box;
  }

  window.TERMINAL = { mount, makePanel, playBlock, exerciseBlock, KEY };
})();
