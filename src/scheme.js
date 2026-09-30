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
    do: sym('do'), splice: sym('unquote-splicing')
  };

  const list = (...xs) => { let r = NIL; for (let i = xs.length - 1; i >= 0; i--) r = new Pair(xs[i], r); return r; };
  const fromArr = (xs, tail) => { let r = tail === undefined ? NIL : tail; for (let i = xs.length - 1; i >= 0; i--) r = new Pair(xs[i], r); return r; };
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
      if (typeof t === 'object') return t.str;
      if (t === '(') {
        const items = []; let tail = NIL;
        while (true) {
          if (pos >= toks.length) throw new SchemeError('Unexpected end of input — missing a closing parenthesis?');
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
      if (t === '#t' || t === '#true' || t === 'true') return true;
      if (t === '#f' || t === '#false' || t === 'false') return false;
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
    if (Number.isInteger(x)) return String(x);
    if (!isFinite(x)) return x > 0 ? '+inf' : x < 0 ? '-inf' : 'nan';
    const intDigits = Math.floor(Math.abs(x)).toString().length;
    let s = String(parseFloat(x.toPrecision(Math.max(12, intDigits + 1))));   // 12 significant digits, but never fewer than the whole part plus one decimal
    if (s.startsWith('0.')) s = s.slice(1); else if (s.startsWith('-0.')) s = '-' + s.slice(2);
    if (!/[.e]/.test(s)) s += '.';
    return s;
  }
  function write(x, display) {
    if (typeof x === 'number') return fmtNum(x);
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
  const num = (x, who) => { if (typeof x !== 'number') throw new SchemeError('The object ' + write(x) + ', passed as an argument to ' + who + ', is not the correct type.'); return x; };
  const pair = (x, who) => { if (!(x instanceof Pair)) throw new SchemeError('The object ' + write(x) + ', passed as the first argument to ' + who + ', is not the correct type.'); return x; };

  function makeEvaluator(opts) {
    opts = opts || {};
    let steps = 0; const limit = opts.stepLimit || 3e6;
    const output = [];
    const out = (s) => { output.push(s); if (opts.onOutput) opts.onOutput(s); };
    let depth = 0;

    function evaluate(x, env) {
      while (true) {
        if (++steps > limit) throw new SchemeError(';Aborting!: program ran for too long (is there an infinite loop?)');
        if (x instanceof Sym) return env.lookup(x);
        if (!(x instanceof Pair)) return x === NIL ? (() => { throw new SchemeError('Combination must have at least one subexpression: ()'); })() : x;
        const op = x.car;
        if (op instanceof Sym) {
          switch (op) {
            case S.quote: return x.cdr.car;
            case S.if: {
              if (!(x.cdr instanceof Pair && x.cdr.cdr instanceof Pair)) throw new SchemeError('Ill-formed special form: ' + write(x));
              const t = evaluate(x.cdr.car, env);
              if (t !== false) x = x.cdr.cdr.car;
              else if (x.cdr.cdr.cdr instanceof Pair) x = x.cdr.cdr.cdr.car;
              else return UNSPEC;
              continue;
            }
            case S.define: {
              const target = x.cdr.car;
              if (target instanceof Pair) { // (define (f . args) body...)
                const name = target.car;
                const lam = makeLambda(target.cdr, x.cdr.cdr, env, name.name);
                env.define(name, lam); return sym(name.name);
              }
              if (!(target instanceof Sym)) throw new SchemeError('Variable required in this context: ' + write(target));
              const v = x.cdr.cdr instanceof Pair ? evaluate(x.cdr.cdr.car, env) : UNSPEC;
              if (v instanceof Lambda && !v.name) v.name = target.name;
              env.define(target, v); return sym(target.name);
            }
            case S.set: { if (!(x.cdr instanceof Pair && x.cdr.cdr instanceof Pair)) throw new SchemeError('Ill-formed special form: ' + write(x)); env.set(x.cdr.car, evaluate(x.cdr.cdr.car, env)); return UNSPEC; }
            case S.lambda: return makeLambda(x.cdr.car, x.cdr.cdr, env, null);
            case S.begin: {
              let b = x.cdr; if (b === NIL) return UNSPEC;
              while (b.cdr !== NIL) { evaluate(b.car, env); b = b.cdr; }
              x = b.car; continue;
            }
            case S.cond: {
              let c = x.cdr, matched = false;
              while (c instanceof Pair) {
                const clause = c.car;
                if (!(clause instanceof Pair)) throw new SchemeError('Ill-formed special form: ' + write(x));
                if (clause.car === S.else) { matched = true; }
                else {
                  const t = evaluate(clause.car, env);
                  if (t !== false) {
                    if (clause.cdr instanceof Pair && clause.cdr.car === S.arrow) { const f = evaluate(clause.cdr.cdr.car, env); return apply(f, [t]); }
                    if (clause.cdr === NIL) return t;
                    matched = true;
                  }
                }
                if (matched) {
                  let b = clause.cdr; if (b === NIL) return UNSPEC;
                  while (b.cdr !== NIL) { evaluate(b.car, env); b = b.cdr; }
                  x = b.car; break;
                }
                c = c.cdr;
              }
              if (!matched) return UNSPEC;
              continue;
            }
            case S.and: {
              let c = x.cdr; if (c === NIL) return true;
              while (c.cdr !== NIL) { if (evaluate(c.car, env) === false) return false; c = c.cdr; }
              x = c.car; continue;
            }
            case S.or: {
              let c = x.cdr; if (c === NIL) return false;
              while (c.cdr !== NIL) { const v = evaluate(c.car, env); if (v !== false) return v; c = c.cdr; }
              x = c.car; continue;
            }
            case S.when: case S.unless: {
              const t = evaluate(x.cdr.car, env);
              if ((t !== false) === (op === S.when)) { x = new Pair(S.begin, x.cdr.cdr); continue; }
              return UNSPEC;
            }
            case S.let: {
              if (x.cdr.car instanceof Sym) { // named let
                const name = x.cdr.car, bindings = arr(x.cdr.cdr.car), body = x.cdr.cdr.cdr;
                const ne = new Env(env);
                const lam = makeLambda(list(...bindings.map(b => b.car)), body, ne, name.name);
                ne.define(name, lam);
                const args = bindings.map(b => evaluate(b.cdr.car, env));
                const r = bindArgs(lam, args); x = r.body; env = r.env; continue;
              }
              const bindings = arr(x.cdr.car);
              const ne = new Env(env);
              for (const b of bindings) { if (b instanceof Pair) ne.define(b.car, evaluate(b.cdr.car, env)); else ne.define(b, UNSPEC); }
              env = ne; x = new Pair(S.begin, x.cdr.cdr); continue;
            }
            case S.letstar: {
              let e = env;
              for (const b of arr(x.cdr.car)) { const ne = new Env(e); ne.define(b.car, evaluate(b.cdr.car, e)); e = ne; }
              env = new Env(e); x = new Pair(S.begin, x.cdr.cdr); continue;
            }
            case S.letrec: {
              const bindings = arr(x.cdr.car);
              const ne = new Env(env);
              for (const b of bindings) ne.define(b.car, evaluate(b.cdr.car, ne));
              env = ne; x = new Pair(S.begin, x.cdr.cdr); continue;
            }
            case S.quasi: return quasi(x.cdr.car, env);
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
              let r = UNSPEC; for (let b = test.cdr; b instanceof Pair; b = b.cdr) r = evaluate(b.car, ne);
              return r;
            }
          }
        }
        // application
        const f = evaluate(op, env);
        const args = []; let a = x.cdr;
        while (a instanceof Pair) { args.push(evaluate(a.car, env)); a = a.cdr; }
        if (f instanceof Lambda) { const r = bindArgs(f, args); x = r.body; env = r.env; continue; }
        if (f instanceof Primitive) return callPrim(f, args);
        throw new SchemeError('The object ' + write(f) + ' is not applicable.');
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
    numFold('+', (a, b) => a + b, 0); numFold('*', (a, b) => a * b, 1);
    def('-', (a) => { if (a.length === 1) return -num(a[0], '-'); let r = num(a[0], '-'); for (let i = 1; i < a.length; i++) r -= num(a[i], '-'); return r; }, 1);
    def('/', (a) => { if (a.length === 1) { if (a[0] === 0) throw new SchemeError('Division by zero signalled by /.'); return 1 / num(a[0], '/'); } let r = num(a[0], '/'); for (let i = 1; i < a.length; i++) { if (num(a[i], '/') === 0) throw new SchemeError('Division by zero signalled by /.'); r /= a[i]; } return r; }, 1);
    const cmp = (name, f) => def(name, (a) => { for (let i = 0; i + 1 < a.length; i++) if (!f(num(a[i], name), num(a[i + 1], name))) return false; return true; }, 1);
    cmp('=', (a, b) => a === b); cmp('<', (a, b) => a < b); cmp('>', (a, b) => a > b); cmp('<=', (a, b) => a <= b); cmp('>=', (a, b) => a >= b);
    const intdiv = (name, a, b) => { num(a, name); num(b, name); if (b === 0) throw new SchemeError('Division by zero signalled by ' + name + '.'); };
    def('quotient', ([a, b]) => { intdiv('quotient', a, b); return Math.trunc(a / b); }, 2, 2);
    def('remainder', ([a, b]) => { intdiv('remainder', a, b); return a % b; }, 2, 2);
    def('modulo', ([a, b]) => { intdiv('modulo', a, b); return ((a % b) + b) % b; }, 2, 2);
    def('abs', ([a]) => Math.abs(num(a, 'abs')), 1, 1);
    def('min', (a) => Math.min(...a.map(x => num(x, 'min'))), 1); def('max', (a) => Math.max(...a.map(x => num(x, 'max'))), 1);
    def('expt', ([a, b]) => Math.pow(num(a, 'expt'), num(b, 'expt')), 2, 2);
    def('sqrt', ([a]) => Math.sqrt(num(a, 'sqrt')), 1, 1); def('exp', ([a]) => Math.exp(num(a, 'exp')), 1, 1);
    def('log', ([a]) => Math.log(num(a, 'log')), 1, 1); def('sin', ([a]) => Math.sin(num(a, 'sin')), 1, 1); def('cos', ([a]) => Math.cos(num(a, 'cos')), 1, 1);
    def('atan', (a) => a.length === 2 ? Math.atan2(num(a[0], 'atan'), num(a[1], 'atan')) : Math.atan(num(a[0], 'atan')), 1, 2);
    def('floor', ([a]) => Math.floor(num(a, 'floor')), 1, 1); def('ceiling', ([a]) => Math.ceil(num(a, 'ceiling')), 1, 1);
    def('round', ([a]) => { num(a, 'round'); const r = Math.round(a); return (Math.abs(a % 1) === 0.5 && r % 2 !== 0) ? r - 1 : r; }, 1, 1);
    def('truncate', ([a]) => Math.trunc(num(a, 'truncate')), 1, 1);
    def('gcd', (a) => { const g = (x, y) => y ? g(y, x % y) : Math.abs(x); return a.reduce((acc, v) => g(acc, num(v, 'gcd')), 0); }, 0);
    def('square', ([a]) => num(a, 'square') * a, 1, 1); def('cube', ([a]) => num(a, 'cube') * a * a, 1, 1);
    def('1+', ([a]) => num(a, '1+') + 1, 1, 1); def('-1+', ([a]) => num(a, '-1+') - 1, 1, 1); def('1-', ([a]) => num(a, '1-') - 1, 1, 1);
    def('random', ([a]) => Number.isInteger(num(a, 'random')) ? Math.floor(Math.random() * a) : Math.random() * a, 1, 1);
    def('exact->inexact', ([a]) => num(a, 'exact->inexact'), 1, 1); def('inexact->exact', ([a]) => num(a, 'inexact->exact'), 1, 1); def('exact', ([a]) => a, 1, 1); def('inexact', ([a]) => a, 1, 1);
    def('number?', ([a]) => typeof a === 'number', 1, 1); def('integer?', ([a]) => Number.isInteger(a), 1, 1); def('real?', ([a]) => typeof a === 'number', 1, 1);
    def('zero?', ([a]) => num(a, 'zero?') === 0, 1, 1); def('positive?', ([a]) => num(a, 'positive?') > 0, 1, 1); def('negative?', ([a]) => num(a, 'negative?') < 0, 1, 1);
    def('even?', ([a]) => num(a, 'even?') % 2 === 0, 1, 1); def('odd?', ([a]) => num(a, 'odd?') % 2 !== 0, 1, 1);
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
    def('iota', ([n, start, step]) => { const s = start === undefined ? 0 : start, st = step === undefined ? 1 : step; const out = []; for (let i = 0; i < num(n, 'iota'); i++) out.push(s + i * st); return fromArr(out); }, 1, 3);
    def('display', ([x]) => { out(write(x, true)); return UNSPEC; }, 1, 2);
    def('write', ([x]) => { out(write(x, false)); return UNSPEC; }, 1, 2);
    def('newline', () => { out('\n'); return UNSPEC; }, 0, 1);
    def('write-line', ([x]) => { out(write(x, false) + '\n'); return UNSPEC; }, 1, 2);
    def('error', (a) => { throw new SchemeError(a.map((x, i) => write(x, i === 0)).join(' ')); }, 1);
    def('number->string', ([n, radix]) => radix && radix !== 10 && Number.isInteger(num(n, 'number->string')) ? n.toString(radix) : fmtNum(num(n, 'number->string')), 1, 2);
    def('string->number', ([s, radix]) => {
      if (typeof s !== 'string') throw new SchemeError('The object ' + write(s) + ', passed as the first argument to string->number, is not the correct type.');
      s = s.trim();
      if (radix && radix !== 10) { const ok = new RegExp('^[-+]?[' + '0123456789abcdefghijklmnopqrstuvwxyz'.slice(0, radix) + ']+$', 'i').test(s); return ok ? parseInt(s, radix) : false; }
      if (/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s)) return parseFloat(s);
      if (/^[-+]?\d+\/\d+$/.test(s)) { const [a, b] = s.split('/'); return parseFloat(a) / parseFloat(b); }
      return false;
    }, 1, 2);
    def('symbol->string', ([s]) => s.name, 1, 1); def('string->symbol', ([s]) => sym(s), 1, 1);
    def('string-append', (a) => a.join(''), 0); def('string-length', ([s]) => s.length, 1, 1);
    def('string=?', ([a, b]) => a === b, 2, 2); def('string<?', ([a, b]) => a < b, 2, 2);
    def('substring', ([s, a, b]) => { if (typeof s !== 'string') throw new SchemeError('The object ' + write(s) + ', passed as the first argument to substring, is not the correct type.'); const e = b === undefined ? s.length : b; if (!Number.isInteger(a) || a < 0 || a > s.length) throw new SchemeError('The object ' + write(a) + ', passed as the second argument to substring, is not in the correct range.'); if (!Number.isInteger(e) || e < a || e > s.length) throw new SchemeError('The object ' + write(e) + ', passed as the third argument to substring, is not in the correct range.'); return s.substring(a, e); }, 2, 3);
    def('string-upcase', ([s]) => s.toUpperCase(), 1, 1); def('string-downcase', ([s]) => s.toLowerCase(), 1, 1);
    def('list->string', ([l]) => arr(l).join(''), 1, 1); def('string->list', ([s]) => fromArr(s.split('')), 1, 1);
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
