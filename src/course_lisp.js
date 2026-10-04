// Lesson content, (c) 2026 Michael Sayers, licensed CC BY-SA 4.0 (see LICENSE-CONTENT.md).
window.COURSES = window.COURSES || [];
window.COURSES.push({
  id: 'lisp', code: 'SC 102', short: 'Lisp', lang: 'scheme',
  title: 'Introduction to Lisp',
  tagline: 'The ideas you already know, seen through a mathematician\u2019s eyes: procedures, processes, and data, in the spirit of SICP.',
  grades: 'Grades 11–12 (strong 10th) · after Python',
  audience: `<p><b>Grades 11–12</b>, or a strong 10th grader, after the Python course or equivalent. This is the course for students who like math: it treats programs the way algebra treats expressions, and it rewards the habit of asking "why does that work?" Being comfortable with functions like <em>f</em>(<em>x</em>) is enough; the final project takes derivatives, but the rules are given, so calculus is a bonus rather than a requirement.</p><p>Each lesson is a self-contained Hour of Code activity (lesson 2, on the substitution model, runs a little longer), and lessons 1–3 work well on their own for a taste.</p>`,
  description: `<p>Lisp is the second-oldest programming language still in use, and the one with the least to memorise: everything is either a single value or a parenthesised list. That is the point. With almost no syntax in the way, all your attention goes to the ideas: how expressions get their values, how procedures create processes, and how a couple of primitives can build any data structure you like.</p>
<p>If you have done the Python course, you will recognise every concept here. What changes is the angle. Python taught you to <em>write</em> programs; Lisp teaches you to <em>reason</em> about them, the way you reason about algebra. These lessons follow the opening chapters of <em>Structure and Interpretation of Computer Programs</em>, the MIT textbook that used Scheme, a dialect of Lisp, to teach this way of thinking for thirty years. By the end you will have written a program that does calculus on algebraic expressions: a thing Lisp does in thirty lines and most languages make you fight for.</p>`,
  outcomes: [
    'Read and write prefix expressions and predict exactly how the interpreter evaluates them',
    'Define procedures and trace them with the substitution model',
    'Tell a recursive process from an iterative one, and write both',
    'Build and take apart lists with cons, car and cdr',
    'Pass procedures to procedures: map, filter and accumulate',
    'Treat expressions as data and write a symbolic differentiator'
  ],
  textbook: `<h3>The book</h3><p>Abelson, Sussman and Sussman, <a href="https://mitp-content-server.mit.edu/books/content/sectbyfn/books_pres_0/6515/sicp.zip/index.html" target="_blank" rel="noopener"><em>Structure and Interpretation of Computer Programs</em></a>, 2nd ed., free online. These lessons follow §1.1–1.3 and §2.1–2.3 loosely. Reading alongside is encouraged but not required.</p><p class="small">Several examples, exercises and the final project are adapted from the book, which is licensed under <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a> by the MIT Press; each lesson names the section it draws on. The adaptations rewrite the material for this course and are shared under the same licence.</p>`,
  lessons: [
    /* ================================================================== */
    {
      standards: ['3A-CS-02'],
      standard: 1, title: 'Expressions and the interpreter', summary: 'A language with one kind of sentence: what an expression is, how the interpreter finds its value, and how to give a value a name.',
      blocks: [
        `<p>In 1958 John McCarthy at MIT designed a language for research on artificial intelligence and called it Lisp, for LISt Processing. Only Fortran, from the year before, is an older programming language still in wide use. Lisp's look, with a parenthesis around every expression, has earned it a joking expansion, "Lots of Irritating Silly Parentheses". But its ideas turned up decades later in almost every language you have heard of, and by the end of this course you will see why the parentheses are the point.</p>
<p>You already know one programming language. This course teaches a second one, and it does so for a reason that has nothing to do with job listings: Lisp is the language in which the <em>ideas</em> of programming are easiest to see. It has almost no syntax, so there is nothing between you and the question of what a program means. The dialect we use is called Scheme, and the lessons follow a famous book, <em>Structure and Interpretation of Computer Programs</em>, whose way of thinking has shaped every language since, Python included.</p>
<p>Here is the question for today. Given something like <code>(+ 2 (* 3 4))</code>, how does the interpreter find its value, and how can you be sure of getting the same answer it does?</p>`,
        { photo: 'sicp-cover', caption: "The cover of the second edition of the book this course follows, where a sorcerer holds a sphere labelled eval and apply. Lesson 2 begins with the book's comparison of programmers to sorcerers." },
        `<h2>Talking to the interpreter</h2>
<p>In Python you write a file and run it. In Scheme the natural way to work is a conversation: you type an <em>expression</em>, the interpreter works out its <em>value</em> and prints it, and waits for the next one. This loop, read an expression, evaluate it, print the value, is called the <em>read-eval-print loop</em>, or REPL. The box below sends each line to the interpreter in turn; the lines beginning <code>;Value:</code> are its replies, printed exactly as MIT Scheme prints them. Predict the five values, then press <b>Run</b>.</p>`,
        { play: `486
(+ 137 349)
(- 1000 334)
(* 5 99)
(/ 10 5)`, predict: true, caption: 'The replies are 486, 486, 666, 495 and 2. The simplest expression is a number, and its value is itself, so the first line replies 486. The other four are combinations: the interpreter applies the operator to the operands. Change a number and run again.' },
        `<h2>The grammar, in two lines</h2>
<p>Python has many kinds of statement and several dozen rules of syntax. Scheme has one kind of thing, the expression, and here is the whole grammar of the part we need today.</p>
<div class="stmt"><p><span class="kind">Rule.</span> An expression is either an <em>atom</em>, that is a number such as <code>486</code> or a name such as <code>size</code> or <code>+</code>, or a <em>combination</em>: an opening parenthesis, then one or more expressions separated by spaces, then a closing parenthesis.</p>
<p>In a combination, the first expression is called the <em>operator</em> and the rest are the <em>operands</em>.</p></div>
<p>So <code>(+ 137 349)</code> is a combination whose operator is <code>+</code> and whose operands are <code>137</code> and <code>349</code>. Writing the operator first is called <em>prefix notation</em>. It looks odd for about ten minutes, and then two advantages appear, one small and one large.</p>
<p>The small one: an operator can take as many operands as you like, with no repetition. Compare <code>21 + 35 + 12 + 7</code> with <code>(+ 21 35 12 7)</code>. The large one: because every combination is wrapped in its own parentheses, there are <strong>no precedence rules</strong>. In Python, <code>2 + 3 * 4</code> is 14 because multiplication binds tighter, a rule you had to learn. In Scheme there is nothing to learn: <code>(+ 2 (* 3 4))</code> is 14 and <code>(* (+ 2 3) 4)</code> is 20, and the parentheses say which.</p>
<details class="reveal"><summary>Predict: what are <code>(- 10)</code>, <code>(+)</code>, and <code>(+ 1 2 3 4 5)</code>?</summary><p><code>-10</code>: with one operand, <code>-</code> negates. <code>0</code>: adding nothing at all gives the number that changes nothing under addition. <code>15</code>. The rule "operator, then any operands" holds even in the odd cases; there are no special cases to memorise.</p></details>`,
        { play: `(+ 21 35 12 7)
(* 25 4 12)
(- 10)
(+)
(+ 2 (* 3 4))
(* (+ 2 3) 4)`, caption: 'Prefix notation in six lines. Add a line that computes 100 minus 3 times 7.' },
        { check: "How do you write 3 + 4 in Scheme?", options: ["<code>3 + 4</code>", "<code>(+ 3 4)</code>", "<code>(3 + 4)</code>"], answer: 1, why: "Operator first, then the operands, inside parentheses. (3 + 4) tries to apply 3 as a procedure.", wrong: ["This is the habit from Python and from school arithmetic. Scheme has no infix notation: written this way it is three separate expressions, and the operator must come first, inside parentheses.", null, "The parentheses are right but the order is not. The first thing in a combination is the operator, so this tries to apply 3 as a procedure. The + must come first."] },
        `<h2>Reading nested expressions</h2>
<p>Combinations can contain combinations, to any depth. The skill of reading them is the skill of finding the matching parentheses, and it is easier than it looks, because you never read left to right. You read from the <em>inside out</em>: find an innermost combination (one with no parentheses inside it), work out its value, and imagine it replaced by that value. Repeat.</p>
<p>Take <code>(+ (* 3 5) (- 10 6))</code>. The innermost combinations are <code>(* 3 5)</code>, which is 15, and <code>(- 10 6)</code>, which is 4. Replace them: <code>(+ 15 4)</code>, which is 19.</p>
<p>When an expression is long, Scheme programmers write it on several lines, with each operand starting in the same column as the first one. The interpreter does not care about the layout; it is for the reader. Here is the same expression written both ways. The second is how you should write yours. Work out the value from the inside out before you run it.</p>`,
        { play: `(+ (* 3 (+ (* 2 4) (+ 3 5))) (+ (- 10 7) 6))

(+ (* 3
      (+ (* 2 4)
         (+ 3 5)))
   (+ (- 10 7)
      6))`, predict: true, caption: 'Both print 57, because they are the same expression. From the inside out: (* 2 4) is 8 and (+ 3 5) is 8, so the inner sum is 16 and (* 3 16) is 48; (- 10 7) is 3 and (+ 3 6) is 9; and 48 plus 9 is 57. Notice how the columns of the second layout show which operands belong to which operator. Change the 6 to 10 and predict the new value.' },
        `<h2>How the interpreter evaluates a combination</h2>
<p>You have just done by hand what the interpreter does. Here is its rule, stated exactly. It is short, and it refers to itself.</p>
<div class="stmt"><p><span class="kind">The evaluation rule.</span> To evaluate a combination:</p>
<p>1. Evaluate every expression inside it: the operator and each operand.</p>
<p>2. Apply the procedure that is the value of the operator to the values of the operands.</p></div>
<p>Step 1 says: to evaluate a combination, first evaluate its parts. But a part may itself be a combination, and then the same rule applies to it. A rule that uses itself like this is called <em>recursive</em>, and this course will return to that idea many times. Notice that the rule never says "work left to right" or "multiply before adding". Nesting is the only structure there is, so evaluation naturally forms a tree, with values flowing upward from the leaves to the root. Type an expression into the figure and watch it draw the tree.</p>`,
        { fig: 'evaltree', caption: 'Each circle is an operator applied to the values of its children. The number beside a circle is the value of that combination. Leaves are atoms.' },
        `<p>Two kinds of atom need no rule of their own. A numeral such as <code>486</code> stands for the number it names. A name such as <code>+</code> stands for whatever the interpreter has attached to that name; for <code>+</code>, that is the built-in procedure that adds. You can see this by evaluating the name on its own. Guess what the interpreter prints for the first two lines before you run it:</p>`,
        { play: `+
*
(+ 1 2)`, predict: true, caption: 'The first two replies are not numbers: the value of the name + is the built-in procedure that adds, and the value of * is the one that multiplies, and this is how the interpreter prints a procedure. Naming a procedure does not use it. Only in the third line is a procedure applied to something, and the reply is 3. Try the name - on a line of its own.' },
        { check: "To evaluate <code>(* (+ 1 2) 4)</code>, what does the interpreter do first?", options: ["Multiply", "Evaluate every part: the operator * and both operands, including (+ 1 2)", "Look for a definition of *"], answer: 1, why: "The evaluation rule: evaluate every expression in the combination, then apply the operator's value to the operands' values.", wrong: ["The multiplication cannot happen yet, because its first operand, (+ 1 2), is still a combination and not a number. The evaluation rule evaluates every part first and only then applies the operator.", null, "* is a built-in name, so evaluating it only looks up its value, the multiplying procedure. A combination does not go searching for definitions; define is a different form that is used to create them."] },
        `<h2>Naming things</h2>
<p>A program that could only compute with numbers you typed would be a calculator. The step from a calculator to a language is the ability to give a value a name and use the name later. In Scheme that is done with <code>define</code>:</p>`,
        { code: `(define size 2)`, caption: 'Read it as: from now on, the name size stands for 2.' },
        `<p>Look at the shape of that line. It is a combination with the operator <code>define</code>, so you might expect the evaluation rule to apply: evaluate <code>define</code>, evaluate <code>size</code>, evaluate <code>2</code>, then apply. But evaluating <code>size</code> would fail, because <code>size</code> has no value yet; giving it one is the whole point. So <code>define</code> cannot follow the rule.</p>
<div class="stmt"><p><span class="kind">Definition.</span> A <em>special form</em> is an expression that looks like a combination but is evaluated by a rule of its own instead of the general rule. <code>define</code> is the first special form you have met. There are only a handful in the whole language, and each lesson that introduces one will say so.</p></div>
<p>The rule for <code>define</code>: do not evaluate the name; evaluate the expression after it; record that the name now stands for that value. The interpreter answers with the name, to confirm.</p>`,
        { play: `(define size 2)
size
(* 5 size)

(define pi 3.14159)
(define radius 10)
(* pi (* radius radius))
(define circumference (* 2 pi radius))
circumference`, predict: true, caption: 'Each define answers with the name it recorded. Then size is 2 and (* 5 size) is 10; the area line gives 314.159 and circumference gives 62.8318. Once a name is defined it can be used in any later expression, including inside another define. Change radius to 3 on the second define and run again: the answers follow.' },
        `<p>Where do the names go? The interpreter keeps a table of pairs, each a name and the value it stands for. The table is called the <em>environment</em>, and evaluating a name means looking it up there. A name that is not in the table is an error, not a guess. Defining a name that already exists replaces its entry.</p>
<h2>Reading the interpreter's complaints</h2>
<p>Scheme gives short, exact error messages. Learning three of them now will save you most of the frustration of the next few lessons. Run each box, read the message, then fix the expression as the caption says.</p>`,
        { play: `(define x 10)
(+ x y)`, expectError: true, caption: 'Unbound variable: y. The name y is not in the environment. Define y on a line before the sum and run again.' },
        `<p>The second message comes from the mistake that nearly everyone makes first, writing arithmetic the way school taught it.</p>`,
        { play: `(3 + 4)`, expectError: true, caption: 'The object 3 is not applicable. Everyone writes this once. The interpreter followed its rule: the first thing in the combination, 3, is the operator, and 3 is not a procedure. Rewrite it in prefix notation.' },
        { check: "What does <code>(3 + 4)</code> give?", options: ["7", "An error: the object 3 is not applicable", "3"], answer: 1, why: "The first thing in a combination is the operator. 3 is not a procedure, so it cannot be applied.", wrong: ["That is how a calculator or Python reads it, with the middle item as the operator. Scheme always takes the first item as the operator, and 3 is not a procedure.", null, "The interpreter does not stop at the first thing it sees, and a combination is not worth its first part. It tries to apply 3 as a procedure and reports an error."] },
        { play: `(+ 1 (* 2 3)`, expectError: true, caption: 'Unexpected end of input: a parenthesis is missing. Count them: three opened, two closed. The editor highlights matching pairs when your cursor is next to one.' },
        `<h2>A note on numbers</h2>
<p>Real MIT Scheme keeps fractions exact: there, <code>(/ 1 3)</code> is <code>1/3</code>. The small interpreter on this site uses ordinary decimal arithmetic, so you will see <code>.333333333333</code>, written without a leading zero the way MIT Scheme prints decimals. For whole-number division use <code>quotient</code> and <code>remainder</code>: <code>(quotient 7 2)</code> is 3 and <code>(remainder 7 2)</code> is 1, the same pair that Python calls <code>//</code> and <code>%</code>. Nothing else in these lessons depends on the difference.</p>
<h2>Before the exercises</h2>
<p>Both exercises ask you to translate ordinary notation into prefix notation. The reliable method is to ask, of the whole expression, "which operation is done <em>last</em>?" That operation is the outermost combination, and its operands are the pieces it combines. Then ask the same question of each piece.</p>
<p>Worked example: 2 × (3 + 4) − 5. The last operation is the subtraction, so the outermost form is <code>(- … 5)</code>. Its first operand is 2 × (3 + 4), whose last operation is the multiplication: <code>(* 2 …)</code>, with the sum inside. Assembled from the outside in:</p>`,
        { play: `(- (* 2 (+ 3 4)) 5)`, caption: 'Check it from the inside out: (+ 3 4) is 7, (* 2 7) is 14, (- 14 5) is 9.' },
        `<p>The second exercise builds on the circle example above: define values in terms of names, not numbers, so that changing one definition changes everything that depends on it. That is what a name is for.</p>`,
        `<details class="reveal"><summary>Puzzle: work out <code>(+ (* 3 (+ 2 4)) (- 10 7))</code> by hand, from the innermost parentheses outwards.</summary><p><code>21</code>. The innermost combination is <code>(+ 2 4)</code>, which is 6; then <code>(* 3 6)</code> is 18; separately <code>(- 10 7)</code> is 3; and <code>(+ 18 3)</code> is 21. In the usual notation this is 3 × (2 + 4) + (10 − 7). The parentheses make the order of work completely explicit, so there are no precedence rules to remember at all.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Writing <code>3 + 4</code> or <code>(3 + 4)</code>: the operator must come first. Unbalanced parentheses: every <code>(</code> needs a <code>)</code>, and the editor shows you the match. Using a name before defining it. Expecting precedence rules: there are none, so <code>(+ 2 3 * 4)</code> is an error, not 14. Writing the number instead of the expression that computes it, which throws away the whole point of naming.</p>` },
        {
          ex: {
            id: 'ls-1-1', title: 'Prefix arithmetic',
            prompt: `<p>Define <code>total</code> to be the value of the ordinary-notation expression <code>3 × 5 + 4 × 2 − 1</code>, written as a single Scheme combination. Do not type the answer; the point is to build the expression. Ask "which operation happens last?" and work outward from there.</p>`,
            starter: `(define total ...)\ntotal`,
            solution: `(define total (- (+ (* 3 5) (* 4 2)) 1))\ntotal`,
            hints: ['In ordinary notation the multiplications happen first, then the addition, then the subtraction of 1. So the last operation is the subtraction: the outermost combination is (- … 1).', 'Inside it goes the sum of the two products: (+ (* 3 5) (* 4 2)).'],
            tests: [{ call: 'total', expect: '22' }],
            mustContain: [{ re: /\(\s*\*\s+3\s+5\s*\)|\(\s*\*\s+5\s+3\s*\)/, msg: 'Write the multiplication 3 × 5 as a combination, (* 3 5).' }],
            mustNotContain: [{ re: /\b22\b/, msg: 'Build the expression rather than typing the answer 22.' }],
            followup: 'Read your expression from the inside out once more, as the interpreter does: two products, a sum, a difference.'
          }
        },
        {
          ex: {
            id: 'ls-1-2', title: 'A circle, by name',
            prompt: `<p>With <code>pi</code> defined as <code>3.14159</code> and <code>radius</code> as <code>5</code>, define <code>area</code> (π r²) and <code>circumference</code> (2 π r) in terms of those <em>names</em>, not the numbers they stand for.</p>`,
            starter: `(define pi 3.14159)\n(define radius 5)\n(define area ...)\n(define circumference ...)\narea\ncircumference`,
            solution: `(define pi 3.14159)\n(define radius 5)\n(define area (* pi radius radius))\n(define circumference (* 2 pi radius))\narea\ncircumference`,
            hints: ['* can take three operands: (* pi radius radius) is π r².', 'circumference is (* 2 pi radius).'],
            tests: [{ call: 'area', expect: '78.53975' }, { call: 'circumference', expect: '31.4159' }],
            mustNotContain: [{ re: /78\.5|31\.4|\b25\b/, msg: 'Compute from the names pi and radius rather than typing the numbers.' }],
            followup: 'Change radius to 7 and evaluate area again. Nothing else needed changing: that is what a name buys you.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>Everything you type is an expression, and the interpreter prints its value. An expression is an atom or a combination <code>(operator operand …)</code>.</li>
<li>Prefix notation: operator first, any number of operands, no precedence rules; the parentheses are the grouping.</li>
<li>The evaluation rule: evaluate every part of a combination, then apply the operator's value to the operands' values. Read nested expressions from the inside out. That answers today's question: the interpreter follows this one rule, so you can follow it too, and you will get the same value it does.</li>
<li><code>define</code> gives a name a value in the environment. It is a special form, with its own rule.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3A-CS-01', '3A-AP-17', '3A-AP-18'],
      standard: 1, title: 'Procedures and the substitution model', summary: 'Naming a computation, a precise rule for what happens when you use it, and why the names inside a procedure belong to it alone.',
      blocks: [
        `<p>SICP begins by comparing programmers to sorcerers: a program is like a spell, a carefully arranged sequence of symbols that makes an invisible process happen inside the machine. As with any spell, a single wrong word can have unexpected effects, so a sorcerer needs to know exactly what each word will do. This lesson gives the first precise rule for predicting what a spell does.</p>
<p>So here is the question. When you apply a procedure you wrote, what exactly does the interpreter do, and why can the names inside it never get mixed up with the names outside?</p>
<p>Lesson 1 gave names to values: <code>(define radius 10)</code>. A value is a finished thing, though. This lesson gives names to <em>computations</em>, recipes that can be used on any value you like, and then states exactly what the interpreter does when you use one. That statement, the <em>substitution model</em>, is the tool you will use for the rest of the course to work out what a Scheme program does before you run it.</p>
<h2>Defining a procedure</h2>
<p>The rule first, then an example.</p>
<div class="stmt"><p><span class="kind">Rule (procedure definition).</span> The special form <code>(define (<i>name</i> <i>parameter</i> …) <i>body</i>)</code> creates a procedure and gives it the name <i>name</i>. The <em>formal parameters</em> are names that stand for the values the procedure will be given each time it is used. The <em>body</em> is an expression that computes the result from them. Nothing in the body is evaluated when the definition is made.</p></div>
<p>This is Lesson 1's special form <code>define</code> in a second shape. When the thing after <code>define</code> is a single name, you are naming a value; when it is a parenthesised list, you are defining a procedure, and the list shows how the procedure will be called. The last sentence of the rule matters: a definition only records the recipe. In the example below, the multiplication happens later, each time the procedure is used, and never at the moment of definition.</p>`,
        { code: `(define (square x) (* x x))`, caption: 'Read it aloud: "to square something, multiply it by itself." The name is square, the one formal parameter is x, and the body is (* x x).' },
        `<p>Using a procedure is called <em>applying</em> it, and you apply it with an ordinary combination: the procedure's name as the operator, and the values you want it to work on as the operands. Those values are called the <em>arguments</em>. Keep the two words apart: the parameter <code>x</code> is the name used in the recipe; the argument, such as <code>21</code>, is the value that stands in for it in one particular use. Predict the five replies, then run.</p>`,
        { play: `(define (square x) (* x x))
(square 21)
(square (+ 2 5))
(square (square 3))
square`, predict: true, caption: 'The first reply, square, only confirms the definition. Then 441, 49 and 81: the operand (+ 2 5) is evaluated to 7 first, and the inner (square 3) gives 9 for the outer call to square. The last line evaluates the name without applying it, so the reply is the procedure itself. Change the arguments and predict each reply first.' },
        { check: "When is the body of <code>(define (square x) (* x x))</code> evaluated?", options: ["When the define is typed", "Each time square is applied to an argument", "Never"], answer: 1, why: "A definition only records the body. Nothing in it runs until the procedure is used.", wrong: ["If the body ran at definition time, x would have no value yet and (* x x) would fail. A definition only records the recipe; nothing in the body is evaluated until the procedure is applied.", null, "The body is exactly the part that runs, once for each application. A definition is a recipe waiting to be used, not a decoration."] },
        `<p>The last line is worth a second look. Lesson 1 showed that the value of the name <code>+</code> is a procedure. The value of <code>square</code> is a procedure too, and the interpreter prints both the same way, except that it calls yours <em>compound</em> because you built it from other procedures.</p>
<h2>Procedures built from procedures</h2>
<p>A procedure you define is used exactly as a built-in one is, so it can appear in the body of the next procedure you define. Here is <code>sum-of-squares</code>, built from <code>square</code>, and then <code>f</code>, built from <code>sum-of-squares</code>. Predict <code>(f 5)</code> before you run it.</p>`,
        { play: `(define (square x) (* x x))

(define (sum-of-squares x y)
  (+ (square x) (square y)))

(define (f a)
  (sum-of-squares (+ a 1) (* a 2)))

(sum-of-squares 3 4)
(f 5)`, predict: true, caption: 'Each definition replies with its name. Then (sum-of-squares 3 4) is 9 plus 16, which is 25, and (f 5) is 136: f passes 6 and 10 to sum-of-squares, and 36 plus 100 is 136. Change the (+ a 1) in f to (+ a 2) and work out the new answer by hand before running.' },
        `<p><code>sum-of-squares</code> uses <code>square</code> without knowing how <code>square</code> does its job; it only relies on <em>what</em> <code>square</code> computes. Nothing about the way a procedure is used tells you whether it was built in or written by you, and the language does not distinguish. This is the idea behind every large program: each procedure is a <em>black box</em>, and whoever uses it needs to know what goes in and what comes out, not what happens inside. Later lessons will ask you to write procedures that Scheme already has built in, and it will make no difference which version you use.</p>
<h2>The substitution model</h2>
<p>What happens when a procedure you defined is applied? Lesson 1's evaluation rule says: evaluate the operator and the operands, then apply the operator's value to the operands' values. For a built-in procedure such as <code>*</code>, "apply" means the machine does the arithmetic. For a procedure you defined, "apply" needs a rule of its own, and here it is.</p>
<div class="stmt"><p><span class="kind">The substitution rule.</span> To apply a defined procedure to arguments, take its body, replace each formal parameter by the corresponding argument, and evaluate the resulting expression.</p></div>
<p>Together with the evaluation rule, this is a complete method for working out any expression by hand. Evaluate the operands. If the operator is built in, do the arithmetic. If it is a defined procedure, rewrite the whole call as the procedure's body with the arguments substituted in. Repeat until a single value is left. This method is called the <em>substitution model</em>. Step through <code>(f 5)</code> with it.</p>`,
        { fig: 'subst', steps: [
          { text: '(f 5)', note: 'The operand 5 is already a value. f is a defined procedure, so replace the call by its body, (sum-of-squares (+ a 1) (* a 2)), with 5 in place of a.' },
          { text: '(sum-of-squares (+ 5 1) (* 5 2))', note: 'Before sum-of-squares can be applied, its operands must be evaluated.' },
          { text: '(sum-of-squares 6 10)', note: 'Now substitute 6 for x and 10 for y in the body of sum-of-squares.' },
          { text: '(+ (square 6) (square 10))', note: 'Two calls to square. Each is replaced by square\u2019s body, (* x x), with the argument in place of x.' },
          { text: '(+ (* 6 6) (* 10 10))', note: 'Only built-in arithmetic is left.' },
          { text: '(+ 36 100)', note: 'One addition to go.' },
          { text: '136', note: 'The value of (f 5), the same as the interpreter printed.' }
        ], caption: 'Each line follows from the one before by one of two moves: do some built-in arithmetic, or replace a call to a defined procedure by its body.' },
        `<p>This is how you simplify an algebraic expression with pencil and paper, and the resemblance is deliberate: a Scheme program is something you can reason about the way you reason about algebra. You do not have to do it by hand every time: press <b>Show the substitution</b> under any example in this course, and the Code Lab carries out these steps for every expression in it, marking the part about to be rewritten and explaining each move. Try it on the playground above: it shows <code>(f 5)</code> becoming 136, step by step.</p>
<details class="reveal"><summary>Predict: with <code>(define (double x) (+ x x))</code>, write out every step of <code>(double (double 3))</code>.</summary><p>The operand is evaluated first, and it is itself a call: <code>(double 3)</code> becomes <code>(+ 3 3)</code>, which is 6. So the outer call is <code>(double 6)</code>, which becomes <code>(+ 6 6)</code>, which is <code>12</code>. Four lines: <code>(double (double 3))</code>, <code>(double (+ 3 3))</code>, <code>(double 6)</code>, <code>(+ 6 6)</code>, then 12.</p></details>
<h2>Whose x is it?</h2>
<p>A natural worry: <code>square</code> uses the name <code>x</code>. What if the program has also defined an <code>x</code> of its own? The substitution rule settles it. When <code>(square 3)</code> is applied, the <code>x</code> in the body is replaced by 3 before anything in the body is evaluated, so the body never goes looking for any other <code>x</code>. And the rule never stores anything anywhere, so the outside <code>x</code> cannot be changed either.</p>
<div class="stmt"><p><span class="kind">Rule (parameters are local).</span> A formal parameter belongs to its procedure. It stands for the argument only inside that procedure's body and means nothing outside it. Renaming a parameter everywhere in its own definition does not change what the procedure does.</p></div>
<p>Predict what <code>(square 3)</code> and <code>x</code> print in the box below.</p>`,
        { play: `(define x 10)
(define (square x) (* x x))
(square 3)
x

(define (square-again n) (* n n))
(square-again 3)`, predict: true, caption: '(square 3) is 9 and x is still 10: the parameter x and the defined x are two different names that happen to be spelled alike, and the body never looks for the outside one. square-again is the same procedure with its parameter renamed, and gives the same answer, 9. Rename the parameter of square to y, in both places, and run again.' },
        { check: "After <code>(define x 10)</code> and <code>(define (square x) (* x x))</code>, what is <code>(square 3)</code>, and what is <code>x</code> afterwards?", options: ["9, and x is 3", "9, and x is still 10", "100"], answer: 1, why: "The parameter x belongs to square and means nothing outside it. The defined x is a different name that happens to be spelled alike.", wrong: ["This reads applying a procedure as assigning to a variable, as if giving 3 to the parameter overwrote the outside x. Nothing is stored anywhere: the parameter belongs to square, and the defined x is a separate name.", null, "That would use the defined x in place of the argument. Substitution replaces x in the body by 3 before anything is evaluated, so the body never goes looking for the outside x."] },
        `<p>SICP says that a procedure definition <em>binds</em> its formal parameters, and calls a parameter a <em>bound variable</em>. Whatever the vocabulary, the practical rule is simple: inside the body, a parameter means the argument; outside, it means nothing at all.</p>
<details class="reveal"><summary>Predict: after <code>(define y 4)</code>, what is <code>(square y)</code>, and what is <code>y</code> afterwards?</summary><p><code>16</code>, and <code>y</code> is still <code>4</code>. The operand <code>y</code> is evaluated to 4, and 4 is what gets substituted. Applying a procedure computes a new value; it never changes the things it was given.</p></details>
<h2>Two orders of evaluation</h2>
<p>The substitution model as stated evaluates the operands <em>first</em> and substitutes their values. There is a second possibility, and SICP makes a point of it: substitute the operand <em>expressions</em>, unevaluated, and keep expanding defined procedures until only built-in operations remain; do arithmetic only when there is nothing else to do. Both are sensible, so the rule has to choose.</p>
<div class="stmt"><p><span class="kind">Definition.</span> <em>Applicative order</em> evaluates the operands and then applies the procedure to their values. <em>Normal order</em> substitutes the operand expressions themselves, and evaluates them only when a built-in operation needs their values.</p></div>
<p>Scheme uses applicative order; that is what the stepper above showed. Here is the same call in normal order. Watch what happens to <code>(+ 5 1)</code>.</p>`,
        { fig: 'subst', steps: [
          { text: '(f 5)', note: 'Replace the call by the body of f, with 5 in place of a, exactly as before.' },
          { text: '(sum-of-squares (+ 5 1) (* 5 2))', note: 'Normal order: do not evaluate the operands. Substitute the expressions (+ 5 1) and (* 5 2) for x and y as they stand.' },
          { text: '(+ (square (+ 5 1)) (square (* 5 2)))', note: 'Expand each square the same way, copying the unevaluated operand into both places where x appears.' },
          { text: '(+ (* (+ 5 1) (+ 5 1)) (* (* 5 2) (* 5 2)))', note: 'Fully expanded: only built-in operations remain. Now the arithmetic starts, and (+ 5 1) is computed twice, as is (* 5 2).' },
          { text: '(+ (* 6 6) (* 10 10))', note: 'The same expression the applicative-order stepper reached, by a longer road.' },
          { text: '(+ 36 100)', note: '' },
          { text: '136', note: 'The same answer.' }
        ], caption: 'Normal order: expand everything first, compute last. The interpreter on this site, like every Scheme, does not work this way.' },
        `<p>The same answer, 136, but <code>(+ 5 1)</code> and <code>(* 5 2)</code> were each worked out twice, because normal order copied the unevaluated expression into both places where <code>x</code> appears in <code>square</code>. For every procedure in this lesson the two orders agree on the answer, and applicative order simply avoids the repeated work. They do not always agree. The place where they part ways is decisions: Lesson 3 introduces <code>if</code> and <code>cond</code>, which must <em>not</em> evaluate all their parts before choosing, and that is exactly why they have to be special forms.</p>
<h2>Definitions inside a procedure</h2>
<p>A body can be more than one expression. It may begin with definitions of its own, followed by the expression that computes the result.</p>
<div class="stmt"><p><span class="kind">Rule (internal definitions).</span> A procedure body may consist of one or more <code>define</code>s followed by a final expression, whose value is the result. The internal definitions may use the procedure's parameters, and the names they create exist only inside the body.</p></div>
<p>A good use is to name an intermediate quantity so that the final expression reads like the formula it computes. The distance between the points (<i>x</i><sub>1</sub>, <i>y</i><sub>1</sub>) and (<i>x</i><sub>2</sub>, <i>y</i><sub>2</sub>) is √(<i>dx</i>² + <i>dy</i>²), where <i>dx</i> and <i>dy</i> are the differences between the coordinates. <code>sqrt</code> is built in. Predict the two distances.</p>`,
        { play: `(define (square x) (* x x))

(define (distance x1 y1 x2 y2)
  (define dx (- x2 x1))
  (define dy (- y2 y1))
  (sqrt (+ (square dx) (square dy))))

(distance 0 0 3 4)
(distance -1 2 11 7)`, predict: true, caption: 'dx and dy are worked out from the parameters each time distance is applied, so the answers are 5 and 13: the long sides of a 3-4-5 and a 5-12-13 right triangle. In the second call dx is 12 and dy is 5. Change the second call to (distance 0 0 6 8) and predict the answer.' },
        `<p>The names <code>dx</code> and <code>dy</code> are internal, so the rest of the program cannot see them. Run the same definition and then ask for <code>dx</code>:</p>`,
        { play: `(define (square x) (* x x))

(define (distance x1 y1 x2 y2)
  (define dx (- x2 x1))
  (define dy (- y2 y1))
  (sqrt (+ (square dx) (square dy))))

(distance 0 0 3 4)
dx`, expectError: true, caption: 'Unbound variable: dx. Outside the body of distance, the name dx means nothing. That is a feature: a helper name inside one procedure can never collide with the same name used somewhere else.' },
        { check: "An internal define inside a procedure creates a name that exists…", options: ["Everywhere, after the procedure is first called", "Only inside that procedure's body", "Only on the line where it is defined"], answer: 1, why: "Helper names inside one procedure can never collide with the same name used elsewhere.", wrong: ["Internal names do not leak out. Each application of the procedure makes them for its own body only, which is why asking for dx afterwards is an error.", null, "The name lasts for the whole body, not one line. The final expression of distance uses dx and dy several lines after they were defined."] },
        `<p>An internal definition can also define a procedure, and an internal procedure can use the names around it without having them passed in. Below, <code>disc</code> computes the area of a disc of radius <code>r</code>. It uses <code>pi</code>, which is neither one of its parameters nor defined at the top level of the program: it is defined in the body where <code>disc</code> itself was defined.</p>`,
        { play: `(define (square x) (* x x))

(define (ring-area outer inner)
  (define pi 3.14159)
  (define (disc r) (* pi (square r)))
  (- (disc outer) (disc inner)))

(ring-area 5 3)`, caption: 'The area of a ring with outer radius 5 and inner radius 3: the big disc minus the hole, 50.26544. Try evaluating (disc 5) on a new line at the end: disc is internal too.' },
        `<div class="stmt"><p><span class="kind">Definition.</span> When a procedure's body uses a name that is not one of its own parameters, the name is looked up in the place where the procedure was <em>defined</em>. This rule is called <em>lexical scoping</em>.</p></div>
<p>So <code>disc</code> finds <code>pi</code> inside <code>ring-area</code>, and <code>sum-of-squares</code> earlier found <code>square</code> at the top level of the program. Scheme was among the first languages built on this rule, and nearly every language designed since, Python included, copied it.</p>
<h2>Reading the interpreter's complaints</h2>
<p>Two new messages come with procedures. Run each box, read the message, then fix it as the caption says.</p>`,
        { play: `(define (square x) (* x x))
(square 3 4)`, expectError: true, caption: 'square was defined with one parameter and called with two arguments, and the message says exactly that. The substitution rule needs one argument for each parameter, no more and no fewer. Delete the 4.' },
        `<p>The second message comes from a slip in the header of a definition.</p>`,
        { play: `(define square x (* x x))`, expectError: true, caption: 'Unbound variable: x. Without the parentheses around square x, this is Lesson 1\u2019s define, which names a value, and it tries to evaluate x to find that value. Put parentheses around square x.' },
        `<h2>Before the exercises</h2>
<p>Both exercises ask you to define procedures. A reliable method has three steps. First write the <em>header</em>, the name and parameters, from the way the procedure will be called. Then write the body as the formula in prefix notation, using the parameters, never particular numbers. Then check one call by substitution, by hand, before you press Run. Here is a worked example: the average of two numbers, then the average of their squares.</p>`,
        { play: `(define (square x) (* x x))

(define (average a b)
  (/ (+ a b) 2))

(define (mean-square a b)
  (average (square a) (square b)))

(average 3 4)
(mean-square 3 5)`, caption: 'Check (mean-square 3 5) by hand before running: (average (square 3) (square 5)), then (average 9 25), then (/ (+ 9 25) 2), then 17.' },
        `<p><code>mean-square</code> treats <code>average</code> and <code>square</code> as black boxes: its body says what it computes in terms of them. The first exercise has exactly this shape, one small procedure and then a second one built from it. The second exercise asks for two procedures that undo each other, and one of its tests checks that: converting a temperature there and back must return the number you started with.</p>`,
        `<details class="reveal"><summary>Puzzle: with <code>(define (square x) (* x x))</code>, what is <code>(square (square (square 2)))</code>? How many multiplications does it take?</summary><p><code>256</code>, in three multiplications. By the substitution model, the innermost call is worked out first: <code>(square 2)</code> is 4, then <code>(square 4)</code> is 16, then <code>(square 16)</code> is 256. That is 2<sup>8</sup>. Multiplying 2 by itself eight times would take seven multiplications; squaring repeatedly doubles the exponent each time, an idea that becomes very important in the mathematics course.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Leaving out the parentheses around the name and parameters: <code>(define square x (* x x))</code> is not a procedure. Calling a procedure with the wrong number of arguments. Typing <code>square 3</code> without parentheses: that is two separate expressions, the procedure and the number, and nothing is applied. Writing a particular number in a body where the parameter belongs, so the procedure gives the same answer whatever it is given. Expecting <code>(square y)</code> to change <code>y</code>: it computes a new value and leaves <code>y</code> alone. Using an internal name such as <code>dx</code> outside the procedure that defines it.</p>` },
        {
          ex: {
            id: 'ls-2-1', title: 'Sum of cubes',
            prompt: `<p>Define <code>(cube x)</code>, using <code>square</code> in its body (a cube is <i>x</i> times <i>x</i>²). Then define <code>(sum-of-cubes a b)</code> in terms of <code>cube</code>, so that <code>(sum-of-cubes 1 2)</code> is 9. <code>square</code> is already built into this interpreter, as it is into MIT Scheme, so you may use it without defining it.</p>`,
            starter: `(define (cube x) ...)\n\n(define (sum-of-cubes a b) ...)\n\n(sum-of-cubes 1 2)`,
            solution: `(define (cube x)\n  (* x (square x)))\n\n(define (sum-of-cubes a b)\n  (+ (cube a) (cube b)))\n\n(sum-of-cubes 1 2)`,
            hints: ['A cube is x multiplied by x squared: (* x (square x)).', 'sum-of-cubes has the same shape as sum-of-squares: (+ (cube a) (cube b)).'],
            tests: [{ call: '(cube 3)', expect: '27' }, { call: '(cube -2)', expect: '-8' }, { call: '(sum-of-cubes 1 2)', expect: '9' }, { call: '(sum-of-cubes 2 3)', expect: '35' }, { call: '(sum-of-cubes -1 4)', expect: '63' }],
            mustContain: [{ re: /\(square\s+x\)/, msg: 'Write cube using square: (square x).' }, { re: /\(cube\s+[ab]\)/, msg: 'sum-of-cubes should be written using cube.' }],
            followup: 'Check (sum-of-cubes 2 3) by substitution: (+ (cube 2) (cube 3)), then (+ (* 2 (square 2)) (* 3 (square 3))), then (+ 8 27), then 35.'
          }
        },
        {
          ex: {
            id: 'ls-2-2', title: 'Fahrenheit and back',
            prompt: `<p>Define <code>(f-to-c f)</code>, which converts a Fahrenheit temperature to Celsius: subtract 32, multiply by 5, divide by 9. Then define <code>(c-to-f c)</code>, which undoes it: multiply by 9, divide by 5, add 32. For example <code>(f-to-c 212)</code> is 100 and <code>(c-to-f 100)</code> is 212.</p>`,
            starter: `(define (f-to-c f) ...)\n\n(define (c-to-f c) ...)\n\n(f-to-c 212)\n(c-to-f 100)`,
            solution: `(define (f-to-c f)\n  (/ (* (- f 32) 5) 9))\n\n(define (c-to-f c)\n  (+ (/ (* c 9) 5) 32))\n\n(f-to-c 212)\n(c-to-f 100)`,
            hints: ['Work from the inside out, as in Lesson 1: the first step, subtracting 32, is the innermost combination: (- f 32).', 'f-to-c is (/ (* (- f 32) 5) 9). For c-to-f the last step is adding 32, so the outermost combination is (+ … 32).'],
            tests: [{ call: '(f-to-c 212)', expect: '100' }, { call: '(f-to-c 32)', expect: '0' }, { call: '(f-to-c 50)', expect: '10' }, { call: '(c-to-f 100)', expect: '212' }, { call: '(c-to-f 25)', expect: '77' }, { call: '(c-to-f -40)', expect: '-40' }, { call: '(c-to-f (f-to-c 68))', expect: '68' }],
            failTip: 'The last test converts 68 °F to Celsius and back, and expects 68. If the others pass and that one fails, one of your two procedures does not exactly undo the other.',
            followup: 'Try (f-to-c -40): -40 is the one temperature that reads the same on both scales.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li><code>(define (name parameters) body)</code> names a computation; nothing in the body is evaluated until the procedure is applied. Parameters are names in the recipe; arguments are the values in one use.</li>
<li>The substitution rule: to apply a defined procedure, replace each parameter in its body by the argument, then evaluate. With Lesson 1's evaluation rule, this lets you work out any expression by hand. That answers today's question: the interpreter substitutes the arguments into the body, and because a parameter is replaced before anything runs, it can never clash with a name outside.</li>
<li>A parameter belongs to its procedure: it cannot clash with a name outside, and applying a procedure never changes its arguments.</li>
<li>Scheme uses applicative order (operands first); normal order (substitute first, compute last) gives the same answers here, with repeated work.</li>
<li>A body may start with internal definitions, invisible outside it. Names a body uses but does not define are found where the procedure was defined: lexical scoping.</li>
<li>Procedures are black boxes: built-in or yours, they are used the same way.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3A-AP-15'],
      standard: 1, title: 'Making decisions', summary: 'Definitions by cases: predicates, cond and if, how they are evaluated, and why they cannot be ordinary procedures.',
      blocks: [
        `<p>Here is a small piece of history hiding in every language you will use. The conditional expression, an expression whose value depends on a test, the ancestor of Python's <code>if</code>/<code>else</code>, was invented by John McCarthy for Lisp in the late 1950s, and he proposed it for the language ALGOL, through which it spread everywhere. In Lisp it is still at its purest.</p>
<p>Every procedure so far has computed one formula, whatever it was given. Mathematics often defines a function <em>by cases</em> instead. The absolute value is the standard example:</p>
<p style="text-align:center">|<i>x</i>| = <i>x</i> if <i>x</i> &gt; 0, &nbsp;&nbsp; 0 if <i>x</i> = 0, &nbsp;&nbsp; −<i>x</i> if <i>x</i> &lt; 0.</p>
<p>This lesson gives Scheme's way of writing a definition by cases, states exactly how the interpreter evaluates it, and then keeps a promise from Lesson 2: it shows why the forms that make decisions cannot be ordinary procedures.</p>
<p>So here is the question. How do you write a definition by cases in Scheme, and why can a decision not be an ordinary procedure?</p>
<h2>Questions with yes-or-no answers</h2>
<div class="stmt"><p><span class="kind">Rule (truth values).</span> Scheme has two truth values, written <code>#t</code> (true) and <code>#f</code> (false). A procedure that returns a truth value is called a <em>predicate</em>, and by convention its name ends in <code>?</code>.</p>
<p><span class="kind">Rule (what counts as true).</span> Wherever Scheme needs to decide, the value <code>#f</code> counts as false, and <em>every other value</em> counts as true, including <code>0</code>.</p></div>
<p>The second rule differs from Python and C++, where 0 counts as false. It rarely matters, because the tests you write will almost always be predicates that return <code>#t</code> or <code>#f</code>. Here are the built-in ones this course uses. The comparisons <code>=</code>, <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code> and <code>&gt;=</code> work on numbers and, like <code>+</code>, accept any number of operands: <code>(&lt; 1 x 10)</code> asks whether 1 &lt; <i>x</i> &lt; 10. Predict the eight replies.</p>`,
        { play: `(= 3 3)
(< 5 2)
(< 1 4 10)
(>= 7 7)
(zero? 0)
(positive? -4)
(even? 10)
(odd? 10)`, predict: true, caption: 'The replies are #t, #f, #t, #t, #t, #f, #t, #f. (< 1 4 10) is true because 1 < 4 and 4 < 10; (positive? -4) is false because -4 is below zero; 10 is even, not odd. Change (< 1 4 10) to (< 1 40 10): it becomes false, because 40 < 10 fails.' },
        `<p>A comparison is an ordinary combination, evaluated by Lesson 1's rule: <code>&lt;</code> is a procedure, and <code>#t</code> or <code>#f</code> is the value it returns. The new part of this lesson is what you can do with such a value.</p>
<h2>Definition by cases: cond</h2>
<div class="stmt"><p><span class="kind">Rule (cond).</span> A <em>conditional expression</em> has the form</p>
<p style="text-align:center"><code>(cond (<i>p</i><sub>1</sub> <i>e</i><sub>1</sub>) (<i>p</i><sub>2</sub> <i>e</i><sub>2</sub>) … (<i>p</i><sub><i>n</i></sub> <i>e</i><sub><i>n</i></sub>))</code></p>
<p>Each parenthesised pair is a <em>clause</em>: a test <i>p</i> followed by an expression <i>e</i>. To evaluate the <code>cond</code>, evaluate <i>p</i><sub>1</sub>. If it is true, the value of the whole <code>cond</code> is the value of <i>e</i><sub>1</sub>, and nothing else in the <code>cond</code> is evaluated. If it is false, move on to the next clause and do the same. If no test is true, the value of the <code>cond</code> is unspecified.</p></div>
<p>Read that way, the definition of absolute value translates clause for clause. Notice the two layers of parentheses in each clause: one around the clause, one around its test. Predict the three replies.</p>`,
        { play: `(define (abs x)
  (cond ((> x 0) x)
        ((= x 0) 0)
        ((< x 0) (- x))))

(abs -7)
(abs 0)
(abs 3.5)`, predict: true, caption: 'The replies are abs, then 7, 0 and 3.5. There is one clause for each case of the mathematical definition, and (- x) is negation, as in Lesson 1. For -7 the first two tests are false and the third is true, so the answer is (- -7). Add a call with a negative decimal and predict it.' },
        { check: "In a <code>cond</code>, what happens after the first true test?", options: ["The remaining clauses are also checked", "Its expression is the value of the whole cond; nothing else is evaluated", "The else clause also runs"], answer: 1, why: "Clauses are tried from the top, and the first true one decides. Clause order is part of the meaning.", wrong: ["That would make a cond a list of independent questions. A cond stops at the first true test, and that is why the order of the clauses is part of its meaning.", null, "else is only a test that is always true, so its clause is reached when every earlier test was false. Once a clause is chosen, nothing after it is evaluated."] },
        `<p>The substitution model of Lesson 2 extends to <code>cond</code> with one more kind of step: evaluate the first test that is left, and either drop its clause (if the test is false) or replace the whole <code>cond</code> by that clause's expression (if the test is true). Step through <code>(abs -3)</code>, and afterwards press <b>Show the substitution</b> under the <code>abs</code> example above to see the same steps for all three calls.</p>`,
        { fig: 'subst', steps: [
          { text: '(abs -3)', note: 'abs is a defined procedure: replace the call by its body, with -3 in place of x.' },
          { text: '(cond ((> -3 0) -3) ((= -3 0) 0) ((< -3 0) (- -3)))', note: 'Evaluate the first test, (> -3 0). It is #f.' },
          { text: '(cond ((= -3 0) 0) ((< -3 0) (- -3)))', note: 'A false test removes its clause. The next test, (= -3 0), is #f too.' },
          { text: '(cond ((< -3 0) (- -3)))', note: '(< -3 0) is #t, so the whole cond is replaced by this clause\u2019s expression.' },
          { text: '(- -3)', note: 'The expression of the first true clause. Nothing after it would have been looked at.' },
          { text: '3', note: 'The value of (abs -3).' }
        ], caption: 'A cond is evaluated one test at a time, from the top, and stops at the first true one.' },
        `<details class="reveal"><summary>Predict: if the first clause of <code>abs</code> were <code>((&gt;= x 0) x)</code>, what would change?</summary><p>Nothing in the answers. <code>(abs 0)</code> would now be decided by the first clause, giving 0, and the second clause would never be reached for any argument. Clauses may overlap; the first true one wins. That is why the <em>order</em> of clauses is part of their meaning.</p></details>
<h2>else, and words as answers</h2>
<p>A final clause whose test is the word <code>else</code> catches everything the earlier clauses did not: <code>else</code> counts as a test that is always true. It is only allowed in the last clause.</p>
<p>Sometimes the natural answer to a question is a word rather than a number. A quote mark in front of a name, as in <code>'negative</code>, gives the name itself as a value, called a <em>symbol</em>, instead of looking the name up in the environment. Lesson 10 is about symbols; here they are simply labels. Predict the three replies.</p>`,
        { play: `(define (sign x)
  (cond ((< x 0) 'negative)
        ((= x 0) 'zero)
        (else 'positive)))

(sign -2)
(sign 0)
(sign 99)`, predict: true, caption: 'The replies are sign, then the symbols negative, zero and positive. The else clause catches 99 because the two tests above it are false. The quote marks matter: without them the interpreter would look up a variable called negative and report it unbound. Take the quote off one of them and see.' },
        `<h2>Why cond is a special form</h2>
<p>Lesson 2 said that Scheme evaluates every operand of a combination <em>before</em> applying the procedure, and that the forms which make decisions must break that rule. Here is the evidence. Suppose we tried to build a decision out of an ordinary procedure:</p>`,
        { play: `(define (choose test a b)
  (cond (test a)
        (else b)))

(choose #t 1 2)
(choose #t 1 undefined-name)`, expectError: true, caption: 'The first call gives 1. The second fails with Unbound variable: undefined-name, although choose would have returned 1 and never used b. choose is a procedure, so all three operands were evaluated before it started.' },
        { check: "Why must <code>if</code> be a special form rather than a procedure?", options: ["For speed", "A procedure evaluates every operand first; if must evaluate only the branch it chooses", "Because it has three operands"], answer: 1, why: "If if were a procedure, both branches would be evaluated, and a branch that errors or recurses forever would run.", wrong: ["Speed is not the reason. The reason is meaning: a procedure evaluates all its operands first, and a decision must evaluate only the branch it chooses.", null, "Procedures can have any number of operands, as + shows. What matters is that if must leave some operands unevaluated, and an ordinary combination evaluates every one."] },
        `<p>A special form is evaluated by its own rule, and the rule for <code>cond</code> evaluates only what it needs: tests in order until one is true, and then just one expression. In this example the cost of evaluating too much was an error message. In Lesson 4 the unneeded expression will be a recursive call, and evaluating it would never stop. That is why every language, Scheme included, builds its decisions into the language itself.</p>
<h2>if</h2>
<p>For a choice between exactly two cases there is a shorter form.</p>
<div class="stmt"><p><span class="kind">Rule (if).</span> <code>(if <i>test</i> <i>consequent</i> <i>alternative</i>)</code> evaluates the test. If it is true, the value of the <code>if</code> is the value of the consequent; otherwise it is the value of the alternative. Only one of the two is evaluated. <code>if</code> is a special form.</p></div>
<p><code>if</code> is an expression with a value, not a statement that does something, so it can appear anywhere a value can: as an operand, or as the body of a procedure. Always give both parts. Scheme allows <code>(if <i>test</i> <i>consequent</i>)</code>, but when the test is false its value is unspecified, which is almost never what you meant.</p>`,
        { play: `(define (abs x)
  (if (< x 0)
      (- x)
      x))
(abs -3)

(define (bigger a b)
  (if (> a b) a b))
(bigger 4 9)

(* 2 (if (> 5 1) 10 20))`, predict: true, caption: 'abs with if gives 3 for -3, and (bigger 4 9) gives 9: a two-way choice needs no clauses. The last line is an if used as an operand. Its test is true, so it is replaced by 10, and the product is 20. Change (> 5 1) to (< 5 1) and predict the new value.' },
        `<details class="reveal"><summary>Predict: what are <code>(if (&gt; 2 3) 'yes 'no)</code> and <code>(+ 1 (if (= 1 1) 10 20))</code>?</summary><p><code>no</code>, because the test is false and so the alternative is the value. And <code>11</code>: the <code>if</code> is replaced by its value, 10, before the addition.</p></details>
<h2>and, or, not</h2>
<div class="stmt"><p><span class="kind">Rule (and, or).</span> <code>(and <i>e</i><sub>1</sub> … <i>e</i><sub><i>n</i></sub>)</code> evaluates the expressions from left to right. As soon as one is false, the value is <code>#f</code> and the rest are skipped; if none is false, the value is the value of the last. <code>(or <i>e</i><sub>1</sub> … <i>e</i><sub><i>n</i></sub>)</code> evaluates from left to right; as soon as one is true, that is the value and the rest are skipped; if none is true, the value is <code>#f</code>. Both are special forms.</p>
<p><span class="kind">Rule (not).</span> <code>(not <i>x</i>)</code> is <code>#t</code> when <i>x</i> is <code>#f</code>, and <code>#f</code> otherwise. It is an ordinary procedure: it needs its one operand in every case.</p></div>
<p>Small predicates combine into larger ones exactly the way small procedures did in Lesson 2. In the box below, predict the last line before you run it: what will happen to the division?</p>`,
        { play: `(define (between? x lo hi)
  (and (>= x lo) (<= x hi)))

(define (teenager? age)
  (between? age 13 19))

(teenager? 15)
(teenager? 30)
(or (= 1 2) (> 3 2))
(not (= 1 1))

(define d 0)
(and (not (= d 0)) (> (/ 10 d) 2))`, predict: true, caption: 'teenager? is built from between?, which is built from >= and <=, so 15 gives #t and 30 gives #f; then (or ...) gives #t and (not (= 1 1)) gives #f. The last line would divide by zero, but and stops at the false test on its left, so the reply is #f and not an error. Swap the two operands of that and, and see the difference.' },
        { check: "What is <code>(and (> 1 2) (/ 1 0))</code>?", options: ["An error: division by zero", "#f: and stops at the first false and never divides", "#t"], answer: 1, why: "and evaluates left to right and stops as soon as one expression is false.", wrong: ["This assumes every operand is evaluated first, as for a procedure. and is a special form: it stops at the first false value, so (/ 1 0) is never evaluated.", null, "and gives #t only when nothing was false. Here (> 1 2) is false, so the whole expression is #f."] },
        `<p>Two habits of style follow from these rules. Put the test that makes the rest safe first inside an <code>and</code>, as in the last line. And never write <code>(if (&gt; x 0) #t #f)</code>: <code>(&gt; x 0)</code> already <em>is</em> <code>#t</code> or <code>#f</code>, so the <code>if</code> adds nothing.</p>
<h2>A mistake the interpreter does not catch</h2>
<p>Most mistakes in this lesson produce an error message. One common one does not. Each <code>cond</code> clause needs its own parentheses around the test <em>and</em> around the whole clause; leave out a layer and the result can still be legal Scheme, with a different meaning. What do you think the box below prints?</p>`,
        { play: `(define x -5)
(cond (> x 0) x)`, predict: true, caption: 'The reply is 0, and no error. The interpreter read (> x 0) as a whole clause: the test is the name >, followed by the expressions x and 0. The value of > is a procedure, which is not #f, so the test counts as true, and the clause\u2019s last expression, 0, becomes the value. The correct form is (cond ((> x 0) x)).' },
        `<p>When a <code>cond</code> gives an answer that makes no sense, count its parentheses clause by clause before looking anywhere else. The editor highlights the matching parenthesis when the cursor is beside one.</p>
<h2>Before the exercises</h2>
<p>Both exercises use <code>divisible?</code>, built from <code>remainder</code>, which you met in Lesson 1: a number is divisible by <i>d</i> when the remainder is 0. The first exercise needs one boolean expression built with <code>and</code>, <code>or</code> and <code>not</code>; the second needs a <code>cond</code> with its clauses in the right order. Here is a worked example of each.</p>
<p>A predicate: "divisible by 3 but not by 9". In words it is an <em>and</em> of two conditions, the second negated, so it is <code>(and (divisible? n 3) (not (divisible? n 9)))</code>. A <code>cond</code>: a ticket costs 0 under age 5, 5 under age 13, 6 at 65 or over, and 10 otherwise. The clauses overlap (every age under 5 is also under 13), so their order decides the answer: the youngest group goes first, and then each later clause needs only one comparison.</p>`,
        { play: `(define (divisible? n d)
  (= (remainder n d) 0))

(define (three-not-nine? n)
  (and (divisible? n 3)
       (not (divisible? n 9))))

(define (ticket-price age)
  (cond ((< age 5) 0)
        ((< age 13) 5)
        ((>= age 65) 6)
        (else 10)))

(three-not-nine? 12)
(three-not-nine? 18)
(ticket-price 3)
(ticket-price 12)
(ticket-price 40)
(ticket-price 70)`, caption: '12 is divisible by 3 and not by 9: #t. 18 is divisible by 9: #f. The prices are 0, 5, 10 and 6. Swap the first two clauses of ticket-price and predict (ticket-price 3) before running.' },
        `<details class="reveal"><summary>Puzzle: what does <code>(cond ((&gt; 3 2) 'first) ((&gt; 4 2) 'second) (else 'third))</code> return?</summary><p><code>first</code>. Both of the first two tests are true, but <code>cond</code> stops at the first true test and never even looks at the second. The clauses are tried in order, so their order is part of the meaning.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Missing a layer of parentheses in a <code>cond</code> clause: it is <code>((&gt; x 0) x)</code>, two layers, and one layer is legal but wrong. Clauses in the wrong order, so an earlier clause catches cases meant for a later one. <code>else</code> anywhere but the last clause. <code>(if <i>test</i> <i>consequent</i>)</code> with no alternative. Forgetting the quote on a symbol, so the interpreter looks for a variable. Using <code>=</code> on things that are not numbers; Lesson 10 introduces <code>eq?</code> and <code>equal?</code> for those. Writing <code>(if <i>test</i> #t #f)</code> when <i>test</i> alone would do.</p>` },
        {
          ex: {
            id: 'ls-3-1', title: 'Leap years',
            prompt: `<p>Define <code>(leap-year? y)</code>. A year is a leap year if it is divisible by 4, except that century years (divisible by 100) are not, unless they are also divisible by 400. So 2024 and 2000 are leap years; 2023 and 1900 are not. Build it from <code>divisible?</code> (included in the starter), <code>and</code>, <code>or</code> and <code>not</code>. No <code>cond</code> is needed: it is one boolean expression.</p>`,
            starter: `(define (divisible? n d)\n  (= (remainder n d) 0))\n\n(define (leap-year? y)\n  ...)\n\n(leap-year? 2024)\n(leap-year? 1900)`,
            solution: `(define (divisible? n d)\n  (= (remainder n d) 0))\n\n(define (leap-year? y)\n  (or (divisible? y 400)\n      (and (divisible? y 4)\n           (not (divisible? y 100)))))\n\n(leap-year? 2024)\n(leap-year? 1900)`,
            hints: ['In words: divisible by 400, or (divisible by 4 and not divisible by 100).', 'Translate each part: (divisible? y 400), then (and (divisible? y 4) (not (divisible? y 100))), then join the two with or.'],
            tests: [{ call: '(leap-year? 2024)', expect: '#t' }, { call: '(leap-year? 1900)', expect: '#f' }, { call: '(leap-year? 2000)', expect: '#t' }, { call: '(leap-year? 2023)', expect: '#f' }, { call: '(leap-year? 1996)', expect: '#t' }, { call: '(leap-year? 2100)', expect: '#f' }, { call: '(leap-year? 2400)', expect: '#t' }],
            mustContain: [{ re: /\(divisible\?/, msg: 'Build it from the divisible? predicate.' }],
            failTip: 'Check 1900 and 2000 against your expression by hand: both are divisible by 4 and by 100, and only 2000 is divisible by 400.',
            followup: 'The answer is already #t or #f, so there is no if around it. The expression is the predicate.'
          }
        },
        {
          ex: {
            id: 'ls-3-2', title: 'Grade letters',
            prompt: `<p>Define <code>(grade score)</code>, which returns the symbol <code>'A</code> for 90 and above, <code>'B</code> for 80–89, <code>'C</code> for 70–79, <code>'D</code> for 60–69, and <code>'F</code> below 60. Use one <code>cond</code>, and think about the order of the clauses.</p>`,
            starter: `(define (grade score)\n  (cond ...))\n\n(grade 95)\n(grade 72)`,
            solution: `(define (grade score)\n  (cond ((>= score 90) 'A)\n        ((>= score 80) 'B)\n        ((>= score 70) 'C)\n        ((>= score 60) 'D)\n        (else 'F)))\n\n(grade 95)\n(grade 72)`,
            hints: ['Test the highest boundary first: ((>= score 90) \'A).', 'Because earlier clauses catch higher scores, each later clause needs only a lower bound, just as ticket-price did. End with (else \'F).'],
            tests: [{ call: '(grade 95)', expect: 'A' }, { call: '(grade 100)', expect: 'A' }, { call: '(grade 90)', expect: 'A' }, { call: '(grade 89)', expect: 'B' }, { call: '(grade 72)', expect: 'C' }, { call: '(grade 65)', expect: 'D' }, { call: '(grade 60)', expect: 'D' }, { call: '(grade 59)', expect: 'F' }, { call: '(grade 12)', expect: 'F' }],
            mustContain: [{ re: /\(cond\b/, msg: 'Use cond for this one.' }],
            failTip: 'Check the boundary scores 90, 60 and 59: >= includes the boundary, > does not.',
            followup: 'Move the clause for 60 and above to the top of the cond and evaluate (grade 95). It answers D, because an earlier clause caught a case meant for a later one. Then put the clause back.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>Predicates return <code>#t</code> or <code>#f</code> and end in <code>?</code>. In a test, only <code>#f</code> counts as false.</li>
<li>Today's question: a definition by cases is written with <code>cond</code> or <code>if</code>, and a decision cannot be an ordinary procedure, because a procedure evaluates every operand and a decision must evaluate only the one it chooses.</li>
<li><code>(cond (<i>p</i> <i>e</i>) … (else <i>e</i>))</code> evaluates tests from the top and gives the expression of the first true one; nothing else is evaluated. Clause order is part of the meaning.</li>
<li>In the substitution model, a false test drops its clause, and a true test replaces the whole <code>cond</code> by its expression.</li>
<li><code>cond</code>, <code>if</code>, <code>and</code> and <code>or</code> are special forms, because a procedure would evaluate every operand first; <code>not</code> is an ordinary procedure.</li>
<li><code>(if <i>test</i> <i>consequent</i> <i>alternative</i>)</code> is an expression with a value; always give both parts.</li>
<li>A quote gives a symbol: <code>'negative</code> is the word itself.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-13'],
      standard: 1, title: 'Recursion', summary: 'Procedures defined in terms of themselves: why that is allowed, how the substitution model traces them, what makes them stop, and why they are right.',
      blocks: [
        `<p>An old cocoa tin from the Dutch company Droste showed a nurse carrying a tray, on which stood a tin of Droste cocoa, showing a nurse carrying a tray, on which stood a tin, and so on for ever; pictures that contain themselves are still called the Droste effect. Programmers have their own version. The name GNU, a free operating system project, stands for "GNU's Not Unix", an abbreviation that contains itself. And there is an old joke: "To understand recursion, you must first understand recursion." This lesson shows why a definition that refers to itself is not a joke at all, as long as it reaches the bottom. So what makes a recursion reach the bottom, and how can you be sure that it computes the right answer?</p>`,
        { photo: ['droste-cocoa', 'sierpinski-triangle'], caption: "An old Droste cocoa tin from a collector's shelf. The nurse holds a tray with a tin on it, and that tin shows the nurse again, holding a tray with a tin on it. Beside it, a Sierpinski triangle, a picture defined the same way: three half-size copies of itself, each made of three half-size copies, down to the smallest triangle the picture can show." },
        `<p>A procedure may use itself in its own body. In Lisp this is not a trick or an advanced topic: it is the ordinary way to repeat anything, and Scheme has no loop statement at all. If you did the Python course you met repetition as loops. Here it arrives as definitions, the way mathematics has always written it.</p>
<p>The factorial of a whole number <i>n</i>, written <i>n</i>!, is the product 1 × 2 × … × <i>n</i>, with 0! = 1. Notice that the product up to <i>n</i> is <i>n</i> times the product up to <i>n</i> − 1. So factorial can be defined by two equations:</p>
<p style="text-align:center">0! = 1, &nbsp;&nbsp;&nbsp; <i>n</i>! = <i>n</i> × (<i>n</i> − 1)! &nbsp;for <i>n</i> ≥ 1.</p>
<p>A definition like this, where the thing being defined appears on the right-hand side applied to something smaller, is called a <em>recursive definition</em>. Here it is in Scheme, clause for clause. Predict <code>(factorial 5)</code> before you run it.</p>`,
        { play: `(define (factorial n)
  (if (= n 0)
      1
      (* n (factorial (- n 1)))))

(factorial 0)
(factorial 5)
(factorial 20)`, predict: true, caption: 'The replies are factorial, then 1, 120 and 2432902008176640000. The two equations became the two branches of an if. (factorial 5) is 5 times (factorial 4), and so on down to (factorial 0), which is 1 with no further call. Try (factorial 10) and predict it first.' },
        { check: "Why can factorial's body refer to factorial?", options: ["Because Scheme allows circular definitions", "Because the body is only evaluated when applied, and by then the name is defined", "It cannot; it needs a special keyword"], answer: 1, why: "A definition records the body. By the time (factorial 5) is applied, factorial is in the environment, so the lookup succeeds.", wrong: ["Nothing circular is happening. A definition only records the body without evaluating it, so by the time the body runs, the name is already in the environment.", null, "Scheme needs no special word. The ordinary define works, because the body is evaluated only when the procedure is applied, and the name is defined by then."] },
        `<h2>Why this is allowed</h2>
<p>The body of <code>factorial</code> uses the name <code>factorial</code>, which might look circular. It is not, and the rules from earlier lessons already explain why. Nothing new is needed in the language.</p>
<div class="stmt"><p><span class="kind">Why a procedure can call itself.</span> By Lesson 2's rule, a definition only records the body; nothing in it is evaluated until the procedure is applied. By the time <code>(factorial 5)</code> is applied, the name <code>factorial</code> is already in the environment, so when the body refers to it, the lookup succeeds. The body is not a circle; it is a recipe that sometimes asks for the same recipe on a smaller input.</p></div>
<p>Lesson 3 also pays off here. <code>if</code> evaluates only the branch it chooses. If it evaluated both branches first, as an ordinary procedure would, then <code>(factorial 0)</code> would evaluate <code>(factorial -1)</code>, which would evaluate <code>(factorial -2)</code>, and so on for ever. Recursion only works because decisions are special forms.</p>
<h2>Tracing it</h2>
<p>The substitution model of Lessons 2 and 3 traces a recursive procedure with no new rules. Each step below combines two moves you know: replace a call by the procedure's body, then evaluate the <code>if</code>'s test and keep only the chosen branch. Watch the shape of the expression.</p>`,
        { fig: 'subst', steps: [
          { text: '(factorial 4)', note: 'Replace the call by the body with 4 for n: (if (= 4 0) 1 (* 4 (factorial (- 4 1)))). The test is #f, so keep the alternative.' },
          { text: '(* 4 (factorial 3))', note: 'The multiplication cannot happen yet: its second operand, (factorial 3), must be evaluated first.' },
          { text: '(* 4 (* 3 (factorial 2)))', note: 'The same two moves on (factorial 3). Now two multiplications are waiting.' },
          { text: '(* 4 (* 3 (* 2 (factorial 1))))', note: 'Three waiting.' },
          { text: '(* 4 (* 3 (* 2 (* 1 (factorial 0)))))', note: 'Four waiting.' },
          { text: '(* 4 (* 3 (* 2 (* 1 1))))', note: 'n is 0: the test (= 0 0) is #t, so the if gives 1 with no further call. This is the base case.' },
          { text: '(* 4 (* 3 (* 2 1)))', note: 'Now the waiting multiplications happen, innermost first.' },
          { text: '(* 4 (* 3 2))', note: '' },
          { text: '(* 4 6)', note: '' },
          { text: '24', note: 'The value of (factorial 4).' }
        ], caption: 'The expression grows while calls wait for answers, then shrinks as the answers come back. Lesson 5 is about this shape.' },
        `<details class="reveal"><summary>Predict: with <code>(define (count-up n) (if (= n 0) 0 (+ 1 (count-up (- n 1)))))</code>, what is <code>(count-up 5)</code>, and how many additions wait at the deepest point?</summary><p><code>5</code>, and five additions wait: <code>(+ 1 (+ 1 (+ 1 (+ 1 (+ 1 0)))))</code>. Each level adds 1, and the base case supplies the final 0. It is a roundabout way to return <i>n</i>, but it shows the shape with nothing else in the way.</p></details>
<h2>What makes a recursion stop</h2>
<div class="stmt"><p><span class="kind">Rule (termination).</span> A recursive procedure finishes for an input when two things hold. First, there is a <em>base case</em>: an input that the procedure answers without calling itself. Second, every recursive call is on an input <em>closer</em> to a base case, in such a way that a base case is eventually reached.</p></div>
<p>The second condition is the one people get wrong. <code>(factorial (- n 1))</code> moves one step closer to 0 on every call, so starting from any whole number <i>n</i> ≥ 0 it reaches 0 after <i>n</i> calls. But "closer" must actually arrive. Starting from −1, each call moves <em>away</em> from 0, and the base case is never reached.</p>`,
        { play: `(define (factorial n)
  (if (= n 0)
      1
      (* n (factorial (- n 1)))))

(factorial -1)`, expectError: true, caption: ';Aborting!: maximum recursion depth exceeded. The calls go -1, -2, -3, … and each one waits for the next, until the interpreter runs out of room. A test of (< n 1) in place of (= n 0) would have stopped it, returning 1.' },
        { check: "<code>(factorial -1)</code> with the test <code>(= n 0)</code>. What happens?", options: ["Returns 1", "Maximum recursion depth exceeded: the calls go −2, −3, … and never reach 0", "Returns −1"], answer: 1, why: "The base case is stepped over. Every recursive call must move towards a base case that is actually reached.", wrong: ["It could return 1 only if the test (= n 0) were ever true. Counting down from −1 gives −2, −3 and so on, which move away from 0 and never meet it.", null, "−1 is the argument, not an answer. Because the base case is never reached, no call ever returns: each one waits for the next until the interpreter runs out of room."] },
        `<p>The message comes from the waiting work, not from the arithmetic: every pending multiplication takes space, and there is only so much. In the trace above, the width of the expression is that space.</p>
<h2>Why it is right</h2>
<p>Tracing shows that <code>(factorial 4)</code> is 24. What shows that <code>(factorial n)</code> is <i>n</i>! for <em>every</em> whole number <i>n</i>? Checking cases cannot, as the mathematics course insists. The argument that does is induction, and it has exactly the shape of the procedure.</p>
<div class="stmt"><p><span class="kind">Claim.</span> For every whole number <i>n</i> ≥ 0, <code>(factorial n)</code> returns <i>n</i>!.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> By induction on <i>n</i>. <b>Base case.</b> For <i>n</i> = 0 the test <code>(= n 0)</code> is true, so the procedure returns 1, which is 0!. <b>Inductive step.</b> Let <i>n</i> ≥ 1, and assume <code>(factorial (- n 1))</code> returns (<i>n</i> − 1)!. For <i>n</i> ≥ 1 the test is false, so the procedure returns <i>n</i> times the value of <code>(factorial (- n 1))</code>, which by the assumption is <i>n</i> × (<i>n</i> − 1)! = <i>n</i>!. By induction the claim holds for every <i>n</i> ≥ 0. <span class="qed">∎</span></p></div>
<p>This is the precise meaning of the advice every programmer gives about recursion: <em>trust the recursive call</em>. You do not need to picture every level. Check the base case, and check that the procedure is right <em>assuming</em> the smaller call is right; induction does the rest.</p>
<h2>Writing a recursive procedure</h2>
<p>That proof also tells you how to write one. Three questions, in this order:</p>
<p>1. What is the smallest input, and what is its answer? That is the base case.</p>
<p>2. If I <em>already had</em> the answer for a slightly smaller input, how would I get the answer for this one? That is the recursive case.</p>
<p>3. Does the smaller input really move towards the base case, for every input the procedure will be given?</p>
<p>Here are the questions applied to the digits of a number. A number below 10 has one digit; otherwise, <code>(quotient n 10)</code> drops the last digit and <code>(remainder n 10)</code> is that digit, both from Lesson 1. Predict the three answers in the box below.</p>`,
        { play: `(define (count-digits n)
  (if (< n 10)
      1
      (+ 1 (count-digits (quotient n 10)))))

(count-digits 7)
(count-digits 12345)

(define (sum-digits n)
  (if (< n 10)
      n
      (+ (remainder n 10)
         (sum-digits (quotient n 10)))))

(sum-digits 12345)`, predict: true, caption: 'The answers are 1, 5 and 15. Both procedures have the same skeleton, with a different base answer and a different combining step: count-digits adds 1 for each digit, and sum-digits adds the last digit to the sum of the rest. Trace (sum-digits 45) by hand: (+ 5 (sum-digits 4)), then (+ 5 4), then 9.' },
        { check: "What does induction check to prove a recursive procedure right?", options: ["Many example inputs", "The base case, and that each case is right assuming the smaller call is", "That it halts"], answer: 1, why: "Those two checks cover every input, like falling dominoes. That is what \"trust the recursive call\" means.", wrong: ["Trying examples shows only that the procedure works for those inputs. Induction covers every input with two checks, the base case and the step, like a row of dominoes.", null, "That a procedure halts is the separate termination argument: a base case, and calls that move towards it. Induction shows that the answer it returns is the right one."] },
        `<p>For question 3: the base case is every <i>n</i> below 10, and <code>(quotient n 10)</code> is smaller than <i>n</i> whenever <i>n</i> ≥ 10, so a whole number ≥ 0 always reaches the base case. The base case here is a whole range of inputs rather than one value, which is often safer: <code>(&lt; n 10)</code> cannot be stepped over the way <code>(= n 0)</code> was by −1.</p>
<h2>Before the exercises</h2>
<p>Both exercises are recursive definitions of the same shape as <code>factorial</code>: a base case at 0, and a recursive case that combines <i>n</i> (or something built from it) with the answer for <i>n</i> − 1. Here is one more worked example, the sum of the squares 1² + 2² + … + <i>n</i>². Question 1: the sum of no squares, for <i>n</i> = 0, is 0. Question 2: the sum up to <i>n</i> is <i>n</i>² plus the sum up to <i>n</i> − 1. Question 3: <i>n</i> − 1 moves towards 0.</p>`,
        { play: `(define (sum-of-squares-to n)
  (if (= n 0)
      0
      (+ (square n) (sum-of-squares-to (- n 1)))))

(sum-of-squares-to 0)
(sum-of-squares-to 3)
(sum-of-squares-to 10)`, caption: '0, then 1 + 4 + 9 = 14, then 385. Compare it with factorial line by line: only the base answer and the combining operation changed.' },
        `<details class="reveal"><summary>Puzzle: <code>(define (mystery n) (if (= n 0) 0 (+ 2 (mystery (- n 1)))))</code>. What are <code>(mystery 5)</code> and <code>(mystery 100)</code>, and what does <code>mystery</code> compute?</summary><p>10 and 200: it doubles its argument. Each level adds 2 and hands a smaller problem down, and the base case adds nothing. So <code>(mystery n)</code> is 2 + 2 + … + 2, <i>n</i> times. By induction, as in this lesson's proof: <code>(mystery 0)</code> is 0 = 2 × 0, and if <code>(mystery (- n 1))</code> is 2(<i>n</i> − 1), then <code>(mystery n)</code> is 2 + 2(<i>n</i> − 1) = 2<i>n</i>.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> No base case, or one the calls can step over: <code>(= n 0)</code> never catches an input that jumps from 1 to −1, or that starts negative. A recursive call on the same input instead of a smaller one. Forgetting to combine the recursive result with anything, so every level just passes back what the level below returned. The wrong base answer: an empty sum is 0 and an empty product is 1, and a wrong base answer spoils every result built on it. Trying to picture every level at once instead of trusting the recursive call.</p>` },
        {
          ex: {
            id: 'ls-4-1', title: 'Sum to n',
            prompt: `<p>Define <code>(sum-to n)</code>, the sum 1 + 2 + … + <em>n</em>, in the style of <code>factorial</code>: the sum to <em>n</em> is <em>n</em> plus the sum to <em>n</em> − 1, and the sum to 0 is 0.</p>`,
            starter: `(define (sum-to n)\n  ...)\n\n(sum-to 100)`,
            solution: `(define (sum-to n)\n  (if (= n 0)\n      0\n      (+ n (sum-to (- n 1)))))\n\n(sum-to 100)`,
            hints: ['Two cases: n is 0, or it is not. Use if, with the base case first.', 'The recursive case is (+ n (sum-to (- n 1))): n plus the answer for n − 1.'],
            tests: [{ call: '(sum-to 0)', expect: '0' }, { call: '(sum-to 1)', expect: '1' }, { call: '(sum-to 4)', expect: '10' }, { call: '(sum-to 100)', expect: '5050' }, { call: '(sum-to 500)', expect: '125250' }],
            mustContain: [{ re: /\(sum-to\s+\(-\s*n\s+1\)\)/, msg: 'The procedure should call itself on (- n 1).' }],
            followup: 'The same induction as for factorial proves (sum-to n) is 1 + 2 + … + n for every n ≥ 0. The mathematics course proves in its Lesson 3 that this sum is also n(n + 1)/2, which you could compute with no recursion at all.'
          }
        },
        {
          ex: {
            id: 'ls-4-2', title: 'Powers',
            prompt: `<p>Define <code>(power b n)</code>, which computes <em>b</em><sup><em>n</em></sup> for a whole number <em>n</em> ≥ 0, recursively and without <code>expt</code>: <em>b</em><sup>0</sup> is 1, and <em>b</em><sup><em>n</em></sup> is <em>b</em> × <em>b</em><sup><em>n</em>−1</sup>.</p>`,
            starter: `(define (power b n)\n  ...)\n\n(power 2 10)`,
            solution: `(define (power b n)\n  (if (= n 0)\n      1\n      (* b (power b (- n 1)))))\n\n(power 2 10)`,
            hints: ['Base case: n is 0, and the answer is 1 (an empty product).', 'Recursive case: (* b (power b (- n 1))). Only n gets smaller; b stays the same in every call.'],
            tests: [{ call: '(power 2 10)', expect: '1024' }, { call: '(power 5 0)', expect: '1' }, { call: '(power 3 4)', expect: '81' }, { call: '(power 1.5 2)', expect: '2.25' }, { call: '(power -2 3)', expect: '-8' }],
            mustNotContain: [{ re: /\(expt\b|\(exp\b/, msg: 'Write the recursion yourself rather than using expt.' }],
            mustContain: [{ re: /\(power\s+b\s+\(-\s*n\s+1\)\)/, msg: 'The procedure should call itself on (power b (- n 1)).' }],
            followup: 'This makes n multiplications. The mathematics course (Lesson 4) shows repeated squaring, which needs only about log₂ n: SICP does the same in Scheme in §1.2.4.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A recursive definition uses the thing being defined on a smaller input: 0! = 1 and <i>n</i>! = <i>n</i> × (<i>n</i> − 1)!.</li>
<li>A procedure can call itself because its body is evaluated only when it is applied, and <code>if</code> evaluates only the branch it chooses.</li>
<li>The substitution model traces recursion with no new rules; the expression grows while calls wait, then shrinks.</li>
<li>It stops when there is a base case and every call moves towards it; otherwise, "maximum recursion depth exceeded". That answers today's question about reaching the bottom.</li>
<li>Induction proves a recursive procedure correct: check the base case, and check each case assuming the smaller call is right. That is what "trust the recursive call" means, and it is how you can be sure the answer is right.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-11', '3B-AP-13'],
      standard: 1, title: 'The shape of a process', summary: 'Procedures and the processes they generate: recursive and iterative processes, tail calls, state variables with an invariant, and tree recursion.',
      blocks: [
        `<p>In 1202, Leonardo of Pisa, later known as Fibonacci, posed a puzzle about rabbits: start with one pair, suppose every pair produces a new pair each month from its second month of life, and ask how many pairs there are after a year. The answer grows through the sequence 1, 1, 2, 3, 5, 8, 13, …, which now bears his name. The numbers turn up far from rabbits too: the seeds in a sunflower head grow in two sets of spirals, one turning each way, and the numbers of spirals in the two sets are usually neighbours in the sequence, such as 34 and 55. This lesson computes those numbers two ways, and discovers that the obvious way is catastrophically slow for a reason you can see in the shape of the code. So why is the obvious way so slow, and what can the shape of a procedure tell you about the process it will start?</p>`,
        { photo: ['liber-abaci-rabbits', 'sunflower-spirals'], caption: "A page from a medieval manuscript of Fibonacci's Liber Abaci, at the rabbit problem. The box in the right margin counts the pairs month by month: 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377. Beside it, a sunflower head whose seeds are still ripening: follow them out from the centre and they curve in spirals, clockwise and anticlockwise." },
        `<p>Two procedures can compute exactly the same answers and still behave very differently when they run: one needs memory that grows with its input, the other a fixed handful of numbers; one finishes in a moment, the other not before the end of the universe. This lesson is about seeing that difference by looking at a procedure, before running it. It follows SICP §1.2, and its central idea is a distinction of vocabulary.</p>
<div class="stmt"><p><span class="kind">Definition.</span> A <em>procedure</em> is the text you write. A <em>process</em> is what happens when the procedure is applied: the sequence of steps the interpreter carries out, and the information it must keep while it does.</p></div>
<p>The substitution model of Lessons 2 to 4 is a picture of a process: each line of a trace is one moment, and the width of the line is how much the interpreter must remember at that moment.</p>
<h2>Two factorials</h2>
<p>Here is Lesson 4's <code>factorial</code> again, and a second definition. Instead of leaving multiplications waiting, the second one carries a running product along with it, together with a counter that says how far it has got. Predict the two replies, and think about whether the two traces will look alike.</p>`,
        { play: `(define (factorial n)
  (if (= n 0)
      1
      (* n (factorial (- n 1)))))

(define (factorial-2 n)
  (fact-iter 1 1 n))

(define (fact-iter product counter max-count)
  (if (> counter max-count)
      product
      (fact-iter (* counter product)
                 (+ counter 1)
                 max-count)))

(factorial 6)
(factorial-2 6)`, predict: true, caption: 'Both give 720. Trace (factorial-2 3) by hand: (fact-iter 1 1 3), then (fact-iter 1 2 3), then (fact-iter 2 3 3), then (fact-iter 6 4 3), and since 4 > 3 the answer is 6. Then press Show the substitution and compare the two traces: one expression grows wide and shrinks again, the other stays the same width all the way.' },
        { check: "What is the difference between a procedure and a process?", options: ["None", "The procedure is the text; the process is what happens when it runs", "A process is a procedure with a loop"], answer: 1, why: "A recursive procedure can generate an iterative process; the question is what the interpreter must keep while running.", wrong: ["They are different things. The procedure is text, fixed in advance; the process is what unfolds when it runs. Two procedures can give the same answers and still start very different processes.", null, "Scheme has no loop statement, and a process is not a kind of procedure. A process is the sequence of steps and the memory they need when a procedure is applied, whether or not anything repeats."] },
        `<p>Put the two traces side by side, and the difference is visible at once.</p>`,
        { fig: 'subst', mode: 'shapes', n: 6, caption: 'Left: the first factorial on 6. The expression grows as multiplications are deferred, then shrinks. Right: the second. Every line is one call of fact-iter with three numbers, and nothing is waiting.' },
        `<div class="stmt"><p><span class="kind">Definition.</span> A <em>recursive process</em> is one that builds up a chain of <em>deferred operations</em>, operations that cannot be done until a later call returns, and then performs them as the calls return. If the chain grows in proportion to <i>n</i>, it is a <em>linear recursive process</em>.</p>
<p><span class="kind">Definition.</span> An <em>iterative process</em> is one whose state at every moment is completely described by a fixed number of <em>state variables</em>, together with a rule for updating them and a test for when to stop. If the number of steps grows in proportion to <i>n</i>, it is a <em>linear iterative process</em>.</p></div>
<p>Both procedures call themselves, so both are <em>recursive procedures</em>: that is a fact about how the text is written. Only the first generates a recursive process: that is a fact about how it runs. Keeping those two uses of "recursive" apart is the main point of the lesson.</p>
<details class="reveal"><summary>Predict: if you froze each process halfway through computing 6!, what would you need to write down to restart it later?</summary><p>For the iterative one, three numbers, such as <code>(fact-iter 6 4 6)</code>: that call is the entire state. For the recursive one, the whole expression <code>(* 6 (* 5 (* 4 (factorial 3))))</code>: the pending multiplications are part of the state, and they are kept by the interpreter, not by any variable you can see. The bigger <i>n</i> is, the more there is to write down.</p></details>
<h2>Cost in time and space</h2>
<p>Count the lines of each trace for an input <i>n</i>. The recursive process makes <i>n</i> + 1 calls and then <i>n</i> multiplications as it shrinks, and at its widest it holds <i>n</i> deferred multiplications. The iterative process makes <i>n</i> + 1 calls, and at every moment it holds three numbers.</p>
<table class="small"><tr><th></th><th>steps</th><th>memory needed</th></tr><tr><td>recursive process</td><td>grows in proportion to <i>n</i></td><td>grows in proportion to <i>n</i></td></tr><tr><td>iterative process</td><td>grows in proportion to <i>n</i></td><td>fixed: three numbers</td></tr></table>
<p>The difference in memory is not theoretical. The interpreter on this site allows about twenty thousand deferred operations. Here is Lesson 4's <code>sum-to</code>, which generates a linear recursive process, and an iterative version.</p>`,
        { play: `(define (sum-to n)
  (if (= n 0)
      0
      (+ n (sum-to (- n 1)))))

(sum-to 1000)
(sum-to 100000)`, expectError: true, caption: '(sum-to 1000) gives 500500, but (sum-to 100000) would need a hundred thousand deferred additions, and the interpreter stops with "maximum recursion depth exceeded".' },
        `<p>Here is the same job as an iterative process. The helper <code>iter</code> carries the running total along, so nothing is left waiting. Predict whether the call with 100000 works this time.</p>`,
        { play: `(define (sum-to n)
  (define (iter i total)
    (if (> i n)
        total
        (iter (+ i 1) (+ total i))))
  (iter 1 0))

(sum-to 1000)
(sum-to 100000)`, predict: true, caption: 'The answers are 500500 and 5000050000, and this time the big call works: at every step the whole state is the two numbers i and total, and the recursive call is the whole of its branch, so nothing waits. Try (sum-to 1000000) and see whether it still works.' },
        { check: "A recursive process is one that…", options: ["calls itself", "builds up deferred operations that wait for later calls to return", "uses state variables"], answer: 1, why: "Its memory grows with the input. An iterative process keeps a fixed set of state variables and runs in fixed memory.", wrong: ["A procedure that calls itself is a recursive procedure, which is a fact about its text. fact-iter calls itself too but generates an iterative process. A recursive process is defined by what it keeps: deferred operations.", null, "State variables describe an iterative process, which keeps everything it needs in a fixed number of them. A recursive process keeps a growing chain of deferred operations instead."] },
        `<h2>Why the iterative version needs no memory: tail calls</h2>
<p>Look at where each procedure calls itself. In <code>sum-to</code>'s first version the recursive call is an operand of <code>+</code>: when it returns, there is still an addition to do. In <code>iter</code> the recursive call is the whole of the alternative branch of the <code>if</code>: when it returns, its value simply becomes the value of the current call.</p>
<div class="stmt"><p><span class="kind">Definition.</span> A call is in <em>tail position</em> if, when it returns, there is nothing left for the calling procedure to do except return that same value.</p>
<p><span class="kind">Rule (proper tail recursion).</span> Scheme requires every implementation to carry out a call in tail position without keeping anything for the caller. So a procedure whose only recursive calls are in tail position generates an iterative process, and runs in a fixed amount of memory.</p></div>
<p>This is why Scheme needs no loop statement: an iterative process written as a procedure call <em>is</em> a loop, with its state variables as parameters. Python and C++ make no such promise, which is why in those languages you write a <code>while</code> loop instead.</p>
<details class="reveal"><summary>Predict: which version of factorial can compute <code>(factorial 50000)</code> on this page?</summary><p>Only the iterative one. The recursive process needs fifty thousand deferred multiplications and exceeds the depth limit. The iterative one finishes quickly, although the answer is far larger than this interpreter's decimal numbers can hold, so it prints <code>+inf</code>. That is a limit of the numbers, not of the process.</p></details>
<h2>Why the iterative version is right: an invariant</h2>
<p>Lesson 4 proved the recursive factorial correct by induction, following its recursion. An iterative process is proved correct by an <em>invariant</em>: a statement about the state variables that is true at the first call and stays true from each call to the next.</p>
<div class="stmt"><p><span class="kind">Claim.</span> In every call <code>(fact-iter product counter max-count)</code> made while computing <code>(factorial-2 n)</code>, product = (counter − 1)!.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> The first call is <code>(fact-iter 1 1 n)</code>, and 1 = 0! = (1 − 1)!. If a call has product = (counter − 1)!, the next call has product′ = counter × product = counter × (counter − 1)! = counter!, and counter′ = counter + 1, so product′ = (counter′ − 1)!. By induction on the number of calls, the claim holds for every call. <span class="qed">∎</span></p></div>
<p>The process stops at the first call with counter &gt; <i>n</i>, which is counter = <i>n</i> + 1, since counter goes up by one each time. Then it returns product = ((<i>n</i> + 1) − 1)! = <i>n</i>!, which is the right answer. It also stops for <i>n</i> = 0, returning 1. Designing an iterative process is choosing state variables and an invariant that, when the stopping test succeeds, says the answer is in hand.</p>
<h2>When recursion branches</h2>
<p>Some recursive definitions use themselves more than once. The Fibonacci numbers 0, 1, 1, 2, 3, 5, 8, 13, … are defined by Fib(0) = 0, Fib(1) = 1 and Fib(<i>n</i>) = Fib(<i>n</i> − 1) + Fib(<i>n</i> − 2). The direct translation makes two recursive calls, so its process branches like a tree.</p>`,
        { check: "A call is in tail position when…", options: ["it is the last line of the file", "nothing remains for the caller to do but return the call's value", "it has one argument"], answer: 1, why: "Scheme runs such calls without keeping anything for the caller, so tail calls are Scheme's loops.", wrong: ["Position here is about what is left to do, not about where the call sits in the file. (+ 1 (f x)) is not a tail call even on the last line, because the addition still waits.", null, "The number of arguments does not matter. What matters is whether anything, such as an addition, waits for the call's value."] },
        `<p>Before you run the next box, guess how many calls the tree makes to find <code>(fib 20)</code>: hundreds, thousands, or tens of thousands?</p>`,
        { play: `(define (fib n)
  (cond ((= n 0) 0)
        ((= n 1) 1)
        (else (+ (fib (- n 1))
                 (fib (- n 2))))))

(define (fib-calls n)
  (if (< n 2)
      1
      (+ 1 (fib-calls (- n 1)) (fib-calls (- n 2)))))

(fib 10)
(fib 20)
(fib-calls 10)
(fib-calls 20)`, predict: true, caption: 'The replies are 55, 6765, 177 and 21891. fib-calls counts how many times fib is called: 177 calls to find the 55, and 21891 calls to find 6765. Doubling n from 10 to 20 multiplied the work by more than a hundred, because every call makes two more. Try (fib-calls 25) and predict first.' },
        { fig: 'fibtree', n: 6, caption: 'Every node is one call to fib. The same subproblems are solved again and again: fib 2 is computed five times just to find fib 6.' },
        `<p>This is a <em>tree-recursive process</em>. Its number of calls, from <code>fib-calls</code>, satisfies calls(<i>n</i>) = 1 + calls(<i>n</i> − 1) + calls(<i>n</i> − 2), and in fact calls(<i>n</i>) = 2 Fib(<i>n</i> + 1) − 1, so each increase of <i>n</i> by 1 multiplies the work by about 1.6. <code>(fib 30)</code> needs over two and a half million calls; <code>(fib 60)</code> would need about five trillion, which would keep this interpreter busy for months. Yet at any moment only one branch is being worked on, so its memory, the depth of the tree, grows only in proportion to <i>n</i>.</p>
<p>The cure is the same idea as <code>fact-iter</code>. The tree recomputes values it has already found; an iterative process can carry the two most recent Fibonacci numbers along as state variables and move them forward one step at a time. That is the second exercise, and it turns a procedure that cannot finish into one that answers instantly, without changing the mathematics at all.</p>
<h2>Before the exercises</h2>
<p>To turn a recursive process into an iterative one, answer three questions. What state variables describe how far along the computation is? How does one step update them? When do you stop, and which variable holds the answer then? Then check an invariant that connects the variables to the answer. Here is the method applied to <code>sum-to</code> above, before you apply it yourself.</p>
<p>State: <code>i</code>, the next number to add, and <code>total</code>, the sum so far. Invariant: total = 1 + 2 + … + (i − 1). Start: <code>(iter 1 0)</code>, since the empty sum is 0. Step: <code>(iter (+ i 1) (+ total i))</code>, which keeps the invariant. Stop: when i &gt; n, that is i = n + 1, the invariant says total = 1 + … + n, so return <code>total</code>. The first exercise is the same method with a product; the second has two state variables that move together.</p>`,
        `<details class="reveal"><summary>Puzzle: does <code>(define (f n) (if (= n 0) 'done (f (- n 1))))</code> generate a recursive process or an iterative one? What about <code>(define (g n) (if (= n 0) 0 (+ 1 (g (- n 1)))))</code>?</summary><p><code>f</code> is iterative: its recursive call is in tail position, since nothing is left to do after it returns, so Scheme needs no memory for waiting work and <code>(f 100000)</code> is fine. <code>g</code> is recursive: each call leaves an addition waiting, so <code>(g 100000)</code> needs a hundred thousand waiting additions and runs out of room. Both procedures call themselves; only the second defers work.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Calling a procedure "iterative" because it looks short, or "recursive" because it calls itself: the question is whether operations are deferred. Updating only some of the state variables, so the state drifts. Updating them one after another in your head: all the new values in a call are computed from the <em>old</em> values, together. Returning the wrong variable at the end (in <code>sum-to</code> it is <code>total</code>, not <code>i</code>). Starting an accumulator at the wrong value: sums start at 0, products at 1. Putting the recursive call inside another operation, as in <code>(+ 1 (iter …))</code>, which takes it out of tail position.</p>` },
        {
          ex: {
            id: 'ls-5-1', title: 'Iterative factorial, on your own',
            prompt: `<p>Without looking back, define <code>(factorial n)</code> so that it generates an iterative process, using a helper <code>(iter product counter)</code> defined <em>inside</em> <code>factorial</code>, so that the helper can see <code>n</code> directly (lexical scoping, Lesson 2). The helper multiplies <code>counter</code> into <code>product</code> and moves <code>counter</code> up by one, until <code>counter</code> passes <code>n</code>.</p>`,
            starter: `(define (factorial n)\n  (define (iter product counter)\n    ...)\n  (iter 1 1))\n\n(factorial 5)`,
            solution: `(define (factorial n)\n  (define (iter product counter)\n    (if (> counter n)\n        product\n        (iter (* product counter) (+ counter 1))))\n  (iter 1 1))\n\n(factorial 5)`,
            hints: ['Invariant: product = (counter − 1)!. Stop when counter is greater than n, and return product.', 'Otherwise the next call is (iter (* product counter) (+ counter 1)), with nothing around it, so that it is in tail position.'],
            tests: [{ call: '(factorial 0)', expect: '1' }, { call: '(factorial 1)', expect: '1' }, { call: '(factorial 5)', expect: '120' }, { call: '(factorial 10)', expect: '3628800' }, { call: '(< (factorial 30000) 0)', expect: '#f' }],
            mustContain: [{ re: /\(iter\s+\(/, msg: 'The helper should call itself with updated arguments: (iter (...) (...)).' }],
            mustNotContain: [{ re: /\(\*\s+n\s+\(factorial|\(factorial\s+\(-\s*n/, msg: 'That is the recursive process. Make it iterative: pass the running product along.' }],
            failTip: 'If the last test fails with "maximum recursion depth exceeded", the recursive call is not in tail position: something is waiting for its result.',
            followup: 'The last test computes 30000!, which is too large to print, but an iterative process gets there without running out of room.'
          }
        },
        {
          ex: {
            id: 'ls-5-2', title: 'Fibonacci as an iterative process',
            prompt: `<p>Write <code>(fib n)</code> so that it generates an iterative process. Use a helper <code>(fib-iter a b count)</code> where <code>a</code> and <code>b</code> hold two consecutive Fibonacci numbers, and each step moves them forward together: the new <code>a</code> is <code>a + b</code>, the new <code>b</code> is the old <code>a</code>, and <code>count</code> goes down by 1. When <code>count</code> reaches 0 the answer is <code>b</code>. Start with <code>(fib-iter 1 0 n)</code>. The tests include <code>(fib 60)</code>, which the tree-recursive version cannot finish.</p>`,
            starter: `(define (fib n)\n  (fib-iter 1 0 n))\n\n(define (fib-iter a b count)\n  ...)\n\n(fib 10)`,
            solution: `(define (fib n)\n  (fib-iter 1 0 n))\n\n(define (fib-iter a b count)\n  (if (= count 0)\n      b\n      (fib-iter (+ a b) a (- count 1))))\n\n(fib 10)`,
            hints: ['Invariant: after k steps, a = Fib(k + 1) and b = Fib(k). Base case: when count is 0, return b.', 'Otherwise call fib-iter with all three new values at once: (fib-iter (+ a b) a (- count 1)). Because the new values are the arguments of one call, they are all computed from the old ones.', 'Check by hand: (fib-iter 1 0 2), then (fib-iter 1 1 1), then (fib-iter 2 1 0), which returns 1 = Fib(2).'],
            tests: [{ call: '(fib 0)', expect: '0' }, { call: '(fib 1)', expect: '1' }, { call: '(fib 2)', expect: '1' }, { call: '(fib 10)', expect: '55' }, { call: '(fib 30)', expect: '832040' }, { call: '(fib 60)', expect: '1548008755920' }],
            followup: 'You turned a process whose work multiplies by about 1.6 with each step of n into one whose work grows by one step: the same mathematics, a different shape of process.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A procedure is the text; a process is what happens when it runs. A recursive procedure can generate an iterative process.</li>
<li>A recursive process defers operations, and its memory grows with the input. An iterative process keeps a fixed set of state variables.</li>
<li>A call in tail position leaves nothing to do afterwards; Scheme runs such calls in fixed memory, so tail calls are Scheme's loops.</li>
<li>An iterative process is proved correct by an invariant: true at the start, kept by each step, and giving the answer when the stopping test succeeds.</li>
<li>Tree recursion repeats work and can grow exponentially; carrying the needed values as state variables fixes it.</li>
<li>Today's question: the shape of a procedure tells you the shape of its process. Deferred operations mean growing memory, a tail call means a loop, and two recursive calls mean a tree, which is why the obvious <code>fib</code> is so slow.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-12'],
      standard: 1, title: 'Pairs and lists', summary: 'One way to glue two things together, and everything that grows from it: pairs, the recursive definition of a list, box-and-pointer diagrams, and a pair made of nothing but procedures.',
      blocks: [
        `<p>Until now every value has been a single number or symbol. Real data comes in groups: a point has two coordinates, a sentence has many words, a family tree has branches inside branches. Lisp builds every one of these from a single operation that glues two values together. That is the whole kit. This lesson shows how far one kind of glue goes, and it ends with a small shock: the glue itself can be made out of procedures. So how can one operation that glues two values together build lists, trees and tables, and what is a pair, really?</p>
<h2>Pairs</h2>
<div class="stmt"><p><span class="kind">Rule (pairs).</span> <code>(cons <i>x</i> <i>y</i>)</code> makes a <em>pair</em> whose first part is <i>x</i> and whose second part is <i>y</i>. <code>car</code> gives back the first part and <code>cdr</code> (said "could-er") the second. For any values <i>x</i> and <i>y</i>:</p>
<p style="text-align:center"><code>(car (cons <i>x</i> <i>y</i>))</code> is <i>x</i>, &nbsp;&nbsp; <code>(cdr (cons <i>x</i> <i>y</i>))</code> is <i>y</i>.</p>
<p><code>(pair? <i>v</i>)</code> is <code>#t</code> exactly when <i>v</i> is a pair.</p></div>
<p>Those two equations are everything a pair promises; keep them in mind for the end of the lesson. The odd names are historical. On the IBM 704 computer that ran the first Lisp in 1958, a pair lived in one machine word, and <code>car</code> and <code>cdr</code> stood for the "address" and "decrement" parts of the register. Nobody has managed to rename them since.</p>`,
        { photo: 'ibm-704', caption: "An IBM 704, the kind of computer that ran the first Lisp, at NACA's Langley laboratory in 1957, where it made calculations for aeronautical research." },
        `<p>Predict what each line prints, then run the box. Pay most attention to the lines that print <code>p</code> and <code>q</code> themselves.</p>`,
        { play: `(define p (cons 1 2))
p
(car p)
(cdr p)
(pair? p)
(pair? 7)

(define q (cons p 3))
q
(car q)
(car (car q))`, predict: true, caption: 'A pair prints with a dot between its parts, so p prints as (1 . 2), and (car p) and (cdr p) give 1 and 2. (pair? 7) is #f because 7 is a number. q is a pair whose first part is itself a pair, so it prints with a pair inside: ((1 . 2) . 3). Then (car q) is the pair (1 . 2) and (car (car q)) is 1. Change p to (cons 1 (cons 2 3)) and predict how it prints.' },
        { check: "What is <code>(car (cdr (cons 1 (cons 2 '()))))</code>?", options: ["1", "2", "'()"], answer: 1, why: "cdr gives the rest of the list, (2); car of that is 2. cadr is the shorthand.", wrong: ["1 is the car of the whole list. The cdr is taken first and steps past the 1, leaving (2), and the car of that is 2. The operations apply from the inside out.", null, "'() is what remains after two cdrs, at the end of the list. Here there is only one cdr, which leaves (2), and the car of (2) is 2."] },
        `<p>Since a pair can hold pairs, pairs can be glued into any shape at all: chains, trees, tables. SICP calls this the <em>closure property</em>: combining pairs gives you something you can combine again. The shape that turns out to be most useful by far is a chain.</p>
<h2>Lists</h2>
<div class="stmt"><p><span class="kind">Definition.</span> A <em>list</em> is either the empty list, written <code>'()</code>, or a pair whose <code>cdr</code> is a list.</p></div>
<p>Read the definition twice, because it refers to itself, like the recursive definitions of Lesson 4. It says a list of three items is a pair holding the first item and a list of two items, which is a pair holding the second item and a list of one item, which is a pair holding the third item and the empty list. So the list of 1, 2, 3 and 4 is</p>
<p style="text-align:center"><code>(cons 1 (cons 2 (cons 3 (cons 4 '()))))</code></p>
<p>The printer knows this convention and prints such a chain without dots, as <code>(1 2 3 4)</code>. <code>(list 1 2 3 4)</code> is a shortcut that builds exactly the same chain. <code>(null? <i>v</i>)</code> asks "is <i>v</i> the empty list?", and every list procedure you write from now on will begin with that question. Predict what the last line of the box prints.</p>`,
        { play: `(cons 1 (cons 2 (cons 3 (cons 4 '()))))
(list 1 2 3 4)

(define squares (list 1 4 9 16 25))
(car squares)
(cdr squares)
(car (cdr squares))
(null? squares)
(null? (cdr (list 7)))

(cons 1 (cons 2 3))`, predict: true, caption: 'The first two lines both print (1 2 3 4), because list builds the same chain of pairs. For squares, (car squares) is 1, (cdr squares) is (4 9 16 25), the next is 4, and the two null? questions give #f and #t. The last line is a chain that does not end in the empty list, so it is not a list, and the printer shows the dot: (1 2 . 3).' },
        { check: "Which of these is a list?", options: ["<code>(cons 1 2)</code>", "<code>(cons 1 '())</code>", "Both"], answer: 1, why: "A list is '() or a pair whose cdr is a list. (cons 1 2) ends in 2, not '(), so it prints as (1 . 2).", wrong: ["(cons 1 2) is a pair, but a pair is not automatically a list. Its cdr, 2, is not a list, so it prints with a dot as (1 . 2).", null, "Both are pairs, which is why it looks that way, but a list needs its cdr to be a list too. (cons 1 '()) passes that test, and (cons 1 2) fails it, because 2 is neither '() nor a pair."] },
        `<details class="reveal"><summary>Predict: which of these are lists? <code>'()</code>, <code>(cons 1 '())</code>, <code>(cons 1 2)</code>, <code>(cons '() '())</code>.</summary><p>The first three are settled by the definition at once: <code>'()</code> is the empty list; <code>(cons 1 '())</code> is a pair whose cdr is a list, so it is the one-item list <code>(1)</code>; <code>(cons 1 2)</code> is a pair whose cdr, 2, is not a list, so it is not a list. The last is a pair whose cdr is the empty list, so it <em>is</em> a list: the one-item list whose only item happens to be the empty list, printed <code>(())</code>.</p></details>
<h2>Taking lists apart</h2>
<p>To reach an item deep inside a list, compose <code>car</code> and <code>cdr</code>. Each <code>cdr</code> steps past one item; the final <code>car</code> takes the item you have arrived at. The compositions have abbreviations: <code>(cadr x)</code> means <code>(car (cdr x))</code>, and in general the middle letters are read from right to left, in the order the operations happen. Every combination of <code>a</code> and <code>d</code> up to four letters is built in, from <code>caar</code> to <code>cddddr</code>. Predict the five replies in the box below.</p>`,
        { play: `(define squares (list 1 4 9 16 25))
(cadr squares)           ; car of cdr: the second item
(caddr squares)          ; car of cdr of cdr: the third
(cddr squares)           ; everything after the second
(length squares)
(list-ref squares 3)     ; counts from 0, like Python`, predict: true, caption: 'The replies are 4, 9, (9 16 25), 5 and 16. cadr is the car of the cdr, so it is the second item, and caddr goes one cdr further. cddr drops two items and keeps the rest. list-ref counts from 0, so index 3 is the fourth item, 16. Try (cdddr squares) and (cadddr squares) and predict them.' },
        `<details class="reveal"><summary>Treasure hunt: <code>(define chest '(rope (map (x treasure)) lamp))</code>. Using only <code>car</code> and <code>cdr</code>, get <code>treasure</code> out of the chest.</summary><p>Walk it one step at a time. <code>(cdr chest)</code> is <code>((map (x treasure)) lamp)</code>, so <code>(car (cdr chest))</code> is <code>(map (x treasure))</code>. Its <code>cdr</code> is <code>((x treasure))</code>, and the <code>car</code> of that is <code>(x treasure)</code>. Then <code>cdr</code> gives <code>(treasure)</code> and <code>car</code> gives <code>treasure</code>. In full: <code>(car (cdr (car (cdr (car (cdr chest))))))</code>, which abbreviates to <code>(cadr (cadadr chest))</code>. Try it in the Code Lab.</p></details>
<h2>Box-and-pointer diagrams</h2>
<p>The standard picture of pairs is a <em>box-and-pointer</em> diagram. Each pair is drawn as two boxes side by side, the <code>car</code> on the left and the <code>cdr</code> on the right. A box holds a number or symbol directly, or an arrow to another pair; a diagonal slash means the empty list. Type expressions into the figure. Start with <code>(cons 1 2)</code> and <code>(list 1 2)</code>, and make sure you can say why they look different.</p>`,
        { fig: 'boxptr', caption: 'A list is a row of pairs linked through their cdr boxes, ending in a slash. A list inside a list hangs below its row. Try (list 1 (list 2 3) 4) and (cons (list 1 2) (list 3 4)).' },
        `<p>The diagram makes one fact impossible to miss: adding an item at the <em>front</em> of a list is a single <code>cons</code>, one new pair pointing at the old list, which is not copied. Getting to the <em>end</em> means following every arrow. That difference in cost shapes how every Lisp program is written, and the next lesson relies on it.</p>
<h2>Writing lists down directly</h2>
<p>Typing <code>(list 1 2 3)</code> builds a list by evaluating a combination. A single quote in front of a parenthesised list writes the list down as data instead: <code>'(1 2 3)</code> means "this list itself; do not evaluate it". That is also why the empty list is written <code>'()</code>. Lesson 10 is about what the quote really does; for now it is a convenient way to write a list, especially a list of symbols.</p>`,
        { play: `'(1 2 3)
(car '(1 2 3))
(cdr '(1 2 3))
'(mon tue wed)
(cons 0 '(1 2 3))
(append '(1 2) '(3 4))
(reverse '(1 2 3))
(car '())`, expectError: true, caption: 'Without the quote, (mon tue wed) would try to apply a procedure called mon. append joins two lists; reverse gives a reversed copy. The last line fails: the empty list is not a pair, so it has no car.' },
        { check: "What is the difference between <code>(cons 1 '(2 3))</code> and <code>(list 1 '(2 3))</code>?", options: ["None", "(1 2 3) against (1 (2 3)): cons adds at the front, list makes a two-item list", "The second is an error"], answer: 1, why: "cons attaches 1 to the front of the list (2 3). list builds a new list whose items are 1 and the list (2 3).", wrong: ["They differ. cons attaches 1 to the front of the list (2 3), giving (1 2 3). list builds a new list whose second item is the whole list (2 3), giving (1 (2 3)).", null, "list accepts any values as items, including another list. It is not an error: it builds a list with a list inside it."] },
        `<h2>What is a pair, really?</h2>
<p>Here is the promised shock, from SICP §2.1.3. We have used <code>cons</code>, <code>car</code> and <code>cdr</code> as if pairs were a special kind of object built into the machine. But all a pair has to do is keep the two promises in the rule at the top of the lesson. Anything that keeps them is a pair, as far as any program can tell. And procedures can keep them. Predict what the last four lines of the box print, especially the very last one.</p>`,
        { play: `(define (my-cons x y)
  (define (dispatch m)
    (if (= m 0) x y))
  dispatch)

(define (my-car z) (z 0))
(define (my-cdr z) (z 1))

(define p (my-cons 3 4))
(my-car p)
(my-cdr p)
p`, predict: true, caption: 'The last three replies are 3, 4 and then the procedure itself. my-cons returns a procedure: asked for 0 it answers x, and asked for 1 it answers y, so it keeps both promises of a pair. The last line prints a procedure, because that is what this "pair" really is. Change my-cons to answer 1 for the first part and 0 for the second, and change my-car and my-cdr to match.' },
        `<p>Check it with the substitution model and lexical scoping from Lesson 2. <code>(my-cons 3 4)</code> defines an internal procedure <code>dispatch</code> that uses <code>x</code> and <code>y</code>, and returns it; <code>dispatch</code> remembers the 3 and the 4 because they belong to the body in which it was defined. Then <code>(my-car p)</code> is <code>(p 0)</code>, which is <code>(if (= 0 0) 3 4)</code>, which is 3. The two equations hold for every <i>x</i> and <i>y</i>, so these procedures are a correct implementation of pairs, even though no data structure appears anywhere.</p>
<p>The lesson SICP draws is that data is defined by what you can do with it, not by what it is made of. A pair is anything that satisfies the <code>car</code>/<code>cdr</code> equations. That idea, a <em>contract</em> between the code that builds something and the code that uses it, is behind every well-designed program you will ever read.</p>
<h2>Before the exercises</h2>
<p>The first exercise builds a list from pairs by hand, the way the definition describes it. Work from the <em>inside out</em>: the last pair holds the last item and <code>'()</code>, and each <code>cons</code> around it adds one item at the front. The second takes lists apart with <code>car</code> and <code>cdr</code> and builds a new one with <code>cons</code>. Here are worked examples of both skills. Predict what <code>drop-second</code> returns before you run the box.</p>`,
        { play: `; Build (red green) from pairs: inside out
(define colours (cons 'red (cons 'green '())))
colours

; Drop the second item: keep the first, skip the second, keep the rest
(define (drop-second items)
  (cons (car items)
        (cddr items)))

(drop-second '(a b c d))`, predict: true, caption: 'colours is (red green). drop-second gives (a c d): a new first pair holding a, attached to the list that starts after b. The original list is not changed.' },
        { aside: `<p><b>Common mistakes in this lesson.</b> Confusing <code>(cons 1 2)</code>, a pair, with <code>(list 1 2)</code>, a two-item list; draw the boxes and the difference is plain. Ending a hand-built chain with something other than <code>'()</code>, which makes a dotted chain rather than a list. Taking <code>car</code> or <code>cdr</code> of the empty list. Reading <code>cadr</code> left to right: the letters apply from right to left, so <code>cadr</code> is "cdr first, then car". Forgetting the quote on a list of symbols. Expecting <code>cons</code> to add an item at the end: it always adds at the front.</p>` },
        {
          ex: {
            id: 'ls-6-1', title: 'Build a list by hand',
            prompt: `<p>Define <code>days</code> to be the list <code>(mon tue wed)</code> of three symbols, using only <code>cons</code>, quoted symbols like <code>'mon</code>, and <code>'()</code>. No <code>list</code> and no quoted list. The point is to feel the chain of pairs from the definition.</p>`,
            starter: `(define days ...)\ndays\n(cadr days)`,
            solution: `(define days (cons 'mon (cons 'tue (cons 'wed '()))))\ndays\n(cadr days)`,
            hints: ["Work from the inside out. The last pair holds 'wed and the empty list: (cons 'wed '()).", "Then (cons 'tue that), then (cons 'mon that)."],
            tests: [{ call: 'days', expect: '(mon tue wed)' }, { call: '(car days)', expect: 'mon' }, { call: '(cddr days)', expect: '(wed)' }, { call: '(length days)', expect: '3' }, { call: '(null? (cdddr days))', expect: '#t' }],
            mustNotContain: [{ re: /\(list\b|'\(mon/, msg: "Use cons, not list or a quoted list: (cons 'mon (cons ...))." }],
            failTip: 'If days prints with a dot, such as (mon tue . wed), the innermost cons is missing its \'(): the chain must end in the empty list.',
            followup: "Change the last cons to (cons 'tue 'wed) and watch the dot appear: (mon tue . wed) is a chain of pairs, but it is not a list. Then build the same days with list and check that days prints the same."
          }
        },
        {
          ex: {
            id: 'ls-6-2', title: 'Second and third',
            prompt: `<p>Define <code>(second items)</code> and <code>(third items)</code> using only <code>car</code> and <code>cdr</code>: no <code>cadr</code>, <code>caddr</code> or <code>list-ref</code>. Then define <code>(swap-first-two items)</code>, which returns a list like the input but with its first two items exchanged. Use <code>cons</code> and <code>cddr</code> for that one, as <code>drop-second</code> did.</p>`,
            starter: `(define (second items) ...)\n(define (third items) ...)\n\n(define (swap-first-two items)\n  ...)\n\n(second '(a b c d))\n(third '(a b c d))\n(swap-first-two '(a b c d))`,
            solution: `(define (second items) (car (cdr items)))\n(define (third items) (car (cdr (cdr items))))\n\n(define (swap-first-two items)\n  (cons (second items)\n        (cons (car items)\n              (cddr items))))\n\n(second '(a b c d))\n(third '(a b c d))\n(swap-first-two '(a b c d))`,
            hints: ['second is (car (cdr items)); third has one more cdr inside.', 'swap-first-two: the result starts with the second item, then the first item, then everything after the second: (cons (second items) (cons (car items) (cddr items))).'],
            tests: [{ call: "(second '(a b c d))", expect: 'b' }, { call: "(third '(a b c d))", expect: 'c' }, { call: "(second '(10 20))", expect: '20' }, { call: "(swap-first-two '(a b c d))", expect: '(b a c d)' }, { call: "(swap-first-two '(1 2))", expect: '(2 1)' }, { call: "(swap-first-two '((x) y z))", expect: '(y (x) z)' }],
            mustNotContain: [{ re: /\(cadr\b|\(caddr\b|\(list-ref\b/, msg: 'Write second and third from car and cdr only.' }],
            followup: 'swap-first-two made two new pairs and shared the rest of the original list, (cddr items), without copying it. Draw it in the box-and-pointer figure to see the sharing.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li><code>cons</code> makes a pair; <code>car</code> and <code>cdr</code> take it apart, and <code>(car (cons x y))</code> = x, <code>(cdr (cons x y))</code> = y is all a pair promises.</li>
<li>A list is either <code>'()</code> or a pair whose <code>cdr</code> is a list. <code>list</code> and <code>'(…)</code> are shortcuts; a chain not ending in <code>'()</code> prints with a dot.</li>
<li><code>cadr</code> and friends compose <code>car</code> and <code>cdr</code>, read right to left. <code>null?</code>, <code>pair?</code>, <code>length</code>, <code>list-ref</code>, <code>append</code> and <code>reverse</code> are built in.</li>
<li>Box-and-pointer diagrams show structure exactly; adding at the front is one <code>cons</code>.</li>
<li>Pairs can be built from procedures alone: data is defined by the operations it supports.</li>
<li>Today's question: one operation, <code>cons</code>, is enough, because a pair can hold pairs, and a chain of them is a list. A pair is anything that keeps the <code>car</code> and <code>cdr</code> promises, even a procedure.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-12', '3B-AP-13'],
      standard: 1, title: 'Recursion on lists', summary: 'The definition of a list writes your procedures for you: the template, three shapes (boil down, build, keep), a proof by induction on length, iterating over a list, and lists inside lists.',
      blocks: [
        `<p>Here is a claim that sounds too good to be true: once you know how a list is defined, you know how to write almost every procedure that works on lists, and you know why each one stops and why it is right. The definition from Lesson 6 does the work.</p>
<p style="text-align:center"><em>A list is either the empty list, or a pair whose <code>cdr</code> is a list.</em></p>
<p>A definition with two cases gives a procedure with two cases. A definition that refers to itself on the <code>cdr</code> gives a procedure that calls itself on the <code>cdr</code>. That is the whole method, and this lesson is about taking it seriously. So how does the definition of a list write a procedure for you, and how can you tell that the procedure is right?</p>
<h2>The template</h2>
<div class="stmt"><p><span class="kind">The list template.</span> A procedure that follows the definition of a list has the shape</p>
<pre class="code"><code>(define (f items)
  (if (null? items)
      <i>answer-for-the-empty-list</i>
      (<i>combine</i> (car items) (f (cdr items)))))</code></pre>
<p>It answers the empty list directly, and answers a non-empty list by combining its first item with the answer for the rest.</p></div>
<p>Why does it stop? Each recursive call is on <code>(cdr items)</code>, which is one pair shorter, and a list is a finite chain of pairs that ends in <code>'()</code>, so after as many calls as the list has items, the base case is reached. This is Lesson 4's termination rule with "smaller" meaning "shorter". It is called <em>structural recursion</em>, because the recursion follows the structure of the data.</p>
<h2>Shape one: boiling a list down</h2>
<p>Fill in the template with a number for the empty list and an arithmetic combination, and a list boils down to one number. Watch the same shape three times, and predict the three replies at the bottom of the box.</p>`,
        { play: `(define (length items)
  (if (null? items)
      0
      (+ 1 (length (cdr items)))))

(define (sum items)
  (if (null? items)
      0
      (+ (car items) (sum (cdr items)))))

(define (count-evens items)
  (cond ((null? items) 0)
        ((even? (car items)) (+ 1 (count-evens (cdr items))))
        (else (count-evens (cdr items)))))

(length (list 1 3 5 7))
(sum (list 1 3 5 7))
(count-evens (list 1 2 3 4 5 6))`, predict: true, caption: 'The replies are 4, 16 and 3. length and sum have the same shape: 0 for the empty list, and the first item combined with the answer for the rest, by adding 1 or by adding the item. count-evens splits the non-empty case in two, one for an item that counts and one for an item that does not. Change the lists and predict again.' },
        { check: "What must <code>(product '())</code> return in the list template?", options: ["0", "1", "'()"], answer: 1, why: "The answer for the empty list must leave the combining operation unchanged: 1 for a product, 0 for a sum, '() when building a list.", wrong: ["0 is right for a sum, not for a product: multiplying by 0 would turn every product into 0. The empty product must leave the other items unchanged, which is 1.", null, "'() is the answer for the empty list when the procedure builds a list with cons. A product is a number, and the empty product is the number 1."] },
        `<details class="reveal"><summary>Predict: what must <code>(sum '())</code> be, and what would go wrong with any other answer? What about a procedure <code>product</code>?</summary><p><code>0</code>. Every sum ends by adding the sum of the empty list, so that value is added to every answer; only 0 leaves the answers unchanged. For the same reason <code>(product '())</code> must be <code>1</code>. This is Lesson 4's rule that an empty sum is 0 and an empty product is 1, and it is not a convention but a necessity.</p></details>
<h2>Shape two: building a new list</h2>
<p>If the answer for the empty list is <code>'()</code> and the combining step is <code>cons</code>, the procedure builds a new list, one item at a time, on the way back from the recursion. Here is <code>scale-list</code>, which multiplies every item, and <code>append</code>, which joins two lists. Predict the two lists that the box prints.</p>`,
        { play: `(define (scale-list items factor)
  (if (null? items)
      '()
      (cons (* (car items) factor)
            (scale-list (cdr items) factor))))

(define (append list1 list2)
  (if (null? list1)
      list2
      (cons (car list1)
            (append (cdr list1) list2))))

(scale-list (list 1 2 3 4 5) 10)
(append (list 1 2 3) (list 4 5))`, predict: true, caption: 'The replies are (10 20 30 40 50) and (1 2 3 4 5). Both rebuild a list with cons on the way back from the recursion. Trace (append (list 1 2) (list 3)) by substitution: (cons 1 (append (2) (3))), then (cons 1 (cons 2 (append () (3)))), then (cons 1 (cons 2 (3))), which is (1 2 3).' },
        { check: "What does the list template recurse on?", options: ["<code>items</code>", "<code>(cdr items)</code>", "<code>(car items)</code>"], answer: 1, why: "Each call is on a shorter list, so it stops. Recursing on items itself never ends.", wrong: ["A call on items itself is a call on the same input: it never gets shorter, so it never ends. The recursion must be on a smaller list, (cdr items).", null, "(car items) is the first item, which might not even be a list. The recursive call needs the rest of the list, (cdr items), so that each call is shorter."] },
        `<p>Notice that <code>append</code> follows the template on <code>list1</code> only. It never takes <code>list2</code> apart, and it never copies it either: the last <code>cons</code> simply points at it. Draw the result in the box-and-pointer figure of Lesson 6 and you will see the second list shared, not copied. That is one reason list programs can be fast despite all the consing.</p>
<h2>Why append is right: induction on length</h2>
<p>Structural recursion comes with its own proof method. To prove something about every list, prove it for the empty list, and prove it for a list of length <i>n</i> + 1 assuming it for the list of length <i>n</i> that is its <code>cdr</code>. That is ordinary induction (Lesson 4's "trust the recursive call"), counting the length.</p>
<div class="stmt"><p><span class="kind">Claim.</span> For all lists <i>a</i> and <i>b</i>, <code>(length (append a b))</code> = <code>(length a)</code> + <code>(length b)</code>.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> By induction on the length of <i>a</i>. <b>Base case.</b> If <i>a</i> is empty, <code>(append a b)</code> is <i>b</i>, whose length is 0 + <code>(length b)</code>. <b>Inductive step.</b> If <i>a</i> is not empty, <code>(append a b)</code> is <code>(cons (car a) (append (cdr a) b))</code>, whose length is 1 more than the length of <code>(append (cdr a) b)</code>. By the induction hypothesis, applied to the shorter list <code>(cdr a)</code>, that is 1 + <code>(length (cdr a))</code> + <code>(length b)</code>, which is <code>(length a)</code> + <code>(length b)</code>. <span class="qed">∎</span></p></div>
<p>The proof has exactly the shape of the procedure: one case for the empty list and one that relies on the answer for the <code>cdr</code>. When a procedure follows the template, its proof usually writes itself the same way.</p>
<h2>Shape three: keeping some items</h2>
<p>The third shape walks a list and keeps only the items that pass a test. It is shape two with a choice added: in the keep case it <code>cons</code>es, and in the skip case it just recurses. Predict which items of the list below will survive.</p>`,
        { play: `(define (keep-positive items)
  (cond ((null? items) '())
        ((> (car items) 0)
         (cons (car items) (keep-positive (cdr items))))
        (else (keep-positive (cdr items)))))

(keep-positive (list 3 -1 4 -1 5 -9))`, predict: true, caption: 'Gives (3 4 5). The items 3, 4 and 5 pass the test and are consed on the way back, while -1, -1 and -9 take the skip branch and are simply dropped. Change the test to (even? (car items)) and you have "keep the evens"; Lesson 9 turns this pattern into a single procedure, filter, that takes the test as an argument.' },
        `<h2>Iterating over a list</h2>
<p>Every procedure above generates a recursive process (Lesson 5): the <code>+</code> or <code>cons</code> waits for the recursive call to return. The same work can be done iteratively, by carrying the answer so far in a state variable, exactly as <code>fact-iter</code> did. Predict what the two calls at the bottom of the box print.</p>`,
        { play: `(define (sum-list items)
  (define (iter rest total)
    (if (null? rest)
        total
        (iter (cdr rest) (+ total (car rest)))))
  (iter items 0))

(define (copy-list items)
  (define (iter rest result)
    (if (null? rest)
        result
        (iter (cdr rest) (cons (car rest) result))))
  (iter items '()))

(sum-list '(1 2 3 4))
(copy-list '(1 2 3))`, predict: true, caption: 'sum-list gives 10, as expected. copy-list was meant to copy the list, but it gives (3 2 1): the list came out backwards! Each item is consed onto the front of the answer so far, so the item visited last ends up first. Try copy-list on a longer list to see the same thing.' },
        { check: "An iterative process builds a list with cons as it walks along. What comes out?", options: ["A copy in the same order", "The list reversed", "An error"], answer: 1, why: "Each item is consed onto the front of the answer so far, so the first item ends up last. That is how reverse is written.", wrong: ["cons adds at the front, so each new item goes before the ones already collected, and the first item visited ends up at the back. Keeping the order needs the recursive version, which conses on the way back.", null, "Nothing is wrong with the program: it runs and gives a list. The list is simply in the opposite order, which is exactly how reverse is written."] },
        `<details class="reveal"><summary>Why did <code>copy-list</code> reverse the list?</summary><p>An iterative process visits the items first to last, and <code>cons</code> always adds at the <em>front</em>. So the first item visited is the first one added, which ends up at the back, and the last item visited ends up at the front. Trace it: <code>(iter (1 2 3) ())</code>, then <code>(iter (2 3) (1))</code>, then <code>(iter (3) (2 1))</code>, then <code>(iter () (3 2 1))</code>. For a sum the order does not matter; for a list it does. Sometimes, as in the second exercise, this "bug" is exactly what you want.</p></details>
<h2>Lists inside lists</h2>
<p>An item of a list can itself be a list, and then the structure is a <em>tree</em>, like boxes packed inside boxes. <code>length</code> counts only the top-level items; to count every number at every depth, SICP's <code>count-leaves</code> recurses on <em>both</em> the <code>car</code> and the <code>cdr</code>, with one more base case: something that is not a pair at all is a single leaf. Predict what <code>length</code> and <code>count-leaves</code> say about <code>boxes</code>.</p>`,
        { play: `(define (count-leaves t)
  (cond ((null? t) 0)
        ((not (pair? t)) 1)
        (else (+ (count-leaves (car t))
                 (count-leaves (cdr t))))))

(define boxes (list 1 (list 2 (list 3 4)) (list (list 5))))
boxes
(length boxes)
(count-leaves boxes)`, predict: true, caption: 'boxes prints as (1 (2 (3 4)) ((5))). Its length is 3, but count-leaves gives 5: there are five numbers in all, however deeply they are packed, because count-leaves recurses on both the car and the cdr. Draw boxes in the box-and-pointer figure and count the numbers.' },
        `<p>This is tree recursion again, as in Lesson 5's <code>fib</code>, but here nothing is computed twice: each pair is visited once. The template is the same idea one level up: the definition "a tree is empty, a leaf, or a pair of trees" has three cases, so the procedure has three.</p>
<h2>Before the exercises</h2>
<p>The first exercise boils a non-empty list down to its largest item. Its base case is a list of <em>one</em> item, <code>(null? (cdr items))</code>, because the largest of an empty list makes no sense. Lesson 3's <code>bigger</code> is included in the starter for combining. The second exercise is an iterative process over a list, like <code>sum-list</code>. Here is a worked example of the first shape with a different combining step: the smallest item. Predict the answer for the list in the box.</p>`,
        { play: `(define (smaller a b)
  (if (< a b) a b))

(define (smallest items)
  (if (null? (cdr items))
      (car items)                                ; one item: it is the smallest
      (smaller (car items) (smallest (cdr items)))))

(smallest (list 7 3 9 4))`, predict: true, caption: 'Gives 3. Trust the recursive call: if (smallest (cdr items)) is the smallest of the rest, then the smaller of it and the first item is the smallest of all.' },
        { aside: `<p><b>Common mistakes in this lesson.</b> Recursing on <code>items</code> instead of <code>(cdr items)</code>, which never ends. The wrong answer for the empty list: 0 for a sum or count, 1 for a product, <code>'()</code> for a new list. Using <code>list</code> where you needed <code>cons</code>: <code>(list 1 '(2 3))</code> is <code>(1 (2 3))</code>, not <code>(1 2 3)</code>. Taking <code>car</code> of an empty list because the base case tested the wrong thing. Forgetting that an iterative process with <code>cons</code> builds its answer backwards.</p>` },
        {
          ex: {
            id: 'ls-7-1', title: 'Biggest item',
            prompt: `<p>Define <code>(largest items)</code>, the largest number in a non-empty list, without <code>max</code>, <code>apply</code>, <code>reduce</code> or any fold. Follow <code>smallest</code>: the base case is a list of one item; otherwise combine the <code>car</code> with the largest of the rest, using <code>bigger</code>.</p>`,
            starter: `(define (bigger a b)\n  (if (> a b) a b))\n\n(define (largest items)\n  ...)\n\n(largest (list 3 17 4 12))`,
            solution: `(define (bigger a b)\n  (if (> a b) a b))\n\n(define (largest items)\n  (if (null? (cdr items))\n      (car items)\n      (bigger (car items) (largest (cdr items)))))\n\n(largest (list 3 17 4 12))`,
            hints: ['Base case: (null? (cdr items)) means exactly one item is left, so return (car items).', 'Otherwise: (bigger (car items) (largest (cdr items))).'],
            tests: [{ call: '(largest (list 3 17 4 12))', expect: '17' }, { call: '(largest (list -5 -2 -9))', expect: '-2' }, { call: '(largest (list 42))', expect: '42' }, { call: '(largest (list 1 2 3 4 5))', expect: '5' }, { call: '(largest (list 9 1 1 1))', expect: '9' }],
            mustNotContain: [{ re: /\(max\b|\(apply\b|\(reduce\b|\(fold-/, msg: 'Write the recursion yourself: no max, apply, reduce or folds.' }],
            failTip: 'If you get "The object (), passed as the first argument to car", the base case tested (null? items): with that test the recursion reaches the empty list, which has no largest item.',
            followup: 'The same induction as for append proves it correct, this time on lists of length at least 1: the base case is length 1.'
          }
        },
        {
          ex: {
            id: 'ls-7-2', title: 'Reverse',
            prompt: `<p>Define <code>(my-reverse items)</code>, which returns the list in reverse order, as an iterative process: a helper <code>(iter remaining result)</code> moves the <code>car</code> of <code>remaining</code> onto the front of <code>result</code> until nothing remains. You have already seen this happen by accident in <code>copy-list</code>. Do not use the built-in <code>reverse</code>.</p>`,
            starter: `(define (my-reverse items)\n  (define (iter remaining result)\n    ...)\n  (iter items '()))\n\n(my-reverse (list 1 2 3 4))`,
            solution: `(define (my-reverse items)\n  (define (iter remaining result)\n    (if (null? remaining)\n        result\n        (iter (cdr remaining)\n              (cons (car remaining) result))))\n  (iter items '()))\n\n(my-reverse (list 1 2 3 4))`,
            hints: ['When remaining is empty, result is the answer.', 'Otherwise call iter with (cdr remaining) and (cons (car remaining) result).', 'Invariant: (append (reverse remaining) result) is always the reverse of the original list.'],
            tests: [{ call: "(my-reverse '())", expect: '()' }, { call: '(my-reverse (list 1 2 3 4))', expect: '(4 3 2 1)' }, { call: "(my-reverse '(a (b c) d))", expect: '(d (b c) a)' }, { call: "(my-reverse '(x))", expect: '(x)' }],
            mustNotContain: [{ re: /\(reverse\b/, msg: 'Use cons, car, cdr and recursion, not the built-in reverse.' }],
            followup: 'Only the top level is reversed: (b c) stays (b c), because it is one item. Reversing at every depth would need the tree-shaped recursion of count-leaves.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>The definition of a list gives the template: answer <code>'()</code> directly; combine <code>(car items)</code> with the answer for <code>(cdr items)</code>. It stops because each call is on a shorter list.</li>
<li>Three shapes: boil down (base 0 or 1, combine with arithmetic), build (base <code>'()</code>, combine with <code>cons</code>), keep (a <code>cond</code> with a <code>cons</code> case and a skip case).</li>
<li>Induction on length proves list procedures correct, with the same two cases as the procedure.</li>
<li>An iterative process over a list carries the answer so far; with <code>cons</code> it comes out reversed.</li>
<li>Lists inside lists are trees; recurse on both <code>car</code> and <code>cdr</code>, with a case for a leaf.</li>
<li>Today's question: the definition has two cases, so the procedure has two cases, and it recurses on the <code>cdr</code>. It stops because each call is on a shorter list, and it is right by induction on the length.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3A-AP-17', '3B-AP-14'],
      standard: 1, title: 'Procedures as data', summary: 'Procedures are values like numbers: passing them in (higher-order procedures), making them on the spot (lambda), naming values locally (let), and handing them back (closures), with \u03c0 and a derivative on the way.',
      blocks: [
        `<p>Look at these three procedures side by side. One adds up the integers from <i>a</i> to <i>b</i>, one adds up their cubes, and one adds up the terms of a series that, strangely, closes in on π.</p>`,
        { code: `(define (sum-integers a b)
  (if (> a b) 0 (+ a (sum-integers (+ a 1) b))))

(define (sum-cubes a b)
  (if (> a b) 0 (+ (cube a) (sum-cubes (+ a 1) b))))

(define (pi-sum a b)
  (if (> a b) 0 (+ (/ 1.0 (* a (+ a 2))) (pi-sum (+ a 4) b))))`, caption: 'Three procedures from SICP §1.3.1, identical except in two places: what is done to each term, and how to get from one term to the next.' },
        `<p>Whenever you catch yourself copying a pattern and changing one piece, that piece should become a parameter. Mathematicians did this long ago: they write Σ for "the sum of", and put the varying part next to it. This lesson gives Scheme the same power, and it rests on one fact: in Scheme, procedures are values.</p>
<div class="stmt"><p><span class="kind">Definition (first-class values).</span> A kind of value is <em>first-class</em> if it can be named by a variable, passed as an argument to a procedure, returned as the result of a procedure, and included in a data structure. In Scheme, procedures are first-class, exactly like numbers.</p></div>
<p>You have already seen hints of this. In Lesson 1 the value of <code>+</code> was a procedure; in Lesson 6, <code>my-cons</code> returned a procedure. Now we use it on purpose.</p>
<p>So here is the question. How can one procedure take the varying part of those three as an argument, and what else becomes possible once a procedure can be passed around like a number?</p>
<h2>Passing procedures in</h2>
<p>Here is the pattern above, captured once, with the two varying pieces as parameters <code>term</code> and <code>next</code>. A procedure that takes procedures as arguments, or returns one, is called a <em>higher-order procedure</em>. Predict the two replies at the bottom of the box.</p>`,
        { play: `(define (sum term a next b)
  (if (> a b)
      0
      (+ (term a)
         (sum term (next a) next b))))

(define (inc n) (+ n 1))
(define (identity x) x)

(define (sum-cubes a b) (sum cube a inc b))
(define (sum-integers a b) (sum identity a inc b))

(sum-cubes 1 10)
(sum-integers 1 100)`, predict: true, caption: 'sum captures the idea of summation itself. The replies are 3025 and 5050: the cubes 1 + 8 + 27 + ... + 1000, and the integers 1 + 2 + ... + 100. Note that cube and inc are passed by name, with no parentheses: we are passing the procedures, not calling them.' },
        { check: "What is the difference between passing <code>cube</code> and <code>(cube)</code> to sum?", options: ["None", "cube is the procedure itself; (cube) tries to call it with no arguments", "(cube) is a list"], answer: 1, why: "Procedures are first-class values. A name with no parentheses is the procedure; parentheses apply it.", wrong: ["They are very different. cube is the procedure itself, a value that can be passed; (cube) applies it to no arguments, which is an error.", null, "In Scheme code, parentheses around a name make a combination, an application, not a list. (cube) would call cube with no arguments."] },
        `<p>The substitution model of Lesson 2 needs no change: <code>(sum cube 1 inc 10)</code> becomes the body of <code>sum</code> with the procedure <code>cube</code> put wherever <code>term</code> appears, so <code>(term a)</code> becomes <code>(cube 1)</code>. A procedure is substituted like any other value.</p>
<h2>lambda: a procedure with no name</h2>
<p>Defining <code>inc</code> and <code>identity</code> just so that we can pass them in is clumsy, like having to name every number before you add it.</p>
<div class="stmt"><p><span class="kind">Rule (lambda).</span> The special form <code>(lambda (<i>parameters</i>) <i>body</i>)</code> evaluates to a procedure with those parameters and that body, without giving it a name. It is applied exactly like any other procedure.</p>
<p><span class="kind">Rule (define is lambda).</span> <code>(define (<i>name</i> <i>parameters</i>) <i>body</i>)</code> means exactly <code>(define <i>name</i> (lambda (<i>parameters</i>) <i>body</i>))</code>.</p></div>
<p>Read <code>(lambda (x) (* x x x))</code> aloud as "the procedure that takes an <i>x</i> and cubes it". With it, the π series from the top of the lesson needs no helper procedures at all. Its terms are 1/(1·3) + 1/(5·7) + 1/(9·11) + …, and SICP notes that eight times this sum approaches π. Predict how close the answer in the box comes to π.</p>`,
        { play: `(define (sum term a next b)
  (if (> a b)
      0
      (+ (term a)
         (sum term (next a) next b))))

(define (pi-sum a b)
  (sum (lambda (x) (/ 1.0 (* x (+ x 2))))
       a
       (lambda (x) (+ x 4))
       b))

(* 8 (pi-sum 1 1000))

((lambda (x y) (+ x y)) 3 4)

(define plus (lambda (x y) (+ x y)))
(plus 3 4)`, predict: true, caption: 'Eight times the sum gives 3.13959265559, closing in on π = 3.14159…, with an error of about 0.002. Then a lambda applied on the spot, with no name involved, and one given a name with define, which is exactly what (define (plus x y) …) always meant.' },
        `<details class="reveal"><summary>Predict: what are <code>((lambda (x) (* 2 x)) 21)</code> and <code>(sum (lambda (k) (* k k)) 1 (lambda (k) (+ k 1)) 4)</code>?</summary><p><code>42</code>: the procedure is applied directly to 21. And <code>30</code>, the sum of the squares 1 + 4 + 9 + 16. In the second, the first lambda is the term and the second is next.</p></details>
<h2>let: naming values locally</h2>
<p>Often a computation has an intermediate value you want to name and use more than once.</p>
<div class="stmt"><p><span class="kind">Rule (let).</span> <code>(let ((<i>v</i><sub>1</sub> <i>e</i><sub>1</sub>) … (<i>v</i><sub><i>n</i></sub> <i>e</i><sub><i>n</i></sub>)) <i>body</i>)</code> means exactly <code>((lambda (<i>v</i><sub>1</sub> … <i>v</i><sub><i>n</i></sub>) <i>body</i>) <i>e</i><sub>1</sub> … <i>e</i><sub><i>n</i></sub>)</code>. So all the expressions <i>e</i> are evaluated first, <em>outside</em> the let, and then the body is evaluated with the names standing for their values.</p></div>
<p>Predict the two replies in the box below.</p>`,
        { play: `(define (distance x1 y1 x2 y2)
  (let ((dx (- x2 x1))
        (dy (- y2 y1)))
    (sqrt (+ (* dx dx) (* dy dy)))))

(distance 0 0 3 4)

(let ((a 10) (b 20))
  (* a b))`, predict: true, caption: 'The replies are 5 and 200. let is not a new idea but a new spelling: a lambda applied at once to the values. Compare Lesson 2\u2019s internal defines, which did the same job.' },
        { check: "After <code>(define x 2)</code>, what is <code>(let ((x 3) (y (+ x 2))) (* x y))</code>?", options: ["15", "12", "10"], answer: 1, why: "The let values are evaluated outside the let, so y uses the outer x: 2 + 2 = 4. Then 3 × 4 = 12.", wrong: ["This reads let as a sequence, where y sees the new x = 3. But all the let's values are evaluated outside it, where x is still 2, so y is 4. let* is the form that binds one name at a time.", null, "The body uses the new names, so x is 3 there, not 2. Only the expressions that give the values are evaluated outside the let, which makes y 4, and the body computes 3 × 4."] },
        `<details class="reveal"><summary>Puzzle from SICP: after <code>(define x 2)</code>, what is <code>(let ((x 3) (y (+ x 2))) (* x y))</code>?</summary><p><code>12</code>, not 15. By the rule, <code>(+ x 2)</code> is evaluated <em>outside</em> the let, where <code>x</code> is still 2, so <code>y</code> is 4, and the body computes 3 × 4. When one local name must use another, nest two lets, or use <code>let*</code>, which binds its names one at a time: <code>(let* ((x 3) (y (+ x 2))) (* x y))</code> is 15.</p></details>
<h2>Handing procedures back</h2>
<p>If procedures can be passed in, they can be returned too. Here is a procedure that <em>builds</em> adders, and one that glues two procedures together, the way mathematicians compose functions: (<i>f</i> ∘ <i>g</i>)(<i>x</i>) = <i>f</i>(<i>g</i>(<i>x</i>)). Predict the four answers at the bottom of the box, and whether the last two will agree.</p>`,
        { play: `(define (make-adder n)
  (lambda (x) (+ x n)))

(define add5 (make-adder 5))
(add5 10)
((make-adder 100) 1)

(define (compose f g)
  (lambda (x) (f (g x))))

(define (inc x) (+ x 1))
((compose square inc) 6)
((compose inc square) 6)`, predict: true, caption: 'add5 gives 15 and the next line 101. Then 49 and 37: composition is not commutative, and the order matters. Squaring 7 and adding one to 36 are different things.' },
        { check: "What does <code>(define (add n) (lambda (x) (+ x n)))</code> return when called as <code>(add 5)</code>?", options: ["5", "A procedure that adds 5 to its argument", "An error"], answer: 1, why: "A procedure can return a procedure. The returned one remembers n = 5: it is a closure.", wrong: ["5 is the argument, not the result. add returns the value of its lambda expression, which is a procedure that remembers n.", null, "Returning a procedure is allowed, because procedures are first-class values. (add 5) simply hands back a new procedure; its body does not run until you apply it to something."] },
        `<div class="stmt"><p><span class="kind">Definition.</span> A procedure together with the environment in which it was created is called a <em>closure</em>. By Lesson 2's rule of lexical scoping, a procedure's free names are looked up where it was defined, so a closure keeps those names alive for as long as the procedure exists.</p></div>
<p>Something remarkable just happened. <code>make-adder</code> finished its work long ago, yet the <code>n</code> it was given, 5, lives on inside <code>add5</code>. And <code>my-cons</code> in Lesson 6 was a closure all along: each "pair" was a procedure remembering its <i>x</i> and <i>y</i>. Nearly every modern language, Python and JavaScript included, now has closures, and Scheme is where they learned it.</p>
<h2>Calculus as a procedure</h2>
<p>Here is a higher-order procedure that would please Newton. The derivative of a function <i>g</i> is the function whose value at <i>x</i> is approximately (<i>g</i>(<i>x</i> + <i>dx</i>) − <i>g</i>(<i>x</i>))/<i>dx</i> for a very small <i>dx</i>. So <code>deriv</code> takes a procedure and returns a procedure (SICP §1.3.4). Predict roughly what the first call gives.</p>`,
        { play: `(define dx 0.00001)

(define (deriv g)
  (lambda (x)
    (/ (- (g (+ x dx)) (g x))
       dx)))

(define (cube x) (* x x x))

((deriv cube) 5)
((deriv square) 10)
((deriv (deriv cube)) 5)`, predict: true, caption: 'The derivative of x³ is 3x², which is 75 at 5, and the program gives 75.0001499966. The derivative of x² at 10 is 20. The last line takes the derivative twice: 6x at 5 is 30, approximately, with the errors of two approximations added together.' },
        `<p>No part of <code>deriv</code> knows what <code>g</code> is. It works for any procedure of one number, including ones not yet written, and its answer is itself a procedure that can be passed on again. That is the power of treating procedures as data.</p>
<h2>Before the exercises</h2>
<p>The first exercise is <code>sum</code> with multiplication in place of addition; watch the base case, since an empty product is 1 (Lesson 4). The second returns a new procedure, like <code>make-adder</code> and <code>compose</code>. Here is a worked example of each shape. Predict the three answers.</p>`,
        { play: `(define (sum term a next b)
  (if (> a b)
      0
      (+ (term a)
         (sum term (next a) next b))))

; the sum of the squares of the odd numbers from 1 to 9
(sum (lambda (k) (* k k)) 1 (lambda (k) (+ k 2)) 9)

; flip returns a new procedure that takes its arguments in the other order
(define (flip f)
  (lambda (x y) (f y x)))

((flip -) 1 10)
((flip list) 'a 'b)`, predict: true, caption: 'The sum is 1 + 9 + 25 + 49 + 81 = 165. ((flip -) 1 10) computes (- 10 1), which is 9, and ((flip list) \'a \'b) is (b a).' },
        { aside: `<p><b>Common mistakes in this lesson.</b> Writing <code>(sum (cube) 1 inc 10)</code> or <code>(sum cube(1) …)</code>: to pass a procedure, write its name with no parentheses around it. Writing <code>(lambda x …)</code>: the parameter list needs parentheses even for one parameter. Expecting one <code>let</code> name to see another in the same <code>let</code>; use <code>let*</code>. Returning the result of calling a procedure when you meant to return the procedure itself: <code>(lambda (x) (f (f x)))</code>, not <code>(f (f x))</code>. The wrong base case in a product: 1, not 0.</p>` },
        {
          ex: {
            id: 'ls-8-1', title: 'A generic product',
            prompt: `<p>By analogy with <code>sum</code>, define <code>(product term a next b)</code>, which multiplies the values of <code>term</code> from <code>a</code> to <code>b</code>. Then define <code>(factorial n)</code> in terms of it, using <code>lambda</code> rather than named helpers.</p>`,
            starter: `(define (product term a next b)\n  ...)\n\n(define (factorial n)\n  ...)\n\n(factorial 5)`,
            solution: `(define (product term a next b)\n  (if (> a b)\n      1\n      (* (term a)\n         (product term (next a) next b))))\n\n(define (factorial n)\n  (product (lambda (x) x) 1 (lambda (x) (+ x 1)) n))\n\n(factorial 5)`,
            hints: ['Copy the shape of sum, but the base case for a product is 1, not 0.', 'factorial is the product of the identity procedure from 1 to n, stepping by 1.', 'The identity procedure is (lambda (x) x); the successor is (lambda (x) (+ x 1)).'],
            tests: [{ call: '(product (lambda (x) x) 1 (lambda (x) (+ x 1)) 5)', expect: '120' }, { call: '(product square 1 (lambda (x) (+ x 1)) 4)', expect: '576' }, { call: '(product (lambda (x) 2) 1 (lambda (x) (+ x 1)) 10)', expect: '1024' }, { call: '(product (lambda (x) x) 5 (lambda (x) (+ x 1)) 4)', expect: '1' }, { call: '(factorial 5)', expect: '120' }, { call: '(factorial 0)', expect: '1' }, { call: '(factorial 10)', expect: '3628800' }],
            mustContain: [{ re: /\(lambda\b/, msg: 'Use lambda for the term and next procedures.' }],
            failTip: 'If every product comes out 0, the base case returns 0: an empty product is 1.',
            followup: 'The fourth test multiplies over an empty range (from 5 up to 4) and gets 1, which is why (factorial 0) comes out right with no special case.'
          }
        },
        {
          ex: {
            id: 'ls-8-2', title: 'Twice',
            prompt: `<p>Define <code>(twice f)</code>, which returns a <em>new procedure</em> that applies <code>f</code> two times. So <code>((twice square) 3)</code> is 81 and <code>((twice inc) 5)</code> is 7. Then, using <code>twice</code> and nothing else, define <code>add4</code> so that <code>(add4 10)</code> is 14.</p>`,
            starter: `(define (inc x) (+ x 1))\n\n(define (twice f)\n  ...)\n\n(define add4 ...)\n\n((twice square) 3)\n(add4 10)`,
            solution: `(define (inc x) (+ x 1))\n\n(define (twice f)\n  (lambda (x) (f (f x))))\n\n(define add4 (twice (twice inc)))\n\n((twice square) 3)\n(add4 10)`,
            hints: ['twice returns a lambda of one argument that computes (f (f x)), like compose with f in both places.', 'twice of inc adds 2. Twice of that adds 4: (twice (twice inc)).'],
            tests: [{ call: '((twice square) 3)', expect: '81' }, { call: '((twice inc) 5)', expect: '7' }, { call: '(add4 10)', expect: '14' }, { call: '((twice (twice square)) 2)', expect: '65536' }, { call: '((twice (lambda (s) (cons 0 s))) (list 1))', expect: '(0 0 1)' }],
            mustContain: [{ re: /\(twice\s+\(twice/, msg: 'Define add4 by applying twice to twice.' }],
            mustNotContain: [{ re: /\(define\s+\(add4/, msg: 'add4 should be defined as a value built with twice, not as a procedure with parameters.' }],
            followup: '(twice (twice square)) squares four times, so 2 becomes 2¹⁶ = 65536. What does (twice twice) do to a procedure? Try (((twice twice) inc) 0): the answer is 4, not 3.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>Procedures are first-class: they can be named, passed in, returned and stored. A procedure that takes or returns procedures is higher-order.</li>
<li><code>(lambda (params) body)</code> makes a procedure without a name; <code>(define (f x) …)</code> is shorthand for defining <code>f</code> to be a lambda.</li>
<li><code>let</code> is a lambda applied at once: its values are evaluated outside it. <code>let*</code> binds one name at a time.</li>
<li>A returned procedure is a closure: it keeps the names around its birthplace alive.</li>
<li>One higher-order procedure, such as <code>sum</code> or <code>deriv</code>, captures a whole family of computations. That answers today's question: the varying part becomes a parameter, because a procedure is a value that can be passed in, made on the spot and handed back.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-10', '3B-AP-14'],
      standard: 1, title: 'map, filter and accumulate', summary: 'Three higher-order procedures that replace almost every list recursion: signal-flow pipelines, a law proved by induction, folding in both directions, and nested mappings.',
      blocks: [
        `<p>Here is a puzzle, the second problem on the famous Project Euler list of programming challenges. The Fibonacci numbers go 1, 2, 3, 5, 8, 13, 21, …, each the sum of the two before. What is the sum of the <em>even</em> ones below four million? By the end of this lesson the answer is one line of Scheme, and the line reads almost like the question. The trick is to stop writing recursions one at a time.</p>
<p>Look back at Lesson 7. <code>scale-list</code> transformed every item. <code>keep-positive</code> kept some items. <code>sum</code> combined all the items into one value. Those three shapes cover most list processing there is, and with Lesson 8's higher-order procedures each can be written <em>once</em>, with the varying piece as a parameter, and reused for ever.</p>
<p>So what are those three procedures, and how do they turn the puzzle into one short line?</p>
<h2>Three procedures</h2>
<div class="stmt"><p><span class="kind">map.</span> <code>(map <i>proc</i> <i>items</i>)</code> is the list of <code>(<i>proc</i> <i>x</i>)</code> for each item <i>x</i>, in order.</p>
<p><span class="kind">filter.</span> <code>(filter <i>pred</i> <i>items</i>)</code> is the list of those items <i>x</i> for which <code>(<i>pred</i> <i>x</i>)</code> is true, in order.</p>
<p><span class="kind">accumulate.</span> <code>(accumulate <i>op</i> <i>initial</i> (list <i>x</i><sub>1</sub> … <i>x</i><sub><i>n</i></sub>))</code> is <code>(<i>op</i> <i>x</i><sub>1</sub> (<i>op</i> <i>x</i><sub>2</sub> … (<i>op</i> <i>x</i><sub><i>n</i></sub> <i>initial</i>)))</code>: the items combined from the right, starting from <i>initial</i>.</p></div>
<p>Each definition is Lesson 7's template with one piece made a parameter. Read the code alongside the statements above, and predict the last five replies before you run the box. The last one is the surprising one.</p>`,
        { play: `(define (map proc items)
  (if (null? items)
      '()
      (cons (proc (car items))
            (map proc (cdr items)))))

(define (filter predicate items)
  (cond ((null? items) '())
        ((predicate (car items))
         (cons (car items) (filter predicate (cdr items))))
        (else (filter predicate (cdr items)))))

(define (accumulate op initial items)
  (if (null? items)
      initial
      (op (car items)
          (accumulate op initial (cdr items)))))

(map square (list 1 2 3 4 5))
(filter odd? (list 1 2 3 4 5 6 7))
(accumulate + 0 (list 1 2 3 4 5))
(accumulate * 1 (list 1 2 3 4 5))
(accumulate cons '() (list 1 2 3))`, predict: true, caption: 'The replies are (1 4 9 16 25), (1 3 5 7), 15, 120, and (1 2 3). Stare at the last one: accumulating with cons and the empty list simply rebuilds the list, because (cons 1 (cons 2 (cons 3 \'()))) is the list itself.' },
        { check: "What is <code>(filter odd? (list 1 2 3 4 5))</code>?", options: ["<code>(#t #f #t #f #t)</code>", "<code>(1 3 5)</code>", "<code>3</code>"], answer: 1, why: "filter keeps the items for which the predicate is true. map with odd? would give the booleans.", wrong: ["That list of truth values is what map with odd? would give, one answer per item. filter uses the answers to decide which items to keep, and returns the items themselves.", null, "filter returns a list of the items it kept, not a count and not a single item. The answer is (1 3 5)."] },
        `<p><code>map</code> is <code>scale-list</code> with "multiply by factor" replaced by any procedure; <code>filter</code> is <code>keep-positive</code> with "positive?" replaced by any predicate; <code>accumulate</code> is <code>sum</code> with "add" and "0" replaced by any operation and starting value. The starting value must be what the operation does nothing to: 0 for <code>+</code>, 1 for <code>*</code>, <code>'()</code> for <code>cons</code>, for exactly the reason Lesson 7 gave.</p>
<details class="reveal"><summary>Predict: what are <code>(accumulate + 0 (map square (list 1 2 3)))</code> and <code>(map (lambda (x) (&gt; x 2)) (list 1 2 3 4))</code>?</summary><p><code>14</code>: <code>map</code> gives (1 4 9), and <code>accumulate</code> adds them. And <code>(#f #f #t #t)</code>: <code>map</code> with a predicate gives a list of truth values, one per item; it does not remove anything. Keeping only some items is <code>filter</code>'s job.</p></details>
<h2>Pipelines</h2>
<p>Once these three exist, a great many programs become a <em>pipeline</em>: make a list, pass it through a <code>filter</code>, then a <code>map</code>, then an <code>accumulate</code>. SICP draws these like electrical circuits, with signals flowing from one box to the next. Wire one up and watch the data flow.</p>`,
        { fig: 'hof', caption: 'The list flows left to right through the three stages. Change any stage and the results update. Try fib, then odd?, then + to sum the odd Fibonacci numbers.' },
        `<p>SICP calls this the method of <em>conventional interfaces</em>: every stage takes a list and gives a list, so any stage can be plugged into any other, like pieces of track. Here is the Project Euler puzzle from the top of the lesson. <code>fibs-below</code> makes the list, and then the question is one line: accumulate with <code>+</code> the filter of <code>even?</code> over the Fibonacci numbers below four million. Predict the value of the last line of the box, the sum of the squares of the odd numbers from 1 to 10, before you run it.</p>`,
        { play: `(define (accumulate op initial items)
  (if (null? items)
      initial
      (op (car items) (accumulate op initial (cdr items)))))

(define (enumerate a b)
  (if (> a b) '() (cons a (enumerate (+ a 1) b))))

(define (fibs-below limit)
  (define (iter a b)
    (if (>= a limit)
        '()
        (cons a (iter b (+ a b)))))
  (iter 1 2))

(fibs-below 100)
(accumulate + 0 (filter even? (fibs-below 4000000)))

(accumulate + 0 (map square (filter odd? (enumerate 1 10))))`, predict: true, caption: 'The Fibonacci numbers below 100, then the answer to the puzzle: 4613732. The last line is the sum of the squares of the odd numbers from 1 to 10: 1 + 9 + 25 + 49 + 81 = 165. Read each pipeline from the inside out.' },
        { check: "What is <code>(accumulate + 0 (map square (list 1 2 3)))</code>?", options: ["14", "6", "(1 4 9)"], answer: 0, why: "map gives (1 4 9); accumulate with + from 0 adds them: 14.", wrong: [null, "6 is the sum of 1, 2 and 3 without squaring. map applies square to every item first, giving (1 4 9), and only then does accumulate add.", "(1 4 9) is what the map alone gives. accumulate then combines that whole list into a single number with +."] },
        `<h2>A law, and its proof</h2>
<p>Pipelines can be reasoned about, not just run. Here is a fact that a compiler can use to make pipelines faster: mapping twice is the same as mapping once with the composition.</p>
<div class="stmt"><p><span class="kind">Claim (map fusion).</span> For any procedures <i>f</i> and <i>g</i> and any list <i>items</i>, <code>(map <i>f</i> (map <i>g</i> <i>items</i>))</code> equals <code>(map (compose <i>f</i> <i>g</i>) <i>items</i>)</code>, where <code>(compose f g)</code> is Lesson 8's <code>(lambda (x) (f (g x)))</code>.</p></div>
<div class="proof"><p><span class="kind">Proof.</span> By induction on the length of <i>items</i>, as in Lesson 7. <b>Base case.</b> If <i>items</i> is empty, both sides are <code>'()</code>, since mapping over the empty list gives the empty list. <b>Inductive step.</b> If <i>items</i> is <code>(cons x rest)</code>, the left side is <code>(map f (cons (g x) (map g rest)))</code>, which is <code>(cons (f (g x)) (map f (map g rest)))</code>. The right side is <code>(cons ((compose f g) x) (map (compose f g) rest))</code>, which is <code>(cons (f (g x)) (map (compose f g) rest))</code>. The first items agree, and the rests agree by the induction hypothesis applied to the shorter list <i>rest</i>. <span class="qed">∎</span></p></div>
<p>The left side walks the list twice and builds a list in between; the right side walks it once. The proof guarantees they always agree, so either can replace the other. Laws like this are what make functional programs easy to transform safely, and they are exactly the proofs Lesson 7 taught you to write.</p>
<h2>Folding from the left and from the right</h2>
<p><code>accumulate</code> combines from the right: the last item meets <i>initial</i> first. Scheme has it built in as <code>fold-right</code>, and also has <code>fold-left</code>, which combines from the left, starting with <i>initial</i> and the <em>first</em> item. For <code>+</code> and <code>*</code> the direction makes no difference. For other operations it does. Predict the six replies, working out the two divisions by hand with the brackets in each place.</p>`,
        { play: `(fold-right + 0 (list 1 2 3))
(fold-left + 0 (list 1 2 3))

(fold-right / 1 (list 1 2 3))
(fold-left / 1 (list 1 2 3))

(fold-right list '() (list 1 2 3))
(fold-left list '() (list 1 2 3))`, predict: true, caption: 'The sums agree: 6 and 6. The divisions do not: fold-right computes 1 / (2 / (3 / 1)), which is 1.5, and fold-left computes ((1 / 1) / 2) / 3, which is about 0.1667. The last two lines show the nesting directly.' },
        { check: "For which operation do fold-left and fold-right always agree?", options: ["Subtraction", "Addition", "Division"], answer: 1, why: "They agree for associative operations such as + and *, and differ for − and /.", wrong: ["Subtraction is not associative: (1 − 2) − 3 is −4 but 1 − (2 − 3) is 2. The two folds put the brackets in different places, so they give different answers.", null, "Division is not associative either: (1 / 2) / 3 is about 0.17 but 1 / (2 / 3) is 1.5. The folds agree only when the brackets do not matter."] },
        `<details class="reveal"><summary>Which property must an operation have for <code>fold-right</code> and <code>fold-left</code> to always agree? (This is SICP exercise 2.38.)</summary><p>It is enough that the operation is <em>associative</em>, (<i>a</i> op <i>b</i>) op <i>c</i> = <i>a</i> op (<i>b</i> op <i>c</i>), and that <i>initial</i> does nothing to either side, as 0 does for <code>+</code>. Then both folds compute <i>x</i><sub>1</sub> op <i>x</i><sub>2</sub> op … op <i>x</i><sub><i>n</i></sub>, only with the brackets in different places, and associativity says the brackets do not matter. Division and subtraction are not associative, so their folds differ.</p></details>
<h2>Nested mappings</h2>
<p>Pipelines can also replace nested loops. SICP's example: for a given <i>n</i>, find all pairs of whole numbers (<i>i</i>, <i>j</i>) with 1 ≤ <i>j</i> &lt; <i>i</i> ≤ <i>n</i> such that <i>i</i> + <i>j</i> is prime. For each <i>i</i>, map over the possible <i>j</i> to make a list of pairs; that gives a list of lists, which <code>flatmap</code> joins into one list with <code>append</code>. Then filter. Predict the pairs that <code>(prime-sum-pairs 4)</code> gives.</p>`,
        { play: `(define (accumulate op initial items)
  (if (null? items)
      initial
      (op (car items) (accumulate op initial (cdr items)))))
(define (enumerate a b)
  (if (> a b) '() (cons a (enumerate (+ a 1) b))))

(define (flatmap proc items)
  (accumulate append '() (map proc items)))

(define (prime? n)
  (and (> n 1)
       (null? (filter (lambda (d) (= (remainder n d) 0))
                      (enumerate 2 (- n 1))))))

(define (prime-sum-pairs n)
  (filter (lambda (p) (prime? (+ (car p) (cadr p))))
          (flatmap (lambda (i)
                     (map (lambda (j) (list i j))
                          (enumerate 1 (- i 1))))
                   (enumerate 1 n))))

(prime-sum-pairs 4)
(length (prime-sum-pairs 10))`, predict: true, caption: 'For n = 4 the pairs are (2 1), (3 2), (4 1) and (4 3): their sums 3, 5, 5 and 7 are prime. For n = 10 there are 18 such pairs. prime? is itself a pipeline: n is prime when filtering its possible divisors leaves nothing.' },
        `<p>Scheme has <code>map</code>, <code>filter</code>, <code>fold-right</code>, <code>fold-left</code> and <code>reduce</code> built in. You wrote them yourself because, as Lesson 2 promised, there is no difference between what the language gives you and what you build. From now on, use the built-in ones freely: you know exactly what they do.</p>
<h2>Before the exercises</h2>
<p>The first exercise is a pipeline: decide the stages, then write them from the inside out. The second asks you to express <code>map</code> and <code>length</code> using only <code>accumulate</code>. The key is to know what the two arguments of <i>op</i> are: the current item, and the answer already accumulated for the rest of the list. Here is a worked example, <code>my-filter</code> through <code>accumulate</code>. Predict the result.</p>`,
        { play: `(define (accumulate op initial items)
  (if (null? items)
      initial
      (op (car items) (accumulate op initial (cdr items)))))

; x is the current item; rest-done is the filtered rest of the list
(define (my-filter pred items)
  (accumulate (lambda (x rest-done)
                (if (pred x) (cons x rest-done) rest-done))
              '()
              items))

(my-filter even? (list 1 2 3 4 5 6))`, predict: true, caption: 'Gives (2 4 6). The lambda answers one question: given the current item and the already-filtered rest, what is the filtered list? Keep x by consing it on, or drop it by returning rest-done unchanged.' },
        { aside: `<p><b>Common mistakes in this lesson.</b> Passing a call instead of a procedure: <code>(map (square) items)</code> is wrong, <code>(map square items)</code> is right. Using <code>map</code> with a predicate and expecting items to be removed; that is <code>filter</code>. Mixing up the arguments of the <i>op</i> in <code>accumulate</code>: it receives the current item first and the accumulated rest second. The wrong <i>initial</i>: 0 for sums, 1 for products, <code>'()</code> for lists. Reading a pipeline from left to right instead of from the inside out. Assuming <code>fold-left</code> and <code>fold-right</code> always agree.</p>` },
        {
          ex: {
            id: 'ls-9-1', title: 'A pipeline of your own',
            prompt: `<p>Using the built-in <code>map</code> and <code>filter</code> and the <code>accumulate</code> from the starter, define <code>(sum-even-cubes items)</code>: the sum of the cubes of the even numbers in <code>items</code>. Write it as a single pipeline, with no explicit recursion.</p>`,
            starter: `(define (accumulate op initial items)\n  (if (null? items)\n      initial\n      (op (car items) (accumulate op initial (cdr items)))))\n\n(define (sum-even-cubes items)\n  ...)\n\n(sum-even-cubes (list 1 2 3 4 5 6))`,
            solution: `(define (accumulate op initial items)\n  (if (null? items)\n      initial\n      (op (car items) (accumulate op initial (cdr items)))))\n\n(define (sum-even-cubes items)\n  (accumulate + 0 (map cube (filter even? items))))\n\n(sum-even-cubes (list 1 2 3 4 5 6))`,
            hints: ['Name the stages: keep the evens, cube them, add them up.', 'From the inside out: (filter even? items), then (map cube ...), then (accumulate + 0 ...). cube is built in, or write (lambda (x) (* x x x)).'],
            tests: [{ call: '(sum-even-cubes (list 1 2 3 4 5 6))', expect: '288' }, { call: "(sum-even-cubes '())", expect: '0' }, { call: '(sum-even-cubes (list 1 3 5))', expect: '0' }, { call: '(sum-even-cubes (list 2))', expect: '8' }, { call: '(sum-even-cubes (list -2 4))', expect: '56' }],
            mustContain: [{ re: /\(map\b/, msg: 'Use map for the cubes.' }, { re: /\(filter\b/, msg: 'Use filter to keep the even numbers.' }],
            mustNotContain: [{ re: /\(sum-even-cubes\s+\(cdr/, msg: 'No explicit recursion: compose map, filter and accumulate.' }],
            followup: 'Here the order of the stages happens not to matter, because a number is even exactly when its cube is: (filter even? (map cube items)) keeps the same numbers. That would not be true if the map were (lambda (x) (+ x 1)).'
          }
        },
        {
          ex: {
            id: 'ls-9-2', title: 'map and length via accumulate',
            prompt: `<p>Define <code>my-map</code> and <code>my-length</code> using <em>only</em> the <code>accumulate</code> in the starter and a <code>lambda</code>: no explicit recursion. The trick is choosing the right <i>op</i>, as <code>my-filter</code> did. (This is SICP exercise 2.33.)</p>`,
            starter: `(define (accumulate op initial items)\n  (if (null? items)\n      initial\n      (op (car items) (accumulate op initial (cdr items)))))\n\n(define (my-map p items)\n  (accumulate (lambda (x y) ...) '() items))\n\n(define (my-length items)\n  (accumulate (lambda (x y) ...) 0 items))\n\n(my-map square (list 1 2 3))\n(my-length (list 1 2 3))`,
            solution: `(define (accumulate op initial items)\n  (if (null? items)\n      initial\n      (op (car items) (accumulate op initial (cdr items)))))\n\n(define (my-map p items)\n  (accumulate (lambda (x y) (cons (p x) y)) '() items))\n\n(define (my-length items)\n  (accumulate (lambda (x y) (+ 1 y)) 0 items))\n\n(my-map square (list 1 2 3))\n(my-length (list 1 2 3))`,
            hints: ['In the lambda, x is the current item and y is the answer already accumulated for the rest of the list.', 'For map: cons (p x) onto y. For length: ignore x, and add 1 to y.'],
            tests: [{ call: '(my-map square (list 1 2 3))', expect: '(1 4 9)' }, { call: "(my-map (lambda (x) (* 2 x)) '())", expect: '()' }, { call: "(my-map car '((a 1) (b 2)))", expect: '(a b)' }, { call: '(my-length (list 1 2 3))', expect: '3' }, { call: "(my-length '(a b c d e f))", expect: '6' }, { call: "(my-length '())", expect: '0' }],
            mustNotContain: [{ re: /\(cdr[\s\S]*\(cdr|\(map\b|\(length\b/, msg: 'No explicit recursion and no built-in map or length: express both through accumulate.' }],
            followup: 'Now map, filter and length are all accumulate with different ops. accumulate is the most general of the three: it can build any of the others.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li><code>map</code> transforms every item, <code>filter</code> keeps some, <code>accumulate</code> combines them all from the right, starting from a value the operation leaves unchanged.</li>
<li>Pipelines chain them through a common interface, the list; read them from the inside out.</li>
<li>Laws such as map fusion are proved by induction on length, the method of Lesson 7.</li>
<li><code>fold-right</code> and <code>fold-left</code> agree for associative operations such as <code>+</code>, and differ for <code>/</code> and <code>-</code>.</li>
<li><code>flatmap</code> turns nested loops into a pipeline. <code>accumulate</code> can express <code>map</code>, <code>filter</code> and <code>length</code>.</li>
<li>Today's question: <code>map</code>, <code>filter</code> and <code>accumulate</code> are Lesson 7's three shapes with the varying piece made a parameter, and chained they turn the Euler puzzle into one line.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-12'],
      standard: 1, title: 'Symbols, quotation, and code as data', summary: 'What the quote mark really does, symbols as values, three kinds of equality, association lists, and the idea at the heart of Lisp: a program is a list, so a program can read, build and even run other programs.',
      blocks: [
        `<p>SICP opens its section on symbols with a little puzzle about language. If someone says "say your name aloud", you say your name. If they say "say 'your name' aloud", you say the words "your name". The quotation marks change what is meant: not the thing the words stand for, but the words themselves. Programming languages need the same distinction, and Lisp takes it further than any other: in Lisp a quoted piece of <em>program</em> is ordinary data, which one program can take apart, change, build, and even run. So what does the quote mark really do, and how can a piece of program be data?</p>
<h2>The quote</h2>
<div class="stmt"><p><span class="kind">Rule (quote).</span> The special form <code>(quote <i>d</i>)</code> evaluates to <i>d</i> itself, not evaluated. <code>'<i>d</i></code> is an abbreviation for <code>(quote <i>d</i>)</code>: the reader turns the one into the other before evaluation starts.</p>
<p><span class="kind">Definition.</span> A <em>symbol</em> is a value that is nothing but a name. <code>'x</code> evaluates to the symbol <code>x</code>, whatever the variable <code>x</code> may or may not be. <code>(symbol? <i>v</i>)</code> asks whether <i>v</i> is a symbol.</p></div>
<p>So without a quote, a name is looked up; with one, the name itself is the value. And a quoted list is just a list, whatever it looks like: <code>'(+ 1 2)</code> is a list of three items, the symbol <code>+</code> and the numbers 1 and 2, and nothing gets added. Predict each reply in the box below, especially the last three.</p>`,
        { play: `(define a 1)
(define b 2)
(list a b)
(list 'a 'b)
'(a b)
(+ 1 2)
'(+ 1 2)
(car '(+ 1 2))
(symbol? (car '(+ 1 2)))`, predict: true, caption: '(list a b) looks up the variables and gives (1 2); (list \'a \'b) gives the symbols, (a b), and so does \'(a b). (+ 1 2) is 3, but \'(+ 1 2) is a list whose car is the symbol +, so the last two lines give + and #t. Change the quote on \'a to nothing and see which reply changes.' },
        { check: "What is <code>(car '(+ 1 2))</code>?", options: ["3", "The symbol +", "The addition procedure"], answer: 1, why: "The quote keeps the list unevaluated. Its first item is the symbol +, not the procedure that + names.", wrong: ["That would be the value of (+ 1 2) without the quote. The quote stops the evaluation, so nothing is added: the list is data, and its car is its first item.", null, "The quoted list holds the symbol +, which is only a name. Only evaluating the symbol would look up the procedure it names."] },
        `<details class="reveal"><summary>Puzzle (SICP exercise 2.55): what is <code>(car ''abracadabra)</code>?</summary><p>The symbol <code>quote</code>. By the rule, <code>''abracadabra</code> is <code>(quote (quote abracadabra))</code>. Evaluating the outer quote gives its argument unevaluated: the two-item list <code>(quote abracadabra)</code>. Its <code>car</code> is the symbol <code>quote</code>. The printer shows the list <code>(quote abracadabra)</code> as <code>'abracadabra</code>, which is why this looks like magic until you apply the rule.</p></details>
<h2>Three kinds of equality</h2>
<div class="stmt"><p><span class="kind">Rule (equality).</span> <code>(= <i>a</i> <i>b</i>)</code> compares numbers. <code>(eq? <i>a</i> <i>b</i>)</code> asks whether <i>a</i> and <i>b</i> are the very same object; two symbols with the same name are always the same object, so <code>eq?</code> is the test for symbols. <code>(equal? <i>a</i> <i>b</i>)</code> asks whether two structures have the same shape and the same contents, however they were built.</p></div>
<p>Predict the six replies in the box below.</p>`,
        { play: `(eq? 'apple 'apple)
(eq? 'apple 'pear)
(eq? (list 1 2) (list 1 2))
(equal? (list 1 2) (list 1 2))
(equal? '(1 (2 3)) '(1 (2 3)))
(= 3 3.0)`, predict: true, caption: 'The replies are #t, #f, #f, #t, #t and #t. Two symbols with the same name are the same object, so the first is #t and the second #f. Two separately built lists are different pairs, so they are not eq?, but they have the same contents, so they are equal?. The last line is #t: = compares values as numbers, and 3 and 3.0 are the same number.' },
        { check: "Two lists built separately hold the same symbols in the same order. Which test says #t?", options: ["<code>eq?</code>", "<code>equal?</code>", "<code>=</code>"], answer: 1, why: "eq? asks \"the very same object?\"; equal? asks \"same shape and contents?\"; = is for numbers only.", wrong: ["eq? asks whether the two are the very same object. Lists built separately are different pairs, even with equal contents, so eq? gives #f.", null, "= is for numbers, not for comparing the contents of lists. equal? is the test for structures."] },
        `<p><code>equal?</code> is not magic either. Two things are equal if both are pairs whose <code>car</code>s are equal and whose <code>cdr</code>s are equal, or if neither is a pair and they are <code>eq?</code>. That is a recursive definition, so it becomes a recursive procedure that walks two trees at once, like Lesson 7's <code>count-leaves</code> (SICP exercise 2.54).</p>`,
        { play: `(define (my-equal? a b)
  (cond ((and (pair? a) (pair? b))
         (and (my-equal? (car a) (car b))
              (my-equal? (cdr a) (cdr b))))
        ((or (pair? a) (pair? b)) #f)      ; one is a pair and the other is not
        (else (eq? a b))))                  ; two non-pairs: symbols, numbers, ()

(my-equal? '(this is a list) '(this is a list))
(my-equal? '(this is a list) '(this (is a) list))
(my-equal? '(a (b c)) '(a (b c)))`, caption: '#t, #f, #t. The second pair of lists has the same symbols in the same order, but a different shape, and my-equal? notices.' },
        `<h2>Looking things up by name</h2>
<p>With symbols, a list can hold words. <code>memq</code> finds a symbol in a list, returning the rest of the list from the match, or <code>#f</code> if there is none; since any value other than <code>#f</code> counts as true (Lesson 3), it doubles as a test. A list of two-item lists is called an <em>association list</em>, the traditional Lisp dictionary, and the built-in <code>assoc</code> finds the entry whose first item matches. Here is the small Ojibwe word list that also appears in the Python course. Predict what each lookup gives, and what a missing word gives.</p>`,
        { play: `(memq 'apple '(pear banana apple cherry))
(memq 'kiwi '(pear banana apple cherry))

(define ojibwe
  '((boozhoo hello)
    (miigwech thank-you)
    (makwa bear)
    (nibi water)))

(assoc 'makwa ojibwe)
(assoc 'mitig ojibwe)

(define (translate word)
  (let ((entry (assoc word ojibwe)))
    (if entry
        (cadr entry)
        'unknown)))

(translate 'nibi)
(translate 'mitig)`, predict: true, caption: 'The first two lookups give (apple cherry), then #f. The whole dictionary is quoted once, so every word inside it is a symbol. assoc returns the whole entry (makwa bear), or #f; translate turns that into water or unknown.' },
        `<h2>Expressions are lists</h2>
<p>Here is the payoff, and the reason Lisp's syntax looks the way it does. Every Lisp expression is written as a list. So the expression <code>(+ (* 2 x) 3)</code>, quoted, is a list whose <code>car</code> is the symbol <code>+</code>, whose second item is the list <code>(* 2 x)</code>, and whose third item is 3. A program can take such an expression apart with <code>car</code> and <code>cdr</code>, ask questions about it, and build new expressions with <code>list</code>. Predict each reply in the box below.</p>`,
        { play: `(define expr '(+ (* 2 x) 3))
(car expr)
(cadr expr)
(caddr expr)

(define (sum? e)
  (and (pair? e) (eq? (car e) '+)))

(sum? expr)
(sum? (cadr expr))
(sum? 'x)
(sum? 42)

(list '* 'x (list '+ 'y 1))`, predict: true, caption: 'The first three replies are +, (* 2 x) and 3. sum? checks pair? first, so that (sum? 42) is #f instead of an error when it takes the car. The last line builds a brand-new expression, (* x (+ y 1)), out of symbols.' },
        `<h2>Running code you have built</h2>
<p>If an expression is a list, and a program can build lists, can a program build an expression and then run it? Yes. The procedure <code>eval</code> takes a list, treats it as an expression, and evaluates it.</p>
<div class="stmt"><p><span class="kind">Rule (eval).</span> <code>(eval <i>expression</i> system-global-environment)</code> evaluates the value of <i>expression</i> as if it had been typed as a program. (In MIT Scheme the second argument says which environment to use; on this site expressions are always evaluated in the global one.)</p></div>
<p>Predict what the second and third lines of the box give.</p>`,
        { play: `(define expr (list '+ 1 (list '* 2 3)))
expr
(eval expr system-global-environment)

(define (repeat x n)                   ; a list of n copies of x
  (if (= n 0) '() (cons x (repeat x (- n 1)))))

(define (make-power-expr base n)       ; build (* base base ... base)
  (cons '* (repeat base n)))

(define e (make-power-expr 2 10))
e
(eval e system-global-environment)`, predict: true, caption: 'expr is the list (+ 1 (* 2 3)), and evaluating it gives 7. make-power-expr writes a program: the expression (* 2 2 2 2 2 2 2 2 2 2), which eval then runs, giving 1024.' },
        { check: "Why can a Scheme program build and run another expression?", options: ["Because Scheme is interpreted", "Because expressions are lists, so programs can take them apart and build them; eval runs one", "It cannot"], answer: 1, why: "Code is data. A quoted expression is a list of symbols, and eval evaluates it as if typed in.", wrong: ["Being interpreted is not the reason. The reason is that expressions are lists, which a program can take apart and build, and eval evaluates one.", null, "It can: eval takes a list and evaluates it as if it had been typed in. The final project is built on that."] },
        `<p>This is the loop at the heart of Lisp: code is data, data can be code. The interpreter running on this page is a program that takes lists and evaluates them, and SICP's fourth chapter writes a complete Scheme interpreter in Scheme, in a few pages. Compilers, computer algebra systems and proof checkers are all this idea, scaled up. The final project scales it up just far enough to do calculus.</p>
<h2>Before the exercises</h2>
<p>The first exercise walks a list of symbols, comparing each with <code>eq?</code>, in Lesson 7's shape with a match case and a miss case. The second builds the vocabulary the project needs: procedures that recognise, take apart and build expressions, exactly like <code>sum?</code> above. Here is a worked example of both skills, for expressions of the form <code>(- a b)</code>. Predict the replies of the box.</p>`,
        { play: `(define (remove-symbol sym items)        ; the shape of the first exercise, for a different job
  (cond ((null? items) '())
        ((eq? sym (car items)) (remove-symbol sym (cdr items)))
        (else (cons (car items) (remove-symbol sym (cdr items))))))

(remove-symbol 'x '(x y x z))

(define (make-difference a b) (list '- a b))
(define (difference? e) (and (pair? e) (eq? (car e) '-)))
(define (minuend e) (cadr e))
(define (subtrahend e) (caddr e))

(define d (make-difference 'x 5))
d
(difference? d)
(subtrahend d)`, predict: true, caption: 'remove-symbol drops every x, giving (y z). Then a constructor, a recognizer and two selectors for differences: d is (- x 5), and its subtrahend is 5.' },
        { aside: `<p><b>Common mistakes in this lesson.</b> Forgetting to quote a symbol in a comparison: <code>(eq? (car e) +)</code> compares with the addition procedure, not the symbol <code>+</code>. Using <code>=</code> on symbols; it is for numbers. Using <code>eq?</code> on lists built separately, when <code>equal?</code> was meant. Quoting something that should be evaluated: <code>'(list 1 2)</code> is a three-item list beginning with the symbol <code>list</code>. Taking <code>car</code> of something that might not be a pair; test <code>pair?</code> first.</p>` },
        {
          ex: {
            id: 'ls-10-1', title: 'Counting a symbol',
            prompt: `<p>Define <code>(count-symbol sym items)</code>, which returns how many times the symbol <code>sym</code> appears in the flat list <code>items</code>. Use <code>eq?</code> and Lesson 7's shape, with a match case and a miss case.</p>`,
            starter: `(define (count-symbol sym items)\n  ...)\n\n(count-symbol 'a '(a b a c a))`,
            solution: `(define (count-symbol sym items)\n  (cond ((null? items) 0)\n        ((eq? sym (car items))\n         (+ 1 (count-symbol sym (cdr items))))\n        (else (count-symbol sym (cdr items)))))\n\n(count-symbol 'a '(a b a c a))`,
            hints: ['Empty list: 0.', 'If (eq? sym (car items)), add 1 to the count for the rest; otherwise the answer is just the count for the rest.'],
            tests: [{ call: "(count-symbol 'a '(a b a c a))", expect: '3' }, { call: "(count-symbol 'z '(a b c))", expect: '0' }, { call: "(count-symbol 'x '())", expect: '0' }, { call: "(count-symbol 'nibi '(nibi nibi))", expect: '2' }, { call: "(count-symbol '+ '(+ 1 + 2))", expect: '2' }],
            mustContain: [{ re: /\(eq\?/, msg: 'Compare symbols with eq?.' }],
            followup: 'The last test counts the symbol + in a list: symbols can be any name, including the names of procedures, and quoting makes them data.'
          }
        },
        {
          ex: {
            id: 'ls-10-2', title: 'Representing sums and products',
            prompt: `<p>The project needs eight small procedures to recognise, take apart and build algebraic expressions written as lists. A sum is a list beginning with the symbol <code>+</code>; its <em>addend</em> is the second item and its <em>augend</em> the third. A product is the same with <code>*</code>, and its parts are the <em>multiplier</em> and <em>multiplicand</em>. The constructors build the list: <code>(make-sum 'a 'b)</code> is <code>(+ a b)</code>. Follow the pattern of the difference procedures above.</p>`,
            starter: `(define (make-sum a1 a2) ...)\n(define (make-product m1 m2) ...)\n\n(define (sum? x) ...)\n(define (addend s) ...)\n(define (augend s) ...)\n\n(define (product? x) ...)\n(define (multiplier p) ...)\n(define (multiplicand p) ...)\n\n(make-sum 'x 3)\n(sum? '(+ x 3))\n(addend '(+ x 3))\n(multiplicand '(* 2 y))`,
            solution: `(define (make-sum a1 a2) (list '+ a1 a2))\n(define (make-product m1 m2) (list '* m1 m2))\n\n(define (sum? x) (and (pair? x) (eq? (car x) '+)))\n(define (addend s) (cadr s))\n(define (augend s) (caddr s))\n\n(define (product? x) (and (pair? x) (eq? (car x) '*)))\n(define (multiplier p) (cadr p))\n(define (multiplicand p) (caddr p))\n\n(make-sum 'x 3)\n(sum? '(+ x 3))\n(addend '(+ x 3))\n(multiplicand '(* 2 y))`,
            hints: ["A constructor builds a three-item list: (list '+ a1 a2). Do not forget the quote on +.", "(sum? x) must first check (pair? x), so that (sum? 3) is #f and not an error, then compare (car x) with '+ using eq?.", 'addend is (cadr s); augend is (caddr s). The product selectors have the same shape.'],
            tests: [{ call: "(make-sum 'a 'b)", expect: '(+ a b)' }, { call: "(make-product 2 'x)", expect: '(* 2 x)' }, { call: "(sum? '(+ x 3))", expect: '#t' }, { call: "(sum? '(* x 3))", expect: '#f' }, { call: "(sum? 'x)", expect: '#f' }, { call: '(sum? 7)', expect: '#f' }, { call: "(product? '(* x y))", expect: '#t' }, { call: "(addend '(+ x 3))", expect: 'x' }, { call: "(augend '(+ x 3))", expect: '3' }, { call: "(multiplier '(* 2 y))", expect: '2' }, { call: "(multiplicand '(* 2 y))", expect: 'y' }, { call: "(augend (make-sum (make-product 2 'x) 'y))", expect: 'y' }],
            failTip: 'If (sum? 7) gives an error about car, check pair? before taking the car. If make-sum gives an error about an unbound variable, the + needs a quote.',
            followup: 'Try (eval (make-sum 2 (make-product 3 4)) system-global-environment): the expression you built, (+ 2 (* 3 4)), runs and gives 14.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li><code>(quote d)</code>, written <code>'d</code>, gives <i>d</i> unevaluated: <code>'x</code> is a symbol and <code>'(+ 1 2)</code> is a list.</li>
<li><code>=</code> compares numbers, <code>eq?</code> symbols and identical objects, <code>equal?</code> shapes and contents; <code>equal?</code> is itself a tree recursion.</li>
<li><code>memq</code> and <code>assoc</code> find things by name; an association list is a simple dictionary.</li>
<li>Expressions are lists, so programs can take them apart and build them; <code>eval</code> runs one. Code is data.</li>
<li>Today's question: the quote stops evaluation and gives the thing itself, so a quoted expression is a plain list of symbols and numbers. That is why a program can be data.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-14', '3B-AP-15'],
      standard: 1, title: 'Project: symbolic differentiation', summary: 'A program that does calculus on expressions, SICP\u2019s classic demonstration of code as data: wishful thinking, abstraction barriers, smart constructors, and a check of the symbolic answer against Lesson 8\u2019s numerical one.',
      blocks: [
        `<p>In the 1960s, researchers at MIT wrote programs that could do algebra and calculus with symbols, the way a person does with pencil and paper: not "the slope at 5 is 75.0001", but "the derivative of <i>x</i>³ is 3<i>x</i>²". They wrote them in Lisp, because in Lisp an expression is already a list that a program can take apart, and their descendants still run inside computer algebra systems today. This project builds the heart of one: a procedure <code>deriv</code> that takes an algebraic expression and a variable, and returns the derivative, symbolically, as another expression. It comes from SICP §2.3.2, and it fits on one screen. So how can a program find the derivative of an expression it has never seen before?</p>
<p>If you have not met derivatives, do not worry: you need only the five rules in this table, and the program is a direct copy of them. If you have, notice that the program does exactly what you do by hand.</p>
<div class="tbl-wrap"><table>
<tr><th>expression</th><th>derivative with respect to <i>x</i></th></tr>
<tr><td>a number <i>c</i></td><td>0</td></tr>
<tr><td><i>x</i> itself</td><td>1</td></tr>
<tr><td>any other variable <i>y</i></td><td>0</td></tr>
<tr><td><i>u</i> + <i>v</i></td><td>d<i>u</i>/d<i>x</i> + d<i>v</i>/d<i>x</i></td></tr>
<tr><td><i>u</i> · <i>v</i></td><td><i>u</i> · d<i>v</i>/d<i>x</i> + d<i>u</i>/d<i>x</i> · <i>v</i></td></tr>
</table></div>
<p>Look at the shape of the table. The first three rows handle expressions that contain no smaller expression, and the last two define the derivative of a compound expression in terms of the derivatives of its parts. That is a recursive definition over the structure of expressions, just as Lesson 7's template followed the structure of lists, and Lesson 7's <code>count-leaves</code> the structure of trees. So the procedure will be structural recursion, and it will stop for the same reason: each recursive call is on a smaller part of the expression.</p>
<h2>Representing expressions</h2>
<p>Expressions are written the way Lisp already writes them: <i>a</i> + <i>b</i> is <code>(+ a b)</code>, <i>a</i> · <i>b</i> is <code>(* a b)</code>, and a variable is a symbol. So <i>ax</i> + <i>b</i> is <code>'(+ (* a x) b)</code>. You wrote the procedures that recognise, take apart and build sums and products in Lesson 10; they are in the starters below. Two more are needed, for variables. Predict the four replies in the box.</p>`,
        { play: `(define (variable? x) (symbol? x))

(define (same-variable? v1 v2)
  (and (variable? v1) (variable? v2) (eq? v1 v2)))

(variable? 'x)
(variable? 3)
(same-variable? 'x 'x)
(same-variable? 'x 'y)`, predict: true, caption: 'The replies are #t, #f, #t, #f. A variable is any symbol, and two variables are the same when they are the same symbol.' },
        { check: "Why is <code>deriv</code> naturally recursive?", options: ["Because expressions are long", "Because the derivative of a sum or product is built from the derivatives of its parts", "Because Scheme has no loops"], answer: 1, why: "The rules of calculus are themselves recursive: differentiate the parts, then combine.", wrong: ["Length has nothing to do with it. deriv is recursive because the rules for sums and products are written in terms of the derivatives of their parts.", null, "Scheme does use recursion where other languages use loops, but that is not why deriv needs it. Even with loops available, the derivative of a nested expression is built from the derivatives of its parts."] },
        `<h2>Wishful thinking</h2>
<p>SICP's method is to write <code>deriv</code> first, as if the procedures for recognising, taking apart and building expressions already existed, and to write those afterwards. The algorithm then talks only about sums and products, never about lists. Each <code>cond</code> clause is one row of the table.</p>`,
        { code: `(define (deriv exp var)
  (cond ((number? exp) 0)
        ((variable? exp)
         (if (same-variable? exp var) 1 0))
        ((sum? exp)
         (make-sum (deriv (addend exp) var)
                   (deriv (augend exp) var)))
        ((product? exp)
         (make-sum
           (make-product (multiplier exp)
                         (deriv (multiplicand exp) var))
           (make-product (deriv (multiplier exp) var)
                         (multiplicand exp))))
        (else (error "unknown expression type" exp))))`, caption: 'The whole algorithm. It is recursive because the rules are: the derivative of a sum or product is built from the derivatives of its parts.' },
        `<p>Notice what <code>deriv</code> does <em>not</em> contain: no <code>car</code>, no <code>cdr</code>, no <code>list</code>, no quote marks. Everything it knows about how expressions are stored is behind the eight procedures of Lesson 10. SICP calls that dividing line an <em>abstraction barrier</em>: above it, the program thinks about sums and products; below it, about pairs. The second half of the project exploits the barrier to improve the program without touching <code>deriv</code> at all.</p>
<details class="reveal"><summary>Predict: with the plain constructors from Lesson 10, what does <code>(deriv '(+ x 3) 'x)</code> return?</summary><p><code>(+ 1 0)</code>. The derivative of <code>x</code> is 1, of <code>3</code> is 0, and <code>make-sum</code> builds a list from them without thinking. The answer is correct, since 1 + 0 is the derivative, but it is not simplified. The second half of the project fixes that.</p></details>`,
        {
          ex: {
            id: 'ls-11-1', title: 'Finish deriv',
            prompt: `<p>The representation procedures and the first two clauses of <code>deriv</code> are given. Complete the <code>sum?</code> and <code>product?</code> clauses from the table. Then watch it work.</p>`,
            starter: `(define (variable? x) (symbol? x))\n(define (same-variable? v1 v2)\n  (and (variable? v1) (variable? v2) (eq? v1 v2)))\n\n(define (make-sum a1 a2) (list '+ a1 a2))\n(define (make-product m1 m2) (list '* m1 m2))\n(define (sum? x) (and (pair? x) (eq? (car x) '+)))\n(define (addend s) (cadr s))\n(define (augend s) (caddr s))\n(define (product? x) (and (pair? x) (eq? (car x) '*)))\n(define (multiplier p) (cadr p))\n(define (multiplicand p) (caddr p))\n\n(define (deriv exp var)\n  (cond ((number? exp) 0)\n        ((variable? exp) (if (same-variable? exp var) 1 0))\n        ((sum? exp) ...)\n        ((product? exp) ...)\n        (else (error "unknown expression type" exp))))\n\n(deriv '(+ x 3) 'x)\n(deriv '(* x y) 'x)`,
            solution: `(define (variable? x) (symbol? x))\n(define (same-variable? v1 v2)\n  (and (variable? v1) (variable? v2) (eq? v1 v2)))\n\n(define (make-sum a1 a2) (list '+ a1 a2))\n(define (make-product m1 m2) (list '* m1 m2))\n(define (sum? x) (and (pair? x) (eq? (car x) '+)))\n(define (addend s) (cadr s))\n(define (augend s) (caddr s))\n(define (product? x) (and (pair? x) (eq? (car x) '*)))\n(define (multiplier p) (cadr p))\n(define (multiplicand p) (caddr p))\n\n(define (deriv exp var)\n  (cond ((number? exp) 0)\n        ((variable? exp) (if (same-variable? exp var) 1 0))\n        ((sum? exp)\n         (make-sum (deriv (addend exp) var)\n                   (deriv (augend exp) var)))\n        ((product? exp)\n         (make-sum (make-product (multiplier exp)\n                                 (deriv (multiplicand exp) var))\n                   (make-product (deriv (multiplier exp) var)\n                                 (multiplicand exp))))\n        (else (error "unknown expression type" exp))))\n\n(deriv '(+ x 3) 'x)\n(deriv '(* x y) 'x)`,
            hints: ['Sum rule: (make-sum (deriv (addend exp) var) (deriv (augend exp) var)).', 'Product rule: a make-sum of two make-products: the multiplier times the derivative of the multiplicand, plus the derivative of the multiplier times the multiplicand.'],
            tests: [{ call: "(deriv 5 'x)", expect: '0' }, { call: "(deriv 'x 'x)", expect: '1' }, { call: "(deriv 'y 'x)", expect: '0' }, { call: "(deriv '(+ x 3) 'x)", expect: '(+ 1 0)' }, { call: "(deriv '(* x y) 'x)", expect: '(+ (* x 0) (* 1 y))' }, { call: "(deriv '(* (* x y) (+ x 3)) 'x)", expect: '(+ (* (* x y) (+ 1 0)) (* (+ (* x 0) (* 1 y)) (+ x 3)))' }],
            mustContain: [{ re: /\(deriv\s+\(addend/, msg: 'The sum clause should take the derivative of the addend (and the augend).' }, { re: /\(deriv\s+\(multiplicand/, msg: 'The product clause needs the derivative of the multiplicand (and of the multiplier).' }],
            followup: 'The answer for (* x y) says x · 0 + 1 · y, which is y. The program is right; it just does not tidy up after itself.'
          }
        },
        `<h2>Simplifying</h2>
<p>The answers are correct but ugly: <code>(+ (* x 0) (* 1 y))</code> is a laborious way to say <i>y</i>. Here is the elegant part. <code>deriv</code> never looks at what the constructors return, so the constructors can be made smarter <em>without changing the algorithm</em>. That is the payoff of the abstraction barrier.</p>
<p>The rules are the ones you use by hand. A sum with a 0 in it is just the other term, and a sum of two numbers is their sum. A product with a 0 in it is 0, a product with a 1 is the other factor, and a product of two numbers is their product. Why is this safe? Each rule replaces an expression by a simpler one that has the same value <em>whatever numbers the variables stand for</em>: <i>u</i> + 0 = <i>u</i> and <i>u</i> · 1 = <i>u</i> for every <i>u</i>. That is the contract a constructor must keep, and as long as it keeps it, every answer <code>deriv</code> builds still means the same derivative. A helper makes the checks tidy:</p>`,
        { code: `(define (=number? exp num)
  (and (number? exp) (= exp num)))`, caption: "True when exp is a number equal to num. (= 'x 0) on its own would be an error, since = accepts only numbers; and stops before reaching it." },
        { check: "Why check <code>(number? exp)</code> before <code>(= exp 0)</code>?", options: ["For speed", "= accepts only numbers; and stops at the false number? test before = is reached", "It makes no difference"], answer: 1, why: "Short-circuit and protects the comparison from a symbol.", wrong: ["Speed is not the point. = accepts only numbers, and the check is there to stop it ever being given a symbol such as x.", null, "It matters whenever exp is a symbol or a list: (= 'x 0) is an error, while and stops at the false (number? 'x) and gives #f."] },
        {
          ex: {
            id: 'ls-11-2', title: 'Smarter constructors',
            prompt: `<p>Rewrite <code>make-sum</code> and <code>make-product</code> to simplify as described, using <code>cond</code> and <code>=number?</code>. Nothing else changes. When you are done, <code>(deriv '(* x y) 'x)</code> should give <code>y</code>.</p>`,
            starter: `(define (variable? x) (symbol? x))\n(define (same-variable? v1 v2)\n  (and (variable? v1) (variable? v2) (eq? v1 v2)))\n(define (=number? exp num) (and (number? exp) (= exp num)))\n\n(define (make-sum a1 a2)\n  (cond ...))\n\n(define (make-product m1 m2)\n  (cond ...))\n\n(define (sum? x) (and (pair? x) (eq? (car x) '+)))\n(define (addend s) (cadr s))\n(define (augend s) (caddr s))\n(define (product? x) (and (pair? x) (eq? (car x) '*)))\n(define (multiplier p) (cadr p))\n(define (multiplicand p) (caddr p))\n\n(define (deriv exp var)\n  (cond ((number? exp) 0)\n        ((variable? exp) (if (same-variable? exp var) 1 0))\n        ((sum? exp)\n         (make-sum (deriv (addend exp) var)\n                   (deriv (augend exp) var)))\n        ((product? exp)\n         (make-sum (make-product (multiplier exp)\n                                 (deriv (multiplicand exp) var))\n                   (make-product (deriv (multiplier exp) var)\n                                 (multiplicand exp))))\n        (else (error "unknown expression type" exp))))\n\n(deriv '(+ x 3) 'x)\n(deriv '(* x y) 'x)\n(deriv '(* (* x y) (+ x 3)) 'x)`,
            solution: `(define (variable? x) (symbol? x))\n(define (same-variable? v1 v2)\n  (and (variable? v1) (variable? v2) (eq? v1 v2)))\n(define (=number? exp num) (and (number? exp) (= exp num)))\n\n(define (make-sum a1 a2)\n  (cond ((=number? a1 0) a2)\n        ((=number? a2 0) a1)\n        ((and (number? a1) (number? a2)) (+ a1 a2))\n        (else (list '+ a1 a2))))\n\n(define (make-product m1 m2)\n  (cond ((or (=number? m1 0) (=number? m2 0)) 0)\n        ((=number? m1 1) m2)\n        ((=number? m2 1) m1)\n        ((and (number? m1) (number? m2)) (* m1 m2))\n        (else (list '* m1 m2))))\n\n(define (sum? x) (and (pair? x) (eq? (car x) '+)))\n(define (addend s) (cadr s))\n(define (augend s) (caddr s))\n(define (product? x) (and (pair? x) (eq? (car x) '*)))\n(define (multiplier p) (cadr p))\n(define (multiplicand p) (caddr p))\n\n(define (deriv exp var)\n  (cond ((number? exp) 0)\n        ((variable? exp) (if (same-variable? exp var) 1 0))\n        ((sum? exp)\n         (make-sum (deriv (addend exp) var)\n                   (deriv (augend exp) var)))\n        ((product? exp)\n         (make-sum (make-product (multiplier exp)\n                                 (deriv (multiplicand exp) var))\n                   (make-product (deriv (multiplier exp) var)\n                                 (multiplicand exp))))\n        (else (error "unknown expression type" exp))))\n\n(deriv '(+ x 3) 'x)\n(deriv '(* x y) 'x)\n(deriv '(* (* x y) (+ x 3)) 'x)`,
            hints: ['make-sum has four cases: a1 is 0; a2 is 0; both are numbers; otherwise build the list.', "make-product has five: either factor is 0 (use or); m1 is 1; m2 is 1; both are numbers; otherwise (list '* m1 m2).", 'Order matters: check for zero before one, and check the numeric cases before falling through to building a list.'],
            tests: [{ call: "(make-sum 0 'y)", expect: 'y' }, { call: '(make-sum 2 3)', expect: '5' }, { call: "(make-sum 'x 'y)", expect: '(+ x y)' }, { call: "(make-product 0 'y)", expect: '0' }, { call: "(make-product 'x 1)", expect: 'x' }, { call: '(make-product 3 4)', expect: '12' }, { call: "(deriv '(+ x 3) 'x)", expect: '1' }, { call: "(deriv '(* x y) 'x)", expect: 'y' }, { call: "(deriv '(* (* x y) (+ x 3)) 'x)", expect: '(+ (* x y) (* y (+ x 3)))' }, { call: "(deriv '(+ (* 3 (* x x)) (* 2 x)) 'x)", expect: '(+ (* 3 (+ x x)) 2)' }],
            failTip: 'If (make-product 0 1) gives 1 instead of 0, the zero test must come before the one tests.',
            followup: 'You have written a small computer algebra system in about thirty lines, and the algorithm did not change at all between the two exercises.'
          }
        },
        `<h2>Checking the answer two ways</h2>
<p>Lesson 8 computed derivatives a completely different way, numerically: (<i>g</i>(<i>x</i> + <i>dx</i>) − <i>g</i>(<i>x</i>))/<i>dx</i> for a tiny <i>dx</i>. Now there are two independent methods, and they had better agree. Lesson 10's <code>eval</code> lets us check: to find the value of a symbolic derivative at <i>x</i> = 5, wrap it in <code>(let ((x 5)) …)</code> and evaluate that. Here is <i>x</i>³, written as <code>(* x (* x x))</code>, done both ways. First the symbolic way. Predict the value of the derivative at 5 before you run the box.</p>`,
        { play: `(define (variable? x) (symbol? x))
(define (same-variable? v1 v2) (and (variable? v1) (variable? v2) (eq? v1 v2)))
(define (=number? exp num) (and (number? exp) (= exp num)))
(define (make-sum a1 a2)
  (cond ((=number? a1 0) a2) ((=number? a2 0) a1)
        ((and (number? a1) (number? a2)) (+ a1 a2)) (else (list '+ a1 a2))))
(define (make-product m1 m2)
  (cond ((or (=number? m1 0) (=number? m2 0)) 0) ((=number? m1 1) m2) ((=number? m2 1) m1)
        ((and (number? m1) (number? m2)) (* m1 m2)) (else (list '* m1 m2))))
(define (sum? x) (and (pair? x) (eq? (car x) '+)))
(define (addend s) (cadr s))  (define (augend s) (caddr s))
(define (product? x) (and (pair? x) (eq? (car x) '*)))
(define (multiplier p) (cadr p))  (define (multiplicand p) (caddr p))
(define (deriv exp var)
  (cond ((number? exp) 0)
        ((variable? exp) (if (same-variable? exp var) 1 0))
        ((sum? exp) (make-sum (deriv (addend exp) var) (deriv (augend exp) var)))
        ((product? exp)
         (make-sum (make-product (multiplier exp) (deriv (multiplicand exp) var))
                   (make-product (deriv (multiplier exp) var) (multiplicand exp))))
        (else (error "unknown expression type" exp))))
(define d (deriv '(* x (* x x)) 'x))
d
(define (value-at e x0) (eval (list 'let (list (list 'x x0)) e) system-global-environment))
(value-at d 5)`, predict: true, caption: 'The symbolic derivative d is (+ (* x (+ x x)) (* x x)), which is 2x² + x², that is 3x², and at 5 it gives exactly 75. value-at wraps the expression in a let that gives x the value 5, and eval runs it. The long block of definitions is the finished program from the two exercises, with a few short definitions put on one line.' },
        `<p>Now the numerical way, from Lesson 8, for the same function and the same point.</p>`,
        { play: `(define dx 0.00001)
(define (numeric-deriv g)
  (lambda (x) (/ (- (g (+ x dx)) (g x)) dx)))
((numeric-deriv (lambda (x) (* x (* x x)))) 5)`, caption: 'The numerical method gives 75.0001499966, close to the exact 75 but not equal to it, because dx is small and not zero. Two methods with nothing in common agree, which is strong evidence that both are right.' },
        { check: "The symbolic derivative at 5 gives exactly 75 and the numerical one gives 75.00015. What does the agreement show?", options: ["That the numerical method is wrong", "Strong evidence both are right: two independent methods agree", "Nothing"], answer: 1, why: "Methods with nothing in common rarely share a mistake. Agreement is how you check a program when there is no answer key.", wrong: ["The two differ by about 0.00015 because the numerical method uses a small dx, not zero. That is expected from an approximation, and agreement to several digits is evidence in favour of both.", null, "Agreement does show something. Two methods with nothing in common are unlikely to share the same mistake, so matching answers make an error in either one unlikely."] },
        `<p>The comparison also shows what each method is good for. The numerical derivative works for any procedure, even one whose formula you do not know, but it is only approximate. The symbolic derivative is exact and gives a formula you can read, but it needs the expression, and it knows only the rules you gave it.</p>
<h2>Stretch goals</h2>
<p>Each of these extends the program without changing the part of <code>deriv</code> you already have, only adding to it. The first is SICP exercise 2.56: represent <i>u</i><sup><i>n</i></sup> as <code>(** u n)</code> for a number <i>n</i>, and add the rule that its derivative is <i>n</i> · <i>u</i><sup><i>n</i>−1</sup> · d<i>u</i>/d<i>x</i>; that needs a predicate, two selectors, a constructor and one new <code>cond</code> clause. The second is exercise 2.57: let sums and products take any number of terms, so that <code>(+ x y z)</code> works, by changing only <code>augend</code> and <code>multiplicand</code> (the augend of a three-term sum is the sum of the last two). The third is a <code>simplify</code> procedure that rebuilds any expression through the smart constructors, so that <code>(simplify '(+ (* 1 x) 0))</code> is <code>x</code>.</p>
<h2>Where to go from here</h2>
<p>So how does a program differentiate an expression it has never seen? It follows the five rules of the table, recursively, on a representation that it reaches only through constructors and selectors; and because of that barrier you could make its answers tidier without touching the algorithm.</p>
<p>You have now seen the arc of SICP's first two chapters in miniature: expressions and their evaluation, procedures and the processes they generate, data built from pairs, higher-order procedures, and finally symbolic data, a program reasoning about expressions. The book goes on to assignment and state, streams, and, in chapter 4, the <em>metacircular evaluator</em>: a Scheme interpreter written in Scheme, in a few pages. The interpreter running on these pages is that idea, written in JavaScript instead.</p>
<p>If the <a href="#/python">Python course</a> felt like learning to write and Lisp felt like learning to think, the <a href="#/cpp">C++ short course</a> is learning how the machine actually does it.</p>`
      ]
    }
  ]
});
