/* The Terminal panel of the Code Lab: a prompt in front of the practice shell (src/shell.js), drawn like the output panel.
   Registered as window.TERMINAL; src/lab.js mounts it with { el, armConfirm, isTouch, Runners, isFull, cppStd, labFiles, labChanged, openInEditor }.

   What lives where: the shell's file system is saved under shortcourses.shell.v1 (only /home and /tmp; the system part is rebuilt).
   ~/lab mirrors the Code Lab's files: before every command the Lab's files are written into it, and after the command any file in it that
   changed, appeared or was removed is written back to the Lab (new files only for extensions the Lab knows: .py .cpp .java .scm).
   Programs run through the same sandboxes as the Run button (Runners / PYRUN / CLANGRUN); their text comes back here as text only. */
(function () {
  'use strict';
  const KEY = 'shortcourses.shell.v1';
  const LAB_DIR = '/home/student/lab';
  const EXT = { '.py': 'python', '.cpp': 'cpp', '.cc': 'cpp', '.cxx': 'cpp', '.h': 'cpp', '.java': 'java', '.scm': 'scheme', '.ss': 'scheme', '.rkt': 'scheme' };
  const langOf = (name) => { const m = name.match(/\.\w+$/); return m && Object.prototype.hasOwnProperty.call(EXT, m[0].toLowerCase()) ? EXT[m[0].toLowerCase()] : null; };
  const MAX_SCROLLBACK = 300000;   // characters kept on screen

  function mount(ctx) {
    const { el } = ctx;
    const SHELL = window.SHELL;
    let saved = null; try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { saved = null; }
    let fs = SHELL.makeFS(saved && saved.fs);
    const hooks = { fs, run, compile, nano, edit, cancel: () => { if (ctx.stop) ctx.stop(); } };
    let sh = SHELL.makeShell(hooks);
    if (saved && Array.isArray(saved.history)) sh.history = saved.history.filter((s) => typeof s === 'string' && s.length < 2000).slice(-SHELL.LIMITS.history);
    // saved at once after every command (a reload a moment later must find the files)
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify({ v: 1, fs: fs.toJSON(), history: sh.history })); } catch (e) { /* storage full or off: the session still works */ } };

    // ----- the panel
    const box = el('div', { class: 'out term lab-term', hidden: '' });
    const status = el('span', { class: 'term-status', role: 'status' });
    const resetBtn = el('button', { class: 'linklike term-reset', title: 'Forget every file and folder made in this terminal (the Code Lab files stay)', onclick: (e) => ctx.armConfirm(e.currentTarget, 'Delete all terminal files? Click again to confirm', reset) }, 'Reset files');
    const closeBtn = el('button', { class: 'linklike term-close', title: 'Close the terminal', onclick: () => { if (ctx.onClose) ctx.onClose(); } }, '×');
    const bar = el('div', { class: 'term-bar' }, el('span', { class: 'term-dots', 'aria-hidden': 'true' }, el('span'), el('span'), el('span')), el('span', { class: 'term-title' }, 'Terminal'), status, resetBtn, closeBtn);
    const pre = el('pre', { class: 'out-text term-scroll', 'aria-live': 'polite', 'aria-label': 'Terminal output' });
    const ps1 = el('span', { class: 'term-ps1' });
    const inp = el('input', { class: 'term-inp', type: 'text', 'aria-label': 'Command line', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', placeholder: 'type a command, for example: help' });
    const inputRow = el('div', { class: 'term-input' }, ps1, inp);
    box.append(bar, pre, inputRow);
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

    // program input: a prompt from input()/Scanner reuses the command line
    let asking = null;   // { resolve, prompt }
    const ask = (prompt) => new Promise((resolve) => { flush(); asking = { resolve, prompt: prompt || '' }; ps1.textContent = asking.prompt; inp.placeholder = 'the program is waiting for input'; inp.focus(); });

    // ----- running a line
    let running = false;
    const io = { out: write, err: (s) => write(s, 'err'), ask, clear: () => { flush(); pre.textContent = ''; shown = 0; }, tty: true, cols: 80 };
    const measure = () => { try { const probe = el('span', { style: 'position:absolute;visibility:hidden;white-space:pre' }, 'MMMMMMMMMM'); pre.append(probe); const w = probe.getBoundingClientRect().width / 10; probe.remove(); if (w > 0) io.cols = Math.max(20, Math.floor((pre.clientWidth - 30) / w)); } catch (e) { /* keep 80 */ } };
    async function runLine(text) {
      if (running) return;
      running = true; shown = 0; inp.value = ''; inp.disabled = false; setStatus('running', 'running'); measure();
      line(sh.prompt() + text, 'cmd');
      syncIn();
      let exit = 0;
      try { exit = await sh.exec(text, io); } catch (e) { write('bash: ' + (e && e.message || e) + '\n', 'err'); exit = 1; }
      flush();
      syncOut();
      running = false; asking = null; inp.placeholder = ''; setPrompt();
      setStatus(exit ? 'fail' : 'ok', 'exit ' + exit);
      save();
    }
    function onEnter() {
      const v = inp.value;
      if (asking) { const a = asking; asking = null; inp.value = ''; inp.placeholder = ''; line(a.prompt + v, ''); ps1.textContent = ''; a.resolve(v); return; }
      if (running) return;
      runLine(v);
    }
    let hIdx = -1, hDraft = '';
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); hIdx = -1; onEnter(); return; }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        if (running) return; e.preventDefault();
        const h = sh.history; if (!h.length) return;
        if (hIdx < 0) { hDraft = inp.value; hIdx = h.length; }
        hIdx = e.key === 'ArrowUp' ? Math.max(0, hIdx - 1) : Math.min(h.length, hIdx + 1);
        inp.value = hIdx === h.length ? hDraft : h[hIdx]; if (hIdx === h.length) hIdx = -1;
        requestAnimationFrame(() => { inp.selectionStart = inp.selectionEnd = inp.value.length; });
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault(); if (running) return;
        const head = inp.value.slice(0, inp.selectionStart), tail = inp.value.slice(inp.selectionStart);
        const c = sh.complete(head);
        if (!c.items.length) return;
        if (c.items.length === 1) { inp.value = head.slice(0, c.start) + c.items[0] + tail; inp.selectionStart = inp.selectionEnd = c.start + c.items[0].length; return; }
        let common = c.items[0]; for (const it of c.items) { let k = 0; while (k < common.length && k < it.length && common[k] === it[k]) k++; common = common.slice(0, k); }
        const word = head.slice(c.start);
        if (common.length > word.length) { inp.value = head.slice(0, c.start) + common + tail; inp.selectionStart = inp.selectionEnd = c.start + common.length; return; }
        line(sh.prompt() + inp.value, 'cmd'); line(c.items.map((s) => s.trim()).join('  '));
        return;
      }
      if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) { e.preventDefault(); if (running) { sh.cancel(); if (asking) { const a = asking; asking = null; a.resolve(''); } } else { line(sh.prompt() + inp.value + '^C', 'cmd'); inp.value = ''; } return; }
      if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) { e.preventDefault(); io.clear(); return; }
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) { e.preventDefault(); inp.value = ''; return; }
    });

    // ----- ~/lab: the Code Lab's files, seen from the terminal
    let mirrored = new Set();   // names mirrored into ~/lab by the last syncIn
    function syncIn() {
      try {
        if (!fs.isDir(LAB_DIR)) { if (fs.exists(LAB_DIR)) fs.unlink(LAB_DIR); fs.mkdir(LAB_DIR, true); }
        const files = ctx.labFiles(), names = new Set();
        for (const f of files) {
          if (!fs.validName(f.name) || names.has(f.name)) continue; names.add(f.name);
          const p = LAB_DIR + '/' + f.name, n = fs.stat(p);
          if (n && n.t === 'd') continue;
          if (!n || n.d !== f.code) { try { fs.write(p, f.code); } catch (e) { /* over the limits: the Lab file is simply not shown here */ } }
        }
        for (const name of mirrored) if (!names.has(name) && fs.isFile(LAB_DIR + '/' + name)) { try { fs.unlink(LAB_DIR + '/' + name); } catch (e) { /* ignore */ } }
        mirrored = names;
      } catch (e) { /* a broken mirror must never stop a command */ }
    }
    function syncOut() {
      try {
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
      } catch (e) { /* as above */ }
    }

    // ----- hooks for the shell
    const R = () => ctx.Runners;
    async function run(lang, src, o) {
      const onOutput = (s) => o.onOutput(String(s));
      if (lang === 'python') { const r = await window.PYRUN.run(src, { stdin: o.stdin == null ? null : o.stdin, execLimit: 15000, onOutput, onInput: o.onInput ? (p) => o.onInput(p) : undefined }); return { err: r.err, exit: r.err ? (/^Stopped/.test(r.err) ? 130 : 1) : 0 }; }
      if (lang === 'java') { const r = await R().java.run(src, { stdin: o.stdin == null ? '' : o.stdin, onOutput }); return { err: r.err, exit: r.err ? 1 : (r.exit || 0) }; }
      if (lang === 'scheme') { const r = await R().scheme.run(src, { onOutput }); return { err: r.error ? ';' + String(r.error).replace(/^;/, '') : null, exit: r.error ? 1 : 0 }; }
      if (lang === 'cpp') {
        if (o.std) { const r = await R().cppFull.run(src, { stdin: o.stdin == null ? '' : o.stdin, std: o.std, onOutput, onNote: (s) => write(s + '\n', 'note'), host: box }); return { err: r.err, exit: r.err ? 1 : (r.exit || 0) }; }
        const r = await R().cpp.run(src, { stdin: o.stdin == null ? '' : o.stdin, onOutput }); return { err: r.err, exit: r.err ? 1 : 0 };
      }
      return { err: lang + ': no way to run this here', exit: 126 };
    }
    const stdOf = (s) => { const m = String(s || '').match(/(11|14|17|20|23)$/); return m ? 'gnu++' + m[1] : 'gnu++20'; };
    async function compile(lang, src, o) {
      if (lang === 'java') { const r = await window.JAVARUN.check(src); return { err: r.err }; }
      if (lang === 'cpp') {
        const wantFull = ctx.isFull() || !!o.std;
        if (wantFull && R().cppFull.available()) { const std = o.std ? stdOf(o.std) : (ctx.cppStd() || 'gnu++20'); const r = await R().cppFull.compile(src, { std, host: box }); if (r.notes) write(r.notes + '\n', 'note'); return { err: r.err, std: r.err ? undefined : std }; }
        if (wantFull && o.std) write('(Full C++ is not available here, so the teaching compiler was used; -std was ignored)\n', 'note');
        const r = await window.CPPRUN.check(src); return { err: r.err };
      }
      return { err: null };
    }
    // nano: a small editor inside the panel; resolves with the new text, or null when the student leaves without saving
    function nano(title, text) {
      return new Promise((resolve) => {
        flush(); inputRow.hidden = true;
        const ta = el('textarea', { class: 'nano-ta', 'aria-label': 'Editing ' + title, spellcheck: 'false', autocapitalize: 'off' });
        ta.value = text; let dirty = false, savedText = text;
        const msg = el('div', { class: 'nano-msg' });
        const keys = (pairs) => el('div', { class: 'nano-keys' }, pairs.map(([k, label, fn]) => el('button', { class: 'nano-key', onclick: fn }, el('b', {}, k), ' ' + label)));
        const close = (value) => { ui.remove(); inputRow.hidden = false; inp.focus(); resolve(value); };
        const doSave = () => { savedText = ta.value; dirty = false; msg.textContent = '[ Wrote ' + ta.value.split('\n').length + ' lines ]'; head.textContent = title; };
        const doExit = () => {
          if (!dirty) { close(savedText === text ? null : savedText); return; }
          msg.textContent = 'Save modified buffer?'; msg.className = 'nano-msg nano-ask';
          bottom.replaceChildren(keys([[' Y', 'Yes', () => { doSave(); close(savedText); }], [' N', 'No', () => close(savedText === text ? null : savedText)], ['^C', 'Cancel', () => { msg.textContent = ''; msg.className = 'nano-msg'; bottom.replaceChildren(mainKeys()); ta.focus(); }]]));
        };
        const mainKeys = () => keys([['^S', 'Save', doSave], ['^X', 'Exit', doExit]]);
        const head = el('div', { class: 'nano-head' }, title);
        const bottom = el('div', { class: 'nano-bottom' }, mainKeys());
        const ui = el('div', { class: 'nano' }, el('div', { class: 'nano-top' }, el('span', { class: 'nano-brand' }, 'nano'), head), ta, msg, bottom);
        ta.addEventListener('input', () => { if (!dirty) { dirty = true; head.textContent = title + '  Modified'; } });
        ta.addEventListener('keydown', (e) => {
          if (e.ctrlKey && (e.key === 's' || e.key === 'S' || e.key === 'o' || e.key === 'O')) { e.preventDefault(); doSave(); }
          else if (e.ctrlKey && (e.key === 'x' || e.key === 'X')) { e.preventDefault(); doExit(); }
          else if (e.key === 'Tab') { e.preventDefault(); const s = ta.selectionStart; ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = s + 4; ta.dispatchEvent(new Event('input')); }
          else if (e.key === 'Enter') { const s = ta.selectionStart, lineStart = ta.value.lastIndexOf('\n', s - 1) + 1, indent = (ta.value.slice(lineStart, s).match(/^[ \t]*/) || [''])[0]; if (indent) { e.preventDefault(); ta.value = ta.value.slice(0, s) + '\n' + indent + ta.value.slice(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = s + 1 + indent.length; ta.dispatchEvent(new Event('input')); } }
        });
        box.insertBefore(ui, inputRow); ta.focus();
      });
    }
    function edit(abs, text) {
      const name = abs.split('/').pop(), lang = langOf(name);
      if (!lang) return 'edit works for .py, .cpp, .java and .scm files; for ' + name + ' use nano ' + name;
      if (abs.startsWith(LAB_DIR + '/') && !abs.slice(LAB_DIR.length + 1).includes('/')) { ctx.openInEditor(lang, name, text, false); return 'opened ' + name + ' in the editor above (it is a Code Lab file: lab/' + name + ')'; }
      ctx.openInEditor(lang, name, text, true); return 'opened a copy of ' + name + ' in the editor above, as lab/' + name;
    }

    function reset() { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } fs = SHELL.makeFS(null); hooks.fs = fs; const hist = sh.history; sh = SHELL.makeShell(hooks); sh.history = hist; mirrored = new Set(); io.clear(); line('(every file made in this terminal was removed; the Code Lab files are still in ~/lab)', 'note'); setPrompt(); }
    function show(focus) { box.hidden = false; if (!pre.textContent) { line(fs.read('/etc/motd').trim(), 'note'); line('Your Code Lab files are in the folder lab: try  ls lab  and  python lab/' + (ctx.labFiles()[0] || { name: 'main.py' }).name, 'note'); } setPrompt(); if (focus) inp.focus(); }
    setPrompt();
    return { el: box, show, hide: () => { box.hidden = true; }, focus: () => inp.focus(), shell: () => sh, fs: () => fs, running: () => running };
  }
  window.TERMINAL = { mount, KEY };
})();
