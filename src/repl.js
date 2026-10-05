/* Interactive shells for the practice terminal: `python` and `scheme` with no file (src/shell.js calls hooks.repl, src/terminal.js supplies it).
   Registered as window.REPL (and module.exports for node: test_repl.js).

     REPL.python({ ask(prompt) → Promise<line|null>, out(text), err(text), run(code, {onOutput, onInput}) → Promise<{err}>, cancelled() }) → Promise<exit>
     REPL.scheme({ ask, out, err, Scheme, cancelled }) → Promise<exit>

   Scheme's evaluator lives in the page, so its REPL keeps one environment and evaluates each entry in it.
   Python runs in a sandbox (Skulpt in a worker) that cannot be kept waiting between entries, so the Python REPL replays: each entry runs after all
   the entries accepted so far, with their output skipped, the answers they gave input() given again, and random seeded the same way each time, so
   names, values and random numbers carry over. An entry that raises an error is not kept (real Python would keep what it did before the error).
   Skulpt has no eval or compile, so an entry is first tried as an expression (its value is printed with repr, as Python's REPL does) and, if it does
   not parse as one, run as statements. */
(function (factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else window.REPL = factory();
})(function () {
  'use strict';
  const MAX_ENTRIES = 500;

  // does this line open a block or leave a bracket or a triple quote open, so that more lines must follow?
  function needsMore(text) {
    let depth = 0, q = null, triple = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '\\') { i++; continue; }
        if (triple ? text.startsWith(q.repeat(3), i) : c === q) { if (triple) i += 2; q = null; triple = false; }
        else if (c === '\n' && !triple) q = null;
        continue;
      }
      if (c === '#') { const e = text.indexOf('\n', i); if (e < 0) break; i = e; continue; }
      if (c === '"' || c === "'") { q = c; triple = text.startsWith(c.repeat(3), i); if (triple) i += 2; continue; }
      if ('([{'.includes(c)) depth++; else if (')]}'.includes(c)) depth--;
    }
    if (q && triple) return true;
    if (depth > 0) return true;
    const last = text.replace(/\s+$/, '').split('\n').pop().replace(/#.*$/, '').trimEnd();
    return /:$/.test(last) || /\\$/.test(last);
  }
  const PRELUDE = (seed) => 'import random as __repl_random\n__repl_random.seed(' + seed + ')\n';
  const PRELUDE_LINES = 2;
  // the entry as an expression whose value is shown, or as it is
  const asExpr = (entry) => '__repl_v = (\n' + entry + '\n)\nif __repl_v is not None:\n    print(repr(__repl_v))\n';
  // Skulpt says "... on line N" counting from the top of the whole replayed program: say where in the entry instead, as Python's REPL does
  function errText(err, entryStart, entry, wrapped) {
    const lines = entry.split('\n'), m = String(err).match(/^([\s\S]*?) on line (\d+)\s*$/);
    let msg = (m ? m[1] : String(err)).replace(/__repl_v/g, '_');
    let n = m ? +m[2] - entryStart - (wrapped ? 1 : 0) : 0; if (m && wrapped) n = Math.min(Math.max(n, 1), lines.length);
    const inEntry = n >= 1 && n <= lines.length;
    if (/^(SyntaxError|ParseError|IndentationError|TokenError)/.test(msg)) {   // as Python shows one: where, the line, no traceback
      msg = msg.replace(/^(ParseError|TokenError): /, 'SyntaxError: ').replace(/^SyntaxError: bad input$/, 'SyntaxError: invalid syntax');
      return (inEntry ? '  File "<stdin>", line ' + n + '\n    ' + lines[n - 1].trim() + '\n' : '') + msg + '\n';
    }
    return (inEntry ? 'Traceback (most recent call last):\n  File "<stdin>", line ' + n + ', in <module>\n' : '') + msg + '\n';
  }

  async function python(o) {
    o.out('Python 3.9.0 (Skulpt, in your browser)\nType exit() or press Ctrl+D on an empty line to leave. Each entry runs again with the ones before it, so they should not take long.\n');
    const seed = Math.floor(Math.random() * 1e9);
    const kept = [];   // { text, answers: [lines given to input()] }
    let shown = 0;     // characters of output already on the screen
    for (;;) {
      let entry = await o.ask('>>> ');
      if (o.cancelled && o.cancelled()) return 130;
      if (entry == null) { o.out('\n'); return 0; }
      if (!entry.trim()) continue;
      // a block (a line ending in a colon) goes on until an empty line, as in Python's REPL; an open bracket or string until it is closed
      let block = /:\s*(#.*)?$/.test(entry);
      while (block || needsMore(entry)) {
        const more = await o.ask('... ');
        if (o.cancelled && o.cancelled()) return 130;
        if (more == null || (more.trim() === '' && (block || !needsMore(entry)))) break;
        entry += '\n' + more;
        if (/:\s*(#.*)?$/.test(more)) block = true;
      }
      if (/^\s*(exit|quit)\s*\(\s*\)\s*$/.test(entry)) return 0;
      if (/^\s*(exit|quit)\s*$/.test(entry)) { o.out('Use exit() or Ctrl+D (i.e. EOF) to exit\n'); continue; }
      if (kept.length >= MAX_ENTRIES) { o.err('This practice REPL keeps at most ' + MAX_ENTRIES + ' entries. Leave with exit() and start again.\n'); continue; }
      const before = PRELUDE(seed) + kept.map((k) => k.text + '\n').join('');
      const start = PRELUDE_LINES + kept.reduce((n, k) => n + k.text.split('\n').length, 0);
      const answers = kept.flatMap((k) => k.answers), mine = [];
      const attempt = async (code) => {
        let skip = shown, printed = '', used = 0;
        const r = await o.run(code, {
          onOutput: (s) => { if (skip >= s.length) { skip -= s.length; return; } s = s.slice(skip); skip = 0; printed += s; o.out(s); },
          onInput: async (q) => { if (used < answers.length) return answers[used++]; const v = await o.ask(q || ''); mine.push(v == null ? '' : v); return v == null ? '' : v; }
        });
        return { err: r && r.err, printed };
      };
      const lines = entry.split('\n').length;
      let r = await attempt(before + asExpr(entry)), wrapped = true;
      if (r.err && /^SyntaxError|^ParseError|bad input|invalid syntax/i.test(r.err) && !r.printed) { mine.length = 0; r = await attempt(before + entry + '\n'); wrapped = false; }
      if (o.cancelled && o.cancelled()) return 130;
      shown += r.printed.length;
      if (r.err) { if (/^Stopped/.test(r.err)) return 130; o.err(errText(r.err, start, entry, wrapped)); continue; }
      kept.push({ text: wrapped ? asExpr(entry) : entry, answers: mine.slice() });
    }
  }

  async function scheme(o) {
    const S = o.Scheme;
    o.out('Scheme REPL (this site\'s interpreter). Type an expression; (exit) or Ctrl+D on an empty line leaves.\n');
    let out = '';
    const it = S.makeEvaluator({ onOutput: (s) => { out += s; o.out(s); }, stepLimit: 2e7 });
    const balanced = (s) => { let d = 0, inStr = false; for (let i = 0; i < s.length; i++) { const c = s[i]; if (inStr) { if (c === '\\') i++; else if (c === '"') inStr = false; continue; } if (c === '"') inStr = true; else if (c === ';') { const e = s.indexOf('\n', i); if (e < 0) break; i = e; } else if (c === '(') d++; else if (c === ')') d--; } return d <= 0 && !inStr; };
    for (let n = 1; ; n++) {
      let text = await o.ask('1 ]=> ');
      if (o.cancelled && o.cancelled()) return 130;
      if (text == null) { o.out('\n;Moriturus te saluto.\n'); return 0; }
      if (!text.trim()) continue;
      while (!balanced(text)) { const more = await o.ask(''); if (o.cancelled && o.cancelled()) return 130; if (more == null) break; text += '\n' + more; }
      if (/^\s*\(\s*exit\s*\)\s*$/.test(text)) { o.out(';Moriturus te saluto.\n'); return 0; }
      try {
        it.reset();   // each entry gets a fresh step budget
        for (const f of S.parseAll(text)) {
          out = '';
          const v = it.evaluate(f, it.G), t = S.write(v);
          if (out && !out.endsWith('\n')) o.out('\n');
          o.out(t === '' ? ';Unspecified return value\n' : ';Value: ' + t + '\n');
        }
      } catch (e) { const msg = e instanceof RangeError ? 'Aborting!: maximum recursion depth exceeded' : (e instanceof S.SchemeError ? e.message : 'Internal error: ' + (e && e.message || e)); o.err(';' + String(msg).replace(/^;/, '') + '\n'); }
    }
  }
  return { python, scheme, needsMore, _internal: { asExpr, errText, PRELUDE } };
});
