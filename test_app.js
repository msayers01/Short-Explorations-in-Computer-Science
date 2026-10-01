// Node tests for pure helpers: syntax highlighting (read out of src/app.js) and ensureMainReturns (src/cpputil.js).
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/src/app.js', 'utf8');
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const slice = (from, to) => { const i = src.indexOf(from), j = src.indexOf(to, i); if (i < 0 || j < 0) throw new Error('not found in src/app.js: ' + from); return src.slice(i, j); };
const highlight = new Function('esc', slice('  const LANGS', '  window.__highlight') + '\nreturn highlight;')(esc);
const { ensureMainReturns } = require('./src/cpputil.js');
let bad = 0;
const check = (name, got, want) => { if (got !== want) { bad++; console.log('BAD  ' + name + '\n  got:  ' + JSON.stringify(got) + '\n  want: ' + JSON.stringify(want)); } };
const has = (name, html, frag) => { if (!html.includes(frag)) { bad++; console.log('BAD  ' + name + ': missing ' + frag + '\n  in: ' + html); } };

// highlighting: every token class must survive the capture groups inside each language's own regexes
const cpp = highlight('#include <iostream>\nint main() { int x = 42; // hi\n cout << "s" << \'c\' << 3.5; /* c */ }', 'cpp');
has('cpp include', cpp, '<span class="p">#include &lt;iostream&gt;</span>');
has('cpp keyword', cpp, '<span class="k">int</span>');
has('cpp number', cpp, '<span class="n">42</span>');
has('cpp string', cpp, '<span class="s">&quot;s&quot;</span>');
has('cpp char', cpp, '<span class="s">&#39;c&#39;</span>');
has('cpp line comment', cpp, '<span class="c">// hi</span>');
has('cpp block comment', cpp, '<span class="c">/* c */</span>');
const py = highlight('def f(x):  # c\n  return "a" + str(3) + f"{x}" + """t"""', 'python');
has('python number', py, '<span class="n">3</span>');
has('python string', py, '<span class="s">&quot;a&quot;</span>');
has('python fstring', py, '<span class="s">f&quot;{x}&quot;</span>');
has('python comment', py, '<span class="c"># c</span>');
const scm = highlight('(define (f x) ; c\n (+ x 2.5 "s"))', 'scheme');
has('scheme number', scm, '<span class="n">2.5</span>');
has('scheme string', scm, '<span class="s">&quot;s&quot;</span>');
has('scheme comment', scm, '<span class="c">; c</span>');

// ensureMainReturns
check('adds return 0', ensureMainReturns('int main() {\n  int x = 1;\n}'), 'int main() {\n  int x = 1;\n\n    return 0;\n}');
check('keeps existing return', ensureMainReturns('int main() {\n  return 0;\n}'), 'int main() {\n  return 0;\n}');
check('brace in a block comment', ensureMainReturns('int main() {\n  /* } and don\'t */\n  int x = 1;\n}'), 'int main() {\n  /* } and don\'t */\n  int x = 1;\n\n    return 0;\n}');
check('brace in a string', ensureMainReturns('int main() {\n  cout << "}";\n}'), 'int main() {\n  cout << "}";\n\n    return 0;\n}');
check('brace in a char', ensureMainReturns("int main() {\n  char c = '{';\n}"), "int main() {\n  char c = '{';\n\n    return 0;\n}");

check('for(;;) cannot hang', ensureMainReturns('int main() {\n  for (;;) { break; }\n  return 0;\n}'), 'int main() {\n  for(;1;) { break; }\n  return 0;\n}');
check('for(;;) inside a string is left alone', ensureMainReturns('int main() {\n  cout << "for(;;)";\n  return 0;\n}'), 'int main() {\n  cout << "for(;;)";\n  return 0;\n}');

// patched JSCPP: unsigned integers wrap around the way C++ does
const JSCPP = require('./node_modules/JSCPP/lib/commonjs.js');
const runCpp = (body) => { let out = ''; try { JSCPP.run('#include <iostream>\nusing namespace std;\nint main() {' + body + ' return 0; }', '', { stdio: { write: (t) => { out += t; } }, unsigned_overflow: 'warn' }); } catch (e) { out += 'ERR ' + e.message.split('\n')[0]; } return out.trim(); };
const quiet = console.error; console.error = () => { };   // JSCPP warns about the wrap on stderr
check('unsigned int 0 - 1', runCpp('unsigned int u = 0; u--; cout << u;'), '4294967295');
check('unsigned int = -1', runCpp('unsigned int u = -1; cout << u;'), '4294967295');
check('unsigned int max + 2', runCpp('unsigned int a = 4294967295; a = a + 2; cout << a;'), '1');
check('unsigned char 250 + 10', runCpp('unsigned char c = 250; c = c + 10; cout << (int)c;'), '4');
check('unsigned short 65535 + 1', runCpp('unsigned short s = 65535; s++; cout << s;'), '0');
console.error = quiet;

if (bad) { console.log(bad + ' problems'); process.exit(1); }
console.log('app helpers OK');
