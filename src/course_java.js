// Lesson content, (c) 2026 Michael Sayers, licensed CC BY-SA 4.0 (see LICENSE-CONTENT.md).
// This course runs on the site's own Java interpreter (src/java.js): it checks programs the way javac does and runs them like the JVM.
window.COURSES = window.COURSES || [];
window.COURSES.push({
  id: 'java', code: 'SC 106', short: 'Java', lang: 'java', status: 'developing',
  title: 'Introduction to Java',
  grades: 'Grades 10–12 · after Python, or with some experience',
  audience: `<p><b>Grades 10–12</b>, after the Python course or a semester of any language. Java is the language of the AP Computer Science A exam, of Android apps, and of much of the software that runs banks, airlines and large web sites. It is also the language most university first-year courses use. Expect the ceremony of a typed, compiled language, and in return a compiler that catches a whole class of mistakes before your program runs.</p><p>Each lesson is a self-contained Hour of Code activity. The course is being written: the first three lessons are here, and more follow.</p>`,
  tagline: 'Classes, types, decisions, loops, methods and objects: the language of AP Computer Science and of Android, run and checked in your browser.',
  description: `<p>Java was designed in the 1990s to run the same everywhere, and it did: the same program runs on a laptop, a phone and a server without being changed. That promise made it the language of Android apps, of <em>Minecraft</em>, of the systems behind banks and airlines, and of most university introductions to programming. It is the language of the AP Computer Science A exam.</p>
<p>Java is a cousin of C++ with the sharp edges filed off. It has types that the compiler checks, so a whole class of mistakes is caught before anything runs, but no pointers to misuse and no memory to free by hand. If you have done the Python course, every idea here will be familiar: values and names, decisions, loops, functions (called <em>methods</em>), lists. What changes is that you must say more, and that the compiler reads what you say with a critical eye.</p>
<p>The programs on these pages run in an interpreter built into this site that checks your code the way the real Java compiler does, with the same error messages, and runs it the way the Java virtual machine does. Nothing is installed, and what you write stays on your device. The parts of Java it does not cover (lambdas, generics in your own classes, files, threads) are not needed in this course.</p>`,
  outcomes: [
    'Explain what the Java compiler and the virtual machine each do, and read the compiler’s error messages',
    'Declare typed variables and predict the result of arithmetic on int, double and char values',
    'Write conditions, if/else chains and loops in Java, and read input with a Scanner',
    'Trace loops that count, accumulate and nest, and spot the off-by-one and overflow mistakes',
    'Write and call methods with parameters and return values',
    'Use arrays, Strings and ArrayLists, and define classes with fields, constructors and methods'
  ],
  howItWorks: `<h3>How to use these pages</h3><p>Each lesson has runnable code. Press <b>Run</b> and read the output; change something and run again. When a program is wrong, the message you see is the one the real Java compiler (<code>javac</code>) gives, so learning to read it here pays off everywhere. Exercises are checked by running your program on hidden inputs, so read the expected output carefully. Your work is saved in this browser.</p><p>Each lesson stands on its own as an <b>Hour of Code</b> activity: read, run, predict, and finish the two exercises in about 45–60 minutes.</p>`,
  lessons: [
    /* ================================================================== */
    {
      title: 'Hello, Java', summary: 'Where Java came from, the shape every Java program has, what the compiler checks, and the types a variable can have.',
      blocks: [
        `<p>In 1991 a small team at Sun Microsystems in California, led by James Gosling, set out to write software for the gadgets they expected to fill living rooms: television set-top boxes, handheld controllers, devices that did not yet exist. Every such device would have a different chip inside, so a program written for one would have to be rewritten for the next. Gosling's answer was a language whose programs were not translated for any particular chip. Instead they were translated into instructions for an imaginary machine, the <em>Java virtual machine</em>, and any real device that could pretend to be that machine could run every Java program ever written. He called the language Oak, after a tree outside his office window. The set-top boxes never came. The World Wide Web did, and in 1995 the language, renamed Java, was released to run the same program on every computer on the Internet. Its slogan was "write once, run anywhere".</p>
<p>It worked. Today the same Java program runs on a laptop, a phone and a rack of servers. Android apps are written in it; so was <em>Minecraft</em>, by one programmer in his spare time; so are large parts of the systems behind banks, airlines and the biggest web sites. It is the language of the AP Computer Science A exam and of most university first-year courses. If you learned Python first, Java will feel like Python with its rules written out in full: every value has a type, every statement ends with a mark, and a compiler reads your whole program before any of it runs. This lesson is about reading those rules so they stop looking like noise.</p>
<h2>The first program</h2>
<p>Here is the traditional first program. It is five lines where Python needed one. Run it, then read the table below, which takes it apart line by line.</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}`, caption: 'Change the message and run again. Then read on before changing anything else.' },
        `<div class="tbl-wrap"><table>
<tr><th>line</th><th>what it does</th></tr>
<tr><td><code>public class Main {</code></td><td>Every Java program is a <em>class</em>, a named container for code. This one is called <code>Main</code>. <code>public</code> means other code may use it. The brace opens the class.</td></tr>
<tr><td><code>public static void main(String[] args) {</code></td><td>The <em>method</em> where every Java program starts. Its name must be exactly <code>main</code>, and the words around it must be exactly these; you will learn what each one means in later lessons. For now, copy the line.</td></tr>
<tr><td><code>System.out.println("Hello, world!");</code></td><td>Prints a line of text. <code>System.out</code> is the console; <code>println</code> is "print line": it prints the text and then ends the line.</td></tr>
<tr><td><code>}</code></td><td>Closes <code>main</code>.</td></tr>
<tr><td><code>}</code></td><td>Closes the class.</td></tr>
</table></div>
<h2>The rules every line follows</h2>
<p>Java's rules are those of its cousin C++, and they are different from Python's in ways that trip up everyone who arrives from there.</p>
<div class="stmt"><p><span class="kind">Rule 1.</span> Every statement ends with a semicolon. Line breaks mean nothing to Java; the semicolon is what ends a statement.</p>
<p><span class="kind">Rule 2.</span> Braces <code>{ }</code> group statements into a block. Indentation is for people; the braces are for the compiler.</p>
<p><span class="kind">Rule 3.</span> Capitals count. <code>println</code>, <code>Println</code> and <code>PRINTLN</code> are three different names, and only the first exists. By convention class names start with a capital (<code>Main</code>, <code>String</code>) and everything else with a small letter (<code>main</code>, <code>args</code>).</p>
<p><span class="kind">Rule 4.</span> Text goes in double quotes <code>"like this"</code>; a single character goes in single quotes <code>'A'</code>. They are not interchangeable.</p>
<p><span class="kind">Rule 5.</span> Anything after <code>//</code> to the end of the line is a comment, ignored by the compiler. A comment of several lines goes between <code>/*</code> and <code>*/</code>.</p>
<p><span class="kind">Rule 6.</span> All code lives inside a class, and a <code>public</code> class must be saved in a file of the same name: <code>Main</code> in <code>Main.java</code>. On this site the file is named for you; on your own computer, forgetting this is the first error most people meet.</p></div>
<p>Rules 1 and 2 together are why Java code can be laid out freely: the program above would run identically with all five lines on one line. Do not do that. Lay code out for the reader, one statement per line, blocks indented, exactly as Python forced you to.</p>
<h2>What the compiler does</h2>
<p>Python reads your program one line at a time and carries out each line as it reaches it. Java does not work that way. A separate program, the <em>compiler</em> (<code>javac</code>), reads your whole source file first, checks every line against the rules and against the types of everything, and translates the whole thing into <em>bytecode</em>: instructions for Gosling's imaginary machine. A second program, the Java virtual machine (<code>java</code>), then runs the bytecode on whatever real computer you have. That two-step design is why a Java program runs unchanged on a phone and a server.</p>`,
        { fig: 'pipeline', lang: 'java', caption: 'Source file → javac → bytecode → the Java virtual machine. The compiler refuses to translate a program it cannot understand, so many mistakes are caught before anything runs.' },
        `<p>Two consequences matter today. First, a mistake in the rules stops the whole program before it starts: the compiler reports it and produces nothing. Second, the compiler needs to know the <em>type</em> of every value in advance, because it is deciding, at translation time, how much memory each thing needs and what each operation means. That is the subject of the next section.</p>
<p>(On this site an interpreter stands in for <code>javac</code> and the virtual machine, so you can press Run and see the result at once. It applies the same rules and reports mistakes in the same words the real compiler uses. Try it now: delete the semicolon after <code>"Hello, world!")</code> in the first program and run. The message names the line, says <code>';' expected</code>, and nothing is printed, because nothing was run.)</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        System.out.println("This line is fine");
        System.out.println("This one is missing something")
        System.out.println("So nothing at all is printed");
    }
}`, expectError: true, caption: 'Main.java:4: error: \';\' expected. A compiler reports the problem and refuses to go on; even the correct first line does not run. Fix line 4 and run again.' },
        { check: "A Java program has a missing semicolon on line 4 of 6. What runs?", options: ["Lines 1 to 3", "Nothing: the compiler refuses the whole program", "Everything except line 4"], answer: 1, why: "javac checks and translates the whole program before anything runs. One error, and nothing runs." },
        `<h2>Types</h2>
<p>In Python a name can hold anything, and the interpreter checks what it is each time it is used. In Java every variable has a type, fixed when the variable is created, and the compiler uses the type to decide what <code>+</code>, <code>/</code> and <code>println</code> mean for it. Five types cover nearly everything in this course.</p>
<div class="tbl-wrap"><table>
<tr><th>type</th><th>holds</th><th>examples</th><th>notes</th></tr>
<tr><td><code>int</code></td><td>a whole number</td><td><code>42</code>, <code>-7</code>, <code>0</code></td><td>from about −2 billion to 2 billion. For bigger whole numbers there is <code>long</code>.</td></tr>
<tr><td><code>double</code></td><td>a number with a decimal point</td><td><code>3.14</code>, <code>-0.5</code>, <code>2.0</code></td><td>about 15 significant digits; a decimal point makes a number a <code>double</code></td></tr>
<tr><td><code>boolean</code></td><td>true or false</td><td><code>true</code>, <code>false</code></td><td>small letters; the type is spelled out, not <code>bool</code></td></tr>
<tr><td><code>char</code></td><td>one character</td><td><code>'A'</code>, <code>'7'</code>, <code>' '</code></td><td>single quotes; behind the scenes it is a number, the character's code</td></tr>
<tr><td><code>String</code></td><td>text, any length</td><td><code>"Hello"</code>, <code>""</code></td><td>a capital S: <code>String</code> is a class, not a built-in type, which is why it can do things like <code>.length()</code></td></tr>
</table></div>
<p>A variable is <em>declared</em> by writing its type and then its name, usually with a starting value: <code>int age = 17;</code>. From then on <code>age</code> is an <code>int</code> and nothing else. Assigning text to it is a compile error, not a runtime surprise.</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        int students = 28;
        double average = 86.5;
        boolean passed = true;
        char grade = 'B';
        String name = "Ada Lovelace";
        System.out.println(name);
        System.out.println(students);
        System.out.println(average);
        System.out.println(passed);
        System.out.println(grade);
        students = students + 2;      // a new value of the same type
        System.out.println(students);
    }
}`, caption: 'Declare once with a type, then use. Try students = "many"; and read what the compiler says: incompatible types: String cannot be converted to int.' },
        `<h2>Arithmetic</h2>
<p>The operators are <code>+ - * / %</code>, and the type of the answer follows the types of the operands. When both are <code>int</code> the answer is an <code>int</code>: <code>7 / 2</code> is <code>3</code>, because <em>integer division</em> throws the fraction away, and <code>7 % 2</code> is <code>1</code>, the remainder. If either operand is a <code>double</code>, the whole calculation is done in <code>double</code> and <code>7 / 2.0</code> is <code>3.5</code>. This is the first place Java and Python part ways, and it is the cause of a great many wrong averages.</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        System.out.println(7 / 2);        // integer division: 3
        System.out.println(7 % 2);        // remainder: 1
        System.out.println(7 / 2.0);      // one double makes it 3.5
        System.out.println(7.0 / 2);
        int total = 17;
        int count = 4;
        System.out.println(total / count);           // 4, not 4.25
        System.out.println((double) total / count);  // 4.25
        System.out.println(total / (double) count);  // 4.25
        System.out.println((double) (total / count)); // 4.0: too late, the division already happened
        System.out.println(Math.sqrt(2));
        System.out.println(Math.pow(2, 10));
        System.out.println(Math.max(3, 9) + Math.abs(-4));
    }
}`, caption: 'A cast, (double) total, makes a copy of the value as a double before the division. The last line shows the classic mistake: casting the result instead of an operand.' },
        { check: "What does <code>7 / 2</code> give in Java?", options: ["3.5", "3", "4"], answer: 1, why: "int divided by int is an int: the fraction is dropped, not rounded. 7 / 2.0 gives 3.5." },
        `<div class="stmt"><p><span class="kind">Rule (division).</span> <code>int / int</code> is an <code>int</code>: the fraction is dropped, not rounded. To get a decimal answer, make one operand a <code>double</code> first, with a cast or by writing <code>2.0</code> instead of <code>2</code>.</p>
<p><span class="kind">Rule (mixing).</span> When an <code>int</code> meets a <code>double</code>, the <code>int</code> is converted and the answer is a <code>double</code>. Going the other way needs a cast, <code>(int) 3.99</code>, which gives <code>3</code>: the fraction is cut off, not rounded. Storing a <code>double</code> in an <code>int</code> without a cast is a compile error: <em>possible lossy conversion from double to int</em>.</p></div>
<h2>Printing</h2>
<p><code>System.out.println(x)</code> prints <code>x</code> and ends the line; <code>System.out.print(x)</code> prints without ending the line, so the next output continues on the same line. To print several things at once, join them into one <code>String</code> with <code>+</code>. When one side of <code>+</code> is text, the other side is turned into text and joined on; Java never adds spaces of its own, so write them inside the quotes.</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        int apples = 3;
        double price = 0.5;
        System.out.println("Apples: " + apples);
        System.out.println(apples + " apples cost " + apples * price + " dollars");
        System.out.print("No newline here; ");
        System.out.println("so this follows.");
        System.out.println("x" + 1 + 2);     // "x12": left to right, text first
        System.out.println(1 + 2 + "x");     // "3x": the addition happens first
        System.out.println("" + 1 + 2);      // "12"
        System.out.printf("%.2f dollars%n", apples * price);   // two decimals
    }
}`, caption: 'Read + from left to right. Once a String is involved, every later + joins text. printf formats a number: %.2f is a decimal with 2 places, %d a whole number, %n the end of the line.' },
        `<div class="stmt"><p><span class="kind">Trap.</span> <code>"x" + 1 + 2</code> is <code>x12</code>, but <code>1 + 2 + "x"</code> is <code>3x</code>. Java works from left to right and only starts joining text once it meets a <code>String</code>. Put the arithmetic in parentheses when you mean it: <code>"x" + (1 + 2)</code>.</p></div>
<h2>Reading input</h2>
<p>To read what the user types, Java uses an object called a <code>Scanner</code>. The recipe has three lines, and for now you can copy them without understanding every word; lesson 8, on objects, explains them. The first line, before the class, says where <code>Scanner</code> lives; the second makes a scanner that reads the keyboard; the third reads one whole number.</p>`,
        { check: "What does <code>\"Total: \" + 1 + 2</code> give?", options: ["<code>Total: 3</code>", "<code>Total: 12</code>", "A compile error"], answer: 1, why: "Java works left to right. Once a String is involved, every later + joins text. Write \"Total: \" + (1 + 2)." },
        { play: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int days = in.nextInt();
        int hours = days * 24;
        System.out.println(days + " days is " + hours + " hours");
    }
}`, stdin: '3', caption: 'Three steps: read into a typed variable, compute into a named variable, print one String with the spaces written explicitly. The input, 3, is in the box below the code; change it and run again. Output for 3: "3 days is 72 hours".' },
        `<p><code>in.nextInt()</code> reads an <code>int</code>; <code>in.nextDouble()</code> reads a <code>double</code>; <code>in.next()</code> reads one word; <code>in.nextLine()</code> reads a whole line. If the input holds several numbers, call <code>nextInt()</code> once for each: it skips the spaces and line breaks between them. If the next thing in the input is not a number, <code>nextInt()</code> stops the program with an <code>InputMismatchException</code>; you will learn to guard against that in lesson 2.</p>
<p>Look at the spaces inside the quoted pieces: <code>" days is "</code> has a space at each end, because <code>+</code> adds none. Your exercises follow the same three steps.</p>`,
        `<details class="reveal"><summary>Puzzle: in Java, what do <code>7 / 2</code>, <code>7.0 / 2</code> and <code>7 % 2</code> give? And <code>"7" + 2</code>?</summary><p><code>3</code>, <code>3.5</code>, <code>1</code> and <code>72</code>. Two <code>int</code>s divide to an <code>int</code>, dropping the fraction; one <code>double</code> keeps it; <code>%</code> gives the remainder. In the last one <code>"7"</code> is text, so <code>+</code> joins: Python would refuse to add a string and a number, Java joins them without complaint, which is convenient in <code>println</code> and a trap everywhere else.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> A missing semicolon: the error points at the line where the compiler noticed, often one after the mistake. A missing brace: <em>reached end of file while parsing</em>. Spelling <code>system</code>, <code>Println</code> or <code>string</code> with the wrong capitals. Writing <code>'</code> and <code>"</code> interchangeably: <code>'A'</code> is a <code>char</code>, <code>"A"</code> is a <code>String</code>. Expecting <code>7 / 2</code> to be 3.5. Forgetting that <code>+</code> puts no spaces between the things it joins. Forgetting <code>import java.util.Scanner;</code>, after which <code>Scanner</code> "cannot be found". Declaring a variable twice, or using one before declaring it.</p>` },
        {
          ex: {
            id: 'jv-1-1', title: 'A rectangle',
            prompt: `<p>Read two whole numbers, the width and height of a rectangle, and print its area and perimeter on two lines in exactly this form:</p><pre class="code">Area: 12\nPerimeter: 14</pre><p>(That is the output for width 3 and height 4.)</p>`,
            starter: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        int width = in.nextInt();\n        int height = in.nextInt();\n        // your code here\n    }\n}`,
            solution: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        int width = in.nextInt();\n        int height = in.nextInt();\n        int area = width * height;\n        int perimeter = 2 * (width + height);\n        System.out.println("Area: " + area);\n        System.out.println("Perimeter: " + perimeter);\n    }\n}`,
            sampleStdin: '3 4',
            hints: ['Area is width * height; the perimeter is 2 * (width + height). Give each its own int variable.', 'System.out.println("Area: " + area); Note the space after the colon inside the quotes, and that + joins the number on.'],
            tests: [{ stdin: '3 4', expect: 'Area: 12\nPerimeter: 14' }, { stdin: '10 10', expect: 'Area: 100\nPerimeter: 40' }, { stdin: '1 250', expect: 'Area: 250\nPerimeter: 502' }],
            failTip: 'The output must match exactly: capital A, a colon, one space, then the number, then a new line.'
          }
        },
        {
          ex: {
            id: 'jv-1-2', title: 'Temperatures',
            prompt: `<p>Read a temperature in degrees Fahrenheit (it may have a decimal point) and print it in Celsius with one decimal place, in exactly this form:</p><pre class="code">98.6 F is 37.0 C</pre><p>The formula is C = (F − 32) × 5 / 9. Read with <code>nextDouble()</code>, keep the Celsius value in a <code>double</code>, and print with <code>printf</code> and <code>%.1f</code> for each number.</p>`,
            starter: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        double f = in.nextDouble();\n        // your code here\n    }\n}`,
            solution: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        double f = in.nextDouble();\n        double c = (f - 32) * 5 / 9;\n        System.out.printf("%.1f F is %.1f C%n", f, c);\n    }\n}`,
            sampleStdin: '98.6',
            hints: ['double c = (f - 32) * 5 / 9; Because f is a double, the whole calculation is done in double, so 5 / 9 does not become 0 here. (It would if you wrote 5 / 9 on its own: try it.)', 'System.out.printf("%.1f F is %.1f C%n", f, c); The two %.1f are filled in order by f and c; %n ends the line.'],
            tests: [{ stdin: '98.6', expect: '98.6 F is 37.0 C' }, { stdin: '32', expect: '32.0 F is 0.0 C' }, { stdin: '212', expect: '212.0 F is 100.0 C' }, { stdin: '-40', expect: '-40.0 F is -40.0 C' }, { stdin: '0', expect: '0.0 F is -17.8 C' }],
            followup: 'Change the formula to (f - 32) * (5 / 9) and run it on 212. The result is 0.0, because 5 / 9 is an int division and gives 0 before anything else happens. Order and types together decide what a calculation means.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A Java program is a class with a <code>main</code> method; the compiler (<code>javac</code>) checks and translates the whole program into bytecode before the virtual machine runs it, so mistakes in the rules are caught before anything happens.</li>
<li>Statements end with <code>;</code>, braces make blocks, capitals count, <code>"text"</code> and <code>'c'</code> are different, <code>//</code> starts a comment.</li>
<li>Every variable is declared with a type that never changes: <code>int</code>, <code>double</code>, <code>boolean</code>, <code>char</code>, <code>String</code>. Declare before use, and give a starting value.</li>
<li><code>int / int</code> throws away the remainder; <code>%</code> keeps it; a cast <code>(double)</code> on one operand gives a decimal answer. <code>+</code> with a <code>String</code> joins text, left to right, with no spaces of its own.</li>
<li><code>System.out.println</code> prints a line; <code>printf</code> formats; a <code>Scanner</code> reads <code>nextInt()</code>, <code>nextDouble()</code>, <code>next()</code> and <code>nextLine()</code>.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Making decisions', summary: 'Comparisons and boolean, if and else, combining conditions, comparing text with equals, and reading input you cannot trust.',
      blocks: [
        `<p>In February 2014 Apple shipped a fix for a bug in the code that checked whether a web site's security certificate was genuine, in every iPhone, iPad and Mac. The code, written in C, Java's older cousin, had a sequence of tests, each of the form <em>if this check fails, go to the failure handler</em>. One line, <code>goto fail;</code>, had been typed twice. The second copy was not inside any <code>if</code>; it ran every time, unconditionally, skipping the remaining checks and reporting success. Because C lets you leave out the braces around an <code>if</code> body, the extra line looked like part of the test above it, and it sat there, indented like its neighbour, for over a year. Anyone sitting between a user and a web site could pretend to be that site, and the device would believe them.</p>
<p>The lesson is not that decisions are dangerous. It is that a program's decisions must be written so that what the compiler sees is what the reader sees. Java inherited C's syntax for <code>if</code>, braces optional and all. In this lesson you will learn it, and you will learn to always write the braces.</p>
<h2>Conditions have a type</h2>
<p>A comparison such as <code>age &gt;= 18</code> is an expression like any other, and its value has a type: <code>boolean</code>, which is <code>true</code> or <code>false</code>. You can store it in a variable, print it, and hand it to an <code>if</code>. The comparison operators are <code>==</code>, <code>!=</code>, <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code> and <code>&gt;=</code>. Note the two equals signs: <code>=</code> assigns, <code>==</code> compares.</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        int age = 17;
        boolean adult = age >= 18;
        System.out.println(adult);
        System.out.println(age == 17);
        System.out.println(age != 17);
        System.out.println(7 / 2 == 3.5);
        System.out.println(7 / 2.0 == 3.5);
        char grade = 'B';
        System.out.println(grade < 'C');     // chars compare by their codes
    }
}`, caption: 'A boolean is a value, not a special part of an if. The 7 / 2 lines are a reminder from lesson 1; the char line uses the fact that letters are numbered in alphabetical order.' },
        `<h2>if, else, else if</h2>
<p>An <code>if</code> runs a block when its condition is true. The condition goes in parentheses, which are required, and the block in braces. An <code>else</code> block runs when the condition was false. A chain of <code>else if</code> tests one condition after another and runs the first block whose condition holds, then skips the rest.</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        int temperature = 31;
        if (temperature > 30) {
            System.out.println("Hot");
        } else if (temperature > 20) {
            System.out.println("Warm");
        } else if (temperature > 10) {
            System.out.println("Cool");
        } else {
            System.out.println("Cold");
        }
        System.out.println("Done");
    }
}`, caption: 'Change the temperature to 25, 15 and -5. Exactly one block runs, the first whose condition is true; Done is printed every time because it is after the whole chain.' },
        { check: "What does Java say about <code>if (x = 5)</code>?", options: ["It compiles and is always true", "It does not compile: int cannot be converted to boolean", "It compiles and checks whether x is 5"], answer: 1, why: "The condition of an if must be a boolean. The assignment has type int, so the compiler refuses it. In C the typo compiles." },
        `<p>The order of a chain matters. Because each test is only reached if every test above it failed, <code>temperature &gt; 20</code> really means "above 20 and not above 30". Reverse the first two tests and every hot day is reported as merely warm.</p>
<div class="stmt"><p><span class="kind">Rule (braces).</span> Java lets you leave the braces out when the block is a single statement: <code>if (x &gt; 0) System.out.println(x);</code>. Do not. Write the braces every time, even for one line. A second statement added later, indented to look like part of the block, will otherwise run unconditionally, exactly as in Apple's code. The compiler cannot tell what you meant; only the braces say it.</p>
<p><span class="kind">Rule (conditions are boolean).</span> The condition of an <code>if</code> must be a <code>boolean</code>. <code>if (x = 5)</code> does not compile: <em>incompatible types: int cannot be converted to boolean</em>. In C this famous typo compiles and is always true; Java's type checker catches it for you.</p></div>
<h2>Combining conditions</h2>
<p>Conditions combine with <code>&amp;&amp;</code> (and), <code>||</code> (or) and <code>!</code> (not). A range such as "between 1 and 10" is <code>1 &lt;= x &amp;&amp; x &lt;= 10</code>; there is no <code>1 &lt;= x &lt;= 10</code>, which does not even compile in Java. The two-character operators are evaluated from left to right and stop early: <code>a &amp;&amp; b</code> never looks at <code>b</code> when <code>a</code> is false, and <code>a || b</code> never looks at <code>b</code> when <code>a</code> is true. That lets you write a check and a use in one condition: <code>count != 0 &amp;&amp; total / count &gt; 50</code> never divides by zero.</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        int hour = 14;
        boolean weekend = false;
        boolean open = hour >= 9 && hour < 17 && !weekend;
        System.out.println("open: " + open);
        boolean lunch = hour == 12 || hour == 13;
        System.out.println("lunch: " + lunch);
        int count = 0;
        int total = 0;
        if (count != 0 && total / count > 50) {
            System.out.println("high average");
        } else {
            System.out.println("no data or low average");
        }
        System.out.println(!(hour > 12));    // not: the opposite
    }
}`, caption: 'Try hour = 12, then weekend = true. With count = 0 the division is never reached: && stopped at the first false. Remove the count != 0 && and run: ArithmeticException: / by zero.' },
        `<h2>Comparing text</h2>
<p>Numbers and <code>char</code>s compare with <code>==</code>. <code>String</code>s do not. A <code>String</code> is an object, and <code>==</code> between two objects asks whether they are <em>the same object</em>, not whether they hold the same text. Two strings that read the same can be two different objects, for example one typed by the user and one written in your program, and <code>==</code> then says <code>false</code>. Ask the string itself instead: <code>a.equals(b)</code> is <code>true</code> exactly when the characters match, and <code>a.equalsIgnoreCase(b)</code> ignores capitals.</p>`,
        { code: `String answer = in.next();        // the user types   yes
if (answer == "yes") { ... }       // false! two different objects with the same text
if (answer.equals("yes")) { ... }  // true: compares the characters
if (answer.equalsIgnoreCase("YES")) { ... }   // true for yes, Yes, YES`, caption: 'Real Java: == on strings asks "same object?", and the answer is usually no. (The interpreter on this site compares the text, so it cannot show the failure; the habit still matters, because every real compiler will.)' },
        `<div class="stmt"><p><span class="kind">Rule (strings).</span> Compare text with <code>.equals</code>, never with <code>==</code>. To put the ordering of two strings into a number, <code>a.compareTo(b)</code> is negative when <code>a</code> comes first in dictionary order, zero when they are equal, and positive otherwise.</p></div>
<h2>Reading what the user types</h2>
<p>Lesson 1 read numbers with <code>nextInt()</code>. A <code>Scanner</code> can also read a single word, <code>next()</code>, or a whole line, <code>nextLine()</code>. The difference matters, and there is a trap where the two meet. <code>nextInt()</code> reads the digits and stops: the end-of-line character the user typed after the number is still waiting. A <code>nextLine()</code> straight afterwards reads <em>that</em>, and comes back with an empty string. The fix is to call <code>nextLine()</code> once to throw the leftover away, or to read everything with <code>nextLine()</code> and convert with <code>Integer.parseInt</code>.</p>`,
        { check: "How do you compare two Strings for equal text?", options: ["<code>a == b</code>", "<code>a.equals(b)</code>", "<code>a = b</code>"], answer: 1, why: "== on strings asks \"same object?\", which is usually no. equals compares the characters." },
        { play: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int age = in.nextInt();
        in.nextLine();                       // throw away the rest of the first line
        String name = in.nextLine();         // the whole second line, spaces included
        if (name.isEmpty()) {
            System.out.println("No name given");
        } else if (age >= 18) {
            System.out.println(name + " may vote");
        } else {
            System.out.println(name + " may vote in " + (18 - age) + " years");
        }
    }
}`, stdin: '16\nAda Lovelace', caption: 'Delete the in.nextLine(); line and run again: name is now the empty rest of line 1, and the output says No name given. Then change the age to 20.' },
        `<p>Input is the part of a program you do not control. If the user types <code>sixteen</code> where a number is expected, <code>nextInt()</code> stops the program with <code>InputMismatchException</code>. A program that must not fall over asks first: <code>in.hasNextInt()</code> is <code>true</code> when the next word of input is a whole number.</p>`,
        { play: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        if (in.hasNextInt()) {
            int n = in.nextInt();
            System.out.println("Twice " + n + " is " + 2 * n);
        } else {
            String word = in.next();
            System.out.println("'" + word + "' is not a whole number");
        }
    }
}`, stdin: 'sixteen', caption: 'Change the input to 21, then to 2.5 (a decimal is not an int either).' },
        `<h2>switch and the conditional operator</h2>
<p>When one value is compared against several constants, a <code>switch</code> says it more clearly than a chain of <code>else if</code>. Each <code>case</code> lists one or more values and an arrow to what should happen; <code>default</code> catches everything else. It works on <code>int</code>, <code>char</code> and <code>String</code> values.</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        int day = 6;
        switch (day) {
            case 1, 2, 3, 4, 5 -> System.out.println("Weekday");
            case 6, 7 -> System.out.println("Weekend");
            default -> System.out.println("Not a day");
        }
        String command = "stop";
        switch (command) {
            case "go" -> System.out.println("Going");
            case "stop" -> {
                System.out.println("Stopping");
                System.out.println("Stopped");
            }
            default -> System.out.println("Unknown command");
        }
        int score = 71;
        String result = score >= 50 ? "pass" : "fail";    // the conditional operator
        System.out.println(result);
    }
}`, caption: 'The arrow form of switch (Java 14 and later) runs exactly one case; several statements go in braces. The last lines show cond ? a : b, an if/else squeezed into one expression; use it for a simple choice between two values and nothing more.' },
        { check: "What does <code>int big = x &gt; 10 ? 1 : 0;</code> do?", options: ["Sets big to 1 if x &gt; 10, otherwise 0", "Sets big to x", "Does not compile"], answer: 0, why: "cond ? a : b is an if/else squeezed into one expression: the value is a when the condition holds, b otherwise." },
        `<p>You will also meet the older form of <code>switch</code> in textbooks: <code>case 1:</code> with a colon, statements, and a <code>break;</code> at the end of each case. Without the <code>break</code>, execution <em>falls through</em> into the next case, a trap the arrow form removes. Read the old form when you see it; write the new one.</p>`,
        `<details class="reveal"><summary>Puzzle: what does this print? <code>int x = 5; if (x &gt; 3) if (x &gt; 10) System.out.println("big"); else System.out.println("small");</code></summary><p><code>small</code>. The <code>else</code> belongs to the nearest <code>if</code>, the inner one (<code>x &gt; 10</code>), not to the outer one as the layout might suggest. With braces around each block the question would not arise, which is the point of the rule above.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> <code>=</code> where <code>==</code> was meant (Java refuses it, with <em>int cannot be converted to boolean</em>). Comparing strings with <code>==</code>. Leaving out the braces, then adding a second line to the block. <code>3 &lt;= x &lt;= 10</code> for a range: write <code>3 &lt;= x &amp;&amp; x &lt;= 10</code>. <code>x == 1 || 2</code>: write <code>x == 1 || x == 2</code>. <code>!x &gt; 5</code> for "not greater than 5": write <code>!(x &gt; 5)</code>. A semicolon straight after the condition, <code>if (x &gt; 3);</code>, which gives the <code>if</code> an empty statement to control, so the block after it runs every time. Overlapping conditions in the wrong order in an <code>else if</code> chain. <code>nextLine()</code> straight after <code>nextInt()</code>.</p>` },
        {
          ex: {
            id: 'jv-2-1', title: 'Letter grades',
            prompt: `<p>Read a whole-number score from 0 to 100 and print its letter grade on one line in exactly this form: <code>Grade: B</code>. The grades are A for 90 and above, B for 80 to 89, C for 70 to 79, D for 60 to 69, and F below 60.</p>`,
            starter: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        int score = in.nextInt();\n        char grade = 'F';\n        // your code here\n        System.out.println("Grade: " + grade);\n    }\n}`,
            solution: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        int score = in.nextInt();\n        char grade = 'F';\n        if (score >= 90) {\n            grade = 'A';\n        } else if (score >= 80) {\n            grade = 'B';\n        } else if (score >= 70) {\n            grade = 'C';\n        } else if (score >= 60) {\n            grade = 'D';\n        }\n        System.out.println("Grade: " + grade);\n    }\n}`,
            sampleStdin: '85',
            hints: ['An else if chain, highest score first: if (score >= 90) ... else if (score >= 80) ... Each later test only runs when the earlier ones failed, so you never need to write the upper bound.', 'grade already holds \'F\', so the chain needs no final else: when no test is true, F stands.', 'A grade is a char, so assign with single quotes: grade = \'A\';'],
            tests: [{ stdin: '85', expect: 'Grade: B' }, { stdin: '90', expect: 'Grade: A' }, { stdin: '100', expect: 'Grade: A' }, { stdin: '79', expect: 'Grade: C' }, { stdin: '60', expect: 'Grade: D' }, { stdin: '59', expect: 'Grade: F' }, { stdin: '0', expect: 'Grade: F' }],
            failTip: 'Check the boundaries: 90 is an A, 89 a B, 60 a D, 59 an F. Each test should use >=.'
          }
        },
        {
          ex: {
            id: 'jv-2-2', title: 'Leap years',
            prompt: `<p>Read a year and say whether it is a leap year, printing exactly <code>2024 is a leap year</code> or <code>1900 is not a leap year</code>. The rule: a year is a leap year if it is divisible by 4, except that years divisible by 100 are not, except that years divisible by 400 are. So 2024 and 2000 are leap years; 1900 and 2023 are not.</p>`,
            starter: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        int year = in.nextInt();\n        boolean leap = false;\n        // your code here\n        if (leap) {\n            System.out.println(year + " is a leap year");\n        } else {\n            System.out.println(year + " is not a leap year");\n        }\n    }\n}`,
            solution: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        int year = in.nextInt();\n        boolean leap = false;\n        if (year % 400 == 0) {\n            leap = true;\n        } else if (year % 100 == 0) {\n            leap = false;\n        } else if (year % 4 == 0) {\n            leap = true;\n        }\n        if (leap) {\n            System.out.println(year + " is a leap year");\n        } else {\n            System.out.println(year + " is not a leap year");\n        }\n    }\n}`,
            sampleStdin: '2024',
            hints: ['"Divisible by 4" is year % 4 == 0: the remainder is zero.', 'Test the most specific rule first: divisible by 400 → leap; else divisible by 100 → not leap; else divisible by 4 → leap. Or write it as one boolean expression: year % 4 == 0 && (year % 100 != 0 || year % 400 == 0).', 'The printing is already written; your job is to set leap correctly.'],
            tests: [{ stdin: '2024', expect: '2024 is a leap year' }, { stdin: '2023', expect: '2023 is not a leap year' }, { stdin: '1900', expect: '1900 is not a leap year' }, { stdin: '2000', expect: '2000 is a leap year' }, { stdin: '2100', expect: '2100 is not a leap year' }, { stdin: '1996', expect: '1996 is a leap year' }],
            followup: 'Both solutions in the hints are correct, and the one-line boolean is how most programmers would write it. Read it aloud: divisible by 4, and either not a century or a multiple of 400. Being able to turn a rule with exceptions into one condition, and back, is a skill you will use constantly.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A comparison is a <code>boolean</code> value; <code>==</code> compares, <code>=</code> assigns, and Java refuses an <code>int</code> where a condition is needed.</li>
<li><code>if</code> / <code>else if</code> / <code>else</code> runs the first block whose condition holds. Always write the braces. Order the chain from most specific to least.</li>
<li><code>&amp;&amp;</code>, <code>||</code> and <code>!</code> combine conditions; <code>&amp;&amp;</code> and <code>||</code> stop as soon as the answer is known, which makes "check, then use" safe.</li>
<li>Compare strings with <code>.equals</code>, never <code>==</code>. Read a word with <code>next()</code>, a line with <code>nextLine()</code>, and clear the leftover line after <code>nextInt()</code>. <code>hasNextInt()</code> guards against input that is not a number.</li>
<li><code>switch</code> with arrows chooses among constants; <code>cond ? a : b</code> chooses between two values.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Repetition', summary: 'while and for loops, counting and accumulating, nested loops, loops over the characters of a string, and the mistakes at the edges.',
      blocks: [
        `<p>In the summer of 1994 Thomas Nicely, a mathematics professor at Lynchburg College in Virginia, set a new Pentium computer to work on a problem that needed a great deal of repetition: adding up the reciprocals of the twin primes, pairs of primes two apart like 11 and 13, as far as the machine could reach. His program ran through hundreds of millions of numbers, dividing 1 by each. In October he noticed that one answer disagreed with a result he had computed years earlier on older machines. He narrowed the difference down to a single division, 1 divided by 824633702441, which the new chip got wrong in the tenth digit. The Pentium's floating-point division unit had a flaw in a lookup table, and it had taken a loop running billions of times to find the handful of inputs that exposed it. Intel eventually offered to replace every affected chip, at a cost of about 475 million dollars.</p>
<p>Repetition is the thing computers do that people cannot: the same step, billions of times, without tiring and without a single slip, so that when a slip does appear it is worth 475 million dollars. In Python you wrote loops with <code>while</code> and <code>for</code>. Java has both, and its <code>for</code> is a more general tool than Python's. This lesson is about writing loops that stop where you meant them to, which is where most loop bugs live.</p>
<h2>while</h2>
<p>A <code>while</code> loop checks its condition, runs its block if the condition is true, and goes back to check again. It stops the first time the condition is false. If the block never changes anything in the condition, it never stops.</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        int n = 1;
        while (n <= 5) {
            System.out.println(n + " squared is " + n * n);
            n++;                         // n = n + 1
        }
        System.out.println("After the loop n is " + n);

        int balance = 100;
        int years = 0;
        while (balance < 200) {
            balance = balance + balance / 20;     // 5 percent interest, in whole dollars
            years++;
        }
        System.out.println("Doubled after " + years + " years");
    }
}`, caption: 'n++ adds one; so do n += 1 and n = n + 1. Change the condition to n < 5 and watch the last line. The second loop runs until a condition is met rather than a fixed number of times, which is what while is for.' },
        `<div class="stmt"><p><span class="kind">Rule (ending).</span> Every loop needs something in its body that moves the condition towards false. Say the first and last values of the loop variable aloud before you run. Prefer <code>&lt;</code> to <code>!=</code> as the test: a counter that steps past the exact value you were waiting for ends a <code>&lt;</code> loop and never ends a <code>!=</code> one.</p></div>`,
        { play: `public class Main {
    public static void main(String[] args) {
        int n = 1;
        while (n != 10) {
            System.out.println(n);
            n = n + 2;
        }
    }
}`, expectError: true, caption: 'After about five seconds this site stops the program with "Time limit exceeded". n goes 1, 3, 5, 7, 9, 11, …: always odd, so it is never 10. Change != to < and it stops at 11.' },
        { check: "Why prefer <code>n &lt; 10</code> to <code>n != 10</code> as a loop test?", options: ["It is faster", "A counter that steps past 10 ends a &lt; loop and never ends a != one", "It makes no difference"], answer: 1, why: "If n goes 1, 3, 5, …, it is never exactly 10. The < test stops at 11; the != test runs forever." },
        `<h2>for</h2>
<p>Most loops count: start somewhere, test, step. Java's <code>for</code> puts those three parts on one line, separated by semicolons, so the whole shape of the loop can be read at a glance: <code>for (start; keep going while; step)</code>. The variable declared in the start part belongs to the loop and does not exist after it.</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        for (int i = 0; i < 5; i++) {
            System.out.print(i + " ");
        }
        System.out.println();
        for (int i = 10; i >= 0; i -= 2) {        // counting down by 2
            System.out.print(i + " ");
        }
        System.out.println();
        int total = 0;
        for (int k = 1; k <= 100; k++) {
            total += k;                           // total = total + k
        }
        System.out.println("1 + 2 + ... + 100 = " + total);
        double sum = 0;
        for (int k = 1; k <= 4; k++) {
            sum += 1.0 / k;                       // 1.0, not 1: see lesson 1
        }
        System.out.println(sum);
    }
}`, caption: 'Python’s range(0, 5) is for (int i = 0; i < 5; i++): the end is not included. The third loop is the accumulator pattern: a total declared as 0 before the loop, added to inside it, used after it.' },
        { check: "How many times does <code>for (int i = 0; i &lt;= 5; i++)</code> run?", options: ["5", "6", "4"], answer: 1, why: "i takes 0, 1, 2, 3, 4, 5: six values. With &lt; 5 it would be five." },
        `<div class="stmt"><p><span class="kind">Rule (choosing).</span> Use <code>for</code> when you know how many times, or over what range, before the loop starts. Use <code>while</code> when the loop ends on a condition you discover as you go: a balance reaching a target, the user typing <code>quit</code>, a number becoming 0.</p>
<p><span class="kind">Trap (off by one).</span> <code>i &lt;= n</code> runs one time more than <code>i &lt; n</code>. Starting at 1 and starting at 0 differ by one too. There is no rule that fixes this for you: for each loop, say what the first value is, what the last value is, and how many times the body runs.</p></div>
<h2>Loops inside loops</h2>
<p>A loop body can hold another loop. The inner loop runs completely for every single pass of the outer one, so two loops of ten produce a hundred steps. Tables, grids and "every pair" problems all have this shape.</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        for (int row = 1; row <= 5; row++) {
            for (int col = 1; col <= 5; col++) {
                System.out.printf("%4d", row * col);   // right-aligned in 4 characters
            }
            System.out.println();                      // end the row
        }
        System.out.println();
        for (int i = 1; i <= 4; i++) {
            for (int j = 0; j < i; j++) {
                System.out.print("*");
            }
            System.out.println();
        }
    }
}`, caption: 'The println that ends a row sits in the outer loop, after the inner one. Move it inside the inner loop and see what happens. In the triangle, the inner loop’s limit depends on the outer variable: that is allowed, and common.' },
        `<h2>Leaving early</h2>
<p><code>break</code> leaves the loop at once; <code>continue</code> skips the rest of the body and goes to the next test. Both are legitimate and both are easy to overuse: a loop whose condition tells the whole truth is easier to read than one that leaves from the middle. A search is the classic good use of <code>break</code>: stop as soon as the thing is found.</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        int target = 91;
        int found = -1;
        for (int n = 2; n < target; n++) {
            if (target % n == 0) {
                found = n;
                break;                      // the first divisor is enough
            }
        }
        if (found == -1) {
            System.out.println(target + " is prime");
        } else {
            System.out.println(target + " is divisible by " + found);
        }
        for (int i = 1; i <= 10; i++) {
            if (i % 3 == 0) {
                continue;                   // skip multiples of 3
            }
            System.out.print(i + " ");
        }
        System.out.println();
    }
}`, caption: 'Change target to 97. The found = -1 before the loop is a sentinel: a value that cannot be a real answer, so after the loop it means "nothing was found".' },
        `<h2>do while, and loops over text</h2>
<p>A <code>do { … } while (condition);</code> loop runs its body first and tests afterwards, so the body always runs at least once. It is the natural shape for "ask until the answer is acceptable". A <code>String</code> is a sequence of characters, numbered from 0, and <code>s.charAt(i)</code> gives the one at position <code>i</code>; <code>s.length()</code> is how many there are, so the last is at <code>s.length() - 1</code>. A <code>for</code> over those positions visits every character.</p>`,
        { play: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n;
        do {
            System.out.println("Enter a number from 1 to 10:");
            n = in.nextInt();
        } while (n < 1 || n > 10);
        System.out.println("Thank you: " + n);

        String word = "Mississippi";
        int count = 0;
        for (int i = 0; i < word.length(); i++) {
            if (word.charAt(i) == 's') {
                count++;
            }
        }
        System.out.println("s appears " + count + " times");
        String reversed = "";
        for (int i = word.length() - 1; i >= 0; i--) {
            reversed += word.charAt(i);
        }
        System.out.println(reversed);
    }
}`, stdin: '12\n0\n7', caption: 'The input holds three answers; the loop asks until it gets one in range. A char compares with == (it is a number underneath). Note word.length() with parentheses: a String is an object, and length is a method.' },
        `<h2>When the numbers get big</h2>
<p>An <code>int</code> holds whole numbers up to 2,147,483,647. Add one more and it does not stop, round or complain: it wraps around to −2,147,483,648, the way a car's odometer rolls from 999999 to 000000. A loop that multiplies or adds up quickly can cross that line in a few steps, and the only sign is an answer that is suddenly negative or absurdly small. On 4 June 1996 the first Ariane 5 rocket destroyed itself forty seconds after launch because a program converted a large measurement into a 16-bit whole number that could not hold it. For big totals and products use <code>long</code>, which reaches about nine quintillion, and write the literal with an <code>L</code>: <code>long big = 3000000000L;</code>.</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        int product = 1;
        for (int i = 1; i <= 15; i++) {
            product *= i;
            System.out.println(i + "! = " + product);
        }
        long bigProduct = 1;
        for (int i = 1; i <= 20; i++) {
            bigProduct *= i;
        }
        System.out.println("20! = " + bigProduct);
        System.out.println(Integer.MAX_VALUE);
        System.out.println(Integer.MAX_VALUE + 1);
    }
}`, caption: '13! does not fit in an int: the value printed is wrong from there on, with no error. The long gets 20! right. Read the last two lines slowly.' },
        { check: "An int holding 2,147,483,647 is incremented. What happens?", options: ["An exception is thrown", "It wraps round to −2,147,483,648 with no warning", "It becomes a long"], answer: 1, why: "Java ints are 32 bits and wrap silently. Use long for big totals and products." },
        `<details class="reveal"><summary>Puzzle: how many times does the body run? <code>for (int i = 0; i &lt; 10; i++)</code>, <code>for (int i = 1; i &lt;= 10; i++)</code>, <code>for (int i = 10; i &gt; 0; i -= 3)</code>, <code>for (int i = 0; i &lt; 10; i += 0)</code></summary><p>10, 10, 4 (i is 10, 7, 4, 1) and forever: the last loop never changes <code>i</code>, so this site stops it with "Time limit exceeded" and a real machine runs until you kill it.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Off-by-one: <code>i &lt;= n</code> runs one pass more than <code>i &lt; n</code>; say the first and last values aloud. A <code>while</code> whose body never changes the variables in its condition, or changes them past the stopping point: prefer <code>&lt;</code> to <code>!=</code>. Forgetting to set an accumulator to 0 before the loop (Java will refuse to use an unset variable: <em>variable total might not have been initialized</em>). Using a <code>for</code> loop's variable after the loop: it no longer exists. A semicolon straight after the loop header, <code>for (…);</code> or <code>while (…);</code>, which gives the loop an empty body. Putting the <code>println</code> that ends a row inside the inner loop. <code>charAt(s.length())</code>: the last character is at <code>length() - 1</code>. A product or total in an <code>int</code> that quietly wraps around.</p>` },
        {
          ex: {
            id: 'jv-3-1', title: 'Digit sum',
            prompt: `<p>Read a whole number that is 0 or more and print the sum of its digits in exactly this form: for <code>4729</code> print <code>Digit sum: 22</code>. Do it with arithmetic, not by turning the number into text: <code>n % 10</code> is the last digit, and <code>n / 10</code> is the number with that digit removed. Repeat while <code>n</code> is greater than 0.</p>`,
            starter: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        int n = in.nextInt();\n        int sum = 0;\n        // your code here\n        System.out.println("Digit sum: " + sum);\n    }\n}`,
            solution: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        int n = in.nextInt();\n        int sum = 0;\n        while (n > 0) {\n            sum += n % 10;\n            n = n / 10;\n        }\n        System.out.println("Digit sum: " + sum);\n    }\n}`,
            sampleStdin: '4729',
            hints: ['A while loop: while (n > 0) { ... }. Inside, add the last digit to sum, then drop it from n.', 'sum += n % 10; takes the last digit. n = n / 10; removes it (integer division: 4729 / 10 is 472).', 'For 0 the loop never runs and sum stays 0, which is the right answer.'],
            mustNotContain: [{ re: /charAt|toString|String\.valueOf|\+\s*""/, msg: 'Use arithmetic (% and /), not text, to take the number apart.' }],
            tests: [{ stdin: '4729', expect: 'Digit sum: 22' }, { stdin: '0', expect: 'Digit sum: 0' }, { stdin: '9', expect: 'Digit sum: 9' }, { stdin: '1000000', expect: 'Digit sum: 1' }, { stdin: '999999999', expect: 'Digit sum: 81' }],
            followup: 'The loop peels one digit off the end each time, so it runs once per digit: about ten times for the largest int. Change % 10 and / 10 to % 2 and / 2 and you have counted the ones in the number’s binary form.'
          }
        },
        {
          ex: {
            id: 'jv-3-2', title: 'Counting vowels',
            prompt: `<p>Read one whole line of text and print how many vowels it contains, in exactly this form: for <code>Hello, World</code> print <code>Vowels: 3</code>. Count a, e, i, o and u in both small and capital letters. Read the line with <code>nextLine()</code>, and go through it one character at a time with a <code>for</code> loop and <code>charAt</code>.</p>`,
            starter: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        String line = in.nextLine();\n        int vowels = 0;\n        // your code here\n        System.out.println("Vowels: " + vowels);\n    }\n}`,
            solution: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        String line = in.nextLine();\n        int vowels = 0;\n        for (int i = 0; i < line.length(); i++) {\n            char c = Character.toLowerCase(line.charAt(i));\n            if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') {\n                vowels++;\n            }\n        }\n        System.out.println("Vowels: " + vowels);\n    }\n}`,
            sampleStdin: 'Hello, World',
            hints: ['for (int i = 0; i < line.length(); i++) visits every position; char c = line.charAt(i); is the character there.', 'Make the test for capitals easy: char c = Character.toLowerCase(line.charAt(i)); then compare c with \'a\', \'e\', \'i\', \'o\', \'u\' using ||.', 'Another way to test: "aeiou".indexOf(c) >= 0 is true exactly when c is one of those five characters.'],
            tests: [{ stdin: 'Hello, World', expect: 'Vowels: 3' }, { stdin: 'AEIOU aeiou', expect: 'Vowels: 10' }, { stdin: 'rhythm', expect: 'Vowels: 0' }, { stdin: 'Programming in Java is fun', expect: 'Vowels: 8' }, { stdin: 'Ada Lovelace', expect: 'Vowels: 6' }],
            failTip: 'Check capitals (A counts as much as a) and that the loop stops at length() - 1: charAt(length()) is an error.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li><code>while</code> repeats while a condition holds; something in the body must move it towards false. Prefer <code>&lt;</code> to <code>!=</code>.</li>
<li><code>for (start; test; step)</code> is the loop for counting; its variable belongs to the loop. Python's <code>range(a, b)</code> is <code>for (int i = a; i &lt; b; i++)</code>.</li>
<li>Accumulate with a variable set before the loop and updated inside it; nest loops for tables and grids, and put the row-ending <code>println</code> in the outer loop.</li>
<li><code>break</code> leaves a loop, <code>continue</code> skips to the next pass; <code>do … while</code> runs at least once. Walk a string with <code>charAt(i)</code> for <code>i</code> from 0 to <code>length() - 1</code>.</li>
<li>An <code>int</code> wraps around past 2,147,483,647 without warning; use <code>long</code> for big totals and products.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Methods', summary: 'Writing a method once and calling it many times: parameters, return values, void, why a method cannot change your variables, and overloading.',
      blocks: [
        `<p>In 1949 the EDSAC at Cambridge University became one of the first computers that stored its program in memory alongside its data. Its users soon noticed that they were writing the same pieces of code over and over: a routine to print a number, a routine to take a square root, a routine to read paper tape. David Wheeler, a research student on the project, worked out how a program could jump into such a routine, let it do its work, and come back to the place it had left, with the routine none the wiser about who had called it. The trick is still called the Wheeler jump. By 1951 Wheeler, Maurice Wilkes and Stanley Gill had published the first textbook of programming, and most of it was about a library of these <em>subroutines</em>, kept on paper tape in a cabinet, that any program could borrow.</p>
<p>Every language since has had them under some name: subroutines, procedures, functions. Java calls them <em>methods</em>, and you have been using them from the first line you wrote: <code>println</code> is a method, so are <code>nextInt</code> and <code>Math.sqrt</code>, and the program itself lives in one called <code>main</code>. This lesson is about writing your own, and the reason is the one Wheeler saw: a piece of code that does one job, written once, named, and called from wherever it is needed.</p>
<h2>Defining and calling</h2>
<p>A method is defined inside the class, beside <code>main</code>, and has four parts: the type of value it hands back, its name, a list of <em>parameters</em> in parentheses, each with a type, and a body in braces. The keyword <code>static</code> in front says the method belongs to the class and can be called directly from <code>main</code>; every method in this lesson is static, and lesson 8 shows the other kind. Calling the method is writing its name with values for the parameters, called <em>arguments</em>. The call is an expression: it stands for the value the method returns.</p>`,
        { play: `public class Main {
    static int square(int x) {
        return x * x;
    }

    static double average(int a, int b) {
        return (a + b) / 2.0;
    }

    public static void main(String[] args) {
        System.out.println(square(7));
        System.out.println(square(3) + square(4));
        int n = 12;
        System.out.println(square(n + 1));
        System.out.println(average(3, 4));
        double mean = average(square(2), 10);
        System.out.println(mean);
    }
}`, caption: 'A call can appear anywhere a value can: in println, in a sum, as an argument to another call. The method does not care whether it was given 7, n + 1 or square(2); it receives the value.' },
        `<p>Read <code>square(n + 1)</code> as a story. Java works out <code>n + 1</code>, which is 13. It starts the method with <code>x</code> set to 13. The body computes <code>169</code> and <code>return</code> hands it back; the call <code>square(n + 1)</code> now stands for 169, and <code>println</code> prints it. Then <code>x</code> ceases to exist.</p>
<div class="stmt"><p><span class="kind">Rule (return).</span> <code>return value;</code> ends the method at once and hands the value back. A method whose return type is not <code>void</code> must return a value on every path through it; if the compiler can find a way to reach the closing brace without a <code>return</code>, it refuses the program with <em>missing return statement</em>.</p>
<p><span class="kind">Rule (types).</span> The value returned must match the declared type (or convert to it without loss), and each argument must match its parameter. <code>square(2.5)</code> does not compile: <em>possible lossy conversion from double to int</em>.</p></div>`,
        { play: `public class Main {
    static int sign(int n) {
        if (n > 0) {
            return 1;
        } else if (n < 0) {
            return -1;
        }
    }

    public static void main(String[] args) {
        System.out.println(sign(5));
    }
}`, expectError: true, caption: 'Main.java:8: error: missing return statement. For n equal to 0 neither branch returns, so the method would fall off its end. Add return 0; before the closing brace, or make the last branch a plain else.' },
        { check: "An int method has an if that returns and an else-if that returns, and no else. What does the compiler say?", options: ["Nothing: it compiles", "missing return statement: some path reaches the end without returning", "It returns 0 by default"], answer: 1, why: "A non-void method must return on every path. The compiler can see a way to the closing brace, so it refuses." },
        `<h2>Methods that do something: void</h2>
<p>Not every method hands back a value. One that prints, or draws, or changes a list, has the return type <code>void</code>, "nothing". A <code>void</code> method is called as a statement on its own, not inside an expression, and may end with a bare <code>return;</code> or simply by reaching its closing brace. <code>main</code> is one.</p>`,
        { play: `public class Main {
    static void printLine(int length) {
        for (int i = 0; i < length; i++) {
            System.out.print("-");
        }
        System.out.println();
    }

    static void printBox(String text) {
        printLine(text.length() + 4);
        System.out.println("| " + text + " |");
        printLine(text.length() + 4);
    }

    public static void main(String[] args) {
        printBox("Hello");
        printBox("EDSAC, 1949");
    }
}`, caption: 'printBox calls printLine twice: methods are built out of methods. Try int x = printBox("a"); and read the message: a void method has no value to give.' },
        `<h2>A method gets copies</h2>
<p>When you call <code>square(n)</code>, the method's parameter <code>x</code> is a new variable holding a <em>copy</em> of <code>n</code>'s value. Whatever the method does to <code>x</code>, <code>n</code> is untouched. This is called <em>passing by value</em>, and it is how every argument of a primitive type (<code>int</code>, <code>double</code>, <code>char</code>, <code>boolean</code>) is handed over in Java. A method that wants to give the caller a new number returns it; it cannot reach back and change the caller's variable.</p>`,
        { play: `public class Main {
    static void addTen(int n) {
        n = n + 10;
        System.out.println("inside: " + n);
    }

    static int plusTen(int n) {
        return n + 10;
    }

    public static void main(String[] args) {
        int score = 5;
        addTen(score);
        System.out.println("after addTen: " + score);
        score = plusTen(score);
        System.out.println("after plusTen: " + score);
    }
}`, caption: 'addTen changes its own copy and the change is lost. plusTen returns the new value, and main stores it: that is the Java way to "change" a number through a method. (Arrays and objects behave differently; lesson 5 explains.)' },
        { check: "<code>static void addTen(int n) { n += 10; }</code>, then <code>int x = 5; addTen(x);</code>. What is x?", options: ["15", "5: the method changed its own copy", "An error"], answer: 1, why: "Parameters are copies. To change the caller's number, return the new value and store it." },
        `<h2>Each method has its own variables</h2>
<p>A variable declared inside a method, including its parameters, exists only while that method runs and is invisible to every other method. <code>main</code> cannot see <code>x</code> inside <code>square</code>, and <code>square</code> cannot see <code>n</code> inside <code>main</code>. If two methods need to share a value, one passes it to the other as an argument. This is the point of methods, not a limitation: you can read <code>square</code> on its own and know everything about it.</p>`,
        { play: `public class Main {
    static int twice(int value) {
        int result = value * 2;
        return result;
    }

    public static void main(String[] args) {
        int value = 21;
        System.out.println(twice(value));
        System.out.println(result);
    }
}`, expectError: true, caption: 'Main.java:9: error: cannot find symbol: variable result. The result inside twice belongs to twice. Note that both methods have a variable called value, and they are two different variables.' },
        `<h2>Several methods with one name</h2>
<p>Java lets you define two methods with the same name as long as their parameters differ in number or type. The compiler picks the one whose parameters match the arguments. This is called <em>overloading</em>, and the library uses it everywhere: <code>println</code> is a dozen methods, one for each type it can print, and <code>Math.abs</code> works for <code>int</code> and <code>double</code> alike. Use it when the methods really do the same job for different inputs; two unrelated methods with one name confuse everyone.</p>`,
        { play: `public class Main {
    static double area(double radius) {
        return Math.PI * radius * radius;
    }

    static double area(double width, double height) {
        return width * height;
    }

    static String describe(int n) {
        return n + " is a whole number";
    }

    static String describe(double d) {
        return d + " has a decimal part";
    }

    public static void main(String[] args) {
        System.out.printf("%.2f%n", area(1));
        System.out.println(area(3, 4));
        System.out.println(describe(7));
        System.out.println(describe(7.5));
        System.out.println(describe(7 / 2));
    }
}`, caption: 'area(1) matches the one-parameter version; the int 1 widens to double. In the last line the argument is an int, so the first describe runs: overloads are chosen by the types in the call, before anything runs.' },
        { check: "There are <code>describe(int)</code> and <code>describe(double)</code>. Which runs for <code>describe(3)</code>?", options: ["describe(int)", "describe(double)", "Both, in order"], answer: 0, why: "The compiler picks the overload from the argument types at compile time. 3 is an int, so the int version is chosen." },
        `<h2>A method that calls itself</h2>
<p>Nothing stops a method from calling itself, provided each call works on a smaller problem and some case stops without calling. The factorial of <code>n</code> is <code>n</code> times the factorial of <code>n − 1</code>, and the factorial of 0 is 1. Written out, that definition <em>is</em> the method. This is <em>recursion</em>; the Lisp course is built on it, and here it is a first look.</p>`,
        { play: `public class Main {
    static long factorial(int n) {
        if (n == 0) {
            return 1;
        }
        return n * factorial(n - 1);
    }

    static int countDigits(int n) {
        if (n < 10) {
            return 1;
        }
        return 1 + countDigits(n / 10);
    }

    public static void main(String[] args) {
        for (int i = 0; i <= 5; i++) {
            System.out.println(i + "! = " + factorial(i));
        }
        System.out.println(factorial(20));
        System.out.println(countDigits(4729));
    }
}`, caption: 'factorial(3) calls factorial(2), which calls factorial(1), which calls factorial(0); that returns 1 and the results multiply back up. Remove the if and run: StackOverflowError, the method called itself until the machine ran out of room to remember the calls.' },
        `<h2>Dividing a program into methods</h2>
<p>The exercises in lesson 3 were each one <code>main</code>. The same work reads better as methods with names, each doing one thing, with <code>main</code> reduced to the story of what happens. Compare this with the vowel counter you wrote; the test for a vowel now has a name, and could be used by any other method.</p>`,
        { play: `import java.util.Scanner;

public class Main {
    static boolean isVowel(char c) {
        c = Character.toLowerCase(c);
        return c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u';
    }

    static int countVowels(String text) {
        int count = 0;
        for (int i = 0; i < text.length(); i++) {
            if (isVowel(text.charAt(i))) {
                count++;
            }
        }
        return count;
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        String line = in.nextLine();
        System.out.println("Vowels: " + countVowels(line));
    }
}`, stdin: 'Programming in Java is fun', caption: 'Three methods, three jobs: decide about one character, count over a string, talk to the user. A boolean method returns the condition itself; there is no need for if (...) return true; else return false;.' },
        `<div class="stmt"><p><span class="kind">Rule of thumb.</span> If you can say what a piece of code does in a few words, it can be a method with that name. If a method needs a comment to explain what it returns, rename it, or split it. A method that returns a <code>boolean</code> should read like a question: <code>isVowel</code>, <code>isPrime</code>, <code>hasNext</code>.</p></div>
<h2>Exercises that ask for a method</h2>
<p>From now on some exercises ask you to write only a method. The checker supplies the class and a <code>main</code> that calls your method with various arguments and prints the results. Write the method exactly as declared in the task, with the word <code>static</code>, and no <code>main</code> of your own. You can test a method yourself by opening the exercise in the Code Lab and adding a <code>main</code> there; just remove it before checking.</p>`,
        `<details class="reveal"><summary>Puzzle: what does this print? <code>static int f(int n) { return n + 1; }</code> and in main: <code>int n = 1; f(n); f(n); System.out.println(n);</code></summary><p><code>1</code>. Each call computes 2 and hands it back, but nothing in <code>main</code> catches the value; the parameter <code>n</code> inside <code>f</code> is a copy, and <code>main</code>'s <code>n</code> never changes. To make use of a returned value, store it: <code>n = f(n);</code>.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Forgetting the return type, or a parameter's type, in the declaration. Writing the type in the call, <code>square(int 7)</code>. A non-<code>void</code> method that can reach its closing brace without returning. Calling a method and ignoring the value it returns, then wondering why nothing changed. Expecting a method to change the variable you passed in; return the new value instead. Putting the "not found" <code>return</code> inside the loop, so a search stops after one try. Forgetting <code>static</code> (the message is <em>non-static method cannot be referenced from a static context</em>). Defining a method inside <code>main</code>, or inside another method: methods live side by side in the class. A recursive method with no base case.</p>` },
        {
          ex: {
            id: 'jv-4-1', title: 'Prime or not',
            prompt: `<p>Write a method</p><pre class="code">static boolean isPrime(int n)</pre><p>that returns <code>true</code> if <code>n</code> is a prime number and <code>false</code> otherwise. A prime is a whole number greater than 1 whose only divisors are 1 and itself, so 2, 3, 5, 7 and 11 are prime; 1, 0, negative numbers, 4 and 9 are not. Write only the method; the checker supplies <code>main</code>.</p>`,
            starter: `static boolean isPrime(int n) {\n    // numbers below 2 are not prime; then look for a divisor\n    return false;\n}`,
            solution: `static boolean isPrime(int n) {\n    if (n < 2) {\n        return false;\n    }\n    for (int d = 2; d * d <= n; d++) {\n        if (n % d == 0) {\n            return false;\n        }\n    }\n    return true;\n}`,
            hints: ['Deal with the easy case first: if (n < 2) return false;', 'Then try every possible divisor d from 2 upwards: if n % d == 0, you have found one, and the answer is false at once. Only after the loop has tried them all can you return true.', 'It is enough to try d while d * d <= n (or d < n, which is slower but also correct). The return true goes after the loop, not inside it.'],
            tests: [{ call: 'isPrime(2)', expect: 'true' }, { call: 'isPrime(3)', expect: 'true' }, { call: 'isPrime(4)', expect: 'false' }, { call: 'isPrime(1)', expect: 'false' }, { call: 'isPrime(0)', expect: 'false' }, { call: 'isPrime(-7)', expect: 'false' }, { call: 'isPrime(97)', expect: 'true' }, { call: 'isPrime(91)', expect: 'false' }, { call: 'isPrime(7919)', expect: 'true' }],
            failTip: 'Check the small cases by hand: 0, 1 and negatives are not prime; 2 is. A return true inside the loop is the usual mistake: the loop can only ever prove the answer is false.'
          }
        },
        {
          ex: {
            id: 'jv-4-2', title: 'Greatest common divisor',
            prompt: `<p>Write a method</p><pre class="code">static int gcd(int a, int b)</pre><p>that returns the greatest common divisor of two whole numbers that are 0 or more, at least one of them positive: the largest number that divides both. For example <code>gcd(12, 18)</code> is 6, <code>gcd(7, 5)</code> is 1 and <code>gcd(0, 9)</code> is 9. Use Euclid's method, which is over two thousand years old and still the best: while <code>b</code> is not 0, replace the pair <code>(a, b)</code> by <code>(b, a % b)</code>; when <code>b</code> reaches 0, <code>a</code> is the answer. Write only the method.</p>`,
            starter: `static int gcd(int a, int b) {\n    // while b is not 0: the new a is b, the new b is a % b\n    return a;\n}`,
            solution: `static int gcd(int a, int b) {\n    while (b != 0) {\n        int remainder = a % b;\n        a = b;\n        b = remainder;\n    }\n    return a;\n}`,
            hints: ['The loop runs while (b != 0). Inside it you need the remainder a % b, but you need it after a has already been overwritten: compute it into a variable first.', 'int remainder = a % b; a = b; b = remainder; Three lines, in that order. Then return a after the loop.', 'Trace gcd(12, 18) on paper: (12, 18) → (18, 12) → (12, 6) → (6, 0) → answer 6. If your trace differs, the order of the three lines is wrong.'],
            tests: [{ call: 'gcd(12, 18)', expect: '6' }, { call: 'gcd(18, 12)', expect: '6' }, { call: 'gcd(7, 5)', expect: '1' }, { call: 'gcd(0, 9)', expect: '9' }, { call: 'gcd(9, 0)', expect: '9' }, { call: 'gcd(100, 75)', expect: '25' }, { call: 'gcd(1071, 462)', expect: '21' }, { call: 'gcd(13, 13)', expect: '13' }],
            followup: 'Euclid wrote this as repeated subtraction in the Elements, around 300 BC; the % version is the same idea with the subtractions bundled. It is one of the oldest algorithms still in daily use, inside every program that reduces a fraction or sets up an encryption key.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A method is declared with a return type, a name, typed parameters and a body, beside <code>main</code> in the class, with <code>static</code> for now. A call supplies arguments and stands for the returned value.</li>
<li><code>return value;</code> ends the method and hands back the value; a non-<code>void</code> method must return on every path. A <code>void</code> method does something instead of returning, and is called as a statement.</li>
<li>Parameters are copies: a method cannot change the caller's <code>int</code>; it returns a new value, and the caller stores it. Each method's variables are its own.</li>
<li>Overloading: several methods with one name and different parameters; the compiler picks by the argument types. A method may call itself, if some case stops the recursion.</li>
<li>Give each job a method with a name that says what it does; a <code>boolean</code> method reads like a question.</li>
</ul></div>`
      ]
    }
  ]
});
