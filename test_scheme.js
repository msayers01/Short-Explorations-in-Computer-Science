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
check("(case 3 ((1 2) 'low) ((3) 'three) (else 'other))", 'three');
check("(case 9 ((1 2) 'low) (else 'other))", 'other');
check("(define (f x) (case x ((a) 1) ((b c) 2) (else 0))) (f 'c)", '2');
check("(define (loop n) (case n ((0) 'done) (else (loop (- n 1))))) (loop 100000)", 'done');
errs('(string-length 5)', /not the correct type/);
errs('(string-append "a" 5)', /not the correct type/);
errs("(symbol->string 5)", /not the correct type/);
check('(string=? "a" "a" "a")', '#t');
check('(string>? "b" "a")', '#t');
check('(string-ref "abc" 1)', '"b"');
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
errs('(define square x (* x x))', /Ill-formed special form: \(define square x/);   // one name, one value
errs('(define x 5) (cond (> x 0) x)', /Ill-formed special form: \(cond/);          // a clause that is not a list, even after one that would succeed
check('(define x -5) (cond (> x 0 x))', '-5');
check('(define y) (cond (#f 1) (else 2))', '2');
errs('(define (f a . r) r) (f)', /at least 1 argument\./);
errs('(-)', /at least 1 argument\./);
check('(/ 1234567890123 10)', '123456789012.3');
check('(/ 1 3)', '.333333333333');

// big integers stay exact; results that fit in a double go back to plain numbers
check('(define (fact n) (if (= n 0) 1 (* n (fact (- n 1))))) (fact 25)', '15511210043330985984000000');
check('(expt 2 100)', '1267650600228229401496703205376');
check('(+ 9007199254740992 1)', '9007199254740993');
check('12345678901234567890', '12345678901234567890');
check('(- (expt 2 100) (expt 2 100))', '0');
check('(= (* 99999999999 99999999999) 9999999999800000000001)', '#t');
check('(quotient (expt 10 30) (expt 10 28))', '100');
check('(remainder (+ (expt 10 30) 7) 10)', '7');
check('(modulo (- (expt 10 30)) 7)', '6');
check('(/ (expt 10 30) (expt 10 28))', '100');
check('(/ (expt 10 30) 3)', '3.333333333333333e29');
check('(even? (expt 2 100))', '#t');
check('(< (expt 2 100) (expt 2 101))', '#t');
check('(max 1 (expt 2 70) 3)', '1180591620717411303424');
check('(gcd (expt 2 80) (expt 6 40))', '1099511627776');
check('(number->string (expt 2 70))', '"1180591620717411303424"');
check('(exact->inexact (expt 2 70))', '1.1805916207174113e21');
check('(sqrt (expt 10 40))', '100000000000000000000');
check('(* 1.5 (expt 2 70))', '1.770887431076117e21');
check('(define (f n) (if (= n 0) 0 (+ 1 (f (- n 1))))) (f 50000)', '50000');
errs('(define (f n) (+ 1 (f n))) (f 1)', /maximum recursion depth/);

// reader extras and a few more procedures
check('(+ 1 #| a #| nested |# comment |# 2)', '3');
check('(list 1 #;(ignored thing) 2)', '(1 2)');
check('#;(skipped) 5', '5');
check('(list #T #F)', '(#t #f)');
check('(sort (list 3 1 2) <)', '(1 2 3)');
check("(sort (list '(b . 1) '(a . 1) '(c . 0)) (lambda (x y) (< (cdr x) (cdr y))))", "((c . 0) (b . 1) (a . 1))");
check('(let ((a (list 1 2))) (eq? a (list-copy a)))', '#f');

// promises and streams (SICP §3.1-3.5): delay does not evaluate, force evaluates once and remembers; cons-stream delays its second operand
check('(define n 0) (define p (delay (begin (set! n (+ n 1)) (* 6 7)))) (list n (force p) (force p) n)', '(0 42 42 1)');
check('(force 5)', '5');
check('(promise? (delay 1))', '#t');
check('(force (make-promise 3))', '3');
check('(delay (+ 1 2))', '#[promise]');
check('(define s (cons-stream 1 (/ 1 0))) (stream-car s)', '1');   // the division is never done
errs('(define s (cons-stream 1 (/ 1 0))) (stream-cdr s)', /Division by zero/);
check('(define (from n) (cons-stream n (from (+ n 1)))) (stream-head (from 1) 5)', '(1 2 3 4 5)');
check('(define (from n) (cons-stream n (from (+ n 1)))) (stream-ref (from 1) 1000)', '1001');
check('(define (from n) (cons-stream n (from (+ n 1)))) (stream-car (stream-tail (from 1) 3))', '4');
check('(define ones (cons-stream 1 ones)) (stream-head (stream-map + ones ones) 3)', '(2 2 2)');
check('(define (from n) (cons-stream n (from (+ n 1)))) (define s (from 1)) (stream-ref s 2) s', '{1 2 3 ...}');
check('(cons-stream 1 2)', '{1 ...}');
check('(stream 1 2 3)', '{1 2 3}');
check('(stream->list (stream 1 2 3))', '(1 2 3)');
check("(stream->list (list->stream '(a b)))", '(a b)');
check('(stream-length (stream 1 2 3))', '3');
check('(define ones (cons-stream 1 ones)) (stream-cdr ones) ones', '{1 ...}');   // a stream that loops back on itself still prints
check('(list (stream-pair? (stream 1)) (stream-pair? (list 1)) (stream-null? the-empty-stream) (empty-stream? (stream)))', '(#t #f #t #t)');
check('(define c 0) (define s (cons-stream 1 (begin (set! c (+ c 1)) (cons-stream 2 the-empty-stream)))) (stream-cdr s) (stream-cdr s) c', '1');
check('(define fibs (cons-stream 0 (cons-stream 1 (stream-map + fibs (stream-cdr fibs))))) (stream-ref fibs 60)', '1548008755920');
errs('(stream-car the-empty-stream)', /passed as the first argument to stream-car, is not the correct type/);
errs('(stream-cdr (list 1 2))', /stream-cdr, is not the correct type/);
errs('(stream-head (stream 1 2) 3)', /stream-head, is not in the correct range/);
errs('(stream-ref (stream 1 2) 2)', /stream-ref, is not in the correct range/);
errs('(cons-stream 1)', /Ill-formed special form/);
errs('(delay)', /Ill-formed special form/);
// set! changes the binding where it was found: a closure's own frame (SICP §3.1)
check('(define (make-counter) (let ((n 0)) (lambda () (set! n (+ n 1)) n))) (define a (make-counter)) (define b (make-counter)) (a) (a) (b) (list (a) (b))', '(3 2)');
errs('(set! undefined-thing 1)', /Unbound variable: undefined-thing/);

// the REPL-style use: one evaluator, many forms, each with a fresh budget
errs('(iota 1000000000)', /out of memory/);
errs('(define (f s n) (if (= n 0) s (f (string-append s s) (- n 1)))) (string-length (f "abcdefghij" 40))', /out of memory/);
const it = Scheme.makeEvaluator({ stepLimit: 2000 });
for (const f of Scheme.parseAll('(define (loop n) (if (= n 0) 0 (loop (- n 1))))')) it.evaluate(f, it.G);
let failed = false;
try { for (let i = 0; i < 50; i++) { it.reset(); it.evaluate(Scheme.parseAll('(loop 50)')[0], it.G); } } catch (e) { failed = true; }
if (failed) { bad++; console.log('BAD  a fresh step budget per entry'); }

if (bad) { console.log(bad + ' problems'); process.exit(1); }
console.log('scheme OK');
