// Lesson content, (c) 2026 Michael Sayers, licensed CC BY-SA 4.0 (see LICENSE-CONTENT.md).
// This course runs on the site's own Java interpreter (src/java.js): it checks programs the way javac does and runs them like the JVM.
window.COURSES = window.COURSES || [];
window.COURSES.push({
  id: 'java', code: 'SC 106', short: 'Java', lang: 'java', status: 'developing',
  title: 'Introduction to Java',
  grades: 'Grades 10–12 · after Python, or with some experience',
  audience: `<p><b>Grades 10–12</b>, after the Python course or a semester of any language. Java is the language of the AP Computer Science A exam, of Android apps, and of much of the software that runs banks, airlines and large web sites. It is also the language most university first-year courses use. Expect the ceremony of a typed, compiled language, and in return a compiler that catches a whole class of mistakes before your program runs.</p><p>Each lesson is a self-contained Hour of Code activity. The course is being written: the first eight lessons are here, and more follow.</p>`,
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
        `<p>In 1991 a small team at Sun Microsystems in California, led by James Gosling, set out to write software for the gadgets they expected to fill living rooms: television set-top boxes, handheld controllers, devices that did not yet exist. Every such device would have a different chip inside, so a program written for one would have to be rewritten for the next. Gosling's answer was a language whose programs were not translated for any particular chip. Instead they were translated into instructions for an imaginary machine, the <em>Java virtual machine</em>, and any real device that could pretend to be that machine could run every Java program ever written. He called the language Oak, after a tree outside his office window. The set-top boxes never came. The World Wide Web did, and in 1995 the language, renamed Java, was released to run the same program on every computer on the Internet. Its slogan was "write once, run anywhere".</p>`,
        `<p>It worked. Today the same Java program runs on a laptop, a phone and a rack of servers. Android apps are written in it, and so are large parts of the systems behind banks, airlines and the biggest web sites. So was a game you may know. Markus Persson, a Swedish programmer, began <em>Minecraft</em> in his spare time and released the first version to the public in 2009, written in Java. Minecraft: Java Edition is still a Java program, and the mods that players write for it, adding new blocks, creatures and machines, are Java programs too. (The Bedrock Edition, for consoles and phones, is written in C++.)</p>`,
        { photo: ['minecraft-cave-game-2009', 'minecraft-beta-landscape'], caption: 'Minecraft in 2009, in an early version then called <i>Cave Game</i>, and two years later in Beta 1.8.1, with a river, trees, and the row of nine inventory slots at the bottom of the screen. Every block in both pictures was drawn by a Java program.' },
        `<p>It is the language of the AP Computer Science A exam and of most university first-year courses. If you learned Python first, Java will feel like Python with its rules written out in full: every value has a type, every statement ends with a mark, and a compiler reads your whole program before any of it runs. This lesson is about reading those rules so they stop looking like noise.</p>
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
}`, caption: 'A cast, (double) total, makes a copy of the value as a double before the division. The line that prints 4.0 shows the classic mistake: casting the result instead of an operand.' },
        { check: "What does <code>7 / 2</code> give in Java?", options: ["3.5", "3", "4"], answer: 1, why: "int divided by int is an int: the fraction is dropped, not rounded. 7 / 2.0 gives 3.5." },
        `<div class="stmt"><p><span class="kind">Rule (division).</span> <code>int / int</code> is an <code>int</code>: the fraction is dropped, not rounded. To get a decimal answer, make one operand a <code>double</code> first, with a cast or by writing <code>2.0</code> instead of <code>2</code>.</p>
<p><span class="kind">Rule (mixing).</span> When an <code>int</code> meets a <code>double</code>, the <code>int</code> is converted and the answer is a <code>double</code>. Going the other way needs a cast, <code>(int) 3.99</code>, which gives <code>3</code>: the fraction is cut off, not rounded. Storing a <code>double</code> in an <code>int</code> without a cast is a compile error: <em>possible lossy conversion from double to int</em>.</p></div>
<p>Dropping the fraction sounds like a nuisance, but often it is exactly the question. In Minecraft one inventory slot holds a <em>stack</em> of up to 64 blocks of dirt or stone (eggs stack only to 16). How many full stacks do 200 blocks make, and how many are left over? That is <code>/</code> and <code>%</code>.</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        int blocks = 200;
        int stacks = blocks / 64;   // whole stacks of 64
        int left = blocks % 64;     // the remainder
        System.out.println(blocks + " blocks make " + stacks + " stacks and " + left + " more");
        System.out.println("Check: " + (stacks * 64 + left));
        int perStack = 16;          // eggs stack only to 16
        int eggs = 50;
        System.out.println(eggs / perStack + " full stacks of eggs, " + eggs % perStack + " left");
        System.out.println(blocks / 64.0 + " stacks, if a stack could be cut");
    }
}`, caption: 'Division and remainder always fit back together: stacks × 64 + left is the number you started with. Try 64 blocks, then 63. The last line shows what a double gives instead: an answer no inventory can hold.' },
        `<h2>Printing</h2>
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
        `<p>A game is full of decisions like these. In Minecraft a wooden pickaxe takes 3 planks and 2 sticks, and 2 planks make 4 sticks. A program that advises the player tests the best case first, then the next best, and so on down the chain.</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        int planks = 5;
        int sticks = 1;
        if (planks >= 3 && sticks >= 2) {
            System.out.println("You can craft a wooden pickaxe.");
        } else if (planks >= 5) {
            System.out.println("Turn 2 planks into 4 sticks first, then craft the pickaxe.");
        } else {
            System.out.println("Chop more wood: one log makes 4 planks.");
        }
    }
}`, caption: 'With 5 planks and 1 stick the first test fails (not enough sticks) and the second succeeds. Try planks = 3 and sticks = 2, then planks = 4 and sticks = 0. Why does the second test ask for 5 planks, not 3?' },
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
        `<p>In 1994 Thomas Nicely, a mathematics professor at Lynchburg College in Virginia, set a new Pentium computer to work on a problem that needed a great deal of repetition: adding up the reciprocals of the twin primes, pairs of primes two apart like 11 and 13, as far as the machine could reach. His program ran through hundreds of millions of numbers, dividing 1 by each. In June he noticed that its answers disagreed with results he had computed on older machines. By October he had narrowed the difference down to a single division, 1 divided by 824633702441, which the new chip got wrong in the tenth digit. The Pentium's floating-point division unit had a flaw in a lookup table, and it had taken a loop running billions of times to find the handful of inputs that exposed it. Intel eventually offered to replace every affected chip, at a cost of about 475 million dollars.</p>`,
        { photo: 'pentium-fdiv', caption: 'An early 66 MHz Pentium. Chips of this batch, marked SX837, have the division flaw that Nicely found.' },
        `<p>Repetition is the thing computers do that people cannot: the same step, billions of times, without tiring and without a single slip, so that when a slip does appear it is worth 475 million dollars. In Python you wrote loops with <code>while</code> and <code>for</code>. Java has both, and its <code>for</code> is a more general tool than Python's. This lesson is about writing loops that stop where you meant them to, which is where most loop bugs live.</p>
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
        `<p>In 1949 the EDSAC at Cambridge University became one of the first computers that stored its program in memory alongside its data. Its users soon noticed that they were writing the same pieces of code over and over: a routine to print a number, a routine to take a square root, a routine to read paper tape. David Wheeler, a research student on the project, worked out how a program could jump into such a routine, let it do its work, and come back to the place it had left, with the routine none the wiser about who had called it. The trick is still called the Wheeler jump. By 1951 Wheeler, Maurice Wilkes and Stanley Gill had published the first textbook of programming, and most of it was about a library of these <em>subroutines</em>, kept on paper tape in a cabinet, that any program could borrow.</p>`,
        { photo: 'edsac-renwick', caption: 'EDSAC at Cambridge, nearly complete, with W. Renwick standing beside it. Each rack is shelf after shelf of valves; programs and the subroutine library were fed in on paper tape.' },
        `<p>Every language since has had them under some name: subroutines, procedures, functions. Java calls them <em>methods</em>, and you have been using them from the first line you wrote: <code>println</code> is a method, so are <code>nextInt</code> and <code>Math.sqrt</code>, and the program itself lives in one called <code>main</code>. This lesson is about writing your own, and the reason is the one Wheeler saw: a piece of code that does one job, written once, named, and called from wherever it is needed.</p>
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
        `<p>Here is a method with two parameters that a Minecraft player could use. An inventory slot holds one stack: up to 64 blocks of dirt, but only 16 eggs, and a sword does not stack at all. How many slots does a pile of items need? Lesson 1 found the full stacks with <code>/</code>; a part stack needs a slot too, so this time the division must round <em>up</em>. Adding <code>stackSize - 1</code> before dividing does that, and once it is in a method nobody has to remember the trick again.</p>`,
        { play: `public class Main {
    static int slotsNeeded(int items, int stackSize) {
        return (items + stackSize - 1) / stackSize;   // rounds up: a part stack needs a slot too
    }

    public static void main(String[] args) {
        System.out.println(slotsNeeded(200, 64));   // 3 full stacks and 8 more
        System.out.println(slotsNeeded(64, 64));    // exactly one stack
        System.out.println(slotsNeeded(50, 16));    // eggs stack to 16
        System.out.println(slotsNeeded(3, 1));      // swords do not stack at all
        int total = slotsNeeded(200, 64) + slotsNeeded(50, 16) + slotsNeeded(3, 1);
        System.out.println("Slots for everything: " + total + " of 36");
    }
}`, caption: 'A player\u2019s inventory has 36 slots. Check the rounding by hand: 200 + 63 = 263, and 263 / 64 is 4. Try slotsNeeded(0, 64): no items need no slots.' },
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
}`, expectError: true, caption: 'Main.java:10: error: cannot find symbol: variable result. The result inside twice belongs to twice. Note that both methods have a variable called value, and they are two different variables.' },
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
    },
    /* ================================================================== */
    {
      title: 'Arrays', summary: 'Many values under one name: making and indexing arrays, visiting every slot, the bounds Java checks, arrays shared between methods, counting with an array, and tables of rows and columns.',
      blocks: [
        `<p>In 1985 Friedhelm Hillebrand, an engineer at the German post office, was helping to plan GSM, the new mobile phone network that Europe was about to build, and he had to decide how long a text message could be. The messages were to travel in a spare corner of the network's signalling channel, where there was room for only a small, fixed amount of data, so the limit had to be chosen once, before a single phone was made. Hillebrand sat at his typewriter at home in Bonn, typed out the kind of sentences and questions people send each other, and counted the characters. Nearly all of them fitted in 160. So did most of the postcards and telex messages he looked at. The limit became 160 characters, each squeezed into 7 bits, so that a whole message fits in 140 bytes. When Twitter began in 2006 it kept its posts short enough to travel as one text message with room for the sender's name, and that is where its famous limit of 140 characters came from.</p>`,
        { photo: 'sms-feature-phone', caption: 'A text message on a basic mobile phone. With so few characters to spend, people invented a shorthand to fit more into each one: gr8, 2nite, 4 ur.' },
        `<p>Programs need the same thing all the time: not one value but many of the same kind. Thirty test scores, twelve monthly rainfall totals, the 36 slots of a Minecraft inventory. Thirty variables called <code>score1</code> to <code>score30</code> would hold the scores, but no loop could visit them, because a loop cannot make up a variable's name. Java's answer is the <em>array</em>: one variable that names a whole row of slots, all of the same type, numbered 0, 1, 2 and onwards. Like Hillebrand's messages, an array has a fixed number of slots, chosen when it is made.</p>
<h2>Making an array</h2>
<p>The type of an array is the type of its elements followed by square brackets: <code>int[]</code> is "array of <code>int</code>", <code>String[]</code> is "array of <code>String</code>". <code>new int[5]</code> makes an array of five <code>int</code>s, all set to 0. Each slot is reached by its <em>index</em> in square brackets, and the first index is 0, so the five slots are <code>scores[0]</code> to <code>scores[4]</code>. <code>scores.length</code> is the number of slots. It has no parentheses, unlike the <code>length()</code> of a <code>String</code>; that difference trips up everyone once.</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        int[] scores = new int[5];       // five ints, all 0
        scores[0] = 90;
        scores[1] = 72;
        scores[4] = scores[0] + 5;
        System.out.println(scores[0]);
        System.out.println(scores[2]);   // never set: still 0
        System.out.println(scores[4]);
        System.out.println(scores.length);
        int i = 1;
        scores[i + 1] = 60;              // any int expression can be an index
        System.out.println(scores[2]);
    }
}`, caption: 'An index can be any int expression: scores[i + 1] is scores[2] here. Try scores[5] = 1; and run. The program stops, because there is no slot 5; more on that below.' },
        `<div class="stmt"><p><span class="kind">Rule (indexes).</span> The slots of an array of length <code>n</code> are numbered 0 to <code>n − 1</code>. The first is <code>a[0]</code>; the last is <code>a[a.length - 1]</code>, not <code>a[a.length]</code>.</p>
<p><span class="kind">Rule (fixed length).</span> An array's length is decided when it is made and never changes. For more room, make a new, bigger array and copy the values across, or use an <code>ArrayList</code>, which does that for you (lesson 7).</p>
<p><span class="kind">Rule (starting values).</span> A new array is filled with zeros of its type: <code>0</code> for <code>int</code>, <code>0.0</code> for <code>double</code>, <code>false</code> for <code>boolean</code>, and <code>null</code>, meaning "no object", for <code>String</code> and every other class.</p></div>
<p>When you know the values in advance, list them in braces. Java counts them and makes an array of exactly that length.</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        int[] days = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
        String[] names = {"January", "February", "March", "April", "May", "June",
                          "July", "August", "September", "October", "November", "December"};
        System.out.println(days.length + " months");
        System.out.println(names[1] + " has " + days[1] + " days");
        int month = 12;                  // people count months from 1
        System.out.println(names[month - 1] + " has " + days[month - 1] + " days");
    }
}`, caption: 'Two arrays of the same length, where the same index means the same month: a common pattern. People number months from 1 and arrays number from 0, so the program subtracts 1 at the boundary, in one place.' },
        { check: "After <code>int[] a = new int[4];</code> which of these is <em>not</em> a slot of <code>a</code>?", options: ["<code>a[0]</code>", "<code>a[3]</code>", "<code>a[4]</code>"], answer: 2, why: "Four slots are numbered 0, 1, 2 and 3. There is no a[4]: using it stops the program with an ArrayIndexOutOfBoundsException." },
        `<h2>Visiting every slot</h2>
<p>Why start at 0? In 1982 the Dutch computer scientist Edsger Dijkstra wrote a short note, <em>Why numbering should start at zero</em>, arguing that a range of whole numbers is best written with its lower end included and its upper end left out: <code>0 ≤ i &lt; n</code>. Then a range of <code>n</code> numbers starts at 0, the count <code>n</code> appears in the condition itself, and two ranges that meet, <code>0 ≤ i &lt; 5</code> and <code>5 ≤ i &lt; 9</code>, share their boundary without overlapping. Java, like C before it, agrees, and so every loop over an array has the same shape: <code>for (int i = 0; i &lt; a.length; i++)</code>.</p>
<p>When the loop needs only the values and not their positions, there is a shorter form, the <em>for-each</em> loop: <code>for (double t : temps)</code> reads "for each <code>t</code> in <code>temps</code>". On each pass <code>t</code> holds a copy of the next value. It cannot tell you where you are in the array, and changing <code>t</code> does not change the array.</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        double[] temps = {12.5, 15.0, 9.5, 18.0, 17.5, 11.0, 14.5};
        double sum = 0;
        for (double t : temps) {
            sum += t;
        }
        System.out.printf("Average: %.2f%n", sum / temps.length);

        int hottest = 0;                         // where the largest so far is
        for (int i = 1; i < temps.length; i++) {
            if (temps[i] > temps[hottest]) {
                hottest = i;
            }
        }
        System.out.println("Hottest: day " + (hottest + 1) + ", " + temps[hottest]);
    }
}`, caption: 'Use for-each when only the values matter. Finding where the largest value is needs the index, so the second loop counts. It starts by assuming day 0 is the hottest and compares every later day with the best so far.' },
        `<p>One thing does not work the way you would hope: <code>System.out.println(temps)</code> does not print the temperatures. It prints the array's type and a number that identifies it, something like <code>[D@1b6d3586</code> (<code>D</code> for <code>double</code>). The library class <code>Arrays</code> has a method that prints the contents, and a few more that save writing loops.</p>`,
        { play: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] rolls = {4, 2, 6, 6, 1, 3};
        System.out.println(rolls);                     // not what you want
        System.out.println(Arrays.toString(rolls));
        Arrays.sort(rolls);                            // smallest first, in place
        System.out.println(Arrays.toString(rolls));
        int[] more = Arrays.copyOf(rolls, 8);          // a new, longer array
        System.out.println(Arrays.toString(more));
        Arrays.fill(more, 7);
        System.out.println(Arrays.toString(more));
    }
}`, caption: 'The first line prints [I@ and a number (I for int) that changes from run to run. Arrays.toString shows the contents; Arrays.sort sorts the array itself; Arrays.copyOf makes a new array, padding with zeros. All need import java.util.Arrays; at the top.' },
        `<h2>Staying inside the array</h2>
<p>On 2 November 1988 a program written by Robert Morris, a graduate student at Cornell University, spread across the Internet and slowed thousands of computers to a crawl, perhaps a tenth of all the machines then connected. One of the ways it got in was through a server program written in C, which read each request into an array of 512 characters without checking the request's length. Morris's program sent a longer one. C wrote the extra characters straight past the end of the array, over memory that held other things, and the worm's own instructions ended up where the computer would run them. The mistake is called a <em>buffer overflow</em>, and the worm made it famous.</p>
<p>Java was designed in the years just after, and it never lets this happen. Every index is checked as the program runs. An index below 0, or equal to the length or beyond it, stops the program with an <code>ArrayIndexOutOfBoundsException</code> that names the index and the length. A crash is not pleasant, but it is far better than quietly writing over something else.</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        int[] a = {10, 20, 30};
        int total = 0;
        for (int i = 0; i <= a.length; i++) {    // one step too far
            total += a[i];
        }
        System.out.println(total);
    }
}`, expectError: true, caption: 'Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3. Because of <=, the loop also runs with i equal to 3. Change it to < and run again: 60.' },
        `<div class="stmt"><p><span class="kind">Trap (off by one).</span> A loop over an array runs <code>i = 0; i &lt; a.length</code>. Writing <code>&lt;=</code> visits one slot too many; starting at 1 misses the first. When a loop works on neighbours, <code>a[i]</code> and <code>a[i + 1]</code>, it must stop one sooner: <code>i &lt; a.length - 1</code>.</p></div>`,
        { check: "A loop runs <code>for (int i = 1; i &lt;= a.length; i++)</code> and reads <code>a[i]</code>. What happens?", options: ["It reads every slot", "It misses <code>a[0]</code>, then stops with an exception at the end", "It reads every slot except the last"], answer: 1, why: "Starting at 1 skips a[0], and when i reaches a.length the index is out of bounds, so the program stops. The loop people mean is i = 0; i &lt; a.length." },
        `<h2>Arrays are shared, not copied</h2>
<p>Lesson 4 showed that a method receives a copy of an <code>int</code>, so it cannot change the caller's variable. Arrays behave differently, and the reason is worth knowing exactly. An array variable does not hold the slots themselves. It holds a <em>reference</em>: where in memory the array is. <code>int[] b = a;</code> copies the reference, so <code>a</code> and <code>b</code> are two names for one array, and a change made through either is seen through both. Passing an array to a method copies the reference in the same way, so the method works on the caller's slots.</p>`,
        { play: `import java.util.Arrays;

public class Main {
    static void doubleAll(int[] values) {
        for (int i = 0; i < values.length; i++) {
            values[i] = values[i] * 2;
        }
    }

    public static void main(String[] args) {
        int[] a = {1, 2, 3};
        int[] b = a;                     // b names the same array
        b[0] = 99;
        System.out.println(Arrays.toString(a));
        doubleAll(a);                    // the method changes the caller's array
        System.out.println(Arrays.toString(a));
        int[] c = Arrays.copyOf(a, a.length);    // a real copy
        System.out.println((a == b) + " " + (a == c) + " " + Arrays.equals(a, c));
        c[0] = 0;
        System.out.println(Arrays.toString(a) + " " + Arrays.toString(c));
    }
}`, caption: 'a == b asks whether two names refer to the same array; Arrays.equals compares the contents, slot by slot. After the real copy, changing c leaves a alone.' },
        `<div class="stmt"><p><span class="kind">Rule (references).</span> Assigning an array, or passing it to a method, copies the reference, not the slots. A method can change the elements of an array it is given, and the caller sees the change. To get an independent copy, use <code>Arrays.copyOf</code>. To compare contents, use <code>Arrays.equals(a, b)</code>, not <code>==</code>.</p></div>`,
        { check: "<code>int[] a = {1, 2}; int[] b = a; b[1] = 5;</code> What is <code>a[1]</code> now?", options: ["2", "5", "A compile error"], answer: 1, why: "b = a copies the reference, not the slots, so a and b are the same array. To copy the slots, use Arrays.copyOf." },
        `<h2>Counting with an array</h2>
<p>Here is an idea that turns up again and again. To count how often each of a few values occurs, keep an array of counters and use the value itself as the index. A shop's reviews give 1 to 5 stars; <code>count[stars]++</code> adds one to the right counter with no <code>if</code> for each rating.</p>`,
        { play: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int[] count = new int[6];        // count[1] to count[5]; count[0] is not used
        while (in.hasNextInt()) {
            int stars = in.nextInt();
            count[stars]++;
        }
        for (int s = 5; s >= 1; s--) {
            System.out.print(s + " stars: ");
            for (int k = 0; k < count[s]; k++) {
                System.out.print("*");
            }
            System.out.println(" " + count[s]);
        }
    }
}`, stdin: '5 4 5 3 5 1 4 5 2 4 5 4', caption: 'Making the array one longer than needed, so that count[5] exists, is simpler than subtracting 1 every time. Add a review of 6 stars to the input and run: the index is checked, as always.' },
        `<h2>Tables of rows and columns</h2>
<p>An array can hold arrays. <code>char[][] map = new char[4][8]</code> makes 4 rows, each an array of 8 <code>char</code>s. <code>map[r]</code> is one whole row, <code>map[r][c]</code> one square, <code>map.length</code> the number of rows and <code>map[r].length</code> the number of columns in row <code>r</code>. Visiting every square takes two loops, one inside the other: rows on the outside, columns inside, the way you read a page.</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        char[][] map = new char[4][8];           // 4 rows of 8
        for (int r = 0; r < map.length; r++) {
            for (int c = 0; c < map[r].length; c++) {
                map[r][c] = '.';
            }
        }
        map[1][2] = '#';
        map[2][5] = '#';
        map[3][0] = '@';                         // the player
        for (int r = 0; r < map.length; r++) {
            for (int c = 0; c < map[r].length; c++) {
                System.out.print(map[r][c]);
            }
            System.out.println();
        }
        System.out.println(map.length + " rows of " + map[0].length);
    }
}`, caption: 'Rows first, then columns. Try putting a # at map[0][7], then at map[4][0]. A Minecraft world is stored in much the same way, in chunks of 16 by 16 columns of blocks: an array with a third index for the height.' },
        `<details class="reveal"><summary>Puzzle: what does this print? <code>int[] a = new int[3]; a[a.length - 1] = a.length; a[0] = a[2] - 1; System.out.println(Arrays.toString(a));</code></summary><p><code>[2, 0, 3]</code>. <code>a.length</code> is 3, so <code>a[2]</code> becomes 3; then <code>a[0]</code> becomes <code>3 - 1</code>; <code>a[1]</code> was never set and is still 0. The last slot is always <code>a[a.length - 1]</code>.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Using <code>a[a.length]</code> for the last slot, or <code>&lt;=</code> in the loop condition. Writing <code>a.length()</code> for an array or <code>s.length</code> for a String. Printing an array with <code>println</code> and getting <code>[I@…</code>. Expecting <code>b = a</code> to copy an array, or <code>a == b</code> to compare contents. Reading a slot of a <code>String[]</code> that was never filled, which is <code>null</code>, and calling a method on it: <code>NullPointerException</code>. Trying to make an array longer: make a new one with <code>Arrays.copyOf</code>. Changing the variable of a for-each loop and expecting the array to change.</p>` },
        {
          ex: {
            id: 'jv-5-1', title: 'Above average',
            prompt: `<p>Read a whole number <code>n</code>, then <code>n</code> test scores (whole numbers). Print the average with one decimal place, then how many scores are strictly above the average, in exactly this form:</p><pre class="code">Average: 82.5\nAbove average: 2</pre><p>(That is the output for the input <code>4</code> and then <code>90 75 85 80</code>.) You cannot count the scores above the average until you know the average, so keep the scores in an array and go through them twice.</p>`,
            starter: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        int n = in.nextInt();\n        int[] scores = new int[n];\n        // read the n scores into the array, adding them up\n        // then count the scores above the average\n    }\n}`,
            solution: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        int n = in.nextInt();\n        int[] scores = new int[n];\n        int sum = 0;\n        for (int i = 0; i < n; i++) {\n            scores[i] = in.nextInt();\n            sum += scores[i];\n        }\n        double average = (double) sum / n;\n        int above = 0;\n        for (int s : scores) {\n            if (s > average) {\n                above++;\n            }\n        }\n        System.out.printf("Average: %.1f%n", average);\n        System.out.println("Above average: " + above);\n    }\n}`,
            sampleStdin: '4\n90 75 85 80',
            hints: ['First loop: for (int i = 0; i < n; i++) { scores[i] = in.nextInt(); sum += scores[i]; }', 'The average must be a double: (double) sum / n. Without the cast, 330 / 4 is 82, not 82.5.', 'Second loop: for (int s : scores) if (s > average) above++; Then printf("Average: %.1f%n", average) and println("Above average: " + above).'],
            tests: [{ stdin: '4\n90 75 85 80', expect: 'Average: 82.5\nAbove average: 2' }, { stdin: '3\n70 70 70', expect: 'Average: 70.0\nAbove average: 0' }, { stdin: '5\n100 0 0 0 0', expect: 'Average: 20.0\nAbove average: 1' }, { stdin: '1\n42', expect: 'Average: 42.0\nAbove average: 0' }, { stdin: '6\n1 2 3 4 5 6', expect: 'Average: 3.5\nAbove average: 3' }, { stdin: '3\n1 1 2', expect: 'Average: 1.3\nAbove average: 1' }],
            failTip: 'Check the case where every score is the same: none is strictly above the average. And check that the average is computed as a double.'
          }
        },
        {
          ex: {
            id: 'jv-5-2', title: 'Running totals',
            prompt: `<p>Write a method</p><pre class="code">static int[] runningTotals(int[] a)</pre><p>that returns a <em>new</em> array of the same length, in which each slot holds the total of <code>a</code> up to and including that position. For <code>{1, 2, 3, 4}</code> it returns <code>{1, 3, 6, 10}</code>. The array <code>a</code> itself must not change, and an empty array gives an empty array. Write only the method; the checker prints the result with <code>Arrays.toString</code>.</p>`,
            prelude: 'import java.util.Arrays;',
            starter: `static int[] runningTotals(int[] a) {\n    int[] totals = new int[a.length];\n    // each slot is the total so far plus a[i]\n    return totals;\n}`,
            solution: `static int[] runningTotals(int[] a) {\n    int[] totals = new int[a.length];\n    int sum = 0;\n    for (int i = 0; i < a.length; i++) {\n        sum += a[i];\n        totals[i] = sum;\n    }\n    return totals;\n}`,
            hints: ['Keep a running sum in an int, starting at 0. In the loop, add a[i] to it, then store it in totals[i].', 'Write into totals, never into a: the caller’s array must come back unchanged.'],
            tests: [{ call: 'Arrays.toString(runningTotals(new int[] {1, 2, 3, 4}))', expect: '[1, 3, 6, 10]' }, { call: 'Arrays.toString(runningTotals(new int[] {5}))', expect: '[5]' }, { call: 'Arrays.toString(runningTotals(new int[] {3, -1, -2, 10}))', expect: '[3, 2, 0, 10]' }, { call: 'Arrays.toString(runningTotals(new int[0]))', expect: '[]' }, { name: 'a is not changed', setup: '        int[] a = {2, 4, 6};\n        int[] t = runningTotals(a);', call: 'Arrays.toString(a) + " " + Arrays.toString(t)', expect: '[2, 4, 6] [2, 6, 12]' }],
            followup: 'Running totals are called prefix sums, and they make a slow question fast. With t = runningTotals(a), the total of the stretch from a[i] to a[j] is t[j] - t[i - 1]: one subtraction, however long the stretch. Write a method rangeSum(int[] t, int i, int j) that uses it, taking care when i is 0.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>An array is a fixed number of slots of one type: <code>new int[n]</code> (filled with zeros) or <code>{1, 2, 3}</code>. Slots are <code>a[0]</code> to <code>a[a.length - 1]</code>; <code>a.length</code> has no parentheses.</li>
<li>Loop with <code>for (int i = 0; i &lt; a.length; i++)</code> when you need positions, and with <code>for (int x : a)</code> when you need only the values.</li>
<li>Every index is checked: one outside the array stops the program with an <code>ArrayIndexOutOfBoundsException</code>, instead of writing over memory as the Morris worm made C do.</li>
<li>An array variable holds a reference: assignment and method calls share the array, so a method can change its elements. <code>Arrays.copyOf</code> copies, <code>Arrays.equals</code> compares, <code>Arrays.toString</code> prints, <code>Arrays.sort</code> sorts.</li>
<li>An array of counters, indexed by the value being counted, tallies without an <code>if</code> per value. <code>int[][]</code> is an array of rows: <code>grid[r][c]</code>.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Strings', summary: 'Text as a row of characters: indexes and substrings, searching, why a String never changes, alphabetical order, characters as numbers, building text with StringBuilder, and splitting a line into parts.',
      blocks: [
        `<p>In 1987 three engineers, Joe Becker at Xerox and Lee Collins and Mark Davis at Apple, started work on a mess that every computer company had made for itself. Computers store letters as numbers, and each country, often each company, had its own table of which number meant which letter. The number that meant <em>é</em> on one computer meant a Greek letter or a line-drawing symbol on another, so a file written in Paris could arrive in Athens as nonsense. Becker's proposal of 1988, which he named <em>Unicode</em>, was one table for every writing system on Earth: Latin and Greek, Arabic and Hebrew, Devanagari and Thai, and the tens of thousands of Chinese characters, each with a number of its own. He reckoned that 16 bits, room for 65,536 characters, would be plenty for every script in modern use.</p>
<p>Java, designed a few years later, believed him: a Java <code>char</code> is exactly 16 bits. Then the world wanted more. Ancient scripts, rare Chinese characters, mathematical symbols and, from 2010, emoji pushed Unicode far past 65,536; it now has more than 150,000 characters. Java's <code>char</code> could not grow, so every character beyond the first 65,536 is stored as a <em>pair</em> of <code>char</code>s. To this day Java will tell you that the text <code>"😀"</code>, one character on your screen, has a length of 2. This lesson is about text in Java: what a <code>String</code> is, and the dozen methods you will use every day.</p>`,
        { photo: 'rosetta-stone', caption: 'The Rosetta Stone, carved in 196 BC, carries the same decree in three scripts: Egyptian hieroglyphs, Demotic and Greek. Scholars could read the Greek, and that made it the key to reading hieroglyphs. Today Unicode has numbers for Egyptian hieroglyphs as well as for Greek letters.' },
        `<h2>A String is a row of characters</h2>
<p>A <code>String</code> is a sequence of <code>char</code>s, numbered from 0 like the slots of an array. <code>s.length()</code> is how many there are (with parentheses: a <code>String</code> is an object and <code>length</code> is one of its methods), and <code>s.charAt(i)</code> is the character at index <code>i</code>, so the last one is <code>s.charAt(s.length() - 1)</code>. <code>s.substring(begin, end)</code> is a new <code>String</code> made of the characters from <code>begin</code> up to, but not including, <code>end</code>: the same half-open range as an array loop, <code>begin ≤ i &lt; end</code>. Leave out <code>end</code> and the substring runs to the end of the text.</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        String email = "ada.lovelace@example.org";
        System.out.println(email.length());
        System.out.println(email.charAt(0));
        System.out.println(email.charAt(email.length() - 1));
        int at = email.indexOf('@');                 // where the @ is
        System.out.println(at);
        String user = email.substring(0, at);        // up to, not including, the @
        String domain = email.substring(at + 1);     // from just after the @ to the end
        System.out.println(user + " at " + domain);
        System.out.println(email.substring(4, 12) + " has " + (12 - 4) + " characters");
    }
}`, caption: 'indexOf finds the @, and two substrings cut the address on either side of it. Because the end index is left out, substring(4, 12) has exactly 12 − 4 characters. Try substring(at) instead of substring(at + 1).' },
        `<div class="stmt"><p><span class="kind">Rule (indexes).</span> The characters of <code>s</code> are <code>s.charAt(0)</code> to <code>s.charAt(s.length() - 1)</code>. An index outside that range stops the program with a <code>StringIndexOutOfBoundsException</code>.</p>
<p><span class="kind">Rule (substring).</span> <code>s.substring(b, e)</code> includes index <code>b</code> and stops before index <code>e</code>, so its length is <code>e − b</code>. <code>s.substring(b)</code> runs from <code>b</code> to the end. <code>s.substring(0, 0)</code> is the empty string <code>""</code>, which is a perfectly good <code>String</code> of length 0.</p></div>`,
        { check: "What is <code>\"computer\".substring(3, 6)</code>?", options: ["<code>\"put\"</code>", "<code>\"pute\"</code>", "<code>\"mpu\"</code>"], answer: 0, why: "c is index 0, so p is 3, u is 4 and t is 5. The end index 6 is not included: three characters, 6 − 3." },
        `<h2>Searching</h2>
<p><code>s.indexOf(x)</code> returns the index where <code>x</code> (a <code>char</code> or a <code>String</code>) first appears, or <code>-1</code> if it does not appear at all; always check for <code>-1</code> before using the answer as an index. <code>s.indexOf(x, from)</code> starts looking at index <code>from</code>, which is how a loop finds every occurrence, and <code>s.lastIndexOf(x)</code> searches from the end. When you only need yes or no, <code>s.contains(x)</code>, <code>s.startsWith(x)</code> and <code>s.endsWith(x)</code> return a <code>boolean</code>.</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        String file = "holiday.photo.jpg";
        int dot = file.lastIndexOf('.');
        System.out.println("Type: " + file.substring(dot + 1));
        System.out.println(file.startsWith("holiday") + " " + file.endsWith(".png") + " " + file.contains("photo"));
        System.out.println(file.indexOf("zip"));             // not there: -1

        String song = "la la land, la la la";
        int count = 0;
        int where = song.indexOf("la");
        while (where != -1) {
            count++;
            where = song.indexOf("la", where + 1);           // look again after this one
        }
        System.out.println("la appears " + count + " times");
    }
}`, caption: 'lastIndexOf finds the last dot, so a name with several dots still gives jpg. The loop asks indexOf again, starting one past the last find, until the answer is -1. Count the six by hand: the la in land counts too.' },
        `<h2>A String never changes</h2>
<p>Here is a fact about Java that surprises everyone once: a <code>String</code> cannot be changed. Not one character of it, ever. Methods that seem to change text, <code>toUpperCase()</code>, <code>replace</code>, <code>trim()</code>, <code>substring</code>, all leave the original alone and return a <em>new</em> <code>String</code>. If you do not store the result, it is thrown away. Strings that never change can be shared safely between any number of variables and methods, which is why Java's designers made them that way.</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        String name = "  Grace Hopper ";
        name.trim();                         // the result is thrown away
        name.toUpperCase();                  // so is this one
        System.out.println("[" + name + "]");
        name = name.trim().toUpperCase();    // store the new String
        System.out.println("[" + name + "]");
        String tidy = name.replace(' ', '_').toLowerCase();
        System.out.println(tidy + " " + name);
    }
}`, caption: 'The square brackets show the spaces. The first two calls make new Strings and drop them. Calls can be chained, name.trim().toUpperCase(), because each returns a String that the next one works on.' },
        `<div class="stmt"><p><span class="kind">Rule (immutable).</span> A <code>String</code> never changes. Every method that "changes" text returns a new <code>String</code>; write <code>s = s.toUpperCase();</code> to keep the result. This is also why a method cannot change a <code>String</code> you pass to it, although it can change the slots of an array.</p>
<p><span class="kind">Rule (equals).</span> Compare text with <code>a.equals(b)</code>, or <code>a.equalsIgnoreCase(b)</code> to ignore capitals; never with <code>==</code>, which asks whether two variables refer to the same object (lesson 2).</p></div>`,
        { check: "<code>String s = \"java\"; s.toUpperCase(); System.out.println(s);</code> What is printed?", options: ["<code>JAVA</code>", "<code>java</code>", "<code>Java</code>"], answer: 1, why: "toUpperCase returns a new String, and nothing stores it, so s is still \"java\". Write s = s.toUpperCase(); to keep the change." },
        `<h2>Alphabetical order</h2>
<p><code>a.compareTo(b)</code> says which of two strings comes first: a negative number if <code>a</code> comes before <code>b</code>, 0 if they are equal, a positive number if <code>a</code> comes after. Only the sign matters. It works character by character, comparing the characters' numbers, and that has a consequence: in Unicode, as in the older code ASCII, the capitals A to Z all have smaller numbers than the small letters a to z, so <code>"Zebra"</code> comes before <code>"apple"</code>. <code>Arrays.sort</code> on an array of strings uses the same order. When capitals should not count, use <code>compareToIgnoreCase</code>.</p>`,
        { play: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        System.out.println("apple".compareTo("banana"));    // negative: apple comes first
        System.out.println("pear".compareTo("pear"));       // 0: the same
        System.out.println("cat".compareTo("car"));         // positive: t comes after r
        System.out.println("Zebra".compareTo("apple"));     // negative: capitals come first
        System.out.println("Zebra".compareToIgnoreCase("apple"));
        String[] names = {"bob", "Alice", "carol", "Dave"};
        Arrays.sort(names);
        System.out.println(Arrays.toString(names));
    }
}`, caption: 'cat and car first differ at index 2, and t is two letters after r, so the answer is 2. Sorting puts Alice and Dave before bob and carol: all the capitals first. A dictionary would not do that.' },
        `<h2>Characters are numbers</h2>
<p>A <code>char</code> is stored as its Unicode number: <code>'A'</code> is 65, <code>'B'</code> 66, and so on to <code>'Z'</code> at 90; <code>'a'</code> is 97; the digit <code>'0'</code> is 48. Arithmetic on a <code>char</code> works on that number and gives an <code>int</code>, so <code>c - 'A'</code> is the position of a capital letter in the alphabet (0 for A, 25 for Z), and <code>(char) ('A' + 2)</code> turns a position back into a letter, C. The class <code>Character</code> has questions to ask of a single character: <code>Character.isLetter(c)</code>, <code>isDigit</code>, <code>isUpperCase</code>, and <code>Character.toUpperCase(c)</code>.</p>
<p>According to the Roman historian Suetonius, Julius Caesar wrote his secret letters by replacing each letter with the one three places further on in the alphabet. Shifting letters is a few lines of arithmetic on <code>char</code>s.</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        String message = "ATTACK AT DAWN";
        int shift = 3;
        String secret = "";
        for (int i = 0; i < message.length(); i++) {
            char c = message.charAt(i);
            if (c >= 'A' && c <= 'Z') {
                int pos = c - 'A';                         // 0 for A, 25 for Z
                c = (char) ('A' + (pos + shift) % 26);     // % 26 wraps round after Z
            }
            secret += c;
        }
        System.out.println(secret);
        System.out.println((int) 'A' + " " + (int) 'a' + " " + (char) 66 + " " + ('C' - 'A'));
    }
}`, caption: 'Characters that are not capital letters, like the spaces, pass through unchanged. To decode, shift by 23: three more steps round the alphabet of 26. Try it on the secret.' },
        { check: "What is <code>(char) ('a' + 2)</code>?", options: ["<code>'c'</code>", "<code>99</code>", "<code>'a2'</code>"], answer: 0, why: "'a' is 97, so 'a' + 2 is the int 99, and the cast turns 99 back into the character c. Without the cast the answer would be the number 99." },
        `<h2>Building text with StringBuilder</h2>
<p>The Caesar program builds its answer with <code>secret += c</code>. Because a <code>String</code> cannot change, every <code>+=</code> makes a brand new <code>String</code> and copies all the old characters into it. For a short message nobody notices; for a text of a million characters that is a million copies of ever longer strings, and the program crawls. A <code>StringBuilder</code> is text that <em>can</em> change: <code>append</code> adds to the end, <code>insert</code> puts text anywhere, <code>reverse</code> turns it round, and <code>toString()</code> gives back an ordinary <code>String</code> when you are done.</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= 5; i++) {
            sb.append(i);
            if (i < 5) {
                sb.append(", ");
            }
        }
        System.out.println(sb);
        sb.insert(0, "Count: ");
        System.out.println(sb + " (" + sb.length() + " characters)");
        String word = "stressed";
        String backwards = new StringBuilder(word).reverse().toString();
        System.out.println(word + " backwards is " + backwards);
    }
}`, caption: 'The if puts a comma between the numbers but not after the last one, a pattern you will write often. new StringBuilder(word).reverse().toString() is the usual way to reverse a String in Java.' },
        `<h2>Splitting a line into parts</h2>
<p>Data often arrives as one line with the parts separated by commas or spaces. <code>line.split(",")</code> cuts the line at every comma and returns the pieces as a <code>String[]</code>. The pieces are text, even when they look like numbers: <code>"1906" + 1</code> is <code>"19061"</code>. <code>Integer.parseInt(s)</code> turns text into an <code>int</code> (and <code>Double.parseDouble</code> into a <code>double</code>); it stops the program with a <code>NumberFormatException</code> if the text is not a number. Going the other way, <code>"" + n</code> or <code>String.valueOf(n)</code> turns a number into text.</p>`,
        { play: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        while (in.hasNextLine()) {
            String line = in.nextLine();
            String[] parts = line.split(",");
            String name = parts[0];
            int born = Integer.parseInt(parts[1]);
            int decade = born / 10 * 10;             // arithmetic needs a number, not text
            System.out.println(name + ", born in the " + decade + "s: " + parts[2]);
        }
    }
}`, stdin: 'Grace Hopper,1906,the first compilers\nKatherine Johnson,1918,John Glenn\'s orbit\nTim Berners-Lee,1955,the World Wide Web', caption: 'Each line splits into three parts; the year is parsed so that it can be divided. Change 1955 to 19x5 in the input and run: NumberFormatException: For input string: "19x5".' },
        `<p>Back to the start of the lesson. Characters beyond the first 65,536 of Unicode, which include every emoji, take two <code>char</code>s each, and <code>length()</code> counts <code>char</code>s, not the characters you see. Most of the time it does not matter. It matters when you cut text with <code>substring</code> or count its letters, and it is one reason a text box sometimes says you have more characters left than you can see.</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        String plain = "cat";
        String fancy = "cat😀";
        System.out.println(plain.length() + " " + fancy.length());
        System.out.println((int) fancy.charAt(3) + " " + (int) fancy.charAt(4));
        System.out.println("é".length() + " " + "日本語".length());
    }
}`, caption: 'The emoji is stored as two chars, 55357 and 56832, which together make its Unicode number, 128512. Accented letters and Chinese characters are inside the first 65,536 and take one char each.' },
        `<details class="reveal"><summary>Puzzle: what does <code>"Java".substring(1, 3) + "Java".charAt(0) + 1</code> give?</summary><p><code>"avJ1"</code>. The substring is <code>"av"</code>; joining a <code>char</code> to a <code>String</code> adds the character, <code>J</code>; and the 1 is joined as text, because the left side is already a <code>String</code>. Had it been <code>'J' + 1</code> on its own, the answer would be the number 75.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Calling <code>s.toUpperCase()</code> without storing the result. Comparing with <code>==</code> instead of <code>equals</code>. Writing <code>s.length</code> without parentheses, or <code>s[i]</code> instead of <code>s.charAt(i)</code>. Expecting <code>substring(b, e)</code> to include index <code>e</code>. Using the result of <code>indexOf</code> without checking for <code>-1</code>. Writing <code>"a"</code> where a <code>char</code> is needed, or <code>'ab'</code>, which is not a character at all. Adding to a <code>char</code> and forgetting that the answer is an <code>int</code>. Splitting on <code>" "</code> when the words are separated by several spaces: use <code>split(" +")</code>, "one or more spaces".</p>` },
        {
          ex: {
            id: 'jv-6-1', title: 'Initials',
            prompt: `<p>Read one line holding a person's full name and print their initials as capital letters, each followed by a full stop, with no spaces:</p><pre class="code">G.B.M.H.</pre><p>(That is the output for <code>grace brewster murray hopper</code>.) The words may be separated by more than one space, and there may be spaces before the first word and after the last.</p>`,
            starter: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        String line = in.nextLine();\n        // your code here\n    }\n}`,
            solution: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        String line = in.nextLine().trim();\n        String[] words = line.split(" +");\n        StringBuilder initials = new StringBuilder();\n        for (String w : words) {\n            initials.append(Character.toUpperCase(w.charAt(0)));\n            initials.append('.');\n        }\n        System.out.println(initials);\n    }\n}`,
            sampleStdin: 'grace brewster murray hopper',
            hints: ['trim() removes the spaces at both ends; then split(" +") cuts at every run of one or more spaces, giving the words.', 'For each word w, the initial is w.charAt(0). Character.toUpperCase turns it into a capital. Append it and a \'.\' to a StringBuilder, and print that at the end.', 'Another way, with no split: walk along the line and take every letter that comes right after a space, or at index 0.'],
            tests: [{ stdin: 'grace brewster murray hopper', expect: 'G.B.M.H.' }, { stdin: 'Ada Lovelace', expect: 'A.L.' }, { stdin: '  alan   mathison turing ', expect: 'A.M.T.' }, { stdin: 'cher', expect: 'C.' }, { stdin: 'katherine Coleman goble JOHNSON', expect: 'K.C.G.J.' }],
            failTip: 'Try the input with extra spaces: if your program prints a stray full stop, or stops with an exception, it is treating an empty piece as a word.'
          }
        },
        {
          ex: {
            id: 'jv-6-2', title: 'Palindromes',
            prompt: `<p>A palindrome reads the same forwards and backwards. Write a method</p><pre class="code">static boolean isPalindrome(String s)</pre><p>that returns <code>true</code> if <code>s</code> is a palindrome when only its letters and digits are considered and capitals are ignored. So <code>"racecar"</code>, <code>"Never odd or even"</code> and <code>"A man, a plan, a canal: Panama"</code> are palindromes, <code>"Hello"</code> is not, and the empty string is. Write only the method.</p>`,
            starter: `static boolean isPalindrome(String s) {\n    // keep only letters and digits, in lower case; then compare from both ends\n    return false;\n}`,
            solution: `static boolean isPalindrome(String s) {\n    StringBuilder clean = new StringBuilder();\n    for (int i = 0; i < s.length(); i++) {\n        char c = s.charAt(i);\n        if (Character.isLetterOrDigit(c)) {\n            clean.append(Character.toLowerCase(c));\n        }\n    }\n    int i = 0;\n    int j = clean.length() - 1;\n    while (i < j) {\n        if (clean.charAt(i) != clean.charAt(j)) {\n            return false;\n        }\n        i++;\n        j--;\n    }\n    return true;\n}`,
            hints: ['First make a cleaned copy: for each character c of s, if Character.isLetterOrDigit(c), append Character.toLowerCase(c) to a StringBuilder.', 'Then compare from both ends: i starts at 0, j at the last index; while i < j, if the characters differ return false, else move i right and j left. If the loop finishes, return true.', 'Shorter, if slower: String t = clean.toString(); return t.equals(new StringBuilder(t).reverse().toString());'],
            tests: [{ call: 'isPalindrome("racecar")', expect: 'true' }, { call: 'isPalindrome("Hello")', expect: 'false' }, { call: 'isPalindrome("A man, a plan, a canal: Panama")', expect: 'true' }, { call: 'isPalindrome("Never odd or even")', expect: 'true' }, { call: 'isPalindrome("")', expect: 'true' }, { call: 'isPalindrome("ab")', expect: 'false' }, { call: 'isPalindrome("12321")', expect: 'true' }, { call: 'isPalindrome("123 21x")', expect: 'false' }, { call: 'isPalindrome("Was it a car or a cat I saw?")', expect: 'true' }],
            failTip: 'Check that capitals are ignored (N and n are the same here) and that spaces and punctuation are skipped, not compared.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A <code>String</code> is a row of <code>char</code>s from index 0 to <code>length() - 1</code>. <code>charAt(i)</code> reads one; <code>substring(b, e)</code> copies indexes <code>b</code> up to but not including <code>e</code>.</li>
<li><code>indexOf</code> and <code>lastIndexOf</code> find text and return <code>-1</code> when it is absent; <code>contains</code>, <code>startsWith</code> and <code>endsWith</code> answer yes or no.</li>
<li>A <code>String</code> never changes: methods return new strings, so store the result. Compare with <code>equals</code>; order with <code>compareTo</code>, where the capitals A to Z come before the small letters a to z.</li>
<li>A <code>char</code> is a number: <code>c - 'A'</code> and <code>(char) ('A' + n)</code> move between letters and positions. Characters past the first 65,536 of Unicode, emoji among them, take two <code>char</code>s.</li>
<li>Build long text with a <code>StringBuilder</code>. <code>split</code> cuts a line into a <code>String[]</code>; <code>Integer.parseInt</code> turns text into a number.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'ArrayList', summary: 'A list that grows as you add to it: adding, reading and removing, numbers in a list, the traps of removing inside a loop, when to choose a list over an array, and how a list grows.',
      blocks: [
        `<p>At 8:01 on the morning of 26 June 1974, in a Marsh supermarket in Troy, Ohio, a cashier named Sharon Buchanan slid a ten-pack of Wrigley's Juicy Fruit chewing gum across a glass window in her counter. A laser underneath read the black and white stripes on the packet, and the till looked up the price for itself: 67 cents. It was the first time anything in a shop had been sold by scanning a Universal Product Code, the barcode that is now printed on nearly everything you can buy. The packet of gum is kept at the Smithsonian's National Museum of American History.</p>`,
        `<p>Think about the program in that till. It cannot know how long the receipt will be: one packet of gum, or a family's shopping for a fortnight. An array needs its length when it is made, and that length never changes. What the till needs is a list that starts empty and grows by one each time something is scanned. Java's library has one, called <code>ArrayList</code>, and it is one of the classes Java programmers use most.</p>
<h2>A list that grows</h2>
<p><code>ArrayList</code> lives in <code>java.util</code>, like <code>Scanner</code>, so it must be imported. The type of thing it holds goes in angle brackets: <code>ArrayList&lt;String&gt;</code> is a list of strings. <code>new ArrayList&lt;&gt;()</code> makes an empty one; the empty brackets, called the <em>diamond</em>, tell Java to take the type from the left-hand side. Then <code>add(x)</code> puts <code>x</code> on the end, <code>size()</code> says how many items there are, and <code>get(i)</code> reads the item at index <code>i</code>, counting from 0 as always.</p>`,
        { play: `import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<String> basket = new ArrayList<>();
        System.out.println(basket + " " + basket.size());
        basket.add("gum");
        basket.add("bread");
        basket.add("milk");
        System.out.println(basket + " " + basket.size());
        System.out.println(basket.get(0) + ", then " + basket.get(1));
        basket.set(1, "rolls");          // replace the item at index 1
        basket.add(0, "apples");         // insert at index 0; the rest move along
        System.out.println(basket);
        System.out.println(basket.contains("milk") + " " + basket.indexOf("milk") + " " + basket.indexOf("tea"));
        basket.remove(2);                // remove the item at index 2
        System.out.println(basket + " " + basket.size());
    }
}`, caption: 'A list prints itself in square brackets, no Arrays.toString needed. add(0, x) inserts at the front and moves every other item one place along; remove(i) closes the gap. indexOf returns -1 for something that is not there, like String’s indexOf.' },
        `<div class="stmt"><p><span class="kind">Rule (methods).</span> <code>add(x)</code> appends; <code>add(i, x)</code> inserts at index <code>i</code>; <code>get(i)</code> reads; <code>set(i, x)</code> replaces; <code>remove(i)</code> removes and closes the gap; <code>size()</code> counts; <code>contains(x)</code> and <code>indexOf(x)</code> search, comparing with <code>equals</code>; <code>clear()</code> empties the list.</p>
<p><span class="kind">Rule (indexes).</span> As with arrays, the items are at indexes 0 to <code>size() - 1</code>, and an index outside that range stops the program with an <code>IndexOutOfBoundsException</code>. Note the three different ways of asking for a length: <code>a.length</code> for an array, <code>s.length()</code> for a <code>String</code>, <code>list.size()</code> for a list.</p></div>`,
        { check: "<code>list</code> is empty. After <code>list.add(\"a\"); list.add(\"b\"); list.add(0, \"c\");</code> what is <code>list.get(1)</code>?", options: ["<code>\"a\"</code>", "<code>\"b\"</code>", "<code>\"c\"</code>"], answer: 0, why: "The list is [a, b], then c is inserted at the front: [c, a, b]. Index 1 is a." },
        `<h2>Numbers in a list</h2>
<p>An <code>ArrayList</code> can hold only objects, not the plain values <code>int</code>, <code>double</code>, <code>char</code> and <code>boolean</code>. For each of those Java has a class that wraps one value in an object: <code>Integer</code>, <code>Double</code>, <code>Character</code> and <code>Boolean</code>. So a list of whole numbers is an <code>ArrayList&lt;Integer&gt;</code>. You hardly notice the difference after that, because Java wraps and unwraps values for you as they go into the list and come out.</p>`,
        { play: `import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<int> numbers = new ArrayList<>();
        numbers.add(7);
        System.out.println(numbers);
    }
}`, expectError: true, caption: 'Main.java:5: error: unexpected type. The message goes on: required: reference, found: int. Change both int to Integer on line 5 and run again.' },
        `<p>Here is the till. It reads pairs of an item and a price until the input runs out, keeps them in two lists side by side, and prints a receipt. <code>printf</code> lines the columns up: <code>%-10s</code> prints text in a space 10 characters wide, against the left edge, and <code>%6.2f</code> prints a number with two decimals in a space 6 characters wide, against the right.</p>`,
        { play: `import java.util.ArrayList;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        ArrayList<String> items = new ArrayList<>();
        ArrayList<Double> prices = new ArrayList<>();
        while (in.hasNext()) {
            items.add(in.next());
            prices.add(in.nextDouble());         // the double is wrapped as a Double
        }
        double total = 0;
        for (int i = 0; i < items.size(); i++) {
            System.out.printf("%-10s %6.2f%n", items.get(i), prices.get(i));
            total += prices.get(i);              // and unwrapped again here
        }
        System.out.printf("%-10s %6.2f%n", items.size() + " items", total);
    }
}`, stdin: 'gum 0.67\nbread 2.49\nmilk 1.15\napples 3.20', caption: 'The program has no idea how many items are coming, and does not need one. Add a line to the input, say tea 4.10, and run again: the lists simply grow.' },
        `<h2>Removing, and two traps</h2>
<p>A list of <code>Integer</code>s has a trap built in. <code>remove</code> comes in two kinds: <code>remove(int index)</code> removes the item at that position, and <code>remove(Object x)</code> removes the first item equal to <code>x</code>. Given <code>list.remove(3)</code>, Java picks the first, because 3 is an <code>int</code>. To remove the <em>value</em> 3, wrap it: <code>list.remove(Integer.valueOf(3))</code>.</p>`,
        { play: `import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        ArrayList<Integer> scores = new ArrayList<>(List.of(10, 3, 7, 3));   // a list with four values to start
        scores.remove(3);                        // removes the item at index 3
        System.out.println(scores);
        scores.remove(Integer.valueOf(3));       // removes the first item equal to 3
        System.out.println(scores);
        int first = scores.get(0);               // unwrapped to a plain int
        System.out.println(first * 2);
    }
}`, caption: 'List.of(10, 3, 7, 3) is a quick way to write a list of values; new ArrayList<>(...) makes a list you can change from it. The first remove took away the last 3 because it was at index 3; the second took away the value.' },
        `<p>The second trap is removing while you loop forwards. When an item is removed, every item after it moves one place to the left, so the item that was next is now at the index you just looked at, and the loop's <code>i++</code> steps straight past it. Going backwards avoids the problem, because the items that move are ones the loop has already seen. (A for-each loop is no good either: change the list inside one and Java stops the program with a <code>ConcurrentModificationException</code>.)</p>`,
        { play: `import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        ArrayList<Integer> nums = new ArrayList<>(List.of(1, 3, 4, 5, 8, 9));
        for (int i = 0; i < nums.size(); i++) {          // wrong: forwards
            if (nums.get(i) % 2 == 1) {
                nums.remove(i);
            }
        }
        System.out.println("forwards:  " + nums);

        nums = new ArrayList<>(List.of(1, 3, 4, 5, 8, 9));
        for (int i = nums.size() - 1; i >= 0; i--) {     // right: backwards
            if (nums.get(i) % 2 == 1) {
                nums.remove(i);
            }
        }
        System.out.println("backwards: " + nums);
    }
}`, caption: 'The aim is to remove the odd numbers. Going forwards, removing the 1 moves the 3 into index 0, the loop moves on to index 1, and the 3 is never looked at. Going backwards removes all four.' },
        `<div class="stmt"><p><span class="kind">Rule (removing in a loop).</span> To remove items from a list as you go, loop backwards: <code>for (int i = list.size() - 1; i &gt;= 0; i--)</code>. Never add to or remove from a list inside a for-each loop over that same list.</p>
<p><span class="kind">Trap (Integer lists).</span> <code>list.remove(3)</code> removes the item at index 3. To remove the value 3, write <code>list.remove(Integer.valueOf(3))</code>.</p></div>`,
        { check: "<code>nums</code> is the list <code>[5, 6, 7]</code> of <code>Integer</code>s. What is it after <code>nums.remove(1);</code>?", options: ["<code>[6, 7]</code>", "<code>[5, 7]</code>", "<code>[5, 6, 7]</code>: there is no 1 to remove"], answer: 1, why: "1 is an int, so this is remove by index: the item at index 1, which is 6, goes. To remove a value, wrap it: nums.remove(Integer.valueOf(5))." },
        `<h2>Arrays or lists?</h2>
<p>Both hold a row of values reached by index, and you will use both. The differences are worth having in one place.</p>
<div class="tbl-wrap"><table>
<tr><th></th><th>array</th><th><code>ArrayList</code></th></tr>
<tr><td>make</td><td><code>new int[n]</code> or <code>{1, 2, 3}</code></td><td><code>new ArrayList&lt;&gt;()</code></td></tr>
<tr><td>length</td><td>fixed when made: <code>a.length</code></td><td>grows and shrinks: <code>list.size()</code></td></tr>
<tr><td>read and write</td><td><code>a[i]</code>, <code>a[i] = x</code></td><td><code>list.get(i)</code>, <code>list.set(i, x)</code></td></tr>
<tr><td>add or remove</td><td>not possible: make a new array</td><td><code>add</code>, <code>add(i, x)</code>, <code>remove</code></td></tr>
<tr><td>holds</td><td>any type, <code>int</code> included</td><td>objects only: <code>Integer</code>, not <code>int</code></td></tr>
<tr><td>print</td><td><code>Arrays.toString(a)</code></td><td><code>println(list)</code></td></tr>
</table></div>
<p>Use an <code>ArrayList</code> when you do not know in advance how many items there will be, or when items come and go. Use an array when the size is fixed by the problem: twelve months, a 9 by 9 sudoku, the 26 counters for the letters of the alphabet.</p>`,
        { check: "Which of these needs an <code>ArrayList</code> rather than an array?", options: ["The rainfall for each of the 12 months of a year", "The names of everyone who signs up for a club, until the deadline", "A 9 by 9 sudoku grid"], answer: 1, why: "Nobody knows how many people will sign up, so the list must grow. The months and the sudoku have sizes fixed by the problem, which suits an array." },
        `<h2>Help from the library</h2>
<p>The class <code>Collections</code> (with an s, also in <code>java.util</code>) does for lists what <code>Arrays</code> does for arrays. <code>Collections.sort(list)</code> sorts a list in place, using the same order as <code>compareTo</code>; <code>Collections.max</code> and <code>Collections.min</code> find the largest and smallest; <code>Collections.reverse</code> turns a list round; <code>Collections.frequency(list, x)</code> counts how many times <code>x</code> appears.</p>`,
        { play: `import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        ArrayList<Integer> rolls = new ArrayList<>(List.of(4, 6, 1, 6, 3, 6, 2));
        System.out.println("Highest " + Collections.max(rolls) + ", lowest " + Collections.min(rolls));
        System.out.println("Sixes: " + Collections.frequency(rolls, 6));
        Collections.sort(rolls);
        System.out.println(rolls);
        Collections.reverse(rolls);
        System.out.println(rolls);
        ArrayList<String> names = new ArrayList<>(List.of("Grace", "ada", "Alan", "katherine"));
        Collections.sort(names);
        System.out.println(names);
    }
}`, caption: 'Sorting a list of strings puts capitals first, exactly as Arrays.sort did in lesson 6. Sorting then reversing gives largest first.' },
        `<h2>How a list grows</h2>
<p>There is no magic inside an <code>ArrayList</code>: as its name says, it keeps its items in an ordinary array, usually with some spare slots at the end. <code>add</code> puts the new item in the next spare slot, which is quick. When there are no spare slots left, it makes a new array about one and a half times as big, copies every item across, and carries on in that one. The copying is slow, but it happens so rarely that adding to the end is fast on average. Adding or removing at the <em>front</em> is a different matter: every item has to move along by one, so on a long list <code>add(0, x)</code> and <code>remove(0)</code> are slow every time. The Data Structures and Algorithms course builds a growing array of its own and measures exactly how fast each of these operations is.</p>`,
        `<details class="reveal"><summary>Puzzle: what does this print? <code>ArrayList&lt;Integer&gt; a = new ArrayList&lt;&gt;(); a.add(5); a.add(0, 6); a.add(1, 7); a.remove(Integer.valueOf(5)); System.out.println(a);</code></summary><p><code>[6, 7]</code>. After <code>add(5)</code> the list is <code>[5]</code>; inserting 6 at the front gives <code>[6, 5]</code>; inserting 7 at index 1 gives <code>[6, 7, 5]</code>; removing the value 5 leaves <code>[6, 7]</code>. With <code>a.remove(5)</code> instead, the program would stop: there is no index 5.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Forgetting <code>import java.util.ArrayList;</code>. Writing <code>ArrayList&lt;int&gt;</code> instead of <code>ArrayList&lt;Integer&gt;</code>. Using <code>list[i]</code> or <code>list.length</code>, which belong to arrays; a list has <code>get(i)</code> and <code>size()</code>. Calling <code>remove(3)</code> on a list of <code>Integer</code>s to remove the value 3. Removing items while looping forwards, or inside a for-each loop. Calling <code>get</code> on an empty list, or with <code>size()</code> as the index. Expecting <code>set(i, x)</code> to insert: it replaces, and the index must already exist.</p>` },
        {
          ex: {
            id: 'jv-7-1', title: 'No repeats',
            prompt: `<p>Read words until the input runs out. Print each different word once, in the order in which it first appeared, separated by single spaces; then, on a second line, how many different words there were. Words are compared exactly, so <code>To</code> and <code>to</code> are different. For the input</p><pre class="code">the cat saw the other cat</pre><p>the output is</p><pre class="code">the cat saw other\n4</pre>`,
            starter: `import java.util.ArrayList;\nimport java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        ArrayList<String> seen = new ArrayList<>();\n        while (in.hasNext()) {\n            String word = in.next();\n            // keep the word only if it is new\n        }\n        // print the words, then how many\n    }\n}`,
            solution: `import java.util.ArrayList;\nimport java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        ArrayList<String> seen = new ArrayList<>();\n        while (in.hasNext()) {\n            String word = in.next();\n            if (!seen.contains(word)) {\n                seen.add(word);\n            }\n        }\n        StringBuilder line = new StringBuilder();\n        for (int i = 0; i < seen.size(); i++) {\n            if (i > 0) {\n                line.append(" ");\n            }\n            line.append(seen.get(i));\n        }\n        System.out.println(line);\n        System.out.println(seen.size());\n    }\n}`,
            sampleStdin: 'the cat saw the other cat',
            hints: ['Inside the loop: if (!seen.contains(word)) seen.add(word); The list keeps the words in the order they were first added.', 'Printing the list with println gives [the, cat, saw, other], with brackets and commas, which is not the form asked for. Build the line with a StringBuilder, putting a space before every word except the first. (String.join(" ", seen) does the same in one call.)'],
            tests: [{ stdin: 'the cat saw the other cat', expect: 'the cat saw other\n4' }, { stdin: 'a a a', expect: 'a\n1' }, { stdin: 'one two three', expect: 'one two three\n3' }, { stdin: 'To be or not to be', expect: 'To be or not to\n5' }, { stdin: 'red green\nblue red\n\ngreen', expect: 'red green blue\n3' }],
            failTip: 'The words may come on several lines: in.next() skips line breaks as well as spaces, so read with next(), not nextLine().'
          }
        },
        {
          ex: {
            id: 'jv-7-2', title: 'Remove the short words',
            prompt: `<p>Write a method</p><pre class="code">static int removeShort(ArrayList&lt;String&gt; words, int min)</pre><p>that removes from the list every word with fewer than <code>min</code> characters, keeping the others in their order, and returns how many words it removed. The method changes the caller's list: no new list. For the list <code>[I, am, so, happy]</code> and <code>min</code> 3, the list becomes <code>[happy]</code> and the method returns 3. Write only the method; <code>java.util</code> is imported for you.</p>`,
            prelude: 'import java.util.*;',
            starter: `static int removeShort(ArrayList<String> words, int min) {\n    int removed = 0;\n    // remove the words shorter than min, counting them\n    return removed;\n}`,
            solution: `static int removeShort(ArrayList<String> words, int min) {\n    int removed = 0;\n    for (int i = words.size() - 1; i >= 0; i--) {\n        if (words.get(i).length() < min) {\n            words.remove(i);\n            removed++;\n        }\n    }\n    return removed;\n}`,
            hints: ['Loop backwards, from words.size() - 1 down to 0, so that removing a word does not make the loop skip the next one.', 'if (words.get(i).length() < min) { words.remove(i); removed++; }'],
            tests: [{ name: 'a sentence', setup: '        ArrayList<String> w = new ArrayList<>(List.of("a", "an", "the", "cat", "is", "on", "mat"));', call: 'removeShort(w, 3) + " " + w', expect: '4 [the, cat, mat]' }, { name: 'short words side by side', setup: '        ArrayList<String> w = new ArrayList<>(List.of("I", "am", "so", "happy"));', call: 'removeShort(w, 3) + " " + w', expect: '3 [happy]' }, { name: 'nothing to remove', setup: '        ArrayList<String> w = new ArrayList<>(List.of("hello", "world"));', call: 'removeShort(w, 2) + " " + w', expect: '0 [hello, world]' }, { name: 'everything removed', setup: '        ArrayList<String> w = new ArrayList<>(List.of("ab", "c", "de"));', call: 'removeShort(w, 5) + " " + w', expect: '3 []' }, { name: 'an empty list', setup: '        ArrayList<String> w = new ArrayList<>();', call: 'removeShort(w, 3) + " " + w', expect: '0 []' }, { name: 'the length exactly min stays', setup: '        ArrayList<String> w = new ArrayList<>(List.of("cat", "ox", "bird"));', call: 'removeShort(w, 3) + " " + w', expect: '1 [cat, bird]' }],
            failTip: 'If a short word survives when it comes straight after another short word, your loop runs forwards and skips it. Run it backwards.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li><code>ArrayList&lt;T&gt;</code> (import <code>java.util.ArrayList</code>) is a list that grows: <code>add</code>, <code>get</code>, <code>set</code>, <code>remove</code>, <code>size()</code>, <code>contains</code>, <code>indexOf</code>. It prints itself in square brackets.</li>
<li>Lists hold objects only: <code>Integer</code>, <code>Double</code>, <code>Character</code>, <code>Boolean</code> wrap the plain types, and Java wraps and unwraps for you.</li>
<li><code>remove(i)</code> removes by index, <code>remove(Integer.valueOf(x))</code> by value. To remove inside a loop, loop backwards; never change a list inside a for-each loop over it.</li>
<li>Use an array when the size is fixed by the problem, a list when it is not. <code>Collections</code> sorts, reverses, and finds the largest, smallest and how many.</li>
<li>Inside, a list is an array with spare room that is copied into a bigger one when full: adding at the end is fast, at the front slow.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Classes and objects', summary: 'Making your own types: fields, constructors and methods that belong to an object, private fields that protect a class’s rules, toString, references and null, static, and objects that work together.',
      blocks: [
        `<p>In the early 1960s, at the Norwegian Computing Center in Oslo, Kristen Nygaard was writing simulations: programs that imitate some part of the real world to find out how it will behave before anyone builds it or changes it. The things such programs imitate are full of separate parts acting at the same time: customers arriving at counters, ships moving through a port, jobs passing from machine to machine in a factory. Nygaard found that the languages of the day made it hard to say what he meant, and with Ole-Johan Dahl, a brilliant programmer, he set out to design a better one. Their second language, Simula 67, gave the world a new way to organise programs. A program could describe a <em>class</em> of things, say a customer, once: what every customer knows and what every customer can do. Then it could make as many customers, <em>objects</em> of that class, as the simulation needed, each with its own information.</p>
<p>The idea spread. Alan Kay built the language Smalltalk around it in the 1970s. Bjarne Stroustrup used Simula for his doctoral research at Cambridge, and at Bell Labs added classes to C, which became C++. Java took its classes from C++. In 2001 Dahl and Nygaard received the Turing Award, the highest honour in computing, for ideas fundamental to object-oriented programming. Every Java program you have written was a class; this lesson is about writing classes that describe things, and making objects from them.</p>
<h2>A class is a new type</h2>
<p>You have used objects since lesson 1: every <code>String</code> is an object of the class <code>String</code>, and <code>Scanner</code> and <code>ArrayList</code> are classes too. A class of your own starts with its <em>fields</em>: the variables that every object of the class has a copy of. Here is a stack of items in a Minecraft inventory, which has an item and a count. <code>new ItemStack()</code> makes a new object, and a dot reaches its fields.</p>`,
        { play: `class ItemStack {
    String item;
    int count;
}

public class Main {
    public static void main(String[] args) {
        ItemStack a = new ItemStack();
        a.item = "dirt";
        a.count = 64;
        ItemStack b = new ItemStack();
        b.item = "egg";
        b.count = 5;
        System.out.println(a.item + ": " + a.count);
        System.out.println(b.item + ": " + b.count);
        ItemStack c = new ItemStack();
        System.out.println(c.item + ": " + c.count);    // fields start as null and 0
    }
}`, caption: 'Two classes in one file: only one may be public, and it is the one with main. Each object has its own item and count; changing a.count leaves b.count alone.' },
        `<div class="stmt"><p><span class="kind">Rule (class and object).</span> A class describes a kind of thing: the fields each object has and the methods each object can carry out. <code>new ClassName(...)</code> makes one object of the class. Each object has its own copy of every field, reached as <code>object.field</code>. Fields start with the same zeros as array slots: 0, 0.0, <code>false</code> and <code>null</code>.</p></div>
<h2>Constructors and methods</h2>
<p>Setting every field by hand after <code>new</code> is tedious, and forgetting one is easy. A <em>constructor</em> does it at once. It looks like a method with the same name as the class and no return type, and it runs every time an object is made; the values in the parentheses after <code>new</code> become its parameters. Inside it, <code>this</code> means "the object being made", so <code>this.count = count;</code> copies the parameter <code>count</code> into the field <code>count</code>.</p>
<p>Methods can belong to an object too. Lesson 4 said every method there was <code>static</code> and promised the other kind; here it is. A method declared <em>without</em> <code>static</code> is called on an object, <code>dirt.add(20)</code>, and inside it the fields are that object's fields. A stack can hold up to some maximum (64 for dirt, 16 for eggs), so <code>add</code> puts in what fits and returns how many were left over.</p>`,
        { play: `class ItemStack {
    String item;
    int count;
    int max;

    ItemStack(String item, int count, int max) {
        this.item = item;
        this.count = count;
        this.max = max;
    }

    int add(int n) {                     // adds what fits; returns what does not
        int room = max - count;
        int taken = Math.min(n, room);
        count += taken;
        return n - taken;
    }

    boolean isFull() {
        return count == max;
    }
}

public class Main {
    public static void main(String[] args) {
        ItemStack dirt = new ItemStack("dirt", 50, 64);
        ItemStack eggs = new ItemStack("egg", 10, 16);
        int left = dirt.add(20);
        System.out.println(dirt.item + " " + dirt.count + ", " + left + " left over, full: " + dirt.isFull());
        left = eggs.add(3);
        System.out.println(eggs.item + " " + eggs.count + ", " + left + " left over, full: " + eggs.isFull());
    }
}`, caption: 'Inside add, count and max mean the count and max of whichever stack add was called on: dirt’s for dirt.add(20), eggs’ for eggs.add(3). Try new ItemStack() with no arguments: once a class has a constructor, Java no longer supplies the empty one.' },
        `<div class="stmt"><p><span class="kind">Rule (constructor).</span> A constructor has the class's name and no return type, not even <code>void</code>. It runs when <code>new</code> makes the object. <code>this.name</code> is the object's field, <code>name</code> alone the parameter. A class can have several constructors with different parameters, just as methods can be overloaded.</p>
<p><span class="kind">Rule (instance methods).</span> A method without <code>static</code> belongs to each object and is called on one: <code>object.method(...)</code>. It can use the object's fields by name. A <code>static</code> method belongs to the class as a whole, has no object, and cannot use fields that belong to objects.</p></div>`,
        { check: "<code>a</code> and <code>b</code> are two different <code>ItemStack</code> objects. Which count does <code>a.add(5)</code> change?", options: ["Only <code>a</code>’s", "Both, because they are the same class", "Neither: methods cannot change fields"], answer: 0, why: "Each object has its own fields. Inside add, count means the count of the object the method was called on: a." },
        `<h2>Private fields</h2>
<p>As the class stands, nothing stops a careless line elsewhere from writing <code>dirt.count = 500;</code>, a stack no game would allow. The cure is to make the fields <code>private</code>. A private field can be used only by the methods of its own class; everyone else must go through the methods the class chooses to offer, such as <code>add</code>, and a method can refuse to break the rules. Reading a private field is offered by a small method called a <em>getter</em>, by convention named <code>getCount()</code>.</p>`,
        { play: `class ItemStack {
    private String item;
    private int count;

    ItemStack(String item, int count) {
        this.item = item;
        this.count = count;
    }

    int getCount() {
        return count;
    }
}

public class Main {
    public static void main(String[] args) {
        ItemStack dirt = new ItemStack("dirt", 10);
        System.out.println(dirt.getCount());
        dirt.count = 500;
    }
}`, expectError: true, caption: 'Main.java:19: error: count has private access in ItemStack. The compiler refuses, so the rule is enforced before the program ever runs. Delete the last line and it compiles; dirt.getCount() is allowed, because getCount is not private.' },
        `<div class="stmt"><p><span class="kind">Rule (private).</span> Make fields <code>private</code> and offer methods for what other code may do. Then the class alone decides what its fields may hold, and a rule like "a stack holds 0 to 64 items" has to be checked in only one place. Hiding the fields behind methods in this way is called <em>encapsulation</em>.</p></div>
<h2>Printing an object</h2>
<p><code>System.out.println(dirt)</code> prints something like <code>ItemStack@4e25154f</code>: the class name and a number, as with arrays. To print something useful, give the class a method <code>public String toString()</code> that returns the text you want. <code>println</code> calls it, and so does <code>+</code> whenever an object is joined to a <code>String</code>; this is how <code>ArrayList</code> prints itself so nicely. Here is the stack class with private fields, a getter, and a <code>toString</code>. Its constructor also refuses impossible stacks by keeping the count within the limits.</p>`,
        { play: `class ItemStack {
    private String item;
    private int count;
    private int max;

    ItemStack(String item, int count, int max) {
        this.item = item;
        this.max = max;
        this.count = Math.max(0, Math.min(count, max));   // keep 0 <= count <= max
    }

    int add(int n) {
        int taken = Math.min(n, max - count);
        count += taken;
        return n - taken;
    }

    String getItem() {
        return item;
    }

    int getCount() {
        return count;
    }

    public String toString() {
        return item + " x" + count;
    }
}

public class Main {
    public static void main(String[] args) {
        ItemStack sand = new ItemStack("sand", 70, 64);    // too many: kept to 64
        ItemStack eggs = new ItemStack("egg", 3, 16);
        System.out.println(sand);
        System.out.println("Carrying " + eggs + " and " + sand);
        eggs.add(20);
        System.out.println(eggs + ", still " + eggs.getItem());
    }
}`, caption: 'The constructor will not make a stack of 70, and add will not overfill one: every way into the fields goes through code that keeps the rule. toString must be spelled exactly so, with public in front; misspell it tostring and println goes back to printing ItemStack@ and a number.' },
        `<h2>Variables hold references</h2>
<p>Like an array variable, an object variable holds a reference to the object, not the object itself. <code>ItemStack b = a;</code> makes <code>b</code> refer to the same object as <code>a</code>, and <code>a == b</code> asks whether two variables refer to the same object, not whether two objects hold the same values. Passing an object to a method passes the reference, so the method can call the object's methods and the caller sees what changed. A variable that refers to no object holds <code>null</code>; calling a method on <code>null</code> stops the program with a <code>NullPointerException</code>, Java's most common error.</p>`,
        { play: `class Counter {
    private int value;

    void increase() {
        value++;
    }

    int get() {
        return value;
    }
}

public class Main {
    static void increaseTwice(Counter c) {
        c.increase();
        c.increase();
    }

    public static void main(String[] args) {
        Counter a = new Counter();
        Counter b = a;                   // the same object, a second name
        b.increase();
        increaseTwice(a);                // the method works on the caller's object
        System.out.println(a.get() + " " + b.get() + " " + (a == b));
        Counter c = new Counter();
        System.out.println(c.get() + " " + (a == c));
        Counter nobody = null;
        System.out.println(nobody.get());
    }
}`, expectError: true, caption: 'One object, three increases, whether made through a, b or the method. c is a different object with its own value. The last line stops the program with a NullPointerException: there is no object to ask.' },
        { check: "<code>Counter a = new Counter(); Counter b = a; b.increase();</code> What is <code>a.get()</code>?", options: ["0", "1", "A compile error"], answer: 1, why: "b = a copies the reference, so a and b are one object. Increasing it through b is seen through a. To have two counters, call new twice." },
        `<h2>static: belonging to the class</h2>
<p>Now the words in <code>public static void main</code> and the Scanner recipe from lesson 1 can be read in full. A field or method marked <code>static</code> belongs to the class itself, not to any object: there is one copy, shared by all. <code>Math.sqrt</code> is static, so you call it on the class, <code>Math</code>, with no object in sight; <code>s.length()</code> is not, so you call it on a particular <code>String</code>. <code>main</code> is static because it must run before any object exists.</p>
<p>And <code>Scanner in = new Scanner(System.in);</code> is now an ordinary line. <code>new Scanner(...)</code> makes a <code>Scanner</code> object; its constructor is given <code>System.in</code>, the keyboard, to say where to read from; and the variable <code>in</code> refers to it. <code>in.nextInt()</code> calls an instance method on that object, which reads the next number from its own input.</p>`,
        { check: "Which of these calls a <code>static</code> method?", options: ["<code>name.toUpperCase()</code>", "<code>Math.max(3, 4)</code>", "<code>in.nextInt()</code>"], answer: 1, why: "Math.max is called on the class Math, with no object: it is static. toUpperCase and nextInt are called on an object, a String and a Scanner." },
        `<h2>Objects working together</h2>
<p>Real programs are many objects, each of a class with one job, holding references to each other. An inventory is a list of stacks: it uses an <code>ArrayList&lt;ItemStack&gt;</code> to hold them, and asks each stack to take what it can. Lesson 4 worked out how many slots a pile of items needs; this time the stacks fill themselves. A static field counts how many stacks have been made in all, one count shared by every stack.</p>`,
        { play: `import java.util.ArrayList;

class ItemStack {
    static int made = 0;                 // one count for the whole class

    private String item;
    private int count;
    private int max;

    ItemStack(String item, int max) {
        this.item = item;
        this.max = max;
        made++;
    }

    int add(int n) {
        int taken = Math.min(n, max - count);
        count += taken;
        return n - taken;
    }

    String getItem() {
        return item;
    }

    public String toString() {
        return item + " x" + count;
    }
}

class Inventory {
    private ArrayList<ItemStack> slots = new ArrayList<>();
    private int size;

    Inventory(int size) {
        this.size = size;
    }

    int add(String item, int n, int max) {          // returns what did not fit
        for (ItemStack s : slots) {                 // first top up stacks of the same item
            if (s.getItem().equals(item)) {
                n = s.add(n);
            }
        }
        while (n > 0 && slots.size() < size) {      // then start new stacks
            ItemStack s = new ItemStack(item, max);
            slots.add(s);
            n = s.add(n);
        }
        return n;
    }

    public String toString() {
        return slots.size() + "/" + size + " slots: " + slots;
    }
}

public class Main {
    public static void main(String[] args) {
        Inventory bag = new Inventory(6);
        bag.add("dirt", 100, 64);
        bag.add("egg", 20, 16);
        bag.add("dirt", 40, 64);
        System.out.println(bag);
        int left = bag.add("sword", 3, 1);
        System.out.println(bag);
        System.out.println(left + " left on the ground; " + ItemStack.made + " stacks made");
    }
}`, caption: 'Inventory never touches a stack’s count; it asks each stack to add, and the stack keeps its own rules. The third add tops up the half-full dirt stack before starting a new one. ItemStack.made is reached through the class name, because it is static.' },
        `<details class="reveal"><summary>Puzzle: with the <code>Counter</code> class above, what does this print? <code>Counter a = new Counter(); Counter b = new Counter(); a.increase(); b = a; b.increase(); System.out.println(a.get() + " " + b.get());</code></summary><p><code>2 2</code>. After <code>b = a</code> both variables refer to the first counter, which is increased twice in all. The second counter, increased never, is no longer referred to by anything; Java's <em>garbage collector</em> notices and reuses its memory.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Giving a constructor a return type, <code>void ItemStack(...)</code>, which turns it into an ordinary method. Writing <code>count = count;</code> in a constructor instead of <code>this.count = count;</code>: the parameter is copied onto itself and the field stays 0. Marking a method <code>static</code> and then using a field in it: <em>non-static variable count cannot be referenced from a static context</em>. Declaring a variable of a class type and forgetting <code>new</code>, then calling a method on <code>null</code>. Comparing two objects with <code>==</code>. Spelling <code>toString</code> any other way, or leaving out <code>public</code> in front of it. Putting <code>public</code> on two classes in one file.</p>` },
        {
          ex: {
            id: 'jv-8-1', title: 'A bank account',
            classes: true,
            prompt: `<p>Write a class <code>BankAccount</code> with a private <code>String</code> owner and a private <code>int</code> balance (whole dollars), and:</p><ul><li>a constructor <code>BankAccount(String owner)</code>; a new account has a balance of 0;</li><li><code>void deposit(int amount)</code>, which adds to the balance, but does nothing if the amount is 0 or less;</li><li><code>boolean withdraw(int amount)</code>, which takes the amount out and returns <code>true</code>, or, if the amount is 0 or less or more than the balance, changes nothing and returns <code>false</code>;</li><li><code>int getBalance()</code>;</li><li><code>public String toString()</code>, returning the owner, a colon, a space and the balance: <code>Ada: 150</code>.</li></ul><p>Write only the class; the checker makes accounts and calls their methods.</p>`,
            starter: `class BankAccount {\n    private String owner;\n    private int balance;\n\n    BankAccount(String owner) {\n        // remember the owner\n    }\n\n    void deposit(int amount) {\n    }\n\n    boolean withdraw(int amount) {\n        return false;\n    }\n\n    int getBalance() {\n        return balance;\n    }\n\n    public String toString() {\n        return "";\n    }\n}`,
            solution: `class BankAccount {\n    private String owner;\n    private int balance;\n\n    BankAccount(String owner) {\n        this.owner = owner;\n    }\n\n    void deposit(int amount) {\n        if (amount > 0) {\n            balance += amount;\n        }\n    }\n\n    boolean withdraw(int amount) {\n        if (amount <= 0 || amount > balance) {\n            return false;\n        }\n        balance -= amount;\n        return true;\n    }\n\n    int getBalance() {\n        return balance;\n    }\n\n    public String toString() {\n        return owner + ": " + balance;\n    }\n}`,
            hints: ['The constructor needs one line: this.owner = owner; The balance starts at 0 on its own, because int fields start at 0.', 'withdraw checks first and acts second: if (amount <= 0 || amount > balance) return false; then balance -= amount; return true;', 'toString returns owner + ": " + balance.'],
            tests: [
              { name: 'deposits add up', main: '        BankAccount a = new BankAccount("Ada");\n        a.deposit(100);\n        a.deposit(50);\n        System.out.println(a.getBalance() + " " + a);', expect: '150 Ada: 150' },
              { name: 'withdraw within the balance', main: '        BankAccount a = new BankAccount("Ada");\n        a.deposit(100);\n        System.out.println(a.withdraw(30) + " " + a.getBalance());', expect: 'true 70' },
              { name: 'withdraw too much', main: '        BankAccount a = new BankAccount("Alan");\n        a.deposit(20);\n        System.out.println(a.withdraw(21) + " " + a.getBalance());\n        System.out.println(a.withdraw(20) + " " + a.getBalance());', expect: 'false 20\ntrue 0' },
              { name: 'amounts of 0 or less change nothing', main: '        BankAccount a = new BankAccount("Grace");\n        a.deposit(-5);\n        a.deposit(0);\n        a.deposit(10);\n        System.out.println(a.withdraw(-10) + " " + a.withdraw(0) + " " + a);', expect: 'false false Grace: 10' },
              { name: 'two accounts are separate', main: '        BankAccount a = new BankAccount("Ada");\n        BankAccount b = new BankAccount("Grace");\n        a.deposit(10);\n        b.deposit(99);\n        b.withdraw(9);\n        System.out.println(a + " " + b);', expect: 'Ada: 10 Grace: 90' }
            ],
            failTip: 'If two accounts share a balance, the field is static: remove the word static, so that each account has its own.'
          }
        },
        {
          ex: {
            id: 'jv-8-2', title: 'Fractions',
            classes: true,
            prompt: `<p>Write a class <code>Fraction</code> for exact fractions like 3/4, with private <code>int</code> fields for the numerator and denominator, and:</p><ul><li>a constructor <code>Fraction(int num, int den)</code> (<code>den</code> is never 0) that stores the fraction in lowest terms with a positive denominator: <code>new Fraction(6, 8)</code> is 3/4 and <code>new Fraction(1, -2)</code> is −1/2;</li><li><code>int getNumerator()</code> and <code>int getDenominator()</code>;</li><li><code>Fraction plus(Fraction other)</code> and <code>Fraction times(Fraction other)</code>, which return a new fraction and change neither of the two they are given;</li><li><code>public String toString()</code>, which gives <code>3/4</code>, or just <code>2</code> when the denominator is 1.</li></ul><p>To reduce, divide both parts by their greatest common divisor: your method from lesson 4 can live inside the class as a <code>private static</code> method.</p>`,
            starter: `class Fraction {\n    private int num;\n    private int den;\n\n    Fraction(int num, int den) {\n        // make den positive, then divide both by their gcd\n        this.num = num;\n        this.den = den;\n    }\n\n    int getNumerator() {\n        return num;\n    }\n\n    int getDenominator() {\n        return den;\n    }\n\n    Fraction plus(Fraction other) {\n        return this;\n    }\n\n    Fraction times(Fraction other) {\n        return this;\n    }\n\n    public String toString() {\n        return num + "/" + den;\n    }\n}`,
            solution: `class Fraction {\n    private int num;\n    private int den;\n\n    Fraction(int num, int den) {\n        if (den < 0) {\n            num = -num;\n            den = -den;\n        }\n        int g = gcd(Math.abs(num), den);\n        this.num = num / g;\n        this.den = den / g;\n    }\n\n    private static int gcd(int a, int b) {\n        while (b != 0) {\n            int r = a % b;\n            a = b;\n            b = r;\n        }\n        return a;\n    }\n\n    int getNumerator() {\n        return num;\n    }\n\n    int getDenominator() {\n        return den;\n    }\n\n    Fraction plus(Fraction other) {\n        return new Fraction(num * other.den + other.num * den, den * other.den);\n    }\n\n    Fraction times(Fraction other) {\n        return new Fraction(num * other.num, den * other.den);\n    }\n\n    public String toString() {\n        if (den == 1) {\n            return "" + num;\n        }\n        return num + "/" + den;\n    }\n}`,
            hints: ['In the constructor: if den is negative, flip the sign of both. Then int g = gcd(Math.abs(num), den); and store num / g and den / g. gcd(0, den) is den, so 0/7 becomes 0/1.', 'a/b + c/d = (a*d + c*b) / (b*d), and a/b * c/d = (a*c) / (b*d). Build the answer with new Fraction(...), and the constructor reduces it for you.', 'Inside the class you may read another Fraction’s private fields: other.num and other.den are allowed, because private means private to the class, not to the object.'],
            tests: [
              { name: 'lowest terms', main: '        System.out.println(new Fraction(6, 8) + " " + new Fraction(10, 5) + " " + new Fraction(0, 7) + " " + new Fraction(5, 7));', expect: '3/4 2 0 5/7' },
              { name: 'signs', main: '        System.out.println(new Fraction(1, -2) + " " + new Fraction(-3, -9) + " " + new Fraction(-4, 2));', expect: '-1/2 1/3 -2' },
              { name: 'getters', main: '        Fraction f = new Fraction(12, -16);\n        System.out.println(f.getNumerator() + " " + f.getDenominator());', expect: '-3 4' },
              { name: 'plus', main: '        System.out.println(new Fraction(1, 2).plus(new Fraction(1, 3)) + " " + new Fraction(1, 4).plus(new Fraction(1, 4)) + " " + new Fraction(1, 2).plus(new Fraction(1, 2)));', expect: '5/6 1/2 1' },
              { name: 'times', main: '        System.out.println(new Fraction(2, 3).times(new Fraction(3, 4)) + " " + new Fraction(-1, 2).times(new Fraction(4, 1)));', expect: '1/2 -2' },
              { name: 'the originals do not change', main: '        Fraction a = new Fraction(1, 2);\n        Fraction b = a.plus(new Fraction(1, 4));\n        Fraction c = a.times(b);\n        System.out.println(a + " " + b + " " + c);', expect: '1/2 3/4 3/8' }
            ],
            followup: 'Add a method boolean equals(Fraction other). Because every fraction is stored in lowest terms with a positive denominator, two fractions are equal exactly when their numerators and denominators are equal: storing values in one standard form makes comparing them easy.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A class describes a kind of object: its fields and methods. <code>new</code> makes an object, and a constructor, named like the class with no return type, sets its fields; <code>this.x</code> is the field, <code>x</code> the parameter.</li>
<li>Methods without <code>static</code> are called on an object and use that object's fields. <code>static</code> fields and methods belong to the class: one copy, no object needed, like <code>Math.sqrt</code> and <code>main</code>.</li>
<li>Make fields <code>private</code> and offer methods, so the class alone keeps its rules. <code>public String toString()</code> decides how an object prints.</li>
<li>Object variables hold references: assignment shares the object, <code>==</code> asks whether two references are the same object, and <code>null</code> refers to none (calling a method on it is a <code>NullPointerException</code>).</li>
<li>Programs are objects working together, each class doing one job: an <code>Inventory</code> holds <code>ItemStack</code>s and asks them to add, and each stack keeps its own rules.</li>
</ul></div>`
      ]
    }
  ]
});
