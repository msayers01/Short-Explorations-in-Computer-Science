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
        const r = Scheme.runProgram(code, { onOutput: opts.onOutput });
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
  function outputPanel() {
    const box = el('div', { class: 'out term', hidden: '' });
    const status = el('span', { class: 'term-status', role: 'status' });
    const bar = el('div', { class: 'term-bar' }, el('span', { class: 'term-dots', 'aria-hidden': 'true' }, el('span'), el('span'), el('span')), el('span', { class: 'term-title' }, 'Output'), status);
    const pre = el('pre', { class: 'out-text', tabindex: '0', 'aria-label': 'Program output' });
    const cursor = el('span', { class: 'term-cursor', 'aria-hidden': 'true' });
    box.append(bar, pre);
    let t0 = 0;
    const put = (node) => { if (cursor.parentNode === pre) pre.insertBefore(node, cursor); else pre.appendChild(node); box.hidden = false; pre.scrollTop = pre.scrollHeight; };
    const line = (cls, s) => { put(el('span', { class: cls }, s)); put(document.createTextNode('\n')); };
    const setStatus = (cls, text) => { status.className = 'term-status' + (cls ? ' ' + cls : ''); status.textContent = text; };
    const api = {
      el: box,
      clear() { pre.textContent = ''; box.hidden = false; box.classList.remove('has-error'); setStatus('', ''); },
      /** a run begins: the prompt line names the command, the status says running, the cursor blinks */
      start(cmd) { api.clear(); t0 = Date.now(); if (cmd) line('cmd', cmd); pre.appendChild(cursor); setStatus('running', 'running'); },
      /** a run ends: the cursor stops and the status pill says how it went */
      finish(info) {
        info = info || {}; if (cursor.parentNode === pre) pre.removeChild(cursor);
        const secs = t0 ? ((Date.now() - t0) / 1000).toFixed(2) + ' s' : '';
        if (info.stopped) setStatus('fail', 'stopped' + (secs ? ' \u00b7 ' + secs : ''));
        else if (box.classList.contains('has-error')) setStatus('fail', 'error' + (secs ? ' \u00b7 ' + secs : ''));
        else setStatus('ok', 'exit ' + (info.exit || 0) + (secs ? ' \u00b7 ' + secs : ''));
      },
      write(s) { put(document.createTextNode(s)); },
      value(s) { line('val', s); },
      error(s) { line('err', s); box.classList.add('has-error'); },
      note(s) { line('note', s); },
      hide() { box.hidden = true; if (cursor.parentNode === pre) pre.removeChild(cursor); },
      /** inline input() prompt; returns a promise resolved with the typed line */
      ask(prompt) {
        return new Promise((resolve) => {
          const inp = el('input', { class: 'inline-input', type: 'text', 'aria-label': 'Program input', autocomplete: 'off', spellcheck: 'false' });
          const row = el('span', { class: 'input-line' }, prompt || '', inp);
          put(row); inp.focus();
          inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const v = inp.value; row.replaceWith(el('span', {}, prompt || '', el('span', { class: 'typed' }, v), '\n')); resolve(v); } });
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
      const r = await Runners.scheme.run(code, { onOutput: (s) => out.write(s) });
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
      const r = await Runners.cpp.run(code, { onOutput: (s) => out.write(s), stdin: opts.stdin });
      if (r.err) out.error(r.err);
      else if (!r.out) out.note('(the program finished without printing anything)');
    } else if (lang === 'java') {
      const r = await Runners.java.run(code, { onOutput: (s) => out.write(s), stdin: opts.stdin });
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

  // ---------- playground block ----------
  function playgroundBlock(b) {
    const box = el('div', { class: 'play' });
    if (b.caption) box.append(el('div', { class: 'play-cap' }, el('span', { class: 'play-label' }, lbl('tryIt')), el('span', { html: b.caption })));
    const editor = makeEditor(b.lang, b.code);
    const out = outputPanel();
    const turtleMount = b.lang === 'python' && usesTurtle(b.code) ? el('div', { class: 'play-turtle', hidden: '' }) : null;
    const runBtn = el('button', { class: 'btn primary', onclick: () => runCell(b.lang, editor.value, out, { stdin: b.stdin, runtime: b.runtime, turtleMount }) }, 'Run');
    const resetBtn = el('button', { class: 'btn quiet', onclick: () => { editor.value = b.code; out.hide(); } }, 'Reset');
    const labBtn = window.LAB ? el('button', { class: 'btn quiet lab-open', title: 'Copy this code into the Code Lab', onclick: () => window.LAB.openCode({ lang: b.lang, code: editor.value, name: b.labName, runtime: b.runtime }) }, 'Open in Code Lab') : null;
    const substBtn = window.LAB && window.SUBST && (b.lang === 'lisp' || b.lang === 'scheme') && !b.expectError ? el('button', { class: 'btn quiet lab-open mem-open', title: 'Open this program in the Code Lab and watch each expression being rewritten, one step of the substitution model at a time', onclick: () => window.LAB.openCode({ lang: b.lang, code: editor.value, name: b.labName, subst: true }) }, 'Show the substitution') : null;
    const memBtn = window.LAB && window.CPPSTEP && b.lang === 'cpp' && b.runtime !== 'full' ? el('button', { class: 'btn quiet lab-open mem-open', title: 'Open this program in the Code Lab and run it one line at a time, watching every variable, address and pointer', onclick: () => window.LAB.openCode({ lang: b.lang, code: editor.value, name: b.labName, step: true, stdin: b.stdin }) }, 'Step through memory') : null;
    box.append(editor.el, el('div', { class: 'toolbar' }, runBtn, resetBtn, b.stdin != null ? el('span', { class: 'stdin-note' }, 'input provided: ', el('code', {}, JSON.stringify(b.stdin))) : null, el('span', { class: 'spacer' }), memBtn, substBtn, labBtn), ...[turtleMount, out.el].filter(Boolean));   // append() prints a null as text
    return box;
  }

  // ---------- lesson rendering ----------
  // A quick check: one question, a few options, instant feedback, nothing saved. { check, options[], answer (index), why }
  function checkBlock(b) {
    const box = el('div', { class: 'qc', role: 'group', 'aria-label': 'Quick check' });
    const why = el('p', { class: 'qc-why', hidden: '' });
    const opts = el('div', { class: 'qc-opts' });
    const btns = (b.options || []).map((o, i) => el('button', { class: 'qc-opt', type: 'button', onclick: () => {
      if (box.classList.contains('done')) return;
      if (i === b.answer) { box.classList.add('done'); btns[i].classList.add('right'); btns.forEach((x) => { x.disabled = true; }); why.innerHTML = '<b>Yes.</b> ' + (b.why || ''); why.hidden = false; }
      else { btns[i].classList.add('wrong'); btns[i].disabled = true; why.innerHTML = '<b>Not that one.</b> ' + (b.wrong && b.wrong[i] ? b.wrong[i] : 'Try another.'); why.hidden = false; }
    } }, el('span', { class: 'qc-letter' }, String.fromCharCode(65 + i)), el('span', { html: o })));
    opts.append(...btns);
    box.append(el('p', { class: 'qc-q', html: b.check }), opts, why);
    return box;
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
        const recap = d.querySelector('.recap'); if (recap) { recap.id = 'part-recap'; part('part-recap', 'Recap', 'recap'); }
        frag.append(d);
      }
      else if (b.check) { checkCount++; frag.append(tagged('Quick check ' + checkCount, checkBlock(b), 'blk-check')); }
      else if (b.play && (b.lang || course.lang) === 'shell' && window.TERMINAL) { playCount++; frag.append(tagged(['Example ' + playCount, ' · ', lbl('tryIt')], window.TERMINAL.playBlock(b, course), 'blk-play')); }
      else if (b.play) { playCount++; frag.append(tagged(['Example ' + playCount, ' · ', lbl('tryIt')], playgroundBlock({ lang: b.lang || course.lang, code: b.play, caption: b.caption, stdin: b.stdin, expectError: b.expectError, runtime: b.runtime || course.runtime, labName: course.id + '-lesson' + (lessonIdx + 1) + '-example' + playCount }), 'blk-play')); }
      else if (b.ex) {
        b.ex.lang = b.ex.lang || course.lang; b.ex.runtime = b.ex.runtime || course.runtime; exCount++;
        const node = window.MATHGRADE && window.MATHGRADE.isMath(b.ex) ? mathExerciseBlock(b.ex, course) : b.ex.kind === 'shell' && window.TERMINAL ? window.TERMINAL.exerciseBlock(b.ex, course, lessonIdx) : exerciseBlock(b.ex, course, lessonIdx);
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
      else if (b.aside) w += words(b.aside);
      else if (b.check) { w += words(b.check) + words((b.options || []).join(' ')); t += 0.5; }
      else if (b.ex) { w += words(b.ex.title) + words(b.ex.prompt); t += b.ex.kind ? 12 : 10; }
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
      el('div', { class: 'top-links' }, COURSES.map(c => el('a', { href: '#/' + c.id, class: course && course.id === c.id ? 'current' : '' }, c.short)), el('a', { href: '#/lab', class: 'lab-link' + (course === 'lab' ? ' current' : '') }, 'Code Lab')),
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
        el('ul', { class: 'catalog' }, COURSES.map(c => {
          const p = courseProgress(c);
          return el('li', { 'data-course': c.id },
            el('a', { class: 'cat-code', href: '#/' + c.id }, c.code),
            el('div', { class: 'cat-body' },
              el('a', { class: 'cat-title', href: '#/' + c.id }, c.title), devTag(c, true),
              el('p', { class: 'cat-desc' }, c.tagline),
              c.grades ? el('p', { class: 'cat-grades' }, c.grades) : null,
              el('p', { class: 'cat-meta' }, c.lessons.length + ' lessons · ' + p.total + ' graded exercises' + (p.done ? ' · ' + p.done + ' completed' : ''))));
        }))
      ),
      el('section', { class: 'section' },
        el('h2', {}, 'Code Lab'),
        el('ul', { class: 'catalog' }, el('li', { 'data-course': 'lab' },
          el('a', { class: 'cat-code', href: '#/lab' }, 'LAB'),
          el('div', { class: 'cat-body' },
            el('a', { class: 'cat-title', href: '#/lab' }, 'Code Lab: a sandbox for your own programs'),
            el('p', { class: 'cat-desc' }, 'A full editor for Python, C++, Java and Scheme that runs entirely in your browser: nothing to install, nothing to sign up for. Files, templates, a quick reference, a step-through tracer for Python, a turtle canvas, and a Scheme REPL.'),
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
      el('footer', { class: 'foot' }, el('span', {}, SITE.footer), el('span', { class: 'foot-links' }, window.ABOUT ? [el('a', { href: '#/about' }, 'About and credits'), ' \u00b7 '] : null, el('button', { class: 'linklike', onclick: (e) => armConfirm(e.currentTarget, 'Clear all saved progress and code? (Save it to a file first if you want it back.) Click again to confirm', () => { Progress.reset(); route(); }) }, 'Reset my progress')))
    );
    return main;
  }

  function coursePage(course) {
    const main = el('main', { class: 'course' });
    const p = courseProgress(course);
    main.append(
      el('header', { class: 'course-head' },
        el('div', { class: 'course-code' }, course.code),
        el('div', {},
          el('h1', {}, course.title, devTag(course)),
          el('p', { class: 'tagline' }, course.tagline))),
      el('div', { class: 'course-grid' },
        el('div', { class: 'course-main' },
          el('div', { class: 'prose', html: course.description }),
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
    art.append(el('header', { class: 'lesson-head' }, el('p', { class: 'crumb' }, el('a', { href: '#/' + course.id }, course.code), ' · ', lbl('lesson', ' ' + (idx + 1)), devTag(course, true)), el('h1', {}, L.title), el('p', { class: 'lead' }, L.summary),
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
  window.__app = { route, Progress, makeEditor, outputPanel, runCell, grade, COMMANDS, internal: { lessonMinutes, LONG_LESSON, el, esc, highlight, toLines, LANGS, Runners, outputPanel, tipFor, armConfirm, grade, renderVerdict, Progress, courseById, checkSVG, lbl } };
})();
