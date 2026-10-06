/* The Windows Command Prompt and PowerShell in the practice terminal (shell.js): a dialect switch over the same file system.

   cmd (cmd.exe) at the bash prompt starts the Command Prompt of Windows 11 (cmd.exe 10.0.22631), powershell / pwsh starts PowerShell 7.4.6;
   exit goes back to the shell that started it (they nest: cmd inside PowerShell inside cmd...). While one is active, sh.exec hands each line
   to it (sh.dialect, a stack: shell.js only looks at its top in exec, prompt and complete). History is the shell's own.

   One file system, seen through Windows paths: C:\ is the root of the Unix tree, but shows only
       C:\Users   = /home          (so C:\Users\student is the bash home, ~)
       C:\Temp    = /tmp
       C:\Windows   a small read-only folder made here (System32 holds a 0-byte stand-in for each program these shells run)
   and nothing else (/bin, /etc, /usr and /dev are not visible from Windows). Names are found without regard to case when exactly one entry
   matches (an exact match wins); \ and / both separate (output always uses \); a new file keeps the case it was typed with. The working
   directory is fs.cwd, shared by every dialect and by bash (a cd in cmd is still there after exit), except inside C:\Windows, where fs.cwd is /
   and the Windows part is remembered beside it. Everything is written through the file system's own methods, so its caps and checks hold.
   Files are written with \n line ends (Windows would write \r\n): bash sees the same text.

   Fidelity: cmd's messages and formats are Windows 10/11's as remembered (no cmd.exe could be run here); PowerShell's were compared with a real
   pwsh 7.4.6 (Linux build, en-US, width 120) and adapted to Windows (paths, Mode strings, directories before files). See test_win.js.
   No eval, no new Function, no DOM: this file runs in the page and in node. Anything keyed by user text is a null-prototype dictionary. */
(function (factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./shell.js'));
  else window.SHELLWIN = factory(window.SHELL);
})(function (SHELL) {
  'use strict';
  const dict = () => Object.create(null);
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const LIMITS = SHELL.LIMITS, FsError = SHELL.FsError, HOME = SHELL.HOME, USER = SHELL.USER, HOST = SHELL.HOST;
  const WIN_VER = '10.0.22631.4317', PS_VER = '7.4.6', SERIAL = '6A2F-91C3', WIDTH = 120;
  const MAX_NEST = 16;              // shells inside shells (real Windows has no small limit; this one stops a runaway)
  const PS_STEPS = 200000;          // statements, loop turns and script-block calls in one PowerShell line
  const MAX_ITEMS = 100000;         // values in one array or pipeline
  const CMD_BANNER = 'Microsoft Windows [Version ' + WIN_VER + ']\n(c) Microsoft Corporation. All rights reserved.\n';
  const PS_BANNER = 'PowerShell ' + PS_VER + '\n';
  function WinStop(kind, code) { this.kind = kind; this.code = code; }
  // shell.js throws its own Stop (cancel, steps, output) out of the commands it runs for us: it looks like this
  const isStop = (e) => e instanceof WinStop || (!!e && typeof e === 'object' && typeof e.kind === 'string' && typeof e.code === 'number' && !(e instanceof Error));

  /* ---------------- small helpers ---------------- */
  const two = (n) => String(n).padStart(2, '0');
  const commas = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const h12 = (d) => d.getHours() % 12 || 12;
  const ampm = (d) => (d.getHours() < 12 ? 'AM' : 'PM');
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const cmdStamp = (ms) => { const d = new Date(ms); return two(d.getMonth() + 1) + '/' + two(d.getDate()) + '/' + d.getFullYear() + '  ' + two(h12(d)) + ':' + two(d.getMinutes()) + ' ' + ampm(d); };
  const psDate = (d) => (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
  const psTime = (d) => h12(d) + ':' + two(d.getMinutes()) + ' ' + ampm(d);
  // Get-ChildItem's LastWriteTime column: '{0,10} {1,8}' of the short date and the short time
  const psLWT = (ms) => { const d = new Date(ms); return psDate(d).padStart(10) + ' ' + psTime(d).padStart(8); };
  const psDateTime = (ms) => { const d = new Date(ms); return psDate(d) + ' ' + h12(d) + ':' + two(d.getMinutes()) + ':' + two(d.getSeconds()) + ' ' + ampm(d); };
  const psLongDate = (ms) => { const d = new Date(ms); return DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + ' ' + h12(d) + ':' + two(d.getMinutes()) + ':' + two(d.getSeconds()) + ' ' + ampm(d); };
  const BAD_NAME = /[<>:"|?*\u0000-\u001f]/;
  // a wildcard as cmd reads it (* and ?; *.* is everything) or as PowerShell does (* ? [a-z], ` escapes); both ignore case
  function wildRe(pat, ps) {
    if (!ps && pat === '*.*') return /^.*$/s;
    let re = '';
    for (let i = 0; i < pat.length; i++) {
      const c = pat[i];
      if (c === '*') re += '.*';
      else if (c === '?') re += '.';
      else if (ps && c === '`' && i + 1 < pat.length) re += pat[++i].replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
      else if (ps && c === '[') { const j = pat.indexOf(']', i + 1); if (j > i + 1) { re += '[' + pat.slice(i + 1, j).replace(/[\\\]^]/g, '\\$&') + ']'; i = j; } else re += '\\['; }
      else re += c.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
    }
    if (!ps && /\.\*$/.test(pat)) re = re.slice(0, -4) + '(?:\\..*)?';   // cmd: x.* also matches x
    try { return new RegExp('^' + re + '$', 'is'); } catch (e) { return /^$/; }
  }
  const hasWild = (s, ps) => (ps ? /[*?[]/.test(s.replace(/`./g, '')) : /[*?]/.test(s));
  const ntfsOrder = (a, b) => { const A = a.toUpperCase(), B = b.toUpperCase(); return A < B ? -1 : A > B ? 1 : 0; };

  /* ---------------- the Windows view of the file system ---------------- */
  const ROOTS = [['Temp', '/tmp'], ['Users', '/home']];
  const VIRT_FILES = ['cmd.exe', 'find.exe', 'findstr.exe', 'git.exe', 'hostname.exe', 'java.exe', 'javac.exe', 'more.com', 'notepad.exe', 'powershell.exe', 'pwsh.exe', 'py.exe', 'python.exe', 'sort.exe', 'tree.com', 'where.exe', 'whoami.exe', 'xcopy.exe'];
  function winState(sh) {
    if (!sh.dialect) sh.dialect = [];
    if (sh.win && sh.win.fs === sh.fs) return sh.win;
    const t0 = sh.fs.root.m;
    const sys32 = { t: 'd', c: dict(), m: t0, virt: true };
    for (const n of VIRT_FILES) sys32.c[n] = { t: 'f', d: '', m: t0, x: true, virt: true };
    const windows = { t: 'd', c: dict(), m: t0, virt: true };
    windows.c.System32 = sys32;
    sh.win = { fs: sh.fs, overlay: null, windows };
    return sh.win;
  }
  /** the path helpers of one shell */
  function paths(sh) {
    const W = winState(sh), fs = sh.fs;
    if (W.P) return W.P;
    const rootNode = { t: 'd', root: true, m: fs.root.m };
    const unixOf = (comps) => { if (!comps.length) return '/'; const r = ROOTS.find((x) => x[0] === comps[0]); return r ? r[1] + (comps.length > 1 ? '/' + comps.slice(1).join('/') : '') : null; };
    const winOf = (comps) => 'C:\\' + comps.join('\\');
    const compsOfUnix = (u) => { if (u === '/') return []; for (const [w, r] of ROOTS) if (u === r || u.startsWith(r + '/')) return [w].concat(u.slice(r.length).split('/').filter(Boolean)); return null; };
    const nodeAt = (comps) => {
      if (!comps.length) return rootNode;
      if (comps[0] === 'Windows') { let n = W.windows; for (const c of comps.slice(1)) { if (!n || n.t !== 'd' || !has(n.c, c)) return null; n = n.c[c]; } return n; }
      const u = unixOf(comps); return u ? fs.stat(u) : null;
    };
    const names = (comps, node) => {
      if (node.root) return ROOTS.filter((x) => fs.isDir(x[1])).map((x) => x[0]).concat(['Windows']);
      if (node.virt) return Object.keys(node.c);
      try { return fs.list(unixOf(comps)); } catch (e) { return []; }
    };
    const item = (comps, node) => ({ comps, node, name: comps.length ? comps[comps.length - 1] : '', win: winOf(comps), unix: comps[0] === 'Windows' ? null : unixOf(comps), dir: node.t === 'd', virt: !!(node.virt || node.root) });
    const children = (it) => { const out = []; for (const n of names(it.comps, it.node)) { const c = it.comps.concat([n]), node = nodeAt(c); if (node) out.push(item(c, node)); } return out.sort((a, b) => ntfsOrder(a.name, b.name)); };
    const child = (it, name) => {
      if (!it.dir) return null;
      const ns = names(it.comps, it.node); let real = ns.includes(name) ? name : null;
      if (real === null) { const lo = name.toLowerCase(), m = ns.filter((n) => n.toLowerCase() === lo); if (m.length === 1) real = m[0]; }
      if (real === null) return null;
      const c = it.comps.concat([real]), node = nodeAt(c); return node ? item(c, node) : null;
    };
    const root = () => item([], rootNode);
    const cwdComps = () => { if (W.overlay && fs.cwd === '/') return W.overlay.slice(); const c = compsOfUnix(fs.cwd); return c || compsOfUnix(HOME); };
    const cwdWin = () => winOf(cwdComps());
    const cwdItem = () => walk(cwdComps());
    const setCwd = (it) => { if (it.unix) { fs.cwd = it.unix; W.overlay = null; } else { fs.cwd = '/'; W.overlay = it.comps.slice(); } };
    // a typed path → the parts it names (as typed), . and .. worked out. ~ is the home in PowerShell (opt.tilde).
    const parse = (text, opt) => {
      let s = String(text == null ? '' : text).replace(/\//g, '\\');
      let base = cwdComps();
      const m = s.match(/^([A-Za-z]):/);
      if (m) { if (m[1].toUpperCase() !== 'C') return { badDrive: m[1].toUpperCase() }; s = s.slice(2); }
      if (opt && opt.tilde && (s === '~' || s.startsWith('~\\'))) { base = compsOfUnix(HOME); s = s.slice(2); }
      else if (s.startsWith('\\')) base = [];
      const out = base;
      for (let part of s.split('\\')) {
        if (part === '' || part === '.') continue;
        if (part === '..') { out.pop(); continue; }
        part = part.replace(/[. ]+$/, '');   // Windows drops dots and spaces at the end of a name
        if (part) out.push(part);
      }
      return { comps: out };
    };
    const walk = (comps) => { let it = root(); for (const c of comps) { it = child(it, c); if (!it) return null; } return it; };
    /** an existing item, or { missing, typed } */
    const resolve = (text, opt) => {
      const p = parse(text, opt); if (p.badDrive) return { badDrive: p.badDrive, typed: String(text) };
      let it = root();
      for (let i = 0; i < p.comps.length; i++) {
        const c = child(it, p.comps[i]);
        if (!c) return { missing: true, parentOk: i === p.comps.length - 1 && it.dir, typed: winOf(p.comps), comps: p.comps };
        it = c;
      }
      return { item: it, typed: winOf(p.comps), comps: p.comps };
    };
    /** where a new entry goes: { parent, name, item (when one of that name is there), comps, unix, win } or { noParent } / { badDrive } */
    const target = (text, opt) => {
      const p = parse(text, opt); if (p.badDrive) return { badDrive: p.badDrive };
      if (!p.comps.length) return { isRoot: true, item: root(), typed: 'C:\\' };
      const name = p.comps[p.comps.length - 1], parent = walk(p.comps.slice(0, -1));
      const typed = winOf(p.comps);
      if (!parent || !parent.dir) return { noParent: true, typed };
      const ex = child(parent, name), real = ex ? ex.name : name, comps = parent.comps.concat([real]);
      return { parent, name: real, item: ex, comps, unix: comps[0] === 'Windows' ? null : unixOf(comps), win: winOf(comps), typed, badName: !ex && (BAD_NAME.test(real) || real.length > LIMITS.name) };
    };
    /** a path whose last part may hold wildcards → { dir, matches } (sorted as the drive lists them) or { noDir, typed } */
    const glob = (text, ps) => {
      const p = parse(text, { tilde: ps }); if (p.badDrive) return { badDrive: p.badDrive };
      const last = p.comps.pop(), dir = walk(p.comps);
      if (!dir || !dir.dir) return { noDir: true, typed: winOf(p.comps.concat(last === undefined ? [] : [last])) };
      const re = wildRe(last || '*', ps);
      return { dir, matches: children(dir).filter((c) => re.test(c.name)), prefix: String(text).replace(/\//g, '\\').replace(/[^\\]*$/, '') };
    };
    /** a path as seen from the current directory (Select-String, findstr): below it → relative; elsewhere → the full path */
    const rel = (it) => { const c = cwdComps(); if (it.comps.length > c.length && c.every((x, i) => x === it.comps[i])) return it.comps.slice(c.length).join('\\'); return it.win; };
    const inside = (it) => { const c = cwdComps(); return it.comps.length <= c.length && it.comps.every((x, i) => x === c[i]); };   // the current directory is it, or below it
    W.P = { unixOf, winOf, compsOfUnix, nodeAt, children, child, root, cwdComps, cwdWin, cwdItem, setCwd, parse, resolve, target, glob, walk, rel, inside, item };
    return W.P;
  }
  // the free space dir reports: what the practice file system still has room for
  const freeBytes = (sh) => Math.max(0, LIMITS.bytes - sh.fs.usage().bytes);
  const sizeOf = (it) => (it.dir ? 0 : (it.node.d || '').length);

  /* ---------------- running a line ---------------- */
  function remember(sh, line) {
    const typed = String(line).split('\n')[0];
    if (typed.trim() && sh.history[sh.history.length - 1] !== typed) { sh.history.push(typed); if (sh.history.length > LIMITS.history) sh.history.shift(); }
  }
  // the output of one line is counted (and capped) wherever it goes
  function countIO(io, run, sh) {
    const count = (s) => { run.out += s.length; if (run.out > LIMITS.out) throw new WinStop('output', 1); if (sh.cancelled) throw new WinStop('cancel', 130); };
    return Object.assign({}, io, { out: (s, c) => { s = String(s); count(s); io.out(s, c); }, err: (s) => { s = String(s); count(s); io.err(s); } });
  }
  function tick(st, sh, n) { if (sh.cancelled) throw new WinStop('cancel', 130); st.run.steps += n || 1; if (st.run.steps > (st.kind === 'ps' ? PS_STEPS : LIMITS.steps)) throw new WinStop('steps', 1); }
  function stopMessage(e, io, st) {
    if (e.kind === 'cancel') { io.err('^C\n'); return 130; }
    const what = st.kind === 'ps' ? 'PowerShell' : 'cmd';
    if (e.kind === 'steps') io.err(what + ': stopped: this line ran too long (more than ' + (st.kind === 'ps' ? PS_STEPS : LIMITS.steps) + ' steps). Is there a loop that never ends?\n');
    else if (e.kind === 'output') io.err(what + ': stopped: the command produced more output than this terminal keeps.\n');
    else if (e.kind === 'items') io.err(what + ': stopped: more than ' + MAX_ITEMS + ' values in one list here.\n');
    else if (e.kind === 'nest') io.err(what + ': stopped: shells started inside each other too deeply (' + MAX_NEST + ' at most here). Type exit to leave one.\n');
    else if (e.kind === 'size') io.err(what + ': stopped: a value here grew past ' + LIMITS.vars * 4 + ' characters.\n');
    else io.err(what + ': stopped.\n');
    return e.code || 1;
  }
  /** a dialect on the stack: what sh.exec, sh.prompt and sh.complete call while it is on top */
  function entry(sh, st) {
    const e = {
      kind: st.kind, state: st,
      prompt: () => promptOf(sh, st),
      complete: (line) => complete(sh, st, line),
      exec: async (line, io0) => {
        line = String(line).replace(/\u0000/g, '');
        remember(sh, line);
        const io = Object.assign({ out: () => { }, err: null, tty: true }, io0 || {}); if (!io.err) io.err = io.out;
        if (typeof io.stdin === 'string') io.stdin = { text: io.stdin, pos: 0 };
        sh.cancelled = false; st.run = { steps: 0, out: 0, depth: 0 };
        const gio = countIO(io, st.run, sh);
        let code;
        try { code = st.kind === 'cmd' ? await cmdLine(sh, st, line, gio) : await psLine(sh, st, line, gio); }
        catch (err) { if (!isStop(err)) throw err; code = stopMessage(err, io, st); if (st.kind === 'cmd') st.el = code; else st.ok = false; }
        if (st.exited !== null) {
          const i = sh.dialect.indexOf(e); if (i >= 0) sh.dialect.splice(i);
          code = st.exited;
          const top = sh.dialect[sh.dialect.length - 1];
          if (top && top.kind === 'cmd') { top.state.el = code; if (top.state.echo) io.out('\n'); }   // the cmd that started it prompts again
          else if (top && top.kind === 'ps') { top.state.lastExit = code; top.state.ok = code === 0; }
        } else if (sh.dialect[sh.dialect.length - 1] === e && st.kind === 'cmd' && st.echo && line.trim() && !st.noBlank) io.out('\n');   // cmd's blank line before the next prompt
        sh.lastExit = code;
        return code;
      }
    };
    return e;
  }
  function promptOf(sh, st) {
    const P = paths(sh);
    if (st.kind === 'ps') return 'PS ' + P.cwdWin() + '> ';
    if (!st.echo) return '';
    const pr = envGet(st.env, 'PROMPT'); const fmt = pr === null ? '$P$G' : pr;
    return fmt.replace(/\$(.)/g, (m, c) => {
      switch (c.toUpperCase()) {
        case 'P': return P.cwdWin(); case 'G': return '>'; case 'L': return '<'; case 'B': return '|'; case 'Q': return '='; case 'S': return ' ';
        case '$': return '$'; case '_': return '\n'; case 'N': return 'C'; case 'A': return '&'; case 'C': return '('; case 'F': return ')';
        case 'T': return cmdTime(sh); case 'D': return cmdDateNow(sh); case 'V': return 'Microsoft Windows [Version ' + WIN_VER + ']';
        default: return '';
      }
    });
  }
  const nowOf = (sh) => (sh.hooks && sh.hooks.now ? sh.hooks.now() : sh.fs.now());
  const cmdDateNow = (sh) => { const d = new Date(nowOf(sh)); return DAYS[d.getDay()].slice(0, 3) + ' ' + two(d.getMonth() + 1) + '/' + two(d.getDate()) + '/' + d.getFullYear(); };
  const cmdTime = (sh) => { const d = new Date(nowOf(sh)); return String(d.getHours()).padStart(2) + ':' + two(d.getMinutes()) + ':' + two(d.getSeconds()) + '.' + two(Math.floor(d.getMilliseconds() / 10)); };

  // environment variables: names ignore case, and keep the case they were set with (null-prototype: a name may be __proto__)
  function makeEnv(sh, parent) {
    const env = dict();
    if (parent) { for (const k in parent) env[k] = { k: parent[k].k, v: parent[k].v }; return env; }
    const home = 'C:\\Users\\' + USER;
    const base = { COMPUTERNAME: HOST.toUpperCase(), ComSpec: 'C:\\Windows\\system32\\cmd.exe', HOMEDRIVE: 'C:', HOMEPATH: '\\Users\\' + USER, OS: 'Windows_NT',
      Path: 'C:\\Windows\\system32;C:\\Windows', PATHEXT: '.COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC', PROMPT: '$P$G', SystemDrive: 'C:', SystemRoot: 'C:\\Windows',
      TEMP: 'C:\\Temp', TMP: 'C:\\Temp', USERDOMAIN: HOST.toUpperCase(), USERNAME: USER, USERPROFILE: home, windir: 'C:\\Windows' };
    for (const k of Object.keys(base)) env[k.toLowerCase()] = { k, v: base[k] };
    return env;
  }
  const envGet = (env, name) => { const e = env[String(name).toLowerCase()]; return e ? e.v : null; };
  const envSet = (env, name, v) => { const lo = String(name).toLowerCase(); if (v === null || v === '') { delete env[lo]; return; } if (Object.keys(env).length >= 1000 && !env[lo]) throw new WinStop('items', 1); env[lo] = { k: env[lo] ? env[lo].k : String(name), v: String(v).slice(0, 32767) }; };

  /** start a dialect from any shell (bash, cmd or PowerShell): kind 'cmd' or 'ps'; parent: the state of the dialect it was typed in (or null) */
  function newState(sh, kind, parent) {
    const env = makeEnv(sh, parent ? parent.env : null);
    const st = { kind, env, exited: null, run: { steps: 0, out: 0, depth: 0 }, depth: (parent && parent.depth || 0) + 1 };
    if (kind === 'cmd') Object.assign(st, { echo: true, el: 0, dirs: [], noBlank: false, title: 'Command Prompt' });
    else Object.assign(st, { vars: dict(), funcs: dict(), ok: true, lastExit: null, dirs: [], oldDirs: [] });
    return st;
  }
  function nestLevel(sh) { return (sh.dialect ? sh.dialect.length : 0); }
  // a Windows shell started where Windows sees nothing (/etc, /bin, /usr, /dev) starts in the home folder, as cmd started from a folder it
  // cannot use starts somewhere else; the shared working directory moves there too, so the prompt and fs.cwd agree
  const keepCwd = (sh) => { const W = winState(sh), cwd = sh.fs.cwd, ov = W.overlay; return () => { sh.fs.cwd = cwd; W.overlay = ov; }; };
  function enterWin(sh) { const W = winState(sh), P = paths(sh); if (!(W.overlay && sh.fs.cwd === '/') && P.compsOfUnix(sh.fs.cwd) === null) sh.fs.cwd = HOME; }

  /* ================= the Command Prompt (cmd.exe) ================= */
  const setEl = (st, c) => { st.el = c; return c; };
  function CmdSyntax(msg, code) { this.message = msg; this.code = code; }
  // the file system's errors, in Windows' words
  const winMsg = (e) => ({ EACCES: 'Access is denied.', ENOSPC: 'There is not enough space on the disk.', EFBIG: 'There is not enough space on the disk.', EMFILE: 'There is not enough space on the disk.',
    ENAMETOOLONG: 'The filename or extension is too long.', EINVAL: 'The filename, directory name, or volume label syntax is incorrect.', ENOENT: 'The system cannot find the path specified.',
    ENOTEMPTY: 'The directory is not empty.', EEXIST: 'Cannot create a file when that file already exists.', ENOTDIR: 'The directory name is invalid.', EISDIR: 'Access is denied.' })[e.code] || 'Access is denied.';
  async function fsDo(io, fn) { try { fn(); return true; } catch (e) { if (!(e instanceof FsError)) throw e; io.err(winMsg(e) + '\n'); return false; } }

  // %NAME% (and %NAME:~1,3% %NAME:a=b%) are replaced before the line is read, as cmd does; at the prompt an unknown name stays as it is
  function expandPct(sh, st, s) {
    let out = '', i = 0;
    while (i < s.length) {
      const c = s[i];
      if (c !== '%') { out += c; i++; continue; }
      const j = s.indexOf('%', i + 1);
      if (j < 0) { out += s.slice(i); break; }
      const spec = s.slice(i + 1, j), v = pctValue(sh, st, spec);
      if (v === null) { out += '%' + spec; i = j; continue; }
      out += v; i = j + 1;
      if (out.length > LIMITS.vars) throw new WinStop('output', 1);
    }
    return out;
  }
  function pctValue(sh, st, spec) {
    const m = spec.match(/^([^:]*)(?::(.*))?$/s); if (!m || !m[1]) return null;
    const name = m[1], lo = name.toLowerCase();
    let v = envGet(st.env, name);
    if (v === null) {
      if (lo === 'cd') v = paths(sh).cwdWin(); else if (lo === 'errorlevel') v = String(st.el); else if (lo === 'date') v = cmdDateNow(sh); else if (lo === 'time') v = cmdTime(sh);
      else if (lo === 'random') v = String(Math.floor(Math.random() * 32768)); else if (lo === 'cmdextversion') v = '2'; else return null;
    }
    if (m[2] === undefined) return v;
    const mod = m[2];
    const sub = mod.match(/^~(-?\d+)(?:,(-?\d+))?$/);
    if (sub) { let a = +sub[1], b = sub[2] === undefined ? v.length : +sub[2]; if (a < 0) a = Math.max(0, v.length + a); const end = b < 0 ? v.length + b : a + b; return v.slice(a, Math.max(a, end)); }
    const rep = mod.match(/^(\*?)([^=]*)=(.*)$/s);
    if (rep && rep[2]) {
      const from = rep[2].toLowerCase(), to = rep[3];
      if (rep[1]) { const k = v.toLowerCase().indexOf(from); return k < 0 ? v : to + v.slice(k + from.length); }
      let r = '', k = 0; const lv = v.toLowerCase();
      for (;;) { const f = lv.indexOf(from, k); if (f < 0) { r += v.slice(k); break; } r += v.slice(k, f) + to; k = f + from.length; }
      return r;
    }
    return null;
  }
  /** a line → [{ op: null|'&'|'&&'|'||', stages: [{ text, redirs: [{fd, op, target}] }] }]; " quotes, ^ escapes, redirections taken out */
  function cmdParse(s) {
    const list = []; let cur = { op: null, stages: [] }, seg = { text: '', redirs: [] }, q = false;
    const empty = () => !seg.text.trim() && !seg.redirs.length;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (q) { seg.text += c; if (c === '"') q = false; continue; }
      if (c === '"') { q = true; seg.text += c; continue; }
      if (c === '^') { if (i + 1 < s.length) seg.text += s[++i]; continue; }
      if (c === '&' || c === '|') {
        const op = s[i + 1] === c ? c + c : c; if (op.length === 2) i++;
        if (empty()) throw new CmdSyntax(op + ' was unexpected at this time.', 255);
        cur.stages.push(seg); seg = { text: '', redirs: [] };
        if (op === '|') continue;
        list.push(cur); cur = { op, stages: [] }; continue;
      }
      if (c === '>' || c === '<') {
        let fd = c === '<' ? 0 : 1;
        const mm = seg.text.match(/(^|\s)([0-9])$/); if (mm && c === '>') { fd = +mm[2]; seg.text = seg.text.slice(0, -1); }
        let op = c; if (c === '>' && s[i + 1] === '>') { op = '>>'; i++; }
        if (s[i + 1] === '&' && c === '>') { i++; if (/[0-9]/.test(s[i + 1] || '')) { seg.redirs.push({ fd, op: '>&', target: +s[++i] }); continue; } throw new CmdSyntax('The syntax of the command is incorrect.', 1); }
        let j = i + 1; while (j < s.length && /[ \t]/.test(s[j])) j++;
        let w = '', wq = false;
        while (j < s.length) { const ch = s[j]; if (wq) { if (ch === '"') wq = false; else w += ch; j++; continue; } if (ch === '"') { wq = true; j++; continue; } if (/[\s&|<>]/.test(ch)) break; if (ch === '^' && j + 1 < s.length) { w += s[j + 1]; j += 2; continue; } w += ch; j++; }
        if (!w) throw new CmdSyntax('The syntax of the command is incorrect.', 1);
        seg.redirs.push({ fd, op, target: w }); i = j - 1; continue;
      }
      seg.text += c;
    }
    if (empty()) { if (cur.stages.length || (cur.op && cur.op !== '&')) throw new CmdSyntax('The syntax of the command is incorrect.', 1); }
    else cur.stages.push(seg);
    if (cur.stages.length) list.push(cur);
    return list;
  }
  async function cmdLine(sh, st, line, io) {
    st.noBlank = false;
    if (!line.trim()) { st.noBlank = true; return st.el; }
    let list;
    try { list = cmdParse(expandPct(sh, st, line)); }
    catch (e) { if (!(e instanceof CmdSyntax)) throw e; io.err(e.message + '\n'); return setEl(st, e.code); }
    let last = st.el;
    for (const item of list) {
      if (item.op === '&&' && last !== 0) continue;
      if (item.op === '||' && last === 0) continue;
      last = await cmdPipeline(sh, st, item.stages, io);
      if (st.exited !== null) break;
    }
    return st.el;
  }
  async function cmdPipeline(sh, st, stages, io) {
    if (stages.length === 1) return cmdStage(sh, st, stages[0], io, null);
    let input = null, code = 0;
    for (let i = 0; i < stages.length; i++) {
      tick(st, sh);
      if (i === stages.length - 1) { code = await cmdStage(sh, st, stages[i], Object.assign({}, io, { piped: true }), input); break; }
      let buf = '';
      const cio = Object.assign({}, io, { out: (s) => { buf += s; st.run.out += s.length; if (st.run.out > LIMITS.out) throw new WinStop('output', 1); }, tty: false, piped: true });
      code = await cmdStage(sh, st, stages[i], cio, input);
      input = buf;
    }
    return code;
  }
  async function cmdStage(sh, st, stage, io, stdin) {
    const P = paths(sh), files = [];
    let outT = { k: 'io' }, errT = { k: 'err' }, input = stdin;
    for (const r of stage.redirs) {
      if (r.op === '<') {
        const res = P.resolve(r.target);
        if (!res.item || res.item.dir) { io.err((res.item ? 'Access is denied.' : 'The system cannot find the file specified.') + '\n'); return setEl(st, 1); }
        input = res.item.node.d; continue;
      }
      if (r.op === '>&') { if (r.fd === 2 && r.target === 1) errT = outT; else if (r.fd === 1 && r.target === 2) outT = errT; continue; }
      let t;
      if (/^nul:?$/i.test(r.target)) t = { k: 'nul' };
      else if (/^con:?$/i.test(r.target)) t = { k: r.fd === 2 ? 'err' : 'io' };
      else {
        const tg = P.target(r.target);
        if (tg.badDrive || tg.noParent) { io.err('The system cannot find the path specified.\n'); return setEl(st, 1); }
        if (tg.badName) { io.err('The filename, directory name, or volume label syntax is incorrect.\n'); return setEl(st, 1); }
        if (tg.isRoot || (tg.item && tg.item.dir) || !tg.unix) { io.err('Access is denied.\n'); return setEl(st, 1); }
        let f = files.find((x) => x.unix === tg.unix);
        if (!f) { f = { unix: tg.unix, text: '' }; files.push(f); }
        if (!await fsDo(io, () => { if (r.op === '>' || !sh.fs.exists(tg.unix)) sh.fs.write(tg.unix, ''); })) return setEl(st, 1);
        t = { k: 'file', f };
      }
      if (r.fd === 2) errT = t; else if (r.fd === 1) outT = t;
    }
    const sink = (t) => t.k === 'io' ? io.out : t.k === 'err' ? io.err : t.k === 'nul' ? () => { } : (s) => { t.f.text += s; if (t.f.text.length > LIMITS.fileBytes * 2) throw new WinStop('output', 1); };
    const io2 = Object.assign({}, io, { out: sink(outT), err: sink(errT), stdin: input == null ? (io.stdin || null) : { text: input, pos: 0 }, tty: !!io.tty && outT.k === 'io', redirected: outT.k !== 'io' });
    try { return await cmdCommand(sh, st, stage.text, io2); }
    finally { for (const f of files) if (f.text) await fsDo(io, () => sh.fs.write(f.unix, f.text, true)); }
  }
  // a command's words: " groups (and is removed); { v, quoted }
  function words(rest) {
    const out = []; let i = 0;
    while (i < rest.length) {
      while (i < rest.length && /\s/.test(rest[i])) i++;
      if (i >= rest.length) break;
      let v = '', q = false, quoted = false;
      while (i < rest.length && (q || !/\s/.test(rest[i]))) { const c = rest[i++]; if (c === '"') { q = !q; quoted = true; continue; } v += c; }
      out.push({ v, quoted });
    }
    return out;
  }
  // cmd's own commands read /switches anywhere, even inside a word: dir garden/w is dir garden /w (so a / path works only in quotes or in cd)
  function splitSw(ws) {
    const sw = [], args = [];
    for (const w of ws) {
      if (w.quoted || !w.v.includes('/')) { args.push(w); continue; }
      const parts = w.v.split('/');
      if (parts[0] !== '') args.push({ v: parts[0], quoted: false });
      for (let k = 1; k < parts.length; k++) sw.push(parts[k].toLowerCase());
    }
    return { sw, args };
  }
  const SYNTAX = 'The syntax of the command is incorrect.\n';
  async function askYN(io, text) { if (!io.ask) return 'y'; const a = await io.ask(text); return a == null ? 'n' : String(a).trim().toLowerCase(); }
  async function cmdCommand(sh, st, text, io) {
    const t = text.replace(/^[\s@]+/, '');
    if (!t) return st.el;   // only a redirection: the file is made, nothing runs
    let name, rest;
    const m = t.match(/^[A-Za-z]+/);
    if (m && has(CMDS, m[0].toLowerCase()) && CMDS[m[0].toLowerCase()].internal && (t.length === m[0].length || /[\s.\\\/:(+,;=\[\]"]/.test(t[m[0].length]))) { name = m[0]; rest = t.slice(m[0].length); }
    else { const w = t.match(/^"([^"]*)"?|^[^\s]+/); name = w[1] !== undefined ? w[1] : w[0]; rest = t.slice(w[0].length); }
    let key = name.toLowerCase(), spec = has(CMDS, key) ? CMDS[key] : null;
    if (!spec && /\.(exe|com)$/i.test(key)) { const k2 = key.replace(/\.(exe|com)$/, ''); if (has(CMDS, k2) && !CMDS[k2].internal) spec = CMDS[k2]; }
    if (!spec && /[\\\/.]/.test(name)) {   // a program or a Python file named by its path
      const res = paths(sh).resolve(name);
      const it = res.item || (!/\.\w+$/.test(name) ? (paths(sh).resolve(name + '.exe').item || null) : null);
      if (it && !it.dir && /\.py$/i.test(it.name)) { tick(st, sh); return setEl(st, await runPython(sh, io, [it.win].concat(words(rest).map((w) => w.v)), 'python')); }
      if (it && !it.dir && it.virt) { const k2 = it.name.toLowerCase().replace(/\.(exe|com)$/, ''); if (has(CMDS, k2) && !CMDS[k2].internal) spec = CMDS[k2]; }
    }
    if (!spec) { io.err("'" + name + "' is not recognized as an internal or external command,\noperable program or batch file.\n"); return setEl(st, 9009); }
    tick(st, sh);
    if (/^\s*\/\?\s*$/.test(rest) && spec.help) { io.out(spec.help.replace(/\n?$/, '\n')); return spec.keep ? 0 : setEl(st, 0); }
    const r = await spec.run({ sh, st, io, rest, name, P: paths(sh) });
    if (r && typeof r === 'object') return r.code;   // a command that leaves ERRORLEVEL alone but fails for && and || (del)
    if (spec.keep) return r || 0;
    return setEl(st, r || 0);
  }

  // ----- programs: the site's sandboxes, through the bash commands and shell.js's runProgram
  // a path as the bash commands read it: \ becomes /, C:\... becomes the Unix path, a name in another case becomes the name on disk
  function unixArg(sh, a) {
    const P = paths(sh), r = P.resolve(a);
    if (r.item && r.item.unix) { const abs = r.item.unix; return abs.startsWith(sh.fs.cwd + '/') ? abs.slice(sh.fs.cwd.length + 1) : abs; }
    if (/^[A-Za-z]:/.test(a) || a.includes('\\')) { const t = P.target(a); if (t.unix) return t.unix; }
    return a;
  }
  async function runPython(sh, io, args, name) {
    const C = SHELL.COMMANDS;
    if (!args.length || args[0].startsWith('-')) return C.python.run.call(C.python, args, io, sh);
    const P = paths(sh), r = P.resolve(args[0]);
    if (!r.item || r.item.dir || !r.item.unix && !r.item.virt) {
      const full = r.item ? r.item.win : r.typed || args[0];
      io.err('C:\\Users\\' + USER + '\\AppData\\Local\\Programs\\Python\\Python39\\python.exe: can\'t open file ' + "'" + full.replace(/\\/g, '\\\\') + "': [Errno " + (r.item ? '13] Permission denied' : '2] No such file or directory') + '\n');
      return 2;
    }
    return sh.runProgram({ lang: 'python', src: r.item.node.d }, args[0], args.slice(1), io);
  }
  async function runBashCmd(sh, io, cmd, args) {
    const C = SHELL.COMMANDS[cmd];
    if (!C) { io.err(cmd + ': not available here\n'); return 1; }
    const r = await C.run.call(C, args.map((a) => unixArg(sh, a)), io, sh);
    return typeof r === 'number' ? r : 0;
  }

  // ----- dir
  const dirLine = (it, name) => cmdStamp(it.node.m) + (it.dir ? '    <DIR>          ' : String(commas(sizeOf(it))).padStart(18) + ' ') + name;
  const filesLine = (n, b) => String(n).padStart(16) + ' File(s) ' + commas(b).padStart(14) + ' bytes\n';
  const dirsLine = (n, free) => String(n).padStart(16) + ' Dir(s) ' + commas(free).padStart(15) + ' bytes free\n';
  async function cmdDir(c) {
    const { sh, io, P } = c;
    const { sw, args } = splitSw(words(c.rest));
    const o = { b: false, s: false, w: false, attr: null, order: null };
    for (const s of sw) {
      if (s === 'b') o.b = true; else if (s === 's') o.s = true; else if (s === 'w') o.w = true;
      else if (['p', 'q', 'x', 'l', 'n', 'c', '-c', 'r', '4', 'd'].includes(s)) { /* accepted: nothing to change here */ }
      else if (/^a:?(-?[dhsrailo])*$/.test(s)) o.attr = s.replace(/^a:?/, '');
      else if (/^o:?(-?[nsedg])*$/.test(s)) o.order = s.replace(/^o:?/, '') || 'gn';
      else { io.err('Invalid switch - "' + s.replace(/^.*?(?=[^-:]|$)/, '') + '".\n'); return 1; }
    }
    const attrOk = (it) => {
      if (o.attr === null) return true;
      for (const m of o.attr.match(/-?[a-z]/g) || []) {
        const neg = m[0] === '-', a = m.slice(-1);
        const hasA = a === 'd' ? it.dir : a === 'a' ? !it.dir : false;
        if (neg ? hasA : !hasA) return false;
      }
      return true;
    };
    const sortList = (list) => {
      if (!o.order) return list;
      let keys = o.order.match(/-?[nsedg]/g) || []; const cmp = (a, b) => {
        for (const k of keys) {
          const neg = k[0] === '-' ? -1 : 1, f = k.slice(-1); let d = 0;
          if (f === 'n') d = ntfsOrder(a.name, b.name); else if (f === 's') d = sizeOf(a) - sizeOf(b); else if (f === 'd') d = a.node.m - b.node.m;
          else if (f === 'e') d = ntfsOrder(a.name.replace(/^[^.]*$|^.*\./, ''), b.name.replace(/^[^.]*$|^.*\./, '')); else if (f === 'g') d = (b.dir ? 1 : 0) - (a.dir ? 1 : 0);
          if (d) return d * neg;
        }
        return 0;
      };
      return list.slice().sort(cmp);
    };
    // what each argument lists: a directory, or the entries of a directory that match a name or a wildcard
    const specs = [];
    for (const a of (args.length ? args.map((x) => x.v) : ['.'])) {
      const last = a.replace(/\//g, '\\').split('\\').pop();
      if (hasWild(last)) { const g = P.glob(a); specs.push(g.dir ? { dir: g.dir, re: wildRe(last), dots: last === '*' || last === '*.*' } : { bad: true }); continue; }
      const r = P.resolve(a);
      if (r.item && r.item.dir) specs.push({ dir: r.item, re: null, dots: true });
      else if (r.item) specs.push({ dir: P.walk(r.item.comps.slice(0, -1)), re: wildRe(r.item.name.replace(/[*?]/g, '')), dots: false });
      else if (r.parentOk) specs.push({ dir: P.walk(r.comps.slice(0, -1)), re: wildRe(last), dots: false });
      else specs.push({ bad: true });
    }
    const entries = (dir, sp) => {
      const out = [];
      if (sp.dots && dir.comps.length) {
        const up = P.walk(dir.comps.slice(0, -1));
        if (!sp.re || sp.re.test('.')) out.push({ it: dir, name: '.' });
        if (!sp.re || sp.re.test('..')) out.push({ it: up, name: '..' });
      }
      for (const ch of P.children(dir)) if ((!sp.re || sp.re.test(ch.name)) && attrOk(ch)) out.push({ it: ch, name: ch.name });
      const dots = out.filter((e) => e.name === '.' || e.name === '..'), rest = sortList(out.filter((e) => e.name !== '.' && e.name !== '..').map((e) => e.it)).map((it) => ({ it, name: it.name }));
      return (attrOk(dir) ? dots : []).concat(rest);
    };
    let tf = 0, tb = 0, td = 0, blocks = 0, any = false, code = 0;
    if (!o.b) io.out(' Volume in drive C has no label.\n Volume Serial Number is ' + SERIAL + '\n');
    const wide = (list) => {
      const names = list.map((e) => (e.it.dir ? '[' + e.name + ']' : e.name));
      const w = Math.max(...names.map((n) => n.length)) + 2, cols = Math.max(1, Math.floor(80 / w));
      for (let i = 0; i < names.length; i += cols) io.out(names.slice(i, i + cols).map((n, k, row) => (k < row.length - 1 ? n.padEnd(w) : n)).join('') + '\n');
    };
    const block = (dir, sp) => {
      tick(c.st, sh);
      const list = entries(dir, sp);
      if (o.b) {
        for (const e of list) if (e.name !== '.' && e.name !== '..') { io.out((o.s ? e.it.win : e.name) + '\n'); any = true; }
      } else if (list.length) {
        any = true; blocks++;
        io.out('\n Directory of ' + dir.win + '\n\n');
        let f = 0, b = 0, d = 0;
        if (o.w) wide(list); else for (const e of list) io.out(dirLine(e.it, e.name) + '\n');
        for (const e of list) { if (e.it.dir) d++; else { f++; b += sizeOf(e.it); } }
        io.out(filesLine(f, b)); tf += f; tb += b; td += d;
      }
      if (o.s) for (const ch of P.children(dir)) if (ch.dir) block(ch, { re: sp.re, dots: sp.dots || !sp.re });
    };
    for (const sp of specs) {
      if (sp.bad) { if (!o.b) io.out('\n'); io.err('The system cannot find the path specified.\n'); code = 1; continue; }
      const before = blocks, anyBefore = any;
      block(sp.dir, sp);
      if (!o.b && blocks === before) { if (!o.s) io.out('\n Directory of ' + sp.dir.win + '\n\n'); io.err('File Not Found\n'); code = 1; }
      else if (o.b && any === anyBefore) { io.err('File Not Found\n'); code = 1; }
    }
    if (!o.b && blocks) {
      if (o.s || specs.length > 1) io.out('\n     Total Files Listed:\n' + filesLine(tf, tb));
      io.out(dirsLine(td, freeBytes(sh)));
    }
    return code;
  }

  // ----- cd, pushd, popd
  function cmdCd(c, text, quiet) {
    const { io, P } = c;
    let s = text.trim();
    if (/^\/d(\s|$)/i.test(s)) s = s.slice(2).trim();
    if (s.length > 1 && s[0] === '"') s = s.replace(/^"|"$/g, '');
    if (!s) { if (!quiet) io.out(P.cwdWin() + '\n'); return 0; }
    if (/^[A-Za-z]:$/.test(s)) { if (s[0].toUpperCase() !== 'C') { io.err('The system cannot find the drive specified.\n'); return 1; } io.out(P.cwdWin() + '\n'); return 0; }
    const r = P.resolve(s);
    if (r.badDrive) { io.err('The system cannot find the drive specified.\n'); return 1; }
    if (!r.item) { io.err('The system cannot find the path specified.\n'); return 1; }
    if (!r.item.dir) { io.err('The directory name is invalid.\n'); return 1; }
    P.setCwd(r.item); return 0;
  }

  // ----- type, copy, move, ren, del, mkdir, rmdir
  async function cmdType(c) {
    const { io, P } = c, { sw, args } = splitSw(words(c.rest));
    if (sw.length || !args.length) { io.err(SYNTAX); return 1; }
    const many = args.length > 1 || args.some((a) => hasWild(a.v));
    let code = 0;
    for (const a of args) {
      let list = [];
      if (/^nul:?$/i.test(a.v)) continue;
      if (hasWild(a.v)) { const g = P.glob(a.v); list = g.matches ? g.matches.filter((x) => !x.dir).map((x) => [x, g.prefix + x.name]) : []; }
      else { const r = P.resolve(a.v); if (r.item && r.item.dir) { io.err('Access is denied.\n'); code = 1; continue; } if (r.item) list = [[r.item, a.v]]; }
      if (!list.length) { io.err('The system cannot find the file specified.\n' + (many ? 'Error occurred while processing: ' + a.v + '.\n' : '')); code = 1; continue; }
      for (const [it, shown] of list) { tick(c.st, c.sh); if (many) io.err('\n' + shown + '\n\n\n'); io.out(it.node.d); }
    }
    return code;
  }
  // the sources of copy, move, del: a file, the files of a directory, or what a wildcard matches → { list: [[item, shown]], listed: names are printed }
  function sources(P, text, filesOnly) {
    if (hasWild(text)) { const g = P.glob(text); if (!g.matches) return { list: [], listed: true }; return { list: g.matches.filter((x) => !filesOnly || !x.dir).map((x) => [x, g.prefix + x.name]), listed: true, dir: g.dir }; }
    const r = P.resolve(text);
    if (r.item && r.item.dir && filesOnly) return { list: P.children(r.item).filter((x) => !x.dir).map((x) => [x, text.replace(/[\\\/]+$/, '') + '\\' + x.name]), listed: true, dir: r.item, wasDir: true };
    return { list: r.item ? [[r.item, text]] : [], listed: false };
  }
  const same = (a, b) => a.comps.length === b.comps.length && a.comps.every((x, i) => x === b.comps[i]);
  async function cmdCopy(c) {
    const { sh, io, P } = c, { sw, args } = splitSw(words(c.rest));
    let confirm = !!io.ask;
    for (const s of sw) { if (s === 'y') confirm = false; else if (s === '-y') confirm = true; else if (!['v', 'a', 'b', 'd', 'z', 'l', 'n'].includes(s)) { io.err('Invalid switch - /' + s + '\n'); return 1; } }
    if (!args.length || args.length > 2) { io.err(SYNTAX); return 1; }
    const none = (msg) => { io.err(msg + '\n'); io.out('        0 file(s) copied.\n'); return 1; };
    const src = sources(P, args[0].v, true);
    if (!src.list.length) return none('The system cannot find the file specified.');
    const dstText = args.length > 1 ? args[1].v : '.';
    const dr = P.resolve(dstText), intoDir = !!(dr.item && dr.item.dir);
    if (!dr.item) { const tg = P.target(dstText); if (tg.noParent || tg.badDrive) return none('The system cannot find the path specified.'); if (tg.badName) return none('The filename, directory name, or volume label syntax is incorrect.'); }
    let n = 0, all = !confirm;
    if (src.list.length > 1 && !intoDir) {   // copy *.txt all.txt joins the files into one, as cmd does
      const tg = P.target(dstText);
      for (const [, shown] of src.list) io.out(shown + '\n');
      if (!tg.unix || (tg.item && tg.item.dir)) return none('Access is denied.');
      if (src.list.some(([it]) => tg.item && same(it, tg.item))) { io.err('The file cannot be copied onto itself.\n'); }
      if (await fsDo(io, () => sh.fs.write(tg.unix, src.list.map(([it]) => it.node.d).join('')))) n = 1;
      io.out(String(n).padStart(9) + ' file(s) copied.\n'); return n ? 0 : 1;
    }
    for (const [it, shown] of src.list) {
      tick(c.st, sh);
      const tg = intoDir ? P.target(dr.item.win + '\\' + it.name) : P.target(dstText);
      if (src.listed) io.out(shown + '\n');
      if (tg.item && same(tg.item, it)) { io.err('The file cannot be copied onto itself.\n'); continue; }
      if (!tg.unix || (tg.item && tg.item.dir)) { io.err('Access is denied.\n'); continue; }
      if (tg.item && !all) { const a = await askYN(io, 'Overwrite ' + tg.win + '? (Yes/No/All): '); if (a[0] === 'a') all = true; else if (a[0] !== 'y') continue; }
      if (await fsDo(io, () => sh.fs.write(tg.unix, it.node.d))) n++;
    }
    io.out(String(n).padStart(9) + ' file(s) copied.\n');
    return n === src.list.length ? 0 : 1;
  }
  async function cmdMove(c) {
    const { sh, io, P } = c, { sw, args } = splitSw(words(c.rest));
    let confirm = !!io.ask;
    for (const s of sw) { if (s === 'y') confirm = false; else if (s === '-y') confirm = true; else { io.err('Invalid switch - /' + s + '\n'); return 1; } }
    if (!args.length || args.length > 2) { io.err(SYNTAX); return 1; }
    const src = sources(P, args[0].v, false);
    if (!src.list.length) { io.err('The system cannot find the file specified.\n'); return 1; }
    const dstText = args.length > 1 ? args[1].v : '.';
    const dr = P.resolve(dstText), intoDir = !!(dr.item && dr.item.dir);
    if (src.list.length > 1 && !intoDir) { io.err('Cannot move multiple files to a single file.\n'); return 1; }
    let files = 0, dirs = 0, all = !confirm, bad = false;
    for (const [it] of src.list) {
      tick(c.st, sh);
      const tg = intoDir ? P.target(dr.item.win + '\\' + it.name) : P.target(dstText);
      if (src.listed) io.out(it.win + '\n');
      if (tg.noParent || tg.badDrive) { io.err('The system cannot find the path specified.\n'); bad = true; continue; }
      if (tg.badName) { io.err('The filename, directory name, or volume label syntax is incorrect.\n'); bad = true; continue; }
      if (tg.item && same(tg.item, it)) { if (tg.name !== it.name) { /* only the case changes */ } else { files += it.dir ? 0 : 1; dirs += it.dir ? 1 : 0; continue; } }
      if (!it.unix || !tg.unix || it.virt) { io.err('Access is denied.\n'); bad = true; continue; }
      if (it.dir && P.inside(it)) { io.err('The process cannot access the file because it is being used by another process.\n'); bad = true; continue; }
      if (it.dir && tg.comps.length > it.comps.length && it.comps.every((x, i) => x === tg.comps[i])) { io.err('The process cannot access the file because it is being used by another process.\n'); bad = true; continue; }
      if (tg.item && !same(tg.item, it)) {
        if (tg.item.dir || it.dir) { io.err('Access is denied.\n'); bad = true; continue; }
        if (!all) { const a = await askYN(io, 'Overwrite ' + tg.win + '? (Yes/No/All): '); if (a[0] === 'a') all = true; else if (a[0] !== 'y') continue; }
        if (!await fsDo(io, () => sh.fs.unlink(tg.item.unix))) { bad = true; continue; }
      }
      if (await fsDo(io, () => sh.fs.move(it.unix, tg.unix))) { if (it.dir) dirs++; else files++; } else bad = true;
    }
    if (dirs && !files) io.out(String(dirs).padStart(9) + ' dir(s) moved.\n');
    else if (files || !bad) io.out(String(files).padStart(9) + ' file(s) moved.\n');
    return bad ? 1 : 0;
  }
  function renameMask(name, mask) {
    if (!/[*?]/.test(mask)) return mask;
    let out = '', i = 0;
    for (let k = 0; k < mask.length; k++) {
      const ch = mask[k];
      if (ch === '?') { if (i < name.length && name[i] !== '.') out += name[i++]; }
      else if (ch === '*') { const next = mask[k + 1]; if (next === undefined) { out += name.slice(i); i = name.length; } else { const j = name.lastIndexOf(next); if (j >= i) { out += name.slice(i, j); i = j; } else { out += name.slice(i); i = name.length; } } }
      else if (ch === '.') { const j = name.indexOf('.', i); i = j >= 0 ? j + 1 : name.length; out += '.'; }
      else { out += ch; if (i < name.length && name[i] !== '.') i++; }
    }
    return out.replace(/[. ]+$/, '');
  }
  async function cmdRen(c) {
    const { sh, io, P } = c, ws = words(c.rest);
    if (ws.length !== 2 || /[\\\/:]/.test(ws[1].v)) { io.err(SYNTAX); return 1; }
    const src = sources(P, ws[0].v, false);
    if (!src.list.length) { io.err('The system cannot find the file specified.\n'); return 1; }
    let code = 0;
    for (const [it] of src.list) {
      const nn = renameMask(it.name, ws[1].v), parent = P.walk(it.comps.slice(0, -1));
      const ex = P.child(parent, nn);
      if (!nn || BAD_NAME.test(nn)) { io.err('The filename, directory name, or volume label syntax is incorrect.\n'); code = 1; continue; }
      if (ex && !same(ex, it)) { io.err('A duplicate file name exists, or the file\ncannot be found.\n'); code = 1; continue; }
      if (!it.unix || it.virt) { io.err('Access is denied.\n'); code = 1; continue; }
      if (it.dir && P.inside(it)) { io.err('The process cannot access the file because it is being used by another process.\n'); code = 1; continue; }
      if (!await fsDo(io, () => sh.fs.move(it.unix, it.unix.replace(/[^\/]*$/, '') + nn))) code = 1;
    }
    return code;
  }
  async function cmdDel(c) {
    const { sh, io, P } = c, { sw, args } = splitSw(words(c.rest));
    const o = { q: false, s: false };
    for (const s of sw) { if (s === 'q') o.q = true; else if (s === 's') o.s = true; else if (['f', 'p'].includes(s) || /^a:?/.test(s)) { /* accepted */ } else { io.err('Invalid switch - ' + s + '\n'); return { code: 1 }; } }
    if (!args.length) { io.err(SYNTAX); return { code: 1 }; }
    let missing = false;
    for (const a of args) {
      tick(c.st, sh);
      const last = a.v.replace(/\//g, '\\').split('\\').pop();
      const r = hasWild(last) ? null : P.resolve(a.v);
      let dir, re, all = false;
      if (r && r.item && r.item.dir) { dir = r.item; re = /^/; all = true; }
      else if (r && r.item) { dir = P.walk(r.item.comps.slice(0, -1)); re = wildRe(r.item.name); }
      else if (r) { missing = true; io.err('Could Not Find ' + r.typed + '\n'); continue; }
      else { const g = P.glob(a.v); if (!g.dir) { missing = true; io.err('The system cannot find the path specified.\n'); continue; } dir = g.dir; re = wildRe(last); all = last === '*' || last === '*.*'; }
      if (all && !o.q) { const ans = await askYN(io, dir.win + '\\*, Are you sure (Y/N)? '); if (ans[0] !== 'y') continue; }
      let found = 0;
      const go = (d) => {
        for (const ch of P.children(d)) {
          if (!ch.dir && re.test(ch.name)) { found++; if (!ch.unix) { io.err('Access is denied.\n'); continue; } try { sh.fs.unlink(ch.unix); if (o.s) io.out('Deleted file - ' + ch.win + '\n'); } catch (e) { if (!(e instanceof FsError)) throw e; io.err(winMsg(e) + '\n'); } }
        }
        if (o.s) for (const ch of P.children(d)) if (ch.dir) go(ch);
      };
      go(dir);
      if (!found && !all) { missing = true; io.err('Could Not Find ' + (r ? r.typed : dir.win + '\\' + last) + '\n'); }
    }
    return { code: missing ? 1 : 0 };
  }
  function makeDirs(sh, io, P, text) {   // mkdir a\b\c: each missing part is made → 0, or an error printed → 1
    const p = P.parse(text);
    if (p.badDrive) { io.err('The system cannot find the drive specified.\n'); return 1; }
    let it = P.root(), k = 0;
    for (; k < p.comps.length; k++) { const ch = P.child(it, p.comps[k]); if (!ch) break; if (!ch.dir) { io.err(k === p.comps.length - 1 ? 'A subdirectory or file ' + text + ' already exists.\n' : 'The system cannot find the path specified.\n'); return 1; } it = ch; }
    if (k === p.comps.length) { io.err('A subdirectory or file ' + text + ' already exists.\n'); return 1; }
    const restNames = p.comps.slice(k);
    if (restNames.some((n) => BAD_NAME.test(n))) { io.err('The filename, directory name, or volume label syntax is incorrect.\n'); return 1; }
    const unix = P.unixOf(it.comps.concat(restNames));
    if (!unix || it.virt && it.comps.length) { io.err('Access is denied.\n'); return 1; }
    try { sh.fs.mkdir(unix, true); return 0; } catch (e) { if (!(e instanceof FsError)) throw e; io.err(winMsg(e) + '\n'); return 1; }
  }
  async function cmdMkdir(c) {
    const ws = words(c.rest);
    if (!ws.length || ws.some((w) => !w.quoted && w.v.includes('/'))) { c.io.err(SYNTAX); return 1; }
    let code = 0;
    for (const w of ws) { tick(c.st, c.sh); if (makeDirs(c.sh, c.io, c.P, w.v)) code = 1; }
    return code;
  }
  async function cmdRmdir(c) {
    const { sh, io, P } = c, { sw, args } = splitSw(words(c.rest));
    const o = { s: false, q: false };
    for (const s of sw) { if (s === 's') o.s = true; else if (s === 'q') o.q = true; else { io.err('Invalid switch - ' + s + '\n'); return 1; } }
    if (!args.length) { io.err(SYNTAX); return 1; }
    let code = 0;
    for (const a of args) {
      const r = P.resolve(a.v);
      if (!r.item) { io.err('The system cannot find the file specified.\n'); code = 1; continue; }
      const it = r.item;
      if (!it.dir) { io.err('The directory name is invalid.\n'); code = 1; continue; }
      if (P.inside(it)) { io.err('The process cannot access the file because it is being used by another process.\n'); code = 1; continue; }
      if (!it.unix || it.virt) { io.err('Access is denied.\n'); code = 1; continue; }
      if (P.children(it).length && !o.s) { io.err('The directory is not empty.\n'); code = 1; continue; }
      if (o.s && !o.q) { const ans = await askYN(io, a.v + ', Are you sure (Y/N)? '); if (ans[0] !== 'y') continue; }
      if (!await fsDo(io, () => sh.fs.rmTree(it.unix))) code = 1;
    }
    return code;
  }

  // ----- echo, set
  function cmdEcho(c) {
    const { st, io } = c, r = c.rest;
    if (!r.trim() && !/^[.:(\/\\\[\]+,;=]/.test(r)) { io.out('ECHO is ' + (st.echo ? 'on' : 'off') + '.\n'); return 0; }
    const text = r.slice(1);
    if (/^\s/.test(r) && /^\s*(on|off)\s*$/i.test(r)) { st.echo = /on/i.test(r); return 0; }
    io.out(text + '\n'); return 0;
  }
  // set /a: cmd's integer arithmetic (32 bits), with its operators and messages
  function setA(st, expr) {
    const toks = []; const re = /\s*(0[xX][0-9a-fA-F]+|\d+|[A-Za-z_][A-Za-z0-9_.$#@]*|<<=|>>=|<<|>>|[*\/%+\-&^|]=|[()!~*\/%+\-&^|=,])/y;
    let m, pos = 0;
    while (pos < expr.length) { re.lastIndex = pos; m = re.exec(expr); if (!m) { if (/^\s*$/.test(expr.slice(pos))) break; throw new CmdSyntax('Invalid number.  Numeric constants are either decimal (17),\nhexadecimal (0x11), or octal (021).', 9168); } toks.push(m[1]); pos = re.lastIndex; }
    let i = 0;
    const peek = () => toks[i], next = () => toks[i++];
    const num = (t) => { if (/^0[xX]/.test(t)) return parseInt(t, 16) | 0; if (/^0\d/.test(t)) { if (/[89]/.test(t)) throw new CmdSyntax('Invalid number.  Numeric constants are either decimal (17),\nhexadecimal (0x11), or octal (021).', 9168); return parseInt(t, 8) | 0; } return Number(t) | 0; };
    const varv = (n) => { const v = envGet(st.env, n); if (v === null) return 0; const t = v.trim(); return /^-?\d+$/.test(t) ? Number(t) | 0 : /^0x[0-9a-f]+$/i.test(t) ? parseInt(t, 16) | 0 : 0; };
    const missing = () => new CmdSyntax('Missing operand.', 1073750988);
    const LEVELS = [['|'], ['^'], ['&'], ['<<', '>>'], ['+', '-'], ['*', '/', '%']];
    const unary = () => {
      const t = next(); if (t === undefined) throw missing();
      if (t === '-') return -unary() | 0; if (t === '+') return unary(); if (t === '!') return unary() ? 0 : 1; if (t === '~') return ~unary();
      if (t === '(') { const v = comma(); if (next() !== ')') throw new CmdSyntax('Unbalanced parenthesis.', 1073750990); return v; }
      if (/^\d/.test(t)) return num(t);
      if (/^[A-Za-z_]/.test(t)) {
        if (/^(=|[*\/%+\-&^|]=|<<=|>>=)$/.test(peek() || '')) { const op = next(), rhs = assign(); let v = rhs; const cur = varv(t);
          if (op !== '=') { const o2 = op.slice(0, -1); v = bin(o2, cur, rhs); } envSet(st.env, t, String(v)); return v; }
        return varv(t);
      }
      throw missing();
    };
    const bin = (op, a, b) => { switch (op) { case '+': return (a + b) | 0; case '-': return (a - b) | 0; case '*': return Math.imul(a, b); case '/': if (!b) throw new CmdSyntax('Divide by zero error.', 1073750993); return (a / b) | 0; case '%': if (!b) throw new CmdSyntax('Divide by zero error.', 1073750993); return (a % b) | 0; case '<<': return a << b; case '>>': return a >> b; case '&': return a & b; case '^': return a ^ b; case '|': return a | b; } return 0; };
    const level = (k) => { if (k === LEVELS.length) return unary(); let v = level(k + 1); while (LEVELS[k].includes(peek())) { const op = next(); v = bin(op, v, level(k + 1)); } return v; };
    const assign = () => level(0);
    const comma = () => { let v = assign(); while (peek() === ',') { next(); v = assign(); } return v; };
    const v = comma();
    if (i < toks.length) throw new CmdSyntax(toks[i] === ')' ? 'Unbalanced parenthesis.' : 'Missing operator.', 1073750991);
    return v;
  }
  async function cmdSet(c) {
    const { st, io } = c;
    const t = c.rest.replace(/^\s/, '').trim();
    const list = (prefix) => { const keys = Object.keys(st.env).filter((k) => k.startsWith(prefix.toLowerCase())).sort((a, b) => ntfsOrder(a, b)); for (const k of keys) io.out(st.env[k].k + '=' + st.env[k].v + '\n'); return keys.length; };
    if (!t) { list(''); return 0; }
    if (/^\/a(\s|$)/i.test(t)) {
      const ex = t.slice(2).trim().replace(/"/g, '');
      if (!ex) { io.err(SYNTAX); return 1; }
      try { io.out(String(setA(st, ex))); return 0; }   // at the prompt the value is shown, without a line end (the prompt's own line end follows)
      catch (e) { if (!(e instanceof CmdSyntax)) throw e; io.err(e.message + '\n'); return e.code; }
    }
    if (/^\/p(\s|$)/i.test(t)) {
      const s = c.rest.replace(/^\s*\/p\s*/i, '').replace(/^"(.*)"\s*$/, '$1'), eq = s.indexOf('=');   // the prompt keeps its spaces
      if (eq <= 0) { io.err(SYNTAX); return 1; }
      const name = s.slice(0, eq), prompt = s.slice(eq + 1);
      let ans = null;
      if (io.stdin) { const rest = io.stdin.text.slice(io.stdin.pos); const nl = rest.indexOf('\n'); ans = nl < 0 ? rest : rest.slice(0, nl); io.stdin.pos += nl < 0 ? rest.length : nl + 1; io.out(prompt); if (!rest) ans = null; }
      else if (io.ask) ans = await io.ask(prompt); else io.out(prompt);
      if (ans == null || ans === '') return 1;
      envSet(st.env, name, String(ans).replace(/\r$/, '')); return 0;
    }
    let s = t; if (s[0] === '"') { const j = s.lastIndexOf('"'); s = s.slice(1, j > 0 ? j : undefined); }
    const eq = s.indexOf('=');
    if (eq < 0) { if (!list(s)) { io.err('Environment variable ' + s + ' not defined\n'); return 1; } return 0; }
    if (eq === 0) { io.err(SYNTAX); return 1; }
    envSet(st.env, s.slice(0, eq), s.slice(eq + 1));
    return 0;
  }
  // if [/i] [not] exist PATH | defined NAME | errorlevel N | A==B  COMMAND   (one command; no else, no ( ) blocks here)
  async function cmdIf(c) {
    const { st, io, P } = c;
    let s = c.rest.trim(), ci = false, not = false;
    if (/^\/i\s/i.test(s)) { ci = true; s = s.slice(2).trim(); }
    if (/^not\s/i.test(s)) { not = true; s = s.slice(3).trim(); }
    const word = () => { const m = s.match(/^("[^"]*"|[^\s=]+)/); if (!m) return null; s = s.slice(m[0].length).trim(); return m[0]; };
    let ok;
    const m = s.match(/^(exist|defined|errorlevel)\s+/i);
    if (m) {
      s = s.slice(m[0].length); const arg = word(); if (arg === null) { io.err(SYNTAX); return 1; }
      const k = m[1].toLowerCase(), a = arg.replace(/^"|"$/g, '');
      if (k === 'exist') { ok = hasWild(a) ? !!(P.glob(a).matches || []).length : !!P.resolve(a).item; }
      else if (k === 'defined') ok = envGet(st.env, a) !== null;
      else { if (!/^-?\d+$/.test(a)) { io.err(SYNTAX); return 1; } ok = st.el >= +a; }
    } else {
      const a = word(); const mm = s.match(/^==\s*/);
      if (a === null || !mm) { io.err((s ? s.split(/\s/)[0] : 'The syntax of the command is incorrect.') === 'The syntax of the command is incorrect.' ? SYNTAX : s.split(/\s/)[0] + ' was unexpected at this time.\n'); return 255; }
      s = s.slice(mm[0].length); const b = word(); if (b === null) { io.err(SYNTAX); return 1; }
      ok = ci ? a.toLowerCase() === b.toLowerCase() : a === b;
    }
    if (not) ok = !ok;
    if (!s.trim()) { io.err(SYNTAX); return 1; }
    if (/^\(/.test(s.trim()) || /(^|\s)else(\s|$)/i.test(s)) { io.err('IF with ( ) blocks or ELSE is not available in this practice Command Prompt: give IF one command.\n'); return setEl(st, 1); }
    if (!ok) return 0;
    return cmdCommand(c.sh, st, s, io);
  }

  // ----- find, findstr, sort, more, where, tree, xcopy
  async function readNamed(c, text) {   // [ [item, shown] ] for a name or a wildcard, files only; [] when there is none
    const { P } = c;
    if (hasWild(text)) { const g = P.glob(text); return g.matches ? g.matches.filter((x) => !x.dir).map((x) => [x, g.prefix + x.name]) : []; }
    const r = P.resolve(text); return r.item && !r.item.dir ? [[r.item, text]] : r.item ? [[r.item, text, 'dir']] : [];
  }
  const textLines = (t) => { const a = String(t).split(/\r?\n/); if (a.length && a[a.length - 1] === '') a.pop(); return a; };
  async function cmdFind(c) {
    const { io, sh } = c, ws = words(c.rest);
    const o = { v: false, c: false, n: false, i: false }; let str = null; const files = [];
    for (const w of ws) {
      if (str === null && !w.quoted && /^\//.test(w.v)) { const f = w.v.slice(1).toLowerCase(); if (has(o, f)) o[f] = true; else if (f === 'off' || f === 'offline') { /* accepted */ } else { io.err('FIND: Invalid switch\n'); return 2; } continue; }
      if (str === null) { if (!w.quoted) { io.err('FIND: Parameter format not correct\n'); return 2; } str = w.v; continue; }
      files.push(w.v);
    }
    if (str === null) { io.err('FIND: Parameter format not correct\n'); return 2; }
    const needle = o.i ? str.toLowerCase() : str;
    let found = false, code = 0;
    const scan = (text) => { const out = []; textLines(text).forEach((l, k) => { const hit = (o.i ? l.toLowerCase() : l).includes(needle); if (hit !== o.v) out.push((o.n ? '[' + (k + 1) + ']' : '') + l); }); if (out.length) found = true; return out; };
    if (!files.length) { const text = io.stdin ? io.stdin.text.slice(io.stdin.pos) : ''; const out = scan(text); if (o.c) io.out(out.length + '\n'); else for (const l of out) io.out(l + '\n'); return found ? 0 : 1; }
    for (const f of files) {
      const list = await readNamed(c, f);
      if (!list.length || list[0][2]) { io.err((list.length ? 'Access denied - ' : 'File not found - ') + f.toUpperCase() + '\n'); code = 2; continue; }
      for (const [it, shown] of list) { tick(c.st, sh); const out = scan(it.node.d); if (o.c) io.out('\n---------- ' + shown.toUpperCase() + ': ' + out.length + '\n'); else { io.out('\n---------- ' + shown.toUpperCase() + '\n'); for (const l of out) io.out(l + '\n'); } }
    }
    return code || (found ? 0 : 1);
  }
  // findstr's regular expressions: . * ^ $ [class] [^class] \< \> and \x; everything else is itself
  function findstrRe(p, literal, ci) {
    let re = '';
    if (literal) re = p.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
    else for (let i = 0; i < p.length; i++) {
      const ch = p[i];
      if (ch === '\\' && i + 1 < p.length) { const n = p[++i]; re += n === '<' ? '\\b(?=\\w)' : n === '>' ? '\\b(?<=\\w)' : n.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&'); }
      else if (ch === '.') re += '.'; else if (ch === '*') re += '*'; else if (ch === '^' && i === 0) re += '^'; else if (ch === '$' && i === p.length - 1) re += '$';
      else if (ch === '[') { const j = p.indexOf(']', i + 1); if (j > i) { re += '[' + p.slice(i + 1, j).replace(/\\/g, '\\\\') + ']'; i = j; } else re += '\\['; }
      else re += ch.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
    }
    try { return new RegExp(re, ci ? 'i' : ''); } catch (e) { return null; }
  }
  async function cmdFindstr(c) {
    const { io, P, sh } = c, ws = words(c.rest);
    const o = { i: false, n: false, v: false, s: false, r: true, b: false, e: false, x: false, m: false, lit: null };
    let pats = null; const files = [];
    for (const w of ws) {
      if (pats === null && files.length === 0 && /^\//.test(w.v) && !(w.quoted && !/^\/c:/i.test(w.v))) {
        for (const f of w.v.slice(1).split('/')) {
          const lf = f.toLowerCase();
          if (/^c:/.test(lf)) { o.lit = f.slice(2); continue; }
          if (lf === 'l') o.r = false; else if (lf === 'r') o.r = true; else if (['i', 'n', 'v', 's', 'b', 'e', 'x', 'm'].includes(lf)) o[lf] = true; else if (['p', 'o', 'a'].includes(lf) || /^a:/.test(lf)) { /* accepted */ }
          else { io.err('FINDSTR: /' + f + ' ignored\n'); }
        }
        continue;
      }
      if (pats === null && o.lit === null) { pats = w.v.split(/\s+/).filter(Boolean); continue; }
      files.push(w.v);
    }
    if (o.lit !== null) pats = [o.lit];
    if (!pats || !pats.length) { io.err('FINDSTR: Bad command line\n'); return 2; }
    const res = pats.map((p) => { let x = o.lit !== null && !ws.some((w) => /^\/r$/i.test(w.v)) ? findstrRe(p, true, o.i) : findstrRe(p, !o.r, o.i); return x; });
    if (res.some((x) => !x)) { io.err('FINDSTR: Bad command line\n'); return 2; }
    const test = (l) => res.some((re) => { const m = l.match(re); if (!m) return false; if (o.x) return m[0] === l; if (o.b && m.index !== 0) return false; if (o.e && m.index + m[0].length !== l.length) return false; return true; });
    let found = false, code = 0;
    const scan = (text, prefix) => { const ls = textLines(text); let hits = 0; for (let k = 0; k < ls.length; k++) { if (test(ls[k]) !== o.v) { hits++; found = true; if (o.m) { io.out(prefix.replace(/:$/, '') + '\n'); return; } io.out(prefix + (o.n ? (k + 1) + ':' : '') + ls[k] + '\n'); } } };
    if (!files.length) { scan(io.stdin ? io.stdin.text.slice(io.stdin.pos) : '', ''); return found ? 0 : 1; }
    const prefixed = files.length > 1 || o.s || files.some((f) => hasWild(f));
    for (const f of files) {
      tick(c.st, sh);
      if (o.s) {
        const p = P.parse(f), last = p.comps.pop() || '*', dir = P.walk(p.comps), re = wildRe(last);
        if (!dir) { io.err('FINDSTR: Cannot open ' + f + '\n'); code = 2; continue; }
        const go = (d) => { for (const ch of P.children(d)) { if (!ch.dir && re.test(ch.name)) scan(ch.node.d, P.rel(ch) + ':'); } for (const ch of P.children(d)) if (ch.dir) go(ch); };
        go(dir); continue;
      }
      const list = await readNamed(c, f);
      if (!list.length) { io.err('FINDSTR: Cannot open ' + f + '\n'); code = 2; continue; }
      for (const [it, shown, isDir] of list) { if (isDir) { io.err('FINDSTR: Cannot open ' + f + '\n'); code = 2; continue; } scan(it.node.d, prefixed || o.m ? shown + ':' : ''); }   // /m prints the file's name even when there is only one file
    }
    return found ? 0 : code || 1;
  }
  async function cmdSort(c) {
    const { io } = c, { sw, args } = splitSw(words(c.rest));
    let rev = false;
    for (const s of sw) { if (s === 'r') rev = true; else if (/^\+\d+$/.test(s) || /^(l|m|rec|t|o)/.test(s)) { /* accepted */ } else { io.err('Invalid switch.\n'); return 1; } }
    let text;
    if (args.length) { const list = await readNamed(c, args[0].v); if (!list.length || list[0][2]) { io.err('The system cannot find the file specified.\n'); return 1; } text = list[0][0].node.d; }
    else text = io.stdin ? io.stdin.text.slice(io.stdin.pos) : '';
    const ls = textLines(text).sort((a, b) => { const A = a.toUpperCase(), B = b.toUpperCase(); return A < B ? -1 : A > B ? 1 : 0; });
    if (rev) ls.reverse();
    for (const l of ls) io.out(l + '\n');
    return 0;
  }
  async function cmdMore(c) {
    const { io } = c, { args } = splitSw(words(c.rest));
    if (!args.length) { const t = io.stdin ? io.stdin.text.slice(io.stdin.pos) : ''; io.out(t && !t.endsWith('\n') ? t + '\n' : t); return 0; }
    let code = 0;
    for (const a of args) { const list = await readNamed(c, a.v); if (!list.length || list[0][2]) { io.err('Cannot access file ' + (list.length ? list[0][0].win : c.P.parse(a.v).comps.length ? c.P.winOf(c.P.parse(a.v).comps) : a.v) + '\n'); code = 1; continue; } for (const [it] of list) { const t = it.node.d; io.out(t && !t.endsWith('\n') ? t + '\n' : t); } }
    return code;
  }
  async function cmdWhere(c) {
    const { io, P } = c, { sw, args } = splitSw(words(c.rest));
    const quiet = sw.includes('q');
    if (!args.length) { io.err('ERROR: A search pattern must be specified.\nType "WHERE /?" for usage.\n'); return 2; }
    const dirs = [P.cwdItem(), P.walk(['Windows', 'System32']), P.walk(['Windows'])].filter(Boolean);
    let code = 0;
    for (const a of args) {
      const pats = /\.[^.\\]*$/.test(a.v) ? [a.v] : [a.v].concat(['.COM', '.EXE', '.BAT', '.CMD'].map((e) => a.v + e));
      const res = pats.map((p) => wildRe(p)), hits = [];
      for (const d of dirs) for (const ch of P.children(d)) if (!ch.dir && res.some((r) => r.test(ch.name)) && !hits.some((h) => same(h, ch))) hits.push(ch);
      if (!hits.length) { if (!quiet) io.err('INFO: Could not find files for the given pattern(s).\n'); code = 1; continue; }
      if (!quiet) for (const h of hits) io.out(h.win + '\n');
    }
    return code;
  }
  async function cmdTree(c) {
    const { io, P, sh } = c, { sw, args } = splitSw(words(c.rest));
    let files = false, ascii = false;
    for (const s of sw) { if (s === 'f') files = true; else if (s === 'a') ascii = true; else { io.err('Invalid switch - /' + s.toUpperCase() + '\n'); return 1; } }
    if (args.length > 1) { io.err('Too many parameters - ' + args[1].v + '\n'); return 1; }
    const T = ascii ? { mid: '+---', last: '\\---', bar: '|   ', none: '    ' } : { mid: '├───', last: '└───', bar: '│   ', none: '    ' };
    io.out('Folder PATH listing\nVolume serial number is ' + SERIAL + '\n');
    let top;
    if (args.length) { const r = P.resolve(args[0].v); if (!r.item || !r.item.dir) { io.out((r.item ? r.item.win : r.typed || args[0].v).toUpperCase() + '\n'); io.err('Invalid path - ' + (r.typed || args[0].v).replace(/^C:/i, '').toUpperCase() + '\n'); io.out('No subfolders exist \n\n'); return 1; } top = r.item; io.out(top.win.toUpperCase() + '\n'); }
    else { top = P.cwdItem() || P.root(); io.out('C:.\n'); }
    let anyDir = false;
    const go = (d, prefix) => {
      tick(c.st, sh);
      const kids = P.children(d), subs = kids.filter((k) => k.dir);
      if (files) { const fs2 = kids.filter((k) => !k.dir); for (const f of fs2) io.out(prefix + (subs.length ? T.bar : T.none) + f.name + '\n'); if (fs2.length) io.out(prefix + (subs.length ? T.bar : T.none) + '\n'); }
      subs.forEach((s, i) => { anyDir = true; const lastOne = i === subs.length - 1; io.out(prefix + (lastOne ? T.last : T.mid) + s.name + '\n'); go(s, prefix + (lastOne ? T.none : T.bar)); });
    };
    go(top, '');
    if (!anyDir) io.out('No subfolders exist \n\n');
    return 0;
  }
  async function cmdXcopy(c) {
    const { sh, io, P } = c, { sw, args } = splitSw(words(c.rest));
    const o = { s: false, e: false, i: false, y: !io.ask, q: false };
    for (const s of sw) { if (has(o, s)) o[s] = true; else if (s === '-y') o.y = false; else if (['f', 'l', 'h', 'r', 't', 'k', 'c', 'v', 'w', 'd'].includes(s)) { /* accepted */ } else { io.err('Invalid switch - /' + s + '\n'); return 4; } }
    if (!args.length || args.length > 2) { io.err('Invalid number of parameters\n0 File(s) copied\n'); return 4; }
    const srcText = args[0].v, dstText = args.length > 1 ? args[1].v : '.';
    const r = hasWild(srcText) ? null : P.resolve(srcText);
    let base, re = null;
    if (r && r.item && r.item.dir) base = r.item;
    else if (r && r.item) { base = P.walk(r.item.comps.slice(0, -1)); re = wildRe(r.item.name); }
    else if (r) { io.err('File not found - ' + srcText + '\n0 File(s) copied\n'); return 4; }
    else { const g = P.glob(srcText); if (!g.dir) { io.err('Invalid path\n0 File(s) copied\n'); return 4; } base = g.dir; re = wildRe(srcText.replace(/\//g, '\\').split('\\').pop()); }
    const shownBase = r && r.item && r.item.dir ? srcText.replace(/[\\\/]+$/, '') : srcText.replace(/\//g, '\\').replace(/[^\\]*$/, '').replace(/\\$/, '');
    let dst = P.resolve(dstText);
    if (r && r.item && r.item.dir && !dst.item) {
      let ans = o.i ? 'd' : await askYN(io, 'Does ' + (dst.typed || dstText) + ' specify a file name\nor directory name on the target\n(F = file, D = directory)? ');
      if (io.ask && !o.i) io.out(ans.toUpperCase().slice(0, 1) + '\n');
      if (ans[0] !== 'd' && io.ask) { io.err('Cannot perform a cyclic copy\n0 File(s) copied\n'); return 4; }
      if (makeDirs(sh, io, P, dstText)) return 4;
      dst = P.resolve(dstText);
    }
    let n = 0;
    const go = (d, dstDir, rel) => {
      tick(c.st, sh);
      for (const ch of P.children(d)) {
        if (ch.dir || (re && !re.test(ch.name))) continue;
        let tgt;
        if (dstDir) tgt = P.target(dstDir.win + '\\' + ch.name); else tgt = P.target(dstText);
        if (!tgt.unix) { io.err('Access denied\n'); continue; }
        if (!o.q) io.out((shownBase ? shownBase + '\\' : '') + rel + ch.name + '\n');
        try { sh.fs.write(tgt.unix, ch.node.d); n++; } catch (e) { if (!(e instanceof FsError)) throw e; io.err('Insufficient disk space\n'); return; }
      }
      if (o.s || o.e) for (const ch of P.children(d)) if (ch.dir && dstDir) {
        if (!o.e && !P.children(ch).some((k) => !k.dir)) continue;
        let sub = P.child(dstDir, ch.name);
        if (!sub) { if (makeDirs(sh, io, P, dstDir.win + '\\' + ch.name)) return; sub = P.child(dstDir, ch.name); }
        go(ch, sub, rel + ch.name + '\\');
      }
    };
    if (dst.item && !dst.item.dir) go(base, null, ''); else if (dst.item) go(base, dst.item, ''); else { if (makeDirs(sh, io, P, dstText)) return 4; go(base, P.resolve(dstText).item, ''); }
    io.out(n + ' File(s) copied\n');
    return 0;
  }

  // ----- cmd and PowerShell, started from cmd (and from bash and PowerShell: see startCmd / startPs)
  const CMD_HELP_LIST = [['CD', 'Displays the name of or changes the current directory.'], ['CHDIR', 'Displays the name of or changes the current directory.'], ['CLS', 'Clears the screen.'],
    ['CMD', 'Starts a new instance of the Windows command interpreter.'], ['COPY', 'Copies one or more files to another location.'], ['DATE', 'Displays or sets the date.'],
    ['DEL', 'Deletes one or more files.'], ['DIR', 'Displays a list of files and subdirectories in a directory.'], ['ECHO', 'Displays messages, or turns command echoing on or off.'],
    ['ERASE', 'Deletes one or more files.'], ['EXIT', 'Quits the CMD.EXE program (command interpreter).'], ['FIND', 'Searches for a text string in a file or files.'],
    ['FINDSTR', 'Searches for strings in files.'], ['HELP', 'Provides Help information for Windows commands.'], ['IF', 'Performs conditional processing in batch programs.'],
    ['MD', 'Creates a directory.'], ['MKDIR', 'Creates a directory.'], ['MORE', 'Displays output one screen at a time.'], ['MOVE', 'Moves one or more files from one directory to another directory.'],
    ['POPD', 'Restores the previous value of the current directory saved by PUSHD.'], ['PROMPT', 'Changes the Windows command prompt.'], ['PUSHD', 'Saves the current directory then changes it.'],
    ['RD', 'Removes a directory.'], ['REM', 'Records comments (remarks) in batch files or CONFIG.SYS.'], ['REN', 'Renames a file or files.'], ['RENAME', 'Renames a file or files.'],
    ['RMDIR', 'Removes a directory.'], ['SET', 'Displays, sets, or removes Windows environment variables.'], ['SORT', 'Sorts input.'], ['TIME', 'Displays or sets the system time.'],
    ['TITLE', 'Sets the window title for a CMD.EXE session.'], ['TREE', 'Graphically displays the directory structure of a drive or path.'], ['TYPE', 'Displays the contents of a text file.'],
    ['VER', 'Displays the Windows version.'], ['VOL', 'Displays a disk volume label and serial number.'], ['XCOPY', 'Copies files and directory trees.']];
  const NOT_HERE = 'assoc attrib break bcdedit cacls call chcp chkdsk chkntfs choice cipher clip color comp compact convert diskpart doskey driverquery endlocal fc for format fsutil ftype goto gpresult icacls ipconfig label mklink mode net netsh netstat openfiles path pause ping print recover reg replace robocopy runas sc schtasks setlocal shift shutdown start subst systeminfo taskkill tasklist timeout verify wmic'.split(' ');
  const CMDS = dict();
  const defC = (names, spec) => { for (const n of names.split(' ')) CMDS[n] = spec; };
  const desc = (n) => { const e = CMD_HELP_LIST.find((x) => x[0] === n.toUpperCase()); return e ? e[1] : ''; };
  defC('dir', { internal: true, run: cmdDir, help: desc('dir') + '\n\nDIR [drive:][path][filename] [/A[[:]attributes]] [/B] [/O[[:]sortorder]] [/S] [/W]\n\n  /A    Displays files with specified attributes (D directories, - means not).\n  /B    Uses bare format (no heading information or summary).\n  /O    List by files in sorted order (N name, S size, E extension, D date, G directories first, - reverses).\n  /S    Displays files in specified directory and all subdirectories.\n  /W    Uses wide list format.' });
  defC('cd chdir', { internal: true, run: (c) => cmdCd(c, c.rest), help: desc('cd') + '\n\nCHDIR [/D] [drive:][path]\nCHDIR [..]\nCD [/D] [drive:][path]\nCD [..]\n\n  ..   Specifies that you want to change to the parent directory.' });
  defC('pushd', { internal: true, help: desc('pushd') + '\n\nPUSHD [path | ..]', run: (c) => { const t = c.rest.trim(); if (!t) { for (const d of c.st.dirs.slice().reverse()) c.io.out(d + '\n'); return 0; } const here = c.P.cwdWin(); const r = cmdCd(c, t, true); if (!r) { c.st.dirs.push(here); if (c.st.dirs.length > 100) c.st.dirs.shift(); } return r; } });
  defC('popd', { internal: true, help: desc('popd') + '\n\nPOPD', run: (c) => { const d = c.st.dirs.pop(); if (d) { const r = c.P.resolve(d); if (r.item && r.item.dir) c.P.setCwd(r.item); } return 0; } });
  defC('type', { internal: true, run: cmdType, help: desc('type') + '\n\nTYPE [drive:][path]filename' });
  defC('copy', { internal: true, run: cmdCopy, help: desc('copy') + '\n\nCOPY [/Y | /-Y] source [destination]\n\n  /Y   Suppresses prompting to confirm you want to overwrite an existing destination file.' });
  defC('move', { internal: true, run: cmdMove, help: desc('move') + '\n\nTo move one or more files:\nMOVE [/Y | /-Y] [drive:][path]filename1[,...] destination\n\nTo rename a directory:\nMOVE [/Y | /-Y] [drive:][path]dirname1 dirname2' });
  defC('ren rename', { internal: true, run: cmdRen, help: desc('ren') + '\n\nRENAME [drive:][path]filename1 filename2.\nREN [drive:][path]filename1 filename2.\n\nNote that you cannot specify a new drive or path for your destination file.' });
  defC('del erase', { internal: true, run: cmdDel, help: desc('del') + '\n\nDEL [/P] [/F] [/S] [/Q] [/A[[:]attributes]] names\n\n  /S   Delete specified files from all subdirectories.\n  /Q   Quiet mode, do not ask if ok to delete on global wildcard' });
  defC('mkdir md', { internal: true, run: cmdMkdir, help: desc('md') + '\n\nMKDIR [drive:]path\nMD [drive:]path\n\nMKDIR creates any intermediate directories in the path, if needed.' });
  defC('rmdir rd', { internal: true, run: cmdRmdir, help: desc('rd') + '\n\nRMDIR [/S] [/Q] [drive:]path\nRD [/S] [/Q] [drive:]path\n\n    /S      Removes all directories and files in the specified directory\n            in addition to the directory itself.  Used to remove a directory\n            tree.\n\n    /Q      Quiet mode, do not ask if ok to remove a directory tree with /S' });
  defC('echo', { internal: true, keep: true, run: cmdEcho, help: desc('echo') + '\n\n  ECHO [ON | OFF]\n  ECHO [message]\n\nType ECHO without parameters to display the current echo setting.' });
  defC('set', { internal: true, run: cmdSet, help: desc('set') + '\n\nSET [variable=[string]]\n\n  variable  Specifies the environment-variable name.\n  string    Specifies a series of characters to assign to the variable.\n\nSET /A expression\nSET /P variable=[promptString]' });
  defC('if', { internal: true, keep: true, run: cmdIf, help: desc('if') + '\n\nIF [NOT] ERRORLEVEL number command\nIF [NOT] string1==string2 command\nIF [NOT] EXIST filename command' });
  defC('cls', { internal: true, keep: true, help: desc('cls') + '\n\nCLS', run: (c) => { if (c.io.clear && !c.io.redirected && !c.io.piped) c.io.clear(); else c.io.out('\f'); c.st.noBlank = true; return 0; } });
  defC('ver', { internal: true, keep: true, help: desc('ver') + '\n\nVER', run: (c) => { c.io.out('\nMicrosoft Windows [Version ' + WIN_VER + ']\n'); return 0; } });
  defC('vol', { internal: true, help: desc('vol') + '\n\nVOL [drive:]', run: (c) => { c.io.out(' Volume in drive C has no label.\n Volume Serial Number is ' + SERIAL + '\n'); return 0; } });
  defC('title', { internal: true, keep: true, help: desc('title') + '\n\nTITLE [string]', run: (c) => { c.st.title = c.rest.trim(); return 0; } });
  defC('rem', { internal: true, keep: true, help: desc('rem') + '\n\nREM [comment]', run: () => 0 });
  defC('prompt', { internal: true, help: desc('prompt') + '\n\nPROMPT [text]\n\n  $P   Current drive and path\n  $G   > (greater-than sign)\n  $N   Current drive\n  $_   Carriage return and linefeed\n  $T   Current time\n  $D   Current date\n  $$   $ (dollar sign)', run: (c) => { const t = c.rest.trim(); envSet(c.st.env, 'PROMPT', t || '$P$G'); return 0; } });
  defC('date', { internal: true, help: desc('date') + '\n\nDATE [/T | date]', run: async (c) => { if (/^\s*\/t\s*$/i.test(c.rest)) { c.io.out(cmdDateNow(c.sh) + '\n'); return 0; } c.io.out('The current date is: ' + cmdDateNow(c.sh) + '\n'); const a = c.io.ask ? await c.io.ask('Enter the new date: (mm-dd-yy) ') : null; if (a) { c.io.err('A required privilege is not held by the client.\n'); return 1; } return 0; } });
  defC('time', { internal: true, help: desc('time') + '\n\nTIME [/T | time]', run: async (c) => { const d = new Date(nowOf(c.sh)); if (/^\s*\/t\s*$/i.test(c.rest)) { c.io.out(two(h12(d)) + ':' + two(d.getMinutes()) + ' ' + ampm(d) + '\n'); return 0; } c.io.out('The current time is: ' + cmdTime(c.sh) + '\n'); const a = c.io.ask ? await c.io.ask('Enter the new time: ') : null; if (a) { c.io.err('A required privilege is not held by the client.\n'); return 1; } return 0; } });
  defC('exit', { internal: true, help: desc('exit') + '\n\nEXIT [/B] [exitCode]', run: (c) => { const m = c.rest.trim().replace(/^\/b\b\s*/i, '').match(/^-?\d+/); c.st.exited = m ? Number(m[0]) | 0 : c.st.el; return c.st.exited; } });
  defC('help', { internal: true, keep: true, run: (c) => {
    const t = c.rest.trim();
    if (t) { const k = t.toLowerCase(); if (has(CMDS, k) && CMDS[k].help) { c.io.out(CMDS[k].help + '\n'); return 0; } c.io.out('This command is not supported by the help utility.  Try "' + t + ' /?".\n'); return 1; }
    c.io.out('For more information on a specific command, type HELP command-name\n');
    for (const [n, d] of CMD_HELP_LIST) c.io.out(n.padEnd(15) + d + '\n');
    c.io.out('\nFor more information on tools see the command-line reference in the online help.\n(This practice Command Prompt has the commands above, plus FIND, FINDSTR, WHERE, WHOAMI, HOSTNAME, python, java, javac, git and powershell.)\n');
    return 0;
  } });
  defC('find', { run: cmdFind, help: desc('find') + '\n\nFIND [/V] [/C] [/N] [/I] "string" [[drive:][path]filename[ ...]]\n\n  /V   Displays all lines NOT containing the specified string.\n  /C   Displays only the count of lines containing the string.\n  /N   Displays line numbers with the displayed lines.\n  /I   Ignores the case of characters when searching for the string.' });
  defC('findstr', { run: cmdFindstr, help: desc('findstr') + '\n\nFINDSTR [/B] [/E] [/L] [/R] [/S] [/I] [/X] [/V] [/N] [/M] [/C:string] strings [[drive:][path]filename[ ...]]\n\n  /I   Specifies that the search is not to be case-sensitive.\n  /N   Prints the line number before each line that matches.\n  /S   Searches for matching files in the current directory and all subdirectories.\n  /C:string  Uses specified string as a literal search string.' });
  defC('sort', { run: cmdSort, help: desc('sort') + '\n\nSORT [/R] [[drive1:][path1]filename1]' });
  defC('more', { run: cmdMore, help: desc('more') + '\n\nMORE [drive:][path]filename\ncommand-name | MORE' });
  defC('where', { run: cmdWhere, help: 'Displays the location of files that match the search pattern.\nBy default, the search is done along the current directory and in the paths specified by the PATH environment variable.\n\nWHERE [/Q] pattern...' });
  defC('tree', { run: cmdTree, help: desc('tree') + '\n\nTREE [drive:][path] [/F] [/A]\n\n   /F   Display the names of the files in each folder.\n   /A   Use ASCII instead of extended characters.' });
  defC('xcopy', { run: cmdXcopy, help: desc('xcopy') + '\n\nXCOPY source [destination] [/S] [/E] [/I] [/Q] [/Y]' });
  defC('whoami', { run: (c) => { c.io.out(HOST + '\\' + USER + '\n'); return 0; } });
  defC('hostname', { run: (c) => { c.io.out(HOST + '\n'); return 0; } });
  defC('notepad', { run: async (c) => {
    const { sh, io, P } = c, ws = words(c.rest);
    if (!sh.hooks.nano) { io.err('notepad: no editor is available here\n'); return 1; }
    if (!ws.length) { io.err('notepad: give the name of a file: notepad notes.txt\n'); return 1; }
    const tg = P.target(ws[0].v);
    if (!tg.unix || (tg.item && tg.item.dir)) { io.err('Access is denied.\n'); return 1; }
    const write = (t) => { try { sh.fs.write(tg.unix, String(t)); return null; } catch (e) { if (!(e instanceof FsError)) throw e; return winMsg(e); } };
    const text = await sh.hooks.nano(tg.win, tg.item ? tg.item.node.d : '', write);
    if (text != null) { const err = write(text); if (err) { io.err(err + '\n'); return 1; } }
    return 0;
  } });
  defC('python py', { run: (c) => runPython(c.sh, c.io, words(c.rest).map((w) => w.v), c.name) });
  defC('java', { run: (c) => runBashCmd(c.sh, c.io, 'java', words(c.rest).map((w) => w.v)) });
  defC('javac', { run: (c) => runBashCmd(c.sh, c.io, 'javac', words(c.rest).map((w) => w.v)) });
  defC('git', { run: (c) => runBashCmd(c.sh, c.io, 'git', words(c.rest).map((w) => w.v)) });
  defC('cmd', { run: (c) => startCmd(c.sh, c.st, c.rest, c.io) });
  defC('powershell pwsh', { run: (c) => startPs(c.sh, c.st, words(c.rest).map((w) => w.v), c.io) });
  for (const n of NOT_HERE) if (!has(CMDS, n)) defC(n, { internal: ['break', 'call', 'endlocal', 'for', 'goto', 'path', 'pause', 'setlocal', 'shift', 'start', 'verify', 'assoc', 'ftype', 'mklink', 'color'].includes(n), run: (c) => { c.io.err(n.toUpperCase() + ' is not available in this practice Command Prompt.\n'); return 1; } });

  /** cmd typed in bash, cmd or PowerShell: raw is the rest of its command line */
  async function startCmd(sh, parent, raw, io) {
    enterWin(sh);
    const st = newState(sh, 'cmd', parent && parent.kind ? parent : null);
    if (nestLevel(sh) >= MAX_NEST || st.depth > MAX_NEST * 2) throw new WinStop('nest', 1);
    let s = String(raw).trim(), mode = null;
    for (;;) {
      const m = s.match(/^\/([A-Za-z?])(:[^\s\/]*)?\s*/);
      if (!m) break;
      const f = m[1].toLowerCase(); s = s.slice(m[0].length);
      if (f === 'c' || f === 'k') { mode = f; break; }
      if (f === 'q') st.echo = false;
      if (f === '?') { io.out('Starts a new instance of the Windows command interpreter\n\nCMD [/Q] [/C | /K] string\n\n/C      Carries out the command specified by string and then terminates\n/K      Carries out the command specified by string but remains\n/Q      Turns echo off\n'); return 0; }
    }
    if (parent && parent.run) st.run = parent.run; else io = countIO(io, st.run, sh);
    if (mode) {
      let text = s; if (/^".*"$/s.test(text) && (text.match(/"/g) || []).length === 2) text = text.slice(1, -1);
      const keep = keepCwd(sh);
      await cmdLine(sh, st, text, io);
      const code = st.exited !== null ? st.exited : st.el;
      if (mode === 'c' || st.exited !== null || !io.tty) { keep(); return code; }   // cmd /c is a child process: its cd ends with it
      st.exited = null; sh.dialect.push(entry(sh, st)); io.out('\n'); return code;
    }
    if (io.stdin) {   // echo dir | cmd: the lines are typed into a Command Prompt, which ends with the input
      io.out(CMD_BANNER + '\n');
      const lines = io.stdin.text.slice(io.stdin.pos).split('\n'); io.stdin.pos = io.stdin.text.length; if (lines[lines.length - 1] === '') lines.pop();
      const sio = Object.assign({}, io, { stdin: null, tty: false, ask: null });
      for (const l of lines) { if (st.exited !== null) break; io.out(promptOf(sh, st) + l + '\n'); await cmdLine(sh, st, l, sio); if (st.echo && l.trim() && !st.noBlank && st.exited === null) io.out('\n'); }
      if (st.exited === null) io.out(promptOf(sh, st) + '\n');
      return st.exited !== null ? st.exited : st.el;
    }
    if (!io.tty) { io.out(CMD_BANNER + '\n'); return 0; }   // no keyboard and no input: it starts and ends at once
    sh.dialect.push(entry(sh, st));
    io.out(CMD_BANNER + '\n');
    return 0;
  }

  /* ================= PowerShell 7.4 ================= */
  function PsParseError(msg, pos, len, incomplete) { this.msg = msg; this.pos = pos; this.len = Math.max(1, len || 1); this.incomplete = !!incomplete; }
  // an error that ends a statement (category: what the concise view shows before the message when no command is to blame)
  function PsError(msg, cat, cmd) { this.msg = msg; this.cat = cat || 'InvalidOperation'; this.cmd = cmd || null; }
  function PsExit(code) { this.code = code; }
  function PsBreak(kind) { this.kind = kind; }
  const IDENT = /[A-Za-z0-9_]/;
  const CMP_RE = /^-([ci]?)(eq|ne|gt|ge|lt|le|like|notlike|match|notmatch|contains|notcontains|in|notin|replace|split)(?![\w-])|^-(join|is|isnot|as)(?![\w-])/i;

  /* ---------------- reading a line (pwsh's two modes: arguments and expressions) ---------------- */
  function psParse(s) {
    let p = 0, commaListOff = 0;
    const err = (msg, at, len, inc) => new PsParseError(msg, at === undefined ? p : at, len, inc);
    const tokenAt = (at) => { const m = s.slice(at).match(/^[^\s;|)}]+/); return m ? m[0] : s[at] || ''; };
    const skipWs = () => {
      for (;;) {
        while (p < s.length && (s[p] === ' ' || s[p] === '\t' || s[p] === '\r')) p++;
        if (s[p] === '`' && s[p + 1] === '\n') { p += 2; continue; }
        if (s.startsWith('<#', p)) { const j = s.indexOf('#>', p + 2); if (j < 0) throw err("Missing the closing '#>' of a block comment.", p, 2, true); p = j + 2; continue; }
        if (s[p] === '#') { while (p < s.length && s[p] !== '\n') p++; continue; }
        break;
      }
    };
    const skipNl = () => { for (;;) { skipWs(); if (s[p] === '\n') { p++; continue; } break; } };
    const kw = (w) => s.slice(p, p + w.length).toLowerCase() === w && !/[\w-]/.test(s[p + w.length] || '');
    const expect = (ch, msg) => { skipWs(); if (s[p] !== ch) throw err(msg, p, 1, p >= s.length); p++; };
    function stmts(end) {
      const list = [];
      for (;;) {
        skipWs();
        while (s[p] === ';' || s[p] === '\n') { p++; skipWs(); }
        if (p >= s.length) { if (end) throw err("Missing closing '" + end + "' in statement block or type definition.", p, 1, true); break; }
        if (end && s[p] === end) break;
        if (s[p] === '}' || s[p] === ')') throw err("Unexpected token '" + s[p] + "' in expression or statement.", p, 1);
        list.push(statement());
        skipWs();
        if (p < s.length && s[p] !== ';' && s[p] !== '\n' && s[p] !== end) { const t = tokenAt(p); throw err("Unexpected token '" + t + "' in expression or statement.", p, t.length); }
      }
      return { k: 'stmts', list };
    }
    function block(msg) { skipNl(); if (s[p] !== '{') throw err(msg, p, 1, p >= s.length); p++; const b = stmts('}'); p++; return b; }
    function cond(word) { skipWs(); if (s[p] !== '(') throw err("Missing '(' after '" + word + "' in " + word + ' statement.', p, 1, p >= s.length); p++; skipNl(); const c = chain(); skipNl(); if (s[p] !== ')') throw err("Missing closing ')' after expression in '" + word + "' statement.", p, 1, p >= s.length); p++; return c; }
    function statement() {
      skipWs();
      const at = p;
      if (kw('if')) {
        p += 2; const clauses = []; let els = null;
        for (;;) {
          const c = cond('if'), b = block('Missing statement block after if ( condition ).');
          clauses.push([c, b]);
          const save = p; skipNl();
          if (kw('elseif')) { p += 6; continue; }
          if (kw('else')) { p += 4; els = block("Missing statement block after 'else' keyword."); } else p = save;
          break;
        }
        return { k: 'if', clauses, els };
      }
      if (kw('foreach') && /^\s*\(/.test(s.slice(p + 7))) {
        p += 7; skipWs(); p++; skipWs();
        if (s[p] !== '$') throw err("Missing variable name after foreach.", p, 1, p >= s.length);
        const v = variable(); skipWs();
        if (!kw('in')) throw err("Missing 'in' after variable in foreach loop.", p, 1, p >= s.length);
        p += 2; skipNl(); const coll = chain(); skipNl();
        if (s[p] !== ')') throw err("Missing closing ')' in foreach statement.", p, 1, p >= s.length); p++;
        return { k: 'foreach', v: v.name, coll, body: block("Missing statement body in foreach loop.") };
      }
      if (kw('while')) { p += 5; const c = cond('while'); return { k: 'while', c, body: block("Missing open curly brace in statement block.") }; }
      if (kw('for') && /^\s*\(/.test(s.slice(p + 3))) {
        p += 3; skipWs(); p++;
        const part = (endCh) => { skipNl(); if (s[p] === endCh) return null; const c = chain(); skipNl(); return c; };
        const init = part(';'); if (s[p] !== ';') throw err("Missing ';' in for loop.", p, 1, p >= s.length); p++;
        const c = part(';'); if (s[p] !== ';') throw err("Missing ';' in for loop.", p, 1, p >= s.length); p++;
        const step = part(')'); if (s[p] !== ')') throw err("Missing closing ')' after expression in 'for' statement.", p, 1, p >= s.length); p++;
        return { k: 'for', init, c, step, body: block("Missing open curly brace in statement block.") };
      }
      if (kw('function') || kw('filter')) {
        p += s.slice(p, p + 8).toLowerCase() === 'function' ? 8 : 6; skipWs();
        const m = s.slice(p).match(/^[^\s(){};]+/); if (!m) throw err('Missing function name.', p, 1, p >= s.length);
        p += m[0].length; skipWs(); const params = [];
        if (s[p] === '(') { p++; for (;;) { skipNl(); if (s[p] === ')') { p++; break; } if (s[p] !== '$') throw err("Missing ')' in function parameter list.", p, 1, p >= s.length); params.push(variable().name); skipNl(); if (s[p] === ',') p++; } }
        return { k: 'function', name: m[0], params, body: block("Missing function body in function declaration.") };
      }
      for (const w of ['break', 'continue']) if (kw(w)) { p += w.length; return { k: w }; }
      if (kw('exit') || kw('return')) {
        const w = kw('exit') ? 'exit' : 'return'; p += w.length; skipWs();
        const v = p < s.length && !/[;\n)}]/.test(s[p]) ? chain() : null;
        return { k: w, v };
      }
      void at;
      return chain();
    }
    function chain() {
      const first = pipeline(), items = [{ op: null, pipe: first }];
      for (;;) { const save = p; skipWs(); if (s.startsWith('&&', p) || s.startsWith('||', p)) { const op = s.slice(p, p + 2); p += 2; skipNl(); if (p >= s.length) throw err('Missing expression after \'' + op + '\' in pipeline chain.', p, 1, true); items.push({ op, pipe: pipeline() }); } else { p = save; break; } }
      return items.length === 1 ? first : { k: 'chain', items };
    }
    function pipeline() {
      skipWs();
      if (s[p] === '$') {
        const save = p;
        try {
          const target = assignTarget(); skipWs();
          const inc = s.slice(p).match(/^(\+\+|--)(?=\s*($|[;\n)}|]))/);   // $i++ and $i-- as statements
          if (target && inc) { p += 2; return { k: 'assign', target, op: inc[1][0] + '=', v: { k: 'pipe', elems: [{ k: 'expr', e: { k: 'num', v: 1 }, redirs: [] }] } }; }
          const m = s.slice(p).match(/^(=(?!=)|\+=|-=|\*=|\/=|%=)/);
          if (target && m) { p += m[0].length; skipNl(); if (p >= s.length) throw err("You must provide a value expression following the '" + m[0] + "' operator.", p, 1, true); return { k: 'assign', target, op: m[0], v: statement() }; }
        } catch (e) { if (!(e instanceof PsParseError) || e.incomplete) throw e; }
        p = save;
      }
      const elems = [element(true)];
      for (;;) {
        const save = p; skipWs();
        if (s[p] === '|' && s[p + 1] !== '|') { p++; skipNl(); if (p >= s.length) throw err('An empty pipe element is not allowed.', p, 1, true); elems.push(element(false)); }
        else { p = save; break; }
      }
      return { k: 'pipe', elems };
    }
    function assignTarget() {
      const v = variable(); const path = [];
      for (;;) {
        if (s[p] === '.' && /[A-Za-z_]/.test(s[p + 1] || '')) { p++; const m = s.slice(p).match(/^[A-Za-z_]\w*/); p += m[0].length; path.push({ member: m[0] }); continue; }
        if (s[p] === '[') { p++; skipNl(); const i = expression(); skipNl(); if (s[p] !== ']') return null; p++; path.push({ index: i }); continue; }
        break;
      }
      return { name: v.name, env: v.env, path };
    }
    function isCommandStart() {
      const c = s[p], n = s[p + 1] || '';
      if (/[A-Za-z_]/.test(c)) return true;
      if (c === '.') return !/[0-9]/.test(n);
      if (c === '\\' || c === '/' || c === '~' || c === '&') return true;
      if ((c === '%' || c === '?') && (n === '' || /[\s{]/.test(n))) return true;
      return false;
    }
    function element(first) {
      skipWs();
      if (p >= s.length || /[;\n|)}]/.test(s[p])) { const t = tokenAt(p); throw err(p >= s.length ? 'An empty pipe element is not allowed.' : "Unexpected token '" + t + "' in expression or statement.", p, t.length, p >= s.length); }
      if (isCommandStart()) return command();
      const at = p, e = expression();
      if (!first) throw err('Expressions are only allowed as the first element of a pipeline.', at, p - at);
      const redirs = []; for (;;) { skipWs(); const r = redir(); if (!r) break; redirs.push(r); }
      return { k: 'expr', e, redirs };
    }
    function redir() {
      const m = s.slice(p).match(/^(\*|[1-6])?(>>|>)(&[1-6])?/);
      if (!m) { if (s[p] === '<' ) throw err("The '<' operator is reserved for future use.", p, 1); return null; }
      p += m[0].length;
      const fd = m[1] === '*' ? '*' : m[1] ? +m[1] : 1;
      if (m[3]) return { fd, dup: +m[3][1] };
      skipWs();
      if (p >= s.length || /[;\n|)}]/.test(s[p])) throw err('Missing file specification after redirection operator.', p, 1, false);
      return { fd, append: m[2] === '>>', target: argElement() };
    }
    function command() {
      let name = null, nameExpr = null, call = false;
      if (s[p] === '&' || (s[p] === '.' && /[ \t]/.test(s[p + 1] || ''))) { call = true; p++; skipWs(); nameExpr = argElement(); }
      else { const m = s.slice(p).match(/^[^\s|;&(){}<>,]+/); name = m[0]; p += name.length; }
      const args = [], redirs = [];
      for (;;) {
        skipWs();
        const c = s[p];
        if (p >= s.length || c === '\n' || c === ';' || c === ')' || c === '}' || c === '|' || (c === '&' && s[p + 1] === '&')) break;
        if (c === '&') throw err('The ampersand (&) character is not allowed. The & operator is reserved for future use; wrap an ampersand in double quotation marks ("&") to pass it as part of a string.', p, 1);
        const r = redir(); if (r) { redirs.push(r); continue; }
        if (c === '-' && /[A-Za-z_?]/.test(s[p + 1] || '')) {
          const m = s.slice(p).match(/^-([A-Za-z_?][\w-]*)(:?)/); p += m[0].length;
          if (m[2]) { skipWs(); args.push({ param: m[1], v: argument(), colon: true }); } else args.push({ param: m[1] });
          continue;
        }
        if (c === '-' && s[p + 1] === '-' && (p + 2 >= s.length || /\s/.test(s[p + 2]))) { p += 2; args.push({ stop: true }); continue; }
        args.push({ v: argument() });
      }
      return { k: 'cmd', name, nameExpr, call, args, redirs };
    }
    function argument() {
      const items = [argElement()];
      for (;;) { const save = p; skipWs(); if (s[p] === ',') { p++; skipNl(); items.push(argElement()); } else { p = save; break; } }
      return items.length > 1 ? { k: 'list', items } : items[0];
    }
    const DELIM = /[\s|;&(){},<>]/;
    function argElement() {
      const c = s[p], at = p;
      if (c === '(' || c === '{' || (c === '$' && s[p + 1] === '(') || (c === '@' && (s[p + 1] === '(' || s[p + 1] === '{'))) { const e = postfix(); return e; }
      if (c === '$') { const e = postfix(); if (p >= s.length || DELIM.test(s[p])) return e; p = at; return bare(); }
      if (c === '"' || c === "'") { const e = c === '"' ? dq() : sq(); if (p >= s.length || DELIM.test(s[p])) return e; p = at; return bare(); }
      const n = s.slice(p).match(/^-?(0x[0-9a-f]+|\d+(\.\d+)?(e[+-]?\d+)?)(kb|mb|gb|tb|pb)?(?=[\s|;&(){},]|$)/i);
      if (n) { p += n[0].length; return { k: 'num', v: numVal(n[0]) }; }
      return bare();
    }
    function bare() {   // a word in argument mode: text, with "…" '…' $var and `x inside
      const parts = []; let lit = '';
      const flush = () => { if (lit) { parts.push(lit); lit = ''; } };
      while (p < s.length && !DELIM.test(s[p])) {
        const c = s[p];
        if (c === '`' && p + 1 < s.length) { lit += s[p + 1]; p += 2; continue; }
        if (c === '"') { flush(); const e = dq(); parts.push(...(e.k === 'str' ? [e.v] : e.parts)); continue; }
        if (c === "'") { flush(); parts.push(sq().v); continue; }
        if (c === '$' && (IDENT.test(s[p + 1] || '') || s[p + 1] === '{' || s[p + 1] === '(' || s[p + 1] === '?')) { flush(); if (s[p + 1] === '(') { p += 2; const b = stmts(')'); p++; parts.push({ k: 'sub', b }); } else parts.push(variable()); continue; }
        lit += c; p++;
      }
      flush();
      if (parts.every((x) => typeof x === 'string')) return { k: 'str', v: parts.join(''), bare: true };
      return { k: 'xstr', parts, bare: true };
    }
    function sq() {
      const at = p; p++; let v = '';
      for (;;) {
        if (p >= s.length) throw err("The string is missing the terminator: '.", at, s.length - at, true);
        const c = s[p];
        if (c === "'") { if (s[p + 1] === "'") { v += "'"; p += 2; continue; } p++; break; }
        v += c; p++;
      }
      return { k: 'str', v };
    }
    const ESC = { '0': '\u0000', a: '\u0007', b: '\b', e: '\u001b', f: '\f', n: '\n', r: '\r', t: '\t', v: '\v' };
    function dq() {
      const at = p; p++; const parts = []; let lit = '';
      const flush = () => { if (lit) { parts.push(lit); lit = ''; } };
      for (;;) {
        if (p >= s.length) throw err('The string is missing the terminator: ".', at, s.length - at, true);
        const c = s[p];
        if (c === '"') { if (s[p + 1] === '"') { lit += '"'; p += 2; continue; } p++; break; }
        if (c === '`' && p + 1 < s.length) {
          const n = s[p + 1];
          if (n === 'u' && s[p + 2] === '{') { const j = s.indexOf('}', p + 3); const cp = parseInt(s.slice(p + 3, j), 16); if (j > 0 && cp >= 0 && cp <= 0x10ffff) { lit += String.fromCodePoint(cp); p = j + 1; continue; } }
          lit += has(ESC, n) ? ESC[n] : n; p += 2; continue;
        }
        if (c === '$') {
          if (s[p + 1] === '(') { flush(); p += 2; const b = stmts(')'); p++; parts.push({ k: 'sub', b }); continue; }
          if (IDENT.test(s[p + 1] || '') || s[p + 1] === '{' || s[p + 1] === '?' || s[p + 1] === '_') { flush(); parts.push(variable()); continue; }
        }
        lit += c; p++;
      }
      flush();
      if (parts.every((x) => typeof x === 'string')) return { k: 'str', v: parts.join('') };
      return { k: 'xstr', parts };
    }
    function variable() {
      const at = p; p++;
      if (s[p] === '{') { const j = s.indexOf('}', p); if (j < 0) throw err("Missing '}' in variable name.", at, s.length - at, true); const n = s.slice(p + 1, j); p = j + 1; return n.toLowerCase().startsWith('env:') ? { k: 'var', name: n.slice(4), env: true } : { k: 'var', name: n }; }
      if (s[p] === '?' || s[p] === '^' || s[p] === '$') { p++; return { k: 'var', name: s[p - 1] }; }
      const m = s.slice(p).match(/^[A-Za-z0-9_]+(:[A-Za-z0-9_]+)?/);
      if (!m) { return { k: 'str', v: '$' }; }
      p += m[0].length;
      if (m[1]) { const scope = m[0].split(':')[0].toLowerCase(), nm = m[1].slice(1); if (scope === 'env') return { k: 'var', name: nm, env: true }; return { k: 'var', name: nm }; }
      return { k: 'var', name: m[0] };
    }
    function numVal(t) {
      const m = t.match(/^(-?)(0x[0-9a-f]+|[\d.]+(?:e[+-]?\d+)?)(kb|mb|gb|tb|pb)?$/i);
      let v = /^0x/i.test(m[2]) ? parseInt(m[2], 16) : Number(m[2]);
      if (m[3]) v *= Math.pow(1024, ['kb', 'mb', 'gb', 'tb', 'pb'].indexOf(m[3].toLowerCase()) + 1);
      return m[1] ? -v : v;
    }
    // ----- expressions
    function expression() { return logical(); }
    function binLoop(next, re) {
      let l = next();
      for (;;) {
        const save = p; skipWs();
        const m = s.slice(p).match(re);
        if (!m) { p = save; return l; }
        p += m[0].length; skipNl();
        if (p >= s.length) throw err("You must provide a value expression following the '" + m[0] + "' operator.", p, 1, true);
        l = { k: 'bin', op: m[0].toLowerCase(), l, r: next() };
      }
    }
    function logical() { return binLoop(comparison, /^-(and|or|xor)(?![\w-])/i); }
    function comparison() {
      let l = additive();
      for (;;) {
        const save = p; skipWs();
        const m = s.slice(p).match(CMP_RE);
        if (!m) { p = save; return l; }
        p += m[0].length; skipNl();
        if (p >= s.length) throw err("You must provide a value expression following the '" + m[0] + "' operator.", p, 1, true);
        l = { k: 'cmp', op: (m[2] || m[3]).toLowerCase(), cs: (m[1] || '').toLowerCase() === 'c', l, r: additive() };
      }
    }
    function additive() { return binLoop(multiplicative, /^(\+(?![+=])|-(?![A-Za-z=\-]))/); }
    function multiplicative() { return binLoop(format, /^([*\/%](?!=))/); }
    function format() { return binLoop(range, /^-f(?![\w-])/i); }
    function range() {
      const l = commaList(); const save = p; skipWs();
      if (s.startsWith('..', p) && s[p + 2] !== '.') { p += 2; skipWs(); return { k: 'range', l, r: commaList() }; }
      p = save; return l;
    }
    function commaList() {
      if (commaListOff) return unary();   // inside a method's ( ), a comma separates the arguments
      const items = [unary()];
      for (;;) { const save = p; skipWs(); if (s[p] === ',' ) { p++; skipNl(); items.push(unary()); } else { p = save; break; } }
      return items.length > 1 ? { k: 'list', items } : items[0];
    }
    function unary() {
      skipWs();
      const c = s[p];
      if (c === '!') { p++; return { k: 'not', e: unary() }; }
      if (c === '-' && /^-not(?![\w-])/i.test(s.slice(p))) { p += 4; skipWs(); return { k: 'not', e: unary() }; }
      const mj = c === '-' ? s.slice(p).match(/^-(split|join)(?![\w-])/i) : null;
      if (mj) { p += mj[0].length; skipWs(); return { k: 'unary', op: mj[1].toLowerCase(), e: unary() }; }
      if (c === '-' && s[p + 1] !== '-' && /[^A-Za-z]/.test(s[p + 1] || 'a')) { p++; return { k: 'neg', e: unary() }; }
      if (c === '-' && /[A-Za-z]/.test(s[p + 1] || '')) { const t = tokenAt(p); throw err("Unexpected token '" + t + "' in expression or statement.", p, t.length); }
      if (c === '+' && s[p + 1] !== '+') { p++; return { k: 'pos', e: unary() }; }
      if (c === '[') {
        const m = s.slice(p).match(/^\[\s*([A-Za-z_][\w.]*(?:\[\])?)\s*\]/);
        if (m) {
          p += m[0].length;
          if (s.startsWith('::', p)) { p += 2; const n = s.slice(p).match(/^[A-Za-z_]\w*/); if (!n) throw err('Missing property name after the static member operator.', p, 1, p >= s.length); p += n[0].length; let call = null; if (s[p] === '(') call = callArgs(); return postfixOn({ k: 'static', type: m[1], name: n[0], call }); }
          const save = p; skipWs();
          if (p < s.length && !/[\s;|)}\],=]/.test(s[p]) && !CMP_RE.test(s.slice(p)) && !/^-(and|or|xor|f)(?![\w-])/i.test(s.slice(p)) && !/^[+*\/%]/.test(s[p])) return { k: 'cast', type: m[1], e: unary() };
          p = save; return { k: 'type', type: m[1] };
        }
      }
      return postfix();
    }
    function callArgs() {
      p++; skipNl(); const args = [];
      if (s[p] === ')') { p++; return args; }
      for (;;) { skipNl(); args.push(binLoopArg()); skipNl(); if (s[p] === ',') { p++; continue; } if (s[p] === ')') { p++; break; } throw err("Missing ')' in method call.", p, 1, p >= s.length); }
      return args;
    }
    function binLoopArg() { commaListOff++; try { return logical(); } finally { commaListOff--; } }
    function postfix() { return postfixOn(primary()); }
    function postfixOn(e) {
      for (;;) {
        if ((s[p] === '.' || (s[p] === '?' && s[p + 1] === '.')) && /[A-Za-z_]/.test(s[p + (s[p] === '?' ? 2 : 1)] || '')) {
          p += s[p] === '?' ? 2 : 1;
          const m = s.slice(p).match(/^[A-Za-z_]\w*/); p += m[0].length;
          e = s[p] === '(' ? { k: 'member', o: e, name: m[0], call: callArgs() } : { k: 'member', o: e, name: m[0] };
          continue;
        }
        if (s[p] === '[') { p++; skipNl(); const i = expression(); skipNl(); if (s[p] !== ']') throw err("Array index expression is missing or not valid.", p, 1, p >= s.length); p++; e = { k: 'index', o: e, i }; continue; }
        return e;
      }
    }
    function primary() {
      skipWs();
      const c = s[p], at = p;
      if (p >= s.length) throw err('You must provide a value expression.', p, 1, true);
      if (c === '(') { p++; skipNl(); if (s[p] === ')') { p++; return { k: 'paren', e: null }; } const inner = statement(); skipNl(); if (s[p] !== ')') throw err("Missing closing ')' in expression.", p, 1, p >= s.length); p++; return { k: 'paren', e: inner }; }
      if (c === '$' && s[p + 1] === '(') { p += 2; const b = stmts(')'); p++; return { k: 'sub', b }; }
      if (c === '@' && s[p + 1] === '(') { p += 2; const b = stmts(')'); p++; return { k: 'arr', b }; }
      if (c === '@' && s[p + 1] === '{') {
        p += 2; const entries = [];
        for (;;) {
          skipNl(); while (s[p] === ';') { p++; skipNl(); }
          if (p >= s.length) throw err("Missing closing '}' in statement block or type definition.", p, 1, true);
          if (s[p] === '}') { p++; break; }
          let key;
          if (s[p] === '"' || s[p] === "'") key = s[p] === '"' ? dq() : sq();
          else { const m = s.slice(p).match(/^[A-Za-z_][\w-]*|^\d+/); if (!m) throw err("Missing key before '=' in hash literal.", p, 1); p += m[0].length; key = { k: 'str', v: m[0] }; }
          skipWs(); if (s[p] !== '=') throw err("Missing '=' operator after key in hash literal.", p, 1, p >= s.length); p++; skipNl();
          entries.push([key, statement()]);
        }
        return { k: 'hash', entries };
      }
      if (c === '{') { p++; const b = stmts('}'); const text = s.slice(at + 1, p); p++; return { k: 'sb', b, text }; }
      if (c === '$') return variable();
      if (c === '"') return dq();
      if (c === "'") return sq();
      const n = s.slice(p).match(/^(0x[0-9a-f]+|\d+(\.\d+)?(e[+-]?\d+)?|\.\d+(e[+-]?\d+)?)(kb|mb|gb|tb|pb)?(?![\w.]|\.\d)/i) || s.slice(p).match(/^\d+(?=\.\.)/);
      if (n) { p += n[0].length; return { k: 'num', v: numVal(n[0]) }; }
      const t = tokenAt(p); throw err("Unexpected token '" + t + "' in expression or statement.", p, t.length);
    }
    const tree = stmts(null);
    return tree;
  }
  function parseErrorText(e, src) {
    const lines = src.split('\n'); let pos = e.pos, ln = 0;
    while (ln < lines.length - 1 && pos > lines[ln].length) { pos -= lines[ln].length + 1; ln++; }
    const text = lines[ln] || '', len = Math.max(1, Math.min(e.len, text.length - pos || 1));
    return 'ParserError: \nLine |\n' + String(ln + 1).padStart(4) + ' |  ' + text + '\n     |  ' + ' '.repeat(Math.max(0, pos)) + '~'.repeat(len) + '\n     | ' + e.msg + '\n';
  }

  /* ---------------- values ---------------- */
  // A file or directory: { $t:'item', it }. Objects: { $t:'obj', type, props: [[name, value]...], view?, str? } (PSCustomObject, PathInfo,
  // measure results, command information). { $t:'match' } (Select-String), { $t:'date', ms }, { $t:'sb', b, text } (a script block),
  // { $t:'hash', keys, map } (a hashtable: map is a null-prototype dictionary of lower-case keys), { $t:'err', text } (an error in the output).
  const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
  const mkObj = (type, props, extra) => Object.assign({ $t: 'obj', type, props }, extra || {});
  const typeName = (v) => v === null || v === undefined ? 'null' : typeof v === 'string' ? 'System.String' : typeof v === 'number' ? (Number.isInteger(v) && Math.abs(v) < 2147483648 ? 'System.Int32' : Number.isInteger(v) ? 'System.Int64' : 'System.Double') : typeof v === 'boolean' ? 'System.Boolean'
    : Array.isArray(v) ? 'System.Object[]' : v.$t === 'item' ? (v.it.dir ? 'System.IO.DirectoryInfo' : 'System.IO.FileInfo') : v.$t === 'date' ? 'System.DateTime' : v.$t === 'sb' ? 'System.Management.Automation.ScriptBlock'
      : v.$t === 'hash' ? 'System.Collections.Hashtable' : v.$t === 'match' ? 'Microsoft.PowerShell.Commands.MatchInfo' : v.type === 'PSCustomObject' ? 'System.Management.Automation.PSCustomObject' : 'System.Object';
  function fmtNum(n) {
    if (!isFinite(n)) return isNaN(n) ? 'NaN' : n > 0 ? '∞' : '-∞';
    if (Object.is(n, -0)) return '0';
    if (Number.isInteger(n) && Math.abs(n) < 1e15) return String(n);
    const a = Math.abs(n);
    if (a >= 1e15 || a < 1e-4) { const [m, e] = Number(n.toPrecision(15)).toExponential().split('e'); const ex = Number(e); return m.toUpperCase() + 'E' + (ex < 0 ? '-' : '+') + String(Math.abs(ex)).padStart(2, '0'); }
    return String(Number(n.toPrecision(15)));
  }
  function toStr(v, P) {
    if (v === null || v === undefined) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return fmtNum(v);
    if (typeof v === 'boolean') return v ? 'True' : 'False';
    if (Array.isArray(v)) return v.map((x) => toStr(x, P)).join(' ');
    switch (v.$t) {
      case 'item': return v.it.win;
      case 'date': return psDateTime(v.ms);
      case 'sb': return v.text;
      case 'hash': return 'System.Collections.Hashtable';
      case 'match': return matchText(v, P);
      case 'err': return v.text;
      case 'obj': if (v.str !== undefined) return v.str; return '@{' + v.props.map(([k, x]) => k + '=' + toStr(x, P)).join('; ') + '}';
    }
    return String(v);
  }
  const matchText = (m, P) => (m.it ? (P ? P.rel(m.it) : m.it.win) + ':' + m.num + ':' : '') + m.line;
  function truthy(v) {
    if (v === null || v === undefined) return false;
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v !== 0;
    if (typeof v === 'string') return v.length > 0;
    if (Array.isArray(v)) return v.length === 0 ? false : v.length === 1 ? truthy(v[0]) : true;
    return true;
  }
  function toNum(v, target) {
    if (typeof v === 'number') return v;
    if (v === null || v === undefined) return 0;
    if (typeof v === 'boolean') return v ? 1 : 0;
    const t = toStr(v).trim();
    if (/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(t)) return Number(t);
    if (/^0x[0-9a-f]+$/i.test(t)) return parseInt(t, 16);
    if (t === '') return 0;
    throw new PsError('Cannot convert value "' + toStr(v) + '" to type "' + (target || 'System.Int32') + '". Error: "The input string \'' + toStr(v) + '\' was not in a correct format."', 'InvalidArgument');
  }
  // the parts of an item, a match, a date: what $_.Name and Select-Object read
  const ITEM_PROPS = ['Name', 'FullName', 'Length', 'Extension', 'BaseName', 'LastWriteTime', 'CreationTime', 'LastAccessTime', 'Mode', 'PSIsContainer', 'Exists', 'DirectoryName', 'Directory', 'Parent', 'Attributes', 'PSPath', 'PSParentPath', 'PSChildName'];
  function getProp(v, name, P) {
    if (v === null || v === undefined) return null;
    const lo = String(name).toLowerCase();
    if (Array.isArray(v)) { if (lo === 'count' || lo === 'length') return v.length; const out = []; for (const x of v) { const r = getProp(x, name, P); if (r !== null && r !== undefined) { if (Array.isArray(r)) out.push(...r); else out.push(r); } } return out.length === 0 ? null : out.length === 1 ? out[0] : out; }
    if (typeof v === 'string') return lo === 'length' ? v.length : null;
    if (typeof v !== 'object') return null;
    switch (v.$t) {
      case 'item': {
        const it = v.it, nm = it.name || it.win;
        const dot = nm.lastIndexOf('.'), ext = dot > 0 || (dot === 0 && !it.dir) ? nm.slice(dot) : '';
        const parent = it.comps.length ? P.walk(it.comps.slice(0, -1)) : null;
        switch (lo) {
          case 'name': case 'pschildname': return nm; case 'fullname': return it.win; case 'length': return it.dir ? null : sizeOf(it);
          case 'extension': return it.dir && dot <= 0 ? '' : ext; case 'basename': return it.dir ? nm : (ext ? nm.slice(0, -ext.length) : nm);
          case 'lastwritetime': case 'creationtime': case 'lastaccesstime': return { $t: 'date', ms: it.node.m };
          case 'mode': return it.dir ? 'd----' : '-a---'; case 'psiscontainer': return it.dir; case 'exists': return true;
          case 'directoryname': return it.dir ? null : parent ? parent.win : null; case 'directory': return it.dir || !parent ? null : { $t: 'item', it: parent };
          case 'parent': return it.dir && parent ? { $t: 'item', it: parent } : null; case 'attributes': return it.dir ? 'Directory' : 'Archive';
          case 'pspath': return 'Microsoft.PowerShell.Core\\FileSystem::' + it.win; case 'psparentpath': return parent ? 'Microsoft.PowerShell.Core\\FileSystem::' + parent.win : '';
        }
        return null;
      }
      case 'match': return { line: v.line, linenumber: v.num, path: v.it ? v.it.win : 'InputStream', filename: v.it ? v.it.name : 'InputStream', pattern: v.pattern }[lo] === undefined ? null : { line: v.line, linenumber: v.num, path: v.it ? v.it.win : 'InputStream', filename: v.it ? v.it.name : 'InputStream', pattern: v.pattern }[lo];
      case 'date': { const d = new Date(v.ms); const t = { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(), hour: d.getHours(), minute: d.getMinutes(), second: d.getSeconds(), dayofweek: DAYS[d.getDay()], dayofyear: Math.floor((v.ms - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000) }; return has(t, lo) ? t[lo] : null; }
      case 'hash': return has(v.map, lo) ? v.map[lo].v : lo === 'count' ? v.keys.length : lo === 'keys' ? v.keys.slice() : lo === 'values' ? v.keys.map((k) => v.map[k.toLowerCase()].v) : null;
      case 'obj': { const e = v.props.find(([k]) => k.toLowerCase() === lo); return e ? e[1] : null; }
      case 'err': return null;
    }
    return null;
  }
  const propNames = (v) => (v && v.$t === 'item' ? (v.it.dir ? ITEM_PROPS.filter((n) => !['Length', 'DirectoryName', 'Directory'].includes(n)) : ITEM_PROPS.filter((n) => n !== 'Parent')) : v && v.$t === 'obj' ? v.props.map((x) => x[0]) : v && v.$t === 'match' ? ['LineNumber', 'Line', 'Path', 'Filename', 'Pattern'] : []);
  function callMethod(v, name, args, P) {
    const lo = name.toLowerCase();
    if (v === null || v === undefined) throw new PsError('You cannot call a method on a null-valued expression.');
    const s = (i) => toStr(args[i], P), n = (i) => toNum(args[i]);
    const nargs = (k) => { if (args.length !== k) throw new PsError('Cannot find an overload for "' + name + '" and the argument count: "' + args.length + '".', 'MethodException'); };
    if (lo === 'tostring' && !args.length) return toStr(v, P);
    if (lo === 'equals') return looseEq(v, args[0], false);
    if (typeof v === 'string') {
      switch (lo) {
        case 'toupper': case 'toupperinvariant': return v.toUpperCase(); case 'tolower': case 'tolowerinvariant': return v.toLowerCase();
        case 'trim': return args.length ? v.replace(new RegExp('^[' + esc(s(0)) + ']+|[' + esc(s(0)) + ']+$', 'g'), '') : v.trim();
        case 'trimstart': return args.length ? v.replace(new RegExp('^[' + esc(s(0)) + ']+'), '') : v.replace(/^\s+/, ''); case 'trimend': return args.length ? v.replace(new RegExp('[' + esc(s(0)) + ']+$'), '') : v.replace(/\s+$/, '');
        case 'replace': nargs(2); { const a = s(0); if (!a) throw new PsError('Exception calling "Replace" with "2" argument(s): "String cannot be of zero length. (Parameter \'oldValue\')"', 'MethodInvocationException'); return v.split(a).join(s(1)); }
        case 'contains': nargs(1); return v.includes(s(0)); case 'startswith': nargs(1); return v.startsWith(s(0)); case 'endswith': nargs(1); return v.endsWith(s(0));
        case 'indexof': return v.indexOf(s(0)); case 'lastindexof': return v.lastIndexOf(s(0));
        case 'substring': { const a = n(0), b = args.length > 1 ? n(1) : v.length - a; if (a < 0 || a > v.length || b < 0 || a + b > v.length) throw new PsError('Exception calling "Substring" with "' + args.length + '" argument(s): "' + (a > v.length ? 'startIndex cannot be larger than length of string.' : 'Index and length must refer to a location within the string.') + ' (Parameter \'' + (a > v.length || a < 0 ? 'startIndex' : 'length') + '\')"', 'MethodInvocationException'); return v.substr(a, b); }
        case 'split': { if (!args.length) return v.split(/\s/); const seps = args.map((x) => toStr(x, P)).join(''); return seps.length === 1 || args.length === 1 && Array.isArray(args[0]) === false && seps.length >= 1 ? v.split(new RegExp('[' + esc(seps) + ']')) : v.split(seps); }
        case 'padleft': return v.padStart(n(0), args.length > 1 ? s(1) : ' '); case 'padright': return v.padEnd(n(0), args.length > 1 ? s(1) : ' ');
        case 'insert': return v.slice(0, n(0)) + s(1) + v.slice(n(0)); case 'remove': return args.length > 1 ? v.slice(0, n(0)) + v.slice(n(0) + n(1)) : v.slice(0, n(0));
        case 'tochararray': return v.split(''); case 'gettype': break;
      }
    }
    if (v.$t === 'date') { if (lo === 'adddays') return { $t: 'date', ms: v.ms + n(0) * 86400000 }; if (lo === 'addhours') return { $t: 'date', ms: v.ms + n(0) * 3600000 }; if (lo === 'tostring') return dateFormat(v.ms, s(0)); }
    if (Array.isArray(v) && lo === 'contains') return v.some((x) => looseEq(x, args[0], true));
    throw new PsError('Method invocation failed because [' + typeName(v) + '] does not contain a method named \'' + name + '\'.', 'InvalidOperation');
  }
  const esc = (t) => t.replace(/[.*+?^${}()|[\]\\\/-]/g, '\\$&');
  function dateFormat(ms, f) {
    const d = new Date(ms);
    return String(f).replace(/yyyy|yy|MMMM|MMM|MM|M|dddd|ddd|dd|d|HH|H|hh|h|mm|m|ss|s|tt/g, (t) => ({ yyyy: d.getFullYear(), yy: two(d.getFullYear() % 100), MMMM: MONTHS[d.getMonth()], MMM: MONTHS[d.getMonth()].slice(0, 3), MM: two(d.getMonth() + 1), M: d.getMonth() + 1,
      dddd: DAYS[d.getDay()], ddd: DAYS[d.getDay()].slice(0, 3), dd: two(d.getDate()), d: d.getDate(), HH: two(d.getHours()), H: d.getHours(), hh: two(h12(d)), h: h12(d), mm: two(d.getMinutes()), m: d.getMinutes(), ss: two(d.getSeconds()), s: d.getSeconds(), tt: ampm(d) })[t]);
  }
  // comparisons: the left side decides the type, as in PowerShell; text ignores case unless the operator starts with c
  function looseEq(a, b, ci) {
    if (a === null || a === undefined) return b === null || b === undefined;
    if (typeof a === 'number') { if (b === null || b === undefined) return false; try { return a === toNum(b); } catch (e) { return false; } }
    if (typeof a === 'boolean') return a === truthy(b);
    if (typeof a === 'string') { const t = toStr(b); return ci ? a.toLowerCase() === t.toLowerCase() : a === t; }
    if (a.$t === 'date' && b && b.$t === 'date') return a.ms === b.ms;
    if (isObj(a) && isObj(b)) return a === b || (a.$t === 'item' && b.$t === 'item' && a.it.win === b.it.win);
    return toStr(a) === toStr(b);
  }
  function compare(a, b, ci) {
    if (a === null || a === undefined) return b === null || b === undefined ? 0 : -1;
    if (b === null || b === undefined) return 1;
    if (typeof a === 'number') { let y; try { y = toNum(b); } catch (e) { y = NaN; } if (isNaN(y)) { const t = toStr(b); return compareText(fmtNum(a), t, ci); } return a < y ? -1 : a > y ? 1 : 0; }
    if (a.$t === 'date' && b && b.$t === 'date') return a.ms < b.ms ? -1 : a.ms > b.ms ? 1 : 0;
    if (typeof a === 'boolean') { const y = truthy(b); return a === y ? 0 : a ? 1 : -1; }
    return compareText(toStr(a), toStr(b), ci);
  }
  // en-US text order: letters ignoring case first, then lower case before upper (a, A, b, B), as .NET's culture comparison does
  function compareText(x, y, ci) {
    const X = x.toLowerCase(), Y = y.toLowerCase();
    if (X !== Y) { const c = X.localeCompare(Y, 'en-US'); if (c) return c; return X < Y ? -1 : 1; }
    if (ci === true) return 0;
    for (let i = 0; i < Math.min(x.length, y.length); i++) if (x[i] !== y[i]) return x[i] === x[i].toLowerCase() ? -1 : 1;
    return x.length - y.length;
  }
  function likeRe(pat, cs) { const r = wildRe(pat, true); return new RegExp(r.source, cs ? 's' : 'is'); }
  function psRegex(pat, cs) {
    let src = toStr(pat);
    src = src.replace(/\(\?<([A-Za-z]\w*)>/g, '(?<$1>').replace(/\\A/g, '^').replace(/\\Z|\\z/g, '$');
    try { return new RegExp(src, cs ? '' : 'i'); }
    catch (e) { throw new PsError('The regular expression pattern ' + src + ' is not valid.', 'InvalidOperation'); }
  }
  function mkHash(pairs) { const h = { $t: 'hash', keys: [], map: dict() }; for (const [k, v] of pairs) hashSet(h, k, v); return h; }
  function hashSet(h, k, v) { const ks = toStr(k), lo = ks.toLowerCase(); if (!has(h.map, lo)) { if (h.keys.length >= 10000) throw new WinStop('items', 1); h.keys.push(ks); } h.map[lo] = { k: ks, v }; }

  /* ---------------- formatting the output (Out-Default), at a width of 120 columns ---------------- */
  const FS_HEAD = 'Mode'.padEnd(7) + ' ' + 'LastWriteTime'.padStart(26) + ' ' + 'Length'.padStart(14) + ' Name\n' + '----'.padEnd(7) + ' ' + '-------------'.padStart(26) + ' ' + '------'.padStart(14) + ' ----\n';
  const fsRow = (it) => (it.dir ? 'd----' : '-a---').padEnd(7) + ' ' + psLWT(it.node.m).padStart(26) + ' ' + (it.dir ? '' : String(sizeOf(it))).padStart(14) + ' ' + it.name;
  const CMD_HEAD = 'CommandType     Name                                               Version    Source\n-----------     ----                                               -------    ------\n';
  function cell(v, P) {
    if (v === null || v === undefined) return '';
    if (Array.isArray(v)) { const sh = v.slice(0, 4).map((x) => cell(x, P)); return '{' + sh.join(', ') + (v.length > 4 ? '…' : '') + '}'; }
    if (v.$t === 'date') return psDateTime(v.ms);
    if (v.$t === 'item') return v.it.win;
    return toStr(v, P);
  }
  function shapeOf(v) {
    if (v === null || v === undefined) return null;
    if (typeof v !== 'object' || Array.isArray(v)) return 'text';
    switch (v.$t) {
      case 'item': return 'items'; case 'match': return 'match'; case 'date': return 'date'; case 'hash': return 'hash'; case 'sb': case 'err': return 'text';
      case 'obj': if (v.view === 'command') return 'command'; if (v.view === 'list' || (v.props.length >= 5 && v.view !== 'table')) return 'list:' + v.type + (v.group !== undefined ? ':g' : ''); return 'table:' + v.type + ':' + v.props.map((x) => x[0]).join(',');
    }
    return 'text';
  }
  function makeFormatter(P, write, opt) {
    let shape = null, group = null, buf = [];
    const close = () => {
      if (shape === 'items' || shape === 'match' || shape === 'date' || shape === 'command' || shape === 'hash') write('\n');
      else if (shape && shape.startsWith('table:')) writeTable(buf);
      shape = null; group = null; buf = [];
    };
    const writeTable = (objs) => {
      if (!objs.length) return;
      const names = objs[0].props.map((x) => x[0]), align = objs[0].align || {};
      const rows = objs.map((o) => names.map((n) => cell(getProp(o, n, P), P)));
      const right = names.map((n, i) => align[n] ? align[n] === 'r' : typeof objs[0].props[i][1] === 'number');
      const w = objs[0].widths ? objs[0].widths.slice() : names.map((n, i) => Math.max(n.length, ...rows.map((r) => r[i].length)));
      let total = w.reduce((a, b) => a + b, 0) + w.length - 1;
      if (total > WIDTH) { const over = total - WIDTH; w[w.length - 1] = Math.max(names[names.length - 1].length, w[w.length - 1] - over); total = WIDTH; }
      const fit = (t, i) => (t.length > w[i] ? t.slice(0, w[i] - 1) + '…' : t);
      const line = (cells) => cells.map((t, i) => { t = fit(t, i); return right[i] ? t.padStart(w[i]) : i < cells.length - 1 ? t.padEnd(w[i]) : t; }).join(' ');
      write('\n' + line(names) + '\n' + line(names.map((n) => '-'.repeat(n.length))) + '\n' + rows.map(line).join('\n') + '\n\n');
    };
    const one = (v) => {
      const sh = shapeOf(v);
      if (sh === null) return;
      if (sh !== shape) { close(); shape = sh; if (sh === 'match' || sh === 'date') write('\n'); if (sh === 'command') write('\n' + CMD_HEAD); if (sh === 'hash') { /* each hashtable writes its own header */ } }
      if (sh === 'text') { write((v && v.$t === 'err' ? v.text : toStr(v, P)) + '\n'); return; }
      if (sh === 'items') { const g = v.it.comps.slice(0, -1).join('\\'); if (g !== group) { group = g; write('\n    Directory: ' + P.winOf(v.it.comps.slice(0, -1)) + '\n\n' + FS_HEAD); } write(fsRow(v.it) + '\n'); return; }
      if (sh === 'match') { write(matchText(v, P) + '\n'); return; }
      if (sh === 'date') { write(psLongDate(v.ms) + '\n'); return; }
      if (sh === 'command') { const f = (t, w) => (t.length > w ? t.slice(0, w - 1) + '…' : t.padEnd(w)); const src = v.props[3][1], room = WIDTH - 79; write(f(v.props[0][1], 15) + ' ' + f(v.props[1][1], 50) + ' ' + f(v.props[2][1], 10) + ' ' + (src.length > room ? src.slice(0, room - 1) + '…' : src) + '\n'); return; }
      if (sh === 'hash') { const nw = Math.max(30, ...v.keys.map((k) => k.length)); write('\n' + 'Name'.padEnd(nw) + ' Value\n' + '----'.padEnd(nw) + ' -----\n'); for (const k of v.keys) { const val = cell(v.map[k.toLowerCase()].v, P); write(k.padEnd(nw) + ' ' + (val.length > WIDTH - nw - 1 ? val.slice(0, WIDTH - nw - 2) + '…' : val) + '\n'); } return; }
      if (sh.startsWith('list:')) {
        const nw = Math.max(...v.props.map((x) => x[0].length));
        if (v.group !== undefined) { if (v.group !== group) { group = v.group; write('\n    Directory: ' + group + '\n\n'); } }   // Format-List of files: grouped by folder
        else if (group === null) { write('\n'); group = 'list'; }
        write(v.props.map(([k, x]) => k.padEnd(nw) + ' : ' + cell(x, P).split('\n').join('\n' + ' '.repeat(nw + 3))).join('\n') + '\n\n'); return;
      }
      buf.push(v);
    };
    return {
      write(v) { if (Array.isArray(v)) { for (const x of v) this.write(x); return; } one(v); },
      end() { close(); },
      pending() { return shape !== null; }
    };
  }
  /** objects → the text Out-Default (or Out-File, Out-String, >) would show */
  function formatText(P, objs) { let out = ''; const f = makeFormatter(P, (s) => { out += s; if (out.length > LIMITS.out) throw new WinStop('output', 1); }); for (const o of objs) f.write(o); f.end(); return out; }

  /* ---------------- running PowerShell ---------------- */
  function PsReturn() { }
  const capStr = (s) => { if (s.length > LIMITS.vars * 4) throw new WinStop('size', 1); return s; };
  const capArr = (a) => { if (a.length > MAX_ITEMS) throw new WinStop('items', 1); return a; };
  const enumerate = (v) => (v === null || v === undefined ? [] : Array.isArray(v) ? v : [v]);
  const collapse = (a) => (a.length === 0 ? null : a.length === 1 ? a[0] : a);
  const pathInfo = (p) => mkObj('PathInfo', [['Path', p]], { str: p });
  const PSVT = () => mkHash([['PSVersion', mkObj('Version', [['Major', 7], ['Minor', 4], ['Patch', 6], ['PreReleaseLabel', null], ['BuildLabel', null]], { str: PS_VER, view: 'table', widths: [6, 6, 6, 15, 10], align: { Major: 'l', Minor: 'l', Patch: 'l' } })], ['PSEdition', 'Core'], ['GitCommitId', PS_VER],
    ['OS', 'Microsoft Windows ' + WIN_VER.split('.').slice(0, 3).join('.')], ['Platform', 'Win32NT'], ['PSCompatibleVersions', ['1.0', '2.0', '3.0', '4.0', '5.0', '5.1', '6.0', '7.0']], ['PSRemotingProtocolVersion', '2.3'], ['SerializationVersion', '1.1.0.1'], ['WSManStackVersion', '3.0']]);
  function getVar(ctx, n) {
    const st = ctx.st;
    if (n.env) return envGet(st.env, n.name);
    const lo = n.name.toLowerCase();
    switch (lo) {
      case 'true': return true; case 'false': return false; case 'null': return null;
      case '_': case 'psitem': return ctx.under.length ? ctx.under[ctx.under.length - 1] : null;
      case '?': return st.ok; case 'lastexitcode': return st.lastExit;
      case 'home': return 'C:\\Users\\' + USER; case 'pwd': return pathInfo(ctx.P.cwdWin());
      case 'psversiontable': return PSVT(); case 'pid': return 4242; case 'pshome': return 'C:\\Program Files\\PowerShell\\7';
      case 'args': return ctx.args || [];
    }
    return has(st.vars, lo) ? st.vars[lo] : null;
  }
  const READ_ONLY = ['true', 'false', '?', 'home', 'pwd', 'psversiontable', 'pid', 'pshome', '_', 'psitem'];
  async function assign(ctx, t, op, value) {
    const st = ctx.st, lo = t.name.toLowerCase();
    if (t.env) { const cur = envGet(st.env, t.name); const v = op === '=' ? value : arith(op[0], cur, value); envSet(st.env, t.name, v === null || v === undefined ? null : toStr(v, ctx.P)); return; }
    if (lo === 'null' && !t.path.length) return;
    if (READ_ONLY.includes(lo)) throw new PsError('Cannot overwrite variable ' + t.name + ' because it is read-only or constant.', 'WriteError');
    if (!t.path.length) {
      const cur = has(st.vars, lo) ? st.vars[lo] : null;
      const v = op === '=' ? value : arith(op[0], cur, value);
      if (!has(st.vars, lo) && Object.keys(st.vars).length >= 1000) throw new WinStop('items', 1);
      if (lo === 'lastexitcode') st.lastExit = v; else st.vars[lo] = v;
      return;
    }
    let obj = getVar(ctx, { name: t.name });
    for (let i = 0; i < t.path.length - 1; i++) { const s = t.path[i]; obj = s.member ? getProp(obj, s.member, ctx.P) : indexOf(obj, await ev(ctx, s.index)); }
    const last = t.path[t.path.length - 1];
    if (last.member) {
      if (obj && obj.$t === 'hash') { const cur = getProp(obj, last.member, ctx.P); hashSet(obj, last.member, op === '=' ? value : arith(op[0], cur, value)); return; }
      if (obj && obj.$t === 'obj' && obj.type === 'PSCustomObject') { const e = obj.props.find(([k]) => k.toLowerCase() === last.member.toLowerCase()); if (e) { e[1] = op === '=' ? value : arith(op[0], e[1], value); return; } }
      throw new PsError("The property '" + last.member + "' cannot be found on this object. Verify that the property exists and can be set.", 'InvalidOperation');
    }
    const idx = await ev(ctx, last.index);
    if (obj && obj.$t === 'hash') { const cur = getProp(obj, toStr(idx), ctx.P); hashSet(obj, idx, op === '=' ? value : arith(op[0], cur, value)); return; }
    if (Array.isArray(obj)) { let i = toNum(idx); if (i < 0) i += obj.length; if (i < 0 || i >= obj.length) throw new PsError('Index was outside the bounds of the array.', 'OperationStopped'); obj[i] = op === '=' ? value : arith(op[0], obj[i], value); return; }
    if (obj === null) throw new PsError('Cannot index into a null array.', 'InvalidOperation');
    throw new PsError('Unable to index into an object of type ' + typeName(obj) + '.', 'InvalidOperation');
  }
  function arith(op, a, b) {
    const nt = (x) => (typeof x === 'number' && !Number.isInteger(x) ? 'System.Double' : 'System.Int32');
    const noOp = (name) => new PsError("Method invocation failed because [" + typeName(a) + "] does not contain a method named '" + name + "'.", 'InvalidOperation');
    if (op === '+') {
      if (a === null || a === undefined) return Array.isArray(b) ? b.slice() : b;
      if (Array.isArray(a)) return capArr(a.concat(Array.isArray(b) ? b : [b]));
      if (typeof a === 'string') return capStr(a + toStr(b));
      if (typeof a === 'number') { if (Array.isArray(b)) throw noOp('op_Addition'); return a + toNum(b, nt(a)); }
      if (a.$t === 'hash' && b && b.$t === 'hash') { const h = mkHash(a.keys.map((k) => [k, a.map[k.toLowerCase()].v])); for (const k of b.keys) { if (has(h.map, k.toLowerCase())) throw new PsError("Item has already been added. Key in dictionary: '" + k + "'  Key being added: '" + k + "'", 'OperationStopped'); hashSet(h, k, b.map[k.toLowerCase()].v); } return h; }
      throw noOp('op_Addition');
    }
    if (a === null || a === undefined) a = 0;
    if (op === '*') {
      if (typeof a === 'string') { const n = toNum(b); if (n * a.length > LIMITS.vars * 4) throw new WinStop('size', 1); return a.repeat(Math.max(0, Math.round(n))); }
      if (Array.isArray(a)) { const n = Math.max(0, Math.round(toNum(b))); if (n * a.length > MAX_ITEMS) throw new WinStop('items', 1); let r = []; for (let i = 0; i < n; i++) r = r.concat(a); return r; }
    }
    if (typeof a !== 'number') { if (typeof a === 'string' || isObj(a) || Array.isArray(a)) throw noOp({ '-': 'op_Subtraction', '*': 'op_Multiply', '/': 'op_Division', '%': 'op_Modulus' }[op]); a = toNum(a); }
    const y = toNum(b, nt(a));
    switch (op) {
      case '-': return a - y; case '*': return a * y;
      case '/': if (y === 0) throw new PsError('Attempted to divide by zero.', 'RuntimeException'); return a / y;
      case '%': if (y === 0) throw new PsError('Attempted to divide by zero.', 'RuntimeException'); return a % y;
    }
    return null;
  }
  function indexOf(obj, idx) {
    if (obj === null || obj === undefined) throw new PsError('Cannot index into a null array.', 'InvalidOperation');
    if (Array.isArray(idx)) return idx.map((i) => indexOf(obj, i)).filter((x) => x !== null && x !== undefined);
    if (obj.$t === 'hash') return getProp(obj, toStr(idx), null);
    if (typeof obj === 'string' || Array.isArray(obj)) { let i = Math.trunc(toNum(idx)); if (i < 0) i += obj.length; return i >= 0 && i < obj.length ? obj[i] : null; }
    if (isObj(obj) && Number(toNum(idx)) === 0) return obj;
    return null;
  }
  const roundEven = (x) => { const r = Math.round(x); return Math.abs(x % 1) === 0.5 && r % 2 !== 0 ? r - 1 : r; };
  function cast(type, v) {
    const t = type.toLowerCase().replace(/^system\./, '');
    const bad = (to) => new PsError('Cannot convert value "' + toStr(v) + '" to type "' + to + '". Error: "The input string \'' + toStr(v) + '\' was not in a correct format."', 'InvalidArgument');
    switch (t) {
      case 'int': case 'int32': case 'long': case 'int64': { if (Array.isArray(v)) throw new PsError('Cannot convert the "System.Object[]" value of type "System.Object[]" to type "System.Int32".', 'InvalidArgument'); let n; try { n = toNum(v); } catch (e) { throw bad(t === 'long' || t === 'int64' ? 'System.Int64' : 'System.Int32'); } return roundEven(n); }
      case 'double': case 'float': case 'single': case 'decimal': try { return toNum(v); } catch (e) { throw bad('System.Double'); }
      case 'string': return v === null ? '' : toStr(v);
      case 'bool': case 'boolean': return truthy(v);
      case 'char': { if (typeof v === 'number') return String.fromCharCode(v); const s = toStr(v); if (s.length !== 1) throw new PsError('Cannot convert value "' + s + '" to type "System.Char". Error: "String must be exactly one character long."', 'InvalidArgument'); return s; }
      case 'array': case 'object[]': return enumerate(v).slice();
      case 'int[]': return enumerate(v).map((x) => cast('int', x));
      case 'string[]': return enumerate(v).map((x) => toStr(x));
      case 'datetime': { const ms = Date.parse(toStr(v)); if (isNaN(ms)) throw new PsError('Cannot convert value "' + toStr(v) + '" to type "System.DateTime". Error: "String \'' + toStr(v) + '\' was not recognized as a valid DateTime."', 'InvalidArgument'); return { $t: 'date', ms }; }
      case 'pscustomobject': if (v && v.$t === 'hash') return mkObj('PSCustomObject', v.keys.map((k) => [k, v.map[k.toLowerCase()].v])); return v;
      case 'hashtable': if (v && v.$t === 'hash') return v; break;
    }
    throw new PsError('Unable to find type [' + type + '].', 'InvalidOperation');
  }
  function staticMember(ctx, type, name, args) {
    const t = type.toLowerCase().replace(/^system\./, ''), lo = name.toLowerCase(), n = (i) => toNum(args[i]);
    if (t === 'math') {
      const fns = { abs: Math.abs, sqrt: Math.sqrt, floor: Math.floor, ceiling: Math.ceil, truncate: Math.trunc, pow: Math.pow, max: Math.max, min: Math.min, sin: Math.sin, cos: Math.cos, tan: Math.tan, log: Math.log, log10: Math.log10, exp: Math.exp };
      if (lo === 'pi') return Math.PI; if (lo === 'e') return Math.E;
      if (lo === 'round') { const d = args.length > 1 ? n(1) : 0, f = Math.pow(10, d); return roundEven(Number((n(0) * f).toPrecision(15))) / f; }
      if (args && has(fns, lo)) return fns[lo](...args.map((x) => toNum(x)));
      throw new PsError("Method invocation failed because [System.Math] does not contain a method named '" + name + "'.", 'InvalidOperation');
    }
    if (t === 'string') {
      if (lo === 'empty') return '';
      if (lo === 'join') return enumerate(args[1]).concat(args.slice(2)).map((x) => toStr(x, ctx.P)).join(toStr(args[0]));
      if (lo === 'isnullorempty') return args[0] === null || toStr(args[0]) === '';
      if (lo === 'isnullorwhitespace') return args[0] === null || toStr(args[0]).trim() === '';
      if (lo === 'concat') return args.map((x) => toStr(x, ctx.P)).join('');
    }
    if ((t === 'int' || t === 'int32') && lo === 'maxvalue') return 2147483647;
    if ((t === 'int' || t === 'int32') && lo === 'minvalue') return -2147483648;
    if (t === 'datetime' && (lo === 'now' || lo === 'today')) { const ms = nowOf(ctx.sh); if (lo === 'now') return { $t: 'date', ms }; const d = new Date(ms); d.setHours(0, 0, 0, 0); return { $t: 'date', ms: d.getTime() }; }
    if (t === 'environment' && lo === 'newline') return '\n';
    if (['math', 'string', 'int', 'int32', 'datetime', 'environment'].includes(t)) throw new PsError("Method invocation failed because [" + (t === 'math' ? 'System.Math' : 'System.' + type) + "] does not contain a method named '" + name + "'.", 'InvalidOperation');
    throw new PsError('Unable to find type [' + type + '].', 'InvalidOperation');
  }
  function formatOp(fmt, args) {
    args = enumerate(args);
    return String(fmt).replace(/\{\{|\}\}|\{(\d+)(?:,(-?\d+))?(?::([^}]*))?\}/g, (m, i, w, f) => {
      if (m === '{{') return '{'; if (m === '}}') return '}';
      const v = args[+i]; if (+i >= args.length) throw new PsError('Error formatting a string: Index (zero based) must be greater than or equal to zero and less than the size of the argument list..', 'FormatException');
      let s;
      const fm = f && f.match(/^([NnFfDdXxPpCc])(\d*)$/);
      if (fm && typeof v === 'number' || fm && /^[\d.]+$/.test(toStr(v))) {
        const x = toNum(v), d = fm[2] === '' ? null : +fm[2];
        switch (fm[1].toUpperCase()) {
          case 'N': s = x.toLocaleString('en-US', { minimumFractionDigits: d === null ? 2 : d, maximumFractionDigits: d === null ? 2 : d }); break;
          case 'F': s = x.toFixed(d === null ? 2 : d); break;
          case 'D': s = String(Math.abs(Math.trunc(x))).padStart(d || 0, '0'); if (x < 0) s = '-' + s; break;
          case 'X': s = Math.trunc(x).toString(16); s = (fm[1] === 'X' ? s.toUpperCase() : s).padStart(d || 0, '0'); break;
          case 'P': s = (x * 100).toLocaleString('en-US', { minimumFractionDigits: d === null ? 2 : d, maximumFractionDigits: d === null ? 2 : d }) + ' %'; break;
          case 'C': s = (x < 0 ? '-$' : '$') + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: d === null ? 2 : d, maximumFractionDigits: d === null ? 2 : d }); break;
        }
      } else if (f && v && v.$t === 'date') s = dateFormat(v.ms, f);
      else s = toStr(v);
      if (w) { const n = +w; s = n < 0 ? s.padEnd(-n) : s.padStart(n); }
      return s;
    });
  }
  function cmpOp(ctx, op, cs, a, b) {
    const ci = !cs;
    const scalar = (x) => {
      switch (op) {
        case 'eq': return looseEq(x, b, ci); case 'ne': return !looseEq(x, b, ci);
        case 'gt': return compare(x, b, ci) > 0; case 'ge': return compare(x, b, ci) >= 0; case 'lt': return compare(x, b, ci) < 0; case 'le': return compare(x, b, ci) <= 0;
        case 'like': return likeRe(toStr(b), cs).test(toStr(x, ctx.P)); case 'notlike': return !likeRe(toStr(b), cs).test(toStr(x, ctx.P));
        case 'match': case 'notmatch': { const m = toStr(x, ctx.P).match(psRegex(b, cs)); if (m && !Array.isArray(a)) { const pairs = []; m.forEach((g, k) => { if (g !== undefined) pairs.push([String(k), g]); }); if (m.groups) for (const k of Object.keys(m.groups)) if (m.groups[k] !== undefined) pairs.push([k, m.groups[k]]); ctx.st.vars.matches = mkHash(pairs.reverse()); } return op === 'match' ? !!m : !m; }
      }
      return false;
    };
    if (['eq', 'ne', 'gt', 'ge', 'lt', 'le', 'like', 'notlike', 'match', 'notmatch'].includes(op)) return Array.isArray(a) ? a.filter(scalar) : scalar(a);
    switch (op) {
      case 'contains': return enumerate(a).some((x) => looseEq(x, b, ci)); case 'notcontains': return !enumerate(a).some((x) => looseEq(x, b, ci));
      case 'in': return enumerate(b).some((x) => looseEq(x, a, ci)); case 'notin': return !enumerate(b).some((x) => looseEq(x, a, ci));
      case 'replace': {
        const [pat, rep] = Array.isArray(b) ? [b[0], b.length > 1 ? toStr(b[1]) : ''] : [b, ''];
        const re = psRegex(pat, cs); const g = new RegExp(re.source, re.flags + 'g');
        const r = rep.replace(/\$\{(\w+)\}/g, '$<$1>').replace(/\$0/g, '$$&');
        const one = (x) => capStr(toStr(x, ctx.P).replace(g, r));
        return Array.isArray(a) ? a.map(one) : one(a);
      }
      case 'split': {
        const [pat, max] = Array.isArray(b) ? [b[0], b.length > 1 ? toNum(b[1]) : 0] : [b, 0];
        const re = psRegex(pat, cs);
        const one = (x) => { const s = toStr(x, ctx.P); let parts = s.split(new RegExp(re.source, re.flags + 'g')); if (max > 0 && parts.length > max) { let k = 0, cut = 0; const g = new RegExp(re.source, re.flags + 'g'); let m; while (k < max - 1 && (m = g.exec(s))) { k++; cut = m.index + m[0].length; if (!m[0]) g.lastIndex++; } parts = parts.slice(0, max - 1).concat([s.slice(cut)]); } return parts; };
        return capArr(enumerate(a).flatMap(one));
      }
      case 'join': return capStr(enumerate(a).map((x) => toStr(x, ctx.P)).join(toStr(b)));
      case 'is': case 'isnot': { const tn = b && b.$t === 'obj' && b.type === 'RuntimeType' ? b.str : toStr(b); const map = { string: 'System.String', int: 'System.Int32', int32: 'System.Int32', double: 'System.Double', bool: 'System.Boolean', array: 'System.Object[]', hashtable: 'System.Collections.Hashtable', datetime: 'System.DateTime' }; const want = map[tn.toLowerCase()] || tn; const r = typeName(a).toLowerCase() === want.toLowerCase() || (want === 'System.Double' && typeof a === 'number'); return op === 'is' ? r : !r; }
      case 'as': { try { return cast(b && b.str ? b.str : toStr(b), a); } catch (e) { return null; } }
    }
    return null;
  }
  async function ev(ctx, n) {
    switch (n.k) {
      case 'num': return n.v;
      case 'str': return n.v;
      case 'xstr': { let s = ''; for (const part of n.parts) s += typeof part === 'string' ? part : toStr(await ev(ctx, part), ctx.P); return capStr(s); }
      case 'var': return getVar(ctx, n);
      case 'list': { const out = []; for (const it of n.items) out.push(await ev(ctx, it)); return capArr(out); }
      case 'paren': return n.e ? collapse(await collect(ctx, { k: 'stmts', list: [n.e] })) : null;
      case 'sub': return collapse(await collect(ctx, n.b));
      case 'arr': return await collect(ctx, n.b);
      case 'sb': return { $t: 'sb', b: n.b, text: n.text };
      case 'hash': { const h = mkHash([]); for (const [k, v] of n.entries) hashSet(h, await ev(ctx, k), collapse(await collect(ctx, { k: 'stmts', list: [v] }))); return h; }
      case 'bin': {
        if (n.op === '-and') return truthy(await ev(ctx, n.l)) ? truthy(await ev(ctx, n.r)) : false;
        if (n.op === '-or') return truthy(await ev(ctx, n.l)) ? true : truthy(await ev(ctx, n.r));
        const a = await ev(ctx, n.l), b = await ev(ctx, n.r);
        if (n.op === '-xor') return truthy(a) !== truthy(b);
        if (n.op === '-f') return capStr(formatOp(toStr(a), b));
        return arith(n.op, a, b);
      }
      case 'cmp': { const a = await ev(ctx, n.l), b = await ev(ctx, n.r); return cmpOp(ctx, n.op, n.cs, a, b); }
      case 'not': return !truthy(await ev(ctx, n.e));
      case 'neg': { const v = await ev(ctx, n.e); if (Array.isArray(v)) throw new PsError("Method invocation failed because [System.Object[]] does not contain a method named 'op_UnaryNegation'.", 'InvalidOperation'); return -toNum(v); }
      case 'pos': return toNum(await ev(ctx, n.e));
      case 'unary': { const v = await ev(ctx, n.e); return n.op === 'join' ? enumerate(v).map((x) => toStr(x, ctx.P)).join('') : capArr(enumerate(v).flatMap((x) => toStr(x, ctx.P).trim().split(/\s+/))); }
      case 'range': {
        const a = await ev(ctx, n.l), b = await ev(ctx, n.r);
        if (typeof a === 'string' && typeof b === 'string' && a.length === 1 && b.length === 1 && !/\d/.test(a + b)) { const x = a.charCodeAt(0), y = b.charCodeAt(0), out = []; for (let i = x; x <= y ? i <= y : i >= y; i += x <= y ? 1 : -1) out.push(String.fromCharCode(i)); return out; }
        const x = roundEven(toNum(a)), y = roundEven(toNum(b));
        if (Math.abs(y - x) + 1 > MAX_ITEMS) throw new WinStop('items', 1);
        const out = []; for (let i = x; x <= y ? i <= y : i >= y; i += x <= y ? 1 : -1) out.push(i); return out;
      }
      case 'member': {
        const o = await ev(ctx, n.o);
        if (n.call) { const args = []; for (const a of n.call) args.push(await ev(ctx, a)); if (Array.isArray(o) && !['contains', 'tostring', 'equals', 'gettype'].includes(n.name.toLowerCase())) return collapse(o.map((x) => callMethod(x, n.name, args, ctx.P))); return callMethod(o, n.name, args, ctx.P); }
        return getProp(o, n.name, ctx.P);
      }
      case 'index': return indexOf(await ev(ctx, n.o), await ev(ctx, n.i));
      case 'cast': return cast(n.type, await ev(ctx, n.e));
      case 'type': return mkObj('RuntimeType', [['Name', n.type]], { str: n.type });
      case 'static': { const args = []; if (n.call) for (const a of n.call) args.push(await ev(ctx, a)); return staticMember(ctx, n.type, n.name, n.call ? args : null); }
    }
    throw new PsError('Unexpected expression.', 'ParserError');
  }
  async function collect(ctx, b) { const out = []; await runStmts(ctx, b, (v) => { if (Array.isArray(v)) out.push(...v); else if (v !== null && v !== undefined) out.push(v); capArr(out); }); return out; }
  // an error: shown (or redirected), and the pipeline that wrote it has failed ($? is False after it)
  const writeErr = (ctx, text) => { ctx.st.ok = false; ctx.failed = true; ctx.err(text); };
  async function runStmts(ctx, b, emit) {
    for (const s of b.list) {
      try { await runStmt(ctx, s, emit); }
      catch (e) { if (!(e instanceof PsError) || (e.fatal && ctx.depth > 0)) throw e; writeErr(ctx, (e.cmd || e.cat) + ': ' + e.msg); }   // a call depth overflow ends everything up to the prompt
    }
  }
  async function runStmt(ctx, s, emit) {
    tick(ctx.st, ctx.sh);
    switch (s.k) {
      case 'if': for (const [c, body] of s.clauses) if (truthy(collapse(await collect(ctx, { k: 'stmts', list: [c] })))) return runStmts(ctx, body, emit); if (s.els) return runStmts(ctx, s.els, emit); return;
      case 'foreach': case 'while': case 'for': {
        const body = async () => { try { await runStmts(ctx, s.body, emit); } catch (e) { if (e instanceof PsBreak) return e.kind; throw e; } return null; };
        const test = async (c) => !c || truthy(collapse(await collect(ctx, { k: 'stmts', list: [c] })));
        if (s.k === 'foreach') { for (const x of enumerate(collapse(await collect(ctx, { k: 'stmts', list: [s.coll] })))) { tick(ctx.st, ctx.sh); ctx.st.vars[s.v.toLowerCase()] = x; if (await body() === 'break') break; } return; }
        if (s.k === 'for' && s.init) await collect(ctx, { k: 'stmts', list: [s.init] });
        while (await test(s.c)) { tick(ctx.st, ctx.sh); if (await body() === 'break') break; if (s.k === 'for' && s.step) await collect(ctx, { k: 'stmts', list: [s.step] }); }
        return;
      }
      case 'break': case 'continue': throw new PsBreak(s.k);
      case 'exit': { const v = s.v ? collapse(await collect(ctx, { k: 'stmts', list: [s.v] })) : null; throw new PsExit(v === null ? 0 : roundEven(toNum(v)) | 0); }
      case 'return': { if (s.v) for (const v of await collect(ctx, { k: 'stmts', list: [s.v] })) emit(v); throw new PsReturn(); }
      case 'function': { const lo = s.name.toLowerCase(); if (!has(ctx.st.funcs, lo) && Object.keys(ctx.st.funcs).length >= 200) throw new WinStop('items', 1); ctx.st.funcs[lo] = s; return; }
      case 'assign': { const v = collapse(await collect(ctx, { k: 'stmts', list: [s.v] })); await assign(ctx, s.target, s.op, v); return; }
      case 'chain': { let ok = true; for (const it of s.items) { if (it.op === '&&' && !ok) continue; if (it.op === '||' && ok) continue; await runPipe(ctx, it.pipe, emit); ok = ctx.st.ok; } return; }
      case 'pipe': return runPipe(ctx, s, emit);
    }
  }
  // redirections of one element: > >> 2> 2>> *> to a file or $null, 2>&1
  async function openRedirs(ctx, redirs) {
    const r = { out: null, err: null, close: async () => { } };
    if (!redirs || !redirs.length) return r;
    const files = [];
    for (const d of redirs) {
      if (d.dup) { if ((d.fd === 2 || d.fd === '*') && d.dup === 1) r.errToOut = true; continue; }
      const t = await ev(ctx, d.target);
      let f = null;
      if (t !== null && !(typeof t === 'string' && /^nul:?$/i.test(t))) {
        const tg = ctx.P.target(toStr(t), { tilde: true });
        if (tg.noParent || tg.badDrive) { writeErr(ctx, "Out-File: Could not find a part of the path '" + (tg.typed || toStr(t)) + "'."); return null; }
        if (tg.isRoot || (tg.item && tg.item.dir) || !tg.unix) { writeErr(ctx, "Out-File: Access to the path '" + (tg.item ? tg.item.win : tg.win) + "' is denied."); return null; }
        f = files.find((x) => x.unix === tg.unix) || { unix: tg.unix, append: d.append, objs: [], text: '' };
        if (!files.includes(f)) files.push(f);
      }
      const outSink = f ? (v) => { f.objs.push(v); capArr(f.objs); } : () => { };
      const errSink = f ? (text) => { f.objs.push({ $t: 'err', text }); } : () => { };
      if (d.fd === 1 || d.fd === '*') r.out = outSink;
      if (d.fd === 2 || d.fd === '*') r.err = errSink;
    }
    for (const f of files) { try { if (!f.append || !ctx.sh.fs.exists(f.unix)) ctx.sh.fs.write(f.unix, ''); } catch (e) { if (!(e instanceof FsError)) throw e; writeErr(ctx, 'Out-File: ' + winMsg(e)); return null; } }
    r.close = async () => { for (const f of files) { const text = formatText(ctx.P, f.objs); if (text) { try { ctx.sh.fs.write(f.unix, text, true); } catch (e) { if (!(e instanceof FsError)) throw e; writeErr(ctx, 'Out-File: ' + (e.code === 'EFBIG' || e.code === 'ENOSPC' || e.code === 'EMFILE' ? 'There is not enough space on the disk.' : winMsg(e))); } } } };
    return r;
  }
  async function runPipe(ctx, pipe, emit) {
    const outer = ctx.failed;
    ctx.failed = false;
    try { await runPipe1(ctx, pipe, emit); }
    finally { ctx.st.ok = !ctx.failed; ctx.failed = outer; }   // $? is this pipeline's own result: errors inside a script block it ran do not count
  }
  async function runPipe1(ctx, pipe, emit) {
    const st = ctx.st;
    let input = null;
    for (let i = 0; i < pipe.elems.length; i++) {
      tick(st, ctx.sh);
      const el = pipe.elems[i], last = i === pipe.elems.length - 1, outs = [];
      let sink = last ? emit : (v) => { if (Array.isArray(v)) outs.push(...v); else outs.push(v); capArr(outs); };
      const red = await openRedirs(ctx, el.redirs);
      if (red === null) return;
      const saveErr = ctx.err;
      if (red.out) sink = red.out;
      if (red.errToOut) { const to = sink; ctx.err = (text) => to({ $t: 'err', text }); }
      if (red.err) ctx.err = red.err;
      const info = { first: i === 0, last, direct: last && emit === ctx.topEmit && !red.out };
      let stop = false;
      try { await runElement(ctx, el, i === 0 ? null : input, sink, info); }
      catch (e) { if (!(e instanceof PsError) || (e.fatal && ctx.depth > 0)) throw e; writeErr(ctx, (e.cmd || e.cat) + ': ' + e.msg); stop = true; }
      finally { await red.close(); ctx.err = saveErr; }
      if (stop) return;
      input = outs;
    }
  }
  const emitAll = (v, emit) => { if (v === null || v === undefined) return; if (Array.isArray(v)) { for (const x of v) emit(x); } else emit(v); };
  async function invokeSb(ctx, sb, under, emit, args) {
    tick(ctx.st, ctx.sh);
    if (++ctx.depth > 100) { ctx.depth--; throw Object.assign(new PsError('The script failed due to call depth overflow.', 'ScriptCallDepthException'), { fatal: true }); }
    ctx.under.push(under); const keepArgs = ctx.args; if (args) ctx.args = args;
    try { await runStmts(ctx, sb.b, emit); }
    catch (e) { if (!(e instanceof PsReturn)) throw e; }
    finally { ctx.under.pop(); ctx.args = keepArgs; ctx.depth--; }
  }
  // what a name is: an alias, a function, a cmdlet, a program, a script or a file
  const NATIVE = ['cmd', 'powershell', 'pwsh', 'python', 'py', 'java', 'javac', 'git', 'whoami', 'hostname', 'tree', 'findstr', 'find', 'more', 'xcopy', 'notepad', 'where', 'sort'];
  function resolveCmd(ctx, name) {
    const lo = name.toLowerCase();
    if (has(ALIASES, lo)) return resolveCmd(ctx, ALIASES[lo]);
    if (has(ctx.st.funcs, lo)) return { kind: 'func', node: ctx.st.funcs[lo], name };
    if (has(FUNCS, lo)) return { kind: 'builtin', f: FUNCS[lo], name: FUNCS[lo].name };
    if (has(CMDLETS, lo)) return { kind: 'cmdlet', spec: CMDLETS[lo] };
    const base = lo.replace(/\.(exe|com)$/, '');
    if (NATIVE.includes(base) && (base !== lo || !['where', 'sort'].includes(base))) return { kind: 'native', key: base, name };
    if (/[\\\/]/.test(name) || /^\./.test(name)) {
      const r = ctx.P.resolve(name, { tilde: true });
      const it = r.item && !r.item.dir ? r.item : null;
      if (it && /\.ps1$/i.test(it.name)) return { kind: 'script', it };
      if (it && /\.py$/i.test(it.name)) return { kind: 'py', it };
      if (it && it.virt) { const k = it.name.toLowerCase().replace(/\.(exe|com)$/, ''); if (NATIVE.includes(k)) return { kind: 'native', key: k, name }; }
      if (it) return { kind: 'open', it };
    }
    return null;
  }
  const notFound = (name) => name + ": The term '" + name + "' is not recognized as a name of a cmdlet, function, script file, or executable program.\nCheck the spelling of the name, or if a path was included, verify that the path is correct and try again.";
  async function argValues(ctx, args) { const out = []; for (const a of args) { if (a.stop) continue; if (a.param !== undefined) { out.push('-' + a.param + (a.colon ? ':' : '')); if (a.colon) out.push(...enumerate(await ev(ctx, a.v)).map((x) => toStr(x, ctx.P))); continue; } out.push(...enumerate(await ev(ctx, a.v)).map((x) => toStr(x, ctx.P))); } return out; }
  async function runElement(ctx, el, input, emit, info) {
    if (el.k === 'expr') { emitAll(await ev(ctx, el.e), emit); return; }
    let name = el.name;
    if (el.nameExpr) {
      const v = await ev(ctx, el.nameExpr);
      if (v && v.$t === 'sb') { const args = []; for (const a of el.args) if (a.v) args.push(await ev(ctx, a.v)); await invokeSb(ctx, v, input ? collapse(input) : null, emit, args); return; }
      name = toStr(v, ctx.P);
    }
    const r = resolveCmd(ctx, name);
    if (!r) {
      let text = notFound(name);
      const here = ctx.P.child(ctx.P.cwdItem() || ctx.P.root(), name);
      if (here && !/[\\\/]/.test(name)) text += '\n\nSuggestion [3,General]: The command "' + name + '" was not found, but does exist in the current location. PowerShell does not load commands from the current location by default. If you trust this command, instead type: ".\\' + name + '". See "get-help about_Command_Precedence" for more details.';
      throw new PsError(text.slice(name.length + 2), 'CommandNotFoundException', name);
    }
    if (r.kind === 'cmdlet' || r.kind === 'builtin') {
      const spec = r.kind === 'cmdlet' ? r.spec : CMDLETS[r.f.target.toLowerCase()];
      const b = await bind(ctx, spec, el.args, input !== null, r.kind === 'builtin' ? r.f : null);
      const quiet = /^(silentlycontinue|ignore)$/i.test(String(b.ErrorAction || ''));
      const c = { ctx, b, input, emit, info, P: ctx.P, sh: ctx.sh, st: ctx.st, io: ctx.io, name: spec.name, pipeStrings: !!spec.pipeStrings,
        error: (msg) => { if (!quiet) writeErr(ctx, spec.name + ': ' + msg); else ctx.failed = true; } };
      await spec.run(c);
      return;
    }
    if (r.kind === 'func') {
      const args = []; for (const a of el.args) { if (a.param !== undefined) { args.push('-' + a.param); if (a.colon) args.push(await ev(ctx, a.v)); } else if (a.v) args.push(await ev(ctx, a.v)); }
      const node = r.node, keep = dict();
      node.params.forEach((pn, i) => { const lo = pn.toLowerCase(); keep[lo] = has(ctx.st.vars, lo) ? ctx.st.vars[lo] : undefined; ctx.st.vars[lo] = i < args.length ? args[i] : null; });
      try { if (input) { for (const x of input) await invokeSb(ctx, { b: node.body }, x, emit, args.slice(node.params.length)); } else await invokeSb(ctx, { b: node.body }, null, emit, args.slice(node.params.length)); }
      finally { for (const lo of Object.keys(keep)) { if (keep[lo] === undefined) delete ctx.st.vars[lo]; else ctx.st.vars[lo] = keep[lo]; } }
      return;
    }
    if (r.kind === 'script') { await runScript(ctx, r.it, emit, await argValues(ctx, el.args)); return; }
    if (r.kind === 'open') { await runNative(ctx, 'notepad', [r.it.win], null, emit, info); return; }
    if (r.kind === 'py') { await runNative(ctx, 'python', [r.it.win].concat(await argValues(ctx, el.args)), input, emit, info); return; }
    await runNative(ctx, r.key, await argValues(ctx, el.args), input, emit, info);
  }
  async function runScript(ctx, it, emit, args) {
    let tree;
    try { tree = psParse(it.node.d); } catch (e) { if (!(e instanceof PsParseError)) throw e; writeErr(ctx, parseErrorText(e, it.node.d).replace(/\n$/, '')); return; }
    if (++ctx.depth > 100) { ctx.depth--; throw Object.assign(new PsError('The script failed due to call depth overflow.', 'ScriptCallDepthException'), { fatal: true }); }
    const keep = ctx.args; ctx.args = args;
    try { await runStmts(ctx, tree, emit); }
    catch (e) { if (e instanceof PsExit) { ctx.st.lastExit = e.code; ctx.st.ok = e.code === 0; } else if (!(e instanceof PsReturn) && !(e instanceof PsBreak)) throw e; }
    finally { ctx.args = keep; ctx.depth--; }
  }
  // a program (and cmd, PowerShell): its text becomes lines of output; at the end of the line it talks to the terminal directly
  async function runNative(ctx, key, args, input, emit, info) {
    const { sh, st, io, P } = ctx;
    const stdinText = input && input.length ? input.map((v) => (typeof v === 'string' ? v : formatText(P, [v]).replace(/^\n+|\n+$/g, ''))).join('\n') + '\n' : null;
    const direct = info.direct && stdinText === null;
    if (direct) ctx.flush();
    let buf = '';
    const nio = Object.assign({}, io, { out: direct ? io.out : (s) => { buf += s; if (buf.length > LIMITS.out) throw new WinStop('output', 1); }, err: (s) => io.err(s), tty: !!io.tty && direct, stdin: stdinText !== null ? { text: stdinText, pos: 0 } : null, piped: !direct });
    // the arguments go to a command of this file as one line, read back by words(): there " only groups (it is removed) and a backslash is an
    // ordinary character, so an argument with a space is put in quotes as it is, and a " inside one cannot be passed (cmd has no escape for
    // it; it is left out, as the grouping would leave it out). No backslash escaping: words() would keep the backslashes.
    const quote = (a) => (/[\s"]/.test(a) || a === '' ? '"' + a.split('"').join('') + '"' : a);
    let code;
    const fake = { kind: 'ps', run: st.run, env: st.env, el: 0, dirs: [], echo: true, exited: null, noBlank: false };
    if (key === 'cmd') code = await startCmd(sh, st, args.map(quote).join(' '), nio);
    else if (key === 'powershell' || key === 'pwsh') code = await startPs(sh, st, args, nio);
    else { const r = await CMDS[key].run({ sh, st: fake, io: nio, rest: ' ' + args.map(quote).join(' '), name: key, P }); code = r && typeof r === 'object' ? r.code : r || 0; }
    if (!direct) for (const l of textLines(buf)) emit(l);
    st.lastExit = code; if (code !== 0) { ctx.failed = true; st.nativeFailed = true; }
  }
  // parameters: { n, pos?, type: 'switch'|'string'|'strings'|'int'|'any'|'sb', alias?, mandatory?, pipe?, rest? }
  const COMMON = [{ n: 'ErrorAction', alias: ['ea'], type: 'string' }, { n: 'WarningAction', alias: ['wa'], type: 'string' }, { n: 'InformationAction', alias: ['infa'], type: 'string' }, { n: 'Verbose', alias: ['vb'], type: 'switch' },
    { n: 'Debug', alias: ['db'], type: 'switch' }, { n: 'ErrorVariable', alias: ['ev'], type: 'string' }, { n: 'OutVariable', alias: ['ov'], type: 'string' }, { n: 'OutBuffer', alias: ['ob'], type: 'int' }, { n: 'PipelineVariable', alias: ['pv'], type: 'string' }];
  const TYPE_NAMES = { string: 'System.String', strings: 'System.String[]', int: 'System.Int32', any: 'System.Object', sb: 'System.Management.Automation.ScriptBlock' };
  async function convertArg(ctx, spec, p, node) {
    const v = await ev(ctx, node);
    switch (p.type) {
      case 'strings': return enumerate(v).map((x) => toStr(x, ctx.P));
      case 'string': if (Array.isArray(v) && v.length > 1) throw new PsError("Cannot convert 'System.Object[]' to the type 'System.String' required by parameter '" + p.n + "'. Specified method is not supported.", 'InvalidArgument', spec.name); return toStr(Array.isArray(v) ? v[0] : v, ctx.P);
      case 'int': { try { const n = toNum(Array.isArray(v) ? v[0] : v); return roundEven(n); } catch (e) { throw new PsError("Cannot bind parameter '" + p.n + "'. Cannot convert value \"" + toStr(v) + '" to type "' + (p.tn || 'System.Int32') + '". Error: "The input string \'' + toStr(v) + '\' was not in a correct format."', 'InvalidArgument', spec.name); } }
      case 'sb': if (!v || v.$t !== 'sb') throw new PsError("Cannot bind parameter '" + p.n + "'. Cannot convert the \"" + toStr(v) + '" value of type "' + typeName(v) + '" to type "System.Management.Automation.ScriptBlock".', 'InvalidArgument', spec.name); return v;
    }
    return v;
  }
  async function bind(ctx, spec, args, hasInput, preset) {
    const b = dict(), pos = [];
    if (preset && preset.preset) Object.assign(b, preset.preset);
    let stop = false;
    const all = spec.params.concat(COMMON);
    const find = (nm) => {
      const lo = nm.toLowerCase();
      const exact = all.find((p) => p.n.toLowerCase() === lo || (p.alias || []).some((a) => a.toLowerCase() === lo));
      if (exact) return exact;
      const pre = all.filter((p) => p.n.toLowerCase().startsWith(lo));
      if (pre.length === 1) return pre[0];
      if (pre.length > 1) throw new PsError("Parameter cannot be processed because the parameter name '" + nm + "' is ambiguous. Possible matches include: " + pre.map((p) => '-' + p.n).join(' ') + '.', 'InvalidArgument', spec.name);
      throw new PsError("A parameter cannot be found that matches parameter name '" + nm + "'.", 'InvalidArgument', spec.name);
    };
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a.stop) { stop = true; continue; }
      if (a.param !== undefined && !stop) {
        const p = find(a.param);
        if (has(b, p.n) && !(preset && preset.preset && has(preset.preset, p.n))) throw new PsError("Cannot bind parameter because parameter '" + p.n + "' is specified more than once. To provide multiple values to parameters that can accept multiple values, use the array syntax. For example, \"-parameter value1,value2,value3\".", 'InvalidArgument', spec.name);
        if (p.type === 'switch') { b[p.n] = a.colon ? truthy(await ev(ctx, a.v)) : true; continue; }
        let node = a.colon ? a.v : null;
        if (!node) { const nx = args[i + 1]; if (!nx || nx.param !== undefined || nx.stop) throw new PsError("Missing an argument for parameter '" + p.n + "'. Specify a parameter of type '" + (p.tn || TYPE_NAMES[p.type] || 'System.Object') + "' and try again.", 'InvalidArgument', spec.name); node = nx.v; i++; }
        b[p.n] = await convertArg(ctx, spec, p, node);
        continue;
      }
      if (a.param !== undefined) { pos.push({ k: 'str', v: '-' + a.param }); continue; }
      pos.push(a.v);
    }
    const posParams = spec.params.filter((p) => p.pos !== undefined).sort((x, y) => x.pos - y.pos);
    let k = 0;
    for (const p of posParams) {
      if (k >= pos.length) break;
      if (has(b, p.n)) continue;
      if (p.rest) { const vals = []; for (; k < pos.length; k++) vals.push(await ev(ctx, pos[k])); b[p.n] = p.type === 'strings' ? vals.flatMap((v) => enumerate(v).map((x) => toStr(x, ctx.P))) : vals; break; }
      b[p.n] = await convertArg(ctx, spec, p, pos[k++]);
    }
    if (k < pos.length) { const v = await ev(ctx, pos[k]); throw new PsError("A positional parameter cannot be found that accepts argument '" + toStr(v, ctx.P) + "'.", 'InvalidArgument', spec.name); }
    for (const p of spec.params) {
      if (!p.mandatory || has(b, p.n) || (hasInput && p.pipe)) continue;
      const io = ctx.io;
      if (io.ask && io.tty) {
        ctx.flush();
        io.out('\ncmdlet ' + spec.name + ' at command pipeline position 1\nSupply values for the following parameters:\n');
        const vals = [];
        for (let j = 0; j < 100; j++) { const a = await io.ask(p.type === 'strings' ? p.n + '[' + j + ']: ' : p.n + ': '); if (a === null || a === undefined || ctx.sh.cancelled) throw new WinStop('cancel', 130); if (a === '') break; vals.push(a); if (p.type !== 'strings') break; }
        if (vals.length) { b[p.n] = p.type === 'strings' ? vals : p.type === 'int' ? toNum(vals[0]) : vals[0]; continue; }
        throw new PsError("Cannot bind argument to parameter '" + p.n + "' because it is an empty " + (p.type === 'strings' ? 'array' : 'string') + '.', 'InvalidData', spec.name);
      }
      throw new PsError('Cannot process command because of one or more missing mandatory parameters: ' + p.n + '.', 'InvalidArgument', spec.name);
    }
    return b;
  }

  /* ---------------- the cmdlets ---------------- */
  const CMDLETS = dict(), ALIASES = dict(), FUNCS = dict();
  const MGMT = 'Microsoft.PowerShell.Management', UTIL = 'Microsoft.PowerShell.Utility', CORE = 'Microsoft.PowerShell.Core';
  const defP = (name, mod, params, run, extra) => { CMDLETS[name.toLowerCase()] = Object.assign({ name, mod, params, run }, extra || {}); };
  const alias = (names, target) => { for (const n of names.split(' ')) ALIASES[n.toLowerCase()] = target; };
  const notExist = (p) => "Cannot find path '" + p + "' because it does not exist.";
  const itemV = (it) => ({ $t: 'item', it });
  // the paths a cmdlet works on: -Path, or the items (and their paths) that came down the pipeline
  function pathsOf(c, prop) {
    const v = c.b[prop || 'Path'];
    if (v !== undefined) return v;
    if (c.input) { const out = []; for (const x of c.input) { if (x && x.$t === 'item') out.push(x.it.win); else if (typeof x === 'string' && c.pipeStrings) out.push(x); else if (x !== null && x !== undefined) out.push({ bad: x }); } return out; }
    return null;
  }
  const PIPE_BAD = 'The input object cannot be bound to any parameters for the command either because the command does not take pipeline input or the input and its properties do not match any of the parameters that take pipeline input.';
  // a path with wildcards (or not) → the items; reports a missing one (unless wildcards matched nothing, which is quiet, as in PowerShell)
  function expand(c, p, opts) {
    const P = c.P;
    if (hasWild(p, true)) { const g = P.glob(p, true); if (!g.matches) { c.error(notExist(g.typed || p)); return []; } return g.matches; }
    const r = P.resolve(p.replace(/`(.)/g, '$1'), { tilde: true });
    if (r.badDrive) { c.error("Cannot find drive. A drive with the name '" + r.badDrive + "' does not exist."); return []; }
    if (!r.item) { if (!(opts && opts.quiet)) c.error(notExist(r.typed)); return []; }
    return [r.item];
  }
  const kidsSorted = (P, it) => { const k = P.children(it); return k.filter((x) => x.dir).concat(k.filter((x) => !x.dir)); };

  defP('Get-ChildItem', MGMT, [{ n: 'Path', pos: 0, type: 'strings', pipe: true }, { n: 'Filter', pos: 1, type: 'string' }, { n: 'Include', type: 'strings' }, { n: 'Exclude', type: 'strings' },
    { n: 'Recurse', alias: ['s', 'r'], type: 'switch' }, { n: 'Depth', type: 'int', tn: 'System.UInt32' }, { n: 'Force', type: 'switch' }, { n: 'Name', type: 'switch' }, { n: 'Directory', alias: ['ad', 'd'], type: 'switch' },
    { n: 'File', alias: ['af'], type: 'switch' }, { n: 'Hidden', alias: ['ah', 'h'], type: 'switch' }, { n: 'ReadOnly', alias: ['ar'], type: 'switch' }, { n: 'System', alias: ['as'], type: 'switch' }, { n: 'Attributes', type: 'string' }, { n: 'LiteralPath', alias: ['PSPath', 'LP'], type: 'strings' }],
  async (c) => {
    const { b, P } = c;
    const filt = b.Filter ? wildRe(b.Filter, true) : null, inc = (b.Include || []).map((x) => wildRe(x, true)), exc = (b.Exclude || []).map((x) => wildRe(x, true));
    const want = (it) => (!filt || filt.test(it.name)) && (!inc.length || inc.some((r) => r.test(it.name))) && !exc.some((r) => r.test(it.name)) && (!b.File || !it.dir) && (!b.Directory || it.dir) && !b.Hidden && !b.System && !b.ReadOnly;
    const maxDepth = b.Depth !== undefined ? b.Depth : b.Recurse ? Infinity : 0;
    const out = (it, rel) => { tick(c.st, c.sh); c.emit(b.Name ? rel : itemV(it)); };
    let list = pathsOf(c) || b.LiteralPath || ['.'];
    if (list.some((x) => x && x.bad)) { for (const x of list) if (x && x.bad) c.error(PIPE_BAD); list = list.filter((x) => typeof x === 'string'); }
    for (const p of list) {
      const wild = hasWild(p, true);
      let items;
      if (wild && (b.Recurse || b.Depth !== undefined)) {   // gci *.txt -Recurse: the wildcard is a filter at every level
        const g = P.glob(p, true); if (!g.dir) { c.error(notExist(g.typed || p)); continue; }
        const re = wildRe(P.parse(p, { tilde: true }).comps.pop() || '*', true), w2 = (it) => re.test(it.name) && want(it);
        walkTree(c, g.dir, maxDepth, w2, out);
        continue;
      }
      items = expand(c, p);
      for (const it of items) {
        if (!it.dir || wild) { if (want(it) || (!it.dir && !filt && !inc.length)) out(it, it.name); continue; }
        walkTree(c, it, maxDepth, want, out);
      }
    }
  });
  // -Recurse: listed objects come in PowerShell 7's order (each directory's entries, then the directories it found, the last first);
  // -Name lists depth first. Directories come before files, each sorted by name.
  function walkTree(c, top, maxDepth, want, out) {
    const P = c.P;
    if (c.b.Name) {
      const go = (d, rel, depth) => { const kids = kidsSorted(P, d); for (const k of kids) if (want(k)) out(k, rel + k.name); if (depth < maxDepth) for (const k of kids) if (k.dir) go(k, rel + k.name + '\\', depth + 1); };
      go(top, '', 0); return;
    }
    const stack = [[top, 0]];
    while (stack.length) {
      const [d, depth] = stack.pop();
      const kids = kidsSorted(P, d);
      for (const k of kids) if (want(k)) out(k, k.name);
      if (depth < maxDepth) for (const k of kids) if (k.dir) stack.push([k, depth + 1]);
    }
  }
  alias('gci ls dir', 'Get-ChildItem');
  defP('Get-Item', MGMT, [{ n: 'Path', pos: 0, type: 'strings', mandatory: true, pipe: true }, { n: 'Force', type: 'switch' }, { n: 'LiteralPath', alias: ['PSPath', 'LP'], type: 'strings' }], async (c) => {
    for (const p of pathsOf(c) || c.b.LiteralPath || []) { if (p && p.bad) { c.error(PIPE_BAD); continue; } for (const it of expand(c, p)) c.emit(itemV(it)); }
  });
  alias('gi', 'Get-Item');
  defP('Set-Location', MGMT, [{ n: 'Path', pos: 0, type: 'string', pipe: true }, { n: 'PassThru', type: 'switch' }, { n: 'LiteralPath', alias: ['PSPath', 'LP'], type: 'string' }], async (c) => {
    const { P, st } = c;
    let p = c.b.Path !== undefined ? c.b.Path : c.b.LiteralPath;
    if (p === undefined && c.input && c.input.length) { const x = c.input[0]; p = x && x.$t === 'item' ? x.it.win : toStr(x, P); }
    const here = P.cwdWin();
    if (p === undefined || p === '') p = '~';
    if (p === '-' || p === '+') {
      const from = p === '-' ? st.dirs : st.oldDirs, to = p === '-' ? st.oldDirs : st.dirs;
      if (!from.length) { c.error(p === '-' ? 'There is no location history left to navigate backwards.' : 'There is no location history left to navigate forwards.'); return; }
      const d = from.pop(); const r = P.resolve(d); if (r.item && r.item.dir) { to.push(here); P.setCwd(r.item); }
      if (c.b.PassThru) c.emit(pathInfo(P.cwdWin()));
      return;
    }
    let item = null;
    if (hasWild(p, true)) { const g = P.glob(p, true); const m = g.matches ? g.matches.filter((x) => x.dir) : []; if (m.length === 1) item = m[0]; else if (m.length > 1) throw new PsError("Cannot set the location because path '" + p + "' resolved to multiple containers. You can only the set the same location to a single container.", 'InvalidArgument', 'Set-Location'); }
    else { const r = P.resolve(p, { tilde: true }); if (r.badDrive) throw new PsError("Cannot find drive. A drive with the name '" + r.badDrive + "' does not exist.", 'ObjectNotFound', 'Set-Location'); if (r.item && !r.item.dir) throw new PsError(notExist(p), 'ObjectNotFound', 'Set-Location'); item = r.item; if (!item) throw new PsError(notExist(r.typed), 'ObjectNotFound', 'Set-Location'); }
    if (!item) throw new PsError(notExist(P.winOf(P.parse(p, { tilde: true }).comps)), 'ObjectNotFound', 'Set-Location');
    if (item.win !== here) { st.dirs.push(here); if (st.dirs.length > 20) st.dirs.shift(); st.oldDirs = []; }
    P.setCwd(item);
    if (c.b.PassThru) c.emit(pathInfo(P.cwdWin()));
  });
  alias('cd sl chdir', 'Set-Location');
  defP('Get-Location', MGMT, [], async (c) => { c.emit(pathInfo(c.P.cwdWin())); });
  alias('gl pwd', 'Get-Location');
  defP('Push-Location', MGMT, [{ n: 'Path', pos: 0, type: 'string' }], async (c) => {
    const here = c.P.cwdWin();
    if (c.b.Path !== undefined) { const r = c.P.resolve(c.b.Path, { tilde: true }); if (!r.item || !r.item.dir) throw new PsError(notExist(r.item ? c.b.Path : r.typed), 'ObjectNotFound', 'Push-Location'); c.P.setCwd(r.item); }
    c.st.stack = c.st.stack || []; c.st.stack.push(here); if (c.st.stack.length > 100) c.st.stack.shift();
  });
  alias('pushd', 'Push-Location');
  defP('Pop-Location', MGMT, [], async (c) => { const d = (c.st.stack || []).pop(); if (!d) return; const r = c.P.resolve(d); if (r.item && r.item.dir) c.P.setCwd(r.item); });
  alias('popd', 'Pop-Location');

  defP('Get-Content', MGMT, [{ n: 'Path', pos: 0, type: 'strings', mandatory: true, pipe: true }, { n: 'TotalCount', alias: ['Head', 'First'], type: 'int', tn: 'System.Int64' }, { n: 'Tail', alias: ['Last'], type: 'int' },
    { n: 'Raw', type: 'switch' }, { n: 'Encoding', type: 'string' }, { n: 'ReadCount', type: 'int', tn: 'System.Int64' }, { n: 'LiteralPath', alias: ['PSPath', 'LP'], type: 'strings' }, { n: 'Force', type: 'switch' }], async (c) => {
    const { b } = c;
    const list = pathsOf(c) || b.LiteralPath || [];
    for (const p of list) {
      if (p && p.bad) { c.error(PIPE_BAD); continue; }
      for (const it of expand(c, p)) {
        if (it.dir) { c.error("Unable to get content because it is a directory: '" + it.win + "'. Please use 'Get-ChildItem' instead."); continue; }
        const text = it.node.d;
        if (b.Raw) { if (text) c.emit(text); continue; }
        let ls = textLines(text);
        if (b.TotalCount !== undefined && b.TotalCount >= 0) ls = ls.slice(0, b.TotalCount);
        if (b.Tail !== undefined) ls = b.Tail > 0 ? ls.slice(-b.Tail) : b.Tail === 0 ? [] : ls;
        for (const l of ls) { tick(c.st, c.sh); c.emit(l); }
      }
    }
  });
  alias('gc cat type', 'Get-Content');
  // Set-Content, Add-Content, Out-File, Clear-Content: the text is written through the file system (with \n line ends)
  function writeTarget(c, p, text, append, name) {
    const tg = c.P.target(p, { tilde: true });
    if (tg.badDrive) { c.error("Cannot find drive. A drive with the name '" + tg.badDrive + "' does not exist."); return false; }
    if (tg.noParent) { c.error("Could not find a part of the path '" + tg.typed + "'."); return false; }
    if (tg.badName) { c.error("The filename, directory name, or volume label syntax is incorrect. : '" + tg.win + "'"); return false; }
    if (tg.isRoot || (tg.item && tg.item.dir) || !tg.unix) { c.error("Access to the path '" + (tg.item ? tg.item.win : tg.win) + "' is denied."); return false; }
    try { c.sh.fs.write(tg.unix, text, append); return true; }
    catch (e) { if (!(e instanceof FsError)) throw e; c.error(e.code === 'EFBIG' || e.code === 'ENOSPC' || e.code === 'EMFILE' ? 'There is not enough space on the disk. : \'' + tg.win + "'" : winMsg(e)); return false; }
    finally { void name; }
  }
  const valueText = (c, vals, noNewline) => { const parts = vals.map((v) => (typeof v === 'string' ? v : toStr(v, c.P))); return capStr(noNewline ? parts.join('') : parts.map((x) => x + '\n').join('')); };
  const contentParams = [{ n: 'Path', pos: 0, type: 'strings', mandatory: true }, { n: 'Value', pos: 1, type: 'any', pipe: true }, { n: 'NoNewline', type: 'switch' }, { n: 'Force', type: 'switch' }, { n: 'Encoding', type: 'string' }, { n: 'PassThru', type: 'switch' }, { n: 'LiteralPath', alias: ['PSPath', 'LP'], type: 'strings' }];
  const setContent = (append) => async (c) => {
    const vals = c.b.Value !== undefined ? enumerate(c.b.Value) : c.input || [];
    const text = valueText(c, vals, c.b.NoNewline);
    for (const p of c.b.Path || c.b.LiteralPath) {
      if (hasWild(p, true)) { for (const it of expand(c, p)) if (!it.dir) writeTarget(c, it.win, text, append); continue; }
      if (append) { const r = c.P.resolve(p, { tilde: true }); if (r.item && !r.item.dir && r.item.node.d && !r.item.node.d.endsWith('\n') && !c.b.NoNewline) { writeTarget(c, p, '\n' + text, true); continue; } }
      writeTarget(c, p, text, append);
    }
  };
  defP('Set-Content', MGMT, contentParams, setContent(false));
  defP('Add-Content', MGMT, contentParams, setContent(true));
  alias('ac', 'Add-Content');
  defP('Clear-Content', MGMT, [{ n: 'Path', pos: 0, type: 'strings', mandatory: true }], async (c) => { for (const p of c.b.Path) for (const it of expand(c, p)) if (!it.dir) writeTarget(c, it.win, '', false); });
  alias('clc', 'Clear-Content');
  defP('Out-File', UTIL, [{ n: 'FilePath', alias: ['Path'], pos: 0, type: 'string', mandatory: true }, { n: 'Append', type: 'switch' }, { n: 'NoNewline', type: 'switch' }, { n: 'Encoding', pos: 1, type: 'string' }, { n: 'Width', type: 'int' }, { n: 'Force', type: 'switch' }, { n: 'NoClobber', alias: ['NoOverwrite'], type: 'switch' }, { n: 'InputObject', type: 'any' }], async (c) => {
    const objs = c.b.InputObject !== undefined ? enumerate(c.b.InputObject) : c.input || [];
    let text = c.b.NoNewline ? objs.map((v) => toStr(v, c.P)).join('') : formatText(c.P, objs);
    if (c.b.NoClobber) { const r = c.P.resolve(c.b.FilePath, { tilde: true }); if (r.item) { c.error("The file '" + r.item.win + "' already exists."); return; } }
    writeTarget(c, c.b.FilePath, text, !!c.b.Append);
  });
  defP('Out-Null', CORE, [{ n: 'InputObject', type: 'any' }], async () => { });
  defP('Out-Host', CORE, [{ n: 'InputObject', type: 'any' }, { n: 'Paging', alias: ['p'], type: 'switch' }], async (c) => { for (const v of c.input || enumerate(c.b.InputObject)) c.ctx.topEmit(v); });
  defP('Out-String', UTIL, [{ n: 'InputObject', type: 'any' }, { n: 'Stream', type: 'switch' }, { n: 'Width', type: 'int' }, { n: 'NoNewline', type: 'switch' }], async (c) => {
    const t = formatText(c.P, c.input || enumerate(c.b.InputObject));
    if (c.b.Stream) for (const l of textLines(t)) c.emit(l); else c.emit(c.b.NoNewline ? t.replace(/\n/g, '') : t);
  });

  // New-Item and its mkdir function
  defP('New-Item', MGMT, [{ n: 'Path', pos: 0, type: 'strings' }, { n: 'Name', type: 'string' }, { n: 'ItemType', alias: ['Type'], type: 'string' }, { n: 'Value', alias: ['Target'], type: 'any', pipe: true }, { n: 'Force', type: 'switch' }], async (c) => {
    const { b, P, sh } = c;
    let type = 'File';
    if (b.ItemType !== undefined) {
      const lo = b.ItemType.toLowerCase(), kinds = ['File', 'Directory', 'SymbolicLink', 'Junction', 'HardLink'];
      const m = kinds.filter((k) => k.toLowerCase().startsWith(lo) && lo);
      if (m.length !== 1) throw new PsError('The type is not a known type for the file system. Only "file","directory" or "symboliclink" can be specified.', 'InvalidArgument', 'New-Item');
      type = m[0];
      if (type !== 'File' && type !== 'Directory') throw new PsError('Links are not available in this practice PowerShell.', 'NotImplemented', 'New-Item');
    }
    const paths0 = b.Path || (b.Name !== undefined ? ['.'] : null);
    if (!paths0) {
      if (c.io.ask && c.io.tty) { c.ctx.flush(); c.io.out('\ncmdlet New-Item at command pipeline position 1\nSupply values for the following parameters:\n'); const a = await c.io.ask('Path[0]: '); if (!a) throw new PsError("Cannot bind argument to parameter 'Path' because it is an empty array.", 'InvalidData', 'New-Item'); return void await CMDLETS['new-item'].run(Object.assign({}, c, { b: Object.assign(dict(), b, { Path: [a] }) })); }
      throw new PsError('Cannot process command because of one or more missing mandatory parameters: Path.', 'InvalidArgument', 'New-Item');
    }
    for (const p0 of paths0) {
      tick(c.st, sh);
      const p = b.Name !== undefined ? p0.replace(/[\\\/]+$/, '') + '\\' + b.Name : p0;
      const tg = P.target(p, { tilde: true });
      if (tg.badDrive) { c.error("Cannot find drive. A drive with the name '" + tg.badDrive + "' does not exist."); continue; }
      if (tg.item) {
        if (type === 'Directory' && tg.item.dir) { if (b.Force) { c.emit(itemV(tg.item)); continue; } c.error('An item with the specified name ' + tg.item.win + ' already exists.'); continue; }
        if (type === 'File' && !tg.item.dir && b.Force) { /* replaced below */ }
        else { c.error("The file '" + tg.item.win + "' already exists."); continue; }
      }
      if (tg.badName) { c.error("The filename, directory name, or volume label syntax is incorrect. : '" + P.winOf(P.parse(p, { tilde: true }).comps) + "'"); continue; }
      if (type === 'Directory' || (tg.noParent && b.Force)) {
        const io2 = { err: (s) => c.error(s.replace(/\n$/, '').replace(/^A subdirectory or file .* already exists\.$/, 'An item with the specified name ' + P.winOf(P.parse(p, { tilde: true }).comps) + ' already exists.')), out: () => { } };
        const dirText = type === 'Directory' ? p : p.replace(/\//g, '\\').replace(/\\[^\\]*$/, '');
        if (type === 'Directory' || !P.resolve(dirText, { tilde: true }).item) { if (makeDirs(sh, io2, P, P.winOf(P.parse(dirText, { tilde: true }).comps))) continue; }
        if (type === 'Directory') { const r = P.resolve(p, { tilde: true }); if (r.item) c.emit(itemV(r.item)); continue; }
      }
      if (tg.noParent && !b.Force) { c.error("Could not find a part of the path '" + tg.typed + "'."); continue; }
      const t2 = P.target(p, { tilde: true });
      if (!t2.unix || t2.isRoot) { c.error("Access to the path '" + t2.win + "' is denied."); continue; }
      const text = b.Value !== undefined ? enumerate(b.Value).map((v) => toStr(v, P)).join(' ') : c.input && c.input.length ? c.input.map((v) => toStr(v, P)).join(' ') : '';
      try { sh.fs.write(t2.unix, text); } catch (e) { if (!(e instanceof FsError)) throw e; c.error(winMsg(e)); continue; }
      const r = P.resolve(p, { tilde: true }); if (r.item) c.emit(itemV(r.item));
    }
  });
  alias('ni', 'New-Item');
  FUNCS.mkdir = { name: 'mkdir', target: 'New-Item', preset: { ItemType: 'Directory' } };
  alias('md', 'mkdir');

  // Remove-Item: a directory with something in it asks first (pwsh's Confirm prompt), unless -Recurse
  defP('Remove-Item', MGMT, [{ n: 'Path', pos: 0, type: 'strings', mandatory: true, pipe: true }, { n: 'Recurse', alias: ['r'], type: 'switch' }, { n: 'Force', type: 'switch' }, { n: 'Filter', type: 'string' }, { n: 'Include', type: 'strings' }, { n: 'Exclude', type: 'strings' },
    { n: 'WhatIf', alias: ['wi'], type: 'switch' }, { n: 'Confirm', alias: ['cf'], type: 'switch' }, { n: 'LiteralPath', alias: ['PSPath', 'LP'], type: 'strings' }], async (c) => {
    const { b, P, sh, io } = c;
    let yesAll = false, noAll = false;
    const inc = (b.Include || []).map((x) => wildRe(x, true)), exc = (b.Exclude || []).map((x) => wildRe(x, true)), filt = b.Filter ? wildRe(b.Filter, true) : null;
    for (const p of pathsOf(c) || b.LiteralPath || []) {
      if (p && p.bad) { c.error(PIPE_BAD); continue; }
      for (const it of expand(c, p)) {
        tick(c.st, sh);
        if ((filt && !filt.test(it.name)) || (inc.length && !inc.some((r) => r.test(it.name))) || exc.some((r) => r.test(it.name))) continue;
        if (!it.unix || it.virt) { c.error("Access to the path '" + it.win + "' is denied."); continue; }
        if (it.dir && P.inside(it)) { c.error("Cannot remove the item at '" + it.win + "' because it is in use."); continue; }
        if (b.WhatIf) { c.ctx.flush(); io.out('What if: Performing the operation "' + (it.dir ? 'Remove Directory' : 'Remove File') + '" on target "' + it.win + '".\n'); continue; }
        if (it.dir && P.children(it).length && !b.Recurse && !yesAll) {
          if (noAll) continue;
          if (!io.ask) { c.error('PowerShell is in NonInteractive mode. Read and Prompt functionality is not available.'); continue; }
          c.ctx.flush();
          io.out('\nConfirm\n' + wrapText('The item at ' + it.win + ' has children and the Recurse parameter was not specified. If you continue, all children will be removed with the item. Are you sure you want to continue?') + '\n');
          let ans;
          for (let k = 0; k < 20; k++) {
            ans = await io.ask('[Y] Yes  [A] Yes to All  [N] No  [L] No to All  [S] Suspend  [?] Help (default is "Y"): ');
            if (ans === null || ans === undefined || sh.cancelled) throw new WinStop('cancel', 130);
            ans = ans.trim().toLowerCase();
            if (ans === '?') { io.out('Y - Continue with only the next step of the operation.\nA - Continue with all the steps of the operation.\nN - Skip this operation and proceed with the next operation.\nL - Skip this operation and all subsequent operations.\nS - Pause the current pipeline and return to the command prompt. Type "exit" to resume the pipeline.\n'); continue; }
            if (['', 'y', 'a', 'n', 'l', 's'].includes(ans)) break;
          }
          if (ans === 'a') yesAll = true; else if (ans === 'l') { noAll = true; continue; } else if (ans === 'n' || ans === 's') continue;
        }
        try { if (it.dir) sh.fs.rmTree(it.unix); else sh.fs.unlink(it.unix); } catch (e) { if (!(e instanceof FsError)) throw e; c.error(winMsg(e)); }
      }
    }
  });
  alias('ri rm del erase rd rmdir', 'Remove-Item');
  const wrapText = (t) => { const ws = t.split(' '), ls = []; let cur = ''; for (const w of ws) { if (cur && (cur + w).length > WIDTH - 1) { ls.push(cur); cur = ''; } cur += w + ' '; } if (cur) ls.push(cur.replace(/ $/, '')); return ls.join('\n'); };

  // Copy-Item and Move-Item
  const destFor = (c, it, dst) => { const r = c.P.resolve(dst, { tilde: true }); if (r.item && r.item.dir) return c.P.target(r.item.win + '\\' + it.name); return c.P.target(dst, { tilde: true }); };
  function copyTree(c, it, tg) {
    const { sh, P } = c;
    if (!it.dir) { sh.fs.write(tg.unix, it.node.d); return; }
    if (!tg.item) sh.fs.mkdir(tg.unix);
    if (!c.b.Recurse) return;
    for (const k of P.children(it)) { tick(c.st, sh); const sub = P.target(P.winOf(tg.comps) + '\\' + k.name); copyTree(c, k, sub); }
  }
  defP('Copy-Item', MGMT, [{ n: 'Path', pos: 0, type: 'strings', mandatory: true, pipe: true }, { n: 'Destination', pos: 1, type: 'string' }, { n: 'Recurse', type: 'switch' }, { n: 'Force', type: 'switch' }, { n: 'PassThru', type: 'switch' },
    { n: 'Container', type: 'switch' }, { n: 'Filter', type: 'string' }, { n: 'LiteralPath', alias: ['PSPath', 'LP'], type: 'strings' }], async (c) => {
    const { b, P } = c, dst = b.Destination !== undefined ? b.Destination : '.';
    for (const p of pathsOf(c) || b.LiteralPath || []) {
      if (p && p.bad) { c.error(PIPE_BAD); continue; }
      for (const it of expand(c, p)) {
        tick(c.st, c.sh);
        const tg = destFor(c, it, dst);
        if (tg.noParent || tg.badDrive) { c.error("Could not find a part of the path '" + (tg.typed || dst) + "'."); continue; }
        if (tg.item && same(tg.item, it)) { c.error('Cannot overwrite the item ' + it.win + ' with itself.'); continue; }
        if (it.dir && tg.comps.length > it.comps.length && it.comps.every((x, i) => x === tg.comps[i])) { c.error("Cannot copy item " + it.win + " onto itself."); continue; }
        if (!tg.unix || tg.isRoot) { c.error("Access to the path '" + tg.win + "' is denied."); continue; }
        if (tg.item && tg.item.dir && !it.dir) { c.error("Cannot overwrite directory '" + tg.item.win + "' with non-directory '" + it.win + "'."); continue; }   // Windows' words for this are long; this is their gist
        if (tg.item && !tg.item.dir && it.dir) { c.error("An item with the specified name " + tg.item.win + " already exists."); continue; }
        try { copyTree(c, it, tg); } catch (e) { if (!(e instanceof FsError)) throw e; c.error(e.code === 'EFBIG' || e.code === 'ENOSPC' || e.code === 'EMFILE' ? 'There is not enough space on the disk.' : winMsg(e)); continue; }
        if (b.PassThru) { const r = P.resolve(P.winOf(tg.comps)); if (r.item) c.emit(itemV(r.item)); }
      }
    }
  });
  alias('copy cp cpi', 'Copy-Item');
  defP('Move-Item', MGMT, [{ n: 'Path', pos: 0, type: 'strings', mandatory: true, pipe: true }, { n: 'Destination', pos: 1, type: 'string' }, { n: 'Force', type: 'switch' }, { n: 'PassThru', type: 'switch' }, { n: 'LiteralPath', alias: ['PSPath', 'LP'], type: 'strings' }], async (c) => {
    const { b, P, sh } = c, dst = b.Destination !== undefined ? b.Destination : '.';
    for (const p of pathsOf(c) || b.LiteralPath || []) {
      if (p && p.bad) { c.error(PIPE_BAD); continue; }
      for (const it of expand(c, p)) {
        tick(c.st, sh);
        const tg = destFor(c, it, dst);
        if (tg.noParent || tg.badDrive) { c.error("Could not find a part of the path '" + (tg.typed || dst) + "'."); continue; }
        if (!it.unix || it.virt || !tg.unix || tg.isRoot) { c.error("Access to the path '" + (it.unix ? tg.win : it.win) + "' is denied."); continue; }
        if (it.dir && P.inside(it)) { c.error("Cannot move item because the item at '" + it.win + "' is in use."); continue; }
        if (tg.item && same(tg.item, it) && tg.name === it.name) continue;
        if (it.dir && tg.comps.length > it.comps.length && it.comps.every((x, i) => x === tg.comps[i])) { c.error('Destination path cannot be a subdirectory of the source: ' + tg.win + '.'); continue; }
        if (tg.item && !same(tg.item, it)) {
          if (!b.Force || tg.item.dir || it.dir) { c.error('Cannot create a file when that file already exists.'); continue; }
          try { sh.fs.unlink(tg.item.unix); } catch (e) { if (!(e instanceof FsError)) throw e; c.error(winMsg(e)); continue; }
        }
        try { sh.fs.move(it.unix, tg.unix); } catch (e) { if (!(e instanceof FsError)) throw e; c.error(winMsg(e)); continue; }
        if (b.PassThru) { const r = P.resolve(tg.win); if (r.item) c.emit(itemV(r.item)); }
      }
    }
  });
  alias('move mv mi', 'Move-Item');
  defP('Rename-Item', MGMT, [{ n: 'Path', pos: 0, type: 'string', mandatory: true, pipe: true }, { n: 'NewName', pos: 1, type: 'string', mandatory: true }, { n: 'Force', type: 'switch' }, { n: 'PassThru', type: 'switch' }, { n: 'LiteralPath', alias: ['PSPath', 'LP'], type: 'string' }], async (c) => {
    const { b, P, sh } = c;
    const list = b.Path !== undefined ? [b.Path] : b.LiteralPath !== undefined ? [b.LiteralPath] : (pathsOf(c) || []);
    for (const p of list) {
      if (p && p.bad) { c.error(PIPE_BAD); continue; }
      const r = P.resolve(p, { tilde: true });
      if (!r.item) { c.error(notExist(r.typed)); continue; }
      const it = r.item; let nn = b.NewName;
      if (/[\\\/]/.test(nn)) { const t = P.target(nn); if (!t.parent || !same(t.parent, P.walk(it.comps.slice(0, -1)))) { c.error('Cannot rename the specified target, because it represents a path or device name.'); continue; } nn = t.name; }
      if (!nn || BAD_NAME.test(nn)) { c.error("Cannot rename because the target specified represents a path or device name."); continue; }
      const ex = P.child(P.walk(it.comps.slice(0, -1)), nn);
      if (ex && !same(ex, it)) { c.error('Cannot create a file when that file already exists.'); continue; }
      if (!it.unix || it.virt) { c.error("Access to the path '" + it.win + "' is denied."); continue; }
      if (it.dir && P.inside(it)) { c.error("Cannot rename the item at '" + it.win + "' because it is in use."); continue; }
      try { sh.fs.move(it.unix, it.unix.replace(/[^\/]*$/, '') + nn); } catch (e) { if (!(e instanceof FsError)) throw e; c.error(winMsg(e)); continue; }
      if (b.PassThru) { const r2 = P.resolve(P.winOf(it.comps.slice(0, -1).concat([nn]))); if (r2.item) c.emit(itemV(r2.item)); }
    }
  });
  alias('ren rni', 'Rename-Item');
  defP('Test-Path', MGMT, [{ n: 'Path', pos: 0, type: 'strings', mandatory: true, pipe: true }, { n: 'PathType', alias: ['Type'], type: 'string' }, { n: 'IsValid', type: 'switch' }, { n: 'LiteralPath', alias: ['PSPath', 'LP'], type: 'strings' }], async (c) => {
    const { b, P } = c;
    const kind = (b.PathType || 'Any').toLowerCase();
    if (!['any', 'container', 'leaf'].includes(kind)) throw new PsError("Cannot bind parameter 'PathType'. Cannot convert value \"" + b.PathType + "\" to type \"Microsoft.PowerShell.Commands.TestPathType\". Error: \"Unable to match the identifier name " + b.PathType + ' to a valid enumerator name. Specify one of the following enumerator names and try again:\nAny, Container, Leaf"', 'InvalidArgument', 'Test-Path');
    for (const p of pathsOf(c) || b.LiteralPath || []) {
      if (p && p.bad) { c.emit(false); continue; }
      if (p === '') throw new PsError("Cannot bind argument to parameter 'Path' because it is an empty string.", 'InvalidData', 'Test-Path');
      if (b.IsValid) { c.emit(!BAD_NAME.test(p.replace(/^[A-Za-z]:/, ''))); continue; }
      const its = hasWild(p, true) ? (P.glob(p, true).matches || []) : [P.resolve(p, { tilde: true }).item].filter(Boolean);
      c.emit(its.some((it) => kind === 'any' || (kind === 'container') === it.dir));
    }
  });

  // output
  defP('Write-Output', UTIL, [{ n: 'InputObject', pos: 0, type: 'any', rest: true, pipe: true }, { n: 'NoEnumerate', type: 'switch' }], async (c) => {
    const vals = c.b.InputObject !== undefined ? c.b.InputObject : c.input || [];
    if (c.b.NoEnumerate && c.b.InputObject !== undefined && vals.length === 1 && Array.isArray(vals[0])) { c.emit([vals[0]]); return; }
    for (const v of vals) emitAll(v, c.emit);
  });
  alias('echo write', 'Write-Output');
  defP('Write-Host', UTIL, [{ n: 'Object', pos: 0, type: 'any', rest: true, pipe: true }, { n: 'NoNewline', type: 'switch' }, { n: 'Separator', type: 'any' }, { n: 'ForegroundColor', alias: ['fg'], type: 'string' }, { n: 'BackgroundColor', alias: ['bg'], type: 'string' }], async (c) => {
    const vals = c.b.Object !== undefined ? c.b.Object : c.input || [];
    const sep = c.b.Separator !== undefined ? toStr(c.b.Separator) : ' ';
    const text = vals.map((v) => (Array.isArray(v) ? v.map((x) => toStr(x, c.P)).join(sep) : toStr(v, c.P))).join(sep);
    c.ctx.flush(); c.io.out(text + (c.b.NoNewline ? '' : '\n'));
  });
  defP('Write-Error', UTIL, [{ n: 'Message', pos: 0, type: 'string' }], async (c) => { writeErr(c.ctx, 'Write-Error: ' + (c.b.Message || '')); });
  defP('Clear-Host', CORE, [], async (c) => { if (c.io.clear) c.io.clear(); });
  alias('cls clear', 'Clear-Host');

  // Select-String: lines that match, from files or from the pipeline
  defP('Select-String', UTIL, [{ n: 'Pattern', pos: 0, type: 'strings', mandatory: true }, { n: 'Path', pos: 1, type: 'strings', pipe: true }, { n: 'SimpleMatch', type: 'switch' }, { n: 'CaseSensitive', type: 'switch' }, { n: 'NotMatch', type: 'switch' },
    { n: 'Quiet', type: 'switch' }, { n: 'List', type: 'switch' }, { n: 'AllMatches', type: 'switch' }, { n: 'Raw', type: 'switch' }, { n: 'InputObject', type: 'any' }, { n: 'Include', type: 'strings' }, { n: 'Exclude', type: 'strings' }, { n: 'Encoding', type: 'string' }, { n: 'LiteralPath', alias: ['PSPath', 'LP'], type: 'strings' }], async (c) => {
    const { b, P } = c;
    const res = b.Pattern.map((pt) => (b.SimpleMatch ? null : psRegex(pt, b.CaseSensitive)));
    const hit = (l) => b.Pattern.some((pt, i) => (b.SimpleMatch ? (b.CaseSensitive ? l.includes(pt) : l.toLowerCase().includes(pt.toLowerCase())) : res[i].test(l)));
    let any = false;
    const scan = (text, it, lines) => {
      for (let k = 0; k < lines.length; k++) {
        tick(c.st, c.sh);
        if (hit(lines[k]) === !b.NotMatch) {
          any = true; if (b.Quiet) return true;
          c.emit(b.Raw ? lines[k] : { $t: 'match', line: lines[k], num: k + 1, it, pattern: b.Pattern[0] });
          if (b.List) return true;
        }
      }
      return false;
    };
    const files = b.Path || b.LiteralPath;
    if (files) {
      for (const p of files) for (const it of expand(c, p)) { if (it.dir) continue; if (scan(it.node.d, it, textLines(it.node.d)) && b.Quiet) break; }
    } else {
      const ins = b.InputObject !== undefined ? enumerate(b.InputObject) : c.input || [];
      let n = 0;
      for (const v of ins) {
        if (v && v.$t === 'item') { if (!v.it.dir) scan(v.it.node.d, v.it, textLines(v.it.node.d)); continue; }
        n++; const line = toStr(v, P);
        if (hit(line) === !b.NotMatch) { any = true; if (b.Quiet) break; c.emit(b.Raw ? line : { $t: 'match', line, num: n, it: null, pattern: b.Pattern[0] }); }
      }
    }
    if (b.Quiet) c.emit(any);
  });
  alias('sls', 'Select-String');

  // Measure-Object: counts, sums, or lines/words/characters
  defP('Measure-Object', UTIL, [{ n: 'Property', pos: 0, type: 'strings' }, { n: 'Sum', type: 'switch' }, { n: 'Average', type: 'switch' }, { n: 'Maximum', type: 'switch' }, { n: 'Minimum', type: 'switch' }, { n: 'StandardDeviation', type: 'switch' },
    { n: 'AllStats', type: 'switch' }, { n: 'Line', type: 'switch' }, { n: 'Word', type: 'switch' }, { n: 'Character', type: 'switch' }, { n: 'IgnoreWhiteSpace', type: 'switch' }, { n: 'InputObject', type: 'any' }], async (c) => {
    const { b, P } = c;
    const ins = (c.input || (b.InputObject !== undefined ? enumerate(b.InputObject) : [])).filter((v) => v !== null && v !== undefined);
    if (b.Line || b.Word || b.Character) {
      let L = 0, W = 0, C = 0;
      for (const v of ins) { const s = toStr(v, P); L += s.split('\n').length; W += (s.match(/\S+/g) || []).length; C += b.IgnoreWhiteSpace ? s.replace(/\s/g, '').length : s.length; }
      c.emit(mkObj('TextMeasureInfo', [['Lines', b.Line ? L : null], ['Words', b.Word ? W : null], ['Characters', b.Character ? C : null], ['Property', null]], { align: { Lines: 'r', Words: 'r', Characters: 'r' } }));
      return;
    }
    const stats = b.AllStats ? { Sum: 1, Average: 1, Maximum: 1, Minimum: 1, StandardDeviation: 1 } : b;
    const props = b.Property || [null];
    for (const prop of props) {
      let vals = prop === null ? ins : ins.map((v) => getProp(v, prop, P)).filter((v) => v !== null && v !== undefined);
      if (prop !== null && !vals.length && ins.length) { c.error('The property "' + prop + '" cannot be found in the input for any objects.'); continue; }
      let nums = null;
      if (stats.Sum || stats.Average || stats.StandardDeviation) nums = vals.map((v) => { try { return toNum(v); } catch (e) { throw new PsError('Input object "' + toStr(v, P) + '" is not numeric.', 'InvalidType', 'Measure-Object'); } });
      const cmpVals = (stats.Maximum || stats.Minimum) ? vals.slice().sort((x, y) => compare(x, y, true)) : [];
      const sum = nums ? nums.reduce((a, x) => a + x, 0) : null, avg = nums && nums.length ? sum / nums.length : null;
      const sd = nums && nums.length > 1 ? Math.sqrt(nums.reduce((a, x) => a + (x - avg) * (x - avg), 0) / (nums.length - 1)) : nums ? 0 : null;
      c.emit(mkObj('GenericMeasureInfo', [['Count', vals.length], ['Average', stats.Average ? avg : null], ['Sum', stats.Sum ? sum : null], ['Maximum', stats.Maximum && cmpVals.length ? cmpVals[cmpVals.length - 1] : null], ['Minimum', stats.Minimum && cmpVals.length ? cmpVals[0] : null], ['StandardDeviation', stats.StandardDeviation ? sd : null], ['Property', prop]], { view: 'list' }));
    }
  });
  alias('measure', 'Measure-Object');
  const sortKey = (c, v, props) => (props ? props.map((p) => (p && p.$t === 'sb' ? null : getProp(v, p, c.P))) : [v && (v.$t === 'item' ? v.it.win : v.$t === 'obj' && v.str === undefined ? toStr(v.props[0] ? v.props[0][1] : null, c.P) : v)]);
  defP('Sort-Object', UTIL, [{ n: 'Property', pos: 0, type: 'any' }, { n: 'Descending', type: 'switch' }, { n: 'Unique', type: 'switch' }, { n: 'CaseSensitive', type: 'switch' }, { n: 'Stable', type: 'switch' }, { n: 'Top', type: 'int' }, { n: 'Bottom', type: 'int' }, { n: 'InputObject', type: 'any' }], async (c) => {
    const { b } = c;
    const props = b.Property === undefined ? null : enumerate(b.Property);
    const keyOf = async (v) => { if (!props) return sortKey(c, v, null); const out = []; for (const p of props) { if (p && p.$t === 'sb') { const r = []; await invokeSb(c.ctx, p, v, (x) => r.push(x)); out.push(collapse(r)); } else if (p && p.$t === 'hash') { const e = getProp(p, 'expression', c.P) || getProp(p, 'e', c.P); if (e && e.$t === 'sb') { const r = []; await invokeSb(c.ctx, e, v, (x) => r.push(x)); out.push(collapse(r)); } else out.push(getProp(v, toStr(e), c.P)); } else out.push(getProp(v, toStr(p, c.P), c.P)); } return out; };
    const ins = c.input || enumerate(b.InputObject);
    const rows = []; for (const v of ins) rows.push({ v, k: await keyOf(v) });
    const cs = !!b.CaseSensitive;
    const cmp = (x, y) => { for (let i = 0; i < x.k.length; i++) { const d = compare(x.k[i], y.k[i], !cs ? 'ci' : false); if (d) return b.Descending ? -d : d; } return 0; };
    rows.sort(cmp);
    let out = rows;
    if (b.Unique) { out = []; for (const r of rows) if (!out.length || x(out[out.length - 1], r)) out.push(r); }
    function x(a, r) { for (let i = 0; i < a.k.length; i++) { const d = cs ? compare(a.k[i], r.k[i], false) : compare(a.k[i], r.k[i], true); if (d) return true; } return false; }
    if (b.Top !== undefined) out = out.slice(0, b.Top); if (b.Bottom !== undefined) out = out.slice(-b.Bottom);
    for (const r of out) c.emit(r.v);
  });
  alias('sort', 'Sort-Object');
  defP('Select-Object', UTIL, [{ n: 'Property', pos: 0, type: 'any' }, { n: 'First', type: 'int' }, { n: 'Last', type: 'int' }, { n: 'Skip', type: 'int' }, { n: 'SkipLast', type: 'int' }, { n: 'Unique', type: 'switch' }, { n: 'ExpandProperty', type: 'string' }, { n: 'ExcludeProperty', type: 'strings' }, { n: 'Index', type: 'any' }, { n: 'InputObject', type: 'any' }], async (c) => {
    const { b, P } = c;
    let ins = (c.input || enumerate(b.InputObject)).slice();
    if (b.Unique) { const seen = []; ins = ins.filter((v) => { const k = toStr(v, P); if (seen.includes(k)) return false; seen.push(k); return true; }); }
    if (b.Skip) ins = ins.slice(b.Skip);
    if (b.SkipLast) ins = ins.slice(0, Math.max(0, ins.length - b.SkipLast));
    if (b.Index !== undefined) ins = enumerate(b.Index).map((i) => ins[toNum(i)]).filter((v) => v !== undefined);
    if (b.First !== undefined || b.Last !== undefined) { const f = b.First !== undefined ? ins.slice(0, b.First) : []; const l = b.Last !== undefined ? ins.slice(Math.max(0, ins.length - b.Last)) : []; ins = b.First !== undefined && b.Last !== undefined ? f.concat(l) : b.First !== undefined ? f : l; }
    if (b.ExpandProperty !== undefined) { for (const v of ins) { const x = getProp(v, b.ExpandProperty, P); if (x === null || x === undefined) { if (!propNames(v).some((n) => n.toLowerCase() === b.ExpandProperty.toLowerCase())) c.error('Property "' + b.ExpandProperty + '" cannot be found.'); continue; } emitAll(x, c.emit); } return; }
    if (b.Property === undefined) { for (const v of ins) c.emit(v); return; }
    const specs = enumerate(b.Property);
    for (const v of ins) {
      tick(c.st, c.sh);
      const props = [];
      for (const s of specs) {
        if (s && s.$t === 'hash') {
          const nm = getProp(s, 'name', P) ?? getProp(s, 'n', P) ?? getProp(s, 'label', P) ?? getProp(s, 'l', P), e = getProp(s, 'expression', P) ?? getProp(s, 'e', P);
          let val = null; if (e && e.$t === 'sb') { const r = []; await invokeSb(c.ctx, e, v, (x) => r.push(x)); val = collapse(r); } else if (e !== null) val = getProp(v, toStr(e), P);
          props.push([toStr(nm === null ? (e && e.text ? e.text : '') : nm), val]); continue;
        }
        const name = toStr(s, P);
        if (hasWild(name, true)) { const re = wildRe(name, true); for (const n of propNames(v)) if (re.test(n) && !(b.ExcludeProperty || []).some((x) => x.toLowerCase() === n.toLowerCase())) props.push([n, getProp(v, n, P)]); continue; }
        const real = propNames(v).find((n) => n.toLowerCase() === name.toLowerCase()) || name;
        props.push([real, getProp(v, name, P)]);
      }
      c.emit(mkObj('PSCustomObject', props));
    }
  });
  alias('select', 'Select-Object');
  const WHERE_OPS = ['EQ', 'NE', 'GT', 'GE', 'LT', 'LE', 'Like', 'NotLike', 'Match', 'NotMatch', 'Contains', 'NotContains', 'In', 'NotIn', 'CEQ', 'CNE', 'CGT', 'CGE', 'CLT', 'CLE', 'CLike', 'CNotLike', 'CMatch', 'CNotMatch', 'Is', 'IsNot'];
  defP('Where-Object', CORE, [{ n: 'Property', alias: ['FilterScript'], pos: 0, type: 'any' }, { n: 'Value', pos: 1, type: 'any' }, { n: 'InputObject', type: 'any' }].concat(WHERE_OPS.map((o) => ({ n: o, type: 'switch', alias: o === 'EQ' ? ['IEQ'] : [] }))), async (c) => {
    const { b, P } = c;
    const ins = c.input || enumerate(b.InputObject);
    const f = b.Property;
    if (f === undefined) throw new PsError('Cannot process command because of one or more missing mandatory parameters: FilterScript.', 'InvalidArgument', 'Where-Object');
    const ops = WHERE_OPS.filter((o) => b[o]);
    if (ops.length > 1) throw new PsError('Parameter set cannot be resolved using the specified named parameters. One or more parameters issued cannot be used together or an insufficient number of parameters were provided.', 'InvalidArgument', 'Where-Object');
    for (const v of ins) {
      tick(c.st, c.sh);
      let keep;
      if (f && f.$t === 'sb') { const r = []; await invokeSb(c.ctx, f, v, (x) => r.push(x)); keep = truthy(collapse(r)); }
      else {
        const val = getProp(v, toStr(f, P), P);
        if (!ops.length) keep = truthy(val);
        else { let op = ops[0].toLowerCase(), cs = false; if (/^c(eq|ne|gt|ge|lt|le|like|notlike|match|notmatch)$/.test(op)) { cs = true; op = op.slice(1); } keep = truthy(cmpOp(c.ctx, op, cs, val, b.Value === undefined ? null : b.Value)); }
      }
      if (keep) c.emit(v);
    }
  });
  alias('where ?', 'Where-Object');
  defP('ForEach-Object', CORE, [{ n: 'Process', alias: ['MemberName'], pos: 0, type: 'any', rest: true }, { n: 'Begin', type: 'sb' }, { n: 'End', type: 'sb' }, { n: 'ArgumentList', alias: ['Args'], type: 'any' }, { n: 'InputObject', type: 'any' }], async (c) => {
    const { b, P } = c;
    const ins = c.input || (b.InputObject !== undefined ? enumerate(b.InputObject) : []);
    let parts = b.Process === undefined ? [] : Array.isArray(b.Process) && !(b.Process.length && b.Process[0] && b.Process[0].$t === undefined && Array.isArray(b.Process[0])) ? b.Process.slice() : [b.Process];
    if (!parts.length && !b.Begin && !b.End) throw new PsError('Cannot process command because of one or more missing mandatory parameters: Process.', 'InvalidArgument', 'ForEach-Object');
    if (parts.length && !(parts[0] && parts[0].$t === 'sb')) {
      const member = toStr(parts[0], P), args = parts.length > 1 ? parts.slice(1) : enumerate(b.ArgumentList);
      for (const v of ins) {
        tick(c.st, c.sh);
        const isProp = propNames(v).some((n) => n.toLowerCase() === member.toLowerCase()) || (typeof v === 'string' && member.toLowerCase() === 'length') || (Array.isArray(v));
        if (isProp || !args.length && getProp(v, member, P) !== null) { emitAll(getProp(v, member, P), c.emit); continue; }
        emitAll(callMethod(v, member, args, P), c.emit);
      }
      return;
    }
    let begin = b.Begin, end = b.End, proc = parts;
    if (parts.length === 2) { begin = parts[0]; proc = [parts[1]]; } else if (parts.length >= 3) { begin = parts[0]; proc = [parts[1]]; end = parts[2]; }
    if (begin) await invokeSb(c.ctx, begin, null, c.emit);
    if (proc[0]) for (const v of ins) await invokeSb(c.ctx, proc[0], v, c.emit);
    if (end) await invokeSb(c.ctx, end, null, c.emit);
  });
  alias('foreach %', 'ForEach-Object');

  // about the commands themselves
  const cmdInfo = (type, name, ver, src) => mkObj('CommandInfo', [['CommandType', type], ['Name', name], ['Version', ver], ['Source', src]], { view: 'command' });
  const VERSION_OF = (mod) => (mod === CORE ? PS_VER + '.500' : '7.0.0.0');
  function commandRows(name) {
    const lo = name.toLowerCase(), out = [];
    if (has(ALIASES, lo)) { const t = ALIASES[lo]; const real = has(CMDLETS, t.toLowerCase()) ? CMDLETS[t.toLowerCase()].name : has(FUNCS, t.toLowerCase()) ? FUNCS[t.toLowerCase()].name : t; out.push(cmdInfo('Alias', lo + ' -> ' + real, '', '')); }
    else if (has(FUNCS, lo)) out.push(cmdInfo('Function', FUNCS[lo].name, '', ''));
    else if (has(CMDLETS, lo)) out.push(cmdInfo('Cmdlet', CMDLETS[lo].name, VERSION_OF(CMDLETS[lo].mod), CMDLETS[lo].mod));
    else { const base = lo.replace(/\.(exe|com)$/, ''); if (NATIVE.includes(base) && (base !== lo || !has(ALIASES, base))) { const file = VIRT_FILES.find((f) => f.replace(/\.(exe|com)$/, '') === base) || base + '.exe'; out.push(cmdInfo('Application', file, '10.0.' + WIN_VER.split('.').slice(2).join('.'), 'C:\\Windows\\system32\\' + file)); } }
    return out;
  }
  const allNames = () => Object.keys(ALIASES).concat(Object.keys(FUNCS), Object.keys(CMDLETS));
  defP('Get-Command', CORE, [{ n: 'Name', pos: 0, type: 'strings' }, { n: 'CommandType', alias: ['Type'], type: 'string' }, { n: 'Module', type: 'strings' }], async (c) => {
    const names = c.b.Name;
    if (!names) { const rows = []; for (const n of allNames()) rows.push(...commandRows(n)); rows.sort((x, y) => ntfsOrder(x.props[1][1], y.props[1][1])); for (const r of rows) if (!c.b.CommandType || r.props[0][1].toLowerCase() === c.b.CommandType.toLowerCase()) c.emit(r); return; }
    for (const n of names) {
      let rows = [];
      if (hasWild(n, true)) { const re = wildRe(n, true); for (const k of allNames()) if (re.test(k)) rows.push(...commandRows(k)); rows.sort((x, y) => ntfsOrder(x.props[1][1], y.props[1][1])); }
      else { rows = commandRows(n); if (has(c.st.funcs, n.toLowerCase())) rows = [cmdInfo('Function', c.st.funcs[n.toLowerCase()].name, '', '')]; }
      if (!rows.length) { if (!hasWild(n, true)) c.error(notFound(n).slice(n.length + 2)); continue; }
      for (const r of rows) c.emit(r);
    }
  });
  alias('gcm', 'Get-Command');
  defP('Get-Alias', UTIL, [{ n: 'Name', pos: 0, type: 'strings' }, { n: 'Definition', type: 'strings' }], async (c) => {
    let names = Object.keys(ALIASES).sort(ntfsOrder);
    const real = (lo) => { const t = ALIASES[lo]; return has(CMDLETS, t.toLowerCase()) ? CMDLETS[t.toLowerCase()].name : has(FUNCS, t.toLowerCase()) ? FUNCS[t.toLowerCase()].name : t; };
    if (c.b.Definition) { const res = c.b.Definition.map((d) => wildRe(d, true)); names = names.filter((n) => res.some((r) => r.test(real(n)))); }
    if (c.b.Name) { const out = []; for (const n of c.b.Name) { const re = wildRe(n, true), m = names.filter((x) => re.test(x)); if (!m.length && !hasWild(n, true)) c.error('This command cannot find a matching alias because an alias with the name \'' + n + '\' does not exist.'); for (const x of m) if (!out.includes(x)) out.push(x); } names = out; }
    for (const n of names) c.emit(cmdInfo('Alias', n + ' -> ' + real(n), '', ''));
  });
  alias('gal', 'Get-Alias');
  function syntaxOf(spec) {
    const parts = spec.params.map((p) => { const t = p.type === 'switch' ? '' : ' <' + ({ strings: 'string[]', string: 'string', int: 'int', any: 'Object', sb: 'scriptblock' })[p.type] + '>'; const name = p.pos !== undefined ? '[-' + p.n + ']' : '-' + p.n; return p.mandatory && p.pos !== undefined ? name + t : '[' + name + t + ']'; });
    return spec.name + ' ' + parts.join(' ') + ' [<CommonParameters>]';
  }
  defP('Get-Help', CORE, [{ n: 'Name', pos: 0, type: 'string' }, { n: 'Full', type: 'switch' }, { n: 'Examples', type: 'switch' }, { n: 'Detailed', type: 'switch' }, { n: 'Online', type: 'switch' }], async (c) => {
    const n = c.b.Name;
    if (!n) {
      c.emit('\nTOPIC\n    PowerShell Help System\n\nSHORT DESCRIPTION\n    Displays help about PowerShell cmdlets and concepts.\n\nLONG DESCRIPTION\n    This practice PowerShell has the cmdlets that work with files and text:\n    Get-ChildItem (dir, ls), Set-Location (cd), Get-Location (pwd), Get-Content (cat, type),\n    Set-Content, Add-Content, Out-File, New-Item, mkdir, Copy-Item (copy, cp), Move-Item (move, mv),\n    Rename-Item (ren), Remove-Item (del, rm), Test-Path, Select-String (sls), Measure-Object,\n    Sort-Object, Select-Object, Where-Object (?), ForEach-Object (%), Write-Output (echo), Write-Host,\n    Get-Command, Get-Alias, Get-Help, Clear-Host (cls), Get-Date.\n\n    Get-Help NAME shows the syntax and aliases of one. Get-Command lists them all.\n');
      return;
    }
    const lo = n.toLowerCase(), t = has(ALIASES, lo) ? ALIASES[lo].toLowerCase() : lo;
    const spec = has(CMDLETS, t) ? CMDLETS[t] : has(FUNCS, t) ? CMDLETS[FUNCS[t].target.toLowerCase()] : null;
    if (!spec) throw new PsError('Get-Help could not find ' + n + ' in a help file in this session. To download updated help topics type: "Update-Help". To get help online, search for the help topic in the TechNet library at https:/go.microsoft.com/fwlink/?LinkID=107116.', 'ResourceUnavailable', 'Get-Help');
    const name = has(FUNCS, t) ? FUNCS[t].name : spec.name;
    const als = Object.keys(ALIASES).filter((a) => ALIASES[a].toLowerCase() === name.toLowerCase()).sort(ntfsOrder);
    c.emit('\nNAME\n    ' + name + '\n\nSYNTAX\n    ' + syntaxOf(spec) + '\n\n\nALIASES\n' + (als.length ? als.map((a) => '    ' + a).join('\n') : '    None') + '\n\n\nREMARKS\n    Get-Help cannot find the Help files for this cmdlet on this computer. It is displaying only partial help.\n        -- To download and install Help files for the module that includes this cmdlet, use Update-Help.\n');
  });
  alias('help man', 'Get-Help');
  defP('Get-Date', UTIL, [{ n: 'Date', pos: 0, type: 'any' }, { n: 'Format', type: 'string' }, { n: 'Year', type: 'int' }, { n: 'Month', type: 'int' }, { n: 'Day', type: 'int' }, { n: 'Hour', type: 'int' }, { n: 'Minute', type: 'int' }, { n: 'Second', type: 'int' }], async (c) => {
    const { b } = c;
    let ms = nowOf(c.sh);
    if (b.Date !== undefined) ms = b.Date && b.Date.$t === 'date' ? b.Date.ms : cast('datetime', b.Date).ms;
    const d = new Date(ms);
    if (b.Year !== undefined) d.setFullYear(b.Year); if (b.Month !== undefined) d.setMonth(b.Month - 1); if (b.Day !== undefined) d.setDate(b.Day);
    if (b.Hour !== undefined) d.setHours(b.Hour); if (b.Minute !== undefined) d.setMinutes(b.Minute); if (b.Second !== undefined) d.setSeconds(b.Second);
    c.emit(b.Format !== undefined ? dateFormat(d.getTime(), b.Format) : { $t: 'date', ms: d.getTime() });
  });
  for (const n of ['Get-Process', 'Stop-Process', 'Start-Process', 'Get-Service', 'Start-Service', 'Stop-Service', 'Invoke-WebRequest', 'Invoke-RestMethod', 'Test-Connection', 'Get-NetIPAddress', 'Restart-Computer', 'Stop-Computer', 'Get-ComputerInfo', 'Install-Module', 'Get-History', 'Invoke-Expression', 'Start-Job', 'Get-WmiObject', 'Get-CimInstance', 'Set-ExecutionPolicy', 'Update-Help'])
    defP(n, n.startsWith('Invoke-') || n === 'Get-History' || n === 'Start-Job' || n === 'Update-Help' ? CORE : MGMT, [{ n: 'Args', pos: 0, type: 'any', rest: true }], async () => { throw new PsError(n + ' is not available in this practice PowerShell (it works only with files and text).', 'NotImplemented', n); });
  alias('ps gps kill iwr irm curl wget iex h history', 'Get-Process');
  ALIASES.kill = 'Stop-Process'; ALIASES.iwr = 'Invoke-WebRequest'; ALIASES.irm = 'Invoke-RestMethod'; ALIASES.iex = 'Invoke-Expression'; ALIASES.h = 'Get-History'; ALIASES.history = 'Get-History';
  delete ALIASES.curl; delete ALIASES.wget;   // in PowerShell 7 these are the real programs, not aliases
  // Format-Table and Format-List: the properties named (or the default view)
  const fmtProps = async (c, v, specs) => {
    const props = [];
    for (const s of specs) {
      if (s && s.$t === 'hash') { const nm = getProp(s, 'name', c.P) ?? getProp(s, 'n', c.P) ?? getProp(s, 'label', c.P) ?? getProp(s, 'l', c.P), e = getProp(s, 'expression', c.P) ?? getProp(s, 'e', c.P); let val = null; if (e && e.$t === 'sb') { const r = []; await invokeSb(c.ctx, e, v, (x) => r.push(x)); val = collapse(r); } else if (e !== null) val = getProp(v, toStr(e), c.P); props.push([toStr(nm === null ? (e && e.text ? e.text : '') : nm), val]); continue; }
      const name = toStr(s, c.P);
      if (hasWild(name, true)) { const re = wildRe(name, true); for (const n of propNames(v)) if (re.test(n)) props.push([n, getProp(v, n, c.P)]); continue; }
      props.push([propNames(v).find((n) => n.toLowerCase() === name.toLowerCase()) || name, getProp(v, name, c.P)]);
    }
    return props;
  };
  const VERSION_INFO = (win) => 'File:             ' + win + '\nInternalName:     \nOriginalFilename: \nFileVersion:      \nFileDescription:  \nProduct:          \nProductVersion:   \nDebug:            False\nPatched:          False\nPreRelease:       False\nPrivateBuild:     False\nSpecialBuild:     False\nLanguage:         \n';
  defP('Format-Table', UTIL, [{ n: 'Property', pos: 0, type: 'any' }, { n: 'AutoSize', type: 'switch' }, { n: 'Wrap', type: 'switch' }, { n: 'HideTableHeaders', type: 'switch' }, { n: 'InputObject', type: 'any' }], async (c) => {
    const ins = c.input || enumerate(c.b.InputObject);
    for (const v of ins) {
      tick(c.st, c.sh);
      if (c.b.Property === undefined) { c.emit(v && v.$t === 'obj' && v.view !== 'command' ? Object.assign({}, v, { view: 'table', widths: v.widths }) : v); continue; }
      c.emit(mkObj('FormatTable', await fmtProps(c, v, enumerate(c.b.Property)), { view: 'table' }));
    }
  });
  alias('ft', 'Format-Table');
  defP('Format-List', UTIL, [{ n: 'Property', pos: 0, type: 'any' }, { n: 'InputObject', type: 'any' }], async (c) => {
    const ins = c.input || enumerate(c.b.InputObject);
    for (const v of ins) {
      tick(c.st, c.sh);
      if (c.b.Property !== undefined) { c.emit(mkObj('FormatList', await fmtProps(c, v, enumerate(c.b.Property)), { view: 'list' })); continue; }
      if (v && v.$t === 'item') {   // pwsh's list view of a file or a folder
        const it = v.it, d = { $t: 'date', ms: it.node.m };
        const props = [['Name', it.name]].concat(it.dir ? [] : [['Length', sizeOf(it)]], [['CreationTime', d], ['LastWriteTime', d], ['LastAccessTime', d], ['Mode', it.dir ? 'd----' : '-a---'], ['LinkType', null], ['Target', null]], it.dir ? [] : [['VersionInfo', VERSION_INFO(it.win)]]);
        c.emit(mkObj('FileList', props, { view: 'list', group: c.P.winOf(it.comps.slice(0, -1)) })); continue;
      }
      if (v && v.$t === 'obj') { c.emit(Object.assign({}, v, { view: 'list' })); continue; }
      if (v && (v.$t === 'match' || v.$t === 'date')) { c.emit(mkObj('FormatList', propNames(v).map((n) => [n, getProp(v, n, c.P)]), { view: 'list' })); continue; }
      c.emit(v);
    }
  });
  alias('fl', 'Format-List');
  for (const n of ['get-childitem', 'get-item', 'test-path', 'remove-item', 'copy-item', 'move-item', 'rename-item']) CMDLETS[n].pipeStrings = true;
  FUNCS['cd..'] = { name: 'cd..', target: 'Set-Location', preset: { Path: '..' } };
  FUNCS['cd\\'] = { name: 'cd\\', target: 'Set-Location', preset: { Path: '\\' } };

  /* ---------------- a line typed at PS> ---------------- */
  async function psLine(sh, st, line, io) {
    let src = line;
    if (!src.trim()) return st.ok ? 0 : 1;
    let tree;
    for (let k = 0; ; k++) {
      try { tree = psParse(src); break; }
      catch (e) {
        if (!(e instanceof PsParseError)) throw e;
        if (e.incomplete && io.ask && io.tty && k < 1000 && src.length < LIMITS.fileBytes) {   // as pwsh's console does: an unfinished line asks for more with >>
          const more = await io.ask('>> ', 'PowerShell waits for the rest of the command (Ctrl+C cancels)');
          if (more === null || more === undefined || sh.cancelled) { if (sh.cancelled) io.err('^C\n'); return st.ok ? 0 : 1; }
          src += '\n' + String(more).replace(/\u0000/g, ''); continue;
        }
        io.err(parseErrorText(e, src)); st.ok = false; return 1;
      }
    }
    const P = paths(sh);
    const fmt = makeFormatter(P, (s) => io.out(s));
    const ctx = { sh, st, io, P, under: [], depth: 0, args: [], err: (text) => io.err(text + '\n') };
    ctx.topEmit = (v) => fmt.write(v);
    ctx.flush = () => fmt.end();
    st.nativeFailed = false;
    try { await runStmts(ctx, tree, ctx.topEmit); }
    catch (e) {
      if (e instanceof PsExit) { st.exited = e.code; }
      else if (e instanceof PsBreak || e instanceof PsReturn) { /* break or return at the prompt: the line ends */ }
      else { fmt.end(); throw e; }
    }
    fmt.end();
    return st.exited !== null ? st.exited : st.ok ? 0 : (st.lastExit && st.nativeFailed ? st.lastExit : 1);
  }

  /** powershell / pwsh typed in bash, cmd or PowerShell: args are its arguments */
  async function startPs(sh, parent, args, io) {
    enterWin(sh);
    const st = newState(sh, 'ps', parent && parent.kind ? parent : null);
    if (st.depth > MAX_NEST * 2) throw new WinStop('nest', 1);
    if (parent && parent.run) st.run = parent.run; else io = countIO(io, st.run, sh);
    let cmd = null, file = null, nologo = false, noexit = false, fileArgs = [];
    const names = ['command', 'file', 'nologo', 'noprofile', 'noexit', 'noninteractive', 'executionpolicy', 'version', 'help', 'windowstyle', 'login', 'interactive', 'mta', 'sta', 'inputformat', 'outputformat', 'workingdirectory', 'encodedcommand', 'configurationname', 'settingsfile', 'noprofileloadtime'];
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (/^[-\/]/.test(a) && a.length > 1) {
        const f = a.slice(1).toLowerCase();
        const m = f === 'c' ? 'command' : f === 'f' ? 'file' : f === 'v' ? 'version' : f === 'h' || f === '?' ? 'help' : f === 'nop' ? 'noprofile' : f === 'noni' ? 'noninteractive' : f === 'ep' ? 'executionpolicy' : f === 'wd' ? 'workingdirectory' : names.filter((n) => n.startsWith(f)).length === 1 ? names.find((n) => n.startsWith(f)) : null;
        if (m === 'command') { cmd = args.slice(i + 1).join(' '); break; }
        if (m === 'file') { file = args[i + 1]; fileArgs = args.slice(i + 2); break; }
        if (m === 'nologo') nologo = true; else if (m === 'noexit') noexit = true;
        else if (m === 'version') { io.out('PowerShell ' + PS_VER + '\n'); return 0; }
        else if (m === 'help') { io.out('Usage: pwsh[.exe] [-Login] [[-File] <filePath> [args]]\n                  [-Command { - | <script-block> [-args <arg-array>]\n                                | <string> [<CommandParameters>] } ]\n                  [-NoExit] [-NoLogo] [-NoProfile] [-NonInteractive]\n\n       pwsh[.exe] -h | -Help | -? | /?\n\nPowerShell Online Help https://aka.ms/powershell-docs\n\nAll parameters are case-insensitive.\n'); return 0; }
        else if (m === 'executionpolicy' || m === 'windowstyle' || m === 'inputformat' || m === 'outputformat' || m === 'workingdirectory' || m === 'configurationname' || m === 'settingsfile') i++;
        else if (!m) { io.err("The argument '" + a + "' is not recognized as the name of a script file. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.\n\nUsage: pwsh[.exe] [-Login] [[-File] <filePath> [args]]\n"); return 64; }
        continue;
      }
      file = a; fileArgs = args.slice(i + 1); break;
    }
    if (cmd !== null || file !== null) {
      let code; const keep = keepCwd(sh);
      if (file !== null) {
        const r = paths(sh).resolve(file);
        if (!r.item || r.item.dir || !/\.ps1$/i.test(r.item.name)) { io.err(r.item && !r.item.dir ? "Processing -File '" + file + "' failed because the file does not have a '.ps1' extension. Specify a valid PowerShell script file name, and then try again.\n" : "The argument '" + file + "' is not recognized as the name of a script file. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.\n\nUsage: pwsh[.exe] [-Login] [[-File] <filePath> [args]]\n"); return 64; }
        const P = paths(sh), fmt = makeFormatter(P, (s) => io.out(s));
        const ctx = { sh, st, io, P, under: [], depth: 0, args: fileArgs, err: (text) => io.err(text + '\n') };
        ctx.topEmit = (v) => fmt.write(v); ctx.flush = () => fmt.end();
        await runScript(ctx, r.item, ctx.topEmit, fileArgs); fmt.end();
        code = st.lastExit !== null && st.lastExit !== undefined ? st.lastExit : st.ok ? 0 : 1;
      } else code = await psLine(sh, st, cmd, Object.assign({}, io, { tty: false }));
      if (!noexit || st.exited !== null || !io.tty) { keep(); return st.exited !== null ? st.exited : code; }   // a child process: its cd ends with it
      st.exited = null;
    } else if (!io.tty || io.piped) {   // no keyboard: the lines of its input are run, then it ends
      if (!nologo) io.out(PS_BANNER);
      if (io.stdin) { const text = io.stdin.text.slice(io.stdin.pos); io.stdin.pos = io.stdin.text.length; for (const l of text.split('\n')) { if (st.exited !== null) break; await psLine(sh, st, l, Object.assign({}, io, { stdin: null, tty: false, ask: null })); } }
      return st.exited !== null ? st.exited : st.ok ? 0 : 1;
    }
    if (nestLevel(sh) >= MAX_NEST) throw new WinStop('nest', 1);
    if (cmd === null && file === null && !nologo) io.out(PS_BANNER);
    sh.dialect.push(entry(sh, st));
    return 0;
  }

  /* ---------------- Tab completion in cmd and PowerShell ---------------- */
  function complete(sh, st, line) {
    const P = paths(sh);
    // just after a closing quote (python -c "print(1)"): no word to complete; it used to complete a file name glued to the quote
    let inQ = '';
    for (const c of line) { if (inQ) { if (c === inQ) inQ = ''; } else if (c === '"' || (st.kind === 'ps' && c === "'")) inQ = c; }
    if (!inQ && /["']$/.test(line) && (line.endsWith('"') || st.kind === 'ps')) return { start: line.length, items: [], display: [] };
    const m = line.match(/(?:^|[\s|;&(])("?)([^\s|;&("]*)$/);
    const quote = m ? m[1] : '', word = m ? m[2] : '', start = line.length - word.length - quote.length;
    const before = line.slice(0, start).trim();
    const atCommand = before === '' || /(?:[|;&(]|&&|\|\|)$/.test(before);
    const lo = word.toLowerCase();
    let items = [], display = [];
    if (atCommand && !/[\\\/]/.test(word) && !word.startsWith('.')) {
      const names = st.kind === 'cmd' ? Object.keys(CMDS) : Object.keys(ALIASES).concat(Object.keys(FUNCS), Object.values(CMDLETS).map((c) => c.name), NATIVE.filter((n) => !['where', 'sort'].includes(n)), Object.keys(st.funcs || {}));
      display = [...new Set(names)].filter((n) => n.toLowerCase().startsWith(lo)).sort(ntfsOrder);
      items = display.map((n) => n + ' ');
      return { start, items, display };
    }
    if (st.kind === 'ps' && word.startsWith('-')) {   // a parameter of the cmdlet at the start of this command
      const cm = before.match(/(?:^|[|;(]|&&|\|\|)\s*([^\s|;&()]+)[^|;&()]*$/);
      if (cm) {
        let n = cm[1].toLowerCase(); if (has(ALIASES, n)) n = ALIASES[n].toLowerCase(); if (has(FUNCS, n)) n = FUNCS[n].target.toLowerCase();
        if (has(CMDLETS, n)) { display = CMDLETS[n].params.concat(COMMON).map((p) => '-' + p.n).filter((p) => p.toLowerCase().startsWith(lo)); items = display.map((p) => p + ' '); return { start, items, display }; }
      }
    }
    const slash = Math.max(word.lastIndexOf('\\'), word.lastIndexOf('/'));
    const dirPart = slash >= 0 ? word.slice(0, slash + 1) : '', namePart = word.slice(slash + 1).toLowerCase();
    const r = P.resolve(dirPart === '' ? '.' : dirPart, { tilde: st.kind === 'ps' });
    if (!r.item || !r.item.dir) return { start, items: [], display: [] };
    const cmdWord = (before.match(/^\s*(\S+)/) || [])[1] || '';
    const dirsOnly = /^(cd|chdir|rd|rmdir|pushd|set-location|sl)$/i.test(cmdWord);
    for (const ch of P.children(r.item)) {
      if (!ch.name.toLowerCase().startsWith(namePart) || (dirsOnly && !ch.dir)) continue;
      const full = dirPart + ch.name, needQ = /[\s&()]/.test(full) || quote;
      display.push(ch.name + (ch.dir ? '\\' : ''));
      items.push(needQ ? '"' + full + (ch.dir ? '\\' : '"') : full + (ch.dir ? '\\' : ''));
    }
    return { start, items, display };
  }

  /* ---------------- the prompts of a lesson's listing ---------------- */
  /** the lines of a lesson example (typed one at a time, starting in bash at the home directory) → the prompt shown before each:
      '$' for bash, 'C:\Users\student>' in cmd, 'PS C:\Users\student>' in PowerShell. A cd is followed as text (it cannot fail here). */
  function listingPrompts(lines) {
    const stack = []; let cwd = ['Users', USER];
    const go = (path, ps) => {
      let s = String(path).trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
      if (!s) { if (ps) cwd = ['Users', USER]; return; }
      s = s.replace(/\//g, '\\');
      if (/^[A-Za-z]:/.test(s)) { s = s.slice(2); if (!s) return; }
      if (ps && (s === '~' || s.startsWith('~\\'))) { cwd = ['Users', USER]; s = s.slice(2); }
      else if (s.startsWith('\\')) cwd = [];
      for (const part of s.split('\\')) { if (!part || part === '.') continue; if (part === '..') cwd.pop(); else cwd.push(part); }
    };
    const out = [];
    for (const raw of lines) {
      const top = stack[stack.length - 1], l = String(raw).trim(), lo = l.toLowerCase();
      const here = 'C:\\' + cwd.join('\\');
      out.push(!top ? '$' : top === 'cmd' ? here + (here.endsWith('\\') ? '' : '') + '>' : 'PS ' + here + '>');
      if (/^cmd(\.exe)?(\s+\/[qdaue](:\S*)?)*\s*$/i.test(l) || /^cmd(\.exe)?\s+\/k\b/i.test(l)) { stack.push('cmd'); continue; }
      if (/^(powershell|pwsh)(\.exe)?((\s+-(nologo|noprofile|nop|noexit))*)\s*$/i.test(l)) { stack.push('ps'); continue; }
      if (!top) {
        const m = l.match(/^cd(?:\s+(.*))?$/);
        if (m) { const t = (m[1] || '~').trim(); if (t === '~' || t === '') cwd = ['Users', USER]; else if (t.startsWith('~/')) { cwd = ['Users', USER]; go(t.slice(2)); } else if (t.startsWith('/home')) { cwd = ['Users']; go(t.slice(5)); } else if (t.startsWith('/tmp')) { cwd = ['Temp']; go(t.slice(4)); } else if (t.startsWith('/')) cwd = []; else go(t); }
        continue;
      }
      if (/^exit(\s+(\/b\s*)?-?\d+)?\s*$/i.test(l)) { stack.pop(); continue; }
      if (top === 'cmd') {
        const m = l.match(/^(?:cd|chdir|pushd)(?=[\s.\\\/]|$)\s*(?:\/d\s+)?(.*)$/i);
        if (m && m[1].trim()) go(m[1], false);
      } else {
        const m = l.match(/^(?:cd|sl|chdir|set-location|push-location|pushd)(?:\s+(?:-path\s+)?(.*))?$/i);
        if (m && !/[|;]/.test(m[1] || '')) { if (m[1] === undefined || !m[1].trim()) cwd = ['Users', USER]; else if (m[1].trim() !== '-' && m[1].trim() !== '+') go(m[1], true); }
        else if (/^cd\.\.$/i.test(lo)) cwd.pop(); else if (/^cd\\$/i.test(lo)) cwd = [];
      }
    }
    return out;
  }

  /* ---------------- the bash commands that start them ---------------- */
  async function fromBash(sh, io, fn) {
    winState(sh);
    try { return await fn(); }
    catch (e) { if (!(e instanceof WinStop)) throw e; return stopMessage(e, io, { kind: 'cmd' }); }
  }
  const rebuild = (args) => args.map((a) => (/[\s&|<>^]/.test(a) || a === '' ? '"' + a + '"' : a)).join(' ');
  const CMD_SPEC = { cat: 'shell', use: 'cmd [/c command]',
    desc: 'Start the Windows Command Prompt (cmd.exe) over the same files. C:\\Users\\student is your home folder; type exit to come back to bash. cmd /c "command" runs one command and comes back.',
    ex: ['cmd', 'cmd /c dir', 'cmd /c "type notes.txt"'],
    notes: 'Inside: dir, cd, type, copy, move, ren, del, mkdir (md), rmdir (rd), echo, set, cls, more, find, findstr, sort, tree, where, xcopy, ver, vol, whoami, hostname, help, exit, and python, java, javac and git. Paths use \\ (cmd\'s own commands read / as the start of an option, so write C:\\Users\\student\\notes, or put a / path in quotes); names ignore upper and lower case. %NAME% is a variable (set NAME=value). C:\\Temp is /tmp; C:\\Windows is a small read-only folder. Files are written with Unix line ends, so bash sees the same text.',
    run: (args, io, sh) => fromBash(sh, io, () => startCmd(sh, null, rebuild(args), io)) };
  const PS_SPEC = { cat: 'shell', use: 'powershell [-Command "..."]   (or pwsh)',
    desc: 'Start PowerShell 7 over the same files. C:\\Users\\student is your home folder; type exit to come back to bash. pwsh is the same; powershell -Command "..." runs one line and comes back.',
    ex: ['powershell', 'pwsh -c "Get-ChildItem"', 'powershell -Command "Get-Content notes.txt | Measure-Object -Line"'],
    notes: 'Inside: Get-ChildItem (dir, ls), Set-Location (cd), Get-Location (pwd), Get-Content (cat, type), Set-Content, Add-Content, Out-File, New-Item, mkdir, Copy-Item (copy, cp), Move-Item (move, mv), Rename-Item (ren), Remove-Item (del, rm), Test-Path, Select-String (sls), Measure-Object, Sort-Object, Select-Object, Where-Object (?), ForEach-Object (%), Write-Output (echo), Write-Host, Get-Command, Get-Alias, Get-Help, Get-Date, Clear-Host (cls); variables ($name = "x"), "text $name", if, foreach, while, functions; and python, java, javac, git and cmd. Pipes carry objects: Get-ChildItem | Sort-Object Length | Select-Object -First 3. Note: on a real Windows computer, powershell starts the older Windows PowerShell 5.1; here every name starts PowerShell 7.',
    run: (args, io, sh) => fromBash(sh, io, () => startPs(sh, null, args, io)) };
  // help lists each once; the other names (cmd.exe, pwsh...) have the same manual page and no line of their own in help
  SHELL.register('cmd', CMD_SPEC); SHELL.register('cmd.exe', Object.assign({}, CMD_SPEC, { ex: [] }));
  SHELL.register('powershell', PS_SPEC); SHELL.register('powershell.exe pwsh pwsh.exe', Object.assign({}, PS_SPEC, { ex: [] }));

  return { listingPrompts, startCmd, startPs, psParse, CMDS, CMDLETS, ALIASES, paths, WIN_VER, PS_VER, CMD_BANNER, PS_BANNER };
});
