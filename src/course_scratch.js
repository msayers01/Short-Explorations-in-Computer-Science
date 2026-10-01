// Lesson content, (c) 2026 Michael Sayers, licensed CC BY-SA 4.0 (see LICENSE-CONTENT.md).
// From Scratch to Python: for students who know Scratch. Every idea is introduced as the block they know, drawn beside the Python
// that does the same (widgets.js: blocks), and the sprite becomes a turtle. Python runs in Skulpt; examples that draw run in a
// sandboxed frame inside the lesson (app.js: playgroundBlock, usesTurtle).
window.COURSES = window.COURSES || [];
window.COURSES.push({
  id: 'scratch', code: 'SC 100', short: 'Scratch', lang: 'python', status: 'developing', readingWpm: 110,
  title: 'From Scratch to Python',
  grades: 'Grades 5–8 · after Scratch',
  audience: `<p><b>Grades 5–8</b>, for anyone who has made a few projects in Scratch and wants to see what the grown-up programmers are typing. If you can make a sprite say hello, keep a score and use a <em>repeat</em> block, you already know most of what this course teaches. What changes is that you type the words instead of dragging the blocks.</p><p>Each lesson is short, and most of the programs draw or talk. The course is being written: the first six lessons are here.</p>`,
  tagline: 'The blocks you know, one line of Python each: say, ask, variables, repeat and forever, and a sprite that becomes a turtle.',
  description: `<p>In Scratch you build a program by snapping blocks together. In Python you build the same program by typing a line for each block. That is honestly the whole difference. <code>say [Hello!]</code> becomes <code>print("Hello!")</code>. <code>repeat (10)</code> becomes <code>for i in range(10):</code>. <code>move (10) steps</code> becomes <code>turtle.forward(10)</code>, and the sprite, which Python calls a turtle, moves.</p>
<p>Every page in this course shows the blocks you already know on the left and the Python that does the same job on the right. You press Run, the program runs or draws right here on the page, and you change it and run it again. The exercises check your answers the way Scratch never could: by running your program and reading what it printed.</p>
<p>By the end you will type Python the way you snap blocks: without thinking about it. Then <em>Introduction to Python</em> (SC 101) picks up where this course leaves off.</p>`,
  outcomes: [
    'Turn the Scratch blocks you know (say, ask, set, change, repeat, forever, move, turn) into lines of Python',
    'Read an error message, find the line it names, and fix the typo',
    'Keep a score in a variable and change it as a program runs',
    'Use repeat and forever as loops, and make a turtle draw shapes with them',
    'Turn if-then-else into if, elif and else, and lists into Python lists that count from zero',
    'Make your own blocks with def, give them inputs, and use return to report an answer',
    'Type a short program from scratch, without looking at the blocks'
  ],
  howItWorks: `<h3>How to use these pages</h3><p>Every code box has a <b>Run</b> button; that is the green flag. Programs that talk print below the box; programs that draw get a canvas. Change something and run again, as often as you like. <b>Reset</b> puts the code back.</p><p>Each lesson has two exercises. <b>Check answer</b> runs your program and compares what it printed with what was expected, letter by letter. <b>Hint</b> helps one step at a time. Your work is saved in this browser.</p>`,
  lessons: [
    /* ================================================================== */
    {
      title: 'Say it in Python', summary: 'Where Scratch and Python came from, why a program is a list of instructions in both, say and print, ask and input, and what to do when the computer complains.',
      blocks: [
        `<p>Scratch was made at the MIT Media Lab in Boston by a group called Lifelong Kindergarten, led by Mitchel Resnick, and it went online in 2007. The name comes from DJs: <em>scratching</em> is mixing bits of records together, and Scratch lets you mix bits of programs together. The blocks snap so that you cannot make a spelling mistake. That was the whole idea: get the typing out of the way so that the ideas are all that is left.</p>
<p>Python is older. A Dutch programmer, Guido van Rossum, started it as a holiday project at Christmas 1989 and named it after the comedy group Monty Python, because he wanted a language that was fun. Python has no blocks: you type. But here is the secret of this course. <b>The ideas are the same.</b> Everything you learned in Scratch, you already know in Python. You just have to learn how to spell it.</p>
<h2>A program is a list of instructions</h2>
<p>In Scratch, a script is a stack of blocks, and the sprite does them from top to bottom. In Python, a program is a list of lines, and the computer does them from top to bottom. Same thing, different clothes. Here is the first script everyone makes, both ways.</p>`,
        { fig: 'blocks', stack: [['event', 'when green flag clicked'], ['looks', 'say [Hello!]'], ['looks', 'say [I am a Python program.]']], python: 'print("Hello!")\nprint("I am a Python program.")', caption: 'The green flag is the Run button. There is no when-green-flag block in Python: the program simply starts at the top. say becomes print, and the words go in quotation marks instead of a white box.' },
        { play: `print("Hello!")
print("I am a Python program.")`, caption: 'Press Run. Then change the words, add a third print line, and run again. Each print is one say block.' },
        `<div class="stmt"><p><span class="kind">Rule 1.</span> One line is one block. The computer does the lines in order, from the top.</p>
<p><span class="kind">Rule 2.</span> Words that the program should show go inside quotation marks: <code>"like this"</code>. The quotation marks are the white box of a say block. They are not printed.</p>
<p><span class="kind">Rule 3.</span> Spelling counts, and so do capitals. <code>print</code> works; <code>Print</code> and <code>pirnt</code> do not. In Scratch the blocks spelled themselves. Now you do.</p></div>
<h2>When the computer complains</h2>
<p>In Scratch, a wrong program just does something odd. In Python, a misspelt line stops the program and prints a message. The message looks scary the first time, but it is doing you a favour: it says which line, and roughly what went wrong. Run this one on purpose.</p>`,
        { play: `print("This line is fine")
prnt("This line has a typo")
print("This line never runs")`, expectError: true, caption: 'The message ends with: NameError: name \'prnt\' is not defined on line 2. Python does not know a block called prnt. Fix the spelling and run again: all three lines print.' },
        `<p>Three complaints you will meet in this lesson, and what they mean:</p>
<div class="tbl-wrap"><table>
<tr><th>the message says</th><th>what happened</th><th>the fix</th></tr>
<tr><td><code>NameError: name 'prnt' is not defined</code></td><td>a word is misspelt, or capitals are wrong</td><td>spell it like the examples</td></tr>
<tr><td><code>SyntaxError</code> <em>(or "bad input")</em></td><td>a quotation mark or a bracket is missing</td><td>count the <code>"</code> and the <code>(</code> <code>)</code>: they come in pairs</td></tr>
<tr><td><code>NameError: name 'Hello' is not defined</code></td><td>words meant to be shown were not in quotes, so Python looked for a variable called Hello</td><td>put the words in <code>"…"</code></td></tr>
</table></div>
<h2>Ask and answer</h2>
<p>In Scratch, <code>ask [What's your name?] and wait</code> shows a question and puts what the player types into the <code>answer</code> block. Python does both in one line: <code>input("What's your name? ")</code> shows the question, waits, and <em>is</em> the answer. To keep the answer, give it a name, the way you would with a variable in Scratch.</p>`,
        { fig: 'blocks', stack: [['event', 'when green flag clicked'], ['sensing', 'ask [What is your name?] and wait'], ['looks', 'say (join [Hello, ] (answer))']], python: 'name = input("What is your name? ")\nprint("Hello, " + name)', caption: 'ask and wait becomes input. The answer goes into a variable called name. join becomes +, which glues two pieces of text together.' },
        { play: `name = input("What is your name? ")
print("Hello, " + name)
print("Nice to meet you, " + name + "!")`, caption: 'When you run it, a box appears in the output asking for your name: type it and press Enter. Notice the space inside "Hello, ": + glues the pieces exactly as they are, with no space of its own.' },
        `<div class="stmt"><p><span class="kind">Rule 4.</span> <code>name = input("…")</code> asks the question and keeps the answer under the name <code>name</code>. You choose the name, as you would when you make a variable in Scratch.</p>
<p><span class="kind">Rule 5.</span> <code>+</code> between two pieces of text is the <code>join</code> block. Put the spaces you want inside the quotes.</p></div>
<h2>Your sprite is a turtle</h2>
<p>Python has no stage and no sprites built in, but it has something nearly as old as computers themselves: a <em>turtle</em>, a little arrow that moves when you tell it to and draws a line as it goes. <code>move (100) steps</code> is <code>t.forward(100)</code>; <code>turn right (90) degrees</code> is <code>t.right(90)</code>. The first line, <code>import turtle</code>, fetches the turtle; the second makes one and calls it <code>t</code>. The last line tells the drawing it is finished.</p>`,
        { fig: 'blocks', stack: [['event', 'when green flag clicked'], ['pen', 'pen down'], ['motion', 'move (100) steps'], ['motion', 'turn right (90) degrees'], ['motion', 'move (100) steps']], python: 'import turtle\nt = turtle.Turtle()\nt.forward(100)\nt.right(90)\nt.forward(100)\nturtle.done()', caption: 'The pen is already down: a turtle draws as it moves. Lesson 3 uses repeat to turn these two lines into a whole square, and then into stars.' },
        { play: `import turtle
t = turtle.Turtle()
t.forward(100)
t.right(90)
t.forward(100)
t.right(90)
t.forward(100)
turtle.done()`, caption: 'Run it and watch the canvas. Add another t.right(90) and t.forward(100) to close the square. Then try t.color("red") before the first forward, or t.left(45).' },
        `<details class="reveal"><summary>Puzzle: what does this print? <code>print("2" + "3")</code></summary><p><code>23</code>. With quotation marks, 2 and 3 are text, and <code>+</code> is the join block: it glues "2" and "3" into "23". Without the quotes, <code>print(2 + 3)</code> prints 5, because then they are numbers. Scratch is the same: join (2)(3) is 23, and (2)+(3) is 5. Lesson 2 is about telling the two apart.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> A capital letter where Python wants a small one: <code>Print</code>. A missing closing quotation mark or bracket. Words without quotation marks, which Python takes for the name of a variable. Forgetting the space inside <code>"Hello, "</code>, so the output reads <code>Hello,Ada</code>. In turtle programs, forgetting <code>import turtle</code> at the top.</p>` },
        {
          ex: {
            id: 'sp-1-1', title: 'Say hello',
            prompt: `<p>Ask for the player's name, then print two lines: <code>Hello, Ada!</code> and <code>Welcome to Python.</code> (That is the output when the player types <code>Ada</code>.) The greeting has a comma and a space after Hello, and an exclamation mark at the end.</p>`,
            starter: `name = input("What is your name? ")\n# print the two lines here\n`,
            solution: `name = input("What is your name? ")\nprint("Hello, " + name + "!")\nprint("Welcome to Python.")`,
            hints: ['The first line is three pieces joined with +: "Hello, " then the name then "!".', 'The second line is just print with the words in quotes.'],
            tests: [{ stdin: 'Ada', expect: 'Hello, Ada!\nWelcome to Python.' }, { stdin: 'Grace', expect: 'Hello, Grace!\nWelcome to Python.' }, { stdin: 'Max Power', expect: 'Hello, Max Power!\nWelcome to Python.' }],
            failTip: 'Compare your output with the expected one character by character: the comma, the space after it, the exclamation mark, the full stop.'
          }
        },
        {
          ex: {
            id: 'sp-1-2', title: 'Two questions',
            prompt: `<p>Ask two questions, first <em>an animal</em> and then <em>a colour</em>, and print one line that joins them like this: for <code>cat</code> and <code>purple</code> print <code>A purple cat! Amazing.</code></p>`,
            starter: `animal = input("Name an animal: ")\ncolour = input("Name a colour: ")\n# print the sentence here\n`,
            solution: `animal = input("Name an animal: ")\ncolour = input("Name a colour: ")\nprint("A " + colour + " " + animal + "! Amazing.")`,
            hints: ['The sentence is five pieces: "A ", the colour, " ", the animal, "! Amazing." Join them with +.', 'The spaces are inside the quotation marks: "A " has one at the end, and " " is a space on its own.'],
            tests: [{ stdin: 'cat\npurple', expect: 'A purple cat! Amazing.' }, { stdin: 'dog\ngreen', expect: 'A green dog! Amazing.' }, { stdin: 'octopus\nbright orange', expect: 'A bright orange octopus! Amazing.' }],
            failTip: 'The colour comes before the animal, even though it was asked second. Check for a missing space between them.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A Python program is a list of lines, done from the top, the way a script is a stack of blocks. Run is the green flag.</li>
<li><code>say</code> is <code>print("…")</code>. Words to show go in quotation marks. Spelling and capitals count.</li>
<li>An error message names the line and the problem. Read it, fix the line, run again.</li>
<li><code>ask and wait</code> is <code>name = input("…")</code>, and <code>join</code> is <code>+</code>.</li>
<li>The sprite is a turtle: <code>import turtle</code>, <code>t = turtle.Turtle()</code>, then <code>t.forward(100)</code> and <code>t.right(90)</code>.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Keeping score: variables', summary: 'set and change become =, numbers and words are different kinds of thing, the maths blocks become symbols, and a program that keeps a score.',
      blocks: [
        `<p>In 1972 a young engineer named Allan Alcorn built a game for a new company called Atari: two paddles, a ball, and, in the top corners of the screen, two numbers. The game was <em>Pong</em>, and the numbers were the score. The first machine was put in a bar in Sunnyvale, California, and within days it stopped working, because the coin box was full. The score was not an afterthought. Keeping count of something and showing it is the heart of almost every game, and of most programs that are not games.</p>
<p>In Scratch, a score lives in a variable: you make it, you <code>set</code> it to 0 when the game starts, and you <code>change</code> it by 1 when something good happens. Python has variables too, and you have already used one: <code>name</code> in the last lesson. This lesson is about using them for numbers, and about the one trap that catches everyone who comes from Scratch.</p>
<h2>Set and change</h2>`,
        { fig: 'blocks', stack: [['event', 'when green flag clicked'], ['variables', 'set [score] to (0)'], ['variables', 'change [score] by (1)'], ['variables', 'change [score] by (10)'], ['looks', 'say (score)']], python: 'score = 0\nscore = score + 1\nscore = score + 10\nprint(score)', caption: 'set is =. There is no change block: you set the variable to its old value plus something. Read score = score + 1 as "the new score is the old score plus one", not as a maths equation.' },
        { play: `score = 0
print("Start:", score)
score = score + 1
print("Caught a star:", score)
score = score + 10
print("Finished the level:", score)
score = score - 3
print("Hit a rock:", score)`, caption: 'Each line changes score and prints it. The comma in print puts a space between the words and the number. Add a line that doubles the score: score = score * 2.' },
        `<div class="stmt"><p><span class="kind">Rule 1.</span> <code>score = 0</code> is the <code>set</code> block: from now on the name <code>score</code> stands for 0. There is no "make a variable" step; the first <code>=</code> makes it.</p>
<p><span class="kind">Rule 2.</span> <code>score = score + 1</code> is the <code>change</code> block. The right side is worked out first, with the old value, and the result becomes the new value.</p>
<p><span class="kind">Rule 3.</span> A variable's name is written without quotation marks. <code>print(score)</code> shows the number; <code>print("score")</code> shows the word.</p></div>
<h2>The maths blocks</h2>
<p>Scratch's green operator blocks become the symbols on a calculator, with two surprises: multiply is <code>*</code>, because keyboards have no ×, and divide is <code>/</code>.</p>
<div class="tbl-wrap"><table>
<tr><th>Scratch block</th><th>Python</th><th>example</th></tr>
<tr><td><code>(a) + (b)</code></td><td><code>a + b</code></td><td><code>7 + 2</code> is <code>9</code></td></tr>
<tr><td><code>(a) - (b)</code></td><td><code>a - b</code></td><td><code>7 - 2</code> is <code>5</code></td></tr>
<tr><td><code>(a) * (b)</code></td><td><code>a * b</code></td><td><code>7 * 2</code> is <code>14</code></td></tr>
<tr><td><code>(a) / (b)</code></td><td><code>a / b</code></td><td><code>7 / 2</code> is <code>3.5</code></td></tr>
<tr><td><code>(a) mod (b)</code></td><td><code>a % b</code></td><td><code>7 % 2</code> is <code>1</code> (the remainder)</td></tr>
<tr><td><code>round (a)</code></td><td><code>round(a)</code></td><td><code>round(3.7)</code> is <code>4</code></td></tr>
<tr><td><code>pick random (1) to (6)</code></td><td><code>random.randint(1, 6)</code></td><td>needs <code>import random</code> at the top</td></tr>
</table></div>`,
        { play: `import random

dice = random.randint(1, 6)
print("You rolled a", dice)
print("Double is", dice * 2)
print("Half is", dice / 2)
print("Remainder when divided by 4 is", dice % 4)
print("Ten rolls would be about", 10 * 3.5, "points")`, caption: 'Run it several times: the roll changes. Scratch’s pick random is Python’s random.randint, and like the turtle it has to be fetched with import first.' },
        `<h2>The trap: words that look like numbers</h2>
<p>Here is the thing that trips up everyone who comes from Scratch. In Scratch, if <code>answer</code> is 5, then <code>answer + 1</code> is 6; Scratch quietly turns text into a number when it has to. Python does not. What <code>input</code> gives you is always <em>text</em>, even if the player typed digits. The text <code>"5"</code> is not the number <code>5</code>, any more than the word "five" is. Run this and read the message.</p>`,
        { play: `age = input("How old are you? ")
print("Next year you will be", age + 1)`, stdin: '12', expectError: true, caption: 'TypeError: cannot concatenate \'str\' and \'int\': Python will not glue text and a number together, and it will not guess which one you meant. The input was "12", text.' },
        `<p>The fix is to tell Python to turn the text into a number: <code>int("12")</code> is the number 12 (<em>int</em> is short for <em>integer</em>, a whole number). Usually you do it on the same line as the <code>input</code>.</p>`,
        { fig: 'blocks', stack: [['event', 'when green flag clicked'], ['sensing', 'ask [How old are you?] and wait'], ['variables', 'set [age] to (answer)'], ['looks', 'say (join [Next year: ] ((age) + (1)))']], python: 'age = int(input("How old are you? "))\nprint("Next year:", age + 1)', caption: 'int(...) wraps the input: read it inside-out. input asks and gets text; int turns the text into a number; = keeps the number. Scratch did the turning for you; Python asks you to say so.' },
        { play: `age = int(input("How old are you? "))
print("Next year you will be", age + 1)
print("In dog years you are", age * 7)
print("You have lived about", age * 365, "days")`, stdin: '12', caption: 'Change the input in the box below the code and run again. Then take the int( ) off and read the error, so you recognise it next time.' },
        `<div class="stmt"><p><span class="kind">Rule 4.</span> <code>input</code> always gives text. For a whole number write <code>int(input("…"))</code>; for a number with a decimal point, <code>float(input("…"))</code>.</p>
<p><span class="kind">Rule 5.</span> In <code>print</code>, a comma between pieces prints them with a space between, and it is happy to mix words and numbers. <code>+</code> only joins text with text (or adds number to number).</p></div>
<h2>Where Scratch and Python agree</h2>
<p>Names of variables can be anything that starts with a letter and has no spaces: <code>score</code>, <code>lives</code>, <code>high_score</code> (Python people use an underscore where Scratch people use a space). Choose names that say what they hold. A variable can hold a number or text, and you can change your mind, but a program is easier to read when each name always holds one kind of thing.</p>`,
        { play: `lives = 3
coins = 0
name = "Ruby"
print(name, "starts with", lives, "lives and", coins, "coins")
coins = coins + 25
lives = lives - 1
print(name, "now has", lives, "lives and", coins, "coins")
total = coins * 10 + lives * 100
print("Score:", total)`, caption: 'Three variables, two kinds of thing. The score formula on the second-last line uses the maths blocks: coins times ten plus lives times a hundred.' },
        `<details class="reveal"><summary>Puzzle: after <code>x = 5</code> and <code>x = x * 2</code> and <code>x = x + 1</code>, what is <code>x</code>?</summary><p><code>11</code>. Work line by line, like blocks: x is 5; then x becomes 5 × 2, which is 10; then x becomes 10 + 1. The old value is used on the right side, and the result replaces it.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Adding 1 to the text that <code>input</code> gave, without <code>int</code>. Putting a variable's name in quotation marks, so the word prints instead of the value. Writing <code>score + 1</code> on its own line and expecting the score to change: without <code>score =</code> in front, the answer is worked out and thrown away. Using <code>x</code> for multiply. Spelling a variable two ways: <code>Score</code> and <code>score</code> are two different variables.</p>` },
        {
          ex: {
            id: 'sp-2-1', title: 'Dog years',
            prompt: `<p>Ask for an age in years and print the age in dog years, which is seven times as much, exactly like this for <code>12</code>: <code>You are 84 in dog years.</code></p>`,
            starter: `age = input("How old are you? ")\n# turn age into a number, then print the sentence\n`,
            solution: `age = int(input("How old are you? "))\nprint("You are", age * 7, "in dog years.")`,
            hints: ['The input is text. Wrap it: age = int(input("How old are you? ")).', 'print("You are", age * 7, "in dog years.") The commas add the spaces.'],
            tests: [{ stdin: '12', expect: 'You are 84 in dog years.' }, { stdin: '1', expect: 'You are 7 in dog years.' }, { stdin: '40', expect: 'You are 280 in dog years.' }],
            failTip: 'If you see "cannot concatenate" or "unsupported operand", the age is still text: use int( ). Then check the spaces and the full stop.'
          }
        },
        {
          ex: {
            id: 'sp-2-2', title: 'The score keeper',
            prompt: `<p>Start a score at 0. Then ask three times for a number of points (each answer is a whole number) and change the score by each. Finally print <code>Final score: 30</code>, which is the output for 10, 15 and 5.</p>`,
            starter: `score = 0\npoints = int(input("Points? "))\nscore = score + points\n# ask twice more, changing the score each time\n\nprint("Final score:", score)`,
            solution: `score = 0\npoints = int(input("Points? "))\nscore = score + points\npoints = int(input("Points? "))\nscore = score + points\npoints = int(input("Points? "))\nscore = score + points\nprint("Final score:", score)`,
            hints: ['Copy the two lines that ask and change, twice more. The same variable points can be used each time.', 'Each score = score + points is one change-by block.'],
            tests: [{ stdin: '10\n15\n5', expect: 'Final score: 30' }, { stdin: '0\n0\n0', expect: 'Final score: 0' }, { stdin: '100\n-50\n7', expect: 'Final score: 57' }],
            followup: 'Three copies of the same two lines is exactly the kind of thing a repeat block is for. The next lesson gets rid of the copies.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li><code>set [score] to (0)</code> is <code>score = 0</code>; <code>change [score] by (1)</code> is <code>score = score + 1</code>: the old value on the right, the new value on the left.</li>
<li>The maths blocks are <code>+ - * / %</code> and <code>round( )</code>; <code>pick random</code> is <code>random.randint(a, b)</code> after <code>import random</code>.</li>
<li><code>input</code> gives text. To do maths with it, write <code>int(input("…"))</code>. Scratch converted for you; Python asks you to say so.</li>
<li>In <code>print</code>, commas put spaces between pieces and mix words and numbers; <code>+</code> joins text only.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Repeat and forever', summary: 'The repeat block becomes a for loop, forever becomes while, the turtle draws squares, stars and spirals, and the lines inside a loop are marked by indenting them.',
      blocks: [
        `<p>Before Scratch there was Logo, and before the turtle on your screen there was a real one. In 1967 a team at a company in Massachusetts, with the mathematician Seymour Papert from MIT, made a language for children called Logo, and a couple of years later they gave it a robot: a round machine on wheels, about the size of a cake tin, with a pen underneath. Children typed <code>FORWARD 100</code> and <code>RIGHT 90</code>, and the robot drove across sheets of paper on the floor and drew. Papert called it the turtle. When screens became cheap the turtle moved onto them, and when Papert's students at MIT made Scratch forty years later, the sprite that moves and turns in steps and degrees was the same turtle wearing a cat costume.</p>
<p>So the turtle in Python is not a toy that happens to be there. It is the original, and it is still the best way to see what a loop does, because a loop that draws leaves its footprints. This lesson's blocks are <code>repeat</code> and <code>forever</code>, and most of its programs draw.</p>
<h2>Repeat</h2>
<p>To draw a square in Scratch you put <code>move</code> and <code>turn</code> inside a <code>repeat (4)</code>. In Python, the C-shaped block becomes a line ending in a colon, and the blocks inside it become lines that are <em>indented</em>: pushed in by four spaces. The indenting is how Python knows which lines are inside the loop. It is the one thing that has no block, so look closely.</p>`,
        { fig: 'blocks', stack: [['event', 'when green flag clicked'], ['control', 'repeat (4)', [['motion', 'move (100) steps'], ['motion', 'turn right (90) degrees']]]], python: 'import turtle\nt = turtle.Turtle()\nfor i in range(4):\n    t.forward(100)\n    t.right(90)\nturtle.done()', caption: 'repeat (4) is for i in range(4): with a colon at the end. The two indented lines are inside the C. turtle.done() is not indented, so it runs once, after the loop.' },
        { play: `import turtle
t = turtle.Turtle()
for i in range(4):
    t.forward(100)
    t.right(90)
turtle.done()`, caption: 'A square. Change range(4) to range(3) and right(90) to right(120): a triangle. Then range(5) with right(144): a star. The turn must add up to a full circle, or a whole number of them.' },
        `<div class="stmt"><p><span class="kind">Rule 1.</span> <code>for i in range(n):</code> is <code>repeat (n)</code>. The line ends with a colon.</p>
<p><span class="kind">Rule 2.</span> The lines inside the loop are indented by four spaces, all by the same amount. The first line that is not indented is outside the loop, like the first block below the C.</p>
<p><span class="kind">Rule 3.</span> <code>i</code> counts the repeats, starting at 0: on the first time round it is 0, then 1, then 2. Scratch has no counter unless you make one; Python gives you one free.</p></div>
<p>That free counter is useful. Because <code>i</code> changes every time round, anything inside the loop that uses <code>i</code> changes too. Here it makes each line of a spiral a little longer than the last.</p>`,
        { play: `import turtle
t = turtle.Turtle()
t.speed(0)
for i in range(36):
    t.forward(i * 5)
    t.right(90)
turtle.done()`, caption: 'The first line is 0 steps, then 5, 10, 15, … A square spiral. Change right(90) to right(89) and watch it twist; try right(120) and right(60). t.speed(0) is the fastest setting.' },
        { play: `for i in range(5):
    print("Round", i)
print("Done!")
for i in range(1, 11):
    print(i, "times 7 is", i * 7)`, caption: 'Without a turtle, the counter is plain to see: 0, 1, 2, 3, 4. range(1, 11) counts from 1 up to 10: the second number is where it stops, and it is not included.' },
        `<div class="stmt"><p><span class="kind">Rule 4.</span> <code>range(n)</code> counts 0, 1, …, n−1: that is <code>n</code> times. <code>range(a, b)</code> counts from <code>a</code> up to but not including <code>b</code>. <code>range(10, 0, -1)</code> counts down: 10, 9, …, 1.</p></div>
<h2>Loops that count things</h2>
<p>Remember the score keeper from lesson 2, with the same two lines copied three times? A loop does the copying. This is the most common loop in the world: a variable set to 0 before the loop, changed inside it, and shown after it.</p>`,
        { fig: 'blocks', stack: [['event', 'when green flag clicked'], ['variables', 'set [total] to (0)'], ['control', 'repeat (3)', [['sensing', 'ask [Points?] and wait'], ['variables', 'change [total] by (answer)']]], ['looks', 'say (join [Total: ] (total))']], python: 'total = 0\nfor i in range(3):\n    points = int(input("Points? "))\n    total = total + points\nprint("Total:", total)', caption: 'set before the loop, change inside it, say after it. The int( ) is there because answer is text, as in lesson 2.' },
        { play: `total = 0
for i in range(3):
    points = int(input("Points? "))
    total = total + points
print("Total:", total)`, stdin: '10\n15\n5', caption: 'Three answers are provided in the box below. Change range(3) to range(5) and add two more lines of input.' },
        `<h2>Forever</h2>
<p>Scratch's <code>forever</code> block runs until you press the stop sign. Python's version is <code>while True:</code>, but a program on this page has no stop sign, so a forever loop here just runs until the site stops it. Run this one once, to see what "forever" looks like from the outside.</p>`,
        { play: `count = 0
while True:
    count = count + 1
print("never printed")`, expectError: true, caption: 'After a few seconds the site says Time limit exceeded. In Scratch you would press the stop sign; here nothing can stop a loop that has no way out, so the page stops it for you.' },
        `<p>Most "forever" loops in real programs are really "repeat until" loops: keep going <em>while</em> something is true. Scratch writes that as <code>repeat until &lt;…&gt;</code>; Python writes it as <code>while</code> with the condition the other way round: keep going while the player has lives, rather than until the lives run out.</p>`,
        { fig: 'blocks', stack: [['event', 'when green flag clicked'], ['variables', 'set [lives] to (3)'], ['control', 'repeat until <(lives) = (0)>', [['looks', 'say (join [Lives: ] (lives))'], ['variables', 'change [lives] by (-1)']]], ['looks', 'say [Game over]']], python: 'lives = 3\nwhile lives > 0:\n    print("Lives:", lives)\n    lives = lives - 1\nprint("Game over")', caption: 'repeat until lives = 0 is while lives > 0: Scratch says when to stop, Python says when to keep going. Something inside the loop must change lives, or it is a forever loop.' },
        { play: `lives = 3
while lives > 0:
    print("Lives:", lives)
    lives = lives - 1
print("Game over")

countdown = 5
while countdown > 0:
    print(countdown)
    countdown = countdown - 1
print("Blast off!")`, caption: 'Two while loops. Each has a variable that moves towards the stopping point every time round. Delete the countdown = countdown - 1 line and think about what would happen before you run it.' },
        `<div class="stmt"><p><span class="kind">Rule 5.</span> <code>while condition:</code> repeats the indented lines as long as the condition is true. Use it when you do not know in advance how many times. Make sure something inside the loop changes the condition.</p>
<p><span class="kind">Rule 6.</span> Use <code>for</code> when you know how many times (or how many things), and <code>while</code> when you are waiting for something to happen.</p></div>
<h2>Drawing with loops inside loops</h2>
<p>A repeat inside a repeat is allowed in both languages. In Python the inner loop is indented twice, by eight spaces. The turtle below draws a square, turns a little, and draws another, twelve times.</p>`,
        { play: `import turtle
t = turtle.Turtle()
t.speed(0)
t.color("blue")
for i in range(12):
    for j in range(4):
        t.forward(80)
        t.right(90)
    t.right(30)
turtle.done()`, caption: 'The inner loop (j) draws one square; the outer loop (i) draws twelve of them, turning 30 degrees each time: 12 × 30 is a full circle. Try range(36) with right(10), or a different colour.' },
        `<details class="reveal"><summary>Puzzle: how many times does <code>print("hi")</code> run? <code>for i in range(3):</code> then indented <code>for j in range(4):</code> then doubly indented <code>print("hi")</code></summary><p>12 times. The inner loop runs 4 times for each of the outer loop's 3 times: 3 × 4. A repeat (4) inside a repeat (3) in Scratch does the same.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Forgetting the colon at the end of the <code>for</code> or <code>while</code> line. Not indenting the lines inside the loop, or indenting them by different amounts (use four spaces, every time). Indenting the line that should come <em>after</em> the loop, so it runs every time round. Expecting <code>range(5)</code> to reach 5: it stops at 4. A <code>while</code> loop whose condition nothing changes. Forgetting that the turtle's turns must add up to 360 for a shape to close.</p>` },
        {
          ex: {
            id: 'sp-3-1', title: 'Countdown',
            prompt: `<p>Ask for a number, then count down from it to 1, one number per line, and finally print <code>Blast off!</code>. For <code>3</code> the output is <code>3</code>, <code>2</code>, <code>1</code> and <code>Blast off!</code> on four lines.</p>`,
            starter: `n = int(input("Count down from? "))\n# a loop that prints n, then n - 1, ... down to 1\n\nprint("Blast off!")`,
            solution: `n = int(input("Count down from? "))\nwhile n > 0:\n    print(n)\n    n = n - 1\nprint("Blast off!")`,
            hints: ['A while loop: while n > 0: print n, then take one off n.', 'Or a for loop that counts down: for i in range(n, 0, -1): print(i).', 'The Blast off! line must not be indented, so it prints once, after the loop.'],
            tests: [{ stdin: '3', expect: '3\n2\n1\nBlast off!' }, { stdin: '1', expect: '1\nBlast off!' }, { stdin: '5', expect: '5\n4\n3\n2\n1\nBlast off!' }],
            failTip: 'If Blast off! appears several times, it is indented into the loop. If the countdown ends at 2 or goes to 0, check the loop’s stopping condition.'
          }
        },
        {
          ex: {
            id: 'sp-3-2', title: 'Times table',
            prompt: `<p>Ask for a number and print its times table from 1 to 10, one line each, exactly like this for <code>7</code>: <code>7 x 1 = 7</code>, then <code>7 x 2 = 14</code>, and so on up to <code>7 x 10 = 70</code>. The letter x has a space on each side.</p>`,
            starter: `n = int(input("Which table? "))\n# a loop from 1 to 10 that prints one line each time\n`,
            solution: `n = int(input("Which table? "))\nfor i in range(1, 11):\n    print(n, "x", i, "=", n * i)`,
            hints: ['for i in range(1, 11): counts 1 to 10.', 'Inside the loop, one print with commas: print(n, "x", i, "=", n * i). The commas give the spaces.'],
            tests: [{ stdin: '7', expect: '7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70' }, { stdin: '1', expect: '1 x 1 = 1\n1 x 2 = 2\n1 x 3 = 3\n1 x 4 = 4\n1 x 5 = 5\n1 x 6 = 6\n1 x 7 = 7\n1 x 8 = 8\n1 x 9 = 9\n1 x 10 = 10' }, { stdin: '12', expect: '12 x 1 = 12\n12 x 2 = 24\n12 x 3 = 36\n12 x 4 = 48\n12 x 5 = 60\n12 x 6 = 72\n12 x 7 = 84\n12 x 8 = 96\n12 x 9 = 108\n12 x 10 = 120' }],
            failTip: 'Ten lines, from 1 to 10: range(1, 11). Check there is one space on each side of the x and of the =.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li><code>repeat (n)</code> is <code>for i in range(n):</code>. The lines inside are indented four spaces; the first line that is not indented comes after the loop.</li>
<li><code>i</code> counts 0, 1, …, n−1 for free. <code>range(1, 11)</code> is 1 to 10; <code>range(10, 0, -1)</code> counts down.</li>
<li><code>forever</code> is <code>while True:</code>; <code>repeat until</code> is <code>while</code> with the condition turned round. Something inside must move the condition towards stopping.</li>
<li>Set a total to 0 before a loop, change it inside, show it after: the loop everyone writes most.</li>
<li>A turtle leaves footprints: a square is four forwards and four right turns, a star is five and 144 degrees, and a loop inside a loop draws a shape of shapes.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'If, then, else', summary: 'The if block becomes if with a colon, else and else if become else and elif, = becomes ==, and, or and not stay as words, and a program that answers back depending on what you typed.',
      blocks: [
        `<p>In 1966 a computer scientist at MIT called Joseph Weizenbaum wrote a program named ELIZA that could hold a conversation. You typed a sentence; it typed one back. With the script he called DOCTOR it played the part of a therapist, and people found it uncannily good at it: his own secretary, who had watched him build it and knew exactly what it was, once asked him to leave the room so that she could talk to it in private.</p>
<p>ELIZA was not thinking. It was checking. If your sentence contained the word "mother", it said "Tell me more about your family." If it began "I am", it took the rest and asked "How long have you been" that. If nothing matched, it said "Please go on." The whole program was a long list of <em>if this, then say that</em>, and that is the block this lesson is about. By the end you will write a very small ELIZA of your own.</p>
<h2>If</h2>
<p>Scratch's <code>if &lt;&gt; then</code> is a C-shaped block with a hexagonal hole for a condition. Python's is a line that starts with <code>if</code>, has the condition, and ends with a colon, and the blocks inside the C become indented lines, exactly as they did for <code>repeat</code>.</p>`,
        { fig: 'blocks', stack: [['event', 'when green flag clicked'], ['sensing', 'ask [Password?] and wait'], ['control', 'if <(answer) = [turtle]> then', [['looks', 'say [Welcome!]']]]], python: 'answer = input("Password? ")\nif answer == "turtle":\n    print("Welcome!")', caption: 'The = block becomes ==, two equals signs. One = means "set this variable"; two mean "are these the same?". Mixing them up is the most common mistake in all of Python, so look twice.' },
        { play: `answer = input("Password? ")
if answer == "turtle":
    print("Welcome!")
print("Goodbye.")`, stdin: 'turtle', caption: 'Change the input in the box below to something else and run again: the Welcome! line is skipped, and Goodbye. prints either way because it is not indented.' },
        `<div class="stmt"><p><span class="kind">Rule 1.</span> <code>if condition:</code> runs the indented lines only when the condition is true. Colon at the end, four spaces inside, like a loop.</p>
<p><span class="kind">Rule 2.</span> Scratch's <code>=</code> block is <code>==</code> in Python. <code>&lt;</code> and <code>&gt;</code> are the same. There are two more: <code>&lt;=</code> (less than or equal) and <code>!=</code> (not equal).</p></div>
<p>What happens if you type one equals sign by mistake? Python refuses to run, and tells you the line. Run this one to see the message so you recognise it later.</p>`,
        { play: `score = 10
if score = 10:
    print("Ten!")`, expectError: true, caption: 'SyntaxError: bad input on line 2. Python saw "if score = 10" and could not make sense of it. Fix it to == and it runs.' },
        `<h2>Else</h2>
<p>Scratch has a second block, <code>if &lt;&gt; then … else …</code>, with two mouths: one for when the condition is true and one for when it is not. In Python the word <code>else</code> gets a line of its own, with a colon, not indented, and its own indented lines under it.</p>`,
        { fig: 'blocks', stack: [['event', 'when green flag clicked'], ['sensing', 'ask [How old are you?] and wait'], ['control', 'if <(answer) > (12)> then', [['looks', 'say [Teenager!]']], [['looks', 'say [Not yet a teenager.]']]]], python: 'age = int(input("How old are you? "))\nif age > 12:\n    print("Teenager!")\nelse:\n    print("Not yet a teenager.")', caption: 'The else: line lines up with the if, because it is part of the same block. Exactly one of the two indented parts runs, never both, never neither. The int( ) turns the typed answer into a number so that > works, as in lesson 2.' },
        { play: `age = int(input("How old are you? "))
if age > 12:
    print("Teenager!")
else:
    print("Not yet a teenager.")`, stdin: '11', caption: 'Try 12 and 13 in the box. Is 12 a teenager by this program? Change > to >= and see what changes.' },
        `<h2>More than two choices</h2>
<p>In Scratch, to pick between three things you put an <code>if-else</code> inside the else mouth of another <code>if-else</code>, and the blocks start to stair-step across the screen. Python has a word for exactly this: <code>elif</code>, short for "else if". You can have as many <code>elif</code> lines as you like, and an <code>else</code> at the end for everything that is left.</p>`,
        { fig: 'blocks', stack: [['event', 'when green flag clicked'], ['control', 'if <(temp) > (25)> then', [['looks', 'say [Hot!]']], [['control', 'if <(temp) > (15)> then', [['looks', 'say [Nice.]']], [['looks', 'say [Cold.]']]]]]], python: 'if temp > 25:\n    print("Hot!")\nelif temp > 15:\n    print("Nice.")\nelse:\n    print("Cold.")', caption: 'Three choices, no stair-step. Python checks the conditions from the top and runs the first one that is true, then skips the rest. 30 is more than 15 too, but it never gets that far: it already said Hot!' },
        { play: `temp = int(input("Temperature? "))
if temp > 25:
    print("Hot!")
elif temp > 15:
    print("Nice.")
elif temp > 5:
    print("Chilly.")
else:
    print("Cold.")`, stdin: '18', caption: 'Four choices with two elifs. Try 30, 10 and -3. Then swap the first two if lines round (temp > 15 first) and try 30 again: why does it say Nice.?' },
        `<div class="stmt"><p><span class="kind">Rule 3.</span> <code>if … elif … elif … else</code> is one block with several parts. Python tries the conditions from the top and runs the first true one. <code>else</code> has no condition and catches everything else. Put the strictest condition first.</p></div>
<h2>And, or, not</h2>
<p>Scratch's green <code>&lt;&gt; and &lt;&gt;</code>, <code>&lt;&gt; or &lt;&gt;</code> and <code>not &lt;&gt;</code> blocks are the same three words in Python, with no brackets to drag them into.</p>`,
        { fig: 'blocks', stack: [['event', 'when green flag clicked'], ['control', 'if <<(age) > (11)> and <(age) < (20)>> then', [['looks', 'say [Teenager]']]], ['control', 'if <<(day) = [Saturday]> or <(day) = [Sunday]>> then', [['looks', 'say [Weekend!]']]]], python: 'if age > 11 and age < 20:\n    print("Teenager")\nif day == "Saturday" or day == "Sunday":\n    print("Weekend!")', caption: 'and: both halves must be true. or: at least one. A common slip: day == "Saturday" or "Sunday" does not mean what it looks like; each side of or needs its own complete comparison.' },
        { play: `age = int(input("Age? "))
has_ticket = input("Do you have a ticket (yes/no)? ")
if age >= 12 and has_ticket == "yes":
    print("Come in!")
elif not has_ticket == "yes":
    print("You need a ticket.")
else:
    print("Sorry, you must be 12 or over.")`, stdin: '14\nyes', caption: 'Try 14 with no, and 9 with yes. not has_ticket == "yes" is the same as has_ticket != "yes"; both are fine, use whichever reads best.' },
        `<h2>Checking what someone typed</h2>
<p>One more comparison that Scratch has as a block: <code>[list] contains [thing]?</code> for lists, and for words there is nothing quite like it. Python has <code>in</code>, and it works on text: <code>"cat" in sentence</code> is true if the letters c-a-t appear somewhere in the sentence. That is all ELIZA needed.</p>`,
        { play: `print("Hello. Tell me what is on your mind.")
sentence = input("> ")
words = sentence.lower()
if "mother" in words or "father" in words:
    print("Tell me more about your family.")
elif words.startswith("i am"):
    print("How long have you been" + sentence[4:] + "?")
elif "?" in sentence:
    print("Why do you ask?")
elif "sad" in words or "unhappy" in words:
    print("I am sorry to hear that.")
else:
    print("Please go on.")`, stdin: 'I am worried about my test', caption: 'A five-rule ELIZA. .lower() makes the check ignore capital letters; sentence[4:] is everything after the first four characters, so "I am worried" becomes "How long have you been worried?". Add a rule of your own, with a word and a reply.' },
        `<details class="reveal"><summary>Puzzle: <code>x = 7</code>. Which of these are true? <code>x == 7</code>, <code>x &gt; 7</code>, <code>x &gt;= 7</code>, <code>x != 7</code>, <code>not x &gt; 7</code></summary><p>True, false, true, false, true. <code>&gt;=</code> includes equal; <code>!=</code> means "is not"; <code>not</code> flips a false into a true.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> One equals sign in a condition (<code>if x = 5</code>) instead of two. Forgetting the colon after <code>if</code>, <code>elif</code> or <code>else</code>. Indenting <code>else:</code> under the <code>if</code> instead of lining it up with it. Comparing a number with a word: <code>input()</code> gives text, so <code>answer &gt; 12</code> fails unless you wrote <code>int(input(…))</code>. Writing <code>day == "Saturday" or "Sunday"</code>, which is always true. Putting the loosest condition first so the stricter ones never get a turn.</p>` },
        {
          ex: {
            id: 'sp-4-1', title: 'The secret word',
            prompt: `<p>Ask <code>Secret word?</code>. If the answer is exactly <code>sesame</code>, print <code>The door opens.</code> Otherwise print <code>Go away!</code> Print one line either way.</p>`,
            starter: `word = input("Secret word? ")\n# if the word is sesame, the door opens; otherwise, go away\n`,
            solution: `word = input("Secret word? ")\nif word == "sesame":\n    print("The door opens.")\nelse:\n    print("Go away!")`,
            hints: ['if word == "sesame": with two equals signs, then an indented print.', 'else: on its own line, lined up with the if, then the other print indented under it.'],
            tests: [{ stdin: 'sesame', expect: 'The door opens.' }, { stdin: 'please', expect: 'Go away!' }, { stdin: 'Sesame', expect: 'Go away!' }],
            failTip: 'Capital letters matter: "Sesame" is not "sesame". If you see a SyntaxError on the if line, check for a single = and the colon at the end.'
          }
        },
        {
          ex: {
            id: 'sp-4-2', title: 'Too high, too low',
            prompt: `<p>The secret number is 50. Ask <code>Your guess?</code>, turn the answer into a number, and print one line: <code>Too low!</code> if the guess is under 50, <code>Too high!</code> if it is over, and <code>You got it!</code> if it is exactly 50.</p>`,
            starter: `secret = 50\nguess = int(input("Your guess? "))\n# three choices: too low, too high, or exactly right\n`,
            solution: `secret = 50\nguess = int(input("Your guess? "))\nif guess < secret:\n    print("Too low!")\nelif guess > secret:\n    print("Too high!")\nelse:\n    print("You got it!")`,
            hints: ['Three outcomes means if, elif, else: if guess < secret: … elif guess > secret: … else: …', 'The else needs no condition: if the guess is neither lower nor higher, it must be exactly 50.'],
            tests: [{ stdin: '20', expect: 'Too low!' }, { stdin: '75', expect: 'Too high!' }, { stdin: '50', expect: 'You got it!' }, { stdin: '49', expect: 'Too low!' }],
            failTip: 'Make sure the comparison is between numbers: guess must come from int(input(…)). Check that exactly one message prints for each guess.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li><code>if &lt;&gt; then</code> is <code>if condition:</code> with the lines inside indented. <code>else</code> gets its own line, lined up with the <code>if</code>.</li>
<li>Scratch's <code>=</code> is <code>==</code>. One equals sign sets a variable; two compare. Also <code>&lt; &gt; &lt;= &gt;= !=</code>.</li>
<li><code>elif</code> replaces an if-else nested inside an else: Python runs the first true branch and skips the rest.</li>
<li><code>and</code>, <code>or</code> and <code>not</code> are the same words as the green blocks. Each side of <code>or</code> needs its own complete comparison.</li>
<li><code>"word" in text</code> is true if the word appears anywhere in the text: the whole secret of ELIZA.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Lists', summary: 'Scratch lists become Python lists in square brackets, add becomes append, item 1 becomes [0] because Python counts from zero, length of is len, contains is in, and a loop can walk through every item.',
      blocks: [
        `<p>The oldest writing in the world is lists. In the ruins of Uruk, a city in what is now Iraq, archaeologists found thousands of clay tablets about five thousand years old, and when they were finally read they turned out not to be stories or laws or prayers. They were records: so many sacks of barley, so many jars of beer, who they went to. People invented writing because there were too many things to keep in their heads, and a list on a tablet does not forget.</p>
<p>Programs are the same. A score is one variable, but a class register, a high-score table or a shopping list is a <em>list</em>: one name for many things, in order. Scratch has lists in its Variables palette, with blocks like <code>add [thing] to [list]</code> and <code>item (1) of [list]</code>. Python has them too, and they are one of the best things about it.</p>
<h2>Making a list and adding to it</h2>
<p>In Scratch you click "Make a List", give it a name, and use <code>add</code> to put things in. In Python a list is written in square brackets with commas between the items, and <code>.append()</code> adds one to the end.</p>`,
        { fig: 'blocks', stack: [['event', 'when green flag clicked'], ['variables', 'delete all of [shopping]'], ['variables', 'add [milk] to [shopping]'], ['variables', 'add [eggs] to [shopping]'], ['variables', 'add [bread] to [shopping]'], ['looks', 'say (shopping)']], python: 'shopping = []\nshopping.append("milk")\nshopping.append("eggs")\nshopping.append("bread")\nprint(shopping)', caption: '[] is an empty list. append puts a new item at the end. Printing a list shows all the items in brackets, with quotes around words, which is how Python writes a list so that you can tell it from a sentence.' },
        { play: `shopping = ["milk", "eggs", "bread"]
print(shopping)
shopping.append("apples")
print(shopping)
print("There are", len(shopping), "things to buy.")
scores = [12, 40, 7, 33]
print(scores)
print("Best:", max(scores), " Worst:", min(scores), " Total:", sum(scores))`, caption: 'You can write the items straight into the brackets instead of appending one by one. len gives the length; max, min and sum do what they say, on a list of numbers.' },
        `<div class="stmt"><p><span class="kind">Rule 1.</span> A list is written <code>[item, item, item]</code>. <code>[]</code> is an empty list. Items can be words (in quotes) or numbers.</p>
<p><span class="kind">Rule 2.</span> <code>add [thing] to [list]</code> is <code>list.append(thing)</code>. <code>length of [list]</code> is <code>len(list)</code>. <code>[list] contains [thing]?</code> is <code>thing in list</code>.</p></div>
<h2>Item number… zero?</h2>
<p>Here is the one real surprise in this lesson. Scratch's <code>item (1) of [list]</code> is the first item. In Python the first item is <code>list[0]</code>. Python, like most programming languages, counts positions from zero: the first item is 0 places from the start, the second is 1 place from the start, and so on. So a list of three items has positions 0, 1 and 2, and asking for position 3 is an error.</p>`,
        { fig: 'blocks', stack: [['event', 'when green flag clicked'], ['looks', 'say (item (1) of [shopping])'], ['looks', 'say (item (3) of [shopping])'], ['looks', 'say (item (length of [shopping]) of [shopping])']], python: 'print(shopping[0])\nprint(shopping[2])\nprint(shopping[-1])', caption: 'Item 1 is [0], item 3 is [2]. The last item is [-1]: counting backwards from the end, which Scratch has no block for. Scratch also lets you type "last" into the item block; Python says -1.' },
        { play: `pets = ["cat", "dog", "fish", "hamster"]
print(pets[0])
print(pets[1])
print(pets[3])
print(pets[-1])
pets[1] = "parrot"
print(pets)
print(pets[4])`, expectError: true, caption: 'The last line asks for position 4 in a list whose positions are 0 to 3: IndexError: list index out of range. Scratch would quietly say nothing; Python stops and tells you. pets[1] = "parrot" is the replace item block.' },
        `<div class="stmt"><p><span class="kind">Rule 3.</span> <code>item (n) of [list]</code> is <code>list[n − 1]</code>: Python counts from 0. <code>list[-1]</code> is the last item. <code>replace item (n) of [list] with [thing]</code> is <code>list[n − 1] = thing</code>.</p>
<p><span class="kind">Rule 4.</span> Asking for a position that does not exist is an error, not a blank.</p></div>
<h2>Going through every item</h2>
<p>In Scratch, to do something with every item you make a counter variable, set it to 1, and <code>repeat (length of list)</code> with <code>change counter by 1</code> inside. Python's <code>for</code> loop can walk straight along a list: <code>for pet in pets:</code> runs the indented lines once for each item, with <code>pet</code> set to that item each time. No counter needed.</p>`,
        { fig: 'blocks', stack: [['event', 'when green flag clicked'], ['variables', 'set [n] to (1)'], ['control', 'repeat (length of [pets])', [['looks', 'say (join [I have a ] (item (n) of [pets]))'], ['variables', 'change [n] by (1)']]]], python: 'for pet in pets:\n    print("I have a", pet)', caption: 'Four blocks become two lines. Read it aloud: for each pet in pets, print "I have a" and the pet. The name after for can be anything; pet is just clearer than i.' },
        { play: `pets = ["cat", "dog", "fish", "hamster"]
for pet in pets:
    print("I have a", pet)

scores = [12, 40, 7, 33]
total = 0
for s in scores:
    total = total + s
print("Total:", total, " (sum says", sum(scores), ")")

for i in range(len(pets)):
    print(i + 1, pets[i])`, caption: 'Three loops. The second adds up the scores by hand, the way Scratch would, and sum agrees. The third uses range(len(pets)) when you want the position as well as the item: i is 0, 1, 2, 3, so i + 1 gives the numbers people expect.' },
        `<h2>Taking things out, and asking what is there</h2>`,
        { play: `shopping = ["milk", "eggs", "bread", "apples"]
shopping.remove("eggs")
print(shopping)
last = shopping.pop()
print("Took out", last, "- now", shopping)
print("milk" in shopping)
print("eggs" in shopping)
if "bread" in shopping:
    print("Don't forget the bread!")
print(shopping.index("bread"))
shopping.insert(0, "coffee")
print(shopping)`, caption: 'remove takes out an item by name (the delete block); pop takes off the last one and hands it to you; in asks whether something is there (the contains block); index tells you where (item # of); insert puts something in at a position. The blocks are all here, with different names.' },
        `<div class="stmt"><p><span class="kind">Rule 5.</span> <code>for item in list:</code> runs the indented lines once per item, in order. Use <code>for i in range(len(list)):</code> when you also need the position.</p>
<p><span class="kind">Rule 6.</span> <code>list.remove(thing)</code> deletes the first matching item, <code>list.pop()</code> removes and returns the last, <code>list.insert(position, thing)</code> puts one in, <code>list.index(thing)</code> finds where it is, <code>sorted(list)</code> gives a sorted copy.</p></div>
<h2>A list that grows while the program runs</h2>
<p>Put together <code>while</code> from lesson 3, <code>if</code> from lesson 4 and a list, and you have a program that collects whatever the user types until they say stop.</p>`,
        { play: `names = []
while True:
    name = input("Name (or done)? ")
    if name == "done":
        break
    names.append(name)
print("You entered", len(names), "names:")
for n in sorted(names):
    print("-", n)`, stdin: 'Zoe\nAli\nMia\ndone', caption: 'break jumps out of a loop at once: it is the stop sign from inside the program. sorted puts the names in alphabetical order without changing the list. Add more names in the box, with done at the end.' },
        `<details class="reveal"><summary>Puzzle: <code>a = [5, 10, 15, 20]</code>. What are <code>a[1]</code>, <code>a[-1]</code>, <code>len(a)</code>, <code>a[len(a) - 1]</code> and <code>a[4]</code>?</summary><p>10 (second item), 20 (last), 4, 20 (the last item again: position length minus one), and an IndexError, because the positions are 0 to 3.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Thinking <code>list[1]</code> is the first item: it is the second. Asking for <code>list[len(list)]</code>, which is one past the end. Writing <code>list.append("a", "b")</code>: append takes one thing at a time. Forgetting the quotes round a word, so Python looks for a variable called <code>milk</code>. Using <code>remove</code> on something that is not in the list (check with <code>in</code> first). Changing a list while a <code>for</code> loop is walking along it.</p>` },
        {
          ex: {
            id: 'sp-5-1', title: 'A numbered list',
            prompt: `<p>Ask for three things (prompt <code>Thing?</code> each time) and add each to a list. Then print the list as a numbered menu, one per line, starting from 1, like <code>1. milk</code>. Then print <code>You have 3 things.</code></p>`,
            starter: `things = []\nfor i in range(3):\n    thing = input("Thing? ")\n    # add it to the list\n\n# print the numbered lines, then the count\n`,
            solution: `things = []\nfor i in range(3):\n    thing = input("Thing? ")\n    things.append(thing)\n\nfor i in range(len(things)):\n    print(str(i + 1) + ". " + things[i])\nprint("You have", len(things), "things.")`,
            hints: ['things.append(thing) inside the first loop.', 'For the numbering, loop over positions: for i in range(len(things)): and print i + 1 and things[i].', 'To get "1. milk" with no space before the dot, join text with +: str(i + 1) + ". " + things[i]. str turns the number into text so it can be joined.'],
            tests: [{ stdin: 'milk\neggs\nbread', expect: '1. milk\n2. eggs\n3. bread\nYou have 3 things.' }, { stdin: 'pen\npaper\nglue', expect: '1. pen\n2. paper\n3. glue\nYou have 3 things.' }],
            failTip: 'If the numbers start at 0, add 1 to i. If there is a space before the dot (1 . milk), you used commas in print instead of + with str(i + 1).'
          }
        },
        {
          ex: {
            id: 'sp-5-2', title: 'Highest and lowest',
            prompt: `<p>Keep asking <code>Score (or stop)?</code> and adding each number to a list until the user types <code>stop</code>. Then print two lines: <code>Highest: </code> followed by the biggest number, and <code>Lowest: </code> followed by the smallest. You can assume at least one score is entered.</p>`,
            starter: `scores = []\nwhile True:\n    answer = input("Score (or stop)? ")\n    if answer == "stop":\n        break\n    # turn the answer into a number and add it to the list\n\n# print Highest: and Lowest:\n`,
            solution: `scores = []\nwhile True:\n    answer = input("Score (or stop)? ")\n    if answer == "stop":\n        break\n    scores.append(int(answer))\n\nprint("Highest:", max(scores))\nprint("Lowest:", min(scores))`,
            hints: ['scores.append(int(answer)): the answer is text, so turn it into a number first, or max will compare words.', 'print("Highest:", max(scores)) and the same with min.'],
            tests: [{ stdin: '12\n40\n7\n33\nstop', expect: 'Highest: 40\nLowest: 7' }, { stdin: '5\nstop', expect: 'Highest: 5\nLowest: 5' }, { stdin: '9\n100\n25\nstop', expect: 'Highest: 100\nLowest: 9' }],
            failTip: 'If 9 comes out higher than 100, the scores were kept as text: text is compared letter by letter, and "9" is after "1". Use int(answer) before appending.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A list is <code>[item, item, item]</code>; <code>add</code> is <code>.append()</code>; <code>length of</code> is <code>len()</code>; <code>contains</code> is <code>in</code>.</li>
<li>Python counts positions from 0: <code>item (1)</code> is <code>[0]</code>, and <code>[-1]</code> is the last. A position past the end is an error.</li>
<li><code>for item in list:</code> visits every item without a counter; <code>for i in range(len(list)):</code> when you need the position too.</li>
<li><code>remove</code>, <code>pop</code>, <code>insert</code>, <code>index</code> and <code>sorted</code> are the rest of the list palette; <code>max</code>, <code>min</code> and <code>sum</code> work on a list of numbers.</li>
<li><code>break</code> leaves a loop at once: a stop sign inside the program.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'My blocks: functions', summary: 'A define block becomes def, its inputs become parameters, a block that reports an answer uses return, and a turtle draws a garden from one flower function.',
      blocks: [
        `<p>In 1949 at Cambridge University a computer called EDSAC began working, one of the first in the world that could store its own program. Writing for it was slow: every program had to be punched onto paper tape, hole by hole, and even printing a number took dozens of instructions. The team noticed that they were punching the same pieces over and over, so a research student called David Wheeler worked out how a program could jump into a saved piece of tape, do the job, and jump back to where it left off. They kept the tapes of saved pieces together and called the collection the library. Nobody at Cambridge wrote "print a number" twice again.</p>
<p>Wheeler's trick is called a <em>subroutine</em>, and every language has it. In Scratch it is the pink <code>define</code> block under My Blocks: you make a block once and use it as many times as you like. In Python it is <code>def</code>, and it is the last big idea of this course.</p>
<h2>Define becomes def</h2>`,
        { fig: 'blocks', stack: [['myblocks', 'define [cheer]'], ['looks', 'say [Hip hip]'], ['looks', 'say [Hooray!]']], python: 'def cheer():\n    print("Hip hip")\n    print("Hooray!")', caption: 'define becomes def, the name is followed by empty brackets and a colon, and the blocks under the hat are indented under it. Defining a function does not run it, just as a define block does nothing until you use the block it defines.' },
        { fig: 'blocks', stack: [['event', 'when green flag clicked'], ['myblocks', 'cheer'], ['myblocks', 'cheer'], ['myblocks', 'cheer']], python: 'cheer()\ncheer()\ncheer()', caption: 'Using the block is calling the function: its name with brackets. Three calls, six lines printed.' },
        { play: `def cheer():
    print("Hip hip")
    print("Hooray!")

cheer()
cheer()
print("Now once more, louder:")
cheer()`, caption: 'The def comes first, then the calls. Try moving the first cheer() above the def: Python complains that cheer is not defined, because it reads from the top and has not met the def yet.' },
        `<div class="stmt"><p><span class="kind">Rule 1.</span> <code>define [name]</code> is <code>def name():</code>. The lines under it are indented. Defining does nothing by itself.</p>
<p><span class="kind">Rule 2.</span> Using the block is <code>name()</code>: the name with brackets. The brackets are what make it run. Define before you call.</p></div>
<h2>Inputs become parameters</h2>
<p>When you make a block in Scratch you can tick "Add an input", and the define block grows a slot that you can drag into the blocks below. In Python the slot is a name inside the brackets, called a <em>parameter</em>, and whatever you put in the brackets when you call the function is what that name means while it runs.</p>`,
        { fig: 'blocks', stack: [['myblocks', 'define [greet] (name)'], ['looks', 'say (join [Hello, ] (name))'], ['looks', 'say [Nice to meet you.]']], python: 'def greet(name):\n    print("Hello,", name)\n    print("Nice to meet you.")', caption: 'The input slot (name) becomes the parameter name in the brackets. Inside the function, name means whatever was passed in.' },
        { play: `def greet(name):
    print("Hello,", name)
    print("Nice to meet you.")

def times_table(n):
    for i in range(1, 6):
        print(n, "x", i, "=", n * i)

greet("Ada")
greet("Linus")
times_table(7)
times_table(12)`, caption: 'Two functions, each used twice with different inputs. The times table exercise from lesson 3 is now a block you can use on any number. A function can have more than one parameter: def rectangle(width, height): takes two, separated by a comma.' },
        `<h2>Reporting an answer: return</h2>
<p>Scratch's round reporter blocks like <code>(pick random)</code> and <code>(length of)</code> give you a value to drop into another block, but Scratch does not let you make your own reporters. Python does, and it is the one truly new thing in this lesson. The word <code>return</code> ends the function and hands a value back to whoever called it. Where you wrote <code>greet("Ada")</code> you can now write <code>x = double(21)</code> and <code>x</code> is 42.</p>`,
        { play: `def double(n):
    return n * 2

def greeting(name):
    return "Hello, " + name + "!"

print(double(21))
x = double(5) + double(6)
print(x)
message = greeting("Zoe")
print(message)
print(greeting("Sam").upper())`, caption: 'A function with return is a reporter: you can print its answer, store it, add two of them, or call another function on it. print shows a value; return hands it back. They look alike at first and are completely different: a function that only prints cannot be used in a sum.' },
        { play: `def grade(score):
    if score >= 90:
        return "A"
    elif score >= 70:
        return "B"
    elif score >= 50:
        return "C"
    else:
        return "Try again"

print(grade(95))
print(grade(71))
print(grade(12))
scores = [88, 95, 43, 70]
for s in scores:
    print(s, "->", grade(s))`, caption: 'return ends the function immediately, so the first true branch is the answer and the rest is never reached. The last loop puts lessons 4, 5 and 6 together: a list, a loop, a function with ifs inside.' },
        `<div class="stmt"><p><span class="kind">Rule 3.</span> The names in the brackets of <code>def</code> are parameters: the block's inputs. When you call the function, the values you give are matched to them in order.</p>
<p><span class="kind">Rule 4.</span> <code>return value</code> ends the function and hands the value back. A function that returns can be used anywhere a value can: in a print, a sum, a condition, or another call. Without a return, the function hands back nothing.</p></div>
<h2>Drawing with functions</h2>
<p>Here is where functions pay off. A square is a loop. A flower is squares turned round a point. A garden is flowers in a row. Each is one function, built from the one before, and the whole program is shorter than the square alone would be if you wrote every flower out.</p>`,
        { play: `import turtle
t = turtle.Turtle()
t.speed(0)

def square(size):
    for i in range(4):
        t.forward(size)
        t.right(90)

def flower(size, petals):
    for i in range(petals):
        square(size)
        t.right(360 / petals)

t.color("purple")
flower(60, 8)
t.penup()
t.forward(150)
t.pendown()
t.color("orange")
flower(40, 12)
turtle.done()`, caption: 'square draws one square of any size; flower calls square petals times, turning 360 / petals each time. Change the numbers: flower(80, 3), flower(30, 36). penup and pendown lift the pen between flowers, like the pen up block.' },
        { play: `import turtle
t = turtle.Turtle()
t.speed(0)

def polygon(sides, size):
    for i in range(sides):
        t.forward(size)
        t.right(360 / sides)

def jump_to(x, y):
    t.penup()
    t.goto(x, y)
    t.pendown()

colours = ["red", "orange", "gold", "green", "blue", "purple"]
x = -170
for i in range(6):
    jump_to(x, 0)
    t.color(colours[i])
    polygon(i + 3, 24)
    x = x + 58
turtle.done()`, caption: 'A triangle, a square, a pentagon and so on, each in a colour from a list. polygon(sides, size) is every shape from lesson 3 in one function; jump_to moves without drawing. Everything in this course is in these twenty lines.' },
        `<details class="reveal"><summary>Puzzle: what does this print? <code>def f(a, b): return a - b</code> then <code>print(f(10, 3), f(3, 10))</code></summary><p><code>7 -7</code>. The values are matched to the parameters in order: in the first call a is 10 and b is 3; in the second, a is 3 and b is 10. Order matters, so name your parameters so that the order is obvious.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Calling a function before its <code>def</code>. Forgetting the brackets when calling: <code>cheer</code> on its own does nothing. Forgetting the colon or the indenting under <code>def</code>. Printing inside the function when you needed <code>return</code>, so that <code>x = f(3)</code> leaves x empty (Python calls it <code>None</code>). Giving the wrong number of values when calling. Writing <code>return</code> inside a <code>for</code> loop and wondering why it stops after one time round.</p>` },
        {
          ex: {
            id: 'sp-6-1', title: 'A greeting block',
            prompt: `<p>Write a function <code>greeting(name)</code> that <em>returns</em> (not prints) the text <code>Hello, </code> followed by the name and an exclamation mark: <code>greeting("Ada")</code> gives <code>Hello, Ada!</code>. Then write <code>shout(word)</code> that returns the word in capital letters followed by <code>!</code>: <code>shout("go")</code> gives <code>GO!</code>. (<code>word.upper()</code> gives the capitals.)</p>`,
            starter: `def greeting(name):\n    # return "Hello, " joined with the name and "!"\n\ndef shout(word):\n    # return the word in capitals with a ! on the end\n`,
            solution: `def greeting(name):\n    return "Hello, " + name + "!"\n\ndef shout(word):\n    return word.upper() + "!"`,
            hints: ['return "Hello, " + name + "!": join the three pieces of text with +.', 'return word.upper() + "!"', 'If the check says it got None, you printed instead of returning.'],
            tests: [{ call: 'greeting("Ada")', expect: "'Hello, Ada!'" }, { call: 'greeting("Linus")', expect: "'Hello, Linus!'" }, { call: 'shout("go")', expect: "'GO!'" }, { call: 'shout("Hooray")', expect: "'HOORAY!'" }],
            failTip: 'The checker calls your functions and looks at what they return. None means the function printed or returned nothing: use return. Check the comma and the space in "Hello, ".'
          }
        },
        {
          ex: {
            id: 'sp-6-2', title: 'Biggest of three',
            prompt: `<p>Write a function <code>biggest(a, b, c)</code> that returns the largest of three numbers, and a function <code>describe(n)</code> that returns <code>"even"</code> if the number is even and <code>"odd"</code> otherwise. (A number is even if <code>n % 2 == 0</code>: the <code>%</code> block is the remainder, Scratch's <code>mod</code>.) Do not use <code>max</code>: write the ifs yourself.</p>`,
            starter: `def biggest(a, b, c):\n    # compare them with if and elif, and return the largest\n\ndef describe(n):\n    # return "even" or "odd"\n`,
            solution: `def biggest(a, b, c):\n    if a >= b and a >= c:\n        return a\n    elif b >= c:\n        return b\n    else:\n        return c\n\ndef describe(n):\n    if n % 2 == 0:\n        return "even"\n    else:\n        return "odd"`,
            mustNotContain: [{ re: /\bmax\s*\(/, msg: 'Write the comparison yourself with if and elif; max is what you are learning to write.' }],
            hints: ['If a is at least as big as both b and c, return a. Otherwise the biggest is b or c: return b if b >= c, else c.', 'describe: if n % 2 == 0: return "even" and else: return "odd".'],
            tests: [{ call: 'biggest(3, 9, 5)', expect: '9' }, { call: 'biggest(10, 2, 4)', expect: '10' }, { call: 'biggest(1, 2, 8)', expect: '8' }, { call: 'biggest(7, 7, 7)', expect: '7' }, { call: 'biggest(-5, -2, -9)', expect: '-2' }, { call: 'describe(4)', expect: "'even'" }, { call: 'describe(7)', expect: "'odd'" }, { call: 'describe(0)', expect: "'even'" }],
            failTip: 'Check each test the checker shows: if biggest(7, 7, 7) returns None, a case with equal numbers slipped through every if; use >= rather than >.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li><code>define [name]</code> is <code>def name():</code>; using the block is <code>name()</code>. Define first, call after.</li>
<li>Inputs are parameters, the names in the brackets; the values you call with are matched to them in order.</li>
<li><code>return</code> hands a value back, so your function becomes a reporter block, something Scratch could not do. <code>print</code> shows; <code>return</code> gives.</li>
<li>Build big things from small functions: a square, then a flower made of squares, then a garden made of flowers.</li>
<li>You have now met every block in this course as a line of Python. <em>Introduction to Python</em> (SC 101) takes it from here.</li>
</ul></div>`
      ]
    }
  ]
});
