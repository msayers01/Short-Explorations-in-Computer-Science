// Lesson content, (c) 2026 Michael Sayers, licensed CC BY-SA 4.0 (see LICENSE-CONTENT.md).
// From Scratch to Python: for students who know Scratch. Every idea is introduced as the block they know, drawn beside the Python
// that does the same (widgets.js: blocks), and the sprite becomes a turtle. Python runs in Skulpt; examples that draw run in a
// sandboxed frame inside the lesson (app.js: playgroundBlock, usesTurtle).
window.COURSES = window.COURSES || [];
window.COURSES.push({
  id: 'scratch', code: 'SC 100', short: 'Scratch', lang: 'python', status: 'developing', readingWpm: 110,
  title: 'From Scratch to Python',
  grades: 'Grades 5–8 · after Scratch',
  audience: `<p><b>Grades 5–8</b>, for anyone who has made a few projects in Scratch and wants to see what the grown-up programmers are typing. If you can make a sprite say hello, keep a score and use a <em>repeat</em> block, you already know most of what this course teaches. What changes is that you type the words instead of dragging the blocks.</p><p>Each lesson is short, and most of the programs draw or talk. The course is being written: the first three lessons are here.</p>`,
  tagline: 'The blocks you know, one line of Python each: say, ask, variables, repeat and forever, and a sprite that becomes a turtle.',
  description: `<p>In Scratch you build a program by snapping blocks together. In Python you build the same program by typing a line for each block. That is honestly the whole difference. <code>say [Hello!]</code> becomes <code>print("Hello!")</code>. <code>repeat (10)</code> becomes <code>for i in range(10):</code>. <code>move (10) steps</code> becomes <code>turtle.forward(10)</code>, and the sprite, which Python calls a turtle, moves.</p>
<p>Every page in this course shows the blocks you already know on the left and the Python that does the same job on the right. You press Run, the program runs or draws right here on the page, and you change it and run it again. The exercises check your answers the way Scratch never could: by running your program and reading what it printed.</p>
<p>By the end you will type Python the way you snap blocks: without thinking about it. Then <em>Introduction to Python</em> (SC 101) picks up where this course leaves off.</p>`,
  outcomes: [
    'Turn the Scratch blocks you know (say, ask, set, change, repeat, forever, move, turn) into lines of Python',
    'Read an error message, find the line it names, and fix the typo',
    'Keep a score in a variable and change it as a program runs',
    'Use repeat and forever as loops, and make a turtle draw shapes with them',
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
    }
  ]
});
