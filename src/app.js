/* The core of the site: router, pages, code editor, language runners, grading and saved progress. */
(function () {
  'use strict';
  const $ = (sel, root) => (root || document).querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  function el(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k];
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== null && attrs[k] !== undefined) e.setAttribute(k, attrs[k]);
    }
    for (const k of kids.flat(Infinity)) if (k !== null && k !== undefined && k !== false) e.appendChild(k instanceof Node ? k : document.createTextNode(String(k)));
    return e;
  }
  window.__h = { $, esc, el };

  // ---------- progress (per-viewer, localStorage) ----------
  const Progress = {
    key: 'shortcourses.progress.v1',
    data: null,
    load() { if (this.data) return this.data; try { this.data = JSON.parse(localStorage.getItem(this.key) || '{}'); } catch (e) { this.data = {}; } if (!this.data || typeof this.data !== 'object') this.data = {}; if (!this.data.done) this.data.done = {}; if (!this.data.code) this.data.code = {}; if (!this.data.pass) this.data.pass = {}; return this.data; },
    save() { try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch (e) { /* storage unavailable */ } },
    isDone(id) { return !!this.load().done[id]; },
    // code (optional) is the work that passed; the portfolio shows it even if the student edits it later.
    markDone(id, code) { const d = this.load(); d.done[id] = Date.now(); if (code != null) d.pass[id] = code; this.save(); },
    getCode(id) { return this.load().code[id]; },
    setCode(id, code) { this.load().code[id] = code; this.save(); },
    reset() { this.data = { done: {}, code: {}, pass: {} }; this.save(); }
  };
  // another tab saved: forget the copy held here, or the next save would write it back over that tab's work
  window.addEventListener('storage', (e) => { if (e.key === Progress.key || e.key === null) Progress.data = null; });

  // ---------- syntax highlighting ----------
  const LANGS = {
    python: {
      comment: /#.*$/m, string: /(?:"""[\s\S]*?"""|'''[\s\S]*?'''|f?"(?:[^"\\\n]|\\.)*"|f?'(?:[^'\\\n]|\\.)*')/,
      keywords: 'def return if elif else for while in not and or import from as class pass break continue lambda True False None is with try except finally raise global del yield'.split(' '),
      builtins: 'print len range input int str float list dict set tuple sorted sum min max abs round type enumerate zip map filter reversed isinstance chr ord repr any all'.split(' '),
      tab: '    '
    },
    scheme: {
      comment: /;.*$/m, string: /"(?:[^"\\]|\\.)*"/,
      keywords: 'define lambda if cond else let let* begin and or set! quote when unless do case letrec'.split(' '),
      builtins: 'car cdr cons list map filter reduce append reverse length null? pair? display newline eq? equal? number? symbol? cadr caddr cddr apply error not zero? even? odd? abs square'.split(' '),
      tab: '  '
    },
    cpp: {
      comment: /(?:\/\/.*$|\/\*[\s\S]*?\*\/)/m, string: /(?:"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')/,
      keywords: 'int double float char bool void long unsigned short const return if else for while do break continue struct class true false using namespace include new delete sizeof static'.split(' '),
      builtins: 'cout cin endl std main sqrt pow abs strlen'.split(' '),
      tab: '    '
    },
    java: {
      comment: /(?:\/\/.*$|\/\*[\s\S]*?\*\/)/m, string: /(?:"""[\s\S]*?"""|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')/,
      keywords: 'public private protected static final abstract class interface extends implements new return if else for while do break continue switch case default void int double float long short byte char boolean true false null this super try catch finally throw throws import package instanceof var'.split(' '),
      builtins: 'System out in println print printf String Math Scanner Integer Double Character Boolean ArrayList HashMap HashSet List Map Set StringBuilder Random Arrays Collections Object main args length'.split(' '),
      tab: '    '
    },
    shell: {   // the practice terminal's language (src/shell.js)
      comment: /#.*$/m, string: /(?:"(?:[^"\\\n]|\\.)*"|'[^'\n]*')/,
      keywords: 'if then elif else fi for in do done while until function case esac'.split(' '),
      builtins: 'pwd cd ls mkdir rmdir touch rm cp mv chmod tree find cat less more tac head tail wc grep sort uniq cut tr sed rev nl diff tee xargs echo printf seq date cal whoami hostname file history clear exit true false export unset env which type test read source bash sh python python3 javac java g++ clang++ scheme nano edit setup man help sudo git'.split(' '),
      tab: '    '
    }
  };
  const langOf = (lang) => (typeof lang === 'string' && Object.prototype.hasOwnProperty.call(LANGS, lang)) ? LANGS[lang] : LANGS.python;   // not LANGS[lang]: "constructor" is truthy
  function highlight(code, lang) {
    const L = langOf(lang);
    const re = new RegExp('(' + L.comment.source + ')|(' + L.string.source + ')|(#\\s*include\\s*<[^>]*>)|(\\b\\d+(?:\\.\\d+)?\\b)|([A-Za-z_][A-Za-z0-9_!?*<>=\\-+/]*)', 'gm');
    let out = '', last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      const t = m[0];
      if (m[1]) out += '<span class="c">' + esc(t) + '</span>';
      else if (m[2]) out += '<span class="s">' + esc(t) + '</span>';
      else if (m[3]) out += '<span class="p">' + esc(t) + '</span>';
      else if (m[4]) out += '<span class="n">' + esc(t) + '</span>';
      else if (L.keywords.includes(t)) out += '<span class="k">' + esc(t) + '</span>';
      else if (L.builtins.includes(t)) out += '<span class="b">' + esc(t) + '</span>';
      else out += esc(t);
      last = re.lastIndex;
    }
    out += esc(code.slice(last));
    return out + '\n';
  }
  window.__highlight = highlight;

  // ---------- editor ----------
  // Split highlighted HTML into per-line <div class="line"> blocks, keeping any
  // token span that straddles a newline (multi-line strings/comments) balanced.
  function toLines(html) {
    const out = []; let open = null, cur = '';
    const re = /<span class="([a-z])">|<\/span>|\n/g; let last = 0, m;
    while ((m = re.exec(html))) {
      cur += html.slice(last, m.index); last = re.lastIndex;
      if (m[0] === '\n') { out.push(open ? cur + '</span>' : cur); cur = open ? '<span class="' + open + '">' : ''; }
      else if (m[0] === '</span>') { cur += m[0]; open = null; }
      else { cur += m[0]; open = m[1]; }
    }
    cur += html.slice(last); out.push(cur);
    return out.map((h, i) => '<div class="line" data-n="' + (i + 1) + '">' + h + '</div>').join('');
  }

  function makeEditor(lang, initial, onChange) {
    const wrap = el('div', { class: 'editor' });
    const pre = el('pre', { class: 'hl', 'aria-hidden': 'true' }, el('code'));
    const ta = el('textarea', { spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', 'aria-label': 'Code editor' });
    wrap.append(pre, ta);
    const L = langOf(lang);
    const render = () => {
      const h = highlight(ta.value, lang);
      $('code', pre).innerHTML = toLines(h.endsWith('\n') ? h.slice(0, -1) : h);
      const digits = String(ta.value.split('\n').length).length;
      wrap.style.setProperty('--gw', 'calc(' + Math.max(2, digits) + 'ch + 1.4rem)');
      ta.style.height = 'auto'; ta.style.height = pre.offsetHeight + 'px';
    };
    ta.value = initial || '';

    // ---- undo / redo: our own history so programmatic edits (auto-indent,
    // Tab, brace dedent, Reset) are undoable alongside ordinary typing. ----
    const hist = [{ v: ta.value, s: 0, e: 0 }]; let hi = 0, lastKind = null, lastTime = 0;
    const record = (kind) => {
      const now = Date.now();
      const st = { v: ta.value, s: ta.selectionStart, e: ta.selectionEnd };
      if (kind && kind === lastKind && now - lastTime < 800) hist[hi] = st;           // coalesce a run of typing
      else { hist.length = hi + 1; hist.push(st); hi++; if (hist.length > 1000) { hist.shift(); hi--; } }
      lastKind = kind; lastTime = now;
    };
    const restore = (st) => { ta.value = st.v; ta.selectionStart = st.s; ta.selectionEnd = st.e; lastKind = null; render(); if (onChange) onChange(ta.value); };
    const undo = () => { if (hi > 0) restore(hist[--hi]); };
    const redo = () => { if (hi < hist.length - 1) restore(hist[++hi]); };
    // Apply an edit: replace [s, t) with text, put caret at caretPos, and record it.
    const edit = (s, t, text, caretPos, selEnd) => {
      ta.value = ta.value.slice(0, s) + text + ta.value.slice(t);
      ta.selectionStart = caretPos; ta.selectionEnd = selEnd == null ? caretPos : selEnd;
      record(null); render(); if (onChange) onChange(ta.value);
    };

    ta.addEventListener('input', (e) => {
      const it = e.inputType || '';
      let kind = null;
      if (it === 'insertText' && e.data && e.data.length === 1 && !/\s/.test(e.data)) kind = 'type';
      else if (it === 'deleteContentBackward' || it === 'deleteContentForward') kind = it;
      record(kind); render(); if (onChange) onChange(ta.value);
    });
    // Swallow the browser's own undo/redo (menu or keyboard) in favour of ours.
    ta.addEventListener('beforeinput', (e) => {
      if (e.inputType === 'historyUndo') { e.preventDefault(); undo(); }
      else if (e.inputType === 'historyRedo') { e.preventDefault(); redo(); }
    });
    ta.addEventListener('scroll', () => { pre.scrollTop = ta.scrollTop; pre.scrollLeft = ta.scrollLeft; });
    ta.addEventListener('keydown', (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && !e.altKey && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
      if (mod && !e.altKey && !e.shiftKey && (e.key === 'y' || e.key === 'Y')) { e.preventDefault(); redo(); return; }
      if (e.key === 'Tab') {
        e.preventDefault();
        const s = ta.selectionStart, t = ta.selectionEnd;
        if (s !== t && ta.value.slice(s, t).includes('\n')) {
          const v = ta.value, ls = v.lastIndexOf('\n', s - 1) + 1; let le = v.indexOf('\n', t - 1); if (le < 0) le = v.length;
          const text = v.slice(ls, le).split('\n').map(l => e.shiftKey ? (l.startsWith(L.tab) ? l.slice(L.tab.length) : l.replace(/^ {1,3}/, '')) : (l === '' ? l : L.tab + l)).join('\n');
          edit(ls, le, text, ls, ls + text.length);
        } else if (e.shiftKey) {
          const ls = ta.value.lastIndexOf('\n', s - 1) + 1;
          if (ta.value.startsWith(L.tab, ls)) edit(ls, ls + L.tab.length, '', Math.max(ls, s - L.tab.length));
        } else edit(s, t, L.tab, s + L.tab.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const s = ta.selectionStart;
        const ls = ta.value.lastIndexOf('\n', s - 1) + 1;
        const line = ta.value.slice(ls, s);
        let indent = (line.match(/^\s*/) || [''])[0];
        const trimmed = line.trim();
        if ((lang === 'python' && trimmed.endsWith(':')) || ((lang === 'cpp' || lang === 'java') && trimmed.endsWith('{')) || (lang === 'scheme' && trimmed.startsWith('(') && (trimmed.split('(').length > trimmed.split(')').length))) indent += L.tab;
        const insert = '\n' + indent;
        edit(s, ta.selectionEnd, insert, s + insert.length);
      } else if ((lang === 'cpp' || lang === 'java') && e.key === '}') {
        // dedent a lone closing brace
        const s = ta.selectionStart, ls = ta.value.lastIndexOf('\n', s - 1) + 1;
        if (/^\s+$/.test(ta.value.slice(ls, s)) && ta.value.slice(ls, s).length >= L.tab.length) {
          e.preventDefault();
          edit(ls, ta.selectionEnd, ta.value.slice(ls, s).slice(L.tab.length) + '}', s - L.tab.length + 1);
        }
      }
    });
    requestAnimationFrame(render);
    return {
      el: wrap,
      get value() { return ta.value; },
      set value(v) { if (v === ta.value) return; ta.value = v; ta.selectionStart = ta.selectionEnd = 0; record(null); render(); },
      focus: () => ta.focus(), render
    };
  }

  // ---------- runners ----------
  // Python and C++ programs run in sandboxes (a Web Worker each, src/runner.js), never in this page. Both return {out, err}:
  // the output so far, and the error in words a student can act on (or null).
  const Runners = {
    /** run(code, {stdin, execLimit, onOutput, onInput, turtle}) → Promise<{out, err}> */
    python: { run: (code, opts) => window.PYRUN.run(code, opts) },
    scheme: {
      run(code, opts) {
        opts = opts || {};
        const r = Scheme.runProgram(code, { onOutput: opts.onOutput, stdin: opts.stdin, stepLimit: opts.stepLimit });   // stdin and stepLimit: the Bot Arena feeds a bot its board and bounds its time
        return Promise.resolve(r);
      }
    },
    cpp: { run: (code, opts) => window.CPPRUN.run(code, opts) },
    java: { run: (code, opts) => window.JAVARUN.run(code, opts) },   // the site's own Java interpreter (src/java.js), in a worker like the others
    // Real C++ (Clang built for WebAssembly): see CLANGRUN in runner.js. Its first use downloads about 29 MB, so the student agrees to that first,
    // in a box shown in opts.host (the output panel or the verdict), where its progress is shown too.
    cppFull: {
      available: () => !window.CLANGRUN.unavailable(),
      run: (code, opts) => fullCpp((o) => window.CLANGRUN.run(code, o), opts),
      runMany: (code, stdins, opts) => fullCpp((o) => window.CLANGRUN.runMany(code, stdins, o), opts),
      compile: (code, opts) => fullCpp((o) => window.CLANGRUN.compile(code, o), opts)   // the terminal's g++: nothing runs
    }
  };
  async function fullCpp(go, opts) {
    opts = Object.assign({}, opts);
    const C = window.CLANGRUN, host = opts.host, none = (err) => ({ out: '', err, parts: [], notes: '', exit: 0 });
    const why = C.unavailable();
    if (why) return none('Full C++ is not available here: ' + why + '. The teaching engine still works.');
    if (!C.allowed()) {
      if (!host) return none('Full C++ needs to download its compiler first. Run a program in the Code Lab with Full C++ chosen to do that.');
      const yes = await new Promise((resolve) => {
        const box = el('div', { class: 'clang-gate' },
          el('p', {}, el('b', {}, 'Full C++ uses a real compiler. '), 'It runs in your browser, so nothing you write leaves this device, but the first time your browser has to download it: about ' + C.mb() + ' MB. After that it is kept on this device, and only this part of the site needs the internet.'),
          el('div', { class: 'toolbar' }, el('button', { class: 'btn primary', onclick: () => { C.allow(); box.remove(); resolve(true); } }, 'Download it and continue'), el('button', { class: 'btn quiet', onclick: () => { box.remove(); resolve(false); } }, 'Not now')));
        host.hidden = false; host.append(box);
      });
      if (!yes) return none('Not run: the compiler was not downloaded.');
    }
    const status = el('div', { class: 'clang-status', role: 'status' });
    const show = (st) => { status.textContent = st.state === 'loading' ? 'Getting the C++ compiler… ' + Math.round(st.v * 100) + '% (this happens the first time only)' : 'Compiling…'; };
    show(C.state());
    if (host) { host.hidden = false; host.append(status); }
    const unsub = C.subscribe(show);
    const userOut = opts.onOutput;
    try { return await go(Object.assign(opts, { onOutput: (t) => { status.remove(); if (userOut) userOut(t); } })); }
    finally { unsub(); status.remove(); }
  }
  window.__runners = Runners;

  // ---------- output panel ----------
  // The output panel is drawn as a terminal: a title bar with a status pill, a prompt line with the command that "ran", the program's
  // output (stderr in red, notes dimmed), a blinking cursor while the program runs, and input() answered on an inline prompt.
  // Everything written into it is text: output from a sandbox is never interpreted as HTML.
  const COMMANDS = { python: 'python main.py', scheme: 'scheme main.scm', cpp: 'g++ main.cpp -o main && ./main', cppfull: 'clang++ -std=c++20 main.cpp -o main && ./main', java: 'javac Main.java && java Main' };
  // A program waiting at input() is ended when its output panel is cleared or leaves the page; otherwise it would hold the engine's queue forever.
  const askers = new Set();
  const abandonAsk = (a) => { askers.delete(a); a.resolve(null); for (const k of ['PYRUN', 'JAVARUN', 'CPPRUN']) if (window[k]) window[k].cancel(); };
  document.addEventListener('routed', () => { for (const a of [...askers]) if (!a.row.isConnected) abandonAsk(a); });
  // opts.tools (the Code Lab): Copy, Wrap and Clear buttons in the title bar; opts.wrap the starting state of Wrap, opts.onWrap(on) to keep it.
  function outputPanel(opts) {
    opts = opts || {};
    const box = el('div', { class: 'out term', hidden: '' });
    const status = el('span', { class: 'term-status', role: 'status' });
    const bar = el('div', { class: 'term-bar' }, el('span', { class: 'term-title' }, 'Output'), status);
    const pre = el('pre', { class: 'out-text', tabindex: '0', 'aria-label': 'Program output' });
    const cursor = el('span', { class: 'term-cursor', 'aria-hidden': 'true' });
    box.append(bar, pre);
    let t0 = 0, printed = '', running = false;
    // what the panel shows, as text: without the "go to line" links, the input boxes and the cursor
    const shownText = () => { const c = pre.cloneNode(true); c.querySelectorAll('button, input, .term-cursor').forEach((n) => n.remove()); return c.textContent; };
    if (opts.tools) {
      const flash = (b, t) => { b.textContent = t; clearTimeout(b._t); b._t = setTimeout(() => { b.textContent = b.dataset.label; }, 1600); };
      const copyBtn = el('button', { class: 'term-tool', type: 'button', 'data-label': 'Copy', title: 'Copy the output to the clipboard', onclick: () => {
        const text = shownText();
        const fail = () => { const r = document.createRange(); r.selectNodeContents(pre); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); flash(copyBtn, 'Selected: press Ctrl+C'); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => flash(copyBtn, 'Copied'), fail); else fail();
      } }, 'Copy');
      const wrapBtn = el('button', { class: 'term-tool', type: 'button', title: 'Wrap long lines to fit the panel, or keep each line whole and scroll sideways', onclick: () => setWrap(box.classList.contains('nowrap')) }, 'Wrap');
      const setWrap = (on) => { box.classList.toggle('nowrap', !on); wrapBtn.setAttribute('aria-pressed', String(on)); if (opts.onWrap) opts.onWrap(on); };
      const clearBtn = el('button', { class: 'term-tool', type: 'button', title: 'Clear the output', onclick: () => {
        // while a program runs, its text goes but the program, its cursor and an input() it waits on stay; otherwise the panel closes
        if (running) { for (const n of [...pre.childNodes]) if (n !== cursor && !(n.classList && n.classList.contains('input-line'))) n.remove(); printed = ''; box.classList.remove('has-error'); }
        else api.hide();
      } }, 'Clear');
      box.classList.toggle('nowrap', opts.wrap === false); wrapBtn.setAttribute('aria-pressed', String(opts.wrap !== false));
      bar.append(el('span', { class: 'term-tools' }, copyBtn, wrapBtn, clearBtn));
    }
    const put = (node) => { if (cursor.parentNode === pre) pre.insertBefore(node, cursor); else pre.appendChild(node); box.hidden = false; pre.scrollTop = pre.scrollHeight; };
    const line = (cls, s) => { put(el('span', { class: cls }, s)); put(document.createTextNode('\n')); };
    const setStatus = (cls, text) => { status.className = 'term-status' + (cls ? ' ' + cls : ''); status.textContent = text; };
    const api = {
      el: box,
      clear() { for (const a of [...askers]) if (a.pre === pre) abandonAsk(a); pre.textContent = ''; printed = ''; running = false; box.hidden = false; box.classList.remove('has-error'); setStatus('', ''); },
      /** a run begins: the prompt line names the command, the status says running, the cursor blinks */
      start(cmd) { api.clear(); t0 = Date.now(); running = true; if (cmd) line('cmd', cmd); pre.appendChild(cursor); setStatus('running', 'running'); },
      /** a run ends: the cursor stops and the status pill says how it went */
      finish(info) {
        info = info || {}; running = false; if (cursor.parentNode === pre) pre.removeChild(cursor);
        for (const a of [...askers]) if (a.pre === pre) { askers.delete(a); a.row.replaceWith(el('span', {}, a.prompt, '\n')); a.resolve(null); }   // stopped while it waited for a line
        const secs = t0 ? ((Date.now() - t0) / 1000).toFixed(2) + ' s' : '';
        if (info.stopped) setStatus('fail', 'stopped' + (secs ? ' \u00b7 ' + secs : ''));
        else if (box.classList.contains('has-error')) setStatus('fail', 'error' + (secs ? ' \u00b7 ' + secs : ''));
        else setStatus('ok', 'exit ' + (info.exit || 0) + (secs ? ' \u00b7 ' + secs : ''));
      },
      write(s) { printed += s; put(document.createTextNode(s)); },
      value(s) { printed += s.replace(/^;Value: /, '') + '\n'; line('val', s); },
      /** what the program printed (and, for Scheme, the values it showed) since the run began: for comparing with a prediction */
      printed() { return printed; },
      /** the panel's text as shown (what Copy copies) */
      text: () => shownText(),
      failed() { return box.classList.contains('has-error'); },
      error(s) { line('err', s); box.classList.add('has-error'); },
      note(s) { line('note', s); },
      hide() { box.hidden = true; if (cursor.parentNode === pre) pre.removeChild(cursor); },
      /** inline input() prompt; returns a promise resolved with the typed line, or null for the end of the input (Ctrl+D) */
      ask(prompt) {
        return new Promise((resolve) => {
          const inp = el('input', { class: 'inline-input', type: 'text', 'aria-label': 'Program input', autocomplete: 'off', spellcheck: 'false' });
          const row = el('span', { class: 'input-line' }, prompt || '', inp);
          put(row); inp.focus();
          const a = { row, pre, resolve, prompt: prompt || '' }; askers.add(a);
          // Enter gives the line; Ctrl+D on an empty line is the end of the input, as in a terminal (a Java or C++ program reading until there is no more)
          inp.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { askers.delete(a); const v = inp.value; row.replaceWith(el('span', {}, prompt || '', el('span', { class: 'typed' }, v), '\n')); resolve(v); }
            else if (e.ctrlKey && (e.key === 'd' || e.key === 'D') && !inp.value) { e.preventDefault(); askers.delete(a); row.replaceWith(el('span', {}, prompt || '', el('span', { class: 'note' }, '^D'), '\n')); resolve(null); }
          });
        });
      }
    };
    return api;
  }

  const usesTurtle = (code) => /\b(import\s+turtle|from\s+turtle\s+import)\b/.test(code);
  async function runCell(lang, code, out, opts) {
    opts = opts || {};
    out.start(COMMANDS[lang === 'cpp' && opts.runtime === 'full' ? 'cppfull' : lang] || '');
    let exit = 0;
    try { exit = await runCellBody(lang, code, out, opts); } catch (e) { out.error(String(e && e.message || e)); }
    out.finish({ exit });
  }
  async function runCellBody(lang, code, out, opts) {
    if (lang === 'python') {
      // a program that draws gets a canvas in a sandboxed frame (src/runner.js), shown where opts.turtleMount is
      const turtle = opts.turtleMount && usesTurtle(code) ? (opts.turtleMount.hidden = false, { mount: opts.turtleMount, width: Math.min(480, opts.turtleMount.clientWidth || 480), height: 320 }) : undefined;
      if (opts.turtleMount && !turtle) { opts.turtleMount.hidden = true; opts.turtleMount.textContent = ''; }
      const r = await Runners.python.run(code, { onOutput: (s) => out.write(s), onInput: (p) => out.ask(p), stdin: opts.stdin, turtle });
      if (r.err) out.error(r.err);
      else if (!r.out && !turtle) out.note('(the program finished without printing anything)');
    } else if (lang === 'scheme') {
      const r = await Runners.scheme.run(code, { onOutput: (s) => out.write(s), stepLimit: 2e7 });   // the Lab's REPL limit, so an example behaves as it does there
      for (const res of r.results) {
        if (res.form instanceof Scheme.Pair && res.form.car === Scheme.sym('define')) out.value(';Value: ' + res.text);
        else if (res.text !== '') out.value(';Value: ' + res.text);
        else out.value(';Unspecified return value');
      }
      if (r.error) out.error(';' + r.error.replace(/^;/, ''));
    } else if (lang === 'cpp' && opts.runtime === 'full') {
      const r = await Runners.cppFull.run(code, { onOutput: (s) => out.write(s), onNote: (s) => out.note(s), stdin: opts.stdin, host: out.el });
      if (r.err) { out.error(r.err); const tip = tipFor('cppfull', r.err); if (tip) out.note('↳ ' + tip); }
      else if (!r.out) out.note('(the program finished without printing anything)');
      if (r.exit) out.note('(the program ended with status ' + r.exit + ')');
      return r.exit || 0;
    } else if (lang === 'cpp') {
      const r = await Runners.cpp.run(code, { onOutput: (s) => out.write(s), stdin: opts.stdin, onInput: /\b(scanf|getchar)\b/.test(code) ? undefined : (p) => out.ask(p) });   // no stdin given: typed as the program asks
      if (r.err) out.error(r.err);
      else if (!r.out) out.note('(the program finished without printing anything)');
    } else if (lang === 'java') {
      const r = await Runners.java.run(code, { onOutput: (s) => out.write(s), stdin: opts.stdin, onInput: (p) => out.ask(p) });
      if (r.err) { out.error(r.err); const tip = tipFor('java', r.err); if (tip) out.note('↳ ' + tip); }
      else if (!r.out) out.note('(the program finished without printing anything)');
    }
    return 0;
  }

  // ---------- grading ----------
  const AFFIRM = ['Correct — nicely done.', 'That works. Well reasoned.', 'Exactly right.', 'Yes — that is the solution.', 'Correct. On to the next one.', 'That passes every test.'];
  const TIPS = {
    python: [
      [/SyntaxError/, 'A syntax error means Python could not read the code. Check for a missing colon after if/for/def, unmatched parentheses or quotes, and consistent indentation.'],
      [/IndentationError|unexpected indent|bad input/, 'Check indentation: the body of a def, if, for or while must be indented by the same amount (4 spaces is standard).'],
      [/NameError: name '(\w+)'/, 'A NameError means a name was used before it was defined — often a typo, or a variable assigned only inside a branch that did not run.'],
      [/TypeError.*(concatenate|unsupported operand)/, 'You are mixing types, e.g. a string with a number. Convert with str(...) or int(...) first.'],
      [/TypeError.*not callable|object is not callable/, 'Something that is not a function is being called with (). Did you shadow a function name with a variable?'],
      [/IndexError/, 'An index went past the end of the list. Remember indices run from 0 to len(x) - 1.'],
      [/RecursionError|maximum recursion/, 'The function keeps calling itself without reaching a base case. Make sure the base case comes first and is reached.'],
      [/Time limit/, 'The loop never ends. Check that the loop variable changes each iteration and that the exit condition can become true.'],
      [/ZeroDivisionError/, 'A division by zero occurred. Guard against a zero divisor.'],
      [/AttributeError/, 'That object does not have that attribute/method. Check the type of the value and the method name spelling.']
    ],
    scheme: [
      [/Unbound variable: (\S+)/, 'An unbound variable means a name has no definition in scope. Check spelling, and that you defined it with (define ...) before using it.'],
      [/is not applicable/, 'The first item in a combination must be a procedure. A common cause is an extra pair of parentheses, e.g. ((f x)) applies the result of (f x).'],
      [/has been called with/, 'The procedure got the wrong number of arguments. Compare the call with the parameter list in the define.'],
      [/not the correct type/, 'A primitive received the wrong kind of value — e.g. car applied to something that is not a pair, or + applied to a list.'],
      [/missing a closing parenthesis/, 'The parentheses are unbalanced. Count opens and closes; the editor indents to help you see structure.'],
      [/extra closing parenthesis/, 'There is one closing parenthesis too many.'],
      [/ran for too long|recursion depth/, 'The recursion never reaches its base case, or the base case comes after a recursive call. Check the cond/if ordering and that the argument shrinks.']
    ],
    cpp: [
      [/Syntax error/, 'C++ could not parse the code. The usual culprits: a missing semicolon at the end of the previous line, unmatched braces, or a missing parenthesis.'],
      [/not defined|undefined variable|cannot find variable/i, 'A name is used before being declared. In C++ every variable and function must be declared before use, with a type.'],
      [/cast failed/, 'A value of one type is being stored in a variable of an incompatible type. Check that the types on both sides of = match.'],
      [/index out of bound/, 'An array index went past the array size. Valid indices are 0 to size - 1.'],
      [/you must return a value/, 'A function with a non-void return type reached its end without a return statement. Every path must return a value.'],
      [/Time limit/, 'The loop never ends. Check that the loop variable changes and the condition can become false.'],
      [/overflow/, 'An int cannot hold that value: it overflowed. Use long long for big numbers, or check the arithmetic.'],
      [/input format mismatch/, 'cin tried to read a value of one type but the input had something else (or nothing left).']
    ],
    // the Java checker's messages are javac's, so a student can look them up; the tips say what to do about them
    java: [
      [/';' expected/, 'A semicolon is missing. The line named is where Java noticed; look at the end of that line and of the one before it.'],
      [/'\)' expected|'\]' expected/, 'A closing bracket is missing. Count the opening and closing brackets on that line.'],
      [/reached end of file while parsing/, 'A closing brace } is missing: a method or class was opened and never closed. Check that every { has its }.'],
      [/class, interface, enum, or record expected/, 'In Java every statement and method lives inside a class. Make sure this code is inside  public class Main { ... }  and that no extra } closed the class early.'],
      [/cannot find symbol[\s\S]*symbol:\s+variable/, 'A name is used that Java does not know. Check the spelling and the capitals, and that the variable was declared, with a type, before this line and in the same block.'],
      [/cannot find symbol[\s\S]*symbol:\s+method/, 'No method with that name and those arguments exists. Check the spelling, the number and types of the arguments, and that the method is in this class (or called on the right object).'],
      [/cannot find symbol[\s\S]*symbol:\s+class/, 'Java does not know a class of that name. Check the spelling, and for library classes such as Scanner or ArrayList add  import java.util.*;  at the top.'],
      [/possible lossy conversion from (\w+) to (\w+)/, 'A value with a decimal part (or a larger type) is being stored where a smaller type is needed. Use a variable of the larger type, or cast on purpose: (int) x.'],
      [/incompatible types: (\w+) cannot be converted to boolean/, 'A condition must be true or false. Did you write = (assign) where == (compare) was meant?'],
      [/incompatible types: String cannot be converted to (int|double|char)/, 'Text is not a number. Convert it: Integer.parseInt(s) or Double.parseDouble(s); and remember that \'A\' is a char while "A" is a String.'],
      [/incompatible types/, 'A value of one type is being put where another type is needed. Check the types on both sides of the = (or the parameter type the method asks for).'],
      [/missing return statement/, 'A method that promises a value can reach its closing brace without a return. Every path through it, including after the loop or in the else, must return.'],
      [/non-static (variable|method) .* cannot be referenced from a static context/, 'main is static, so it can only use static things directly. Either make the method or variable static too, or create an object first and call it on that object.'],
      [/is already defined in/, 'A variable with this name already exists in this method. Give the new one another name, or reuse the old one without the type.'],
      [/bad operand type/, 'The operator does not work on those types. For example, + joins a String to anything, but true + 1 and "a" - "b" mean nothing.'],
      [/cannot be dereferenced/, 'A primitive value (int, double, char, boolean) has no methods. For text use a String; to compare numbers use ==.'],
      [/has private access in/, 'That field or method is private: only the class that declares it may use it. Add a public method (a getter or setter) to that class, or use one it already has.'],
      [/cannot be applied to given types/, 'The method exists but was given the wrong number or kinds of arguments. Compare the call with the method\'s parameter list.'],
      [/is not abstract and does not override abstract method/, 'The class promises (through an interface or an abstract parent) a method it does not provide. Write that method, with exactly that name, parameters and return type, and make it public.'],
      [/ArithmeticException: \/ by zero/, 'Division by zero: the divisor became 0 here. Check the values before dividing.'],
      [/ArrayIndexOutOfBoundsException: Index (-?\d+) out of bounds for length (\d+)/, 'The index is past the end of the array. Valid indices run from 0 to length - 1; a loop that goes to <= length goes one too far.'],
      [/StringIndexOutOfBoundsException/, 'The position is past the end of the string. Valid positions run from 0 to length() - 1.'],
      [/IndexOutOfBoundsException: Index (-?\d+) out of bounds for length (\d+)/, 'The position is past the end of the list. Valid positions run from 0 to size() - 1.'],
      [/NullPointerException/, 'A variable that holds no object (null) was used as if it did. Find where it should have been given a value with new, or a result that was never assigned.'],
      [/NumberFormatException/, 'Integer.parseInt or Double.parseDouble was given text that is not a number. Check what was read, or ask the user again.'],
      [/InputMismatchException/, 'The Scanner expected a number but the next word of the input was not one. Check what the program reads and what the input contains, in that order.'],
      [/NoSuchElementException/, 'The program tried to read more input than there was. Check how many values the input holds, or test hasNext() first.'],
      [/ClassCastException/, 'An object was cast to a type it is not. Check with instanceof before casting.'],
      [/StackOverflowError/, 'A method kept calling itself without reaching its base case, or the recursion is too deep. Make sure the base case comes first and is reached.'],
      [/ConcurrentModificationException/, 'A list was changed (add or remove) while a for-each loop was going through it. Collect what to remove first, or use an index loop that counts down.'],
      [/Time limit/, 'The program ran for too long. Check that every loop changes something that will end it.']
    ],
    // messages from the real compiler (Clang), for the programs that run with Full C++
    cppfull: [
      [/expected ';'|expected '\)'|expected '\}'|expected expression|expected unqualified-id/, 'The compiler could not read the code at that point. Look at the line it points to and at the one before it: a missing semicolon, an unmatched bracket or brace, or a misspelt keyword.'],
      [/use of undeclared identifier|undeclared identifier/, 'A name is used that the compiler has not seen. Check the spelling, that you declared it before using it, and that it is in scope. For a library name, check the #include and the std:: prefix.'],
      [/no member named|no type named/, 'That type has no such member or function. Check the spelling and the type of the object, and which header the type comes from.'],
      [/no matching function|no viable|candidate/, 'The call does not match any version of that function. Compare the arguments you pass (how many, and their types) with its declaration.'],
      [/cannot initialize|cannot convert|no viable conversion|incompatible/, 'A value of one type is being put where another type is needed. Check the types on both sides, and convert explicitly where it is meant.'],
      [/undefined reference|undefined symbol/, 'The program uses a function that was declared but never defined. Check that it has a body, and that main exists.'],
      [/non-const|binding reference|discards qualifiers/, 'A const value is being used where it may be changed. Either the parameter or variable should not be const, or the code should not change it.'],
      [/stopped abnormally/, 'The program was stopped by something it did that cannot continue: an out-of-range .at(), a failed assert, abort(), or recursion that never ends. Print values before the failing line to find where.'],
      [/Time limit/, 'The program ran for too long. Check that every loop changes something that will end it.']
    ]
  };
  function tipFor(lang, err) { for (const [re, tip] of TIPS[lang] || []) if (re.test(err)) return tip; return null; }
  const tipLang = (ex) => (ex.lang === 'cpp' && ex.runtime === 'full' ? 'cppfull' : ex.lang);
  const norm = (s) => String(s).replace(/\r/g, '').split('\n').map(l => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');

  /** Grade an exercise. Returns {passed, results:[{name, ok, expected, got, err}], error} */
  async function grade(ex, code, host) {
    const lang = ex.lang;
    if (ex.mustContain) for (const rule of ex.mustContain) if (!rule.re.test(code)) return { passed: false, results: [], error: rule.msg };
    if (ex.mustNotContain) for (const rule of ex.mustNotContain) if (rule.re.test(code)) return { passed: false, results: [], error: rule.msg };
    const results = [];
    if (lang === 'python') {
      const exprTests = ex.tests.filter(t => t.call !== undefined);
      const ioTests = ex.tests.filter(t => t.call === undefined);
      if (exprTests.length) {
        const M = '\x00GRADE\x00';
        const harness = '\n\nprint("' + M + '")\ndef __g(f):\n    try:\n        print("R:" + repr(f()))\n    except Exception as __e:\n        print("E:" + type(__e).__name__ + ": " + str(__e))\n' +
          exprTests.map(t => '__g(lambda: ' + t.call + ')\n').join('');
        const r = await Runners.python.run(code + harness, { stdin: '' });
        if (r.err && !r.out.includes(M)) return { passed: false, results, error: r.err };
        const lines = r.out.split(M + '\n')[1] ? r.out.split(M + '\n')[1].split('\n') : [];
        exprTests.forEach((t, i) => {
          const line = lines[i] || 'E: no result';
          const got = line.startsWith('R:') ? line.slice(2) : null;
          results.push({ name: t.call, expected: t.expect, got: got !== null ? got : line.slice(2), ok: got !== null && got === t.expect, err: got === null ? line.slice(2) : null });
        });
      }
      for (const t of ioTests) {
        const r = await Runners.python.run(code, { stdin: t.stdin || '' });
        results.push({ name: t.name || (t.stdin ? 'input: ' + JSON.stringify(t.stdin) : 'program output'), expected: t.expect, got: r.out, ok: !r.err && norm(r.out) === norm(t.expect), err: r.err, io: true });
      }
    } else if (lang === 'scheme') {
      const r = Scheme.runProgram(code);
      if (r.error) return { passed: false, results, error: r.error };
      for (const t of ex.tests) {
        if (t.call === undefined) {   // an input → output test (teacher assignments): the whole program's output
          results.push({ name: t.name || 'program output', expected: t.expect, got: r.output, ok: norm(r.output) === norm(t.expect), err: null, io: true });
          continue;
        }
        try {
          const outBefore = r.it.output.length;
          const v = r.it.evaluate(Scheme.parseAll(t.call)[0], r.it.G);
          const got = t.output ? r.it.output.slice(outBefore).join('') : Scheme.write(v);
          const exp = t.expect;
          results.push({ name: t.call, expected: exp, got, ok: norm(got) === norm(exp) });
        } catch (e) { results.push({ name: t.call, expected: t.expect, got: null, ok: false, err: e.message }); }
      }
    } else if (lang === 'cpp' && ex.runtime === 'full') {
      const h = window.CPPFULL.harness(ex, code);
      if (h.error) return { passed: false, results, error: h.error };
      const r = await Runners.cppFull.runMany(h.src, h.stdins, { host });
      if (r.err) return { passed: false, results, error: window.CPPFULL.shiftLines(r.err, h.shift) };
      ex.tests.forEach((t, i) => {
        const p = r.parts[i] || { out: '', err: 'did not run' };
        results.push({ name: t.name || (t.call !== undefined ? t.call : (t.stdin ? 'input: ' + JSON.stringify(t.stdin) : 'program output')), expected: t.expect, got: p.out, ok: !p.err && norm(p.out) === norm(t.expect), err: p.err, io: t.call === undefined });
      });
    } else if (lang === 'java') {
      // A compile error ends the check at once (as javac would); an exception in one test is that test's failure.
      for (const t of ex.tests) {
        let src = code, shift = 0;
        if (t.call !== undefined || t.main !== undefined) { const h = window.JAVAUTIL.harness(ex, code, t); if (h.error) return { passed: false, results, error: h.error }; src = h.src; shift = h.shift; }
        const r = await Runners.java.run(src, { stdin: t.stdin || '' });
        if (r.err && window.JAVAUTIL.isCompileError(r.err)) return { passed: false, results, error: window.JAVAUTIL.shiftLines(r.err, shift) };
        results.push({ name: t.name || (t.call !== undefined ? t.call : (t.stdin ? 'input: ' + JSON.stringify(t.stdin) : 'program output')), expected: t.expect, got: r.out, ok: !r.err && norm(r.out) === norm(t.expect), err: r.err ? window.JAVAUTIL.shiftLines(r.err, shift) : null, io: t.call === undefined });
      }
    } else if (lang === 'cpp') {
      for (const t of ex.tests) {
        let src = code;
        if (t.call !== undefined || t.main !== undefined) {
          const body = t.main !== undefined ? t.main : (t.setup || '') + '\n    cout << (' + t.call + ') << endl;';
          src = (ex.prelude || '#include <iostream>\nusing namespace std;\n') + '\n' + code + '\n\nint main() {\n' + body + '\n    return 0;\n}\n';
          if (/\bint\s+main\s*\(/.test(code)) return { passed: false, results, error: 'For this exercise write only the function — the checker supplies its own main() to call it.' };
        }
        const r = await Runners.cpp.run(src, { stdin: t.stdin || '' });
        const got = r.out;
        results.push({ name: t.name || (t.call !== undefined ? t.call : (t.stdin ? 'input: ' + JSON.stringify(t.stdin) : 'program output')), expected: t.expect, got, ok: !r.err && norm(got) === norm(t.expect), err: r.err, io: t.call === undefined });
      }
    }
    return { passed: results.length > 0 && results.every(x => x.ok), results, error: null };
  }

  // Confirmations happen in the button itself (click again to confirm) rather than in a confirm() dialog,
  // which embedded pages often cannot show.
  function armConfirm(btn, armedLabel, onYes) {
    if (btn.dataset.armed) { clearTimeout(+btn.dataset.timer); btn.textContent = btn.dataset.label; delete btn.dataset.armed; btn.classList.remove('armed'); onYes(); return; }
    btn.dataset.label = btn.textContent; btn.textContent = armedLabel; btn.dataset.armed = '1'; btn.classList.add('armed');
    btn.dataset.timer = setTimeout(() => { btn.textContent = btn.dataset.label; delete btn.dataset.armed; btn.classList.remove('armed'); }, 4000);
  }

  // ---------- exercise block ----------
  function exerciseBlock(ex, course, lessonIdx) {
    const affirm = (course && Array.isArray(course.affirm) && course.affirm.length) ? course.affirm : null;   // a course's own words for a pass
    const saved = Progress.getCode(ex.id);
    const done = Progress.isDone(ex.id);
    const box = el('section', { class: 'exercise' + (done ? ' done' : ''), id: ex.id });
    const head = el('header', { class: 'ex-head' }, el('h3', {}, el('span', { class: 'ex-label' }, 'Exercise'), ' ', ex.title), el('span', { class: 'ex-check', title: 'Completed' }, checkSVG()));
    box.append(head, el('div', { class: 'prose', html: ex.prompt }));
    const editor = makeEditor(ex.lang, saved != null ? saved : ex.starter, (v) => Progress.setCode(ex.id, v));
    const out = outputPanel();
    const verdict = el('div', { class: 'verdict', hidden: '', role: 'status' });
    let attempts = 0;
    const runBtn = el('button', { class: 'btn', onclick: () => { runCell(ex.lang, editor.value, out, { stdin: ex.sampleStdin, runtime: ex.runtime }); } }, 'Run');
    const checkBtn = el('button', { class: 'btn primary', onclick: async () => {
      checkBtn.disabled = true; checkBtn.textContent = 'Checking…'; attempts++;
      out.hide(); verdict.hidden = false; verdict.innerHTML = '';
      try {
        const r = await grade(ex, editor.value, verdict);
        renderVerdict(verdict, r, ex, attempts, affirm);
        if (r.passed) { box.classList.add('done'); Progress.markDone(ex.id, editor.value); document.dispatchEvent(new CustomEvent('progress-changed')); }
      } catch (e) {
        verdict.className = 'verdict fail'; verdict.append(el('p', { class: 'v-title' }, 'The checker failed unexpectedly: ' + (e && e.message || e)));
      }
      checkBtn.disabled = false; checkBtn.replaceChildren(lbl('check'));
    } }, lbl('check'));
    const resetBtn = el('button', { class: 'btn quiet', onclick: () => armConfirm(resetBtn, 'Reset to starter?', () => { resetBtn.classList.remove('armed'); editor.value = ex.starter; Progress.setCode(ex.id, ex.starter); verdict.hidden = true; out.hide(); }) }, 'Reset');
    let hintIdx = 0;
    const hintBox = el('div', { class: 'hints' });
    const hintBtn = el('button', { class: 'btn quiet', onclick: () => {
      if (hintIdx < ex.hints.length) { hintBox.appendChild(el('p', { class: 'hint' }, el('b', {}, 'Hint ' + (hintIdx + 1) + '. '), ex.hints[hintIdx])); hintIdx++; }
      hintBtn.textContent = hintIdx < ex.hints.length ? 'Hint (' + (ex.hints.length - hintIdx) + ' left)' : 'No more hints'; hintBtn.disabled = hintIdx >= ex.hints.length;
    } }, ex.hints && ex.hints.length ? 'Hint (' + ex.hints.length + ')' : 'No hints');
    if (!ex.hints || !ex.hints.length) hintBtn.disabled = true;
    const solBox = el('div', { class: 'solution', hidden: '' });
    const solBtn = el('button', { class: 'btn quiet', onclick: () => {
      const show = () => { solBtn.classList.remove('armed'); solBox.hidden = !solBox.hidden; if (!solBox.hidden && !solBox.childNodes.length) solBox.append(el('p', {}, el('b', {}, 'One solution. '), 'Compare it with your approach rather than copying it — there are usually several correct ways.'), el('pre', { class: 'code' }, el('code', { html: highlight(ex.solution, ex.lang) }))); };
      if (attempts < 2 && solBox.hidden) armConfirm(solBtn, 'Show before trying twice?', show); else show();
    } }, 'Solution');
    const labBtn = window.LAB ? el('button', { class: 'btn quiet lab-open', title: 'Work on this exercise in the Code Lab; it can be checked there too', onclick: () => window.LAB.openCode({ lang: ex.lang, code: editor.value, name: ex.id, ex: { id: ex.id, course: course.id, lesson: lessonIdx + 1 } }) }, 'Open in Code Lab') : null;
    box.append(editor.el, el('div', { class: 'toolbar' }, checkBtn, runBtn, resetBtn, el('span', { class: 'spacer' }), hintBtn, solBtn, labBtn), out.el, verdict, hintBox, solBox);
    return box;
  }
  // ---------- non-code exercises (answer / choice / table) ----------
  function mathExerciseBlock(ex, course) {
    const affirm = (course && Array.isArray(course.affirm) && course.affirm.length) ? course.affirm : null;
    const MG = window.MATHGRADE;
    let saved = null; try { saved = JSON.parse(Progress.getCode(ex.id) || 'null'); } catch (e) { saved = null; }
    const done = Progress.isDone(ex.id);
    const box = el('section', { class: 'exercise math-ex' + (done ? ' done' : ''), id: ex.id });
    const head = el('header', { class: 'ex-head' }, el('h3', {}, el('span', { class: 'ex-label' }, 'Exercise'), ' ', ex.title), el('span', { class: 'ex-check', title: 'Completed' }, checkSVG()));
    box.append(head, el('div', { class: 'prose', html: ex.prompt }));
    const form = el('div', { class: 'answer-form' });
    const inputs = [];   // functions returning current answers
    const persist = () => Progress.setCode(ex.id, JSON.stringify(read()));
    const read = () => inputs.map(f => f());
    const setAll = (vals) => inputs.forEach((f, i) => f.set(vals ? vals[i] : undefined));
    const mkInput = (i, placeholder, width) => {
      const inp = el('input', { class: 'ans', type: 'text', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Answer ' + (i + 1), placeholder: placeholder || '' });
      if (width) inp.style.width = width;
      inp.value = saved && saved[i] != null ? saved[i] : '';
      inp.addEventListener('input', persist);
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); checkBtn.click(); } });
      const f = () => inp.value; f.set = v => { inp.value = v == null ? '' : v; }; f.el = inp; inputs.push(f); return inp;
    };
    if (ex.kind === 'answer') {
      ex.parts.forEach((p, i) => {
        const row = el('label', { class: 'ans-row' });
        if (p.label) row.append(el('span', { class: 'ans-label', html: p.label }));
        row.append(mkInput(i, p.placeholder, p.width));
        if (p.unit) row.append(el('span', { class: 'ans-unit', html: p.unit }));
        form.append(row);
      });
    } else if (ex.kind === 'choice') {
      const name = 'ch-' + ex.id;
      const boxes = ex.options.map((o, i) => {
        const inp = el('input', { type: ex.multi ? 'checkbox' : 'radio', name, value: String(i) });
        if (saved && saved.flat().map(Number).includes(i)) inp.checked = true;
        inp.addEventListener('change', persist);
        form.append(el('label', { class: 'choice-row' }, inp, el('span', { class: 'choice-letter' }, String.fromCharCode(65 + i) + '.'), el('span', { class: 'choice-text', html: o.text }))); return inp;
      });
      const f = () => boxes.map((b, i) => b.checked ? i : -1).filter(i => i >= 0);
      f.set = v => boxes.forEach((b, i) => { b.checked = !!(v && v.map(Number).includes(i)); });
      inputs.push(f);
      // choice answers are one array, not one per input: wrap read/setAll accordingly
    } else if (ex.kind === 'table') {
      const t = el('table', { class: 'fill' });
      if (ex.head) t.append(el('thead', {}, el('tr', {}, ...ex.head.map(h => el('th', { html: h })))));
      const tb = el('tbody'); let k = 0;
      for (const row of ex.rows) tb.append(el('tr', {}, ...row.map(c => (c && typeof c === 'object') ? el('td', { class: 'blank' }, mkInput(k++, c.placeholder, c.width || '4.5rem')) : el('td', { html: c == null ? '' : String(c) }))));
      t.append(tb); form.append(el('div', { class: 'table-wrap' }, t));
    } else if (ex.kind === 'trace') {
      // the program, line by line and numbered, beside a table of steps; the line a blank asks about is lit up while it has focus
      const lang = ex.lang || (course && course.lang);
      const lineEls = String(ex.code).split('\n').map((ln, i) => el('span', { class: 'tr-line', 'data-line': String(i + 1) }, el('span', { class: 'tr-num', 'aria-hidden': 'true' }, String(i + 1)), el('span', { class: 'tr-code', html: highlight(ln, lang) || ' ' })));
      const listing = el('pre', { class: 'code trace-code', 'aria-label': 'The program, with line numbers' }, el('code', {}, lineEls));
      const light = (n) => lineEls.forEach((x) => x.classList.toggle('lit', x.dataset.line === String(n)));
      const T = MG.traceTable(ex);
      const t = el('table', { class: 'fill trace-table' }, el('thead', {}, el('tr', {}, ...T.head.map((h, i) => el('th', {}, i > 1 ? el('code', {}, h) : h)))));
      const tb = el('tbody'); let k = 0;
      T.rows.forEach((row, r) => tb.append(el('tr', {}, ...row.map((c, ci) => {
        if (c && typeof c === 'object') { const inp = mkInput(k++, '', '4rem'); inp.setAttribute('aria-label', 'Step ' + (r + 1) + ', after line ' + c.line + ': ' + T.head[ci]); inp.addEventListener('focus', () => light(c.line)); return el('td', { class: 'blank' }, inp); }
        return el('td', { class: ci === 1 ? 'tr-at' : '', onclick: ci === 1 ? () => light(c) : null }, c == null ? '' : String(c));
      }))));
      t.append(tb);
      form.append(el('div', { class: 'trace' }, listing, el('div', { class: 'table-wrap' }, t)));
    }
    const readAnswers = () => ex.kind === 'choice' ? inputs[0]() : read();
    const verdict = el('div', { class: 'verdict', hidden: '', role: 'status' });
    let attempts = 0;
    const checkBtn = el('button', { class: 'btn primary', onclick: () => {
      attempts++; verdict.hidden = false; verdict.innerHTML = '';
      const r = MG.grade(ex, readAnswers());
      renderMathVerdict(verdict, r, ex, attempts, affirm);
      if (r.passed) { box.classList.add('done'); Progress.markDone(ex.id, JSON.stringify(read())); document.dispatchEvent(new CustomEvent('progress-changed')); }
    } }, lbl('check'));
    const resetBtn = el('button', { class: 'btn quiet', onclick: () => armConfirm(resetBtn, 'Clear answers?', () => { resetBtn.classList.remove('armed'); ex.kind === 'choice' ? inputs[0].set([]) : setAll(null); persist(); verdict.hidden = true; }) }, 'Clear');
    let hintIdx = 0;
    const hintBox = el('div', { class: 'hints' });
    const hintBtn = el('button', { class: 'btn quiet', onclick: () => {
      if (hintIdx < ex.hints.length) { hintBox.appendChild(el('p', { class: 'hint' }, el('b', {}, 'Hint ' + (hintIdx + 1) + '. '), el('span', { html: ex.hints[hintIdx] }))); hintIdx++; }
      hintBtn.textContent = hintIdx < ex.hints.length ? 'Hint (' + (ex.hints.length - hintIdx) + ' left)' : 'No more hints'; hintBtn.disabled = hintIdx >= ex.hints.length;
    } }, ex.hints && ex.hints.length ? 'Hint (' + ex.hints.length + ')' : 'No hints');
    if (!ex.hints || !ex.hints.length) hintBtn.disabled = true;
    const solBox = el('div', { class: 'solution prose', hidden: '' });
    const solBtn = el('button', { class: 'btn quiet', onclick: () => {
      const show = () => { solBtn.classList.remove('armed'); solBox.hidden = !solBox.hidden; if (!solBox.hidden && !solBox.childNodes.length) solBox.append(el('p', {}, el('b', {}, 'Solution. '), 'Read it as a check on your reasoning, not just your answer.'), el('div', { html: ex.solution })); };
      if (attempts < 2 && solBox.hidden) armConfirm(solBtn, 'Show before trying twice?', show); else show();
    } }, 'Solution');
    box.append(form, el('div', { class: 'toolbar' }, checkBtn, resetBtn, el('span', { class: 'spacer' }), hintBtn, solBtn), verdict, hintBox, solBox);
    return box;
  }
  const pickAffirm = (affirm) => { const a = affirm || AFFIRM; return a[Math.floor(Math.random() * a.length)]; };
  function renderMathVerdict(v, r, ex, attempts, affirm) {
    if (r.error) { v.className = 'verdict fail'; v.append(el('p', { class: 'v-title' }, r.error)); return; }
    if (r.passed) {
      v.className = 'verdict pass';
      v.append(el('div', { class: 'v-pass' }, checkSVG(), el('div', {}, el('p', { class: 'v-title' }, pickAffirm(affirm)), el('p', { html: ex.followup || (r.results.length > 1 ? 'All ' + r.results.length + ' parts are right.' : 'That is the right answer.') }))));
      return;
    }
    v.className = 'verdict fail';
    const bad = r.results.filter(x => !x.ok);
    v.append(el('p', { class: 'v-title' }, r.results.length > 1 ? (r.results.length - bad.length) + ' of ' + r.results.length + ' parts right.' + (attempts >= 2 ? ' Keep going — the hints may help.' : '') : 'Not yet.' + (attempts >= 2 ? ' The hints may help.' : '')));
    const ul = el('ul', { class: 't-list' });
    for (const x of bad) ul.append(el('li', { class: 'bad' }, el('span', { class: 't-name' }, x.name + (x.got !== '' && x.got != null ? ': ' + x.got : '')), x.msg ? el('div', { class: 't-tip', html: x.msg }) : null));
    v.append(ul);
    if (!bad.some(x => x.msg) && ex.failTip) v.append(el('p', { class: 'v-tip', html: ex.failTip }));
  }
  function checkSVG() {
    const ns = 'http://www.w3.org/2000/svg';
    const s = document.createElementNS(ns, 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('class', 'checkmark');
    const c = document.createElementNS(ns, 'circle'); c.setAttribute('cx', 12); c.setAttribute('cy', 12); c.setAttribute('r', 11);
    const p = document.createElementNS(ns, 'path'); p.setAttribute('d', 'M6.5 12.5l3.5 3.5 7.5-8');
    s.append(c, p); return s;
  }
  function renderVerdict(v, r, ex, attempts, affirm) {
    if (r.error) {
      v.className = 'verdict fail';
      v.append(el('p', { class: 'v-title' }, 'Not yet — the code did not run.'), el('pre', { class: 'v-err' }, r.error));
      const tip = tipFor(tipLang(ex), r.error); if (tip) v.append(el('p', { class: 'v-tip' }, tip));
      return;
    }
    if (r.passed) {
      v.className = 'verdict pass';
      v.append(el('div', { class: 'v-pass' }, checkSVG(), el('div', {}, el('p', { class: 'v-title' }, pickAffirm(affirm)), el('p', {}, r.results.length + ' of ' + r.results.length + ' tests passed.' + (ex.followup ? ' ' + ex.followup : '')))));
      return;
    }
    v.className = 'verdict fail';
    const passed = r.results.filter(x => x.ok).length;
    v.append(el('p', { class: 'v-title' }, passed + ' of ' + r.results.length + ' tests passed.' + (attempts >= 2 ? ' Keep going — the hints may help.' : '')));
    const list = el('ul', { class: 'tests' });
    for (const t of r.results) {
      const li = el('li', { class: t.ok ? 'ok' : 'bad' });
      li.append(el('code', { class: 't-name' }, t.name));
      if (!t.ok) {
        if (t.err) { li.append(el('div', { class: 't-detail' }, 'raised an error: ', el('code', {}, t.err))); const tip = tipFor(tipLang(ex), t.err); if (tip) li.append(el('div', { class: 't-tip' }, tip)); }
        else if (t.io) li.append(el('div', { class: 't-io' }, el('div', {}, el('span', { class: 'lbl' }, 'expected output'), el('pre', {}, t.expected)), el('div', {}, el('span', { class: 'lbl' }, 'your output'), el('pre', {}, t.got === '' ? '(nothing)' : t.got))));
        else li.append(el('div', { class: 't-detail' }, 'expected ', el('code', {}, t.expected), ' but got ', el('code', {}, t.got === '' || t.got == null ? '(nothing)' : t.got)));
      }
      list.append(li);
    }
    v.append(list);
    const firstBad = r.results.find(x => !x.ok);
    if (firstBad && !firstBad.err && ex.failTip) v.append(el('p', { class: 'v-tip' }, ex.failTip));
  }

  // ---------- Parsons problems ----------
  // { kind: 'parsons', lines: [the solution, one string per line, indented with 4 spaces a level], distractors?: [lines that do not
  //   belong], tests?: as a code exercise, indent?: (default: true in Python, where indentation is part of the program), sampleStdin? }
  // The student builds the program from shuffled blocks, by clicking or from the keyboard, never only by dragging. With tests, the
  // program they built is run like a code exercise, so any order that works is accepted; without, the order and indentation must match
  // the solution. Same learning as writing the code, in less time (Ericson et al. 2017): the ramp between reading code and writing it.
  const P = () => window.PARSONS;   // the pure parts (src/parsons.js), shared with test_course.js
  const parsonsIndent = (ex) => P().indent(ex), parsonsBlocks = (ex) => P().blocks(ex), parsonsCode = (ex, blocks, placed) => P().code(ex, blocks, placed);
  const parsonsSolution = (ex) => P().solution(ex), parsonsProgram = (ex, saved) => P().program(ex, saved);
  /** Grades a built program (also used by the portfolio to re-check it). */
  async function parsonsGrade(ex, code) {
    if (ex.tests && ex.tests.length) return grade(Object.assign({}, ex, { kind: undefined }), code);
    const ok = P().orderOk(ex, code);
    return { passed: ok, results: [{ name: 'The order of the lines', ok, got: '', msg: ok ? '' : 'Some lines are not in the right place yet.' }] };
  }
  function parsonsBlock(ex, course) {
    const affirm = (course && Array.isArray(course.affirm) && course.affirm.length) ? course.affirm : null;
    const B = parsonsBlocks(ex), indent = parsonsIndent(ex);
    let placed = [];
    try { const s = JSON.parse(Progress.getCode(ex.id) || 'null'); if (s && Array.isArray(s.p)) placed = s.p.filter((x) => Array.isArray(x) && Number.isInteger(x[0]) && x[0] >= 0 && x[0] < B.blocks.length && Number.isInteger(x[1])).map(([b, n]) => [b, Math.max(0, Math.min(8, n))]).filter((x, i, a) => a.findIndex((y) => y[0] === x[0]) === i); } catch (e) { placed = []; }
    const box = el('section', { class: 'exercise parsons' + (Progress.isDone(ex.id) ? ' done' : ''), id: ex.id });
    box.append(el('header', { class: 'ex-head' }, el('h3', {}, el('span', { class: 'ex-label' }, 'Exercise'), ' ', ex.title), el('span', { class: 'ex-check', title: 'Completed' }, checkSVG())),
      el('div', { class: 'prose', html: ex.prompt }),
      el('p', { class: 'ps-how small' }, 'Click a block, or press Enter on it, to add it to your program. In your program, use the arrow buttons' + (indent ? ' (or Alt+↑ ↓ to move and ← → to indent)' : ' (or Alt+↑ ↓)') + ', and ✕ to put a block back.' + ((ex.distractors || []).length ? ' Not every block belongs in the program.' : '')));
    const pool = el('ul', { class: 'ps-pool', 'aria-label': 'Blocks to use' });
    const prog = el('ol', { class: 'ps-prog', 'aria-label': 'Your program' });
    const verdict = el('div', { class: 'verdict', hidden: '', role: 'status' });
    const out = outputPanel();
    const save = () => { Progress.setCode(ex.id, JSON.stringify({ p: placed })); };
    let marks = null;   // after a failed check in order mode: which positions are right
    const code = () => parsonsCode(ex, B.blocks, placed);
    function draw(focusAt, focusPool) {
      marks = null;
      pool.replaceChildren(...B.order.filter((b) => !placed.some((x) => x[0] === b)).map((b) => el('li', {}, el('button', { class: 'ps-block', type: 'button', onclick: () => { placed.push([b, indent ? 0 : B.blocks[b].indent]); save(); draw(null, true); } }, el('code', {}, B.blocks[b].text)))));
      if (!pool.children.length) pool.append(el('li', { class: 'ps-empty small' }, 'Every block is in your program.'));
      const shown = code().split('\n');
      prog.replaceChildren(...placed.map(([b, n], i) => {
        const move = (d) => { const j = i + d; if (j < 0 || j >= placed.length) return; [placed[i], placed[j]] = [placed[j], placed[i]]; save(); draw(j); };
        const ind = (d) => { if (!indent) return; placed[i][1] = Math.max(0, Math.min(8, n + d)); save(); draw(i); };
        const back = () => { placed.splice(i, 1); save(); draw(Math.min(i, placed.length - 1)); };
        const li = el('li', { class: 'ps-line', tabindex: '0', 'aria-label': 'Line ' + (i + 1) + (indent ? ', indented ' + n : '') + ': ' + B.blocks[b].text, onkeydown: (e) => {
          if (e.altKey && e.key === 'ArrowUp') { e.preventDefault(); move(-1); } else if (e.altKey && e.key === 'ArrowDown') { e.preventDefault(); move(1); }
          else if (indent && e.key === 'ArrowLeft') { e.preventDefault(); ind(-1); } else if (indent && e.key === 'ArrowRight') { e.preventDefault(); ind(1); }
          else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); back(); }
        } },
          el('code', { class: 'ps-text' }, shown[i]),
          el('span', { class: 'ps-tools' },
            el('button', { type: 'button', class: 'ps-tool', title: 'Move up', 'aria-label': 'Move up', onclick: () => move(-1), disabled: i === 0 ? '' : null }, '↑'),
            el('button', { type: 'button', class: 'ps-tool', title: 'Move down', 'aria-label': 'Move down', onclick: () => move(1), disabled: i === placed.length - 1 ? '' : null }, '↓'),
            indent ? el('button', { type: 'button', class: 'ps-tool', title: 'Indent less', 'aria-label': 'Indent less', onclick: () => ind(-1), disabled: n === 0 ? '' : null }, '←') : null,
            indent ? el('button', { type: 'button', class: 'ps-tool', title: 'Indent more', 'aria-label': 'Indent more', onclick: () => ind(1) }, '→') : null,
            el('button', { type: 'button', class: 'ps-tool', title: 'Put back', 'aria-label': 'Put back', onclick: back }, '✕')));
        return li;
      }));
      if (!placed.length) prog.append(el('li', { class: 'ps-empty small' }, 'Your program is empty: add blocks from the list.'));
      if (focusAt != null && prog.children[focusAt] && prog.children[focusAt].focus) prog.children[focusAt].focus();
      else if (focusPool) { const f = pool.querySelector('button'); if (f) f.focus(); }
    }
    let attempts = 0;
    const checkBtn = el('button', { class: 'btn primary', onclick: async () => {
      if (!placed.length) { verdict.hidden = false; verdict.className = 'verdict fail'; verdict.replaceChildren(el('p', { class: 'v-title' }, 'Add some blocks to your program first.')); return; }
      if (!indent) {   // braces that do not pair up give compiler errors about other things: say what is really wrong
        const t = code(), open = (t.match(/\{/g) || []).length, close = (t.match(/\}/g) || []).length;
        if (open !== close) { attempts++; verdict.hidden = false; verdict.className = 'verdict fail'; verdict.replaceChildren(el('p', { class: 'v-title' }, 'Not yet: every { needs a matching }.'), el('p', {}, 'Your program has ' + open + ' { and ' + close + ' }. Every block that opens with { closes with } further down.')); return; }
      }
      checkBtn.disabled = true; attempts++; out.hide(); verdict.hidden = false; verdict.className = 'verdict'; verdict.replaceChildren(el('p', { class: 'v-title' }, 'Checking…'));
      try {
        const program = code(), r = await parsonsGrade(ex, program);
        verdict.replaceChildren();
        if (ex.tests && ex.tests.length) renderVerdict(verdict, r, ex, attempts, affirm); else renderMathVerdict(verdict, r, ex, attempts, affirm);
        if (r.passed) { box.classList.add('done'); Progress.markDone(ex.id, program); document.dispatchEvent(new CustomEvent('progress-changed')); }
        else {
          if (placed.some(([b]) => !B.blocks[b].real)) verdict.prepend(el('p', { class: 'v-tip' }, 'One of the blocks in your program does not belong in it. Some blocks are there to look right and be wrong.'));
          if (!(ex.tests && ex.tests.length)) {   // order mode: show which lines are already in their place
            const want = parsonsSolution(ex).split('\n'), have = program.split('\n');
            [...prog.children].forEach((li, i) => li.classList.toggle('in-place', have[i] === want[i]));
            const k = have.filter((l, i) => l === want[i]).length;
            verdict.append(el('p', { class: 'v-tip' }, k + ' of ' + want.length + ' lines are in the right place (marked). ' + (have.length < want.length ? 'Some blocks are still missing.' : '')));
          }
        }
      } catch (e) { verdict.className = 'verdict fail'; verdict.append(el('p', { class: 'v-title' }, 'The checker failed unexpectedly: ' + (e && e.message || e))); }
      checkBtn.disabled = false;
    } }, lbl('check'));
    const runBtn = ex.tests && ex.tests.length ? el('button', { class: 'btn', onclick: () => runCell(ex.lang, code(), out, { stdin: ex.sampleStdin, runtime: ex.runtime }) }, 'Run') : null;
    const resetBtn = el('button', { class: 'btn quiet', onclick: () => armConfirm(resetBtn, 'Start again?', () => { resetBtn.classList.remove('armed'); placed = []; save(); verdict.hidden = true; out.hide(); draw(); }) }, 'Start again');
    let hintIdx = 0;
    const hintBox = el('div', { class: 'hints' });
    const hintBtn = el('button', { class: 'btn quiet', onclick: () => {
      if (hintIdx < ex.hints.length) { hintBox.appendChild(el('p', { class: 'hint' }, el('b', {}, 'Hint ' + (hintIdx + 1) + '. '), ex.hints[hintIdx])); hintIdx++; }
      hintBtn.textContent = hintIdx < ex.hints.length ? 'Hint (' + (ex.hints.length - hintIdx) + ' left)' : 'No more hints'; hintBtn.disabled = hintIdx >= ex.hints.length;
    } }, ex.hints && ex.hints.length ? 'Hint (' + ex.hints.length + ')' : 'No hints');
    if (!ex.hints || !ex.hints.length) hintBtn.disabled = true;
    const solBox = el('div', { class: 'solution', hidden: '' });
    const solBtn = el('button', { class: 'btn quiet', onclick: () => {
      const show = () => { solBtn.classList.remove('armed'); solBox.hidden = !solBox.hidden; if (!solBox.hidden && !solBox.childNodes.length) solBox.append(el('p', {}, el('b', {}, 'Solution. '), 'Compare it with yours line by line.'), el('pre', { class: 'code' }, el('code', { html: highlight(parsonsSolution(ex), ex.lang) }))); };
      if (attempts < 2 && solBox.hidden) armConfirm(solBtn, 'Show before trying twice?', show); else show();
    } }, 'Solution');
    box.append(el('div', { class: 'ps-board' }, el('div', { class: 'ps-col' }, el('p', { class: 'ps-head' }, 'Blocks'), pool), el('div', { class: 'ps-col' }, el('p', { class: 'ps-head' }, 'Your program'), prog)),
      el('div', { class: 'toolbar' }, checkBtn, runBtn, resetBtn, el('span', { class: 'spacer' }), hintBtn, solBtn), out.el, verdict, hintBox, solBox);
    draw();
    return box;
  }

  // ---------- playground block ----------
  function playgroundBlock(b) {
    const box = el('div', { class: 'play' });
    // with a prediction to make, the caption (which often gives the answer away) waits until after the run, and then explains it
    const cap = b.caption ? el('div', { class: 'play-cap' + (b.predict ? ' after-guess' : ''), hidden: b.predict ? '' : null }, el('span', { class: 'play-label' }, b.predict ? 'Why' : lbl('tryIt')), el('span', { html: b.caption })) : null;
    if (cap && !b.predict) box.append(cap);
    const editor = makeEditor(b.lang, b.code);
    const out = outputPanel();
    const turtleMount = b.lang === 'python' && usesTurtle(b.code) ? el('div', { class: 'play-turtle', hidden: '' }) : null;
    const guess = b.predict ? predictBox(b, editor, () => { if (cap) cap.hidden = false; }) : null;
    const run = () => runCell(b.lang, editor.value, out, { stdin: b.stdin, runtime: b.runtime, turtleMount });
    const runBtn = el('button', { class: 'btn primary', onclick: () => (guess ? guess.run(run, out) : run()) }, 'Run');
    const resetBtn = el('button', { class: 'btn quiet', onclick: () => { editor.value = b.code; out.hide(); } }, 'Reset');
    const labBtn = window.LAB ? el('button', { class: 'btn quiet lab-open', title: 'Copy this code into the Code Lab', onclick: () => window.LAB.openCode({ lang: b.lang, code: editor.value, name: b.labName, runtime: b.runtime }) }, 'Open in Code Lab') : null;
    const substBtn = window.LAB && window.SUBST && (b.lang === 'lisp' || b.lang === 'scheme') && !b.expectError ? el('button', { class: 'btn quiet lab-open mem-open', title: 'Open this program in the Code Lab and watch each expression being rewritten, one step of the substitution model at a time', onclick: () => window.LAB.openCode({ lang: b.lang, code: editor.value, name: b.labName, subst: true }) }, 'Show the substitution') : null;
    const memBtn = window.LAB && window.CPPSTEP && b.lang === 'cpp' && b.runtime !== 'full' ? el('button', { class: 'btn quiet lab-open mem-open', title: 'Open this program in the Code Lab and run it one line at a time, watching every variable, address and pointer', onclick: () => window.LAB.openCode({ lang: b.lang, code: editor.value, name: b.labName, step: true, stdin: b.stdin }) }, 'Step through memory') : window.LAB && window.JAVASTEP && b.lang === 'java' ? el('button', { class: 'btn quiet lab-open mem-open', title: 'Open this program in the Code Lab and run it one statement at a time, watching the call stack, the variables and the objects', onclick: () => window.LAB.openCode({ lang: b.lang, code: editor.value, name: b.labName, step: true, stdin: b.stdin }) }, 'Step through') : null;
    box.append(editor.el, ...(guess ? [guess.el] : []), el('div', { class: 'toolbar' }, runBtn, resetBtn, b.stdin != null ? el('span', { class: 'stdin-note' }, 'input provided: ', el('code', {}, JSON.stringify(b.stdin))) : null, el('span', { class: 'spacer' }), memBtn, substBtn, labBtn), ...[turtleMount, out.el, guess && guess.result, guess && cap].filter(Boolean));   // append() prints a null as text
    return box;
  }

  // Predict before you run ({ play, predict: true | 'question' }). Guessing first and then seeing the answer is how an example becomes
  // practice: a wrong guess, corrected at once, is remembered well (PRIMM; the prequestion and hypercorrection effects). The student
  // writes what they expect the program to print; the first run of the unchanged program then lays the guess beside what it printed,
  // line by line. Nothing is stored: the guess is part of reading the page. "Run without guessing" never blocks anyone, and in
  // classroom mode the class guesses aloud, so Run just runs.
  function predictBox(b, editor, reveal) {
    const id = 'guess-' + Math.random().toString(36).slice(2, 9);
    const area = el('textarea', { id, class: 'guess-text', rows: '3', spellcheck: 'false', autocomplete: 'off', placeholder: 'Type the output you expect, line by line' });
    const nudge = el('p', { class: 'guess-nudge', role: 'status', hidden: '' }, 'Write your guess first: even a wrong one helps you remember the answer.');
    const skip = el('button', { class: 'btn quiet guess-skip', type: 'button' }, 'Run without guessing');
    const box = el('div', { class: 'guess' }, el('label', { class: 'guess-q', for: id }, el('b', {}, 'Predict. '), typeof b.predict === 'string' ? b.predict : 'Before you run it: what will it print?'), area, nudge, el('div', { class: 'guess-row' }, skip));
    const result = el('div', { class: 'guess-result', hidden: '' });
    let done = false;
    const norm = (t) => String(t).replace(/\r/g, '').split('\n').map((l) => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '').replace(/^\n+/, '');
    async function runWith(run, out) {
      const classroom = window.CLASSROOM && window.CLASSROOM.isOn && window.CLASSROOM.isOn();
      if (done || classroom) { reveal(); return run(); }
      if (!area.value.trim()) { nudge.hidden = false; area.focus(); return; }
      done = true; nudge.hidden = true; area.readOnly = true; skip.hidden = true;
      const unchanged = editor.value === b.code, mine = norm(area.value);
      await run();
      reveal();
      if (!unchanged || out.failed()) { box.classList.add('locked'); return; }
      const real = norm(out.printed()), want = real.split('\n'), have = mine.split('\n');
      const right = want.filter((l, i) => have[i] !== undefined && have[i].trim() === l.trim()).length;
      const exact = mine === real || (right === want.length && have.length === want.length);
      result.textContent = '';
      const rows = el('ol', { class: 'guess-lines' });
      want.forEach((l, i) => {
        const ok = have[i] !== undefined && have[i].trim() === l.trim();
        rows.append(el('li', { class: ok ? 'ok' : 'bad' }, el('span', { class: 'gl-mark', 'aria-hidden': 'true' }, ok ? '✓' : '✗'), el('code', {}, l === '' ? ' ' : l),
          ok ? el('span', { class: 'sr-only' }, ' (as you predicted)') : el('span', { class: 'gl-yours' }, have[i] === undefined || have[i] === '' ? 'you expected no line here' : 'you wrote: ', have[i] ? el('code', {}, have[i]) : null)));
      });
      const extra = have.length - want.length;
      result.append(el('p', { class: 'guess-sum' }, exact ? el('b', {}, 'Exactly as you predicted. ') : el('b', {}, right + ' of ' + want.length + (want.length === 1 ? ' line' : ' lines') + ' as you predicted. '),
        exact ? 'Your picture of what the program does matches the computer’s.' : 'Look at the lines that differ: each one is a place where the program does something you did not expect, and that is exactly what is worth working out.' + (extra > 0 ? ' (You also expected ' + extra + ' more ' + (extra === 1 ? 'line' : 'lines') + ' than it printed.)' : '')), rows);
      result.hidden = false; box.classList.add('locked');
    }
    skip.addEventListener('click', () => { done = true; box.hidden = true; reveal(); box.closest('.play').querySelector('.toolbar .btn.primary').click(); });
    return { el: box, result, run: runWith };
  }

  // ---------- lesson rendering ----------
  // A quick check: one question, a few options, instant feedback, nothing saved. { check, options[], answer (index), why, wrong?[] }
  // Choosing an option only selects it; the student then says how sure they are, and that button checks the answer. Rating
  // confidence before the feedback is what makes the feedback land: a confident wrong answer, corrected, is remembered especially
  // well, and a lucky guess that turns out right is still worth reading the reason for (metacognition; the hypercorrection effect).
  // After the first answer the remaining options check at once, and in classroom mode (the class answers aloud) so does the first.
  const SURE = [['sure', 'Sure'], ['think', 'Think so'], ['guess', 'Guessing']];
  // hooks.onFirstAnswer(correct, sure) hears the first answer (review.js schedules it); hooks.onRight() hears when it is answered right.
  function checkBlock(b, hooks) {
    hooks = hooks || {};
    const box = el('div', { class: 'qc', role: 'group', 'aria-label': 'Quick check' });
    const why = el('p', { class: 'qc-why', role: 'status', hidden: '' });
    const opts = el('div', { class: 'qc-opts' });
    let chosen = -1, answered = false;
    const judge = (i, sure) => {
      chosen = -1; conf.hidden = true; btns.forEach((x) => x.classList.remove('chosen'));
      if (!answered && hooks.onFirstAnswer) { try { hooks.onFirstAnswer(i === b.answer, sure); } catch (e) { console.error(e); } }
      if (i === b.answer) {
        box.classList.add('done'); btns[i].classList.add('right'); btns.forEach((x) => { x.disabled = true; x.removeAttribute('aria-pressed'); });
        why.innerHTML = (sure === 'guess' ? '<b>Yes, though you were guessing.</b> Read why, so that next time you know it: ' : '<b>Yes.</b> ') + (b.why || '');
        if (hooks.onRight) setTimeout(hooks.onRight, 0);
      } else {
        btns[i].classList.add('wrong'); btns[i].disabled = true; btns[i].removeAttribute('aria-pressed');
        why.innerHTML = (sure === 'sure' ? '<b>Not that one, and you were sure.</b> That makes it the one most worth working out. ' : '<b>Not that one.</b> ') + (b.wrong && b.wrong[i] ? b.wrong[i] : 'Try another.');
      }
      answered = true; why.hidden = false;
    };
    const conf = el('div', { class: 'qc-sure', hidden: '' }, el('span', { class: 'qc-sure-q' }, 'How sure are you?'),
      ...SURE.map(([k, label]) => el('button', { class: 'qc-sure-btn', type: 'button', onclick: () => { if (chosen >= 0) judge(chosen, k); } }, label)));
    const btns = (b.options || []).map((o, i) => el('button', { class: 'qc-opt', type: 'button', 'aria-pressed': 'false', onclick: () => {
      if (box.classList.contains('done') || btns[i].disabled) return;
      const classroom = window.CLASSROOM && window.CLASSROOM.isOn && window.CLASSROOM.isOn();
      if (answered || classroom) { judge(i, null); return; }
      chosen = i; btns.forEach((x, k) => { x.classList.toggle('chosen', k === i); x.setAttribute('aria-pressed', String(k === i)); });
      conf.hidden = false;
    } }, el('span', { class: 'qc-letter' }, String.fromCharCode(65 + i)), el('span', { html: o })));
    opts.append(...btns);
    box.append(el('p', { class: 'qc-q', html: b.check }), opts, conf, why);
    return box;
  }
  // A picture from img/ (build.js puts its credits in BUILD.images): { photo: 'id' | ['id', 'id'], caption }. It loads lazily, shows who
  // made it and under which licence, and opens larger when tapped. If it cannot load (a copy opened from a file, or offline), a box
  // with its title and description takes its place.
  const IMAGES = (window.BUILD && window.BUILD.images) || {};
  const photoCredit = (m) => {
    const who = m.author && !/^unknown/i.test(m.author) ? m.author : (m.credit || 'Unknown');
    return el('span', { class: 'photo-credit' }, who + ' · ', m.licenseUrl ? el('a', { href: m.licenseUrl, target: '_blank', rel: 'noopener noreferrer' }, m.license) : m.license, ' · ', el('a', { href: m.source, target: '_blank', rel: 'noopener noreferrer' }, 'source'));
  };
  function zoomPhoto(m) {
    const close = () => { box.remove(); document.removeEventListener('keydown', onKey); if (opener) opener.focus(); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    const opener = document.activeElement;
    const shut = el('button', { class: 'photo-zoom-close', type: 'button', 'aria-label': 'Close the picture', onclick: close }, '×');
    const box = el('div', { class: 'photo-zoom', role: 'dialog', 'aria-modal': 'true', 'aria-label': m.title, onclick: (e) => { if (e.target === box) close(); } },
      el('figure', {}, el('img', { src: m.src, alt: m.alt, width: m.width, height: m.height }), el('figcaption', {}, el('b', {}, m.title), m.date ? ' (' + m.date + ')' : '', '. ', photoCredit(m))), shut);
    document.body.append(box); document.addEventListener('keydown', onKey); shut.focus();
  }
  function photoBlock(b) {
    const ids = Array.isArray(b.photo) ? b.photo : [b.photo];
    const row = el('div', { class: 'photo-row' + (ids.length > 1 ? ' several' : '') });
    for (const id of ids) {
      const m = IMAGES[id];
      if (!m) { row.append(el('div', { class: 'photo-missing' }, 'Picture not found: ' + id)); continue; }
      const img = el('img', { src: m.src, alt: m.alt, width: m.width, height: m.height, loading: 'lazy', decoding: 'async' });
      img.addEventListener('error', () => { btn.replaceWith(el('div', { class: 'photo-missing', role: 'img', 'aria-label': m.alt }, el('b', {}, m.title), el('span', {}, m.alt), el('span', { class: 'photo-note' }, 'The picture appears when the site is opened from its web address.'))); });
      const btn = el('button', { class: 'photo-open', type: 'button', title: 'Enlarge', 'aria-label': 'Enlarge the picture: ' + m.title, onclick: () => zoomPhoto(m) }, img);
      row.append(el('div', { class: 'photo-item', style: ids.length > 1 ? 'flex: ' + (m.width / m.height).toFixed(3) + ' 1 0' : null }, btn));
    }
    const credits = ids.map((id) => IMAGES[id]).filter(Boolean);
    return el('figure', { class: 'photo' }, row, el('figcaption', {}, b.caption ? el('span', { class: 'photo-caption', html: b.caption }) : null,
      el('span', { class: 'photo-credits' }, credits.map((m, i) => [i ? '; ' : null, credits.length > 1 ? m.title + ': ' : null, photoCredit(m)]))));
  }
  // Each kind of block gets a small label above it, so a reader can see what the next thing is before reading it.
  const tagged = (label, node, extraClass) => el('div', { class: 'blk' + (extraClass ? ' ' + extraClass : '') }, el('div', { class: 'blk-tag', 'aria-hidden': 'true' }, ...(Array.isArray(label) ? label : [label])), node);
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');   // from textContent: plain text, no tags to strip
  function renderBlocks(blocks, course, lessonIdx, parts) {
    const frag = document.createDocumentFragment(); let playCount = 0, exCount = 0, checkCount = 0, firstEx = true, firstProse = true;
    const part = (id, title, kind) => { if (parts) parts.push({ id, title, kind }); };
    for (const b of blocks) {
      if (typeof b === 'string') {
        const d = el('div', { class: 'prose', html: b });
        if (firstProse) { firstProse = false; const first = d.firstElementChild; if (first && first.tagName === 'P') { d.id = 'part-story'; part('part-story', 'Story', 'story'); } }
        d.querySelectorAll('h2').forEach((h) => { if (!h.id) h.id = 'sec-' + slug(h.textContent); part(h.id, h.textContent, 'section'); });
        const recap = d.querySelector('.recap'); if (recap) { recap.id = 'part-recap'; part('part-recap', 'Recap', 'recap'); if (window.REVIEW && blocks.some((x) => x && x.check)) recap.append(el('p', { class: 'recap-return small' }, 'Coming back: the quick checks you answered in this lesson return in ', el('a', { href: '#/today' }, 'Today\u2019s review'), ' tomorrow, then after 3, 10, 30 and 90 days.')); }
        frag.append(d);
      }
      else if (b.check) { checkCount++; frag.append(tagged('Quick check ' + checkCount, checkBlock(b, { onFirstAnswer: (ok, sure) => window.REVIEW && window.REVIEW.fromLesson(course, b, ok, sure) }), 'blk-check')); }
      else if (b.play && (b.lang || course.lang) === 'shell' && window.TERMINAL) { playCount++; frag.append(tagged(['Example ' + playCount, ' · ', lbl('tryIt')], window.TERMINAL.playBlock(b, course), 'blk-play')); }
      else if (b.play) { playCount++; frag.append(tagged(['Example ' + playCount, ' · ', lbl('tryIt')], playgroundBlock({ lang: b.lang || course.lang, code: b.play, caption: b.caption, stdin: b.stdin, expectError: b.expectError, predict: b.predict, runtime: b.runtime || course.runtime, labName: course.id + '-lesson' + (lessonIdx + 1) + '-example' + playCount }), 'blk-play')); }
      else if (b.ex) {
        b.ex.lang = b.ex.lang || course.lang; b.ex.runtime = b.ex.runtime || course.runtime; exCount++;
        const node = window.MATHGRADE && window.MATHGRADE.isMath(b.ex) ? mathExerciseBlock(b.ex, course) : b.ex.kind === 'parsons' ? parsonsBlock(b.ex, course) : b.ex.kind === 'shell' && window.TERMINAL ? window.TERMINAL.exerciseBlock(b.ex, course, lessonIdx) : exerciseBlock(b.ex, course, lessonIdx);
        const wrap = tagged('Exercise ' + exCount, node, 'blk-ex');
        if (firstEx) { firstEx = false; wrap.id = 'part-exercises'; part('part-exercises', 'Exercises', 'exercises'); }
        frag.append(wrap);
      }
      else if (b.fig) {
        const wrap = el('figure', { class: 'fig' + (b.wide ? ' wide' : '') });
        const mount = el('div', { class: 'fig-mount' });
        wrap.append(mount);
        if (b.caption) wrap.append(el('figcaption', { html: b.caption }));
        const quiz = b.fig === 'blockquiz';
        const t = tagged(quiz ? 'Quiz' : 'Interactive', wrap, quiz ? 'blk-quiz' : 'blk-fig');
        if (quiz) { t.id = 'part-quiz'; part('part-quiz', 'Quiz', 'quiz'); }
        frag.append(t);
        const W = window.WIDGETS && window.WIDGETS[b.fig];
        if (W) { try { W(mount, b, course); } catch (e) { mount.textContent = 'Figure failed to render: ' + e.message; console.error(e); } }
        else mount.textContent = 'Unknown figure ' + b.fig;
      }
      else if (b.code) frag.append(tagged('Listing', el('pre', { class: 'code' + (b.caption ? ' captioned' : '') }, b.caption ? el('span', { class: 'code-cap' }, b.caption) : null, el('code', { html: highlight(b.code, b.lang || course.lang) })), 'blk-code'));
      else if (b.aside) frag.append(tagged('Watch out', el('aside', { class: 'aside', html: b.aside }), 'blk-aside'));
      else if (b.photo) frag.append(tagged(Array.isArray(b.photo) && b.photo.length > 1 ? 'Pictures' : 'Picture', photoBlock(b), 'blk-photo'));
    }
    if (parts) parts.counts = { plays: playCount, checks: checkCount, exercises: exCount, figs: blocks.filter((x) => x.fig && x.fig !== 'blockquiz').length };
    return frag;
  }
  // The map of a lesson: its parts in order (story, sections, quiz, exercises, recap) as links, and what it contains.
  // Sections are numbered, matching the numbers the page puts on the headings.
  const partTitle = (parts, p) => p.kind === 'section' ? (parts.filter((q) => q.kind === 'section').indexOf(p) + 1) + '. ' + p.title : p.title;
  // A link to one part of a lesson: a click scrolls; a new tab or a copied link opens the lesson at that part.
  const partLink = (course, idx, p, text) => el('a', { href: '#/' + course.id + '/' + (idx + 1) + '/' + p.id, onclick: (e) => { if (e.button || e.ctrlKey || e.metaKey || e.shiftKey) return; e.preventDefault(); const t = document.getElementById(p.id); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, text);
  function lessonMap(parts, course, idx) {
    const n = parts.counts || {};
    const bits = [];
    if (n.plays) bits.push(n.plays + (n.plays === 1 ? ' example' : ' examples'));
    if (n.figs) bits.push(n.figs + ' interactive');
    if (n.checks) bits.push(n.checks + (n.checks === 1 ? ' quick check' : ' quick checks'));
    if (n.exercises) bits.push(n.exercises + (n.exercises === 1 ? ' exercise' : ' exercises'));
    return el('nav', { class: 'lesson-map', 'aria-label': 'Parts of this lesson' },
      el('ol', {}, parts.map((p) => el('li', { class: 'map-' + p.kind }, partLink(course, idx, p, partTitle(parts, p))))),
      bits.length ? el('p', { class: 'map-counts' }, bits.join(' · ')) : null);
  }
  // The "on this page" list in the side column follows the reader: the part in view is marked.
  function watchParts(parts, listEl) {
    if (!('IntersectionObserver' in window)) return;
    const items = new Map(parts.map((p, i) => [p.id, listEl.children[i]]));
    const seen = new Map();
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) seen.set(en.target.id, en.isIntersecting ? en.boundingClientRect.top : null);
      let best = null;
      for (const p of parts) { const top = seen.get(p.id); if (top !== null && top !== undefined && (best === null || top < best.top)) best = { id: p.id, top }; }
      if (!best) { let last = null; for (const p of parts) { const t = document.getElementById(p.id); if (t && t.getBoundingClientRect().top < 80) last = p.id; } best = last ? { id: last } : null; }
      items.forEach((li, id) => li.classList.toggle('current', !!best && id === best.id));
    }, { rootMargin: '-10% 0px -70% 0px', threshold: 0 });
    parts.forEach((p) => { const t = document.getElementById(p.id); if (t) io.observe(t); });
  }

  // Ojibwe labels (src/ojibwe.js): the Ojibwe word with its English beside it; plain English if ojibwe.js is absent.
  const OJ = () => window.OJIBWE;
  const lbl = (key, suffix) => OJ() ? OJ().label(key, suffix) : ({ lessons: 'Lessons', lesson: 'Lesson', tryIt: 'Try it', check: 'Check answer', thanks: 'Thank you' }[key] || key) + (suffix || '');

  // ---------- pages ----------
  const SITE = window.SITE, COURSES = window.COURSES;
  function courseById(id) { return COURSES.find(c => c.id === id); }
  function exerciseIds(lesson) { return lesson.blocks.filter(b => b.ex).map(b => b.ex.id); }
  // Estimated minutes for a lesson, from what it contains: reading at course.readingWpm words a minute (130 by
  // default; the mathematics course sets 60, because definitions and proofs need slow reading), 2.5 minutes for
  // each example to run and change, 2 per figure, 1 per predict-then-reveal box, and 10 per code exercise or 12 per
  // non-code exercise. It is a planning guide for teachers, not a measurement. Lessons over LONG_LESSON are marked.
  const LONG_LESSON = 65;
  function lessonMinutes(course, L) {
    const words = (h) => (String(h || '').replace(/<(pre|code)[^>]*>[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&\w+;/g, ' ').match(/[A-Za-z0-9'\u2019]+/g) || []).length;
    let w = words(L.summary), t = 0;
    for (const b of L.blocks) {
      if (typeof b === 'string') { w += words(b); t += (b.match(/<details class="reveal"/g) || []).length; }
      else if (b.play) { w += words(b.caption); t += 2.5; }
      else if (b.code) w += words(b.caption);
      else if (b.fig) { w += words(b.caption); t += 2; }
      else if (b.photo) { w += words(b.caption); t += 0.3; }
      else if (b.aside) w += words(b.aside);
      else if (b.check) { w += words(b.check) + words((b.options || []).join(' ')); t += 0.5; }
      else if (b.ex) { w += words(b.ex.title) + words(b.ex.prompt); t += b.ex.kind === 'parsons' ? 5 : b.ex.kind === 'trace' ? 6 : b.ex.kind ? 12 : 10; }
    }
    return Math.round(w / (course.readingWpm || 130) + t);
  }
  const about5 = (m) => Math.round(m / 5) * 5;
  // courses still being written carry status: 'developing'; the tag says so wherever the course is named
  const devTag = (course, small) => (course.status === 'developing' ? el('span', { class: 'dev-tag' + (small ? ' sm' : ''), title: 'This course is being written: more lessons are on the way, and what is here may change.' }, 'Under development') : null);
  function courseProgress(course) { const ids = course.lessons.flatMap(exerciseIds); return { done: ids.filter(id => Progress.isDone(id)).length, total: ids.length }; }

  function topBar(course) {
    return el('nav', { class: 'top' },
      el('a', { class: 'top-name', href: '#/' }, SITE.name),
      el('div', { class: 'top-links' },   // a link per course crowded the bar: the courses have their own page, grouped (coursesPage)
        el('a', { href: '#/courses', class: 'courses-link' + (course === 'courses' || (course && course.id) ? ' current' : '') }, 'Courses'),
        window.ALGOS ? el('a', { href: '#/algorithms', class: 'algos-link' + (course === 'algorithms' ? ' current' : '') }, 'Algorithms') : null,
        window.APPLIED ? el('a', { href: '#/real-world', class: 'applied-link' + (course === 'applied' ? ' current' : '') }, 'Real world') : null,
        window.ARENA && window.ARENA.page ? el('a', { href: '#/arena', class: 'arena-link-top' + (course === 'arena' ? ' current' : '') }, 'Arena') : null,   // write a bot that plays Tron (src/arena.js)
        el('a', { href: '#/lab', class: 'lab-link' + (course === 'lab' ? ' current' : '') }, 'Code Lab'),
        window.REVIEW ? window.REVIEW.topLink(course === 'today') : null),   // appears once there is something to review (src/review.js)
      el('div', { class: 'top-tools' },   // the three small controls sit close together so the links keep their room
        window.TOUR ? window.TOUR.button() : null,   // a guided tour of the site (src/tour.js)
        window.CLASSROOM ? window.CLASSROOM.button() : null,
        el('button', { class: 'theme-btn', title: 'Toggle light/dark', 'aria-label': 'Toggle light/dark', onclick: toggleTheme }, themeIcon())));
  }
  function themeIcon() {
    return el('span', { html: '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 2.5v15A7.5 7.5 0 0 0 10 2.5z" fill="currentColor"/></svg>' });
  }
  function toggleTheme() {
    const root = document.documentElement;
    const cur = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('shortcourses.theme', next); } catch (e) { }
  }
  (function initTheme() { try { const t = localStorage.getItem('shortcourses.theme'); if (t) document.documentElement.setAttribute('data-theme', t); } catch (e) { } })();

  // The catalogue, in groups, so a reader can find the kind of course they want. A course missing from every group is listed under
  // "More courses", so a new course is never hidden.
  const COURSE_GROUPS = [
    { id: 'start', title: 'Start here', blurb: 'No experience needed: what a computer is, the jump from Scratch blocks to typed code, and the command line.', ids: ['computer', 'scratch', 'shell'] },
    { id: 'languages', title: 'Programming languages', blurb: 'Learn to program in one language, then see the same ideas in others: each course is a complete introduction.', ids: ['python', 'java', 'cpp', 'modern', 'lisp'] },
    { id: 'cs', title: 'Computer science', blurb: 'The ideas under every program: the mathematics of computing, how to arrange data so programs are fast, and how machines learn.', ids: ['math', 'dsa', 'ml'] },
  ];
  // The official logos of the languages (BUILD.icons, from img/icons/). Decorative: the name is always written beside them.
  const ICONS = (window.BUILD && window.BUILD.icons) || {};
  const COURSE_ICONS = { scratch: ['scratch', 'python'], python: ['python'], lisp: ['scheme'], cpp: ['cpp'], modern: ['cpp'], java: ['java'], dsa: ['java'], shell: ['shell'], ml: ['python'] };
  const langIcon = (id, cls) => ICONS[id] ? el('img', { class: 'lang-icon lang-' + id + (cls ? ' ' + cls : ''), src: ICONS[id].src, alt: '', title: ICONS[id].title }) : null;
  const courseIcons = (c, cls) => { const ids = (COURSE_ICONS[c.id] || []).filter((i) => ICONS[i]); return ids.length ? el('span', { class: 'course-icons' + (cls ? ' ' + cls : ''), 'aria-hidden': 'true' }, ids.map((i) => langIcon(i))) : null; };
  function catalogItem(c) {
    const p = courseProgress(c);
    return el('li', { 'data-course': c.id },
      el('a', { class: 'cat-code', href: '#/' + c.id }, c.code),
      el('div', { class: 'cat-body' },
        el('a', { class: 'cat-title', href: '#/' + c.id }, c.title), courseIcons(c, 'cat-icons'), devTag(c, true),
        el('p', { class: 'cat-desc' }, c.tagline),
        c.grades ? el('p', { class: 'cat-grades' }, c.grades) : null,
        el('p', { class: 'cat-meta' }, c.lessons.length + ' lessons · ' + p.total + ' graded exercises' + (p.done ? ' · ' + p.done + ' completed' : ''))));
  }
  function courseGroups() {
    const placed = new Set(COURSE_GROUPS.flatMap((g) => g.ids));
    const groups = COURSE_GROUPS.map((g) => Object.assign({}, g, { courses: g.ids.map(courseById).filter(Boolean) }));
    const rest = COURSES.filter((c) => !placed.has(c.id));
    if (rest.length) groups.push({ id: 'more', title: 'More courses', blurb: '', courses: rest });
    return groups.filter((g) => g.courses.length);
  }
  function groupedCatalog(filter) {
    const q = (filter || '').trim().toLowerCase();
    const match = (c) => !q || [c.code, c.title, c.short, c.tagline, c.grades].join(' ').toLowerCase().includes(q);
    const out = [];
    for (const g of courseGroups()) {
      const cs = g.courses.filter(match);
      if (!cs.length) continue;
      out.push(el('section', { class: 'course-group', id: 'group-' + g.id },
        el('h3', { class: 'group-title' }, g.title, el('span', { class: 'group-count' }, cs.length + (cs.length === 1 ? ' course' : ' courses'))),
        g.blurb ? el('p', { class: 'group-blurb' }, g.blurb) : null,
        el('ul', { class: 'catalog' }, cs.map(catalogItem))));
    }
    if (!out.length) out.push(el('p', { class: 'group-empty' }, 'No course matches \u201c' + filter + '\u201d.'));
    return out;
  }
  function coursesPage() {
    const main = el('main', { class: 'home courses-page' });
    const results = el('div', { class: 'course-groups' });
    const show = () => { results.replaceChildren(...groupedCatalog(search.value)); };
    const search = el('input', { type: 'search', class: 'course-search', placeholder: 'Find a course: a language, a topic, a grade', 'aria-label': 'Find a course', oninput: show });
    const jump = el('nav', { class: 'group-jump', 'aria-label': 'Groups of courses' }, courseGroups().map((g) => el('a', { href: '#group-' + g.id, onclick: (e) => { e.preventDefault(); search.value = ''; show(); const t = document.getElementById('group-' + g.id); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, g.title)));
    main.append(
      el('header', { class: 'courses-head' }, el('h1', {}, 'Courses'), (() => {   // the first paragraph; the advice on where to start folds away
        const intro = el('div', { class: 'prose', html: SITE.coursesIntro }), rest = [...intro.children].slice(1);
        if (rest.length) intro.append(el('details', { class: 'reveal which-course' }, el('summary', {}, 'Which course should I take?'), ...rest));
        return intro;
      })()),
      el('div', { class: 'courses-tools' }, search, jump),
      results);
    show();
    return main;
  }

  function homePage() {
    const main = el('main', { class: 'home' });
    main.append(
      el('section', { class: 'hero' },
        el('div', { class: 'intro' },
          OJ() ? el('p', { class: 'oj-greet' }, OJ().label('greeting')) : null,
          el('h1', {}, SITE.name),
          SITE.role ? el('p', { class: 'role' }, SITE.role) : null,
          OJ() && OJ().clock ? OJ().clock({ links: true }) : null,
          SITE.contact && SITE.contact.length ? el('p', { class: 'contact' }, SITE.contact.map((c, i) => [i ? ' · ' : null, c.href ? el('a', { href: c.href }, c.label) : el('span', {}, c.label)])) : null
        )),
      el('section', { class: 'section' },
        el('h2', {}, 'Short courses'),
        el('div', { class: 'prose', html: SITE.coursesIntro }),
        el('div', { class: 'course-groups' }, groupedCatalog('')),
        el('p', { class: 'more-pages' }, el('a', { href: '#/courses' }, 'All courses, with search'),
          window.ALGOS ? [' · ', el('a', { href: '#/algorithms' }, 'Algorithms in motion')] : null,
          window.APPLIED ? [' · ', el('a', { href: '#/real-world' }, 'Where this is used in the real world')] : null,
          window.STANDARDS ? [' · ', el('a', { href: '#/standards' }, 'Standards alignment')] : null)
      ),
      el('section', { class: 'section' },
        el('h2', {}, 'Code Lab'),
        el('ul', { class: 'catalog' }, el('li', { 'data-course': 'lab' },
          el('a', { class: 'cat-code', href: '#/lab' }, 'LAB'),
          el('div', { class: 'cat-body' },
            el('a', { class: 'cat-title', href: '#/lab' }, 'Code Lab: a sandbox for your own programs'),
            el('p', { class: 'cat-desc' }, 'A full editor for Python, C++, Java and Scheme that runs entirely in your browser: nothing to install, nothing to sign up for. Files and multi-file Java projects, templates, a quick reference, step-through debuggers for Python, Java and C++ (with memory), a turtle canvas, a Scheme REPL, and a terminal with a practice shell, git, and interactive Python, Scheme and Java.'),
            el('p', { class: 'cat-meta' }, 'Your files are saved on this device. Share a program with a link.'))))
      ),
      window.PORTFOLIO ? el('section', { class: 'section' },
        el('h2', {}, 'Your work'),
        el('div', { class: 'prose' }, el('p', {}, (() => { const n = Object.keys(Progress.load().done).length; return n ? 'You have completed ' + n + ' exercise' + (n === 1 ? '' : 's') + ' on this device. ' : 'Every exercise you complete is saved on this device. '; })(), el('a', { href: '#/portfolio' }, 'Make a portfolio'), ' to print your work, keep it as a web page, or send it to your teacher as a link.')),
        window.BACKUP ? window.BACKUP.panel() : null
      ) : document.createDocumentFragment(),
      el('section', { class: 'section' },
        el('h2', {}, 'For teachers'),
        el('div', { class: 'prose' }, el('p', {}, 'Running a class with this site? ', el('a', { href: '#/guide' }, 'Read the guide for teachers'), ': how the lessons are built, a plan for an hour of coding, the Code Lab, and how to set assignments and collect students\u2019 work with nothing to install and no accounts.'))
      ),
      el('footer', { class: 'foot' }, el('span', {}, SITE.footer), el('span', { class: 'foot-links' }, window.ABOUT ? [el('a', { href: '#/about' }, 'About and credits'), ' \u00b7 '] : null, window.STANDARDS ? [el('a', { href: '#/standards' }, 'Standards'), ' \u00b7 '] : null, el('button', { class: 'linklike', onclick: (e) => armConfirm(e.currentTarget, 'Clear all saved progress and code? (Save it to a file first if you want it back.) Click again to confirm', () => { Progress.reset(); if (window.REVIEW) window.REVIEW.reset(); route(); }) }, 'Reset my progress')))
    );
    return main;
  }

  function coursePage(course) {
    const main = el('main', { class: 'course' });
    const p = courseProgress(course);
    main.append(
      el('header', { class: 'course-head' },
        el('div', { class: 'course-code' }, course.code, courseIcons(course, 'head-icons')),
        el('div', {},
          el('h1', {}, course.title, devTag(course)),
          el('p', { class: 'tagline' }, course.tagline))),
      el('div', { class: 'course-grid' },
        el('div', { class: 'course-main' },
          el('div', { class: 'prose', html: course.description }),
          window.REVIEW ? window.REVIEW.coursePanel(course) : null,
          el('h2', {}, lbl('lessons')),
          el('ol', { class: 'lessons' }, course.lessons.map((L, i) => {
            const ids = exerciseIds(L); const d = ids.filter(id => Progress.isDone(id)).length;
            return el('li', { class: ids.length && d === ids.length ? 'complete' : '' },
              el('a', { href: '#/' + course.id + '/' + (i + 1) }, el('span', { class: 'l-num' }, String(i + 1)), el('span', { class: 'l-title' }, L.title)),
              el('span', { class: 'l-sum' }, L.summary, (() => { const m = lessonMinutes(course, L); return m > LONG_LESSON ? el('span', { class: 'l-long', title: 'Estimated from the lesson\u2019s reading, examples and exercises' }, 'Longer than an hour: about ' + about5(m) + ' minutes') : null; })()),
              ids.length ? el('span', { class: 'l-prog' }, d + '/' + ids.length + ' exercises') : null);
          }))),
        el('aside', { class: 'course-side' },
          course.audience ? el('h3', {}, 'Who it is for') : null,
          course.audience ? el('div', { class: 'prose small audience', html: course.audience }) : null,
          el('h3', {}, 'What you will be able to do'),
          el('ul', {}, course.outcomes.map(o => el('li', {}, o))),
          el('h3', {}, 'How it works'),
          el('div', { class: 'prose small', html: course.howItWorks || SITE.howItWorks }),
          el('p', { class: 'small' }, p.total ? (p.done + ' of ' + p.total + ' exercises completed on this device.') : '', p.done && window.PORTFOLIO ? [' ', el('a', { href: '#/portfolio' }, 'See them in your portfolio'), '.'] : null),
          course.textbook ? el('div', { class: 'prose small', html: course.textbook }) : null
        )));
    return main;
  }

  function lessonPage(course, idx) {
    const L = course.lessons[idx];
    const main = el('main', { class: 'lesson' });
    const nav = el('nav', { class: 'lesson-nav', 'aria-label': 'Lessons' },
      el('a', { class: 'nav-course', href: '#/' + course.id }, el('span', { class: 'course-code sm' }, course.code), el('span', {}, course.title)),
      el('ol', {}, course.lessons.map((x, i) => {
        const ids = exerciseIds(x); const d = ids.filter(id => Progress.isDone(id)).length;
        return el('li', { class: (i === idx ? 'current' : '') + (ids.length && d === ids.length ? ' complete' : '') }, el('a', { href: '#/' + course.id + '/' + (i + 1) }, el('span', { class: 'l-num' }, String(i + 1)), x.title));
      })));
    const mobileNav = el('details', { class: 'nav-mobile' }, el('summary', {}, lbl('lesson', ' ' + (idx + 1)), ' of ' + course.lessons.length + ' — ' + L.title), nav.cloneNode(true));
    const art = el('article', { class: 'lesson-body' });
    art.append(el('header', { class: 'lesson-head' }, el('p', { class: 'crumb' }, el('a', { href: '#/' + course.id }, course.code), ' · ', lbl('lesson', ' ' + (idx + 1)), devTag(course, true)), el('h1', {}, L.title), el('p', { class: 'lead' }, L.summary), window.STANDARDS ? window.STANDARDS.lessonBox(course, idx) : null,
      (() => { const m = lessonMinutes(course, L); return m > LONG_LESSON ? el('p', { class: 'lesson-time' }, 'This lesson may take longer than an hour: about ' + about5(m) + ' minutes. Plan for two sessions, or leave the exercises for the next one.') : null; })()));
    const parts = []; const body = renderBlocks(L.blocks, course, idx, parts);
    art.append(lessonMap(parts, course, idx), body);
    if (parts.length) { const onPage = el('div', { class: 'onpage' }, el('p', { class: 'onpage-head' }, 'On this page'), el('ol', {}, parts.map((p) => el('li', { class: 'map-' + p.kind }, partLink(course, idx, p, partTitle(parts, p)))))); nav.append(onPage); setTimeout(() => watchParts(parts, onPage.querySelector('ol')), 0); }
    const prev = idx > 0 ? el('a', { class: 'pager prev', href: '#/' + course.id + '/' + idx }, el('span', {}, 'Previous'), course.lessons[idx - 1].title) : el('span');
    const next = idx < course.lessons.length - 1 ? el('a', { class: 'pager next', href: '#/' + course.id + '/' + (idx + 2) }, el('span', {}, 'Next'), course.lessons[idx + 1].title) : el('a', { class: 'pager next', href: '#/' + course.id }, el('span', {}, 'Finished'), 'Back to ' + course.code);
    art.append(el('footer', { class: 'lesson-foot' }, prev, next));
    main.append(mobileNav, nav, art);
    return main;
  }

  function route() { renderRoute(); document.dispatchEvent(new CustomEvent('routed')); }
  function renderRoute() {
    const hash = location.hash.replace(/^#\/?/, '');
    const qi = hash.indexOf('?'); const query = qi >= 0 ? hash.slice(qi + 1) : '';
    const parts = (qi >= 0 ? hash.slice(0, qi) : hash).split('/').filter(Boolean);
    const app = $('#app'); app.innerHTML = '';
    if (parts[0] === 'guide' && window.GUIDE) { document.documentElement.setAttribute('data-course', ''); document.title = 'A guide for teachers — ' + SITE.name; app.append(topBar('guide'), window.GUIDE.page()); window.scrollTo(0, 0); return; }
    if (parts[0] === 'ojibwe' && window.OJIBWE) { document.documentElement.setAttribute('data-course', ''); document.title = 'Ojibwemowin — ' + SITE.name; app.append(topBar('ojibwe'), window.OJIBWE.page()); window.scrollTo(0, 0); return; }
    if (parts[0] === 'about' && window.ABOUT) { document.documentElement.setAttribute('data-course', ''); document.title = 'About and credits — ' + SITE.name; app.append(topBar('about'), window.ABOUT.page()); window.scrollTo(0, 0); return; }
    if (parts[0] === 'portfolio' && window.PORTFOLIO) { document.documentElement.setAttribute('data-course', ''); document.title = 'Portfolio — ' + SITE.name; app.append(topBar('portfolio'), window.PORTFOLIO.page(query)); window.scrollTo(0, 0); return; }
    if (parts[0] === 'today' && window.REVIEW) { document.documentElement.setAttribute('data-course', ''); document.title = 'Today\u2019s review — ' + SITE.name; app.append(topBar('today'), window.REVIEW.page()); window.scrollTo(0, 0); return; }
    if (parts[0] === 'courses') { document.documentElement.setAttribute('data-course', ''); document.title = 'Courses — ' + SITE.name; app.append(topBar('courses'), coursesPage()); window.scrollTo(0, 0); return; }
    if (parts[0] === 'algorithms' && window.ALGOS) { document.documentElement.setAttribute('data-course', 'algorithms'); app.append(topBar('algorithms'), window.ALGOS.page(parts[1])); window.scrollTo(0, 0); return; }
    if (parts[0] === 'arena' && window.ARENA && window.ARENA.page) { document.documentElement.setAttribute('data-course', 'algorithms'); app.append(topBar('arena'), window.ARENA.page(parts[1], query)); window.scrollTo(0, 0); return; }
    if (parts[0] === 'standards' && window.STANDARDS) { document.documentElement.setAttribute('data-course', ''); document.title = 'Standards — ' + SITE.name; app.append(topBar('standards'), window.STANDARDS.page(parts[1])); if (parts[1]) { const t = document.getElementById('std-' + parts[1]); if (t && t.scrollIntoView) { t.scrollIntoView(); return; } } window.scrollTo(0, 0); return; }
    if (parts[0] === 'real-world' && window.APPLIED) { document.documentElement.setAttribute('data-course', ''); document.title = 'Where it is used — ' + SITE.name; app.append(topBar('applied'), window.APPLIED.page(parts[1])); if (parts[1]) { const t = document.getElementById(parts[1]); if (t && t.scrollIntoView) { t.scrollIntoView(); return; } } window.scrollTo(0, 0); return; }
    if ((parts[0] === 'lab' || parts[0] === 'assign' || parts[0] === 'review') && window.LAB) { document.title = 'Code Lab — ' + SITE.name; app.append(topBar('lab'), window.LAB.page(query, parts[0])); window.scrollTo(0, 0); return; }
    let course = parts[0] ? courseById(parts[0]) : null;
    document.documentElement.setAttribute('data-course', course ? course.id : '');
    app.append(topBar(course));
    if (!course) { document.title = SITE.name; app.append(homePage()); }
    else if (parts[1] && course.lessons[+parts[1] - 1]) { const i = +parts[1] - 1; document.title = course.lessons[i].title + ' — ' + course.code; app.append(lessonPage(course, i)); if (parts[2]) { const target = document.getElementById(parts[2]); if (target && target.scrollIntoView) { target.scrollIntoView(); return; } } }
    else { document.title = course.code + ' ' + course.title; app.append(coursePage(course)); }
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  document.addEventListener('progress-changed', () => { /* sidebars re-render on next navigation */ });
  document.addEventListener('DOMContentLoaded', route);
  window.__app = { route, Progress, makeEditor, outputPanel, runCell, grade, COMMANDS, internal: { checkBlock, parsonsGrade, parsonsSolution, parsonsProgram, langIcon, lessonMinutes, LONG_LESSON, el, esc, highlight, toLines, LANGS, Runners, outputPanel, tipFor, armConfirm, grade, renderVerdict, Progress, courseById, checkSVG, lbl } };
})();
