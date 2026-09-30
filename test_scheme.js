// Node tests for edge cases in the Scheme interpreter (src/scheme.js).
const Scheme = require('./src/scheme.js');
let bad = 0;
const run = (src) => { const r = Scheme.runProgram(src); return r.error ? 'ERR ' + r.error : (r.results.length ? r.results[r.results.length - 1].text : ''); };
const check = (src, want) => { const got = run(src); if (got !== want) { bad++; console.log('BAD  ' + src + '\n  got:  ' + got + '\n  want: ' + want); } };
const errs = (src, re) => { const got = run(src); if (!(got.startsWith('ERR') && re.test(got))) { bad++; console.log('BAD  ' + src + '\n  got:  ' + got + '\n  want error matching ' + re); } };

check('(let ((xs (list 2 3))) `(1 ,@xs 4))', '(1 2 3 4)');
check('`(1 ,(+ 1 1) ,@(list 3))', '(1 2 3)');
check('(let* ((x 1) (f (lambda () x)) (x 2)) (f))', '1');
check('(let* ((x 1) (y (+ x 1))) (list x y))', '(1 2)');
check('(define l (list 1 2)) (set-cdr! (cdr l) l) (list? l)', '#f');
errs('(define l (list 1 2)) (set-cdr! (cdr l) l) (length l)', /not the correct type/);
check('(equal? (iota 20000) (iota 20000))', '#t');
check('(length (iota 200000))', '200000');
check('(apply + (iota 100000))', '4999950000');
check('(string->number "12abc")', '#f');
check('(string->number "1e3")', '1000');
check('(string->number "ff" 16)', '255');
check('(number->string 255 16)', '"ff"');
errs('(substring "hello" 3 1)', /not in the correct range/);
errs('(if)', /Ill-formed special form/);
errs('(set!)', /Ill-formed special form/);
errs('(define (f a . r) r) (f)', /at least 1 argument\./);
errs('(-)', /at least 1 argument\./);
check('(/ 1234567890123 10)', '123456789012.3');
check('(/ 1 3)', '.333333333333');

// the REPL-style use: one evaluator, many forms, each with a fresh budget
const it = Scheme.makeEvaluator({ stepLimit: 2000 });
for (const f of Scheme.parseAll('(define (loop n) (if (= n 0) 0 (loop (- n 1))))')) it.evaluate(f, it.G);
let failed = false;
try { for (let i = 0; i < 50; i++) { it.reset(); it.evaluate(Scheme.parseAll('(loop 50)')[0], it.G); } } catch (e) { failed = true; }
if (failed) { bad++; console.log('BAD  a fresh step budget per entry'); }

if (bad) { console.log(bad + ' problems'); process.exit(1); }
console.log('scheme OK');
