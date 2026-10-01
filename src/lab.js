/* Code Lab: a browser-only sandbox for Python, C++, Java and Scheme.
   Registered as window.LAB; app.js routes #/lab here and passes its internals. */
(function () {
  const A = () => window.__app.internal;   // shared helpers from app.js
  const KEY = 'shortcourses.lab.v1';
  const LANG_INFO = {
    python: { label: 'Python', ext: '.py', accent: 'python', first: 'main.py' },
    cpp: { label: 'C++', ext: '.cpp', accent: 'cpp', first: 'main.cpp' },
    java: { label: 'Java', ext: '.java', accent: 'java', first: 'Main.java' },
    scheme: { label: 'Scheme', ext: '.scm', accent: 'lisp', first: 'main.scm' }
  };
  // Language names arrive in links (?l=...) and from storage. A plain `LANG_INFO[x]` is truthy for "constructor" and "__proto__",
  // so always ask this instead.
  const hasLang = (l) => typeof l === 'string' && Object.prototype.hasOwnProperty.call(LANG_INFO, l);
  const PAIRS = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
  const OPEN = '([{', CLOSE = ')]}';

  /* ---------------- starter programs and templates ---------------- */
  const TEMPLATES = {
    python: [
      { name: 'Hello', code: 'print("Hello from the Code Lab!")\n' },
      { name: 'Input and arithmetic', code: 'name = input("What is your name? ")\nage = int(input("How old are you? "))\nprint(f"Hello, {name}. In ten years you will be {age + 10}.")\n' },
      { name: 'Loop and total', code: 'total = 0\nfor n in range(1, 11):\n    total = total + n\n    print(n, total)\nprint("Sum of 1 to 10 is", total)\n' },
      { name: 'Function', code: 'def area(width, height):\n    """Area of a rectangle."""\n    return width * height\n\nfor w in range(1, 4):\n    print(w, area(w, 5))\n' },
      { name: 'List and search', code: 'names = ["Ada", "Grace", "Linus", "Guido"]\nfor i, name in enumerate(names):\n    print(i, name)\n\nwanted = "Linus"\nif wanted in names:\n    print(wanted, "is at position", names.index(wanted))\n' },
      { name: 'Dictionary', code: 'counts = {}\nfor word in "the cat and the hat and the bat".split():\n    counts[word] = counts.get(word, 0) + 1\nfor word in sorted(counts):\n    print(word, counts[word])\n' },
      { name: 'Recursion', code: 'def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n - 1)\n\nfor n in range(0, 8):\n    print(n, factorial(n))\n' },
      { name: 'Random simulation', code: 'import random\n\nrolls = 1000\nsixes = 0\nfor _ in range(rolls):\n    if random.randint(1, 6) == 6:\n        sixes += 1\nprint(f"{sixes} sixes in {rolls} rolls: about {sixes / rolls:.3f}")\n' },
      { name: 'Turtle drawing', code: 'import turtle\n\nt = turtle.Turtle()\nt.speed(0)\nfor i in range(36):\n    t.forward(100)\n    t.right(170)\nturtle.done()\n' }
    ],
    cpp: [
      { name: 'Hello', code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello from the Code Lab!" << endl;\n    return 0;\n}\n' },
      { name: 'Input and arithmetic', code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cout << "Enter two whole numbers: ";\n    cin >> a >> b;\n    cout << a << " + " << b << " = " << a + b << endl;\n    cout << a << " / " << b << " = " << a / b << " remainder " << a % b << endl;\n    return 0;\n}\n' },
      { name: 'Loop and total', code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int total = 0;\n    for (int n = 1; n <= 10; n++) {\n        total = total + n;\n        cout << n << " " << total << endl;\n    }\n    return 0;\n}\n' },
      { name: 'Function', code: '#include <iostream>\nusing namespace std;\n\nint area(int width, int height) {\n    return width * height;\n}\n\nint main() {\n    for (int w = 1; w <= 3; w++) {\n        cout << w << " " << area(w, 5) << endl;\n    }\n    return 0;\n}\n' },
      { name: 'Array', code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int scores[5] = {70, 85, 92, 60, 78};\n    int best = scores[0];\n    for (int i = 1; i < 5; i++) {\n        if (scores[i] > best) best = scores[i];\n    }\n    cout << "Best score: " << best << endl;\n    return 0;\n}\n' },
      { name: 'Characters', code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    char word[] = "hello";\n    for (int i = 0; word[i] != 0; i++) {\n        char c = word[i];\n        if (c >= \'a\' && c <= \'z\') c = c - \'a\' + \'A\';\n        cout << c;\n    }\n    cout << endl;\n    return 0;\n}\n' },
      { name: 'Recursion', code: '#include <iostream>\nusing namespace std;\n\nlong factorial(int n) {\n    if (n == 0) return 1;\n    return n * factorial(n - 1);\n}\n\nint main() {\n    for (int n = 0; n < 8; n++) cout << n << " " << factorial(n) << endl;\n    return 0;\n}\n' }
    ],
    java: [
      { name: 'Hello', code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from the Code Lab!");\n    }\n}\n' },
      { name: 'Input and arithmetic', code: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        System.out.print("Enter two whole numbers: ");\n        int a = in.nextInt();\n        int b = in.nextInt();\n        System.out.println(a + " + " + b + " = " + (a + b));\n        System.out.println(a + " / " + b + " = " + a / b + " remainder " + a % b);\n    }\n}\n' },
      { name: 'Loop and total', code: 'public class Main {\n    public static void main(String[] args) {\n        int total = 0;\n        for (int n = 1; n <= 10; n++) {\n            total = total + n;\n            System.out.println(n + " " + total);\n        }\n    }\n}\n' },
      { name: 'Method', code: 'public class Main {\n    static int area(int width, int height) {\n        return width * height;\n    }\n\n    public static void main(String[] args) {\n        for (int w = 1; w <= 3; w++) {\n            System.out.println(w + " " + area(w, 5));\n        }\n    }\n}\n' },
      { name: 'Array', code: 'public class Main {\n    public static void main(String[] args) {\n        int[] scores = {70, 85, 92, 60, 78};\n        int best = scores[0];\n        for (int i = 1; i < scores.length; i++) {\n            if (scores[i] > best) best = scores[i];\n        }\n        System.out.println("Best score: " + best);\n    }\n}\n' },
      { name: 'ArrayList and HashMap', code: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        ArrayList<String> names = new ArrayList<>();\n        names.add("Ada");\n        names.add("Grace");\n        names.add("Linus");\n        Collections.sort(names);\n        System.out.println(names + " has " + names.size() + " names");\n\n        HashMap<String, Integer> counts = new HashMap<>();\n        for (String word : "the cat and the hat and the bat".split(" ")) {\n            counts.put(word, counts.getOrDefault(word, 0) + 1);\n        }\n        for (String word : new TreeMap<>(counts).keySet()) {\n            System.out.println(word + " " + counts.get(word));\n        }\n    }\n}\n' },
      { name: 'Class', code: 'class Counter {\n    private int count = 0;\n\n    void click() {\n        count++;\n    }\n\n    int value() {\n        return count;\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Counter c = new Counter();\n        for (int i = 0; i < 5; i++) c.click();\n        System.out.println("clicks: " + c.value());\n    }\n}\n' },
      { name: 'Recursion', code: 'public class Main {\n    static long factorial(int n) {\n        if (n == 0) return 1;\n        return n * factorial(n - 1);\n    }\n\n    public static void main(String[] args) {\n        for (int n = 0; n < 8; n++) System.out.println(n + " " + factorial(n));\n    }\n}\n' },
      { name: 'Random simulation', code: 'import java.util.Random;\n\npublic class Main {\n    public static void main(String[] args) {\n        Random dice = new Random();\n        int rolls = 1000;\n        int sixes = 0;\n        for (int i = 0; i < rolls; i++) {\n            if (dice.nextInt(6) + 1 == 6) sixes++;\n        }\n        System.out.printf("%d sixes in %d rolls: about %.3f%n", sixes, rolls, (double) sixes / rolls);\n    }\n}\n' }
    ],
    scheme: [
      { name: 'Hello', code: '(display "Hello from the Code Lab!")\n(newline)\n' },
      { name: 'Define and call', code: '(define (square x) (* x x))\n(define (sum-of-squares a b)\n  (+ (square a) (square b)))\n\n(sum-of-squares 3 4)\n' },
      { name: 'Recursion', code: '(define (factorial n)\n  (if (= n 0)\n      1\n      (* n (factorial (- n 1)))))\n\n(factorial 10)\n' },
      { name: 'Iteration', code: '(define (fact-iter n)\n  (define (loop product counter)\n    (if (> counter n)\n        product\n        (loop (* product counter) (+ counter 1))))\n  (loop 1 1))\n\n(fact-iter 10)\n' },
      { name: 'Lists', code: '(define nums (list 1 2 3 4 5))\n(car nums)\n(cdr nums)\n(map (lambda (x) (* x x)) nums)\n(filter even? nums)\n(reduce + 0 nums)\n' },
      { name: 'Recursion on lists', code: '(define (my-length items)\n  (if (null? items)\n      0\n      (+ 1 (my-length (cdr items)))))\n\n(my-length (list "a" "b" "c"))\n' },
      { name: 'Quotation', code: "(define expr '(+ 1 (* 2 3)))\n(car expr)\n(cadr expr)\n(caddr expr)\n(eq? (car expr) '+)\n" }
    ]
  };

  /* ---------------- quick reference ---------------- */
  const REFERENCE = {
    python: `<h3>Python quick reference</h3>
<h4>Output and input</h4>
<pre><code>print("text", value)      # spaces between pieces
print(f"{x} and {y + 1}")   # f-string
s = input("Prompt: ")       # always a str
n = int(input("Number: "))</code></pre>
<h4>Numbers</h4>
<pre><code>+ - *      7 / 2 = 3.5     7 // 2 = 3
7 % 2 = 1  (remainder)      2 ** 10 = 1024
abs(x)  round(x, 2)  min(a, b)  max(a, b)</code></pre>
<h4>Decisions and loops</h4>
<pre><code>if x > 5 and y != 0:
    ...
elif x == 5:
    ...
else:
    ...
for i in range(10):      # 0 .. 9
for item in some_list:
while condition:
    ...
    break / continue</code></pre>
<h4>Strings</h4>
<pre><code>len(s)  s[0]  s[-1]  s[1:4]  s.upper()  s.lower()
s.strip()  s.split()  ", ".join(list)  s.find("x")
s.replace("a", "b")  s.isdigit()  "x" in s</code></pre>
<h4>Lists</h4>
<pre><code>xs = [3, 1, 2]     xs.append(4)   xs.pop()
xs[0]  xs[-1]  xs[1:]  len(xs)  sorted(xs)  xs.sort()
xs.index(2)  2 in xs  xs.count(2)  xs.reverse()
for i, x in enumerate(xs):</code></pre>
<h4>Dictionaries and sets</h4>
<pre><code>d = {"a": 1}   d["b"] = 2   d.get("z", 0)
for key in d:   for key, value in d.items():
s = set()  s.add(x)  x in s</code></pre>
<h4>Functions</h4>
<pre><code>def name(a, b=0):
    """What it does."""
    return a + b</code></pre>
<h4>Errors</h4>
<pre><code>try:
    n = int(s)
except ValueError:
    print("not a number")
assert x > 0, "x must be positive"</code></pre>
<h4>Modules available here</h4>
<pre><code>import random   random.randint(1, 6)  random.choice(xs)
                random.random()  random.shuffle(xs)
import math     math.sqrt(x)  math.pi  math.floor(x)
import turtle   t = turtle.Turtle()  t.forward(100)
                t.right(90)  t.penup()  t.pendown()  t.goto(x, y)
                t.color("red")  t.speed(0)  turtle.done()</code></pre>
<p class="ref-note">This Python runs in your browser (Skulpt). Most of Python 3 works; there are no third-party packages, and a program is stopped after about 6 seconds.</p>`,
    cpp: `<h3>C++ quick reference</h3>
<h4>Program shape</h4>
<pre><code>#include &lt;iostream&gt;
using namespace std;

int main() {
    // statements end with ;
    return 0;
}</code></pre>
<h4>Output and input</h4>
<pre><code>cout &lt;&lt; "x = " &lt;&lt; x &lt;&lt; endl;
cin &gt;&gt; n;            // reads a number or a word
cin &gt;&gt; a &gt;&gt; b;       // two values</code></pre>
<h4>Types and numbers</h4>
<pre><code>int n = 7;      double d = 3.5;    char c = 'a';
bool ok = true; long big = 1000000000;
7 / 2 = 3   (integer division)   7.0 / 2 = 3.5
7 % 2 = 1   n++   n += 5</code></pre>
<h4>Decisions and loops</h4>
<pre><code>if (x &gt; 5 &amp;&amp; y != 0) { ... } else if (x == 5) { ... } else { ... }
for (int i = 0; i &lt; 10; i++) { ... }
while (condition) { ... break; continue; }
do { ... } while (condition);</code></pre>
<h4>Functions</h4>
<pre><code>int add(int a, int b) {
    return a + b;
}
void greet() { cout &lt;&lt; "hi" &lt;&lt; endl; }   // no return value</code></pre>
<h4>Arrays and characters</h4>
<pre><code>int xs[5] = {1, 2, 3, 4, 5};     xs[0] .. xs[4]
char word[] = "hello";          word[i] != 0 at the end
strlen(word)   'a' + 1 == 'b'   c - '0' turns a digit char into a number</code></pre>
<h4>Pointers</h4>
<pre><code>int x = 5;  int *p = &amp;x;   *p = 6;   // x is now 6</code></pre>
<h4>Useful functions</h4>
<pre><code>#include &lt;cmath&gt;     sqrt(x)  pow(a, b)  abs(x)
#include &lt;cstdlib&gt;   srand(1); rand() % 6 + 1
#include &lt;cstring&gt;   strlen(s)  strcmp(a, b)</code></pre>
<p class="ref-note">This C++ runs in your browser (JSCPP). Not supported: <code>std::string</code>, <code>vector</code>, classes and structs, references (<code>int&amp;</code>). Overflow and out-of-range array indices are reported as errors. Keep loops under about 50 000 steps.</p>`,
    java: `<h3>Java quick reference</h3>
<h4>A program</h4>
<pre><code>import java.util.*;          // Scanner, ArrayList, HashMap ...

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}</code></pre>
<h4>Output and input</h4>
<pre><code>System.out.println("x = " + x);    System.out.print("no newline");
System.out.printf("%d %.2f %s%n", n, d, s);
Scanner in = new Scanner(System.in);
int n = in.nextInt();   double d = in.nextDouble();
String word = in.next();   String line = in.nextLine();</code></pre>
<h4>Types</h4>
<pre><code>int n = 7;  long big = 10000000000L;  double x = 2.5;
char c = 'A';  boolean ok = true;  String s = "text";
7 / 2 = 3   7 % 2 = 1   7 / 2.0 = 3.5   (int) 3.9 = 3
Integer.parseInt("42")   Double.parseDouble("2.5")   Integer.MAX_VALUE</code></pre>
<h4>Decisions and loops</h4>
<pre><code>if (a &gt; b &amp;&amp; !done) { ... } else if (a == b) { ... } else { ... }
while (n &gt; 0) { n--; }       do { ... } while (cond);
for (int i = 0; i &lt; 10; i++) { ... }
for (int v : values) { ... }           // every element
switch (day) { case 1 -&gt; ...; case 6, 7 -&gt; ...; default -&gt; ...; }
x = cond ? a : b;   break;   continue;</code></pre>
<h4>Methods</h4>
<pre><code>static int square(int x) { return x * x; }
static void greet(String name) { System.out.println("Hi " + name); }</code></pre>
<h4>Strings</h4>
<pre><code>s.length()  s.charAt(i)  s.substring(a, b)  s.indexOf("x")  s.contains("x")
s.equals(t)  s.equalsIgnoreCase(t)  s.compareTo(t)  s.toUpperCase()  s.trim()
s.split(" ")  s.replace('a', 'b')  String.valueOf(n)  "" + n
StringBuilder sb = new StringBuilder();  sb.append(x);  sb.toString()</code></pre>
<h4>Arrays and collections</h4>
<pre><code>int[] a = new int[5];   int[] b = {1, 2, 3};   a.length   int[][] grid = new int[3][4];
Arrays.toString(a)   Arrays.sort(a)   Arrays.fill(a, 0)
ArrayList&lt;Integer&gt; xs = new ArrayList&lt;&gt;();  xs.add(5);  xs.get(0);  xs.size();  xs.remove(0);  xs.contains(5)
HashMap&lt;String, Integer&gt; m = new HashMap&lt;&gt;();  m.put(k, v);  m.get(k);  m.getOrDefault(k, 0);  m.containsKey(k);  m.keySet()
HashSet&lt;String&gt; seen = new HashSet&lt;&gt;();  seen.add(x);  seen.contains(x)
Collections.sort(xs)   Collections.max(xs)</code></pre>
<h4>Classes</h4>
<pre><code>class Point {
    private int x, y;                      // fields
    Point(int x, int y) { this.x = x; this.y = y; }   // constructor
    int getX() { return x; }
    public String toString() { return "(" + x + ", " + y + ")"; }
}
Point p = new Point(1, 2);   p.getX();   System.out.println(p);
class Dog extends Animal { ... super(name); ... @Override public String sound() { ... } }
interface Shape { double area(); }</code></pre>
<h4>Errors</h4>
<pre><code>try { int n = Integer.parseInt(s); }
catch (NumberFormatException e) { System.out.println("not a number: " + e.getMessage()); }
finally { ... }
throw new IllegalArgumentException("must be positive");
Math.sqrt(x)  Math.pow(a, b)  Math.abs(x)  Math.max(a, b)  Math.round(x)  Math.random()
Random r = new Random();  r.nextInt(6) + 1</code></pre>
<p class="ref-note">This Java runs in your browser, in an interpreter written for this site. It checks programs the way <code>javac</code> does (the same error messages) and covers the language an introductory course uses: classes, inheritance, interfaces, arrays, strings, <code>ArrayList</code>, <code>HashMap</code>, <code>HashSet</code>, <code>Scanner</code>, <code>Random</code>, exceptions. Not available: generics in your own classes, lambdas, nested classes, enums, files and threads. A program is stopped after about 5 seconds, and recursion deeper than about a thousand calls stops with a <code>StackOverflowError</code>.</p>`,
    scheme: `<h3>Scheme quick reference</h3>
<h4>Expressions</h4>
<pre><code>(+ 1 2)   (* 3 4)   (- 10 3)   (/ 1 3)   (quotient 7 2)   (remainder 7 2)
(= a b)   (&lt; a b)   (&gt;= a b)   (and p q)   (or p q)   (not p)</code></pre>
<h4>Names and procedures</h4>
<pre><code>(define pi 3.14159)
(define (square x) (* x x))
(lambda (x y) (+ x y))
(let ((a 1) (b 2)) (+ a b))</code></pre>
<h4>Decisions</h4>
<pre><code>(if (&lt; x 0) "negative" "not negative")
(cond ((&lt; x 0) "negative")
      ((= x 0) "zero")
      (else "positive"))</code></pre>
<h4>Recursion and iteration</h4>
<pre><code>(define (count-down n)
  (if (= n 0)
      'done
      (count-down (- n 1))))
(do ((i 0 (+ i 1))) ((= i 5)) (display i))</code></pre>
<h4>Pairs and lists</h4>
<pre><code>(cons 1 2)   (car p)   (cdr p)   (list 1 2 3)   '()
(null? xs)   (pair? xs)   (length xs)   (append xs ys)   (reverse xs)
(cadr xs)  (caddr xs)  (list-ref xs 2)  (member x xs)  (assoc k alist)</code></pre>
<h4>Higher-order procedures</h4>
<pre><code>(map square (list 1 2 3))
(filter even? (list 1 2 3 4))
(reduce + 0 (list 1 2 3))
(apply + (list 1 2 3))</code></pre>
<h4>Symbols and quotation</h4>
<pre><code>'x   '(1 2 3)   (quote (a b))   (eq? 'a 'a)   (symbol? 'a)
(number? 3)   (string? "s")   (equal? '(1 2) '(1 2))</code></pre>
<h4>Output</h4>
<pre><code>(display "text")   (newline)   (error "message" value)</code></pre>
<p class="ref-note">This is an MIT-Scheme-style dialect written for this site. The value of each top-level expression is printed as <code>;Value:</code>. Decimals are floating point, so <code>(/ 1 3)</code> shows <code>.333333333333</code>; whole numbers stay exact however big (<code>(expt 2 100)</code>). Type expressions in the REPL below the output to try things one at a time.</p>`
  };

  /* ---------------- extra error explanations ---------------- */
  const EXPLAIN = {
    python: [
      [/TypeError: cannot concatenate 'str' and 'int'|unsupported operand type\(s\) for \+: 'int' and 'str'/, 'You tried to join text and a number with +. Use commas in print, str(number), or an f-string.'],
      [/ValueError: invalid literal for int\(\)/, 'int() was given text that is not a whole number (for example "3.5" or "abc"). Check what was typed, or use float().'],
      [/ZeroDivisionError/, 'Division by zero. Check the value of the divisor before dividing; it became 0 here.'],
      [/KeyError: (.*)/, 'The dictionary has no entry with that key. Check the spelling, or use d.get(key, default).'],
      [/AttributeError: '(\w+)' object has no attribute '(\w+)'/, 'That kind of value has no method or attribute with that name. Check the spelling and the type of the value (print(type(x)) helps).'],
      [/RecursionError|maximum recursion depth/, 'A function kept calling itself and never reached a base case. Check the condition that stops the recursion.'],
      [/EOF in multi-line statement/, 'Python reached the end of the file while a bracket or quote was still open. Find the unclosed ( [ { or ".'],
      [/unindent does not match/, 'A line came back left by an amount that does not line up with any block. Make every line in a block start with the same number of spaces.'],
      [/bad input on line (\d+)/, 'Python could not read this line. Common causes: a missing colon at the end of if/for/while/def, an unclosed quote or bracket on this line or the one above, or a line indented when it should not be.']
    ],
    cpp: [
      [/integer division by zero/, 'Division by zero. The divisor became 0 here; check the values before dividing.'],
      [/index out of bound/, 'An array index went past the array size. Valid indices are 0 to size - 1.'],
      [/overflow/, 'A number became too large for its type. Use long long, or check the arithmetic.'],
      [/uninitialized|uninitialised/, 'A variable was read before it was given a value. Initialise it: int total = 0;'],
      [/Syntax error/, 'C++ could not read the program. Check for a missing semicolon at the end of the previous statement, unmatched braces or parentheses, and a missing #include or using namespace std;'],
      [/undefined|not defined|is not declared/, 'A name was used that was never declared. Declare variables with a type (int x = 0;), and define functions before main, or add an #include.']
    ],
    java: [
      [/'else' without 'if'/, 'An else has no if to belong to. Usually a semicolon or an extra } between the if-block and the else.'],
      [/not a statement/, 'This line is an expression on its own, not an instruction. A method call needs parentheses (println(x), not println), and a value alone does nothing.'],
      [/illegal start of expression/, 'Java could not start reading an expression here. Common causes: a stray keyword such as public inside a method, or a missing ) or } just before.'],
      [/unclosed string literal/, 'A string is missing its closing quote on this line.'],
      [/can't find main/, 'Every Java program starts in  public static void main(String[] args) . Add that method to your class.']
    ],
    scheme: [
      [/Unbound variable/, 'A name was used that has no definition. Check the spelling, or define it first with (define ...).'],
      [/not applicable|is not a procedure/, 'Something that is not a procedure was called as if it were. Usually an extra pair of parentheses: (x) calls x.'],
      [/wrong number of arguments|has been called with/, 'A procedure was given the wrong number of arguments. Compare the call with the (define (name args...)) line.'],
      [/maximum recursion depth/, 'The recursion never reached its base case, or the input is very large. Check the condition that stops it.'],
      [/Division by zero/, 'Division by zero. Check the divisor.'],
      [/unexpected|Unbalanced|end of input|EOF/, 'The parentheses do not balance. Count them, or use the highlighted matching bracket in the editor.']
    ]
  };

  // The same quick reference for the Full C++ engine: the note at the end changes, and the library is no longer limited.
  REFERENCE.cppfull = REFERENCE.cpp.replace(/<p class="ref-note">[\s\S]*<\/p>$/, `<h4>With Full C++ you can also use</h4>
<pre><code>#include &lt;string&gt;   #include &lt;vector&gt;   #include &lt;algorithm&gt;
string s = "hello";  s += " world";  s.size()  s.substr(0, 5)
vector&lt;int&gt; v = {3, 1, 2};  v.push_back(9);  sort(v.begin(), v.end());
for (int x : v) { ... }          auto n = v.size();
int&amp; r = x;                      // a reference: another name for x
struct Point { int x, y; };      class Counter { ... };</code></pre>
<p class="ref-note">Full C++ is a real compiler (Clang 22) running in your browser, in 32-bit mode: <code>long</code> and pointers are 4 bytes, <code>long long</code> is 8. Exceptions (<code>try</code>, <code>throw</code>) and threads are not available. Compiler warnings are shown above the output. The compiler is downloaded the first time you use it (about 28 MB), and only this engine needs the internet.</p>`);

  // The language standards Full C++ can compile for; the second is the default.
  const STANDARDS = [['gnu++17', 'C++17'], ['gnu++20', 'C++20'], ['gnu++23', 'C++23']];

  /* ---------------- state ---------------- */
  let S = null;
  function load() {
    if (S) return S;
    try { S = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { S = null; }
    if (!S || typeof S !== 'object' || !S.files || typeof S.files !== 'object') S = { lang: 'python', files: {}, active: {}, fontSize: 15, panels: {} };
    if (!hasLang(S.lang)) S.lang = 'python';   // a bad value stored here would break the Code Lab on every visit
    if (!S.active || typeof S.active !== 'object') S.active = {};
    if (!Number.isFinite(S.fontSize)) S.fontSize = 15;
    for (const l in LANG_INFO) { if (!Array.isArray(S.files[l])) S.files[l] = []; S.files[l] = S.files[l].filter(f => f && typeof f.name === 'string' && typeof f.code === 'string'); }
    for (const l in LANG_INFO) {
      if (!S.files[l] || !S.files[l].length) S.files[l] = [{ name: LANG_INFO[l].first, code: TEMPLATES[l][0].code }];
      if (S.active[l] == null || S.active[l] >= S.files[l].length) S.active[l] = 0;
    }
    if (!S.panels) S.panels = {};
    S.fullCpp = S.fullCpp === true;
    if (!STANDARDS.some(s => s[0] === S.cppStd)) S.cppStd = STANDARDS[1][0];
    return S;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
  const curFile = () => S.files[S.lang][S.active[S.lang]];

  /* ---------------- share links ---------------- */
  const b64e = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const b64d = s => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4))));
  function parseShare(query) {
    if (!query) return null;
    const q = new URLSearchParams(query);
    if (!q.get('c')) return null;
    try { return { lang: hasLang(q.get('l')) ? q.get('l') : 'python', code: b64d(q.get('c')), name: q.get('n') || '' }; } catch (e) { return null; }
  }

  /* ---------------- the editor ---------------- */
  function LabEditor(opts) {
    const { el, highlight, toLines, LANGS } = A();
    let lang = opts.lang, L = LANGS[lang];
    const wrap = el('div', { class: 'editor lab-editor' });
    const pre = el('pre', { class: 'hl', 'aria-hidden': 'true' }, el('code'));
    const ta = el('textarea', { spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', autocorrect: 'off', 'aria-label': 'Code editor' });
    const popup = el('div', { class: 'ac', hidden: '' });
    wrap.append(pre, ta, popup);
    let findRanges = [], findCur = -1, traceLine = 0, wordCache = null;

    // -- rendering with marks (current line, matching brackets, find matches, trace line)
    const render = () => {
      const h = highlight(ta.value, lang);
      const code = pre.querySelector('code');
      code.innerHTML = toLines(h.endsWith('\n') ? h.slice(0, -1) : h);
      const digits = String(ta.value.split('\n').length).length;
      wrap.style.setProperty('--gw', 'calc(' + Math.max(2, digits) + 'ch + 1.4rem)');
      const lines = code.children;
      const caretLine = ta.value.slice(0, ta.selectionStart).split('\n').length;
      if (document.activeElement === ta && lines[caretLine - 1]) lines[caretLine - 1].classList.add('cur');
      if (traceLine && lines[traceLine - 1]) lines[traceLine - 1].classList.add('trace');
      const marks = [];
      const bm = matchBracket();
      if (bm) marks.push({ s: bm[0], e: bm[0] + 1, cls: 'bm' }, { s: bm[1], e: bm[1] + 1, cls: 'bm' });
      findRanges.forEach((r, i) => marks.push({ s: r.s, e: r.e, cls: 'fm' + (i === findCur ? ' fm-cur' : '') }));
      if (marks.length) markRanges(code, marks.sort((a, b) => a.s - b.s));
      pre.style.minHeight = '';
      wordCache = null;
    };
    function markRanges(code, marks) {
      // Walk the text nodes of each line div in document order, splitting at mark boundaries.
      let off = 0, mi = 0;
      const lines = [...code.children];
      for (const line of lines) {
        const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
        const nodes = []; let n; while ((n = walker.nextNode())) nodes.push(n);
        for (let node of nodes) {
          while (node && mi < marks.length) {
            const m = marks[mi], start = off, end = off + node.data.length;
            if (m.e <= start) { mi++; continue; }
            if (m.s >= end) break;
            const a = Math.max(m.s, start) - start, b = Math.min(m.e, end) - start;
            let mid = node;
            if (a > 0) mid = node.splitText(a);
            let rest = null;
            if (b - a < mid.data.length) rest = mid.splitText(b - a);
            const span = document.createElement('span'); span.className = m.cls; mid.parentNode.insertBefore(span, mid); span.appendChild(mid);
            off += a + (b - a); node = rest; if (!rest) break;
            if (m.e <= off) mi++;
          }
          if (node) off += node.data.length;
        }
        off += 1; // the newline
      }
    }
    function matchBracket() {
      const v = ta.value, p = ta.selectionStart;
      if (ta.selectionStart !== ta.selectionEnd) return null;
      let i = -1;
      if (p > 0 && (OPEN + CLOSE).includes(v[p - 1])) i = p - 1;
      else if (p < v.length && (OPEN + CLOSE).includes(v[p])) i = p;
      if (i < 0) return null;
      const c = v[i], fwd = OPEN.includes(c);
      const other = fwd ? CLOSE[OPEN.indexOf(c)] : OPEN[CLOSE.indexOf(c)];
      let depth = 0, inStr = null;
      if (fwd) { for (let j = i; j < v.length; j++) { const ch = v[j]; if (inStr) { if (ch === '\\') j++; else if (ch === inStr) inStr = null; continue; } if ((ch === '"' || (ch === "'" && lang !== 'scheme')) && j !== i) { inStr = ch; continue; } if (ch === c) depth++; else if (ch === other) { depth--; if (!depth) return [i, j]; } } }
      else { for (let j = i; j >= 0; j--) { const ch = v[j]; if (ch === c) depth++; else if (ch === other) { depth--; if (!depth) return [j, i]; } } }
      return null;
    }

    // -- history
    const hist = [{ v: '', s: 0, e: 0 }]; let hi = 0, lastKind = null, lastTime = 0;
    const record = (kind) => {
      const now = Date.now(); const st = { v: ta.value, s: ta.selectionStart, e: ta.selectionEnd };
      if (kind && kind === lastKind && now - lastTime < 800) hist[hi] = st;
      else { hist.length = hi + 1; hist.push(st); hi++; if (hist.length > 1000) { hist.shift(); hi--; } }
      lastKind = kind; lastTime = now;
    };
    const changed = () => { if (opts.onChange) opts.onChange(ta.value); };
    const restore = (st) => { ta.value = st.v; ta.selectionStart = st.s; ta.selectionEnd = st.e; lastKind = null; render(); changed(); };
    const undo = () => { if (hi > 0) restore(hist[--hi]); };
    const redo = () => { if (hi < hist.length - 1) restore(hist[++hi]); };
    const edit = (s, t, text, caretPos, selEnd) => {
      ta.value = ta.value.slice(0, s) + text + ta.value.slice(t);
      ta.selectionStart = caretPos; ta.selectionEnd = selEnd == null ? caretPos : selEnd;
      record(null); render(); changed();
    };

    // -- autocomplete
    let acItems = [], acIdx = 0, acStart = 0;
    const words = () => {
      if (wordCache) return wordCache;
      const set = new Set([...L.keywords, ...L.builtins]);
      const re = lang === 'scheme' ? /[A-Za-z_][A-Za-z0-9_!?*<>=\-+\/]*/g : /[A-Za-z_][A-Za-z0-9_]*/g;
      const v = ta.value.replace(new RegExp(L.comment.source, 'gm'), '').replace(new RegExp(L.string.source, 'g'), '');
      let m; while ((m = re.exec(v))) if (m[0].length > 1) set.add(m[0]);
      return (wordCache = [...set]);
    };
    const acClose = () => { popup.hidden = true; acItems = []; };
    const acUpdate = () => {
      const p = ta.selectionStart; if (p !== ta.selectionEnd) return acClose();
      const before = ta.value.slice(0, p);
      const m = before.match(lang === 'scheme' ? /[A-Za-z_][A-Za-z0-9_!?*<>=\-+\/]*$/ : /[A-Za-z_][A-Za-z0-9_]*$/);
      if (!m || m[0].length < 2) return acClose();
      const prefix = m[0]; acStart = p - prefix.length;
      const after = ta.value.slice(p); if (/^[A-Za-z0-9_]/.test(after)) return acClose();
      acItems = words().filter(w => w !== prefix && w.startsWith(prefix)).sort((a, b) => a.length - b.length || a.localeCompare(b)).slice(0, 8);
      if (!acItems.length) return acClose();
      acIdx = 0; acRender();
      const lineNo = before.split('\n').length, col = before.length - before.lastIndexOf('\n') - 1;
      const lh = parseFloat(getComputedStyle(ta).lineHeight) || 21, cw = charWidth();
      popup.style.top = (lineNo * lh + 10 - ta.scrollTop) + 'px';
      popup.style.left = 'min(calc(var(--gw) + ' + ((col - prefix.length) * cw) + 'px), calc(100% - 14rem))';
      popup.hidden = false;
    };
    const acRender = () => { popup.innerHTML = ''; acItems.forEach((w, i) => popup.append(A().el('div', { class: 'ac-item' + (i === acIdx ? ' sel' : ''), onmousedown: (e) => { e.preventDefault(); acIdx = i; acAccept(); } }, w))); };
    const acAccept = () => { const w = acItems[acIdx]; if (!w) return; edit(acStart, ta.selectionStart, w, acStart + w.length); acClose(); };
    let cwCache = 0;
    const charWidth = () => { if (cwCache) return cwCache; const s = A().el('span', { style: 'position:absolute;visibility:hidden;white-space:pre' }, 'MMMMMMMMMM'); pre.appendChild(s); cwCache = s.offsetWidth / 10 || 8; s.remove(); return cwCache; };

    // -- events
    ta.addEventListener('input', (e) => {
      const it = e.inputType || ''; let kind = null;
      if (it === 'insertText' && e.data && e.data.length === 1 && !/\s/.test(e.data)) kind = 'type';
      else if (it === 'deleteContentBackward' || it === 'deleteContentForward') kind = it;
      record(kind); render(); changed(); if (opts.onCursor) opts.onCursor();
      if (kind === 'type') acUpdate(); else acClose();
    });
    ta.addEventListener('beforeinput', (e) => {
      if (e.inputType === 'historyUndo') { e.preventDefault(); undo(); }
      else if (e.inputType === 'historyRedo') { e.preventDefault(); redo(); }
    });
    ta.addEventListener('scroll', () => { pre.scrollTop = ta.scrollTop; pre.scrollLeft = ta.scrollLeft; if (!popup.hidden) acClose(); });
    ta.addEventListener('click', () => { render(); acClose(); });
    ta.addEventListener('keyup', (e) => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) render(); if (opts.onCursor) opts.onCursor(); });
    ta.addEventListener('select', () => { render(); if (opts.onCursor) opts.onCursor(); });
    ta.addEventListener('mouseup', () => { render(); if (opts.onCursor) opts.onCursor(); });
    ta.addEventListener('focus', render); ta.addEventListener('blur', () => { render(); setTimeout(acClose, 150); });
    ta.addEventListener('keydown', (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!popup.hidden) {
        if (e.key === 'ArrowDown') { e.preventDefault(); acIdx = (acIdx + 1) % acItems.length; acRender(); return; }
        if (e.key === 'ArrowUp') { e.preventDefault(); acIdx = (acIdx - 1 + acItems.length) % acItems.length; acRender(); return; }
        if (e.key === 'Tab' || e.key === 'Enter') { e.preventDefault(); acAccept(); return; }
        if (e.key === 'Escape') { e.preventDefault(); acClose(); return; }
      }
      if (mod && !e.altKey && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
      if (mod && !e.altKey && !e.shiftKey && (e.key === 'y' || e.key === 'Y')) { e.preventDefault(); redo(); return; }
      if (mod && (e.key === 'f' || e.key === 'F' || e.key === 'h' || e.key === 'H')) { e.preventDefault(); if (opts.onFind) opts.onFind(e.key.toLowerCase() === 'h'); return; }
      if (mod && e.key === 'Enter') { e.preventDefault(); if (opts.onRun) opts.onRun(); return; }
      if (mod && e.key === '/') { e.preventDefault(); toggleComment(); return; }
      if (mod && (e.key === 's' || e.key === 'S')) { e.preventDefault(); if (opts.onSave) opts.onSave(); return; }
      if (mod && (e.key === 'd' || e.key === 'D')) { e.preventDefault(); duplicateLine(); return; }
      if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); moveLines(e.key === 'ArrowUp' ? -1 : 1); return; }
      if (e.key === 'Escape') { if (opts.onEscape) opts.onEscape(); return; }
      const s = ta.selectionStart, t = ta.selectionEnd, v = ta.value;
      if (e.key === 'Tab') {
        e.preventDefault();
        if (s !== t && v.slice(s, t).includes('\n')) { indentBlock(!e.shiftKey); return; }
        if (e.shiftKey) { const ls = v.lastIndexOf('\n', s - 1) + 1; if (v.startsWith(L.tab, ls)) edit(ls, ls + L.tab.length, '', Math.max(ls, s - L.tab.length)); }
        else edit(s, t, L.tab, s + L.tab.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const ls = v.lastIndexOf('\n', s - 1) + 1, line = v.slice(ls, s);
        let indent = (line.match(/^\s*/) || [''])[0]; const trimmed = line.trim();
        const opens = (lang === 'python' && trimmed.endsWith(':')) || ((lang === 'cpp' || lang === 'java') && trimmed.endsWith('{')) || (lang === 'scheme' && (trimmed.split('(').length > trimmed.split(')').length));
        if (opens) indent += L.tab;
        // C++: Enter between { and } puts } on its own line
        if ((lang === 'cpp' || lang === 'java') && trimmed.endsWith('{') && v[t] === '}') { const ins = '\n' + indent + '\n' + indent.slice(L.tab.length); edit(s, t, ins, s + 1 + indent.length); return; }
        const ins = '\n' + indent; edit(s, t, ins, s + ins.length);
      } else if ((lang === 'cpp' || lang === 'java') && e.key === '}' && s === t) {
        const ls = v.lastIndexOf('\n', s - 1) + 1;
        if (v[s] === '}') { e.preventDefault(); ta.selectionStart = ta.selectionEnd = s + 1; render(); }
        else if (/^\s+$/.test(v.slice(ls, s)) && v.slice(ls, s).length >= L.tab.length) { e.preventDefault(); edit(ls, t, v.slice(ls, s).slice(L.tab.length) + '}', s - L.tab.length + 1); }
      } else if (PAIRS[e.key] && !mod && !e.altKey) {
        const close = PAIRS[e.key];
        if (s !== t) { e.preventDefault(); edit(s, t, e.key + v.slice(s, t) + close, s + 1, t + 1); return; }   // wrap selection
        if ((e.key === '"' || e.key === "'") && v[s] === e.key) { e.preventDefault(); ta.selectionStart = ta.selectionEnd = s + 1; render(); return; }
        if (e.key === '"' || e.key === "'") { const prev = v[s - 1]; if (prev && /[A-Za-z0-9_"']/.test(prev)) return; if (lang === 'scheme' && e.key === "'") return; }
        const next = v[s]; if (next && !/[\s)\]},;:]/.test(next)) return;
        e.preventDefault(); edit(s, t, e.key + close, s + 1);
      } else if (CLOSE.includes(e.key) && s === t && v[s] === e.key && !mod) {
        e.preventDefault(); ta.selectionStart = ta.selectionEnd = s + 1; render();
      } else if (e.key === 'Backspace' && s === t && s > 0 && PAIRS[v[s - 1]] === v[s] && !mod) {
        e.preventDefault(); edit(s - 1, s + 1, '', s - 1);
      }
    });
    // Start and end of the whole lines covered by the selection [s, t]. A caret at column 0 covers its own line;
    // a selection that ends at column 0 does not include the line it ends in.
    function lineSpan(v, s, t) {
      const ls = v.lastIndexOf('\n', s - 1) + 1; let le = v.indexOf('\n', t > s ? t - 1 : t); if (le < 0) le = v.length;
      return [ls, le];
    }
    function indentBlock(add) {
      const v = ta.value, s = ta.selectionStart, t = ta.selectionEnd;
      const [ls, le] = lineSpan(v, s, t);
      const lines = v.slice(ls, le).split('\n').map(l => add ? L.tab + l : (l.startsWith(L.tab) ? l.slice(L.tab.length) : l.replace(/^\s{1,3}/, '')));
      const text = lines.join('\n'); edit(ls, le, text, ls, ls + text.length);
    }
    function duplicateLine() {
      const v = ta.value, s = ta.selectionStart, t = ta.selectionEnd;
      const [ls, le] = lineSpan(v, s, t);
      const text = v.slice(ls, le); edit(le, le, '\n' + text, s + text.length + 1, t + text.length + 1);
    }
    function moveLines(dir) {
      const v = ta.value, s = ta.selectionStart, t = ta.selectionEnd;
      const [ls, le] = lineSpan(v, s, t);
      const block = v.slice(ls, le);
      if (dir < 0) { if (ls === 0) return; const ps = v.lastIndexOf('\n', ls - 2) + 1; const prev = v.slice(ps, ls - 1); edit(ps, le, block + '\n' + prev, s - prev.length - 1, t - prev.length - 1); }
      else { if (le >= v.length) return; let ne = v.indexOf('\n', le + 1); if (ne < 0) ne = v.length; const next = v.slice(le + 1, ne); edit(ls, ne, next + '\n' + block, s + next.length + 1, t + next.length + 1); }
    }
    function toggleComment() {
      const v = ta.value, s = ta.selectionStart, t = ta.selectionEnd, mark = lang === 'python' ? '# ' : (lang === 'cpp' || lang === 'java') ? '// ' : '; ';
      const [ls, le] = lineSpan(v, s, t);
      const lines = v.slice(ls, le).split('\n'); const all = lines.every(l => l.trim() === '' || l.trimStart().startsWith(mark.trim()));
      const out = lines.map(l => { if (l.trim() === '') return l; const ind = l.match(/^\s*/)[0]; return all ? ind + l.slice(ind.length).replace(new RegExp('^' + mark.trim().replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&') + ' ?'), '') : ind + mark + l.slice(ind.length); }).join('\n');
      edit(ls, le, out, ls, ls + out.length);
    }
    requestAnimationFrame(render);
    return {
      el: wrap, ta,
      get value() { return ta.value; },
      set value(v) { ta.value = v; ta.selectionStart = ta.selectionEnd = 0; hist.length = 0; hist.push({ v, s: 0, e: 0 }); hi = 0; lastKind = null; render(); },
      setLang(l) { lang = l; L = LANGS[l]; wordCache = null; render(); },
      focus: () => ta.focus(), render, undo, redo,
      setFind(ranges, cur) { findRanges = ranges || []; findCur = cur == null ? -1 : cur; render(); },
      setTrace(line) { traceLine = line || 0; render(); if (line) scrollToLine(line); },
      select(s, e) { ta.focus(); ta.selectionStart = s; ta.selectionEnd = e; render(); scrollToLine(ta.value.slice(0, s).split('\n').length); },
      pos() { const before = ta.value.slice(0, ta.selectionStart); return { line: before.split('\n').length, col: before.length - before.lastIndexOf('\n'), selected: ta.selectionEnd - ta.selectionStart }; },
      indentLines: (add) => indentBlock(add),
      goToLine(n) { const lines = ta.value.split('\n'); n = Math.max(1, Math.min(n, lines.length)); let s = 0; for (let i = 0; i < n - 1; i++) s += lines[i].length + 1; this.select(s, s + lines[n - 1].length); },
      replaceRange: (s, t, text) => edit(s, t, text, s + text.length)
    };
    function scrollToLine(n) {
      const lh = parseFloat(getComputedStyle(ta).lineHeight) || 21; const y = (n - 1) * lh;
      if (y < ta.scrollTop + lh || y > ta.scrollTop + ta.clientHeight - 2 * lh) ta.scrollTop = Math.max(0, y - ta.clientHeight / 2);
      pre.scrollTop = ta.scrollTop;
    }
  }

  /* ---------------- the page ---------------- */
  function page(query, kind) {
    const { el, Runners, outputPanel, tipFor, armConfirm } = A();
    load();
    const shared = kind === 'assign' || kind === 'review' ? null : parseShare(query);
    if (shared) { S.lang = shared.lang; const name = shared.name || ('shared' + LANG_INFO[S.lang].ext); const files = S.files[S.lang]; let idx = files.findIndex(f => f.name === name && f.code === shared.code); if (idx < 0) { files.push({ name: uniqueName(S.lang, name), code: shared.code }); idx = files.length - 1; } S.active[S.lang] = idx; save(); history.replaceState(null, '', '#/lab'); }
    document.documentElement.setAttribute('data-course', LANG_INFO[S.lang].accent);

    const main = el('main', { class: 'lab' });
    const status = el('span', { class: 'lab-status' });
    let running = false, tracer = null, memTrace = null, memIdx = 0, memToken = 0;

    // ----- editor
    const editor = LabEditor({ lang: S.lang, onChange: (v) => { curFile().code = v; save(); if (!findBar.hidden && findInp.value) computeMatches(); if (memTrace) endMem('The program changed, so the memory view was closed. Press Step through memory to start again.'); }, onRun: () => run(), onSave: () => download(), onCursor: () => renderStatusBar(), onFind: (withReplace) => openFind(withReplace), onEscape: () => { if (!findBar.hidden) closeFind(); } });
    editor.value = curFile().code;
    editor.el.style.setProperty('--lab-font', S.fontSize + 'px');

    // ----- language switch
    const langBar = el('div', { class: 'lab-langs', role: 'tablist' });
    const langBtns = {};
    for (const l in LANG_INFO) langBtns[l] = el('button', { class: 'lang-btn' + (l === S.lang ? ' on' : ''), role: 'tab', onclick: () => switchLang(l) }, LANG_INFO[l].label);
    langBar.append(...Object.values(langBtns));
    function switchLang(l) {
      if (l === S.lang) return;
      if (tracer) tracer.stop();
      S.lang = l; save();
      for (const k in langBtns) langBtns[k].classList.toggle('on', k === l);
      document.documentElement.setAttribute('data-course', LANG_INFO[l].accent);
      editor.setLang(l); editor.value = curFile().code;
      renderTabs(); renderToolbar(); renderStatusBar(); renderExBar(); renderAsgBar(); out.hide(); replBox.hidden = l !== 'scheme'; turtleBox.hidden = true; traceBox.hidden = true; stdinBox.hidden = true; substBox.hidden = true; endMem();
      refBody.innerHTML = REFERENCE[l === 'cpp' && isFull() ? 'cppfull' : l]; renderTemplates(); repl.reset(); engineChanged();
    }

    // ----- file tabs
    const tabs = el('div', { class: 'lab-tabs', role: 'tablist' });
    function uniqueName(l, name) { const names = S.files[l].map(f => f.name); let n = name, i = 2; const base = name.replace(/(\.\w+)$/, ''), ext = (name.match(/\.\w+$/) || [''])[0]; while (names.includes(n)) n = base + i++ + ext; return n; }
    function renderTabs() {
      tabs.innerHTML = '';
      S.files[S.lang].forEach((f, i) => {
        const b = el('button', { class: 'tab' + (i === S.active[S.lang] ? ' on' : ''), role: 'tab', title: 'Double-click to rename', onclick: () => activate(i), ondblclick: () => rename(i) }, f.name);
        if (S.files[S.lang].length > 1) b.append(el('span', { class: 'tab-x', title: 'Close', onclick: (e) => { e.stopPropagation(); closeFile(i, b); } }, '×'));
        tabs.append(b);
      });
      tabs.append(el('button', { class: 'tab add', title: 'New file', 'aria-label': 'New file', onclick: newFile }, '+ New'));
    }
    // A small inline form used for both "new file" and "rename": [name input] [OK] [Cancel]
    function nameForm(initial, onDone, anchor) {
      const inp = el('input', { class: 'tab-rename', value: initial, 'aria-label': 'File name', maxlength: 40 });
      const ok = el('button', { class: 'btn primary tiny' }, 'OK'), cancel = el('button', { class: 'btn quiet tiny' }, 'Cancel');
      const form = el('span', { class: 'name-form' }, inp, ok, cancel);
      let closed = false;
      const finish = (commit) => { if (closed) return; closed = true; form.remove(); onDone(commit ? inp.value : null); };
      ok.addEventListener('click', () => finish(true)); cancel.addEventListener('click', () => finish(false));
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); finish(true); } if (e.key === 'Escape') { e.preventDefault(); finish(false); } });
      anchor.replaceWith(form); inp.focus(); const dot = inp.value.lastIndexOf('.'); inp.setSelectionRange(0, dot > 0 ? dot : inp.value.length);
      return form;
    }
    function cleanName(n, l) { n = (n || '').trim().replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '_'); if (!n) return null; if (!/\.\w+$/.test(n)) n += LANG_INFO[l].ext; return n; }
    function activate(i) { if (tracer) tracer.stop(); endMem(); S.active[S.lang] = i; save(); editor.value = curFile().code; renderTabs(); renderStatusBar(); engineChanged(); renderExBar(); renderAsgBar(); if (!isTouch()) editor.focus(); }
    const isTouch = () => window.matchMedia && matchMedia('(hover: none)').matches;
    function newFile() {
      const l = S.lang; const addBtn = tabs.lastElementChild;
      nameForm(uniqueName(l, 'untitled' + LANG_INFO[l].ext), (name) => { const n = cleanName(name, l); if (n == null) { renderTabs(); return; } S.files[l].push({ name: uniqueName(l, n), code: '' }); activate(S.files[l].length - 1); }, addBtn);
    }
    function rename(i) {
      const f = S.files[S.lang][i]; if (!tabs.children[i]) return;
      nameForm(f.name, (name) => { const n = cleanName(name, S.lang); if (n != null && n !== f.name) { f.name = uniqueName(S.lang, n); save(); } renderTabs(); renderStatusBar(); }, tabs.children[i]);
    }
    // status bar under the editor: file name, cursor position, rename, wrap, touch helpers
    const posLabel = el('span', { class: 'sb-pos' });
    const wrapBtn = el('button', { class: 'btn quiet tiny', onclick: () => { S.wrap = !S.wrap; save(); applyWrap(); } });
    const renameBtn = el('button', { class: 'btn quiet tiny', title: 'Rename this file', onclick: () => rename(S.active[S.lang]) }, 'Rename');
    const indentBtn = el('button', { class: 'btn quiet tiny touch-only', title: 'Indent', onclick: () => { editor.focus(); editor.indentLines(true); } }, '⇥ Indent');
    const outdentBtn = el('button', { class: 'btn quiet tiny touch-only', title: 'Outdent', onclick: () => { editor.focus(); editor.indentLines(false); } }, '⇤ Outdent');
    const clearOutBtn = el('button', { class: 'btn quiet tiny', title: 'Clear the output panel', onclick: () => out.hide() }, 'Clear output');
    const statusBar = el('div', { class: 'lab-statusbar' }, posLabel, el('span', { class: 'spacer' }), indentBtn, outdentBtn, renameBtn, wrapBtn, clearOutBtn);
    function renderStatusBar() { const p = editor.pos(); posLabel.textContent = curFile().name + '  ·  Ln ' + p.line + ', Col ' + p.col + (p.selected ? '  ·  ' + p.selected + ' selected' : ''); }
    function applyWrap() { editor.el.classList.toggle('wrap', !!S.wrap); wrapBtn.textContent = 'Wrap: ' + (S.wrap ? 'on' : 'off'); editor.render(); }
    function closeFile(i, btn) {
      const f = S.files[S.lang][i];
      if (f.code.trim() && !btn.dataset.armed) { btn.dataset.armed = '1'; btn.classList.add('armed'); btn.lastChild.textContent = 'close?'; setTimeout(() => { delete btn.dataset.armed; btn.classList.remove('armed'); if (btn.lastChild) btn.lastChild.textContent = '×'; }, 3000); return; }
      S.files[S.lang].splice(i, 1); if (S.active[S.lang] >= S.files[S.lang].length) S.active[S.lang] = S.files[S.lang].length - 1; else if (i < S.active[S.lang]) S.active[S.lang]--;
      save(); editor.value = curFile().code; renderTabs();
    }

    // ----- exercise bar (a file opened from a course exercise can be checked here)
    const exBar = el('div', { class: 'ex-bar', hidden: '' });
    const exVerdict = el('div', { class: 'verdict', hidden: '', role: 'status' });
    let exAttempts = 0;
    function renderExBar() {
      const f = curFile(); exBar.innerHTML = ''; exVerdict.hidden = true; exAttempts = 0;
      const found = f.ex && findExercise(f.ex.id);
      if (!found) { exBar.hidden = true; return; }
      const { ex, course, lessonIdx, lesson } = found; exBar.hidden = false;
      const check = el('button', { class: 'btn primary', onclick: async () => {
        check.disabled = true; check.textContent = 'Checking…'; exAttempts++; exVerdict.hidden = false; exVerdict.innerHTML = '';
        const r = await A().grade(ex, editor.value, exVerdict);
        A().renderVerdict(exVerdict, r, ex, exAttempts);
        if (r.passed) { A().Progress.markDone(ex.id, editor.value); A().Progress.setCode(ex.id, editor.value); document.dispatchEvent(new CustomEvent('progress-changed')); }
        check.disabled = false; check.textContent = 'Check against the exercise';
      } }, 'Check against the exercise');
      const prompt = el('div', { class: 'prose ex-prompt', hidden: '', html: ex.prompt });
      exBar.append(
        el('div', { class: 'ex-bar-text' }, el('span', { class: 'ex-label' }, 'Exercise'), ' ', el('b', {}, ex.title), el('span', { class: 'ex-bar-where' }, ' · ' + course.code + ', Lesson ' + (lessonIdx + 1) + ': ' + lesson.title + (A().Progress.isDone(ex.id) ? ' · completed ✓' : ''))),
        el('div', { class: 'toolbar' }, check, el('a', { class: 'btn quiet', href: '#/' + course.id + '/' + (lessonIdx + 1) + '/' + ex.id }, 'Open the lesson'), el('button', { class: 'btn quiet', onclick: () => { prompt.hidden = !prompt.hidden; } }, 'Show the task')),
        prompt);
      if (ex.sampleStdin && (S.lang === 'cpp' || S.lang === 'java')) { stdinBox.hidden = false; if (!stdinTa.value) stdinTa.value = ex.sampleStdin; }
    }
    // ----- teacher / assignment tools (src/teach.js)
    const asgHost = el('div');
    const ctx = {
      el, S, save, editor, armConfirm, isTouch, grade: (ex, code, host) => A().grade(ex, code, host), renderVerdict: (v, r, ex, n) => A().renderVerdict(v, r, ex, n),
      status: (t) => { status.textContent = t; setTimeout(() => { if (status.textContent === t) status.textContent = ''; }, 6000); },
      renderToolbar: () => renderToolbar(),
      openAssignmentFile: (a) => { const l = a.lang; if (!hasLang(l)) return; let idx = S.files[l].findIndex(f => f.asg === a.id); if (idx < 0) { S.files[l].push({ name: uniqueName(l, (a.title || 'assignment').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + LANG_INFO[l].ext), code: a.starter || '', asg: a.id }); idx = S.files[l].length - 1; } S.active[l] = idx; save(); if (l !== S.lang) switchLang(l); else activate(idx); },
      openReviewFile: (l, name, code) => { if (!hasLang(l)) l = S.lang; S.files[l].push({ name: uniqueName(l, name.replace(/[^a-z0-9_-]+/gi, '_') + LANG_INFO[l].ext), code }); S.active[l] = S.files[l].length - 1; save(); if (l !== S.lang) switchLang(l); else activate(S.active[l]); }
    };
    const teach = window.TEACH ? window.TEACH.mount(ctx) : null;
    function renderAsgBar() { asgHost.innerHTML = ''; if (!teach) return; const bar = teach.assignmentBar(curFile()); if (bar) asgHost.append(bar); }
    // ----- toolbar
    const toolbar = el('div', { class: 'toolbar lab-toolbar' });
    const runBtn = el('button', { class: 'btn primary', title: 'Run (Ctrl+Enter)', onclick: () => run() }, 'Run');
    const stopBtn = el('button', { class: 'btn', hidden: '', onclick: () => stop() }, 'Stop');
    const stepBtn = el('button', { class: 'btn', title: 'Run one line at a time and watch the variables', onclick: () => startTrace() }, 'Step through');
    const substBtn = el('button', { class: 'btn', title: 'Show the substitution model: the expression rewritten one step at a time', onclick: () => startSubst() }, 'Substitution');
    const memBtn = el('button', { class: 'btn', title: 'Run one line at a time and watch every variable, address and pointer in memory', onclick: () => startMem() }, 'Step through memory');
    const shareBtn = el('button', { class: 'btn quiet', onclick: share }, 'Share link');
    const openBtn = el('button', { class: 'btn quiet', onclick: () => fileInput.click() }, 'Open');
    const saveBtn = el('button', { class: 'btn quiet', title: 'Download this file', onclick: download }, 'Save');
    const tplBtn = el('button', { class: 'btn quiet', onclick: () => togglePanel('tpl') }, 'Templates');
    const refBtn = el('button', { class: 'btn quiet', onclick: () => togglePanel('ref') }, 'Reference');
    const termBtn = el('button', { class: 'btn quiet', title: 'A command line: practise Unix commands on your own files, and run your programs from it', onclick: () => toggleTerm() }, 'Terminal');
    const findBtn = el('button', { class: 'btn quiet', title: 'Find and replace (Ctrl+F / Ctrl+H)', onclick: () => openFind(false) }, 'Find');
    const fontDown = el('button', { class: 'btn quiet font-btn', title: 'Smaller text', onclick: () => setFont(-1) }, 'A−');
    const fontUp = el('button', { class: 'btn quiet font-btn', title: 'Larger text', onclick: () => setFont(1) }, 'A+');
    // C++ has two engines: the teaching one (JSCPP; step-through memory, always available, works offline) and Full C++ (Clang; the whole language and library,
    // downloaded the first time). An exercise from a Full C++ course always uses Full C++.
    const exFull = () => { const f = curFile(); const found = f.ex && findExercise(f.ex.id); return !!(found && found.ex.runtime === 'full') || (!!teach && teach.assignmentRuntime(f) === 'full'); };
    const isFull = () => S.lang === 'cpp' && (exFull() || S.fullCpp === true);
    const stdSel = el('select', { class: 'teach-select std-sel', 'aria-label': 'Language standard', title: 'Which version of C++ the compiler accepts. C++20 is the default; checks on exercises always use it.', onchange: () => { S.cppStd = stdSel.value; save(); } }, STANDARDS.map(([v, label]) => el('option', { value: v }, label)));
    stdSel.value = S.cppStd;
    const engineBtn = el('button', { class: 'btn quiet', onclick: () => { S.fullCpp = !S.fullCpp; save(); engineChanged(); } });
    function engineChanged() {
      if (S.lang !== 'cpp') return;
      const why = window.CLANGRUN.unavailable(), forced = exFull();
      engineBtn.textContent = isFull() ? 'Engine: Full C++' : 'Engine: Teaching';
      engineBtn.disabled = forced || (!isFull() && !!why);
      engineBtn.title = forced ? 'This exercise or assignment is written for Full C++' : (!isFull() && why ? 'Full C++ is not available here: ' + why : isFull() ? 'Full C++ is a real compiler: all of the language and the standard library. Click to go back to the teaching engine, which can step through memory and works offline.' : 'The teaching engine covers the basics of C++ and can step through memory. Click for Full C++, a real compiler with strings, vectors, classes and the rest of the library (downloads about ' + window.CLANGRUN.mb() + ' MB the first time).');
      refBody.innerHTML = REFERENCE[isFull() ? 'cppfull' : 'cpp'];
      endMem(); renderToolbar();
    }
    const fileInput = el('input', { type: 'file', accept: '.py,.cpp,.cc,.cxx,.h,.scm,.ss,.rkt,.txt', hidden: '', onchange: openFiles });
    function renderToolbar() { toolbar.innerHTML = ''; toolbar.append(...[runBtn, stopBtn, S.lang === 'cpp' ? engineBtn : null, S.lang === 'cpp' && isFull() ? stdSel : null, S.lang === 'python' ? stepBtn : null, S.lang === 'cpp' && window.CPPSTEP && !isFull() ? memBtn : null, S.lang === 'scheme' ? substBtn : null, teach ? teach.toolbarButton() : null, findBtn, tplBtn, refBtn, window.TERMINAL ? termBtn : null, el('span', { class: 'spacer' }), openBtn, saveBtn, shareBtn, fontDown, fontUp, fileInput, status].filter(Boolean)); }
    function setFont(d) { S.fontSize = Math.min(24, Math.max(11, S.fontSize + d)); save(); editor.el.style.setProperty('--lab-font', S.fontSize + 'px'); editor.render(); }

    // ----- find / replace bar
    const findInp = el('input', { class: 'find-inp', placeholder: 'Find', 'aria-label': 'Find' });
    const replInp = el('input', { class: 'find-inp', placeholder: 'Replace with', 'aria-label': 'Replace with' });
    const findCount = el('span', { class: 'find-count' });
    const caseChk = el('input', { type: 'checkbox', id: 'lab-case' });
    const findBar = el('div', { class: 'find-bar', hidden: '' },
      findInp, el('button', { class: 'btn quiet', title: 'Previous (Shift+Enter)', onclick: () => findStep(-1) }, '↑'), el('button', { class: 'btn quiet', title: 'Next (Enter)', onclick: () => findStep(1) }, '↓'), findCount,
      el('label', { class: 'find-opt' }, caseChk, ' match case'),
      el('span', { class: 'find-break' }),
      replInp, el('button', { class: 'btn quiet', onclick: () => replaceOne() }, 'Replace'), el('button', { class: 'btn quiet', onclick: () => replaceAll() }, 'Replace all'),
      el('button', { class: 'btn quiet find-close', title: 'Close (Esc)', onclick: closeFind }, '×'));
    let matches = [], mi = -1;
    function computeMatches() {
      const q = findInp.value; matches = []; mi = -1;
      if (q) { const v = caseChk.checked ? editor.value : editor.value.toLowerCase(), qq = caseChk.checked ? q : q.toLowerCase(); let i = 0; while ((i = v.indexOf(qq, i)) >= 0) { matches.push({ s: i, e: i + q.length }); i += q.length; } }
      findCount.textContent = q ? (matches.length ? matches.length + ' found' : 'no matches') : '';
      editor.setFind(matches, -1);
    }
    function findStep(d) { if (!matches.length) { computeMatches(); if (!matches.length) return; } const caret = editor.ta.selectionStart; if (mi < 0) { mi = d > 0 ? matches.findIndex(m => m.s >= caret) : matches.length - 1; if (mi < 0) mi = 0; } else mi = (mi + d + matches.length) % matches.length; const m = matches[mi]; editor.setFind(matches, mi); editor.select(m.s, m.e); findCount.textContent = (mi + 1) + ' of ' + matches.length; }
    function replaceOne() { if (mi < 0 || !matches.length) { findStep(1); return; } const m = matches[mi]; editor.replaceRange(m.s, m.e, replInp.value); computeMatches(); if (matches.length) findStep(1); }
    function replaceAll() { if (!findInp.value) return; const q = findInp.value, flags = caseChk.checked ? 'g' : 'gi'; const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&'), flags); const n = (editor.value.match(re) || []).length; if (!n) return; editor.replaceRange(0, editor.value.length, editor.value.replace(re, () => replInp.value)); findCount.textContent = n + ' replaced'; matches = []; mi = -1; editor.setFind([], -1); }
    findInp.addEventListener('input', computeMatches); caseChk.addEventListener('change', computeMatches);
    findInp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); findStep(e.shiftKey ? -1 : 1); } if (e.key === 'Escape') closeFind(); });
    replInp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); replaceOne(); } if (e.key === 'Escape') closeFind(); });
    function openFind(withReplace) { findBar.hidden = false; findBar.classList.toggle('with-replace', !!withReplace); const sel = editor.value.slice(editor.ta.selectionStart, editor.ta.selectionEnd); if (sel && !sel.includes('\n')) findInp.value = sel; computeMatches(); findInp.focus(); findInp.select(); }
    function closeFind() { findBar.hidden = true; editor.setFind([], -1); editor.focus(); }

    // ----- side panels: templates, reference
    const tplBox = el('div', { class: 'lab-panel', hidden: '' });
    const refBox = el('div', { class: 'lab-panel lab-ref', hidden: '' });
    const refBody = el('div', { class: 'prose ref-body', html: REFERENCE[S.lang === 'cpp' && S.fullCpp ? 'cppfull' : S.lang] });
    refBox.append(el('div', { class: 'panel-head' }, el('b', {}, 'Quick reference'), el('button', { class: 'btn quiet', onclick: () => togglePanel('ref') }, '×')), refBody);
    function renderTemplates() {
      tplBox.innerHTML = '';
      tplBox.append(el('div', { class: 'panel-head' }, el('b', {}, 'Starter programs'), el('button', { class: 'btn quiet', onclick: () => togglePanel('tpl') }, '×')),
        el('p', { class: 'panel-note' }, 'Each opens in a new tab so your current file is kept.'),
        el('div', { class: 'tpl-list' }, TEMPLATES[S.lang].map(t => el('button', { class: 'tpl', onclick: () => { const l = S.lang; S.files[l].push({ name: uniqueName(l, t.name.toLowerCase().replace(/[^a-z0-9]+/g, '_') + LANG_INFO[l].ext), code: t.code }); activate(S.files[l].length - 1); togglePanel('tpl', false); } }, t.name))));
    }
    renderTemplates();
    function togglePanel(which, force) { const box = which === 'tpl' ? tplBox : refBox, other = which === 'tpl' ? refBox : tplBox; const show = force != null ? force : box.hidden; box.hidden = !show; if (show) other.hidden = true; S.panels[which] = show; save(); if (show && window.innerWidth < 900 && box.scrollIntoView) box.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    if (S.panels.ref) refBox.hidden = false;

    // ----- output, stdin, turtle, trace, REPL
    const out = outputPanel(); out.el.classList.add('lab-out');
    // ----- the terminal (src/terminal.js in front of src/shell.js). ~/lab in it mirrors the files here, both ways.
    function removeLabFile(l, f) { const i = S.files[l].indexOf(f); if (i < 0) return; S.files[l].splice(i, 1); if (!S.files[l].length) S.files[l].push({ name: LANG_INFO[l].first, code: '' }); if (S.active[l] >= S.files[l].length) S.active[l] = S.files[l].length - 1; else if (i < S.active[l]) S.active[l]--; save(); }
    const term = window.TERMINAL && window.SHELL ? window.TERMINAL.mount({
      el, armConfirm, isTouch, Runners, isFull, cppStd: () => S.cppStd, stop,
      labFiles: () => { const all = []; for (const l in LANG_INFO) for (const f of S.files[l]) all.push({ lang: l, name: f.name, code: f.code, set: (c) => { f.code = c; save(); }, remove: () => removeLabFile(l, f) }); return all; },
      addLabFile: (l, name, code) => { if (!hasLang(l)) return; S.files[l].push({ name: uniqueName(l, name), code }); save(); },
      labChanged: () => { if (editor.value !== curFile().code) editor.value = curFile().code; renderTabs(); renderStatusBar(); renderExBar(); renderAsgBar(); },
      openInEditor: (l, name, text, copy) => { if (!hasLang(l)) return; let idx = copy ? -1 : S.files[l].findIndex(f => f.name === name); if (idx < 0) { S.files[l].push({ name: uniqueName(l, name), code: text }); idx = S.files[l].length - 1; } S.active[l] = idx; save(); if (l !== S.lang) switchLang(l); else activate(idx); },
      onClose: () => toggleTerm(false)
    }) : null;
    function toggleTerm(force) { if (!term) return; const show = force != null ? force : term.el.hidden; if (show) term.show(!isTouch()); else term.hide(); termBtn.classList.toggle('on', show); S.panels.term = show; save(); if (show && term.el.scrollIntoView) term.el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    const stdinTa = el('textarea', { class: 'stdin-ta', rows: 3, placeholder: 'Type each value the program will read, one per line, before pressing Run.', 'aria-label': 'Program input' });
    const stdinBox = el('div', { class: 'stdin-box', hidden: '' }, el('div', { class: 'panel-head' }, el('b', {}, 'Program input'), el('span', { class: 'panel-note' }, 'This program reads input with cin. C++ programs read all of it at once, so give it here.')), stdinTa);
    const turtleMount = el('div', { id: 'lab-turtle', class: 'turtle-mount' });
    const turtleBox = el('div', { class: 'turtle-box', hidden: '' }, el('div', { class: 'panel-head' }, el('b', {}, 'Turtle canvas'), el('button', { class: 'btn quiet', onclick: () => { turtleBox.hidden = true; } }, '×')), turtleMount);
    const traceVars = el('div', { class: 'trace-vars' });
    const traceMsg = el('span', { class: 'panel-note' });
    const traceNext = el('button', { class: 'btn primary', onclick: () => tracer && tracer.next() }, 'Next line');
    const traceRun = el('button', { class: 'btn', onclick: () => tracer && tracer.finish() }, 'Run to end');
    const traceStop = el('button', { class: 'btn quiet', onclick: () => tracer && tracer.stop() }, 'Stop');
    const traceRestart = el('button', { class: 'btn quiet', onclick: () => { if (tracer) tracer.stop(); setTimeout(startTrace, 50); } }, 'Restart');
    const traceBox = el('div', { class: 'trace-box', hidden: '', tabindex: '0' }, el('div', { class: 'panel-head' }, el('b', {}, 'Step through'), traceMsg), el('div', { class: 'toolbar' }, traceNext, traceRun, traceRestart, traceStop, el('span', { class: 'panel-note' }, 'Enter or N: next line')), traceVars);
    traceBox.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === 'n' || e.key === 'N') && tracer) { e.preventDefault(); tracer.next(); } });
    const repl = makeRepl();
    const replBox = el('div', { class: 'repl-box', hidden: S.lang !== 'scheme' ? '' : null }, el('div', { class: 'panel-head' }, el('b', {}, 'REPL'), el('span', { class: 'panel-note' }, 'Type an expression and press Enter. Run the file first to load its definitions. ↑ ↓ recall earlier lines.')), repl.el);

    // ----- running
    function setRunning(on) { running = on; runBtn.disabled = on; stopBtn.hidden = !on || S.lang === 'scheme'; stepBtn.disabled = on; memBtn.disabled = on; status.textContent = on ? 'running…' : ''; }
    function explain(lang, err) { const tip = tipFor(lang, err); for (const [re, msg] of EXPLAIN[lang] || []) if (re.test(err)) return msg; return tip; }
    function showError(lang, err) {
      out.error(err);
      const m = err.match(/line (\d+)/i) || err.match(/main\.cpp:(\d+):\d+/) || err.match(/\.java:(\d+)/);
      if (m) { const pre = out.el.querySelector('.out-text'); pre.append(el('button', { class: 'linklike goto', onclick: () => editor.goToLine(+m[1]) }, '→ go to line ' + m[1]), '\n'); }
      const ex = explain(lang, err); if (ex) out.note('↳ ' + ex);
    }
    async function run() {
      if (running) return; if (tracer) tracer.stop(); endMem();
      const lang = S.lang, code = editor.value; out.start((window.__app.COMMANDS || {})[lang === 'cpp' && isFull() ? 'cppfull' : lang] || '');
      let exit = 0, stopped = false;
      const reads = lang === 'cpp' ? /\bcin\b/.test(code) : lang === 'java' ? /\bScanner\b/.test(code) : false;
      if (reads) { stdinBox.hidden = false; if (!stdinTa.value.trim() && !stdinTa.dataset.warned) { stdinTa.dataset.warned = '1'; out.note('This program reads input with ' + (lang === 'java' ? 'a Scanner' : 'cin') + '. Type the values in the Program input box, one per line, then Run again.'); stdinTa.focus(); return; } }
      setRunning(true);
      try {
        if (lang === 'python') {
          const usesTurtle = usesTurtleIn(code);
          const r = await window.PYRUN.run(code, { execLimit: 15000, onOutput: (s) => out.write(s), onInput: (p) => out.ask(p), turtle: usesTurtle ? turtleOptions() : undefined });
          if (r.err) showError('python', r.err); else if (!r.out && !usesTurtle) out.note('(the program finished without printing anything)');
          stopped = /stopped|cancel/i.test(r.err || '') && !r.out;
        } else if (lang === 'scheme') {
          repl.reset();
          const r = repl.loadProgram(code, (s) => out.write(s));
          for (const res of r.results) out.value(res.text === '' ? ';Unspecified return value' : ';Value: ' + res.text);
          if (r.error) showError('scheme', ';' + r.error.replace(/^;/, ''));
          out.note(r.error ? 'stopped; definitions before the error are available in the REPL' : 'definitions loaded into the REPL');
          if (!isTouch()) repl.focus();
        } else if (lang === 'cpp' && isFull()) {
          const r = await Runners.cppFull.run(code, { onOutput: (s) => out.write(s), onNote: (s) => out.note(s), stdin: stdinTa.value, std: S.cppStd, host: out.el });
          if (r.err) showError('cppfull', r.err); else if (!r.out) out.note('(the program finished without printing anything)');
          if (r.exit) out.note('(the program ended with status ' + r.exit + ')');
          exit = r.exit || 0;
        } else if (lang === 'cpp') {
          const r = await Runners.cpp.run(code, { onOutput: (s) => out.write(s), stdin: stdinTa.value });
          if (r.err) showError('cpp', r.err); else if (!r.out) out.note('(the program finished without printing anything)');
        } else if (lang === 'java') {
          const r = await Runners.java.run(code, { onOutput: (s) => out.write(s), stdin: stdinTa.value });
          if (r.err) showError('java', r.err); else if (!r.out) out.note('(the program finished without printing anything)');
        }
      } catch (e) { out.error(String(e && e.message || e)); }
      out.finish({ exit, stopped });
      setRunning(false);
    }
    // Python, C++ and Java run in sandboxes (src/runner.js): a Web Worker each, or for turtle drawing a sandboxed iframe. Neither can reach this
    // page, its storage or the network, and Stop ends them at once, even in a loop that never yields.
    const usesTurtleIn = (code) => /\b(import\s+turtle|from\s+turtle\s+import)\b/.test(code);
    function turtleOptions() { turtleBox.hidden = false; turtleMount.textContent = ''; if (turtleBox.scrollIntoView) turtleBox.scrollIntoView({ block: 'nearest' });   // the browser pauses the drawing of a frame that is off screen
     return { mount: turtleMount, width: Math.min(560, turtleMount.clientWidth || 560), height: 360 }; }
    function stop() { window.PYRUN.cancel(); window.CPPRUN.cancel(); window.JAVARUN.cancel(); window.CLANGRUN.cancel(); }

    // ----- Python tracer
    function startTrace() {
      if (running) return; if (tracer) tracer.stop();
      const code = editor.value; out.clear(); traceBox.hidden = false; traceVars.innerHTML = ''; traceMsg.textContent = 'starting…';
      const usesTurtle = usesTurtleIn(code);
      setRunning(true); stepBtn.disabled = true; runBtn.disabled = true; if (!isTouch()) traceBox.focus();
      const onStep = (st) => {
        editor.setTrace(st.line);
        traceVars.innerHTML = '';
        traceVars.append(el('table', { class: 'fill vars' }, el('thead', {}, el('tr', {}, el('th', {}, 'name'), el('th', {}, 'value'))), el('tbody', {}, st.vars.length ? st.vars.map(([k, v]) => el('tr', {}, el('td', {}, el('code', {}, k)), el('td', {}, el('code', {}, v)))) : el('tr', {}, el('td', { colspan: 2, class: 'muted' }, 'no variables yet')))));
        traceMsg.textContent = 'about to run line ' + st.line + (st.depth > 1 ? ' (inside a function, depth ' + st.depth + ')' : '');
      };
      const t = window.PYRUN.trace(code, { onStep, onOutput: (s) => out.write(s), onInput: (p) => out.ask(p), turtle: usesTurtle ? turtleOptions() : undefined });
      tracer = { next() { traceMsg.textContent = 'running line…'; t.next(); }, finish() { editor.setTrace(0); t.finish(); }, stop() { t.stop(); } };
      t.done.then((r) => {
        if (r.err === 'Stopped.') traceMsg.textContent = 'stopped';
        else if (r.err) { traceMsg.textContent = 'error'; showError('python', r.err); }
        else traceMsg.textContent = 'finished';
        tracer = null; editor.setTrace(0); setRunning(false); traceNext.disabled = false;
      });
    }

    // ----- C++ memory stepper (CPPSTEP records the whole run, so stepping can go backwards too)
    const memView = el('div', { class: 'mem-view' });
    const memMsg = el('span', { class: 'panel-note' });
    const memSlider = el('input', { type: 'range', min: '0', max: '0', value: '0', class: 'mem-slider', 'aria-label': 'Step' });
    const memBack = el('button', { class: 'btn', title: 'Back one line (B or \u2190)', onclick: () => memShow(memIdx - 1) }, '\u25C0 Back');
    const memNext = el('button', { class: 'btn primary', title: 'Next line (N, Enter or \u2192)', onclick: () => memShow(memIdx + 1) }, 'Next \u25B6');
    const memEnd = el('button', { class: 'btn', onclick: () => memTrace && memShow(memTrace.steps.length - 1) }, 'To the end');
    const memRestart = el('button', { class: 'btn quiet', onclick: () => startMem() }, 'Restart');
    const memClose = el('button', { class: 'btn quiet', onclick: () => endMem() }, 'Close');
    const memBox = el('div', { class: 'mem-box', hidden: '', tabindex: '0' },
      el('div', { class: 'panel-head' }, el('b', {}, 'Memory'), memMsg),
      el('div', { class: 'toolbar' }, memBack, memNext, memSlider, memEnd, memRestart, memClose),
      el('p', { class: 'panel-note mem-help' }, 'Each function call gets its own frame. Addresses are invented but laid out the way a compiler would. Changed values are highlighted; point at a pointer to see what it points to. Keys: N or \u2192 next, B or \u2190 back.'),
      memView);
    memSlider.addEventListener('input', () => memShow(+memSlider.value));
    memBox.addEventListener('keydown', (e) => {
      if (!memTrace || e.target === memSlider) return;
      if (e.key === 'Enter' || e.key === 'n' || e.key === 'N' || e.key === 'ArrowRight') { e.preventDefault(); memShow(memIdx + 1); }
      else if (e.key === 'b' || e.key === 'B' || e.key === 'ArrowLeft') { e.preventDefault(); memShow(memIdx - 1); }
    });
    async function startMem() {
      if (running || !window.CPPSTEP || !window.CPPRUN) return; if (tracer) tracer.stop();
      const code = editor.value;
      if (/\bcin\b/.test(code)) { stdinBox.hidden = false; if (!stdinTa.value.trim()) { out.clear(); out.note('This program reads input with cin. Type the values in the Program input box, one per line, then press Step through memory again.'); stdinTa.focus(); return; } }
      const token = ++memToken;
      out.clear(); memBox.hidden = false; memView.innerHTML = ''; memMsg.textContent = 'running the program…'; setRunning(true);
      let r; try { r = await window.CPPRUN.trace(code, stdinTa.value, { maxSteps: 1500 }); } finally { setRunning(false); }
      if (token !== memToken) return;   // closed, or the program changed, while it ran
      memTrace = r.result && Array.isArray(r.result.steps) ? r.result : { steps: [], output: '', error: r.err || 'The program could not be run.' };
      if (!memTrace.steps.length) { memView.innerHTML = ''; memMsg.textContent = 'the program could not start'; memSlider.max = '0'; if (memTrace.error) showError('cpp', memTrace.error); editor.setTrace(0); return; }
      memSlider.max = String(memTrace.steps.length - 1);
      memShow(0);
      if (!isTouch()) memBox.focus();
    }
    function memShow(i) {
      if (!memTrace) return;
      const n = memTrace.steps.length; i = Math.max(0, Math.min(n - 1, i)); memIdx = i;
      const st = memTrace.steps[i];
      window.CPPSTEP.render(memView, memTrace, i);
      memSlider.value = String(i);
      memBack.disabled = i === 0; memNext.disabled = i === n - 1; memEnd.disabled = i === n - 1;
      memMsg.textContent = window.CPPSTEP.describe(memTrace, i);
      editor.setTrace(st.done ? 0 : (i === n - 1 && memTrace.error ? (memTrace.errorLine || st.line) : st.line));
      out.clear();
      const shown = memTrace.output.slice(0, st.outLen);
      if (shown) out.write(shown);
      if (i === n - 1) {
        if (memTrace.error) showError('cpp', memTrace.error);
        else if (memTrace.truncated) out.note('Stepping stops after ' + n + ' lines. Press Run to run the whole program.');
        else if (!shown) out.note('(nothing printed)');
      } else if (!shown) out.hide();
    }
    function endMem(msg) {
      if (!memTrace && memBox.hidden) return;
      memToken++; memTrace = null; memBox.hidden = true; memView.innerHTML = ''; editor.setTrace(0);
      if (msg) status.textContent = msg, setTimeout(() => { if (status.textContent === msg) status.textContent = ''; }, 6000);
    }

    // ----- Scheme substitution model
    const substList = el('div', { class: 'subst-list' });
    const substMsg = el('span', { class: 'panel-note' });
    const substNext = el('button', { class: 'btn primary', onclick: () => substShow(1) }, 'Next step');
    const substAll = el('button', { class: 'btn', onclick: () => substShow(Infinity) }, 'Show all');
    const substRestart = el('button', { class: 'btn quiet', onclick: () => startSubst() }, 'Restart');
    const substBox = el('div', { class: 'subst-box', hidden: '', tabindex: '0' }, el('div', { class: 'panel-head' }, el('b', {}, 'Substitution model'), substMsg), el('div', { class: 'toolbar' }, substNext, substAll, substRestart, el('button', { class: 'btn quiet', onclick: () => { substBox.hidden = true; } }, 'Close'), el('span', { class: 'panel-note' }, 'Enter or N: next step')), substList);
    substBox.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === 'n' || e.key === 'N') { e.preventDefault(); substShow(1); } });
    let substQueue = [], substShown = 0;
    function startSubst() {
      if (!window.SUBST) return;
      substBox.hidden = false; substList.innerHTML = ''; substQueue = []; substShown = 0;
      const outputs = [];
      const tr = window.SUBST.create({ maxSteps: 300, onOutput: (s) => outputs.push(s) });
      const t = tr.traceProgram(editor.value);
      for (const item of t.items) {
        if (item.kind === 'define') { substQueue.push(el('div', { class: 'sub-def' }, el('code', { html: item.html }), el('span', { class: 'sub-note' }, item.note))); continue; }
        substQueue.push(el('div', { class: 'sub-head' }, el('code', {}, item.source)));
        item.steps.forEach((st, i) => substQueue.push(el('div', { class: 'sub-step' + (st.final ? ' final' : '') + (st.error ? ' error' : '') }, el('span', { class: 'sub-n' }, String(i + 1)), el('code', { html: st.html }), el('span', { class: 'sub-note' }, st.note))));
      }
      if (t.error && !t.items.length) substQueue.push(el('div', { class: 'sub-step error' }, el('span', { class: 'sub-note' }, 'error: ' + t.error)));
      if (outputs.length) substQueue.push(el('div', { class: 'sub-def' }, el('span', { class: 'sub-note' }, 'printed while evaluating: ' + JSON.stringify(outputs.join('')))));
      substMsg.textContent = substQueue.length ? 'Each line rewrites the expression by one step. The part about to be reduced is highlighted; the result of the previous step is underlined.' : 'Nothing to trace: the file has no expressions.';
      substShow(1); if (!isTouch()) substBox.focus();
    }
    function substShow(n) {
      let shown = 0;
      while (substShown < substQueue.length && shown < n) { const row = substQueue[substShown++]; substList.append(row); if (row.classList.contains('sub-step')) shown++; }
      const done = substShown >= substQueue.length; substNext.disabled = done; substAll.disabled = done;
      if (done && substQueue.length) substMsg.textContent = 'Finished: ' + substQueue.filter(r => r.classList.contains('sub-step')).length + ' steps.';
      const last = substList.lastElementChild; if (last && last.scrollIntoView && !isTouch()) last.scrollIntoView({ block: 'nearest' });
    }

    // ----- Scheme REPL
    function makeRepl() {
      const Scheme = window.Scheme;
      const log = el('pre', { class: 'repl-log' });
      const inp = el('textarea', { class: 'repl-inp', rows: 1, placeholder: '(+ 1 2)', 'aria-label': 'REPL input', spellcheck: 'false', autocapitalize: 'off' });
      const box = el('div', { class: 'repl' }, log, el('div', { class: 'repl-line' }, el('span', { class: 'repl-prompt' }, '1 ]=>'), inp));
      let it = null, history = [], hIdx = 0, pending = '', sink = null;   // sink: where display output goes during a file load
      const fresh = () => { it = Scheme.makeEvaluator({ onOutput: (s) => sink ? sink(s) : log.append(s), stepLimit: 2e7 }); };
      fresh();
      const balanced = (s) => { let d = 0, inStr = false; for (let i = 0; i < s.length; i++) { const c = s[i]; if (inStr) { if (c === '\\') i++; else if (c === '"') inStr = false; continue; } if (c === '"') inStr = true; else if (c === ';') { i = s.indexOf('\n', i); if (i < 0) break; } else if (c === '(') d++; else if (c === ')') d--; } return d <= 0 && !inStr; };
      const evalText = (text) => {
        log.append(el('span', { class: 'repl-in' }, '1 ]=> ' + text + '\n'));
        try {
          const forms = Scheme.parseAll(text);
          it.reset();   // every entry gets a fresh step budget; otherwise a long session ends with "ran for too long" for everything
          for (const f of forms) { const v = it.evaluate(f, it.G); const t = Scheme.write(v); log.append(el('span', { class: 'val' }, t === '' ? ';Unspecified return value' : ';Value: ' + t), '\n'); }
        } catch (e) { const msg = e instanceof RangeError ? ';Aborting!: maximum recursion depth exceeded' : (e instanceof Scheme.SchemeError ? e.message : 'Internal error: ' + e.message); log.append(el('span', { class: 'err' }, ';' + msg.replace(/^;/, '')), '\n'); const ex = explain('scheme', msg); if (ex) log.append(el('span', { class: 'note' }, '↳ ' + ex), '\n'); }
        log.scrollTop = log.scrollHeight;
      };
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          const text = (pending + inp.value).trim();
          if (!text) { e.preventDefault(); return; }
          if (!balanced(pending + inp.value)) { pending += inp.value + '\n'; inp.value = ''; inp.placeholder = '… (continue the expression)'; e.preventDefault(); return; }
          e.preventDefault(); pending = ''; inp.placeholder = '(+ 1 2)'; history.push(text); hIdx = history.length; inp.value = ''; evalText(text);
        } else if (e.key === 'ArrowUp' && !inp.value.includes('\n')) { if (hIdx > 0) { hIdx--; inp.value = history[hIdx]; e.preventDefault(); } }
        else if (e.key === 'ArrowDown') { if (hIdx < history.length) { hIdx++; inp.value = history[hIdx] || ''; e.preventDefault(); } }
      });
      return {
        el: box, focus: () => inp.focus(),
        reset() { fresh(); log.innerHTML = ''; pending = ''; },
        loadProgram(code, onOutput) {
          fresh(); sink = onOutput;
          let error = null; const results = [];
          try { for (const f of Scheme.parseAll(code)) { const v = it.evaluate(f, it.G); results.push({ text: Scheme.write(v) }); } }
          catch (e) { error = e instanceof RangeError ? 'Aborting!: maximum recursion depth exceeded' : (e instanceof Scheme.SchemeError ? e.message : 'Internal error: ' + e.message); }
          sink = null;
          return { results, error };
        }
      };
    }

    // ----- share / open / save
    function share() {
      const f = curFile(); const url = location.href.split('#')[0] + '#/lab?l=' + S.lang + '&n=' + encodeURIComponent(f.name) + '&c=' + b64e(f.code);
      const done = (ok) => { status.textContent = ok ? 'link copied to the clipboard' : 'copy this link: ' + url; setTimeout(() => { if (status.textContent.startsWith('link') || status.textContent.startsWith('copy')) status.textContent = ''; }, ok ? 3000 : 15000); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(() => done(true), () => done(false)); else done(false);
      out.clear(); out.note('Share link (anyone who opens it gets a copy of this file in their Code Lab):'); out.write(url + '\n');
    }
    function download() {
      const f = curFile(); const blob = new Blob([f.code], { type: 'text/plain' }); const a = el('a', { href: URL.createObjectURL(blob), download: f.name }); document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      status.textContent = 'saved ' + f.name; setTimeout(() => { if (status.textContent.startsWith('saved')) status.textContent = ''; }, 3000);
    }
    function openFiles(e) {
      const files = [...e.target.files]; if (!files.length) return;
      let last = -1;
      files.forEach((file) => file.text().then((text) => {
        const ext = (file.name.match(/\.\w+$/) || [''])[0].toLowerCase();
        const l = ext === '.py' ? 'python' : ['.cpp', '.cc', '.cxx', '.h'].includes(ext) ? 'cpp' : ext === '.java' ? 'java' : ['.scm', '.ss', '.rkt'].includes(ext) ? 'scheme' : S.lang;
        S.files[l].push({ name: uniqueName(l, file.name), code: text }); last = S.files[l].length - 1;
        if (l !== S.lang) { S.active[l] = last; switchLang(l); } else activate(last);
      }));
      e.target.value = '';
    }

    // ----- assemble
    const head = el('header', { class: 'lab-head' },
      el('div', {}, el('h1', {}, 'Code Lab'), el('p', { class: 'lab-sub' }, 'A place to write and run your own programs. Everything runs in your browser; files are saved on this device.')),
      el('div', { class: 'lab-head-right' }, el('a', { class: 'lab-guide-link', href: '#/guide' }, 'Guide for teachers'), teach ? teach.teacherSwitch : null, langBar));
    const help = el('details', { class: 'lab-help' }, el('summary', {}, 'Keyboard shortcuts and tips'),
      el('div', { class: 'prose', html: `<ul>
<li><b>Ctrl/Cmd + Enter</b> runs the program. <b>Ctrl/Cmd + Z</b> and <b>Ctrl/Cmd + Y</b> undo and redo. <b>Ctrl/Cmd + F</b> finds, <b>Ctrl/Cmd + H</b> finds and replaces, <b>Ctrl/Cmd + /</b> comments or uncomments the selected lines.</li>
<li><b>Tab</b> indents (four spaces; two in Scheme) and <b>Shift + Tab</b> outdents; with several lines selected it indents them all. Enter after a colon or brace indents the next line for you. <b>Alt + ↑/↓</b> moves the current line, <b>Ctrl/Cmd + D</b> duplicates it, <b>Ctrl/Cmd + S</b> downloads the file.</li>
<li>Brackets and quotes close themselves; type the closing one to skip over it. The matching bracket is highlighted when the cursor is next to one.</li>
<li>Start typing a name and a list of completions appears: <b>↑ ↓</b> to choose, <b>Tab</b> or <b>Enter</b> to accept, <b>Esc</b> to dismiss.</li>
<li><b>+ New</b> makes a file and asks for its name; <b>Rename</b> is under the editor (double-clicking a tab also works). <b>Save</b> downloads the file; <b>Open</b> loads files from your device; <b>Share link</b> copies a link that carries the program inside it. Errors that mention a line number have a "go to line" link.</li>
<li>Python: <b>Step through</b> runs one line at a time and shows the variables. <code>import turtle</code> opens a drawing canvas. <b>Stop</b> ends a program that is stuck in a loop.</li>
<li>Scheme: Run loads the file's definitions, then use the REPL below the output to try expressions one at a time. <b>Substitution</b> shows the substitution model from SICP: each expression is rewritten one step at a time, exactly the way the Lisp course draws it.</li>
<li><b>Teacher tools</b> (the switch at the top) let a teacher write an assignment with tests and share it as a link or QR code; students <b>Check</b> their work against the visible tests and <b>Submit</b>, which makes a link carrying their program. The teacher opens submission links in her own Code Lab, where hidden tests run and a grade book collects the results. Nothing is sent to any server.</li>
<li>Every code example and exercise in the courses has an <b>Open in Code Lab</b> button. A file opened from an exercise keeps its link to it: a bar above the editor lets you check your program against the exercise's tests, and passing counts as completing it in the course.</li>
<li>C++: <b>Step through memory</b> runs the program one line at a time and shows every variable in memory: its type, its address and its value, with arrays drawn cell by cell and pointers showing what they point at. You can step backwards as well as forwards.</li>
<li>C++: programs that read with <code>cin</code> take their input from the Program input box. C++ and Scheme programs stop themselves after a few seconds if they run too long.</li>
<li><b>Terminal</b> opens a command line under the output: a practice Unix shell with its own files (saved on this device). Your Code Lab files appear in its <code>lab</code> folder, so <code>python lab/main.py</code> runs the file in the editor; <code>nano</code> edits a file there, <code>edit file.py</code> opens it in the editor above. Type <code>help</code> for the list of commands; <b>Tab</b> completes names, <b>↑ ↓</b> recall commands, <b>Ctrl+C</b> stops a program.</li>
<li>On a phone or tablet, the <b>Indent</b> and <b>Outdent</b> buttons under the editor stand in for the Tab key, and <b>Wrap</b> keeps long lines on screen.</li></ul>` }));
    const editorArea = el('div', { class: 'lab-editor-area' }, tabs, findBar, editor.el, statusBar);
    const side = el('div', { class: 'lab-side' }, tplBox, refBox);
    const body = el('div', { class: 'lab-body' }, el('div', { class: 'lab-main' }, teach ? teach.panel : null, asgHost, exBar, toolbar, editorArea, exVerdict, stdinBox, out.el, term ? term.el : null, traceBox, memBox, substBox, turtleBox, replBox), side);
    renderTabs(); renderToolbar(); applyWrap(); renderStatusBar(); renderExBar(); renderAsgBar(); engineChanged();
    if (term && S.panels.term) { term.show(false); termBtn.classList.add('on'); }
    if (pendingStep) {
      const ps = pendingStep; pendingStep = null;
      if (ps.mode === 'mem' && S.lang === 'cpp') { if (ps.stdin != null) { stdinTa.value = ps.stdin; stdinBox.hidden = false; } setTimeout(startMem, 0); }
      if (ps.mode === 'subst' && S.lang === 'scheme') setTimeout(startSubst, 0);
    }
    if (teach && (kind === 'assign' || kind === 'review' || /(^|&)b=/.test(query || ''))) setTimeout(() => teach.handleQuery(kind, query), 0);
    main.append(head, help, body, el('footer', { class: 'foot' }, el('span', {}, (window.SITE || {}).footer || ''), el('button', { class: 'linklike', onclick: (e) => armConfirm(e.currentTarget, 'Delete all Code Lab files on this device (and the terminal\'s)? Click again to confirm', () => { try { localStorage.removeItem(KEY); if (window.TERMINAL) localStorage.removeItem(window.TERMINAL.KEY); } catch (err) { } S = null; location.reload(); }) }, 'Reset the Code Lab')));
    setTimeout(() => editor.render(), 0);
    return main;
  }

  let pendingStep = null;   // set by openCode({step: true} or {subst: true}); consumed by page()
  /** Called from the courses: put code into the Lab as a new file and go there.
      o.step opens the C++ memory stepper; o.subst opens the Scheme substitution panel. */
  function openCode(o) {
    load();
    pendingStep = o.step ? { mode: 'mem', stdin: o.stdin } : (o.subst ? { mode: 'subst' } : null);
    const l = o.lang === 'lisp' ? 'scheme' : o.lang; if (!hasLang(l)) return;
    const files = S.files[l];
    let idx = -1;
    if (o.ex) idx = files.findIndex(f => f.ex && f.ex.id === o.ex.id);   // one file per exercise: reopen it (keeping the student's Lab edits) rather than duplicate
    if (idx >= 0) { if (files[idx].code.trim() === '' || files[idx].code === o.code) files[idx].code = o.code; }
    else { files.push({ name: uniqueNameFor(l, (o.name || 'from-course') + LANG_INFO[l].ext), code: o.code, ex: o.ex || undefined }); idx = files.length - 1; }
    if (l === 'cpp' && o.runtime === 'full') S.fullCpp = true;
    S.lang = l; S.active[l] = idx; save();
    location.hash = '#/lab';
  }
  function uniqueNameFor(l, name) { const names = S.files[l].map(f => f.name); let n = name, i = 2; const base = name.replace(/(\.\w+)$/, ''), ext = (name.match(/\.\w+$/) || [''])[0]; while (names.includes(n)) n = base + i++ + ext; return n; }
  function findExercise(id) {
    for (const c of window.COURSES || []) for (const [li, lesson] of c.lessons.entries()) for (const b of lesson.blocks) if (b && b.ex && b.ex.id === id) { b.ex.lang = b.ex.lang || c.lang; b.ex.runtime = b.ex.runtime || c.runtime; return { ex: b.ex, course: c, lessonIdx: li, lesson }; }
    return null;
  }
  window.LAB = { page, openCode, TEMPLATES, REFERENCE };
})();
