// Node tests for the practice shell (src/shell.js): the file system, the parser, every command's output and error text, the limits,
// and what a hostile saved copy can and cannot do.  node test_shell.js
const SHELL = require('./src/shell.js');
let bad = 0;
const check = (name, got, want) => { const ok = want instanceof RegExp ? want.test(got) : got === want; if (!ok) { bad++; console.log('BAD  ' + name + '\n  got:  ' + JSON.stringify(got) + '\n  want: ' + (want instanceof RegExp ? want : JSON.stringify(want))); } };
const T0 = Date.UTC(2026, 9, 1, 14, 0, 0);
function fresh(hooks) {
  const fs = SHELL.makeFS(null, { now: () => T0 });
  const sh = SHELL.makeShell(Object.assign({ fs, now: fs.now,
    run: async (lang, src, o) => { o.onOutput(lang + ':' + src.trim() + (o.stdin == null ? '' : '<' + JSON.stringify(o.stdin)) + (o.args.length ? ' ' + o.args.join(',') : '') + '\n'); return /boom/.test(src) ? { err: 'Error: boom', exit: 1 } : { err: null, exit: 0 }; },
    compile: async (lang, src, o) => /bad/.test(src) ? { err: o.name + ':1:1: error: bad' } : { err: null } }, hooks || {}));
  const asks = [];
  const run = async (line, io) => { let out = ''; const exit = await sh.exec(line, Object.assign({ out: (s) => { out += s; }, err: (s) => { out += s; }, tty: true, ask: async (p) => { asks.push(p); return asks.length > 20 ? '' : 'typed'; } }, io || {})); return { out, exit }; };
  return { fs, sh, run, asks };
}
const eq = (name, r, out, exit) => { check(name + ' output', r.out, out); if (exit !== undefined) check(name + ' exit', r.exit, exit); };

(async () => {
  // ---- the file system
  {
    const { fs } = fresh();
    check('home exists', fs.isDir('/home/student'), true);
    check('resolve ..', fs.resolve('../x', '/home/student'), '/home/x');
    check('resolve ~', fs.resolve('~/a/./b//c/..'), '/home/student/a/b');
    check('resolve above root', fs.resolve('/../../etc'), '/etc');
    fs.mkdir('/home/student/d'); fs.write('/home/student/d/f.txt', 'hi');
    check('read', fs.read('/home/student/d/f.txt'), 'hi');
    fs.write('/home/student/d/f.txt', ' there', true); check('append', fs.read('/home/student/d/f.txt'), 'hi there');
    let e = null; try { fs.write('/etc/x', 'no'); } catch (x) { e = x.code; } check('system is read-only', e, 'EACCES');
    e = null; try { fs.unlink('/bin/ls'); } catch (x) { e = x.code; } check('cannot remove a command', e, 'EACCES');
    e = null; try { fs.mkdir('/home/student/d'); } catch (x) { e = x.code; } check('mkdir exists', e, 'EEXIST');
    e = null; try { fs.read('/home/student/d'); } catch (x) { e = x.code; } check('read a dir', e, 'EISDIR');
    e = null; try { fs.write('/home/student/nope/f', ''); } catch (x) { e = x.code; } check('missing parent', e, 'ENOENT');
    e = null; try { fs.write('/home/student/d/f.txt/g', ''); } catch (x) { e = x.code; } check('file as parent', e, 'ENOTDIR');
    e = null; try { fs.mkdir('/home/student/' + 'x'.repeat(101)); } catch (x) { e = x.code; } check('long name', e, 'ENAMETOOLONG');
    e = null; try { fs.write('/home/student/big', 'x'.repeat(SHELL.LIMITS.fileBytes + 1)); } catch (x) { e = x.code; } check('file too big', e, 'EFBIG');
    e = null; try { fs.copy('/home/student/d', '/home/student/d/inside', true); } catch (x) { e = x.code; } check('copy into itself', e, 'EINVAL');
    fs.move('/home/student/d', '/home/student/e'); check('move', fs.read('/home/student/e/f.txt'), 'hi there');
    fs.cwd = '/home/student/e'; fs.move('/home/student/e', '/home/student/g'); check('cwd follows a moved dir', fs.cwd, '/home/student/g');
    const saved = JSON.parse(JSON.stringify(fs.toJSON()));
    check('only home and tmp are saved', saved.root.c.map((e) => e[0]).join(','), 'home,tmp');
    const fs2 = SHELL.makeFS(saved, { now: () => T0 });
    check('round trip', fs2.read('/home/student/g/f.txt'), 'hi there'); check('round trip cwd', fs2.cwd, '/home/student/g'); check('system rebuilt', fs2.isFile('/bin/ls'), true);
    // hostile saved copies
    const h = SHELL.makeFS({ v: 1, cwd: '/etc', root: { t: 'd', c: [['home', { t: 'd', c: [['student', { t: 'd', c: [['__proto__', { t: 'f', d: 'p' }], ['constructor', { t: 'd', c: [] }], ['a/b', { t: 'f', d: 'y' }], ['..', { t: 'd', c: [] }], ['', { t: 'f', d: '' }], ['ctl\u0001', { t: 'f', d: '' }], ['big', { t: 'f', d: 'x'.repeat(SHELL.LIMITS.fileBytes + 1) }], ['ok', { t: 'f', d: 'z', x: 'yes', bin: { lang: 'c++', src: 'int main(){}', std: 'bad std' } }], ['ok2', { t: 'f', d: '', bin: { lang: 'cpp', src: 's', std: 'gnu++20' } }], ['n', { t: 'f', d: 42 }], ['weird', { t: 'x' }]] }]] }], ['bin', { t: 'd', c: [['ls', { t: 'f', d: 'evil', x: true }]] }], ['etc', { t: 'd', c: [['passwd', { t: 'f', d: 'hacked' }]] }]] } }, { now: () => T0 });
    check('hostile: names kept only when valid', h.list('/home/student').join(','), 'constructor,ok,ok2,__proto__');
    check('hostile: dictionaries have no prototype', Object.getPrototypeOf(h.stat('/home/student').c), null);
    check('hostile: __proto__ is just a file', h.read('/home/student/__proto__'), 'p');
    check('hostile: exec bit must be true', h.stat('/home/student/ok').x, false);
    check('hostile: bad bin dropped', h.stat('/home/student/ok').bin, undefined);
    check('hostile: good bin kept, std checked', h.stat('/home/student/ok2').bin.std, 'gnu++20');
    check('hostile: system not replaced', h.read('/etc/passwd').startsWith('root:'), true);
    check('hostile: /bin not replaced', h.stat('/bin/ls').d, '');
    check('hostile: cwd checked', h.cwd, '/etc');
    const deep = (n) => n === 0 ? { t: 'd', c: [] } : { t: 'd', c: [['d', deep(n - 1)]] };
    const dfs = SHELL.makeFS({ v: 1, root: { t: 'd', c: [['home', { t: 'd', c: [['student', deep(60)]] }]] } }, { now: () => T0 });
    check('hostile: depth capped', dfs.walk('/home').length <= SHELL.LIMITS.depth + 2, true);
    const many = { t: 'd', c: [] }; for (let i = 0; i < 700; i++) many.c.push(['f' + i, { t: 'f', d: 'x' }]);
    const mfs = SHELL.makeFS({ v: 1, root: { t: 'd', c: [['home', { t: 'd', c: [['student', many]] }]] } }, { now: () => T0 });
    check('hostile: file count capped', mfs.usage().files, SHELL.LIMITS.files);
    check('garbage saved copy', SHELL.makeFS('nonsense', { now: () => T0 }).cwd, '/home/student');
    check('garbage saved copy 2', SHELL.makeFS({ root: 5 }, { now: () => T0 }).isDir('/home/student'), true);
  }

  // ---- the parser
  {
    const w = (line) => SHELL.parse(line).items[0].first.cmds[0].words.map((x) => x.parts);
    check('quotes', JSON.stringify(w('echo "a b" \'c $d\' e\\ f')), JSON.stringify([[{ v: 'echo', q: false }], [{ v: 'a b', q: true }], [{ v: 'c $d', q: true }], [{ v: 'e', q: false }, { v: ' ', q: true }, { v: 'f', q: false }]]));
    check('variables', JSON.stringify(w('echo $x ${y}z "$?"')[1]), JSON.stringify([{ x: 'var', v: 'x', q: false }]));
    check('variables 2', JSON.stringify(w('echo $x ${y}z "$?"')[2]), JSON.stringify([{ x: 'var', v: 'y', q: false }, { v: 'z', q: false }]));
    check('variables 3', JSON.stringify(w('echo $x ${y}z "$?"')[3]), JSON.stringify([{ x: 'var', v: '?', q: true }]));
    check('substitution', JSON.stringify(w('echo $(ls -l | wc) $((1+2))')[1]), JSON.stringify([{ x: 'sub', v: 'ls -l | wc', q: false }]));
    check('arith', JSON.stringify(w('echo $(ls -l | wc) $((1+2))')[2]), JSON.stringify([{ x: 'arith', v: '1+2', q: false }]));
    check('backslash in double quotes keeps \\n', JSON.stringify(w('printf "a\\nb"')[1]), JSON.stringify([{ v: 'a', q: true }, { v: '\\', q: true }, { v: 'nb', q: true }]));
    check('comment', w('echo a # not this').length, 2);
    check('empty quotes are a word', w('echo "" x').length, 3);
    const p = SHELL.parse('a | b && c || d; e');
    check('list', p.items.length, 2); check('andor', p.items[0].rest.map((r) => r.op).join(), '&&,||'); check('pipe', p.items[0].first.cmds.length, 2);
    const r = SHELL.parse('cat < in > out 2>> err 2>&1').items[0].first.cmds[0].redirs.map((x) => x.op);
    check('redirs', r.join(), '<,>,2>>,2>&1');
    check('assign', JSON.stringify(SHELL.parse('X=1 Y="a b" cmd').items[0].first.cmds[0].assigns.map((a) => a[0])), '["X","Y"]');
    check('if', SHELL.parse('if true; then echo a; elif false; then echo b; else echo c; fi').items[0].first.cmds[0].k, 'if');
    check('for', SHELL.parse('for x in a b; do echo $x; done').items[0].first.cmds[0].name, 'x');
    check('for over args', SHELL.parse('for x\ndo echo $x\ndone').items[0].first.cmds[0].words, null);
    check('while', SHELL.parse('while [ 1 ]; do :; done | cat').items[0].first.cmds.length, 2);
    check('multi-line', SHELL.parse('a\nb\n\nc').items.length, 3);
    for (const [line, msg] of [['echo "x', /matching `"'/], ["echo 'x", /matching `''/], ['ls |', /unexpected end of file/], ['| ls', /unexpected token `\|'/], ['echo $(ls', /matching `\)'/], ['if true; then echo', /expected fi/], ['for in; do; done', /for needs a variable name/], ['ls &', /background jobs/], ['fi', /unexpected token `fi'/], ['echo a;; b', /`;;'/], ['echo ${x', /matching `}'/]]) {
      let got = ''; try { SHELL.parse(line); } catch (e) { got = e.message; } check('syntax error: ' + line, got, msg);
    }
    check('arith ops', [SHELL.arith('1 + 2 * 3', () => ''), SHELL.arith('(1 + 2) * 3', () => ''), SHELL.arith('7 / 2', () => ''), SHELL.arith('-7 % 3', () => ''), SHELL.arith('2 ** 3 ** 2', () => ''), SHELL.arith('3 > 2 && 1', () => ''), SHELL.arith('x + 1', (n) => n === 'x' ? '41' : '')].join(), '7,9,3,-1,512,1,42');
    check('brace', SHELL.braceExpand('f{1..3}.{txt,md}').join(' '), 'f1.txt f1.md f2.txt f2.md f3.txt f3.md');
    check('brace reversed', SHELL.braceExpand('{3..1}').join(' '), '3 2 1');
    check('brace huge is left alone', SHELL.braceExpand('{1..999999}').join(' '), '{1..999999}');
    check('glob regexp', [SHELL.globToRegExp('*.txt').test('a.txt'), SHELL.globToRegExp('*.txt').test('a/b.txt'), SHELL.globToRegExp('?.py').test('ab.py'), SHELL.globToRegExp('[a-c]*').test('b1'), SHELL.globToRegExp('[!a]x').test('ax'), SHELL.globToRegExp('\\*x').test('*x'), SHELL.globToRegExp('\\*x').test('ax')].join(), 'true,false,false,true,false,true,false');
  }

  // ---- commands: output and error text
  {
    const { fs, sh, run } = fresh();
    eq('pwd', await run('pwd'), '/home/student\n', 0);
    eq('prompt', { out: sh.prompt(), exit: 0 }, 'student@lab:~$ ');
    eq('mkdir + ls', await run('mkdir notes projects; ls'), 'notes  projects\n', 0);
    eq('cd + prompt', { out: (await run('cd notes')).out + sh.prompt(), exit: 0 }, 'student@lab:~/notes$ ');
    eq('cd missing', await run('cd nowhere'), 'bash: cd: nowhere: No such file or directory\n', 1);
    eq('cd file', await run('echo x > f.txt; cd f.txt'), 'bash: cd: f.txt: Not a directory\n', 1);
    eq('cd too many', await run('cd a b'), 'bash: cd: too many arguments\n', 1);
    eq('cd ..', await run('cd ..; pwd'), '/home/student\n');
    eq('cd -', await run('cd notes; cd -; pwd'), '/home/student\n/home/student\n');
    eq('cd home', await run('cd /tmp; cd; pwd'), '/home/student\n');
    eq('ls missing', await run('ls nope'), "ls: cannot access 'nope': No such file or directory\n", 2);
    eq('ls -a', await run('ls -a notes'), '.  ..  f.txt\n');
    eq('ls several', await run('ls notes projects'), 'notes:\nf.txt\n\nprojects:\n');
    eq('ls -F', await run('ls -F'), 'notes/  projects/\n');
    eq('ls -d', await run('ls -d notes'), 'notes\n');
    eq('ls -l', await run('ls -l notes'), /^total 4\n-rw-r--r-- 1 student student 2 Oct  1 \d\d:\d\d f\.txt\n$/);
    eq('ls dir in pipe: one per line', await run('ls | cat'), 'notes\nprojects\n');
    eq('ls order', await run('cd /tmp; touch b.txt A.txt _c.txt a.txt; ls; cd; rm /tmp/*.txt'), 'a.txt  A.txt  b.txt  _c.txt\n');
    eq('ls order ignores punctuation like a terminal', await run('cd /tmp; touch ab.txt abc.txt a_d.txt; ls; cd; rm /tmp/*.txt'), 'abc.txt  ab.txt  a_d.txt\n');
    eq('ls bad option', await run('ls -z'), "ls: invalid option -- 'z'\nTry 'man ls' for help.\n", 2);
    eq('mkdir exists', await run('mkdir notes'), "mkdir: cannot create directory 'notes': File exists\n", 1);
    eq('mkdir missing parent', await run('mkdir a/b/c'), "mkdir: cannot create directory 'a/b/c': No such file or directory\n", 1);
    eq('mkdir -p', await run('mkdir -p a/b/c; mkdir -p a/b/c; find a'), 'a\na/b\na/b/c\n', 0);
    eq('mkdir braces', await run('mkdir {x,y,z}; ls -d x y z; rmdir x y z'), 'x  y  z\n');
    eq('rmdir not empty', await run('rmdir a'), "rmdir: failed to remove 'a': Directory not empty\n", 1);
    eq('touch and echo >', await run('touch t.txt; echo hello > h.txt; cat t.txt h.txt'), 'hello\n');
    eq('touch missing dir', await run('touch nope/x'), "touch: cannot touch 'nope/x': No such file or directory\n", 1);
    eq('cat missing', await run('cat nope'), 'cat: nope: No such file or directory\n', 1);
    eq('cat dir', await run('cat notes'), 'cat: notes: Is a directory\n', 1);
    eq('cat -n', await run('printf "a\\nb\\n" > ab.txt; cat -n ab.txt'), '     1\ta\n     2\tb\n');
    eq('cat several and >', await run('cat ab.txt h.txt > all.txt; cat all.txt'), 'a\nb\nhello\n');
    eq('>> appends', await run('echo more >> h.txt; cat h.txt'), 'hello\nmore\n');
    eq('> truncates first', await run('cat h.txt > h.txt; wc -c h.txt'), '0 h.txt\n');
    eq('> into missing dir', await run('echo x > nope/f'), 'bash: nope/f: No such file or directory\n', 1);
    eq('> onto a dir', await run('echo x > notes'), 'bash: notes: Is a directory\n', 1);
    eq('> system', await run('echo x > /etc/passwd; cat /etc/hostname'), 'bash: /etc/passwd: Permission denied\nlab\n');
    eq('< file', await run('wc -l < ab.txt'), '2\n');
    eq('< missing', await run('cat < nope'), 'bash: nope: No such file or directory\n', 1);
    eq('2>', await run('ls nope 2> err.txt; cat err.txt'), "ls: cannot access 'nope': No such file or directory\n");
    eq('2>&1 |', await run('ls nope 2>&1 | wc -l'), '1\n');
    eq('/dev/null', await run('ls nope 2>/dev/null; echo $?'), '2\n');
    eq('cp', await run('cp ab.txt copy.txt; cat copy.txt'), 'a\nb\n');
    eq('cp into dir', await run('cp ab.txt notes; ls notes'), 'ab.txt  f.txt\n');
    eq('cp missing', await run('cp nope x'), "cp: cannot stat 'nope': No such file or directory\n", 1);
    eq('cp dir without -r', await run('cp notes n2'), "cp: -r not specified; omitting directory 'notes'\n", 1);
    eq('cp -r', await run('cp -r notes n2; ls n2'), 'ab.txt  f.txt\n');
    eq('cp many to file', await run('cp ab.txt h.txt copy.txt'), "cp: target 'copy.txt' is not a directory\n", 1);
    eq('cp one arg', await run('cp ab.txt'), "cp: missing destination file operand after 'ab.txt'\nTry 'cp --help' for more information.\n", 1);
    eq('mv rename', await run('mv copy.txt renamed.txt; ls renamed.txt copy.txt'), "ls: cannot access 'copy.txt': No such file or directory\nrenamed.txt\n", 2);
    eq('mv into dir', await run('mv renamed.txt projects/; ls projects'), 'renamed.txt\n');
    eq('mv missing', await run('mv nope x'), "mv: cannot stat 'nope': No such file or directory\n", 1);
    eq('mv dir', await run('mv n2 n3; ls -d n3'), 'n3\n');
    eq('rm', await run('rm t.txt; ls t.txt'), "ls: cannot access 't.txt': No such file or directory\n", 2);
    eq('rm missing', await run('rm nope'), "rm: cannot remove 'nope': No such file or directory\n", 1);
    eq('rm -f missing', await run('rm -f nope'), '', 0);
    eq('rm dir', await run('rm n3'), "rm: cannot remove 'n3': Is a directory\n", 1);
    eq('rm -r', await run('rm -r n3; ls -d n3'), "ls: cannot access 'n3': No such file or directory\n", 2);
    eq('rm -r home refused', await run('rm -rf ~'), "rm: refusing to remove '/home/student': it is your home directory\n", 1);
    eq('rm system', await run('rm /bin/ls'), "rm: cannot remove '/bin/ls': Permission denied\n", 1);
    eq('rm wildcard', await run('touch x1.tmp x2.tmp; rm *.tmp; ls *.tmp'), "ls: cannot access '*.tmp': No such file or directory\n", 2);
    eq('wildcard no match stays literal', await run('echo *.zzz'), '*.zzz\n');
    eq('wildcard quoted', await run('echo "*.txt" \'*.txt\''), '*.txt *.txt\n');
    eq('wildcard', await run('echo *.txt'), 'ab.txt all.txt err.txt h.txt\n');
    eq('wildcard ?', await run('echo ?.txt'), 'h.txt\n');
    eq('wildcard in dirs', await run('echo */*.txt'), 'notes/ab.txt notes/f.txt projects/renamed.txt\n');
    eq('wildcard hides dotfiles', await run('touch .secret; echo *; echo .s*; rm .secret'), 'a ab.txt all.txt err.txt h.txt notes projects\n.secret\n');
    eq('tilde', await run('echo ~ ~/x; echo "~"'), '/home/student /home/student/x\n~\n');
    eq('head', await run('seq 20 | head -3'), '1\n2\n3\n');
    eq('head -n', await run('seq 20 | head -n 2'), '1\n2\n');
    eq('tail', await run('seq 20 | tail -2'), '19\n20\n');
    eq('head missing', await run('head nope'), 'head: cannot open \'nope\' for reading: No such file or directory\n', 1);
    eq('head two files', await run('head -1 ab.txt h.txt'), '==> ab.txt <==\na\n\n==> h.txt <==\n');
    eq('wc', await run('printf "one two\\nthree\\n" > w.txt; wc w.txt'), ' 2  3 14 w.txt\n');
    eq('wc -l pipe', await run('cat w.txt | wc -l'), '2\n');
    eq('wc several', await run('wc -l w.txt ab.txt'), ' 2 w.txt\n 2 ab.txt\n 4 total\n');   // GNU: wide enough for the files' total size
    eq('wc missing', await run('wc nope'), 'wc: nope: No such file or directory\n', 1);
    eq('grep', await run('grep t w.txt'), 'one two\nthree\n', 0);
    eq('grep -n', await run('grep -n three w.txt'), '2:three\n');
    eq('grep -i -c', await run('grep -ic T w.txt'), '2\n');
    eq('grep -v', await run('grep -v one w.txt'), 'three\n');
    eq('grep -w', await run('grep -w thre w.txt; echo $?'), '1\n');
    eq('grep no match exit', await run('grep zzz w.txt'), '', 1);
    eq('grep -q', await run('if grep -q one w.txt; then echo found; fi'), 'found\n');
    eq('grep missing', await run('grep x nope'), 'grep: nope: No such file or directory\n', 2);
    eq('grep dir', await run('grep x notes'), 'grep: notes: Is a directory\n', 2);
    eq('grep -r', await run('grep -r hello . | sort'), './all.txt:hello\n');
    eq('grep several files prefix', await run('grep a ab.txt all.txt'), 'ab.txt:a\nall.txt:a\n');
    eq('grep -l', await run('grep -l a ab.txt w.txt all.txt'), 'ab.txt\nall.txt\n');
    eq('grep regex', await run('grep "^t" w.txt; grep -F "^t" w.txt; echo $?'), 'three\n1\n');
    eq('grep bad regex is text', await run('echo "a(b" | grep "a("'), 'a(b\n');
    eq('grep no args', await run('grep'), /^Usage: grep/, 2);
    eq('sort', await run('printf "pear\\napple\\nFig\\n" > s.txt; sort s.txt'), 'Fig\napple\npear\n');
    eq('sort -f', await run('sort -f s.txt'), 'apple\nFig\npear\n');
    eq('sort -r', await run('sort -r s.txt'), 'pear\napple\nFig\n');
    eq('sort -n', await run('printf "10\\n9\\n100\\n" | sort -n'), '9\n10\n100\n');
    eq('sort text numbers', await run('printf "10\\n9\\n100\\n" | sort'), '10\n100\n9\n');
    eq('sort -u', await run('printf "b\\na\\nb\\n" | sort -u'), 'a\nb\n');
    eq('sort -k -t', await run('printf "ann,3\\nbob,1\\n" | sort -t , -k 2 -n'), 'bob,1\nann,3\n');
    eq('uniq -c', await run('printf "b\\na\\nb\\nb\\n" | sort | uniq -c'), '      1 a\n      3 b\n');
    eq('uniq -d', await run('printf "a\\na\\nb\\n" | uniq -d'), 'a\n');
    eq('cut -d -f', await run('printf "ann,3,x\\nbob,1,y\\n" | cut -d , -f 1,3'), 'ann,x\nbob,y\n');
    eq('cut -f range', await run('printf "a,b,c,d\\n" | cut -d , -f 2-'), 'b,c,d\n');
    eq('cut -c', await run('echo abcdef | cut -c 2-4'), 'bcd\n');
    eq('cut no delimiter line', await run('printf "a,b\\nplain\\n" | cut -d , -f 2'), 'b\nplain\n');
    eq('cut without list', await run('cut w.txt'), /must specify/, 1);
    eq('tr', await run('echo hello | tr a-z A-Z'), 'HELLO\n');
    eq('tr -d', await run('echo "a,b,c" | tr -d ,'), 'abc\n');
    eq('tr classes', await run('echo "Hi There" | tr "[:upper:]" "[:lower:]"'), 'hi there\n');
    eq('tr -s', await run('echo "a   b" | tr -s " "'), 'a b\n');
    eq('tr newline', await run("echo 'a b' | tr ' ' '\\n'"), 'a\nb\n');
    eq('sed s', await run('echo "colour colour" | sed "s/colour/color/"'), 'color colour\n');
    eq('sed s g', await run('echo "colour colour" | sed "s/colour/color/g"'), 'color color\n');
    eq('sed -i', await run('sed -i "s/one/ONE/" w.txt; cat w.txt'), 'ONE two\nthree\n');
    eq('sed -n p', await run('seq 5 | sed -n 2,3p'), '2\n3\n');
    eq('sed d', await run('seq 3 | sed 2d'), '1\n3\n');
    eq('sed unknown', await run('seq 3 | sed y/a/b/'), /unknown command: 'y'/, 1);
    eq('rev', await run('echo abc | rev'), 'cba\n');
    eq('tac', await run('seq 3 | tac'), '3\n2\n1\n');
    eq('nl', await run('printf "a\\n\\nb\\n" | nl'), '     1\ta\n       \n     2\tb\n');
    eq('diff same', await run('diff ab.txt ab.txt'), '', 0);
    eq('diff', await run('printf "a\\nc\\n" > ac.txt; diff ab.txt ac.txt'), '2c2\n< b\n---\n> c\n', 1);
    eq('diff add', await run('printf "a\\nb\\nc\\n" > abc.txt; diff ab.txt abc.txt'), '2a3\n> c\n', 1);
    eq('diff delete', await run('diff abc.txt ab.txt'), '3d2\n< c\n', 1);
    eq('diff missing', await run('diff ab.txt nope'), 'diff: nope: No such file or directory\n', 2);
    eq('tee', await run('echo both | tee t.txt; cat t.txt'), 'both\nboth\n');
    eq('xargs', await run('echo p q | xargs mkdir; ls -d p q; rmdir p q'), 'p  q\n');
    eq('find', await run('find notes'), 'notes\nnotes/ab.txt\nnotes/f.txt\n');
    eq('find -name', await run('find . -name "*.txt" | head -2'), './abc.txt\n./ab.txt\n');
    eq('find -type d', await run('find . -type d'), '.\n./a\n./a/b\n./a/b/c\n./notes\n./projects\n');
    eq('find -iname', await run('find . -iname "AB.TXT"'), './ab.txt\n./notes/ab.txt\n');
    eq('find -empty', await run('find . -empty -type d'), './a/b/c\n');
    eq('find missing', await run('find nope'), "find: 'nope': No such file or directory\n", 1);
    eq('find bad', await run('find . -size 1'), "find: unknown predicate '-size'\n", 1);
    eq('tree', await run('tree a'), 'a\n└── b\n    └── c\n\n2 directories, 0 files\n');
    eq('tree many', await run('tree notes'), 'notes\n├── ab.txt\n└── f.txt\n\n0 directories, 2 files\n');
    eq('echo', await run('echo a  b "c  d"'), 'a b c  d\n');
    eq('echo -n -e', await run('echo -n x; echo -e "\\ty"'), 'x\ty\n');
    eq('echo no -e keeps \\n', await run('echo "a\\nb"'), 'a\\nb\n');
    eq('printf', await run('printf "%s=%d|%5.1f|%-3s|%03d|%%\\n" x 42 3.14159 ab 7'), 'x=42|  3.1|ab |007|%\n');
    eq('printf reuse', await run('printf "%s\\n" a b'), 'a\nb\n');
    eq('seq', await run('seq 3; seq 2 4; seq 0 5 10'), '1\n2\n3\n2\n3\n4\n0\n5\n10\n');
    eq('seq bad', await run('seq x'), "seq: invalid floating point argument: 'x'\n", 1);
    eq('date', await run('date +%Y-%m'), /^\d{4}-\d\d\n$/);
    eq('whoami hostname', await run('whoami; hostname; id'), 'student\nlab\nuid=1000(student) gid=1000(student) groups=1000(student)\n');
    eq('file', await run('file notes ab.txt nope'), "notes:  directory\nab.txt: ASCII text\nnope:   cannot open 'nope' (No such file or directory)\n", 1);
    eq('chmod +x and ./', await run('printf "echo ran\\n" > s.sh; ./s.sh; chmod +x s.sh; ./s.sh; ls -l s.sh | cut -c 1-10'), 'bash: ./s.sh: Permission denied\nran\n-rwxr-xr-x\n');
    eq('chmod 644', await run('chmod 644 s.sh; ./s.sh'), 'bash: ./s.sh: Permission denied\n', 126);
    eq('chmod bad', await run('chmod zz s.sh'), "chmod: invalid mode: 'zz'\n", 1);
    eq('./ missing', await run('./nope'), 'bash: ./nope: No such file or directory\n', 127);
    eq('./ dir', await run('./notes'), 'bash: ./notes: Is a directory\n', 126);
    eq('command not found', await run('frobnicate'), 'bash: frobnicate: command not found\n', 127);
    eq('/bin/ls works', await run('/bin/ls notes'), 'ab.txt  f.txt\n');
    eq('history', await run('history | tail -1'), /^ *\d+  history \| tail -1\n$/);
    eq('which type', await run('which ls cd; echo $?; type cd ls'), '/bin/ls\n1\ncd is a shell builtin\nls is /bin/ls\n');
    eq('man', await run('man ls | head -2'), /^LS\(1\) +User Commands\n\n$/);
    eq('man missing', await run('man frob'), 'No manual entry for frob\n', 16);
    eq('help', await run('help | grep -c .'), /^\d\d\n$/);
    eq('sudo', await run('sudo ls'), 'student is not in the sudoers file.  This incident will be reported.\n', 1);
    eq('git', await run('git status'), /no network/, 1);
    eq('vi', await run('vi s.sh'), /use nano s\.sh/, 127);
    eq('exit at prompt', await run('true; exit'), '(this terminal stays open: close its panel to leave)\n', 0);
  }

  // ---- the shell language
  {
    const { sh, run } = fresh();
    eq('variables', await run('name=Ada; echo "Hi, $name!"; echo ${name}s; echo \'$name\''), 'Hi, Ada!\nAdas\n$name\n');
    eq('unset var is empty', await run('echo "[$nothing]"'), '[]\n');
    eq('env vars', await run('echo $HOME $USER $PWD'), '/home/student student /home/student\n');
    eq('export', await run('export X=1; echo $X; unset X; echo "[$X]"'), '1\n[]\n');
    eq('prefix assignment', await run('A=1 true; echo "[$A]"'), '[]\n');
    eq('status', await run('ls nope 2>/dev/null; echo $?; true; echo $?'), '2\n0\n');
    eq('&& ||', await run('true && echo a; false && echo b; false || echo c; true || echo d'), 'a\nc\n');
    eq('!', await run('! false && echo ok'), 'ok\n');
    eq('; sequence', await run('echo 1; echo 2; echo 3'), '1\n2\n3\n');
    eq('newlines', await run('echo 1\necho 2'), '1\n2\n');
    eq('pipe', await run('printf "c\\nb\\na\\n" | sort | head -1'), 'a\n');
    eq('pipe uses stdin not keyboard', await run('echo x | cat'), 'x\n');
    eq('pipeline status is the last', await run('false | true; echo $?; true | false; echo $?'), '0\n1\n');
    eq('$()', await run('echo "there are $(ls / | wc -l) things"'), 'there are 6 things\n');
    eq('$() nested', await run('echo $(echo $(echo deep))'), 'deep\n');
    eq('backticks', await run('echo `echo bt`'), 'bt\n');
    eq('$(( ))', await run('x=5; echo $((x * 2)) $((x - 10)) $((10 / 3)) $((2 ** 8))'), '10 -5 3 256\n');
    eq('arith division by zero', await run('echo $((1 / 0))'), 'bash: 1 / 0: division by 0 (error token is "0")\n', 1);
    eq('for', await run('for i in 1 2 3; do echo "n=$i"; done'), 'n=1\nn=2\nn=3\n');
    eq('for over glob', await run('touch a.txt b.txt; for f in *.txt; do echo $f; done'), 'a.txt\nb.txt\n');
    eq('for over $()', await run('for i in $(seq 2); do echo $i; done'), '1\n2\n');
    eq('for with braces', await run('for i in {1..3}; do echo -n $i; done; echo'), '123\n');
    eq('while', await run('n=3; while [ $n -gt 0 ]; do echo $n; n=$((n - 1)); done'), '3\n2\n1\n');
    eq('until', await run('n=0; until [ $n -ge 2 ]; do n=$((n + 1)); done; echo $n'), '2\n');
    eq('if', await run('if [ -f a.txt ]; then echo yes; else echo no; fi; if [ -f zz ]; then echo yes; else echo no; fi'), 'yes\nno\n');
    eq('elif', await run('x=5; if [ $x -lt 3 ]; then echo small; elif [ $x -lt 10 ]; then echo medium; else echo big; fi'), 'medium\n');
    eq('test strings', await run('[ abc = abc ] && echo 1; [ abc != abd ] && echo 2; [ -z "" ] && echo 3; [ -n "x" ] && echo 4; test -d /etc && echo 5'), '1\n2\n3\n4\n5\n');
    eq('test numbers', await run('[ 10 -gt 9 ] && echo yes; [ 10 -lt 9 ] || echo no; [ 3 -eq 3 ] && [ 3 -ne 4 ] && echo both'), 'yes\nno\nboth\n');
    eq('test bad', await run('[ a -gt 1 ]'), "bash: [: a: integer expression expected\n", 2);
    eq('test missing ]', await run('[ a = a'), "bash: [: missing `]'\n", 2);
    eq('group', await run('{ echo a; echo b; } | wc -l'), '2\n');
    eq('subshell keeps cwd', await run('(cd /tmp; pwd); pwd'), '/tmp\n/home/student\n');
    eq('for with redirect', await run('for i in 1 2; do echo $i; done > nums.txt; cat nums.txt'), '1\n2\n');
    eq('while read', await run('while read w; do echo "<$w>"; done < nums.txt'), '<1>\n<2>\n');
    eq('read -p', await run('read -p "Name? " n; echo "hi $n"'), 'hi typed\n');
    eq('read from pipe', await run('echo "a b c" | { read x y; echo "$y|$x"; }'), 'b c|a\n');
    eq('script', await run('printf \'#!/bin/bash\\necho "args=$# first=$1 all=$@"\\nexit 3\\n\' > s.sh; bash s.sh p q; echo "got $?"'), 'args=2 first=p all=p q\ngot 3\n');
    eq('script with ./ and args', await run('chmod +x s.sh; ./s.sh z'), 'args=1 first=z all=z\n', 3);
    eq('source keeps variables', await run('echo "SV=set" > v.sh; source v.sh; echo $SV; . v.sh'), 'set\n');
    eq('bash -c', await run('bash -c "echo in; echo line"'), 'in\nline\n');
    eq('bash missing', await run('bash nope.sh'), 'bash: nope.sh: No such file or directory\n', 127);
    eq('script syntax error', await run('echo "echo \\"oops" > bad.sh; bash bad.sh'), /^bad\.sh: line 1: unexpected EOF/, 2);
    eq('exit in script does not stop the line', await run('echo "exit 7" > e.sh; bash e.sh; echo after $?'), 'after 7\n');
    eq('__proto__ as a file name', await run('mkdir __proto__; echo x > __proto__/constructor; cat __proto__/constructor; ls -d __proto__; rm -r __proto__'), 'x\n__proto__\n');
    eq('loop limit', await run('while true; do :; done'), /stopped: more than \d+ commands/, 1);
    eq('loop limit in script', await run('printf "while true; do\\n  :\\ndone\\n" > inf.sh; bash inf.sh'), /stopped: more than/, 1);
    eq('output limit', await run('yes 2>/dev/null; x=a; while true; do x="$x$x$x$x"; echo $x; done > big.txt'), /stopped: the command produced more output/, 1);
    eq('big file limit', await run('ls -l big.txt | cut -c 1-1'), '-\n');
    eq('too many files', await run('mkdir many; cd many; for i in $(seq 600); do touch f$i; done; cd ..; ls many | wc -l'), /No space|Too many files/, undefined);
    check('file count capped', (await run('ls many | wc -l')).out <= SHELL.LIMITS.files + '\n', true);
    eq('syntax error status', await run('echo "unclosed'), "bash: unexpected EOF while looking for matching `\"'\n", 2);
    eq('cancel', await (async () => { const p = run('sleep 3; echo after'); sh.cancel(); return p; })(), '^C\n', 130);
    eq('history dedupes', await run('history | tail -2 | head -1'), /sleep 3; echo after/);
    eq('control char in input', await run('echo a\u0000b'), 'ab\n');
    eq('__proto__ as a variable name', await run('__proto__=1; echo "[$__proto__]"; constructor=2; echo $constructor'), '[1]\n2\n');
    eq('tab completion commands', { out: sh.complete('gre').items.join(','), exit: 0 }, 'grep ');
    eq('tab completion files', { out: sh.complete('cat a.').items.join(','), exit: 0 }, 'a.txt ');
    eq('tab completion dirs', { out: sh.complete('cd ma').items.join(','), exit: 0 }, 'many/');
    eq('tab completion after pipe', { out: sh.complete('ls | wc').items.join(','), exit: 0 }, 'wc ');
    eq('tab completion in a dir', { out: sh.complete('ls many/f1').items.length > 10, exit: 0 }, true);
    check('tab completion: cd lists no files', sh.complete('cd ').items.every((i) => i.endsWith('/')), true);
    eq('tab completion: ..', { out: sh.complete('cd ..').items.join(','), exit: 0 }, '../');
    await run('rm -r many; touch "my file.txt"; mkdir "odd dir"');   // (many held the 500 files of the cap test)
    eq('tab completion escapes spaces', { out: sh.complete('cat my').items.join(','), exit: 0 }, 'my\\ file.txt ');
    eq('tab completion inside quotes', { out: sh.complete('cat "my').items.join(','), exit: 0 }, '"my file.txt" ');
    eq('tab completion after an escaped space', { out: sh.complete('cat my\\ fi').items.join(','), exit: 0 }, 'my\\ file.txt ');
    eq('tab completion display is bare', { out: sh.complete('ls od').display.join(','), exit: 0 }, 'odd dir/');
    await run('rm "my file.txt"; rmdir "odd dir"');
  }

  // ---- programs, through the hooks
  {
    const { sh, run, asks } = fresh({ nano: async (p, text) => text + 'edited\n', edit: (abs) => 'opened ' + abs, setup: (n) => n === 'lesson2' ? 'made files' : null });
    eq('python', await run('echo "print(1)" > h.py; python h.py; python3 h.py a b'), 'python:print(1)\npython:print(1) a,b\n', 0);
    eq('python missing', await run('python nope.py'), "python: can't open file '/home/student/nope.py': [Errno 2] No such file or directory\n", 2);
    eq('python no args', await run('python'), /interactive Python shell is not available/, 2);
    eq('python < file', await run('echo 5 > in.txt; python h.py < in.txt'), 'python:print(1)<"5\\n"\n');
    eq('python | pipe', await run('echo 7 | python h.py'), 'python:print(1)<"7\\n"\n');
    eq('python > file', await run('python h.py > out.txt; cat out.txt'), 'python:print(1)\n');
    eq('python error status', await run('echo boom > b.py; python b.py; echo $?'), 'python:boom\nError: boom\n1\n');
    eq('python shebang', await run('printf "#!/usr/bin/env python3\\nprint(2)\\n" > r.py; chmod +x r.py; ./r.py'), 'python:#!/usr/bin/env python3\nprint(2)\n');
    eq('javac + java', await run('echo "public class Main { }" > Main.java; javac Main.java; ls Main.class; java Main'), 'Main.class\njava:public class Main { }\n', 0);
    eq('java without class', await run('rm Main.class; java Main'), 'Error: Could not find or load main class Main\nCaused by: java.lang.ClassNotFoundException: Main\n(there is a Main.java: compile it first with javac Main.java)\n', 1);
    eq('java source launcher', await run('java Main.java'), 'java:public class Main { }\n');
    eq('javac wrong name', await run('echo "public class Foo { }" > Main.java; javac Main.java'), 'Main.java:1: error: class Foo is public, should be declared in a file named Foo.java\n1 error\n', 1);
    eq('javac error', await run('echo "class Main { bad }" > Main.java; javac Main.java; ls Main.class'), "Main.java:1:1: error: bad\nls: cannot access 'Main.class': No such file or directory\n");
    eq('javac missing', await run('javac Nope.java'), 'error: file not found: Nope.java\nUsage: javac <options> <source files>\n', 2);
    eq('javac several files: a .class for every class', await run('rm -f *.class; printf "public class Main { }\\nclass Helper { }\\n" > Main.java; printf "import java.util.*;\\npublic class Dog { }\\n" > Dog.java; javac Main.java Dog.java; ls *.class'), 'Dog.class  Helper.class  Main.class\n', 0);
    eq('java runs the joined program, its main class named', await run('java Main'), /^java:import java\.util\.\*;\n\/\/@file Main\.java\npublic class Main \{ \}\nclass Helper \{ \}\n\n\/\/@file Dog\.java\n\npublic class Dog \{ \}\n$/);
    eq('javac *.java: two public classes in one file', await run('printf "public class Main { }\\npublic class Cat { }\\n" > Main.java; javac *.java'), 'Main.java:2: error: class Cat is public, should be declared in a file named Cat.java\n1 error\n', 1);
    eq('javac several files: nothing compiled if one is missing', await run('rm -f *.class; javac Dog.java Nope.java; ls *.class'), "error: file not found: Nope.java\nUsage: javac <options> <source files>\nls: cannot access '*.class': No such file or directory\n");
    await run('rm -f Dog.java Main.class Helper.class Dog.class');
    eq('java < stdin', await run('echo "class Main { Scanner }" > Main.java; javac Main.java && java Main < in.txt'), 'java:class Main { Scanner }<"5\\n"\n');
    eq('java reads keyboard', await run('java Main'), /reads input.*\njava:class Main \{ Scanner \}<"typed\\n/);
    eq('g++', await run('echo "int main() { return 0; }" > m.cpp; g++ m.cpp -o m; ./m; ls -F m'), 'cpp:int main() { return 0; }\nm*\n', 0);
    eq('g++ default name', await run('g++ m.cpp; ./a.out'), 'cpp:int main() { return 0; }\n');
    eq('g++ -std', await run('g++ -std=c++17 -Wall m.cpp -o m17 && ./m17'), 'cpp:int main() { return 0; }\n');
    eq('g++ error', await run('echo "int main() { bad }" > e.cpp; g++ e.cpp -o e; ls e'), "e.cpp:1:1: error: bad\nls: cannot access 'e': No such file or directory\n");
    eq('g++ no files', await run('g++'), 'g++: fatal error: no input files\ncompilation terminated.\n', 1);
    eq('g++ missing', await run('g++ nope.cpp'), 'g++: error: nope.cpp: No such file or directory\ng++: fatal error: no input files\ncompilation terminated.\n', 1);
    eq('binary is not text', await run('file m; cat m | cut -c 2-4'), 'm: ELF 64-bit LSB executable, x86-64\nELF\n');
    eq('cannot nano a binary', await run('nano m'), 'nano: m is a compiled program, not text\n', 1);
    eq('scheme', await run('echo "(display 1)" > f.scm; scheme f.scm'), 'scheme:(display 1)\n');
    eq('nano', await run('nano note.txt; cat note.txt'), 'edited\n');
    eq('nano dir', await run('mkdir dd; nano dd'), 'nano: dd: Is a directory\n', 1);
    const { run: runW } = fresh({ nano: async (p, text, write) => { write(text + 'first\n'); write(text + 'first\nsecond\n'); return null; } });
    eq('nano saves through write() as it goes', await runW('echo start > w.txt; nano w.txt; cat w.txt'), 'start\nfirst\nsecond\n');
    let writeErr = null; const { run: runE } = fresh({ nano: async (p, text, write) => { writeErr = write('x'.repeat(300000)); return null; } });
    eq('nano: a write that fails is reported to the editor, not written', await runE('nano big.txt; ls big.txt'), "ls: cannot access 'big.txt': No such file or directory\n", 2); check('nano write error text', writeErr, 'File too large');
    eq('edit', await run('edit note.txt'), 'opened /home/student/note.txt\n');
    eq('setup', await run('setup lesson2; setup nope'), 'made files\nsetup: there is no "nope" to set up\n', 1);
    const { run: run2 } = fresh();
    eq('no hooks: nano', await run2('nano x'), 'nano: no editor is available here\n', 1);
    eq('no hooks: setup', await run2('setup x'), 'setup: nothing to set up here\n', 1);
  }

  // ---- fixes found by comparing with bash and coreutils (each line is what bash prints)
  {
    const { run } = fresh();
    await run("printf 'banana\\napple\\ncherry\\napple\\nBanana\\n10\\n9\\n100\\n' > fruit.txt; printf 'name,score\\nAda,90\\nBob,85\\nCy,90\\n' > grades.csv; printf 'the cat sat on the mat\\nthe dog\\n' > words.txt; mkdir -p notes/sub; touch notes/a.txt notes/b.md");
    // brace words that do not expand stay as they are (they used to recurse until the stack overflowed); letter ranges
    eq('braces: no expansion', await run('echo {} {x} a{b}c'), '{} {x} a{b}c\n', 0);
    eq('braces: letter ranges', await run('echo {a..e} {e..c}'), 'a b c d e e d c\n', 0);
    eq('braces: a huge range is left alone', await run('echo {1..5000} | wc -c'), '10\n', 0);
    // an option made of digits (ls -1) is an option when the command knows it
    eq('ls -1', await run('ls -1 notes'), 'a.txt\nb.md\nsub\n', 0);
    eq('ls -1a', await run('ls -1a notes | head -2'), '.\n..\n', 0);
    // a wildcard ending in / matches only directories, and keeps the slash
    eq('glob */', await run('echo */ notes/*/'), 'notes/ notes/sub/\n', 0);
    eq('ls -d */', await run('ls -d */'), 'notes/\n', 0);
    // "$@" keeps each argument a word; shift
    await run('printf \'for a in "$@"; do echo "[$a]"; done\\necho $#; shift; echo "$1" $#\\n\' > s.sh');
    eq('"$@" and shift', await run('bash s.sh "one two" three'), '[one two]\n[three]\n2\nthree 1\n', 0);
    eq('"$@" with no arguments is no word', await run('bash -c \'for a in "$@"; do echo "[$a]"; done; echo "x$@y"\''), 'xy\n', 0);
    eq('shift with nothing to shift', await run('shift; echo $?'), '1\n', 0);
    // -i asks first (the keyboard, or the pipe); anything but y is no
    eq('rm -i: no', await run('rm -i fruit.txt; ls fruit.txt'), 'fruit.txt\n', 0);
    eq('rm -i: yes', await run('cp fruit.txt f2; rm -i f2; ls f2', { ask: async () => 'y' }), "ls: cannot access 'f2': No such file or directory\n", 2);
    eq('rm -i: answer from a pipe', await run('cp fruit.txt f3; echo y | rm -i f3; ls f3'), "rm: remove regular file 'f3'? ls: cannot access 'f3': No such file or directory\n", 2);
    eq('cp -i: no', await run('echo old > o.txt; cp -i fruit.txt o.txt; cat o.txt'), 'old\n', 0);
    eq('mv -i: yes', await run('echo old > o.txt; cp fruit.txt f4; mv -i f4 o.txt; head -1 o.txt', { ask: async () => 'yes' }), 'banana\n', 0);
    let asked = ''; await run('echo old > o.txt; cp -i fruit.txt o.txt', { ask: async (p) => { asked = p; return 'n'; } });
    check('cp -i: the question', asked, "cp: overwrite 'o.txt'? ");
    // tail -n +N, head -n -N
    eq('tail -n +2', await run('tail -n +2 grades.csv'), 'Ada,90\nBob,85\nCy,90\n', 0);
    eq('head -n -2', await run('head -n -6 fruit.txt'), 'banana\napple\n', 0);
    eq('head -3 still works', await run('head -3 fruit.txt | tail -1'), 'cherry\n', 0);
    // printf: %o %e, and the format is reused only while it takes arguments
    eq('printf %o %e', await run('printf "%x %o %e %.2E\\n" 255 8 1234.5 0.001'), 'ff 10 1.234500e+03 1.00E-03\n', 0);
    eq('printf without conversions', await run('printf "hi\\n" a b'), 'hi\n', 0);
    // grep: -o -x -e -L, basic regular expressions, POSIX classes
    eq('grep -o', await run('grep -o an fruit.txt'), 'an\nan\nan\nan\n', 0);
    eq('grep -ow', await run('grep -ow the words.txt'), 'the\nthe\nthe\n', 0);
    eq('grep -x', await run('grep -x apple fruit.txt'), 'apple\napple\n', 0);
    eq('grep -e', await run('grep -c -e apple fruit.txt'), '2\n', 0);
    eq('grep -L', await run('grep -L the words.txt fruit.txt'), 'fruit.txt\n', 0);
    eq('grep BRE \\|', await run("grep -c 'cherry\\|dog' fruit.txt words.txt"), 'fruit.txt:1\nwords.txt:1\n', 0);
    eq('grep BRE + is literal', await run("grep 'p+' fruit.txt"), '', 1);
    eq('grep BRE \\+ and groups', await run("grep '\\(an\\)\\{2\\}' fruit.txt; grep -c 'p\\+' fruit.txt"), 'banana\nBanana\n2\n', 0);
    eq('grep -E', await run("grep -E '(an){2}|^9' fruit.txt"), 'banana\nBanana\n9\n', 0);
    eq('grep [[:digit:]]', await run("grep '[[:digit:]]' fruit.txt"), '10\n9\n100\n', 0);
    eq('grep \\< \\>', await run("grep -c '\\<at\\>' words.txt"), '0\n', 1);
    eq('sed with a group', await run("echo banana | sed 's/\\(an\\)/[\\1]/'"), 'b[an]ana\n', 0);
    // tr -c and [:alnum:]
    eq('tr -c', await run('echo hello | tr -c a-z X'), 'helloX', 0);
    eq('tr -cd', await run("echo 'Hello, World 42' | tr -cd '[:alpha:]'"), 'HelloWorld', 0);
    eq('tr [:alnum:]', await run("echo 'ab-1' | tr -d '[:alnum:]'"), '-\n', 0);
    eq('tr -cs', await run("echo 'a  b,,c' | tr -cs a-z ' '"), 'a b c ', 0);
    // ${...}: length, slices, defaults; anything else is a bad substitution, not an empty string
    eq('${#x} ${x:1:3}', await run('s=hello; echo ${#s} ${s:1:3} ${s:2}'), '5 ell llo\n', 0);
    eq('${x:-d}', await run('n=x; e=; echo ${n:-d} ${nope:-d} ${e:-d} ${e-d2}. "${n:+set}" ${z:=zz} $z'), 'x d d . set zz zz\n', 0);
    eq('${1:-d} in a script', await run('bash -c \'echo ${1:-none} ${2:-none}\' _ a'), 'a none\n', 0);
    eq('bad substitution', await run('echo ${s!x}'), 'bash: ${s!x}: bad substitution\n', 1);
    // ${x#pat} ${x%pat} ${x/pat/new} ${x^} (bash agrees on all of these: difftest/shell.txt)
    eq('${f%.txt} ${p##*/} ${p%/*}', await run('f=a.txt; p=/x/y/z.c; echo ${f%.txt} ${p##*/} ${p%/*} ${p#/x} ${p%%/*}.'), 'a z.c /x/y /y/z.c .\n', 0);
    eq('${s/a/b} ${s//a/b}', await run('s=banana; echo ${s/a/b} ${s//a/b} ${s//[an]/_} ${s/#ba/} ${s/%na/!}'), 'bbnana bbnbnb b_____ nana bana!\n', 0);
    eq('${s^^} ${s,} ${s: -3}', await run('s=Hello; echo ${s^^} ${s,} ${s: -3} ${s:1:-1}'), 'HELLO hello llo ell\n', 0);
    eq('a ${...} inside a pattern', await run('d=txt; f=a.txt; echo ${f%.${d}}x ${f%.$d} "${f/$d/md}"'), 'ax a a.md\n', 0);
    eq('a pattern * also matches a slash', await run('p=a/b/c; echo ${p#*/} ${p##*/} ${p%/*} ${p%%/*} ${p//\\//-}'), 'b/c c a/b a a-b-c\n', 0);
    // sort -k N runs to the end of the line; -k N,M; -u compares keys
    eq('sort -k 2', await run("printf 'a x 2\\nb x 1\\n' | sort -k 2"), 'b x 1\na x 2\n', 0);
    eq('sort -k 2,2', await run("printf 'a x 2\\nb y 1\\nc x 1\\n' | sort -k 2,2"), 'a x 2\nc x 1\nb y 1\n', 0);
    eq('sort -nu', await run("printf '1\\n01\\n1.0\\n2\\n' | sort -nu"), '1\n2\n', 0);
    eq('sort -t, -k2 -n', await run('sort -t , -k 2 -n grades.csv | head -2'), 'name,score\nBob,85\n', 0);
    // 2>&1 goes wherever the output goes at that point
    eq('2>&1 > f', await run('ls nope 2>&1 > out.txt; echo ---; cat out.txt'), "ls: cannot access 'nope': No such file or directory\n---\n", 0);
    eq('> f 2>&1', await run('ls nope > out.txt 2>&1; cat out.txt'), "ls: cannot access 'nope': No such file or directory\n", 0);
    eq('2>&1 |', await run('ls nope 2>&1 | wc -l'), '1\n', 0);
    // seq with decimals
    eq('seq 0 0.1 0.3', await run('seq 0 0.1 0.3'), '0.0\n0.1\n0.2\n0.3\n', 0);
    eq('seq 10 -2.5 0', await run('seq 10 -2.5 0 | tr "\\n" " "'), '10.0 7.5 5.0 2.5 0.0 ', 0);
    eq('seq whole numbers', await run('seq 5 -2 1 | tr "\\n" " "'), '5 3 1 ', 0);
    // mv and cp: the same file, a directory into itself
    eq('mv f f', await run('mv fruit.txt fruit.txt'), "mv: 'fruit.txt' and 'fruit.txt' are the same file\n", 1);
    eq('mv d d', await run('mkdir dd; mv dd dd'), "mv: cannot move 'dd' to a subdirectory of itself, 'dd/dd'\n", 1);
    eq('mv d d/sub', await run('mv notes notes/sub'), "mv: cannot move 'notes' to a subdirectory of itself, 'notes/sub/notes'\n", 1);
    eq('cp f f', await run('cp notes/a.txt notes/'), "cp: 'notes/a.txt' and 'notes/a.txt' are the same file\n", 1);
    eq('cp -r d d/sub', await run('cp -r notes notes/sub'), "cp: cannot copy a directory, 'notes', into itself, 'notes/sub/notes'\n", 1);
    // wc prints the total line whenever more than one file was named
    eq('wc total with a missing file', await run('wc -l words.txt nope'), ' 2 words.txt\nwc: nope: No such file or directory\n 2 total\n', 1);
  }
  // ---- more differences from bash and coreutils, found by test_diff.js (each expectation is what bash prints)
  {
    const { run, sh } = fresh();
    await run("printf 'banana\\napple\\ncherry\\n' > fruit.txt; printf 'the cat sat on the mat\\nthe dog\\n' > words.txt; mkdir -p notes/sub; touch notes/a.txt notes/sub/c.txt; echo gamma > notes/sub/c.txt");
    const noAsk = (line) => run(line, { ask: undefined });
    // 1: -i with nothing to answer: the question stays on the line
    eq('rm -i, no answer', await noAsk('rm -i fruit.txt; ls fruit.txt'), "rm: remove regular file 'fruit.txt'? fruit.txt\n", 0);
    eq('cp -i, no answer', await noAsk('cp -i words.txt fruit.txt; head -1 fruit.txt'), "cp: overwrite 'fruit.txt'? banana\n", 0);
    eq('mv -i, no answer', await noAsk('mv -i words.txt fruit.txt; ls words.txt'), "mv: overwrite 'fruit.txt'? words.txt\n", 0);
    // 2: head -c, tail -c
    eq('head -c', await run('head -c 5 fruit.txt'), 'banan', 0);
    eq('tail -c', await run('tail -c 7 fruit.txt'), 'cherry\n', 0);
    eq('head -c -N', await run('head -c -15 fruit.txt'), 'banan', 0);
    // 3: several sources and a target that is missing or not a directory
    eq('mv to a missing target', await run('mv fruit.txt words.txt nope'), "mv: target 'nope': No such file or directory\n", 1);
    eq('cp to a file target', await run('cp fruit.txt words.txt notes/a.txt'), "cp: target 'notes/a.txt' is not a directory\n", 1);
    // 4: the second line of a usage error
    for (const [c, msg] of [['mv', 'mv: missing file operand'], ['cp', 'cp: missing file operand'], ['mkdir', 'mkdir: missing operand'], ['touch', 'touch: missing file operand'], ['rm', 'rm: missing operand'], ['rmdir', 'rmdir: missing operand']]) eq(c + ' with no operand', await run(c), msg + "\nTry '" + c + " --help' for more information.\n", 1);
    eq('mv one operand', await run('mv fruit.txt'), "mv: missing destination file operand after 'fruit.txt'\nTry 'mv --help' for more information.\n", 1);
    // 5: [ wording; \< and \>
    eq('[ not a number', await run('[ abc -gt 1 ]'), 'bash: [: abc: integer expression expected\n', 2);
    eq('[ string order', await run('[ 3 \\< 10 ]; echo $?; [ b \\> a ]; echo $?'), '1\n0\n', 0);
    // 6: seq -w
    eq('seq -w', await run('seq -w 8 10 | tr "\\n" " "; seq -w 2 -1 -1 | tr "\\n" " "'), '08 09 10 02 01 00 -1 ', 0);
    // 7: ls with several operands: files (sorted), then directories (sorted)
    eq('ls operands', await run('ls notes/sub notes/a.txt fruit.txt notes | cat'), 'fruit.txt\nnotes/a.txt\n\nnotes:\na.txt\nsub\n\nnotes/sub:\nc.txt\n', 0);
    // 8: xargs -n
    eq('xargs -n 1', await run('echo a b c | xargs -n 1 echo'), 'a\nb\nc\n', 0);
    eq('xargs -n2', await run('echo a b c | xargs -n2'), 'a b\nc\n', 0);
    eq('xargs: a failure is 123', await run('echo x | xargs false'), '', 123);
    // 9: grep -r with no directory
    eq('grep -r, no directory', await run('grep -r gamma'), 'notes/sub/c.txt:gamma\n', 0);
    // 10, 11, 15, 18: errors in order between the output, each command's own words, names quoted the GNU way
    eq('wc rows and errors in order', await run('wc words.txt nope'), " 2  8 31 words.txt\nwc: nope: No such file or directory\n 2  8 31 total\n", 1);
    eq('wc -lw width', await run('wc -lw words.txt'), ' 2  8 words.txt\n', 0);
    eq('wc -l one file', await run('wc -l words.txt'), '2 words.txt\n', 0);
    eq('cat in order', await run('cat fruit.txt nope words.txt 2>&1 | head -5'), 'banana\napple\ncherry\ncat: nope: No such file or directory\nthe cat sat on the mat\n', 0);
    eq('sort missing', await run('sort nope'), 'sort: cannot read: nope: No such file or directory\n', 2);
    eq('head missing', await run('head nope'), "head: cannot open 'nope' for reading: No such file or directory\n", 1);
    eq('tail missing', await run('tail nope'), "tail: cannot open 'nope' for reading: No such file or directory\n", 1);
    eq('cat quotes a name with a space', await run('cat "sp ace.txt"'), "cat: 'sp ace.txt': No such file or directory\n", 1);
    eq('grep does not quote', await run('grep x "sp ace.txt"'), 'grep: sp ace.txt: No such file or directory\n', 2);
    eq("a name with a ' is in double quotes", await run('cat "it\'s"'), 'cat: "it\'s": No such file or directory\n', 1);
    // 12: read keeps the spacing inside the last variable
    eq('read keeps inner spaces', await run('echo "  lead  trail  " | { read a; echo "[$a]"; }; echo "a   b   c" | { read x y; echo "[$x][$y]"; }'), '[lead  trail]\n[a][b   c]\n', 0);
    // 13: arithmetic: octal and hex, unary minus before **, ++ and --, assignments, bash's error words
    eq('arith numbers', await run('echo $((010)) $((0x1F)) $((-2**2)) $((2**3**2)) $((1--2))'), '8 31 4 512 3\n', 0);
    eq('arith ++ --', await run('x=5; echo $((x++)) $x $((--x)) $((x+=10)) $x'), '5 6 5 15 15\n', 0);
    eq('arith $x inside', await run('x=5; echo $(($x+1)) $((${x}*2))'), '6 10\n', 0);
    eq('arith a variable holding an expression', await run('a=3; b="a*2"; echo $((b+1))'), '7\n', 0);
    eq('arith 08', await run('echo $(( 08 ))'), 'bash: 08: value too great for base (error token is "08")\n', 1);
    eq('arith 10/0', await run('echo $((10/0))'), 'bash: 10/0: division by 0 (error token is "0")\n', 1);
    eq('arith operand expected', await run('echo $((1+))'), 'bash: 1+: syntax error: operand expected (error token is "+")\n', 1);
    eq('arith 1 2', await run('echo $((1 2))'), 'bash: 1 2: syntax error in expression (error token is "2")\n', 1);
    // 14: set -- sets the positional parameters
    eq('set --', await run('bash -c \'set -- a b; echo $# $2\''), '2 b\n', 0);
    // 16: bash -c TEXT NAME ARGS
    eq('bash -c $0', await run("bash -c 'echo $0 $1 $#' x y z"), 'x y 2\n', 0);
    // 17: errors inside a script say where they are; an expansion error drops the rest of its line only
    await run("printf 'echo one\\nnosuch\\ncd nope\\nx=$((1/0)); echo same line\\necho next line\\n' > s.sh; chmod +x s.sh");
    eq('script errors with line numbers', await run('bash s.sh; echo $?'), 'one\ns.sh: line 2: nosuch: command not found\ns.sh: line 3: cd: nope: No such file or directory\ns.sh: line 4: 1/0: division by 0 (error token is "0")\nnext line\n0\n', 0);
    eq('./script errors', await run('./s.sh 2>&1 | head -2'), 'one\n./s.sh: line 2: nosuch: command not found\n', 0);
    // 19: mv of a directory onto something already there
    eq('mv dir onto a file', await run('mkdir -p e d; touch e/d; mv d e'), "mv: cannot overwrite non-directory 'e/d' with directory 'd'\n", 1);
    eq('mv dir onto a full dir', await run('mkdir -p e2/d d; touch e2/d/x; mv d e2'), "mv: cannot overwrite 'e2/d': Directory not empty\n", 1);
    eq('mv file onto a dir', await run('mkdir -p e3/f; touch f; mv f e3'), "mv: cannot overwrite directory 'e3/f' with non-directory\n", 1);
    // 20: a line that ends in | or &&
    eq('line ending in |', await run('echo hi |'), 'bash: syntax error: unexpected end of file\n', 2);
    eq('line ending in &&', await run('echo hi &&'), 'bash: syntax error: unexpected end of file\n', 2);
    check('set kept the shell usable', sh.lastExit, 2);
  }
  // ---- the grader puts the student's history back, even when it is full
  {
    const SG = require('./src/shellgrade.js');
    const { sh } = fresh();
    for (let i = 0; i < SHELL.LIMITS.history; i++) sh.history.push('cmd ' + i);
    sh.lastExit = 3;
    const r = await SG.grade({ tests: [{ cmd: 'echo graded', expect: 'graded' }, { ran: /echo graded/, name: 'not the grader' }] }, sh);
    check('grader: cmd passes', r.results[0].ok, true);
    check('grader: its command is not in the history', r.results[1].ok, false);
    check('grader: history unchanged', sh.history.length === SHELL.LIMITS.history && sh.history[0] === 'cmd 0' && sh.history[sh.history.length - 1] === 'cmd ' + (SHELL.LIMITS.history - 1), true);
    check('grader: $? unchanged', sh.lastExit, 3);
  }

  // ---- limits that a single command could otherwise get around
  {
    const { fs, run } = fresh();
    const t0 = Date.now();
    let r = await run('echo {1..1000}{1..1000}{1..1000} | wc -c');
    check('brace product is capped', /^\s*\d{1,6}\s*$/.test(r.out.trim()) || r.out.length < 200, true);
    r = await run('echo {a,b}{c,d}{e,f}');
    eq('small brace products still expand', r, 'ace acf ade adf bce bcf bde bdf\n', 0);
    r = await run('x=aaaaaaaaaa; for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30; do x=$x$x; done; echo ${#x}');
    check('a variable is capped', r.out.trim(), String(SHELL.LIMITS.vars));
    let e = null; try { for (let i = 0; i <= SHELL.LIMITS.dirs; i++) fs.mkdir('/home/student/d' + i); } catch (x) { e = x.code; }
    check('empty directories are counted', e, 'EMFILE');
    e = null; try { fs.copy('/home/student', '/tmp/c', true); } catch (x) { e = x.code; } check('copying many directories is refused', e, 'EMFILE');
    const many = { t: 'd', c: [] }; for (let i = 0; i < 5000; i++) many.c.push(['d' + i, { t: 'd', c: [] }]);
    const h = SHELL.makeFS({ v: 1, cwd: '/home/student', root: { t: 'd', c: [['home', { t: 'd', c: [['student', many]] }]] } }, { now: () => T0 });
    check('hostile: a saved copy cannot hold a huge tree of directories', h.list('/home/student').length <= SHELL.LIMITS.dirs, true);
    check('these limits are quick', Date.now() - t0 < 5000, true);
  }

  // ---- saving and reloading a session's work
  {
    const { fs, run } = fresh();
    await run('mkdir -p p/q; echo data > p/q/d.txt; cd p');
    const json = JSON.parse(JSON.stringify(fs.toJSON()));
    const fs2 = SHELL.makeFS(json, { now: () => T0 });
    const sh2 = SHELL.makeShell({ fs: fs2 });
    let out = ''; await sh2.exec('pwd; cat q/d.txt', { out: (s) => { out += s; }, err: (s) => { out += s; } });
    check('reloaded session', out, '/home/student/p\ndata\n');
  }

  console.log(bad ? bad + ' shell test(s) failed' : 'shell tests passed');
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.log(e.stack); process.exit(1); });
