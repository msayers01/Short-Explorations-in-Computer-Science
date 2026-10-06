// Lesson content, (c) 2026 Michael Sayers, licensed CC BY-SA 4.0 (see LICENSE-CONTENT.md).
window.COURSES = window.COURSES || [];
window.COURSES.push({
  id: 'math', code: 'SC 104', short: 'Math', lang: 'python',
  title: 'Introduction to the Mathematics of Computing',
  readingWpm: 60,   // definitions and proofs are read slowly; used for the lesson-time estimates
  // The named skills of the course (LESSON_STANDARD.md section 4): every quick check and exercise names the skill it practises.
  standard: 1,
  skills: [
    { id: 'implication', name: 'Judge an implication and tell it from its converse' },
    { id: 'negate-quantifier', name: 'Negate "for all" and "there exists"' },
    { id: 'sets', name: 'Work with sets, unions and intersections' },
    { id: 'counting', name: 'Count with the product rule and powers of two' },
    { id: 'pigeonhole', name: 'Use the pigeonhole principle' },
    { id: 'counterexample', name: 'Refute a claim with a counterexample' },
    { id: 'induction', name: 'Prove a claim for every n by induction' },
    { id: 'euclid', name: 'Find a gcd with Euclid\'s algorithm' },
    { id: 'modular', name: 'Compute remainders and powers modulo m' },
    { id: 'primes', name: 'Test primality by trial division' },
    { id: 'graphs', name: 'Model with graphs; use degrees, Euler walks and trees' },
    { id: 'shortest-paths', name: 'Find shortest paths by breadth-first search' },
    { id: 'dfa', name: 'Run, design and complement a finite automaton' },
    { id: 'finite-memory', name: 'Say what a finite machine can and cannot remember' },
    { id: 'regex', name: 'Read and write regular expressions' },
    { id: 'prefix-free', name: 'Split strings into letters; tell prefix-free codes' },
    { id: 'distinguishable', name: 'Prove a language needs unbounded memory' },
    { id: 'turing-machine', name: 'Trace and design a Turing machine' },
    { id: 'church-turing', name: 'State what the Church-Turing thesis does and does not say' },
    { id: 'countability', name: 'Tell countable from uncountable; build a diagonal' },
    { id: 'halting-proof', name: 'Follow the proof that halting is undecidable' },
    { id: 'undecidable', name: 'Tell undecidable, hard and easy problems apart' },
    { id: 'big-o', name: 'Count steps, compare growth with big-O, predict doubling' },
    { id: 'p-np', name: 'Explain P, NP, checking against finding, and reductions' },
    { id: 'probability', name: 'Find a probability by counting equally likely outcomes' },
    { id: 'expectation', name: 'Compute expected values, using linearity' },
    { id: 'randomized', name: 'Tell Monte Carlo from Las Vegas; test primes by chance' },
    { id: 'sums', name: 'Find and prove arithmetic and geometric sums' },
    { id: 'recurrences', name: 'Solve a recurrence from a program and read off its cost' },
    { id: 'rsa', name: 'Make RSA keys and explain why factoring protects them' }
  ],
  grades: 'Grades 10–12 · after Python',
  audience: `<p><b>Grades 10–12</b> (or a strong 9th grader) who have finished the Python course, or who can already write a loop and a function. The math is algebra: variables, exponents, remainders. No calculus. If you liked the parts of algebra where you had to explain <em>why</em>, this course is for you.</p><p>Python is the laboratory here, not the subject. Every idea gets a picture, an experiment you can run, and an argument in plain words. Each lesson stands on its own.</p>`,
  tagline: 'Twenty lessons on the ideas underneath every program: logic, proof, counting, chance, machines, and the problems no computer can solve.',
  description: `<p>Programming courses teach you how to make a computer do things. This course asks the questions underneath: What does it mean for an argument to be airtight? How many possibilities are there, and how do you count them without listing them? How likely is something, and what happens on average when a program flips coins? What is a computer, stripped to its bones, and is there anything it fundamentally cannot do? Which problems are easy, which are hard, and which are impossible?</p>
<p>These questions belong to mathematics as much as to computing, and the two subjects turn out to be the same subject looked at from two sides. Each lesson takes one idea, gives you a picture of it, lets you experiment with it in Python, and then asks you to reason about it in words. The exercises check your code; the reasoning you check with your own head. By the end you will have proved a theorem, designed a machine, met a problem that no program can solve, tested a 121-digit number for primality by flipping coins, and built a lock out of nothing but arithmetic.</p>
<p><b>These lessons are longer than an Hour of Code.</b> Most take 60 to 90 minutes, because definitions and proofs need slow, careful reading and the exercises ask for reasoning rather than code. The list below shows the estimate for each lesson that runs past an hour. In a 50- or 60-minute class, plan two sessions for those lessons, or leave the exercises for the next one.</p>
<p>Lessons 5, 10, 15 and 19 are <b>checkpoints</b>: no new ideas, just mixed questions on the lessons of the unit before each, to practise telling apart the ideas that look alike. Lesson 20 is the project, which puts the four units to work. Every quick check and exercise belongs to one of the course's named skills, and the Review page brings the quick checks back after a day and then after longer gaps.</p>`,
  outcomes: [
    'Write and read precise logical statements, and check equivalences with truth tables',
    'Count possibilities with sets, the product rule, and binary counting; use the pigeonhole principle',
    'Explain the difference between checking cases and proving, and write a proof by induction',
    'Use Euclid\u2019s algorithm and modular arithmetic, including fast modular exponentiation',
    'Model a problem as a graph and find shortest paths',
    'Design finite automata and Turing machines, and explain what each kind of machine can and cannot do',
    'Describe languages with regular expressions, and use one to read a real writing system',
    'Follow the diagonal argument and explain why the halting problem has no solution',
    'Compare algorithms by counting steps, and explain what makes a problem \u201chard\u201d',
    'Compute probabilities and expected values by counting, check them by simulation, and explain how far a randomized prime test can be trusted',
    'Find closed forms for arithmetic and geometric sums, and turn the recurrence of a recursive program into its running time',
    'Build and break a small public-key cipher'
  ],
  lessons: [
    /* ================================================================== */
    {
      standards: ['2-AP-12', '3B-CS-02', '9.2.4.5', '9.2.4.6'],
      standard: 1,
      title: 'Propositions and truth', summary: 'Statements that are true or false, the connectives that combine them, why a truth table is a proof, and how to say "for all" and "there exists" precisely.',
      blocks: [
        `<p>"This sentence is false." Is it true? If it is true, then what it says holds, so it is false. If it is false, then what it says fails, so it is true. This is the <em>liar paradox</em>, known to the ancient Greeks, and it shows that not every sentence can be simply true or false. So which sentences <em>can</em> we reason about with certainty, how do we combine them, and what would it mean to prove something about them?</p>
<p>Mathematics is built from statements that are definitely true or definitely false, and so is every program you have written: each <code>if</code> asks a question whose answer is <code>True</code> or <code>False</code>. This lesson is about those statements: what they are, how they combine, and, for the first time in this course, what it means to <em>prove</em> something about them.</p>
<div class="stmt"><p><span class="kind">Definition.</span> A <em>proposition</em> is a statement that is either true or false, and not both.</p></div>
<div class="tbl-wrap"><table class="small">
<tr><th>statement</th><th>proposition?</th></tr>
<tr><td>7 is a prime number.</td><td>yes (true)</td></tr>
<tr><td>7 is an even number.</td><td>yes (false)</td></tr>
<tr><td>Every even number greater than 2 is the sum of two primes.</td><td>yes: it is either true or false, even though nobody knows which</td></tr>
<tr><td>Please close the door.</td><td>no: a request has no truth value</td></tr>
<tr><td><i>x</i> &gt; 5</td><td>not yet: it becomes a proposition once <i>x</i> is given a value</td></tr>
</table></div>
<p>The third row matters. A proposition need not be <em>known</em> to be true or false; it need only <em>be</em> one or the other. The last row matters too: a statement with a variable in it, such as <i>x</i> &gt; 5, is called a <em>predicate</em>, and it turns into a proposition when the variable gets a value. Lesson 3 will use that idea heavily.</p>
<details class="reveal"><summary>Guess first: is "Is 7 a prime number?" a proposition?</summary><p>No. It is a question, and a question has no truth value, just like a request. "7 is a prime number" is the proposition; the question asks whether it is true.</p></details>
<p>We write propositions with letters, <i>p</i>, <i>q</i>, <i>r</i>, just as algebra writes numbers with <i>x</i> and <i>y</i>, and we write their truth values as T and F. Python has a type for exactly these two values, <code>bool</code>, with <code>True</code> and <code>False</code>.</p>
<h2>Three connectives</h2>
<p>New propositions are built from old ones with connecting words. Each connective is <em>defined</em> by a table giving the value of the new proposition for every possible combination of values of the old ones. Such a table is called a <em>truth table</em>, and for a connective the table is its definition: there is nothing else to know about "and" than what the table says.</p>
<div class="stmt"><p><span class="kind">Definition.</span> For propositions <i>p</i> and <i>q</i>, the <em>negation</em> ¬<i>p</i> ("not <i>p</i>"), the <em>conjunction</em> <i>p</i> ∧ <i>q</i> ("<i>p</i> and <i>q</i>") and the <em>disjunction</em> <i>p</i> ∨ <i>q</i> ("<i>p</i> or <i>q</i>") are the propositions whose truth values are given by these tables:</p>
<table class="small"><tr><th><i>p</i></th><th>¬<i>p</i></th></tr><tr><td>T</td><td>F</td></tr><tr><td>F</td><td>T</td></tr></table>
<table class="small"><tr><th><i>p</i></th><th><i>q</i></th><th><i>p</i> ∧ <i>q</i></th><th><i>p</i> ∨ <i>q</i></th></tr><tr><td>T</td><td>T</td><td>T</td><td>T</td></tr><tr><td>T</td><td>F</td><td>F</td><td>T</td></tr><tr><td>F</td><td>T</td><td>F</td><td>T</td></tr><tr><td>F</td><td>F</td><td>F</td><td>F</td></tr></table></div>
<p>Two things to notice. The table for two propositions has four rows, because each of <i>p</i> and <i>q</i> can independently be T or F: 2 × 2 = 4. And "or" is <em>inclusive</em>: <i>p</i> ∨ <i>q</i> is true in the first row, where both are true. In everyday English "soup or salad" usually means one or the other; in logic, and in every programming language, "or" never does. The one-or-the-other version has its own name, <em>exclusive or</em>, and you will meet it below.</p>
<details class="reveal"><summary>Guess first: if <i>p</i> is true and <i>q</i> is true, what is ¬(<i>p</i> ∧ <i>q</i>)?</summary><p>F. The conjunction <i>p</i> ∧ <i>q</i> is T in that row, and ¬ flips it. That is the first row of the table in the next section.</p></details>
<p>Python spells the three connectives as English words: <code>not p</code>, <code>p and q</code>, <code>p or q</code>. Logicians write ¬, ∧, ∨. They mean exactly the same tables.</p>
<h2>Building a truth table</h2>
<p>A compound proposition such as ¬(<i>p</i> ∧ <i>q</i>) is evaluated from the inside out, one column at a time, exactly as a nested arithmetic expression is. Here is the table for it, with the intermediate column shown. Cover the last column and fill it in yourself first: each entry is the negation of the entry beside it.</p>
<table class="small"><tr><th><i>p</i></th><th><i>q</i></th><th><i>p</i> ∧ <i>q</i></th><th>¬(<i>p</i> ∧ <i>q</i>)</th></tr><tr><td>T</td><td>T</td><td>T</td><td>F</td></tr><tr><td>T</td><td>F</td><td>F</td><td>T</td></tr><tr><td>F</td><td>T</td><td>F</td><td>T</td></tr><tr><td>F</td><td>F</td><td>F</td><td>T</td></tr></table>
<p>Always list the rows in this order, TT, TF, FT, FF, so that tables can be compared row by row.</p>
<details class="reveal"><summary>Guess first: how many rows does a table with three propositions have? With <i>n</i>?</summary><p>Eight with three, because each of the three is independently T or F: 2 × 2 × 2. With <i>n</i> propositions there are 2<sup><i>n</i></sup> rows, a fact Lesson 2 returns to.</p></details>
<h2>If … then</h2>
<p>The most important connective, and the only one whose table surprises people, is <em>implication</em>.</p>
<div class="stmt"><p><span class="kind">Definition.</span> The <em>implication</em> <i>p</i> → <i>q</i> ("if <i>p</i> then <i>q</i>") is the proposition that is false when <i>p</i> is true and <i>q</i> is false, and true otherwise.</p>
<table class="small"><tr><th><i>p</i></th><th><i>q</i></th><th><i>p</i> → <i>q</i></th></tr><tr><td>T</td><td>T</td><td>T</td></tr><tr><td>T</td><td>F</td><td>F</td></tr><tr><td>F</td><td>T</td><td>T</td></tr><tr><td>F</td><td>F</td><td>T</td></tr></table></div>
<p>The second row is the one everyone accepts: "if it rains I will bring an umbrella" is plainly broken when it rains and I arrive without one. The last two rows are the ones that need explaining. Think of <i>p</i> → <i>q</i> as a <em>promise</em>: it promises <i>q</i> in the event that <i>p</i> happens. If <i>p</i> does not happen, the promise is never put to the test, and an untested promise is not a broken one. So when <i>p</i> is false, <i>p</i> → <i>q</i> is true regardless of <i>q</i>.</p>
<details class="reveal"><summary>Predict: is "if 1 = 2, then the moon is made of cheese" true or false?</summary><p>True. The "if" part is false, so the implication is true by the last two rows of its table, whatever follows. Mathematicians say a false hypothesis implies anything. This is not a trick; it is what makes proofs work. To establish <i>p</i> → <i>q</i> you only ever have to deal with the case where <i>p</i> is true, because the other case is settled by definition.</p></details>
<p>Python has no word for →, but the table gives you one: <i>p</i> → <i>q</i> has the same values as (¬<i>p</i>) ∨ <i>q</i>, so <code>(not p) or q</code> computes it. Check that claim against the table before believing it; the next section is about what "check" means.</p>
<h2>A truth table is a proof</h2>
<div class="stmt"><p><span class="kind">Definition.</span> Two propositions built from the same letters are <em>logically equivalent</em>, written ≡, when they have the same truth value in every row of the truth table.</p></div>
<p>Equivalent propositions can replace one another anywhere, in a proof or in a program, because no situation tells them apart. The most useful equivalences have names. Here is the first, with its proof.</p>
<div class="stmt"><p><span class="kind">Theorem 1 (De Morgan's law).</span> ¬(<i>p</i> ∧ <i>q</i>) ≡ (¬<i>p</i>) ∨ (¬<i>q</i>).</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> We compute both sides for every possible pair of values of <i>p</i> and <i>q</i>.</p>
<table class="small"><tr><th><i>p</i></th><th><i>q</i></th><th><i>p</i> ∧ <i>q</i></th><th>¬(<i>p</i> ∧ <i>q</i>)</th><th>¬<i>p</i></th><th>¬<i>q</i></th><th>(¬<i>p</i>) ∨ (¬<i>q</i>)</th></tr><tr><td>T</td><td>T</td><td>T</td><td><b>F</b></td><td>F</td><td>F</td><td><b>F</b></td></tr><tr><td>T</td><td>F</td><td>F</td><td><b>T</b></td><td>F</td><td>T</td><td><b>T</b></td></tr><tr><td>F</td><td>T</td><td>F</td><td><b>T</b></td><td>T</td><td>F</td><td><b>T</b></td></tr><tr><td>F</td><td>F</td><td>F</td><td><b>T</b></td><td>T</td><td>T</td><td><b>T</b></td></tr></table>
<p>The two bold columns agree in every row. By the definition of logical equivalence, the two propositions are equivalent. <span class="qed">∎</span></p>
<p class="why">The claim is about <em>every</em> assignment of truth values, and there are exactly four of them. Checking all four is not "evidence" that the claim holds; it is the whole claim, verified case by case, with no case left over. A proof that works by checking every case is called a <em>proof by exhaustion</em>, and it is a complete proof whenever the number of cases is finite. Lesson 3 is about what to do when it is not.</p></div>
<p>In words: "it is not the case that both are true" says the same as "at least one is false". Programmers use this every day to untangle a <code>not</code> in front of an <code>and</code>: <code>not (a and b)</code> can always be rewritten <code>(not a) or (not b)</code>, and is often clearer that way.</p>
<details class="reveal"><summary>Try it: prove the other De Morgan law, ¬(<i>p</i> ∨ <i>q</i>) ≡ (¬<i>p</i>) ∧ (¬<i>q</i>).</summary><p>Rows in the usual order. <i>p</i> ∨ <i>q</i>: T, T, T, F, so ¬(<i>p</i> ∨ <i>q</i>): F, F, F, T. Then ¬<i>p</i>: F, F, T, T and ¬<i>q</i>: F, T, F, T, so (¬<i>p</i>) ∧ (¬<i>q</i>): F, F, F, T. The two columns agree in every row. ∎ In words: "neither is true" means "both are false".</p></details>
<h2>Turning an implication around</h2>
<div class="stmt"><p><span class="kind">Definition.</span> The <em>converse</em> of <i>p</i> → <i>q</i> is <i>q</i> → <i>p</i>. The <em>contrapositive</em> of <i>p</i> → <i>q</i> is ¬<i>q</i> → ¬<i>p</i>.</p></div>
<p>These look similar and behave completely differently, and confusing them is the single most common error in reasoning, inside mathematics and out of it.</p>
<div class="stmt"><p><span class="kind">Theorem 2.</span> An implication is equivalent to its contrapositive: <i>p</i> → <i>q</i> ≡ ¬<i>q</i> → ¬<i>p</i>. An implication is <em>not</em> in general equivalent to its converse.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Both parts by truth table.</p>
<table class="small"><tr><th><i>p</i></th><th><i>q</i></th><th><i>p</i> → <i>q</i></th><th>¬<i>q</i></th><th>¬<i>p</i></th><th>¬<i>q</i> → ¬<i>p</i></th><th><i>q</i> → <i>p</i></th></tr><tr><td>T</td><td>T</td><td><b>T</b></td><td>F</td><td>F</td><td><b>T</b></td><td>T</td></tr><tr><td>T</td><td>F</td><td><b>F</b></td><td>T</td><td>F</td><td><b>F</b></td><td>T</td></tr><tr><td>F</td><td>T</td><td><b>T</b></td><td>F</td><td>T</td><td><b>T</b></td><td>F</td></tr><tr><td>F</td><td>F</td><td><b>T</b></td><td>T</td><td>T</td><td><b>T</b></td><td>T</td></tr></table>
<p>The columns for <i>p</i> → <i>q</i> and ¬<i>q</i> → ¬<i>p</i> agree in all four rows, so they are equivalent. The column for <i>q</i> → <i>p</i> differs from <i>p</i> → <i>q</i> in the second row (and the third), so the converse is not equivalent. <span class="qed">∎</span></p></div>
<p>Notice the shape of the second half: to show two things are <em>not</em> equivalent, one row where they differ is enough. That is a counterexample, and it will be the standard way to refute a claim throughout this course.</p>
<p>An everyday example. "If it is a square, then it is a rectangle" is true. Its converse, "if it is a rectangle, then it is a square", is false: a 2-by-3 rectangle is the counterexample. Its contrapositive, "if it is not a rectangle, then it is not a square", is true, and says exactly the same thing as the original. Proofs often prove the contrapositive instead of the original, because it can be easier, and Theorem 2 says that is allowed.</p>
<h2>The laboratory</h2>
<p>You have been computing truth tables by hand, which is how you learn to trust them. Python can compute them too, and once you trust the method a program is the faster instrument. The one below prints the table of any expression in <i>p</i> and <i>q</i> you type into it. Use it to check the reveal above, and to settle any equivalence you are unsure of.</p>`,
        { play: `def table(name, f):
    print("p     q     " + name)
    for p in (True, False):
        for q in (True, False):
            print(str(p).ljust(6), str(q).ljust(6), f(p, q))
    print()

table("p -> q", lambda p, q: (not p) or q)
table("not q -> not p", lambda p, q: (not (not q)) or (not p))
table("exactly one of p, q", lambda p, q: (p or q) and not (p and q))`, predict: true, caption: 'The first two tables have the same column, False only in the second row: that is Theorem 2 (an implication equals its contrapositive), checked by a program. The third column is True exactly when p and q differ: exclusive or. A lambda is a one-line function with no name; here it holds the expression. Change the third one to  (p and not q) or (q and not p)  and confirm it gives the same column.' },
        { skill: 'implication', check: "When is <code>p → q</code> false?", options: ["Whenever p is false", "Only when p is true and q is false", "Whenever q is false"], answer: 1, why: "An untested promise is kept: a false p makes the implication true. Only \"p true, q false\" breaks it.", wrong: ["A false p means the promise was never tested, so it is not broken: the implication is true.", null, "A false q breaks the promise only if p happened. If p is false too, the implication is still true."] },
        { skill: 'implication', check: "Which statement is equivalent to \"if it rains, the ground is wet\"?", options: ["If the ground is wet, it rained (the converse)", "If the ground is not wet, it did not rain (the contrapositive)", "It rains and the ground is wet"], answer: 1, why: "An implication is equivalent to its contrapositive, not to its converse. One row of the truth table differs for the converse.", wrong: ["That is the converse, and it is a different claim: the ground can be wet from a hose, so \"wet\" does not show it rained.", null, "That says both things happen. An implication promises nothing about whether it rains; it only links the two."] },
        `<h2>For all, and there exists</h2>
<p>Most statements worth proving are about a whole collection of things at once: "every even number greater than 2 is a sum of two primes", "there is a prime larger than a million". The phrases <em>for all</em> and <em>there exists</em> are called <em>quantifiers</em>, and they turn a predicate into a proposition.</p>
<div class="stmt"><p><span class="kind">Definition.</span> Let <i>P</i>(<i>x</i>) be a predicate about the members of some set <i>S</i>.</p>
<p>∀<i>x</i> ∈ <i>S</i>, <i>P</i>(<i>x</i>) ("for all <i>x</i> in <i>S</i>, <i>P</i>(<i>x</i>)") is true when <i>P</i>(<i>x</i>) is true for <em>every</em> member <i>x</i> of <i>S</i>, and false otherwise.</p>
<p>∃<i>x</i> ∈ <i>S</i>, <i>P</i>(<i>x</i>) ("there exists <i>x</i> in <i>S</i> with <i>P</i>(<i>x</i>)") is true when <i>P</i>(<i>x</i>) is true for <em>at least one</em> member <i>x</i> of <i>S</i>, and false otherwise.</p></div>
<p>Python's <code>all</code> and <code>any</code> are these two quantifiers for finite collections: <code>all(n % 2 == 0 for n in nums)</code> is ∀, <code>any(...)</code> is ∃. When the set is finite you can settle a quantified statement by checking every member, exactly as a truth table checks every row. When the set is infinite, such as all whole numbers, no amount of checking settles a "for all"; Lesson 3 is about what does.</p>
<p>Negating a quantified statement follows a pattern that looks just like De Morgan's laws, and for the same reason: "for all" is a large "and", and "there exists" is a large "or".</p>
<div class="stmt"><p><span class="kind">Theorem 3.</span> ¬(∀<i>x</i>, <i>P</i>(<i>x</i>)) ≡ ∃<i>x</i>, ¬<i>P</i>(<i>x</i>), and ¬(∃<i>x</i>, <i>P</i>(<i>x</i>)) ≡ ∀<i>x</i>, ¬<i>P</i>(<i>x</i>).</p></div>
<div class="proof"><p><span class="kind">Proof.</span> "Not every <i>x</i> satisfies <i>P</i>" means exactly that the members satisfying <i>P</i> do not include all of <i>S</i>; that is, some member fails <i>P</i>, which is the statement ∃<i>x</i>, ¬<i>P</i>(<i>x</i>). Conversely, if some member fails <i>P</i>, then certainly not every member satisfies it. The second equivalence is the same argument with "no member satisfies" in place of "not every member satisfies". <span class="qed">∎</span></p></div>
<p>So the negation of "every student passed" is not "every student failed" but "some student did not pass"; and "there is no largest prime" says the same as "every prime has a larger one". Getting these right is most of the skill of reading a mathematical statement, and it is the whole skill of writing a correct <code>if</code> condition with a <code>not</code> in it.</p>
<h2>Before the exercises</h2>
<p>The first exercise asks you to fill in a truth table. Do it column by column, in the row order TT, TF, FT, FF, and use the definition of → each time: an implication is false only in the single case "true → false". The second asks for the negation of a "for all" statement: apply Theorem 3, and then read your answer back in plain English to make sure it says what you meant.</p>`,
        `<details class="reveal"><summary>Puzzle (after the logician Raymond Smullyan): on an island, every inhabitant is either a knight, who always tells the truth, or a knave, who always lies. You meet A and B. A says, "We are both knaves." What are A and B?</summary><p>A is a knave and B is a knight. If A were a knight, A's statement would be true, so A would be a knave: a contradiction. So A is a knave, and A's statement "we are both knaves" is false. Since A is a knave, the statement can only be false if B is <em>not</em> a knave, so B is a knight. A truth table with a row for each of the four possibilities gives the same answer: exactly one row is consistent.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Reading "if <i>p</i> then <i>q</i>" as "<i>p</i> and <i>q</i>": it says nothing about whether <i>p</i> happens. Marking <i>p</i> → <i>q</i> false when <i>p</i> is false: an untested promise is kept. Treating an implication and its converse as the same statement. Thinking "or" excludes "both". Negating "every student passed" as "every student failed". And in Python, writing <code>if x == 3 or 4:</code>, which reads as <code>(x == 3) or 4</code> and is always true; the correct form is <code>x == 3 or x == 4</code>.</p>` },
        { skill: 'negate-quantifier', check: "What is the negation of \"every student passed\"?", options: ["Every student failed", "Some student did not pass", "No student passed"], answer: 1, why: "¬(∀x, P(x)) ≡ ∃x, ¬P(x): the negation of \"for all\" is \"there exists one that does not\".", wrong: ["That is far too strong. One student who did not pass is enough to make the claim false; the rest may all have passed.", null, "This is the same overstatement: it says not one student passed, but the claim only needs one student who did not pass."] },
        {
          ex: {
            id: 'ma-1-1', skill: 'implication', kind: 'table', title: 'An implication and its relatives',
            prompt: `<p>Complete the truth table. Write T or F in each blank. The last column, (<i>p</i> → <i>q</i>) ∧ (<i>q</i> → <i>p</i>), is an implication and its converse taken together.</p>`,
            head: ['<i>p</i>', '<i>q</i>', '<i>p</i> → <i>q</i>', '<i>q</i> → <i>p</i>', '(<i>p</i> → <i>q</i>) ∧ (<i>q</i> → <i>p</i>)'],
            rows: [
              ['T', 'T', { a: 'T', name: 'p → q, row TT' }, { a: 'T', name: 'q → p, row TT' }, { a: 'T', name: 'last column, row TT' }],
              ['T', 'F', { a: 'F', name: 'p → q, row TF', why: { T: 'This is the one case where an implication fails: p is true and q is false, so the promise is broken.' } }, { a: 'T', name: 'q → p, row TF', why: { F: 'Here q is false, so the implication q → p is an untested promise: true.' } }, { a: 'F', name: 'last column, row TF' }],
              ['F', 'T', { a: 'T', name: 'p → q, row FT', why: { F: 'p is false, so p → q is true whatever q is.' } }, { a: 'F', name: 'q → p, row FT', why: { T: 'Here q is true and p is false: the converse is broken in this row.' } }, { a: 'F', name: 'last column, row FT' }],
              ['F', 'F', { a: 'T', name: 'p → q, row FF', why: { F: 'Both false: p never happened, so the promise was never tested. An implication with a false hypothesis is true.' } }, { a: 'T', name: 'q → p, row FF', why: { F: 'q is false, so q → p is true by definition.' } }, { a: 'T', name: 'last column, row FF' }]
            ],
            hints: ['An implication is false in exactly one case: hypothesis true, conclusion false. Every other row is T.', 'For the last column, combine the two middle columns with ∧: T only when both are T.'],
            solution: `<p>Column <i>p</i> → <i>q</i>: T, F, T, T (false only in row TF). Column <i>q</i> → <i>p</i>: T, T, F, T (false only where <i>q</i> is true and <i>p</i> is false, row FT). Their conjunction: T, F, F, T.</p><p>The last column is true exactly when <i>p</i> and <i>q</i> have the same value. It is the connective "<i>p</i> if and only if <i>q</i>", written <i>p</i> ↔ <i>q</i>, and it is how a mathematician says two conditions are equivalent.</p>`,
            followup: 'The last column is T exactly when p and q agree. That connective is "if and only if", written p ↔ q; you will see it in every definition that says "X is Y exactly when Z".'
          }
        },
        {
          ex: {
            id: 'ma-1-2', skill: 'negate-quantifier', kind: 'choice', title: 'Negating "for all"',
            prompt: `<p>A teacher claims: "Every student in this class passed the test." Which statement is the <em>negation</em> of the claim, that is, the statement that is true exactly when the claim is false?</p>`,
            options: [
              { text: 'No student in this class passed the test.', why: 'That is the opposite extreme, not the negation. The claim can be false while most students passed; it takes only one who did not.' },
              { text: 'At least one student in this class did not pass the test.', ok: true },
              { text: 'Every student in this class failed the test.', why: 'This says the same as the first option. For the claim to be false it is enough that one student did not pass; nothing is said about the rest.' },
              { text: 'At least one student in this class passed the test.', why: 'This is consistent with the claim being true, so it cannot be its negation. The negation of "every" is "not every", that is, "at least one did not".' }
            ],
            hints: ['Theorem 3: the negation of "for all x, P(x)" is "there exists x with not P(x)".', 'Ask: what is the smallest thing that would make the teacher wrong? One student who did not pass.'],
            solution: `<p>Write the claim as ∀<i>x</i> ∈ class, passed(<i>x</i>). By Theorem 3 its negation is ∃<i>x</i> ∈ class, ¬passed(<i>x</i>): at least one student did not pass. The options "no student passed" and "every student failed" are much stronger statements; each of them makes the claim false, but the claim can also be false when they are false, so neither is the negation. "At least one passed" can be true together with the claim, so it is not the negation either.</p>`,
            followup: 'A negation must be true exactly when the original is false, no more and no less. The opposite extreme ("every student failed") is a common wrong answer because it sounds like a stronger denial; it is stronger, and that is exactly why it is wrong.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A proposition is true or false; ¬, ∧, ∨ are defined by their truth tables, and "or" is inclusive.</li>
<li><i>p</i> → <i>q</i> is false only when <i>p</i> is true and <i>q</i> is false; an untested promise is kept. It equals (¬<i>p</i>) ∨ <i>q</i>.</li>
<li>A complete truth table is a proof, because it checks every case (proof by exhaustion). De Morgan: ¬(<i>p</i> ∧ <i>q</i>) ≡ ¬<i>p</i> ∨ ¬<i>q</i>.</li>
<li>An implication is equivalent to its contrapositive, not to its converse. One differing row is a counterexample.</li>
<li>∀ is a large "and", ∃ is a large "or"; the negation of "for all" is "there exists one that does not".</li>
<li>So the sentences we can reason about with certainty are the propositions. Combine them with truth tables, and prove things about them by checking every row.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-12', '7.1.2.4', '9.1.2.2', '9.2.4.7'],
      standard: 1,
      title: 'Sets and counting', summary: 'Collections without order, four rules for counting without listing, why a set of n things has 2ⁿ subsets, and the pigeonhole principle.',
      blocks: [
        `<p>A pizza shop offers ten toppings, and you may choose any combination, from a plain pizza to one with all ten. How many different pizzas is that? Listing them would take all afternoon. By the end of this lesson you will know the answer, 1024, and be able to prove it.</p>
<p>A great deal of computing comes down to a counting question. How many passwords must an attacker try? How many cases must a test check to be complete? How many possibilities must a brute-force search examine before it can give up? This lesson develops a small set of rules for counting a collection <em>without listing it</em>, and proves each rule from the one before. The collections are sets, so we begin with those.</p>
<h2>Sets</h2>
<div class="stmt"><p><span class="kind">Definition.</span> A <em>set</em> is a collection of objects, called its <em>elements</em>. We write <i>x</i> ∈ <i>A</i> for "<i>x</i> is an element of <i>A</i>" and <i>x</i> ∉ <i>A</i> for "<i>x</i> is not an element of <i>A</i>". Two sets are <em>equal</em> when they have exactly the same elements.</p></div>
<p>A small set can be written by listing its elements between braces: the primes less than 10 form the set {2, 3, 5, 7}. The definition of equality has two consequences that make a set different from a list. Order does not matter: {7, 5, 3, 2} has the same elements, so it is the same set. Repetition does not matter either: {2, 2, 3} and {2, 3} have the same elements, so they are equal, and the first is just a clumsy way of writing the second. A set has one job, which is to answer the question "is <i>x</i> in here?"</p>
<details class="reveal"><summary>Guess first: are {1, 2, 3} and {3, 2, 1, 1} the same set?</summary><p>Yes. They have exactly the same elements, 1, 2 and 3, and order and repetition do not matter. Both have size 3.</p></details>
<div class="stmt"><p><span class="kind">Definition.</span> The number of elements of a finite set <i>A</i> is called its <em>size</em> and written |<i>A</i>|. The set with no elements is the <em>empty set</em>, written ∅, and |∅| = 0.</p></div>
<details class="reveal"><summary>Predict: what are |{1, 2, 2, 3, 3, 3}|, |{∅}| and |{{1, 2}, 3}|?</summary><p>3, because the set is {1, 2, 3}. Then 1: the only element of {∅} is the empty set itself, and a box containing an empty box is not empty. Then 2: the elements are the set {1, 2} and the number 3. An element that happens to be a set is still one element.</p></details>
<h2>Building sets from sets</h2>
<div class="stmt"><p><span class="kind">Definition.</span> Let <i>A</i> and <i>B</i> be sets.</p>
<p><i>A</i> ⊆ <i>B</i>, "<i>A</i> is a <em>subset</em> of <i>B</i>", when every element of <i>A</i> is an element of <i>B</i>.</p>
<p><i>A</i> ∪ <i>B</i>, the <em>union</em>, is the set of elements that are in <i>A</i> or in <i>B</i>.</p>
<p><i>A</i> ∩ <i>B</i>, the <em>intersection</em>, is the set of elements that are in both <i>A</i> and <i>B</i>.</p>
<p><i>A</i> − <i>B</i>, the <em>difference</em>, is the set of elements that are in <i>A</i> and not in <i>B</i>.</p>
<p><i>A</i> and <i>B</i> are <em>disjoint</em> when they have no element in common, that is, when <i>A</i> ∩ <i>B</i> = ∅.</p></div>
<p>Each of these is a connective from Lesson 1 in disguise: <i>x</i> ∈ <i>A</i> ∪ <i>B</i> means (<i>x</i> ∈ <i>A</i>) ∨ (<i>x</i> ∈ <i>B</i>), and <i>x</i> ∈ <i>A</i> ∩ <i>B</i> means (<i>x</i> ∈ <i>A</i>) ∧ (<i>x</i> ∈ <i>B</i>). The "or" is the inclusive one, so an element of both sets belongs to the union, once. Two consequences surprise people: <i>A</i> ⊆ <i>A</i> for every set, and ∅ ⊆ <i>A</i> for every set. The second holds because "every element of ∅ is in <i>A</i>" is a promise about elements that do not exist, and, as Lesson 1 put it, an untested promise is not a broken one.</p>
<p>Take <i>A</i> = {1, 2, 3, 4, 5, 6} and <i>B</i> = {4, 5, 6, 7, 8}. Then:</p>
<table class="small"><tr><th><i>A</i> ∪ <i>B</i></th><th><i>A</i> ∩ <i>B</i></th><th><i>A</i> − <i>B</i></th><th><i>B</i> − <i>A</i></th></tr><tr><td>{1, 2, 3, 4, 5, 6, 7, 8}</td><td>{4, 5, 6}</td><td>{1, 2, 3}</td><td>{7, 8}</td></tr></table>
<p>A picture called a <em>Venn diagram</em> shows all of these at once: one circle for each set, overlapping. The overlap is <i>A</i> ∩ <i>B</i>, the two crescents are <i>A</i> − <i>B</i> and <i>B</i> − <i>A</i>, and everything inside either circle is <i>A</i> ∪ <i>B</i>. Edit the sets below and watch where each element lands, and keep an eye on the line underneath: it is the first theorem of this lesson.</p>`,
        { fig: 'venn', a: [1, 2, 3, 4, 5, 6], b: [4, 5, 6, 7, 8], caption: 'Each element is drawn in the one region it belongs to. Try making the two sets disjoint, then make one a subset of the other.' },
        { skill: 'sets', check: "What is |{1, 2, 2, 3, 3, 3}|?", options: ["6", "3", "1"], answer: 1, why: "A set is determined by its elements; repetition does not count. The elements are 1, 2 and 3.", wrong: ["This counts the entries as written, as if the braces held a list. In a set repeats are the same element, so they are counted once.", null, "This counts the one value that is repeated most, or treats the repeats as collapsing everything into one element. Only repeats of the same value merge: 1, 2 and 3 stay separate."] },
        `<h2>The sum rule</h2>
<p>The first counting rule is so basic that we take it as our starting point rather than proving it. It is really a description of what counting means.</p>
<div class="stmt"><p><span class="kind">The sum rule.</span> If <i>A</i> and <i>B</i> are disjoint finite sets, then |<i>A</i> ∪ <i>B</i>| = |<i>A</i>| + |<i>B</i>|. More generally, if finite sets <i>A</i><sub>1</sub>, …, <i>A</i><sub><i>k</i></sub> have no element in common, any two of them, the size of their union is the sum of their sizes.</p></div>
<p>In words: to count a collection, split it into pieces that do not overlap and add up the sizes of the pieces. The word <em>disjoint</em> is essential. A class with 12 students in the band and 9 in the choir need not have 21 students who are in the band or the choir, because a student in both would be counted twice. The sum rule has an immediate consequence, which is often the easiest way to count something.</p>
<details class="reveal"><summary>Guess first: 12 students are in the band, 9 in the choir, and 4 are in both. How many are in the band or the choir?</summary><p>12 + 9 − 4 = 17. Adding 12 and 9 counts the 4 students in both groups twice. The next section turns this into a theorem.</p></details>
<div class="stmt"><p><span class="kind">Corollary (the complement rule).</span> If <i>A</i> ⊆ <i>U</i> and <i>U</i> is finite, then |<i>U</i> − <i>A</i>| = |<i>U</i>| − |<i>A</i>|.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Each element of <i>U</i> is either in <i>A</i> or not, and not both. So <i>U</i> is the union of the disjoint sets <i>A</i> and <i>U</i> − <i>A</i>, and by the sum rule |<i>U</i>| = |<i>A</i>| + |<i>U</i> − <i>A</i>|. Subtract |<i>A</i>| from both sides. <span class="qed">∎</span></p></div>
<p>(A <em>corollary</em> is a theorem that follows quickly from something already proved.) The complement rule is the standard way to count "at least one": count the things with <em>none</em>, which is usually easy, and subtract from the total.</p>
<details class="reveal"><summary>Guess first: a class of 30 students has 22 who passed a test. How many did not?</summary><p>30 − 22 = 8, the complement rule with <i>U</i> the whole class and <i>A</i> the students who passed.</p></details>
<h2>Inclusion–exclusion</h2>
<p>When two sets overlap, the sum rule does not apply to them directly. It can still be applied to the pieces of the Venn diagram, and that is the whole proof of the next theorem.</p>
<div class="stmt"><p><span class="kind">Theorem 1 (inclusion–exclusion).</span> For finite sets <i>A</i> and <i>B</i>, &nbsp;|<i>A</i> ∪ <i>B</i>| = |<i>A</i>| + |<i>B</i>| − |<i>A</i> ∩ <i>B</i>|.</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> Each element of <i>A</i> ∪ <i>B</i> lies in exactly one of the three sets <i>A</i> − <i>B</i>, <i>A</i> ∩ <i>B</i> and <i>B</i> − <i>A</i>.</p>
<p class="why">An element of the union is in <i>A</i>, in <i>B</i>, or in both. "Only in <i>A</i>", "in both" and "only in <i>B</i>" are those three cases, and no element can be in two of them. These are the three regions of the diagram.</p>
<p>So, by the sum rule, &nbsp;|<i>A</i> ∪ <i>B</i>| = |<i>A</i> − <i>B</i>| + |<i>A</i> ∩ <i>B</i>| + |<i>B</i> − <i>A</i>|. &nbsp;(1)</p>
<p class="why">The sum rule needs pieces that do not overlap, and the previous step showed that these three do not. This is the only step in the proof that counts anything.</p>
<p>In the same way, <i>A</i> is the union of the disjoint sets <i>A</i> − <i>B</i> and <i>A</i> ∩ <i>B</i>, so |<i>A</i>| = |<i>A</i> − <i>B</i>| + |<i>A</i> ∩ <i>B</i>|. Likewise |<i>B</i>| = |<i>B</i> − <i>A</i>| + |<i>A</i> ∩ <i>B</i>|.</p>
<p class="why">Each element of <i>A</i> is either also in <i>B</i> or not, and not both: the same pieces, seen from inside one circle at a time.</p>
<p>Adding these two equations gives |<i>A</i>| + |<i>B</i>| = |<i>A</i> − <i>B</i>| + |<i>B</i> − <i>A</i>| + 2|<i>A</i> ∩ <i>B</i>|. That is the right side of (1) with one extra |<i>A</i> ∩ <i>B</i>|, so subtracting |<i>A</i> ∩ <i>B</i>| gives the theorem. <span class="qed">∎</span></p>
<p class="why">Plain algebra. The 2 is the whole story of the formula: adding |<i>A</i>| and |<i>B</i>| counts every element of the overlap twice, once for each set, so it must be taken away once.</p></div>
<p>A worked example. How many of the whole numbers from 1 to 100 are divisible by 2 or by 3? Let <i>A</i> be the multiples of 2 and <i>B</i> the multiples of 3 in that range. There are 50 multiples of 2, and 33 multiples of 3, since 3 × 33 = 99. A number divisible by both 2 and 3 is divisible by 6, and there are 16 multiples of 6 up to 100, since 6 × 16 = 96. So the answer is 50 + 33 − 16 = 67.</p>
<details class="reveal"><summary>Predict: how many of the numbers from 1 to 100 are divisible by <em>neither</em> 2 nor 3?</summary><p>100 − 67 = 33, by the complement rule, with <i>U</i> the numbers from 1 to 100 and the set you subtract the 67 numbers divisible by 2 or 3. They are exactly the numbers that leave remainder 1 or 5 when divided by 6.</p></details>
<h2>The product rule</h2>
<div class="stmt"><p><span class="kind">Definition.</span> The <em>Cartesian product</em> <i>A</i> × <i>B</i> is the set of all ordered pairs (<i>a</i>, <i>b</i>) with <i>a</i> ∈ <i>A</i> and <i>b</i> ∈ <i>B</i>. More generally, <i>A</i><sub>1</sub> × … × <i>A</i><sub><i>k</i></sub> is the set of all sequences (<i>a</i><sub>1</sub>, …, <i>a</i><sub><i>k</i></sub>) with each <i>a</i><sub><i>i</i></sub> ∈ <i>A</i><sub><i>i</i></sub>.</p></div>
<p>Unlike a set, a pair has an order: (1, 2) ≠ (2, 1). A pair is the record of two choices made one after the other: a shirt and then a pair of trousers, a letter and then a digit.</p>
<div class="stmt"><p><span class="kind">Theorem 2 (the product rule).</span> For finite sets, |<i>A</i> × <i>B</i>| = |<i>A</i>| · |<i>B</i>|. More generally, |<i>A</i><sub>1</sub> × … × <i>A</i><sub><i>k</i></sub>| = |<i>A</i><sub>1</sub>| · … · |<i>A</i><sub><i>k</i></sub>|.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Sort the pairs into groups by their first entry. For each <i>a</i> ∈ <i>A</i>, the group of pairs that begin with <i>a</i> is (<i>a</i>, <i>b</i>) for each of the |<i>B</i>| choices of <i>b</i>, so it has |<i>B</i>| elements. No pair is in two groups, since a pair has only one first entry, and every pair is in some group. There is one group for each of the |<i>A</i>| elements of <i>A</i>, so by the sum rule |<i>A</i> × <i>B</i>| is |<i>B</i>| added to itself |<i>A</i>| times, which is |<i>A</i>| · |<i>B</i>|. For <i>k</i> sets, treat a sequence of length <i>k</i> as a pair: a sequence of length <i>k</i> − 1, followed by one more entry, and apply the two-set case repeatedly. <span class="qed">∎</span></p></div>
<p>(Strictly speaking, "apply it repeatedly" is an induction, the technique of Lesson 3.) The groups in the proof are the rows of a grid with one row for each element of <i>A</i> and one column for each element of <i>B</i>: |<i>A</i>| rows of |<i>B</i>| pairs each. A program with two nested loops, the outer one over <i>A</i> and the inner one over <i>B</i>, visits exactly this grid, so its innermost line runs |<i>A</i>| · |<i>B</i>| times. Nested loops <em>are</em> the product rule.</p>
<details class="reveal"><summary>Guess first: how many times does the innermost line run in <code>for i in range(3): for j in range(4):</code>?</summary><p>12 times, 3 · 4: one row of the grid for each <code>i</code>, four pairs in each row.</p></details>
<p>Some examples. A four-digit PIN is a sequence of four digits, each from a set of 10, so there are 10 · 10 · 10 · 10 = 10 000 PINs. A licence plate of three letters followed by three digits: 26³ · 10³ = 17 576 000.</p>
<p>The product rule counts sequences whose entries are chosen from fixed sets. It still gives the right answer when the <em>set</em> of options at a step depends on the earlier choices, provided the <em>number</em> of options does not. A club of 20 people chooses a president, then a secretary, then a treasurer, and nobody may hold two offices. There are 20 choices for president, then 19 for secretary (anyone but the president), then 18 for treasurer: 20 · 19 · 18 = 6840. Which 19 people are available depends on who became president, but there are always 19, and the count only needs the number.</p>
<details class="reveal"><summary>Predict: in how many different orders can 5 different books be arranged on a shelf?</summary><p>5 · 4 · 3 · 2 · 1 = 120. Five choices for the first position, then four books are left for the second, and so on. The product 1 · 2 · … · <i>n</i> is written <i>n</i>! ("<i>n</i> factorial"), and Lesson 3 meets it again.</p></details>
<h2>Counting subsets</h2>
<p>How many subsets does a set with <i>n</i> elements have? For {<i>a</i>, <i>b</i>} you can list them: ∅, {<i>a</i>}, {<i>b</i>}, {<i>a</i>, <i>b</i>}. That is four. Listing does not scale, so we need a way to count them, and the way is to <em>match</em> the subsets with something we already know how to count.</p>
<div class="stmt"><p><span class="kind">Definition.</span> A <em>bijection</em> between sets <i>A</i> and <i>B</i> is a rule that pairs each element of <i>A</i> with exactly one element of <i>B</i>, in such a way that each element of <i>B</i> is paired with exactly one element of <i>A</i>.</p>
<p><span class="kind">The bijection rule.</span> If there is a bijection between finite sets <i>A</i> and <i>B</i>, then |<i>A</i>| = |<i>B</i>|.</p></div>
<p>The bijection rule is counting on your fingers: each object is matched with one raised finger, so there are as many objects as fingers. Its power is that it lets you count a set that is hard to count by matching it with one that is easy to count.</p>
<div class="stmt"><p><span class="kind">Theorem 3.</span> A set with <i>n</i> elements has exactly 2<sup><i>n</i></sup> subsets.</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> Call the elements <i>x</i><sub>1</sub>, …, <i>x</i><sub><i>n</i></sub>. Pair each subset <i>S</i> with the string of <i>n</i> bits whose <i>i</i>th bit is 1 if <i>x</i><sub><i>i</i></sub> ∈ <i>S</i> and 0 if <i>x</i><sub><i>i</i></sub> ∉ <i>S</i>.</p>
<p class="why">To use the bijection rule we need an actual pairing, stated for every subset at once. This one records, element by element, the answer to the only question a set answers: in or out?</p>
<p>This pairing is a bijection. Each subset gives exactly one string. Each string comes from exactly one subset, namely the set of those <i>x</i><sub><i>i</i></sub> whose bit is 1; two different subsets differ in some element, and so in that element's bit.</p>
<p class="why">Both halves of the definition must be checked: every subset gets a string, and every string is reached by exactly one subset. Nothing is missed and nothing is counted twice.</p>
<p>So the number of subsets equals the number of strings of <i>n</i> bits. Such a string is a sequence of <i>n</i> entries, each from {0, 1}, so by the product rule there are 2 · 2 · … · 2 = 2<sup><i>n</i></sup> of them. <span class="qed">∎</span></p>
<p class="why">The set of <i>n</i>-bit strings is {0, 1} × … × {0, 1}, a product of <i>n</i> copies of a two-element set, which is exactly what Theorem 2 counts.</p></div>
<details class="reveal"><summary>Back to the pizza shop: a pizza is a subset of the ten toppings. How many pizzas?</summary><p>2<sup>10</sup> = 1024, counting the plain pizza (no toppings) and the one with all ten. Each topping is in or out, and ten independent two-way choices multiply.</p></details>
<p>The set of all subsets of <i>S</i> is called the <em>power set</em> of <i>S</i>. Here is the bijection for {<i>a</i>, <i>b</i>, <i>c</i>}, with the strings listed in counting order. The rightmost bit stands for <i>a</i>, the middle one for <i>b</i>, the leftmost for <i>c</i>, so the rows are the numbers 0 to 7 written in binary.</p>
<table class="small"><tr><th>number</th><th>bits (<i>c b a</i>)</th><th>subset</th></tr><tr><td>0</td><td>000</td><td>∅</td></tr><tr><td>1</td><td>001</td><td>{<i>a</i>}</td></tr><tr><td>2</td><td>010</td><td>{<i>b</i>}</td></tr><tr><td>3</td><td>011</td><td>{<i>a</i>, <i>b</i>}</td></tr><tr><td>4</td><td>100</td><td>{<i>c</i>}</td></tr><tr><td>5</td><td>101</td><td>{<i>a</i>, <i>c</i>}</td></tr><tr><td>6</td><td>110</td><td>{<i>b</i>, <i>c</i>}</td></tr><tr><td>7</td><td>111</td><td>{<i>a</i>, <i>b</i>, <i>c</i>}</td></tr></table>
<p>You have met this count before. Lesson 1 said a truth table for <i>n</i> propositions has 2<sup><i>n</i></sup> rows. A row gives each proposition the value T or F, which is a string of <i>n</i> bits, so Theorem 3's argument counts the rows too. Subsets, bit strings, rows of a truth table: one count in three disguises, matched by bijections.</p>
<p>The number 2<sup><i>n</i></sup> grows very fast. A set of 20 elements has about a million subsets, a set of 40 about a trillion, and a set of 300 has more subsets than there are atoms in the observable universe. That is why a search that tries "every subset" is hopeless for large <i>n</i>, and Lesson 14 is built on that fact.</p>
<h2>The laboratory</h2>
<p>The table suggests a way to <em>list</em> every subset by machine: count <i>k</i> from 0 to 2<sup><i>n</i></sup> − 1, and for each <i>k</i> include item <i>i</i> exactly when bit <i>i</i> of <i>k</i> is 1, counting bits from 0 at the right. Bit <i>i</i> of <i>k</i> is <code>(k // 2 ** i) % 2</code>: dividing by 2<sup><i>i</i></sup> shifts the bits <i>i</i> places to the right, and <code>% 2</code> keeps the last one. (Python also writes this <code>(k &gt;&gt; i) &amp; 1</code>.) This program is Theorem 3's bijection, run backwards.</p>`,
        { play: `items = ["a", "b", "c"]
n = len(items)
count = 0
for k in range(2 ** n):
    bits = bin(k)[2:].zfill(n)          # k as an n-digit binary string
    chosen = [items[i] for i in range(n) if (k // 2 ** i) % 2 == 1]
    print(k, bits, chosen)
    count += 1
print(count, "subsets")`, predict: true, caption: 'The output is the table above: eight lines, k = 0 to 7, ending with "8 subsets" (2³). Each line shows k, its three bits, and the items whose bit is 1, so line 5 is  5 101 [\'a\', \'c\']. The rightmost bit switches on every line, like the ones digit of a counter, and it decides whether "a" is in. Add a fourth and a fifth item and predict the count before running.' },
        { skill: 'sets', check: "|A| = 10, |B| = 8, |A ∩ B| = 3. What is |A ∪ B|?", options: ["18", "15", "21"], answer: 1, why: "Inclusion–exclusion: 10 + 8 − 3. Adding the sizes alone counts the overlap twice.", wrong: ["Adding the sizes forgets that the 3 elements in both sets were counted once for each set. Take them away once.", null, "This adds the overlap instead of subtracting it, so the shared elements are counted three times. They were already counted twice; remove one of the counts."] },
        { skill: 'counting', check: "How many subsets does a set with 5 elements have?", options: ["25", "32", "10"], answer: 1, why: "Each element is in or out: 2 choices each, 2⁵ = 32 subsets, including the empty set and the whole set.", wrong: ["This is 5², a square. Each element is an independent in-or-out choice, so the choices multiply 2 · 2 · 2 · 2 · 2, which is a power of 2, not a power of 5.", null, "This is 2 · 5: it adds the choices instead of multiplying them. By the product rule, 5 independent choices with 2 options each give 2⁵."] },
        `<p>Running the program for 3, 4 and 5 items checks Theorem 3 in three cases, and the proof is what tells you it holds for every <i>n</i>. The program is still useful beyond checking: listing all subsets is a legitimate method whenever <i>n</i> is small, and Lesson 14 uses exactly this method on the subset sum problem.</p>
<h2>The pigeonhole principle</h2>
<p>The last rule of the lesson does not count anything exactly. It proves that something <em>must exist</em>.</p>
<div class="stmt"><p><span class="kind">Theorem 4 (the pigeonhole principle).</span> If more than <i>n</i> objects are placed in <i>n</i> boxes, then some box contains at least two objects.</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> We prove the contrapositive: if every box contains at most one object, then there are at most <i>n</i> objects.</p>
<p class="why">Lesson 1, Theorem 2: an implication and its contrapositive are logically equivalent, so proving either one proves the other. The contrapositive is easier here, because "at most one object in every box" is something we can add up.</p>
<p>Suppose every box contains at most one object. Each object is in exactly one box, so by the sum rule the number of objects is the sum of the numbers in the <i>n</i> boxes. Each of those numbers is 0 or 1, so the sum is at most <i>n</i>. <span class="qed">∎</span></p>
<p class="why">The contents of the boxes are disjoint sets whose union is all the objects, which is exactly the situation the sum rule describes.</p></div>
<p>The principle is obvious, and the skill lies entirely in choosing what the boxes are. Among any 13 people, two were born in the same month: the boxes are the 12 months. A drawer holds black, white and grey socks; take 4 in the dark and two will match: the boxes are the 3 colours. In each case the principle tells you a pair exists without telling you which pair, and often that is all an argument needs. In Lesson 9 it will prove that a machine with a fixed amount of memory cannot count as high as it likes.</p>`,
        { photo: 'pigeonholes', caption: "Ten pigeons and nine pigeonholes, so at least one hole must hold two: here it is the top left one. The principle tells you a crowded hole exists before you look." },
        `<details class="reveal"><summary>Predict: in the sock drawer, is 3 socks enough to be sure of a match? What if there were 10 colours?</summary><p>No: 3 socks can be one of each colour, one per box, which is exactly what the pigeonhole principle says can happen when the objects do not outnumber the boxes. With 10 colours you need 11 socks. In general, for <i>n</i> boxes you need <i>n</i> + 1 objects, and <i>n</i> are not enough.</p></details>
<h2>Before the exercises</h2>
<p>The first exercise is four counting questions. For each one, decide first which rule fits: <em>or</em> between overlapping sets is inclusion–exclusion; a sequence of choices is the product rule; <em>at least one</em> is usually the complement rule. Then compute. Here is a worked example of the last kind, including the tempting wrong method.</p>
<p><b>How many strings of 3 letters from {a, b, c, d} contain at least one a?</b> Tempting: "choose where the a goes (3 ways), then fill the other two places any way (4 · 4 = 16), giving 48." That counts the string <i>aab</i> twice, once with the chosen a in the first place and once in the second, and <i>aaa</i> three times. The complement rule avoids the trap. All strings: 4³ = 64, by the product rule. Strings with no a: each letter comes from {b, c, d}, so 3³ = 27. Strings with at least one a: 64 − 27 = 37.</p>
<p>The second exercise asks you to recognise a correct pigeonhole proof. For any such proof, check three things: what the boxes are, that there are fewer boxes than objects, and that two objects in the same box really do give what the claim says.</p>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Adding the sizes of sets that overlap: the sum rule needs disjoint sets, and otherwise the overlap is counted twice. Using the product rule when the number of options changes with earlier choices in a way you have not accounted for: codes with no repeated letter are 26 · 25 · 24, not 26³. Counting "at least one" directly and counting some cases several times; use the complement. Forgetting the empty set and the whole set when counting subsets. Treating {1, 2} and (1, 2) as the same thing: a set has no order, a pair does. In a pigeonhole argument, having as many objects as boxes rather than more.</p>` },
        {
          ex: {
            id: 'ma-2-1', skill: 'counting', kind: 'answer', title: 'Counting without listing',
            prompt: `<p>Answer each question with a single number. Decide which rule applies before you compute: inclusion–exclusion, the product rule, or the complement rule.</p>`,
            parts: [
              { label: '(a) How many of the whole numbers from 1 to 60 are divisible by 3 or by 4?', answer: '30', width: '6rem',
                wrong: [{ match: '35', msg: 'That is 20 + 15: the multiples of 12 have been counted twice, once as multiples of 3 and once as multiples of 4. Subtract them once.' }, { match: '25', msg: 'Close, but the overlap has been subtracted twice. Inclusion–exclusion takes it away once: |A| + |B| − |A ∩ B|.' }, { match: '5', msg: 'That is the number divisible by both, the intersection. The question asks for the union.' }] },
              { label: '(b) A code is 3 different letters from A–Z, in order (so ABC and CBA are different codes, and AAB is not allowed). How many codes are there?', answer: '15600', width: '8rem',
                wrong: [{ match: '17576', msg: 'That is 26³, which allows a letter to be repeated. After the first letter, only 25 remain for the second.' }, { match: '2600', msg: 'That counts sets of 3 letters, where order does not matter. Here ABC and CBA are different codes.' }, { match: '78', msg: 'That is 26 · 3. The product rule multiplies the number of options at each step: 26, then 25, then 24.' }] },
              { label: '(c) How many subsets of {1, 2, 3, 4, 5, 6} contain the element 1?', answer: '32', width: '6rem',
                wrong: [{ match: '64', msg: 'That is the number of all subsets. Only some of them contain 1.' }, { match: ['6', '63'], msg: 'A subset containing 1 is decided by which of the other five elements it contains. How many ways are there to make five in-or-out choices?' }] },
              { label: '(d) How many strings of 4 letters from {a, b, c} contain at least one a?', answer: '65', width: '6rem',
                wrong: [{ match: '108', msg: 'That is 4 · 27: a place for the a, then anything elsewhere. It counts strings with several a\u2019s several times. Use the complement: all strings minus those with no a.' }, { match: '81', msg: 'That is all 3⁴ strings, including those with no a at all. Subtract those.' }, { match: '16', msg: 'That is the number of strings with no a (2⁴). The question asks for the rest.' }] }
            ],
            hints: ['(a) Multiples of 3 up to 60: 20. Multiples of 4: 15. Numbers divisible by both are the multiples of 12. (b) 26 choices, then 25, then 24.', '(c) The element 1 is in; each of 2, 3, 4, 5, 6 is independently in or out. (d) 3⁴ strings in all; 2⁴ of them use only b and c.'],
            solution: `<p>(a) Inclusion–exclusion: 20 multiples of 3, 15 multiples of 4, and 5 multiples of 12 (the numbers divisible by both), so 20 + 15 − 5 = <b>30</b>.</p><p>(b) Product rule with a shrinking number of options: 26 · 25 · 24 = <b>15 600</b>.</p><p>(c) Pair each subset containing 1 with the subset of {2, 3, 4, 5, 6} you get by removing 1. That is a bijection, so the answer is the number of subsets of a 5-element set, 2⁵ = <b>32</b>: exactly half of the 64 subsets.</p><p>(d) Complement rule: 3⁴ = 81 strings in all, 2⁴ = 16 with no a, so 81 − 16 = <b>65</b>.</p>`,
            followup: 'Part (c) used a bijection to turn a new question into one already answered. That move, matching with something you can count, is the most useful single idea in counting.'
          }
        },
        {
          ex: {
            id: 'ma-2-2', skill: 'pigeonhole', kind: 'choice', title: 'A proof by pigeonhole',
            prompt: `<div class="stmt"><p><span class="kind">Claim.</span> Among any 5 whole numbers, there are two that leave the same remainder when divided by 4.</p></div><p>Which of the following is a correct proof of the claim?</p>`,
            options: [
              { text: 'Try 1, 2, 3, 4, 5: here 1 and 5 both leave remainder 1. Try 10, 11, 12, 13, 14: here 10 and 14 both leave remainder 2. Every example works, so the claim is true.', why: 'Two examples, or two thousand, check cases; they do not cover every choice of 5 numbers. There are infinitely many choices, so a proof must reason about all of them at once.' },
              { text: 'When a whole number is divided by 4, the remainder is one of 0, 1, 2, 3. Put each of the 5 numbers in the box for its remainder. That is 5 numbers in 4 boxes, so by the pigeonhole principle some box holds two of them, and those two leave the same remainder.', ok: true },
              { text: 'When a whole number is divided by 4, there are 5 possible remainders, 0 to 4, so each of the 5 numbers can have a different one. Therefore two of them must match.', why: 'The remainder after dividing by 4 is always less than 4, so there are only 4 possible remainders. And the conclusion does not follow from the argument as written: if 5 numbers could have 5 different remainders, nothing would force two to match.' },
              { text: 'Among any 5 whole numbers, two are next to each other, and numbers next to each other leave the same remainder when divided by 4.', why: 'Both parts are false. 0, 10, 20, 30, 40 contains no two neighbours, and neighbours such as 6 and 7 leave different remainders (2 and 3).' }
            ],
            hints: ['A proof must work for every choice of 5 numbers, not just the ones tried.', 'Pigeonhole: what are the boxes, how many are there, and are there more numbers than boxes?'],
            solution: `<p>The second option is the proof. The boxes are the four possible remainders 0, 1, 2 and 3; the objects are the 5 numbers; 5 &gt; 4, so by the pigeonhole principle two numbers share a box, which means they share a remainder. Each step can be checked, and none of them depends on which 5 numbers were chosen.</p><p>The first option checks examples, which never proves a claim about infinitely many cases. The third miscounts the boxes, and with its count the principle would not apply. The fourth rests on two false statements.</p>`,
            followup: 'The same argument shows more: among any n + 1 whole numbers, two have a difference divisible by n. Two numbers with the same remainder differ by a multiple of n.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A set is determined by its elements: order and repetition do not matter. ⊆, ∪, ∩ and − are defined by "every", "or", "and" and "and not".</li>
<li>Sum rule: for disjoint sets, sizes add. Complement rule: |<i>U</i> − <i>A</i>| = |<i>U</i>| − |<i>A</i>|, the way to count "at least one".</li>
<li>Inclusion–exclusion: |<i>A</i> ∪ <i>B</i>| = |<i>A</i>| + |<i>B</i>| − |<i>A</i> ∩ <i>B</i>|, proved by splitting the Venn diagram into three disjoint pieces.</li>
<li>Product rule: a sequence of choices with <i>a</i>, then <i>b</i>, … options gives <i>a</i> · <i>b</i> · … outcomes. Nested loops are the product rule.</li>
<li>A bijection shows two sets have the same size. Subsets of an <i>n</i>-element set match <i>n</i>-bit strings, so there are 2<sup><i>n</i></sup> of them, and counting in binary lists them.</li>
<li>Pigeonhole: more objects than boxes means some box has two. The skill is choosing the boxes.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-11', '3B-AP-13', '9.2.4.6', '9.2.4.7'],
      standard: 1,
      title: 'Checking is not proving', summary: 'Why a thousand true cases prove nothing, what a proof actually is, and induction: the one technique that proves a claim about every number at once.',
      blocks: [
        `<p>Here is a claim about whole numbers: <i>for every</i> <i>n</i> ≥ 0, <i>n</i>² + <i>n</i> + 41 <i>is prime</i>. Check a few. <i>n</i> = 0 gives 41, <i>n</i> = 1 gives 43, <i>n</i> = 2 gives 47, <i>n</i> = 3 gives 53. All prime. It keeps working through <i>n</i> = 39. Let a program do the checking, then push it one step further. After so many true cases, are you sure the claim holds for every <i>n</i>?</p>`,
        { play: `def is_prime(n):
    if n < 2:
        return False
    d = 2
    while d * d <= n:
        if n % d == 0:
            return False
        d += 1
    return True

for n in range(0, 40):
    print(n, n * n + n + 41, is_prime(n * n + n + 41))`, caption: 'Forty true cases. Change 40 to 42 and look at n = 40.' },
        { skill: 'counterexample', check: "A formula has held for the first 10,000 cases. What has been shown?", options: ["The formula is true for every n", "Nothing about the cases not checked; one counterexample would refute it", "The formula is probably false"], answer: 1, why: "Checking is not proving. n² + n + 41 is prime for forty values and fails at 40.", wrong: ["This treats many true cases as a proof. A counterexample can wait beyond the cases checked, as 40 did for forty good values.", null, "The checked cases do not count against the claim either: a true claim also passes every check. Passing cases simply tell us nothing about the unchecked ones."] },
        `<details class="reveal"><summary>Guess first: forty cases in a row were prime. Is the value for <i>n</i> = 40 prime too?</summary><p>No. Change 40 to 42 in the program and it prints <code>40 1681 False</code>. Forty true cases were no guarantee about the forty-first.</p></details>
<p>At <i>n</i> = 40 the value is 1681, which is 41 × 41. You could have seen this coming without a computer: 40² + 40 + 41 = 40 · 41 + 41 = 41 · 41. Forty true cases were not evidence of anything; the claim was simply false, and the first counterexample happened to sit at 40.</p>
<p>This is not a freak. Fermat believed that 2<sup>2<sup><i>n</i></sup></sup> + 1 is prime for every <i>n</i>; it is, for <i>n</i> = 0, 1, 2, 3, 4, and then 2<sup>32</sup> + 1 = 641 × 6 700 417. The claim "<i>n</i><sup>17</sup> + 9 and (<i>n</i> + 1)<sup>17</sup> + 9 never share a factor" is true for every <i>n</i> you could ever test by hand or by computer: its first counterexample has 52 digits. In mathematics, <em>checking</em> and <em>proving</em> are different activities, and only one of them settles a question.</p>`,
        `<div class="stmt"><p><span class="kind">Definition.</span> A <em>predicate</em> is a statement whose truth depends on a variable, such as <i>P</i>(<i>n</i>): "<i>n</i>² + <i>n</i> + 41 is prime". Give <i>n</i> a value and <i>P</i>(<i>n</i>) becomes a proposition, true or false, as in Lesson 1.</p>
<p><span class="kind">Definition.</span> A <em>counterexample</em> to the claim "for every <i>n</i>, <i>P</i>(<i>n</i>)" is one value of <i>n</i> for which <i>P</i>(<i>n</i>) is false.</p></div>
<p>The two definitions are not symmetric, and that asymmetry is the first lesson. <b>One counterexample refutes a "for every" claim completely.</b> But when there are infinitely many <i>n</i>, <b>no list of true cases proves it</b>, because the counterexample may be waiting in the cases you did not check. (When there are only finitely many cases and you check them all, that <em>is</em> a proof; the truth tables of Lesson 1 are proofs of exactly this kind.)</p>
<details class="reveal"><summary>Guess first: how many examples does it take to refute "every prime number is odd"?</summary><p>One: the number 2 is prime and even. A single counterexample ends the discussion, however many odd primes there are.</p></details>
<h2>What a proof is</h2>
<p>A proof covers every case at once. It does this not by visiting the cases but by reasoning about what all of them have in common. Here is a complete one, small enough to look at under a microscope.</p>
<div class="stmt"><p><span class="kind">Definition.</span> An integer <i>n</i> is <em>even</em> if <i>n</i> = 2<i>k</i> for some integer <i>k</i>, and <em>odd</em> if <i>n</i> = 2<i>k</i> + 1 for some integer <i>k</i>.</p></div>
<div class="stmt"><p><span class="kind">Theorem 1.</span> The sum of two even integers is even.</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> Let <i>m</i> and <i>n</i> be even integers.</p>
<p class="why">The claim is about <em>every</em> pair of even integers. So we take a pair and allow ourselves to know only one thing about it: that both are even. Whatever we deduce from that one fact is true of every pair.</p>
<p>By the definition of even, <i>m</i> = 2<i>a</i> and <i>n</i> = 2<i>b</i> for some integers <i>a</i> and <i>b</i>.</p>
<p class="why">Unpacking a definition is always a legal move. Note the two different letters: <i>m</i> and <i>n</i> need not be the same number, so we must not write 2<i>a</i> for both.</p>
<p>Then <i>m</i> + <i>n</i> = 2<i>a</i> + 2<i>b</i> = 2(<i>a</i> + <i>b</i>).</p>
<p class="why">Algebra you already know. Each equals sign is a step a sceptic can check.</p>
<p>Since <i>a</i> + <i>b</i> is an integer, <i>m</i> + <i>n</i> is 2 times an integer, which is the definition of even. <span class="qed">∎</span></p>
<p class="why">We finish by matching the definition word for word. The proof never mentioned a specific number, so it applies to 4 + 6 and to 2<sup>100</sup> + 10<sup>50</sup> alike.</p></div>
<div class="stmt"><p><span class="kind">Definition.</span> A <em>proof</em> is a chain of statements, each of which follows from definitions, from facts already established, or from earlier statements in the chain by a rule everyone accepts, and whose last statement is the claim.</p></div>
<p>The little square ∎ marks the end of a proof. It says: nothing further is needed; a careful sceptic who is not allowed to say "I believe you" has been answered.</p>
<details class="reveal"><summary>Try it: prove that the product of two odd integers is odd.</summary><p>Let <i>m</i> and <i>n</i> be odd. By definition <i>m</i> = 2<i>a</i> + 1 and <i>n</i> = 2<i>b</i> + 1 for some integers <i>a</i>, <i>b</i>. Then <i>mn</i> = (2<i>a</i> + 1)(2<i>b</i> + 1) = 4<i>ab</i> + 2<i>a</i> + 2<i>b</i> + 1 = 2(2<i>ab</i> + <i>a</i> + <i>b</i>) + 1. Since 2<i>ab</i> + <i>a</i> + <i>b</i> is an integer, <i>mn</i> is odd by definition. ∎ Notice the same three moves: name the objects, unpack the definition, do algebra, match the definition.</p></details>
<h2>Induction</h2>
<p>Many claims have the form "for every <i>n</i> = 0, 1, 2, 3, …, <i>P</i>(<i>n</i>)". Infinitely many cases, so checking cannot work. The tool for these claims is a single principle, which we state precisely and then explain.</p>
<div class="stmt"><p><span class="kind">The Principle of Induction.</span> Let <i>P</i>(<i>n</i>) be a predicate about whole numbers. Suppose that</p>
<p>(1) <i>P</i>(0) is true, and</p>
<p>(2) for every <i>n</i> ≥ 0, <em>if</em> <i>P</i>(<i>n</i>) is true <em>then</em> <i>P</i>(<i>n</i> + 1) is true.</p>
<p>Then <i>P</i>(<i>n</i>) is true for every whole number <i>n</i>.</p></div>
<p>Think of a row of dominoes, one for each <i>n</i>. Condition (1) says the first domino falls. Condition (2) says every falling domino knocks over the next one. Then they all fall: domino 0 knocks over 1, which knocks over 2, and so on to any domino you name. (The principle works just as well starting from 1, or from any other whole number; then it proves <i>P</i>(<i>n</i>) for every <i>n</i> from that starting point on.)</p>`,
        { photo: 'dominoes-falling', caption: "Induction in one picture. Nobody pushes the tenth domino: the first one is pushed (the base case), and each falling domino knocks over the next (the inductive step)." },
        `<p>Condition (1) is called the <em>base case</em>. Condition (2) is the <em>inductive step</em>, and inside it the assumption "<i>P</i>(<i>n</i>) is true" is called the <em>inductive hypothesis</em>. Here is the principle in use.</p>
<div class="stmt"><p><span class="kind">Theorem 2.</span> For every <i>n</i> ≥ 1, &nbsp;1 + 2 + 3 + … + <i>n</i> = <i>n</i>(<i>n</i> + 1)/2.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Let <i>P</i>(<i>n</i>) be the predicate "1 + 2 + … + <i>n</i> = <i>n</i>(<i>n</i> + 1)/2". We prove <i>P</i>(<i>n</i>) for all <i>n</i> ≥ 1 by induction.</p>
<p><b>Base case.</b> <i>P</i>(1) says 1 = 1 · 2/2. Both sides are 1, so <i>P</i>(1) is true.</p>
<p><b>Inductive step.</b> Let <i>n</i> ≥ 1 and assume <i>P</i>(<i>n</i>): that is, assume 1 + 2 + … + <i>n</i> = <i>n</i>(<i>n</i> + 1)/2. We must show <i>P</i>(<i>n</i> + 1), which says 1 + 2 + … + (<i>n</i> + 1) = (<i>n</i> + 1)(<i>n</i> + 2)/2. Start from its left side:</p>
<p style="text-align:center">1 + 2 + … + (<i>n</i> + 1) = (1 + 2 + … + <i>n</i>) + (<i>n</i> + 1) = <i>n</i>(<i>n</i> + 1)/2 + (<i>n</i> + 1),</p>
<p>using the inductive hypothesis for the last step. Factor out (<i>n</i> + 1): this equals (<i>n</i> + 1)(<i>n</i>/2 + 1) = (<i>n</i> + 1)(<i>n</i> + 2)/2, which is the right side of <i>P</i>(<i>n</i> + 1). So <i>P</i>(<i>n</i>) implies <i>P</i>(<i>n</i> + 1).</p>
<p>By the Principle of Induction, <i>P</i>(<i>n</i>) is true for every <i>n</i> ≥ 1. <span class="qed">∎</span></p></div>
<details class="reveal"><summary>Isn't the inductive step assuming what we want to prove?</summary><p>No, and this is the point people most often get stuck on. We do not assume the formula for all <i>n</i>; we assume it for one particular <i>n</i> and derive it for the next one. What the step establishes is a conditional statement, "if <i>P</i>(<i>n</i>) then <i>P</i>(<i>n</i> + 1)", and a conditional can be proved by assuming its "if" part. On its own the step proves nothing about any particular number: it only says each domino knocks over the next. Combined with the base case, it proves everything.</p></details>
<details class="reveal"><summary>What must every induction proof contain?</summary><p>Three things, and it helps to write them in this order. (i) Say exactly what <i>P</i>(<i>n</i>) is. (ii) Prove the base case, by direct calculation. (iii) In the inductive step, write "assume <i>P</i>(<i>n</i>)" and then, separately, what <i>P</i>(<i>n</i> + 1) says; then show one leads to the other. Proofs that go wrong usually skipped one of the three, most often (i): if you have not said what <i>P</i>(<i>n</i>) is, you cannot tell whether you have used it.</p></details>
<h2>The Tower of Hanoi</h2>
<p>Three pegs, <i>n</i> discs of different sizes stacked in order on the first peg, and one rule: never place a larger disc on a smaller one. Move the whole stack to the third peg. There is a strategy that always works: move the top <i>n</i> − 1 discs to the spare peg (using the same strategy, with the big disc sitting harmlessly underneath), move the largest disc to its destination, then move the <i>n</i> − 1 discs back on top of it.</p>
<div class="stmt"><p><span class="kind">Definition.</span> Let <i>M</i>(<i>n</i>) be the number of single-disc moves this strategy makes for <i>n</i> discs.</p></div>
<p>With no discs there is nothing to do, so <i>M</i>(0) = 0. For <i>n</i> ≥ 1 the strategy makes <i>M</i>(<i>n</i> − 1) moves, then 1, then <i>M</i>(<i>n</i> − 1) again:</p>
<p style="text-align:center"><i>M</i>(0) = 0, &nbsp;&nbsp; <i>M</i>(<i>n</i>) = 2<i>M</i>(<i>n</i> − 1) + 1 for <i>n</i> ≥ 1.</p>
<p>A rule like this, giving each value in terms of earlier ones, is called a <em>recurrence</em> (Lesson 18 shows how to solve many of them). It lets us compute by hand:</p>
<table class="small"><tr><th><i>n</i></th><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td></tr><tr><th><i>M</i>(<i>n</i>)</th><td>0</td><td>1</td><td>3</td><td>7</td><td>15</td><td>31</td><td>63</td></tr></table>
<p>Each entry is one less than a power of two. That is a conjecture, and after the first part of this lesson you know what a conjecture is worth. Induction turns it into a theorem.</p>
<div class="stmt"><p><span class="kind">Theorem 3.</span> <i>M</i>(<i>n</i>) = 2<sup><i>n</i></sup> − 1 for every <i>n</i> ≥ 0.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> By induction on <i>n</i>, with <i>P</i>(<i>n</i>) the statement <i>M</i>(<i>n</i>) = 2<sup><i>n</i></sup> − 1.</p>
<p><b>Base case.</b> <i>M</i>(0) = 0 = 2<sup>0</sup> − 1. ✓</p>
<p><b>Inductive step.</b> Assume <i>M</i>(<i>n</i>) = 2<sup><i>n</i></sup> − 1 for some <i>n</i> ≥ 0. By the recurrence, <i>M</i>(<i>n</i> + 1) = 2<i>M</i>(<i>n</i>) + 1 = 2(2<sup><i>n</i></sup> − 1) + 1 = 2<sup><i>n</i>+1</sup> − 2 + 1 = 2<sup><i>n</i>+1</sup> − 1, which is <i>P</i>(<i>n</i> + 1). <span class="qed">∎</span></p></div>
<p>Read the theorem carefully: it says this <em>strategy</em> takes 2<sup><i>n</i></sup> − 1 moves. It does not say that no cleverer strategy could do better. That is a separate claim and needs a separate proof.</p>
<details class="reveal"><summary>Can any strategy do it in fewer than 2ⁿ − 1 moves?</summary><p>No. Let <i>L</i>(<i>n</i>) be the smallest number of moves any strategy can use. Look at the moment the largest disc moves for the first time. Just before that, the other <i>n</i> − 1 discs cannot be on its peg (it must be the top disc there) or on its destination (they would lie under it, against the rule), so they are all stacked on the third peg, and getting them there took at least <i>L</i>(<i>n</i> − 1) moves. After the largest disc reaches its final home, the <i>n</i> − 1 discs still have to be moved onto it: at least <i>L</i>(<i>n</i> − 1) moves more. So <i>L</i>(<i>n</i>) ≥ 2<i>L</i>(<i>n</i> − 1) + 1, and <i>L</i>(0) = 0. The same induction as in Theorem 3 (with ≥ in place of =) gives <i>L</i>(<i>n</i>) ≥ 2<sup><i>n</i></sup> − 1. Our strategy achieves exactly that, so <i>L</i>(<i>n</i>) = 2<sup><i>n</i></sup> − 1: the strategy is the best possible.</p></details>
<p>The legend says that monks are moving 64 discs, one move per second, and that the world ends when they finish. That is 2<sup>64</sup> − 1 seconds, about 585 billion years. You are safe.</p>
<h2>Induction and recursion are the same idea</h2>
<p>A recursive function has the same two parts as an induction proof: a base case it answers directly, and a rule that answers <i>n</i> in terms of a smaller case. Here is the recurrence for <i>M</i> written as Python.</p>`,
        { code: `def M(n):
    if n == 0:                 # base case
        return 0
    return 2 * M(n - 1) + 1    # the rule for n in terms of n - 1`, caption: 'The recurrence as a program' },
        { skill: 'induction', check: "An induction proof shows P(n) ⇒ P(n + 1) for every n, but never checks P(0). What has it proved?", options: ["P(n) for all n ≥ 1", "Nothing: the dominoes may all be standing", "P(n) for all n"], answer: 1, why: "Both parts are needed. Without a base case, each domino would knock the next, but none has fallen.", wrong: ["The step links one case to the next, but it never says the first case is true. Without P(0), or P(1), nothing has fallen to start the chain.", null, "This is the claim induction makes, but only with both parts. The step alone says what follows from a true case; it does not supply one."] },
        { skill: 'induction', check: "How many moves does the Tower of Hanoi strategy make for 10 discs?", options: ["100", "1023", "20"], answer: 1, why: "M(n) = 2M(n − 1) + 1 with M(0) = 0 gives M(n) = 2ⁿ − 1, proved by induction.", wrong: ["This is 10², a guess from the pattern of squares. The recurrence doubles and adds one each time: 1, 3, 7, 15, …, so it grows as a power of 2.", null, "This is 2 · 10, as if each disc cost two moves. The count for each disc doubles the count for the discs above it."] },
        `<p>Running it for <i>n</i> = 5 and getting 31 checks one case. The proof of Theorem 3 is what tells you the function returns 2<sup><i>n</i></sup> − 1 for <em>every</em> <i>n</i>. When you write code you constantly make claims of this shape: this loop ends, this index never leaves the list, this function returns a sorted list. Tests check such claims on a few inputs; reasoning checks them on all of them. Good programmers do both.</p>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Believing a pattern because it held for many cases. Forgetting the base case: without it, "each domino knocks the next" proves nothing, because the dominoes may all be standing (Exercise 2 shows exactly this). Writing the inductive step as if <i>P</i>(<i>n</i> + 1) were already known, instead of assuming <i>P</i>(<i>n</i>) and deriving <i>P</i>(<i>n</i> + 1). Using the same letter for two different objects (writing both even numbers as 2<i>a</i>). And confusing "this method takes 2<sup><i>n</i></sup> − 1 moves" with "no method can do better": those are two theorems.</p>` },
        {
          ex: {
            id: 'ma-3-1', skill: 'counterexample', kind: 'answer', title: 'Find the counterexample',
            prompt: `<p>Each claim below is false. For each one, give the <em>smallest</em> whole number <i>n</i> that is a counterexample. Work by hand; the numbers are small.</p>`,
            parts: [
              { label: '(a) For every <i>n</i> ≥ 0, &nbsp;<i>n</i>² + <i>n</i> + 41 is prime. &nbsp; <i>n</i> =', answer: '40', width: '5rem',
                wrong: [{ match: '41', msg: 'At n = 41 the value is 41 × 43, so that is a counterexample — but not the smallest. Look one step earlier.' }, { match: '39', msg: '39² + 39 + 41 = 1601, and 1601 is prime (no divisor up to 40 works). The claim still holds there.' }] },
              { label: '(b) For every <i>n</i> ≥ 1, &nbsp;2<sup><i>n</i></sup> + 1 is prime. &nbsp; <i>n</i> =', answer: '3', width: '5rem',
                wrong: [{ match: ['1', '2'], msg: '2¹ + 1 = 3 and 2² + 1 = 5 are both prime.' }, { match: '4', msg: '2⁴ + 1 = 17 is prime, so n = 4 is not a counterexample. Something smaller already fails.' }] },
              { label: '(c) For every <i>n</i> ≥ 1, &nbsp;<i>n</i>! &lt; 2<sup><i>n</i></sup>. &nbsp;(Recall <i>n</i>! = 1 · 2 · … · <i>n</i>.) &nbsp; <i>n</i> =', answer: '4', width: '5rem',
                wrong: [{ match: '3', msg: '3! = 6 and 2³ = 8, so the claim still holds at n = 3.' }, { match: ['5', '6'], msg: 'That is a counterexample, but not the smallest one. Check n = 4.' }] }
            ],
            hints: ['A counterexample is a value of n that makes the statement false. Compute the values in order, starting from the smallest allowed n, and stop at the first one that fails.', 'For (a), the lesson already found a counterexample. For (b), the values are 3, 5, 9, … For (c), the factorials are 1, 2, 6, 24, … and the powers of two are 2, 4, 8, 16, …'],
            solution: `<p>(a) <i>n</i> = 40: the value 40² + 40 + 41 = 1681 = 41², not prime, and the lesson's table shows every earlier value is prime. (b) <i>n</i> = 3: 2³ + 1 = 9 = 3 × 3, while 2¹ + 1 = 3 and 2² + 1 = 5 are prime. (c) <i>n</i> = 4: 4! = 24 but 2⁴ = 16, and for <i>n</i> = 1, 2, 3 we have 1 &lt; 2, 2 &lt; 4, 6 &lt; 8.</p><p>In each case a single number settled the claim. No amount of further checking would have been needed, and none would have helped.</p>`,
            followup: 'Notice that (a) needed a little algebra to see (40 · 41 + 41 = 41 · 41) while (b) and (c) were plain arithmetic. Either way, one case ends the discussion.'
          }
        },
        {
          ex: {
            id: 'ma-3-2', skill: 'induction', kind: 'choice', title: 'A proof with a hole',
            prompt: `<p>A student offers the following proof.</p>
<div class="stmt"><p><span class="kind">Claim.</span> For every <i>n</i> ≥ 1, &nbsp;1 + 2 + … + <i>n</i> = (2<i>n</i> + 1)²/8.</p></div>
<div class="proof"><p><span class="kind">"Proof."</span> Let <i>P</i>(<i>n</i>) be the claim. Assume <i>P</i>(<i>n</i>) for some <i>n</i> ≥ 1. Then</p>
<p style="text-align:center">1 + 2 + … + (<i>n</i> + 1) = (2<i>n</i> + 1)²/8 + (<i>n</i> + 1) = (4<i>n</i>² + 4<i>n</i> + 1 + 8<i>n</i> + 8)/8 = (4<i>n</i>² + 12<i>n</i> + 9)/8 = (2<i>n</i> + 3)²/8 = (2(<i>n</i> + 1) + 1)²/8,</p>
<p>which is <i>P</i>(<i>n</i> + 1). So <i>P</i>(<i>n</i>) is true for every <i>n</i> ≥ 1 by induction. ∎</p></div>
<p>The claim is false (try <i>n</i> = 1). Where exactly is the hole?</p>`,
            options: [
              { text: 'The algebra in the inductive step is wrong.', why: 'Check it: (2n + 1)² = 4n² + 4n + 1, adding 8(n + 1)/8 gives (4n² + 12n + 9)/8, and (2n + 3)² = 4n² + 12n + 9. Every step is correct. The hole is somewhere else.' },
              { text: 'The inductive step assumes <i>P</i>(<i>n</i> + 1), the very thing it is trying to prove.', why: 'It does not. It assumes P(n) and derives P(n + 1), which is exactly what an inductive step is supposed to do. Read the argument again and ask which of the three required parts is missing.' },
              { text: 'There is no base case. The step "if <i>P</i>(<i>n</i>) then <i>P</i>(<i>n</i> + 1)" is correct, but <i>P</i>(1) is false, so no domino ever falls.', ok: true },
              { text: 'Nothing is wrong with the proof; the claim must be true after all.', why: 'Test the claim at n = 1: the left side is 1, the right side is 9/8. A valid proof cannot end at a false conclusion, so something in the proof is missing.' }
            ],
            hints: ['Every induction proof has three parts: say what P(n) is, prove the base case, prove the inductive step. Which one is not here?', 'Check the algebra yourself. If it is right, then "P(n) implies P(n + 1)" really has been proved. What does that tell you when P(1) is false?'],
            solution: `<p>The inductive step is a correct proof of the conditional "if <i>P</i>(<i>n</i>) then <i>P</i>(<i>n</i> + 1)". But the proof never shows <i>P</i>(1), and <i>P</i>(1) is false: 1 ≠ 9/8. Every domino knocks over the next, and none of them ever falls. In fact <i>P</i>(<i>n</i>) is false for every <i>n</i>: (2<i>n</i> + 1)² is odd, so (2<i>n</i> + 1)²/8 is never a whole number, while 1 + 2 + … + <i>n</i> always is.</p><p>This is why the base case is not a formality. It is the only place where the argument touches the ground.</p>`,
            followup: 'A conditional "if P(n) then P(n + 1)" can be perfectly true while every P(n) is false. Without a base case, induction proves nothing at all.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>One counterexample refutes a "for every" claim; a list of true cases never proves one (unless the list is every case).</li>
<li>A proof reasons about what all cases share: name the objects, unpack the definitions, use algebra, match the definition.</li>
<li>The Principle of Induction: if <i>P</i>(0) holds and <i>P</i>(<i>n</i>) implies <i>P</i>(<i>n</i> + 1) for every <i>n</i>, then <i>P</i>(<i>n</i>) holds for every <i>n</i>. Both parts are needed.</li>
<li>A recurrence such as <i>M</i>(<i>n</i>) = 2<i>M</i>(<i>n</i> − 1) + 1 is proved by induction; the same two parts make a recursive function correct.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-10', '3B-AP-11', '9.2.4.7'],
      standard: 1,
      title: 'Numbers, remainders and Euclid', summary: 'Divisibility and remainders stated exactly, arithmetic modulo m, Euclid\u2019s algorithm with a proof that it is right and fast, primes and trial division, proof by contradiction, and huge powers computed with small numbers.',
      blocks: [
        `<p>It is 9 o'clock. What time will it be in 100 hours? You do not count 100 hours on your fingers. You notice that every 12 hours the clock hand comes back where it started, so only the remainder of 100 divided by 12 matters: 100 = 8 × 12 + 4, so the clock moves 4 hours on, to 1 o'clock. That small trick, arithmetic where only remainders matter, is the heart of this lesson, and it is used in the cryptography that protects secure websites. Why can the 12-hour laps simply be thrown away, and what else can remainders do?</p>
<p>The whole numbers are the oldest computing device. Long before machines, people had algorithms for them, and one of those algorithms, from Euclid's <i>Elements</i> of about 300 BC, is still in use in programs today. This lesson builds the arithmetic of remainders from one definition, proves that Euclid's algorithm gives the right answer and gives it quickly, and ends with the method that Lesson 20's cipher depends on. Throughout, "integer" means a whole number: positive, negative or zero.</p>`,
        { photo: 'euclid-papyrus', caption: "A papyrus fragment of Euclid's Elements, found at Oxyrhynchus in Egypt and copied several centuries after Euclid. It holds Book II, Proposition 5, with its diagram." },
        `<h2>Divisibility</h2>
<div class="stmt"><p><span class="kind">Definition.</span> For integers <i>d</i> and <i>n</i> with <i>d</i> ≠ 0, <i>d</i> <em>divides</em> <i>n</i>, written <i>d</i> | <i>n</i>, when <i>n</i> = <i>dk</i> for some integer <i>k</i>. We also say <i>d</i> is a <em>divisor</em> of <i>n</i>, and <i>n</i> is a <em>multiple</em> of <i>d</i>.</p></div>
<p>So 3 | 12 (take <i>k</i> = 4) and 3 | −12 (take <i>k</i> = −4), but 5 ∤ 12, since no integer <i>k</i> gives 5<i>k</i> = 12. Every <i>d</i> divides 0 (take <i>k</i> = 0), and 1 divides everything. Notice that <i>d</i> | <i>n</i> is a statement, true or false, not a number: it is not the same thing as <i>d</i>/<i>n</i> or <i>n</i>/<i>d</i>.</p>
<details class="reveal"><summary>Guess first: does 7 divide 0?</summary><p>Yes. 0 = 7 · 0, so <i>k</i> = 0 works. Every nonzero <i>d</i> divides 0.</p></details>
<div class="stmt"><p><span class="kind">Theorem 1.</span> Let <i>d</i>, <i>a</i>, <i>b</i> be integers with <i>d</i> ≠ 0.</p>
<p>(a) If <i>d</i> | <i>a</i> and <i>d</i> | <i>b</i>, then <i>d</i> | (<i>sa</i> + <i>tb</i>) for all integers <i>s</i> and <i>t</i>. In particular <i>d</i> divides <i>a</i> + <i>b</i>, <i>a</i> − <i>b</i>, and every multiple of <i>a</i>.</p>
<p>(b) If <i>d</i> | <i>e</i> and <i>e</i> | <i>n</i>, then <i>d</i> | <i>n</i>.</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> (a) Since <i>d</i> | <i>a</i> and <i>d</i> | <i>b</i>, there are integers <i>k</i> and <i>l</i> with <i>a</i> = <i>dk</i> and <i>b</i> = <i>dl</i>. Then <i>sa</i> + <i>tb</i> = <i>sdk</i> + <i>tdl</i> = <i>d</i>(<i>sk</i> + <i>tl</i>), and <i>sk</i> + <i>tl</i> is an integer, so <i>d</i> | (<i>sa</i> + <i>tb</i>).</p>
<p class="why">This is the pattern of Lesson 3's proofs: unpack the definition, with a different letter for each unknown integer, do algebra, and match the definition again. Taking <i>s</i> = <i>t</i> = 1 gives the sum, <i>s</i> = 1 and <i>t</i> = −1 the difference, and <i>t</i> = 0 a multiple of <i>a</i>.</p>
<p>(b) Write <i>e</i> = <i>dk</i> and <i>n</i> = <i>el</i>. Then <i>n</i> = <i>d</i>(<i>kl</i>), so <i>d</i> | <i>n</i>. <span class="qed">∎</span></p>
<p class="why">The same three moves. Everything in the rest of this lesson that involves divisibility is reduced, in the end, to one of these two facts.</p></div>
<details class="reveal"><summary>Guess first: 6 divides 12 and 6 divides 18. Does 6 divide 12 · 5 + 18 · (−2)?</summary><p>Yes: 12 · 5 + 18 · (−2) = 60 − 36 = 24 = 6 · 4. Theorem 1(a) says this works for any <i>s</i> and <i>t</i>, here 5 and −2.</p></details>
<h2>Division with remainder</h2>
<p>When <i>d</i> does not divide <i>n</i>, something is left over. The next theorem says exactly what, and that there is only one right answer.</p>
<div class="stmt"><p><span class="kind">Theorem 2 (the division theorem).</span> For every integer <i>n</i> and every integer <i>d</i> &gt; 0 there is exactly one pair of integers <i>q</i> and <i>r</i> with</p>
<p style="text-align:center"><i>n</i> = <i>qd</i> + <i>r</i> &nbsp;and&nbsp; 0 ≤ <i>r</i> &lt; <i>d</i>.</p>
<p><i>q</i> is the <em>quotient</em> and <i>r</i> the <em>remainder</em>; we write <i>r</i> = <i>n</i> mod <i>d</i>.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> <em>Existence.</em> Let <i>q</i> be the largest integer with <i>qd</i> ≤ <i>n</i>, and let <i>r</i> = <i>n</i> − <i>qd</i>. Then <i>r</i> ≥ 0. And <i>r</i> &lt; <i>d</i>, because otherwise (<i>q</i> + 1)<i>d</i> = <i>qd</i> + <i>d</i> ≤ <i>qd</i> + <i>r</i> = <i>n</i>, and <i>q</i> would not have been the largest.</p>
<p><em>Uniqueness.</em> Suppose also <i>n</i> = <i>q</i>′<i>d</i> + <i>r</i>′ with 0 ≤ <i>r</i>′ &lt; <i>d</i>. Subtracting, <i>r</i> − <i>r</i>′ = (<i>q</i>′ − <i>q</i>)<i>d</i>, a multiple of <i>d</i>. But both remainders lie between 0 and <i>d</i> − 1, so <i>r</i> − <i>r</i>′ lies strictly between −<i>d</i> and <i>d</i>, and the only multiple of <i>d</i> there is 0. So <i>r</i> = <i>r</i>′, and then <i>q</i> = <i>q</i>′. <span class="qed">∎</span></p></div>
<p>Python's <code>n // d</code> is <i>q</i> and <code>n % d</code> is <i>r</i>, exactly as the theorem defines them, even for negative <i>n</i>:</p>
<table class="small"><tr><th><i>n</i></th><th><i>d</i></th><th><i>n</i> = <i>q</i> · <i>d</i> + <i>r</i></th><th><code>n // d</code></th><th><code>n % d</code></th></tr><tr><td>17</td><td>5</td><td>17 = 3 · 5 + 2</td><td>3</td><td>2</td></tr><tr><td>15</td><td>5</td><td>15 = 3 · 5 + 0</td><td>3</td><td>0</td></tr><tr><td>−7</td><td>5</td><td>−7 = (−2) · 5 + 3</td><td>−2</td><td>3</td></tr></table>
<p>The last row is where languages disagree. C++ and Java give −7 % 5 as −2, which breaks the condition 0 ≤ <i>r</i>; Python and mathematics give 3. In this course, <i>n</i> mod <i>d</i> always means the remainder of Theorem 2.</p>
<details class="reveal"><summary>Guess first: what is −1 mod 12? (What is one hour before midnight on a 12-hour clock?)</summary><p>11. Since −1 = (−1) · 12 + 11, the remainder is 11, the same as Python's <code>-1 % 12</code>.</p></details>
<h2>Arithmetic modulo m</h2>
<div class="stmt"><p><span class="kind">Definition.</span> Let <i>m</i> &gt; 0. Integers <i>a</i> and <i>b</i> are <em>congruent modulo</em> <i>m</i>, written <i>a</i> ≡ <i>b</i> (mod <i>m</i>), when <i>m</i> | (<i>a</i> − <i>b</i>).</p></div>
<p>This is clock arithmetic: 14 ≡ 2 (mod 12), because 12 divides 14 − 2, and 2 p.m. is 14:00. The next theorem says congruence is the same thing as "same remainder", which is how you should picture it.</p>
<div class="stmt"><p><span class="kind">Theorem 3.</span> <i>a</i> ≡ <i>b</i> (mod <i>m</i>) if and only if <i>a</i> mod <i>m</i> = <i>b</i> mod <i>m</i>.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> By Theorem 2, write <i>a</i> = <i>q</i><sub>1</sub><i>m</i> + <i>r</i><sub>1</sub> and <i>b</i> = <i>q</i><sub>2</sub><i>m</i> + <i>r</i><sub>2</sub>, with both remainders between 0 and <i>m</i> − 1. Then <i>a</i> − <i>b</i> = (<i>q</i><sub>1</sub> − <i>q</i><sub>2</sub>)<i>m</i> + (<i>r</i><sub>1</sub> − <i>r</i><sub>2</sub>). If <i>r</i><sub>1</sub> = <i>r</i><sub>2</sub>, this is a multiple of <i>m</i>, so <i>a</i> ≡ <i>b</i>. Conversely, if <i>m</i> | (<i>a</i> − <i>b</i>), then by Theorem 1(a) <i>m</i> also divides (<i>a</i> − <i>b</i>) − (<i>q</i><sub>1</sub> − <i>q</i><sub>2</sub>)<i>m</i> = <i>r</i><sub>1</sub> − <i>r</i><sub>2</sub>, which lies strictly between −<i>m</i> and <i>m</i>; as in the proof of Theorem 2, it must be 0. <span class="qed">∎</span></p></div>
<details class="reveal"><summary>Guess first: is 38 ≡ 14 (mod 12)?</summary><p>Yes: 38 − 14 = 24 = 2 · 12, and both leave remainder 2 when divided by 12.</p></details>
<p>The reason congruence is useful is that it survives addition and multiplication.</p>
<div class="stmt"><p><span class="kind">Theorem 4.</span> If <i>a</i> ≡ <i>a</i>′ and <i>b</i> ≡ <i>b</i>′ (mod <i>m</i>), then <i>a</i> + <i>b</i> ≡ <i>a</i>′ + <i>b</i>′ and <i>ab</i> ≡ <i>a</i>′<i>b</i>′ (mod <i>m</i>).</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> By hypothesis <i>m</i> divides <i>a</i> − <i>a</i>′ and <i>b</i> − <i>b</i>′. For the sum, (<i>a</i> + <i>b</i>) − (<i>a</i>′ + <i>b</i>′) = (<i>a</i> − <i>a</i>′) + (<i>b</i> − <i>b</i>′), which <i>m</i> divides by Theorem 1(a).</p>
<p>For the product, <i>ab</i> − <i>a</i>′<i>b</i>′ = <i>a</i>(<i>b</i> − <i>b</i>′) + <i>b</i>′(<i>a</i> − <i>a</i>′).</p>
<p class="why">Adding and subtracting <i>ab</i>′ in the middle: <i>ab</i> − <i>ab</i>′ + <i>ab</i>′ − <i>a</i>′<i>b</i>′. The point of the rearrangement is to make each term a multiple of something we know <i>m</i> divides.</p>
<p>That is a combination <i>s</i>(<i>b</i> − <i>b</i>′) + <i>t</i>(<i>a</i> − <i>a</i>′) with <i>s</i> = <i>a</i> and <i>t</i> = <i>b</i>′, so <i>m</i> divides it by Theorem 1(a). <span class="qed">∎</span></p>
<p class="why">Theorem 1(a) is stated for any integers <i>s</i> and <i>t</i>, and <i>a</i> and <i>b</i>′ are integers.</p></div>
<p>In practice Theorem 4 means: in a long sum or product where only the remainder mod <i>m</i> matters, you may replace any number by its remainder <em>at any step</em>, and the final remainder does not change. Applied to repeated multiplication, it also says that if <i>a</i> ≡ <i>a</i>′ then <i>a</i><sup><i>k</i></sup> ≡ <i>a</i>′<sup><i>k</i></sup>.</p>
<details class="reveal"><summary>Predict: what is the last digit of 7<sup>100</sup>? (The last digit of a positive integer is its remainder mod 10.)</summary><p>Work mod 10 and reduce at every step: 7<sup>1</sup> ≡ 7, 7<sup>2</sup> = 49 ≡ 9, 7<sup>3</sup> ≡ 9 · 7 = 63 ≡ 3, 7<sup>4</sup> ≡ 3 · 7 = 21 ≡ 1. Since 7<sup>4</sup> ≡ 1, Theorem 4 gives 7<sup>100</sup> = (7<sup>4</sup>)<sup>25</sup> ≡ 1<sup>25</sup> = 1. The last digit is 1, and you never needed the other 84 digits.</p></details>
<h2>The gcd and Euclid's algorithm</h2>
<div class="stmt"><p><span class="kind">Definition.</span> For integers <i>a</i>, <i>b</i> ≥ 0, not both 0, the <em>greatest common divisor</em> gcd(<i>a</i>, <i>b</i>) is the largest integer that divides both.</p></div>
<p>For example gcd(12, 18) = 6, gcd(7, 5) = 1, and gcd(9, 0) = 9, since every integer divides 0. You could find a gcd by listing all the divisors of both numbers, but for numbers with a hundred digits that would take longer than the age of the universe. Euclid's method rests on one theorem.</p>
<div class="stmt"><p><span class="kind">Theorem 5.</span> If <i>b</i> &gt; 0, then gcd(<i>a</i>, <i>b</i>) = gcd(<i>b</i>, <i>a</i> mod <i>b</i>).</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> Let <i>r</i> = <i>a</i> mod <i>b</i>, so <i>a</i> = <i>qb</i> + <i>r</i> for some integer <i>q</i>. We show that the pairs (<i>a</i>, <i>b</i>) and (<i>b</i>, <i>r</i>) have exactly the same common divisors.</p>
<p class="why">If two sets of numbers are equal, their largest members are equal. So it is enough to show the common divisors agree; the gcds follow.</p>
<p>If <i>d</i> divides <i>a</i> and <i>b</i>, then <i>d</i> divides <i>a</i> − <i>qb</i> = <i>r</i>, by Theorem 1(a); so <i>d</i> divides <i>b</i> and <i>r</i>. Conversely, if <i>d</i> divides <i>b</i> and <i>r</i>, then <i>d</i> divides <i>qb</i> + <i>r</i> = <i>a</i>, again by Theorem 1(a); so <i>d</i> divides <i>a</i> and <i>b</i>. <span class="qed">∎</span></p>
<p class="why">Each direction is one use of Theorem 1(a), with <i>s</i> = 1 and <i>t</i> = −<i>q</i> the first time and <i>s</i> = <i>q</i> and <i>t</i> = 1 the second.</p></div>
<div class="stmt"><p><span class="kind">Euclid's algorithm.</span> To find gcd(<i>a</i>, <i>b</i>): while <i>b</i> ≠ 0, replace the pair (<i>a</i>, <i>b</i>) by (<i>b</i>, <i>a</i> mod <i>b</i>). When <i>b</i> = 0, the answer is <i>a</i>.</p></div>
<p>By hand, one line per step. Here is gcd(252, 198):</p>
<table class="small"><tr><th><i>a</i></th><th><i>b</i></th><th><i>a</i> = <i>q</i> · <i>b</i> + <i>r</i></th></tr><tr><td>252</td><td>198</td><td>252 = 1 · 198 + 54</td></tr><tr><td>198</td><td>54</td><td>198 = 3 · 54 + 36</td></tr><tr><td>54</td><td>36</td><td>54 = 1 · 36 + 18</td></tr><tr><td>36</td><td>18</td><td>36 = 2 · 18 + 0</td></tr><tr><td>18</td><td>0</td><td>stop: gcd = 18</td></tr></table>
<details class="reveal"><summary>Guess first: what is gcd(35, 14)? Try Euclid's steps before opening this.</summary><p>(35, 14) → (14, 7) → (7, 0), so the gcd is 7: 35 = 2 · 14 + 7, then 14 = 2 · 7 + 0.</p></details>
<p>Two things must be checked before an algorithm can be trusted: that it stops, and that its answer is right. It stops because the second number strictly decreases at every step (a remainder is less than the number divided by) and never goes below 0; a strictly decreasing sequence of non-negative integers cannot go on for ever. Its answer is right because, by Theorem 5, the gcd of the pair never changes from line to line, and on the last line it is gcd(<i>a</i>, 0) = <i>a</i>. A quantity that an algorithm keeps unchanged is called an <em>invariant</em>, and naming the invariant is the standard way to prove a loop correct.</p>
<p>How many steps does it take? The next theorem gives a guarantee.</p>
<div class="stmt"><p><span class="kind">Theorem 6.</span> If <i>a</i> ≥ <i>b</i> &gt; 0, then <i>a</i> mod <i>b</i> &lt; <i>a</i>/2.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Two cases. If <i>b</i> ≤ <i>a</i>/2, then <i>a</i> mod <i>b</i> &lt; <i>b</i> ≤ <i>a</i>/2. If <i>b</i> &gt; <i>a</i>/2, then <i>b</i> goes into <i>a</i> exactly once, so <i>a</i> mod <i>b</i> = <i>a</i> − <i>b</i> &lt; <i>a</i> − <i>a</i>/2 = <i>a</i>/2. <span class="qed">∎</span></p></div>
<p>After two steps of the algorithm, the remainder of the old first number has become the new first number, so by Theorem 6 the first number at least halves every two steps. A number can be halved only about log<sub>2</sub> <i>a</i> times before reaching 1, so the algorithm takes at most about 2 log<sub>2</sub> <i>a</i> steps. A 100-digit number is less than 2<sup>333</sup>, so a gcd of 100-digit numbers takes at most about 666 steps. This is the first result in the course where the <em>method</em>, and not the speed of the machine, makes the difference between possible and impossible.</p>
<details class="reveal"><summary>Guess first: is 91 a prime number?</summary><p>No: 91 = 7 · 13. It looks prime because it is not divisible by 2, 3 or 5, which is why it is a favourite trap.</p></details>
<h2>Primes, and testing for them</h2>
<div class="stmt"><p><span class="kind">Definition.</span> An integer <i>p</i> &gt; 1 is <em>prime</em> if its only positive divisors are 1 and <i>p</i>. An integer <i>n</i> &gt; 1 that is not prime is <em>composite</em>: it can be written <i>n</i> = <i>ab</i> with 1 &lt; <i>a</i>, <i>b</i> &lt; <i>n</i>.</p></div>
<div class="stmt"><p><span class="kind">Theorem 7.</span> Every integer <i>n</i> &gt; 1 has a prime divisor.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Among the divisors of <i>n</i> that are greater than 1 (there is at least one, <i>n</i> itself), let <i>p</i> be the smallest. Let <i>e</i> be any divisor of <i>p</i> with <i>e</i> &gt; 1. Since <i>e</i> | <i>p</i> and <i>p</i> | <i>n</i>, Theorem 1(b) gives <i>e</i> | <i>n</i>, so <i>e</i> is a divisor of <i>n</i> greater than 1, and therefore <i>e</i> ≥ <i>p</i>. A divisor of <i>p</i> cannot exceed <i>p</i>, so <i>e</i> = <i>p</i>. So the only divisor of <i>p</i> greater than 1 is <i>p</i> itself, and <i>p</i> is prime. <span class="qed">∎</span></p></div>
<div class="stmt"><p><span class="kind">Theorem 8 (trial division).</span> If <i>n</i> &gt; 1 is composite, then <i>n</i> has a divisor <i>d</i> with 1 &lt; <i>d</i> ≤ √<i>n</i>.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Write <i>n</i> = <i>ab</i> with 1 &lt; <i>a</i>, <i>b</i> &lt; <i>n</i>, naming the factors so that <i>a</i> ≤ <i>b</i>. If <i>a</i> were greater than √<i>n</i>, then <i>b</i> ≥ <i>a</i> &gt; √<i>n</i> too, and <i>ab</i> &gt; √<i>n</i> · √<i>n</i> = <i>n</i>, which is false. So <i>a</i> ≤ √<i>n</i>. <span class="qed">∎</span></p></div>
<p>Read as its contrapositive (Lesson 1), Theorem 8 is a test: if no integer from 2 up to √<i>n</i> divides <i>n</i>, then <i>n</i> is prime. That is why the <code>is_prime</code> function in Lesson 3 stopped its loop at <code>d * d &lt;= n</code>. To test 221 you need only try 2 to 14, and 13 works: 221 = 13 · 17. The method is fine for numbers with ten digits and hopeless for numbers with three hundred, since √<i>n</i> then has about 150 digits. Lesson 13 measures that gap, Lesson 17 finds a much faster test that flips coins, and Lesson 20 builds a lock out of it.</p>
<details class="reveal"><summary>Guess first: 97 has no divisor from 2 to 9. Is that enough to say it is prime?</summary><p>Yes. 10<sup>2</sup> = 100 is already more than 97, so √97 is less than 10, and by Theorem 8 a composite number would have a divisor of at most 9. So 97 is prime.</p></details>
<h2>Proof by contradiction</h2>
<p>Is there a largest prime? Euclid answered this too, with a kind of argument we have not used yet.</p>
<div class="stmt"><p><span class="kind">Proof by contradiction.</span> To prove a proposition <i>P</i>, assume ¬<i>P</i> and deduce from it something known to be false. Then ¬<i>P</i> cannot be true, so <i>P</i> is.</p></div>
<p>Why this is allowed: the argument proves the implication ¬<i>P</i> → (something false). By the truth table of → in Lesson 1, an implication with a false conclusion is true only when its hypothesis is false. So ¬<i>P</i> is false, and <i>P</i> is true.</p>
<div class="stmt"><p><span class="kind">Theorem 9 (Euclid).</span> There are infinitely many primes.</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> Suppose, for contradiction, that there are only finitely many primes, and list all of them: <i>p</i><sub>1</sub>, <i>p</i><sub>2</sub>, …, <i>p</i><sub><i>k</i></sub>.</p>
<p class="why">This is ¬<i>P</i>, stated so that we can use it. Having a complete list is what "finitely many" gives us.</p>
<p>Let <i>N</i> = <i>p</i><sub>1</sub><i>p</i><sub>2</sub> ⋯ <i>p</i><sub><i>k</i></sub> + 1. By Theorem 7, <i>N</i> &gt; 1 has a prime divisor <i>p</i>, and since the list contains every prime, <i>p</i> is one of the <i>p</i><sub><i>i</i></sub>. Then <i>p</i> divides the product <i>p</i><sub>1</sub> ⋯ <i>p</i><sub><i>k</i></sub> and also divides <i>N</i>, so by Theorem 1(a) it divides their difference, which is 1. But no prime divides 1, since primes are greater than 1. <span class="qed">∎</span></p>
<p class="why">"A prime divides 1" is the false statement the method needs. Having reached it, we conclude that the assumption was false: the primes cannot be listed in a finite list.</p></div>
<p>A common misreading: the proof does <em>not</em> say that <i>N</i> is prime. It says only that <i>N</i>'s prime factors are missing from the list. Lesson 12 uses the same method to show that a certain program cannot exist.</p>
<details class="reveal"><summary>Guess first: is 2 · 3 · 5 · 7 · 11 · 13 + 1 = 30031 prime?</summary><p>No: 30031 = 59 · 509. Its prime factors, 59 and 509, are not on the list 2, 3, 5, 7, 11, 13, which is exactly what the proof needs.</p></details>
<h2>Huge powers, small numbers</h2>
<p>Lesson 20 needs <i>b</i><sup><i>e</i></sup> mod <i>m</i> where <i>e</i> has hundreds of digits. Multiplying <i>e</i> times is out of the question. But squaring doubles an exponent in one step, <i>b</i>, <i>b</i><sup>2</sup>, <i>b</i><sup>4</sup>, <i>b</i><sup>8</sup>, …, and every exponent is a sum of powers of 2: that is what its binary digits say. Since 13 is 1101 in binary, <i>b</i><sup>13</sup> = <i>b</i><sup>8</sup> · <i>b</i><sup>4</sup> · <i>b</i><sup>1</sup>. By Theorem 4 we may reduce mod <i>m</i> after every multiplication, so no number ever exceeds <i>m</i>².</p>
<details class="reveal"><summary>Guess first: how many squarings take <i>b</i> to <i>b</i><sup>16</sup>, instead of 15 multiplications?</summary><p>Four: <i>b</i>, <i>b</i><sup>2</sup>, <i>b</i><sup>4</sup>, <i>b</i><sup>8</sup>, <i>b</i><sup>16</sup>. Each squaring doubles the exponent.</p></details>
<div class="stmt"><p><span class="kind">Repeated squaring.</span> To compute <i>b</i><sup><i>E</i></sup> mod <i>m</i>: set <i>result</i> = 1, <i>base</i> = <i>b</i> mod <i>m</i>, <i>e</i> = <i>E</i>. While <i>e</i> &gt; 0: if <i>e</i> is odd, set <i>result</i> = <i>result</i> · <i>base</i> mod <i>m</i>; then set <i>base</i> = <i>base</i>² mod <i>m</i> and <i>e</i> = <i>e</i> div 2. The answer is <i>result</i>.</p></div>
<p>Why it is right: the quantity <i>result</i> · <i>base</i><sup><i>e</i></sup> is congruent to <i>b</i><sup><i>E</i></sup> mod <i>m</i> at the start, and one pass of the loop does not change it. If <i>e</i> is even, <i>base</i> is squared while <i>e</i> is halved, and (<i>base</i>²)<sup><i>e</i>/2</sup> = <i>base</i><sup><i>e</i></sup>. If <i>e</i> is odd, one factor of <i>base</i> moves into <i>result</i> first, and <i>result</i> · <i>base</i> · (<i>base</i>²)<sup>(<i>e</i> − 1)/2</sup> = <i>result</i> · <i>base</i><sup><i>e</i></sup>. It is an invariant, like Euclid's gcd; by induction on the number of passes (Lesson 3) it holds when the loop ends, and then <i>e</i> = 0 and it says <i>result</i> ≡ <i>b</i><sup><i>E</i></sup>. Each pass halves <i>e</i>, so the number of passes is the number of binary digits of <i>E</i>, about log<sub>2</sub> <i>E</i>.</p>
<h2>The laboratory</h2>
<p>Both algorithms of this lesson, written in Python with a counter added to each, so you can see the step counts that Theorem 6 and the invariant argument predicted.</p>`,
        { play: `def gcd(a, b):
    steps = 0
    while b != 0:
        a, b = b, a % b          # Theorem 5: the gcd does not change
        steps += 1
    return a, steps

def mod_pow(b, e, m):
    result = 1
    base = b % m
    passes = 0
    while e > 0:
        if e % 2 == 1:           # this binary digit of e is 1
            result = (result * base) % m
        base = (base * base) % m
        e = e // 2               # move to the next binary digit
        passes += 1
    return result, passes

print(gcd(252, 198))
print(gcd(832040, 514229))                   # a slow case: consecutive Fibonacci numbers
print(gcd(2 ** 300 - 1, 2 ** 200 - 1))       # a 91-digit and a 61-digit number
print(mod_pow(7, 100, 10))
print(mod_pow(2, 10 ** 18, 1000000007), pow(2, 10 ** 18, 1000000007))`, predict: true, caption: 'Each line prints (answer, steps). The first is (18, 4), the table above. The second is (1, 28), and the third (1267650600228229401496703205375, 2), which is 2\u00b9\u2070\u2070 \u2212 1: two steps for numbers of 91 and 61 digits. The fourth is (1, 7), the last digit of 7\u00b9\u2070\u2070 from earlier. The last line shows (719476260, 60) and then 719476260 alone: the second is Python\u2019s own pow, which returns only the answer. Even the worst case for numbers of this size, consecutive Fibonacci numbers, takes under 30 steps, and 10¹⁸ needs only 60 squarings. Python\u2019s built-in pow(b, e, m) uses the same method and agrees.' },
        { skill: 'euclid', check: "What is gcd(48, 18) by Euclid's algorithm?", options: ["6", "3", "12"], answer: 0, why: "(48, 18) → (18, 12) → (12, 6) → (6, 0). The answer is 6.", wrong: [null, "3 divides both numbers, but it is not the greatest common divisor: 6 divides both and is larger. Euclid's steps give the greatest.", "12 is the first remainder, 48 mod 18. Stopping after one step is a mistake: keep going until the remainder is 0, and the answer is the last non-zero one."] },
        { skill: 'modular', check: "What is −7 mod 5 by the division theorem?", options: ["−2", "3", "2"], answer: 1, why: "The remainder must satisfy 0 ≤ r < 5: −7 = (−2)·5 + 3. Python agrees; C++ gives −2.", wrong: ["This is what C++ and Java print, but a remainder in the division theorem is never negative: 0 ≤ r < 5. Here −7 = (−2)·5 + 3.", null, "This is 7 mod 5, with the minus sign dropped. A negative n has a different quotient, so a different remainder."] },
        `<p>Change the numbers and watch the step counts. However large you make them, gcd stays below about twice the number of binary digits of the larger input, and mod_pow's passes equal the number of binary digits of <i>e</i>.</p>
<h2>Before the exercises</h2>
<p>A short trace comes first: it follows the repeated-squaring loop of the laboratory one pass at a time. The next exercise is Euclid's algorithm by hand, laid out as in the table for gcd(252, 198): on each line, find <i>q</i> and <i>r</i> with <i>a</i> = <i>qb</i> + <i>r</i> and 0 ≤ <i>r</i> &lt; <i>b</i>, then move <i>b</i> and <i>r</i> up to the next line. The second asks five short questions. For a remainder of a power, find a small power that is ≡ 1, as in the 7<sup>100</sup> example, and use Theorem 4. For a smallest prime divisor, use Theorem 8 and try divisors in order. For a negative number, go back to Theorem 2: the remainder must be between 0 and <i>d</i> − 1.</p>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Reading <i>d</i> | <i>n</i> as a fraction; it is a true-or-false statement. A negative remainder: by Theorem 2, −7 mod 5 is 3, not −2, although C++ says −2. Forgetting that gcd(<i>n</i>, 0) = <i>n</i>. In Euclid's algorithm, writing the quotient where the remainder belongs. Stopping trial division too early, or going far past √<i>n</i> for nothing. In repeated squaring, forgetting to reduce <i>base</i> mod <i>m</i> after squaring, so it grows huge anyway. Reading Euclid's proof as "the product of the primes plus one is prime"; it says only that its prime factors are new.</p>` },
        { skill: 'primes', check: "To test whether 101 is prime by trial division, which divisors must you try?", options: ["2 to 100", "2 to 10, since 10² ≤ 101 < 11²", "2 to 50"], answer: 1, why: "A composite n has a divisor at most √n. If none up to 10 divides 101, it is prime.", wrong: ["This would work, but it is the belief that a prime test must try everything below n. A composite number always has a divisor at most √n, so about ten tries are enough.", null, "Trying up to n/2 also works, but it is far more than needed. If n = ab with a ≤ b, then a ≤ √n, so you never need to go past √n."] },
        {
          ex: {
            id: 'ma-17-1', kind: 'trace', skill: 'modular', title: 'Trace repeated squaring',
            prompt: `<p>This program computes 3<sup>13</sup> mod 7 by repeated squaring, as <code>mod_pow</code> did in the laboratory. Fill in the table: each row is a moment when line 4 starts a pass of the loop (and the last row, after line 9), with the values of <code>e</code>, <code>result</code> and <code>base</code> then. The first row is done for you.</p>`,
            code: `result = 1\nbase = 3\ne = 13\nwhile e > 0:\n    if e % 2 == 1:\n        result = (result * base) % 7\n    base = (base * base) % 7\n    e = e // 2\nprint(result)`,
            vars: ['e', 'result', 'base'],
            steps: [
              { line: 4, values: { e: '13', result: '1', base: '3' }, show: true },
              { line: 4, values: { e: '6', result: '3', base: '2' }, why: { result: { '1': 'e = 13 is odd, so the pass multiplies result by base first: 1 · 3 mod 7 = 3.' }, base: { '9': 'base is reduced mod 7 after squaring: 9 mod 7 = 2.' } } },
              { line: 4, values: { e: '3', result: '3', base: '4' }, why: { result: { '6': 'e = 6 is even, so this pass leaves result alone and only squares base.' } } },
              { line: 4, values: { e: '1', result: '5', base: '2' }, why: { result: { '12': 'result stays below 7 because it is reduced mod 7 at every multiplication: 3 · 4 = 12, and 12 mod 7 = 5.' } } },
              { line: 9, values: { e: '0', result: '3', base: '4' }, why: { result: { '10': 'Reduce mod 7 after the multiplication: 5 · 2 = 10, and 10 mod 7 = 3.' } } }
            ],
            hints: ['A pass multiplies result by base only when e is odd. Then base is squared (mod 7) and e is halved, whether or not e was odd.', 'e goes 13, 6, 3, 1, 0. result changes on the passes where e is 13, 3 and 1: 3, then 3 · 4 mod 7 = 5, then 5 · 2 mod 7 = 3.'],
            solution: '<p>e: 13, 6, 3, 1, 0. result: 1, 3, 3, 5, 3. base: 3, 2, 4, 2, 4. The program prints <code>3</code>, and indeed 3<sup>13</sup> = 1 594 323 = 7 · 227 760 + 3. Only four passes were needed, one for each binary digit of 13 = 1101.</p>',
            failTip: 'If result goes wrong on the second pass, check whether e is odd before multiplying: only odd values of e multiply result.',
            followup: 'Change the program to start with e = 100. How many passes does it make, and how does that number relate to the binary digits of 100?'
          }
        },
        {
          ex: {
            id: 'ma-4-1', skill: 'euclid', kind: 'table', title: 'Euclid by hand',
            prompt: `<p>Carry out Euclid's algorithm on gcd(1071, 462). On each line, <i>a</i> = <i>q</i> · <i>b</i> + <i>r</i> with 0 ≤ <i>r</i> &lt; <i>b</i>; the next line's <i>a</i> and <i>b</i> are this line's <i>b</i> and <i>r</i>. Fill in every blank, and the gcd at the bottom.</p>`,
            head: ['<i>a</i>', '<i>b</i>', '<i>q</i>', '<i>r</i> = <i>a</i> mod <i>b</i>'],
            rows: [
              ['1071', '462', { a: '2', name: 'q, line 1', why: { '147': 'That is the remainder. The quotient is how many whole times 462 goes into 1071.' } }, { a: '147', name: 'r, line 1', why: { '2': 'That is the quotient. The remainder is 1071 − 2 × 462.', '609': '1071 − 462 is 609, but 462 goes into 1071 twice, not once; subtract 2 × 462.' } }],
              [{ a: '462', name: 'a, line 2', why: { '1071': 'Each line moves b into the a column: the new a is the old b.' } }, { a: '147', name: 'b, line 2', why: { '462': 'The new b is the old remainder, 147.' } }, { a: '3', name: 'q, line 2' }, { a: '21', name: 'r, line 2', why: { '168': '462 − 2 × 147 = 168, which is more than 147; 147 goes in three times.' } }],
              [{ a: '147', name: 'a, line 3' }, { a: '21', name: 'b, line 3' }, { a: '7', name: 'q, line 3' }, { a: '0', name: 'r, line 3' }],
              ['gcd =', { a: '21', name: 'the gcd', why: { '0': 'The algorithm stops when the remainder is 0; the answer is the last non-zero remainder, which is the b on the last line.', '7': 'That is the last quotient. The gcd is the last non-zero remainder.' } }, '', '']
            ],
            hints: ['Line 1: 2 × 462 = 924, and 1071 − 924 = 147.', 'Line 2 is (462, 147): 3 × 147 = 441, remainder 21. Line 3 is (147, 21): 147 = 7 × 21 exactly.'],
            solution: `<p>1071 = 2 · 462 + 147; 462 = 3 · 147 + 21; 147 = 7 · 21 + 0. The remainder is 0, so the algorithm stops, and gcd(1071, 462) = 21.</p><p>By Theorem 5, gcd(1071, 462) = gcd(462, 147) = gcd(147, 21) = gcd(21, 0) = 21. Check: 1071 = 21 · 51 and 462 = 21 · 22, and 51 and 22 have no common factor.</p>`,
            followup: 'Three steps, and the numbers shrank fast, as Theorem 6 promised. Listing the divisors of 1071 would already have taken longer.'
          }
        },
        {
          ex: {
            id: 'ma-4-2', skill: 'modular', kind: 'answer', title: 'Remainders, primes and powers',
            prompt: `<p>Answer each with a single integer.</p>`,
            parts: [
              { label: '(a) −17 mod 5, that is, the remainder <i>r</i> of Theorem 2 with 0 ≤ <i>r</i> &lt; 5.', answer: '3', width: '5rem',
                wrong: [{ match: '-2', msg: 'That is what C++ gives, but it is negative. Theorem 2 needs 0 ≤ r < 5: −17 = (−4) · 5 + 3.' }, { match: '2', msg: '17 mod 5 is 2, but −17 is a different number: −17 = (−4) · 5 + 3.' }] },
              { label: '(b) The last digit of 3<sup>2026</sup>.', answer: '9', width: '5rem',
                wrong: [{ match: '1', msg: '3⁴ = 81 ≡ 1 (mod 10), but 2026 is not a multiple of 4: 2026 = 4 · 506 + 2.' }, { match: ['3', '7'], msg: 'The last digits of 3¹, 3², 3³, 3⁴ are 3, 9, 7, 1, repeating every 4. Where does 2026 fall in that cycle?' }] },
              { label: '(c) 2<sup>100</sup> mod 7.', answer: '2', width: '5rem',
                wrong: [{ match: '1', msg: '2³ = 8 ≡ 1 (mod 7), so 2⁹⁹ ≡ 1. But the exponent is 100 = 99 + 1.' }, { match: '4', msg: '2³ ≡ 1 (mod 7) and 100 = 3 · 33 + 1, so 2¹⁰⁰ ≡ 2¹.' }] },
              { label: '(d) The smallest prime divisor of 221.', answer: '13', width: '5rem',
                wrong: [{ match: '221', msg: '221 is not prime. By Theorem 8, try divisors from 2 up to √221 ≈ 14.9.' }, { match: '17', msg: '17 divides 221, but something smaller does too.' }, { match: '1', msg: '1 is not prime: a prime must be greater than 1.' }] },
              { label: '(e) How many passes does the repeated-squaring loop make when <i>E</i> = 1000?', answer: '10', width: '5rem',
                wrong: [{ match: '1000', msg: 'That is the number of multiplications of the simple method. Each pass halves e.' }, { match: '9', msg: 'Count the halvings until e reaches 0: 1000, 500, 250, 125, 62, 31, 15, 7, 3, 1, then 0.' }, { match: '3', msg: '1000 has 4 decimal digits, but the loop works in binary.' }] }
            ],
            hints: ['(a) Find q so that −17 − 5q is between 0 and 4. (b) Last digit means mod 10; 3⁴ ≡ 1. (c) 2³ ≡ 1 (mod 7).', '(d) 221 is not divisible by 2, 3, 5, 7 or 11. (e) The passes equal the number of binary digits of 1000; 2⁹ = 512 ≤ 1000 < 1024 = 2¹⁰.'],
            solution: `<p>(a) −17 = (−4) · 5 + 3, so −17 mod 5 = <b>3</b>.</p><p>(b) Mod 10: 3⁴ = 81 ≡ 1, and 2026 = 4 · 506 + 2, so 3²⁰²⁶ = (3⁴)⁵⁰⁶ · 3² ≡ 1 · 9 = <b>9</b>.</p><p>(c) Mod 7: 2³ = 8 ≡ 1, and 100 = 3 · 33 + 1, so 2¹⁰⁰ ≡ 1 · 2 = <b>2</b>.</p><p>(d) By Theorem 8 try 2, 3, 5, 7, 11, 13: the first that divides is 13, and 221 = 13 · 17. So <b>13</b>.</p><p>(e) 1000 in binary is 1111101000, ten digits, and each pass removes one: <b>10</b> passes.</p>`,
            followup: 'Parts (b) and (c) used the same move: find a small power congruent to 1, then Theorem 4 lets you throw away all complete cycles.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li><i>d</i> | <i>n</i> means <i>n</i> = <i>dk</i> for an integer <i>k</i>. A divisor of two numbers divides every combination <i>sa</i> + <i>tb</i> (Theorem 1).</li>
<li>Division theorem: <i>n</i> = <i>qd</i> + <i>r</i> with 0 ≤ <i>r</i> &lt; <i>d</i>, in exactly one way; Python's <code>//</code> and <code>%</code> follow it.</li>
<li><i>a</i> ≡ <i>b</i> (mod <i>m</i>) means <i>m</i> | (<i>a</i> − <i>b</i>), the same as equal remainders; congruences can be added and multiplied, so you may reduce at every step.</li>
<li>Euclid: gcd(<i>a</i>, <i>b</i>) = gcd(<i>b</i>, <i>a</i> mod <i>b</i>). The gcd is an invariant, so the answer is right; the first number halves every two steps, so it is fast.</li>
<li>Every <i>n</i> &gt; 1 has a prime divisor; a composite <i>n</i> has one at most √<i>n</i>, so trial division stops there.</li>
<li>Back to the clock: congruent numbers differ by whole laps, so adding and multiplying can reduce at every step, which is why only the remainder of 100 hours mattered.</li>
<li>Proof by contradiction: assume ¬<i>P</i>, reach a false statement. That is how Euclid showed there are infinitely many primes.</li>
<li>Repeated squaring computes <i>b</i><sup><i>E</i></sup> mod <i>m</i> in about log<sub>2</sub> <i>E</i> passes, with an invariant as its proof.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['2-AP-12', '3B-CS-02', '3B-AP-10', '3B-AP-11', '3B-AP-12', '3B-AP-13'],
      title: 'Checkpoint one', checkpoint: true, summary: 'No new ideas: mixed questions on logic, counting, proof and remainders, then two exercises that choose between them. Is it the converse or the contrapositive? A check or a proof? A gcd or an lcm?',
      blocks: [
        `<p>This lesson teaches nothing new. It mixes questions on the four lessons before it, because telling apart ideas that look alike, such as an implication and its converse, a check of cases and a proof, or a remainder and a quotient, is a skill of its own, and it only grows when the questions are mixed. Answer each one before looking back. If one surprises you, the lesson it came from is linked on the Review page, and the question comes back there after a day.</p>
<p>Ready? Here is the first: if "if it is a square, then it has four sides" is true, does "if it has four sides, then it is a square" have to be true too?</p>
<h2>Mixed questions</h2>`,
        { check: 'The statement is "If a number is divisible by 4, then it is even." Which of these is its converse?', skill: 'implication', options: ['If a number is not even, then it is not divisible by 4', 'If a number is even, then it is divisible by 4', 'If a number is not divisible by 4, then it is not even'], answer: 1, wrong: ['That is the contrapositive, which is equivalent to the original statement and so just as true. The converse swaps the two parts without negating them.', null, 'That negates both parts without swapping them, which is neither the converse nor the contrapositive. It is false: 6 is not divisible by 4, and it is even.'], why: 'The converse of "if p then q" is "if q then p". Here it is false: 6 is even and not divisible by 4, so a statement and its converse are different claims.' },
        { check: 'Which statement is the negation of "Some prime is even"?', skill: 'negate-quantifier', options: ['Every prime is odd', 'Some prime is odd', 'Every prime is even'], answer: 0, wrong: [null, 'Both statements are true at once: 2 is an even prime and 3 is an odd prime. A negation is false whenever the original is true, so this cannot be it.', 'It happens to be false here, as the negation of a true statement must be. But a negation must also be true whenever the original is false, and if every prime were odd this statement would be false as well.'], why: 'The negation of "there exists" is "for every, not": no prime is even, which is the same as every prime being odd. (The original is true, because of 2, so its negation is false.)' },
        { check: 'A club has 12 members. Seven play chess, nine play go, and everyone plays at least one of the two games. How many play both?', skill: 'sets', options: ['4', '16', '3'], answer: 0, wrong: [null, 'That adds 7 and 9, which counts the players of both games twice. The club has only 12 members, so the sum is larger than the true total by exactly the overlap.', 'There is no rule that gives 3. Use |A ∪ B| = |A| + |B| − |A ∩ B| with |A ∪ B| = 12: the overlap is 7 + 9 − 12.'], why: 'Inclusion–exclusion: 12 = 7 + 9 − |A ∩ B|, so |A ∩ B| = 4. Adding the two sizes counts each player of both games twice.' },
        { check: 'A club of 5 people elects a president and a treasurer, two different people. In how many ways can it do this?', skill: 'counting', options: ['10', '20', '25'], answer: 1, wrong: ['That counts the ways to pick a committee of two, where order does not matter. A president and a treasurer are different jobs, so "Ann president, Bo treasurer" and "Bo president, Ann treasurer" are different outcomes.', null, 'That lets one person hold both jobs. The treasurer must be one of the 4 people left, so the product rule gives 5 · 4, not 5 · 5.'], why: 'Product rule with a shrinking choice: 5 options for president, then 4 for treasurer, 5 · 4 = 20. Choosing an unordered pair would give 10.' },
        { check: 'The formula n² + n + 41 gives a prime for every n from 0 to 39, and a friend says that proves it gives a prime for every n. What can you say?', skill: 'counterexample', options: ['The friend is right: forty cases is plenty', 'The friend is wrong: n = 40 gives 1681 = 41 · 41, and one counterexample refutes a "for every" claim', 'The friend is wrong, but no counterexample exists; the claim is simply unproved'], answer: 1, wrong: ['Forty cases, or forty million, check cases and never prove a claim about every n. The next case can fail, and here it does.', null, 'There is one: 40² + 40 + 41 = 1600 + 81 = 1681, and 1681 = 41 · 41. A single case that fails settles the matter.'], why: 'Checking cases is not proving, and a single failing case is enough to refute. For n = 40 the value is 41², not a prime.' },
        { check: 'In a proof by induction, what does the inductive step show?', skill: 'induction', options: ['The statement is true for every n', 'If the statement holds for one particular n, it holds for n + 1', 'The statement holds for the first case'], answer: 1, wrong: ['That is the conclusion, which needs both parts: the base case and the step together. The step alone proves only a conditional.', null, 'That is the base case. The step says nothing about whether the first domino falls, only that each falling domino knocks over the next.'], why: 'The step is a conditional, P(n) implies P(n + 1). With the base case it gives the first case, then the next, then the next, for every n.' },
        { check: 'What are 47 mod 6 and the quotient 47 div 6, in that order?', skill: 'modular', options: ['5 and 7', '7 and 5', '5 and 8'], answer: 0, wrong: [null, 'These are the right numbers the wrong way round. 47 = 7 · 6 + 5: the 7 is how many whole sixes fit (the quotient), the 5 is what is left over (the remainder).', 'The remainder is right, but 8 · 6 = 48 is more than 47. The quotient is how many whole sixes fit, rounded down: 7.'], why: 'The division theorem writes 47 = 7 · 6 + 5 with 0 ≤ 5 < 6. The remainder, 47 mod 6, is 5; the quotient is 7.' },
        { check: 'What is gcd(84, 36)?', skill: 'euclid', options: ['12', '6', '252'], answer: 0, wrong: [null, '6 divides both numbers, but it is not the greatest common divisor: 12 divides both and is larger.', '252 is the least common multiple, the smallest number that both 84 and 36 divide. The gcd is a divisor of both, so it can never be larger than either.'], why: 'Euclid: (84, 36) → (36, 12) → (12, 0). The last non-zero number, 12, is the gcd. The lcm is 84 · 36 / 12 = 252.' },
        { check: 'You must show that among any 13 people, two were born in the same month. Which tool fits?', skill: 'pigeonhole', options: ['Induction on the number of people', 'The pigeonhole principle: 13 people go into 12 month boxes', 'Check a few hundred groups of 13 people'], answer: 1, wrong: ['Induction would need a statement about every n, and there is no step from n people to n + 1 here. The claim is about one fixed number, 13, and a counting argument settles it.', null, 'Checking groups never covers every possible group of 13 people. A proof must work for all of them at once.'], why: 'There are 12 months and 13 people, more objects than boxes, so some box holds two. The skill is choosing the boxes.' },
        `<p>Two exercises to finish the unit. The first asks which method settles a claim. The second asks for four numbers from four different lessons.</p>`,
        {
          ex: {
            id: 'ma-14-1', kind: 'choice', skill: 'induction', title: 'Which method settles it?',
            prompt: `<p>A friend claims that for every whole number <i>n</i> ≥ 1, the sum of the first <i>n</i> odd numbers is <i>n</i><sup>2</sup>: 1 = 1, 1 + 3 = 4, 1 + 3 + 5 = 9, and so on. Which is the best way to settle the claim?</p>`,
            options: [
              { text: 'Write a Python loop that checks it for every n up to a million.', why: 'A million cases is a million cases. It would find a counterexample if one were that small, but it can never prove a claim about all n, and this claim has infinitely many cases.' },
              { text: 'Prove it by induction: check n = 1, then show that if the sum of the first n odd numbers is n², the sum of the first n + 1 is (n + 1)².', ok: true },
              { text: 'Look for a counterexample, and if none turns up after a few hours, call it proved.', why: 'Failing to find a counterexample proves nothing. The counterexample may be waiting beyond the cases you tried.' },
              { text: 'Build a truth table for the claim.', why: 'A truth table checks every case of a statement built from a few propositions. This claim is about infinitely many numbers, and no table has infinitely many rows.' }
            ],
            hints: ['The claim is about every n, infinitely many cases. Which method proves a claim about all whole numbers at once?', 'Induction needs a first case and a step from n to n + 1. The step here is: n² + (2n + 1) = (n + 1)².'],
            solution: '<p>Induction. Base case: for n = 1 the sum is 1 = 1². Step: if 1 + 3 + … + (2n − 1) = n², then adding the next odd number, 2n + 1, gives n² + 2n + 1 = (n + 1)², which is the claim for n + 1. Running a loop checks cases; it cannot prove the claim. A search for a counterexample can only refute it, and a truth table covers only finitely many cases.</p>',
            followup: 'Which method would you use to show that the claim "n² + n + 41 is prime for every n" is false? Compare the two tools: one proves for all n, the other refutes in a single case.'
          }
        },
        {
          ex: {
            id: 'ma-14-2', kind: 'answer', skill: ['euclid', 'modular', 'counting', 'pigeonhole'], title: 'Four numbers',
            prompt: `<p>Answer each question with a single number. Decide which tool applies first: Euclid's algorithm, the division theorem, the product rule, or the pigeonhole principle.</p>`,
            parts: [
              { label: '(a) What is gcd(231, 98)?', answer: '7', width: '6rem',
                wrong: [{ match: '35', msg: '35 is the first remainder: 231 = 2 · 98 + 35. Keep going with (98, 35) until the remainder is 0; the answer is the last non-zero remainder.' }, { match: '14', msg: '14 divides 98 but not 231: 231 = 16 · 14 + 7. A common divisor must divide both numbers.' }] },
              { label: '(b) How many subsets of {1, 2, …, 10} contain neither 1 nor 2?', answer: '256', width: '6rem',
                wrong: [{ match: '1024', msg: 'That is the number of all subsets of a 10-element set. A subset that contains neither 1 nor 2 chooses freely only among the other 8 elements.' }, { match: '8', msg: 'There are 8 elements left to choose from, but each is in or out. Count the in-or-out choices: 2 for each element.' }, { match: '512', msg: 'That is 2⁹, the subsets that avoid only one of the two elements. Both 1 and 2 must stay out, which leaves 8 free elements.' }] },
              { label: '(c) What is −13 mod 4?', answer: '3', width: '6rem',
                wrong: [{ match: '-1', msg: 'A programming language such as C++ may print this, but the division theorem needs 0 ≤ r < 4. Here −13 = (−4) · 4 + 3.' }, { match: '1', msg: 'That is 13 mod 4 with the sign dropped. For a negative number the quotient changes: −13 = (−4) · 4 + 3.' }] },
              { label: '(d) What is the fewest whole numbers you must pick to be sure that two of them leave the same remainder when divided by 7?', answer: '8', width: '6rem',
                wrong: [{ match: '7', msg: 'Seven numbers can have the seven different remainders 0, 1, …, 6, one each, so nothing is guaranteed yet. You need more numbers than boxes.' }, { match: '14', msg: 'That is far more than needed. The remainders are the 7 boxes; one more object than boxes forces two into the same box.' }] }
            ],
            hints: ['(a) Divide 231 by 98 to get the first remainder, then keep going. (b) Each of the other eight elements is in or out. (c) The remainder is always between 0 and 3. (d) What are the boxes?', '(a) (231, 98) → (98, 35) → (35, 28) → (28, 7) → (7, 0). (b) 2⁸. (c) −13 = (−4) · 4 + 3. (d) 7 boxes, so 7 + 1 objects.'],
            solution: '<p>(a) 231 = 2 · 98 + 35; 98 = 2 · 35 + 28; 35 = 1 · 28 + 7; 28 = 4 · 7 + 0. The gcd is <b>7</b>. (b) The other 8 elements are each in or out: 2⁸ = <b>256</b>. (c) −13 = (−4) · 4 + 3, so the remainder is <b>3</b>. (d) The boxes are the 7 possible remainders, so <b>8</b> numbers force two into the same box.</p>',
            followup: 'In (b), how many subsets of {1, …, 10} contain at least one of 1 and 2? Use the complement rule.'
          }
        },
        `<div class="recap"><h3>Unit one in a few lines</h3><ul>
<li>An implication has a contrapositive that says the same thing and a converse that does not. The negation of "for all" is "there exists one that does not", and the other way round.</li>
<li>Sizes of sets: |<i>A</i> ∪ <i>B</i>| = |<i>A</i>| + |<i>B</i>| − |<i>A</i> ∩ <i>B</i>|. Ordered choices multiply as they shrink; a set of <i>n</i> elements has 2<sup><i>n</i></sup> subsets; more objects than boxes forces a shared box.</li>
<li>Checking cases is not proving. One counterexample refutes "for every"; induction, a base case and a step, proves it.</li>
<li>The remainder of the division theorem is never negative; gcd comes from Euclid's algorithm and is a divisor, not a multiple; trial division stops at the square root.</li>
<li>Next: dots and lines. A graph is the picture behind roads, networks and the machines of the next lessons.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3A-DA-12', '3B-AP-12'],
      standard: 1,
      title: 'Graphs and paths', summary: 'Dots and lines as a model of almost anything: degrees and the handshake theorem, walks and Euler\u2019s bridges, breadth-first search with a proof that it finds shortest paths, and trees.',
      blocks: [
        `<p>In 1967 the psychologist Stanley Milgram asked people in Nebraska and Kansas to get a letter to a stranger in Massachusetts, by passing it only to someone they knew personally, who would pass it on in the same way. The letters that arrived took about six steps on average, which later gave the idea its name, "six degrees of separation". In 2016, Facebook measured its own network of about 1.6 billion users and found that two of them were on average 4.57 steps apart: 3.57 people in between. Both are questions about the shortest paths in a graph. But how do you find the shortest path between two people in a network of billions, without trying every route?</p>
<p>Friendships, road maps, web links, the positions of a puzzle and the moves between them, the parts of a program and which ones depend on which: each of these is a set of things with connections between some pairs of them. The mathematical object that captures exactly that, and nothing more, is a <em>graph</em>. A fact proved about graphs is a fact about all of those at once.</p>`,
        { photo: 'internet-map-2005', caption: "A graph you use every day: part of the Internet in January 2005, drawn by the Opte Project. Each line joins two vertices, two addresses on the network, and the picture shows less than a third of the networks that could be reached then. The inset zooms in on one vertex of high degree." },
        `<h2>Graphs</h2>
<div class="stmt"><p><span class="kind">Definition.</span> A <em>graph</em> <i>G</i> consists of a finite set <i>V</i> of <em>vertices</em> and a set <i>E</i> of <em>edges</em>, where each edge is a set {<i>u</i>, <i>v</i>} of two different vertices. If {<i>u</i>, <i>v</i>} is an edge, <i>u</i> and <i>v</i> are <em>adjacent</em>, or <em>neighbours</em>, and they are the edge's <em>endpoints</em>. The <em>degree</em> of a vertex <i>v</i>, written deg(<i>v</i>), is the number of edges that have <i>v</i> as an endpoint.</p></div>
<p>An edge is a <em>set</em> of two vertices (Lesson 2), so it has no direction: {<i>u</i>, <i>v</i>} and {<i>v</i>, <i>u</i>} are the same edge, and the definition allows at most one edge between two vertices. Drawn on paper, vertices are dots and edges are lines; where the dots go does not matter, only which pairs are joined.</p>
<p>In a program, the usual representation is a dictionary that maps each vertex to the list of its neighbours. Because an edge has no direction, every edge appears twice: if Ash lists Birch, Birch must list Ash. Here are seven towns and the roads between them.</p>`,
        { code: `roads = {
    "Ash":   ["Birch", "Cedar"],
    "Birch": ["Ash", "Cedar", "Dell"],
    "Cedar": ["Ash", "Birch"],
    "Dell":  ["Birch", "Elm"],
    "Elm":   ["Dell"],
    "Fir":   ["Gum"],
    "Gum":   ["Fir"],
}`, caption: 'Seven vertices and six edges. The degree of a vertex is the length of its list: deg(Birch) = 3, deg(Elm) = 1.' },
        { skill: 'graphs', check: "In the roads dictionary, Birch's list contains Dell. What must Dell's list contain?", options: ["Nothing: a road goes one way", "Birch", "Dell"], answer: 1, why: "An edge has no direction, so it is listed from both ends. Dell's list has Birch (and Elm).", wrong: ["This treats an edge as a one-way street. A graph's edge is a set {Birch, Dell}, which has no direction, so each end lists the other.", null, "A vertex is never its own neighbour: an edge joins two different vertices, so Dell's list cannot contain Dell."] },
        `<h2>The handshake theorem</h2>
<p>Add up the degrees of the towns: 2 + 3 + 2 + 2 + 1 + 1 + 1 = 12. There are 6 roads. That is not a coincidence.</p>
<div class="stmt"><p><span class="kind">Theorem 1 (the handshake theorem).</span> In every graph, the sum of the degrees of all the vertices is twice the number of edges.</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> Count the pairs (<i>v</i>, <i>e</i>) in which <i>v</i> is a vertex and <i>e</i> is an edge with endpoint <i>v</i>. We count the same set of pairs in two ways.</p>
<p class="why">Counting one collection in two different ways and setting the answers equal is called <em>double counting</em>. The sum rule of Lesson 2 guarantees that each way of counting gets the true total.</p>
<p>Grouping the pairs by their vertex: vertex <i>v</i> appears in exactly deg(<i>v</i>) pairs, by the definition of degree, so the number of pairs is the sum of all the degrees. Grouping them by their edge: each edge has exactly two endpoints, so it appears in exactly two pairs, and the number of pairs is 2|<i>E</i>|. The two counts are counts of the same set, so they are equal. <span class="qed">∎</span></p>
<p class="why">The only facts used are the definition of degree and the fact that an edge is a set of exactly two vertices. So the theorem holds for every graph there is, including ones nobody has drawn.</p></div>
<div class="stmt"><p><span class="kind">Corollary.</span> In every graph, the number of vertices of odd degree is even.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Split the sum of the degrees into the sum over vertices of even degree and the sum over vertices of odd degree. The whole sum is even, by Theorem 1, and the even part is even, so the odd part, a sum of odd numbers, is even as well. A sum of <i>k</i> odd numbers is even exactly when <i>k</i> is even (pair them up: each pair has an even sum, and an unpaired one would leave the total odd). So the number of odd-degree vertices is even. <span class="qed">∎</span></p></div>
<p>The name comes from parties: if the guests are vertices and each handshake is an edge, then at any party the number of people who shook an odd number of hands is even. You did not have to attend to know it.</p>
<details class="reveal"><summary>Predict: can 5 people each shake hands with exactly 3 of the others?</summary><p>No. That would be a graph with 5 vertices, each of degree 3: five vertices of odd degree, which the corollary forbids. (Directly: the degree sum would be 15, which is odd, but Theorem 1 says it is twice the number of handshakes.) No amount of trying at the party would ever succeed.</p></details>
<h2>Walks, paths and distance</h2>
<div class="stmt"><p><span class="kind">Definition.</span> A <em>walk</em> from <i>u</i> to <i>v</i> is a sequence of vertices <i>u</i> = <i>v</i><sub>0</sub>, <i>v</i><sub>1</sub>, …, <i>v</i><sub><i>k</i></sub> = <i>v</i> in which each consecutive pair is an edge. Its <em>length</em> is <i>k</i>, the number of edges crossed. A <em>path</em> is a walk that never repeats a vertex. The <em>distance</em> d(<i>u</i>, <i>v</i>) is the length of a shortest walk from <i>u</i> to <i>v</i>. A graph is <em>connected</em> if there is a walk between every two of its vertices.</p></div>
<p>In the towns, Ash, Birch, Dell, Elm is a path of length 3, and d(Ash, Elm) = 3. There is no walk at all from Ash to Fir, so the road graph is not connected; it falls into two pieces. A shortest walk can never repeat a vertex, since cutting out the loop between the two visits would give a shorter walk; so a shortest walk is always a path.</p>
<details class="reveal"><summary>Guess first: in the towns graph, what is d(Ash, Fir)?</summary><p>It is not defined: there is no walk from Ash to Fir at all, so there is no shortest one. Distance only makes sense between vertices in the same connected piece.</p></details>
<h2>Euler and the bridges of Königsberg</h2>
<p>Graph theory began with a puzzle. The city of Königsberg had seven bridges joining two islands and the two banks of a river, and its citizens wondered whether a stroll could cross every bridge exactly once. In 1736 Euler replaced the city by four vertices, one for each piece of land, and seven edges, one for each bridge. Some pieces of land were joined by two bridges, so this needs a slightly more general object, a <em>multigraph</em>, in which two vertices may be joined by several edges; degrees still count every edge.</p>`,
        { photo: 'konigsberg-bridges', caption: "Figure 1 of Euler's paper on the bridges of Königsberg. The four pieces of land are A, B, C and D, and the seven bridges are a to g: the vertices and edges of the multigraph." },
        `<details class="reveal"><summary>Guess first: can a stroll cross each of the seven bridges exactly once?</summary><p>No, and Euler proved it. The theorem below shows why, and also shows that no amount of trying could ever find such a stroll.</p></details>
<div class="stmt"><p><span class="kind">Definition.</span> An <em>Euler walk</em> is a walk that crosses every edge exactly once.</p>
<p><span class="kind">Theorem 2 (Euler).</span> If a graph or multigraph has an Euler walk, then the number of vertices of odd degree is 0 or 2.</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> Follow an Euler walk and look at any vertex <i>v</i> that is neither the first nor the last vertex of the walk. Each time the walk passes through <i>v</i>, it arrives along one edge and leaves along another, so each visit uses two edges at <i>v</i>.</p>
<p class="why">"Arrives" and "leaves" are different edges, because the walk crosses no edge twice. The walk only passes through such a vertex; it never starts or stops there.</p>
<p>Since the walk uses every edge exactly once, the edges at <i>v</i> are used up two per visit, and deg(<i>v</i>) is even. Therefore only the first and last vertices of the walk can have odd degree: at most two vertices. By the corollary to Theorem 1 the number of odd-degree vertices is even, so it is 0 or 2. <span class="qed">∎</span></p>
<p class="why">If the walk starts and ends at the same vertex, that vertex's first and last edges pair up as well, and every degree is even. The corollary rules out exactly one odd vertex, which the walk argument alone would allow.</p></div>
<p>Königsberg's four pieces of land have degrees 5, 3, 3 and 3: four odd vertices. So no stroll crosses every bridge once, and no amount of trying could find one. It was the first theorem of graph theory, and it was a proof that something is impossible. The converse is also true, and harder: a connected multigraph with 0 or 2 odd vertices always has an Euler walk. We use it without proof.</p>
<h2>Breadth-first search</h2>
<p>To find every vertex reachable from a start vertex, and its distance, explore in layers: first the start, then everything one edge away, then everything two edges away, and so on. A <em>queue</em>, a list that is added to at the back and taken from at the front, keeps the layers in order.</p>
<div class="stmt"><p><span class="kind">Breadth-first search (BFS).</span> Give the start vertex the label 0 and put it in the queue. While the queue is not empty: take the vertex <i>v</i> at the front; for each neighbour <i>w</i> of <i>v</i> that has no label yet, give <i>w</i> the label (label of <i>v</i>) + 1 and add <i>w</i> to the back of the queue.</p></div>`,
        { fig: 'graphbfs', caption: 'Breadth-first search from Ash on the towns graph. Vertices are coloured as they are labelled; the queue shows what is waiting. Fir and Gum are never reached.' },
        { skill: 'graphs', check: "A connected graph has exactly 4 vertices of odd degree. Does it have an Euler walk?", options: ["Yes", "No: an Euler walk needs 0 or 2 odd vertices", "Only if it has no cycles"], answer: 1, why: "Every vertex in the middle of the walk is entered and left, using edges in pairs. Only the two ends can be odd.", wrong: ["Being connected is not enough. Four odd vertices would need four walk ends, and a walk has only two.", null, "Cycles are not the issue: Euler walks often use cycles. What matters is how many vertices have odd degree."] },
        `<p>Every vertex that gets a label enters the queue once and leaves it once, and each time a vertex leaves, its list of neighbours is read once. So the work is proportional to the number of vertices plus the number of edges: fast, even for a map of a whole country. That it also gives the right answer needs a proof.</p>
<details class="reveal"><summary>Guess first: running BFS from Ash on the towns graph, which town gets the largest label, and what is it?</summary><p>Elm, with label 3: Ash, Birch, Dell, Elm. Fir and Gum are never labelled, so they do not count.</p></details>
<div class="stmt"><p><span class="kind">Theorem 3.</span> When BFS finishes, every vertex reachable from the start <i>s</i> has a label, and the label of each vertex <i>w</i> is exactly d(<i>s</i>, <i>w</i>).</p></div>
<details class="reveal"><summary>Guess first: could BFS ever give a vertex a label smaller than its true distance?</summary><p>No. Following the labels back to the start gives a real walk of that length. This is the first half of the proof below.</p></details>
<div class="proof annotated"><p><span class="kind">Proof.</span> First, no label is too small. A vertex is labelled one more than a neighbour that was already labelled, so following the "labelled from" links back to <i>s</i> gives a walk from <i>s</i> to <i>w</i> whose length is exactly the label. A walk that long exists, so d(<i>s</i>, <i>w</i>) is at most the label.</p>
<p class="why">This half is true of any search that labels each new vertex one more than its discoverer, in any order. The order matters only for the other half.</p>
<p>Second, the queue keeps its labels in order: at every moment the labels in the queue, from front to back, never decrease, and the last is at most one more than the first. This holds at the start (one vertex), and each step keeps it: the front vertex, with the smallest label <i>k</i>, is removed, and new vertices are added at the back with label <i>k</i> + 1. So vertices leave the queue in order of their labels.</p>
<p class="why">This is an invariant, like Euclid's gcd in Lesson 4: true at the start and kept by every step, so true throughout, by induction on the number of steps.</p>
<p>Now suppose some vertex got a label larger than its distance, and among all such vertices choose one, <i>w</i>, with the smallest distance, say d(<i>s</i>, <i>w</i>) = <i>k</i> + 1. On a shortest path from <i>s</i> to <i>w</i>, the vertex <i>v</i> just before <i>w</i> has distance <i>k</i>, and so, by the choice of <i>w</i>, <i>v</i>'s label is correct: it is <i>k</i>. When <i>v</i> leaves the queue, <i>w</i> either has no label yet, in which case it gets <i>k</i> + 1, or it was already labelled from some vertex that left the queue before <i>v</i>, whose label is therefore at most <i>k</i>; either way <i>w</i>'s label is at most <i>k</i> + 1. That contradicts the choice of <i>w</i>. So no label is too large, and with the first half, every label is exactly right. The same argument shows every reachable vertex gets a label. <span class="qed">∎</span></p>
<p class="why">Choosing a <em>smallest</em> counterexample and showing it cannot exist is a proof by contradiction (Lesson 4) built on the same foundation as induction (Lesson 3): if there were any counterexample, there would be a smallest one.</p></div>
<p>The same search solves puzzles. Make each position of a puzzle a vertex and each legal move an edge; then a shortest solution is a shortest path, and BFS finds it without knowing anything about the puzzle. One algorithm, many problems: that is the payoff of a good abstraction.</p>
<details class="reveal"><summary>Guess first: for a sliding puzzle, what are the vertices and what are the edges?</summary><p>The vertices are the positions the puzzle can be in; an edge joins two positions that are one legal move apart. A shortest solution is then a shortest path from the starting position to the solved one.</p></details>
<h2>Trees</h2>
<div class="stmt"><p><span class="kind">Definition.</span> A <em>cycle</em> is a walk of length at least 3 that starts and ends at the same vertex and repeats no other vertex. A <em>tree</em> is a connected graph with no cycle. A vertex of degree 1 is a <em>leaf</em>.</p></div>
<p>Family trees, folders inside folders, and the pattern of calls made by a recursive function are all trees. The piece of the towns graph made of Dell, Elm and the road between them is a tree; Ash, Birch and Cedar form a cycle.</p>
<details class="reveal"><summary>Guess first: three towns with a road between each pair. Is that a tree?</summary><p>No. It is connected, but Ash, Birch, Cedar, Ash is a cycle, and a tree has none.</p></details>
<div class="stmt"><p><span class="kind">Theorem 4.</span> Every tree with at least 2 vertices has a leaf.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Take a longest path in the tree, <i>v</i><sub>0</sub>, …, <i>v</i><sub><i>k</i></sub>; since the tree is connected and has 2 or more vertices, <i>k</i> ≥ 1. The endpoint <i>v</i><sub>0</sub> is adjacent to <i>v</i><sub>1</sub>. It has no other neighbour: a neighbour off the path would extend the path, making it longer, and a neighbour <i>v</i><sub><i>j</i></sub> on the path with <i>j</i> ≥ 2 would close a cycle <i>v</i><sub>0</sub>, …, <i>v</i><sub><i>j</i></sub>, <i>v</i><sub>0</sub>. So deg(<i>v</i><sub>0</sub>) = 1. <span class="qed">∎</span></p></div>
<div class="stmt"><p><span class="kind">Theorem 5.</span> Every tree with <i>n</i> vertices has exactly <i>n</i> − 1 edges.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> By induction on <i>n</i>. <b>Base case.</b> A tree with 1 vertex has no edges, and 1 − 1 = 0. <b>Inductive step.</b> Let <i>n</i> ≥ 2 and assume every tree with <i>n</i> − 1 vertices has <i>n</i> − 2 edges. A tree <i>T</i> with <i>n</i> vertices has a leaf <i>v</i>, by Theorem 4. Remove <i>v</i> and its one edge. What remains has no cycle, since removing things cannot create one, and it is still connected, since a path between two remaining vertices never passes through a leaf (it would have to arrive and leave by the leaf's single edge). So it is a tree with <i>n</i> − 1 vertices, and by the assumption it has <i>n</i> − 2 edges. Putting back the one edge, <i>T</i> has <i>n</i> − 1. <span class="qed">∎</span></p></div>
<p>So a tree is as economical as a connected graph can be: <i>n</i> − 1 edges link <i>n</i> vertices, and removing any edge would disconnect it.</p>
<h2>The laboratory</h2>
<p>Here is BFS in Python on the towns graph, with the degree sum from Theorem 1 checked on the way. <code>queue.pop(0)</code> takes from the front of the list and <code>queue.append(w)</code> adds at the back, which is what makes the list a queue.</p>`,
        { play: `roads = {
    "Ash":   ["Birch", "Cedar"],
    "Birch": ["Ash", "Cedar", "Dell"],
    "Cedar": ["Ash", "Birch"],
    "Dell":  ["Birch", "Elm"],
    "Elm":   ["Dell"],
    "Fir":   ["Gum"], "Gum": ["Fir"],
}

degree_sum = sum(len(roads[v]) for v in roads)
print("sum of degrees:", degree_sum, "  edges:", degree_sum // 2)

def bfs(graph, start):
    label = {start: 0}
    queue = [start]
    while queue:
        v = queue.pop(0)              # take from the front
        for w in graph[v]:
            if w not in label:        # w has no label yet
                label[w] = label[v] + 1
                queue.append(w)       # add at the back
    return label

print(sorted(bfs(roads, "Ash").items()))
print(sorted(bfs(roads, "Fir").items()))`, predict: true, caption: 'The first line prints  sum of degrees: 12   edges: 6, as Theorem 1 says. From Ash, every town in its piece of the map gets its distance: [(\'Ash\', 0), (\'Birch\', 1), (\'Cedar\', 1), (\'Dell\', 2), (\'Elm\', 3)]. From Fir only Gum is reachable, so Fir and Gum are absent from the first search and alone in the second. Add "Fir" to Elm\u2019s list and "Elm" to Fir\u2019s, predict the new distances from Ash (Fir 4, Gum 5), and run.' },
        { skill: 'graphs', check: "A tree has 12 vertices. How many edges?", options: ["12", "11", "13"], answer: 1, why: "Every tree with n vertices has exactly n − 1 edges, proved by removing a leaf and using induction.", wrong: ["12 edges on 12 vertices would be one edge too many for a tree: a connected graph with n edges on n vertices has a cycle.", null, "More edges than vertices means plenty of cycles. A tree is the sparsest connected graph: n − 1 edges."] },
        `<p>Try changing <code>queue.pop(0)</code> to <code>queue.pop()</code>, which takes from the <em>back</em>. The search still reaches the same vertices, but the second half of the proof of Theorem 3 depended on the queue's order, and on some graphs the labels now come out too large. A five-vertex ring shows it: add <code>ring = {"A": ["B", "E"], "B": ["A", "C"], "C": ["B", "D"], "D": ["C", "E"], "E": ["A", "D"]}</code> and <code>print(sorted(bfs(ring, "A").items()))</code>. With <code>pop(0)</code>, C gets 2; with <code>pop()</code>, C gets 3, although A, B, C is a path of length 2.</p>
<h2>Before the exercises</h2>
<p>The first exercise asks five short questions, each settled by one theorem of this lesson; decide which theorem first. The second asks you to run BFS by hand on a small graph, recording each vertex's label and the vertex it was labelled from. Process the queue strictly front to back, and read each neighbour list in the order given; when a vertex could be labelled from two different vertices, it is labelled by whichever leaves the queue first.</p>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> In a neighbour dictionary, listing an edge from only one side. Forgetting that the degree sum counts every edge twice. Reading Euler's theorem backwards: 0 or 2 odd vertices is necessary for an Euler walk, and (for a connected graph) also sufficient, but a disconnected graph can pass the degree test and still have no Euler walk. In BFS, taking from the back of the list instead of the front, or labelling a vertex a second time when it is reached again. Calling any connected graph a tree: a tree must also have no cycle, and then it has exactly <i>n</i> − 1 edges.</p>` },
        {
          ex: {
            id: 'ma-5-1', skill: 'graphs', kind: 'answer', title: 'One theorem each',
            prompt: `<p>Answer each question with a number, or with yes or no.</p>`,
            parts: [
              { label: '(a) A graph has five vertices, with degrees 3, 3, 2, 2 and 2. How many edges does it have?', answer: '6', width: '5rem',
                wrong: [{ match: '12', msg: 'That is the sum of the degrees. By Theorem 1 it counts every edge twice.' }, { match: '5', msg: 'That is the number of vertices. Add up the degrees and use Theorem 1.' }] },
              { label: '(b) Is there a graph whose vertices have degrees 3, 3, 3, 2 and 2?', answer: 'no', width: '5rem',
                wrong: [{ match: 'yes', msg: 'Count the vertices of odd degree: three of them. The corollary to Theorem 1 says that number must be even. (Equivalently, the degree sum 13 is odd.)' }] },
              { label: '(c) A connected multigraph has vertices of degrees 4, 3, 3, 2, 2 and 2. Does it have an Euler walk?', answer: 'yes', width: '5rem',
                wrong: [{ match: 'no', msg: 'Exactly two vertices have odd degree, and the graph is connected, so by Euler\u2019s theorem and its converse an Euler walk exists: it starts at one odd vertex and ends at the other.' }] },
              { label: '(d) A tree has 12 vertices. How many edges does it have?', answer: '11', width: '5rem',
                wrong: [{ match: '12', msg: 'A tree with n vertices has n − 1 edges (Theorem 5). With 12 edges on 12 vertices there would be a cycle.' }, { match: '13', msg: 'Theorem 5: n − 1 edges for n vertices.' }] },
              { label: '(e) A graph has 7 vertices and every vertex has degree 4. How many edges does it have?', answer: '14', width: '5rem',
                wrong: [{ match: '28', msg: 'That is the degree sum, 7 × 4. By Theorem 1 it is twice the number of edges.' }, { match: '7', msg: 'Add up the degrees, 7 × 4, and halve it.' }] }
            ],
            hints: ['(a) and (e): sum the degrees and halve. (b): count the odd degrees. (c): count the odd degrees and use Euler\u2019s theorem with its converse.', '(d): Theorem 5, n − 1.'],
            solution: `<p>(a) The degree sum is 12, so by Theorem 1 there are <b>6</b> edges.</p><p>(b) <b>No</b>: three vertices would have odd degree, and the number of odd-degree vertices must be even. The degree sum, 13, is odd, which Theorem 1 forbids.</p><p>(c) <b>Yes</b>: the graph is connected with exactly two odd vertices, so an Euler walk exists, starting and ending at the two odd vertices. (Theorem 2 alone only shows that nothing rules it out; the converse, which we took without proof, supplies the walk.)</p><p>(d) By Theorem 5, <b>11</b>.</p><p>(e) The degree sum is 7 × 4 = 28, so there are <b>14</b> edges.</p>`,
            followup: 'Part (b) is an impossibility proof in one line: no drawing, however clever, can have those degrees.'
          }
        },
        {
          ex: {
            id: 'ma-5-2', skill: 'shortest-paths', kind: 'table', title: 'Breadth-first search by hand',
            prompt: `<p>Run BFS from A on the graph with these neighbour lists, reading each list in the order shown:</p>
<pre class="code"><code>A: B, C      B: A, D      C: A, D
D: B, C, E   E: D, F      F: E</code></pre>
<p>For each vertex, give its label (its distance from A) and the vertex it was labelled from.</p>`,
            head: ['vertex', 'label', 'labelled from'],
            rows: [
              ['A', '0', '(start)'],
              ['B', { a: '1', name: 'label of B' }, { a: 'A', name: 'B labelled from' }],
              ['C', { a: '1', name: 'label of C' }, { a: 'A', name: 'C labelled from' }],
              ['D', { a: '2', name: 'label of D' }, { a: 'B', name: 'D labelled from', why: { C: 'D is a neighbour of both B and C, but B is ahead of C in the queue, so B leaves first and labels D. When C leaves, D already has a label.' } }],
              ['E', { a: '3', name: 'label of E', why: { '4': 'E is labelled from D, and D\u2019s label is 2, so E\u2019s is 3.' } }, { a: 'D', name: 'E labelled from' }],
              ['F', { a: '4', name: 'label of F', why: { '5': 'The path A, B, D, E, F has 4 edges. The label is the number of edges, not the number of vertices.' } }, { a: 'E', name: 'F labelled from' }]
            ],
            hints: ['The queue starts as [A]. A leaves and labels B and C with 1; the queue is now [B, C].', 'B leaves and labels D with 2 (A already has a label). C leaves: its neighbours A and D both have labels already. Then D leaves and labels E, and E labels F.'],
            solution: `<p>Queue [A]. A leaves: B and C get label 1, queue [B, C]. B leaves: A is labelled, D gets 2 from B, queue [C, D]. C leaves: A and D are already labelled, queue [D]. D leaves: B and C are labelled, E gets 3 from D, queue [E]. E leaves: F gets 4 from E, queue [F]. F leaves: nothing new. So B 1 (A), C 1 (A), D 2 (B), E 3 (D), F 4 (E).</p><p>Following the "labelled from" column back from F gives F, E, D, B, A: a shortest path of length 4, exactly as the first half of the proof of Theorem 3 described.</p>`,
            followup: 'The "labelled from" column is itself a tree: 6 vertices and 5 links, as Theorem 5 requires. It is called a breadth-first search tree, and it contains a shortest path from A to every vertex.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A graph is a set of vertices and a set of edges, each a pair of vertices; a dictionary of neighbour lists represents one, with each edge listed from both ends.</li>
<li>Handshake theorem, by double counting: the degree sum is twice the number of edges, so the number of odd-degree vertices is even.</li>
<li>Euler: a walk crossing every edge once needs 0 or 2 odd vertices, so Königsberg has none; for connected multigraphs the converse holds too.</li>
<li>BFS labels vertices in layers using a queue. The labels are exact distances, because the queue keeps labels in order (an invariant) and a smallest counterexample cannot exist. So the shortest path in a network of billions is found by BFS in time proportional to the vertices plus the edges, not by trying every route.</li>
<li>A tree is connected with no cycle; it has a leaf, and exactly <i>n</i> − 1 edges, by induction.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3A-DA-12', '3B-CS-02'],
      standard: 1,
      title: 'Machines with a finite memory', summary: 'Finite automata defined exactly: alphabets, strings and languages; designing a machine by deciding what it must remember; proving it right by induction; and complements.',
      blocks: [
        `<p>A combination lock with a keypad opens as soon as the last three keys pressed are 1, 2, 3, whatever came before. It does not need to remember everything you have typed, only how much of "123" you have just typed: nothing, "1", or "12". Machines that get by on a fixed, small memory like this are everywhere, in lifts, traffic lights and vending machines. So how little memory can a machine have and still give the right answer?</p>
<p>Strip a computer down as far as it will go and you get this: a machine that reads its input one symbol at a time, and at every moment is in one of a fixed, finite number of <em>states</em>. It has no other memory. When it reads a symbol, it moves to a new state that depends only on its current state and that symbol. When the input runs out, it answers yes or no according to the state it has ended in.</p>
<p>This is a <em>finite automaton</em>. A turnstile is one, with the states "locked" and "unlocked". So is a check that decides whether the text you typed looks like a number. This lesson defines these machines exactly, shows how to design one, and proves that a design is right. The next lesson describes the same machines with patterns, and Lesson 9 proves what no such machine can do.</p>`,
        { photo: 'turnstile-nyc', caption: "Turnstiles in a New York subway station. Each is a finite automaton with two states: paying moves it from locked to unlocked, and pushing through moves it back to locked. It needs no other memory." },
        `<h2>Alphabets, strings and languages</h2>
<div class="stmt"><p><span class="kind">Definition.</span> An <em>alphabet</em> is a finite set of symbols, such as {0, 1} or {a, b}. A <em>string</em> over an alphabet is a finite sequence of its symbols, such as 0110. Its <em>length</em> is the number of symbols. The string of length 0 is the <em>empty string</em>, written ε. A <em>language</em> is a set of strings.</p></div>
<p>For example, over {0, 1}, the strings that end in 01 form a language: it contains 01, 1101 and 0001, and not 10 or ε. So do the strings with an even number of 1s, which includes ε, since 0 is even. A language may be infinite, as both of these are, even though every string in it is finite.</p>
<details class="reveal"><summary>Guess first: is the empty string in the language of strings that end in 01?</summary><p>No. A string that ends in 01 has at least two symbols, and ε has none. It is in the language of strings with an even number of 1s, though, since 0 is even.</p></details>
<h2>Deterministic finite automata</h2>
<div class="stmt"><p><span class="kind">Definition.</span> A <em>deterministic finite automaton</em> (DFA) consists of</p>
<p>a finite set <i>Q</i> of <em>states</em>; an alphabet Σ; a <em>transition function</em> δ, which gives for every state <i>q</i> and every symbol <i>c</i> exactly one next state δ(<i>q</i>, <i>c</i>); a <em>start state</em> <i>q</i><sub>0</sub>; and a set <i>F</i> ⊆ <i>Q</i> of <em>accepting states</em>.</p>
<p>To run it on a string, begin in <i>q</i><sub>0</sub> and, for each symbol in turn, move from the current state <i>q</i> to δ(<i>q</i>, <i>c</i>). The machine <em>accepts</em> the string if the state it ends in is in <i>F</i>, and <em>rejects</em> it otherwise. The <em>language of the machine</em> is the set of strings it accepts.</p></div>
<p>"Deterministic" means there is never a choice: every state has exactly one arrow for every symbol, so the input decides the whole run. Here is a machine with three states, <i>a</i>, <i>b</i> and <i>c</i>. Type a string and step through it.</p>`,
        { fig: 'dfa', machine: 'ends01', caption: 'Start in a, the state with the incoming arrow. c, the double circle, is the only accepting state. Try 1101, 010 and the empty string.' },
        { skill: 'dfa', check: "What is a state of a DFA?", options: ["A position in the input", "Everything the machine remembers about what it has read so far", "A symbol of the alphabet"], answer: 1, why: "Design a machine by deciding what each state means about the input so far. The machine has no other memory.", wrong: ["A state is not a place in the string: the machine has no way to go back, and the same state can be reached at many positions. It is a fact about what was read.", null, "Symbols are what the machine reads. States are what it remembers; the two sets are separate, and they are usually different sizes."] },
        `<p>The whole machine is its transition table: one row per state, one column per symbol.</p>
<table class="small"><tr><th>state</th><th>on 0</th><th>on 1</th></tr><tr><td><i>a</i> (start)</td><td><i>b</i></td><td><i>a</i></td></tr><tr><td><i>b</i></td><td><i>b</i></td><td><i>c</i></td></tr><tr><td><i>c</i> (accepting)</td><td><i>b</i></td><td><i>a</i></td></tr></table>
<p>Its language is the strings ending in 01. To see why, read each state as a fact about what has been read so far: <i>c</i> means "the input so far ends in 01"; <i>b</i> means "it ends in 0"; <i>a</i> means everything else, "it is empty, or it ends in a 1 that no 0 comes just before" (the empty string, the string 1, or anything ending in 11). The states are not positions in the string or counts of anything. They are <em>everything the machine remembers</em>, and designing a machine is deciding what is the least it must remember to give the right answer at the end.</p>
<details class="reveal"><summary>Guess first: starting in a, what state does the machine end in after reading 1101, and does it accept?</summary><p>a on 1 stays a, on 1 stays a, on 0 goes to b, on 1 goes to c. It ends in c, the accepting state, so 1101 is accepted: it ends in 01.</p></details>
<h2>Designing a machine, and proving it right</h2>
<p>Suppose we want a machine for the strings over {0, 1} with an even number of 1s. It cannot remember how many 1s it has seen, because a count can grow without limit and the machine has only finitely many states. But it does not need the count, only whether the count is even or odd. Two states suffice.</p>
<table class="small"><tr><th>state</th><th>on 0</th><th>on 1</th></tr><tr><td><i>even</i> (start, accepting)</td><td><i>even</i></td><td><i>odd</i></td></tr><tr><td><i>odd</i></td><td><i>odd</i></td><td><i>even</i></td></tr></table>
<p>Reading a 0 changes nothing; reading a 1 changes the parity. The start state is <i>even</i>, because before anything is read no 1s have been seen, and zero is even. Checking a few strings is not a proof, as Lesson 3 insisted. The proof states what each state means and shows that the meaning survives every step, by induction on the length of the input.</p>
<details class="reveal"><summary>Guess first: what state is the even-1s machine in after reading 0110?</summary><p><i>even</i>. The string has two 1s, and each 1 switches the state: even, even, odd, even, even. The 0s change nothing.</p></details>
<div class="stmt"><p><span class="kind">Theorem 1.</span> For every string <i>w</i> over {0, 1}, the machine above, after reading <i>w</i>, is in state <i>even</i> if <i>w</i> contains an even number of 1s and in state <i>odd</i> otherwise. So its language is the strings with an even number of 1s.</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> By induction on the length of <i>w</i>. <b>Base case.</b> The only string of length 0 is ε, which has zero 1s, and the machine is in its start state, <i>even</i>.</p>
<p class="why">Base case: the claim for the shortest input. The start state has to mean the right thing about the empty string.</p>
<p><b>Inductive step.</b> Suppose the claim holds for a string <i>w</i>, and consider <i>wc</i>, the string <i>w</i> followed by one more symbol <i>c</i>. If <i>c</i> = 0, then <i>wc</i> has the same number of 1s as <i>w</i>, and the machine stays in the same state, so the claim still holds. If <i>c</i> = 1, then <i>wc</i> has one more 1, so its parity is the opposite of <i>w</i>'s, and the machine switches between <i>even</i> and <i>odd</i>, so again the claim holds.</p>
<p class="why">Every string of length <i>n</i> + 1 is some string of length <i>n</i> followed by one symbol, so this covers all of them. The two cases are the two columns of the table: checking each transition against the meaning of its states is the whole proof.</p>
<p>By induction the claim holds for every string. The accepting state is <i>even</i>, so the machine accepts exactly the strings with an even number of 1s. <span class="qed">∎</span></p></div>
<p>This is the general method, and it is how every machine in this course can be proved correct: write down in words what each state means about the input read so far, check that the start state means the right thing about ε, check that every entry of the table turns a true meaning into a true meaning, and check that the accepting states are exactly those whose meaning is "accept".</p>
<details class="reveal"><summary>Guess first: what would go wrong if the even-1s machine started in <i>odd</i>?</summary><p>The empty string would be rejected, though it has zero 1s, and every other verdict would flip too. The base case of the proof, "the start state means the right thing about ε", would fail.</p></details>
<h2>Arithmetic with finite memory</h2>
<p>A harder one: accept the binary numerals of the multiples of 3, reading from the most significant bit. The string 110 means six, which should be accepted; 111 means seven, which should not. That seems to need the whole number, which can be larger than any fixed memory. But Lesson 4 says otherwise. If the bits read so far spell the number <i>v</i> and the next bit is <i>b</i>, then once <i>b</i> is read the bits spell 2<i>v</i> + <i>b</i>, and by Lesson 4's Theorem 4 its remainder mod 3 depends only on <i>v</i> mod 3 and <i>b</i>. So the machine needs to remember only the remainder so far: three states, <i>r</i><sub>0</sub>, <i>r</i><sub>1</sub> and <i>r</i><sub>2</sub>.</p>
<table class="small"><tr><th>state</th><th>on 0</th><th>on 1</th></tr><tr><td><i>r</i><sub>0</sub> (start, accepting)</td><td><i>r</i><sub>0</sub> &nbsp;(2·0 + 0 = 0)</td><td><i>r</i><sub>1</sub> &nbsp;(2·0 + 1 = 1)</td></tr><tr><td><i>r</i><sub>1</sub></td><td><i>r</i><sub>2</sub> &nbsp;(2·1 + 0 = 2)</td><td><i>r</i><sub>0</sub> &nbsp;(2·1 + 1 = 3 ≡ 0)</td></tr><tr><td><i>r</i><sub>2</sub></td><td><i>r</i><sub>1</sub> &nbsp;(2·2 + 0 = 4 ≡ 1)</td><td><i>r</i><sub>2</sub> &nbsp;(2·2 + 1 = 5 ≡ 2)</td></tr></table>`,
        { fig: 'dfa', machine: 'div3', caption: 'Divisibility by 3. Try 110 (six), 1001 (nine) and 111 (seven). The machine never computes the number, only its remainder.' },
        { skill: 'finite-memory', check: "Can a DFA accept exactly the strings with as many 0s as 1s?", options: ["Yes, with enough states", "No: it would need an unbounded count, and it has finitely many states", "Yes, with two states"], answer: 1, why: "A finite machine can keep a remainder but not a count that grows without limit. Lesson 9 proves it.", wrong: ["No fixed number of states is enough: the difference between the 0s and 1s can grow as large as the input, so it would need a new state for every value. Lesson 9 proves it.", null, "Two states can remember a yes-or-no fact such as parity, but not the difference between two counts. Equal counts need more than a parity."] },
        `<div class="stmt"><p><span class="kind">Theorem 2.</span> For every binary string <i>w</i>, if <i>w</i> spells the number <i>v</i>, then after reading <i>w</i> the machine is in state <i>r</i><sub><i>k</i></sub> with <i>k</i> = <i>v</i> mod 3. So it accepts exactly the binary numerals of multiples of 3.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> By induction on the length of <i>w</i>. The empty string spells 0 (no bits, no value), and the machine starts in <i>r</i><sub>0</sub>. If <i>w</i> spells <i>v</i> and the machine is in <i>r</i><sub><i>k</i></sub> with <i>k</i> = <i>v</i> mod 3, then <i>wb</i> spells 2<i>v</i> + <i>b</i>. By Lesson 4's Theorem 4, 2<i>v</i> + <i>b</i> ≡ 2<i>k</i> + <i>b</i> (mod 3), and the table sends <i>r</i><sub><i>k</i></sub> on <i>b</i> to <i>r</i><sub>(2<i>k</i> + <i>b</i>) mod 3</sub>, as the working in each cell shows. So the claim holds for <i>wb</i>. The accepting state is <i>r</i><sub>0</sub>, remainder 0. <span class="qed">∎</span></p></div>
<p>The same construction works for any divisor <i>m</i>, with <i>m</i> states. What a finite machine cannot hold is an unbounded number; what it can hold is any fixed amount of information about one, such as its remainder.</p>
<details class="reveal"><summary>Guess first: what does the divisibility machine do on the empty string, and is it right?</summary><p>It stays in <i>r</i><sub>0</sub>, which is accepting, so ε is accepted. That is right: ε spells 0, and 0 is a multiple of 3.</p></details>
<h2>Complements</h2>
<p>Once you have a machine for a language, a machine for the opposite comes free.</p>
<div class="stmt"><p><span class="kind">Theorem 3.</span> If a DFA <i>M</i> has language <i>L</i>, then the DFA obtained from <i>M</i> by making every accepting state non-accepting and every non-accepting state accepting has language Σ* − <i>L</i>, the set of all strings not in <i>L</i>. (Σ* means the set of all strings over Σ.)</p></div>
<div class="proof"><p><span class="kind">Proof.</span> The two machines have the same states, start and transitions, so on any string they end in the same state. That state is accepting in exactly one of the two machines. So each string is accepted by exactly one of them, and the second accepts exactly the strings the first rejects. <span class="qed">∎</span></p></div>
<p>The proof used determinism: each string has exactly one run, ending in exactly one state. So a machine for "does not end in 01" is the table above with <i>a</i> and <i>b</i> accepting and <i>c</i> not. A machine for "not a multiple of 3" accepts in <i>r</i><sub>1</sub> and <i>r</i><sub>2</sub>.</p>
<h2>The laboratory</h2>
<p>In Python, a machine is naturally a dictionary: its start state, its list of accepting states, and its table as a dictionary of dictionaries. Running it is a four-line loop, which is the definition of running written as code. The program checks Theorem 2 against Python's own <code>%</code> for every number from 0 to 63.</p>`,
        { play: `div3 = {
    "start": "r0",
    "accept": ["r0"],
    "delta": {
        "r0": {"0": "r0", "1": "r1"},
        "r1": {"0": "r2", "1": "r0"},
        "r2": {"0": "r1", "1": "r2"},
    },
}

def run(machine, s):
    state = machine["start"]
    for ch in s:
        state = machine["delta"][state][ch]
    return state in machine["accept"]

disagreements = 0
for n in range(64):
    s = bin(n)[2:]               # n in binary, without the "0b"
    if run(div3, s) != (n % 3 == 0):
        disagreements += 1
    if n < 10:
        print(n, s, run(div3, s))
print("disagreements with n % 3 == 0:", disagreements)`, predict: true, caption: 'The first ten lines are  0 0 True,  1 1 False,  2 10 False,  3 11 True,  4 100 False,  and so on up to  9 1001 True: the accepted numbers are exactly the multiples of 3. The last line is  disagreements with n % 3 == 0: 0. The machine and the arithmetic agree on all 64 numbers. Change "accept" to ["r1", "r2"] and the machine accepts exactly the rest, as Theorem 3 says.' },
        { skill: 'dfa', check: "How do you get a DFA for the complement of a language, from a DFA for the language?", options: ["Reverse the arrows", "Swap accepting and non-accepting states", "Add a new start state"], answer: 1, why: "The run on any string is the same; only the verdict at the end flips.", wrong: ["Reversing arrows changes which run the input takes, and the machine may stop being deterministic. The complement keeps every run and flips only the verdict.", null, "A new start state changes nothing about which strings end in an accepting state. The verdict at the end is what must flip."] },
        `<p>Sixty-four agreements are evidence; Theorem 2 is the proof, and it covers numbers far too long for any test. The program is still useful: when a design is wrong, a check like this finds a counterexample quickly.</p>
<h2>What a finite machine cannot do</h2>
<p>A machine with <i>k</i> states can be in only <i>k</i> different situations, however long its input. That is its strength, because it needs almost no memory and takes one step per symbol, and it is exactly its weakness: Lesson 9 proves that some simple questions need more than any fixed amount of memory, so no finite automaton can answer them. Simple is not the same as weak, though. Many pattern-matching tools run your text through a finite automaton, and the first stage of a compiler, the part that splits source code into words, is typically one too.</p>
<h2>Before the exercises</h2>
<p>A short trace comes first: it follows the loop of the laboratory's <code>run</code> function one symbol at a time. The next exercise runs the divisibility machine by hand on a longer string, recording the number spelled so far and the state, so you can watch Theorem 2 hold line by line. The second asks you to design a machine by filling in its table. Use the method: name what each state means about the input so far, then for each state and symbol ask, "if that was true and I now read this symbol, what is true now?"</p>`,
        `<details class="reveal"><summary>Puzzle: how many states does a machine need for the keypad lock above, over the keys 0 to 9, and what should it do after "12" if the next key is 1?</summary><p>Four: nothing useful yet, "just typed 1", "just typed 12", and "just typed 123" (open). After "12", a 1 goes back to "just typed 1", not to the start, because that 1 might begin a new 123. A 3 opens the lock, and any other key goes back to the start. This is the "ends in 01" machine of this lesson with one more state, and the same care is needed about what the last few symbols could still become.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> A missing entry in the table, so the machine has nowhere to go on some symbol; a DFA needs exactly one next state for every state and symbol. Making states stand for positions in the input rather than for facts about what has been read. Trying to remember a count, which a finite machine cannot, instead of a remainder or a yes-or-no fact. Forgetting the empty string: the start state must be accepting exactly when ε belongs to the language. Believing a machine is correct because it passed some tests, instead of checking every transition against the meaning of its states.</p>` },
        {
          ex: {
            id: 'ma-17-2', kind: 'trace', skill: 'dfa', title: 'Trace the divisibility machine',
            prompt: `<p>This is the loop of the laboratory's <code>run</code> function, on the machine for multiples of 3, reading the string 1011. Fill in the table: each row is a moment just after line 4, with the values of <code>ch</code> (the symbol just read) and <code>state</code> then. The first row is done for you.</p>`,
            code: `delta = {"r0": {"0": "r0", "1": "r1"}, "r1": {"0": "r2", "1": "r0"}, "r2": {"0": "r1", "1": "r2"}}\nstate = "r0"\nfor ch in "1011":\n    state = delta[state][ch]\nprint(state)`,
            vars: ['ch', 'state'],
            steps: [
              { line: 4, values: { ch: '1', state: 'r1' }, show: true },
              { line: 4, values: { ch: '0', state: 'r2' }, why: { state: { r1: 'The machine is in r1 and reads a 0, and the table sends (r1, 0) to r2: the number so far, 1, becomes 10 in binary, which is 2.', r0: 'From r1, not from the start: the machine is now in the state after the first symbol.' } } },
              { line: 4, values: { ch: '1', state: 'r2' }, why: { state: { r0: 'The table sends (r2, 1) to r2, not r0: 2 · 2 + 1 = 5, and 5 mod 3 = 2.' } } },
              { line: 4, values: { ch: '1', state: 'r2' }, why: { state: { r0: '2 · 2 + 1 = 5 again, and 5 mod 3 = 2: the table sends (r2, 1) to r2 once more.' } } }
            ],
            hints: ['Each pass reads one symbol and looks up the table entry for (state, symbol). Use the state from the row above as the current state.', 'The path is r0 on 1 to r1, then r1 on 0 to r2, then r2 on 1 to r2, then r2 on 1 to r2 again.'],
            solution: '<p>ch: 1, 0, 1, 1. state: r1, r2, r2, r2. The program prints <code>r2</code>: 1011 is eleven, and 11 mod 3 = 2, so the machine ends in r2 and the string is not accepted. The state after each symbol is the remainder of the number read so far: 1, 2, 5 mod 3 = 2, and 11 mod 3 = 2.</p>',
            failTip: 'Look up (current state, symbol) in the table, not (start state, symbol): every pass starts from the state the previous pass ended in.',
            followup: 'Change the string to "1100" and trace it again. Which state does it end in, and what number is 1100?'
          }
        },
        {
          ex: {
            id: 'ma-6-1', skill: 'dfa', kind: 'table', title: 'Run the machine by hand',
            prompt: `<p>Run the divisibility-by-3 machine on the string 10011. For each prefix, give the number it spells in binary and the state the machine is in after reading it. Then say whether the whole string is accepted.</p>`,
            head: ['prefix read', 'number spelled', 'state after it'],
            rows: [
              ['(nothing)', '0', '<i>r</i><sub>0</sub>'],
              ['1', '1', { a: ['r1', 'r_1'], name: 'state after 1', why: { r0: 'From r0 on a 1 the table goes to r1: 2 · 0 + 1 = 1.' } }],
              ['10', '2', { a: ['r2', 'r_2'], name: 'state after 10' }],
              ['100', { a: '4', name: 'number spelled by 100', why: { '3': '100 in binary is 4: one 4, no 2s, no 1s.' } }, { a: ['r1', 'r_1'], name: 'state after 100', why: { r2: 'From r2 on a 0: 2 · 2 + 0 = 4, and 4 mod 3 = 1.', r0: '4 is not a multiple of 3: 4 mod 3 = 1.' } }],
              ['1001', { a: '9', name: 'number spelled by 1001' }, { a: ['r0', 'r_0'], name: 'state after 1001', why: { r1: 'From r1 on a 1: 2 · 1 + 1 = 3, and 3 mod 3 = 0.' } }],
              ['10011', { a: '19', name: 'number spelled by 10011', why: { '18': 'Doubling 9 and adding the new bit 1 gives 19.' } }, { a: ['r1', 'r_1'], name: 'state after 10011' }],
              ['accepted?', { a: 'no', name: 'accepted?', why: { yes: 'The machine ends in r1, which is not accepting: 19 leaves remainder 1.' } }, '']
            ],
            hints: ['Each new bit doubles the number and adds the bit: 1, then 2, then 4, then 9, then 19.', 'The state is always the number mod 3: 1 → r1, 2 → r2, 4 → r1, 9 → r0, 19 → r1. Only r0 accepts.'],
            solution: `<p>Numbers: 1, 2, 4, 9, 19, each twice the previous plus the new bit. States: <i>r</i><sub>1</sub>, <i>r</i><sub>2</sub>, <i>r</i><sub>1</sub>, <i>r</i><sub>0</sub>, <i>r</i><sub>1</sub>, which are exactly the remainders 1, 2, 1, 0, 1 of those numbers mod 3, as Theorem 2 says. The run ends in <i>r</i><sub>1</sub>, which is not accepting, so 10011 is <b>not</b> accepted: 19 is not a multiple of 3.</p>`,
            followup: 'Along the way the machine passed through r0 after 1001, because 9 is a multiple of 3. Accepting depends only on where the run ends.'
          }
        },
        {
          ex: {
            id: 'ma-6-2', skill: 'dfa', kind: 'table', title: 'Design a machine',
            prompt: `<p>Complete the table of a DFA over {a, b} that accepts exactly the strings containing <code>ab</code> somewhere, such as <code>ab</code>, <code>bbaab</code> and <code>abbb</code>, and rejects <code>ba</code>, <code>aaa</code> and the empty string. The three states mean:</p>
<p><i>none</i>: no <code>ab</code> seen yet, and the last symbol was not an a (or nothing has been read). <i>sawA</i>: no <code>ab</code> seen yet, and the last symbol was an a. <i>done</i>: an <code>ab</code> has been seen.</p>
<p>Write the name of the next state in each blank, and say which state is accepting.</p>`,
            head: ['state', 'on a', 'on b'],
            rows: [
              ['<i>none</i> (start)', { a: ['sawA', 'saw a', 'saw_a'], name: 'none on a', why: { none: 'The a just read might be the first half of ab, so the machine must remember it.' } }, { a: 'none', name: 'none on b', why: { done: 'A b with no a just before it does not complete ab.', sawa: 'The last symbol read is now b, not a.' } }],
              ['<i>sawA</i>', { a: ['sawA', 'saw a', 'saw_a'], name: 'sawA on a', why: { none: 'The last symbol read is still an a, and it could start ab.' } }, { a: 'done', name: 'sawA on b', why: { none: 'An a followed by this b is ab: it has now been seen.' } }],
              ['<i>done</i>', { a: 'done', name: 'done on a', why: { none: 'Once ab has been seen, the string contains it whatever comes next.', sawa: 'Once ab has been seen, the string contains it whatever comes next.' } }, { a: 'done', name: 'done on b' }],
              ['accepting state:', { a: 'done', name: 'the accepting state', why: { sawa: 'In sawA no ab has been seen yet: the string aaa ends there and must be rejected.' } }, '']
            ],
            hints: ['For each blank ask: if the state\u2019s meaning was true and the machine now reads this symbol, which meaning is true now?', 'From none, an a leads to sawA and a b stays in none. From sawA, a b completes ab. Nothing takes you out of done.'],
            solution: `<p><i>none</i>: on a go to <i>sawA</i>, on b stay in <i>none</i>. <i>sawA</i>: on a stay in <i>sawA</i> (the last symbol is still an a), on b go to <i>done</i>. <i>done</i>: stay in <i>done</i> on both symbols. The accepting state is <i>done</i>.</p><p>Each entry turns a true description into a true description, and the start state <i>none</i> describes the empty string correctly, so by the method of Theorem 1 the machine accepts exactly the strings containing ab. By Theorem 3, making <i>none</i> and <i>sawA</i> accepting instead gives a machine for the strings that do <em>not</em> contain ab.</p>`,
            followup: 'Try, on paper, a machine for the strings containing aba. You will need four states. The subtle entry: after reading ab, what should happen on a b?'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>An alphabet is a finite set of symbols; a string is a finite sequence of them, possibly empty (ε); a language is a set of strings.</li>
<li>A DFA has finitely many states, a start state, accepting states, and exactly one next state for every state and symbol. Its language is the set of strings it accepts.</li>
<li>A state is everything the machine remembers. Design by deciding what each state means about the input so far.</li>
<li>Prove a machine right by induction on the input's length: the start state means the right thing about ε, and every transition turns a true meaning into a true one.</li>
<li>A finite machine can keep a remainder but not an unbounded count. Swapping accepting and non-accepting states gives the complement language.</li>
<li>So the least a machine must remember is just enough to answer: a parity, a remainder, or how much of "123" has been typed.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3A-IC-24', '3B-DA-05'],
      standard: 1,
      title: 'Patterns, and the double vowel system', summary: 'Regular expressions: a notation for languages built from three operations. Then a real writing system, the double vowel spelling of Ojibwe, read by a three-state machine; why a code whose letters overlap needs a rule for reading; and what a pattern can and cannot say about a language.',
      blocks: [
        `<p>The home page of this site greets you with <span lang="ciw">Boozhoo</span>, the Ojibwe word for hello. Count its letters. In English you would say seven: B, o, o, z, h, o, o. A reader of Ojibwe says four: <b>b</b>, <b>oo</b>, <b>zh</b>, <b>oo</b>. The word is spelled in the <em>double vowel system</em>, and in that system <b>oo</b> is one letter, a long vowel, and <b>zh</b> is one letter, a consonant (the sound in the middle of \"measure\"). So how does a reader, or a program, know where one letter ends and the next begins?</p>`,
        { photo: 'boozhoo-sign', caption: "The town sign of Bejou, Minnesota, population 84, greets drivers in Ojibwe and English. <span lang=\"ciw\">Boozhoo</span> is spelled in the double vowel system: seven characters, four letters." },
        `<p>Turning a string of typed characters into a string of letters is exactly the job Lesson 7 said a finite automaton typically does at the start of a compiler: before Python can run <code>x == y</code>, something must decide that <code>==</code> is one symbol and not two. This lesson gives such jobs a notation, the <em>regular expression</em>, which is how a search box or a programming language lets you write a pattern. Then it puts the notation and Lesson 7's machines to work on a real writing system, and proves what they can tell us about it and what they cannot.</p>
<h2>Regular expressions</h2>
<p>A regular expression is a formula whose value is a language, in the sense of Lesson 7: a set of strings. It is built from single symbols with three operations.</p>
<div class="stmt"><p><span class="kind">Definition.</span> The <em>regular expressions</em> over an alphabet Σ, and the language <i>L</i>(<i>R</i>) that each one describes, are given by these rules.</p>
<p>ε is a regular expression, and <i>L</i>(ε) = {ε}. Each symbol <i>c</i> of Σ is a regular expression, and <i>L</i>(<i>c</i>) = {<i>c</i>}.</p>
<p>If <i>R</i> and <i>S</i> are regular expressions, so are these three. The <em>union</em> <i>R</i>|<i>S</i> describes <i>L</i>(<i>R</i>) ∪ <i>L</i>(<i>S</i>). The <em>concatenation</em> <i>RS</i> describes every string <i>xy</i> with <i>x</i> in <i>L</i>(<i>R</i>) and <i>y</i> in <i>L</i>(<i>S</i>). The <em>star</em> <i>R</i>* describes every string made by joining zero or more strings of <i>L</i>(<i>R</i>), one after another; zero of them gives ε.</p></div>
<p>Parentheses group, as in algebra, and there is an order of operations: star first, then concatenation, then union. So <code>ab*</code> means <code>a(b*)</code>, an a followed by any number of b's, and not <code>(ab)*</code>; and <code>a|bc</code> means <code>a|(bc)</code>. Programming languages add shorthands, such as <code>[abc]</code> for <code>a|b|c</code> and <code>R+</code> for <code>RR*</code>, but nothing that the three operations cannot already say.</p>
<details class="reveal"><summary>Guess first: does <code>ab*</code> describe the string abab?</summary><p>No. Star binds tighter than concatenation, so <code>ab*</code> is an a followed by any number of b's: a, ab, abb, and so on. The string abab is described by <code>(ab)*</code>.</p></details>
<div class="tbl-wrap"><table class="small">
<tr><th>expression over {0, 1}</th><th>the language it describes</th></tr>
<tr><td><code>(0|1)*01</code></td><td>any string at all, then 01: the strings ending in 01, the language of Lesson 7's first machine</td></tr>
<tr><td><code>0*(10*10*)*</code></td><td>some 0s, then blocks that each hold exactly two 1s: the strings with an even number of 1s, Lesson 7's Theorem 1</td></tr>
<tr><td><code>(0|1)(0|1)(0|1)</code></td><td>the eight strings of length 3</td></tr>
<tr><td><code>1(0|1)*|0</code></td><td>the binary numerals with no unnecessary leading 0: 0, 1, 10, 11, 100, …</td></tr>
</table></div>
<p>Reading an expression is a matter of asking, for a given string, whether it can be cut into pieces that the parts of the expression allow. Designing one is like designing a machine: decide the shape every string of the language has, then write that shape down.</p>`,
        `<details class="reveal"><summary>Predict: which of 0110, 1010, 111 and the empty string does <code>0*(10*10*)*</code> describe?</summary><p>0110, 1010 and ε; not 111. 0110 is the 0* part \"0\", then one block \"110\" (a 1, no 0s, a 1, one 0). 1010 is one block, \"1\", \"0\", \"1\", \"0\". The empty string takes zero 0s and zero blocks. 111 has three 1s, and every block uses up exactly two, so no way of cutting it works.</p></details>`,
        `<p>Every pattern in the table has a finite automaton that accepts the same language: Lesson 7 built two of them. That is no accident.</p>
<div class="stmt"><p><span class="kind">Theorem 1 (Kleene, 1956).</span> A language is described by some regular expression if and only if some DFA accepts it. Such languages are called <em>regular</em>.</p></div>
<p>We do not prove this here; the proof is a construction in each direction, and the direction from expressions to machines is what tools such as grep do with the pattern you type. What matters for this lesson is its meaning: a regular expression and a finite automaton are two ways of writing down the same thing, one as a description and one as a machine that checks it. And Lesson 9's limits apply to both: when Lesson 9 proves that no DFA accepts some language, it proves that no regular expression describes it either.</p>
<h2>A real alphabet: the double vowel system</h2>
<p>Ojibwe, the language of the Anishinaabe people of the Great Lakes, has been written in several ways. The <em>double vowel system</em>, developed by Charles Fiero working with fluent speakers, is widely used by teachers and by the Ojibwe People's Dictionary, the source of every Ojibwe word on this site. It uses English letters for Ojibwe sounds, on one principle: each letter stands for one sound. Its name comes from its vowels. Ojibwe has three short vowels, written <b>a</b>, <b>i</b>, <b>o</b>, and four long ones. Three long vowels are written by doubling a short one, <b>aa</b>, <b>ii</b>, <b>oo</b>; the fourth, <b>e</b>, has no short partner, so a single character is enough.</p>
<details class="reveal"><summary>Guess first: is <b>e</b> a short vowel or a long one, since it is written with one character?</summary><p>A long one. The double vowel system writes three long vowels by doubling, but <b>e</b> has no short partner, so one character is enough. Length is a fact about the sound, not about how many characters it takes to write.</p></details>
<div class="tbl-wrap"><table class="small">
<tr><th></th><th>letters</th></tr>
<tr><td>short vowels</td><td><b>a</b> &nbsp;<b>i</b> &nbsp;<b>o</b></td></tr>
<tr><td>long vowels</td><td><b>aa</b> &nbsp;<b>ii</b> &nbsp;<b>oo</b> &nbsp;<b>e</b></td></tr>
<tr><td>consonants</td><td><b>b</b> &nbsp;<b>ch</b> &nbsp;<b>d</b> &nbsp;<b>g</b> &nbsp;<b>h</b> &nbsp;<b>j</b> &nbsp;<b>k</b> &nbsp;<b>m</b> &nbsp;<b>n</b> &nbsp;<b>p</b> &nbsp;<b>s</b> &nbsp;<b>sh</b> &nbsp;<b>t</b> &nbsp;<b>w</b> &nbsp;<b>y</b> &nbsp;<b>z</b> &nbsp;<b>zh</b> &nbsp;<b>'</b></td></tr>
</table></div>
<p>That is 25 letters: 7 vowels and 18 consonants. The last consonant, written with an apostrophe, is the <em>glottal stop</em>, the catch in the middle of \"uh-oh\"; it is a letter like any other, as in <span lang="ciw">Gikinoo'amaagoowin</span>, the word this site shows above each lesson title. The letters are a guide to the sounds, not a recording of them: how the language sounds is learned from people who speak it.</p>
<p>For a machine the system has two layers. What you type is a string of <em>characters</em>, from an alphabet of 20: a b c d e g h i j k m n o p s t w y z and the apostrophe. What the writing means is a string of <em>letters</em>. Every character except c is a letter by itself; c appears only in <b>ch</b>. Hyphens join the parts of some words, as in <span lang="ciw">Niizho-giizhigad</span>, \"it is Tuesday\", and are not letters. In a regular expression, the letters are one union:</p>
<p class="pattern"><code>LETTER = aa|ii|oo|ch|sh|zh|a|b|d|e|g|h|'|i|j|k|m|n|o|p|s|t|w|y|z</code></p>
<p>and a string of letters is <code>LETTER*</code>. Step through the splitting below, and try the words from the site.</p>`,
        { fig: 'letters', caption: 'A word split into letters, one step at a time. Try Miigwech and Gikinoo\'amaagoowin, then a string with a c not followed by h, such as \u201ccat\u201d. Switch to \u201cshortest letter that fits\u201d and read Boozhoo again.' },
        { skill: 'regex', check: "Which strings does <code>(ab)*</code> describe?", options: ["Only ab", "ε, ab, abab, ababab, …", "a followed by any number of b"], answer: 1, why: "Star means zero or more copies, so the empty string is included. ab* would be a followed by any number of b.", wrong: ["This reads the star as \"exactly one\". Star means zero or more copies of the whole group, so ε, abab and so on are included too.", null, "That is what ab* describes, because star binds tighter than concatenation. The parentheses in (ab)* make the star apply to the whole pair."] },
        { skill: 'regex', check: "By Kleene's theorem, a language has a regular expression exactly when…", options: ["it is finite", "some DFA accepts it", "it is countable"], answer: 1, why: "Regular expressions and finite automata describe the same languages: the regular ones.", wrong: ["Finite languages are regular (Theorem 4), but so are infinite ones, such as the strings ending in 01. Being finite is far too narrow.", null, "Every language over a finite alphabet is countable, so this does not separate regular languages from the rest. Kleene's theorem is about machines, not about counting."] },
        `<h2>Which strings can be split?</h2>
<p>Not every string of the 20 characters can be read as letters: in \"cat\" the c has nowhere to go. The next theorem says exactly which strings can, and its proof is the method of Lesson 3.</p>
<div class="stmt"><p><span class="kind">Theorem 2.</span> A string over the 20 characters can be split into letters of the double vowel system if and only if every c in it is immediately followed by an h.</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> <b>Only if.</b> In a split, every character belongs to exactly one letter. The only letter that contains a c is <b>ch</b>, in which the c is followed by an h. So every c is followed by an h.</p>
<p class="why">An \"if and only if\" is two theorems, one in each direction, and each needs its own proof.</p>
<p><b>If.</b> By induction on the length of the string <i>w</i>: assume the claim for every shorter string, and suppose every c in <i>w</i> is followed by an h. If <i>w</i> is empty, it is split into no letters at all. If <i>w</i> starts with c, it starts with <b>ch</b>; if it starts with any other character, that character is a letter. Either way, take that first letter off. What is left still has every c followed by an h, because the h that follows each of its c's is still there: no letter ends in c, so taking off a letter never separates a c from the h after it. What is left is shorter, so it can be split, and the first letter followed by that split is a split of <i>w</i>. <span class="qed">∎</span></p>
<p class="why">This is induction on length that assumes the claim for all shorter strings, not only for the string one shorter. Taking off <b>ch</b> shortens the string by two, so that is the form needed.</p></div>
<p>So the strings that can be split form a regular language, and a machine can check them with three states: <i>ok</i>, meaning every c so far has been followed by h and the last character is not a c; <i>afterC</i>, meaning the last character read is a c still waiting for its h; and <i>stuck</i>, meaning some c was followed by something else. It starts in <i>ok</i> and accepts in <i>ok</i> only.</p>
<table class="small"><tr><th>state</th><th>on c</th><th>on h</th><th>on any other character</th></tr><tr><td><i>ok</i> (start, accepting)</td><td><i>afterC</i></td><td><i>ok</i></td><td><i>ok</i></td></tr><tr><td><i>afterC</i></td><td><i>stuck</i></td><td><i>ok</i></td><td><i>stuck</i></td></tr><tr><td><i>stuck</i></td><td><i>stuck</i></td><td><i>stuck</i></td><td><i>stuck</i></td></tr></table>
<p>Checking each entry against the meanings of the states, as in Lesson 7, proves that it accepts exactly the strings of Theorem 2. A table with 20 columns would say the same thing; grouping the characters that behave alike into one column is how real machines are written down.</p>
<details class="reveal"><summary>Guess first: the checking machine reads <code>cat</code>. Which state is it in after c, and after ca?</summary><p><i>afterC</i> after the c, because a c is waiting for its h. Then the a arrives instead, so the machine goes to <i>stuck</i> and stays there: <code>cat</code> cannot be split.</p></details>
<h2>One spelling, two readings</h2>
<p>Theorem 2 says when a split exists. It does not say the split is unique, and it is not: the characters <code>aa</code> can be split as the one letter <b>aa</b> or as two letters <b>a</b>, <b>a</b>. The same goes for <code>ii</code>, <code>oo</code>, <code>sh</code> and <code>zh</code>. The widget above shows what that means for <span lang="ciw">Boozhoo</span>: read with the shortest letter that fits, it becomes the seven letters b, o, o, z, h, o, o, each one a genuine letter of the system, and none of them what the word says.</p>
<div class="stmt"><p><span class="kind">Definition.</span> A set of letters, each a string of characters, is a <em>code</em>. It is <em>uniquely decodable</em> if no string of characters has two different splits into its letters. It is <em>prefix-free</em> if no letter is the beginning of a different letter.</p></div>
<details class="reveal"><summary>Guess first: is the code {a, ab} prefix-free? Is the code {a, bc}?</summary><p>{a, ab} is not: the letter a is the beginning of ab. {a, bc} is: neither letter begins the other, even though the letters have different lengths.</p></details>
<div class="stmt"><p><span class="kind">Theorem 3.</span> Every prefix-free code is uniquely decodable.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Suppose some string has two different splits. Compare them letter by letter from the start, and look at the first place where they take different letters, <i>x</i> in one split and <i>y</i> in the other. Up to that point both have used up the same characters, so <i>x</i> and <i>y</i> both begin at the same position and both match the characters there. So the shorter of the two is the beginning of the longer. They are different letters, so they cannot have the same length, and the shorter is the beginning of a different letter: the code is not prefix-free. <span class="qed">∎</span></p></div>
<p>The double vowel letters are not prefix-free, since <b>a</b> begins <b>aa</b> and <b>s</b> begins <b>sh</b>, and the example of <code>aa</code> shows they are not uniquely decodable either. A writing system in this position needs a rule for reading, and this one has it built in: a doubled vowel is one long vowel, and ch, sh and zh are one letter each. In the language of machines, the reader always takes the <em>longest letter that fits</em>. Programming languages use exactly the same rule, called <em>longest match</em>: Python reads <code>x==y</code> as <code>x</code>, <code>==</code>, <code>y</code>, and never as two <code>=</code> signs in a row.</p>
<p>Could the longest-match reader get stuck on a string that does have a split, by taking a long letter when it should have taken a short one? For this code, no. Its choices are made only at a, i, o, s and z, and whichever it chooses, the rest of the string still has every c followed by h, so by Theorem 2 the rest can still be split.</p>
<details class="reveal"><summary>Guess first: for other codes, can greedy reading fail? Take the letters a, ab and bc, and the string abc.</summary><p>Yes. The string splits only as a, bc. A longest-match reader takes ab first and is left with a lone c, which is not a letter. For the double vowel system the argument above shows this cannot happen.</p></details>
<h2>Patterns in the words themselves</h2>
<p>The clock on the home page says the hour with one of eleven words. The Ojibwe People's Dictionary lists each of them whole, each a sentence meaning \"it is one o'clock\", \"it is two o'clock\", and so on to eleven. As a regular expression, the clock's hour words are</p>
<p class="pattern"><code>(ningo|niizho|niso|niiyo|naano|ningodwaaso|niizhwaaso|nishwaaso|zhaangaso|midaaso|ashi-bezhigo)-diba'iganed</code></p>
<p>which describes exactly those eleven strings and nothing else. Any finite list can be written like this, one union of its strings, so:</p>
<div class="stmt"><p><span class="kind">Theorem 4.</span> Every finite language is regular.</p></div>
<p>The expression says precisely what the clock says, and it is a smaller language than the dictionary's: the dictionary also lists <span lang="ciw">niiwo-diba'iganed</span> for four o'clock, which the clock does not use and the expression does not describe. An expression describes the strings you decided it should, no more.</p>`,
        `<details class="reveal"><summary>Predict: six of the seven day words on this site end in <span lang="ciw">-giizhigad</span>. A student writes <code>(anama'e|ishkwaa-anama'e|niizho|niiyo|naano|giziibiigisaginige)-giizhigad</code> for the days of the week. Which day is missing, and what does that show?</summary><p>Wednesday, <span lang="ciw">Aabitoose</span>, which does not end in -giizhigad at all. The expression was built from a pattern the student noticed, and six agreeing cases made it look like a rule. Lesson 3 said it first: checking cases is not proving. Here the facts are the words themselves, as speakers say and write them, and an expression is right only if it agrees with them on every string.</p></details>`,
        `<p>A pattern can also say too much. The expression <code>[a-z'-]+-diba'iganed</code>, any run of letters, apostrophes and hyphens followed by -diba'iganed, matches all eleven hour words. It also matches infinitely many strings that no dictionary lists and no speaker says. Matching a pattern does not make a string a word: a regular expression can check the <em>spelling</em> of a word, as Theorem 2's machine does, but only the people who speak a language decide what its words are. That is why this site uses Ojibwe words only as a dictionary or a speaker gives them, and never builds new ones from a pattern, however regular it looks.</p>
<details class="reveal"><summary>Your turn: which beginnings appear both in the day words and in the hour words? Put the two lists side by side on the <a href="#/ojibwe">Ojibwemowin</a> page.</summary><p><span lang="ciw">niizho-</span> (Tuesday and two o'clock), <span lang="ciw">niiyo-</span> (Thursday and four o'clock) and <span lang="ciw">naano-</span> (Friday and five o'clock). Noticing shared pieces is how the structure of a language begins to show itself, and it is a question to take to a speaker or a language teacher, who can say what the pieces mean and where they can and cannot be used.</p></details>
<h2>The laboratory</h2>
<p>The first program reads with the longest letter that fits, by listing the two-character letters first and taking the first letter in the list that matches. It prints the letters of some words from this site. The second writes the letters as one regular expression and checks Theorem 2 against a direct test of \"every c is followed by h\" on every string of length 1 to 5 made from a, c, h and s.</p>`,
        { play: `LETTERS = ["aa", "ii", "oo", "ch", "sh", "zh",      # the two-character letters first
           "a", "b", "d", "e", "g", "h", "'", "i", "j", "k",
           "m", "n", "o", "p", "s", "t", "w", "y", "z"]
LONG = ["aa", "ii", "oo", "e"]
def split(word):                      # the letters of word, or None if there is no split
    word = word.lower().replace("-", "")    # a hyphen is not a letter
    letters = []
    i = 0
    while i < len(word):
        for L in LETTERS:             # the first letter in the list that fits is the longest
            if word[i:i + len(L)] == L:
                letters.append(L)
                i += len(L)
                break
        else:                         # the loop ended without finding a letter that fits
            return None
    return letters

for w in ["Boozhoo", "Gojitoon", "Gojibizotoon", "Niizho-giizhigad", "cat"]:
    parts = split(w)
    if parts is None:
        print(w, "cannot be split into letters")
    else:
        longs = len([L for L in parts if L in LONG])
        print(w, "->", " ".join(parts), "|", len(parts), "letters, long vowels:", longs)`, predict: true, caption: 'Boozhoo gives  b oo zh oo | 4 letters, long vowels: 2, as in the story. Gojitoon is \u201ctry it\u201d and Gojibizotoon \u201ccheck answer\u201d, as on this site\u2019s buttons: g o j i t oo n and g o j i b i z o t oo n, each with 1 long vowel. Niizho-giizhigad has 11 letters and 2 long vowels, the two ii; the hyphen is skipped. And cat cannot be split into letters, because its c is not followed by h. Move "aa", "ii" and "oo" to the end of LETTERS and Boozhoo falls apart into b o o zh o o: the order of the list is the reading rule.' },
        { skill: 'prefix-free', check: "A code is prefix-free. What follows?", options: ["It has at most 26 letters", "Every string has at most one split into letters: it is uniquely decodable", "Its letters are all the same length"], answer: 1, why: "Theorem 3: if no letter begins another, the first letter of any string is determined, and so on along the string.", wrong: ["Prefix-free says nothing about how many letters a code has. A code of any size can be prefix-free if no letter begins another.", null, "Equal length is one way to be prefix-free, but not the only one: the letters a and bc are different lengths and still no letter begins another."] },
        { play: `import re
LETTER = "aa|ii|oo|ch|sh|zh|[abdeghijkmnopstwyz']"     # the 25 letters as one union

def can_split(s):                     # the pattern LETTER*, matched to the very end
    return re.match("(" + LETTER + ")*$", s) is not None

def every_c_then_h(s):                # Theorem 2's condition, tested directly
    for i in range(len(s)):
        if s[i] == "c" and s[i + 1:i + 2] != "h":
            return False
    return True

tested, disagreements, strings = 0, 0, [""]
for length in range(1, 6):
    strings = [s + ch for s in strings for ch in "achs"]
    for s in strings:
        tested += 1
        if can_split(s) != every_c_then_h(s):
            disagreements += 1
print(tested, "strings tested, disagreements with Theorem 2:", disagreements)
print(re.findall(LETTER, "gojibizotoon"))
print(re.findall(LETTER, "cat"))`, caption: 'This checks Theorem 2 against the pattern LETTER* on every string of length 1 to 5 made from a, c, h and s: 4 + 16 + 64 + 256 + 1024 = 1364 strings, no disagreements. Python tries the alternatives from left to right, so oo is read before o. The last two lines show what findall does: it splits gojibizotoon into letters, and on cat it skips the c without a word.' },

        `<p>1364 agreements are evidence; Theorem 2 is the proof. Look at the last line again: <code>re.findall</code> skips any character that fits no letter, so on \"cat\" it quietly returns <code>['a', 't']</code>. A checker must also notice what it could not read, which is what <code>split</code> does when it returns <code>None</code>.</p>
<h2>Before the exercises</h2>
<p>The first exercise splits words from this site by hand, with the longest-match rule, and counts their letters and long vowels. Watch for <b>e</b>, which is a long vowel written with one character, and for the glottal stop, which is a letter. The second asks which regular expressions describe exactly the strings Theorem 2 is about. Test each candidate on a few short strings, including the empty one, and remember the order of operations.</p>`,
        `<details class="reveal"><summary>Puzzle: the full double vowel system has one more convention. At the end of a word, a long vowel followed by <b>nh</b> is a nasal vowel, and the h is not a sound of its own. Which regular expression describes the endings a reader must treat this way, and does the splitter still need only finitely many states?</summary><p><code>(aa|ii|oo|e)nh</code>, at the very end of the word. A reader cannot know an n and h are the end of the word until the word ends, so the machine must remember the last three letters it has read, or rather only whether they were \"long vowel, n, h\". That is a fixed amount of information, like the keypad lock in Lesson 7, so finitely many states still suffice. Rules that look at a bounded neighbourhood of a letter never need more than a finite machine.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Forgetting the order of operations: <code>ch*</code> is c followed by any number of h's, not any number of ch's, which is <code>(ch)*</code>. Forgetting that star allows zero repetitions, so <code>R*</code> always describes ε. Counting <b>e</b> as a short vowel because it is written with one character; it is long. Leaving out the glottal stop when counting letters. Thinking that a string matching a pattern of real words must itself be a word. Believing an expression is right because it matches the examples you had in mind, instead of asking whether it matches exactly the language.</p>` },
        {
          ex: {
            id: 'ma-13-1', skill: 'prefix-free', kind: 'table', title: 'Split by hand',
            prompt: `<p>Split each word into letters of the double vowel system, reading the longest letter that fits, as in the widget. Give the number of letters and the number of long vowels (aa, ii, oo, e). The first row is done for you. The last row reads Boozhoo the wrong way, with the <em>shortest</em> letter that fits.</p>`,
            head: ['word', 'characters', 'letters', 'long vowels'],
            rows: [
              ['<span lang="ciw">Boozhoo</span>', '7', '4 (b oo zh oo)', '2'],
              ['<span lang="ciw">Miigwech</span>', '8', { a: '6', name: 'letters in Miigwech', why: { '8': 'ii is one letter, a long vowel, and ch is one letter.', '7': 'Both ii and ch are single letters: m, ii, g, w, e, ch.' } }, { a: '2', name: 'long vowels in Miigwech', why: { '1': 'e is a long vowel too, even though it is written with one character: it has no short partner.' } }],
              ['<span lang="ciw">Ojibwemowin</span>', '11', { a: '11', name: 'letters in Ojibwemowin' }, { a: '1', name: 'long vowels in Ojibwemowin', why: { '0': 'e is a long vowel, even though it is written with one character.' } }],
              ['<span lang="ciw">Gikinoo\'amaagoowin</span>', '18', { a: '15', name: 'letters in Gikinoo\'amaagoowin', why: { '14': 'The glottal stop, written \', is a letter.', '18': 'oo, aa and oo are one letter each.' } }, { a: '3', name: 'long vowels in Gikinoo\'amaagoowin' }],
              ['<span lang="ciw">Boozhoo</span>, shortest letter first', '7', { a: '7', name: 'letters, shortest reading', why: { '4': 'That is the longest-match reading. Taking the shortest letter, every character becomes its own letter.' } }, { a: '0', name: 'long vowels, shortest reading', why: { '2': 'Read one character at a time, each o is a short vowel.' } }]
            ],
            hints: ['Go from left to right. At each point, if the next two characters are aa, ii, oo, ch, sh or zh, take both as one letter; otherwise take one character.', 'Miigwech: m ii g w e ch. Gikinoo\'amaagoowin: g i k i n oo \' a m aa g oo w i n.'],
            solution: `<p><span lang="ciw">Miigwech</span>: m, ii, g, w, e, ch, which is 6 letters, with 2 long vowels (ii and e). <span lang="ciw">Ojibwemowin</span>: o, j, i, b, w, e, m, o, w, i, n, which is 11 letters, with 1 long vowel (e). <span lang="ciw">Gikinoo'amaagoowin</span>: g, i, k, i, n, oo, ', a, m, aa, g, oo, w, i, n, which is 15 letters, with 3 long vowels.</p><p>Read with the shortest letter that fits, Boozhoo is b, o, o, z, h, o, o: 7 letters and no long vowels. Every piece is a real letter, which is why a writing system whose code is not prefix-free (Theorem 3) must say which reading it means.</p>`,
            followup: 'In each word, the number of letters is the number of characters minus the number of two-character letters: 8 \u2212 2 = 6 for Miigwech, 18 \u2212 3 = 15 for Gikinoo\'amaagoowin.'
          }
        },
        {
          ex: {
            id: 'ma-13-2', skill: 'regex', kind: 'choice', multi: true, title: 'A pattern for Theorem 2',
            prompt: `<p>Let <code>O</code> stand for any one character of the system other than c, so <code>O</code> is shorthand for <code>a|b|d|e|g|h|i|j|k|m|n|o|p|s|t|w|y|z|'</code>. Which of these regular expressions describe <em>exactly</em> the strings that can be split into letters, the strings of Theorem 2 (including the empty string, which splits into no letters)? Choose all that apply.</p>`,
            options: [
              { text: '(O|ch)*', ok: true },
              { text: 'O*(chO*)*', ok: true },
              { text: '(O|ch*)*', why: 'Star comes before concatenation: ch* means c followed by zero or more h\u2019s, so it matches a lone c, and the whole expression matches \u201cca\u201d.' },
              { text: '(O*ch)*', why: 'Every non-empty string it describes ends in ch, so it misses \u201ca\u201d and \u201cboozhoo\u201d.' },
              { text: '(O|ch)(O|ch)*', why: 'It misses the empty string: the first (O|ch) must match something. Theorem 2 includes ε.' },
              { text: '(O|c)*', why: 'O already includes h, so this matches every string, including \u201cca\u201d, where the c is not followed by h.' }
            ],
            hints: ['Test each expression on three strings: the empty string, \u201ca\u201d and \u201cca\u201d. A correct one describes the first two and not the third.', 'Remember the order of operations: in ch*, the star applies only to the h.'],
            solution: `<p>The first two are correct. <code>(O|ch)*</code> says directly that the string is a sequence of pieces, each a character other than c or the pair ch, which is Theorem 2's condition. <code>O*(chO*)*</code> describes the same strings, grouped differently: some characters that are not c, then blocks each starting with ch. Two different expressions can describe the same language, just as two different machines can accept it.</p><p><code>(O|ch*)*</code> matches a lone c, because ch* is c(h*). <code>(O*ch)*</code> only describes strings ending in ch, and ε. <code>(O|ch)(O|ch)*</code> misses ε. <code>(O|c)*</code> describes every string.</p>`,
            followup: 'Compare (O|ch)* with the three-state machine for Theorem 2: the expression is a description, the machine a checker, and Kleene\u2019s theorem says each can always be turned into the other.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A regular expression describes a language, built from ε and single symbols with union (|), concatenation and star (*). Star binds tightest, then concatenation, then union.</li>
<li>Kleene's theorem: a language has a regular expression exactly when it has a DFA. Every finite language is regular.</li>
<li>The double vowel system writes 25 letters with 20 characters: long vowels aa, ii, oo (doubled) and e (single), short vowels a, i, o, and consonants including ch, sh, zh and the glottal stop.</li>
<li>A string can be split into those letters exactly when every c is followed by h (Theorem 2), and a three-state machine checks it.</li>
<li>A prefix-free code is uniquely decodable (Theorem 3). The double vowel letters are not prefix-free, so the system reads the longest letter that fits, as programming languages do. That is how a reader or a program knows where one letter ends and the next begins.</li>
<li>A pattern can check spelling, but only a language's speakers decide which strings are words; a pattern built from examples can miss a case or accept too much.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: [], standard: 1,
      title: 'The limits of finite memory', summary: 'A game that no finite automaton can win: distinguishable strings, a pigeonhole proof that 0\u207f1\u207f needs unbounded memory, lower bounds on the number of states, and the stack.',
      blocks: [
        `<p>Here is a challenge. Design a finite automaton, in the sense of Lesson 7, that accepts exactly the strings made of some 0s followed by the <em>same number</em> of 1s. So <code>01</code>, <code>0011</code> and <code>000111</code> are in; <code>001</code>, <code>10</code> and <code>0101</code> are out; and the empty string is in, with zero of each. The language is written {0<sup><i>n</i></sup>1<sup><i>n</i></sup> : <i>n</i> ≥ 0}.</p>
<p>Take a minute and try. You will want a state for "one 0 so far", another for "two 0s so far", another for "three", and the list never ends. This lesson turns that feeling into a theorem. The proof is a game between you and an opponent, and the opponent always wins. So here is the question: can any finite automaton, with any number of states, recognise 0<sup><i>n</i></sup>1<sup><i>n</i></sup>?</p>
<h2>The forgetting game</h2>
<p>You build a machine with some number of states, <i>k</i>, and claim it accepts the language. Your opponent does not look inside it. They feed it inputs, and they need only find two different inputs that leave your machine in the same state when a correct machine would have to tell them apart. The key idea is when two inputs "must be told apart".</p>
<div class="stmt"><p><span class="kind">Definition.</span> Let <i>L</i> be a language. Two strings <i>x</i> and <i>y</i> are <em>distinguishable</em> by <i>L</i> if there is some string <i>z</i> such that exactly one of <i>xz</i> and <i>yz</i> is in <i>L</i>. We say <i>z</i> <em>distinguishes</em> them. (Here <i>xz</i> means <i>x</i> followed by <i>z</i>.)</p></div>
<p>For the language above, 00 and 000 are distinguishable: take <i>z</i> = 11. Then 0011 is in the language and 00011 is not. Having read 00 or 000, a correct machine is in a situation where the future can still tell the two apart, so it had better remember which one it saw.</p>
`,
        { skill: 'distinguishable', check: "Strings x and y are distinguishable by L when…", options: ["they have different lengths", "some suffix z puts exactly one of xz, yz in L", "neither is in L"], answer: 1, wrong: ["Length is not the test. Let L be all strings made only of 0s: 0 and 00 differ in length, yet every suffix treats them alike (0z is in L exactly when 00z is).", null, "Whether x and y are themselves in L says nothing. In 0\u207f1\u207f neither 0 nor 00 is in L, and yet the suffixes 1 and 11 tell them apart: it is the futures that must differ."], why: "A DFA for L must then end in different states on x and y, since the same state would give the same verdict on z." },
        `<div class="stmt"><p><span class="kind">Lemma 1.</span> If a DFA <i>M</i> accepts exactly the language <i>L</i>, and <i>x</i> and <i>y</i> are distinguishable by <i>L</i>, then <i>M</i> is in different states after reading <i>x</i> and after reading <i>y</i>.</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> Suppose <i>M</i> were in the same state <i>q</i> after reading <i>x</i> and after reading <i>y</i>. Let <i>z</i> distinguish them. After reading <i>xz</i>, <i>M</i> is in whatever state reading <i>z</i> leads to from <i>q</i>; after reading <i>yz</i>, exactly the same state.</p>
<p class="why">A DFA's next state depends only on its current state and the symbol read (Lesson 7's definition). From the moment both runs are in <i>q</i>, they receive the same symbols, so they take the same steps. The machine has forgotten whether it started with <i>x</i> or <i>y</i>.</p>
<p>So <i>M</i> accepts both <i>xz</i> and <i>yz</i> or rejects both. But exactly one of them is in <i>L</i>, so <i>M</i> gets one of them wrong, contradicting the assumption that <i>M</i> accepts exactly <i>L</i>. <span class="qed">∎</span></p>
<p class="why">A proof by contradiction, the method of Lesson 4: assume the opposite, reach something false.</p></div>
<div class="stmt"><p><span class="kind">Theorem 2 (the fooling-set theorem).</span> If a language <i>L</i> has <i>m</i> strings that are pairwise distinguishable (every two of them are distinguishable), then every DFA accepting <i>L</i> has at least <i>m</i> states. If <i>L</i> has infinitely many pairwise distinguishable strings, no DFA accepts <i>L</i> at all.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> By Lemma 1, a DFA accepting <i>L</i> must end in a different state for each of the <i>m</i> strings, so it has at least <i>m</i> states. (This is the pigeonhole principle of Lesson 2 in disguise: with fewer than <i>m</i> states, two of the <i>m</i> strings would share one.) If there are infinitely many such strings, then for every <i>k</i>, a machine would need more than <i>k</i> states, which no finite machine has. <span class="qed">∎</span></p></div>
`,
        { skill: 'distinguishable', check: "A language has infinitely many pairwise distinguishable strings. What follows?", options: ["It needs a large DFA", "No DFA accepts it", "It is finite"], answer: 1, wrong: ["Large would still be finite. Every number of states you try falls short, because m strings force m states for every m, so no DFA of any size will do.", null, "A finite language always has a DFA, the opposite of this conclusion. 0\u207f1\u207f has infinitely many strings and is far from finite."], why: "The fooling-set theorem: m pairwise distinguishable strings force m states; infinitely many force the impossible." },
        `<h2>No finite automaton for 0<sup><i>n</i></sup>1<sup><i>n</i></sup></h2>
<div class="stmt"><p><span class="kind">Theorem 3.</span> No DFA accepts exactly the language {0<sup><i>n</i></sup>1<sup><i>n</i></sup> : <i>n</i> ≥ 0}.</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> The strings ε, 0, 00, 000, …, that is 0<sup><i>i</i></sup> for every <i>i</i> ≥ 0, are pairwise distinguishable. Take two of them, 0<sup><i>i</i></sup> and 0<sup><i>j</i></sup> with <i>i</i> ≠ <i>j</i>, and let <i>z</i> = 1<sup><i>i</i></sup>. Then 0<sup><i>i</i></sup>1<sup><i>i</i></sup> is in the language, and 0<sup><i>j</i></sup>1<sup><i>i</i></sup> is not, because its numbers of 0s and 1s differ.</p>
<p class="why">This is the opponent's whole strategy: the suffix 1<sup><i>i</i></sup> "asks" the machine how many 0s it saw, and only one answer is right.</p>
<p>There are infinitely many strings 0<sup><i>i</i></sup>, so by Theorem 2 no DFA accepts the language. <span class="qed">∎</span></p>
<p class="why">Notice what the proof did not need: any knowledge of how the machine was designed. It rules out every DFA that anyone could ever build, with any number of states.</p></div>
<p>This is the first time in the course we have proved that a whole <em>class</em> of machines cannot do something. It used nothing but the pigeonhole principle and the meaning of a state as "everything the machine remembers". Lesson 12 makes the same kind of move against a much bigger class of machines.</p>
<details class="reveal"><summary>Your turn: which strings would you use to prove that no DFA accepts the <em>palindromes</em> over {0, 1}, the strings that read the same backwards?</summary><p>Try 0<sup><i>i</i></sup>1 for each <i>i</i> ≥ 0. For <i>i</i> ≠ <i>j</i>, the suffix <i>z</i> = 0<sup><i>i</i></sup> distinguishes them: 0<sup><i>i</i></sup>10<sup><i>i</i></sup> is a palindrome, and 0<sup><i>j</i></sup>10<sup><i>i</i></sup> is not, since its two ends have different numbers of 0s around the single 1. Infinitely many pairwise distinguishable strings, so no DFA. (The 1 in the middle matters: 0<sup><i>i</i></sup> alone would not work, because 0<sup><i>j</i></sup>0<sup><i>i</i></sup> is all 0s, and every string of 0s is a palindrome.)</p></details>
<h2>The same game, played for good</h2>
<p>The fooling-set theorem also gives <em>lower bounds</em>: it proves that a machine cannot be made smaller. Lesson 7 built a three-state machine for "ends in 01". Could two states do?</p>
<div class="stmt"><p><span class="kind">Theorem 4.</span> Every DFA accepting the strings over {0, 1} that end in 01 has at least 3 states. So Lesson 7's machine is as small as possible.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> The three strings ε, 0 and 01 are pairwise distinguishable. ε and 0: take <i>z</i> = 1; then 1 does not end in 01 but 01 does. ε and 01: take <i>z</i> = ε; ε is not in the language, 01 is. 0 and 01: take <i>z</i> = ε again; 0 is not in the language, 01 is. By Theorem 2, at least 3 states are needed. <span class="qed">∎</span></p></div>
<p>A theorem that says "you cannot do better" is as valuable to an engineer as a design that works: it tells you to stop searching. Much of computer science consists of pairs like this, an algorithm and a proof that no algorithm can beat it.</p>
<details class="reveal"><summary>Guess first: how few states can a DFA have if it accepts the strings over {0, 1} that end in 0?</summary><p>Two. The strings ε and 0 are distinguishable (with <i>z</i> = ε, only 0 is in the language), so one state is not enough, by Theorem 2. And two states suffice: remember whether the last symbol was a 0.</p></details>
<h2>Adding memory: a counter, then a stack</h2>
<p>What the finite machine lacked was a number that can grow without limit. Give it one counter, add 1 for each 0 and subtract 1 for each 1, and the language is easy. The same counter checks a single kind of bracket, <code>(</code> and <code>)</code>: add 1 for an opener, subtract 1 for a closer, never let the count go below zero, and finish at zero.</p>
<p>Now allow three kinds of bracket. Is <code>([)]</code> balanced? It has one of each opener and one of each closer, in an order where the count never goes negative, and yet it is wrong: the round bracket was opened first, so it must be closed <em>last</em>. To check this, a machine must remember not just how many brackets are open but which kinds, in which order. The right memory is a <em>stack</em>, a pile where you can add to the top and remove from the top, and nothing else.</p>
<div class="stmt"><p><span class="kind">Stack method for brackets.</span> Read the string from left to right. On an opening bracket, push it onto the stack. On a closing bracket, the stack must be non-empty and its top must be the matching opener; pop it. Otherwise, reject. At the end, accept exactly when the stack is empty.</p></div>
<p>It works because the bracket that must be closed next is always the most recently opened one still open, and that is exactly what the top of a stack holds. The whole of a program's nested structure, brackets inside brackets inside brackets, is checked the same way, which is why every compiler has a stack at its heart.</p>
<details class="reveal"><summary>Predict: can a single counter tell <code>([)]</code> from <code>([])</code>?</summary><p>No. A counter of open brackets goes 1, 2, 1, 0 on both strings. The difference is <em>which</em> bracket is on top when a closer arrives, and a single count cannot record that. (One counter per kind of bracket does not help either: on both strings each counter goes 1, then 0.)</p></details>
`,
        { skill: 'finite-memory', check: "Why does matching several kinds of bracket need a stack rather than a counter?", options: ["Counters are slow", "The next closer must match the most recent opener, which a single count cannot remember", "A stack is smaller"], answer: 1, wrong: ["Speed is not the issue: a counter is very fast. The trouble is what it can hold, one number, which cannot say which kind of bracket is on top.", null, "A stack is the bigger memory: it can grow without limit and keeps the order. What matters is what it can remember, not its size."], why: "A counter can check 0ⁿ1ⁿ but cannot tell ([)] from ([]). The stack remembers which opener is most recent." },
        `<h2>The laboratory</h2>
<p>Both kinds of extra memory, as programs: first a counter for 0<sup><i>n</i></sup>1<sup><i>n</i></sup>. Guess the verdict for each string before you run it.</p>`,
        { play: `def is_0n1n(s):
    count = 0          # the unbounded memory a DFA lacks
    i = 0
    while i < len(s) and s[i] == "0":
        count += 1
        i += 1
    while i < len(s) and s[i] == "1":
        count -= 1
        i += 1
    return i == len(s) and count == 0

for s in ["", "01", "0011", "000111", "001", "10", "0101"]:
    print(repr(s), is_0n1n(s))`, predict: true, caption: 'The first four are True (the empty string too: nothing counted, nothing owed) and the last three are False. 001 ends with a count of 1 still owed. In 10 and 0101 a 0 turns up after a 1, so the loops stop before the end of the string. The variable count is a whole number that can grow as large as the input needs: exactly what a DFA lacks. Add your own strings.' },
        `<p>Now the stack. A Python list used as a stack: <code>append</code> pushes onto the top, <code>pop()</code> removes from the top, and <code>stack[-1]</code> looks at the top without removing it.</p>`,
        { play: `MATCH = {")": "(", "]": "[", "}": "{"}

def balanced(s):
    stack = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)                 # push the opener
        elif ch in ")]}":
            if len(stack) == 0 or stack[-1] != MATCH[ch]:
                return False                 # nothing open, or the wrong kind on top
            stack.pop()                      # this pair is matched
    return len(stack) == 0

for s in ["()", "([{}])", "([)]", "((", ")(", "{[()()]}", "f(x[1]) + {y}"]:
    print(repr(s), balanced(s))`, predict: true, caption: 'True for (), ([{}]), {[()()]} and the last string; False for the others. Trace ([)] by hand: push (, push [, then ) arrives and the top is [, the wrong kind, so reject. For )( the stack is empty when ) arrives; for (( it is not empty at the end. Characters that are not brackets are ignored, which is why the last string passes. Add your own test strings.' },
        `<h2>A ladder of machines</h2>
<p>We now have three rungs. A finite automaton remembers a fixed amount. A machine with a stack remembers an unlimited amount, but can only look at the top; that is exactly enough for brackets, and for checking that a program's source code is grammatical. The third rung is a machine with unlimited memory that it can read and change anywhere. That is Lesson 11, after the checkpoint, and it is where the ladder ends: no one has ever found a more powerful kind of machine, and there are good reasons to think there is none.</p>
<p>Each rung does everything the one below it does, plus something the one below provably cannot. Every "provably cannot" is a cousin of this lesson's argument: find inputs that the weaker machine is forced to confuse.</p>
<h2>Before the exercises</h2>
<p>The first exercise asks you to play the opponent: find distinguishing suffixes, and use the fooling-set theorem to count the fewest states a machine needs. For a lower bound, look for strings that leave "different things to remember", then check every pair. The second exercise asks you to recognise a correct impossibility proof. A correct one names infinitely many strings and, for every two of them, a suffix that puts exactly one of the results in the language.</p>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Thinking the proof of Theorem 3 only rules out small machines: it rules out every finite one. Choosing a suffix <i>z</i> that puts both strings in the language, or neither; it must separate them. Showing only that some pairs are distinguishable when the theorem needs every pair. Concluding that a language needs no DFA just because it is infinite: "ends in 01" is infinite and has a three-state machine. Checking brackets with a counter that is allowed to go below zero: <code>)(</code> ends at zero but is not balanced. Using <code>stack[0]</code>, the bottom, instead of <code>stack[-1]</code>, the top.</p>` },
        {
          ex: {
            id: 'ma-7-1', skill: 'distinguishable', kind: 'answer', title: 'Play the opponent',
            prompt: `<p>Answer each part with a string of 0s and 1s, or a number.</p>`,
            parts: [
              { label: '(a) For the language {0<sup><i>n</i></sup>1<sup><i>n</i></sup>}, give the shortest string <i>z</i> such that 00<i>z</i> is in the language but 000<i>z</i> is not.', answer: '11', exact: true, width: '6rem',
                wrong: [{ match: '111', msg: '000111 is in the language and 00111 is not: that suffix distinguishes them, but the other way round. You want 00z in and 000z out.' }, { match: '1', msg: '001 is not in the language: it has two 0s and one 1.' }] },
              { label: '(b) For the strings that end in 01, the empty string and the string 0 are distinguishable. Give a suffix <i>z</i> of length 1 that distinguishes them.', answer: '1', exact: true, width: '6rem',
                wrong: [{ match: '0', msg: 'ε followed by 0 is 0, and 0 followed by 0 is 00: neither ends in 01, so this z does not separate them.' }, { match: '01', msg: 'That has length 2, and both 01 and 001 end in 01, so it does not distinguish them either.' }] },
              { label: '(c) What is the smallest number of states of a DFA accepting the strings over {0, 1} whose length is a multiple of 3?', answer: '3', width: '6rem',
                wrong: [{ match: '2', msg: 'Try the strings ε, 0 and 00. For any two of them, some suffix makes exactly one of the results have length a multiple of 3. So at least 3 states are needed, by Theorem 2.' }, { match: '4', msg: 'Three states suffice: remember the length mod 3. And ε, 0, 00 are pairwise distinguishable, so three are needed.' }] },
              { label: '(d) The language {ε, 01, 0011, …, 0<sup>9</sup>1<sup>9</sup>} is finite, so some DFA accepts it. What lower bound on its number of states do the strings ε, 0, 00, …, 0<sup>9</sup> prove?', answer: '10', width: '6rem',
                wrong: [{ match: '9', msg: 'Count the strings ε, 0, 00, …, 0⁹: there are ten of them, including the empty string.' }, { match: ['infinite', 'none'], msg: 'This language is finite, so a DFA for it exists. The strings ε, …, 0⁹ are pairwise distinguishable (by the suffixes 1ⁱ), which proves a lower bound of ten states.' }] }
            ],
            hints: ['(a) You need 00z to have equal numbers of 0s and 1s. (b) Look at what εz and 0z end with. (c) Think of the length mod 3.', '(d) Count the strings in the list, including ε. Each pair is distinguished by a run of 1s.', 'Check each suffix by writing out both results in full, for example 00 followed by your z, and 000 followed by your z, and ask which are in the language.'],
            failTip: 'Write out both strings in full before deciding. A suffix works only when exactly one of the two results is in the language; and in (d) count the empty string as one of the strings.',
            solution: `<p>(a) <b>11</b>: 0011 is in the language, 00011 is not. (b) <b>1</b>: the string 1 does not end in 01, but 01 does. (c) <b>3</b>: a machine that tracks the length mod 3 needs three states, and ε, 0 and 00 are pairwise distinguishable (for ε and 0 use <i>z</i> = 00, for ε and 00 use <i>z</i> = 0, for 0 and 00 use <i>z</i> = 0), so no machine can use fewer. (d) <b>10</b>: the ten strings 0<sup><i>i</i></sup> for <i>i</i> = 0, …, 9 are pairwise distinguishable, since 0<sup><i>i</i></sup>1<sup><i>i</i></sup> is in the language and 0<sup><i>j</i></sup>1<sup><i>i</i></sup> is not, so at least ten states are needed.</p><p>Part (d) shows Theorem 3 from a new angle: every bound <i>n</i> you set forces more states, so with no bound there is no finite machine.</p>`,
            followup: 'In part (c), both halves were needed: a machine with 3 states shows 3 is enough, and the fooling set shows fewer is impossible. Together they give the exact answer.'
          }
        },
        {
          ex: {
            id: 'ma-7-2', skill: 'distinguishable', kind: 'choice', title: 'Spot the real proof',
            prompt: `<div class="stmt"><p><span class="kind">Claim.</span> No DFA accepts exactly the strings of round brackets that are balanced, such as <code>(())()</code>.</p></div><p>Which argument is a correct proof?</p>`,
            options: [
              { text: 'The language is infinite, and a DFA has only finitely many states, so no DFA can accept it.', why: 'Infinite languages can have DFAs: "ends in 01" is infinite and has a three-state machine. The number of strings is not the issue; the number of situations the machine must tell apart is.' },
              { text: 'For each i ≥ 0, consider the string of i opening brackets. For i ≠ j, the suffix of i closing brackets distinguishes them: i openers then i closers is balanced, and j openers then i closers is not. That is infinitely many pairwise distinguishable strings, so by the fooling-set theorem no DFA accepts the language.', ok: true },
              { text: 'For each i, consider the string of i opening brackets, and use the suffix of i more opening brackets. Then no result is balanced, so the strings are distinguishable, and no DFA accepts the language.', why: 'A distinguishing suffix must put exactly one of the two results in the language. Adding more openers leaves both results unbalanced, so this suffix distinguishes nothing.' },
              { text: 'A DFA cannot count, and checking brackets requires counting, so no DFA can do it.', why: 'That is the right intuition, but it is not a proof: "cannot count" is exactly what needs to be shown. A DFA can count up to any fixed number, so the argument must show that no fixed number is enough.' }
            ],
            hints: ['A proof by the fooling-set theorem needs infinitely many strings and, for each pair, a suffix that puts exactly one result in the language.', 'Compare the argument with the proof of Theorem 3, with ( in place of 0 and ) in place of 1.'],
            failTip: 'A correct proof must name infinitely many strings and a suffix that separates every pair. An argument that only says "infinite" or "cannot count" is a slogan, not a proof.',
            solution: `<p>The second option is the proof: it is the proof of Theorem 3 with ( for 0 and ) for 1. Every pair of the strings (<sup><i>i</i></sup> is separated by the suffix )<sup><i>i</i></sup>, and there are infinitely many of them, so Theorem 2 applies.</p><p>The first confuses "infinitely many strings" with "infinitely many situations to remember". The third uses a suffix that separates nothing. The fourth states the conclusion as if it were a reason.</p>`,
            followup: 'So brackets need unbounded memory, and a stack provides it. The same argument shows that no DFA can check whether a program\u2019s brackets match, which is why the part of a compiler that reads nested structure is not a finite automaton.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>Strings <i>x</i> and <i>y</i> are distinguishable by <i>L</i> if some suffix <i>z</i> puts exactly one of <i>xz</i>, <i>yz</i> in <i>L</i>; a DFA for <i>L</i> must end in different states on them.</li>
<li>Fooling-set theorem: <i>m</i> pairwise distinguishable strings force at least <i>m</i> states; infinitely many force the impossible.</li>
<li>The answer to the opening question is no: no DFA accepts 0<sup><i>n</i></sup>1<sup><i>n</i></sup>, or balanced brackets, or palindromes, however many states it has. The same theorem proves lower bounds, such as 3 states for "ends in 01".</li>
<li>One unbounded counter handles 0<sup><i>n</i></sup>1<sup><i>n</i></sup>; several kinds of bracket need a stack, because the next closer must match the most recent opener.</li>
<li>Finite automaton, stack machine, unlimited read-write memory: each rung does something the one below provably cannot.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3A-DA-12', '3B-AP-12', '3B-CS-02', '3A-IC-24', '3B-DA-05'],
      title: 'Checkpoint two', checkpoint: true, summary: 'No new ideas: mixed questions on graphs, finite automata, regular expressions and the limits of finite memory, then two exercises. Path or walk? Regular or not? Which machine fits which job?',
      blocks: [
        `<p>This lesson teaches nothing new. It mixes questions on the last four lessons: graphs, finite automata, patterns and the limits of finite memory. Several ideas here look alike and are not: a walk and a path, a language a machine can accept and one it cannot, a code that is prefix-free and one that is only decodable. Answer each question before looking back. If one surprises you, the lesson it came from is linked on the Review page.</p>
<p>Ready? Here is the first: a machine with a fixed amount of memory is asked to check that a string has as many 0s as 1s. What would it need that it does not have?</p>
<h2>Mixed questions</h2>`,
        { check: 'A graph has 7 vertices, and every vertex has degree 3. Is that possible?', skill: 'graphs', options: ['Yes: draw 7 dots and give each three lines', 'No: the degrees would add to 21, but the degrees of a graph add to twice the number of edges, which is even', 'Yes, but only if the graph is a tree'], answer: 1, wrong: ['Try it: each line gives two dots one degree each, so the lines you draw always add an even total. Seven threes would give 21.', null, 'A tree with 7 vertices has 6 edges, so its degrees add to 12, not 21. No graph at all can have 7 vertices that all have degree 3.'], why: 'Handshake theorem: the sum of the degrees is 2|E|, an even number. Seven vertices of degree 3 add to 21, which is odd.' },
        { check: 'In a graph the edges are ab and ac. Is the sequence a, b, a, c a walk? Is it a path?', skill: 'graphs', options: ['A walk of length 3, but not a path', 'A path of length 3', 'Neither, because it crosses the edge ab twice'], answer: 0, wrong: [null, 'A path never repeats a vertex, and this sequence visits a twice. It is a walk, because each consecutive pair is an edge.', 'It does cross the edge ab twice, once each way, but a walk is allowed to repeat edges and vertices. Every consecutive pair is an edge, so this is a walk; it is not a path because of the repeated vertex a.'], why: 'Every consecutive pair is an edge (ab, ba, ac), so it is a walk of length 3. A path is a walk that never repeats a vertex, and a appears twice.' },
        { check: 'Breadth-first search from s gives a vertex w the label 3. What does the label tell you?', skill: 'shortest-paths', options: ['The shortest walk from s to w has length 3', 'w was the third vertex taken off the queue', 'w has three neighbours'], answer: 0, wrong: [null, 'The label counts edges, not the order in which vertices are visited. Many vertices can share the label 3, and the queue order among them is not part of the meaning.', 'The label has nothing to do with how many neighbours w has. Theorem 3 says the label of w is exactly its distance from s.'], why: 'BFS labels each vertex with its distance from the start: the length of a shortest walk. That is what the proof of Theorem 3 shows.' },
        { check: 'A DFA has 4 states and the alphabet {0, 1}. How many entries does its transition table have?', skill: 'dfa', options: ['4', '8', '2'], answer: 1, wrong: ['That is one entry per state. A DFA needs exactly one next state for every state and every symbol, and there are two symbols.', null, 'That is one entry per symbol. The table has a row for each state and a column for each symbol.'], why: 'One next state for each (state, symbol) pair: 4 · 2 = 8 entries. A missing entry would leave the machine with nowhere to go.' },
        { check: 'Which of these languages over {0, 1} can a finite automaton accept?', skill: 'finite-memory', options: ['The strings with as many 0s as 1s', 'The binary numerals of the multiples of 5', 'The strings of the form 0ⁿ1ⁿ'], answer: 1, wrong: ['Equal counts need a count that can grow as large as the input, and a finite machine has finitely many states.', null, '0ⁿ1ⁿ is the language of the limits lesson: no DFA accepts it, because it would need a new state for every n.'], why: 'Multiples of 5 need only the remainder mod 5, five states, just as multiples of 3 need three. A remainder is a bounded fact; a count is not.' },
        { check: 'Which regular expression describes the strings over {0, 1} that start with 1 and end with 0?', skill: 'regex', options: ['1(0|1)*0', '10*', '1*0*'], answer: 0, wrong: [null, 'This is a 1 followed by any number of 0s. It matches 1, which does not end in 0, and misses 110, which should match.', 'This is any number of 1s followed by any number of 0s. It matches the empty string and 0, which do not start with 1, and it misses 1010.'], why: '1 to start, then any mix of 0s and 1s, then a final 0. The shortest match is 10.' },
        { check: 'The code {a, ab, b} has three letters. Which statement is true?', skill: 'prefix-free', options: ['It is prefix-free, because the three letters are all different', 'It is not prefix-free, because a begins ab, and the string ab can be split in two ways', 'It is not prefix-free, but every string still has only one split'], answer: 1, wrong: ['Different is not enough. Prefix-free means no letter is the beginning of a different letter, and a is the beginning of ab.', null, 'The string ab splits as the letter ab, and also as the letters a and b. A code with a string that splits two ways is not uniquely decodable.'], why: 'a is the beginning of ab, so the code is not prefix-free, and ab = ab = a·b has two splits. Prefix-free codes are always uniquely decodable (Theorem 3), but this one is neither.' },
        { check: 'For L = {0ⁿ1ⁿ : n ≥ 0}, which suffix z distinguishes x = 0 from y = 00?', skill: 'distinguishable', options: ['z = 1, because 01 is in L and 001 is not', 'z = 0, because it makes both strings longer', 'z = 0011, because it is the longest string in L'], answer: 0, wrong: [null, 'Neither 00 nor 000 is in L, so z = 0 gives the same answer for both strings. A suffix distinguishes only if exactly one of xz and yz is in L.', 'Neither 0·0011 = 00011 nor 00·0011 = 000011 is in L, so this suffix treats the two strings the same. A suffix helps only when it brings exactly one of the two into L.'], why: 'x z = 01 is in L (one 0, one 1) and y z = 001 is not. Exactly one of the two is in L, so z = 1 distinguishes them.' },
        { check: 'You must check that a text full of ( ) [ ] { } brackets is balanced, nested to any depth. Which machine fits?', skill: 'finite-memory', options: ['A finite automaton with enough states', 'A machine with a stack', 'A regular expression'], answer: 1, wrong: ['Any fixed number of states is beaten by a text nested one level deeper than the machine can count. This is the same problem as 0ⁿ1ⁿ.', null, 'Regular expressions describe exactly the languages that finite automata accept (Kleene), so they have the same limit. Balanced brackets of any depth are not regular.'], why: 'The next closer must match the most recent opener, and the machine must remember an unbounded list of openers, which a stack does and a fixed set of states cannot.' },
        `<p>Two exercises to finish the unit. The first asks which job needs which machine. The second asks for four numbers from four different lessons.</p>`,
        {
          ex: {
            id: 'ma-15-1', kind: 'choice', skill: 'finite-memory', title: 'Which job needs more than a finite automaton?',
            prompt: `<p>A program has four jobs to do on strings over {0, 1}, each by reading the string once from left to right. Which job cannot be done by any finite automaton?</p>`,
            options: [
              { text: 'Say whether the binary numeral is a multiple of 3.', why: 'This is the machine of the finite-automata lesson: three states, one for each remainder.' },
              { text: 'Say whether the string ends in 01.', why: 'A three-state machine does this, and the limits lesson shows that two states are not enough.' },
              { text: 'Say whether the string has the same number of 0s as 1s.', ok: true },
              { text: 'Say whether the string has an even number of 1s.', why: 'Two states do it: even and odd. A parity needs only one bit of memory.' }
            ],
            hints: ['Three of the jobs need only a bounded fact about what has been read: a remainder, the last two symbols, a parity. One needs a count.', 'Ask: could the difference between the number of 0s and the number of 1s grow as large as the input? Then no fixed number of states is enough.'],
            solution: '<p>Equal numbers of 0s and 1s. The strings 0, 00, 000, … are pairwise distinguishable (add enough 1s to the end of one to make it balanced, and the others stay unbalanced), so a DFA would need a state for each, which is infinitely many. The other three jobs need only a remainder, the last two symbols, or a parity, which a finite number of states can hold.</p>',
            followup: 'A machine with one unbounded counter can do the equal-counts job: add 1 for each 0, subtract 1 for each 1, and accept when the count ends at 0. Which kinds of counting does the extra memory buy that a finite machine cannot do?'
          }
        },
        {
          ex: {
            id: 'ma-15-2', kind: 'answer', skill: ['graphs', 'dfa', 'finite-memory'], title: 'Four numbers',
            prompt: `<p>Answer each question with a single number.</p>`,
            parts: [
              { label: '(a) A graph has six vertices with degrees 4, 3, 3, 2, 2, 2. How many edges does it have?', answer: '8', width: '6rem',
                wrong: [{ match: '16', msg: '16 is the sum of the degrees. Each edge adds 1 to the degrees of two vertices, so the sum is twice the number of edges.' }, { match: '6', msg: '6 is the number of vertices. The handshake theorem connects the sum of the degrees with the number of edges.' }] },
              { label: '(b) A tree has 20 vertices. How many edges does it have?', answer: '19', width: '6rem',
                wrong: [{ match: '20', msg: 'Theorem 5: a tree with n vertices has n − 1 edges. With 20 edges the graph would contain a cycle.' }, { match: '21', msg: 'That is more edges than vertices; a tree has one fewer.' }] },
              { label: '(c) What is the smallest number of states a DFA can have if it accepts exactly the strings over {0, 1} that end in 01?', answer: '3', width: '6rem',
                wrong: [{ match: '2', msg: 'Two states cannot do it. The strings ε, 0 and 01 must end in three different states, because suitable suffixes distinguish them in pairs.' }, { match: '4', msg: 'Four states would work, but three already do. The question asks for the smallest number.' }] },
              { label: '(d) A DFA accepts the strings with an even number of 1s. How many of the 16 strings of length 4 over {0, 1} does it accept?', answer: '8', width: '6rem',
                wrong: [{ match: '16', msg: 'That is all the strings of length 4. Those with an odd number of 1s are rejected.' }, { match: '4', msg: 'That is the number of strings with exactly one 1, an odd number. Count the strings with zero, two or four 1s.' }] }
            ],
            hints: ['(a) The degrees add up to twice the number of edges. (b) A tree has one edge fewer than it has vertices. (c) Which strings must end in different states? (d) Count the strings with zero, two or four 1s.', '(a) 16 / 2. (b) 20 − 1. (c) The empty string, 0 and 01 are pairwise distinguishable. (d) 1 + 6 + 1.'],
            solution: '<p>(a) The degrees add to 4 + 3 + 3 + 2 + 2 + 2 = 16, which is twice the number of edges: <b>8</b>. (b) <b>19</b>, by Theorem 5. (c) <b>3</b>: the strings ε, 0 and 01 can be told apart by suffixes, so any machine needs three states, and the machine in the finite-automata lesson uses exactly three. (d) Strings of length 4 with zero 1s: 1; with two 1s: 6; with four 1s: 1; total <b>8</b>, which is half of 16.</p>',
            followup: 'In (d), how many of the 2ⁿ strings of length n have an even number of 1s? Why is the answer always exactly half?'
          }
        },
        `<div class="recap"><h3>Unit two in a few lines</h3><ul>
<li>A graph is dots and lines. A walk may repeat vertices; a path may not. The degrees add up to twice the number of edges, a connected graph has an Euler walk when 0 or 2 vertices have odd degree, and a tree with <i>n</i> vertices has <i>n</i> − 1 edges. Breadth-first search labels every vertex with its distance.</li>
<li>A DFA has exactly one next state for every state and symbol, and its states stand for what it must remember. Swapping accepting and non-accepting states gives the complement.</li>
<li>Regular expressions and DFAs describe the same languages. A prefix-free code can be decoded in only one way; a code that is merely decodable may still need a rule for reading.</li>
<li>A finite machine can remember a remainder or a parity, never a count that grows without limit. Distinguishable strings prove it, and a stack remembers more.</li>
<li>Next: a machine with an unbounded tape, and the first thing that no program can do.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: [], standard: 1,
      title: 'The universal machine', summary: 'A tape, a head and a table of rules: Turing\u2019s 1936 definition of computing, a proof that a machine adds one, the busy beaver, the Church\u2013Turing thesis, and one machine that runs all the others.',
      blocks: [
        `<p>In 1936 the word "computer" meant a person: someone paid to carry out long calculations with pencil and paper, following fixed rules, at an observatory or an insurance office. That year, before any electronic computer existed, Alan Turing asked what such a person could compute in principle, and stripped the answer down to its bones. So what is the simplest machine that can do everything any computer can do, and what would one machine need so that it could do the work of all the others? This lesson defines it exactly, proves that a small one works, meets a machine that is famous for being as busy as possible, and ends with the idea that made the modern computer possible.</p>`,
        { photo: 'friden-calculator', caption: "A Friden mechanical calculator, the kind of desk machine that human computers used until the 1960s. Each column of keys sets one digit; pressing multiply or divide set gears and wheels turning, and the answer appeared in the row of dials at the back." },
        `<h2>Turing machines</h2>
<div class="stmt"><p><span class="kind">Definition.</span> A <em>Turing machine</em> has a <em>tape</em> of cells stretching without end in both directions, each holding one symbol from a finite <em>tape alphabet</em> that includes a <em>blank</em>, written _. A <em>head</em> is positioned over one cell. The machine has a finite set of <em>states</em>, a <em>start state</em>, and a <em>transition function</em> δ which, for some pairs of a state <i>q</i> and a symbol <i>s</i>, gives a triple δ(<i>q</i>, <i>s</i>) = (<i>s</i>′, <i>D</i>, <i>q</i>′): a symbol to write, a direction <i>D</i> (L or R) to move, and a next state.</p>
<p>At the start, the input is written on the tape, every other cell is blank, the head is on the first input symbol, and the machine is in the start state. One <em>step</em>: if the machine is in state <i>q</i> reading <i>s</i> and δ(<i>q</i>, <i>s</i>) = (<i>s</i>′, <i>D</i>, <i>q</i>′), it writes <i>s</i>′ in the cell, moves the head one cell in direction <i>D</i>, and enters state <i>q</i>′. If δ(<i>q</i>, <i>s</i>) is not defined, the machine <em>halts</em>, and the tape holds its output.</p></div>
`,
        { photo: 'turing-machine-davey', caption: "Turing's definition made real: a working model built by Mike Davey, on show at Harvard University in 2012. The paper tape runs between the two reels, past the head in the middle, one cell at a time." },
        `<p>Compare Lesson 7. A finite automaton reads its input once, left to right, and writes nothing. A Turing machine can move both ways, can overwrite the tape, and has as much tape as it likes. That is the unbounded read-write memory that Lesson 9's ladder was missing, and the difference is small to describe and enormous in effect. The figure runs a machine that adds one to a binary number.</p>`,
        { fig: 'tape', machine: 'increment', caption: 'Step through it: the head walks to the right end in state right, then carries leftwards in state add. Try 111, and 0, and the empty tape.' },
        { skill: 'turing-machine', check: "What makes a Turing machine halt?", options: ["Reaching the end of the tape", "Being in a state with no rule for the symbol it reads", "Writing a blank"], answer: 1, wrong: ["The tape has no end: it stretches without limit in both directions, so the head can never fall off it.", null, "Writing a blank is an ordinary step. The incrementer writes a blank back when it turns round at the end of the number, and it carries on."], why: "The transition function is defined only for some (state, symbol) pairs. With no rule, the machine stops." },
        `<p>Its whole program is six rules:</p>
<table class="small"><tr><th>state</th><th>reading</th><th>write</th><th>move</th><th>next state</th><th>meaning</th></tr><tr><td>right</td><td>0</td><td>0</td><td>R</td><td>right</td><td rowspan="2">walk right, changing nothing</td></tr><tr><td>right</td><td>1</td><td>1</td><td>R</td><td>right</td></tr><tr><td>right</td><td>_</td><td>_</td><td>L</td><td>add</td><td>past the last digit: turn back</td></tr><tr><td>add</td><td>1</td><td>0</td><td>L</td><td>add</td><td>1 + 1 = 0, carry 1 to the left</td></tr><tr><td>add</td><td>0</td><td>1</td><td>L</td><td>done</td><td>0 + 1 = 1, no more carry</td></tr><tr><td>add</td><td>_</td><td>1</td><td>L</td><td>done</td><td>carried off the left end: a new digit</td></tr></table>
<p>State <code>done</code> has no rules, so entering it halts the machine. The states are still "what the machine remembers", as in Lesson 7, but now the tape remembers everything else, so the states only need to record which <em>phase</em> of the job the machine is in: walking, carrying, finished. Most Turing machines are designed as a short list of phases like this.</p>
`,
        { skill: 'turing-machine', check: "In a Turing machine, what do the states record, and what does the tape record?", options: ["The states record the input; the tape records the output", "The states record the phase of the work; the tape records what the machine knows", "Both record the same thing"], answer: 1, wrong: ["The input starts on the tape, and the answer is left there too. There are only finitely many states, so they cannot hold an input of any length.", null, "If they did, the tape would add nothing to the finite automaton of Lesson 7. The states are a short list of phases; the tape is the unbounded memory."], why: "Design with phases: the state says what the machine is doing, the tape holds the data." },
        `<h2>Proving the machine right</h2>
<p>Trying a few inputs in the figure is evidence. A proof covers every binary numeral, of any length.</p>
<div class="stmt"><p><span class="kind">Theorem 1.</span> Started on a binary numeral <i>w</i> for the number <i>n</i>, the incrementer halts, and the tape holds a binary numeral for <i>n</i> + 1.</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> <b>Walking phase.</b> In state <code>right</code>, each 0 or 1 is rewritten unchanged and the head moves right, so after |<i>w</i>| steps the head is on the blank just past <i>w</i>. The rule for (right, _) then moves the head back onto the last digit in state <code>add</code>.</p>
<p class="why">|<i>w</i>| means the length of <i>w</i>. The first phase changes nothing on the tape; its job is to find the end, since binary addition starts from the rightmost digit.</p>
<p><b>Carrying phase.</b> Write <i>w</i> as <i>u</i>01<sup><i>k</i></sup> (some digits <i>u</i>, then a 0, then <i>k</i> ones), or as 1<sup><i>k</i></sup> if <i>w</i> has no 0 at all. In state <code>add</code>, each of the last <i>k</i> ones becomes 0 as the head moves left. Then the head reads the 0 (first case) and writes 1, or reads the blank before <i>w</i> (second case) and writes a new 1; either way the machine enters <code>done</code> and halts. The tape now holds <i>u</i>10<sup><i>k</i></sup> in the first case and 10<sup><i>k</i></sup> in the second.</p>
<p class="why">Every binary string ends in some number <i>k</i> ≥ 0 of ones, preceded either by a 0 or by nothing, so the two cases cover every input, including the empty one (<i>k</i> = 0, second case).</p>
<p><b>The arithmetic.</b> The ones 1<sup><i>k</i></sup> are worth 2<sup><i>k</i></sup> − 1, and a digit just to their left is worth 2<sup><i>k</i></sup>. So adding 1 to …01<sup><i>k</i></sup> gives …10<sup><i>k</i></sup>, since (2<sup><i>k</i></sup> − 1) + 1 = 2<sup><i>k</i></sup>: the digits in <i>u</i> are unchanged. In the second case, 1<sup><i>k</i></sup> is 2<sup><i>k</i></sup> − 1, and 10<sup><i>k</i></sup> is 2<sup><i>k</i></sup>, which is one more. <span class="qed">∎</span></p>
<p class="why">This is the carrying rule you learned for decimal addition, with 2 in place of 10: trailing 9s become 0s, and the digit before them goes up by one.</p></div>
<p>The proof also counts the steps: |<i>w</i>| steps walking, one step turning, and <i>k</i> + 1 steps carrying. For 1011 that is 4 + 1 + 3 = 8.</p>
<details class="reveal"><summary>Predict: a machine has just two rules, (go, 0) → (1, R, go) and (go, 1) → (0, R, go). What does it do to the tape 1001? What if the second rule said L instead of R?</summary><p>It flips every bit as it walks right, giving 0110, and halts on the blank after the last digit, because there is no rule for (go, _). (The figure below has one extra rule for the blank, so that it halts in a state called done.) With L in the second rule, on 1001 it reads the 1, writes 0 and steps left onto a blank, where it halts at once, leaving 0001. A machine can also run for ever: the two rules (a, 0) → (0, R, b) and (b, 1) → (1, L, a), started on 01, step right, then left, then right again, visiting the same two cells in the same two states for ever. Nothing in the definition promises that a machine halts.</p></details>`,
        { fig: 'tape', machine: 'flip', caption: 'The bit flipper. Load a few strings and step. It halts in done, the state with no rules.' },
        `<h2>The busiest beaver</h2>
<p>Here is a game that has been played since 1962, when Tibor Radó invented it. Among all Turing machines with a given number of states, using only the symbols _ and 1, started on a completely blank tape, which one writes the most 1s <em>and then halts</em>? The winner is called the <em>busy beaver</em>. For two states the champion writes four 1s in six steps. Watch it.</p>`,
        { fig: 'tape', machine: 'beaver', caption: 'Start with the blank tape and step. The head wanders left and right, and after six steps it enters H, which has no rules, and halts with 1111 on the tape.' },
        `<p>The numbers grow ferociously. Count steps instead of 1s and the champions are just as busy: the longest-running three-state machine that halts takes 21 steps, and the four-state one 107. For five states, the answer was found only in 2024, by an online collaboration of amateurs and professionals who settled the fate of every five-state machine and checked their proof by computer: the champion halts after 47,176,870 steps. For six states, machines are already known that run for more steps than could be written out even with one digit per atom in the observable universe. The true champion is not known, and its exact number of steps may never be.</p>
<p>Why is this so hard? For each machine that has not halted after a long time, you must decide whether it <em>ever</em> will. The next lesson proves that no program can make that decision for every machine, which is why each new busy beaver has taken a leap of human ingenuity.</p>
<h2>Why this is the last rung</h2>
<p>You might expect Lesson 9's ladder to keep going: surely a machine with two tapes, or memory it can jump around in, or Python's lists and dictionaries, can do more? It cannot. Each of those can be simulated by a plain Turing machine, slowly but faithfully, and a Turing machine can be simulated by a Python program (the laboratory below is one). So Python and Turing machines compute exactly the same things.</p>
<div class="stmt"><p><span class="kind">The Church–Turing thesis.</span> Every function that can be computed by following a definite, mechanical procedure can be computed by a Turing machine.</p></div>
<p>It is called a thesis, not a theorem, because "definite, mechanical procedure" is an informal idea, so it cannot be proved. It is supported by ninety years of evidence: every precise definition of computation that anyone has proposed, including the lambda calculus that Alonzo Church used in 1936 to define computing, the ancestor of Lisp, has turned out to compute exactly the same functions as Turing's machines. That is why "what can be computed?" has a single answer, whatever computer you own.</p>
`,
        { skill: 'church-turing', check: "What does the Church–Turing thesis claim?", options: ["Every program halts", "Anything computable by a mechanical procedure is computable by a Turing machine", "Turing machines are faster than computers"], answer: 1, wrong: ["The thesis says what can be computed, not that every computation ends. The two-rule machine in the reveal runs for ever.", null, "The thesis is about which functions can be computed at all, not how fast. A Turing machine is far slower than a real computer."], why: "Every model ever proposed, Python included, computes exactly the same functions. It is a thesis, not a theorem, because \"mechanical procedure\" is informal." },
        `<h2>The universal machine</h2>
<p>Turing's second idea is the one that made computers possible. A machine's rule table is a finite list of symbols, so it can be written down as a string. Then build one machine, <i>U</i>, whose input is two things on its tape: the description of some machine <i>M</i>, and an input <i>x</i> for it. <i>U</i> reads <i>M</i>'s rules from its own tape and carries them out on <i>x</i>, step by step. Turing proved that such a <em>universal machine</em> exists.</p>
<p>That is a computer: fixed hardware, changeable program. The program is the description of <i>M</i>, and it is data like any other. This page is a stack of universal machines: Python running inside an interpreter written in JavaScript, running inside a browser, running on a processor, each layer executing a description of the one above it.</p>
<h2>The laboratory</h2>
<p>Here is a universal machine written in Python. Each machine is described as text, one rule per line in the form <code>state symbol -&gt; write move next</code>. Before you run it, predict the four lines it prints. The function <code>run</code> knows nothing about incrementing or flipping or beavers; it reads a description and obeys it. <code>cells.get(head, "_")</code> reads a cell, giving a blank if nothing was ever written there, so the tape is unbounded in both directions.</p>`,
        { play: `INCREMENT = """
right 0 -> 0 R right
right 1 -> 1 R right
right _ -> _ L add
add 1 -> 0 L add
add 0 -> 1 L done
add _ -> 1 L done
"""

FLIP = """
go 0 -> 1 R go
go 1 -> 0 R go
"""

BEAVER = """
A _ -> 1 R B
A 1 -> 1 L B
B _ -> 1 L A
B 1 -> 1 R H
"""

def parse(description):
    rules = {}
    for line in description.strip().split("\\n"):
        state, symbol, arrow, write, move, new_state = line.split()
        rules[(state, symbol)] = (write, move, new_state)
    return rules

def run(description, tape, start, limit=10000):
    rules = parse(description)
    cells = {}
    for i in range(len(tape)):
        cells[i] = tape[i]
    head, state, steps = 0, start, 0
    while (state, cells.get(head, "_")) in rules and steps < limit:
        write, move, state = rules[(state, cells.get(head, "_"))]
        cells[head] = write
        if move == "R":
            head += 1
        else:
            head -= 1
        steps += 1
    if len(cells) == 0:
        return "", steps
    lo, hi = min(cells), max(cells)
    return "".join(cells.get(i, "_") for i in range(lo, hi + 1)).strip("_"), steps

print(run(INCREMENT, "1011", "right"))
print(run(INCREMENT, "111", "right"))
print(run(FLIP, "1001", "go"))
print(run(BEAVER, "", "A"))`, predict: true, long: true, caption: 'Each line prints (final tape, number of steps): (\'1100\', 8), (\'1000\', 8), (\'0110\', 4) and (\'1111\', 6). The incrementer on 1011 takes 8 steps, as the proof of Theorem 1 predicted, and on 111 it also takes 8 (the carry runs off the left end); the flipper takes one step per digit; the beaver writes four 1s in six steps, as in the figure. Write a machine of your own as a new description and run it: the same run obeys it.' },
        `<p>The <code>limit</code> is there because nothing guarantees a machine halts. Without it, <code>run</code> would loop for ever on a machine that never stops, and, as the next lesson proves, there is no way to write <code>run</code> so that it always knows in advance which machines those are.</p>
<h2>Before the exercises</h2>
<p>The first exercise traces the incrementer by hand, one step at a time, recording the state and the tape after each step, so you can watch the two phases of Theorem 1's proof happen. The second asks you to design a machine by filling in its rule table. Use the phase method: decide what each state means ("walking right, and the number of 1s so far is even"), then, for each state and symbol, ask what the machine must write, which way it must move, and what is true afterwards.</p>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Forgetting that the head moves on <em>every</em> step; there is no "stay", so to stay put, move and come back. Writing rules for the symbols you expect but not for the blank, so the machine halts a step early. Confusing the state, which records the phase, with the tape, which records the data. Expecting every machine to halt. Treating the Church–Turing thesis as a proved theorem. In Python, using a list for the tape and moving the head to position −1, which silently reads the <em>last</em> cell.</p>` },
        {
          ex: {
            id: 'ma-8-1', skill: 'turing-machine', kind: 'table', title: 'Trace the incrementer',
            prompt: `<p>Run the incrementer on the tape 1011. Cells are numbered from 0 at the first digit. After 4 steps the head has walked past the last digit; continue from there. For each step, give the state after the step and the tape after the step. Then give the total number of steps before the machine halts.</p>`,
            head: ['after step', 'state', 'head on cell', 'tape'],
            rows: [
              ['4', 'right', '4', '1011'],
              ['5', { a: 'add', name: 'state after step 5', why: { right: 'Step 5 reads the blank in state right, and the rule for (right, _) enters add.' } }, '3', { a: '1011', exact: true, name: 'tape after step 5', why: { '1012': 'Only 0 and 1 are ever written; the turn-around step writes the blank back unchanged.' } }],
              ['6', { a: 'add', name: 'state after step 6' }, '2', { a: '1010', exact: true, name: 'tape after step 6', why: { '1100': 'Not yet: only one cell changes per step. The last digit, cell 3, becomes 0.' } }],
              ['7', { a: 'add', name: 'state after step 7' }, '1', { a: '1000', exact: true, name: 'tape after step 7' }],
              ['8', { a: 'done', name: 'state after step 8', why: { add: 'Cell 1 holds a 0, and the rule for (add, 0) writes 1 and enters done: the carry stops here.' } }, '0', { a: '1100', exact: true, name: 'tape after step 8' }],
              ['total steps', { a: '8', name: 'total steps', why: { '9': 'Entering done is the last step: done has no rules, so no ninth step happens.', '7': 'Count the turn-around step too: 4 walking, 1 turning, 3 carrying.' } }, '', '']
            ],
            hints: ['Step 5: in state right on a blank, write the blank, move left, enter add. Nothing changes on the tape.', 'Steps 6 and 7 each turn a trailing 1 into 0. Step 8 turns the 0 in cell 1 into 1 and enters done, which halts the machine.'],
            solution: `<p>Step 5: state <b>add</b>, tape 1011 (the turn-around). Step 6: <b>add</b>, 1010. Step 7: <b>add</b>, 1000. Step 8: <b>done</b>, 1100. The machine halts after <b>8</b> steps, since done has no rules.</p><p>In the proof's notation, <i>w</i> = 1011 = <i>u</i>01<sup><i>k</i></sup> with <i>u</i> = 1 and <i>k</i> = 2, so the result is <i>u</i>10<sup><i>k</i></sup> = 1100, and the step count is |<i>w</i>| + 1 + (<i>k</i> + 1) = 4 + 1 + 3 = 8. In numbers: 11 + 1 = 12.</p>`,
            failTip: 'Change one cell per step, and only the cell under the head. Check the head position each time: it starts the carry on the last digit, cell 3, and moves left by one on every step.',
            followup: 'Try 111 in the figure and count: 3 + 1 + 4 = 8 steps again, ending in 1000. The carry runs off the left end and writes a new digit.'
          }
        },
        {
          ex: {
            id: 'ma-8-2', skill: 'turing-machine', kind: 'table', title: 'Design a machine',
            prompt: `<p>Design a machine that adds a <em>parity bit</em> to a binary string: it appends a 1 if the string has an odd number of 1s and a 0 if the number is even, so that every result has an even number of 1s. So 1011 becomes 10111, 11 becomes 110, and the empty string becomes 0. (Parity bits are how computers detect a single flipped bit in a message.)</p>
<p>The machine starts in state <code>even</code> and walks right, remembering whether it has seen an even or odd number of 1s so far, exactly like Lesson 7's automaton. When it reaches the blank, it writes the parity bit and halts by entering <code>done</code>. Fill in what each rule writes and which state it enters. One rule is done for you.</p>`,
            head: ['state', 'reading', 'write', 'move', 'next state'],
            rows: [
              ['even', '0', '0', 'R', 'even'],
              ['even', '1', { a: '1', name: 'even, 1: write', why: { '0': 'The machine only reads the input; it should leave each digit as it is.' } }, 'R', { a: 'odd', name: 'even, 1: next', why: { even: 'A 1 changes the parity: an even count plus one is odd.' } }],
              ['even', '_', { a: '0', name: 'even, _: write', why: { '1': 'The count is even, so the parity bit is 0: the total number of 1s stays even.', '_': 'This is where the answer goes: write the parity bit on the blank.' } }, 'L', { a: 'done', name: 'even, _: next' }],
              ['odd', '0', { a: '0', name: 'odd, 0: write' }, 'R', { a: 'odd', name: 'odd, 0: next', why: { even: 'A 0 does not change the count of 1s.' } }],
              ['odd', '1', { a: '1', name: 'odd, 1: write' }, 'R', { a: 'even', name: 'odd, 1: next' }],
              ['odd', '_', { a: '1', name: 'odd, _: write', why: { '0': 'The count is odd, so appending a 1 makes it even.' } }, 'L', { a: 'done', name: 'odd, _: next' }]
            ],
            hints: ['Reading a digit: write the same digit back. A 0 keeps the state; a 1 switches between even and odd.', 'Reading the blank: in state even write 0, in state odd write 1, then enter done.'],
            solution: `<p>Digits are written back unchanged. (even, 1) → odd and (odd, 1) → even; a 0 keeps the state. On the blank, even writes <b>0</b> and odd writes <b>1</b>, and both enter <b>done</b>.</p><p>By the method of Lesson 7's Theorem 1, after reading any prefix the state records whether it has an even or odd number of 1s. So the bit written on the blank is exactly the one that makes the total even. Trace 1011: even, odd (1), odd (0), even (1), odd (1), then write 1: 10111.</p>`,
            failTip: 'Trace a short input such as 11 by hand, state by state. Digits are always written back unchanged; only the rules for the blank write something new.',
            followup: 'This machine never changes a cell it has read, so it is barely more than a finite automaton. A machine that must go back and change earlier cells, such as the incrementer, really needs the tape.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>The answer to the opening question: a Turing machine, an unbounded tape, a head that reads, writes and moves, finitely many states, and a rule for some (state, symbol) pairs; with no rule, it halts. One universal machine can run the description of any other.</li>
<li>Design with phases: states record what the machine is doing, the tape records what it knows. A proof follows the phases, as for the incrementer.</li>
<li>Nothing guarantees halting. The busy beaver problem shows how hard "does it halt?" can be.</li>
<li>Church–Turing thesis: anything mechanically computable is computable by a Turing machine; every known model, Python included, computes exactly the same things.</li>
<li>A universal machine reads another machine's description and runs it: programs are data. That is what a computer, and an interpreter, is.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: [], standard: 1,
      title: 'What no program can do', summary: 'Counting infinities: why the programs can be listed but the problems cannot, Cantor\u2019s diagonal argument, Turing\u2019s proof that no program decides halting, and why the busy beaver can never be computed.',
      blocks: [
        `<p>Imagine a tool that reads any program and tells you, before you run it, whether it will ever finish or get stuck for ever. Every programmer has wished for it. Can such a tool exist? Lesson 11 suggested that Python, or a Turing machine, can compute anything computable. This lesson shows that the tool is not merely hard to build but impossible, and the proof is one of the most beautiful arguments in mathematics. It comes in two steps. A counting argument shows that <em>some</em> problems have no program at all. Then a specific, natural problem is caught red-handed.</p>
<h2>Counting infinite sets</h2>
<p>How do you compare the sizes of two infinite sets? By Lesson 2's bijection rule: two sets have the same size when their elements can be paired off exactly. The smallest kind of infinity is the one you can count off, first, second, third, and so on.</p>
<div class="stmt"><p><span class="kind">Definition.</span> A set is <em>countable</em> if its elements can be arranged in a list, first, second, third, …, so that every element appears at some finite position. (Finite sets count as countable.)</p></div>
<p>The whole numbers are countable, of course. So are the integers, listed as 0, 1, −1, 2, −2, 3, …: every integer turns up eventually. The trick in every such proof is to find an order in which nothing is postponed for ever.</p>
<details class="reveal"><summary>Guess first: are there more whole numbers than even numbers?</summary><p>No: the two sets have the same size. Pair each whole number <i>n</i> with the even number 2<i>n</i>: 0 with 0, 1 with 2, 2 with 4, and so on. Every whole number gets a partner and every even number is somebody's partner, which is exactly the bijection rule. An infinite set can be as large as a part of itself.</p></details>
<div class="stmt"><p><span class="kind">Theorem 1.</span> For any finite alphabet, the set of all finite strings over it is countable. In particular, the set of all programs is countable.</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> List the strings in order of length, and strings of the same length in alphabetical order: first the empty string, then all strings of length 1, then all strings of length 2, and so on.</p>
<p class="why">Alphabetical order alone would fail: a, aa, aaa, … would never end, and b would never be reached. Sorting by length first makes each group finite.</p>
<p>For each length <i>n</i> there are only finitely many strings (if the alphabet has <i>k</i> symbols, exactly <i>k</i><sup><i>n</i></sup>, by Lesson 2's product rule), so every string of length <i>n</i> appears after finitely many earlier ones. Every program is a finite string of characters, so every program appears somewhere in the list. <span class="qed">∎</span></p>
<p class="why">The list also contains every string that is not a working program, which does no harm: skip them, and the programs are still listed in order.</p></div>
`,
        { skill: 'countability', check: "Why is the set of all programs countable?", options: ["Because there are finitely many", "Because programs are finite strings, which can be listed by length and then alphabetically", "Because they are numbers"], answer: 1, wrong: ["There is no largest program: any program can be made longer. The set is infinite, and countable means only that it can be listed.", null, "Programs are text, and text can be listed by length; no numbering is needed. And being numbers would not help: the real numbers are numbers too, and they cannot be listed."], why: "Every finite string appears at some finite position in that list." },
        `<h2>Cantor's diagonal</h2>
<p>A yes-or-no question about whole numbers, such as "is <i>n</i> prime?", is completely described by its infinite list of answers for <i>n</i> = 0, 1, 2, 3, …. Writing 1 for yes and 0 for no, "is <i>n</i> prime?" is the infinite sequence 0011010100…. Every infinite sequence of 0s and 1s describes some such question. Can all of them be put in a list?</p>
<div class="stmt"><p><span class="kind">Theorem 2 (Cantor, 1891).</span> The set of infinite sequences of 0s and 1s is not countable.</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> Suppose, for contradiction, that some list <i>s</i><sub>0</sub>, <i>s</i><sub>1</sub>, <i>s</i><sub>2</sub>, … contained every sequence. Build a new sequence <i>D</i> whose <i>n</i>th digit is the opposite of the <i>n</i>th digit of <i>s</i><sub><i>n</i></sub>, for every <i>n</i>.</p>
<p class="why">Picture the list as an infinite table, one sequence per row. <i>D</i> is made by walking down the diagonal of the table and flipping every digit. That is where the name comes from.</p>
<p><i>D</i> is an infinite sequence of 0s and 1s, so it must be in the list, say <i>D</i> = <i>s</i><sub><i>m</i></sub>. But the <i>m</i>th digit of <i>D</i> was chosen to be the opposite of the <i>m</i>th digit of <i>s</i><sub><i>m</i></sub>, so <i>D</i> and <i>s</i><sub><i>m</i></sub> differ in position <i>m</i>. That contradiction shows no such list exists. <span class="qed">∎</span></p>
<p class="why">Proof by contradiction (Lesson 4). Notice that it works on <em>any</em> proposed list: whatever list you bring, the diagonal sequence escapes it. Adding <i>D</i> to the list does not help, since the new list has a new diagonal.</p></div>
<p>Here is the construction on the first six rows of some list. The diagonal digits are in bold.</p>
<table class="small"><tr><th>row</th><th>digits 0 to 5</th><th>diagonal digit</th></tr><tr><td><i>s</i><sub>0</sub></td><td><b>1</b>01010…</td><td>1</td></tr><tr><td><i>s</i><sub>1</sub></td><td>1<b>1</b>1111…</td><td>1</td></tr><tr><td><i>s</i><sub>2</sub></td><td>00<b>0</b>000…</td><td>0</td></tr><tr><td><i>s</i><sub>3</sub></td><td>010<b>1</b>01…</td><td>1</td></tr><tr><td><i>s</i><sub>4</sub></td><td>1001<b>0</b>0…</td><td>0</td></tr><tr><td><i>s</i><sub>5</sub></td><td>00110<b>0</b>…</td><td>0</td></tr><tr><td><i>D</i></td><td>001011…</td><td>(each diagonal digit flipped)</td></tr></table>
<details class="reveal"><summary>Guess first: which of the six rows could <i>D</i> be?</summary><p>None. <i>D</i> differs from <i>s</i><sub>0</sub> in position 0, from <i>s</i><sub>1</sub> in position 1, and so on down to <i>s</i><sub>5</sub> in position 5. The same rule works for every row of an infinite list, so <i>D</i> is never in it.</p></details>
<p>Cantor had already shown, in 1874, that the real numbers cannot be listed: the first proof that infinities come in different sizes. It was so shocking that some leading mathematicians of his day refused to accept it. Put Theorems 1 and 2 together and the consequence for computing is immediate.</p>`,
        `<div class="stmt"><p><span class="kind">Corollary 3.</span> There is a yes-or-no question about whole numbers that no program answers correctly for every input.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Each program that always answers yes or no computes one sequence of answers, one question. The programs can be listed (Theorem 1), so the questions they answer can be listed too. The questions cannot all be listed (Theorem 2), so some question is answered by no program. <span class="qed">∎</span></p></div>
<p>In fact almost every question is unanswerable, since there are uncountably many questions and only countably many programs. But the corollary does not name a single one. Turing, in 1936, found a specific and very natural one, by aiming the diagonal argument at programs themselves.</p>
<h2>The halting problem</h2>
<div class="stmt"><p><span class="kind">The halting problem.</span> Given a program <i>P</i> and an input <i>x</i>, does <i>P</i> eventually stop when run on <i>x</i>, or does it run for ever?</p>
<p><span class="kind">Theorem 4 (Turing, 1936, in the form later given by Martin Davis).</span> No program decides the halting problem. That is, there is no program <code>halts(P, x)</code> that always finishes, and returns <code>True</code> exactly when <i>P</i> halts on <i>x</i>.</p></div>
<p>Programs are text, so a program can be given any string as input, including the text of a program, including its own text. That is the only ingredient the proof needs.</p>`,
        { code: `def trouble(P):
    if halts(P, P):      # would P halt, given its own text as input?
        while True:      # then loop for ever
            pass
    else:
        return           # otherwise stop at once`, caption: 'trouble asks halts a question about P, then does the opposite of the prediction.' },
        { skill: 'halting-proof', check: "Suppose <code>halts(P, x)</code> existed. What does <code>trouble(trouble)</code> do?", options: ["Halts", "Runs forever", "Neither can be consistent: it halts exactly when halts says it does not"], answer: 2, wrong: ["If it halted, halts(trouble, trouble) would have returned True, and then trouble would have entered its endless loop. So it cannot halt.", "If it ran for ever, halts(trouble, trouble) would have returned False, and then trouble would have returned at once. So it cannot run for ever either.", null], why: "trouble does the opposite of the prediction about itself. Either answer contradicts halts, so halts cannot exist." },
        `<div class="proof annotated"><p><span class="kind">Proof.</span> Suppose, for contradiction, that a program <code>halts</code> exists that always finishes with the correct answer. Then <code>trouble</code>, above, is also a program. Run <code>trouble</code> on its own text, and ask whether <code>trouble(trouble)</code> halts.</p>
<p class="why"><code>trouble</code> only uses <code>halts</code>, an <code>if</code> and a loop. If <code>halts</code> is a program, so is <code>trouble</code>. And a program's text is a string, so <code>trouble</code> is a legitimate input for itself.</p>
<p>If <code>trouble(trouble)</code> halts, then <code>halts(trouble, trouble)</code> returned <code>True</code>, so <code>trouble</code> entered the endless loop and does not halt. If <code>trouble(trouble)</code> does not halt, then <code>halts(trouble, trouble)</code> returned <code>False</code>, so <code>trouble</code> returned at once and does halt. Both possibilities contradict themselves. So the assumption was false, and no such <code>halts</code> exists. <span class="qed">∎</span></p>
<p class="why">Where is the diagonal? Make a table with programs down the side and inputs, which are also programs, along the top, and in each cell whether that program halts on that input. <code>trouble</code> reads the diagonal cells, where a program meets itself, and does the opposite of each. So <code>trouble</code> differs from every row on the diagonal, and cannot be any row. But it is a program, so it must be a row. That is Cantor's contradiction, one level up.</p></div>
<p>By the Church–Turing thesis of Lesson 11, this rules out much more than a Python function: no computer of any kind, however fast, now or ever, decides halting in general. Not for lack of cleverness, but because any answer it gave could be turned against it.</p>
<details class="reveal"><summary>An objection: "trouble cheats, because it calls halts." Does it?</summary><p>No. The assumption being refuted is precisely that <code>halts</code> is an ordinary program. If it were, any other program could use it, just as any program can call <code>len</code>. Building <code>trouble</code> is not a trick played on <code>halts</code>; it is a consequence of <code>halts</code> being a program at all.</p></details>
<h2>The busy beaver cannot be computed</h2>
<p>Lesson 11's busy beaver was champion of a game: among <i>n</i>-state Turing machines started on a blank tape that eventually halt, which runs for the most steps? Call that number of steps <i>S</i>(<i>n</i>). We know <i>S</i>(2) = 6 and, since 2024, <i>S</i>(5) = 47,176,870. The halting theorem explains why each new value has taken such heroic effort.</p>
<div class="stmt"><p><span class="kind">Theorem 5.</span> No program computes <i>S</i>(<i>n</i>) for every <i>n</i>.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Suppose a program computed <i>S</i>. Then we could decide, for any <i>n</i>-state machine <i>M</i>, whether it halts on a blank tape: compute <i>S</i>(<i>n</i>), run <i>M</i> for <i>S</i>(<i>n</i>) steps, and answer "halts" if it has halted by then and "runs for ever" if not. That answer is always right, because by the definition of <i>S</i> no halting <i>n</i>-state machine runs longer than <i>S</i>(<i>n</i>) steps. But deciding halting on a blank tape is impossible, by an argument like Theorem 4's. So no program computes <i>S</i>. <span class="qed">∎</span></p></div>
<p>So <i>S</i> is a perfectly well-defined function, with a definite value for every <i>n</i>, that no computer can compute. It also grows faster than any function a program can compute, which is why even the known lower bounds for <i>S</i>(6) are too large to write out in digits.</p>
<h2>Undecidable is not the same as unknown</h2>
<p>The halting theorem says there is no <em>general</em> method. It does not say we can never know about a <em>particular</em> program: plenty obviously halt, and plenty obviously loop. And the boundary can sit surprisingly close to home. Here is a four-line program whose halting, for every input, nobody on Earth has been able to prove.</p>`,
        { play: `def collatz_steps(n, limit=10000):
    steps = 0
    while n != 1:
        if n % 2 == 0:
            n = n // 2
        else:
            n = 3 * n + 1
        steps += 1
        if steps == limit:
            return None       # gave up: we do not know
    return steps

record = 0
for n in range(1, 10000):
    s = collatz_steps(n)
    if s > record:
        record = s
        print(n, "takes", s, "steps: a new record")`, predict: 'Will the record be held by the biggest start so far each time, or can a small start such as 27 hold it?', caption: 'A small start can hold it: 27 takes 111 steps, far more than any number below it, and keeps the record until 54 takes 112. The last record below 10000 is 6171, with 261 steps, and no start reaches the limit. The rule is: halve if even, otherwise triple and add one. Every starting number ever tried, up to 2⁷¹ (about 2.4 × 10²¹), reaches 1, but no proof exists that all do. The limit is the only honest way to write the loop: without it, the program would itself be a halting question.' },
        { skill: 'undecidable', check: "\"The halting problem is undecidable\" means…", options: ["Nobody has found the method yet", "No general method exists, though many particular cases are known", "No program's halting can ever be known"], answer: 1, wrong: ["The proof shows there is no method to find, however clever the search: any method would be defeated by trouble.", null, "Many programs plainly halt (a loop of ten passes) or plainly loop (while True). What is impossible is one method that is right about all of them."], why: "The proof shows there is nothing to find. With finitely many configurations, halting is decidable by pigeonhole." },
        `<p>The same wall stands behind many tools you might wish for. A perfect virus scanner would have to decide what any program will <em>do</em>, which includes whether it halts. A compiler that warned about every endless loop, and never gave a false alarm, would decide the halting problem. Real tools are clever approximations: they catch many cases and stay silent, or unsure, on the rest. The theorem says that is the best anyone can do.</p>
<h2>When halting <em>is</em> decidable</h2>
<p>The impossibility needs unbounded memory. For a machine with finite memory, halting can be decided.</p>
<div class="stmt"><p><span class="kind">Theorem 6.</span> Let a machine have finitely many possible configurations (for example, a finite automaton, or a Turing machine restricted to a fixed stretch of tape), with each configuration determining the next. Then whether it halts can be decided.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Suppose there are <i>N</i> configurations. Run the machine for <i>N</i> steps. If it has halted, answer yes. If not, it has passed through <i>N</i> + 1 configurations, counting the first, so by the pigeonhole principle (Lesson 2) one configuration occurred twice. Since each configuration determines the next, everything after the first visit repeats after the second, and so on for ever: the machine is in a loop and never halts. <span class="qed">∎</span></p></div>
<details class="reveal"><summary>Your turn: a machine has 1000 possible configurations and has not halted after 1000 steps. What do you know?</summary><p>It has been in 1001 configurations, counting the first, and there are only 1000 different ones, so one has occurred twice. Each configuration determines the next, so the machine is in a loop and will never halt. Running for <i>N</i> steps is enough to decide.</p></details>
<p>So "undecidable" is a precise claim about a precise class of machines, not a vague despair. A real computer has finite memory, so strictly speaking this theorem applies to it; but the number of configurations of a computer with a gigabyte of memory has billions of digits, so the method is useless in practice, and the unbounded model is the right way to think.</p>
<h2>Before the exercises</h2>
<p>A short trace comes first: it follows the Collatz loop of the laboratory one pass at a time. The next exercise builds a diagonal by hand and checks that it escapes the list. The second asks exactly what the halting theorem does and does not claim. For each statement, ask: does it talk about <em>every</em> program and input, or about particular ones? Does it concern programs with unbounded memory, or finite ones?</p>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Reading "undecidable" as "nobody has found the method yet": the proof shows there is none to find. Concluding that no particular program's halting can ever be known. Thinking the proof depends on Python: it works for any universal model of computation. Objecting that <code>trouble</code> may not call <code>halts</code>. Believing a faster computer would help. Forgetting that the diagonal argument works against <em>every</em> proposed list, so adding the missing sequence to the list does not rescue it. Writing a loop like Collatz without a limit and locking up the page.</p>` },
        {
          ex: {
            id: 'ma-17-3', kind: 'trace', skill: 'undecidable', title: 'Trace a Collatz run',
            prompt: `<p>This is the rule of the laboratory's <code>collatz_steps</code>, for the start 5: halve if even, otherwise triple and add one, and count the passes. Fill in the table: each row is a moment when line 3 starts a pass of the loop (and the last row, after line 9), with the values of <code>n</code> and <code>steps</code> then. The first row is done for you.</p>`,
            code: `n = 5\nsteps = 0\nwhile n != 1:\n    if n % 2 == 0:\n        n = n // 2\n    else:\n        n = 3 * n + 1\n    steps += 1\nprint(steps)`,
            vars: ['n', 'steps'],
            steps: [
              { line: 3, values: { n: '5', steps: '0' }, show: true },
              { line: 3, values: { n: '16', steps: '1' }, why: { n: { '15': '5 is odd, so n becomes 3 · 5 + 1 = 16, not 15.', '2': '5 is odd: the rule triples and adds one, it does not halve.' } } },
              { line: 3, values: { n: '8', steps: '2' } },
              { line: 3, values: { n: '4', steps: '3' } },
              { line: 3, values: { n: '2', steps: '4' } },
              { line: 9, values: { n: '1', steps: '5' }, why: { steps: { '4': 'The last pass, from 2 to 1, counts as a step too: steps is increased in every pass, including the one that ends the loop.' } } }
            ],
            hints: ['A pass changes n (halve if even, else 3n + 1) and then adds 1 to steps. The row at line 3 shows the values at the start of a pass.', 'n goes 5, 16, 8, 4, 2, and then 1 when the loop ends; steps goes 0, 1, 2, 3, 4, 5.'],
            solution: '<p>n: 5, 16, 8, 4, 2, 1. steps: 0, 1, 2, 3, 4, 5. The program prints <code>5</code>. For a start such as 27, the same loop makes 111 steps, and no one has proved that it stops for every start. That is why a program that runs this loop needs a limit.</p>',
            followup: 'Trace the start 6 by hand: how many steps does it take to reach 1? Is it more or fewer than for 5?'
          }
        },
        {
          ex: {
            id: 'ma-9-1', skill: 'countability', kind: 'table', title: 'Build a diagonal',
            prompt: `<p>Here are the first five digits of the first five sequences in some list:</p>
<pre class="code"><code>s0 = 1 1 0 1 0 …
s1 = 0 0 1 1 1 …
s2 = 1 0 1 0 0 …
s3 = 0 1 1 0 1 …
s4 = 1 1 1 1 1 …</code></pre>
<p>Fill in the diagonal digits and the first five digits of the diagonal sequence <i>D</i> (the <i>n</i>th digit of <i>D</i> is the opposite of the <i>n</i>th digit of <i>s</i><sub><i>n</i></sub>, counting positions from 0). Then give the position at which the construction <em>guarantees</em> that <i>D</i> differs from <i>s</i><sub>3</sub>.</p>`,
            head: ['position n', 'digit n of s<sub>n</sub>', 'digit n of D'],
            rows: [
              ['0', '1', { a: '0', name: 'digit 0 of D', why: { '1': 'D flips the diagonal digit: s0 has 1 in position 0, so D has 0.' } }],
              ['1', '0', { a: '1', name: 'digit 1 of D' }],
              ['2', { a: '1', name: 'digit 2 of s2', why: { '0': 'Count from 0: s2 = 1 0 1 0 0, so its digit in position 2 is 1.' } }, { a: '0', name: 'digit 2 of D' }],
              ['3', { a: '0', name: 'digit 3 of s3' }, { a: '1', name: 'digit 3 of D' }],
              ['4', { a: '1', name: 'digit 4 of s4' }, { a: '0', name: 'digit 4 of D' }],
              ['guaranteed difference from s<sub>3</sub> at position', { a: '3', name: 'guaranteed position', why: { '0': 's3 starts with 0 and so does D. The construction guarantees a difference at position 3, where s3 has 0 and D has 1.', '2': 'They do differ at position 2, but by accident. The construction guarantees a difference at position 3, the diagonal position of row 3, for every possible s3.' } }, '']
            ],
            hints: ['The diagonal digits are s0[0], s1[1], s2[2], s3[3], s4[4]: counting positions from 0.', 'The diagonal is 1, 0, 1, 0, 1, so D starts 0, 1, 0, 1, 0. D differs from s_n in position n, by construction.'],
            solution: `<p>The diagonal digits are 1, 0, 1, 0, 1, so <i>D</i> begins <b>01010</b>. <i>D</i> differs from each <i>s</i><sub><i>n</i></sub> in position <i>n</i>; in particular from <i>s</i><sub>3</sub> in position <b>3</b>, where <i>s</i><sub>3</sub> has 0 and <i>D</i> has 1. (They may differ elsewhere too; position <i>n</i> is the one the construction guarantees.)</p><p>Continue the list for ever and the same rule defines every digit of <i>D</i>, so <i>D</i> is missing from the whole infinite list.</p>`,
            failTip: 'Count positions from 0, and read the diagonal: row 0 position 0, row 1 position 1, and so on. Then flip each of those digits; do not copy a whole row.',
            followup: 'If the list had only these five rows and every sequence had only five digits, D = 01010 would be missing from this list, but a finite list of all 32 five-digit strings could still exist. The contradiction needs infinitely many positions: that is where "infinite" does the work.'
          }
        },
        {
          ex: {
            id: 'ma-9-2', skill: 'undecidable', kind: 'choice', multi: true, title: 'What the theorem says',
            prompt: `<p>Which of these statements are correct? Choose all that apply.</p>`,
            options: [
              { text: 'There is no program that correctly decides, for every program and every input, whether that program halts on that input.', ok: true },
              { text: 'Nobody can ever know whether any particular program halts.', why: 'The theorem rules out a general method, not knowledge of particular cases. Many programs obviously halt, and many obviously loop.' },
              { text: 'With much faster computers, the halting problem could be solved.', why: 'Speed is irrelevant: the proof shows that any halts program would give a wrong answer on trouble(trouble), however fast it ran.' },
              { text: 'For a machine with only finitely many possible configurations, whether it halts can be decided.', ok: true },
              { text: 'The diagonal argument works only for Python programs.', why: 'It works for any model in which programs are finite strings that can be given as input to programs, which by the Church\u2013Turing thesis means every model of computation.' },
              { text: 'Some yes-or-no questions about whole numbers have no program that answers them, because there are more questions than programs.', ok: true }
            ],
            hints: ['Two kinds of claim are being mixed: "there is no single method for every case" and "no case can be known". Only one follows.', 'Look back at Theorem 6 and Corollary 3.'],
            solution: `<p>The first, fourth and sixth are correct. The first is Theorem 4. The fourth is Theorem 6: finitely many configurations means a repeated configuration can be detected. The sixth is Corollary 3, from Theorems 1 and 2.</p><p>The second confuses "no general method" with "no knowledge". The third misses the point of the proof, which does not depend on time. The fifth is too narrow: the argument applies to every universal model of computation.</p>`,
            failTip: 'For each statement, ask whether it is about every program at once or about particular programs, and whether it is proved or only believed. A statement that fails either test is false.',
            followup: 'The first statement is about every program at once; the second is about each program separately. Keeping "for all" and "there exists" in the right order was the lesson of Lesson 1, and here it is the difference between a theorem and a falsehood.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A set is countable if it can be listed. Finite strings, and so programs, are countable: list them by length, then alphabetically.</li>
<li>Cantor's diagonal: infinite 0/1 sequences cannot be listed, because flipping the diagonal of any list gives a sequence the list misses. So some yes-or-no questions have no program.</li>
<li>The answer to the opening question is no. Turing: no program decides halting. <code>trouble</code> does the opposite of whatever <code>halts</code> predicts about it running on itself.</li>
<li>The busy beaver function is well defined but not computable: computing it would decide halting.</li>
<li>Undecidable means no general method, not that no case is known; with finitely many configurations, halting is decidable by pigeonhole.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-11'], standard: 1,
      title: 'Counting steps', summary: 'Comparing algorithms without a stopwatch: counting steps as the input grows, big-O defined and proved, why constants do not matter and exponents do, and what doubling the input does.',
      blocks: [
        `<p>An old legend tells of the inventor of chess, who asked his king for a modest reward: one grain of rice on the first square of the board, two on the second, four on the third, doubling on every square. The king laughed and agreed. The total on 64 squares is 2<sup>64</sup> − 1, about 18 billion billion grains, which at a few hundredths of a gram a grain is several hundred years of the whole world's rice harvest. The king had not been cheated by arithmetic. He had misjudged how fast doubling grows. So how do we measure how fast the work of a program grows, and which growth can a computer survive?</p>`,
        { photo: 'chessboard-rice', caption: "The legend on a real board: piles of rice that grow from square to square along the first row. For the first few squares doubling looks harmless. Square 64 alone would need 2<sup>63</sup> grains." },
        `<p>Two programs both solve a problem. Which is better? Timing them tells you about one input on one computer on one afternoon. The mathematical answer is to count <em>steps</em>: how many basic operations the program performs, as a function of the size <i>n</i> of its input. Not the exact count, which depends on details nobody cares about, but how the count <em>grows</em> as <i>n</i> grows.</p>
<h2>A gallery of growth</h2>
<p>These growth rates turn up again and again. A million steps take a computer a fraction of a second; a trillion (10<sup>12</sup>) take minutes to hours; 10<sup>18</sup> take years.</p>
<div class="tbl-wrap"><table class="small">
<tr><th><i>n</i></th><th>log<sub>2</sub> <i>n</i></th><th><i>n</i></th><th><i>n</i> log<sub>2</sub> <i>n</i></th><th><i>n</i>²</th><th>2<sup><i>n</i></sup></th></tr>
<tr><td>10</td><td>3.3</td><td>10</td><td>33</td><td>100</td><td>1,024</td></tr>
<tr><td>100</td><td>6.6</td><td>100</td><td>664</td><td>10,000</td><td>about 1.3 × 10<sup>30</sup></td></tr>
<tr><td>1,000</td><td>10</td><td>1,000</td><td>9,966</td><td>1,000,000</td><td>about 10<sup>301</sup></td></tr>
<tr><td>1,000,000</td><td>20</td><td>1,000,000</td><td>2 × 10<sup>7</sup></td><td>10<sup>12</sup></td><td>a number with 301,030 digits</td></tr>
</table></div>
<p>Read down the last column. 2<sup><i>n</i></sup> is not a little bigger than <i>n</i>²; it lives in a different universe. At <i>n</i> = 100 it already exceeds the number of nanoseconds since the Big Bang. Meanwhile the first column barely moves: a million items, and log<sub>2</sub> <i>n</i> is only 20.</p>
<details class="reveal"><summary>Guess first: a computer does a billion steps a second. How long would 2<sup>100</sup> steps take?</summary><p>About 1.3 × 10<sup>21</sup> seconds, which is roughly forty trillion years: thousands of times the age of the universe, about 13.8 billion years. A problem with just 100 items and 2<sup><i>n</i></sup> steps is out of reach for ever.</p></details>
<h2>Four algorithms, four growth rates</h2>
<p><b>Linear search</b> looks at each item until it finds the target: up to <i>n</i> steps. <b>Binary search</b> on a sorted list looks at the middle item and throws away the half that cannot contain the target, so it needs about log<sub>2</sub> <i>n</i> steps, the number of times <i>n</i> can be halved before reaching 1. <b>Checking every pair</b> of items with two nested loops takes about <i>n</i>²/2 steps. <b>Trying every subset</b> takes 2<sup><i>n</i></sup> steps, by Lesson 2's Theorem 3.</p>
<div class="stmt"><p><span class="kind">Theorem 1.</span> For every whole number <i>n</i> ≥ 1, the number of times <i>n</i> can be replaced by <i>n</i> div 2 before it reaches 1 is the whole number <i>k</i> with 2<sup><i>k</i></sup> ≤ <i>n</i> &lt; 2<sup><i>k</i>+1</sup>, that is, ⌊log<sub>2</sub> <i>n</i>⌋.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> By induction on <i>k</i>. If <i>k</i> = 0 then <i>n</i> = 1 and no halving is needed. If 2<sup><i>k</i></sup> ≤ <i>n</i> &lt; 2<sup><i>k</i>+1</sup> with <i>k</i> ≥ 1, then <i>n</i> div 2 satisfies 2<sup><i>k</i>−1</sup> ≤ <i>n</i> div 2 &lt; 2<sup><i>k</i></sup>, so after one halving the same statement holds with <i>k</i> − 1 in place of <i>k</i>, and by the induction hypothesis <i>k</i> − 1 more halvings are needed: <i>k</i> in all. <span class="qed">∎</span></p></div>
<p>So a sorted list of a billion items can be searched in about 30 comparisons, and one of a quintillion (10<sup>18</sup>) items in about 60. That is the whole reason sorting is worth the trouble.</p>
<details class="reveal"><summary>Guess first: how many comparisons does binary search need, at most, on a sorted list of a million items?</summary><p>About 20. The number log<sub>2</sub> 1,000,000 is about 19.9, so a million items can be halved 19 times, and one last look at the item that is left makes 20. A linear search could need all 1,000,000.</p></details>
<h2>Big-O</h2>
<p>Computer scientists write "the running time is O(<i>n</i>²)", read "big-O of <i>n</i> squared". Here is exactly what it means.</p>
<div class="stmt"><p><span class="kind">Definition.</span> For functions <i>f</i> and <i>g</i> from whole numbers to non-negative numbers, <i>f</i>(<i>n</i>) = O(<i>g</i>(<i>n</i>)) means: there are constants <i>c</i> &gt; 0 and <i>n</i><sub>0</sub> such that <i>f</i>(<i>n</i>) ≤ <i>c</i> · <i>g</i>(<i>n</i>) for every <i>n</i> ≥ <i>n</i><sub>0</sub>.</p></div>
<p>In words: from some point on, <i>f</i> is at most a constant multiple of <i>g</i>. Two things are deliberately ignored: small inputs, below <i>n</i><sub>0</sub>, and constant factors, absorbed into <i>c</i>. To prove a big-O claim, you exhibit the constants.</p>
<div class="stmt"><p><span class="kind">Theorem 2.</span> 3<i>n</i>² + 5<i>n</i> + 2 = O(<i>n</i>²).</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> Take <i>c</i> = 10 and <i>n</i><sub>0</sub> = 1. For <i>n</i> ≥ 1 we have <i>n</i> ≤ <i>n</i>² and 1 ≤ <i>n</i>², so 3<i>n</i>² + 5<i>n</i> + 2 ≤ 3<i>n</i>² + 5<i>n</i>² + 2<i>n</i>² = 10<i>n</i>². <span class="qed">∎</span></p>
<p class="why">The idea works for every polynomial: bound each lower term by the highest power, and add up the coefficients to get <i>c</i>. So a polynomial of degree <i>k</i> is O(<i>n</i><sup><i>k</i></sup>): only the highest power matters.</p></div>
`,
        { skill: 'big-o', check: "f(n) = 3n² + 5n + 2. Which is true?", options: ["f(n) = O(n)", "f(n) = O(n²)", "f(n) = O(log n)"], answer: 1, wrong: ["The n² term eventually beats any constant times n (Theorem 3), so O(n) is too small a bound.", null, "Even the 5n term alone outgrows any constant times log n. Logarithms grow far more slowly than that."], why: "For n ≥ 1, 3n² + 5n + 2 ≤ 10n². Constants and lower terms do not matter; the highest power does." },
        `<div class="stmt"><p><span class="kind">Theorem 3.</span> <i>n</i>² is not O(<i>n</i>).</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Suppose, for contradiction, that <i>n</i>² ≤ <i>c</i> · <i>n</i> for every <i>n</i> ≥ <i>n</i><sub>0</sub>. Dividing by <i>n</i>, that says <i>n</i> ≤ <i>c</i> for every <i>n</i> ≥ <i>n</i><sub>0</sub>, which is false for any <i>n</i> larger than both <i>c</i> and <i>n</i><sub>0</sub>. <span class="qed">∎</span></p></div>
<p>Together these say that constants cannot rescue a worse growth rate. A program doing 100<i>n</i> steps and one doing 3<i>n</i> steps are both O(<i>n</i>); the second is faster, but neither is in the same league as one doing <i>n</i>² steps. Past <i>n</i> = 100, the 100<i>n</i> program beats the <i>n</i>² program, and the gap only widens. The base of a logarithm does not matter either, since log<sub><i>a</i></sub> <i>n</i> = log<sub><i>b</i></sub> <i>n</i> / log<sub><i>b</i></sub> <i>a</i> is a constant multiple of log<sub><i>b</i></sub> <i>n</i>; that is why we just write O(log <i>n</i>).</p>
<h2>Counting loops</h2>
<p>The working rule: find the innermost line and count how many times it runs. One loop over the input is O(<i>n</i>). A loop that halves something is O(log <i>n</i>), by Theorem 1. For two nested loops over all pairs <i>i</i> &lt; <i>j</i>, count exactly: the inner loop runs <i>n</i> − 1 times, then <i>n</i> − 2, …, then 0, which is (<i>n</i> − 1)<i>n</i>/2 in total by Lesson 3's Theorem 2. That is O(<i>n</i>²). Watch out for hidden loops: in Python, <code>x in some_list</code> checks the items one by one, so it is itself O(<i>n</i>).</p>
<details class="reveal"><summary>Predict: how many steps does each of these take, as a function of <i>n</i>? (a) A loop over <i>n</i> items with an inner loop of exactly 10 passes. (b) A loop over <i>n</i> items, each pass checking <code>x in other</code> where <code>other</code> is a list of <i>n</i> items.</summary><p>(a) 10<i>n</i>, which is O(<i>n</i>): a loop of fixed length is a constant, however it looks. (b) Up to <i>n</i> · <i>n</i> = <i>n</i>², O(<i>n</i>²): the <code>in</code> is a hidden loop. This is the most common way to write an accidental O(<i>n</i>²) program, and the laboratory below shows the cure.</p></details>
<h2>Doubling</h2>
<p>A good way to feel a growth rate is to ask what happens when the input doubles. O(log <i>n</i>): one more step. O(<i>n</i>): twice as long. O(<i>n</i>²): four times as long. O(2<sup><i>n</i></sup>): the time is <em>squared</em>, since 2<sup>2<i>n</i></sup> = (2<sup><i>n</i></sup>)². So exponential algorithms are fine for <i>n</i> = 20 and hopeless for <i>n</i> = 60, and no computer that will ever be built changes that verdict. A computer a million times faster buys only about twenty more items, because 2<sup>20</sup> is about a million.</p>
`,
        { skill: 'big-o', check: "An O(n²) algorithm takes 2 seconds on an input. On an input twice as large, about how long?", options: ["4 seconds", "8 seconds", "2 seconds"], answer: 1, wrong: ["That is what doubling does to an O(n) algorithm. For n² the steps are multiplied by 2² = 4, so the time goes from 2 seconds to 8.", null, "The time does not stand still: more input means more steps. Only an O(1) algorithm would take 2 seconds again."], why: "Doubling n quadruples n². O(n) would double, O(log n) would add one step." },
        `<p>Lesson 4 has already met this. Trial division tests whether <i>n</i> is prime in about √<i>n</i> steps, which sounds fast. But the size of the input is the number of digits <i>d</i> of <i>n</i>, and √<i>n</i> is about 10<sup><i>d</i>/2</sup>: exponential in the size of the input. That fact turns out to be worth a great deal of money, as Lesson 20 shows.</p>
<h2>The laboratory</h2>
<p>The same question answered two ways: does some pair of numbers in a list add up to a target? The slow version checks every pair. The fast version walks the list once, keeping a <em>set</em> of the numbers seen so far; a set is built (as a <em>hash table</em>) so that "is this in here?" takes one step on average, however large it is. Both count their steps.</p>`,
        { play: `def pair_sum_slow(nums, target):
    steps = 0
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            steps += 1
            if nums[i] + nums[j] == target:
                return True, steps
    return False, steps

def pair_sum_fast(nums, target):
    steps = 0
    seen = set()
    for x in nums:
        steps += 1
        if target - x in seen:       # one step for a set
            return True, steps
        seen.add(x)
    return False, steps

nums = list(range(0, 3000, 3))       # 1000 multiples of 3
print("slow:", pair_sum_slow(nums, 5))
print("fast:", pair_sum_fast(nums, 5))`, predict: true, caption: 'Both say False (5 is not a multiple of 3). The slow one took 499,500 steps, which is 1000 × 999 / 2 exactly; the fast one took 1000. Now double the length of the list (range(0, 6000, 3)) and predict both counts before running: the slow count becomes 1,999,000, about four times as many, and the fast one 2000, twice as many.' },
                { skill: 'big-o', check: "A loop over n items checks <code>x in other</code> each time, where other is a list of n items. How many steps?", options: ["O(n)", "O(n²): in on a list is a hidden loop", "O(log n)"], answer: 1, wrong: ["That counts only the visible loop. The check x in other walks along a list of n items, so each of the n passes can cost n steps.", null, "Nothing is being halved here: both the loop and the hidden search move through items one by one."], why: "Count hidden loops. With other as a set, the check is O(1) and the whole thing O(n)." },
        `<p>Choosing the right data structure is usually where a factor of <i>n</i> is won or lost. Better hardware makes a program a constant factor faster; a better algorithm can make it a factor of <i>n</i> faster, and that grows without limit.</p>
<h2>Before the exercises</h2>
<p>The first exercise asks for step counts and the consequences of growth rates: use Theorem 1 for halvings, Lesson 3's sum for nested loops, the definition for <i>n</i><sub>0</sub>, and the doubling rules for the rest. The second asks you to classify pieces of code by growth rate. For each one, find the innermost line, and count how many times it runs, including any hidden loops.</p>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Timing one small input and extrapolating: ask how the count <em>changes</em> as <i>n</i> grows. Thinking O(<i>n</i>) means exactly <i>n</i> steps; it means at most a constant times <i>n</i>, from some point on. Counting a loop of fixed length as a factor of <i>n</i>. Missing a hidden loop, such as <code>in</code> on a list. Assuming a faster computer fixes an exponential algorithm. Measuring the size of a number by its value instead of its number of digits.</p>` },

        {
          ex: {
            id: 'ma-10-1', skill: 'big-o', kind: 'answer', title: 'Counting and consequences',
            prompt: `<p>Answer each with a whole number.</p>`,
            parts: [
              { label: '(a) How many times can 1000 be halved (with integer division) before it reaches 1?', answer: '9', width: '6rem',
                wrong: [{ match: '10', msg: '2¹⁰ = 1024 is more than 1000. By Theorem 1 the answer is the k with 2ᵏ ≤ 1000 < 2ᵏ⁺¹.' }, { match: '500', msg: 'That is 1000 halved once. Count how many halvings it takes to reach 1: 1000, 500, 250, 125, 62, 31, 15, 7, 3, 1.' }] },
              { label: '(b) Two nested loops visit every pair of positions <i>i</i> &lt; <i>j</i> in a list of 100 items. How many times does the inner body run?', answer: '4950', width: '6rem',
                wrong: [{ match: '10000', msg: 'That counts every ordered pair, including i = j. Pairs with i < j number 100 × 99 / 2.' }, { match: '9900', msg: 'That counts each pair twice, as (i, j) and (j, i). Halve it.' }, { match: '5050', msg: 'That is 1 + 2 + … + 100. The inner loop runs 99, 98, …, 0 times: 0 + 1 + … + 99.' }] },
              { label: '(c) For <i>f</i>(<i>n</i>) = 100<i>n</i> and <i>g</i>(<i>n</i>) = <i>n</i>², what is the smallest <i>n</i><sub>0</sub> such that <i>f</i>(<i>n</i>) ≤ <i>g</i>(<i>n</i>) for every <i>n</i> ≥ <i>n</i><sub>0</sub>?', answer: '100', width: '6rem',
                wrong: [{ match: '101', msg: 'At n = 100 the two are equal, 10,000 each, and ≤ allows equality.' }, { match: '10', msg: 'At n = 10, 100n is 1000 but n² is only 100. Solve 100n ≤ n², that is, 100 ≤ n.' }] },
              { label: '(d) An algorithm takes 2<sup><i>n</i></sup> steps and can handle <i>n</i> = 40 in an hour. On a computer 1000 times faster, what is the largest <i>n</i> it can handle in an hour?', answer: '49', width: '6rem',
                wrong: [{ match: '40000', msg: 'That would be true for an O(n) algorithm. Each extra item doubles the time: 1000 times faster buys log₂ 1000 ≈ 9.97 more items.' }, { match: '50', msg: '2¹⁰ = 1024 is more than 1000, so n = 50 would need a computer 1024 times faster. 2⁹ = 512 fits.' }] },
              { label: '(e) An O(<i>n</i>²) program takes 3 seconds on 10,000 items. About how many seconds will it take on 20,000 items?', answer: '12', width: '6rem',
                wrong: [{ match: '6', msg: 'That is what an O(n) program would do. Doubling n multiplies n² by 4.' }, { match: '9', msg: 'Doubling n multiplies n² by 2² = 4, not by 3.' }] }
            ],
            hints: ['(a) List the halvings: 1000, 500, 250, … (b) 0 + 1 + … + 99 = 99 × 100 / 2.', '(c) 100n ≤ n² exactly when n ≥ 100. (d) Find the largest k with 2ᵏ ≤ 1000. (e) Doubling n multiplies n² by 4.'],
            solution: `<p>(a) 1000, 500, 250, 125, 62, 31, 15, 7, 3, 1: <b>9</b> halvings, and indeed 2⁹ = 512 ≤ 1000 &lt; 1024 = 2¹⁰. (b) 99 + 98 + … + 0 = 99 × 100 / 2 = <b>4950</b>. (c) 100<i>n</i> ≤ <i>n</i>² exactly when 100 ≤ <i>n</i>, so <b>100</b>. (d) A computer 1000 times faster can do 2⁴⁰ × 1000 steps in the hour; 2<sup>40 + <i>k</i></sup> fits when 2<sup><i>k</i></sup> ≤ 1000, so <i>k</i> = 9 and <i>n</i> = <b>49</b>. (e) (2<i>n</i>)² = 4<i>n</i>², so about 3 × 4 = <b>12</b> seconds.</p>`,
            failTip: 'Check each part against its rule: halvings are counted with Theorem 1, nested pairs with 0 + 1 + … + 99, doubling with the growth rate (n² becomes four times as much).',
            followup: 'Compare (d) with a linear algorithm: a computer 1000 times faster would handle 1000 times as many items. For 2ⁿ it bought nine.'
          }
        },
        {
          ex: {
            id: 'ma-10-2', skill: 'big-o', kind: 'table', title: 'Classify the code',
            prompt: `<p>In each piece of Python code, <code>xs</code> and <code>other</code> are lists of length <i>n</i>, and <code>seen</code> is a set. Give the growth rate of the number of steps as <i>n</i> grows: write <code>1</code>, <code>log n</code>, <code>n</code>, <code>n^2</code> or <code>2^n</code> (with or without the O( )).</p>`,
            head: ['code', 'growth rate'],
            rows: [
              ['<code>total = 0; for x in xs: total += x</code>', { a: ['n', 'O(n)'], name: 'the single loop' }],
              ['<code>while n &gt; 1: n = n // 2</code>', { a: ['log n', 'O(log n)', 'log2 n', 'O(log2 n)', 'log_2 n'], name: 'the halving loop', why: { n: 'Each pass halves n, so there are only about log₂ n passes (Theorem 1).' } }],
              ['<code>for x in xs:</code><br><code>&nbsp;&nbsp;for y in xs: count += 1</code>', { a: ['n^2', 'O(n^2)', 'n*n'], name: 'the nested loops' }],
              ['<code>for x in xs:</code><br><code>&nbsp;&nbsp;for k in range(10): count += 1</code>', { a: ['n', 'O(n)'], name: 'the loop with a fixed inner loop', why: { 'n^2': 'The inner loop runs 10 times whatever n is: that is a constant. 10n is O(n).', 'o(n^2)': 'The inner loop runs 10 times whatever n is: that is a constant. 10n is O(n).' } }],
              ['<code>for x in xs:</code><br><code>&nbsp;&nbsp;if x in other: count += 1</code>', { a: ['n^2', 'O(n^2)', 'n*n'], name: 'the loop with in on a list', why: { n: 'x in other is a hidden loop over a list of n items, so each of the n passes can take n steps.', 'o(n)': 'x in other is a hidden loop over a list of n items, so each of the n passes can take n steps.' } }],
              ['<code>for x in xs:</code><br><code>&nbsp;&nbsp;if x in seen: count += 1</code>', { a: ['n', 'O(n)'], name: 'the loop with in on a set', why: { 'n^2': 'Membership in a set takes one step on average, however big the set is. So n passes cost about n steps.' } }],
              ['<code>for s in all_subsets(xs): check(s)</code>', { a: ['2^n', 'O(2^n)'], name: 'all subsets' }]
            ],
            hints: ['Find the innermost line and count how many times it runs. A loop of fixed length is a constant.', 'in on a list is a hidden loop over the list; in on a set is one step. A set of n items has 2ⁿ subsets (Lesson 2).'],
            solution: `<p>The single loop: <b>n</b>. The halving loop: <b>log n</b>, by Theorem 1. The nested loops: <b>n²</b>. The loop with a fixed inner loop: <b>n</b>, since 10<i>n</i> is O(<i>n</i>). The loop with <code>in</code> on a list: <b>n²</b>, because of the hidden loop. The loop with <code>in</code> on a set: <b>n</b>. All subsets: <b>2ⁿ</b>.</p><p>Rows five and six differ only in whether <code>other</code> is a list or a set, and the growth rate differs by a factor of <i>n</i>. That is the laboratory's lesson in two lines.</p>`,
            failTip: 'Find the innermost line and count how often it runs for a list of n items. Look for hidden loops: in on a list is one, in on a set is not, and a loop of fixed length is a constant.',
            followup: 'Rows four and five look alike on the page and differ completely in cost. Counting steps means reading what each line really does, not how many loops you can see.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>The answer to the opening question: compare algorithms by how their step counts grow with the input size <i>n</i>, and avoid exponential growth.</li>
<li><i>f</i>(<i>n</i>) = O(<i>g</i>(<i>n</i>)) means <i>f</i>(<i>n</i>) ≤ <i>c</i> · <i>g</i>(<i>n</i>) for all <i>n</i> ≥ <i>n</i><sub>0</sub>; prove it by exhibiting <i>c</i> and <i>n</i><sub>0</sub>. Constants and lower terms do not matter; higher powers and exponentials do.</li>
<li>Halving takes ⌊log<sub>2</sub> <i>n</i>⌋ steps; all pairs take <i>n</i>(<i>n</i> − 1)/2; all subsets take 2<sup><i>n</i></sup>. Count hidden loops too.</li>
<li>Doubling the input: O(log <i>n</i>) adds a step, O(<i>n</i>) doubles, O(<i>n</i>²) quadruples, O(2<sup><i>n</i></sup>) squares.</li>
<li>Exponential algorithms stay hopeless on faster hardware; the right data structure (such as a set) can save a factor of <i>n</i>.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-11'], standard: 1,
      title: 'Easy to check, hard to find', summary: 'Problems whose answers are quick to verify but seem to take for ever to discover: P and NP defined, reductions, NP-completeness, and the million-dollar question of whether P equals NP.',
      blocks: [
        `<p>Sudoku. Minesweeper. Tetris. Candy Crush. Each of these games has been the subject of a serious mathematical paper, and the papers all reach the same kind of conclusion: in a precise sense, the general version of the puzzle is as hard as some of the most important unsolved problems in computing. If you found a fast method for solving every Minesweeper board, you would also have a fast method for scheduling airlines, packing lorries, folding proteins and breaking much of the world's encryption, and you could collect a million dollars. So how can a game carry that much weight?</p>
<h2>A problem with a gap</h2>
<p>Here is the <em>subset sum</em> problem. Given a list of whole numbers and a target, is there a subset of the numbers that adds up to exactly the target? For the list 3, 34, 4, 12, 5, 2 and target 9, the answer is yes: 4 + 5. For target 30, the answer is no.</p>
<p>The obvious method tries every subset. A list of <i>n</i> numbers has 2<sup><i>n</i></sup> subsets (Lesson 2), so this takes exponential time, which by Lesson 13 is hopeless beyond a few dozen numbers. But suppose a friend claims that the subset 12, 5, 2, 34 adds up to 53. You can check the claim with three additions. Checking a proposed answer is fast; finding one seems to be slow. That gap is the subject of this lesson.</p>
<details class="reveal"><summary>Guess first: how can you tell that the target 30 is impossible for the list 3, 34, 4, 12, 5, 2?</summary><p>The 34 is too big to use at all, and the other five numbers add up to only 3 + 4 + 12 + 5 + 2 = 26. Here the reasoning is quick, but it used a trick that works only for this list; for a general list, no method that beats trying subsets is known.</p></details>
<h2>Problems, sizes and fast algorithms</h2>
<div class="stmt"><p><span class="kind">Definition.</span> A <em>decision problem</em> is a question with a yes-or-no answer about an input, called an <em>instance</em>, such as "given this list and this target, does some subset add up to the target?". The <em>size</em> <i>n</i> of an instance is the number of symbols needed to write it down.</p>
<p><span class="kind">Definition.</span> An algorithm runs in <em>polynomial time</em> if, for some fixed <i>k</i>, it takes O(<i>n</i><sup><i>k</i></sup>) steps on instances of size <i>n</i>. <b>P</b> is the class of decision problems that some polynomial-time algorithm solves.</p></div>
<p>Polynomial time is the mathematician's definition of "fast". It is generous, since an O(<i>n</i><sup>100</sup>) algorithm would be useless in practice, but it has two great virtues. It separates the growth rates of Lesson 13 cleanly: every polynomial is eventually beaten by 2<sup><i>n</i></sup>. And it is closed under combination: a polynomial-time procedure that calls another polynomial-time procedure polynomially many times is still polynomial. Sorting, searching, shortest paths by breadth-first search, Euclid's algorithm and 2-colouring a graph are all in P. So is deciding whether a number is prime, by a method found in 2002 by three researchers in India, Agrawal, Kayal and Saxena, which settled a question that had been open for decades.</p>
<h2>Problems whose answers can be checked</h2>
<div class="stmt"><p><span class="kind">Definition.</span> A decision problem is in <b>NP</b> if there is a polynomial-time algorithm <i>V</i>, called a <em>verifier</em>, with this property: for every yes-instance <i>x</i> there is some <em>certificate</em> <i>c</i>, of size polynomial in the size of <i>x</i>, such that <i>V</i>(<i>x</i>, <i>c</i>) says yes; and for every no-instance <i>x</i>, <i>V</i>(<i>x</i>, <i>c</i>) says no for every <i>c</i>.</p></div>
<p>A certificate is a proposed solution; the verifier checks it. For subset sum, the certificate is the subset, and the verifier adds it up and compares with the target: polynomial time. The last clause matters: no certificate, however cunning, can fool the verifier into accepting a no-instance. The name NP stands for "nondeterministic polynomial", for historical reasons; it does <em>not</em> mean "not polynomial".</p>
`,
        { skill: 'p-np', check: "What does NP stand for, and what does it mean?", options: ["Not polynomial: problems with no fast algorithm", "Nondeterministic polynomial: yes-answers can be checked quickly given a certificate", "Nearly polynomial"], answer: 1, wrong: ["NP does not mean \"not polynomial\". It contains all of P, whose problems do have fast algorithms; NP is about checking answers, not about being slow.", null, "Nothing in the name says \"nearly\". It stands for nondeterministic polynomial, and it means that a verifier can check a proposed yes-answer in polynomial time."], why: "NP is about checking, not solving. P ⊆ NP; whether they are equal is unknown." },
        `<div class="stmt"><p><span class="kind">Theorem 1.</span> P ⊆ NP: every problem that can be solved quickly can be checked quickly.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Let a problem be solved by a polynomial-time algorithm <i>A</i>. Define the verifier <i>V</i>(<i>x</i>, <i>c</i>) to ignore <i>c</i> and run <i>A</i> on <i>x</i>. It takes polynomial time. On a yes-instance it says yes for any certificate, say the empty one; on a no-instance it says no whatever the certificate. <span class="qed">∎</span></p></div>
<p>Graph 3-colouring is in NP too: can the vertices of a graph (Lesson 6) be coloured with three colours so that no edge joins two vertices of the same colour? The certificate is a colouring, and the verifier checks each edge once. Sudoku is in NP: the certificate is a filled grid. Contrast 2-colouring, which is in P: breadth-first search from any vertex forces the colour of everything it reaches, layer by layer, so either the forced colouring works or none does.</p>
<h2>The question</h2>
<p>Is P equal to NP? That is: is every problem whose answers can be <em>checked</em> quickly also a problem whose answers can be <em>found</em> quickly? Stephen Cook stated the question precisely in 1971. In 2000 the Clay Mathematics Institute named it one of seven Millennium Prize Problems, with a million dollars for a solution. Most experts believe the answer is no, and nobody has been able to prove it.</p>
<details class="reveal"><summary>Predict: trying all 2<sup><i>n</i></sup> subsets is an algorithm that solves subset sum. Doesn't that put subset sum in P?</summary><p>No. P requires <em>polynomial</em> time, and 2<sup><i>n</i></sup> is not a polynomial: it eventually exceeds <i>n</i><sup><i>k</i></sup> for every fixed <i>k</i>. An algorithm exists, so the problem is decidable, unlike Lesson 12's halting problem; the only algorithms known take exponential time. "Hard" in this lesson means "no fast algorithm known", which is very different from "no algorithm at all".</p></details>
<h2>Reductions: translating problems</h2>
<div class="stmt"><p><span class="kind">Definition.</span> A <em>polynomial-time reduction</em> from problem <i>A</i> to problem <i>B</i> is a polynomial-time algorithm that turns every instance <i>x</i> of <i>A</i> into an instance <i>f</i>(<i>x</i>) of <i>B</i>, so that <i>x</i> is a yes-instance of <i>A</i> exactly when <i>f</i>(<i>x</i>) is a yes-instance of <i>B</i>.</p>
<p><span class="kind">Theorem 2.</span> If <i>A</i> reduces to <i>B</i> in polynomial time and <i>B</i> is in P, then <i>A</i> is in P.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> To decide <i>x</i>, compute <i>f</i>(<i>x</i>) and run <i>B</i>'s polynomial-time algorithm on it, answering as it does. By the definition of a reduction the answer is right. Computing <i>f</i> takes at most <i>p</i>(<i>n</i>) steps for some polynomial <i>p</i>, so <i>f</i>(<i>x</i>) has size at most <i>p</i>(<i>n</i>), and <i>B</i>'s algorithm then takes at most <i>q</i>(<i>p</i>(<i>n</i>)) steps for some polynomial <i>q</i>. A polynomial of a polynomial is a polynomial, so the total is polynomial. <span class="qed">∎</span></p></div>
<p>A reduction shows that <i>A</i> is no harder than <i>B</i>. Here is a small one. The <em>partition</em> problem asks: can a list of whole numbers be split into two groups with equal sums? Reduce it to subset sum: add up the list; if the total is odd, the answer is no (produce any no-instance of subset sum, such as the empty list with target 1); otherwise ask subset sum for a subset adding up to half the total. That is correct, because a subset with half the total leaves the other half for the rest, and it takes one pass to compute. So a fast subset-sum solver would give a fast partition solver.</p>
`,
        { skill: 'p-np', check: "Problem A reduces to problem B in polynomial time, and B is in P. What follows?", options: ["A is in P", "B is NP-complete", "A is undecidable"], answer: 0, wrong: [null, "Nothing here says B is hard: B is in P. A reduction from A shows only that A is no harder than B, never that B is hard.", "A can be solved by translating and then running B's fast algorithm, so it is decidable, and fast. Undecidable would mean no algorithm at all."], why: "Translate the instance of A, solve it as B, and the whole thing is polynomial. A is no harder than B." },
        `<h2>The same problem in a thousand costumes</h2>
<div class="stmt"><p><span class="kind">Definition.</span> A problem <i>B</i> is <b>NP-complete</b> if it is in NP and every problem in NP reduces to it in polynomial time.</p>
<p><span class="kind">Theorem 3.</span> If any NP-complete problem is in P, then P = NP.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Let <i>B</i> be NP-complete and in P, and let <i>A</i> be any problem in NP. By the definition, <i>A</i> reduces to <i>B</i> in polynomial time, so by Theorem 2, <i>A</i> is in P. So NP ⊆ P, and with Theorem 1, P = NP. <span class="qed">∎</span></p></div>
<details class="reveal"><summary>Guess first: suppose someone finds a fast algorithm for graph 3-colouring, which is NP-complete. What else becomes fast?</summary><p>Every problem in NP: each one reduces to 3-colouring in polynomial time, so translate and colour. That includes subset sum and Sudoku, and it would prove P = NP.</p></details>
<p>It is not obvious that NP-complete problems exist at all. In 1971 Stephen Cook, and independently Leonid Levin in the Soviet Union (whose paper appeared in 1973), proved that one does: the problem of deciding whether a formula of propositional logic, the kind Lesson 1 built truth tables for, can be made true. Its truth table has 2<sup><i>n</i></sup> rows for <i>n</i> variables, and no one knows a way to avoid essentially checking them. A year later Richard Karp showed that 21 famous problems were NP-complete too, among them versions of subset sum and graph colouring. Today thousands are known, from every corner of science and industry, and the puzzles at the start of the lesson were shown to be just as hard: Minesweeper in 2000, Tetris in 2002, Sudoku in 2003, Candy Crush in 2014.</p>`,
        { photo: 'sudoku-puzzle', caption: "A Sudoku. Checking a finished grid is quick: every row, column and 3 × 3 box must hold 1 to 9 once each. Finding the answer is the hard part, and for the general puzzle, on grids of any size, no fast method is known." },
        `<p>That is the strongest evidence that P ≠ NP. Thousands of problems, attacked for half a century by people with every motive to solve them, have all turned out to be one problem in disguise, and nobody has found a fast algorithm for any of them. In practice, "this problem is NP-complete" ends an argument: stop looking for a fast method that always works, and look instead for a good-enough answer, or a fast method for the special cases you actually have.</p>
<h2>The laboratory</h2>
<p>The gap between finding and checking, measured. Predict the five lines it prints before you run it. The solver tries subsets by counting in binary, as in Lesson 2, and counts how many it tried; the verifier checks a proposed subset.</p>`,
        { play: `def solve(nums, target):                 # find a subset: exponential
    n = len(nums)
    tried = 0
    for k in range(2 ** n):
        tried += 1
        subset = [nums[i] for i in range(n) if (k >> i) & 1]
        if sum(subset) == target:
            return subset, tried
    return None, tried

def verify(nums, target, subset):        # check a claimed subset: fast
    remaining = list(nums)
    for x in subset:
        if x not in remaining:           # every item must come from the list
            return False
        remaining.remove(x)
    return sum(subset) == target

nums = [3, 34, 4, 12, 5, 2]
print(solve(nums, 9))
print(solve(nums, 30))
print(verify(nums, 53, [12, 5, 2, 34]))
print(verify(nums, 53, [12, 5, 2, 35]))
print(solve(list(range(1, 15)), 500))`, predict: true, caption: 'Target 9 is found, as [4, 5], after trying 21 subsets; 30 is impossible, and all 64 are tried. The verifier checks a claim in one pass, and catches the false one. The last line tries all 16,384 subsets of fourteen numbers. Forty numbers would mean a trillion.' },
        { skill: 'p-np', check: "Trying all 2ⁿ subsets solves subset sum. Does that put subset sum in P?", options: ["Yes", "No: 2ⁿ is not polynomial in n", "Yes, for small n"], answer: 1, wrong: ["P asks for polynomial time, O(nᵏ) for a fixed k. Having an algorithm is not enough; 2ⁿ outgrows every such power.", null, "Membership in P is about how the steps grow for every n, not about how quick small cases are. Even 2ⁿ is quick for small n, so small cases prove nothing."], why: "P requires O(nᵏ) steps for some fixed k. Exponential algorithms stay hopeless on faster hardware." },
        `<p>The verifier is careful in the way a certificate checker must be: it checks not only the sum but also that each claimed number really comes from the list. A verifier that only checked the sum could be fooled by the made-up subset [53], and the definition of NP forbids being fooled.</p>
<h2>Before the exercises</h2>
<p>The first exercise asks for counts and for a reduction worked by hand. The second asks you to sort true statements about P and NP from false ones. For each statement, ask: is it about <em>finding</em> or about <em>checking</em>? Is it something proved, something believed, or something false? And is "hard" being used to mean slow, or impossible?</p>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Confusing "hard" (no fast algorithm known) with "undecidable" (Lesson 12: no algorithm at all). Thinking NP stands for "not polynomial". Believing a problem is outside NP because solving it is hard: NP is about <em>checking</em>. Assuming P ≠ NP has been proved. Getting a reduction backwards: to show a new problem is hard, reduce a known hard problem <em>to</em> it, not the other way round. Writing a verifier that can be fooled by a certificate that looks right but is not.</p>` },
        {
          ex: {
            id: 'ma-11-1', skill: 'p-np', kind: 'answer', title: 'Finding, checking and translating',
            prompt: `<p>Answer each part with a whole number, or yes or no.</p>`,
            parts: [
              { label: '(a) In the worst case, how many subsets must the brute-force solver try for a list of 20 numbers?', answer: '1048576', width: '8rem',
                wrong: [{ match: '400', msg: 'That is 20². A list of n numbers has 2ⁿ subsets, and 2²⁰ is just over a million.' }, { match: '20', msg: 'That is the number of items. Each can be in or out of a subset: 2 × 2 × … × 2, twenty times.' }] },
              { label: '(b) The partition instance 3, 1, 1, 2, 2, 1 is reduced to subset sum on the same list. What target does the reduction use?', answer: '5', width: '6rem',
                wrong: [{ match: '10', msg: 'That is the total. Two groups with equal sums each have half the total.' }] },
              { label: '(c) Is 3, 1, 1, 2, 2, 1 a yes-instance of partition?', answer: 'yes', width: '6rem',
                wrong: [{ match: 'no', msg: 'Look for a subset adding up to 5: 3 + 2 is one. The rest, 1 + 1 + 2 + 1, is also 5.' }] },
              { label: '(d) Is 4, 5, 6 a yes-instance of partition?', answer: 'no', width: '6rem',
                wrong: [{ match: 'yes', msg: 'The total is 15, which is odd, so it cannot be split into two equal whole-number halves. The reduction answers no without even calling subset sum.' }] },
              { label: '(e) How many proper colourings with the three colours red, green and blue does a triangle (three vertices, each joined to the other two) have?', answer: '6', width: '6rem',
                wrong: [{ match: '27', msg: 'That counts every colouring, 3 × 3 × 3. In a proper one, all three vertices must differ.' }, { match: ['1', '3'], msg: 'All three vertices must get different colours, but which vertex gets which matters: 3 choices, then 2, then 1.' }] }
            ],
            hints: ['(a) 2ⁿ with n = 20. (b) and (c): the total is 10. (d) Is the total even?', '(e) The first vertex has 3 choices, the second must differ from it, the third from both: the product rule of Lesson 2.'],
            solution: `<p>(a) 2²⁰ = <b>1,048,576</b>. (b) The total is 10, so the target is <b>5</b>. (c) <b>Yes</b>: {3, 2} and {1, 1, 2, 1} both add up to 5. (d) <b>No</b>: the total, 15, is odd. (e) 3 × 2 × 1 = <b>6</b>.</p><p>Part (e) shows why checking is easy: a verifier looks at the three edges once each. Finding a colouring for a graph with a hundred vertices is another matter; there are 3¹⁰⁰ colourings to consider.</p>`,
            failTip: 'For (a) use 2 to the power of the number of items; for (b) to (d) start from the total, which must be even for a split to exist, and ask for half of it; for (e) all three vertices must get different colours.',
            followup: 'The reduction in (b)–(d) did a little work of its own, adding up the list and checking parity, before handing the question on. Reductions are allowed any polynomial-time work.'
          }
        },
        {
          ex: {
            id: 'ma-11-2', skill: 'p-np', kind: 'choice', multi: true, title: 'What is known',
            prompt: `<p>Which of these statements are true? Choose all that apply.</p>`,
            options: [
              { text: 'Every problem in P is also in NP.', ok: true },
              { text: 'NP stands for "not polynomial": the problems that cannot be solved in polynomial time.', why: 'NP stands for "nondeterministic polynomial", and it is about checking certificates quickly. It contains all of P, and whether it contains anything else is the open question.' },
              { text: 'It has been proved that P ≠ NP.', why: 'Most experts believe it, but nobody has proved it. That is why the prize is still unclaimed.' },
              { text: 'If someone found a polynomial-time algorithm for subset sum, then P would equal NP.', ok: true },
              { text: 'Subset sum is undecidable, like the halting problem.', why: 'Trying every subset always finishes with the right answer, so subset sum is decidable. It is believed to be hard, which means slow, not impossible.' },
              { text: 'Checking a proposed 3-colouring of a graph can be done in polynomial time.', ok: true },
              { text: 'To show a new problem X is NP-hard, it is enough to reduce X to subset sum.', why: 'That shows X is no harder than subset sum. To show X is at least as hard, reduce subset sum, or another NP-complete problem, to X.' }
            ],
            hints: ['Separate proved facts, beliefs and falsehoods. Theorems 1 and 3 are proved.', 'For the reduction statement, ask which direction shows "at least as hard".'],
            solution: `<p>The true ones are the first (Theorem 1), the fourth (Theorem 3, since subset sum is NP-complete) and the sixth (the verifier looks at each edge once).</p><p>The second misreads the name. The third states a belief as a fact. The fifth confuses slow with impossible. The last has the reduction backwards: reducing X to subset sum shows X is easy if subset sum is, which says nothing about X being hard.</p>`,
            failTip: 'Sort each statement into proved, believed or false before choosing. Check for a reduction pointing the wrong way, and for "hard" used where "impossible" is meant.',
            followup: 'Only three statements were true, and every false one is a mistake experienced people make. Precision about what is proved, believed and false is most of what this subject asks.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>P: decision problems solvable in polynomial time. NP: problems whose yes-answers have certificates checkable in polynomial time. P ⊆ NP.</li>
<li>Whether P = NP is unknown; it is a Millennium Prize Problem, and most experts believe the answer is no.</li>
<li>A polynomial-time reduction from A to B shows A is no harder than B; if B is in P, so is A.</li>
<li>The answer to the opening question: NP-complete problems, which a game can be, are the hardest in NP, since every NP problem reduces to them. If one is in P, then P = NP. Subset sum, 3-colouring and Sudoku are NP-complete.</li>
<li>"Hard" means no fast algorithm is known; "undecidable" (Lesson 12) means no algorithm exists.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-11'],
      title: 'Checkpoint three', checkpoint: true, summary: 'No new ideas: mixed questions on Turing machines, the halting problem, counting steps and P and NP, then two exercises. Decidable or undecidable? Easy to find or only easy to check? O(n) or O(n²)?',
      blocks: [
        `<p>This lesson teaches nothing new. It mixes questions on the last four lessons: Turing machines, what no program can do, counting steps and easy-to-check problems. The pairs to keep apart are the ones the course has been building: decidable and undecidable, a thesis and a theorem, P and NP, a problem that is hard and one that is impossible. Answer each question before looking back. If one surprises you, the lesson it came from is linked on the Review page.</p>
<p>Ready? Here is the first: if a computer a million times faster arrived tomorrow, would it be any closer to solving the halting problem?</p>
<h2>Mixed questions</h2>`,
        { check: 'A Turing machine has the rule (q, 1) → write 0, move left, enter state r. The head is on cell 5 reading a 1. After the step, where is the head and what does cell 5 hold?', skill: 'turing-machine', options: ['The head is on cell 4, and cell 5 holds 0', 'The head is on cell 5, and cell 5 holds 0', 'The head is on cell 4, and cell 5 still holds 1'], answer: 0, wrong: [null, 'The head moves on every step: there is no "stay". To write and stay, a machine has to move and come back.', 'The write happens first, then the move. Cell 5 now holds the 0 that the rule wrote, and the head has moved off it.'], why: 'A step writes the new symbol on the cell under the head, moves the head one cell, and changes the state. All three happen in every step.' },
        { check: 'Which sentence about the Church–Turing thesis is correct?', skill: 'church-turing', options: ['It is a theorem, proved in 1936', 'It is a claim that "computable by a mechanical procedure" and "computable by a Turing machine" mean the same, which cannot be proved because the first phrase is not a precise definition', 'It says that every program halts'], answer: 1, wrong: ['It cannot be proved as a theorem, because one side of it, "mechanical procedure", is an everyday idea, not a mathematical definition. What is proved is that every model of computing anyone has built matches Turing machines.', null, 'Programs that never halt exist, and the halting problem is about telling them apart. The thesis is about what can be computed at all.'], why: 'A thesis, not a theorem. Every model proposed so far, Python included, computes exactly what Turing machines compute, and that is why it is believed.' },
        { check: 'Which of these collections cannot be listed as a first, a second, a third, and so on?', skill: 'countability', options: ['All Python programs', 'All whole numbers', 'All infinite sequences of 0s and 1s'], answer: 2, wrong: ['Every program is a finite string of characters, and the finite strings can be listed by length and then alphabetically. So the programs can be listed.', 'The whole numbers are the standard list: 0, 1, 2, 3, and so on.', null], why: 'Cantor\'s diagonal argument: given any list of infinite sequences, change the n-th digit of the n-th sequence to build one that is not on the list. Infinite sequences are more numerous than programs, so some of them are computed by no program.' },
        { check: 'To prove that no program decides the halting problem, what does the proof assume at the start?', skill: 'halting-proof', options: ['That the program trouble halts', 'That a program halts(P, x) exists and answers correctly for every program P and input x', 'That every program halts'], answer: 1, wrong: ['Whether trouble halts is what the argument ends up contradicting. It is not the assumption: the assumption is that halts exists.', null, 'If every program halted, halts could always answer yes and there would be no contradiction. The proof relies on programs that loop for ever.'], why: 'A proof by contradiction: assume a correct halts exists, build trouble from it, and find that trouble(trouble) halts exactly when it does not.' },
        { check: 'A machine has finitely many possible configurations, each determining the next. Is it decidable whether it halts?', skill: 'undecidable', options: ['No: halting is undecidable for every kind of machine', 'Yes: run it for as many steps as there are configurations; if it has not halted, it is in a loop', 'Yes, but only if it has fewer than 10 states'], answer: 1, wrong: ['The proof needs unbounded memory. With finitely many configurations, a machine that has not halted by then has visited one twice (pigeonhole) and loops for ever.', null, 'Nothing depends on 10. The method works for any finite number of configurations, though for a large number it takes too long to be useful.'], why: 'Theorem 6: with N configurations, a machine that has not halted after N steps has repeated one, and since each configuration determines the next, it loops for ever.' },
        { check: 'Algorithm A takes 100n steps and algorithm B takes n² steps. Which statement is correct?', skill: 'big-o', options: ['B is faster, because 100n has the bigger number in front', 'A is faster for every n above 100, however big the constant 100 looks', 'They are about equally fast, because both are polynomial'], answer: 1, wrong: ['The constant looks large, but n² overtakes 100n as soon as n is more than 100, and keeps growing faster. Constants do not matter, and exponents do.', null, 'Both are polynomial, but n² grows faster than n, so the gap between them widens without limit. O(n) and O(n²) are different growth rates.'], why: '100n < n² exactly when n > 100. A is O(n) and B is O(n²), so for large inputs A wins by a margin that keeps growing.' },
        { check: 'An O(n) algorithm and an O(n²) algorithm both take 3 seconds on an input of size 1000. About how long does each take on an input of size 2000?', skill: 'big-o', options: ['6 seconds and 12 seconds', '6 seconds and 6 seconds', '12 seconds and 6 seconds'], answer: 0, wrong: [null, 'Doubling the input doubles a linear algorithm but quadruples a quadratic one, because n² becomes (2n)² = 4n².', 'The two are the wrong way round: the quadratic algorithm is the one whose time quadruples when the input doubles.'], why: 'Linear: twice the input, twice the time, 6 seconds. Quadratic: twice the input, four times the time, 12 seconds.' },
        { check: 'A student says "sorting is in P, so it cannot be in NP". What is wrong with that?', skill: 'p-np', options: ['Nothing: P and NP have no problems in common', 'Every problem in P is also in NP: a problem that can be solved quickly can be checked quickly, by solving it again', 'Only decision problems are in P, and sorting is not'], answer: 1, wrong: ['P ⊆ NP is Theorem 1 of the lesson: every problem that has a fast solver can be checked quickly, so P sits inside NP. What nobody knows is whether the two are equal.', null, 'Sorting can be turned into the yes-or-no question "is this list the sorted version of that one?", and that question is in P, hence in NP. The point is that P is part of NP.'], why: 'To check a claimed answer, just solve the problem and compare. So P ⊆ NP. Whether P = NP is the open question.' },
        { check: 'Problem A reduces to problem B in polynomial time, and A is known to have no fast algorithm. What does that say about B?', skill: 'p-np', options: ['B is easy, because it solves A', 'B is at least as hard as A: a fast algorithm for B would give a fast one for A', 'Nothing: reductions only translate'], answer: 1, wrong: ['If B had a fast algorithm, then A would too: translate, then solve. Since A has none, B cannot be easy.', null, 'A reduction is exactly what carries hardness along: translate any instance of A to B, and a fast B-solver becomes a fast A-solver.'], why: 'The reduction turns a fast algorithm for B into a fast algorithm for A. So if A has none, B has none either: B is at least as hard.' },
        `<p>Two exercises to finish the unit. The first asks which problem is impossible, not merely slow. The second asks for four numbers from four different lessons.</p>`,
        {
          ex: {
            id: 'ma-16-1', kind: 'choice', skill: 'undecidable', title: 'Impossible, not just slow',
            prompt: `<p>Four tasks are described below. Which one is a task that no program can do in general, whatever the time allowed?</p>`,
            options: [
              { text: 'Given a list of numbers and a target, say whether some subset adds up to the target.', why: 'This is subset sum. It is decidable: try all 2ⁿ subsets, which takes a very long time for large n, but ends. It is in NP, and nobody knows a fast algorithm.' },
              { text: 'Given a number, say whether it is prime.', why: 'Decidable: trial division up to the square root always settles it, and the 2002 method of Agrawal, Kayal and Saxena does it in polynomial time.' },
              { text: 'Given any program and any input, say whether the program ever halts on it.', ok: true },
              { text: 'Given a list of n numbers, put them in order.', why: 'Decidable and fast: sorting takes about n log n steps.' }
            ],
            hints: ['Three of the four have algorithms that always finish, some of them slow. Which one has been proved to have none?', 'The proof used the program trouble, and the diagonal argument. Which task is that proof about?'],
            solution: '<p>The halting problem. Turing proved that no program answers it correctly for every program and input. Subset sum is slow (and in NP), but trying all subsets always finishes; primality and sorting are quick. Hard means no fast algorithm is known; impossible means no algorithm exists at all.</p>',
            followup: 'Subset sum is hard, the halting problem is impossible. Which of the two would still be unsolvable if computers were a billion times faster, and why?'
          }
        },
        {
          ex: {
            id: 'ma-16-2', kind: 'answer', skill: ['big-o', 'p-np', 'turing-machine'], title: 'Four numbers',
            prompt: `<p>Answer each question with a single number.</p>`,
            parts: [
              { label: '(a) An O(n²) algorithm takes 5 seconds on an input of size 10,000. About how many seconds does it take on an input of size 30,000?', answer: '45', width: '6rem',
                wrong: [{ match: '15', msg: 'That would be right for an O(n) algorithm. For O(n²), an input 3 times as large takes 3² = 9 times as long.' }, { match: '25', msg: 'That is 5 · 5, not 5 · 9. Tripling the input multiplies the time by 3², which is 9.' }] },
              { label: '(b) How many subsets does a set of 20 numbers have? (These are the cases that trying all subsets must check.)', answer: '1048576', width: '8rem',
                wrong: [{ match: '400', msg: 'That is 20², a polynomial count. Each of the 20 numbers is in or out, so the number of subsets is 2 multiplied by itself 20 times.' }, { match: '40', msg: 'That is 2 · 20. Each element doubles the number of subsets, so the count is 2²⁰.' }] },
              { label: '(c) The incrementer Turing machine adds 1 to a binary number. How many steps does it take on the tape 111 before it halts?', answer: '8', width: '6rem',
                wrong: [{ match: '3', msg: 'That is the length of the tape, the steps it takes to walk right. The machine then turns around and carries.' }, { match: '7', msg: 'One step short. It walks right across 3 digits, turns around on the blank (1 step), then the carry changes the three 1s to 0 and writes a new 1 in front: 3 + 1 + 4.' }] },
              { label: '(d) A loop halves n (n = n // 2) until n reaches 1. Starting from 5000, how many halvings are made?', answer: '12', width: '6rem',
                wrong: [{ match: '13', msg: '2¹³ = 8192 is bigger than 5000. The number of halvings is the whole number k with 2ᵏ ≤ 5000 < 2ᵏ⁺¹, and 2¹² = 4096 ≤ 5000.' }, { match: '2500', msg: 'That is the value after the first halving. The question asks how many halvings there are altogether.' }] }
            ],
            hints: ['(a) How many times larger is the input, and what does that do to n²? (b) Two choices for each of the 20 numbers. (c) Walking right, turning around, then carrying. (d) Find k with 2ᵏ ≤ 5000 < 2ᵏ⁺¹.', '(a) 3² · 5. (b) 2²⁰. (c) |w| + 1 + (k + 1) with |w| = 3 and k = 3. (d) 2¹² = 4096 and 2¹³ = 8192.'],
            solution: '<p>(a) 3² = 9 times as long: 9 · 5 = <b>45</b> seconds. (b) 2²⁰ = <b>1,048,576</b>. (c) The machine walks right over 3 digits, turns around on the blank, then the three 1s become 0 and a new 1 is written in front of them: 3 + 1 + 4 = <b>8</b> steps, and 111 + 1 = 1000. (d) 2¹² = 4096 ≤ 5000 &lt; 8192 = 2¹³, so <b>12</b> halvings.</p>',
            followup: 'Make a table of n² and 2ⁿ for n = 10, 20, 30, 40. At which n does 2ⁿ pass a trillion, and what does that say about trying all subsets?'
          }
        },
        `<div class="recap"><h3>Unit three in a few lines</h3><ul>
<li>A Turing machine moves on every step and writes before it moves; states record the phase, the tape records the data. The Church–Turing thesis is a thesis, not a theorem.</li>
<li>Programs can be listed, infinite sequences cannot (the diagonal), so some problems have no program. The halting problem is one: assume a correct <code>halts</code>, build <code>trouble</code>, and contradict. With finitely many configurations, halting is decidable.</li>
<li>Constants do not matter and exponents do: O(<i>n</i>) against O(<i>n</i>²), doubling the input, and 2<sup><i>n</i></sup> beating every polynomial.</li>
<li>P is solved quickly, NP is checked quickly, and P ⊆ NP. A reduction carries hardness along: if A reduces to B and A is hard, so is B. Hard is not impossible.</li>
<li>Next: chance. Unit four counts the odds, finds averages, lets algorithms flip coins, and adds up the sums that recursive programs leave behind.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-DA-07', '6.1.2.3', '7.1.2.2', '7.1.2.4', '7.1.2.5', '7.1.2.6', '9.1.2.2', '9.1.2.3'], standard: 1,
      title: 'Chance, counted', summary: 'Probability as counting equally likely outcomes: sample spaces and events, "not", "or" and "and", independence and conditional probability, the Chevalier de Méré’s two bets, the birthday problem and hash collisions, and a simulation as a check on an exact answer.',
      blocks: [
        `<p>In the summer of 1654 Blaise Pascal in Paris and Pierre de Fermat in Toulouse wrote to each other about games of dice. The questions had been put to Pascal by a writer, Antoine Gombaud, known as the Chevalier de Méré. In a letter of 29 July 1654 Pascal tells Fermat about one of them. De Méré knew that betting on at least one six in 4 throws of a die is a good bet: the chances are, in Pascal's words, "as 671 to 625". Two dice can fall in 36 ways instead of 6, and 24 is to 36 as 4 is to 6, so by proportion 24 throws of two dice should be just as good a bet on a double six. Yet there is a <em>disadvantage</em> in 24 throws, Pascal writes, and this was de Méré's "great scandal which made him say haughtily that the propositions were not consistent and that Arithmetic contradicted itself."</p>
<p>The letter does not say how de Méré found out. A story often told is that he lost money at the gaming table, but the letters do not say so, and the difference is too small to notice without thousands of games. So who was right, the rule of proportion or the dice? And how can a chance be worked out exactly, without throwing dice all night?</p>`,
        `<p>Lesson 2 counted possibilities without listing them. Probability is what counting becomes when the possibilities are equally likely: the chance of an event is the share of the possibilities in which it happens. This lesson builds the rules of chance from Lesson 2's rules of counting, settles de Méré's question, and then meets a question that every hash table has to face.</p>
<h2>Outcomes and events</h2>
<div class="stmt"><p><span class="kind">Definition.</span> The <em>sample space</em> of an experiment is the set <i>S</i> of all its possible outcomes. An <em>event</em> is a subset <i>E</i> ⊆ <i>S</i>: the outcomes in which something happens. When every outcome is equally likely, the <em>probability</em> of <i>E</i> is</p>
<p style="text-align:center"><i>P</i>(<i>E</i>) = |<i>E</i>| / |<i>S</i>|.</p></div>
<p>So 0 ≤ <i>P</i>(<i>E</i>) ≤ 1, with <i>P</i>(∅) = 0 for the event that cannot happen and <i>P</i>(<i>S</i>) = 1 for the event that must. For one die, <i>S</i> = {1, 2, 3, 4, 5, 6}, and "an even number" is the event {2, 4, 6}, with probability 3/6 = 1/2.</p>
<details class="reveal"><summary>Guess first: what is the probability that one throw of a die shows a number greater than 4?</summary><p>2/6 = 1/3. The event is {5, 6}: two outcomes out of six equally likely ones. "Greater than 4" does not include 4 itself.</p></details>
<p>The words "equally likely" carry the whole definition, and they are a claim about the world, not about mathematics: a fair die, a well-shuffled deck. The skill is to choose a sample space in which they are true. Throw two dice and write down the sum: there are eleven possible sums, 2 to 12, but they are not equally likely. Write down instead the pair (first die, second die). By the product rule there are 6 · 6 = 36 pairs, and for fair dice each pair is as likely as any other. Picture one die red and the other blue if it helps: (2, 5) and (5, 2) are different outcomes.</p>`,
        { play: `outcomes = [(a, b) for a in range(1, 7) for b in range(1, 7)]
print(len(outcomes), "outcomes")

for total in (2, 7, 12):
    event = [o for o in outcomes if o[0] + o[1] == total]
    print("sum", total, ":", len(event), "of", len(outcomes))`, predict: true, caption: 'There are 36 outcomes. A sum of 2 happens in 1 of them, (1, 1); a sum of 7 in 6 of them, (1, 6), (2, 5), (3, 4), (4, 3), (5, 2) and (6, 1); a sum of 12 in 1. So the probability of a 7 is 6/36 = 1/6, six times the probability of a 2. Put all the sums from 2 to 12 in the tuple and watch the counts rise 1, 2, 3, 4, 5, 6 and fall again: 7 comes up more often than any other sum.' },
        { skill: 'probability', check: "Two fair dice are thrown. What is the probability that the sum is 7?", options: ["1/11, one of the eleven sums from 2 to 12", "6/36, which is 1/6", "1/36, for the one pair that makes it"], answer: 1, why: "Of the 36 equally likely pairs, six add up to 7: 6/36 = 1/6.", wrong: ["The eleven sums are not equally likely, so one of them is not 1/11 of the chance. Count in the sample space of 36 equally likely pairs: six of them add up to 7.", null, "Several pairs add up to 7: (1, 6), (2, 5), (3, 4), (4, 3), (5, 2) and (6, 1). (3, 4) and (4, 3) are different outcomes."] },
        `<h2>Not, or, and</h2>
<p>Events are sets, so Lesson 2's operations on sets make new events from old ones. "<i>E</i> or <i>F</i>" is the union <i>E</i> ∪ <i>F</i>, "<i>E</i> and <i>F</i>" is the intersection <i>E</i> ∩ <i>F</i>, and "not <i>E</i>" is the complement <i>S</i> − <i>E</i>. Two events are <em>mutually exclusive</em> when they cannot both happen, that is, when they are disjoint. Dividing Lesson 2's counting rules by |<i>S</i>| turns them into rules of probability.</p>
<div class="stmt"><p><span class="kind">Theorem 1.</span> For events <i>E</i> and <i>F</i> in a sample space of equally likely outcomes:</p>
<p>(a) <i>P</i>(not <i>E</i>) = 1 − <i>P</i>(<i>E</i>);</p>
<p>(b) <i>P</i>(<i>E</i> or <i>F</i>) = <i>P</i>(<i>E</i>) + <i>P</i>(<i>F</i>) − <i>P</i>(<i>E</i> and <i>F</i>), so <i>P</i>(<i>E</i> or <i>F</i>) = <i>P</i>(<i>E</i>) + <i>P</i>(<i>F</i>) when <i>E</i> and <i>F</i> are mutually exclusive.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> (a) By the complement rule, |<i>S</i> − <i>E</i>| = |<i>S</i>| − |<i>E</i>|; divide both sides by |<i>S</i>|. (b) By inclusion–exclusion, |<i>E</i> ∪ <i>F</i>| = |<i>E</i>| + |<i>F</i>| − |<i>E</i> ∩ <i>F</i>|; divide by |<i>S</i>|. If the events are mutually exclusive, <i>E</i> ∩ <i>F</i> = ∅ and the last term is 0. <span class="qed">∎</span></p></div>
<details class="reveal"><summary>Guess first: two dice are thrown. Is the chance of at least one six 1/6 + 1/6 = 1/3?</summary><p>No: it is 11/36, a little less than 12/36 = 1/3. "The first die is a six" has 6 outcomes and "the second die is a six" has 6, but (6, 6) is in both, so adding counts it twice: 6 + 6 − 1 = 11. The two events can happen together, so the short form of Theorem 1(b) does not apply.</p></details>
<p>Part (a) is the way to handle "at least one", exactly as in Lesson 2: count the outcomes with <em>none</em>. Here is de Méré's first bet. Four throws of a die give 6<sup>4</sup> = 1296 equally likely sequences, by the product rule. The sequences with no six use only the faces 1 to 5, so there are 5<sup>4</sup> = 625 of them. That leaves 1296 − 625 = 671 sequences with at least one six, and</p>
<p style="text-align:center"><i>P</i>(at least one six in 4 throws) = 671/1296 ≈ 0.518.</p>
<p>The chances are 671 for and 625 against: the very numbers in Pascal's letter. A little better than even, so a good bet.</p>
<h2>Independent events</h2>
<p>The second bet has 36<sup>24</sup> sequences, a number with 38 digits, and the complement rule handles them just as easily. It is worth seeing why the counting works, because the reason has a name.</p>
<div class="stmt"><p><span class="kind">Definition.</span> Events <i>E</i> and <i>F</i> are <em>independent</em> when <i>P</i>(<i>E</i> and <i>F</i>) = <i>P</i>(<i>E</i>) · <i>P</i>(<i>F</i>).</p></div>
<p>Throw a die twice. "A six on the first throw" and "a six on the second throw" are independent: the only pair with both is (6, 6), and 1/36 = 1/6 · 1/6. This is the product rule again. Whenever an experiment is made of separate parts, one throw and then another, and every combination of their outcomes is equally likely, events about different parts are independent and their probabilities multiply. So the chance of no double six in one throw of two dice is 35/36, the chance of none in 24 throws is (35/36)<sup>24</sup>, and by Theorem 1(a)</p>
<p style="text-align:center"><i>P</i>(at least one double six in 24 throws) = 1 − (35/36)<sup>24</sup>.</p>`,
        { play: `four = 1 - (5 / 6) ** 4
twenty_four = 1 - (35 / 36) ** 24

print("one die, 4 throws:   ", round(four, 4))
print("two dice, 24 throws: ", round(twenty_four, 4))
print("by proportion:       ", round(4 / 6, 4), round(24 / 36, 4))`, predict: true, caption: 'Four throws of one die win with probability 0.5177; twenty-four throws of two dice win with probability only 0.4914, a little worse than even. The rule of proportion treats the bets as alike, because 4/6 and 24/36 are both 0.6667, but chances of "at least one" do not grow in proportion to the number of tries. Arithmetic was consistent all along: the rule of proportion was wrong. Change 24 to 25 and the second bet becomes a good one.' },
        `<p>Independent is not the same as mutually exclusive; it is nearly the opposite. Mutually exclusive events cannot happen together, so if one happens the other certainly does not: knowing one tells you a great deal about the other. On one die, "the result is 6" and "the result is 1" are mutually exclusive, and <i>P</i>(both) = 0, not 1/6 · 1/6.</p>
<div class="stmt"><p><span class="kind">Definition.</span> If <i>P</i>(<i>E</i>) &gt; 0, the <em>conditional probability</em> of <i>F</i> given <i>E</i> is <i>P</i>(<i>F</i> | <i>E</i>) = <i>P</i>(<i>E</i> and <i>F</i>) / <i>P</i>(<i>E</i>). With equally likely outcomes it is |<i>E</i> ∩ <i>F</i>| / |<i>E</i>|: the share of the outcomes of <i>E</i> in which <i>F</i> happens too.</p></div>
<p>Knowing that <i>E</i> happened shrinks the sample space to <i>E</i>. Given that the sum of two dice is 8, the outcomes left are (2, 6), (3, 5), (4, 4), (5, 3) and (6, 2), so the probability that both dice show 4 is now 1/5, not 1/36. Dividing the definition of independence by <i>P</i>(<i>E</i>) gives another way to say it: <i>E</i> and <i>F</i> are independent exactly when <i>P</i>(<i>F</i> | <i>E</i>) = <i>P</i>(<i>F</i>), that is, when knowing that <i>E</i> happened does not change the chance of <i>F</i>.</p>
<details class="reveal"><summary>Guess first: two dice are thrown, and you are told that at least one shows a six. What is the chance that both do?</summary><p>1/11. Of the 11 outcomes with at least one six, only (6, 6) has two. Many people say 1/6, reasoning about "the other die"; but "at least one" does not say which die, and that changes the count.</p></details>`,
        { skill: 'probability', check: "A die is thrown once. E is \"the result is 6\" and F is \"the result is 1\". Are E and F independent?", options: ["Yes: they are about different numbers, so they have nothing to do with each other", "No: they are mutually exclusive, so P(E and F) = 0, while P(E) · P(F) = 1/36", "Yes, because each has probability 1/6"], answer: 1, why: "Independent means P(E and F) = P(E) · P(F). Mutually exclusive events with positive probabilities always fail that test: if one happens, the other cannot.", wrong: ["Having no outcome in common is exactly what ties them together: if E happens, F cannot. Independence means that knowing one does not change the chance of the other.", null, "Equal probabilities say nothing about independence. The test is whether P(E and F) equals P(E) · P(F), and here 0 is not 1/36."] },
        `<h2>The birthday problem</h2>
<p>How many people must be in a room before it is more likely than not that two of them share a birthday? To turn this into counting, assume that each person's birthday is one of 365 days (leave out 29 February), each day equally likely, and that different people's birthdays are independent. Real birthdays are not spread perfectly evenly over the year, so this is a model, not the world.</p>
<details class="reveal"><summary>Guess first: how many people are needed for an even chance of a shared birthday? 183, about half of 365? Fewer? More?</summary><p>23. Most people guess far more. The theorem below shows why the answer is so small.</p></details>
<div class="stmt"><p><span class="kind">Theorem 2.</span> For <i>n</i> ≤ 365 people, the probability that all <i>n</i> birthdays are different is</p>
<p style="text-align:center">(365 · 364 · 363 · … · (365 − <i>n</i> + 1)) / 365<sup><i>n</i></sup>,</p>
<p>and the probability that at least two share a birthday is 1 minus this.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> An outcome is the list of the <i>n</i> birthdays, one for each person in turn, so by the product rule there are 365<sup><i>n</i></sup> equally likely outcomes. In those with all birthdays different, the first person has 365 possible days, the second 364 (any but the first's), the third 363, and so on: the product rule with a shrinking number of options, as for Lesson 2's club officers. Divide, then use Theorem 1(a) for "at least two share". <span class="qed">∎</span></p></div>
<p>The answer is small because a match can happen between <em>any</em> two people, not just between you and someone else. Twenty-three people make 23 · 22 / 2 = 253 pairs, and each pair has a 1-in-365 chance of matching. Move the slider and watch the chance climb.</p>`,
        { fig: 'birthday', caption: 'The chance that at least two of <i>n</i> people share a birthday, from Theorem 2. It passes 50% at 23 people and 99% at 57. Then switch to hash slots: with a million slots, two of the keys probably share a slot after only 1,178 keys.' },
        `<p>Now replace days by the slots of a <em>hash table</em>, the structure inside Python's sets and dictionaries (Lesson 13). A hash table stores each key in a slot computed from the key, and a good hash function scatters keys over its <i>m</i> slots as if at random. Theorem 2 with 365 replaced by <i>m</i> says when two keys are likely to land in the same slot: not after about <i>m</i>/2 keys, but after about 1.18 √<i>m</i>. So every hash table needs a plan for collisions; hoping to avoid them does not work, and SC 107 builds a table that handles them. The same arithmetic threatens digital fingerprints. If a hash function gives 2<sup>64</sup> possible values, two different files with the same value can be expected after a few billion tries, around the square root of 2<sup>64</sup>, rather than after 2<sup>64</sup>. Cryptographers call this the <em>birthday attack</em>, and it is why fingerprints are made much longer than 64 bits.</p>`,
        { skill: 'probability', check: "Why does a room of just 23 people have about an even chance of a shared birthday?", options: ["23 people make 253 pairs, and a match between any pair counts", "23 is more than half of 365", "Birthdays bunch up in some months"], answer: 0, why: "Each of the 253 pairs has a 1-in-365 chance of matching, and one match is enough. Pairs grow like n², which is why collisions in a hash table of m slots come after about √m keys.", wrong: [null, "23 is far less than half of 365, which would be 183. What matters is the number of pairs, and that grows like the square of the number of people.", "The calculation assumes every day is equally likely, and it still gives 23. Uneven birthdays are not needed to explain it."] },
        `<h2>The laboratory</h2>
<p>An exact answer can still be wrong: a slip in the algebra, or a model that does not fit the question. A <em>simulation</em> is an independent check. Instead of counting, the program below makes up 2000 rooms of 23 random birthdays and counts the rooms with a match. The share of such rooms should come out near the exact probability, and nearer the more rooms you try; that is the <em>law of large numbers</em>, which this course does not prove. The line <code>random.seed(1)</code> fixes the starting point of Python's random numbers, so the program makes the same rooms every time you run it. Delete it to get new rooms on every run.</p>
<details class="reveal"><summary>Guess first: will 2000 simulated rooms give exactly the exact answer, 0.5073?</summary><p>Almost certainly not. The share wobbles around 0.5073, typically by a hundredth or two for 2000 rooms, and a different seed gives a different share. The exact value on the last line is the same every time.</p></details>`,
        { play: `import random
random.seed(1)
people = 23

def shared_birthday(n):
    seen = set()
    for person in range(n):
        day = random.randint(1, 365)
        if day in seen:
            return True
        seen.add(day)
    return False

rooms = 2000
hits = 0
for r in range(rooms):
    if shared_birthday(people):
        hits += 1
print(hits, "of", rooms, "rooms:", hits / rooms)

all_different = 1
for k in range(people):
    all_different = all_different * (365 - k) / 365
print("exact:", 1 - all_different)`, caption: 'The first line is the simulation: the share of 2000 random rooms with a shared birthday. It comes out close to the exact value on the second line, 0.5072972343239855, but not equal to it. Change <code>people</code> to 50 (the exact answer is about 0.970) and 10 people (about 0.117), and try 20000 rooms to see the share settle nearer the exact value. When an exact answer and a simulation disagree by much more than the wobble, one of them has a mistake in it.' },
        `<h2>Before the exercises</h2>
<p>The trace comes first: it runs Theorem 2's product on a small planet whose year has only 10 days. The next exercise asks for counts in sample spaces, so that each probability is a count divided by the size of the space. Decide first which rule applies: "or" of events that can happen together is inclusion–exclusion; "at least one" is the complement; "given that" shrinks the sample space. The last asks which pairs of events are independent. For each pair, compute <i>P</i>(<i>E</i> and <i>F</i>) and compare it with <i>P</i>(<i>E</i>) · <i>P</i>(<i>F</i>), and do not trust your sense of whether the two events "have anything to do with each other".</p>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Treating outcomes as equally likely when they are not, such as the eleven sums of two dice. Adding the probabilities of events that can happen together. Counting "at least one" directly instead of through "none". Confusing independent with mutually exclusive: mutually exclusive events are about as dependent as events can be. Reading <i>P</i>(<i>F</i> | <i>E</i>) as if it were <i>P</i>(<i>F</i>), forgetting that the information shrinks the sample space. Expecting a simulation to hit the exact answer, or trusting a single simulation with no exact answer to compare.</p>` },
        {
          ex: {
            id: 'ma-18-3', kind: 'trace', skill: 'probability', title: 'Trace the birthday product',
            prompt: `<p>On a planet whose year has only 10 days, this program counts the ways that 4 people can all have different birthdays, and prints it beside the number of all possible lists of 4 birthdays. Fill in the table: each row is a moment just after line 3 or line 5 runs, with the values of <code>k</code> and <code>ways</code> then (<code>-</code> for a variable that does not exist yet). The first row is done for you.</p>`,
            code: `days = 10\npeople = 4\nways = 1\nfor k in range(people):\n    ways = ways * (days - k)\nprint(ways, days ** people)`,
            vars: ['k', 'ways'],
            steps: [
              { line: 3, values: { k: '-', ways: '1' }, show: true },
              { line: 5, values: { k: '0', ways: '10' }, why: { ways: { '9': 'With k = 0, days − k is 10: the first person may have any of the 10 days.' } } },
              { line: 5, values: { k: '1', ways: '90' }, why: { ways: { '100': 'The second person may not have the first person’s birthday, so only 10 − 1 = 9 days are left: 10 · 9 = 90.', '80': 'With k = 1, days − k is 9, not 8: 10 · 9 = 90.' } } },
              { line: 5, values: { k: '2', ways: '720' } },
              { line: 5, values: { k: '3', ways: '5040' }, why: { ways: { '7': 'ways keeps the running product: 720 · 7 = 5040.' } } }
            ],
            hints: ['Each pass multiplies ways by days − k: the number of days the next person may still use.', 'The factors are 10, 9, 8 and 7, so ways goes 1, 10, 90, 720, 5040.'],
            solution: '<p>k: -, 0, 1, 2, 3. ways: 1, 10, 90, 720, 5040. The program prints <code>5040 10000</code>, so by Theorem 2 the chance that all four birthdays differ is 5040/10000 = 0.504, and the chance of a shared birthday is 0.496. On this planet, four people are not quite enough for an even chance.</p>',
            failTip: 'Each pass multiplies ways by days − k, the number of days still free: 10, then 9, then 8, then 7. ways is never reset inside the loop.',
            followup: 'Change people to 5. What does the program print, and is a shared birthday now more likely than not?'
          }
        },
        {
          ex: {
            id: 'ma-18-1', skill: 'probability', kind: 'answer', title: 'Counting chances',
            prompt: `<p>Answer each question with a single whole number. Decide first which rule applies: the complement, inclusion–exclusion, or shrinking the sample space.</p>`,
            parts: [
              { label: '(a) Two dice are thrown. How many of the 36 outcomes have a sum of 8?', answer: '5', width: '5rem',
                wrong: [{ match: '3', msg: 'That counts unordered pairs {2, 6}, {3, 5} and {4, 4}. Outcomes are ordered: (2, 6) and (6, 2) are different, though (4, 4) is only one outcome.' }, { match: '6', msg: '(4, 4) is a single outcome, not two. The outcomes are (2, 6), (3, 5), (4, 4), (5, 3) and (6, 2).' }] },
              { label: '(b) A die is thrown 3 times. How many of the 6<sup>3</sup> = 216 sequences contain at least one six?', answer: '91', width: '5rem',
                wrong: [{ match: '108', msg: 'That is 3 · 36: a place for the six, then anything in the other two places. Sequences with two or three sixes are counted more than once. Use the complement: all sequences minus those with no six.' }, { match: '125', msg: 'That is the number with no six, 5³. The question asks for the rest.' }, { match: '75', msg: 'That is the number with exactly one six. "At least one" also includes the sequences with two or three sixes.' }] },
              { label: '(c) Two dice are thrown, and you are told that the sum is 10. The probability that both dice show 5 is now 1/<i>k</i>. What is <i>k</i>?', answer: '3', width: '5rem',
                wrong: [{ match: '2', msg: '(4, 6) and (6, 4) are two different outcomes, and (5, 5) is a third.' }, { match: '36', msg: 'That is the chance before you were told the sum. Given the sum, only the outcomes with sum 10 remain.' }] },
              { label: '(d) To the nearest whole percent, what is the chance that at least two of 30 people share a birthday? (Use the figure or the laboratory.)', answer: '71', re: /^(71|70\.6\d*)\s*%?$/, width: '5rem',
                wrong: [{ match: '29', msg: 'That is the chance that all thirty birthdays are different. The question asks for its complement.' }, { match: '8', msg: '30/365 is about 8%, but that only compares one birthday with thirty days. A match can be between any of the 435 pairs.' }] }
            ],
            hints: ['(a) List the pairs that add up to 8, remembering that (2, 6) and (6, 2) are different. (b) Count the sequences with no six first.', '(b) 216 − 5³. (c) The outcomes with sum 10 are (4, 6), (5, 5) and (6, 4). (d) Theorem 2 with n = 30: move the slider to 30, or change <code>people = 23</code> to 30 in the laboratory.'],
            solution: `<p>(a) (2, 6), (3, 5), (4, 4), (5, 3), (6, 2): <b>5</b> outcomes, so the probability is 5/36. (b) Complement: 216 − 5³ = 216 − 125 = <b>91</b>. (c) Given a sum of 10 the sample space shrinks to (4, 6), (5, 5), (6, 4), and one of the three has both dice 5, so the probability is 1/<b>3</b>. (d) 1 − (365 · 364 · … · 336)/365³⁰ ≈ 0.706, about <b>71</b>%.</p>`,
            followup: 'In (b), what is the probability as a fraction, and is it more or less than 1/2? How many throws of one die are needed before at least one six becomes more likely than not?'
          }
        },
        {
          ex: {
            id: 'ma-18-2', skill: 'probability', kind: 'choice', multi: true, title: 'Independent or not?',
            prompt: `<p>Which of these pairs of events are <em>independent</em>? Select every pair that is. The dice are fair, and for two dice the 36 ordered pairs are equally likely.</p>`,
            options: [
              { text: 'Two dice: "the first die shows 6" and "the second die shows 6".', ok: true },
              { text: 'One die: "the result is 6" and "the result is 1".', why: 'These are mutually exclusive: P(both) = 0, but P(6) · P(1) = 1/36. If one happens the other cannot, so knowing one changes everything about the other.' },
              { text: 'Two dice: "the sum is 7" and "the first die shows 6".', ok: true },
              { text: 'Two dice: "the sum is 12" and "the first die shows 6".', why: 'P(sum is 12) = 1/36 and P(first is 6) = 1/6, so the product is 1/216, but P(both) = 1/36, since (6, 6) is the only way to make 12. Knowing the first die is a 6 raises the chance of 12 from 1/36 to 1/6.' }
            ],
            hints: ['For each pair, find three numbers by counting among the 36 outcomes (or 6, for one die): P(E), P(F) and P(E and F).', 'Independent means P(E and F) = P(E) · P(F). For "the sum is 7" and "the first die shows 6", the only outcome in both is (6, 1).'],
            solution: `<p>The first and third pairs. First: P(both) = 1/36 = 1/6 · 1/6, the product rule for separate throws. Third: P(sum is 7) = 6/36 = 1/6 and P(first is 6) = 1/6, and the only outcome with both is (6, 1), so P(both) = 1/36 = 1/6 · 1/6. Knowing the first die gives no information about whether the sum is 7, because whatever the first die shows, exactly one face of the second die completes a 7.</p><p>The second pair is mutually exclusive, so dependent: 0 is not 1/36. The fourth is dependent: 1/36 is not 1/216.</p>`,
            followup: 'Is "the sum is 8" independent of "the first die shows 6"? What does 7 have that 8 does not?'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A sample space is the set of outcomes; an event is a subset; with equally likely outcomes, <i>P</i>(<i>E</i>) = |<i>E</i>| / |<i>S</i>|. Choose the sample space so that the outcomes really are equally likely: 36 ordered pairs, not 11 sums.</li>
<li><i>P</i>(not <i>E</i>) = 1 − <i>P</i>(<i>E</i>), the way to handle "at least one"; <i>P</i>(<i>E</i> or <i>F</i>) = <i>P</i>(<i>E</i>) + <i>P</i>(<i>F</i>) − <i>P</i>(<i>E</i> and <i>F</i>).</li>
<li>Independent: <i>P</i>(<i>E</i> and <i>F</i>) = <i>P</i>(<i>E</i>) · <i>P</i>(<i>F</i>), as for separate throws. Mutually exclusive events are not independent. <i>P</i>(<i>F</i> | <i>E</i>) shrinks the sample space to <i>E</i>.</li>
<li>Birthday problem: 23 people give an even chance of a match, because pairs grow like <i>n</i>²; <i>m</i> hash slots give a likely collision after about 1.18 √<i>m</i> keys.</li>
<li>A simulation checks an exact answer: it wobbles around it, and settles closer with more trials.</li>
<li>De Méré's answer: the dice were right and the rule of proportion was wrong. One six in 4 throws has probability 671/1296 ≈ 0.518, but a double six in 24 throws only 1 − (35/36)<sup>24</sup> ≈ 0.491, computed exactly with the complement and the product rule.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-10', '3B-AP-11', '3B-DA-07'], standard: 1,
      title: 'Expected value and algorithms that flip coins', summary: 'Random variables and expected value, linearity of expectation and the shuffle that leaves one card in place on average, waiting for a success, Monte Carlo and Las Vegas algorithms, and the randomized prime tests of Fermat and of Miller and Rabin that find the primes RSA needs.',
      blocks: [
        `<p>In 1946 the mathematician Stanislaw Ulam was recovering from an illness and passing the time with games of solitaire. He began to wonder what the chances are that a game of Canfield, a solitaire laid out with 52 cards, comes out. "After spending a lot of time trying to estimate them by pure combinatorial calculations," he recalled in 1983, "I wondered whether a more practical method than 'abstract thinking' might not be to lay it out say one hundred times and simply observe and count the number of successful plays." Fast electronic computers, just arriving, could do the dealing. Ulam described the idea to John von Neumann, and from 1947 it was put to work at Los Alamos on the paths of neutrons in nuclear weapons. Their colleague Nicholas Metropolis suggested its name, a suggestion, he wrote, "not unrelated to the fact that Stan had an uncle who would borrow money from relatives because he 'just had to go to Monte Carlo.'"</p>
<p>An answer found by dealing cards at random is an estimate: run it again and it changes, and it can be wrong. So when can an algorithm that flips coins be trusted? And what does it mean to say what a random process does "on average"?</p>`,
        `<p>Lesson 16 computed chances. This lesson computes averages of quantities that depend on chance, proves a theorem that makes such averages easy, and then puts coin flips inside algorithms on purpose, ending with the test that finds the primes Lesson 20's lock is made of.</p>
<h2>Expected value</h2>
<div class="stmt"><p><span class="kind">Definition.</span> A <em>random variable</em> is a number determined by the outcome of an experiment: formally, a function <i>X</i> from the sample space <i>S</i> to the numbers. When the outcomes are equally likely, the <em>expected value</em> of <i>X</i> is its average over all the outcomes:</p>
<p style="text-align:center">E[<i>X</i>] = (the sum of <i>X</i>(<i>s</i>) over all <i>s</i> in <i>S</i>) / |<i>S</i>|.</p></div>
<p>Grouping the outcomes by the value of <i>X</i> gives the same number in another form: E[<i>X</i>] is the sum of <i>x</i> · <i>P</i>(<i>X</i> = <i>x</i>) over the possible values <i>x</i>, each value weighted by its probability. For one throw of a die, E[<i>X</i>] = (1 + 2 + 3 + 4 + 5 + 6)/6 = 3.5.</p>
<p>Notice that 3.5 is not a value a die can show. The expected value is not a prediction of the next throw, and it need not be the most likely value. It is the long-run average: throw the die many times, and the average of the results settles near 3.5 (the law of large numbers again). A random variable can count anything: the sum of two dice, the number of sixes among them, the steps a program takes.</p>`,
        { play: `die = [1, 2, 3, 4, 5, 6]
print(sum(die) / len(die))

sums = [a + b for a in die for b in die]
print(sum(sums) / len(sums))

sixes = [(a == 6) + (b == 6) for a in die for b in die]
print(sum(sixes) / len(sixes))`, predict: true, caption: 'One die averages 3.5, and the sum of two dice 7.0. The last line is the expected number of sixes on two dice: (a == 6) is True or False, which Python adds as 1 or 0, and the 36 outcomes hold 12 sixes in all, so the average is 12/36 = 0.3333333333333333. Compare Lesson 16: the probability of at least one six was 11/36. The expected number is bigger because (6, 6) counts two sixes. Notice too that 7.0 = 3.5 + 3.5 and 1/3 = 1/6 + 1/6: the next section says why.' },
        { skill: 'expectation', check: "A raffle ticket wins $10 with probability 1/4 and nothing otherwise. What is the expected value of the ticket?", options: ["$2.50", "$0, because the ticket usually wins nothing", "$10, the prize"], answer: 0, why: "E = 10 · 1/4 + 0 · 3/4 = 2.50. Over many tickets the average payout settles near $2.50, though no single ticket pays that.", wrong: [null, "$0 is the most likely value, not the expected one. The expected value weights each value by its chance: 10 · 1/4 + 0 · 3/4.", "$10 is what a winning ticket pays, but three tickets in four pay nothing. Average over all the outcomes."] },
        `<h2>Linearity of expectation</h2>
<div class="stmt"><p><span class="kind">Theorem 1 (linearity of expectation).</span> For any random variables <i>X</i> and <i>Y</i> on the same sample space, and any number <i>c</i>, &nbsp;E[<i>X</i> + <i>Y</i>] = E[<i>X</i>] + E[<i>Y</i>] &nbsp;and&nbsp; E[<i>cX</i>] = <i>c</i> · E[<i>X</i>].</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> With equally likely outcomes, E[<i>X</i> + <i>Y</i>] is the sum of <i>X</i>(<i>s</i>) + <i>Y</i>(<i>s</i>) over all outcomes <i>s</i>, divided by |<i>S</i>|. Split it into the sum of the <i>X</i>(<i>s</i>) plus the sum of the <i>Y</i>(<i>s</i>), and divide each by |<i>S</i>|: that is E[<i>X</i>] + E[<i>Y</i>]. Taking <i>c</i> out of every term of the sum gives the second rule. <span class="qed">∎</span></p>
<p class="why">Look at what the proof does not use: it never asks whether <i>X</i> and <i>Y</i> are independent. Linearity holds for random variables that depend on each other completely, and that is what makes it so useful.</p></div>
<p>The usual way to use it is to split a complicated count into a sum of yes-or-no questions. The <em>indicator</em> of an event <i>E</i> is the random variable that is 1 when <i>E</i> happens and 0 when it does not, and its expected value is (1 · |<i>E</i>| + 0 · |<i>S</i> − <i>E</i>|)/|<i>S</i>| = <i>P</i>(<i>E</i>). The number of sixes on two dice is the indicator of "the first is a six" plus the indicator of "the second is a six", so its expected value is 1/6 + 1/6 = 1/3, as the program found by brute force.</p>
<details class="reveal"><summary>Guess first: shuffle 52 cards numbered 1 to 52. On average, how many cards end up in the position they started in? Would the answer be different for 10 cards?</summary><p>One card, whatever the number of cards. The theorem below proves it.</p></details>
<div class="stmt"><p><span class="kind">Theorem 2.</span> Put <i>n</i> cards, numbered 1 to <i>n</i>, in a random order, each of the <i>n</i>! orders equally likely. The expected number of cards in their own position (card <i>i</i> in position <i>i</i>) is 1.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Let <i>X<sub>i</sub></i> be the indicator of "card <i>i</i> is in position <i>i</i>". The orders that put card <i>i</i> there arrange the other <i>n</i> − 1 cards in any way, so there are (<i>n</i> − 1)! of them, and <i>P</i>(card <i>i</i> is in position <i>i</i>) = (<i>n</i> − 1)!/<i>n</i>! = 1/<i>n</i>. The number of cards in their own position is <i>X</i><sub>1</sub> + … + <i>X<sub>n</sub></i>, so by linearity its expected value is <i>n</i> · 1/<i>n</i> = 1. <span class="qed">∎</span></p></div>
<p>The indicators here are far from independent: if cards 1 to <i>n</i> − 1 are all in place, card <i>n</i> must be too. Linearity does not care. Finding the chance of each possible count is much harder; the expected value took three lines.</p>`,
        { play: `from itertools import permutations

n = 4
orders = list(permutations(range(n)))
total = 0
counts = [0] * (n + 1)
for order in orders:
    fixed = sum(1 for i in range(n) if order[i] == i)
    total += fixed
    counts[fixed] += 1

print(len(orders), "orders,", total, "cards in place in all")
print("average:", total / len(orders))
print("orders with 0, 1, ..., n cards in place:", counts)`, predict: true, caption: 'All 24 orders of 4 cards hold 24 cards in place between them, so the average is 1.0, as Theorem 2 says. The last line is the whole distribution: 9 orders leave no card in place, 8 leave one, 6 leave two, none leaves exactly three (if three cards are in place, so is the fourth) and 1 leaves all four. The most likely count is 0, yet the expected count is 1. Change n to 5 or 6 and predict the average before running.' },
        { skill: 'expectation', check: "What does linearity of expectation, E[X + Y] = E[X] + E[Y], require of X and Y?", options: ["They must be independent", "Nothing: it holds for any two random variables on the same sample space", "They must have the same expected value"], answer: 1, why: "The proof only splits one sum into two. That is why linearity works even for dependent variables, such as the cards of a shuffle.", wrong: ["The proof never asks about independence. In the shuffle the indicators depend on each other, and the theorem still gives the right answer, 1.", null, "Nothing of the kind is needed: the number of sixes plus the sum of two dice is a perfectly good X + Y, with expected value 1/3 + 7."] },
        `<h2>Monte Carlo and Las Vegas</h2>
<p>Some algorithms flip coins on purpose; in Python, <code>random</code> flips them. Randomness can buy speed, or protection against unlucky inputs, and it comes in two kinds.</p>
<div class="stmt"><p><span class="kind">Definition.</span> A <em>Monte Carlo</em> algorithm does a set amount of work, but its answer may be wrong, with a probability that can be bounded. A <em>Las Vegas</em> algorithm always gives a correct answer, but the number of steps it takes depends on its coin flips, so we judge it by its <em>expected</em> number of steps.</p></div>
<p>Ulam's hundred games of solitaire are Monte Carlo: a fixed amount of work, and an estimate that may be off. So is Lesson 16's simulation of birthdays. For a Las Vegas example, suppose half the entries of a list of <i>n</i> are 1 and half are 0, and we want the position of some 1. Scanning from the left can take <i>n</i>/2 + 1 looks, if the list happens to start with all its 0s. Looking at random positions until a 1 turns up is never wrong, and each look succeeds with probability 1/2, however the list is arranged. How many looks does it take on average?</p>
<div class="stmt"><p><span class="kind">Theorem 3 (waiting for a success).</span> If each try succeeds with probability <i>p</i> &gt; 0, independently of the others, then the expected number of tries, up to and including the first success, is 1/<i>p</i>.</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> Let <i>W</i> be the expected number of tries. The first try is always made. With probability <i>p</i> it succeeds and we stop; with probability 1 − <i>p</i> it fails, and then, since the tries are independent, we are exactly where we started and expect <i>W</i> more tries. So <i>W</i> = 1 + (1 − <i>p</i>)<i>W</i>. Subtracting (1 − <i>p</i>)<i>W</i> from both sides gives <i>pW</i> = 1, so <i>W</i> = 1/<i>p</i>. <span class="qed">∎</span></p>
<p class="why">The subtraction is allowed only if <i>W</i> is a finite number. It is, but showing it needs a sum of infinitely many terms, the kind of geometric sum that Lesson 18 starts on; here we take it on trust.</p></div>
<p>So the random search finds a 1 in 2 looks on average, whatever <i>n</i> is and however the list is arranged, and a die needs 6 throws on average to show a six.</p>
<details class="reveal"><summary>Guess first: you throw a die until a six appears. Is 6 throws the most likely number?</summary><p>No. The most likely number is 1 throw, with probability 1/6; 2 throws has probability 5/6 · 1/6, a little less, and each later number is less likely still. The average is 6 because a few long waits pull it up. Expected is not the same as most likely, again.</p></details>
<h2>A test for primes that flips coins</h2>
<p>Lesson 4's trial division takes about √<i>n</i> steps, hopeless for the 300-digit primes of Lesson 20. A much faster test starts from a theorem that Pierre de Fermat stated in a letter of 1640, without a proof; Leonhard Euler gave the first published proof, read to the St Petersburg Academy in 1736.</p>
<div class="stmt"><p><span class="kind">Theorem 4 (Fermat's little theorem).</span> If <i>p</i> is prime and <i>p</i> does not divide <i>a</i>, then <i>a</i><sup><i>p</i> − 1</sup> ≡ 1 (mod <i>p</i>).</p></div>
<p>This course does not prove it; Lesson 20 uses it too. Read as its contrapositive (Lesson 1), it is a test: if 1 &lt; <i>a</i> &lt; <i>n</i> and <i>a</i><sup><i>n</i> − 1</sup> mod <i>n</i> is not 1, then <i>n</i> is not prime. Such an <i>a</i> is a <em>witness</em> that <i>n</i> is composite, and it proves it without finding a factor: 2<sup>90</sup> mod 91 = 64, so 91 is composite, though the test says nothing about 7 or 13. With Lesson 4's repeated squaring the power takes about log<sub>2</sub> <i>n</i> passes, so the test is fast even for numbers with hundreds of digits.</p>`,
        `<p>The trouble is the other direction. A composite number can pass: 2<sup>340</sup> ≡ 1 (mod 341), although 341 = 11 · 31. A base that lets a composite number pass is called a <em>liar</em>. Choosing the base at random helps (3<sup>340</sup> mod 341 = 56 exposes 341 at once), but for some numbers almost every base is a liar. A <em>Carmichael number</em> is a composite <i>n</i> with <i>a</i><sup><i>n</i> − 1</sup> ≡ 1 (mod <i>n</i>) for every <i>a</i> that shares no factor with <i>n</i>. The smallest is 561 = 3 · 11 · 17. Václav Šimerka listed it, with the next six, in 1885, in a Czech journal, where it went largely unnoticed; the numbers are named after Robert Carmichael, who published 561 in 1910. In 1994 Alford, Granville and Pomerance proved that there are infinitely many. For 561 the liars are the 320 bases that share no factor with it, more than half of the 560. The other 240 expose it only by sharing a factor, and they are common here because 561 has the small factor 3. For a Carmichael number whose prime factors are all large, such as 652969351 = 271 · 811 · 2971, more than 99% of the bases are liars, and finding one that is not is no easier than stumbling on a factor.</p>
<details class="reveal"><summary>Guess first: 2<sup>560</sup> mod 561 is 1. Does that make 561 prime?</summary><p>No: 561 = 3 · 11 · 17. Only a result <em>other</em> than 1 proves anything, and what it proves is that <i>n</i> is composite. A result of 1 is evidence, not proof, and for a Carmichael number it is no evidence at all.</p></details>
<h2>The Miller–Rabin test</h2>
<p>The repair looks at the squarings on the way to <i>a</i><sup><i>n</i> − 1</sup>. It rests on one fact about primes: if <i>p</i> is prime and <i>x</i><sup>2</sup> ≡ 1 (mod <i>p</i>), then <i>x</i> ≡ 1 or <i>x</i> ≡ −1 (mod <i>p</i>). The reason is that <i>p</i> divides <i>x</i><sup>2</sup> − 1 = (<i>x</i> − 1)(<i>x</i> + 1), and a prime that divides a product divides one of its factors (Proposition 30 of Book VII of Euclid's <i>Elements</i>, not proved in this course). Modulo <i>n</i>, −1 is <i>n</i> − 1.</p>
<div class="stmt"><p><span class="kind">The Miller–Rabin test.</span> Let <i>n</i> be odd, and write <i>n</i> − 1 = 2<sup><i>s</i></sup> · <i>d</i> with <i>d</i> odd. For a base <i>a</i>, compute <i>x</i> = <i>a</i><sup><i>d</i></sup> mod <i>n</i>, then square it <i>s</i> − 1 times, mod <i>n</i>, which gives <i>s</i> numbers in all. If the first number is 1, or any of the <i>s</i> numbers is <i>n</i> − 1, the base <em>passes</em>. Otherwise <i>a</i> is a <em>strong witness</em>, and <i>n</i> is certainly composite.</p></div>
<p>Why a prime always passes: one more squaring after the last number gives <i>a</i><sup><i>n</i> − 1</sup>, which is 1 by Fermat. Walk backwards from that 1. Each number is a square root of the next, so whenever a number is 1, the one before it is 1 or −1. Either the numbers are 1 all the way back to the first, or a −1 appears somewhere. A composite <i>n</i> has no such protection. Take 561 and <i>a</i> = 2: 560 = 2<sup>4</sup> · 35, and the four numbers are 2<sup>35</sup>, 2<sup>70</sup>, 2<sup>140</sup> and 2<sup>280</sup> mod 561, which are 263, 166, 67 and 1. The first is not 1 and none is 560, so 2 is a strong witness. Indeed 67<sup>2</sup> ≡ 1 (mod 561), and 67 is a square root of 1 other than 1 and −1, which no prime allows. The Carmichael number is caught.</p>
<details class="reveal"><summary>Guess first: for an odd composite number, what share of the bases from 1 to <i>n</i> − 1 can pass the Miller–Rabin test? Half? More than half, as for Fermat's test and 561?</summary><p>At most a quarter, whatever the composite number, by the theorem below. For 561, only 10 of the 560 bases pass, where 320 passed Fermat's test.</p></details>
<div class="stmt"><p><span class="kind">Theorem 5 (Rabin, 1980).</span> If <i>n</i> is odd and composite, at most a quarter of the numbers <i>a</i> from 1 to <i>n</i> − 1 pass the Miller–Rabin test.</p></div>
<p>The proof is beyond this course. What it gives is a Monte Carlo algorithm with a guarantee. Choose <i>k</i> bases at random, independently. If any of them is a strong witness, answer "composite", and that answer is never wrong. If all pass, answer "probably prime". A composite <i>n</i> passes all <i>k</i> rounds with probability at most (1/4)<sup><i>k</i></sup>, by independence: about one in a million after 10 rounds, less than one in 10<sup>12</sup> after 20. No composite number fools this test the way 561 fools Fermat's.</p>
<p>Gary Miller published the test in 1976 without coins: his version tries every base up to a certain limit, and he proved it correct provided a famous unproved conjecture, the extended Riemann hypothesis, is true. Michael Rabin chose the bases at random instead and proved Theorem 5, so his version needs no conjecture. In his 1980 paper Rabin reports that Vaughan Pratt programmed the test, and that their searches asserted 2<sup>400</sup> − 593 to be the largest prime below 2<sup>400</sup>. The program below runs the same test.</p>`,
        { play: `import random
random.seed(1)

def witness(a, n):          # True means a proves that n is composite
    d, s = n - 1, 0
    while d % 2 == 0:
        d, s = d // 2, s + 1
    x = pow(a, d, n)
    if x == 1 or x == n - 1:
        return False
    for r in range(s - 1):
        x = x * x % n
        if x == n - 1:
            return False
    return True

def random_base(n):         # every number from 2 to n - 2 equally likely
    a = int("".join(random.choice("0123456789") for digit in str(n)))
    return a if 2 <= a <= n - 2 else random_base(n)

def probably_prime(n, rounds=20):
    return not any(witness(random_base(n), n) for k in range(rounds))

print(pow(2, 560, 561), witness(2, 561))
print([probably_prime(n) for n in [341, 561, 2 ** 400 - 593, 2 ** 400 - 591]])`, predict: true, caption: 'The first line is 1 True: Fermat\u2019s test with base 2 is fooled by 561, but the squarings expose it. The list says False for 341 and for 561, both composite; True for 2\u2074\u2070\u2070 \u2212 593, the prime of Rabin and Pratt, a number with 121 digits; and False for 2\u2074\u2070\u2070 \u2212 591, which is composite. random_base builds a random base digit by digit and starts again if it is out of range, so every base from 2 to n \u2212 2 is equally likely, as Theorem 5 needs. Each answer took at most 20 powers of about 400 squarings each, where trial division would need about 10\u2076\u2070 steps. Try other numbers: 2 ** 61 - 1 is prime, 2 ** 67 - 1 is not.' },
        { skill: 'randomized', check: "A number has passed 50 rounds of Miller–Rabin with random bases. Which statement is correct?", options: ["The number is prime with probability at least 1 − 4⁻⁵⁰", "If it were composite, the chance of passing all 50 rounds would be at most 4⁻⁵⁰", "The number is certainly prime"], answer: 1, why: "The probability is about the test's coin flips, not about the number. Used on any numbers at all, the test is wrong at most once in 4⁵⁰ uses on average.", wrong: ["Rabin himself warned against this reading: \"Such an interpretation is nonsensical since n is either prime or not.\" A number has no probability of being prime; the bound is on how often the test errs.", null, "Miller–Rabin is a Monte Carlo algorithm: a \"composite\" answer is certain, but \"prime\" can be wrong, with a chance that 50 rounds make tiny but not zero."] },
        `<p>Rabin's paper makes the same point: a number that passes 50 rounds is not "prime with probability 1 − 4<sup>−50</sup>". "Such an interpretation is nonsensical since <i>n</i> is either prime or not." What is true is that, whatever numbers it is used on, the test makes a mistake on average at most once in every 4<sup>50</sup> uses.</p>
<h2>Where the primes come from</h2>
<p>RSA needs two random primes of about 300 digits each. The recipe is a Las Vegas search wrapped round a Monte Carlo test: choose a random odd number of the right size, run Miller–Rabin on it, and if it fails, choose again. How long is the wait? Near a number <i>N</i>, roughly one number in ln <i>N</i> is prime (the prime number theorem, proved in 1896, also beyond this course), and ln 10<sup>300</sup> ≈ 691. Among odd numbers the share is twice as large, about one in 345. By Theorem 3 the search expects about 345 tries, and almost every composite is thrown out by its very first base. Rabin's paper describes a search of this kind, though it starts from one random number and tests the odd numbers after it in turn.</p>
<h2>Before the exercises</h2>
<p>The first exercise asks for expected values and for the arithmetic of the tests. For an expected value, either average over equally likely outcomes or split the count into indicators and use linearity; for a wait, use Theorem 3. The second asks you to write a function that counts Fermat's liars, so you can see for yourself how few witnesses a Carmichael number has.</p>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Reading the expected value as the most likely value, or as a value that must be possible. Believing that linearity needs independence. Thinking a Monte Carlo answer is always right, or that a Las Vegas algorithm can be wrong. Treating Fermat's test as a proof of primality: passing it proves nothing, and Carmichael numbers pass it for every base that shares no factor with them, which for most of them is almost every base. Reading "wrong with probability at most 4<sup>−<i>k</i></sup>" as "prime with probability 1 − 4<sup>−<i>k</i></sup>". Forgetting that the bases must be chosen at random: a fixed list of bases can be beaten by a number built against it.</p>` },
        {
          ex: {
            id: 'ma-19-1', skill: ['expectation', 'randomized'], kind: 'answer', title: 'Averages and witnesses',
            prompt: `<p>Answer each with a single number.</p>`,
            parts: [
              { label: '(a) An eight-sided die has faces numbered 1 to 8. What is the expected value of one throw?', answer: '4.5', width: '5rem',
                wrong: [{ match: ['4', '5'], msg: 'No face is in the exact middle. Average over all eight faces: (1 + 2 + … + 8)/8 = 36/8.' }, { match: '36', msg: 'That is the sum of the faces. Divide by the number of faces.' }] },
              { label: '(b) Thirty tests are handed back at random, one to each of the 30 students who wrote them. What is the expected number of students who get their own test back?', answer: '1', width: '5rem',
                wrong: [{ match: '0', msg: 'Often nobody gets their own test, but sometimes one, two or more students do. The average, by linearity, is 30 · 1/30.' }, { match: '15', msg: 'Each student has a 1-in-30 chance of getting their own test, not a 1-in-2 chance.' }, { match: '30', msg: 'That would need every test to come back to its owner, which is one order out of 30!.' }] },
              { label: '(c) A fair coin is tossed until the first head. What is the expected number of tosses, counting the one that shows the head?', answer: '2', width: '5rem',
                wrong: [{ match: '1', msg: 'One toss is the most likely number, but sometimes the wait is longer. By Theorem 3 the expected number is 1/p with p = 1/2.' }, { match: '0.5', msg: 'That is the probability of a head on each toss. The expected number of tosses is 1 divided by it.' }] },
              { label: '(d) Compute 2<sup>14</sup> mod 15. (If it is not 1, Fermat’s test has proved 15 composite.)', answer: '4', width: '5rem',
                wrong: [{ match: '1', msg: '2⁴ = 16 ≡ 1 (mod 15), but 14 is not a multiple of 4: 2¹⁴ = (2⁴)³ · 2².' }, { match: '16384', msg: 'That is 2¹⁴ itself. Take the remainder after dividing by 15.' }] },
              { label: '(e) A composite number is tested with 10 rounds of Miller–Rabin, each with an independent random base. Its chance of passing all 10 rounds is at most 1 in how many?', answer: '1048576', width: '8rem',
                wrong: [{ match: '1024', msg: 'That is 2¹⁰, as if each round let a composite through half the time. Theorem 5 says at most a quarter: (1/4)¹⁰.' }, { match: '40', msg: 'Independent rounds multiply their chances: (1/4)¹⁰, not 10 · 4.' }] }
            ],
            hints: ['(a) Average the faces. (b) Split the count into one indicator per student, each with probability 1/30. (c) Theorem 3.', '(d) 2⁴ = 16 ≡ 1 (mod 15), so 2¹² ≡ 1 and 2¹⁴ ≡ 2². (e) (1/4)¹⁰ = 1/4¹⁰, and 4¹⁰ = 2²⁰.'],
            solution: `<p>(a) 36/8 = <b>4.5</b>. (b) Each student gets their own test with probability 1/30, so by linearity the expected number is 30 · 1/30 = <b>1</b>, as in Theorem 2. (c) By Theorem 3 with <i>p</i> = 1/2: <b>2</b>. (d) 2⁴ = 16 ≡ 1, so 2¹⁴ = (2⁴)³ · 2² ≡ 4: the answer is <b>4</b>, which is not 1, so 15 is composite. (e) (1/4)¹⁰ = 1/1 048 576: at most 1 in <b>1048576</b>.</p>`,
            followup: 'In (b), the chance that nobody gets their own test back is very close to 1/e ≈ 0.368 for any class larger than a few students. Use the laboratory’s program to find the share of the 720 orders of 6 cards that leave no card in place.'
          }
        },
        {
          ex: {
            id: 'ma-19-2', skill: 'randomized', title: 'Count the liars',
            prompt: `<p>Write <code>fermat_liars(n)</code>. It returns how many of the numbers <code>a</code> from 1 to <code>n − 1</code> satisfy <code>pow(a, n - 1, n) == 1</code>, that is, how many bases Fermat's test would let pass. For a prime, every base passes, so <code>fermat_liars(13)</code> is <code>12</code>. For the composite 15 only four do, so <code>fermat_liars(15)</code> is <code>4</code>.</p>
<p>Then try it on 341 and on the Carmichael number 561, and compare with <i>n</i> − 1.</p>`,
            starter: `def fermat_liars(n):\n    count = 0\n    # for each a from 1 to n - 1, add 1 to count if pow(a, n - 1, n) is 1\n    return count`,
            solution: `def fermat_liars(n):\n    count = 0\n    for a in range(1, n):\n        if pow(a, n - 1, n) == 1:\n            count += 1\n    return count`,
            tests: [{ call: 'fermat_liars(13)', expect: '12' }, { call: 'fermat_liars(15)', expect: '4' }, { call: 'fermat_liars(91)', expect: '36' }, { call: 'fermat_liars(341)', expect: '100' }, { call: 'fermat_liars(561)', expect: '320' }],
            hints: ['Loop with for a in range(1, n): that gives 1, 2, ..., n - 1.', 'Inside the loop: if pow(a, n - 1, n) == 1: count += 1. Return count after the loop, not inside it.'],
            failTip: 'If fermat_liars(13) gives 11 or 13, check the range: it must run from 1 to n - 1, which is range(1, n).',
            followup: 'For 561 the answer is 320, and 320 is exactly how many numbers below 561 share no factor with it: every base that could expose it by Fermat’s test shares a factor. Now count strong liars instead, with the witness function from the laboratory: how many bases from 1 to 560 pass Miller–Rabin for 561? Is it under a quarter of 560?'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A random variable is a number determined by the outcome; its expected value is its average over equally likely outcomes, the sum of each value times its probability. It need not be a possible value, or the most likely one.</li>
<li>Linearity: E[<i>X</i> + <i>Y</i>] = E[<i>X</i>] + E[<i>Y</i>] always, with no independence needed. Split a count into indicators: a random shuffle leaves 1 card in place on average, for any number of cards.</li>
<li>Waiting for a success of probability <i>p</i> takes 1/<i>p</i> tries on average.</li>
<li>Monte Carlo: bounded time, a small chance of a wrong answer. Las Vegas: always right, with a random running time judged by its expectation.</li>
<li>Fermat's test proves compositeness but is fooled by liars, and by a Carmichael number for every base that shares no factor with it. Miller–Rabin also checks the square roots of 1; a composite passes a random base with probability at most 1/4, so <i>k</i> rounds err with probability at most 4<sup>−<i>k</i></sup>.</li>
<li>So an algorithm that flips coins can be trusted when its error is bounded and can be made as small as we like by repeating it, and "on average" means the expected value. Large primes for RSA come from a Las Vegas search around a Monte Carlo test, about 345 tries for 300 digits.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-11', '3B-AP-13', '9.2.4.7', '9.3.7.4'], standard: 1,
      title: 'Sums and recurrences', summary: 'Adding a long list of numbers in one step: arithmetic and geometric sums, proved two ways; recurrences read off from recursive programs and turned into sums; merge sort’s n log₂ n by unrolling; and how fast the Fibonacci numbers grow.',
      blocks: [
        `<p>In 1856, a year after the death of Carl Friedrich Gauss, Wolfgang Sartorius von Waltershausen, a professor at Göttingen, Gauss's university, published a memoir of him. It tells how Gauss, after his seventh birthday in 1784, went to a school in Braunschweig kept by a man named Büttner, and how, two years later, on reaching the arithmetic class, he was set the summing of an arithmetic series. The problem was barely stated before Gauss threw his slate on the table with the words "There it lies," and at the end of the hour his answer was right, while many of the others were wrong. That is almost all the memoir says.</p>
<p>The story has been retold ever since. In 2006 the writer Brian Hayes collected more than a hundred versions, in eight languages, for <i>American Scientist</i>. Most say the numbers were 1 to 100, though others give 1 to 50, 1 to 1,000 or another series, and many explain a trick of pairing the numbers. But Sartorius names no numbers and no trick, and in Hayes's survey the numbers 1 to 100 first appear in 1938, more than eighty years later. So the details are a legend. The mathematics is not: how can anyone add a long run of numbers without adding them one by one? And what about the sums nobody writes down, such as the steps of a program that calls itself?</p>`,
        `<p>Lesson 3 proved one sum, 1 + 2 + … + <i>n</i> = <i>n</i>(<i>n</i> + 1)/2, by induction, and one recurrence, the Tower of Hanoi's <i>M</i>(<i>n</i>) = 2<i>M</i>(<i>n</i> − 1) + 1. Induction checks a formula once you have it; it does not tell you where the formula came from. This lesson finds such formulas, called <em>closed forms</em>, for the two kinds of sum that turn up most in computing, and then shows that a recursive program's running time is a recurrence that unrolls into one of those sums.</p>
<h2>Arithmetic sums</h2>
<div class="stmt"><p><span class="kind">Definition.</span> An <em>arithmetic sequence</em> is one in which each term is the previous term plus the same number <i>d</i>: <i>a</i>, <i>a</i> + <i>d</i>, <i>a</i> + 2<i>d</i>, …, <i>a</i> + (<i>n</i> − 1)<i>d</i>. Its sum is an <em>arithmetic sum</em> (the old name is an arithmetic series).</p></div>
<details class="reveal"><summary>Guess first: which of these are arithmetic sequences? 3, 7, 11, 15; &nbsp;1, 2, 4, 8; &nbsp;10, 7, 4, 1.</summary><p>The first, with <i>d</i> = 4, and the third, with <i>d</i> = −3: the step may be negative. The second is not, since its steps are 1, 2 and 4; each term is twice the one before, which makes it geometric, the second half of this section.</p></details>
<div class="stmt"><p><span class="kind">Theorem 1.</span> The sum of the <i>n</i> terms of an arithmetic sequence is <i>n</i>(first + last)/2.</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> Write the sum <i>S</i> twice, once forwards and once backwards, and add the two lines column by column:</p>
<p style="text-align:center"><i>S</i> = <i>a</i> + (<i>a</i> + <i>d</i>) + … + (<i>a</i> + (<i>n</i> − 1)<i>d</i>)<br><i>S</i> = (<i>a</i> + (<i>n</i> − 1)<i>d</i>) + (<i>a</i> + (<i>n</i> − 2)<i>d</i>) + … + <i>a</i></p>
<p>Every column adds up to the same number, 2<i>a</i> + (<i>n</i> − 1)<i>d</i>, which is first + last. There are <i>n</i> columns, so 2<i>S</i> = <i>n</i>(first + last). Divide by 2. <span class="qed">∎</span></p>
<p class="why">Why every column is the same: moving one column to the right adds <i>d</i> to the top term and takes <i>d</i> from the bottom term, so their total never changes. This is the pairing trick the legend gives Gauss, written so that it works for an odd number of terms too.</p></div>
<p>With first term 1, last term <i>n</i> and <i>n</i> terms it gives Lesson 3's <i>n</i>(<i>n</i> + 1)/2, so 1 + 2 + … + 100 = 100 · 101/2 = 5050. To use it you need three things: the first term, the last term, and the number of terms, which is (last − first)/<i>d</i> + 1. Counting the terms is where most mistakes are made.</p>`,
        { play: `def arithmetic_sum(first, last, n):
    return n * (first + last) // 2

print(sum(range(1, 101)), arithmetic_sum(1, 100, 100))
print(sum(range(1, 200, 2)), arithmetic_sum(1, 199, 100))
print(sum(range(7, 100, 4)), arithmetic_sum(7, 99, 24))`, predict: true, caption: 'Each line adds the terms one by one with sum, then uses Theorem 1. 1 to 100: 5050 both ways. The odd numbers 1, 3, …, 199, a hundred of them: 10000 = 100², the formula that Checkpoint one proved by induction. 7, 11, …, 99: (99 − 7)/4 + 1 = 24 terms, and 24 · 106/2 = 1272. Change the 24 to 23, the most common slip, and the two answers disagree.' },
        { skill: 'sums', check: "What is 2 + 4 + 6 + … + 100?", options: ["2550", "5050", "2500"], answer: 0, why: "50 terms, first 2, last 100: 50 · 102/2 = 2550. It is also twice 1 + 2 + … + 50 = 1275.", wrong: [null, "That is 1 + 2 + … + 100. Only the even numbers are added here: 50 terms, not 100.", "That is 50², the sum of the first 50 odd numbers, 1 + 3 + … + 99. Each even number is one more than the odd number before it, so the even sum is 50 more."] },
        `<h2>Geometric sums</h2>
<div class="stmt"><p><span class="kind">Definition.</span> A <em>geometric sequence</em> is one in which each term is the previous term times the same number <i>r</i>: 1, <i>r</i>, <i>r</i><sup>2</sup>, …, <i>r</i><sup><i>n</i> − 1</sup>.</p></div>
<div class="stmt"><p><span class="kind">Theorem 2.</span> If <i>r</i> ≠ 1, then 1 + <i>r</i> + <i>r</i><sup>2</sup> + … + <i>r</i><sup><i>n</i> − 1</sup> = (<i>r</i><sup><i>n</i></sup> − 1)/(<i>r</i> − 1).</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> Let <i>S</i> = 1 + <i>r</i> + … + <i>r</i><sup><i>n</i> − 1</sup>. Multiplying by <i>r</i> moves every term one place along: <i>rS</i> = <i>r</i> + <i>r</i><sup>2</sup> + … + <i>r</i><sup><i>n</i></sup>. Subtract the first equation from the second. Every term from <i>r</i> to <i>r</i><sup><i>n</i> − 1</sup> appears in both and cancels, leaving <i>rS</i> − <i>S</i> = <i>r</i><sup><i>n</i></sup> − 1. So (<i>r</i> − 1)<i>S</i> = <i>r</i><sup><i>n</i></sup> − 1, and since <i>r</i> − 1 ≠ 0 we may divide by it. <span class="qed">∎</span></p>
<p class="why">The idea is the same as Theorem 1's: find a second copy of the sum that lines up with the first, so that almost everything cancels or matches. Here the copy is shifted by one term instead of reversed.</p></div>
<details class="reveal"><summary>Try it: check Theorem 2 by induction, as Lesson 3 would.</summary><p>Let <i>P</i>(<i>n</i>) be the formula for <i>n</i> terms. Base case <i>n</i> = 1: the sum is 1, and (<i>r</i> − 1)/(<i>r</i> − 1) = 1. Step: assume <i>P</i>(<i>n</i>). Adding the next term, <i>r</i><sup><i>n</i></sup>, gives (<i>r</i><sup><i>n</i></sup> − 1)/(<i>r</i> − 1) + <i>r</i><sup><i>n</i></sup> = (<i>r</i><sup><i>n</i></sup> − 1 + <i>r</i><sup><i>n</i> + 1</sup> − <i>r</i><sup><i>n</i></sup>)/(<i>r</i> − 1) = (<i>r</i><sup><i>n</i> + 1</sup> − 1)/(<i>r</i> − 1), which is <i>P</i>(<i>n</i> + 1). ∎ The proof above found the formula; this one checks it. Both are proofs.</p></details>
<p>Two cases matter most in computing. With <i>r</i> = 2: 1 + 2 + 4 + … + 2<sup><i>n</i> − 1</sup> = 2<sup><i>n</i></sup> − 1. That is the rice on Lesson 13's chessboard, 2<sup>64</sup> − 1 grains, and the Tower of Hanoi's moves. Each term is one more than the sum of all the terms before it, so the last term alone is more than half the total. With <i>r</i> = 1/2 the terms shrink, and the sum stays below a fixed bound however many terms there are: 1 + 1/2 + 1/4 + … + 1/2<sup><i>n</i> − 1</sup> = 2 − 1/2<sup><i>n</i> − 1</sup> &lt; 2. So work that halves at every stage, <i>n</i> + <i>n</i>/2 + <i>n</i>/4 + …, never adds up to more than 2<i>n</i>: the first stage costs at least half of everything.</p>
<p>Here is that fact at work. A list stored in a block of memory must sometimes move to a bigger block when it fills up, copying every item it holds. If the new block is always twice as big, the copies made while appending <i>n</i> items add up to a geometric sum.</p>`,
        { play: `capacity = 1
size = 0
copies = 0
for item in range(1000):
    if size == capacity:        # full: move everything to a block twice as big
        copies += size
        capacity *= 2
    size += 1

print(size, "appends,", copies, "copies, capacity", capacity)
print("1 + 2 + 4 + ... + 512 =", 2 ** 10 - 1)`, predict: true, caption: 'The list moves when it holds 1, 2, 4, …, 512 items, so the copies are 1 + 2 + 4 + … + 512 = 2¹⁰ − 1 = 1023, and the capacity ends at 1024: "1000 appends, 1023 copies, capacity 1024". Fewer than two copies per append (here about one), however many appends. Change the doubling to capacity += 10, a block only 10 bigger each time, and predict whether the copies grow like n or like n². SC 107 builds this kind of list.' },
        { skill: 'sums', check: "What is 1 + 3 + 9 + 27 + 81 + 243?", options: ["364", "729", "243"], answer: 0, why: "Theorem 2 with r = 3 and 6 terms: (3⁶ − 1)/(3 − 1) = 728/2 = 364.", wrong: [null, "That is 3⁶, the next term. The formula subtracts 1 and divides by r − 1 = 2: (729 − 1)/2.", "That is the last term only. When r = 2 the last term is just over half the sum; when r = 3 it is about two thirds, but the other terms still count."] },
        `<h2>Recurrences from programs</h2>
<p>A recursive function's cost obeys a recurrence: the cost for input size <i>n</i> is the cost of its recursive calls plus the work it does itself. Read the recurrence off the code, then <em>unroll</em> it: substitute the rule into itself until the pattern shows, and the recurrence becomes a sum. Take a function that does one step and then calls itself on <i>n</i> − 1 items, such as a recursive search of a list. Its cost satisfies <i>T</i>(0) = 0 and <i>T</i>(<i>n</i>) = <i>T</i>(<i>n</i> − 1) + 1, and unrolling gives 1 + 1 + … + 1 = <i>n</i>. If instead it does <i>n</i> steps before calling itself on <i>n</i> − 1 items, as selection sort does when it scans for the smallest item and then sorts the rest, then</p>
<p style="text-align:center"><i>T</i>(<i>n</i>) = <i>T</i>(<i>n</i> − 1) + <i>n</i> = <i>T</i>(<i>n</i> − 2) + (<i>n</i> − 1) + <i>n</i> = … = 1 + 2 + … + <i>n</i> = <i>n</i>(<i>n</i> + 1)/2,</p>
<p>an arithmetic sum, so O(<i>n</i><sup>2</sup>). The Tower of Hanoi's <i>M</i>(<i>n</i>) = 2<i>M</i>(<i>n</i> − 1) + 1 unrolls to 1 + 2 + 4 + … + 2<sup><i>n</i> − 1</sup>, a geometric sum, and that is where Lesson 3's 2<sup><i>n</i></sup> − 1 comes from.</p>
<p><b>Merge sort</b> sorts a list by sorting each half (two recursive calls on <i>n</i>/2 items) and then merging the two sorted halves into one, which takes about <i>n</i> steps. A list of one item is already sorted. Counting <i>n</i> steps for each merge, and taking <i>n</i> to be a power of 2 so that the halves come out even,</p>
<p style="text-align:center"><i>T</i>(1) = 0, &nbsp;&nbsp; <i>T</i>(<i>n</i>) = 2<i>T</i>(<i>n</i>/2) + <i>n</i>.</p>
<p>Picture the calls as a tree. The top call does <i>n</i> steps of merging. Its two calls do <i>n</i>/2 each, which is <i>n</i> again. Their four calls do <i>n</i>/4 each: <i>n</i> again. Every level of the tree adds up to <i>n</i>, and there are log<sub>2</sub> <i>n</i> levels of merging before the sizes reach 1. Step through the figure, then switch to the other recurrences, whose levels add up to a constant sum or to a geometric one.</p>`,
        { fig: 'rectree', kind: 'merge', n: 16, caption: 'Each box is one call, labelled with the steps it does outside its own recursive calls; the right-hand column adds up each level. For merge sort every level adds up to n, and there are log₂ n of them. For binary search every level costs 1; for the other two the levels make a geometric sum.' },
        `<div class="stmt"><p><span class="kind">Theorem 3.</span> If <i>T</i>(1) = 0 and <i>T</i>(<i>n</i>) = 2<i>T</i>(<i>n</i>/2) + <i>n</i>, then <i>T</i>(<i>n</i>) = <i>n</i> log<sub>2</sub> <i>n</i> for every <i>n</i> that is a power of 2.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Write <i>n</i> = 2<sup><i>k</i></sup>, so log<sub>2</sub> <i>n</i> = <i>k</i>, and prove <i>P</i>(<i>k</i>): <i>T</i>(2<sup><i>k</i></sup>) = <i>k</i> · 2<sup><i>k</i></sup>, by induction on <i>k</i>. <b>Base case.</b> <i>T</i>(2<sup>0</sup>) = <i>T</i>(1) = 0 = 0 · 2<sup>0</sup>. <b>Inductive step.</b> Assume <i>T</i>(2<sup><i>k</i></sup>) = <i>k</i> · 2<sup><i>k</i></sup>. Then <i>T</i>(2<sup><i>k</i> + 1</sup>) = 2<i>T</i>(2<sup><i>k</i></sup>) + 2<sup><i>k</i> + 1</sup> = 2 · <i>k</i> · 2<sup><i>k</i></sup> + 2<sup><i>k</i> + 1</sup> = <i>k</i> · 2<sup><i>k</i> + 1</sup> + 2<sup><i>k</i> + 1</sup> = (<i>k</i> + 1) · 2<sup><i>k</i> + 1</sup>, which is <i>P</i>(<i>k</i> + 1). <span class="qed">∎</span></p></div>
<p>The tree found the formula and induction proved it, the same partnership as in the first half of the lesson. This is where the <i>n</i> log<sub>2</sub> <i>n</i> column of Lesson 13's table comes from: a million items take about 20 million steps of merging, where checking every pair would take about 500 billion. The same unrolling solves binary search, <i>T</i>(<i>n</i>) = <i>T</i>(<i>n</i>/2) + 1 with <i>T</i>(1) = 1: one step on each of the log<sub>2</sub> <i>n</i> + 1 levels, so <i>T</i>(<i>n</i>) = log<sub>2</sub> <i>n</i> + 1.</p>`,
        { play: `def T(n):
    if n == 1:
        return 0
    return 2 * T(n // 2) + n

for k in range(6):
    n = 2 ** k
    print(n, T(n), n * k)`, predict: true, caption: 'Each line shows n, the recurrence T(n) computed by recursion, and n · log₂ n. They agree: 1 0 0, 2 2 2, 4 8 8, 8 24 24, 16 64 64, 32 160 160. Change the recurrence to 2 * T(n // 2) + 1, with T(1) = 1, and predict the new column before running: the levels now add up to 1 + 2 + 4 + …, so the answer is 2n − 1.' },
        { skill: 'recurrences', check: "T(1) = 1 and T(n) = T(n/2) + 1 for n a power of 2. What is T(1024)?", options: ["11", "512", "2047"], answer: 0, why: "One step on each level, and 1024 can be halved 10 times before it reaches 1: 10 + 1 = 11 levels. This is binary search: log₂ n + 1.", wrong: [null, "That is 1024 halved once. The recurrence halves again and again, and adds only one step each time.", "That is 2n − 1, the answer for T(n) = 2T(n/2) + 1, with two recursive calls. Here there is only one call, so each level holds a single step."] },
        `<h2>Fibonacci's growth</h2>
<p>Not every recurrence unrolls into a sum you know. The Fibonacci numbers are defined by <i>F</i>(0) = 0, <i>F</i>(1) = 1 and <i>F</i>(<i>n</i>) = <i>F</i>(<i>n</i> − 1) + <i>F</i>(<i>n</i> − 2), so they run 0, 1, 1, 2, 3, 5, 8, 13, 21, … The function that copies this definition, calling itself twice, makes one call to <code>fib(n)</code> and then all the calls of <code>fib(n - 1)</code> and of <code>fib(n - 2)</code>, so its number of calls obeys <i>C</i>(0) = <i>C</i>(1) = 1 and <i>C</i>(<i>n</i>) = <i>C</i>(<i>n</i> − 1) + <i>C</i>(<i>n</i> − 2) + 1, a recurrence that looks just like Fibonacci's own. The figure shows the calls for <i>n</i> = 5.</p>`,
        { fig: 'fibtree', n: 5, lang: 'python', caption: 'Every call of fib(5): one box per call. The same small cases are computed again and again.' },
        `<div class="stmt"><p><span class="kind">Theorem 4.</span> For every <i>n</i> ≥ 1, &nbsp;<i>F</i>(<i>n</i>) ≥ 2<sup>(<i>n</i> − 2)/2</sup>. That is, the Fibonacci numbers at least double every two steps.</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> Check <i>n</i> = 1 and <i>n</i> = 2 directly: <i>F</i>(1) = 1 ≥ 2<sup>−1/2</sup> and <i>F</i>(2) = 1 ≥ 2<sup>0</sup>. For <i>n</i> ≥ 1, assume the claim for <i>n</i> and <i>n</i> + 1, and prove it for <i>n</i> + 2. Since the Fibonacci numbers never decrease from <i>F</i>(1) on, <i>F</i>(<i>n</i> + 1) ≥ <i>F</i>(<i>n</i>), so <i>F</i>(<i>n</i> + 2) = <i>F</i>(<i>n</i> + 1) + <i>F</i>(<i>n</i>) ≥ 2<i>F</i>(<i>n</i>) ≥ 2 · 2<sup>(<i>n</i> − 2)/2</sup> = 2<sup><i>n</i>/2</sup> = 2<sup>((<i>n</i> + 2) − 2)/2</sup>. <span class="qed">∎</span></p>
<p class="why">This is induction with dominoes that each knock over the domino two places along. That is why two first dominoes are pushed, the base cases <i>n</i> = 1 and <i>n</i> = 2; with only one, every other domino would stay standing. Formally it is ordinary induction on the statement "the claim holds for <i>n</i> and for <i>n</i> + 1".</p></div>
<p>So the Fibonacci numbers grow exponentially, and so does the number of calls, since <i>C</i>(<i>n</i>) ≥ <i>F</i>(<i>n</i> + 1). In fact <i>C</i>(<i>n</i>) = 2<i>F</i>(<i>n</i> + 1) − 1, which you can prove by the same kind of induction, and <i>F</i>(<i>n</i>) grows like 1.618…<sup><i>n</i></sup>, the golden ratio to the power <i>n</i> (a fact this course does not prove). A loop that keeps the last two numbers needs only <i>n</i> steps, so the doubly recursive definition is an exponential way to compute something linear.</p>`,
        { play: `calls = 0

def fib(n):
    global calls
    calls += 1
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

for n in [5, 10, 15, 20]:
    calls = 0
    print(n, fib(n), calls)`, predict: true, caption: 'Each line is n, F(n) and the number of calls: 5 5 15, 10 55 177, 15 610 1973, 20 6765 21891. Each count is 2F(n + 1) − 1 (F(6) = 8 gives 15), and each step of 5 multiplies the calls by about 11. Try n = 25 and predict the count first: F(26) = 121393.' },
        `<h2>Before the exercises</h2>
<p>The trace comes first: a loop that computes merge sort's recurrence one level at a time. The first exercise asks for sums and for values of recurrences. For an arithmetic sum, find the number of terms first; for a geometric sum, use (<i>r</i><sup><i>n</i></sup> − 1)/(<i>r</i> − 1) with <i>n</i> the number of terms. The second asks you to turn recurrences into growth rates. Unroll each one, or picture its tree: what does each level cost, and how many levels are there?</p>
<div class="tbl-wrap"><table class="small">
<tr><th>recurrence</th><th>unrolls to</th><th>growth</th></tr>
<tr><td><i>T</i>(<i>n</i>) = <i>T</i>(<i>n</i> − 1) + 1</td><td>1 + 1 + … + 1</td><td><i>n</i></td></tr>
<tr><td><i>T</i>(<i>n</i>) = <i>T</i>(<i>n</i> − 1) + <i>n</i></td><td>1 + 2 + … + <i>n</i>, arithmetic</td><td><i>n</i><sup>2</sup></td></tr>
<tr><td><i>T</i>(<i>n</i>) = 2<i>T</i>(<i>n</i> − 1) + 1</td><td>1 + 2 + 4 + … + 2<sup><i>n</i> − 1</sup>, geometric</td><td>2<sup><i>n</i></sup></td></tr>
<tr><td><i>T</i>(<i>n</i>) = <i>T</i>(<i>n</i>/2) + 1</td><td>one step on each of log<sub>2</sub> <i>n</i> + 1 levels</td><td>log <i>n</i></td></tr>
<tr><td><i>T</i>(<i>n</i>) = 2<i>T</i>(<i>n</i>/2) + <i>n</i></td><td><i>n</i> on each of log<sub>2</sub> <i>n</i> levels</td><td><i>n</i> log <i>n</i></td></tr>
</table></div>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Miscounting the terms of an arithmetic sum: from 7 to 99 in steps of 4 is (99 − 7)/4 + 1 = 24 terms, not 23. Forgetting the − 1 or the division by <i>r</i> − 1 in a geometric sum. Using Theorem 2 with <i>r</i> = 1, where it divides by zero (the sum is then just <i>n</i>). Mistaking a recurrence with one recursive call for one with two: <i>T</i>(<i>n</i>/2) + 1 is log <i>n</i>, but 2<i>T</i>(<i>n</i>/2) + 1 is <i>n</i>. Believing a formula because it matched the first few values: find it by unrolling, then prove it by induction. Forgetting the base case of a recurrence, which fixes every later value.</p>` },
        {
          ex: {
            id: 'ma-20-3', kind: 'trace', skill: 'recurrences', title: 'Trace merge sort’s cost',
            prompt: `<p>This loop computes merge sort's recurrence <i>T</i>(<i>n</i>) = 2<i>T</i>(<i>n</i>/2) + <i>n</i>, with <i>T</i>(1) = 0, from the bottom up: <code>t</code> holds <i>T</i>(<i>n</i>) for the current <code>n</code>. Fill in the table: each row is a moment when line 3 starts a pass of the loop (and the last row, after line 6), with the values of <code>n</code> and <code>t</code> then. The first row is done for you.</p>`,
            code: `n = 1\nt = 0\nwhile n < 32:\n    n = n * 2\n    t = 2 * t + n\nprint(n, t)`,
            vars: ['n', 't'],
            steps: [
              { line: 3, values: { n: '1', t: '0' }, show: true },
              { line: 3, values: { n: '2', t: '2' }, why: { t: { '1': 'n is doubled first, on line 4, so line 5 adds the new n: 2 · 0 + 2 = 2.', '0': 'Line 5 adds n, the merging work at this size: 2 · 0 + 2 = 2.' } } },
              { line: 3, values: { n: '4', t: '8' }, why: { t: { '6': '2 · 2 + 4 = 8: double the old t, then add the new n.', '4': 't is doubled and n is added: 2 · 2 + 4 = 8.' } } },
              { line: 3, values: { n: '8', t: '24' } },
              { line: 3, values: { n: '16', t: '64' } },
              { line: 6, values: { n: '32', t: '160' }, why: { t: { '96': '2 · 64 + 32 = 160: the doubled t plus the new n.' } } }
            ],
            hints: ['Each pass doubles n first (line 4), then sets t to twice the old t plus the new n (line 5).', 'n goes 1, 2, 4, 8, 16, 32. t goes 0, then 2 · 0 + 2 = 2, then 2 · 2 + 4 = 8, then 24, 64, 160.'],
            solution: '<p>n: 1, 2, 4, 8, 16, 32. t: 0, 2, 8, 24, 64, 160. The program prints <code>32 160</code>, and 160 = 32 · 5 = 32 · log<sub>2</sub> 32, as Theorem 3 says. Each t is <i>k</i> · 2<sup><i>k</i></sup>: 1 · 2, 2 · 4, 3 · 8, 4 · 16, 5 · 32.</p>',
            failTip: 'Line 4 doubles n before line 5 uses it, so the work added on each pass is the new, doubled n.',
            followup: 'Change line 5 to t = 2 * t + 1 and start with t = 1. What does the program print, and which formula from the lesson does it match?'
          }
        },
        {
          ex: {
            id: 'ma-20-1', skill: ['sums', 'recurrences'], kind: 'answer', title: 'Sums and recurrences',
            prompt: `<p>Answer each with a single whole number. Use a closed form, not a long addition.</p>`,
            parts: [
              { label: '(a) 3 + 7 + 11 + … + 99', answer: '1275', width: '7rem',
                wrong: [{ match: '1224', msg: 'That uses 24 terms. From 3 to 99 in steps of 4 there are (99 − 3)/4 + 1 = 25 terms.' }, { match: '2550', msg: 'That is 25 · (3 + 99), without dividing by 2: each pair of a first and a last term is counted twice.' }] },
              { label: '(b) 1 + 3 + 9 + … + 3<sup>9</sup>', answer: '29524', width: '7rem',
                wrong: [{ match: '59048', msg: 'That is 3¹⁰ − 1 without dividing by r − 1 = 2.' }, { match: '9841', msg: 'That stops at 3⁸. The terms 1, 3, …, 3⁹ are 10 terms: (3¹⁰ − 1)/2.' }] },
              { label: '(c) <i>T</i>(64), where <i>T</i>(1) = 0 and <i>T</i>(<i>n</i>) = 2<i>T</i>(<i>n</i>/2) + <i>n</i>', answer: '384', width: '7rem',
                wrong: [{ match: '448', msg: 'That uses 7 levels. 64 = 2⁶, so log₂ 64 = 6 and T(64) = 64 · 6.' }, { match: '4096', msg: 'That is 64², the cost of checking every pair. Merge sort costs n log₂ n.' }] },
              { label: '(d) How many calls does the doubly recursive <code>fib(10)</code> make in all, counting the first one?', answer: '177', width: '7rem',
                wrong: [{ match: '55', msg: 'That is F(10), the answer fib(10) returns. The number of calls is 2F(11) − 1.' }, { match: '89', msg: 'That is F(11). The number of calls is 2F(11) − 1.' }] },
              { label: '(e) A list that doubles its block when full (starting with room for 1) receives 5000 appends. How many copies are made in all?', answer: '8191', width: '7rem',
                wrong: [{ match: '4095', msg: 'The list also moves when it holds 4096 items, since 5000 is more than 4096: 1 + 2 + … + 4096.' }, { match: '5000', msg: 'Copies happen only when the list moves: at 1, 2, 4, …, 4096 items. Add those up with Theorem 2.' }] }
            ],
            hints: ['(a) Count the terms first: (last − first)/4 + 1. (b) How many terms are 1, 3, …, 3⁹? (c) 64 = 2⁶. (d) Count with the formula 2F(n + 1) − 1.', '(a) 25 · 102/2. (b) (3¹⁰ − 1)/2 with 3¹⁰ = 59049. (c) 64 · 6. (d) F(11) = 89. (e) 1 + 2 + … + 4096 = 2¹³ − 1.'],
            solution: `<p>(a) 25 terms, 25 · (3 + 99)/2 = <b>1275</b>. (b) 10 terms: (3¹⁰ − 1)/(3 − 1) = 59048/2 = <b>29524</b>. (c) Theorem 3: 64 · log₂ 64 = 64 · 6 = <b>384</b>. (d) 2<i>F</i>(11) − 1 = 2 · 89 − 1 = <b>177</b>. (e) The list moves at 1, 2, 4, …, 4096 items: 2¹³ − 1 = <b>8191</b> copies, fewer than two per append.</p>`,
            followup: 'In (e), how many copies would there be if the block grew by 100 instead of doubling? Write the copies as an arithmetic sum and compare its growth with the doubling list.'
          }
        },
        {
          ex: {
            id: 'ma-20-2', skill: 'recurrences', kind: 'table', title: 'From recurrence to running time',
            prompt: `<p>Each recurrence describes the steps of a recursive function, with <i>T</i>(1) (or <i>T</i>(0)) a constant. Give its growth rate as <i>n</i> grows: write <code>log n</code>, <code>n</code>, <code>n log n</code>, <code>n^2</code> or <code>2^n</code> (with or without the O( )).</p>`,
            head: ['recurrence', 'growth rate'],
            rows: [
              ['<i>T</i>(<i>n</i>) = <i>T</i>(<i>n</i> − 1) + 1', { a: ['n', 'O(n)'], name: 'one call on n − 1, one step', why: { 'log n': 'Each call removes only one item, not half of them, so there are n calls.', 'O(log n)': 'Each call removes only one item, not half of them, so there are n calls.' } }],
              ['<i>T</i>(<i>n</i>) = <i>T</i>(<i>n</i> − 1) + <i>n</i>', { a: ['n^2', 'O(n^2)', 'n*n'], name: 'one call on n − 1, n steps', why: { n: 'It unrolls to 1 + 2 + … + n = n(n + 1)/2, an arithmetic sum.', 'O(n)': 'It unrolls to 1 + 2 + … + n = n(n + 1)/2, an arithmetic sum.', 'n log n': 'The sizes shrink by one, not by half: 1 + 2 + … + n is about n²/2.' } }],
              ['<i>T</i>(<i>n</i>) = <i>T</i>(<i>n</i>/2) + 1', { a: ['log n', 'O(log n)', 'log2 n', 'O(log2 n)', 'log_2 n'], name: 'one call on n/2, one step', why: { n: 'One call per level and one step each: only log₂ n + 1 steps.', 'O(n)': 'One call per level and one step each: only log₂ n + 1 steps.' } }],
              ['<i>T</i>(<i>n</i>) = 2<i>T</i>(<i>n</i>/2) + <i>n</i>', { a: ['n log n', 'O(n log n)', 'nlogn', 'n log2 n', 'O(n log2 n)', 'n*log n'], name: 'two calls on n/2, n steps', why: { n: 'Each level adds up to n, and there are log₂ n levels.', 'O(n)': 'Each level adds up to n, and there are log₂ n levels.', 'n^2': 'The halves are half the size: each level costs n in all, not n each call.' } }],
              ['<i>T</i>(<i>n</i>) = 2<i>T</i>(<i>n</i>/2) + 1', { a: ['n', 'O(n)'], name: 'two calls on n/2, one step', why: { 'n log n': 'The levels are not all equal: they cost 1, 2, 4, …, n, a geometric sum of about 2n.', 'O(n log n)': 'The levels are not all equal: they cost 1, 2, 4, …, n, a geometric sum of about 2n.', 'log n': 'There are two calls, so the levels double: 1 + 2 + 4 + … + n is about 2n.' } }],
              ['<i>T</i>(<i>n</i>) = 2<i>T</i>(<i>n</i> − 1) + 1', { a: ['2^n', 'O(2^n)'], name: 'two calls on n − 1, one step', why: { 'n^2': 'Two calls on n − 1 double the calls on every level: 1 + 2 + 4 + … + 2ⁿ⁻¹ = 2ⁿ − 1, the Tower of Hanoi.', n: 'Two calls on n − 1 double the calls on every level: 1 + 2 + 4 + … + 2ⁿ⁻¹ = 2ⁿ − 1, the Tower of Hanoi.' } }]
            ],
            hints: ['Unroll, or draw the tree: how many calls are on each level, what does each cost, and how many levels are there?', 'Halving gives log₂ n levels, subtracting one gives n levels. Equal levels multiply; levels that double make a geometric sum dominated by the last level.'],
            solution: `<p>One call on <i>n</i> − 1 with one step: <b>n</b>. One call on <i>n</i> − 1 with <i>n</i> steps: 1 + 2 + … + <i>n</i>, so <b>n²</b>. One call on <i>n</i>/2 with one step: <b>log n</b> (binary search). Two calls on <i>n</i>/2 with <i>n</i> steps: <b>n log n</b> (merge sort). Two calls on <i>n</i>/2 with one step: 1 + 2 + 4 + … + <i>n</i> = 2<i>n</i> − 1, so <b>n</b>. Two calls on <i>n</i> − 1 with one step: 2<sup><i>n</i></sup> − 1, so <b>2ⁿ</b> (the Tower of Hanoi).</p><p>Rows four and five differ only in the work outside the calls, and rows five and six only in the size of the calls: "halve" and "subtract one" are the difference between linear and exponential.</p>`,
            failTip: 'For each row, ask two questions: how many calls does each call make (one or two), and does the size halve or drop by one? Then add up the levels.',
            followup: 'Binary search and merge sort both halve. Why does one take log n steps and the other n log n? Answer in one sentence, using the words "calls" and "levels".'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>Arithmetic sum: <i>n</i>(first + last)/2, proved by writing the sum forwards and backwards. Count the terms carefully: (last − first)/<i>d</i> + 1.</li>
<li>Geometric sum: 1 + <i>r</i> + … + <i>r</i><sup><i>n</i> − 1</sup> = (<i>r</i><sup><i>n</i></sup> − 1)/(<i>r</i> − 1), proved by multiplying by <i>r</i> and subtracting. With <i>r</i> = 2 it is 2<sup><i>n</i></sup> − 1; with <i>r</i> = 1/2 it stays below 2, so a list that doubles its block copies fewer than two items per append.</li>
<li>A closed form can be found by a trick or a picture and then checked by induction. Both are proofs; the first explains, the second confirms.</li>
<li>A recursive program's cost is a recurrence; unroll it, or draw its tree, and it becomes a sum. <i>T</i>(<i>n</i>) = 2<i>T</i>(<i>n</i>/2) + <i>n</i> gives <i>n</i> log<sub>2</sub> <i>n</i> (merge sort), <i>T</i>(<i>n</i>/2) + 1 gives log<sub>2</sub> <i>n</i> + 1, <i>T</i>(<i>n</i> − 1) + <i>n</i> gives <i>n</i>(<i>n</i> + 1)/2.</li>
<li>The Fibonacci numbers at least double every two steps, so the doubly recursive <code>fib</code> makes exponentially many calls.</li>
<li>So whatever Büttner's class was set, the answer comes in one step: pair the terms, or multiply and subtract, and a sum of any length becomes a short formula. A program that calls itself gives a sum that nobody writes down, and its recurrence writes it down for us.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-10', '3B-AP-11', '3B-DA-07'],
      title: 'Checkpoint four', checkpoint: true, summary: 'No new ideas: mixed questions on probability, expected value, algorithms that flip coins, sums and recurrences, then two exercises. "And" or "or"? Independent or exclusive? Expected or most likely? Monte Carlo or Las Vegas? A sum or a recurrence?',
      blocks: [
        `<p>This lesson teaches nothing new. It mixes questions on the last three lessons: chance, averages and algorithms that flip coins, and sums and recurrences. The pairs to keep apart are the ones those lessons warned about: "and" against "or", independent against mutually exclusive, the expected value against the most likely value, Monte Carlo against Las Vegas, and a sum against the recurrence that produces it. Answer each question before looking back. If one surprises you, the lesson it came from is linked on the Review page.</p>
<p>Ready? Here is the first: a die is thrown twice. Is a six on both throws more likely, or less likely, than a six on at least one of them?</p>
<h2>Mixed questions</h2>`,
        { check: 'A die is thrown twice. What are the probabilities of "a six on both throws" and of "a six on at least one throw"?', skill: 'probability', options: ['1/36 and 11/36', '1/36 and 12/36', '2/6 and 1/36'], answer: 0, wrong: [null, 'Adding 6 + 6 counts the outcome (6, 6) twice, since it has a six on both throws. "At least one" is 6 + 6 − 1 = 11 outcomes, or 36 − 25 by the complement.', 'That adds where it should multiply. "Both" needs a six and then a six: 1/6 · 1/6 = 1/36. And 1/36 is the chance of both, not of at least one.'], why: '"And" for separate throws multiplies: 1/6 · 1/6 = 1/36. "At least one" is the complement of "none": 1 − 25/36 = 11/36.' },
        { check: 'Two dice are thrown. Which pair of events is mutually exclusive?', skill: 'probability', options: ['"The first die shows 6" and "the second die shows 6"', '"The sum is 2" and "the sum is 12"', '"The sum is 7" and "the first die shows 6"'], answer: 1, wrong: ['These can happen together, at (6, 6). In fact they are independent: P(both) = 1/36 = 1/6 · 1/6.', null, 'These can happen together, at (6, 1). They are independent, which is a different thing: P(both) = 1/36 = 1/6 · 1/6.'], why: 'Mutually exclusive means they cannot happen together: no outcome has a sum of both 2 and 12. Such events are never independent (when both are possible), since one rules the other out.' },
        { check: 'Two dice are thrown, and you are told that the sum is 4. What is the chance that the first die shows 1?', skill: 'probability', options: ['1/6', '1/3', '1/36'], answer: 1, wrong: ['That is the chance before you were told anything. Being told the sum shrinks the sample space to the outcomes with sum 4.', null, 'That is the chance of one particular outcome among all 36. Given the sum, only three outcomes remain.'], why: 'Given a sum of 4, the outcomes left are (1, 3), (2, 2) and (3, 1); one of the three has a 1 first, so P = 1/3.' },
        { check: 'A game pays $6 with probability 1/6 and nothing otherwise. Which statement is correct?', skill: 'expectation', options: ['The expected payout is $1, and the most likely payout is $0', 'The expected payout is $0, because that is what usually happens', 'The expected payout is $6, the prize'], answer: 0, wrong: [null, '$0 is the most likely payout, not the expected one. The expected value weights each payout by its chance: 6 · 1/6 + 0 · 5/6 = 1.', '$6 is what a win pays, but five games in six pay nothing. Average over all outcomes: $1.'], why: 'E = 6 · 1/6 + 0 · 5/6 = 1. The expected value is the long-run average; the most likely value is the single payout that happens most often, $0.' },
        { check: 'Ten letters are put into ten addressed envelopes at random. What is the expected number of letters in the right envelope?', skill: 'expectation', options: ['1', '0, because the letters are mixed up', '5'], answer: 0, wrong: [null, 'No letter in the right envelope is common, but sometimes one, two or more are. By linearity the average is 10 · 1/10 = 1.', 'Each letter has a 1-in-10 chance of its own envelope, not 1 in 2. Linearity: 10 · 1/10.'], why: 'Split the count into one indicator per letter, each with expected value 1/10. Linearity adds them, dependent or not: 10 · 1/10 = 1.' },
        { check: 'Each try of an experiment succeeds with probability 1/5, independently. On average, how many tries until the first success?', skill: 'expectation', options: ['5', '1, the most likely number', '4'], answer: 0, wrong: [null, 'One try is the most likely number, but the average includes the long waits too. Waiting for a success of probability p takes 1/p tries on average.', 'That counts only the failures before the success. Counting the successful try as well, the average is 1/p = 5.'], why: 'Waiting for a success of probability p takes 1/p tries on average: 1/(1/5) = 5.' },
        { check: 'Which algorithm is Las Vegas rather than Monte Carlo?', skill: 'randomized', options: ['Estimate the chance of winning solitaire by playing 1000 random games', 'Look at random positions of a list until one holds the value you want', 'Run 20 rounds of Miller–Rabin with random bases and report "probably prime" or "composite"'], answer: 1, wrong: ['A fixed amount of work and an answer that may be off: that is Monte Carlo, Ulam\'s method.', null, 'Twenty rounds is a fixed amount of work, and "probably prime" can be wrong: that is Monte Carlo.'], why: 'Las Vegas: never wrong, with a random running time. The random search stops only when it has found the value, so its answer is always right; only the number of looks varies.' },
        { check: 'Fermat\'s test finds 2<sup>560</sup> mod 561 = 1. What does that show?', skill: 'randomized', options: ['561 is prime', 'Nothing certain: 561 = 3 · 11 · 17 is a Carmichael number, and base 2 is a liar', '561 is composite'], answer: 1, wrong: ['Passing Fermat\'s test never proves primality. 561 = 3 · 11 · 17, and it passes for every base that shares no factor with it.', null, 'A result of 1 does not prove compositeness; only a result other than 1 would. Here the test was fooled, and Miller–Rabin\'s squarings are needed to expose 561.'], why: 'Only a result other than 1 is a proof (of compositeness). A Carmichael number passes Fermat\'s test for every base without a common factor; Miller–Rabin catches it with base 2.' },
        { check: 'What is 5 + 10 + 20 + 40 + … + 640?', skill: 'sums', options: ['1275', '1280', '2580'], answer: 0, wrong: [null, 'That is 2 · 640, as if the sum of a doubling sequence were exactly twice its last term. It is twice the last term minus the first: 5 · (2⁸ − 1).', 'That is 8 · (5 + 640)/2, the formula for an arithmetic sum, whose terms grow by a fixed amount. Here each term doubles: the sum is geometric.'], why: 'Geometric, r = 2, 8 terms: 5 · (2⁸ − 1)/(2 − 1) = 5 · 255 = 1275.' },
        { check: 'How many terms does 4 + 7 + 10 + … + 100 have, and what is the sum?', skill: 'sums', options: ['33 terms, sum 1716', '32 terms, sum 1664', '96 terms, sum 4992'], answer: 0, wrong: [null, 'Off by one: from 4 to 100 in steps of 3 is (100 − 4)/3 + 1 = 33 terms, counting both ends.', '96 is the distance from the first term to the last, not the number of terms. Divide it by the step 3, then add 1.'], why: '(100 − 4)/3 + 1 = 33 terms, and 33 · (4 + 100)/2 = 1716.' },
        { check: 'A recursive function calls itself twice on inputs of size n − 1 and does one step of its own. Which recurrence and growth rate fit?', skill: 'recurrences', options: ['T(n) = 2T(n − 1) + 1, which grows like 2ⁿ', 'T(n) = 2T(n/2) + 1, which grows like n', 'T(n) = T(n − 1) + 2, which grows like n'], answer: 0, wrong: [null, 'That would be two calls on half the input. Here each call is on n − 1, so the tree has n levels, each with twice as many calls as the one above.', 'That is one call. Two calls on n − 1 double the work on every level: 1 + 2 + 4 + … + 2ⁿ⁻¹.'], why: 'Two calls on n − 1 plus one step: T(n) = 2T(n − 1) + 1, the Tower of Hanoi, which unrolls to 2ⁿ − 1.' },
        { check: 'Merge sort satisfies T(n) = 2T(n/2) + n. What is the difference between this recurrence and the sum it unrolls to?', skill: 'recurrences', options: ['None: they are two names for the same thing', 'The recurrence gives T(n) in terms of T at smaller sizes; unrolling turns it into a sum, n on each of log₂ n levels, with the closed form n log₂ n', 'The sum is only an estimate, while the recurrence is exact'], answer: 1, wrong: ['A recurrence and a sum are different kinds of description: one refers back to earlier values, the other adds up terms. Unrolling is the step that turns one into the other.', null, 'For n a power of 2 the unrolled sum is exact, and Theorem 3 of Lesson 18 proved T(n) = n log₂ n by induction.'], why: 'The recurrence describes the program: two half-size calls plus n steps of merging. Unrolling it gives a sum whose closed form is the running time, n log₂ n.' },
        `<p>Two exercises to finish the unit. The first asks which algorithm is never wrong. The second asks you to write two short functions, one about chance and one about a recurrence.</p>`,
        {
          ex: {
            id: 'ma-21-1', kind: 'choice', skill: 'randomized', title: 'Never wrong',
            prompt: `<p>Four algorithms are described below. Which one is a <em>Las Vegas</em> algorithm: it uses random choices, it always gives a correct answer, and only its running time depends on the coin flips?</p>`,
            options: [
              { text: 'To decide whether a 300-digit number is prime, run Miller–Rabin with 30 random bases and answer "prime" if every base passes.', why: 'Thirty rounds is a fixed amount of work, and the answer "prime" can be wrong, with probability at most 4⁻³⁰ for a composite number. That is Monte Carlo.' },
              { text: 'To estimate the probability of a shared birthday among 23 people, simulate 10,000 rooms and report the share with a match.', why: 'The answer is an estimate that wobbles around the true value: a fixed amount of work and an answer that may be off. That is Monte Carlo.' },
              { text: 'To find a position holding a 1 in a list that is half 1s, look at random positions until one holds a 1.', ok: true },
              { text: 'To test whether a number is prime, try every divisor from 2 up to its square root.', why: 'Trial division is always right, but it uses no random choices at all. It is deterministic, neither Monte Carlo nor Las Vegas.' }
            ],
            hints: ['Two of the options can give a wrong answer; one uses no randomness at all.', 'Las Vegas stops only when it has found a correct answer. Which algorithm keeps going until it has found what it wants?'],
            solution: '<p>The random search. It stops only when it has looked at a position that holds a 1, so its answer is always correct; how many looks it takes depends on the coin flips, 2 on average by Lesson 17’s Theorem 3. Miller–Rabin with a fixed number of rounds and the birthday simulation are Monte Carlo: fixed work, an answer that may be wrong or off. Trial division is deterministic.</p>',
            followup: 'Lesson 17 found RSA’s primes with a Las Vegas search wrapped round a Monte Carlo test. Is the whole procedure Las Vegas, Monte Carlo, or neither? What could go wrong, and with what probability?'
          }
        },
        {
          ex: {
            id: 'ma-21-2', skill: ['probability', 'recurrences'], title: 'Count and recur',
            prompt: `<p>Write two functions.</p>
<ul><li><code>ways(total)</code> returns how many of the 6 · 6 · 6 = 216 outcomes of three dice (first, second, third) have that total. So <code>ways(3)</code> is <code>1</code>, only (1, 1, 1), and <code>ways(4)</code> is <code>3</code>. The probability of the total is then <code>ways(total) / 216</code>.</li>
<li><code>cost(n)</code> returns merge sort's <i>T</i>(<i>n</i>), where <i>T</i>(1) = 0 and <i>T</i>(<i>n</i>) = 2<i>T</i>(<i>n</i> // 2) + <i>n</i>. So <code>cost(2)</code> is <code>2</code> and <code>cost(8)</code> is <code>24</code>. Write it recursively, straight from the recurrence.</li></ul>`,
            starter: `def ways(total):\n    count = 0\n    # count the outcomes (a, b, c) of three dice with a + b + c == total\n    return count\n\ndef cost(n):\n    # T(1) = 0 and T(n) = 2 * T(n // 2) + n\n    return 0`,
            solution: `def ways(total):\n    count = 0\n    for a in range(1, 7):\n        for b in range(1, 7):\n            for c in range(1, 7):\n                if a + b + c == total:\n                    count += 1\n    return count\n\ndef cost(n):\n    if n == 1:\n        return 0\n    return 2 * cost(n // 2) + n`,
            tests: [{ call: 'ways(3)', expect: '1' }, { call: 'ways(4)', expect: '3' }, { call: 'ways(10)', expect: '27' }, { call: 'ways(18)', expect: '1' }, { call: 'ways(2)', expect: '0' }, { call: 'cost(1)', expect: '0' }, { call: 'cost(8)', expect: '24' }, { call: 'cost(1024)', expect: '10240' }],
            hints: ['ways: three nested loops, each over range(1, 7), with a counter that goes up when a + b + c == total. cost: the base case first.', 'cost(n): if n == 1: return 0, otherwise return 2 * cost(n // 2) + n.'],
            failTip: 'If ways(18) gives 0, the loops stop at 5: range(1, 7) gives 1 to 6. If cost never finishes, the base case is missing or never reached.',
            followup: 'Which totals of three dice are most likely, and what is their probability? Compare cost(1024) with 1024 · 1023 / 2, the pairs a simple sort might compare.'
          }
        },
        `<div class="recap"><h3>Unit four in a few lines</h3><ul>
<li>With equally likely outcomes, a probability is a count divided by the size of the sample space. "Or" of events that can overlap is inclusion–exclusion; "at least one" is the complement of "none"; "and" for independent events multiplies. Independent and mutually exclusive are different, nearly opposite, ideas; "given that" shrinks the sample space.</li>
<li>The expected value is the long-run average, not the most likely value. Linearity adds expectations with no independence needed; waiting for a success of probability <i>p</i> takes 1/<i>p</i> tries on average.</li>
<li>Monte Carlo: fixed work, a bounded chance of a wrong answer. Las Vegas: always right, random running time. Fermat's test is fooled by Carmichael numbers; Miller–Rabin errs with probability at most 4<sup>−<i>k</i></sup> after <i>k</i> random rounds.</li>
<li>Arithmetic sums: <i>n</i>(first + last)/2. Geometric sums: (<i>r</i><sup><i>n</i></sup> − 1)/(<i>r</i> − 1). A recurrence describes a recursive program; unrolling turns it into a sum, and merge sort's becomes <i>n</i> log<sub>2</sub> <i>n</i>.</li>
<li>Next: the project, where chance finds the primes and arithmetic builds a lock out of them.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['2-NI-06', '3A-NI-06', '3B-AP-10', '3B-NI-04'], standard: 1,
      title: 'Project: a lock made of arithmetic', summary: 'Put the whole course to work: build the RSA cipher, where the key that locks a message is public, the key that unlocks it is private, and the only way in is a problem believed to be hard.',
      blocks: [
        `<p>Two people who have never met want to share a secret over a channel that everyone can read. It sounds impossible: any key one of them sends, the eavesdropper sees too. Yet it happens every time you open a secure website. The method was found in 1977 by Ron Rivest, Adi Shamir and Leonard Adleman, and is named RSA after them. (A British government mathematician, Clifford Cocks, had found the same idea in 1973, but his work stayed secret until 1997.) The same year, Martin Gardner's magazine column printed a message locked with a 129-digit RSA key, and the inventors offered a hundred dollars to anyone who could read it. It took seventeen years and the pooled computers of more than six hundred volunteers. In 1994 the message was revealed: <em>The Magic Words are Squeamish Ossifrage</em>.</p>`,
        `<p>Before RSA, every cipher needed a secret shared in advance. In the Second World War the German forces enciphered their radio messages on Enigma machines, and the sender and the receiver had to set their machines up the same way each day, from the same printed list of keys. At Bletchley Park in England, codebreakers including Alan Turing designed machines called Bombes that searched for each day's settings, and many hundreds of people, most of them women of the Women's Royal Naval Service, ran them day and night. A public-key cipher has no list to steal and no setting to search for: the key that locks is printed for everyone to see. How can that possibly be safe?</p>`,
        { photo: ['enigma-machine', 'bombe-drums'], caption: "An Enigma machine with its lid open. Press a key and the rotors in the middle turn, and one of the lamps above the keyboard lights up the enciphered letter. Beside it, a Bombe on show at Bletchley Park in 2009: its drums work in sets of three, and each set stands in for the three rotors of one Enigma." },
        `<p>This project builds that lock, using nothing but ideas from this course: the modular arithmetic and fast powers of Lesson 4, Euclid's algorithm, the growth rates of Lesson 13, and the prime test of Lesson 17, which flips coins.</p>
<h2>The idea: a padlock</h2>
<p>Anyone can snap a padlock shut; only the owner has the key that opens it. So if you publish your padlock, anyone can lock a message for you, and nobody else can open it, not even the sender. In RSA the padlock is a pair of numbers (<i>n</i>, <i>e</i>) and the key is a third number <i>d</i>. Locking a number <i>a</i> means computing <i>a</i><sup><i>e</i></sup> mod <i>n</i>, and unlocking means raising to the power <i>d</i>.</p>
<details class="reveal"><summary>Guess first: the sender locks a message with the public padlock. What stops the sender from unlocking it again?</summary><p>The sender does not have <i>d</i>. Locking uses the exponent <i>e</i>, which everyone knows, and unlocking needs a different exponent <i>d</i>, which only the owner knows. Making that possible is the whole difficulty, and it rests on one theorem.</p></details>
<p>Everything depends on one theorem.</p>
<div class="stmt"><p><span class="kind">Theorem 1 (the round trip).</span> Let <i>p</i> and <i>q</i> be different primes, <i>n</i> = <i>pq</i> and <i>m</i> = (<i>p</i> − 1)(<i>q</i> − 1). Then for every integer <i>a</i> and every whole number <i>k</i>, <i>a</i><sup><i>km</i> + 1</sup> ≡ <i>a</i> (mod <i>n</i>).</p></div>
<p>Raising to the power <i>km</i> + 1 brings every number back to itself. The proof uses one fact from number theory that this course has not proved, so it is given for the curious below; the laboratory checks the theorem on every <i>a</i> for one <i>n</i>.</p>
<details class="reveal"><summary>A proof, for the curious</summary><p>It uses <em>Fermat's little theorem</em> (1640): if <i>p</i> is prime and <i>p</i> does not divide <i>a</i>, then <i>a</i><sup><i>p</i>−1</sup> ≡ 1 (mod <i>p</i>). Given that, if <i>p</i> does not divide <i>a</i>, then <i>a</i><sup><i>km</i> + 1</sup> = (<i>a</i><sup><i>p</i>−1</sup>)<sup><i>k</i>(<i>q</i>−1)</sup> · <i>a</i> ≡ 1 · <i>a</i> (mod <i>p</i>), by Lesson 4's Theorem 4. If <i>p</i> does divide <i>a</i>, both sides are ≡ 0 (mod <i>p</i>). Either way <i>p</i> divides <i>a</i><sup><i>km</i> + 1</sup> − <i>a</i>, and in the same way so does <i>q</i>. Two different primes that both divide a number have their product dividing it too, so <i>n</i> = <i>pq</i> divides <i>a</i><sup><i>km</i> + 1</sup> − <i>a</i>, which is the theorem. <span class="qed">∎</span></p></details>
<h2>Splitting the round trip in two</h2>
<p>A round trip is useful only if it can be split into two legs, one for locking and one for unlocking. Choose <i>e</i> with gcd(<i>e</i>, <i>m</i>) = 1, which Euclid's algorithm checks quickly. Then there is a number <i>d</i> with <i>ed</i> ≡ 1 (mod <i>m</i>), called the <em>inverse</em> of <i>e</i> modulo <i>m</i>; it exists exactly when gcd(<i>e</i>, <i>m</i>) = 1, and an extended form of Euclid's algorithm finds it fast. Then <i>ed</i> = <i>km</i> + 1 for some whole number <i>k</i>, and</p>
<p style="text-align:center">(<i>a</i><sup><i>e</i></sup>)<sup><i>d</i></sup> = <i>a</i><sup><i>ed</i></sup> = <i>a</i><sup><i>km</i> + 1</sup> ≡ <i>a</i> (mod <i>n</i>)</p>
<p>by Theorem 1. Raising to the power <i>e</i> scrambles; raising to the power <i>d</i> unscrambles. So: publish (<i>n</i>, <i>e</i>), and keep <i>d</i>, <i>p</i> and <i>q</i> secret. To send you a number <i>a</i> smaller than <i>n</i>, someone computes the locked number <i>c</i> = <i>a</i><sup><i>e</i></sup> mod <i>n</i> with Lesson 4's repeated squaring, and you compute <i>c</i><sup><i>d</i></sup> mod <i>n</i> and get <i>a</i> back. (Text becomes numbers in the obvious way, a few letters at a time.)</p>
`,
        { skill: 'rsa', check: "With n = pq, what is m, the number the keys e and d must satisfy ed ≡ 1 modulo?", options: ["n − 1", "(p − 1)(q − 1)", "pq"], answer: 1, wrong: ["That is the exponent for a prime modulus, but n = pq is not prime. For n = 55 the round trip uses 40, not 54.", null, "pq is n itself. The exponents are taken modulo m, the number Theorem 1 uses, which is smaller: for n = 55 it is 40, not 55."], why: "Theorem 1: raising to the power km + 1 modulo n is a round trip when m = (p − 1)(q − 1)." },
        `<h2>The whole thing by hand</h2>
<p>RSA is small enough to run with pencil and paper, if the primes are small. Take <i>p</i> = 5 and <i>q</i> = 11. Then <i>n</i> = 55 and <i>m</i> = 4 × 10 = 40. Choose <i>e</i> = 3, which shares no factor with 40. Its inverse is <i>d</i> = 27, because 3 × 27 = 81 = 2 × 40 + 1. The padlock is (55, 3) and the key is 27.</p>
<p>Lock the message <i>a</i> = 2: <i>c</i> = 2<sup>3</sup> mod 55 = 8. Now unlock: compute 8<sup>27</sup> mod 55 by repeated squaring. Since 27 = 16 + 8 + 2 + 1, we need the powers 8<sup>1</sup>, 8<sup>2</sup>, 8<sup>8</sup> and 8<sup>16</sup>, reducing mod 55 after every step (Lesson 4's Theorem 4):</p>
<table class="small"><tr><th>power</th><th>value mod 55</th><th>how</th></tr><tr><td>8<sup>1</sup></td><td>8</td><td></td></tr><tr><td>8<sup>2</sup></td><td>9</td><td>64 − 55</td></tr><tr><td>8<sup>4</sup></td><td>26</td><td>9² = 81, and 81 − 55 = 26</td></tr><tr><td>8<sup>8</sup></td><td>16</td><td>26² = 676, and 676 − 12 × 55 = 16</td></tr><tr><td>8<sup>16</sup></td><td>36</td><td>16² = 256, and 256 − 4 × 55 = 36</td></tr><tr><td>8<sup>27</sup></td><td>2</td><td>36 × 16 × 9 × 8, reducing as you go: 576 → 26, 26 × 9 = 234 → 14, 14 × 8 = 112 → 2</td></tr></table>
<p>The message 2 comes back. Nothing in that calculation involved a number bigger than 676, even though 8<sup>27</sup> itself has 25 digits. That is why locking and unlocking stay fast when <i>n</i> has hundreds of digits.</p>
<h2>Why the eavesdropper is stuck</h2>
<p>The eavesdropper knows <i>n</i> and <i>e</i>, and sees <i>c</i>. To unlock <i>c</i> she needs <i>d</i>; to find <i>d</i> she needs <i>m</i> = (<i>p</i> − 1)(<i>q</i> − 1); and to find <i>m</i>, as far as anyone knows, she needs <i>p</i> and <i>q</i>. In other words she must <em>factor</em> <i>n</i>. For <i>n</i> = 55 that is trivial. For an <i>n</i> with 600 digits, trial division would need about 10<sup>300</sup> steps, far beyond any computer that could ever be built, and even the best known methods take time that grows faster than any polynomial in the number of digits (Lesson 13). Factoring is in NP, since a claimed factor is easy to check (Lesson 14), but nobody has found a fast way to factor, and nobody has proved that there is none. The whole internet is betting that there is none.</p>
<p>The security does not come from a secret method: you now know the entire method. It comes from a growth rate. Using the lock takes a number of steps that grows like the number of digits; picking it, by every method known, takes a number that grows faster than any power of the number of digits.</p>
`,
        { skill: 'rsa', check: "What must an eavesdropper do to recover d from the public (n, e)?", options: ["Compute e⁻¹ mod n", "Factor n into p and q, to find m", "Try every message"], answer: 1, wrong: ["The inverse that matters is of e modulo m, not modulo n, and m is secret: without p and q she cannot compute it.", null, "That would unlock one message at a time, never the key, and there are about as many messages as numbers below n: some 10⁶⁰⁰ of them for a real key."], why: "d is the inverse of e modulo m, and m needs p and q. Every known way of factoring takes time that grows faster than any power of the number of digits." },
        `<h2>Where the primes come from</h2>
<p>The hand calculation started from primes that everyone knows. A real key starts from two secret primes of about 300 digits each, chosen at random so that nobody can guess them. Lesson 17 showed how they are found: pick a random odd number of the right size, test it with Miller–Rabin, and if it fails, pick again. About one odd number in 345 of that size is prime, so the search expects about 345 tries, and each test takes a fraction of a second. Trial division could not even check one candidate: it would need up to about 10<sup>150</sup> divisions.</p>
<details class="reveal"><summary>Guess first: Miller–Rabin can call a composite number "probably prime". What would go wrong if <i>p</i> were secretly composite?</summary><p>Theorem 1 needs <i>p</i> and <i>q</i> to be prime. With a composite <i>p</i>, the number <i>m</i> = (<i>p</i> − 1)(<i>q</i> − 1) is not the right one, and in general the round trip fails: messages come back as the wrong numbers. So key generators run enough rounds that the chance, at most 4<sup>−<i>k</i></sup> after <i>k</i> rounds, is negligible. Rabin pointed out that one error in a billion billion tests is small compared with how often computers themselves make mistakes.</p></details>
<h2>The laboratory</h2>
<p>The full cycle in Python: check Theorem 1 for one <i>n</i>, generate keys, lock and unlock a message, and then play the eavesdropper. Predict what each program prints. Python's three-argument <code>pow(a, e, n)</code> is Lesson 4's repeated squaring.</p>`,
        { play: `p, q = 61, 53
n = p * q                              # 3233: the public modulus
m = (p - 1) * (q - 1)                  # 3120: secret

# Theorem 1, checked for every a below n
exceptions = [a for a in range(n) if pow(a, m + 1, n) != a]
print("exceptions to the round trip:", exceptions)

def inverse(e, m):                     # search for d with e*d = 1 (mod m)
    for d in range(1, m):
        if (e * d) % m == 1:
            return d
    return None

e = 17
d = inverse(e, m)
print("padlock:", (n, e), " key:", d, " check:", (e * d) % m)

message = 1234
locked = pow(message, e, n)
print("message", message, "-> locked", locked, "-> unlocked", pow(locked, d, n))`, predict: true, caption: 'No exceptions, so Theorem 1 holds for every a below 3233. The key is 2753, and (17 × 2753) mod 3120 is 1. The message 1234 is locked to 2183 and unlocked again to 1234. Try a message of 3233 or more: it comes back reduced modulo 3233.' },
        `<p>Now the eavesdropper. She sees only <i>n</i>, <i>e</i> and the locked message, and tries to break the lock by factoring <i>n</i> by trial division, counting the steps.</p>`,
        { play: `n, e, locked = 3233, 17, 2183          # everything the eavesdropper can see

def inverse(e, m):                     # the same search as before
    for d in range(1, m):
        if (e * d) % m == 1:
            return d
    return None

steps = 0
f = 2
while n % f != 0:                      # trial division
    f += 1
    steps += 1
print("eavesdropper found", f, "and", n // f, "after", steps, "divisions")
m2 = (f - 1) * (n // f - 1)
print("and reads the message:", pow(locked, inverse(e, m2), n))`, predict: 'Which factor will she find first, and will she be able to read the message?', caption: 'She finds 53 after 51 divisions, so the other factor is 61, rebuilds m = 52 × 60 = 3120, finds d, and reads 1234. Every extra digit of n multiplies her work by about three, while barely slowing the legitimate user.' },
                { skill: 'rsa', check: "Why must the message be smaller than n?", options: ["For speed", "The round trip returns the message only modulo n", "Because e is small"], answer: 1, wrong: ["Speed is not the issue; the arithmetic is the same speed either way. The issue is what comes back.", null, "The size of e has nothing to do with it. Every result is a remainder below n, so a message of n or more cannot come back as itself."], why: "a^(km + 1) ≡ a (mod n): a message of n or more comes back reduced, as a different number." },
        `<h2>Before the exercises</h2>
<p>Both exercises are by hand, as in the table above. The first makes a key pair and locks a message; for the unlocking step, notice that 31 ≡ −2 (mod 33), and powers of −2 are easy. The second is the eavesdropper's job on a small padlock: factor <i>n</i>, rebuild <i>m</i>, find <i>d</i>. To find an inverse by hand, try <i>d</i> = 1, 2, 3, … until <i>ed</i> is one more than a multiple of <i>m</i>, or look for the multiple of <i>m</i> that is one less than a multiple of <i>e</i>.</p>`,
        { aside: `<p><b>Common mistakes in this project.</b> Choosing an <i>e</i> that shares a factor with <i>m</i>, so that no <i>d</i> exists. Computing <i>m</i> as <i>n</i> − 1, or with the wrong primes. Forgetting to reduce mod <i>n</i> after every multiplication, so the numbers grow enormous. Locking a message that is not smaller than <i>n</i>: the round trip only returns numbers below <i>n</i>. Thinking the security comes from keeping the method secret; it comes from the difficulty of factoring.</p>` },
        {
          ex: {
            id: 'ma-12-1', skill: 'rsa', kind: 'table', title: 'Make a key and lock a message',
            prompt: `<p>Build an RSA key from the primes <i>p</i> = 3 and <i>q</i> = 11, with <i>e</i> = 3. Then lock the message <i>a</i> = 4, and unlock it again.</p>`,
            head: ['quantity', 'value'],
            rows: [
              ['<i>n</i> = <i>pq</i>', { a: '33', name: 'n' }],
              ['<i>m</i> = (<i>p</i> − 1)(<i>q</i> − 1)', { a: '20', name: 'm', why: { '32': 'That is n − 1. The formula is (p − 1)(q − 1) = 2 × 10.', '33': 'That is n. m is (p − 1)(q − 1).' } }],
              ['gcd(<i>e</i>, <i>m</i>)', { a: '1', name: 'gcd(e, m)' }],
              ['<i>d</i>, with <i>ed</i> ≡ 1 (mod <i>m</i>)', { a: '7', name: 'd', why: { '11': '3 × 11 = 33, which is 13 more than 20, not 1 more. Try 3 × 7 = 21.' } }],
              ['<i>k</i>, with <i>ed</i> = <i>km</i> + 1', { a: '1', name: 'k' }],
              ['locked <i>c</i> = 4<sup>3</sup> mod 33', { a: '31', name: 'c', why: { '64': '64 is not below 33: reduce it. 64 − 33 = 31.' } }],
              ['unlocked <i>c</i><sup><i>d</i></sup> mod 33', { a: '4', name: 'unlocked', why: { '31': 'Raise c to the power d = 7, using 31 ≡ −2 (mod 33): (−2)⁷ = −128.' } }]
            ],
            hints: ['n = 33 and m = 2 × 10 = 20. Try d = 1, 2, 3, … until 3d is one more than a multiple of 20.', 'c = 64 mod 33 = 31. To unlock, 31 ≡ −2 (mod 33), so 31⁷ ≡ (−2)⁷ = −128, and −128 + 4 × 33 = 4.'],
            solution: `<p><i>n</i> = <b>33</b>, <i>m</i> = <b>20</b>, gcd(3, 20) = <b>1</b>. The inverse is <i>d</i> = <b>7</b>, since 3 × 7 = 21 = <b>1</b> × 20 + 1. Locking: 4³ = 64 ≡ <b>31</b> (mod 33). Unlocking: 31 ≡ −2, so 31⁷ ≡ (−2)⁷ = −128 ≡ −128 + 132 = <b>4</b>. The message comes back, as Theorem 1 promises: 4<sup>21</sup> = 4<sup>1·20 + 1</sup> ≡ 4.</p>`,
            failTip: 'Work in order: n, then m = (p − 1)(q − 1), then d by trying 1, 2, 3, … until e·d is one more than a multiple of m. Reduce mod n after every power, and for unlocking replace 31 by −2.',
            followup: 'The trick 31 ≡ −2 is Lesson 4\u2019s Theorem 4 at work: any number may be replaced by anything congruent to it, including a negative one, whenever that makes the arithmetic easier.'
          }
        },
        {
          ex: {
            id: 'ma-12-2', skill: 'rsa', kind: 'answer', title: 'Pick the lock',
            prompt: `<p>You are the eavesdropper. The public padlock is <i>n</i> = 91, <i>e</i> = 5. Recover the private key, then think about a real one.</p>`,
            parts: [
              { label: '(a) The smaller prime factor <i>p</i> of 91.', answer: '7', width: '5rem',
                wrong: [{ match: '91', msg: '91 is not prime: try dividing by 2, 3, 5, 7, … up to √91 ≈ 9.5.' }, { match: '13', msg: '13 divides 91, but there is a smaller prime factor.' }] },
              { label: '(b) The other prime factor <i>q</i>.', answer: '13', width: '5rem' },
              { label: '(c) <i>m</i> = (<i>p</i> − 1)(<i>q</i> − 1).', answer: '72', width: '5rem',
                wrong: [{ match: '90', msg: 'That is n − 1. Use (p − 1)(q − 1) = 6 × 12.' }] },
              { label: '(d) The private key <i>d</i>, with 5<i>d</i> ≡ 1 (mod <i>m</i>) and 1 ≤ <i>d</i> &lt; <i>m</i>.', answer: '29', width: '5rem',
                wrong: [{ match: '73', msg: '5 × 73 = 365 = 5 × 72 + 5, which is 5 more than a multiple of 72, not 1 more.' }] },
              { label: '(e) A real RSA modulus <i>n</i> has 600 digits. About how many digits does √<i>n</i> have, the largest divisor trial division might need to try?', answer: '300', width: '5rem',
                wrong: [{ match: '600', msg: 'Taking a square root halves the number of digits: √(10⁶⁰⁰) = 10³⁰⁰.' }, { match: ['24', '25'], msg: 'That is √600. The question is about √n, where n itself has 600 digits.' }] }
            ],
            hints: ['(a) 91 = 7 × 13. (c) 6 × 12.', '(d) Find the multiple of 72 that is one less than a multiple of 5: 72 × 2 = 144, and 145 = 5 × 29. (e) √(10⁶⁰⁰) = 10³⁰⁰.'],
            solution: `<p>(a) <b>7</b> and (b) <b>13</b>, since 91 = 7 × 13. (c) <i>m</i> = 6 × 12 = <b>72</b>. (d) 5 × 29 = 145 = 2 × 72 + 1, so <i>d</i> = <b>29</b>. (e) About <b>300</b> digits: trial division would need up to 10³⁰⁰ divisions, vastly more than the number of atoms in the observable universe, which is about 10⁸⁰.</p><p>Parts (a) to (d) took minutes because 91 has two digits. Part (e) is why the same attack is hopeless on a real key: the method is identical, and only the growth rate stands in the way.</p>`,
            failTip: 'Factor 91 first; everything else follows from p and q. Remember m = (p − 1)(q − 1), not n − 1, and that d must satisfy 5d ≡ 1 modulo m, not modulo 91.',
            followup: 'Every step after factoring was fast: rebuilding m is one multiplication and finding d is Euclid\u2019s work. The entire security of RSA rests on the first step alone.'
          }
        },
        `<h2>What you have built</h2>
<p>Look back at what this project used. Propositions and proof, to know exactly what a theorem guarantees and what it does not. Sets and counting, to see why 2<sup><i>n</i></sup> possibilities cannot be searched. Divisibility, congruences, Euclid's algorithm and fast modular powers, which are the machinery of the lock itself. Probability and expected value, to find the primes with a test that flips coins and to know how far it can be trusted. Growth rates, to know the difference between slow and impossible in practice. And behind them, the results of Lessons 12 and 14: there are questions no program can answer, and questions we believe no program can answer <em>quickly</em>, and the modern world has learned to build its security on the second kind.</p>
<p>That is the course. The mathematics of computing is not a set of formulas about computers. It is the study of what can be known, counted and done, and the remarkable fact that those questions have precise answers.</p>
<div class="recap"><h3>In this project</h3><ul>
<li>The answer to the opening question: a lock can be public because locking is easy for everyone and unlocking needs a number only the owner has. With <i>n</i> = <i>pq</i> and <i>m</i> = (<i>p</i> − 1)(<i>q</i> − 1), raising to the power <i>km</i> + 1 modulo <i>n</i> is a round trip (Theorem 1, from Fermat's little theorem).</li>
<li>Choose <i>e</i> with gcd(<i>e</i>, <i>m</i>) = 1 and <i>d</i> with <i>ed</i> ≡ 1 (mod <i>m</i>): <i>e</i> locks and <i>d</i> unlocks. The primes <i>p</i> and <i>q</i> come from a random search tested by Miller–Rabin (Lesson 17).</li>
<li>Locking and unlocking use repeated squaring, so they stay fast for huge numbers.</li>
<li>(<i>n</i>, <i>e</i>) is public; recovering <i>d</i> means factoring <i>n</i>, which, by every method known, takes time growing faster than any power of the number of digits. The security is a growth rate, not a secret.</li>
</ul></div>`
      ]
    }
  ]
});
