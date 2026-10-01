// Lesson content, (c) 2026 Michael Sayers, licensed CC BY-SA 4.0 (see LICENSE-CONTENT.md).
window.COURSES = window.COURSES || [];
window.COURSES.push({
  id: 'math', code: 'SC 104', short: 'Math', lang: 'python',
  title: 'Introduction to the Mathematics of Computing',
  readingWpm: 60,   // definitions and proofs are read slowly; used for the lesson-time estimates
  grades: 'Grades 10–12 · after Python',
  audience: `<p><b>Grades 10–12</b> (or a strong 9th grader) who have finished the Python course, or who can already write a loop and a function. The math is algebra: variables, exponents, remainders. No calculus. If you liked the parts of algebra where you had to explain <em>why</em>, this course is for you.</p><p>Python is the laboratory here, not the subject. Every idea gets a picture, an experiment you can run, and an argument in plain words. Each lesson stands on its own.</p>`,
  tagline: 'Thirteen lessons on the ideas underneath every program: logic, proof, counting, machines, and the problems no computer can solve.',
  description: `<p>Programming courses teach you how to make a computer do things. This course asks the questions underneath: What does it mean for an argument to be airtight? How many possibilities are there, and how do you count them without listing them? What is a computer, stripped to its bones, and is there anything it fundamentally cannot do? Which problems are easy, which are hard, and which are impossible?</p>
<p>These questions belong to mathematics as much as to computing, and the two subjects turn out to be the same subject looked at from two sides. Each lesson takes one idea, gives you a picture of it, lets you experiment with it in Python, and then asks you to reason about it in words. The exercises check your code; the reasoning you check with your own head. By the end you will have proved a theorem, designed a machine, met a problem that no program can solve, and built a lock out of nothing but arithmetic.</p>
<p><b>These lessons are longer than an Hour of Code.</b> Most take 60 to 90 minutes, because definitions and proofs need slow, careful reading and the exercises ask for reasoning rather than code. The list below shows the estimate for each lesson that runs past an hour. In a 50- or 60-minute class, plan two sessions for those lessons, or leave the exercises for the next one.</p>`,
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
    'Build and break a small public-key cipher'
  ],
  lessons: [
    /* ================================================================== */
    {
      title: 'Propositions and truth', summary: 'Statements that are true or false, the connectives that combine them, why a truth table is a proof, and how to say "for all" and "there exists" precisely.',
      blocks: [
        `<p>"This sentence is false." Is it true? If it is true, then what it says holds, so it is false. If it is false, then what it says fails, so it is true. This is the <em>liar paradox</em>, known to the ancient Greeks, and it shows that not every sentence can be simply true or false.</p>
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
<p>We write propositions with letters, <i>p</i>, <i>q</i>, <i>r</i>, just as algebra writes numbers with <i>x</i> and <i>y</i>, and we write their truth values as T and F. Python has a type for exactly these two values, <code>bool</code>, with <code>True</code> and <code>False</code>.</p>
<h2>Three connectives</h2>
<p>New propositions are built from old ones with connecting words. Each connective is <em>defined</em> by a table giving the value of the new proposition for every possible combination of values of the old ones. Such a table is called a <em>truth table</em>, and for a connective the table is its definition: there is nothing else to know about "and" than what the table says.</p>
<div class="stmt"><p><span class="kind">Definition.</span> For propositions <i>p</i> and <i>q</i>, the <em>negation</em> ¬<i>p</i> ("not <i>p</i>"), the <em>conjunction</em> <i>p</i> ∧ <i>q</i> ("<i>p</i> and <i>q</i>") and the <em>disjunction</em> <i>p</i> ∨ <i>q</i> ("<i>p</i> or <i>q</i>") are the propositions whose truth values are given by these tables:</p>
<table class="small"><tr><th><i>p</i></th><th>¬<i>p</i></th></tr><tr><td>T</td><td>F</td></tr><tr><td>F</td><td>T</td></tr></table>
<table class="small"><tr><th><i>p</i></th><th><i>q</i></th><th><i>p</i> ∧ <i>q</i></th><th><i>p</i> ∨ <i>q</i></th></tr><tr><td>T</td><td>T</td><td>T</td><td>T</td></tr><tr><td>T</td><td>F</td><td>F</td><td>T</td></tr><tr><td>F</td><td>T</td><td>F</td><td>T</td></tr><tr><td>F</td><td>F</td><td>F</td><td>F</td></tr></table></div>
<p>Two things to notice. The table for two propositions has four rows, because each of <i>p</i> and <i>q</i> can independently be T or F: 2 × 2 = 4. And "or" is <em>inclusive</em>: <i>p</i> ∨ <i>q</i> is true in the first row, where both are true. In everyday English "soup or salad" usually means one or the other; in logic, and in every programming language, "or" never does. The one-or-the-other version has its own name, <em>exclusive or</em>, and you will meet it below.</p>
<p>Python spells the three connectives as English words: <code>not p</code>, <code>p and q</code>, <code>p or q</code>. Logicians write ¬, ∧, ∨. They mean exactly the same tables.</p>
<h2>Building a truth table</h2>
<p>A compound proposition such as ¬(<i>p</i> ∧ <i>q</i>) is evaluated from the inside out, one column at a time, exactly as a nested arithmetic expression is. Here is the table for it, with the intermediate column shown. Cover the last column and fill it in yourself first: each entry is the negation of the entry beside it.</p>
<table class="small"><tr><th><i>p</i></th><th><i>q</i></th><th><i>p</i> ∧ <i>q</i></th><th>¬(<i>p</i> ∧ <i>q</i>)</th></tr><tr><td>T</td><td>T</td><td>T</td><td>F</td></tr><tr><td>T</td><td>F</td><td>F</td><td>T</td></tr><tr><td>F</td><td>T</td><td>F</td><td>T</td></tr><tr><td>F</td><td>F</td><td>F</td><td>T</td></tr></table>
<p>Always list the rows in this order, TT, TF, FT, FF, so that tables can be compared row by row. With three propositions there are eight rows; with <i>n</i> there are 2<sup><i>n</i></sup>, a fact Lesson 2 returns to.</p>
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
table("exactly one of p, q", lambda p, q: (p or q) and not (p and q))`, caption: 'A lambda is a one-line function with no name; here it holds the expression. Change the third one to  (p and not q) or (q and not p)  and confirm it gives the same column.' },
        { check: "When is <code>p → q</code> false?", options: ["Whenever p is false", "Only when p is true and q is false", "Whenever q is false"], answer: 1, why: "An untested promise is kept: a false p makes the implication true. Only \"p true, q false\" breaks it." },
        { check: "Which statement is equivalent to \"if it rains, the ground is wet\"?", options: ["If the ground is wet, it rained (the converse)", "If the ground is not wet, it did not rain (the contrapositive)", "It rains and the ground is wet"], answer: 1, why: "An implication is equivalent to its contrapositive, not to its converse. One row of the truth table differs for the converse." },
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
        { check: "What is the negation of \"every student passed\"?", options: ["Every student failed", "Some student did not pass", "No student passed"], answer: 1, why: "¬(∀x, P(x)) ≡ ∃x, ¬P(x): the negation of \"for all\" is \"there exists one that does not\"." },
        {
          ex: {
            id: 'ma-1-1', kind: 'table', title: 'An implication and its relatives',
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
            id: 'ma-1-2', kind: 'choice', title: 'Negating "for all"',
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
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Sets and counting', summary: 'Collections without order, four rules for counting without listing, why a set of n things has 2ⁿ subsets, and the pigeonhole principle.',
      blocks: [
        `<p>A pizza shop offers ten toppings, and you may choose any combination, from a plain pizza to one with all ten. How many different pizzas is that? Listing them would take all afternoon. By the end of this lesson you will know the answer, 1024, and be able to prove it.</p>
<p>A great deal of computing comes down to a counting question. How many passwords must an attacker try? How many cases must a test check to be complete? How many possibilities must a brute-force search examine before it can give up? This lesson develops a small set of rules for counting a collection <em>without listing it</em>, and proves each rule from the one before. The collections are sets, so we begin with those.</p>
<h2>Sets</h2>
<div class="stmt"><p><span class="kind">Definition.</span> A <em>set</em> is a collection of objects, called its <em>elements</em>. We write <i>x</i> ∈ <i>A</i> for "<i>x</i> is an element of <i>A</i>" and <i>x</i> ∉ <i>A</i> for "<i>x</i> is not an element of <i>A</i>". Two sets are <em>equal</em> when they have exactly the same elements.</p></div>
<p>A small set can be written by listing its elements between braces: the primes less than 10 form the set {2, 3, 5, 7}. The definition of equality has two consequences that make a set different from a list. Order does not matter: {7, 5, 3, 2} has the same elements, so it is the same set. Repetition does not matter either: {2, 2, 3} and {2, 3} have the same elements, so they are equal, and the first is just a clumsy way of writing the second. A set has one job, which is to answer the question "is <i>x</i> in here?"</p>
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
        { check: "What is |{1, 2, 2, 3, 3, 3}|?", options: ["6", "3", "1"], answer: 1, why: "A set is determined by its elements; repetition does not count. The elements are 1, 2 and 3." },
        `<h2>The sum rule</h2>
<p>The first counting rule is so basic that we take it as our starting point rather than proving it. It is really a description of what counting means.</p>
<div class="stmt"><p><span class="kind">The sum rule.</span> If <i>A</i> and <i>B</i> are disjoint finite sets, then |<i>A</i> ∪ <i>B</i>| = |<i>A</i>| + |<i>B</i>|. More generally, if finite sets <i>A</i><sub>1</sub>, …, <i>A</i><sub><i>k</i></sub> have no element in common, any two of them, the size of their union is the sum of their sizes.</p></div>
<p>In words: to count a collection, split it into pieces that do not overlap and add up the sizes of the pieces. The word <em>disjoint</em> is essential. A class with 12 students in the band and 9 in the choir need not have 21 students who are in the band or the choir, because a student in both would be counted twice. The sum rule has an immediate consequence, which is often the easiest way to count something.</p>
<div class="stmt"><p><span class="kind">Corollary (the complement rule).</span> If <i>A</i> ⊆ <i>U</i> and <i>U</i> is finite, then |<i>U</i> − <i>A</i>| = |<i>U</i>| − |<i>A</i>|.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Each element of <i>U</i> is either in <i>A</i> or not, and not both. So <i>U</i> is the union of the disjoint sets <i>A</i> and <i>U</i> − <i>A</i>, and by the sum rule |<i>U</i>| = |<i>A</i>| + |<i>U</i> − <i>A</i>|. Subtract |<i>A</i>| from both sides. <span class="qed">∎</span></p></div>
<p>(A <em>corollary</em> is a theorem that follows quickly from something already proved.) The complement rule is the standard way to count "at least one": count the things with <em>none</em>, which is usually easy, and subtract from the total.</p>
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
<p>The set of all subsets of <i>S</i> is called the <em>power set</em> of <i>S</i>. Here is the bijection for {<i>a</i>, <i>b</i>, <i>c</i>}, with the strings listed in counting order. The rightmost bit stands for <i>a</i>, the middle one for <i>b</i>, the leftmost for <i>c</i>, so the rows are the numbers 0 to 7 written in binary.</p>
<table class="small"><tr><th>number</th><th>bits (<i>c b a</i>)</th><th>subset</th></tr><tr><td>0</td><td>000</td><td>∅</td></tr><tr><td>1</td><td>001</td><td>{<i>a</i>}</td></tr><tr><td>2</td><td>010</td><td>{<i>b</i>}</td></tr><tr><td>3</td><td>011</td><td>{<i>a</i>, <i>b</i>}</td></tr><tr><td>4</td><td>100</td><td>{<i>c</i>}</td></tr><tr><td>5</td><td>101</td><td>{<i>a</i>, <i>c</i>}</td></tr><tr><td>6</td><td>110</td><td>{<i>b</i>, <i>c</i>}</td></tr><tr><td>7</td><td>111</td><td>{<i>a</i>, <i>b</i>, <i>c</i>}</td></tr></table>
<p>You have met this count before. Lesson 1 said a truth table for <i>n</i> propositions has 2<sup><i>n</i></sup> rows. A row gives each proposition the value T or F, which is a string of <i>n</i> bits, so Theorem 3's argument counts the rows too. Subsets, bit strings, rows of a truth table: one count in three disguises, matched by bijections.</p>
<p>The number 2<sup><i>n</i></sup> grows very fast. A set of 20 elements has about a million subsets, a set of 40 about a trillion, and a set of 300 has more subsets than there are atoms in the observable universe. That is why a search that tries "every subset" is hopeless for large <i>n</i>, and Lesson 12 is built on that fact.</p>
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
print(count, "subsets")`, caption: 'The output is the table above. Add a fourth and a fifth item, and predict the count before running. Watch the rightmost bit: it switches on every line, like the ones digit of a counter, and it decides whether "a" is in.' },
        { check: "|A| = 10, |B| = 8, |A ∩ B| = 3. What is |A ∪ B|?", options: ["18", "15", "21"], answer: 1, why: "Inclusion–exclusion: 10 + 8 − 3. Adding the sizes alone counts the overlap twice." },
        { check: "How many subsets does a set with 5 elements have?", options: ["25", "32", "10"], answer: 1, why: "Each element is in or out: 2 choices each, 2⁵ = 32 subsets, including the empty set and the whole set." },
        `<p>Running the program for 3, 4 and 5 items checks Theorem 3 in three cases, and the proof is what tells you it holds for every <i>n</i>. The program is still useful beyond checking: listing all subsets is a legitimate method whenever <i>n</i> is small, and one of Lesson 12's exercises uses exactly this method.</p>
<h2>The pigeonhole principle</h2>
<p>The last rule of the lesson does not count anything exactly. It proves that something <em>must exist</em>.</p>
<div class="stmt"><p><span class="kind">Theorem 4 (the pigeonhole principle).</span> If more than <i>n</i> objects are placed in <i>n</i> boxes, then some box contains at least two objects.</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> We prove the contrapositive: if every box contains at most one object, then there are at most <i>n</i> objects.</p>
<p class="why">Lesson 1, Theorem 2: an implication and its contrapositive are logically equivalent, so proving either one proves the other. The contrapositive is easier here, because "at most one object in every box" is something we can add up.</p>
<p>Suppose every box contains at most one object. Each object is in exactly one box, so by the sum rule the number of objects is the sum of the numbers in the <i>n</i> boxes. Each of those numbers is 0 or 1, so the sum is at most <i>n</i>. <span class="qed">∎</span></p>
<p class="why">The contents of the boxes are disjoint sets whose union is all the objects, which is exactly the situation the sum rule describes.</p></div>
<p>The principle is obvious, and the skill lies entirely in choosing what the boxes are. Among any 13 people, two were born in the same month: the boxes are the 12 months. A drawer holds black, white and grey socks; take 4 in the dark and two will match: the boxes are the 3 colours. In each case the principle tells you a pair exists without telling you which pair, and often that is all an argument needs. In Lesson 8 it will prove that a machine with a fixed amount of memory cannot count as high as it likes.</p>
<details class="reveal"><summary>Predict: in the sock drawer, is 3 socks enough to be sure of a match? What if there were 10 colours?</summary><p>No: 3 socks can be one of each colour, one per box, which is exactly what the pigeonhole principle says can happen when the objects do not outnumber the boxes. With 10 colours you need 11 socks. In general, for <i>n</i> boxes you need <i>n</i> + 1 objects, and <i>n</i> are not enough.</p></details>
<h2>Before the exercises</h2>
<p>The first exercise is four counting questions. For each one, decide first which rule fits: <em>or</em> between overlapping sets is inclusion–exclusion; a sequence of choices is the product rule; <em>at least one</em> is usually the complement rule. Then compute. Here is a worked example of the last kind, including the tempting wrong method.</p>
<p><b>How many strings of 3 letters from {a, b, c, d} contain at least one a?</b> Tempting: "choose where the a goes (3 ways), then fill the other two places any way (4 · 4 = 16), giving 48." That counts the string <i>aab</i> twice, once with the chosen a in the first place and once in the second, and <i>aaa</i> three times. The complement rule avoids the trap. All strings: 4³ = 64, by the product rule. Strings with no a: each letter comes from {b, c, d}, so 3³ = 27. Strings with at least one a: 64 − 27 = 37.</p>
<p>The second exercise asks you to recognise a correct pigeonhole proof. For any such proof, check three things: what the boxes are, that there are fewer boxes than objects, and that two objects in the same box really do give what the claim says.</p>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Adding the sizes of sets that overlap: the sum rule needs disjoint sets, and otherwise the overlap is counted twice. Using the product rule when the number of options changes with earlier choices in a way you have not accounted for: codes with no repeated letter are 26 · 25 · 24, not 26³. Counting "at least one" directly and counting some cases several times; use the complement. Forgetting the empty set and the whole set when counting subsets. Treating {1, 2} and (1, 2) as the same thing: a set has no order, a pair does. In a pigeonhole argument, having as many objects as boxes rather than more.</p>` },
        {
          ex: {
            id: 'ma-2-1', kind: 'answer', title: 'Counting without listing',
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
            id: 'ma-2-2', kind: 'choice', title: 'A proof by pigeonhole',
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
      title: 'Checking is not proving', summary: 'Why a thousand true cases prove nothing, what a proof actually is, and induction: the one technique that proves a claim about every number at once.',
      blocks: [
        `<p>Here is a claim about whole numbers: <i>for every</i> <i>n</i> ≥ 0, <i>n</i>² + <i>n</i> + 41 <i>is prime</i>. Check a few. <i>n</i> = 0 gives 41, <i>n</i> = 1 gives 43, <i>n</i> = 2 gives 47, <i>n</i> = 3 gives 53. All prime. It keeps working through <i>n</i> = 39. Let a program do the checking, then push it one step further.</p>`,
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
        { check: "A formula has held for the first 10,000 cases. What has been shown?", options: ["The formula is true for every n", "Nothing about the cases not checked; one counterexample would refute it", "The formula is probably false"], answer: 1, why: "Checking is not proving. n² + n + 41 is prime for forty values and fails at 40." },
        `<p>At <i>n</i> = 40 the value is 1681, which is 41 × 41. You could have seen this coming without a computer: 40² + 40 + 41 = 40 · 41 + 41 = 41 · 41. Forty true cases were not evidence of anything; the claim was simply false, and the first counterexample happened to sit at 40.</p>
<p>This is not a freak. Fermat believed that 2<sup>2<sup><i>n</i></sup></sup> + 1 is prime for every <i>n</i>; it is, for <i>n</i> = 0, 1, 2, 3, 4, and then 2<sup>32</sup> + 1 = 641 × 6 700 417. The claim "<i>n</i><sup>17</sup> + 9 and (<i>n</i> + 1)<sup>17</sup> + 9 never share a factor" is true for every <i>n</i> you could ever test by hand or by computer: its first counterexample has 52 digits. In mathematics, <em>checking</em> and <em>proving</em> are different activities, and only one of them settles a question.</p>
<div class="stmt"><p><span class="kind">Definition.</span> A <em>predicate</em> is a statement whose truth depends on a variable, such as <i>P</i>(<i>n</i>): "<i>n</i>² + <i>n</i> + 41 is prime". Give <i>n</i> a value and <i>P</i>(<i>n</i>) becomes a proposition, true or false, as in Lesson 1.</p>
<p><span class="kind">Definition.</span> A <em>counterexample</em> to the claim "for every <i>n</i>, <i>P</i>(<i>n</i>)" is one value of <i>n</i> for which <i>P</i>(<i>n</i>) is false.</p></div>
<p>The two definitions are not symmetric, and that asymmetry is the first lesson. <b>One counterexample refutes a "for every" claim completely.</b> But when there are infinitely many <i>n</i>, <b>no list of true cases proves it</b>, because the counterexample may be waiting in the cases you did not check. (When there are only finitely many cases and you check them all, that <em>is</em> a proof; the truth tables of Lesson 1 are proofs of exactly this kind.)</p>
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
<p>Think of a row of dominoes, one for each <i>n</i>. Condition (1) says the first domino falls. Condition (2) says every falling domino knocks over the next one. Then they all fall: domino 0 knocks over 1, which knocks over 2, and so on to any domino you name. (The principle works just as well starting from 1, or from any other whole number; then it proves <i>P</i>(<i>n</i>) for every <i>n</i> from that starting point on.)</p>
<p>Condition (1) is called the <em>base case</em>. Condition (2) is the <em>inductive step</em>, and inside it the assumption "<i>P</i>(<i>n</i>) is true" is called the <em>inductive hypothesis</em>. Here is the principle in use.</p>
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
<p>A rule like this, giving each value in terms of earlier ones, is called a <em>recurrence</em>. It lets us compute by hand:</p>
<table class="small"><tr><th><i>n</i></th><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td></tr><tr><th><i>M</i>(<i>n</i>)</th><td>0</td><td>1</td><td>3</td><td>7</td><td>15</td><td>31</td><td>63</td></tr></table>
<p>Each entry is one less than a power of two. That is a conjecture, and after the first part of this lesson you know what a conjecture is worth. Induction turns it into a theorem.</p>
<div class="stmt"><p><span class="kind">Theorem 3.</span> <i>M</i>(<i>n</i>) = 2<sup><i>n</i></sup> − 1 for every <i>n</i> ≥ 0.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> By induction on <i>n</i>, with <i>P</i>(<i>n</i>) the statement <i>M</i>(<i>n</i>) = 2<sup><i>n</i></sup> − 1.</p>
<p><b>Base case.</b> <i>M</i>(0) = 0 = 2<sup>0</sup> − 1. ✓</p>
<p><b>Inductive step.</b> Assume <i>M</i>(<i>n</i>) = 2<sup><i>n</i></sup> − 1 for some <i>n</i> ≥ 0. By the recurrence, <i>M</i>(<i>n</i> + 1) = 2<i>M</i>(<i>n</i>) + 1 = 2(2<sup><i>n</i></sup> − 1) + 1 = 2<sup><i>n</i>+1</sup> − 2 + 1 = 2<sup><i>n</i>+1</sup> − 1, which is <i>P</i>(<i>n</i> + 1). <span class="qed">∎</span></p></div>
<p>Read the theorem carefully: it says this <em>strategy</em> takes 2<sup><i>n</i></sup> − 1 moves. It does not say that no cleverer strategy could do better. That is a separate claim and needs a separate proof.</p>
<details class="reveal"><summary>Can any strategy do it in fewer than 2ⁿ − 1 moves?</summary><p>No. Let <i>L</i>(<i>n</i>) be the smallest number of moves any strategy can use. Look at the moment the largest disc moves for the first time. Just before that, the other <i>n</i> − 1 discs cannot be on its peg (they were above it) or on its destination (the rule), so they are all stacked on the third peg, and getting them there took at least <i>L</i>(<i>n</i> − 1) moves. After the largest disc reaches its final home, the <i>n</i> − 1 discs still have to be moved onto it: at least <i>L</i>(<i>n</i> − 1) moves more. So <i>L</i>(<i>n</i>) ≥ 2<i>L</i>(<i>n</i> − 1) + 1, and <i>L</i>(0) = 0. The same induction as in Theorem 3 (with ≥ in place of =) gives <i>L</i>(<i>n</i>) ≥ 2<sup><i>n</i></sup> − 1. Our strategy achieves exactly that, so <i>L</i>(<i>n</i>) = 2<sup><i>n</i></sup> − 1: the strategy is the best possible.</p></details>
<p>The legend says that monks are moving 64 discs, one move per second, and that the world ends when they finish. That is 2<sup>64</sup> − 1 seconds, about 585 billion years. You are safe.</p>
<h2>Induction and recursion are the same idea</h2>
<p>A recursive function has the same two parts as an induction proof: a base case it answers directly, and a rule that answers <i>n</i> in terms of a smaller case. Here is the recurrence for <i>M</i> written as Python.</p>`,
        { code: `def M(n):
    if n == 0:                 # base case
        return 0
    return 2 * M(n - 1) + 1    # the rule for n in terms of n - 1`, caption: 'The recurrence as a program' },
        { check: "An induction proof shows P(n) ⇒ P(n + 1) for every n, but never checks P(0). What has it proved?", options: ["P(n) for all n ≥ 1", "Nothing: the dominoes may all be standing", "P(n) for all n"], answer: 1, why: "Both parts are needed. Without a base case, each domino would knock the next, but none has fallen." },
        { check: "How many moves does the Tower of Hanoi strategy make for 10 discs?", options: ["100", "1023", "20"], answer: 1, why: "M(n) = 2M(n − 1) + 1 with M(0) = 0 gives M(n) = 2ⁿ − 1, proved by induction." },
        `<p>Running it for <i>n</i> = 5 and getting 31 checks one case. The proof of Theorem 3 is what tells you the function returns 2<sup><i>n</i></sup> − 1 for <em>every</em> <i>n</i>. When you write code you constantly make claims of this shape: this loop ends, this index never leaves the list, this function returns a sorted list. Tests check such claims on a few inputs; reasoning checks them on all of them. Good programmers do both.</p>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Believing a pattern because it held for many cases. Forgetting the base case: without it, "each domino knocks the next" proves nothing, because the dominoes may all be standing (Exercise 2 shows exactly this). Writing the inductive step as if <i>P</i>(<i>n</i> + 1) were already known, instead of assuming <i>P</i>(<i>n</i>) and deriving <i>P</i>(<i>n</i> + 1). Using the same letter for two different objects (writing both even numbers as 2<i>a</i>). And confusing "this method takes 2<sup><i>n</i></sup> − 1 moves" with "no method can do better": those are two theorems.</p>` },
        {
          ex: {
            id: 'ma-3-1', kind: 'answer', title: 'Find the counterexample',
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
            id: 'ma-3-2', kind: 'choice', title: 'A proof with a hole',
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
      title: 'Numbers, remainders and Euclid', summary: 'Divisibility and remainders stated exactly, arithmetic modulo m, Euclid\u2019s algorithm with a proof that it is right and fast, primes and trial division, proof by contradiction, and huge powers computed with small numbers.',
      blocks: [
        `<p>It is 9 o'clock. What time will it be in 100 hours? You do not count 100 hours on your fingers. You notice that every 12 hours the clock hand comes back where it started, so only the remainder of 100 divided by 12 matters: 100 = 8 × 12 + 4, so the clock moves 4 hours on, to 1 o'clock. That small trick, arithmetic where only remainders matter, is the heart of this lesson, and it ends up protecting every secure website.</p>
<p>The whole numbers are the oldest computing device. Long before machines, people had algorithms for them, and one of those algorithms, from Euclid's <i>Elements</i> of about 300 BC, runs inside every web browser today. This lesson builds the arithmetic of remainders from one definition, proves that Euclid's algorithm gives the right answer and gives it quickly, and ends with the method that Lesson 13's cipher depends on. Throughout, "integer" means a whole number: positive, negative or zero.</p>
<h2>Divisibility</h2>
<div class="stmt"><p><span class="kind">Definition.</span> For integers <i>d</i> and <i>n</i> with <i>d</i> ≠ 0, <i>d</i> <em>divides</em> <i>n</i>, written <i>d</i> | <i>n</i>, when <i>n</i> = <i>dk</i> for some integer <i>k</i>. We also say <i>d</i> is a <em>divisor</em> of <i>n</i>, and <i>n</i> is a <em>multiple</em> of <i>d</i>.</p></div>
<p>So 3 | 12 (take <i>k</i> = 4) and 3 | −12 (take <i>k</i> = −4), but 5 ∤ 12, since no integer <i>k</i> gives 5<i>k</i> = 12. Every <i>d</i> divides 0 (take <i>k</i> = 0), and 1 divides everything. Notice that <i>d</i> | <i>n</i> is a statement, true or false, not a number: it is not the same thing as <i>d</i>/<i>n</i> or <i>n</i>/<i>d</i>.</p>
<div class="stmt"><p><span class="kind">Theorem 1.</span> Let <i>d</i>, <i>a</i>, <i>b</i> be integers with <i>d</i> ≠ 0.</p>
<p>(a) If <i>d</i> | <i>a</i> and <i>d</i> | <i>b</i>, then <i>d</i> | (<i>sa</i> + <i>tb</i>) for all integers <i>s</i> and <i>t</i>. In particular <i>d</i> divides <i>a</i> + <i>b</i>, <i>a</i> − <i>b</i>, and every multiple of <i>a</i>.</p>
<p>(b) If <i>d</i> | <i>e</i> and <i>e</i> | <i>n</i>, then <i>d</i> | <i>n</i>.</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> (a) Since <i>d</i> | <i>a</i> and <i>d</i> | <i>b</i>, there are integers <i>k</i> and <i>l</i> with <i>a</i> = <i>dk</i> and <i>b</i> = <i>dl</i>. Then <i>sa</i> + <i>tb</i> = <i>sdk</i> + <i>tdl</i> = <i>d</i>(<i>sk</i> + <i>tl</i>), and <i>sk</i> + <i>tl</i> is an integer, so <i>d</i> | (<i>sa</i> + <i>tb</i>).</p>
<p class="why">This is the pattern of Lesson 3's proofs: unpack the definition, with a different letter for each unknown integer, do algebra, and match the definition again. Taking <i>s</i> = <i>t</i> = 1 gives the sum, <i>s</i> = 1 and <i>t</i> = −1 the difference, and <i>t</i> = 0 a multiple of <i>a</i>.</p>
<p>(b) Write <i>e</i> = <i>dk</i> and <i>n</i> = <i>el</i>. Then <i>n</i> = <i>d</i>(<i>kl</i>), so <i>d</i> | <i>n</i>. <span class="qed">∎</span></p>
<p class="why">The same three moves. Everything in the rest of this lesson that involves divisibility is reduced, in the end, to one of these two facts.</p></div>
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
<h2>Arithmetic modulo m</h2>
<div class="stmt"><p><span class="kind">Definition.</span> Let <i>m</i> &gt; 0. Integers <i>a</i> and <i>b</i> are <em>congruent modulo</em> <i>m</i>, written <i>a</i> ≡ <i>b</i> (mod <i>m</i>), when <i>m</i> | (<i>a</i> − <i>b</i>).</p></div>
<p>This is clock arithmetic: 14 ≡ 2 (mod 12), because 12 divides 14 − 2, and 2 p.m. is 14:00. The next theorem says congruence is the same thing as "same remainder", which is how you should picture it.</p>
<div class="stmt"><p><span class="kind">Theorem 3.</span> <i>a</i> ≡ <i>b</i> (mod <i>m</i>) if and only if <i>a</i> mod <i>m</i> = <i>b</i> mod <i>m</i>.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> By Theorem 2, write <i>a</i> = <i>q</i><sub>1</sub><i>m</i> + <i>r</i><sub>1</sub> and <i>b</i> = <i>q</i><sub>2</sub><i>m</i> + <i>r</i><sub>2</sub>, with both remainders between 0 and <i>m</i> − 1. Then <i>a</i> − <i>b</i> = (<i>q</i><sub>1</sub> − <i>q</i><sub>2</sub>)<i>m</i> + (<i>r</i><sub>1</sub> − <i>r</i><sub>2</sub>). If <i>r</i><sub>1</sub> = <i>r</i><sub>2</sub>, this is a multiple of <i>m</i>, so <i>a</i> ≡ <i>b</i>. Conversely, if <i>m</i> | (<i>a</i> − <i>b</i>), then by Theorem 1(a) <i>m</i> also divides (<i>a</i> − <i>b</i>) − (<i>q</i><sub>1</sub> − <i>q</i><sub>2</sub>)<i>m</i> = <i>r</i><sub>1</sub> − <i>r</i><sub>2</sub>, which lies strictly between −<i>m</i> and <i>m</i>; as in the proof of Theorem 2, it must be 0. <span class="qed">∎</span></p></div>
<p>The reason congruence is useful is that it survives addition and multiplication.</p>
<div class="stmt"><p><span class="kind">Theorem 4.</span> If <i>a</i> ≡ <i>a</i>′ and <i>b</i> ≡ <i>b</i>′ (mod <i>m</i>), then <i>a</i> + <i>b</i> ≡ <i>a</i>′ + <i>b</i>′ and <i>ab</i> ≡ <i>a</i>′<i>b</i>′ (mod <i>m</i>).</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> By hypothesis <i>m</i> divides <i>a</i> − <i>a</i>′ and <i>b</i> − <i>b</i>′. For the sum, (<i>a</i> + <i>b</i>) − (<i>a</i>′ + <i>b</i>′) = (<i>a</i> − <i>a</i>′) + (<i>b</i> − <i>b</i>′), which <i>m</i> divides by Theorem 1(a).</p>
<p>For the product, <i>ab</i> − <i>a</i>′<i>b</i>′ = <i>a</i>(<i>b</i> − <i>b</i>′) + <i>b</i>′(<i>a</i> − <i>a</i>′).</p>
<p class="why">Adding and subtracting <i>ab</i>′ in the middle: <i>ab</i> − <i>ab</i>′ + <i>ab</i>′ − <i>a</i>′<i>b</i>′. The point of the rearrangement is to make each term a multiple of something we know <i>m</i> divides.</p>
<p>That is a combination <i>s</i>(<i>b</i> − <i>b</i>′) + <i>t</i>(<i>a</i> − <i>a</i>′) with <i>s</i> = <i>a</i> and <i>t</i> = <i>b</i>′, so <i>m</i> divides it by Theorem 1(a). <span class="qed">∎</span></p>
<p class="why">Theorem 1(a) is stated for any integers <i>s</i> and <i>t</i>, and <i>a</i> and <i>b</i>′ are integers.</p></div>
<p>In practice Theorem 4 means: in a long sum or product where only the remainder mod <i>m</i> matters, you may replace any number by its remainder <em>at any step</em>, and the final remainder does not change. Applied to repeated multiplication, it also says that if <i>a</i> ≡ <i>a</i>′ then <i>a</i><sup><i>k</i></sup> ≡ <i>a</i>′<sup><i>k</i></sup>.</p>
<details class="reveal"><summary>Predict: what is the last digit of 7<sup>100</sup>? (The last digit of a positive integer is its remainder mod 10.)</summary><p>Work mod 10 and reduce at every step: 7<sup>1</sup> ≡ 7, 7<sup>2</sup> = 49 ≡ 9, 7<sup>3</sup> ≡ 9 · 7 = 63 ≡ 3, 7<sup>4</sup> ≡ 3 · 7 = 21 ≡ 1. Since 7<sup>4</sup> ≡ 1, Theorem 4 gives 7<sup>100</sup> = (7<sup>4</sup>)<sup>25</sup> ≡ 1<sup>25</sup> = 1. The last digit is 1, and you never needed the other 84 digits.</p></details>
<h2>Greatest common divisors and Euclid's algorithm</h2>
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
<p>Two things must be checked before an algorithm can be trusted: that it stops, and that its answer is right. It stops because the second number strictly decreases at every step (a remainder is less than the number divided by) and never goes below 0; a strictly decreasing sequence of non-negative integers cannot go on for ever. Its answer is right because, by Theorem 5, the gcd of the pair never changes from line to line, and on the last line it is gcd(<i>a</i>, 0) = <i>a</i>. A quantity that an algorithm keeps unchanged is called an <em>invariant</em>, and naming the invariant is the standard way to prove a loop correct.</p>
<p>How many steps does it take? The next theorem gives a guarantee.</p>
<div class="stmt"><p><span class="kind">Theorem 6.</span> If <i>a</i> ≥ <i>b</i> &gt; 0, then <i>a</i> mod <i>b</i> &lt; <i>a</i>/2.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Two cases. If <i>b</i> ≤ <i>a</i>/2, then <i>a</i> mod <i>b</i> &lt; <i>b</i> ≤ <i>a</i>/2. If <i>b</i> &gt; <i>a</i>/2, then <i>b</i> goes into <i>a</i> exactly once, so <i>a</i> mod <i>b</i> = <i>a</i> − <i>b</i> &lt; <i>a</i> − <i>a</i>/2 = <i>a</i>/2. <span class="qed">∎</span></p></div>
<p>After two steps of the algorithm, the remainder of the old first number has become the new first number, so by Theorem 6 the first number at least halves every two steps. A number can be halved only about log<sub>2</sub> <i>a</i> times before reaching 1, so the algorithm takes at most about 2 log<sub>2</sub> <i>a</i> steps. A 100-digit number is less than 2<sup>333</sup>, so a gcd of 100-digit numbers takes at most about 666 steps. This is the first result in the course where the <em>method</em>, and not the speed of the machine, makes the difference between possible and impossible.</p>
<h2>Primes, and testing for them</h2>
<div class="stmt"><p><span class="kind">Definition.</span> An integer <i>p</i> &gt; 1 is <em>prime</em> if its only positive divisors are 1 and <i>p</i>. An integer <i>n</i> &gt; 1 that is not prime is <em>composite</em>: it can be written <i>n</i> = <i>ab</i> with 1 &lt; <i>a</i>, <i>b</i> &lt; <i>n</i>.</p></div>
<div class="stmt"><p><span class="kind">Theorem 7.</span> Every integer <i>n</i> &gt; 1 has a prime divisor.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Among the divisors of <i>n</i> that are greater than 1 (there is at least one, <i>n</i> itself), let <i>p</i> be the smallest. Let <i>e</i> be any divisor of <i>p</i> with <i>e</i> &gt; 1. Since <i>e</i> | <i>p</i> and <i>p</i> | <i>n</i>, Theorem 1(b) gives <i>e</i> | <i>n</i>, so <i>e</i> is a divisor of <i>n</i> greater than 1, and therefore <i>e</i> ≥ <i>p</i>. A divisor of <i>p</i> cannot exceed <i>p</i>, so <i>e</i> = <i>p</i>. So the only divisor of <i>p</i> greater than 1 is <i>p</i> itself, and <i>p</i> is prime. <span class="qed">∎</span></p></div>
<div class="stmt"><p><span class="kind">Theorem 8 (trial division).</span> If <i>n</i> &gt; 1 is composite, then <i>n</i> has a divisor <i>d</i> with 1 &lt; <i>d</i> ≤ √<i>n</i>.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Write <i>n</i> = <i>ab</i> with 1 &lt; <i>a</i>, <i>b</i> &lt; <i>n</i>, naming the factors so that <i>a</i> ≤ <i>b</i>. If <i>a</i> were greater than √<i>n</i>, then <i>b</i> ≥ <i>a</i> &gt; √<i>n</i> too, and <i>ab</i> &gt; √<i>n</i> · √<i>n</i> = <i>n</i>, which is false. So <i>a</i> ≤ √<i>n</i>. <span class="qed">∎</span></p></div>
<p>Read as its contrapositive (Lesson 1), Theorem 8 is a test: if no integer from 2 up to √<i>n</i> divides <i>n</i>, then <i>n</i> is prime. That is why the <code>is_prime</code> function in Lesson 3 stopped its loop at <code>d * d &lt;= n</code>. To test 221 you need only try 2 to 14, and 13 works: 221 = 13 · 17. The method is fine for numbers with ten digits and hopeless for numbers with three hundred, since √<i>n</i> then has about 150 digits. Lesson 11 measures that gap, and Lesson 13 builds a lock out of it.</p>
<h2>Proof by contradiction</h2>
<p>Is there a largest prime? Euclid answered this too, with a kind of argument we have not used yet.</p>
<div class="stmt"><p><span class="kind">Proof by contradiction.</span> To prove a proposition <i>P</i>, assume ¬<i>P</i> and deduce from it something known to be false. Then ¬<i>P</i> cannot be true, so <i>P</i> is.</p></div>
<p>Why this is allowed: the argument proves the implication ¬<i>P</i> → (something false). By the truth table of → in Lesson 1, an implication with a false conclusion is true only when its hypothesis is false. So ¬<i>P</i> is false, and <i>P</i> is true.</p>
<div class="stmt"><p><span class="kind">Theorem 9 (Euclid).</span> There are infinitely many primes.</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> Suppose, for contradiction, that there are only finitely many primes, and list all of them: <i>p</i><sub>1</sub>, <i>p</i><sub>2</sub>, …, <i>p</i><sub><i>k</i></sub>.</p>
<p class="why">This is ¬<i>P</i>, stated so that we can use it. Having a complete list is what "finitely many" gives us.</p>
<p>Let <i>N</i> = <i>p</i><sub>1</sub><i>p</i><sub>2</sub> ⋯ <i>p</i><sub><i>k</i></sub> + 1. By Theorem 7, <i>N</i> &gt; 1 has a prime divisor <i>p</i>, and since the list contains every prime, <i>p</i> is one of the <i>p</i><sub><i>i</i></sub>. Then <i>p</i> divides the product <i>p</i><sub>1</sub> ⋯ <i>p</i><sub><i>k</i></sub> and also divides <i>N</i>, so by Theorem 1(a) it divides their difference, which is 1. But no prime divides 1, since primes are greater than 1. <span class="qed">∎</span></p>
<p class="why">"A prime divides 1" is the false statement the method needs. Having reached it, we conclude that the assumption was false: the primes cannot be listed in a finite list.</p></div>
<p>A common misreading: the proof does <em>not</em> say that <i>N</i> is prime. 2 · 3 · 5 · 7 · 11 · 13 + 1 = 30031 = 59 · 509. It says only that <i>N</i>'s prime factors are missing from the list. Lesson 10 uses the same method to show that a certain program cannot exist.</p>
<h2>Huge powers, small numbers</h2>
<p>Lesson 13 needs <i>b</i><sup><i>e</i></sup> mod <i>m</i> where <i>e</i> has hundreds of digits. Multiplying <i>e</i> times is out of the question. But squaring doubles an exponent in one step, <i>b</i>, <i>b</i><sup>2</sup>, <i>b</i><sup>4</sup>, <i>b</i><sup>8</sup>, …, and every exponent is a sum of powers of 2: that is what its binary digits say. Since 13 is 1101 in binary, <i>b</i><sup>13</sup> = <i>b</i><sup>8</sup> · <i>b</i><sup>4</sup> · <i>b</i><sup>1</sup>. By Theorem 4 we may reduce mod <i>m</i> after every multiplication, so no number ever exceeds <i>m</i>².</p>
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
print(mod_pow(2, 10 ** 18, 1000000007), pow(2, 10 ** 18, 1000000007))`, caption: 'Each line prints (answer, steps). Even the worst case for Euclid, consecutive Fibonacci numbers, takes under 30 steps, and 10¹⁸ needs only 60 squarings. Python\u2019s built-in pow(b, e, m) uses the same method and agrees.' },
        { check: "What is gcd(48, 18) by Euclid's algorithm?", options: ["6", "3", "12"], answer: 0, why: "(48, 18) → (18, 12) → (12, 6) → (6, 0). The answer is 6." },
        { check: "What is −7 mod 5 by the division theorem?", options: ["−2", "3", "2"], answer: 1, why: "The remainder must satisfy 0 ≤ r < 5: −7 = (−2)·5 + 3. Python agrees; C++ gives −2." },
        `<p>Change the numbers and watch the step counts. However large you make them, gcd stays below about twice the number of binary digits of the larger input, and mod_pow's passes equal the number of binary digits of <i>e</i>.</p>
<h2>Before the exercises</h2>
<p>The first exercise is Euclid's algorithm by hand, laid out as in the table for gcd(252, 198): on each line, find <i>q</i> and <i>r</i> with <i>a</i> = <i>qb</i> + <i>r</i> and 0 ≤ <i>r</i> &lt; <i>b</i>, then move <i>b</i> and <i>r</i> up to the next line. The second asks five short questions. For a remainder of a power, find a small power that is ≡ 1, as in the 7<sup>100</sup> example, and use Theorem 4. For a smallest prime divisor, use Theorem 8 and try divisors in order. For a negative number, go back to Theorem 2: the remainder must be between 0 and <i>d</i> − 1.</p>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Reading <i>d</i> | <i>n</i> as a fraction; it is a true-or-false statement. A negative remainder: by Theorem 2, −7 mod 5 is 3, not −2, although C++ says −2. Forgetting that gcd(<i>n</i>, 0) = <i>n</i>. In Euclid's algorithm, writing the quotient where the remainder belongs. Stopping trial division too early, or going far past √<i>n</i> for nothing. In repeated squaring, forgetting to reduce <i>base</i> mod <i>m</i> after squaring, so it grows huge anyway. Reading Euclid's proof as "the product of the primes plus one is prime"; it says only that its prime factors are new.</p>` },
        { check: "To test whether 101 is prime by trial division, which divisors must you try?", options: ["2 to 100", "2 to 10, since 10² ≤ 101 < 11²", "2 to 50"], answer: 1, why: "A composite n has a divisor at most √n. If none up to 10 divides 101, it is prime." },
        {
          ex: {
            id: 'ma-4-1', kind: 'table', title: 'Euclid by hand',
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
            id: 'ma-4-2', kind: 'answer', title: 'Remainders, primes and powers',
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
<li>Proof by contradiction: assume ¬<i>P</i>, reach a false statement. That is how Euclid showed there are infinitely many primes.</li>
<li>Repeated squaring computes <i>b</i><sup><i>E</i></sup> mod <i>m</i> in about log<sub>2</sub> <i>E</i> passes, with an invariant as its proof.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Graphs and paths', summary: 'Dots and lines as a model of almost anything: degrees and the handshake theorem, walks and Euler\u2019s bridges, breadth-first search with a proof that it finds shortest paths, and trees.',
      blocks: [
        `<p>In 1967 the psychologist Stanley Milgram asked people in Nebraska to get a letter to a stranger in Boston, by passing it only to someone they knew personally, who would pass it on in the same way. The letters that arrived took about six steps on average, which gave us the phrase "six degrees of separation". In 2016, Facebook measured its own network of 1.6 billion people and found an average of 3.57 degrees. Both are questions about the shortest paths in a graph, and by the end of this lesson you will know the algorithm that answers them.</p>
<p>Friendships, road maps, web links, the positions of a puzzle and the moves between them, the parts of a program and which ones depend on which: each of these is a set of things with connections between some pairs of them. The mathematical object that captures exactly that, and nothing more, is a <em>graph</em>. A fact proved about graphs is a fact about all of those at once.</p>
<h2>Graphs</h2>
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
        { check: "Can 5 people each shake hands with exactly 3 of the others?", options: ["Yes", "No: the degree sum would be 15, which is odd", "Only if one person shakes twice"], answer: 1, why: "The degree sum is twice the number of edges, so it is even. Five vertices of degree 3 is impossible." },
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
<h2>Euler and the bridges of Königsberg</h2>
<p>Graph theory began with a puzzle. The city of Königsberg had seven bridges joining two islands and the two banks of a river, and its citizens wondered whether a stroll could cross every bridge exactly once. In 1736 Euler replaced the city by four vertices, one for each piece of land, and seven edges, one for each bridge. Some pieces of land were joined by two bridges, so this needs a slightly more general object, a <em>multigraph</em>, in which two vertices may be joined by several edges; degrees still count every edge.</p>
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
        { check: "A connected graph has exactly 4 vertices of odd degree. Does it have an Euler walk?", options: ["Yes", "No: an Euler walk needs 0 or 2 odd vertices", "Only if it has no cycles"], answer: 1, why: "Every vertex in the middle of the walk is entered and left, using edges in pairs. Only the two ends can be odd." },
        `<p>Every vertex that gets a label enters the queue once and leaves it once, and each time a vertex leaves, its list of neighbours is read once. So the work is proportional to the number of vertices plus the number of edges: fast, even for a map of a whole country. That it also gives the right answer needs a proof.</p>
<div class="stmt"><p><span class="kind">Theorem 3.</span> When BFS finishes, every vertex reachable from the start <i>s</i> has a label, and the label of each vertex <i>w</i> is exactly d(<i>s</i>, <i>w</i>).</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> First, no label is too small. A vertex is labelled one more than a neighbour that was already labelled, so following the "labelled from" links back to <i>s</i> gives a walk from <i>s</i> to <i>w</i> whose length is exactly the label. A walk that long exists, so d(<i>s</i>, <i>w</i>) is at most the label.</p>
<p class="why">This half is true of any search that labels each new vertex one more than its discoverer, in any order. The order matters only for the other half.</p>
<p>Second, the queue keeps its labels in order: at every moment the labels in the queue, from front to back, never decrease, and the last is at most one more than the first. This holds at the start (one vertex), and each step keeps it: the front vertex, with the smallest label <i>k</i>, is removed, and new vertices are added at the back with label <i>k</i> + 1. So vertices leave the queue in order of their labels.</p>
<p class="why">This is an invariant, like Euclid's gcd in Lesson 4: true at the start and kept by every step, so true throughout, by induction on the number of steps.</p>
<p>Now suppose some vertex got a label larger than its distance, and among all such vertices choose one, <i>w</i>, with the smallest distance, say d(<i>s</i>, <i>w</i>) = <i>k</i> + 1. On a shortest path from <i>s</i> to <i>w</i>, the vertex <i>v</i> just before <i>w</i> has distance <i>k</i>, and so, by the choice of <i>w</i>, <i>v</i>'s label is correct: it is <i>k</i>. When <i>v</i> leaves the queue, <i>w</i> either has no label yet, in which case it gets <i>k</i> + 1, or it was already labelled from some vertex that left the queue before <i>v</i>, whose label is therefore at most <i>k</i>; either way <i>w</i>'s label is at most <i>k</i> + 1. That contradicts the choice of <i>w</i>. So no label is too large, and with the first half, every label is exactly right. The same argument shows every reachable vertex gets a label. <span class="qed">∎</span></p>
<p class="why">Choosing a <em>smallest</em> counterexample and showing it cannot exist is a proof by contradiction (Lesson 4) built on the same foundation as induction (Lesson 3): if there were any counterexample, there would be a smallest one.</p></div>
<p>The same search solves puzzles. Make each position of a puzzle a vertex and each legal move an edge; then a shortest solution is a shortest path, and BFS finds it without knowing anything about the puzzle. One algorithm, many problems: that is the payoff of a good abstraction.</p>
<h2>Trees</h2>
<div class="stmt"><p><span class="kind">Definition.</span> A <em>cycle</em> is a walk of length at least 3 that starts and ends at the same vertex and repeats no other vertex. A <em>tree</em> is a connected graph with no cycle. A vertex of degree 1 is a <em>leaf</em>.</p></div>
<p>Family trees, folders inside folders, and the pattern of calls made by a recursive function are all trees. The piece of the towns graph made of Dell, Elm and the road between them is a tree; Ash, Birch and Cedar form a cycle.</p>
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
    "Fir":   ["Gum"],
    "Gum":   ["Fir"],
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

print(bfs(roads, "Ash"))
print(bfs(roads, "Fir"))`, caption: 'From Ash, every town in its piece of the map gets its distance, and Fir and Gum are absent: they are not reachable. Add "Fir" to Elm\u2019s list and "Elm" to Fir\u2019s, predict the new distances from Ash, and run.' },
        { check: "A tree has 12 vertices. How many edges?", options: ["12", "11", "13"], answer: 1, why: "Every tree with n vertices has exactly n − 1 edges, proved by removing a leaf and using induction." },
        `<p>Try changing <code>queue.pop(0)</code> to <code>queue.pop()</code>, which takes from the <em>back</em>. The search still reaches the same vertices, but the second half of the proof of Theorem 3 depended on the queue's order, and on some graphs the labels now come out too large. A five-vertex ring shows it: add <code>ring = {"A": ["B", "E"], "B": ["A", "C"], "C": ["B", "D"], "D": ["C", "E"], "E": ["A", "D"]}</code> and <code>print(bfs(ring, "A"))</code>. With <code>pop(0)</code>, C gets 2; with <code>pop()</code>, C gets 3, although A, B, C is a path of length 2.</p>
<h2>Before the exercises</h2>
<p>The first exercise asks five short questions, each settled by one theorem of this lesson; decide which theorem first. The second asks you to run BFS by hand on a small graph, recording each vertex's label and the vertex it was labelled from. Process the queue strictly front to back, and read each neighbour list in the order given; when a vertex could be labelled from two different vertices, it is labelled by whichever leaves the queue first.</p>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> In a neighbour dictionary, listing an edge from only one side. Forgetting that the degree sum counts every edge twice. Reading Euler's theorem backwards: 0 or 2 odd vertices is necessary for an Euler walk, and (for a connected graph) also sufficient, but a disconnected graph can pass the degree test and still have no Euler walk. In BFS, taking from the back of the list instead of the front, or labelling a vertex a second time when it is reached again. Calling any connected graph a tree: a tree must also have no cycle, and then it has exactly <i>n</i> − 1 edges.</p>` },
        {
          ex: {
            id: 'ma-5-1', kind: 'answer', title: 'One theorem each',
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
            id: 'ma-5-2', kind: 'table', title: 'Breadth-first search by hand',
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
<li>BFS labels vertices in layers using a queue. The labels are exact distances, because the queue keeps labels in order (an invariant) and a smallest counterexample cannot exist.</li>
<li>A tree is connected with no cycle; it has a leaf, and exactly <i>n</i> − 1 edges, by induction.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Machines with a finite memory', summary: 'Finite automata defined exactly: alphabets, strings and languages; designing a machine by deciding what it must remember; proving it right by induction; and complements.',
      blocks: [
        `<p>A combination lock with a keypad opens as soon as the last three keys pressed are 1, 2, 3, whatever came before. It does not need to remember everything you have typed, only how much of "123" you have just typed: nothing, "1", or "12". Machines that get by on a fixed, small memory like this are everywhere, in lifts, traffic lights, vending machines and the text editor you type code in.</p>
<p>Strip a computer down as far as it will go and you get this: a machine that reads its input one symbol at a time, and at every moment is in one of a fixed, finite number of <em>states</em>. It has no other memory. When it reads a symbol, it moves to a new state that depends only on its current state and that symbol. When the input runs out, it answers yes or no according to the state it has ended in.</p>
<p>This is a <em>finite automaton</em>. A turnstile is one, with the states "locked" and "unlocked". So is the part of a text editor that checks whether what you typed looks like a number. This lesson defines these machines exactly, shows how to design one, and proves that a design is right. The next lesson describes the same machines with patterns, and Lesson 8 proves what no such machine can do.</p>
<h2>Alphabets, strings and languages</h2>
<div class="stmt"><p><span class="kind">Definition.</span> An <em>alphabet</em> is a finite set of symbols, such as {0, 1} or {a, b}. A <em>string</em> over an alphabet is a finite sequence of its symbols, such as 0110. Its <em>length</em> is the number of symbols. The string of length 0 is the <em>empty string</em>, written ε. A <em>language</em> is a set of strings.</p></div>
<p>For example, over {0, 1}, the strings that end in 01 form a language: it contains 01, 1101 and 0001, and not 10 or ε. So do the strings with an even number of 1s, which includes ε, since 0 is even. A language may be infinite, as both of these are, even though every string in it is finite.</p>
<h2>Deterministic finite automata</h2>
<div class="stmt"><p><span class="kind">Definition.</span> A <em>deterministic finite automaton</em> (DFA) consists of</p>
<p>a finite set <i>Q</i> of <em>states</em>; an alphabet Σ; a <em>transition function</em> δ, which gives for every state <i>q</i> and every symbol <i>c</i> exactly one next state δ(<i>q</i>, <i>c</i>); a <em>start state</em> <i>q</i><sub>0</sub>; and a set <i>F</i> ⊆ <i>Q</i> of <em>accepting states</em>.</p>
<p>To run it on a string, begin in <i>q</i><sub>0</sub> and, for each symbol in turn, move from the current state <i>q</i> to δ(<i>q</i>, <i>c</i>). The machine <em>accepts</em> the string if the state it ends in is in <i>F</i>, and <em>rejects</em> it otherwise. The <em>language of the machine</em> is the set of strings it accepts.</p></div>
<p>"Deterministic" means there is never a choice: every state has exactly one arrow for every symbol, so the input decides the whole run. Here is a machine with three states, <i>a</i>, <i>b</i> and <i>c</i>. Type a string and step through it.</p>`,
        { fig: 'dfa', machine: 'ends01', caption: 'Start in a, the state with the incoming arrow. c, the double circle, is the only accepting state. Try 1101, 010 and the empty string.' },
        { check: "What is a state of a DFA?", options: ["A position in the input", "Everything the machine remembers about what it has read so far", "A symbol of the alphabet"], answer: 1, why: "Design a machine by deciding what each state means about the input so far. The machine has no other memory." },
        `<p>The whole machine is its transition table: one row per state, one column per symbol.</p>
<table class="small"><tr><th>state</th><th>on 0</th><th>on 1</th></tr><tr><td><i>a</i> (start)</td><td><i>b</i></td><td><i>a</i></td></tr><tr><td><i>b</i></td><td><i>b</i></td><td><i>c</i></td></tr><tr><td><i>c</i> (accepting)</td><td><i>b</i></td><td><i>a</i></td></tr></table>
<p>Its language is the strings ending in 01. To see why, read each state as a fact about what has been read so far: <i>c</i> means "the input so far ends in 01"; <i>b</i> means "it ends in 0"; <i>a</i> means everything else, "it is empty or ends in 11". The states are not positions in the string or counts of anything. They are <em>everything the machine remembers</em>, and designing a machine is deciding what is the least it must remember to give the right answer at the end.</p>
<h2>Designing a machine, and proving it right</h2>
<p>Suppose we want a machine for the strings over {0, 1} with an even number of 1s. It cannot remember how many 1s it has seen, because a count can grow without limit and the machine has only finitely many states. But it does not need the count, only whether the count is even or odd. Two states suffice.</p>
<table class="small"><tr><th>state</th><th>on 0</th><th>on 1</th></tr><tr><td><i>even</i> (start, accepting)</td><td><i>even</i></td><td><i>odd</i></td></tr><tr><td><i>odd</i></td><td><i>odd</i></td><td><i>even</i></td></tr></table>
<p>Reading a 0 changes nothing; reading a 1 changes the parity. The start state is <i>even</i>, because before anything is read no 1s have been seen, and zero is even. Checking a few strings is not a proof, as Lesson 3 insisted. The proof states what each state means and shows that the meaning survives every step, by induction on the length of the input.</p>
<div class="stmt"><p><span class="kind">Theorem 1.</span> For every string <i>w</i> over {0, 1}, the machine above, after reading <i>w</i>, is in state <i>even</i> if <i>w</i> contains an even number of 1s and in state <i>odd</i> otherwise. So its language is the strings with an even number of 1s.</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> By induction on the length of <i>w</i>. <b>Base case.</b> The only string of length 0 is ε, which has zero 1s, and the machine is in its start state, <i>even</i>.</p>
<p class="why">Base case: the claim for the shortest input. The start state has to mean the right thing about the empty string.</p>
<p><b>Inductive step.</b> Suppose the claim holds for a string <i>w</i>, and consider <i>wc</i>, the string <i>w</i> followed by one more symbol <i>c</i>. If <i>c</i> = 0, then <i>wc</i> has the same number of 1s as <i>w</i>, and the machine stays in the same state, so the claim still holds. If <i>c</i> = 1, then <i>wc</i> has one more 1, so its parity is the opposite of <i>w</i>'s, and the machine switches between <i>even</i> and <i>odd</i>, so again the claim holds.</p>
<p class="why">Every string of length <i>n</i> + 1 is some string of length <i>n</i> followed by one symbol, so this covers all of them. The two cases are the two columns of the table: checking each transition against the meaning of its states is the whole proof.</p>
<p>By induction the claim holds for every string. The accepting state is <i>even</i>, so the machine accepts exactly the strings with an even number of 1s. <span class="qed">∎</span></p></div>
<p>This is the general method, and it is how every machine in this course can be proved correct: write down in words what each state means about the input read so far, check that the start state means the right thing about ε, check that every entry of the table turns a true meaning into a true meaning, and check that the accepting states are exactly those whose meaning is "accept".</p>
<h2>Arithmetic with finite memory</h2>
<p>A harder one: accept the binary numerals of the multiples of 3, reading from the most significant bit. The string 110 means six, which should be accepted; 111 means seven, which should not. That seems to need the whole number, which can be larger than any fixed memory. But Lesson 4 says otherwise. If the bits read so far spell the number <i>v</i> and the next bit is <i>b</i>, the bits read after it spell 2<i>v</i> + <i>b</i>, and by Lesson 4's Theorem 4 its remainder mod 3 depends only on <i>v</i> mod 3 and <i>b</i>. So the machine needs to remember only the remainder so far: three states, <i>r</i><sub>0</sub>, <i>r</i><sub>1</sub> and <i>r</i><sub>2</sub>.</p>
<table class="small"><tr><th>state</th><th>on 0</th><th>on 1</th></tr><tr><td><i>r</i><sub>0</sub> (start, accepting)</td><td><i>r</i><sub>0</sub> &nbsp;(2·0 + 0 = 0)</td><td><i>r</i><sub>1</sub> &nbsp;(2·0 + 1 = 1)</td></tr><tr><td><i>r</i><sub>1</sub></td><td><i>r</i><sub>2</sub> &nbsp;(2·1 + 0 = 2)</td><td><i>r</i><sub>0</sub> &nbsp;(2·1 + 1 = 3 ≡ 0)</td></tr><tr><td><i>r</i><sub>2</sub></td><td><i>r</i><sub>1</sub> &nbsp;(2·2 + 0 = 4 ≡ 1)</td><td><i>r</i><sub>2</sub> &nbsp;(2·2 + 1 = 5 ≡ 2)</td></tr></table>`,
        { fig: 'dfa', machine: 'div3', caption: 'Divisibility by 3. Try 110 (six), 1001 (nine) and 111 (seven). The machine never computes the number, only its remainder.' },
        { check: "Can a DFA accept exactly the strings with as many 0s as 1s?", options: ["Yes, with enough states", "No: it would need an unbounded count, and it has finitely many states", "Yes, with two states"], answer: 1, why: "A finite machine can keep a remainder but not a count that grows without limit. Lesson 8 proves it." },
        `<div class="stmt"><p><span class="kind">Theorem 2.</span> For every binary string <i>w</i>, if <i>w</i> spells the number <i>v</i>, then after reading <i>w</i> the machine is in state <i>r</i><sub><i>k</i></sub> with <i>k</i> = <i>v</i> mod 3. So it accepts exactly the binary numerals of multiples of 3.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> By induction on the length of <i>w</i>. The empty string spells 0 (no bits, no value), and the machine starts in <i>r</i><sub>0</sub>. If <i>w</i> spells <i>v</i> and the machine is in <i>r</i><sub><i>k</i></sub> with <i>k</i> = <i>v</i> mod 3, then <i>wb</i> spells 2<i>v</i> + <i>b</i>. By Lesson 4's Theorem 4, 2<i>v</i> + <i>b</i> ≡ 2<i>k</i> + <i>b</i> (mod 3), and the table sends <i>r</i><sub><i>k</i></sub> on <i>b</i> to <i>r</i><sub>(2<i>k</i> + <i>b</i>) mod 3</sub>, as the working in each cell shows. So the claim holds for <i>wb</i>. The accepting state is <i>r</i><sub>0</sub>, remainder 0. <span class="qed">∎</span></p></div>
<p>The same construction works for any divisor <i>m</i>, with <i>m</i> states. What a finite machine cannot hold is an unbounded number; what it can hold is any fixed amount of information about one, such as its remainder.</p>
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
print("disagreements with n % 3 == 0:", disagreements)`, caption: 'The machine and the arithmetic agree on all 64 numbers. Change "accept" to ["r1", "r2"] and the machine accepts exactly the rest, as Theorem 3 says.' },
        { check: "How do you get a DFA for the complement of a language, from a DFA for the language?", options: ["Reverse the arrows", "Swap accepting and non-accepting states", "Add a new start state"], answer: 1, why: "The run on any string is the same; only the verdict at the end flips." },
        `<p>Sixty-four agreements are evidence; Theorem 2 is the proof, and it covers numbers far too long for any test. The program is still useful: when a design is wrong, a check like this finds a counterexample quickly.</p>
<h2>What a finite machine cannot do</h2>
<p>A machine with <i>k</i> states can be in only <i>k</i> different situations, however long its input. That is its strength, because it needs almost no memory and takes one step per symbol, and it is exactly its weakness: Lesson 8 proves that some simple questions need more than any fixed amount of memory, so no finite automaton can answer them. Simple is not the same as weak, though. Every search box that accepts a pattern builds a finite automaton and runs your text through it, and the first stage of every compiler is a finite automaton that splits source code into words.</p>
<h2>Before the exercises</h2>
<p>The first exercise runs the divisibility machine by hand on a longer string, recording the number spelled so far and the state, so you can watch Theorem 2 hold line by line. The second asks you to design a machine by filling in its table. Use the method: name what each state means about the input so far, then for each state and symbol ask, "if that was true and I now read this symbol, what is true now?"</p>`,
        `<details class="reveal"><summary>Puzzle: how many states does a machine need for the keypad lock above, over the keys 0 to 9, and what should it do after "12" if the next key is 1?</summary><p>Four: nothing useful yet, "just typed 1", "just typed 12", and "just typed 123" (open). After "12", a 1 goes back to "just typed 1", not to the start, because that 1 might begin a new 123. A 3 opens the lock, and any other key goes back to the start. This is the "ends in 01" machine of this lesson with one more state, and the same care is needed about what the last few symbols could still become.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> A missing entry in the table, so the machine has nowhere to go on some symbol; a DFA needs exactly one next state for every state and symbol. Making states stand for positions in the input rather than for facts about what has been read. Trying to remember a count, which a finite machine cannot, instead of a remainder or a yes-or-no fact. Forgetting the empty string: the start state must be accepting exactly when ε belongs to the language. Believing a machine is correct because it passed some tests, instead of checking every transition against the meaning of its states.</p>` },
        {
          ex: {
            id: 'ma-6-1', kind: 'table', title: 'Run the machine by hand',
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
            id: 'ma-6-2', kind: 'table', title: 'Design a machine',
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
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Patterns, and the double vowel system', summary: 'Regular expressions: a notation for languages built from three operations. Then a real writing system, the double vowel spelling of Ojibwe, read by a three-state machine; why a code whose letters overlap needs a rule for reading; and what a pattern can and cannot say about a language.',
      blocks: [
        `<p>The home page of this site greets you with <span lang="ciw">Boozhoo</span>, the Ojibwe word for hello. Count its letters. In English you would say seven: B, o, o, z, h, o, o. A reader of Ojibwe says four: <b>b</b>, <b>oo</b>, <b>zh</b>, <b>oo</b>. The word is spelled in the <em>double vowel system</em>, and in that system <b>oo</b> is one letter, a long vowel, and <b>zh</b> is one letter, a consonant (the sound in the middle of \"measure\").</p>
<p>Turning a string of typed characters into a string of letters is exactly the job Lesson 6 said a finite automaton does at the start of every compiler: before Python can run <code>x == y</code>, something must decide that <code>==</code> is one symbol and not two. This lesson gives such jobs a notation, the <em>regular expression</em>, which is how a search box or a programming language lets you write a pattern. Then it puts the notation and Lesson 6's machines to work on a real writing system, and proves what they can tell us about it and what they cannot.</p>
<h2>Regular expressions</h2>
<p>A regular expression is a formula whose value is a language, in the sense of Lesson 6: a set of strings. It is built from single symbols with three operations.</p>
<div class="stmt"><p><span class="kind">Definition.</span> The <em>regular expressions</em> over an alphabet Σ, and the language <i>L</i>(<i>R</i>) that each one describes, are given by these rules.</p>
<p>ε is a regular expression, and <i>L</i>(ε) = {ε}. Each symbol <i>c</i> of Σ is a regular expression, and <i>L</i>(<i>c</i>) = {<i>c</i>}.</p>
<p>If <i>R</i> and <i>S</i> are regular expressions, so are these three. The <em>union</em> <i>R</i>|<i>S</i> describes <i>L</i>(<i>R</i>) ∪ <i>L</i>(<i>S</i>). The <em>concatenation</em> <i>RS</i> describes every string <i>xy</i> with <i>x</i> in <i>L</i>(<i>R</i>) and <i>y</i> in <i>L</i>(<i>S</i>). The <em>star</em> <i>R</i>* describes every string made by joining zero or more strings of <i>L</i>(<i>R</i>), one after another; zero of them gives ε.</p></div>
<p>Parentheses group, as in algebra, and there is an order of operations: star first, then concatenation, then union. So <code>ab*</code> means <code>a(b*)</code>, an a followed by any number of b's, and not <code>(ab)*</code>; and <code>a|bc</code> means <code>a|(bc)</code>. Programming languages add shorthands, such as <code>[abc]</code> for <code>a|b|c</code> and <code>R+</code> for <code>RR*</code>, but nothing that the three operations cannot already say.</p>
<div class="tbl-wrap"><table class="small">
<tr><th>expression over {0, 1}</th><th>the language it describes</th></tr>
<tr><td><code>(0|1)*01</code></td><td>any string at all, then 01: the strings ending in 01, the language of Lesson 6's first machine</td></tr>
<tr><td><code>0*(10*10*)*</code></td><td>some 0s, then blocks that each hold exactly two 1s: the strings with an even number of 1s, Lesson 6's Theorem 1</td></tr>
<tr><td><code>(0|1)(0|1)(0|1)</code></td><td>the eight strings of length 3</td></tr>
<tr><td><code>1(0|1)*|0</code></td><td>the binary numerals with no unnecessary leading 0: 0, 1, 10, 11, 100, …</td></tr>
</table></div>
<p>Reading an expression is a matter of asking, for a given string, whether it can be cut into pieces that the parts of the expression allow. Designing one is like designing a machine: decide the shape every string of the language has, then write that shape down.</p>`,
        `<details class="reveal"><summary>Predict: which of 0110, 1010, 111 and the empty string does <code>0*(10*10*)*</code> describe?</summary><p>0110, 1010 and ε; not 111. 0110 is the 0* part \"0\", then one block \"110\" (a 1, no 0s, a 1, one 0). 1010 is one block, \"1\", \"0\", \"1\", \"0\". The empty string takes zero 0s and zero blocks. 111 has three 1s, and every block uses up exactly two, so no way of cutting it works.</p></details>`,
        `<p>Every pattern in the table has a finite automaton that accepts the same language: Lesson 6 built two of them. That is no accident.</p>
<div class="stmt"><p><span class="kind">Theorem 1 (Kleene, 1956).</span> A language is described by some regular expression if and only if some DFA accepts it. Such languages are called <em>regular</em>.</p></div>
<p>We do not prove this here; the proof is a construction in each direction, and the direction from expressions to machines is what a search box does with the pattern you type. What matters for this lesson is its meaning: a regular expression and a finite automaton are two ways of writing down the same thing, one as a description and one as a machine that checks it. And Lesson 8's limits apply to both: when Lesson 8 proves that no DFA accepts some language, it proves that no regular expression describes it either.</p>
<h2>A real alphabet: the double vowel system</h2>
<p>Ojibwe, the language of the Anishinaabe people of the Great Lakes, has been written in several ways. The <em>double vowel system</em>, developed by Charles Fiero working with fluent speakers, is widely used by teachers and by the Ojibwe People's Dictionary, the source of every Ojibwe word on this site. It uses English letters for Ojibwe sounds, on one principle: each letter stands for one sound. Its name comes from its vowels. Ojibwe has three short vowels, written <b>a</b>, <b>i</b>, <b>o</b>, and four long ones. Three long vowels are written by doubling a short one, <b>aa</b>, <b>ii</b>, <b>oo</b>; the fourth, <b>e</b>, has no short partner, so a single character is enough.</p>
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
        { check: "Which strings does <code>(ab)*</code> describe?", options: ["Only ab", "ε, ab, abab, ababab, …", "a followed by any number of b"], answer: 1, why: "Star means zero or more copies, so the empty string is included. ab* would be a followed by any number of b." },
        { check: "By Kleene's theorem, a language has a regular expression exactly when…", options: ["it is finite", "some DFA accepts it", "it is countable"], answer: 1, why: "Regular expressions and finite automata describe the same languages: the regular ones." },
        `<h2>Which strings can be split?</h2>
<p>Not every string of the 20 characters can be read as letters: in \"cat\" the c has nowhere to go. The next theorem says exactly which strings can, and its proof is the method of Lesson 3.</p>
<div class="stmt"><p><span class="kind">Theorem 2.</span> A string over the 20 characters can be split into letters of the double vowel system if and only if every c in it is immediately followed by an h.</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> <b>Only if.</b> In a split, every character belongs to exactly one letter. The only letter that contains a c is <b>ch</b>, in which the c is followed by an h. So every c is followed by an h.</p>
<p class="why">An \"if and only if\" is two theorems, one in each direction, and each needs its own proof.</p>
<p><b>If.</b> By induction on the length of the string <i>w</i>: assume the claim for every shorter string, and suppose every c in <i>w</i> is followed by an h. If <i>w</i> is empty, it is split into no letters at all. If <i>w</i> starts with c, it starts with <b>ch</b>; if it starts with any other character, that character is a letter. Either way, take that first letter off. What is left still has every c followed by an h, because the h that follows each of its c's is still there: no letter ends in c, so taking off a letter never separates a c from the h after it. What is left is shorter, so it can be split, and the first letter followed by that split is a split of <i>w</i>. <span class="qed">∎</span></p>
<p class="why">This is induction on length that assumes the claim for all shorter strings, not only for the string one shorter. Taking off <b>ch</b> shortens the string by two, so that is the form needed.</p></div>
<p>So the strings that can be split form a regular language, and a machine can check them with three states: <i>ok</i>, meaning every c so far has been followed by h and the last character is not a c; <i>afterC</i>, meaning the last character read is a c still waiting for its h; and <i>stuck</i>, meaning some c was followed by something else. It starts in <i>ok</i> and accepts in <i>ok</i> only.</p>
<table class="small"><tr><th>state</th><th>on c</th><th>on h</th><th>on any other character</th></tr><tr><td><i>ok</i> (start, accepting)</td><td><i>afterC</i></td><td><i>ok</i></td><td><i>ok</i></td></tr><tr><td><i>afterC</i></td><td><i>stuck</i></td><td><i>ok</i></td><td><i>stuck</i></td></tr><tr><td><i>stuck</i></td><td><i>stuck</i></td><td><i>stuck</i></td><td><i>stuck</i></td></tr></table>
<p>Checking each entry against the meanings of the states, as in Lesson 6, proves that it accepts exactly the strings of Theorem 2. A table with 20 columns would say the same thing; grouping the characters that behave alike into one column is how real machines are written down.</p>
<h2>One spelling, two readings</h2>
<p>Theorem 2 says when a split exists. It does not say the split is unique, and it is not: the characters <code>aa</code> can be split as the one letter <b>aa</b> or as two letters <b>a</b>, <b>a</b>. The same goes for <code>ii</code>, <code>oo</code>, <code>sh</code> and <code>zh</code>. The widget above shows what that means for <span lang="ciw">Boozhoo</span>: read with the shortest letter that fits, it becomes the seven letters b, o, o, z, h, o, o, each one a genuine letter of the system, and none of them what the word says.</p>
<div class="stmt"><p><span class="kind">Definition.</span> A set of letters, each a string of characters, is a <em>code</em>. It is <em>uniquely decodable</em> if no string of characters has two different splits into its letters. It is <em>prefix-free</em> if no letter is the beginning of a different letter.</p></div>
<div class="stmt"><p><span class="kind">Theorem 3.</span> Every prefix-free code is uniquely decodable.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Suppose some string has two different splits. Compare them letter by letter from the start, and look at the first place where they take different letters, <i>x</i> in one split and <i>y</i> in the other. Up to that point both have used up the same characters, so <i>x</i> and <i>y</i> both begin at the same position and both match the characters there. So the shorter of the two is the beginning of the longer. They are different letters, so they cannot have the same length, and the shorter is the beginning of a different letter: the code is not prefix-free. <span class="qed">∎</span></p></div>
<p>The double vowel letters are not prefix-free, since <b>a</b> begins <b>aa</b> and <b>s</b> begins <b>sh</b>, and the example of <code>aa</code> shows they are not uniquely decodable either. A writing system in this position needs a rule for reading, and this one has it built in: a doubled vowel is one long vowel, and ch, sh and zh are one letter each. In the language of machines, the reader always takes the <em>longest letter that fits</em>. Programming languages use exactly the same rule, called <em>longest match</em>: Python reads <code>x==y</code> as <code>x</code>, <code>==</code>, <code>y</code>, and never as two <code>=</code> signs in a row.</p>
<p>Could the longest-match reader get stuck on a string that does have a split, by taking a long letter when it should have taken a short one? For this code, no. Its choices are made only at a, i, o, s and z, and whichever it chooses, the rest of the string still has every c followed by h, so by Theorem 2 the rest can still be split. (For other codes, greedy reading can fail: with the letters a, ab and bc, the string abc splits only as a, bc, and the longest-match reader, taking ab first, is left with a lone c.)</p>
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
<p>The program reads with the longest letter that fits, by listing the two-character letters first and taking the first letter in the list that matches. It prints the letters of some words from this site, checks Theorem 2 against a direct test of \"every c is followed by h\" on every string of length 1 to 5 made from a, c, h and s, and finally does the same splitting with Python's regular expressions.</p>`,
        { play: `LETTERS = ["aa", "ii", "oo", "ch", "sh", "zh",      # the two-character letters first
           "a", "b", "d", "e", "g", "h", "'", "i", "j", "k",
           "m", "n", "o", "p", "s", "t", "w", "y", "z"]
LONG = ["aa", "ii", "oo", "e"]

def split(word):
    """The letters of word, reading the longest letter that fits; None if no split exists."""
    word = word.lower()
    letters = []
    i = 0
    while i < len(word):
        if word[i] == "-":            # a hyphen joins two parts of a word; it is not a letter
            i += 1
            continue
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
        print(w, "->", " ".join(parts), "|", len(parts), "letters, long vowels:", longs)

# Theorem 2, checked on every string of length 1 to 5 made from a, c, h and s
def every_c_then_h(s):
    for i in range(len(s)):
        if s[i] == "c" and s[i + 1:i + 2] != "h":
            return False
    return True

tested, disagreements, strings = 0, 0, [""]
for length in range(1, 6):
    strings = [s + ch for s in strings for ch in "achs"]
    for s in strings:
        tested += 1
        if (split(s) is not None) != every_c_then_h(s):
            disagreements += 1
print(tested, "strings tested, disagreements with Theorem 2:", disagreements)

# the same splitting as a regular expression; Python tries the alternatives from left to right
import re
print(re.findall("aa|ii|oo|ch|sh|zh|[abdeghijkmnopstwyz']", "gojibizotoon"))`, caption: 'Gojitoon is \u201ctry it\u201d and Gojibizotoon \u201ccheck answer\u201d, as on this site\u2019s buttons. No disagreements in 1364 strings. Move "aa", "ii" and "oo" to the end of LETTERS and Boozhoo falls apart into b o o zh o o: the order of the list is the reading rule.' },
        { check: "A code is prefix-free. What follows?", options: ["It has at most 26 letters", "Every string has at most one split into letters: it is uniquely decodable", "Its letters are all the same length"], answer: 1, why: "Theorem 3: if no letter begins another, the first letter of any string is determined, and so on along the string." },
        `<p>1364 agreements are evidence; Theorem 2 is the proof. One thing the last line does not do: <code>re.findall</code> skips any character that fits no letter, so on \"cat\" it quietly returns <code>['a', 't']</code>. A checker must also notice what it could not read, which is what <code>split</code> does when it returns <code>None</code>.</p>
<h2>Before the exercises</h2>
<p>The first exercise splits words from this site by hand, with the longest-match rule, and counts their letters and long vowels. Watch for <b>e</b>, which is a long vowel written with one character, and for the glottal stop, which is a letter. The second asks which regular expressions describe exactly the strings Theorem 2 is about. Test each candidate on a few short strings, including the empty one, and remember the order of operations.</p>`,
        `<details class="reveal"><summary>Puzzle: the full double vowel system has one more convention. At the end of a word, a long vowel followed by <b>nh</b> is a nasal vowel, and the h is not a sound of its own. Which regular expression describes the endings a reader must treat this way, and does the splitter still need only finitely many states?</summary><p><code>(aa|ii|oo|e)nh</code>, at the very end of the word. A reader cannot know an n and h are the end of the word until the word ends, so the machine must remember the last three letters it has read, or rather only whether they were \"long vowel, n, h\". That is a fixed amount of information, like the keypad lock in Lesson 6, so finitely many states still suffice. Rules that look at a bounded neighbourhood of a letter never need more than a finite machine.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Forgetting the order of operations: <code>ch*</code> is c followed by any number of h's, not any number of ch's, which is <code>(ch)*</code>. Forgetting that star allows zero repetitions, so <code>R*</code> always describes ε. Counting <b>e</b> as a short vowel because it is written with one character; it is long. Leaving out the glottal stop when counting letters. Thinking that a string matching a pattern of real words must itself be a word. Believing an expression is right because it matches the examples you had in mind, instead of asking whether it matches exactly the language.</p>` },
        {
          ex: {
            id: 'ma-13-1', kind: 'table', title: 'Split by hand',
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
            id: 'ma-13-2', kind: 'choice', multi: true, title: 'A pattern for Theorem 2',
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
<li>A prefix-free code is uniquely decodable (Theorem 3). The double vowel letters are not prefix-free, so the system reads the longest letter that fits, as programming languages do.</li>
<li>A pattern can check spelling, but only a language's speakers decide which strings are words; a pattern built from examples can miss a case or accept too much.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'The limits of finite memory', summary: 'A game that no finite automaton can win: distinguishable strings, a pigeonhole proof that 0\u207f1\u207f needs unbounded memory, lower bounds on the number of states, and the stack.',
      blocks: [
        `<p>Here is a challenge. Design a finite automaton, in the sense of Lesson 6, that accepts exactly the strings made of some 0s followed by the <em>same number</em> of 1s. So <code>01</code>, <code>0011</code> and <code>000111</code> are in; <code>001</code>, <code>10</code> and <code>0101</code> are out; and the empty string is in, with zero of each. The language is written {0<sup><i>n</i></sup>1<sup><i>n</i></sup> : <i>n</i> ≥ 0}.</p>
<p>Take a minute and try. You will want a state for "one 0 so far", another for "two 0s so far", another for "three", and the list never ends. This lesson turns that feeling into a theorem. The proof is a game between you and an opponent, and the opponent always wins.</p>
<h2>The forgetting game</h2>
<p>You build a machine with some number of states, <i>k</i>, and claim it accepts the language. Your opponent does not look inside it. They feed it inputs, and they need only find two different inputs that leave your machine in the same state when a correct machine would have to tell them apart. The key idea is when two inputs "must be told apart".</p>
<div class="stmt"><p><span class="kind">Definition.</span> Let <i>L</i> be a language. Two strings <i>x</i> and <i>y</i> are <em>distinguishable</em> by <i>L</i> if there is some string <i>z</i> such that exactly one of <i>xz</i> and <i>yz</i> is in <i>L</i>. We say <i>z</i> <em>distinguishes</em> them. (Here <i>xz</i> means <i>x</i> followed by <i>z</i>.)</p></div>
<p>For the language above, 00 and 000 are distinguishable: take <i>z</i> = 11. Then 0011 is in the language and 00011 is not. Having read 00 or 000, a correct machine is in a situation where the future can still tell the two apart, so it had better remember which one it saw.</p>
<div class="stmt"><p><span class="kind">Lemma 1.</span> If a DFA <i>M</i> accepts exactly the language <i>L</i>, and <i>x</i> and <i>y</i> are distinguishable by <i>L</i>, then <i>M</i> is in different states after reading <i>x</i> and after reading <i>y</i>.</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> Suppose <i>M</i> were in the same state <i>q</i> after reading <i>x</i> and after reading <i>y</i>. Let <i>z</i> distinguish them. After reading <i>xz</i>, <i>M</i> is in whatever state reading <i>z</i> leads to from <i>q</i>; after reading <i>yz</i>, exactly the same state.</p>
<p class="why">A DFA's next state depends only on its current state and the symbol read (Lesson 6's definition). From the moment both runs are in <i>q</i>, they receive the same symbols, so they take the same steps. The machine has forgotten whether it started with <i>x</i> or <i>y</i>.</p>
<p>So <i>M</i> accepts both <i>xz</i> and <i>yz</i> or rejects both. But exactly one of them is in <i>L</i>, so <i>M</i> gets one of them wrong, contradicting the assumption that <i>M</i> accepts exactly <i>L</i>. <span class="qed">∎</span></p>
<p class="why">A proof by contradiction, the method of Lesson 4: assume the opposite, reach something false.</p></div>
<div class="stmt"><p><span class="kind">Theorem 2 (the fooling-set theorem).</span> If a language <i>L</i> has <i>m</i> strings that are pairwise distinguishable (every two of them are distinguishable), then every DFA accepting <i>L</i> has at least <i>m</i> states. If <i>L</i> has infinitely many pairwise distinguishable strings, no DFA accepts <i>L</i> at all.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> By Lemma 1, a DFA accepting <i>L</i> must end in a different state for each of the <i>m</i> strings, so it has at least <i>m</i> states. (This is the pigeonhole principle of Lesson 2 in disguise: with fewer than <i>m</i> states, two of the <i>m</i> strings would share one.) If there are infinitely many such strings, then for every <i>k</i>, a machine would need more than <i>k</i> states, which no finite machine has. <span class="qed">∎</span></p></div>
<h2>No finite automaton for 0<sup><i>n</i></sup>1<sup><i>n</i></sup></h2>
<div class="stmt"><p><span class="kind">Theorem 3.</span> No DFA accepts exactly the language {0<sup><i>n</i></sup>1<sup><i>n</i></sup> : <i>n</i> ≥ 0}.</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> The strings ε, 0, 00, 000, …, that is 0<sup><i>i</i></sup> for every <i>i</i> ≥ 0, are pairwise distinguishable. Take two of them, 0<sup><i>i</i></sup> and 0<sup><i>j</i></sup> with <i>i</i> ≠ <i>j</i>, and let <i>z</i> = 1<sup><i>i</i></sup>. Then 0<sup><i>i</i></sup>1<sup><i>i</i></sup> is in the language, and 0<sup><i>j</i></sup>1<sup><i>i</i></sup> is not, because its numbers of 0s and 1s differ.</p>
<p class="why">This is the opponent's whole strategy: the suffix 1<sup><i>i</i></sup> "asks" the machine how many 0s it saw, and only one answer is right.</p>
<p>There are infinitely many strings 0<sup><i>i</i></sup>, so by Theorem 2 no DFA accepts the language. <span class="qed">∎</span></p>
<p class="why">Notice what the proof did not need: any knowledge of how the machine was designed. It rules out every DFA that anyone could ever build, with any number of states.</p></div>
<p>This is the first time in the course we have proved that a whole <em>class</em> of machines cannot do something. It used nothing but the pigeonhole principle and the meaning of a state as "everything the machine remembers". Lesson 10 makes the same kind of move against a much bigger class of machines.</p>
<details class="reveal"><summary>Your turn: which strings would you use to prove that no DFA accepts the <em>palindromes</em> over {0, 1}, the strings that read the same backwards?</summary><p>Try 0<sup><i>i</i></sup>1 for each <i>i</i> ≥ 0. For <i>i</i> ≠ <i>j</i>, the suffix <i>z</i> = 0<sup><i>i</i></sup> distinguishes them: 0<sup><i>i</i></sup>10<sup><i>i</i></sup> is a palindrome, and 0<sup><i>j</i></sup>10<sup><i>i</i></sup> is not, since its two ends have different numbers of 0s around the single 1. Infinitely many pairwise distinguishable strings, so no DFA. (The 1 in the middle matters: 0<sup><i>i</i></sup> alone would not work, because 0<sup><i>j</i></sup>0<sup><i>i</i></sup> is all 0s, and every string of 0s is a palindrome.)</p></details>
<h2>The same game, played for good</h2>
<p>The fooling-set theorem also gives <em>lower bounds</em>: it proves that a machine cannot be made smaller. Lesson 6 built a three-state machine for "ends in 01". Could two states do?</p>
<div class="stmt"><p><span class="kind">Theorem 4.</span> Every DFA accepting the strings over {0, 1} that end in 01 has at least 3 states. So Lesson 6's machine is as small as possible.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> The three strings ε, 0 and 01 are pairwise distinguishable. ε and 0: take <i>z</i> = 1; then 1 does not end in 01 but 01 does. ε and 01: take <i>z</i> = ε; ε is not in the language, 01 is. 0 and 01: take <i>z</i> = ε again; 0 is not in the language, 01 is. By Theorem 2, at least 3 states are needed. <span class="qed">∎</span></p></div>
<p>A theorem that says "you cannot do better" is as valuable to an engineer as a design that works: it tells you to stop searching. Much of computer science consists of pairs like this, an algorithm and a proof that no algorithm can beat it.</p>
<h2>Adding memory: a counter, then a stack</h2>
<p>What the finite machine lacked was a number that can grow without limit. Give it one counter, add 1 for each 0 and subtract 1 for each 1, and the language is easy. The same counter checks a single kind of bracket, <code>(</code> and <code>)</code>: add 1 for an opener, subtract 1 for a closer, never let the count go below zero, and finish at zero.</p>
<p>Now allow three kinds of bracket. Is <code>([)]</code> balanced? It has one of each opener and one of each closer, in an order where the count never goes negative, and yet it is wrong: the round bracket was opened first, so it must be closed <em>last</em>. To check this, a machine must remember not just how many brackets are open but which kinds, in which order. The right memory is a <em>stack</em>, a pile where you can add to the top and remove from the top, and nothing else.</p>
<div class="stmt"><p><span class="kind">Stack method for brackets.</span> Read the string from left to right. On an opening bracket, push it onto the stack. On a closing bracket, the stack must be non-empty and its top must be the matching opener; pop it. Otherwise, reject. At the end, accept exactly when the stack is empty.</p></div>
<p>It works because the bracket that must be closed next is always the most recently opened one still open, and that is exactly what the top of a stack holds. The whole of a program's nested structure, brackets inside brackets inside brackets, is checked the same way, which is why every compiler has a stack at its heart.</p>
<details class="reveal"><summary>Predict: can a single counter tell <code>([)]</code> from <code>([])</code>?</summary><p>No. A counter of open brackets goes 1, 2, 1, 0 on both strings. The difference is <em>which</em> bracket is on top when a closer arrives, and a single count cannot record that. (One counter per kind of bracket does not help either: on both strings each counter goes 1, then 0.)</p></details>
<h2>The laboratory</h2>
<p>Both kinds of extra memory in one program: a counter for 0<sup><i>n</i></sup>1<sup><i>n</i></sup>, and a Python list used as a stack for brackets. <code>append</code> pushes onto the top, <code>pop()</code> removes from the top, and <code>stack[-1]</code> looks at the top without removing it.</p>`,
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

MATCH = {")": "(", "]": "[", "}": "{"}

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

for s in ["", "01", "0011", "000111", "001", "10", "0101"]:
    print(repr(s), is_0n1n(s))
print()
for s in ["()", "([{}])", "([)]", "((", ")(", "{[()()]}", "f(x[1]) + {y}"]:
    print(repr(s), balanced(s))`, caption: 'Trace ([)] by hand: push (, push [, then ) arrives and the top is [, the wrong kind, so reject. Characters that are not brackets are ignored. Add your own test strings.' },
        { check: "Strings x and y are distinguishable by L when…", options: ["they have different lengths", "some suffix z puts exactly one of xz, yz in L", "neither is in L"], answer: 1, why: "A DFA for L must then end in different states on x and y, since the same state would give the same verdict on z." },
        { check: "A language has infinitely many pairwise distinguishable strings. What follows?", options: ["It needs a large DFA", "No DFA accepts it", "It is finite"], answer: 1, why: "The fooling-set theorem: m pairwise distinguishable strings force m states; infinitely many force the impossible." },
        `<h2>A ladder of machines</h2>
<p>We now have three rungs. A finite automaton remembers a fixed amount. A machine with a stack remembers an unlimited amount, but can only look at the top; that is exactly enough for brackets, and for checking that a program's source code is grammatical. The third rung is a machine with unlimited memory that it can read and change anywhere. That is the next lesson, and it is where the ladder ends: no one has ever found a more powerful kind of machine, and there are good reasons to think there is none.</p>
<p>Each rung does everything the one below it does, plus something the one below provably cannot. Every "provably cannot" is a cousin of this lesson's argument: find inputs that the weaker machine is forced to confuse.</p>
<h2>Before the exercises</h2>
<p>The first exercise asks you to play the opponent: find distinguishing suffixes, and use the fooling-set theorem to count the fewest states a machine needs. For a lower bound, look for strings that leave "different things to remember", then check every pair. The second exercise asks you to recognise a correct impossibility proof. A correct one names infinitely many strings and, for every two of them, a suffix that puts exactly one of the results in the language.</p>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Thinking the proof of Theorem 3 only rules out small machines: it rules out every finite one. Choosing a suffix <i>z</i> that puts both strings in the language, or neither; it must separate them. Showing only that some pairs are distinguishable when the theorem needs every pair. Concluding that a language needs no DFA just because it is infinite: "ends in 01" is infinite and has a three-state machine. Checking brackets with a counter that is allowed to go below zero: <code>)(</code> ends at zero but is not balanced. Using <code>stack[0]</code>, the bottom, instead of <code>stack[-1]</code>, the top.</p>` },
        { check: "Why does matching several kinds of bracket need a stack rather than a counter?", options: ["Counters are slow", "The next closer must match the most recent opener, which a single count cannot remember", "A stack is smaller"], answer: 1, why: "A counter can check 0ⁿ1ⁿ but cannot tell ([)] from ([]). The stack remembers which opener is most recent." },
        {
          ex: {
            id: 'ma-7-1', kind: 'answer', title: 'Play the opponent',
            prompt: `<p>Answer each part with a string of 0s and 1s, or a number.</p>`,
            parts: [
              { label: '(a) For the language {0<sup><i>n</i></sup>1<sup><i>n</i></sup>}, give the shortest string <i>z</i> such that 00<i>z</i> is in the language but 000<i>z</i> is not.', answer: '11', exact: true, width: '6rem',
                wrong: [{ match: '111', msg: '000111 is in the language and 00111 is not: that suffix distinguishes them, but the other way round. You want 00z in and 000z out.' }, { match: '1', msg: '001 is not in the language: it has two 0s and one 1.' }] },
              { label: '(b) For the strings that end in 01, the empty string and the string 0 are distinguishable. Give a suffix <i>z</i> of length 1 that distinguishes them.', answer: '1', exact: true, width: '6rem',
                wrong: [{ match: '0', msg: 'ε followed by 0 is 0, and 0 followed by 0 is 00: neither ends in 01, so this z does not separate them.' }, { match: '01', msg: 'That has length 2, and both 01 and 001 end in 01, so it does not distinguish them either.' }] },
              { label: '(c) What is the smallest number of states of a DFA accepting the strings over {0, 1} whose length is a multiple of 3?', answer: '3', width: '6rem',
                wrong: [{ match: '2', msg: 'Try the strings ε, 0 and 00. For any two of them, some suffix makes exactly one of the results have length a multiple of 3. So at least 3 states are needed, by Theorem 2.' }, { match: '4', msg: 'Three states suffice: remember the length mod 3. And ε, 0, 00 are pairwise distinguishable, so three are needed.' }] },
              { label: '(d) Using the strings ε, 0, 00, …, 0<sup><i>k</i></sup>, what is the fewest states a DFA would need to accept {0<sup><i>n</i></sup>1<sup><i>n</i></sup>} for all <i>n</i> up to 9 only (that is, the language {ε, 01, 0011, …, 0<sup>9</sup>1<sup>9</sup>})? Give the lower bound the strings ε, 0, …, 0<sup>9</sup> prove.', answer: '10', width: '6rem',
                wrong: [{ match: '9', msg: 'Count the strings ε, 0, 00, …, 0⁹: there are ten of them, including the empty string.' }, { match: ['infinite', 'none'], msg: 'This language is finite, so a DFA for it exists. The strings ε, …, 0⁹ are pairwise distinguishable (by the suffixes 1ⁱ), which proves a lower bound of ten states.' }] }
            ],
            hints: ['(a) You need 00z to have equal numbers of 0s and 1s. (b) Look at what εz and 0z end with. (c) Think of the length mod 3.', '(d) Count the strings in the list, including ε. Each pair is distinguished by a run of 1s.'],
            solution: `<p>(a) <b>11</b>: 0011 is in the language, 00011 is not. (b) <b>1</b>: the string 1 does not end in 01, but 01 does. (c) <b>3</b>: a machine that tracks the length mod 3 needs three states, and ε, 0 and 00 are pairwise distinguishable (for ε and 0 use <i>z</i> = 00, for ε and 00 use <i>z</i> = 0, for 0 and 00 use <i>z</i> = 0), so no machine can use fewer. (d) <b>10</b>: the ten strings 0<sup><i>i</i></sup> for <i>i</i> = 0, …, 9 are pairwise distinguishable, since 0<sup><i>i</i></sup>1<sup><i>i</i></sup> is in the language and 0<sup><i>j</i></sup>1<sup><i>i</i></sup> is not, so at least ten states are needed.</p><p>Part (d) shows Theorem 3 from a new angle: every bound <i>n</i> you set forces more states, so with no bound there is no finite machine.</p>`,
            followup: 'In part (c), both halves were needed: a machine with 3 states shows 3 is enough, and the fooling set shows fewer is impossible. Together they give the exact answer.'
          }
        },
        {
          ex: {
            id: 'ma-7-2', kind: 'choice', title: 'Spot the real proof',
            prompt: `<div class="stmt"><p><span class="kind">Claim.</span> No DFA accepts exactly the strings of round brackets that are balanced, such as <code>(())()</code>.</p></div><p>Which argument is a correct proof?</p>`,
            options: [
              { text: 'The language is infinite, and a DFA has only finitely many states, so no DFA can accept it.', why: 'Infinite languages can have DFAs: "ends in 01" is infinite and has a three-state machine. The number of strings is not the issue; the number of situations the machine must tell apart is.' },
              { text: 'For each i ≥ 0, consider the string of i opening brackets. For i ≠ j, the suffix of i closing brackets distinguishes them: i openers then i closers is balanced, and j openers then i closers is not. That is infinitely many pairwise distinguishable strings, so by the fooling-set theorem no DFA accepts the language.', ok: true },
              { text: 'For each i, consider the string of i opening brackets, and use the suffix of i more opening brackets. Then no result is balanced, so the strings are distinguishable, and no DFA accepts the language.', why: 'A distinguishing suffix must put exactly one of the two results in the language. Adding more openers leaves both results unbalanced, so this suffix distinguishes nothing.' },
              { text: 'A DFA cannot count, and checking brackets requires counting, so no DFA can do it.', why: 'That is the right intuition, but it is not a proof: "cannot count" is exactly what needs to be shown. A DFA can count up to any fixed number, so the argument must show that no fixed number is enough.' }
            ],
            hints: ['A proof by the fooling-set theorem needs infinitely many strings and, for each pair, a suffix that puts exactly one result in the language.', 'Compare the argument with the proof of Theorem 3, with ( in place of 0 and ) in place of 1.'],
            solution: `<p>The second option is the proof: it is the proof of Theorem 3 with ( for 0 and ) for 1. Every pair of the strings (<sup><i>i</i></sup> is separated by the suffix )<sup><i>i</i></sup>, and there are infinitely many of them, so Theorem 2 applies.</p><p>The first confuses "infinitely many strings" with "infinitely many situations to remember". The third uses a suffix that separates nothing. The fourth states the conclusion as if it were a reason.</p>`,
            followup: 'So brackets need unbounded memory, and a stack provides it. The same argument shows that no DFA can check whether a program\u2019s brackets match, which is why the part of a compiler that reads nested structure is not a finite automaton.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>Strings <i>x</i> and <i>y</i> are distinguishable by <i>L</i> if some suffix <i>z</i> puts exactly one of <i>xz</i>, <i>yz</i> in <i>L</i>; a DFA for <i>L</i> must end in different states on them.</li>
<li>Fooling-set theorem: <i>m</i> pairwise distinguishable strings force at least <i>m</i> states; infinitely many force the impossible.</li>
<li>No DFA accepts 0<sup><i>n</i></sup>1<sup><i>n</i></sup>, or balanced brackets, or palindromes. The same theorem proves lower bounds, such as 3 states for "ends in 01".</li>
<li>One unbounded counter handles 0<sup><i>n</i></sup>1<sup><i>n</i></sup>; several kinds of bracket need a stack, because the next closer must match the most recent opener.</li>
<li>Finite automaton, stack machine, unlimited read-write memory: each rung does something the one below provably cannot.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'The universal machine', summary: 'A tape, a head and a table of rules: Turing\u2019s 1936 definition of computing, a proof that a machine adds one, the busy beaver, the Church\u2013Turing thesis, and one machine that runs all the others.',
      blocks: [
        `<p>In 1936 the word "computer" meant a person: someone paid to carry out long calculations with pencil and paper, following fixed rules, at an observatory or an insurance office. That year, before any electronic computer existed, Alan Turing asked what such a person could compute in principle, and stripped the answer down to its bones. What was left is the simplest machine that can do everything any computer can do. This lesson defines it exactly, proves that a small one works, meets a machine that is famous for being as busy as possible, and ends with the idea that made the modern computer possible.</p>
<h2>Turing machines</h2>
<div class="stmt"><p><span class="kind">Definition.</span> A <em>Turing machine</em> has a <em>tape</em> of cells stretching without end in both directions, each holding one symbol from a finite <em>tape alphabet</em> that includes a <em>blank</em>, written _. A <em>head</em> is positioned over one cell. The machine has a finite set of <em>states</em>, a <em>start state</em>, and a <em>transition function</em> δ which, for some pairs of a state <i>q</i> and a symbol <i>s</i>, gives a triple δ(<i>q</i>, <i>s</i>) = (<i>s</i>′, <i>D</i>, <i>q</i>′): a symbol to write, a direction <i>D</i> (L or R) to move, and a next state.</p>
<p>At the start, the input is written on the tape, every other cell is blank, the head is on the first input symbol, and the machine is in the start state. One <em>step</em>: if the machine is in state <i>q</i> reading <i>s</i> and δ(<i>q</i>, <i>s</i>) = (<i>s</i>′, <i>D</i>, <i>q</i>′), it writes <i>s</i>′ in the cell, moves the head one cell in direction <i>D</i>, and enters state <i>q</i>′. If δ(<i>q</i>, <i>s</i>) is not defined, the machine <em>halts</em>, and the tape holds its output.</p></div>
<p>Compare Lesson 6. A finite automaton reads its input once, left to right, and writes nothing. A Turing machine can move both ways, can overwrite the tape, and has as much tape as it likes. That is the unbounded read-write memory that Lesson 8's ladder was missing, and the difference is small to describe and enormous in effect. The figure runs a machine that adds one to a binary number.</p>`,
        { fig: 'tape', machine: 'increment', caption: 'Step through it: the head walks to the right end in state right, then carries leftwards in state add. Try 111, and 0, and the empty tape.' },
        { check: "What makes a Turing machine halt?", options: ["Reaching the end of the tape", "Being in a state with no rule for the symbol it reads", "Writing a blank"], answer: 1, why: "The transition function is defined only for some (state, symbol) pairs. With no rule, the machine stops." },
        `<p>Its whole program is six rules:</p>
<table class="small"><tr><th>state</th><th>reading</th><th>write</th><th>move</th><th>next state</th><th>meaning</th></tr><tr><td>right</td><td>0</td><td>0</td><td>R</td><td>right</td><td rowspan="2">walk right, changing nothing</td></tr><tr><td>right</td><td>1</td><td>1</td><td>R</td><td>right</td></tr><tr><td>right</td><td>_</td><td>_</td><td>L</td><td>add</td><td>past the last digit: turn back</td></tr><tr><td>add</td><td>1</td><td>0</td><td>L</td><td>add</td><td>1 + 1 = 0, carry 1 to the left</td></tr><tr><td>add</td><td>0</td><td>1</td><td>L</td><td>done</td><td>0 + 1 = 1, no more carry</td></tr><tr><td>add</td><td>_</td><td>1</td><td>L</td><td>done</td><td>carried off the left end: a new digit</td></tr></table>
<p>State <code>done</code> has no rules, so entering it halts the machine. The states are still "what the machine remembers", as in Lesson 6, but now the tape remembers everything else, so the states only need to record which <em>phase</em> of the job the machine is in: walking, carrying, finished. Most Turing machines are designed as a short list of phases like this.</p>
<h2>Proving the machine right</h2>
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
        { check: "In a Turing machine, what do the states record, and what does the tape record?", options: ["The states record the input; the tape records the output", "The states record the phase of the work; the tape records what the machine knows", "Both record the same thing"], answer: 1, why: "Design with phases: the state says what the machine is doing, the tape holds the data." },
        `<h2>The busiest beaver</h2>
<p>Here is a game that has been played since 1962, when Tibor Radó invented it. Among all Turing machines with a given number of states, using only the symbols _ and 1, started on a completely blank tape, which one writes the most 1s <em>and then halts</em>? The winner is called the <em>busy beaver</em>. For two states the champion writes four 1s in six steps. Watch it.</p>`,
        { fig: 'tape', machine: 'beaver', caption: 'Start with the blank tape and step. The head wanders left and right, and after six steps it enters H, which has no rules, and halts with 1111 on the tape.' },
        `<p>The numbers grow ferociously. The three-state champion takes 21 steps, and the four-state one 107. For five states, the answer was found only in 2024, by an online collaboration of amateurs and professionals who examined every one of the millions of five-state machines and checked their proof by computer: the champion halts after 47,176,870 steps. For six states, the champion is known to run for more steps than could be written down in the observable universe, and the exact answer may never be known.</p>
<p>Why is this so hard? For each machine that has not halted after a long time, you must decide whether it <em>ever</em> will. The next lesson proves that no program can make that decision for every machine, which is why each new busy beaver has taken a leap of human ingenuity.</p>
<h2>Why this is the last rung</h2>
<p>You might expect Lesson 8's ladder to keep going: surely a machine with two tapes, or memory it can jump around in, or Python's lists and dictionaries, can do more? It cannot. Each of those can be simulated by a plain Turing machine, slowly but faithfully, and a Turing machine can be simulated by a Python program (the laboratory below is one). So Python and Turing machines compute exactly the same things.</p>
<div class="stmt"><p><span class="kind">The Church–Turing thesis.</span> Every function that can be computed by following a definite, mechanical procedure can be computed by a Turing machine.</p></div>
<p>It is called a thesis, not a theorem, because "definite, mechanical procedure" is an informal idea, so it cannot be proved. It is supported by ninety years of evidence: every precise definition of computation that anyone has proposed, including Alonzo Church's lambda calculus of 1936, the ancestor of Lisp, has turned out to compute exactly the same functions as Turing's machines. That is why "what can be computed?" has a single answer, whatever computer you own.</p>
<h2>The universal machine</h2>
<p>Turing's second idea is the one that made computers possible. A machine's rule table is a finite list of symbols, so it can be written down as a string. Then build one machine, <i>U</i>, whose input is two things on its tape: the description of some machine <i>M</i>, and an input <i>x</i> for it. <i>U</i> reads <i>M</i>'s rules from its own tape and carries them out on <i>x</i>, step by step. Turing proved that such a <em>universal machine</em> exists.</p>
<p>That is a computer: fixed hardware, changeable program. The program is the description of <i>M</i>, and it is data like any other. This page is a stack of universal machines: Python running inside an interpreter written in JavaScript, running inside a browser, running on a processor, each layer executing a description of the one above it.</p>
<h2>The laboratory</h2>
<p>Here is a universal machine written in Python. Each machine is described as text, one rule per line in the form <code>state symbol -&gt; write move next</code>. The function <code>run</code> knows nothing about incrementing or flipping or beavers; it reads a description and obeys it. <code>cells.get(head, "_")</code> reads a cell, giving a blank if nothing was ever written there, so the tape is unbounded in both directions.</p>`,
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
print(run(BEAVER, "", "A"))`, caption: 'Each line prints (final tape, number of steps). The incrementer on 1011 takes 8 steps, as the proof of Theorem 1 predicted. Write a machine of your own as a new description and run it: the same run obeys it.' },
        { check: "What does the Church–Turing thesis claim?", options: ["Every program halts", "Anything computable by a mechanical procedure is computable by a Turing machine", "Turing machines are faster than computers"], answer: 1, why: "Every model ever proposed, Python included, computes exactly the same functions. It is a thesis, not a theorem, because \"mechanical procedure\" is informal." },
        `<p>The <code>limit</code> is there because nothing guarantees a machine halts. Without it, <code>run</code> would loop for ever on a machine that never stops, and, as the next lesson proves, there is no way to write <code>run</code> so that it always knows in advance which machines those are.</p>
<h2>Before the exercises</h2>
<p>The first exercise traces the incrementer by hand, one step at a time, recording the state and the tape after each step, so you can watch the two phases of Theorem 1's proof happen. The second asks you to design a machine by filling in its rule table. Use the phase method: decide what each state means ("walking right, and the number of 1s so far is even"), then, for each state and symbol, ask what the machine must write, which way it must move, and what is true afterwards.</p>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Forgetting that the head moves on <em>every</em> step; there is no "stay", so to stay put, move and come back. Writing rules for the symbols you expect but not for the blank, so the machine halts a step early. Confusing the state, which records the phase, with the tape, which records the data. Expecting every machine to halt. Treating the Church–Turing thesis as a proved theorem. In Python, using a list for the tape and moving the head to position −1, which silently reads the <em>last</em> cell.</p>` },
        {
          ex: {
            id: 'ma-8-1', kind: 'table', title: 'Trace the incrementer',
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
            followup: 'Try 111 in the figure and count: 3 + 1 + 4 = 8 steps again, ending in 1000. The carry runs off the left end and writes a new digit.'
          }
        },
        {
          ex: {
            id: 'ma-8-2', kind: 'table', title: 'Design a machine',
            prompt: `<p>Design a machine that adds a <em>parity bit</em> to a binary string: it appends a 1 if the string has an odd number of 1s and a 0 if the number is even, so that every result has an even number of 1s. So 1011 becomes 10111, 11 becomes 110, and the empty string becomes 0. (Parity bits are how computers detect a single flipped bit in a message.)</p>
<p>The machine starts in state <code>even</code> and walks right, remembering whether it has seen an even or odd number of 1s so far, exactly like Lesson 6's automaton. When it reaches the blank, it writes the parity bit and halts by entering <code>done</code>. Fill in what each rule writes and which state it enters. One rule is done for you.</p>`,
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
            solution: `<p>Digits are written back unchanged. (even, 1) → odd and (odd, 1) → even; a 0 keeps the state. On the blank, even writes <b>0</b> and odd writes <b>1</b>, and both enter <b>done</b>.</p><p>By the method of Lesson 6's Theorem 1, after reading any prefix the state records whether it has an even or odd number of 1s. So the bit written on the blank is exactly the one that makes the total even. Trace 1011: even, odd (1), odd (0), even (1), odd (1), then write 1: 10111.</p>`,
            followup: 'This machine never changes a cell it has read, so it is barely more than a finite automaton. A machine that must go back and change earlier cells, such as the incrementer, really needs the tape.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A Turing machine: an unbounded tape, a head that reads, writes and moves, finitely many states, and a rule for some (state, symbol) pairs; with no rule, it halts.</li>
<li>Design with phases: states record what the machine is doing, the tape records what it knows. A proof follows the phases, as for the incrementer.</li>
<li>Nothing guarantees halting. The busy beaver problem shows how hard "does it halt?" can be.</li>
<li>Church–Turing thesis: anything mechanically computable is computable by a Turing machine; every known model, Python included, computes exactly the same things.</li>
<li>A universal machine reads another machine's description and runs it: programs are data. That is what a computer, and an interpreter, is.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'What no program can do', summary: 'Counting infinities: why the programs can be listed but the problems cannot, Cantor\u2019s diagonal argument, Turing\u2019s proof that no program decides halting, and why the busy beaver can never be computed.',
      blocks: [
        `<p>Imagine a tool that reads any program and tells you, before you run it, whether it will ever finish or get stuck for ever. Every programmer has wished for it. Lesson 9 suggested that Python, or a Turing machine, can compute anything computable. This lesson shows that the tool is not merely hard to build but impossible, and the proof is one of the most beautiful arguments in mathematics. It comes in two steps. A counting argument shows that <em>some</em> problems have no program at all. Then a specific, natural problem is caught red-handed.</p>
<h2>Counting infinite sets</h2>
<p>How do you compare the sizes of two infinite sets? By Lesson 2's bijection rule: two sets have the same size when their elements can be paired off exactly. The smallest kind of infinity is the one you can count off, first, second, third, and so on.</p>
<div class="stmt"><p><span class="kind">Definition.</span> A set is <em>countable</em> if its elements can be arranged in a list, first, second, third, …, so that every element appears at some finite position. (Finite sets count as countable.)</p></div>
<p>The whole numbers are countable, of course. So are the integers, listed as 0, 1, −1, 2, −2, 3, …: every integer turns up eventually. The trick in every such proof is to find an order in which nothing is postponed for ever.</p>
<div class="stmt"><p><span class="kind">Theorem 1.</span> For any finite alphabet, the set of all finite strings over it is countable. In particular, the set of all programs is countable.</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> List the strings in order of length, and strings of the same length in alphabetical order: first the empty string, then all strings of length 1, then all strings of length 2, and so on.</p>
<p class="why">Alphabetical order alone would fail: a, aa, aaa, … would never end, and b would never be reached. Sorting by length first makes each group finite.</p>
<p>For each length <i>n</i> there are only finitely many strings (if the alphabet has <i>k</i> symbols, exactly <i>k</i><sup><i>n</i></sup>, by Lesson 2's product rule), so every string of length <i>n</i> appears after finitely many earlier ones. Every program is a finite string of characters, so every program appears somewhere in the list. <span class="qed">∎</span></p>
<p class="why">The list also contains every string that is not a working program, which does no harm: skip them, and the programs are still listed in order.</p></div>
<h2>Cantor's diagonal</h2>
<p>A yes-or-no question about whole numbers, such as "is <i>n</i> prime?", is completely described by its infinite list of answers for <i>n</i> = 0, 1, 2, 3, …. Writing 1 for yes and 0 for no, "is <i>n</i> prime?" is the infinite sequence 0011010100…. Every infinite sequence of 0s and 1s describes some such question. Can all of them be put in a list?</p>
<div class="stmt"><p><span class="kind">Theorem 2 (Cantor, 1891).</span> The set of infinite sequences of 0s and 1s is not countable.</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> Suppose, for contradiction, that some list <i>s</i><sub>0</sub>, <i>s</i><sub>1</sub>, <i>s</i><sub>2</sub>, … contained every sequence. Build a new sequence <i>D</i> whose <i>n</i>th digit is the opposite of the <i>n</i>th digit of <i>s</i><sub><i>n</i></sub>, for every <i>n</i>.</p>
<p class="why">Picture the list as an infinite table, one sequence per row. <i>D</i> is made by walking down the diagonal of the table and flipping every digit. That is where the name comes from.</p>
<p><i>D</i> is an infinite sequence of 0s and 1s, so it must be in the list, say <i>D</i> = <i>s</i><sub><i>m</i></sub>. But the <i>m</i>th digit of <i>D</i> was chosen to be the opposite of the <i>m</i>th digit of <i>s</i><sub><i>m</i></sub>, so <i>D</i> and <i>s</i><sub><i>m</i></sub> differ in position <i>m</i>. That contradiction shows no such list exists. <span class="qed">∎</span></p>
<p class="why">Proof by contradiction (Lesson 4). Notice that it works on <em>any</em> proposed list: whatever list you bring, the diagonal sequence escapes it. Adding <i>D</i> to the list does not help, since the new list has a new diagonal.</p></div>
<p>Here is the construction on the first six rows of some list. The diagonal digits are in bold.</p>
<table class="small"><tr><th>row</th><th>digits 0 to 5</th><th>diagonal digit</th></tr><tr><td><i>s</i><sub>0</sub></td><td><b>1</b>01010…</td><td>1</td></tr><tr><td><i>s</i><sub>1</sub></td><td>1<b>1</b>1111…</td><td>1</td></tr><tr><td><i>s</i><sub>2</sub></td><td>00<b>0</b>000…</td><td>0</td></tr><tr><td><i>s</i><sub>3</sub></td><td>010<b>1</b>01…</td><td>1</td></tr><tr><td><i>s</i><sub>4</sub></td><td>1001<b>0</b>0…</td><td>0</td></tr><tr><td><i>s</i><sub>5</sub></td><td>00110<b>0</b>…</td><td>0</td></tr><tr><td><i>D</i></td><td>001011…</td><td>(each diagonal digit flipped)</td></tr></table>
<p>Cantor's argument, about real numbers, was the first proof that infinities come in different sizes. It was so shocking that some leading mathematicians of his day refused to accept it. Put Theorems 1 and 2 together and the consequence for computing is immediate.</p>
<div class="stmt"><p><span class="kind">Corollary 3.</span> There is a yes-or-no question about whole numbers that no program answers correctly for every input.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Each program that always answers yes or no computes one sequence of answers, one question. The programs can be listed (Theorem 1), so the questions they answer can be listed too. The questions cannot all be listed (Theorem 2), so some question is answered by no program. <span class="qed">∎</span></p></div>
<p>In fact almost every question is unanswerable, since there are uncountably many questions and only countably many programs. But the corollary does not name a single one. Turing, in 1936, found a specific and very natural one, by aiming the diagonal argument at programs themselves.</p>
<h2>The halting problem</h2>
<div class="stmt"><p><span class="kind">The halting problem.</span> Given a program <i>P</i> and an input <i>x</i>, does <i>P</i> eventually stop when run on <i>x</i>, or does it run for ever?</p>
<p><span class="kind">Theorem 4 (Turing, 1936).</span> No program decides the halting problem. That is, there is no program <code>halts(P, x)</code> that always finishes, and returns <code>True</code> exactly when <i>P</i> halts on <i>x</i>.</p></div>
<p>Programs are text, so a program can be given any string as input, including the text of a program, including its own text. That is the only ingredient the proof needs.</p>`,
        { code: `def trouble(P):
    if halts(P, P):      # would P halt, given its own text as input?
        while True:      # then loop for ever
            pass
    else:
        return           # otherwise stop at once`, caption: 'trouble asks halts a question about P, then does the opposite of the prediction.' },
        { check: "Why is the set of all programs countable?", options: ["Because there are finitely many", "Because programs are finite strings, which can be listed by length and then alphabetically", "Because they are numbers"], answer: 1, why: "Every finite string appears at some finite position in that list." },
        { check: "Suppose <code>halts(P, x)</code> existed. What does <code>trouble(trouble)</code> do?", options: ["Halts", "Runs forever", "Neither can be consistent: it halts exactly when halts says it does not"], answer: 2, why: "trouble does the opposite of the prediction about itself. Either answer contradicts halts, so halts cannot exist." },
        `<div class="proof annotated"><p><span class="kind">Proof.</span> Suppose, for contradiction, that a program <code>halts</code> exists that always finishes with the correct answer. Then <code>trouble</code>, above, is also a program. Run <code>trouble</code> on its own text, and ask whether <code>trouble(trouble)</code> halts.</p>
<p class="why"><code>trouble</code> only uses <code>halts</code>, an <code>if</code> and a loop. If <code>halts</code> is a program, so is <code>trouble</code>. And a program's text is a string, so <code>trouble</code> is a legitimate input for itself.</p>
<p>If <code>trouble(trouble)</code> halts, then <code>halts(trouble, trouble)</code> returned <code>True</code>, so <code>trouble</code> entered the endless loop and does not halt. If <code>trouble(trouble)</code> does not halt, then <code>halts(trouble, trouble)</code> returned <code>False</code>, so <code>trouble</code> returned at once and does halt. Both possibilities contradict themselves. So the assumption was false, and no such <code>halts</code> exists. <span class="qed">∎</span></p>
<p class="why">Where is the diagonal? Make a table with programs down the side and inputs, which are also programs, along the top, and in each cell whether that program halts on that input. <code>trouble</code> reads the diagonal cells, where a program meets itself, and does the opposite of each. So <code>trouble</code> differs from every row on the diagonal, and cannot be any row. But it is a program, so it must be a row. That is Cantor's contradiction, one level up.</p></div>
<p>By the Church–Turing thesis of Lesson 9, this rules out much more than a Python function: no computer of any kind, however fast, now or ever, decides halting in general. Not for lack of cleverness, but because any answer it gave could be turned against it.</p>
<details class="reveal"><summary>An objection: "trouble cheats, because it calls halts." Does it?</summary><p>No. The assumption being refuted is precisely that <code>halts</code> is an ordinary program. If it were, any other program could use it, just as any program can call <code>len</code>. Building <code>trouble</code> is not a trick played on <code>halts</code>; it is a consequence of <code>halts</code> being a program at all.</p></details>
<h2>The busy beaver cannot be computed</h2>
<p>Lesson 9's busy beaver was champion of a game: among <i>n</i>-state Turing machines started on a blank tape that eventually halt, which runs for the most steps? Call that number of steps <i>S</i>(<i>n</i>). We know <i>S</i>(2) = 6 and, since 2024, <i>S</i>(5) = 47,176,870. The halting theorem explains why each new value has taken such heroic effort.</p>
<div class="stmt"><p><span class="kind">Theorem 5.</span> No program computes <i>S</i>(<i>n</i>) for every <i>n</i>.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Suppose a program computed <i>S</i>. Then we could decide, for any <i>n</i>-state machine <i>M</i>, whether it halts on a blank tape: compute <i>S</i>(<i>n</i>), run <i>M</i> for <i>S</i>(<i>n</i>) steps, and answer "halts" if it has halted by then and "runs for ever" if not. That answer is always right, because by the definition of <i>S</i> no halting <i>n</i>-state machine runs longer than <i>S</i>(<i>n</i>) steps. But deciding halting on a blank tape is impossible, by an argument like Theorem 4's. So no program computes <i>S</i>. <span class="qed">∎</span></p></div>
<p>So <i>S</i> is a perfectly well-defined function, with a definite value for every <i>n</i>, that no computer can compute. It also grows faster than any function a program can compute, which is why <i>S</i>(6) is too large to write down.</p>
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
        print(n, "takes", s, "steps: a new record")`, caption: 'Halve if even, otherwise triple and add one. Every starting number ever tried, into the quintillions, reaches 1, but no proof exists that all do. The limit is the only honest way to write the loop: without it, the program would itself be a halting question.' },
        { check: "\"The halting problem is undecidable\" means…", options: ["Nobody has found the method yet", "No general method exists, though many particular cases are known", "No program's halting can ever be known"], answer: 1, why: "The proof shows there is nothing to find. With finitely many configurations, halting is decidable by pigeonhole." },
        `<p>The same wall stands behind many tools you might wish for. A perfect virus scanner would have to decide what any program will <em>do</em>, which includes whether it halts. A compiler that warned about every endless loop, and never gave a false alarm, would decide the halting problem. Real tools are clever approximations: they catch many cases and stay silent, or unsure, on the rest. The theorem says that is the best anyone can do.</p>
<h2>When halting <em>is</em> decidable</h2>
<p>The impossibility needs unbounded memory. For a machine with finite memory, halting can be decided.</p>
<div class="stmt"><p><span class="kind">Theorem 6.</span> Let a machine have finitely many possible configurations (for example, a finite automaton, or a Turing machine restricted to a fixed stretch of tape), with each configuration determining the next. Then whether it halts can be decided.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Suppose there are <i>N</i> configurations. Run the machine for <i>N</i> steps. If it has halted, answer yes. If not, it has passed through <i>N</i> + 1 configurations, counting the first, so by the pigeonhole principle (Lesson 2) one configuration occurred twice. Since each configuration determines the next, everything after the first visit repeats after the second, and so on for ever: the machine is in a loop and never halts. <span class="qed">∎</span></p></div>
<p>So "undecidable" is a precise claim about a precise class of machines, not a vague despair. A real computer has finite memory, so strictly speaking this theorem applies to it; but the number of configurations of a computer with a gigabyte of memory has billions of digits, so the method is useless in practice, and the unbounded model is the right way to think.</p>
<h2>Before the exercises</h2>
<p>The first exercise builds a diagonal by hand and checks that it escapes the list. The second asks exactly what the halting theorem does and does not claim. For each statement, ask: does it talk about <em>every</em> program and input, or about particular ones? Does it concern programs with unbounded memory, or finite ones?</p>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Reading "undecidable" as "nobody has found the method yet": the proof shows there is none to find. Concluding that no particular program's halting can ever be known. Thinking the proof depends on Python: it works for any universal model of computation. Objecting that <code>trouble</code> may not call <code>halts</code>. Believing a faster computer would help. Forgetting that the diagonal argument works against <em>every</em> proposed list, so adding the missing sequence to the list does not rescue it. Writing a loop like Collatz without a limit and locking up the page.</p>` },
        {
          ex: {
            id: 'ma-9-1', kind: 'table', title: 'Build a diagonal',
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
            followup: 'If the list had only these five rows and every sequence had only five digits, D = 01010 would be missing from this list, but a finite list of all 32 five-digit strings could still exist. The contradiction needs infinitely many positions: that is where "infinite" does the work.'
          }
        },
        {
          ex: {
            id: 'ma-9-2', kind: 'choice', multi: true, title: 'What the theorem says',
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
            followup: 'The first statement is about every program at once; the second is about each program separately. Keeping "for all" and "there exists" in the right order was the lesson of Lesson 1, and here it is the difference between a theorem and a falsehood.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A set is countable if it can be listed. Finite strings, and so programs, are countable: list them by length, then alphabetically.</li>
<li>Cantor's diagonal: infinite 0/1 sequences cannot be listed, because flipping the diagonal of any list gives a sequence the list misses. So some yes-or-no questions have no program.</li>
<li>Turing: no program decides halting. <code>trouble</code> does the opposite of whatever <code>halts</code> predicts about it running on itself.</li>
<li>The busy beaver function is well defined but not computable: computing it would decide halting.</li>
<li>Undecidable means no general method, not that no case is known; with finitely many configurations, halting is decidable by pigeonhole.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Counting steps', summary: 'Comparing algorithms without a stopwatch: counting steps as the input grows, big-O defined and proved, why constants do not matter and exponents do, and what doubling the input does.',
      blocks: [
        `<p>An old legend tells of the inventor of chess, who asked his king for a modest reward: one grain of rice on the first square of the board, two on the second, four on the third, doubling on every square. The king laughed and agreed. The total on 64 squares is 2<sup>64</sup> − 1, about 18 billion billion grains, which is more rice than the whole world grows in a thousand years. The king had not been cheated by arithmetic. He had misjudged how fast doubling grows, and that is exactly what this lesson is about.</p>
<p>Two programs both solve a problem. Which is better? Timing them tells you about one input on one computer on one afternoon. The mathematical answer is to count <em>steps</em>: how many basic operations the program performs, as a function of the size <i>n</i> of its input. Not the exact count, which depends on details nobody cares about, but how the count <em>grows</em> as <i>n</i> grows.</p>
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
<h2>Four algorithms, four growth rates</h2>
<p><b>Linear search</b> looks at each item until it finds the target: up to <i>n</i> steps. <b>Binary search</b> on a sorted list looks at the middle item and throws away the half that cannot contain the target, so it needs about log<sub>2</sub> <i>n</i> steps, the number of times <i>n</i> can be halved before reaching 1. <b>Checking every pair</b> of items with two nested loops takes about <i>n</i>²/2 steps. <b>Trying every subset</b> takes 2<sup><i>n</i></sup> steps, by Lesson 2's Theorem 3.</p>
<div class="stmt"><p><span class="kind">Theorem 1.</span> For every whole number <i>n</i> ≥ 1, the number of times <i>n</i> can be replaced by <i>n</i> div 2 before it reaches 1 is the whole number <i>k</i> with 2<sup><i>k</i></sup> ≤ <i>n</i> &lt; 2<sup><i>k</i>+1</sup>, that is, ⌊log<sub>2</sub> <i>n</i>⌋.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> By induction on <i>k</i>. If <i>k</i> = 0 then <i>n</i> = 1 and no halving is needed. If 2<sup><i>k</i></sup> ≤ <i>n</i> &lt; 2<sup><i>k</i>+1</sup> with <i>k</i> ≥ 1, then <i>n</i> div 2 satisfies 2<sup><i>k</i>−1</sup> ≤ <i>n</i> div 2 &lt; 2<sup><i>k</i></sup>, so after one halving the same statement holds with <i>k</i> − 1 in place of <i>k</i>, and by the induction hypothesis <i>k</i> − 1 more halvings are needed: <i>k</i> in all. <span class="qed">∎</span></p></div>
<p>So a sorted list of a billion items can be searched in about 30 comparisons, and one of a quintillion (10<sup>18</sup>) items in 59. That is the whole reason sorting is worth the trouble.</p>
<h2>Big-O</h2>
<p>Computer scientists write "the running time is O(<i>n</i>²)", read "big-O of <i>n</i> squared". Here is exactly what it means.</p>
<div class="stmt"><p><span class="kind">Definition.</span> For functions <i>f</i> and <i>g</i> from whole numbers to non-negative numbers, <i>f</i>(<i>n</i>) = O(<i>g</i>(<i>n</i>)) means: there are constants <i>c</i> &gt; 0 and <i>n</i><sub>0</sub> such that <i>f</i>(<i>n</i>) ≤ <i>c</i> · <i>g</i>(<i>n</i>) for every <i>n</i> ≥ <i>n</i><sub>0</sub>.</p></div>
<p>In words: from some point on, <i>f</i> is at most a constant multiple of <i>g</i>. Two things are deliberately ignored: small inputs, below <i>n</i><sub>0</sub>, and constant factors, absorbed into <i>c</i>. To prove a big-O claim, you exhibit the constants.</p>
<div class="stmt"><p><span class="kind">Theorem 2.</span> 3<i>n</i>² + 5<i>n</i> + 2 = O(<i>n</i>²).</p></div>
<div class="proof annotated"><p><span class="kind">Proof.</span> Take <i>c</i> = 10 and <i>n</i><sub>0</sub> = 1. For <i>n</i> ≥ 1 we have <i>n</i> ≤ <i>n</i>² and 1 ≤ <i>n</i>², so 3<i>n</i>² + 5<i>n</i> + 2 ≤ 3<i>n</i>² + 5<i>n</i>² + 2<i>n</i>² = 10<i>n</i>². <span class="qed">∎</span></p>
<p class="why">The idea works for every polynomial: bound each lower term by the highest power, and add up the coefficients to get <i>c</i>. So a polynomial of degree <i>k</i> is O(<i>n</i><sup><i>k</i></sup>): only the highest power matters.</p></div>
<div class="stmt"><p><span class="kind">Theorem 3.</span> <i>n</i>² is not O(<i>n</i>).</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Suppose, for contradiction, that <i>n</i>² ≤ <i>c</i> · <i>n</i> for every <i>n</i> ≥ <i>n</i><sub>0</sub>. Dividing by <i>n</i>, that says <i>n</i> ≤ <i>c</i> for every <i>n</i> ≥ <i>n</i><sub>0</sub>, which is false for any <i>n</i> larger than both <i>c</i> and <i>n</i><sub>0</sub>. <span class="qed">∎</span></p></div>
<p>Together these say that constants cannot rescue a worse growth rate. A program doing 100<i>n</i> steps and one doing 3<i>n</i> steps are both O(<i>n</i>); the second is faster, but neither is in the same league as one doing <i>n</i>² steps. Past <i>n</i> = 100, the 100<i>n</i> program beats the <i>n</i>² program, and the gap only widens. The base of a logarithm does not matter either, since log<sub><i>a</i></sub> <i>n</i> = log<sub><i>b</i></sub> <i>n</i> / log<sub><i>b</i></sub> <i>a</i> is a constant multiple of log<sub><i>b</i></sub> <i>n</i>; that is why we just write O(log <i>n</i>).</p>
<h2>Counting loops</h2>
<p>The working rule: find the innermost line and count how many times it runs. One loop over the input is O(<i>n</i>). A loop that halves something is O(log <i>n</i>), by Theorem 1. For two nested loops over all pairs <i>i</i> &lt; <i>j</i>, count exactly: the inner loop runs <i>n</i> − 1 times, then <i>n</i> − 2, …, then 0, which is (<i>n</i> − 1)<i>n</i>/2 in total by Lesson 3's Theorem 2. That is O(<i>n</i>²). Watch out for hidden loops: in Python, <code>x in some_list</code> checks the items one by one, so it is itself O(<i>n</i>).</p>
<details class="reveal"><summary>Predict: how many steps does each of these take, as a function of <i>n</i>? (a) A loop over <i>n</i> items with an inner loop of exactly 10 passes. (b) A loop over <i>n</i> items, each pass checking <code>x in other</code> where <code>other</code> is a list of <i>n</i> items.</summary><p>(a) 10<i>n</i>, which is O(<i>n</i>): a loop of fixed length is a constant, however it looks. (b) Up to <i>n</i> · <i>n</i> = <i>n</i>², O(<i>n</i>²): the <code>in</code> is a hidden loop. This is the most common way to write an accidental O(<i>n</i>²) program, and the laboratory below shows the cure.</p></details>
<h2>Doubling</h2>
<p>A good way to feel a growth rate is to ask what happens when the input doubles. O(log <i>n</i>): one more step. O(<i>n</i>): twice as long. O(<i>n</i>²): four times as long. O(2<sup><i>n</i></sup>): the time is <em>squared</em>, since 2<sup>2<i>n</i></sup> = (2<sup><i>n</i></sup>)². So exponential algorithms are fine for <i>n</i> = 20 and hopeless for <i>n</i> = 60, and no computer that will ever be built changes that verdict. A computer a million times faster buys only about twenty more items, because 2<sup>20</sup> is about a million.</p>
<p>Lesson 4 has already met this. Trial division tests whether <i>n</i> is prime in about √<i>n</i> steps, which sounds fast. But the size of the input is the number of digits <i>d</i> of <i>n</i>, and √<i>n</i> is about 2<sup><i>d</i>/2</sup>: exponential in the size of the input. That fact turns out to be worth a great deal of money, as Lesson 13 shows.</p>
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
print("fast:", pair_sum_fast(nums, 5))`, caption: 'Both say False (5 is not a multiple of 3). The slow one took 499,500 steps, which is 1000 × 999 / 2 exactly; the fast one took 1000. Double the length of the list and predict both counts before running.' },
        { check: "f(n) = 3n² + 5n + 2. Which is true?", options: ["f(n) = O(n)", "f(n) = O(n²)", "f(n) = O(log n)"], answer: 1, why: "For n ≥ 1, 3n² + 5n + 2 ≤ 10n². Constants and lower terms do not matter; the highest power does." },
        { check: "An O(n²) algorithm takes 2 seconds on an input. On an input twice as large, about how long?", options: ["4 seconds", "8 seconds", "2 seconds"], answer: 1, why: "Doubling n quadruples n². O(n) would double, O(log n) would add one step." },
        `<p>Choosing the right data structure is usually where a factor of <i>n</i> is won or lost. Better hardware makes a program a constant factor faster; a better algorithm can make it a factor of <i>n</i> faster, and that grows without limit.</p>
<h2>Before the exercises</h2>
<p>The first exercise asks for step counts and the consequences of growth rates: use Theorem 1 for halvings, Lesson 3's sum for nested loops, the definition for <i>n</i><sub>0</sub>, and the doubling rules for the rest. The second asks you to classify pieces of code by growth rate. For each one, find the innermost line, and count how many times it runs, including any hidden loops.</p>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Timing one small input and extrapolating: ask how the count <em>changes</em> as <i>n</i> grows. Thinking O(<i>n</i>) means exactly <i>n</i> steps; it means at most a constant times <i>n</i>, from some point on. Counting a loop of fixed length as a factor of <i>n</i>. Missing a hidden loop, such as <code>in</code> on a list. Assuming a faster computer fixes an exponential algorithm. Measuring the size of a number by its value instead of its number of digits.</p>` },
        { check: "A loop over n items checks <code>x in other</code> each time, where other is a list of n items. How many steps?", options: ["O(n)", "O(n²): in on a list is a hidden loop", "O(log n)"], answer: 1, why: "Count hidden loops. With other as a set, the check is O(1) and the whole thing O(n)." },
        {
          ex: {
            id: 'ma-10-1', kind: 'answer', title: 'Counting and consequences',
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
            followup: 'Compare (d) with a linear algorithm: a computer 1000 times faster would handle 1000 times as many items. For 2ⁿ it bought nine.'
          }
        },
        {
          ex: {
            id: 'ma-10-2', kind: 'table', title: 'Classify the code',
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
            followup: 'Rows four and five look alike on the page and differ completely in cost. Counting steps means reading what each line really does, not how many loops you can see.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>Compare algorithms by how their step counts grow with the input size <i>n</i>.</li>
<li><i>f</i>(<i>n</i>) = O(<i>g</i>(<i>n</i>)) means <i>f</i>(<i>n</i>) ≤ <i>c</i> · <i>g</i>(<i>n</i>) for all <i>n</i> ≥ <i>n</i><sub>0</sub>; prove it by exhibiting <i>c</i> and <i>n</i><sub>0</sub>. Constants and lower terms do not matter; higher powers and exponentials do.</li>
<li>Halving takes ⌊log<sub>2</sub> <i>n</i>⌋ steps; all pairs take <i>n</i>(<i>n</i> − 1)/2; all subsets take 2<sup><i>n</i></sup>. Count hidden loops too.</li>
<li>Doubling the input: O(log <i>n</i>) adds a step, O(<i>n</i>) doubles, O(<i>n</i>²) quadruples, O(2<sup><i>n</i></sup>) squares.</li>
<li>Exponential algorithms stay hopeless on faster hardware; the right data structure (such as a set) can save a factor of <i>n</i>.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Easy to check, hard to find', summary: 'Problems whose answers are quick to verify but seem to take for ever to discover: P and NP defined, reductions, NP-completeness, and the million-dollar question of whether P equals NP.',
      blocks: [
        `<p>Sudoku. Minesweeper. Tetris. Candy Crush. Each of these games has been the subject of a serious mathematical paper, and the papers all reach the same kind of conclusion: in a precise sense, the general version of the puzzle is as hard as some of the most important unsolved problems in computing. If you found a fast method for solving every Minesweeper board, you would also have a fast method for scheduling airlines, packing lorries, folding proteins and breaking much of the world's encryption, and you could collect a million dollars. This lesson explains how a game can carry that much weight.</p>
<h2>A problem with a gap</h2>
<p>Here is the <em>subset sum</em> problem. Given a list of whole numbers and a target, is there a subset of the numbers that adds up to exactly the target? For the list 3, 34, 4, 12, 5, 2 and target 9, the answer is yes: 4 + 5. For target 30, the answer is no.</p>
<p>The obvious method tries every subset. A list of <i>n</i> numbers has 2<sup><i>n</i></sup> subsets (Lesson 2), so this takes exponential time, which by Lesson 11 is hopeless beyond a few dozen numbers. But suppose a friend claims that the subset 12, 5, 2, 34 adds up to 53. You can check the claim with three additions. Checking a proposed answer is fast; finding one seems to be slow. That gap is the subject of this lesson.</p>
<h2>Problems, sizes and fast algorithms</h2>
<div class="stmt"><p><span class="kind">Definition.</span> A <em>decision problem</em> is a question with a yes-or-no answer about an input, called an <em>instance</em>, such as "given this list and this target, does some subset add up to the target?". The <em>size</em> <i>n</i> of an instance is the number of symbols needed to write it down.</p>
<p><span class="kind">Definition.</span> An algorithm runs in <em>polynomial time</em> if, for some fixed <i>k</i>, it takes O(<i>n</i><sup><i>k</i></sup>) steps on instances of size <i>n</i>. <b>P</b> is the class of decision problems that some polynomial-time algorithm solves.</p></div>
<p>Polynomial time is the mathematician's definition of "fast". It is generous, since an O(<i>n</i><sup>100</sup>) algorithm would be useless in practice, but it has two great virtues. It separates the growth rates of Lesson 11 cleanly: every polynomial is eventually beaten by 2<sup><i>n</i></sup>. And it is closed under combination: a polynomial-time procedure that calls another polynomial-time procedure polynomially many times is still polynomial. Sorting, searching, shortest paths by breadth-first search, Euclid's algorithm and 2-colouring a graph are all in P. So is deciding whether a number is prime, by a method found in 2002 by three researchers in India, Agrawal, Kayal and Saxena, which settled a question that had been open for decades.</p>
<h2>Problems whose answers can be checked</h2>
<div class="stmt"><p><span class="kind">Definition.</span> A decision problem is in <b>NP</b> if there is a polynomial-time algorithm <i>V</i>, called a <em>verifier</em>, with this property: for every yes-instance <i>x</i> there is some <em>certificate</em> <i>c</i>, of size polynomial in the size of <i>x</i>, such that <i>V</i>(<i>x</i>, <i>c</i>) says yes; and for every no-instance <i>x</i>, <i>V</i>(<i>x</i>, <i>c</i>) says no for every <i>c</i>.</p></div>
<p>A certificate is a proposed solution; the verifier checks it. For subset sum, the certificate is the subset, and the verifier adds it up and compares with the target: polynomial time. The last clause matters: no certificate, however cunning, can fool the verifier into accepting a no-instance. The name NP stands for "nondeterministic polynomial", for historical reasons; it does <em>not</em> mean "not polynomial".</p>
<div class="stmt"><p><span class="kind">Theorem 1.</span> P ⊆ NP: every problem that can be solved quickly can be checked quickly.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Let a problem be solved by a polynomial-time algorithm <i>A</i>. Define the verifier <i>V</i>(<i>x</i>, <i>c</i>) to ignore <i>c</i> and run <i>A</i> on <i>x</i>. It takes polynomial time. On a yes-instance it says yes for any certificate, say the empty one; on a no-instance it says no whatever the certificate. <span class="qed">∎</span></p></div>
<p>Graph 3-colouring is in NP too: can the vertices of a graph (Lesson 5) be coloured with three colours so that no edge joins two vertices of the same colour? The certificate is a colouring, and the verifier checks each edge once. Sudoku is in NP: the certificate is a filled grid. Contrast 2-colouring, which is in P: breadth-first search from any vertex forces the colour of everything it reaches, layer by layer, so either the forced colouring works or none does.</p>
<h2>The question</h2>
<p>Is P equal to NP? That is: is every problem whose answers can be <em>checked</em> quickly also a problem whose answers can be <em>found</em> quickly? Stephen Cook stated the question precisely in 1971. In 2000 the Clay Mathematics Institute named it one of seven Millennium Prize Problems, with a million dollars for a solution. Almost every expert believes the answer is no, and nobody has been able to prove it.</p>
<details class="reveal"><summary>Predict: trying all 2<sup><i>n</i></sup> subsets is an algorithm that solves subset sum. Doesn't that put subset sum in P?</summary><p>No. P requires <em>polynomial</em> time, and 2<sup><i>n</i></sup> is not a polynomial: it eventually exceeds <i>n</i><sup><i>k</i></sup> for every fixed <i>k</i>. An algorithm exists, so the problem is decidable, unlike Lesson 10's halting problem; the only algorithms known take exponential time. "Hard" in this lesson means "no fast algorithm known", which is very different from "no algorithm at all".</p></details>
<h2>Reductions: translating one problem into another</h2>
<div class="stmt"><p><span class="kind">Definition.</span> A <em>polynomial-time reduction</em> from problem <i>A</i> to problem <i>B</i> is a polynomial-time algorithm that turns every instance <i>x</i> of <i>A</i> into an instance <i>f</i>(<i>x</i>) of <i>B</i>, so that <i>x</i> is a yes-instance of <i>A</i> exactly when <i>f</i>(<i>x</i>) is a yes-instance of <i>B</i>.</p>
<p><span class="kind">Theorem 2.</span> If <i>A</i> reduces to <i>B</i> in polynomial time and <i>B</i> is in P, then <i>A</i> is in P.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> To decide <i>x</i>, compute <i>f</i>(<i>x</i>) and run <i>B</i>'s polynomial-time algorithm on it, answering as it does. By the definition of a reduction the answer is right. Computing <i>f</i> takes at most <i>p</i>(<i>n</i>) steps for some polynomial <i>p</i>, so <i>f</i>(<i>x</i>) has size at most <i>p</i>(<i>n</i>), and <i>B</i>'s algorithm then takes at most <i>q</i>(<i>p</i>(<i>n</i>)) steps for some polynomial <i>q</i>. A polynomial of a polynomial is a polynomial, so the total is polynomial. <span class="qed">∎</span></p></div>
<p>A reduction shows that <i>A</i> is no harder than <i>B</i>. Here is a small one. The <em>partition</em> problem asks: can a list of whole numbers be split into two groups with equal sums? Reduce it to subset sum: add up the list; if the total is odd, the answer is no (produce any no-instance of subset sum, such as the empty list with target 1); otherwise ask subset sum for a subset adding up to half the total. That is correct, because a subset with half the total leaves the other half for the rest, and it takes one pass to compute. So a fast subset-sum solver would give a fast partition solver.</p>
<h2>The same problem in a thousand costumes</h2>
<div class="stmt"><p><span class="kind">Definition.</span> A problem <i>B</i> is <b>NP-complete</b> if it is in NP and every problem in NP reduces to it in polynomial time.</p>
<p><span class="kind">Theorem 3.</span> If any NP-complete problem is in P, then P = NP.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> Let <i>B</i> be NP-complete and in P, and let <i>A</i> be any problem in NP. By the definition, <i>A</i> reduces to <i>B</i> in polynomial time, so by Theorem 2, <i>A</i> is in P. So NP ⊆ P, and with Theorem 1, P = NP. <span class="qed">∎</span></p></div>
<p>It is not obvious that NP-complete problems exist at all. In 1971 Stephen Cook, and independently Leonid Levin in the Soviet Union, proved that one does: the problem of deciding whether a formula of propositional logic, the kind Lesson 1 built truth tables for, can be made true. Its truth table has 2<sup><i>n</i></sup> rows for <i>n</i> variables, and no one knows a way to avoid essentially checking them. A year later Richard Karp showed that 21 famous problems were NP-complete too, among them versions of subset sum and graph colouring. Today thousands are known, from every corner of science and industry, and the puzzles at the start of the lesson were shown to be just as hard: Minesweeper in 2000, Tetris in 2002, Sudoku in 2003, Candy Crush in 2014.</p>
<p>That is the strongest evidence that P ≠ NP. Thousands of problems, attacked for half a century by people with every motive to solve them, have all turned out to be one problem in disguise, and nobody has found a fast algorithm for any of them. In practice, "this problem is NP-complete" ends an argument: stop looking for a fast method that always works, and look instead for a good-enough answer, or a fast method for the special cases you actually have.</p>
<h2>The laboratory</h2>
<p>The gap between finding and checking, measured. The solver tries subsets by counting in binary, as in Lesson 2, and counts how many it tried; the verifier checks a proposed subset.</p>`,
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
print(solve(list(range(1, 15)), 500))`, caption: 'Target 9 is found, as [4, 5], after trying 21 subsets; 30 is impossible, and all 64 are tried. The verifier checks a claim in one pass, and catches the false one. The last line tries all 16,384 subsets of fourteen numbers. Forty numbers would mean a trillion.' },
        { check: "Trying all 2ⁿ subsets solves subset sum. Does that put subset sum in P?", options: ["Yes", "No: 2ⁿ is not polynomial in n", "Yes, for small n"], answer: 1, why: "P requires O(nᵏ) steps for some fixed k. Exponential algorithms stay hopeless on faster hardware." },
        { check: "What does NP stand for, and what does it mean?", options: ["Not polynomial: problems with no fast algorithm", "Nondeterministic polynomial: yes-answers can be checked quickly given a certificate", "Nearly polynomial"], answer: 1, why: "NP is about checking, not solving. P ⊆ NP; whether they are equal is unknown." },
        `<p>The verifier is careful in the way a certificate checker must be: it checks not only the sum but also that each claimed number really comes from the list. A verifier that only checked the sum could be fooled by the made-up subset [53], and the definition of NP forbids being fooled.</p>
<h2>Before the exercises</h2>
<p>The first exercise asks for counts and for a reduction worked by hand. The second asks you to sort true statements about P and NP from false ones. For each statement, ask: is it about <em>finding</em> or about <em>checking</em>? Is it something proved, something believed, or something false? And is "hard" being used to mean slow, or impossible?</p>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Confusing "hard" (no fast algorithm known) with "undecidable" (Lesson 10: no algorithm at all). Thinking NP stands for "not polynomial". Believing a problem is outside NP because solving it is hard: NP is about <em>checking</em>. Assuming P ≠ NP has been proved. Getting a reduction backwards: to show a new problem is hard, reduce a known hard problem <em>to</em> it, not the other way round. Writing a verifier that can be fooled by a certificate that looks right but is not.</p>` },
        { check: "Problem A reduces to problem B in polynomial time, and B is in P. What follows?", options: ["A is in P", "B is NP-complete", "A is undecidable"], answer: 0, why: "Translate the instance of A, solve it as B, and the whole thing is polynomial. A is no harder than B." },
        {
          ex: {
            id: 'ma-11-1', kind: 'answer', title: 'Finding, checking and translating',
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
            followup: 'The reduction in (b)–(d) did a little work of its own, adding up the list and checking parity, before handing the question on. Reductions are allowed any polynomial-time work.'
          }
        },
        {
          ex: {
            id: 'ma-11-2', kind: 'choice', multi: true, title: 'What is known',
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
            followup: 'Only three statements were true, and every false one is a mistake experienced people make. Precision about what is proved, believed and false is most of what this subject asks.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>P: decision problems solvable in polynomial time. NP: problems whose yes-answers have certificates checkable in polynomial time. P ⊆ NP.</li>
<li>Whether P = NP is unknown; it is a Millennium Prize Problem, and most experts believe the answer is no.</li>
<li>A polynomial-time reduction from A to B shows A is no harder than B; if B is in P, so is A.</li>
<li>NP-complete problems are the hardest in NP: every NP problem reduces to them. If one is in P, then P = NP. Subset sum, 3-colouring and Sudoku are NP-complete.</li>
<li>"Hard" means no fast algorithm is known; "undecidable" (Lesson 10) means no algorithm exists.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Project: a lock made of arithmetic', summary: 'Put the whole course to work: build the RSA cipher, where the key that locks a message is public, the key that unlocks it is private, and the only way in is a problem believed to be hard.',
      blocks: [
        `<p>Two people who have never met want to share a secret over a channel that everyone can read. It sounds impossible: any key one of them sends, the eavesdropper sees too. Yet it happens every time you open a secure website. The method was published in 1977 by Ron Rivest, Adi Shamir and Leonard Adleman, and is named RSA after them. (A British government mathematician, Clifford Cocks, had found the same idea in 1973, but his work stayed secret until 1997.) The same year, Martin Gardner's magazine column printed a message locked with a 129-digit RSA key and offered a hundred dollars to anyone who could read it. It took seventeen years and the pooled computers of about six hundred volunteers. In 1994 the message was revealed: <em>The Magic Words are Squeamish Ossifrage</em>.</p>
<p>This project builds that lock, using nothing but ideas from this course: the modular arithmetic and fast powers of Lesson 4, Euclid's algorithm, and the growth rates of Lesson 11.</p>
<h2>The idea: a padlock</h2>
<p>Anyone can snap a padlock shut; only the owner has the key that opens it. So if you publish your padlock, anyone can lock a message for you, and nobody else can open it, not even the sender. In RSA the padlock is a pair of numbers (<i>n</i>, <i>e</i>) and the key is a third number <i>d</i>. Locking a number <i>a</i> means computing <i>a</i><sup><i>e</i></sup> mod <i>n</i>, and unlocking means raising to the power <i>d</i>. Everything depends on one theorem.</p>
<div class="stmt"><p><span class="kind">Theorem 1 (the round trip).</span> Let <i>p</i> and <i>q</i> be different primes, <i>n</i> = <i>pq</i> and <i>m</i> = (<i>p</i> − 1)(<i>q</i> − 1). Then for every integer <i>a</i> and every whole number <i>k</i>, <i>a</i><sup><i>km</i> + 1</sup> ≡ <i>a</i> (mod <i>n</i>).</p></div>
<p>Raising to the power <i>km</i> + 1 brings every number back to itself. The proof uses one fact from number theory that this course has not proved, so it is given for the curious below; the laboratory checks the theorem on every <i>a</i> for one <i>n</i>.</p>
<details class="reveal"><summary>A proof, for the curious</summary><p>It uses <em>Fermat's little theorem</em> (1640): if <i>p</i> is prime and <i>p</i> does not divide <i>a</i>, then <i>a</i><sup><i>p</i>−1</sup> ≡ 1 (mod <i>p</i>). Given that, if <i>p</i> does not divide <i>a</i>, then <i>a</i><sup><i>km</i> + 1</sup> = (<i>a</i><sup><i>p</i>−1</sup>)<sup><i>k</i>(<i>q</i>−1)</sup> · <i>a</i> ≡ 1 · <i>a</i> (mod <i>p</i>), by Lesson 4's Theorem 4. If <i>p</i> does divide <i>a</i>, both sides are ≡ 0 (mod <i>p</i>). Either way <i>p</i> divides <i>a</i><sup><i>km</i> + 1</sup> − <i>a</i>, and in the same way so does <i>q</i>. Two different primes that both divide a number have their product dividing it too, so <i>n</i> = <i>pq</i> divides <i>a</i><sup><i>km</i> + 1</sup> − <i>a</i>, which is the theorem. <span class="qed">∎</span></p></details>
<h2>Splitting the round trip in two</h2>
<p>A round trip is useful only if it can be split into two legs, one for locking and one for unlocking. Choose <i>e</i> with gcd(<i>e</i>, <i>m</i>) = 1, which Euclid's algorithm checks quickly. Then there is a number <i>d</i> with <i>ed</i> ≡ 1 (mod <i>m</i>), called the <em>inverse</em> of <i>e</i> modulo <i>m</i>; it exists exactly when gcd(<i>e</i>, <i>m</i>) = 1, and an extended form of Euclid's algorithm finds it fast. Then <i>ed</i> = <i>km</i> + 1 for some whole number <i>k</i>, and</p>
<p style="text-align:center">(<i>a</i><sup><i>e</i></sup>)<sup><i>d</i></sup> = <i>a</i><sup><i>ed</i></sup> = <i>a</i><sup><i>km</i> + 1</sup> ≡ <i>a</i> (mod <i>n</i>)</p>
<p>by Theorem 1. Raising to the power <i>e</i> scrambles; raising to the power <i>d</i> unscrambles. So: publish (<i>n</i>, <i>e</i>), and keep <i>d</i>, <i>p</i> and <i>q</i> secret. To send you a number <i>a</i> smaller than <i>n</i>, someone computes the locked number <i>c</i> = <i>a</i><sup><i>e</i></sup> mod <i>n</i> with Lesson 4's repeated squaring, and you compute <i>c</i><sup><i>d</i></sup> mod <i>n</i> and get <i>a</i> back. (Text becomes numbers in the obvious way, a few letters at a time.)</p>
<h2>The whole thing by hand</h2>
<p>RSA is small enough to run with pencil and paper, if the primes are small. Take <i>p</i> = 5 and <i>q</i> = 11. Then <i>n</i> = 55 and <i>m</i> = 4 × 10 = 40. Choose <i>e</i> = 3, which shares no factor with 40. Its inverse is <i>d</i> = 27, because 3 × 27 = 81 = 2 × 40 + 1. The padlock is (55, 3) and the key is 27.</p>
<p>Lock the message <i>a</i> = 2: <i>c</i> = 2<sup>3</sup> mod 55 = 8. Now unlock: compute 8<sup>27</sup> mod 55 by repeated squaring. Since 27 = 16 + 8 + 2 + 1, we need the powers 8<sup>1</sup>, 8<sup>2</sup>, 8<sup>8</sup> and 8<sup>16</sup>, reducing mod 55 after every step (Lesson 4's Theorem 4):</p>
<table class="small"><tr><th>power</th><th>value mod 55</th><th>how</th></tr><tr><td>8<sup>1</sup></td><td>8</td><td></td></tr><tr><td>8<sup>2</sup></td><td>9</td><td>64 − 55</td></tr><tr><td>8<sup>4</sup></td><td>26</td><td>9² = 81, and 81 − 55 = 26</td></tr><tr><td>8<sup>8</sup></td><td>16</td><td>26² = 676, and 676 − 12 × 55 = 16</td></tr><tr><td>8<sup>16</sup></td><td>36</td><td>16² = 256, and 256 − 4 × 55 = 36</td></tr><tr><td>8<sup>27</sup></td><td>2</td><td>36 × 16 × 9 × 8, reducing as you go: 576 → 26, 26 × 9 = 234 → 14, 14 × 8 = 112 → 2</td></tr></table>
<p>The message 2 comes back. Nothing in that calculation involved a number bigger than 676, even though 8<sup>27</sup> itself has 25 digits. That is why locking and unlocking stay fast when <i>n</i> has hundreds of digits.</p>
<h2>Why the eavesdropper is stuck</h2>
<p>The eavesdropper knows <i>n</i> and <i>e</i>, and sees <i>c</i>. To unlock <i>c</i> she needs <i>d</i>; to find <i>d</i> she needs <i>m</i> = (<i>p</i> − 1)(<i>q</i> − 1); and to find <i>m</i>, as far as anyone knows, she needs <i>p</i> and <i>q</i>. In other words she must <em>factor</em> <i>n</i>. For <i>n</i> = 55 that is trivial. For an <i>n</i> with 600 digits, trial division would need about 10<sup>300</sup> steps, far beyond any computer that could ever be built, and even the best known methods take time that grows faster than any polynomial in the number of digits (Lesson 11). Factoring is in NP, since a claimed factor is easy to check (Lesson 12), but nobody has found a fast way to factor, and nobody has proved that there is none. The whole internet is betting that there is none.</p>
<p>The security does not come from a secret method: you now know the entire method. It comes from a growth rate. Using the lock takes a number of steps that grows like the number of digits; picking it takes a number that grows exponentially with them.</p>
<h2>The laboratory</h2>
<p>The full cycle in Python: check Theorem 1 for one <i>n</i>, generate keys, lock and unlock a message, and then play the eavesdropper, factoring <i>n</i> by trial division and counting the steps. Python's three-argument <code>pow(a, e, n)</code> is Lesson 4's repeated squaring.</p>`,
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
print("message", message, "-> locked", locked, "-> unlocked", pow(locked, d, n))

# the eavesdropper: factor n by trial division
steps = 0
f = 2
while n % f != 0:
    f += 1
    steps += 1
print("eavesdropper found", f, "and", n // f, "after", steps, "divisions")
m2 = (f - 1) * (n // f - 1)
print("and reads the message:", pow(locked, inverse(e, m2), n))`, caption: 'No exceptions; the key is 2753; 1234 is locked to 2183 and unlocked again. The eavesdropper factors 3233 after 51 divisions and reads the message. Every extra digit of n multiplies her work by about three, while barely slowing the legitimate user.' },
        { check: "With n = pq, what is m, the number the keys e and d must satisfy ed ≡ 1 modulo?", options: ["n − 1", "(p − 1)(q − 1)", "pq"], answer: 1, why: "Theorem 1: raising to the power km + 1 modulo n is a round trip when m = (p − 1)(q − 1)." },
        { check: "What must an eavesdropper do to recover d from the public (n, e)?", options: ["Compute e⁻¹ mod n", "Factor n into p and q, to find m", "Try every message"], answer: 1, why: "d is the inverse of e modulo m, and m needs p and q. Factoring is believed to take time exponential in the number of digits." },
        `<h2>Before the exercises</h2>
<p>Both exercises are by hand, as in the table above. The first makes a key pair and locks a message; for the unlocking step, notice that 31 ≡ −2 (mod 33), and powers of −2 are easy. The second is the eavesdropper's job on a small padlock: factor <i>n</i>, rebuild <i>m</i>, find <i>d</i>. To find an inverse by hand, try <i>d</i> = 1, 2, 3, … until <i>ed</i> is one more than a multiple of <i>m</i>, or look for the multiple of <i>m</i> that is one less than a multiple of <i>e</i>.</p>`,
        { aside: `<p><b>Common mistakes in this project.</b> Choosing an <i>e</i> that shares a factor with <i>m</i>, so that no <i>d</i> exists. Computing <i>m</i> as <i>n</i> − 1, or with the wrong primes. Forgetting to reduce mod <i>n</i> after every multiplication, so the numbers grow enormous. Locking a message that is not smaller than <i>n</i>: the round trip only returns numbers below <i>n</i>. Thinking the security comes from keeping the method secret; it comes from the difficulty of factoring.</p>` },
        { check: "Why must the message be smaller than n?", options: ["For speed", "The round trip returns the message only modulo n", "Because e is small"], answer: 1, why: "a^(km + 1) ≡ a (mod n): a message of n or more comes back reduced, as a different number." },
        {
          ex: {
            id: 'ma-12-1', kind: 'table', title: 'Make a key and lock a message',
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
            followup: 'The trick 31 ≡ −2 is Lesson 4\u2019s Theorem 4 at work: any number may be replaced by anything congruent to it, including a negative one, whenever that makes the arithmetic easier.'
          }
        },
        {
          ex: {
            id: 'ma-12-2', kind: 'answer', title: 'Pick the lock',
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
            followup: 'Every step after factoring was fast: rebuilding m is one multiplication and finding d is Euclid\u2019s work. The entire security of RSA rests on the first step alone.'
          }
        },
        `<h2>What you have built</h2>
<p>Look back at what this project used. Propositions and proof, to know exactly what a theorem guarantees and what it does not. Sets and counting, to see why 2<sup><i>n</i></sup> possibilities cannot be searched. Divisibility, congruences, Euclid's algorithm and fast modular powers, which are the machinery of the lock itself. Growth rates, to know the difference between slow and impossible in practice. And behind them, the results of Lessons 10 and 12: there are questions no program can answer, and questions we believe no program can answer <em>quickly</em>, and the modern world has learned to build its security on the second kind.</p>
<p>That is the course. The mathematics of computing is not a set of formulas about computers. It is the study of what can be known, counted and done, and the remarkable fact that those questions have precise answers.</p>
<div class="recap"><h3>In this project</h3><ul>
<li>With <i>n</i> = <i>pq</i> and <i>m</i> = (<i>p</i> − 1)(<i>q</i> − 1), raising to the power <i>km</i> + 1 modulo <i>n</i> is a round trip (Theorem 1, from Fermat's little theorem).</li>
<li>Choose <i>e</i> with gcd(<i>e</i>, <i>m</i>) = 1 and <i>d</i> with <i>ed</i> ≡ 1 (mod <i>m</i>): <i>e</i> locks and <i>d</i> unlocks.</li>
<li>Locking and unlocking use repeated squaring, so they stay fast for huge numbers.</li>
<li>(<i>n</i>, <i>e</i>) is public; recovering <i>d</i> means factoring <i>n</i>, which is believed to take time exponential in the number of digits. The security is a growth rate, not a secret.</li>
</ul></div>`
      ]
    }
  ]
});
