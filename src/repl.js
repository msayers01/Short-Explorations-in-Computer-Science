/* Interactive shells for the practice terminal: `python` and `scheme` with no file (src/shell.js calls hooks.repl, src/terminal.js supplies it).
   Registered as window.REPL (and module.exports for node: test_repl.js).

     REPL.python({ ask(prompt) → Promise<line|null>, out(text), err(text), run(code, {onOutput, onInput}) → Promise<{err}>, cancelled() }) → Promise<exit>
     REPL.scheme({ ask, out, err, Scheme, cancelled }) → Promise<exit>
     REPL.java({ ask, out, err, run(code, {onOutput}) → Promise<{err}>, cancelled }) → Promise<exit>      (jshell)

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
    o.out('Python 3.7 (Skulpt, in your browser)\nType exit() or press Ctrl+D on an empty line to leave. Each entry runs again with the ones before it, so they should not take long.\n');
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
  /* jshell. Like Python's, a replay: the entries kept so far are rebuilt into one class each time and run with the output already shown skipped.
     A variable declared at the top level becomes a static field (so methods see it, as in jshell) and its initializer an assignment in main;
     a method becomes a static method; a class, interface or enum stays a top-level class; an import goes at the top; anything else is tried as
     an expression (shown as $n ==> value) and, if javac rejects that, run as a statement. Each kept entry is a snippet with a number, as in jshell. */
  const KW = new Set('return throw new else case yield assert break continue do goto package if for while switch try catch finally synchronized this super'.split(' '));
  const ID = '[A-Za-z_$][\\w$]*', TYPE = ID + '(?:\\s*\\.\\s*' + ID + ')*(?:\\s*<[^;=(){}]*>)?(?:\\s*\\[\\s*\\])*';
  const RE_CLASS = new RegExp('^\\s*(?:(?:public|abstract|final|static)\\s+)*(class|interface|enum|record)\\s+(' + ID + ')');
  const RE_METHOD = new RegExp('^\\s*((?:(?:public|private|protected|static|final|abstract|synchronized)\\s+)*)(?:<[^>]*>\\s*)?(' + TYPE + ')\\s+(' + ID + ')\\s*\\(([^)]*)\\)\\s*(?:throws\\s+[\\w$.,\\s]+)?\\{');
  const RE_VAR = new RegExp('^\\s*(final\\s+)?(' + TYPE + ')\\s+(' + ID + ')\\s*(?:=\\s*([\\s\\S]*?))?\\s*;?\\s*$');
  function classify(text) {
    const t = text.trim();
    if (/^import\s/.test(t)) return { kind: 'import', text: t.replace(/;?$/, ';') };
    let m = t.match(RE_CLASS); if (m) return { kind: 'class', what: m[1], name: m[2], text: t };
    m = t.match(RE_METHOD); if (m && !KW.has(m[2]) && !KW.has(m[3])) { const ps = m[4].trim() ? m[4].split(',').map((p) => p.trim().replace(/\s+[A-Za-z_$][\w$]*$/, '').replace(/^final\s+/, '')) : []; return { kind: 'method', name: m[3], sig: m[3] + '(' + ps.join(',') + ')', key: m[3] + '/' + ps.length, text: /\bstatic\b/.test(m[1]) ? t : t.replace(/^\s*((?:(?:public|private|protected|final|abstract|synchronized)\s+)*)/, '$1static ') }; }
    m = t.match(RE_VAR); if (m && !KW.has(m[2].split(/[\s<\[.]/)[0])) return { kind: 'var', type: m[2].replace(/\s+/g, ' '), name: m[3], init: m[4], local: m[2] === 'var' };
    return { kind: 'code', text: t.replace(/;\s*$/, '') };
  }
  const javaBalanced = (s) => { let d = 0; for (let i = 0; i < s.length; i++) { const c = s[i]; if (c === '"' || c === "'") { const q = c; for (i++; i < s.length && s[i] !== q && s[i] !== '\n'; i++) if (s[i] === '\\') i++; continue; } if (c === '/' && s[i + 1] === '/') { const e = s.indexOf('\n', i); if (e < 0) break; i = e; continue; } if (c === '/' && s[i + 1] === '*') { const e = s.indexOf('*/', i + 2); if (e < 0) return false; i = e + 1; continue; } if ('({['.includes(c)) d++; else if (')}]'.includes(c)) d--; } return d <= 0; };
  const SHOW = 'static String __show(Object o) { if (o == null) return "null"; if (o instanceof String) return "\\"" + o + "\\""; if (o instanceof Character) return "\'" + o + "\'";'
    + ' if (o instanceof int[]) { int[] a = (int[]) o; String s = "int[" + a.length + "] { "; for (int i = 0; i < a.length; i++) s += (i > 0 ? ", " : "") + a[i]; return s + " }"; }'
    + ' if (o instanceof double[]) { double[] a = (double[]) o; String s = "double[" + a.length + "] { "; for (int i = 0; i < a.length; i++) s += (i > 0 ? ", " : "") + a[i]; return s + " }"; }'
    + ' if (o instanceof String[]) { String[] a = (String[]) o; String s = "String[" + a.length + "] { "; for (int i = 0; i < a.length; i++) s += (i > 0 ? ", " : "") + (a[i] == null ? "null" : "\\"" + a[i] + "\\""); return s + " }"; }'
    + ' return String.valueOf(o); }';
  function javaProgram(st, extra) {
    const fields = Object.keys(st.fields).map((n) => '  static ' + st.fields[n] + ' ' + n + ';\n').join('');
    const methods = Object.keys(st.methods).map((k) => '  ' + st.methods[k].text + '\n').join('');
    const body = st.kept.map((k) => k.main).concat(extra ? [extra.main] : []).join('\n');
    const classes = Object.keys(st.classes).map((n) => st.classes[n].text + '\n').join('');
    return 'import java.util.*;\n' + st.imports.join('\n') + '\npublic class JShell {\n' + fields + methods + '  ' + SHOW + '\n  public static void main(String[] args) throws Exception {\n' + body + '\n  }\n}\n' + classes;
  }
  const javaErr = (err) => { const lines = String(err).split('\n'); if (/^\S+\.java:\d+: error: /.test(lines[0])) { lines[0] = lines[0].replace(/^\S+\.java:\d+: error: /, ''); return '|  Error:\n' + lines.filter((l) => !/^\s*location:/.test(l)).map((l) => '|  ' + l).join('\n').replace(/__show|__v\d+/g, '_') + '\n'; } const m = String(err).match(/^Exception in thread "main" (\S+?)(?::\s*(.*))?(\n|$)/); if (m) return '|  Exception ' + m[1] + (m[2] ? ': ' + m[2] : '') + '\n'; return '|  ' + String(err).split('\n')[0] + '\n'; };
  async function java(o) {
    o.out('|  Welcome to JShell (this site\'s Java interpreter, in your browser).\n|  /help lists the commands; /exit or Ctrl+D leaves. Each snippet runs again with the ones before it, so they should not take long.\n\n');
    const st = { imports: [], fields: Object.create(null), methods: Object.create(null), classes: Object.create(null), kept: [], vars: Object.create(null) };
    let shown = 0, n = 0;
    const attempt = async (extra) => { let skip = shown, printed = ''; const r = await o.run(javaProgram(st, extra), { onOutput: (s) => { if (skip >= s.length) { skip -= s.length; return; } s = s.slice(skip); skip = 0; printed += s; o.out(s); } }); return { err: r && r.err, printed, compile: !!(r && r.err && /^\S+\.java:\d+: error:/.test(r.err)) }; };
    for (;;) {
      let text = await o.ask('jshell> ');
      if (o.cancelled && o.cancelled()) return 130;
      if (text == null) { o.out('\n|  Goodbye\n'); return 0; }
      if (!text.trim()) continue;
      while (!javaBalanced(text)) { const more = await o.ask('   ...> '); if (o.cancelled && o.cancelled()) return 130; if (more == null) break; text += '\n' + more; }
      const cmd = text.trim();
      if (/^\/(exit|ex|quit)\b/.test(cmd)) { o.out('|  Goodbye\n'); return 0; }
      if (cmd === '/help' || cmd === '/?') { o.out('|  Type a Java declaration, statement or expression; an expression shows its value.\n|  /list  the snippets so far\n|  /vars  the variables\n|  /methods  the methods\n|  /reset  start again\n|  /exit  leave\n'); continue; }
      if (cmd === '/list') { st.kept.forEach((k) => o.out(String(k.id).padStart(4) + ' : ' + k.text.split('\n').join('\n       ') + '\n')); continue; }
      if (cmd === '/vars') { for (const v of Object.keys(st.vars)) o.out('|    ' + st.vars[v] + ' ' + v + '\n'); continue; }
      if (cmd === '/methods') { for (const k of Object.keys(st.methods)) o.out('|    ' + st.methods[k].show + '\n'); continue; }
      if (cmd === '/reset') { st.imports = []; st.fields = Object.create(null); st.methods = Object.create(null); st.classes = Object.create(null); st.kept = []; st.vars = Object.create(null); shown = 0; n = 0; o.out('|  Resetting state.\n'); continue; }
      if (/^\//.test(cmd)) { o.out('|  Invalid command: ' + cmd.split(/\s/)[0] + '\n|  Type /help for help.\n'); continue; }
      if (st.kept.length >= MAX_ENTRIES) { o.err('|  This practice jshell keeps at most ' + MAX_ENTRIES + ' snippets. Use /reset.\n'); continue; }
      const c = classify(text), id = n + 1, save = JSON.stringify([st.imports, st.fields, st.methods, st.classes, st.vars]);
      const restore = () => { const [a, b, m, k, v] = JSON.parse(save); st.imports = a; st.fields = Object.assign(Object.create(null), b); st.methods = Object.assign(Object.create(null), m); st.classes = Object.assign(Object.create(null), k); st.vars = Object.assign(Object.create(null), v); };
      let main = '', note = '', r;
      if (c.kind === 'import') { if (!st.imports.includes(c.text)) st.imports.push(c.text); }
      else if (c.kind === 'class') { note = '|  ' + (st.classes[c.name] ? 'modified ' : 'created ') + c.what + ' ' + c.name + '\n'; st.classes[c.name] = { text: c.text }; }
      else if (c.kind === 'method') { note = '|  ' + (st.methods[c.key] ? 'modified' : 'created') + ' method ' + c.sig + '\n'; st.methods[c.key] = { text: c.text, show: c.sig }; }
      else if (c.kind === 'var' && !c.local) {
        let init = c.init; if (init !== undefined && /^\s*\{/.test(init)) init = 'new ' + c.type + ' ' + init;   // int[] a = {1, 2} as an assignment
        st.fields[c.name] = c.type; st.vars[c.name] = c.type;
        main = (init !== undefined ? c.name + ' = ' + init + ';' : '') + ' System.out.println("' + c.name + ' ==> " + __show(' + c.name + '));';
      } else if (c.kind === 'var') main = text.trim().replace(/;?\s*$/, ';') + ' System.out.println("' + c.name + ' ==> " + __show(' + c.name + '));';
      if (c.kind === 'code') {
        r = await attempt({ main: 'var __v' + id + ' = (' + c.text + '); System.out.println("$' + id + ' ==> " + __show(__v' + id + '));' });
        if (r.compile && !r.printed) { const first = r; main = c.text + (/[;}]$/.test(c.text) ? '' : ';'); r = await attempt({ main }); if (r.compile && /not a statement/.test(r.err) && !/void/.test(first.err)) r = first; }   // y + 1 with no y: say what is wrong with y
        else main = 'var __v' + id + ' = (' + c.text + '); System.out.println("$' + id + ' ==> " + __show(__v' + id + '));';
      } else r = await attempt({ main });
      if (o.cancelled && o.cancelled()) return 130;
      shown += r.printed.length;
      if (r.err) { restore(); if (/^Stopped/.test(r.err)) return 130; o.err(javaErr(r.err)); continue; }
      n = id; st.kept.push({ id, text: text.trim(), main });
      if (note) o.out(note);
    }
  }

  return { python, scheme, java, needsMore, _internal: { asExpr, errText, PRELUDE, classify, javaProgram } };
});
