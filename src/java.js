/* A Java interpreter for teaching: the part of Java an introductory course uses, checked the way javac checks it and run the way the
   JVM runs it, in a Web Worker (src/javaworker.js) or in node (the tests). Nothing in it evaluates JavaScript text.

   What it covers: classes with fields, constructors, methods (static and instance, overloaded), inheritance with super and dynamic
   dispatch, abstract classes and interfaces, private/public access, the primitive types with Java's exact arithmetic (32-bit int,
   64-bit long as BigInt, double, char), String, StringBuilder, arrays (any depth), ArrayList, HashMap, HashSet, TreeMap, TreeSet,
   Map.Entry, Scanner on System.in, Random (Java's own generator, so a seeded program prints what real Java prints), Math, Integer,
   Double, Character, Arrays, Collections, System.out.print/println/printf, String.format, exceptions with try/catch/finally and
   user-defined exception classes, switch (classic and arrow, and switch expressions with yield), enhanced for, labelled break/continue, var.
   Not covered: generics in user classes, lambdas and method references, nested or anonymous classes, enums, interfaces with default
   methods, threads, files, checked-exception analysis ("unreported exception"), definite assignment ("might not have been
   initialized"), unreachable-code errors.

   Exposed as window.JAVA (browser) or module.exports (node):
     JAVA.run(code, stdin, { maxSteps, maxMs, write(text), more() }) → { out, err, exit }   err is the compile error or the uncaught exception text
   (src/javautil.js wraps a method-writing exercise in a class with a main, for the checker.) */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.JAVA = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ======================================================================================================================== types */
  const PRIMS = ['byte', 'short', 'int', 'long', 'float', 'double', 'char', 'boolean'];
  const BOX = { byte: 'Byte', short: 'Short', int: 'Integer', long: 'Long', float: 'Float', double: 'Double', char: 'Character', boolean: 'Boolean' };
  const UNBOX = {}; for (const p in BOX) UNBOX[BOX[p]] = p;
  const prim = (n) => ({ k: 'prim', n });
  const cls = (n, args) => ({ k: 'class', n, args: args || [] });
  const arr = (e) => ({ k: 'array', e });
  const T = { int: prim('int'), long: prim('long'), double: prim('double'), float: prim('float'), boolean: prim('boolean'), char: prim('char'), byte: prim('byte'), short: prim('short'),
    void: { k: 'void' }, null: { k: 'null' }, String: cls('String'), Object: cls('Object'), any: { k: 'any' } };
  const isPrim = (t) => t.k === 'prim';
  const isNumeric = (t) => t.k === 'prim' && t.n !== 'boolean';
  const isIntegral = (t) => t.k === 'prim' && ['byte', 'short', 'int', 'long', 'char'].includes(t.n);
  const isRef = (t) => t.k === 'class' || t.k === 'array' || t.k === 'null' || t.k === 'any';
  const isString = (t) => t.k === 'class' && t.n === 'String';
  const isBoolean = (t) => t.k === 'prim' && t.n === 'boolean';
  const same = (a, b) => a.k === b.k && (a.k !== 'prim' || a.n === b.n) && (a.k !== 'class' || a.n === b.n) && (a.k !== 'array' || same(a.e, b.e));
  const RANK = { byte: 1, short: 2, char: 2, int: 3, long: 4, float: 5, double: 6 };
  function typeStr(t) {
    if (!t) return '?';
    if (t.k === 'prim' || t.k === 'void' || t.k === 'any') return t.k === 'any' ? 'Object' : t.n || 'void';
    if (t.k === 'null') return '<null>';
    if (t.k === 'array') return typeStr(t.e) + '[]';
    return t.n + (t.args && t.args.length ? '<' + t.args.map(typeStr).join(',') + '>' : '');
  }
  const unboxed = (t) => (t.k === 'class' && UNBOX[t.n] ? prim(UNBOX[t.n]) : t);
  const boxed = (t) => (t.k === 'prim' ? cls(BOX[t.n]) : t);
  // binary numeric promotion (JLS 5.6.2)
  function promote(a, b) {
    a = unboxed(a); b = unboxed(b);
    if (!isNumeric(a) || !isNumeric(b)) return null;
    if (a.n === 'double' || b.n === 'double') return T.double;
    if (a.n === 'float' || b.n === 'float') return T.float;
    if (a.n === 'long' || b.n === 'long') return T.long;
    return T.int;
  }
  const unaryPromote = (a) => { a = unboxed(a); if (!isNumeric(a)) return null; return RANK[a.n] < 3 ? T.int : a; };
  // widening primitive conversion (JLS 5.1.2)
  function widens(from, to) {
    if (from.n === to.n) return true;
    if (from.n === 'boolean' || to.n === 'boolean') return false;
    if (from.n === 'char') return ['int', 'long', 'float', 'double'].includes(to.n);
    if (to.n === 'char') return false;
    if (from.n === 'byte' && to.n === 'short') return true;
    return RANK[from.n] < RANK[to.n] && RANK[to.n] >= 3;
  }

  /* ======================================================================================================================== lexer */
  const KEYWORDS = new Set(('abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for goto if implements import instanceof int interface long native new package private protected public return short static strictfp super switch synchronized this throw throws transient try void volatile while true false null var').split(' '));
  const OPS = ['>>>=', '<<=', '>>=', '>>>', '...', '->', '::', '++', '--', '&&', '||', '==', '!=', '<=', '>=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<', '>>'];
  class CompileError extends Error { constructor(line, msg) { super(msg); this.line = line; this.compile = true; } }
  function lex(src) {
    const toks = []; let i = 0, line = 1; const n = src.length;
    const push = (t, v, extra) => toks.push(Object.assign({ t, v, line }, extra));
    while (i < n) {
      const c = src[i];
      if (c === '\n') { line++; i++; continue; }
      if (c === ' ' || c === '\t' || c === '\r' || c === '\f') { i++; continue; }
      if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
      if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); if (e < 0) throw new CompileError(line, 'unclosed comment'); for (let j = i; j < e; j++) if (src[j] === '\n') line++; i = e + 2; continue; }
      if (/[A-Za-z_$]/.test(c)) { let j = i + 1; while (j < n && /[A-Za-z0-9_$]/.test(src[j])) j++; const w = src.slice(i, j); push(KEYWORDS.has(w) ? 'kw' : 'id', w); i = j; continue; }
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
        let j = i, isFloat = false, hex = false, bin = false;
        if (c === '0' && /[xX]/.test(src[i + 1] || '')) { hex = true; j = i + 2; while (j < n && /[0-9a-fA-F_]/.test(src[j])) j++; }
        else if (c === '0' && /[bB]/.test(src[i + 1] || '')) { bin = true; j = i + 2; while (j < n && /[01_]/.test(src[j])) j++; }
        else {
          while (j < n && /[0-9_]/.test(src[j])) j++;
          if (src[j] === '.' && /[0-9]/.test(src[j + 1] || '')) { isFloat = true; j++; while (j < n && /[0-9_]/.test(src[j])) j++; }
          else if (src[j] === '.' && (!/[A-Za-z_]/.test(src[j + 1] || '') || (/[eE]/.test(src[j + 1]) && /[0-9+\-]/.test(src[j + 2] || '')) || (/[fFdD]/.test(src[j + 1]) && !/[A-Za-z0-9_$]/.test(src[j + 2] || '')))) { isFloat = true; j++; }   // 1. 1.e1 1.f
          if (/[eE]/.test(src[j] || '') && /[0-9+\-]/.test(src[j + 1] || '')) { isFloat = true; j += 2; while (j < n && /[0-9]/.test(src[j])) j++; }
        }
        let text = src.slice(i, j).replace(/_/g, ''), kind = isFloat ? 'double' : 'int';
        const oct = !hex && !bin && !isFloat && /^0\d+$/.test(text) && !/^0\d*[fFdDeE.]/.test(src.slice(i, j + 1));   // 010 is octal (8)
        if (oct && /[89]/.test(text)) throw new CompileError(line, "';' expected");
        const suf = src[j] || '';
        if (/[lL]/.test(suf) && !isFloat) { kind = 'long'; j++; }
        else if (/[fF]/.test(suf)) { kind = 'float'; isFloat = true; j++; }
        else if (/[dD]/.test(suf)) { kind = 'double'; isFloat = true; j++; }
        let value;
        if (kind === 'int' || kind === 'long') {
          const big = hex ? BigInt('0x' + text.slice(2)) : bin ? BigInt('0b' + text.slice(2)) : oct ? BigInt('0o' + text.slice(1)) : BigInt(text);
          if (kind === 'int') { if (hex || bin || oct) { if (big > 0xFFFFFFFFn) throw new CompileError(line, 'integer number too large'); value = Number(BigInt.asIntN(32, big)); } else { if (big > 2147483648n) throw new CompileError(line, 'integer number too large'); value = Number(big); } }   // 2147483648 is allowed only as -2147483648; the parser checks
          else { if (big > (hex || bin || oct ? 0xFFFFFFFFFFFFFFFFn : 9223372036854775808n)) throw new CompileError(line, 'integer number too large'); value = BigInt.asIntN(64, big); }
        } else value = kind === 'float' ? Math.fround(Number(text)) : Number(text);
        push('num', value, { kind, text: src.slice(i, j) }); i = j; continue;
      }
      if (c === '"') {
        if (src.startsWith('"""', i)) {   // text block
          let j = src.indexOf('\n', i + 3); if (j < 0) throw new CompileError(line, 'illegal text block open delimiter sequence, missing line terminator');
          const e = src.indexOf('"""', j); if (e < 0) throw new CompileError(line, 'unclosed text block');
          const raw = src.slice(j + 1, e); const lines = raw.split('\n');
          const last = lines[lines.length - 1]; const closesOnOwnLine = /^\s*$/.test(last);
          const sig = closesOnOwnLine ? lines : lines.filter(l => l.trim() !== '');
          let indent = Infinity; for (const l of (closesOnOwnLine ? lines : sig)) { if (l.trim() === '' && !(l === last && closesOnOwnLine)) continue; const m = l.match(/^[ \t]*/)[0].length; indent = Math.min(indent, m); }
          if (indent === Infinity) indent = 0;
          let body = lines.map(l => l.slice(indent).replace(/[ \t]+$/, '')); if (closesOnOwnLine) body = body.slice(0, -1).concat(['']);
          const startLine = line; for (let k = i; k < e + 3; k++) if (src[k] === '\n') line++;
          toks.push({ t: 'str', v: unescape(body.join('\n'), startLine), line: startLine }); i = e + 3; continue;
        }
        let j = i + 1, s = '';
        while (j < n && src[j] !== '"') { if (src[j] === '\n') throw new CompileError(line, 'unclosed string literal'); if (src[j] === '\\') { s += src[j] + src[j + 1]; j += 2; } else s += src[j++]; }
        if (j >= n) throw new CompileError(line, 'unclosed string literal');
        push('str', unescape(s, line)); i = j + 1; continue;
      }
      if (c === "'") {
        let j = i + 1, s = '';
        while (j < n && src[j] !== "'") { if (src[j] === '\n') throw new CompileError(line, 'unclosed character literal'); if (src[j] === '\\') { s += src[j] + src[j + 1]; j += 2; } else s += src[j++]; }
        if (j >= n) throw new CompileError(line, 'unclosed character literal');
        const v = unescape(s, line); if (v.length !== 1) throw new CompileError(line, v.length ? 'unclosed character literal' : 'empty character literal');
        push('char', v.charCodeAt(0)); i = j + 1; continue;
      }
      if (c === '@') { let j = i + 1; while (j < n && /[A-Za-z0-9_.]/.test(src[j])) j++; i = j; if (src.slice(i).match(/^\s*\(/)) { let d = 0; while (i < n) { if (src[i] === '(') d++; else if (src[i] === ')') { d--; if (!d) { i++; break; } } else if (src[i] === '\n') line++; i++; } } continue; }   // annotations are skipped
      let op = OPS.find(o => src.startsWith(o, i));
      if (!op) { if ('{}()[];,.<>=!~?:+-*/&|^%'.includes(c)) op = c; else throw new CompileError(line, "illegal character: '" + c + "'"); }
      push('op', op); i += op.length;
    }
    push('eof', ''); return toks;
  }
  function unescape(s, line) {
    return s.replace(/\\(u[0-9a-fA-F]{4}|[0-7]{1,3}|.)/g, (m, e) => {
      if (e[0] === 'u') return String.fromCharCode(parseInt(e.slice(1), 16));
      if (/^[0-7]/.test(e)) return String.fromCharCode(parseInt(e, 8));
      const map = { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', s: ' ', '0': '\0', '\\': '\\', "'": "'", '"': '"' };
      if (!(e in map)) throw new CompileError(line, 'illegal escape character in ' + (s.length === 1 || s.length === 2 ? 'character' : 'string') + ' literal');
      return map[e];
    });
  }

  /* ======================================================================================================================== parser */
  const ASSIGN_OPS = new Set(['=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=', '>>>=']);
  const MODIFIERS = new Set(['public', 'private', 'protected', 'static', 'final', 'abstract', 'native', 'synchronized', 'transient', 'volatile', 'strictfp', 'default']);
  function parse(src) {
    const toks = lex(src); let p = 0;
    const peek = (o) => toks[p + (o || 0)];
    const at = (t, v) => { const k = toks[p]; return k.t === t && (v === undefined || k.v === v); };
    const atOp = (v) => at('op', v), atKw = (v) => at('kw', v);
    const next = () => toks[p++];
    const fail = (msg, tok) => { tok = tok || toks[p]; throw new CompileError(tok.line, msg); };
    const expect = (t, v, what) => { if (!at(t, v)) { const k = toks[p]; const prev = toks[p - 1]; const line = (v === ';' || v === ')' || v === ']') && prev ? prev.line : k.line; throw new CompileError(line, (what || ("'" + v + "'")) + ' expected'); } return next(); };
    const expectOp = (v) => expect('op', v);
    const ident = (what) => { if (!at('id')) { if (at('kw') && PRIMS.includes(toks[p].v)) fail('<identifier> expected'); fail((what || '<identifier>') + ' expected'); } return next().v; };
    const mut = [];   // tokens changed by splitShift, undone when a speculative parse backtracks
    const splitShift = () => {   // the > of a generic closes inside a >> or >>> token
      const k = toks[p]; if (k.t === 'op' && (k.v === '>>' || k.v === '>>>' || k.v === '>=' || k.v === '>>=' || k.v === '>>>=')) { mut.push({ k, v: k.v }); k.v = k.v.slice(1); return true; } return false;
    };
    const unmut = (n) => { while (mut.length > n) { const m = mut.pop(); m.k.v = m.v; } };
    const closeAngle = () => { if (atOp('>')) { next(); return; } if (splitShift()) return; fail("'>' expected"); };

    // ----- types
    function parseType(noArray) {
      let t;
      if (at('kw') && PRIMS.includes(toks[p].v)) t = prim(next().v);
      else if (atKw('var')) { next(); t = { k: 'var' }; }
      else if (at('id')) {
        let name = next().v;
        while (atOp('.') && peek(1).t === 'id') { next(); name = next().v; }   // java.util.Scanner → Scanner, Map.Entry → Entry
        let args = [];
        if (atOp('<')) { next(); if (atOp('>')) { next(); args = null; } else { args.push(parseTypeArg()); while (atOp(',')) { next(); args.push(parseTypeArg()); } closeAngle(); } }
        t = cls(name, args === null ? [] : args); if (args === null) t.diamond = true;
      } else fail('<identifier> expected');
      if (!noArray) while (atOp('[') && peek(1).t === 'op' && peek(1).v === ']') { next(); next(); t = arr(t); }
      return t;
    }
    function parseTypeArg() { if (atOp('?')) { next(); if (atKw('extends') || atKw('super')) { next(); return parseType(); } return T.Object; } return parseType(); }
    const isTypeStart = () => (at('kw') && (PRIMS.includes(toks[p].v) || toks[p].v === 'var')) || at('id');
    // Does a local variable declaration start here?  Type name [=,;:[]   (speculative: the position is restored)
    function looksLikeDecl() {
      const save = p, m0 = mut.length;
      try { if (!isTypeStart()) return false; parseType(); const ok = at('id') && peek(1).t === 'op' && ['=', ';', ',', ':', '['].includes(peek(1).v); return ok; }
      catch (e) { return false; } finally { p = save; unmut(m0); }
    }

    // ----- declarations
    function parseModifiers() {
      const m = { line: toks[p].line };
      while (at('kw') && MODIFIERS.has(toks[p].v)) m[next().v] = true;
      return m;
    }
    function parseCompilationUnit() {
      const unit = { classes: [], imports: [] };
      if (atKw('package')) { next(); ident(); while (atOp('.')) { next(); ident(); } expectOp(';'); }
      while (atKw('import')) { next(); if (atKw('static')) next(); let s = ident(); while (atOp('.')) { next(); if (atOp('*')) { next(); s += '.*'; break; } s += '.' + ident(); } expectOp(';'); unit.imports.push(s); }
      while (!at('eof')) {
        if (atOp(';')) { next(); continue; }
        const mods = parseModifiers();
        if (atKw('class') || atKw('interface') || atKw('abstract')) unit.classes.push(parseClass(mods));
        else if (atKw('enum')) fail('enum types are not supported by this interpreter');
        else if (atKw('record')) fail('records are not supported by this interpreter');
        else {
          // Statements or methods outside any class: say what Java needs instead of a confusing message.
          if (isTypeStart() || atKw('void')) { const save = p; try { if (atKw('void')) next(); else parseType(); if (at('id') && peek(1).t === 'op' && peek(1).v === '(') fail('a method must be inside a class: write  public class Main { ... }  around it', toks[save]); } catch (e) { if (e.compile && /inside a class/.test(e.message)) throw e; } p = save; }
          fail('class, interface, enum, or record expected');
        }
      }
      return unit;
    }
    function parseClass(mods) {
      const isInterface = atKw('interface'); if (!isInterface && !atKw('class')) fail('class, interface, enum, or record expected'); next();
      const c = { k: 'class', name: ident('class name'), line: toks[p - 1].line, mods, isInterface, ext: null, impl: [], fields: [], methods: [], ctors: [], inits: [] };
      if (atOp('<')) fail('generic classes are not supported by this interpreter');
      if (atKw('extends')) { next(); c.ext = parseType(true); if (isInterface) { c.impl.push(c.ext); c.ext = null; while (atOp(',')) { next(); c.impl.push(parseType(true)); } } }
      if (atKw('implements')) { next(); c.impl.push(parseType(true)); while (atOp(',')) { next(); c.impl.push(parseType(true)); } }
      expectOp('{');
      while (!atOp('}')) {
        if (at('eof')) fail("reached end of file while parsing", toks[p]);
        if (atOp(';')) { next(); continue; }
        const m = parseModifiers();
        if (atKw('class') || atKw('interface')) fail('nested classes are not supported by this interpreter: declare every class at the top level');
        if (atKw('enum')) fail('enum types are not supported by this interpreter');
        if (atOp('{')) { c.inits.push({ static: !!m.static, body: parseBlock(), line: m.line }); continue; }
        if (atOp('<')) fail('generic methods are not supported by this interpreter');
        // constructor: Name (
        if (at('id') && toks[p].v === c.name && peek(1).t === 'op' && peek(1).v === '(') {
          const line = toks[p].line; next(); const params = parseParams(); parseThrows();
          c.ctors.push({ k: 'ctor', mods: m, params, body: parseBlock(), line });
          continue;
        }
        if (at('id') && peek(1).t === 'op' && peek(1).v === '(') fail('invalid method declaration; return type required');
        const type = atKw('void') ? (next(), T.void) : parseType();
        if (type.k === 'var') fail("'var' is not allowed here");
        const nameTok = toks[p]; const name = ident();
        if (atOp('(')) {
          const params = parseParams(); parseThrows();
          let body = null;
          if (atOp(';')) { next(); if (!isInterface && !m.abstract && !m.native) fail('missing method body, or declare abstract', nameTok); }
          else { if (m.abstract) fail('abstract methods cannot have a body', nameTok); body = parseBlock(); }
          if (isInterface && !m.static && !body) m.abstract = true;
          if (isInterface && body && !m.static && !m.default) fail('interface abstract methods cannot have body', nameTok);
          if (isInterface) m.public = true;
          c.methods.push({ k: 'method', name, type, params, body, mods: m, line: nameTok.line, abstract: !!m.abstract, static: !!m.static });
        } else {
          // field(s): Type a, b = 1, c[];
          let fname = name, fline = nameTok.line;
          for (;;) {
            let ft = type; while (atOp('[')) { next(); expectOp(']'); ft = arr(ft); }
            let init = null;
            if (atOp('=')) { next(); init = atOp('{') ? parseArrayInit() : parseExpr(); }
            c.fields.push({ k: 'field', name: fname, type: ft, init, mods: m, line: fline, static: !!m.static || isInterface, final: !!m.final || isInterface });
            if (atOp(',')) { next(); fline = toks[p].line; fname = ident(); continue; }
            break;
          }
          expectOp(';');
        }
      }
      next();
      return c;
    }
    function parseParams() {
      expectOp('('); const params = [];
      if (!atOp(')')) for (;;) {
        parseModifiers();
        let t = parseType(); if (t.k === 'var') fail("'var' is not allowed here");
        if (atOp('...')) { next(); t = arr(t); t.varargs = true; }
        const line = toks[p].line; const name = ident();
        while (atOp('[')) { next(); expectOp(']'); t = arr(t); }
        params.push({ name, type: t, line });
        if (atOp(',')) { next(); continue; } break;
      }
      expectOp(')'); return params;
    }
    function parseThrows() { if (atKw('throws')) { next(); parseType(true); while (atOp(',')) { next(); parseType(true); } } }

    // ----- statements
    function parseBlock() {
      const line = toks[p].line; expectOp('{'); const body = [];
      while (!atOp('}')) { if (at('eof')) fail("reached end of file while parsing"); body.push(parseStatement()); }
      const close = next(); return { k: 'Block', body, line, closeLine: close.line };   // javac reports a missing return at the closing brace
    }
    function parseStatement() {
      const tok = toks[p], line = tok.line;
      if (atOp('{')) return parseBlock();
      if (atOp(';')) { next(); return { k: 'Empty', line }; }
      if (at('id') && tok.v === 'yield' && !(peek(1).t === 'op' && ['=', '.', '[', '++', '--', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=', '>>>=', ')', ';', ','].includes(peek(1).v))) {
        next(); const e = parseExpr(); expectOp(';'); return { k: 'Yield', e, line };   // yield value;  ends the switch expression with that value
      }
      if (at('kw')) {
        switch (tok.v) {
          case 'if': { next(); expectOp('('); const cond = parseExpr(); expectOp(')'); const then = parseStatement(); let els = null; if (atKw('else')) { next(); els = parseStatement(); } return { k: 'If', cond, then, els, line }; }
          case 'while': { next(); expectOp('('); const cond = parseExpr(); expectOp(')'); return { k: 'While', cond, body: parseStatement(), line }; }
          case 'do': { next(); const body = parseStatement(); if (!atKw('while')) fail("'while' expected"); next(); expectOp('('); const cond = parseExpr(); expectOp(')'); expectOp(';'); return { k: 'DoWhile', cond, body, line }; }
          case 'for': {
            next(); expectOp('(');
            if (looksLikeDecl()) {
              const save = p; parseModifiers(); const t = parseType(); const name = ident();
              if (atOp(':')) { next(); const iter = parseExpr(); expectOp(')'); return { k: 'ForEach', varType: t, name, iter, body: parseStatement(), line }; }
              p = save;
            }
            let init = [];
            if (!atOp(';')) { if (looksLikeDecl() || atKw('final')) init = [parseLocalDecl()]; else { init.push({ k: 'ExprStmt', e: parseExpr(), line }); while (atOp(',')) { next(); init.push({ k: 'ExprStmt', e: parseExpr(), line }); } } }
            expectOp(';');
            const cond = atOp(';') ? null : parseExpr(); expectOp(';');
            const update = []; if (!atOp(')')) { update.push(parseExpr()); while (atOp(',')) { next(); update.push(parseExpr()); } }
            expectOp(')');
            return { k: 'For', init, cond, update, body: parseStatement(), line };
          }
          case 'return': { next(); const e = atOp(';') ? null : parseExpr(); expectOp(';'); return { k: 'Return', e, line }; }
          case 'break': { next(); const label = at('id') ? next().v : null; expectOp(';'); return { k: 'Break', label, line }; }
          case 'continue': { next(); const label = at('id') ? next().v : null; expectOp(';'); return { k: 'Continue', label, line }; }
          case 'throw': { next(); const e = parseExpr(); expectOp(';'); return { k: 'Throw', e, line }; }
          case 'switch': return parseSwitch(false);
          case 'try': {
            next(); if (atOp('(')) fail('try-with-resources is not supported by this interpreter');
            const block = parseBlock(); const catches = []; let fin = null;
            while (atKw('catch')) { const cl = toks[p].line; next(); expectOp('('); parseModifiers(); const types = [parseType(true)]; while (atOp('|')) { next(); types.push(parseType(true)); } const name = ident(); expectOp(')'); catches.push({ types, name, body: parseBlock(), line: cl }); }
            if (atKw('finally')) { next(); fin = parseBlock(); }
            if (!catches.length && !fin) fail("'catch' or 'finally' expected");
            return { k: 'Try', block, catches, fin, line };
          }
          case 'final': case 'var': return parseLocalDeclStmt();
          case 'class': case 'interface': case 'enum': fail('local classes are not supported by this interpreter');
          case 'synchronized': case 'assert': fail("'" + tok.v + "' is not supported by this interpreter");
          case 'else': fail("'else' without 'if'");
          case 'case': case 'default': fail("orphaned " + tok.v);
          case 'catch': fail("'catch' without 'try'"); case 'finally': fail("'finally' without 'try'");
          case 'import': case 'package': fail(tok.v + ' statements must come before the first class, at the top of the file');
          case 'static': case 'public': case 'private': case 'protected': case 'abstract': { fail('illegal start of expression: ' + tok.v + ' is a modifier for a method or field, and cannot start a statement'); }
        }
      }
      if (at('id') && peek(1).t === 'op' && peek(1).v === ':' ) { const label = next().v; next(); const s = parseStatement(); s.label = label; return s; }
      if (looksLikeDecl()) return parseLocalDeclStmt();
      const e = parseExpr();
      if (!['Assign', 'Call', 'New', 'PreInc', 'PostInc', 'CtorCall'].includes(e.k)) fail('not a statement', tok);
      expectOp(';');
      return { k: 'ExprStmt', e, line };
    }
    function parseLocalDeclStmt() { const d = parseLocalDecl(); expectOp(';'); return d; }
    function parseLocalDecl() {
      const line = toks[p].line; const mods = parseModifiers(); const type = parseType(); const vars = [];
      for (;;) {
        const vt = toks[p]; const name = ident(); let t = type; while (atOp('[')) { next(); expectOp(']'); t = arr(t); }
        let init = null;
        if (atOp('=')) { next(); init = atOp('{') ? parseArrayInit() : parseExpr(); }
        else if (type.k === 'var') fail("cannot infer type for local variable " + name + "\n  (cannot use 'var' on variable without initializer)", vt);
        vars.push({ name, type: t, init, line: vt.line });
        if (atOp(',')) { next(); continue; } break;
      }
      return { k: 'LocalDecl', vars, final: !!mods.final, line };
    }
    function parseArrayInit() { const line = toks[p].line; expectOp('{'); const items = []; while (!atOp('}')) { items.push(atOp('{') ? parseArrayInit() : parseExpr()); if (atOp(',')) { next(); continue; } break; } expectOp('}'); return { k: 'ArrayInit', items, line }; }
    let inSwitchExpr = 0;   // how many switch expressions we are inside (a yield statement elsewhere is an error, which the checker reports)
    function parseSwitch(isExpr) {
      const line = toks[p].line; next(); expectOp('('); const subject = parseExpr(); expectOp(')'); expectOp('{');
      const cases = []; let arrow = null;
      if (isExpr) inSwitchExpr++;
      try {
        while (!atOp('}')) {
          if (at('eof')) fail("reached end of file while parsing");
          const c = { labels: [], isDefault: false, body: [], line: toks[p].line };
          for (;;) {
            if (atKw('default')) { next(); c.isDefault = true; }
            else if (atKw('case')) { next(); c.labels.push(parseTernary()); while (atOp(',')) { next(); c.labels.push(parseTernary()); } }
            else fail("'case', 'default', or '}' expected");
            if (atOp('->')) { if (arrow === false) fail('different case kinds used in the switch'); arrow = true; next(); break; }
            expectOp(':', null, "':' or '->'"); if (arrow === true) fail('different case kinds used in the switch'); arrow = false;
            if (!(atKw('case') || atKw('default'))) break;
          }
          if (arrow) {
            if (atOp('{')) c.body.push(parseBlock()); else if (atKw('throw')) c.body.push(parseStatement());
            else if (isExpr) { const el = toks[p].line; const e = parseExpr(); expectOp(';'); c.body.push({ k: 'Yield', e, line: el, implicit: true }); }   // case 1 -> "one";  yields the value
            else { const t0 = toks[p], el = t0.line; const e = parseExpr(); if (!['Assign', 'Call', 'New', 'PreInc', 'PostInc', 'CtorCall'].includes(e.k)) fail('not a statement', t0); expectOp(';'); c.body.push({ k: 'ExprStmt', e, line: el }); }
            if (!isExpr) c.body.push({ k: 'Break', label: null, line: c.line, implicit: true });
          }
          else while (!atKw('case') && !atKw('default') && !atOp('}')) { if (at('eof')) fail("reached end of file while parsing"); c.body.push(parseStatement()); }
          cases.push(c);
        }
      } finally { if (isExpr) inSwitchExpr--; }
      const close = next();
      return { k: isExpr ? 'SwitchExpr' : 'Switch', subject, cases, line, endLine: close.line, arrow: arrow === true };
    }

    // ----- expressions
    function parseExpr() {
      const lhs = parseTernary();
      if (at('op') && ASSIGN_OPS.has(toks[p].v)) {
        const op = next(); const rhs = parseExpr();
        if (!['Name', 'Field', 'Index'].includes(lhs.k)) fail('unexpected type\n  required: variable\n  found:    value', op);
        return { k: 'Assign', op: op.v, target: lhs, e: rhs, line: op.line };
      }
      return lhs;
    }
    function parseTernary() { const c = parseBinary(0); if (atOp('?')) { const line = next().line; const a = parseTernary(); expectOp(':'); const b = parseTernary(); return { k: 'Cond', cond: c, a, b, line }; } return c; }
    const LEVELS = [['||'], ['&&'], ['|'], ['^'], ['&'], ['==', '!='], ['<', '>', '<=', '>=', 'instanceof'], ['<<', '>>', '>>>'], ['+', '-'], ['*', '/', '%']];
    function parseBinary(level) {
      if (level >= LEVELS.length) return parseUnary();
      let left = parseBinary(level + 1);
      for (;;) {
        const tok = toks[p]; const isOp = (tok.t === 'op' && LEVELS[level].includes(tok.v)) || (tok.t === 'kw' && tok.v === 'instanceof' && LEVELS[level].includes('instanceof'));
        if (!isOp) return left;
        next();
        if (tok.v === 'instanceof') { if (atKw('final')) next(); const type = parseType(); const bind = at('id') ? next().v : null; left = { k: 'InstanceOf', e: left, type, bind, line: tok.line }; continue; }
        const right = parseBinary(level + 1);
        left = { k: 'Binary', op: tok.v, l: left, r: right, line: tok.line };
      }
    }
    function parseUnary() {
      const tok = toks[p];
      if (tok.t === 'op') {
        if (tok.v === '++' || tok.v === '--') { next(); const e = parseUnary(); if (!['Name', 'Field', 'Index'].includes(e.k)) fail('unexpected type\n  required: variable\n  found:    value', tok); return { k: 'PreInc', op: tok.v, target: e, line: tok.line }; }
        if (tok.v === '-' && peek(1).t === 'num' && (peek(1).v === 2147483648 || peek(1).v === 9223372036854775808n) ) { next(); const n = next(); return { k: 'Lit', v: n.kind === 'long' ? -9223372036854775808n : -2147483648, type: n.kind === 'long' ? T.long : T.int, line: tok.line }; }
        if (tok.v === '+' || tok.v === '-' || tok.v === '!' || tok.v === '~') { next(); const e = parseUnary(); return { k: 'Unary', op: tok.v, e, line: tok.line }; }
        if (tok.v === '(' && isCast()) { next(); const type = parseType(); expectOp(')'); const e = parseUnary(); return { k: 'Cast', type, e, line: tok.line }; }
      }
      return parsePostfix(parsePrimary());
    }
    function isCast() {   // after '(' : a primitive type, or a class type followed by ')' and something that can start an operand (not + or -)
      const save = p, m0 = mut.length; p++;
      try {
        if (!isTypeStart() || atKw('var')) return false;
        const primitive = at('kw'); parseType();
        if (!atOp(')')) return false; next();
        if (primitive) return true;
        const k = toks[p];
        return k.t === 'id' || k.t === 'str' || k.t === 'num' || k.t === 'char' || (k.t === 'kw' && ['this', 'new', 'super', 'true', 'false', 'null'].includes(k.v)) || (k.t === 'op' && ['(', '!', '~'].includes(k.v));
      } catch (e) { return false; } finally { p = save; unmut(m0); }
    }
    function parsePostfix(e) {
      for (;;) {
        const tok = toks[p];
        if (tok.t !== 'op') return e;
        if (tok.v === '.') {
          next();
          if (atKw('new')) fail('inner class creation is not supported');
          if (atKw('class')) { next(); e = { k: 'ClassLit', e, line: tok.line }; continue; }
          if (atOp('<')) fail('explicit type arguments are not supported by this interpreter');
          const nameTok = toks[p]; const name = ident();
          if (atOp('(')) { const args = parseArgs(); e = { k: 'Call', target: e, name, args, line: nameTok.line }; }
          else e = { k: 'Field', target: e, name, line: nameTok.line };
        } else if (tok.v === '[') { next(); const idx = parseExpr(); expectOp(']'); e = { k: 'Index', target: e, index: idx, line: tok.line }; }
        else if (tok.v === '++' || tok.v === '--') { next(); if (!['Name', 'Field', 'Index'].includes(e.k)) fail('unexpected type\n  required: variable\n  found:    value', tok); e = { k: 'PostInc', op: tok.v, target: e, line: tok.line }; }
        else if (tok.v === '::') fail('method references are not supported by this interpreter');
        else return e;
      }
    }
    function parseArgs() { expectOp('('); const args = []; if (!atOp(')')) for (;;) { args.push(parseExpr()); if (atOp(',')) { next(); continue; } break; } expectOp(')'); return args; }
    function parsePrimary() {
      const tok = toks[p];
      switch (tok.t) {
        case 'num': next(); return { k: 'Lit', v: tok.v, type: prim(tok.kind), line: tok.line, text: tok.text };
        case 'str': next(); return { k: 'Lit', v: tok.v, type: T.String, line: tok.line };
        case 'char': next(); return { k: 'Lit', v: tok.v, type: T.char, line: tok.line };
        case 'id': {
          next();
          if ((tok.v === 'java' || tok.v === 'javax') && atOp('.') && peek(1).t === 'id') {   // java.util.Arrays.toString(a): the package part is dropped
            let last = tok; while (atOp('.') && peek(1).t === 'id' && /^[a-z]/.test(peek(1).v)) { next(); last = next(); }
            if (atOp('.') && peek(1).t === 'id') { next(); last = next(); }
            if (atOp('(')) { const args = parseArgs(); return { k: 'Call', target: null, name: last.v, args, line: last.line }; }
            return { k: 'Name', name: last.v, line: last.line };
          }
          if (atOp('->')) fail('lambda expressions are not supported by this interpreter');
          if (atOp('(')) { const args = parseArgs(); return { k: 'Call', target: null, name: tok.v, args, line: tok.line }; }
          return { k: 'Name', name: tok.v, line: tok.line };
        }
        case 'kw':
          switch (tok.v) {
            case 'true': next(); return { k: 'Lit', v: true, type: T.boolean, line: tok.line };
            case 'false': next(); return { k: 'Lit', v: false, type: T.boolean, line: tok.line };
            case 'null': next(); return { k: 'Lit', v: null, type: T.null, line: tok.line };
            case 'this': next(); if (atOp('(')) { const args = parseArgs(); return { k: 'CtorCall', which: 'this', args, line: tok.line }; } return { k: 'This', line: tok.line };
            case 'super': {
              next();
              if (atOp('(')) { const args = parseArgs(); return { k: 'CtorCall', which: 'super', args, line: tok.line }; }
              expectOp('.'); const nameTok = toks[p]; const name = ident();
              if (atOp('(')) { const args = parseArgs(); return { k: 'Call', target: { k: 'Super', line: tok.line }, name, args, line: nameTok.line }; }
              return { k: 'Field', target: { k: 'Super', line: tok.line }, name, line: nameTok.line };
            }
            case 'switch': return parseSwitch(true);
            case 'new': {
              next(); const type = parseType(true);
              if (type.k === 'var') fail("'var' is not allowed here");
              if (atOp('[')) {
                const dims = []; let extra = 0;
                while (atOp('[')) { next(); if (atOp(']')) { next(); extra++; while (atOp('[')) { next(); expectOp(']'); extra++; } break; } if (extra) fail("']' expected"); dims.push(parseExpr()); expectOp(']'); }
                let init = null; if (atOp('{')) { if (dims.length) fail("';' expected"); init = parseArrayInit(); } else if (!dims.length) fail('array dimension missing');
                let t = type; for (let i = 0; i < dims.length + extra; i++) t = arr(t);
                return { k: 'NewArray', type: t, dims, init, line: tok.line };
              }
              if (atOp('{')) fail('anonymous classes are not supported by this interpreter');
              const args = parseArgs();
              if (atOp('{')) fail('anonymous classes are not supported by this interpreter');
              return { k: 'New', type, args, line: tok.line };
            }
            case 'int': case 'long': case 'double': case 'float': case 'boolean': case 'char': case 'byte': case 'short': case 'void': {
              // int.class or a mistaken declaration inside an expression
              if (peek(1).t === 'op' && peek(1).v === '.' ) { next(); next(); if (atKw('class')) { next(); return { k: 'ClassLit', e: null, line: tok.line }; } }
              fail("'.class' expected");
            }
          }
          fail('illegal start of expression');
        // falls through
        case 'op':
          if (tok.v === '(') { next(); const e = parseExpr(); expectOp(')'); return { k: 'Paren', e, line: tok.line }; }
          if (tok.v === '{') fail("illegal start of expression: an array initializer with braces can only be used where an array variable is declared");
          fail('illegal start of expression');
        // falls through
        case 'eof': fail('reached end of file while parsing');
      }
      fail('illegal start of expression');
    }
    return parseCompilationUnit();
  }

  /* ======================================================================================================================== runtime values */
  // int, short, byte and char are numbers; long is a BigInt; float and double are numbers; boolean, String and null are themselves.
  // In a reference-typed slot (Object, a type parameter, Double...) a double, float or char is boxed, so that it still prints and
  // compares as what it was; an Integer stays a number, a Long a BigInt, a Boolean a boolean.
  class JBox { constructor(kind, v) { this.kind = kind; this.v = v; } }   // kind: 'D' double, 'F' float, 'C' char
  class JObj { constructor(cls) { this.cls = cls; this.f = Object.create(null); this.id = ++JObj.n; } } JObj.n = 0;
  class JArr { constructor(et, a) { this.et = et; this.a = a; this.id = ++JObj.n; } }
  class JList { constructor(a) { this.a = a || []; this.id = ++JObj.n; } }
  class JSB { constructor(s) { this.s = s || ''; this.id = ++JObj.n; } }
  class JIter { constructor(items, src, desc) { this.items = items; this.i = 0; this.src = src; this.desc = desc; this.last = -1; } }   // list.iterator(): a snapshot, with remove() reaching the source
  class JCmp { constructor(base, rev) { this.base = base; this.rev = rev; } }   // Collections.reverseOrder(), cmp.reversed(): base null is the natural order
  class JEntry { constructor(key, value) { this.key = key; this.value = value; } }
  class JavaThrow { constructor(obj) { this.obj = obj; } }   // a Java exception travelling through the JavaScript stack
  class Signal { constructor(k, label, v) { this.k = k; this.label = label; this.v = v; } }   // break / continue / return, as statement results

  function fmtDouble(x) {
    if (Number.isNaN(x)) return 'NaN'; if (x === Infinity) return 'Infinity'; if (x === -Infinity) return '-Infinity';
    if (x === 0) return 1 / x < 0 ? '-0.0' : '0.0';
    if (Math.abs(x) === 5e-324) return (x < 0 ? '-' : '') + '4.9E-324';   // Double.MIN_VALUE: Java shows two digits
    const a = Math.abs(x);
    if (a >= 1e-3 && a < 1e7) { let s = String(x); if (!/[.e]/.test(s)) s += '.0'; return s; }
    let [m, e] = x.toExponential().split('e'); if (!m.includes('.')) m += '.0'; return m + 'E' + e.replace('+', '');
  }
  function shortFloat(x) { for (let p = 1; p <= 9; p++) { const c = x.toPrecision(p); if (Math.fround(Number(c)) === x) return String(Number(c)); } return String(x); }
  function fmtFloat(x) {
    if (Number.isNaN(x) || !Number.isFinite(x) || x === 0) return fmtDouble(x);
    if (Math.abs(x) === 1.401298464324817e-45) return (x < 0 ? '-' : '') + '1.4E-45';   // Float.MIN_VALUE: Java shows two digits
    const s = Number(shortFloat(x));
    const a = Math.abs(s);
    if (a >= 1e-3 && a < 1e7) { let r = String(s); if (!/[.e]/.test(r)) r += '.0'; return r; }
    let [m, e] = s.toExponential().split('e'); if (!m.includes('.')) m += '.0'; return m + 'E' + e.replace('+', '');
  }
  const ARRAY_CODE = { int: 'I', double: 'D', char: 'C', boolean: 'Z', long: 'J', float: 'F', byte: 'B', short: 'S' };
  function arrayCode(t) { if (t.k === 'array') return '[' + arrayCode(t.e); if (t.k === 'prim') return ARRAY_CODE[t.n]; return 'L' + (LIB_PKG[t.n] ? LIB_PKG[t.n] + '.' : '') + t.n + ';'; }
  const hex = (n) => (n >>> 0).toString(16);
  const idHash = (id) => (Math.imul(id, 0x61C88647) ^ 0x1b6d3586) >>> 0;   // a made-up but repeatable identity hash

  // Java's String.hashCode and the others
  function strHash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0; return h; }
  const f64 = new Float64Array(1), u32 = new Uint32Array(f64.buffer), f32 = new Float32Array(1), u32f = new Uint32Array(f32.buffer);
  function doubleHash(d) { if (d === 0 && 1 / d > 0) return 0; if (Number.isNaN(d)) d = NaN; f64[0] = d; return (u32[0] ^ u32[1]) | 0; }
  function floatHash(d) { f32[0] = d; return u32f[0] | 0; }

  /* ======================================================================================================================== runtime */
  function Runtime(opts) {
    const R = this;
    R.out = ''; R.outLen = 0; R.write = opts.write || null; R.maxOut = opts.maxOut || 2e6;
    R.steps = 0; R.maxSteps = opts.maxSteps || Infinity; R.deadline = opts.maxMs ? Date.now() + opts.maxMs : Infinity;
    R.stdin = typeof opts.stdin === 'string' ? opts.stdin : ''; R.stdinPos = 0; R.more = opts.more || null;
    R.classes = null;   // filled by the checker: name → ClassInfo (user and library)
    R.frames = [];      // the Java call stack, for stack traces: {cls, name, line}
    R.exitCode = null;
    R.print = (s) => { R.outLen += s.length; if (R.outLen > R.maxOut) { R.out += s.slice(0, Math.max(0, s.length - (R.outLen - R.maxOut))); throw new TooMuchOutput(); } if (R.write) R.write(s); else R.out += s; };
    R.tick = () => { if ((++R.steps & 1023) === 0) { if (R.steps > R.maxSteps || Date.now() > R.deadline) throw new TimeLimit(); } };
  }
  class TooMuchOutput extends Error { }
  class TimeLimit extends Error { }
  class SystemExit extends Error { constructor(code) { super('exit'); this.code = code; } }

  const LIB_PKG = { String: 'java.lang', Object: 'java.lang', Integer: 'java.lang', Long: 'java.lang', Double: 'java.lang', Float: 'java.lang', Character: 'java.lang', Boolean: 'java.lang', Short: 'java.lang', Byte: 'java.lang', Number: 'java.lang', Math: 'java.lang', System: 'java.lang', StringBuilder: 'java.lang', Comparable: 'java.lang', CharSequence: 'java.lang', Iterable: 'java.lang', PrintStream: 'java.io', InputStream: 'java.io',
    Throwable: 'java.lang', Exception: 'java.lang', RuntimeException: 'java.lang', Error: 'java.lang', ArithmeticException: 'java.lang', IllegalArgumentException: 'java.lang', IllegalStateException: 'java.lang', NumberFormatException: 'java.lang', IndexOutOfBoundsException: 'java.lang', ArrayIndexOutOfBoundsException: 'java.lang', StringIndexOutOfBoundsException: 'java.lang', NullPointerException: 'java.lang', ClassCastException: 'java.lang', NegativeArraySizeException: 'java.lang', UnsupportedOperationException: 'java.lang', StackOverflowError: 'java.lang', OutOfMemoryError: 'java.lang', ArrayStoreException: 'java.lang', CloneNotSupportedException: 'java.lang', InterruptedException: 'java.lang',
    ArrayList: 'java.util', List: 'java.util', Collection: 'java.util', HashMap: 'java.util', TreeMap: 'java.util', Map: 'java.util', Entry: 'java.util', HashSet: 'java.util', TreeSet: 'java.util', Set: 'java.util', Scanner: 'java.util', Random: 'java.util', Arrays: 'java.util', Collections: 'java.util', NoSuchElementException: 'java.util', InputMismatchException: 'java.util', ConcurrentModificationException: 'java.util', Iterator: 'java.util', LinkedList: 'java.util', Deque: 'java.util', Queue: 'java.util',
    IOException: 'java.io', FileNotFoundException: 'java.io', UncheckedIOException: 'java.io', IllegalFormatException: 'java.util', IllegalFormatConversionException: 'java.util', MissingFormatArgumentException: 'java.util', UnknownFormatConversionException: 'java.util', NoSuchFieldException: 'java.lang', ArrayDeque: 'java.util', Comparator: 'java.util', Objects: 'java.util' };
  const qualified = (n) => (LIB_PKG[n] ? LIB_PKG[n] + '.' : '') + n;

  // ----- the parts of the standard library that are implemented, as classes with native methods.
  // A signature is 'name(param types)'; E, K, V are the receiver's type parameters, T a type inferred from the arguments.
  const NATIVE = {};
  function sigType(s) {   // the mini type grammar of the tables: int, String, E, int[], List<E>, Object...
    s = s.trim();
    if (s.endsWith('...')) { const t = arr(sigType(s.slice(0, -3))); t.varargs = true; return t; }
    if (s.endsWith('[]')) return arr(sigType(s.slice(0, -2)));
    if (PRIMS.includes(s)) return prim(s);
    if (s === 'void') return T.void;
    if (/^[EKVT]$/.test(s)) return { k: 'tvar', n: s };
    const m = s.match(/^(\w+)<(.*)>$/);
    if (m) { const args = []; let depth = 0, cur = ''; for (const ch of m[2]) { if (ch === '<') depth++; if (ch === '>') depth--; if (ch === ',' && !depth) { args.push(sigType(cur)); cur = ''; } else cur += ch; } args.push(sigType(cur)); return cls(m[1], args); }
    return cls(s);
  }
  function parseSig(sig) { const m = sig.match(/^(\w+)\((.*)\)$/); const params = m[2].trim() ? m[2].split(/,(?![^<]*>)/).map(sigType) : []; return { name: m[1], params }; }
  // def(className, {ext, impl, tparams, ctors:{sig:fn}, methods:{sig:[ret, fn]}, statics:{sig:[ret, fn]}, fields:{name:[type, value]}, abstract})
  function def(name, spec) {
    const info = { name, lib: true, ext: spec.ext === undefined ? (name === 'Object' ? null : 'Object') : spec.ext, impl: spec.impl || [], tparams: spec.tparams || [], isInterface: !!spec.isInterface, abstract: !!spec.abstract || !!spec.isInterface,
      fields: Object.create(null), methods: Object.create(null), ctors: [], staticValues: Object.create(null), noNew: !!spec.noNew };
    for (const sig in spec.methods || {}) { const [ret, fn] = spec.methods[sig]; const ps = parseSig(sig); (info.methods[ps.name] = info.methods[ps.name] || []).push({ name: ps.name, params: ps.params, ret: sigType(ret), fn, static: false, cls: info, native: true, access: 'public', sig }); }
    for (const sig in spec.statics || {}) { const [ret, fn] = spec.statics[sig]; const ps = parseSig(sig); (info.methods[ps.name] = info.methods[ps.name] || []).push({ name: ps.name, params: ps.params, ret: sigType(ret), fn, static: true, cls: info, native: true, access: 'public', sig }); }
    for (const sig in spec.ctors || {}) { const ps = parseSig('x(' + sig + ')'); info.ctors.push({ name, ctor: true, params: ps.params, fn: spec.ctors[sig], native: true, cls: info, access: 'public' }); }
    for (const f in spec.fields || {}) { const [type, value] = spec.fields[f]; info.fields[f] = { name: f, type: sigType(type), static: true, final: true, access: 'public', cls: info }; info.staticValues[f] = value; }
    NATIVE[name] = info; return info;
  }

  // ----- what a value prints as, Java's equals / hashCode / compareTo, and the collections
  function jstr(v, t, R) {
    if (t && t.k === 'prim') { switch (t.n) { case 'char': return String.fromCharCode(v); case 'double': return fmtDouble(v); case 'float': return fmtFloat(v); case 'long': return v.toString(); default: return String(v); } }
    return dstr(v, R);
  }
  function isThrowable(c) { for (; c; c = c.ext && (c.lib ? NATIVE[c.ext] : c.extInfo || NATIVE[c.ext])) if (c.name === 'Throwable') return true; return false; }   // extInfo: a user class's superclass (set by the checker)
  const excName = (c) => (c.lib ? qualified(c.name) : c.name);
  function dstr(v, R, depth) {
    depth = depth || 0; if (depth > 20) return '...';
    if (v === null || v === undefined) return 'null';
    if (typeof v === 'object' && v.classOf !== undefined && !(v instanceof JObj)) return 'class ' + qualified(v.classOf);   // what getClass() returns
    switch (typeof v) { case 'string': return v; case 'number': return String(v); case 'bigint': return v.toString(); case 'boolean': return String(v); }
    if (v instanceof JBox) return v.kind === 'D' ? fmtDouble(v.v) : v.kind === 'F' ? fmtFloat(v.v) : String.fromCharCode(v.v);
    if (v instanceof JObj) {
      const m = R.findMethod(v.cls, 'toString', []); if (m && !m.native) return R.invoke(v, m, []);
      if (isThrowable(v.cls)) return excName(v.cls) + (v.f.message != null ? ': ' + dstr(v.f.message, R) : '');
      return (v.cls.lib ? qualified(v.cls.name) : v.cls.name) + '@' + hex(idHash(v.id));
    }
    if (v instanceof JArr) return '[' + arrayCode(v.et) + '@' + hex(idHash(v.id));
    if (v instanceof JList) return '[' + v.a.map(x => (x === v ? '(this Collection)' : dstr(x, R, depth + 1))).join(', ') + ']';
    if (v instanceof JMap) return '{' + v.entries(R).map(e => dstr(e.key, R, depth + 1) + '=' + (e.value === v ? '(this Map)' : dstr(e.value, R, depth + 1))).join(', ') + '}';
    if (v instanceof JSet) return '[' + (v.ordered || v.m.entries(R).map(e => e.key)).map(k => dstr(k, R, depth + 1)).join(', ') + ']';   // ordered: an entrySet, in the map's order
    if (v instanceof JSB) return v.s;
    if (v instanceof JEntry) return dstr(v.key, R, depth + 1) + '=' + dstr(v.value, R, depth + 1);
    if (v instanceof JScanner) return 'java.util.Scanner[delimiters=\\p{javaWhitespace}+]';
    if (v instanceof JRandom) return 'java.util.Random@' + hex(idHash(v.id));
    if (v === SYSOUT || v === SYSERR) return 'java.io.PrintStream@' + hex(idHash(7));
    if (v === SYSIN) return 'java.io.BufferedInputStream@' + hex(idHash(8));
    return String(v);
  }
  function jeq(a, b, R) {
    if (a === b) return true;
    if (a === null || b === null || a === undefined || b === undefined) return false;
    if (a instanceof JBox) return b instanceof JBox && a.kind === b.kind && (a.v === b.v || (a.v !== a.v && b.v !== b.v));
    if (a instanceof JObj) { const m = R.findMethod(a.cls, 'equals', [T.Object]); if (m && !m.native) return !!R.invoke(a, m, [b]); return false; }
    if (a instanceof JList) return b instanceof JList && a.a.length === b.a.length && a.a.every((x, i) => jeq(x, b.a[i], R));
    if (a instanceof JEntry) return b instanceof JEntry && jeq(a.key, b.key, R) && jeq(a.value, b.value, R);
    if (a instanceof JSet) return b instanceof JSet && a.m.size === b.m.size && a.m.entries(R).every(e => b.m.find(e.key, R));
    if (a instanceof JMap) return b instanceof JMap && a.size === b.size && a.entries(R).every(e => { const o = b.find(e.key, R); return o && jeq(e.value, o.value, R); });
    return false;
  }
  function jhash(v, R) {
    if (v === null || v === undefined) return 0;
    switch (typeof v) {
      case 'string': return strHash(v); case 'number': return v | 0; case 'boolean': return v ? 1231 : 1237;
      case 'bigint': { const u = BigInt.asUintN(64, v); return Number(BigInt.asIntN(32, u ^ (u >> 32n))); }
    }
    if (v instanceof JBox) return v.kind === 'D' ? doubleHash(v.v) : v.kind === 'F' ? floatHash(v.v) : v.v;
    if (v instanceof JObj) { const m = R.findMethod(v.cls, 'hashCode', []); if (m && !m.native) return R.invoke(v, m, []) | 0; return idHash(v.id) | 0; }
    if (v instanceof JList) { let h = 1; for (const x of v.a) h = (Math.imul(31, h) + jhash(x, R)) | 0; return h; }
    if (v instanceof JEntry) return jhash(v.key, R) ^ jhash(v.value, R);
    if (v instanceof JSet) { let h = 0; for (const e of v.m.entries(R)) h = (h + jhash(e.key, R)) | 0; return h; }
    if (v instanceof JMap) { let h = 0; for (const e of v.entries(R)) h = (h + (jhash(e.key, R) ^ jhash(e.value, R))) | 0; return h; }
    return idHash(v.id || 0) | 0;
  }
  function strCompare(a, b) { const n = Math.min(a.length, b.length); for (let i = 0; i < n; i++) { const d = a.charCodeAt(i) - b.charCodeAt(i); if (d) return d; } return a.length - b.length; }
  function jcmp(a, b, R) {
    if (a === null || b === null || a === undefined || b === undefined) throwJ(R, 'NullPointerException', null);
    if (typeof a === 'string' && typeof b === 'string') return strCompare(a, b);
    if (typeof a === 'number' && typeof b === 'number') return a < b ? -1 : a > b ? 1 : 0;
    if (typeof a === 'bigint' && typeof b === 'bigint') return a < b ? -1 : a > b ? 1 : 0;
    if (typeof a === 'boolean' && typeof b === 'boolean') return a === b ? 0 : a ? 1 : -1;
    if (a instanceof JBox && b instanceof JBox && a.kind === b.kind) { if (a.kind === 'C') return a.v - b.v; const x = a.v, y = b.v; if (x < y) return -1; if (x > y) return 1; if (x === y) return x === 0 ? (1 / x < 0 ? (1 / y < 0 ? 0 : -1) : (1 / y < 0 ? 1 : 0)) : 0; return x !== x ? (y !== y ? 0 : 1) : -1; }
    if (a instanceof JObj) { const m = R.findMethod(a.cls, 'compareTo', null); if (m && !m.native) return R.invoke(a, m, [b]) | 0; throwJ(R, 'ClassCastException', 'class ' + a.cls.name + ' cannot be cast to class java.lang.Comparable (' + a.cls.name + ' is in unnamed module of loader \'app\'; java.lang.Comparable is in module java.base of loader \'bootstrap\')'); }
    throwJ(R, 'ClassCastException', 'class ' + qualified(runtimeClassName(a)) + ' cannot be cast to class ' + qualified(runtimeClassName(b)));
  }
  function runtimeClassName(v) {
    if (v === null || v === undefined) return 'null';
    switch (typeof v) { case 'string': return 'String'; case 'number': return 'Integer'; case 'bigint': return 'Long'; case 'boolean': return 'Boolean'; }
    if (v instanceof JBox) return v.kind === 'D' ? 'Double' : v.kind === 'F' ? 'Float' : 'Character';
    if (v instanceof JObj) return v.cls.name; if (v instanceof JArr) return typeStr(v.et) + '[]'; if (v instanceof JList) return v.kind || 'ArrayList';
    if (v instanceof JMap) return v.sorted ? 'TreeMap' : 'HashMap'; if (v instanceof JSet) return v.m.sorted ? 'TreeSet' : 'HashSet';
    if (v instanceof JSB) return 'StringBuilder'; if (v instanceof JEntry) return 'Entry'; if (v instanceof JIter) return 'Iterator'; if (v instanceof JCmp) return 'Comparator'; if (v instanceof JScanner) return 'Scanner'; if (v instanceof JRandom) return 'Random';
    if (v === SYSOUT || v === SYSERR) return 'PrintStream'; if (v === SYSIN) return 'InputStream';
    return 'Object';
  }
  const SYSOUT = { ps: 'out' }, SYSERR = { ps: 'err' }, SYSIN = { ins: true };

  // HashMap iterates in the order of its buckets, and a program that prints a map shows that order; so the buckets are modelled
  // (hash spread, table size 16 doubling at 3/4 full), and within a bucket entries keep the order they were added in. TreeMap is sorted.
  class JMap {
    constructor(sorted, cmpFn) { this.sorted = !!sorted; this.cmpFn = cmpFn || null; this.buckets = new Map(); this.size = 0; this.cap = 16; this.seq = 0; this.id = ++JObj.n; this.cache = null; }
    cmp(x, y, R) { return this.cmpFn ? this.cmpFn(x, y) : jcmp(x, y, R); }   // a TreeMap or TreeSet made with a Comparator orders, and tells keys apart, by that
    find(key, R) {
      if (this.cmpFn) { for (const e of this.entries(R)) if (this.cmpFn(e.key, key) === 0) return e; return null; }   // keys are the same when the comparator says 0, not when equals() does
      if (this.sorted && key === null) throwJ(R, 'NullPointerException', null); const h = jhash(key, R); const b = this.buckets.get(h); if (!b) return null; for (const e of b) if (jeq(e.key, key, R)) return e; return null; }
    put(key, value, R) {
      const e = this.find(key, R); if (e) { const old = e.value; e.value = value; return old; }
      if (this.sorted && !this.cmpFn) jcmp(key, key, R);   // a key that is not Comparable is rejected, as in Java
      else if (this.cmpFn) this.cmpFn(key, key);   // and a comparator that cannot take the key
      const h = jhash(key, R); let b = this.buckets.get(h); if (!b) { b = []; this.buckets.set(h, b); }
      b.push({ key, value, h, seq: ++this.seq }); this.size++; this.cache = null;
      while (this.size > this.cap * 0.75 && this.cap < (1 << 30)) this.cap *= 2;
      return null;
    }
    remove(key, R) { let target = null; if (this.cmpFn) { target = this.find(key, R); if (!target) return undefined; key = target.key; } const h = jhash(key, R); const b = this.buckets.get(h); if (!b) return undefined; const i = b.findIndex(e => (target ? e === target : jeq(e.key, key, R))); if (i < 0) return undefined; const [e] = b.splice(i, 1); if (!b.length) this.buckets.delete(h); this.size--; this.cache = null; return e.value; }
    clear() { this.buckets = new Map(); this.size = 0; this.cache = null; }
    entries(R) {
      if (this.cache) return this.cache;
      const all = []; for (const b of this.buckets.values()) for (const e of b) all.push(e);
      if (this.sorted) all.sort((x, y) => this.cmp(x.key, y.key, R));
      else { const n = this.cap; const idx = (h) => (h ^ (h >>> 16)) & (n - 1); all.sort((x, y) => (idx(x.h) - idx(y.h)) || (x.seq - y.seq)); }
      return (this.cache = all);
    }
  }
  class JSet { constructor(sorted, cmpFn) { this.m = new JMap(sorted, cmpFn); this.id = ++JObj.n; } }

  class JScanner {
    constructor(src, more) { this.s = src; this.p = 0; this.closed = false; this.id = ++JObj.n; this.more = more || null; }   // more(): a program that stays running (Bot Arena) waits here for the next text; '' ends the input
    fill() { if (!this.more) return false; const t = this.more(); if (!t) return false; this.s = this.s.slice(this.p) + t; this.p = 0; return true; }
    hasLine() { return this.p < this.s.length || (this.fill() && this.hasLine()); }
    skipWs() { while (this.p < this.s.length && /\s/.test(this.s[this.p])) this.p++; }
    peekToken() { for (;;) { let q = this.p; while (q < this.s.length && /\s/.test(this.s[q])) q++; if (q >= this.s.length) { if (this.fill()) continue; return null; } let e = q; while (e < this.s.length && !/\s/.test(this.s[e])) e++; if (e >= this.s.length && this.fill()) continue; return { tok: this.s.slice(q, e), end: e }; } }
    next(R) { const t = this.peekToken(); if (!t) throwJ(R, 'NoSuchElementException', null); this.p = t.end; return t.tok; }
    nextLine(R) { if (!this.hasLine()) throwJ(R, 'NoSuchElementException', 'No line found'); for (;;) { if (this.s.indexOf('\n', this.p) >= 0 || !this.fill()) break; } const i = this.s.indexOf('\n', this.p); const line = i < 0 ? this.s.slice(this.p) : this.s.slice(this.p, i); this.p = i < 0 ? this.s.length : i + 1; return line.replace(/\r$/, ''); }
    typed(R, re, conv, what) { const t = this.peekToken(); if (!t) throwJ(R, 'NoSuchElementException', null); if (!re.test(t.tok)) throwJ(R, 'InputMismatchException', null); /* Java: no message unless the token is a number out of range */ const v = conv(t.tok); if (v === null) throwJ(R, 'InputMismatchException', 'For input string: "' + t.tok + '"' + (what ? ' (' + what + ')' : '')); this.p = t.end; return v; }
    hasTyped(re, conv) { const t = this.peekToken(); return !!t && re.test(t.tok) && conv(t.tok) !== null; }
  }
  const INT_RE = /^[+-]?\d+$/, DBL_RE = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$|^[+-]?(NaN|Infinity)$/, BOOL_RE = /^(true|false)$/i;
  const toInt = (s) => { const b = BigInt(s); return b < -2147483648n || b > 2147483647n ? null : Number(b); };
  const toLong = (s) => { const b = BigInt(s); return b < -9223372036854775808n || b > 9223372036854775807n ? null : b; };
  const toDbl = (s) => Number(s);

  const MASK48 = (1n << 48n) - 1n, MULT = 0x5DEECE66Dn;
  class JRandom {   // java.util.Random, bit for bit
    constructor(seed) { if (seed === undefined) seed = BigInt(Math.floor(Math.random() * 2 ** 48)) ^ BigInt(Date.now()); this.seed = (BigInt.asIntN(64, seed) ^ MULT) & MASK48; this.id = ++JObj.n; this.haveNextGaussian = false; }
    next(bits) { this.seed = (this.seed * MULT + 0xBn) & MASK48; return Number(BigInt.asIntN(32, this.seed >> BigInt(48 - bits))); }
    nextInt() { return this.next(32); }
    nextIntBound(bound, R) {
      if (bound <= 0) throwJ(R, 'IllegalArgumentException', 'bound must be positive');
      let r = this.next(31); const m = bound - 1;
      if ((bound & m) === 0) return Number((BigInt(bound) * BigInt(r)) >> 31n);
      for (let u = r; ((u - (r = u % bound) + m) | 0) < 0; u = this.next(31));
      return r;
    }
    nextIntRange(origin, bound, R) {
      if (origin >= bound) throwJ(R, 'IllegalArgumentException', 'bound must be greater than origin');
      let r = this.nextInt(); const n = (bound - origin) | 0;
      if (n > 0) { const m = n - 1; if ((n & m) === 0) r = (r & m) + origin; else { for (let u = r >>> 1; ((u + m - (r = u % n)) | 0) < 0; u = this.nextInt() >>> 1); r += origin; } }
      else while (r < origin || r >= bound) r = this.nextInt();
      return r | 0;
    }
    nextLong() { return BigInt.asIntN(64, (BigInt(this.next(32)) << 32n) + BigInt(this.next(32))); }
    nextDouble() { return (this.next(26) * 134217728 + this.next(27)) * 2 ** -53; }
    nextFloat() { return this.next(24) / 16777216; }
    nextBoolean() { return this.next(1) !== 0; }
    nextGaussian() {
      if (this.haveNextGaussian) { this.haveNextGaussian = false; return this.nextNextGaussian; }
      let v1, v2, s; do { v1 = 2 * this.nextDouble() - 1; v2 = 2 * this.nextDouble() - 1; s = v1 * v1 + v2 * v2; } while (s >= 1 || s === 0);
      const mul = Math.sqrt(-2 * Math.log(s) / s); this.nextNextGaussian = v2 * mul; this.haveNextGaussian = true; return v1 * mul;
    }
  }

  // String.format / printf
  // Java's Formatter rounds the shortest decimal form of the value (the digits Double.toString shows) HALF_UP, not the exact binary
  // value as toFixed does: %.2f of 2.675 is 2.68 and of 1.005 is 1.01. A float argument is widened to double first (%.2f of 1.005f is 1.00).
  function decDigits(x) {   // x >= 0, finite: the shortest decimal as D * 10^scale
    if (x === 5e-324) return { D: 49n, scale: -325 };   // Double.MIN_VALUE prints as 4.9E-324
    const [m, e] = String(x).split('e'); const [ip, fp = ''] = m.split('.');
    return { D: BigInt(ip + fp), scale: (e ? +e : 0) - fp.length };
  }
  function halfUpFixed(x, p) {
    const { D, scale } = decDigits(x); const sc = scale + p; let q;
    if (sc >= 0) q = D * 10n ** BigInt(sc); else { const d = 10n ** BigInt(-sc); q = D / d; if ((D % d) * 2n >= d) q++; }
    const t = q.toString().padStart(p + 1, '0'); return p ? t.slice(0, -p) + '.' + t.slice(-p) : t;
  }
  function halfUpExp(x, p) {
    let ds = '0', E = 0;
    if (x !== 0) {
      const { D, scale } = decDigits(x); const all = D.toString(); E = all.length - 1 + scale;
      if (all.length <= p + 1) ds = all.padEnd(p + 1, '0');
      else { let k = BigInt(all.slice(0, p + 1)); if (all[p + 1] >= '5') k++; ds = k.toString(); if (ds.length > p + 1) { ds = ds.slice(0, p + 1); E++; } }
    } else ds = '0'.repeat(p + 1);
    return ds[0] + (p ? '.' + ds.slice(1) : '') + 'e' + (E < 0 ? '-' : '+') + String(Math.abs(E)).padStart(2, '0');
  }
  function jformat(fmt, args, R) {
    let ai = 0; const self = R;
    const group = (intPart) => intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const pad = (s, width, flags) => { if (!width || s.length >= width) return s; if (flags.includes('-')) return s + ' '.repeat(width - s.length); if (flags.includes('0') && /^[+\-( ]?[\d.,]/.test(s) && !/[a-zA-Z]/.test(s.replace(/^[+\-( ]?/, '').replace(/[eE][+-]\d+$/, ''))) { const sign = /^[+\-( ]/.test(s) ? s[0] : ''; /* zeros go after the sign, or after the ( of a negative */ return sign + '0'.repeat(width - s.length) + s.slice(sign.length); } return ' '.repeat(width - s.length) + s; };
    const bad = (conv, v) => throwJ(R, 'IllegalFormatConversionException', conv + ' != ' + qualified(runtimeClassName(v)));
    let last = -1;   // the argument the last specifier used, for %<s
    return fmt.replace(/%(\d+\$|<)?([-#+ 0,(]*)(\d+)?(?:\.(\d+))?([a-zA-Z%])|%/g, (m, idx, flags, width, prec, conv) => {
      if (m === '%') throwJ(R, 'UnknownFormatConversionException', "Conversion = '%'");
      flags = flags || ''; width = width ? +width : 0; prec = prec === undefined ? null : +prec;
      if (conv === 'n') return '\n'; if (conv === '%') return pad('%', width, flags);
      let v;
      if (idx) {   // %2$s: the second argument, and the plain %s that follow keep counting from where they were; %<s: the one just used
        const k = idx === '<' ? last : parseInt(idx, 10) - 1;
        if (k < 0 || k >= args.length) throwJ(R, 'MissingFormatArgumentException', "Format specifier '" + m + "'");
        v = args[k]; last = k;
      } else {
        if (ai >= args.length) throwJ(R, 'MissingFormatArgumentException', "Format specifier '" + m + "'");
        last = ai; v = args[ai++];
      }
      const signed = (s, neg) => { if (neg) return flags.includes('(') ? '(' + s + ')' : '-' + s; return flags.includes('+') ? '+' + s : flags.includes(' ') ? ' ' + s : s; };
      switch (conv) {
        case 'd': {
          if (typeof v === 'number' && !(v instanceof JBox) && Number.isInteger(v)) { let s = String(Math.abs(v)); if (flags.includes(',')) s = group(s); return pad(signed(s, v < 0), width, flags); }
          if (typeof v === 'bigint') { let s = (v < 0n ? -v : v).toString(); if (flags.includes(',')) s = group(s); return pad(signed(s, v < 0n), width, flags); }
          if (v === null) return pad('null', width, flags);
          bad('d', v); break;
        }
        case 'x': case 'X': case 'o': {
          let s; if (typeof v === 'number' && !(v instanceof JBox)) s = (v >>> 0).toString(conv === 'o' ? 8 : 16); else if (typeof v === 'bigint') s = BigInt.asUintN(64, v).toString(conv === 'o' ? 8 : 16); else if (v === null) s = 'null'; else bad(conv, v);
          const pre = flags.includes('#') ? (conv === 'o' ? '0' : '0x') : ''; if (flags.includes('0') && !flags.includes('-') && width > pre.length + s.length) s = '0'.repeat(width - pre.length - s.length) + s; s = pre + s; return pad(conv === 'X' ? s.toUpperCase() : s, width, flags);
        }
        case 'f': case 'e': case 'E': case 'g': case 'G': {
          let x; if (v instanceof JBox && (v.kind === 'D' || v.kind === 'F')) x = v.v; else if (v === null) return pad('null', width, flags); else bad(conv, v);
          if (!Number.isFinite(x)) { const t = Number.isNaN(x) ? 'NaN' : signed('Infinity', x < 0); return pad(conv === 'E' || conv === 'G' ? t.toUpperCase() : t, width, flags.replace('0', '')); }
          const p = prec === null ? 6 : prec; const neg = x < 0 || (x === 0 && 1 / x < 0); x = Math.abs(x); let s;
          if (conv === 'f') { s = halfUpFixed(x, p); if (flags.includes(',')) { const [i, f] = s.split('.'); s = group(i) + (f !== undefined ? '.' + f : ''); } }
          else if (conv === 'e' || conv === 'E') { s = halfUpExp(x, p); if (conv === 'E') s = s.toUpperCase(); }
          else { const P = p === 0 ? 1 : p; const ex = halfUpExp(x, P - 1), E = x === 0 ? 0 : +ex.slice(ex.indexOf('e') + 1); if (E < -4 || E >= P) s = ex; else { s = halfUpFixed(x, Math.max(0, P - 1 - E)); if (flags.includes(',')) { const [i, f] = s.split('.'); s = group(i) + (f !== undefined ? '.' + f : ''); } } if (conv === 'G') s = s.toUpperCase(); }
          return pad(signed(s, neg), width, flags);
        }
        case 's': case 'S': { let s = dstr(v, self); if (prec !== null) s = s.slice(0, prec); if (conv === 'S') s = s.toUpperCase(); return pad(s, width, flags); }
        case 'c': case 'C': { let s; if (v instanceof JBox && v.kind === 'C') s = String.fromCharCode(v.v); else if (typeof v === 'number' && !(v instanceof JBox)) s = String.fromCodePoint(v); else if (v === null) s = 'null'; else bad(conv, v); if (conv === 'C') s = s.toUpperCase(); return pad(s, width, flags); }
        case 'b': case 'B': { let s = v === null ? 'false' : typeof v === 'boolean' ? String(v) : 'true'; if (prec !== null) s = s.slice(0, prec); if (conv === 'B') s = s.toUpperCase(); return pad(s, width, flags); }
        case 'h': return pad(hex(jhash(v, self)), width, flags);
        default: throwJ(R, 'UnknownFormatConversionException', "Conversion = '" + conv + "'");
      }
      return '';
    });
  }

  // Java regular expressions and JavaScript ones agree on what students write (literal text, classes, quantifiers); a few differences are mapped.
  function jregex(re, R) { try { return new RegExp(re.replace(/\\p\{Alpha\}/g, '[A-Za-z]').replace(/\\p\{Digit\}/g, '[0-9]').replace(/\\p\{Punct\}/g, '[!-\\/:-@\\[-`{-~]').replace(/\(\?<(\w+)>/g, '(?<$1>'), 'u'); } catch (e) { throwJ(R, 'PatternSyntaxException', e.message + ' near index 0\n' + re); } }
  function jsplit(s, re, limit, R) {   // String.split as Java does it: no captured groups in the result, a zero-length match at 0 skipped
    if (s === '') return [''];
    const rx = jregex(re, R), g = new RegExp(rx.source, rx.flags + 'g');
    const parts = []; let index = 0, m;
    while ((m = g.exec(s)) !== null) {
      if (m[0] === '') g.lastIndex++;
      if (m[0] === '' && m.index === 0) continue;
      if (limit > 0 && parts.length >= limit - 1) break;
      parts.push(s.slice(index, m.index)); index = m.index + m[0].length;
    }
    if (!parts.length) return [s];
    parts.push(s.slice(index));
    if (limit === 0) while (parts.length > 0 && parts[parts.length - 1] === '') parts.pop();   // ",,".split(",") is empty
    return parts;
  }
  const re1 = (re) => re.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  /* ======================================================================================================================== library */
  function throwJ(R, name, msg) { const c = NATIVE[name] || NATIVE.RuntimeException; const o = new JObj(c); o.f.message = msg === undefined ? null : msg; o.f.cause = null; o.trace = R.frames.slice(); throw new JavaThrow(o); }
  const npe = (R, what) => throwJ(R, 'NullPointerException', what || null);
  const nn = (R, v, what) => { if (v === null || v === undefined) npe(R, what); return v; };
  const sidx = (R, s, i) => { if (i < 0 || i >= s.length) throwJ(R, 'StringIndexOutOfBoundsException', 'Index ' + i + ' out of bounds for length ' + s.length); return s.charCodeAt(i); };
  // the JDK 21 wording of a bad range: "Range [2, 1) out of bounds for length 3" (substring, StringBuilder insert/delete/replace)
  const srange = (R, b, e, len) => { if (b < 0 || b > e || e > len) throwJ(R, 'StringIndexOutOfBoundsException', 'Range [' + b + ', ' + e + ') out of bounds for length ' + len); };
  const substrJ = (R, s, b, e) => { srange(R, b, e, s.length); return s.slice(b, e); };
  const lidx = (R, a, i, linked) => { if (i < 0 || i >= a.length) throwJ(R, 'IndexOutOfBoundsException', linked ? 'Index: ' + i + ', Size: ' + a.length : 'Index ' + i + ' out of bounds for length ' + a.length); return i; };   // LinkedList words it the old way
  const chars = (R, a) => String.fromCharCode.apply(null, nn(R, a).a);
  const toJList = (v) => (v instanceof JList ? v.a : v instanceof JSet ? (v.ordered || v.m.entries().map(e => e.key)) : v instanceof JArr ? v.a : []);
  const collItems = (R, v) => { nn(R, v); if (v instanceof JList) return v.a.slice(); if (v instanceof JSet) return v.ordered ? v.ordered.slice() : v.m.entries(R).map(e => e.key); if (v instanceof JArr) return v.a.slice(); return []; };
  const unb = (v) => (v instanceof JBox ? v.v : v);
  const parseIntJ = (R, s, radix) => { if (s === null) throwJ(R, 'NumberFormatException', 'Cannot parse null string'); radix = radix || 10; if (radix < 2) throwJ(R, 'NumberFormatException', 'radix ' + radix + ' less than Character.MIN_RADIX'); if (radix > 36) throwJ(R, 'NumberFormatException', 'radix ' + radix + ' greater than Character.MAX_RADIX'); const re = radix === 10 ? /^[+-]?\d+$/ : radix === 16 ? /^[+-]?[0-9a-fA-F]+$/ : radix === 2 ? /^[+-]?[01]+$/ : radix === 8 ? /^[+-]?[0-7]+$/ : /^[+-]?[0-9a-zA-Z]+$/; if (!re.test(s) || [...s.replace(/^[+-]/, '')].some((ch) => parseInt(ch, 36) >= radix)) throwJ(R, 'NumberFormatException', 'For input string: "' + s + '"' + (radix !== 10 ? ' under radix ' + radix : '')); const v = parseInt(s, radix) + 0; if (v < -2147483648 || v > 2147483647) throwJ(R, 'NumberFormatException', 'For input string: "' + s + '"' + (radix !== 10 ? ' under radix ' + radix : '')); return v; };
  const parseLongJ = (R, s) => { if (s === null) throwJ(R, 'NumberFormatException', 'Cannot parse null string'); if (!/^[+-]?\d+$/.test(s)) throwJ(R, 'NumberFormatException', 'For input string: "' + s + '"'); const v = toLong(s); if (v === null) throwJ(R, 'NumberFormatException', 'For input string: "' + s + '"'); return v; };
  const parseDoubleJ = (R, s) => { if (s === null) npe(R, 'Cannot invoke "String.trim()" because "in" is null');   // JDK 21's words (its parser trims first)
  const t = s.trim(); if (t === '') throwJ(R, 'NumberFormatException', 'empty String'); if (!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?[fFdD]?$|^[+-]?(NaN|Infinity)$/.test(t)) throwJ(R, 'NumberFormatException', 'For input string: "' + s + '"'); return Number(t.replace(/[fFdD]$/, '')); };
  const roundJ = (x) => { if (Number.isNaN(x)) return 0n; const r = Math.round(x);   // Math.round rounds the exact value (0.49999999999999994 → 0), ties up, as Java does
    if (r >= 9223372036854775807) return 9223372036854775807n; if (r <= -9223372036854775808) return -9223372036854775808n; return BigInt(r); };
  // a Comparator: null (natural order), a JCmp (reverseOrder/reversed), or an object of a user class with compare(T, T)
  const cmpWith = (R, c) => {
    if (c === null || c === undefined) return (x, y) => jcmp(x, y, R);
    if (c instanceof JCmp) { const f = cmpWith(R, c.base); return c.rev ? (x, y) => f(y, x) : f; }
    if (c instanceof JObj) { let m = null; for (let k = c.cls; k && !m; k = k.ext ? R.classOf(k.ext) : null) m = (k.methods.compare || []).find(o => o.params.length === 2 && !o.native && !o.abstract) || null; if (m) return (x, y) => R.invoke(c, m, [x, y]) | 0; }
    throwJ(R, 'UnsupportedOperationException', 'this comparator is not supported by this interpreter');
  };
  const sortJ = (R, a, cmp) => { const items = a.slice(); const f = cmpWith(R, cmp); items.sort((x, y) => f(x, y)); return items; };   // stable, like Java's object sort
  const ovl = (name, types, mk) => { const o = {}; for (const t of types) o[name + '(' + t + ')'] = mk(sigType(t), t); return o; };
  const PRINT_TYPES = ['char', 'int', 'long', 'double', 'float', 'boolean', 'char[]', 'String', 'Object'];
  const printArg = (R, v, t) => (t.k === 'array' ? chars(R, v) : jstr(v, t, R));
  const exceptionCtors = { '': (o) => { o.f.message = null; o.f.cause = null; }, 'String': (o, a) => { o.f.message = a[0]; o.f.cause = null; }, 'String,Throwable': (o, a) => { o.f.message = a[0]; o.f.cause = a[1]; }, 'Throwable': (o, a) => { o.f.cause = a[0]; o.f.message = a[0] === null ? null : dstr(a[0], o.R); } };
  const traceText = (R, o) => { const name = excName(o.cls) + (o.f.message != null ? ': ' + dstr(o.f.message, R) : ''); const fr = (o.trace || []).slice().reverse().map(f => '\tat ' + f.cls + '.' + f.name + '(' + R.fileName + ':' + f.line + ')'); return name + (fr.length ? '\n' + fr.join('\n') : ''); };

  def('Object', { ext: null, objClass: true, ctors: { '': () => { } }, methods: {
    'equals(Object)': ['boolean', (o, a) => o === a[0]], 'hashCode()': ['int', (o, a, R) => jhash(o, R)], 'toString()': ['String', (o, a, R) => dstr(o, R)],
    'getClass()': ['Class', (o) => ({ classOf: runtimeClassName(o) })] } });
  NATIVE.Object.objClass = true;
  def('Class', { noNew: true, methods: { 'getSimpleName()': ['String', (c) => c.classOf], 'getName()': ['String', (c) => qualified(c.classOf)], 'toString()': ['String', (c) => 'class ' + qualified(c.classOf)] } });
  def('Comparable', { isInterface: true, tparams: ['T'], methods: { 'compareTo(T)': ['int', (o, a, R) => jcmp(o, a[0], R)] } });
  def('Comparator', { isInterface: true, tparams: ['T'], methods: { 'compare(T,T)': ['int', (c, a, R) => cmpWith(R, c)(a[0], a[1])], 'reversed()': ['Comparator<T>', (c) => new JCmp(c, true)] },
    statics: { 'naturalOrder()': ['Comparator<T>', () => new JCmp(null, false)], 'reverseOrder()': ['Comparator<T>', () => new JCmp(null, true)] } });
  def('CharSequence', { isInterface: true, methods: { 'length()': ['int', (s) => s.length], 'charAt(int)': ['char', (s, a, R) => sidx(R, s, a[0])], 'toString()': ['String', (s, a, R) => dstr(s, R)] } });
  def('Iterable', { isInterface: true, tparams: ['E'], methods: {} });
  def('Number', { abstract: true, methods: { 'intValue()': ['int', (v) => { v = unb(v); return typeof v === 'bigint' ? Number(BigInt.asIntN(32, v)) : (v | 0); }], 'doubleValue()': ['double', (v) => Number(unb(v))], 'longValue()': ['long', (v) => { v = unb(v); return typeof v === 'bigint' ? v : BigInt(Math.trunc(v)); }] } });
  def('String', { impl: ['Comparable', 'CharSequence'], ctors: { '': () => '', 'String': (o, a, R) => nn(R, a[0]), 'char[]': (o, a, R) => chars(R, a[0]), 'StringBuilder': (o, a, R) => nn(R, a[0]).s },
    fields: { 'CASE_INSENSITIVE_ORDER': ['Object', null] },
    methods: {
      'length()': ['int', (s) => s.length], 'charAt(int)': ['char', (s, a, R) => sidx(R, s, a[0])], 'isEmpty()': ['boolean', (s) => s.length === 0], 'isBlank()': ['boolean', (s) => s.trim().length === 0],
      'substring(int)': ['String', (s, a, R) => substrJ(R, s, a[0], s.length)],
      'substring(int,int)': ['String', (s, a, R) => substrJ(R, s, a[0], a[1])],
      'indexOf(String)': ['int', (s, a, R) => s.indexOf(nn(R, a[0]))], 'indexOf(int)': ['int', (s, a) => s.indexOf(String.fromCharCode(a[0]))], 'indexOf(String,int)': ['int', (s, a, R) => s.indexOf(nn(R, a[0]), a[1])], 'indexOf(int,int)': ['int', (s, a) => s.indexOf(String.fromCharCode(a[0]), a[1])],
      'lastIndexOf(String)': ['int', (s, a, R) => s.lastIndexOf(nn(R, a[0]))], 'lastIndexOf(int)': ['int', (s, a) => s.lastIndexOf(String.fromCharCode(a[0]))],
      'lastIndexOf(String,int)': ['int', (s, a, R) => (a[1] < 0 ? -1 : s.lastIndexOf(nn(R, a[0]), a[1]))], 'lastIndexOf(int,int)': ['int', (s, a) => (a[1] < 0 ? -1 : s.lastIndexOf(String.fromCharCode(a[0]), a[1]))],
      'contains(CharSequence)': ['boolean', (s, a, R) => s.includes(dstr(nn(R, a[0]), R))], 'equals(Object)': ['boolean', (s, a) => s === a[0]], 'equalsIgnoreCase(String)': ['boolean', (s, a) => a[0] !== null && s.toLowerCase() === a[0].toLowerCase()],
      'compareTo(String)': ['int', (s, a, R) => strCompare(s, nn(R, a[0]))], 'compareToIgnoreCase(String)': ['int', (s, a, R) => strCompare(s.toUpperCase().toLowerCase(), nn(R, a[0]).toUpperCase().toLowerCase())],
      'toUpperCase()': ['String', (s) => s.toUpperCase()], 'toLowerCase()': ['String', (s) => s.toLowerCase()], 'trim()': ['String', (s) => s.replace(/^[\x00-\x20]+|[\x00-\x20]+$/g, '')], 'strip()': ['String', (s) => s.trim()], 'stripLeading()': ['String', (s) => s.replace(/^\s+/, '')], 'stripTrailing()': ['String', (s) => s.replace(/\s+$/, '')],
      'startsWith(String)': ['boolean', (s, a, R) => s.startsWith(nn(R, a[0]))], 'startsWith(String,int)': ['boolean', (s, a, R) => s.startsWith(nn(R, a[0]), a[1])], 'endsWith(String)': ['boolean', (s, a, R) => s.endsWith(nn(R, a[0]))],
      'replace(char,char)': ['String', (s, a) => s.split(String.fromCharCode(a[0])).join(String.fromCharCode(a[1]))], 'replace(CharSequence,CharSequence)': ['String', (s, a, R) => s.split(dstr(nn(R, a[0]), R)).join(dstr(nn(R, a[1]), R))],
      'replaceAll(String,String)': ['String', (s, a, R) => s.replace(new RegExp(jregex(nn(R, a[0]), R).source, 'gu'), nn(R, a[1]).replace(/\$(\d)/g, '$$$1'))], 'replaceFirst(String,String)': ['String', (s, a, R) => s.replace(jregex(nn(R, a[0]), R), nn(R, a[1]).replace(/\$(\d)/g, '$$$1'))],
      'matches(String)': ['boolean', (s, a, R) => new RegExp('^(?:' + jregex(nn(R, a[0]), R).source + ')$', 'u').test(s)],
      'split(String)': ['String[]', (s, a, R) => new JArr(T.String, jsplit(s, nn(R, a[0]), 0, R))], 'split(String,int)': ['String[]', (s, a, R) => new JArr(T.String, jsplit(s, nn(R, a[0]), a[1], R))],
      'toCharArray()': ['char[]', (s) => new JArr(T.char, Array.from(s, c => c.charCodeAt(0)))], 'chars()': ['int[]', (s) => new JArr(T.int, Array.from(s, c => c.charCodeAt(0)))],
      'repeat(int)': ['String', (s, a, R) => { if (a[0] < 0) throwJ(R, 'IllegalArgumentException', 'count is negative: ' + a[0]); return s.repeat(a[0]); }], 'concat(String)': ['String', (s, a, R) => s + nn(R, a[0])],
      'hashCode()': ['int', (s) => strHash(s)], 'toString()': ['String', (s) => s], 'intern()': ['String', (s) => s], 'codePointAt(int)': ['int', (s, a, R) => sidx(R, s, a[0])]
    },
    statics: {
      'valueOf(char)': ['String', (o, a) => String.fromCharCode(a[0])], 'valueOf(int)': ['String', (o, a) => String(a[0])], 'valueOf(long)': ['String', (o, a) => a[0].toString()], 'valueOf(double)': ['String', (o, a) => fmtDouble(a[0])], 'valueOf(float)': ['String', (o, a) => fmtFloat(a[0])], 'valueOf(boolean)': ['String', (o, a) => String(a[0])], 'valueOf(char[])': ['String', (o, a, R) => chars(R, a[0])], 'valueOf(Object)': ['String', (o, a, R) => dstr(a[0], R)],
      'format(String,Object...)': ['String', (o, a, R) => jformat(nn(R, a[0]), a[1].a, R)], 'join(CharSequence,Object...)': ['String', (o, a, R) => a[1].a.map(x => dstr(x, R)).join(dstr(nn(R, a[0]), R))], 'join(CharSequence,Iterable<T>)': ['String', (o, a, R) => collItems(R, a[1]).map(x => dstr(x, R)).join(dstr(nn(R, a[0]), R))],
      'copyValueOf(char[])': ['String', (o, a, R) => chars(R, a[0])]
    } });
  const boxCommon = (kind) => ({ 'equals(Object)': ['boolean', (v, a, R) => jeq(v, a[0], R)], 'hashCode()': ['int', (v, a, R) => jhash(v, R)], 'toString()': ['String', (v, a, R) => dstr(v, R)], ['compareTo(' + kind + ')']: ['int', (v, a, R) => jcmp(v, a[0] instanceof JBox ? a[0] : v instanceof JBox ? new JBox(v.kind, a[0]) : a[0], R)] });
  def('Integer', { ext: 'Number', impl: ['Comparable'], fields: { MAX_VALUE: ['int', 2147483647], MIN_VALUE: ['int', -2147483648], SIZE: ['int', 32], BYTES: ['int', 4] },
    methods: Object.assign(boxCommon('Integer'), { 'intValue()': ['int', (v) => v], 'doubleValue()': ['double', (v) => v], 'longValue()': ['long', (v) => BigInt(v)] }),
    statics: { 'parseInt(String)': ['int', (o, a, R) => parseIntJ(R, a[0])], 'parseInt(String,int)': ['int', (o, a, R) => parseIntJ(R, a[0], a[1])], 'valueOf(String)': ['Integer', (o, a, R) => parseIntJ(R, a[0])], 'valueOf(int)': ['Integer', (o, a) => a[0]],
      'toString(int)': ['String', (o, a) => String(a[0])], 'toString(int,int)': ['String', (o, a) => a[0].toString(a[1])], 'toBinaryString(int)': ['String', (o, a) => (a[0] >>> 0).toString(2)], 'toHexString(int)': ['String', (o, a) => (a[0] >>> 0).toString(16)], 'toOctalString(int)': ['String', (o, a) => (a[0] >>> 0).toString(8)],
      'max(int,int)': ['int', (o, a) => Math.max(a[0], a[1])], 'min(int,int)': ['int', (o, a) => Math.min(a[0], a[1])], 'sum(int,int)': ['int', (o, a) => (a[0] + a[1]) | 0], 'compare(int,int)': ['int', (o, a) => (a[0] < a[1] ? -1 : a[0] > a[1] ? 1 : 0)], 'signum(int)': ['int', (o, a) => Math.sign(a[0])], 'abs(int)': ['int', (o, a) => Math.abs(a[0]) | 0], 'bitCount(int)': ['int', (o, a) => { let n = a[0] >>> 0, c = 0; while (n) { c += n & 1; n >>>= 1; } return c; }] } });
  def('Long', { ext: 'Number', impl: ['Comparable'], fields: { MAX_VALUE: ['long', 9223372036854775807n], MIN_VALUE: ['long', -9223372036854775808n] },
    methods: Object.assign(boxCommon('Long'), { 'longValue()': ['long', (v) => v], 'intValue()': ['int', (v) => Number(BigInt.asIntN(32, v))], 'doubleValue()': ['double', (v) => Number(v)] }),
    statics: { 'parseLong(String)': ['long', (o, a, R) => parseLongJ(R, a[0])], 'valueOf(String)': ['Long', (o, a, R) => parseLongJ(R, a[0])], 'valueOf(long)': ['Long', (o, a) => a[0]], 'toString(long)': ['String', (o, a) => a[0].toString()], 'max(long,long)': ['long', (o, a) => (a[0] > a[1] ? a[0] : a[1])], 'min(long,long)': ['long', (o, a) => (a[0] < a[1] ? a[0] : a[1])], 'compare(long,long)': ['int', (o, a) => (a[0] < a[1] ? -1 : a[0] > a[1] ? 1 : 0)], 'sum(long,long)': ['long', (o, a) => BigInt.asIntN(64, a[0] + a[1])], 'abs(long)': ['long', (o, a) => BigInt.asIntN(64, a[0] < 0n ? -a[0] : a[0])], 'toBinaryString(long)': ['String', (o, a) => BigInt.asUintN(64, a[0]).toString(2)], 'toHexString(long)': ['String', (o, a) => BigInt.asUintN(64, a[0]).toString(16)] } });
  def('Double', { ext: 'Number', impl: ['Comparable'], fields: { MAX_VALUE: ['double', Number.MAX_VALUE], MIN_VALUE: ['double', 5e-324], POSITIVE_INFINITY: ['double', Infinity], NEGATIVE_INFINITY: ['double', -Infinity], NaN: ['double', NaN] },
    methods: Object.assign(boxCommon('Double'), { 'doubleValue()': ['double', (v) => v.v], 'intValue()': ['int', (v) => d2i(v.v)], 'longValue()': ['long', (v) => d2l(v.v)], 'isNaN()': ['boolean', (v) => Number.isNaN(v.v)], 'isInfinite()': ['boolean', (v) => v.v === Infinity || v.v === -Infinity] }),
    statics: { 'parseDouble(String)': ['double', (o, a, R) => parseDoubleJ(R, a[0])], 'valueOf(String)': ['Double', (o, a, R) => new JBox('D', parseDoubleJ(R, a[0]))], 'valueOf(double)': ['Double', (o, a) => new JBox('D', a[0])], 'toString(double)': ['String', (o, a) => fmtDouble(a[0])], 'compare(double,double)': ['int', (o, a) => jcmp(new JBox('D', a[0]), new JBox('D', a[1]))], 'isNaN(double)': ['boolean', (o, a) => Number.isNaN(a[0])], 'isInfinite(double)': ['boolean', (o, a) => !Number.isFinite(a[0]) && !Number.isNaN(a[0])], 'isFinite(double)': ['boolean', (o, a) => Number.isFinite(a[0])], 'max(double,double)': ['double', (o, a) => Math.max(a[0], a[1])], 'min(double,double)': ['double', (o, a) => Math.min(a[0], a[1])], 'sum(double,double)': ['double', (o, a) => a[0] + a[1]] } });
  def('Float', { ext: 'Number', impl: ['Comparable'], fields: { MAX_VALUE: ['float', 3.4028234663852886e38], MIN_VALUE: ['float', 1.401298464324817e-45] },
    methods: Object.assign(boxCommon('Float'), { 'floatValue()': ['float', (v) => v.v], 'doubleValue()': ['double', (v) => v.v], 'intValue()': ['int', (v) => d2i(v.v)] }),
    statics: { 'parseFloat(String)': ['float', (o, a, R) => Math.fround(parseDoubleJ(R, a[0]))], 'valueOf(float)': ['Float', (o, a) => new JBox('F', a[0])], 'toString(float)': ['String', (o, a) => fmtFloat(a[0])], 'compare(float,float)': ['int', (o, a) => jcmp(new JBox('F', a[0]), new JBox('F', a[1]))], 'isNaN(float)': ['boolean', (o, a) => Number.isNaN(a[0])] } });
  def('Short', { ext: 'Number', impl: ['Comparable'], fields: { MAX_VALUE: ['short', 32767], MIN_VALUE: ['short', -32768] }, methods: Object.assign(boxCommon('Short'), { 'shortValue()': ['short', (v) => v], 'intValue()': ['int', (v) => v] }), statics: { 'parseShort(String)': ['short', (o, a, R) => { const v = parseIntJ(R, a[0]); if (v < -32768 || v > 32767) throwJ(R, 'NumberFormatException', 'Value out of range. Value:"' + a[0] + '" Radix:10'); return v; }], 'toString(short)': ['String', (o, a) => String(a[0])] } });
  def('Byte', { ext: 'Number', impl: ['Comparable'], fields: { MAX_VALUE: ['byte', 127], MIN_VALUE: ['byte', -128] }, methods: Object.assign(boxCommon('Byte'), { 'byteValue()': ['byte', (v) => v], 'intValue()': ['int', (v) => v] }), statics: { 'parseByte(String)': ['byte', (o, a, R) => { const v = parseIntJ(R, a[0]); if (v < -128 || v > 127) throwJ(R, 'NumberFormatException', 'Value out of range. Value:"' + a[0] + '" Radix:10'); return v; }], 'toString(byte)': ['String', (o, a) => String(a[0])] } });
  def('Character', { impl: ['Comparable'], fields: { MAX_VALUE: ['char', 65535], MIN_VALUE: ['char', 0] },
    methods: Object.assign(boxCommon('Character'), { 'charValue()': ['char', (v) => v.v] }),
    statics: Object.assign({}, ...['char', 'int'].map(t => ({
      ['isDigit(' + t + ')']: ['boolean', (o, a) => /\p{Nd}/u.test(String.fromCodePoint(a[0]))], ['isLetter(' + t + ')']: ['boolean', (o, a) => /\p{L}/u.test(String.fromCodePoint(a[0]))], ['isLetterOrDigit(' + t + ')']: ['boolean', (o, a) => /[\p{L}\p{Nd}]/u.test(String.fromCodePoint(a[0]))],
      ['isAlphabetic(' + t + ')']: ['boolean', (o, a) => /\p{Alphabetic}/u.test(String.fromCodePoint(a[0]))], ['isUpperCase(' + t + ')']: ['boolean', (o, a) => /\p{Lu}/u.test(String.fromCodePoint(a[0]))], ['isLowerCase(' + t + ')']: ['boolean', (o, a) => /\p{Ll}/u.test(String.fromCodePoint(a[0]))],
      ['isWhitespace(' + t + ')']: ['boolean', (o, a) => /[\t\n\x0B\f\r\x1C-\x1F \u1680\u2000-\u2006\u2008-\u200A\u2028\u2029\u205F\u3000]/.test(String.fromCodePoint(a[0]))], ['isSpaceChar(' + t + ')']: ['boolean', (o, a) => /\p{Zs}/u.test(String.fromCodePoint(a[0]))],
      ['toUpperCase(' + t + ')']: [t, (o, a) => { const u = String.fromCodePoint(a[0]).toUpperCase(); return u.length === 1 ? u.charCodeAt(0) : a[0]; }], ['toLowerCase(' + t + ')']: [t, (o, a) => { const u = String.fromCodePoint(a[0]).toLowerCase(); return u.length === 1 ? u.charCodeAt(0) : a[0]; }],
      ['getNumericValue(' + t + ')']: ['int', (o, a) => { const c = String.fromCodePoint(a[0]); if (/\p{Nd}/u.test(c)) return +c.normalize('NFKD')[0] || parseInt(c, 10) || 0; if (/[a-zA-Z]/.test(c)) return c.toLowerCase().charCodeAt(0) - 87; return -1; }]
    })), { 'toString(char)': ['String', (o, a) => String.fromCharCode(a[0])], 'toString(int)': ['String', (o, a, R) => { if (a[0] < 0 || a[0] > 0x10FFFF) throwJ(R, 'IllegalArgumentException', 'Not a valid Unicode code point: 0x' + (a[0] >>> 0).toString(16).toUpperCase()); return String.fromCodePoint(a[0]); }], 'valueOf(char)': ['Character', (o, a) => new JBox('C', a[0])], 'compare(char,char)': ['int', (o, a) => a[0] - a[1]], 'digit(char,int)': ['int', (o, a) => { const d = parseInt(String.fromCharCode(a[0]), a[1]); return Number.isNaN(d) ? -1 : d; }], 'forDigit(int,int)': ['char', (o, a) => (a[0] < 0 || a[0] >= a[1] ? 0 : a[0].toString(a[1]).charCodeAt(0))] }) });
  def('Boolean', { impl: ['Comparable'], fields: { TRUE: ['Boolean', true], FALSE: ['Boolean', false] }, methods: Object.assign(boxCommon('Boolean'), { 'booleanValue()': ['boolean', (v) => v] }),
    statics: { 'parseBoolean(String)': ['boolean', (o, a) => a[0] !== null && a[0].toLowerCase() === 'true'], 'toString(boolean)': ['String', (o, a) => String(a[0])], 'valueOf(boolean)': ['Boolean', (o, a) => a[0]], 'valueOf(String)': ['Boolean', (o, a) => a[0] !== null && a[0].toLowerCase() === 'true'], 'compare(boolean,boolean)': ['int', (o, a) => (a[0] === a[1] ? 0 : a[0] ? 1 : -1)], 'logicalAnd(boolean,boolean)': ['boolean', (o, a) => a[0] && a[1]], 'logicalOr(boolean,boolean)': ['boolean', (o, a) => a[0] || a[1]], 'logicalXor(boolean,boolean)': ['boolean', (o, a) => a[0] !== a[1]] } });
  function d2i(x) { if (Number.isNaN(x)) return 0; if (x >= 2147483647) return 2147483647; if (x <= -2147483648) return -2147483648; return Math.trunc(x) | 0; }
  function d2l(x) { if (Number.isNaN(x)) return 0n; if (x >= 9223372036854775807) return 9223372036854775807n; if (x <= -9223372036854775808) return -9223372036854775808n; return BigInt(Math.trunc(x)); }
  def('Math', { noNew: true, fields: { PI: ['double', Math.PI], E: ['double', Math.E] }, statics: {
    'abs(int)': ['int', (o, a) => Math.abs(a[0]) | 0], 'abs(long)': ['long', (o, a) => BigInt.asIntN(64, a[0] < 0n ? -a[0] : a[0])], 'abs(double)': ['double', (o, a) => Math.abs(a[0])], 'abs(float)': ['float', (o, a) => Math.abs(a[0])],
    'max(int,int)': ['int', (o, a) => Math.max(a[0], a[1])], 'max(long,long)': ['long', (o, a) => (a[0] > a[1] ? a[0] : a[1])], 'max(double,double)': ['double', (o, a) => Math.max(a[0], a[1])], 'max(float,float)': ['float', (o, a) => Math.max(a[0], a[1])],
    'min(int,int)': ['int', (o, a) => Math.min(a[0], a[1])], 'min(long,long)': ['long', (o, a) => (a[0] < a[1] ? a[0] : a[1])], 'min(double,double)': ['double', (o, a) => Math.min(a[0], a[1])], 'min(float,float)': ['float', (o, a) => Math.min(a[0], a[1])],
    'pow(double,double)': ['double', (o, a) => Math.pow(a[0], a[1])], 'sqrt(double)': ['double', (o, a) => Math.sqrt(a[0])], 'cbrt(double)': ['double', (o, a) => Math.cbrt(a[0])], 'sinh(double)': ['double', (o, a) => Math.sinh(a[0])], 'cosh(double)': ['double', (o, a) => Math.cosh(a[0])], 'tanh(double)': ['double', (o, a) => Math.tanh(a[0])], 'log1p(double)': ['double', (o, a) => Math.log1p(a[0])], 'expm1(double)': ['double', (o, a) => Math.expm1(a[0])], 'hypot(double,double)': ['double', (o, a) => Math.hypot(a[0], a[1])],
    'floor(double)': ['double', (o, a) => Math.floor(a[0])], 'ceil(double)': ['double', (o, a) => Math.ceil(a[0])], 'round(double)': ['long', (o, a) => roundJ(a[0])], 'round(float)': ['int', (o, a) => d2i(Math.round(a[0]))], 'rint(double)': ['double', (o, a) => { const f = Math.floor(a[0]), d = a[0] - f, r = d < 0.5 ? f : d > 0.5 ? f + 1 : (f % 2 === 0 ? f : f + 1); return r === 0 && (a[0] < 0 || Object.is(a[0], -0)) ? -0 : r; }],   // a negative that rounds to zero is -0.0
    'random()': ['double', () => Math.random()], 'sin(double)': ['double', (o, a) => Math.sin(a[0])], 'cos(double)': ['double', (o, a) => Math.cos(a[0])], 'tan(double)': ['double', (o, a) => Math.tan(a[0])], 'asin(double)': ['double', (o, a) => Math.asin(a[0])], 'acos(double)': ['double', (o, a) => Math.acos(a[0])], 'atan(double)': ['double', (o, a) => Math.atan(a[0])], 'atan2(double,double)': ['double', (o, a) => Math.atan2(a[0], a[1])],
    'exp(double)': ['double', (o, a) => Math.exp(a[0])], 'log(double)': ['double', (o, a) => Math.log(a[0])], 'log10(double)': ['double', (o, a) => Math.log10(a[0])], 'signum(double)': ['double', (o, a) => Math.sign(a[0])], 'toRadians(double)': ['double', (o, a) => a[0] / 180 * Math.PI], 'toDegrees(double)': ['double', (o, a) => a[0] * 180 / Math.PI],
    'floorDiv(int,int)': ['int', (o, a, R) => { if (a[1] === 0) throwJ(R, 'ArithmeticException', '/ by zero'); return Math.floor(a[0] / a[1]) | 0; }], 'floorMod(int,int)': ['int', (o, a, R) => { if (a[1] === 0) throwJ(R, 'ArithmeticException', '/ by zero'); return (((a[0] % a[1]) + a[1]) % a[1]) | 0; }],
    'floorDiv(long,long)': ['long', (o, a, R) => { if (a[1] === 0n) throwJ(R, 'ArithmeticException', '/ by zero'); let q = a[0] / a[1]; if ((a[0] % a[1] !== 0n) && ((a[0] < 0n) !== (a[1] < 0n))) q -= 1n; return q; }], 'floorMod(long,long)': ['long', (o, a, R) => { if (a[1] === 0n) throwJ(R, 'ArithmeticException', '/ by zero'); return ((a[0] % a[1]) + a[1]) % a[1]; }],
    'addExact(int,int)': ['int', (o, a, R) => { const r = a[0] + a[1]; if (r !== (r | 0)) throwJ(R, 'ArithmeticException', 'integer overflow'); return r; }], 'multiplyExact(int,int)': ['int', (o, a, R) => { const r = a[0] * a[1]; if (r !== (r | 0)) throwJ(R, 'ArithmeticException', 'integer overflow'); return r; }], 'toIntExact(long)': ['int', (o, a, R) => { if (a[0] < -2147483648n || a[0] > 2147483647n) throwJ(R, 'ArithmeticException', 'integer overflow'); return Number(a[0]); }]
  } });
  def('StringBuilder', { impl: ['CharSequence', 'Comparable'], ctors: { '': () => new JSB(''), 'String': (o, a, R) => new JSB(nn(R, a[0])), 'int': () => new JSB(''), 'CharSequence': (o, a, R) => new JSB(dstr(nn(R, a[0]), R)) },
    methods: Object.assign(
      ovl('append', PRINT_TYPES, (t) => ['StringBuilder', (b, a, R) => { b.s += printArg(R, a[0], t); return b; }]),
      ovl('insert', PRINT_TYPES.map(t => 'int,' + t), (t, s) => ['StringBuilder', (b, a, R) => { srange(R, a[0], b.s.length, b.s.length); b.s = b.s.slice(0, a[0]) + printArg(R, a[1], sigType(s.slice(4))) + b.s.slice(a[0]); return b; }]),
      { 'toString()': ['String', (b) => b.s], 'length()': ['int', (b) => b.s.length], 'charAt(int)': ['char', (b, a, R) => { sidx(R, b.s, a[0]); return b.s.charCodeAt(a[0]); }],
        'reverse()': ['StringBuilder', (b) => { b.s = Array.from(b.s).reverse().join(''); return b; }], 'deleteCharAt(int)': ['StringBuilder', (b, a, R) => { sidx(R, b.s, a[0]); b.s = b.s.slice(0, a[0]) + b.s.slice(a[0] + 1); return b; }],
        'delete(int,int)': ['StringBuilder', (b, a, R) => { srange(R, a[0], Math.min(a[1], b.s.length), b.s.length); b.s = b.s.slice(0, a[0]) + b.s.slice(Math.min(a[1], b.s.length)); return b; }],
        'setCharAt(int,char)': ['void', (b, a, R) => { sidx(R, b.s, a[0]); b.s = b.s.slice(0, a[0]) + String.fromCharCode(a[1]) + b.s.slice(a[0] + 1); }],
        'setLength(int)': ['void', (b, a, R) => { if (a[0] < 0) throwJ(R, 'StringIndexOutOfBoundsException', 'String index out of range: ' + a[0]); b.s = a[0] <= b.s.length ? b.s.slice(0, a[0]) : b.s + '\0'.repeat(a[0] - b.s.length); }],
        'indexOf(String)': ['int', (b, a, R) => b.s.indexOf(nn(R, a[0]))], 'lastIndexOf(String)': ['int', (b, a, R) => b.s.lastIndexOf(nn(R, a[0]))], 'indexOf(String,int)': ['int', (b, a, R) => b.s.indexOf(nn(R, a[0]), Math.max(0, a[1]))], 'lastIndexOf(String,int)': ['int', (b, a, R) => (a[1] < 0 ? -1 : b.s.lastIndexOf(nn(R, a[0]), a[1]))], 'replace(int,int,String)': ['StringBuilder', (b, a, R) => { srange(R, a[0], Math.min(a[1], b.s.length), b.s.length); b.s = b.s.slice(0, a[0]) + nn(R, a[2]) + b.s.slice(Math.min(a[1], b.s.length)); return b; }],
        'substring(int)': ['String', (b, a, R) => substrJ(R, b.s, a[0], b.s.length)], 'substring(int,int)': ['String', (b, a, R) => substrJ(R, b.s, a[0], a[1])], 'isEmpty()': ['boolean', (b) => b.s.length === 0], 'capacity()': ['int', (b) => b.s.length + 16], 'compareTo(StringBuilder)': ['int', (b, a, R) => strCompare(b.s, nn(R, a[0]).s)] }) });
  // collections
  const LIST_METHODS = {
    'add(E)': ['boolean', (l, a, R) => { if (l.immutable) throwJ(R, 'UnsupportedOperationException', null); l.a.push(a[0]); return true; }],
    'add(int,E)': ['void', (l, a, R) => { if (l.immutable) throwJ(R, 'UnsupportedOperationException', null); if (a[0] < 0 || a[0] > l.a.length) throwJ(R, 'IndexOutOfBoundsException', 'Index: ' + a[0] + ', Size: ' + l.a.length); l.a.splice(a[0], 0, a[1]); }],
    'get(int)': ['E', (l, a, R) => l.a[lidx(R, l.a, a[0], l.kind === 'LinkedList')]], 'set(int,E)': ['E', (l, a, R) => { if (l.immutable) throwJ(R, 'UnsupportedOperationException', null); const i = lidx(R, l.a, a[0], l.kind === 'LinkedList'); const old = l.a[i]; l.a[i] = a[1]; return old; }],
    'remove(int)': ['E', (l, a, R) => { if (l.immutable) throwJ(R, 'UnsupportedOperationException', null); const i = lidx(R, l.a, a[0], l.kind === 'LinkedList'); return l.a.splice(i, 1)[0]; }],
    'remove(Object)': ['boolean', (l, a, R) => { if (l.immutable) throwJ(R, 'UnsupportedOperationException', null); const i = l.a.findIndex(x => jeq(x, a[0], R)); if (i < 0) return false; l.a.splice(i, 1); return true; }],
    'size()': ['int', (l) => l.a.length], 'isEmpty()': ['boolean', (l) => l.a.length === 0], 'contains(Object)': ['boolean', (l, a, R) => l.a.some(x => jeq(x, a[0], R))],
    'indexOf(Object)': ['int', (l, a, R) => l.a.findIndex(x => jeq(x, a[0], R))], 'lastIndexOf(Object)': ['int', (l, a, R) => { for (let i = l.a.length - 1; i >= 0; i--) if (jeq(l.a[i], a[0], R)) return i; return -1; }],
    'clear()': ['void', (l, a, R) => { if (l.immutable) throwJ(R, 'UnsupportedOperationException', null); l.a.length = 0; }], 'addAll(Collection<E>)': ['boolean', (l, a, R) => { if (l.immutable) throwJ(R, 'UnsupportedOperationException', null); const items = collItems(R, a[0]); l.a.push(...items); return items.length > 0; }],
    'removeAll(Collection<E>)': ['boolean', (l, a, R) => { const items = collItems(R, a[0]); const before = l.a.length; l.a = l.a.filter(x => !items.some(y => jeq(x, y, R))); return l.a.length !== before; }], 'containsAll(Collection<E>)': ['boolean', (l, a, R) => collItems(R, a[0]).every(y => l.a.some(x => jeq(x, y, R)))],
    'subList(int,int)': ['List<E>', (l, a, R) => { if (a[0] < 0) throwJ(R, 'IndexOutOfBoundsException', 'fromIndex = ' + a[0]); if (a[1] > l.a.length) throwJ(R, 'IndexOutOfBoundsException', 'toIndex = ' + a[1]); if (a[0] > a[1]) throwJ(R, 'IllegalArgumentException', 'fromIndex(' + a[0] + ') > toIndex(' + a[1] + ')'); return new JList(l.a.slice(a[0], a[1])); }],
    'toString()': ['String', (l, a, R) => dstr(l, R)], 'equals(Object)': ['boolean', (l, a, R) => jeq(l, a[0], R)], 'hashCode()': ['int', (l, a, R) => jhash(l, R)],
    'sort(Comparator<E>)': ['void', (l, a, R) => { if (l.immutable) throwJ(R, 'UnsupportedOperationException', null); l.a = sortJ(R, l.a, a[0]); }],
    'toArray()': ['Object[]', (l) => new JArr(T.Object, l.a.slice())], 'toArray(T[])': ['T[]', (l, a, R) => new JArr(nn(R, a[0]).et, l.a.slice())], 'iterator()': ['Iterator<E>', (l) => new JIter(l.a.slice(), l)], 'getFirst()': ['E', (l, a, R) => { if (!l.a.length) throwJ(R, 'NoSuchElementException', null); return l.a[0]; }], 'getLast()': ['E', (l, a, R) => { if (!l.a.length) throwJ(R, 'NoSuchElementException', null); return l.a[l.a.length - 1]; }],
    'removeFirst()': ['E', (l, a, R) => { if (!l.a.length) throwJ(R, 'NoSuchElementException', null); return l.a.shift(); }], 'removeLast()': ['E', (l, a, R) => { if (!l.a.length) throwJ(R, 'NoSuchElementException', null); return l.a.pop(); }], 'addFirst(E)': ['void', (l, a) => { l.a.unshift(a[0]); }], 'addLast(E)': ['void', (l, a) => { l.a.push(a[0]); }]
  };
  const SET_METHODS = {
    'add(E)': ['boolean', (s, a, R) => { if (s.m.find(a[0], R)) return false; s.m.put(a[0], true, R); return true; }], 'contains(Object)': ['boolean', (s, a, R) => !!s.m.find(a[0], R)], 'remove(Object)': ['boolean', (s, a, R) => s.m.remove(a[0], R) !== undefined],
    'size()': ['int', (s) => s.m.size], 'isEmpty()': ['boolean', (s) => s.m.size === 0], 'clear()': ['void', (s) => s.m.clear()], 'addAll(Collection<E>)': ['boolean', (s, a, R) => { let ch = false; for (const x of collItems(R, a[0])) if (!s.m.find(x, R)) { s.m.put(x, true, R); ch = true; } return ch; }],
    'removeAll(Collection<E>)': ['boolean', (s, a, R) => { let ch = false; for (const x of collItems(R, a[0])) if (s.m.remove(x, R) !== undefined) ch = true; return ch; }], 'retainAll(Collection<E>)': ['boolean', (s, a, R) => { const keep = collItems(R, a[0]); let ch = false; for (const e of s.m.entries(R).slice()) if (!keep.some(k => jeq(k, e.key, R))) { s.m.remove(e.key, R); ch = true; } return ch; }],
    'containsAll(Collection<E>)': ['boolean', (s, a, R) => collItems(R, a[0]).every(x => !!s.m.find(x, R))], 'toString()': ['String', (s, a, R) => dstr(s, R)], 'equals(Object)': ['boolean', (s, a, R) => jeq(s, a[0], R)], 'hashCode()': ['int', (s, a, R) => jhash(s, R)],
    'first()': ['E', (s, a, R) => { const e = s.m.entries(R); if (!e.length) throwJ(R, 'NoSuchElementException', null); return e[0].key; }], 'last()': ['E', (s, a, R) => { const e = s.m.entries(R); if (!e.length) throwJ(R, 'NoSuchElementException', null); return e[e.length - 1].key; }], 'toArray()': ['Object[]', (s, a, R) => new JArr(T.Object, s.m.entries(R).map(e => e.key))], 'iterator()': ['Iterator<E>', (s, a, R) => new JIter(collItems(R, s), s.ordered ? null : s)]
  };
  const entryOf = (e) => { const en = new JEntry(e.key, e.value); en.src = e; return en; };
  const MAP_METHODS = {
    'put(K,V)': ['V', (m, a, R) => { const old = m.put(a[0], a[1], R); return old === null ? null : old; }], 'get(Object)': ['V', (m, a, R) => { const e = m.find(a[0], R); return e ? e.value : null; }], 'getOrDefault(Object,V)': ['V', (m, a, R) => { const e = m.find(a[0], R); return e ? e.value : a[1]; }],
    'containsKey(Object)': ['boolean', (m, a, R) => !!m.find(a[0], R)], 'containsValue(Object)': ['boolean', (m, a, R) => m.entries(R).some(e => jeq(e.value, a[0], R))], 'remove(Object)': ['V', (m, a, R) => { const v = m.remove(a[0], R); return v === undefined ? null : v; }],
    'size()': ['int', (m) => m.size], 'isEmpty()': ['boolean', (m) => m.size === 0], 'clear()': ['void', (m) => m.clear()], 'putIfAbsent(K,V)': ['V', (m, a, R) => { const e = m.find(a[0], R); if (e && e.value !== null) return e.value; m.put(a[0], a[1], R); return null; }],
    'putAll(Map<K,V>)': ['void', (m, a, R) => { for (const e of nn(R, a[0]).entries(R)) m.put(e.key, e.value, R); }],
    'keySet()': ['Set<K>', (m, a, R) => { const s = new JSet(m.sorted); for (const e of m.entries(R)) s.m.put(e.key, true, R); return s; }], 'values()': ['Collection<V>', (m, a, R) => new JList(m.entries(R).map(e => e.value))],
    'entrySet()': ['Set<Entry<K,V>>', (m, a, R) => { const s = new JSet(false); s.ordered = m.entries(R).map(entryOf); for (const e of s.ordered) s.m.put(e, true, R); return s; }],
    'toString()': ['String', (m, a, R) => dstr(m, R)], 'equals(Object)': ['boolean', (m, a, R) => jeq(m, a[0], R)], 'hashCode()': ['int', (m, a, R) => jhash(m, R)],
    'firstKey()': ['K', (m, a, R) => { const e = m.entries(R); if (!e.length) throwJ(R, 'NoSuchElementException', null); return e[0].key; }], 'lastKey()': ['K', (m, a, R) => { const e = m.entries(R); if (!e.length) throwJ(R, 'NoSuchElementException', null); return e[e.length - 1].key; }],
    'floorKey(K)': ['K', (m, a, R) => { let r = null; for (const e of m.entries(R)) if (m.cmp(e.key, a[0], R) <= 0) r = e.key; return r; }], 'ceilingKey(K)': ['K', (m, a, R) => { for (const e of m.entries(R)) if (m.cmp(e.key, a[0], R) >= 0) return e.key; return null; }]
  };
  def('Collection', { isInterface: true, tparams: ['E'], impl: ['Iterable'], methods: { 'iterator()': ['Iterator<E>', (c, a, R) => new JIter(collItems(R, c), c instanceof JSet && c.ordered ? null : c)], 'size()': ['int', (c, a, R) => (c instanceof JList ? c.a.length : c instanceof JSet ? c.m.size : 0)], 'isEmpty()': ['boolean', (c, a, R) => collItems(R, c).length === 0], 'contains(Object)': ['boolean', (c, a, R) => collItems(R, c).some(x => jeq(x, a[0], R))], 'add(E)': ['boolean', (c, a, R) => (c instanceof JList ? LIST_METHODS['add(E)'][1](c, a, R) : SET_METHODS['add(E)'][1](c, a, R))], 'remove(Object)': ['boolean', (c, a, R) => (c instanceof JList ? LIST_METHODS['remove(Object)'][1](c, a, R) : SET_METHODS['remove(Object)'][1](c, a, R))], 'clear()': ['void', (c, a, R) => (c instanceof JList ? c.a.length = 0 : c.m.clear())], 'toString()': ['String', (c, a, R) => dstr(c, R)], 'addAll(Collection<E>)': ['boolean', (c, a, R) => (c instanceof JList ? LIST_METHODS['addAll(Collection<E>)'][1](c, a, R) : SET_METHODS['addAll(Collection<E>)'][1](c, a, R))] } });
  def('List', { isInterface: true, tparams: ['E'], impl: ['Collection'], methods: LIST_METHODS, statics: { 'of(T...)': ['List<T>', (o, a) => { const l = new JList(a[0].a.slice()); l.immutable = true; return l; }], 'copyOf(Collection<T>)': ['List<T>', (o, a, R) => { const l = new JList(collItems(R, a[0])); l.immutable = true; return l; }] } });
  def('ArrayList', { tparams: ['E'], impl: ['List'], ctors: { '': () => new JList(), 'int': (o, a, R) => { if (a[0] < 0) throwJ(R, 'IllegalArgumentException', 'Illegal Capacity: ' + a[0]); return new JList(); }, 'Collection<E>': (o, a, R) => new JList(collItems(R, a[0])) }, methods: LIST_METHODS });
  
  // Queue and Deque have no index methods (q.get(0) and q.remove(1) by index do not compile; q.remove(x) removes the value x).
  // An ArrayDeque refuses null (NullPointerException); a LinkedList, which is also a List, accepts it.
  const noNull = (R, l, x) => { if (x === null && l.kind === 'ArrayDeque') throwJ(R, 'NullPointerException', null); return x; };
  const emptyQ = (R, l) => { if (!l.a.length) throwJ(R, 'NoSuchElementException', null); };
  const QUEUE_METHODS = {
    'add(E)': ['boolean', (l, a, R) => { l.a.push(noNull(R, l, a[0])); return true; }], 'offer(E)': ['boolean', (l, a, R) => { l.a.push(noNull(R, l, a[0])); return true; }],
    'remove()': ['E', (l, a, R) => { emptyQ(R, l); return l.a.shift(); }], 'remove(Object)': LIST_METHODS['remove(Object)'],
    'poll()': ['E', (l) => (l.a.length ? l.a.shift() : null)], 'element()': ['E', (l, a, R) => { emptyQ(R, l); return l.a[0]; }], 'peek()': ['E', (l) => (l.a.length ? l.a[0] : null)],
    'size()': LIST_METHODS['size()'], 'isEmpty()': LIST_METHODS['isEmpty()'], 'contains(Object)': LIST_METHODS['contains(Object)'], 'clear()': LIST_METHODS['clear()'],
    'addAll(Collection<E>)': ['boolean', (l, a, R) => { const items = collItems(R, a[0]); for (const x of items) l.a.push(noNull(R, l, x)); return items.length > 0; }],
    'removeAll(Collection<E>)': LIST_METHODS['removeAll(Collection<E>)'], 'containsAll(Collection<E>)': LIST_METHODS['containsAll(Collection<E>)'],
    'toString()': LIST_METHODS['toString()'], 'toArray()': LIST_METHODS['toArray()'], 'iterator()': ['Iterator<E>', (l) => new JIter(l.a.slice(), l)]
  };
  const DEQUE_METHODS = Object.assign({}, QUEUE_METHODS, {
    'push(E)': ['void', (l, a, R) => { l.a.unshift(noNull(R, l, a[0])); }], 'pop()': ['E', (l, a, R) => { emptyQ(R, l); return l.a.shift(); }],
    'addFirst(E)': ['void', (l, a, R) => { l.a.unshift(noNull(R, l, a[0])); }], 'addLast(E)': ['void', (l, a, R) => { l.a.push(noNull(R, l, a[0])); }],
    'offerFirst(E)': ['boolean', (l, a, R) => { l.a.unshift(noNull(R, l, a[0])); return true; }], 'offerLast(E)': ['boolean', (l, a, R) => { l.a.push(noNull(R, l, a[0])); return true; }],
    'getFirst()': LIST_METHODS['getFirst()'], 'getLast()': LIST_METHODS['getLast()'], 'removeFirst()': LIST_METHODS['removeFirst()'], 'removeLast()': LIST_METHODS['removeLast()'],
    'peekFirst()': ['E', (l) => (l.a.length ? l.a[0] : null)], 'peekLast()': ['E', (l) => (l.a.length ? l.a[l.a.length - 1] : null)],
    'pollFirst()': ['E', (l) => (l.a.length ? l.a.shift() : null)], 'pollLast()': ['E', (l) => (l.a.length ? l.a.pop() : null)],
    'removeFirstOccurrence(Object)': LIST_METHODS['remove(Object)'], 'descendingIterator()': ['Iterator<E>', (l) => new JIter(l.a.slice().reverse(), l, true)]
  });
  def('Queue', { isInterface: true, tparams: ['E'], impl: ['Collection'], methods: QUEUE_METHODS });
  def('Deque', { isInterface: true, tparams: ['E'], impl: ['Queue'], methods: DEQUE_METHODS });
  const mkDeque = (items) => { const l = new JList(items); l.kind = 'ArrayDeque'; return l; };
  def('ArrayDeque', { tparams: ['E'], impl: ['Deque'], ctors: { '': () => mkDeque(), 'int': () => mkDeque(), 'Collection<E>': (o, a, R) => { const items = collItems(R, a[0]); const l = mkDeque(); for (const x of items) l.a.push(noNull(R, l, x)); return l; } }, methods: DEQUE_METHODS });
  const mkLinked = (items) => { const l = new JList(items); l.kind = 'LinkedList'; return l; };
  def('LinkedList', { tparams: ['E'], impl: ['List', 'Deque'], ctors: { '': () => mkLinked(), 'Collection<E>': (o, a, R) => mkLinked(collItems(R, a[0])) }, methods: Object.assign({}, DEQUE_METHODS, LIST_METHODS, { 'remove()': DEQUE_METHODS['remove()'] }) });
  def('Set', { isInterface: true, tparams: ['E'], impl: ['Collection'], methods: SET_METHODS, statics: { 'of(T...)': ['Set<T>', (o, a, R) => { const s = new JSet(false); for (const x of a[0].a) { if (s.m.find(x, R)) throwJ(R, 'IllegalArgumentException', 'duplicate element: ' + dstr(x, R)); s.m.put(x, true, R); } s.immutable = true; return s; }] } });
  def('HashSet', { tparams: ['E'], impl: ['Set'], ctors: { '': () => new JSet(false), 'int': () => new JSet(false), 'Collection<E>': (o, a, R) => { const s = new JSet(false); for (const x of collItems(R, a[0])) s.m.put(x, true, R); return s; } }, methods: SET_METHODS });
  // TreeSet and TreeMap navigation (headSet/headMap and the like return copies here, not live views)
  const keysOf = (m, R) => m.entries(R).map(e => e.key);
  const navFind = (m, x, R, test) => { for (const k of keysOf(m, R)) if (test(m.cmp(k, x, R))) return k; return null; };
  const navLast = (m, x, R, test) => { let r = null; for (const k of keysOf(m, R)) if (test(m.cmp(k, x, R))) r = k; return r; };
  const TREESET_METHODS = Object.assign({}, SET_METHODS, {
    'higher(E)': ['E', (s, a, R) => navFind(s.m, nn(R, a[0]), R, c => c > 0)], 'ceiling(E)': ['E', (s, a, R) => navFind(s.m, nn(R, a[0]), R, c => c >= 0)],
    'lower(E)': ['E', (s, a, R) => navLast(s.m, nn(R, a[0]), R, c => c < 0)], 'floor(E)': ['E', (s, a, R) => navLast(s.m, nn(R, a[0]), R, c => c <= 0)],
    'pollFirst()': ['E', (s, a, R) => { const k = keysOf(s.m, R); if (!k.length) return null; s.m.remove(k[0], R); return k[0]; }], 'pollLast()': ['E', (s, a, R) => { const k = keysOf(s.m, R); if (!k.length) return null; s.m.remove(k[k.length - 1], R); return k[k.length - 1]; }],
    'headSet(E)': ['TreeSet<E>', (s, a, R) => { const r = new JSet(true, s.m.cmpFn); for (const k of keysOf(s.m, R)) if (s.m.cmp(k, a[0], R) < 0) r.m.put(k, true, R); return r; }], 'tailSet(E)': ['TreeSet<E>', (s, a, R) => { const r = new JSet(true, s.m.cmpFn); for (const k of keysOf(s.m, R)) if (s.m.cmp(k, a[0], R) >= 0) r.m.put(k, true, R); return r; }]
  });
  def('TreeSet', { tparams: ['E'], impl: ['Set'], ctors: { '': () => new JSet(true), 'Comparator<E>': (o, a, R) => new JSet(true, a[0] === null ? null : cmpWith(R, a[0])), 'Collection<E>': (o, a, R) => { const s = new JSet(true); for (const x of collItems(R, a[0])) s.m.put(x, true, R); return s; } }, methods: TREESET_METHODS });
  def('Entry', { isInterface: true, tparams: ['K', 'V'], methods: { 'getKey()': ['K', (e) => e.key], 'getValue()': ['V', (e) => e.value], 'setValue(V)': ['V', (e, a) => { const old = e.value; e.value = a[0]; if (e.src) e.src.value = a[0]; return old; }], 'toString()': ['String', (e, a, R) => dstr(e, R)], 'equals(Object)': ['boolean', (e, a, R) => jeq(e, a[0], R)], 'hashCode()': ['int', (e, a, R) => jhash(e, R)] } });
  def('Map', { isInterface: true, tparams: ['K', 'V'], methods: MAP_METHODS, statics: { 'of()': ['Map<K,V>', () => { const m = new JMap(false); m.immutable = true; return m; }], 'entry(K,V)': ['Entry<K,V>', (o, a) => new JEntry(a[0], a[1])] } });
  def('HashMap', { tparams: ['K', 'V'], impl: ['Map'], ctors: { '': () => new JMap(false), 'int': () => new JMap(false), 'Map<K,V>': (o, a, R) => { const m = new JMap(false); for (const e of nn(R, a[0]).entries(R)) m.put(e.key, e.value, R); return m; } }, methods: MAP_METHODS });
  const subMap = (m, R, test) => { const r = new JMap(true, m.cmpFn); for (const e of m.entries(R)) if (test(e.key)) r.put(e.key, e.value, R); return r; };
  const TREEMAP_METHODS = Object.assign({}, MAP_METHODS, {
    'firstEntry()': ['Entry<K,V>', (m, a, R) => { const e = m.entries(R); return e.length ? new JEntry(e[0].key, e[0].value) : null; }], 'lastEntry()': ['Entry<K,V>', (m, a, R) => { const e = m.entries(R); return e.length ? new JEntry(e[e.length - 1].key, e[e.length - 1].value) : null; }],
    'higherKey(K)': ['K', (m, a, R) => navFind(m, nn(R, a[0]), R, c => c > 0)], 'lowerKey(K)': ['K', (m, a, R) => navLast(m, nn(R, a[0]), R, c => c < 0)],
    'pollFirstEntry()': ['Entry<K,V>', (m, a, R) => { const e = m.entries(R); if (!e.length) return null; const r = new JEntry(e[0].key, e[0].value); m.remove(e[0].key, R); return r; }],
    'headMap(K)': ['TreeMap<K,V>', (m, a, R) => subMap(m, R, k => m.cmp(k, a[0], R) < 0)], 'tailMap(K)': ['TreeMap<K,V>', (m, a, R) => subMap(m, R, k => m.cmp(k, a[0], R) >= 0)]
  });
  def('TreeMap', { tparams: ['K', 'V'], impl: ['Map'], ctors: { '': () => new JMap(true), 'Comparator<K>': (o, a, R) => new JMap(true, a[0] === null ? null : cmpWith(R, a[0])), 'Map<K,V>': (o, a, R) => { const m = new JMap(true); for (const e of nn(R, a[0]).entries(R)) m.put(e.key, e.value, R); return m; } }, methods: TREEMAP_METHODS });
  def('Iterator', { isInterface: true, tparams: ['E'], methods: { 'hasNext()': ['boolean', (it) => it.i < it.items.length], 'next()': ['E', (it, a, R) => { if (it.i >= it.items.length) throwJ(R, 'NoSuchElementException', null); it.last = it.i; return it.items[it.i++]; }],
    'remove()': ['void', (it, a, R) => {
      if (it.last < 0 || !it.src) throwJ(R, 'IllegalStateException', null);
      const src = it.src, x = it.items[it.last];
      if (src instanceof JList) { if (src.immutable) throwJ(R, 'UnsupportedOperationException', null); const n0 = it.items.length; src.a.splice(it.desc ? n0 - 1 - it.last : it.last - (it.removed || 0), 1); it.removed = (it.removed || 0) + 1; }
      else if (src instanceof JSet) src.m.remove(x, R);
      it.last = -1;
    }] } });
  const rangeCheck = (R, len, from, to) => { if (from > to) throwJ(R, 'IllegalArgumentException', 'fromIndex(' + from + ') > toIndex(' + to + ')'); if (from < 0) throwJ(R, 'ArrayIndexOutOfBoundsException', 'Array index out of range: ' + from); if (to > len) throwJ(R, 'ArrayIndexOutOfBoundsException', 'Array index out of range: ' + to); };   // Arrays.sort/fill(a, from, to, ...)
  const arrOvl = (name, mk, types) => Object.assign({}, ...(types || ['int', 'long', 'double', 'float', 'char', 'boolean', 'byte', 'short', 'Object']).map(t => mk(t)));
  def('Arrays', { noNew: true, statics: Object.assign(
    arrOvl('toString', (t) => ({ ['toString(' + t + '[])']: ['String', (o, a, R) => (a[0] === null ? 'null' : '[' + a[0].a.map(x => jstr(x, a[0].et, R)).join(', ') + ']')] })),
    arrOvl('sort', (t) => ({ ['sort(' + t + '[])']: ['void', (o, a, R) => { nn(R, a[0]); a[0].a = sortJ(R, a[0].a); }], ['sort(' + t + '[],int,int)']: ['void', (o, a, R) => { nn(R, a[0]); rangeCheck(R, a[0].a.length, a[1], a[2]); const part = sortJ(R, a[0].a.slice(a[1], a[2])); a[0].a.splice(a[1], part.length, ...part); }] }), ['int', 'long', 'double', 'char', 'Object']),
    arrOvl('fill', (t) => ({ ['fill(' + t + '[],' + t + ')']: ['void', (o, a, R) => { nn(R, a[0]); a[0].a.fill(a[1]); }], ['fill(' + t + '[],int,int,' + t + ')']: ['void', (o, a, R) => { nn(R, a[0]); rangeCheck(R, a[0].a.length, a[1], a[2]); a[0].a.fill(a[3], a[1], a[2]); }] })),
    arrOvl('equals', (t) => ({ ['equals(' + t + '[],' + t + '[])']: ['boolean', (o, a, R) => (a[0] === a[1]) || (a[0] !== null && a[1] !== null && a[0].a.length === a[1].a.length && a[0].a.every((x, i) => jeq(x, a[1].a[i], R)))] })),
    arrOvl('copyOf', (t) => ({ ['copyOf(' + t + '[],int)']: [t + '[]', (o, a, R) => { nn(R, a[0]); if (a[1] < 0) throwJ(R, 'NegativeArraySizeException', String(a[1])); const r = a[0].a.slice(0, a[1]); while (r.length < a[1]) r.push(defaultValue(a[0].et)); return new JArr(a[0].et, r); }], ['copyOfRange(' + t + '[],int,int)']: [t + '[]', (o, a, R) => { nn(R, a[0]); if (a[1] > a[2]) throwJ(R, 'IllegalArgumentException', a[1] + ' > ' + a[2]); if (a[1] < 0) throwJ(R, 'ArrayIndexOutOfBoundsException', 'arraycopy: source index ' + a[1] + ' out of bounds for ' + (isPrim(a[0].et) ? typeStr(a[0].et) : 'object array') + '[' + a[0].a.length + ']'); if (a[1] > a[0].a.length) throwJ(R, 'ArrayIndexOutOfBoundsException', 'arraycopy: length ' + (a[0].a.length - a[1]) + ' is negative'); const r = a[0].a.slice(a[1], a[2]); while (r.length < a[2] - a[1]) r.push(defaultValue(a[0].et)); return new JArr(a[0].et, r); }] })),
    arrOvl('binarySearch', (t) => ({ ['binarySearch(' + t + '[],' + t + ')']: ['int', (o, a, R) => { nn(R, a[0]); let lo = 0, hi = a[0].a.length - 1; while (lo <= hi) { const mid = (lo + hi) >>> 1; const c = jcmp(a[0].a[mid], a[1], R); if (c < 0) lo = mid + 1; else if (c > 0) hi = mid - 1; else return mid; } return -(lo + 1); }] }), ['int', 'long', 'double', 'char', 'Object']),
    { 'sort(T[],Comparator<T>)': ['void', (o, a, R) => { nn(R, a[0]); a[0].a = sortJ(R, a[0].a, a[1]); }], 'sort(T[],int,int,Comparator<T>)': ['void', (o, a, R) => { nn(R, a[0]); rangeCheck(R, a[0].a.length, a[1], a[2]); const part = sortJ(R, a[0].a.slice(a[1], a[2]), a[3]); a[0].a.splice(a[1], part.length, ...part); }],
      'asList(T...)': ['List<T>', (o, a) => new JList(a[0].a.slice())], 'deepToString(Object[])': ['String', (o, a, R) => { const f = (x) => (x instanceof JArr ? '[' + x.a.map(f).join(', ') + ']' : dstr(x, R)); return a[0] === null ? 'null' : f(a[0]); }], 'stream(int[])': ['Object', (o, a, R) => throwJ(R, 'UnsupportedOperationException', 'streams are not supported by this interpreter')] }) });
  def('Objects', { noNew: true, statics: {
    'equals(Object,Object)': ['boolean', (o, a, R) => jeq(a[0], a[1], R)], 'hash(Object...)': ['int', (o, a, R) => { let h = 1; for (const x of a[0].a) h = (Math.imul(31, h) + (x === null ? 0 : jhash(x, R))) | 0; return h; }],
    'hashCode(Object)': ['int', (o, a, R) => (a[0] === null ? 0 : jhash(a[0], R))], 'toString(Object)': ['String', (o, a, R) => dstr(a[0], R)], 'toString(Object,String)': ['String', (o, a, R) => (a[0] === null ? a[1] : dstr(a[0], R))],
    'isNull(Object)': ['boolean', (o, a) => a[0] === null], 'nonNull(Object)': ['boolean', (o, a) => a[0] !== null],
    'requireNonNull(T)': ['T', (o, a, R) => { if (a[0] === null) throwJ(R, 'NullPointerException', null); return a[0]; }], 'requireNonNull(T,String)': ['T', (o, a, R) => { if (a[0] === null) throwJ(R, 'NullPointerException', a[1]); return a[0]; }],
    'requireNonNullElse(T,T)': ['T', (o, a, R) => { if (a[0] !== null) return a[0]; if (a[1] === null) throwJ(R, 'NullPointerException', 'defaultObj'); return a[1]; }]
  } });
  def('Collections', { noNew: true, statics: {
    'sort(List<T>)': ['void', (o, a, R) => { nn(R, a[0]); a[0].a = sortJ(R, a[0].a); }], 'sort(List<T>,Comparator<T>)': ['void', (o, a, R) => { nn(R, a[0]); a[0].a = sortJ(R, a[0].a, a[1]); }],
    'reverseOrder()': ['Comparator<T>', () => new JCmp(null, true)], 'reverseOrder(Comparator<T>)': ['Comparator<T>', (o, a) => new JCmp(a[0], true)],
    'max(Collection<T>,Comparator<T>)': ['T', (o, a, R) => { const it = collItems(R, a[0]); if (!it.length) throwJ(R, 'NoSuchElementException', null); const f = cmpWith(R, a[1]); return it.reduce((m, x) => (f(x, m) > 0 ? x : m)); }], 'min(Collection<T>,Comparator<T>)': ['T', (o, a, R) => { const it = collItems(R, a[0]); if (!it.length) throwJ(R, 'NoSuchElementException', null); const f = cmpWith(R, a[1]); return it.reduce((m, x) => (f(x, m) < 0 ? x : m)); }], 'reverse(List<T>)': ['void', (o, a, R) => { nn(R, a[0]).a.reverse(); }],
    'shuffle(List<T>)': ['void', (o, a, R) => { const l = nn(R, a[0]).a; for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; } }], 'shuffle(List<T>,Random)': ['void', (o, a, R) => { const l = nn(R, a[0]).a; for (let i = l.length; i > 1; i--) { const j = a[1].nextIntBound(i, R); [l[i - 1], l[j]] = [l[j], l[i - 1]]; } }],
    'max(Collection<T>)': ['T', (o, a, R) => { const it = collItems(R, a[0]); if (!it.length) throwJ(R, 'NoSuchElementException', null); return it.reduce((m, x) => (jcmp(x, m, R) > 0 ? x : m)); }], 'min(Collection<T>)': ['T', (o, a, R) => { const it = collItems(R, a[0]); if (!it.length) throwJ(R, 'NoSuchElementException', null); return it.reduce((m, x) => (jcmp(x, m, R) < 0 ? x : m)); }],
    'swap(List<T>,int,int)': ['void', (o, a, R) => { const l = nn(R, a[0]).a; lidx(R, l, a[1]); lidx(R, l, a[2]); [l[a[1]], l[a[2]]] = [l[a[2]], l[a[1]]]; }], 'frequency(Collection<T>,Object)': ['int', (o, a, R) => collItems(R, a[0]).filter(x => jeq(x, a[1], R)).length],
    'nCopies(int,T)': ['List<T>', (o, a, R) => { if (a[0] < 0) throwJ(R, 'IllegalArgumentException', 'List length = ' + a[0]); const l = new JList(new Array(a[0]).fill(a[1])); l.immutable = true; return l; }], 'unmodifiableList(List<T>)': ['List<T>', (o, a, R) => { const l = new JList(nn(R, a[0]).a); l.immutable = true; return l; }], 'emptyList()': ['List<T>', () => { const l = new JList(); l.immutable = true; return l; }]
  } });
  def('PrintStream', { noNew: true, methods: Object.assign(
    ovl('println', PRINT_TYPES, (t) => ['void', (ps, a, R) => R.print(printArg(R, a[0], t) + '\n')]), ovl('print', PRINT_TYPES, (t) => ['void', (ps, a, R) => R.print(printArg(R, a[0], t))]),
    { 'println()': ['void', (ps, a, R) => R.print('\n')], 'printf(String,Object...)': ['PrintStream', (ps, a, R) => { R.print(jformat(nn(R, a[0]), a[1].a, R)); return ps; }], 'format(String,Object...)': ['PrintStream', (ps, a, R) => { R.print(jformat(nn(R, a[0]), a[1].a, R)); return ps; }], 'flush()': ['void', () => { }], 'write(int)': ['void', (ps, a, R) => R.print(String.fromCharCode(a[0] & 255))] }) });
  def('InputStream', { noNew: true, methods: {} });
  def('System', { noNew: true, fields: { out: ['PrintStream', SYSOUT], err: ['PrintStream', SYSERR], in: ['InputStream', SYSIN] }, statics: {
    'currentTimeMillis()': ['long', () => BigInt(Date.now())], 'nanoTime()': ['long', () => BigInt(Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) * 1e6))], 'exit(int)': ['void', (o, a) => { throw new SystemExit(a[0]); }], 'lineSeparator()': ['String', () => '\n'],
    'arraycopy(Object,int,Object,int,int)': ['void', (o, a, R) => { const [src, sp, dst, dp, n] = a; nn(R, src); nn(R, dst); if (!(src instanceof JArr) || !(dst instanceof JArr)) throwJ(R, 'ArrayStoreException', 'arraycopy: ' + (src instanceof JArr ? 'destination' : 'source') + ' type ' + qualified(runtimeClassName(src instanceof JArr ? dst : src)) + ' is not an array'); if (sp < 0 || dp < 0 || n < 0 || sp + n > src.a.length || dp + n > dst.a.length) throwJ(R, 'ArrayIndexOutOfBoundsException', 'arraycopy: last ' + (sp + n > src.a.length ? 'source' : 'destination') + ' index ' + (sp + n > src.a.length ? sp + n : dp + n) + ' out of bounds for length ' + (sp + n > src.a.length ? src.a.length : dst.a.length)); const tmp = src.a.slice(sp, sp + n); for (let i = 0; i < n; i++) dst.a[dp + i] = tmp[i]; }],
    'getProperty(String)': ['String', (o, a) => ({ 'line.separator': '\n', 'java.version': '21', 'user.name': 'student', 'os.name': 'Browser' }[a[0]] || null)], 'identityHashCode(Object)': ['int', (o, a) => (a[0] && a[0].id ? idHash(a[0].id) | 0 : 0)]
  } });
  def('Scanner', { ctors: { 'InputStream': (o, a, R) => { if (a[0] !== SYSIN) throwJ(R, 'IllegalArgumentException', 'only System.in can be scanned here'); return new JScanner(R.stdin, R.more); }, 'String': (o, a, R) => new JScanner(nn(R, a[0])) }, methods: {
    'nextInt()': ['int', (s, a, R) => s.typed(R, INT_RE, toInt)], 'nextLong()': ['long', (s, a, R) => s.typed(R, INT_RE, toLong)], 'nextDouble()': ['double', (s, a, R) => s.typed(R, DBL_RE, toDbl)], 'nextFloat()': ['float', (s, a, R) => Math.fround(s.typed(R, DBL_RE, toDbl))],
    'nextBoolean()': ['boolean', (s, a, R) => s.typed(R, BOOL_RE, (t) => t.toLowerCase() === 'true')], 'next()': ['String', (s, a, R) => s.next(R)], 'nextLine()': ['String', (s, a, R) => s.nextLine(R)],
    'hasNext()': ['boolean', (s) => !!s.peekToken()], 'hasNextInt()': ['boolean', (s) => s.hasTyped(INT_RE, toInt)], 'hasNextLong()': ['boolean', (s) => s.hasTyped(INT_RE, toLong)], 'hasNextDouble()': ['boolean', (s) => s.hasTyped(DBL_RE, toDbl)], 'hasNextBoolean()': ['boolean', (s) => s.hasTyped(BOOL_RE, () => true)], 'hasNextLine()': ['boolean', (s) => s.hasLine()],
    'close()': ['void', (s) => { s.closed = true; }], 'nextShort()': ['short', (s, a, R) => s.typed(R, INT_RE, (t) => { const v = toInt(t); return v === null || v < -32768 || v > 32767 ? null : v; })], 'nextByte()': ['byte', (s, a, R) => s.typed(R, INT_RE, (t) => { const v = toInt(t); return v === null || v < -128 || v > 127 ? null : v; })]
  } });
  def('Random', { ctors: { '': () => new JRandom(), 'long': (o, a) => new JRandom(a[0]) }, methods: {
    'nextInt()': ['int', (r) => r.nextInt()], 'nextInt(int)': ['int', (r, a, R) => r.nextIntBound(a[0], R)], 'nextInt(int,int)': ['int', (r, a, R) => r.nextIntRange(a[0], a[1], R)], 'nextDouble()': ['double', (r) => r.nextDouble()], 'nextBoolean()': ['boolean', (r) => r.nextBoolean()],
    'nextLong()': ['long', (r) => r.nextLong()], 'nextFloat()': ['float', (r) => r.nextFloat()], 'nextGaussian()': ['double', (r) => r.nextGaussian()], 'setSeed(long)': ['void', (r, a) => { r.seed = (a[0] ^ MULT) & MASK48; r.haveNextGaussian = false; }]
  } });
  // exceptions: real classes (a program may extend them), with a message and a cause
  const excMethods = { 'getMessage()': ['String', (o) => o.f.message], 'getLocalizedMessage()': ['String', (o) => o.f.message], 'getCause()': ['Throwable', (o) => o.f.cause], 'toString()': ['String', (o, a, R) => dstr(o, R)], 'printStackTrace()': ['void', (o, a, R) => R.print(traceText(R, o) + '\n')], 'getStackTrace()': ['Object[]', (o) => new JArr(T.Object, [])], 'initCause(Throwable)': ['Throwable', (o, a) => { o.f.cause = a[0]; return o; }] };
  const defExc = (name, ext) => { def(name, { ext, objClass: true, ctors: exceptionCtors, methods: name === 'Throwable' ? excMethods : {} }); NATIVE[name].objClass = true; };
  defExc('Throwable', 'Object'); defExc('Exception', 'Throwable'); defExc('Error', 'Throwable'); defExc('RuntimeException', 'Exception');
  for (const n of ['ArithmeticException', 'IllegalArgumentException', 'IllegalStateException', 'IndexOutOfBoundsException', 'NullPointerException', 'ClassCastException', 'NegativeArraySizeException', 'UnsupportedOperationException', 'ArrayStoreException', 'NoSuchElementException', 'ConcurrentModificationException', 'UncheckedIOException']) defExc(n, 'RuntimeException');
  defExc('NumberFormatException', 'IllegalArgumentException'); defExc('IllegalFormatException', 'IllegalArgumentException'); defExc('PatternSyntaxException', 'IllegalArgumentException');
  for (const n of ['IllegalFormatConversionException', 'MissingFormatArgumentException', 'UnknownFormatConversionException']) defExc(n, 'IllegalFormatException');
  defExc('ArrayIndexOutOfBoundsException', 'IndexOutOfBoundsException'); defExc('StringIndexOutOfBoundsException', 'IndexOutOfBoundsException'); defExc('InputMismatchException', 'NoSuchElementException');
  defExc('StackOverflowError', 'Error'); defExc('OutOfMemoryError', 'Error'); defExc('IOException', 'Exception'); defExc('FileNotFoundException', 'IOException'); defExc('InterruptedException', 'Exception'); defExc('CloneNotSupportedException', 'Exception');
  LIB_PKG.PatternSyntaxException = 'java.util.regex'; LIB_PKG.Class = 'java.lang';
  function defaultValue(t) { if (t.k !== 'prim') return null; return t.n === 'boolean' ? false : t.n === 'long' ? 0n : 0; }

  /* ======================================================================================================================== checker */
  // Resolves every name, gives every expression its static type, picks overloads, inserts the conversions Java applies (widening,
  // boxing), and reports the errors javac reports, with javac's words where that helps a student look them up.
  function Checker(unit) {
    const classes = Object.create(null);   // user classes by name
    const err = (line, msg) => { throw new CompileError(line, msg); };
    const classOf = (name) => classes[name] || NATIVE[name] || null;
    const needClass = (name, line) => { const c = classOf(name); if (!c) err(line, 'cannot find symbol\n  symbol:   class ' + name); return c; };
    const parentOf = (c) => (c.ext ? classOf(c.ext) : null);
    function isSubclass(from, to) {
      if (from === to || to === 'Object') return true;
      const seen = new Set();
      const walk = (n) => { if (!n || seen.has(n)) return false; seen.add(n); if (n === to) return true; const c = classOf(n); if (!c) return false; if (walk(c.ext)) return true; for (const i of c.impl) if (walk(i)) return true; return false; };
      return walk(from);
    }
    function subst(t, env) {
      if (!t) return t;
      if (t.k === 'tvar') return (env && env[t.n]) || T.Object;
      if (t.k === 'array') { const r = arr(subst(t.e, env)); if (t.varargs) r.varargs = true; return r; }
      if (t.k === 'class' && t.args.length) return cls(t.n, t.args.map(a => subst(a, env)));
      return t;
    }
    const fits = (v, to) => (to.n === 'byte' ? v >= -128 && v <= 127 : to.n === 'short' ? v >= -32768 && v <= 32767 : to.n === 'char' ? v >= 0 && v <= 65535 : true);
    // assignment conversion (JLS 5.2); strict = no boxing (overload phase 1)
    function assignable(from, to, strict, constNode) {
      if (!from || !to) return false;
      if (to.k === 'any' || from.k === 'any' || to.k === 'tvar') return true;
      if (same(from, to)) return true;
      if (from.k === 'null') return isRef(to);
      if (from.k === 'void' || to.k === 'void') return false;
      if (from.k === 'prim' && to.k === 'prim') { if (widens(from, to)) return true; return !!(constNode && constNode.const !== undefined && typeof constNode.const === 'number' && ['int', 'char', 'short', 'byte'].includes(from.n) && ['byte', 'short', 'char'].includes(to.n) && fits(constNode.const, to)); }
      if (from.k === 'prim' && to.k === 'class') { if (strict) return false; if (UNBOX[to.n] && constNode && constNode.const !== undefined && typeof constNode.const === 'number' && ['Byte', 'Short', 'Character'].includes(to.n) && fits(constNode.const, prim(UNBOX[to.n]))) return true; return isSubclass(BOX[from.n], to.n); }
      if (from.k === 'class' && to.k === 'prim') { if (strict) return false; const u = UNBOX[from.n]; return !!u && widens(prim(u), to); }
      if (from.k === 'class' && to.k === 'class') {
        if (!isSubclass(from.n, to.n)) return false;
        if (from.args.length && to.args.length && from.args.length === to.args.length) return from.args.every((a, i) => to.args[i].k === 'tvar' || to.args[i].k === 'any' || same(a, to.args[i]) || (to.args[i].n === 'Object' && to.args[i].wild));
        return true;
      }
      if (from.k === 'array' && to.k === 'array') { if (isPrim(from.e) || isPrim(to.e)) return same(from.e, to.e); return assignable(from.e, to.e, true); }
      if (from.k === 'array' && to.k === 'class') return to.n === 'Object' || to.n === 'Cloneable';
      return false;
    }
    function lub(a, b) {   // List.of(new Dog(), new Cat()) is a List<Animal>; List.of(1, 2.5) a List<Number>; List.of(1, "a") a List<Object>
      if (a.k !== 'class' || b.k !== 'class') return T.Object;
      for (let c = classOf(a.n), seen = 0; c && seen < 50; c = c.ext ? classOf(c.ext) : null, seen++) { const t = cls(c.name); if (assignable(a, t, false) && assignable(b, t, false)) return t; }
      return T.Object;
    }
    function bind(param, argT, env) {   // infer method type variables from an argument
      if (!param || !argT) return;
      if (param.k === 'tvar') { if (argT.k === 'null') return; const b = boxed(argT); if (!(param.n in env)) env[param.n] = b; else if (!(env.$fixed && env.$fixed.has(param.n)) && !assignable(b, env[param.n], false)) env[param.n] = lub(env[param.n], b); return; }   // widen only a variable this call is inferring
      if (param.k === 'array' && argT.k === 'array') return bind(param.e, argT.e, env);
      if (param.k === 'class' && argT.k === 'class' && param.args.length && argT.args.length === param.args.length) param.args.forEach((a, i) => bind(a, argT.args[i], env));
    }
    // choose among overloads (JLS 15.12.2, simplified): phase 1 without boxing, phase 2 with, phase 3 varargs
    // the library's Collection<E> and Map<K,V> parameters are really Collection<? extends E>: new ArrayList<Animal>(listOfDogs)
    const covariant = (from, to) => from.k === 'class' && to.k === 'class' && from.args.length > 0 && from.args.length === to.args.length && isSubclass(from.n, to.n) && from.args.every((a, i) => assignable(a, to.args[i], true));
    function applicable(m, argTypes, argNodes, env, phase) {
      const ps = m.params.map(p => subst(p, env));
      const last = ps[ps.length - 1];
      const ok = (from, to, strict) => assignable(from, to, strict, null) || (m.native && covariant(from, to));
      if (phase < 3) { if (ps.length !== argTypes.length) return null; for (let i = 0; i < ps.length; i++) if (!ok(argTypes[i], ps[i], phase === 1)) return null; return { ps, varargs: false }; }
      if (!last || !last.varargs || argTypes.length < ps.length - 1) return null;
      for (let i = 0; i < ps.length - 1; i++) if (!assignable(argTypes[i], ps[i], false, null)) return null;
      for (let i = ps.length - 1; i < argTypes.length; i++) if (!assignable(argTypes[i], last.e, false, null)) return null;
      return { ps, varargs: true };
    }
    function moreSpecific(a, b) { return a.ps.length === b.ps.length && a.ps.every((p, i) => assignable(p, b.ps[i], true)); }
    function pick(cands, argTypes, argNodes, env0) {
      const envFor = typeof env0 === 'function' ? env0 : () => env0;
      for (let phase = 1; phase <= 3; phase++) {
        const ok = [];
        for (const m of cands) { const env = Object.assign({}, envFor(m)); Object.defineProperty(env, '$fixed', { value: new Set(Object.keys(env)) }); m.params.forEach((p, i) => { if (i < argTypes.length) bind(p, argTypes[i], env); if (p.k === 'array' && p.varargs && i === m.params.length - 1) for (let j = i; j < argTypes.length; j++) bind(p.e, argTypes[j], env); }); const a = applicable(m, argTypes, argNodes, env, phase); if (a) ok.push({ m, ps: a.ps, varargs: a.varargs, env }); }
        if (ok.length === 1) return ok[0];
        if (ok.length > 1) { const best = ok.filter(x => ok.every(y => x === y || moreSpecific(x, y))); return best[0] || ok[0]; }
      }
      return null;
    }
    const sigStr = (m) => m.name + '(' + m.params.map(typeStr).join(',') + ')';
    function cannotApply(line, what, cands, argTypes) {
      const found = argTypes.length ? argTypes.map(typeStr).join(',') : 'no arguments';
      if (cands.length === 1) { const m = cands[0]; const req = m.params.length ? m.params.map(typeStr).join(',') : 'no arguments'; const reason = m.params.length !== argTypes.length ? 'actual and formal argument lists differ in length' : 'argument mismatch; ' + argTypes.map((a, i) => (assignable(a, subst(m.params[i], {}), false) ? null : typeStr(a) + ' cannot be converted to ' + typeStr(subst(m.params[i], {})))).filter(Boolean)[0]; err(line, what + ' cannot be applied to given types;\n  required: ' + req + '\n  found:    ' + found + '\n  reason: ' + reason); }
      err(line, 'no suitable ' + (cands[0] && cands[0].ctor ? 'constructor' : 'method') + ' found for ' + what.replace(/^(method|constructor) /, '').replace(/ in class \w+$/, '') + '(' + found + ')\n' + cands.slice(0, 4).map(m => '    ' + (m.ctor ? 'constructor ' : 'method ') + (m.cls ? m.cls.name + '.' : '') + sigStr(m) + ' is not applicable').join('\n'));
    }
    function methodsNamed(c, name, seen) {
      seen = seen || new Set(); const out = [];
      const walk = (ci) => { if (!ci || seen.has(ci.name)) return; seen.add(ci.name); if (ci.methods[name]) for (const m of ci.methods[name]) if (!out.some(o => o.params.length === m.params.length && o.params.every((p, i) => same(subst(p, {}), subst(m.params[i], {}))))) out.push(m); walk(parentOf(ci)); for (const i of ci.impl) walk(classOf(i)); if (ci.isInterface) walk(NATIVE.Object); };
      walk(c); return out;
    }
    function fieldOf(c, name) { for (let ci = c; ci; ci = parentOf(ci)) { if (ci.fields[name]) return ci.fields[name]; for (const i of ci.impl) { const f = fieldOf(classOf(i), name); if (f) return f; } } return null; }
    // conversions, inserted as nodes
    function conv(node, from, to, ctx, what, noConst) {
      if (to.k === 'any' || to.k === 'tvar') return node;
      if (!assignable(from, to, false, noConst ? null : node)) {
        if (from.k === 'prim' && to.k === 'prim' && isNumeric(from) && isNumeric(to)) err(node.line, 'incompatible types: possible lossy conversion from ' + typeStr(from) + ' to ' + typeStr(to));
        err(node.line, 'incompatible types: ' + typeStr(from) + ' cannot be converted to ' + typeStr(to) + (what || ''));
      }
      if (same(from, to) || from.k === 'null') return node;
      if (from.k === 'class' && to.k === 'class') return node;
      if (from.k === 'array') return node;
      return { k: 'Coerce', e: node, from, to, line: node.line, t: to, const: node.const };
    }
    // ----- declarations: first every class and its members, then the bodies
    function declare() {
      for (const d of unit.classes) {
        if (classes[d.name]) err(d.line, 'duplicate class: ' + d.name);
        if (NATIVE[d.name]) err(d.line, 'the name ' + d.name + ' belongs to a class of the Java library; choose another name for your class');
        classes[d.name] = { name: d.name, lib: false, decl: d, ext: null, impl: [], isInterface: d.isInterface, abstract: !!d.mods.abstract || d.isInterface, fields: Object.create(null), methods: Object.create(null), ctors: [], staticValues: Object.create(null), line: d.line, tparams: [], objClass: true, initialized: false };
      }
      for (const d of unit.classes) {
        const c = classes[d.name];
        if (d.ext) { const p = needClass(d.ext.n, d.line); if (p.isInterface) err(d.line, 'no interface expected here'); if (p.lib && !(p.objClass && isSubclass(p.name, 'Throwable')) && p.name !== 'Object') err(d.line, 'a class of this interpreter cannot extend the library class ' + p.name + ' (only Object and the exception classes)'); if (p.name === d.name) err(d.line, 'cyclic inheritance involving ' + d.name); if (d.ext.args.length) err(d.line, 'library exception classes take no type arguments'); c.ext = p.name; } else c.ext = 'Object';
        for (const i of d.impl) { const p = needClass(i.n, d.line); if (!p.isInterface) err(d.line, 'interface expected here'); c.impl.push(p.name); if (i.args.length) { c.implArgs = c.implArgs || {}; c.implArgs[p.name] = i.args.map(a => resolveType(a, d.line)); } }
      }
      for (const d of unit.classes) classes[d.name].extInfo = classOf(classes[d.name].ext);   // for isThrowable: MyException extends Exception prints as "MyException: message"
      for (const d of unit.classes) { let seen = new Set([d.name]); for (let p = classOf(classes[d.name].ext); p && !p.lib; p = classOf(p.ext)) { if (seen.has(p.name)) err(d.line, 'cyclic inheritance involving ' + d.name); seen.add(p.name); } }
      for (const d of unit.classes) {
        const c = classes[d.name];
        for (const f of d.fields) {
          if (c.fields[f.name]) err(f.line, 'variable ' + f.name + ' is already defined in class ' + d.name);
          c.fields[f.name] = { name: f.name, key: f.name, type: resolveType(f.type, f.line), static: f.static, final: f.final, access: f.mods.private ? 'private' : f.mods.protected ? 'protected' : f.mods.public ? 'public' : 'package', cls: c, init: f.init, line: f.line, hasInit: !!f.init };
          if (f.static) c.staticValues[f.name] = defaultValue(c.fields[f.name].type);
        }
        for (const m of d.methods) {
          const params = m.params.map(p => resolveType(p.type, p.line));
          const names = new Set(); for (const p of m.params) { if (names.has(p.name)) err(p.line, 'variable ' + p.name + ' is already defined in method ' + m.name); names.add(p.name); }
          const rec = { name: m.name, params, paramNames: m.params.map(p => p.name), ret: resolveType(m.type, m.line), static: m.static, abstract: m.abstract, access: m.mods.private ? 'private' : m.mods.protected ? 'protected' : m.mods.public ? 'public' : 'package', cls: c, body: m.body, line: m.line, decl: m };
          const list = c.methods[m.name] = c.methods[m.name] || [];
          if (list.some(o => o.params.length === params.length && o.params.every((p, i) => same(p, params[i])))) err(m.line, 'method ' + sigStr(rec) + ' is already defined in class ' + d.name);
          list.push(rec);
          if (m.static && m.abstract) err(m.line, 'illegal combination of modifiers: abstract and static');
          if (m.abstract && !c.abstract) err(m.line, d.name + ' is not abstract and does not override abstract method ' + sigStr(rec) + ' in ' + d.name);
        }
        for (const k of d.ctors) {
          const params = k.params.map(p => resolveType(p.type, p.line));
          const rec = { ctor: true, name: d.name, params, paramNames: k.params.map(p => p.name), body: k.body, access: k.mods.private ? 'private' : 'public', cls: c, line: k.line, decl: k };
          if (c.ctors.some(o => o.params.length === params.length && o.params.every((p, i) => same(p, params[i])))) err(k.line, 'constructor ' + sigStr(rec) + ' is already defined in class ' + d.name);
          if (c.isInterface) err(k.line, 'interfaces cannot have constructors');
          c.ctors.push(rec);
        }
        if (!c.ctors.length && !c.isInterface) c.ctors.push({ ctor: true, name: d.name, params: [], paramNames: [], body: null, access: 'public', cls: c, line: d.line, implicit: true });
        c.inits = d.inits;
      }
      for (const d of unit.classes) { const c = classes[d.name]; for (const fn in c.fields) if (!c.fields[fn].static && fieldOf(parentOf(c), fn)) c.fields[fn].key = c.name + '#' + fn; }
      // overriding and abstract methods
      for (const d of unit.classes) {
        const c = classes[d.name];
        for (const name in c.methods) for (const m of c.methods[name]) {
          for (let p = parentOf(c); p; p = parentOf(p)) { const o = (p.methods[name] || []).find(o => o.params.length === m.params.length && o.params.every((pt, i) => same(subst(pt, {}), m.params[i]))); if (o) { if (o.static !== m.static) err(m.line, sigStr(m) + ' in ' + c.name + ' cannot ' + (m.static ? 'override' : 'hide') + ' ' + sigStr(o) + ' in ' + p.name + '\n  overriding method is ' + (m.static ? 'static' : 'not static')); if (!m.static && !assignable(m.ret, subst(o.ret, {}), true) && !(m.ret.k === 'void' && o.ret.k === 'void')) err(m.line, sigStr(m) + ' in ' + c.name + ' cannot override ' + sigStr(o) + ' in ' + p.name + '\n  return type ' + typeStr(m.ret) + ' is not compatible with ' + typeStr(subst(o.ret, {}))); if (o.access === 'public' && m.access !== 'public') err(m.line, sigStr(m) + ' in ' + c.name + ' cannot override ' + sigStr(o) + ' in ' + p.name + '\n  attempting to assign weaker access privileges; was public'); if (o.access === 'private') continue; break; } }
        }
        if (!c.abstract) {
          const need = [];
          const collect = (ci, env, seen) => { if (!ci || seen.has(ci.name)) return; seen.add(ci.name); for (const n in ci.methods) for (const m of ci.methods[n]) if (m.abstract || (ci.isInterface && !m.static && !m.body && !m.native) || (ci.isInterface && m.native && !m.static && (ci.name === 'Comparable' || (ci.name === 'Comparator' && m.name === 'compare')))) need.push({ m, env, from: ci }); const e2 = ci.lib ? env : env; collect(parentOf(ci), e2, seen); for (const i of ci.impl) collect(classOf(i), (ci.implArgs && ci.implArgs[i] ? Object.fromEntries((classOf(i).tparams || []).map((tp, k) => [tp, ci.implArgs[i][k]])) : env), seen); };
          collect(c, {}, new Set());
          for (const { m, env, from } of need) {
            const ps = m.params.map(p => subst(p, env));
            let found = false;
            for (let ci = c; ci && !found; ci = parentOf(ci)) { if (ci.lib && ci.name === 'Object') break; found = (ci.methods[m.name] || []).some(o => !o.abstract && o.params.length === ps.length && o.params.every((p, i) => same(p, ps[i]))); }
            if (!found) err(c.line, c.name + ' is not abstract and does not override abstract method ' + m.name + '(' + ps.map(typeStr).join(',') + ') in ' + from.name);
          }
        }
      }
    }
    function resolveType(t, line) {
      if (!t) return t;
      if (t.k === 'prim' || t.k === 'void' || t.k === 'any' || t.k === 'null') return t;
      if (t.k === 'var') err(line, "'var' is not allowed here");
      if (t.k === 'array') { const r = arr(resolveType(t.e, line)); if (t.varargs) r.varargs = true; return r; }
      if (t.k === 'tvar') return t;
      const c = needClass(t.n, line);
      if (c.noNew && ['Math', 'System', 'Arrays', 'Collections'].includes(c.name)) err(line, c.name + ' is a class of static methods only; it is not a type for a variable');
      const args = t.args.map(a => { const r = resolveType(a, line); if (r.k === 'prim') err(line, 'unexpected type\n  required: reference\n  found:    ' + typeStr(r)); return r; });
      if (args.length && (c.tparams || []).length !== args.length) err(line, c.tparams && c.tparams.length ? 'wrong number of type arguments; required ' + c.tparams.length : 'type ' + c.name + ' does not take parameters');
      const r = cls(c.name, args); if (t.diamond) r.diamond = true; return r;
    }

    // ----- bodies
    function Scope(parent) { this.vars = new Map(); this.parent = parent; }
    Scope.prototype.lookup = function (n) { for (let s = this; s; s = s.parent) if (s.vars.has(n)) return s.vars.get(n); return null; };
    function declareLocal(ctx, name, type, line, final) {
      if (ctx.scope.lookup(name)) err(line, 'variable ' + name + ' is already defined in ' + (ctx.method.ctor ? 'constructor ' : 'method ') + sigStr(ctx.method));
      const v = { slot: ctx.nslots.n++, type, final: !!final, name }; ctx.scope.vars.set(name, v); return v;
    }
    const withScope = (ctx, f) => { const saved = ctx.scope; ctx.scope = new Scope(saved); try { return f(); } finally { ctx.scope = saved; } };
    function checkBodies() {
      for (const name in classes) {
        const c = classes[name];
        for (const fname in c.fields) { const f = c.fields[fname]; if (f.init) { const ctx = { cls: c, isStatic: f.static, method: { name: '<init>', params: [], ctor: false }, scope: new Scope(null), nslots: { n: 0 }, loops: [], retType: null, fieldInit: true }; f.init = checkInit(f.init, f.type, ctx); f.nslots = ctx.nslots.n; } else if (f.final && !f.static && !c.ctors.some(k => k.body && assignsField(k.body, f.name))) err(f.line, 'variable ' + f.name + ' not initialized in the default constructor'); else if (f.final && f.static) err(f.line, 'variable ' + f.name + ' not initialized in the default constructor'); }
        for (const b of c.inits) { const ctx = { cls: c, isStatic: b.static, method: { name: '<init>', params: [], ctor: false }, scope: new Scope(null), nslots: { n: 0 }, loops: [], retType: T.void }; stmt(b.body, ctx); b.nslots = ctx.nslots.n; }
        for (const mn in c.methods) for (const m of c.methods[mn]) {
          if (!m.body) continue;
          const ctx = { cls: c, isStatic: m.static, method: m, scope: new Scope(null), nslots: { n: 0 }, loops: [], retType: m.ret };
          m.paramSlots = m.params.map((t, i) => declareLocal(ctx, m.paramNames[i], t, m.line).slot);
          stmt(m.body, ctx);
          if (m.ret.k !== 'void' && completes(m.body)) err(m.body.closeLine || m.body.endLine || lastLine(m.body), 'missing return statement');
          m.nslots = ctx.nslots.n;
          definiteAssignment(m.body);
        }
        for (const k of c.ctors) {
          const ctx = { cls: c, isStatic: false, method: k, scope: new Scope(null), nslots: { n: 0 }, loops: [], retType: T.void, inCtor: true };
          k.paramSlots = k.params.map((t, i) => declareLocal(ctx, k.paramNames[i], t, k.line).slot);
          const body = k.body ? k.body.body : [];
          let first = body[0];
          if (first && first.k === 'ExprStmt' && first.e.k === 'CtorCall') { k.explicit = first.e; ctorCall(first.e, ctx); body.shift(); }
          else { const p = parentOf(c); if (p && !p.lib) { const none = p.ctors.find(o => !o.params.length); if (!none) cannotApply(k.line, 'constructor ' + p.name + ' in class ' + p.name, p.ctors, []); k.superCtor = none; } else if (p && p.lib && p.objClass) k.superCtor = p.ctors.find(o => !o.params.length) || null; }
          for (let i = 0; i < body.length; i++) if (body[i].k === 'ExprStmt' && body[i].e.k === 'CtorCall') err(body[i].line, 'call to ' + body[i].e.which + ' must be first statement in constructor');
          if (k.body) stmt(k.body, ctx);
          k.nslots = ctx.nslots.n;
          if (k.body) definiteAssignment(k.body);
        }
      }
    }
    // Definite assignment (JLS 16, simplified): a local variable declared without a value must be assigned on every path before it is read.
    // Sets are Sets of slot numbers; ALL stands for "every variable" after a statement that cannot complete normally (return, break...).
    const ALL = { all: true };
    const isAll = (x) => x === ALL;
    const union = (a, b) => (isAll(a) || isAll(b) ? ALL : new Set([...a, ...b]));
    const inter = (a, b) => (isAll(a) ? b : isAll(b) ? a : new Set([...a].filter(x => b.has(x))));
    const has = (a, x) => isAll(a) || a.has(x);
    function definiteAssignment(body) {
      const tracked = new Map();   // slot → name, for locals declared without an initializer
      const jumps = [];            // open loops / labelled blocks: { label, isLoop, breaks: [sets] }
      function dae(e, da) {        // expressions, in evaluation order → set after
        if (!e || typeof e !== 'object') return da;
        switch (e.k) {
          case 'Local': if (tracked.has(e.slot) && !has(da, e.slot)) err(e.line, 'variable ' + tracked.get(e.slot) + ' might not have been initialized'); return da;
          case 'Assign': {
            const t = e.target;
            if (t.k === 'Local') { if (e.op !== '=' && tracked.has(t.slot) && !has(da, t.slot)) err(t.line, 'variable ' + tracked.get(t.slot) + ' might not have been initialized'); da = dae(e.e, da); return isAll(da) ? da : union(da, new Set([t.slot])); }
            da = t.k === 'Field' ? dae(t.target, da) : t.k === 'Index' ? dae(t.index, dae(t.target, da)) : da;
            return dae(e.e, da);
          }
          case 'Binary': { if (e.op === '&&' || e.op === '||') { const l = dae(e.l, da); dae(e.r, l); return l; } return dae(e.r, dae(e.l, da)); }
          case 'Cond': { const c = dae(e.cond, da); return inter(dae(e.a, c), dae(e.b, c)); }
          case 'SwitchExpr': {   // the state after it is what holds at every yield
            const d = dae(e.subject, da); const ctx = { label: null, isLoop: false, isSwitch: false, isSwitchExpr: true, breaks: [], yields: [] }; jumps.push(ctx);
            try { let cur = ALL; for (const c of e.cases) { cur = inter(cur, d); for (const x of c.body) cur = das(x, cur); } let out = ALL; for (const y of ctx.yields) out = inter(out, y); return isAll(out) ? d : out; } finally { jumps.pop(); }
          }
          case 'Call': { let d = e.target ? dae(e.target, da) : da; for (const a of e.args) d = dae(a, d); return d; }
          case 'New': { let d = da; for (const a of e.args) d = dae(a, d); return d; }
          case 'NewArray': { let d = da; for (const a of e.dims) d = dae(a, d); return e.init ? dae(e.init, d) : d; }
          case 'ArrayInit': case 'VarArgs': { let d = da; for (const a of e.items) d = dae(a, d); return d; }
          case 'Index': return dae(e.index, dae(e.target, da));
          case 'Field': case 'ArrayLength': case 'ArrayClone': return dae(e.target, da);
          case 'PreInc': case 'PostInc': return dae(e.target, da);
          case 'Unary': case 'Paren': case 'Coerce': case 'Cast': case 'InstanceOf': return dae(e.e, da);
          default: return da;
        }
      }
      function loop(s, da, cond, body, afterCond) {   // → set after the loop
        const ctx = { label: s.label || null, isLoop: true, breaks: [] }; jumps.push(ctx);
        try {
          let d = da;
          if (cond && !afterCond) d = dae(cond, d);
          const whenFalse = cond && isLit(cond, true) ? ALL : d;
          const inBody = cond && isLit(cond, false) ? ALL : d;
          const afterBody = das(body, inBody);
          if (afterCond && cond) dae(cond, afterBody);
          let out = cond ? whenFalse : ALL;   // a for without condition leaves only through break
          for (const b of ctx.breaks) out = inter(out, b);
          return out;
        } finally { jumps.pop(); }
      }
      function das(s, da) {        // statements → set after
        if (!s) return da;
        switch (s.k) {
          case 'Block': {
            if (s.label) { const ctx = { label: s.label, isLoop: false, breaks: [] }; jumps.push(ctx); try { let d = da; for (const x of s.body) d = das(x, d); for (const b of ctx.breaks) d = inter(d, b); return d; } finally { jumps.pop(); } }
            let d = da; for (const x of s.body) d = das(x, d); return d;
          }
          case 'LocalDecl': { let d = da; for (const v of s.vars) { if (v.init) { d = dae(v.init, d); d = isAll(d) ? d : union(d, new Set([v.slot])); } else { tracked.set(v.slot, v.name); if (!isAll(d)) d.delete(v.slot); } } return d; }
          case 'ExprStmt': return dae(s.e, da);
          case 'If': { const c = dae(s.cond, da); const t = das(s.then, isLit(s.cond, false) ? ALL : c); const e = das(s.els, isLit(s.cond, true) ? ALL : c); return inter(t, e); }
          case 'While': return loop(s, da, s.cond, s.body, false);
          case 'DoWhile': { const ctx = { label: s.label || null, isLoop: true, breaks: [] }; jumps.push(ctx); try { let d = das(s.body, da); d = dae(s.cond, d); let out = isLit(s.cond, true) ? ALL : d; for (const b of ctx.breaks) out = inter(out, b); return out; } finally { jumps.pop(); } }
          case 'For': { let d = da; for (const i of s.init) d = das(i, d); const ctx = { label: s.label || null, isLoop: true, breaks: [] }; jumps.push(ctx); try { if (s.cond) d = dae(s.cond, d); const whenFalse = !s.cond || isLit(s.cond, true) ? ALL : d; const afterBody = das(s.body, d); let u = afterBody; for (const x of s.update) u = dae(x, u); let out = whenFalse; for (const b of ctx.breaks) out = inter(out, b); return out; } finally { jumps.pop(); } }
          case 'ForEach': { const d = dae(s.iter, da); const ctx = { label: s.label || null, isLoop: true, breaks: [] }; jumps.push(ctx); try { das(s.body, isAll(d) ? d : union(d, new Set([s.slot]))); let out = d; for (const b of ctx.breaks) out = inter(out, b); return out; } finally { jumps.pop(); } }
          case 'Return': { if (s.e) dae(s.e, da); return ALL; }
          case 'Throw': { dae(s.e, da); return ALL; }
          case 'Yield': { const d = dae(s.e, da); const target = jumps.slice().reverse().find(j => j.isSwitchExpr); if (target) target.yields.push(d); return ALL; }
          case 'Break': { const target = s.label ? jumps.slice().reverse().find(j => j.label === s.label) : jumps.slice().reverse().find(j => j.isLoop || j.isSwitch); if (target) target.breaks.push(da); return ALL; }
          case 'Continue': return ALL;
          case 'Switch': {
            const d = dae(s.subject, da); const ctx = { label: s.label || null, isLoop: false, isSwitch: true, breaks: [] }; jumps.push(ctx);
            try { let out = s.cases.some(c => c.isDefault) ? ALL : d; let cur = ALL; for (const c of s.cases) { cur = inter(cur, d); for (const x of c.body) cur = das(x, cur); } out = inter(out, cur); for (const b of ctx.breaks) out = inter(out, b); return out; } finally { jumps.pop(); }
          }
          case 'Try': {
            let out = das(s.block, da);
            for (const c of s.catches) out = inter(out, das(c.body, isAll(da) ? da : union(da, new Set([c.slot]))));
            if (s.fin) { const f = das(s.fin, da); out = isAll(f) ? ALL : union(out, f); }
            return out;
          }
          default: return da;
        }
      }
      das(body, new Set());
    }
    const lastLine = (b) => { let l = b.line; const walk = (n) => { if (!n || typeof n !== 'object') return; if (n.line > l) l = n.line; for (const key in n) if (key !== 't' && key !== 'type' && n[key] && typeof n[key] === 'object') { if (Array.isArray(n[key])) n[key].forEach(walk); else if (n[key].k) walk(n[key]); } }; walk(b); return l; };
    function assignsField(body, name) { let found = false; const walk = (n) => { if (!n || typeof n !== 'object' || found) return; if (n.k === 'Assign' && ((n.target.k === 'Name' && n.target.name === name) || (n.target.k === 'Field' && n.target.target.k === 'This' && n.target.name === name))) found = true; for (const key in n) if (n[key] && typeof n[key] === 'object') { if (Array.isArray(n[key])) n[key].forEach(walk); else walk(n[key]); } }; walk(body); return found; }
    function ctorCall(e, ctx) {
      const c = ctx.cls;
      const argTypes = e.args.map(a => expr(a, Object.assign({}, ctx, { isStatic: true, ctorArgs: true })));   // this/instance fields may not be used here
      if (e.which === 'this') { const chosen = pick(c.ctors.filter(k => k !== ctx.method), argTypes, e.args, {}); if (!chosen) cannotApply(e.line, 'constructor ' + c.name + ' in class ' + c.name, c.ctors, argTypes); e.target = chosen.m; e.args = convArgs(e.args, argTypes, chosen); return; }
      const p = parentOf(c);
      if (!p || (p.lib && !p.objClass)) err(e.line, 'cannot find symbol: constructor ' + (p ? p.name : 'Object'));
      const chosen = pick(p.ctors, argTypes, e.args, {}); if (!chosen) cannotApply(e.line, 'constructor ' + p.name + ' in class ' + p.name, p.ctors, argTypes);
      e.target = chosen.m; e.args = convArgs(e.args, argTypes, chosen);
    }
    function convArgs(args, argTypes, chosen) {
      const ps = chosen.ps; const out = [];
      for (let i = 0; i < ps.length - (chosen.varargs ? 1 : 0); i++) out.push(covariant(argTypes[i], ps[i]) ? args[i] : conv(args[i], argTypes[i], ps[i], null, '', true));
      if (chosen.varargs) { const last = ps[ps.length - 1]; const rest = args.slice(ps.length - 1); if (rest.length === 1 && argTypes[ps.length - 1].k === 'array' && assignable(argTypes[ps.length - 1], last, true)) out.push(rest[0]); else out.push({ k: 'VarArgs', et: last.e, items: rest.map((a, j) => conv(a, argTypes[ps.length - 1 + j], last.e, null)), line: args.length ? args[0].line : 0, t: last }); }
      return out;
    }
    function checkInit(init, type, ctx) {
      if (init.k === 'ArrayInit') { if (type.k !== 'array') err(init.line, 'illegal initializer for ' + typeStr(type)); arrayInit(init, type, ctx); return init; }
      const t = expr(init, ctx, type); return conv(init, t, type, ctx);
    }
    function arrayInit(node, type, ctx) {
      node.t = type; node.items = node.items.map(it => { if (it.k === 'ArrayInit') { if (type.e.k !== 'array') err(it.line, 'illegal initializer for ' + typeStr(type.e)); arrayInit(it, type.e, ctx); return it; } const t = expr(it, ctx, type.e); return conv(it, t, type.e, ctx); });
    }
    const isLit = (n, v) => n && n.k === 'Lit' && n.v === v;
    function completes(s) {   // can this statement complete normally? (JLS 14.22, simplified)
      if (!s) return true;
      switch (s.k) {
        case 'Return': case 'Throw': case 'Yield': return false;
        case 'Block': { for (const x of s.body) if (!completes(x)) return false; return true; }
        case 'If': return !s.els || completes(s.then) || completes(s.els);
        case 'While': return !isLit(s.cond, true) || hasBreak(s.body, s.label);
        case 'DoWhile': return (completes(s.body) && !isLit(s.cond, true)) || hasBreak(s.body, s.label);
        case 'For': return !(s.cond === null || isLit(s.cond, true)) || hasBreak(s.body, s.label);
        case 'Switch': {
          if (!s.cases.some(c => c.isDefault)) return true;
          const arrow = s.cases.some(c => c.body.some(x => x.implicit));
          if (arrow) return s.cases.some(c => { const b = c.body.filter(x => !x.implicit); return !b.length || completes({ k: 'Block', body: b }); });
          if (hasBreak({ k: 'Block', body: s.cases.reduce((a, c) => a.concat(c.body), []) }, s.label)) return true;
          const last = s.cases[s.cases.length - 1]; return !last.body.length || completes({ k: 'Block', body: last.body });
        }
        case 'Try': { if (s.fin && !completes(s.fin)) return false; return completes(s.block) || s.catches.some(c => completes(c.body)); }
        case 'Labeled': return true;
        default: return true;
      }
    }
    function hasBreak(s, label) {   // a break that leaves the statement s (unlabelled and not inside an inner loop/switch, or with this label)
      let found = false;
      const walk = (n, inner) => { if (!n || typeof n !== 'object' || found) return; if (n.k === 'Break') { if ((n.label === null && !inner) || (n.label && n.label === label)) found = true; return; } const nested = inner || ['While', 'DoWhile', 'For', 'ForEach', 'Switch', 'SwitchExpr'].includes(n.k); for (const key in n) if (n[key] && typeof n[key] === 'object' && key !== 'cond' && key !== 'subject') { if (Array.isArray(n[key])) n[key].forEach(x => walk(x, nested)); else if (n[key].k) walk(n[key], nested); } };
      walk(s, false); return found;
    }
    // the type of  c ? a : b  (and of a switch expression with several results)
    function condType(at, bt, na, nb, line) {
      let t;
      if (same(at, bt)) t = at;
      else if (at.k === 'null') t = boxed(bt); else if (bt.k === 'null') t = boxed(at);
      else if (promote(at, bt)) { t = promote(at, bt); if ((unboxed(at).n === 'char' && nb.const !== undefined && fits(nb.const, T.char)) || (unboxed(bt).n === 'char' && na.const !== undefined && fits(na.const, T.char))) t = T.char; }
      else if (isBoolean(unboxed(at)) && isBoolean(unboxed(bt))) t = T.boolean;
      else if (assignable(at, bt, false)) t = bt; else if (assignable(bt, at, false)) t = at;
      else if ((isRef(at) || at.k === 'prim') && (isRef(bt) || bt.k === 'prim')) t = lub(boxed(at), boxed(bt));   // true ? 1 : "s" is an Object
      else err(line, 'incompatible types in conditional expression: ' + typeStr(at) + ' and ' + typeStr(bt));
      return t;
    }
    // the part a switch statement and a switch expression share: the value switched on, and the case labels
    function switchHead(s, ctx) {
      const what = s.k === 'SwitchExpr' ? 'switch expressions' : 'switch statements';
      const st = expr(s.subject, ctx); const u = unboxed(st);
      const ok = (u.k === 'prim' && ['int', 'char', 'short', 'byte'].includes(u.n)) || isString(st);
      if (!ok) err(s.subject.line, (u.k === 'prim' && ['long', 'double', 'float', 'boolean'].includes(u.n)) ? 'selector type ' + typeStr(u) + ' is not allowed' : 'patterns in ' + what + ' are not supported by this interpreter: the value must be an int, a char or a String');
      s.subject = conv(s.subject, st, isString(st) ? st : u, ctx); s.subjectType = isString(st) ? st : u;
      const seen = [];
      let defaults = 0;
      for (const c of s.cases) {
        if (c.isDefault && ++defaults > 1) err(c.line, 'duplicate default label');
        c.labels = c.labels.map(l => { const lt = expr(l, ctx); if (l.const === undefined && !(l.k === 'Lit')) err(l.line, 'constant expression required'); if (isString(st) ? !isString(lt) : !assignable(lt, u, false, l)) err(l.line, 'incompatible types: ' + typeStr(lt) + ' cannot be converted to ' + typeStr(s.subjectType)); if (seen.some(x => x === l.const)) err(l.line, 'duplicate case label'); seen.push(l.const); return conv(l, lt, s.subjectType, ctx); });
      }
    }
    function cond(e, ctx) { const t = expr(e, ctx); if (!isBoolean(unboxed(t))) err(e.line, 'incompatible types: ' + typeStr(t) + ' cannot be converted to boolean'); return conv(e, t, T.boolean, ctx); }
    // the statements of a block or of a case group: one that follows a statement that cannot complete normally can never run (javac: unreachable statement).
    // Only a jump (return, throw, yield, break, continue) or something completes() says cannot finish counts, so a valid program is never refused.
    function stmts(list, ctx) {
      let dead = false;
      for (const x of list) {
        if (dead && !x.implicit) err(x.line, 'unreachable statement');
        stmt(x, ctx);
        if (!dead && !x.implicit) dead = ['Return', 'Throw', 'Yield', 'Break', 'Continue'].includes(x.k) || !completes(x);
      }
    }
    function stmt(s, ctx) {
      switch (s.k) {
        case 'Block': { s.endLine = lastLine(s); if (s.label) ctx.loops.push({ kind: 'label', label: s.label }); try { withScope(ctx, () => { stmts(s.body, ctx); }); } finally { if (s.label) ctx.loops.pop(); } return; }
        case 'Empty': return;
        case 'LocalDecl': {
          for (const v of s.vars) {
            let type = v.type;
            if (type.k === 'var') { if (!v.init) err(v.line, 'cannot infer type for local variable ' + v.name); if (v.init.k === 'ArrayInit') err(v.line, 'cannot infer type for local variable ' + v.name + '\n  (array initializer needs an explicit target-type)'); type = expr(v.init, ctx); if (type.k === 'null') err(v.line, 'cannot infer type for local variable ' + v.name + "\n  (variable initializer is 'null')"); if (type.k === 'void') err(v.line, 'cannot infer type for local variable ' + v.name + "\n  (variable initializer is 'void')"); v.init = conv(v.init, type, type, ctx); v.type = type; }
            else { type = v.type = resolveType(v.type, v.line); if (v.init) v.init = checkInit(v.init, type, ctx); }
            const local = declareLocal(ctx, v.name, type, v.line, s.final);
            v.slot = local.slot;
            if (s.final && v.init && v.init.const !== undefined) local.constVal = v.init.const;
          }
          return;
        }
        case 'ExprStmt': { if (s.e.k === 'CtorCall') err(s.line, 'call to ' + s.e.which + ' must be first statement in constructor'); expr(s.e, ctx); return; }
        case 'If': s.cond = cond(s.cond, ctx); withScope(ctx, () => stmt(s.then, ctx)); if (s.els) withScope(ctx, () => stmt(s.els, ctx)); return;
        case 'While': s.cond = cond(s.cond, ctx); loopBody(s, ctx); return;
        case 'DoWhile': loopBody(s, ctx); s.cond = cond(s.cond, ctx); return;
        case 'For': withScope(ctx, () => { for (const i of s.init) stmt(i, ctx); if (s.cond) s.cond = cond(s.cond, ctx); for (const u of s.update) expr(u, ctx); loopBody(s, ctx); }); return;
        case 'ForEach': {
          const it = expr(s.iter, ctx); let elem;
          if (it.k === 'array') elem = it.e;
          else if (it.k === 'class' && isSubclass(it.n, 'Iterable')) { const ci = classOf(it.n); elem = it.args.length && ci.tparams.length === 1 ? it.args[0] : (it.n === 'Entry' ? T.Object : T.Object); }
          else err(s.iter.line, 'for-each not applicable to expression type\n  required: array or java.lang.Iterable\n  found:    ' + typeStr(it));
          s.iterType = it;
          withScope(ctx, () => {
            let vt = s.varType;
            if (vt.k === 'var') vt = elem; else { vt = resolveType(vt, s.line); if (!assignable(elem, vt, false)) err(s.line, 'incompatible types: ' + typeStr(elem) + ' cannot be converted to ' + typeStr(vt)); }
            s.varType = vt; s.elemType = elem; s.coerce = !same(elem, vt) && (elem.k === 'prim' || vt.k === 'prim');
            s.slot = declareLocal(ctx, s.name, vt, s.line).slot;
            loopBody(s, ctx);
          });
          return;
        }
        case 'Return': {
          if (ctx.loops.some(l => l.kind === 'switchexpr')) err(s.line, 'attempt to return out of a switch expression');
          if (ctx.fieldInit || ctx.method.name === '<init>') err(s.line, 'return outside method');
          if (ctx.retType.k === 'void') { if (s.e) { const t = expr(s.e, ctx); err(s.line, 'incompatible types: unexpected return value' + (ctx.inCtor ? '' : '') + (t ? '' : '')); } return; }
          if (!s.e) err(s.line, 'incompatible types: missing return value');
          const t = expr(s.e, ctx, ctx.retType); s.e = conv(s.e, t, ctx.retType, ctx); return;
        }
        case 'Break': { if (s.label) { if (!ctx.loops.some(l => l.label === s.label)) err(s.line, 'undefined label: ' + s.label); const li = ctx.loops.map(l => l.label).lastIndexOf(s.label); if (ctx.loops.slice(li + 1).some(l => l.kind === 'switchexpr')) err(s.line, 'attempt to break out of a switch expression'); } else { const inner = ctx.loops.slice().reverse().find(l => l.kind !== 'label'); if (!inner) err(s.line, 'break outside switch or loop'); if (inner.kind === 'switchexpr') err(s.line, 'attempt to break out of a switch expression'); } return; }
        case 'Continue': { if (s.label) { const l = ctx.loops.find(l => l.label === s.label); if (!l) err(s.line, 'undefined label: ' + s.label); if (l.kind !== 'loop') err(s.line, 'not a loop label: ' + s.label); if (ctx.loops.slice(ctx.loops.indexOf(l) + 1).some(x => x.kind === 'switchexpr')) err(s.line, 'attempt to continue out of a switch expression'); } else { let li = -1; ctx.loops.forEach((l, i) => { if (l.kind === 'loop') li = i; }); if (li < 0) err(s.line, 'continue outside of loop'); if (ctx.loops.slice(li + 1).some(x => x.kind === 'switchexpr')) err(s.line, 'attempt to continue out of a switch expression'); } return; }
        case 'Throw': { const t = expr(s.e, ctx); if (!(t.k === 'class' && isSubclass(t.n, 'Throwable')) && t.k !== 'null') err(s.line, 'incompatible types: ' + typeStr(t) + ' cannot be converted to Throwable'); return; }
        case 'Switch': {
          switchHead(s, ctx);
          ctx.loops.push({ kind: 'switch', label: s.label || null });
          try { withScope(ctx, () => { for (const c of s.cases) stmts(c.body, ctx); }); } finally { ctx.loops.pop(); }
          return;
        }
        case 'Yield': {
          const frame = ctx.yields && ctx.yields[ctx.yields.length - 1];
          if (!frame) err(s.line, 'yield outside of switch expression');
          const t = expr(s.e, ctx, frame.expected); frame.items.push({ node: s, t }); return;
        }
        case 'Try': {
          stmt(s.block, ctx);
          const caught = [];
          for (const c of s.catches) {
            c.types = c.types.map(t => { const r = resolveType(t, c.line); if (!(r.k === 'class' && isSubclass(r.n, 'Throwable'))) err(c.line, 'incompatible types: ' + typeStr(r) + ' cannot be converted to Throwable'); for (const prev of caught) if (isSubclass(r.n, prev)) err(c.line, 'exception ' + r.n + ' has already been caught'); return r; });
            for (const t of c.types) caught.push(t.n);
            withScope(ctx, () => { c.slot = declareLocal(ctx, c.name, c.types.length === 1 ? c.types[0] : cls('Throwable'), c.line).slot; stmt(c.body, ctx); });
          }
          if (s.fin) stmt(s.fin, ctx);
          return;
        }
        default: err(s.line, 'unsupported statement ' + s.k);
      }
    }
    function loopBody(s, ctx) { ctx.loops.push({ kind: 'loop', label: s.label || null }); try { withScope(ctx, () => stmt(s.body, ctx)); } finally { ctx.loops.pop(); } }

    // ----- expressions
    const zipEnv = (c, args) => { const env = {}; (c.tparams || []).forEach((tp, i) => { if (args[i]) env[tp] = args[i]; }); return env; };
    function accessCheck(mem, ctx, line, what) { if (mem.access === 'private' && mem.cls !== ctx.cls) err(line, what + ' has private access in ' + mem.cls.name); }
    function badOperands(n, op, lt, rt) { err(n.line, "bad operand types for binary operator '" + op + "'\n  first type:  " + typeStr(lt) + '\n  second type: ' + typeStr(rt)); }
    function binaryType(n, op, lt, rt) {
      switch (op) {
        case '+': if (isString(lt) || isString(rt)) { if (lt.k === 'void' || rt.k === 'void') err(n.line, "'void' type not allowed here"); return T.String; }
        // falls through
        case '-': case '*': case '/': case '%': { const p = promote(lt, rt); if (!p) badOperands(n, op, lt, rt); return p; }
        case '<<': case '>>': case '>>>': { const l = unaryPromote(lt), r = unaryPromote(rt); if (!l || !r || !isIntegral(l) || !isIntegral(r)) badOperands(n, op, lt, rt); return l; }
        case '<': case '>': case '<=': case '>=': { if (!promote(lt, rt)) badOperands(n, op, lt, rt); return T.boolean; }
        case '==': case '!=': {
          if (promote(lt, rt) && (lt.k === 'prim' || rt.k === 'prim')) return T.boolean;
          if (isBoolean(unboxed(lt)) && isBoolean(unboxed(rt)) && (lt.k === 'prim' || rt.k === 'prim')) return T.boolean;
          if (isRef(lt) && isRef(rt)) { if (!(assignable(lt, rt, true) || assignable(rt, lt, true) || (lt.k === 'class' && classOf(lt.n).isInterface) || (rt.k === 'class' && classOf(rt.n).isInterface))) err(n.line, 'incomparable types: ' + typeStr(lt) + ' and ' + typeStr(rt)); return T.boolean; }
          err(n.line, 'incomparable types: ' + typeStr(lt) + ' and ' + typeStr(rt)); break;
        }
        case '&': case '|': case '^': { if (isBoolean(unboxed(lt)) && isBoolean(unboxed(rt))) return T.boolean; const p = promote(lt, rt); if (!p || !isIntegral(p)) badOperands(n, op, lt, rt); return p; }
        case '&&': case '||': { if (!isBoolean(unboxed(lt)) || !isBoolean(unboxed(rt))) badOperands(n, op, lt, rt); return T.boolean; }
      }
      return err(n.line, 'unknown operator ' + op);
    }
    function foldInt(op, a, b) {
      switch (op) { case '+': return (a + b) | 0; case '-': return (a - b) | 0; case '*': return Math.imul(a, b); case '/': return b === 0 ? undefined : (a / b) | 0; case '%': return b === 0 ? undefined : a % b; case '&': return a & b; case '|': return a | b; case '^': return a ^ b; case '<<': return a << b; case '>>': return a >> b; case '>>>': return (a >>> b) | 0; }
      return undefined;
    }
    // the target of a field access or call: a class name is allowed here
    function targetExpr(n, ctx) {
      if (n.k === 'Name' && !ctx.scope.lookup(n.name) && !fieldOf(ctx.cls, n.name)) { const c = classOf(n.name); if (c) { n.k = 'TypeRef'; n.cls = c; n.t = { k: 'typeref', cls: c }; return n.t; } }
      return expr(n, ctx);
    }
    function lvalue(n, ctx) {
      if (n.k === 'Name') {
        const v = ctx.scope.lookup(n.name);
        if (v) { if (v.final) err(n.line, 'cannot assign a value to final variable ' + n.name); n.k = 'Local'; n.slot = v.slot; n.t = v.type; return v.type; }
        const f = fieldOf(ctx.cls, n.name);
        if (f) { accessCheck(f, ctx, n.line, n.name); if (f.final && !(ctx.inCtor && f.cls === ctx.cls && !f.hasInit && !f.static) && !(ctx.fieldInit) && !(ctx.method && ctx.method.name === '<init>' && f.static && !f.hasInit)) err(n.line, 'cannot assign a value to final variable ' + n.name); if (!f.static && ctx.isStatic) err(n.line, 'non-static variable ' + n.name + ' cannot be referenced from a static context'); if (f.static) { n.k = 'StaticField'; n.cls = f.cls; } else { n.k = 'Field'; n.target = { k: 'This', t: cls(ctx.cls.name) }; } n.fi = f; n.t = f.type; return f.type; }
        if (classOf(n.name)) err(n.line, 'cannot find symbol\n  symbol:   variable ' + n.name + '\n  location: class ' + ctx.cls.name);
        err(n.line, 'cannot find symbol\n  symbol:   variable ' + n.name + '\n  location: class ' + ctx.cls.name);
      }
      if (n.k === 'Field' || n.k === 'Index') { const t = expr(n, ctx); if (n.k === 'ArrayLength') err(n.line, 'cannot assign a value to final variable length'); if (n.fi && n.fi.final && !(ctx.inCtor && n.fi.cls === ctx.cls && !n.fi.hasInit && n.target && n.target.k === 'This')) err(n.line, 'cannot assign a value to final variable ' + n.fi.name); return t; }
      err(n.line, 'unexpected type\n  required: variable\n  found:    value');
    }
    function expr(n, ctx, expected) {
      const t = expr1(n, ctx, expected); n.t = t; return t;
    }
    function expr1(n, ctx, expected) {
      switch (n.k) {
        case 'Lit': { if (n.type.k === 'prim' || isString(n.type)) n.const = n.v; return n.type; }
        case 'Paren': { const t = expr(n.e, ctx, expected); if (n.e.const !== undefined) n.const = n.e.const; return t; }
        case 'Coerce': return n.t;
        case 'This': { if (ctx.isStatic) err(n.line, ctx.ctorArgs ? 'cannot reference this before supertype constructor has been called' : 'non-static variable this cannot be referenced from a static context'); return cls(ctx.cls.name); }
        case 'Super': err(n.line, "'.' expected"); break;
        case 'Name': {
          const v = ctx.scope.lookup(n.name);
          if (v) { n.k = 'Local'; n.slot = v.slot; if (v.constVal !== undefined) n.const = v.constVal; return v.type; }
          const f = fieldOf(ctx.cls, n.name);
          if (f) { accessCheck(f, ctx, n.line, n.name); if (!f.static) { if (ctx.isStatic) err(n.line, ctx.ctorArgs ? 'cannot reference ' + n.name + ' before supertype constructor has been called' : 'non-static variable ' + n.name + ' cannot be referenced from a static context'); n.k = 'Field'; n.target = { k: 'This', t: cls(ctx.cls.name) }; } else { n.k = 'StaticField'; n.cls = f.cls; } n.fi = f; return f.type; }
          if (classOf(n.name)) err(n.line, 'cannot find symbol\n  symbol:   variable ' + n.name + '\n  location: class ' + ctx.cls.name + '\n  (' + n.name + ' is a class; a value is needed here)');
          if (methodsNamed(ctx.cls, n.name).length) err(n.line, 'cannot find symbol\n  symbol:   variable ' + n.name + '\n  location: class ' + ctx.cls.name + '\n  (there is a method called ' + n.name + '; a method call needs parentheses)');
          err(n.line, 'cannot find symbol\n  symbol:   variable ' + n.name + '\n  location: class ' + ctx.cls.name);
          break;
        }
        case 'Field': {
          if (n.target.k === 'Super') { if (ctx.isStatic) err(n.line, 'non-static variable super cannot be referenced from a static context'); const p = parentOf(ctx.cls); const f = fieldOf(p, n.name); if (!f) err(n.line, 'cannot find symbol\n  symbol: variable ' + n.name); n.target = { k: 'This', t: cls(ctx.cls.name) }; n.fi = f; if (f.static) { n.k = 'StaticField'; n.cls = f.cls; } return f.type; }
          const tt = targetExpr(n.target, ctx);
          if (tt.k === 'typeref') {
            const c = tt.cls; const f = fieldOf(c, n.name);
            if (!f) { if (methodsNamed(c, n.name).length) err(n.line, 'cannot find symbol\n  symbol:   variable ' + n.name + '\n  location: class ' + c.name + '\n  (' + n.name + ' is a method of ' + c.name + '; a method call needs parentheses)'); err(n.line, 'cannot find symbol\n  symbol:   variable ' + n.name + '\n  location: class ' + c.name); }
            if (!f.static) err(n.line, 'non-static variable ' + n.name + ' cannot be referenced from a static context');
            accessCheck(f, ctx, n.line, n.name); n.k = 'StaticField'; n.cls = f.cls; n.fi = f; return f.type;
          }
          if (tt.k === 'array') { if (n.name === 'length') { n.k = 'ArrayLength'; return T.int; } err(n.line, 'cannot find symbol\n  symbol:   variable ' + n.name + '\n  location: class ' + typeStr(tt)); }
          if (tt.k === 'prim') err(n.line, typeStr(tt) + ' cannot be dereferenced');
          if (tt.k === 'null' || tt.k === 'void') err(n.line, typeStr(tt) + ' cannot be dereferenced');
          const c = classOf(tt.n); const f = fieldOf(c, n.name);
          if (!f) { const where = n.target.k === 'Local' ? 'variable ' + n.target.name + ' of type ' + typeStr(tt) : 'class ' + c.name; if (n.name === 'length' && (isString(tt) || c.name === 'ArrayList' || c.name === 'List')) err(n.line, 'cannot find symbol\n  symbol:   variable length\n  location: ' + where + '\n  (' + (isString(tt) ? 'a String has a length() method: write s.length()' : 'a list has a size() method: write list.size()') + ')'); if (methodsNamed(c, n.name).length) err(n.line, 'cannot find symbol\n  symbol:   variable ' + n.name + '\n  location: ' + where + '\n  (' + n.name + ' is a method; a method call needs parentheses)'); err(n.line, 'cannot find symbol\n  symbol:   variable ' + n.name + '\n  location: ' + where); }
          accessCheck(f, ctx, n.line, n.name); n.fi = f; n.recvType = tt;
          if (f.static) { n.k = 'StaticField'; n.cls = f.cls; }
          return f.type;
        }
        case 'Index': {
          const at = expr(n.target, ctx); const it = expr(n.index, ctx);
          if (at.k !== 'array') err(n.line, 'array required, but ' + typeStr(at) + ' found' + (at.k === 'class' && (at.n === 'ArrayList' || at.n === 'List') ? '\n  (a list is read with list.get(i), not list[i])' : isString(at) ? '\n  (a character of a String is read with s.charAt(i))' : ''));
          if (!assignable(it, T.int, false, n.index)) { if (isNumeric(unboxed(it))) err(n.index.line, 'incompatible types: possible lossy conversion from ' + typeStr(it) + ' to int'); err(n.index.line, 'incompatible types: ' + typeStr(it) + ' cannot be converted to int'); }
          n.index = conv(n.index, it, T.int, ctx); return at.e;
        }
        case 'ArrayLength': return T.int;
        case 'Local': case 'StaticField': case 'TypeRef': return n.t;
        case 'Call': {
          const argTypes = n.args.map(a => expr(a, ctx));
          let cands, chosen, kind, tt = null;
          const what = (c) => 'method ' + n.name + ' in class ' + c.name;
          const notFound = (c, where) => err(n.line, 'cannot find symbol\n  symbol:   method ' + n.name + '(' + argTypes.map(typeStr).join(',') + ')\n  location: ' + (where || 'class ' + c.name));
          if (n.target === null) {
            cands = methodsNamed(ctx.cls, n.name);
            if (!cands.length) { const f = fieldOf(ctx.cls, n.name) || ctx.scope.lookup(n.name); notFound(ctx.cls, f ? 'class ' + ctx.cls.name + '\n  (' + n.name + ' is a variable, not a method)' : null); }
            chosen = pick(cands, argTypes, n.args, {}); if (!chosen) cannotApply(n.line, what(cands[0].cls), cands, argTypes);
            if (!chosen.m.static) { if (ctx.isStatic) err(n.line, (ctx.ctorArgs ? 'cannot reference ' + sigStr(chosen.m) + ' before supertype constructor has been called' : 'non-static method ' + sigStr(chosen.m) + ' cannot be referenced from a static context')); kind = 'virtual'; n.target = { k: 'This', t: cls(ctx.cls.name) }; tt = cls(ctx.cls.name); } else kind = 'static';
          } else if (n.target.k === 'Super') {
            if (ctx.isStatic) err(n.line, 'non-static variable super cannot be referenced from a static context');
            const p = parentOf(ctx.cls); cands = methodsNamed(p, n.name); if (!cands.length) notFound(p);
            chosen = pick(cands, argTypes, n.args, (m) => zipEnv(m.cls, [])); if (!chosen) cannotApply(n.line, what(p), cands, argTypes);
            if (chosen.m.abstract) err(n.line, 'abstract method ' + sigStr(chosen.m) + ' in class ' + chosen.m.cls.name + ' cannot be accessed directly');
            kind = chosen.m.static ? 'static' : 'super'; n.target = { k: 'This', t: cls(ctx.cls.name) }; tt = cls(p.name);
          } else {
            tt = targetExpr(n.target, ctx);
            if (tt.k === 'typeref') {
              cands = methodsNamed(tt.cls, n.name); if (!cands.length) notFound(tt.cls);
              chosen = pick(cands, argTypes, n.args, (m) => zipEnv(m.cls, [])); if (!chosen) cannotApply(n.line, what(tt.cls), cands, argTypes);
              if (!chosen.m.static) err(n.line, 'non-static method ' + sigStr(chosen.m) + ' cannot be referenced from a static context');
              kind = 'static';
            } else if (tt.k === 'prim') err(n.line, typeStr(tt) + ' cannot be dereferenced' + (n.name === 'length' || n.name === 'equals' ? '\n  (' + typeStr(tt) + ' is a primitive type, not an object: it has no methods)' : ''));
            else if (tt.k === 'null' || tt.k === 'void') err(n.line, typeStr(tt) + ' cannot be dereferenced');
            else if (tt.k === 'array') {
              if (n.name === 'clone' && !argTypes.length) { n.k = 'ArrayClone'; return tt; }
              if (n.name === 'length' && !argTypes.length) err(n.line, 'cannot find symbol\n  symbol:   method length()\n  location: class ' + typeStr(tt) + '\n  (an array has a length field, without parentheses: arr.length)');
              cands = methodsNamed(NATIVE.Object, n.name); if (!cands.length) notFound({ name: typeStr(tt) });
              chosen = pick(cands, argTypes, n.args, {}); if (!chosen) cannotApply(n.line, 'method ' + n.name + ' in class Object', cands, argTypes);
              kind = 'virtual';
            } else {
              const c = classOf(tt.n); cands = methodsNamed(c, n.name);
              if (!cands.length) { const where = n.target.k === 'Local' ? 'variable ' + n.target.name + ' of type ' + typeStr(tt) : 'class ' + c.name; const hint = (isString(tt) && n.name === 'size') ? '\n  (a String has length(), not size())' : ((c.name === 'ArrayList' || c.name === 'List') && n.name === 'length') ? '\n  (a list has size(), not length())' : (isString(tt) && (n.name === 'charAt' || n.name === 'get')) ? '' : (c.name === 'Scanner' && /^read/.test(n.name)) ? '\n  (a Scanner reads with nextInt(), nextDouble(), next() and nextLine())' : ''; notFound(c, where + hint); }
              chosen = pick(cands, argTypes, n.args, (m) => zipEnv(m.cls, tt.args)); if (!chosen) cannotApply(n.line, what(c), cands, argTypes);
              kind = chosen.m.static ? 'static' : 'virtual';
            }
          }
          accessCheck(chosen.m, ctx, n.line, sigStr(chosen.m));
          n.m = chosen.m; n.args = convArgs(n.args, argTypes, chosen); n.kind = kind; n.recvType = tt;
          let ret = subst(chosen.m.ret, chosen.env);
          if (chosen.m.name === 'getClass') ret = cls('Class');
          return ret;
        }
        case 'New': {
          let type = resolveType(n.type, n.line);
          const c = classOf(type.n);
          if (type.diamond) { if (expected && expected.k === 'class' && expected.args.length && isSubclass(c.name, expected.n) && (c.tparams || []).length === expected.args.length) type = cls(c.name, expected.args); else type = cls(c.name, []); }
          if (c.isInterface || c.abstract) err(n.line, c.name + ' is abstract; cannot be instantiated');
          if (c.noNew) err(n.line, c.name + '() has private access in ' + c.name);
          const argTypes = n.args.map(a => expr(a, ctx));
          const chosen = pick(c.ctors, argTypes, n.args, zipEnv(c, type.args)); if (!chosen) cannotApply(n.line, 'constructor ' + c.name + ' in class ' + c.name, c.ctors, argTypes);
          accessCheck(chosen.m, ctx, n.line, sigStr(chosen.m));
          n.ci = c; n.ctor = chosen.m; n.args = convArgs(n.args, argTypes, chosen); return type;
        }
        case 'NewArray': {
          const type = resolveType(n.type, n.line);
          n.dims = n.dims.map(d => { const dt = expr(d, ctx); if (!assignable(dt, T.int, false, d)) err(d.line, isNumeric(unboxed(dt)) ? 'incompatible types: possible lossy conversion from ' + typeStr(dt) + ' to int' : 'incompatible types: ' + typeStr(dt) + ' cannot be converted to int'); return conv(d, dt, T.int, ctx); });
          if (n.init) arrayInit(n.init, type, ctx);
          n.type = type; return type;
        }
        case 'ArrayInit': { if (!expected || expected.k !== 'array') err(n.line, 'illegal initializer for ' + (expected ? typeStr(expected) : 'this expression')); arrayInit(n, expected, ctx); return expected; }
        case 'Assign': {
          const tt = lvalue(n.target, ctx);
          if (n.op === '=') { let vt; if (n.e.k === 'ArrayInit') { if (tt.k !== 'array') err(n.line, 'illegal initializer for ' + typeStr(tt)); arrayInit(n.e, tt, ctx); vt = tt; } else vt = expr(n.e, ctx, tt); n.e = conv(n.e, vt, tt, ctx); return tt; }
          const op = n.op.slice(0, -1); const vt = expr(n.e, ctx);
          const rt = binaryType(n, op, tt, vt);
          n.lt = tt; n.rt = vt; n.opType = rt; n.binop = op;
          if (isString(rt)) { if (!isString(tt)) err(n.line, 'incompatible types: String cannot be converted to ' + typeStr(tt)); return tt; }
          if (!isNumeric(unboxed(tt)) && !isBoolean(unboxed(tt))) badOperands(n, op, tt, vt);
          if (['<<', '>>', '>>>'].includes(op)) n.e = conv(n.e, vt, unaryPromote(vt), ctx); else n.e = conv(n.e, vt, rt, ctx);
          return tt;
        }
        case 'PreInc': case 'PostInc': { const tt = lvalue(n.target, ctx); if (!isNumeric(unboxed(tt))) err(n.line, "bad operand type " + typeStr(tt) + " for unary operator '" + n.op + "'"); return tt; }
        case 'Unary': {
          const et = expr(n.e, ctx);
          if (n.op === '!') { if (!isBoolean(unboxed(et))) err(n.line, "bad operand type " + typeStr(et) + " for unary operator '!'"); n.e = conv(n.e, et, T.boolean, ctx); if (n.e.const !== undefined) n.const = !n.e.const; return T.boolean; }
          const p = unaryPromote(et); if (!p || (n.op === '~' && !isIntegral(p))) err(n.line, "bad operand type " + typeStr(et) + " for unary operator '" + n.op + "'");
          n.e = conv(n.e, et, p, ctx);
          if (n.e.const !== undefined && p.n === 'int') n.const = n.op === '-' ? (-n.e.const) | 0 : n.op === '~' ? ~n.e.const : n.e.const;
          return p;
        }
        case 'Binary': {
          const lt = expr(n.l, ctx), rt = expr(n.r, ctx);
          const t = binaryType(n, n.op, lt, rt);
          n.lt = lt; n.rt = rt;
          if (isString(t)) { n.opType = T.String; if (n.l.const !== undefined && n.r.const !== undefined && typeof n.l.const !== 'boolean' && typeof n.r.const !== 'boolean') n.const = jstr(n.l.const, lt, null) + jstr(n.r.const, rt, null); return t; }
          if (['<<', '>>', '>>>'].includes(n.op)) { n.opType = t; n.l = conv(n.l, lt, t, ctx); n.r = conv(n.r, rt, unaryPromote(rt), ctx); }
          else if (['&&', '||'].includes(n.op)) { n.opType = T.boolean; n.l = conv(n.l, lt, T.boolean, ctx); n.r = conv(n.r, rt, T.boolean, ctx); }
          else if (['==', '!='].includes(n.op) && !(promote(lt, rt) && (lt.k === 'prim' || rt.k === 'prim')) && !(isBoolean(unboxed(lt)) && isBoolean(unboxed(rt)) && (lt.k === 'prim' || rt.k === 'prim'))) { n.opType = { k: 'ref' }; }
          else { const p = isBoolean(unboxed(lt)) ? T.boolean : promote(lt, rt); n.opType = p; n.l = conv(n.l, lt, p, ctx); n.r = conv(n.r, rt, p, ctx); }
          if (n.l.const !== undefined && n.r.const !== undefined && n.opType.k === 'prim' && n.opType.n === 'int' && typeof n.l.const === 'number' && typeof n.r.const === 'number') { const v = foldInt(n.op, n.l.const, n.r.const); if (v !== undefined) n.const = v; }
          return t;
        }
        case 'Cond': {
          n.cond = cond(n.cond, ctx);
          const at = expr(n.a, ctx, expected), bt = expr(n.b, ctx, expected);
          const t = condType(at, bt, n.a, n.b, n.line);
          n.a = conv(n.a, at, t, ctx); n.b = conv(n.b, bt, t, ctx); return t;
        }
        case 'SwitchExpr': {
          switchHead(n, ctx);
          if (!n.cases.some(c => c.isDefault)) err(n.line, 'the switch expression does not cover all possible input values');
          const frame = { expected: expected && expected.k !== 'void' ? expected : undefined, items: [] };
          (ctx.yields = ctx.yields || []).push(frame);
          ctx.loops.push({ kind: 'switchexpr' });
          try { withScope(ctx, () => { for (const c of n.cases) stmts(c.body, ctx); }); } finally { ctx.loops.pop(); ctx.yields.pop(); }
          if (n.arrow) { for (const c of n.cases) { const b = c.body[0]; if (b && b.k === 'Block' && completes(b)) err(b.closeLine || c.line, 'switch rule completes without providing a value\n  (switch rules in switch expressions should either provide a value or throw)'); } }
          else { const last = n.cases[n.cases.length - 1]; if (last && completes({ k: 'Block', body: last.body })) err(n.endLine, 'switch expression completes without providing a value\n  (switch expressions must either provide a value or throw for all possible input values)'); }
          if (!frame.items.length) err(n.line, 'switch expression does not have any result expressions');
          let t;
          if (frame.expected) {   // assigned, returned: every result has to fit what it goes into, and that is the type
            for (const it of frame.items) if (!assignable(it.t, frame.expected, false, it.node.e)) err(it.node.e.line || it.node.line, 'incompatible types: bad type in switch expression\n    ' + typeStr(it.t) + ' cannot be converted to ' + typeStr(frame.expected));
            t = frame.expected;
          } else {   // on its own: the types of the results are brought together as for ?:
            t = frame.items[0].t;
            for (let i = 1; i < frame.items.length; i++) t = condType(t, frame.items[i].t, frame.items[0].node.e, frame.items[i].node.e, frame.items[i].node.line);
          }
          for (const it of frame.items) it.node.e = conv(it.node.e, it.t, t, ctx);
          return t;
        }
        case 'Cast': {
          const from = expr(n.e, ctx); const to = resolveType(n.type, n.line);
          const bad = () => err(n.line, 'incompatible types: ' + typeStr(from) + ' cannot be converted to ' + typeStr(to));
          if (to.k === 'prim' && from.k === 'prim') { if (isBoolean(to) !== isBoolean(from)) bad(); }
          else if (to.k === 'prim' && from.k === 'class') { const u = UNBOX[from.n]; if (u) { if (!(u === to.n || widens(prim(u), to))) bad(); } else if (!['Object', 'Number', 'Comparable'].includes(from.n)) bad(); }
          else if (to.k === 'class' && from.k === 'prim') { if (!isSubclass(BOX[from.n], to.n)) bad(); }
          else if (from.k === 'null' || to.k === 'any' || from.k === 'any') { /* fine */ }
          else if (from.k === 'void') err(n.line, "'void' type not allowed here");
          else if (!(assignable(from, to, true) || assignable(to, from, true) || (to.k === 'class' && classOf(to.n).isInterface && from.k === 'class') || (from.k === 'class' && classOf(from.n).isInterface && to.k === 'class'))) bad();
          n.from = from; n.type = to;
          if (n.e.const !== undefined && to.k === 'prim' && from.k === 'prim' && typeof n.e.const === 'number' && Number.isFinite(n.e.const)) { const v = n.e.const; n.const = to.n === 'int' ? d2i(v) : to.n === 'char' ? (Math.trunc(v) & 0xFFFF) : to.n === 'byte' ? ((Math.trunc(v) << 24) >> 24) : to.n === 'short' ? ((Math.trunc(v) << 16) >> 16) : (to.n === 'double' || to.n === 'float') ? v : undefined; if (n.const === undefined) delete n.const; }
          return to;
        }
        case 'InstanceOf': {
          const from = expr(n.e, ctx); const to = resolveType(n.type, n.line);
          if (!isRef(from)) err(n.line, 'unexpected type\n  required: reference\n  found:    ' + typeStr(from));
          if (!isRef(to)) err(n.line, 'unexpected type\n  required: reference\n  found:    ' + typeStr(to));
          if (from.k === 'class' && to.k === 'class' && !(assignable(from, to, true) || assignable(to, from, true) || classOf(to.n).isInterface || classOf(from.n).isInterface)) err(n.line, 'incompatible types: ' + typeStr(from) + ' cannot be converted to ' + typeStr(to));
          n.type = to; if (n.bind) n.slot = declareLocal(ctx, n.bind, to, n.line).slot;
          return T.boolean;
        }
        case 'ClassLit': return cls('Class');
        case 'CtorCall': err(n.line, 'call to ' + n.which + ' must be first statement in constructor'); break;
        case 'VarArgs': return n.t;
      }
      return err(n.line, 'unsupported expression ' + n.k);
    }

    declare(); checkBodies();
    // the entry point
    let mainClass = null, main = null;
    for (const d of unit.classes) { const c = classes[d.name]; const m = (c.methods.main || []).find(m => m.static && m.params.length === 1 && m.params[0].k === 'array' && isString(m.params[0].e)); if (m) { mainClass = c; main = m; break; } }
    if (!main) { const first = unit.classes[0]; if (!first) err(1, 'no class found: a Java program is a class, for example\n  public class Main {\n      public static void main(String[] args) { ... }\n  }'); const named = (classes[first.name].methods.main || [])[0]; err(named ? named.line : first.line, named ? 'main must be declared as  public static void main(String[] args)' : "can't find main(String[]) method in class: " + first.name + '\n  (every Java program starts in  public static void main(String[] args))'); }
    if (main.ret.k !== 'void') err(main.line, 'main must be declared as  public static void main(String[] args)  (it returns nothing)');
    return { classes, mainClass, main, isSubclass, classOf, assignable, fileName: (unit.classes.find(c => c.mods.public) || unit.classes[0]).name + '.java' };
  }

  /* ======================================================================================================================== interpreter */
  const MAX_DEPTH = 1200;
  const subst0 = (t) => (t && t.k === 'tvar' ? T.Object : t && t.k === 'array' ? arr(subst0(t.e)) : t && t.k === 'class' && t.args.length ? cls(t.n, t.args.map(subst0)) : t);
  function primConv(v, f, t) {
    if (f === t) return v;
    const asInt = () => (f === 'long' ? Number(BigInt.asIntN(32, v)) : (f === 'double' || f === 'float') ? d2i(v) : v);
    switch (t) {
      case 'int': return asInt() | 0;
      case 'long': return f === 'long' ? v : (f === 'double' || f === 'float') ? d2l(v) : BigInt(v);
      case 'double': return f === 'long' ? Number(v) : v;
      case 'float': return Math.fround(f === 'long' ? Number(v) : v);
      case 'char': return asInt() & 0xFFFF;
      case 'short': return (asInt() << 16) >> 16;
      case 'byte': return (asInt() << 24) >> 24;
      default: return v;
    }
  }
  function Interp(R, chk) {
    const { classOf, isSubclass } = chk;
    R.findMethod = (ci, name, params) => { for (let c = ci; c; c = c.ext ? classOf(c.ext) : null) { const list = c.methods[name]; if (list) for (const m of list) if (params === null ? m.params.length === 1 : (m.params.length === params.length && m.params.every((p, i) => same(subst0(p), params[i])))) return m; } return null; };
    R.invoke = (obj, m, args) => invoke(obj, m, args); R.classOf = classOf;
    const describe = (n) => {
      if (!n) return 'the value';
      switch (n.k) {
        case 'Local': return '"' + n.name + '"';
        case 'Field': return '"' + (n.target.k === 'This' ? 'this.' : describe(n.target).replace(/^"|"$/g, '') + '.') + n.name + '"';
        case 'StaticField': return '"' + n.cls.name + '.' + n.name + '"';
        case 'Index': return '"' + describe(n.target).replace(/"/g, '') + '[...]"';
        case 'Call': return 'the return value of "' + (n.m ? n.m.cls.name + '.' + n.m.name + '(' + n.m.params.map(p => typeStr(subst0(p))).join(', ') + ')' : n.name + '()') + '"';
        case 'Paren': case 'Coerce': return describe(n.e);
        default: return 'the value';
      }
    };
    function isInstance(v, t) {
      if (v === null || v === undefined) return false;
      if (t.k === 'array') return v instanceof JArr && (isPrim(v.et) || isPrim(t.e) ? same(v.et, t.e) : chk.assignable(v.et, t.e, true));
      if (t.k !== 'class') return t.k === 'any';
      if (v instanceof JObj) return isSubclass(v.cls.name, t.n);
      return isSubclass(runtimeClassName(v), t.n);
    }
    function convert(v, from, to) {
      if (to.k === 'prim') {
        if (from.k !== 'prim') { if (v === null || v === undefined) npe(R, 'Cannot invoke "' + typeStr(from) + '.' + to.n + 'Value()" because the value is null'); const rt = UNBOX[from.n] ? from.n : runtimeClassName(v); v = unb(v); return primConv(v, UNBOX[rt] || (typeof v === 'bigint' ? 'long' : typeof v === 'boolean' ? 'boolean' : 'int'), to.n); }
        return primConv(v, from.n, to.n);
      }
      if (from.k === 'prim') { const kind = (to.k === 'class' && UNBOX[to.n]) || from.n; if (kind !== from.n) v = primConv(v, from.n, kind); switch (kind) { case 'double': return new JBox('D', v); case 'float': return new JBox('F', v); case 'char': return new JBox('C', v); default: return v; } }
      return v;
    }
    const cce = (v, to) => { const a = qualified(runtimeClassName(v)), b = qualified(to.k === 'class' ? to.n : typeStr(to)); const where = (n) => (/^java\./.test(n) ? n + ' is in module java.base of loader \'bootstrap\'' : n + ' is in unnamed module of loader \'app\''); throwJ(R, 'ClassCastException', 'class ' + a + ' cannot be cast to class ' + b + ' (' + (where(a).split(' is in ')[1] === where(b).split(' is in ')[1] ? a + ' and ' + b + ' are in ' + where(a).split(' is in ')[1] : where(a) + '; ' + where(b)) + ')'); };
    function ensureInit(c) {
      if (c.lib || c.initialized) return; c.initialized = true;
      const p = classOf(c.ext); if (p) ensureInit(p);
      const items = [];
      for (const fn in c.fields) if (c.fields[fn].static) items.push({ line: c.fields[fn].line, f: c.fields[fn] });
      for (const b of c.inits) if (b.static) items.push({ line: b.line, b });
      items.sort((x, y) => x.line - y.line);
      for (const it of items) {
        if (it.f) { if (it.f.init) { const F = { locals: new Array(it.f.nslots || 0), self: null, cls: c.name, name: '<clinit>', line: it.f.line }; R.frames.push(F); try { c.staticValues[it.f.name] = evalInit(it.f.init, F); } finally { R.frames.pop(); } } }
        else { const F = { locals: new Array(it.b.nslots || 0), self: null, cls: c.name, name: '<clinit>', line: it.b.line }; R.frames.push(F); try { exec(it.b.body, F); } finally { R.frames.pop(); } }
      }
    }
    function initFields(o, c) {
      const items = [];
      for (const fn in c.fields) if (!c.fields[fn].static && c.fields[fn].init) items.push({ line: c.fields[fn].line, f: c.fields[fn] });
      for (const b of c.inits) if (!b.static) items.push({ line: b.line, b });
      items.sort((x, y) => x.line - y.line);
      for (const it of items) {
        const F = { locals: new Array((it.f ? it.f.nslots : it.b.nslots) || 0), self: o, cls: c.name, name: '<init>', line: it.line }; R.frames.push(F);
        try { if (it.f) o.f[it.f.key] = evalInit(it.f.init, F); else exec(it.b.body, F); } finally { R.frames.pop(); }
      }
    }
    const evalInit = (n, F) => (n.k === 'ArrayInit' ? buildArray(n, F) : ev(n, F));
    const buildArray = (n, F) => new JArr(n.t.e, n.items.map(it => (it.k === 'ArrayInit' ? buildArray(it, F) : ev(it, F))));
    function makeArr(t, dims, i) { const n = dims[i], et = t.e, a = new Array(n); if (i + 1 < dims.length) for (let j = 0; j < n; j++) a[j] = makeArr(et, dims, i + 1); else a.fill(defaultValue(et)); return new JArr(et, a); }
    function construct(c, ctor, args) {
      if (c.lib) { if (c.objClass) { const o = new JObj(c); o.R = R; if (isThrowable(c)) o.trace = R.frames.slice(); ctor.fn(o, args, R, ctor); return o; } return ctor.fn(null, args, R, ctor); }
      ensureInit(c);
      const o = new JObj(c); if (isThrowable(c)) { o.trace = R.frames.slice(); o.f.message = null; o.f.cause = null; }
      for (let k = c; k && !k.lib; k = classOf(k.ext)) for (const fn in k.fields) if (!k.fields[fn].static) o.f[k.fields[fn].key] = defaultValue(k.fields[fn].type);
      runCtor(o, c, ctor, args);
      return o;
    }
    function runCtor(o, c, ctor, args) {
      if (R.frames.length >= MAX_DEPTH) throwJ(R, 'StackOverflowError', null);
      const F = { locals: new Array(ctor.nslots || 0), self: o, cls: c.name, name: '<init>', line: ctor.line };
      (ctor.paramSlots || []).forEach((s, i) => { F.locals[s] = args[i]; });
      R.frames.push(F);
      try {
        if (ctor.explicit && ctor.explicit.which === 'this') runCtor(o, c, ctor.explicit.target, ctor.explicit.args.map(a => ev(a, F)));
        else {
          const p = classOf(c.ext);
          if (ctor.explicit) { const sargs = ctor.explicit.args.map(a => ev(a, F)); if (p.lib) { if (p.objClass) ctor.explicit.target.fn(o, sargs, R, ctor.explicit.target); } else runCtor(o, p, ctor.explicit.target, sargs); }
          else if (p && !p.lib) runCtor(o, p, ctor.superCtor, []);
          else if (p && p.lib && p.objClass && ctor.superCtor) ctor.superCtor.fn(o, [], R, ctor.superCtor);
          initFields(o, c);
        }
        if (ctor.body) exec(ctor.body, F);
      } catch (e) { if (e instanceof RangeError) throwJ(R, 'StackOverflowError', null); throw e; }
      finally { R.frames.pop(); }
    }
    function invoke(self, m, args) {
      if (R.frames.length >= MAX_DEPTH) throwJ(R, 'StackOverflowError', null);
      R.tick();
      const F = { locals: new Array(m.nslots || 0), self, cls: m.cls.name, name: m.name, line: m.line };
      for (let i = 0; i < args.length; i++) F.locals[m.paramSlots[i]] = args[i];
      R.frames.push(F);
      try { const r = exec(m.body, F); return r && r.k === 'return' ? r.v : undefined; }
      catch (e) { if (e instanceof RangeError) throwJ(R, 'StackOverflowError', null); throw e; }
      finally { R.frames.pop(); }
    }
    function resolveVirtual(recv, m) {
      if (!(recv instanceof JObj)) return m;
      const loose = m.cls.lib && m.cls.isInterface;
      for (let c = recv.cls; c; c = c.ext ? classOf(c.ext) : null) { const list = c.methods[m.name]; if (list) for (const o of list) if (!o.abstract && o.params.length === m.params.length && (loose || o.params.every((p, i) => same(subst0(p), subst0(m.params[i]))))) return o; if (c.lib) break; }
      return m;
    }
    function call(n, F) {
      const m = n.m;
      if (n.kind === 'static') { const args = n.args.map(a => ev(a, F)); if (m.native) return m.fn(null, args, R, m); ensureInit(m.cls); return invoke(null, m, args); }
      const recv = ev(n.target, F);
      const args = n.args.map(a => ev(a, F));
      if (recv === null || recv === undefined) npe(R, 'Cannot invoke "' + (n.recvType && n.recvType.k === 'class' ? n.recvType.n : m.cls.name) + '.' + m.name + '(' + m.params.map(p => typeStr(subst0(p))).join(', ') + ')" because ' + describe(n.target) + ' is null');
      const target = n.kind === 'virtual' ? resolveVirtual(recv, m) : m;
      if (target.native) return target.fn(recv, args, R, target);
      return invoke(recv, target, args);
    }
    // places a value can be stored
    function ref(n, F) {
      switch (n.k) {
        case 'Local': return { get: () => F.locals[n.slot], set: (v) => { F.locals[n.slot] = v; } };
        case 'Field': { const o = ev(n.target, F); if (o === null || o === undefined) npe(R, 'Cannot assign field "' + n.name + '" because ' + describe(n.target) + ' is null'); return { get: () => o.f[n.fi.key], set: (v) => { o.f[n.fi.key] = v; } }; }
        case 'StaticField': { const c = n.cls; ensureInit(c); return { get: () => c.staticValues[n.name], set: (v) => { c.staticValues[n.name] = v; } }; }
        case 'Index': { const a = ev(n.target, F); const i = ev(n.index, F); if (a === null || a === undefined) npe(R, 'Cannot store to ' + (isPrim(n.target.t.e) ? n.target.t.e.n : 'object') + ' array because ' + describe(n.target) + ' is null'); return { get: () => { if (i < 0 || i >= a.a.length) throwJ(R, 'ArrayIndexOutOfBoundsException', 'Index ' + i + ' out of bounds for length ' + a.a.length); return a.a[i]; }, set: (v) => { if (i < 0 || i >= a.a.length) throwJ(R, 'ArrayIndexOutOfBoundsException', 'Index ' + i + ' out of bounds for length ' + a.a.length); a.a[i] = v; } }; }
      }
      throw new Error('not assignable: ' + n.k);
    }
    const zeroDiv = () => throwJ(R, 'ArithmeticException', '/ by zero');
    function numOp(op, a, b, t) {
      switch (t.n) {
        case 'int': case 'short': case 'byte': case 'char':
          if (typeof b === 'bigint') b = Number(BigInt.asUintN(5, b));   // a long shift distance: only its low five bits count, as in Java
          switch (op) { case '+': return (a + b) | 0; case '-': return (a - b) | 0; case '*': return Math.imul(a, b); case '/': if (b === 0) zeroDiv(); return (a / b) | 0; case '%': if (b === 0) zeroDiv(); return (a % b) | 0; case '<<': return a << b; case '>>': return a >> b; case '>>>': return (a >>> b) | 0; case '&': return a & b; case '|': return a | b; case '^': return a ^ b; case '<': return a < b; case '>': return a > b; case '<=': return a <= b; case '>=': return a >= b; case '==': return a === b; case '!=': return a !== b; }
          break;
        case 'long': {
          const c = typeof b === 'bigint' ? Number(BigInt.asUintN(6, b)) : (b & 63);
          switch (op) { case '+': return BigInt.asIntN(64, a + b); case '-': return BigInt.asIntN(64, a - b); case '*': return BigInt.asIntN(64, a * b); case '/': if (b === 0n) zeroDiv(); return BigInt.asIntN(64, a / b); case '%': if (b === 0n) zeroDiv(); return a % b; case '<<': return BigInt.asIntN(64, a << BigInt(c)); case '>>': return a >> BigInt(c); case '>>>': return BigInt.asIntN(64, BigInt.asUintN(64, a) >> BigInt(c)); case '&': return a & b; case '|': return a | b; case '^': return a ^ b; case '<': return a < b; case '>': return a > b; case '<=': return a <= b; case '>=': return a >= b; case '==': return a === b; case '!=': return a !== b; }
          break;
        }
        case 'double': case 'float': {
          const f = t.n === 'float' ? Math.fround : (x) => x;
          switch (op) { case '+': return f(a + b); case '-': return f(a - b); case '*': return f(a * b); case '/': return f(a / b); case '%': return f(a % b); case '<': return a < b; case '>': return a > b; case '<=': return a <= b; case '>=': return a >= b; case '==': return a === b; case '!=': return a !== b; }
          break;
        }
        case 'boolean':
          switch (op) { case '&': return a && b; case '|': return a || b; case '^': return a !== b; case '==': return a === b; case '!=': return a !== b; }
          break;
      }
      throw new Error('bad operator ' + op + ' on ' + typeStr(t));
    }
    function refEq(a, b) {
      if (a instanceof JBox && b instanceof JBox) return a === b || (a.kind === 'C' && b.kind === 'C' && a.v === b.v && a.v <= 127);   // Character.valueOf caches 0..127
      if (a !== null && b !== null && typeof a === 'object' && typeof b === 'object' && a.classOf !== undefined && b.classOf !== undefined) return a.classOf === b.classOf;   // getClass() == o.getClass()
      if (typeof a === 'number' && typeof b === 'number') return a === b && a >= -128 && a <= 127;   // Integer == Integer compares references; only small values are shared
      if (typeof a === 'bigint' && typeof b === 'bigint') return a === b && a >= -128n && a <= 127n;
      return a === b;
    }
    function binary(n, F) {
      if (n.op === '&&') return ev(n.l, F) && ev(n.r, F);
      if (n.op === '||') return ev(n.l, F) || ev(n.r, F);
      const a = ev(n.l, F), b = ev(n.r, F), t = n.opType;
      if (t.k === 'class') return jstr(a, n.lt, R) + jstr(b, n.rt, R);
      if (t.k === 'ref') return n.op === '==' ? refEq(a, b) : !refEq(a, b);
      return numOp(n.op, a, b, t);
    }
    function incdec(n, F) {
      const r = ref(n.target, F); const lt = n.t, u = unboxed(lt); let cur = r.get();
      if (cur === null || cur === undefined) npe(R, 'Cannot invoke "' + typeStr(lt) + '.' + u.n + 'Value()" because ' + describe(n.target) + ' is null');
      const v = unb(cur); const d = n.op === '++' ? 1 : -1;
      let nv; switch (u.n) { case 'long': nv = BigInt.asIntN(64, v + BigInt(d)); break; case 'double': nv = v + d; break; case 'float': nv = Math.fround(v + d); break; default: nv = primConv((v + d) | 0, 'int', u.n); }
      const stored = lt.k === 'class' ? convert(nv, u, lt) : nv;
      r.set(stored); return n.k === 'PreInc' ? stored : cur;
    }
    function assign(n, F) {
      if (n.op === '=') { const r = ref(n.target, F); const v = ev(n.e, F); r.set(v); return v; }
      const r = ref(n.target, F); const cur = r.get(); const rhs = ev(n.e, F);
      let result;
      if (isString(n.opType)) result = jstr(cur, n.lt, R) + jstr(rhs, n.rt, R);
      else { const p = n.opType; const shift = ['<<', '>>', '>>>'].includes(n.binop); if (cur === null || cur === undefined) npe(R, 'Cannot invoke "' + typeStr(n.lt) + '.' + unboxed(n.lt).n + 'Value()" because ' + describe(n.target) + ' is null'); const curP = convert(cur, n.lt, shift ? unaryPromote(n.lt) : p); const v = numOp(n.binop, curP, rhs, shift ? unaryPromote(n.lt) : p); result = convert(v, shift ? unaryPromote(n.lt) : p, n.lt); }
      r.set(result); return result;
    }
    function cast(n, F) {
      const v = ev(n.e, F), from = n.from, to = n.type;
      if (to.k === 'prim') {
        if (from.k === 'prim') return primConv(v, from.n, to.n);
        if (v === null || v === undefined) npe(R, 'Cannot invoke "' + typeStr(from) + '.' + to.n + 'Value()" because ' + describe(n.e) + ' is null');
        const u = UNBOX[from.n]; if (u) return primConv(unb(v), u, to.n);
        const rt = runtimeClassName(v); if (UNBOX[rt] !== to.n) cce(v, cls(BOX[to.n])); return primConv(unb(v), to.n, to.n);
      }
      if (from.k === 'prim') return convert(v, from, to);
      if (v === null || v === undefined) return null;
      if (!isInstance(v, to)) cce(v, to);
      return v;
    }
    // its own function: locals added to ev() would make every Java call use more of the JS stack (the browser's worker allows about 270 frames)
    function switchExpr(n, F) {
      const v = ev(n.subject, F);
      if (v === null) npe(R, 'Cannot invoke "String.hashCode()" because ' + describe(n.subject) + ' is null');
      let start = -1;
      outer: for (let i = 0; i < n.cases.length; i++) for (const l of n.cases[i].labels) if (ev(l, F) === v) { start = i; break outer; }
      if (start < 0) start = n.cases.findIndex(c => c.isDefault);   // the checker made sure there is one
      for (let i = start; i < n.cases.length; i++) for (const x of n.cases[i].body) { const r = exec(x, F); if (r) { if (r.k === 'yield') return r.v; throw new Error('a jump out of a switch expression'); } }
      throw new Error('a switch expression ended without a value');
    }
    function ev(n, F) {
      switch (n.k) {
        case 'Lit': return n.v;
        case 'Local': return F.locals[n.slot];
        case 'This': return F.self;
        case 'Paren': return ev(n.e, F);
        case 'Coerce': return convert(ev(n.e, F), n.from, n.to);
        case 'Field': { const o = ev(n.target, F); if (o === null || o === undefined) npe(R, 'Cannot read field "' + n.name + '" because ' + describe(n.target) + ' is null'); return o.f[n.fi.key]; }
        case 'StaticField': { const c = n.cls; if (!c.lib) ensureInit(c); return c.staticValues[n.name]; }
        case 'ArrayLength': { const a = ev(n.target, F); if (a === null || a === undefined) npe(R, 'Cannot read the array length because ' + describe(n.target) + ' is null'); return a.a.length; }
        case 'Index': { const a = ev(n.target, F); const i = ev(n.index, F); if (a === null || a === undefined) npe(R, 'Cannot load from ' + (isPrim(n.target.t.e) ? n.target.t.e.n : 'object') + ' array because ' + describe(n.target) + ' is null'); if (i < 0 || i >= a.a.length) throwJ(R, 'ArrayIndexOutOfBoundsException', 'Index ' + i + ' out of bounds for length ' + a.a.length); return a.a[i]; }
        case 'Call': return call(n, F);
        case 'ArrayClone': { const a = ev(n.target, F); if (a === null) npe(R, 'Cannot invoke "Object.clone()" because ' + describe(n.target) + ' is null'); return new JArr(a.et, a.a.slice()); }
        case 'New': return construct(n.ci, n.ctor, n.args.map(a => ev(a, F)));
        case 'NewArray': { if (n.init) return buildArray(n.init, F); const dims = n.dims.map(d => ev(d, F)); for (const d of dims) if (d < 0) throwJ(R, 'NegativeArraySizeException', String(d)); let total = 1; for (const d of dims) total *= Math.max(1, d); if (total > 5e7) throwJ(R, 'OutOfMemoryError', 'Java heap space'); return makeArr(n.type, dims, 0); }
        case 'ArrayInit': return buildArray(n, F);
        case 'VarArgs': return new JArr(n.et, n.items.map(x => ev(x, F)));
        case 'Assign': return assign(n, F);
        case 'PreInc': case 'PostInc': return incdec(n, F);
        case 'Unary': { const v = ev(n.e, F); const t = n.t; switch (n.op) { case '!': return !v; case '+': return v; case '-': return t.n === 'long' ? BigInt.asIntN(64, -v) : t.n === 'int' ? (-v) | 0 : -v; case '~': return t.n === 'long' ? ~v : ~v; } break; }
        case 'Binary': return binary(n, F);
        case 'Cond': return ev(n.cond, F) ? ev(n.a, F) : ev(n.b, F);
        case 'SwitchExpr': return switchExpr(n, F);
        case 'Cast': return cast(n, F);
        case 'InstanceOf': { const v = ev(n.e, F); const r = isInstance(v, n.type); if (r && n.bind) F.locals[n.slot] = v; return r; }
        case 'ClassLit': return { classOf: n.e ? (n.e.cls ? n.e.cls.name : 'Object') : 'int' };
      }
      throw new Error('cannot evaluate ' + n.k);
    }
    // 0: go on, 1: leave the loop, or a signal to pass up
    const loopSignal = (r, s) => { if (!r) return 0; if (r.k === 'break') return (!r.label || r.label === s.label) ? 1 : r; if (r.k === 'continue') return (!r.label || r.label === s.label) ? 0 : r; return r; };
    function exec(s, F) {
      F.line = s.line;
      switch (s.k) {
        case 'Block': for (const x of s.body) { const r = exec(x, F); if (r) { if (r.k === 'break' && r.label && r.label === s.label) return undefined; return r; } } return undefined;
        case 'Empty': return undefined;
        case 'LocalDecl': for (const v of s.vars) F.locals[v.slot] = v.init ? evalInit(v.init, F) : defaultValue(v.type); return undefined;
        case 'ExprStmt': ev(s.e, F); return undefined;
        case 'If': return ev(s.cond, F) ? exec(s.then, F) : s.els ? exec(s.els, F) : undefined;
        case 'While': while (ev(s.cond, F)) { R.tick(); const r = loopSignal(exec(s.body, F), s); if (r === 1) break; if (r) return r; F.line = s.line; } return undefined;
        case 'DoWhile': for (;;) { R.tick(); const r = loopSignal(exec(s.body, F), s); if (r === 1) break; if (r) return r; F.line = s.line; if (!ev(s.cond, F)) break; } return undefined;
        case 'For': for (const i of s.init) exec(i, F); for (; !s.cond || ev(s.cond, F); ) { R.tick(); const r = loopSignal(exec(s.body, F), s); if (r === 1) break; if (r) return r; F.line = s.line; for (const u of s.update) ev(u, F); } return undefined;
        case 'ForEach': {
          const it = ev(s.iter, F);
          if (it === null || it === undefined) npe(R, 'Cannot ' + (s.iterType.k === 'array' ? 'read the array length' : 'invoke "' + s.iterType.n + '.iterator()"') + ' because ' + describe(s.iter) + ' is null');
          const put = (v) => { F.locals[s.slot] = s.coerce ? convert(v, s.elemType, s.varType) : v; };
          if (it instanceof JArr) { for (let i = 0; i < it.a.length; i++) { R.tick(); put(it.a[i]); const r = loopSignal(exec(s.body, F), s); if (r === 1) break; if (r) return r; } }
          else if (it instanceof JList) { const a = it.a; const len0 = a.length; for (let i = 0; i !== a.length; i++) { if (a.length !== len0) throwJ(R, 'ConcurrentModificationException', null); R.tick(); put(a[i]); const r = loopSignal(exec(s.body, F), s); if (r === 1) break; if (r) return r; } }
          else if (it instanceof JSet) { const items = it.ordered ? it.ordered.slice() : it.m.entries(R).map(e => e.key); const size0 = it.m.size; for (const x of items) { if (it.m.size !== size0) throwJ(R, 'ConcurrentModificationException', null); R.tick(); put(x); const r = loopSignal(exec(s.body, F), s); if (r === 1) break; if (r) return r; } }
          else throwJ(R, 'UnsupportedOperationException', 'cannot iterate over ' + runtimeClassName(it));
          return undefined;
        }
        case 'Return': return new Signal('return', null, s.e ? ev(s.e, F) : undefined);
        case 'Yield': return new Signal('yield', null, ev(s.e, F));
        case 'Break': return new Signal('break', s.label);
        case 'Continue': return new Signal('continue', s.label);
        case 'Throw': { const v = ev(s.e, F); if (v === null || v === undefined) npe(R, 'Cannot throw exception because ' + describe(s.e) + ' is null'); if (!v.trace) v.trace = R.frames.slice(); throw new JavaThrow(v); }
        case 'Switch': {
          const v = ev(s.subject, F);
          if (v === null) npe(R, 'Cannot invoke "String.hashCode()" because ' + describe(s.subject) + ' is null');
          let start = -1;
          outer: for (let i = 0; i < s.cases.length; i++) for (const l of s.cases[i].labels) if (ev(l, F) === v) { start = i; break outer; }
          if (start < 0) start = s.cases.findIndex(c => c.isDefault);
          if (start < 0) return undefined;
          for (let i = start; i < s.cases.length; i++) for (const x of s.cases[i].body) { const r = exec(x, F); if (r) { if (r.k === 'break' && (!r.label || r.label === s.label)) return undefined; return r; } }
          return undefined;
        }
        case 'Try': {
          let result, pending = null;
          try { result = exec(s.block, F); }
          catch (e) {
            let jt = e instanceof JavaThrow ? e : null;
            if (!jt && e instanceof RangeError) { try { throwJ(R, 'StackOverflowError', null); } catch (e2) { jt = e2; } }
            if (!jt) throw e;
            const c = s.catches.find(c => c.types.some(t => isInstance(jt.obj, t)));
            if (!c) pending = jt; else { F.locals[c.slot] = jt.obj; try { result = exec(c.body, F); } catch (e3) { pending = e3; } }
          }
          if (s.fin) { const r = exec(s.fin, F); if (r) return r; }
          if (pending) throw pending;
          return result;
        }
      }
      throw new Error('cannot execute ' + s.k);
    }
    return {
      main() { ensureInit(chk.mainClass); invoke(null, chk.main, [new JArr(T.String, [])]); }
    };
  }

  /* ======================================================================================================================== API */
  const fileNameGuess = (code) => { const m = String(code).match(/\bpublic\s+(?:final\s+|abstract\s+)*class\s+([A-Za-z_$][\w$]*)/) || String(code).match(/\bclass\s+([A-Za-z_$][\w$]*)/); return (m ? m[1] : 'Main') + '.java'; };
  function run(code, stdin, opts) {
    opts = opts || {};
    const R = new Runtime({ stdin, more: opts.more, write: opts.write, maxSteps: opts.maxSteps, maxMs: opts.maxMs === undefined ? 5000 : opts.maxMs, maxOut: opts.maxOut });
    let chk;
    try { chk = Checker(parse(String(code))); }
    catch (e) { if (e instanceof CompileError) return { out: '', err: fileNameGuess(code) + ':' + e.line + ': error: ' + e.message, compile: true, line: e.line }; throw e; }
    if (opts.checkOnly) return { out: '', err: null, exit: 0 };   // javac in the practice terminal: the checks above, nothing run
    R.fileName = chk.fileName; R.classes = chk.classes;
    const I = Interp(R, chk);
    try { I.main(); return { out: R.out, err: null, exit: 0 }; }
    catch (e) {
      if (e instanceof JavaThrow) return { out: R.out, err: 'Exception in thread "main" ' + traceText(R, e.obj), exit: 1 };
      if (e instanceof SystemExit) return { out: R.out, err: null, exit: e.code };
      if (e instanceof TimeLimit) return { out: R.out, err: 'Time limit exceeded: the program ran for too long. Is there a loop that never ends?', exit: 1 };
      if (e instanceof TooMuchOutput) return { out: R.out, err: 'The program printed more than it was allowed to and was stopped.', exit: 1 };
      if (e instanceof RangeError) return { out: R.out, err: 'Exception in thread "main" java.lang.StackOverflowError', exit: 1 };
      return { out: R.out, err: 'Internal error in the Java interpreter: ' + (e && e.message || e), exit: 1 };
    }
  }
  return { run, parse, fmtDouble, strHash, jformat, CompileError, _internal: { lex, Checker, NATIVE } };
});
