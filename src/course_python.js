// Lesson content, (c) 2026 Michael Sayers, licensed CC BY-SA 4.0 (see LICENSE-CONTENT.md).
window.COURSES = window.COURSES || [];
window.COURSES.push({
  id: 'python', code: 'SC 101', short: 'Python', lang: 'python', standard: 1,
  title: 'Introduction to Python',
  grades: 'Grades 8–12 · no experience needed · start here',
  audience: `<p><b>Grades 8–12.</b> No programming experience needed, and no math beyond arithmetic and a little algebra. This is the course to start with: it teaches every core idea at a gentle pace, and several other courses here assume you have seen them once.</p><p>Each lesson is a self-contained Hour of Code activity. Pick any lesson for a one-off session, or do all sixteen as a course: twelve lessons, three checkpoints and a project.</p>`,
  tagline: 'Sixteen short lessons, with a checkpoint after every four, that take you from your first line of code to writing — and breaking — a real cipher.',
  description: `<p>Python reads almost like English, and it lets you try an idea in seconds. That makes it the friendliest place to learn what programming really is: giving a machine precise, step-by-step instructions, then watching what it does with them.</p>
<p>Every lesson here has code you can run and change right on the page. Each one starts with a small idea, lets you predict what code will do before you run it, and ends with exercises that check your answer and tell you exactly what to fix. Nobody learns all of Python in sixteen lessons, but by the end you will have written real programs, hunted down bugs, run simulations, and built a project from a description. After every four lessons comes a <b>checkpoint</b>: no new ideas, just mixed questions that make you choose between things that look alike. That is enough to take on any fuller course with confidence.</p>`,
  howItWorks: `<h3>How these pages work</h3><p>Every code block has a <b>Run</b> button. Change the code and run it again: that is the whole method. Some examples ask you to write down what you think the program will print before it runs; do it, because a wrong guess that you then correct is remembered better than a right answer you were given. Exercises have a <b>Check answer</b> button that runs your code against hidden tests and tells you exactly what it expected. Hints are progressive, and a solution is available once you have had two tries. Your progress and code are saved in this browser only; nothing is sent anywhere.</p><p><b>Quick checks</b> ask how sure you are before they mark you, and they come back on the Review page after a day and then after longer gaps. Each check is tied to one of the course&rsquo;s named <b>skills</b>, and the skills map on this page shows which are not started, being practised or secure. Lessons 5, 10 and 15 are <b>checkpoints</b>: no new ideas, just mixed questions on the four lessons before them. Lesson 16 is the project.</p>`,
  outcomes: [
    'Read and write short Python programs using variables, conditions and loops',
    'Work comfortably with lists, strings and dictionaries',
    'Break a problem into functions, and read an error message without panicking',
    'Use randomness to run a simulation and answer a "how likely is it?" question',
    'Explain and implement recursion, linear search, binary search and a simple sort',
    'Build a small, complete project from a description',
    'Choose the right construct for a problem, such as for or while, a list or a dictionary, return or print'
  ],
  // The named skills of the course (LESSON_STANDARD.md §4). Each quick check and exercise names the skill it practises; the skills map on
  // the course page and on #/today shows each as not started, practising or secure. Checkpoints are lessons 5, 10 and 15.
  skills: [
    { id: 'values-types', name: 'Tell int, float, str and bool apart' },
    { id: 'arithmetic', name: 'Calculate with /, //, % and **' },
    { id: 'assignment', name: 'Read = as "becomes", not "equals"' },
    { id: 'error-stages', name: 'Say when Python reports each kind of error' },
    { id: 'indentation', name: 'Use indentation to mark a block' },
    { id: 'boolean-logic', name: 'Ask True/False questions with ==, and, or, not' },
    { id: 'branching', name: 'Choose with if, elif and else' },
    { id: 'for-range', name: 'Repeat with for and range' },
    { id: 'accumulator', name: 'Build a total, count or best-so-far in a loop' },
    { id: 'while-loops', name: 'Repeat while a condition holds' },
    { id: 'list-index', name: 'Find list items by position' },
    { id: 'slicing', name: 'Cut out part of a list or string with a slice' },
    { id: 'aliasing', name: 'Change a list in place, and know when names share it' },
    { id: 'string-immutable', name: 'Know that a string never changes' },
    { id: 'text-handling', name: 'Split, join and clean up text' },
    { id: 'return-vs-print', name: 'Make a function return a value, not just show it' },
    { id: 'parameters-scope', name: 'Pass arguments and know which names a function sees' },
    { id: 'tests', name: 'Choose tests that can expose a bug' },
    { id: 'try-except', name: 'Catch an error you expect with try and except' },
    { id: 'dict-basics', name: 'Store and look up values by key' },
    { id: 'dict-get', name: 'Count with a dictionary and get' },
    { id: 'random-module', name: 'Use randint, choice, shuffle and seeds' },
    { id: 'simulation', name: 'Estimate a probability by simulation' },
    { id: 'base-case', name: 'Write recursion with a base case and progress' },
    { id: 'recursion-cost', name: 'Spot when recursion repeats work' },
    { id: 'binary-search', name: 'Search a sorted list by halving it' },
    { id: 'sorting', name: 'Sort a list, and say how the work grows' },
    { id: 'char-codes', name: 'Turn letters into numbers and back with ord and chr' },
    { id: 'cracking', name: 'Break a cipher by trying keys and counting letters' }
  ],
  lessons: [
    /* ================================================================== */
    {
      standards: ['2-AP-11', '7.3.6.3'], standard: 1,
      title: 'Hello, Python', summary: 'What a program is, your first lines of Python, the kinds of values Python works with, and how to give a value a name.',
      blocks: [
        `<p>In 1843, a century before the first electronic computer, Ada Lovelace published a step-by-step method for a machine that had not been built, Charles Babbage's Analytical Engine, to calculate a sequence of numbers called the Bernoulli numbers. It is often called the first computer program. Everything since, from phone apps to spacecraft, is the same idea: a list of exact instructions for a machine that does precisely what it is told. The language in this course was released in 1991 by Guido van Rossum, who named it not after the snake but after the British comedy show <i>Monty Python's Flying Circus</i>, which is why so many Python examples mention spam.</p>
<p>A machine like that cannot guess what you meant. So what do you have to write down, and how, for it to do exactly what you intend?</p>`,
        { photo: ['ada-lovelace', 'lovelace-note-g'], caption: "Ada Lovelace, painted around 1840, and her table from Note G, published in 1843, which lists each operation the Analytical Engine would carry out to compute a Bernoulli number." },
        `<p>A <em>program</em> is a list of instructions written in a language a computer can follow. Python is one such language. It was designed to read almost like English, but there is one big difference from English: the computer follows your instructions <em>exactly</em>, and it follows them in order, from the top line to the bottom. It does not guess what you meant. This lesson is about writing instructions clearly enough that the computer does what you intend.</p>
<h2>Your first program</h2>
<p>Below is a complete Python program of two lines. Read it first, and predict what will appear. Then press <b>Run</b>.</p>`,
        { predict: true, play: `print("Hello, world!")
print("I am a program.")`, caption: 'Two lines, in the order they are written: <code>Hello, world!</code> and then <code>I am a program.</code>. The quotes are not printed; they only mark where the text starts and ends. Change the words inside the quotes, or add a third line that prints something else, and run it again.' },
        `<p>Each line is one <em>instruction</em>, also called a <em>statement</em>. Python carried out line 1, then line 2, and then it was finished. Look at what one line is made of:</p>
<div class="tbl-wrap"><table>
<tr><th>piece</th><th>what it is</th></tr>
<tr><td><code>print</code></td><td>the name of an action Python knows: show something on the screen</td></tr>
<tr><td><code>(</code> … <code>)</code></td><td>the parentheses hold what the action is applied to</td></tr>
<tr><td><code>"Hello, world!"</code></td><td>a piece of text; the quotes mark where it starts and ends</td></tr>
</table></div>
<p>A named action like <code>print</code> is called a <em>function</em>. You <em>call</em> a function by writing its name followed by parentheses, and what you put inside the parentheses is what it works on. A piece of text in quotes is called a <em>string</em> (as in a string of characters). The quotes are not printed; they only tell Python "this is text, not an instruction".</p>
<details class="reveal"><summary>Predict: what happens if you write <code>print(Hello)</code> with no quotes?</summary><p>Python does not print the word. Without quotes, <code>Hello</code> is not text; it is a <em>name</em>, and Python looks for something called <code>Hello</code>, finds nothing, and stops with the message <code>NameError: name 'Hello' is not defined</code>. Try it in the box above. Errors like this are not damage; they are Python telling you exactly what it could not understand. The next lesson is about reading them.</p></details>
<h2>Notes to yourself</h2>
<p>Anything after a <code>#</code> on a line is a <em>comment</em>. Python ignores it completely. Comments are for people: they explain what the code is for, or why it is written the way it is. You will see them in every example in this course.</p>`,
        { predict: true, play: `# This whole line is a comment. Nothing happens.
print("Comments explain code.")   # a comment can also follow an instruction`, caption: 'Only <code>Comments explain code.</code> appears. Line 1 is all comment, so Python skips it; line 2 runs, and the comment at its end is skipped too. Delete the <code>#</code> from line 1 and see what Python says.' },
        `<h2>Values and their types</h2>
<p>Everything a program handles is a <em>value</em>: the text <code>"Hello"</code>, the number <code>7</code>, the answer <code>True</code>. Every value belongs to a <em>type</em>, which tells Python what the value is and what can be done with it. You can add two numbers; you cannot sensibly add a number to a piece of text. Four types come up constantly:</p>
<div class="tbl-wrap"><table>
<tr><th>type</th><th>examples</th><th>used for</th></tr>
<tr><td><code>int</code></td><td><code>7</code>, <code>-3</code>, <code>1000000</code></td><td>whole numbers (integers)</td></tr>
<tr><td><code>float</code></td><td><code>3.14</code>, <code>2.0</code>, <code>-0.5</code></td><td>numbers with a decimal point</td></tr>
<tr><td><code>str</code></td><td><code>"hello"</code>, <code>'x'</code>, <code>""</code></td><td>text (strings)</td></tr>
<tr><td><code>bool</code></td><td><code>True</code>, <code>False</code></td><td>yes/no answers (booleans)</td></tr>
</table></div>
<p>Two details worth noticing now. <code>2</code> and <code>2.0</code> are different values of different types, even though they are the same number: one is an <code>int</code>, the other a <code>float</code>. And <code>"7"</code> in quotes is text, not a number; it is the character 7, the same kind of thing as <code>"h"</code>. The function <code>type()</code> tells you the type of any value.</p>`,
        { predict: true, play: `print(type(7))
print(type(2.0))
print(type("7"))
print(type(True))`, caption: 'Four lines: <code>&lt;class \'int\'&gt;</code>, <code>&lt;class \'float\'&gt;</code>, <code>&lt;class \'str\'&gt;</code> and <code>&lt;class \'bool\'&gt;</code>. The <code>2.0</code> has a decimal point, so it is a float, and the <code>"7"</code> is in quotes, so it is text. Change 7 to "7" on the first line and run again: the first line changes to str.' },
        { skill: 'values-types', check: "What is the type of <code>\"7\"</code>, with the quotation marks?", options: ["int, a whole number", "str, a piece of text", "float, a decimal"], answer: 1, wrong: ["Looking like a number is not being one. The quotes make it text, the same kind of thing as <code>\"h\"</code>; <code>7</code> without quotes is the int.", null, "A float needs a decimal point and no quotes, like <code>7.0</code>. Quotes always make a str."], why: "Quotation marks make text, even when the characters are digits. <code>\"7\" + 1</code> is an error; <code>7 + 1</code> is 8." },
        `<h2>Arithmetic</h2>
<p>Python is a very good calculator. Adding, subtracting and multiplying work as you expect; <code>*</code> is the multiplication sign. Python works out the value of each expression and <code>print</code> shows the result. When you give <code>print</code> several things separated by commas, it prints them on one line with spaces between.</p>`,
        { play: `print(7 + 3)
print(7 - 3)
print(7 * 3)
print(7 + 3, 7 - 3, 7 * 3)    # three values, one line`, caption: 'Change the numbers. Try a very large one, such as 123456789 * 987654321: Python has no trouble with big whole numbers.' },
        `<p>Division has two forms, and the difference matters. <code>/</code> is ordinary division and always gives a <code>float</code>, even when the answer is a whole number. <code>//</code> is <em>floor division</em>: it gives the whole-number part of the answer and throws the remainder away. The remainder itself is given by <code>%</code>, which is read "mod". Predict all four lines before running.</p>
<details class="reveal"><summary>My predictions</summary><p><code>7 / 2</code> is <code>3.5</code>. <code>7 // 2</code> is <code>3</code>, because 2 goes into 7 three times. <code>7 % 2</code> is <code>1</code>, what is left over. <code>10 / 2</code> is <code>5.0</code>, not <code>5</code>, because <code>/</code> always gives a float.</p></details>`,
        { play: `print(7 / 2)
print(7 // 2)
print(7 % 2)
print(10 / 2)`, caption: 'Try 17 // 5 and 17 % 5. Then 20 % 4.' },
        { skill: 'arithmetic', check: "What does <code>print(10 / 2)</code> show?", options: ["<code>5</code>", "<code>5.0</code>", "<code>5.00</code>"], answer: 1, wrong: ["That is the answer from <code>10 // 2</code>. The single slash always gives a float, even when the division is exact, so it shows a decimal part.", null, "Python never pads a float with extra zeros: it shows the shortest form, <code>5.0</code>. Two decimals needs a format you ask for explicitly."], why: "<code>/</code> always gives a float, even when the division is exact. <code>10 // 2</code> gives the int 5." },
        `<p>The remainder operator looks odd at first, but you will use it constantly. <code>n % 2</code> is 0 exactly when <code>n</code> is even. <code>n % 10</code> is the last digit of <code>n</code>. <code>n // 60</code> and <code>n % 60</code> turn seconds into minutes and leftover seconds. One more operator: <code>**</code> means "to the power of", so <code>2 ** 10</code> is 1024.</p>
<p>Python follows the usual order of operations: powers first, then multiplication, division and remainder, then addition and subtraction, with parentheses overriding everything. <code>2 + 3 * 4</code> is 14, and <code>(2 + 3) * 4</code> is 20. When in doubt, add parentheses; they cost nothing and make your intention clear.</p>
<h2>Giving a value a name</h2>
<p>A value on its own is gone as soon as its line finishes. To keep a value and use it later, give it a <em>name</em> using <code>=</code>:</p>`,
        { code: `apples = 7`, caption: 'Read this as: the name apples now refers to the value 7.' },
        `<p>From then on, wherever you write <code>apples</code>, Python uses the value 7. Programmers call this <em>assigning</em> a value to a name, and a name that refers to a value is called a <em>variable</em>. Watch how the names are used in the lines that follow.</p>`,
        { play: `apples = 7
price = 0.5
total = apples * price
print("Apples:", apples)
print("Total cost:", total)`, caption: 'Change the number of apples on line 1 only, and run. Everything below follows from it.' },
        `<p>The most important thing to understand about <code>=</code> is that it is <em>not</em> the equals sign of mathematics. It does not state that two things are equal; it is an instruction with two steps: first work out the value on the right-hand side, then attach the name on the left to that value. Read <code>=</code> as "becomes" or "is set to". This line is the test of whether you have understood it:</p>`,
        { code: `apples = apples + 3` },
        `<p>As an equation this would be nonsense: no number equals itself plus 3. As an instruction it makes perfect sense. Step one: work out <code>apples + 3</code> using the <em>current</em> value of <code>apples</code>, which is 7, giving 10. Step two: make the name <code>apples</code> refer to 10. The old value is simply forgotten.</p>`,
        { predict: true, play: `apples = 7
print(apples)
apples = apples + 3
print(apples)
apples = apples * 2
print(apples)`, caption: '7, then 10, then 20. Each line works out the right-hand side using the value <code>apples</code> has at that moment, then makes the name refer to the result. If you expected 7, 10, 14, you used the old 7 on the last line: the name had already moved on to 10.' },
        `<p>The figure below shows what is really going on. A name is a label, and a value is a separate thing the label points at. Assigning moves the label; it never changes the value. Step through it.</p>`,
        { fig: 'names', caption: 'Step through five assignments. Names are labels that can be moved; the values they point at do not change.' },
        `<p>The rules for names: letters, digits and underscores only, no spaces, and a name cannot begin with a digit. Capital letters count as different letters, so <code>Total</code> and <code>total</code> are two different names. Beyond the rules, there is one piece of advice: choose names that say what the value means. <code>price_per_apple</code> is better than <code>p</code>, because you will read your code far more often than you write it, and so will the person helping you find a bug.</p>
<h2>Asking the person for a value</h2>
<p>So far every value was typed into the program. <code>input()</code> lets the program ask: it shows a prompt, waits for the person to type something and press Enter, and hands back what they typed. One rule to memorise today, and understand fully in the next lesson: <b>what <code>input()</code> hands back is always a string</b>, even if the person typed digits. To use it as a number, convert it with <code>int()</code> for a whole number or <code>float()</code> for a number with a decimal point.</p>
<details class="reveal"><summary>Guess first: the person types <code>1990</code>. Is the result the number 1990 or the text "1990"?</summary><p>The text <code>"1990"</code>. That is why the program below wraps <code>input()</code> in <code>int()</code>: only then can it subtract the year from 2030.</p></details>`,
        { play: `name = input("What is your name? ")
year = int(input("What year were you born? "))
print("Hello,", name)
print("In 2030 you will be about", 2030 - year)`, caption: 'Run it and type your answers into the boxes that appear. Then remove the int( ) around input on line 2 and see what Python says about line 4.' },
        `<h2>Before the exercises</h2>
<p>Each exercise below asks for a program that reads a value, calculates something, and prints a line in an exact format. The tests compare your output character by character, so <code>25 C is 77 F</code> and <code>25.0 C is 77.0 F</code> are different answers. Here is the shape of such a program, worked in full for a different problem: read a number of days and print the number of hours.</p>`,
        { play: `days = int(input("Days: "))
hours = days * 24
print(days, "days is", hours, "hours")`, caption: 'Three steps: read and convert, calculate, print. The commas in print put single spaces between the pieces.', testStdin: '3\n' },
        { skill: 'assignment', check: "After <code>x = 4</code> and then <code>x = x + 2</code>, what is <code>x</code>?", options: ["4, because <code>x = x + 2</code> is a false equation", "6", "An error: a name cannot appear on both sides"], answer: 1, wrong: ["This reads <code>=</code> as the equals sign of mathematics. It is an instruction: work out the right side first (4 + 2), then attach the name to the result.", null, "The name is allowed on both sides. On the right it means its current value; on the left it is the label being moved. Counters work this way."], why: "<code>=</code> means \"becomes\": the right side is worked out with the old value (4 + 2), and the name is attached to the result." },
        `<p>Notice how the pieces of the last line, joined by commas, produce <code>3 days is 72 hours</code> when the input is 3. Your exercises follow the same three steps.</p>`,
        `<details class="reveal"><summary>Puzzle: without running it, what does this print? <code>x = 3</code>, then <code>x = x * x</code>, then <code>x = x + 1</code>, then <code>print(x, "x")</code></summary><p><code>10 x</code>. The lines run in order, top to bottom. After the first line <code>x</code> is 3; the second works out 3 × 3 = 9 and gives <code>x</code> that value; the third works out 9 + 1 = 10. In the last line, <code>x</code> without quotes is the name, so its value is printed, while <code>"x"</code> in quotes is just the letter x.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Forgetting the quotes around text: <code>print(Hello)</code> looks for a variable called Hello. Writing <code>Print</code> or <code>PRINT</code>: Python knows only <code>print</code>. Expecting <code>10 / 2</code> to give <code>5</code>: it gives <code>5.0</code>. Reading <code>=</code> as "equals" and then being puzzled by <code>x = x + 1</code>. Forgetting that <code>input()</code> gives text, so <code>input() + 1</code> fails.</p>` },
        {
          ex: {
            id: 'py-1-1', skill: 'arithmetic', title: 'Temperature conversion',
            prompt: `<p>Write a program that converts a Celsius temperature to Fahrenheit. The formula is <em>F = C × 9/5 + 32</em>.</p>
<p>Read one number with <code>input()</code> (the test supplies it) and convert it with <code>float()</code>. Then print exactly one line in the form <code>25.0 C is 77.0 F</code>. Using <code>float()</code> is what makes the numbers print with a decimal part.</p>`,
            starter: `celsius = float(input("Celsius: "))\n# calculate fahrenheit here\n\nprint(celsius, "C is", ...)`,
            solution: `celsius = float(input("Celsius: "))\nfahrenheit = celsius * 9 / 5 + 32\nprint(celsius, "C is", fahrenheit, "F")`,
            hints: ['Multiply celsius by 9, divide by 5, then add 32, and give the result a name such as fahrenheit.', 'print(celsius, "C is", fahrenheit, "F") prints the four pieces with single spaces between them, which is exactly the required format.'],
            tests: [{ stdin: '25', expect: '25.0 C is 77.0 F' }, { stdin: '0', expect: '0.0 C is 32.0 F' }, { stdin: '-40', expect: '-40.0 C is -40.0 F' }, { stdin: '100', expect: '100.0 C is 212.0 F' }],
            failTip: 'Compare the two outputs character by character: the format must match exactly, including the spaces and the letters C and F.',
            followup: 'Go the other way: read a Fahrenheit temperature and print it in Celsius, in the form 77.0 F is 25.0 C. The formula is C = (F - 32) * 5 / 9.'
          }
        },
        {
          ex: {
            id: 'py-1-2', skill: 'arithmetic', title: 'Seconds to minutes',
            prompt: `<p>Read a whole number of seconds and print how many whole minutes it contains and how many seconds are left over, in exactly this form: <code>135 seconds is 2 minutes and 15 seconds</code>. Floor division and the remainder operator are exactly the right tools.</p>`,
            starter: `seconds = int(input("Seconds: "))\n`,
            solution: `seconds = int(input("Seconds: "))\nminutes = seconds // 60\nleft = seconds % 60\nprint(seconds, "seconds is", minutes, "minutes and", left, "seconds")`,
            hints: ['seconds // 60 gives the whole minutes; seconds % 60 gives what is left over.', 'Use int(), not float(), so the numbers print without ".0". Then print the six pieces separated by commas.'],
            tests: [{ stdin: '135', expect: '135 seconds is 2 minutes and 15 seconds' }, { stdin: '60', expect: '60 seconds is 1 minutes and 0 seconds' }, { stdin: '59', expect: '59 seconds is 0 minutes and 59 seconds' }],
            failTip: 'Use int(), not float(), so nothing prints with ".0", and compare your line with the example character by character.',
            followup: 'Go one step further: for 3725 seconds print 3725 seconds is 1 hours, 2 minutes and 5 seconds. Use // and % twice: first for hours, then for the minutes in what is left.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A machine cannot guess what you meant, so a program is a list of exact statements, and Python carries them out in order, top to bottom. <code>print(...)</code> shows a value; <code>#</code> starts a comment.</li>
<li>Values have types: <code>int</code>, <code>float</code>, <code>str</code>, <code>bool</code>. <code>/</code> always gives a float; <code>//</code> and <code>%</code> give the quotient and remainder.</li>
<li><code>=</code> means "becomes": work out the right side, then attach the name on the left to it. <code>x = x + 1</code> is an instruction, not an equation.</li>
<li><code>input()</code> always gives a string; wrap it in <code>int()</code> or <code>float()</code> to get a number.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['2-AP-12', '2-AP-17'], standard: 1,
      title: 'How Python reads your program', summary: 'The rules Python applies to every line, the two moments a program can fail, and why the spaces at the start of a line are part of the language.',
      blocks: [
        `<p>"Time flies like an arrow; fruit flies like a banana." Read that twice: in the first half <i>flies</i> is a verb, in the second it is a noun, and <i>like</i> changes meaning too. English is full of sentences a person can read two ways and sorts out from context without noticing. A programming language cannot afford that: every line must have exactly one meaning, fixed by rules.</p>
<p>People are forgiving readers. If a friend texts you "meet at 7 at the libary" you know what they meant. Python is not a forgiving reader. It has a small set of rules for what a line may look like, and if a line breaks a rule, Python stops and reports the problem rather than guessing. This is frustrating on the first day and a relief ever after: a program that runs at all is a program Python fully understood.</p>
<p>This lesson collects the rules in one place. Most of them you have already used without being told. So which rules does Python hold you to, and what exactly happens when a line breaks one?</p>
<h2>Rule 1: one statement per line, in order</h2>
<p>Python reads your program from the top. Each line is one statement, and Python finishes one before starting the next. A blank line means nothing at all; use blank lines freely to separate groups of related lines. Spaces <em>inside</em> a line mostly do not matter: <code>print(2+3)</code> and <code>print( 2 + 3 )</code> are the same statement. Spaces at the <em>start</em> of a line are a different matter, and they get their own rule below. The rule is older than Python: in the 1960s a program in the language Fortran was a deck of punched cards, one line of the program on each card.</p>`,
        { photo: 'fortran-card', caption: "One line of a program, on a card. Each column of holes is one character; this card holds the Fortran statement <code>12 PIFRA=(A(JB,37)-A(JB,99))/A(JB,47)</code>. A program was a box of these, read by the computer in order, top card first." },
        `<h2>Rule 2: capitals count</h2>
<p><code>print</code>, <code>Print</code> and <code>PRINT</code> are three different names to Python, and it knows only the first. The same goes for your own names: <code>total</code> and <code>Total</code> are two different variables, and <code>True</code> must be written with a capital T. This rule is a common source of trouble for people who are used to spell-checkers.</p>
<details class="reveal"><summary>Guess first: will Python accept <code>Print("hello")</code>, with a capital P?</summary><p>No. <code>Print</code> is not a name Python knows, so it stops with <code>NameError: name 'Print' is not defined</code>. Only the all-lower-case <code>print</code> works.</p></details>
<h2>Rule 3: quotes and brackets in pairs</h2>
<p>Text must be wrapped in matching quotes, either <code>"double"</code> or <code>'single'</code>, and the two ends must match. Every opening parenthesis <code>(</code> needs a closing <code>)</code>. Python counts them. A missing quote or bracket is the single most common reason a beginner's program refuses to run.</p>
<h2>The two moments a program can fail</h2>
<p>This is the most useful idea in the lesson. Python deals with your program in two stages, and a mistake can be caught at either one.</p>
<p><b>Stage 1: reading.</b> Before running anything, Python reads the whole program and checks that every line follows the rules of the language: the <em>syntax</em>. A line that breaks a rule produces a <code>SyntaxError</code>, and <strong>nothing runs at all</strong>, not even the correct lines above it. Predict, then run:</p>`,
        { play: `print("This line is fine.")
print("So is this one.")
print("But this one is missing a quote)`, caption: 'Notice what does not appear: the first two lines never printed. Python stopped before running anything.', expectError: true },
        `<p>In this course the message is <code>SyntaxError: bad input on line 3</code>. The standard Python you might install at home is a little more talkative (it often says <code>invalid syntax</code> and points an arrow at the spot), but the meaning is the same: I could not read line 3. The line number is the important part. Look at that line, and if it seems fine, look at the line just above it, because an unclosed bracket on one line is often reported on the next.</p>
<p><b>Stage 2: running.</b> Once the whole program reads correctly, Python runs it line by line. Now a different kind of error can happen: a line that is perfectly good Python but asks for something impossible. Then the lines above it have <em>already run</em>, and their output is on the screen.</p>`,
        { play: `print("This line runs.")
print("So does this one.")
print(total)
print("This line is never reached.")`, caption: 'Two lines print, then Python stops: total was never given a value.', expectError: true },
        { skill: 'error-stages', check: "A program has a missing closing quote on line 8 and a misspelt variable name on line 3. What happens when you run it?", options: ["Lines 1 and 2 run, then the NameError on line 3 stops it", "Nothing runs: the SyntaxError on line 8 is reported first", "Both errors are reported together"], answer: 1, wrong: ["This pictures Python running line by line from the start. It reads the whole program first, so it finds the line 8 syntax error before running line 1.", null, "Python stops at the first problem it meets, so you see one error at a time. And the NameError cannot even happen until the program reads correctly."], why: "Python reads the whole program before running any of it. A syntax error is found at the reading stage, so no line runs at all." },
        `<p><code>NameError: name 'total' is not defined</code>: a name was used that has no value. That happens with a typo in a name, with <code>Print</code> for <code>print</code>, with a forgotten quote around text (<code>print(Hello)</code>), or, most often later on, with a variable you meant to set earlier and did not. You will meet more kinds of runtime error as the course goes on; the lesson on finding and fixing bugs (Lesson 9) is about hunting them systematically. For now, the two-stage picture is what to hold on to.</p>
<div class="tbl-wrap"><table>
<tr><th>when</th><th>error looks like</th><th>meaning</th><th>what ran</th></tr>
<tr><td>reading</td><td><code>SyntaxError</code></td><td>a line breaks the rules of the language</td><td>nothing</td></tr>
<tr><td>running</td><td><code>NameError</code>, <code>TypeError</code>, …</td><td>a legal line asked for something impossible</td><td>everything above it</td></tr>
</table></div>
<details class="reveal"><summary>Predict: a program has a missing quote on line 10 and a misspelled variable on line 2. Which error does Python report?</summary><p>The missing quote. Python reads the whole program before running any of it, so the syntax error on line 10 is found first, and line 2 never gets a chance to run. Fix line 10, run again, and <em>then</em> you will see the <code>NameError</code> from line 2.</p></details>
<h2>Rule 4: indentation is part of the language</h2>
<p>In most languages, the spaces at the start of a line are decoration. In Python they are grammar. Python uses them to know which lines belong together as a <em>block</em>. You will need blocks the moment a program has to make a decision or repeat something, which is the next two lessons, so this is the right time to learn the rule exactly.</p>
<div class="stmt"><p><span class="kind">The indentation rule.</span> A line that ends with a colon <code>:</code> opens a block. Every line of the block is indented by the same amount, and by convention that amount is four spaces. The block ends at the first line that is indented less. A line that is not inside any block must start at the left margin, with no spaces at all.</p></div>
<p>To show blocks we need a line that opens one, so here is a preview of the next lesson. <code>if</code> followed by a condition and a colon means "run the block below only if the condition is true". Today the conditions are just <code>True</code> and <code>False</code>, so you can see the shape without thinking about the logic. Predict which lines print.</p>
<details class="reveal"><summary>My prediction</summary><p>Lines 2 and 3 are the block belonging to <code>if True:</code>, so they print. Line 4 starts at the margin, so it is outside the block and always prints. Line 5 is blank. Lines 7 and 8 belong to <code>if False:</code> on line 6, so they are skipped. Line 9 is outside again and prints. Four lines print.</p></details>`,
        { play: `if True:
    print("inside the first block")
    print("still inside it")
print("outside: this always runs")

if False:
    print("inside the second block")
    print("also skipped")
print("outside again")`, caption: 'Now change the four spaces before "still inside it" to zero and run. Which line moved out of the block?' },
        `<p>Look at the shape of the program rather than its words. The indented lines form a visible column under their colon. That column <em>is</em> the block. Moving a line left by four spaces takes it out of the block, which changes what the program does even though no word changed. Nothing you did in Lesson 1 depended on spacing; from here on, it always will.</p>
<h2>Three ways indentation goes wrong</h2>
<p>Each of these is a <code>SyntaxError</code>, caught at the reading stage (a Python installed on your own computer calls them <code>IndentationError</code>, a kind of SyntaxError). Run each block, read the message, and then fix it.</p>
<p><b>A stray indent.</b> A line that is indented but is not under a colon. Python does not know which block it could belong to.</p>`,
        { play: `print("start")
    print("why am I indented?")`, caption: 'Delete the four spaces on line 2 and run again.', expectError: true },
        `<p><b>A missing indent.</b> A colon promises a block, and the next line is not indented. Python was waiting for the block and did not find one.</p>`,
        { play: `if True:
print("this should be indented")`, caption: 'Add four spaces at the start of line 2.', expectError: true },
        `<p><b>An inconsistent indent.</b> Two lines in the same block with different indentation. The message here is more specific: <code>unindent does not match any outer indentation level</code>. It means "you came back left by an amount that does not line up with any block".</p>`,
        { play: `if True:
    print("four spaces")
   print("three spaces")`, caption: 'Make line 3 start with four spaces, like line 2.', expectError: true },
        { skill: 'indentation', check: "Which line ends a block?", options: ["The first line that is indented less than the block", "A line containing <code>end</code>", "A blank line"], answer: 0, wrong: [null, "Python has no <code>end</code> marker; that is how other languages close a block. Here the shape of the indentation does the job.", "Blank lines mean nothing to Python, so they cannot end a block. Only a line that is indented less does."], why: "The block is the lines indented under the colon line. It ends where the indentation stops; blank lines do not matter." },
        `<p>Two habits prevent nearly all of these. Always use exactly four spaces per level; the editor on this page inserts them when you press Tab, and it indents the next line for you after a colon. And never mix tabs with spaces: they can look identical on the screen and be different to Python.</p>
<h2>Mixing text and numbers</h2>
<p>One more rule, and it is about types rather than spelling. Remember from Lesson 1 that every value has a type. <code>+</code> means "add" for numbers and "join" for strings, but Python refuses to do either between a string and a number, because it will not guess which you wanted.</p>`,
        { play: `apples = 7
print("Apples: " + apples)`, caption: 'This is a TypeError, caught at the running stage. Read the message, then look at the fixes below.', expectError: true },
        `<p>There are three good fixes, and you will use all of them.</p>`,
        { predict: true, play: `apples = 7
print("Apples:", apples)               # 1. commas: print adds a space between pieces
print("Apples: " + str(apples))         # 2. str() turns the number into text, then + joins
print(f"Apples: {apples}, next: {apples + 1}")   # 3. an f-string`, caption: 'The first two lines print the same thing, <code>Apples: 7</code>: the comma puts in the space itself, while in line 2 the space is part of the text before the <code>+</code>. The third prints <code>Apples: 7, next: 8</code>, because everything in braces is calculated and dropped into the text. Delete the space after the colon in line 2 and watch the two lines stop matching.' },
        `<p>The third form is an <em>f-string</em>: a string with the letter <code>f</code> in front of the opening quote. Inside it, anything in curly braces <code>{ }</code> is calculated and its result is dropped into the text at that spot. It can hold a name, or a whole expression such as <code>apples + 1</code>. f-strings give you exact control over spacing and punctuation, which the comma form does not, so they are the usual choice when a line must be formatted precisely.</p>
<p>This is also the real reason behind the rule about <code>input()</code> from Lesson 1. Whatever the person types is text, so <code>input()</code> hands you a <code>str</code>. If you then write <code>age + 1</code>, that is a string plus a number: a <code>TypeError</code>. <code>int(input(...))</code> converts the text to a number first.</p>`,
        { play: `age = input("How old are you? ")
print(type(age))
print(f"Next year you will be {int(age) + 1}")`, caption: 'The first print shows why the conversion is needed.', testStdin: '15\n' },
        `<h2>Before the exercises</h2>
<p>The first exercise is a program that already exists but breaks four of the rules above. Fixing broken programs is a large part of what programmers do, and the technique is always the same: run it, read the <em>first</em> error message, go to that line, fix that one thing, run again. Never try to fix everything at once; the second error may not even be real once the first is gone.</p>
<p>The second exercise asks for exact output, and the f-string form is the tool for that. Here is a worked example of the same shape: read a name and a whole number, and print two precisely formatted lines.</p>`,
        { play: `name = input("Name: ")
count = int(input("How many books? "))
print(f"{name} has {count} books.")
print(f"After buying two more: {count + 2}.")`, caption: 'Everything inside { } is calculated; everything outside is copied exactly, including the full stop.', testStdin: 'Ada\n4\n' },
        { skill: 'values-types', check: "<code>age = 12</code>. Which line prints <code>Age: 12</code> without an error?", options: ["<code>print(\"Age: \" + age)</code>", "<code>print(\"Age:\", age)</code>", "<code>print(\"Age: \" age)</code>"], answer: 1, wrong: ["This tries to join text and a number with <code>+</code>, which Python refuses: a TypeError. You would need <code>str(age)</code>.", null, "Two pieces side by side need something between them: a comma or a <code>+</code>. With nothing there it is a SyntaxError."], why: "A comma in print joins pieces of any type with a space. <code>+</code> cannot join text to a number; you would need <code>str(age)</code> or an f-string." },
        `<details class="reveal"><summary>Puzzle: a four-line program has a missing closing bracket on line 3. Lines 1 and 2 are <code>print("one")</code> and <code>print("two")</code>. What appears when you press Run?</summary><p>Only the error message. Python reads the whole program before running any of it, so a syntax error anywhere means nothing runs at all, not even the correct lines above it. A runtime error is different: the lines before it do run, and only then does the program stop.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Reading the error message's line number and then not looking at that line. Fixing the second error before the first. Indenting a line "to make it look nicer": in Python that changes the meaning. Forgetting the colon at the end of an <code>if</code> line. Forgetting the <code>f</code> in front of an f-string, so the braces are printed as they are. Adding text to a number with <code>+</code> instead of using commas, <code>str()</code> or an f-string.</p>` },
        {
          ex: {
            id: 'py-2-1', skill: 'error-stages', title: 'Fix the four mistakes',
            prompt: `<p>The program below is meant to read a name and an age, then print two lines exactly like these (for the name Ada and age 36):</p>
<pre class="code"><code>Hello, Ada!
Next year you will be 37.</code></pre>
<p>It contains four mistakes: one breaks Rule 2, one breaks Rule 3, one breaks Rule 4, and one is a type mistake. Run it, read the first error, fix that line only, and run again until it works. Do not rewrite it from scratch; find the four mistakes.</p>`,
            starter: `name = input("Name: ")\nage = int(input("Age: "))\nPrint("Hello, " + name + "!")\n    print("Next year you will be " + age + 1 + ".)\n`,
            solution: `name = input("Name: ")\nage = int(input("Age: "))\nprint("Hello, " + name + "!")\nprint("Next year you will be " + str(age + 1) + ".")\n`,
            hints: ['The first error reported is the syntax error, because Python reads the whole program before running it. Look at the quotes on the last line, and at how that line starts.', 'Once the program reads, it will fail while running: Python does not know a function called Print. Then age + 1 must be turned into text before it can be joined, or use an f-string.'],
            tests: [{ stdin: 'Ada\n36', expect: 'Hello, Ada!\nNext year you will be 37.' }, { stdin: 'Grace\n9', expect: 'Hello, Grace!\nNext year you will be 10.' }],
            failTip: 'Read the first error message and go to that line number. Fix one thing, then run again.',
            followup: 'Rewrite the last line with an f-string instead of str() and +, and check that the output is exactly the same.'
          }
        },
        {
          ex: {
            id: 'py-2-2', skill: 'values-types', title: 'A receipt line',
            prompt: `<p>Write a program that reads an item name, a price (a number with a decimal point) and a quantity (a whole number), and prints exactly two lines. For the inputs <code>pencil</code>, <code>0.5</code> and <code>4</code> the output must be:</p>
<pre class="code"><code>4 x pencil at 0.5 each
Total: 2.0</code></pre>
<p>Use <code>float()</code> for the price and <code>int()</code> for the quantity, and build both lines with f-strings so the spacing and punctuation are exact.</p>`,
            starter: `item = input("Item: ")\nprice = float(input("Price: "))\nquantity = int(input("Quantity: "))\n# print the two lines here\n`,
            solution: `item = input("Item: ")\nprice = float(input("Price: "))\nquantity = int(input("Quantity: "))\nprint(f"{quantity} x {item} at {price} each")\nprint(f"Total: {quantity * price}")`,
            hints: ['The first line is f"{quantity} x {item} at {price} each": the letter x and the words are copied exactly, the braces are filled in.', 'The total is quantity * price, and it can go straight inside the braces: f"Total: {quantity * price}".'],
            tests: [{ stdin: 'pencil\n0.5\n4', expect: '4 x pencil at 0.5 each\nTotal: 2.0' }, { stdin: 'notebook\n2.25\n3', expect: '3 x notebook at 2.25 each\nTotal: 6.75' }, { stdin: 'eraser\n1.0\n1', expect: '1 x eraser at 1.0 each\nTotal: 1.0' }],
            mustContain: [{ re: /f["']/, msg: 'Build the lines with f-strings: put the letter f before the opening quote.' }],
            failTip: 'Compare your output with the expected output character by character, including the spaces around x and at.',
            followup: 'Add a third line that takes 1.0 off the total, for example Discounted: 1.0 for the pencil example. Then try the same line with commas in print instead of an f-string and see what differs.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>The rules Python holds you to: one statement per line, in order; capitals count; quotes and brackets must match; indentation is meaning. A line that breaks one makes Python stop and report it, never guess.</li>
<li>A <code>SyntaxError</code> is found while <em>reading</em> and nothing runs. A runtime error such as <code>NameError</code> or <code>TypeError</code> happens while <em>running</em>, after the lines above it have run.</li>
<li>A line ending in a colon opens a block; the block is the lines indented under it by four spaces; it ends where the indentation stops. Indentation is meaning, not decoration.</li>
<li>Text and numbers cannot be joined with <code>+</code>. Use commas in <code>print</code>, <code>str()</code>, or an f-string, and convert <code>input()</code> with <code>int()</code> or <code>float()</code>.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['2-AP-12', '3A-AP-15'], standard: 1,
      title: 'Making decisions', summary: 'True and False, comparisons, if, elif and else, combining conditions with and, or and not, and the order in which Python checks them.',
      blocks: [
        `<p>Every time you press a button in a game, the program asks questions. Is the player touching the ground? Is there a wall to the left? Has the timer run out? A fast game asks thousands of such questions every second, and what happens next depends on each answer. Those yes-or-no questions, and the choices that follow them, are this lesson. So how do you ask a yes-or-no question in Python, and how does a program choose what to do with the answer?</p>`,
        { photo: 'minetest', caption: "Minetest, a free game of blocks much like Minecraft. Can the player walk forward, or is a tree in the way? Is the block underfoot solid, or water? Every step in a game like this is decided by questions like these." },
        `
<p>So far every program ran the same lines every time. Real programs <em>branch</em>: they do one thing in one situation and something else in another. A thermostat turns the heat on or off, a game checks whether you have won, a website checks whether your password is right. Each of these asks a question with a yes-or-no answer and then chooses what to do. This lesson is about both halves: asking the question, and choosing.</p>
<h2>Questions: True and False</h2>
<div class="stmt"><p><span class="kind">Rule (booleans).</span> Python has a type called <code>bool</code> with exactly two values, <code>True</code> and <code>False</code>. They are written with capital letters and without quotes.</p>
<p><span class="kind">Rule (comparisons).</span> The six comparison operators are <code>==</code> (equal), <code>!=</code> (not equal), <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code> and <code>&gt;=</code>. A comparison works out to <code>True</code> or <code>False</code>.</p></div>
<p>Notice the two equals signs in <code>==</code>. A single <code>=</code> means "store this value in this name", as in Lesson 1; two of them ask "are these equal?". Mixing them up is the most common mistake in this lesson, and the next section shows what Python does about it. Predict all six values, then run.</p>`,
        { predict: true, play: `x = 7
print(x > 5)
print(x < 5)
print(x == 7)
print(x != 7)
print(x >= 7)
passed = x >= 5
print(passed)`, caption: 'True, False, True, False, True, and then True again. The last two lines store the answer to a question in a variable, the same way you store a number.' },
        `<p>Comparing text works too, and it is where surprises hide. Python compares strings one character at a time, and every character has a code number: the capital letters come before all the lower-case ones, and the digits come before both. So <code>"apple" &lt; "banana"</code> is <code>True</code>, as in a dictionary, but <code>"Zebra" &lt; "apple"</code> is also <code>True</code>, because capital Z comes before lower-case a.</p>
<details class="reveal"><summary>Predict: is <code>"10" &lt; "9"</code> True or False? And <code>10 &lt; 9</code>?</summary><p><code>"10" &lt; "9"</code> is <code>True</code>. They are text, so Python compares the first characters, "1" and "9", and "1" comes first; it never looks at the numbers they spell. <code>10 &lt; 9</code>, with no quotes, compares numbers and is <code>False</code>. This is one more reason to convert <code>input()</code> with <code>int()</code> before comparing: if you forget, Python either compares text or, as in <code>"15" &gt;= 13</code>, refuses with a <code>TypeError</code>.</p></details>
<h2>Choosing: if and else</h2>
<div class="stmt"><p><span class="kind">Rule (if).</span> <code>if <i>condition</i>:</code> followed by an indented block runs the block when the condition is <code>True</code> and skips it when it is <code>False</code>.</p>
<p><span class="kind">Rule (else).</span> An <code>if</code> block may be followed by <code>else:</code> and a second indented block, which runs exactly when the condition was <code>False</code>. Exactly one of the two blocks runs.</p></div>
<p>This is Lesson 2's indentation rule at work: the line ending in a colon opens a block, and the indented lines under it are the block. With a real condition in place of Lesson 2's <code>True</code> and <code>False</code>, the program now decides for itself which block runs.</p>
<details class="reveal"><summary>Guess first: in the program below, which lines print if the person types <code>9</code>?</summary><p>"Come back when you are 13." and then "Thanks for visiting.": 9 &gt;= 13 is <code>False</code>, so the <code>else</code> block runs instead of the first block. The last line is outside both blocks, so it always prints.</p></details>`,
        { play: `age = int(input("How old are you? "))

if age >= 13:
    print("You can join the club.")
    print("Welcome!")
else:
    print("Come back when you are 13.")

print("Thanks for visiting.")`, testStdin: '15\n', caption: 'Run it with 15, then with 9, then with exactly 13. The last line is outside both blocks, so it runs every time.' },
        { skill: 'boolean-logic', check: "What is wrong with <code>if x = 5:</code>?", options: ["Nothing: it checks whether x is 5", "A single <code>=</code> stores a value and cannot be a question; it needs <code>==</code>", "It should be <code>if x = 5 then</code>"], answer: 1, wrong: ["This reads <code>=</code> as \"equals\", the way it works in maths. In Python <code>=</code> stores a value; the question \"are these equal?\" is <code>==</code>.", null, "<code>then</code> belongs to other languages. Python ends the line with a colon and indents the block; and the single <code>=</code> would still be wrong."], why: "<code>=</code> assigns, <code>==</code> compares. Python refuses the single <code>=</code> with a SyntaxError." },
        `<p>Because the comparison is <code>&gt;=</code>, an age of exactly 13 joins. Had it been <code>&gt;</code>, 13 would have been turned away. When you write a condition, always ask what happens <em>at</em> the boundary.</p>
<h2>More than two choices: elif</h2>
<div class="stmt"><p><span class="kind">Rule (elif).</span> Between the <code>if</code> and the <code>else</code> you may put any number of <code>elif <i>condition</i>:</code> blocks ("else if"). Python checks the conditions from the top, one at a time, and runs the block of the <em>first</em> one that is <code>True</code>. Then it skips everything else in the chain, even if later conditions are also true. If none is <code>True</code>, the <code>else</code> block runs; if there is no <code>else</code>, nothing runs.</p></div>`,
        { predict: true, play: `temperature = 31

if temperature > 30:
    print("Hot.")
    print("Drink water.")
elif temperature > 20:
    print("Pleasant.")
elif temperature > 10:
    print("Bring a jacket.")
else:
    print("Cold.")

print("This line runs no matter what.")`, caption: 'Three lines: <code>Hot.</code>, <code>Drink water.</code> and the last line. 31 &gt; 30 is True, so the first block runs and Python skips the rest of the chain, even though 31 &gt; 20 is true too. Change the temperature to 25, 15, 30 and -5, predicting each time: exactly one branch runs.' },
        { skill: 'branching', check: "In an <code>if … elif … else</code> chain, how many of the blocks run?", options: ["Every block whose condition is True", "Exactly one: the first whose condition is True, or else", "All of them, in order"], answer: 1, wrong: ["That is true of separate <code>if</code> statements, but not of a chain. After the first true branch runs, Python skips the other <code>elif</code> and <code>else</code> blocks.", null, "A chain is a choice, not a list. Only one block runs, so the later ones are skipped even when their conditions would be true."], why: "Python checks from the top and runs the first true branch, then skips the rest of the chain, even if later conditions are also true." },
        `<p>Follow it for 31. The first condition, 31 &gt; 30, is <code>True</code>, so "Hot." and "Drink water." are printed, and Python jumps straight past the rest of the chain. It never checks 31 &gt; 20, although that is true too. Now follow 25: the first condition is <code>False</code>, the second is <code>True</code>, so "Pleasant." is printed. That second condition does not need to say "and not above 30", because it is only ever checked when the first one was <code>False</code>.</p>
<details class="reveal"><summary>Predict: if the chain checked <code>temperature &gt; 10</code> first, what would 31 print?</summary><p>"Bring a jacket." 31 &gt; 10 is <code>True</code>, it is the first true condition, and the rest are skipped. In fact "Hot." could then never be printed, for any temperature. When the conditions overlap, put the hardest one to satisfy first and the catch-all <code>else</code> last.</p></details>`,
        `<h2>Combining conditions: and, or, not</h2>
<div class="stmt"><p><span class="kind">Rule (and, or, not).</span> <code>a and b</code> is <code>True</code> when both are <code>True</code>. <code>a or b</code> is <code>True</code> when at least one is <code>True</code>, including when both are. <code>not a</code> is <code>True</code> when <code>a</code> is <code>False</code>. Without brackets, <code>not</code> is applied first, then <code>and</code>, then <code>or</code>; use brackets whenever you mix them.</p>
<p><span class="kind">Rule (short circuit).</span> Python works out <code>and</code> and <code>or</code> from left to right and stops as soon as it knows the answer: if the left side of <code>and</code> is <code>False</code>, or the left side of <code>or</code> is <code>True</code>, the right side is never looked at.</p></div>
<p>Python also lets you chain comparisons the way mathematicians write them: <code>3 &lt;= x &lt;= 10</code> means <code>3 &lt;= x and x &lt;= 10</code>. (Many other languages, C++ among them, do not read it this way, so you will see the long form a lot.) Predict the five lines.</p>`,
        { predict: true, play: `x = 7
print(x > 5 and x < 10)
print(x < 5 or x == 7)
print(not x > 5)
print(3 <= x <= 10)

d = 0
print(d != 0 and 10 / d > 2)`, caption: 'True, True, False, True, False. The last line would divide by zero, but d != 0 is False, so and stops there and never does the division. Swap the two sides of that and and run again.' },
        `<p>One mistake with <code>or</code> is so common that it is worth running on purpose. In English you can say "if x is 1 or 2". In Python, each side of <code>or</code> must be a complete condition.</p>`,
        { predict: true, play: `x = 5

if x == 1 or 2:
    print("wrong version says yes")

if x == 1 or x == 2:
    print("right version says yes")
else:
    print("right version says no")`, caption: 'x is 5, and yet the first version says yes. Python reads it as (x == 1) or (2), and 2 on its own counts as True (the next section explains why). Always repeat the comparison: x == 1 or x == 2.' },
        { skill: 'boolean-logic', check: "<code>x = 7</code>. What does <code>x == 1 or x == 2</code> give, and what does <code>x == 1 or 2</code> give?", options: ["False and False", "False and 2 (which counts as True)", "True and True"], answer: 1, wrong: ["This reads <code>x == 1 or 2</code> the way English does, as \"x is 1 or 2\". Python takes the <code>2</code> as a whole condition of its own, and 2 counts as True.", null, "x is 7, so <code>x == 1 or x == 2</code> is False: neither comparison is true. Only the version with the lone <code>2</code> goes wrong."], why: "Each side of <code>or</code> is a separate expression. <code>x == 1 or 2</code> is <code>False or 2</code>, which is 2, and any non-zero number counts as True." },
        `<h2>Any value can be a condition</h2>
<div class="stmt"><p><span class="kind">Rule (truth of other values).</span> When a value that is not <code>True</code> or <code>False</code> is used as a condition, Python treats <code>0</code>, <code>0.0</code>, the empty string <code>""</code> and a few other "empty" values as <code>False</code>, and every other value as <code>True</code>.</p></div>
<p>This is why <code>2</code> counted as <code>True</code> above. It is also handy on purpose: <code>if name:</code> means "if the name is not empty". While you are learning, prefer writing the comparison out, <code>if name != "":</code>, so that the condition says exactly what you mean.</p>
<h2>Blocks inside blocks</h2>
<p>A block can contain another <code>if</code>. The inner one's block is indented one more level, four more spaces, and it is only reached when the outer condition was <code>True</code>. A <code>bool</code> variable can be used as a condition directly, as <code>raining</code> is here.</p>`,
        { predict: true, play: `day = "Saturday"
raining = True

if day == "Saturday" or day == "Sunday":
    if raining:
        print("Weekend: read a book.")
    else:
        print("Weekend: go to the park.")
else:
    print("School day.")`, caption: 'One line: <code>Weekend: read a book.</code> It is Saturday, so the outer condition is True and Python goes inside; <code>raining</code> is True, so the inner <code>if</code> block runs. Change raining to False, then change day to "Monday": the inner if/else is only checked on a weekend. Which else belongs to which if? Look at which column each one starts in.' },
        `<p>Each <code>else</code> belongs to the <code>if</code> in the same column above it. The indentation is the only thing that says so, which is why Lesson 2 made such a point of it. Nesting more than two or three levels deep gets hard to read; often <code>and</code> or <code>elif</code> can flatten it.</p>
<h2>Two mistakes Python catches for you</h2>
<p>Both of these are syntax errors, found while Python is reading, so nothing runs (Lesson 2's first stage). Run each, read the message, and fix it.</p>`,
        { play: `x = 5
if x = 5:
    print("five")`, expectError: true, caption: 'One = inside an if. Python refuses, because = stores a value and cannot be a question. Change it to ==.' },
        `<p>The second mistake is a forgotten colon.</p>`,
        { play: `x = 5
if x > 3
    print("big")`, expectError: true, caption: 'The colon is missing at the end of line 2, so Python does not know a block is starting. Add the colon.' },
        `<h2>Before the exercises</h2>
<p>The first exercise needs one condition built from <code>%</code>, <code>and</code> and <code>or</code>. Remember from Lesson 1 that <code>n % d</code> is the remainder when <code>n</code> is divided by <code>d</code>, so "<code>n</code> is divisible by <code>d</code>" is <code>n % d == 0</code>. The second exercise needs an <code>if</code>/<code>elif</code>/<code>else</code> chain in the right order. Here is a worked example of each. Say the condition in words first, then translate it word by word.</p>
<p>A number is <em>lucky</em> if it is divisible by 7 or its last digit is 7. In words: "divisible by 7, or last digit 7". In Python: <code>n % 7 == 0 or n % 10 == 7</code>. A ticket costs 0 for ages under 5, 5 for ages under 13, 6 for ages 65 and over, and 10 otherwise. The first two groups overlap (a 3-year-old is also under 13), so the youngest group must be checked first.</p>`,
        { play: `n = int(input("A number: "))
if n % 7 == 0 or n % 10 == 7:
    print("lucky")
else:
    print("not lucky")

age = int(input("Age: "))
if age < 5:
    print("Price: 0")
elif age < 13:
    print("Price: 5")
elif age >= 65:
    print("Price: 6")
else:
    print("Price: 10")`, testStdin: '27\n40\n', caption: 'Try 14, 27 and 30 for the number, and 3, 12, 40 and 70 for the age. Then swap the first two conditions of the ticket chain and try age 3 again.' },
        `<details class="reveal"><summary>Puzzle: is <code>not (a and b)</code> always the same as <code>(not a) or (not b)</code>? Check all four combinations of <code>True</code> and <code>False</code>.</summary><p>Yes, in all four cases. <code>a and b</code> is <code>True</code> only when both are, so <code>not (a and b)</code> is <code>True</code> when at least one is <code>False</code>, which is exactly what <code>(not a) or (not b)</code> says. This is one of <em>De Morgan's laws</em>, after the mathematician Augustus De Morgan, who taught Ada Lovelace. The other swaps the roles: <code>not (a or b)</code> is the same as <code>(not a) and (not b)</code>. They are handy for tidying conditions: "not (hungry and tired)" means "not hungry, or not tired".</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Writing <code>=</code> instead of <code>==</code> in a condition. Forgetting the colon at the end of an <code>if</code>, <code>elif</code> or <code>else</code> line. Writing <code>if x == 1 or 2:</code>, which is always true; write <code>x == 1 or x == 2</code>. Putting overlapping conditions in the wrong order, so an early one catches cases meant for a later one. Using <code>&gt;</code> where the boundary itself should count, or <code>&gt;=</code> where it should not. Comparing <code>input()</code> text with a number instead of converting it with <code>int()</code> first. Indenting an <code>else</code> so it lines up with the wrong <code>if</code>.</p>` },
        {
          ex: {
            id: 'py-17-1', skill: 'branching', kind: 'parsons', title: 'Put it in order: parcel sizes',
            prompt: `<p>Build a program that reads a weight in kilograms and prints the size of the parcel: <code>small</code> for 1 or less, <code>medium</code> for more than 1 up to and including 10, and <code>large</code> for anything heavier. Order matters in an <code>if</code>/<code>elif</code> chain, and so does the indentation. Not every block belongs in the program.</p>`,
            lines: ['weight = int(input())', 'if weight <= 1:', '    print("small")', 'elif weight <= 10:', '    print("medium")', 'else:', '    print("large")'],
            distractors: ['if weight < 1:', 'elif weight > 1:'],
            tests: [{ stdin: '1', expect: 'small' }, { stdin: '0', expect: 'small' }, { stdin: '2', expect: 'medium' }, { stdin: '10', expect: 'medium' }, { stdin: '11', expect: 'large' }],
            sampleStdin: '5',
            hints: ['The chain has to start with the first test, which opens with if. The tests that follow it open with elif, and the last block is a plain else with no condition at all.', 'The weight 1 must count as small, so the first test needs <= and not <. After that, the elif only has to ask about the upper limit of medium, because anything of 1 or less was caught already.'],
            failTip: 'If weight 1 comes out medium, the first condition is the one with <: the boundary itself must belong to small.',
            followup: 'Add a fourth size, "huge", for more than 50 kilograms. Which line of the chain do you add, and does the order of the other tests change?'
          }
        },
        {
          ex: {
            id: 'py-3-1', skill: 'boolean-logic', title: 'Leap year in one condition',
            prompt: `<p>Read a year and print either <code>leap</code> or <code>not leap</code>. A year is a leap year if it is divisible by 4, except that century years (divisible by 100) are not, unless they are also divisible by 400. So 2024 and 2000 are leap years; 2023 and 1900 are not. Write it with a single <code>if</code>/<code>else</code> and one condition that uses <code>and</code>, <code>or</code> and <code>%</code>.</p>`,
            starter: `year = int(input("Year: "))\nif ...:\n    print("leap")\nelse:\n    print("not leap")`,
            solution: `year = int(input("Year: "))\nif (year % 4 == 0 and year % 100 != 0) or year % 400 == 0:\n    print("leap")\nelse:\n    print("not leap")`,
            hints: ['Say it in words first: "divisible by 4 and not divisible by 100, or divisible by 400".', 'Translate each piece: year % 4 == 0, year % 100 != 0, year % 400 == 0. Brackets group the and-part: (year % 4 == 0 and year % 100 != 0) or year % 400 == 0'],
            tests: [{ stdin: '2024', expect: 'leap' }, { stdin: '1900', expect: 'not leap' }, { stdin: '2000', expect: 'leap' }, { stdin: '2023', expect: 'not leap' }, { stdin: '2100', expect: 'not leap' }, { stdin: '2400', expect: 'leap' }],
            mustNotContain: [{ re: /\belif\b/, msg: 'Use a single if/else with one combined condition, no elif, for this one.' }],
            failTip: 'Check 1900 and 2000 by hand against your condition. Both are divisible by 4 and by 100; only 2000 is divisible by 400.',
            followup: 'The brackets are not strictly needed, because and is applied before or, but they make the condition read the way the rule is said. Keep them. Then write the same test again as an if/elif/else chain with no and or or, checking 400 first, then 100, then 4.'
          }
        },
        {
          ex: {
            id: 'py-3-2', skill: 'branching', title: 'Grade letters',
            prompt: `<p>Read a score from 0 to 100 and print the letter grade: 90 and above is <code>A</code>, 80–89 is <code>B</code>, 70–79 is <code>C</code>, 60–69 is <code>D</code>, below 60 is <code>F</code>. Use an <code>if</code>/<code>elif</code>/<code>else</code> chain, and think about the order of the tests.</p>`,
            starter: `score = int(input("Score: "))\n`,
            solution: `score = int(input("Score: "))\nif score >= 90:\n    print("A")\nelif score >= 80:\n    print("B")\nelif score >= 70:\n    print("C")\nelif score >= 60:\n    print("D")\nelse:\n    print("F")`,
            hints: ['Test the highest boundary first: if score >= 90 … elif score >= 80 … and so on.', 'Because earlier branches catch the higher scores, each elif only needs a lower bound, just like the ticket example.'],
            tests: [{ stdin: '95', expect: 'A' }, { stdin: '100', expect: 'A' }, { stdin: '90', expect: 'A' }, { stdin: '89', expect: 'B' }, { stdin: '70', expect: 'C' }, { stdin: '65', expect: 'D' }, { stdin: '60', expect: 'D' }, { stdin: '59', expect: 'F' }, { stdin: '12', expect: 'F' }],
            failTip: 'Check the boundary scores 90, 60 and 59: >= includes the boundary itself, > does not.',
            followup: 'Add plus and minus grades: in the B, C and D bands, a last digit of 7, 8 or 9 gets a + and a last digit of 0, 1 or 2 gets a - (so 78 is C+ and 80 is B-). Use n % 10 for the last digit, and think about which tests must come first.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A yes-or-no question is a comparison (<code>==</code>, <code>!=</code>, <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code>, <code>&gt;=</code>), which gives <code>True</code> or <code>False</code>; the program chooses with <code>if</code>. <code>==</code> asks; <code>=</code> stores.</li>
<li><code>if</code> runs its block when the condition is <code>True</code>; <code>else</code> runs when it is <code>False</code>.</li>
<li>In an <code>if</code>/<code>elif</code>/<code>else</code> chain only the first true branch runs, so put overlapping conditions hardest-first.</li>
<li><code>and</code>, <code>or</code>, <code>not</code> combine conditions and stop as soon as the answer is known. Each side of <code>or</code> must be a whole condition.</li>
<li>Text compares character by character, so convert <code>input()</code> to a number before comparing numbers.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['2-AP-12', '3A-AP-15'],
      title: 'Repetition', standard: 1, summary: 'for loops and range, while loops, loops that never end, and the accumulator pattern behind most loops you will ever write.',
      blocks: [
        `<p>A famous story tells of a teacher in Germany in the 1780s who kept a class busy by asking them to add up all the whole numbers from 1 to 100. Within moments a boy named Carl Friedrich Gauss, who became one of the greatest mathematicians in history, wrote down 5050. He had not added a hundred numbers; he had spotted a pattern. A computer has no such insight, but it does not need one: it can add a hundred numbers, or a hundred million, without getting bored or making a slip. That is what loops are for. Until the 1960s much of that patient arithmetic was done by people whose job title was <em>computer</em>, such as Katherine Johnson, who worked out the flight paths of America's first astronauts at NASA.</p>`,
        { photo: 'friden-calculator', caption: "A Friden mechanical calculator of the kind on a human computer's desk. It did one multiplication or division at a time; the repetition, step after step, was the person's job, and it is exactly what a loop does." },
        `<p>Computers are valuable because they repeat things without getting bored or careless. Adding up a million numbers, checking every word in a book, redrawing a game's screen sixty times a second: all of these are loops. Python has two kinds. A <code>for</code> loop goes through a collection of items, one at a time. A <code>while</code> loop keeps going for as long as a condition stays true. This lesson gives the exact rule for each, the one pattern that most loops follow, and the three mistakes that most loop bugs come from. So here is the question for the lesson: how do you tell a computer to repeat something a hundred times, or until something happens, without writing it out a hundred times?</p>
<h2>for loops and range</h2>
<div class="stmt"><p><span class="kind">Rule (for).</span> <code>for <i>name</i> in <i>collection</i>:</code> followed by an indented block runs the block once for each item in the collection, in order. Before each run, the name is set to the next item.</p>
<p><span class="kind">Rule (range).</span> <code>range(<i>b</i>)</code> gives the whole numbers 0, 1, …, <i>b</i> − 1. <code>range(<i>a</i>, <i>b</i>)</code> gives <i>a</i>, <i>a</i> + 1, …, <i>b</i> − 1: it starts at <i>a</i> and stops <em>before</em> <i>b</i>, so it gives exactly <i>b</i> − <i>a</i> numbers. <code>range(<i>a</i>, <i>b</i>, <i>step</i>)</code> counts from <i>a</i> in jumps of <i>step</i>, still stopping before <i>b</i>.</p></div>
<p>The block is Lesson 2's indented block again: the loop repeats exactly the indented lines under its colon, and the first line that is not indented runs once, after the loop has finished. Predict the output, then run.</p>`,
        { play: `for i in range(5):
    print("i is", i)
print("done with the first loop")

for i in range(2, 8, 2):    # start at 2, stop before 8, jump by 2
    print(i)`, caption: 'The first loop prints i is 0 up to i is 4: five lines, starting at 0. Then 2, 4 and 6; 8 is not included. Change range(5) to range(1, 6) and compare.' },
        `<p>Starting at 0 feels odd at first, but it matches the way Python numbers the items in a list (Lesson 6), and "stop before <i>b</i>" is what makes the count come out as exactly <i>b</i> − <i>a</i>. When you write a range, say its first and last values aloud; that habit prevents most off-by-one mistakes.</p>
<details class="reveal"><summary>Predict: how many lines do <code>for i in range(10, 20): print(i)</code> and <code>for i in range(10, 0, -2): print(i)</code> print, and what are their last lines?</summary><p>The first prints ten lines (20 − 10), from 10 to 19. The second counts down: 10, 8, 6, 4, 2, five lines. It stops before 0, so 0 is not printed. A negative step counts down, and "stop before" still applies.</p></details>
<p>A <code>for</code> loop can go through other collections too. A list of values, written in square brackets, is one; Lesson 6 is about lists, and for now it is enough to know that the loop visits the values in the order they are written.</p>`,
        { predict: true, play: `for word in ["red", "green", "blue"]:
    print(word, "has", len(word), "letters")`, caption: 'The name word takes each value in turn. len gives the number of characters in a piece of text.' },
        { skill: 'for-range', check: "How many numbers does <code>range(3, 8)</code> give, and what is the last one?", options: ["6 numbers, ending at 8", "5 numbers, ending at 7", "5 numbers, ending at 8"], answer: 1, wrong: ["This counts the end as included (3 to 8 inclusive is 6 numbers), but range stops before 8, so it gives 5 numbers ending at 7.", null, "The count is right (8 \u2212 3), but the last number is not: range never gives its end value, so the numbers run 3 to 7."], why: "<code>range(a, b)</code> starts at a and stops before b: 3, 4, 5, 6, 7, which is b − a = 5 numbers." },
        `<h2>The accumulator pattern</h2>
<p>The most common job for a loop is to build up an answer one step at a time: a total, a count, a largest value. It always takes the same three steps.</p>
<div class="stmt"><p><span class="kind">The accumulator pattern.</span> <em>Before</em> the loop, create a variable holding the answer for "nothing seen yet". <em>Inside</em> the loop, update it using the current item. <em>After</em> the loop, use it.</p></div>
<p>Step through this trace and watch the two variables on every pass. The loop adds up 1 + 2 + 3 + 4 + 5.</p>`,
        {
          fig: 'trace', code: `total = 0\nfor i in range(1, 6):\n    total = total + i\nprint(total)`,
          steps: [
            { line: 1, frames: [{ name: 'variables', vars: { total: 0 } }], note: 'Before the loop: the total of no numbers at all is 0.' },
            { line: 2, frames: [{ name: 'variables', vars: { total: 0, i: 1 } }], note: 'range(1, 6) gives 1 first.' },
            { line: 3, frames: [{ name: 'variables', vars: { total: 1, i: 1 } }], note: 'Inside: total becomes 0 + 1.' },
            { line: 2, frames: [{ name: 'variables', vars: { total: 1, i: 2 } }], note: 'Back to the top of the loop; i is now 2.' },
            { line: 3, frames: [{ name: 'variables', vars: { total: 3, i: 2 } }], note: 'total becomes 1 + 2.' },
            { line: 2, frames: [{ name: 'variables', vars: { total: 3, i: 3 } }] },
            { line: 3, frames: [{ name: 'variables', vars: { total: 6, i: 3 } }] },
            { line: 2, frames: [{ name: 'variables', vars: { total: 6, i: 4 } }] },
            { line: 3, frames: [{ name: 'variables', vars: { total: 10, i: 4 } }] },
            { line: 2, frames: [{ name: 'variables', vars: { total: 10, i: 5 } }], note: '5 is the last value: range(1, 6) stops before 6.' },
            { line: 3, frames: [{ name: 'variables', vars: { total: 15, i: 5 } }] },
            { line: 4, frames: [{ name: 'variables', vars: { total: 15, i: 5 } }], out: '15', note: 'After the loop: the line that is not indented runs once.' }
          ],
          caption: 'A trace of an accumulating loop. Values that changed on the current step are highlighted.'
        },
        `<p>Two things decide whether an accumulator is right. The starting value must be the answer for "nothing seen yet": 0 for a total or a count, 1 for a product (multiplying by 0 would wipe everything out), and <code>""</code> for text. And the update must be <em>inside</em> the loop, indented, while the final <code>print</code> is <em>outside</em>. Indent the <code>print</code> and it runs on every pass, printing 1, 3, 6, 10 and 15.</p>
<p>Several accumulators can share one loop. This one counts the even numbers and keeps track of the largest number seen so far.</p>`,
        { predict: true, play: `count = 0
biggest = 0
for n in [3, 17, 4, 12, 9]:
    if n % 2 == 0:
        count = count + 1
    if n > biggest:
        biggest = n
print("even numbers:", count)
print("biggest:", biggest)`, caption: 'It prints even numbers: 2 and biggest: 17. Only 4 and 12 are even, so count went up twice; biggest was replaced by 3, then 17, and nothing bigger came. Two accumulators can share one loop, each with its own if. Add 20 to the end of the list and predict both lines again.' },
        { skill: 'accumulator', check: "You want the product of the numbers in a list. What should the accumulator start at?", options: ["0", "1", "The first number, with the loop over the rest"], answer: 1, wrong: ["0 is the natural start for a total or a count, so it feels right here too, but a product that starts at 0 stays 0 whatever follows.", null, "This does work for a list that is not empty, and Lesson 6 uses it for the largest. But the accumulator should start as the answer for \"nothing seen yet\", which for a product is 1; that also covers an empty list, where the first number would be an error."], why: "The accumulator holds the answer for \"nothing seen yet\". For a product that is 1; starting at 0 makes every product 0. (Starting at the first item also works, if the list is not empty.)" },
        `<details class="reveal"><summary>Predict: what does this program say is the biggest if the list is <code>[-5, -2, -9]</code>?</summary><p>It says <code>0</code>, which is not in the list at all. No number beats the starting value 0, so it is never replaced. The starting value must be the answer for "nothing seen yet", and for "largest" there is no such number. The fix is to start with the first value in the list itself; Lesson 6 shows how to get it.</p></details>
<h2>while loops</h2>
<div class="stmt"><p><span class="kind">Rule (while).</span> <code>while <i>condition</i>:</code> followed by an indented block checks the condition. If it is <code>False</code>, the loop is over. If it is <code>True</code>, the block runs, and then Python goes back and checks the condition again.</p></div>
<p>Two consequences follow. The condition is checked <em>before</em> every pass, including the first, so if it is <code>False</code> at the start the block never runs. And a <code>while</code> loop stops only when its condition becomes <code>False</code>, which can only happen if something in the block changes it. Use <code>while</code> when you cannot know in advance how many passes are needed. Here is a famous example: halve the number if it is even, otherwise triple it and add 1, until it reaches 1.</p>`,
        { predict: true, play: `n = 6
steps = 0
while n != 1:
    if n % 2 == 0:
        n = n // 2
    else:
        n = 3 * n + 1
    steps = steps + 1
print("reached 1 after", steps, "steps")`, caption: 'It prints reached 1 after 8 steps. From 6, n goes 3, 10, 5, 16, 8, 4, 2, 1: halved when even, tripled plus 1 when odd, and the loop ends when n is 1. Try 27 (111 steps) and 97. Nobody has ever proved that every starting number reaches 1; this is the unsolved Collatz problem.' },
        `<details class="reveal"><summary>Trace it by hand: what is <code>n</code> each time the condition is checked, starting from 6?</summary><table class="small"><tr><th>check</th><th><code>n</code></th><th><code>n != 1</code>?</th><th><code>steps</code> after the pass</th></tr><tr><td>1</td><td>6</td><td>True</td><td>1</td></tr><tr><td>2</td><td>3</td><td>True</td><td>2</td></tr><tr><td>3</td><td>10</td><td>True</td><td>3</td></tr><tr><td>4</td><td>5</td><td>True</td><td>4</td></tr><tr><td>5</td><td>16</td><td>True</td><td>5</td></tr><tr><td>6</td><td>8</td><td>True</td><td>6</td></tr><tr><td>7</td><td>4</td><td>True</td><td>7</td></tr><tr><td>8</td><td>2</td><td>True</td><td>8</td></tr><tr><td>9</td><td>1</td><td>False</td><td>(loop ends)</td></tr></table><p>Nine checks, eight passes. A table with one row per check is the most reliable way to find out what any loop does.</p></details>
<h2>A loop that never ends</h2>
<p>Every <code>while</code> loop needs three things: a variable given a value before the loop, a condition that tests it, and a line in the block that changes it so that the condition eventually becomes <code>False</code>. Leave out the third, or change the variable in a way that never reaches the stopping point, and the loop runs for ever.</p>`,
        { play: `n = 1
while n != 10:
    n = n + 2
print(n)`, expectError: true, caption: 'After a few seconds the page stops it with "Time limit exceeded". n goes 1, 3, 5, 7, 9, 11, 13, …: always odd, never 10. Change != to < and it stops at 11.' },
        `<p>The fix in the caption is a good habit: when a number is moving towards a limit, test with <code>&lt;</code> or <code>&lt;=</code> rather than <code>!=</code>, so that stepping past the limit still ends the loop.</p>
<h2>for or while?</h2>
<p>Use <code>for</code> when you know what to go through: every number in a range, every item in a list. The loop ends by itself when the items run out, so it can never run for ever. Use <code>while</code> when you are repeating <em>until something happens</em> and cannot say in advance how many passes that will take. Many loops can be written either way; choose the one that says what you mean.</p>
<h2>Shortcuts: +=, break and continue</h2>
<div class="stmt"><p><span class="kind">Rule (shortcuts).</span> <code>total += i</code> means <code>total = total + i</code>, and likewise <code>-=</code>, <code>*=</code> and <code>//=</code>. Inside a loop, <code>break</code> leaves the loop immediately, and <code>continue</code> skips the rest of the block and goes on to the next pass.</p></div>
<p><code>break</code> and <code>continue</code> are handy and easy to overuse. If you find yourself writing <code>while True:</code> with a <code>break</code> inside, ask whether the reason for stopping could simply be the <code>while</code> condition. Here is the same search written both ways.</p>`,
        { predict: true, play: `# The first number above 100 that is divisible by 7
n = 101
while True:
    if n % 7 == 0:
        break
    n += 1
print(n)

# The same search with the reason for stopping in the condition
n = 101
while n % 7 != 0:
    n += 1
print(n)`, caption: 'Both print 105: 101 to 104 are not multiples of 7, and 105 is 15 times 7. The first loop is while True with a break inside; the second puts the reason for stopping in the condition, which is shorter and says when the loop ends in one place. Change 101 to 200 and predict the answer first (203).' },
        { skill: 'while-loops', check: "A <code>while</code> loop's condition is False the very first time it is checked. How many times does its block run?", options: ["Once", "Zero times", "It is an error"], answer: 1, wrong: ["This is the belief that the block runs first and the test comes after. Python's while tests first, so a false condition means no pass at all.", null, "A loop whose block never runs is perfectly legal; it simply does nothing, and the program carries on after it."], why: "<code>while</code> checks before every pass, including the first. A false condition at the start means the block never runs." },
        `<h2>Before the exercises</h2>
<p>The first exercise is an accumulator inside a <code>for</code> loop over a range, with an <code>if</code> deciding which numbers to add. The second repeats "until nothing is left", so it needs a <code>while</code> loop. Here is a worked example of each shape. Plan the three accumulator steps first: what the answer is before anything is seen, how one item changes it, and what to do at the end.</p>`,
        { play: `n = int(input("n: "))

# 1. The sum of the even numbers below n
total = 0                  # before: nothing added yet
for i in range(n):         # 0, 1, ..., n - 1: the numbers below n
    if i % 2 == 0:
        total += i         # inside: add only the even ones
print(total)               # after: use the answer

# 2. How many digits n has
digits = 0
while n > 0:               # stop when nothing is left
    n = n // 10            # // 10 removes the last digit
    digits += 1
print(digits)`, testStdin: '1234\n', caption: 'For 1234: the even numbers below it add up to 380072, and it has 4 digits. Try 10: 0 + 2 + 4 + 6 + 8 = 20, and 2 digits.' },
        `<p>In the second part, <code>n // 10</code> drops the last digit (Lesson 1) and <code>n % 10</code> would give that digit. Notice that the loop changes <code>n</code> on every pass, towards 0: that is what makes it stop.</p>`,
        `<details class="reveal"><summary>Puzzle: what was Gauss's pattern? Write a loop that adds 1 to 100 and check his answer.</summary><p>Pair the numbers from the outside in: 1 + 100, 2 + 99, 3 + 98, and so on. Every pair adds to 101, and there are 50 pairs, so the total is 50 × 101 = 5050. The loop is <code>total = 0</code>, then <code>for i in range(1, 101): total += i</code>, and it agrees. In general the sum from 1 to <i>n</i> is <i>n</i>(<i>n</i> + 1)/2: one step instead of <i>n</i>. A loop always works; a formula, when you can find one, is faster.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Off-by-one errors: <code>range(1, 10)</code> stops at 9, so "the numbers up to 10" is <code>range(1, 11)</code>. Starting an accumulator at the wrong value, such as 0 for a product. Indenting the final <code>print</code> so it runs on every pass instead of once at the end. A <code>while</code> loop whose block never changes the variable in its condition, or steps past the stopping point. Testing with <code>!=</code> when <code>&lt;</code> would be safer. Forgetting the colon at the end of a <code>for</code> or <code>while</code> line.</p>` },
        {
          ex: {
            id: 'py-4-3', skill: 'accumulator', kind: 'trace', title: 'Trace the loop',
            prompt: `<p>Before writing loops, read one. Work through this program by hand and fill in the table: each row is a moment just after the line it names has run, and the cells are the values of the variables then. The first row is done for you. Line 3 is reached once at the start of every pass through the loop.</p>`,
            code: `total = 0\ncount = 0\nfor n in [4, 7, 10, 3]:\n    if n > 5:\n        total = total + n\n        count = count + 1\nprint(total, count)`,
            vars: ['n', 'total', 'count'],
            steps: [
              { line: 3, values: { n: '4', total: '0', count: '0' }, show: true },
              { line: 3, values: { n: '7', total: '0', count: '0' }, why: { total: { '4': '4 is not more than 5, so the if skipped lines 5 and 6: total is still 0.' } } },
              { line: 3, values: { n: '10', total: '7', count: '1' }, why: { total: { '17': 'This row is the start of the pass for 10: line 3 has run, but line 5 has not added 10 yet.' } } },
              { line: 3, values: { n: '3', total: '17', count: '2' } },
              { line: 7, values: { n: '3', total: '17', count: '2' }, why: { n: { '-': 'After a for loop the loop variable keeps its last value: n is still 3.' } } }
            ],
            hints: ['Go pass by pass. At line 3, n takes the next value from the list; then the if decides whether lines 5 and 6 run.', 'Only 7 and 10 are more than 5, so total goes 0, 0, 7, 17 at the starts of the passes, and count 0, 0, 1, 2. After the loop, n keeps its last value.'],
            solution: '<p>n: 4, 7, 10, 3, 3. total: 0, 0, 7, 17, 17. count: 0, 0, 1, 2, 2. The program prints <code>17 2</code>.</p>',
            followup: 'Change the list to [6, 6, 6] and trace it again before running it. Tracing by hand is how programmers check a loop they are not sure of: it is slow, and it finds the mistake.'
          }
        },
        {
          ex: {
            id: 'py-4-4', skill: 'for-range', kind: 'parsons', title: 'Put it in order: even numbers',
            prompt: `<p>Build a program that reads a whole number <code>n</code> and prints the even numbers from 2 up to and including <code>n</code>, one per line, and then the word <code>done</code>. For 6 it prints 2, 4, 6 and done. In Python the indentation is part of the program, so put each line at the right depth.</p>`,
            lines: ['n = int(input())', 'for i in range(2, n + 1):', '    if i % 2 == 0:', '        print(i)', 'print("done")'],
            distractors: ['for i in range(2, n):', 'if i % 2 == 1:'],
            tests: [{ stdin: '6', expect: '2\n4\n6\ndone' }, { stdin: '3', expect: '2\ndone' }, { stdin: '2', expect: '2\ndone' }, { stdin: '9', expect: '2\n4\n6\n8\ndone' }],
            sampleStdin: '6',
            hints: ['"Up to and including n" needs the range to stop at n + 1, because range never includes its end.', 'The if belongs inside the loop, and the print(i) inside the if. "done" is printed once, after the loop, so it is not indented at all.'],
            followup: 'Now write the same program from memory in the Code Lab, with a while loop instead of for. Then make it count by 2 from the start, with no if at all: range has a third argument, the step.'
          }
        },
        {
          ex: {
            id: 'py-4-1', skill: 'accumulator', title: 'Sum of multiples',
            prompt: `<p>Read a number <em>n</em> and print the sum of all multiples of 3 or 5 below <em>n</em>. For <em>n</em> = 10 the multiples are 3, 5, 6 and 9, and the sum is 23. A number that is a multiple of both, such as 15, is added once.</p>`,
            starter: `n = int(input("n: "))\ntotal = 0\nfor i in range(n):\n    ...\nprint(total)`,
            solution: `n = int(input("n: "))\ntotal = 0\nfor i in range(n):\n    if i % 3 == 0 or i % 5 == 0:\n        total += i\nprint(total)`,
            hints: ['Inside the loop, test whether i % 3 == 0 or i % 5 == 0, and add i to the total only then.', 'range(n) already stops before n, which is what "below n" asks for. Because the test uses or, 15 is added once, not twice.'],
            tests: [{ stdin: '10', expect: '23' }, { stdin: '16', expect: '60' }, { stdin: '20', expect: '78' }, { stdin: '1000', expect: '233168' }, { stdin: '3', expect: '0' }],
            failTip: 'If 16 gives 75, you are adding 15 twice: use one if with or, not two separate ifs.',
            followup: 'range(n) includes 0, which is a multiple of everything. It does no harm here, because adding 0 changes nothing.'
          }
        },
        {
          ex: {
            id: 'py-4-2', skill: 'while-loops', title: 'Digits',
            prompt: `<p>Read a positive whole number and print the sum of its digits. For 1234 that is 1 + 2 + 3 + 4 = 10. Do it with arithmetic and a <code>while</code> loop: <code>n % 10</code> is the last digit and <code>n // 10</code> drops it. Stop when nothing is left.</p>`,
            starter: `n = int(input("n: "))\ntotal = 0\nwhile ...:\n    ...\nprint(total)`,
            solution: `n = int(input("n: "))\ntotal = 0\nwhile n > 0:\n    total += n % 10\n    n = n // 10\nprint(total)`,
            hints: ['The loop continues while there are digits left: while n > 0.', 'Each pass: add n % 10 to the total, then set n = n // 10 so that the loop makes progress towards 0.'],
            tests: [{ stdin: '1234', expect: '10' }, { stdin: '9', expect: '9' }, { stdin: '999999', expect: '54' }, { stdin: '1000', expect: '1' }, { stdin: '907', expect: '16' }],
            mustContain: [{ re: /\bwhile\b/, msg: 'Use a while loop for this one, as the exercise asks.' }],
            mustNotContain: [{ re: /str\s*\(\s*n/, msg: 'Do the arithmetic version: no converting the number to a string.' }],
            failTip: 'If the program never finishes, check that n gets smaller on every pass: n = n // 10 must be inside the loop.',
            followup: 'Make the program print how many digits there are as well as their sum. Then think about what it prints for 0: the loop never runs, so is that the answer you want?'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>The answer to the opening question: write the repeated steps once, indented under a <code>for</code> (when you know what to go through) or a <code>while</code> (when you repeat until something happens), and the computer does the repeating.</li>
<li><code>for <i>name</i> in <i>collection</i>:</code> runs its block once per item. <code>range(<i>a</i>, <i>b</i>)</code> gives <i>a</i> up to but not including <i>b</i>: exactly <i>b</i> − <i>a</i> numbers.</li>
<li><code>while <i>condition</i>:</code> checks before every pass, so its block may run zero times, and something in the block must move the condition towards <code>False</code>.</li>
<li>Accumulator: start with the answer for "nothing seen yet", update inside the loop, use it after.</li>
<li>Use <code>for</code> when you know what to go through, <code>while</code> for "until something happens".</li>
<li><code>+=</code> shortens updates; <code>break</code> leaves a loop; <code>continue</code> skips to the next pass.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['2-AP-11', '2-AP-12', '3A-AP-15'], standard: 1,
      title: 'Checkpoint: the first four lessons', checkpoint: true, summary: 'No new ideas: mixed questions on values, names, errors, decisions and loops, then a choice of the right loop and one program that uses all four lessons. Which tool fits the job?',
      blocks: [
        '<p>This lesson teaches nothing new. It mixes questions from the four lessons before it, because telling apart things that look alike, such as <code>=</code> and <code>==</code>, <code>for</code> and <code>while</code>, or text and numbers, is a skill of its own, and it only grows when the questions are mixed. Answer each one before looking back. If one surprises you, it will come back on the Review page after a day.</p><p>Ready? Here is the question underneath all of them: when a program does something you did not expect, which of your four lessons holds the rule it followed?</p><h2>Mixed questions</h2>',
        { skill: 'values-types', check: 'A program runs <code>age = input("Age: ")</code> and the person types 12. What does <code>age + 1</code> do?', options: ['It gives 13', 'It stops with an error, because <code>age</code> is text and 1 is a number', 'It gives <code>"121"</code>'], answer: 1, wrong: ['This forgets that <code>input()</code> always hands back a string. Only <code>int(input(...))</code> would give the number 12 to add to.', null, 'Python never guesses what you meant. <code>+</code> joins two strings or adds two numbers; between a string and a number it refuses.'], why: '<code>input()</code> hands back text, and Python will not add a string and a number. Convert first: <code>int(age) + 1</code> is 13.' },
        { skill: 'arithmetic', check: 'A program must turn 135 seconds into whole minutes and the seconds left over. Which two operators does it need?', options: ['<code>/</code> and <code>-</code>', '<code>//</code> and <code>%</code>', '<code>**</code> and <code>*</code>'], answer: 1, wrong: ['<code>/</code> gives a float, 2.25, with the leftover turned into a fraction of a minute instead of a number of seconds.', null, '<code>**</code> is the power: 135 ** 60 is a huge number that has nothing to do with minutes.'], why: '<code>135 // 60</code> is 2, the whole minutes, and <code>135 % 60</code> is 15, what is left over.' },
        { skill: 'assignment', check: 'After <code>a = 3</code>, then <code>b = a</code>, then <code>a = 10</code>, what is <code>b</code>?', options: ['10, because <code>b</code> follows <code>a</code>', '3', 'An error: a name cannot be given a value twice'], answer: 1, wrong: ['This reads <code>b = a</code> as a standing promise that b is always whatever a is. It is an instruction carried out once: b was attached to the value 3 and stays there.', null, 'A name can be moved to a new value as often as you like; that is what <code>x = x + 1</code> does.'], why: '<code>b = a</code> attaches the name b to the value that a had at that moment, 3. Moving a to 10 later does not move b.' },
        { skill: 'error-stages', check: 'Which of these does Python report <em>before</em> it runs any line of the program?', options: ['A <code>NameError</code> from a misspelt variable name', 'A missing colon at the end of <code>if x &gt; 3</code>', 'A <code>ZeroDivisionError</code> from <code>1 / 0</code>'], answer: 1, wrong: ['A NameError appears only when the line that uses the name is reached, so the lines before it have already run.', null, 'Python can only find a division by zero when it does the division, so the lines before it run first.'], why: 'A syntax error is found while Python reads the whole program, so nothing runs. A NameError or ZeroDivisionError is found only when execution reaches that line.' },
        { skill: ['indentation', 'for-range'], check: 'A <code>for</code> loop has the line <code>print("done")</code> indented to line up with the loop body. How often is "done" printed?', options: ['Once, after the loop', 'Once for every pass of the loop', 'Never'], answer: 1, wrong: ['That is what happens when the print is <em>not</em> indented. The indented lines are the block, and the block runs on every pass.', null, 'The line is part of the block, and a block that is reached runs. It would not run only if the loop made zero passes.'], why: 'The indented lines under the colon are the loop body, so a print indented with them runs once per pass. To print once at the end, take it out to the left margin.' },
        { skill: 'boolean-logic', check: 'Which condition is true exactly when <code>n</code> is from 1 to 9, both included?', options: ['<code>n &gt;= 1 or n &lt;= 9</code>', '<code>n &gt;= 1 and n &lt;= 9</code>', '<code>n &gt; 1 and n &lt; 9</code>'], answer: 1, wrong: ['With or, every number passes: 50 is at least 1, and -5 is at most 9. The two halves must both hold, so the word is and.', null, 'This leaves out 1 and 9 themselves. The question says both ends are included, so the tests need <code>&gt;=</code> and <code>&lt;=</code>.'], why: 'Both halves must hold, so use <code>and</code>, and the ends count, so use <code>&gt;=</code> and <code>&lt;=</code>.' },
        { skill: 'branching', check: 'A program must print exactly one of "small", "medium" or "large" for a number. Which structure fits?', options: ['Three separate <code>if</code> statements, one for each word', 'One <code>if</code>/<code>elif</code>/<code>else</code> chain', 'A <code>for</code> loop over the three words'], answer: 1, wrong: ['Separate ifs are each tested on their own, so with overlapping conditions (such as n &gt; 0 and n &gt; 10) two words can print.', null, 'Nothing here repeats: the program makes one choice. A loop would run the choice more than once.'], why: 'An <code>if</code>/<code>elif</code>/<code>else</code> chain runs exactly one block: the first whose test is true, or the <code>else</code>.' },
        { skill: ['while-loops', 'for-range'], check: 'Which job is for a <code>while</code> loop, rather than a <code>for</code> loop over a <code>range</code>?', options: ['Print the numbers from 1 to 100', 'Keep asking for a password until the person gets it right', 'Add up the five marks in a list'], answer: 1, wrong: ['The count is known in advance, so <code>for i in range(1, 101)</code> is the shorter and safer loop.', null, 'The marks are a collection with a known size: <code>for mark in marks</code> visits them all and stops by itself.'], why: 'When nobody knows in advance how many passes there will be, repeat while a condition holds. When the count is known, <code>for</code> with <code>range</code> cannot forget to step.' },
        { skill: 'accumulator', check: 'A loop adds up marks into <code>total</code>. Where must <code>total = 0</code> go?', options: ['Before the loop', 'As the first line inside the loop', 'After the loop'], answer: 0, wrong: [null, 'Then total goes back to 0 on every pass, and at the end it holds only the last mark.', 'Then the first pass does <code>total = total + mark</code> before total exists, which is a NameError.'], why: 'The accumulator starts once, before the loop, and the loop body changes it. After the loop it holds the answer.' },
        '<p>Two exercises to finish the unit. The first needs no code: choose the plan that works. The second uses ideas from all four lessons in one program.</p>',
        {
          ex: {
            id: 'py-14-1', skill: ['while-loops', 'accumulator'], kind: 'choice', title: 'The till',
            prompt: '<p>A shop till reads the price of each item the cashier types, and stops when the cashier types 0. It then prints the total. The shop does not know in advance how many items there will be. Which plan is right?</p>',
            options: [
              { text: 'Set <code>total = 0</code>, then <code>for i in range(10)</code>: read a price and add it to <code>total</code>. Print the total after the loop.', why: 'This always reads exactly ten prices. A customer with three items would be asked for seven more, and one with twelve would be cut off.' },
              { text: 'Set <code>total = 0</code> and read the first price. While the price is not 0: add it to <code>total</code> and read the next price. Print the total after the loop.', ok: true },
              { text: 'While the price is not 0: set <code>total = 0</code>, add the price to it, and read the next price. Print the total after the loop.', why: 'Setting total to 0 inside the loop wipes the total on every pass. At the end it holds only the last price.' },
              { text: 'Read a price. <code>if</code> the price is not 0, add it to <code>total</code>. Print the total.', why: 'An if makes its choice once, so only the first price is ever added. Repeating needs a loop.' }
            ],
            hints: ['Two things are unknown here: how many items there are, and so how many times to repeat. Which of the two loops fits that?', 'The accumulator must start before the loop and must not be reset inside it. The first price has to be read before the while test can look at it.'],
            solution: '<p>Start the total at 0, read the first price, then <code>while price != 0:</code> add it and read the next one. The test looks at the price just read, and the total is printed once after the loop. A <code>for</code> loop needs to know the count; an <code>if</code> does not repeat; and a total set to 0 inside the loop is reset on every pass.</p>',
            failTip: 'Check each plan for three things: does it repeat the right number of times, does the total start once, and is the answer printed once at the end?',
            followup: 'Write the winning plan as a program in the Code Lab, with int(input()) for each price. Then add a count of the items, as a second accumulator that goes up by 1 for each price.'
          }
        },
        {
          ex: {
            id: 'py-14-2', skill: ['accumulator', 'branching', 'for-range'], title: 'Skip the threes',
            prompt: '<p>Read a whole number <code>n</code>. Print each number from 1 up to and including <code>n</code> on its own line, but print the word <code>skip</code> in place of every multiple of 3. After the loop, print <code>total: </code> and the sum of the numbers that were <em>not</em> skipped. For 6 the output is the six lines <code>1</code>, <code>2</code>, <code>skip</code>, <code>4</code>, <code>5</code>, <code>skip</code>, and then <code>total: 12</code>.</p>',
            starter: 'n = int(input("n: "))\ntotal = 0\nfor i in range(...):\n    ...\nprint("total:", total)',
            solution: 'n = int(input("n: "))\ntotal = 0\nfor i in range(1, n + 1):\n    if i % 3 == 0:\n        print("skip")\n    else:\n        print(i)\n        total += i\nprint("total:", total)',
            hints: ['"Up to and including n" needs range(1, n + 1), because range stops before its end. Inside the loop, i % 3 == 0 asks whether i is a multiple of 3.', 'Use if/else: the if branch prints skip, and the else branch prints i and adds it to total. The total is printed once, after the loop, so that line is not indented.'],
            tests: [{ stdin: '6', expect: '1\n2\nskip\n4\n5\nskip\ntotal: 12' }, { stdin: '1', expect: '1\ntotal: 1' }, { stdin: '3', expect: '1\n2\nskip\ntotal: 3' }, { stdin: '10', expect: '1\n2\nskip\n4\n5\nskip\n7\n8\nskip\n10\ntotal: 37' }],
            failTip: 'If the last number is missing, the range stops one short: range(1, n) never reaches n. If the total is too big, skipped numbers are being added: add inside the else only.',
            followup: 'Change the rule so that multiples of 3 or of 5 are skipped. Which line changes, and which operator joins the two tests?'
          }
        },
        '<div class="recap"><h3>Unit one in a few lines</h3><ul>\n<li><code>=</code> stores a value under a name and is done once; <code>==</code> asks a question. A name is a label that can move, and other names do not follow it.</li>\n<li><code>input()</code> hands back text; <code>int()</code> and <code>float()</code> convert. <code>/</code> always gives a float; <code>//</code> and <code>%</code> give the whole part and the remainder.</li>\n<li>Syntax errors are found before anything runs; other errors stop the program at the line that fails. Indentation is the block.</li>\n<li>An <code>if</code>/<code>elif</code>/<code>else</code> chain runs exactly one block. Join tests with <code>and</code>, <code>or</code> and <code>not</code>.</li>\n<li><code>for</code> with <code>range</code> when the count is known, and <code>while</code> when it is not. An accumulator starts once, before the loop.</li>\n<li>Next: many values under one name, with lists.</li>\n</ul></div>'
      ]
    },
    /* ================================================================== */
    {
      standards: ['3A-AP-14', '3A-DA-10', '3B-AP-12'],
      title: 'Lists', standard: 1, summary: 'Many values under one name: positions that start at 0, slices, looping, changing a list in place, and the famous surprise when two names share one list.',
      blocks: [
        `<p>A single variable holds one value. Real programs juggle many: a playlist of 2,000 songs, the ten best scores in a game, every word in a message. Python keeps an ordered collection of values under one name in a <em>list</em>. By the end of this lesson you will be able to pick out any song in a playlist, slice out the chorus of a list, and explain a surprise that catches almost every beginner. So here is the question for the lesson: how does Python find one song among two thousand, and what goes wrong when two names share one playlist?</p>
<h2>Making a list, and finding things in it</h2>
<div class="stmt"><p><span class="kind">Rule (lists).</span> A list is written as values between square brackets, separated by commas: <code>[88, 92, 79]</code>. The empty list is <code>[]</code>. <code>len(xs)</code> is the number of items in <code>xs</code>.</p>
<p><span class="kind">Rule (positions).</span> The items are numbered from 0: <code>xs[0]</code> is the first item and <code>xs[len(xs) - 1]</code> is the last. Negative positions count from the end: <code>xs[-1]</code> is the last item and <code>xs[-2]</code> the one before it. Any other position is an error, an <code>IndexError</code>.</p></div>
<p>Here is a playlist of five made-up songs. Predict each line before you run it.</p>`,
        { predict: true, play: `playlist = ["Moon Socks", "Tiny Robot", "Rain on Tin", "Lemon Tree Radio", "Goodnight Pixel"]
print(len(playlist))
print(playlist[0])      # the first song
print(playlist[2])      # the third song
print(playlist[-1])     # the last song
print(playlist[len(playlist) - 1])   # also the last song`, caption: 'It prints 5, then Moon Socks, Rain on Tin, and Goodnight Pixel twice. Position 0 is the first song, so position 2 is the third; both -1 and len(playlist) - 1 name the last one. Add print(playlist[5]) and read the error: there is no position 5 in a list of five.' },
        { skill: 'list-index', check: "<code>xs = [10, 20, 30, 40]</code>. What is <code>xs[-1]</code>, and what is <code>xs[4]</code>?", options: ["40 and 40", "40 and an IndexError", "10 and 40"], answer: 1, wrong: ["This treats position 4 as the last item, but positions start at 0, so a list of four has positions 0 to 3 and xs[4] is one past the end.", null, "This takes -1 to mean the first item. Negative positions count from the end, so -1 is the last."], why: "Negative positions count from the end, so −1 is the last item. Positions run 0 to 3; 4 is one past the end." },
        `<details class="reveal"><summary>Why start counting at 0? It seems backwards.</summary><p>Think of a position as "how many steps from the front". The first song is zero steps from the front, the second is one step, and so on. Counting this way makes <code>range(len(xs))</code>, from Lesson 4, give exactly the valid positions, 0 up to <code>len(xs) - 1</code>. Almost every programming language counts from 0 for the same reason. (C++ has an even more concrete one, as its Lesson 7 shows.)</p></details>
<h2>Slices</h2>
<div class="stmt"><p><span class="kind">Rule (slices).</span> <code>xs[<i>a</i>:<i>b</i>]</code> is a <em>new</em> list containing the items at positions <i>a</i>, <i>a</i> + 1, …, <i>b</i> − 1: it starts at <i>a</i> and stops <em>before</em> <i>b</i>, exactly like <code>range(<i>a</i>, <i>b</i>)</code>. Leave out <i>a</i> to start from the beginning, and <i>b</i> to go to the end. <code>xs[<i>a</i>:<i>b</i>:<i>step</i>]</code> takes every <i>step</i>-th item. A slice never raises an error: positions past the end are simply treated as the end.</p></div>
<p>A good way to picture a slice is to number the <em>gaps between</em> the items, not the items themselves. Then <code>xs[1:4]</code> means "cut at gap 1 and gap 4, and keep what is in between". Drag the boundaries in the figure until the rule feels obvious.</p>`,
        { fig: 'indexer', caption: 'A slice keeps everything between the two marked gaps. Negative numbers count gaps from the end, so items[-2:] is "the last two".' },
        { predict: true, play: `days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
print(days[1:4])
print(days[:2], days[5:])
print(days[-2:])
print(days[::2])          # every second day
print(days[::-1])         # a step of -1 walks backwards
print(days[5:100])        # past the end: no error
print("Wed" in days, "Funday" in days)`, caption: '<code>in</code> asks "is this value somewhere in the list?" and gives True or False.' },
        { skill: 'slicing', check: "<code>days = [\"Mon\", \"Tue\", \"Wed\", \"Thu\", \"Fri\"]</code>. What is <code>days[1:3]</code>?", options: ["<code>[\"Tue\", \"Wed\", \"Thu\"]</code>", "<code>[\"Tue\", \"Wed\"]</code>", "<code>[\"Mon\", \"Tue\", \"Wed\"]</code>"], answer: 1, wrong: ["This includes the item at position 3, but a slice stops before its second number, so position 3 is left out.", null, "This counts the positions from 1, as people do, so 1 to 3 becomes the first three items. Python counts from 0: position 1 is Tue."], why: "A slice starts at the first position and stops before the second, like range: positions 1 and 2." },
        `<details class="reveal"><summary>Slice challenge: using <code>days</code>, write one slice for each of these. The weekdays. The middle three days. Every day except the first and the last.</summary><p><code>days[:5]</code>, then <code>days[2:5]</code> (Wed, Thu, Fri), then <code>days[1:-1]</code>. The last one works because −1 names the gap before the last item. Each slice has <i>b</i> − <i>a</i> items when both ends are inside the list: 5, 3, and, since −1 is gap 6 here, 6 − 1 = 5.</p></details>
<h2>Looping over a list</h2>
<p>Lesson 4's <code>for</code> loop goes through any collection, and a list is the most common one. Looping over the items directly is usually clearer than looping over positions. When you need both the position and the item, <code>enumerate</code> hands you the pair.</p>`,
        { predict: true, play: `playlist = ["Moon Socks", "Tiny Robot", "Rain on Tin", "Lemon Tree Radio"]

for song in playlist:
    print("Now playing:", song)

for i, song in enumerate(playlist):
    print(i + 1, song)          # people count from 1 even though Python counts from 0

scores = [88, 92, 79, 95]
total = 0
for s in scores:
    total += s
print("average:", total / len(scores))`, caption: 'It prints four Now playing lines, then 1 Moon Socks down to 4 Lemon Tree Radio, then average: 88.5 (the scores add up to 354, and 354 / 4 is 88.5). The last loop is the accumulator pattern from Lesson 4, now over a list. Dividing by len(scores) instead of 4 keeps it right when the list changes length.' },
        `<p>Lesson 4 left a puzzle: to find the largest number, what should the accumulator start at? 0 fails for a list of negative numbers. Now we can do it properly: start with the first item, <code>xs[0]</code>, which is certainly one of the candidates, and let the loop replace it whenever something bigger comes along. That is the first exercise.</p>
<h2>Changing a list</h2>
<div class="stmt"><p><span class="kind">Rule (changing a list in place).</span> <code>xs[<i>i</i>] = <i>v</i></code> replaces the item at position <i>i</i>. <code>xs.append(<i>v</i>)</code> adds <i>v</i> at the end. <code>xs.pop()</code> removes the last item and gives it back; <code>xs.pop(<i>i</i>)</code> removes the item at position <i>i</i>. <code>xs.insert(<i>i</i>, <i>v</i>)</code> puts <i>v</i> at position <i>i</i>, moving the rest along. <code>xs.sort()</code> puts the items in order. These change the list itself, and <code>append</code>, <code>insert</code> and <code>sort</code> give back nothing, the special value <code>None</code>.</p></div>`,
        { predict: true, play: `queue = ["Ada", "Grace", "Alan"]
queue.append("Katherine")     # joins at the back
print(queue)
first = queue.pop(0)          # leaves from the front
print(first, "is served;", queue, "are waiting")
queue.insert(1, "Tim")        # pushes in at position 1
print(queue)
queue[0] = "Grace H."         # replaces an item
print(queue)`, caption: 'A queue at a ticket office. It prints the four names, then Ada is served with three left waiting, then Tim squeezed in at position 1, then the front of the queue renamed Grace H. pop(0) removes and gives back the first person, and everyone behind moves up one position. Change pop(0) to pop() and predict who is served.' },
        `<p>That last sentence of the rule causes a classic mistake. Because <code>append</code> gives back <code>None</code>, writing <code>xs = xs.append(4)</code> changes the list and then throws it away, replacing it with <code>None</code>. The same goes for <code>xs = xs.sort()</code>. If you want a sorted <em>copy</em> and to keep the original, use <code>sorted(xs)</code>, which gives back a new list.</p>`,
        { play: `xs = [5, 3, 9, 1]
print(sorted(xs), xs)    # a sorted copy; xs is unchanged
xs.sort()                # sorts xs itself, gives back None
print(xs)

ys = [1, 2, 3]
ys = ys.append(4)        # the classic mistake
print(ys)`, caption: 'The last line prints None: the list was lost. Write ys.append(4) on its own line instead.' },
        `<h2>Two names, one list</h2>
<p>Here is the surprise promised at the start. Imagine a family shopping list on the fridge. You and your sister both read and write the same sheet of paper. Your brother photocopied it yesterday. When your sister adds "cake", which lists have cake on them?</p>
<div class="stmt"><p><span class="kind">Rule (names and lists).</span> An assignment such as <code>b = a</code> does not copy a list. It makes <code>b</code> a second name for the <em>same</em> list, so a change made through either name is seen through both. To make an independent copy, write <code>b = a[:]</code> or <code>b = list(a)</code>. The test <code>a is b</code> asks "are these the same list?", while <code>a == b</code> asks "do they contain equal items?".</p></div>`,
        { predict: true, play: `fridge = ["milk", "eggs"]
sister = fridge          # the same sheet of paper
brother = fridge[:]      # yesterday's photocopy
sister.append("cake")
print("fridge: ", fridge)
print("sister: ", sister)
print("brother:", brother)
print(sister is fridge, brother is fridge)`, caption: 'fridge and sister both show cake: they are two names for one list. brother\u2019s copy was made before cake was added, and it is a separate list.' },
        { skill: 'aliasing', check: "After <code>a = [1, 2, 3]</code>, <code>b = a</code>, <code>b.append(4)</code>, what is <code>a</code>?", options: ["<code>[1, 2, 3]</code>: b is a copy", "<code>[1, 2, 3, 4]</code>: a and b name the same list", "An error: a cannot be changed through b"], answer: 1, wrong: ["This is the belief that b = a copies the list, as it would copy a number. For a list it only adds a second name; a[:] would copy.", null, "Python has no rule that stops one name from changing a list another name also uses; both names reach the same list, so the change is allowed and seen by both."], why: "<code>b = a</code> does not copy. Both names refer to one list, so a change through either is seen through both. <code>b = a[:]</code> would have made a copy." },
        `<details class="reveal"><summary>Predict: after <code>a = [1, 2, 3]</code>, <code>b = a</code>, <code>b[0] = 99</code>, what is <code>a</code>? And what if the second line had been <code>b = a[:]</code>?</summary><p><code>[99, 2, 3]</code>: <code>a</code> and <code>b</code> are the same list, so changing it through <code>b</code> changes what <code>a</code> sees. With <code>b = a[:]</code>, <code>b</code> is a copy, and <code>a</code> stays <code>[1, 2, 3]</code>. Numbers and text never cause this surprise, because they cannot be changed in place: <code>x = x + 1</code> makes a new number, as Lesson 1's picture of names and values showed.</p></details>
<h2>Handy built-ins</h2>
<div class="tbl-wrap"><table>
<tr><th>what you want</th><th>write</th></tr>
<tr><td>how many items</td><td><code>len(xs)</code></td></tr>
<tr><td>add to the end / remove the last</td><td><code>xs.append(v)</code>, <code>xs.pop()</code></td></tr>
<tr><td>insert / remove by position</td><td><code>xs.insert(i, v)</code>, <code>xs.pop(i)</code></td></tr>
<tr><td>total, smallest, largest</td><td><code>sum(xs)</code>, <code>min(xs)</code>, <code>max(xs)</code></td></tr>
<tr><td>sorted copy / sort in place</td><td><code>sorted(xs)</code>, <code>xs.sort()</code></td></tr>
<tr><td>is it there? where?</td><td><code>v in xs</code>, <code>xs.index(v)</code></td></tr>
<tr><td>a list of numbers</td><td><code>list(range(10))</code></td></tr>
<tr><td>join two lists / repeat one</td><td><code>xs + ys</code>, <code>[0] * 5</code></td></tr>
</table></div>
<p>The exercises ask you to write two of these yourself. That is on purpose: knowing what <code>max</code> does inside is what lets you write the things Python has <em>no</em> built-in for.</p>
<h2>Before the exercises</h2>
<p>Both exercises are written as small <em>functions</em>, which Lesson 8 covers properly. For now you need only three facts. <code>def name(xs):</code> starts a function that receives a list called <code>xs</code>. Its indented block is the recipe. And <code>return value</code> hands the answer back, so that <code>print(name([3, 1, 2]))</code> prints it. Here are two worked examples, one for each kind of accumulator you will need: a number, and a new list.</p>`,
        { predict: true, play: `def count_above(xs, limit):
    count = 0                    # before: nothing counted yet
    for x in xs:
        if x > limit:
            count += 1           # inside: count the ones that pass
    return count                 # after: hand the answer back

def evens(xs):
    result = []                  # the accumulator is an empty list
    for x in xs:
        if x % 2 == 0:
            result.append(x)     # add to it; never write result = result.append(x)
    return result

print(count_above([88, 92, 79, 95], 90))
print(evens([3, 8, 5, 6, 2]))`, caption: 'Prints 2 (92 and 95 are above 90) and [8, 6, 2]. The second function builds a brand-new list and leaves its input alone. Change the limit to 80 and predict the first answer (3).' },
        { aside: `<p><b>Common mistakes in this lesson.</b> <code>xs[len(xs)]</code> is one past the end and raises <code>IndexError</code>; the last item is <code>xs[-1]</code>. Forgetting that positions start at 0, so the third item is <code>xs[2]</code>. Writing <code>xs = xs.append(v)</code> or <code>xs = xs.sort()</code>, which sets <code>xs</code> to <code>None</code>. Thinking <code>b = a</code> copies a list. Starting a "largest so far" accumulator at 0 instead of at the first item. Changing a list while a <code>for</code> loop is going through it, which skips or repeats items; loop over a copy, <code>for x in xs[:]</code>, instead.</p>` },
        {
          ex: {
            id: 'py-5-3', skill: 'list-index', kind: 'trace', title: 'Trace the position of the best',
            prompt: `<p>This program finds the <em>position</em> of the highest score, not the score itself. Fill in the table: each row is a moment when line 3 starts a pass of the loop (and the last row, after line 6), with the values of <code>i</code> and <code>best</code> then. The first row is done for you.</p>`,
            code: `scores = [88, 92, 79, 95]\nbest = 0\nfor i in range(len(scores)):\n    if scores[i] > scores[best]:\n        best = i\nprint(best)`,
            vars: ['i', 'best'],
            steps: [
              { line: 3, values: { i: '0', best: '0' }, show: true },
              { line: 3, values: { i: '1', best: '0' }, why: { best: { '1': 'This row is the start of the pass for i = 1: line 5 has not run yet, so best has not moved to 1.' } } },
              { line: 3, values: { i: '2', best: '1' }, why: { best: { '0': 'In the pass for i = 1, 92 was more than scores[0], 88, so best became 1.' } } },
              { line: 3, values: { i: '3', best: '1' }, why: { best: { '2': '79 is not more than scores[1], 92, so best did not change: it is a position, not a score.' } } },
              { line: 6, values: { i: '3', best: '3' }, why: { best: { '1': 'In the pass for i = 3, 95 was more than scores[1], 92, so best became 3.' } } }
            ],
            hints: ['best is a position in the list, not a score. It changes only when scores[i] is more than the score at position best.', 'best is 0 at the start of the passes for positions 0 and 1 (it becomes 1 inside the pass for position 1), stays 1 for 79, and becomes 3 inside the pass for 95.'],
            solution: '<p>i: 0, 1, 2, 3, 3. best: 0, 0, 1, 1, 3. The program prints <code>3</code>: the highest score, 95, is at position 3.</p>',
            followup: 'Change 95 to 92 and trace it again before running it. Which position does it print, and why does the strict > matter?'
          }
        },
        {
          ex: {
            id: 'py-18-1', skill: 'aliasing', kind: 'parsons', title: 'Put it in order: the squares',
            prompt: `<p>Build a program that reads a whole number <code>n</code> and prints the list of the squares of 1 up to and including <code>n</code>. For 3 it prints <code>[1, 4, 9]</code>. The list is built with <code>append</code>, one square per pass. Not every block belongs in the program.</p>`,
            lines: ['n = int(input())', 'squares = []', 'for i in range(1, n + 1):', '    squares.append(i * i)', 'print(squares)'],
            distractors: ['    squares = squares.append(i * i)', 'for i in range(1, n):'],
            tests: [{ stdin: '3', expect: '[1, 4, 9]' }, { stdin: '1', expect: '[1]' }, { stdin: '5', expect: '[1, 4, 9, 16, 25]' }],
            sampleStdin: '3',
            hints: ['The empty list has to exist before the loop starts, and it is printed once, after the loop has finished, so that line is not indented.', 'append changes the list itself and gives back None, so it is a statement on its own line. And "up to and including n" means the range must stop at n + 1.'],
            failTip: 'If the program prints None, one block has squares = squares.append(...): append changes the list and gives back None, so that block does not belong.',
            followup: 'Change the program so that it builds only the squares of the odd numbers up to n. Where does the if go, and how deep is it indented?'
          }
        },
        {
          ex: {
            id: 'py-5-1', skill: 'accumulator', title: 'Largest without max()',
            prompt: `<p>Write a function <code>largest(xs)</code> that returns the largest number in a non-empty list, without using the built-in <code>max</code> or <code>sorted</code>. Use the accumulator pattern: start with the first item, then walk the list and replace your answer whenever you see something bigger. The function heading and the <code>return</code> line are written for you.</p>`,
            starter: `def largest(xs):\n    best = xs[0]\n    for x in xs:\n        ...\n    return best\n\nprint(largest([3, 17, 4, 12]))`,
            solution: `def largest(xs):\n    best = xs[0]\n    for x in xs:\n        if x > best:\n            best = x\n    return best\n\nprint(largest([3, 17, 4, 12]))`,
            hints: ['Inside the loop: if x > best, then best = x.', 'Starting from xs[0] rather than 0 is what makes it work for a list of negative numbers.'],
            tests: [{ call: 'largest([3, 17, 4, 12])', expect: '17' }, { call: 'largest([-5, -2, -9])', expect: '-2' }, { call: 'largest([42])', expect: '42' }, { call: 'largest([1.5, 0.3, 1.49])', expect: '1.5' }, { call: 'largest([4, 4, 4])', expect: '4' }],
            mustNotContain: [{ re: /\bmax\s*\(|\bsorted\s*\(|\.sort\s*\(/, msg: 'No max(), sorted() or .sort(): write the loop yourself.' }],
            failTip: 'If the all-negative test fails, check where best starts: it must start at xs[0], not at 0.',
            followup: 'The loop compares best with xs[0] on its first pass, which is harmless. for x in xs[1:] would skip that one needless comparison.'
          }
        },
        {
          ex: {
            id: 'py-5-2', skill: 'aliasing', title: 'Remove duplicates',
            prompt: `<p>Write <code>unique(xs)</code>, which returns a <em>new</em> list containing each value from <code>xs</code> once, in the order it first appeared. So <code>unique([3, 1, 3, 2, 1])</code> is <code>[3, 1, 2]</code>. Like <code>evens</code> above, the accumulator is a list: start with <code>[]</code>, and append each item only if it is not already in the result.</p>`,
            starter: `def unique(xs):\n    result = []\n    for x in xs:\n        ...\n    return result\n\nprint(unique([3, 1, 3, 2, 1]))`,
            solution: `def unique(xs):\n    result = []\n    for x in xs:\n        if x not in result:\n            result.append(x)\n    return result\n\nprint(unique([3, 1, 3, 2, 1]))`,
            hints: ['The test you need is: if x not in result.', 'Then result.append(x) on its own line. Do not assign the result of append to anything.'],
            tests: [{ call: 'unique([3, 1, 3, 2, 1])', expect: '[3, 1, 2]' }, { call: 'unique([])', expect: '[]' }, { call: 'unique(["a", "b", "a"])', expect: "['a', 'b']" }, { call: 'unique([7, 7, 7, 7])', expect: '[7]' }, { call: 'unique([1, 2, 3])', expect: '[1, 2, 3]' }],
            mustNotContain: [{ re: /\bset\s*\(/, msg: 'Build the result with a loop rather than set(): the point is to see the pattern.' }],
            failTip: 'If the answer is None, look for result = result.append(x): append changes the list and gives back None.',
            followup: 'Change the function so that it returns the values that appear more than once, each listed once. Which list does your if test now look in, xs or result?'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A list holds values in order. Positions start at 0; <code>xs[-1]</code> is the last item; any other position outside the list is an <code>IndexError</code>.</li>
<li><code>xs[a:b]</code> is a new list from position <i>a</i> up to but not including <i>b</i>, like <code>range</code>; slices never raise errors.</li>
<li><code>for x in xs:</code> visits every item; <code>enumerate</code> gives positions too. Accumulators work over lists, and "largest so far" starts at <code>xs[0]</code>.</li>
<li><code>append</code>, <code>pop</code>, <code>insert</code> and <code>sort</code> change the list itself; <code>append</code> and <code>sort</code> give back <code>None</code>.</li>
<li><code>b = a</code> gives the same list a second name; <code>a[:]</code> makes a copy.</li>
<li>The answer to the opening question: every item has a position counted from 0, so <code>playlist[1371]</code> goes straight to that song without counting the ones before it; and two names for one list is the surprise to remember, because a change through either name shows through both.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['2-AP-11', '3A-AP-14'],
      title: 'Strings', standard: 1, summary: 'Text is a sequence too: positions and slices, why a string can never change, the methods worth knowing, splitting and joining, and building text piece by piece.',
      blocks: [
        `<p>Read this little poem, then read only the first letter of each line, top to bottom.</p>
<pre class="code"><code>Cats sleep on warm windows.
Owls blink at the moon.
Dogs dream of long walks.
Every fish forgets.
Someone left the door open.</code></pre>
<p>A message hidden in the first letters of lines is called an <em>acrostic</em>, and by the end of this lesson a four-line program will find one for you. Nearly every program handles text: names, messages, files, web pages, passwords. In Python, text is a <em>string</em>, and a string is a sequence of characters, so almost everything Lesson 6 taught about lists works on strings too. There is one big difference, and it is the most important rule in this lesson. So here is the question: if a string is a sequence just like a list, why does <code>word[0] = "P"</code> fail?</p>
<h2>A string is a sequence</h2>
<div class="stmt"><p><span class="kind">Rule (strings as sequences).</span> A string is a sequence of characters. <code>len(s)</code>, positions <code>s[i]</code> (from 0, and negative from the end), slices <code>s[a:b]</code>, <code>in</code>, and <code>for ch in s:</code> all work exactly as they do for lists. Each character is itself a string of length 1.</p></div>`,
        { predict: true, play: `word = "python"
print(word[0], word[-1])
print(word[1:4])
print(word[:3] + "|" + word[3:])
print(word[::-1])           # a step of -1: a reversed copy
print(len(word))
print("y" in word, "thon" in word, "z" in word)

for ch in "abc":
    print(ch, "->", ch.upper())`, caption: 'It prints p n, then yth, then pyt|hon, then nohtyp, then 6, then True True False, and finally a -> A, b -> B, c -> C on three lines. Positions and slices work as they do for lists: word[1:4] stops before position 4, and a step of -1 walks backwards. For strings, in also finds a whole piece of text: "thon" in word is True. Change word to your own name and predict again.' },
        `<h2>A string can never change</h2>
<div class="stmt"><p><span class="kind">Rule (strings are immutable).</span> A string cannot be changed in place. Assigning to a position, <code>s[0] = "P"</code>, is an error. Every string operation, including every method, makes a <em>new</em> string and leaves the original exactly as it was.</p></div>`,
        { play: `word = "python"
word[0] = "P"`, expectError: true, caption: 'TypeError: \'str\' does not support item assignment. Lists can be changed in place; strings cannot.' },
        { skill: 'string-immutable', check: "<code>word = \"python\"</code> and then <code>word.upper()</code>. What is <code>word</code> now?", options: ["<code>\"PYTHON\"</code>", "<code>\"python\"</code>: the method made a new string that was not stored", "An error"], answer: 1, wrong: ["This treats upper() as changing the string in place, as a list's sort() does. A string can never change, so word is still lower case.", null, "Calling upper() is perfectly legal; it gives back a shouting copy. The only mistake would be expecting word itself to change."], why: "Strings never change. Every method returns a new string; to keep it, write <code>word = word.upper()</code>." },
        `<p>So how does anything ever change? You make a new string and store it, perhaps under the same name. <code>word.upper()</code> does not shout <code>word</code>; it hands you a shouting copy, and if you want to keep it you must store it.</p>`,
        { predict: true, play: `word = "python"
shout = word.upper()
print(word, shout)          # word is unchanged
word.capitalize()           # makes a new string... and throws it away
print(word)
word = word.capitalize()    # to "change" word, store the new string back in it
print(word)`, caption: 'python PYTHON, then python (the line in the middle did nothing useful), then Python.' },
        `<p>This rule also explains why Lesson 6's surprise, two names sharing one list, never happens with strings. After <code>a = "cat"</code> and <code>b = a</code>, both names do refer to one string, but since nothing can change that string, you can never see a change through the other name.</p>
<details class="reveal"><summary>Predict: after <code>s = "abc"</code> and <code>t = s</code> and <code>s = s + "d"</code>, what are <code>s</code> and <code>t</code>?</summary><p><code>s</code> is <code>"abcd"</code> and <code>t</code> is still <code>"abc"</code>. <code>s + "d"</code> built a new string, and the assignment moved the name <code>s</code> to it. <code>t</code> still names the old one, which never changed.</p></details>
<h2>Quotes and special characters</h2>
<div class="stmt"><p><span class="kind">Rule (quotes and escapes).</span> A string may be written in single or double quotes. Inside it, a backslash starts an <em>escape</em>: <code>\\n</code> is a newline, <code>\\"</code> and <code>\\'</code> are quote marks, and <code>\\\\</code> is one backslash. Each escape is one character. Three quote marks, <code>"""…"""</code>, allow a string to run over several lines.</p></div>`,
        { predict: true, play: `print("She said \\"hi\\" and left.")
print('It\\'s easy with the other quotes: "hi"')
print("one\\ntwo")
print(len("a\\nb"))`, caption: 'It prints She said "hi" and left., then It\'s easy with the other quotes: "hi", then one and two on separate lines, then 3. A backslash before a quote puts the quote inside the string without ending it, the newline escape prints as a line break, and "a\\nb" has length 3: a, the newline, b.' },
        { skill: 'text-handling', check: "What is <code>len(\"hi\\n\")</code>?", options: ["2", "3", "4"], answer: 1, wrong: ["This counts only the letters you can see. The newline escape is a character too, even though it prints as a line break.", null, "This counts the backslash and the n as two characters. An escape is written with two keys but stored as one character."], why: "An escape is one character: h, i and the newline. The backslash is not stored." },
        `<h2>The methods worth knowing</h2>
<p>A <em>method</em> is a function that belongs to a value, called with a dot: <code>text.upper()</code>. Strings have dozens of methods; these earn their keep. By the immutability rule, every one of them gives back something new and changes nothing.</p>
<div class="tbl-wrap"><table>
<tr><th>method</th><th>what it gives back</th></tr>
<tr><td><code>s.upper()</code>, <code>s.lower()</code></td><td>the string in capitals / in lower case</td></tr>
<tr><td><code>s.strip()</code></td><td>the string without spaces and newlines at the ends</td></tr>
<tr><td><code>s.split()</code></td><td>a list of the words, split at any run of spaces or newlines</td></tr>
<tr><td><code>s.split(",")</code></td><td>a list of the pieces between the commas, exactly</td></tr>
<tr><td><code>"-".join(xs)</code></td><td>the strings in list <code>xs</code>, glued together with <code>"-"</code> between</td></tr>
<tr><td><code>s.replace(a, b)</code></td><td>a copy with every <code>a</code> replaced by <code>b</code></td></tr>
<tr><td><code>s.count(t)</code>, <code>s.find(t)</code></td><td>how many times <code>t</code> appears / the position where it first appears (−1 if never)</td></tr>
<tr><td><code>s.startswith(t)</code>, <code>s.isdigit()</code></td><td><code>True</code> or <code>False</code> answers about the string</td></tr>
</table></div>
<p>Methods can be <em>chained</em>: <code>line.strip().split()</code> strips first, and then splits the stripped result, because each method is called on the value the one before it gave back.</p>`,
        { predict: true, play: `line = "  Hello, Wonderful World  "
words = line.strip().split()
print(words)
print(len(words), "words")
print("-".join(words))
print(line.lower().count("o"))
print(line.replace("World", "Duluth"))

record = "Ada,Lovelace,London"
first, last, city = record.split(",")
print(last + ", " + first + " (" + city + ")")`, caption: 'It prints [\'Hello,\', \'Wonderful\', \'World\'], then 3 words, then Hello,-Wonderful-World, then 3 (three letters o in the lower-case line), then the line with Duluth in place of World (its spaces are still there, because only strip removes them), then Lovelace, Ada (London). split turns text into a list, and join turns a list back into text: they are opposites. The last part splits one line of a spreadsheet file into its three fields.' },
        { skill: 'text-handling', check: "What does <code>\"a b  c\".split()</code> give?", options: ["<code>[\"a\", \"b\", \"\", \"c\"]</code>", "<code>[\"a\", \"b\", \"c\"]</code>", "<code>\"a\", \"b\", \"c\"</code>"], answer: 1, wrong: ["This is what split(\" \") gives, cutting at every single space. Plain split() treats a run of spaces as one cut and drops the empty piece.", null, "split gives back one list, not three loose strings; the square brackets and the quotes around each word are part of the answer."], why: "<code>split()</code> with no argument splits on runs of white space and drops empty pieces. <code>split(\" \")</code> would keep the empty piece between the two spaces." },
        `<details class="reveal"><summary>Predict: what are <code>"a,,b".split(",")</code> and <code>"a,,b".split()</code>?</summary><p><code>['a', '', 'b']</code> and <code>['a,,b']</code>. Splitting at commas is exact: between the two commas there is an empty piece. Plain <code>split()</code> splits only at spaces and newlines, and there are none, so the whole string is one piece. Choosing the wrong <code>split</code> is a common source of bugs when reading data files.</p></details>
<h2>Building text piece by piece</h2>
<p>Because strings cannot change, text is built with Lesson 4's accumulator pattern: start with the empty string <code>""</code>, and use <code>+=</code> to make a new, longer string on each pass. Here are three accumulators over one sentence: a count, a filtered copy, and the first letters of the words.</p>`,
        { predict: true, play: `sentence = "the quick brown fox"

vowels = 0
for ch in sentence:
    if ch in "aeiou":
        vowels += 1
print("vowels:", vowels)

no_vowels = ""
for ch in sentence:
    if ch not in "aeiou":
        no_vowels += ch
print(no_vowels)

initials = ""
for word in sentence.split():
    initials += word[0].upper()
print(initials)`, caption: 'Prints vowels: 5, then th qck brwn fx, then TQBF. The sentence has e, u, i, o and o, so five vowels; the second loop keeps every character that is not a vowel; in the last loop the accumulator collects one character per word. Change the sentence and predict again.' },
        `<p>And here is the acrostic finder from the top of the lesson: split the poem into lines at the newlines, and collect the first character of each line.</p>`,
        { play: `poem = """Cats sleep on warm windows.
Owls blink at the moon.
Dogs dream of long walks.
Every fish forgets.
Someone left the door open."""

secret = ""
for line in poem.split("\\n"):
    secret += line[0]
print(secret)`, caption: 'Write your own five-line acrostic in poem and run it. What goes wrong if one of the lines is empty?' },
        `<h2>Formatting numbers</h2>
<p>An f-string, from Lesson 2, can also control how a value looks. After the expression, add a colon and a format: <code>.2f</code> means "two decimal places", <code>,</code> adds thousands separators, and <code>&gt;8</code> right-aligns in a space eight characters wide.</p>`,
        { predict: true, play: `price = 3.14159
print(f"Price: {price:.2f}")
print(f"Big: {1234567:,}")
print(f"[{'left':<8}][{'right':>8}]")
for i in range(1, 4):
    print(f"{i} squared is {i * i:>3}")`, caption: 'It prints Price: 3.14, then Big: 1,234,567, then [left    ][   right], then three lines such as 1 squared is   1. The format after the colon is the whole trick: .2f rounds to two places, the comma adds separators, and &lt; and &gt; pad to a width, left or right. Formats line up columns of numbers, which is most of what a neat report needs. Change .2f to .1f and predict.' },
        `<h2>Before the exercises</h2>
<p>The first exercise is Lesson 4's "biggest so far" accumulator, applied to the <em>lengths</em> of the words from <code>split()</code>. The second cleans a string up and then compares it with a changed copy of itself. Here is a worked example of that second shape: two phrases are <em>anagrams</em> if they use exactly the same letters, like "listen" and "silent". Clean both (lower case, no spaces), then compare their letters in sorted order. <code>sorted</code> works on a string and gives a sorted list of its characters.</p>`,
        { predict: true, play: `def same_letters(a, b):
    a_clean = a.lower().replace(" ", "")
    b_clean = b.lower().replace(" ", "")
    return sorted(a_clean) == sorted(b_clean)

print(same_letters("Listen", "Silent"))
print(same_letters("Dormitory", "dirty room"))
print(same_letters("hello", "world"))`, caption: 'True, True, False. Cleaning first means capitals and spaces cannot spoil the comparison, and == on two lists compares them item by item.' },
        { aside: `<p><b>Common mistakes in this lesson.</b> Calling <code>word.upper()</code> and expecting <code>word</code> to change; store the result. Trying to assign to a position in a string. Comparing <code>"5" == 5</code>, which is <code>False</code>, because one is text and one is a number. Forgetting that <code>split()</code> gives a list: <code>line.split()[0]</code> is the first word, but <code>line.split()</code> is not a string. Using <code>split()</code> where <code>split(",")</code> was needed, or the other way round. Taking <code>s[0]</code> of an empty string, which is an <code>IndexError</code>.</p>` },
        {
          ex: {
            id: 'py-6-3', skill: 'text-handling', kind: 'trace', title: 'Trace the vowel counter',
            prompt: `<p>This program counts the vowels in a word by going through its positions. Fill in the table: each row is a moment when line 3 starts a pass of the loop (and the last row, after line 6), with the values of <code>i</code> and <code>count</code> then. The first row is done for you.</p>`,
            code: `word = "moon"\ncount = 0\nfor i in range(len(word)):\n    if word[i] in "aeiou":\n        count = count + 1\nprint(count)`,
            vars: ['i', 'count'],
            steps: [
              { line: 3, values: { i: '0', count: '0' }, show: true },
              { line: 3, values: { i: '1', count: '0' }, why: { count: { '1': 'This row is the start of the pass for i = 1: word[1] has not been tested yet, so count has not gone up for it.' } } },
              { line: 3, values: { i: '2', count: '1' }, why: { count: { '0': 'In the pass for i = 1, word[1] is "o", a vowel, so count became 1.' } } },
              { line: 3, values: { i: '3', count: '2' }, why: { count: { '3': 'This row is the start of the pass for i = 3: only the o at position 1 and the o at position 2 have counted so far, and word[3], "n", is not a vowel anyway.' } } },
              { line: 6, values: { i: '3', count: '2' } }
            ],
            hints: ['i is a position: it takes 0, 1, 2, 3 for the four letters of "moon". The if tests the letter at that position.', 'The letters at positions 1 and 2 are both "o". count goes up inside the pass for each of them, and the n at position 3 adds nothing.'],
            solution: '<p>i: 0, 1, 2, 3, 3. count: 0, 0, 1, 2, 2. The program prints <code>2</code>: the two o letters.</p>',
            followup: 'Change the word to "banana" and trace it again before running it: what does it print? Then check whether the loop for ch in word would do the same job without positions.'
          }
        },
        {
          ex: {
            id: 'py-6-1', skill: 'text-handling', title: 'Longest word',
            prompt: `<p>Write <code>longest_word(sentence)</code> that returns the longest word in a sentence. Words are separated by spaces. If two words tie, return the first one; for an empty sentence, return the empty string.</p>`,
            starter: `def longest_word(sentence):\n    best = ""\n    for word in sentence.split():\n        ...\n    return best\n\nprint(longest_word("the quick brown fox jumps"))`,
            solution: `def longest_word(sentence):\n    best = ""\n    for word in sentence.split():\n        if len(word) > len(best):\n            best = word\n    return best\n\nprint(longest_word("the quick brown fox jumps"))`,
            hints: ['Compare lengths, not the words themselves: if len(word) > len(best).', 'Use a strict > so that a later word of the same length does not replace the earlier one. Starting best at "" is safe here, because every word is longer than the empty string.'],
            tests: [{ call: 'longest_word("the quick brown fox jumps")', expect: "'quick'" }, { call: 'longest_word("a bb ccc dd")', expect: "'ccc'" }, { call: 'longest_word("one")', expect: "'one'" }, { call: 'longest_word("hi to you")', expect: "'you'" }, { call: 'longest_word("")', expect: "''" }, { call: 'longest_word("  spaced   out  ")', expect: "'spaced'" }],
            failTip: 'If "the quick brown fox jumps" gives jumps, you used >= : a later tie replaced the earlier word.',
            followup: 'Starting at "" works for lengths because no word is shorter than the empty string, unlike Lesson 6\u2019s largest, where 0 was a trap.'
          }
        },
        {
          ex: {
            id: 'py-6-2', skill: 'slicing', title: 'Palindromes',
            prompt: `<p>Write <code>is_palindrome(s)</code>, returning <code>True</code> if the string reads the same backwards, ignoring capitals and spaces. So <code>"Never odd or even"</code> counts. Clean it up first (lower case, spaces removed), as <code>same_letters</code> did, then compare the cleaned string with its reverse.</p>`,
            starter: `def is_palindrome(s):\n    cleaned = ...\n    return ...\n\nprint(is_palindrome("racecar"))\nprint(is_palindrome("hello"))`,
            solution: `def is_palindrome(s):\n    cleaned = s.lower().replace(" ", "")\n    return cleaned == cleaned[::-1]\n\nprint(is_palindrome("racecar"))\nprint(is_palindrome("hello"))`,
            hints: ['s.lower().replace(" ", "") removes capitals and spaces.', 'cleaned[::-1] is the reversed string. Return the comparison itself: return cleaned == cleaned[::-1].'],
            tests: [{ call: 'is_palindrome("racecar")', expect: 'True' }, { call: 'is_palindrome("hello")', expect: 'False' }, { call: 'is_palindrome("Never odd or even")', expect: 'True' }, { call: 'is_palindrome("A Santa at NASA")', expect: 'True' }, { call: 'is_palindrome("ab")', expect: 'False' }, { call: 'is_palindrome("")', expect: 'True' }],
            failTip: 'If "Never odd or even" fails, check that you removed the spaces and lowered the capitals before reversing.',
            followup: 'The comparison == already gives True or False, so there is no need for an if. The empty string counts as a palindrome: reversed, it is still empty.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A string is a sequence: <code>len</code>, positions, slices, <code>in</code> and <code>for</code> work as for lists.</li>
<li>A string can never change, which is why <code>word[0] = "P"</code> fails even though <code>words[0] = "P"</code> works for a list. Methods give back new strings; to keep one, store it.</li>
<li>Escapes such as <code>\\n</code> and <code>\\"</code> put special characters inside quotes; each is one character.</li>
<li><code>split</code> turns text into a list and <code>join</code> turns a list back into text; <code>split()</code> and <code>split(",")</code> split differently.</li>
<li>Build text with an accumulator starting from <code>""</code>. Clean text (lower case, no spaces) before comparing it.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standard: 1,
      standards: ['2-AP-13', '2-AP-14', '2-AP-19', '3A-AP-17', '3A-AP-18', '3B-AP-14'],
      title: 'Functions', summary: 'Naming a computation so you can reuse it, test it and stop thinking about it: def, parameters and return, what happens during a call, scope, defaults, and testing with assert.',
      blocks: [
        `<p>Think of a vending machine. You put something in (money and a button press), something comes out (a snack), and you never need to know what happens inside. A <em>function</em> is a vending machine for a computation: values go in, one value comes out, and the rest of the program can forget how. You have been <em>calling</em> functions since the first lesson, <code>print</code>, <code>len</code>, <code>int</code>, and you have filled in the bodies of a few. Now you will build them from nothing, and by the end of the lesson you will test your own functions the way professional programmers do. But what really happens, step by step, when a program calls a function and the answer comes back?</p>`,
        { photo: 'vending-machines', caption: "Three vending machines on a street in Tokyo. Coins and a button press go in, a drink comes out, and nobody needs to know what happens inside: that is the idea of a function." },
        `
<h2>Defining and calling</h2>
<div class="stmt"><p><span class="kind">Rule (def).</span> <code>def <i>name</i>(<i>parameters</i>):</code> followed by an indented block creates a function. The <em>parameters</em> are names, separated by commas, for the values the function will be given. Defining a function does not run its block.</p>
<p><span class="kind">Rule (return).</span> <code>return <i>expression</i></code> ends the call at once and hands the expression's value back to whoever called the function. A call that reaches the end of the block without a <code>return</code> hands back <code>None</code>.</p>
<p><span class="kind">Rule (call).</span> <code><i>name</i>(<i>arguments</i>)</code> first works out each argument, then runs the function's block with each parameter set to the matching argument. The call itself then has the value that was returned.</p></div>`,
        { predict: true, play: `def greet(name):
    message = f"Hello, {name}!"
    return message

print(greet("Ada"))
print(greet("Grace"))
text = greet("Linus")
print(text.upper())`, caption: 'It prints Hello, Ada!, then Hello, Grace!, then HELLO, LINUS! in capitals. The def lines print nothing; the three calls do the work. greet("Linus") is an expression whose value is a string, so it can be stored and used like any other string. Change the greeting inside the function and watch all three calls change.' },
        `<p>Keep two words apart. The <em>parameter</em> <code>name</code> is the placeholder written in the definition; the <em>argument</em> <code>"Ada"</code> is the value supplied in one particular call. Each call can supply a different argument, and that is the whole point.</p>
<details class="reveal"><summary>Predict: after <code>def f(x): return x * 2</code>, what does <code>print(f(f(3)))</code> show? And what does <code>print(f)</code> show?</summary><p><code>12</code>: by the call rule, the argument <code>f(3)</code> is worked out first, giving 6, and then the outer call doubles it. <code>print(f)</code>, with no parentheses, does not call anything: it shows the function itself, something like <code>&lt;function f&gt;</code>. Parentheses are what make a call happen.</p></details>
<h2>Print or return?</h2>
<p>The most common confusion with functions is between showing a value and handing it back. <code>print</code> shows a value to a person, and then it is gone. <code>return</code> hands it to the code that made the call, which can store it, print it, or compute with it. Watch what happens when a function prints instead of returning.</p>`,
        { predict: true, play: `def double_print(n):
    print(n * 2)        # shows the answer...

def double_return(n):
    return n * 2        # ...or hands it back

a = double_print(5)
b = double_return(5)
print("a is", a)
print("b is", b)
print(double_return(5) + 1)`, caption: 'double_print shows 10, but a is None: nothing was handed back. b is 10, and double_return(5) + 1 is 11. A function that computes something should return it, and leave printing to the caller.' },
        { skill: 'return-vs-print', check: "<code>def f(x): print(x * 2)</code>, then <code>a = f(5)</code>. What is <code>a</code>?", options: ["10", "<code>None</code>: the function printed but returned nothing", "5"], answer: 1, why: "print shows a value; return hands it back. A function without a return gives back None, whatever it printed.", wrong: ["This treats print as if it handed the value back. print only shows 10 on the screen; with no return, the call has no value to store, so a is None.", null, "This takes the argument to be what comes back. A call has the value its function returns, and this function returns nothing."] },
        `<h2>What happens during a call</h2>
<p>Each call gets its own private workspace, called a <em>frame</em>, holding its parameters and any variables it creates. When the call returns, its frame is thrown away. Step through this trace and watch frames appear and disappear.</p>`,
        {
          fig: 'trace', code: `def square(x):\n    result = x * x\n    return result\n\ndef sum_of_squares(a, b):\n    return square(a) + square(b)\n\ntotal = sum_of_squares(3, 4)\nprint(total)`,
          steps: [
            { line: 8, frames: [{ name: 'global', vars: {} }], note: 'The two def lines only created the functions. Execution really starts here, with the call sum_of_squares(3, 4).' },
            { line: 6, frames: [{ name: 'global', vars: {} }, { name: 'sum_of_squares', vars: { a: 3, b: 4 } }], note: 'A new frame holds a = 3 and b = 4. To work out the return value, Python first needs square(a).' },
            { line: 2, frames: [{ name: 'global', vars: {} }, { name: 'sum_of_squares', vars: { a: 3, b: 4 } }, { name: 'square', vars: { x: 3 } }], note: 'Another frame, for square with x = 3.' },
            { line: 3, frames: [{ name: 'global', vars: {} }, { name: 'sum_of_squares', vars: { a: 3, b: 4 } }, { name: 'square', vars: { x: 3, result: 9 } }], note: 'result lives only in this frame. return 9 hands it back and discards the frame.' },
            { line: 6, frames: [{ name: 'global', vars: {} }, { name: 'sum_of_squares', vars: { a: 3, b: 4 } }], note: 'Back in sum_of_squares with 9 in hand. Now square(b).' },
            { line: 2, frames: [{ name: 'global', vars: {} }, { name: 'sum_of_squares', vars: { a: 3, b: 4 } }, { name: 'square', vars: { x: 4 } }], note: 'A fresh frame for square, with x = 4. The earlier x = 3 is gone.' },
            { line: 3, frames: [{ name: 'global', vars: {} }, { name: 'sum_of_squares', vars: { a: 3, b: 4 } }, { name: 'square', vars: { x: 4, result: 16 } }], note: 'return 16.' },
            { line: 6, frames: [{ name: 'global', vars: {} }, { name: 'sum_of_squares', vars: { a: 3, b: 4 } }], note: '9 + 16 = 25 is returned to the top level.' },
            { line: 8, frames: [{ name: 'global', vars: { total: 25 } }], note: 'The name total is given 25. Both inner frames no longer exist.' },
            { line: 9, frames: [{ name: 'global', vars: { total: 25 } }], out: '25' }
          ],
          caption: 'Every call gets a fresh frame; returning discards it. The two calls of square never share a variable.'
        },
        `<p>Notice the order. The call <code>sum_of_squares(3, 4)</code> cannot finish until both calls of <code>square</code> have finished, so the most recent call is always the first to return. The frames behave like a stack of plates, which is why programmers call this the <em>call stack</em>.</p>
<h2>Scope: what a function can see</h2>
<div class="stmt"><p><span class="kind">Rule (scope).</span> A name that is assigned anywhere inside a function is <em>local</em> to that function: it lives in the call's frame and is invisible outside it. A name assigned at the top level of the program is <em>global</em>: a function may read it, but assigning to it inside a function makes a new local name instead.</p></div>
<p>The first half means a function cannot accidentally overwrite your variables, and it is why <code>double</code> below cannot change <code>value</code>: the <code>n</code> in the function is a local name that starts out equal to the argument.</p>`,
        { predict: true, play: `def double(n):
    n = n * 2       # changes only this frame's n
    return n

value = 10
print(double(value))
print(value)        # unchanged`, caption: 'Prints 20, then 10. To keep the doubled value, store what the function returns: value = double(value).' },
        `<p>The second half of the rule produces an error message that puzzles everyone the first time.</p>`,
        { play: `count = 0

def tick():
    count = count + 1    # assigning makes count local in tick...

tick()`, expectError: true, caption: 'UnboundLocalError: local variable \'count\' referenced before assignment (newer versions of Python word it "cannot access local variable \'count\' where it is not associated with a value"). Because tick assigns to count, count is local in tick, and the right-hand side tries to read the local count before it has a value.' },
        { skill: 'parameters-scope', check: "A function assigns <code>total = 0</code> inside its block. The program also has a global <code>total</code>. What does the assignment do?", options: ["Changes the global total", "Makes a new local total that lives only in this call", "Causes an error"], answer: 1, why: "A name assigned anywhere inside a function is local to that function. The global is untouched; pass values in and return results instead.", wrong: ["This believes an assignment inside a function reaches out to the global of the same name. It does not: the assignment makes a new local name, and the global keeps its value.", null, "This believes two variables with one name must clash. They do not: the local and the global live in different places, and no error happens (the error in the example came from reading a local before giving it a value)."] },
        `<p>The cure is not a trick but a habit: pass what a function needs in as parameters, and hand what it produces back with <code>return</code>. Here that means <code>def tick(count): return count + 1</code>, called as <code>count = tick(count)</code>. A function that only talks to the outside world through its parameters and its return value can be understood, tested and reused on its own. That one habit is most of what makes large programs manageable.</p>
<h2>Defaults and several results</h2>
<div class="stmt"><p><span class="kind">Rule (defaults and keywords).</span> A parameter written <code><i>name</i>=<i>value</i></code> has a <em>default</em>: if the caller leaves that argument out, the default is used. A caller may also name an argument, <code>f(b=5)</code>, in which case its position does not matter.</p>
<p><span class="kind">Rule (several results).</span> <code>return a, b</code> hands back a pair of values, called a <em>tuple</em>. The caller can unpack it: <code>x, y = f()</code>.</p></div>`,
        { predict: true, play: `def power(base, exponent=2):      # exponent is optional
    return base ** exponent

print(power(5), power(2, 10), power(exponent=3, base=2))

def min_max(xs):
    return min(xs), max(xs)        # a tuple of two values

lo, hi = min_max([4, 9, 1, 7])
print(lo, hi)`, caption: 'It prints 25 1024 8, then 1 9. power(5) leaves the exponent out, so it uses 2 and gives 5 squared. In the third call the names say which value is which, so their order does not matter. min_max returns two values and the caller unpacks them into lo and hi. print itself has defaults: print(a, b, sep="-") changes the separator from its default of a space.' },
        { skill: 'parameters-scope', check: "<code>def area(w, h=1): return w * h</code>. What does <code>area(5)</code> give?", options: ["An error: h is missing", "5, because h takes its default of 1", "0"], answer: 1, why: "A parameter written <code>name=value</code> has a default that is used when the caller leaves it out.", wrong: ["This believes every parameter must be given a value in every call. A parameter with a default is optional: leave it out and the default is used.", null, "This believes a missing argument counts as 0. Python uses the default the definition names, which here is 1, so 5 * 1 is 5."] },
        `<h2>Testing your functions</h2>
<p>A function can be tested on its own, before the rest of the program exists, and that is one of the best reasons to write functions at all. Python has a statement made for it.</p>
<div class="stmt"><p><span class="kind">Rule (assert).</span> <code>assert <i>condition</i>, <i>message</i></code> does nothing if the condition is <code>True</code>, and stops the program with an <code>AssertionError</code> showing the message if it is <code>False</code>.</p></div>
<p>So a few lines of <code>assert</code> under a function turn "I think it works" into "it gives the right answer on these cases, and I will find out immediately if a later change breaks it". Choose the cases carefully: an ordinary one, and the <em>edge cases</em> where bugs live, such as 0, 1, a negative number, an empty list, or a value exactly on a boundary.</p>`,
        { play: `def sign(x):
    if x > 0:
        return 1
    if x < 0:
        return -1
    return 0

assert sign(5) == 1, "a positive number"
assert sign(-3) == -1, "a negative number"
assert sign(0) == 0, "zero, the edge case"
print("all tests passed")

assert sign(0.5) == 0, "a deliberately wrong test"`, expectError: true, caption: 'The first three asserts pass silently and the program prints "all tests passed". The last one is wrong on purpose: it stops with AssertionError: a deliberately wrong test. Delete it and run again.' },
        `<p>Notice how <code>sign</code> is written: three <code>return</code> statements, one per case. Because <code>return</code> ends the call immediately, the second <code>if</code> is only reached when the first case did not apply, and the last line is only reached when neither did. No <code>else</code> is needed.</p>
<h2>Before the exercises</h2>
<p>First you will trace two calls by hand, as in the figure. The first function to write after that has three cases, exactly like <code>sign</code>: one <code>return</code> per case. The second searches for something inside a loop and must decide when it may give its answer. Here is a worked example of that second shape: does a number contain a given digit? Return <code>True</code> the moment you find it; you may only return <code>False</code> once every digit has been checked, after the loop.</p>`,
        { play: `def has_digit(n, d):
    while n > 0:
        if n % 10 == d:
            return True        # found it: stop searching at once
        n = n // 10            # drop the last digit
    return False               # only now do we know it is not there

assert has_digit(1974, 7) == True
assert has_digit(1974, 2) == False
assert has_digit(5, 5) == True
print("has_digit passes its tests")`, caption: 'Putting return False inside the loop, as an else, would give up after looking at only the last digit. The "not found" answer belongs after the loop.' },
        `<details class="reveal"><summary>Guess first: if <code>return False</code> were indented inside the loop, as the <code>else</code> of the <code>if</code>, what would <code>has_digit(1974, 7)</code> give?</summary><p><code>False</code>, which is wrong. The loop looks at the last digit, 4, finds it is not 7, and returns <code>False</code> at once, before it ever reaches the 7. A search may only say "not found" after it has looked everywhere. Try it: indent the line, run the example again and watch the first assert fail.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Printing the answer instead of returning it, so the caller gets <code>None</code>. Forgetting the parentheses, so the function is never called. Writing code after a <code>return</code>, where it never runs. Using a variable from inside a function after it has returned. Assigning to a global name inside a function and getting <code>UnboundLocalError</code>; pass it in and return it instead. Calling a function above the <code>def</code> that creates it. In a search, returning the "not found" answer inside the loop.</p>` },
        {
          ex: {
            id: 'py-7-3', skill: 'parameters-scope', kind: 'trace', title: 'Trace two calls',
            prompt: `<p>Work through this program by hand and fill in the table. Each row is a moment just after the line it names has run, and the cells are the values of the names then. Line 2 is reached once for each call of <code>step</code>, and a dash <code>-</code> means that the name does not exist at that moment. The first row is done for you.</p>`,
            code: `def step(n, k):\n    n = n + k\n    return n * 2\n\na = 3\nb = step(a, 4)\nc = step(b, 1)\nprint(a, b, c)`,
            vars: ['a', 'b', 'c', 'n', 'k'],
            steps: [
              { line: 5, values: { a: '3', b: '-', c: '-', n: '-', k: '-' }, show: true },
              { line: 2, values: { a: '3', b: '-', c: '-', n: '7', k: '4' }, why: { a: { '7': 'The n inside step is a separate name in the call’s own frame. Changing n does not change a, which is still 3.' } } },
              { line: 6, values: { a: '3', b: '14', c: '-', n: '-', k: '-' }, why: { n: { '7': 'The frame of step was thrown away when it returned, so n and k no longer exist: write -.', '14': 'The frame of step was thrown away when it returned, so n and k no longer exist: write -.' } } },
              { line: 2, values: { a: '3', b: '14', c: '-', n: '15', k: '1' }, why: { n: { '5': 'The second call gets a fresh frame. n starts as the argument b, which is 14, so n + k is 15.' } } },
              { line: 7, values: { a: '3', b: '14', c: '30', n: '-', k: '-' } }
            ],
            hints: ['Start with the call on line 6: its frame has n = 3 and k = 4 (n starts out as a second name for the value of a, 3). Line 2 then makes n bigger, inside that frame only.', 'After line 2 of the first call, n is 7 and k is 4. The return hands back 7 * 2 = 14, which b receives, and the frame disappears, so n and k are - again. The second call starts from b, which is 14.'],
            solution: '<p>a: 3, 3, 3, 3, 3. b: -, -, 14, 14, 14. c: -, -, -, -, 30. n: -, 7, -, 15, -. k: -, 4, -, 1, -. The program prints <code>3 14 30</code>.</p>',
            failTip: 'If a changes to 7, remember that n is a separate local name inside the call: it starts out equal to the argument and changing it never changes a.',
            followup: 'Change the first call to step(a, 0) and trace it before running it. Then check yourself in the Code Lab: print n on the last line of the program and read the NameError.'
          }
        },
        {
          ex: {
            id: 'py-18-2', skill: 'return-vs-print', kind: 'parsons', title: 'Put it in order: a function that returns',
            prompt: `<p>Build a program with a function <code>double_all(xs)</code> that <em>returns</em> a new list with every number doubled, then prints the answer of a call. It must print <code>[2, 4, 6]</code> once, not twice and not <code>None</code>. Put each line at the right depth. Not every block belongs in the program.</p>`,
            lines: ['def double_all(xs):', '    result = []', '    for x in xs:', '        result.append(x * 2)', '    return result', 'print(double_all([1, 2, 3]))'],
            distractors: ['    print(result)', '        return x * 2'],
            tests: [{ stdin: '', expect: '[2, 4, 6]' }],
            hints: ['A def line is followed by its indented block. The block creates the list, loops over xs, and then hands the list back; the line that calls the function and prints the answer is not part of the block.', 'return result belongs under the def, level with the for, so that it runs once the loop has finished. A return inside the loop would end the function after the first item.'],
            failTip: 'If the output is [2, 4, 6] followed by None, you used print(result) inside the function instead of return result.',
            followup: 'Change the call so that it prints the sum of the doubled numbers: print(sum(double_all([1, 2, 3]))). Could you do that if double_all had printed its answer instead of returning it?'
          }
        },
        {
          ex: {
            id: 'py-7-1', skill: 'return-vs-print', title: 'Clamp',
            prompt: `<p>Write <code>clamp(x, lo, hi)</code>, which returns <code>x</code> pushed into the range from <code>lo</code> to <code>hi</code>: if <code>x</code> is below <code>lo</code> return <code>lo</code>; if it is above <code>hi</code> return <code>hi</code>; otherwise return <code>x</code> itself. Games use this constantly to keep a character on the screen, and volume controls to keep the sound between 0 and 100. Test it with a few <code>assert</code> lines of your own before pressing Check.</p>`,
            starter: `def clamp(x, lo, hi):\n    ...\n\nassert clamp(15, 0, 10) == 10\nprint(clamp(15, 0, 10), clamp(-3, 0, 10), clamp(7, 0, 10))`,
            solution: `def clamp(x, lo, hi):\n    if x < lo:\n        return lo\n    if x > hi:\n        return hi\n    return x\n\nassert clamp(15, 0, 10) == 10\nprint(clamp(15, 0, 10), clamp(-3, 0, 10), clamp(7, 0, 10))`,
            hints: ['Three cases, like sign: too low, too high, just right. Each one is a return.', 'if x < lo: return lo. Then if x > hi: return hi. Then return x.'],
            tests: [{ call: 'clamp(15, 0, 10)', expect: '10' }, { call: 'clamp(-3, 0, 10)', expect: '0' }, { call: 'clamp(7, 0, 10)', expect: '7' }, { call: 'clamp(0, 0, 10)', expect: '0' }, { call: 'clamp(10, 0, 10)', expect: '10' }, { call: 'clamp(2.5, 1, 2)', expect: '2' }],
            mustContain: [{ re: /\breturn\b/, msg: 'The function must return its answer, not print it.' }],
            failTip: 'If every test shows None, the function printed its answer instead of returning it.',
            followup: 'The boundary tests, clamp(0, 0, 10) and clamp(10, 0, 10), are the edge cases: they check that a value exactly on a boundary is left alone.'
          }
        },
        {
          ex: {
            id: 'py-7-2', skill: 'return-vs-print', title: 'Prime test',
            prompt: `<p>Write <code>is_prime(n)</code> returning <code>True</code> when <code>n</code> is a prime number: a whole number greater than 1 whose only divisors are 1 and itself. Numbers less than 2 are not prime. Try every possible divisor <code>d</code> from 2 while <code>d * d &lt;= n</code>; the moment one divides evenly, return <code>False</code>. Like <code>has_digit</code>, you may only decide "prime" after the loop.</p>`,
            starter: `def is_prime(n):\n    if n < 2:\n        return False\n    ...\n\nprint(is_prime(7), is_prime(9))`,
            solution: `def is_prime(n):\n    if n < 2:\n        return False\n    d = 2\n    while d * d <= n:\n        if n % d == 0:\n            return False\n        d += 1\n    return True\n\nprint(is_prime(7), is_prime(9))`,
            hints: ['Loop d from 2 while d * d <= n. That is the same as d <= the square root of n, with no decimals involved.', 'Return False as soon as n % d == 0. If the loop finishes without returning, every possible divisor failed: return True after the loop.'],
            tests: [{ call: 'is_prime(2)', expect: 'True' }, { call: 'is_prime(7)', expect: 'True' }, { call: 'is_prime(9)', expect: 'False' }, { call: 'is_prime(1)', expect: 'False' }, { call: 'is_prime(25)', expect: 'False' }, { call: 'is_prime(97)', expect: 'True' }, { call: 'is_prime(7919)', expect: 'True' }, { call: 'is_prime(7917)', expect: 'False' }],
            failTip: 'If 9 or 25 is called prime, the loop condition should include equality: d * d <= n, so that 3 is tried for 9 and 5 for 25.',
            followup: 'Why is it enough to stop at the square root? If n = a × b and both a and b were bigger than √n, their product would be bigger than n. So any divisor pair has one member at most √n, and the loop would have found it.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li><code>def name(parameters):</code> creates a function; a call with parentheses works out the arguments, then runs the block. <code>return</code> hands a value back and ends the call; no <code>return</code> means <code>None</code>.</li>
<li>Return what you compute, and let the caller decide whether to print it.</li>
<li>Each call has its own frame. A name assigned inside a function is local; pass values in and return results rather than changing globals.</li>
<li>Defaults make parameters optional; <code>return a, b</code> gives back several values.</li>
<li>Test functions with <code>assert</code>, including edge cases. In a search, return "not found" only after the loop.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standard: 1,
      standards: ['2-AP-17', '3A-CS-03'],
      title: 'Finding and fixing bugs', summary: 'Every program has bugs; the skill is finding them fast. Three kinds of wrong, reading an error message, debugging as an experiment, testing, and handling the errors you expect with try and except.',
      blocks: [
        `<p>In September 1999, NASA's Mars Climate Orbiter reached Mars after a nine-month journey, fired its engine to slip into orbit, and was never heard from again. It had flown far too low into the Martian atmosphere. The investigation found the cause: one team's software reported the push of the thrusters in pounds, American units, and another team's software read those numbers as newtons, metric units. Nothing crashed and no error message appeared. Every program ran perfectly and gave the wrong answer, and a spacecraft costing well over a hundred million dollars was lost. So how do you find a bug when the program gives you no error message at all?</p>`,
        { photo: 'mars-climate-orbiter', caption: "The Mars Climate Orbiter in May 1998, being prepared for tests that imitate the noise of a launch. Sixteen months later it burned up in the Martian atmosphere because of a units mix-up between two programs." },
        `<p>Here is a secret beginners are rarely told: professional programmers spend more time fixing code than writing it. Bugs are not a sign that you are bad at this; they are the normal state of code being worked on. What separates an expert from a beginner is how calmly and quickly they track a bug down. This lesson is the method.</p>
<h2>Three kinds of wrong</h2>
<div class="tbl-wrap"><table>
<tr><th>kind</th><th>when you find out</th><th>examples</th></tr>
<tr><td><b>Syntax error</b></td><td>before anything runs: Python cannot read the program</td><td>a missing colon, bracket or quote; bad indentation</td></tr>
<tr><td><b>Runtime error</b></td><td>while it runs: it stops with an error message</td><td>dividing by zero, <code>xs[10]</code> on a short list, <code>int("hello")</code></td></tr>
<tr><td><b>Logic error</b></td><td>maybe never: it runs and gives a wrong answer</td><td><code>&lt;</code> where you meant <code>&lt;=</code>; pounds where you meant newtons</td></tr>
</table></div>
<p>Lesson 2 explained why syntax errors come first: Python reads the whole program before running any of it. The kinds are listed from easiest to hardest. The first two announce themselves and point at a line. A logic error announces nothing, which is why it is the dangerous one, and why testing matters: a test turns a silent logic error into a visible failure.</p>
<h2>Reading an error message</h2>
<div class="stmt"><p><span class="kind">Rule (error messages).</span> When Python stops with an error, the last line of the message gives three things: the <em>kind</em> of error, a <em>description</em>, and the <em>line number</em> where it happened. Read all three before changing anything.</p></div>
<p>Most beginners see red text and stop reading. The message is usually pointing straight at the problem.</p>`,
        { play: `scores = [88, 92, 79]
total = 0
for s in scores:
    total += s
average = totl / len(scores)
print("average:", average)`, expectError: true, caption: 'NameError means "you used a name I have never seen". The line number points at line 5, and the description names totl. Fix the typo and run again.' },
        { skill: 'error-stages', check: "A program runs to the end and prints a wrong answer, with no message. What kind of error is that?", options: ["A syntax error", "A runtime error", "A logic error"], answer: 2, why: "Syntax errors stop the program before it starts; runtime errors stop it with a message; logic errors give wrong answers silently, and only a test can catch them.", wrong: ["This believes a wrong answer means Python could not read the program. But this program ran, so Python read it without trouble: a syntax error would have stopped it before it started.", "This believes every kind of error shows itself. A runtime error stops the program with a message, and here nothing stopped and nothing was printed about an error.", null] },
        `<p>The kinds you will meet most often, and what they usually mean:</p>
<div class="tbl-wrap"><table>
<tr><th>error</th><th>usual cause</th></tr>
<tr><td><code>SyntaxError</code></td><td>a missing colon, bracket or quote; on this site bad indentation is reported this way too</td></tr>
<tr><td><code>NameError</code></td><td>a typo in a name, or using a variable before giving it a value</td></tr>
<tr><td><code>TypeError</code></td><td>mixing types, such as <code>"age: " + 25</code>, or calling something that is not a function</td></tr>
<tr><td><code>ValueError</code></td><td>the right type but an impossible value: <code>int("hello")</code></td></tr>
<tr><td><code>IndexError</code></td><td>a position past the end of a list or string</td></tr>
<tr><td><code>KeyError</code></td><td>a dictionary key that is not there (Lesson 11)</td></tr>
<tr><td><code>ZeroDivisionError</code></td><td>dividing by zero; often a list that turned out to be empty</td></tr>
</table></div>
<details class="reveal"><summary>Error detective: which kind of error does each line cause? (a) <code>print("total: " + 7)</code> (b) <code>xs = [1, 2]; print(xs[2])</code> (c) <code>average = total / len([])</code> (d) <code>if x &gt; 3 print(x)</code></summary><p>(a) <code>TypeError</code>: text and a number cannot be joined with <code>+</code>; write <code>str(7)</code> or use an f-string. (b) <code>IndexError</code>: a two-item list has positions 0 and 1 only. (c) <code>ZeroDivisionError</code>: the empty list has length 0. (d) <code>SyntaxError</code>: the colon is missing, and nothing at all runs, not even the lines above it.</p></details>
<h2>Debugging is an experiment</h2>
<p>When a program runs and gives the wrong answer, changing things at random rarely helps. What works is the method of a scientist: make a guess about where the fault is, and design an experiment that could prove the guess wrong.</p>
<div class="stmt"><p><span class="kind">The debugging loop.</span> 1. <em>Reproduce</em> the bug: find an input that makes it happen every time. 2. <em>Shrink</em> the input until it is small enough to work out the right answer by hand. 3. <em>Hypothesise</em>: say exactly where you think the program first goes wrong. 4. <em>Test</em> the guess by printing the values at that point. 5. <em>Fix</em> it, then run every earlier test again, to make sure the fix broke nothing else.</p></div>
<p>The experiment in step 4 is usually a <code>print</code>. Print the values you believe are right, at the points where you believe they are still right. The bug lies between the last print that looks correct and the first that looks wrong. This is called <em>print debugging</em>, and everyone does it, including people with much fancier tools.</p>`,
        { predict: true, play: `def count_evens(xs):
    count = 0
    for i in range(1, len(xs)):
        print("looking at position", i, "value", xs[i])   # debugging print
        if xs[i] % 2 == 0:
            count += 1
    return count

print(count_evens([2, 4, 5, 6]))`, caption: 'It prints three "looking at" lines, for positions 1, 2 and 3, and then 2. The answer should be 3, because 2, 4 and 6 are even. The debugging print shows the bug: position 0 is never looked at, since range(1, len(xs)) starts at 1, so the first 2 is never counted. Fix the bug, run again, then delete the print.' },
        `<details class="reveal"><summary>Predict: a function has 64 lines, and a print after any line can tell you whether things are still right there. If you always put the next print in the middle of the lines still under suspicion, how many prints do you need, at most, to find the first wrong line?</summary><p>Six. Each print cuts the suspect region in half: 64, 32, 16, 8, 4, 2, 1. This is binary search, which Lesson 14 turns into an algorithm, and it is why even a huge program can be debugged in a handful of well-chosen experiments.</p></details>
<p>One more technique sounds silly and works astonishingly often: explain your code, line by line and out loud, to someone who knows nothing about it, or to a rubber duck on your desk. Having to say what each line does makes you notice the line that does not do what you meant. Programmers really do call this <em>rubber duck debugging</em>.</p>
<h2>Tests that catch bugs</h2>
<p>Lesson 8 introduced <code>assert</code>. It is also a debugging tool. When you find a bug, first write an <code>assert</code> that fails because of it; then fix the bug and watch the test pass. The test stays behind as a guard, so the same bug can never quietly come back. Choose tests on purpose, including the edge cases where bugs live: 0, 1, an empty list, a negative number, a value exactly on a boundary.</p>`,
        { play: `def count_vowels(text):
    count = 0
    for ch in text:
        if ch in "aeiou":
            count = 1
    return count

assert count_vowels("") == 0, "empty text"
assert count_vowels("xyz") == 0, "no vowels"
assert count_vowels("banana") == 3, "three vowels"
assert count_vowels("Apple") == 2, "capital A counts too"
print("all tests passed")`, expectError: true, caption: 'The first two tests pass: they cannot see the bug, because the answer is 0 either way. The third fails. Find and fix that bug; then the fourth test finds a second one. Both are small fixes.' },
        { skill: 'tests', check: "Which test is most useful for a function that counts the even numbers in a list?", options: ["One where the answer is 0, such as an empty list", "One where a wrong program could fail, such as a list with evens and odds mixed", "Any test: all tests are equally useful"], answer: 1, why: "A test is useful when a wrong program could fail it. A test whose answer is 0 either way cannot tell a working function from a broken one.", wrong: ["This believes a test with the answer 0 is the safest. But a function that always returns 0 would pass it, so it cannot catch that bug.", null, "This believes more tests always help equally. A test no wrong program could fail tells you nothing, however many of them you write."] },
        `<p>Notice which tests passed: the ones whose answer was 0 whether the code was right or not. A test is only useful if a wrong program could fail it. That is why "banana" is a better test than "xyz" here.</p>
<h2>Errors you expect: try and except</h2>
<p>Sometimes a runtime error is not a bug at all. If you ask a person for a number and they type "seven", then <code>int("seven")</code> raising <code>ValueError</code> is correct behaviour; what you want is to handle it gracefully instead of crashing.</p>
<div class="stmt"><p><span class="kind">Rule (try and except).</span> <code>try:</code> followed by a block, then <code>except <i>ErrorKind</i>:</code> followed by a block. Python runs the <code>try</code> block. If an error of that kind happens inside it, the rest of the <code>try</code> block is skipped and the <code>except</code> block runs instead. If no error happens, the <code>except</code> block is skipped. An error of any other kind is not caught, and stops the program as usual.</p></div>`,
        { predict: true, play: `text = input("Type a whole number: ")
try:
    n = int(text)
    print("Double that is", n * 2)
except ValueError:
    print("That is not a whole number.")
print("The program keeps going either way.")`, stdin: 'seven', caption: 'This run types "seven", so int raises ValueError, the print inside try is skipped, and the except block runs. Change the input to 21 and the try block completes normally.' },
        { skill: 'try-except', check: "Inside <code>try:</code>, a line raises a <code>ZeroDivisionError</code>. The only handler is <code>except ValueError:</code>. What happens?", options: ["The except block runs anyway", "The error is not caught and the program stops, as usual", "Python skips the line and carries on"], answer: 1, why: "<code>except</code> catches only the kind it names. Any other kind passes through and stops the program, which is what you want for errors you did not expect.", wrong: ["This believes any except block catches any error. An except block catches only the kind it names, and ZeroDivisionError is not a ValueError.", null, "This believes Python can quietly skip a line that fails. It cannot: an error that no handler catches stops the program."] },
        `<p>Keep the <code>try</code> block small, around just the risky line, and name the exact kind of error you expect. The last sentence of the rule is a feature: an error you did not expect should still stop the program, because it is probably a real bug. A bare <code>except:</code> with no error kind catches everything, including typos and <code>NameError</code>s, and hides real bugs; avoid it.</p>
<details class="reveal"><summary>Predict: what does this print? <code>try:</code> / <code>n = int("12")</code> / <code>print(10 / (n - 12))</code> / <code>except ValueError:</code> / <code>print("not a number")</code></summary><p>Nothing is caught: the program stops with <code>ZeroDivisionError</code>. <code>int("12")</code> succeeds, and the error comes from the division by zero, which is not a <code>ValueError</code>, so the <code>except</code> block does not apply. That is exactly the behaviour you want: "not a number" would have been a lie.</p></details>
<h2>Before the exercises</h2>
<p>First you will trace a buggy function by hand. Then you will fix it: it has two logic errors in a short function. Use the loop: work out the right answer for a tiny input by hand, work out what the buggy code does with the same input, and let the difference tell you where to look. The last exercise asks you to handle an expected error with <code>try</code>. Here is a worked example of that shape, for a different error.</p>`,
        { predict: true, play: `def safe_divide(a, b, default):
    try:
        return a / b                  # the one risky line
    except ZeroDivisionError:
        return default                # what to give back instead

print(safe_divide(10, 4, 0))
print(safe_divide(1, 0, "n/a"))`, caption: 'It prints 2.5 and then n/a. The return inside try hands back the answer when the division works; when it fails, the except block returns the default instead. Change the second call to safe_divide(8, 2, 0) and the default is never used.' },
        { aside: `<p><b>A debugging checklist.</b> Read the whole error message: kind, description and line number. For a syntax error, check the line above the one reported too; a missing bracket is often noticed late. Reproduce the bug, then shrink the input until you can work out the answer by hand. Say where you think it goes wrong, then print to find out. Change one thing at a time, and run your tests after every change. Write a failing test before you fix a bug. Catch only the errors you expect, by name.</p>` },
        {
          ex: {
            id: 'py-8-3', skill: 'tests', kind: 'trace', title: 'Trace the buggy average',
            prompt: `<p>This is the function you are about to fix, with the call <code>average([2, 4, 6])</code>. It should give 4.0. Instead of guessing, follow it by hand and fill in the table: each row is a moment just after the line it names has run, and the cells are the values of the names then. Line 3 is the loop header, reached once for each pass; line 4 is the line inside the loop. The first row is done for you.</p>`,
            code: `def average(xs):\n    total = 0\n    for i in range(len(xs) - 1):\n        total = xs[i]\n    return total / len(xs)\n\nprint(average([2, 4, 6]))`,
            vars: ['i', 'total'],
            steps: [
              { line: 3, values: { i: '0', total: '0' }, show: true },
              { line: 4, values: { i: '0', total: '2' }, why: { total: { '0': 'This row is after line 4 has run, so total has changed: it is now xs[0], which is 2.' } } },
              { line: 3, values: { i: '1', total: '2' }, why: { i: { '2': 'range(len(xs) - 1) is range(2), which gives the positions 0 and 1 only: the second pass has i = 1.' } } },
              { line: 4, values: { i: '1', total: '4' }, why: { total: { '6': 'Nothing is added: total = xs[i] replaces the old total with xs[1], which is 4.' } } }
            ],
            hints: ['len(xs) is 3, so range(len(xs) - 1) is range(2). Which values does i take?', 'Line 4 does not add. It sets total to the item at position i, so after the pass for i = 1, total is xs[1].'],
            solution: '<p>i: 0, 0, 1, 1. total: 0, 2, 2, 4. The loop stops after position 1, so the 6 is never looked at, and total is 4 where it should be 12. Then 4 / 3 is about 1.33, not 4.0: the table has found both bugs.</p>',
            failTip: 'If you wrote 8 or 6 for total, look at line 4 again: it replaces total with xs[i] instead of adding to it.',
            followup: 'Fix one bug at a time and trace the program again after each fix. Which table cell changes first?'
          }
        },
        {
          ex: {
            id: 'py-8-1', skill: 'tests', title: 'Fix the bugs',
            prompt: `<p>The function below is supposed to return the average of a non-empty list of numbers, but it has <b>two</b> bugs. It runs without crashing, so both are logic errors. Work out by hand what it returns for <code>[2, 4, 6]</code>, then fix it so that it returns <code>4.0</code>. Keep the same shape: a loop and a return.</p>`,
            starter: `def average(xs):\n    total = 0\n    for i in range(len(xs) - 1):\n        total = xs[i]\n    return total / len(xs)\n\nprint(average([2, 4, 6]))`,
            solution: `def average(xs):\n    total = 0\n    for i in range(len(xs)):\n        total += xs[i]\n    return total / len(xs)\n\nprint(average([2, 4, 6]))`,
            hints: ['By hand: range(len(xs) - 1) is range(2), so i is 0 and 1; total becomes 2, then 4; 4 / 3 is 1.333…. Which item was skipped?', 'Two fixes: range(len(xs)) visits every position, and total += xs[i] adds instead of replacing.'],
            tests: [{ call: 'average([2, 4, 6])', expect: '4.0' }, { call: 'average([10])', expect: '10.0' }, { call: 'average([1, 2, 3, 4])', expect: '2.5' }, { call: 'average([5, 5, 5, 5, 5])', expect: '5.0' }, { call: 'average([-1, 1])', expect: '0.0' }],
            mustContain: [{ re: /\bfor\b/, msg: 'Keep the loop: the point is to find the bugs in it, not to replace it with sum().' }],
            mustNotContain: [{ re: /\bsum\s*\(/, msg: 'Fix the loop rather than swapping in sum().' }],
            failTip: 'If [10] gives 0.0, the loop still skips an item: a one-item list has range(1), not range(0).',
            followup: 'With only one of the two bugs fixed, average([5, 5, 5, 5, 5]) gives 4.0 or 1.0, so that test catches either bug on its own. average([10]) catches only the loop bug. Checking which tests can see which bugs is how you choose good tests.'
          }
        },
        {
          ex: {
            id: 'py-8-2', skill: 'try-except', title: 'A forgiving int',
            prompt: `<p>Write <code>safe_int(text, default)</code>, which returns <code>int(text)</code> when the text is a valid whole number and returns <code>default</code> otherwise, without ever crashing on bad text. Use <code>try</code> / <code>except ValueError</code>, as <code>safe_divide</code> did.</p>`,
            starter: `def safe_int(text, default):\n    ...\n\nprint(safe_int("42", 0))\nprint(safe_int("forty-two", 0))`,
            solution: `def safe_int(text, default):\n    try:\n        return int(text)\n    except ValueError:\n        return default\n\nprint(safe_int("42", 0))\nprint(safe_int("forty-two", 0))`,
            hints: ['Put return int(text) inside the try block.', 'In the except ValueError block, return default.'],
            tests: [{ call: 'safe_int("42", 0)', expect: '42' }, { call: 'safe_int("forty-two", 0)', expect: '0' }, { call: 'safe_int("", -1)', expect: '-1' }, { call: 'safe_int("-8", 0)', expect: '-8' }, { call: 'safe_int("3.5", 99)', expect: '99' }, { call: 'safe_int(" 7 ", 0)', expect: '7' }],
            mustContain: [{ re: /\btry\b/, msg: 'Use try / except: the whole point is to handle the error rather than avoid it.' }],
            failTip: 'If a test crashes with ValueError, the int(text) call is outside the try block.',
            followup: 'int(" 7 ") works because int ignores spaces at the ends, and int("3.5") fails because 3.5 is not a whole number. Rather than guessing which texts are valid, you let int decide and handle its answer.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>Syntax errors stop the program before it starts; runtime errors stop it with a message; logic errors give wrong answers silently. So how do you find a bug with no message? With a test that fails, and an experiment that narrows down where.</li>
<li>Read the error's kind, description and line number before changing anything.</li>
<li>Debug like a scientist: reproduce, shrink, hypothesise, print to test the guess, fix, and rerun every test. Halving the suspect region finds a fault fast.</li>
<li>A useful test is one a wrong program could fail. Write a failing test before fixing a bug.</li>
<li><code>try</code> / <code>except ErrorKind</code> handles errors you expect; other kinds still stop the program, as they should.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3A-AP-14', '2-AP-13', '2-AP-17', '3A-AP-17'], standard: 1,
      title: 'Checkpoint: lists, strings, functions and bugs', checkpoint: true, summary: 'No new ideas: mixed questions on lists, strings, functions and finding bugs, then a choice of the safe plan and a function that uses all four. What changes, and what stays the same?',
      blocks: [
        '<p>This lesson teaches nothing new. It mixes questions from the four lessons before it, because the ideas that look alike are the ones that cause bugs: a list and a string, a copy and a second name, <code>print</code> and <code>return</code>. Answer each one before looking back. If one surprises you, it will come back on the Review page after a day.</p><p>Ready? Here is the question underneath all of them: when you hand a value to a method or a function, what changes, and what stays exactly as it was?</p><h2>Mixed questions</h2>',
        { skill: 'list-index', check: 'A list <code>xs</code> has 5 items. Which expression is its last item?', options: ['<code>xs[5]</code>', '<code>xs[len(xs) - 1]</code>', '<code>xs[len(xs)]</code>'], answer: 1, wrong: ['Positions start at 0, so the five items are at 0 to 4. Position 5 is one past the end and raises an IndexError.', null, 'This is the same mistake as xs[5]: <code>len(xs)</code> is the count, 5, which is one more than the last position.'], why: 'The positions run from 0 to <code>len(xs) - 1</code>, so the last item is <code>xs[len(xs) - 1]</code>, which can also be written <code>xs[-1]</code>.' },
        { skill: 'slicing', check: 'For <code>s = "hello"</code> and <code>xs = ["h", "e", "l", "l", "o"]</code>, what do <code>s[1:3]</code> and <code>xs[1:3]</code> give?', options: ['<code>"el"</code> and <code>["e", "l"]</code>', '<code>"ell"</code> and <code>["e", "l", "l"]</code>', '<code>"el"</code> and <code>"el"</code>'], answer: 0, wrong: [null, 'A slice stops <em>before</em> its end position, so <code>[1:3]</code> takes positions 1 and 2 only, two items, not three.', 'A slice of a string is a string, but a slice of a list is a list. The brackets show which one you have.'], why: 'Both slices take positions 1 and 2. On a string the result is a string, <code>"el"</code>; on a list it is a list, <code>["e", "l"]</code>.' },
        { skill: 'aliasing', check: 'After <code>a = [1, 2]</code>, <code>b = a[:]</code> and <code>b.append(3)</code>, what is <code>a</code>?', options: ['<code>[1, 2]</code>', '<code>[1, 2, 3]</code>', 'An error'], answer: 0, wrong: [null, 'That is the answer for <code>b = a</code>, where both names share one list. The slice <code>a[:]</code> makes a new copy, so changing b leaves a alone.', 'Copying a list with a slice is allowed and common. Nothing here raises an error.'], why: '<code>a[:]</code> is a slice of everything, and a slice is a new list. After that, a and b are two separate lists.' },
        { skill: 'string-immutable', check: 'With <code>s = "cat"</code>, which one line gives <code>s</code> the value <code>"hat"</code>?', options: ['<code>s[0] = "h"</code>', '<code>s = "h" + s[1:]</code>', '<code>s.replace("c", "h")</code>'], answer: 1, wrong: ['A string can never be changed in place, so assigning to a position raises an error. You build a new string and move the name to it.', null, 'The method does make "hat", but the new string is thrown away because nothing stores it. s is still "cat".'], why: 'Strings never change, so you build a new one, <code>"h" + s[1:]</code>, and store it back under the name s.' },
        { skill: 'text-handling', check: 'What is <code>"-".join(["a", "b", "c"])</code>?', options: ['<code>"a-b-c"</code>', '<code>["a-b-c"]</code>', '<code>"abc-"</code>'], answer: 0, wrong: [null, 'The result of join is one string, not a list. It is <code>split</code> that makes a list from a string.', 'The separator goes <em>between</em> the items, never after the last one.'], why: '<code>join</code> glues the items of a list into one string with the separator between them. <code>split</code> is its opposite.' },
        { skill: 'return-vs-print', check: 'Which version of a function <code>area(w, h)</code> can be used inside a bigger sum, as in <code>area(3, 4) + 1</code>?', options: ['The one that prints <code>w * h</code>', 'The one that returns <code>w * h</code>', 'Either one: they do the same thing'], answer: 1, wrong: ['Printing only shows the number on the screen. The call itself gives back <code>None</code>, and <code>None + 1</code> is an error.', null, 'They look the same when run alone, but only a returned value can be used by the rest of the program. Showing and handing back are different jobs.'], why: '<code>return</code> hands the value to the caller, which can add 1 to it. <code>print</code> only shows it, and the call gives back <code>None</code>.' },
        { skill: 'parameters-scope', check: 'A function does <code>x = x + 1</code> on its parameter <code>x</code>. A program calls it as <code>f(n)</code> with <code>n = 5</code>. What is <code>n</code> afterwards?', options: ['6', '5', 'An error'], answer: 1, wrong: ['This thinks the parameter is the same name as n. It is a new local name that starts out attached to the same number; moving it to 6 does not move n.', null, 'Giving a parameter a new value is allowed. It only changes the function’s own local name.'], why: 'Inside the call, x is a local name attached to the value 5. <code>x = x + 1</code> moves x to 6 and leaves n attached to 5.' },
        { skill: 'tests', check: 'A function <code>is_adult(age)</code> should return True for 18 and over. Which test is most likely to expose a bug in it?', options: ['<code>is_adult(18)</code>, right on the boundary', '<code>is_adult(40)</code>', '<code>is_adult(5)</code>'], answer: 0, wrong: [null, 'A mistaken <code>&gt;</code> instead of <code>&gt;=</code> still gives True for 40, so this test passes for the right function and the buggy one alike.', 'A mistaken <code>&gt;</code> still gives False for 5. Tests far from the boundary cannot tell the two versions apart.'], why: 'The bug that hides best is at the edge, <code>&gt;</code> instead of <code>&gt;=</code>. A test is useful when a wrong program could fail it.' },
        { skill: 'try-except', check: 'Which problem is best handled with <code>try</code> and <code>except</code>, rather than by fixing the code?', options: ['A misspelt variable name', 'A person typing letters when you asked for a number', 'A missing colon after <code>def</code>'], answer: 1, wrong: ['A misspelt name is a bug in your program. Fix the spelling: catching a NameError would hide it, not cure it.', null, 'A missing colon is a syntax error, found before anything runs, so there is no moment at which an except could catch it.'], why: 'Bad input is an error you expect but cannot prevent, so you catch it, for example <code>except ValueError</code> around <code>int(...)</code>. A bug in your own code is fixed, not caught.' },
        '<p>Two exercises to finish the unit. The first needs no code: choose the plan that works. The second is a function that uses strings, a loop and <code>return</code> together.</p>',
        {
          ex: {
            id: 'py-15-1', skill: ['aliasing', 'return-vs-print', 'slicing'], kind: 'choice', title: 'The top three',
            prompt: '<p>A function <code>top_three(scores)</code> must give back the three highest scores from a list of numbers, without changing the list it was given, because the caller still needs it in its original order. Which plan works?</p>',
            options: [
              { text: '<code>scores.sort()</code>, then <code>return scores[-3:]</code>', why: '<code>sort</code> changes the caller’s list itself: when the function ends, the list is still in the new order. The caller’s original order is lost.' },
              { text: '<code>ordered = sorted(scores)</code>, then <code>return ordered[-3:]</code>', ok: true },
              { text: '<code>print(sorted(scores)[-3:])</code>', why: 'This shows the three scores but gives back <code>None</code>, so the caller has nothing to use. Showing a value and returning it are different things.' },
              { text: '<code>return sorted(scores)[3:]</code>', why: 'The slice <code>[3:]</code> starts at position 3, so it drops the three lowest and keeps all the rest. The highest three are at the end: <code>[-3:]</code>.' }
            ],
            hints: ['Two things are asked of the function: it must not change its list, and it must give an answer back. Which choices break one of them?', '<code>sorted</code> builds a new list and leaves the old one alone; <code>sort</code> changes the list in place. A slice counted from the end, <code>[-3:]</code>, takes the last three.'],
            solution: '<p><code>sorted(scores)</code> makes a new list in order and leaves the caller’s list alone, and <code>[-3:]</code> takes the last three items, the highest. <code>return</code> hands them back. <code>sort()</code> would reorder the caller’s list; <code>print</code> would give back nothing; <code>[3:]</code> would keep the wrong end.</p>',
            failTip: 'For each plan ask three questions: does it change the original list, does it give the answer back, and does the slice take the right end?',
            followup: 'Write top_three in the Code Lab and call it on a list. Print the list afterwards to check that its order did not change, then swap sorted for sort and see what happens.'
          }
        },
        {
          ex: {
            id: 'py-15-2', skill: ['text-handling', 'return-vs-print'], title: 'Initials',
            prompt: '<p>Write <code>initials(full_name)</code> that returns the initials of a name, in capitals, with no spaces between them. For <code>"ada king lovelace"</code> it returns <code>"AKL"</code>. Words are separated by spaces, there may be extra spaces, and an empty name gives the empty string. <em>Return</em> the answer; do not print it.</p>',
            starter: 'def initials(full_name):\n    result = ""\n    for word in full_name.split():\n        ...\n    return result\n\nprint(initials("ada king lovelace"))',
            solution: 'def initials(full_name):\n    result = ""\n    for word in full_name.split():\n        result += word[0].upper()\n    return result\n\nprint(initials("ada king lovelace"))',
            hints: ['full_name.split() gives the words, and word[0] is the first letter of one word. Strings cannot change, so .upper() gives a new string.', 'Build the answer with the accumulator pattern: start with an empty string, and add word[0].upper() for every word. Return it after the loop.'],
            tests: [{ call: 'initials("ada king lovelace")', expect: "'AKL'" }, { call: 'initials("grace hopper")', expect: "'GH'" }, { call: 'initials("alan")', expect: "'A'" }, { call: 'initials("")', expect: "''" }, { call: 'initials("  mary   jane  ")', expect: "'MJ'" }],
            failTip: 'If you get None, the function prints or has no return. If extra spaces crash it, check that you used split() with nothing in the brackets: it ignores runs of spaces.',
            followup: 'Change it to put a full stop after every initial, so that "ada king lovelace" gives "A.K.L.". Which one line changes?'
          }
        },
        '<div class="recap"><h3>Unit two in a few lines</h3><ul>\n<li>List positions start at 0; the last is <code>xs[-1]</code>. A slice stops before its end and gives the same kind of thing it was cut from. <code>b = a</code> shares one list; <code>a[:]</code> copies it.</li>\n<li>Strings never change: methods give back new strings, which you must store. <code>split</code> makes a list from text and <code>join</code> makes text from a list.</li>\n<li><code>return</code> hands a value to the caller; <code>print</code> only shows it. A function’s parameters and new names are local to its call.</li>\n<li>Test where a wrong program could fail, such as boundaries. Catch the errors you expect from the outside world, such as bad input, and fix the ones that are bugs.</li>\n<li>Next: dictionaries, which look values up by name instead of by position.</li>\n</ul></div>'
      ]
    },
    /* ================================================================== */
    {
      standard: 1,
      standards: ['3A-AP-14', '3A-DA-10', '3B-AP-12'],
      title: 'Dictionaries', summary: 'Looking things up by name instead of by position: keys and values, missing keys, looping over pairs, the counting pattern, which keys are allowed, and why lookup is fast however big the dictionary grows.',
      blocks: [
        `<p>A list is perfect when you know the <em>position</em> of what you want: the third song, the last score. But usually you know a <em>name</em>. You have a word and want its meaning, a student and want their score, a username and want the password check, a product and want its price. A paper dictionary works this way: you do not read it from page one; you jump to the word. Python's <em>dictionary</em> does the same, and it does it in a single step even when it holds millions of entries. This lesson shows how to use one, and how a dictionary makes one of the most useful patterns in programming, counting, a single line. But how can a program jump straight to one entry among millions without reading the others?</p>
<h2>Keys and values</h2>
<div class="stmt"><p><span class="kind">Rule (dictionaries).</span> A dictionary holds <em>pairs</em>, each made of a <em>key</em> and a <em>value</em>. It is written in curly braces: <code>{<i>key</i>: <i>value</i>, …}</code>; the empty dictionary is <code>{}</code>. Each key appears at most once. <code>d[<i>key</i>]</code> is the value stored with that key. <code>d[<i>key</i>] = <i>value</i></code> stores a value: it adds a new pair if the key is new, and replaces the old value if the key is already there. <code>len(d)</code> is the number of pairs.</p></div>
<p>Here is a small dictionary of Ojibwe words, the language of the Anishinaabe people of the Great Lakes, with their English meanings. The Ojibwe word is the key; its meaning is the value.</p>`,
        { predict: true, play: `ojibwe = {
    "boozhoo": "hello",
    "miigwech": "thank you",
    "makwa": "bear",
    "nibi": "water",
}
print(ojibwe["makwa"])
print(len(ojibwe))

ojibwe["mitig"] = "tree"          # a new key: adds a pair
ojibwe["nibi"] = "water (noun)"   # an existing key: replaces its value
print(ojibwe["nibi"])
print(len(ojibwe))`, caption: 'It prints bear, then 4, then water (noun), then 5. Adding mitig made a fifth pair. Storing under nibi a second time did not make a second nibi: each key appears once, so the new value replaced the old one and the length stayed at 5. Add a key of your own and print the length again.' },
        { skill: 'dict-basics', check: "<code>d = {\"a\": 1}</code>, then <code>d[\"a\"] = 5</code>, then <code>d[\"b\"] = 2</code>. What is <code>len(d)</code>?", options: ["3", "2", "1"], answer: 1, why: "Storing under an existing key replaces its value; storing under a new key adds a pair. Two keys, a and b.", wrong: ["This believes every assignment adds a pair. Storing under a key that is already there replaces its value, so the first assignment adds nothing.", null, "This believes a dictionary holds one pair at a time, so the new pair replaced the old. Only the same key is replaced; the key b is new, so it is added."] },
        `<h2>Missing keys</h2>
<div class="stmt"><p><span class="kind">Rule (missing keys).</span> <code>d[<i>key</i>]</code> for a key that is not in the dictionary raises <code>KeyError</code>. <code><i>key</i> in d</code> asks whether the key is there. <code>d.get(<i>key</i>, <i>fallback</i>)</code> gives the value if the key is there and the fallback if it is not, without an error.</p></div>`,
        { play: `prices = {"apple": 0.5, "fig": 1.25}
print("fig" in prices, "mango" in prices)
print(prices.get("apple", 0))
print(prices.get("mango", 0))     # not there: the fallback, 0
print(prices["mango"])            # not there: an error`, expectError: true, caption: 'True False, then 0.5 and 0, and then the last line raises KeyError: mango. Delete it and the program runs cleanly.' },
        { skill: 'dict-get', check: "Which expression looks up <code>\"pear\"</code> safely, giving 0 if it is missing?", options: ["<code>d[\"pear\"] or 0</code>", "<code>d.get(\"pear\", 0)</code>", "<code>d[\"pear\", 0]</code>"], answer: 1, why: "<code>get</code> returns the value if the key is there and the fallback if not, without an error. <code>d[\"pear\"]</code> raises KeyError first.", wrong: ["This believes <code>or 0</code> can rescue a missing key. The square brackets raise KeyError before <code>or</code> is ever reached; <code>or</code> only helps with a value that is there but false.", null, "This believes a lookup can take a fallback inside square brackets. Square brackets take one key; <code>d[\"pear\", 0]</code> looks for the key <code>(\"pear\", 0)</code>, a tuple, and raises KeyError."] },
        `<p>Use square brackets when a missing key would be a bug, so that the error tells you about it (Lesson 9). Use <code>get</code> when a missing key is a normal situation, such as a word you have not counted yet. One more trap: <code>in</code> checks the <em>keys</em> only. <code>"bear" in ojibwe</code> is <code>False</code>, because "bear" is a value, not a key.</p>
<h2>Looping over a dictionary</h2>
<div class="stmt"><p><span class="kind">Rule (looping).</span> <code>for k in d:</code> visits the keys, in the order they were first added. <code>d.values()</code> gives the values, and <code>d.items()</code> gives the pairs, so <code>for k, v in d.items():</code> visits each key together with its value.</p></div>`,
        { predict: true, play: `scores = {"Ada": 92, "Grace": 88, "Linus": 79}

for name in scores:
    print(name, scores[name])

print("---")
for name, score in scores.items():
    if score >= 85:
        print(name, "gets an A")

print("total:", sum(scores.values()))`, caption: 'It prints each name with its score (Ada 92, Grace 88, Linus 79), then ---, then Ada gets an A and Grace gets an A, then total: 259. The keys come out in the order they were added. The second loop unpacks each pair into name and score, so Linus, with 79, is left out. sum works on the values, since each is a number. Change 85 to 90 and see who is left.' },
        `<details class="reveal"><summary>Puzzle: turn <code>ojibwe</code> round into an English-to-Ojibwe dictionary, <code>english</code>, so that <code>english["bear"]</code> is <code>"makwa"</code>. What could go wrong if two words had the same meaning?</summary><p>Start with <code>english = {}</code> and loop: <code>for word, meaning in ojibwe.items(): english[meaning] = word</code>. The keys and values swap places. If two Ojibwe words had the same meaning, they would compete for the same English key, and since each key appears once, the second would replace the first: one of them would be lost. Reversing a dictionary is only safe when no value appears twice.</p></details>
<h2>The counting pattern</h2>
<p>The most useful thing a dictionary does is count. How many times does each word appear in a text? Make each word a key, with its count so far as the value. This is Lesson 4's accumulator pattern, with a whole dictionary as the accumulator.</p>`,
        { predict: true, play: `text = "the cat sat on the mat and the cat slept"
counts = {}
for word in text.split():
    counts[word] = counts.get(word, 0) + 1
print(len(counts), counts["the"], counts["sat"])

for word, n in counts.items():
    if n > 1:
        print(word, "appears", n, "times")`, caption: 'It prints 7 3 1, then the appears 3 times and cat appears 2 times. The ten words have seven different spellings, so there are seven keys. Read the line inside the loop slowly: look up the count so far (0 if the word is new), add one, and store it back under the same key. Change the text and predict again.' },
        `<details class="reveal"><summary>Trace it: what is <code>counts</code> after each of the first five words of "the cat sat on the mat"?</summary><p>After "the": <code>{'the': 1}</code>. After "cat": <code>{'the': 1, 'cat': 1}</code>. After "sat" and "on", two more keys with 1. After the second "the", <code>get</code> finds 1, so <code>counts['the']</code> becomes 2. A new word adds a key; a repeated word changes a value.</p></details>
<p>Counting letters instead of words is the first step in breaking secret codes: in English text, e is the most common letter by a long way, and a code that replaces each letter by another one leaves the counts unchanged, only relabelled. The Caesar cipher project at the end of this course uses exactly that idea.</p>
<h2>What can be a key?</h2>
<div class="stmt"><p><span class="kind">Rule (keys).</span> A key must be a value that can never change: numbers, strings, <code>True</code> and <code>False</code>, and tuples of these. Lists and dictionaries cannot be keys. Values, on the other hand, can be anything at all, including lists and other dictionaries.</p></div>`,
        { play: `grid = {(0, 0): "start", (2, 3): "treasure"}   # tuples as keys: coordinates
print(grid[(2, 3)])

student = {"name": "Ada", "scores": [92, 88, 95], "year": 11}   # a list as a value
student["scores"].append(90)
print(student["name"], "average:", sum(student["scores"]) / len(student["scores"]))

bad = {[1, 2]: "no"}                           # a list as a key`, expectError: true, caption: 'Coordinates make natural keys for a game map. The last line raises TypeError: unhashable type: \'list\', because a list could change after being used as a key.' },
        { skill: 'dict-basics', check: "Which of these can be a dictionary key?", options: ["A list, <code>[1, 2]</code>", "A tuple, <code>(1, 2)</code>", "Another dictionary"], answer: 1, why: "A key must be a value that can never change: numbers, strings, True and False, and tuples of these. Lists and dictionaries can change, so they cannot be keys.", wrong: ["This believes any value can be a key. A list can change after it is stored, which would break the dictionary's lookup, so Python refuses it with a TypeError.", null, "This believes a dictionary can be a key because it can be a value. Values may be anything, but a dictionary can change, so it cannot be a key."] },
        `<p>Why the restriction? A dictionary finds a key in one step by computing a number from it, called a <em>hash</em>, and using that number to decide where to store the pair. (The mathematics course's Lesson 13 calls this a hash table and explains why it matters so much for speed.) If a key could change after it was stored, its hash would change, and the dictionary would look for it in the wrong place. So keys must be values that never change. That one design decision is why <code>word in counts</code> takes one step however many words have been counted, while <code>word in some_list</code> may have to check every item.</p>
<h2>Before the exercises</h2>
<p>First you will trace the counting pattern by hand. The next exercise is the counting pattern, wrapped in a function. The last one counts, then looks through the counts for the largest, with Lesson 4's "best so far" pattern: start with nothing, and replace the best only when something is strictly bigger. Here are worked examples of both shapes: counting the letters of a word, and finding the highest scorer.</p>`,
        { predict: true, play: `def count_letters(word):
    counts = {}
    for ch in word:
        counts[ch] = counts.get(ch, 0) + 1
    return counts

def top_scorer(scores):
    best_name = None
    best_score = -1
    for name, score in scores.items():
        if score > best_score:          # strict: an earlier name keeps a tie
            best_score = score
            best_name = name
    return best_name

letters = count_letters("banana")
print(letters["a"], letters["n"], len(letters))
print(top_scorer({"Ada": 92, "Grace": 95, "Linus": 95}))`, caption: "It prints 3 2 3, then Grace. banana has three a's, two n's and three different letters, so the dictionary has three keys. Grace and Linus tie at 95, and the strict > keeps the one that came first. Change > to >= and see who wins the tie." },
        { aside: `<p><b>Common mistakes in this lesson.</b> Using square brackets on a key that may be missing; use <code>get</code> or check with <code>in</code> first. Testing <code>value in d</code> when <code>in</code> only looks at keys. Using a list as a key. Forgetting <code>.items()</code>, so the loop variable is only the key. Expecting two pairs with the same key: storing again replaces the value. Spelling a key differently in two places, such as "Ada" and "ada"; lower-case text before counting it.</p>` },
        {
          ex: {
            id: 'py-9-3', skill: 'dict-get', kind: 'trace', title: 'Trace the counts',
            prompt: `<p>Watch a dictionary being filled. Work through this program by hand and fill in the table: each row is a moment just after line 5 has run, once for each word, and the cells are the values then. <code>len(counts)</code> is the number of keys so far. The first row is done for you.</p>`,
            code: `words = ["to", "be", "or", "to", "be"]\ncounts = {}\nfor w in words:\n    n = counts.get(w, 0)\n    counts[w] = n + 1\nprint(counts["to"], counts["be"])`,
            vars: ['w', 'n', 'len(counts)'],
            steps: [
              { line: 5, values: { w: 'to', n: '0', 'len(counts)': '1' }, show: true },
              { line: 5, values: { w: 'be', n: '0', 'len(counts)': '2' } },
              { line: 5, values: { w: 'or', n: '0', 'len(counts)': '3' } },
              { line: 5, values: { w: 'to', n: '1', 'len(counts)': '3' }, why: { n: { '2': 'n is the count so far, read on line 4 before the +1 on line 5. The second "to" finds 1.' }, 'len(counts)': { '4': 'A word that is already a key adds no new pair: there are still three keys.' } } },
              { line: 5, values: { w: 'be', n: '1', 'len(counts)': '3' }, why: { 'len(counts)': { '4': 'A word that is already a key adds no new pair: there are still three keys.', '5': 'Count the keys, not the words: to, be and or.' } } }
            ],
            hints: ['Line 4 asks: how many times have I seen this word before? A word that is new gets 0 from get. Line 5 stores that number plus one.', 'The keys, in order of arrival, are to, be, or. The second "to" and the second "be" are already keys, so len(counts) stops growing, and n is 1 for them.'],
            solution: '<p>w: to, be, or, to, be. n: 0, 0, 0, 1, 1. len(counts): 1, 2, 3, 3, 3. The program prints <code>2 2</code>.</p>',
            failTip: 'If n looks one too big, remember that n is the old count: line 4 reads it, and line 5 adds one afterwards.',
            followup: 'Change the list to ["a", "a", "a", "b"] and trace it before running it. What is len(counts) at the end, and what does it count?'
          }
        },
        {
          ex: {
            id: 'py-9-1', skill: 'dict-get', title: 'Word counts',
            prompt: `<p>Write <code>count_words(text)</code> that returns a dictionary mapping each word in <code>text</code> to the number of times it appears. Words are separated by spaces; treat capitals and lower case as the same word by lower-casing first. So <code>count_words("The cat the")</code> returns <code>{'the': 2, 'cat': 1}</code>.</p>`,
            starter: `def count_words(text):\n    counts = {}\n    for word in text.lower().split():\n        ...\n    return counts\n\nprint(count_words("The cat the"))`,
            solution: `def count_words(text):\n    counts = {}\n    for word in text.lower().split():\n        counts[word] = counts.get(word, 0) + 1\n    return counts\n\nprint(count_words("The cat the"))`,
            hints: ['Inside the loop, the counting line: counts[word] = counts.get(word, 0) + 1', 'The keys come out in the order the words first appeared, which is the order the tests expect.'],
            tests: [{ call: 'count_words("The cat the")', expect: "{'the': 2, 'cat': 1}" }, { call: 'count_words("")', expect: '{}' }, { call: 'count_words("a a a")', expect: "{'a': 3}" }, { call: 'count_words("one two three two")', expect: "{'one': 1, 'two': 2, 'three': 1}" }, { call: 'count_words("Go GO go")', expect: "{'go': 3}" }],
            failTip: 'If you get a KeyError, you used counts[word] + 1 for a word that has no count yet: use counts.get(word, 0) + 1.',
            followup: 'The dictionary can hold every word of a whole book, and each count still takes one step to update.'
          }
        },
        {
          ex: {
            id: 'py-9-2', skill: 'accumulator', title: 'Most common',
            prompt: `<p>Write <code>most_common(text)</code> that returns the word appearing most often in <code>text</code> (lower-cased). If several words tie, return the one that appeared <em>first</em> in the text. Count with a dictionary, then walk through it with the "best so far" pattern using a strict <code>&gt;</code>, as <code>top_scorer</code> did.</p>`,
            starter: `def most_common(text):\n    counts = {}\n    for word in text.lower().split():\n        counts[word] = counts.get(word, 0) + 1\n    best_word = None\n    best_count = 0\n    for word, n in counts.items():\n        ...\n    return best_word\n\nprint(most_common("the cat sat on the mat"))`,
            solution: `def most_common(text):\n    counts = {}\n    for word in text.lower().split():\n        counts[word] = counts.get(word, 0) + 1\n    best_word = None\n    best_count = 0\n    for word, n in counts.items():\n        if n > best_count:\n            best_count = n\n            best_word = word\n    return best_word\n\nprint(most_common("the cat sat on the mat"))`,
            hints: ['Inside the second loop: if n > best_count, remember both n and word.', 'Because the dictionary keeps the order in which words were first added, and > is strict, the first word to reach the top count wins a tie.'],
            tests: [{ call: 'most_common("the cat sat on the mat")', expect: "'the'" }, { call: 'most_common("b a b a")', expect: "'b'" }, { call: 'most_common("Hello hello HELLO world")', expect: "'hello'" }, { call: 'most_common("one")', expect: "'one'" }, { call: 'most_common("x y z z y z")', expect: "'z'" }],
            mustNotContain: [{ re: /\bmax\s*\(|\bsorted\s*\(|Counter/, msg: 'Write the "best so far" loop yourself; no max(), sorted() or Counter.' }],
            failTip: 'If "b a b a" gives a, the comparison is >= : a later word with an equal count replaced the earlier one.',
            followup: 'Write most_common again so that a tie goes to the word that comes first in the alphabet instead. Which comparison changes, and what extra test does a tie now need?'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A dictionary maps keys to values. <code>d[key]</code> looks up; <code>d[key] = v</code> adds a pair or replaces a value; each key appears once.</li>
<li>A missing key raises <code>KeyError</code>; <code>key in d</code> checks keys, and <code>d.get(key, fallback)</code> avoids the error.</li>
<li><code>for k, v in d.items():</code> visits pairs, in the order keys were added.</li>
<li>Counting: <code>counts[k] = counts.get(k, 0) + 1</code>. Finding the largest count: best so far, with a strict <code>&gt;</code>.</li>
<li>Keys must be unchangeable (numbers, strings, tuples). That is how a program can jump straight to one entry among millions: the dictionary computes a hash from the key and goes directly to that place, so it finds any key in one step.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['2-AP-16', '2-DA-09', '3A-DA-12', '3B-DA-07', '6.1.2.3', '7.1.2.2', '7.1.2.5', '7.1.2.6'],
      standard: 1, title: 'Randomness and simulation', summary: 'Dice, coins and shuffled decks from the random module, repeatable randomness with seeds, and answering "how likely is that?" by running the experiment thousands of times, including two famous puzzles that fool almost everyone.',
      blocks: [
        `<p>Here is a question to try on your friends. In a class of 23 people, how likely is it that two of them share a birthday? Most people guess something small, since there are 365 days to choose from. The true answer is just over one half. Nearly everyone's intuition gets this wrong, and a program can settle the argument in a few lines, without any probability theory, by simply trying it thousands of times. But a computer follows its instructions exactly. So how can it produce chance at all, and can trying something thousands of times really settle a question?</p>
<h2>The random module</h2>
<div class="stmt"><p><span class="kind">Rule (the random module).</span> After <code>import random</code> at the top of a program:</p>
<p><code>random.randint(<i>a</i>, <i>b</i>)</code> gives a whole number from <i>a</i> to <i>b</i>, <em>including both ends</em>, each equally likely. <code>random.choice(<i>xs</i>)</code> gives one item of the list <i>xs</i>. <code>random.shuffle(<i>xs</i>)</code> puts the items of <i>xs</i> in a random order, changing the list in place and giving back <code>None</code>. <code>random.random()</code> gives a decimal from 0 up to, but not including, 1.</p></div>
<p>Watch the ends. <code>randint(1, 6)</code> can give 6, but <code>range(1, 6)</code> stops at 5 (Lesson 4). It is an inconsistency in Python that catches everyone once.</p>
<details class="reveal"><summary>Guess first: in the example below, what can change from run to run, and what can never change?</summary><p>The values change on every run, so you cannot predict them. But their shape is fixed: the first two lines are whole numbers from 1 to 6 (and 6 can appear), line 3 is one of the three words, line 4 is a decimal that is at least 0 and below 1, and line 5 always holds all five cards, each once, only in a different order.</p></details>`,
        { play: `import random

print(random.randint(1, 6))        # a die: 1 to 6, both included
print(random.randint(1, 6))
print(random.choice(["rock", "paper", "scissors"]))
print(random.random())             # a decimal from 0 up to 1

deck = ["A", "K", "Q", "J", "10"]
random.shuffle(deck)               # changes deck itself
print(deck)`, caption: 'Run it several times: different values each time, but always the same shape. Like append in Lesson 6, shuffle changes the list and gives back None, so write random.shuffle(deck), never deck = random.shuffle(deck).' },
        { skill: 'random-module', check: "Which values can <code>random.randint(1, 6)</code> give?", options: ["1 to 5, like range", "1 to 6, including both ends", "0 to 6"], answer: 1, why: "Unlike range, randint includes both ends: a dice roll is exactly <code>randint(1, 6)</code>.", wrong: ["Mixes randint up with <code>range(1, 6)</code>, which stops before 6. randint is the odd one out: it includes its last number.", null, "Counts from 0 as lists do. randint starts exactly where you tell it: <code>randint(1, 6)</code> never gives 0."] },
        `<h2>Numbers that only look random</h2>
<p>A computer follows instructions exactly, so it cannot really produce chance. What <code>random</code> produces are <em>pseudorandom</em> numbers: a long sequence computed by a fixed rule from a starting value called the <em>seed</em>, designed so that no pattern shows. When the numbers must be truly unpredictable, as for the secret keys that protect web traffic, they need a physical source of chance: the internet company Cloudflare films a wall of lava lamps and mixes the pictures into its random numbers. Normally Python picks the seed from the operating system's own supply of randomness (or, failing that, the clock), so every run is different. You can choose it yourself.</p>`,
        { photo: 'lava-lamps', caption: "The wall of lava lamps at Cloudflare. The blobs of wax never move the same way twice." },
        `<div class="stmt"><p><span class="kind">Rule (seeds).</span> <code>random.seed(<i>s</i>)</code> sets the seed. After the same seed, the random functions give exactly the same sequence of results.</p></div>
<details class="reveal"><summary>Guess first: the example below sets seed 7, prints three numbers, sets seed 7 again and prints three more. Will the two lines match? And a line after seed 8?</summary><p>The two seed-7 lines match exactly: the seed decides the whole sequence. Seed 8 starts a different sequence, so its line is almost surely different (three numbers from 1 to 100 match by luck about once in a million tries). The numbers you see depend on Python's rule for turning seeds into numbers, and the site's Python may not print the same ones as your own computer's.</p></details>`,
        { play: `import random

random.seed(7)
print(random.randint(1, 100), random.randint(1, 100), random.randint(1, 100))
random.seed(7)
print(random.randint(1, 100), random.randint(1, 100), random.randint(1, 100))
random.seed(8)
print(random.randint(1, 100), random.randint(1, 100), random.randint(1, 100))`, caption: 'The same seed replays the same numbers; a different seed gives different ones. Games use this to share a level ("try seed 4471"), and scientists so that others can repeat their results exactly.' },
        { skill: 'random-module', check: "Two runs of a program both start with <code>random.seed(42)</code>. What do their random numbers look like?", options: ["Different each run, as random numbers should be", "Exactly the same sequence in both runs", "The same only for the first number"], answer: 1, why: "The numbers are pseudorandom: the seed decides the whole sequence. The same seed replays it exactly, which is useful for debugging and sharing.", wrong: ["Believes the computer produces real chance. It only follows a fixed rule from the seed, so the same seed always gives the same numbers; the operating system usually supplies a different seed each run, which is why runs look different.", null, "Thinks the seed only affects the start. It decides the entire sequence, every number after the first as well."] },
        `<p>Seeds are also a debugging tool (Lesson 9): a bug that appears only with certain random numbers is maddening, but fix the seed and the bug happens the same way every time, so you can reproduce it, shrink it and fix it.</p>
<h2>Counting what comes up</h2>
<p>A loop and <code>randint</code> make a dice machine; Lesson 11's counting pattern tallies the faces. A fair die shows each face with probability 1/6, so in 600 rolls each should appear about 100 times, but not exactly.</p>
<details class="reveal"><summary>Guess first: will all six fractions be close to 0.167 with 60 rolls? With 6000?</summary><p>With 60 rolls, no: each face comes up only about 10 times, and chance moves that by a few either way, so fractions a few hundredths away from 0.167 are normal. With 6000 rolls they are usually within about 0.01. The program prints three lines, one for each number of rolls, so you can compare.</p></details>`,
        { play: `import random

for rolls in [60, 600, 6000]:
    counts = {}
    for i in range(rolls):
        face = random.randint(1, 6)
        counts[face] = counts.get(face, 0) + 1
    fractions = []
    for face in range(1, 7):
        fractions.append(round(counts.get(face, 0) / rolls, 3))
    print(rolls, "rolls:", fractions)`, caption: 'Every fraction should be about 0.167. With 60 rolls some are far off; with 6000 all are close. Run it again and compare.' },
        { skill: 'simulation', check: "To estimate the probability of rolling a double six, a program repeats the experiment 10,000 times. What does it compute at the end?", options: ["The number of double sixes", "The number of double sixes divided by 10,000", "10,000 divided by the number of double sixes"], answer: 1, why: "Monte Carlo: repeat the experiment, count the successes, divide by the number of trials. The estimate settles as the trials grow.", wrong: ["Forgets that a probability is a fraction of the trials. A count of, say, 280 depends on how many trials were run; 280 out of 10,000 is the same as 0.028 whatever the number of trials.", null, "Turns the fraction upside down. That gives about 36 (trials per success), not the chance of success."] },
        `<p>That the fractions settle down as the number of trials grows is called the <em>law of large numbers</em>. But they settle slowly. The typical error of an estimate from <i>n</i> trials shrinks in proportion to 1/√<i>n</i>, so to make an estimate ten times more precise you need a <em>hundred</em> times as many trials. Keep that in mind whenever a simulation gives you a number: it is an estimate with a wobble, not an exact answer.</p>
<h2>Answering a question by simulation</h2>
<p>Here is the trick promised at the start. To find how likely something is, you do not need to calculate: run the experiment many times, count how often it happens, and divide by the number of trials. This is called a <em>Monte Carlo simulation</em>, after the casino, and it is used for real, to price insurance, forecast weather and plan space missions. Back to the birthdays.</p>`,
        { play: `import random

def shared_birthday(people):
    birthdays = []
    for i in range(people):
        birthdays.append(random.randint(1, 365))
    return len(set(birthdays)) < people      # set keeps each day once: fewer days than people means a repeat

trials = 2000
for people in [10, 23, 40, 60]:
    hits = 0
    for t in range(trials):
        if shared_birthday(people):
            hits += 1
    print(people, "people:", hits / trials)`, caption: 'With 23 people the answer is about 0.5, and with 60 it is almost certain. A set keeps each value once, so if the set of birthdays is smaller than the list, two people share a day. (This takes a second or two.)' },
        `<details class="reveal"><summary>Why is the answer so much bigger than people expect?</summary><p>Because the question is about <em>any</em> two people, not about you. 23 people make 23 × 22 / 2 = 253 pairs (each of 23 people with each of the other 22, halved because a pair counts once), and each pair has a 1 in 365 chance of sharing. With 253 chances, a match becomes likely. Most people instinctively think only of the 22 pairs that include themselves. The exact probability for 23 people is about 0.507, and the simulation agrees to within its wobble.</p></details>
<p>Here is a second puzzle, which famously fooled many professional mathematicians when it appeared in a magazine column in 1990. On a game show there are three doors: a car behind one, goats behind the other two. You pick a door. The host, who knows where the car is, opens a different door to show a goat, and offers you the chance to switch to the other closed door. Should you?</p>`,
        { play: `import random

trials = 3000
stay_wins = 0
switch_wins = 0
for t in range(trials):
    car = random.randint(1, 3)
    pick = random.randint(1, 3)
    if pick == car:
        stay_wins += 1       # staying wins only if the first pick was right
    else:
        switch_wins += 1     # the host has opened the other goat door, so switching wins
print("stay:", stay_wins / trials, " switch:", switch_wins / trials)`, caption: 'Switching wins about two thirds of the time. The program did not even need to act out the host: it only needed to notice when each strategy wins.' },
        `<details class="reveal"><summary>Why does switching win two thirds of the time?</summary><p>Your first pick is right with probability 1/3. If it was right, switching loses. If it was wrong, which happens with probability 2/3, the car is behind one of the two other doors, and the host has just opened the one with the goat, so the remaining door must hold the car: switching wins. So switching wins exactly when your first pick was wrong, with probability 2/3. Writing the program forced exactly this reasoning, which is one reason simulations are good for thinking.</p></details>
<h2>Before the exercises</h2>
<p>The first exercise builds a list of rolls with a loop, so the <code>randint</code> call must be <em>inside</em> the loop: one call per roll. The second is a complete simulation, with the pattern of every example above: repeat, count the successes, divide by the number of trials. Here is a worked example of each shape.</p>
<details class="reveal"><summary>Guess first: how long is the list that <code>flips(8)</code> gives, and what will the last line be close to?</summary><p>The list always has 8 items, each <code>"H"</code> or <code>"T"</code>, in no predictable order. The last line is the fraction of 3000 die rolls showing 5 or 6: two faces out of six, so close to 0.333, give or take about 0.01.</p></details>`,
        { play: `import random

def flips(n):                          # a list of n coin flips
    result = []
    for i in range(n):
        result.append(random.choice(["H", "T"]))   # a new flip on every pass
    return result

def fraction_at_least_five(trials):    # a die shows 5 or 6: exactly 2/6
    hits = 0
    for i in range(trials):
        if random.randint(1, 6) >= 5:
            hits += 1
    return hits / trials

print(flips(8))
print(fraction_at_least_five(3000))    # about 0.333`, caption: 'Calling random.choice once before the loop and appending that same result eight times would give eight identical flips: roll inside the loop.' },
        { aside: `<p><b>Common mistakes in this lesson.</b> Forgetting <code>import random</code>. Calling <code>randint</code> once, before the loop, so every "roll" is the same. Expecting <code>randint(1, 6)</code> to stop at 5, like <code>range</code>. Writing <code>xs = random.shuffle(xs)</code>, which sets <code>xs</code> to <code>None</code>. Using <code>random.random()</code> when a whole number was wanted. Dividing by the wrong total. Trusting an estimate from too few trials.</p>` },
        {
          ex: {
            id: 'py-10-1', skill: 'random-module', title: 'Roll some dice',
            prompt: `<p>Write <code>roll(n)</code>, which returns a list of <code>n</code> dice rolls, each a whole number from 1 to 6. The tests cannot know which numbers you will roll, so they check the <em>shape</em> of your answer: the right length, every value in range, and, over many rolls, every face appearing.</p>`,
            starter: `import random\n\ndef roll(n):\n    rolls = []\n    ...\n    return rolls\n\nprint(roll(5))`,
            solution: `import random\n\ndef roll(n):\n    rolls = []\n    for i in range(n):\n        rolls.append(random.randint(1, 6))\n    return rolls\n\nprint(roll(5))`,
            hints: ['Loop n times, like flips above; each time append random.randint(1, 6) to the list.', 'The randint call must be inside the loop, so that each roll is fresh.', 'The body of the loop is one line: rolls.append(random.randint(1, 6)). Then return rolls after the loop.'],
            tests: [{ call: 'len(roll(10))', expect: '10' }, { call: 'len(roll(0))', expect: '0' }, { call: 'all(1 <= x <= 6 for x in roll(300))', expect: 'True' }, { call: 'all(type(x) == int for x in roll(20))', expect: 'True' }, { call: 'sorted(set(roll(600)))', expect: '[1, 2, 3, 4, 5, 6]' }],
            mustContain: [{ re: /random\.(randint|choice|randrange)/, msg: 'Use the random module to roll each die.' }],
            failTip: 'If the last test fails, some face never appears: check that each roll is a new call to randint inside the loop, and that the range is 1 to 6.',
            followup: 'Add a second parameter, sides, so that roll(5, 20) rolls five twenty-sided dice. Then use your roll to find how often the total of two dice is 7: it is the most common total, 6 times in 36.'
          }
        },
        {
          ex: {
            id: 'py-10-2', skill: 'simulation', title: 'How likely is double six?',
            prompt: `<p>Write <code>double_six_fraction(trials)</code>: roll two dice <code>trials</code> times, count how often <em>both</em> show 6, and return the count divided by <code>trials</code>. The exact probability is 1/36, about 0.028, so with 5000 trials your answer should land between 0.015 and 0.045 nearly every time.</p>`,
            starter: `import random\n\ndef double_six_fraction(trials):\n    hits = 0\n    for i in range(trials):\n        ...\n    return hits / trials\n\nprint(double_six_fraction(5000))`,
            solution: `import random\n\ndef double_six_fraction(trials):\n    hits = 0\n    for i in range(trials):\n        a = random.randint(1, 6)\n        b = random.randint(1, 6)\n        if a == 6 and b == 6:\n            hits += 1\n    return hits / trials\n\nprint(double_six_fraction(5000))`,
            hints: ['Roll two separate dice inside the loop, with two randint calls.', 'Count a hit only when a == 6 and b == 6.', 'Inside the loop: a = random.randint(1, 6), then b = random.randint(1, 6), then if a == 6 and b == 6: hits += 1. After the loop, return hits / trials.'],
            tests: [{ call: '0.015 < double_six_fraction(5000) < 0.045', expect: 'True' }, { call: '0.015 < double_six_fraction(5000) < 0.045', expect: 'True' }, { call: 'double_six_fraction(1) in (0.0, 1.0)', expect: 'True' }],
            mustContain: [{ re: /random\./, msg: 'Simulate it with the random module rather than calculating 1/36 directly.' }],
            failTip: 'If the answer is far from 0.028, check that both dice are rolled again on every pass, and that the test uses and, not or.',
            followup: 'Why 1/36? The two dice are independent, so there are 6 × 6 = 36 equally likely pairs, and only (6, 6) counts. With 5000 trials the typical error is about 0.002, which is why the tests allow a margin.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>The opening question: a computer cannot produce real chance, but pseudorandom numbers are good enough to simulate it, and repeating an experiment thousands of times and counting gives a trustworthy estimate (with a small wobble).</li>
<li><code>import random</code>; <code>randint(a, b)</code> includes both ends; <code>choice</code>, <code>shuffle</code> (in place, gives back <code>None</code>) and <code>random()</code>.</li>
<li>The numbers are pseudorandom: <code>random.seed(s)</code> replays the same sequence, which helps debugging and sharing.</li>
<li>Monte Carlo: to estimate a probability, repeat the experiment, count the successes, divide by the trials.</li>
<li>Estimates settle as trials grow, but slowly: the error shrinks like 1/√<i>n</i>.</li>
<li>Simulations settle arguments where intuition fails: 23 people make a shared birthday likely, and switching doors wins two thirds of the time.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-10', '3B-AP-13', '9.3.7.4'],
      standard: 1, title: 'Recursion', summary: 'Functions that call themselves: base cases and progress, what the call stack does, why trusting the recursive call is justified, recursion on lists and strings, the Tower of Hanoi, and making slow recursion fast with a dictionary.',
      blocks: [
        `<p>In 1883 the French mathematician Édouard Lucas sold a puzzle with a story attached. In a temple, the story went, priests are moving a tower of 64 golden discs from one peg to another, one disc at a time, never putting a larger disc on a smaller one, using a third peg to help. When they finish, the world will end. Should we worry? How long would the priests really need, and how could a program that never plans more than one move ahead solve the puzzle for any number of discs? By the end of this lesson you will have written that program and worked out the answer.</p>`,
        { photo: ['hanoi-bremen', 'hanoi-1884'], caption: "Left: a wooden Tower of Hanoi, photographed in Bremen in Germany, partway through a game. Right: the puzzle as Popular Science Monthly drew it in 1884-85, at the start, partway through and finished: the whole tower moved from peg A to peg B." },
        `<p>The program uses <em>recursion</em>: a function that calls itself. At first that looks like a trick that should not work, like a dictionary that defines a word using the same word. It does work, and for some problems it is the most natural way to think.</p>
<h2>A function that calls itself</h2>
<p>The factorial of 5, written 5!, is 5 × 4 × 3 × 2 × 1 = 120. Notice that 4 × 3 × 2 × 1 is just 4!. So 5! = 5 × 4!, and in general <i>n</i>! = <i>n</i> × (<i>n</i> − 1)!, with 0! = 1 to get started. Write exactly that down in Python, and you are finished.</p>`,
        { predict: true, play: `def factorial(n):
    if n == 0:                      # base case: small enough to answer directly
        return 1
    return n * factorial(n - 1)     # recursive case: a smaller problem, plus one step

print(factorial(5))
print(factorial(20))`, caption: '120, then 2432902008176640000. The function never loops; it asks a smaller version of the same question, and multiplies.' },
        `<div class="stmt"><p><span class="kind">Rule (recursion).</span> A recursive function needs two things. A <em>base case</em>: an input it answers directly, with no recursive call. And <em>progress</em>: every recursive call is on an input closer to a base case, so that a base case is always reached.</p></div>
<p><code>factorial(n - 1)</code> is one step closer to 0 than <code>factorial(n)</code>, so starting from any whole number, the calls reach 0. Break either half of the rule and the calls never stop. Here the base case is fine, but the input starts on the wrong side of it.</p>`,
        { play: `def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)

print(factorial(-1))`, expectError: true, caption: 'RecursionError. From -1 the calls go -2, -3, -4, … moving away from 0, until Python runs out of room for waiting calls. A base case of n <= 0 would have stopped it.' },
        { skill: 'base-case', check: "What are the two things every recursive function needs?", options: ["A loop and a return", "A base case, and progress towards it on every call", "Two parameters"], answer: 1, why: "Without a base case, or without progress towards it, the calls never stop and Python runs out of room: RecursionError.", wrong: ["Thinks recursion is a kind of loop. The factorial above has no loop at all, and a return alone does not make the calls stop.", null, "Mixes up the shape of the function with its structure. factorial has one parameter and count_down one; what matters is where the calls stop."] },
        `<h2>What actually happens</h2>
<p>Lesson 8 showed that every call gets its own frame. A recursive call is no different: <code>factorial(3)</code> gets a frame, and inside it <code>factorial(2)</code> gets another, each with its own <code>n</code>. The frames stack up until the base case answers without calling again; then they finish one by one, most recent first. Step through it.</p>`,
        {
          fig: 'trace', code: `def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(3))`,
          steps: [
            { line: 6, frames: [{ name: 'global', vars: {} }], note: 'Start: call factorial(3).' },
            { line: 2, frames: [{ name: 'global', vars: {} }, { name: 'factorial', vars: { n: 3 } }], note: 'n is 3, not 0, so this is not the base case.' },
            { line: 4, frames: [{ name: 'global', vars: {} }, { name: 'factorial', vars: { n: 3 } }], note: 'To compute 3 * factorial(2), this frame must wait for factorial(2).' },
            { line: 2, frames: [{ name: 'global', vars: {} }, { name: 'factorial', vars: { n: 3 } }, { name: 'factorial', vars: { n: 2 } }], note: 'A second frame, with its own n = 2.' },
            { line: 4, frames: [{ name: 'global', vars: {} }, { name: 'factorial', vars: { n: 3 } }, { name: 'factorial', vars: { n: 2 } }], note: 'Waits for factorial(1).' },
            { line: 2, frames: [{ name: 'global', vars: {} }, { name: 'factorial', vars: { n: 3 } }, { name: 'factorial', vars: { n: 2 } }, { name: 'factorial', vars: { n: 1 } }] },
            { line: 4, frames: [{ name: 'global', vars: {} }, { name: 'factorial', vars: { n: 3 } }, { name: 'factorial', vars: { n: 2 } }, { name: 'factorial', vars: { n: 1 } }], note: 'Waits for factorial(0).' },
            { line: 2, frames: [{ name: 'global', vars: {} }, { name: 'factorial', vars: { n: 3 } }, { name: 'factorial', vars: { n: 2 } }, { name: 'factorial', vars: { n: 1 } }, { name: 'factorial', vars: { n: 0 } }], note: 'n == 0: the base case. Three frames are waiting on it.' },
            { line: 3, frames: [{ name: 'global', vars: {} }, { name: 'factorial', vars: { n: 3 } }, { name: 'factorial', vars: { n: 2 } }, { name: 'factorial', vars: { n: 1 } }, { name: 'factorial', vars: { n: 0 } }], note: 'return 1. This frame is discarded.' },
            { line: 4, frames: [{ name: 'global', vars: {} }, { name: 'factorial', vars: { n: 3 } }, { name: 'factorial', vars: { n: 2 } }, { name: 'factorial', vars: { n: 1 } }], note: 'factorial(1) can finish: 1 * 1 = 1.' },
            { line: 4, frames: [{ name: 'global', vars: {} }, { name: 'factorial', vars: { n: 3 } }, { name: 'factorial', vars: { n: 2 } }], note: 'factorial(2) finishes: 2 * 1 = 2.' },
            { line: 4, frames: [{ name: 'global', vars: {} }, { name: 'factorial', vars: { n: 3 } }], note: 'factorial(3) finishes: 3 * 2 = 6.' },
            { line: 6, frames: [{ name: 'global', vars: {} }], out: '6', note: 'Back at the top level with the answer.' }
          ],
          caption: 'Each recursive call is a new frame with its own n. The base case is the only call that answers without asking another.'
        },
        `<h2>Why you can trust it</h2>
<p>Following every frame works for <code>factorial(3)</code>, but nobody can follow <code>factorial(500)</code>. Programmers instead use a shortcut called <em>trusting the recursive call</em>, and it is not wishful thinking; it is a proof method called induction. Check two things. First, the base case is right: <code>factorial(0)</code> returns 1, which is 0!. Second, <em>if</em> <code>factorial(n - 1)</code> returns the right answer, then <code>factorial(n)</code> does too: it returns <i>n</i> × (<i>n</i> − 1)!, which is <i>n</i>!. Those two checks together cover every whole number: 0 is right, so 1 is right, so 2 is right, and so on for ever, like a line of dominoes where the first one falls and each one knocks over the next.</p>
<p>That is also how to <em>write</em> a recursive function. Ask: what is the smallest input, and what is its answer? Then: if I already had the answer for a slightly smaller input, how would I get the answer for this one?</p>
<h2>Recursion on lists and strings</h2>
<p>The same questions work on sequences. A list is either empty, the smallest possible list, or a first item followed by a smaller list, <code>xs[1:]</code>. So the sum of a list is 0 if it is empty, and otherwise the first item plus the sum of the rest.</p>`,
        { predict: true, play: `def sum_list(xs):
    if len(xs) == 0:                  # the smallest list; its sum is 0
        return 0
    return xs[0] + sum_list(xs[1:])   # first item, plus the sum of the rest

print(sum_list([3, 1, 4, 1, 5]))

def count_down(n):
    if n == 0:
        print("Liftoff!")
        return
    print(n)
    count_down(n - 1)

count_down(5)`, caption: 'sum_list gives 14: 3 + 1 + 4 + 1 + 5. count_down prints 5, 4, 3, 2, 1 and then Liftoff!, each number printed before the next call. Try moving print(n) below the recursive call: the numbers come out in the opposite order, because each print now happens while the frames finish.' },
        { skill: 'base-case', check: "<code>def sum_list(xs): return xs[0] + sum_list(xs[1:])</code>, with base case <code>if xs == []: return 0</code>. Why 0 and not <code>xs[0]</code>?", options: ["Because the empty list has no xs[0], and 0 is the sum of nothing", "Because recursion always ends with 0", "It makes no difference"], answer: 0, why: "The base case must answer the smallest input correctly: the sum of an empty list is 0, and the empty list has no first item to return.", wrong: [null, "Believes every base case returns 0. The base case answers whatever the smallest input needs: factorial's returns 1, because 0! is 1.", "Thinks any value will do. Every answer includes the base case's value, so a wrong one is added into every sum, and xs[0] on an empty list is an IndexError."] },
        `<details class="reveal"><summary>Predict: why must the base case of <code>sum_list</code> return 0, and not, say, the first item?</summary><p>Every sum eventually adds the sum of the empty list, so that value is added to every answer. Only 0 leaves the answers unchanged. And the empty list has no first item at all: <code>xs[0]</code> would be an <code>IndexError</code>.</p></details>
<h2>The Tower of Hanoi</h2>
<p>Back to the priests. To move a tower of <i>n</i> discs from peg A to peg C, using B as the spare: first move the top <i>n</i> − 1 discs from A to B (using C as the spare), then move the biggest disc from A to C, then move the <i>n</i> − 1 discs from B onto it on C (using A). The two smaller moves are the same puzzle with one disc fewer, so the function calls itself twice. The base case: moving zero discs takes no moves at all.</p>
<details class="reveal"><summary>Guess first: for three discs, which disc moves first, and how many moves will the program print?</summary><p>The smallest disc, disc 1, moves first, because the biggest cannot move until the two above it are out of the way. And the program prints 7 moves. Check it against the output below.</p></details>`,
        { play: `def hanoi(n, source, target, spare):
    if n == 0:
        return 0                                    # no discs: no moves
    moves = hanoi(n - 1, source, spare, target)     # clear the way
    print("move disc", n, "from", source, "to", target)
    moves += 1
    moves += hanoi(n - 1, spare, target, source)    # rebuild on top
    return moves

print(hanoi(3, "A", "C", "B"), "moves")`, caption: 'Seven moves for three discs, and the function never needs to plan more than one step ahead. Try 4 and 5 discs and count the moves.' },
        `<details class="reveal"><summary>How many moves for <i>n</i> discs? And how long for the 64 golden discs?</summary><p>For 1, 2, 3, 4 discs: 1, 3, 7, 15 moves, one less than a power of 2. The recursion explains it: moves(<i>n</i>) = 2 × moves(<i>n</i> − 1) + 1, which gives 2<sup><i>n</i></sup> − 1. For 64 discs that is 18,446,744,073,709,551,615 moves. At one move per second, day and night, the priests need about 585 billion years, some forty times the present age of the universe. We are safe.</p></details>
<h2>When recursion branches</h2>
<p>The Fibonacci numbers are 0, 1, 1, 2, 3, 5, 8, 13, …, each the sum of the two before it. Written recursively, <code>fib(n)</code> calls <code>fib(n - 1)</code> <em>and</em> <code>fib(n - 2)</code>, so the calls form a tree, like the Tower of Hanoi's.</p>`,
        { fig: 'fibtree', n: 5, lang: 'python', caption: 'The tree of calls for fib(5). Filled circles are base cases. The same small values are computed again and again, which is why this version gets slow quickly.' },
        { predict: true, play: `def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

for i in range(10):
    print(fib(i), end=" ")
print()
print(fib(25))`, caption: 'The first line is 0 1 1 2 3 5 8 13 21 34: each number is the sum of the two before it. Then 75025, which is fib(25). Getting there takes over 240,000 calls, because the tree recomputes the same values. fib(30) would take over two and a half million.' },
        { skill: 'recursion-cost', check: "Why is the plain recursive <code>fib</code> so slow?", options: ["Recursion is always slower than loops", "The same small values are computed again and again, because the calls branch", "Python limits recursion to 1000 calls"], answer: 1, why: "Each call makes two more, and both branches recompute the same sub-problems. Storing each answer in a dictionary (memoisation) removes the repeats.", wrong: ["Believes recursion itself is the slow part. The memoised version below is also recursive and is instant; the cost here is the repeated work.", null, "Mistakes the depth limit for the cost. Python does cap how deep calls can nest, but fib(25) is never more than 25 deep: the slowness is the number of calls, about 240,000."] },
        `<p>The cure uses Lesson 11. Keep a dictionary of answers already worked out, and before computing <code>fib(n)</code>, look it up. Each value is then computed only once. This trick is called <em>memoisation</em>, from "memo", a note to yourself.</p>`,
        { play: `memo = {}

def fib(n):
    if n < 2:
        return n
    if n in memo:                     # worked out before? just look it up
        return memo[n]
    memo[n] = fib(n - 1) + fib(n - 2)
    return memo[n]

print(fib(30))
print(fib(50))`, caption: 'Prints 832040 and 12586269025, both instantly. The tree version would need over 40 billion calls for fib(50); with the dictionary, starting empty, it takes 49 additions. (The function changes memo\u2019s contents, not the name memo itself, so Lesson 8\u2019s UnboundLocalError does not arise.)' },
        `<h2>Before the exercises</h2>
<p>Both exercises are recursion with one smaller call, like <code>factorial</code> and <code>sum_list</code>. For each, answer the two questions first: what is the smallest input and its answer, and how do you get the answer for this input from the answer for a slightly smaller one? Here are two worked examples, one on numbers and one on strings.</p>`,
        { predict: true, play: `def sum_digits(n):
    if n < 10:                        # one digit: it is its own sum
        return n
    return n % 10 + sum_digits(n // 10)   # last digit, plus the sum of the rest

def count_char(s, c):
    if len(s) == 0:                   # the empty string contains nothing
        return 0
    rest = count_char(s[1:], c)       # trust the recursive call
    if s[0] == c:
        return rest + 1
    return rest

print(sum_digits(1974))
print(count_char("banana", "a"))`, caption: 'Prints 21 (1 + 9 + 7 + 4) and 3 (banana has three a\u2019s). Both shrink the input on every call: n // 10 drops the last digit, and s[1:] drops the first character, so each reaches its base case.' },
        { aside: `<p><b>Common mistakes in this lesson.</b> No base case, or one the calls can skip past. A recursive call on the <em>same</em> input instead of a smaller one. Forgetting to <code>return</code> the result of the recursive call, so the answer is thrown away and the function returns <code>None</code>. The wrong answer for the base case, such as 1 for an empty sum. Trying to follow every frame in your head instead of checking the base case and trusting the recursive call.</p>` },
        {
          ex: {
            id: 'py-11-3', skill: 'base-case', kind: 'trace', title: 'Trace the calls',
            prompt: `<p>Before writing recursion, read some. Each row is a moment just after line 5 has run, in one of the calls of <code>sum_to</code>. The rows come in the order the calls reach line 5, and the first row is done for you. Remember which call finishes first.</p>`,
            code: `def sum_to(n):\n    if n == 0:\n        return 0\n    rest = sum_to(n - 1)\n    answer = n + rest\n    return answer\n\nprint(sum_to(4))`,
            vars: ['n', 'rest', 'answer'],
            steps: [
              { line: 5, values: { n: '1', rest: '0', answer: '1' }, show: true },
              { line: 5, values: { n: '2', rest: '1', answer: '3' }, why: { n: { '4': 'sum_to(4) cannot reach line 5 until sum_to(3) has answered, so it comes last, not second.', '3': 'After sum_to(1) finishes, the call waiting for it is sum_to(2), the next one up.' } } },
              { line: 5, values: { n: '3', rest: '3', answer: '6' }, why: { rest: { '2': 'rest is the answer of the smaller call, sum_to(2), which was 3 (the answer in the row above), not 2.' } } },
              { line: 5, values: { n: '4', rest: '6', answer: '10' } }
            ],
            hints: ['The innermost call, sum_to(1), reaches line 5 first, then sum_to(2), and so on outwards. Each rest is the answer the previous row ended with.', 'n goes 1, 2, 3, 4 and answer goes 1, 3, 6, 10: each answer is n plus the answer in the row above, and that row\u2019s answer is this row\u2019s rest.'],
            solution: '<p>n: 1, 2, 3, 4. rest: 0, 1, 3, 6. answer: 1, 3, 6, 10. The program prints <code>10</code>. The call with the biggest n starts first and finishes last.</p>',
            followup: 'Change the last line to print(sum_to(5)) and write the table before running it: how many rows will it have, and what is the last answer? Then explain why sum_to(n) always needs n rows.'
          }
        },
        {
          ex: {
            id: 'py-11-1', skill: 'base-case', title: 'Recursive power',
            prompt: `<p>Write <code>power(base, n)</code> that computes <i>base</i><sup><i>n</i></sup> for a whole number <code>n</code> ≥ 0, using recursion and no <code>**</code> or loops: <i>base</i><sup>0</sup> is 1, and <i>base</i><sup><i>n</i></sup> is <i>base</i> × <i>base</i><sup><i>n</i>−1</sup>.</p>`,
            starter: `def power(base, n):\n    ...\n\nprint(power(2, 10))`,
            solution: `def power(base, n):\n    if n == 0:\n        return 1\n    return base * power(base, n - 1)\n\nprint(power(2, 10))`,
            hints: ['Base case first: if n == 0, return 1, since multiplying no numbers together gives 1.', 'Otherwise return base * power(base, n - 1). Only n gets smaller; base stays the same.'],
            tests: [{ call: 'power(2, 10)', expect: '1024' }, { call: 'power(5, 0)', expect: '1' }, { call: 'power(3, 4)', expect: '81' }, { call: 'power(1.5, 2)', expect: '2.25' }, { call: 'power(-2, 3)', expect: '-8' }],
            mustNotContain: [{ re: /\*\*|\bfor\b|\bwhile\b|\bpow\s*\(/, msg: 'Recursion only: no **, pow(), or loops.' }],
            failTip: 'If every answer is 0, the base case returns 0: the power of anything to 0 is 1.',
            followup: 'This makes n multiplications. Since base²ᵏ = (baseᵏ)², halving n when it is even needs only about log₂ n of them, the trick behind fast encryption.'
          }
        },
        {
          ex: {
            id: 'py-11-2', skill: 'base-case', title: 'Reverse a string, recursively',
            prompt: `<p>Write <code>reverse(s)</code> that returns the string backwards, using recursion only: no loops, no <code>[::-1]</code>, no <code>reversed</code>. Like <code>count_char</code>, think of a string as a first character followed by a shorter string. The reverse of the whole is the reverse of the rest, with the first character stuck on the end.</p>`,
            starter: `def reverse(s):\n    ...\n\nprint(reverse("stressed"))`,
            solution: `def reverse(s):\n    if len(s) == 0:\n        return ""\n    return reverse(s[1:]) + s[0]\n\nprint(reverse("stressed"))`,
            hints: ['Base case: the empty string reverses to the empty string.', 'Recursive case: the answer is built from reverse(s[1:]) and the first character s[0]. Trust that reverse(s[1:]) is right.', 'Return reverse(s[1:]) + s[0]: the reversed rest, then the first character stuck on the end.'],
            tests: [{ call: 'reverse("stressed")', expect: "'desserts'" }, { call: 'reverse("")', expect: "''" }, { call: 'reverse("a")', expect: "'a'" }, { call: 'reverse("abc")', expect: "'cba'" }, { call: 'reverse("Ojibwe")', expect: "'ewbijO'" }],
            mustNotContain: [{ re: /\bfor\b|\bwhile\b|\[\s*:\s*:\s*-1\s*\]|\breversed\s*\(/, msg: 'Recursion only: no loops, no [::-1], no reversed().' }],
            failTip: 'If the answer is the original string, the first character is being added at the front: it belongs at the end, after the reversed rest.',
            followup: 'Use your reverse to write is_palindrome(s), which says whether a word reads the same backwards, such as "level". Then try it on a whole sentence: what has to be done to the spaces and capitals first?'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A recursive function calls itself on a smaller input. It needs a base case, and every call must move towards it.</li>
<li>Each call gets its own frame; they stack up, then finish most recent first.</li>
<li>Trust the recursive call: check the base case, and check that the answer is right when the smaller call is. That covers every input, like falling dominoes.</li>
<li>Lists and strings recurse naturally: the first item, plus the rest. The Tower of Hanoi needs 2<sup><i>n</i></sup> − 1 moves.</li>
<li>Branching recursion can repeat work; a dictionary of answers (memoisation) removes the repeats.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-10', '3B-AP-11'],
      standard: 1, title: 'Searching and sorting', summary: 'Your first real algorithms and the question that separates programs that finish from programs that never do: how does the work grow? Linear and binary search, bubble sort, and merge sort, with exact step counts.',
      blocks: [
        `<p>Think of a number from 1 to a million, and I will find it with twenty yes-or-no questions. Every time. The trick is to ask "is it bigger than 500,000?", and whatever you answer, half of the possibilities are gone; after twenty questions, a million possibilities are down to one. That strategy is <em>binary search</em>, and it is one of the algorithms in this lesson.</p>
<p>An <em>algorithm</em> is a precise recipe for solving a problem, one that does not depend on any particular programming language. This lesson works through four classics, two for searching and two for sorting. They are short, but they bring in the question that decides whether a program finishes in a second or not in your lifetime: <em>how does the amount of work grow as the input grows?</em></p>
<h2>Linear search</h2>
<p>To find a value in a list, look at each item in turn. It is simple and always correct; if the value is not there, you have looked at everything. For a list of <i>n</i> items it takes up to <i>n</i> comparisons.</p>`,
        { predict: true, play: `def linear_search(xs, target):
    for i in range(len(xs)):
        if xs[i] == target:
            return i          # found: report the position
    return -1                 # looked everywhere: not there

data = [2, 5, 8, 12, 16, 23, 38, 42, 56, 61, 72, 79, 85, 91, 97, 104]
print(linear_search(data, 61))
print(linear_search(data, 7))`, caption: 'Prints 9, the position of 61, then -1. Returning -1 for "not found" is a tradition: a position is never negative, so -1 cannot be mistaken for an answer.' },
        `<h2>Binary search</h2>
<p>If the list is <em>sorted</em>, you can do enormously better, and you already know how: it is how you look up a word in a paper dictionary, and how the smart player wins the guessing game at the top of this lesson.</p>
<div class="stmt"><p><span class="kind">Binary search.</span> Keep two positions, <code>lo</code> and <code>hi</code>, marking the part of the sorted list still in play; at first, the whole list. Look at the middle item. If it is the target, you are done. If it is smaller than the target, the target can only be to its right, so move <code>lo</code> past it; if it is bigger, move <code>hi</code> before it. When <code>lo</code> passes <code>hi</code>, nothing is left in play, and the target is not in the list.</p></div>
<p>Why is that right? Because at every moment this stays true: <em>if the target is in the list at all, it is between</em> <code>lo</code> <em>and</em> <code>hi</code>. It is true at the start, and each step keeps it true, since the list is sorted: if the middle item is too small, so is everything to its left. A fact that stays true every time round a loop is called an <em>invariant</em>, and it is how programmers convince themselves that a loop is right.</p>`,
        { fig: 'search', caption: 'Enter any target and step through. Sixteen items need at most 5 comparisons; a million items need at most 20. Try 7 to see the "not found" case.' },
        { predict: true, play: `def binary_search(xs, target):
    lo = 0
    hi = len(xs) - 1
    while lo <= hi:                 # something is still in play
        mid = (lo + hi) // 2
        if xs[mid] == target:
            return mid
        elif xs[mid] < target:
            lo = mid + 1            # target can only be to the right
        else:
            hi = mid - 1            # target can only be to the left
    return -1

data = [2, 5, 8, 12, 16, 23, 38, 42, 56, 61, 72, 79, 85, 91, 97, 104]
print(binary_search(data, 61))
print(binary_search(data, 7))`, caption: 'Prints 9 and -1, the same answers as linear search, but with far fewer comparisons: for 61 the middle items looked at are 42, 79, 61 (3 comparisons, not 10). The // matters: (lo + hi) / 2 would give a decimal, and a list position must be a whole number.' },
        { skill: 'binary-search', check: "Binary search is run on a list that is not sorted. What happens?", options: ["It still finds the item, more slowly", "It can give a wrong answer with no error", "Python raises an error"], answer: 1, why: "Binary search relies on the invariant that the target, if present, lies between lo and hi. On unsorted data that is simply false, and nothing checks it.", wrong: ["Thinks binary search falls back to a slower search. It never looks at the half it threw away, so it can miss an item that is there.", null, "Thinks Python checks that the list is sorted. It does not, and the loop has nothing that could notice, so the wrong answer comes back quietly."] },
        `<h2>Why halving is a big deal</h2>
<p>Each comparison at least halves the part still in play. The number of times you can halve <i>n</i> before reaching 1 is about log<sub>2</sub> <i>n</i>, the power you must raise 2 to in order to get <i>n</i>, so binary search needs at most about log<sub>2</sub> <i>n</i> + 1 comparisons. For a phone book of a million names that is 20 comparisons, against up to a million for linear search.</p>
<details class="reveal"><summary>Predict: how many comparisons does binary search need, at most, for a billion items? And for two billion?</summary><p>About 30, since 2<sup>30</sup> is just over a billion. For two billion, 31: doubling the input adds a <em>single</em> comparison. Linear search on two billion items could take two billion.</p></details>
<p>Computer scientists name the shape of this growth with a notation called <em>big-O</em>: linear search is O(<i>n</i>), meaning its work grows in proportion to <i>n</i>, and binary search is O(log <i>n</i>). Constant factors are ignored, and only the shape matters, because for large inputs the shape wins every time.</p>
<h2>Bubble sort</h2>
<p>Binary search needs sorted data, so sorting is worth understanding. <em>Bubble sort</em> is the easiest to watch. Sweep through the list comparing neighbours, and swap any pair that is out of order. After one sweep the largest value has "bubbled" to the end, where it belongs. Repeat on the rest.</p>
<details class="reveal"><summary>Guess first: after one sweep of [7, 3, 9, 1, 6, 8, 2, 5, 4], where is the 9, and what does the list look like?</summary><p>The 9 is at the end: it is carried along every time it meets a smaller neighbour, so one sweep gives [3, 7, 1, 6, 8, 2, 5, 4, 9]. Only the 9 is certain to be in its final place; the rest are only slightly more in order. That is why bubble sort needs many sweeps.</p></details>`,
        { fig: 'sort', algo: 'bubble', caption: 'Compared neighbours are highlighted; green means a swap just happened; grey bars have reached their final places. Shuffle and play again.' },
        { play: `def bubble_sort(xs):
    n = len(xs)
    for i in range(n - 1):
        for j in range(n - 1 - i):             # the last i items are already in place
            if xs[j] > xs[j + 1]:
                xs[j], xs[j + 1] = xs[j + 1], xs[j]   # swap the two
    return xs

print(bubble_sort([7, 3, 9, 1, 6, 8, 2, 5, 4]))`, caption: 'The swap line exchanges two values at once, a Python speciality: both right-hand values are worked out before either is stored.' },
        { skill: 'binary-search', check: "About how many comparisons does binary search need for a million sorted items, at most?", options: ["About 20", "About 1,000", "About 500,000"], answer: 0, why: "Each comparison halves the part still in play, and a million halves to 1 in about 20 steps: 2²⁰ is just over a million.", wrong: [null, "Forgets that the work halves each time. 1,000 is about the square root of a million, but every comparison throws away half of what is left, so far fewer are needed.", "Thinks of the average cost of linear search, half the list. Binary search never walks along the list: it jumps to the middle."] },
        `<p>Count the work exactly. The first sweep makes <i>n</i> − 1 comparisons, the next <i>n</i> − 2, and so on down to 1, which adds up to <i>n</i>(<i>n</i> − 1)/2. That is O(<i>n</i>²). For 10 items it is 45 comparisons, nothing at all. For a million items it is about 500 billion, which even a fast computer needs many minutes for, and Python much longer. Doubling the input quadruples the work.</p>
<h2>Merge sort: divide and conquer</h2>
<p>A far better idea uses Lesson 13's recursion. To sort a list, split it in half, sort each half (by calling yourself), and then <em>merge</em> the two sorted halves into one, by repeatedly taking the smaller of the two front items. A list of one item is already sorted: that is the base case.</p>
<details class="reveal"><summary>Guess first: the program below merge-sorts 1,000 random numbers. Will it print True or False for "sorted correctly"? Will the comparison count be nearer 1,000, 10,000 or 500,000?</summary><p>True: merge sort is correct for every input. The count is nearer 10,000, about 8,700: roughly <i>n</i> × log<sub>2</sub> <i>n</i> = 1,000 × 10. It differs a little with each random list, so your number will not be exactly the same. The last line is the 499,500 that bubble sort would need.</p></details>`,
        { play: `import random
def merge(a, b, counter):
    result = []
    i, j = 0, 0
    while i < len(a) and j < len(b):
        counter[0] += 1                  # one comparison
        if a[i] <= b[j]:
            result.append(a[i])
            i += 1
        else:
            result.append(b[j])
            j += 1
    return result + a[i:] + b[j:]        # whatever is left is already in order

def merge_sort(xs, counter):
    if len(xs) <= 1:
        return xs                        # base case: already sorted
    mid = len(xs) // 2
    return merge(merge_sort(xs[:mid], counter), merge_sort(xs[mid:], counter), counter)
counter = [0]
xs = []
for i in range(1000):
    xs.append(random.randint(1, 10000))
ys = merge_sort(xs, counter)
print("sorted correctly:", ys == sorted(xs))
print("merge sort comparisons:", counter[0])
print("bubble sort would make:", 1000 * 999 // 2)`, long: true, caption: 'About 8,700 comparisons against 499,500 (the exact count depends on the random list). The counter is a one-item list so that every call can add to the same count: changing counter[0] changes the one list they all share, as in Lesson 6.' },
        { skill: 'sorting', check: "Bubble sort on 1,000 items takes about 1 second. Roughly how long on 10,000 items?", options: ["About 10 seconds", "About 100 seconds", "About 1,000 seconds"], answer: 1, why: "Bubble sort is O(n²): ten times the items means a hundred times the comparisons. Merge sort, at n log n, would take about 13 times as long.", wrong: ["Assumes work grows in step with the number of items. Bubble sort compares pairs, about n × n / 2 of them, so ten times the items is a hundred times the work.", null, "Cubes the growth. The comparisons grow with the square of n, so ten times the items gives 10 × 10 = 100 times the work, not 1,000."] },
        `<details class="reveal"><summary>Why does merge sort need only about <i>n</i> log<sub>2</sub> <i>n</i> comparisons?</summary><p>Picture the splitting as layers. The top layer is the whole list; the next has two halves; the next, four quarters; and so on down to single items, which takes about log<sub>2</sub> <i>n</i> layers, the number of halvings. At each layer, merging all the pieces makes at most one comparison per item, so at most <i>n</i> per layer. That is about <i>n</i> × log<sub>2</sub> <i>n</i> in all: for a million items, about 20 million comparisons instead of 500 billion.</p></details>
<p>Python's built-in <code>sorted()</code> uses <em>Timsort</em>, written by Tim Peters for Python in 2002, which is a refined merge sort that also takes advantage of any stretches of the list that are already in order. The lesson is not "never write bubble sort"; it is that the <em>choice of algorithm</em> can matter far more than the speed of the computer. A fast machine running an O(<i>n</i>²) sort loses to a slow machine running an O(<i>n</i> log <i>n</i>) one, once the list is big enough.</p>
<h2>Before the exercises</h2>
<p>The first exercise adds a counter to binary search, so that you can see the logarithm for yourself. The second is <em>selection sort</em>: for each position, find the smallest item among those not yet placed, and swap it into that position. Its invariant: after the pass for position <i>i</i>, the first <i>i</i> + 1 items are the smallest ones, in order. Here is a worked example of its inner step, finding the position of the smallest item from a given position onwards, and a checker for any sort.</p>`,
        { predict: true, play: `def position_of_smallest(xs, start):
    best = start                       # best position seen so far
    for j in range(start + 1, len(xs)):
        if xs[j] < xs[best]:
            best = j
    return best

def is_sorted(xs):
    for i in range(len(xs) - 1):
        if xs[i] > xs[i + 1]:          # a neighbouring pair out of order
            return False
    return True

print(position_of_smallest([7, 3, 9, 1, 6], 0))
print(position_of_smallest([7, 3, 9, 1, 6], 4))
print(is_sorted([1, 3, 3, 8]), is_sorted([3, 1, 2]))`, caption: 'Prints 3 (the 1 is at position 3), then 4 (from position 4 on there is only the 6, so it is the smallest), then True False (the first list has no neighbours out of order, the second has 3 before 1). This is the "best so far" pattern of Lesson 4, remembering a position instead of a value.' },
        { aside: `<p><b>Common mistakes in this lesson.</b> Running binary search on an unsorted list: it gives wrong answers with no error. <code>mid = (lo + hi) / 2</code>, which gives a decimal; use <code>//</code>. Starting <code>hi</code> at <code>len(xs)</code> instead of <code>len(xs) - 1</code>. Moving <code>lo</code> to <code>mid</code> instead of <code>mid + 1</code>, so the range stops shrinking and the loop never ends. Swapping with two separate assignments, <code>xs[i] = xs[j]</code> then <code>xs[j] = xs[i]</code>, which loses a value; use the one-line swap. Judging an algorithm by timing it on ten items.</p>` },
        {
          ex: {
            id: 'py-17-2', skill: 'binary-search', kind: 'trace', title: 'Trace the halving',
            prompt: `<p>Before counting comparisons, watch the search narrow. This loop is the heart of binary search: it keeps <code>lo</code> and <code>hi</code> around the part of a sorted list that is still in play, and finds where 25 would belong. Fill in the table: each row is a moment just after line 4 has run, and the cells are the values of the names then. The first row is done for you. Line 4 runs once on every pass of the loop, and the last row is the moment after the print on line 9.</p>`,
            code: `xs = [3, 8, 14, 21, 30, 41, 55]\nlo, hi = 0, 6\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    if xs[mid] < 25:\n        lo = mid + 1\n    else:\n        hi = mid - 1\nprint(lo)`,
            vars: ['lo', 'hi', 'mid'],
            steps: [
              { line: 4, values: { lo: '0', hi: '6', mid: '3' }, show: true },
              { line: 4, values: { lo: '4', hi: '6', mid: '5' }, why: { lo: { '3': 'xs[3] is 21, which is less than 25, so line 6 moves lo past mid: lo = mid + 1 = 4, not mid itself.' } } },
              { line: 4, values: { lo: '4', hi: '4', mid: '4' }, why: { hi: { '5': 'xs[5] is 41, which is not less than 25, so line 8 moves hi to just before mid: hi = mid - 1 = 4.' } } },
              { line: 9, values: { lo: '4', hi: '3', mid: '4' }, why: { hi: { '4': 'The last pass looked at xs[4], which is 30. That is not less than 25 either, so hi became mid - 1 = 3, lo is now more than hi, and the loop is over.' } } }
            ],
            hints: ['Work pass by pass. At the start of a pass, mid is (lo + hi) // 2; then xs[mid] is compared with 25 and either lo or hi moves.', 'Pass 1: mid is 3 and xs[3] = 21 is less than 25, so lo becomes 4. Pass 2: lo = 4, hi = 6, so mid is 5, and 41 is not less than 25, so hi becomes 4.'],
            solution: '<p>lo: 0, 4, 4, 4. hi: 6, 6, 4, 3. mid: 3, 5, 4, 4. The loop stops because lo (4) is now greater than hi (3), and the program prints <code>4</code>: 25 would go at position 4, after the four smaller numbers. Each pass threw away at least half of what was left.</p>',
            followup: 'Change 25 to 41 on line 5 and trace it again before running it. How many passes now? Why does the search never need to look at more than three of the seven numbers?'
          }
        },
        {
          ex: {
            id: 'py-12-1', skill: 'binary-search', title: 'Count the comparisons',
            prompt: `<p>Write <code>binary_search_steps(xs, target)</code> that performs a binary search on the sorted list <code>xs</code> and returns <em>how many comparisons with</em> <code>xs[mid]</code> it made before finding the target or giving up. Count one per pass of the loop. For the sixteen-item list above and target 61, the answer is 3.</p>`,
            starter: `def binary_search_steps(xs, target):\n    lo = 0\n    hi = len(xs) - 1\n    steps = 0\n    while lo <= hi:\n        ...\n    return steps\n\ndata = [2, 5, 8, 12, 16, 23, 38, 42, 56, 61, 72, 79, 85, 91, 97, 104]\nprint(binary_search_steps(data, 61))`,
            solution: `def binary_search_steps(xs, target):\n    lo = 0\n    hi = len(xs) - 1\n    steps = 0\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        steps += 1\n        if xs[mid] == target:\n            return steps\n        elif xs[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return steps\n\ndata = [2, 5, 8, 12, 16, 23, 38, 42, 56, 61, 72, 79, 85, 91, 97, 104]\nprint(binary_search_steps(data, 61))`,
            hints: ['Copy the body of binary_search and add steps += 1 at the start of each pass.', 'Return steps both when the target is found and after the loop ends.', 'Inside the while loop: mid = (lo + hi) // 2, then steps += 1, then if xs[mid] == target: return steps; otherwise move lo or hi as before.'],
            tests: [{ call: 'binary_search_steps([2, 5, 8, 12, 16, 23, 38, 42, 56, 61, 72, 79, 85, 91, 97, 104], 61)', expect: '3' }, { call: 'binary_search_steps([2, 5, 8, 12, 16, 23, 38, 42, 56, 61, 72, 79, 85, 91, 97, 104], 42)', expect: '1' }, { call: 'binary_search_steps([2, 5, 8, 12, 16, 23, 38, 42, 56, 61, 72, 79, 85, 91, 97, 104], 7)', expect: '4' }, { call: 'binary_search_steps(list(range(1000000)), 3)', expect: '20' }, { call: 'binary_search_steps([5], 5)', expect: '1' }],
            failTip: 'If the million-item test gives a much bigger number, check that lo and hi move past mid (mid + 1 and mid - 1), so each pass throws away at least half.',
            followup: 'Twenty comparisons to search a million items, as the guessing game promised: log₂ of a million is just under 20.'
          }
        },
        {
          ex: {
            id: 'py-12-2', skill: 'sorting', title: 'Selection sort',
            prompt: `<p>Implement <code>selection_sort(xs)</code>: for each position <code>i</code> from 0 to the end, find the position of the smallest item in <code>xs[i:]</code>, as <code>position_of_smallest</code> did, and swap it into position <code>i</code>. Return the list. Do not use <code>sorted</code> or <code>.sort()</code>.</p>`,
            starter: `def selection_sort(xs):\n    n = len(xs)\n    for i in range(n):\n        smallest = i\n        for j in range(i + 1, n):\n            ...\n        # swap xs[i] and xs[smallest]\n    return xs\n\nprint(selection_sort([7, 3, 9, 1, 6]))`,
            solution: `def selection_sort(xs):\n    n = len(xs)\n    for i in range(n):\n        smallest = i\n        for j in range(i + 1, n):\n            if xs[j] < xs[smallest]:\n                smallest = j\n        xs[i], xs[smallest] = xs[smallest], xs[i]\n    return xs\n\nprint(selection_sort([7, 3, 9, 1, 6]))`,
            hints: ['Inside the inner loop: if xs[j] < xs[smallest], remember j as the new smallest.', 'After the inner loop, swap with the one-line swap: xs[i], xs[smallest] = xs[smallest], xs[i].', 'The whole inner loop body is: if xs[j] < xs[smallest]: smallest = j. The swap line goes after the inner loop, inside the outer one.'],
            tests: [{ call: 'selection_sort([7, 3, 9, 1, 6])', expect: '[1, 3, 6, 7, 9]' }, { call: 'selection_sort([])', expect: '[]' }, { call: 'selection_sort([2, 2, 1])', expect: '[1, 2, 2]' }, { call: 'selection_sort([5, 4, 3, 2, 1, 0])', expect: '[0, 1, 2, 3, 4, 5]' }, { call: 'selection_sort([-3, 10, -3, 0])', expect: '[-3, -3, 0, 10]' }],
            mustNotContain: [{ re: /\bsorted\s*\(|\.sort\s*\(/, msg: 'Implement the sort yourself: no sorted() or .sort().' }],
            failTip: 'If values are lost or duplicated, the swap was split into two assignments. Use the one-line swap.',
            followup: 'Selection sort, like bubble sort, makes n(n − 1)/2 comparisons whatever the input: it is O(n²). It does make at most n swaps, which matters when moving an item is expensive.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>Linear search checks every item: O(<i>n</i>). Binary search halves a sorted list each time: O(log <i>n</i>), about 20 comparisons for a million items.</li>
<li>Binary search is right because of its invariant: if the target is present, it is between <code>lo</code> and <code>hi</code>.</li>
<li>Bubble sort and selection sort make <i>n</i>(<i>n</i> − 1)/2 comparisons: O(<i>n</i>²).</li>
<li>Merge sort splits, sorts each half recursively and merges: about <i>n</i> log<sub>2</sub> <i>n</i> comparisons. Python's <code>sorted</code> is a refined merge sort.</li>
<li>The choice of algorithm matters more than the speed of the computer.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3A-AP-14', '3B-AP-10', '3B-AP-11', '3A-DA-12'], standard: 1,
      title: 'Checkpoint: dictionaries to searching', checkpoint: true, summary: 'No new ideas: mixed questions on dictionaries, random numbers, recursion and the first algorithms, then a choice of the right structure and a program that counts and sorts. How much work is too much?',
      blocks: [
        '<p>This lesson teaches nothing new. It mixes questions from the four lessons before it, because the ideas that look alike are the ones that cause trouble: a key and a value, a base case and a recursive case, a sorted list and an unsorted one. Answer each one before looking back. If one surprises you, it will come back on the Review page after a day.</p><p>Ready? Here is the question underneath all of them: for a job that is too big to do by hand, how do you choose the way of doing it so that the computer does not have to do far more work than it needs?</p><h2>Mixed questions</h2>',
        { skill: 'dict-basics', check: 'With <code>ages = {"Ada": 36, "Alan": 41}</code>, what does <code>ages[36]</code> give?', options: ['<code>"Ada"</code>', 'A <code>KeyError</code>', '<code>36</code>'], answer: 1, wrong: ['A dictionary looks up by key, never by value. Python does not search the values for 36 and hand back the key that goes with it.', null, 'The number 36 is a value, not a key, so there is no entry to find. The lookup <code>ages["Ada"]</code> would give 36.'], why: 'Lookups go from key to value only. 36 is a value, so <code>ages[36]</code> raises a KeyError; <code>ages["Ada"]</code> gives 36.' },
        { skill: 'dict-basics', check: 'With <code>ages = {"Ada": 36, "Alan": 41}</code>, what does the loop <code>for k in ages:</code> give <code>k</code>, one after the other?', options: ['The values, 36 and 41', 'The keys, <code>"Ada"</code> and <code>"Alan"</code>', 'The pairs, such as <code>("Ada", 36)</code>'], answer: 1, wrong: ['This is the loop over <code>ages.values()</code>. A plain loop over a dictionary visits the keys.', null, 'Pairs come from <code>ages.items()</code>. Looping over the dictionary itself gives only the keys.'], why: 'A loop over a dictionary visits its keys. Use <code>.values()</code> for the values and <code>.items()</code> for the pairs.' },
        { skill: 'dict-get', check: 'Which line adds 1 to the count of a word, and also works the very first time the word is seen?', options: ['<code>counts[w] = counts[w] + 1</code>', '<code>counts[w] = counts.get(w, 0) + 1</code>', '<code>counts[w] += 1</code>'], answer: 1, wrong: ['The first time, <code>counts[w]</code> on the right does not exist yet, so Python raises a KeyError before anything is stored.', null, 'This is the same lookup written shorter: for a word not yet in the dictionary it raises a KeyError too.'], why: '<code>counts.get(w, 0)</code> gives the old count, or 0 for a new word, so the line works every time.' },
        { skill: 'simulation', check: 'A program rolls a die 600 times and counts the sixes. Why does it not print exactly 100 on every run?', options: ['There is a bug in the loop', 'Random rolls vary: only the share over many rolls settles near 1/6', 'Python cannot count that high'], answer: 1, wrong: ['The loop can be perfectly right. A fair die is expected to show about 100 sixes in 600 rolls, not exactly 100.', null, 'Counting 600 things is trivial for Python. The variation is in the dice, not in the counting.'], why: 'Each roll is independent, so the count wobbles around 100. A simulation estimates a probability, and more trials give a steadier estimate.' },
        { skill: 'random-module', check: 'You are debugging a program that uses random numbers, and you want it to give the same numbers on every run. What do you add?', options: ['<code>random.seed(42)</code> before the first random call', 'A second <code>import random</code>', '<code>random.randint(42, 42)</code> for every roll'], answer: 0, wrong: [null, 'Importing twice changes nothing: the module is the same and the numbers still differ from run to run.', 'This does give 42 every time, but it throws away the randomness for good, and it is not a die any more.'], why: 'A seed starts the generator from a fixed point, so the same seed gives the same sequence. Remove the seed afterwards to get different numbers again.' },
        { skill: 'base-case', check: 'What happens with <code>def f(n): return n * f(n - 1)</code>, which has no base case, when it is called as <code>f(3)</code>?', options: ['It returns 6', 'It returns 0', 'It keeps calling itself until Python stops it with an error'], answer: 2, wrong: ['6 would be the answer for factorial with a base case. Here nothing tells the calls to stop at 1, so the product is never finished.', 'Nothing in the function ever produces a 0 to return. The calls would need a base case that returns a value to start the multiplying.', null], why: 'Every call starts another one, and none ever returns, so the calls pile up until Python reaches its limit and stops with an error. A base case ends the chain.' },
        { skill: 'recursion-cost', check: 'A memo dictionary makes the recursive <code>fib</code> fast. Why?', options: ['Dictionaries are faster than function calls', 'Each value is worked out once, and then looked up instead of recomputed', 'It removes the base case'], answer: 1, wrong: ['The saving does not come from the dictionary being quick. It comes from not doing the same work again and again.', null, 'The base cases are still needed: they are where the answers start from. The memo only remembers answers already found.'], why: 'Plain <code>fib</code> branches and works out the same small values over and over. With a memo, each one is worked out once and then looked up.' },
        { skill: 'binary-search', check: 'Which question can binary search answer in about 20 steps?', options: ['Is 61 in this list of a million numbers, which is sorted?', 'Is 61 in this list of a million numbers, which is in no particular order?', 'Which of a million numbers is the largest?'], answer: 0, wrong: [null, 'Binary search only works if the list is sorted. On an unsorted list it can miss an item that is there and give no error.', 'Finding the largest needs a look at every number, since any one of them could be it. Halving cannot help when nothing is known about the order.'], why: 'Halving works because a sorted list tells you which half the target is in. A million halves to 1 in about 20 steps.' },
        { skill: 'sorting', check: 'A sort does work that grows with the square of the number of items, and it takes 2 seconds for 1,000 items. About how long for 3,000 items?', options: ['About 6 seconds', 'About 18 seconds', 'About 54 seconds'], answer: 1, wrong: ['This treats the work as growing in step with the items. Three times the items is three squared, nine, times the work.', null, 'This cubes the growth. The work grows with the square: 3 × 3 = 9, and 9 × 2 seconds is 18.'], why: 'Three times the items is 3 × 3 = 9 times the work, so 9 × 2 = 18 seconds. That is why a faster algorithm beats a faster computer.' },
        '<p>Two exercises to finish the unit. The first needs no code: choose the structure that fits. The second counts with a dictionary and then puts the answer in order.</p>',
        {
          ex: {
            id: 'py-16-1', skill: ['dict-basics', 'dict-get'], kind: 'choice', title: 'The quiz scores',
            prompt: '<p>A quiz program must keep a score for each player, find a player by name, add points to that player’s score, and print every player’s score at the end. Which way of storing the scores fits best?</p>',
            options: [
              { text: 'A list of the scores, in the order the players joined.', why: 'A list is found by position, not by name. To add points for "Ada" you would need a second list of names and a search for her position.' },
              { text: 'A dictionary whose keys are the names and whose values are the scores.', ok: true },
              { text: 'One long string such as <code>"Ada:5,Alan:3"</code>.', why: 'A string cannot change, and you would have to split it up and glue it together again for every point scored.' },
              { text: 'A new variable for each player, such as <code>ada_score</code> and <code>alan_score</code>.', why: 'The names would have to be written into the program, so it could not handle players it has never heard of, and it could not loop over them at the end.' }
            ],
            hints: ['Look at the verbs in the question: find by name, add points, print every player. Which structure looks things up by name?', 'A dictionary maps a key, here the name, to a value, here the score. <code>scores[name] = scores.get(name, 0) + points</code> adds points, and a loop over the dictionary prints them all.'],
            solution: '<p>A dictionary, from name to score. It finds a player by name in one step, <code>scores.get(name, 0) + points</code> adds points even to a new player, and a <code>for</code> loop over <code>.items()</code> prints every pair. A list is found by position, a string cannot change, and separate variables cannot grow with the players.</p>',
            failTip: 'Ask of each option: can it find a player by name, can it grow when a new player joins, and can it be looped over?',
            followup: 'Write the update line and a loop that prints "name: score" for each player, in the Code Lab. Then print them in alphabetical order, using sorted(scores.items()).'
          }
        },
        {
          ex: {
            id: 'py-16-2', skill: ['dict-get', 'sorting'], title: 'Histogram',
            prompt: '<p>Write <code>histogram(xs)</code> that counts how many times each value appears in the list <code>xs</code>, and returns the counts as a list of <code>(value, count)</code> pairs <em>sorted by value</em>. For <code>[3, 1, 3, 2, 1, 3]</code> it returns <code>[(1, 2), (2, 1), (3, 3)]</code>. The empty list gives the empty list. Use a dictionary to count; do not print.</p>',
            starter: 'def histogram(xs):\n    counts = {}\n    for x in xs:\n        ...\n    return ...\n\nprint(histogram([3, 1, 3, 2, 1, 3]))',
            solution: 'def histogram(xs):\n    counts = {}\n    for x in xs:\n        counts[x] = counts.get(x, 0) + 1\n    return sorted(counts.items())\n\nprint(histogram([3, 1, 3, 2, 1, 3]))',
            hints: ['Count with the pattern from the dictionaries lesson: counts[x] = counts.get(x, 0) + 1 inside the loop over xs.', 'counts.items() gives the (key, value) pairs, and sorted(...) puts them in order, by the key first. Return that list.'],
            tests: [{ call: 'histogram([3, 1, 3, 2, 1, 3])', expect: '[(1, 2), (2, 1), (3, 3)]' }, { call: 'histogram([])', expect: '[]' }, { call: 'histogram([5])', expect: '[(5, 1)]' }, { call: 'histogram([2, 2, 2, 2])', expect: '[(2, 4)]' }, { call: 'histogram(["b", "a", "b"])', expect: "[('a', 1), ('b', 2)]" }],
            failTip: 'If the pairs come out in a different order, sort them: a dictionary does not promise any order. If you get a KeyError, use get for the first time a value is seen.',
            followup: 'Use histogram on 600 numbers from random.randint(1, 6) and print each pair. How far from 100 does each count wander?'
          }
        },
        '<div class="recap"><h3>Unit three in a few lines</h3><ul>\n<li>A dictionary looks up a value by its key, never the other way round; a loop over it visits the keys. <code>get(key, 0)</code> makes counting work the first time.</li>\n<li>Random numbers vary from run to run; a seed repeats them. A simulation repeats an experiment many times and divides, to estimate a probability.</li>\n<li>Every recursive function needs a base case and progress towards it. Plain recursion that branches repeats work, and a memo dictionary stops that.</li>\n<li>Binary search halves a sorted list, so a million items need about 20 steps; it fails on unsorted data. A sort whose work grows with the square of the items becomes hopeless on large lists.</li>\n<li>Next: a project that puts it all together, a cipher you will build and then break.</li>\n</ul></div>'
      ]
    },
    /* ================================================================== */
    {
      standards: ['2-NI-06', '3A-AP-13', '3A-DA-09', '3B-DA-05'],
      standard: 1, title: 'Project: the Caesar cipher', summary: 'Encrypt, decrypt, and then break a 2,000-year-old cipher, first by trying every key and then by frequency analysis, the method that sent a queen to her execution.',
      blocks: [
        `<p>In 1586, Mary, Queen of Scots, was imprisoned in England, and she and her supporters wrote to each other in cipher about a plot to put her on the English throne. The letters were intercepted, and Thomas Phelippes, a codebreaker working for Queen Elizabeth's spymaster, broke the cipher by counting how often each symbol appeared. The decoded letters were used at Mary's trial, and she was executed the next year. The counting method he used had been described some seven hundred years earlier by al-Kindi, a scholar in Baghdad, in the earliest known account of it. How can simply counting letters give away a secret message?</p>`,
        { photo: ['babington-cipher', 'al-kindi-manuscript'], caption: "From the Babington plot of 1586: a postscript in the plotters' cipher that was forged and added to one of Mary's letters to Anthony Babington, and below it the key to the cipher, signed by Babington. Beside it, a page of al-Kindi's book on secret writing, from a manuscript kept in the Süleymaniye Library in Istanbul." },
        `<p>This project starts with an even older cipher, the one the Roman historian Suetonius says Julius Caesar used: shift every letter a fixed number of places along the alphabet. With a shift of 3, A becomes D, B becomes E, and X wraps round to A. You will build the cipher, then break it twice, once by brute force and once with al-Kindi's counting, using nothing but what this course has taught: loops over strings, string building, functions, dictionaries of counts and the "best so far" pattern.</p>`,
        { fig: 'caesar', caption: 'Drag the shift and type a message. Notice how the end of the alphabet wraps round to the start.' },
        `<h2>Part 1: shifting one letter</h2>
<p>Inside the computer, every character is a number, its <em>code</em>. Python converts between the two.</p>
<div class="stmt"><p><span class="kind">Rule (character codes).</span> <code>ord(<i>ch</i>)</code> gives the code of a one-character string, and <code>chr(<i>n</i>)</code> gives the character with code <i>n</i>. The capital letters A to Z have the consecutive codes 65 to 90, and the lower-case letters a to z have 97 to 122.</p></div>
<p>To shift a capital letter by <i>k</i>: turn it into its position in the alphabet, from 0 to 25, by subtracting <code>ord("A")</code>; add <i>k</i>; take the remainder mod 26, so that 26 wraps round to 0; and turn the position back into a letter by adding <code>ord("A")</code>. Lower-case letters work the same way from <code>ord("a")</code>, and anything that is not a letter passes through unchanged.</p>`,
        { predict: true, play: `print(ord("A"), ord("B"), ord("a"))
print(chr(65), chr(90))

def shift_letter(ch, k):
    if "A" <= ch <= "Z":
        return chr((ord(ch) - ord("A") + k) % 26 + ord("A"))
    if "a" <= ch <= "z":
        return chr((ord(ch) - ord("a") + k) % 26 + ord("a"))
    return ch

print(shift_letter("A", 3), shift_letter("x", 3), shift_letter("!", 3))
print(shift_letter("D", -3))    # shifting back
print(-1 % 26)`, caption: 'Prints 65 66 97, then A Z, then D a !, then A, then 25. B comes right after A, and a lower-case letter has a different code from its capital. In the third line x wraps to a: its position is 23, and (23 + 3) % 26 = 0, while ! is not a letter, so it passes through. D shifted by -3 is A, and the last line shows why shifting back works: in Python, -1 % 26 is 25, never a negative number.' },
        { skill: 'char-codes', check: "What is <code>chr(ord(\"A\") + 2)</code>?", options: ["<code>\"A2\"</code>", "<code>\"C\"</code>", "<code>67</code>"], answer: 1, why: "ord gives the code of A, 65; adding 2 gives 67; chr turns 67 back into the character C.", wrong: ["Reads + as gluing text together. ord(\"A\") is the number 65, so + 2 adds 2 to a number, and chr then turns it into a letter.", null, "Stops one step early. 67 is the code, but chr turns a code back into a character, so the answer is \"C\", not a number."] },
        `<p>Why does shifting by <i>k</i> and then by −<i>k</i> always give back the original letter? A letter at position <i>p</i> goes to (<i>p</i> + <i>k</i>) mod 26 and then to ((<i>p</i> + <i>k</i>) mod 26 − <i>k</i>) mod 26, which is the same as (<i>p</i> + <i>k</i> − <i>k</i>) mod 26 = <i>p</i>: adding and taking remainders can be done in any order, as the mathematics course proves in its Lesson 4. Python's rule that <code>%</code> never gives a negative answer, when dividing by a positive number, is exactly what makes the negative shift land back inside 0 to 25.</p>
<details class="reveal"><summary>Predict: what are <code>chr(ord("A") + 1)</code>, <code>shift_letter("Z", 1)</code> and <code>shift_letter("m", 26)</code>?</summary><p><code>"B"</code>; then <code>"A"</code>, since Z is position 25 and (25 + 1) % 26 = 0; then <code>"m"</code> again, because a shift of 26 goes all the way round. So only the shifts 1 to 25 actually change anything.</p></details>
<h2>Part 2: whole messages</h2>
<p>Encrypting a message is Lesson 7's string-building accumulator: start from <code>""</code> and add each shifted character. Decrypting is the same with the shift reversed.</p>`,
        {
          ex: {
            id: 'py-13-1', skill: 'char-codes', title: 'encrypt and decrypt',
            prompt: `<p>Write <code>encrypt(message, k)</code> and <code>decrypt(message, k)</code>. Use the <code>shift_letter</code> above (it is included in the starter). Letters shift, capitals stay capitals, everything else is unchanged, and <code>decrypt(encrypt(m, k), k)</code> must give back <code>m</code>.</p>`,
            starter: `def shift_letter(ch, k):\n    if "A" <= ch <= "Z":\n        return chr((ord(ch) - ord("A") + k) % 26 + ord("A"))\n    if "a" <= ch <= "z":\n        return chr((ord(ch) - ord("a") + k) % 26 + ord("a"))\n    return ch\n\ndef encrypt(message, k):\n    result = ""\n    ...\n    return result\n\ndef decrypt(message, k):\n    ...\n\nprint(encrypt("Meet me at noon!", 3))\nprint(decrypt("Phhw ph dw qrrq!", 3))`,
            solution: `def shift_letter(ch, k):\n    if "A" <= ch <= "Z":\n        return chr((ord(ch) - ord("A") + k) % 26 + ord("A"))\n    if "a" <= ch <= "z":\n        return chr((ord(ch) - ord("a") + k) % 26 + ord("a"))\n    return ch\n\ndef encrypt(message, k):\n    result = ""\n    for ch in message:\n        result += shift_letter(ch, k)\n    return result\n\ndef decrypt(message, k):\n    return encrypt(message, -k)\n\nprint(encrypt("Meet me at noon!", 3))\nprint(decrypt("Phhw ph dw qrrq!", 3))`,
            hints: ['for ch in message: result += shift_letter(ch, k)', 'decrypt can simply return encrypt(message, -k), because shifting by −k undoes shifting by k.'],
            tests: [{ call: 'encrypt("Meet me at noon!", 3)', expect: "'Phhw ph dw qrrq!'" }, { call: 'decrypt("Phhw ph dw qrrq!", 3)', expect: "'Meet me at noon!'" }, { call: 'encrypt("xyz XYZ", 3)', expect: "'abc ABC'" }, { call: 'decrypt(encrypt("The quick brown fox.", 17), 17)', expect: "'The quick brown fox.'" }, { call: 'encrypt("", 5)', expect: "''" }, { call: 'encrypt("abc", 26)', expect: "'abc'" }],
            failTip: 'If decrypt gives the wrong letters, check that it shifts by -k, not by k.',
            followup: 'Writing decrypt in one line, by reusing encrypt, is the habit of Lesson 8: one function, tested once, used twice.'
          }
        },
        `<h2>Part 3: breaking it by brute force</h2>
<p>The fatal weakness of the Caesar cipher is that it has only 25 useful keys. An enemy who knows the method can simply try them all. A computer does it instantly.</p>
<details class="reveal"><summary>Guess first: how many lines will the program below print, and which key gives English? (Hint: the three-letter word <code>Wkh</code> is probably <code>The</code>.)</summary><p>25 lines, one for each key from 1 to 25. W is three places after T in the alphabet, so the key is 3: line 3 reads "The secret to getting ahead is getting started." The other 24 lines are nonsense.</p></details>`,
        { play: `def shift_letter(ch, k):
    if "A" <= ch <= "Z":
        return chr((ord(ch) - ord("A") + k) % 26 + ord("A"))
    if "a" <= ch <= "z":
        return chr((ord(ch) - ord("a") + k) % 26 + ord("a"))
    return ch

def decrypt(message, k):
    result = ""
    for ch in message:
        result += shift_letter(ch, -k)
    return result

secret = "Wkh vhfuhw wr jhwwlqj dkhdg lv jhwwlqj vwduwhg."
for k in range(1, 26):
    print(k, decrypt(secret, k))`, caption: 'All 25 candidates. Your eye finds the English one at once. To break the cipher automatically, the program must do what your eye just did.' },
        { skill: 'cracking', check: "Why can a Caesar cipher be broken by trying every key?", options: ["Because the alphabet is known", "Because there are only 25 possible shifts", "Because computers are fast"], answer: 1, why: "A shift of 26 is no shift at all, so there are only 25 keys to try, and a reader (or a program) picks the one that gives English.", wrong: ["Thinks knowing the alphabet is the weakness. Any cipher on this alphabet has the same letters; what matters is how many keys there are to try.", null, "Thinks speed is the weakness. Even by hand, 25 tries is easy; with 2^128 keys the fastest computers would still fail. The problem is the tiny number of keys."] },
        `<p>Trying every key is called a <em>brute-force attack</em>, and the defence against it is simply to have more keys than anyone could try. Modern ciphers have keys with 128 binary digits or more, so there are at least 2<sup>128</sup> of them, about 3 × 10<sup>38</sup>, and trying them all would take every computer on Earth far longer than the age of the universe.</p>
<h2>Part 4: breaking it by counting</h2>
<p>Here is al-Kindi's idea. In ordinary English text, the letters do not appear equally often: <code>e</code> is by far the most common, followed by <code>t</code>, <code>a</code>, <code>o</code>, <code>i</code> and <code>n</code>. A Caesar shift moves every letter by the same amount, so it relabels the counts but does not change them. Whatever letter is most common in the ciphertext is probably the disguised <code>e</code>, and the distance from <code>e</code> to it is probably the key. Lesson 11's counting pattern does the work.</p>
<details class="reveal"><summary>Guess first: the program below prints a row of stars for each letter. If the longest row turns out to be <code>l</code>, what shift will it print? (Count positions from 0: <code>e</code> is 4 and <code>l</code> is 11.)</summary><p>7, because (11 − 4) % 26 = 7: the program assumes the commonest letter stands for e. Run it and see that l does tower over the others.</p></details>`,
        { play: `secret = "Tlla tl ulhy aol vsk ayll ha zlclu aopz lclupun. Wslhzl iypun aol slaalyz, huk alss uv vul lszl dolyl dl hyl nvpun."

counts = {}
for ch in secret.lower():
    if "a" <= ch <= "z":
        counts[ch] = counts.get(ch, 0) + 1

best = None
for letter, n in counts.items():
    if best is None or n > counts[best]:
        best = letter

for letter in sorted(counts):
    print(letter, "*" * counts[letter])

guess = (ord(best) - ord("e")) % 26
print("most common letter:", best, "  so the shift is probably", guess)`, caption: 'The letter l towers over the others. If l is the disguised e, the shift is (11 − 4) % 26 = 7. Decrypt with 7 and read the message. (best is None is the test for "nothing chosen yet"; None is Python\u2019s value for "no value".)' },
        { skill: 'cracking', check: "A ciphertext's most common letter is <code>k</code>. If plain English's most common letter is <code>e</code>, what shift was probably used?", options: ["6", "7", "11"], answer: 0, why: "k is at position 10 and e at position 4; (10 − 4) % 26 = 6. Decrypt with 6 and check that the text reads as English.", wrong: [null, "Counts k from 1 (the 11th letter) but e from 0. Both must be counted the same way, from 0: k is 10 and e is 4, so 10 − 4 = 6.", "Takes the position of k, counted from 1, as the shift. The shift is the distance from e to k, which means subtracting the position of e."] },
        `<p>On a sentence or two, the single most common letter can mislead. A sturdier method, and the one the second exercise uses, gives each of the 26 candidate decryptions a score for how English it looks, counting how many of its letters are among the commonest in English, <code>etaoinshr</code>, and picks the highest. That combines both attacks: brute force supplies the candidates, and counting chooses between them. It is real cryptanalysis, and on any ordinary sentence it almost never fails.</p>`,
        {
          ex: {
            id: 'py-13-2', skill: 'cracking', title: 'crack',
            prompt: `<p>Write <code>english_score(text)</code>, which counts how many characters of <code>text</code> (lower-cased) are in <code>"etaoinshr"</code>, and <code>crack(secret)</code>, which tries every shift from 0 to 25, scores each decryption, and returns the <em>shift</em> with the highest score. If two shifts tie, return the smaller one. <code>decrypt</code> is provided in the starter.</p>`,
            starter: `def shift_letter(ch, k):\n    if "A" <= ch <= "Z":\n        return chr((ord(ch) - ord("A") + k) % 26 + ord("A"))\n    if "a" <= ch <= "z":\n        return chr((ord(ch) - ord("a") + k) % 26 + ord("a"))\n    return ch\n\ndef decrypt(message, k):\n    result = ""\n    for ch in message:\n        result += shift_letter(ch, -k)\n    return result\n\ndef english_score(text):\n    ...\n\ndef crack(secret):\n    best_shift = 0\n    best_score = -1\n    for k in range(26):\n        ...\n    return best_shift\n\nsecret = "Wkh vhfuhw wr jhwwlqj dkhdg lv jhwwlqj vwduwhg."\nk = crack(secret)\nprint(k, decrypt(secret, k))`,
            solution: `def shift_letter(ch, k):\n    if "A" <= ch <= "Z":\n        return chr((ord(ch) - ord("A") + k) % 26 + ord("A"))\n    if "a" <= ch <= "z":\n        return chr((ord(ch) - ord("a") + k) % 26 + ord("a"))\n    return ch\n\ndef decrypt(message, k):\n    result = ""\n    for ch in message:\n        result += shift_letter(ch, -k)\n    return result\n\ndef english_score(text):\n    score = 0\n    for ch in text.lower():\n        if ch in "etaoinshr":\n            score += 1\n    return score\n\ndef crack(secret):\n    best_shift = 0\n    best_score = -1\n    for k in range(26):\n        s = english_score(decrypt(secret, k))\n        if s > best_score:\n            best_score = s\n            best_shift = k\n    return best_shift\n\nsecret = "Wkh vhfuhw wr jhwwlqj dkhdg lv jhwwlqj vwduwhg."\nk = crack(secret)\nprint(k, decrypt(secret, k))`,
            hints: ['english_score is a counting accumulator over text.lower(), testing ch in "etaoinshr".', 'In crack, compute s = english_score(decrypt(secret, k)) and keep k when s > best_score: strictly greater, so a tie keeps the earlier, smaller shift.'],
            tests: [{ call: 'english_score("the")', expect: '3' }, { call: 'english_score("XYZ xyz!")', expect: '0' }, { call: 'crack("Wkh vhfuhw wr jhwwlqj dkhdg lv jhwwlqj vwduwhg.")', expect: '3' }, { call: 'crack("Iwt fjxrz qgdlc udm yjbeh dktg iwt apon sdv.")', expect: '15' }, { call: 'crack("Hello there, general Kenobi.")', expect: '0' }, { call: 'crack("Tlla tl ulhy aol vsk ayll ha zlclu aopz lclupun.")', expect: '7' }],
            failTip: 'If crack returns a large shift for plain English, check the tie rule: > keeps the first best score, so shift 0 wins when the text is already English.',
            followup: 'You have just done cryptanalysis, combining brute force with frequency analysis. Try your crack on a message of your own, and find the shortest sentence that fools it.'
          }
        },
        `<h2>Stretch goals</h2>
<p>Make complete programs: one that asks for a message and a shift with <code>input</code> and prints the encryption, and one that asks only for a secret and cracks it. Improve the scoring with a dictionary of real English letter frequencies, such as <code>{"e": 12.7, "t": 9.1, "a": 8.2, …}</code>, adding up the frequency of every letter in a candidate instead of counting. And try a stronger cipher. The <em>Vigenère cipher</em> uses a keyword, shifting the first letter by the keyword's first letter, the second by its second, and so on, repeating the keyword. For about three hundred years nobody published a way to break it, and it became known as <em>le chiffre indéchiffrable</em>, the unbreakable cipher, until Charles Babbage in the 1850s and Friedrich Kasiski in 1863 found how to break it: work out the keyword's length, then treat every letter in the same position of the keyword as one Caesar cipher, and crack each with counting.</p>
<h2>Where to go from here</h2>
<p>So how can counting letters give away a secret? Because a shift (or any one-for-one swap of letters) changes which letter stands for which but never how often each one appears, so the commonest letter of the message still shows through. You now know enough Python to be dangerous: you can turn a description into a program, trace what it does, find its bugs, test it, and choose an algorithm that will finish. Good next steps are a longer project of your own, such as a to-do list, a text adventure, a grade calculator or a simulation of something you are curious about, or the other short courses here. <a href="#/lisp">Introduction to Lisp</a> will change how you think about the functions you just wrote, <a href="#/cpp">Introduction to C++</a> shows what Python has been quietly hiding from you about the machine, and <a href="#/math">the mathematics course</a> explains why the cipher that protects this website today cannot be broken the way you just broke Caesar's.</p>`
      ]
    }
  ]
});
