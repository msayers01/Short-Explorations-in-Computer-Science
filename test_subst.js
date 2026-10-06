// node test_subst.js — checks the substitution-model stepper (src/subst.js) against the interpreter.
// For every Lisp playground that is not meant to fail, stepping must not hit an error, and every
// expression that finishes within the step limit must end at the value the interpreter prints.
global.window = global;
const Scheme = require('./src/scheme.js');
const SUBST = require('./src/subst.js');
require('./src/course_lisp.js');
let problems = 0, checked = 0, compared = 0;
const ok = (cond, msg) => { if (!cond) { problems++; console.log('BAD  ' + msg); } };
const course = window.COURSES.find(c => c.id === 'lisp');

// closures: a procedure made inside another call remembers the names around it
{
  const t = SUBST.create({ maxSteps: 300 }).traceProgram('(define (make-adder n) (lambda (x) (+ x n)))\n(define add5 (make-adder 5))\n(add5 10)');
  const e = t.items.find(i => i.kind !== 'define');
  ok(e && !e.error && /15/.test(e.steps[e.steps.length - 1].note) && /n \u2192 5/.test(e.steps[0].note), 'a closure is substituted with the value it remembers');
}

// assignment: the substitution model does not apply (SICP §3.1.3), so the stepper refuses set! with a message instead of wrong steps
{
  const t = SUBST.create({ maxSteps: 300 }).traceProgram('(define (make-counter) (let ((n 0)) (lambda () (set! n (+ n 1)) n)))\n(define c (make-counter))\n(c)');
  const e = t.items.find(i => i.kind !== 'define');
  ok(e && e.error === SUBST.SET_MSG, 'set! inside a closure is refused with the explanation');
  const g = SUBST.create({ maxSteps: 300 }).traceProgram('(define x 1)\n(set! x 2)');
  ok(g.error === SUBST.SET_MSG, 'a top-level set! is refused too');
}
// streams: cons-stream and delay are evaluated by the interpreter, and stepping still ends at the interpreter's value
{
  const t = SUBST.create({ maxSteps: 300 }).traceProgram('(define (from n) (cons-stream n (from (+ n 1))))\n(stream-car (stream-cdr (from 1)))');
  const e = t.items.find(i => i.kind !== 'define'), last = e && e.steps[e.steps.length - 1];
  ok(e && !e.error && last && last.note === 'value: 2', 'a stream is stepped to its value');
}

let skipped = 0;
course.lessons.forEach((L, li) => {
  let k = 0;
  for (const b of L.blocks) {
    if (!b || !b.play) continue;
    k++;
    if (b.expectError) continue;
    const name = 'lesson ' + (li + 1) + ' playground ' + k;
    // a playground that assigns has no substitution button (noSubst: true on the block, app.js), and every one that assigns must say so
    if (/\(set!/.test(b.play) && !b.noSubst) ok(false, name + ' uses set! but is not marked noSubst: true, so the page would offer a substitution the stepper refuses');
    if (b.noSubst) { skipped++; continue; }
    let t;
    try { t = SUBST.create({ maxSteps: 300, onOutput: () => {} }).traceProgram(b.play); }
    catch (e) { ok(false, name + ' crashed the stepper: ' + e.message); continue; }
    checked++;
    const exprs = t.items.filter(i => i.kind !== 'define');
    for (const x of exprs) ok(!x.steps.some(s => s.error), name + ': error while stepping ' + x.source + ': ' + (x.error || ''));
    // compare final values with a normal run of the same program
    const run = Scheme.runProgram(b.play);
    const values = (run.results || []).filter(r => !(r.form instanceof Scheme.Pair && r.form.car === Scheme.sym('define'))).map(r => r.text);
    exprs.forEach((x, i) => {
      const last = x.steps[x.steps.length - 1];
      if (!last || !last.final || values[i] === undefined) return;
      const m = last.note.match(/^value: ([\s\S]*)$/);
      if (m) { compared++; ok(m[1] === values[i] || (values[i] === '' && /unspecified/.test(last.html)), name + ': stepping ' + x.source + ' ended at ' + m[1] + ' but the interpreter says ' + values[i]); }
    });
  }
});
console.log(problems ? problems + ' problems' : 'subst OK (' + checked + ' playgrounds stepped, ' + compared + ' final values compared, ' + skipped + ' marked noSubst)');
process.exit(problems ? 1 : 0);
