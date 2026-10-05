// Node tests for the Code Lab's file history, line diff and find in all files (src/labhistory.js): edge cases, caps, dedupe, renames,
// and hostile saved data (the store comes from localStorage, which anything on the device can write).
const H = require('./src/labhistory.js');
let bad = 0, n = 0;
const check = (name, ok, detail) => { n++; if (!ok) { bad++; console.log('BAD  ' + name + (detail !== undefined ? '\n  ' + JSON.stringify(detail) : '')); } };
const J = JSON.stringify;
const show = (ops) => ops.map((o) => o.k + o.text + (o.noEol ? '$' : '')).join('|');

// ---- the diff
check('diff: two empty texts', H.diff('', '').length === 0);
check('diff: identical texts are all context', show(H.diff('a\nb\n', 'a\nb\n')) === ' a| b' && H.stats(H.diff('a\nb\n', 'a\nb\n')).added === 0);
check('diff: from nothing, everything added', show(H.diff('', 'x\ny\n')) === '+x|+y', show(H.diff('', 'x\ny\n')));
check('diff: to nothing, everything removed', show(H.diff('x\ny', '')) === '-x|-y$', show(H.diff('x\ny', '')));
check('diff: all lines changed', show(H.diff('a\nb\n', 'c\nd\n')) === '-a|-b|+c|+d', show(H.diff('a\nb\n', 'c\nd\n')));
check('diff: only the trailing newline differs', show(H.diff('a\nb', 'a\nb\n')) === ' a|-b$|+b', show(H.diff('a\nb', 'a\nb\n')));
check('diff: one line changed in the middle', show(H.diff('a\nb\nc\n', 'a\nB\nc\n')) === ' a|-b|+B| c');
check('diff: an insertion keeps the rest', show(H.diff('a\nc\n', 'a\nb\nc\n')) === ' a|+b| c');
check('diff: a moved line is a removal and an addition', H.stats(H.diff('a\nb\nc\n', 'b\nc\na\n')).added === 1 && H.stats(H.diff('a\nb\nc\n', 'b\nc\na\n')).removed === 1);
{ const ops = H.diff('x\na\ny\n', 'a\nz\n'); check('diff: line numbers on each side', ops.find((o) => o.k === ' ').a === 2 && ops.find((o) => o.k === ' ').b === 1 && ops.find((o) => o.text === 'z').b === 2, ops); }
check('diff: blank lines and \\r are compared as text', show(H.diff('a\r\n\nb', 'a\n\nb')) === '-a\r|+a| | b$');
{ const big = Array.from({ length: 3000 }, (_, i) => 'l' + i).join('\n'), other = Array.from({ length: 3000 }, (_, i) => 'm' + i).join('\n');
  const t0 = Date.now(), ops = H.diff(big, other); check('diff: a large pair falls back to removed-then-added, quickly', H.stats(ops).removed === 3000 && H.stats(ops).added === 3000 && Date.now() - t0 < 3000, Date.now() - t0); }
{ const a = Array.from({ length: 1500 }, (_, i) => 'line ' + i).join('\n'), b = a.replace('line 700', 'changed');
  const ops = H.diff(a, b); check('diff: a long file with one change is one change', H.stats(ops).added === 1 && H.stats(ops).removed === 1);
  const hk = H.hunks(ops, 3); check('hunks: unchanged runs fold to three lines of context', hk.length === 3 + 1 + 1 + 3 + 2 && hk[0].k === '…' && hk[0].skip === 697 && hk[hk.length - 1].skip === 796, hk.map((o) => o.k + (o.skip || '')).join()); }
check('hunks: nothing to fold in a short diff', H.hunks(H.diff('a\nb\n', 'a\nc\n'), 3).length === 3);
check('firstChange', H.firstChange('a\nb\nc', 'a\nB\nc') === 2 && H.firstChange('a', 'a') === 0 && H.firstChange('a', 'a\nb') === 1 && H.firstChange('', 'x') === 1);

// ---- the history: add, dedupe, caps
let h = H.empty();
check('add: a first version', H.add(h, 'python', 'main.py', 'print(1)\n', 'run', 1000) && H.list(h, 'python', 'main.py').length === 1);
check('add: the same text again is not stored', !H.add(h, 'python', 'main.py', 'print(1)\n', 'edit', 2000) && H.list(h, 'python', 'main.py').length === 1);
H.add(h, 'python', 'main.py', 'print(2)\n', 'edit', 3000);
check('list: newest first, with its reason', H.list(h, 'python', 'main.py').map((v) => v.why + v.t).join() === 'edit3000,run1000');
check('add: an older identical version moves up, stored once', H.add(h, 'python', 'main.py', 'print(1)\n', 'restore', 4000) && H.list(h, 'python', 'main.py').map((v) => v.code).join('') === 'print(1)\nprint(2)\n' && H.list(h, 'python', 'main.py')[0].why === 'restore');
check('add: empty and blank texts are not stored', !H.add(h, 'python', 'e.py', '', 'run') && !H.add(h, 'python', 'e.py', '  \n', 'run') && !H.list(h, 'python', 'e.py').length);
check('add: a text over the size limit is not stored', !H.add(h, 'python', 'big.py', 'x'.repeat(H.MAX_SNAP + 1), 'run'));
check('add: an unknown reason becomes edit', H.add(h, 'cpp', 'main.cpp', 'int main(){}', '<script>', 5) && H.list(h, 'cpp', 'main.cpp')[0].why === 'edit');
check('add: a clock that goes back still keeps the order', H.add(h, 'cpp', 'main.cpp', 'int main(){return 1;}', 'run', 1) && H.list(h, 'cpp', 'main.cpp')[0].code === 'int main(){return 1;}');
for (let i = 0; i < 40; i++) H.add(h, 'java', 'Main.java', 'class Main { int v = ' + i + '; }', 'edit', 10000 + i);
check('caps: at most PER_FILE versions a file, the oldest dropped', H.list(h, 'java', 'Main.java').length === H.PER_FILE && /v = 39/.test(H.list(h, 'java', 'Main.java')[0].code) && /v = 10;/.test(H.list(h, 'java', 'Main.java')[H.PER_FILE - 1].code));
{ const g = H.empty(), chunk = (c, i) => c.repeat(49990) + i;
  H.add(g, 'python', 'a.py', chunk('a', 1), 'run', 1); H.add(g, 'python', 'b.py', chunk('b', 2), 'run', 2);
  for (let i = 3; i <= 11; i++) H.add(g, 'python', 'a.py', chunk('a', i), 'run', i);
  check('caps: the total stays under TOTAL characters, the oldest anywhere dropped first', H.size(g) <= H.TOTAL && H.list(g, 'python', 'b.py').length === 0 && H.list(g, 'python', 'a.py').length === 8, [H.size(g), H.list(g, 'python', 'b.py').length, H.list(g, 'python', 'a.py').length]);
  check('caps: a file whose versions all went is no longer listed', !('b.py' in g.files.python)); }
{ const g = H.empty(); let ok = 0; for (let i = 0; i < 450; i++) if (H.add(g, 'python', 'f' + i + '.py', 'x' + i, 'run', i)) ok++;
  check('caps: at most 400 files have a history', ok === 400, ok); }

// ---- renames and deletes
{ const g = H.empty(); H.add(g, 'python', 'old.py', 'one', 'run', 1); H.add(g, 'python', 'old.py', 'two', 'run', 2);
  H.rename(g, 'python', 'old.py', 'new.py');
  check('rename: the history follows the file', H.list(g, 'python', 'new.py').length === 2 && !H.list(g, 'python', 'old.py').length);
  H.add(g, 'python', 'other.py', 'one', 'run', 0.5); H.add(g, 'python', 'other.py', 'three', 'run', 3);
  H.rename(g, 'python', 'new.py', 'other.py');
  check('rename onto a name with a history: merged by time, each text once', H.list(g, 'python', 'other.py').map((v) => v.code).join() === 'three,two,one', H.list(g, 'python', 'other.py').map((v) => v.code));
  H.rename(g, 'python', 'other.py', '__proto__');
  check('rename to a prototype name is refused', H.list(g, 'python', 'other.py').length === 3 && !Object.keys(g.files.python).includes('__proto__'));
  H.drop(g, 'python', 'other.py');
  check('drop: a deleted file loses its history', !H.list(g, 'python', 'other.py').length && !g.files.python); }

// ---- hostile saved data
const ok1 = H.clean(JSON.parse(J({ v: 1, files: { python: { 'main.py': [{ t: 2, why: 'run', code: 'b' }, { t: 1, why: 'edit', code: 'a' }] } } })));
check('clean: a good store comes back, oldest first', J(H.list(ok1, 'python', 'main.py').map((v) => v.code)) === '["b","a"]');
check('clean: junk gives an empty history', [null, 1, 'x', [], { v: 2, files: {} }, { v: 1 }, { v: 1, files: [] }].every((r) => J(H.clean(r).files) === '{}'));
{ const raw = JSON.parse('{"v":1,"files":{"__proto__":{"a.py":[{"t":1,"code":"x"}]},"constructor":{"a.py":[{"t":1,"code":"x"}]},"PYTHON":{"a.py":[{"t":1,"code":"x"}]},'
    + '"python":{"__proto__":[{"t":1,"code":"x"}],"toString":[{"t":1,"code":"x"}],"bad\\u0000name":[{"t":1,"code":"x"}],"ok.py":[{"t":1,"code":"x"},{"t":"2","code":"y"},{"t":3,"code":5},{"t":4,"code":"x"},{"t":5,"code":"z","why":"__proto__"},{"t":1e99,"code":"w"},null,7,{"t":6,"code":"   "}],"' + 'n'.repeat(101) + '":[{"t":1,"code":"x"}]}}}');
  const c = H.clean(raw);
  check('clean: prototype names, bad languages and bad names are dropped', Object.keys(c.files).join() === 'python' && Object.keys(c.files.python).join() === 'ok.py' && Object.getPrototypeOf(c.files) === null && Object.getPrototypeOf(c.files.python) === null, Object.keys(c.files.python));
  check('clean: bad versions dropped, duplicates once, reasons checked, times clamped', J(H.list(c, 'python', 'ok.py').map((v) => [v.code, v.why, v.t])) === J([['w', 'edit', 1e15], ['z', 'edit', 5], ['x', 'edit', 1]]), H.list(c, 'python', 'ok.py')); }
{ const many = {}; for (let i = 0; i < 100; i++) many['f' + i + '.py'] = Array.from({ length: 50 }, (_, k) => ({ t: k, code: 'v' + k + 'x'.repeat(1000) }));
  const c = H.clean({ v: 1, files: { python: many } });
  check('clean: the caps hold for a stored history too', H.size(c) <= H.TOTAL && Object.values(c.files.python).every((vs) => vs.length <= H.PER_FILE), H.size(c)); }
check('clean: an oversized version is dropped', !H.list(H.clean({ v: 1, files: { python: { 'a.py': [{ t: 1, code: 'x'.repeat(H.MAX_SNAP + 1) }] } } }), 'python', 'a.py').length);
check('clean: survives JSON and comes back the same', J(H.clean(JSON.parse(J(ok1)))) === J(ok1));

// ---- find in all files
const files = [{ code: 'max = 1\nx = max + 1\nprint(x)\n' }, { code: 'nothing here' }, { code: 'X.x = MAX' }];
const r = H.search(files, 'max', {});
check('search: grouped by file, line, column and line text', J(r.map((g) => [g.i, g.matches.map((m) => [m.line, m.col, m.text])])) === J([[0, [[1, 1, 'max = 1'], [2, 5, 'x = max + 1']]], [2, [[1, 7, 'X.x = MAX']]]]), r);
check('search: match case', H.search(files, 'max', { matchCase: true }).length === 1);
check('search: whole word', J(H.search([{ code: 'x xs max x_1 (x)' }], 'x', { word: true })[0].matches.map((m) => m.s)) === '[0,14]');
check('search: whole word with punctuation at an end', H.search([{ code: 'a.x b.xy' }], '.x', { word: true })[0].matches.length === 1);
check('search: special characters are literal', H.search([{ code: 'a.b axb (a.b)' }], 'a.b', {})[0].matches.length === 2 && H.search([{ code: 'f(x)' }], '(x)', {})[0].matches.length === 1);
check('search: empty query finds nothing', H.search(files, '', {}).length === 0);
check('search: offsets select the match', (() => { const m = H.search(files, 'print', {})[0].matches[0]; return files[0].code.slice(m.s, m.e) === 'print' && m.line === 3; })());
check('search: at most MAX_HITS matches', H.search([{ code: 'a'.repeat(5000) }], 'a', {})[0].matches.length === H.MAX_HITS);
check('replaceIn: counts and replaces, "$&" stays literal', J(H.replaceIn('max = max', 'max', '$&!', {})) === J({ code: '$&! = $&!', n: 2 }));
check('replaceIn: whole word and case', H.replaceIn('x xs X', 'x', 'y', { word: true, matchCase: true }).code === 'y xs X' && H.replaceIn('x xs X', 'x', 'y', { word: true }).n === 2);

console.log(bad ? bad + ' of ' + n + ' file-history checks failed' : 'all ' + n + ' file-history checks passed');
process.exit(bad ? 1 : 0);
