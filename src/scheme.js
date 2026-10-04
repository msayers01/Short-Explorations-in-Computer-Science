/* A small Scheme in the SICP dialect. Exposed as window.Scheme (browser) or module.exports (node). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Scheme = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---------- data ----------
  class Sym { constructor(name) { this.name = name; } toString() { return this.name; } }
  const symtab = new Map();
  const sym = (name) => { let s = symtab.get(name); if (!s) { s = new Sym(name); symtab.set(name, s); } return s; };
  class Pair { constructor(car, cdr) { this.car = car; this.cdr = cdr; } }
  const NIL = { toString() { return '()'; } };
  const UNSPEC = { toString() { return ''; } };
  class Lambda { constructor(params, rest, body, env, name) { this.params = params; this.rest = rest; this.body = body; this.env = env; this.name = name || null; } }
  class Primitive { constructor(name, fn, min, max) { this.name = name; this.fn = fn; this.min = min; this.max = max; } }
  class SchemeError extends Error { constructor(msg) { super(msg); this.name = 'SchemeError'; } }

  const S = {
    quote: sym('quote'), define: sym('define'), lambda: sym('lambda'), if: sym('if'), cond: sym('cond'), else: sym('else'),
    let: sym('let'), letstar: sym('let*'), begin: sym('begin'), and: sym('and'), or: sym('or'), set: sym('set!'), arrow: sym('=>'),
    quasi: sym('quasiquote'), unquote: sym('unquote'), when: sym('when'), unless: sym('unless'), letrec: sym('letrec'), dot: sym('.'),
    do: sym('do'), splice: sym('unquote-splicing'), case: sym('case')
  };

  const list = (...xs) => { let r = NIL; for (let i = xs.length - 1; i >= 0; i--) r = new Pair(xs[i], r); return r; };
  const fromArr = (xs, tail) => { let r = tail === undefined ? NIL : tail; for (let i = xs.length - 1; i >= 0; i--) r = new Pair(xs[i], r); return r; };
  const MAX_ALLOC = 1e6, MAX_STR = 1e7;   // iota and string-append build their result in one step, so the step limit cannot stop them
  const tooBig = () => new SchemeError(';Aborting!: out of memory');
  const MAX_LIST = 1e7;   // a circular list would otherwise loop forever
  const arr = (p) => { const out = []; while (p instanceof Pair) { out.push(p.car); p = p.cdr; if (out.length > MAX_LIST) throw new SchemeError('The object is a circular list, which this procedure cannot process.'); } if (p !== NIL) throw new SchemeError('The object ' + write(p) + ', passed as the last argument, is not a list.'); return out; };
  const isList = (p) => {   // Floyd's cycle detection: a circular list is not a list
    let slow = p;
    while (p instanceof Pair) { p = p.cdr; if (!(p instanceof Pair)) break; p = p.cdr; slow = slow.cdr; if (p === slow) return false; }
    return p === NIL;
  };

  // ---------- reader ----------
  function tokenize(src) {
    const toks = []; let i = 0; const n = src.length;
    while (i < n) {
      const c = src[i];
      if (/\s/.test(c)) { i++; continue; }
      if (c === ';') { while (i < n && src[i] !== '\n') i++; continue; }
      if (c === '#' && src[i + 1] === '|') {   // block comment, which may nest
        let depth = 1; i += 2;
        while (i < n && depth) { if (src[i] === '|' && src[i + 1] === '#') { depth--; i += 2; } else if (src[i] === '#' && src[i + 1] === '|') { depth++; i += 2; } else i++; }
        if (depth) throw new SchemeError('Unterminated block comment');
        continue;
      }
      if (c === '#' && src[i + 1] === ';') { toks.push('#;'); i += 2; continue; }   // comments out the next datum
      if (c === ',' && src[i + 1] === '@') { toks.push(',@'); i += 2; continue; }
      if (c === '(' || c === ')' || c === '\'' || c === '`' || c === ',') { toks.push(c); i++; continue; }
      if (c === '[' || c === ']') { toks.push(c === '[' ? '(' : ')'); i++; continue; }
      if (c === '"') {
        let j = i + 1, s = '';
        while (j < n && src[j] !== '"') { if (src[j] === '\\' && j + 1 < n) { j++; s += ({ n: '\n', t: '\t' })[src[j]] || src[j]; } else s += src[j]; j++; }
        if (j >= n) throw new SchemeError('Unterminated string literal');
        toks.push({ str: s }); i = j + 1; continue;
      }
      let j = i; while (j < n && !/[\s()\[\]'`,";]/.test(src[j])) j++;
      toks.push(src.slice(i, j)); i = j;
    }
    return toks;
  }
  function parseAll(src) {
    const toks = tokenize(src); let pos = 0;
    function read() {
      if (pos >= toks.length) throw new SchemeError('Unexpected end of input — missing a closing parenthesis?');
      const t = toks[pos++];
      if (t === '#;') { read(); return read(); }
      if (typeof t === 'object') return t.str;
      if (t === '(') {
        const items = []; let tail = NIL;
        while (true) {
          if (pos >= toks.length) throw new SchemeError('Unexpected end of input — missing a closing parenthesis?');
          if (toks[pos] === '#;') { pos++; read(); continue; }
          if (toks[pos] === ')') { pos++; break; }
          if (toks[pos] === '.') { pos++; tail = read(); if (toks[pos] !== ')') throw new SchemeError('Bad dotted list'); pos++; break; }
          items.push(read());
        }
        let r = tail; for (let i = items.length - 1; i >= 0; i--) r = new Pair(items[i], r); return r;
      }
      if (t === ')') throw new SchemeError('Unexpected ")" — there is an extra closing parenthesis.');
      if (t === '\'') return list(S.quote, read());
      if (t === '`') return list(S.quasi, read());
      if (t === ',') return list(S.unquote, read());
      if (t === ',@') return list(S.splice, read());
      if (t === '#t' || t === '#T' || t === '#true' || t === 'true') return true;
      if (t === '#f' || t === '#F' || t === '#false' || t === 'false') return false;
      if (/^[-+]?\d+$/.test(t)) { const n = parseFloat(t); return Number.isSafeInteger(n) ? n : BigInt(t); }   // integers too big for a double stay exact
      if (/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(t)) return parseFloat(t);
      if (/^[-+]?\d+\/\d+$/.test(t)) { const [a, b] = t.split('/'); return parseFloat(a) / parseFloat(b); }
      return sym(t);
    }
    const forms = [];
    while (pos < toks.length) forms.push(read());
    return forms;
  }

  // ---------- printer ----------
  function fmtNum(x) {
    if (typeof x === 'bigint' || Number.isInteger(x)) return String(x).replace('e+', 'e');   // MIT Scheme writes 1e21, not 1e+21
    if (!isFinite(x)) return x > 0 ? '+inf' : x < 0 ? '-inf' : 'nan';
    const intDigits = Math.floor(Math.abs(x)).toString().length;
    let s = String(parseFloat(x.toPrecision(Math.max(12, intDigits + 1))));   // 12 significant digits, but never fewer than the whole part plus one decimal
    s = s.replace('e+', 'e');
    if (s.startsWith('0.')) s = s.slice(1); else if (s.startsWith('-0.')) s = '-' + s.slice(2);
    if (!/[.e]/.test(s)) s += '.';
    return s;
  }
  function write(x, display) {
    if (typeof x === 'number' || typeof x === 'bigint') return fmtNum(x);
    if (typeof x === 'boolean') return x ? '#t' : '#f';
    if (typeof x === 'string') return display ? x : JSON.stringify(x);
    if (x instanceof Sym) return x.name;
    if (x === NIL) return '()';
    if (x === UNSPEC) return '';
    if (x instanceof Pair) {
      if (x.car === S.quote && x.cdr instanceof Pair && x.cdr.cdr === NIL) return "'" + write(x.cdr.car, display);
      const parts = []; let p = x, count = 0;
      while (p instanceof Pair) { parts.push(write(p.car, display)); p = p.cdr; if (++count > 1e6) { parts.push('...'); break; } }
      if (p !== NIL && count <= 1e6) parts.push('.', write(p, display));
      return '(' + parts.join(' ') + ')';
    }
    if (x instanceof Lambda) return '#[compound-procedure ' + (x.name || 'anonymous') + ']';
    if (x instanceof Primitive) return '#[compiled-procedure ' + x.name + ']';
    if (x === undefined) return '';
    if (x && x.constructor && x.constructor.name === 'Env') return '#[environment]';
    return String(x);
  }

  // ---------- environment ----------
  class Env {
    constructor(parent) { this.vars = new Map(); this.parent = parent || null; }
    lookup(s) { let e = this; while (e) { if (e.vars.has(s)) return e.vars.get(s); e = e.parent; } throw new SchemeError('Unbound variable: ' + s.name); }
    set(s, v) { let e = this; while (e) { if (e.vars.has(s)) { e.vars.set(s, v); return; } e = e.parent; } throw new SchemeError('Unbound variable: ' + s.name); }
    define(s, v) { this.vars.set(s, v); }
  }

  // ---------- evaluator (with tail calls) ----------
  // Numbers are JS doubles, except that an integer too big for a double is a BigInt, so (fact 25) and (expt 2 100) are exact.
  // Results that fit in a double go back to being plain numbers.
  const MAXS = BigInt(Number.MAX_SAFE_INTEGER);
  const isInt = (x) => typeof x === 'bigint' || Number.isSafeInteger(x);
  const norm = (b) => (b >= -MAXS && b <= MAXS) ? Number(b) : b;
  const arith = (big, flt) => (a, b) => {
    if (typeof a === 'number' && typeof b === 'number') { const r = flt(a, b); if (!(Number.isSafeInteger(a) && Number.isSafeInteger(b)) || Number.isSafeInteger(r)) return r; return norm(big(BigInt(a), BigInt(b))); }
    return isInt(a) && isInt(b) ? norm(big(BigInt(a), BigInt(b))) : flt(Number(a), Number(b));
  };
  const add = arith((x, y) => x + y, (x, y) => x + y), sub = arith((x, y) => x - y, (x, y) => x - y), mul = arith((x, y) => x * y, (x, y) => x * y);
  const num = (x, who) => { if (typeof x !== 'number' && typeof x !== 'bigint') throw new SchemeError('The object ' + write(x) + ', passed as an argument to ' + who + ', is not the correct type.'); return x; };
  const pair = (x, who) => { if (!(x instanceof Pair)) throw new SchemeError('The object ' + write(x) + ', passed as the first argument to ' + who + ', is not the correct type.'); return x; };

  function makeEvaluator(opts) {
    opts = opts || {};
    let steps = 0; const limit = opts.stepLimit || 3e6;
    const output = [];
    const out = (s) => { output.push(s); if (opts.onOutput) opts.onOutput(s); };
    let depth = 0;

    // The evaluator keeps its own stack of continuation frames on the heap, so a deeply recursive Scheme program
    // (the non-tail recursion in the lessons: (+ 1 (f (- n 1))) ...) is limited by MAX_STACK, not by the JS call stack.
    // Tail positions reuse the current frame, so tail calls take constant space. do, named-let inits, letrec and
    // quasiquote still recurse into evaluate(); they are never what makes a program deep.
    const F = { IF: 1, SEQ: 2, DEF: 3, SET: 4, APP: 5, COND: 6, ARROW: 7, AND: 8, OR: 9, WHEN: 10, LET: 11, LETSTAR: 12, CASE: 13 };
    const MAX_STACK = 200000;
    const ill = (x) => new SchemeError('Ill-formed special form: ' + write(x));

    function evaluate(x, env) {
      const stack = []; let val;
      main: for (;;) {
        // ---- EVAL: x in env. Either leaves a value in val (break step), or sets x/env to something still to evaluate (continue main).
        step: {
          if (++steps > limit) throw new SchemeError(';Aborting!: program ran for too long (is there an infinite loop?)');
          if (stack.length > MAX_STACK) throw new SchemeError(';Aborting!: maximum recursion depth exceeded');
          if (x instanceof Sym) { val = env.lookup(x); break step; }
          if (!(x instanceof Pair)) { if (x === NIL) throw new SchemeError('Combination must have at least one subexpression: ()'); val = x; break step; }
          const op = x.car;
          if (op instanceof Sym) {
            switch (op) {
              case S.quote: val = x.cdr.car; break step;
              case S.if:
                if (!(x.cdr instanceof Pair && x.cdr.cdr instanceof Pair)) throw ill(x);
                stack.push({ k: F.IF, x, env }); x = x.cdr.car; continue main;
              case S.define: {
                const target = x.cdr.car;
                if (target instanceof Pair) { // (define (f . args) body...)
                  const name = target.car;
                  env.define(name, makeLambda(target.cdr, x.cdr.cdr, env, name.name)); val = sym(name.name); break step;
                }
                if (!(target instanceof Sym)) throw new SchemeError('Variable required in this context: ' + write(target));
                if (!(x.cdr.cdr instanceof Pair)) { env.define(target, UNSPEC); val = sym(target.name); break step; }
                stack.push({ k: F.DEF, target, env }); x = x.cdr.cdr.car; continue main;
              }
              case S.set:
                if (!(x.cdr instanceof Pair && x.cdr.cdr instanceof Pair)) throw ill(x);
                stack.push({ k: F.SET, target: x.cdr.car, env }); x = x.cdr.cdr.car; continue main;
              case S.lambda: val = makeLambda(x.cdr.car, x.cdr.cdr, env, null); break step;
              case S.begin: {
                const b = x.cdr; if (b === NIL) { val = UNSPEC; break step; }
                if (b.cdr !== NIL) stack.push({ k: F.SEQ, rest: b.cdr, env });
                x = b.car; continue main;
              }
              case S.cond: stack.push({ k: F.COND, c: x.cdr, x, env, fresh: true }); val = undefined; break step;
              case S.case:   // (case key ((d1 d2 ...) body...) ... (else body...)): the key is compared with eqv?
                if (!(x.cdr instanceof Pair)) throw ill(x);
                stack.push({ k: F.CASE, x, env }); x = x.cdr.car; continue main;
              case S.and: {
                const c = x.cdr; if (c === NIL) { val = true; break step; }
                if (c.cdr !== NIL) stack.push({ k: F.AND, rest: c.cdr, env });
                x = c.car; continue main;
              }
              case S.or: {
                const c = x.cdr; if (c === NIL) { val = false; break step; }
                if (c.cdr !== NIL) stack.push({ k: F.OR, rest: c.cdr, env });
                x = c.car; continue main;
              }
              case S.when: case S.unless:
                stack.push({ k: F.WHEN, when: op === S.when, x, env }); x = x.cdr.car; continue main;
              case S.let: {
                if (x.cdr.car instanceof Sym) { // named let
                  const name = x.cdr.car, bindings = arr(x.cdr.cdr.car), body = x.cdr.cdr.cdr;
                  const ne = new Env(env);
                  const lam = makeLambda(list(...bindings.map(b => b.car)), body, ne, name.name);
                  ne.define(name, lam);
                  const args = bindings.map(b => evaluate(b.cdr.car, env));
                  const r = bindArgs(lam, args); x = r.body; env = r.env; continue main;
                }
                stack.push({ k: F.LET, binds: arr(x.cdr.car), i: 0, vals: [], env, body: x.cdr.cdr, fresh: true }); val = undefined; break step;
              }
              case S.letstar:
                stack.push({ k: F.LETSTAR, binds: arr(x.cdr.car), i: 0, e: env, body: x.cdr.cdr, fresh: true }); val = undefined; break step;
              case S.letrec: {
                const bindings = arr(x.cdr.car);
                const ne = new Env(env);
                for (const b of bindings) ne.define(b.car, evaluate(b.cdr.car, ne));
                env = ne; x = new Pair(S.begin, x.cdr.cdr); continue main;
              }
              case S.quasi: val = quasi(x.cdr.car, env); break step;
              case S.do: {
                const specs = arr(x.cdr.car), test = x.cdr.cdr.car, body = x.cdr.cdr.cdr;
                let ne = new Env(env);
                for (const s of specs) ne.define(s.car, evaluate(s.cdr.car, env));
                while (evaluate(test.car, ne) === false) {
                  for (let b = body; b instanceof Pair; b = b.cdr) evaluate(b.car, ne);
                  const ne2 = new Env(env);
                  for (const s of specs) ne2.define(s.car, s.cdr.cdr instanceof Pair ? evaluate(s.cdr.cdr.car, ne) : ne.lookup(s.car));
                  ne = ne2;
                }
                val = UNSPEC; for (let b = test.cdr; b instanceof Pair; b = b.cdr) val = evaluate(b.car, ne);
                break step;
              }
            }
          }
          // application: operator first, then the operands left to right
          stack.push({ k: F.APP, vals: [], rest: x.cdr, env });
          x = op; continue main;
        }
        // ---- RETURN: hand val to the frame on top of the stack, until one needs another expression evaluated.
        ret: for (;;) {
          if (!stack.length) return val;
          const f = stack.pop();
          switch (f.k) {
            case F.IF: {
              const xx = f.x;
              if (val !== false) x = xx.cdr.cdr.car;
              else if (xx.cdr.cdr.cdr instanceof Pair) x = xx.cdr.cdr.cdr.car;
              else { val = UNSPEC; continue ret; }
              env = f.env; continue main;
            }
            case F.SEQ: {
              const r = f.rest;
              if (r.cdr !== NIL) { f.rest = r.cdr; stack.push(f); }
              x = r.car; env = f.env; continue main;
            }
            case F.DEF: {
              if (val instanceof Lambda && !val.name) val.name = f.target.name;
              f.env.define(f.target, val); val = sym(f.target.name); continue ret;
            }
            case F.SET: { f.env.set(f.target, val); val = UNSPEC; continue ret; }
            case F.APP: {
              f.vals.push(val);
              if (f.rest instanceof Pair) { x = f.rest.car; f.rest = f.rest.cdr; env = f.env; stack.push(f); continue main; }
              const fn = f.vals[0], args = f.vals.slice(1);
              if (fn instanceof Lambda) { const r = bindArgs(fn, args); x = r.body; env = r.env; continue main; }
              if (fn instanceof Primitive) { val = callPrim(fn, args); continue ret; }
              throw new SchemeError('The object ' + write(fn) + ' is not applicable.');
            }
            case F.COND: {
              let c = f.c;
              if (!f.fresh) {   // val is the value of the test of clause c.car
                const clause = c.car;
                if (val !== false) {
                  if (clause.cdr instanceof Pair && clause.cdr.car === S.arrow) { stack.push({ k: F.ARROW, t: val }); x = clause.cdr.cdr.car; env = f.env; continue main; }
                  if (clause.cdr === NIL) continue ret;   // (cond (test)) is the test value
                  x = new Pair(S.begin, clause.cdr); env = f.env; continue main;
                }
                c = c.cdr;
              }
              while (c instanceof Pair) {
                const clause = c.car;
                if (!(clause instanceof Pair)) throw ill(f.x);
                if (clause.car === S.else) { if (clause.cdr === NIL) { val = UNSPEC; continue ret; } x = new Pair(S.begin, clause.cdr); env = f.env; continue main; }
                f.c = c; f.fresh = false; stack.push(f); x = clause.car; env = f.env; continue main;
              }
              val = UNSPEC; continue ret;
            }
            case F.ARROW: { val = apply(val, [f.t]); continue ret; }
            case F.CASE: {
              const key = val, same = (d) => d === key || (typeof d === 'bigint' || typeof key === 'bigint') && typeof d !== 'object' && typeof key !== 'object' && Number(d) === Number(key);
              let hit = null;
              for (let c = f.x.cdr.cdr; c instanceof Pair; c = c.cdr) {
                const clause = c.car;
                if (!(clause instanceof Pair)) throw ill(f.x);
                if (clause.car === S.else || (clause.car instanceof Pair || clause.car === NIL) && arr(clause.car).some(same)) { hit = clause; break; }
              }
              if (!hit || hit.cdr === NIL) { val = UNSPEC; continue ret; }
              if (hit.cdr instanceof Pair && hit.cdr.car === S.arrow) { stack.push({ k: F.ARROW, t: key }); x = hit.cdr.cdr.car; env = f.env; continue main; }
              x = new Pair(S.begin, hit.cdr); env = f.env; continue main;
            }
            case F.AND: {
              if (val === false) continue ret;
              const r = f.rest;
              if (r.cdr !== NIL) { f.rest = r.cdr; stack.push(f); }
              x = r.car; env = f.env; continue main;
            }
            case F.OR: {
              if (val !== false) continue ret;
              const r = f.rest;
              if (r.cdr !== NIL) { f.rest = r.cdr; stack.push(f); }
              x = r.car; env = f.env; continue main;
            }
            case F.WHEN: {
              if ((val !== false) === f.when) { x = new Pair(S.begin, f.x.cdr.cdr); env = f.env; continue main; }
              val = UNSPEC; continue ret;
            }
            case F.LET: {   // inits are evaluated in the outer environment, then bound together
              if (!f.fresh) f.vals[f.i++] = val;
              f.fresh = false;
              while (f.i < f.binds.length) {
                const b = f.binds[f.i];
                if (b instanceof Pair) { stack.push(f); x = b.cdr.car; env = f.env; continue main; }
                f.vals[f.i++] = UNSPEC;
              }
              const ne = new Env(f.env);
              f.binds.forEach((b, i) => ne.define(b instanceof Pair ? b.car : b, f.vals[i]));
              env = ne; x = new Pair(S.begin, f.body); continue main;
            }
            case F.LETSTAR: {   // each binding gets its own frame, so closures keep the value they saw
              if (!f.fresh) { const ne = new Env(f.e); const b = f.binds[f.i++]; ne.define(b.car, val); f.e = ne; }
              f.fresh = false;
              if (f.i < f.binds.length) { stack.push(f); x = f.binds[f.i].cdr.car; env = f.e; continue main; }
              env = new Env(f.e); x = new Pair(S.begin, f.body); continue main;
            }
          }
        }
      }
    }
    function quasi(x, env) {
      if (!(x instanceof Pair)) return x;
      if (x.car === S.unquote) return evaluate(x.cdr.car, env);
      if (x.car instanceof Pair && x.car.car === S.splice) return fromArr(arr(evaluate(x.car.cdr.car, env)), quasi(x.cdr, env));
      return new Pair(quasi(x.car, env), quasi(x.cdr, env));
    }
    function makeLambda(params, body, env, name) {
      const ps = []; let rest = null, p = params;
      while (p instanceof Pair) { ps.push(p.car); p = p.cdr; }
      if (p !== NIL) rest = p;
      if (body === NIL) throw new SchemeError('Ill-formed special form: (lambda ' + write(params) + ')');
      return new Lambda(ps, rest, new Pair(S.begin, body), env, name);
    }
    function bindArgs(f, args) {
      const ne = new Env(f.env);
      if (args.length < f.params.length || (!f.rest && args.length > f.params.length))
        throw new SchemeError('The procedure ' + write(f) + ' has been called with ' + args.length + ' argument' + (args.length === 1 ? '' : 's') + '; it requires ' + (f.rest ? 'at least ' : 'exactly ') + f.params.length + ' argument' + (f.params.length === 1 ? '' : 's') + '.');
      for (let i = 0; i < f.params.length; i++) ne.define(f.params[i], args[i]);
      if (f.rest) ne.define(f.rest, fromArr(args.slice(f.params.length)));
      return { body: f.body, env: ne };
    }
    function callPrim(f, args) {
      if (args.length < f.min || (f.max >= 0 && args.length > f.max))
        throw new SchemeError('The procedure ' + write(f) + ' has been called with ' + args.length + ' argument' + (args.length === 1 ? '' : 's') + '; it requires ' + (f.min === f.max ? 'exactly ' + f.min : f.max < 0 ? 'at least ' + f.min : 'between ' + f.min + ' and ' + f.max) + ' argument' + ((f.min === 1 && f.max === 1) || (f.max < 0 && f.min === 1) ? '' : 's') + '.');
      return f.fn(args);
    }
    function apply(f, args) {
      if (f instanceof Primitive) return callPrim(f, args);
      if (f instanceof Lambda) {
        if (++depth > 20000) { depth = 0; throw new SchemeError(';Aborting!: maximum recursion depth exceeded'); }
        try { const r = bindArgs(f, args); return evaluate(r.body, r.env); } finally { depth--; }
      }
      throw new SchemeError('The object ' + write(f) + ' is not applicable.');
    }

    // ---------- primitives ----------
    const G = new Env(null);
    const def = (name, fn, min, max) => G.define(sym(name), new Primitive(name, fn, min === undefined ? 0 : min, max === undefined ? -1 : max));
    const numFold = (name, f, init) => def(name, (a) => { let r = a.length ? num(a[0], name) : init; for (let i = 1; i < a.length; i++) r = f(r, num(a[i], name)); return r; }, 0);
    numFold('+', add, 0); numFold('*', mul, 1);
    def('-', (a) => { if (a.length === 1) return sub(0, num(a[0], '-')); let r = num(a[0], '-'); for (let i = 1; i < a.length; i++) r = sub(r, num(a[i], '-')); return r; }, 1);
    const div = (r, d) => { if (d == 0) throw new SchemeError('Division by zero signalled by /.'); return (typeof r === 'bigint' || typeof d === 'bigint') && isInt(r) && isInt(d) && BigInt(r) % BigInt(d) === 0n ? norm(BigInt(r) / BigInt(d)) : Number(r) / Number(d); };
    def('/', (a) => { if (a.length === 1) return div(1, num(a[0], '/')); let r = num(a[0], '/'); for (let i = 1; i < a.length; i++) r = div(r, num(a[i], '/')); return r; }, 1);
    const cmp = (name, f) => def(name, (a) => { for (let i = 0; i + 1 < a.length; i++) if (!f(num(a[i], name), num(a[i + 1], name))) return false; return true; }, 1);
    cmp('=', (a, b) => a == b); cmp('<', (a, b) => a < b); cmp('>', (a, b) => a > b); cmp('<=', (a, b) => a <= b); cmp('>=', (a, b) => a >= b);
    const parseBigRadix = (s, radix) => { const neg = s[0] === '-'; let r = 0n; for (const ch of s.replace(/^[-+]/, '').toLowerCase()) r = r * BigInt(radix) + BigInt(parseInt(ch, radix)); return neg ? -r : r; };
    const intdiv = (name, a, b) => { num(a, name); num(b, name); if (b == 0) throw new SchemeError('Division by zero signalled by ' + name + '.'); };
    const bigOp = (a, b, big, flt) => (isInt(a) && isInt(b) && (typeof a === 'bigint' || typeof b === 'bigint')) ? norm(big(BigInt(a), BigInt(b))) : flt(Number(a), Number(b));
    def('quotient', ([a, b]) => { intdiv('quotient', a, b); return bigOp(a, b, (x, y) => x / y, (x, y) => Math.trunc(x / y)); }, 2, 2);
    def('remainder', ([a, b]) => { intdiv('remainder', a, b); return bigOp(a, b, (x, y) => x % y, (x, y) => x % y); }, 2, 2);
    def('modulo', ([a, b]) => { intdiv('modulo', a, b); return bigOp(a, b, (x, y) => ((x % y) + y) % y, (x, y) => ((x % y) + y) % y); }, 2, 2);
    def('abs', ([a]) => { num(a, 'abs'); return typeof a === 'bigint' ? (a < 0n ? -a : a) : Math.abs(a); }, 1, 1);
    const pick = (name, better) => def(name, (a) => { let r = num(a[0], name); for (let i = 1; i < a.length; i++) if (better(num(a[i], name), r)) r = a[i]; return r; }, 1);
    pick('min', (x, y) => x < y); pick('max', (x, y) => x > y);
    def('expt', ([a, b]) => {
      num(a, 'expt'); num(b, 'expt');
      if (isInt(a) && isInt(b) && b >= 0) {
        const f = Math.pow(Number(a), Number(b)); if (Number.isSafeInteger(f)) return f;
        if (Number(b) * Math.log2(Math.abs(Number(a)) || 1) <= 2e5) return norm(BigInt(a) ** BigInt(b));   // exact, unless absurdly large
        return f;
      }
      return Math.pow(Number(a), Number(b));
    }, 2, 2);
    def('sqrt', ([a]) => Math.sqrt(Number(num(a, 'sqrt'))), 1, 1); def('exp', ([a]) => Math.exp(Number(num(a, 'exp'))), 1, 1);
    def('log', ([a]) => Math.log(Number(num(a, 'log'))), 1, 1); def('sin', ([a]) => Math.sin(Number(num(a, 'sin'))), 1, 1); def('cos', ([a]) => Math.cos(Number(num(a, 'cos'))), 1, 1);
    def('atan', (a) => a.length === 2 ? Math.atan2(Number(num(a[0], 'atan')), Number(num(a[1], 'atan'))) : Math.atan(Number(num(a[0], 'atan'))), 1, 2);
    const whole = (name, f) => def(name, ([a]) => typeof num(a, name) === 'bigint' ? a : f(a), 1, 1);   // a BigInt is already a whole number
    whole('floor', Math.floor); whole('ceiling', Math.ceil); whole('truncate', Math.trunc);
    whole('round', (a) => { const r = Math.round(a); return (Math.abs(a % 1) === 0.5 && r % 2 !== 0) ? r - 1 : r; });
    def('gcd', (a) => { const g = (x, y) => y == 0 ? (x < 0 ? -x : x) : g(y, bigOp(x, y, (p, q) => p % q, (p, q) => p % q)); return a.reduce((acc, v) => g(acc, num(v, 'gcd')), 0); }, 0);
    def('square', ([a]) => mul(num(a, 'square'), a), 1, 1); def('cube', ([a]) => mul(mul(num(a, 'cube'), a), a), 1, 1);
    def('1+', ([a]) => add(num(a, '1+'), 1), 1, 1); def('-1+', ([a]) => sub(num(a, '-1+'), 1), 1, 1); def('1-', ([a]) => sub(num(a, '1-'), 1), 1, 1);
    def('random', ([a]) => { num(a, 'random'); if (a <= 0) throw new SchemeError('The object ' + write(a) + ', passed as the first argument to random, is not in the correct range.'); return isInt(a) ? (typeof a === 'bigint' ? norm(BigInt(Math.floor(Math.random() * Number(a)))) : Math.floor(Math.random() * a)) : Math.random() * a; }, 1, 1);
    def('exact->inexact', ([a]) => Number(num(a, 'exact->inexact')), 1, 1); def('inexact->exact', ([a]) => num(a, 'inexact->exact'), 1, 1); def('exact', ([a]) => a, 1, 1); def('inexact', ([a]) => typeof a === 'bigint' ? Number(a) : a, 1, 1);
    def('number?', ([a]) => typeof a === 'number' || typeof a === 'bigint', 1, 1); def('integer?', ([a]) => typeof a === 'bigint' || Number.isInteger(a), 1, 1); def('real?', ([a]) => typeof a === 'number' || typeof a === 'bigint', 1, 1);
    def('zero?', ([a]) => num(a, 'zero?') == 0, 1, 1); def('positive?', ([a]) => num(a, 'positive?') > 0, 1, 1); def('negative?', ([a]) => num(a, 'negative?') < 0, 1, 1);
    const parity = (a, who) => typeof num(a, who) === 'bigint' ? a % 2n : a % 2;
    def('even?', ([a]) => parity(a, 'even?') == 0, 1, 1); def('odd?', ([a]) => parity(a, 'odd?') != 0, 1, 1);
    def('not', ([a]) => a === false, 1, 1);
    def('eq?', ([a, b]) => a === b || (typeof a === 'number' && a === b) || (typeof a === 'string' && a === b), 2, 2);
    def('eqv?', ([a, b]) => a === b, 2, 2);
    const equal = (a, b) => { while (a instanceof Pair && b instanceof Pair) { if (!equal(a.car, b.car)) return false; a = a.cdr; b = b.cdr; } return a === b; };
    def('equal?', ([a, b]) => equal(a, b), 2, 2);
    def('cons', ([a, b]) => new Pair(a, b), 2, 2);
    def('car', ([a]) => pair(a, 'car').car, 1, 1); def('cdr', ([a]) => pair(a, 'cdr').cdr, 1, 1);
    const paths = []; for (let len = 2; len <= 4; len++) for (let m = 0; m < (1 << len); m++) { let p = ''; for (let b = len - 1; b >= 0; b--) p += (m >> b) & 1 ? 'd' : 'a'; paths.push(p); }
    for (const path of paths) {   // every c[ad]r from two to four letters deep, as in MIT Scheme
      const name = 'c' + path + 'r';
      def(name, ([a]) => { let v = a; for (let i = path.length - 1; i >= 0; i--) v = path[i] === 'a' ? pair(v, name).car : pair(v, name).cdr; return v; }, 1, 1);
    }
    def('set-car!', ([p, v]) => { pair(p, 'set-car!').car = v; return UNSPEC; }, 2, 2); def('set-cdr!', ([p, v]) => { pair(p, 'set-cdr!').cdr = v; return UNSPEC; }, 2, 2);
    def('list', (a) => fromArr(a), 0); def('cons*', (a) => { let r = a[a.length - 1]; for (let i = a.length - 2; i >= 0; i--) r = new Pair(a[i], r); return r; }, 1);
    def('pair?', ([a]) => a instanceof Pair, 1, 1); def('null?', ([a]) => a === NIL, 1, 1); def('list?', ([a]) => isList(a), 1, 1);
    def('symbol?', ([a]) => a instanceof Sym, 1, 1); def('string?', ([a]) => typeof a === 'string', 1, 1); def('boolean?', ([a]) => typeof a === 'boolean', 1, 1);
    def('procedure?', ([a]) => a instanceof Lambda || a instanceof Primitive, 1, 1);
    def('length', ([a]) => { if (!isList(a)) throw new SchemeError('The object ' + write(a) + ', passed as the first argument to length, is not the correct type.'); return arr(a).length; }, 1, 1);
    def('append', (a) => { if (!a.length) return NIL; let r = a[a.length - 1]; for (let i = a.length - 2; i >= 0; i--) { const items = arr(a[i]); for (let j = items.length - 1; j >= 0; j--) r = new Pair(items[j], r); } return r; }, 0);
    def('reverse', ([a]) => { let r = NIL; for (const x of arr(a)) r = new Pair(x, r); return r; }, 1, 1);
    def('list-ref', ([l, k]) => { let p = l; for (let i = 0; i < num(k, 'list-ref'); i++) p = pair(p, 'list-ref').cdr; return pair(p, 'list-ref').car; }, 2, 2);
    def('list-tail', ([l, k]) => { let p = l; for (let i = 0; i < num(k, 'list-tail'); i++) p = pair(p, 'list-tail').cdr; return p; }, 2, 2);
    def('member', ([x, l]) => { let p = l; while (p instanceof Pair) { if (equal(p.car, x)) return p; p = p.cdr; } return false; }, 2, 2);
    def('memq', ([x, l]) => { let p = l; while (p instanceof Pair) { if (p.car === x) return p; p = p.cdr; } return false; }, 2, 2);
    def('assoc', ([x, l]) => { let p = l; while (p instanceof Pair) { if (p.car instanceof Pair && equal(p.car.car, x)) return p.car; p = p.cdr; } return false; }, 2, 2);
    def('assq', ([x, l]) => { let p = l; while (p instanceof Pair) { if (p.car instanceof Pair && p.car.car === x) return p.car; p = p.cdr; } return false; }, 2, 2);
    def('list-copy', ([l]) => fromArr(arr(l)), 1, 1);
    def('sort', ([seq, less]) => {   // (sort list <): stable merge sort, as in MIT Scheme
      const xs = arr(seq);
      const merge = (a, b) => { const out = []; let i = 0, j = 0; while (i < a.length && j < b.length) { if (apply(less, [b[j], a[i]]) !== false) out.push(b[j++]); else out.push(a[i++]); } while (i < a.length) out.push(a[i++]); while (j < b.length) out.push(b[j++]); return out; };
      const msort = (v) => v.length < 2 ? v : merge(msort(v.slice(0, v.length >> 1)), msort(v.slice(v.length >> 1)));
      return fromArr(msort(xs));
    }, 2, 2);
    def('last-pair', ([l]) => { let p = pair(l, 'last-pair'); while (p.cdr instanceof Pair) p = p.cdr; return p; }, 1, 1);
    const mem = (name, eq) => def(name, ([x, l]) => { let p = l; while (p instanceof Pair) { if (eq(p.car, x)) return p; p = p.cdr; } return false; }, 2, 2);
    mem('memq', (a, b) => a === b); mem('memv', (a, b) => a === b); mem('member', equal);
    const ass = (name, eq) => def(name, ([x, l]) => { let p = l; while (p instanceof Pair) { if (p.car instanceof Pair && eq(p.car.car, x)) return p.car; p = p.cdr; } return false; }, 2, 2);
    ass('assq', (a, b) => a === b); ass('assv', (a, b) => a === b); ass('assoc', equal);
    def('map', (a) => { const f = a[0], lists = a.slice(1).map(l => arr(l)); const n = Math.min(...lists.map(l => l.length)); const out = []; for (let i = 0; i < n; i++) out.push(apply(f, lists.map(l => l[i]))); return fromArr(out); }, 2);
    def('for-each', (a) => { const f = a[0], lists = a.slice(1).map(l => arr(l)); const n = Math.min(...lists.map(l => l.length)); for (let i = 0; i < n; i++) apply(f, lists.map(l => l[i])); return UNSPEC; }, 2);
    def('filter', ([f, l]) => fromArr(arr(l).filter(x => apply(f, [x]) !== false)), 2, 2);
    def('reduce', ([f, init, l]) => { const xs = arr(l); if (!xs.length) return init; let r = xs[0]; for (let i = 1; i < xs.length; i++) r = apply(f, [xs[i], r]); return r; }, 3, 3);
    def('fold-left', ([f, init, l]) => { let r = init; for (const x of arr(l)) r = apply(f, [r, x]); return r; }, 3, 3);
    def('fold-right', ([f, init, l]) => { let r = init; const xs = arr(l); for (let i = xs.length - 1; i >= 0; i--) r = apply(f, [xs[i], r]); return r; }, 3, 3);
    // eval: (eval expr env) evaluates a data structure as code. The environment argument is accepted
    // (as MIT Scheme requires) but expressions are always evaluated in the global environment.
    G.define(sym('system-global-environment'), G);
    def('eval', ([x]) => evaluate(x, G), 1, 2);
    def('apply', (a) => { const f = a[0]; const args = a.slice(1, -1).concat(arr(a[a.length - 1])); return apply(f, args); }, 2);
    def('iota', ([n, start, step]) => { const s = start === undefined ? 0 : start, st = step === undefined ? 1 : step; const out = []; if (num(n, 'iota') > MAX_ALLOC) throw tooBig(); for (let i = 0; i < num(n, 'iota'); i++) out.push(s + i * st); return fromArr(out); }, 1, 3);
    def('display', ([x]) => { out(write(x, true)); return UNSPEC; }, 1, 2);
    def('write', ([x]) => { out(write(x, false)); return UNSPEC; }, 1, 2);
    def('newline', () => { out('\n'); return UNSPEC; }, 0, 1);
    def('write-line', ([x]) => { out(write(x, false) + '\n'); return UNSPEC; }, 1, 2);
    // Standard input, for programs that are handed text (the Bot Arena): opts.stdin is a string. read-line gives the rest of the current line,
    // read the next number, word or string (like MIT Scheme, read leaves the rest of its line, so a read-line straight after it gives ""). Both give (eof-object) at the end.
    const stdin = typeof opts.stdin === 'string' ? opts.stdin : ''; let inPos = 0;
    const EOF = { toString() { return '#[eof]'; } };
    def('eof-object', () => EOF, 0, 0); def('eof-object?', ([x]) => x === EOF, 1, 1);
    def('read-line', () => { if (inPos >= stdin.length) return EOF; const j = stdin.indexOf('\n', inPos), line = stdin.slice(inPos, j < 0 ? stdin.length : j); inPos = j < 0 ? stdin.length : j + 1; return line; }, 0, 1);
    def('read', () => {
      while (inPos < stdin.length && /\s/.test(stdin[inPos])) inPos++;
      if (inPos >= stdin.length) return EOF;
      const m = /^(?:"(?:[^"\\]|\\.)*"|[^\s()"]+)/.exec(stdin.slice(inPos));
      if (!m) throw new SchemeError('read: cannot read this input here (it reads one number, word or string)');
      inPos += m[0].length;
      return parseAll(m[0])[0];
    }, 0, 1);
    def('error', (a) => { throw new SchemeError(a.map((x, i) => write(x, i === 0)).join(' ')); }, 1);
    def('number->string', ([n, radix]) => radix && radix !== 10 && (typeof num(n, 'number->string') === 'bigint' || Number.isInteger(n)) ? n.toString(radix) : fmtNum(num(n, 'number->string')), 1, 2);
    def('string->number', ([s, radix]) => {
      if (typeof s !== 'string') throw new SchemeError('The object ' + write(s) + ', passed as the first argument to string->number, is not the correct type.');
      s = s.trim();
      if (radix && radix !== 10) { const ok = new RegExp('^[-+]?[' + '0123456789abcdefghijklmnopqrstuvwxyz'.slice(0, radix) + ']+$', 'i').test(s); return ok ? (s.length > 10 ? norm(parseBigRadix(s, radix)) : parseInt(s, radix)) : false; }
      if (/^[-+]?\d+$/.test(s)) { const n = parseFloat(s); return Number.isSafeInteger(n) ? n : BigInt(s); }
      if (/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s)) return parseFloat(s);
      if (/^[-+]?\d+\/\d+$/.test(s)) { const [a, b] = s.split('/'); return parseFloat(a) / parseFloat(b); }
      return false;
    }, 1, 2);
    const str = (x, who) => { if (typeof x !== 'string') throw new SchemeError('The object ' + write(x) + ', passed as an argument to ' + who + ', is not the correct type.'); return x; };
    const strCmp = (name, ok) => def(name, (a) => { a.forEach((s) => str(s, name)); for (let i = 1; i < a.length; i++) if (!ok(a[i - 1], a[i])) return false; return true; }, 1);
    def('symbol->string', ([s]) => { if (!(s instanceof Sym)) throw new SchemeError('The object ' + write(s) + ', passed as the first argument to symbol->string, is not the correct type.'); return s.name; }, 1, 1);
    def('string->symbol', ([s]) => sym(str(s, 'string->symbol')), 1, 1);
    def('string-append', (a) => { const ss = a.map((s) => str(s, 'string-append')); if (ss.reduce((n, s) => n + s.length, 0) > MAX_STR) throw tooBig(); return ss.join(''); }, 0); def('string-length', ([s]) => str(s, 'string-length').length, 1, 1);
    strCmp('string=?', (a, b) => a === b); strCmp('string<?', (a, b) => a < b); strCmp('string>?', (a, b) => a > b);
    strCmp('string<=?', (a, b) => a <= b); strCmp('string>=?', (a, b) => a >= b);
    def('string-ref', ([s, k]) => { str(s, 'string-ref'); if (!Number.isInteger(k) || k < 0 || k >= s.length) throw new SchemeError('The object ' + write(k) + ', passed as the second argument to string-ref, is not in the correct range.'); return s[k]; }, 2, 2);
    def('substring', ([s, a, b]) => { if (typeof s !== 'string') throw new SchemeError('The object ' + write(s) + ', passed as the first argument to substring, is not the correct type.'); const e = b === undefined ? s.length : b; if (!Number.isInteger(a) || a < 0 || a > s.length) throw new SchemeError('The object ' + write(a) + ', passed as the second argument to substring, is not in the correct range.'); if (!Number.isInteger(e) || e < a || e > s.length) throw new SchemeError('The object ' + write(e) + ', passed as the third argument to substring, is not in the correct range.'); return s.substring(a, e); }, 2, 3);
    def('string-upcase', ([s]) => str(s, 'string-upcase').toUpperCase(), 1, 1); def('string-downcase', ([s]) => str(s, 'string-downcase').toLowerCase(), 1, 1);
    def('list->string', ([l]) => arr(l).join(''), 1, 1); def('string->list', ([s]) => fromArr(str(s, 'string->list').split('')), 1, 1);
    def('runtime', () => Date.now() / 1000, 0, 0); def('real-time', () => Date.now(), 0, 0);
    def('void', () => UNSPEC, 0);
    def('assert', ([x]) => { if (x === false) throw new SchemeError('Assertion failed'); return UNSPEC; }, 1, 1);
    G.define(sym('nil'), NIL); G.define(sym('the-empty-stream'), NIL);

    // ---------- public surface ----------
    function run(src, env) {
      env = env || G;
      const forms = parseAll(src);
      const results = [];
      for (const f of forms) {
        const v = evaluate(f, env);
        results.push({ form: f, value: v });
      }
      return results;
    }
    return { run, evaluate, apply, G, output, write, parseAll, list, arr, Pair, NIL, UNSPEC, Sym, sym, Lambda, Primitive, SchemeError, isList, reset: () => { steps = 0; depth = 0; } };
  }

  /** Runs source in a fresh interpreter. Returns {ok, results:[{form,value,text}], output, error}. */
  function runProgram(src, opts) {
    const it = makeEvaluator(opts);
    let error = null; const results = [];
    try {
      for (const f of it.parseAll(src)) {
        const v = it.evaluate(f, it.G);
        results.push({ form: f, value: v, text: write(v) });
      }
    } catch (e) {
      if (e instanceof RangeError) error = ';Aborting!: maximum recursion depth exceeded';
      else error = e instanceof SchemeError ? e.message : 'Internal error: ' + (e && e.message ? e.message : String(e));
    }
    return { ok: !error, results, output: it.output.join(''), error, it };
  }

  return { makeEvaluator, runProgram, write, parseAll, Pair, NIL, UNSPEC, Sym, sym, list, Lambda, Primitive, SchemeError, tokenize };
});
