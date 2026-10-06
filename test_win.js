// Node tests for the Windows Command Prompt and PowerShell of the practice terminal (src/shellwin.js): the path mapping, every cmd command
// and PowerShell cmdlet with its messages, nesting and exit, the grader running in bash, Tab completion, a lesson's prompts, and the limits.
// PowerShell's formats were compared with a real pwsh 7.4.6 (Linux build, en-US, width 120; adapted to Windows paths and Mode strings);
// cmd's are Windows 10/11's as remembered (no cmd.exe could run here).   node test_win.js
process.env.TZ = 'UTC';
const SHELL = require('./src/shell.js');
const WIN = require('./src/shellwin.js');
require('./src/shellgit.js');
const SG = require('./src/shellgrade.js');
let bad = 0, n = 0;
const check = (name, got, want) => { n++; const ok = want instanceof RegExp ? want.test(got) : got === want; if (!ok) { bad++; console.log('BAD  ' + name + '\n  got:  ' + JSON.stringify(got) + '\n  want: ' + (want instanceof RegExp ? want : JSON.stringify(want))); } };
const T0 = Date.UTC(2026, 9, 5, 9, 0, 0);
const TREE = { 'garden/shed/key.txt': 'the key is under the pot\n', 'garden/flowers.txt': 'roses\ntulips\n', 'notes.txt': 'hello\n', 'hello.py': 'print("hi")\n' };
function fresh(opts) {
  opts = opts || {};
  const fs = SG.makeFS(opts.tree || TREE, null, { now: () => T0 });
  const ran = [];
  const sh = SHELL.makeShell({ fs, now: () => T0, nano: opts.nano,
    run: async (lang, src, o) => { ran.push({ lang, src, args: o.args, stdin: o.stdin }); o.onOutput('ran ' + lang + (o.args.length ? ' ' + o.args.join(',') : '') + (o.stdin != null ? ' <' + JSON.stringify(o.stdin) : '') + '\n'); return /boom/.test(src) ? { err: 'Error: boom', exit: 1 } : { exit: 0 }; },
    compile: async () => ({ err: null }) });
  const answers = [];
  const asked = [];
  const run = async (line, io) => {
    let out = '';
    const exit = await sh.exec(line, Object.assign({ out: (s) => { out += s; }, err: (s) => { out += s; }, tty: true, ask: opts.ask === false ? undefined : async (p) => { asked.push(p); return answers.length ? answers.shift() : null; } }, io || {}));
    return { out, exit };
  };
  return { fs, sh, run, ran, answers, asked };
}
// a run's { out, exit } against the text and exit status expected (or any other value against what is expected)
const eq = (name, r, out, exit) => { if (!r || typeof r !== 'object' || !('out' in r)) { check(name, r, out); return; } check(name + ' output', r.out, out); if (exit !== undefined) check(name + ' exit', r.exit, exit); };
const BANNER = 'Microsoft Windows [Version 10.0.22631.4317]\n(c) Microsoft Corporation. All rights reserved.\n\n';
const VOL = ' Volume in drive C has no label.\n Volume Serial Number is 6A2F-91C3\n';
const D = '10/05/2026  09:00 AM';
const FSH = 'Mode                 LastWriteTime         Length Name\n----                 -------------         ------ ----\n';
const row = (dir, len, name) => (dir ? 'd----' : '-a---') + '           10/5/2026  9:00 AM ' + (dir ? '' : String(len)).padStart(14) + ' ' + name + '\n';

(async () => {
  // ---- starting, prompts, nesting, exit
  {
    const { sh, run, fs } = fresh();
    check('bash prompt', sh.prompt(), 'student@lab:~$ ');
    eq('cmd banner', await run('cmd'), BANNER, 0);
    check('cmd prompt', sh.prompt(), 'C:\\Users\\student>');
    eq('cmd blank line after a command', await run('echo hi'), 'hi\n\n', 0);
    eq('cmd empty line', await run(''), '', 0);
    eq('cmd to powershell', await run('powershell'), 'PowerShell 7.4.6\n', 0);
    check('ps prompt', sh.prompt(), 'PS C:\\Users\\student> ');
    eq('ps no blank line', await run('"x"'), 'x\n', 0);
    eq('cmd inside ps', await run('cmd'), BANNER, 0);
    check('three deep', sh.dialect.length, 3);
    eq('exit to ps', await run('exit'), '', 0);
    check('back in ps', sh.prompt(), 'PS C:\\Users\\student> ');
    eq('exit ps to cmd: cmd\'s blank line', await run('exit'), '\n', 0);
    eq('cmd exit code', await run('exit 3'), '', 3);
    check('back in bash', sh.prompt(), 'student@lab:~$ ');
    eq('bash sees the code', await run('echo $?'), '3\n', 0);
    check('history is shared', sh.history.slice(0, 6).join('|'), 'cmd|echo hi|powershell|"x"|cmd|exit');
    eq('pwsh name', await run('pwsh'), 'PowerShell 7.4.6\n'); await run('exit');
    eq('pwsh -NoLogo', await run('pwsh -NoLogo'), ''); await run('exit');
    eq('cmd.exe name', await run('cmd.exe'), BANNER); await run('exit');
    // one working directory for all of them
    await run('cmd'); await run('cd garden'); check('cd in cmd moves fs.cwd', fs.cwd, '/home/student/garden'); await run('exit');
    eq('bash is there too', await run('pwd'), '/home/student/garden\n');
    await run('cd /etc'); await run('cmd'); check('from /etc: the home', sh.prompt(), 'C:\\Users\\student>'); check('fs.cwd moved home', fs.cwd, '/home/student'); await run('exit');
  }
  // ---- one-shot runs from bash
  {
    const { run, fs } = fresh();
    eq('cmd /c', await run('cmd /c dir /b'), 'garden\nhello.py\nnotes.txt\n', 0);
    eq('cmd /c quoted', await run('cmd /c "echo a & echo b"'), 'a \nb\n', 0);
    eq('cmd /c exit code', await run('cmd /c exit 4; echo $?'), '4\n');
    eq('cmd /c cd does not stay', await run('cmd /c "cd garden & cd"; pwd'), 'C:\\Users\\student\\garden\n/home/student\n');
    eq('pwsh -c', await run('pwsh -c "Get-ChildItem -Name"'), 'garden\nhello.py\nnotes.txt\n', 0);
    eq('powershell -Command', await run('powershell -Command "Get-Content notes.txt | Measure-Object -Line"'), '\nLines Words Characters Property\n----- ----- ---------- --------\n    1                  \n\n', 0);
    eq('pwsh -c failure', await run('pwsh -c "Get-Content nope"; echo $?'), "Get-Content: Cannot find path 'C:\\Users\\student\\nope' because it does not exist.\n1\n");
    eq('pwsh -c exit', await run("pwsh -c 'exit 7'; echo $?"), '7\n');
    // PowerShell hands a program its arguments as one line: a path with a space and backslashes must arrive as it was (no doubled backslashes)
    {
      const { run: r2 } = fresh({ tree: Object.assign({ 'my dir/notes.txt': 'tulip bed\n' }, TREE) });
      eq('pwsh to findstr: a path with a space', await r2('pwsh -c "findstr /m tulip \'C:\\Users\\student\\my dir\\notes.txt\'"'), 'C:\\Users\\student\\my dir\\notes.txt\n', 0);
    }
    eq('pwsh -Version', await run('pwsh -Version'), 'PowerShell 7.4.6\n', 0);
    eq('pwsh bad argument', await run('pwsh -Bogus'), "The argument '-Bogus' is not recognized as the name of a script file. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.\n\nUsage: pwsh[.exe] [-Login] [[-File] <filePath> [args]]\n", 64);
    fs.write('/home/student/s.ps1', '"in a script"\nexit 5\n');
    eq('pwsh -File', await run('pwsh -File s.ps1; echo $?'), 'in a script\n5\n');
    eq('pwsh script.ps1', await run('pwsh s.ps1 >/dev/null; echo $?'), '5\n');
    eq('lines into cmd', await run('echo "cd garden" | cmd'), BANNER + 'C:\\Users\\student>cd garden\n\nC:\\Users\\student\\garden>\n', 0);
    eq('cmd with no keyboard', await run('cmd', { tty: false }), BANNER, 0);
    eq('help mentions them', /\n  cmd +Start the Windows Command Prompt \(cmd\.exe\) over the same files\n  powershell +Start PowerShell 7 over the same files\n/.test((await run('help')).out), true);
    eq('man cmd', /^CMD\(1\)/.test((await run('man cmd')).out), true);
    eq('which cmd', await run('which cmd'), '/bin/cmd\n');
  }
  // ---- the Windows view of the file system
  {
    const { run, fs } = fresh();
    await run('cmd');
    eq('C:\\', await run('dir /b C:\\'), 'Temp\nUsers\nWindows\n\n');
    eq('Users', await run('dir /b \\Users'), 'student\n\n');
    eq('Windows is read-only', await run('mkdir C:\\Windows\\x'), 'Access is denied.\n\n', 1);
    eq('nothing new at the root', await run('mkdir C:\\nope'), 'Access is denied.\n\n', 1);
    eq('Temp is /tmp', (await run('echo t> C:\\Temp\\t.txt')).out, '\n'); check('in /tmp', fs.read('/tmp/t.txt'), 't\n');
    eq('case-insensitive names', await run('type GARDEN\\Flowers.TXT'), 'roses\ntulips\n\n', 0);
    eq('cd keeps the disk\'s case', await run('cd GARDEN\\SHED'), '\n'); check('prompt in real case', fs.cwd, '/home/student/garden/shed');
    eq('.. and \\', await run('cd ..\\..'), '\n'); check('back home', fs.cwd, '/home/student');
    eq('cd / works in cd', await run('cd garden/shed & cd'), 'C:\\Users\\student\\garden\\shed\n\n'); await run('cd \\Users\\student');
    eq('another drive', await run('cd D:\\'), 'The system cannot find the drive specified.\n\n', 1);
    eq('writes keep the existing case', await run('echo x> NOTES.TXT'), '\n'); check('notes.txt rewritten', fs.read('/home/student/notes.txt'), 'x\n'); check('no second file', fs.exists('/home/student/NOTES.TXT'), false);
    eq('a new name keeps its case', await run('echo y> New.TXT'), '\n'); check('New.TXT', fs.read('/home/student/New.TXT'), 'y\n');
    eq('bad characters', await run('echo z> a?b.txt'), 'The filename, directory name, or volume label syntax is incorrect.\n\n', 1);
    eq('cd into C:\\Windows', await run('cd C:\\Windows\\System32'), '\n'); check('fs.cwd is / there', fs.cwd, '/');
    eq('dir there', await run('dir /b py.*'), 'py.exe\n\n');
    eq('cd back', await run('cd %USERPROFILE%'), '\n'); check('home again', fs.cwd, '/home/student');
    eq('dot files are shown', (fs.write('/home/student/.hidden', 'h'), await run('dir /b')).out, '.hidden\ngarden\nhello.py\nNew.TXT\nnotes.txt\n\n');
    eq('climbing above C:\\ stays at C:\\', await run('cd ..\\..\\..\\..\\..\\..'), '\n'); check('prompt at the root', fs.cwd, '/');
  }
  // ---- cmd: dir
  {
    const { run, fs } = fresh();
    await run('cmd');
    eq('dir', await run('dir'), VOL + '\n Directory of C:\\Users\\student\n\n' + D + '    <DIR>          .\n' + D + '    <DIR>          ..\n' + D + '    <DIR>          garden\n' + D + '                12 hello.py\n' + D + '                 6 notes.txt\n               2 File(s)             18 bytes\n               3 Dir(s)       1,999,944 bytes free\n\n', 0);
    eq('dir wildcard', await run('dir *.txt'), VOL + '\n Directory of C:\\Users\\student\n\n' + D + '                 6 notes.txt\n               1 File(s)              6 bytes\n               0 Dir(s)       1,999,944 bytes free\n\n', 0);
    eq('dir missing', await run('dir nothere.txt'), VOL + '\n Directory of C:\\Users\\student\n\nFile Not Found\n\n', 1);
    eq('dir missing path', await run('dir nope\\x'), VOL + '\nThe system cannot find the path specified.\n\n', 1);
    eq('dir /b', await run('dir /b'), 'garden\nhello.py\nnotes.txt\n\n', 0);
    eq('dir /s /b', await run('dir /s /b'), 'C:\\Users\\student\\garden\nC:\\Users\\student\\hello.py\nC:\\Users\\student\\notes.txt\nC:\\Users\\student\\garden\\flowers.txt\nC:\\Users\\student\\garden\\shed\nC:\\Users\\student\\garden\\shed\\key.txt\n\n', 0);
    eq('dir /s', await run('dir /s garden'), VOL + '\n Directory of C:\\Users\\student\\garden\n\n' + D + '    <DIR>          .\n' + D + '    <DIR>          ..\n' + D + '                13 flowers.txt\n' + D + '    <DIR>          shed\n               1 File(s)             13 bytes\n\n Directory of C:\\Users\\student\\garden\\shed\n\n' + D + '    <DIR>          .\n' + D + '    <DIR>          ..\n' + D + '                25 key.txt\n               1 File(s)             25 bytes\n\n     Total Files Listed:\n               2 File(s)             38 bytes\n               5 Dir(s)       1,999,944 bytes free\n\n', 0);
    eq('dir /a:d /b', await run('dir /a:d /b'), 'garden\n\n', 0);
    eq('dir /a-d /b', await run('dir /a-d /b'), 'hello.py\nnotes.txt\n\n', 0);
    eq('dir /o-n /b', await run('dir /o-n /b'), 'notes.txt\nhello.py\ngarden\n\n', 0);
    eq('dir /w', await run('dir /w'), VOL + '\n Directory of C:\\Users\\student\n\n[.]        [..]       [garden]   hello.py   notes.txt\n               2 File(s)             18 bytes\n               3 Dir(s)       1,999,944 bytes free\n\n', 0);
    eq('dir a/b reads /b as a switch', await run('dir garden/b'), 'flowers.txt\nshed\n\n', 0);
    eq('dir invalid switch', await run('dir garden/shed'), 'Invalid switch - "shed".\n\n', 1);
    fs.write('/home/student/big.txt', 'x'.repeat(12345));
    eq('thousands', /09:00 AM            12,345 big\.txt\n/.test((await run('dir big.txt')).out), true);
    eq('dir of a file', /\n Directory of C:\\Users\\student\n\n10\/05\/2026  09:00 AM                 6 notes.txt\n/.test((await run('dir notes.txt')).out), true);
    eq('DIR in capitals', (await run('DIR /B GARDEN')).out, 'flowers.txt\nshed\n\n');
  }
  // ---- cmd: cd, type, echo, set, if, prompt
  {
    const { run, fs, sh } = fresh();
    await run('cmd');
    eq('cd alone', await run('cd'), 'C:\\Users\\student\n\n', 0);
    eq('cd..', await run('cd..'), '\n'); check('cd.. went up', fs.cwd, '/home');
    eq('cd\\', await run('cd\\'), '\n'); check('cd\\ root', fs.cwd, '/');
    eq('cd /d', await run('cd /d C:\\Users\\student\\garden'), '\n'); check('cd /d', fs.cwd, '/home/student/garden');
    eq('chdir', await run('chdir ..'), '\n');
    eq('cd missing', await run('cd nothere'), 'The system cannot find the path specified.\n\n', 1);
    eq('cd file', await run('cd notes.txt'), 'The directory name is invalid.\n\n', 1);
    eq('cd with spaces, unquoted', (fs.mkdir('/home/student/my stuff'), await run('cd my stuff')).out, '\n'); check('cd my stuff', fs.cwd, '/home/student/my stuff'); await run('cd ..');
    eq('type', await run('type notes.txt'), 'hello\n\n', 0);
    eq('type missing', await run('type nope.txt'), 'The system cannot find the file specified.\n\n', 1);
    eq('type dir', await run('type garden'), 'Access is denied.\n\n', 1);
    eq('type two', await run('type notes.txt garden\\flowers.txt'), '\nnotes.txt\n\n\nhello\n\ngarden\\flowers.txt\n\n\nroses\ntulips\n\n', 0);
    eq('type a / path', await run('type garden/flowers.txt'), 'The syntax of the command is incorrect.\n\n', 1);
    eq('type a quoted / path', await run('type "garden/flowers.txt"'), 'roses\ntulips\n\n', 0);
    eq('type without a final newline', (fs.write('/home/student/n.txt', 'no end'), await run('type n.txt')).out, 'no end\n');
    eq('echo', await run('echo Hello,   world!'), 'Hello,   world!\n\n', 0);
    eq('echo.', await run('echo.'), '\n\n', 0);
    eq('echo alone', await run('echo'), 'ECHO is on.\n\n', 0);
    eq('echo keeps the space before >', (await run('echo hi > e.txt'), fs.read('/home/student/e.txt')), 'hi \n');
    eq('echo ^ escapes', await run('echo a ^& b ^| c ^> d'), 'a & b | c > d\n\n');
    eq('echo off hides the prompt', await run('echo off'), '', 0); check('no prompt', sh.prompt(), '');
    eq('echo on', await run('echo on'), '\n'); check('prompt back', sh.prompt(), 'C:\\Users\\student>');
    eq('set a value', await run('set GREETING=hi there'), '\n', 0);
    eq('%expand%', await run('echo %greeting%!'), 'hi there!\n\n');
    eq('%unknown% stays', await run('echo %nope%'), '%nope%\n\n');
    eq('set prefix', await run('set gr'), 'GREETING=hi there\n\n', 0);
    eq('set missing', await run('set zz'), 'Environment variable zz not defined\n\n', 1);
    eq('%CD% %USERNAME% %USERPROFILE%', await run('echo %CD% %USERNAME% %USERPROFILE%'), 'C:\\Users\\student student C:\\Users\\student\n\n');
    eq('%ERRORLEVEL%', await run('echo %ERRORLEVEL%'), '1\n\n');
    eq('substrings', await run('echo %GREETING:~0,2% %GREETING:hi=bye%'), 'hi bye there\n\n');
    eq('set with spaces around =', (await run('set x = 5'), await run('echo [%x %]')).out, '[ 5]\n\n');
    eq('unset', (await run('set GREETING='), await run('echo %GREETING%')).out, '%GREETING%\n\n');
    eq('set /a', await run('set /a n=6*7'), '42\n', 0);
    eq('set /a uses names', await run('set /a n+1'), '43\n');
    eq('set /a hex and %', await run('set /a 0x10 % 7'), '2\n');
    eq('set /a divide by zero', await run('set /a 1/0'), 'Divide by zero error.\n\n', 1073750993);
    eq('set /a missing operand', await run('set /a 2*'), 'Missing operand.\n\n', 1073750988);
    eq('set /p', (await run('set /p NAME=Your name: ', { stdin: 'Ada\n' })).out, 'Your name: \n');
    eq('set /p value', await run('echo %NAME%'), 'Ada\n\n');
    const all = (await run('set')).out;
    check('set lists sorted', /^COMPUTERNAME=LAB\nComSpec=C:\\Windows\\system32\\cmd\.exe\n/.test(all), true);
    check('set has USERPROFILE', /\nUSERPROFILE=C:\\Users\\student\n/.test(all), true);
    eq('if exist', await run('if exist notes.txt echo yes'), 'yes\n\n');
    eq('if not exist', await run('if not exist nope echo no'), 'no\n\n');
    eq('if ==', await run('if "a"=="b" echo same'), '\n', 0);
    eq('if ( ) else is not here', await run('if "a"=="b" (echo same) else (echo diff)'), 'IF with ( ) blocks or ELSE is not available in this practice Command Prompt: give IF one command.\n\n', 1);
    eq('if /i', await run('if /i "A"=="a" echo same'), 'same\n\n');
    eq('if errorlevel', (await run('type nope 2>nul'), await run('if errorlevel 1 echo failed')).out, 'failed\n\n');
    eq('prompt', await run('prompt $P$_$G'), '\n'); check('two-line prompt', sh.prompt(), 'C:\\Users\\student\n>'); await run('prompt');
    eq('ver', await run('ver'), '\nMicrosoft Windows [Version 10.0.22631.4317]\n\n');
    eq('vol', await run('vol'), VOL + '\n');
    eq('whoami', await run('whoami'), 'lab\\student\n\n');
    eq('hostname', await run('hostname'), 'lab\n\n');
    eq('date /t', await run('date /t'), 'Mon 10/05/2026\n\n');
    eq('time /t', await run('time /t'), '09:00 AM\n\n');
    eq('title', await run('title Hello'), '\n', 0);
    eq('rem', await run('rem nothing'), '\n', 0);
    eq('pushd popd', (await run('pushd garden'), await run('cd')).out, 'C:\\Users\\student\\garden\n\n'); await run('popd'); check('popd', fs.cwd, '/home/student');
    eq('unknown', await run('frobnicate now'), "'frobnicate' is not recognized as an internal or external command,\noperable program or batch file.\n\n", 9009);
    eq('not here', await run('ipconfig'), 'IPCONFIG is not available in this practice Command Prompt.\n\n', 1);
    eq('help', /^For more information on a specific command, type HELP command-name\nCD             Displays the name of or changes the current directory\.\n/.test((await run('help')).out), true);
    eq('help dir', /^Displays a list of files and subdirectories in a directory\.\n\nDIR /.test((await run('help dir')).out), true);
    eq('dir /?', /^Displays a list of files/.test((await run('dir /?')).out), true);
    eq('cls', await run('cls', { clear: () => { } }), '', 0);
    eq('python', await run('python hello.py a b'), 'ran python a,b\n\n', 0);
    eq('python a file in another case', await run('python HELLO.PY'), 'ran python\n\n', 0);
    eq('python missing', await run('python nope.py'), "C:\\Users\\student\\AppData\\Local\\Programs\\Python\\Python39\\python.exe: can't open file 'C:\\\\Users\\\\student\\\\nope.py': [Errno 2] No such file or directory\n\n", 2);
    eq('a .py file by name', await run('hello.py'), 'ran python\n\n', 0);
    eq('py launcher', await run('py hello.py'), 'ran python\n\n', 0);
    eq('python.exe', await run('python.exe hello.py'), 'ran python\n\n', 0);
    eq('python reads a pipe', await run('type notes.txt | python hello.py'), 'ran python <"hello\\n"\n\n');
  }
  // ---- cmd: copy, move, ren, del, mkdir, rmdir
  {
    const { run, fs, answers, asked } = fresh();
    await run('cmd');
    eq('copy', await run('copy notes.txt n2.txt'), '        1 file(s) copied.\n\n', 0); check('copied', fs.read('/home/student/n2.txt'), 'hello\n');
    eq('copy into a dir', await run('copy notes.txt garden'), '        1 file(s) copied.\n\n', 0); check('in garden', fs.read('/home/student/garden/notes.txt'), 'hello\n');
    answers.push('n');
    eq('copy asks before overwriting', await run('copy notes.txt n2.txt'), '        0 file(s) copied.\n\n', 1); check('the question', asked[asked.length - 1], 'Overwrite C:\\Users\\student\\n2.txt? (Yes/No/All): ');
    eq('copy /y', await run('copy /y notes.txt n2.txt'), '        1 file(s) copied.\n\n', 0);
    eq('copy wildcard', await run('copy *.txt garden\\shed /y'), 'n2.txt\nnotes.txt\n        2 file(s) copied.\n\n', 0);
    eq('copy missing', await run('copy nope.txt x.txt'), 'The system cannot find the file specified.\n        0 file(s) copied.\n\n', 1);
    eq('copy onto itself', await run('copy notes.txt .'), 'The file cannot be copied onto itself.\n        0 file(s) copied.\n\n', 1);
    eq('copy no such folder', await run('copy notes.txt nope\\x.txt'), 'The system cannot find the path specified.\n        0 file(s) copied.\n\n', 1);
    eq('copy joins files', await run('copy *.txt all.dat'), 'n2.txt\nnotes.txt\n        1 file(s) copied.\n\n', 0); check('joined', fs.read('/home/student/all.dat'), 'hello\nhello\n');
    eq('copy a folder copies its files', await run('copy garden\\shed box.txt /y'), 'garden\\shed\\key.txt\ngarden\\shed\\n2.txt\ngarden\\shed\\notes.txt\n        1 file(s) copied.\n\n', 0);
    eq('move', await run('move n2.txt n3.txt'), '        1 file(s) moved.\n\n', 0); check('moved', fs.exists('/home/student/n3.txt') && !fs.exists('/home/student/n2.txt'), true);
    eq('move into a dir', await run('move n3.txt garden'), '        1 file(s) moved.\n\n', 0);
    eq('move a dir', await run('move garden\\shed garden\\hut'), '        1 dir(s) moved.\n\n', 0); check('dir moved', fs.isDir('/home/student/garden/hut'), true);
    eq('move missing', await run('move nope.txt x'), 'The system cannot find the file specified.\n\n', 1);
    eq('move wildcard (No to the overwrite)', await run('move garden\\*.t* .'), 'C:\\Users\\student\\garden\\flowers.txt\nC:\\Users\\student\\garden\\n3.txt\nC:\\Users\\student\\garden\\notes.txt\n        2 file(s) moved.\n\n', 0); check('move asked', asked[asked.length - 1], 'Overwrite C:\\Users\\student\\notes.txt? (Yes/No/All): ');
    eq('move many to one file', await run('move *.txt one.txt'), 'Cannot move multiple files to a single file.\n\n', 1);
    eq('ren', await run('ren n3.txt three.txt'), '\n', 0); check('renamed', fs.exists('/home/student/three.txt'), true);
    eq('rename', await run('rename three.txt 3.txt'), '\n', 0);
    eq('ren mask', await run('ren *.txt *.bak'), '\n', 0); check('mask', fs.exists('/home/student/notes.bak') && fs.exists('/home/student/3.bak'), true);
    eq('ren to a path', await run('ren notes.bak garden\\x.txt'), 'The syntax of the command is incorrect.\n\n', 1);
    eq('ren duplicate', await run('ren notes.bak 3.bak'), 'A duplicate file name exists, or the file\ncannot be found.\n\n', 1);
    eq('ren missing', await run('ren nope.txt x.txt'), 'The system cannot find the file specified.\n\n', 1);
    eq('ren case only', await run('ren notes.bak NOTES.bak'), '\n', 0); check('case changed', fs.exists('/home/student/NOTES.bak'), true);
    eq('del', await run('del 3.bak'), '\n'); check('deleted', fs.exists('/home/student/3.bak'), false);
    eq('del missing', await run('del nope.txt'), 'Could Not Find C:\\Users\\student\\nope.txt\n\n');
    eq('del missing: ERRORLEVEL unchanged, || sees it', await run('del nope.txt || echo failed'), 'Could Not Find C:\\Users\\student\\nope.txt\nfailed\n\n');
    eq('del wildcard', await run('del *.bak'), '\n'); check('wildcard deleted', fs.exists('/home/student/NOTES.bak'), false);
    answers.push('n');
    eq('del a folder asks', await run('del garden\\hut'), '\n'); check('del question', asked[asked.length - 1], 'C:\\Users\\student\\garden\\hut\\*, Are you sure (Y/N)? '); check('kept', fs.exists('/home/student/garden/hut/key.txt'), true);
    eq('del /q a folder', await run('del /q garden\\hut'), '\n'); check('files gone, folder kept', fs.isDir('/home/student/garden/hut') && !fs.exists('/home/student/garden/hut/key.txt'), true);
    eq('del /s', (fs.write('/home/student/garden/a.tmp', ''), fs.write('/home/student/b.tmp', ''), await run('del /s *.tmp')).out, 'Deleted file - C:\\Users\\student\\b.tmp\nDeleted file - C:\\Users\\student\\garden\\a.tmp\n\n');
    eq('mkdir', await run('mkdir projects'), '\n', 0);
    eq('md nested', await run('md a\\b\\c'), '\n', 0); check('nested made', fs.isDir('/home/student/a/b/c'), true);
    eq('mkdir exists', await run('mkdir a'), 'A subdirectory or file a already exists.\n\n', 1);
    eq('mkdir several', await run('mkdir x y'), '\n', 0);
    eq('mkdir none', await run('mkdir'), 'The syntax of the command is incorrect.\n\n', 1);
    eq('mkdir bad name', await run('mkdir "a<b"'), 'The filename, directory name, or volume label syntax is incorrect.\n\n', 1);
    eq('rmdir empty', await run('rmdir x'), '\n', 0);
    eq('rd not empty', await run('rd a'), 'The directory is not empty.\n\n', 1);
    eq('rd missing', await run('rd nope'), 'The system cannot find the file specified.\n\n', 1);
    eq('rd a file', await run('rd hello.py'), 'The directory name is invalid.\n\n', 1);
    answers.push('y');
    eq('rd /s asks', await run('rd /s a'), '\n', 0); check('rd question', asked[asked.length - 1], 'a, Are you sure (Y/N)? '); check('tree gone', fs.exists('/home/student/a'), false);
    eq('rd /s /q', await run('rd /s /q y'), '\n', 0);
    eq('rd the current folder', (await run('cd garden'), await run('rd /s /q ..\\garden')).out, 'The process cannot access the file because it is being used by another process.\n\n'); await run('cd ..');
    eq('erase', (fs.write('/home/student/z.txt', ''), await run('erase z.txt')).out, '\n');
  }
  // ---- cmd: redirections, pipes, & && ||, find, findstr, sort, more, where, tree, xcopy
  {
    const { run, fs } = fresh();
    await run('cmd');
    eq('> and >>', (await run('echo one> f.txt'), await run('echo two>> f.txt'), await run('type f.txt')).out, 'one\ntwo\n\n');
    eq('< input', await run('sort < garden\\flowers.txt'), 'roses\ntulips\n\n');
    eq('2> file', (await run('type nope 2> err.txt'), fs.read('/home/student/err.txt')), 'The system cannot find the file specified.\n');
    eq('2>nul', await run('type nope 2>nul'), '\n', 1);
    eq('>nul', await run('type notes.txt >nul'), '\n', 0);
    eq('2>&1 into a pipe', await run('dir nope 2>&1 | find "File"'), 'File Not Found\n\n');
    eq('> into a missing folder', await run('echo x > nope\\f.txt'), 'The system cannot find the path specified.\n\n', 1);
    eq('> onto a folder', await run('echo x > garden'), 'Access is denied.\n\n', 1);
    eq('type nul > file', (await run('type nul > empty.txt'), fs.read('/home/student/empty.txt')), '');
    eq('a line of only a redirection makes the file', (await run('> made.txt'), fs.exists('/home/student/made.txt')), true);
    eq('&', await run('echo a & echo b'), 'a \nb\n\n');
    eq('&&', await run('type nope 2>nul && echo yes'), '\n');
    eq('||', await run('type nope 2>nul || echo no'), 'no\n\n');
    eq('a pipe', await run('type garden\\flowers.txt | sort /r'), 'tulips\nroses\n\n');
    eq('| at the start', await run('| dir'), '| was unexpected at this time.\n\n', 255);
    eq('pipe to nothing', await run('dir |'), 'The syntax of the command is incorrect.\n\n', 1);
    eq('redirection without a file', await run('echo x >'), 'The syntax of the command is incorrect.\n\n', 1);
    eq('find', await run('find "o" notes.txt garden\\flowers.txt'), '\n---------- NOTES.TXT\nhello\n\n---------- GARDEN\\FLOWERS.TXT\nroses\n\n', 0);
    eq('find /c', await run('find /c "o" notes.txt'), '\n---------- NOTES.TXT: 1\n\n');
    eq('find /n /i', await run('find /n /i "TUL" garden\\flowers.txt'), '\n---------- GARDEN\\FLOWERS.TXT\n[2]tulips\n\n');
    eq('find /v', await run('find /v "roses" garden\\flowers.txt'), '\n---------- GARDEN\\FLOWERS.TXT\ntulips\n\n');
    eq('find in a pipe', await run('type garden\\flowers.txt | find "t"'), 'tulips\n\n');
    eq('find /c in a pipe', await run('type garden\\flowers.txt | find /c "s"'), '2\n\n');
    eq('find not found', await run('find "zzz" notes.txt'), '\n---------- NOTES.TXT\n\n', 1);
    eq('find without quotes', await run('find hello notes.txt'), 'FIND: Parameter format not correct\n\n', 2);
    eq('find missing file', await run('find "x" nope.txt'), 'File not found - NOPE.TXT\n\n', 2);
    eq('findstr', await run('findstr o notes.txt'), 'hello\n\n', 0);
    eq('findstr /m names the one file', await run('findstr /m o notes.txt'), 'notes.txt\n\n', 0);
    eq('findstr several words', await run('findstr "roses hello" notes.txt garden\\flowers.txt'), 'notes.txt:hello\ngarden\\flowers.txt:roses\n\n');
    eq('findstr /i /c:', await run('findstr /i /c:"THE KEY" garden\\shed\\key.txt'), 'the key is under the pot\n\n');
    eq('findstr /n /s', await run('findstr /n /s "o" garden\\*.txt'), 'garden\\flowers.txt:1:roses\ngarden\\shed\\key.txt:1:the key is under the pot\n\n');
    eq('findstr regex', await run('findstr "^t.*s$" garden\\flowers.txt'), 'tulips\n\n');
    eq('findstr /v /m', await run('findstr /m "rose" garden\\flowers.txt notes.txt'), 'garden\\flowers.txt\n\n');
    eq('findstr none', await run('findstr zzz notes.txt'), '\n', 1);
    eq('findstr cannot open', await run('findstr x nope.txt'), 'FINDSTR: Cannot open nope.txt\n\n', 2);
    eq('findstr in a pipe', await run('type garden\\flowers.txt | findstr ses'), 'roses\n\n');
    eq('sort', await run('sort garden\\flowers.txt'), 'roses\ntulips\n\n');
    eq('more', await run('more notes.txt'), 'hello\n\n');
    eq('more < file', await run('more < garden\\flowers.txt'), 'roses\ntulips\n\n');
    eq('where', await run('where python'), 'C:\\Windows\\System32\\python.exe\n\n', 0);
    eq('where a file here', await run('where notes.txt'), 'C:\\Users\\student\\notes.txt\n\n', 0);
    eq('where none', await run('where zzz'), 'INFO: Could not find files for the given pattern(s).\n\n', 1);
    eq('tree', await run('tree'), 'Folder PATH listing\nVolume serial number is 6A2F-91C3\nC:.\n└───garden\n    └───shed\n\n');
    eq('tree /f /a', await run('tree /f /a garden'), 'Folder PATH listing\nVolume serial number is 6A2F-91C3\nC:\\USERS\\STUDENT\\GARDEN\n|   flowers.txt\n|   \n\\---shed\n        key.txt\n        \n\n');
    eq('tree, no folders', await run('tree garden\\shed'), 'Folder PATH listing\nVolume serial number is 6A2F-91C3\nC:\\USERS\\STUDENT\\GARDEN\\SHED\nNo subfolders exist \n\n\n');
    eq('xcopy', await run('xcopy garden backup /s /i'), 'garden\\flowers.txt\ngarden\\shed\\key.txt\n2 File(s) copied\n\n', 0); check('xcopy tree', fs.read('/home/student/backup/shed/key.txt'), 'the key is under the pot\n');
  }
  // ---- PowerShell: files and folders
  {
    const { run, fs, answers, asked } = fresh();
    await run('powershell');
    const HEAD = '\n    Directory: C:\\Users\\student\n\n' + FSH;
    eq('Get-ChildItem', await run('Get-ChildItem'), HEAD + row(1, 0, 'garden') + row(0, 12, 'hello.py') + row(0, 6, 'notes.txt') + '\n', 0);
    eq('ls dir gci', (await run('ls')).out === (await run('dir')).out && (await run('gci')).out === (await run('Get-ChildItem')).out, true);
    eq('gci wildcard', await run('gci *.txt'), HEAD + row(0, 6, 'notes.txt') + '\n');
    eq('gci a file', await run('gci notes.txt'), HEAD + row(0, 6, 'notes.txt') + '\n');
    eq('gci a folder', await run('gci garden'), '\n    Directory: C:\\Users\\student\\garden\n\n' + FSH + row(1, 0, 'shed') + row(0, 13, 'flowers.txt') + '\n');
    eq('gci -Name', await run('gci -Name'), 'garden\nhello.py\nnotes.txt\n');
    eq('gci -File -Directory', await run('gci -File -Name; gci -Directory -Name'), 'hello.py\nnotes.txt\ngarden\n');
    eq('gci -Recurse', await run('gci -Recurse'), HEAD + row(1, 0, 'garden') + row(0, 12, 'hello.py') + row(0, 6, 'notes.txt') + '\n    Directory: C:\\Users\\student\\garden\n\n' + FSH + row(1, 0, 'shed') + row(0, 13, 'flowers.txt') + '\n    Directory: C:\\Users\\student\\garden\\shed\n\n' + FSH + row(0, 25, 'key.txt') + '\n');
    eq('gci -Recurse -Name', await run('gci -Recurse -Name'), 'garden\nhello.py\nnotes.txt\ngarden\\shed\ngarden\\flowers.txt\ngarden\\shed\\key.txt\n');
    eq('gci -Recurse -Filter', await run('gci -Recurse -Filter *.txt -Name'), 'notes.txt\ngarden\\flowers.txt\ngarden\\shed\\key.txt\n');
    eq('gci -Exclude', await run('gci -Name -Exclude *.txt'), 'garden\nhello.py\n');
    eq('gci -Rec (a prefix)', await run('gci -Rec -Name -Depth 0'), 'garden\nhello.py\nnotes.txt\n');
    eq('gci missing', await run('gci nope'), "Get-ChildItem: Cannot find path 'C:\\Users\\student\\nope' because it does not exist.\n", 1);
    eq('gci wildcard matching nothing is quiet', await run('gci zz*'), '', 0);
    eq('gci C:\\', await run('gci C:\\ -Name'), 'Temp\nUsers\nWindows\n');
    eq('gci with / separators', await run('gci garden/shed -Name'), 'key.txt\n');
    eq('Get-Location', await run('Get-Location'), '\nPath\n----\nC:\\Users\\student\n\n', 0);
    eq('cd and pwd', (await run('cd garden'), await run('pwd')).out, '\nPath\n----\nC:\\Users\\student\\garden\n\n');
    eq('cd -', (await run('cd -'), await run('(Get-Location).Path')).out, 'C:\\Users\\student\n');
    eq('cd missing', await run('cd nope'), "Set-Location: Cannot find path 'C:\\Users\\student\\nope' because it does not exist.\n", 1);
    eq('cd a file', await run('cd notes.txt'), "Set-Location: Cannot find path 'notes.txt' because it does not exist.\n", 1);
    eq('cd ~ and cd', (await run('cd garden\\shed'), await run('cd ~'), await run('$PWD.Path')).out, 'C:\\Users\\student\n');
    eq('Set-Location -Path', (await run('Set-Location -Path garden'), await run('cd..'), await run('"$PWD"')).out, 'C:\\Users\\student\n');
    eq('Get-Content', await run('Get-Content garden\\flowers.txt'), 'roses\ntulips\n', 0);
    eq('cat type gc', (await run('cat notes.txt; type notes.txt; gc notes.txt')).out, 'hello\nhello\nhello\n');
    eq('-TotalCount -Head -Tail', await run('gc garden\\flowers.txt -TotalCount 1; gc garden\\flowers.txt -Head 1; gc garden\\flowers.txt -Tail 1'), 'roses\nroses\ntulips\n');
    eq('-Raw', await run('Get-Content garden\\flowers.txt -Raw'), 'roses\ntulips\n\n');
    eq('two files', await run('Get-Content notes.txt, garden\\flowers.txt'), 'hello\nroses\ntulips\n');
    eq('wildcards', await run('Get-Content *.txt'), 'hello\n');
    eq('Get-Content missing', await run('Get-Content nope.txt'), "Get-Content: Cannot find path 'C:\\Users\\student\\nope.txt' because it does not exist.\n", 1);
    eq('Get-Content a folder', await run('Get-Content garden'), "Get-Content: Unable to get content because it is a directory: 'C:\\Users\\student\\garden'. Please use 'Get-ChildItem' instead.\n");
    eq('items down the pipe', await run('gci *.txt | Get-Content'), 'hello\n');
    eq('paths down the pipe', await run('"garden", "notes.txt" | Get-Item | ForEach-Object Name; "nope" | Test-Path'), 'garden\nnotes.txt\nFalse\n');
    eq('strings down the pipe', await run('"a" | Get-Content'), 'Get-Content: The input object cannot be bound to any parameters for the command either because the command does not take pipeline input or the input and its properties do not match any of the parameters that take pipeline input.\n');
    eq('Set-Content Add-Content', (await run('Set-Content s.txt "line one"; Add-Content s.txt "line two"'), await run('Get-Content s.txt')).out, 'line one\nline two\n');
    check('written with \\n', fs.read('/home/student/s.txt'), 'line one\nline two\n');
    eq('Out-File', (await run('"x" | Out-File o.txt'), fs.read('/home/student/o.txt')), 'x\n');
    eq('> >>', (await run('"hi" > r.txt; "more" >> r.txt'), fs.read('/home/student/r.txt')), 'hi\nmore\n');
    eq('a table into a file', (await run('Get-ChildItem garden > list.txt'), fs.read('/home/student/list.txt')), '\n    Directory: C:\\Users\\student\\garden\n\n' + FSH + row(1, 0, 'shed') + row(0, 13, 'flowers.txt') + '\n');
    eq('> to a missing folder', await run('"x" > nope\\f.txt'), "Out-File: Could not find a part of the path 'C:\\Users\\student\\nope\\f.txt'.\n", 1);
    eq('New-Item directory', await run('New-Item -ItemType Directory box'), HEAD + row(1, 0, 'box') + '\n', 0);
    eq('New-Item file with a value', await run('New-Item -Path box -Name a.txt -ItemType File -Value hi'), '\n    Directory: C:\\Users\\student\\box\n\n' + FSH + row(0, 2, 'a.txt') + '\n'); check('value written', fs.read('/home/student/box/a.txt'), 'hi');
    eq('New-Item exists (dir)', await run('New-Item -ItemType Directory box'), 'New-Item: An item with the specified name C:\\Users\\student\\box already exists.\n', 1);
    eq('New-Item exists (file)', await run('New-Item notes.txt'), "New-Item: The file 'C:\\Users\\student\\notes.txt' already exists.\n", 1);
    eq('New-Item bad type', await run('New-Item -ItemType Folder zz'), 'New-Item: The type is not a known type for the file system. Only "file","directory" or "symboliclink" can be specified.\n', 1);
    eq('New-Item -Type dir (a prefix)', (await run('ni -Type dir zz | Out-Null'), fs.isDir('/home/student/zz')), true);
    eq('New-Item no parent', await run('New-Item nope\\x.txt'), "New-Item: Could not find a part of the path 'C:\\Users\\student\\nope\\x.txt'.\n", 1);
    eq('mkdir', await run('mkdir b2'), HEAD + row(1, 0, 'b2') + '\n');
    eq('mkdir nested', (await run('mkdir p\\q\\r | Out-Null'), fs.isDir('/home/student/p/q/r')), true);
    eq('mkdir exists', await run('mkdir b2'), 'New-Item: An item with the specified name C:\\Users\\student\\b2 already exists.\n', 1);
    eq('md', (await run('md m1 | Out-Null'), fs.isDir('/home/student/m1')), true);
    eq('Copy-Item', (await run('Copy-Item notes.txt n2.txt'), fs.read('/home/student/n2.txt')), 'hello\n');
    eq('cp into a folder', (await run('cp notes.txt box'), fs.read('/home/student/box/notes.txt')), 'hello\n');
    eq('copy a folder without -Recurse', (await run('copy garden g2'), fs.isDir('/home/student/g2') && !fs.exists('/home/student/g2/flowers.txt')), true);
    eq('copy -Recurse', (await run('copy garden g3 -Recurse'), fs.read('/home/student/g3/shed/key.txt')), 'the key is under the pot\n');
    eq('copy onto itself', await run('Copy-Item notes.txt notes.txt'), 'Copy-Item: Cannot overwrite the item C:\\Users\\student\\notes.txt with itself.\n', 1);
    eq('copy missing', await run('Copy-Item nope.txt x'), "Copy-Item: Cannot find path 'C:\\Users\\student\\nope.txt' because it does not exist.\n", 1);
    eq('Move-Item', (await run('Move-Item n2.txt n3.txt'), fs.exists('/home/student/n3.txt')), true);
    eq('mv onto a file', await run('mv n3.txt notes.txt'), 'Move-Item: Cannot create a file when that file already exists.\n', 1);
    eq('mv into a folder', (await run('mv n3.txt box'), fs.exists('/home/student/box/n3.txt')), true);
    eq('Rename-Item', (await run('Rename-Item box\\n3.txt three.txt'), fs.exists('/home/student/box/three.txt')), true);
    eq('ren to an existing name', await run('ren box\\three.txt a.txt'), 'Rename-Item: Cannot create a file when that file already exists.\n', 1);
    eq('ren into another folder', await run('ren box\\three.txt garden\\x.txt'), 'Rename-Item: Cannot rename the specified target, because it represents a path or device name.\n', 1);
    eq('Remove-Item a file', (await run('Remove-Item box\\three.txt'), fs.exists('/home/student/box/three.txt')), false);
    eq('rm missing', await run('rm nope.txt'), "Remove-Item: Cannot find path 'C:\\Users\\student\\nope.txt' because it does not exist.\n", 1);
    answers.push('n');
    eq('Remove-Item asks', await run('Remove-Item box'), '\nConfirm\nThe item at C:\\Users\\student\\box has children and the Recurse parameter was not specified. If you continue, all \nchildren will be removed with the item. Are you sure you want to continue?\n');
    check('the Confirm line', asked[asked.length - 1], '[Y] Yes  [A] Yes to All  [N] No  [L] No to All  [S] Suspend  [?] Help (default is "Y"): '); check('kept after N', fs.isDir('/home/student/box'), true);
    answers.push('');
    eq('Enter means Yes', (await run('Remove-Item box'), fs.exists('/home/student/box')), false);
    eq('rm -Recurse', (await run('rm g3 -Recurse'), fs.exists('/home/student/g3')), false);
    eq('rm the current folder', (await run('cd garden'), await run('rm ..\\garden -Recurse')).out, "Remove-Item: Cannot remove the item at 'C:\\Users\\student\\garden' because it is in use.\n"); await run('cd ..');
    eq('rm in C:\\Windows', await run('rm C:\\Windows\\System32\\cmd.exe'), "Remove-Item: Access to the path 'C:\\Windows\\System32\\cmd.exe' is denied.\n", 1);
    eq('rm -WhatIf', await run('rm notes.txt -WhatIf'), 'What if: Performing the operation "Remove File" on target "C:\\Users\\student\\notes.txt".\n');
    eq('Test-Path', await run('Test-Path notes.txt; Test-Path nope; Test-Path garden -PathType Leaf; Test-Path *.py'), 'True\nFalse\nFalse\nTrue\n');
  }
  {
    const { run, fs } = fresh({ ask: false });
    await run('pwsh');
    eq('Remove-Item with no keyboard', await run('Remove-Item garden'), 'Remove-Item: PowerShell is in NonInteractive mode. Read and Prompt functionality is not available.\n', 1); check('still there', fs.isDir('/home/student/garden'), true);
    eq('missing mandatory, no keyboard', await run('Get-Content'), 'Get-Content: Cannot process command because of one or more missing mandatory parameters: Path.\n', 1);
    eq('an unfinished line, no keyboard', await run('"abc'), 'ParserError: \nLine |\n   1 |  "abc\n     |  ~~~~\n     | The string is missing the terminator: ".\n', 1);
  }
  // ---- PowerShell: pipelines, objects and formats
  {
    const { run, fs, answers, ran } = fresh();
    await run('pwsh');
    eq('Measure-Object', await run('Get-ChildItem *.txt | Measure-Object'), '\nCount             : 1\nAverage           : \nSum               : \nMaximum           : \nMinimum           : \nStandardDeviation : \nProperty          : \n\n', 0);
    eq('measure -Sum -Maximum', await run('Get-ChildItem -File | Measure-Object -Property Length -Sum -Maximum'), '\nCount             : 2\nAverage           : \nSum               : 18\nMaximum           : 12\nMinimum           : \nStandardDeviation : \nProperty          : Length\n\n');
    eq('measure -Average skips folders', await run('Get-ChildItem | Measure-Object Length -Average'), '\nCount             : 2\nAverage           : 9\nSum               : \nMaximum           : \nMinimum           : \nStandardDeviation : \nProperty          : Length\n\n');
    eq('measure -Line -Word -Character', await run('Get-Content notes.txt, hello.py | Measure-Object -Line -Word -Character'), '\nLines Words Characters Property\n----- ----- ---------- --------\n    2     2         16 \n\n');
    eq('measure -Character', await run('"hello" | Measure-Object -Character'), '\nLines Words Characters Property\n----- ----- ---------- --------\n                     5 \n\n');
    eq('(...).Count', await run('(Get-ChildItem).Count'), '3\n');
    eq('Select-String in a file', await run('Select-String hello notes.txt'), '\nnotes.txt:1:hello\n\n', 0);
    eq('sls -Path wildcards', await run('Select-String -Pattern o -Path *.txt, garden\\*.txt'), '\nnotes.txt:1:hello\ngarden\\flowers.txt:1:roses\n\n');
    eq('sls on strings', await run('"one","two" | Select-String o'), '\none\ntwo\n\n');
    eq('sls on lines', await run('Get-Content garden\\flowers.txt | sls tul'), '\ntulips\n\n');
    eq('sls on items', await run('Get-ChildItem | Select-String hello'), '\nnotes.txt:1:hello\n\n');
    eq('sls case', await run('Select-String ROSE garden\\flowers.txt; Select-String ROSE garden\\flowers.txt -CaseSensitive'), '\ngarden\\flowers.txt:1:roses\n\n');
    eq('sls -NotMatch', await run('Select-String r garden\\flowers.txt -NotMatch'), '\ngarden\\flowers.txt:2:tulips\n\n');
    eq('sls -SimpleMatch', await run('Select-String . garden\\flowers.txt -SimpleMatch'), '', 0);
    eq('sls from another folder', (await run('cd garden'), await run('sls key ..\\garden\\shed\\key.txt')).out, '\nshed\\key.txt:1:the key is under the pot\n\n'); await run('cd ..');
    eq('sls missing', await run('Select-String x nope.txt'), "Select-String: Cannot find path 'C:\\Users\\student\\nope.txt' because it does not exist.\n");
    eq('Sort-Object', await run('"b","a","B","A" | Sort-Object'), 'a\nA\nb\nB\n');
    eq('sort -Unique', await run('"b","a","b" | sort -Unique'), 'a\nb\n');
    eq('sort -Descending', await run('3,1,2 | Sort-Object -Descending'), '3\n2\n1\n');
    eq('sort by Length', await run('Get-ChildItem | Sort-Object Length -Descending'), '\n    Directory: C:\\Users\\student\n\n' + FSH + row(0, 12, 'hello.py') + row(0, 6, 'notes.txt') + row(1, 0, 'garden') + '\n');
    eq('Select-Object table', await run('Get-ChildItem | Select-Object Name, Length'), '\nName      Length\n----      ------\ngarden    \nhello.py  12\nnotes.txt 6\n\n');
    eq('Select-Object numbers right', await run('Get-ChildItem -File | Select-Object Length, Name'), '\nLength Name\n------ ----\n    12 hello.py\n     6 notes.txt\n\n');
    eq('Select-Object list (5 properties)', await run('Get-Item notes.txt | Select-Object Name, Length, Mode, LastWriteTime, Extension'), '\nName          : notes.txt\nLength        : 6\nMode          : -a---\nLastWriteTime : 10/5/2026 9:00:00 AM\nExtension     : .txt\n\n');
    eq('-First -Last', await run('1..5 | Select-Object -First 2; 1..5 | select -Last 1'), '1\n2\n5\n');
    eq('-ExpandProperty', await run('Get-ChildItem -File | Select-Object -ExpandProperty Name'), 'hello.py\nnotes.txt\n');
    eq('calculated property', await run('Get-ChildItem -File | Select-Object Name, @{Name="KB"; Expression={$_.Length * 2}}'), '\nName      KB\n----      --\nhello.py  24\nnotes.txt 12\n\n');
    eq('Where-Object simple', await run('Get-ChildItem | Where-Object Length -gt 7'), '\n    Directory: C:\\Users\\student\n\n' + FSH + row(0, 12, 'hello.py') + '\n');
    eq('Where-Object -like', await run('Get-ChildItem | Where-Object Name -like "*.txt" | ForEach-Object Name'), 'notes.txt\n');
    eq('? { }', await run('Get-ChildItem | ? { $_.Name -match "^h" } | % { $_.Name }'), 'hello.py\n');
    eq('Where-Object on strings', await run('"apple","pear" | Where-Object { $_.Length -gt 4 }'), 'apple\n');
    eq('ForEach-Object text', await run('Get-ChildItem -File | ForEach-Object { $_.Name + " " + $_.Length }'), 'hello.py 12\nnotes.txt 6\n');
    eq('foreach a method', await run('"a","b" | foreach ToUpper'), 'A\nB\n');
    eq('ForEach-Object -Begin -End', await run('1..3 | ForEach-Object -Begin { $t = 0 } -Process { $t += $_ } -End { $t }'), '6\n');
    eq('Format-Table -Property', await run('Get-ChildItem | Format-Table Name, Length'), '\nName      Length\n----      ------\ngarden    \nhello.py  12\nnotes.txt 6\n\n');
    eq('fl -Property', await run('Get-ChildItem -File | fl Name, Length'), '\nName   : hello.py\nLength : 12\n\nName   : notes.txt\nLength : 6\n\n');
    eq('Format-List of a file', await run('Get-Item notes.txt | Format-List'), '\n    Directory: C:\\Users\\student\n\nName           : notes.txt\nLength         : 6\nCreationTime   : 10/5/2026 9:00:00 AM\nLastWriteTime  : 10/5/2026 9:00:00 AM\nLastAccessTime : 10/5/2026 9:00:00 AM\nMode           : -a---\nLinkType       : \nTarget         : \nVersionInfo    : File:             C:\\Users\\student\\notes.txt\n                 InternalName:     \n                 OriginalFilename: \n                 FileVersion:      \n                 FileDescription:  \n                 Product:          \n                 ProductVersion:   \n                 Debug:            False\n                 Patched:          False\n                 PreRelease:       False\n                 PrivateBuild:     False\n                 SpecialBuild:     False\n                 Language:         \n                 \n\n');
    eq('Write-Output', await run('Write-Output a b c; echo d'), 'a\nb\nc\nd\n');
    eq('Write-Host', await run('Write-Host hi there; Write-Host -NoNewline x; Write-Host y'), 'hi there\nxy\n');
    eq('Write-Host > goes to the screen', (await run('Write-Host shown > nothing.txt')).out, 'shown\n'); check('file empty', fs.read('/home/student/nothing.txt'), '');
    eq('Get-Command', await run('Get-Command Get-ChildItem, dir, mkdir, Where-Object, python'), '\nCommandType     Name                                               Version    Source\n-----------     ----                                               -------    ------\nCmdlet          Get-ChildItem                                      7.0.0.0    Microsoft.PowerShell.Management\nAlias           dir -> Get-ChildItem                                          \nFunction        mkdir                                                         \nCmdlet          Where-Object                                       7.4.6.500  Microsoft.PowerShell.Core\nApplication     python.exe                                         10.0.2263… C:\\Windows\\system32\\python.exe\n\n');
    eq('Get-Command missing', await run('Get-Command xyz'), "Get-Command: The term 'xyz' is not recognized as a name of a cmdlet, function, script file, or executable program.\nCheck the spelling of the name, or if a path was included, verify that the path is correct and try again.\n", 1);
    eq('Get-Alias', await run('Get-Alias -Definition Get-ChildItem'), '\nCommandType     Name                                               Version    Source\n-----------     ----                                               -------    ------\nAlias           dir -> Get-ChildItem                                          \nAlias           gci -> Get-ChildItem                                          \nAlias           ls -> Get-ChildItem                                           \n\n');
    eq('Get-Help', /^\nNAME\n    Get-Location\n\nSYNTAX\n    Get-Location  \[<CommonParameters>\]\n\n\nALIASES\n    gl\n    pwd\n/.test((await run('Get-Help pwd')).out), true);
    eq('Get-Date', await run('Get-Date'), '\nMonday, October 5, 2026 9:00:00 AM\n\n');
    eq('Get-Date -Format', await run('Get-Date -Format "yyyy-MM-dd HH:mm"'), '2026-10-05 09:00\n');
    eq('$PSVersionTable.PSVersion', await run('$PSVersionTable.PSVersion'), '\nMajor  Minor  Patch  PreReleaseLabel BuildLabel\n-----  -----  -----  --------------- ----------\n7      4      6                      \n\n');
    eq('hashtable', await run('@{a=1; b="two"}'), '\nName                           Value\n----                           -----\na                              1\nb                              two\n\n');
    // the language
    eq('variables', await run('$x = "world"; "hello $x"; \'hello $x\'; "$($x.Length) letters"'), 'hello world\nhello $x\n5 letters\n');
    eq('numbers', await run('1+2; 10/3; 7/2; 6/2; 2.50; 1e3; 0.1+0.2; 7 % 3; -5'), '3\n3.33333333333333\n3.5\n3\n2.5\n1000\n0.3\n1\n-5\n');
    eq('strings and arrays', await run('"x" * 3; $a = 1,2,3; $a.Count; $a[0]; $a[-1]; ($a + 4).Count; 1..4 -join ","'), 'xxx\n3\n1\n3\n4\n1,2,3,4\n');
    eq('comparisons', await run('"a" -eq "A"; "a" -ceq "A"; 5 -gt "10"; "5" -gt 10; 1,2,3 -contains 2; 3 -in 1,2; "one" -like "o*"'), 'True\nFalse\nFalse\nTrue\nTrue\nFalse\nTrue\n');
    eq('operators', await run('"a,b,c" -split ","; "x","y" -join "+"; "hello" -replace "l","L"; "Name: {0}, n={1:N2}" -f "a", 5'), 'a\nb\nc\nx+y\nheLLo\nName: a, n=5.00\n');
    eq('-match and $Matches', await run('"apple" -match "p+"; $Matches[0]'), 'True\npp\n');
    eq('methods', await run('"Hi".ToUpper(); "Hi".Length; " x ".Trim(); "a.b".Replace(".", "-"); "hello".Substring(1, 3); "a,b".Split(",")'), 'HI\n2\nx\na-b\nell\na\nb\n');
    eq('casts', await run('[int]"42" + 1; [int]2.5; [string]5 + 5; [math]::Round(2.567, 1); [math]::Max(3, 9)'), '43\n2\n55\n2.6\n9\n');
    eq('if / elseif / else', await run('$n = 5; if ($n -gt 9) { "big" } elseif ($n -gt 3) { "middle" } else { "small" }'), 'middle\n');
    eq('foreach', await run('foreach ($i in 1..3) { "n$i" }'), 'n1\nn2\nn3\n');
    eq('while and $i++', await run('$i = 0; while ($i -lt 3) { $i++ ; $i }'), '1\n2\n3\n');
    eq('for', await run('for ($i = 0; $i -lt 3; $i += 1) { $i }'), '0\n1\n2\n');
    eq('functions', await run('function Square($n) { $n * $n }; Square 7'), '49\n');
    eq('member of every item', await run('(Get-ChildItem garden -Recurse -File).Name'), 'flowers.txt\nkey.txt\n');
    eq('item properties', await run('$f = Get-Item notes.txt; $f.Name; $f.Length; $f.Extension; $f.BaseName; $f.FullName; $f.DirectoryName; "$f"'), 'notes.txt\n6\n.txt\nnotes\nC:\\Users\\student\\notes.txt\nC:\\Users\\student\nC:\\Users\\student\\notes.txt\n');
    eq('$HOME $env:USERNAME', await run('$HOME; $env:USERNAME; $env:nope'), 'C:\\Users\\student\nstudent\n');
    eq('$? after an error', await run('Get-Content nope -ErrorAction SilentlyContinue; $?'), 'False\n');
    eq('$? after an assignment that failed', await run('$x = Get-Content nope 2>$null; $?'), 'False\n');
    eq('$? not changed by errors inside ForEach-Object', await run('1..2 | ForEach-Object { Get-Content nope 2>$null }; $?'), 'True\n');
    eq('&& ||', await run('Get-Content nope 2>$null && "yes"; Get-Content nope 2>$null || "no"'), 'no\n');
    eq('2>&1', await run('Get-Content nope 2>&1 | ForEach-Object { "got: $_" }'), "got: Get-Content: Cannot find path 'C:\\Users\\student\\nope' because it does not exist.\n");
    eq('2> file', (await run('Get-Content nope 2> e.txt'), fs.read('/home/student/e.txt')), "Get-Content: Cannot find path 'C:\\Users\\student\\nope' because it does not exist.\n");
    eq('> $null', await run('"x" > $null; "y"'), 'y\n');
    eq('Out-Null', await run('mkdir q1 | Out-Null'), '', 0);
    eq('Out-String', await run('(Get-Location | Out-String).Length'), '29\n');
    // errors
    eq('unknown command', await run('xyz'), "xyz: The term 'xyz' is not recognized as a name of a cmdlet, function, script file, or executable program.\nCheck the spelling of the name, or if a path was included, verify that the path is correct and try again.\n", 1);
    eq('a program in this folder', await run('hello.py'), 'hello.py: The term \'hello.py\' is not recognized as a name of a cmdlet, function, script file, or executable program.\nCheck the spelling of the name, or if a path was included, verify that the path is correct and try again.\n\nSuggestion [3,General]: The command "hello.py" was not found, but does exist in the current location. PowerShell does not load commands from the current location by default. If you trust this command, instead type: ".\\hello.py". See "get-help about_Command_Precedence" for more details.\n');
    eq('.\\hello.py', await run('.\\hello.py'), 'ran python\n', 0);
    eq('python', await run('python hello.py one'), 'ran python one\n', 0);
    eq('python output into the pipeline', await run('python hello.py | Select-String ran'), '\nran python\n\n');
    eq('a failing program', (fs.write('/home/student/b.py', 'boom'), await run('python b.py; $?; $LASTEXITCODE')).out, 'ran python\nError: boom\nFalse\n1\n');
    eq('cmd /c from PowerShell', await run('cmd /c dir /b garden | Measure-Object -Line'), '\nLines Words Characters Property\n----- ----- ---------- --------\n    2                  \n\n');
    eq('bad parameter', await run('Get-ChildItem -Bogus'), "Get-ChildItem: A parameter cannot be found that matches parameter name 'Bogus'.\n", 1);
    eq('ambiguous parameter', await run('Get-Content notes.txt -T 1'), 'Get-Content: Parameter cannot be processed because the parameter name \'T\' is ambiguous. Possible matches include: -TotalCount -Tail.\n', 1);
    eq('missing argument', await run('Get-Content -TotalCount'), "Get-Content: Missing an argument for parameter 'TotalCount'. Specify a parameter of type 'System.Int64' and try again.\n", 1);
    eq('extra argument', await run('Get-Location here'), "Get-Location: A positional parameter cannot be found that accepts argument 'here'.\n", 1);
    eq('bad number', await run('Get-Content notes.txt -TotalCount x'), 'Get-Content: Cannot bind parameter \'TotalCount\'. Cannot convert value "x" to type "System.Int64". Error: "The input string \'x\' was not in a correct format."\n', 1);
    eq('1 + "a"', await run('1 + "a"'), 'InvalidArgument: Cannot convert value "a" to type "System.Int32". Error: "The input string \'a\' was not in a correct format."\n', 1);
    eq('divide by zero', await run('1/0'), 'RuntimeException: Attempted to divide by zero.\n', 1);
    eq('a method on $null', await run('$nothing.Trim()'), 'InvalidOperation: You cannot call a method on a null-valued expression.\n', 1);
    eq('no such method', await run('"x".Fly()'), "InvalidOperation: Method invocation failed because [System.String] does not contain a method named 'Fly'.\n", 1);
    eq('an expression after |', await run('"x" | "y"'), 'ParserError: \nLine |\n   1 |  "x" | "y"\n     |        ~~~\n     | Expressions are only allowed as the first element of a pipeline.\n', 1);
    eq('next statement still runs', await run('Get-Content nope; "after"'), "Get-Content: Cannot find path 'C:\\Users\\student\\nope' because it does not exist.\nafter\n");
    eq('Get-Process is not here', await run('Get-Process'), 'Get-Process: Get-Process is not available in this practice PowerShell (it works only with files and text).\n', 1);
    // asking
    answers.push('def"');
    eq('continuation lines', await run('"abc'), 'abc\ndef\n', 0);
    answers.push('notes.txt', '');
    eq('mandatory parameter prompt', await run('Get-Content'), '\ncmdlet Get-Content at command pipeline position 1\nSupply values for the following parameters:\nhello\n', 0);
    check('python ran with the right source', ran.some((r) => r.src === 'print("hi")\n'), true);
  }
  // ---- the grader: {cmd} runs in bash; cwd follows the dialects' cd
  {
    const { sh, run } = fresh();
    await run('cmd'); await run('cd garden');
    const r = await SG.grade({ tests: [{ cmd: 'ls', expect: 'garden\nhello.py\nnotes.txt' }, { cwd: '~/garden' }, { ran: /^cd garden$/, name: 'cd' }] }, sh);
    check('grader passes with cmd active', r.passed, true);
    check('still in cmd afterwards', sh.prompt(), 'C:\\Users\\student\\garden>');
    check('history untouched', sh.history.join('|'), 'cmd|cd garden');
    await run('powershell');
    const r2 = await SG.grade({ tests: [{ cmd: 'pwd', expect: '/home/student' }, { cmd: 'cmd /c cd', expect: 'C:\\Users\\student' }] }, sh);
    check('grader in bash under PowerShell', r2.passed, true);
    check('still PowerShell', sh.prompt(), 'PS C:\\Users\\student\\garden> ');
    const r3 = await SG.grade({ tests: [{ cmd: 'cmd', expect: 'Microsoft Windows [Version 10.0.22631.4317]\n(c) Microsoft Corporation. All rights reserved.' }] }, sh);
    check('a cmd in a check ends with it', r3.passed && sh.dialect.length === 2, true);
  }
  // ---- Tab completion
  {
    const { sh, run } = fresh();
    check('bash knows cmd', sh.complete('cm').items.includes('cmd '), true);
    check('bash knows powershell', sh.complete('powers').items.join(','), 'powershell ,powershell.exe ');
    await run('cmd');
    check('cmd commands', sh.complete('fi').display.join(','), 'find,findstr');
    check('cmd paths with \\', sh.complete('type garden\\f').items.join(','), 'garden\\flowers.txt');
    check('cmd folders end in \\', sh.complete('cd gar').items.join(','), 'garden\\');
    check('any case', sh.complete('type GAR').items.join(','), 'garden\\');
    check('cd only folders', sh.complete('cd ').display.join(','), 'garden\\');
    await run('pwsh');
    check('cmdlets', sh.complete('Get-Ch').items.join(','), 'Get-ChildItem ');
    check('parameters', sh.complete('Get-ChildItem -Rec').items.join(','), '-Recurse ');
    check('parameters of an alias', sh.complete('ls -Fi').display.join(','), '-Filter,-File');
    check('ps paths', sh.complete('Get-Content garden/sh').items.join(','), 'garden/shed\\');
    const fs2 = fresh(); fs2.fs.mkdir('/home/student/my stuff'); await fs2.run('cmd');
    check('names with spaces are quoted', fs2.sh.complete('cd my').items.join(','), '"my stuff\\');
  }
  // ---- a lesson's listing: the prompt before each line
  {
    check('listing prompts', JSON.stringify(WIN.listingPrompts(['ls', 'cmd', 'cd garden', 'dir', 'cd ..\\garden\\shed', 'cd \\', 'exit', 'powershell', 'Get-ChildItem', 'cd garden', 'cd ..', 'cmd', 'exit', 'Set-Location garden', 'cd ~', 'exit', 'pwd'])),
      JSON.stringify(['$', '$', 'C:\\Users\\student>', 'C:\\Users\\student\\garden>', 'C:\\Users\\student\\garden>', 'C:\\Users\\student\\garden\\shed>', 'C:\\>', '$', 'PS C:\\>', 'PS C:\\>', 'PS C:\\garden>', 'PS C:\\>', 'C:\\>', 'PS C:\\>', 'PS C:\\garden>', 'PS C:\\Users\\student>', '$']));
    check('bash cd then cmd', JSON.stringify(WIN.listingPrompts(['cd garden', 'cmd', 'dir', 'cmd /c dir', 'exit'])), JSON.stringify(['$', '$', 'C:\\Users\\student\\garden>', 'C:\\Users\\student\\garden>', 'C:\\Users\\student\\garden>']));
    check('cd /d and cd..', JSON.stringify(WIN.listingPrompts(['cmd', 'cd /d C:\\Temp', 'cd..', 'pwsh', 'cd..', 'cd\\'])), JSON.stringify(['$', 'C:\\Users\\student>', 'C:\\Temp>', 'C:\\>', 'PS C:\\>', 'PS C:\\>']));
  }
  // ---- limits and hostile input
  {
    const { run, sh, fs } = fresh();
    await run('cmd');
    eq('__proto__ as a variable', (await run('set __proto__=1'), await run('echo %__proto__%')).out, '1\n\n');
    eq('__proto__ as a file name', (await run('echo x> __proto__'), await run('type __proto__')).out, 'x\n\n');
    eq('constructor too', await run('echo %constructor% %toString%'), '%constructor% %toString%\n\n');
    eq('huge %expansion% stops', (await run('set a=' + 'x'.repeat(30000)), await run('echo %a%%a%%a%%a%%a%%a%%a%%a%%a%%a%%a%')), 'cmd: stopped: the command produced more output than this terminal keeps.\n\n', 1);
    let deep = 'echo deep'; for (let i = 0; i < 40; i++) deep = 'cmd /c ' + deep;
    eq('cmd /c inside cmd /c, 40 deep', /stopped: shells started inside each other too deeply/.test((await run(deep)).out), true);
    await run('exit');
    let nested = 0; for (let i = 0; i < 30; i++) { const r = await run(i % 2 ? 'cmd' : 'pwsh'); if (/too deeply/.test(r.out)) break; nested++; }
    check('interactive nesting stops at 16', sh.dialect.length, 16);
    for (let i = 0; i < 30 && sh.dialect.length; i++) await run('exit');
    check('all the way back', sh.prompt(), 'student@lab:~$ ');
    await run('pwsh');
    eq('$__proto__', await run('$__proto__ = 5; $__proto__; $env:__proto__ = "x"; $env:__proto__; $constructor'), '5\nx\n');
    eq('function __proto__', await run('function __proto__ { "ok" }; __proto__'), 'ok\n');
    eq('hashtable key __proto__', await run('$h = @{}; $h.__proto__ = 1; $h["__proto__"]; $h.Count'), '1\n1\n');
    eq('a loop that never ends', /PowerShell: stopped: this line ran too long \(more than 200000 steps\)/.test((await run('while ($true) { }')).out), true);
    eq('too much output', /PowerShell: stopped: the command produced more output than this terminal keeps\./.test((await run('while ($true) { "x" * 1000 }')).out), true);
    eq('a huge range', await run('1..1000000 | Measure-Object'), 'PowerShell: stopped: more than 100000 values in one list here.\n', 1);
    eq('a huge string', await run('$s = "x" * 100000000'), 'PowerShell: stopped: a value here grew past 1024000 characters.\n', 1);
    eq('a growing array', /stopped: (more than 100000 values|this line ran too long)/.test((await run('$a = @(); while ($true) { $a += 1 }')).out), true);
    eq('recursion', await run('function f { f }; f'), 'ScriptCallDepthException: The script failed due to call depth overflow.\n', 1);
    eq('a file past the cap', /There is not enough space on the disk\./.test((await run('Set-Content big.txt ("x" * 300000)')).out), true);
    check('no big file', fs.exists('/home/student/big.txt') ? fs.read('/home/student/big.txt').length : 0, 0);
    eq('climbing out', await run('Get-Content ..\\..\\..\\..\\etc\\passwd'), "Get-Content: Cannot find path 'C:\\etc\\passwd' because it does not exist.\n", 1);
    eq('no Unix paths from Windows', await run('Get-Content /etc/passwd'), "Get-Content: Cannot find path 'C:\\etc\\passwd' because it does not exist.\n", 1);
    eq('C:\\Windows is read-only', await run('"x" > C:\\Windows\\x.txt'), "Out-File: Access to the path 'C:\\Windows\\x.txt' is denied.\n", 1);
    eq('bad names', /The filename, directory name, or volume label syntax is incorrect\./.test((await run('New-Item "a|b.txt"')).out), true);
    // Ctrl+C while a program asks
    const p = fresh(); await p.run('pwsh');
    const pending = p.sh.exec('Remove-Item garden', { out: () => { }, err: () => { }, tty: true, ask: () => { p.sh.cancel(); return Promise.resolve(null); } });
    check('Ctrl+C at a prompt', await pending, 130); check('nothing removed', p.fs.isDir('/home/student/garden'), true);
    // a hostile saved file system still loads; the Windows view of it is checked like the rest
    const f2 = SHELL.makeFS({ v: 1, cwd: '/home/student', root: { t: 'd', c: [['home', { t: 'd', c: [['student', { t: 'd', c: [['__proto__', { t: 'f', d: 'p' }], ['CON', { t: 'f', d: 'c' }]] }]] }]] } });
    const s2 = SHELL.makeShell({ fs: f2 }); let o2 = ''; await s2.exec('cmd /c dir /b', { out: (s) => { o2 += s; }, err: (s) => { o2 += s; } });
    check('hostile names listed as text', o2, 'CON\n__proto__\n');
  }

  console.log(bad ? bad + ' of ' + n + ' Windows shell test(s) failed' : 'Windows shell tests passed (' + n + ' checks)');
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.log(e.stack); process.exit(1); });
