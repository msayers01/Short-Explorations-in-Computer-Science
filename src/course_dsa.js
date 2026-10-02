// Lesson content, (c) 2026 Michael Sayers, licensed CC BY-SA 4.0 (see LICENSE-CONTENT.md).
// Data Structures and Algorithms, in Java, on the site's own interpreter (src/java.js). Every structure and algorithm is shown three ways:
// an interactive figure to step through (src/widgets.js: growth, arrayops, dynarray, search, sortlab, mergeviz, partition, linkedlist, stackqueue, callstack), code to write, and a cost to count.
window.COURSES = window.COURSES || [];
window.COURSES.push({
  id: 'dsa', code: 'SC 107', short: 'DSA', lang: 'java', status: 'developing',
  title: 'Data Structures and Algorithms',
  grades: 'Grades 11–12 · after Java, or C++ with the Java primer',
  audience: `<p><b>Grades 11–12</b>, after <em>Introduction to Java</em> (SC 106) or after <em>Introduction to C++</em> and lesson 1 of SC 106. This is the course that every computer science degree puts second: how data is arranged in memory, what each arrangement makes cheap and what it makes expensive, and how to tell, before running anything, how a program's running time will grow with its input. It is the material of technical interviews, of the second AP exam's hardest questions, and of every system that has to stay fast as it grows.</p><p>The code is Java, but every idea transfers unchanged to any language. Each lesson has interactive figures you can step through, code you write, and costs you count. The course is being written: the first seven lessons are here.</p>`,
  tagline: 'How data is arranged, what each arrangement costs, and how to know before you run it: arrays, searching, sorting, and the measure of growth.',
  description: `<p>Two programs can give the same answer and differ in running time by a factor of a billion. The difference is rarely the computer, the language or how neatly the code is written. It is the <em>arrangement</em> of the data and the <em>method</em> that works on it: a data structure and an algorithm. Choosing them is the part of programming that separates a program that works on the test file from one that still works when the file is a million times bigger.</p>
<p>This course teaches the classical structures (arrays, lists, stacks, queues, hash tables, trees, graphs) and the classical algorithms on them (searching, sorting, traversal), and, more than any one of them, the habit of asking <em>how does the cost grow?</em> and the tools to answer it. Everything is shown three ways: as a picture you can step through one operation at a time, as Java code you write and check, and as a count of steps you can predict and then measure.</p>
<p>Programs run in the Java interpreter built into this site, instantly and offline. It is slower than a real machine, so experiments use thousands of items where a laptop would use millions; the shapes of the curves are the same, and that is what matters.</p>`,
  outcomes: [
    'Count the steps an algorithm takes as a function of its input size, and name its order of growth',
    'Explain what an array makes cheap (indexing) and expensive (inserting), and why a growing array doubles',
    'Write and prove binary search, and recognise the overflow bug that hid in it for twenty years',
    'Write selection and insertion sort, count their comparisons and moves, and say when each is the right choice',
    'Write merge sort and quicksort, explain why halving gives n log n, and say what each one guarantees and what it risks',
    'Build a linked list from nodes, give the cost of each operation, and say when it beats an array (rarely) and why it still matters',
    'Implement a stack and a ring-buffer queue in O(1) per operation, and know what each is for',
    'Write a recursive method with a sound base case, trace its call stack, and know when a memo or a loop is needed instead',
    'Predict a running time from a doubling experiment, and check a prediction by measuring',
    'Choose a structure for a task by the operations the task needs most'
  ],
  howItWorks: `<h3>How to use these pages</h3><p>Each lesson has three kinds of thing to do. <b>Figures</b> with Step and Play buttons show a structure changing one operation at a time; use them until you can predict the next step. <b>Code</b> boxes run in your browser; change the sizes and watch the counts. <b>Exercises</b> are of two kinds: programs the checker runs on hidden inputs, and questions with a number for an answer, which the checker also marks. Where an exercise asks for a method, write only the method, with the word <code>static</code>; the checker supplies the class and a <code>main</code>.</p><p>You need the Java of SC 106 lessons 1–4: types, loops, methods, and arrays, which lesson 1 here introduces as it goes. Classes appear from lesson 4 on and are explained where they appear.</p>`,
  lessons: [
    /* ================================================================== */
    {
      title: 'Counting the cost', summary: 'Why speed is a property of the method, not the machine; the array, what it makes cheap and expensive; how a growing array grows; and the orders of growth that describe every algorithm in this course.',
      blocks: [
        `<p>The United States counts its population every ten years, and by 1880 the count had become the largest data-processing job in the world: fifty million people, each with a dozen facts to record, every total worked out by clerks with pencils and tally sheets. The tabulation of the 1880 census took most of the decade. The Census Office could see that the 1890 count would not be finished before the 1900 count began. A young engineer who had worked on the 1880 census, Herman Hollerith, proposed a different arrangement of the data: each person's facts punched as holes in a card, and machines that could read the holes and count them electrically. The cards for the 1890 census were run through his tabulators, and the population total was announced within months. The company Hollerith founded to sell the machines later became part of IBM.</p>`,
        { photo: 'hollerith-1890-census', caption: 'Hollerith\'s machines at work on the 1890 census, from <i>Scientific American</i>, August 1890. Each card goes into the press on the desk; wherever a pin finds a hole, a dial on the cabinet above moves on by one.' },
        `<p>The lesson usually drawn from this is that machines are faster than people. The lesson that matters for this course is different. Hollerith's machines did not count faster because the electricity was quick; they counted faster because a card could be <em>sorted and counted in one pass</em>, and the pencil method could not. The arrangement of the data decided the cost. Sixty years later, when computers arrived, the same thing turned out to be true inside them: for most problems the computer's speed is fixed and the arrangement is the only thing you control. This course is about that arrangement.</p>
<h2>Measure steps, not seconds</h2>
<p>How long does a program take? In seconds, that depends on the computer, on what else it is doing, and on the day. What does <em>not</em> depend on any of that is the number of basic steps the program performs: an addition, a comparison, a look into an array. So that is what we count. And we count it not for one input but as a <em>function of the input's size</em>, usually written <code>n</code>: a program that takes 1,000 steps for 10 items and 1,000,000 for 1,000 items is telling you something a stopwatch cannot.</p>
<p>The three methods below each add up something about an array of <code>n</code> numbers. Each counts its own steps. Run it, then change <code>n</code> to 100 and to 1000, and watch how each count grows.</p>`,
        { play: `public class Main {
    static long steps;

    static int first(int[] a) {               // one step, whatever n is
        steps++;
        return a[0];
    }

    static int sum(int[] a) {                 // one step per item
        int total = 0;
        for (int i = 0; i < a.length; i++) {
            total += a[i];
            steps++;
        }
        return total;
    }

    static int pairs(int[] a) {               // one step per pair of items
        int count = 0;
        for (int i = 0; i < a.length; i++) {
            for (int j = i + 1; j < a.length; j++) {
                if (a[i] + a[j] == 10) count++;
                steps++;
            }
        }
        return count;
    }

    public static void main(String[] args) {
        int n = 10;
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = i % 7;
        steps = 0; first(a); System.out.println("first:  " + steps + " steps");
        steps = 0; sum(a);   System.out.println("sum:    " + steps + " steps");
        steps = 0; pairs(a); System.out.println("pairs:  " + steps + " steps");
    }
}`, caption: 'For n = 10: 1, 10 and 45 steps. For n = 100: 1, 100 and 4,950. For n = 1000: 1, 1000 and 499,500. Multiply n by 10 and the three counts multiply by 1, 10 and about 100.' },
        `<p>The three shapes have names, and most of this course is about telling them apart. <code>first</code> takes a <em>constant</em> number of steps: the input could be a billion items and it would still be one. <code>sum</code> takes a number of steps <em>proportional to n</em>: double the input, double the work. <code>pairs</code> takes about <code>n²/2</code> steps, <em>proportional to n²</em>: double the input, four times the work. Here they are side by side, with the other shapes you will meet.</p>`,
        { fig: 'growth', caption: 'Tick the curves on and off and drag the range. Every curve below n² looks flat next to 2ⁿ; next to n², even n log n looks tame. The table underneath turns the counts into time at a billion steps a second: n² is fine for a thousand items and hopeless for a billion.' },
        `<div class="stmt"><p><span class="kind">Definition (order of growth).</span> When the number of steps is at most a constant times <code>f(n)</code> for all large <code>n</code>, we say the algorithm takes <b>O(f(n))</b> steps, read "order f of n". Constants and smaller terms are dropped: <code>3n + 7</code> is O(n), <code>n²/2 + n</code> is O(n²). The O says how the cost <em>grows</em>, not what it is.</p>
<p><span class="kind">The shapes, from cheapest to dearest.</span> O(1) constant · O(log n) logarithmic, halving · O(n) linear · O(n log n) · O(n²) quadratic · O(2ⁿ) exponential. Multiplying <code>n</code> by 10 leaves O(1) alone, adds only about 3.3 steps to O(log n), multiplies O(n) by 10, O(n log n) by a little more than 10, O(n²) by 100, and O(2ⁿ) by more than the number of atoms in the universe.</p></div>
<p>Why drop the constants? Because they are the part the machine decides. A faster computer, a better compiler or a tighter loop divides the time by a constant; it cannot change the shape. A method that is O(n²) on a supercomputer loses to one that is O(n log n) on a phone once <code>n</code> is large enough, and "large enough" comes sooner than people expect.</p>
<h2>Reading the shape off the code</h2>
<p>You rarely need to count exactly. Three rules give the order of growth of most code at a glance.</p>
<div class="stmt"><p><span class="kind">Rule 1.</span> A loop that runs <code>n</code> times, doing constant work each time, is O(n). Two such loops one after the other are still O(n).</p>
<p><span class="kind">Rule 2.</span> A loop <em>inside</em> a loop multiplies: <code>n</code> times <code>n</code> is O(n²). An inner loop that runs <code>i</code> times for <code>i</code> from 1 to <code>n</code> does <code>1 + 2 + … + n = n(n+1)/2</code> steps, which is still O(n²): half of n² is not a different shape.</p>
<p><span class="kind">Rule 3.</span> A loop that halves (or doubles) its variable each time runs about <code>log₂ n</code> times: 20 times for a million, 30 for a billion. That is O(log n), and it is the shape to hope for.</p></div>`,
        { play: `public class Main {
    public static void main(String[] args) {
        int n = 1000000;
        int halvings = 0;
        for (int k = n; k > 1; k = k / 2) {
            halvings++;
        }
        System.out.println("halving " + n + " down to 1 takes " + halvings + " steps");
        int doublings = 0;
        for (long k = 1; k < n; k = k * 2) {
            doublings++;
        }
        System.out.println("doubling 1 up to " + n + " takes " + doublings + " steps");
        System.out.println("log2 of " + n + " is " + Math.log(n) / Math.log(2));
    }
}`, caption: 'A million is just under 2²⁰: nineteen halvings bring it down to 1, and twenty doublings pass it. Change n to a billion (1000000000): 29 and 30. Logarithms grow so slowly that for any n you will ever meet, log₂ n is under 64.' },
        `<h2>The array</h2>
<p>The first data structure is the one the machine gives you for free. An <em>array</em> is a row of cells of one type, side by side in memory, with nothing between them. Because the cells are the same size and adjacent, the machine can find any cell by arithmetic: cell <code>i</code> of an array of <code>int</code>s that starts at address <code>b</code> is at <code>b + 4i</code>. No searching, no counting along: one multiplication and one addition, whether <code>i</code> is 3 or 3 million. That single fact is why arrays are everywhere, and it is the thing to remember when every other structure in this course is compared with them.</p>
<p>In Java, <code>int[] a = new int[8];</code> makes eight cells, all 0, and <code>a.length</code> is 8 for ever: an array cannot grow or shrink. <code>a[i]</code> reads or writes cell <code>i</code>, counting from 0, and an <code>i</code> outside <code>0 … length − 1</code> stops the program with <code>ArrayIndexOutOfBoundsException</code>. (In C++, the same arithmetic happens with no check at all; you met the consequences in SC 103.)</p>
<p>So reading or writing a cell is O(1). What about everything else one wants to do with a collection? The figure keeps six values in an array with room for eight. Try getting, inserting and removing at different positions, and watch the count of moves.</p>`,
        { fig: 'arrayops', caption: 'Get costs one step at any index. Insert at index i must first move every later value one cell to the right, from the end backwards so that nothing is overwritten; remove must move every later value left. Try index 0 and the last index: the cost ranges from 0 moves to n.' },
        { check: "An array of a million values. Reading <code>a[700000]</code> costs how much?", options: ["About 700,000 steps", "One step: the address is arithmetic", "About a million steps"], answer: 1, why: "The cell's address is start + index × size. No walking, whatever the index." },
        `<div class="stmt"><p><span class="kind">The array's bill.</span> Read or write by index: O(1). Insert or remove at the end: O(1). Insert or remove at the front or in the middle: O(n), because of the shifting. Find a value when you do not know its index: O(n), a scan of every cell (lesson 2 shows how to do far better when the array is sorted). Grow: impossible; see below.</p></div>
<p>Here is the shifting in code. Both methods take the array and the number of cells in use, <code>n</code>, which may be smaller than <code>a.length</code>: the usual arrangement is an array with spare room at the end, and a count.</p>`,
        { play: `import java.util.Arrays;

public class Main {
    // insert x at index i, moving a[i..n-1] right; returns the new count
    static int insertAt(int[] a, int n, int i, int x) {
        for (int j = n - 1; j >= i; j--) {
            a[j + 1] = a[j];
        }
        a[i] = x;
        return n + 1;
    }

    public static void main(String[] args) {
        int[] a = new int[8];
        int n = 0;
        n = insertAt(a, n, 0, 12);
        n = insertAt(a, n, 1, 7);
        n = insertAt(a, n, 2, 3);
        n = insertAt(a, n, 1, 99);          // in the middle: 7 and 3 move right
        System.out.println(n + " values: " + Arrays.toString(Arrays.copyOf(a, n)));
        System.out.println("the whole array: " + Arrays.toString(a));
    }
}`, caption: 'The loop runs from the end backwards. Reverse it (j from i upwards) and run again: the first move overwrites the value that was about to be moved, and the same number fills every cell.' },
        `<h2>A growing array</h2>
<p>An array cannot grow, and yet <code>ArrayList</code> grows every time you call <code>add</code>. The trick is that an <code>ArrayList</code> is an array with spare room, plus a count. When the room runs out it makes a <em>new, bigger</em> array, copies everything across, and forgets the old one. The question is how much bigger. Grow by one cell each time and every append copies everything: appending <code>n</code> items costs <code>1 + 2 + … + n</code>, O(n²). Grow by <em>doubling</em> and something better happens. Append items in the figure and keep an eye on the copies.</p>`,
        { fig: 'dynarray', caption: 'Appends are usually one step. Now and then the array is full, and every value is copied into a new array twice the size. Append thirty or so and compare the two counts: the copies never reach twice the appends.' },
        `<p>Count the copies when the capacity has just reached <code>n</code>: the last doubling copied <code>n/2</code> values, the one before it <code>n/4</code>, and so on: <code>n/2 + n/4 + n/8 + … &lt; n</code>. By then more than <code>n/2</code> values have been appended, so the copies are fewer than twice the appends: under two copies per append on average. Any single append may be expensive, but the expense is paid for by the cheap ones around it. The technical word is <em>amortized</em>: appending to a doubling array is O(1) amortized, and that is why <code>ArrayList.add</code> is safe to call in a loop a million times.</p>`,
        { play: `import java.util.Arrays;

public class Main {
    static int copies = 0;

    // append x; the array may have to be replaced, so the (possibly new) array is returned
    static int[] append(int[] a, int n, int x) {
        if (n == a.length) {
            int[] bigger = new int[Math.max(1, 2 * a.length)];
            for (int i = 0; i < n; i++) {
                bigger[i] = a[i];
                copies++;
            }
            a = bigger;
        }
        a[n] = x;
        return a;
    }

    public static void main(String[] args) {
        int[] a = new int[1];
        int n = 0;
        for (int i = 1; i <= 1000; i++) {
            a = append(a, n, i);
            n++;
        }
        System.out.println(n + " appends, " + copies + " copies, capacity " + a.length);
        System.out.println("first five: " + Arrays.toString(Arrays.copyOf(a, 5)));
    }
}`, caption: '1000 appends, 1023 copies: about one copy per append, and a capacity of 1024, the next power of two. Change the growth to a.length + 1 and run again: 499,500 copies.' },
        { check: "A growing array doubles when full. What is the cost of adding n items, in total?", options: ["O(n²), because of the copying", "O(n): the copies add up to less than 2n moves", "O(n log n)"], answer: 1, why: "Each doubling copies the array, but the copies sum to n + n/2 + n/4 + … < 2n. Amortised O(1) per add." },
        `<h2>The doubling experiment</h2>
<p>You will sometimes meet code whose shape you cannot read, or a claim you want to check. The test is to run the code on an input of size <code>n</code>, then <code>2n</code>, then <code>4n</code>, and look at the <em>ratio</em> of the costs. A ratio of 2 means O(n); 4 means O(n²); 8 means O(n³); about 2 with a slow drift upward means O(n log n); barely more than 1 means O(log n). The ratio is independent of the machine, which is the whole point.</p>`,
        { play: `public class Main {
    static long steps;

    static int pairs(int[] a) {
        int count = 0;
        for (int i = 0; i < a.length; i++) {
            for (int j = i + 1; j < a.length; j++) {
                if (a[i] + a[j] == 10) count++;
                steps++;
            }
        }
        return count;
    }

    public static void main(String[] args) {
        long previous = 0;
        for (int n = 250; n <= 2000; n *= 2) {
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = i % 7;
            steps = 0;
            pairs(a);
            String ratio = previous == 0 ? "" : String.format("   ratio %.2f", (double) steps / previous);
            System.out.printf("n = %5d   steps = %9d%s%n", n, steps, ratio);
            previous = steps;
        }
    }
}`, caption: 'The ratio settles at 4: quadratic. Replace the body of pairs with a single loop and the ratio becomes 2. On a real machine you would time the runs with System.nanoTime() instead of counting; the ratios come out the same.' },
        { check: "A doubling experiment shows the step count going ×4 each time n doubles. What is the order of growth?", options: ["O(n)", "O(n²)", "O(2ⁿ)"], answer: 1, why: "Doubling n multiplies n² by four. O(n) would double; O(2ⁿ) would square the count." },
        `<details class="reveal"><summary>Puzzle: a program takes 1 second for n = 1,000 and is O(n²). Roughly how long for n = 1,000,000?</summary><p>About a million seconds, eleven and a half days. The input grew by a factor of 1,000, so the work grew by 1,000², a million. If the program were O(n log n) instead, the factor would be about 1,000 × 2 = 2,000: half an hour. That difference is the reason the next lessons exist.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Timing in seconds on one input and calling the result "the speed". Counting two loops in sequence as n² (it is 2n, which is O(n)). Reading <code>n²/2</code> as "better than n²"; the shape is the same. Thinking an array can grow. Shifting in the wrong direction when inserting, so one value overwrites the rest. Forgetting that <code>a.length</code> is the capacity, not the number of values in use. Treating O(log n) as expensive: it is the second-cheapest shape there is.</p>` },
        {
          ex: {
            id: 'ds-1-1', title: 'Remove at an index',
            prompt: `<p>Write a method</p><pre class="code">static int removeAt(int[] a, int n, int index)</pre><p>for an array of which the first <code>n</code> cells are in use. It removes the value at <code>index</code> by moving every later value one cell to the left, and returns the new count, <code>n − 1</code>. What is left in the cell beyond the new end does not matter. You may assume <code>0 ≤ index &lt; n</code>. Write only the method.</p>`,
            prelude: 'import java.util.Arrays;',
            starter: `static int removeAt(int[] a, int n, int index) {\n    // move a[index + 1 .. n - 1] one cell to the left\n    return n;\n}`,
            solution: `static int removeAt(int[] a, int n, int index) {\n    for (int j = index; j < n - 1; j++) {\n        a[j] = a[j + 1];\n    }\n    return n - 1;\n}`,
            hints: ['A loop over j from index up to n - 2, copying a[j + 1] into a[j]. Going upwards is right here: each cell is overwritten only after its value has been copied left.', 'Return n - 1. The checker prints the first n - 1 cells, so the old last value may stay where it is.'],
            tests: [
              { setup: '        int[] a = {5, 8, 1, 9, 4}; int n = removeAt(a, 5, 1);', call: 'n + " " + Arrays.toString(Arrays.copyOf(a, n))', expect: '4 [5, 1, 9, 4]', name: 'remove index 1 of [5, 8, 1, 9, 4]' },
              { setup: '        int[] a = {5, 8, 1, 9, 4}; int n = removeAt(a, 5, 0);', call: 'n + " " + Arrays.toString(Arrays.copyOf(a, n))', expect: '4 [8, 1, 9, 4]', name: 'remove the first' },
              { setup: '        int[] a = {5, 8, 1, 9, 4}; int n = removeAt(a, 5, 4);', call: 'n + " " + Arrays.toString(Arrays.copyOf(a, n))', expect: '4 [5, 8, 1, 9]', name: 'remove the last' },
              { setup: '        int[] a = {7, 0, 0}; int n = removeAt(a, 1, 0);', call: 'n + " " + Arrays.toString(Arrays.copyOf(a, n))', expect: '0 []', name: 'remove the only value' },
              { setup: '        int[] a = {1, 2, 3, 4, 5, 6, 7, 8}; int n = removeAt(a, 6, 2);', call: 'n + " " + Arrays.toString(Arrays.copyOf(a, n))', expect: '5 [1, 2, 4, 5, 6]', name: 'spare room beyond n is ignored' }
            ],
            failTip: 'Check the loop bounds: the last copy is a[n - 2] = a[n - 1]. A loop that runs to n - 1 reads a[n], one past the values in use.'
          }
        },
        {
          ex: {
            id: 'ds-1-2', kind: 'answer', title: 'How many steps?',
            prompt: `<p>For each piece of code, give the exact number of times the innermost line (<code>steps++</code>) runs when <code>n</code> is 100. Then name the order of growth in your head; the checker asks only for the number.</p>`,
            parts: [
              { label: '(a) <code>for (int i = 0; i &lt; n; i++) for (int j = 0; j &lt; n; j++) steps++;</code>', answer: '10000', width: '7rem', wrong: [{ match: '100', msg: 'That is one loop. The inner loop runs n times for each of the n outer passes.' }, { match: '200', msg: 'Two loops one after the other would give 2n. These are nested: multiply, not add.' }] },
              { label: '(b) <code>for (int i = 0; i &lt; n; i++) for (int j = 0; j &lt; i; j++) steps++;</code>', answer: '4950', width: '7rem', wrong: [{ match: '10000', msg: 'The inner loop runs i times, not n: 0 + 1 + 2 + … + 99.' }, { match: '5050', msg: 'Close: that is 1 + 2 + … + 100. The inner loop runs i times for i from 0 to 99, so the sum ends at 99.' }] },
              { label: '(c) <code>for (int k = n; k &gt; 1; k = k / 2) steps++;</code>', answer: '6', width: '7rem', wrong: [{ match: '7', msg: 'Trace it: k is 100, 50, 25, 12, 6, 3, then 1, and the loop stops when k is 1. Count the values that were greater than 1.' }, { match: ['50', '100'], msg: 'The variable is halved each time, not decreased by one. Write out the values of k.' }] },
              { label: '(d) <code>for (int i = 0; i &lt; n; i++) for (int j = 0; j &lt; 10; j++) steps++;</code>', answer: '1000', width: '7rem', wrong: [{ match: '10000', msg: 'The inner loop runs 10 times, whatever n is: n × 10, and the shape is O(n), not O(n²).' }] }
            ],
            hints: ['(a) n × n. (b) the inner loop runs 0 times, then 1, then 2, … up to n − 1 times: add them. (c) write out the values k takes. (d) the inner loop does not depend on n.'],
            solution: `<p>(a) 100 × 100 = <b>10,000</b>: O(n²). (b) 0 + 1 + … + 99 = 99 × 100 / 2 = <b>4,950</b>: still O(n²), half of it. (c) k takes the values 100, 50, 25, 12, 6, 3 before reaching 1: <b>6</b>, about log₂ 100: O(log n). (d) 100 × 10 = <b>1,000</b>: the inner loop is a constant, so this is O(n).</p>`,
            followup: 'Part (d) is the one people get wrong under pressure: a nested loop is not automatically n². Ask what each loop depends on.'
          }
        },
        {
          ex: {
            id: 'ds-1-3', title: 'A growing array',
            prompt: `<p>Write a method</p><pre class="code">static int[] append(int[] a, int n, int x)</pre><p>for an array of which the first <code>n</code> cells are in use. It stores <code>x</code> in cell <code>n</code> and returns the array that now holds the values. If the array is full (<code>n == a.length</code>), it first makes a new array of <em>twice</em> the capacity (or capacity 1 if the old capacity was 0), copies the <code>n</code> values into it, and uses that instead; the method then returns the new array. Write only the method.</p>`,
            prelude: 'import java.util.Arrays;',
            starter: `static int[] append(int[] a, int n, int x) {\n    // if n == a.length: make a bigger array and copy the n values into it\n    a[n] = x;\n    return a;\n}`,
            solution: `static int[] append(int[] a, int n, int x) {\n    if (n == a.length) {\n        int[] bigger = new int[Math.max(1, 2 * a.length)];\n        for (int i = 0; i < n; i++) {\n            bigger[i] = a[i];\n        }\n        a = bigger;\n    }\n    a[n] = x;\n    return a;\n}`,
            hints: ['Test for the full array first: if (n == a.length). Inside, make int[] bigger = new int[Math.max(1, 2 * a.length)], copy with a loop, then let a refer to bigger.', 'After the if, whichever array a now refers to has room: a[n] = x; return a;', 'Assigning a = bigger changes only the method’s own variable, which is why the method must return the array and the caller must store what it returns.'],
            tests: [
              { setup: '        int[] a = new int[2]; a = append(a, 0, 7); a = append(a, 1, 8);', call: 'a.length + " " + Arrays.toString(Arrays.copyOf(a, 2))', expect: '2 [7, 8]', name: 'two appends into capacity 2: no growth' },
              { setup: '        int[] a = new int[2]; a = append(a, 0, 7); a = append(a, 1, 8); a = append(a, 2, 9);', call: 'a.length + " " + Arrays.toString(Arrays.copyOf(a, 3))', expect: '4 [7, 8, 9]', name: 'the third append doubles to 4' },
              { setup: '        int[] a = new int[0]; a = append(a, 0, 5);', call: 'a.length + " " + Arrays.toString(a)', expect: '1 [5]', name: 'capacity 0 becomes 1' },
              { setup: '        int[] a = new int[1]; int n = 0; for (int i = 1; i <= 100; i++) { a = append(a, n, i); n++; }', call: 'a.length + " " + a[0] + " " + a[99]', expect: '128 1 100', name: '100 appends from capacity 1' },
              { setup: '        int[] a = {1, 2, 3, 0, 0}; a = append(a, 3, 4);', call: 'a.length + " " + Arrays.toString(a)', expect: '5 [1, 2, 3, 4, 0]', name: 'room to spare: the same array' }
            ],
            failTip: 'If the third append fails, the growth is not happening or the copy is incomplete; if the capacity-0 test fails, 2 × 0 is 0: use Math.max(1, 2 * a.length).'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>Count steps as a function of <code>n</code>, not seconds on one input. Constants and smaller terms are dropped: the <em>order of growth</em>, O(f(n)), says how the cost scales.</li>
<li>The shapes: O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ). Read them off the code: a loop is n, a nested loop multiplies, halving is log n.</li>
<li>An array is cells side by side; cell i is at <code>base + 4i</code>, so indexing is O(1). Inserting or removing in the middle shifts everything after it: O(n). Finding a value by scanning: O(n). An array cannot grow.</li>
<li>A growing array doubles when full; the copies total less than twice the appends, so an append is O(1) amortized. That is <code>ArrayList</code>.</li>
<li>The doubling experiment: run on n and 2n and look at the ratio of costs. 2 means linear, 4 quadratic, about 1 logarithmic.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Searching', summary: 'Linear search and its cost; binary search, why it works and why it is so fast; the overflow bug that hid in it for twenty years; and the variants that find a boundary rather than a value.',
      blocks: [
        `<p>In 2006 Joshua Bloch, who had written much of Java's standard library, published a short article with the title "Nearly All Binary Searches and Mergesorts are Broken". The binary search in Jon Bentley's <em>Programming Pearls</em>, a book that Bloch had learned from, had been proved correct in the text, tested, and reprinted for twenty years. It had a bug. So did the binary search Bloch himself had written for Java's <code>java.util.Arrays</code>, where it had lain for nine years before someone's program broke on it. The bug was a single line, the one that finds the middle of a range: <code>int mid = (low + high) / 2;</code>. For a range inside an array of more than about a billion elements, <code>low + high</code> is larger than an <code>int</code> can hold, wraps round to a negative number, and the search looks at a cell that does not exist.</p>`,
        { photo: 'joshua-bloch', caption: 'Joshua Bloch in 2008, two years after his article. He had written the binary search in <code>java.util.Arrays</code> himself.' },
        `<p>Nobody had noticed because nobody had searched an array of a billion elements, and then, around 2006, people did. The algorithm was right; the arithmetic was not; and the lesson, which you will see at the end of this lesson, is that the cheapest-looking line of a correct algorithm still has to be checked against the machine it runs on. First, the algorithm, which is one of the oldest and best ideas in the subject.</p>
<h2>Linear search</h2>
<p>To find a value in an array when you know nothing about the order of its contents, there is only one method: look at each cell in turn until you find it or run out. This is <em>linear search</em>, and it is O(n): a miss costs <code>n</code> comparisons, a hit costs <code>n/2</code> on average, and nothing can be done about it, because any cell you skip might have been the one.</p>`,
        { play: `public class Main {
    static int comparisons;

    static int linearSearch(int[] a, int target) {
        for (int i = 0; i < a.length; i++) {
            comparisons++;
            if (a[i] == target) return i;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] a = {38, 5, 72, 12, 91, 23, 8, 56, 2, 16};
        for (int target : new int[] {38, 23, 16, 99}) {
            comparisons = 0;
            int where = linearSearch(a, target);
            System.out.println(target + ": index " + where + " after " + comparisons + " comparison" + (comparisons == 1 ? "" : "s"));
        }
    }
}`, caption: 'The first value costs 1 comparison, the last 10, and a value that is not there 10. Returning from inside the loop is what makes a hit cheaper than a miss.' },
        `<h2>Binary search</h2>
<p>Now suppose the array is <em>sorted</em>. One comparison then tells you more than whether you have found the value: compare the target with the middle cell, and you know which half it must be in. The other half can be thrown away without looking at it. Repeat on the half that remains. Every comparison halves the range, so a range of a million cells is down to one after twenty comparisons: 20 instead of 1,000,000. This is <em>binary search</em>, and you have used it every time you looked up a word in a dictionary by opening it somewhere in the middle.</p>`,
        { fig: 'search', items: [2, 5, 8, 12, 16, 23, 38, 42, 56, 61, 72, 79, 85, 91, 97, 104], caption: 'Sixteen sorted values. Type a target and step: lo and hi mark the range that can still hold it, mid is the cell compared. Try 2, 104 and 50 (which is absent). No search takes more than 5 comparisons, because 2⁴ ≤ 16 < 2⁵.' },
        `<p>The code keeps two indexes, <code>lo</code> and <code>hi</code>, with the promise that <em>if the target is in the array at all, it is in cells <code>lo</code> to <code>hi</code> inclusive</em>. Each pass compares the target with the middle cell and moves <code>lo</code> or <code>hi</code> so that the promise still holds while the range shrinks. When <code>lo</code> passes <code>hi</code>, the range is empty and the promise says the target is not there.</p>`,
        { play: `public class Main {
    static int comparisons;

    static int binarySearch(int[] a, int target) {
        int lo = 0;
        int hi = a.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            comparisons++;
            if (a[mid] == target) return mid;
            if (a[mid] < target) lo = mid + 1;      // the target can only be to the right
            else hi = mid - 1;                     // or only to the left
        }
        return -1;
    }

    public static void main(String[] args) {
        int n = 1000000;
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = 3 * i;          // sorted: 0, 3, 6, ...
        for (int target : new int[] {0, 2999997, 1500000, 1500001}) {
            comparisons = 0;
            int where = binarySearch(a, target);
            System.out.println(target + ": index " + where + " after " + comparisons + " comparisons");
        }
    }
}`, caption: 'A million values, never more than 20 comparisons. 1500001 is not a multiple of 3, so it is absent: the search still stops after 20. Linear search would have made up to a million.' },
        { check: "Binary search on 1,000,000 sorted values needs at most about how many comparisons?", options: ["About 20", "About 1,000", "About 500,000"], answer: 0, why: "Each comparison halves the range; a million halves to one in 20 steps, since 2²⁰ ≈ 1,048,576." },
        `<div class="stmt"><p><span class="kind">Why it works (the invariant).</span> Before every pass: <em>if target is in a, then it is in a[lo..hi]</em>. True at the start, when the range is the whole array. If <code>a[mid] &lt; target</code>, every cell up to <code>mid</code> is smaller than the target too, because the array is sorted, so the target can only be in <code>mid + 1 … hi</code>; setting <code>lo = mid + 1</code> keeps the promise. The other case is the mirror. A statement that is true before the loop and kept true by every pass is called a <em>loop invariant</em>, and it is how you convince yourself, or a reader, that a loop is right.</p>
<p><span class="kind">Why it stops.</span> <code>mid</code> is always inside <code>lo … hi</code>, so <code>lo = mid + 1</code> and <code>hi = mid − 1</code> each shrink the range by at least one cell. A range that shrinks every pass must become empty.</p>
<p><span class="kind">Why it is fast.</span> The range starts at <code>n</code> and is at most halved each pass, so after <code>k</code> passes it holds at most <code>n / 2ᵏ</code> cells. It is empty once <code>2ᵏ &gt; n</code>, that is, after about <code>log₂ n</code> passes: O(log n).</p></div>
<p>The requirement is that the array is sorted. Binary search on an unsorted array does not fail loudly; it quietly returns −1 for values that are present, or the wrong index. Keeping an array sorted costs something at every insert (lesson 1: a shift), and that is a trade this course will return to: pay at insertion to make every search cheap, or insert cheaply and search slowly.</p>
<h2>The bug</h2>
<p>Here is the line Bloch found. For a range inside an ordinary array it is harmless. Make the array big enough and it breaks.</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        int lo = 1500000000;                    // indexes inside an array of two billion cells
        int hi = 2000000000;
        int mid = (lo + hi) / 2;                // the line in Programming Pearls and in the JDK
        System.out.println("lo + hi = " + (lo + hi));
        System.out.println("(lo + hi) / 2 = " + mid);
        int safe = lo + (hi - lo) / 2;          // the fix: the difference always fits
        System.out.println("lo + (hi - lo) / 2 = " + safe);
        int alsoSafe = (lo + hi) >>> 1;         // the JDK's fix: treat the sum as unsigned and halve it
        System.out.println("(lo + hi) >>> 1 = " + alsoSafe);
    }
}`, caption: 'lo + hi is 3.5 billion, above the int limit of about 2.1 billion, so it wraps to a negative number and mid is negative: a[mid] would throw. Both fixes give the right middle. Java’s Arrays.binarySearch has used >>> 1 since 2006.' },
        { check: "Why did <code>(lo + hi) / 2</code> hide a bug for twenty years?", options: ["It rounds the wrong way", "lo + hi can overflow an int when the array is huge, giving a negative middle", "It is slower than subtraction"], answer: 1, why: "For arrays over a billion elements the sum exceeds the largest int, wraps negative, and the index is garbage. lo + (hi − lo) / 2 cannot overflow." },
        `<div class="stmt"><p><span class="kind">Rule.</span> Write the middle as <code>lo + (hi − lo) / 2</code>. It costs nothing, it is right for every array Java can make, and it marks you as someone who has read Bloch's article.</p></div>
<h2>Finding a boundary instead of a value</h2>
<p>Binary search is more than a way to find a value. The same halving finds the <em>boundary</em> in any array that is false up to some point and true from there on. Where does 3 first appear in a sorted array that has several 3s? Where would 4 go if we inserted it? What is the largest whole number whose square is at most 10¹²? Each of these is "find the first index where a condition becomes true", and each takes O(log n).</p>
<p>The version below finds the first index whose value is at least <code>x</code>, the <em>lower bound</em>; if every value is smaller, it returns <code>n</code>. The invariant is different, and worth reading: every cell before <code>lo</code> is less than <code>x</code>, every cell from <code>hi</code> on is at least <code>x</code>, and the answer is somewhere in <code>lo … hi</code>.</p>`,
        { play: `public class Main {
    // the first index i with a[i] >= x, or a.length if there is none
    static int lowerBound(int[] a, int x) {
        int lo = 0;
        int hi = a.length;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] < x) lo = mid + 1;      // everything up to mid is too small
            else hi = mid;                      // mid itself might be the answer
        }
        return lo;
    }

    public static void main(String[] args) {
        int[] a = {1, 3, 3, 3, 7, 9, 9, 12};
        System.out.println("3 first appears at " + lowerBound(a, 3));
        System.out.println("there are " + (lowerBound(a, 4) - lowerBound(a, 3)) + " threes");
        System.out.println("4 would be inserted at " + lowerBound(a, 4));
        System.out.println("0 would be inserted at " + lowerBound(a, 0));
        System.out.println("100 would be inserted at " + lowerBound(a, 100));
        // the same idea on a question, not an array: the largest k with k*k <= 1000000000000
        long lo = 0, hi = 2000000;
        while (lo < hi) {
            long mid = lo + (hi - lo + 1) / 2;
            if (mid * mid <= 1000000000000L) lo = mid; else hi = mid - 1;
        }
        System.out.println("largest k with k*k <= 10^12: " + lo);
    }
}`, caption: 'Two lower bounds count the threes in O(log n). The last loop searches a range of numbers rather than an array: the condition k*k <= 10^12 is true up to a point and false after it, which is all binary search needs.' },
        { check: "Binary search is run on an array that is not sorted. What happens?", options: ["It finds the value, slowly", "It may return \"not found\" for a value that is there, with no error", "Java throws an exception"], answer: 1, why: "The algorithm relies on the invariant \"if present, the target is between lo and hi\". Unsorted data breaks it silently." },
        `<p>Java's own <code>Arrays.binarySearch(a, x)</code> returns the index when <code>x</code> is present and otherwise <code>−(insertion point) − 1</code>, a negative number that encodes where <code>x</code> would go. The encoding looks odd until you see that it lets one call answer both questions.</p>
<div class="stmt"><p><span class="kind">Cost comparison.</span> For a million sorted values, a search costs at most 20 comparisons instead of a million: fifty thousand times fewer. For a billion, 30 instead of a billion. A sorted array with binary search is the first structure in this course that makes "find" cheap, and the price is that the array must be sorted, which is the subject of the next lesson.</p></div>`,
        `<details class="reveal"><summary>Puzzle: the loop condition in the first version is <code>lo &lt;= hi</code> and in <code>lowerBound</code> it is <code>lo &lt; hi</code>. Why the difference?</summary><p>In the first version the range <code>lo … hi</code> is inclusive at both ends and a range of one cell (<code>lo == hi</code>) still has to be examined, so the loop runs while <code>lo ≤ hi</code>. In <code>lowerBound</code>, <code>hi</code> is one past the end of the range, and a range of one cell is already the answer: when <code>lo == hi</code> there is nothing left to decide. Both are right for their own invariant; copying the condition from one into the other is the commonest way to break a binary search. Decide what <code>hi</code> means first, then write the condition.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Binary search on an array that is not sorted. <code>lo = mid</code> instead of <code>mid + 1</code>, which can loop for ever when the range is two cells. Mixing an inclusive <code>hi</code> with the <code>lo &lt; hi</code> condition, which skips the last cell. <code>(lo + hi) / 2</code>. Returning <code>mid</code> after the loop instead of −1. Testing only on values that are present: the misses, the first cell and the last cell are where the bugs are.</p>` },
        {
          ex: {
            id: 'ds-2-1', title: 'Binary search',
            prompt: `<p>Write a method</p><pre class="code">static int binarySearch(int[] a, int target)</pre><p>that returns the index of <code>target</code> in the sorted array <code>a</code>, or −1 if it is not there. Keep <code>lo</code> and <code>hi</code> as the inclusive bounds of the range that can still hold the target, compute the middle without overflow, and do not look at any cell outside the range. Write only the method.</p>`,
            prelude: 'import java.util.Arrays;',
            starter: `static int binarySearch(int[] a, int target) {\n    int lo = 0;\n    int hi = a.length - 1;\n    // while the range is not empty: compare with the middle, keep the half that can hold the target\n    return -1;\n}`,
            solution: `static int binarySearch(int[] a, int target) {\n    int lo = 0;\n    int hi = a.length - 1;\n    while (lo <= hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (a[mid] == target) {\n            return mid;\n        } else if (a[mid] < target) {\n            lo = mid + 1;\n        } else {\n            hi = mid - 1;\n        }\n    }\n    return -1;\n}`,
            mustNotContain: [{ re: /Arrays\.binarySearch|Collections\.binarySearch/, msg: 'Write the search yourself; the library’s version is what you are learning to write.' }, { re: /\(\s*lo\s*\+\s*hi\s*\)\s*\/\s*2|\(\s*low\s*\+\s*high\s*\)\s*\/\s*2/, msg: 'That is the line with the overflow bug. Write the middle as lo + (hi - lo) / 2.' }],
            hints: ['while (lo <= hi): the range is inclusive, so a range of one cell must still be examined.', 'int mid = lo + (hi - lo) / 2; then three cases: equal (return mid), a[mid] smaller (lo = mid + 1), a[mid] larger (hi = mid - 1).', 'After the loop the range is empty: return -1.'],
            tests: [
              { setup: '        int[] a = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};', call: 'binarySearch(a, 23)', expect: '5', name: 'a value in the middle' },
              { setup: '        int[] a = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};', call: 'binarySearch(a, 2) + " " + binarySearch(a, 91)', expect: '0 9', name: 'the first and the last' },
              { setup: '        int[] a = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};', call: 'binarySearch(a, 7) + " " + binarySearch(a, 1) + " " + binarySearch(a, 100)', expect: '-1 -1 -1', name: 'absent values: between, below, above' },
              { setup: '        int[] a = {42};', call: 'binarySearch(a, 42) + " " + binarySearch(a, 41)', expect: '0 -1', name: 'one cell' },
              { setup: '        int[] a = {};', call: 'binarySearch(a, 1)', expect: '-1', name: 'no cells' },
              { setup: '        int[] a = new int[100000]; for (int i = 0; i < a.length; i++) a[i] = 2 * i;', call: 'binarySearch(a, 123456) + " " + binarySearch(a, 123457) + " " + binarySearch(a, 199998)', expect: '61728 -1 99999', name: 'a hundred thousand values' }
            ],
            failTip: 'If the one-cell or last-cell tests fail, check the loop condition (<=) and the two updates (mid + 1 and mid - 1). If the absent values loop for ever, one of the updates is lo = mid or hi = mid.'
          }
        },
        {
          ex: {
            id: 'ds-2-2', title: 'Lower bound',
            prompt: `<p>Write a method</p><pre class="code">static int lowerBound(int[] a, int x)</pre><p>that returns the smallest index <code>i</code> with <code>a[i] ≥ x</code> in the sorted array <code>a</code>, or <code>a.length</code> if every value is smaller than <code>x</code>. It must take O(log n) comparisons: a loop that looks at every cell will pass the small tests and fail the large one. Write only the method.</p>`,
            prelude: 'import java.util.Arrays;',
            starter: `static int lowerBound(int[] a, int x) {\n    int lo = 0;\n    int hi = a.length;          // one past the end: the answer is in lo .. hi\n    // halve the range until lo == hi\n    return lo;\n}`,
            solution: `static int lowerBound(int[] a, int x) {\n    int lo = 0;\n    int hi = a.length;\n    while (lo < hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (a[mid] < x) {\n            lo = mid + 1;\n        } else {\n            hi = mid;\n        }\n    }\n    return lo;\n}`,
            hints: ['Two cases only: if a[mid] < x, the answer is after mid, so lo = mid + 1; otherwise mid might be the answer, so hi = mid (not mid - 1).', 'The loop runs while lo < hi. When they meet, lo is the answer: every cell before it is less than x and every cell from it on is at least x.', 'A linear scan is O(n); the last test has a million values and a time limit, and only a halving search finishes.'],
            tests: [
              { setup: '        int[] a = {1, 3, 3, 3, 7, 9};', call: 'lowerBound(a, 3) + " " + lowerBound(a, 4) + " " + lowerBound(a, 9)', expect: '1 4 5', name: 'first 3, where 4 would go, the last value' },
              { setup: '        int[] a = {1, 3, 3, 3, 7, 9};', call: 'lowerBound(a, 0) + " " + lowerBound(a, 1) + " " + lowerBound(a, 10)', expect: '0 0 6', name: 'below, at the start, above' },
              { setup: '        int[] a = {};', call: 'lowerBound(a, 5)', expect: '0', name: 'no cells' },
              { setup: '        int[] a = {5, 5, 5, 5};', call: 'lowerBound(a, 5) + " " + lowerBound(a, 6)', expect: '0 4', name: 'all equal' },
              { setup: '        int[] a = new int[1000000]; for (int i = 0; i < a.length; i++) a[i] = i / 3; int total = 0; for (int q = 0; q < 2000; q++) total += lowerBound(a, q * 100);', call: 'total', expect: '599700000', name: 'two thousand searches in a million values (O(log n) only)' }
            ],
            failTip: 'If the all-equal test gives 3 instead of 0, the "else" branch is hi = mid - 1; it must keep mid, because mid may be the first cell that is at least x.'
          }
        },
        {
          ex: {
            id: 'ds-2-3', kind: 'answer', title: 'How many comparisons?',
            prompt: `<p>Binary search halves the range at every comparison, so the most comparisons it can need on <code>n</code> cells is the smallest <code>k</code> with <code>2ᵏ ≥ n</code>, plus one for the final check. For each question give the smallest <code>k</code> with <code>2ᵏ ≥ n</code>.</p>`,
            parts: [
              { label: '(a) n = 1,024', answer: '10', width: '6rem', wrong: [{ match: '11', msg: '2¹⁰ = 1,024 exactly, so k = 10 already satisfies 2ᵏ ≥ n.' }, { match: '512', msg: 'The question asks for the number of halvings, not the size of the half.' }] },
              { label: '(b) n = 1,000,000', answer: '20', width: '6rem', wrong: [{ match: '19', msg: '2¹⁹ = 524,288, which is less than a million. One more.' }, { match: '21', msg: '2²⁰ = 1,048,576 ≥ 1,000,000 already.' }] },
              { label: '(c) n = 8,000,000,000 (the people on Earth)', answer: '33', width: '6rem', wrong: [{ match: '32', msg: '2³² ≈ 4.3 billion, less than 8 billion. One more.' }, { match: '30', msg: '2³⁰ ≈ 1.07 billion. Keep doubling.' }] },
              { label: '(d) Linear search on the same 8,000,000,000: the most comparisons it can need', answer: '8000000000', width: '9rem', wrong: [{ match: '33', msg: 'That is binary search. A linear search that misses looks at every cell.' }] }
            ],
            hints: ['2¹⁰ = 1,024. 2²⁰ is about a million. 2³⁰ is about a billion, and each further doubling is one more.'],
            solution: `<p>(a) <b>10</b>, since 2¹⁰ = 1,024. (b) <b>20</b>: 2¹⁹ = 524,288 is too small, 2²⁰ = 1,048,576 is enough. (c) <b>33</b>: 2³² ≈ 4.29 billion is too small, 2³³ ≈ 8.59 billion is enough. (d) <b>8,000,000,000</b>: a miss looks at every cell.</p>`,
            followup: 'Thirty-three comparisons to find one person among everyone alive, against eight billion. Logarithms are the reason large things are searchable at all.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>Linear search looks at every cell: O(n), and nothing better is possible when the order is unknown.</li>
<li>Binary search on a sorted array halves the range at each comparison: O(log n), 20 comparisons for a million cells, 30 for a billion. It needs the array sorted.</li>
<li>A loop invariant (<em>if the target is present, it is in lo…hi</em>) is how you know a loop is right; a shrinking range is how you know it stops.</li>
<li>Write the middle as <code>lo + (hi − lo) / 2</code>: <code>(lo + hi) / 2</code> overflows for large arrays and hid in textbooks and the JDK for years.</li>
<li>The same halving finds a boundary: the first cell at least <code>x</code> (lower bound), an insertion point, the largest number with a property. Decide what <code>hi</code> means before writing the loop condition.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Sorting, the slow way first', summary: 'Why so much computing is sorting; selection sort and insertion sort with their invariants and their counts; best and worst cases; stability; and the doubling experiment that shows what quadratic means.',
      blocks: [
        `<p>In the third volume of <em>The Art of Computer Programming</em>, published in 1973, Donald Knuth reported an estimate from the computer manufacturers of the 1960s: more than a quarter of all the running time on their customers' machines was spent sorting. The machines were mostly doing business: payroll, inventory, billing, and every one of those jobs began by putting records in order, by account number, by date, by name, so that matching ones could be found next to each other. The data arrived on punched cards and magnetic tape, and the sorting algorithms of the time were written to work with a few hundred cards in memory and the rest waiting on a tape drive.</p>`,
        { photo: 'ibm-card-sorter', caption: 'An IBM Type 83 card sorter from 1955, in a museum. A metal brush felt for the hole in one column of each card, and the card dropped into one of 13 pockets: about 1,000 cards a minute. The stacks in the rack above are cards sorted by one column. Sorting a whole number took one pass per digit.' },
        `<p>A quarter of all computing is no longer sorting, but sorting is still underneath more of it than anything else: every search index, every database, every spreadsheet column you click to order, and, from the last lesson, every binary search. The subject has two halves. This lesson is the first: the simple sorts, which are O(n²), and which you should know not because you will use them on large inputs but because they are where the ideas of invariant, cost and best-and-worst case become concrete. The next lesson is the second half, the O(n log n) sorts that the world actually runs.</p>
<h2>The problem, stated precisely</h2>
<div class="stmt"><p><span class="kind">Sorting.</span> Given an array of <code>n</code> values that can be compared, rearrange it so that <code>a[0] ≤ a[1] ≤ … ≤ a[n−1]</code>. The result must contain exactly the values that were there, no more and no fewer.</p>
<p><span class="kind">Cost.</span> We count <em>comparisons</em> (how many times two values are compared) and <em>moves</em> (how many times a value is written into a cell). A swap is three moves.</p>
<p><span class="kind">Stability.</span> A sort is <em>stable</em> if values that compare equal keep the order they had. Sorting students by grade with a stable sort keeps the names alphabetical within each grade, if they were alphabetical before.</p></div>
<h2>Selection sort</h2>
<p>The method you would use on a hand of cards if you were being careful: find the smallest value and put it first; then find the smallest of the rest and put it second; and so on. After <code>i</code> rounds, the first <code>i</code> cells hold the <code>i</code> smallest values, in order, and will never move again. That sentence is the invariant.</p>`,
        { fig: 'sortlab', algo: 'selection', caption: 'Twelve values, with the comparisons and moves counted at every step. Try the four input shapes: selection sort makes exactly the same number of comparisons on all of them, and never more than n − 1 swaps.' },
        { check: "Selection sort on 100 values makes how many comparisons?", options: ["99", "4,950", "10,000"], answer: 1, why: "99 + 98 + … + 1 = 100 × 99 / 2, on every input: it cannot notice sorted data." },
        { play: `import java.util.Arrays;

public class Main {
    static int comparisons, moves;

    static void selectionSort(int[] a) {
        for (int i = 0; i < a.length - 1; i++) {
            int smallest = i;
            for (int j = i + 1; j < a.length; j++) {
                comparisons++;
                if (a[j] < a[smallest]) smallest = j;
            }
            if (smallest != i) {
                int t = a[i]; a[i] = a[smallest]; a[smallest] = t;
                moves += 3;
            }
        }
    }

    public static void main(String[] args) {
        int[] a = {7, 3, 9, 1, 6, 8, 2, 5, 4};
        selectionSort(a);
        System.out.println(Arrays.toString(a) + "   comparisons " + comparisons + ", moves " + moves);
        for (int n : new int[] {10, 100, 1000}) {
            int[] b = new int[n];
            for (int i = 0; i < n; i++) b[i] = (i * 7919) % 1000;
            comparisons = 0; moves = 0;
            selectionSort(b);
            System.out.println("n = " + n + ": comparisons " + comparisons + ", moves " + moves);
        }
    }
}`, caption: 'The comparisons are 45, 4,950 and 499,500: n(n−1)/2 every time, whatever the input, because the inner loop always runs to the end. The moves stay below 3n.' },
        `<div class="stmt"><p><span class="kind">Selection sort's bill.</span> Comparisons: exactly <code>n(n−1)/2</code>, O(n²), on every input. Moves: at most <code>3(n−1)</code>, O(n). Not stable (a swap can carry a value past an equal one). Its one virtue is the small number of moves, which matters when moving a value is expensive and comparing is cheap.</p></div>
<h2>Insertion sort</h2>
<p>The method you actually use with a hand of cards: take the next card and slide it left into the cards you already hold, which are in order, until it is in its place. After <code>i</code> rounds the first <code>i</code> cells are sorted, but unlike selection sort they are not final: a later value may be inserted among them.</p>`,
        { fig: 'sortlab', algo: 'insertion', caption: 'The same twelve values. Now change the input shape: on an already sorted input insertion sort makes one comparison per value and stops; on a reversed input every value slides all the way to the front. The algorithm adapts to its input, and selection sort did not.' },
        { play: `import java.util.Arrays;

public class Main {
    static int comparisons, moves;

    static void insertionSort(int[] a) {
        for (int i = 1; i < a.length; i++) {
            int value = a[i];
            int j = i;
            while (j > 0) {
                comparisons++;
                if (a[j - 1] > value) {
                    a[j] = a[j - 1];        // shift the larger value right
                    moves++;
                    j--;
                } else {
                    break;                  // found the place
                }
            }
            a[j] = value;
            moves++;
        }
    }

    static int[] shape(int n, String kind) {
        int[] b = new int[n];
        for (int i = 0; i < n; i++) b[i] = kind.equals("sorted") ? i : kind.equals("reversed") ? n - i : (i * 7919) % 1000;
        return b;
    }

    public static void main(String[] args) {
        int[] a = {7, 3, 9, 1, 6, 8, 2, 5, 4};
        insertionSort(a);
        System.out.println(Arrays.toString(a) + "   comparisons " + comparisons + ", moves " + moves);
        for (String kind : new String[] {"sorted", "random", "reversed"}) {
            comparisons = 0; moves = 0;
            insertionSort(shape(1000, kind));
            System.out.printf("n = 1000, %-9s comparisons %7d, moves %7d%n", kind + ":", comparisons, moves);
        }
    }
}`, caption: 'Sorted input: 999 comparisons, O(n). Reversed: 499,500, the full n²/2. Random: about half of that. Insertion sort is the fastest sort there is for input that is already nearly in order, which real data often is.' },
        { check: "Which sort is the right choice for a list that is already nearly sorted?", options: ["Selection sort", "Insertion sort: it makes about n comparisons on sorted input", "They cost the same"], answer: 1, why: "Insertion sort stops each slide at the first smaller neighbour, so nearly sorted input costs about n. Selection sort always costs n(n−1)/2." },
        `<div class="stmt"><p><span class="kind">Insertion sort's bill.</span> Comparisons and moves: between <code>n − 1</code> (already sorted) and <code>n(n−1)/2</code> (reversed), about <code>n²/4</code> on random input: O(n) best case, O(n²) worst and average. Stable, because a value stops sliding as soon as it meets one that is not larger. The sort of choice for small arrays (Java's own sort switches to it below about 50 elements) and for nearly sorted ones.</p></div>
<p>Notice the difference in <em>what the loops know</em>. Selection sort's inner loop must run to the end, because the smallest value could be anywhere. Insertion sort's inner loop can stop as soon as it finds a smaller value, because everything to its left is already sorted. The invariant is not only how you prove the sort correct; it is where the saving comes from.</p>
<h2>What quadratic feels like</h2>
<p>Both sorts are O(n²), and the figure's doubling experiment will show you what that means in time. Press the button at the bottom of either figure: it sorts random arrays of 1,000, 2,000, 4,000 and 8,000 values and reports the comparisons and the time. The ratio from one row to the next is 4. Then do the sum: at 8,000 values the sort takes some milliseconds. At 8,000,000 values, a thousand times more, it would take a million times longer: hours. A library sort does 8,000,000 values in a few seconds.</p>
<p>And bubble sort? It compares neighbours and swaps them when out of order, pass after pass. It is O(n²) like the others, makes more moves than either, and has no case where it is the best choice. It appears in the figure so that you recognise it; it is the one sort every textbook teaches and no program uses.</p>
<h2>Sorting other things</h2>
<p>The two sorts compare values with <code>&lt;</code> and <code>&gt;</code>. Replace those with any comparison you like and they sort anything by any rule. Strings by their <code>compareTo</code>; words by length; students by grade. When the rule has ties (many words have four letters) stability decides what happens to them, and insertion sort, being stable, keeps their original order.</p>`,
        { play: `import java.util.Arrays;

public class Main {
    // insertion sort by length; stable, so words of the same length keep their order
    static void sortByLength(String[] w) {
        for (int i = 1; i < w.length; i++) {
            String value = w[i];
            int j = i;
            while (j > 0 && w[j - 1].length() > value.length()) {
                w[j] = w[j - 1];
                j--;
            }
            w[j] = value;
        }
    }

    public static void main(String[] args) {
        String[] words = {"pear", "fig", "banana", "kiwi", "apple", "date"};
        sortByLength(words);
        System.out.println(Arrays.toString(words));
        String[] names = {"Grace", "Ada", "Linus", "Guido"};
        Arrays.sort(names);                    // the library: strings in dictionary order, O(n log n)
        System.out.println(Arrays.toString(names));
    }
}`, caption: 'pear, kiwi and date all have four letters and come out in the order they went in. Change > to >= in the while condition and run again: the sort is no longer stable, and the four-letter words reverse.' },
        { check: "A sort is <em>stable</em> when…", options: ["it never crashes", "values that compare equal keep the order they had", "it uses no extra memory"], answer: 1, why: "Stability matters when sorting records by one key after another: students sorted by grade keep their alphabetical order within each grade." },
        `<details class="reveal"><summary>Puzzle: an array of n values has exactly one value out of place (it belongs k cells to the left). How many comparisons does insertion sort make? And selection sort?</summary><p>Insertion sort: about <code>n + k</code>. Every value but one stops after one comparison, and the misplaced one slides <code>k</code> cells. Selection sort: <code>n(n−1)/2</code>, as always; it has no way of noticing that the array is nearly sorted. For a million values with one out of place, that is a million comparisons against five hundred billion.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> In insertion sort, shifting with a swap at each step (three moves instead of one) or forgetting to write the value into its final cell. A <code>while</code> condition that reads <code>a[j − 1]</code> when <code>j</code> is 0. Using <code>&gt;=</code> where <code>&gt;</code> was meant, which breaks stability. In selection sort, swapping inside the inner loop instead of after it. Calling a sort O(n²) "slow": for a hundred values it is instant, and for a thousand it is fine; it is the growth that is the problem.</p>` },
        {
          ex: {
            id: 'ds-3-1', title: 'Insertion sort',
            prompt: `<p>Write a method</p><pre class="code">static void insertionSort(int[] a)</pre><p>that sorts <code>a</code> into increasing order in place, by insertion: for each position <code>i</code> from 1 on, slide <code>a[i]</code> left past every larger value. Shift with single moves, not swaps. Write only the method; do not call the library's sort.</p>`,
            prelude: 'import java.util.Arrays;',
            starter: `static void insertionSort(int[] a) {\n    for (int i = 1; i < a.length; i++) {\n        int value = a[i];\n        int j = i;\n        // while there is a larger value to the left, shift it right and move j left\n        a[j] = value;\n    }\n}`,
            solution: `static void insertionSort(int[] a) {\n    for (int i = 1; i < a.length; i++) {\n        int value = a[i];\n        int j = i;\n        while (j > 0 && a[j - 1] > value) {\n            a[j] = a[j - 1];\n            j--;\n        }\n        a[j] = value;\n    }\n}`,
            mustNotContain: [{ re: /Arrays\.sort|Collections\.sort|\.sort\s*\(/, msg: 'Write the sort yourself; the library’s sort is what you are learning to write.' }],
            hints: ['while (j > 0 && a[j - 1] > value) { a[j] = a[j - 1]; j--; }: the j > 0 comes first, so that a[j - 1] is never read when j is 0.', 'After the loop, j is the cell where value belongs: a[j] = value; (already in the starter).'],
            tests: [
              { setup: '        int[] a = {5, 2, 9, 1, 5, 6}; insertionSort(a);', call: 'Arrays.toString(a)', expect: '[1, 2, 5, 5, 6, 9]', name: 'with a repeated value' },
              { setup: '        int[] a = {1, 2, 3, 4, 5}; insertionSort(a);', call: 'Arrays.toString(a)', expect: '[1, 2, 3, 4, 5]', name: 'already sorted' },
              { setup: '        int[] a = {9, 7, 5, 3, 1}; insertionSort(a);', call: 'Arrays.toString(a)', expect: '[1, 3, 5, 7, 9]', name: 'reversed' },
              { setup: '        int[] a = {4}; insertionSort(a); int[] b = {}; insertionSort(b);', call: 'Arrays.toString(a) + " " + Arrays.toString(b)', expect: '[4] []', name: 'one value, and none' },
              { setup: '        int[] a = {-3, 10, -3, 0, 7, -8}; insertionSort(a);', call: 'Arrays.toString(a)', expect: '[-8, -3, -3, 0, 7, 10]', name: 'negative values' },
              { setup: '        int[] a = new int[2000]; for (int i = 0; i < a.length; i++) a[i] = (i * 7919) % 1000; insertionSort(a); boolean ok = true; for (int i = 1; i < a.length; i++) if (a[i - 1] > a[i]) ok = false;', call: 'ok + " " + a[0] + " " + a[1999]', expect: 'true 0 999', name: 'two thousand values' }
            ],
            failTip: 'If the reversed test loops or throws, the while condition reads a[j - 1] with j = 0: test j > 0 first. If values are lost, the final a[j] = value is missing or j is wrong.'
          }
        },
        {
          ex: {
            id: 'ds-3-2', title: 'Sort by length, stably',
            prompt: `<p>Write a method</p><pre class="code">static void sortByLength(String[] words)</pre><p>that sorts the array by the length of each word, shortest first, and is <em>stable</em>: words of the same length stay in the order they had. Use insertion sort. Write only the method.</p>`,
            prelude: 'import java.util.Arrays;',
            starter: `static void sortByLength(String[] words) {\n    // insertion sort, comparing words[j - 1].length() with value.length()\n}`,
            solution: `static void sortByLength(String[] words) {\n    for (int i = 1; i < words.length; i++) {\n        String value = words[i];\n        int j = i;\n        while (j > 0 && words[j - 1].length() > value.length()) {\n            words[j] = words[j - 1];\n            j--;\n        }\n        words[j] = value;\n    }\n}`,
            mustNotContain: [{ re: /Arrays\.sort|Collections\.sort|\.sort\s*\(/, msg: 'Write the sort yourself.' }],
            hints: ['Copy your insertionSort and change the type to String and the comparison to words[j - 1].length() > value.length().', 'Strictly greater (>), not >=: a word stops sliding when it meets one of the same length, which keeps the original order among equals.', 'Selection sort would pass the first test and fail the stability tests: its swap carries a word past others of the same length.'],
            tests: [
              { setup: '        String[] w = {"pear", "fig", "banana", "kiwi", "apple", "date"}; sortByLength(w);', call: 'Arrays.toString(w)', expect: '[fig, pear, kiwi, date, apple, banana]', name: 'four-letter words keep their order' },
              { setup: '        String[] w = {"bb", "aa", "c"}; sortByLength(w);', call: 'Arrays.toString(w)', expect: '[c, bb, aa]', name: 'stable: bb stays before aa' },
              { setup: '        String[] w = {"to", "be", "or", "not", "to", "be"}; sortByLength(w);', call: 'Arrays.toString(w)', expect: '[to, be, or, to, be, not]', name: 'many ties' },
              { setup: '        String[] w = {"single"}; sortByLength(w); String[] e = {}; sortByLength(e);', call: 'Arrays.toString(w) + " " + Arrays.toString(e)', expect: '[single] []', name: 'one word, and none' },
              { setup: '        String[] w = {"", "ab", "", "a"}; sortByLength(w);', call: 'Arrays.toString(w)', expect: '[, , a, ab]', name: 'empty strings' }
            ],
            failTip: 'The second and third tests check stability: [c, aa, bb] means a word was carried past an equal-length one, which happens with >= or with a swap-based sort.'
          }
        },
        {
          ex: {
            id: 'ds-3-3', kind: 'answer', title: 'Counting a sort',
            prompt: `<p>Use the two sorts exactly as written in this lesson: selection sort compares every remaining pair with the current smallest; insertion sort compares the value being inserted with its left neighbour until it finds one that is not larger, or reaches the front. Give each answer as a whole number.</p>`,
            parts: [
              { label: '(a) Comparisons made by selection sort on 10 values (any order).', answer: '45', width: '6rem', wrong: [{ match: '100', msg: 'The inner loop starts at i + 1: 9 + 8 + … + 1.' }, { match: '55', msg: 'That is 1 + 2 + … + 10. The last round compares nothing, so the sum ends at 9.' }, { match: '90', msg: 'Each pair is compared once, not twice.' }] },
              { label: '(b) Comparisons made by insertion sort on 10 values that are already in order.', answer: '9', width: '6rem', wrong: [{ match: '10', msg: 'The first value is never inserted: positions 1 to 9 each cost one comparison.' }, { match: '45', msg: 'That is the reversed case. On sorted input each value stops after one comparison.' }] },
              { label: '(c) Comparisons made by insertion sort on 10 values in reverse order.', answer: '45', width: '6rem', wrong: [{ match: '9', msg: 'That is the sorted case. Here every value slides all the way to the front: the value at position i makes i comparisons.' }, { match: ['90', '100'], msg: 'Position i makes i comparisons, for i from 1 to 9.' }] },
              { label: '(d) Insertion sort takes 2 seconds on 10,000 random values. About how many seconds on 20,000?', answer: '8', width: '6rem', wrong: [{ match: '4', msg: 'Doubling n doubles the work for an O(n) algorithm. This one is O(n²).' }, { match: '16', msg: 'That would be O(n³). Doubling n multiplies n² by four.' }] }
            ],
            hints: ['(a) 9 + 8 + … + 1. (b) one comparison per value from the second on. (c) 1 + 2 + … + 9. (d) O(n²): doubling n multiplies the time by 2² = 4.'],
            solution: `<p>(a) The inner loop runs 9, 8, …, 1 times: <b>45</b>, which is 10 × 9 / 2. (b) Each of the 9 inserted values compares once with its neighbour and stops: <b>9</b>. (c) The value at position i slides past all i values before it: 1 + 2 + … + 9 = <b>45</b>. (d) 2 × 4 = <b>8</b> seconds: double the input, four times the work.</p>`,
            followup: 'Parts (b) and (c) are the same algorithm on the same number of values, and the counts differ by a factor of five. Best and worst cases are not a technicality; they are the difference between an instant and a wait.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>Sorting puts values in order; its cost is counted in comparisons and moves; a sort is stable if equal values keep their order.</li>
<li>Selection sort: find the smallest, swap it to the front, repeat. Exactly n(n−1)/2 comparisons on every input, at most 3n moves, not stable.</li>
<li>Insertion sort: slide each value left into the sorted prefix. From n − 1 comparisons (sorted input) to n(n−1)/2 (reversed): O(n) best, O(n²) worst, stable, and the right choice for small or nearly sorted arrays.</li>
<li>The invariant of each sort is also the source of its cost: selection sort cannot stop early, insertion sort can.</li>
<li>Both are O(n²); doubling the input multiplies the work by four. For large inputs the next lesson's O(n log n) sorts are the only choice.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Divide and conquer: merge sort and quicksort', summary: 'Why splitting a problem in half and recursing gives n log n; merge sort, its merge step and its guarantee; quicksort, its partition step and its gamble; the recursion tree that explains both; and which one the library actually runs.',
      blocks: [
        `<p>The first sorting program ever written for a stored-program computer was a merge sort. John von Neumann wrote it in 1945 for the EDVAC, a machine that did not yet exist, in a notation he invented for the purpose; Donald Knuth, who later studied the manuscript, described it as the first program written for a computer of that kind. Von Neumann chose merging because it suited a machine that read data from a tape in order: two sorted tapes can be merged into one by reading each from the front and always taking the smaller, and the method never needs to jump back.</p>`,
        { photo: 'edvac', caption: 'The EDVAC as it was finally built, at the Army\'s Ballistic Research Laboratory, with an operator at its controls and a paper tape machine at the back. Von Neumann wrote his merge sort for it years before the machine was built.' },
        `<p>Fourteen years later a young Englishman named Tony Hoare was a visiting student in Moscow, working on machine translation. To translate a Russian sentence his program had to look its words up in a dictionary stored on magnetic tape, and the lookups would go much faster if the words were sorted first. He thought of a way to do it in place: pick one word, move everything smaller before it and everything larger after it, then do the same to each side. He had no computer to try it on, and no language to write it in that could call itself; when he learned Algol 60 the next year and saw that it allowed recursion, he wrote quicksort down in a few lines, and published it in 1961.</p>`,
        `<p>These are the two sorts the world runs, and they share one idea: <em>split the array, sort the pieces, combine</em>. Merge sort splits trivially and does its work combining; quicksort does its work splitting and combines trivially. This lesson is about why that idea turns n² into n log n, and about the price each sort pays for it.</p>
<h2>Merging two sorted runs</h2>
<p>Everything in merge sort rests on one step. Given two sorted runs side by side in an array, <code>a[lo..mid−1]</code> and <code>a[mid..hi−1]</code>, produce one sorted run <code>a[lo..hi−1]</code>. Keep a finger on the front of each run; copy the smaller of the two values and advance that finger; when one run is used up, copy the rest of the other. Every value is copied exactly once, so the merge costs <code>hi − lo</code> moves and at most <code>hi − lo − 1</code> comparisons, whatever the values are. It needs a second array to copy into: you cannot merge in place without losing the invariant.</p>`,
        { play: `import java.util.Arrays;

public class Main {
    static int comparisons;

    // merge the sorted runs a[lo..mid-1] and a[mid..hi-1], using aux as scratch space
    static void merge(int[] a, int lo, int mid, int hi, int[] aux) {
        int i = lo, j = mid, k = lo;
        while (i < mid && j < hi) {
            comparisons++;
            if (a[i] <= a[j]) aux[k++] = a[i++];     // <=, not <: ties take the left value first (stability)
            else aux[k++] = a[j++];
        }
        while (i < mid) aux[k++] = a[i++];
        while (j < hi) aux[k++] = a[j++];
        for (k = lo; k < hi; k++) a[k] = aux[k];
    }

    public static void main(String[] args) {
        int[] a = {3, 9, 27, 38, 43, 82, 1, 5, 10, 12, 14, 56};
        merge(a, 0, 6, 12, new int[a.length]);
        System.out.println(Arrays.toString(a) + "   comparisons: " + comparisons);
        int[] b = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
        comparisons = 0;
        merge(b, 0, 6, 12, new int[b.length]);
        System.out.println(Arrays.toString(b) + "   comparisons: " + comparisons);
    }
}`, caption: 'Twelve values merged with 11 comparisons, one fewer than the number of values; when the left run is entirely smaller, 6 comparisons empty it and the rest are copied without looking. The ++ inside the brackets reads the index and then advances it: aux[k++] = a[i++] copies a value and moves both fingers in one line.' },
        { check: "Merging two sorted runs of total length m costs at most how many comparisons?", options: ["m − 1", "m log m", "m²"], answer: 0, why: "Each comparison copies one value, and after one run is used up the rest is copied without comparing." },
        `<h2>Merge sort</h2>
<p>If merging two sorted halves is cheap, sort each half first. How? By the same method: split it in two, sort the quarters, merge. A run of one value is already sorted, so the splitting stops there. That is the whole algorithm, and it is naturally written as a method that calls itself.</p>`,
        { play: `import java.util.Arrays;

public class Main {
    static int comparisons;

    static void merge(int[] a, int lo, int mid, int hi, int[] aux) {
        int i = lo, j = mid, k = lo;
        while (i < mid && j < hi) { comparisons++; if (a[i] <= a[j]) aux[k++] = a[i++]; else aux[k++] = a[j++]; }
        while (i < mid) aux[k++] = a[i++];
        while (j < hi) aux[k++] = a[j++];
        for (k = lo; k < hi; k++) a[k] = aux[k];
    }

    // sort a[lo..hi-1]
    static void sort(int[] a, int lo, int hi, int[] aux) {
        if (hi - lo < 2) return;                     // 0 or 1 values: already sorted
        int mid = (lo + hi) >>> 1;
        sort(a, lo, mid, aux);
        sort(a, mid, hi, aux);
        merge(a, lo, mid, hi, aux);
    }

    static void mergeSort(int[] a) { sort(a, 0, a.length, new int[a.length]); }

    public static void main(String[] args) {
        int[] a = {38, 27, 43, 3, 9, 82, 10, 1, 56, 14, 71, 5, 29, 66, 48, 12};
        mergeSort(a);
        System.out.println(Arrays.toString(a) + "   comparisons: " + comparisons);
        for (int n : new int[] {1000, 2000, 4000, 8000}) {
            int[] b = new int[n];
            for (int i = 0; i < n; i++) b[i] = (i * 7919) % 10007;
            comparisons = 0;
            mergeSort(b);
            System.out.printf("n = %5d: %6d comparisons, %.2f per value%n", n, comparisons, (double) comparisons / n);
        }
    }
}`, caption: 'Sixteen values in 49 comparisons (n log₂ n is 64; the quadratic sorts need up to 120). Doubling n does not quadruple the count: it a little more than doubles it, and the comparisons per value grow by exactly one each time, which is what log₂ n does.' },
        `<div class="stmt"><p><span class="kind">Merge sort.</span> Split the array in half, sort each half recursively, merge. A run of fewer than two values is the base case.</p>
<p><span class="kind">Cost.</span> Every level of the recursion merges a total of <code>n</code> values, and there are <code>⌈log₂ n⌉</code> levels, so the work is <code>n log n</code> comparisons at most, on every input: there is no bad case. It uses <code>n</code> extra cells of memory, and it is stable if the merge takes from the left on ties.</p></div>
<p>The figure runs merge sort from the bottom up, which is how von Neumann's tapes did it: runs of 1 merge into runs of 2, then 4, then 8. Step through one merge, then let it play. The top-down recursion above does the same merges in a different order.</p>`,
        { fig: 'mergeviz', caption: 'Sixteen values. The top row is the runs being merged (the two highlighted blocks), the bottom row the merged output being built left to right. Each round halves the number of runs; four rounds for sixteen values, because 2⁴ = 16.' },
        { check: "Why is merge sort O(n log n)?", options: ["Because merging is O(log n)", "Each level of the recursion merges n values in total, and there are log n levels", "Because it uses a second array"], answer: 1, why: "Halving gives log n levels; linear work at each level gives n per level. Total n log n, on every input." },
        `<h2>Why n log n: the recursion tree</h2>
<p>Draw the calls as a tree. At the top, one call on <code>n</code> values; below it two calls on <code>n/2</code> each; below those four on <code>n/4</code>, and so on down to <code>n</code> calls on one value each. The merging done at any one level adds up to <code>n</code> moves, because the runs at that level between them contain every value once. The number of levels is how many times you can halve <code>n</code> before reaching 1, which is <code>log₂ n</code>: 10 levels for a thousand, 20 for a million. Total: <code>n</code> per level × <code>log n</code> levels.</p>
<p>This is the argument to remember. It applies to any algorithm that splits a problem into halves and does linear work to split or to join: the splitting gives the <code>log</code>, the linear work at each level gives the <code>n</code>. Compare it with lesson 2's binary search, which also halves but does only constant work at each level, and so costs <code>log n</code> with no <code>n</code> in front.</p>
<h2>Quicksort: doing the work on the way down</h2>
<p>Hoare's idea turns merge sort inside out. Instead of splitting in the middle and working to combine, choose a <em>pivot</em> value and rearrange the array so that everything less than the pivot is to its left and everything greater is to its right. The pivot is now in its final position. Then sort the left part and the right part recursively, and there is nothing to combine: the two parts are already in the right place relative to each other.</p>
<p>The rearranging step is called <em>partition</em>. The version below, due to Nico Lomuto, is the simplest to write and to prove: take the last value as the pivot, and walk a finger <code>j</code> along the array, keeping everything before a second finger <code>i</code> less than the pivot. Whenever <code>a[j]</code> is smaller than the pivot, swap it into position <code>i</code> and advance <code>i</code>. At the end, swap the pivot into position <code>i</code>.</p>`,
        { fig: 'partition', caption: 'Lomuto partition with the last value as pivot. The invariant at every step: cells before i are less than the pivot, cells from i to j − 1 are greater or equal, cells from j on are not yet examined. Watch the invariant hold at every step, then Shuffle and watch it again.' },
        { play: `import java.util.Arrays;

public class Main {
    static int comparisons;

    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }

    // rearrange a[lo..hi] round the pivot a[hi]; return the pivot's final index
    static int partition(int[] a, int lo, int hi) {
        int pivot = a[hi];
        int i = lo;
        for (int j = lo; j < hi; j++) {
            comparisons++;
            if (a[j] < pivot) { swap(a, i, j); i++; }
        }
        swap(a, i, hi);
        return i;
    }

    // sort a[lo..hi] (inclusive on both ends this time, as Hoare wrote it)
    static void sort(int[] a, int lo, int hi) {
        if (lo >= hi) return;
        int p = partition(a, lo, hi);
        sort(a, lo, p - 1);
        sort(a, p + 1, hi);
    }

    static void quickSort(int[] a) { sort(a, 0, a.length - 1); }

    public static void main(String[] args) {
        int[] a = {29, 10, 14, 37, 13, 7, 41, 22, 18, 25};
        int p = partition(a, 0, a.length - 1);
        System.out.println("pivot 25 lands at " + p + ": " + Arrays.toString(a));
        int[] b = {38, 27, 43, 3, 9, 82, 10, 1, 56, 14, 71, 5, 29, 66, 48, 12};
        comparisons = 0;
        quickSort(b);
        System.out.println(Arrays.toString(b) + "   comparisons: " + comparisons);
    }
}`, caption: 'After one partition, 25 is at index 6 with the six smaller values left of it and the three larger ones right of it: 25 will never move again. The full sort of the same sixteen values that merge sort did in 49 comparisons here takes 47: about the same comparing, but no copying into a second array, which is why in practice quicksort is usually the faster of the two.' },
        `<div class="stmt"><p><span class="kind">Quicksort.</span> Partition round a pivot; the pivot is then in its final place; sort the two sides recursively. A part of fewer than two values is the base case.</p>
<p><span class="kind">Cost.</span> Partition costs <code>n − 1</code> comparisons. If the pivot lands near the middle every time, the recursion tree has <code>log n</code> levels and the sort costs about <code>1.39 n log₂ n</code> comparisons on average. If the pivot is always the smallest or largest value, one side is empty, the tree has <code>n</code> levels, and the cost is <code>n²/2</code>: quadratic. In place, not stable.</p></div>
<h2>The gamble, and how to hedge it</h2>
<p>When does the last value make the worst pivot? When the array is already sorted. Then every partition peels off one value, and sorting a sorted array, the easiest possible input, takes <code>n²/2</code> comparisons. Insertion sort does it in <code>n</code>. This is not a theoretical worry: sorted and nearly sorted inputs are the most common inputs there are.</p>`,
        { play: `public class Main {
    static int comparisons;
    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }

    static int partition(int[] a, int lo, int hi) {
        int pivot = a[hi], i = lo;
        for (int j = lo; j < hi; j++) { comparisons++; if (a[j] < pivot) { swap(a, i, j); i++; } }
        swap(a, i, hi);
        return i;
    }

    static void sort(int[] a, int lo, int hi, boolean middlePivot) {
        if (lo >= hi) return;
        if (middlePivot) swap(a, (lo + hi) >>> 1, hi);   // move the middle value to the end, where partition expects the pivot
        int p = partition(a, lo, hi);
        sort(a, lo, p - 1, middlePivot);
        sort(a, p + 1, hi, middlePivot);
    }

    public static void main(String[] args) {
        int n = 1000;
        for (boolean middle : new boolean[] {false, true}) {
            int[] sorted = new int[n], shuffled = new int[n];
            for (int i = 0; i < n; i++) { sorted[i] = i; shuffled[i] = (i * 7919) % 1009; }
            comparisons = 0; sort(shuffled, 0, n - 1, middle);
            System.out.print((middle ? "middle pivot" : "last pivot  ") + "   shuffled input: " + comparisons + " comparisons");
            comparisons = 0; sort(sorted, 0, n - 1, middle);
            System.out.println("   sorted input: " + comparisons);
        }
        System.out.println("n log2 n is about " + Math.round(n * Math.log(n) / Math.log(2)) + "; n^2 / 2 is " + n * n / 2);
    }
}`, caption: 'With the last value as pivot, sorted input costs n²/2 comparisons: a thousand values take half a million, fifty times the shuffled case, and the recursion goes a thousand calls deep. Taking the middle value as pivot makes sorted input the best case instead. Real implementations choose the pivot at random, or as the median of three samples, so that no fixed input shape can be the bad one.' },
        { check: "Quicksort with the last value as pivot is given an already sorted array. What happens?", options: ["Its best case: O(n log n)", "Its worst case: every partition peels off one value, O(n²)", "It stops early"], answer: 1, why: "The pivot is the largest, so one side is empty each time and the recursion goes n deep: n²/2 comparisons for the easiest possible input." },
        `<p>Three fixes are in common use. <em>Random pivot</em>: swap a randomly chosen cell to the end before partitioning; no input is bad in advance, and the quadratic case becomes an event of vanishing probability. <em>Median of three</em>: look at the first, middle and last values and use the middle one; cheap and good on sorted and reverse-sorted input. <em>Introsort</em>: keep a count of the recursion depth and, if it exceeds about <code>2 log₂ n</code>, finish that part with heapsort (a later lesson), which guarantees <code>n log n</code>. C++'s <code>std::sort</code> is an introsort.</p>
<h2>Which one, and which does the library run?</h2>
<table class="growth-table"><thead><tr><th></th><th>Merge sort</th><th>Quicksort</th></tr></thead><tbody>
<tr><td>Worst case</td><td>n log n</td><td>n² (random pivot: with vanishing probability)</td></tr>
<tr><td>Average</td><td>n log n</td><td>n log n, with a smaller constant</td></tr>
<tr><td>Extra memory</td><td>n cells</td><td>log n (the recursion stack)</td></tr>
<tr><td>Stable</td><td>yes</td><td>no</td></tr>
<tr><td>Works on linked lists and tapes</td><td>yes</td><td>no (needs random access)</td></tr>
</tbody></table>
<p>Java's <code>Arrays.sort</code> makes the same choice twice over. For arrays of primitives (<code>int[]</code>, <code>double[]</code>) it uses a quicksort with two pivots, because stability is meaningless for plain numbers and in-place speed wins. For arrays of objects and for <code>Collections.sort</code> it uses TimSort, a merge sort that first looks for runs already in order, because sorting records by one key must not scramble their order by another. When you call the library you are calling one of this lesson's two algorithms, chosen for exactly the reasons in the table.</p>`,
        { play: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] nums = {38, 27, 43, 3, 9, 82, 10};
        Arrays.sort(nums);                               // a dual-pivot quicksort underneath
        System.out.println(Arrays.toString(nums));

        String[] words = {"pear", "fig", "banana", "kiwi", "apple", "date"};
        Arrays.sort(words);                              // TimSort, a merge sort
        System.out.println(Arrays.toString(words));
    }
}`, caption: 'The same method name, two different algorithms, chosen by the type of the array. The documentation of Arrays.sort for Object[] promises that the sort is stable; the one for int[] promises nothing of the kind, because it does not need to.' },
        `<details class="reveal"><summary>Puzzle: merge sort on 8 values makes how many merges, and how many levels? Quicksort on 8 values whose pivots always land exactly in the middle: how many comparisons in total?</summary><p>Merge sort: 7 merges (4 of size 2, 2 of size 4, 1 of size 8) over 3 levels, since 2³ = 8. Quicksort with the best pivots: 7 at the top level (the pivot against the other 7), leaving parts of 3 and 4; the 3 costs 2 and leaves two parts of 1; the 4 costs 3 and leaves parts of 1 and 2; the 2 costs 1. That is 7 + 2 + 3 + 1 = 13 comparisons. Merge sort on 8 values makes between 12 and 17, so a lucky quicksort and merge sort compare about equally often. Quicksort usually wins on the clock for other reasons: it works in place, with no second array to copy into, and its inner loop is very short. And it needs help not to be unlucky.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> A merge that uses <code>&lt;</code> instead of <code>&lt;=</code>, which still sorts but is not stable. Forgetting to copy the leftovers of the run that was not used up. A merge sort whose base case is <code>hi − lo &lt; 1</code> instead of <code>&lt; 2</code>, which recurses forever on a run of one. Allocating a new <code>aux</code> array inside every call (correct, but it turns an n log n sort into one that spends most of its time allocating). A quicksort that recurses on <code>lo..p</code> instead of <code>lo..p − 1</code>, which never shrinks when the pivot is the largest value. Choosing the first or last value as pivot in production code.</p>` },
        {
          ex: {
            id: 'ds-4-1', title: 'Merge',
            prompt: `<p>Write a method</p><pre class="code">static void merge(int[] a, int lo, int mid, int hi, int[] aux)</pre><p>that merges the two sorted runs <code>a[lo..mid−1]</code> and <code>a[mid..hi−1]</code> into one sorted run <code>a[lo..hi−1]</code>, using <code>aux</code> (an array at least as long as <code>a</code>) as scratch space. The merge must be <em>stable</em>: when the two front values are equal, take the one from the left run. Write only the method.</p>`,
            prelude: 'import java.util.Arrays;',
            starter: `static void merge(int[] a, int lo, int mid, int hi, int[] aux) {\n    int i = lo, j = mid, k = lo;\n    // while both runs have values left, copy the smaller front value into aux[k]\n    // then copy whatever is left of either run\n    // finally copy aux[lo..hi-1] back into a\n}`,
            solution: `static void merge(int[] a, int lo, int mid, int hi, int[] aux) {\n    int i = lo, j = mid, k = lo;\n    while (i < mid && j < hi) {\n        if (a[i] <= a[j]) aux[k++] = a[i++];\n        else aux[k++] = a[j++];\n    }\n    while (i < mid) aux[k++] = a[i++];\n    while (j < hi) aux[k++] = a[j++];\n    for (k = lo; k < hi; k++) a[k] = aux[k];\n}`,
            mustNotContain: [{ re: /Arrays\.sort|Collections\.sort|\.sort\s*\(/, msg: 'Merge the two runs yourself; do not sort.' }],
            hints: ['while (i < mid && j < hi): compare a[i] with a[j]; copy the smaller into aux[k] and advance k and the finger you took from.', 'Use <= so that on a tie the left value goes first.', 'After the main loop one run may have values left: two more while loops copy them. Then for (k = lo; k < hi; k++) a[k] = aux[k];'],
            tests: [
              { setup: '        int[] a = {3, 9, 27, 38, 43, 82, 1, 5, 10, 12, 14, 56}; merge(a, 0, 6, 12, new int[12]);', call: 'Arrays.toString(a)', expect: '[1, 3, 5, 9, 10, 12, 14, 27, 38, 43, 56, 82]', name: 'two runs of six' },
              { setup: '        int[] a = {1, 2, 3, 7, 8, 9}; merge(a, 0, 3, 6, new int[6]);', call: 'Arrays.toString(a)', expect: '[1, 2, 3, 7, 8, 9]', name: 'left run entirely smaller' },
              { setup: '        int[] a = {7, 8, 9, 1, 2, 3}; merge(a, 0, 3, 6, new int[6]);', call: 'Arrays.toString(a)', expect: '[1, 2, 3, 7, 8, 9]', name: 'right run entirely smaller' },
              { setup: '        int[] a = {99, 2, 5, 5, 1, 5, 6, 99}; merge(a, 1, 4, 7, new int[8]);', call: 'Arrays.toString(a)', expect: '[99, 1, 2, 5, 5, 5, 6, 99]', name: 'in the middle of a larger array' },
              { setup: '        int[] a = {4, 4}; merge(a, 0, 1, 2, new int[2]); int[] b = {5}; merge(b, 0, 1, 1, new int[1]);', call: 'Arrays.toString(a) + " " + Arrays.toString(b)', expect: '[4, 4] [5]', name: 'tiny runs, and an empty right run' },
              { setup: '        int[] a = {10, 20, 30, 10, 20, 30}; int[] aux = new int[6]; merge(a, 0, 3, 6, aux);', call: 'Arrays.toString(a)', expect: '[10, 10, 20, 20, 30, 30]', name: 'ties' }
            ],
            failTip: 'If the result has repeated or missing values, the copy-back loop or a leftover loop is wrong. If the sort of a run of one fails, the loops must cope with an empty right run (j == hi from the start).'
          }
        },
        {
          ex: {
            id: 'ds-4-2', title: 'Merge sort',
            prompt: `<p>Write</p><pre class="code">static void mergeSort(int[] a)</pre><p>that sorts <code>a</code> into increasing order by merge sort. You will want a recursive helper <code>sort(a, lo, hi, aux)</code> and the <code>merge</code> method from the previous exercise; write all of them (the checker supplies only a <code>main</code>). Allocate the scratch array once, in <code>mergeSort</code>, not inside the recursion. Do not call the library's sort.</p>`,
            prelude: 'import java.util.Arrays;',
            starter: `static void merge(int[] a, int lo, int mid, int hi, int[] aux) {\n    // from the previous exercise\n}\n\nstatic void sort(int[] a, int lo, int hi, int[] aux) {\n    // base case: fewer than two values\n    // split at the middle, sort both halves, merge\n}\n\nstatic void mergeSort(int[] a) {\n    sort(a, 0, a.length, new int[a.length]);\n}`,
            solution: `static void merge(int[] a, int lo, int mid, int hi, int[] aux) {\n    int i = lo, j = mid, k = lo;\n    while (i < mid && j < hi) {\n        if (a[i] <= a[j]) aux[k++] = a[i++];\n        else aux[k++] = a[j++];\n    }\n    while (i < mid) aux[k++] = a[i++];\n    while (j < hi) aux[k++] = a[j++];\n    for (k = lo; k < hi; k++) a[k] = aux[k];\n}\n\nstatic void sort(int[] a, int lo, int hi, int[] aux) {\n    if (hi - lo < 2) return;\n    int mid = (lo + hi) >>> 1;\n    sort(a, lo, mid, aux);\n    sort(a, mid, hi, aux);\n    merge(a, lo, mid, hi, aux);\n}\n\nstatic void mergeSort(int[] a) {\n    sort(a, 0, a.length, new int[a.length]);\n}`,
            mustNotContain: [{ re: /Arrays\.sort|Collections\.sort|\.sort\s*\(/, msg: 'Write the sort yourself; the library’s sort is what you are learning to write.' }],
            hints: ['if (hi - lo < 2) return; is the base case. A run of one is sorted; a run of none is too.', 'int mid = (lo + hi) >>> 1; then sort(a, lo, mid, aux); sort(a, mid, hi, aux); merge(a, lo, mid, hi, aux);', 'The last test sorts ten thousand values. Merge sort does it in about 130,000 comparisons; a quadratic sort would need fifty million and the checker would time out.'],
            tests: [
              { setup: '        int[] a = {38, 27, 43, 3, 9, 82, 10, 1, 56, 14, 71, 5, 29, 66, 48, 12}; mergeSort(a);', call: 'Arrays.toString(a)', expect: '[1, 3, 5, 9, 10, 12, 14, 27, 29, 38, 43, 48, 56, 66, 71, 82]', name: 'sixteen values' },
              { setup: '        int[] a = {5, 2, 9, 1, 5, 6, 2}; mergeSort(a);', call: 'Arrays.toString(a)', expect: '[1, 2, 2, 5, 5, 6, 9]', name: 'odd length, repeats' },
              { setup: '        int[] a = {9, 8, 7, 6, 5, 4, 3, 2, 1}; mergeSort(a);', call: 'Arrays.toString(a)', expect: '[1, 2, 3, 4, 5, 6, 7, 8, 9]', name: 'reversed' },
              { setup: '        int[] a = {4}; mergeSort(a); int[] b = {}; mergeSort(b); int[] c = {2, 1}; mergeSort(c);', call: 'Arrays.toString(a) + " " + Arrays.toString(b) + " " + Arrays.toString(c)', expect: '[4] [] [1, 2]', name: 'one, none, two' },
              { setup: '        int[] a = {-3, 10, -3, 0, 7, -8, 2147483647, -2147483648}; mergeSort(a);', call: 'Arrays.toString(a)', expect: '[-2147483648, -8, -3, -3, 0, 7, 10, 2147483647]', name: 'negatives and extremes' },
              { setup: '        int[] a = new int[10000]; for (int i = 0; i < a.length; i++) a[i] = (i * 7919) % 10007; mergeSort(a); boolean ok = true; for (int i = 1; i < a.length; i++) if (a[i - 1] > a[i]) ok = false;', call: 'ok + " " + a[0] + " " + a[9999]', expect: 'true 0 10006', name: 'ten thousand values' }
            ],
            failTip: 'If the checker times out, the recursion is not shrinking (base case or mid wrong) or the sort is quadratic. If values go missing, check the merge’s leftover loops and copy-back.'
          }
        },
        {
          ex: {
            id: 'ds-4-3', title: 'Partition',
            prompt: `<p>Write</p><pre class="code">static int partition(int[] a, int lo, int hi)</pre><p>that partitions <code>a[lo..hi]</code> (inclusive) round the pivot <code>a[hi]</code> by Lomuto's method, so that afterwards every value left of the pivot is less than it and every value right of it is greater or equal, and returns the pivot's final index. Write only the method, plus any helper you want.</p>`,
            prelude: 'import java.util.Arrays;',
            starter: `static int partition(int[] a, int lo, int hi) {\n    int pivot = a[hi];\n    int i = lo;\n    // for j from lo to hi - 1: if a[j] < pivot, swap a[i] and a[j], then i++\n    // finally swap the pivot into position i and return i\n}`,
            solution: `static int partition(int[] a, int lo, int hi) {\n    int pivot = a[hi];\n    int i = lo;\n    for (int j = lo; j < hi; j++) {\n        if (a[j] < pivot) {\n            int t = a[i]; a[i] = a[j]; a[j] = t;\n            i++;\n        }\n    }\n    int t = a[i]; a[i] = a[hi]; a[hi] = t;\n    return i;\n}`,
            mustNotContain: [{ re: /Arrays\.sort|Collections\.sort|\.sort\s*\(/, msg: 'Partition, do not sort: the array should not come out sorted.' }],
            hints: ['The invariant: a[lo..i-1] < pivot and a[i..j-1] >= pivot. When a[j] < pivot, swapping it with a[i] extends the first part by one.', 'After the loop, a[i] is the first value >= pivot (or hi if there is none): swap it with a[hi], and the pivot sits at i.'],
            tests: [
              { setup: '        int[] a = {29, 10, 14, 37, 13, 7, 41, 22, 18, 25}; int p = partition(a, 0, 9);', call: 'p + " " + Arrays.toString(a)', expect: '6 [10, 14, 13, 7, 22, 18, 25, 29, 37, 41]', name: 'the lesson’s example' },
              { setup: '        int[] a = {5, 1, 4, 2, 3}; int p = partition(a, 0, 4);', call: 'p + " " + Arrays.toString(a)', expect: '2 [1, 2, 3, 5, 4]', name: 'pivot in the middle' },
              { setup: '        int[] a = {1, 2, 3, 4, 5}; int p = partition(a, 0, 4);', call: 'p + " " + Arrays.toString(a)', expect: '4 [1, 2, 3, 4, 5]', name: 'pivot is the largest' },
              { setup: '        int[] a = {5, 4, 3, 2, 1}; int p = partition(a, 0, 4);', call: 'p + " " + Arrays.toString(a)', expect: '0 [1, 4, 3, 2, 5]', name: 'pivot is the smallest' },
              { setup: '        int[] a = {7, 7, 7, 7}; int p = partition(a, 0, 3);', call: 'p + " " + Arrays.toString(a)', expect: '0 [7, 7, 7, 7]', name: 'all equal' },
              { setup: '        int[] a = {0, 0, 9, 3, 8, 5, 0, 0}; int p = partition(a, 2, 5);', call: 'p + " " + Arrays.toString(a)', expect: '3 [0, 0, 3, 5, 8, 9, 0, 0]', name: 'a slice in the middle' },
              { setup: '        int[] a = {42}; int p = partition(a, 0, 0);', call: 'p + " " + Arrays.toString(a)', expect: '0 [42]', name: 'one value' }
            ],
            failTip: 'The checker compares the exact arrangement, which Lomuto’s method fixes completely: loop j from lo to hi − 1, swap on strictly less than, swap the pivot in last. If the equal-values test returns 3, you used <= in the comparison.'
          }
        },
        {
          ex: {
            id: 'ds-4-4', kind: 'answer', title: 'Levels and leaves',
            prompt: `<p>Use the costs from this lesson: a merge of <code>m</code> values makes at most <code>m − 1</code> comparisons; Lomuto partition of <code>m</code> values makes exactly <code>m − 1</code>. Give whole numbers.</p>`,
            parts: [
              { label: '(a) Merge sort on 1024 values: how many levels of merging are there?', answer: '10', width: '6rem', wrong: [{ match: '1024', msg: 'Levels, not calls. Each level halves the run length: how many halvings take 1024 down to 1?' }, { match: '11', msg: 'Runs of 1 need no merge. The merges produce runs of 2, 4, …, 1024: count them.' }] },
              { label: '(b) Merge sort on 1024 values: the greatest possible total number of comparisons? (n log₂ n minus the ones saved: each merge of m values makes at most m − 1.)', answer: '9217', width: '6rem', wrong: [{ match: '10240', msg: 'That is n log₂ n exactly. Every merge saves at least one comparison, and there are 1023 merges.' }, { match: '1023', msg: 'That is the number of merges, not of comparisons.' }] },
              { label: '(c) Quicksort with the last value as pivot, on 100 values already in increasing order: total comparisons?', answer: '4950', width: '6rem', wrong: [{ match: '99', msg: 'That is the first partition alone. The pivot is the largest value, so the left part has 99 values and the whole thing happens again.' }, { match: ['10000', '5000'], msg: 'Partitions of 100, 99, …, 2 values cost 99 + 98 + … + 1.' }] },
              { label: '(d) Quicksort on 1,000,000 values with a random pivot takes 1 second. Merge sort on the same machine takes about 1.4 seconds. About how long would a quadratic sort take, in hours, if a comparison costs the same? (Use n²/2 against 1.39 n log₂ n, round to the nearest hour.)', answer: '5', width: '6rem', wrong: [{ match: ['18000', '17986', '17985'], msg: 'That is the ratio in seconds; the question asks for hours.' }, { match: '4', msg: 'n²/2 = 5 × 10¹¹; 1.39 n log₂ n ≈ 2.77 × 10⁷; the ratio is about 18,000 seconds.' }] }
            ],
            hints: ['(a) 2¹⁰ = 1024. (b) 10 levels × 1024 = 10,240, minus one per merge; a merge sort of n values makes n − 1 merges. (c) 99 + 98 + … + 1 = 99 × 100 / 2. (d) Divide n²/2 by 1.39 n log₂ n, then by 3600.'],
            solution: `<p>(a) <b>10</b>: 1024 = 2¹⁰. (b) <b>9217</b>: 10 × 1024 = 10,240 comparisons if every merge used all of them; each of the 1023 merges saves at least one, so 10,240 − 1023. (c) <b>4950</b>: 99 + 98 + … + 1. (d) <b>5</b> hours: 5 × 10¹¹ / (1.39 × 10⁶ × 20) ≈ 18,000 seconds.</p>`,
            followup: 'Part (d) is the whole reason this lesson exists: on a million values, the difference between n² and n log n is the difference between a second and an afternoon.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>Divide and conquer: split, solve the parts recursively, combine. Halving gives log n levels; linear work per level gives n log n.</li>
<li>Merge sort: split in the middle, merge sorted halves. n log n on every input, stable, needs n extra cells, works on tapes and linked lists.</li>
<li>Quicksort: partition round a pivot, recurse on both sides. n log n on average with a smaller constant, in place, not stable, n² if the pivots are bad; random or median-of-three pivots make bad pivots unlikely.</li>
<li>Lomuto partition keeps the invariant "less than pivot | greater or equal | unseen" and costs n − 1 comparisons.</li>
<li>Java's <code>Arrays.sort</code> is a quicksort for primitives and a merge sort (TimSort) for objects, for exactly the reasons in the table.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Linked lists', summary: 'A structure made of nodes that point to each other; what it makes cheap (changing the front, splicing) and expensive (reaching an index); writing one in Java with two classes; reversing it in place; and why ArrayList still wins most of the time.',
      blocks: [
        `<p>In 1956 three researchers, Allen Newell, Herbert Simon and Cliff Shaw, were building a program they called the Logic Theorist, to run on JOHNNIAC, a computer at the RAND Corporation in California, which could prove theorems from Russell and Whitehead's <em>Principia Mathematica</em>. Its data, logical expressions, were not of fixed size: a proof grew and branched as the program worked, and no array laid out in advance could hold it. So in the language they designed for it, IPL, every piece of data was a <em>cell</em> holding a value and the address of the next cell. A list was a chain of cells, and growing it meant making a new cell and changing one address. John McCarthy saw IPL, found it clumsy, and made the idea elegant in Lisp two years later; the linked list has been one of the two basic ways to hold a sequence ever since.</p>`,
        { photo: 'johnniac', caption: 'JOHNNIAC, the computer at RAND on which the Logic Theorist ran, now in the Computer History Museum in California. The cabinets are packed with rows of valves (vacuum tubes); its operators sat at the console in front.' },
        `<p>The other way is the array. The two are opposites, and this lesson is the comparison. An array is one block of memory with its values side by side: reaching cell <code>i</code> is arithmetic, but making room at the front means shifting everything. A linked list is many small blocks joined by addresses: making room anywhere means changing two addresses, but reaching cell <code>i</code> means walking there, because there is no arithmetic that finds it.</p>
<h2>A node and a chain of them</h2>
<p>In Java a node is a small class with two fields, the value and a reference to the next node. The last node's <code>next</code> is <code>null</code>. The list itself is just a reference to the first node, called the <em>head</em>; an empty list is a <code>null</code> head.</p>`,
        { fig: 'linkedlist', caption: 'Each box is a node: a value and the address of the next node. Try Get index 3 and count the hops; then Add first and see that nothing is walked; then Insert at index 2 and watch two arrows change while no value moves.' },
        { play: `class Node {
    int value;
    Node next;
    Node(int value, Node next) { this.value = value; this.next = next; }
}

public class Main {
    public static void main(String[] args) {
        Node head = null;                                  // the empty list
        head = new Node(9, head);                          // add at the front: new node whose next is the old head
        head = new Node(3, head);
        head = new Node(7, head);
        head = new Node(12, head);

        for (Node cur = head; cur != null; cur = cur.next)  // the walk: every linked-list algorithm has this loop
            System.out.print(cur.value + " -> ");
        System.out.println("null");

        int count = 0;
        for (Node cur = head; cur != null; cur = cur.next) count++;
        System.out.println("length " + count + ", first " + head.value + ", second " + head.next.value);
    }
}`, caption: 'Four addFirst operations build 12 -> 7 -> 3 -> 9; each is O(1) because nothing is walked. The for loop that follows next until null is the one idiom of this lesson: there is no index, only "the current node" and "the next one".' },
        { check: "In a singly linked list with only a head reference, adding at the front costs…", options: ["O(1): a new node whose next is the old head", "O(n): walk to the end", "O(log n)"], answer: 0, why: "Make a node, point it at the old head, point head at it. Nothing is walked and nothing shifts." },
        `<div class="stmt"><p><span class="kind">Singly linked list.</span> Nodes each holding a value and a reference <code>next</code>; a <code>head</code> reference to the first; <code>null</code> marks the end. Optionally a <code>size</code> count and a <code>tail</code> reference to the last node.</p>
<p><span class="kind">Cheap, O(1).</span> Add or remove at the front. Add at the back, if a tail reference is kept. Insert or remove <em>after a node you are already holding</em>.</p>
<p><span class="kind">Expensive, O(n).</span> Reach index <code>i</code> (walk <code>i</code> hops). Find a value. Remove a value by searching for it. Anything that says "the i-th".</p></div>
<h2>The list as a class</h2>
<p>Nobody passes bare nodes around. The list is wrapped in a class that owns the head and the size, so that the user calls <code>list.addFirst(5)</code> and never sees a <code>Node</code>. The lesson's version below is an <code>IntList</code>; the exercises ask you to finish it.</p>`,
        { play: `class Node {
    int value;
    Node next;
    Node(int value, Node next) { this.value = value; this.next = next; }
}

class IntList {
    private Node head;
    private int size;

    int size() { return size; }

    void addFirst(int v) { head = new Node(v, head); size++; }

    void addLast(int v) {
        if (head == null) { head = new Node(v, null); size++; return; }
        Node cur = head;
        while (cur.next != null) cur = cur.next;             // walk to the last node: O(n)
        cur.next = new Node(v, null);
        size++;
    }

    int get(int i) {
        if (i < 0 || i >= size) throw new IndexOutOfBoundsException("Index " + i + " out of bounds for length " + size);
        Node cur = head;
        for (int k = 0; k < i; k++) cur = cur.next;         // i hops
        return cur.value;
    }

    int removeFirst() {
        if (head == null) throw new IllegalStateException("empty list");
        int v = head.value;
        head = head.next;                                    // the old first node is now unreachable
        size--;
        return v;
    }

    public String toString() {
        StringBuilder sb = new StringBuilder("[");
        for (Node cur = head; cur != null; cur = cur.next) {
            sb.append(cur.value);
            if (cur.next != null) sb.append(", ");
        }
        return sb.append("]").toString();
    }
}

public class Main {
    public static void main(String[] args) {
        IntList list = new IntList();
        list.addLast(3); list.addLast(9); list.addFirst(7); list.addFirst(12);
        System.out.println(list + "  size " + list.size());
        System.out.println("get(2) = " + list.get(2));
        System.out.println("removed " + list.removeFirst() + ", now " + list);
        try {
            list.get(10);
        } catch (IndexOutOfBoundsException e) {
            System.out.println("caught: " + e.getMessage());
        }
    }
}`, caption: 'toString walks the list once, so printing is O(n), like printing an array. get(2) walks two hops. The exception message copies the one the Java library uses for ArrayList, so that code written against either behaves the same.' },
        `<h2>Inserting and removing in the middle</h2>
<p>Here is the operation that makes linked lists worth having. To insert after a node <code>p</code>: make the new node with <code>next = p.next</code>, then set <code>p.next</code> to the new node. Two assignments, in that order, and no value moves. To remove the node after <code>p</code>: <code>p.next = p.next.next</code>. One assignment. In an array the same operations shift every value to the right of the point, O(n).</p>
<p>The catch is in the words "a node you are already holding". If you have to find <code>p</code> by walking from the head, the walk is O(n) and the saving is gone. The list wins when the program is already at the right place: an iterator in the middle of a pass, a queue whose ends are both known, a scheduler moving the current task to the back. It loses whenever the program says "the i-th".</p>`,
        { play: `class Node {
    int value;
    Node next;
    Node(int value, Node next) { this.value = value; this.next = next; }
}

public class Main {
    static String show(Node head) {
        StringBuilder sb = new StringBuilder();
        for (Node cur = head; cur != null; cur = cur.next) sb.append(cur.value).append(cur.next != null ? " -> " : "");
        return sb.toString();
    }

    public static void main(String[] args) {
        Node head = new Node(1, new Node(2, new Node(3, new Node(4, null))));
        System.out.println(show(head));

        Node p = head.next;                       // holding the node with 2
        p.next = new Node(99, p.next);            // insert after it: two arrows change, nothing moves
        System.out.println(show(head) + "      after inserting 99 after 2");

        p.next = p.next.next;                     // remove the node after p: one arrow changes
        System.out.println(show(head) + "      after removing the node after 2");

        // remove the node holding 3: we must hold the node BEFORE it, so walk until cur.next.value == 3
        Node cur = head;
        while (cur.next != null && cur.next.value != 3) cur = cur.next;
        if (cur.next != null) cur.next = cur.next.next;
        System.out.println(show(head) + "      after removing 3");
    }
}`, caption: 'The insert and the first removal are O(1) because p was already in hand. The removal of 3 is O(n): the walk has to stop one node early, at the node whose next holds 3, because a singly linked node cannot see backwards. That "one node early" is the source of most linked-list bugs.' },
        { check: "To remove the node holding 3 from a singly linked list, which node must you be holding?", options: ["The node holding 3", "The node before it, whose next must change", "The head"], answer: 1, why: "A singly linked node cannot see backwards. Only the previous node's next can be redirected past the one being removed." },
        `<h2>Reversing a list in place</h2>
<p>The classic exercise, asked in interviews for sixty years because it tests whether you can hold three references in your head at once. Walk the list; at each node, point its <code>next</code> backwards at the previous node. You need to remember the next node before you overwrite the arrow to it.</p>`,
        { play: `class Node {
    int value;
    Node next;
    Node(int value, Node next) { this.value = value; this.next = next; }
}

public class Main {
    static Node reverse(Node head) {
        Node prev = null, cur = head;
        while (cur != null) {
            Node after = cur.next;     // remember where to go next, before we lose it
            cur.next = prev;           // turn the arrow round
            prev = cur;                // step both references forward
            cur = after;
        }
        return prev;                   // the old last node is the new head
    }

    static String show(Node head) {
        StringBuilder sb = new StringBuilder();
        for (Node cur = head; cur != null; cur = cur.next) sb.append(cur.value).append(cur.next != null ? " -> " : "");
        return sb.toString();
    }

    public static void main(String[] args) {
        Node head = null;
        for (int v = 5; v >= 1; v--) head = new Node(v, head);
        System.out.println(show(head));
        head = reverse(head);
        System.out.println(show(head));
        System.out.println(show(reverse(null)) + "(reversing the empty list)");
        System.out.println(show(reverse(new Node(42, null))) + "   (one node)");
    }
}`, caption: 'O(n) time and O(1) extra space: three references and no second list. Trace it by hand on 1 -> 2 -> 3 once, writing prev, cur and after at every line, before you trust it.' },
        `<h2>Array or list?</h2>
<table class="growth-table"><thead><tr><th>Operation</th><th>Array / ArrayList</th><th>Linked list</th></tr></thead><tbody>
<tr><td>Get or set index i</td><td>O(1)</td><td>O(n)</td></tr>
<tr><td>Add or remove at the back</td><td>O(1) amortised</td><td>O(1) with a tail reference</td></tr>
<tr><td>Add or remove at the front</td><td>O(n)</td><td>O(1)</td></tr>
<tr><td>Insert or remove after a node in hand</td><td>O(n)</td><td>O(1)</td></tr>
<tr><td>Find a value</td><td>O(n), or O(log n) if sorted</td><td>O(n)</td></tr>
<tr><td>Memory per value</td><td>the value</td><td>the value + a reference + object overhead</td></tr>
</tbody></table>
<p>The table says the two are mirror images, and in the 1960s the choice between them was a real one. On a modern machine it mostly is not. An array's values sit together in memory, so the processor's cache fetches the next ones before they are asked for; a list's nodes are scattered, and every hop is a wait for memory, which is a hundred times slower than the arithmetic the array needs. Measured, walking a linked list is several times slower than walking an array of the same length, and inserting at the front of an <code>ArrayList</code> of a few thousand values, O(n) though it is, is often faster than inserting at the front of a <code>LinkedList</code>. The author of Java's <code>LinkedList</code> has said publicly that he never uses it.</p>
<p>So why learn it? Because the linked node is the atom that trees, hash-table chains, graphs' adjacency lists and every other structure that grows and branches are built from, in the lessons to come. The list is the simplest thing you can make from nodes and references, and everything you learn about following <code>next</code> until <code>null</code> you will use again on <code>left</code> and <code>right</code>.</p>`,
        { play: `import java.util.LinkedList;
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        LinkedList<String> queue = new LinkedList<>();     // the library's list: doubly linked, with head and tail
        queue.addLast("Ada"); queue.addLast("Grace"); queue.addLast("Linus");
        queue.addFirst("Urgent");
        System.out.println(queue);
        System.out.println("served " + queue.removeFirst() + ", then " + queue.removeFirst());
        System.out.println(queue + "  size " + queue.size());

        ArrayList<Integer> a = new ArrayList<>();
        LinkedList<Integer> l = new LinkedList<>();
        for (int i = 0; i < 5; i++) { a.add(0, i); l.addFirst(i); }   // add at the front: O(n) shifts for one, O(1) for the other
        System.out.println(a + " " + l + "  same contents, different costs");
    }
}`, caption: 'java.util.LinkedList is doubly linked (each node also points back) with a tail reference, so both ends are O(1): it is Java’s default queue and deque when you need a list interface too. get(i) on it is still a walk.' },
        { check: "Why is ArrayList usually faster than LinkedList even for inserts at the front?", options: ["Because Java optimises ArrayList specially", "Because its values sit together in memory and the cache fetches them ahead; each list hop is a wait for memory", "It is not: LinkedList is always faster at the front"], answer: 1, why: "The table says O(n) against O(1), but a cache-friendly shift of a few thousand values often beats one cache-missing hop. Measure before choosing LinkedList." },
        `<details class="reveal"><summary>Puzzle: a singly linked list of n nodes. What is the cost of (a) removing the last node, (b) removing the last node when a tail reference is kept, (c) checking whether the list has a cycle (some node's next points back to an earlier node)?</summary><p>(a) O(n): you must find the node before the last, and only a walk from the head can. (b) Still O(n): the tail reference finds the last node, but not the one before it, which is what must change; a <em>doubly</em> linked list fixes this. (c) O(n) with O(1) space, by Floyd's tortoise and hare: one reference hops one node at a time, another two at a time; if there is a cycle they meet, if not the hare reaches null.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Following <code>cur.next</code> when <code>cur</code> may be <code>null</code>: a NullPointerException, usually on the empty list or at the last node. Walking to the node you want to remove instead of the node before it. Overwriting <code>cur.next</code> before saving it, in reverse. Forgetting to update <code>size</code>. Treating the empty list as a special case everywhere instead of writing the code so that <code>head == null</code> just works (the <code>addFirst</code> one-liner does). Reaching for <code>LinkedList</code> because the task mentions a list: measure first.</p>` },
        {
          ex: {
            id: 'ds-5-1', title: 'addLast and get',
            prompt: `<p>Complete the two classes below. <code>Node</code> is finished. In <code>IntList</code>, <code>addFirst</code>, <code>size</code> and <code>toString</code> are finished; write <code>addLast(int v)</code>, which adds a node at the end and increases the size, and <code>get(int i)</code>, which returns the value at index <code>i</code> after walking to it, and throws <code>IndexOutOfBoundsException</code> with the message <code>Index i out of bounds for length n</code> (with the numbers filled in) when <code>i</code> is out of range. Write only the classes; the checker supplies its own <code>main</code>.</p>`,
            classes: true,
            starter: `class Node {\n    int value;\n    Node next;\n    Node(int value, Node next) { this.value = value; this.next = next; }\n}\n\nclass IntList {\n    private Node head;\n    private int size;\n\n    int size() { return size; }\n\n    void addFirst(int v) { head = new Node(v, head); size++; }\n\n    void addLast(int v) {\n        // empty list: the new node becomes the head\n        // otherwise walk to the last node and hang the new node on it\n    }\n\n    int get(int i) {\n        // check the range, walk i hops, return the value\n    }\n\n    public String toString() {\n        StringBuilder sb = new StringBuilder("[");\n        for (Node cur = head; cur != null; cur = cur.next) {\n            sb.append(cur.value);\n            if (cur.next != null) sb.append(", ");\n        }\n        return sb.append("]").toString();\n    }\n}`,
            solution: `class Node {\n    int value;\n    Node next;\n    Node(int value, Node next) { this.value = value; this.next = next; }\n}\n\nclass IntList {\n    private Node head;\n    private int size;\n\n    int size() { return size; }\n\n    void addFirst(int v) { head = new Node(v, head); size++; }\n\n    void addLast(int v) {\n        if (head == null) { head = new Node(v, null); size++; return; }\n        Node cur = head;\n        while (cur.next != null) cur = cur.next;\n        cur.next = new Node(v, null);\n        size++;\n    }\n\n    int get(int i) {\n        if (i < 0 || i >= size) throw new IndexOutOfBoundsException("Index " + i + " out of bounds for length " + size);\n        Node cur = head;\n        for (int k = 0; k < i; k++) cur = cur.next;\n        return cur.value;\n    }\n\n    public String toString() {\n        StringBuilder sb = new StringBuilder("[");\n        for (Node cur = head; cur != null; cur = cur.next) {\n            sb.append(cur.value);\n            if (cur.next != null) sb.append(", ");\n        }\n        return sb.append("]").toString();\n    }\n}`,
            mustNotContain: [{ re: /java\.util|ArrayList|LinkedList|int\s*\[\s*\]/, msg: 'Build the list from Node objects only: no arrays and no library lists.' }],
            hints: ['addLast: if head is null, the list is empty and the new node is the head. Otherwise Node cur = head; while (cur.next != null) cur = cur.next; then cur.next = new Node(v, null). Either way, size++.', 'get: if (i < 0 || i >= size) throw new IndexOutOfBoundsException("Index " + i + " out of bounds for length " + size); then walk: Node cur = head; for (int k = 0; k < i; k++) cur = cur.next; return cur.value;'],
            tests: [
              { name: 'addLast builds in order', main: '        IntList list = new IntList();\n        list.addLast(3); list.addLast(9); list.addLast(27);\n        System.out.println(list + " " + list.size());', expect: '[3, 9, 27] 3' },
              { name: 'mixed addFirst and addLast', main: '        IntList list = new IntList();\n        list.addLast(5); list.addFirst(1); list.addLast(8); list.addFirst(0);\n        System.out.println(list + " " + list.size());', expect: '[0, 1, 5, 8] 4' },
              { name: 'get walks to each index', main: '        IntList list = new IntList();\n        for (int v = 10; v <= 50; v += 10) list.addLast(v);\n        System.out.println(list.get(0) + " " + list.get(2) + " " + list.get(4));', expect: '10 30 50' },
              { name: 'get out of range', main: '        IntList list = new IntList();\n        list.addLast(1); list.addLast(2);\n        try { list.get(2); } catch (IndexOutOfBoundsException e) { System.out.println(e.getMessage()); }\n        try { list.get(-1); } catch (IndexOutOfBoundsException e) { System.out.println(e.getMessage()); }', expect: 'Index 2 out of bounds for length 2\nIndex -1 out of bounds for length 2' },
              { name: 'get on the empty list', main: '        IntList list = new IntList();\n        try { System.out.println(list.get(0)); } catch (IndexOutOfBoundsException e) { System.out.println(e.getMessage()); }\n        list.addLast(7);\n        System.out.println(list.get(0) + " " + list);', expect: 'Index 0 out of bounds for length 0\n7 [7]' },
              { name: 'a thousand addLast calls', main: '        IntList list = new IntList();\n        for (int v = 0; v < 1000; v++) list.addLast(v);\n        System.out.println(list.size() + " " + list.get(999) + " " + list.get(500));', expect: '1000 999 500' }
            ],
            failTip: 'A NullPointerException in addLast means the empty list was not handled before the walk. Check that size++ happens in both branches of addLast, and that get checks the range before walking.'
          }
        },
        {
          ex: {
            id: 'ds-5-2', title: 'remove and reverse',
            prompt: `<p>Add two methods to <code>IntList</code> (the finished class from the lesson is given). <code>boolean remove(int v)</code> removes the <em>first</em> node holding <code>v</code>, reduces the size, and returns <code>true</code>; if no node holds <code>v</code> it changes nothing and returns <code>false</code>. <code>void reverse()</code> reverses the list in place, using the three-reference method from the lesson and no second list. Write only the classes.</p>`,
            classes: true,
            starter: `class Node {\n    int value;\n    Node next;\n    Node(int value, Node next) { this.value = value; this.next = next; }\n}\n\nclass IntList {\n    private Node head;\n    private int size;\n\n    int size() { return size; }\n    void addFirst(int v) { head = new Node(v, head); size++; }\n    void addLast(int v) {\n        if (head == null) { head = new Node(v, null); size++; return; }\n        Node cur = head;\n        while (cur.next != null) cur = cur.next;\n        cur.next = new Node(v, null);\n        size++;\n    }\n\n    boolean remove(int v) {\n        // the first node is a special case: head moves\n        // otherwise walk until cur.next holds v, then unlink cur.next\n        return false;\n    }\n\n    void reverse() {\n        // prev, cur, after\n    }\n\n    public String toString() {\n        StringBuilder sb = new StringBuilder("[");\n        for (Node cur = head; cur != null; cur = cur.next) {\n            sb.append(cur.value);\n            if (cur.next != null) sb.append(", ");\n        }\n        return sb.append("]").toString();\n    }\n}`,
            solution: `class Node {\n    int value;\n    Node next;\n    Node(int value, Node next) { this.value = value; this.next = next; }\n}\n\nclass IntList {\n    private Node head;\n    private int size;\n\n    int size() { return size; }\n    void addFirst(int v) { head = new Node(v, head); size++; }\n    void addLast(int v) {\n        if (head == null) { head = new Node(v, null); size++; return; }\n        Node cur = head;\n        while (cur.next != null) cur = cur.next;\n        cur.next = new Node(v, null);\n        size++;\n    }\n\n    boolean remove(int v) {\n        if (head == null) return false;\n        if (head.value == v) { head = head.next; size--; return true; }\n        Node cur = head;\n        while (cur.next != null && cur.next.value != v) cur = cur.next;\n        if (cur.next == null) return false;\n        cur.next = cur.next.next;\n        size--;\n        return true;\n    }\n\n    void reverse() {\n        Node prev = null, cur = head;\n        while (cur != null) {\n            Node after = cur.next;\n            cur.next = prev;\n            prev = cur;\n            cur = after;\n        }\n        head = prev;\n    }\n\n    public String toString() {\n        StringBuilder sb = new StringBuilder("[");\n        for (Node cur = head; cur != null; cur = cur.next) {\n            sb.append(cur.value);\n            if (cur.next != null) sb.append(", ");\n        }\n        return sb.append("]").toString();\n    }\n}`,
            mustNotContain: [{ re: /java\.util|ArrayList|LinkedList|int\s*\[\s*\]|new\s+IntList/, msg: 'Work on the nodes in place: no arrays, no library lists, no second IntList.' }],
            hints: ['remove: if the list is empty, return false. If head.value == v, move head to head.next, size--, return true. Otherwise walk with while (cur.next != null && cur.next.value != v); if cur.next is null the value is absent; else cur.next = cur.next.next.', 'reverse: Node prev = null, cur = head; while (cur != null) { Node after = cur.next; cur.next = prev; prev = cur; cur = after; } head = prev;', 'The size does not change in reverse. It goes down by one on a successful remove only.'],
            tests: [
              { name: 'remove from the middle', main: '        IntList list = new IntList();\n        for (int v : new int[] {1, 2, 3, 4, 5}) list.addLast(v);\n        System.out.println(list.remove(3) + " " + list + " " + list.size());', expect: 'true [1, 2, 4, 5] 4' },
              { name: 'remove the first and the last', main: '        IntList list = new IntList();\n        for (int v : new int[] {1, 2, 3, 4, 5}) list.addLast(v);\n        list.remove(1); list.remove(5);\n        System.out.println(list + " " + list.size());', expect: '[2, 3, 4] 3' },
              { name: 'remove an absent value', main: '        IntList list = new IntList();\n        list.addLast(1); list.addLast(2);\n        System.out.println(list.remove(9) + " " + list + " " + list.size());\n        IntList empty = new IntList();\n        System.out.println(empty.remove(1) + " " + empty + " " + empty.size());', expect: 'false [1, 2] 2\nfalse [] 0' },
              { name: 'remove only the first occurrence', main: '        IntList list = new IntList();\n        for (int v : new int[] {7, 3, 7, 7}) list.addLast(v);\n        list.remove(7);\n        System.out.println(list + " " + list.size());\n        list.remove(7); list.remove(7); list.remove(7);\n        System.out.println(list + " " + list.size());', expect: '[3, 7, 7] 3\n[3] 1' },
              { name: 'reverse', main: '        IntList list = new IntList();\n        for (int v = 1; v <= 5; v++) list.addLast(v);\n        list.reverse();\n        System.out.println(list + " " + list.size());\n        list.addLast(0);\n        System.out.println(list);', expect: '[5, 4, 3, 2, 1] 5\n[5, 4, 3, 2, 1, 0]' },
              { name: 'reverse the empty list and a single node', main: '        IntList list = new IntList();\n        list.reverse();\n        System.out.println(list + " " + list.size());\n        list.addFirst(42); list.reverse();\n        System.out.println(list + " " + list.size());', expect: '[] 0\n[42] 1' },
              { name: 'reverse twice is the identity', main: '        IntList list = new IntList();\n        for (int v : new int[] {8, 6, 7, 5, 3, 0, 9}) list.addLast(v);\n        list.reverse(); list.reverse();\n        System.out.println(list);', expect: '[8, 6, 7, 5, 3, 0, 9]' }
            ],
            failTip: 'If the list prints [5] after reverse, the arrows were turned round but head still points at the old first node: set head = prev at the end. If addLast after reverse loops forever, a node still points at itself: check the order of the four lines in the loop.'
          }
        },
        {
          ex: {
            id: 'ds-5-3', kind: 'answer', title: 'Hops and shifts',
            prompt: `<p>An <code>ArrayList</code> and a singly linked list (head reference only, no tail) each hold the same 1,000 values. Count the work of each operation as the number of values shifted (array) or nodes hopped past (list), using the costs in this lesson. Give whole numbers.</p>`,
            parts: [
              { label: '(a) Read the value at index 700. Array shifts?', answer: '0', width: '6rem', wrong: [{ match: '700', msg: 'An array reaches index 700 by arithmetic: no values are shifted or visited.' }] },
              { label: '(b) Read the value at index 700. List hops?', answer: '700', width: '6rem', wrong: [{ match: '0', msg: 'There is no arithmetic that finds node 700; the list walks from the head.' }, { match: '1000', msg: 'The walk stops when it reaches index 700.' }] },
              { label: '(c) Insert a value at the front. Array shifts?', answer: '1000', width: '6rem', wrong: [{ match: ['0', '1'], msg: 'Every existing value moves one cell to the right to make room at index 0.' }] },
              { label: '(d) Insert a value at the front. List hops?', answer: '0', width: '6rem', wrong: [{ match: '1000', msg: 'addFirst makes a node whose next is the old head and points head at it: nothing is walked.' }] },
              { label: '(e) Add a value at the back. List hops (no tail reference)?', answer: '999', width: '6rem', wrong: [{ match: '1000', msg: 'The walk starts at the head (index 0) and hops to index 999: 999 hops.' }, { match: '0', msg: 'That is the cost with a tail reference. Without one, the last node must be found by walking.' }] },
              { label: '(f) Remove the value at index 500 (you hold no reference into the list). Array shifts, and list hops? Give the sum of the two numbers.', answer: '998', width: '6rem', wrong: [{ match: '1000', msg: 'Array: the 499 values after index 500 shift left. List: walk to the node before index 500, 499 hops. 499 + 499.' }, { match: ['999', '1001'], msg: 'Array: values at indices 501 to 999 shift: 499. List: walk to index 499, the node before: 499 hops.' }] }
            ],
            hints: ['Array: indexing is free; inserting or removing at index i shifts the values after i. List: reaching index i costs i hops; changing arrows is free once you are there; removing index i needs the node at i − 1.'],
            solution: `<p>(a) <b>0</b>: arithmetic. (b) <b>700</b> hops. (c) <b>1000</b>: every value shifts right. (d) <b>0</b>. (e) <b>999</b>: from index 0 to index 999. (f) <b>998</b>: the array shifts the 499 values at indices 501–999; the list hops 499 times to reach the node at index 499, whose <code>next</code> is unlinked.</p>`,
            followup: 'Parts (a) and (d) are the two zeros, and they are on opposite sides. Every choice between an array and a list comes down to which zero the program needs more often.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A linked list is nodes holding a value and <code>next</code>; <code>head</code> points at the first; <code>null</code> ends it. Every algorithm on it is the walk <code>for (cur = head; cur != null; cur = cur.next)</code>.</li>
<li>O(1): add or remove at the front, insert or remove after a node in hand, add at the back with a tail. O(n): anything that says "index i" or "find".</li>
<li>To remove a node you must hold the one before it; to reverse you need three references, prev, cur and after, and must save <code>after</code> before turning the arrow.</li>
<li>On modern hardware the array's contiguity wins most races; <code>ArrayList</code> is the default and <code>LinkedList</code> the exception, used for queues and deques.</li>
<li>The node-and-reference idea is the atom of trees, hash chains and graphs: this lesson is the first time you follow a reference until <code>null</code>, not the last.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Stacks and queues', summary: 'Two structures defined by what they refuse to do: the stack, where the last thing in is the first out, and the queue, where the first in is the first out; both in an array, the queue as a ring; what each is for; and the library classes that implement them.',
      blocks: [
        `<p>In 1955 two mathematicians in Munich, Friedrich Bauer and Klaus Samelson, were designing a machine that could work out an algebraic formula typed in the ordinary way, with brackets and with multiplication done before addition. The difficulty is that when the machine reads <code>3 + 4 ×</code> it cannot yet do the plus: it has to put the plus aside, wait for the multiplication, and come back. Their answer was a store they called the <em>Keller</em>, the cellar: things go in at the top, and whatever went in last comes out first. The plus goes into the cellar, the times goes in on top of it, the times comes out and is done, then the plus. They patented the idea in 1957. We call the cellar a stack, and every compiler, every calculator and every running program has one.</p>`,
        { photo: 'sushi-plates-stack', caption: 'A stack you can see, at a conveyor-belt sushi restaurant in Taiwan. Each empty plate goes on top, and the only plate you can take off is the last one put on: the cellar that Bauer and Samelson patented, made of plates.' },
        `<p>A stack is the first structure in this course that is defined not by how it is stored but by what it <em>refuses</em> to do. You may only add at the top and only remove from the top. Its twin, the queue, refuses differently: add at the back, remove from the front. Those refusals are the point. A structure that can do less is easier to reason about, and can be made faster, because it only has to be good at a few things.</p>
<h2>The stack</h2>
<div class="stmt"><p><span class="kind">Stack.</span> A collection with four operations: <code>push(x)</code> adds <code>x</code> at the top; <code>pop()</code> removes and returns the top item; <code>peek()</code> returns it without removing it; <code>isEmpty()</code>. The last item pushed is the first popped: <em>LIFO</em>, last in, first out.</p>
<p><span class="kind">Cost.</span> Every operation is O(1). That is the contract; an implementation that cannot keep it is not a stack worth having.</p></div>
<p>An array and one integer are enough. The integer, <code>top</code>, is the number of items, which is also the index the next push writes to. Push writes and increments; pop decrements and reads. Nothing is ever shifted. When the array fills, double it, exactly as the growing array of lesson 1 did, and the cost stays O(1) on average.</p>`,
        { fig: 'stackqueue', kind: 'stack', caption: 'Eight cells and a top index. Push a few values, pop some, push again: the cells below top are the stack, the cells above it are garbage that nobody reads. Fill it to see what a growing stack would do.' },
        { play: `import java.util.Arrays;

class ArrayStack {
    private int[] cells = new int[4];
    private int top = 0;                        // number of items; also where the next push goes

    boolean isEmpty() { return top == 0; }
    int size() { return top; }

    void push(int x) {
        if (top == cells.length) cells = Arrays.copyOf(cells, cells.length * 2);   // full: double
        cells[top] = x;
        top++;
    }

    int pop() {
        if (top == 0) throw new IllegalStateException("pop from an empty stack");
        top--;
        return cells[top];
    }

    int peek() {
        if (top == 0) throw new IllegalStateException("peek at an empty stack");
        return cells[top - 1];
    }
}

public class Main {
    public static void main(String[] args) {
        ArrayStack s = new ArrayStack();
        for (int i = 1; i <= 6; i++) s.push(i * 10);          // 10 20 30 40 50 60: the array doubled at the fifth push
        System.out.println("size " + s.size() + ", top " + s.peek());
        System.out.print("popped:");
        while (!s.isEmpty()) System.out.print(" " + s.pop());
        System.out.println();
        try { s.pop(); } catch (IllegalStateException e) { System.out.println("then: " + e.getMessage()); }
    }
}`, caption: 'The values come out in reverse order: that is the whole behaviour of a stack. Arrays.copyOf makes the bigger array and copies the old one in. Pop does not clear the cell; it just moves top, and the next push overwrites it.' },
        { check: "push 1, push 2, push 3, pop, push 4, pop. What was popped, in order?", options: ["1 then 2", "3 then 4", "3 then 2"], answer: 1, why: "Last in, first out: after pushing 1 2 3, pop gives 3; after pushing 4, pop gives 4." },
        `<h2>What stacks are for</h2>
<p>Anything that nests, and anything you undo. Brackets nest: an opening bracket is pushed, and a closing bracket must match the most recent opening one, which is exactly the one on top. Undo in an editor is a stack of changes; the most recent is undone first. A web browser's Back button is a stack of pages. And the method calls of a running program nest: a method that calls another must wait for it to finish, so the calls form a stack, and the next lesson is about what happens when a method calls itself.</p>`,
        { play: `import java.util.ArrayDeque;

public class Main {
    // true if every bracket closes the most recent open one of the same kind
    static boolean balanced(String s) {
        ArrayDeque<Character> open = new ArrayDeque<>();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '(' || c == '[' || c == '{') open.push(c);
            else if (c == ')' || c == ']' || c == '}') {
                if (open.isEmpty()) return false;                 // nothing to close
                char o = open.pop();
                if ((c == ')' && o != '(') || (c == ']' && o != '[') || (c == '}' && o != '{')) return false;
            }
        }
        return open.isEmpty();                                     // anything still open was never closed
    }

    public static void main(String[] args) {
        String[] tests = {"(a + b) * [c]", "{[()()]}", "(]", "((a)", "a + b)", "", "f(g(x), h[y]) {}"};
        for (String t : tests) System.out.println(balanced(t) + "   " + t);
    }
}`, caption: 'The library’s stack is ArrayDeque, with push, pop, peek and isEmpty. (Java also has a class called Stack, from 1995; its own documentation tells you to use ArrayDeque instead.) The three ways to fail are the three ways brackets go wrong: a closer with nothing open, a closer of the wrong kind, and an opener never closed.' },
        `<p>Bauer and Samelson's cellar did arithmetic, and so can yours. Write the formula with each operator <em>after</em> its two operands, which is called postfix or reverse Polish notation: <code>3 4 2 * +</code> means 3 + (4 × 2). Then no brackets are needed and one stack evaluates it: push numbers; on an operator, pop two, apply, push the result.</p>`,
        { play: `import java.util.ArrayDeque;

public class Main {
    static int evalPostfix(String expr) {
        ArrayDeque<Integer> st = new ArrayDeque<>();
        for (String tok : expr.split(" ")) {
            if (tok.equals("+") || tok.equals("-") || tok.equals("*") || tok.equals("/")) {
                int b = st.pop(), a = st.pop();                   // b was pushed last: it is the right operand
                if (tok.equals("+")) st.push(a + b);
                else if (tok.equals("-")) st.push(a - b);
                else if (tok.equals("*")) st.push(a * b);
                else st.push(a / b);
            } else st.push(Integer.parseInt(tok));
        }
        return st.pop();
    }

    public static void main(String[] args) {
        System.out.println(evalPostfix("3 4 2 * +"));          // 3 + 4 * 2
        System.out.println(evalPostfix("3 4 + 2 *"));          // (3 + 4) * 2
        System.out.println(evalPostfix("10 2 8 * + 3 -"));     // 10 + 2 * 8 - 3
        System.out.println(evalPostfix("100 5 / 4 /"));        // 100 / 5 / 4
    }
}`, caption: 'Four formulas, no brackets, one stack. The order of the two pops matters for − and /: the top of the stack is the right-hand operand. Turning ordinary notation into postfix is itself done with a stack (Dijkstra’s shunting-yard algorithm, 1961), which is how a compiler reads 3 + 4 * 2.' },
        `<h2>The queue</h2>
<div class="stmt"><p><span class="kind">Queue.</span> A collection with <code>enqueue(x)</code> (add at the back), <code>dequeue()</code> (remove and return the front), <code>peek()</code> and <code>isEmpty()</code>. The first item in is the first out: <em>FIFO</em>. Java's <code>Queue</code> interface calls them <code>offer</code>, <code>poll</code> and <code>peek</code>.</p>
<p><span class="kind">Cost.</span> O(1) for every operation. Again, the contract.</p></div>
<p>A queue in an array is harder than a stack, and the difficulty is instructive. If the front is always cell 0, then dequeue must shift every remaining item left: O(n), which breaks the contract. The fix is to let the front move. Keep two indices, <code>head</code> for the front and <code>tail</code> for the next free cell at the back, and let both walk rightwards. When one reaches the end of the array it wraps round to cell 0, because the cells at the start have been freed by earlier dequeues. The array is used as a <em>ring</em>.</p>`,
        { fig: 'stackqueue', kind: 'queue', caption: 'Enqueue five, dequeue three, enqueue five more: tail wraps round to the cells that head has left behind. The items in order are from head, going round, to tail. Nothing is ever shifted.' },
        { play: `class RingQueue {
    private int[] cells = new int[4];
    private int head = 0, tail = 0, count = 0;

    int size() { return count; }
    boolean isEmpty() { return count == 0; }

    void enqueue(int x) {
        if (count == cells.length) grow();
        cells[tail] = x;
        tail = (tail + 1) % cells.length;      // the % is the wrap-round
        count++;
    }

    int dequeue() {
        if (count == 0) throw new IllegalStateException("dequeue from an empty queue");
        int x = cells[head];
        head = (head + 1) % cells.length;
        count--;
        return x;
    }

    private void grow() {
        int[] bigger = new int[cells.length * 2];
        for (int i = 0; i < count; i++) bigger[i] = cells[(head + i) % cells.length];   // copy in queue order, unwrapping
        cells = bigger;
        head = 0;
        tail = count;
    }

    public String toString() {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < count; i++) sb.append(i > 0 ? ", " : "").append(cells[(head + i) % cells.length]);
        return sb.append("]").toString();
    }
}

public class Main {
    public static void main(String[] args) {
        RingQueue q = new RingQueue();
        q.enqueue(1); q.enqueue(2); q.enqueue(3);
        System.out.println(q + "  served " + q.dequeue() + ", " + q.dequeue());
        q.enqueue(4); q.enqueue(5);                  // tail wraps: 4 goes in cell 3, 5 in cell 0
        System.out.println(q + "  size " + q.size());
        q.enqueue(6); q.enqueue(7);                  // full at 4: grows to 8, unwrapping as it copies
        System.out.println(q + "  size " + q.size());
        while (!q.isEmpty()) System.out.print(q.dequeue() + " ");
        System.out.println();
    }
}`, caption: 'The values come out in the order they went in, through two wrap-rounds and one growth. The grow method is the subtle part: it must copy from head, going round, so that the new array holds the queue in order starting at 0.' },
        { check: "Why does a queue in an array need a ring?", options: ["To save memory", "So that dequeue does not shift every item: head moves instead, and wraps round", "Because arrays cannot be resized"], answer: 1, why: "If the front were always cell 0, dequeue would be O(n). Letting head and tail walk and wrap keeps every operation O(1)." },
        `<h2>What queues are for</h2>
<p>Anything served in order of arrival: print jobs, requests to a server, messages between parts of a program, the frames of a video waiting to be shown. And one algorithm this course will meet twice: breadth-first search, which explores a graph level by level by keeping the frontier in a queue (lesson 11). The library's queue is <code>ArrayDeque</code> again, used from the other end, or <code>LinkedList</code>, which also implements <code>Queue</code>.</p>`,
        { play: `import java.util.ArrayDeque;
import java.util.Queue;

public class Main {
    public static void main(String[] args) {
        // Josephus: n children in a circle pass a potato; every k-th pass, the holder is out. Who is left?
        int n = 7, k = 3;
        Queue<Integer> circle = new ArrayDeque<>();
        for (int i = 1; i <= n; i++) circle.offer(i);
        while (circle.size() > 1) {
            for (int pass = 1; pass < k; pass++) circle.offer(circle.poll());   // pass the potato: front goes to the back
            System.out.print("out: " + circle.poll() + "  ");
        }
        System.out.println();
        System.out.println("left: " + circle.peek());

        ArrayDeque<String> both = new ArrayDeque<>();        // a deque works at both ends
        both.addLast("b"); both.addLast("c"); both.addFirst("a");
        System.out.println(both + " " + both.pollFirst() + " " + both.pollLast() + " " + both);
    }
}`, caption: 'A queue models a circle: moving the front to the back is one pass. ArrayDeque is a double-ended queue, a deque: addFirst/addLast and pollFirst/pollLast, all O(1), in one ring buffer. Used from one end it is a stack, from the other a queue.' },
        { check: "Which Java class should you use for a stack?", options: ["<code>java.util.Stack</code>", "<code>ArrayDeque</code>, with push, pop and peek", "<code>ArrayList</code>"], answer: 1, why: "Stack is a 1995 class with historical slowness; its own documentation says to use ArrayDeque." },
        `<h2>Choosing</h2>
<table class="growth-table"><thead><tr><th></th><th>Stack</th><th>Queue</th></tr></thead><tbody>
<tr><td>Order out</td><td>reverse of order in (LIFO)</td><td>same as order in (FIFO)</td></tr>
<tr><td>Storage</td><td>array + top</td><td>ring buffer: array + head + tail, or a linked list with a tail reference</td></tr>
<tr><td>All operations</td><td>O(1)</td><td>O(1)</td></tr>
<tr><td>Typical uses</td><td>brackets, undo, expression evaluation, the call stack, depth-first search</td><td>jobs and requests, simulations, breadth-first search</td></tr>
<tr><td>In Java</td><td><code>ArrayDeque</code>: push, pop, peek</td><td><code>ArrayDeque</code> or <code>LinkedList</code> as <code>Queue</code>: offer, poll, peek</td></tr>
</tbody></table>
<details class="reveal"><summary>Puzzle: you have two stacks and nothing else. How do you make a queue? What does each operation cost?</summary><p>Enqueue pushes onto stack A. Dequeue pops from stack B; if B is empty, first pop everything from A and push it onto B, which reverses it, so B's top is the oldest item. Enqueue is O(1). A single dequeue can cost O(n), but each item is moved from A to B only once in its life, so n operations cost O(n) in total: O(1) <em>amortised</em>, the same accounting as the growing array. This is a real technique, used where only stacks are cheap.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Reading <code>cells[top]</code> for peek: the top item is at <code>top − 1</code>. Forgetting the <code>%</code> in the ring queue, so tail runs off the end of the array. Testing "full" with <code>head == tail</code>, which is also what "empty" looks like; keep a count. Growing a ring queue by copying cells 0 to n − 1, which copies the wrong cells when the queue has wrapped. Using <code>java.util.Stack</code> because the name is right. Calling <code>pop</code> on an empty <code>ArrayDeque</code>, which throws <code>NoSuchElementException</code>; test <code>isEmpty</code> first.</p>` },
        {
          ex: {
            id: 'ds-6-1', title: 'A stack in an array',
            prompt: `<p>Complete the class <code>IntStack</code>: an array of <code>int</code> that starts with 2 cells and doubles when full, with <code>push</code>, <code>pop</code>, <code>peek</code>, <code>size</code> and <code>isEmpty</code>. <code>pop</code> and <code>peek</code> on an empty stack throw <code>IllegalStateException</code> with the message <code>empty stack</code>. Write only the class; the checker supplies <code>main</code>.</p>`,
            classes: true,
            prelude: 'import java.util.Arrays;',
            starter: `class IntStack {\n    private int[] cells = new int[2];\n    private int top = 0;\n\n    int size() { return top; }\n    boolean isEmpty() { return top == 0; }\n\n    void push(int x) {\n        // double the array if full, then write at top and move top up\n    }\n\n    int pop() {\n        // throw if empty; move top down; return the cell\n        return 0;\n    }\n\n    int peek() {\n        // throw if empty; return the top item without removing it\n        return 0;\n    }\n}`,
            solution: `class IntStack {\n    private int[] cells = new int[2];\n    private int top = 0;\n\n    int size() { return top; }\n    boolean isEmpty() { return top == 0; }\n\n    void push(int x) {\n        if (top == cells.length) cells = Arrays.copyOf(cells, cells.length * 2);\n        cells[top] = x;\n        top++;\n    }\n\n    int pop() {\n        if (top == 0) throw new IllegalStateException("empty stack");\n        top--;\n        return cells[top];\n    }\n\n    int peek() {\n        if (top == 0) throw new IllegalStateException("empty stack");\n        return cells[top - 1];\n    }\n}`,
            mustNotContain: [{ re: /ArrayDeque|ArrayList|LinkedList|java\.util\.Stack/, msg: 'Build the stack on a plain int array; the library classes are what you are learning to write.' }],
            hints: ['push: if (top == cells.length) cells = Arrays.copyOf(cells, cells.length * 2); then cells[top] = x; top++;', 'pop: check top == 0 first, then top--; return cells[top]; peek returns cells[top - 1].'],
            tests: [
              { name: 'push and pop reverse the order', main: '        IntStack s = new IntStack();\n        for (int i = 1; i <= 5; i++) s.push(i);\n        StringBuilder sb = new StringBuilder();\n        while (!s.isEmpty()) sb.append(s.pop()).append(" ");\n        System.out.println(sb.toString().trim());', expect: '5 4 3 2 1' },
              { name: 'peek does not remove', main: '        IntStack s = new IntStack();\n        s.push(7); s.push(9);\n        System.out.println(s.peek() + " " + s.peek() + " " + s.size());', expect: '9 9 2' },
              { name: 'grows past 2, 4, 8 cells', main: '        IntStack s = new IntStack();\n        for (int i = 0; i < 1000; i++) s.push(i * i);\n        System.out.println(s.size() + " " + s.peek() + " " + s.pop() + " " + s.pop() + " " + s.size());', expect: '1000 998001 998001 996004 998' },
              { name: 'empty stack throws', main: '        IntStack s = new IntStack();\n        try { s.pop(); } catch (IllegalStateException e) { System.out.println("pop: " + e.getMessage()); }\n        try { s.peek(); } catch (IllegalStateException e) { System.out.println("peek: " + e.getMessage()); }\n        s.push(1); s.pop();\n        try { s.pop(); } catch (IllegalStateException e) { System.out.println("again: " + e.getMessage()); }', expect: 'pop: empty stack\npeek: empty stack\nagain: empty stack' },
              { name: 'interleaved pushes and pops', main: '        IntStack s = new IntStack();\n        s.push(1); s.push(2); int a = s.pop(); s.push(3); s.push(4); int b = s.pop(); int c = s.pop(); s.push(5);\n        System.out.println(a + " " + b + " " + c + " " + s.pop() + " " + s.pop() + " " + s.isEmpty());', expect: '2 4 3 5 1 true' }
            ],
            failTip: 'ArrayIndexOutOfBounds on the third push means the array did not grow. If peek returns the wrong value, it is reading cells[top] instead of cells[top − 1].'
          }
        },
        {
          ex: {
            id: 'ds-6-2', title: 'Balanced brackets, strictly',
            prompt: `<p>Write</p><pre class="code">static int firstError(String s)</pre><p>that scans <code>s</code> for the brackets <code>( ) [ ] { }</code> (other characters are ignored) and returns the index of the first character where the brackets go wrong: a closing bracket with nothing open, or one that does not match the most recently opened bracket. If the string ends with brackets still open, return the index of the earliest-opened bracket that was never closed (the one deepest in the stack). If everything balances, return <code>-1</code>. Use <code>ArrayDeque</code> as a stack; push the <em>index</em> of each opener, not the character, so you can report it.</p>`,
            prelude: 'import java.util.ArrayDeque;',
            starter: `static int firstError(String s) {\n    ArrayDeque<Integer> open = new ArrayDeque<>();   // indices of unclosed openers\n    for (int i = 0; i < s.length(); i++) {\n        char c = s.charAt(i);\n        // opener: push i\n        // closer: if nothing open, return i; pop; if the opener at that index does not match c, return i\n    }\n    // anything left open: return the index at the BOTTOM of the stack\n    return -1;\n}`,
            solution: `static int firstError(String s) {\n    ArrayDeque<Integer> open = new ArrayDeque<>();\n    for (int i = 0; i < s.length(); i++) {\n        char c = s.charAt(i);\n        if (c == '(' || c == '[' || c == '{') open.push(i);\n        else if (c == ')' || c == ']' || c == '}') {\n            if (open.isEmpty()) return i;\n            char o = s.charAt(open.pop());\n            if ((c == ')' && o != '(') || (c == ']' && o != '[') || (c == '}' && o != '{')) return i;\n        }\n    }\n    if (open.isEmpty()) return -1;\n    int bottom = -1;\n    while (!open.isEmpty()) bottom = open.pop();\n    return bottom;\n}`,
            hints: ['Push i for an opener. For a closer: if open.isEmpty() return i; int j = open.pop(); char o = s.charAt(j); compare o with c.', 'The earliest-opened unclosed bracket is at the bottom of the stack: pop until empty, remembering the last value popped. (ArrayDeque also has peekLast, which looks at the bottom directly.)'],
            tests: [
              { call: 'firstError("(a + b) * [c]")', expect: '-1', name: 'balanced' },
              { call: 'firstError("{[()()]}")', expect: '-1', name: 'nested, balanced' },
              { call: 'firstError("a + b)")', expect: '5', name: 'a closer with nothing open' },
              { call: 'firstError("(x]")', expect: '2', name: 'the wrong kind of closer' },
              { call: 'firstError("((a)")', expect: '0', name: 'the outer bracket never closed' },
              { call: 'firstError("f(g(x), h[y)")', expect: '11', name: 'mismatch deep inside' },
              { call: 'firstError("[(])")', expect: '2', name: 'crossed brackets' },
              { call: 'firstError("") + " " + firstError("no brackets here")', expect: '-1 -1', name: 'nothing to check' },
              { call: 'firstError("(()")', expect: '0', name: 'two open, one closed: the first stays open' }
            ],
            failTip: 'For "((a)" the answer is 0, not 1: the inner pair closes, the outer bracket at index 0 is the one left open. For "(()" also 0. The unclosed opener is at the bottom of the stack.'
          }
        },
        {
          ex: {
            id: 'ds-6-3', title: 'A ring-buffer queue',
            prompt: `<p>Complete the class <code>IntQueue</code>: a ring buffer of <code>int</code> starting with 2 cells, with <code>enqueue</code>, <code>dequeue</code>, <code>peek</code>, <code>size</code> and <code>isEmpty</code>, all O(1), growing by doubling when full. <code>dequeue</code> and <code>peek</code> on an empty queue throw <code>IllegalStateException</code> with the message <code>empty queue</code>. Write only the class.</p>`,
            classes: true,
            starter: `class IntQueue {\n    private int[] cells = new int[2];\n    private int head = 0, tail = 0, count = 0;\n\n    int size() { return count; }\n    boolean isEmpty() { return count == 0; }\n\n    void enqueue(int x) {\n        // grow if full; write at tail; move tail round the ring; count++\n    }\n\n    int dequeue() {\n        // throw if empty; take the item at head; move head round; count--\n        return 0;\n    }\n\n    int peek() {\n        return 0;\n    }\n\n    private void grow() {\n        // a new array twice the size; copy the items IN QUEUE ORDER starting from head; head = 0; tail = count\n    }\n}`,
            solution: `class IntQueue {\n    private int[] cells = new int[2];\n    private int head = 0, tail = 0, count = 0;\n\n    int size() { return count; }\n    boolean isEmpty() { return count == 0; }\n\n    void enqueue(int x) {\n        if (count == cells.length) grow();\n        cells[tail] = x;\n        tail = (tail + 1) % cells.length;\n        count++;\n    }\n\n    int dequeue() {\n        if (count == 0) throw new IllegalStateException("empty queue");\n        int x = cells[head];\n        head = (head + 1) % cells.length;\n        count--;\n        return x;\n    }\n\n    int peek() {\n        if (count == 0) throw new IllegalStateException("empty queue");\n        return cells[head];\n    }\n\n    private void grow() {\n        int[] bigger = new int[cells.length * 2];\n        for (int i = 0; i < count; i++) bigger[i] = cells[(head + i) % cells.length];\n        cells = bigger;\n        head = 0;\n        tail = count;\n    }\n}`,
            mustNotContain: [{ re: /ArrayDeque|ArrayList|LinkedList|System\.arraycopy|Arrays\.copyOf/, msg: 'Build the ring yourself on a plain int array, and write the copy loop in grow: it has to unwrap the ring, which copyOf cannot do.' }],
            hints: ['enqueue: if (count == cells.length) grow(); cells[tail] = x; tail = (tail + 1) % cells.length; count++;', 'dequeue: int x = cells[head]; head = (head + 1) % cells.length; count--; return x;', 'grow: for (int i = 0; i < count; i++) bigger[i] = cells[(head + i) % cells.length]; then cells = bigger; head = 0; tail = count;'],
            tests: [
              { name: 'first in, first out', main: '        IntQueue q = new IntQueue();\n        for (int i = 1; i <= 5; i++) q.enqueue(i);\n        StringBuilder sb = new StringBuilder();\n        while (!q.isEmpty()) sb.append(q.dequeue()).append(" ");\n        System.out.println(sb.toString().trim());', expect: '1 2 3 4 5' },
              { name: 'wraps round without growing', main: '        IntQueue q = new IntQueue();\n        q.enqueue(1); q.enqueue(2); q.dequeue(); q.enqueue(3); q.dequeue(); q.enqueue(4); q.dequeue(); q.enqueue(5);\n        System.out.println(q.size() + " " + q.peek() + " " + q.dequeue() + " " + q.dequeue() + " " + q.isEmpty());', expect: '2 4 4 5 true' },
              { name: 'grows while wrapped, keeping the order', main: '        IntQueue q = new IntQueue();\n        q.enqueue(1); q.enqueue(2); q.dequeue(); q.enqueue(3); q.enqueue(4); q.enqueue(5);\n        StringBuilder sb = new StringBuilder();\n        while (!q.isEmpty()) sb.append(q.dequeue()).append(" ");\n        System.out.println(sb.toString().trim());', expect: '2 3 4 5' },
              { name: 'a thousand in, a thousand out', main: '        IntQueue q = new IntQueue();\n        for (int i = 0; i < 1000; i++) q.enqueue(i);\n        boolean ok = true;\n        for (int i = 0; i < 1000; i++) if (q.dequeue() != i) ok = false;\n        System.out.println(ok + " " + q.size());', expect: 'true 0' },
              { name: 'a long run of enqueue and dequeue in step', main: '        IntQueue q = new IntQueue();\n        int sum = 0;\n        for (int i = 0; i < 500; i++) { q.enqueue(i); q.enqueue(i); sum += q.dequeue(); }\n        System.out.println(q.size() + " " + sum + " " + q.peek());', expect: '500 62250 250' },
              { name: 'empty queue throws', main: '        IntQueue q = new IntQueue();\n        try { q.dequeue(); } catch (IllegalStateException e) { System.out.println(e.getMessage()); }\n        try { q.peek(); } catch (IllegalStateException e) { System.out.println(e.getMessage()); }', expect: 'empty queue\nempty queue' }
            ],
            failTip: 'If the "grows while wrapped" test prints 4 5 2 3 or similar, grow copied cells 0..n−1 instead of starting from head. If values repeat or vanish, a % is missing on head or tail.'
          }
        },
        {
          ex: {
            id: 'ds-6-4', kind: 'answer', title: 'Trace the operations',
            prompt: `<p>Work each sequence by hand. For the ring queue, the array has 4 cells and starts with <code>head = tail = 0</code>; it does not grow in these sequences.</p>`,
            parts: [
              { label: '(a) Stack: push 1, push 2, push 3, pop, push 4, pop, pop. Which values were popped, in order? (three numbers, separated by spaces)', answer: '3 4 2', width: '8rem', wrong: [{ match: '1 2 3', msg: 'That is a queue. A stack returns the most recent push.' }, { match: '3 4 1', msg: 'After popping 3 and pushing 4, the stack holds 1 2 4. Popping twice gives 4, then 2.' }] },
              { label: '(b) After the sequence in (a), what single value remains on the stack?', answer: '1', width: '6rem' },
              { label: '(c) Ring queue (4 cells): enqueue 10, 20, 30; dequeue; dequeue; enqueue 40; enqueue 50. What is tail now?', answer: '1', width: '6rem', wrong: [{ match: '5', msg: 'tail wraps: it goes 0, 1, 2, 3, then (3 + 1) % 4 = 0, then 1.' }, { match: '0', msg: 'Five enqueues move tail five times from 0: 1, 2, 3, 0, 1.' }] },
              { label: '(d) In (c), which cell (index) holds the value 50?', answer: '0', width: '6rem', wrong: [{ match: '4', msg: 'There is no cell 4. 40 went into cell 3; tail wrapped to 0 for 50.' }] },
              { label: '(e) In (c), what is head, and what is the queue’s size? Give both numbers separated by a space.', answer: '2 3', width: '8rem', wrong: [{ match: '2 2', msg: 'Five enqueues and two dequeues leave three items: 30, 40, 50.' }] },
              { label: '(f) A queue is built from two stacks as in the puzzle. Enqueue 1, 2, 3, then dequeue once, then enqueue 4, then dequeue everything. What comes out, in order? (four numbers)', answer: '1 2 3 4', width: '10rem', wrong: [{ match: ['3 2 1 4', '1 4 2 3', '1 4 3 2'], msg: 'Stack B holds 3 2 1 (top 1) after the first transfer; 4 waits in A until B is empty. Out: 1, 2, 3, then 4.' }] }
            ],
            hints: ['Draw the four cells and move head and tail with every operation; tail = (tail + 1) % 4. For (f), items move from A to B only when B is empty, and the move reverses them.'],
            solution: `<p>(a) <b>3 4 2</b>. (b) <b>1</b>. (c) tail moves 0 → 1 → 2 → 3 → 0 → 1: <b>1</b>. (d) 50 was written at tail = 0: cell <b>0</b>. (e) head moved twice: <b>2</b>; size 5 − 2 = <b>3</b> (30 in cell 2, 40 in cell 3, 50 in cell 0). (f) <b>1 2 3 4</b>: the two-stack queue is still a queue; that is the point of it.</p>`,
            followup: 'If (c) to (e) felt mechanical, good: that mechanical feeling is what O(1) looks like from the inside. No shifting, no searching, just two indices and a remainder.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A stack is push, pop, peek on one end: last in, first out. An array and a top index give O(1) for everything; double when full.</li>
<li>A queue is enqueue at the back, dequeue at the front: first in, first out. In an array it must be a ring, with head and tail that wrap with <code>%</code>, and a grow that copies in queue order.</li>
<li>Stacks: brackets, undo, postfix arithmetic, the call stack. Queues: anything served in arrival order, and breadth-first search.</li>
<li>In Java, <code>ArrayDeque</code> is both (push/pop from one end, offer/poll from the other), and a deque besides. <code>java.util.Stack</code> is a historical mistake.</li>
<li>A structure that refuses to do things is easier to make fast and easier to reason about. The next lesson is about the stack you never see: the one that holds every method call.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Recursion', summary: 'A method that calls itself; the base case and the smaller problem; the call stack that makes it work and the overflow that happens without it; recursion against loops; the exponential trap in fib and the memo that fixes it; and the Tower of Hanoi.',
      blocks: [
        `<p>In 1883 a French mathematician, Édouard Lucas, put a puzzle on sale under the name "N. Claus de Siam", an anagram of Lucas d'Amiens, his home town. Three pegs; eight discs of different sizes stacked on one peg, largest at the bottom; move the whole tower to another peg, one disc at a time, never putting a larger disc on a smaller one. The box came with a legend: in a temple in India, priests were moving a tower of sixty-four golden discs by the same rules, and when they finished, the world would end.</p>`,
        { photo: ['hanoi-1884', 'hanoi-bremen'], caption: 'Lucas\u2019s puzzle as a magazine drew it in 1884: the tower of eight discs on peg A, the discs partway through their journey, and the tower rebuilt on peg B. Beside it, a wooden copy on a stall in Bremen, Germany, caught in the middle of a game: no disc sits on a smaller one.' },
        `<p>The puzzle is hard to solve by staring at it and easy to solve by refusing to. To move eight discs, you need the largest disc moved to the target peg, and for that the seven above it must be out of the way on the spare peg. So: move seven discs to the spare peg, move the big one, move the seven discs on top of it. How do you move seven? The same way. The legend's priests, by the way, need 2⁶⁴ − 1 moves; at one a second that is about 585 billion years, so the world is safe.</p>
<p>That way of thinking is called <em>recursion</em>: solve a problem by solving a smaller copy of it, and stop when the copy is small enough to be trivial. You met it in lesson 4, where merge sort sorted an array by sorting its halves. This lesson is about recursion itself: how to write it, how the machine runs it, when it is the right tool and when it is a trap.</p>
<h2>A method that calls itself</h2>
<p>The sum of an array from index <code>i</code> onwards is <code>a[i]</code> plus the sum from <code>i + 1</code> onwards. The sum from past the end is 0. That is a complete definition, and it is also a complete program.</p>`,
        { play: `public class Main {
    static int sum(int[] a, int i) {
        if (i == a.length) return 0;            // base case: nothing left
        return a[i] + sum(a, i + 1);            // one item, plus the sum of the rest
    }

    static long factorial(int n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }

    static boolean isPalindrome(String s) {
        if (s.length() < 2) return true;                                          // "" and "a" read the same both ways
        if (s.charAt(0) != s.charAt(s.length() - 1)) return false;
        return isPalindrome(s.substring(1, s.length() - 1));                      // strip both ends, ask again
    }

    public static void main(String[] args) {
        int[] a = {3, 1, 4, 1, 5, 9, 2, 6};
        System.out.println(sum(a, 0));
        System.out.println(factorial(5) + " " + factorial(20));
        System.out.println(isPalindrome("racecar") + " " + isPalindrome("level") + " " + isPalindrome("python") + " " + isPalindrome(""));
    }
}`, caption: 'Three recursive methods, each with the same shape: a base case that answers directly, and a recursive case that does one step and hands the rest to a smaller call. factorial(20) is the largest that fits in a long; 21! overflows.' },
        { check: "What are the two things every recursive method needs?", options: ["A loop and a counter", "A base case, and a recursive case that moves towards it", "Two parameters"], answer: 1, why: "Without a reachable base case the calls never stop: StackOverflowError." },
        `<div class="stmt"><p><span class="kind">Recursion.</span> A method that calls itself on a smaller input. It needs a <em>base case</em>, an input small enough to answer without a call, and a <em>recursive case</em> that makes progress towards it: every call must bring the input closer to the base case.</p>
<p><span class="kind">The leap of faith.</span> When writing the recursive case, assume the recursive call works, and use its answer. Do not try to trace it in your head; that is the machine's job. Check only that the base case is right and that each call gets smaller.</p></div>
<p>The figure shows what the machine does with <code>sum</code>. Each call gets a frame on the call stack (lesson 6), holding its own <code>i</code> and the place to continue when the call below it returns. Frames pile up on the way down to the base case and unwind on the way back, each adding its item to the answer it received.</p>`,
        { fig: 'callstack', fn: 'sum', n: 4, caption: 'sum over the first n items. Step through it: four frames pile up, the base case returns 0, and the frames unwind adding 1, then 4, then 1, then 3. Change n and step again.' },
        { fig: 'callstack', fn: 'fact', n: 5, caption: 'factorial(5). Every frame is waiting for the one above it; no multiplication happens until the base case has returned. The depth of the stack equals n: a recursive method uses memory in proportion to its depth.' },
        `<h2>What happens without a base case</h2>
<p>The call stack is finite. A method that calls itself without ever reaching a base case pushes frames until there is no room, and the program dies with a <code>StackOverflowError</code>. The same happens with a base case that is never reached, because the argument does not shrink. Run it once to know the shape of the message.</p>`,
        { play: `public class Main {
    static int countDown(int n) {
        if (n >= 0) System.out.println(n);      // prints 3 2 1 0, then calls on in silence
        return countDown(n - 1);               // no base case: n passes 0 and keeps going
    }

    public static void main(String[] args) {
        countDown(3);
    }
}`, expectError: true, caption: 'The site’s interpreter stops at 1,200 frames; a real JVM manages about ten thousand before the same error, more if asked. Either way the fix is the same: a base case that is reached. Here, if (n == 0) return 0; at the top.' },
        `<p>That limit matters for a design decision. A recursion that goes <code>n</code> deep, like <code>sum</code> above, is fine for an array of a thousand and fatal for an array of a million. A loop has no such limit. The rule of thumb: recursion is for problems whose depth is small, which means problems that <em>halve</em> rather than problems that <em>decrement</em>. Binary search and merge sort go log n deep; summing an array one element at a time goes n deep, and should be a loop.</p>`,
        { play: `public class Main {
    // the binary search of lesson 2, written as it is usually thought: look in the half that can contain it
    static int search(int[] a, int target, int lo, int hi) {
        if (lo > hi) return -1;                          // empty range: not here
        int mid = (lo + hi) >>> 1;
        if (a[mid] == target) return mid;
        if (a[mid] < target) return search(a, target, mid + 1, hi);
        return search(a, target, lo, mid - 1);
    }

    static long sumLoop(int[] a) { long s = 0; for (int x : a) s += x; return s; }   // long: a million values overflow an int

    public static void main(String[] args) {
        int[] sorted = new int[1000000];
        for (int i = 0; i < sorted.length; i++) sorted[i] = i * 2;
        System.out.println(search(sorted, 123456, 0, sorted.length - 1) + " " + search(sorted, 7, 0, sorted.length - 1));
        System.out.println(sumLoop(sorted));           // a million items: a loop, not a recursion
    }
}`, caption: 'A million sorted values, found in about 20 recursive calls: halving means the stack never gets deep. The sum of a million values is a loop, because the recursive sum would need a million frames.' },
        { check: "Which problem should be written recursively?", options: ["Summing a million-element array", "Binary search: it halves, so the stack stays log n deep", "Counting the characters in a string"], answer: 1, why: "Recursion that decrements goes n deep and risks the stack; recursion that halves goes log n deep and is the natural form." },
        `<h2>The exponential trap</h2>
<p>The Fibonacci numbers are defined recursively: each is the sum of the two before, starting 0, 1. Written straight from the definition, the method is three lines, correct, and catastrophically slow. The figure shows why: <code>fib(5)</code> calls <code>fib(4)</code> and <code>fib(3)</code>; <code>fib(4)</code> calls <code>fib(3)</code> again; the same small problems are solved over and over, and the number of calls roughly doubles with each increase in <code>n</code>.</p>`,
        { fig: 'callstack', fn: 'fib', n: 5, caption: 'fib(5): fifteen calls for a five-line answer, and fib(2) is computed three times. Set n to 7 and play it through: 41 calls. Every +1 on n multiplies the work by about 1.6.' },
        { play: `public class Main {
    static long calls;

    static long fib(int n) {
        calls++;
        if (n < 2) return n;
        return fib(n - 1) + fib(n - 2);
    }

    static long[] memo = new long[91];           // memo[n] = fib(n) once known; 0 means not yet (fib(0) is 0 anyway)

    static long fibMemo(int n) {
        calls++;
        if (n < 2) return n;
        if (memo[n] != 0) return memo[n];        // already solved: look it up
        memo[n] = fibMemo(n - 1) + fibMemo(n - 2);
        return memo[n];
    }

    public static void main(String[] args) {
        for (int n : new int[] {10, 15, 20, 25}) {
            calls = 0; long v = fib(n);
            System.out.printf("fib(%2d) = %6d   %8d calls%n", n, v, calls);
        }
        calls = 0;
        System.out.println("fibMemo(90) = " + fibMemo(90) + "   " + calls + " calls");
    }
}`, caption: 'Five more on n, about eleven times the calls: fib(25) takes a quarter of a million. The memoised version remembers every answer and makes 179 calls for fib(90), about two per n. Same definition, same recursion; the only change is that no sub-problem is solved twice.' },
        { check: "Plain fib(30) makes about 2.7 million calls. With a memo, about how many?", options: ["About 60", "About 30,000", "Still 2.7 million"], answer: 0, why: "Each n from 2 to 30 is computed once, with two calls each: 1 + 2 × 29 = 59. The cost drops to the number of distinct sub-problems." },
        `<div class="stmt"><p><span class="kind">Memoisation.</span> If a recursion solves the same sub-problem more than once, store each answer the first time and look it up after. The cost drops from the number of calls to the number of <em>distinct</em> sub-problems. This is the first step towards dynamic programming, which a later course treats properly.</p></div>
<h2>The Tower of Hanoi</h2>
<p>Lucas's puzzle is the recursion that cannot be written any other way without a stack of your own. To move <code>n</code> discs from peg A to peg C using B as the spare: move <code>n − 1</code> discs from A to B (using C as the spare), move the last disc from A to C, move the <code>n − 1</code> discs from B to C (using A as the spare). The base case is zero discs: do nothing.</p>`,
        { play: `public class Main {
    static long moves;
    static boolean show = true;

    static void hanoi(int n, char from, char to, char via) {
        if (n == 0) return;
        hanoi(n - 1, from, via, to);              // clear the way: n - 1 discs onto the spare peg
        moves++;
        if (show) System.out.println("move disc " + n + " from " + from + " to " + to);
        hanoi(n - 1, via, to, from);              // bring them back on top
    }

    public static void main(String[] args) {
        hanoi(3, 'A', 'C', 'B');
        System.out.println("3 discs: " + moves + " moves");
        show = false;
        for (int n : new int[] {8, 10, 16, 20}) { moves = 0; hanoi(n, 'A', 'C', 'B'); System.out.println(n + " discs: " + moves + " moves = 2^" + n + " - 1"); }
        System.out.println("64 discs: 18446744073709551615 moves, which a long cannot even hold");
    }
}`, caption: 'Seven moves for three discs, printed; 2ⁿ − 1 in general, and the method makes that many moves because it has to: there is no shorter solution. Twenty discs is a million moves, which already takes the interpreter a moment; thirty would be a billion. The count obeys T(n) = 2T(n − 1) + 1, which solves to 2ⁿ − 1.' },
        `<h2>Recursion or a loop?</h2>
<table class="growth-table"><thead><tr><th>Shape of the problem</th><th>Write it as</th><th>Why</th></tr></thead><tbody>
<tr><td>Walk along n things once (sum, find, count)</td><td>a loop</td><td>recursion goes n deep for no gain</td></tr>
<tr><td>Halve the problem (binary search, merge sort, quicksort)</td><td>recursion</td><td>log n deep, and the recursive version is the clear one</td></tr>
<tr><td>Branch into several sub-problems (Hanoi, trees, permutations)</td><td>recursion</td><td>a loop would need its own explicit stack to do the same</td></tr>
<tr><td>Sub-problems repeat (fib, many counting problems)</td><td>recursion with a memo, or a loop that builds a table</td><td>exponential otherwise</td></tr>
</tbody></table>
<p>Every recursion can be turned into a loop with an explicit stack, because that is what the machine does anyway; and every loop can be written as a recursion. Choose by clarity and by depth. Trees, the subject of lesson 9, are where recursion stops being a choice and becomes the natural language: a tree is a node with smaller trees hanging from it, and almost everything you do to one is "do it to the left subtree, do it to the right subtree".</p>
<details class="reveal"><summary>Puzzle: <code>static int f(int n) { if (n == 0) return 0; return f(n / 2) + n % 2; }</code>. What does f compute? How deep does it go for n = 1,000,000?</summary><p>The number of 1 bits in the binary form of n: the last bit is <code>n % 2</code>, the rest are in <code>n / 2</code>. It halves, so it goes about log₂ n deep: 20 frames for a million. <code>f(1000000)</code> is 7, because 1,000,000 = 11110100001001000000 in binary.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> A base case that comes <em>after</em> the recursive call, so it is never reached. An argument that does not shrink (<code>f(n)</code> calling <code>f(n)</code>, or <code>search(lo, hi)</code> calling <code>search(lo, mid)</code> when <code>mid == hi</code>). Forgetting to <code>return</code> the result of the recursive call, so the method returns its default. Using <code>int</code> for factorial, which overflows at 13. Tracing the recursion by hand instead of trusting it. A memo that uses 0 for "unknown" when 0 is a possible answer (fib is safe only because fib(0) is never asked for by a larger call that needs a non-zero).</p>` },
        {
          ex: {
            id: 'ds-7-1', title: 'Fast power',
            prompt: `<p>Write</p><pre class="code">static long power(long base, int exp)</pre><p>that returns <code>base</code> to the power <code>exp</code> (<code>exp ≥ 0</code>) by recursion, using the halving trick: if <code>exp</code> is even, <code>power(base, exp)</code> is <code>power(base, exp / 2)</code> squared; if odd, it is <code>base</code> times <code>power(base, exp − 1)</code>. Make <em>one</em> recursive call per step, so that the depth is about <code>2 log₂ exp</code>. Do not use <code>Math.pow</code> or a loop.</p>`,
            starter: `static long power(long base, int exp) {\n    // base case: exp == 0\n    // even exp: square the half power (compute it once!)\n    // odd exp: base times power(base, exp - 1)\n    return 0;\n}`,
            solution: `static long power(long base, int exp) {\n    if (exp == 0) return 1;\n    if (exp % 2 == 0) {\n        long half = power(base, exp / 2);\n        return half * half;\n    }\n    return base * power(base, exp - 1);\n}`,
            mustNotContain: [{ re: /Math\.pow|\bfor\s*\(|\bwhile\s*\(/, msg: 'Recursion only: no Math.pow and no loop.' }, { re: /power\s*\([^;]*\)\s*\*\s*power\s*\(/, msg: 'Call power once for the half and square the result; calling it twice makes the work 2ⁿ instead of log n.' }],
            hints: ['if (exp == 0) return 1;', 'long half = power(base, exp / 2); return half * half; for even exp. Store the half in a variable: calling power twice would double the work at every level.', 'return base * power(base, exp - 1); for odd exp.'],
            tests: [
              { call: 'power(2, 10)', expect: '1024', name: '2^10' },
              { call: 'power(3, 0) + " " + power(0, 0) + " " + power(7, 1)', expect: '1 1 7', name: 'exponent 0 and 1' },
              { call: 'power(2, 62)', expect: '4611686018427387904', name: '2^62, the largest power of two in a long' },
              { call: 'power(3, 39)', expect: '4052555153018976267', name: '3^39 fits in a long' },
              { call: 'power(-2, 7) + " " + power(-2, 8)', expect: '-128 256', name: 'negative base' },
              { call: 'power(10, 18)', expect: '1000000000000000000', name: '10^18' },
              { call: 'power(1, 1000000)', expect: '1', name: 'a million: fine for halving, fatal for decrementing' }
            ],
            failTip: 'If the last test overflows the stack, the odd case is being used for every step (exp − 1 each time); check that the even branch halves. If 2^62 is wrong, the multiplication is happening in int: base is a long.'
          }
        },
        {
          ex: {
            id: 'ds-7-2', title: 'Tower of Hanoi',
            prompt: `<p>Write</p><pre class="code">static int hanoi(int n, String from, String to, String via)</pre><p>that prints the moves to transfer <code>n</code> discs from peg <code>from</code> to peg <code>to</code>, one per line as <code>disc 1: A -> C</code> (disc 1 is the smallest), and returns the number of moves made. Zero discs: print nothing, return 0.</p>`,
            starter: `static int hanoi(int n, String from, String to, String via) {\n    // base case\n    // move n - 1 discs out of the way, move disc n, move the n - 1 discs back on top\n    // return the total number of moves\n    return 0;\n}`,
            solution: `static int hanoi(int n, String from, String to, String via) {\n    if (n == 0) return 0;\n    int before = hanoi(n - 1, from, via, to);\n    System.out.println("disc " + n + ": " + from + " -> " + to);\n    int after = hanoi(n - 1, via, to, from);\n    return before + 1 + after;\n}`,
            hints: ['if (n == 0) return 0;', 'int a = hanoi(n - 1, from, via, to); print the move of disc n from from to to; int b = hanoi(n - 1, via, to, from); return a + 1 + b;', 'In the first call the spare peg is the target of the small tower, so to and via swap places; in the second they swap back.'],
            tests: [
              { name: 'one disc', main: '        int m = hanoi(1, "A", "C", "B");\n        System.out.println(m);', expect: 'disc 1: A -> C\n1' },
              { name: 'two discs', main: '        int m = hanoi(2, "A", "C", "B");\n        System.out.println(m);', expect: 'disc 1: A -> B\ndisc 2: A -> C\ndisc 1: B -> C\n3' },
              { name: 'three discs', main: '        int m = hanoi(3, "A", "C", "B");\n        System.out.println(m);', expect: 'disc 1: A -> C\ndisc 2: A -> B\ndisc 1: C -> B\ndisc 3: A -> C\ndisc 1: B -> A\ndisc 2: B -> C\ndisc 1: A -> C\n7' },
              { name: 'other peg names', main: '        int m = hanoi(2, "left", "right", "middle");\n        System.out.println(m);', expect: 'disc 1: left -> middle\ndisc 2: left -> right\ndisc 1: middle -> right\n3' },
              { name: 'zero discs', main: '        System.out.println(hanoi(0, "A", "C", "B"));', expect: '0' }
            ],
            failTip: 'For two discs the first move is disc 1 to the SPARE peg (B), not to C: the first recursive call passes via as its target. If the count is wrong, make sure both recursive results are added, plus 1.'
          }
        },
        {
          ex: {
            id: 'ds-7-3', title: 'Count the paths',
            prompt: `<p>A robot stands at the top-left corner of a grid with <code>rows</code> rows and <code>cols</code> columns and can only step right or down. Write</p><pre class="code">static long paths(int rows, int cols)</pre><p>that returns the number of different routes to the bottom-right corner. Think recursively: from a grid with one row or one column there is exactly one route; otherwise the first step is either down (leaving a grid with one row fewer) or right (one column fewer). The plain recursion is exponential; add a memo so that <code>paths(18, 18)</code> is instant. The memo must be a field, declared outside the method.</p>`,
            starter: `static long[][] memo = new long[20][20];   // 0 = not yet computed (no real answer is 0)\n\nstatic long paths(int rows, int cols) {\n    // base case: one row or one column\n    // if memo[rows][cols] is known, return it\n    // otherwise compute paths(rows - 1, cols) + paths(rows, cols - 1), store it, return it\n    return 0;\n}`,
            solution: `static long[][] memo = new long[20][20];\n\nstatic long paths(int rows, int cols) {\n    if (rows == 1 || cols == 1) return 1;\n    if (memo[rows][cols] != 0) return memo[rows][cols];\n    memo[rows][cols] = paths(rows - 1, cols) + paths(rows, cols - 1);\n    return memo[rows][cols];\n}`,
            mustNotContain: [{ re: /\bfor\s*\(|\bwhile\s*\(/, msg: 'Recursion with a memo, not a loop; the loop version is the next course’s dynamic programming.' }],
            hints: ['if (rows == 1 || cols == 1) return 1;', 'if (memo[rows][cols] != 0) return memo[rows][cols];', 'memo[rows][cols] = paths(rows - 1, cols) + paths(rows, cols - 1); return memo[rows][cols];'],
            tests: [
              { call: 'paths(1, 1) + " " + paths(1, 5) + " " + paths(5, 1)', expect: '1 1 1', name: 'a single row or column' },
              { call: 'paths(2, 2)', expect: '2', name: '2 by 2: down-right or right-down' },
              { call: 'paths(3, 3)', expect: '6', name: '3 by 3' },
              { call: 'paths(3, 7)', expect: '28', name: '3 by 7' },
              { call: 'paths(10, 10)', expect: '48620', name: '10 by 10' },
              { call: 'paths(18, 18)', expect: '2333606220', name: '18 by 18: 2.3 billion routes, needs the memo and a long' },
              { call: 'paths(19, 19)', expect: '9075135300', name: '19 by 19' }
            ],
            failTip: 'If paths(18, 18) times out, the memo is not being read before recursing, or not being written. If the large answers are negative or wrong, the memo is an int array.'
          }
        },
        {
          ex: {
            id: 'ds-7-4', kind: 'answer', title: 'Depth and count',
            prompt: `<p>Count calls and frames. "Calls" means the total number of times the method is entered, including the first; "depth" means the greatest number of frames on the stack at once.</p>`,
            parts: [
              { label: '(a) sum(a, 0) on an array of 100 values (the version in this lesson): how many calls, and how deep? Give the two numbers separated by a space.', answer: '101 101', width: '8rem', wrong: [{ match: '100 100', msg: 'The base case, sum(a, 100), is a call too, and it sits on top of the other 100 frames.' }] },
              { label: '(b) Plain fib(10): how many calls?', answer: '177', width: '6rem', wrong: [{ match: ['55', '89'], msg: 'That is a Fibonacci number, not the call count. calls(n) = 1 + calls(n − 1) + calls(n − 2), with calls(0) = calls(1) = 1: 1, 1, 3, 5, 9, 15, 25, 41, 67, 109, 177.' }] },
              { label: '(c) Plain fib(10): how deep does the stack get?', answer: '10', width: '6rem', wrong: [{ match: '177', msg: 'That is the count. Only the leftmost chain fib(10) → fib(9) → … → fib(1) is on the stack at once.' }, { match: ['9', '11'], msg: 'fib(10), fib(9), …, fib(1): ten frames.' }] },
              { label: '(d) fibMemo(40), with an empty memo: how many calls? (Count exactly: each n from 2 to 40 is computed once, and each computation makes two calls; the second of each pair is answered from the memo or by a base case.)', answer: '79', width: '6rem', wrong: [{ match: '40', msg: 'Each of the 39 computed values (n = 2..40) makes two calls, and there is the first call itself: 1 + 2 × 39.' }, { match: '81', msg: '1 + 2 × 39 = 79: the values computed are n = 2 to 40, which is 39 of them.' }] },
              { label: '(e) hanoi(12): how many moves, and how deep, counting only the frames for n ≥ 1 (the n = 0 call returns at once)?', answer: '4095 12', width: '8rem', wrong: [{ match: '4096 12', msg: '2¹² − 1 = 4095.' }, { match: '4095 13', msg: 'Frames for n = 12 down to 1: twelve of them.' }] },
              { label: '(f) power(2, 1000) from this lesson’s exercise, by halving: about how deep? (Choose the nearest: 10, 20, 500, 1000)', answer: '20', width: '6rem', wrong: [{ match: '1000', msg: 'That is the decrementing version. Halving takes 10 even steps, each possibly preceded by an odd step: at most about 2 log₂ 1000 ≈ 20.' }, { match: '10', msg: 'Close: log₂ 1000 ≈ 10 even steps, but odd exponents add a step each; the bound is about 20.' }] }
            ],
            hints: ['Calls count every entry; depth counts the longest chain of unfinished calls. For fib the chain is the leftmost path; the count follows calls(n) = 1 + calls(n − 1) + calls(n − 2).'],
            solution: `<p>(a) <b>101 101</b>: indices 0 to 100, all on the stack at once at the bottom. (b) <b>177</b>. (c) <b>10</b>. (d) <b>79</b>: the first call, then two calls for each of the 39 values computed. (e) <b>4095 12</b>. (f) <b>20</b>: 1000 in binary has 10 bits, and each bit costs at most two calls.</p>`,
            followup: 'Parts (b) and (d) are the whole argument for memoisation in two numbers: 177 against 79 at n = 10, and at n = 40 it is 331 million against 79.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>Recursion: a base case that answers directly, and a recursive case that does one step and calls itself on a smaller input. Trust the call; check the base case and the shrinking.</li>
<li>Each call is a frame on the call stack. Depth costs memory, and a missing or unreachable base case is a StackOverflowError.</li>
<li>Halving problems (search, sorting) recurse log n deep and should be recursive. Walking n things recurses n deep and should be a loop.</li>
<li>Repeated sub-problems make a recursion exponential; a memo makes it linear. fib(25): 243 thousand calls plain, 49 with a memo.</li>
<li>Hanoi takes 2ⁿ − 1 moves and no clever idea can reduce that; branching recursions are where loops need a stack of their own.</li>
</ul></div>`
      ]
    }
  ]
});
