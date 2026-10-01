// Lesson content, (c) 2026 Michael Sayers, licensed CC BY-SA 4.0 (see LICENSE-CONTENT.md).
// Data Structures and Algorithms, in Java, on the site's own interpreter (src/java.js). Every structure and algorithm is shown three ways:
// an interactive figure to step through (src/widgets.js: growth, arrayops, dynarray, search, sortlab), code to write, and a cost to count.
window.COURSES = window.COURSES || [];
window.COURSES.push({
  id: 'dsa', code: 'SC 107', short: 'DSA', lang: 'java', status: 'developing',
  title: 'Data Structures and Algorithms',
  grades: 'Grades 11–12 · after Java, or C++ with the Java primer',
  audience: `<p><b>Grades 11–12</b>, after <em>Introduction to Java</em> (SC 106) or after <em>Introduction to C++</em> and lesson 1 of SC 106. This is the course that every computer science degree puts second: how data is arranged in memory, what each arrangement makes cheap and what it makes expensive, and how to tell, before running anything, how a program's running time will grow with its input. It is the material of technical interviews, of the second AP exam's hardest questions, and of every system that has to stay fast as it grows.</p><p>The code is Java, but every idea transfers unchanged to any language. Each lesson has interactive figures you can step through, code you write, and costs you count. The course is being written: the first three lessons are here.</p>`,
  tagline: 'How data is arranged, what each arrangement costs, and how to know before you run it: arrays, searching, sorting, and the measure of growth.',
  description: `<p>Two programs can give the same answer and differ in running time by a factor of a billion. The difference is rarely the computer, the language or how neatly the code is written. It is the <em>arrangement</em> of the data and the <em>method</em> that works on it: a data structure and an algorithm. Choosing them is the part of programming that separates a program that works on the test file from one that still works when the file is a million times bigger.</p>
<p>This course teaches the classical structures (arrays, lists, stacks, queues, hash tables, trees, graphs) and the classical algorithms on them (searching, sorting, traversal), and, more than any one of them, the habit of asking <em>how does the cost grow?</em> and the tools to answer it. Everything is shown three ways: as a picture you can step through one operation at a time, as Java code you write and check, and as a count of steps you can predict and then measure.</p>
<p>Programs run in the Java interpreter built into this site, instantly and offline. It is slower than a real machine, so experiments use thousands of items where a laptop would use millions; the shapes of the curves are the same, and that is what matters.</p>`,
  outcomes: [
    'Count the steps an algorithm takes as a function of its input size, and name its order of growth',
    'Explain what an array makes cheap (indexing) and expensive (inserting), and why a growing array doubles',
    'Write and prove binary search, and recognise the overflow bug that hid in it for twenty years',
    'Write selection and insertion sort, count their comparisons and moves, and say when each is the right choice',
    'Predict a running time from a doubling experiment, and check a prediction by measuring',
    'Choose a structure for a task by the operations the task needs most'
  ],
  howItWorks: `<h3>How to use these pages</h3><p>Each lesson has three kinds of thing to do. <b>Figures</b> with Step and Play buttons show a structure changing one operation at a time; use them until you can predict the next step. <b>Code</b> boxes run in your browser; change the sizes and watch the counts. <b>Exercises</b> are of two kinds: programs the checker runs on hidden inputs, and questions with a number for an answer, which the checker also marks. Where an exercise asks for a method, write only the method, with the word <code>static</code>; the checker supplies the class and a <code>main</code>.</p><p>You need the Java of SC 106 lessons 1–4: types, loops, methods, and arrays, which lesson 1 here introduces as it goes. Classes appear from lesson 4 on and are explained where they appear.</p>`,
  lessons: [
    /* ================================================================== */
    {
      title: 'Counting the cost', summary: 'Why speed is a property of the method, not the machine; the array, what it makes cheap and expensive; how a growing array grows; and the orders of growth that describe every algorithm in this course.',
      blocks: [
        `<p>The United States counts its population every ten years, and by 1880 the count had become the largest data-processing job in the world: fifty million people, each with a dozen facts to record, every total worked out by clerks with pencils and tally sheets. The tabulation of the 1880 census took most of the decade. The Census Office could see that the 1890 count would not be finished before the 1900 count began. A young engineer who had worked on the 1880 census, Herman Hollerith, proposed a different arrangement of the data: each person's facts punched as holes in a card, and machines that could read the holes and count them electrically. The cards for the 1890 census were run through his tabulators, and the population total was announced within months. The company Hollerith founded to sell the machines later became part of IBM.</p>
<p>The lesson usually drawn from this is that machines are faster than people. The lesson that matters for this course is different. Hollerith's machines did not count faster because the electricity was quick; they counted faster because a card could be <em>sorted and counted in one pass</em>, and the pencil method could not. The arrangement of the data decided the cost. Sixty years later, when computers arrived, the same thing turned out to be true inside them: for most problems the computer's speed is fixed and the arrangement is the only thing you control. This course is about that arrangement.</p>
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
<p><span class="kind">The shapes, from cheapest to dearest.</span> O(1) constant · O(log n) logarithmic, halving · O(n) linear · O(n log n) · O(n²) quadratic · O(2ⁿ) exponential. Multiplying <code>n</code> by 10 multiplies the steps by about 1, 3.3, 10, 33, 100, and (for 2ⁿ) more than the number of atoms in the universe.</p></div>
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
        { fig: 'dynarray', caption: 'Appends are usually one step. Now and then the array is full, and every value is copied into a new array twice the size. Append thirty or so and compare the two counts: the copies never overtake the appends.' },
        `<p>Count the copies when the capacity has just reached <code>n</code>: the last doubling copied <code>n/2</code> values, the one before it <code>n/4</code>, and so on: <code>n/2 + n/4 + n/8 + … &lt; n</code>. So <code>n</code> appends cost fewer than <code>n</code> copies in total, under two steps per append on average. Any single append may be expensive, but the expense is paid for by the cheap ones around it. The technical word is <em>amortized</em>: appending to a doubling array is O(1) amortized, and that is why <code>ArrayList.add</code> is safe to call in a loop a million times.</p>`,
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
<li>A growing array doubles when full; the copies total less than the appends, so an append is O(1) amortized. That is <code>ArrayList</code>.</li>
<li>The doubling experiment: run on n and 2n and look at the ratio of costs. 2 means linear, 4 quadratic, about 1 logarithmic.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Searching', summary: 'Linear search and its cost; binary search, why it works and why it is so fast; the overflow bug that hid in it for twenty years; and the variants that find a boundary rather than a value.',
      blocks: [
        `<p>In 2006 Joshua Bloch, who had written much of Java's standard library, published a short article with the title "Nearly All Binary Searches and Mergesorts are Broken". The binary search in Jon Bentley's <em>Programming Pearls</em>, a book that Bloch had learned from, had been proved correct in the text, tested, and reprinted for twenty years. It had a bug. So did the binary search Bloch himself had written for Java's <code>java.util.Arrays</code>, where it had lain for nine years before someone's program broke on it. The bug was a single line, the one that finds the middle of a range: <code>int mid = (low + high) / 2;</code>. For a range inside an array of more than about a billion elements, <code>low + high</code> is larger than an <code>int</code> can hold, wraps round to a negative number, and the search looks at a cell that does not exist.</p>
<p>Nobody had noticed because nobody had searched an array of a billion elements, and then, around 2006, people did. The algorithm was right; the arithmetic was not; and the lesson, which you will see at the end of this lesson, is that the cheapest-looking line of a correct algorithm still has to be checked against the machine it runs on. First, the algorithm, which is one of the oldest and best ideas in the subject.</p>
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
        { fig: 'search', items: [2, 5, 8, 12, 16, 23, 38, 42, 56, 61, 72, 79, 85, 91, 97, 104], caption: 'Sixteen sorted values. Type a target and step: lo and hi mark the range that can still hold it, mid is the cell compared. Try 2, 104 and 50 (which is absent). No search takes more than 5 comparisons, because 2⁴ < 16 ≤ 2⁵.' },
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
        `<p>In the third volume of <em>The Art of Computer Programming</em>, published in 1973, Donald Knuth reported an estimate from the computer manufacturers of the 1960s: more than a quarter of all the running time on their customers' machines was spent sorting. The machines were mostly doing business: payroll, inventory, billing, and every one of those jobs began by putting records in order, by account number, by date, by name, so that matching ones could be found next to each other. The data arrived on punched cards and magnetic tape, and the sorting algorithms of the time were written to work with a few hundred cards in memory and the rest waiting on a tape drive.</p>
<p>A quarter of all computing is no longer sorting, but sorting is still underneath more of it than anything else: every search index, every database, every spreadsheet column you click to order, and, from the last lesson, every binary search. The subject has two halves. This lesson is the first: the simple sorts, which are O(n²), and which you should know not because you will use them on large inputs but because they are where the ideas of invariant, cost and best-and-worst case become concrete. The next lesson is the second half, the O(n log n) sorts that the world actually runs.</p>
<h2>The problem, stated precisely</h2>
<div class="stmt"><p><span class="kind">Sorting.</span> Given an array of <code>n</code> values that can be compared, rearrange it so that <code>a[0] ≤ a[1] ≤ … ≤ a[n−1]</code>. The result must contain exactly the values that were there, no more and no fewer.</p>
<p><span class="kind">Cost.</span> We count <em>comparisons</em> (how many times two values are compared) and <em>moves</em> (how many times a value is written into a cell). A swap is three moves.</p>
<p><span class="kind">Stability.</span> A sort is <em>stable</em> if values that compare equal keep the order they had. Sorting students by grade with a stable sort keeps the names alphabetical within each grade, if they were alphabetical before.</p></div>
<h2>Selection sort</h2>
<p>The method you would use on a hand of cards if you were being careful: find the smallest value and put it first; then find the smallest of the rest and put it second; and so on. After <code>i</code> rounds, the first <code>i</code> cells hold the <code>i</code> smallest values, in order, and will never move again. That sentence is the invariant.</p>`,
        { fig: 'sortlab', algo: 'selection', caption: 'Twelve values, with the comparisons and moves counted at every step. Try the four input shapes: selection sort makes exactly the same number of comparisons on all of them, and never more than n − 1 swaps.' },
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
    }
  ]
});
