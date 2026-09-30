/* The substitution model of evaluation (SICP §1.1.5), as a small-step rewriter for the
   site's Scheme. Given a program, it registers the defines with a real interpreter and
   then reduces every other top-level expression one step at a time, producing a list of
   rewritten expressions with the reduced subexpression marked. Exposed as window.SUBST
   (browser) or module.exports (node). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./scheme.js'));
  else root.SUBST = factory(root.Scheme);
})(typeof self !== 'undefined' ? self : this, function (Scheme) {
  const { Pair, NIL, UNSPEC, Sym, sym, Lambda, Primitive, SchemeError } = Scheme;
  const S = {};
  for (const n of ['quote', 'define', 'lambda', 'if', 'cond', 'else', 'let', 'and', 'or', 'begin', 'set!', 'let*', 'letrec', 'do', 'when', 'unless', 'quasiquote', 'delay', 'cons-stream', 'define-syntax', 'case', '=>', 'unquote', 'unquote-splicing']) S[n] = sym(n);
  const OPAQUE = new Set([S['set!'], S['let*'], S.letrec, S.do, S.when, S.unless, S.quasiquote, S.delay, S['cons-stream'], S.case]);
  const HIGHER = new Set(['map', 'filter', 'reduce', 'fold-left', 'fold-right', 'fold', 'for-each', 'apply', 'sort', 'accumulate', 'assoc', 'member', 'vector-map', 'list-sort', 'delete', 'find', 'any', 'every', 'assq', 'memq'].map(sym));

  /** A computed value that must not be read as an expression: lists, symbols, procedures, unspecified. */
  class Datum { constructor(v) { this.v = v; } }
  const arr = (p) => { const out = []; while (p instanceof Pair) { out.push(p.car); p = p.cdr; } return out; };
  const list = (xs) => { let r = NIL; for (let i = xs.length - 1; i >= 0; i--) r = new Pair(xs[i], r); return r; };
  const esc = (s) => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

  function create(opts) {
    opts = opts || {};
    const it = Scheme.makeEvaluator({ onOutput: opts.onOutput, stepLimit: 5e6 });
    const G = it.G;
    const maxSteps = opts.maxSteps || 400;
    let uid = 0;
    const without2 = (m, names) => new Map([...m].filter(([k]) => !names.includes(k)));
    const isLambdaForm = (x) => x instanceof Pair && x.car === S.lambda;
    const globalProc = (s) => { try { const v = G.lookup(s); return (v instanceof Lambda || v instanceof Primitive) ? v : null; } catch (e) { return null; } };
    const isValue = (x) => typeof x === 'number' || typeof x === 'boolean' || typeof x === 'string' || x instanceof Datum || x === NIL || isLambdaForm(x) || (x instanceof Sym && !!globalProc(x));

    // expression -> raw Scheme value (for handing to primitives / the interpreter)
    const toRaw = (x) => x instanceof Datum ? x.v : (x instanceof Sym ? G.lookup(x) : (isLambdaForm(x) ? it.evaluate(x, G) : x));
    const fromRaw = (v) => (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string' || v === NIL) ? v : new Datum(v);
    // expression with Datums turned back into quoted data, so the interpreter can evaluate it
    const toEvalable = (x) => x instanceof Datum ? (x.v instanceof Pair || x.v instanceof Sym || x.v === NIL ? list([S.quote, x.v]) : x.v) : (x instanceof Pair ? new Pair(toEvalable(x.car), toEvalable(x.cdr)) : x);

    /** Replace param symbols by args inside body, respecting shadowing by inner lambda/let. */
    function substitute(x, map) {
      if (x instanceof Sym) return map.has(x) ? map.get(x) : x;
      if (!(x instanceof Pair)) return x;
      if (x.car === S.quote) return x;
      if (x.car === S.lambda && x.cdr instanceof Pair) {
        const params = x.cdr.car; const bound = new Set(params instanceof Sym ? [params] : arr(params)); let p = params; while (p instanceof Pair) p = p.cdr; if (p instanceof Sym) bound.add(p);
        const m2 = new Map([...map].filter(([k]) => !bound.has(k)));
        return new Pair(S.lambda, new Pair(params, substitute(x.cdr.cdr, m2)));
      }
      if (x.car === S.let && x.cdr instanceof Pair && x.cdr.car instanceof Pair) {
        const binds = arr(x.cdr.car); const bound = new Set(binds.map(b => b instanceof Pair ? b.car : b));
        const m2 = new Map([...map].filter(([k]) => !bound.has(k)));
        const nb = list(binds.map(b => b instanceof Pair ? list([b.car, substitute(b.cdr.car, map)]) : b));
        return new Pair(S.let, new Pair(nb, substitute(x.cdr.cdr, m2)));
      }
      const without = (m, names) => new Map([...m].filter(([k]) => !names.includes(k)));
      if (x.car === S['let*'] && x.cdr instanceof Pair) {   // each binding sees the ones before it, and shadows from then on
        let m = map; const nb = [];
        for (const b of arr(x.cdr.car)) { if (b instanceof Pair) { nb.push(list([b.car, substitute(b.cdr.car, m)])); m = without(m, [b.car]); } else { nb.push(b); m = without(m, [b]); } }
        return new Pair(S['let*'], new Pair(list(nb), substitute(x.cdr.cdr, m)));
      }
      if (x.car === S.letrec && x.cdr instanceof Pair) {   // the binders scope over their own inits too
        const binds = arr(x.cdr.car), m2 = without(map, binds.map(b => b instanceof Pair ? b.car : b));
        return new Pair(S.letrec, new Pair(list(binds.map(b => b instanceof Pair ? list([b.car, substitute(b.cdr.car, m2)]) : b)), substitute(x.cdr.cdr, m2)));
      }
      if (x.car === S.let && x.cdr instanceof Pair && x.cdr.car instanceof Sym && x.cdr.cdr instanceof Pair) {   // named let: the name and the variables shadow in the body
        const name = x.cdr.car, binds = arr(x.cdr.cdr.car), m2 = without(map, [name, ...binds.map(b => b instanceof Pair ? b.car : b)]);
        return new Pair(S.let, new Pair(name, new Pair(list(binds.map(b => b instanceof Pair ? list([b.car, substitute(b.cdr.car, map)]) : b)), substitute(x.cdr.cdr.cdr, m2))));
      }
      if (x.car === S.do && x.cdr instanceof Pair && x.cdr.cdr instanceof Pair) {   // inits see the outer names; steps, test and body see the loop variables
        const specs = arr(x.cdr.car), m2 = without(map, specs.map(b => b.car));
        const ns = specs.map(b => new Pair(b.car, new Pair(substitute(b.cdr.car, map), substitute(b.cdr.cdr, m2))));
        return new Pair(S.do, new Pair(list(ns), substitute(x.cdr.cdr, m2)));
      }
      if (x.car === S.quasiquote && x.cdr instanceof Pair) return new Pair(S.quasiquote, list([substituteQuasi(x.cdr.car, map)]));
      if (x.car === S.define && x.cdr instanceof Pair) {   // (define (name params) body) or (define name expr): substitute inside, not into the bound names
        const head = x.cdr.car;
        if (head instanceof Pair) { const bound = new Set(arr(head.cdr)); let p = head.cdr; while (p instanceof Pair) p = p.cdr; if (p instanceof Sym) bound.add(p); const m2 = new Map([...map].filter(([k]) => !bound.has(k))); return new Pair(S.define, new Pair(head, substitute(x.cdr.cdr, m2))); }
        return new Pair(S.define, new Pair(head, substitute(x.cdr.cdr, map)));
      }
      return new Pair(substitute(x.car, map), substitute(x.cdr, map));
    }
    /** Inside a quasiquote only the unquoted parts are expressions. */
    function substituteQuasi(x, map) {
      if (!(x instanceof Pair)) return x;
      if ((x.car === S.unquote || x.car === S['unquote-splicing']) && x.cdr instanceof Pair) return new Pair(x.car, list([substitute(x.cdr.car, map)]));
      return new Pair(substituteQuasi(x.car, map), substituteQuasi(x.cdr, map));
    }
    function replaceAt(root, target, repl) {
      if (root === target) return repl;
      if (!(root instanceof Pair)) return root;
      const a = replaceAt(root.car, target, repl); if (a !== root.car) return new Pair(a, root.cdr);
      const d = replaceAt(root.cdr, target, repl); if (d !== root.cdr) return new Pair(root.car, d);
      return root;
    }
    const seq = (exprs) => exprs.length === 1 ? exprs[0] : new Pair(S.begin, list(exprs));

    /** One reduction of the leftmost-innermost redex in x. Returns {expr, target, result, note} or null if x is a value. */
    function step(x) {
      const r = reduce(x);
      if (!r) return null;
      return { expr: replaceAt(x, r.target, r.result), target: r.target, result: r.result, note: r.note };
    }
    function reduce(x) {
      if (isValue(x)) return null;
      if (x instanceof Sym) {
        const v = G.lookup(x);
        return { target: x, result: fromRaw(v), note: 'the name ' + x.name + ' stands for ' + Scheme.write(v) };
      }
      if (!(x instanceof Pair)) return { target: x, result: fromRaw(x), note: 'value' };
      const op = x.car, rest = arr(x.cdr);
      if (op === S.quote) return { target: x, result: fromRaw(x.cdr.car), note: 'a quoted expression is data: it evaluates to itself' };
      if (op === S.if) {
        const [p, c, a] = rest;
        if (!isValue(p)) return inner(x, p);
        return p !== false ? { target: x, result: c, note: 'the predicate is true, so if reduces to the consequent' } : { target: x, result: a === undefined ? new Datum(UNSPEC) : a, note: 'the predicate is false, so if reduces to the alternative' };
      }
      if (op === S.cond) {
        if (!rest.length) return { target: x, result: new Datum(UNSPEC), note: 'no clause matched' };
        const clause = rest[0];
        if (clause.car === S.else) return { target: x, result: seq(arr(clause.cdr)), note: 'the else clause is taken' };
        if (!isValue(clause.car)) return inner(x, clause.car);
        if (clause.car !== false && clause.cdr instanceof Pair && clause.cdr.car === S['=>'] && clause.cdr.cdr instanceof Pair) return { target: x, result: new Pair(clause.cdr.cdr.car, list([clause.car])), note: 'this clause\u2019s test is true, so the procedure after => is applied to the test value' };
        if (clause.car !== false) return { target: x, result: clause.cdr === NIL ? clause.car : seq(arr(clause.cdr)), note: 'this clause\u2019s test is true, so cond reduces to its body' };
        return { target: x, result: new Pair(S.cond, x.cdr.cdr), note: 'this clause\u2019s test is false, so it is dropped' };
      }
      if (op === S.and) {
        if (!rest.length) return { target: x, result: true, note: '(and) is #t' };
        if (!isValue(rest[0])) return inner(x, rest[0]);
        if (rest[0] === false) return { target: x, result: false, note: 'a false operand makes and false; the rest is never evaluated' };
        if (rest.length === 1) return { target: x, result: rest[0], note: 'the last operand of and is its value' };
        return { target: x, result: new Pair(S.and, x.cdr.cdr), note: 'a true operand is dropped and and continues' };
      }
      if (op === S.or) {
        if (!rest.length) return { target: x, result: false, note: '(or) is #f' };
        if (!isValue(rest[0])) return inner(x, rest[0]);
        if (rest[0] !== false) return { target: x, result: rest[0], note: 'a true operand is the value of or; the rest is never evaluated' };
        if (rest.length === 1) return { target: x, result: false, note: 'every operand of or was false' };
        return { target: x, result: new Pair(S.or, x.cdr.cdr), note: 'a false operand is dropped and or continues' };
      }
      if (op === S.begin) {
        if (!rest.length) return { target: x, result: new Datum(UNSPEC), note: 'empty begin' };
        if (rest.length === 1) return { target: x, result: rest[0], note: 'begin with one expression is that expression' };
        if (!isValue(rest[0])) return inner(x, rest[0]);
        return { target: x, result: new Pair(S.begin, x.cdr.cdr), note: 'the value of a finished expression in begin is discarded' };
      }
      if (op === S.let) {
        if (x.cdr.car instanceof Sym) return opaque(x, 'named let');
        const binds = arr(x.cdr.car);
        const params = list(binds.map(b => b instanceof Pair ? b.car : b)), args = binds.map(b => b instanceof Pair ? b.cdr.car : new Datum(UNSPEC));
        return { target: x, result: new Pair(new Pair(S.lambda, new Pair(params, x.cdr.cdr)), list(args)), note: 'let is a lambda applied to the initial values' };
      }
      if (op === S.define) return opaque(x, 'define');
      if (op === S['set!'] && !(x.cdr.car instanceof Sym)) throw new SchemeError('set! changes a variable, which the substitution model cannot show (the parameter was already replaced by its value). Press Run to see what a program that uses set! does.');
      if (OPAQUE.has(op)) return opaque(x, op.name);
      // an application
      for (const e of [x.car, ...rest]) if (!isValue(e)) return inner(x, e);
      const f = x.car;
      const proc = f instanceof Sym ? globalProc(f) : (isLambdaForm(f) ? it.evaluate(f, G) : (f instanceof Datum && (f.v instanceof Lambda || f.v instanceof Primitive) ? f.v : null));
      if (!proc) {
        const v = f instanceof Datum ? f.v : f;
        throw new SchemeError('The object ' + Scheme.write(v) + ' is not applicable.');
      }
      if (proc instanceof Primitive) {
        if (HIGHER.has(f) && rest.some(a => isLambdaForm(a) || (a instanceof Sym && globalProc(a) instanceof Lambda))) return opaque(x, f.name);
        const v = it.apply(proc, rest.map(toRaw));
        return { target: x, result: fromRaw(v), note: (f instanceof Sym ? f.name : 'the procedure') + ' is a primitive: it is applied directly' };
      }
      // compound procedure: substitute
      const lam = proc;
      const body = lam.body instanceof Pair && lam.body.car === S.begin ? lam.body.cdr : list([lam.body]);
      if (rest.length < lam.params.length || (!lam.rest && rest.length > lam.params.length))
        throw new SchemeError('The procedure ' + Scheme.write(lam) + ' has been called with ' + rest.length + ' argument' + (rest.length === 1 ? '' : 's') + '; it requires ' + (lam.rest ? 'at least ' : 'exactly ') + lam.params.length + ' argument' + (lam.params.length === 1 ? '' : 's') + '.');
      const map = new Map(); lam.params.forEach((p, i) => map.set(p, rest[i]));
      if (lam.rest) map.set(lam.rest, new Datum(list(rest.slice(lam.params.length).map(toRaw))));
      // A procedure made inside another call (a closure) remembers the names around its birthplace:
      // substitute their values too, innermost first, unless a parameter shadows them.
      const remembered = [];
      const occurs = (y, s) => y === s || (y instanceof Pair && (occurs(y.car, s) || occurs(y.cdr, s)));
      for (let e = lam.env; e && e !== G; e = e.parent) {
        for (const [k, v] of e.vars) if (!map.has(k) && occurs(lam.body, k)) { map.set(k, fromRaw(v)); remembered.push(k.name + ' \u2192 ' + Scheme.write(v)); }
      }
      const name = f instanceof Sym ? f.name : 'the lambda';
      const binding = (lam.params.length ? lam.params.map((p, i) => p.name + ' \u2192 ' + Scheme.write(toRaw(rest[i]))).join(', ') : 'no parameters') + (remembered.length ? ' (and the values it remembers from where it was made: ' + remembered.join(', ') + ')' : '');
      let exprs = arr(substitute(seq(arr(body)), map) instanceof Pair && body.cdr !== NIL ? substitute(new Pair(S.begin, body), map).cdr : list([substitute(body.car, map)]));
      let defs = exprs.filter(e => e instanceof Pair && e.car === S.define); exprs = exprs.filter(e => !(e instanceof Pair && e.car === S.define));
      let defNote = '', ren = null;
      if (defs.length) {
        // Internal definitions live in this call's own frame, which the substitution model has no place to draw. Give each one a name
        // made for this call (g#3), so another call, or a global of the same name, is never touched.
        const nameOf = (d) => d.cdr.car instanceof Pair ? d.cdr.car.car : d.cdr.car;
        ren = new Map(defs.map(d => [nameOf(d), sym(nameOf(d).name + '#' + (++uid))]));
        defs = defs.map(d => { const h = d.cdr.car; const nh = h instanceof Pair ? new Pair(ren.get(h.car), h.cdr) : ren.get(h); return substitute(new Pair(S.define, new Pair(nh, d.cdr.cdr)), without2(ren, h instanceof Pair ? arr(h.cdr) : [])); });
        exprs = exprs.map(e => substitute(e, ren));
        for (const d of defs) it.evaluate(toEvalable(d), G); defNote = '; its internal definition' + (defs.length > 1 ? 's' : '') + ' of ' + [...ren.keys()].map(k => k.name).join(', ') + ' (with ' + binding + ' already substituted, under a name made for this call) ' + (defs.length > 1 ? 'are' : 'is') + ' now available'; }
      return { target: x, result: seq(exprs), note: 'replace the call by the body of ' + name + ', with ' + binding + defNote };
    }
    const inner = (x, e) => { const r = reduce(e); return r; };
    function opaque(x, what) {
      const v = it.evaluate(toEvalable(x), G);
      return { target: x, result: fromRaw(v), note: what + ' is not shown as substitution steps; the interpreter evaluated it directly' };
    }

    /** Path (string of 'a'/'d' moves) to the first occurrence of target in root, or null. */
    function findPath(root, target, path) {
      path = path || '';
      if (root === target) return path;
      if (!(root instanceof Pair)) return null;
      return findPath(root.car, target, path + 'a') || findPath(root.cdr, target, path + 'd');
    }
    /** HTML rendering; the subexpressions at markPath / newPath are wrapped in <mark>. */
    function render(x, markPath, newPath) {
      const w = (y, path) => {
        const open = (path === markPath ? '<mark class="redex">' : '') + (path === newPath ? '<mark class="new">' : '');
        const close = (path === newPath ? '</mark>' : '') + (path === markPath ? '</mark>' : '');
        return open + w2(y, path) + close;
      };
      const w2 = (y, path) => {
        if (y instanceof Datum) { const v = y.v; if (v === UNSPEC) return '<i>unspecified</i>'; if (v instanceof Pair || v instanceof Sym || v === NIL) return esc("'" + Scheme.write(v)); return esc(Scheme.write(v)); }
        if (y instanceof Pair) {
          if (y.car === S.quote && y.cdr instanceof Pair) return esc("'" + Scheme.write(y.cdr.car));
          const parts = []; let p = y, pp = path; while (p instanceof Pair) { parts.push(w(p.car, pp + 'a')); p = p.cdr; pp += 'd'; } if (p !== NIL) parts.push('.', w(p, pp));
          return '(' + parts.join(' ') + ')';
        }
        return esc(Scheme.write(y));
      };
      return w(x, '');
    }

    /** Trace one top-level expression. Returns {steps: [{html, note}], value, error}. */
    function traceExpr(x) {
      const steps = []; let cur = x, newPath = null, error = null, n = 0;
      try {
        while (true) {
          const r = reduce(cur);
          if (!r) { const fin = cur instanceof Datum ? cur.v : (cur instanceof Sym && globalProc(cur) ? globalProc(cur) : cur); steps.push({ html: render(cur, null, newPath), note: 'value: ' + Scheme.write(fin), final: true }); break; }
          const path = findPath(cur, r.target);
          steps.push({ html: render(cur, path, newPath), note: r.note });
          cur = replaceAt(cur, r.target, r.result); newPath = path;
          if (++n >= maxSteps) { steps.push({ html: render(cur, null, newPath), note: 'stopped after ' + maxSteps + ' steps' }); error = 'too many steps'; break; }
        }
      } catch (e) { error = e instanceof SchemeError ? e.message : (e instanceof RangeError ? 'expression too deep' : 'Internal error: ' + e.message); steps.push({ html: render(cur, null, newPath), note: 'error: ' + error, error: true }); }
      return { steps, error, value: cur };
    }
    /** Trace a whole program. */
    function traceProgram(src) {
      const out = []; let forms;
      try { forms = Scheme.parseAll(src); } catch (e) { return { items: [], error: e.message }; }
      for (const f of forms) {
        if (f instanceof Pair && (f.car === S.define || f.car === S['define-syntax'])) {
          try { const v = it.evaluate(f, G); out.push({ kind: 'define', html: esc(Scheme.write(f)), note: 'defined ' + Scheme.write(v) }); }
          catch (e) { out.push({ kind: 'define', html: esc(Scheme.write(f)), note: 'error: ' + e.message, error: true }); return { items: out, error: e.message }; }
        } else {
          const t = traceExpr(f); out.push({ kind: 'expr', source: Scheme.write(f), steps: t.steps, error: t.error });
          if (t.error && t.error !== 'too many steps') return { items: out, error: t.error };
        }
      }
      return { items: out, error: null };
    }
    return { traceProgram, traceExpr, step, render, findPath, it };
  }
  return { create, Datum };
});
