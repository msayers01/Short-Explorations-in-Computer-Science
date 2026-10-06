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
// a line not typed at the terminal: no history expansion (bash would expand the ! in "#!/bin/bash" or ${s!x} at its prompt too)
const NOHIST = { tty: false };
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
    // saved aliases (terminal.js keeps them with the history; backups carry them): only what the alias builtin would accept comes back
    {
      const al = SHELL.cleanAliases(JSON.parse('{"ll":"ls -l","__proto__":"x","bad name":"x","a/b":"x","q\\"":"x","long":"' + 'x'.repeat(1001) + '","n":5,"ok":"echo hi"}'));
      check('saved aliases are checked: good ones kept, bad names, long texts and non-strings dropped, no prototype', Object.keys(al).sort().join(',') === '__proto__,ll,ok' && Object.getPrototypeOf(al) === null && al.ll === 'ls -l', true);
      const many = {}; for (let i = 0; i < 500; i++) many['a' + i] = 'echo ' + i;
      check('saved aliases are capped', Object.keys(SHELL.cleanAliases(many)).length, SHELL.LIMITS.aliases);
      check('saved aliases: not an object gives none', Object.keys(SHELL.cleanAliases('ls')).length === 0 && Object.keys(SHELL.cleanAliases([1])).length === 0 && Object.keys(SHELL.cleanAliases(null)).length === 0, true);
    }
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
    eq('sed unknown', await run('seq 3 | sed k'), /unknown command: `k'/, 1);
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
    eq('help', await run('help | grep -c .'), /^\d{2,3}\n$/);
    eq('sudo', await run('sudo ls'), 'student is not in the sudoers file.  This incident will be reported.\n', 1);
    eq('curl', await run('curl example.com'), /no network/, 1);
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
    eq('output limit', await run('x=a; while true; do x="$x$x$x$x"; echo $x; done > big.txt'), /stopped: the command produced more output/, 1);
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
    // a closing quote does not start a new word: Tab after  python -c "print(x)"  offers nothing (it used to complete the quote as a file name)
    eq('tab completion after a closed quote', { out: sh.complete('python -c "import sys; print(dir(sys))"').items.join(','), exit: 0 }, '');
    eq('tab completion after a closed single quote', { out: sh.complete("echo 'a b'").items.join(','), exit: 0 }, '');
    eq('tab completion in a quoted dir with a space', { out: sh.complete('cat "my f').items.join(','), exit: 0 }, '"my file.txt" ');
    eq('tab completion of a word glued to a quote', { out: sh.complete('cat m"y f').items.join(','), exit: 0 }, '"my file.txt" ');
    eq('tab completion: a separator inside quotes is not one', { out: sh.complete('echo "x | ca').items.join(','), exit: 0 }, '');
    eq('tab completion display is bare', { out: sh.complete('ls od').display.join(','), exit: 0 }, 'odd dir/');
    await run('rm "my file.txt"; rmdir "odd dir"');
  }

  // ---- programs, through the hooks
  {
    const { sh, run, asks } = fresh({ nano: async (p, text) => text + 'edited\n', edit: (abs) => 'opened ' + abs, setup: (n) => n === 'lesson2' ? 'made files' : null });
    eq('python', await run('echo "print(1)" > h.py; python h.py; python3 h.py a b'), 'python:print(1)\npython:print(1) a,b\n', 0);
    eq('python missing', await run('python nope.py'), "python: can't open file '/home/student/nope.py': [Errno 2] No such file or directory\n", 2);
    eq('python no args', await run('python'), /interactive Python shell needs the keyboard/, 2);
    eq('python < file', await run('echo 5 > in.txt; python h.py < in.txt'), 'python:print(1)<"5\\n"\n');
    eq('python | pipe', await run('echo 7 | python h.py'), 'python:print(1)<"7\\n"\n');
    eq('python > file', await run('python h.py > out.txt; cat out.txt'), 'python:print(1)\n');
    eq('python error status', await run('echo boom > b.py; python b.py; echo $?'), 'python:boom\nError: boom\n1\n');
    eq('python shebang', await run('printf "#!/usr/bin/env python3\\nprint(2)\\n" > r.py; chmod +x r.py; ./r.py', NOHIST), 'python:#!/usr/bin/env python3\nprint(2)\n');
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
    eq('bad substitution', await run('echo ${s!x}', NOHIST), 'bash: ${s!x}: bad substitution\n', 1);
    // ${x#pat} ${x%pat} ${x/pat/new} ${x^} (bash agrees on all of these: difftest/shell.txt)
    eq('${f%.txt} ${p##*/} ${p%/*}', await run('f=a.txt; p=/x/y/z.c; echo ${f%.txt} ${p##*/} ${p%/*} ${p#/x} ${p%%/*}.'), 'a z.c /x/y /y/z.c .\n', 0);
    eq('${s/a/b} ${s//a/b}', await run('s=banana; echo ${s/a/b} ${s//a/b} ${s//[an]/_} ${s/#ba/} ${s/%na/!}', NOHIST), 'bbnana bbnbnb b_____ nana bana!\n', 0);
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

  // ---- functions (each expectation is what bash 5.2 prints; difftest/shell.txt checks many of them against bash itself)
  {
    const { sh, run } = fresh();
    eq('function', await run('f() { echo "in f: $1 $# $@"; }; f a b; f; echo $?'), 'in f: a 2 a b\nin f:  0 \n0\n', 0);
    eq('function keyword', await run('function k { echo kw "$@"; }; k 1 2; function k2() { echo two; }; k2'), 'kw 1 2\ntwo\n', 0);
    eq('functions last for the session', await run('k 3'), 'kw 3\n', 0);
    eq('$0 stays at the prompt', await run('f0() { echo $0; }; f0'), 'bash\n', 0);
    eq('$0 stays in a script', await run('printf \'g() { echo "$0 $1"; }\\ng x\\n\' > fs.sh; bash fs.sh', NOHIST), 'fs.sh x\n', 0);
    // ls at a terminal quotes as GNU ls does (shell-escape), and the other names get a space to line up; into a pipe, names are bare
    {
      const { run: rq } = fresh();
      await rq('mkdir q; cd q; touch "holiday photo.jpg" beach.png "it\'s.txt" "x=y" "#h" "m#h" "a{b}" \'d$\'; mkdir "old dir"', NOHIST);
      eq('ls quotes at a terminal', await rq('ls -1'), "a{b}\nbeach.png\n'd$'\n'#h'\n'holiday photo.jpg'\n\"it's.txt\"\nm#h\n'old dir'\n'x=y'\n", 0);
      eq('ls lines up in columns', await rq('ls'), " a{b}       'd$'  'holiday photo.jpg'   m#h       'x=y'\n beach.png  '#h'  \"it's.txt\"           'old dir'\n", 0);
      eq('ls -F puts the mark after the quotes', await rq('ls -dF "old dir"'), "'old dir'/\n", 0);
      eq('ls into a pipe: bare names', await rq('ls | head -3'), 'a{b}\nbeach.png\nd$\n', 0);
      await rq('cd ~; rm -r q', NOHIST);
    }
    eq('a function from a script ends with it (a child bash)', await run('g y'), 'bash: g: command not found\n', 127);
    eq('a function from a sourced script stays', await run('source fs.sh >/dev/null; g y'), 'bash y\n', 0);
    // a script and ( ) and $( ) run in a child: what they change ends with them, as in bash
    eq('a script\'s cd and variables end with it', await run('printf \'cd /tmp\\nv=1\\npwd\\n\' > cd.sh; v=0; bash cd.sh; pwd; echo $v', NOHIST), '/tmp\n/home/student\n0\n', 0);
    eq('./script too', await run('chmod +x cd.sh; ./cd.sh; pwd', NOHIST), '/tmp\n/home/student\n', 0);
    eq('a script sees only exported variables', await run('printf \'echo "[$a][$b]"\\n\' > ex.sh; a=1; export b=2; bash ex.sh; unset a b', NOHIST), '[][2]\n', 0);
    eq('source keeps the cd', await run('source cd.sh; pwd; cd', NOHIST), '/tmp\n/tmp\n', 0);
    eq('( ) keeps nothing', await run('w=1; (w=2; arr=(a b); cd /tmp; f9() { :; }); echo "$w ${#arr[@]}"; pwd; type f9 2>&1 | head -1'), '1 0\n/home/student\nbash: type: f9: not found\n', 0);
    eq('$( ) keeps nothing', await run('w=1; x=$(w=5; echo $w); echo "$w $x"'), '1 5\n', 0);
    eq('( ) sees the parent\'s arrays and functions', await run('arr=(p q); f8() { echo f8; }; (echo ${arr[1]}; f8; arr[1]=z); echo ${arr[1]}; unset -f f8; unset arr w'), 'q\nf8\nq\n', 0);
    eq('local', await run('greet() { local name=$1; echo "Hello, $name"; }; name=Bob; greet Ada; echo $name'), 'Hello, Ada\nBob\n', 0);
    eq('local without a value', await run('f() { local x; echo "[$x]"; x=inner; }; x=outer; f; echo $x'), '[]\nouter\n', 0);
    eq('local keeps words together', await run('f() { local s=$1; echo "$s"; }; f "a  b"'), 'a  b\n', 0);
    eq('local outside a function', await run('local x=1'), 'bash: local: can only be used in a function\n', 1);
    eq('recursion', await run('fact() { if [ $1 -le 1 ]; then echo 1; else echo $(( $1 * $(fact $(( $1 - 1 ))) )); fi; }; fact 6'), '720\n', 0);
    eq('recursion with locals', await run('fib() { local n=$1; if (( n < 2 )); then echo $n; return; fi; local a=$(fib $((n-1))) b=$(fib $((n-2))); echo $((a+b)); }; fib 12'), '144\n', 0);
    eq('return status', await run('is_even() { return $(( $1 % 2 )); }; is_even 4 && echo even; is_even 3 || echo odd; f() { return 300; }; f; echo $?'), 'even\nodd\n44\n', 0);
    eq('return a word', await run('f() { return abc; echo no; }; f; echo $?'), 'bash: return: abc: numeric argument required\n2\n', 0);
    eq('return outside', await run('return'), "bash: return: can only `return' from a function or sourced script\n", 2);
    eq('return ends a sourced script', await run('printf "echo a\\nreturn 5\\necho b\\n" > r.sh; source r.sh; echo $?'), 'a\n5\n', 0);
    eq('no end to recursion', await run('f() { f; }; f; echo same line'), 'bash: f: maximum function nesting level exceeded (' + SHELL.LIMITS.funcDepth + ')\n', 1);
    eq('the shell still works after', await run('echo fine'), 'fine\n', 0);
    eq('FUNCNEST', await run('FUNCNEST=5; g() { g; }; g; echo same line\necho next line; unset FUNCNEST'), 'bash: g: maximum function nesting level exceeded (5)\nnext line\n', 0);
    eq('a loop in a function hits the step limit', await run('w() { while true; do :; done; }; w'), /stopped: more than \d+ commands/, 1);
    eq('type of a function', await run('h() { if [ "$1" = a ]; then echo A; elif true; then echo B; fi; for x in 1 2; do echo $x; done; }; type h'), 'h is a function\nh () \n{ \n    if [ "$1" = a ]; then\n        echo A;\n    else\n        if true; then\n            echo B;\n        fi;\n    fi;\n    for x in 1 2;\n    do\n        echo $x;\n    done\n}\n', 0);
    eq('declare -f', await run('c() { case $1 in a|b) echo ab;; *) echo other ;; esac; local y=2 z; return 3; }; declare -f c'), 'c () \n{ \n    case $1 in \n        a | b)\n            echo ab\n        ;;\n        *)\n            echo other\n        ;;\n    esac;\n    local y=2 z;\n    return 3\n}\n', 0);
    eq('declare -f a subshell body', await run('m() ( echo sub ); declare -f m; m'), 'm () \n{ \n    ( echo sub )\n}\nsub\n', 0);
    eq('declare -F', await run('unset -f f0 g greet fact fib is_even h c m w k k2; declare -F'), 'declare -f f\n', 0);
    eq('unset -f', await run('unset -f f; f'), 'bash: f: command not found\n', 127);
    eq('a function hides a command; command does not', await run('ls() { echo "my ls"; }; ls; command ls -d /tmp; unset -f ls'), 'my ls\n/tmp\n', 0);
    eq('type -t', await run('t() { :; }; alias al=ls; type -t t cd ls if al nope; echo $?'), 'function\nbuiltin\nfile\nkeyword\nalias\n1\n', 0);
    eq('redirection of a function', await run('lf() { echo one; echo two; } > lf.txt; lf; cat lf.txt'), 'one\ntwo\n', 0);
    eq('function syntax error', await run('f() echo x'), "bash: syntax error near unexpected token `echo'\n", 2);
    eq('break and continue', await run('for i in 1 2 3 4 5; do [ $i = 2 ] && continue; [ $i = 4 ] && break; echo $i; done; for i in 1 2; do for j in a b; do continue 2; done; done; echo "$i $j"'), '1\n3\n2 a\n', 0);
    eq('break outside a loop', await run('break; echo $?'), "bash: break: only meaningful in a `for', `while', or `until' loop\n0\n", 0);
    check('functions are kept by name in a dictionary', Object.getPrototypeOf(sh.funcs), null);
  }
  // ---- case, (( )), for (( ))
  {
    const { run } = fresh();
    await run("printf 'banana\\napple\\n' > fruit.txt; mkdir notes");
    eq('case', await run('for f in fruit.txt notes a.csv nope; do case $f in *.txt) echo "$f: text";; *.csv|*.tsv) echo "$f: table";; *) if [ -d $f ]; then echo "$f: dir"; else echo "$f: ?"; fi;; esac; done'), 'fruit.txt: text\nnotes: dir\na.csv: table\nnope: ?\n', 0);
    eq('case ;& and ;;&', await run('case abc in a*) echo A;& b*) echo B;; c*) echo C;; esac; case abc in a*) echo A;;& *c) echo C;; esac'), 'A\nB\nA\nC\n', 0);
    eq('case quoting', await run('p="a*"; case abc in $p) echo pat;; esac; case "a*" in "$p") echo lit;; esac; case abc in "$p") echo no;; *) echo star;; esac'), 'pat\nlit\nstar\n', 0);
    eq('case classes and ?', await run('case z in [a-c]) echo no;; ?) echo one;; esac; case x in (x) echo paren;; esac'), 'one\nparen\n', 0);
    eq('case over lines', await run('case x in\n  x)\n    echo multi\n    ;;\n  *) echo no\nesac'), 'multi\n', 0);
    eq('case status', await run('case x in x) false;; esac; echo $?; case y in x) echo x;; esac; echo $?'), '1\n0\n', 0);
    eq('case unfinished', await run('case x in x) echo y'), 'bash: syntax error: unexpected end of file\n', 2);
    eq(';; outside case', await run('echo a;; b'), "bash: syntax error near unexpected token `;;'\n", 2);
    eq('(( )) and for (( ))', await run('for ((i=0; i<3; i++)); do echo -n $i; done; echo; i=0; while (( i < 3 )); do (( i++ )); done; echo $i; (( 0 )); echo $?'), '012\n3\n1\n', 0);
    eq('(( )) error', await run('(( 1/0 )); echo "a $?"'), 'bash: ((: 1/0 : division by 0 (error token is "0 ")\na 1\n', 0);
    eq('?: and $(...) in arithmetic', await run('echo $(( 5 > 3 ? 10 : 20 )) $(( $(echo 3) + `echo 4` + $((1+1)) ))'), '10 9\n', 0);
  }
  // ---- arrays
  {
    const { sh, run } = fresh();
    await run("printf 'the cat sat\\n' > words.txt; touch a.txt b.txt");
    eq('array basics', await run('a=(x y z); echo ${a[0]} ${a[2]} "[${a[5]}]" ${#a[@]} ${!a[@]} ${a[-1]} $a; a[7]=w; echo ${!a[@]}; a+=(v u); echo ${!a[@]}; echo "${a[*]}"'), 'x z [] 3 0 1 2 z x\n0 1 2 7\n0 1 2 7 8 9\nx y z w v u\n', 0);
    eq('"${a[@]}" keeps the words', await run('a=("one two" three); for x in "${a[@]}"; do echo "[$x]"; done; for x in ${a[@]}; do echo "<$x>"; done; for x in "${a[*]}"; do echo "{$x}"; done'), '[one two]\n[three]\n<one>\n<two>\n<three>\n{one two three}\n', 0);
    eq('an empty array', await run('e=(); echo ${#e[@]}; for x in "${e[@]}"; do echo never; done; echo "[${e[@]}]"; declare -p e'), '0\n[]\ndeclare -a e=()\n', 0);
    eq('slices', await run('n=(1 2 3 4 5); echo ${n[@]:1:2} ${n[@]:3} ${n[@]: -2}'), '2 3 4 5 4 5\n', 0);
    eq('arithmetic indices', await run('i=1; a=(p q r); echo ${a[i]} ${a[$i]} ${a[i+1]} ${#a[1]}; a[$((1+1))]=R; a[i]=Q; echo "${a[@]}"; echo $((a[0] == a[0])); b=(5 6); (( b[0] += 2 )); echo $(( b[0] + b[1] ))'), 'q q r 1\np Q R\n1\n13\n', 0);
    eq('unset an element', await run('x=(1 2 3); unset "x[1]"; declare -p x; echo ${#x[@]}; unset x; echo ${#x[@]}'), 'declare -a x=([0]="1" [2]="3")\n2\n0\n', 0);
    eq('+= on strings and arrays', await run('y=abc; y+=def; echo $y; n=(1); n+=(2 3); echo "${n[@]}"; s=str; s+=(more); s[3]=z; declare -p s'), 'abcdef\n1 2 3\ndeclare -a s=([0]="str" [1]="more" [3]="z")\n', 0);
    eq('wildcards and $(...) fill an array', await run('f=(*.txt); echo ${#f[@]} "${f[0]}"; w=($(cat words.txt)); echo ${#w[@]} ${w[2]}'), '3 a.txt\n3 sat\n', 0);
    eq('declare -a, declare -p', await run('declare -a d; declare -p d; declare -a l=(1 2); declare -p l; v=\'q"r$\'; declare -p v nope; echo $?'), 'declare -a d\ndeclare -a l=([0]="1" [1]="2")\ndeclare -- v="q\\"r\\$"\nbash: declare: nope: not found\n1\n', 0);
    eq('local arrays', await run('f() { local -a arr=(1 2 3); echo ${#arr[@]}; }; f; echo ${#arr[@]}'), '3\n0\n', 0);
    eq('read -a', await run('read -a r < words.txt; echo "${r[1]} ${#r[@]}"'), 'cat 3\n', 0);
    eq('indices loop', await run('a=(b c a); for i in "${!a[@]}"; do echo "$i=${a[i]}"; done'), '0=b\n1=c\n2=a\n', 0);
    eq('bad subscripts', await run('a=(x y); echo "[${a[-9]}]"; a[-9]=q; echo not reached'), 'bash: a: bad array subscript\n[]\nbash: a[-9]: bad array subscript\n', 1);
    eq('an array has a cap on values', await run('big=($(seq 10000)); echo ${#big[@]}; big+=(one more)'), '10000\nbash: stopped: an array here holds at most ' + SHELL.LIMITS.array + ' values and ' + SHELL.LIMITS.vars * 4 + ' characters.\n', 1);
    eq('and on characters', await run('s=aaaaaaaaaa; for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do s=$s$s; done; h=($s $s $s $s $s)'), /stopped: an array here holds at most/, 1);
    check('arrays are kept in a dictionary', Object.getPrototypeOf(sh.arrays), null);
    eq('__proto__ as an array name', await run('__proto__=(1 2); echo ${#__proto__[@]} ${__proto__[1]}'), '2 2\n', 0);
  }
  // ---- aliases (at the terminal; not saved: they last as long as the shell)
  {
    const { sh, run } = fresh();
    await run('mkdir notes; touch notes/a.txt');
    eq('alias', await run("alias ll='ls -d'"), '', 0);
    eq('alias used', await run('ll notes'), 'notes\n', 0);
    eq('an alias works from the next line', await run('alias x=echo; x same line\nx next line'), 'bash: x: command not found\nnext line\n', 0);
    eq('alias listing', await run("alias q=\"echo 'it'\\''s'\"; alias; alias q"), "alias ll='ls -d'\nalias q='echo '\\''it'\\''\\'\\'''\\''s'\\'''\nalias x='echo'\nalias q='echo '\\''it'\\''\\'\\'''\\''s'\\'''\n", 0);
    eq('alias of a command of the same name', await run("alias ls='ls -F'\nls"), 'notes/\n', 0);
    eq('an alias ending in a space', await run("alias l='ls ' n=notes\nl n"), 'a.txt\n', 0);
    eq('aliases naming each other', await run('alias a1=a2 a2=a1\na1'), 'bash: a1: command not found\n', 127);
    eq('an alias with ; and |', await run("alias two='echo one; echo two' p='echo piped |'\ntwo; p cat"), 'one\ntwo\npiped\n', 0);
    eq('alias errors', await run("alias 'a b=c'; alias nope; unalias nope; echo $?"), "bash: alias: `a b': invalid alias name\nbash: alias: nope: not found\nbash: unalias: nope: not found\n1\n", 0);
    eq('type of an alias', await run('type ll'), "ll is aliased to `ls -d'\n", 0);
    eq('no aliases for a script', await run('echo "ll notes" > al.sh; bash al.sh'), 'al.sh: line 1: ll: command not found\n', 127);
    eq('shopt -s expand_aliases in a script', await run('printf "shopt -s expand_aliases\\nalias say=echo\\nsay hi\\n" > al2.sh; bash al2.sh; shopt expand_aliases', NOHIST), 'hi\nexpand_aliases \toff\n', 1);
    eq('no aliases for the grader', await run('ll notes', NOHIST), 'bash: ll: command not found\n', 127);
    eq('unalias -a', await run('unalias -a; alias; ll\nll'), './\nbash: ll: command not found\n', 127);
    eq('__proto__ as an alias', await run("alias __proto__='echo p'\n__proto__"), 'p\n', 0);
    let r = ''; for (let i = 0; i < SHELL.LIMITS.aliases; i++) r += 'al' + i + '=x '; await run('alias ' + r);
    eq('the number of aliases is capped', await run('alias one=more'), /keeps at most 100 aliases/, 1);
    eq('so is their length', await run("unalias -a; alias long='" + 'x'.repeat(1001) + "'"), /too long/, 1);
    eq('a runaway alias expansion stops', await run("alias b0='echo x; echo x; echo x' b1='b0; b0; b0' b2='b1; b1; b1' b3='b2; b2; b2' b4='b3; b3; b3' b5='b4; b4; b4' b6='b5; b5; b5' b7='b6; b6; b6' b8='b7; b7; b7'"), '', 0);
    eq('...with a message', await run('b8'), /alias expansion is too long/, 2);
    check('aliases are kept in a dictionary', Object.getPrototypeOf(sh.aliases), null);
    check('a new shell has no aliases', Object.keys(SHELL.makeShell({ fs: SHELL.makeFS(null, { now: () => T0 }) }).aliases).length, 0);
  }
  // ---- history expansion (only for lines typed at the terminal)
  {
    const { sh, run } = fresh();
    eq('!!', await run('echo one two three'), 'one two three\n', 0);
    eq('!! repeats', await run('!!'), 'echo one two three\none two three\n', 0);
    eq('!$', await run('echo !$'), 'echo three\nthree\n', 0);
    eq('!n and !-n', await run('!1 x; !-2'), 'echo one two three x; echo one two three\none two three x\none two three\n', 0);
    eq('!prefix', await run('!ec'), 'echo one two three x; echo one two three\none two three x\none two three\n', 0);
    const before = sh.history.length;
    eq('event not found', await run('false; !zz'), 'bash: !zz: event not found\n');
    check('a failed expansion is not kept', sh.history.length, before);
    eq('$? unchanged by it', await run('echo $?'), '0\n', 0);
    eq('^old^new', await run('^$?^zero'), 'echo zero\nzero\n', 0);
    eq('^old^new not found', await run('^nope^x'), 'bash: :s^nope^x: substitution failed\n');
    await run('echo a b c'); eq('!* and !^', await run('echo !^ !*'), 'echo a a b c\na a b c\n', 0);
    eq('no expansion here', await run("echo '!!' \"hi!\" a!=b x! ! true"), '!! hi! a!=b x! ! true\n', 0);
    eq('nor in [!...] ${!...} $!', await run('a=(q); echo [!z] ${!a[@]}'), '[!z] 0\n', 0);
    eq('\\! is a plain !', await run('echo \\!!'), '!!\n', 0);
    eq('modifiers are refused', await run('!!:s/a/b/'), /history modifiers/);
    eq('not for the grader', await run('echo !!', NOHIST), '!!\n', 0);
    check('the expanded line is kept', sh.history[sh.history.length - 1], 'echo !!');
  }
  // ---- the new commands
  {
    const { run } = fresh();
    await run("printf 'banana\\napple\\ncherry\\n' > fruit.txt; printf 'name,score\\nAda,90\\nBob,85\\n' > grades.csv; printf '3\\n10\\n2\\n' > nums.txt; mkdir -p d/e; echo hi > d/e/f; seq 2000 > d/big");
    eq('basename', await run('basename /a/b/c.txt .txt; basename /a/b/; basename /; basename -a x/y z/w; basename -s .c a.c b.c; basename .txt .txt'), 'c\nb\n/\ny\nw\na\nb\n.txt\n', 0);
    eq('basename errors', await run('basename; basename a b c'), "basename: missing operand\nTry 'basename --help' for more information.\nbasename: extra operand 'c'\nTry 'basename --help' for more information.\n", 1);
    eq('dirname', await run('dirname /a/b/c a a/ / //x'), '/a/b\n.\n.\n/\n/\n', 0);
    eq('realpath', await run('realpath d/e/../big fruit.txt; realpath d/nope/../x; realpath -e nope; realpath -m nope/../y; realpath fruit.txt/x'), '/home/student/d/big\n/home/student/fruit.txt\nrealpath: d/nope/../x: No such file or directory\nrealpath: nope: No such file or directory\n/home/student/y\nrealpath: fruit.txt/x: Not a directory\n', 1);
    eq('du', await run('du d; du -s d; du -sh d; du -ah d; du nope'), '8\td/e\n24\td\n24\td\n24K\td\n12K\td/big\n4.0K\td/e/f\n8.0K\td/e\n24K\td\n' + "du: cannot access 'nope': No such file or directory\n", 1);
    eq('expr', await run('expr 2 + 3; expr 7 \\* 6; expr \\( 1 + 2 \\) \\* 3; expr 10 / 3; expr -5 % 3; expr 99999999999999999999 + 1; expr length hello; expr substr hello 2 3; expr index hello l; expr report.txt : \'\\(.*\\)\\.txt\'; expr abc : "a."; expr 2 \\< 10; expr b \\< a; expr 0 \\| 5; expr 3 \\& 0'), '5\n42\n9\n3\n-2\n100000000000000000000\n5\nell\n3\nreport\n2\n1\n0\n5\n0\n', 1);
    eq('expr errors', await run('expr; expr 1 +; expr 1 + a; expr 4 / 0; expr 1 2; expr \\( 1; echo $?'), "expr: missing operand\nTry 'expr --help' for more information.\nexpr: syntax error: missing argument after '+'\nexpr: non-integer argument\nexpr: division by zero\nexpr: syntax error: unexpected argument '2'\nexpr: syntax error: expecting ')' after '1'\n2\n", 0);
    eq('expr status', await run('expr 0; echo $?; expr ""; echo $?'), '0\n1\n\n1\n', 0);
    eq('time', await run('time true'), /^\nreal\t0m0\.\d{3}s\nuser\t0m0\.\d{3}s\nsys\t0m0\.000s\n$/, 0);
    eq('time -p and a pipeline', await run('time -p seq 3 | wc -l'), /^3\nreal \d+\.\d\d\nuser \d+\.\d\d\nsys 0\.00\n$/, 0);
    eq('time is a keyword', await run('type time'), 'time is a shell keyword\n', 0);
    eq('yes into a pipe', await run('yes | head -2; yes ab c | head -1'), 'y\ny\nab c\n', 0);
    eq('yes to the terminal stops', await run('yes'), /stopped: the command produced more output/, 1);
    eq('fold', await run("printf 'abcdefghij klm nop\\tq\\n' | fold -w 5; printf 'hello world foo bar\\n' | fold -s -w 8; printf 'abc' | fold -w 2; echo"), 'abcde\nfghij\n klm \nnop\n\t\nq\nhello \nworld \nfoo bar\nab\nc\n', 0);
    eq('fold -w 0', await run('fold -w 0 fruit.txt'), "fold: invalid number of columns: '0': Numerical result out of range\n", 1);
    eq('paste', await run("paste fruit.txt nums.txt; paste -d , fruit.txt nums.txt; paste -s -d ':,' nums.txt; printf '1\\n2\\n3\\n' | paste - -"), 'banana\t3\napple\t10\ncherry\t2\nbanana,3\napple,10\ncherry,2\n3:10,2\n1\t2\n3\t\n', 0);
    eq('paste missing', await run('paste fruit.txt nope'), 'paste: nope: No such file or directory\n', 1);
    eq('comm', await run("sort fruit.txt > s1; printf 'apple\\ncherry\\nzebra\\n' > s2; comm s1 s2; comm -12 s1 s2"), '\t\tapple\nbanana\n\t\tcherry\n\tzebra\napple\ncherry\n', 0);
    eq('comm unsorted', await run("comm fruit.txt s2"), '\tapple\nbanana\ncomm: file 1 is not in sorted order\napple\n\t\tcherry\n\tzebra\ncomm: input is not in sorted order\n', 1);
    eq('column -t', await run('column -t -s , grades.csv; printf "a bb c\\nddd e f\\n" | column -t'), 'name  score\nAda   90\nBob   85\na    bb  c\nddd  e   f\n', 0);
    eq('column without -t', await run('column fruit.txt'), 'column: only column -t (a table) is available in this practice shell\n', 1);
    const crypto = require('crypto');
    eq('sha256sum and md5sum', await run("printf 'abc' | sha256sum; md5sum fruit.txt nope"), crypto.createHash('sha256').update('abc').digest('hex') + '  -\n' + crypto.createHash('md5').update('banana\napple\ncherry\n').digest('hex') + '  fruit.txt\nmd5sum: nope: No such file or directory\n', 1);
    let ok = true;
    for (const t of ['', 'x'.repeat(55), 'y'.repeat(56), 'z'.repeat(64), 'héllo €𝄞\n'.repeat(30)]) { const f = fresh(); f.fs.write('/home/student/t', t); const r = await f.run('sha256sum t; md5sum t'); if (r.out !== crypto.createHash('sha256').update(t).digest('hex') + '  t\n' + crypto.createHash('md5').update(t).digest('hex') + '  t\n') ok = false; }
    check('checksums agree with node at block edges and in UTF-8', ok, true);
    eq('ln is still not here', await run('ln -s a b'), 'bash: ln: command not found\n', 127);
  }
  // ---- awk
  {
    const { run } = fresh();
    await run("printf 'name,score\\nAda,90\\nBob,85\\nCy,90\\n' > grades.csv; printf 'the cat sat on the mat\\nthe dog\\n' > words.txt; printf 'banana\\napple\\ncherry\\napple\\n' > fruit.txt");
    eq('awk fields', await run("awk -F , '$2 > 85 { print $1 }' grades.csv; awk '{ print NF, $NF, $(NF-1) }' words.txt"), 'name\nAda\nCy\n6 mat the\n2 dog the\n', 0);
    eq('awk END and sums', await run("awk -F , 'NR > 1 { total += $2 } END { print total / (NR - 1), NR }' grades.csv"), '88.3333 4\n', 0);
    eq('awk arrays', await run("awk '{ n[$1]++ } END { for (w in n) print w, n[w] }' fruit.txt | sort"), 'apple 2\nbanana 1\ncherry 1\n', 0);
    eq('awk printf', await run("awk 'BEGIN { printf \"%5.2f|%-5d|%05d|%x|%o|%e|%g|%s|%c|%%\\n\", 3.14159, 42, 42, 255, 8, 1234.5, 0.0001, \"hi\", 65 }'"), ' 3.14|42   |00042|ff|10|1.234500e+03|0.0001|hi|A|%\n', 0);
    eq('awk strings', await run("awk 'BEGIN { s = \"hello world\"; print length(s), substr(s, 1, 5), index(s, \"o\"), toupper(s); n = split(\"a:b:c\", p, \":\"); print n, p[3] }'"), '11 hello 5 HELLO WORLD\n3 c\n', 0);
    eq('awk sub and gsub', await run("awk '{ gsub(/a/, \"A\"); sub(/n/, \"[&]\"); print }' fruit.txt | head -2; awk 'BEGIN { s = \"aaa\"; print gsub(/a*/, \"-\", s), s }'"), 'bA[n]AnA\nApple\n1 -\n', 0);
    eq('awk patterns', await run("awk '/an/ { print NR\": \"$0 }' fruit.txt; awk '!/an/' fruit.txt; awk 'NR == 2, NR == 3' fruit.txt"), '1: banana\napple\ncherry\napple\napple\ncherry\n', 0);
    eq('awk control flow', await run("awk 'BEGIN { for (i = 1; i <= 5; i++) { if (i == 2) continue; if (i == 4) break; print i }; while (j < 2) print \"w\" j++; do k++; while (k < 3); print k }'"), '1\n3\nw0\nw1\n3\n', 0);
    eq('awk fields assigned', await run("awk '{ $2 = \"X\"; print; NF = 2; print }' words.txt; awk 'BEGIN { OFS = \"-\" } { $1 = $1; print }' words.txt"), 'the X sat on the mat\nthe X\nthe X\nthe X\nthe-cat-sat-on-the-mat\nthe-dog\n', 0);
    eq('awk comparisons', await run("awk 'BEGIN { print 1 == 1.0, \"a\" < \"b\", \"10\" < \"9\", 10 < 9; x; print length(x), x + 0, (x == 0), (x == \"\") }'; echo '10 9' | awk '{ print ($1 < $2) }'"), '1 1 1 0\n0 0 1 1\n0\n', 0);
    eq('awk numbers', await run("awk 'BEGIN { print 0.1 + 0.2, 1e6, 3/2, 100/3, 2^10, -7 % 3, int(-3.9) }'"), '0.3 1000000 1.5 33.3333 1024 -1 -3\n', 0);
    eq('awk -v and assignments', await run("awk -v n=3 'BEGIN { print n * 2 }'; awk '{ print v, $1 }' v=1 fruit.txt | head -1"), '6\n1 banana\n', 0);
    eq('awk exit', await run("awk 'NR == 2 { exit 3 } { print }' fruit.txt; echo $?; awk 'BEGIN { exit 1 } END { print \"end\" }'; echo $?"), 'banana\n3\nend\n1\n', 0);
    eq('awk > file', await run("awk '{ print > \"out.txt\" } END { print \"done\" }' fruit.txt; wc -l < out.txt"), 'done\n4\n', 0);
    eq('awk syntax error', await run("awk '{ print $1 ' fruit.txt"), 'awk: line 2: missing } near end of file\n', 2);
    eq('awk at or near', await run("awk 'BEGIN { x = = 1 }'"), 'awk: line 1: syntax error at or near =\n', 2);
    eq('awk missing file', await run("awk '{ print }' nope"), 'awk: cannot open "nope" (No such file or directory)\n', 2);
    eq('awk division by zero', await run("awk 'BEGIN { print 1 / 0 }'"), 'awk: division by zero\n', 2);
    eq('awk refuses functions', await run("awk 'function f(x) { return x } { print f($1) }' fruit.txt"), 'awk: line 1: functions of your own are not available in this practice awk\n', 2);
    eq('awk refuses getline', await run("awk 'BEGIN { getline line }'"), 'awk: line 1: getline is not available in this practice awk\n', 2);
    eq('awk refuses pipes and system', await run("awk 'BEGIN { print \"x\" | \"sort\" }'; awk 'BEGIN { system(\"ls\") }'"), 'awk: line 1: print | "command" is not available in this practice awk\nawk: line 1: system() is not available in this practice awk\n', 2);
    eq('awk endless loop', await run("awk 'BEGIN { while (1) x++ }'"), 'awk: stopped: the program ran more than ' + SHELL.LIMITS.awk + ' steps. Is there a loop that never ends?\n', 2);
    eq('awk endless string', await run("awk 'BEGIN { x = \"a\"; while (1) x = x x }'"), /awk: stopped: a string grew past \d+ characters/, 2);
    eq('awk endless array', await run("awk 'BEGIN { for (i = 0; ; i++) a[i] = i }'"), /awk: stopped: the arrays hold more than \d+ elements/, 2);
    eq('awk endless output', await run("awk 'BEGIN { for (;;) print \"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\" }'"), /stopped: the command produced more output/, 1);
    eq('awk a huge width', await run("awk 'BEGIN { printf \"%999999999d\", 1 }'"), /more than this practice awk allows/, 2);
    eq('awk __proto__ keys', await run("awk 'BEGIN { a[\"__proto__\"] = 1; __proto__ = 2; print length(a), __proto__, (\"constructor\" in a) }'"), '1 2 0\n', 0);
    eq('awk reads the pipe', await run("printf 'x y\\n' | awk '{ print $2 }'"), 'y\n', 0);
    eq('awk usage', await run('awk'), "usage: awk [-F value] [-v var=value] [--] 'program text' [file ...]\n", 2);
  }

  // ---- here-documents and here-strings (bash 5.2's behaviour; difftest/shell.txt compares many of these with the real bash)
  {
    const { sh, run } = fresh();
    eq('a here-document, expanded', await run('x=world; cat <<EOF\nhello $x ${x^^} $(echo sub) $((1+2)) \\$x "q" \'s\'\nEOF', NOHIST), 'hello world WORLD sub 3 $x "q" \'s\'\n', 0);
    eq('a quoted word: taken as it is', await run("cat <<'EOF'\n$HOME \\$x `x`\nEOF\ncat <<E\"O\"F\n$HOME\nEOF\ncat <<\\EOF\n$HOME\nEOF", NOHIST), '$HOME \\$x `x`\n$HOME\n$HOME\n', 0);
    eq('<<- takes the leading tabs off', await run('cat <<-EOF\n\t\ttab\n\t  space\n\t\tEOF\necho after', NOHIST), 'tab\n  space\nafter\n', 0);
    eq('two on one line, and the rest of the line runs', await run('cat <<A <<B; echo done\na\nA\nb\nB', NOHIST), 'b\ndone\n', 0);
    eq('one each for two commands', await run('cat <<A; cat <<B\n1\nA\n2\nB', NOHIST), '1\n2\n', 0);
    eq('in a pipeline, into a file, in a loop', await run('cat <<EOF | tr a-z A-Z\npiped\nEOF\ncat <<EOF > hd.txt\nsaved\nEOF\ncat hd.txt\nfor i in 1 2; do cat <<EOF; done\nloop $i\nEOF', NOHIST), 'PIPED\nsaved\nloop 1\nloop 2\n', 0);
    eq('feeding a while read loop', await run('while read -r l; do echo "got $l"; done <<EOF\n1\n2\nEOF', NOHIST), 'got 1\ngot 2\n', 0);
    eq('in a function, kept for every call; declare -f shows it', await run('f() {\n  cat <<EOF\nin f: $1\nEOF\n}\nf arg\nf two\ndeclare -f f', NOHIST), 'in f: arg\nin f: two\nf () \n{ \n    cat <<EOF\nin f: $1\nEOF\n\n}\n', 0);
    eq('a backslash at the end of a line joins it (unquoted only)', await run("cat <<EOF\na\\\nb\nEOF\ncat <<'EOF'\na\\\nb\nEOF", NOHIST), 'ab\na\\\nb\n', 0);
    eq('the word must be the whole line', await run('cat <<EOF\n EOF\nEOF \nEOF', NOHIST), ' EOF\nEOF \n', 0);
    eq('no line with the word: bash\'s warning, then the text', await run('cat <<E2\na\nb', NOHIST), "bash: warning: here-document at line 1 delimited by end-of-file (wanted `E2')\na\nb\n", 0);
    eq('...also on the last line', await run('echo 1\ncat <<E', NOHIST), "1\nbash: warning: here-document at line 2 delimited by end-of-file (wanted `E')\n", 0);
    eq('...in a script it names the script and its last line', await run("printf 'echo x\\ncat <<E\\nbody\\n' > w.sh; bash w.sh", NOHIST), "x\nw.sh: line 3: warning: here-document at line 2 delimited by end-of-file (wanted `E')\nbody\n", 0);
    eq('<< with no word', await run('cat <<', NOHIST), "bash: syntax error near unexpected token `newline'\nbash: `cat <<'\n", 2);
    eq('inside $(...)', await run('x=$(cat <<EOF\ninside\nEOF\n)\necho "[$x]"', NOHIST), '[inside]\n', 0);
    eq('here-strings', await run('cat <<<\'here string\'; x=\'a  b\'; cat <<< $x; wc -l <<< ""; read a b <<< "one two three"; echo "$a|$b"; g() { cat <<< "in $1"; }; g x; declare -f g', NOHIST), 'here string\na  b\n1\none|two three\nin x\ng () \n{ \n    cat <<< "in $1"\n}\n', 0);
    eq('the last redirection of stdin wins', await run('echo file > in.txt; cat < in.txt <<EOF\nheredoc\nEOF\ncat <<EOF < in.txt\nheredoc\nEOF', NOHIST), 'heredoc\nfile\n', 0);
    // at the prompt: the lines are asked for with "> " until the word, as bash does; the history keeps the first line
    let lines = [], asked = [];
    const typed = (s) => ({ ask: async (p, hint) => { asked.push(p); return lines.length ? lines.shift() : null; } });
    lines = ['a $x', 'b', 'EOF', 'never asked'];
    eq('typed at the prompt: the lines are asked for', await run('x=5; cat <<EOF', typed()), 'a 5\nb\n', 0);
    check('...with bash\'s "> " prompt, until the word', asked.join('|'), '> |> |> ');
    check('...and the history keeps the line typed', sh.history[sh.history.length - 1], 'x=5; cat <<EOF');
    check('...the extra line was not taken', lines.join('|'), 'never asked');
    lines = ['1', 'A', '\t2', '\tB']; asked = [];
    eq('two of them at the prompt', await run('cat <<A <<-B', typed()), '2\n', 0);
    lines = ['only']; asked = [];
    eq('Ctrl+D (the end of input) ends the text, with the warning', await run('cat <<E', typed()), "bash: warning: here-document at line 1 delimited by end-of-file (wanted `E')\nonly\n", 0);
    lines = []; asked = [];
    eq('a here-string asks for nothing', await run('cat <<< "hi there"', typed()), 'hi there\n', 0);
    check('...really nothing', asked.length, 0);
    {
      const f2 = fresh(); let n = 0;
      const r = await f2.run('cat <<EOF; echo never', { ask: async () => { if (++n === 2) f2.sh.cancel(); return 'line'; } });
      eq('Ctrl+C while typing the lines: nothing runs', r, '^C\n', 130);
      const r2 = await f2.run('cat <<EOF', { ask: async () => 'x'.repeat(1000) });
      check('typed lines are capped (no word ever comes)', r2.out.length < SHELL.LIMITS.fileBytes * 1.1 && /delimited by end-of-file/.test(r2.out), true);
    }
  }
  // ---- [[ ]]
  {
    const { run } = fresh();
    await run('touch f.txt; echo hi > full.txt; mkdir d');
    eq('[[ ]]: strings, patterns, quoting', await run('x=\'a b\'; [[ $x == \'a b\' ]] && echo same; [[ $x == a* ]] && echo glob; [[ $x == "a*" ]] || echo literal; p=\'a*\'; [[ $x == $p ]] && echo pvar; [[ $x == "$p" ]] || echo pquoted; [[ $x != b* ]] && echo ne; [[ a = a ]] && echo single'), 'same\nglob\nliteral\npvar\npquoted\nne\nsingle\n', 0);
    eq('[[ ]]: no splitting, no wildcards, ~ in a pattern', await run('x=*; [[ $x == \'*\' ]] && echo nostar; y="a   b"; [[ $y == "a   b" ]] && echo nosplit; [[ $nope == "" ]] && echo empty; [[ $HOME == ~ ]] && echo tilde'), 'nostar\nnosplit\nempty\ntilde\n', 0);
    eq('[[ ]]: < and > compare text, -lt numbers (arithmetic)', await run('[[ abc < abd ]] && echo lt; [[ b > a ]] && echo gt; [[ 3 < 10 ]] || echo strlt; [[ 3 -lt 10 ]] && echo numlt; [[ 1+1 -eq 2 ]] && echo arith; x=5; [[ x -gt 3 ]] && echo name; [[ 010 -eq 8 ]] && echo octal'), 'lt\ngt\nstrlt\nnumlt\narith\nname\noctal\n', 0);
    eq('[[ ]]: an arithmetic error says so; that test is false', await run('[[ 1.5 -eq 1 ]]; echo $?; [[ 1.5 -eq 1 || a == a ]]; echo $?'), 'bash: [[: 1.5: syntax error: invalid arithmetic operator (error token is ".5")\n1\nbash: [[: 1.5: syntax error: invalid arithmetic operator (error token is ".5")\n0\n', 0);
    eq('[[ ]]: files', await run('[[ -e f.txt && -f f.txt && -d d && ! -d f.txt ]] && echo files; [[ -s f.txt ]] || echo empty; [[ -s full.txt ]] && echo full; [[ -e nope || -e d ]] && echo or; [[ -e "" ]] || echo noname; [[ full.txt -ef ./full.txt ]] && echo ef'), 'files\nempty\nfull\nor\nnoname\nef\n', 0);
    eq('[[ ]]: -z -n, a lone word', await run("x=''; [[ $x ]]; echo $?; [[ -z $x ]]; echo $?; [[ -n $x ]]; echo $?; [[ -v HOME ]] && echo set; [[ -v nope ]] || echo unset; a=(1 2); [[ -v a[1] ]] && echo elem"), '1\n0\n1\nset\nunset\nelem\n', 0);
    eq('[[ ]]: && || ! ( )', await run('[[ a == a || b == c && c == d ]]; echo $?; [[ ( a == a || b == c ) && c == d ]]; echo $?; [[ ! -f nope && ( -f f.txt || -d nope ) ]] && echo complex; [[ ! ! a ]] && echo dbl'), '0\n1\ncomplex\ndbl\n', 0);
    eq('[[ ]]: =~ and BASH_REMATCH', await run('s=\'hello world 42\'; [[ $s =~ ([a-z]+)\\ ([a-z]+)\\ ([0-9]+) ]] && echo "${BASH_REMATCH[0]}|${BASH_REMATCH[1]}|${BASH_REMATCH[3]}|${#BASH_REMATCH[@]}"; [[ abc =~ ^a(b|x)c$ ]] && echo alt "${BASH_REMATCH[1]}"; [[ abc =~ "a.c" ]] || echo quoted; re=\'^[0-9]+$\'; [[ 123 =~ $re ]] && echo num; [[ ab =~ [[:alpha:]]+ ]] && echo cls "${BASH_REMATCH[0]}"; [[ abc =~ x ]]; echo $? "${#BASH_REMATCH[@]}"; [[ \'a b\' =~ (a b) ]] && echo spaced'), 'hello world 42|hello|42|4\nalt b\nquoted\nnum\ncls ab\n1 0\nspaced\n', 0);
    eq('[[ ]]: a regular expression that does not compile gives 2', await run("re='('; [[ a =~ $re ]]; echo $?"), '2\n', 0);
    eq('[[ ]] across lines, in if and while, with redirections', await run('[[ a == a &&\nb == b ]] && echo nl; i=0; while [[ $i -lt 2 ]]; do if [[ $i == 1 ]]; then echo one; fi; ((i++)); done; [[ x == x ]] > o.txt; echo $?', NOHIST), 'nl\none\n0\n', 0);
    eq('[[ ]] in a function: declare -f', await run('f() { [[ $1 == y* ]]; }; f yes && echo yes; declare -f f'), 'yes\nf () \n{ \n    [[ $1 == y* ]]\n}\n', 0);
    eq('[[ ]] is a keyword', await run('type [[; type -t ]]; echo [[ a ]]'), '[[ is a shell keyword\nkeyword\n[[ a ]]\n', 0);
    // bash's syntax errors: what was wrong, then "near" the token at fault; run as a script, the line too
    eq('[[ ]] errors: nothing inside', await run('[[ ]]'), "bash: syntax error near `]]'\n", 2);
    eq('[[ ]] errors: the line is shown in a script', await run('[[ a == ]]; echo x', NOHIST), "bash: unexpected argument `]]' to conditional binary operator\nbash: syntax error near `;'\nbash: `[[ a == ]]; echo x'\n", 2);
    eq('[[ ]] errors: a missing operator', await run('[[ a b ]]', NOHIST), "bash: conditional binary operator expected\nbash: syntax error near `b'\nbash: `[[ a b ]]'\n", 2);
    eq('[[ ]] errors: a unary test with nothing to test', await run('[[ -f ]]', NOHIST), "bash: unexpected argument `]]' to conditional unary operator\nbash: syntax error near `]]'\nbash: `[[ -f ]]'\n", 2);
    eq('[[ ]] errors: brackets', await run('[[ ( a == a ]]; [[ ( ]]', NOHIST), "bash: unexpected token `]]', expected `)'\nbash: syntax error near `;'\nbash: `[[ ( a == a ]]; [[ ( ]]'\n", 2);
    eq('[[ ]] errors: ( with nothing', await run('[[ ( ]]', NOHIST), "bash: expected `)'\nbash: syntax error near `]]'\nbash: `[[ ( ]]'\n", 2);
    eq('[[ ]] errors: ]] missing', await run('[[ a == b ]; echo x', NOHIST), "bash: syntax error in conditional expression\nbash: syntax error near `;'\nbash: `[[ a == b ]; echo x'\n", 2);
    eq('[[ ]] errors: the end of the text', await run('[[ a == b', NOHIST), "bash: unexpected EOF while looking for `]]'\nbash: syntax error: unexpected end of file\n", 2);
    eq('[[ ]] errors: an operator where a test should be', await run('[[ && a ]]', NOHIST), "bash: unexpected token `&&' in conditional command\nbash: syntax error near `&'\nbash: `[[ && a ]]'\n", 2);
    eq('[[ ]] errors: an unclosed bracket in =~', await run('[[ abc =~ ( ]]; echo $?', NOHIST), "bash: unexpected EOF while looking for matching `)'\nbash: unexpected argument to conditional binary operator\n", 2);
    eq('[[ ]] errors stop a script there', await run("printf 'echo 1\\n[[ a b ]]\\necho 3\\n' > e.sh; bash e.sh", NOHIST), "1\ne.sh: line 2: conditional binary operator expected\ne.sh: line 2: syntax error near `b'\ne.sh: line 2: `[[ a b ]]'\n", 2);
  }
  // ---- associative arrays
  {
    const { sh, run } = fresh();
    eq('declare -A: keys in bash\'s order', await run('declare -A m=([a]=1 [b]=2 [c]=3); echo "${!m[@]}"; echo "${m[@]}"; echo ${#m[@]} ${m[b]}; declare -p m'), 'c b a\n3 2 1\n3 2\ndeclare -A m=([c]="3" [b]="2" [a]="1" )\n', 0);
    eq('...the order of bash\'s hash table', await run('unset m; declare -A m; for k in apple banana cherry date elderberry fig grape; do m[$k]=${#k}; done; echo "${!m[@]}"'), 'cherry grape elderberry apple fig date banana\n', 0);
    eq('...after it grows past 2048 keys', await run('unset m; declare -A m; for i in $(seq 1 3000); do m[$i]=x; done; echo "${#m[@]}"; echo "${!m[@]}" | cut -c1-60'), '3000\n818 819 814 815 816 817 810 811 812 813 744 745 746 747 740 \n', 0);
    eq('...and with letters that are not ASCII', await run('unset m; declare -A m=([é]=1 [ü]=2 [日本]=3 [a]=4); echo "${!m[@]}"'), '日本 a ü é\n', 0);
    eq('an existing key keeps its place; an unset one comes back first', await run('unset m; declare -A m; m[x]=1; m[y]=2; m[x]=3; echo "${!m[@]}" "${m[@]}"; unset \'m[x]\'; echo "${!m[@]}"; m[x]=4; echo "${!m[@]}"'), 'y x 2 3\ny\ny x\n', 0);
    eq('keys with spaces, quotes, $ and __proto__', await run('unset m; declare -A m; m["two words"]=a; m[__proto__]=p; m[constructor]=c; m[\'$x\']=d; m[\'a"b\']=q; m[\'*\']=s; m[-1]=n; m[\' \']=sp; declare -p m; k=\'two words\'; echo "${m[$k]}" "${m[two words]}" "${m["two words"]}" ${m[__proto__]} ${#m[@]}'), 'declare -A m=([__proto__]="p" ["*"]="s" [" "]="sp" [-1]="n" ["two words"]="a" ["a\\"b"]="q" ["\\$x"]="d" [constructor]="c" )\na a a p 8\n', 0);
    check('associative arrays keep their values in a dictionary', Object.getPrototypeOf(sh.arrays.m.v), null);
    eq('an empty key is a bad subscript', await run('declare -A e; e[$nope]=1; echo not reached', NOHIST), 'bash: e[$nope]: bad array subscript\n', 1);
    eq('declare -A with no values, and empty', await run('declare -A n1; declare -p n1; declare -A n2=(); declare -p n2'), 'declare -A n1\ndeclare -A n2=()\n', 0);
    eq('key value pairs, and words without a key', await run('declare -A p=(a 1 b 2 c); declare -p p; declare -A q=([a]=1 b 2); declare -p q'), "declare -A p=([c]=\"\" [b]=\"2\" [a]=\"1\" )\nbash: q: 'b': must use subscript when assigning associative array\nbash: q: '2': must use subscript when assigning associative array\ndeclare -A q=([a]=\"1\" )\n", 0);
    eq('=(...), +=(...), [k]+=', await run('declare -A r=([x]=1); r=(y 2); declare -p r; r+=([z]=3); r[z]+=0; declare -p r; echo ${#r[z]}'), 'declare -A r=([y]="2" )\ndeclare -A r=([z]="30" [y]="2" )\n2\n', 0);
    eq('$m is ${m[0]}; m=v sets the key 0', await run('declare -A s=([one]=1); echo "[$s]"; s=v2; declare -p s'), '[]\ndeclare -A s=([0]="v2" [one]="1" )\n', 0);
    eq('converting is refused, as in bash', await run('ia=(1 2); declare -A ia; echo $?; declare -A aa=([a]=1); declare -a aa; declare -aA both'), 'bash: declare: ia: cannot convert indexed to associative array\n1\nbash: declare: aa: cannot convert associative to indexed array\nbash: declare: both: cannot convert associative to indexed array\n', 1);
    eq('local -A and declare -A in a function', await run('f() { local -A loc=([a]=1); declare -p loc; declare -A d; d[x]=1; echo ${#d[@]}; }; f; declare -p loc; echo "[${d[x]}]"'), 'declare -A loc=([a]="1" )\n1\nbash: declare: loc: not found\n[]\n', 0);
    eq('counting words with (( m[$w]++ ))', await run('declare -A count; for w in the cat the dog the end; do ((count[$w]++)); done; for k in the cat dog end; do echo $k ${count[$k]}; done'), 'the 3\ncat 1\ndog 1\nend 1\n', 0);
    eq('in arithmetic the key is text', await run('declare -A am=([a]=5); echo $(( am[a] * 2 )); (( am[b] = 7 )); echo ${am[b]}; k=a; echo $(( am[$k] + 1 ))'), '10\n7\n6\n', 0);
    eq('unset an element or all', await run('declare -A u=([a]=1 [b]=2); unset u[a]; declare -p u; unset \'u[@]\'; declare -p u; unset u; declare -p u'), 'declare -A u=([b]="2" )\ndeclare -A u=([b]="2" )\nbash: declare: u: not found\n', 1);
    eq('[[ -v m[k] ]]', await run('declare -A v=([a]=1); [[ -v v[a] ]] && echo seta; [[ -v v[b] ]] || echo unsetb; [[ -v v ]] || echo nozero'), 'seta\nunsetb\nnozero\n', 0);
    eq('a key with an assignment before a command is refused', await run('declare -A w=([a]=1); w[a]=2 echo hi; declare -p w'), "bash: `w[a]': not a valid identifier\nhi\ndeclare -A w=([a]=\"1\" )\n", 0);
    eq('declare -p -A lists only associative arrays', await fresh().run('declare -A only=([k]=v); ix=(1); declare -p -A'), 'declare -A only=([k]="v" )\n', 0);
    eq('an associative array has the indexed one\'s cap', await run('declare -A big=($(seq 20000)); echo ${#big[@]}; big[more]=1'), '10000\nbash: stopped: an array here holds at most ' + SHELL.LIMITS.array + ' values and ' + SHELL.LIMITS.vars * 4 + ' characters.\n', 1);
    eq('...and on characters, keys included', await run('declare -A ch; k=kkkkkkkkkk; for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16; do k=$k$k; done; ch[$k]=1; ch[x$k]=1; ch[y$k]=1; ch[z$k]=1; ch[w$k]=1'), /stopped: an array here holds at most/, 1);
  }
  // ---- read, mapfile, printf -v, $RANDOM, $SECONDS, ${x@Q}, shopt
  {
    const { sh, run } = fresh();
    await run("printf 'one\\ntwo\\n' > f.txt");
    eq('read and IFS', await run('IFS=, read a b <<< "1,2,"; echo "[$a][$b]"; IFS=, read a b <<< "1,2,3,"; echo "[$a][$b]"; IFS=, read a b <<< "1,,2"; echo "[$a][$b]"; IFS=\', \' read a b c <<< "  x , y ,z  "; echo "[$a][$b][$c]"; IFS=: read -a parts <<< "a:b::c:"; printf \'[%s]\' "${parts[@]}"; echo'), '[1][2]\n[1][2,3,]\n[1][,2]\n[x][y][z]\n[a][b][][c]\n', 0);
    eq('read: backslashes without -r, and with it', await run("read a b <<< '  one\\ two  three\\\\four  '; echo \"[$a][$b]\"; read -r a b <<< '  one\\ two  three\\\\four  '; echo \"[$a][$b]\"; printf 'abc\\\\\\ndef\\n' | { read x; echo \"[$x]\"; }; printf 'abc\\\\\\ndef\\n' | { read -r x; echo \"[$x]\"; }"), '[one two][three\\four]\n[one\\][two  three\\\\four]\n[abcdef]\n[abc\\]\n', 0);
    eq('read: REPLY keeps the spaces; IFS= keeps them too', await run('read <<< "  spaced  "; echo "[$REPLY]"; IFS= read -r line <<< "  keep  "; echo "[$line]"'), '[  spaced  ]\n[  keep  ]\n', 0);
    eq('read: the last line without a newline is read, with status 1', await run("printf 'l1\\nl2\\nl3' | while read -r l; do echo \"[$l]\"; done; printf 'l1\\nl2' | while IFS= read -r l || [[ -n $l ]]; do echo \"[$l]\"; done"), '[l1]\n[l2]\n[l1]\n[l2]\n', 0);
    eq('read -d and -n', await run('read -d , first <<< "a,b,c"; echo "[$first] $?"; read -d , all <<< "abc"; echo "[$all] $?"; read -n 3 three <<< "abcdef"; echo "[$three]"'), '[a] 0\n[abc] 1\n[abc]\n', 0);
    eq('read: a bad name', await run('read 1x <<< a; echo $?'), "bash: read: `1x': not a valid identifier\n1\n", 0);
    eq('mapfile -t, and with the newlines (declare -p shows $\'...\')', await run('mapfile -t lines < f.txt; declare -p lines; mapfile lines2 < f.txt; declare -p lines2'), 'declare -a lines=([0]="one" [1]="two")\ndeclare -a lines2=([0]=$\'one\\n\' [1]=$\'two\\n\')\n', 0);
    eq('mapfile -n -s -O -d, readarray, MAPFILE', await run("printf 'a\\nb\\nc\\nd\\n' > g.txt; mapfile -t -n 2 x < g.txt; declare -p x; mapfile -t -s 1 y < g.txt; mapfile -t -O 5 y < g.txt; declare -p y; readarray -t r <<< \"one\ntwo\"; echo ${#r[@]} \"${r[1]}\"; mapfile <<< x; declare -p MAPFILE; mapfile -t -d , c <<< 'a,b,c'; declare -p c; mapfile -t e < /dev/null; declare -p e", NOHIST), 'declare -a x=([0]="a" [1]="b")\ndeclare -a y=([0]="b" [1]="c" [2]="d" [5]="a" [6]="b" [7]="c" [8]="d")\n2 two\ndeclare -a MAPFILE=([0]=$\'x\\n\')\ndeclare -a c=([0]="a" [1]="b" [2]=$\'c\\n\')\ndeclare -a e=()\n', 0);
    eq('mapfile errors', await run('mapfile -t 1bad < f.txt; echo $?; mapfile -q x'), "bash: mapfile: `1bad': not a valid identifier\n1\nbash: mapfile: -q: invalid option\nmapfile: usage: mapfile [-d delim] [-n count] [-O origin] [-s count] [-t] [-u fd] [-C callback] [-c quantum] [array]\n", 2);
    eq('mapfile is capped like any array', await run('seq 20000 > many.txt; mapfile -t m < many.txt'), /stopped: an array here holds at most/, 1);
    eq('printf -v', await run("printf -v out '%05d|%s' 42 hi; echo \"[$out]\"; printf -v 'arr[2]' '%s' two; declare -p arr; declare -A pm; printf -v 'pm[k]' 'v%d' 1; declare -p pm; printf -v x '%s-' a b c; echo \"[$x]\""), '[00042|hi]\ndeclare -a arr=([2]="two")\ndeclare -A pm=([k]="v1" )\n[a-b-c-]\n', 0);
    eq('printf -v errors', await run('printf -v 1x %s a; echo $?; printf -v; printf -v x; echo $?'), "bash: printf: `1x': not a valid identifier\n2\nbash: printf: -v: option requires an argument\nprintf: usage: printf [-v var] format [arguments]\nprintf: usage: printf [-v var] format [arguments]\n2\n", 0);
    eq('$RANDOM is bash\'s generator: the same numbers from the same seed', await run('RANDOM=42; echo $RANDOM $RANDOM $RANDOM; RANDOM=42; echo $RANDOM; RANDOM=0; echo $RANDOM $RANDOM; RANDOM=1; for i in 1 2 3 4 5 6 7 8 9 10; do echo -n "$((RANDOM % 6 + 1)) "; done; echo'), '17772 26794 1435\n17772\n20814 24386\n2 4 1 4 4 1 2 6 1 4 \n', 0);
    eq('...unseeded, numbers from 0 to 32767', await run('unseeded=1; for i in 1 2 3 4 5; do r=$RANDOM; (( r >= 0 && r < 32768 )) || echo bad; done; echo ok'), 'ok\n', 0);
    eq('$SECONDS', await run('echo $SECONDS; SECONDS=100; echo $SECONDS'), '0\n100\n', 0);
    eq('${x@Q} ${x@U} ${x@L} ${x@u} ${x@E} ${x@a}', await run("x=\"it's\"; echo \"${x@Q}\"; y='a b'; echo ${y@Q}; z=; echo \"[${z@Q}]\" \"[${nope@Q}]\"; t=$'a\\tb'; echo \"${t@Q}\"; s='hello World'; echo \"${s@U}\" \"${s@L}\" \"${s@u}\"; e='a\\tb'; echo \"${e@E}\"; a=(x 'y z'); echo \"${a[@]@Q}\" \"${a[1]@U}\" \"${a@a}\"; declare -A as; echo \"${as@a}\"; echo \"${x@Z}\"; echo not reached"), "'it'\\''s'\n'a b'\n[''] []\n$'a\\tb'\nHELLO WORLD hello world Hello World\na\tb\n'x' 'y z' Y Z a\nA\nbash: ${x@Z}: bad substitution\n", 1);
    eq("$'...' and $\"...\"", await run("echo $'tab\\there' $'it\\'s' $'\\x41\\101' \"$'not'\" $\"plain\""), "tab\there it's AA $'not' plain\n", 0);
    eq('shopt -s nullglob', await run('shopt -s nullglob; for f in *.nope; do echo "never $f"; done; echo none: *.nope; shopt nullglob; shopt -u nullglob; echo *.nope; shopt -p nullglob; shopt nullglob'), 'none:\nnullglob       \ton\n*.nope\nshopt -u nullglob\nnullglob       \toff\n', 1);
    eq('shopt -s dotglob and failglob', await run('touch .a d1; shopt -s dotglob; echo *; shopt -u dotglob; echo *; shopt -s failglob; echo *.nope; echo after'), '.a d1 f.txt g.txt many.txt\nd1 f.txt g.txt many.txt\nbash: no match: *.nope\n', 1);
    eq('shopt: the list, and options not here', await run('shopt -u failglob; shopt; shopt -s; shopt -s nosuch extglob; echo $?'), 'dotglob        \toff\nexpand_aliases \ton\nfailglob       \toff\nnullglob       \toff\nexpand_aliases \ton\nbash: shopt: nosuch: invalid shell option name\nbash: shopt: extglob: not available in this practice shell (dotglob, expand_aliases, failglob, nullglob are)\n1\n', 0);
    eq('a script\'s shopt ends with it', await run("printf 'shopt -s nullglob\\necho in: *.zz\\n' > so.sh; bash so.sh; echo out: *.zz", NOHIST), 'in:\nout: *.zz\n', 0);
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
