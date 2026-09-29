// Lesson content, (c) 2026 Michael Sayers, licensed CC BY-SA 4.0 (see LICENSE-CONTENT.md).
window.COURSES = window.COURSES || [];
window.COURSES.push({
  id: 'cpp', code: 'SC 103', short: 'C++', lang: 'cpp',
  title: 'Introduction to C++',
  grades: 'Grades 10–12 · after Python, or with some experience',
  audience: `<p><b>Grades 10–12</b>, after the Python course or a semester of any language. Best for students who want to know what the computer is actually doing, and for anyone headed toward engineering, game development, robotics, or an AP computer science class. Expect more typing and stricter rules than Python; the payoff is understanding memory and speed.</p><p>Each lesson is a self-contained Hour of Code activity.</p>`,
  tagline: 'Types, memory, functions and pointers: how programs look when nothing is hidden from you.',
  description: `<p>C++ is the language of operating systems, game engines, browsers, and the interpreters that run the other two courses on this site. It is fast because it hides almost nothing: you say what type every value has, you know how many bytes it takes up, and you can hold the address of anything in memory. That makes it more demanding than Python. It also makes it the best language for understanding what a computer is really doing.</p>
<p>If you have done the Python course, every idea here will be familiar and every line will look different. The code on these pages runs in a small C++ interpreter built into the site, so you can experiment freely. It understands the core of the language (types, control flow, functions, arrays, pointers, character strings) but not the standard library's containers or classes, and each lesson says when a real compiler would behave differently. By the end you will have written a sorting routine, a binary search, a simulation, and a prime sieve in the language they were first written in.</p>`,
  outcomes: [
    'Explain what a compiler does and read its error messages',
    'Declare typed variables and reason about their size and behaviour',
    'Write conditions, loops and functions in C++ syntax',
    'Explain what a pointer is, and use one to let a function change the caller\u2019s variables',
    'Use arrays and character strings safely',
    'Implement selection sort, binary search, a Monte Carlo simulation and the Sieve of Eratosthenes'
  ],
  howItWorks: `<h3>How to use these pages</h3><p>Each lesson has runnable code. Press <b>Run</b> and read the output; change something and run again. Exercises are checked by running your program on hidden inputs, so read the expected output carefully. Your work is saved in this browser.</p><p>Each lesson stands on its own as an <b>Hour of Code</b> activity: read, run, predict, and finish the two exercises in about 45–60 minutes. A lesson likely to take longer is marked in the list below and at the top of the lesson.</p><p><b>The interpreter here is deliberately small.</b> It has no <code>std::string</code>, <code>vector</code>, classes or references (<code>int&amp;</code>). Programs that stick to the features taught in these lessons will compile unchanged with g++ or clang.</p>`,
  lessons: [
    /* ================================================================== */
    {
      title: 'Hello, C++', summary: 'What a compiler does, the rules every C++ line follows, and why a variable must have a type before it has a value.',
      blocks: [
        `<p>In 1979, Bjarne Stroustrup, a Danish computer scientist at Bell Labs in New Jersey, started adding new features to the language C, which his colleagues had created a few years earlier to write the Unix operating system. He called the result "C with Classes". In 1983 it was renamed C++, a programmer's joke: in C, <code>++</code> means "add one", so C++ is "one more than C". Today it runs underneath web browsers, game engines, and the software on space probes.</p>
<p>You already know Python. C++ has the same ideas underneath: values, names, decisions, loops, functions. What changes is how much the language makes you say, and when your mistakes are caught. C++ is the language of operating systems, game engines and browsers, and it earns that place by letting the programmer control exactly what the machine does. The price is ceremony. This lesson is about reading the ceremony so it stops looking like noise.</p>
<h2>The first program</h2>
<p>Here is the traditional first program. It is seven lines where Python needed one. Run it, then read the table below it, which takes it apart line by line.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, world!" << endl;
    return 0;
}`, caption: 'Change the message and run again. Then read on before changing anything else.' },
        `<div class="tbl-wrap"><table>
<tr><th>line</th><th>what it does</th></tr>
<tr><td><code>#include &lt;iostream&gt;</code></td><td>Brings in the part of the standard library that knows how to print and read. In C++ nothing is available until you ask for it.</td></tr>
<tr><td><code>using namespace std;</code></td><td>Lets you write <code>cout</code> instead of its full name, <code>std::cout</code>. Fine for programs this size.</td></tr>
<tr><td><code>int main() {</code></td><td>The beginning of <code>main</code>, the function where every C++ program starts. The <code>int</code> says it will hand back a whole number when it finishes.</td></tr>
<tr><td><code>cout &lt;&lt; "Hello, world!" &lt;&lt; endl;</code></td><td>Sends text to the screen. Read <code>&lt;&lt;</code> as an arrow pointing at <code>cout</code>, the console output. <code>endl</code> ends the line.</td></tr>
<tr><td><code>return 0;</code></td><td>Hands back 0 to the operating system, which by convention means "all went well".</td></tr>
<tr><td><code>}</code></td><td>The end of <code>main</code>.</td></tr>
</table></div>
<h2>The rules every line follows</h2>
<p>In Python lesson 2 you learned that Python reads a program by a small set of rules. C++ has its own, and they are different in ways that trip up everyone who arrives from Python.</p>
<div class="stmt"><p><span class="kind">Rule 1.</span> Every statement ends with a semicolon. Line breaks mean nothing to C++; the semicolon is what ends a statement.</p>
<p><span class="kind">Rule 2.</span> Braces <code>{ }</code> group statements into a block. Indentation is for people; the braces are for the compiler.</p>
<p><span class="kind">Rule 3.</span> Capitals count. <code>cout</code>, <code>Cout</code> and <code>COUT</code> are three different names, and only the first exists.</p>
<p><span class="kind">Rule 4.</span> Text goes in double quotes <code>"like this"</code>; a single character goes in single quotes <code>'A'</code>. They are not interchangeable.</p>
<p><span class="kind">Rule 5.</span> Anything after <code>//</code> to the end of the line is a comment, ignored by the compiler.</p></div>
<p>Rules 1 and 2 together are why C++ code can be laid out freely: the program above would run identically with all seven lines on one line. Do not do that. Lay code out for the reader, one statement per line, blocks indented, exactly as Python forced you to.</p>
<h2>What a compiler does</h2>
<p>Python reads your program one line at a time and carries out each line as it reaches it. C++ does not work that way. A separate program, the <em>compiler</em>, reads your whole source file first, checks every line against the rules and against the types of everything, and translates the whole thing into instructions the processor runs directly. It is that translated program that runs. Python's interpreter is not in the loop, which is why C++ programs are fast.</p>`,
        { fig: 'pipeline', caption: 'Source file → compiler → executable → processor. The compiler refuses to translate a program it cannot understand, so many mistakes are caught before anything runs.' },
        `<p>Two consequences matter today. First, a mistake in the rules stops the whole program before it starts: the compiler reports it and produces nothing. Second, the compiler needs to know the <em>type</em> of every value in advance, because it is deciding, at translation time, how much memory each thing needs and what each operation means. That is the subject of the next section.</p>
<p>(On this site an interpreter stands in for the compiler, so you can press Run and see the result at once. It applies the same rules and reports the same kinds of error at the same moments. Try it now: delete the semicolon after <code>endl</code> in the first program and run. The message says <em>Syntax error near line 6</em>, one line <em>after</em> the mistake: the compiler reached the next line still waiting for the semicolon.)</p>
<h2>Types</h2>
<p>In Python a name can hold anything, and the interpreter checks what it is each time it is used. In C++ every variable has a type, fixed when the variable is created, and the compiler uses the type to reserve the right number of bytes and to decide what <code>+</code>, <code>/</code> and <code>&lt;&lt;</code> mean for it. Four types cover nearly everything in this course.</p>
<div class="tbl-wrap"><table>
<tr><th>type</th><th>holds</th><th>size</th><th>example</th></tr>
<tr><td><code>int</code></td><td>whole numbers from about −2 billion to +2 billion</td><td>4 bytes</td><td><code>int count = 0;</code></td></tr>
<tr><td><code>double</code></td><td>numbers with a fractional part, about 15 significant digits</td><td>8 bytes</td><td><code>double price = 9.99;</code></td></tr>
<tr><td><code>char</code></td><td>one character</td><td>1 byte</td><td><code>char grade = 'A';</code></td></tr>
<tr><td><code>bool</code></td><td><code>true</code> or <code>false</code></td><td>1 byte</td><td><code>bool done = false;</code></td></tr>
</table></div>
<div class="stmt"><p><span class="kind">Rule 6 (declaration).</span> A variable is created by writing its type, then its name, then optionally <code>=</code> and a starting value, then a semicolon: <code>int apples = 7;</code>. This is called <em>declaring</em> the variable. A name must be declared before it is used, and its type never changes afterwards.</p></div>
<p>After the declaration, assignment looks just like Python: <code>apples = apples + 3;</code> works out the right side and stores it in <code>apples</code>. What you may not do is write <code>apples = 7;</code> without a declaration first (the compiler says <em>variable apples does not exist</em>), or declare the same name twice in one block.</p>`,
        { fig: 'memory', caption: 'Each square is one byte. A char takes one, an int four, a double eight. The compiler lays variables out like this in advance, which is why it must know every type before the program runs.' },
        { play: `#include <iostream>
using namespace std;

int main() {
    int apples = 7;
    double price = 0.5;
    char initial = 'A';
    bool ripe = true;

    cout << apples * price << endl;
    cout << initial << " " << (int) initial << endl;   // a char is really a small number
    cout << ripe << endl;                              // a bool prints as 1 or 0
    apples = apples + 3;
    cout << apples << endl;
    return 0;
}`, caption: 'Four declarations, then some use. Line 11 shows a char\u2019s hidden number: the letter A is stored as 65. Try changing initial to \u0027a\u0027. Then press Step through memory: each variable appears as its line runs, with its type, its address and its size in bytes.' },
        `<details class="reveal"><summary>Predict: what happens if you declare <code>int n;</code> with no starting value, and print it?</summary><p>You get whatever bytes happened to be in that memory: a meaningless number. C++ does not set a new variable to zero for you. Here it prints <code>-858993460</code>, a pattern this interpreter uses to mark memory nobody has written to. Always give a variable a starting value when you declare it, unless the very next line assigns one.</p></details>
<h2>Printing</h2>
<p><code>cout</code> takes a chain of things separated by <code>&lt;&lt;</code> and prints them one after another with <strong>nothing</strong> between them. This is different from Python's <code>print</code>, which puts spaces between its arguments. If you want a space, print one: <code>cout &lt;&lt; a &lt;&lt; " " &lt;&lt; b;</code>. A line ends only when you send <code>endl</code>. Predict the output before running.</p>
<details class="reveal"><summary>My prediction</summary><p>Line 1 prints <code>56</code> on one line, because nothing separates the 5 and the 6. Line 2 prints <code>5 6</code>. Line 3 prints <code>Total: 11</code>, then the line ends.</p></details>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    cout << 5 << 6 << endl;
    cout << 5 << " " << 6 << endl;
    cout << "Total: " << 5 + 6 << endl;
    return 0;
}`, caption: 'Three chains. Note that 5 + 6 was calculated before printing: arithmetic happens first, then the result is sent along.' },
        `<h2>Integer arithmetic</h2>
<p>Because the compiler knows every type, it decides what an operator means from the types of its operands. For <code>/</code> this has a consequence that surprises everyone exactly once.</p>
<div class="stmt"><p><span class="kind">Rule 7 (integer division).</span> When both operands of <code>/</code> are <code>int</code>, the result is an <code>int</code>: the whole-number part of the quotient, with the remainder thrown away. If either operand is a <code>double</code>, the result is a <code>double</code>. The remainder is given by <code>%</code>, which works on <code>int</code>s only.</p></div>
<p>So <code>7 / 2</code> is 3, not 3.5, and this is decided by the operands alone, <em>before</em> the result is stored anywhere. Storing it in a <code>double</code> afterwards does not bring the .5 back. Predict all five lines.</p>
<details class="reveal"><summary>My predictions</summary><p><code>3</code>, <code>1</code>, <code>3.5</code>, <code>3.5</code>, then <code>3 3</code>. The last is the trap: <code>y</code> is a double, but <code>7 / 2</code> was computed as ints first, giving 3, and only then converted to 3.0 for storage. To get 3.5, one operand must be a double: <code>7 / 2.0</code> or <code>7.0 / 2</code>.</p></details>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    cout << 7 / 2 << endl;        // int / int
    cout << 7 % 2 << endl;        // the remainder
    cout << 7 / 2.0 << endl;      // one double is enough
    cout << 7.0 / 2 << endl;
    int x = 7 / 2;                // x is an int, so 3
    double y = 7 / 2;             // still 3: the division happened first, as ints
    cout << x << " " << y << endl;
    return 0;
}`, caption: 'Change line 10 to  double y = 7 / 2.0;  and run again.' },
        `<p>Integer division is not a defect; it is the tool for the same jobs it does in Python with <code>//</code>. <code>total / 60</code> is the number of whole minutes in <code>total</code> seconds, and <code>total % 60</code> is what is left over. Both exercises below rely on this pair.</p>
<h2>Reading input</h2>
<p><code>cin &gt;&gt; variable</code> reads a value typed by the person and stores it in the variable, converting the text according to the variable's type. Read the arrows as pointing from <code>cin</code>, the console input, into the variable. There is no <code>int()</code> to remember, because the declaration already said what type the variable is. Chaining reads several values; spaces or new lines separate them.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cout << "Two numbers: ";
    cin >> a >> b;
    cout << a << " + " << b << " = " << a + b << endl;
    return 0;
}`, stdin: '12 30', caption: 'On this site a C++ program reads its input from the box shown beneath it. Change the two numbers there and run. Line 5 declares two ints in one statement.' },
        `<h2>Before the exercises</h2>
<p>Each exercise reads numbers, computes something, and prints lines in an exact format. The tests compare your output character by character, so <code>Area: 12</code> and <code>Area:12</code> are different answers. Here is a program of the same shape, worked in full: read a number of days and print the hours.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    int days;
    cin >> days;
    int hours = days * 24;
    cout << days << " days is " << hours << " hours" << endl;
    return 0;
}`, stdin: '3', caption: 'Three steps: declare and read, compute into a named variable, print a chain with the spaces written explicitly. Output for 3: "3 days is 72 hours".' },
        `<p>Look at the spaces inside the quoted pieces: <code>" days is "</code> has a space at each end, because <code>cout</code> adds none. Your exercises follow the same three steps.</p>`,
        `<details class="reveal"><summary>Puzzle: in C++, what do <code>7 / 2</code>, <code>7.0 / 2</code> and <code>7 % 2</code> give?</summary><p><code>3</code>, <code>3.5</code> and <code>1</code>. When both numbers are <code>int</code>s, <code>/</code> is integer division and throws the fraction away; if either is a <code>double</code>, the division keeps it. <code>%</code> gives the remainder. The same program in Python would print 3.5 for <code>7 / 2</code>: one of the first places where the two languages part ways.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> A missing semicolon: the error often points at the <em>next</em> line, because that is where the compiler noticed. Forgetting <code>#include &lt;iostream&gt;</code>, after which <code>cout</code> "does not exist". Using a variable without declaring it, or declaring it without a starting value. Writing <code>'</code> and <code>"</code> interchangeably: <code>'A'</code> is a char, <code>"A"</code> is text. Expecting <code>7 / 2</code> to be 3.5. Forgetting that <code>cout</code> puts no spaces between the things it prints.</p>` },
        {
          ex: {
            id: 'cp-1-1', title: 'A rectangle',
            prompt: `<p>Read two whole numbers, the width and height of a rectangle, and print its area and perimeter on two lines in exactly this form:</p><pre class="code">Area: 12\nPerimeter: 14</pre><p>(That is the output for width 3 and height 4.)</p>`,
            starter: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int width, height;\n    cin >> width >> height;\n    // your code here\n    return 0;\n}`,
            solution: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int width, height;\n    cin >> width >> height;\n    cout << "Area: " << width * height << endl;\n    cout << "Perimeter: " << 2 * (width + height) << endl;\n    return 0;\n}`,
            sampleStdin: '3 4',
            hints: ['Area is width * height; the perimeter is 2 * (width + height).', 'Chain cout: cout << "Area: " << width * height << endl; Note the space after the colon inside the quotes.'],
            tests: [{ stdin: '3 4', expect: 'Area: 12\nPerimeter: 14' }, { stdin: '10 10', expect: 'Area: 100\nPerimeter: 40' }, { stdin: '1 250', expect: 'Area: 250\nPerimeter: 502' }],
            failTip: 'The output must match exactly: capital A, a colon, one space, then the number, then a new line.'
          }
        },
        {
          ex: {
            id: 'cp-1-2', title: 'Seconds to hours, minutes, seconds',
            prompt: `<p>Read a number of seconds and print it as hours, minutes and seconds. For 3725, print <code>1 hours 2 minutes 5 seconds</code> on one line. Integer division and <code>%</code> are all you need; give each of the three quantities its own named variable.</p>`,
            starter: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int total;\n    cin >> total;\n    // your code here\n    return 0;\n}`,
            solution: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int total;\n    cin >> total;\n    int hours = total / 3600;\n    int minutes = (total % 3600) / 60;\n    int seconds = total % 60;\n    cout << hours << " hours " << minutes << " minutes " << seconds << " seconds" << endl;\n    return 0;\n}`,
            sampleStdin: '3725',
            hints: ['hours = total / 3600: integer division throws away the part of an hour that is left.', 'What is left after the whole hours is total % 3600; divide that by 60 for the minutes.', 'seconds = total % 60. Then print the six pieces in one chain, with the spaces inside the quotes.'],
            tests: [{ stdin: '3725', expect: '1 hours 2 minutes 5 seconds' }, { stdin: '59', expect: '0 hours 0 minutes 59 seconds' }, { stdin: '86399', expect: '23 hours 59 minutes 59 seconds' }, { stdin: '7200', expect: '2 hours 0 minutes 0 seconds' }],
            followup: 'Notice the pattern: divide to find how many whole units, then take the remainder to find what is left for the next smaller unit. It works for any set of units: weeks and days, dollars and cents, feet and inches.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A compiler checks and translates the whole program before it runs, so mistakes in the rules are caught before anything happens.</li>
<li>Statements end with <code>;</code>, braces make blocks, capitals count, <code>"text"</code> and <code>'c'</code> are different, <code>//</code> starts a comment.</li>
<li>Every variable is declared with a type that never changes: <code>int</code>, <code>double</code>, <code>char</code>, <code>bool</code>. Declare before use, and give a starting value.</li>
<li><code>int / int</code> throws away the remainder; <code>%</code> keeps it. <code>cout &lt;&lt;</code> prints with no spaces of its own; <code>cin &gt;&gt;</code> reads, converting by type.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Making decisions', summary: 'Comparisons and bool, if and else, combining conditions, and the traps that C++ accepts but Python would refuse.',
      blocks: [
        `<p>In February 2014 Apple rushed out an urgent update for iPhones and Macs. In the code that checked whether a secure website was genuine, one line had accidentally been written twice, directly after an <code>if</code> with no braces. The second copy was not part of the <code>if</code>, whatever the indentation suggested, so it ran every time and skipped the rest of the check. For over a year, devices had accepted fake certificates. Programmers called it the "goto fail" bug, after the duplicated line. This lesson covers <code>if</code> in C++, and that exact trap.</p>
<p>Every program in Lesson 1 did the same thing each time it ran. A program that <em>decides</em>, doing one thing for some inputs and something else for others, needs two ingredients: a way to ask a yes-or-no question, and a way to choose what to run from the answer. You know both from Python. This lesson gives the C++ rules for each, and then the traps that exist only in C++, because C++ accepts some things that Python refuses.</p>
<h2>Asking a question: comparisons and bool</h2>
<div class="stmt"><p><span class="kind">Rule (comparisons).</span> The six comparison operators are <code>==</code> (equal), <code>!=</code> (not equal), <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code> and <code>&gt;=</code>. Each compares two values and produces a value of type <code>bool</code>: <code>true</code> or <code>false</code>.</p>
<p><span class="kind">Rule (bool and numbers).</span> A <code>bool</code> printed with <code>cout</code> appears as <code>1</code> for true and <code>0</code> for false. In the other direction, a number used where a <code>bool</code> is expected counts as false if it is 0 and as true otherwise.</p></div>
<p>The second rule has no counterpart you would notice in Python, and it is behind both traps later in this lesson. For now, predict the four lines this program prints. The parentheses around each comparison are required; the caption explains why.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    int x = 7;
    bool small = x < 10;
    cout << small << endl;
    cout << (x == 7) << " " << (x != 7) << endl;
    cout << (x >= 8) << endl;
    return 0;
}`, caption: 'Output: 1, then 1 0, then 0. The parentheses are needed because << is applied before ==: without them, cout << x == 7 would mean (cout << x) == 7, which compares the output stream with 7, and a real compiler rejects it.' },
        `<p>Line 6 stores the answer to a question in a variable, exactly as Lesson 1 stored a number in an <code>int</code>. A comparison is an expression with a value like any other; the type of that value is <code>bool</code>.</p>
<h2>Choosing: if and else</h2>
<div class="stmt"><p><span class="kind">Rule (if).</span> <code>if (<i>condition</i>) { <i>statements</i> }</code> runs the statements in the braces when the condition is true and skips them when it is false. The parentheses around the condition are required.</p>
<p><span class="kind">Rule (else).</span> An <code>if</code> may be followed by <code>else { <i>statements</i> }</code>, which runs exactly when the condition was false. So exactly one of the two blocks runs.</p>
<p><span class="kind">Rule (else if).</span> <code>else if</code> is not a new keyword: it is an <code>else</code> whose body is another <code>if</code>. In a chain of them the conditions are tested from the top, and the block of the <em>first</em> true condition runs. Everything after it in the chain is skipped, even if later conditions are also true.</p></div>
<p>Side by side with Python: parentheses replace the colon, braces replace the indentation, and <code>else if</code> is written out where Python writes <code>elif</code>. As Lesson 1 said, the braces are what the compiler reads. Indent anyway; the indentation is for the next person to read your code, who is usually you.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    int temperature;
    cin >> temperature;
    if (temperature > 30) {
        cout << "hot" << endl;
    } else if (temperature > 15) {
        cout << "pleasant" << endl;
    } else {
        cout << "cold" << endl;
    }
    cout << "done" << endl;
    return 0;
}`, stdin: '22', caption: 'Change the input to 35 and to 3. Exactly one of the three branches runs each time; the last line is not part of the chain and runs every time.' },
        `<p>Follow it for 22. The first condition, 22 &gt; 30, is false, so its block is skipped. The second, 22 &gt; 15, is true, so <code>pleasant</code> is printed, and the final <code>else</code> is skipped without being looked at. Notice that the second condition does not need to say "and not above 30": it is only ever tested when the first one was false.</p>
<details class="reveal"><summary>Predict: swap the first two tests, so the chain asks <code>temperature &gt; 15</code> first and <code>temperature &gt; 30</code> second. What does 35 print?</summary><p><code>pleasant</code>. 35 &gt; 15 is true, the first true condition wins, and the rest of the chain is skipped. In fact the <code>hot</code> branch can now never run: any temperature above 30 is also above 15 and is caught first. When conditions overlap, put the most demanding one first.</p></details>
<h2>Combining conditions</h2>
<div class="stmt"><p><span class="kind">Rule (and, or, not).</span> <code>a &amp;&amp; b</code> is true when both are true; <code>a || b</code> is true when at least one is true; <code>!a</code> is true when <code>a</code> is false. Without parentheses, <code>!</code> is applied first, then comparisons, then <code>&amp;&amp;</code>, then <code>||</code>.</p>
<p><span class="kind">Rule (short circuit).</span> <code>&amp;&amp;</code> and <code>||</code> evaluate their left side first, and skip the right side when the left side has already decided the answer: false <code>&amp;&amp;</code> anything is false, and true <code>||</code> anything is true.</p></div>
<p>These are Python's <code>and</code>, <code>or</code> and <code>not</code> with different spellings, and one difference in behaviour: <code>!</code> binds more tightly than a comparison, where Python's <code>not</code> binds more loosely. So Python's <code>not x &gt; 5</code> must be written <code>!(x &gt; 5)</code> in C++. Without the parentheses, <code>!x &gt; 5</code> means <code>(!x) &gt; 5</code>, which compares 0 or 1 with 5. Predict the four lines.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    int x = 7;
    cout << (x >= 3 && x <= 10) << endl;        // between 3 and 10
    cout << (x % 2 == 0 || x % 3 == 0) << endl; // even, or a multiple of 3
    cout << !(x > 5) << endl;
    int d = 0;
    cout << (d != 0 && 10 / d > 2) << endl;     // the division never happens
    return 0;
}`, caption: 'Output: 1, 0, 0, 0. The last line would divide by zero, but d != 0 is false, so && already knows the answer and never evaluates 10 / d. Change && to & on that line to see what short-circuiting saved you from.' },
        `<p>That last line is a common and useful pattern: put the test that makes the rest safe on the left of <code>&amp;&amp;</code>.</p>
<p>One Python habit fails silently. Python lets you write a range test as <code>3 &lt;= x &lt;= 10</code>. C++ accepts the same characters but reads them by its own rules, one comparison at a time from the left: <code>(3 &lt;= x) &lt;= 10</code>. The part in parentheses is a <code>bool</code>, which counts as 0 or 1, and both 0 and 1 are at most 10. So the whole test is true for every <code>x</code>.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    int x = 50;
    cout << (3 <= x <= 10) << endl;         // looks right, is wrong
    cout << (3 <= x && x <= 10) << endl;    // what was meant
    return 0;
}`, caption: 'The first line prints 1 although 50 is not between 3 and 10, and the compiler gives no error. Only a person can catch this one. Always split a range test into two comparisons joined by &&.' },
        `<h2>Two traps</h2>
<p>These two have caught everyone who has written C++, so meet them now on purpose. Both compile, and both run.</p>
<p><b>One equals sign.</b> <code>if (x = 5)</code> is an <em>assignment</em>, not a comparison. It stores 5 in <code>x</code>, and the value of the assignment is the 5 just stored, which by the rule on bool and numbers counts as true. So the branch always runs, and <code>x</code> has been changed as a side effect. Python refuses to compile this; C++ does not. In a condition, always <code>==</code>.</p>
<p><b>Missing braces.</b> The braces may be left out when a branch is a single statement. But the branch is then exactly one statement, whatever the indentation says. If you later add a second indented line without adding braces, only the first line belongs to the <code>if</code>, and the second runs every time.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    int x = 3;
    if (x = 5) {
        cout << "x is now " << x << endl;   // runs, and x has changed
    }

    int score = 40;
    if (score >= 50)
        cout << "passed" << endl;
        cout << "well done" << endl;         // NOT inside the if, despite the indentation
    return 0;
}`, caption: 'Both bugs compile and run: the first block runs although x was 3, and "well done" prints for a score of 40. Fix them: == on line 6, and braces around the two lines at the bottom.' },
        `<details class="reveal"><summary>Predict: what does this print? <code>int a = 5; if (a &gt; 3 &amp;&amp; a &lt; 4) cout &lt;&lt; "A"; else cout &lt;&lt; "B";</code></summary><p><code>B</code>. No whole number is both greater than 3 and less than 4, so the condition is false. (An <code>if</code> and <code>else</code> without braces are legal when each branch is one statement; they are just risky to edit later.)</p></details>
<h2>Characters are numbers</h2>
<div class="stmt"><p><span class="kind">Rule (characters).</span> A <code>char</code> is stored as a small whole number, its character code, and comparing chars compares their codes. The codes of <code>'a'</code> to <code>'z'</code> are consecutive (97 to 122), and so are those of <code>'A'</code> to <code>'Z'</code> (65 to 90) and of the digits <code>'0'</code> to <code>'9'</code> (48 to 57).</p></div>
<p>Because the letters are consecutive, "is this a lower-case letter?" is a range test, <code>c &gt;= 'a' &amp;&amp; c &lt;= 'z'</code>, and arithmetic tells you where a character sits in its range: <code>c - 'a'</code> is 0 for <code>'a'</code>, 1 for <code>'b'</code>, and so on. You never need to memorise the codes themselves.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    char c;
    cin >> c;
    if (c >= 'a' && c <= 'z') {
        cout << "lower case, position " << c - 'a' + 1 << " in the alphabet" << endl;
    } else if (c >= 'A' && c <= 'Z') {
        cout << "upper case; lower is " << (char)(c + 32) << endl;
    } else if (c >= '0' && c <= '9') {
        cout << "a digit worth " << c - '0' << endl;
    } else {
        cout << "something else" << endl;
    }
    return 0;
}`, stdin: 'g', caption: "Try G, 7 and ?. Subtracting '0' from a digit character gives its numeric value: '7' - '0' is 7. The (char) in line 10 prints the number c + 32 as a character rather than as a number." },
        `<h2>switch</h2>
<p>When one value is compared against a list of specific constants, C++ has a second way to choose.</p>
<div class="stmt"><p><span class="kind">Rule (switch).</span> <code>switch (<i>expression</i>) { case <i>constant</i>: … }</code> evaluates the expression once, jumps to the <code>case</code> label with the matching value, or to <code>default:</code> if none matches, and runs from there until a <code>break</code> or the closing brace. The labels must be constants such as <code>3</code> or <code>'q'</code>, not ranges or conditions.</p></div>
<p>Read the rule's last clause carefully: "runs from there until a <code>break</code>". A <code>case</code> label is only a place to start. Leave out a <code>break</code> and execution runs straight on into the next case, which is called <em>fall-through</em>; it is occasionally useful and usually a bug.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    int day = 3;
    switch (day) {
        case 1: cout << "Monday" << endl; break;
        case 2: cout << "Tuesday" << endl; break;
        case 3: cout << "Wednesday" << endl; break;
        default: cout << "some other day" << endl;
    }
    return 0;
}`, caption: 'Remove the break after "Tuesday" and set day to 2: both Tuesday and Wednesday print. Because labels must be constants, a switch cannot express "score >= 90"; an else if chain can.' },
        `<h2>Before the exercises</h2>
<p>Both exercises read a number and print one of a few answers. The first needs a single condition built from <code>%</code>, <code>&amp;&amp;</code> and <code>||</code>; the second needs an <code>else if</code> chain in the right order. Here is a worked example that needs both skills. Read a number and print <code>Fizz</code> if it is a multiple of 3, <code>Buzz</code> if it is a multiple of 5, <code>FizzBuzz</code> if it is a multiple of both, and the number itself otherwise.</p>
<p>Plan in words first. "A multiple of 3" is <code>n % 3 == 0</code>: dividing leaves no remainder. "A multiple of both" is <code>n % 3 == 0 &amp;&amp; n % 5 == 0</code>. The order of the chain matters, because the conditions overlap: 15 is a multiple of 3, so a chain that tested for 3 first would print <code>Fizz</code> for 15 and never reach the "both" case. The most demanding test goes first.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    if (n % 3 == 0 && n % 5 == 0) {
        cout << "FizzBuzz" << endl;
    } else if (n % 3 == 0) {
        cout << "Fizz" << endl;
    } else if (n % 5 == 0) {
        cout << "Buzz" << endl;
    } else {
        cout << n << endl;
    }
    return 0;
}`, stdin: '15', caption: 'Try 9, 10, 15 and 7. Then move the FizzBuzz test to the bottom of the chain, just above else, and run 15 again: it prints Fizz, because the first true condition wins.' },
        `<p>The leap-year exercise needs a condition of the same kind with one more part, and the grade exercise needs a chain of the same kind with more steps. In both, write the conditions in words first, decide the order, then translate. The tests compare your output exactly, so print the words precisely as the exercise shows them.</p>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> <code>=</code> where <code>==</code> was meant. Forgetting the braces around a branch of more than one line. <code>3 &lt;= x &lt;= 10</code> for a range: it is always true; write <code>3 &lt;= x &amp;&amp; x &lt;= 10</code>. <code>x == 1 || 2</code>, which is also always true, since 2 counts as true; you need <code>x == 1 || x == 2</code>. <code>!x &gt; 5</code> for "not greater than 5"; write <code>!(x &gt; 5)</code>. A semicolon straight after the condition, <code>if (x &gt; 3);</code>, which gives the <code>if</code> an empty statement to control, so the block after it runs every time. Overlapping conditions in the wrong order in an <code>else if</code> chain. A missing <code>break</code> in a <code>switch</code>.</p>` },
        {
          ex: {
            id: 'cp-2-1', title: 'Leap year',
            prompt: `<p>Read a year and print <code>leap</code> or <code>not leap</code>. A year is a leap year if it is divisible by 4, except that century years (divisible by 100) are not, unless they are also divisible by 400. So 2024 and 2000 are leap years; 2023 and 1900 are not. Use one <code>if</code>/<code>else</code> with a condition built from <code>%</code>, <code>&amp;&amp;</code> and <code>||</code>.</p>`,
            starter: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int year;\n    cin >> year;\n    // your code here\n    return 0;\n}`,
            solution: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int year;\n    cin >> year;\n    if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {\n        cout << "leap" << endl;\n    } else {\n        cout << "not leap" << endl;\n    }\n    return 0;\n}`,
            sampleStdin: '2024',
            hints: ['In words: (divisible by 4 and not divisible by 100) or divisible by 400.', 'Divisible by 4 is year % 4 == 0; not divisible by 100 is year % 100 != 0. Then: (year % 4 == 0 && year % 100 != 0) || year % 400 == 0'],
            tests: [{ stdin: '2024', expect: 'leap' }, { stdin: '1900', expect: 'not leap' }, { stdin: '2000', expect: 'leap' }, { stdin: '2023', expect: 'not leap' }, { stdin: '2100', expect: 'not leap' }, { stdin: '2400', expect: 'leap' }],
            failTip: 'Check 1900 and 2000 by hand against your condition: both are divisible by 4 and by 100, and only 2000 is divisible by 400.',
            followup: 'The parentheses around the && part are not strictly needed, since && is applied before ||, but they make the condition read the way the rule is stated. Write them.'
          }
        },
        {
          ex: {
            id: 'cp-2-2', title: 'Grade letters',
            prompt: `<p>Read a score from 0 to 100 and print the letter grade: 90 and above is <code>A</code>, 80–89 is <code>B</code>, 70–79 is <code>C</code>, 60–69 is <code>D</code>, below 60 is <code>F</code>. Use an <code>if</code> / <code>else if</code> chain, and think about the order of the tests.</p>`,
            starter: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int score;\n    cin >> score;\n    // your code here\n    return 0;\n}`,
            solution: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int score;\n    cin >> score;\n    if (score >= 90) {\n        cout << "A" << endl;\n    } else if (score >= 80) {\n        cout << "B" << endl;\n    } else if (score >= 70) {\n        cout << "C" << endl;\n    } else if (score >= 60) {\n        cout << "D" << endl;\n    } else {\n        cout << "F" << endl;\n    }\n    return 0;\n}`,
            sampleStdin: '85',
            hints: ['Test the highest boundary first: if (score >= 90) ... else if (score >= 80) ...', 'Because earlier branches catch the higher scores, each else if needs only a lower bound, just as the temperature example did.'],
            tests: [{ stdin: '95', expect: 'A' }, { stdin: '100', expect: 'A' }, { stdin: '90', expect: 'A' }, { stdin: '89', expect: 'B' }, { stdin: '70', expect: 'C' }, { stdin: '65', expect: 'D' }, { stdin: '60', expect: 'D' }, { stdin: '59', expect: 'F' }, { stdin: '12', expect: 'F' }],
            failTip: 'Check the boundary scores 90, 60 and 59: >= includes the boundary, > does not.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A comparison produces a <code>bool</code>, which prints as 1 or 0; a number used as a condition is false when 0 and true otherwise.</li>
<li><code>if (condition) { … } else if (…) { … } else { … }</code>: the first true condition's block runs and the rest are skipped, so overlapping conditions go most demanding first. The braces, not the indentation, define a branch.</li>
<li><code>&amp;&amp;</code>, <code>||</code>, <code>!</code> combine conditions, and <code>&amp;&amp;</code> and <code>||</code> stop as soon as the answer is known. Write <code>!(x &gt; 5)</code>, and split a range test into two comparisons.</li>
<li><code>==</code> compares; <code>=</code> assigns, even inside a condition, and C++ will not stop you.</li>
<li>A <code>char</code> is a small number, so <code>c &gt;= 'a' &amp;&amp; c &lt;= 'z'</code> works; <code>switch</code> jumps to a constant label and runs until <code>break</code>.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Loops', summary: 'while and for, stated exactly; how to count the passes of a loop, loops that never end, nested loops, and the accumulator pattern.',
      blocks: [
        `<p>On 31 December 2008, thousands of Microsoft Zune music players froze at the same moment, all over the world. The cause was a loop in the code that worked out the date. On the last day of a leap year, the loop's condition stayed true for ever and the loop never ended, so the players hung until their batteries ran flat. The next morning, a new year, they worked again. This lesson is about writing loops that stop, and knowing exactly when they will.</p>
<p>A loop runs the same statements again and again. Python gave you two kinds, <code>while</code> for "until something happens" and <code>for</code> over a <code>range</code> for counting, and C++ has the same two ideas with different spellings. This lesson states the rule for each exactly, because the most common loop bugs, running once too often or once too few, or never stopping at all, come from being vague about exactly when the condition is tested.</p>
<h2>while</h2>
<div class="stmt"><p><span class="kind">Rule (while).</span> <code>while (<i>condition</i>) { <i>statements</i> }</code> tests the condition. If it is false, the loop is over and the program continues after the closing brace. If it is true, the statements run, and then the program goes back and tests the condition again.</p></div>
<p>Two consequences are worth saying aloud. The condition is tested <em>before</em> every pass, including the first, so if it is false at the start the body runs zero times. And the condition is tested only at that moment: if it becomes false halfway through the body, the rest of the body still runs, and the loop ends at the next test. Predict what this program prints.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    int n = 1;
    while (n <= 100) {
        cout << n << " ";
        n = n * 2;
    }
    cout << endl;
    cout << "after the loop, n is " << n << endl;
    return 0;
}`, caption: 'It prints the powers of 2 up to 64, then "after the loop, n is 128". Change the starting value to 200 and run: the body never runs, and n is still 200.' },
        `<details class="reveal"><summary>Trace it by hand: what is <code>n</code> at each test, and what happens?</summary><table class="small"><tr><th>test number</th><th><code>n</code></th><th><code>n &lt;= 100</code>?</th><th>printed</th></tr><tr><td>1</td><td>1</td><td>true</td><td>1</td></tr><tr><td>2</td><td>2</td><td>true</td><td>2</td></tr><tr><td>3</td><td>4</td><td>true</td><td>4</td></tr><tr><td>4</td><td>8</td><td>true</td><td>8</td></tr><tr><td>5</td><td>16</td><td>true</td><td>16</td></tr><tr><td>6</td><td>32</td><td>true</td><td>32</td></tr><tr><td>7</td><td>64</td><td>true</td><td>64</td></tr><tr><td>8</td><td>128</td><td>false</td><td>(loop ends)</td></tr></table><p>Eight tests, seven passes. The value that ends the loop, 128, is the first one that fails the test, and it is still in <code>n</code> afterwards. A table like this, one row per test, is the most reliable way to find out what any loop does.</p></details>
<h2>Loops that never end</h2>
<p>A <code>while</code> loop stops only when its condition becomes false, and the only thing that can make it false is a statement in the body. So every <code>while</code> loop needs three parts: a variable given a value before the loop, a condition that tests it, and a statement in the body that changes it <em>towards</em> making the condition false. Leave out the third, or change the variable in a way that never reaches the stopping point, and the loop runs for ever.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    int n = 1;
    while (n != 10) {
        n = n + 2;
    }
    cout << n << endl;
    return 0;
}`, expectError: true, caption: 'After about four seconds this site stops the program with "Time limit exceeded". n goes 1, 3, 5, 7, 9, 11, …: always odd, so it is never 10. Change != to < and it stops at 11.' },
        `<p>The fix in the caption is a good general habit: test with <code>&lt;</code> or <code>&lt;=</code> rather than <code>!=</code> when a counter is moving towards a limit, so that stepping past the limit still ends the loop. On a real computer an endless loop just keeps running until you stop the program yourself.</p>
<h2>Shorthand for updating a variable</h2>
<div class="stmt"><p><span class="kind">Rule (compound assignment).</span> <code>x += a;</code> means <code>x = x + a;</code>, and likewise <code>-=</code>, <code>*=</code>, <code>/=</code> and <code>%=</code>. <code>x++;</code> adds 1 to <code>x</code>, and <code>x--;</code> subtracts 1.</p></div>
<p>These appear in nearly every loop. Use <code>x++</code> and <code>x--</code> as statements on their own, as above; C++ also allows them inside larger expressions, where their exact meaning is subtle, and nothing in this course needs that.</p>
<h2>for</h2>
<p>Most loops count: set a counter, test it, and step it after each pass. The <code>for</code> loop puts those three parts on one line.</p>
<div class="stmt"><p><span class="kind">Rule (for).</span> <code>for (<i>start</i>; <i>condition</i>; <i>step</i>) { <i>statements</i> }</code> means exactly</p>
<p style="text-align:center"><code><i>start</i>; while (<i>condition</i>) { <i>statements</i> <i>step</i>; }</code></p>
<p>with one difference: a variable declared in the <i>start</i> part exists only inside the loop.</p></div>
<p>So everything you know about <code>while</code> applies: the condition is tested before every pass, and the step happens at the end of each pass, just before the next test. Read <code>for (int i = 0; i &lt; 5; i++)</code> as "start <code>i</code> at 0; while <code>i &lt; 5</code>, run the body and then add 1 to <code>i</code>". It is Python's <code>for i in range(5)</code> written out in full.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    for (int i = 0; i < 5; i++) {
        cout << i << " squared is " << i * i << endl;
    }

    for (int k = 5; k >= 1; k--) {
        cout << k << " ";
    }
    cout << "liftoff" << endl;
    return 0;
}`, caption: 'The first loop runs with i = 0, 1, 2, 3, 4. The second counts down: the step can subtract, and the condition must then be the matching kind of test.' },
        `<div class="stmt"><p><span class="kind">Counting passes.</span> <code>for (int i = a; i &lt; b; i++)</code> runs <i>b</i> − <i>a</i> times, with <code>i</code> taking the values <i>a</i>, <i>a</i> + 1, …, <i>b</i> − 1. With <code>i &lt;= b</code> it runs <i>b</i> − <i>a</i> + 1 times and the last value is <i>b</i>.</p></div>
<p>This is the whole story of the <em>off-by-one error</em>, the most common loop bug in every language. When you write a loop, say its first and last values aloud and count the passes. <code>for (int i = 1; i &lt;= 10; i++)</code> and <code>for (int i = 0; i &lt; 10; i++)</code> both run ten times, but with different values of <code>i</code>.</p>
<details class="reveal"><summary>Predict: how many times does <code>for (int i = 10; i &lt; 20; i += 2)</code> run, and what is the last value of <code>i</code> inside the loop?</summary><p>Five times, with <code>i</code> = 10, 12, 14, 16, 18. After the pass with 18 the step makes <code>i</code> 20, the test 20 &lt; 20 fails, and the loop ends. The counting rule above is for a step of 1; with any other step, list the values and count them.</p></details>
<p>The last sentence of the rule for <code>for</code> has a consequence that surprises people coming from Python, where the loop variable survives the loop:</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    for (int i = 0; i < 3; i++) {
        cout << i << endl;
    }
    cout << "finished with i = " << i << endl;
    return 0;
}`, expectError: true, caption: 'Line 8 fails: variable i does not exist. (A real compiler rejects the whole program before it runs; this site\u2019s interpreter prints 0, 1, 2 first and stops when it reaches line 8.) The i declared in the for line belongs to the loop. If you need the value afterwards, declare int i; before the loop and write for (i = 0; i < 3; i++).' },
        `<h2>The accumulator pattern</h2>
<p>The most common thing to do with a loop is to build up an answer: a total, a count, a largest value so far. The pattern always has three steps. Before the loop, declare a variable and give it the value that is right when nothing has been seen yet: 0 for a sum or a count. Inside the loop, update it. After the loop, use it. As Lesson 1 showed, C++ does not set a new variable to zero for you, so the first step cannot be skipped.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    int total = 0;
    int count = 0;
    for (int i = 1; i <= 10; i++) {
        total += i;
        if (i % 3 == 0) {
            count++;
        }
    }
    cout << "sum: " << total << ", multiples of 3: " << count << endl;
    return 0;
}`, caption: 'Two accumulators in one loop: the sum 1 + 2 + … + 10 = 55, and a count of the multiples of 3 (3, 6 and 9). Change 10 to 100 and predict the sum before running.' },
        `<details class="reveal"><summary>What is the sum from 1 to 100, and is there a way to know without the loop?</summary><p>5050. Pair the numbers from the outside in: 1 + 100, 2 + 99, 3 + 98, and so on. That is 50 pairs, each adding to 101, so 50 × 101 = 5050. In general the sum from 1 to <i>n</i> is <i>n</i>(<i>n</i> + 1)/2. The loop and the formula agree; the formula takes one step whatever <i>n</i> is.</p></details>
<h2>Loops whose length you do not know</h2>
<p>A <code>for</code> loop suits a count known in advance. When the loop should run "until something happens", <code>while</code> is clearer. How many digits does a positive whole number have? Keep dividing by 10, which with integer division removes the last digit, and count how many times that takes to reach 0.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int digits = 0;
    while (n > 0) {
        n = n / 10;
        digits++;
    }
    cout << digits << endl;
    return 0;
}`, stdin: '1234', caption: 'For 1234: 123, 12, 1, 0, so four passes. Try 7 and 100000. Then try 0: the body runs zero times and the program says 0 digits, a case the loop does not handle. Every loop has edge cases like this; test them.' },
        `<h2>Nested loops</h2>
<div class="stmt"><p><span class="kind">Rule (nesting).</span> A loop inside another loop runs its whole course, from its start to its final test, on every single pass of the outer loop.</p></div>
<p>So if the outer loop makes 4 passes and the inner loop makes 3 passes each time, the inner body runs 4 × 3 = 12 times. When the inner loop's length depends on the outer counter, add up the passes instead. That is how the triangle below is drawn: row 1 has one star, row 2 two, and so on.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    for (int row = 1; row <= 4; row++) {
        for (int col = 1; col <= row; col++) {
            cout << "*";
        }
        cout << endl;
    }
    return 0;
}`, caption: 'The inner loop runs row times, and the endl after it ends each line. That is 1 + 2 + 3 + 4 = 10 stars. Change the inner condition to col <= 5 - row to draw the triangle upside down.' },
        `<h2>break and continue</h2>
<div class="stmt"><p><span class="kind">Rule (break, continue).</span> <code>break;</code> leaves the innermost loop at once, and the program continues after it. <code>continue;</code> skips the rest of the current pass; in a <code>for</code> loop the step still happens, and then the condition is tested as usual.</p></div>
<p>Both are handy and both are easy to overuse. If the loop's own condition can say when to stop, prefer that, because then the reason the loop ends is written in one place. Here is the same search written both ways, and a <code>continue</code> that skips even numbers.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    // the first number above 100 that is divisible by 7, two ways
    int n = 101;
    while (true) {
        if (n % 7 == 0) {
            break;
        }
        n++;
    }
    cout << n << endl;

    n = 101;
    while (n % 7 != 0) {
        n++;
    }
    cout << n << endl;

    for (int i = 1; i <= 10; i++) {
        if (i % 2 == 0) {
            continue;    // skip the even numbers
        }
        cout << i << " ";
    }
    cout << endl;
    return 0;
}`, caption: 'Both searches print 105. while (true) runs until a break; the second version says the same thing in its condition and is easier to read. The last loop prints the odd numbers 1 3 5 7 9.' },
        `<h2>Before the exercises</h2>
<p>The first exercise is a loop whose length you cannot know in advance, like the digit counter: repeat a rule until a number reaches 1, and count the passes. Write the three parts of the <code>while</code> loop first (what is set before, what is tested, what changes), then fill in the body.</p>
<p>The second exercise prints rows of numbers separated by single spaces, with no space at the end of a row. The standard trick is to print the separator <em>before</em> every item except the first, because "is this the first item?" is easy to test. Here it is on one row, with commas.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) {
        if (i > 1) {
            cout << ", ";
        }
        cout << i;
    }
    cout << endl;
    return 0;
}`, stdin: '5', caption: 'Prints 1, 2, 3, 4, 5 with no comma at the end. Try n = 1: one item, no separator at all. For a table, put a loop like this inside another loop, and end each row with endl after the inner loop.' },
        `<details class="reveal"><summary>Puzzle: how many stars does this print? <code>for (int i = 0; i &lt; 4; i++) for (int j = i; j &lt; 4; j++) cout &lt;&lt; "*";</code></summary><p>10. For <code>i</code> = 0 the inner loop runs 4 times (<code>j</code> = 0, 1, 2, 3), for <code>i</code> = 1 it runs 3 times, then 2, then 1: 4 + 3 + 2 + 1 = 10. Counting nested loops by adding up the inner passes, one outer pass at a time, is the method whenever the inner loop's length depends on the outer counter.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Off-by-one: <code>i &lt;= n</code> runs one pass more than <code>i &lt; n</code>; say the first and last values aloud. A <code>while</code> whose body never changes the variables in its condition, or changes them past the stopping point: prefer <code>&lt;</code> to <code>!=</code>. Forgetting to initialise an accumulator. Using a <code>for</code> loop's variable after the loop. A semicolon straight after the loop header, <code>for (…);</code> or <code>while (…);</code>, which gives the loop an empty body. Putting <code>endl</code> inside the inner loop when it belongs after it.</p>` },
        {
          ex: {
            id: 'cp-3-1', title: 'Collatz steps',
            prompt: `<p>Read a positive whole number <em>n</em>. Repeatedly replace it: if it is even, halve it; if it is odd, replace it with 3<em>n</em> + 1. Count how many replacements it takes to reach 1, and print that count. For 6 the sequence is 6, 3, 10, 5, 16, 8, 4, 2, 1: eight steps. For 1 no steps are needed, so print 0.</p>`,
            starter: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    int steps = 0;\n    // your loop here\n    cout << steps << endl;\n    return 0;\n}`,
            solution: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    int steps = 0;\n    while (n != 1) {\n        if (n % 2 == 0) {\n            n = n / 2;\n        } else {\n            n = 3 * n + 1;\n        }\n        steps++;\n    }\n    cout << steps << endl;\n    return 0;\n}`,
            sampleStdin: '6',
            hints: ['The three parts: n is set before the loop (read from input); the test is n != 1; the body replaces n and adds 1 to steps.', 'Inside the loop: if (n % 2 == 0) { n = n / 2; } else { n = 3 * n + 1; } and then steps++.'],
            tests: [{ stdin: '6', expect: '8' }, { stdin: '1', expect: '0' }, { stdin: '7', expect: '16' }, { stdin: '27', expect: '111' }, { stdin: '97', expect: '118' }],
            failTip: 'If the input 1 gives 1 instead of 0, your loop body ran once before testing. A while loop tests first.',
            followup: 'Here != is safe because the rule always eventually reaches 1 for every number anyone has tried. Whether it does for every positive number is the Collatz conjecture, one of the most famous unsolved problems in mathematics.'
          }
        },
        {
          ex: {
            id: 'cp-3-2', title: 'Multiplication table',
            prompt: `<p>Read <em>n</em> and print an <em>n</em>×<em>n</em> multiplication table: row <em>i</em> contains <em>i</em>×1, <em>i</em>×2, … <em>i</em>×<em>n</em>, separated by single spaces, with no space at the end of the row. For 3:</p><pre class="code">1 2 3\n2 4 6\n3 6 9</pre>`,
            starter: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // nested loops here\n    return 0;\n}`,
            solution: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    for (int i = 1; i <= n; i++) {\n        for (int j = 1; j <= n; j++) {\n            if (j > 1) {\n                cout << " ";\n            }\n            cout << i * j;\n        }\n        cout << endl;\n    }\n    return 0;\n}`,
            sampleStdin: '3',
            hints: ['Outer loop over rows i from 1 to n; inner loop over columns j from 1 to n; print i * j.', 'Print the space before every number except the first in its row: if (j > 1) cout << " ";', 'endl goes after the inner loop, not inside it.'],
            tests: [{ stdin: '3', expect: '1 2 3\n2 4 6\n3 6 9' }, { stdin: '1', expect: '1' }, { stdin: '5', expect: '1 2 3 4 5\n2 4 6 8 10\n3 6 9 12 15\n4 8 12 16 20\n5 10 15 20 25' }],
            failTip: 'Trailing spaces at the end of a line are ignored by the checker, but a missing newline between rows is not, and neither is a missing space between numbers.',
            followup: 'The inner body ran n × n times: nested loops with fixed lengths multiply.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li><code>while (<i>condition</i>)</code> tests before every pass, so the body may run zero times. Something in the body must move the condition towards false, or the loop never ends.</li>
<li><code>for (<i>start</i>; <i>condition</i>; <i>step</i>)</code> is a <code>while</code> loop with its three parts on one line; its variable exists only inside the loop.</li>
<li><code>for (int i = a; i &lt; b; i++)</code> runs <i>b</i> − <i>a</i> times; with <code>&lt;=</code>, once more. Count passes by saying the first and last values.</li>
<li>Accumulators: set before, update inside, use after. <code>+=</code>, <code>++</code> and friends are shorthand for updates.</li>
<li>An inner loop runs completely on every pass of the outer one. <code>break</code> leaves a loop; <code>continue</code> skips to the next pass.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Functions', summary: 'Typed functions stated exactly: parameters, return, declaration before use, pass by value, scope, early return, and a first look at recursion.',
      blocks: [
        `<p>A cookbook recipe for a lasagne might say "make the tomato sauce (page 12)" and "make the white sauce (page 40)". The lasagne recipe does not repeat those recipes; it names them, trusts them, and gets on with its own job. Functions are how programs do the same, and by the end of this lesson you will write functions that call other functions, and even themselves.</p>
<p>A function names a computation so you can use it again, test it on its own, and stop thinking about how it works. You know the idea from Python's <code>def</code>. C++ adds one thing, the same thing it added to variables in Lesson 1: every value going in and coming out has a type, stated in advance, and the compiler checks every call against it.</p>
<h2>Defining a function</h2>
<div class="stmt"><p><span class="kind">Rule (definition).</span> A function definition has the form</p>
<p style="text-align:center"><code><i>returnType</i> <i>name</i>(<i>type</i><sub>1</sub> <i>param</i><sub>1</sub>, <i>type</i><sub>2</sub> <i>param</i><sub>2</sub>, …) { <i>statements</i> }</code></p>
<p>The <em>return type</em> says what kind of value the function gives back. Each <em>parameter</em> is a variable declaration, with a type, that receives a value when the function is called.</p>
<p><span class="kind">Rule (return).</span> <code>return <i>expression</i>;</code> ends the function at once and gives the expression's value back to the caller, converted to the return type. A function whose return type is <code>void</code> gives nothing back; it may use a plain <code>return;</code> to stop early, or simply reach its closing brace.</p>
<p><span class="kind">Rule (call).</span> In a call <code><i>name</i>(<i>arguments</i>)</code>, each argument is evaluated, converted to its parameter's type, and copied into that parameter. Then the function's statements run.</p></div>
<p>So <code>main</code>, which you have written in every program, is simply a function whose return type is <code>int</code>. Here are four more, one of each common kind, all called from <code>main</code>.</p>`,
        { play: `#include <iostream>
using namespace std;

int square(int x) {
    return x * x;
}

bool isEven(int n) {
    return n % 2 == 0;
}

double average(double a, double b) {
    return (a + b) / 2;
}

void greet(int times) {
    for (int i = 0; i < times; i++) {
        cout << "hi ";
    }
    cout << endl;
}

int main() {
    cout << square(12) << endl;
    cout << isEven(7) << endl;
    cout << average(3, 4) << endl;
    greet(3);
    return 0;
}`, caption: 'Prints 144, then 0 (7 is not even), then 3.5, then hi hi hi. greet is void: it does something but hands back no value, so it is called as a statement on its own.' },
        `<details class="reveal"><summary>Predict: <code>average(3, 4)</code> printed 3.5. What would <code>(3 + 4) / 2</code> print inside <code>main</code>?</summary><p><code>3</code>. In <code>main</code>, 3 and 4 are <code>int</code>s, so Lesson 1's rule makes the division an integer division. In the call <code>average(3, 4)</code>, the call rule converted 3 and 4 to <code>double</code> on the way into the parameters, so inside the function it is a <code>double</code> division. The parameter types decide.</p></details>
<p>The conversions go the other way too, and there they can lose information. Passing 7.9 to a parameter of type <code>int</code> gives the function 7: the fractional part is dropped, not rounded. And the type of a <em>call</em> is the function's return type, so the compiler rejects a call used where its value makes no sense, such as <code>int x = greet(3);</code> with a <code>void</code> function, or <code>square("hello")</code>, where text cannot become an <code>int</code>.</p>
<h2>Every path must return</h2>
<p>A function with a return type other than <code>void</code> promises a value. It must reach a <code>return</code> statement on every path through its code, whatever the input.</p>`,
        { play: `#include <iostream>
using namespace std;

int sign(int x) {
    if (x > 0) {
        return 1;
    } else if (x < 0) {
        return -1;
    }
}

int main() {
    cout << sign(5) << endl;
    cout << sign(0) << endl;
    return 0;
}`, expectError: true, caption: 'sign(5) prints 1, but for 0 neither branch runs and the function falls off its end. This site stops with "you must return a value". A real compiler only warns, and the program prints some meaningless number. Add return 0; before the closing brace of sign.' },
        `<p>The warning a real compiler gives is easy to scroll past, and the bug it points at is silent, so treat that warning as an error. When you finish writing a function, trace each path through it and check that each one ends in a <code>return</code>.</p>
<h2>Declare before use</h2>
<div class="stmt"><p><span class="kind">Rule (declaration before use).</span> A compiler reads a file from top to bottom, and a function must be <em>declared</em> above any line that calls it. A definition counts as a declaration. So does a <em>prototype</em>: the first line of the definition followed by a semicolon, such as <code>int square(int x);</code>, which promises that the full definition appears somewhere later.</p></div>
<p>This is why helper functions usually sit above <code>main</code>. When you would rather put <code>main</code> first, list prototypes at the top. (The interpreter on this site is more forgiving than a real compiler and will accept a call above a definition, so this is one rule you must check yourself; the rule is what g++ and clang enforce.)</p>`,
        { code: `#include <iostream>
using namespace std;

int square(int x);          // prototype: the promise

int main() {
    cout << square(5) << endl;
    return 0;
}

int square(int x) {         // the definition keeps the promise
    return x * x;
}`, caption: 'Legal in every compiler: square is declared above main by its prototype, and defined below it.' },
        `<h2>Pass by value</h2>
<p>The call rule says each argument is <em>copied</em> into its parameter. The parameter is a brand-new variable, private to the function, and the function works on the copy. This is called <em>pass by value</em>, and it has a consequence that surprises everyone once: a function cannot change a variable of the caller's by assigning to its parameter. Step through the trace and watch <code>n</code> in <code>main</code>.</p>`,
        { fig: 'trace', lang: 'cpp', code: `void addOne(int n) {
    n = n + 1;
    cout << n << endl;
}

int main() {
    int n = 5;
    addOne(n);
    cout << n << endl;
    return 0;
}`, steps: [
          { line: 7, frames: [{ name: 'main', vars: { n: 5 } }], out: '', note: 'main declares its own n and gives it 5.' },
          { line: 8, frames: [{ name: 'main', vars: { n: 5 } }], out: '', note: 'The call addOne(n) evaluates the argument, 5, and copies it into a new frame.' },
          { line: 2, frames: [{ name: 'main', vars: { n: 5 } }, { name: 'addOne', vars: { n: 5 } }], out: '', note: 'Two different variables now happen to be called n, one in each frame.' },
          { line: 3, frames: [{ name: 'main', vars: { n: 5 } }, { name: 'addOne', vars: { n: 6 } }], out: '', note: 'addOne changes its own n. main\u2019s n is untouched.' },
          { line: 4, frames: [{ name: 'main', vars: { n: 5 } }, { name: 'addOne', vars: { n: 6 } }], out: '6\n', note: 'addOne prints 6 and reaches its closing brace; its frame disappears.' },
          { line: 9, frames: [{ name: 'main', vars: { n: 5 } }], out: '6\n5\n', note: 'main still has 5.' }
        ], caption: 'A frame is the patch of memory for one call of a function. The parameter lives in the function\u2019s frame, so it is a copy.' },
        `<p>So a function takes copies in and hands exactly one value back with <code>return</code>. To give a result back, return it and let the caller store it: <code>n = addOne(n);</code> with <code>addOne</code> returning <code>n + 1</code>. How a function can change the caller's variables directly, or give back more than one result, is the subject of the next lesson, on pointers.</p>
<h2>Scope</h2>
<div class="stmt"><p><span class="kind">Rule (scope).</span> A variable declared inside a block, the statements between a pair of braces, exists from its declaration to the end of that block. Parameters exist for the whole body of their function. Variables in different functions are different variables, even when they have the same name.</p></div>
<p>You met the first part in Lesson 3: a <code>for</code> loop's counter disappears when the loop ends. A variable declared outside every function is called <em>global</em> and is visible everywhere below it. It is tempting, because any function can then read and change it, and that is exactly the problem: a function that uses globals can no longer be understood, tested or reused by looking at its parameters and return value alone. Pass values in as parameters and hand results back with <code>return</code>.</p>
<h2>Returning early</h2>
<p>Because <code>return</code> ends the function at once, it can be used inside a loop to stop as soon as the answer is known, even before the loop's condition becomes false. This is the usual shape of a function that searches: return the answer the moment you find it, and return the "not found" answer after the loop, when every possibility has been tried.</p>`,
        { play: `#include <iostream>
using namespace std;

bool containsDigit(int n, int d) {
    while (n > 0) {
        if (n % 10 == d) {
            return true;       // found it: stop searching
        }
        n = n / 10;            // drop the last digit
    }
    return false;              // every digit checked, none matched
}

int main() {
    cout << containsDigit(1974, 7) << endl;
    cout << containsDigit(1974, 2) << endl;
    return 0;
}`, caption: 'Prints 1, then 0. For 1974 and 7 the loop looks at 4, then 7, and returns at once. The final return false is reached only after every digit has been checked. Notice that changing n inside the function does not affect the 1974 in main: it is a copy.' },
        `<p>A common mistake with this pattern is to put the "not found" answer inside the loop, as an <code>else</code>: <code>if (n % 10 == d) return true; else return false;</code>. Then the function gives up after looking at the first digit. "Not found" can only be decided after the loop has finished.</p>
<h2>Recursion</h2>
<p>A function can call itself. Each call gets its own frame, with its own copies of the parameters, so the calls do not interfere with each other. As in any language, a recursive function needs a base case that it answers without calling itself, and every call must move towards it.</p>`,
        { play: `#include <iostream>
using namespace std;

int factorial(int n) {
    if (n <= 1) {
        return 1;          // base case
    }
    return n * factorial(n - 1);
}

int fib(int n) {
    if (n < 2) {
        return n;          // base cases: fib(0) = 0, fib(1) = 1
    }
    return fib(n - 1) + fib(n - 2);
}

int main() {
    cout << factorial(10) << endl;
    for (int i = 0; i < 12; i++) {
        cout << fib(i) << " ";
    }
    cout << endl;
    return 0;
}`, caption: 'factorial(10) is 3628800, and the first twelve Fibonacci numbers follow. Try factorial(13): it is too large for an int. This site reports the overflow; a real compiler silently produces a wrong number, which is worse.' },
        `<p>An <code>int</code> holds values up to about 2 billion, as Lesson 1's table said, and 13! is about 6 billion. Choosing a type is choosing a range, and a function's return type must be large enough for every answer it can give.</p>
<h2>Before the exercises</h2>
<p>In both exercises you write only the function: the checker supplies a <code>main</code> that calls it with test values and prints the result. The Run button needs a <code>main</code>, so to try your function yourself, add a small one below it, like the ones above, and delete it before you press Check.</p>
<p>The first exercise is a loop inside a function that returns once the loop ends. Lesson 3 needed the same care: the loop must change its variables so that its condition eventually becomes false. The second is a search with an early return, exactly the shape of <code>containsDigit</code>: return <code>false</code> the moment a divisor is found, and <code>true</code> only after the loop has tried them all.</p>`,
        `<details class="reveal"><summary>Puzzle: <code>void f(int a) { a = a * 2; }</code>, and in <code>main</code>, <code>int a = 5; f(a); f(a); cout &lt;&lt; a;</code>. What is printed?</summary><p><code>5</code>. Each call copies the value 5 into <code>f</code>'s own parameter, which happens to be called <code>a</code> too, doubles the copy, and throws it away. <code>main</code>'s <code>a</code> is never touched: two variables with one name, in two different frames. To keep the result, <code>f</code> would have to return it.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Forgetting the return type, or a parameter's type. A non-<code>void</code> function that can reach its closing brace without returning. Calling a function above its declaration: this site allows it, real compilers do not. Expecting a function to change the variable you passed in; return the new value instead. Putting the "not found" <code>return</code> inside the loop, so the search stops after one try. Using a global variable where a parameter would do. A recursive function with no base case, or one the calls skip past.</p>` },
        {
          ex: {
            id: 'cp-4-1', title: 'Greatest common divisor',
            prompt: `<p>Write <code>int gcd(int a, int b)</code> using Euclid's algorithm: while <code>b</code> is not zero, replace (<em>a</em>, <em>b</em>) with (<em>b</em>, <em>a</em> mod <em>b</em>); when <code>b</code> is zero, <code>a</code> is the answer. For example, gcd(48, 18) goes (48, 18), (18, 12), (12, 6), (6, 0), and the answer is 6. Write only the function; the checker supplies <code>main</code>.</p>`,
            starter: `int gcd(int a, int b) {\n    // your code here\n}`,
            solution: `int gcd(int a, int b) {\n    while (b != 0) {\n        int temp = b;\n        b = a % b;\n        a = temp;\n    }\n    return a;\n}`,
            hints: ['Both a and b must change at once, and the new b needs the old a. Save b in a temporary variable first: int temp = b; then b = a % b; then a = temp;', 'After the loop, b is 0 and a holds the answer: return a.'],
            tests: [{ call: 'gcd(48, 18)', expect: '6' }, { call: 'gcd(17, 5)', expect: '1' }, { call: 'gcd(100, 75)', expect: '25' }, { call: 'gcd(7, 0)', expect: '7' }, { call: 'gcd(0, 9)', expect: '9' }, { call: 'gcd(1071, 462)', expect: '21' }],
            mustContain: [{ re: /\bint\s+gcd\s*\(\s*int\s+\w+\s*,\s*int\s+\w+\s*\)/, msg: 'Keep the signature int gcd(int a, int b).' }],
            failTip: 'If gcd(48, 18) gives 18 or 12, check the order of your assignments: the new b must be computed from the old a, before a changes.',
            followup: 'Changing a and b inside gcd is safe: they are copies of the caller\u2019s values, as the pass-by-value rule says.'
          }
        },
        {
          ex: {
            id: 'cp-4-2', title: 'Prime test',
            prompt: `<p>Write <code>bool isPrime(int n)</code>, true when <code>n</code> is a prime number: greater than 1, with no divisors other than 1 and itself. Try every divisor <code>d</code> from 2 while <code>d * d &lt;= n</code>; if one divides <code>n</code> evenly, return false at once. (Testing only up to the square root is enough: if <code>n</code> = <i>a</i> × <i>b</i> with both factors above √<i>n</i>, their product would be more than <code>n</code>.) Write only the function. The checker prints the result, so <code>1</code> means true.</p>`,
            starter: `bool isPrime(int n) {\n    if (n < 2) {\n        return false;\n    }\n    // your code here\n}`,
            solution: `bool isPrime(int n) {\n    if (n < 2) {\n        return false;\n    }\n    for (int d = 2; d * d <= n; d++) {\n        if (n % d == 0) {\n            return false;\n        }\n    }\n    return true;\n}`,
            hints: ['for (int d = 2; d * d <= n; d++) tries divisors up to the square root without any decimals.', 'Inside the loop, return false the moment n % d == 0. After the loop, every divisor has been tried: return true. Do not put return true inside the loop.'],
            tests: [{ call: 'isPrime(2)', expect: '1' }, { call: 'isPrime(7)', expect: '1' }, { call: 'isPrime(9)', expect: '0' }, { call: 'isPrime(1)', expect: '0' }, { call: 'isPrime(25)', expect: '0' }, { call: 'isPrime(97)', expect: '1' }, { call: 'isPrime(7919)', expect: '1' }, { call: 'isPrime(7917)', expect: '0' }],
            mustContain: [{ re: /\bbool\s+isPrime\s*\(\s*int\s+\w+\s*\)/, msg: 'Keep the signature bool isPrime(int n).' }],
            failTip: 'If 9 or 25 is reported prime, check the loop condition: it must be d * d <= n, including equality, so that 3 is tried for 9 and 5 for 25.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li><code><i>returnType</i> <i>name</i>(<i>type</i> <i>param</i>, …) { … }</code>; <code>void</code> means no value comes back. Every other function must <code>return</code> on every path.</li>
<li>A call evaluates each argument, converts it to the parameter's type, and copies it in: pass by value. The function cannot change the caller's variables through its parameters.</li>
<li>Declare a function above its first call, by defining it there or with a prototype.</li>
<li>A variable lives from its declaration to the end of its block; prefer parameters and return values to globals.</li>
<li><code>return</code> ends the function at once, which makes early exit from a search natural. Decide "not found" only after the loop.</li>
<li>Each recursive call has its own frame; it needs a base case, and a return type big enough for its answers.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Pointers', summary: 'Addresses and the variables that hold them, stated exactly: &, * and the three meanings of the star; why passing a pointer still passes by value; and how a function changes the caller\u2019s variables.',
      blocks: [
        `<p>In 1965 the computer scientist Tony Hoare added a special "points nowhere" value to a programming language he was designing, because it was so easy to implement. In 2009 he apologised for it in public, calling it his "billion-dollar mistake", after decades of programs crashing because they followed a pointer that pointed nowhere. Pointers are powerful and they are sharp. This lesson shows how they work, and how not to cut yourself.</p>
<p>Lesson 4 ended with a limitation: a function receives copies, so it cannot change the caller's variables, and it can hand back only one value. C++'s answer is one of the ideas it is best known for. It has a fearsome reputation, but it rests on three small rules, and the whole difficulty is keeping those rules separate in your head.</p>
<h2>Addresses</h2>
<p>Lesson 1's memory figure showed each variable occupying some bytes, laid out by the compiler. Every byte of memory has a number, its <em>address</em>, just as every house on a street has a number.</p>
<div class="stmt"><p><span class="kind">Rule (address).</span> The <em>address</em> of a variable is the address of its first byte. For a variable <code>x</code>, the expression <code>&amp;x</code> ("address of x") is that address. If <code>x</code> is an <code>int</code>, the type of <code>&amp;x</code> is <code>int*</code>, "pointer to int".</p>
<p><span class="kind">Rule (pointer).</span> A <em>pointer</em> is a variable whose value is an address. <code>int* p = &amp;x;</code> declares <code>p</code> as a pointer to an <code>int</code> and stores the address of <code>x</code> in it. We say <code>p</code> <em>points to</em> <code>x</code>.</p>
<p><span class="kind">Rule (dereference).</span> If <code>p</code> points to <code>x</code>, then <code>*p</code> ("star p") <em>is</em> <code>x</code>: reading <code>*p</code> reads <code>x</code>, and assigning to <code>*p</code> assigns to <code>x</code>.</p></div>
<p>A table makes this concrete. Suppose the compiler places <code>x</code> at address 1000 and <code>p</code> at address 1008 (real addresses are much larger numbers, usually written in hexadecimal):</p>
<table class="small"><tr><th>after</th><th>variable</th><th>its address</th><th>its value</th></tr><tr><td rowspan="2"><code>int x = 5; int* p = &amp;x;</code></td><td><code>x</code></td><td>1000</td><td>5</td></tr><tr><td><code>p</code></td><td>1008</td><td>1000</td></tr><tr><td rowspan="2"><code>*p = 42;</code></td><td><code>x</code></td><td>1000</td><td><b>42</b></td></tr><tr><td><code>p</code></td><td>1008</td><td>1000</td></tr></table>
<p><code>p</code> is a variable like any other, with its own address and its own value; its value just happens to be an address. The assignment <code>*p = 42</code> went to the address <em>in</em> <code>p</code>, which is <code>x</code>'s, and left <code>p</code> unchanged. Predict each line before running.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    int x = 5;
    int* p = &x;         // p holds the address of x

    cout << *p << endl;  // follow the pointer: reads x
    *p = 42;             // write through the pointer
    cout << x << endl;   // x itself changed
    cout << (p == &x) << endl;

    int y = 7;
    p = &y;              // p now points somewhere else
    *p = *p + 1;
    cout << x << " " << y << endl;
    return 0;
}`, caption: 'Prints 5, 42, 1 (true), then 42 8. After p = &y, *p means y, and x is left alone. A real compiler would also let you print p itself, as an address such as 0x7ffd3c2a; this site\u2019s interpreter only allows comparing addresses. Press Step through memory to watch it happen: the value of p is an address, and pointing at p lights up the variable it points to.' },
        `<h2>One symbol, three meanings</h2>
<p>The star is where the confusion lives, because C++ uses it for three unrelated things, and <code>&amp;</code> has a second meaning too. Which one is meant depends only on where the symbol appears.</p>
<table class="small"><tr><th>you write</th><th>where</th><th>it means</th></tr><tr><td><code>int* p</code></td><td>in a declaration, after a type</td><td>p is a pointer to an int</td></tr><tr><td><code>*p</code></td><td>in an expression, before a pointer</td><td>the variable p points to</td></tr><tr><td><code>a * b</code></td><td>between two values</td><td>multiplication</td></tr><tr><td><code>&amp;x</code></td><td>in an expression, before a variable</td><td>the address of x</td></tr></table>
<p>So <code>int* p = &amp;x;</code> uses the first meaning, and <code>*p = 42;</code> the second, although both have a star next to <code>p</code>. Read declarations as "type, name": the type is <code>int*</code> and the name is <code>p</code>. (<code>&amp;</code> in a declaration means something else again, a reference; see the end of the lesson.)</p>
<details class="reveal"><summary>Predict: after <code>int a = 1; int* q = &amp;a; *q = *q * 10;</code>, what is <code>a</code>? And what does <code>*q * 2</code> mean?</summary><p><code>a</code> is 10: <code>*q</code> is another name for <code>a</code> for as long as <code>q</code> points to it, so the line says <code>a = a * 10</code>. <code>*q * 2</code> is "the variable <code>q</code> points to, times 2": the first star dereferences, because it comes before a pointer, and the second multiplies, because it sits between two values. It is 20.</p></details>
<h2>A pointer must point somewhere</h2>
<p>A pointer declared without a value holds no meaningful address, exactly as an uninitialised <code>int</code> held no meaningful number in Lesson 1. Following it reads or, worse, writes some unknown piece of memory.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    int* p;              // declared, never given an address
    cout << *p << endl;  // follow it: to where?
    return 0;
}`, expectError: true, caption: 'This site refuses: "you cannot dereference an uninitialized pointer". A real program may print garbage, crash, or silently change some other variable. Always give a pointer an address when you declare it.' },
        `<p>Real C++ has a special value, <code>nullptr</code>, meaning "points nowhere", which you can store in a pointer and test for; following it is always an error. (This site's interpreter does not know <code>nullptr</code>.) The types must also match: <code>double* q = &amp;x;</code> with an <code>int x</code> is rejected, because a pointer's type says what kind of value is found at the address.</p>
<h2>Passing an address to a function</h2>
<p>Now the payoff. Lesson 4's call rule still holds, unchanged: every argument is copied into its parameter. But if the argument is an <em>address</em>, the parameter receives a copy of the address, and a copy of an address points to the same place as the original.</p>
<div class="stmt"><p><span class="kind">Consequence of pass by value.</span> A function with a parameter <code>int* a</code>, called with <code>&amp;x</code>, receives the address of <code>x</code>. Inside the function, <code>*a</code> is the caller's <code>x</code>, so assigning to <code>*a</code> changes <code>x</code>. Assigning to <code>a</code> itself changes only the function's copy of the address.</p></div>
<p>The classic example is swapping two variables, which no pass-by-value function can do with plain <code>int</code> parameters. Step through the trace: the arrows in <code>swap</code>'s frame are copies of addresses, and they lead back into <code>main</code>'s frame.</p>`,
        { fig: 'trace', lang: 'cpp', code: `void swap(int* a, int* b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main() {
    int x = 1, y = 2;
    swap(&x, &y);
    cout << x << " " << y << endl;
    return 0;
}`, steps: [
          { line: 8, frames: [{ name: 'main', vars: { x: 1, y: 2 } }], out: '', note: 'main has x and y.' },
          { line: 9, frames: [{ name: 'main', vars: { x: 1, y: 2 } }], out: '', note: 'The arguments are &x and &y: the addresses of main\u2019s variables.' },
          { line: 2, frames: [{ name: 'main', vars: { x: 1, y: 2 } }, { name: 'swap', vars: { a: '\u2192 x', b: '\u2192 y' } }], out: '', note: 'The addresses are copied into a and b. The copies point to main\u2019s x and y.' },
          { line: 3, frames: [{ name: 'main', vars: { x: 1, y: 2 } }, { name: 'swap', vars: { a: '\u2192 x', b: '\u2192 y', temp: 1 } }], out: '', note: 'temp = *a reads main\u2019s x.' },
          { line: 4, frames: [{ name: 'main', vars: { x: 2, y: 2 } }, { name: 'swap', vars: { a: '\u2192 x', b: '\u2192 y', temp: 1 } }], out: '', note: '*a = *b writes into main\u2019s x, through the address.' },
          { line: 5, frames: [{ name: 'main', vars: { x: 2, y: 1 } }, { name: 'swap', vars: { a: '\u2192 x', b: '\u2192 y', temp: 1 } }], out: '', note: '*b = temp writes into main\u2019s y. swap\u2019s frame now disappears.' },
          { line: 10, frames: [{ name: 'main', vars: { x: 2, y: 1 } }], out: '2 1\n', note: 'main\u2019s variables were swapped by another function.' }
        ], caption: 'Compare Lesson 4\u2019s trace of addOne: the parameters are still copies, but copies of addresses reach the originals.' },
        { play: `#include <iostream>
using namespace std;

void swap(int* a, int* b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

void tryToSwap(int a, int b) {     // pass by value: swaps copies only
    int temp = a;
    a = b;
    b = temp;
}

void swapTheArrows(int* a, int* b) {  // forgot the stars
    int* temp = a;
    a = b;
    b = temp;
}

int main() {
    int x = 1, y = 2;
    tryToSwap(x, y);
    cout << x << " " << y << endl;
    swapTheArrows(&x, &y);
    cout << x << " " << y << endl;
    swap(&x, &y);
    cout << x << " " << y << endl;
    return 0;
}`, caption: 'Prints 1 2, then 1 2, then 2 1. tryToSwap swaps its own copies of the values. swapTheArrows swaps its own copies of the addresses, which changes where its a and b point, but not x or y. Only swap assigns through the pointers.' },
        `<p>The call must supply addresses. <code>swap(x, y)</code>, without the ampersands, passes two <code>int</code>s to a function whose parameters are <code>int*</code>, and the compiler rejects it (on this site: "no method swap … accepts int,int"). That is a helpful error: the types caught the mistake before anything ran.</p>
<h2>More than one result</h2>
<p>The same idea lets a function give back several answers. The caller passes the addresses of the variables that should receive them, and the function fills them in. This is how C and C++ return two or more values from one call.</p>`,
        { play: `#include <iostream>
using namespace std;

void minMax(int a, int b, int c, int* lo, int* hi) {
    *lo = a;
    *hi = a;
    if (b < *lo) *lo = b;
    if (c < *lo) *lo = c;
    if (b > *hi) *hi = b;
    if (c > *hi) *hi = c;
}

int main() {
    int smallest, largest;
    minMax(7, 3, 9, &smallest, &largest);
    cout << smallest << " " << largest << endl;
    return 0;
}`, caption: 'Prints 3 9. smallest and largest belong to main and start with no value; minMax gives them their values through the pointers. The pointers lo and hi are called output parameters.' },
        `<h2>A note on references</h2>
<p>Modern C++ has a second way to do this job, called a <em>reference</em>: a parameter declared <code>int&amp; n</code> becomes another name for the caller's variable, so the function writes <code>n</code> instead of <code>*n</code>, and the caller writes <code>swap(x, y)</code> instead of <code>swap(&amp;x, &amp;y)</code>. The interpreter on this site does not support references. On a real compiler, prefer them for this job: they cannot be left pointing nowhere. But a reference is a pointer that the compiler follows for you, and the next lesson needs real pointers, because arrays are built on them.</p>
<h2>Before the exercises</h2>
<p>Both exercises are functions with pointer parameters, and in both the rule is the same: read and write the caller's variables through the pointers with <code>*</code>, and pass a pointer you already have straight on, without <code>&amp;</code>, since it already is an address. Here is a worked example of each skill.</p>`,
        { play: `#include <iostream>
using namespace std;

// Two results through two output parameters
void sumAndDifference(int a, int b, int* sum, int* diff) {
    *sum = a + b;
    *diff = a - b;
}

// Put two variables in order, using swap
void swap(int* p, int* q) {
    int temp = *p;
    *p = *q;
    *q = temp;
}

void order2(int* a, int* b) {
    if (*a > *b) {       // compare the values pointed to
        swap(a, b);      // a and b are already addresses: no &
    }
}

int main() {
    int s, d;
    sumAndDifference(10, 4, &s, &d);
    cout << s << " " << d << endl;

    int x = 9, y = 2;
    order2(&x, &y);
    cout << x << " " << y << endl;
    return 0;
}`, caption: 'Prints 14 6, then 2 9. In order2, a is already an int*, so it goes to swap as it is. Writing swap(&a, &b) would pass the addresses of the pointers themselves, which is not what swap expects.' },
        `<details class="reveal"><summary>Puzzle: if <code>x</code> is an <code>int</code>, what is <code>*&amp;x</code>? And if <code>p</code> is a pointer to an <code>int</code>, what is <code>&amp;*p</code>?</summary><p><code>*&amp;x</code> is <code>x</code> itself: <code>&amp;x</code> is its address, and <code>*</code> follows that address straight back to <code>x</code>. <code>&amp;*p</code> is <code>p</code>: <code>*p</code> is the variable <code>p</code> points to, and its address is exactly what <code>p</code> holds. <code>&amp;</code> and <code>*</code> undo each other, which is a good way to remember what each one does.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Forgetting the <code>&amp;</code> at the call, so values are passed where addresses are expected. Forgetting the <code>*</code> inside the function, so <code>a = b</code> changes where the local copy points instead of the value pointed to. Adding a <code>&amp;</code> to something that is already a pointer. Following a pointer that was never given an address. Reading <code>int* p</code> and <code>*p</code> as the same star: one declares, the other follows. Expecting a function to change the caller's variable when it received only a copy of its value.</p>` },
        {
          ex: {
            id: 'cp-5-1', title: 'Quotient and remainder',
            prompt: `<p>Write <code>void divide(int a, int b, int* q, int* r)</code>, which stores the quotient of <code>a / b</code> where <code>q</code> points and the remainder where <code>r</code> points. Write only the function; the checker declares two ints, calls <code>divide(17, 5, &amp;quot, &amp;rem)</code> and prints them.</p>`,
            starter: `void divide(int a, int b, int* q, int* r) {\n    // your code here\n}`,
            solution: `void divide(int a, int b, int* q, int* r) {\n    *q = a / b;\n    *r = a % b;\n}`,
            hints: ['Two lines, each assigning through a pointer, like sumAndDifference.', '*q = a / b; and *r = a % b;'],
            tests: [
              { name: 'divide(17, 5)', main: '    int quot = 0, rem = 0;\n    divide(17, 5, &quot, &rem);\n    cout << quot << " " << rem << endl;', expect: '3 2' },
              { name: 'divide(100, 10)', main: '    int quot = 0, rem = 0;\n    divide(100, 10, &quot, &rem);\n    cout << quot << " " << rem << endl;', expect: '10 0' },
              { name: 'divide(3, 7)', main: '    int quot = 0, rem = 0;\n    divide(3, 7, &quot, &rem);\n    cout << quot << " " << rem << endl;', expect: '0 3' },
              { name: 'divide(3725, 60)', main: '    int quot = 0, rem = 0;\n    divide(3725, 60, &quot, &rem);\n    cout << quot << " " << rem << endl;', expect: '62 5' }
            ],
            mustContain: [{ re: /\*\s*q\s*=/, msg: 'Assign through the pointer: *q = ...' }],
            failTip: 'If the checker prints 0 0, the function assigned to its own copies: write *q = and *r =, with the stars.'
          }
        },
        {
          ex: {
            id: 'cp-5-2', title: 'Sort three numbers, in place',
            prompt: `<p>Write <code>void sort3(int* a, int* b, int* c)</code>, which rearranges the three ints it points to so that <code>*a &lt;= *b &lt;= *c</code>. Three conditional swaps are enough. Write only the function; <code>swap</code> is provided. The checker declares three variables, calls <code>sort3(&amp;x, &amp;y, &amp;z)</code> and prints them.</p>`,
            starter: `void swap(int* p, int* q) {\n    int temp = *p;\n    *p = *q;\n    *q = temp;\n}\n\nvoid sort3(int* a, int* b, int* c) {\n    // your code here\n}`,
            solution: `void swap(int* p, int* q) {\n    int temp = *p;\n    *p = *q;\n    *q = temp;\n}\n\nvoid sort3(int* a, int* b, int* c) {\n    if (*a > *b) swap(a, b);\n    if (*b > *c) swap(b, c);\n    if (*a > *b) swap(a, b);\n}`,
            hints: ['Compare through the pointers: if (*a > *b) swap(a, b); The pointers are already addresses, so pass them straight to swap, as order2 did.', 'Three steps: order a and b; then order b and c, which puts the largest in c; then order a and b again, since the new b may be smaller than a.'],
            tests: [
              { name: 'x=3 y=1 z=2', main: '    int x = 3, y = 1, z = 2;\n    sort3(&x, &y, &z);\n    cout << x << " " << y << " " << z << endl;', expect: '1 2 3' },
              { name: 'x=9 y=9 z=-4', main: '    int x = 9, y = 9, z = -4;\n    sort3(&x, &y, &z);\n    cout << x << " " << y << " " << z << endl;', expect: '-4 9 9' },
              { name: 'already sorted', main: '    int x = 1, y = 2, z = 3;\n    sort3(&x, &y, &z);\n    cout << x << " " << y << " " << z << endl;', expect: '1 2 3' },
              { name: 'x=5 y=4 z=3', main: '    int x = 5, y = 4, z = 3;\n    sort3(&x, &y, &z);\n    cout << x << " " << y << " " << z << endl;', expect: '3 4 5' },
              { name: 'x=2 y=3 z=1', main: '    int x = 2, y = 3, z = 1;\n    sort3(&x, &y, &z);\n    cout << x << " " << y << " " << z << endl;', expect: '1 2 3' }
            ],
            mustContain: [{ re: /\*a|\*b|\*c/, msg: 'Follow the pointers with * to read the values they point to.' }],
            failTip: 'If 2 3 1 comes out as 2 1 3, you are missing the third comparison: after the largest moves to c, a and b may still be out of order.',
            followup: 'You changed three variables that belong to main from inside another function, and the only thing that crossed over was three addresses. This compare-and-swap step is also the building block of the sorting algorithms in Lesson 10.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>Every variable has an address; <code>&amp;x</code> is the address of <code>x</code>, and a pointer <code>int* p</code> is a variable that holds one.</li>
<li><code>*p</code> is the variable <code>p</code> points to: reading it reads that variable, assigning to it assigns to that variable.</li>
<li>The star declares a pointer after a type, follows a pointer before one, and multiplies between two values.</li>
<li>Arguments are still copied, but a copy of an address points to the original, so a function can change the caller's variables through <code>*</code> and return several results.</li>
<li>Give every pointer an address before following it. References (<code>int&amp;</code>) are the modern spelling of the same idea.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Arrays', summary: 'A row of values of one type: declaring and indexing, why nothing stops you running off the end, why an array\u2019s name is an address, and how functions share arrays.',
      blocks: [
        `<p>Picture a corridor of school lockers, all the same size, numbered from 0, standing shoulder to shoulder. That is an <em>array</em>: a fixed number of values of one type, stored next to each other in memory. It is the oldest data structure in computing and still the fastest, and it hides a famous danger. This lesson gives the rules, shows exactly why arrays are fast, and explains the bug behind some of the most expensive security holes in history.</p>
<h2>Declaring and using an array</h2>
<div class="stmt"><p><span class="kind">Rule (declaration).</span> <code><i>type</i> <i>name</i>[<i>N</i>];</code> declares an array of <i>N</i> values of the given type, where <i>N</i> is a constant known to the compiler. It may be given starting values in braces: <code>int scores[5] = {90, 72, 85, 60, 99};</code>. The size never changes.</p>
<p><span class="kind">Rule (elements).</span> The elements are <code><i>name</i>[0]</code> up to <code><i>name</i>[<i>N</i> − 1]</code>. Each one is an ordinary variable of the array's type: it can be read, assigned, and passed to a function.</p></div>
<p>Unlike a Python list, an array has no <code>len</code> and cannot grow. Its size is part of its type, fixed when the program is compiled, and you are responsible for remembering it. The usual habit is to give the size a name with <code>const</code>, so that it is written in only one place.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    const int N = 5;
    int scores[N] = {90, 72, 85, 60, 99};
    cout << scores[0] << " " << scores[N - 1] << endl;
    scores[1] = 75;                  // an element is an ordinary variable

    int total = 0;
    for (int i = 0; i < N; i++) {    // i = 0, 1, ..., N - 1
        total += scores[i];
    }
    cout << "average: " << total / (double) N << endl;
    return 0;
}`, caption: 'Prints 90 99, then average: 81.8. The loop runs i from 0 to N - 1, which by Lesson 3\u2019s counting rule is exactly N passes, one per element.' },
        `<p>Lesson 1's warning about uninitialised variables applies to every element: an array declared without starting values holds garbage. Standard C++ fills in zeros when you give <em>some</em> but not all of the starting values, as in <code>int a[5] = {1, 2};</code>, but the interpreter on this site does not, so on this site list every starting value.</p>
<h2>Running off the end</h2>
<p>Now the danger. Change the loop above to <code>i &lt;= N</code> and run it.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    const int N = 5;
    int scores[N] = {90, 72, 85, 60, 99};
    int total = 0;
    for (int i = 0; i <= N; i++) {   // one pass too many
        total += scores[i];
    }
    cout << total << endl;
    return 0;
}`, expectError: true, caption: 'This site stops at scores[5]: "index out of bound 5 >= 5". A real compiled program would not stop at all.' },
        `<div class="stmt"><p><span class="kind">Rule (bounds).</span> Using an index outside 0 … <i>N</i> − 1 is an error that C++ does <em>not</em> check. The program reads or writes whatever memory happens to lie beyond the array, and the result is undefined: it may print nonsense, change some other variable, crash immediately, or crash much later somewhere unrelated.</p></div>
<p>This is not a curiosity. In 1988 the Morris worm spread across the early internet partly by sending a program more characters than its array could hold, overwriting the memory beyond it. In 2014 the Heartbleed bug let attackers ask a server to send back "the 64,000 bytes starting here" from an array that was far shorter, so the server leaked whatever lay beyond it, including passwords and secret keys, from a large share of the world's secure websites. Both were, at bottom, a missing check that an index was less than a length. Write <code>i &lt; N</code>, and whenever an index comes from input or from arithmetic, ask what stops it going out of range.</p>
<h2>Why arrays are fast: an array is an address</h2>
<p>Lesson 5 said every variable has an address. The elements of an array sit next to each other, so if the first element is at address <i>A</i> and each element takes <i>s</i> bytes, element <i>i</i> is at address <i>A</i> + <i>i</i> × <i>s</i>. Finding it is one multiplication and one addition, however long the array is. This is the concrete reason C++, and nearly every language, counts from 0: the index <em>is</em> the distance from the start, measured in elements.</p>
<div class="stmt"><p><span class="kind">Rule (arrays and pointers).</span> Used in an expression, the name of an array stands for the address of its first element, a pointer. Adding an integer <i>i</i> to a pointer moves it <i>i</i> elements along (not <i>i</i> bytes; the compiler multiplies by the element size). And <code><i>a</i>[<i>i</i>]</code> means exactly <code>*(<i>a</i> + <i>i</i>)</code>: move <i>i</i> elements along, then follow the pointer.</p></div>
<p>Drag the slider to move along an array of six <code>int</code>s, four bytes each.</p>`,
        { fig: 'array', caption: 'arr + i is an address, four bytes further along for each step; *(arr + i) is the element there, and arr[i] is the same thing written more kindly.' },
        `<details class="reveal"><summary>Predict: with <code>int a[4] = {10, 20, 30, 40}; int* p = a;</code>, what are <code>*p</code>, <code>*(p + 2)</code> and <code>p[3]</code>? And if <code>a</code> starts at address 1000, what address is <code>p + 3</code>?</summary><p><code>10</code>, <code>30</code> and <code>40</code>: square brackets are pointer arithmetic in disguise, and they work on any pointer, not just on an array's name. <code>p + 3</code> is 1012: three elements along, and each <code>int</code> is four bytes.</p></details>
<p>One consequence surprises people: you cannot copy an array with <code>=</code>. <code>a = b;</code> with two arrays is rejected by real compilers, because the name <code>a</code> is not a variable that can be given a new value; it names a fixed place in memory. (This site's interpreter is lenient and silently accepts it, so the rule is yours to keep.) To copy an array, copy its elements one at a time in a loop.</p>
<h2>Counting with an array</h2>
<p>Because an index can be any integer expression, an array can use a <em>value</em> as a position. Here is a trick worth remembering: to count how often each dice face comes up, keep an array of counters and let the face itself choose which counter to increase. Twenty rolls, and a bar chart.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    const int ROLLS = 20;
    int rolls[ROLLS] = {3, 6, 1, 3, 4, 6, 6, 2, 5, 3, 6, 1, 4, 6, 2, 3, 5, 6, 3, 4};
    int counts[7] = {0, 0, 0, 0, 0, 0, 0};     // counts[1] ... counts[6]; counts[0] unused

    for (int i = 0; i < ROLLS; i++) {
        counts[rolls[i]]++;                    // the face picks the counter
    }

    for (int face = 1; face <= 6; face++) {
        cout << face << ": ";
        for (int k = 0; k < counts[face]; k++) {
            cout << "*";
        }
        cout << " (" << counts[face] << ")" << endl;
    }
    return 0;
}`, caption: 'Six came up six times. The array has seven counters so that face 6 can use counts[6]; the extra counts[0] costs one int and saves a "- 1" everywhere. Change a roll to 7 and see the bounds rule enforced.' },
        `<p>This is called a <em>tally</em> or <em>histogram</em>, and it is fast because it never searches: each roll goes straight to its counter in one step. Lesson 9 uses exactly this idea to test whether a simulated die is fair.</p>
<h2>Arrays and functions</h2>
<div class="stmt"><p><span class="kind">Rule (array parameters).</span> A parameter written <code>int arr[]</code> is really a pointer, <code>int* arr</code>. Calling <code>f(data, n)</code> passes the address of <code>data</code>'s first element, so the array is <em>not</em> copied: the function works on the caller's elements, and changes it makes are seen by the caller. The function cannot find out the array's length, so the length is passed as a separate parameter.</p></div>
<p>This is Lesson 5's pointer rule once more: the address is copied, and a copy of an address leads back to the original.</p>`,
        { play: `#include <iostream>
using namespace std;

int sum(int arr[], int n) {
    int total = 0;
    for (int i = 0; i < n; i++) {
        total += arr[i];
    }
    return total;
}

void doubleAll(int arr[], int n) {
    for (int i = 0; i < n; i++) {
        arr[i] = arr[i] * 2;
    }
}

int main() {
    int data[4] = {1, 2, 3, 4};
    cout << sum(data, 4) << endl;
    doubleAll(data, 4);
    cout << sum(data, 4) << endl;
    cout << data[3] << endl;
    return 0;
}`, caption: 'Prints 10, 20, 8. doubleAll returns nothing, yet main sees the change: the array was never copied, only its address.' },
        `<p>Passing <code>n</code> separately has a useful side effect: a function can work on just the first <code>n</code> elements of a larger array. The next example reads a count and then that many values into an array with room for 100, a common shape when the amount of input is not known in advance.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    const int MAX = 100;
    int values[MAX];
    int n;
    cin >> n;                       // how many values follow (at most MAX)
    for (int i = 0; i < n; i++) {
        cin >> values[i];
    }

    for (int i = n - 1; i >= 0; i--) {   // walk backwards
        cout << values[i] << " ";
    }
    cout << endl;
    return 0;
}`, stdin: '5\n3 17 4 12 9', caption: 'The first number of input is the count. The loop that walks backwards starts at n - 1, the last filled element, and stops after 0. What would happen if the input said 150?' },
        `<h2>Before the exercises</h2>
<p>Both exercises are functions that receive an array and its length. The first is an accumulator over the elements, like <code>sum</code>, but keeping the largest so far instead of a total; start it at <code>arr[0]</code>, never at 0, or an array of negative numbers would report 0, a value it does not even contain. The second pairs up elements from the two ends of the array. Here is a worked example of that pairing: a function that checks whether an array reads the same forwards and backwards.</p>`,
        { play: `#include <iostream>
using namespace std;

bool isPalindrome(int arr[], int n) {
    for (int i = 0; i < n / 2; i++) {      // only the first half
        if (arr[i] != arr[n - 1 - i]) {    // element i pairs with element n - 1 - i
            return false;
        }
    }
    return true;
}

int main() {
    int a[5] = {1, 2, 3, 2, 1};
    int b[4] = {1, 2, 2, 3};
    cout << isPalindrome(a, 5) << " " << isPalindrome(b, 4) << endl;
    return 0;
}`, caption: 'Prints 1 0. Element 0 pairs with n - 1, element 1 with n - 2, and so on; for n = 5 the middle element, 2, pairs with itself and needs no check. The loop stops at the middle, i < n / 2.' },
        { aside: `<p><b>Common mistakes in this lesson.</b> <code>arr[n]</code> when the last element is <code>arr[n - 1]</code>, or <code>i &lt;= n</code> in a loop. Assuming a real compiler will catch an index out of range: it will not. Leaving elements without starting values. Trying to copy an array with <code>=</code>. Forgetting to pass the length, or passing the wrong one. Declaring <code>int a[n]</code> with a variable <code>n</code>: this site allows it, standard C++ does not, so use a constant maximum. Starting a "largest so far" at 0.</p>` },
        {
          ex: {
            id: 'cp-6-1', title: 'Largest element',
            prompt: `<p>Write <code>int largest(int arr[], int n)</code>, returning the largest of the first <code>n</code> elements (you may assume <code>n</code> ≥ 1). Write only the function.</p>`,
            starter: `int largest(int arr[], int n) {\n    // your code here\n}`,
            solution: `int largest(int arr[], int n) {\n    int best = arr[0];\n    for (int i = 1; i < n; i++) {\n        if (arr[i] > best) {\n            best = arr[i];\n        }\n    }\n    return best;\n}`,
            hints: ['Start with best = arr[0], then look at the rest of the elements.', 'Loop i from 1 while i < n; whenever arr[i] > best, update best. Return best after the loop.'],
            tests: [
              { setup: '    int a[5] = {3, 9, 2, 7, 1};', call: 'largest(a, 5)', expect: '9' },
              { setup: '    int a[4] = {-5, -2, -9, -3};', call: 'largest(a, 4)', expect: '-2' },
              { setup: '    int a[2] = {42, 41};', call: 'largest(a, 2)', expect: '42' },
              { setup: '    int a[6] = {1, 2, 3, 4, 5, 6};', call: 'largest(a, 6)', expect: '6' },
              { setup: '    int a[5] = {1, 2, 3, 99, 100};', call: 'largest(a, 4)', expect: '99' }
            ],
            failTip: 'The last test passes n = 4 for an array of five: only the first n elements count. If the all-negative test fails, best started at 0 instead of arr[0].'
          }
        },
        {
          ex: {
            id: 'cp-6-2', title: 'Reverse in place',
            prompt: `<p>Write <code>void reverseArray(int arr[], int n)</code>, which reverses the order of the first <code>n</code> elements <em>in place</em>, with no second array. Swap element 0 with element <code>n - 1</code>, element 1 with element <code>n - 2</code>, and so on, stopping in the middle, just as <code>isPalindrome</code> compared them. Write only the function; the checker prints the array afterwards.</p>`,
            starter: `void reverseArray(int arr[], int n) {\n    // your code here\n}`,
            solution: `void reverseArray(int arr[], int n) {\n    for (int i = 0; i < n / 2; i++) {\n        int temp = arr[i];\n        arr[i] = arr[n - 1 - i];\n        arr[n - 1 - i] = temp;\n    }\n}`,
            hints: ['Element i pairs with element n - 1 - i. Swap them with a temporary variable, as swap did in Lesson 5.', 'Loop i from 0 while i < n / 2. Going past the middle would swap every pair back again.'],
            tests: [
              { name: '{1, 2, 3, 4, 5}', main: '    int a[5] = {1, 2, 3, 4, 5};\n    reverseArray(a, 5);\n    for (int i = 0; i < 5; i++) cout << a[i] << " ";\n    cout << endl;', expect: '5 4 3 2 1' },
              { name: '{7, 8}', main: '    int a[2] = {7, 8};\n    reverseArray(a, 2);\n    cout << a[0] << " " << a[1] << endl;', expect: '8 7' },
              { name: '{4, 3, 2, 1}', main: '    int a[4] = {4, 3, 2, 1};\n    reverseArray(a, 4);\n    for (int i = 0; i < 4; i++) cout << a[i] << " ";\n    cout << endl;', expect: '1 2 3 4' },
              { name: 'first 3 of 5', main: '    int a[5] = {1, 2, 3, 4, 5};\n    reverseArray(a, 3);\n    for (int i = 0; i < 5; i++) cout << a[i] << " ";\n    cout << endl;', expect: '3 2 1 4 5' },
              { name: 'one element', main: '    int a[3] = {9, 8, 7};\n    reverseArray(a, 1);\n    for (int i = 0; i < 3; i++) cout << a[i] << " ";\n    cout << endl;', expect: '9 8 7' }
            ],
            mustNotContain: [{ re: /int\s+\w+\s*\[\s*\d+\s*\]/, msg: 'Reverse in place, without declaring a second array.' }],
            failTip: 'If the array comes out unchanged, the loop went all the way to n and swapped each pair twice. Stop at n / 2.',
            followup: 'For n = 5 the loop runs twice (i = 0 and 1), and the middle element stays put. Integer division makes n / 2 right for both odd and even n.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li><code>int a[N]</code> is <i>N</i> ints side by side, <code>a[0]</code> to <code>a[N - 1]</code>, with <i>N</i> a constant; give every element a starting value.</li>
<li>C++ does not check indexes. Going out of range is undefined behaviour and has caused famous security holes: write <code>i &lt; N</code> and think about every index.</li>
<li>An array's name stands for the address of its first element; <code>a[i]</code> is <code>*(a + i)</code>, found in one step, which is why indexes start at 0.</li>
<li>An array parameter is a pointer: the function sees the caller's elements, and needs the length passed separately.</li>
<li>An array of counters indexed by a value is a tally; pairing element <i>i</i> with <i>n</i> − 1 − <i>i</i> handles both ends at once.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Characters and strings', summary: 'Text as numbers, and a string as an array of char with a zero at the end: walking it, building it, comparing it, and sending a secret message.',
      blocks: [
        `<p>Inside a computer there are no letters, only numbers. The word <code>Hi!</code> is stored as the three numbers 72, 105 and 33, followed by a 0 that says "the text stops here". This lesson is about that one design decision, made for the C language in the early 1970s and inherited by C++: how it makes text simple, how it makes text dangerous, and how to work with it one character at a time. At the end you will write a function that turns messages into secret code.</p>
<h2>Characters are numbers</h2>
<div class="stmt"><p><span class="kind">Rule (characters).</span> A <code>char</code> holds one character as its code, a small integer. In single quotes, <code>'A'</code> is a <code>char</code> whose value is 65. The codes of <code>'a'</code> to <code>'z'</code> are consecutive, as are those of <code>'A'</code> to <code>'Z'</code> and of <code>'0'</code> to <code>'9'</code> (Lesson 2). Arithmetic on a <code>char</code> is arithmetic on its code, and <code>(char)</code> turns a number back into a character.</p></div>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    char c = 'A';
    cout << c << " has code " << (int) c << endl;
    cout << (char) (c + 1) << (char) (c + 2) << endl;          // the next two letters
    cout << 'z' - 'a' << endl;                                 // how far apart?
    char lower = 'g';
    cout << (char) (lower - 'a' + 'A') << endl;                // the capital of g
    return 0;
}`, caption: 'Prints A has code 65, then BC, then 25, then G. The last line moves g from the lower-case range to the same place in the capital range: that one idea handles every letter.' },
        `<details class="reveal"><summary>Predict: what are <code>'7' - '0'</code> and <code>'a' - 'A'</code>?</summary><p><code>7</code>: the digit characters are consecutive, so subtracting <code>'0'</code> turns a digit character into its value. And <code>32</code>: every lower-case letter's code is 32 more than its capital's. You never need to memorise the codes; subtracting a known character gives you the distance.</p></details>
<h2>Strings: an array with a marker at the end</h2>
<div class="stmt"><p><span class="kind">Rule (C strings).</span> A string is an array of <code>char</code> holding the characters in order, followed by the character with code 0, written <code>'\\0'</code> and called the <em>null terminator</em>. A string literal in double quotes is exactly this: <code>"cat"</code> occupies four <code>char</code>s, and the fourth is <code>'\\0'</code>. <code>char word[] = "cat";</code> declares an array of four <code>char</code>s holding it.</p></div>
<p>The terminator is how every piece of code knows where the text ends without being told its length: walk the array until you meet <code>'\\0'</code>. Notice the two kinds of quotes: <code>'a'</code> is one <code>char</code>, but <code>"a"</code> is an array of two, the letter and the terminator.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    char word[] = "hello";
    cout << word << endl;                  // cout prints up to the terminator
    cout << word[0] << word[4] << endl;
    cout << (int) word[5] << endl;         // the terminator: code 0

    int length = 0;
    while (word[length] != '\\0') {         // walk to the marker
        length++;
    }
    cout << "length " << length << endl;

    word[0] = 'j';                         // an ordinary array: change it
    cout << word << endl;
    return 0;
}`, caption: 'Prints hello, ho, 0, length 5, jello. A string is an ordinary array, so indexing, changing and looping all work as in Lesson 6.' },
        `<details class="reveal"><summary>Predict: how many <code>char</code>s does <code>char s[] = "Ojibwe";</code> occupy, and what is <code>s[6]</code>?</summary><p>Seven: six letters and the terminator, and <code>s[6]</code> is the terminator, <code>'\\0'</code>. The length of the text, 6, is always one less than the size of the array that holds it.</p></details>
<h2>Reading and building strings</h2>
<p><code>cin &gt;&gt; word</code> reads one word, up to the first space, into a <code>char</code> array and adds the terminator for you. The array must be big enough for the longest possible word <em>plus one</em>. A longer word spills past the end of the array: this is the <em>buffer overflow</em> from Lesson 6, and reading text is the classic way it happens.</p>
<p>When you build a string yourself, you must put the terminator on yourself. Here is a word reversed, and its vowels counted.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    char word[30];
    cin >> word;

    int len = 0;
    while (word[len] != '\\0') len++;

    char reversed[30];
    for (int i = 0; i < len; i++) {
        reversed[i] = word[len - 1 - i];     // Lesson 6's pairing: i with len - 1 - i
    }
    reversed[len] = '\\0';                    // do not forget this
    cout << reversed << endl;

    int vowels = 0;
    for (int i = 0; i < len; i++) {
        char c = word[i];
        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') {
            vowels++;
        }
    }
    cout << vowels << " vowels" << endl;
    return 0;
}`, stdin: 'stressed', caption: 'stressed reversed is desserts. On this site, leaving out the terminator line happens to work, because the unused cells hold zeros; on a real computer they hold whatever was there before, and cout keeps printing garbage until it happens to meet a zero.' },
        `<h2>The cstring library, and why == does not compare strings</h2>
<p>The header <code>&lt;cstring&gt;</code> provides <code>strlen</code>, the length, and <code>strcmp</code>, which compares two strings in dictionary order: negative if the first comes first, 0 if they are equal, positive if the first comes later. There is no magic in them. They are loops that stop at the terminator, exactly like the one you just wrote.</p>`,
        { play: `#include <iostream>
#include <cstring>
using namespace std;

int main() {
    char a[] = "apple";
    char b[] = "apricot";
    char c[] = "apple";
    cout << strlen(a) << " " << strlen(b) << endl;
    cout << strcmp(a, b) << endl;       // negative: apple comes first
    cout << strcmp(a, c) << endl;       // 0: the same text
    cout << (a == c) << endl;           // 0: two different arrays!
    return 0;
}`, caption: 'a and c hold the same text, yet a == c is false. By Lesson 6\u2019s rule the name of an array stands for its address, so == asks "are these the same array?", and they are not. strcmp compares the characters.' },
        `<p>This is the single most common string bug in C and C++: <code>if (answer == "yes")</code> compiles, and is always false. Compare text with <code>strcmp(answer, "yes") == 0</code>.</p>
<p>Modern C++ also has <code>std::string</code>, which manages its own memory, knows its length, grows as needed, and does compare with <code>==</code>. It is what you should use in real programs; the interpreter here does not include it. It is built on exactly the ideas of this lesson, and a great deal of existing code, including every operating system, still works with character arrays directly.</p>
<h2>Before the exercises</h2>
<p>Both exercises walk a string with the loop <code>for (int i = 0; text[i] != '\\0'; i++)</code>, which needs no length. The first counts matching characters. The second changes the string in place, turning each lower-case letter into another one, and leaving everything else alone. Here is a worked example of that second shape: capitalising a string in place.</p>`,
        { play: `#include <iostream>
using namespace std;

void toUpper(char text[]) {
    for (int i = 0; text[i] != '\\0'; i++) {
        if (text[i] >= 'a' && text[i] <= 'z') {       // only lower-case letters
            text[i] = (char) (text[i] - 'a' + 'A');  // same place, capital range
        }
    }
}

int main() {
    char msg[] = "meet me at 3pm!";
    toUpper(msg);
    cout << msg << endl;
    return 0;
}`, caption: 'Prints MEET ME AT 3PM!. Digits, spaces and punctuation fail the range test and are left alone. The array is changed in place, because an array parameter is a pointer (Lesson 6).' },
        `<p>The secret-message exercise uses the same range test, plus one more idea. A shift of 3 moves <code>x</code> to <code>a</code>, wrapping round the end of the alphabet. Work with the letter's position <code>p = text[i] - 'a'</code>, from 0 to 25. The shifted position is <code>(p + k) % 26</code>, which wraps round because remainders mod 26 go 24, 25, 0, 1, … (the mathematics course's Lesson 4 calls this arithmetic modulo 26). Then turn the position back into a letter by adding <code>'a'</code>.</p>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Forgetting the terminator when building a string by hand. Making an array exactly as long as the text, with no room for the terminator. Comparing strings with <code>==</code>, which compares addresses. Mixing up <code>'a'</code>, one <code>char</code>, and <code>"a"</code>, an array of two. Changing characters that are not letters when only letters should change. Forgetting the <code>% 26</code>, so letters near the end of the alphabet shift into punctuation.</p>` },
        {
          ex: {
            id: 'cp-7-1', title: 'Count a character',
            prompt: `<p>Write <code>int countChar(char text[], char c)</code>, the number of times <code>c</code> occurs in the null-terminated string <code>text</code>. Walk the array until <code>'\\0'</code>; do not use <code>&lt;cstring&gt;</code>. Write only the function.</p>`,
            starter: `int countChar(char text[], char c) {\n    // your code here\n}`,
            solution: `int countChar(char text[], char c) {\n    int count = 0;\n    for (int i = 0; text[i] != '\\0'; i++) {\n        if (text[i] == c) {\n            count++;\n        }\n    }\n    return count;\n}`,
            hints: ["The loop condition is text[i] != '\\0': you do not know the length in advance, and you do not need it.", 'Compare each character with c and count the matches; return the count after the loop.'],
            tests: [
              { setup: '    char s[] = "banana";', call: "countChar(s, 'a')", expect: '3' },
              { setup: '    char s[] = "banana";', call: "countChar(s, 'z')", expect: '0' },
              { setup: '    char s[] = "aaaa";', call: "countChar(s, 'a')", expect: '4' },
              { setup: '    char s[] = "Mississippi";', call: "countChar(s, 's')", expect: '4' },
              { setup: '    char s[] = "a";', call: "countChar(s, 'a')", expect: '1' }
            ],
            mustNotContain: [{ re: /strlen|strchr/, msg: 'Walk the array yourself, stopping at the null terminator.' }],
            followup: 'Mississippi has one capital M and four s\u2019s; countChar(s, \'m\') would be 0, because \'m\' and \'M\' are different codes.'
          }
        },
        {
          ex: {
            id: 'cp-7-2', title: 'Secret messages',
            prompt: `<p>Write <code>void shift(char text[], int k)</code>, which changes <code>text</code> in place by moving every lower-case letter <code>k</code> places forward in the alphabet, wrapping round from <code>z</code> to <code>a</code>. Everything that is not a lower-case letter stays as it is. With <code>k</code> = 3, <code>"hello, world"</code> becomes <code>"khoor, zruog"</code>, and <code>"xyz"</code> becomes <code>"abc"</code>. You may assume 0 ≤ <code>k</code> &lt; 26. Julius Caesar is said to have used this code, with a shift of 3.</p>`,
            starter: `void shift(char text[], int k) {\n    // your code here\n}`,
            solution: `void shift(char text[], int k) {\n    for (int i = 0; text[i] != '\\0'; i++) {\n        if (text[i] >= 'a' && text[i] <= 'z') {\n            int p = text[i] - 'a';\n            text[i] = (char) ('a' + (p + k) % 26);\n        }\n    }\n}`,
            hints: ["Use toUpper's loop and range test: for each i until the terminator, if text[i] is between 'a' and 'z'...", "...compute its position p = text[i] - 'a', then store (char) ('a' + (p + k) % 26)."],
            tests: [
              { name: 'hello, world by 3', main: '    char s[] = "hello, world";\n    shift(s, 3);\n    cout << s << endl;', expect: 'khoor, zruog' },
              { name: 'xyz by 3 (wraps)', main: '    char s[] = "xyz";\n    shift(s, 3);\n    cout << s << endl;', expect: 'abc' },
              { name: 'shift by 0', main: '    char s[] = "same";\n    shift(s, 0);\n    cout << s << endl;', expect: 'same' },
              { name: 'capitals and digits untouched', main: '    char s[] = "Ab 9z!";\n    shift(s, 1);\n    cout << s << endl;', expect: 'Ac 9a!' },
              { name: 'there and back', main: '    char s[] = "attack at dawn";\n    shift(s, 10);\n    shift(s, 16);\n    cout << s << endl;', expect: 'attack at dawn' }
            ],
            failTip: 'If xyz becomes {|}, the % 26 is missing. If capitals or spaces change, the range test is missing.',
            followup: 'The last test shifted by 10 and then by 16, and got the message back, because 10 + 16 = 26 is a full turn of the alphabet. So shifting by 26 − k decodes a message shifted by k. With only 25 possible keys, a spy could try them all in seconds: the Python course\u2019s final project does exactly that.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A <code>char</code> is a small number; letters and digits have consecutive codes, so <code>c - 'a'</code> is a letter's position and <code>'7' - '0'</code> is 7.</li>
<li>A C string is a <code>char</code> array ending in <code>'\\0'</code>; <code>"cat"</code> needs four <code>char</code>s. Walk it until the terminator, and put one on any string you build.</li>
<li><code>cin &gt;&gt;</code> into an array that is too small overflows it.</li>
<li><code>==</code> on two strings compares addresses; <code>strcmp</code> compares text. <code>strlen</code> and <code>strcmp</code> are just loops to the terminator.</li>
<li>Changing a string in place: test the range, then work with positions and <code>% 26</code>.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Finding and fixing bugs', summary: 'Three kinds of wrong, reading compiler errors, the bugs C++ lets you make, and debugging as an experiment: reproduce, shrink, hypothesise, test, with a moth and an exploding rocket along the way.',
      blocks: [
        `<p>On 9 September 1947, engineers working on the Harvard Mark II computer found that a relay had stopped working. Inside it was a moth. They taped it into the logbook with the note "First actual case of bug being found", and the word stuck, although engineers had called faults "bugs" for decades before that. Since then, every programmer has spent more time finding bugs than writing new code. This lesson is about doing that calmly and systematically: knowing which kind of bug you are facing, reading what the compiler tells you, recognising the bugs that C++ lets through, and hunting the rest down like a scientist.</p>
<h2>Three kinds of wrong</h2>
<div class="tbl-wrap"><table>
<tr><th>kind</th><th>when you find out</th><th>examples</th></tr>
<tr><td><b>Compile error</b></td><td>before the program runs; nothing runs at all</td><td>a missing semicolon, a name that was never declared, a value of the wrong type</td></tr>
<tr><td><b>Runtime error</b></td><td>while it runs: it stops, crashes, or corrupts memory</td><td>dividing by zero, reading past the end of an array</td></tr>
<tr><td><b>Logic error</b></td><td>it runs perfectly and gives the wrong answer</td><td>integer division where you wanted a fraction, a loop that misses one element</td></tr>
</table></div>
<p>The kinds are listed from easiest to hardest. A compile error is found for you and points at a line. A logic error announces nothing: you only know about it if you check the answer. So the best habit of all is to turn later kinds of bug into earlier ones, for example by testing, which turns a hidden logic error into a visible failure.</p>
<h2>Reading a compiler error</h2>
<div class="stmt"><p><span class="kind">Rule 1.</span> Fix the <em>first</em> error only, then compile again. One mistake can confuse the compiler into reporting a page of follow-on errors that disappear once the first is fixed.</p>
<p><span class="kind">Rule 2.</span> Look at the line the compiler reports, <em>and the line above it</em>. A missing semicolon or bracket is usually only noticed when the compiler reaches the next line and finds something it did not expect.</p></div>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    int total = 0
    for (int i = 1; i <= 5; i++) {
        totl += i;
    }
    cout << "sum: " << total << endl;
    return 0;
}`, expectError: true, caption: 'Two errors. The first message points at line 6, but the mistake, a missing semicolon, is at the end of line 5 (Rule 2). Fix it, run again, and the second error appears: totl was never declared. Fix that too.' },
        `<h2>Bugs that compile</h2>
<p>These are the C++ classics. Every one of them compiles without complaint, and you have met most of them already.</p>
<div class="tbl-wrap"><table>
<tr><th>bug</th><th>what goes wrong</th><th>from</th></tr>
<tr><td>integer division</td><td><code>double avg = total / count;</code> divides two <code>int</code>s first and throws the fraction away</td><td>Lesson 1</td></tr>
<tr><td>uninitialised variable</td><td><code>int total;</code> starts with whatever was in memory, which may differ from run to run</td><td>Lesson 1</td></tr>
<tr><td><code>=</code> for <code>==</code>, missing braces</td><td>the condition assigns; the second indented line is not in the <code>if</code></td><td>Lesson 2</td></tr>
<tr><td>off by one</td><td><code>i &lt;= n</code> over an array of <code>n</code> elements reads one past the end</td><td>Lessons 3 and 6</td></tr>
<tr><td>integer overflow</td><td>an <code>int</code> holds up to about 2.1 billion; one more wraps round to a large negative number</td><td>Lesson 1</td></tr>
<tr><td><code>==</code> on strings</td><td>compares two addresses, not two pieces of text</td><td>Lesson 7</td></tr>
</table></div>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    int scores[3] = {80, 90, 85};
    int total = 0;
    for (int i = 0; i < 3; i++) {
        total += scores[i];
    }
    double average = total / 3;
    cout << "average: " << average << endl;

    int big = 2147483647;
    cout << big << endl;
    big = big + 1;
    cout << big << endl;
    return 0;
}`, expectError: true, caption: 'The average prints as 85, not 85.3333: integer division, then conversion. Then the overflow: this site stops, but a real program would silently print -2147483648. Fix the division with 3.0 and delete the overflow, and it runs cleanly.' },
        `<p>Overflow has a famous victim. On 4 June 1996, the first Ariane 5 rocket veered off course and was destroyed 37 seconds after launch. Its guidance software converted a 64-bit floating-point measurement of the rocket's sideways speed into a 16-bit integer, whose largest value is 32,767. The code had worked perfectly on the slower Ariane 4, where the number never grew that large; on the faster Ariane 5 it did, the conversion failed, and the guidance system shut down. The same thing in miniature:</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    double sideways = 40000.5;      // fine for a double
    short guidance = sideways;      // a short holds at most 32767
    cout << guidance << endl;
    return 0;
}`, expectError: true, caption: 'This site reports the overflow. A real compiler accepts the line, perhaps with a warning, and the result is a meaningless number. A type is a promise about a range of values; the bug is a value that breaks the promise.' },
        `<h2>Debugging is an experiment</h2>
<p>When a program runs and gives the wrong answer, staring at the code and changing things at random rarely works. What works is the method of a scientist: form a guess about where the fault is, design an experiment that could prove the guess wrong, and run it.</p>
<div class="stmt"><p><span class="kind">The debugging loop.</span> 1. <em>Reproduce</em> the bug: find an input that makes it happen every time. 2. <em>Shrink</em> the input until it is as small as possible while still failing, small enough to work out the right answer by hand. 3. <em>Hypothesise</em>: say exactly where you think the program first goes wrong. 4. <em>Test</em> the hypothesis by printing the values at that point. 5. <em>Fix</em> the fault, then run all your earlier tests again, to make sure the fix broke nothing else.</p></div>
<p>The tool for step 4 is <code>cout</code>. Print the values you believe are right at the points where you believe they are still right. The bug lies between the last print that looks correct and the first that looks wrong.</p>`,
        { play: `#include <iostream>
using namespace std;

int countEvens(int arr[], int n) {
    int count = 0;
    for (int i = 1; i < n; i++) {
        cout << "looking at arr[" << i << "] = " << arr[i] << endl;   // debugging print
        if (arr[i] % 2 == 0) {
            count++;
        }
    }
    return count;
}

int main() {
    int data[4] = {2, 4, 5, 6};
    cout << countEvens(data, 4) << endl;
    return 0;
}`, caption: 'The answer should be 3 but it prints 2. The debugging print shows which element is never looked at. Fix the bug, run, then delete the print.' },
        `<details class="reveal"><summary>Predict: a function has 64 lines, and a debugging print placed after any line can tell you whether things are still right there. If you always put the next print in the middle of the lines still under suspicion, how many prints do you need, at most, to find the first wrong line?</summary><p>Six. Each print cuts the suspect region in half: 64, 32, 16, 8, 4, 2, 1. This is binary search, which C++ Lesson 10 turns into an algorithm, and it is why debugging a huge program is less hopeless than it sounds: a million lines need only about twenty well-placed experiments.</p></details>
<p>One more technique sounds silly and works astonishingly often. Explain the code, line by line and out loud, to someone who knows nothing about it, or even to a rubber duck on your desk. Having to say what each line does forces you to notice the line that does not do what you meant. Programmers really do call this <em>rubber duck debugging</em>.</p>
<h2>Catching bugs before they hide</h2>
<p>The cheapest bug is the one a test finds the moment you write it. Real C++ has an <code>assert</code> for this; the interpreter on this site does not include it, so here is a homemade version, a function that counts passing checks and reports failing ones. Choose tests on purpose: an ordinary case, and the <em>edge cases</em> where bugs live, such as 0, 1, a negative number, an empty range, or a value exactly on a boundary.</p>`,
        { play: `#include <iostream>
using namespace std;

int passed = 0, failed = 0;

void check(bool ok, const char* what) {
    if (ok) {
        passed++;
    } else {
        failed++;
        cout << "FAILED: " << what << endl;
    }
}

int sumTo(int n) {                 // should be 1 + 2 + ... + n
    int total = 0;
    for (int i = 1; i < n; i++) {
        total += i;
    }
    return total;
}

int main() {
    check(sumTo(0) == 0, "the sum up to 0 should be 0");
    check(sumTo(1) == 1, "the sum up to 1 should be 1");
    check(sumTo(4) == 10, "the sum up to 4 should be 10");
    check(sumTo(100) == 5050, "the sum up to 100 should be 5050");
    cout << passed << " passed, " << failed << " failed" << endl;
    return 0;
}`, caption: 'Three of the four checks fail, and the one that passes, sumTo(0), is exactly the case that cannot see the bug. The edge case sumTo(1) points straight at it. Fix the loop condition and run the checks again.' },
        `<h2>Why this site is kinder than a real compiler</h2>
<p>Reading past an array, using an uninitialised variable and overflowing an <code>int</code> are <em>undefined behaviour</em> in real C++: the language makes no promise about what happens. Often nothing visible goes wrong, until the day it does. The interpreter on this site stops and tells you. When you move to a real compiler, ask it to tell you too: <code>g++ -Wall -Wextra</code> turns on many warnings, and <code>-fsanitize=address,undefined</code> makes the program check itself while it runs, much as this site does.</p>
<h2>Before the exercises</h2>
<p>The first exercise is all compile errors: apply the two rules, one error at a time. The second has two logic errors in a function that compiles and runs. Use the loop: work out the right answer for a small input by hand, predict what the buggy code returns, and let the difference tell you where to look. Here is the method on a different function, which should return the largest of the first <code>n</code> elements.</p>`,
        { play: `#include <iostream>
using namespace std;

int largest(int arr[], int n) {
    int best = 0;                        // hypothesis: wrong for all-negative arrays
    for (int i = 0; i < n; i++) {
        if (arr[i] > best) {
            best = arr[i];
        }
    }
    return best;
}

int main() {
    int a[3] = {3, 9, 2};
    int b[3] = {-5, -2, -9};             // a small input where the answer is known: -2
    cout << largest(a, 3) << " " << largest(b, 3) << endl;
    return 0;
}`, caption: 'It prints 9 0. The ordinary test passes and the edge case fails, which confirms the hypothesis: 0 is not in the array at all. The fix is best = arr[0], as in Lesson 6.' },
        { aside: `<p><b>A debugging checklist.</b> Fix the first compiler error, then compile again. Check the line above the one reported. Reproduce the bug, then shrink the input until you can work out the right answer by hand. Say where you think it goes wrong, then print the values there to find out. Change one thing at a time, and run all your tests after every change. Initialise everything. Test the edge cases: 0, 1, negative, empty, on the boundary.</p>` },
        {
          ex: {
            id: 'cp-8-1', title: 'Make it compile',
            prompt: `<p>The program below is meant to read a whole number and print <code>even</code> or <code>odd</code>. It has <b>three</b> compile errors and no logic errors. Fix them, one at a time, without changing what the program does.</p>`,
            starter: `#include <iostream>\nusing namespace std\n\nint main() {\n    int n;\n    cin >> number;\n    if (n % 2 == 0) {\n        cout << "even" << endl\n    } else {\n        cout << "odd" << endl;\n    }\n    return 0;\n}`,
            solution: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    if (n % 2 == 0) {\n        cout << "even" << endl;\n    } else {\n        cout << "odd" << endl;\n    }\n    return 0;\n}`,
            sampleStdin: '7',
            hints: ['Two semicolons are missing. For each error, look at the reported line and the line above it.', 'One name is used that was never declared. Which variable did the program actually declare?'],
            tests: [{ stdin: '7', expect: 'odd' }, { stdin: '10', expect: 'even' }, { stdin: '0', expect: 'even' }, { stdin: '-3', expect: 'odd' }],
            mustContain: [{ re: /\bif\b/, msg: 'Keep the if / else structure; just fix the errors.' }],
            followup: 'The test with -3 checks an edge case: in C++, -3 % 2 is -1, not 1, but it is still not 0, so the program correctly says odd.'
          }
        },
        {
          ex: {
            id: 'cp-8-2', title: 'Fix the logic bugs',
            prompt: `<p>The function below should return the average of the first <code>n</code> elements as a <code>double</code>, but it has <b>two</b> logic bugs. It compiles and runs. First work out by hand what it returns for <code>{2, 4, 6, 8}</code>; the right answer is 5. Then fix it. Keep the loop.</p>`,
            starter: `double average(int arr[], int n) {\n    int total = 0;\n    for (int i = 1; i < n; i++) {\n        total += arr[i];\n    }\n    return total / n;\n}`,
            solution: `double average(int arr[], int n) {\n    int total = 0;\n    for (int i = 0; i < n; i++) {\n        total += arr[i];\n    }\n    return (double) total / n;\n}`,
            hints: ['By hand: the loop adds 4 + 6 + 8 = 18, and 18 / 4 in integer division is 4. Which element was skipped, and what happened to the fraction?', 'Start the loop at 0. Then convert before dividing: (double) total / n.'],
            tests: [
              { setup: '    int a[4] = {2, 4, 6, 8};', call: 'average(a, 4)', expect: '5' },
              { setup: '    int a[3] = {1, 2, 4};', call: 'average(a, 3)', expect: '2.33333' },
              { setup: '    int a[2] = {10, 0};', call: 'average(a, 1)', expect: '10' },
              { setup: '    int a[4] = {1, 1, 1, 2};', call: 'average(a, 4)', expect: '1.25' },
              { setup: '    int a[2] = {-3, 4};', call: 'average(a, 2)', expect: '0.5' }
            ],
            mustContain: [{ re: /\bfor\b/, msg: 'Keep the loop; the point is to find the bugs in it.' }],
            failTip: 'If the first test gives 4 or 4.5, only one bug is fixed. (double) (total / n) is too late: the division has already thrown the fraction away.',
            followup: 'The buggy version returned 4 for {2, 4, 6, 8}: close enough to 5 to look plausible. Logic errors hide exactly like that, which is why you check answers you can work out by hand.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>Compile errors, runtime errors and logic errors are found in that order of ease; testing turns hidden logic errors into visible failures.</li>
<li>Fix the first compiler error, then compile again; look at the reported line and the one above.</li>
<li>Integer division, uninitialised variables, <code>=</code> for <code>==</code>, off-by-one, overflow and <code>==</code> on strings all compile. Overflow brought down Ariane 5.</li>
<li>Debug like a scientist: reproduce, shrink, hypothesise, print to test, fix, and rerun every test. Halving the suspect region finds the fault quickly.</li>
<li>Real compilers do not check bounds or initialisation; turn on warnings and sanitizers.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Randomness and simulation', summary: 'Where a computer\u2019s random numbers come from, how to shape them into dice and coins, seeds, why more trials help only slowly, and estimating chances (and \u03c0) by simulation.',
      blocks: [
        `<p>In 1946 the mathematician Stanisław Ulam was recovering from an illness and passing the time with games of solitaire. He wondered what the chance was that a game would come out, tried to calculate it, and gave up: the combinations were hopeless. Then he had a better idea. Why not just play a hundred games and count how many came out? With the new electronic computers, you could play thousands. His colleagues named the method after the casino at Monte Carlo, and it was soon being used to design nuclear reactors. Today <em>Monte Carlo simulation</em> prices insurance, forecasts weather and elections, and plans rocket launches. This lesson builds it from the bottom: where a computer gets random numbers at all, how to turn them into dice and coins, and how much to trust what a simulation tells you.</p>
<h2>Numbers that only look random</h2>
<p>A computer follows instructions exactly, so it cannot really produce chance. What it produces instead are <em>pseudorandom</em> numbers: a sequence computed by a fixed rule, designed so that it looks random. Here is a small generator of the kind used for decades, a <em>linear congruential generator</em>: multiply the last number by a constant, add another constant, and keep the remainder (mathematics course, Lesson 4). These particular constants are the ones the 1981 Sinclair ZX81 home computer used.</p>`,
        { play: `#include <iostream>
using namespace std;

int state = 1;                           // the seed: where the sequence starts

int next() {
    state = (state * 75 + 74) % 65537;   // x becomes (75x + 74) mod 65537
    return state;
}

int main() {
    for (int i = 0; i < 8; i++) {
        cout << next() << " ";
    }
    cout << endl;
    return 0;
}`, caption: 'The numbers jump about with no obvious pattern, yet the rule is simple and completely determined. Run it again: exactly the same numbers. Change the starting state to 2 and you get a different sequence.' },
        `<div class="stmt"><p><span class="kind">Rule (rand).</span> After <code>#include &lt;cstdlib&gt;</code>, each call <code>rand()</code> returns the next number of a pseudorandom sequence, a whole number from 0 up to the constant <code>RAND_MAX</code> (on this site 2,147,483,647). <code>srand(<i>s</i>)</code> sets the <em>seed</em>, the starting point of the sequence. Without a call to <code>srand</code>, the seed is always the same, so every run gives the same numbers.</p></div>
<h2>Dice, coins and ranges</h2>
<p><code>rand()</code> gives a huge number; a game wants 1 to 6. The remainder operator squeezes it into range: <code>rand() % 6</code> is a whole number from 0 to 5, and adding 1 shifts that to 1 to 6.</p>
<div class="stmt"><p><span class="kind">Rule (a range).</span> <code>rand() % <i>n</i> + <i>lo</i></code> is a whole number from <i>lo</i> to <i>lo</i> + <i>n</i> − 1: <i>n</i> possible values, starting at <i>lo</i>.</p></div>`,
        { play: `#include <iostream>
#include <cstdlib>
using namespace std;

int main() {
    cout << rand() << endl;             // some large number
    cout << rand() % 6 + 1 << endl;     // a die: 1 to 6
    cout << rand() % 6 + 1 << endl;
    cout << rand() % 2 << endl;         // a coin: 0 or 1
    return 0;
}`, caption: 'Run it several times: the same four numbers every time, because the seed never changes. That is not a bug in rand; it is the rule.' },
        `<details class="reveal"><summary>Predict: what values can <code>rand() % 10 + 5</code> produce? And how would you get a random number from −3 to 3?</summary><p>5 to 14: <code>% 10</code> gives 0 to 9, then add 5. For −3 to 3 there are seven values starting at −3, so <code>rand() % 7 - 3</code>. Counting the values first, then choosing the starting point, avoids off-by-one mistakes.</p></details>
<p>One subtlety, for the careful. The remainder trick is very slightly unfair unless <code>RAND_MAX + 1</code> is a multiple of <i>n</i>. Imagine a tiny generator whose <code>RAND_MAX</code> is 7, giving 0 to 7, used with <code>% 3</code>: the remainders of 0, 1, …, 7 are 0, 1, 2, 0, 1, 2, 0, 1, so 0 and 1 each come up three times in eight and 2 only twice. With the real <code>RAND_MAX</code> the imbalance for a die is about one part in 350 million, far too small to matter in a game, but a program that shuffles cards for real money must use a more careful method.</p>
<h2>Seeds</h2>
<p>A fixed seed means a fixed sequence. That is a nuisance in a game, where every player would get the same dice, and a gift when debugging, because a bug happens the same way every time. Real programs seed from the clock with <code>srand(time(0))</code>, after <code>#include &lt;ctime&gt;</code>, so that each run starts somewhere different.</p>`,
        { play: `#include <iostream>
#include <cstdlib>
using namespace std;

int main() {
    srand(42);
    cout << rand() % 100 << " " << rand() % 100 << " " << rand() % 100 << endl;
    srand(42);
    cout << rand() % 100 << " " << rand() % 100 << " " << rand() % 100 << endl;
    srand(7);
    cout << rand() % 100 << " " << rand() % 100 << " " << rand() % 100 << endl;
    return 0;
}`, caption: 'The same seed replays the same sequence; a different seed gives a different one. Add #include <ctime> and srand(time(0)), and each run differs.' },
        `<h2>How much can you trust a simulation?</h2>
<p>A fair die shows each face with probability 1/6. Roll it 60 times and a face will rarely come up exactly 10 times; roll it 6000 times and each face comes up close to 1000 times, as a fraction much closer to 1/6. That the fraction settles down as the number of trials grows is the <em>law of large numbers</em>. Lesson 6's tally array shows it.</p>`,
        { play: `#include <iostream>
#include <cstdlib>
using namespace std;

int main() {
    int rolls[3] = {60, 600, 6000};
    for (int r = 0; r < 3; r++) {
        int counts[7] = {0, 0, 0, 0, 0, 0, 0};
        for (int i = 0; i < rolls[r]; i++) {
            counts[rand() % 6 + 1]++;           // the face picks the counter
        }
        cout << rolls[r] << " rolls, fraction of each face:" << endl;
        for (int face = 1; face <= 6; face++) {
            cout << "  " << face << ": " << (double) counts[face] / rolls[r] << endl;
        }
    }
    return 0;
}`, caption: 'Every fraction should be about 0.1667. With 60 rolls some are far off; with 6000 all are close. Compare the worst face at each size.' },
        `<p>But "settles down" happens slowly. The typical error of an estimate from <i>n</i> trials shrinks in proportion to 1/√<i>n</i>, not 1/<i>n</i>. So to make an estimate ten times more precise, one more correct decimal digit, you need a <em>hundred</em> times as many trials. That is the price of Monte Carlo, and the reason real simulations run for hours.</p>
<h2>Asking a question by simulation</h2>
<p>How likely is it that two dice show the same number? You could reason it out: 36 equally likely pairs, 6 of them doubles, so 1/6. Or roll two dice thousands of times and count. The pattern is always the same: repeat an experiment, count the successes, divide by the number of trials, as <code>double</code>s.</p>`,
        { play: `#include <iostream>
#include <cstdlib>
using namespace std;

int main() {
    int trials = 5000;
    int matches = 0;
    for (int i = 0; i < trials; i++) {
        int a = rand() % 6 + 1;
        int b = rand() % 6 + 1;
        if (a == b) {
            matches++;
        }
    }
    cout << "fraction of doubles: " << (double) matches / trials << endl;
    return 0;
}`, caption: 'Expect about 0.167. Without the (double), matches / trials is integer division and prints 0. Now change the question: how often do two dice add up to 7? Work out the exact answer too, and compare.' },
        `<h2>Throwing darts at π</h2>
<p>Here is Monte Carlo at its most charming. Draw a square with sides of length 1 and, inside it, a quarter of a circle of radius 1 centred at one corner. The quarter circle has area π/4 and the square has area 1. Now throw darts at the square at random. The fraction that land inside the quarter circle should be about π/4, so four times that fraction estimates π. A dart at (<i>x</i>, <i>y</i>) is inside when <i>x</i>² + <i>y</i>² ≤ 1; below, coordinates are whole numbers from 0 to 1000, standing for 0 to 1.</p>`,
        { play: `#include <iostream>
#include <cstdlib>
using namespace std;

int main() {
    srand(1);
    int trials = 10000;
    int inside = 0;
    for (int i = 0; i < trials; i++) {
        int x = rand() % 1001;              // 0 to 1000, standing for 0.000 to 1.000
        int y = rand() % 1001;
        if (x * x + y * y <= 1000 * 1000) {
            inside++;
        }
    }
    cout << "pi is about " << 4.0 * inside / trials << endl;
    return 0;
}`, caption: 'Ten thousand darts give π to within about 0.02, in line with the 1/√n rule: a million darts would be needed for an error ten times smaller. Change the seed and watch the estimate wobble. (It takes a second: this interpreter is far slower than a compiled program.)' },
        `<h2>Before the exercises</h2>
<p>The first exercise wraps a die roll in a function. The second is a complete simulation: repeat, count, divide. Here are worked examples of both shapes: a coin as a function, and the chance that a single die shows 5 or more, which is exactly 2/6.</p>`,
        { play: `#include <iostream>
#include <cstdlib>
using namespace std;

int flip() {                       // 0 for tails, 1 for heads
    return rand() % 2;
}

double fractionAtLeastFive(int trials) {
    int hits = 0;
    for (int i = 0; i < trials; i++) {
        int face = rand() % 6 + 1;  // a new roll on every pass
        if (face >= 5) {
            hits++;
        }
    }
    return (double) hits / trials;
}

int main() {
    cout << flip() << flip() << flip() << endl;
    cout << fractionAtLeastFive(3000) << endl;   // about 0.333
    return 0;
}`, caption: 'The roll happens inside the loop, so every pass rolls again. Rolling once before the loop would count the same roll 3000 times, and the answer would be 0 or 1.' },
        { aside: `<p><b>Common mistakes in this lesson.</b> Forgetting <code>#include &lt;cstdlib&gt;</code>. Calling <code>rand()</code> once before the loop instead of inside it, so every "roll" is the same. Integer division when computing a fraction. <code>rand() % 6</code> gives 0 to 5, not 1 to 6. Expecting different numbers on every run without seeding. Trusting a simulation with too few trials: the error shrinks only like 1/√<i>n</i>. On this site, keep trial counts to a few thousand, since the interpreter is slow.</p>` },
        {
          ex: {
            id: 'cp-9-1', title: 'Roll a die',
            prompt: `<p>Write <code>int roll()</code>, which returns a random whole number from 1 to 6. The checker cannot know which number you will roll, so it calls your function hundreds of times and checks that every result is in range and that every face eventually appears. Write only the function; <code>&lt;cstdlib&gt;</code> is included for you.</p>`,
            starter: `#include <cstdlib>\n\nint roll() {\n    // your code here\n}`,
            solution: `#include <cstdlib>\n\nint roll() {\n    return rand() % 6 + 1;\n}`,
            hints: ['Six values starting at 1: rand() % 6 + 1.', 'Return it: return rand() % 6 + 1;'],
            tests: [
              { setup: '    bool ok = true;\n    for (int i = 0; i < 300; i++) { int r = roll(); if (r < 1 || r > 6) ok = false; }', call: 'ok', expect: '1' },
              { setup: '    int seen[7] = {0, 0, 0, 0, 0, 0, 0};\n    for (int i = 0; i < 600; i++) { int r = roll(); if (r >= 1 && r <= 6) seen[r] = 1; }\n    int faces = seen[1] + seen[2] + seen[3] + seen[4] + seen[5] + seen[6];', call: 'faces', expect: '6' }
            ],
            mustContain: [{ re: /\brand\s*\(\s*\)/, msg: 'Use rand() to roll the die.' }],
            failTip: 'If the first test fails, a result was out of range: rand() % 6 alone gives 0 to 5. If the second fails, some face never appears: check the + 1 and the % 6.'
          }
        },
        {
          ex: {
            id: 'cp-9-2', title: 'How likely is double six?',
            prompt: `<p>Write <code>double doubleSixFraction(int trials)</code>: roll two dice <code>trials</code> times, count how often <em>both</em> show 6, and return the count divided by <code>trials</code> as a <code>double</code>. The exact probability is 1/36, about 0.028, so with 4000 trials your answer should land between 0.015 and 0.045 nearly every time. Write only the function.</p>`,
            starter: `#include <cstdlib>\n\ndouble doubleSixFraction(int trials) {\n    int hits = 0;\n    // roll two dice, trials times\n    return 0;\n}`,
            solution: `#include <cstdlib>\n\ndouble doubleSixFraction(int trials) {\n    int hits = 0;\n    for (int i = 0; i < trials; i++) {\n        int a = rand() % 6 + 1;\n        int b = rand() % 6 + 1;\n        if (a == 6 && b == 6) {\n            hits++;\n        }\n    }\n    return (double) hits / trials;\n}`,
            hints: ['Inside the loop, roll two separate dice with two rand() calls.', 'Count a hit only when a == 6 && b == 6, and return (double) hits / trials so that the division keeps its fraction.'],
            tests: [
              { setup: '    double f = doubleSixFraction(4000);', call: 'f > 0.015 && f < 0.045', expect: '1' },
              { setup: '    double f = doubleSixFraction(4000);', call: 'f > 0.015 && f < 0.045', expect: '1' },
              { setup: '    double f = doubleSixFraction(1);', call: 'f == 0 || f == 1', expect: '1' }
            ],
            mustContain: [{ re: /\brand\s*\(\s*\)/, msg: 'Simulate it with rand() rather than calculating 1/36.' }, { re: /\(\s*double\s*\)|\* *1\.0|\/ *\(?\s*\(double\)/, msg: 'The division must be a double division, or the fraction is thrown away. Cast with (double).' }],
            failTip: 'If the answer is always 0, the division is an integer division. If it is far from 0.028, check that both dice are rolled again on every pass.',
            followup: 'Why 1/36? The two dice are independent, so by the product rule (mathematics course, Lesson 2) there are 6 × 6 = 36 equally likely pairs, and only one of them is (6, 6). With 4000 trials the typical error is about 0.0026, which is why the checker allows a margin.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A computer's random numbers are pseudorandom: a fixed rule applied from a seed. The same seed gives the same sequence.</li>
<li><code>rand()</code> gives 0 to <code>RAND_MAX</code>; <code>rand() % n + lo</code> gives <i>n</i> values from <i>lo</i>. <code>srand(time(0))</code> seeds from the clock.</li>
<li>Monte Carlo: to estimate a probability, repeat the experiment, count, and divide as doubles.</li>
<li>Estimates settle as trials grow (the law of large numbers), but the error shrinks only like 1/√<i>n</i>: a hundred times the trials for ten times the precision.</li>
<li>Roll inside the loop, not before it.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Searching and sorting', summary: 'Selection sort and binary search written out in full, each with an invariant that proves it right and an exact count of its work, plus the famous bug that hid in binary search for years.',
      blocks: [
        `<p>Play a game with a friend: they think of a whole number from 1 to a million, and you may ask only yes-or-no questions. How many questions do you need? Twenty always suffice: ask "is it bigger than 500,000?", and whatever the answer, half the possibilities are gone. After twenty halvings a million possibilities are down to one, since 2<sup>20</sup> is just over a million. That strategy, applied to a sorted array, is <em>binary search</em>, and this lesson writes it, together with a sorting algorithm to prepare the array for it.</p>
<p>These algorithms look simple, and are famously easy to get wrong. When Jon Bentley taught binary search to professional programmers at Bell Labs and IBM (he tells the story in his book <i>Programming Pearls</i>), about ninety percent of them wrote a version with a bug, even with two hours to work. So this lesson does not just show the code: for each algorithm it states an <em>invariant</em>, a fact that stays true every time round the loop, and uses it to show why the code is right.</p>
<h2>Selection sort</h2>
<div class="stmt"><p><span class="kind">Selection sort.</span> For <i>i</i> = 0, 1, …, <i>n</i> − 2: find the smallest element among positions <i>i</i> to <i>n</i> − 1, and swap it into position <i>i</i>.</p>
<p><span class="kind">Invariant.</span> After the pass for <i>i</i>, positions 0 to <i>i</i> hold the <i>i</i> + 1 smallest elements of the array, in increasing order, and they never move again.</p></div>
<p>The invariant is why the algorithm works. Each pass picks the smallest of the elements that are left, which is at least as large as everything already placed, so it belongs next. After the last pass, positions 0 to <i>n</i> − 2 hold the smallest <i>n</i> − 1 elements in order, and the one element left, in position <i>n</i> − 1, is the largest. Watch the invariant grow.</p>`,
        { fig: 'sort', algo: 'selection', caption: 'The highlighted bar is the smallest found so far in the unsorted part; grey bars are in their final places, which is the invariant. Shuffle and play again.' },
        { play: `#include <iostream>
using namespace std;

void selectionSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int minIndex = i;                        // smallest seen so far in arr[i..n-1]
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        int temp = arr[i];                       // swap it into position i
        arr[i] = arr[minIndex];
        arr[minIndex] = temp;
    }
}

int main() {
    int data[8] = {29, 10, 14, 37, 13, 5, 21, 8};
    selectionSort(data, 8);
    for (int i = 0; i < 8; i++) {
        cout << data[i] << " ";
    }
    cout << endl;
    return 0;
}`, caption: 'Prints 5 8 10 13 14 21 29 37. The inner loop is "find the smallest of the rest"; the three lines after it are Lesson 5\u2019s swap, done on array elements.' },
        `<p>Count the work exactly. The pass for <i>i</i> makes <i>n</i> − 1 − <i>i</i> comparisons, so the total is (<i>n</i> − 1) + (<i>n</i> − 2) + … + 1 = <i>n</i>(<i>n</i> − 1)/2, however the data starts out. That is O(<i>n</i>²): doubling the data quadruples the work. It is fine for a hundred items and hopeless for ten million. Faster methods, merge sort and quicksort, use about <i>n</i> log<sub>2</sub> <i>n</i> comparisons, and the standard library's <code>sort</code> uses one of them.</p>
<details class="reveal"><summary>Predict: for 8 items, how many comparisons does selection sort make, and at most how many swaps?</summary><p>7 + 6 + 5 + 4 + 3 + 2 + 1 = 28 comparisons, whatever the order of the data. But only 7 swaps, one per pass. That is selection sort's one virtue: when moving an item is expensive and comparing is cheap, it moves each item at most once.</p></details>
<h2>Binary search</h2>
<div class="stmt"><p><span class="kind">Binary search.</span> In a sorted array, keep a range <code>lo</code> to <code>hi</code>, starting as the whole array. While the range is not empty, look at the middle element: if it is the target, return its index; if it is smaller than the target, the target can only be to its right, so set <code>lo = mid + 1</code>; otherwise set <code>hi = mid - 1</code>. If the range becomes empty, the target is not there.</p>
<p><span class="kind">Invariant.</span> If the target is anywhere in the array, it is somewhere in positions <code>lo</code> to <code>hi</code>.</p></div>
<p>The invariant holds at the start, when the range is the whole array. Each step keeps it, because the array is sorted: if the middle element is smaller than the target, so is everything to its left, and throwing that part away cannot lose the target. And the loop must stop, because the range gets strictly smaller on every pass, thanks to the <code>+ 1</code> and <code>- 1</code>. So when the range is empty, the invariant says the target was never there.</p>`,
        { fig: 'search', caption: 'Enter a target and step. Each step halves the live range; the target, if present, is always inside it.' },
        { play: `#include <iostream>
using namespace std;

int binarySearch(int arr[], int n, int target) {
    int lo = 0;
    int hi = n - 1;
    while (lo <= hi) {                   // the range lo..hi is not empty
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            lo = mid + 1;                // target can only be to the right
        } else {
            hi = mid - 1;                // target can only be to the left
        }
    }
    return -1;                           // the range is empty: not there
}

int main() {
    int data[16] = {2, 5, 8, 12, 16, 23, 38, 42, 56, 61, 72, 79, 85, 91, 97, 104};
    cout << binarySearch(data, 16, 61) << endl;
    cout << binarySearch(data, 16, 7) << endl;
    return 0;
}`, caption: 'Prints 9, the index of 61, then -1. Returning -1 for "not found" is a C tradition: an index can never be negative, so -1 cannot be mistaken for an answer.' },
        `<p>How many passes? Each one at least halves the range, so by the mathematics course's count of halvings, an array of <i>n</i> elements needs at most ⌊log<sub>2</sub> <i>n</i>⌋ + 1 passes. Sixteen elements take at most five; a million take at most twenty; every doubling of the data adds a single step.</p>
<h2>The bug that hid for years</h2>
<p>You may have noticed that <code>mid</code> is computed as <code>lo + (hi - lo) / 2</code> rather than the more obvious <code>(lo + hi) / 2</code>. They are equal in mathematics. In C++ they are not: <code>lo + hi</code> can be larger than the biggest <code>int</code>, about 2.1 billion, even when <code>lo</code>, <code>hi</code> and the answer all fit.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    int lo = 1500000000;
    int hi = 2000000000;
    int safe = lo + (hi - lo) / 2;     // never larger than hi
    cout << safe << endl;
    int mid = (lo + hi) / 2;           // lo + hi is 3.5 billion: too big for an int
    cout << mid << endl;
    return 0;
}`, expectError: true, caption: 'The safe version prints 1750000000. The obvious one overflows: this site stops, and a real program would get a negative mid and then read from a negative index.' },
        `<p>In 2006 Joshua Bloch, a software engineer at Google, reported exactly this bug in the binary search of Java's standard library, where it had sat unnoticed for about nine years; the same line appeared in textbooks, including Bentley's own. It only struck on arrays of more than a billion elements, which had been rare when the code was written. The lesson is not that you should memorise the fix, but that "obviously correct" code deserves the same check as any other: every variable must stay within the range of its type at every step, not just at the end.</p>
<h2>Sort once, search many times</h2>
<p>Why sort at all? Searching an unsorted array means looking at every element, <i>n</i> steps. If you will search it <i>k</i> times, that is <i>kn</i> steps. Sorting first costs <i>n</i>(<i>n</i> − 1)/2 comparisons with selection sort, or about <i>n</i> log<sub>2</sub> <i>n</i> with a fast sort, and then each search costs only about log<sub>2</sub> <i>n</i>. For a phone book searched millions of times, sorting once is overwhelmingly worth it. That trade, paying once up front to make every later question cheap, is one of the oldest ideas in computing.</p>
<h2>Before the exercises</h2>
<p>The first exercise is <em>insertion sort</em>, the way most people sort a hand of cards: take each card in turn and slide it left past every larger card into its place. Its invariant: before the pass for position <i>i</i>, positions 0 to <i>i</i> − 1 are sorted. Here it is by hand on {5, 2, 9, 1}, one row per pass.</p>
<table class="small"><tr><th>pass for</th><th>key</th><th>array after the pass</th><th>what happened</th></tr><tr><td>i = 1</td><td>2</td><td>2 5 9 1</td><td>5 is larger, so it shifts right; 2 goes in front</td></tr><tr><td>i = 2</td><td>9</td><td>2 5 9 1</td><td>5 is not larger than 9: nothing shifts</td></tr><tr><td>i = 3</td><td>1</td><td>1 2 5 9</td><td>9, 5 and 2 all shift right; 1 goes at the front</td></tr></table>
<p>The second exercise is a variant of binary search that finds a <em>boundary</em> rather than an exact match, with its own invariant, given in its hints. Before either, here is a small tool worth having whenever you write a sort: a function that checks the result.</p>`,
        { play: `#include <iostream>
using namespace std;

bool isSorted(int arr[], int n) {
    for (int i = 0; i + 1 < n; i++) {    // compare each neighbouring pair
        if (arr[i] > arr[i + 1]) {
            return false;
        }
    }
    return true;
}

int main() {
    int a[5] = {1, 2, 2, 7, 9};
    int b[4] = {3, 1, 2, 4};
    cout << isSorted(a, 5) << " " << isSorted(b, 4) << endl;
    return 0;
}`, caption: 'Prints 1 0. Equal neighbours, like the two 2s, are allowed. The condition i + 1 < n keeps arr[i + 1] inside the array, the bounds rule from Lesson 6.' },
        { aside: `<p><b>Common mistakes in this lesson.</b> Binary search on an unsorted array: it gives wrong answers with no error. <code>hi = n</code> instead of <code>n - 1</code> in the version that searches <code>lo</code> to <code>hi</code> inclusive, which reads past the end. Forgetting the <code>+ 1</code> or <code>- 1</code> when moving <code>lo</code> or <code>hi</code>, so the range stops shrinking and the loop never ends. <code>(lo + hi) / 2</code> on very large ranges. In insertion sort, testing <code>arr[j] &gt; key</code> before <code>j &gt;= 0</code>, which reads <code>arr[-1]</code>. Swapping without a temporary, which loses a value.</p>` },
        {
          ex: {
            id: 'cp-10-1', title: 'Insertion sort',
            prompt: `<p>Write <code>void insertionSort(int arr[], int n)</code>. For each position <code>i</code> from 1 up, take <code>arr[i]</code> as <code>key</code>, shift every element of <code>arr[0..i-1]</code> that is larger than <code>key</code> one place to the right, and put <code>key</code> in the gap, exactly as in the table above. Write only the function.</p>`,
            starter: `void insertionSort(int arr[], int n) {\n    for (int i = 1; i < n; i++) {\n        int key = arr[i];\n        int j = i - 1;\n        // shift larger elements right, then place key\n    }\n}`,
            solution: `void insertionSort(int arr[], int n) {\n    for (int i = 1; i < n; i++) {\n        int key = arr[i];\n        int j = i - 1;\n        while (j >= 0 && arr[j] > key) {\n            arr[j + 1] = arr[j];\n            j--;\n        }\n        arr[j + 1] = key;\n    }\n}`,
            hints: ['Shift with a while loop: while (j >= 0 && arr[j] > key) { arr[j + 1] = arr[j]; j--; }', 'The order inside the condition matters: check j >= 0 first, so that the && stops before reading arr[-1] (Lesson 2\u2019s short-circuit rule).', 'After the loop, j is just left of the gap: arr[j + 1] = key.'],
            tests: [
              { name: '{5, 2, 9, 1, 5, 6}', main: '    int a[6] = {5, 2, 9, 1, 5, 6};\n    insertionSort(a, 6);\n    for (int i = 0; i < 6; i++) cout << a[i] << " ";\n    cout << endl;', expect: '1 2 5 5 6 9' },
              { name: 'reversed {4, 3, 2, 1}', main: '    int a[4] = {4, 3, 2, 1};\n    insertionSort(a, 4);\n    for (int i = 0; i < 4; i++) cout << a[i] << " ";\n    cout << endl;', expect: '1 2 3 4' },
              { name: 'two elements', main: '    int a[2] = {7, 3};\n    insertionSort(a, 2);\n    cout << a[0] << " " << a[1] << endl;', expect: '3 7' },
              { name: 'negatives and repeats', main: '    int a[5] = {0, -3, 8, -3, 2};\n    insertionSort(a, 5);\n    for (int i = 0; i < 5; i++) cout << a[i] << " ";\n    cout << endl;', expect: '-3 -3 0 2 8' },
              { name: 'already sorted', main: '    int a[4] = {1, 2, 3, 4};\n    insertionSort(a, 4);\n    for (int i = 0; i < 4; i++) cout << a[i] << " ";\n    cout << endl;', expect: '1 2 3 4' }
            ],
            failTip: 'If an element is lost or duplicated, check the last line: key goes into arr[j + 1], after the loop, not arr[j].',
            followup: 'On an already sorted array the while loop never runs, so insertion sort makes only n − 1 comparisons, unlike selection sort, which always makes n(n − 1)/2. On nearly sorted data, insertion sort is fast.'
          }
        },
        {
          ex: {
            id: 'cp-10-2', title: 'First element at least target',
            prompt: `<p>Write <code>int firstAtLeast(int arr[], int n, int target)</code>: for a sorted array, return the index of the <em>first</em> element that is ≥ <code>target</code>, or <code>n</code> if there is none. Use the binary-search idea, keeping <code>lo</code> and <code>hi</code> and halving the range, not a scan. This version searches the half-open range: the answer is always somewhere from <code>lo</code> to <code>hi</code>, and the loop runs while <code>lo &lt; hi</code>. Write only the function.</p>`,
            starter: `int firstAtLeast(int arr[], int n, int target) {\n    int lo = 0;\n    int hi = n;      // the answer is always between lo and hi\n    // your loop here\n    return lo;\n}`,
            solution: `int firstAtLeast(int arr[], int n, int target) {\n    int lo = 0;\n    int hi = n;\n    while (lo < hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (arr[mid] < target) {\n            lo = mid + 1;\n        } else {\n            hi = mid;\n        }\n    }\n    return lo;\n}`,
            hints: ['Invariant: every element before lo is < target, and every element from hi onward is >= target.', 'While lo < hi: look at mid. If arr[mid] < target, the answer is to its right: lo = mid + 1. Otherwise mid itself could be the answer: hi = mid (not mid - 1).', 'When lo == hi the invariant pins the answer down exactly: return lo.'],
            tests: [
              { setup: '    int a[8] = {1, 3, 3, 5, 8, 13, 21, 34};', call: 'firstAtLeast(a, 8, 5)', expect: '3' },
              { setup: '    int a[8] = {1, 3, 3, 5, 8, 13, 21, 34};', call: 'firstAtLeast(a, 8, 3)', expect: '1' },
              { setup: '    int a[8] = {1, 3, 3, 5, 8, 13, 21, 34};', call: 'firstAtLeast(a, 8, 4)', expect: '3' },
              { setup: '    int a[8] = {1, 3, 3, 5, 8, 13, 21, 34};', call: 'firstAtLeast(a, 8, 100)', expect: '8' },
              { setup: '    int a[8] = {1, 3, 3, 5, 8, 13, 21, 34};', call: 'firstAtLeast(a, 8, 0)', expect: '0' },
              { setup: '    int a[2] = {7, 9};', call: 'firstAtLeast(a, 1, 7)', expect: '0' }
            ],
            mustContain: [{ re: /\bmid\b/, msg: 'Use a mid index and halve the range each step.' }],
            failTip: 'If the search for 3 returns 2 instead of 1, the loop stopped at a later copy: when arr[mid] >= target, set hi = mid and keep searching to the left.',
            followup: 'This variant is called lower_bound in the C++ standard library. With the half-open range the loop needs no "found it" case at all: the invariant does all the work.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>An invariant is a fact that stays true every time round a loop; it is how you show a loop is right.</li>
<li>Selection sort: swap the smallest of the rest into place. Invariant: the front is sorted and final. Exactly <i>n</i>(<i>n</i> − 1)/2 comparisons.</li>
<li>Binary search on a sorted array: invariant "if present, the target is in lo..hi"; at most ⌊log<sub>2</sub> <i>n</i>⌋ + 1 passes.</li>
<li>Compute the middle as <code>lo + (hi - lo) / 2</code>; <code>lo + hi</code> can overflow.</li>
<li>Sorting once makes many searches cheap: n log n up front, log n per search.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Project: Sieve of Eratosthenes', summary: 'A 2,200-year-old algorithm for finding every prime up to a limit, written with a bool array, proved correct, and put to work on questions mathematicians still cannot answer.',
      blocks: [
        `<p>Eratosthenes of Cyrene ran the great library of Alexandria around 240 BC. He is famous for measuring the size of the Earth, using the length of a shadow at noon in two cities, and getting it roughly right. He is also famous for a method of finding prime numbers that is still, more than two thousand years later, one of the fastest known. This project writes it in C++, proves that it works, and then uses it to explore questions about primes that nobody has yet been able to answer.</p>
<p>A prime is a whole number greater than 1 whose only divisors are 1 and itself. In Lesson 4 you tested one number at a time by trial division. To find <em>all</em> the primes up to some limit <i>N</i>, Eratosthenes turned the question round: instead of asking of each number "is this prime?", he crossed out everything that is not.</p>
<div class="stmt"><p><span class="kind">The sieve.</span> Write down the numbers 2, 3, …, <i>N</i>, none crossed out. Repeatedly take the smallest number <i>p</i> that is not crossed out and has not been used yet: it is prime, so cross out its multiples. When there is nothing left to use, the numbers not crossed out are exactly the primes up to <i>N</i>.</p></div>`,
        { fig: 'sieve', n: 100, caption: 'Play the sieve to 100. Once the current prime passes √100 = 10, nothing new is ever crossed out. The next section says why.' },
        `<h2>Two shortcuts, and why they are safe</h2>
<p>Watching the figure suggests two refinements. When crossing out the multiples of <i>p</i>, start at <i>p</i>² rather than 2<i>p</i>. And stop altogether once <i>p</i>² is larger than <i>N</i>. Both need a reason, because a shortcut in an algorithm is only as good as the argument behind it.</p>
<div class="stmt"><p><span class="kind">Why the first shortcut is safe.</span> A multiple <i>kp</i> with <i>k</i> &lt; <i>p</i> has the smaller factor <i>k</i>, so it has a prime factor smaller than <i>p</i>, and it was already crossed out when that smaller prime was used.</p>
<p><span class="kind">Why the second shortcut is safe.</span> Every composite number <i>c</i> ≤ <i>N</i> has a prime factor <i>q</i> with <i>q</i>² ≤ <i>c</i> ≤ <i>N</i> (write <i>c</i> = <i>ab</i> with 1 &lt; <i>a</i> ≤ <i>b</i>; then <i>a</i>² ≤ <i>ab</i> = <i>c</i>, and any prime factor of <i>a</i> works). So every composite is crossed out by a prime whose square is at most <i>N</i>.</p>
<p><span class="kind">Why the answer is right.</span> The second fact means every composite up to <i>N</i> is crossed out. And no prime is ever crossed out, because only multiples of <i>p</i> from <i>p</i>² upwards are crossed out, and each of those has the factor <i>p</i> and is bigger than <i>p</i>, so it is not prime. So the numbers left are exactly the primes.</p></div>
<p>This is the same fact that made trial division stop at √<i>n</i> in Lesson 4, and the mathematics course proves it carefully in its Lesson 4.</p>
<details class="reveal"><summary>Predict: sieving up to 50, which primes actually cross anything out?</summary><p>Only 2, 3, 5 and 7, because 11² = 121 is already past 50. Every other prime up to 50 survives without doing any work of its own.</p></details>
<h2>Representing the sheet of paper</h2>
<p>The natural data structure is an array of <code>bool</code>, one entry per number, where <code>isPrime[i]</code> means "<i>i</i> has not been crossed out". Everything starts <code>true</code>; crossing out sets an entry to <code>false</code>. Arrays are what make this fast: crossing out <i>m</i> is one step, <code>isPrime[m] = false</code>, because an array reaches any element directly (Lesson 6).</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    const int N = 50;
    bool isPrime[N + 1];                 // isPrime[0] .. isPrime[N]
    for (int i = 0; i <= N; i++) {
        isPrime[i] = true;
    }
    isPrime[0] = false;                  // 0 and 1 are not prime
    isPrime[1] = false;

    for (int p = 2; p * p <= N; p++) {                          // second shortcut
        if (isPrime[p]) {
            for (int multiple = p * p; multiple <= N; multiple += p) {   // first shortcut
                isPrime[multiple] = false;
            }
        }
    }

    for (int i = 2; i <= N; i++) {
        if (isPrime[i]) {
            cout << i << " ";
        }
    }
    cout << endl;
    return 0;
}`, caption: 'The fifteen primes up to 50. const int N makes N a constant known to the compiler, which a real compiler requires for an array size. Change it to 200.' },
        `<p>Read the inner loop carefully: it starts at <code>p * p</code> and steps by <code>p</code>, and the outer loop stops when <code>p * p</code> passes <code>N</code>. Notice also what the sieve never does: divide. It only adds and crosses out. The total work grows only slightly faster than <i>N</i> itself (in proportion to <i>N</i> log log <i>N</i>, for those who know logarithms), so a compiled version finds all the primes below a hundred million in about a second.</p>
<h2>Questions nobody can answer</h2>
<p>With a list of primes you can explore questions that have puzzled mathematicians for centuries, and still do. In 1742 Christian Goldbach wrote to Leonhard Euler suggesting that every even number greater than 2 is the sum of two primes: 4 = 2 + 2, 10 = 3 + 7, 100 = 3 + 97. Computers have checked it for every even number up to 4 × 10<sup>18</sup>, and nobody has found a proof. Here is a check up to 1000, using the sieve.</p>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    const int N = 1000;
    bool isPrime[N + 1];
    for (int i = 0; i <= N; i++) isPrime[i] = true;
    isPrime[0] = false;
    isPrime[1] = false;
    for (int p = 2; p * p <= N; p++) {
        if (isPrime[p]) {
            for (int m = p * p; m <= N; m += p) isPrime[m] = false;
        }
    }

    int failures = 0;
    for (int even = 4; even <= N; even += 2) {
        bool found = false;
        for (int p = 2; p <= even / 2 && !found; p++) {
            if (isPrime[p] && isPrime[even - p]) {     // two lookups, no division
                found = true;
            }
        }
        if (!found) {
            cout << "counterexample: " << even << endl;
            failures++;
        }
    }
    cout << "even numbers up to " << N << " with no pair of primes: " << failures << endl;
    return 0;
}`, caption: 'No counterexample below 1000. Each test is two array lookups, which is why having the whole sieve in hand beats testing primality again and again.' },
        `<p>Checking is not proving, as the mathematics course insists: a million confirmed cases leave the next one open. That is exactly why Goldbach's conjecture is still a conjecture.</p>
<h2>Before the exercises</h2>
<p>The first exercise turns the program above into one that reads <i>N</i>. Since an array size must be a constant, declare the array with a fixed maximum, <code>bool isPrime[5001]</code>, and use only the first <i>N</i> + 1 entries, as Lesson 6 did with input. The second puts the sieve inside a function that counts the primes. Plan it with three parts: fill, sieve, count. Here is the counting part on its own, the accumulator of Lesson 3 over an array.</p>`,
        { play: `#include <iostream>
using namespace std;

int countTrue(bool flags[], int from, int to) {   // how many of flags[from..to] are true
    int count = 0;
    for (int i = from; i <= to; i++) {
        if (flags[i]) {
            count++;
        }
    }
    return count;
}

int main() {
    bool f[6] = {true, false, true, true, false, true};
    cout << countTrue(f, 0, 5) << " " << countTrue(f, 2, 4) << endl;
    return 0;
}`, caption: 'Prints 4 2. For primes, count from 2 to n: 0 and 1 are not prime whatever the array says.' },
        { aside: `<p><b>Common mistakes in this project.</b> Starting the inner loop at <code>p</code> instead of <code>p * p</code> or <code>2 * p</code>, which crosses out <i>p</i> itself. Bounds: the array needs <i>N</i> + 1 entries, and every loop must include <i>N</i> itself, with <code>&lt;=</code>. Forgetting that 0 and 1 are not prime. Testing with <code>%</code>, which turns the sieve back into trial division. An array declared with a variable size, which this site allows and standard C++ does not.</p>` },
        {
          ex: {
            id: 'cp-11-1', title: 'Primes up to N',
            prompt: `<p>Write a complete program that reads <i>N</i> (at most 5000) and prints every prime up to <i>N</i> on one line, separated by single spaces. Use the sieve, not trial division. Declare the array with a fixed maximum size, <code>bool isPrime[5001]</code>, and use only the first <i>N</i> + 1 entries.</p>`,
            starter: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    bool isPrime[5001];\n    // 1. mark 0..n as true, then 0 and 1 as false\n    // 2. sieve\n    // 3. print\n    return 0;\n}`,
            solution: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    bool isPrime[5001];\n    for (int i = 0; i <= n; i++) {\n        isPrime[i] = true;\n    }\n    isPrime[0] = false;\n    isPrime[1] = false;\n    for (int p = 2; p * p <= n; p++) {\n        if (isPrime[p]) {\n            for (int m = p * p; m <= n; m += p) {\n                isPrime[m] = false;\n            }\n        }\n    }\n    for (int i = 2; i <= n; i++) {\n        if (isPrime[i]) {\n            cout << i << " ";\n        }\n    }\n    cout << endl;\n    return 0;\n}`,
            sampleStdin: '30',
            hints: ['Follow the three comments in order; the program above does exactly this with a constant instead of n.', 'Be careful with the bounds: i <= n everywhere, since you want n itself included.', 'If nothing prints for n = 2, check that isPrime[2] is still true: only multiples from p * p are crossed out, never p itself.'],
            tests: [{ stdin: '30', expect: '2 3 5 7 11 13 17 19 23 29' }, { stdin: '2', expect: '2' }, { stdin: '1', expect: '' }, { stdin: '49', expect: '2 3 5 7 11 13 17 19 23 29 31 37 41 43 47' }, { stdin: '100', expect: '2 3 5 7 11 13 17 19 23 29 31 37 41 43 47 53 59 61 67 71 73 79 83 89 97' }],
            mustContain: [{ re: /\+=\s*\w+|\bm\s*=\s*m\s*\+|multiple\s*=\s*multiple\s*\+/, msg: 'The sieve crosses out multiples by stepping the inner loop by p.' }],
            mustNotContain: [{ re: /\%\s*\w+\s*==\s*0/, msg: 'That looks like trial division (n % d == 0). The sieve never divides.' }],
            failTip: 'If 49 is printed as prime, the outer loop stopped too early: it must run while p * p <= n, including equality, so that 7 crosses out 49.'
          }
        },
        {
          ex: {
            id: 'cp-11-2', title: 'How many primes?',
            prompt: `<p>Write <code>int countPrimes(int n)</code>, returning the number of primes ≤ <i>n</i> (for <i>n</i> up to 10000), using a sieve inside the function. Write only the function. This count is a famous quantity, written π(<i>n</i>); for example π(10) = 4 and π(10000) = 1229.</p>`,
            starter: `int countPrimes(int n) {\n    bool isPrime[10001];\n    // your code here\n}`,
            solution: `int countPrimes(int n) {\n    bool isPrime[10001];\n    for (int i = 0; i <= n; i++) {\n        isPrime[i] = true;\n    }\n    for (int p = 2; p * p <= n; p++) {\n        if (isPrime[p]) {\n            for (int m = p * p; m <= n; m += p) {\n                isPrime[m] = false;\n            }\n        }\n    }\n    int count = 0;\n    for (int i = 2; i <= n; i++) {\n        if (isPrime[i]) {\n            count++;\n        }\n    }\n    return count;\n}`,
            hints: ['Fill, sieve, then count the true entries from 2 to n, as countTrue did.', 'For n < 2 the counting loop does not run at all, so it returns 0 without a special case.'],
            tests: [{ call: 'countPrimes(10)', expect: '4' }, { call: 'countPrimes(1)', expect: '0' }, { call: 'countPrimes(2)', expect: '1' }, { call: 'countPrimes(100)', expect: '25' }, { call: 'countPrimes(1000)', expect: '168' }, { call: 'countPrimes(10000)', expect: '1229' }],
            mustNotContain: [{ re: /\%\s*\w+\s*==\s*0/, msg: 'That looks like trial division. Use the sieve.' }],
            followup: 'Compare π(n) with n / ln n: for n = 10000 that is about 1086, and the ratio 1229 / 1086 creeps towards 1 as n grows. That is the prime number theorem, proved in 1896: the primes thin out, but in a precisely predictable way.'
          }
        },
        `<h2>Stretch goals</h2>
<p>Find the largest gap between consecutive primes below 5000, and the two primes on either side of it. Count the <em>twin primes</em> below 5000, pairs like 11 and 13 that differ by 2; whether there are infinitely many is another famous open question. And rewrite the sieve as a function <code>void sieve(bool isPrime[], int n)</code> that fills an array belonging to the caller, as Lesson 6 described, and use it in both programs above.</p>
<h2>Where to go from here</h2>
<p>You have used the core of C++ that everything else is built on: types, control flow, functions, pointers, arrays and text. The next things to learn, with a real compiler, are <code>std::string</code> and <code>std::vector</code> (arrays that know their own size and can grow), references, and then classes, C++'s way of bundling data with the functions that work on it. The algorithms you have written here are the ones a data structures course begins with, where the questions become: how can we make them faster, and how can we prove they are right? You have already started answering both.</p>
<p>If you have not yet, the <a href="#/lisp">Lisp short course</a> approaches the same ideas from the opposite direction, with no types and no memory addresses, only procedures, and the contrast is instructive.</p>`
      ]
    }
  ]
});
