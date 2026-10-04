// Lesson content, (c) 2026 Michael Sayers, licensed CC BY-SA 4.0 (see LICENSE-CONTENT.md).
// Data Structures and Algorithms, in Java, on the site's own interpreter (src/java.js). Every structure and algorithm is shown three ways:
// an interactive figure to step through (src/widgets.js: growth, arrayops, dynarray, search, sortlab, mergeviz, partition, linkedlist, stackqueue, callstack, hashtable, bst, heap, graph), code to write, and a cost to count.
window.COURSES = window.COURSES || [];
window.COURSES.push({
  id: 'dsa', code: 'SC 107', short: 'DSA', lang: 'java', standard: 1,
  title: 'Data Structures and Algorithms',
  grades: 'Grades 11–12 · after Java, or C++ with the Java primer',
  audience: `<p><b>Grades 11–12</b>, after <em>Introduction to Java</em> (SC 106) or after <em>Introduction to C++</em> and lesson 1 of SC 106. This is the course that every computer science degree puts second: how data is arranged in memory, what each arrangement makes cheap and what it makes expensive, and how to tell, before running anything, how a program's running time will grow with its input. It is the material of technical interviews, of the second AP exam's hardest questions, and of every system that has to stay fast as it grows.</p><p>The code is Java, but every idea transfers unchanged to any language. Each lesson has interactive figures you can step through, code you write, and costs you count. Fifteen lessons, in three units of four, four and three, each ending in a <em>checkpoint</em> of mixed questions, lead to a project that uses a hash table, a sort and a heap on one problem. The course keeps a list of the skills it teaches, from counting steps to Dijkstra's algorithm, and the Review page shows which of them are secure.</p>`,
  tagline: 'How data is arranged, what each arrangement costs, and how to know before you run it: arrays, searching, sorting, lists, stacks and queues, recursion, hash tables, trees, heaps and graphs.',
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
    'Build a hash table with chaining, explain load factor and doubling, and say why equal objects need equal hash codes',
    'Insert into, search, walk and delete from a binary search tree, and explain why its shape decides its speed',
    'Store a heap in an array, write sift up and sift down, and use a priority queue for the k best of many',
    'Search a graph breadth first and depth first, and find shortest routes with Dijkstra\'s algorithm',
    'Predict a running time from a doubling experiment, and check a prediction by measuring',
    'Choose a structure for a task by the operations the task needs most'
  ],
  howItWorks: `<h3>How to use these pages</h3><p>Each lesson has three kinds of thing to do. <b>Figures</b> with Step and Play buttons show a structure changing one operation at a time; use them until you can predict the next step. <b>Code</b> boxes run in your browser; change the sizes and watch the counts. <b>Exercises</b> are of two kinds: programs the checker runs on hidden inputs, and questions with a number for an answer, which the checker also marks. Where an exercise asks for a method, write only the method, with the word <code>static</code>; the checker supplies the class and a <code>main</code>.</p><p>You need the Java of SC 106 lessons 1–4: types, loops and methods. Arrays (SC 106 lesson 6) are introduced again in lesson 1 here, as it goes. Classes appear from lesson 4 on and are explained where they appear; SC 106 lesson 9 teaches them in full.</p><p>Lessons 5, 10 and 14 are <b>checkpoints</b>: they teach nothing new, and mix questions on the unit before them (counting, searching and sorting; lists, stacks, recursion and hashing; trees, heaps and graphs), because ideas that look alike are only told apart by being asked about together. The course names 29 skills, such as <em>binary search</em> and <em>sift a heap</em>. Every quick check and exercise says which skill it practises, and the skills map on the course page shows each as not started, practising or secure.</p>`,
  // The named skills of the course (LESSON_STANDARD.md §4). Every quick check and exercise names the skill it practises; the skills map on
  // the course page and on #/today shows each as not started, practising or secure.
  skills: [
    { id: 'count-steps', name: 'Count steps and name the order of growth' },
    { id: 'array-cost', name: 'Say what an array makes cheap and what it makes dear' },
    { id: 'dynamic-array', name: 'Explain why a growing array doubles' },
    { id: 'binary-search', name: 'Search a sorted array by halving' },
    { id: 'midpoint-overflow', name: 'Avoid the overflow in (lo + hi) / 2' },
    { id: 'selection-sort', name: 'Write selection sort and count its comparisons' },
    { id: 'insertion-sort', name: 'Write insertion sort and say when it is fast' },
    { id: 'sort-stability', name: 'Say what a stable sort guarantees' },
    { id: 'merge-step', name: 'Merge two sorted runs' },
    { id: 'n-log-n', name: 'Explain why halving and merging cost n log n' },
    { id: 'quicksort-pivot', name: 'Partition around a pivot and see its gamble' },
    { id: 'linked-list-cost', name: 'Compare a linked list with an array' },
    { id: 'linked-list-pointers', name: 'Change the links of a linked list' },
    { id: 'stack-lifo', name: 'Use a stack for last in, first out' },
    { id: 'ring-buffer', name: 'Build a queue in an array with a ring' },
    { id: 'base-case', name: 'Write a recursive method with a base case' },
    { id: 'recursion-fit', name: 'Decide when a problem should be recursive' },
    { id: 'memoization', name: 'Rescue a repeating recursion with a memo' },
    { id: 'hash-index', name: 'Turn a hash code into a bucket index' },
    { id: 'hash-chains', name: 'Follow chains, load factor and doubling in a hash table' },
    { id: 'bst-search', name: 'Search, insert and walk a binary search tree' },
    { id: 'bst-balance', name: 'Explain why a tree\'s shape decides its speed' },
    { id: 'heap-sift', name: 'Store a heap in an array and sift up and down' },
    { id: 'priority-queue', name: 'Use a priority queue and keep the k best' },
    { id: 'graph-storage', name: 'Choose lists or a matrix to store a graph' },
    { id: 'bfs-queue', name: 'Search a graph breadth first and depth first' },
    { id: 'dijkstra', name: 'Find shortest routes with Dijkstra\'s algorithm' },
    { id: 'map-counting', name: 'Count items with a hash map' },
    { id: 'top-k', name: 'Find the k most frequent items with a heap' }
  ],
  lessons: [
    /* ================================================================== */
    {
      standards: ['3A-DA-10', '3B-AP-11', '3B-AP-12'],
      standard: 1, title: 'Counting the cost', summary: 'Why speed is a property of the method, not the machine; the array, what it makes cheap and expensive; how a growing array grows; and the orders of growth that describe every algorithm in this course.',
      blocks: [
        `<p>The United States counts its population every ten years, and by 1880 the count had become the largest data-processing job in the world: fifty million people, each with a dozen facts to record, every total worked out by clerks with pencils and tally sheets. The tabulation of the 1880 census took most of the decade. The Census Office could see that the 1890 count would not be finished before the 1900 count began. A young engineer who had worked on the 1880 census, Herman Hollerith, proposed a different arrangement of the data: each person's facts punched as holes in a card, and machines that could read the holes and count them electrically. The cards for the 1890 census were run through his tabulators, and the population total was announced within months. The company Hollerith founded to sell the machines later became part of IBM.</p>`,
        { photo: 'hollerith-1890-census', caption: 'Hollerith\'s machines at work on the 1890 census, from <i>Scientific American</i>, August 1890. Each card goes into the press on the desk; wherever a pin finds a hole, a dial on the cabinet above moves on by one.' },
        `<p>The lesson usually drawn from this is that machines are faster than people. The lesson that matters for this course is different. Hollerith's machines did not count faster because the electricity was quick; they counted faster because a card could be <em>sorted and counted in one pass</em>, and the pencil method could not. The arrangement of the data decided the cost. Sixty years later, when computers arrived, the same thing turned out to be true inside them: for most problems the computer's speed is fixed and the arrangement is the only thing you control. This course is about that arrangement. But how can you tell, before you run anything, how much a method will cost when the input gets a thousand times bigger? That is the question of this lesson.</p>
<h2>Measure steps, not seconds</h2>
<p>How long does a program take? In seconds, that depends on the computer, on what else it is doing, and on the day. What does <em>not</em> depend on any of that is the number of basic steps the program performs: an addition, a comparison, a look into an array. So that is what we count. And we count it not for one input but as a <em>function of the input's size</em>, usually written <code>n</code>: a program that takes 1,000 steps for 10 items and 1,000,000 for 1,000 items is telling you something a stopwatch cannot.</p>
<p>The three methods below each do something with an array of <code>n</code> numbers. Each counts its own steps. Predict the three counts for <code>n = 10</code>, then run it. Then change <code>n</code> to 100 and to 1000, and watch how each count grows.</p>`,
        { predict: true, play: `public class Main {
    static long steps;
    static int first(int[] a) { steps++; return a[0]; }    // one step, whatever n is
    static int sum(int[] a) {                 // one step per item
        int total = 0;
        for (int i = 0; i < a.length; i++) { total += a[i]; steps++; }
        return total;
    }
    static int pairs(int[] a) {               // one step per pair of items
        int count = 0;
        for (int i = 0; i < a.length; i++)
            for (int j = i + 1; j < a.length; j++) { if (a[i] + a[j] == 10) count++; steps++; }
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
}`, caption: 'It prints 1, 10 and 45 steps: <code>first</code> does one thing, <code>sum</code> looks at each of the 10 items, and <code>pairs</code> looks at each pair, 10 × 9 / 2 = 45. Now change <code>n</code> to 100: 1, 100 and 4,950. For n = 1000: 1, 1000 and 499,500. Multiply n by 10 and the three counts multiply by 1, 10 and about 100.' },
        `<p>The three shapes have names, and most of this course is about telling them apart. <code>first</code> takes a <em>constant</em> number of steps: the input could be a billion items and it would still be one. <code>sum</code> takes a number of steps <em>proportional to n</em>: double the input, double the work. <code>pairs</code> takes about <code>n²/2</code> steps, <em>proportional to n²</em>: double the input, four times the work. Here they are side by side, with the other shapes you will meet.</p>`,
        { fig: 'growth', caption: 'Tick the curves on and off and drag the range. Every curve below n² looks flat next to 2ⁿ; next to n², even n log n looks tame. The table underneath turns the counts into time at a billion steps a second: n² is fine for a thousand items and hopeless for a billion.' },
        `<div class="stmt"><p><span class="kind">Definition (order of growth).</span> When the number of steps is at most a constant times <code>f(n)</code> for all large <code>n</code>, we say the algorithm takes <b>O(f(n))</b> steps, read "order f of n". Constants and smaller terms are dropped: <code>3n + 7</code> is O(n), <code>n²/2 + n</code> is O(n²). The O says how the cost <em>grows</em>, not what it is.</p>
<p><span class="kind">The shapes, from cheapest to dearest.</span> O(1) constant · O(log n) logarithmic, halving · O(n) linear · O(n log n) · O(n²) quadratic · O(2ⁿ) exponential. Multiplying <code>n</code> by 10 leaves O(1) alone, adds only about 3.3 steps to O(log n), multiplies O(n) by 10, O(n log n) by a little more than 10, O(n²) by 100, and O(2ⁿ) by more than the number of atoms in the universe.</p></div>
<p>Why drop the constants? Because they are the part the machine decides. A faster computer, a better compiler or a tighter loop divides the time by a constant; it cannot change the shape. A method that is O(n²) on a supercomputer loses to one that is O(n log n) on a phone once <code>n</code> is large enough, and "large enough" comes sooner than people expect.</p>
<h2>Reading the shape off the code</h2>
<p>You rarely need to count exactly. Three rules give the order of growth of most code at a glance.</p>
<div class="stmt"><p><span class="kind">Rule 1.</span> A loop that runs <code>n</code> times, doing constant work each time, is O(n). Two such loops one after the other are still O(n).</p>
<p><span class="kind">Rule 2.</span> A loop <em>inside</em> a loop multiplies: <code>n</code> times <code>n</code> is O(n²). An inner loop that runs <code>i</code> times for <code>i</code> from 1 to <code>n</code> does <code>1 + 2 + … + n = n(n+1)/2</code> steps, which is still O(n²): half of n² is not a different shape.</p>
<p><span class="kind">Rule 3.</span> A loop that halves (or doubles) its variable each time runs about <code>log₂ n</code> times: 20 times for a million, 30 for a billion. That is O(log n), and it is the shape to hope for.</p></div>
<p>Predict how many times a loop that halves <code>n</code> runs when <code>n</code> is a million, and how many doublings it takes to get from 1 up to a million. Then check.</p>`,
        { predict: true, play: `public class Main {
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
}`, caption: 'It prints 19 and 20 (the third line, the exact logarithm, is about 19.93). A million is just under 2²⁰: nineteen halvings bring it down to 1, and twenty doublings pass it. Change n to a billion (1000000000): 29 and 30. Logarithms grow so slowly that for any n you will ever meet, log₂ n is under 64.' },
        `<h2>The array</h2>
<p>The first data structure is the one the machine gives you for free. An <em>array</em> is a row of cells of one type, side by side in memory, with nothing between them. Because the cells are the same size and adjacent, the machine can find any cell by arithmetic: cell <code>i</code> of an array of <code>int</code>s that starts at address <code>b</code> is at <code>b + 4i</code>. No searching, no counting along: one multiplication and one addition, whether <code>i</code> is 3 or 3 million. That single fact is why arrays are everywhere, and it is the thing to remember when every other structure in this course is compared with them.</p>
<p>In Java, <code>int[] a = new int[8];</code> makes eight cells, all 0, and <code>a.length</code> is 8 for ever: an array cannot grow or shrink. <code>a[i]</code> reads or writes cell <code>i</code>, counting from 0, and an <code>i</code> outside <code>0 … length − 1</code> stops the program with <code>ArrayIndexOutOfBoundsException</code>. (In C++, the same arithmetic happens with no check at all; you met the consequences in SC 103.)</p>
<p>So reading or writing a cell is O(1). What about everything else one wants to do with a collection? The figure keeps six values in an array with room for eight. Try getting, inserting and removing at different positions, and watch the count of moves.</p>`,
        { fig: 'arrayops', caption: 'Get costs one step at any index. Insert at index i must first move every later value one cell to the right, from the end backwards so that nothing is overwritten; remove must move every later value left. Try index 0 and the last index: the cost ranges from 0 moves to n.' },
        { check: "An array of a million values. Reading <code>a[700000]</code> costs how much?", skill: 'array-cost', options: ["About 700,000 steps", "One step: the address is arithmetic", "About a million steps"], answer: 1, wrong: ["That would be true if the machine had to count along from the first cell, as it does in a linked list. In an array the cells are the same size and side by side, so it jumps straight to the address.", null, "A million steps would be a scan of the whole array. Indexing never scans, even for the last cell."], why: "The cell's address is start + index × size. No walking, whatever the index." },
        `<div class="stmt"><p><span class="kind">The array's bill.</span> Read or write by index: O(1). Insert or remove at the end: O(1). Insert or remove at the front or in the middle: O(n), because of the shifting. Find a value when you do not know its index: O(n), a scan of every cell (lesson 2 shows how to do far better when the array is sorted). Grow: impossible; see below.</p></div>
<p>Here is the shifting in code. The method takes the array and the number of cells in use, <code>n</code>, which may be smaller than <code>a.length</code>: the usual arrangement is an array with spare room at the end, and a count. Predict what the array holds after the four inserts.</p>`,
        { predict: true, play: `import java.util.Arrays;

public class Main {
    // insert x at index i, moving a[i..n-1] right; returns the new count
    static int insertAt(int[] a, int n, int i, int x) {
        for (int j = n - 1; j >= i; j--) {
            a[j + 1] = a[j];
        }
        a[i] = x; return n + 1;
    }

    public static void main(String[] args) {
        int[] a = new int[8]; int n = 0;
        n = insertAt(a, n, 0, 12);
        n = insertAt(a, n, 1, 7);
        n = insertAt(a, n, 2, 3);
        n = insertAt(a, n, 1, 99);          // in the middle: 7 and 3 move right
        System.out.println(n + " values: " + Arrays.toString(Arrays.copyOf(a, n)));
        System.out.println("the whole array: " + Arrays.toString(a));
    }
}`, caption: 'It prints <code>4 values: [12, 99, 7, 3]</code> and then the whole array with four spare zeros after them. The last insert, at index 1, moved 7 and 3 one cell right to make room for 99. The loop runs from the end backwards so that no value is overwritten before it has been moved. Reverse it (j from i upwards) and run again: the first move overwrites the value that was about to be moved, and every cell after i ends up holding a copy of the same number.' },
        `<h2>A growing array</h2>
<p>An array cannot grow, and yet <code>ArrayList</code> grows every time you call <code>add</code>. The trick is that an <code>ArrayList</code> is an array with spare room, plus a count. When the room runs out it makes a <em>new, bigger</em> array, copies everything across, and forgets the old one. The question is how much bigger. Grow by one cell each time and every append copies everything: appending <code>n</code> items costs <code>1 + 2 + … + n</code>, O(n²). Grow by <em>doubling</em> and something better happens. Append items in the figure and keep an eye on the copies.</p>`,
        { fig: 'dynarray', caption: 'Appends are usually one step. Now and then the array is full, and every value is copied into a new array twice the size. Append thirty or so and compare the two counts: the copies never reach twice the appends.' },
        `<p>Count the copies when the capacity has just reached <code>n</code>: the last doubling copied <code>n/2</code> values, the one before it <code>n/4</code>, and so on: <code>n/2 + n/4 + n/8 + … &lt; n</code>. By then more than <code>n/2</code> values have been appended, so the copies are fewer than twice the appends: under two copies per append on average. Any single append may be expensive, but the expense is paid for by the cheap ones around it. The technical word is <em>amortized</em>: appending to a doubling array is O(1) amortized, and that is why <code>ArrayList.add</code> is safe to call in a loop a million times.</p>`,
        { predict: true, play: `import java.util.Arrays;

public class Main {
    static int copies = 0;
    // append x; the array may have to be replaced, so the (possibly new) array is returned
    static int[] append(int[] a, int n, int x) {
        if (n == a.length) {
            int[] bigger = new int[Math.max(1, 2 * a.length)];
            for (int i = 0; i < n; i++) { bigger[i] = a[i]; copies++; }
            a = bigger;
        }
        a[n] = x;
        return a;
    }
    public static void main(String[] args) {
        int[] a = new int[1];
        int n = 0;
        for (int i = 1; i <= 1000; i++) { a = append(a, n, i); n++; }
        System.out.println(n + " appends, " + copies + " copies, capacity " + a.length);
        System.out.println("first five: " + Arrays.toString(Arrays.copyOf(a, 5)));
    }
}`, caption: 'It prints <code>1000 appends, 1023 copies, capacity 1024</code>, then <code>[1, 2, 3, 4, 5]</code>. The capacity goes 1, 2, 4, … 1024, and the copies are 1 + 2 + 4 + … + 512 = 1023: about one copy per append. Change the growth to a.length + 1 and run again: 499,500 copies.' },
        { check: "A growing array doubles when full. What is the cost of adding n items, in total?", skill: 'dynamic-array', options: ["O(n²), because of the copying", "O(n): the copies add up to less than 2n moves", "O(n log n)"], answer: 1, wrong: ["Each doubling does copy everything, but the doublings come less and less often: the copies are n/2 + n/4 + … and stay under n. It is growing by one cell at a time that costs O(n²).", null, "That would need about log n rounds of copying about n values each. Only the last doubling copies about n/2 values, and the earlier ones are smaller still."], why: "Each doubling copies the array, but the copies sum to n + n/2 + n/4 + … < 2n. Amortised O(1) per add." },
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
        { check: "A doubling experiment shows the step count going ×4 each time n doubles. What is the order of growth?", skill: 'count-steps', options: ["O(n)", "O(n²)", "O(2ⁿ)"], answer: 1, wrong: ["A linear algorithm does twice the work for twice the input: the ratio is 2. A ratio of 4 is not linear.", null, "Exponential growth is far steeper: doubling n squares the count, so the ratio itself keeps growing. A steady ×4 is a fixed power of n."], why: "Doubling n multiplies n² by four. O(n) would double; O(2ⁿ) would square the count." },
        `<details class="reveal"><summary>Puzzle: a program takes 1 second for n = 1,000 and is O(n²). Roughly how long for n = 1,000,000?</summary><p>About a million seconds, eleven and a half days. The input grew by a factor of 1,000, so the work grew by 1,000², a million. If the program were O(n log n) instead, the factor would be about 1,000 × 2 = 2,000: half an hour. That difference is the reason the next lessons exist.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Timing in seconds on one input and calling the result "the speed". Counting two loops in sequence as n² (it is 2n, which is O(n)). Reading <code>n²/2</code> as "better than n²"; the shape is the same. Thinking an array can grow. Shifting in the wrong direction when inserting, so one value overwrites the rest. Forgetting that <code>a.length</code> is the capacity, not the number of values in use. Treating O(log n) as expensive: it is the second-cheapest shape there is.</p>` },
        {
          ex: {
            id: 'ds-1-1', skill: 'array-cost', title: 'Remove at an index',
            prompt: `<p>Write a method</p><pre class="code">static int removeAt(int[] a, int n, int index)</pre><p>for an array of which the first <code>n</code> cells are in use. It removes the value at <code>index</code> by moving every later value one cell to the left, and returns the new count, <code>n − 1</code>. What is left in the cell beyond the new end does not matter. You may assume <code>0 ≤ index &lt; n</code>. Write only the method.</p>`,
            prelude: 'import java.util.Arrays;',
            starter: `static int removeAt(int[] a, int n, int index) {\n    // move a[index + 1 .. n - 1] one cell to the left\n    return n;\n}`,
            solution: `static int removeAt(int[] a, int n, int index) {\n    for (int j = index; j < n - 1; j++) {\n        a[j] = a[j + 1];\n    }\n    return n - 1;\n}`,
            hints: ['A loop over j from index up to n - 2, copying a[j + 1] into a[j]. Going upwards is right here: each cell is overwritten only after its value has been copied left.', 'Return n - 1. The checker prints the first n - 1 cells, so the old last value may stay where it is.'],
            followup: 'Write insertAt, the opposite of removeAt, so that removeAt(insertAt(...)) gives back the array you started with. Then say which of the two does fewer moves when the index is 0, and when the index is the last cell.',
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
            id: 'ds-1-2', skill: 'count-steps', kind: 'answer', title: 'How many steps?',
            prompt: `<p>For each piece of code, give the exact number of times the innermost line (<code>steps++</code>) runs when <code>n</code> is 100. Then name the order of growth in your head; the checker asks only for the number.</p>`,
            parts: [
              { label: '(a) <code>for (int i = 0; i &lt; n; i++) for (int j = 0; j &lt; n; j++) steps++;</code>', answer: '10000', width: '7rem', wrong: [{ match: '100', msg: 'That is one loop. The inner loop runs n times for each of the n outer passes.' }, { match: '200', msg: 'Two loops one after the other would give 2n. These are nested: multiply, not add.' }] },
              { label: '(b) <code>for (int i = 0; i &lt; n; i++) for (int j = 0; j &lt; i; j++) steps++;</code>', answer: '4950', width: '7rem', wrong: [{ match: '10000', msg: 'The inner loop runs i times, not n: 0 + 1 + 2 + … + 99.' }, { match: '5050', msg: 'Close: that is 1 + 2 + … + 100. The inner loop runs i times for i from 0 to 99, so the sum ends at 99.' }] },
              { label: '(c) <code>for (int k = n; k &gt; 1; k = k / 2) steps++;</code>', answer: '6', width: '7rem', wrong: [{ match: '7', msg: 'Trace it: k is 100, 50, 25, 12, 6, 3, then 1, and the loop stops when k is 1. Count the values that were greater than 1.' }, { match: ['50', '100'], msg: 'The variable is halved each time, not decreased by one. Write out the values of k.' }] },
              { label: '(d) <code>for (int i = 0; i &lt; n; i++) for (int j = 0; j &lt; 10; j++) steps++;</code>', answer: '1000', width: '7rem', wrong: [{ match: '10000', msg: 'The inner loop runs 10 times, whatever n is: n × 10, and the shape is O(n), not O(n²).' }] }
            ],
            hints: ['(a) n × n. (b) the inner loop runs 0 times, then 1, then 2, … up to n − 1 times: add them. (c) write out the values k takes. (d) the inner loop does not depend on n.', 'For (b), the sum 0 + 1 + … + (n − 1) is (n − 1) × n / 2. For (c), count how many values of k are greater than 1 before the loop stops.'],
            solution: `<p>(a) 100 × 100 = <b>10,000</b>: O(n²). (b) 0 + 1 + … + 99 = 99 × 100 / 2 = <b>4,950</b>: still O(n²), half of it. (c) k takes the values 100, 50, 25, 12, 6, 3 before reaching 1: <b>6</b>, about log₂ 100: O(log n). (d) 100 × 10 = <b>1,000</b>: the inner loop is a constant, so this is O(n).</p>`,
            followup: 'Part (d) is the one people get wrong under pressure: a nested loop is not automatically n². Ask what each loop depends on.'
          }
        },
        {
          ex: {
            id: 'ds-1-3', skill: 'dynamic-array', title: 'A growing array',
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
            followup: 'Add a static counter that counts every value copied, run 1000 appends from capacity 1, and check that it is under 2000. Then change the growth to a.length + 1 and compare.',
            failTip: 'If the third append fails, the growth is not happening or the copy is incomplete; if the capacity-0 test fails, 2 × 0 is 0: use Math.max(1, 2 * a.length).'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>The answer to the opening question: count steps as a function of <code>n</code>, not seconds on one input, and read the shape off the code before you run it. Constants and smaller terms are dropped: the <em>order of growth</em>, O(f(n)), says how the cost scales.</li>
<li>The shapes: O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ). Read them off the code: a loop is n, a nested loop multiplies, halving is log n.</li>
<li>An array is cells side by side; cell i is at <code>base + 4i</code>, so indexing is O(1). Inserting or removing in the middle shifts everything after it: O(n). Finding a value by scanning: O(n). An array cannot grow.</li>
<li>A growing array doubles when full; the copies total less than twice the appends, so an append is O(1) amortized. That is <code>ArrayList</code>.</li>
<li>The doubling experiment: run on n and 2n and look at the ratio of costs. 2 means linear, 4 quadratic, about 1 logarithmic.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-10', '3B-AP-11'],
      standard: 1, title: 'Searching', summary: 'Linear search and its cost; binary search, why it works and why it is so fast; the overflow bug that hid in it for twenty years; and the variants that find a boundary rather than a value.',
      blocks: [
        `<p>In 2006 Joshua Bloch, who had written much of Java's standard library, published a short article with the title "Nearly All Binary Searches and Mergesorts are Broken". The binary search in Jon Bentley's <em>Programming Pearls</em>, a book that Bloch had learned from, had been proved correct in the text, tested, and reprinted for twenty years. It had a bug. So did the binary search Bloch himself had written for Java's <code>java.util.Arrays</code>, where it had lain for nine years before someone's program broke on it. The bug was a single line, the one that finds the middle of a range: <code>int mid = (low + high) / 2;</code>. For a range inside an array of more than about a billion elements, <code>low + high</code> is larger than an <code>int</code> can hold, wraps round to a negative number, and the search looks at a cell that does not exist.</p>`,
        `<p>Nobody had noticed because nobody had searched an array of a billion elements, and then, around 2006, people did. The algorithm was right; the arithmetic was not; and the lesson, which you will see at the end of this lesson, is that the cheapest-looking line of a correct algorithm still has to be checked against the machine it runs on. But first, the question that makes the bug possible at all: how can a method find one value among a billion in about thirty steps? The answer is one of the oldest and best ideas in the subject.</p>
<h2>Linear search</h2>
<p>To find a value in an array when you know nothing about the order of its contents, there is only one method: look at each cell in turn until you find it or run out. This is <em>linear search</em>, and it is O(n): a miss costs <code>n</code> comparisons, a hit costs <code>n/2</code> on average, and nothing can be done about it, because any cell you skip might have been the one.</p>`,
        { predict: true, play: `public class Main {
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
}`, caption: 'It prints index 0 after 1 comparison, index 5 after 6, index 9 after 10, and, for 99, index -1 after 10. A hit costs as many comparisons as its index plus one; a miss has to look at every cell. Returning from inside the loop is what makes a hit cheaper than a miss. Move 99 into the array and watch its cost change.' },
        `<h2>Binary search</h2>
<p>Now suppose the array is <em>sorted</em>. One comparison then tells you more than whether you have found the value: compare the target with the middle cell, and you know which half it must be in. The other half can be thrown away without looking at it. Repeat on the half that remains. Every comparison halves the range, so a range of a million cells is down to one after twenty comparisons: 20 instead of 1,000,000. This is <em>binary search</em>, and you have used it every time you looked up a word in a dictionary by opening it somewhere in the middle.</p>`,
        { fig: 'search', items: [2, 5, 8, 12, 16, 23, 38, 42, 56, 61, 72, 79, 85, 91, 97, 104], caption: 'Sixteen sorted values. Type a target and step: lo and hi mark the range that can still hold it, mid is the cell compared. Try 2, 104 and 50 (which is absent). No search takes more than 5 comparisons, because 2⁴ ≤ 16 < 2⁵.' },
        `<p>Before you run the code, predict how many comparisons a search among a million values will need, at most. The code keeps two indexes, <code>lo</code> and <code>hi</code>, with the promise that <em>if the target is in the array at all, it is in cells <code>lo</code> to <code>hi</code> inclusive</em>. Each pass compares the target with the middle cell and moves <code>lo</code> or <code>hi</code> so that the promise still holds while the range shrinks. When <code>lo</code> passes <code>hi</code>, the range is empty and the promise says the target is not there.</p>`,
        { predict: true, play: `public class Main {
    static int comparisons;

    static int binarySearch(int[] a, int target) {
        int lo = 0, hi = a.length - 1;
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
            System.out.println(target + ": index " + binarySearch(a, target) + " after " + comparisons + " comparisons");
        }
    }
}`, caption: 'It prints 19, 20, 19 and 20 comparisons for the four targets. A million values, never more than 20 comparisons: each one halves the range, and 2²⁰ is just over a million. 1500001 is not a multiple of 3, so it is absent and the search ends with -1, still after 20. Linear search would have made up to a million. Change n to 2000000: only one more comparison.' },
        { check: "Binary search on 1,000,000 sorted values needs at most about how many comparisons?", skill: 'binary-search', options: ["About 20", "About 1,000", "About 500,000"], answer: 0, wrong: [null, "A thousand is what you get by dividing the range by 1,000 once. Binary search halves the range at every comparison, so it shrinks far faster than that: twenty halvings reach one cell.", "Half a million is the average cost of a linear search on a million values. Binary search throws away half of what is left each time, not one cell."], why: "Each comparison halves the range; a million halves to one in 20 steps, since 2²⁰ ≈ 1,048,576." },
        `<div class="stmt"><p><span class="kind">Why it works (the invariant).</span> Before every pass: <em>if target is in a, then it is in a[lo..hi]</em>. True at the start, when the range is the whole array. If <code>a[mid] &lt; target</code>, every cell up to <code>mid</code> is smaller than the target too, because the array is sorted, so the target can only be in <code>mid + 1 … hi</code>; setting <code>lo = mid + 1</code> keeps the promise. The other case is the mirror. A statement that is true before the loop and kept true by every pass is called a <em>loop invariant</em>, and it is how you convince yourself, or a reader, that a loop is right.</p>
<p><span class="kind">Why it stops.</span> <code>mid</code> is always inside <code>lo … hi</code>, so <code>lo = mid + 1</code> and <code>hi = mid − 1</code> each shrink the range by at least one cell. A range that shrinks every pass must become empty.</p>
<p><span class="kind">Why it is fast.</span> The range starts at <code>n</code> and is at most halved each pass, so after <code>k</code> passes it holds at most <code>n / 2ᵏ</code> cells. It is empty once <code>2ᵏ &gt; n</code>, that is, after about <code>log₂ n</code> passes: O(log n).</p></div>
<p>The requirement is that the array is sorted. Binary search on an unsorted array does not fail loudly; it quietly returns −1 for values that are present, or the wrong index. Keeping an array sorted costs something at every insert (lesson 1: a shift), and that is a trade this course will return to: pay at insertion to make every search cheap, or insert cheaply and search slowly.</p>
<h2>The bug</h2>
<p>Here is the line Bloch found. For a range inside an ordinary array it is harmless. Make the array big enough and it breaks. Predict what <code>lo + hi</code> will print.</p>`,
        { predict: true, play: `public class Main {
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
}`, caption: 'It prints <code>lo + hi = -794967296</code>, then <code>(lo + hi) / 2 = -397483648</code>, then 1750000000 twice. lo + hi is 3.5 billion, above the int limit of about 2.1 billion, so it wraps to a negative number and mid is negative: a[mid] would throw. Both fixes give the right middle, 1,750,000,000. Java’s Arrays.binarySearch has used >>> 1 since 2006. Change lo and hi to 1000 and 2000: now all three lines agree.' },
        { check: "Why did <code>(lo + hi) / 2</code> hide a bug for twenty years?", skill: 'midpoint-overflow', options: ["It rounds the wrong way", "lo + hi can overflow an int when the array is huge, giving a negative middle", "It is slower than subtraction"], answer: 1, wrong: ["Rounding down is harmless here: mid only has to lie inside lo … hi, and it does. The trouble comes earlier, in the sum, before the division.", null, "Speed was never the problem: an addition is as fast as a subtraction. The sum can be larger than an int can hold, and then it wraps to a negative number."], why: "For arrays over a billion elements the sum exceeds the largest int, wraps negative, and the index is garbage. lo + (hi − lo) / 2 cannot overflow." },
        `<div class="stmt"><p><span class="kind">Rule.</span> Write the middle as <code>lo + (hi − lo) / 2</code>. It costs nothing, it is right for every array Java can make, and it marks you as someone who has read Bloch's article.</p></div>
<h2>Finding a boundary instead of a value</h2>
<p>Binary search is more than a way to find a value. The same halving finds the <em>boundary</em> in any array that is false up to some point and true from there on. Where does 3 first appear in a sorted array that has several 3s? Where would 4 go if we inserted it? What is the largest whole number whose square is at most 10¹²? Each of these is "find the first index where a condition becomes true", and each takes O(log n).</p>
<p>The version below finds the first index whose value is at least <code>x</code>, the <em>lower bound</em>; if every value is smaller, it returns <code>n</code>. The invariant is different, and worth reading: every cell before <code>lo</code> is less than <code>x</code>, every cell from <code>hi</code> on is at least <code>x</code>, and the answer is somewhere in <code>lo … hi</code>.</p>`,
        { predict: true, play: `public class Main {
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
    }
}`, caption: 'It prints 1, 3 threes, then insertion points 4, 0 and 8. Two lower bounds count the threes in O(log n): the lower bound of 4 is where the 3s end. A value larger than everything goes at index 8, the length, and a value smaller than everything at 0.' },
        `<p>The same idea works on a question rather than an array: the largest whole number <code>k</code> with <code>k * k &lt;= 10¹²</code>. The condition is true up to a point and false after it, which is all binary search needs.</p>`,
        { play: `public class Main {
    public static void main(String[] args) {
        long lo = 0, hi = 2000000;
        while (lo < hi) {
            long mid = lo + (hi - lo + 1) / 2;
            if (mid * mid <= 1000000000000L) lo = mid; else hi = mid - 1;
        }
        System.out.println("largest k with k*k <= 10^12: " + lo);
    }
}`, caption: 'The loop searches a range of numbers rather than an array. It prints 1000000, the square root of 10¹², after about 21 halvings of a range of two million. Change the limit and the upper bound to find a square root of your own.' },
        { check: "Binary search is run on an array that is not sorted. What happens?", skill: 'binary-search', options: ["It finds the value, slowly", "It may return \"not found\" for a value that is there, with no error", "Java throws an exception"], answer: 1, wrong: ["Binary search never goes back to look at the half it threw away, so a wrong guess is final. It is not slow, it is wrong.", null, "Nothing in the algorithm checks the order: it compares values and moves lo and hi, always inside the array. No exception happens; it just gives a wrong answer quietly."], why: "The algorithm relies on the invariant \"if present, the target is between lo and hi\". Unsorted data breaks it silently." },
        `<p>Java's own <code>Arrays.binarySearch(a, x)</code> returns the index when <code>x</code> is present and otherwise <code>−(insertion point) − 1</code>, a negative number that encodes where <code>x</code> would go. The encoding looks odd until you see that it lets one call answer both questions.</p>
<div class="stmt"><p><span class="kind">Cost comparison.</span> For a million sorted values, a search costs at most 20 comparisons instead of a million: fifty thousand times fewer. For a billion, 30 instead of a billion. A sorted array with binary search is the first structure in this course that makes "find" cheap, and the price is that the array must be sorted, which is the subject of the next lesson.</p></div>`,
        `<details class="reveal"><summary>Puzzle: the loop condition in the first version is <code>lo &lt;= hi</code> and in <code>lowerBound</code> it is <code>lo &lt; hi</code>. Why the difference?</summary><p>In the first version the range <code>lo … hi</code> is inclusive at both ends and a range of one cell (<code>lo == hi</code>) still has to be examined, so the loop runs while <code>lo ≤ hi</code>. In <code>lowerBound</code>, <code>hi</code> is one past the end of the range, and a range of one cell is already the answer: when <code>lo == hi</code> there is nothing left to decide. Both are right for their own invariant; copying the condition from one into the other is the commonest way to break a binary search. Decide what <code>hi</code> means first, then write the condition.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Binary search on an array that is not sorted. <code>lo = mid</code> instead of <code>mid + 1</code>, which can loop for ever when the range is two cells. Mixing an inclusive <code>hi</code> with the <code>lo &lt; hi</code> condition, which skips the last cell. <code>(lo + hi) / 2</code>. Returning <code>mid</code> after the loop instead of −1. Testing only on values that are present: the misses, the first cell and the last cell are where the bugs are.</p>` },
        {
          ex: {
            id: 'ds-2-4', kind: 'trace', skill: 'binary-search', title: 'Trace the search',
            prompt: `<p>Binary search for a value that is <em>not</em> in the array. Fill in the table: each row is the moment just after line 8 has run, in one pass of the loop, with the values of <code>lo</code>, <code>hi</code> and <code>mid</code> then. The last row is after line 18; <code>mid</code> was declared inside the loop, so write <code>-</code> for it there. The first row is done for you.</p>`,
            code: `public class Main {\n    public static void main(String[] args) {\n        int[] a = {2, 5, 8, 12, 16, 23, 38, 56};\n        int target = 9;\n        int lo = 0;\n        int hi = a.length - 1;\n        while (lo <= hi) {\n            int mid = lo + (hi - lo) / 2;\n            if (a[mid] == target) {\n                System.out.println("found at " + mid);\n                return;\n            } else if (a[mid] < target) {\n                lo = mid + 1;\n            } else {\n                hi = mid - 1;\n            }\n        }\n        System.out.println("not found");\n    }\n}`,
            vars: ['lo', 'hi', 'mid'],
            steps: [
              { line: 8, values: { lo: '0', hi: '7', mid: '3' }, show: true },
              { line: 8, values: { lo: '0', hi: '2', mid: '1' }, why: { lo: { '4': 'a[3] is 12, which is larger than 9, so 9 can only be on the left: hi moves, to mid - 1 = 2. lo stays at 0.' }, hi: { '7': 'In the first pass a[3] = 12 is larger than 9, so hi became mid - 1 = 2.' } } },
              { line: 8, values: { lo: '2', hi: '2', mid: '2' }, why: { lo: { '1': 'In the second pass a[1] = 5 is smaller than 9, so lo became mid + 1 = 2, not mid.' } } },
              { line: 18, values: { lo: '3', hi: '2', mid: '-' }, why: { lo: { '2': 'In the third pass a[2] = 8 is smaller than 9, so lo became mid + 1 = 3. Now lo is past hi, and the loop stops.' }, mid: { '2': 'mid was declared inside the while loop, so after the loop there is no mid at all.' } } }
            ],
            hints: ['mid is the middle of lo and hi, rounded down: lo + (hi - lo) / 2. Then compare a[mid] with 9: smaller means lo = mid + 1, larger means hi = mid - 1.', 'The three rows are (0, 7, 3), (0, 2, 1) and (2, 2, 2). In the third pass a[2] = 8 is smaller than 9, so lo becomes 3, one past hi: nothing is left to look at, and the loop ends.'],
            solution: '<p>lo: 0, 0, 2, 3. hi: 7, 2, 2, 2. mid: 3, 1, 2, then none. Three probes, and the search area shrinks from eight cells to three, to one, to none. The program prints <code>not found</code>.</p>',
            followup: 'Change target to 38 and trace it again before running. Which line ends the program this time, and how many probes did it take? Then say how many probes the worst case needs for 8 cells.'
          }
        },
        {
          ex: {
            id: 'ds-2-1', skill: 'binary-search', title: 'Binary search',
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
            followup: 'Add a static counter of comparisons and check that a million cells never need more than 20. Then make the method return -(insertion point) - 1 for a miss, as Java’s Arrays.binarySearch does.',
            failTip: 'If the one-cell or last-cell tests fail, check the loop condition (<=) and the two updates (mid + 1 and mid - 1). If the absent values loop for ever, one of the updates is lo = mid or hi = mid.'
          }
        },
        {
          ex: {
            id: 'ds-2-2', skill: 'binary-search', title: 'Lower bound',
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
            followup: 'Use lowerBound twice to count how many times x occurs in a sorted array: lowerBound(a, x + 1) - lowerBound(a, x). Test it on an array with many repeats, and on a value that is absent.',
            failTip: 'If the all-equal test gives 3 instead of 0, the "else" branch is hi = mid - 1; it must keep mid, because mid may be the first cell that is at least x.'
          }
        },
        {
          ex: {
            id: 'ds-2-3', skill: 'binary-search', kind: 'answer', title: 'How many comparisons?',
            prompt: `<p>Binary search halves the range at every comparison, so the most comparisons it can need on <code>n</code> cells is the smallest <code>k</code> with <code>2ᵏ ≥ n</code>, plus one for the final check. For each question give the smallest <code>k</code> with <code>2ᵏ ≥ n</code>.</p>`,
            parts: [
              { label: '(a) n = 1,024', answer: '10', width: '6rem', wrong: [{ match: '11', msg: '2¹⁰ = 1,024 exactly, so k = 10 already satisfies 2ᵏ ≥ n.' }, { match: '512', msg: 'The question asks for the number of halvings, not the size of the half.' }] },
              { label: '(b) n = 1,000,000', answer: '20', width: '6rem', wrong: [{ match: '19', msg: '2¹⁹ = 524,288, which is less than a million. One more.' }, { match: '21', msg: '2²⁰ = 1,048,576 ≥ 1,000,000 already.' }] },
              { label: '(c) n = 8,000,000,000 (the people on Earth)', answer: '33', width: '6rem', wrong: [{ match: '32', msg: '2³² ≈ 4.3 billion, less than 8 billion. One more.' }, { match: '30', msg: '2³⁰ ≈ 1.07 billion. Keep doubling.' }] },
              { label: '(d) Linear search on the same 8,000,000,000: the most comparisons it can need', answer: '8000000000', width: '9rem', wrong: [{ match: '33', msg: 'That is binary search. A linear search that misses looks at every cell.' }] }
            ],
            hints: ['2¹⁰ = 1,024. 2²⁰ is about a million. 2³⁰ is about a billion, and each further doubling is one more.', 'Write out 1, 2, 4, 8, … and stop at the first power of two that is at least n. For (d), a miss in a linear search has to look at every cell.'],
            solution: `<p>(a) <b>10</b>, since 2¹⁰ = 1,024. (b) <b>20</b>: 2¹⁹ = 524,288 is too small, 2²⁰ = 1,048,576 is enough. (c) <b>33</b>: 2³² ≈ 4.29 billion is too small, 2³³ ≈ 8.59 billion is enough. (d) <b>8,000,000,000</b>: a miss looks at every cell.</p>`,
            followup: 'Thirty-three comparisons to find one person among everyone alive, against eight billion. Logarithms are the reason large things are searchable at all.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>Linear search looks at every cell: O(n), and nothing better is possible when the order is unknown.</li>
<li>Binary search on a sorted array halves the range at each comparison: O(log n), 20 comparisons for a million cells, 30 for a billion. It needs the array sorted. That answers the opening question: one value among a billion in about thirty steps.</li>
<li>A loop invariant (<em>if the target is present, it is in lo…hi</em>) is how you know a loop is right; a shrinking range is how you know it stops.</li>
<li>Write the middle as <code>lo + (hi − lo) / 2</code>: <code>(lo + hi) / 2</code> overflows for large arrays and hid in textbooks and the JDK for years.</li>
<li>The same halving finds a boundary: the first cell at least <code>x</code> (lower bound), an insertion point, the largest number with a property. Decide what <code>hi</code> means before writing the loop condition.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-10', '3B-AP-11'],
      standard: 1, title: 'Sorting, the slow way first', summary: 'Why so much computing is sorting; selection sort and insertion sort with their invariants and their counts; best and worst cases; stability; and the doubling experiment that shows what quadratic means.',
      blocks: [
        `<p>In the third volume of <em>The Art of Computer Programming</em>, published in 1973, Donald Knuth reported an estimate from the computer manufacturers of the 1960s: more than a quarter of all the running time on their customers' machines was spent sorting. The machines were mostly doing business: payroll, inventory, billing, and every one of those jobs began by putting records in order, by account number, by date, by name, so that matching ones could be found next to each other. The data arrived on punched cards and magnetic tape, and the sorting algorithms of the time were written to work with a few hundred cards in memory and the rest waiting on a tape drive.</p>`,
        { photo: 'ibm-card-sorter', caption: 'An IBM Type 83 card sorter from 1955, in a museum. A metal brush felt for the hole in one column of each card, and the card dropped into one of 13 pockets: about 1,000 cards a minute. The stacks in the rack above are cards sorted by one column. Sorting a whole number took one pass per digit.' },
        `<p>A quarter of all computing is no longer sorting, but sorting is still underneath more of it than anything else: every search index, every database, every spreadsheet column you click to order, and, from the last lesson, every binary search. The subject has two halves. This lesson is the first: the simple sorts, which are O(n²), and which you should know not because you will use them on large inputs but because they are where the ideas of invariant, cost and best-and-worst case become concrete. The next lesson is the second half, the O(n log n) sorts that the world actually runs. First, the question this lesson answers: what do the simple ways of putting n things in order cost, and how much does that depend on the order the things start in?</p>
<h2>The problem, stated precisely</h2>
<div class="stmt"><p><span class="kind">Sorting.</span> Given an array of <code>n</code> values that can be compared, rearrange it so that <code>a[0] ≤ a[1] ≤ … ≤ a[n−1]</code>. The result must contain exactly the values that were there, no more and no fewer.</p>
<p><span class="kind">Cost.</span> We count <em>comparisons</em> (how many times two values are compared) and <em>moves</em> (how many times a value is written into a cell). A swap is three moves.</p>
<p><span class="kind">Stability.</span> A sort is <em>stable</em> if values that compare equal keep the order they had. Sorting students by grade with a stable sort keeps the names alphabetical within each grade, if they were alphabetical before.</p></div>
<h2>Selection sort</h2>
<p>The method you would use on a hand of cards if you were being careful: find the smallest value and put it first; then find the smallest of the rest and put it second; and so on. After <code>i</code> rounds, the first <code>i</code> cells hold the <code>i</code> smallest values, in order, and will never move again. That sentence is the invariant.</p>`,
        { fig: 'sortlab', algo: 'selection', caption: 'Twelve values, with the comparisons and moves counted at every step. Try the four input shapes: selection sort makes exactly the same number of comparisons on all of them, and never more than n − 1 swaps.' },
        { check: "Selection sort on 100 values makes how many comparisons?", skill: 'selection-sort', options: ["99", "4,950", "10,000"], answer: 1, wrong: ["99 is what the first round alone makes. There are 99 rounds, and each looks at fewer values than the last, so the counts add up: 99 + 98 + … + 1.", null, "10,000 is 100 × 100, which counts every pair twice and each value against itself. The inner loop only looks to the right of i, so the total is half of that, nearly."], why: "99 + 98 + … + 1 = 100 × 99 / 2, on every input: it cannot notice sorted data." },
        `<p>Predict the number of comparisons selection sort makes for 10, 100 and 1,000 values, and whether the input's order changes it.</p>`,
        { predict: true, play: `import java.util.Arrays;
public class Main {
    static int comparisons, moves;
    static void selectionSort(int[] a) {
        for (int i = 0; i < a.length - 1; i++) {
            int smallest = i;
            for (int j = i + 1; j < a.length; j++) { comparisons++; if (a[j] < a[smallest]) smallest = j; }
            if (smallest != i) {
                int t = a[i]; a[i] = a[smallest]; a[smallest] = t; moves += 3;
            }
        }
    }
    public static void main(String[] args) {
        int[] a = {7, 3, 9, 1, 6, 8, 2, 5, 4};
        selectionSort(a);
        System.out.println(Arrays.toString(a) + "   comparisons " + comparisons + ", moves " + moves);
        for (int n : new int[] {10, 100, 1000}) {
            int[] b = new int[n]; for (int i = 0; i < n; i++) b[i] = (i * 7919) % 1000;
            comparisons = 0; moves = 0; selectionSort(b);
            System.out.println("n = " + n + ": comparisons " + comparisons + ", moves " + moves);
        }
    }
}`, caption: 'It prints 36 comparisons for the nine values (9 × 8 / 2), then 45, 4,950 and 499,500 for n = 10, 100 and 1000: n(n−1)/2 every time, whatever the input, because the inner loop always runs to the end. The moves stay below 3n (12, 216 and 2,841). Change the data to already sorted values, <code>b[i] = i</code>: the comparisons do not change at all, and the moves fall to 0.' },
        `<div class="stmt"><p><span class="kind">Selection sort's bill.</span> Comparisons: exactly <code>n(n−1)/2</code>, O(n²), on every input. Moves: at most <code>3(n−1)</code>, O(n). Not stable (a swap can carry a value past an equal one). Its one virtue is the small number of moves, which matters when moving a value is expensive and comparing is cheap.</p></div>
<h2>Insertion sort</h2>
<p>The method you actually use with a hand of cards: take the next card and slide it left into the cards you already hold, which are in order, until it is in its place. After <code>i</code> rounds the first <code>i</code> cells are sorted, but unlike selection sort they are not final: a later value may be inserted among them.</p>`,
        { fig: 'sortlab', algo: 'insertion', caption: 'The same twelve values. Now change the input shape: on an already sorted input insertion sort makes one comparison per value and stops; on a reversed input every value slides all the way to the front. The algorithm adapts to its input, and selection sort did not.' },
        { predict: true, play: `import java.util.Arrays;
public class Main {
    static int comparisons, moves;
    static void insertionSort(int[] a) {
        for (int i = 1; i < a.length; i++) {
            int value = a[i];
            int j = i;
            while (j > 0) {
                comparisons++;
                if (a[j - 1] <= value) break;      // found the place
                a[j] = a[j - 1]; moves++; j--;     // shift the larger value right
            }
            a[j] = value; moves++;
        }
    }
    public static void main(String[] args) {
        for (String kind : new String[] {"sorted", "random", "reversed"}) {
            int[] b = new int[1000];
            for (int i = 0; i < 1000; i++) b[i] = kind.equals("sorted") ? i : kind.equals("reversed") ? 1000 - i : (i * 7919) % 1000;
            comparisons = 0; moves = 0; insertionSort(b);
            System.out.printf("n = 1000, %-9s comparisons %7d, moves %7d%n", kind + ":", comparisons, moves);
        }
    }
}`, caption: 'It prints 999 comparisons for sorted input (one per value, O(n)), 251,100 for random input and 499,500 for reversed, the full n(n−1)/2. The moves are 999, 251,100 and 500,499. Random costs about half of the worst case. Insertion sort is the fastest simple sort for input that is already nearly in order, which real data often is.' },
        { check: "Which sort is the right choice for a list that is already nearly sorted?", skill: 'insertion-sort', options: ["Selection sort", "Insertion sort: it makes about n comparisons on sorted input", "They cost the same"], answer: 1, wrong: ["Selection sort's inner loop always runs to the end, because the smallest value could be anywhere. It cannot notice that the data is nearly sorted, so it costs n(n−1)/2 regardless.", null, "They cost the same only in the worst case. On nearly sorted input insertion sort stops each slide after one or two comparisons, and selection sort still does the full count."], why: "Insertion sort stops each slide at the first smaller neighbour, so nearly sorted input costs about n. Selection sort always costs n(n−1)/2." },
        `<div class="stmt"><p><span class="kind">Insertion sort's bill.</span> Comparisons and moves: between <code>n − 1</code> (already sorted) and <code>n(n−1)/2</code> (reversed), about <code>n²/4</code> on random input: O(n) best case, O(n²) worst and average. Stable, because a value stops sliding as soon as it meets one that is not larger. The sort of choice for small arrays (Java's own sort switches to it below about 50 elements) and for nearly sorted ones.</p></div>
<p>Notice the difference in <em>what the loops know</em>. Selection sort's inner loop must run to the end, because the smallest value could be anywhere. Insertion sort's inner loop can stop as soon as it finds a smaller value, because everything to its left is already sorted. The invariant is not only how you prove the sort correct; it is where the saving comes from.</p>
<h2>What quadratic feels like</h2>
<p>Both sorts are O(n²), and the figure's doubling experiment will show you what that means in time. Press the button at the bottom of either figure: it sorts random arrays of 1,000, 2,000, 4,000 and 8,000 values and reports the comparisons and the time. The ratio from one row to the next is 4. Then do the sum: at 8,000 values the sort takes some milliseconds. At 8,000,000 values, a thousand times more, it would take a million times longer: hours. A library sort does 8,000,000 values in a few seconds.</p>
<p>And bubble sort? It compares neighbours and swaps them when out of order, pass after pass. It is O(n²) like the others, makes more moves than either, and has no case where it is the best choice. It appears in the figure so that you recognise it; it is the one sort every textbook teaches and no program uses.</p>
<h2>Sorting other things</h2>
<p>The two sorts compare values with <code>&lt;</code> and <code>&gt;</code>. Replace those with any comparison you like and they sort anything by any rule. Strings by their <code>compareTo</code>; words by length; students by grade. When the rule has ties (many words have four letters) stability decides what happens to them, and insertion sort, being stable, keeps their original order.</p>`,
        { predict: true, play: `import java.util.Arrays;

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
}`, caption: 'It prints <code>[fig, pear, kiwi, date, apple, banana]</code> and then the names in dictionary order. pear, kiwi and date all have four letters and come out in the order they went in. Change > to >= in the while condition and run again: the sort is no longer stable, and the four-letter words reverse.' },
        { check: "A sort is <em>stable</em> when…", skill: 'sort-stability', options: ["it never crashes", "values that compare equal keep the order they had", "it uses no extra memory"], answer: 1, wrong: ["Not crashing is just correctness. Stability is a separate property, about equal values: do they keep the order they had?", null, "Memory use is a different property (sorting “in place”). A stable sort may use extra memory or not; stability is only about the order of equal values."], why: "Stability matters when sorting records by one key after another: students sorted by grade keep their alphabetical order within each grade." },
        `<details class="reveal"><summary>Puzzle: an array of n values has exactly one value out of place (it belongs k cells to the left). How many comparisons does insertion sort make? And selection sort?</summary><p>Insertion sort: about <code>n + k</code>. Every value but one stops after one comparison, and the misplaced one slides <code>k</code> cells. Selection sort: <code>n(n−1)/2</code>, as always; it has no way of noticing that the array is nearly sorted. For a million values with one out of place, that is a million comparisons against five hundred billion.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> In insertion sort, shifting with a swap at each step (three moves instead of one) or forgetting to write the value into its final cell. A <code>while</code> condition that reads <code>a[j − 1]</code> when <code>j</code> is 0. Using <code>&gt;=</code> where <code>&gt;</code> was meant, which breaks stability. In selection sort, swapping inside the inner loop instead of after it. Calling a sort O(n²) "slow": for a hundred values it is instant, and for a thousand it is fine; it is the growth that is the problem.</p>` },
        {
          ex: {
            id: 'ds-3-4', kind: 'trace', skill: 'insertion-sort', title: 'Trace insertion sort',
            prompt: `<p>Insertion sort takes each value in turn and slides it left into place. Fill in the table: each row is the moment just after line 11 has run, which drops <code>key</code> into its place, with the values of <code>i</code>, <code>key</code> and <code>j</code> then. The last row is after line 13, when the loop is over, so write <code>-</code> for variables that no longer exist. The first row is done for you.</p>`,
            code: `public class Main {\n    public static void main(String[] args) {\n        int[] a = {4, 7, 2, 5};\n        for (int i = 1; i < a.length; i++) {\n            int key = a[i];\n            int j = i - 1;\n            while (j >= 0 && a[j] > key) {\n                a[j + 1] = a[j];\n                j--;\n            }\n            a[j + 1] = key;\n        }\n        System.out.println(a[0] + " " + a[1] + " " + a[2] + " " + a[3]);\n    }\n}`,
            vars: ['i', 'key', 'j'],
            steps: [
              { line: 11, values: { i: '1', key: '7', j: '0' }, show: true },
              { line: 11, values: { i: '2', key: '2', j: '-1' }, why: { j: { '0': 'Both 7 and 4 are larger than 2, so both slid one cell right and j went down twice, from 1 to -1. The 2 goes into cell j + 1 = 0.', '1': 'The 7 slid right, but 4 is larger than 2 as well, so j went down once more.' } } },
              { line: 11, values: { i: '3', key: '5', j: '1' }, why: { j: { '2': 'The 7 is larger than 5, so it slid one cell right and j went down to 1. The 4 is not larger than 5, so the sliding stopped.', '-1': 'The sliding stops at the 4, which is smaller than 5: j does not go all the way to the left.' } } },
              { line: 13, values: { i: '-', key: '-', j: '-' }, why: { i: { '4': 'i was declared in the for header, so after the loop there is no i.' }, j: { '1': 'j was declared inside the loop, so after the loop there is no j.' } } }
            ],
            hints: ['For each i, key is a[i] and j starts at i - 1. While a[j] is larger than key, that value slides one cell right and j goes down. Line 11 puts key into cell j + 1.', 'The array goes {4, 7, 2, 5}, then {4, 7, 7, 5} while the 2 slides, then {2, 4, 7, 5}, and so on. The rows are (1, 7, 0), (2, 2, -1) and (3, 5, 1).'],
            solution: '<p>i: 1, 2, 3, then none. key: 7, 2, 5, then none. j: 0, -1, 1, then none. The 7 stays where it is; the 2 slides past two values; the 5 slides past one. The program prints <code>2 4 5 7</code>.</p>',
            followup: 'Make a = {1, 2, 3, 4} and trace it before running: what is j in every row, and how many times does line 8 run? Compare with {4, 3, 2, 1}. This is the best case and the worst case of insertion sort.'
          }
        },
        {
          ex: {
            id: 'ds-3-1', skill: 'insertion-sort', title: 'Insertion sort',
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
            followup: 'Add a static counter and count the comparisons your method makes: 999 for 1,000 sorted values and 499,500 for 1,000 reversed ones. Then try a nearly sorted array with five values out of place.',
            failTip: 'If the reversed test loops or throws, the while condition reads a[j - 1] with j = 0: test j > 0 first. If values are lost, the final a[j] = value is missing or j is wrong.'
          }
        },
        {
          ex: {
            id: 'ds-3-2', skill: 'sort-stability', title: 'Sort by length, stably',
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
            followup: 'Make the method sort by length and, among words of the same length, alphabetically with compareTo, in a single insertion sort: change the comparison inside the while condition.',
            failTip: 'The second and third tests check stability: [c, aa, bb] means a word was carried past an equal-length one, which happens with >= or with a swap-based sort.'
          }
        },
        {
          ex: {
            id: 'ds-3-3', skill: 'selection-sort', kind: 'answer', title: 'Counting a sort',
            prompt: `<p>Use the two sorts exactly as written in this lesson: selection sort compares every remaining pair with the current smallest; insertion sort compares the value being inserted with its left neighbour until it finds one that is not larger, or reaches the front. Give each answer as a whole number.</p>`,
            parts: [
              { label: '(a) Comparisons made by selection sort on 10 values (any order).', answer: '45', width: '6rem', wrong: [{ match: '100', msg: 'The inner loop starts at i + 1: 9 + 8 + … + 1.' }, { match: '55', msg: 'That is 1 + 2 + … + 10. The last round compares nothing, so the sum ends at 9.' }, { match: '90', msg: 'Each pair is compared once, not twice.' }] },
              { label: '(b) Comparisons made by insertion sort on 10 values that are already in order.', answer: '9', width: '6rem', wrong: [{ match: '10', msg: 'The first value is never inserted: positions 1 to 9 each cost one comparison.' }, { match: '45', msg: 'That is the reversed case. On sorted input each value stops after one comparison.' }] },
              { label: '(c) Comparisons made by insertion sort on 10 values in reverse order.', answer: '45', width: '6rem', wrong: [{ match: '9', msg: 'That is the sorted case. Here every value slides all the way to the front: the value at position i makes i comparisons.' }, { match: ['90', '100'], msg: 'Position i makes i comparisons, for i from 1 to 9.' }] },
              { label: '(d) Insertion sort takes 2 seconds on 10,000 random values. About how many seconds on 20,000?', answer: '8', width: '6rem', wrong: [{ match: '4', msg: 'Doubling n doubles the work for an O(n) algorithm. This one is O(n²).' }, { match: '16', msg: 'That would be O(n³). Doubling n multiplies n² by four.' }] }
            ],
            hints: ['(a) 9 + 8 + … + 1. (b) one comparison per value from the second on. (c) 1 + 2 + … + 9. (d) O(n²): doubling n multiplies the time by 2² = 4.', 'The sum 1 + 2 + … + 9 is 9 × 10 / 2. For (b), a value that is already in place stops after the first comparison.'],
            solution: `<p>(a) The inner loop runs 9, 8, …, 1 times: <b>45</b>, which is 10 × 9 / 2. (b) Each of the 9 inserted values compares once with its neighbour and stops: <b>9</b>. (c) The value at position i slides past all i values before it: 1 + 2 + … + 9 = <b>45</b>. (d) 2 × 4 = <b>8</b> seconds: double the input, four times the work.</p>`,
            followup: 'Parts (b) and (c) are the same algorithm on the same number of values, and the counts differ by a factor of five. Best and worst cases are not a technicality; they are the difference between an instant and a wait.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>Sorting puts values in order; its cost is counted in comparisons and moves; a sort is stable if equal values keep their order. The simple sorts cost up to n(n−1)/2 comparisons, and how much less depends on the order the values start in: that answers the opening question.</li>
<li>Selection sort: find the smallest, swap it to the front, repeat. Exactly n(n−1)/2 comparisons on every input, at most 3n moves, not stable.</li>
<li>Insertion sort: slide each value left into the sorted prefix. From n − 1 comparisons (sorted input) to n(n−1)/2 (reversed): O(n) best, O(n²) worst, stable, and the right choice for small or nearly sorted arrays.</li>
<li>The invariant of each sort is also the source of its cost: selection sort cannot stop early, insertion sort can.</li>
<li>Both are O(n²); doubling the input multiplies the work by four. For large inputs the next lesson's O(n log n) sorts are the only choice.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-10', '3B-AP-11', '3B-AP-13', '3B-AP-15'],
      standard: 1, title: 'Divide and conquer: merge sort and quicksort', summary: 'Why splitting a problem in half and recursing gives n log n; merge sort, its merge step and its guarantee; quicksort, its partition step and its gamble; the recursion tree that explains both; and which one the library actually runs.',
      blocks: [
        `<p>The first sorting program ever written for a stored-program computer was a merge sort. John von Neumann wrote it in 1945 for the EDVAC, a machine that did not yet exist, in a notation he invented for the purpose; Donald Knuth, who later studied the manuscript, described it as the first program written for a computer of that kind. Von Neumann chose merging because it suited a machine that read data from a tape in order: two sorted tapes can be merged into one by reading each from the front and always taking the smaller, and the method never needs to jump back.</p>`,
        { photo: 'edvac', caption: 'The EDVAC as it was finally built, at the Army\'s Ballistic Research Laboratory, with an operator at its controls and a paper tape machine at the back. Von Neumann wrote his merge sort for it years before the machine was built.' },
        `<p>Fourteen years later a young Englishman named Tony Hoare was a visiting student in Moscow, working on machine translation. To translate a Russian sentence his program had to look its words up in a dictionary stored on magnetic tape, and the lookups would go much faster if the words were sorted first. He thought of a way to do it in place: pick one word, move everything smaller before it and everything larger after it, then do the same to each side. He had no computer to try it on, and no language to write it in that could call itself; when he learned Algol 60 the next year and saw that it allowed recursion, he wrote quicksort down in a few lines, and published it in 1961.</p>`,
        `<p>These are the two sorts the world runs, and they share one idea: <em>split the array, sort the pieces, combine</em>. Merge sort splits trivially and does its work combining; quicksort does its work splitting and combines trivially. This lesson is about why that idea turns n² into n log n, and about the price each sort pays for it. So how can halving a problem turn n² into n log n, and what does each sort give up to get there?</p>
<h2>Merging two sorted runs</h2>
<p>Everything in merge sort rests on one step. Given two sorted runs side by side in an array, <code>a[lo..mid−1]</code> and <code>a[mid..hi−1]</code>, produce one sorted run <code>a[lo..hi−1]</code>. Keep a finger on the front of each run; copy the smaller of the two values and advance that finger; when one run is used up, copy the rest of the other. Every value is copied exactly once, so the merge costs <code>hi − lo</code> moves and at most <code>hi − lo − 1</code> comparisons, whatever the values are. It needs a second array to copy into: you cannot merge in place without losing the invariant.</p>`,
        { predict: true, play: `import java.util.Arrays;
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
}`, caption: 'It prints the twelve values in order after 11 comparisons, one fewer than the number of values, and then, for the second array where the whole left run is smaller, only 6: those 6 comparisons empty the left run, and the right run is copied without looking. The ++ inside the brackets reads the index and then advances it: aux[k++] = a[i++] copies a value and moves both fingers in one line.' },
        { check: "Merging two sorted runs of total length m costs at most how many comparisons?", skill: 'merge-step', options: ["m − 1", "m log m", "m²"], answer: 0, wrong: [null, "m log m is the cost of a whole merge sort, with all its levels. A single merge walks each run once from the front, so it makes at most one comparison per value copied.", "m² would mean comparing every value of one run with every value of the other. Because both runs are already sorted, only the two front values ever need comparing."], why: "Each comparison copies one value, and after one run is used up the rest is copied without comparing." },
        `<h2>Merge sort</h2>
<p>If merging two sorted halves is cheap, sort each half first. How? By the same method: split it in two, sort the quarters, merge. A run of one value is already sorted, so the splitting stops there. That is the whole algorithm, and it is naturally written as a method that calls itself.</p>`,
        { predict: true, play: `import java.util.Arrays;
public class Main {
    static int comparisons;
    static void merge(int[] a, int lo, int mid, int hi, int[] aux) {
        int i = lo, j = mid, k = lo;
        while (i < mid && j < hi) { comparisons++; if (a[i] <= a[j]) aux[k++] = a[i++]; else aux[k++] = a[j++]; }
        while (i < mid) aux[k++] = a[i++];
        while (j < hi) aux[k++] = a[j++];
        for (k = lo; k < hi; k++) a[k] = aux[k];
    }
    static void sort(int[] a, int lo, int hi, int[] aux) {     // sorts a[lo..hi-1]
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
    }
}`, caption: 'It prints the sixteen values in order after 49 comparisons: below n log₂ n, which is 64, and far below the 120 that a quadratic sort can need. The method calls itself twice and then merges: the base case is a run of fewer than two values.' },
        `<p>Now time the growth. Put this loop in <code>main</code> instead (<code>for (int n : new int[] {1000, 2000, 4000, 8000})</code>, filling <code>b[i] = (i * 7919) % 10007</code> and printing <code>comparisons / n</code>). You will see 8,792, 19,585, 43,148 and 94,297 comparisons, which is 8.79, 9.79, 10.79 and 11.79 per value. Doubling <code>n</code> does not quadruple the count: it a little more than doubles it, and the comparisons per value grow by exactly one each time, which is what <code>log₂ n</code> does.</p>`,
        `<div class="stmt"><p><span class="kind">Merge sort.</span> Split the array in half, sort each half recursively, merge. A run of fewer than two values is the base case.</p>
<p><span class="kind">Cost.</span> Every level of the recursion merges a total of <code>n</code> values, and there are <code>⌈log₂ n⌉</code> levels, so the work is <code>n log n</code> comparisons at most, on every input: there is no bad case. It uses <code>n</code> extra cells of memory, and it is stable if the merge takes from the left on ties.</p></div>
<p>The figure runs merge sort from the bottom up, which is how von Neumann's tapes did it: runs of 1 merge into runs of 2, then 4, then 8. Step through one merge, then let it play. The top-down recursion above does the same merges in a different order.</p>`,
        { fig: 'mergeviz', caption: 'Sixteen values. The top row is the runs being merged (the two highlighted blocks), the bottom row the merged output being built left to right. Each round halves the number of runs; four rounds for sixteen values, because 2⁴ = 16.' },
        { check: "Why is merge sort O(n log n)?", skill: 'n-log-n', options: ["Because merging is O(log n)", "Each level of the recursion merges n values in total, and there are log n levels", "Because it uses a second array"], answer: 1, wrong: ["A merge looks at every value of its two runs, so it is O(n), not O(log n). The log n is the number of levels, not the cost of a merge.", null, "The second array costs memory, not time, and it does not give the sort its n log n. The count comes from log n levels with n values merged at each."], why: "Halving gives log n levels; linear work at each level gives n per level. Total n log n, on every input." },
        `<h2>Why n log n: the recursion tree</h2>
<p>Draw the calls as a tree. At the top, one call on <code>n</code> values; below it two calls on <code>n/2</code> each; below those four on <code>n/4</code>, and so on down to <code>n</code> calls on one value each. The merging done at any one level adds up to <code>n</code> moves, because the runs at that level between them contain every value once. The number of levels is how many times you can halve <code>n</code> before reaching 1, which is <code>log₂ n</code>: 10 levels for a thousand, 20 for a million. Total: <code>n</code> per level × <code>log n</code> levels.</p>
<p>This is the argument to remember. It applies to any algorithm that splits a problem into halves and does linear work to split or to join: the splitting gives the <code>log</code>, the linear work at each level gives the <code>n</code>. Compare it with lesson 2's binary search, which also halves but does only constant work at each level, and so costs <code>log n</code> with no <code>n</code> in front.</p>
<h2>Quicksort: doing the work on the way down</h2>
<p>Hoare's idea turns merge sort inside out. Instead of splitting in the middle and working to combine, choose a <em>pivot</em> value and rearrange the array so that everything less than the pivot is to its left and everything greater is to its right. The pivot is now in its final position. Then sort the left part and the right part recursively, and there is nothing to combine: the two parts are already in the right place relative to each other.</p>
<p>The rearranging step is called <em>partition</em>. The version below, due to Nico Lomuto, is the simplest to write and to prove: take the last value as the pivot, and walk a finger <code>j</code> along the array, keeping everything before a second finger <code>i</code> less than the pivot. Whenever <code>a[j]</code> is smaller than the pivot, swap it into position <code>i</code> and advance <code>i</code>. At the end, swap the pivot into position <code>i</code>.</p>`,
        { fig: 'partition', caption: 'Lomuto partition with the last value as pivot. The invariant at every step: cells before i are less than the pivot, cells from i to j − 1 are greater or equal, cells from j on are not yet examined. Watch the invariant hold at every step, then Shuffle and watch it again.' },
        { predict: true, play: `import java.util.Arrays;
public class Main {
    static int comparisons;
    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }
    static int partition(int[] a, int lo, int hi) {   // rearrange a[lo..hi] round the pivot a[hi]
        int pivot = a[hi], i = lo;
        for (int j = lo; j < hi; j++) { comparisons++; if (a[j] < pivot) { swap(a, i, j); i++; } }
        swap(a, i, hi);
        return i;                                     // the pivot's final index
    }
    static void sort(int[] a, int lo, int hi) {       // sorts a[lo..hi], inclusive at both ends
        if (lo >= hi) return;
        int p = partition(a, lo, hi);
        sort(a, lo, p - 1);
        sort(a, p + 1, hi);
    }
    public static void main(String[] args) {
        int[] a = {29, 10, 14, 37, 13, 7, 41, 22, 18, 25};
        int p = partition(a, 0, a.length - 1);
        System.out.println("pivot 25 lands at " + p + ": " + Arrays.toString(a));
        int[] b = {38, 27, 43, 3, 9, 82, 10, 1, 56, 14, 71, 5, 29, 66, 48, 12};
        sort(b, 0, b.length - 1);
        System.out.println(Arrays.toString(b) + "   comparisons: " + comparisons);
    }
}`, caption: 'It prints <code>pivot 25 lands at 6: [10, 14, 13, 7, 22, 18, 25, 29, 37, 41]</code>: 25 has the six smaller values left of it and the three larger ones right of it, and it will never move again. Then it sorts the sixteen values that merge sort sorted in 49 comparisons. The count printed is 56, which includes the 9 comparisons of the first partition; the full sort alone takes 47: about the same comparing, but no copying into a second array, which is why in practice quicksort is usually the faster of the two.' },
        `<div class="stmt"><p><span class="kind">Quicksort.</span> Partition round a pivot; the pivot is then in its final place; sort the two sides recursively. A part of fewer than two values is the base case.</p>
<p><span class="kind">Cost.</span> Partition costs <code>n − 1</code> comparisons. If the pivot lands near the middle every time, the recursion tree has <code>log n</code> levels and the sort costs about <code>1.39 n log₂ n</code> comparisons on average. If the pivot is always the smallest or largest value, one side is empty, the tree has <code>n</code> levels, and the cost is <code>n²/2</code>: quadratic. In place, not stable.</p></div>
<h2>The gamble, and how to hedge it</h2>
<p>When does the last value make the worst pivot? When the array is already sorted. Then every partition peels off one value, and sorting a sorted array, the easiest possible input, takes <code>n²/2</code> comparisons. Insertion sort does it in <code>n</code>. This is not a theoretical worry: sorted and nearly sorted inputs are the most common inputs there are. Predict how the cost of 200 sorted values compares with 200 shuffled ones, for each of two choices of pivot.</p>`,
        { predict: true, play: `public class Main {
    static int comparisons;
    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }
    static int partition(int[] a, int lo, int hi) {
        int pivot = a[hi], i = lo;
        for (int j = lo; j < hi; j++) { comparisons++; if (a[j] < pivot) { swap(a, i, j); i++; } }
        swap(a, i, hi); return i;
    }
    static void sort(int[] a, int lo, int hi, boolean middlePivot) {
        if (lo >= hi) return;
        if (middlePivot) swap(a, (lo + hi) >>> 1, hi);   // move the middle value to the end, where the pivot goes
        int p = partition(a, lo, hi);
        sort(a, lo, p - 1, middlePivot);
        sort(a, p + 1, hi, middlePivot);
    }
    public static void main(String[] args) {
        for (boolean middle : new boolean[] {false, true}) {
            int n = 200; int[] sorted = new int[n], shuffled = new int[n];
            for (int i = 0; i < n; i++) { sorted[i] = i; shuffled[i] = (i * 7919) % 1009; }
            comparisons = 0; sort(shuffled, 0, n - 1, middle); int c = comparisons;
            comparisons = 0; sort(sorted, 0, n - 1, middle);
            System.out.println((middle ? "middle pivot" : "last pivot  ") + "   shuffled input: " + c + "   sorted input: " + comparisons);
        }
    }
}`, caption: 'It prints, for the last value as pivot, 1540 comparisons on shuffled input and 19,900 on sorted input; for the middle pivot, 1859 and 1153. For comparison, n log₂ n is about 1,529 and n²/2 is 20,000. With the last value as pivot, sorted input costs n²/2 comparisons: two hundred values take 19,900, thirteen times the shuffled case, and the recursion goes two hundred calls deep. Taking the middle value as pivot makes sorted input the best case instead. Real implementations choose the pivot at random, or as the median of three samples, so that no fixed input shape can be the bad one.' },
        { check: "Quicksort with the last value as pivot is given an already sorted array. What happens?", skill: 'quicksort-pivot', options: ["Its best case: O(n log n)", "Its worst case: every partition peels off one value, O(n²)", "It stops early"], answer: 1, wrong: ["n log n is quicksort’s case when the pivots land near the middle. With the last value as pivot, sorted input makes the pivot the largest every time, which is the opposite.", null, "Quicksort has no test for “already sorted” (insertion sort has one, by its nature). It partitions anyway, and each pass peels off a single value."], why: "The pivot is the largest, so one side is empty each time and the recursion goes n deep: n²/2 comparisons for the easiest possible input." },
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
        { predict: true, play: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] nums = {38, 27, 43, 3, 9, 82, 10};
        Arrays.sort(nums);                               // a dual-pivot quicksort underneath
        System.out.println(Arrays.toString(nums));

        String[] words = {"pear", "fig", "banana", "kiwi", "apple", "date"};
        Arrays.sort(words);                              // TimSort, a merge sort
        System.out.println(Arrays.toString(words));
    }
}`, caption: 'It prints the numbers in order, then the words in dictionary order. The same method name, two different algorithms, chosen by the type of the array. The documentation of Arrays.sort for Object[] promises that the sort is stable; the one for int[] promises nothing of the kind, because it does not need to.' },
        `<details class="reveal"><summary>Puzzle: merge sort on 8 values makes how many merges, and how many levels? Quicksort on 8 values whose pivots always land exactly in the middle: how many comparisons in total?</summary><p>Merge sort: 7 merges (4 of size 2, 2 of size 4, 1 of size 8) over 3 levels, since 2³ = 8. Quicksort with the best pivots: 7 at the top level (the pivot against the other 7), leaving parts of 3 and 4; the 3 costs 2 and leaves two parts of 1; the 4 costs 3 and leaves parts of 1 and 2; the 2 costs 1. That is 7 + 2 + 3 + 1 = 13 comparisons. Merge sort on 8 values makes between 12 and 17, so a lucky quicksort and merge sort compare about equally often. Quicksort usually wins on the clock for other reasons: it works in place, with no second array to copy into, and its inner loop is very short. And it needs help not to be unlucky.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> A merge that uses <code>&lt;</code> instead of <code>&lt;=</code>, which still sorts but is not stable. Forgetting to copy the leftovers of the run that was not used up. A merge sort whose base case is <code>hi − lo &lt; 1</code> instead of <code>&lt; 2</code>, which recurses forever on a run of one. Allocating a new <code>aux</code> array inside every call (correct, but it turns an n log n sort into one that spends most of its time allocating). A quicksort that recurses on <code>lo..p</code> instead of <code>lo..p − 1</code>, which never shrinks when the pivot is the largest value. Choosing the first or last value as pivot in production code.</p>` },
        {
          ex: {
            id: 'ds-4-1', skill: 'merge-step', title: 'Merge',
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
            followup: 'Change your merge to use < instead of <= and merge {10, 20, 30} with {10, 20, 30} again, but this time tag each value with its run so you can see which 10 came first. What goes wrong with the order of equal values?',
            failTip: 'If the result has repeated or missing values, the copy-back loop or a leftover loop is wrong. If the sort of a run of one fails, the loops must cope with an empty right run (j == hi from the start).'
          }
        },
        {
          ex: {
            id: 'ds-4-2', skill: ['merge-step', 'n-log-n'], title: 'Merge sort',
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
            followup: 'Add a static counter of comparisons to your merge, sort 1,024 values in several different orders, and compare each count with the largest possible, 9,217 (see the next exercise).',
            failTip: 'If the checker times out, the recursion is not shrinking (base case or mid wrong) or the sort is quadratic. If values go missing, check the merge’s leftover loops and copy-back.'
          }
        },
        {
          ex: {
            id: 'ds-4-3', skill: 'quicksort-pivot', title: 'Partition',
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
            followup: 'Use your partition to write quickSort(int[] a), then count its comparisons on 1,000 sorted values (about 500,000) and on 1,000 shuffled ones (about 10,000). Then swap a random cell into the pivot position before partitioning and run the sorted case again.',
            failTip: 'The checker compares the exact arrangement, which Lomuto’s method fixes completely: loop j from lo to hi − 1, swap on strictly less than, swap the pivot in last. If the equal-values test returns 3, you used <= in the comparison.'
          }
        },
        {
          ex: {
            id: 'ds-4-4', skill: 'n-log-n', kind: 'answer', title: 'Levels and leaves',
            prompt: `<p>Use the costs from this lesson: a merge of <code>m</code> values makes at most <code>m − 1</code> comparisons; Lomuto partition of <code>m</code> values makes exactly <code>m − 1</code>. Give whole numbers.</p>`,
            parts: [
              { label: '(a) Merge sort on 1024 values: how many levels of merging are there?', answer: '10', width: '6rem', wrong: [{ match: '1024', msg: 'Levels, not calls. Each level halves the run length: how many halvings take 1024 down to 1?' }, { match: '11', msg: 'Runs of 1 need no merge. The merges produce runs of 2, 4, …, 1024: count them.' }] },
              { label: '(b) Merge sort on 1024 values: the greatest possible total number of comparisons? (n log₂ n minus the ones saved: each merge of m values makes at most m − 1.)', answer: '9217', width: '6rem', wrong: [{ match: '10240', msg: 'That is n log₂ n exactly. Every merge saves at least one comparison, and there are 1023 merges.' }, { match: '1023', msg: 'That is the number of merges, not of comparisons.' }] },
              { label: '(c) Quicksort with the last value as pivot, on 100 values already in increasing order: total comparisons?', answer: '4950', width: '6rem', wrong: [{ match: '99', msg: 'That is the first partition alone. The pivot is the largest value, so the left part has 99 values and the whole thing happens again.' }, { match: ['10000', '5000'], msg: 'Partitions of 100, 99, …, 2 values cost 99 + 98 + … + 1.' }] },
              { label: '(d) Quicksort on 1,000,000 values with a random pivot takes 1 second. Merge sort on the same machine takes about 1.4 seconds. About how long would a quadratic sort take, in hours, if a comparison costs the same? (Use n²/2 against 1.39 n log₂ n, round to the nearest hour.)', answer: '5', width: '6rem', wrong: [{ match: ['18000', '17986', '17985'], msg: 'That is the ratio in seconds; the question asks for hours.' }, { match: '4', msg: 'n²/2 = 5 × 10¹¹; 1.39 n log₂ n ≈ 2.77 × 10⁷; the ratio is about 18,000 seconds.' }] }
            ],
            hints: ['(a) 2¹⁰ = 1024. (b) 10 levels × 1024 = 10,240, minus one per merge; a merge sort of n values makes n − 1 merges. (c) 99 + 98 + … + 1 = 99 × 100 / 2. (d) Divide n²/2 by 1.39 n log₂ n, then by 3600.', 'For (d): n²/2 is 5 × 10¹¹, and 1.39 n log₂ n is about 2.8 × 10⁷. The ratio of the two is the factor by which the quadratic sort is slower than quicksort’s one second.'],
            solution: `<p>(a) <b>10</b>: 1024 = 2¹⁰. (b) <b>9217</b>: 10 × 1024 = 10,240 comparisons if every merge used all of them; each of the 1023 merges saves at least one, so 10,240 − 1023. (c) <b>4950</b>: 99 + 98 + … + 1. (d) <b>5</b> hours: 5 × 10¹¹ / (1.39 × 10⁶ × 20) ≈ 18,000 seconds.</p>`,
            followup: 'Part (d) is the whole reason this lesson exists: on a million values, the difference between n² and n log n is the difference between a second and an afternoon.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>Divide and conquer: split, solve the parts recursively, combine. Halving gives log n levels; linear work per level gives n log n. That is how halving turns n² into n log n.</li>
<li>Merge sort: split in the middle, merge sorted halves. n log n on every input, stable, needs n extra cells, works on tapes and linked lists.</li>
<li>Quicksort: partition round a pivot, recurse on both sides. n log n on average with a smaller constant, in place, not stable, n² if the pivots are bad; random or median-of-three pivots make bad pivots unlikely.</li>
<li>Lomuto partition keeps the invariant "less than pivot | greater or equal | unseen" and costs n − 1 comparisons.</li>
<li>Java's <code>Arrays.sort</code> is a quicksort for primitives and a merge sort (TimSort) for objects, for exactly the reasons in the table. What each sort gives up: merge sort pays in memory, quicksort in a bad worst case.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3A-DA-10', '3B-AP-10', '3B-AP-11', '3B-AP-12', '3B-AP-13', '3B-AP-15'],
      title: 'Checkpoint: counting, searching, sorting', checkpoint: true, summary: 'No new ideas: mixed questions on counting steps, arrays, binary search, the slow sorts and the fast ones. Which method fits? How does the cost grow? Then a choice of plan and a program that counts what binary search does.',
      blocks: [
        `<p>This lesson teaches nothing new. It mixes questions from the last four lessons, because the ideas that look alike, such as a scan and a binary search, or selection sort and insertion sort, are only told apart by being asked about together. Answer each question before you look back. If one surprises you, the lesson it came from is linked on the Review page, and the question will come back there in a day.</p>
<p>Ready? Here is the first: if a loop inside a loop takes a second for 1,000 items, how long will 2,000 items take?</p>
<h2>Mixed questions</h2>`,
        { check: `The loops <code>for (int i = 0; i &lt; n; i++) for (int j = 0; j &lt; n; j++) steps++;</code> run once with <code>n = 1000</code> and once with <code>n = 2000</code>. How does the number of steps change?`, skill: 'count-steps', options: ['It doubles', 'It becomes four times as big', 'It grows by 1,000'], answer: 1, wrong: ['Doubling is what a single loop does. Here both loops grow: 2,000 × 2,000 is four times 1,000 × 1,000.', null, 'That would be adding a fixed amount. The count is n × n, so doubling n multiplies the count by 2 × 2.'], why: 'n × n steps: 1,000,000 for n = 1,000 and 4,000,000 for n = 2,000. A nested loop is O(n²), and the doubling experiment shows it as a factor of 4.' },
        { check: 'On an array of a million values, which job takes the fewest steps?', skill: 'array-cost', options: ['Reading the value at index 500,000', 'Inserting a new value at index 0', 'Finding out whether 42 is in an unsorted array'], answer: 0, wrong: [null, 'Every one of the million values has to move one cell to the right to make room: O(n).', 'With no order to use, every cell may have to be looked at: O(n).'], why: 'An array finds cell i by arithmetic, base + 4i, so reading by index is O(1). Inserting at the front shifts everything, and searching an unsorted array scans it.' },
        { check: 'You will look up a value just <em>once</em> in an unsorted array of 1,000,000 numbers. Which plan takes the fewest steps?', skill: 'binary-search', options: ['Sort the array, then binary search it', 'Scan it from the start until the value turns up', 'Binary search it as it is'], answer: 1, wrong: ['Sorting costs about n log n, roughly 20 million steps, far more than the 1 million of a single scan. Sorting pays off only when you search many times.', null, 'Binary search needs sorted data. On an unsorted array it can walk away from the value and report it missing when it is there.'], why: 'One scan is O(n). Sorting first costs O(n log n) before the O(log n) search even starts, so it wins only when the sorted array is searched again and again.' },
        { check: '200,000 random numbers must be sorted. Which method do you choose?', skill: 'n-log-n', options: ['Selection sort', 'Insertion sort', 'Merge sort'], answer: 2, wrong: ['Selection sort always makes n(n − 1)/2 comparisons: about 20 billion for 200,000 values.', 'On random data insertion sort still shifts about n²/4 values: about 10 billion moves. Better than selection sort, but still quadratic.', null], why: 'Merge sort takes about n log₂ n steps: roughly 200,000 × 18, or 3.5 million. The two slow sorts are fine for a few hundred values and hopeless for hundreds of thousands.' },
        { check: 'Selection sort and insertion sort are both O(n²) in the worst case. What do they do on an array that is <em>already sorted</em>?', skill: 'insertion-sort', options: ['Both still make about n²/2 comparisons', 'Insertion sort makes about n comparisons; selection sort still makes about n²/2', 'Selection sort makes about n comparisons; insertion sort about n²/2'], answer: 1, wrong: ['That is true of selection sort only. Insertion sort stops shifting as soon as the value in hand is in place.', null, 'It is the other way round: selection sort always searches the whole unsorted part for the smallest value, whatever the order.'], why: 'Insertion sort compares each new value with its left neighbour, finds it in place, and moves on: n − 1 comparisons. Selection sort cannot know the rest is sorted without looking at it.' },
        { check: 'A list is sorted by name, then sorted again by year with a sort that is <em>not</em> stable. What can go wrong?', skill: 'sort-stability', options: ['Students in the same year may no longer be in name order', 'Some students may disappear from the list', 'The list is no longer sorted by year'], answer: 0, wrong: [null, 'A sort only rearranges. Stability is about the order of items the sort considers equal, never about losing items.', 'It is sorted by year either way. Stability matters only for the items that tie.'], why: 'A stable sort keeps tied items in their earlier order, so "by year, then by name within a year" works by sorting twice. An unstable sort is free to shuffle the ties.' },
        { check: 'The sorted runs <code>[2, 5, 9]</code> and <code>[3, 4, 8]</code> are merged. What are the first three values written to the output?', skill: 'merge-step', options: ['2, 3, 4', '2, 5, 9', '2, 3, 5'], answer: 0, wrong: [null, 'That copies the whole first run before looking at the second. The merge compares the front values of both runs every time and writes the smaller.', 'After 2 and 3 are written, the fronts are 5 and 4. Four is smaller, so 4 comes next.'], why: 'Compare 2 and 3: write 2. Compare 5 and 3: write 3. Compare 5 and 4: write 4. Each step looks only at the two front values, which is why merging m values takes about m steps.' },
        { check: 'Quicksort picks a <em>random</em> value as the pivot instead of the last one. What does that change?', skill: 'quicksort-pivot', options: ['No particular input, such as an already sorted array, is reliably bad: the expected cost is O(n log n)', 'The worst case becomes impossible', 'Quicksort becomes stable'], answer: 0, wrong: [null, 'A run of unlucky pivots can still happen; it is only extremely unlikely. A guaranteed n log n is what merge sort gives.', 'Quicksort swaps values that are far apart, so equal values can change places whatever the pivot.'], why: 'With the last value as the pivot, a sorted array is the worst case: every partition peels off one value. A random pivot takes that predictability away, so the bad case becomes a bad-luck case.' },
        `<p>Two jobs to finish the unit. The first needs no code: choose the plan that does the least work. The second makes a program count what binary search really does.</p>`,
        {
          ex: {
            id: 'ds-13-1', kind: 'choice', skill: 'binary-search', title: 'Which plan?',
            prompt: `<p>A phone directory holds 1,000,000 names. It is rebuilt once each night, and during the day it answers 50,000 lookups. Which plan does the least work in a day?</p><p>For scale: a scan looks at up to 1,000,000 names, a good sort takes about 20 million steps, and a binary search takes about 20.</p>`,
            options: [
              { text: 'Keep the names in any order and scan the list for each lookup.', why: 'That is up to 50,000 × 1,000,000 = 50 billion steps in a day.' },
              { text: 'Sort the names once a night with merge sort, then binary search for each lookup.', ok: true },
              { text: 'Sort the names once a night with selection sort, then binary search for each lookup.', why: 'Selection sort alone makes about 500 billion comparisons for a million names: ten times the work of all the scans it was meant to avoid.' },
              { text: 'Skip the sorting and binary search the names as they are: it is the fastest search.', why: 'Binary search only works on sorted data. On an unsorted list it gives wrong answers.' }
            ],
            hints: ['Count each plan\'s work: the sorting (if any) once, plus the lookups, 50,000 of them.', 'Merge sort costs about 20 million once; 50,000 binary searches cost about 50,000 × 20 = 1 million. Compare the total with 50 billion.'],
            solution: '<p>Sort once with merge sort, then binary search: about 20 million + 1 million = 21 million steps, against 50 billion for scanning. Sorting is worth its price because the sorted array is searched 50,000 times. Selection sort is too slow to pay back, and binary search on unsorted data is simply wrong.</p>',
            followup: 'How few lookups would there have to be before scanning beats sorting and then binary searching? Use 20 million for the sort and 1 million for a scan.'
          }
        },
        {
          ex: {
            id: 'ds-13-2', skill: 'binary-search', title: 'Count the probes',
            prompt: `<p>Write a method</p><pre class="code">static int probes(int[] a, int x)</pre><p>for a <em>sorted</em> array <code>a</code>. It runs binary search for <code>x</code> and returns how many cells it looks at: one for each time it reads <code>a[mid]</code>. The search stops at the first cell that holds <code>x</code>, or when no cells are left to look at. Use <code>mid = lo + (hi - lo) / 2</code>.</p><p>For <code>{2, 4, 6, 8, 10, 12, 14}</code>: <code>probes(a, 8)</code> is 1 (the middle cell), <code>probes(a, 2)</code> is 3, and <code>probes(a, 5)</code> is 3, because 5 is absent and the search ends with nothing left.</p>`,
            starter: `static int probes(int[] a, int x) {\n    int lo = 0;\n    int hi = a.length - 1;\n    // while cells are left: look at the middle, count it, and keep one half\n    return 0;\n}`,
            solution: `static int probes(int[] a, int x) {\n    int lo = 0;\n    int hi = a.length - 1;\n    int count = 0;\n    while (lo <= hi) {\n        int mid = lo + (hi - lo) / 2;\n        count++;\n        if (a[mid] == x) {\n            return count;\n        }\n        if (a[mid] < x) {\n            lo = mid + 1;\n        } else {\n            hi = mid - 1;\n        }\n    }\n    return count;\n}`,
            hints: ['Keep a counter and add one each time you read a[mid]. The loop runs while lo <= hi.', 'If a[mid] == x, return the count at once. If a[mid] is smaller than x the value can only be on the right (lo = mid + 1); otherwise on the left (hi = mid - 1). When the loop ends, return the count.'],
            tests: [
              { setup: '        int[] a = {2, 4, 6, 8, 10, 12, 14};', call: 'probes(a, 8)', expect: '1', name: 'the middle cell is found at once' },
              { setup: '        int[] a = {2, 4, 6, 8, 10, 12, 14};', call: 'probes(a, 2) + " " + probes(a, 14)', expect: '3 3', name: 'the first and the last value' },
              { setup: '        int[] a = {2, 4, 6, 8, 10, 12, 14};', call: 'probes(a, 12) + " " + probes(a, 4) + " " + probes(a, 10)', expect: '2 2 3', name: 'other values' },
              { setup: '        int[] a = {2, 4, 6, 8, 10, 12, 14};', call: 'probes(a, 5) + " " + probes(a, 100) + " " + probes(a, 0)', expect: '3 3 3', name: 'absent values still cost probes' },
              { setup: '        int[] a = {7};', call: 'probes(a, 7) + " " + probes(a, 3)', expect: '1 1', name: 'one cell' },
              { setup: '        int[] a = new int[0];', call: 'probes(a, 3)', expect: '0', name: 'no cells, no probes' },
              { setup: '        int[] a = new int[1000];\n        for (int i = 0; i < 1000; i++) a[i] = i * 2;', call: 'probes(a, 1998) + " " + probes(a, -1) + " " + probes(a, 998)', expect: '10 9 1', name: 'a thousand values' }
            ],
            failTip: 'If the tests for absent values loop forever, check that lo and hi really move past mid (mid + 1 and mid - 1). If the counts are one too high or too low, count a cell when you read it, before you compare.',
            followup: 'Run probes on an array of 1,023 values for every value in it and keep the largest answer. Then try 1,024 values. What do you notice, and how does it match log₂ n?'
          }
        },
        `<div class="recap"><h3>Unit one in a few lines</h3><ul>
<li>Count steps, not seconds, and read the order of growth off the code: a loop is n, a loop in a loop is n², halving is log n. Doubling the input shows the shape: ×2 linear, ×4 quadratic.</li>
<li>An array reads any cell in O(1) and pays O(n) to insert or remove in the middle. Binary search takes about log₂ n probes, but only on sorted data, so sorting is worth it only when you search many times.</li>
<li>Selection sort and insertion sort are O(n²); insertion sort is near n on nearly sorted data. Merge sort is O(n log n) by merging runs and is stable. Quicksort is O(n log n) on average and O(n²) on bad luck.</li>
<li>Next: nodes that point to each other. A linked list gives up the array's indexing to gain cheap changes at the front.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3A-DA-10', '3B-AP-12'],
      standard: 1, title: 'Linked lists', summary: 'A structure made of nodes that point to each other; what it makes cheap (changing the front, splicing) and expensive (reaching an index); writing one in Java with two classes; reversing it in place; and why ArrayList still wins most of the time.',
      blocks: [
        `<p>In 1956 three researchers, Allen Newell, Herbert Simon and Cliff Shaw, were building a program they called the Logic Theorist, to run on JOHNNIAC, a computer at the RAND Corporation in California, which could prove theorems from Russell and Whitehead's <em>Principia Mathematica</em>. Its data, logical expressions, were not of fixed size: a proof grew and branched as the program worked, and no array laid out in advance could hold it. So in the language they designed for it, IPL, every piece of data was a <em>cell</em> holding a value and the address of the next cell. A list was a chain of cells, and growing it meant making a new cell and changing one address. John McCarthy saw IPL, found it clumsy, and made the idea elegant in Lisp two years later; the linked list has been one of the two basic ways to hold a sequence ever since.</p>`,
        { photo: 'johnniac', caption: 'JOHNNIAC, the computer at RAND on which the Logic Theorist ran, now in the Computer History Museum in California. The cabinets are packed with rows of valves (vacuum tubes); its operators sat at the console in front.' },
        `<p>The other way is the array. The two are opposites, and this lesson is the comparison. An array is one block of memory with its values side by side: reaching cell <code>i</code> is arithmetic, but making room at the front means shifting everything. A linked list is many small blocks joined by addresses: making room anywhere means changing two addresses, but reaching cell <code>i</code> means walking there, because there is no arithmetic that finds it. So which of the two should you reach for, and when does the answer change?</p>
<h2>A node and a chain of them</h2>
<p>In Java a node is a small class with two fields, the value and a reference to the next node. The last node's <code>next</code> is <code>null</code>. The list itself is just a reference to the first node, called the <em>head</em>; an empty list is a <code>null</code> head. Predict the order of the list that the code after the figure builds, with four values added at the front.</p>`,
        { fig: 'linkedlist', caption: 'Each box is a node: a value and the address of the next node. Try Get index 3 and count the hops; then Add first and see that nothing is walked; then Insert at index 2 and watch two arrows change while no value moves.' },
        { predict: true, play: `class Node {
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
}`, caption: 'It prints <code>12 -> 7 -> 3 -> 9 -> null</code> and then <code>length 4, first 12, second 7</code>. Each new node goes in front of the old head, so the last one added, 12, ends up first. Four addFirst operations build 12 -> 7 -> 3 -> 9; each is O(1) because nothing is walked. Change the order of the four lines and the list changes order. The for loop that follows next until null is the one idiom of this lesson: there is no index, only "the current node" and "the next one".' },
        { check: "In a singly linked list with only a head reference, adding at the front costs…", skill: 'linked-list-cost', options: ["O(1): a new node whose next is the old head", "O(n): walk to the end", "O(log n)"], answer: 0, wrong: [null, "Walking to the end is what adding at the back costs when there is no tail reference. Adding at the front touches only head, and nothing is walked.", "Nothing in a list halves a range, so no log n appears. The front is reached directly through head: one new node and one assignment."], why: "Make a node, point it at the old head, point head at it. Nothing is walked and nothing shifts." },
        `<div class="stmt"><p><span class="kind">Singly linked list.</span> Nodes each holding a value and a reference <code>next</code>; a <code>head</code> reference to the first; <code>null</code> marks the end. Optionally a <code>size</code> count and a <code>tail</code> reference to the last node.</p>
<p><span class="kind">Cheap, O(1).</span> Add or remove at the front. Add at the back, if a tail reference is kept. Insert or remove <em>after a node you are already holding</em>.</p>
<p><span class="kind">Expensive, O(n).</span> Reach index <code>i</code> (walk <code>i</code> hops). Find a value. Remove a value by searching for it. Anything that says "the i-th".</p></div>
<h2>The list as a class</h2>
<p>Nobody passes bare nodes around. The list is wrapped in a class that owns the head and the size, so that the user calls <code>list.addFirst(5)</code> and never sees a <code>Node</code>. The lesson's version below is an <code>IntList</code>; the exercises ask you to finish it. It is a whole class with a <code>main</code>, so it is longer than the other examples. Read it first, then predict what <code>main</code> prints.</p>`,
        { predict: true, long: true, play: `class Node {
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
}`, caption: 'It prints <code>[12, 7, 3, 9]  size 4</code>, then <code>get(2) = 3</code>, then <code>removed 12, now [7, 3, 9]</code>, then the exception message for index 10 of a list of three. addLast and get are walks; addFirst and removeFirst are not. toString walks the list once, so printing is O(n), like printing an array. get(2) walks two hops. The exception message copies the one the Java library uses for ArrayList, so that code written against either behaves the same.' },
        `<h2>Inserting and removing in the middle</h2>
<p>Here is the operation that makes linked lists worth having. To insert after a node <code>p</code>: make the new node with <code>next = p.next</code>, then set <code>p.next</code> to the new node. Two assignments, in that order, and no value moves. To remove the node after <code>p</code>: <code>p.next = p.next.next</code>. One assignment. In an array the same operations shift every value to the right of the point, O(n).</p>
<p>The catch is in the words "a node you are already holding". If you have to find <code>p</code> by walking from the head, the walk is O(n) and the saving is gone. The list wins when the program is already at the right place: an iterator in the middle of a pass, a queue whose ends are both known, a scheduler moving the current task to the back. It loses whenever the program says "the i-th".</p>`,
        { predict: true, play: `class Node { int value; Node next; Node(int value, Node next) { this.value = value; this.next = next; } }
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
}`, caption: 'It prints <code>1 -> 2 -> 3 -> 4</code>, then the list with 99 after 2, then back to 1 -> 2 -> 3 -> 4, then 1 -> 2 -> 4. The insert and the first removal are O(1) because p was already in hand. The removal of 3 is O(n): the walk has to stop one node early, at the node whose next holds 3, because a singly linked node cannot see backwards. That "one node early" is the source of most linked-list bugs.' },
        { check: "To remove the node holding 3 from a singly linked list, which node must you be holding?", skill: 'linked-list-pointers', options: ["The node holding 3", "The node before it, whose next must change", "The head"], answer: 1, wrong: ["Holding the node itself is no use: a singly linked node cannot see who points at it, so it cannot redirect the arrow that reaches it.", null, "The head is the right node only when the value to remove is the first one. Otherwise you must walk to the node just before the target."], why: "A singly linked node cannot see backwards. Only the previous node's next can be redirected past the one being removed." },
        `<h2>Reversing a list in place</h2>
<p>The classic exercise, asked in interviews for sixty years because it tests whether you can hold three references in your head at once. Walk the list; at each node, point its <code>next</code> backwards at the previous node. You need to remember the next node before you overwrite the arrow to it. Predict what the list <code>1 -> 2 -> 3 -> 4 -> 5</code> looks like afterwards, and what happens to the empty list.</p>`,
        { predict: true, play: `class Node { int value; Node next; Node(int value, Node next) { this.value = value; this.next = next; } }
public class Main {
    static Node reverse(Node head) {
        Node prev = null, cur = head;
        while (cur != null) {
            Node after = cur.next;     // remember where to go next, before we lose it
            cur.next = prev;           // turn the arrow round
            prev = cur; cur = after;   // step both references forward
        }
        return prev;                   // the old last node is the new head
    }
    static String show(Node head) {
        StringBuilder sb = new StringBuilder();
        for (Node cur = head; cur != null; cur = cur.next) sb.append(cur.value).append(cur.next != null ? " -> " : "");
        return sb.toString();
    }
    public static void main(String[] args) {
        Node head = null; for (int v = 5; v >= 1; v--) head = new Node(v, head);
        System.out.println(show(head));
        head = reverse(head);
        System.out.println(show(head));
        System.out.println(show(reverse(null)) + "(reversing the empty list)");
        System.out.println(show(reverse(new Node(42, null))) + "   (one node)");
    }
}`, caption: 'It prints <code>1 -> 2 -> 3 -> 4 -> 5</code>, then <code>5 -> 4 -> 3 -> 2 -> 1</code>, then the two edge cases: the empty list prints nothing before its label, and a single node is its own reverse. O(n) time and O(1) extra space: three references and no second list. Trace it by hand on 1 -> 2 -> 3 once, writing prev, cur and after at every line, before you trust it.' },
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
        { predict: true, play: `import java.util.LinkedList;
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
}`, caption: 'It prints <code>[Urgent, Ada, Grace, Linus]</code>, then <code>served Urgent, then Ada</code>, then <code>[Grace, Linus]  size 2</code>, and last the two lists holding 4 3 2 1 0 in the same order: adding at the front reverses the order of arrival. java.util.LinkedList is doubly linked (each node also points back) with a tail reference, so both ends are O(1): it is Java’s default queue and deque when you need a list interface too. get(i) on it is still a walk.' },
        { check: "Why is ArrayList usually faster than LinkedList even for inserts at the front?", skill: 'linked-list-cost', options: ["Because Java optimises ArrayList specially", "Because its values sit together in memory and the cache fetches them ahead; each list hop is a wait for memory", "It is not: LinkedList is always faster at the front"], answer: 1, wrong: ["Java gives ArrayList no special treatment here. The difference comes from how the values are laid out in memory, which any array-based structure enjoys.", null, "At the front LinkedList is O(1) against O(n), and for very long lists it can win. But for a few thousand values the array’s layout often beats it, so “always” is wrong; measure."], why: "The table says O(n) against O(1), but a cache-friendly shift of a few thousand values often beats one cache-missing hop. Measure before choosing LinkedList." },
        `<details class="reveal"><summary>Puzzle: a singly linked list of n nodes. What is the cost of (a) removing the last node, (b) removing the last node when a tail reference is kept, (c) checking whether the list has a cycle (some node's next points back to an earlier node)?</summary><p>(a) O(n): you must find the node before the last, and only a walk from the head can. (b) Still O(n): the tail reference finds the last node, but not the one before it, which is what must change; a <em>doubly</em> linked list fixes this. (c) O(n) with O(1) space, by Floyd's tortoise and hare: one reference hops one node at a time, another two at a time; if there is a cycle they meet, if not the hare reaches null.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Following <code>cur.next</code> when <code>cur</code> may be <code>null</code>: a NullPointerException, usually on the empty list or at the last node. Walking to the node you want to remove instead of the node before it. Overwriting <code>cur.next</code> before saving it, in reverse. Forgetting to update <code>size</code>. Treating the empty list as a special case everywhere instead of writing the code so that <code>head == null</code> just works (the <code>addFirst</code> one-liner does). Reaching for <code>LinkedList</code> because the task mentions a list: measure first.</p>` },
        {
          ex: {
            id: 'ds-5-1', skill: 'linked-list-pointers', title: 'addLast and get',
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
            followup: 'Add removeLast(). What do you have to walk to, and why is it harder than addLast? Then add a tail reference and see which of the two operations it helps.',
            failTip: 'A NullPointerException in addLast means the empty list was not handled before the walk. Check that size++ happens in both branches of addLast, and that get checks the range before walking.'
          }
        },
        {
          ex: {
            id: 'ds-5-4', kind: 'parsons', skill: 'linked-list-pointers', title: 'Put it in order: reverse a list',
            prompt: `<p>Build the method</p><pre class="code">static Node reverse(Node head)</pre><p>that reverses a linked list in place and returns the new head. The class <code>Node</code> (with <code>int value</code> and <code>Node next</code>) is given. Turn each arrow round as you walk down the list, keeping hold of the rest of the list before you cut it loose. Two of the blocks do not belong.</p>`,
            prelude: 'class Node {\n    int value;\n    Node next;\n    Node(int value, Node next) { this.value = value; this.next = next; }\n}\n\nclass Chain {\n    static String show(Node h) {\n        String s = "";\n        for (Node c = h; c != null; c = c.next) {\n            s += c.value + " ";\n        }\n        return "[" + s.trim() + "]";\n    }\n}\n',
            lines: ['static Node reverse(Node head) {', '    Node prev = null;', '    Node cur = head;', '    while (cur != null) {', '        Node after = cur.next;', '        cur.next = prev;', '        prev = cur;', '        cur = after;', '    }', '    return prev;', '}'],
            distractors: ['return cur;', 'cur = cur.next;'],
            tests: [
              { setup: '        Node h = new Node(1, new Node(2, new Node(3, null)));', call: 'Chain.show(reverse(h))', expect: '[3 2 1]', name: 'three nodes' },
              { setup: '        Node h = new Node(7, null);', call: 'Chain.show(reverse(h))', expect: '[7]', name: 'one node' },
              { call: 'Chain.show(reverse(null))', expect: '[]', name: 'the empty list' },
              { setup: '        Node h = new Node(4, new Node(8, new Node(15, new Node(16, new Node(23, null)))));\n        h = reverse(h);\n        h = reverse(h);', call: 'Chain.show(h)', expect: '[4 8 15 16 23]', name: 'twice gives back the original' }
            ],
            hints: ['You need three references: prev (the part already turned round, at first null), cur (the node you are on) and after (the rest of the list, saved before you change cur.next).', 'In the loop, save the rest, turn the arrow, then step both references forward: after = cur.next; cur.next = prev; prev = cur; cur = after. When cur is null, prev is the new head. Moving with cur = cur.next after turning the arrow would walk backwards.'],
            followup: 'Trace the loop by hand on a list of three nodes, drawing the arrows after every pass. At which line is the rest of the list in danger of being lost?'
          }
        },
        {
          ex: {
            id: 'ds-5-2', skill: 'linked-list-pointers', title: 'remove and reverse',
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
            followup: 'Write insertAt(int index, int x), using the same walk as get. What does it cost at index 0, and at the last index? Which of the two does an ArrayList find cheaper?',
            failTip: 'If the list prints [5] after reverse, the arrows were turned round but head still points at the old first node: set head = prev at the end. If addLast after reverse loops forever, a node still points at itself: check the order of the four lines in the loop.'
          }
        },
        {
          ex: {
            id: 'ds-5-3', skill: 'linked-list-cost', kind: 'answer', title: 'Hops and shifts',
            prompt: `<p>An <code>ArrayList</code> and a singly linked list (head reference only, no tail) each hold the same 1,000 values. Count the work of each operation as the number of values shifted (array) or nodes hopped past (list), using the costs in this lesson. Give whole numbers.</p>`,
            parts: [
              { label: '(a) Read the value at index 700. Array shifts?', answer: '0', width: '6rem', wrong: [{ match: '700', msg: 'An array reaches index 700 by arithmetic: no values are shifted or visited.' }] },
              { label: '(b) Read the value at index 700. List hops?', answer: '700', width: '6rem', wrong: [{ match: '0', msg: 'There is no arithmetic that finds node 700; the list walks from the head.' }, { match: '1000', msg: 'The walk stops when it reaches index 700.' }] },
              { label: '(c) Insert a value at the front. Array shifts?', answer: '1000', width: '6rem', wrong: [{ match: ['0', '1'], msg: 'Every existing value moves one cell to the right to make room at index 0.' }] },
              { label: '(d) Insert a value at the front. List hops?', answer: '0', width: '6rem', wrong: [{ match: '1000', msg: 'addFirst makes a node whose next is the old head and points head at it: nothing is walked.' }] },
              { label: '(e) Add a value at the back. List hops (no tail reference)?', answer: '999', width: '6rem', wrong: [{ match: '1000', msg: 'The walk starts at the head (index 0) and hops to index 999: 999 hops.' }, { match: '0', msg: 'That is the cost with a tail reference. Without one, the last node must be found by walking.' }] },
              { label: '(f) Remove the value at index 500 (you hold no reference into the list). Array shifts, and list hops? Give the sum of the two numbers.', answer: '998', width: '6rem', wrong: [{ match: '1000', msg: 'Array: the 499 values after index 500 shift left. List: walk to the node before index 500, 499 hops. 499 + 499.' }, { match: ['999', '1001'], msg: 'Array: values at indices 501 to 999 shift: 499. List: walk to index 499, the node before: 499 hops.' }] }
            ],
            hints: ['Array: indexing is free; inserting or removing at index i shifts the values after i. List: reaching index i costs i hops; changing arrows is free once you are there; removing index i needs the node at i − 1.', 'For (f): the array shifts the values at indices 501 to 999 left by one. The list must stand on the node at index 499, so it hops 499 times. Add the two numbers.'],
            solution: `<p>(a) <b>0</b>: arithmetic. (b) <b>700</b> hops. (c) <b>1000</b>: every value shifts right. (d) <b>0</b>. (e) <b>999</b>: from index 0 to index 999. (f) <b>998</b>: the array shifts the 499 values at indices 501–999; the list hops 499 times to reach the node at index 499, whose <code>next</code> is unlinked.</p>`,
            followup: 'Parts (a) and (d) are the two zeros, and they are on opposite sides. Every choice between an array and a list comes down to which zero the program needs more often.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A linked list is nodes holding a value and <code>next</code>; <code>head</code> points at the first; <code>null</code> ends it. Every algorithm on it is the walk <code>for (cur = head; cur != null; cur = cur.next)</code>.</li>
<li>O(1): add or remove at the front, insert or remove after a node in hand, add at the back with a tail. O(n): anything that says "index i" or "find".</li>
<li>To remove a node you must hold the one before it; to reverse you need three references, prev, cur and after, and must save <code>after</code> before turning the arrow.</li>
<li>On modern hardware the array's contiguity wins most races; <code>ArrayList</code> is the default and <code>LinkedList</code> the exception, used for queues and deques. So the answer to the opening question: reach for the list only when the program works at a place it already holds, and for the array whenever it says "the i-th".</li>
<li>The node-and-reference idea is the atom of trees, hash chains and graphs: this lesson is the first time you follow a reference until <code>null</code>, not the last.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-12'],
      standard: 1, title: 'Stacks and queues', summary: 'Two structures defined by what they refuse to do: the stack, where the last thing in is the first out, and the queue, where the first in is the first out; both in an array, the queue as a ring; what each is for; and the library classes that implement them.',
      blocks: [
        `<p>In 1955 two mathematicians in Munich, Friedrich Bauer and Klaus Samelson, were designing a machine that could work out an algebraic formula typed in the ordinary way, with brackets and with multiplication done before addition. The difficulty is that when the machine reads <code>3 + 4 ×</code> it cannot yet do the plus: it has to put the plus aside, wait for the multiplication, and come back. Their answer was a store they called the <em>Keller</em>, the cellar: things go in at the top, and whatever went in last comes out first. The plus goes into the cellar, the times goes in on top of it, the times comes out and is done, then the plus. They patented the idea in 1957. We call the cellar a stack, and every compiler, every calculator and every running program has one.</p>`,
        { photo: 'sushi-plates-stack', caption: 'A stack you can see, at a conveyor-belt sushi restaurant in Taiwan. Each empty plate goes on top, and the only plate you can take off is the last one put on: the cellar that Bauer and Samelson patented, made of plates.' },
        `<p>A stack is the first structure in this course that is defined not by how it is stored but by what it <em>refuses</em> to do. You may only add at the top and only remove from the top. Its twin, the queue, refuses differently: add at the back, remove from the front. Those refusals are the point. A structure that can do less is easier to reason about, and can be made faster, because it only has to be good at a few things. So what can you do, and what can you compute, with a structure that allows so little?</p>
<h2>The stack</h2>
<div class="stmt"><p><span class="kind">Stack.</span> A collection with four operations: <code>push(x)</code> adds <code>x</code> at the top; <code>pop()</code> removes and returns the top item; <code>peek()</code> returns it without removing it; <code>isEmpty()</code>. The last item pushed is the first popped: <em>LIFO</em>, last in, first out.</p>
<p><span class="kind">Cost.</span> Every operation is O(1). That is the contract; an implementation that cannot keep it is not a stack worth having.</p></div>
<p>An array and one integer are enough. The integer, <code>top</code>, is the number of items, which is also the index the next push writes to. Push writes and increments; pop decrements and reads. Nothing is ever shifted. When the array fills, double it, exactly as the growing array of lesson 1 did, and the cost stays O(1) on average. The class below is a whole program, so it runs longer than the other examples. Predict the order in which the six values come back out.</p>`,
        { fig: 'stackqueue', kind: 'stack', caption: 'Eight cells and a top index. Push a few values, pop some, push again: the cells below top are the stack, the cells above it are garbage that nobody reads. Fill it to see what a growing stack would do.' },
        { predict: true, long: true, play: `import java.util.Arrays;

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
}`, caption: 'It prints <code>size 6, top 60</code>, then <code>popped: 60 50 40 30 20 10</code>, then the message from popping the empty stack. The values come out in reverse order: that is the whole behaviour of a stack. Arrays.copyOf makes the bigger array and copies the old one in. Pop does not clear the cell; it just moves top, and the next push overwrites it.' },
        { check: "push 1, push 2, push 3, pop, push 4, pop. What was popped, in order?", skill: 'stack-lifo', options: ["1 then 2", "3 then 4", "3 then 2"], answer: 1, wrong: ["“1 then 2” is what a queue would give: the oldest first. A stack gives back the newest, so the first pop is 3.", null, "3 is right for the first pop, but 4 was pushed before the second pop, so 4 sits on top of 2 and comes off first."], why: "Last in, first out: after pushing 1 2 3, pop gives 3; after pushing 4, pop gives 4." },
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
        `<p>Bauer and Samelson's cellar did arithmetic, and so can yours. Write the formula with each operator <em>after</em> its two operands, which is called postfix or reverse Polish notation: <code>3 4 2 * +</code> means 3 + (4 × 2). Then no brackets are needed and one stack evaluates it: push numbers; on an operator, pop two, apply, push the result. Predict the four answers before you run the code.</p>`,
        { predict: true, play: `import java.util.ArrayDeque;

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
}`, caption: 'It prints 11, 14, 23 and 5: 3 + 4 × 2, then (3 + 4) × 2, then 10 + 2 × 8 − 3, then 100 / 5 / 4. Four formulas, no brackets, one stack. The order of the two pops matters for − and /: the top of the stack is the right-hand operand. Turning ordinary notation into postfix is itself done with a stack (Dijkstra’s shunting-yard algorithm, 1961), which is how a compiler reads 3 + 4 * 2.' },
        `<h2>The queue</h2>
<div class="stmt"><p><span class="kind">Queue.</span> A collection with <code>enqueue(x)</code> (add at the back), <code>dequeue()</code> (remove and return the front), <code>peek()</code> and <code>isEmpty()</code>. The first item in is the first out: <em>FIFO</em>. Java's <code>Queue</code> interface calls them <code>offer</code>, <code>poll</code> and <code>peek</code>.</p>
<p><span class="kind">Cost.</span> O(1) for every operation. Again, the contract.</p></div>
<p>A queue in an array is harder than a stack, and the difficulty is instructive. If the front is always cell 0, then dequeue must shift every remaining item left: O(n), which breaks the contract. The fix is to let the front move. Keep two indices, <code>head</code> for the front and <code>tail</code> for the next free cell at the back, and let both walk rightwards. When one reaches the end of the array it wraps round to cell 0, because the cells at the start have been freed by earlier dequeues. The array is used as a <em>ring</em>. The class below is another whole program; read <code>enqueue</code> and <code>dequeue</code> first, and predict what <code>main</code> prints.</p>`,
        { fig: 'stackqueue', kind: 'queue', caption: 'Enqueue five, dequeue three, enqueue five more: tail wraps round to the cells that head has left behind. The items in order are from head, going round, to tail. Nothing is ever shifted.' },
        { predict: true, long: true, play: `class RingQueue {
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
}`, caption: 'It prints <code>[1, 2, 3]  served 1, 2</code> (Java builds the string from left to right, so the queue is printed before the two dequeues happen), then <code>[3, 4, 5]  size 3</code>, then <code>[3, 4, 5, 6, 7]  size 5</code>, and the values come out in the order they went in, <code>3 4 5 6 7</code>, through two wrap-rounds and one growth. The grow method is the subtle part: it must copy from head, going round, so that the new array holds the queue in order starting at 0.' },
        { check: "Why does a queue in an array need a ring?", skill: 'ring-buffer', options: ["To save memory", "So that dequeue does not shift every item: head moves instead, and wraps round", "Because arrays cannot be resized"], answer: 1, wrong: ["A ring uses the same memory as any array of that size. Its point is time: it avoids the O(n) shift that a dequeue from cell 0 would need.", null, "True, an array cannot be resized, but that is solved by copying into a bigger one, as the stack does. The ring solves a different problem: a dequeue that would shift every item."], why: "If the front were always cell 0, dequeue would be O(n). Letting head and tail walk and wrap keeps every operation O(1)." },
        `<h2>What queues are for</h2>
<p>Anything served in order of arrival: print jobs, requests to a server, messages between parts of a program, the frames of a video waiting to be shown. And one algorithm this course will meet again: breadth-first search, which explores a graph level by level by keeping the frontier in a queue (lesson 13). The library's queue is <code>ArrayDeque</code> again, used from the other end, or <code>LinkedList</code>, which also implements <code>Queue</code>. Predict who is left in a circle of seven children when every third pass puts the holder out.</p>`,
        { predict: true, play: `import java.util.ArrayDeque;
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
}`, caption: 'It prints <code>out: 3  out: 6  out: 2  out: 7  out: 5  out: 1</code>, then <code>left: 4</code>, then <code>[a, b, c] a c [b]</code>. A queue models a circle: moving the front to the back is one pass. ArrayDeque is a double-ended queue, a deque: addFirst/addLast and pollFirst/pollLast, all O(1), in one ring buffer. Used from one end it is a stack, from the other a queue.' },
        { check: "Which Java class should you use for a stack?", skill: 'stack-lifo', options: ["<code>java.util.Stack</code>", "<code>ArrayDeque</code>, with push, pop and peek", "<code>ArrayList</code>"], answer: 1, wrong: ["The name is right, but Stack is a legacy class from 1995, built on Vector, whose methods are synchronised and slower than they need to be. Its own documentation points to ArrayDeque.", null, "An ArrayList can be used as a stack by adding and removing at the end, but it has no push, pop or peek, and nothing stops you using the middle. ArrayDeque offers exactly the stack’s operations."], why: "Stack is a 1995 class with historical slowness; its own documentation says to use ArrayDeque." },
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
            id: 'ds-6-1', skill: 'stack-lifo', title: 'A stack in an array',
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
            followup: 'Add a method min() that returns the smallest value on the stack in O(1) time, however many values there are. A second stack kept beside the first can help.',
            failTip: 'ArrayIndexOutOfBounds on the third push means the array did not grow. If peek returns the wrong value, it is reading cells[top] instead of cells[top − 1].'
          }
        },
        {
          ex: {
            id: 'ds-6-2', skill: 'stack-lifo', title: 'Balanced brackets, strictly',
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
            followup: 'Make the method also say which pair clashed, for example "expected ) but found ]". What does the stack have to hold to make that possible?',
            failTip: 'For "((a)" the answer is 0, not 1: the inner pair closes, the outer bracket at index 0 is the one left open. For "(()" also 0. The unclosed opener is at the bottom of the stack.'
          }
        },
        {
          ex: {
            id: 'ds-6-3', skill: 'ring-buffer', title: 'A ring-buffer queue',
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
            followup: 'Add a method get(int i) that returns the i-th item of the queue (0 is the front) without removing anything, using the same index arithmetic as grow. What does it cost, and why is it not part of the queue contract?',
            failTip: 'If the "grows while wrapped" test prints 4 5 2 3 or similar, grow copied cells 0..n−1 instead of starting from head. If values repeat or vanish, a % is missing on head or tail.'
          }
        },
        {
          ex: {
            id: 'ds-6-4', skill: ['stack-lifo', 'ring-buffer'], kind: 'answer', title: 'Trace the operations',
            prompt: `<p>Work each sequence by hand. For the ring queue, the array has 4 cells and starts with <code>head = tail = 0</code>; it does not grow in these sequences.</p>`,
            parts: [
              { label: '(a) Stack: push 1, push 2, push 3, pop, push 4, pop, pop. Which values were popped, in order? (three numbers, separated by spaces)', answer: '3 4 2', width: '8rem', wrong: [{ match: '1 2 3', msg: 'That is a queue. A stack returns the most recent push.' }, { match: '3 4 1', msg: 'After popping 3 and pushing 4, the stack holds 1 2 4. Popping twice gives 4, then 2.' }] },
              { label: '(b) After the sequence in (a), what single value remains on the stack?', answer: '1', width: '6rem' },
              { label: '(c) Ring queue (4 cells): enqueue 10, 20, 30; dequeue; dequeue; enqueue 40; enqueue 50. What is tail now?', answer: '1', width: '6rem', wrong: [{ match: '5', msg: 'tail wraps: it goes 0, 1, 2, 3, then (3 + 1) % 4 = 0, then 1.' }, { match: '0', msg: 'Five enqueues move tail five times from 0: 1, 2, 3, 0, 1.' }] },
              { label: '(d) In (c), which cell (index) holds the value 50?', answer: '0', width: '6rem', wrong: [{ match: '4', msg: 'There is no cell 4. 40 went into cell 3; tail wrapped to 0 for 50.' }] },
              { label: '(e) In (c), what is head, and what is the queue’s size? Give both numbers separated by a space.', answer: '2 3', width: '8rem', wrong: [{ match: '2 2', msg: 'Five enqueues and two dequeues leave three items: 30, 40, 50.' }] },
              { label: '(f) A queue is built from two stacks as in the puzzle. Enqueue 1, 2, 3, then dequeue once, then enqueue 4, then dequeue everything. What comes out, in order? (four numbers)', answer: '1 2 3 4', width: '10rem', wrong: [{ match: ['3 2 1 4', '1 4 2 3', '1 4 3 2'], msg: 'Stack B holds 3 2 1 (top 1) after the first transfer; 4 waits in A until B is empty. Out: 1, 2, 3, then 4.' }] }
            ],
            hints: ['Draw the four cells and move head and tail with every operation; tail = (tail + 1) % 4. For (f), items move from A to B only when B is empty, and the move reverses them.', 'For (c) to (e): tail moves once for every enqueue, head once for every dequeue, both modulo 4, and the size is the enqueues minus the dequeues.'],
            solution: `<p>(a) <b>3 4 2</b>. (b) <b>1</b>. (c) tail moves 0 → 1 → 2 → 3 → 0 → 1: <b>1</b>. (d) 50 was written at tail = 0: cell <b>0</b>. (e) head moved twice: <b>2</b>; size 5 − 2 = <b>3</b> (30 in cell 2, 40 in cell 3, 50 in cell 0). (f) <b>1 2 3 4</b>: the two-stack queue is still a queue; that is the point of it.</p>`,
            followup: 'If (c) to (e) felt mechanical, good: that mechanical feeling is what O(1) looks like from the inside. No shifting, no searching, just two indices and a remainder.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A stack is push, pop, peek on one end: last in, first out. An array and a top index give O(1) for everything; double when full.</li>
<li>A queue is enqueue at the back, dequeue at the front: first in, first out. In an array it must be a ring, with head and tail that wrap with <code>%</code>, and a grow that copies in queue order.</li>
<li>Stacks: brackets, undo, postfix arithmetic, the call stack. Queues: anything served in arrival order, and breadth-first search.</li>
<li>In Java, <code>ArrayDeque</code> is both (push/pop from one end, offer/poll from the other), and a deque besides. <code>java.util.Stack</code> is a historical mistake.</li>
<li>A structure that refuses to do things is easier to make fast and easier to reason about, and still lets you match brackets, evaluate a formula, undo, and serve requests in order: that answers the opening question. The next lesson is about the stack you never see: the one that holds every method call.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-13'],
      standard: 1, title: 'Recursion', summary: 'A method that calls itself; the base case and the smaller problem; the call stack that makes it work and the overflow that happens without it; recursion against loops; the exponential trap in fib and the memo that fixes it; and the Tower of Hanoi.',
      blocks: [
        `<p>In 1883 a French mathematician, Édouard Lucas, put a puzzle on sale under the name "N. Claus de Siam", an anagram of Lucas d'Amiens, his home town. Three pegs; eight discs of different sizes stacked on one peg, largest at the bottom; move the whole tower to another peg, one disc at a time, never putting a larger disc on a smaller one. The box came with a legend: in a temple in India, priests were moving a tower of sixty-four golden discs by the same rules, and when they finished, the world would end.</p>`,
        { photo: ['hanoi-1884', 'hanoi-bremen'], caption: 'Lucas\u2019s puzzle as a magazine drew it in 1884: the tower of eight discs on peg A, the discs partway through their journey, and the tower rebuilt on peg B. Beside it, a wooden copy on a stall in Bremen, Germany, caught in the middle of a game: no disc sits on a smaller one.' },
        `<p>The puzzle is hard to solve by staring at it and easy to solve by refusing to. To move eight discs, you need the largest disc moved to the target peg, and for that the seven above it must be out of the way on the spare peg. So: move seven discs to the spare peg, move the big one, move the seven discs on top of it. How do you move seven? The same way. The legend's priests, by the way, need 2⁶⁴ − 1 moves; at one a second that is about 585 billion years, so the world is safe.</p>
<p>That way of thinking is called <em>recursion</em>: solve a problem by solving a smaller copy of it, and stop when the copy is small enough to be trivial. You met it in lesson 4, where merge sort sorted an array by sorting its halves. This lesson is about recursion itself: how to write it, how the machine runs it, when it is the right tool and when it is a trap.</p>
<h2>A method that calls itself</h2>
<p>The sum of an array from index <code>i</code> onwards is <code>a[i]</code> plus the sum from <code>i + 1</code> onwards. The sum from past the end is 0. That is a complete definition, and it is also a complete program. Predict what the three methods below print before you run them.</p>`,
        { predict: true, play: `public class Main {
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
}`, caption: 'It prints 31 (the sum of the eight numbers), then <code>120 2432902008176640000</code>, then <code>true true false true</code>: the empty string reads the same both ways. Three recursive methods, each with the same shape: a base case that answers directly, and a recursive case that does one step and hands the rest to a smaller call. factorial(20) is the largest that fits in a long; 21! overflows.' },
        { check: "What are the two things every recursive method needs?", skill: 'base-case', options: ["A loop and a counter", "A base case, and a recursive case that moves towards it", "Two parameters"], answer: 1, wrong: ["Recursion is an alternative to a loop, not an addition to it: a recursive method repeats by calling itself, with no loop and no counter needed.", null, "The number of parameters does not matter: sum has two, factorial has one. What matters is a case that stops the calls, and a call on a smaller input."], why: "Without a reachable base case the calls never stop: StackOverflowError." },
        `<div class="stmt"><p><span class="kind">Recursion.</span> A method that calls itself on a smaller input. It needs a <em>base case</em>, an input small enough to answer without a call, and a <em>recursive case</em> that makes progress towards it: every call must bring the input closer to the base case.</p>
<p><span class="kind">The leap of faith.</span> When writing the recursive case, assume the recursive call works, and use its answer. Do not try to trace it in your head; that is the machine's job. Check only that the base case is right and that each call gets smaller.</p></div>
<p>The figure shows what the machine does with <code>sum</code>. Each call gets a frame on the call stack (lesson 7), holding its own <code>i</code> and the place to continue when the call below it returns. Frames pile up on the way down to the base case and unwind on the way back, each adding its item to the answer it received.</p>`,
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
}`, expectError: true, caption: 'The site’s interpreter stops after a few hundred frames (the exact number depends on the browser); a real JVM manages about ten thousand before the same error, more if asked. Either way the fix is the same: a base case that is reached. Here, if (n == 0) return 0; at the top.' },
        `<p>That limit matters for a design decision. A recursion that goes <code>n</code> deep, like <code>sum</code> above, is fine for an array of a hundred, already too deep for the interpreter on this site at a thousand (a real JVM copes with that), and fatal for an array of a million. A loop has no such limit. The rule of thumb: recursion is for problems whose depth is small, which means problems that <em>halve</em> rather than problems that <em>decrement</em>. Binary search and merge sort go log n deep; summing an array one element at a time goes n deep, and should be a loop. Predict where the code below finds 123456 in a sorted array whose cells hold 0, 2, 4, …, and what it returns for 7.</p>`,
        { predict: true, play: `public class Main {
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
}`, caption: 'It prints <code>61728 -1</code> (the values are twice their indexes, so 123456 is at index 61728, and 7 is odd, so it is absent) and then 999999000000, the sum of the even numbers below two million. A million sorted values, found in about 20 recursive calls: halving means the stack never gets deep. The sum of a million values is a loop, because the recursive sum would need a million frames.' },
        { check: "Which problem should be written recursively?", skill: 'recursion-fit', options: ["Summing a million-element array", "Binary search: it halves, so the stack stays log n deep", "Counting the characters in a string"], answer: 1, wrong: ["Summing one element at a time recurses a million frames deep, and the call stack runs out long before that. A loop does the job with no depth at all.", null, "Counting characters is a walk along n things, like summing: recursing one character at a time goes n deep for no gain. A loop (or length()) does it."], why: "Recursion that decrements goes n deep and risks the stack; recursion that halves goes log n deep and is the natural form." },
        `<h2>The exponential trap</h2>
<p>The Fibonacci numbers are defined recursively: each is the sum of the two before, starting 0, 1. Written straight from the definition, the method is three lines, correct, and catastrophically slow. The figure shows why: <code>fib(5)</code> calls <code>fib(4)</code> and <code>fib(3)</code>; <code>fib(4)</code> calls <code>fib(3)</code> again; the same small problems are solved over and over, and the number of calls roughly doubles with each increase in <code>n</code>. Before you run the code below, predict how many calls <code>fib(25)</code> makes: hundreds, thousands, or hundreds of thousands?</p>`,
        { fig: 'callstack', fn: 'fib', n: 5, caption: 'fib(5): fifteen calls for a five-line answer, and fib(2) is computed three times. Set n to 7 and play it through: 41 calls. Every +1 on n multiplies the work by about 1.6.' },
        { predict: true, play: `public class Main {
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
}`, caption: 'It prints 177, 1,973, 21,891 and 242,785 calls for n = 10, 15, 20 and 25, and then <code>fibMemo(90) = 2880067194370816120</code> with 179 calls. Five more on n, about eleven times the calls: fib(25) takes a quarter of a million. The memoised version remembers every answer and makes 179 calls for fib(90), about two per n. Same definition, same recursion; the only change is that no sub-problem is solved twice.' },
        { check: "Plain fib(30) makes about 2.7 million calls. With a memo, about how many?", skill: 'memoization', options: ["About 60", "About 30,000", "Still 2.7 million"], answer: 0, wrong: [null, "The memo does far better than that: it cuts the work to one computation for each value of n, about two calls each, so about 60 calls, not thousands.", "A memo does change the work: once fib(k) is stored, asking for it again is a lookup and not a fresh pair of calls. The tree of repeated calls never grows."], why: "Each n from 2 to 30 is computed once, with two calls each: 1 + 2 × 29 = 59. The cost drops to the number of distinct sub-problems." },
        `<div class="stmt"><p><span class="kind">Memoisation.</span> If a recursion solves the same sub-problem more than once, store each answer the first time and look it up after. The cost drops from the number of calls to the number of <em>distinct</em> sub-problems. This is the first step towards dynamic programming, which a later course treats properly.</p></div>
<h2>The Tower of Hanoi</h2>
<p>Lucas's puzzle is the recursion that cannot be written any other way without a stack of your own. To move <code>n</code> discs from peg A to peg C using B as the spare: move <code>n − 1</code> discs from A to B (using C as the spare), move the last disc from A to C, move the <code>n − 1</code> discs from B to C (using A as the spare). The base case is zero discs: do nothing. Predict how many moves three discs take, and how many eight take.</p>`,
        { predict: true, play: `public class Main {
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
}`, caption: 'It prints the seven moves for three discs, then <code>3 discs: 7 moves</code>, then 255, 1023, 65535 and 1048575 moves for 8, 10, 16 and 20 discs (the last line is typed text, not computed). Seven moves for three discs, printed; 2ⁿ − 1 in general, and the method makes that many moves because it has to: there is no shorter solution. Twenty discs is a million moves, which already takes the interpreter a moment; thirty would be a billion. The count obeys T(n) = 2T(n − 1) + 1, which solves to 2ⁿ − 1.' },
        `<h2>Recursion or a loop?</h2>
<table class="growth-table"><thead><tr><th>Shape of the problem</th><th>Write it as</th><th>Why</th></tr></thead><tbody>
<tr><td>Walk along n things once (sum, find, count)</td><td>a loop</td><td>recursion goes n deep for no gain</td></tr>
<tr><td>Halve the problem (binary search, merge sort, quicksort)</td><td>recursion</td><td>log n deep, and the recursive version is the clear one</td></tr>
<tr><td>Branch into several sub-problems (Hanoi, trees, permutations)</td><td>recursion</td><td>a loop would need its own explicit stack to do the same</td></tr>
<tr><td>Sub-problems repeat (fib, many counting problems)</td><td>recursion with a memo, or a loop that builds a table</td><td>exponential otherwise</td></tr>
</tbody></table>
<p>Every recursion can be turned into a loop with an explicit stack, because that is what the machine does anyway; and every loop can be written as a recursion. Choose by clarity and by depth. Trees, the subject of lesson 11, are where recursion stops being a choice and becomes the natural language: a tree is a node with smaller trees hanging from it, and almost everything you do to one is "do it to the left subtree, do it to the right subtree".</p>
<details class="reveal"><summary>Puzzle: <code>static int f(int n) { if (n == 0) return 0; return f(n / 2) + n % 2; }</code>. What does f compute? How deep does it go for n = 1,000,000?</summary><p>The number of 1 bits in the binary form of n: the last bit is <code>n % 2</code>, the rest are in <code>n / 2</code>. It halves, so it goes about log₂ n deep: 20 frames for a million. <code>f(1000000)</code> is 7, because 1,000,000 = 11110100001001000000 in binary.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> A base case that comes <em>after</em> the recursive call, so it is never reached. An argument that does not shrink (<code>f(n)</code> calling <code>f(n)</code>, or <code>search(lo, hi)</code> calling <code>search(lo, mid)</code> when <code>mid == hi</code>). Forgetting to <code>return</code> the result of the recursive call, so the method returns its default. Using <code>int</code> for factorial, which overflows at 13. Tracing the recursion by hand instead of trusting it. A memo that uses 0 for "unknown" when 0 is a possible answer (fib is safe only because fib(0) is never asked for by a larger call that needs a non-zero).</p>` },
        {
          ex: {
            id: 'ds-7-1', skill: 'base-case', title: 'Fast power',
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
            followup: 'Use power to print 2 to the power n for n from 0 to 62 and check each against 1L << n. Then call power(2, 63) and explain the answer you get.',
            failTip: 'If the last test overflows the stack, the odd case is being used for every step (exp − 1 each time); check that the even branch halves. If 2^62 is wrong, the multiplication is happening in int: base is a long.'
          }
        },
        {
          ex: {
            id: 'ds-7-2', skill: 'recursion-fit', title: 'Tower of Hanoi',
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
            followup: 'Change hanoi to count the moves without printing them, and tabulate the counts for 1 to 30 discs. How long would 40 discs take at one move a second?',
            failTip: 'For two discs the first move is disc 1 to the SPARE peg (B), not to C: the first recursive call passes via as its target. If the count is wrong, make sure both recursive results are added, plus 1.'
          }
        },
        {
          ex: {
            id: 'ds-7-3', skill: 'memoization', title: 'Count the paths',
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
            followup: 'Put a rock on the grid: add a boolean[][] blocked, and return 0 for any route that steps on it. What happens to the memo’s rule that 0 means “not yet computed”?',
            failTip: 'If paths(18, 18) times out, the memo is not being read before recursing, or not being written. If the large answers are negative or wrong, the memo is an int array.'
          }
        },
        {
          ex: {
            id: 'ds-7-4', skill: 'base-case', kind: 'answer', title: 'Depth and count',
            prompt: `<p>Count calls and frames. "Calls" means the total number of times the method is entered, including the first; "depth" means the greatest number of frames on the stack at once.</p>`,
            parts: [
              { label: '(a) sum(a, 0) on an array of 100 values (the version in this lesson): how many calls, and how deep? Give the two numbers separated by a space.', answer: '101 101', width: '8rem', wrong: [{ match: '100 100', msg: 'The base case, sum(a, 100), is a call too, and it sits on top of the other 100 frames.' }] },
              { label: '(b) Plain fib(10): how many calls?', answer: '177', width: '6rem', wrong: [{ match: ['55', '89'], msg: 'That is a Fibonacci number, not the call count. calls(n) = 1 + calls(n − 1) + calls(n − 2), with calls(0) = calls(1) = 1: 1, 1, 3, 5, 9, 15, 25, 41, 67, 109, 177.' }] },
              { label: '(c) Plain fib(10): how deep does the stack get?', answer: '10', width: '6rem', wrong: [{ match: '177', msg: 'That is the count. Only the leftmost chain fib(10) → fib(9) → … → fib(1) is on the stack at once.' }, { match: ['9', '11'], msg: 'fib(10), fib(9), …, fib(1): ten frames.' }] },
              { label: '(d) fibMemo(40), with an empty memo: how many calls? (Count exactly: each n from 2 to 40 is computed once, and each computation makes two calls; the second of each pair is answered from the memo or by a base case.)', answer: '79', width: '6rem', wrong: [{ match: '40', msg: 'Each of the 39 computed values (n = 2..40) makes two calls, and there is the first call itself: 1 + 2 × 39.' }, { match: '81', msg: '1 + 2 × 39 = 79: the values computed are n = 2 to 40, which is 39 of them.' }] },
              { label: '(e) hanoi(12): how many moves, and how deep, counting only the frames for n ≥ 1 (the n = 0 call returns at once)?', answer: '4095 12', width: '8rem', wrong: [{ match: '4096 12', msg: '2¹² − 1 = 4095.' }, { match: '4095 13', msg: 'Frames for n = 12 down to 1: twelve of them.' }] },
              { label: '(f) power(2, 1000) from this lesson’s exercise, by halving: about how deep? (Choose the nearest: 10, 20, 500, 1000)', answer: '20', width: '6rem', wrong: [{ match: '1000', msg: 'That is the decrementing version. Halving takes 10 even steps, each possibly preceded by an odd step: at most about 2 log₂ 1000 ≈ 20.' }, { match: '10', msg: 'Close: log₂ 1000 ≈ 10 even steps, but odd exponents add a step each; the bound is about 20.' }] }
            ],
            hints: ['Calls count every entry; depth counts the longest chain of unfinished calls. For fib the chain is the leftmost path; the count follows calls(n) = 1 + calls(n − 1) + calls(n − 2).', 'For (d): the first call is fibMemo(40) itself; each value from 2 to 40 is computed once, and each computation makes two calls. For (e): the stack holds one frame for each disc size from 12 down to 1.'],
            solution: `<p>(a) <b>101 101</b>: indices 0 to 100, all on the stack at once at the bottom. (b) <b>177</b>. (c) <b>10</b>. (d) <b>79</b>: the first call, then two calls for each of the 39 values computed. (e) <b>4095 12</b>. (f) <b>20</b>: 1000 in binary has 10 bits, and each bit costs at most two calls.</p>`,
            followup: 'Parts (b) and (d) are the whole argument for memoisation in two numbers: 177 against 79 at n = 10, and at n = 40 it is 331 million against 79.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>Recursion: a base case that answers directly, and a recursive case that does one step and calls itself on a smaller input. Trust the call; check the base case and the shrinking.</li>
<li>Each call is a frame on the call stack. Depth costs memory, and a missing or unreachable base case is a StackOverflowError.</li>
<li>Halving problems (search, sorting) recurse log n deep and should be recursive. Walking n things recurses n deep and should be a loop.</li>
<li>Repeated sub-problems make a recursion exponential; a memo makes it linear. fib(25): 243 thousand calls plain, 49 with a memo.</li>
<li>Hanoi takes 2ⁿ − 1 moves and no clever idea can reduce that; branching recursions are where loops need a stack of their own. And it answers the story's question: to move seven discs, move six, move the big one, move six again.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standard: 1,
      standards: ['3A-DA-10', '3B-AP-12', '3B-AP-11'],
      title: 'Hash tables', summary: 'Finding a key in about one step: a hash function that turns a key into an index, a table of buckets, collisions and chaining, the load factor and the doubling that keeps chains short, why "about one step" is an average, and when to use HashMap instead of writing your own.',
      blocks: [
        `<p>In 2003 two computer scientists at Rice University, Scott Crosby and Dan Wallach, published a paper with a plain title: "Denial of Service via Algorithmic Complexity Attacks". Its point was uncomfortable. Programs everywhere kept their data in hash tables, which find a key in about one step, and "about one step" is an <em>average</em>. Anyone who knows how a table decides where a key goes can choose keys that all go to the same place, and then the table is no faster than a list. At first little changed. Then in December 2011, at a conference in Berlin, Alexander Klink and Julian Wälde showed that the same trick worked against most of the web platforms of the day, among them PHP, Java, Python and Ruby.</p>
<p>A web server keeps the parameters of each request it receives in a hash table. A request whose parameter names had all been chosen to collide made the server walk one ever-longer chain, and keep a processor busy for far longer than the request took to send. One fix was to make the hash function unpredictable: each run starts with a secret random number that is mixed into every hash, so that an attacker cannot know which keys will collide (Python, for one, does this by default now). So how can a table find a key without looking at the other keys, and how can a table that is usually instant be made slow on purpose?</p>
<h2>Finding by key</h2>
<p>A program keeps 100,000 names, each with a phone number. To find Ada's number, linear search (lesson 2) compares the names one by one: up to 100,000 steps, O(n). Keeping the names sorted lets binary search finish in at most 17 steps, but now every insertion shifts half the array (lesson 1). What we would like is the array's own trick: reach any slot in one step, however long the array is. An array does that when the key is a whole number, because the key <em>is</em> the index.</p>
<p>Some keys can be turned into indices at once. A letter is one of 26, so a table of 26 slots can use the letter, minus <code>'a'</code>, as the slot number.</p>`,
        { predict: true, play: `public class Main {
    public static void main(String[] args) {
        String word = "banana";
        int[] count = new int[26];                      // one slot per letter: the key IS the index
        for (int i = 0; i < word.length(); i++) {
            count[word.charAt(i) - 'a']++;              // 'a' gives 0, 'b' gives 1, ... no searching
        }
        for (int k = 0; k < 26; k++) {
            if (count[k] > 0) System.out.println((char) ('a' + k) + " " + count[k]);
        }
        System.out.println("n appears " + count['n' - 'a'] + " times");
    }
}`, caption: 'Three a, one b and two n, printed in the order of the slots. Finding how many times n appears took one step: <code>count[\'n\' - \'a\']</code>. Nothing was searched, and 26 slots cost the same however long the word is. Change the word, and add a <code>count[...]++</code> for capital letters: what goes wrong with <code>\'B\' - \'a\'</code>?' },
        `<div class="stmt"><p><span class="kind">Direct addressing.</span> When every possible key is a small whole number, keep an array with one slot per key. Insert, find and remove are each one step: O(1).</p></div>
<p>It does not scale to words. There are 26⁸ = 208,827,064,576 lowercase words of just eight letters, and no computer has a slot for each. The way out is to keep a table of modest size and to use a function that squeezes any key into the range of its indices.</p>
<h2>Keys into numbers</h2>
<div class="stmt"><p><span class="kind">Hash function.</span> A function that turns a key into an <code>int</code>, its <em>hash code</em>. The same key always gives the same number; equal keys give equal numbers; different keys should <em>usually</em> give different numbers, spread out evenly. The table then uses <code>index = hash code mod table length</code>.</p>
<p><span class="kind">String.hashCode.</span> For a string <code>s</code> of <code>n</code> characters: <code>s[0]·31ⁿ⁻¹ + s[1]·31ⁿ⁻² + … + s[n−1]</code>, worked out in <code>int</code> arithmetic. Long strings overflow, so the result wraps round and can be negative.</p></div>
<p>For "cat" that is (99·31 + 97)·31 + 116 = 98262, because the character codes of c, a and t are 99, 97 and 116. Every character changes the result and so does the order: "tac" gets a different number. Java uses 31, a small odd number, because it mixes well and <code>31·h</code> is cheap to compute.</p>
<p>The step after the hash is the one that trips people up. Java's <code>%</code> keeps the sign of the left operand, so <code>-7 % 8</code> is <code>-7</code>, and a negative index throws an exception.</p>`,
        { predict: 'One of these three words has a negative hash code. Which one, and what does h % 8 give for it?', play: `public class Main {
    public static void main(String[] args) {
        String[] words = {"cat", "owl", "elephant"};
        for (String w : words) {
            int h = w.hashCode();
            System.out.println(w + ": hash " + h + ", h % 8 = " + (h % 8) + ", floorMod = " + Math.floorMod(h, 8));
        }
        int byHand = (99 * 31 + 97) * 31 + 116;         // 'c', 'a', 't'
        System.out.println("cat by hand: " + byHand);
    }
}`, caption: '"elephant" has eight characters, and 31⁷ is already about 27 billion, so the sum overflowed an int and wrapped to −5491951. Then <code>h % 8</code> is −7, not a bucket, while <code>Math.floorMod(h, 8)</code> is 1. Hash codes are for hashing: never rely on one being positive.' },
        `<p>Two more ways to get it wrong. <code>Math.abs(h) % n</code> looks fine, but <code>Math.abs(Integer.MIN_VALUE)</code> is still negative, since an <code>int</code> has no +2147483648; and <code>"polygenelubricants".hashCode()</code> is exactly <code>Integer.MIN_VALUE</code>. The safe forms are <code>Math.floorMod(h, n)</code> and <code>(h &amp; 0x7fffffff) % n</code>, which clears the sign bit first. (Java's own <code>HashMap</code> keeps its length a power of two and masks the bits with <code>h &amp; (length − 1)</code>, a cheaper way to do the same job.)</p>`,
        { check: "A table has 8 buckets. Which expression always gives a legal index 0 to 7, whatever the hash code h is?", skill: 'hash-index', options: ["<code>h % 8</code>", "<code>Math.abs(h) % 8</code>", "<code>Math.floorMod(h, 8)</code>"], answer: 2, wrong: ["<code>%</code> keeps the sign of h: for a hash code of −13 it gives −5, and <code>table[-5]</code> throws an ArrayIndexOutOfBoundsException. Hash codes are often negative.", "It works for −13 (13 % 8 is 5), and nearly always. But <code>Math.abs(Integer.MIN_VALUE)</code> is still negative, and some keys really do hash to that. A rule that fails for one key in four billion is a bug someone can aim at.", null], why: "floorMod gives 0 to n − 1 for every int. <code>(h &amp; 0x7fffffff) % n</code> also works: it clears the sign bit before the remainder." },
        `<h2>Buckets and chains</h2>
<p>Squeezing many possible keys into a few indices has a price: two keys will sometimes get the same index. That is a <em>collision</em>, and it cannot be avoided, because there are more possible keys than buckets. It happens sooner than people expect: with 365 buckets, 23 keys are already more likely than not to include a collision (the birthday problem).</p>
<div class="stmt"><p><span class="kind">Hash table with chaining.</span> An array of <em>buckets</em>; each bucket holds a linked list (lesson 6) of the keys whose index is that bucket. <b>put</b>: find the bucket by <code>index = floorMod(hash, length)</code>, walk its chain, replace the value if the key is there, otherwise add a node. <b>get</b>: find the bucket, walk its chain comparing keys with <code>equals</code>. The cost is the length of one chain, not the number of keys.</p></div>
<p>Insert some words into the table below, one at a time, and step through each insertion: the hash, the index, the collision when two keys meet. Words that share a bucket join its chain, at the front.</p>`,
        { fig: 'hashtable', caption: 'Insert cat, dog, bee, owl, fox, ant in that order (the Next word button fills them in). The fourth word, owl, lands in the bucket where dog already sits: a collision, and the chain is now two long. Then Search for owl and for emu, and count the comparisons.' },
        `<p>The same table in Java is two short classes, built from the node of lesson 6. The program puts the six words in and prints each bucket.</p>`,
        { long: true, predict: 'Which buckets will hold more than one key? (The hash codes are cat 98262, dog 99644, bee 97410, owl 110468, fox 101583, ant 96743; the figure above will tell you.)', play: `class Node {
    String key;
    int value;
    Node next;
    Node(String key, int value, Node next) { this.key = key; this.value = value; this.next = next; }
}

class Table {
    Node[] buckets = new Node[8];
    int size = 0;

    int index(String key) { return Math.floorMod(key.hashCode(), buckets.length); }

    void put(String key, int value) {
        int i = index(key);
        for (Node n = buckets[i]; n != null; n = n.next) {
            if (n.key.equals(key)) { n.value = value; return; }    // already here: replace the value
        }
        buckets[i] = new Node(key, value, buckets[i]);              // new key: add to the front of the chain
        size++;
    }

    int get(String key) {                                           // -1 when the key is absent
        for (Node n = buckets[index(key)]; n != null; n = n.next) {
            if (n.key.equals(key)) return n.value;
        }
        return -1;
    }
}

public class Main {
    public static void main(String[] args) {
        Table t = new Table();
        String[] words = {"cat", "dog", "bee", "owl", "fox", "ant"};
        for (int i = 0; i < words.length; i++) t.put(words[i], i + 1);
        for (int i = 0; i < t.buckets.length; i++) {
            String line = i + ":";
            for (Node n = t.buckets[i]; n != null; n = n.next) line += " " + n.key;
            System.out.println(line);
        }
        t.put("dog", 40);
        System.out.println(t.get("dog") + " " + t.get("owl") + " " + t.get("emu") + " size " + t.size);
    }
}`, caption: 'Buckets 4 and 7 hold two keys each; 0, 1, 3 and 5 are empty. owl is in front of dog because it came later and was added at the front. Putting dog again replaced its value (the size stayed 6), and get("emu") walked an empty bucket and gave −1. Change the words and see which pairs collide.' },
        { check: "<code>get</code> for the key emu finds bucket 4, which holds the chain owl, dog. What does it do?", skill: 'hash-chains', options: ["Returns owl's value, since the bucket was found by hashing emu", "Compares emu with owl, then with dog, reaches the end of the chain and reports that emu is absent", "Moves on to bucket 5 and looks there"], answer: 1, wrong: ["The hash only says <em>where to look</em>. Other keys share that bucket, so <code>get</code> must compare keys with <code>equals</code>; without that, every absent key would return somebody else's value.", null, "Trying the next bucket is a different design, open addressing (below). A chained table never leaves the bucket: the chain is the whole search."], why: "A bucket is a short list. get compares keys down the chain with equals, and stops at the match or at the end: the work is the length of one chain." },
        `<h2>Growing the table</h2>
<p>A chain is only short while the table is not crowded. Put a million keys into 8 buckets and every chain holds about 125,000 of them: a table of the right shape that is no better than a list. The measure is the <em>load factor</em>, the number of keys divided by the number of buckets, which is also the average length of a chain.</p>
<div class="stmt"><p><span class="kind">Load factor and resizing.</span> load factor = keys ÷ buckets. When an insertion pushes it over a limit (0.75 is Java's choice), the table <b>doubles</b>: a new array twice as long, and <em>every</em> key placed again, because the index depends on the table's length. The chains halve in length, on average, each time.</p></div>
<p>Placing every key again sounds expensive: O(n) in one insertion. But it is the dynamic array of lesson 1 over again: the table doubles only after it has doubled its keys, so the re-placing work is spread over all the insertions that came before it. Count it for tables that grow from 8 buckets.</p>`,
        { predict: 'About how many keys are re-placed per insert, on average, when 1000 keys are added one by one?', play: `public class Main {
    public static void main(String[] args) {
        for (int n : new int[] {10, 100, 1000, 100000}) {
            int buckets = 8, resizes = 0;
            long replaced = 0;                          // keys re-placed by all the resizes together
            for (int size = 1; size <= n; size++) {     // size = how many keys are in the table
                if (size > 0.75 * buckets) {            // too full: double, and place every key again
                    buckets *= 2;
                    resizes++;
                    replaced += size;
                }
            }
            System.out.printf("%6d keys: %6d buckets, %2d resizes, %6d re-placed, %.2f per insert%n",
                              n, buckets, resizes, replaced, (double) replaced / n);
        }
    }
}`, caption: 'Between 0.7 and 2 re-placements per insert, and never more than 2, however many keys: 1000 keys cause 8 resizes and 1538 re-placements, and 100000 keys cause 15 resizes and 196617. The total is always under twice the number of keys, which is why a hash table\'s put is O(1) <em>amortised</em>. A single put now and then is slow; the average is not.' },
        { check: "A table with 8 buckets holds 6 keys and its limit is a load factor of 0.75. A seventh key is added. What happens?", skill: 'hash-chains', options: ["Nothing: seven keys still fit in eight buckets", "The table doubles to 16 buckets and every key is placed again, its index worked out afresh", "The table doubles to 16 buckets and the old chains are copied across to the same positions"], answer: 1, wrong: ["With chains the buckets never run out, so \"fits\" is the wrong question. The load factor is the question: 7/8 = 0.88 is over 0.75, so the chains are, on average, longer than the table allows.", null, "The index is the hash code mod the number of buckets, so it changes when the number of buckets does: a key that was in bucket 3 may belong in bucket 11 now. Copying the chains across would leave keys where <code>get</code> will not look."], why: "The index depends on the table's length, so doubling means working out every key's index again. That is the O(n) step, paid once per doubling." },
        `<h2>Bad hashes and the library</h2>
<p>With a good hash function the keys spread out, every chain is short, and put and get take O(1) <em>on average</em>. The word that matters is "average". A hash function can be bad by accident: the length of a word is a number, it is the same every time, and it puts all the three-letter words into one bucket. (Choose "length of the word" in the figure above and insert three words: the table is a list in disguise, and a search walks it. That is O(n) per operation, the <em>worst case</em>.) Or it can be bad on purpose, which is the story this lesson began with.</p>
<p>The trick behind the 2011 attacks on Java is small enough to run. In <code>String.hashCode</code>, "Aa" and "BB" give the same number, because <code>'A'</code> is 65, <code>'a'</code> is 97 and <code>'B'</code> is 66: 65·31 + 97 = 66·31 + 66 = 2112. And if two strings have the same hash code, following each of them with the same text leaves their hash codes equal. So every string made of ten blocks, each "Aa" or "BB", has one hash code: 2¹⁰ = 1024 different keys that all collide.</p>`,
        { predict: 'How many different hash codes do those 1024 keys have?', play: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("Aa".hashCode() + " " + "BB".hashCode());
        ArrayList<String> keys = new ArrayList<>();
        for (int mask = 0; mask < 1024; mask++) {          // ten blocks, each "Aa" or "BB": 1024 keys
            StringBuilder sb = new StringBuilder();
            for (int b = 0; b < 10; b++) sb.append((mask >> b & 1) == 0 ? "Aa" : "BB");
            keys.add(sb.toString());
        }
        HashSet<Integer> codes = new HashSet<>();
        for (String k : keys) codes.add(k.hashCode());
        System.out.println(keys.size() + " keys, " + codes.size() + " different hash code");
        System.out.println(keys.get(0) + " " + keys.get(1) + " " + keys.get(1023));

        HashMap<String, Integer> map = new HashMap<>();
        for (int i = 0; i < keys.size(); i++) map.put(keys.get(i), i);
        System.out.println(map.size() + " " + map.get("BBAaAaAaAaAaAaAaAaAa") + " " + map.containsKey("Aa"));
    }
}`, caption: 'One hash code for all 1024 keys. In a table that hashed them naively all 1024 would share one chain, and inserting them would take about 1024 × 1023 / 2 comparisons, half a million; twenty blocks would give a million keys and half a trillion comparisons. The library map still gives right answers (1024 keys, the key BBAa… is number 1, "Aa" is not in it): collisions slow a table down, they do not make it wrong. Java 8 and later also turn a very long chain into a balanced tree (lesson 11) to limit the harm.' },
        `<p>Defences: a hash with a secret random seed (the fix from the story); limits on how many parameters or keys a server accepts; and chains that turn into trees. You choose none of these when you use the library, which is a reason to use it.</p>
<div class="stmt"><p><span class="kind">The equals and hashCode contract.</span> If <code>a.equals(b)</code> then <code>a.hashCode() == b.hashCode()</code>. So a class that overrides <code>equals</code> must override <code>hashCode</code> too, from the same fields; otherwise two equal objects land in different buckets and a <code>HashSet</code> cannot find one by the other.</p></div>`,
        { code: `class Point {
    final int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }

    public boolean equals(Object o) {
        if (!(o instanceof Point)) return false;
        Point p = (Point) o;
        return x == p.x && y == p.y;
    }
    public int hashCode() { return 31 * x + y; }      // built from the same fields as equals
}`, caption: 'Two Point objects with the same x and y are equal and have the same hash code. A different hash code for equal points would break every HashSet&lt;Point&gt;.' },
        `<p>Chaining is one design. <em>Open addressing</em> keeps the keys in the array itself: when a slot is taken, try the next, and the next, until a free one is found. It uses less memory and is friendlier to the processor's cache, and Python's dictionaries work this way; Java's <code>HashMap</code> chains. Both have the same shape: a hash, an index, a short search, and a table that grows.</p>
<p>When should you write a hash table yourself? Almost never: <code>HashMap&lt;K, V&gt;</code> and <code>HashSet&lt;E&gt;</code> (SC 106 lesson 13) are this lesson with the details done and tested. Use them for what they are good at, and notice what they do not give you.</p>
<table class="growth-table"><thead><tr><th>Need</th><th>Unsorted array or list</th><th>Sorted array</th><th>HashMap or HashSet</th></tr></thead><tbody>
<tr><td>Find a key</td><td>O(n)</td><td>O(log n)</td><td>O(1) on average</td></tr>
<tr><td>Insert a key (no duplicates)</td><td>O(n): look first</td><td>O(n): shift</td><td>O(1) on average</td></tr>
<tr><td>Remove a key</td><td>O(n)</td><td>O(n)</td><td>O(1) on average</td></tr>
<tr><td>Go through the keys in sorted order</td><td>sort first: O(n log n)</td><td>O(n)</td><td>not possible; sort the keys, or use a tree (lesson 11)</td></tr>
<tr><td>Find the smallest key</td><td>O(n)</td><td>O(1)</td><td>O(n): look at every key (a heap, lesson 12, does it in O(1))</td></tr>
</tbody></table>
<p>The order in which a <code>HashMap</code> prints its keys comes from the hash codes and the table size. The site's interpreter reproduces Java's order exactly, but it is not something to rely on: it can change with the keys, with the Java version, and with one added key that makes the table double. If order matters, use <code>TreeMap</code> or <code>LinkedHashMap</code>.</p>
<details class="reveal"><summary>Puzzle: why does a table double its length instead of growing by a fixed 100 buckets each time?</summary><p>Adding a fixed amount means a resize after every 75 more keys, each placing all the keys again: the total work for n keys grows like n²/150, quadratic, and per insert it is O(n). Doubling means the sizes of the re-placements add up to under 2n, so the cost per insert is O(1) on average: the same argument that made the dynamic array of lesson 1 work.</p></details>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Using <code>h % n</code> or <code>Math.abs(h) % n</code> for the index. Comparing keys with <code>==</code> instead of <code>equals</code> when walking a chain. Forgetting that <code>put</code> must first look for the key, so that the same key does not get two nodes. Forgetting to place every key again after doubling (copying the old chains over). Overriding <code>equals</code> without <code>hashCode</code>. Mutating a key after it has been put in a table, so that its hash code, and its bucket, change. Relying on the order in which a <code>HashMap</code> gives its keys.</p>` },
        {
          ex: {
            id: 'ds-8-1', skill: 'hash-index', title: 'Which bucket?',
            prompt: `<p>Write</p><pre class="code">static int bucketOf(String key, int buckets)</pre><p>that returns the index, from <code>0</code> to <code>buckets - 1</code>, of the bucket for <code>key</code>. Work out the hash code yourself with the formula from the lesson: start with <code>h = 0</code>, and for each character set <code>h = 31 * h + c</code>, in <code>int</code> arithmetic so that it wraps round just as Java's does. Then use <code>Math.floorMod</code>. Do not call <code>hashCode()</code>.</p>`,
            starter: `static int bucketOf(String key, int buckets) {\n    int h = 0;\n    // for each character c of key: h = 31 * h + c\n    // then turn h into an index 0 .. buckets - 1\n    return 0;\n}`,
            solution: `static int bucketOf(String key, int buckets) {\n    int h = 0;\n    for (int i = 0; i < key.length(); i++) {\n        h = 31 * h + key.charAt(i);\n    }\n    return Math.floorMod(h, buckets);\n}`,
            mustNotContain: [{ re: /hashCode/, msg: 'Work out the hash yourself with a loop: do not call hashCode().' }],
            hints: ['A loop over the characters: for (int i = 0; i < key.length(); i++) h = 31 * h + key.charAt(i); (a char is a number in arithmetic).', 'Do not use h % buckets: the hash of a long word is often negative. Math.floorMod(h, buckets) always gives 0 to buckets − 1.', 'Check by hand: "cat" is (99 * 31 + 97) * 31 + 116 = 98262, and 98262 mod 8 is 6.'],
            tests: [
              { call: 'bucketOf("cat", 8) + " " + bucketOf("owl", 8) + " " + bucketOf("dog", 8)', expect: '6 4 4', name: 'cat, owl and dog in 8 buckets' },
              { call: 'bucketOf("", 8) + " " + bucketOf("a", 8)', expect: '0 1', name: 'the empty string has hash 0' },
              { call: 'bucketOf("Aa", 16) + " " + bucketOf("BB", 16)', expect: '0 0', name: 'Aa and BB collide' },
              { call: 'bucketOf("elephant", 8) + " " + bucketOf("elephant", 16)', expect: '1 1', name: 'elephant has a negative hash code' },
              { call: 'bucketOf("Minecraft", 7) + " " + bucketOf("hash table", 10) + " " + bucketOf("hash table", 16)', expect: '5 2 12', name: 'negative hash codes, other table sizes' },
              { call: 'bucketOf("hello", 100)', expect: '22', name: 'a table size that is not a power of two' }
            ],
            failTip: 'A negative answer means the sign was not dealt with: h % buckets keeps it. If elephant is wrong but cat is right, check that you use floorMod, not Math.abs, and that h is an int (a long would not wrap round).',
            followup: 'Write a second method, static int collisions(String[] keys, int buckets), that returns how many keys land in a bucket that an earlier key has already used. Try it with the six words of the lesson and 8 buckets, then with 16.'
          }
        },
        {
          ex: {
            id: 'ds-8-2', skill: 'hash-chains', title: 'contains, remove and longestChain',
            prompt: `<p>Below are the <code>Node</code> and <code>Table</code> classes of the lesson, with <code>put</code>, <code>get</code> and a helper <code>chain(i)</code> that gives the keys of bucket <code>i</code> as text. Add three methods. <code>boolean contains(String key)</code> says whether the key is in the table; it must work for a key whose value is −1. <code>boolean remove(String key)</code> removes the key's node, reduces <code>size</code>, and returns <code>true</code>, or changes nothing and returns <code>false</code> when the key is absent; removing from a chain is removing from a linked list (lesson 6). <code>int longestChain()</code> returns the number of keys in the fullest bucket (0 for an empty table). The table has 8 buckets and does not grow. Write only the classes.</p>`,
            classes: true,
            starter: `class Node {\n    String key;\n    int value;\n    Node next;\n    Node(String key, int value, Node next) { this.key = key; this.value = value; this.next = next; }\n}\n\nclass Table {\n    Node[] buckets = new Node[8];\n    int size = 0;\n\n    int index(String key) { return Math.floorMod(key.hashCode(), buckets.length); }\n\n    void put(String key, int value) {\n        int i = index(key);\n        for (Node n = buckets[i]; n != null; n = n.next) {\n            if (n.key.equals(key)) { n.value = value; return; }\n        }\n        buckets[i] = new Node(key, value, buckets[i]);\n        size++;\n    }\n\n    int get(String key) {\n        for (Node n = buckets[index(key)]; n != null; n = n.next) {\n            if (n.key.equals(key)) return n.value;\n        }\n        return -1;\n    }\n\n    String chain(int i) {\n        String s = "";\n        for (Node n = buckets[i]; n != null; n = n.next) s += (s.isEmpty() ? "" : " ") + n.key;\n        return s;\n    }\n\n    boolean contains(String key) {\n        // walk the chain of the key's bucket\n        return false;\n    }\n\n    boolean remove(String key) {\n        // the first node of the chain is a special case: the bucket itself changes\n        // otherwise stop at the node BEFORE the one to remove\n        return false;\n    }\n\n    int longestChain() {\n        // count each bucket's chain, keep the biggest\n        return 0;\n    }\n}`,
            solution: `class Node {\n    String key;\n    int value;\n    Node next;\n    Node(String key, int value, Node next) { this.key = key; this.value = value; this.next = next; }\n}\n\nclass Table {\n    Node[] buckets = new Node[8];\n    int size = 0;\n\n    int index(String key) { return Math.floorMod(key.hashCode(), buckets.length); }\n\n    void put(String key, int value) {\n        int i = index(key);\n        for (Node n = buckets[i]; n != null; n = n.next) {\n            if (n.key.equals(key)) { n.value = value; return; }\n        }\n        buckets[i] = new Node(key, value, buckets[i]);\n        size++;\n    }\n\n    int get(String key) {\n        for (Node n = buckets[index(key)]; n != null; n = n.next) {\n            if (n.key.equals(key)) return n.value;\n        }\n        return -1;\n    }\n\n    String chain(int i) {\n        String s = "";\n        for (Node n = buckets[i]; n != null; n = n.next) s += (s.isEmpty() ? "" : " ") + n.key;\n        return s;\n    }\n\n    boolean contains(String key) {\n        for (Node n = buckets[index(key)]; n != null; n = n.next) {\n            if (n.key.equals(key)) return true;\n        }\n        return false;\n    }\n\n    boolean remove(String key) {\n        int i = index(key);\n        Node n = buckets[i];\n        if (n == null) return false;\n        if (n.key.equals(key)) { buckets[i] = n.next; size--; return true; }\n        while (n.next != null && !n.next.key.equals(key)) n = n.next;\n        if (n.next == null) return false;\n        n.next = n.next.next;\n        size--;\n        return true;\n    }\n\n    int longestChain() {\n        int best = 0;\n        for (int i = 0; i < buckets.length; i++) {\n            int len = 0;\n            for (Node n = buckets[i]; n != null; n = n.next) len++;\n            if (len > best) best = len;\n        }\n        return best;\n    }\n}`,
            mustNotContain: [{ re: /java\.util|HashMap|HashSet/, msg: 'Use the nodes and buckets of the table: no library maps or sets.' }],
            hints: ['contains: the same walk as get, from buckets[index(key)] down the next links, comparing with equals. Return true at the match and false after the loop. (Do not use get(key) != -1: a stored value can be −1.)', 'remove: if the bucket is empty, return false. If the first node holds the key, the bucket becomes n.next. Otherwise walk with while (n.next != null && !n.next.key.equals(key)) n = n.next; then n.next = n.next.next.', 'Do size-- only when a node was really removed. longestChain: for each bucket count the nodes with a loop, and keep the largest count in best.'],
            tests: [
              { name: 'contains', main: '        Table t = new Table();\n        String[] ws = {"cat", "dog", "bee", "owl", "fox", "ant"};\n        for (int i = 0; i < ws.length; i++) t.put(ws[i], i + 1);\n        System.out.println(t.contains("owl") + " " + t.contains("emu") + " " + t.contains("ant") + " " + t.contains(""));\n        t.put("neg", -1);\n        System.out.println(t.contains("neg") + " " + t.get("neg"));', expect: 'true false true false\ntrue -1' },
              { name: 'remove the first node, the last node and an absent key', main: '        Table t = new Table();\n        String[] ws = {"cat", "dog", "bee", "owl", "fox", "ant"};\n        for (int i = 0; i < ws.length; i++) t.put(ws[i], i + 1);\n        System.out.println(t.remove("owl") + " [" + t.chain(4) + "]");\n        System.out.println(t.remove("fox") + " [" + t.chain(7) + "]");\n        System.out.println(t.remove("emu") + " " + t.size);', expect: 'true [dog]\ntrue [ant]\nfalse 4' },
              { name: 'remove the only node of a chain', main: '        Table t = new Table();\n        t.put("cat", 1); t.put("bee", 2);\n        System.out.println(t.remove("cat") + " [" + t.chain(6) + "] " + t.size + " " + t.contains("cat") + " " + t.contains("bee"));\n        System.out.println(t.remove("cat") + " " + t.size);', expect: 'true [] 1 false true\nfalse 1' },
              { name: 'remove from the middle of a chain', main: '        Table t = new Table();\n        String[] ws = {"dog", "owl", "eel"};\n        for (int i = 0; i < ws.length; i++) t.put(ws[i], i + 1);\n        System.out.println("[" + t.chain(4) + "]");\n        System.out.println(t.remove("owl") + " [" + t.chain(4) + "] " + t.get("dog") + " " + t.get("eel") + " " + t.size);', expect: '[eel owl dog]\ntrue [eel dog] 1 3 2' },
              { name: 'put after remove, and a replaced value', main: '        Table t = new Table();\n        t.put("cat", 1); t.remove("cat"); t.put("cat", 9); t.put("cat", 10);\n        System.out.println(t.get("cat") + " " + t.size + " [" + t.chain(6) + "]");', expect: '10 1 [cat]' },
              { name: 'longestChain', main: '        Table t = new Table();\n        System.out.println(t.longestChain());\n        String[] ws = {"cat", "dog", "bee", "owl", "fox", "ant"};\n        for (int i = 0; i < ws.length; i++) t.put(ws[i], i + 1);\n        System.out.println(t.longestChain());\n        t.put("eel", 7);\n        System.out.println(t.longestChain());\n        t.remove("eel"); t.remove("owl"); t.remove("ant");\n        System.out.println(t.longestChain());', expect: '0\n2\n3\n1' }
            ],
            failTip: 'If removing a first node does nothing, the bucket itself must change: buckets[i] = n.next. If the size is wrong after removing an absent key, size-- is running when nothing was removed. If contains gives the wrong answer for a key stored with value −1, it is using get.',
            followup: 'Add a method void resize() that makes a new array of buckets twice as long and puts every key in it again with put (the index depends on buckets.length, so the nodes cannot simply be moved), and call it from put when size becomes more than 0.75 times the number of buckets. Does longestChain fall after the doubling?'
          }
        },
        {
          ex: {
            id: 'ds-8-3', skill: 'hash-chains', title: 'The first repeat',
            prompt: `<p>Write</p><pre class="code">static int firstRepeat(int[] a)</pre><p>that scans the array from left to right and returns the first value that has already appeared earlier in the array, or <code>-1</code> if all the values are different (the values are never negative). For <code>{3, 1, 4, 1, 5, 9, 2, 6, 5}</code> the answer is <code>1</code>: the second 1 comes before the second 5. Make one pass using a <code>HashSet</code> of the values seen so far, so that the method takes O(n) on average: two nested loops would take minutes on the last test.</p>`,
            prelude: 'import java.util.HashSet;',
            starter: `static int firstRepeat(int[] a) {\n    HashSet<Integer> seen = new HashSet<>();\n    // for each value: if it is already in seen, return it; otherwise add it\n    return -1;\n}`,
            solution: `static int firstRepeat(int[] a) {\n    HashSet<Integer> seen = new HashSet<>();\n    for (int x : a) {\n        if (seen.contains(x)) return x;\n        seen.add(x);\n    }\n    return -1;\n}`,
            hints: ['One loop over the values: for (int x : a). Before adding x, ask seen.contains(x).', 'If it is there, return x at once; if not, seen.add(x). Return -1 only after the loop.', 'seen.add(x) returns false when x was already in the set, so if (!seen.add(x)) return x; does both jobs in one line.'],
            tests: [
              { call: 'firstRepeat(new int[] {3, 1, 4, 1, 5, 9, 2, 6, 5})', expect: '1', name: 'the example' },
              { call: 'firstRepeat(new int[] {2, 1, 1, 2})', expect: '1', name: 'the first to repeat, not the first value that repeats' },
              { call: 'firstRepeat(new int[] {1, 2, 3}) + " " + firstRepeat(new int[] {}) + " " + firstRepeat(new int[] {7, 7})', expect: '-1 -1 7', name: 'no repeat, empty, a pair' },
              { name: 'fifty thousand values, a repeat at the very end', main: '        int[] a = new int[50000];\n        for (int i = 0; i < a.length; i++) a[i] = i;\n        a[49999] = 1234;\n        System.out.println(firstRepeat(a));', expect: '1234' },
              { name: 'fifty thousand different values', main: '        int[] a = new int[50000];\n        for (int i = 0; i < a.length; i++) a[i] = i * 3;\n        System.out.println(firstRepeat(a));', expect: '-1' }
            ],
            failTip: 'If the last two tests time out, the method is comparing each value with all the earlier ones (a nested loop, O(n²)): 50,000 values mean over a billion comparisons. Asking a HashSet is O(1) on average.',
            followup: 'Write static boolean hasPair(int[] a, int target), true when two values at different positions add up to target. For each x, ask whether target - x has been seen. The same one-pass idea turns a O(n²) search into O(n).'
          }
        },
        {
          ex: {
            id: 'ds-8-4', skill: 'hash-chains', kind: 'answer', title: 'Trace the table',
            prompt: `<p>A hash table of whole numbers has 8 buckets to begin with. The hash of a number is the number itself, so its bucket is <code>key % buckets</code>. Chains grow at the <em>end</em>. After an insertion the table doubles if keys ÷ buckets is <em>more than</em> 0.75, and every key is then placed again, bucket by bucket from 0 and each chain from front to back. The keys are inserted in this order: <b>17, 4, 25, 12, 9, 33, 20, 41</b>.</p>`,
            parts: [
              { label: '(a) Which bucket does 25 go to in the table of 8?', answer: '1', width: '6rem', wrong: [{ match: '25', msg: 'That is the key. The bucket is 25 % 8, the remainder.' }, { match: '3', msg: '25 ÷ 8 is 3 with remainder 1. The bucket is the remainder.' }] },
              { label: '(b) After the first six keys (17, 4, 25, 12, 9, 33): how many of them collided, that is, landed in a bucket that was already in use?', answer: '4', width: '6rem', wrong: [{ match: '2', msg: 'Only two buckets are in use, but that is not the question. 17 and 4 started them; each of the other four landed in a used bucket.' }, { match: '6', msg: 'The first key into each bucket does not collide: 17 and 4 were first.' }] },
              { label: '(c) How many buckets are there after the sixth key (33)?', answer: '8', width: '6rem', wrong: [{ match: '16', msg: '6 ÷ 8 = 0.75 is not more than 0.75, so the table has not doubled yet.' }] },
              { label: '(d) How many buckets are there after the seventh key (20)?', answer: '16', width: '6rem', wrong: [{ match: '8', msg: '7 ÷ 8 = 0.875 is more than 0.75: the table doubled.' }, { match: '32', msg: 'It doubles once: 8 to 16. And 7 ÷ 16 is only 0.44.' }] },
              { label: '(e) After the seventh key and the doubling, how many keys are in the longest chain?', answer: '2', width: '6rem', wrong: [{ match: '4', msg: '4 was the longest chain in the table of 8 (bucket 1: 17, 25, 9, 33). Place each key again with key % 16, and bucket 1 holds only 17 and 33.' }, { match: '3', msg: 'With key % 16 the seven keys land in buckets 1, 4, 9 and 12 only: 17 and 33 in bucket 1, 4 and 20 in bucket 4, 25 and 9 in bucket 9, 12 on its own.' }] },
              { label: '(f) Now 41 is inserted (the eighth key). To find 41 again, how many keys are compared with it, counting the match itself?', answer: '3', width: '6rem', wrong: [{ match: '1', msg: '41 % 16 = 9, and bucket 9 already holds 25 and 9, with 41 added at the end. All three are compared.' }, { match: '8', msg: 'That would be a linear search. Only the keys in bucket 9 are compared: 25, 9 and 41.' }] }
            ],
            hints: ['Write the buckets down as a list: bucket 1: 17, 25, ... Each key goes to key % (number of buckets). A collision is a key that joins a bucket which already has one.', 'Doubling happens when the load factor is MORE than 0.75: exactly 0.75 is allowed. After doubling, use key % 16 for every key.'],
            solution: `<p>(a) <b>1</b>. (b) <b>4</b>: bucket 1 gets 17, 25, 9 and 33; bucket 4 gets 4 and 12; the four keys that joined a used bucket are 25, 12, 9 and 33. (c) <b>8</b>: 6/8 = 0.75 is not over the limit. (d) <b>16</b>: 7/8 = 0.875 is over it. (e) <b>2</b>: with key % 16 the buckets are 1: 17, 33; 4: 4, 20; 9: 25, 9; 12: 12. (f) <b>3</b>: 41 % 16 = 9, and bucket 9 is now 25, 9, 41.</p>`,
            followup: 'Insert 57 too. Which bucket does it join, and how long is that chain? What does that say about keys that differ by a multiple of the table length, and why does Java scramble the hash code before it uses the index?'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li><b>How does a table find a key without looking at the others?</b> A hash function turns the key into a number, the number into an index (<code>Math.floorMod(hash, length)</code>, never a bare <code>%</code>), and the key is in that bucket or nowhere: one step instead of n.</li>
<li>Different keys sometimes get the same bucket, a collision. A chained table keeps a linked list in each bucket; get and put walk one chain, comparing with <code>equals</code>.</li>
<li>The load factor (keys ÷ buckets) is the average chain length. Over 0.75 the table doubles and every key is placed again, which is O(1) per insert on average, as for the dynamic array of lesson 1.</li>
<li><b>How can a table that is usually instant be made slow on purpose?</b> O(1) is an average that depends on the hash spreading the keys. A bad hash function, or an attacker who knows a good one, puts every key in one chain and the table becomes a list: O(n). Random seeds, limits and tree-shaped chains are the defences.</li>
<li>Equal objects must have equal hash codes: override <code>equals</code> and <code>hashCode</code> together. A hash table has no order and no &quot;smallest&quot;; for those, use a tree or a heap.</li>
<li>In practice use <code>HashMap</code> and <code>HashSet</code>, and know what is inside them.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3A-DA-10', '3B-AP-11', '3B-AP-12', '3B-AP-13'],
      title: 'Checkpoint: lists, stacks, recursion, hashing', checkpoint: true, summary: 'No new ideas: mixed questions on linked lists, stacks and queues, recursion and hash tables. Which structure fits? What does this operation cost? Then a choice of design and a program that evaluates a formula with a stack.',
      blocks: [
        `<p>This lesson teaches nothing new. It mixes questions from the last four lessons, because the structures that look alike, such as an array and a linked list, or a stack and a queue, are only told apart by being asked about together. Answer each question before you look back. If one surprises you, the lesson it came from is linked on the Review page, and the question will come back there in a day.</p>
<p>Ready? Here is the first: a structure that is bad at reaching the middle can still be the best one for something else. What is a linked list good at?</p>
<h2>Mixed questions</h2>`,
        { check: 'Which job is <em>cheaper</em> on a singly linked list (a head reference only) than on an array that holds the same values?', skill: 'linked-list-cost', options: ['Adding a value at the front', 'Reading the value at index 500', 'Finding out whether a value is present'], answer: 0, wrong: [null, 'The list has to hop 500 nodes from the head to get there. An array reaches index 500 by arithmetic: that is the array\'s strength.', 'Both have to look at the values one by one: O(n) either way. Binary search needs sorted data and an array to jump around in.'], why: 'Adding at the front makes a node and changes one reference: O(1), with nothing shifted. The array has to move every value one cell to the right.' },
        { check: 'A node <code>p</code> in a linked list has a node after it. Which statement removes the node after <code>p</code> from the list?', skill: 'linked-list-pointers', options: ['<code>p = p.next.next;</code>', '<code>p.next = p.next.next;</code>', '<code>p.next.next = p;</code>'], answer: 1, wrong: ['That moves the variable <code>p</code> two nodes along. No node\'s <code>next</code> changes, so the list is exactly as it was.', null, 'That makes the next node point back at <code>p</code>, which builds a loop, and the node you meant to remove is still linked in.'], why: 'The node after p is skipped when p.next points at the node after that one. Nothing else needs to change, which is why splicing out is O(1) once you are holding p.' },
        { check: 'A game records the player\'s moves and must undo them, most recent first. Which structure fits?', skill: 'stack-lifo', options: ['A queue', 'A sorted array', 'A stack'], answer: 2, wrong: ['A queue gives back the oldest item first. Undo would take back the very first move of the game.', 'Sorting puts values in order of size, not of time: nothing says which move was last.', null], why: 'Last in, first out: the most recent move is on top, and pop takes it back. Undo, brackets and the call stack all work this way.' },
        { check: 'A ring-buffer queue has capacity 5. Its front is at index 3 and it holds 4 items, in cells 3, 4, 0 and 1. Where does the next item go?', skill: 'ring-buffer', options: ['Index 2', 'Index 5', 'Index 7'], answer: 0, wrong: [null, 'The array has indexes 0 to 4, so there is no index 5. The ring wraps round to the start.', 'Front plus size is 7, but the ring wraps: (front + size) % capacity is 7 % 5, which is 2.'], why: 'The next free cell is (front + size) % capacity = (3 + 4) % 5 = 2. The % makes the array behave like a ring, so nothing is ever shifted.' },
        { check: '<code>static int f(int n) { return n * f(n - 1); }</code> is called as <code>f(3)</code>. What happens?', skill: 'base-case', options: ['It returns 6', 'It calls itself again and again until the stack overflows', 'It returns 0'], answer: 1, wrong: ['Nothing tells it to stop at 1: n goes on through 0, −1, −2 and so on. A factorial needs <code>if (n &lt;= 1) return 1;</code>.', null, 'No call ever returns a value, so there is nothing to multiply and nothing is returned. Each call waits for the one below it.'], why: 'With no base case every call makes another call, each with a frame on the call stack, until Java throws StackOverflowError. Every recursive method needs a case that does not recurse, and each call must move towards it.' },
        { check: 'Which recursive method repeats the same smaller problems many times, so that a memo (a table of saved answers) speeds it up a great deal?', skill: 'memoization', options: ['<code>factorial(n) = n * factorial(n - 1)</code>', '<code>fib(n) = fib(n - 1) + fib(n - 2)</code>', 'the sum of an array: <code>a[i] + sum(a, i + 1)</code>'], answer: 1, wrong: ['Each call has a different n and is made once, so a memo would find nothing to reuse.', null, 'Each call has a different i and is made once. Nothing is repeated, so a memo saves nothing.'], why: 'fib(n - 1) and fib(n - 2) both need fib(n - 3), and so on down: the same values are computed over and over, and the calls grow exponentially. A memo makes each value cost one call.' },
        { check: 'A class <code>Point</code> defines <code>equals</code> (same x and same y) but <em>not</em> <code>hashCode</code>. Two equal <code>Point</code> objects are added to a <code>HashSet</code>. What may happen?', skill: 'hash-index', options: ['The set may hold both, because they can land in different buckets', 'The second one replaces the first', 'Java refuses to compile the class'], answer: 0, wrong: [null, 'The table only compares keys that land in the same bucket. With different hash codes it never looks at the first one.', 'The class compiles. Java cannot see that the two methods disagree: that is the programmer\'s job.'], why: 'The hash code picks the bucket, and equals is used only inside it. Equal objects must therefore have equal hash codes, or the table can hold duplicates and fail to find keys that are there.' },
        { check: 'A badly chosen hash function sends every key to bucket 0 of a table with 1,000 buckets. 1,000 keys are stored. What does <code>get</code> cost?', skill: 'hash-chains', options: ['O(1)', 'O(n): bucket 0 holds a chain of all the keys', 'O(log n)'], answer: 1, wrong: ['O(1) assumes the keys are spread over the buckets, so chains are short. Here one chain holds everything.', null, 'A chain is an unsorted linked list that is walked one node at a time, so there is no halving.'], why: 'The cost of a lookup is the length of the chain it has to walk. A good hash function and a limit on the load factor keep chains short; a bad one turns the table into a linked list.' },
        `<p>Two jobs to finish the unit. The first needs no code: choose the design. The second uses a stack to evaluate a formula.</p>`,
        {
          ex: {
            id: 'ds-14-1', kind: 'choice', skill: 'ring-buffer', title: 'Design a queue',
            prompt: `<p>A server keeps its waiting requests in a queue: new ones join at the back, the oldest leaves from the front, and both must take O(1) steps however many are waiting. The most requests ever waiting at once is 1,000. Which design meets the need?</p>`,
            options: [
              { text: 'An array in which the front item is always cell 0: on each removal, move every other item one cell to the left.', why: 'Each removal shifts up to 999 items: O(n).' },
              { text: 'A singly linked list with only a head reference: add by walking to the last node, remove at the head.', why: 'Removing at the head is O(1), but finding the last node to add at the back means walking the whole list: O(n).' },
              { text: 'An array of 1,000 cells used as a ring, with a front index and a size: add at (front + size) % 1000, remove at front.', ok: true },
              { text: 'A stack: push new requests, pop the next one to serve.', why: 'A stack serves the newest request first, not the oldest. That is last in, first out, and the wrong order for a queue.' }
            ],
            hints: ['Both operations must be O(1). Check what each design does to add at the back and to remove at the front.', 'An array never has to shift if the front is allowed to move: use an index for it, and wrap round with %.'],
            solution: '<p>The ring buffer: a fixed array, a <code>front</code> index and a <code>size</code>. Enqueue writes to <code>(front + size) % capacity</code>; dequeue reads <code>front</code> and moves it on by one, wrapping with %. Nothing is shifted and nothing is walked, so both are O(1). (A linked list with a tail reference would also work.)</p>',
            followup: 'The list in the second option becomes fast if it also keeps a tail reference. Which operation does the tail help, and which still needs care when the list has only one node?'
          }
        },
        {
          ex: {
            id: 'ds-14-2', skill: 'stack-lifo', title: 'Evaluate a formula',
            prompt: `<p>In <em>postfix</em> notation an operator comes after its two numbers: <code>3 4 +</code> means 3 + 4, and <code>5 1 2 + 4 * + 3 -</code> means 5 + ((1 + 2) × 4) − 3. Write a method</p><pre class="code">static int evaluate(String expr)</pre><p>that evaluates a postfix formula with whole numbers and the operators <code>+ - * /</code>, all separated by single spaces. Use a stack: a number is pushed; an operator pops the right operand first and then the left one, and pushes the result. At the end one value is left. <code>evaluate("5 1 2 + 4 * + 3 -")</code> is <code>14</code>, and <code>evaluate("9 3 -")</code> is <code>6</code>. Division is whole-number division.</p>`,
            prelude: 'import java.util.ArrayDeque;',
            starter: `static int evaluate(String expr) {\n    ArrayDeque<Integer> stack = new ArrayDeque<>();\n    for (String token : expr.split(" ")) {\n        // a number: push it. An operator: pop two values, combine them, push the result.\n    }\n    return stack.pop();\n}`,
            solution: `static int evaluate(String expr) {\n    ArrayDeque<Integer> stack = new ArrayDeque<>();\n    for (String token : expr.split(" ")) {\n        if (token.equals("+") || token.equals("-") || token.equals("*") || token.equals("/")) {\n            int right = stack.pop();\n            int left = stack.pop();\n            if (token.equals("+")) {\n                stack.push(left + right);\n            } else if (token.equals("-")) {\n                stack.push(left - right);\n            } else if (token.equals("*")) {\n                stack.push(left * right);\n            } else {\n                stack.push(left / right);\n            }\n        } else {\n            stack.push(Integer.parseInt(token));\n        }\n    }\n    return stack.pop();\n}`,
            hints: ['Test each token with token.equals("+") and so on. Anything that is not an operator is a number: stack.push(Integer.parseInt(token)).', 'For an operator, pop twice. The first value popped is the right operand: int right = stack.pop(); int left = stack.pop(); then push left op right. The order matters for - and /.'],
            tests: [
              { call: 'evaluate("3 4 +")', expect: '7', name: 'one addition' },
              { call: 'evaluate("5 1 2 + 4 * + 3 -")', expect: '14', name: 'the formula of the prompt' },
              { call: 'evaluate("2 3 4 * +")', expect: '14', name: 'multiply before add' },
              { call: 'evaluate("9 3 -") + " " + evaluate("8 2 /")', expect: '6 4', name: 'operand order for - and /' },
              { call: 'evaluate("7")', expect: '7', name: 'a lone number' },
              { call: 'evaluate("10 2 8 * + 3 -")', expect: '23', name: 'a longer formula' },
              { call: 'evaluate("15 7 1 1 + - / 3 * 2 1 1 + + -")', expect: '5', name: 'a nested formula' },
              { call: 'evaluate("-4 6 +")', expect: '2', name: 'a negative number is not the operator' }
            ],
            failTip: 'If "9 3 -" gives -6, the operands are the wrong way round: the first value popped is the right-hand one. If "-4 6 +" fails, test for the operator with equals, not by looking at the first character.',
            followup: 'Add the operator % and the check that the stack holds exactly one value at the end. What does evaluate("1 +") do in your program, and what should it do?'
          }
        },
        `<div class="recap"><h3>Unit two in a few lines</h3><ul>
<li>A linked list is nodes with <code>next</code> references: O(1) at the front and for splicing once you hold the node, O(n) to reach an index. An array is the reverse. <code>ArrayList</code> usually wins because its values sit side by side.</li>
<li>A stack is last in, first out (undo, brackets, the call stack); a queue is first in, first out (waiting lines), and an array queue needs a ring so nothing is ever shifted.</li>
<li>A recursive method needs a base case and a call on a smaller problem. A memo rescues a recursion that repeats the same subproblems, such as <code>fib</code>.</li>
<li>A hash table finds a key by computing its bucket: about O(1) when chains are short, which a good hash function and a load factor limit ensure. Equal keys must have equal hash codes.</li>
<li>Next: trees. A binary search tree keeps keys in order and aims at the best of the sorted array and the linked list.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standard: 1,
      standards: ['3B-AP-12', '3B-AP-11', '3B-AP-13'],
      title: 'Binary search trees', summary: 'Nodes with two links; the rule that makes a tree searchable (smaller on the left, larger on the right); search, insert and in-order traversal; why the cost is the height and the order of arrival decides the height; deleting a key; and the self-balancing trees behind TreeMap.',
      blocks: [
        `<p>In 1962 two Soviet mathematicians, Georgy Adelson-Velsky and Evgenii Landis, published a short paper called <q>An algorithm for the organization of information</q> in the reports of the Soviet Academy of Sciences. It was about a problem that every program with a large sorted collection meets. A tree of keys kept in order can be searched by asking one question per level, but only while the tree is bushy; a tree that has grown long and thin is no better than a list. Their answer was a search tree that checks itself after every insertion and, when one side has grown more than one level taller than the other, turns a few of its links around to even them out. It was the first search tree that guaranteed to stay balanced, and it is still called the AVL tree, after their initials.</p>
<p>This lesson builds the plain search tree that came before theirs, and finds out exactly how it fails. Here is the question to keep in mind: <em>what is it about a search tree that lets a few unlucky keys turn it into a list, and how can you tell before it happens?</em></p>
<h2>Why a tree?</h2>
<p>Lessons 2 and 6 left us with a puzzle. A <em>sorted array</em> can be searched by binary search in <code>log n</code> steps, but inserting into it shifts half the values. A <em>linked list</em> takes an insertion in two assignments, but finding the place means walking from the head. Each structure is good at one of the two jobs and bad at the other. Is there a structure where finding the place and making room are <em>both</em> cheap?</p>
<p>There is, and it starts with a small change to the list node: give it <em>two</em> links instead of one. Binary search keeps cutting the range in two; a node with two links can point at the two halves.</p>
<div class="stmt"><p><span class="kind">Tree.</span> A node holds a key and links to its <b>left child</b> and <b>right child</b>, either of which may be <code>null</code>. The node at the top is the <b>root</b>; a node with no children is a <b>leaf</b>. Each node is the <b>parent</b> of its children, and a child with everything below it is a <b>subtree</b>. A tree with at most two children per node is <b>binary</b>.</p>
<p><span class="kind">Height.</span> In this lesson, the number of nodes on the longest path from the root down to a leaf. A single node has height 1 and the empty tree has height 0. (Many books count links instead and get a number one smaller; say which you mean.)</p></div>`,
        { predict: true, play: `class Node {
    int key;
    Node left, right;
    Node(int key) { this.key = key; }
}

public class Main {
    public static void main(String[] args) {
        Node root = new Node(8);
        root.left = new Node(3);
        root.right = new Node(10);
        root.left.left = new Node(1);
        root.left.right = new Node(6);
        root.right.right = new Node(14);

        System.out.println(root.key + " " + root.left.key + " " + root.right.key);
        System.out.println(root.left.right.key);
        System.out.println(root.right.left);
        System.out.println(root.left.left.left == null);
    }
}`, caption: 'Four lines: <code>8 3 10</code>, then <code>6</code> (the right child of the left child of the root), then <code>null</code> (<code>root.right.left</code> was never set, so the link still holds <code>null</code>), then <code>true</code>. The tree has six nodes, three leaves (1, 6 and 14) and height 3. Notice that nothing in <code>Node</code> says "tree": a tree is only nodes whose links point down. Draw it on paper before you run it, if the last two lines surprised you.' },
        `<h2>Search and insert</h2>
<p>A tree could hold its keys in any arrangement. What makes it a <em>search</em> tree is one rule, kept true at every node.</p>
<div class="stmt"><p><span class="kind">The binary search tree rule.</span> For every node, every key in its <b>left</b> subtree is smaller than the node's key, and every key in its <b>right</b> subtree is larger. (Here the keys are distinct, so a key is stored once.)</p>
<p><span class="kind">Search.</span> Start at the root. If the key equals the node's key, found. If it is smaller, the answer can only be in the left subtree, so go left; if larger, go right. Reaching <code>null</code> means the key is absent.</p></div>
<p>Every comparison throws away a whole subtree, exactly as one comparison in binary search throws away half the array. The tree in the example above obeys the rule: 3 and everything under it is smaller than 8, and 10 and everything under it is larger. Before you run the next program, work out which keys each of its three searches will look at.</p>`,
        { predict: true, play: `class Node {
    int key;
    Node left, right;
    Node(int key) { this.key = key; }
    Node(int key, Node l, Node r) { this.key = key; left = l; right = r; }
}

public class Main {
    static boolean contains(Node t, int key) {
        while (t != null) {
            System.out.print(t.key + " ");
            if (key == t.key) return true;
            t = key < t.key ? t.left : t.right;
        }
        return false;
    }

    public static void main(String[] args) {
        Node root = new Node(8, new Node(3, new Node(1), new Node(6)), new Node(10, null, new Node(14)));
        System.out.println(contains(root, 6));
        System.out.println(contains(root, 7));
        System.out.println(contains(root, 14));
    }
}`, caption: 'The three lines are <code>8 3 6 true</code>, <code>8 3 6 false</code> and <code>8 10 14 true</code>. Searching for 7 goes the same way as for 6 and then falls off the tree: 7 is larger than 6, and 6 has no right child, so the loop meets <code>null</code> and the answer is <code>false</code>. Each search looked at no more nodes than the tree is tall. Change 7 to 5 and to 0 and predict the path before you run.' },
        { check: 'You search a search tree for 42. At the root, whose key is 50, you go left. What does that tell you?', skill: 'bst-search', options: ['If 42 is in the tree at all, it is in the left subtree; the whole right subtree can be ignored', '42 is in the left subtree', '42 is smaller than every key in the left subtree'], answer: 0, wrong: [null, 'Going left only says where 42 would have to be. It may not be in the tree at all; the search can still end at a null link.', 'It is smaller than the root, 50, but the left subtree holds keys below 50 of every size. 42 can be larger than many of them.'], why: 'The rule gives one fact: everything in the right subtree is larger than 50, so 42 cannot be there. Whether 42 is in the left subtree is what the rest of the search finds out.' },
        `<p>To insert a key, <em>search for it</em>. If it is there, there is nothing to do. If not, the search ends at a <code>null</code> link, and that link is exactly where the key belongs: put a new node there. Insertion always adds a new leaf, and no existing node ever moves. Try it in the figure: watch the path, then watch the new node appear.</p>`,
        { fig: 'bst', keys: [8, 3, 10, 1, 6, 14], caption: 'Type a number and press Insert, then Step through the comparisons. Try 7, then 5, then 13. Then press Search with a key that is not there and find the empty slot where it would go. Insert a key that is already present and see that nothing changes.' },
        { play: `class Node {
    int key;
    Node left, right;
    Node(int key) { this.key = key; }
}

public class Main {
    static Node insert(Node t, int key) {
        if (t == null) return new Node(key);               // an empty spot: the new node goes here
        if (key < t.key) t.left = insert(t.left, key);
        else if (key > t.key) t.right = insert(t.right, key);
        return t;                                          // equal: already there, change nothing
    }

    static String shape(Node t) {
        if (t == null) return ".";
        return "(" + t.key + " " + shape(t.left) + " " + shape(t.right) + ")";
    }

    public static void main(String[] args) {
        Node root = null;
        for (int k : new int[] {8, 3, 10, 1, 6, 14, 4, 7, 13, 6}) root = insert(root, k);
        System.out.println(shape(root));
    }
}`, caption: 'The method returns the subtree to hang in the link it was called on, so <code>t.left = insert(t.left, key)</code> either puts the same subtree back or, at <code>null</code>, the new leaf. <code>shape</code> prints the tree as <code>(key left right)</code> with <code>.</code> for an empty link: read it against the figure. The last key, 6, is a duplicate and changes nothing.' },
        { code: `static Node insert(Node root, int key) {          // the same insertion as a loop, with no recursion
    if (root == null) return new Node(key);
    Node cur = root;
    while (true) {
        if (key == cur.key) return root;                // already present
        if (key < cur.key) {
            if (cur.left == null) { cur.left = new Node(key); return root; }
            cur = cur.left;
        } else {
            if (cur.right == null) { cur.right = new Node(key); return root; }
            cur = cur.right;
        }
    }
}`, lang: 'java', caption: 'Iterative insertion: walk down, and stop at the node whose empty link the key belongs in. It uses no stack, so it works however tall the tree is; the recursive version needs one frame per level.' },
        `<h2>Walking in order</h2>
<p>How do you list all the keys? Visit the left subtree, then the node, then the right subtree, and do the same in every subtree. Everything in the left subtree is smaller than the node and everything in the right is larger, so the keys come out in increasing order. That is the <b>in-order traversal</b>, and sorting is built into the shape of the tree.</p>
<p>Two other orders use the same recursion with the middle step moved. <b>Pre-order</b> visits the node first, then both subtrees: reinserting the keys in that order into an empty tree rebuilds the same shape, so it is how a tree is copied or saved. <b>Post-order</b> visits both subtrees first and the node last: it is how a tree is deleted or its total added up, because every child is finished before its parent.</p>
<p>The smallest key is the leftmost node (keep going left until there is no left child) and the largest is the rightmost. Predict the output of this program before running it.</p>`,
        { long: true, predict: true, play: `class Node {
    int key;
    Node left, right;
    Node(int key) { this.key = key; }
}

public class Main {
    static Node insert(Node t, int key) {
        if (t == null) return new Node(key);
        if (key < t.key) t.left = insert(t.left, key);
        else if (key > t.key) t.right = insert(t.right, key);
        return t;
    }

    static void inOrder(Node t, StringBuilder sb) {
        if (t == null) return;
        inOrder(t.left, sb);                               // everything smaller
        sb.append(t.key).append(' ');                      // then this node
        inOrder(t.right, sb);                              // then everything larger
    }

    public static void main(String[] args) {
        Node root = null;
        for (int k : new int[] {8, 3, 10, 1, 6, 14, 4, 7, 13}) root = insert(root, k);
        StringBuilder sb = new StringBuilder();
        inOrder(root, sb);
        System.out.println("in order: " + sb.toString().trim());

        Node low = root;
        while (low.left != null) low = low.left;
        Node high = root;
        while (high.right != null) high = high.right;
        System.out.println("min " + low.key + ", max " + high.key);
    }
}`, caption: 'The output is <code>in order: 1 3 4 6 7 8 10 13 14</code> and <code>min 1, max 14</code>: nine keys that went in as 8 3 10 1 6 14 4 7 13 come out sorted, without a sort. The min and max cost one step per level, not one per key. Move the <code>sb.append</code> line above the first recursive call and the keys come out in pre-order instead.' },
        { check: 'You insert 5, 2, 8, 1 (in that order) into an empty search tree and walk it in order. What is printed?', skill: 'bst-search', options: ['5 2 8 1', '1 2 5 8', '5 2 1 8'], answer: 1, wrong: ['That is the order the keys arrived in. The shape of the tree depends on that order, but an in-order walk reads the keys by size, whatever the shape.', null, 'That is the pre-order walk (each node before its subtrees): 5, then the left subtree 2 and 1, then 8. In order puts each node between its subtrees.'], why: 'The tree is 5 at the root, 2 and 8 below it, and 1 under 2. In order reads the left subtree (1 2), then 5, then the right (8): 1 2 5 8.' },
        `<h2>Shape is everything</h2>
<p>Search, insert, min and max all follow one path down from the root. The most levels a path can have is the height. So every one of these costs <b>O(height)</b>, and the whole question of how fast a search tree is becomes: how tall is it? Two measurements are needed, and both are short recursions on the same idea: a tree's height is one more than the taller of its two subtrees, and its size is one plus the sizes of both.</p>
<p>The height depends on the <em>order</em> the keys arrive in, not just on which keys there are. If each new key is larger than all before it, it always goes to the right of the last node, and the tree becomes a chain: a linked list, with <code>left</code> never used. The program below puts the same 63 keys in a tree three ways. Predict the three heights first.</p>`,
        { long: true, predict: true, play: `import java.util.Random;

class Node {
    int key;
    Node left, right;
    Node(int key) { this.key = key; }
}

public class Main {
    static Node insert(Node t, int key) {
        if (t == null) return new Node(key);
        if (key < t.key) t.left = insert(t.left, key);
        else if (key > t.key) t.right = insert(t.right, key);
        return t;
    }

    static int height(Node t) { return t == null ? 0 : 1 + Math.max(height(t.left), height(t.right)); }

    static Node addMiddle(Node t, int lo, int hi) {        // insert the middle key first, then each half
        if (lo > hi) return t;
        int mid = (lo + hi) / 2;
        t = insert(t, mid);
        t = addMiddle(t, lo, mid - 1);
        return addMiddle(t, mid + 1, hi);
    }

    public static void main(String[] args) {
        int n = 63;
        Node sorted = null;
        for (int k = 1; k <= n; k++) sorted = insert(sorted, k);
        Node middle = addMiddle(null, 1, n);

        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = i + 1;
        Random rnd = new Random(42);
        for (int i = n - 1; i > 0; i--) {                  // shuffle the same keys
            int j = rnd.nextInt(i + 1);
            int tmp = a[i]; a[i] = a[j]; a[j] = tmp;
        }
        Node shuffled = null;
        for (int k : a) shuffled = insert(shuffled, k);

        System.out.println("increasing order: height " + height(sorted));
        System.out.println("middle first:     height " + height(middle));
        System.out.println("shuffled:         height " + height(shuffled));
    }
}`, caption: 'Increasing order gives height 63: a chain, so a search for 63 compares with all 63 keys. Inserting the middle first gives height 6, the smallest a tree of 63 nodes can have (2⁶ − 1 = 63: every level full). The shuffled order lands in between, much nearer to 6 than to 63: 12 for this shuffle (another shuffle gives another height). The shuffled height is the figure a real program sees: on average a key in a randomly built tree sits about 1.39 · log₂ n levels down, the same 1.39 as quicksort, and for the same reason (the first key is a random pivot).' },
        { fig: 'bst', keys: [1, 2, 3, 4, 5, 6, 7], caption: 'This is the sorted sequence, a stick. Press Search for 7 and count the comparisons. Then press Balanced and search for any key, and Random a few times. The height is shown under the tree: it is the most comparisons any search can take.' },
        { check: 'The keys 1, 2, 3, … 100 arrive in increasing order into an empty search tree with no balancing. About how many comparisons does a search for 100 take?', skill: 'bst-balance', options: ['About 7, because log₂ 100 is about 7', '100', 'About 50, the middle'], answer: 1, wrong: ['Seven would be right for a balanced tree, but this tree is not balanced: every key is larger than all before it, so each one goes right of the last, and the tree is a chain of 100.', null, 'Fifty is the average over all the keys in the chain. The last key sits at the bottom, behind all 99 others, so searching for it compares with every one.'], why: 'Each key is larger than every key already there, so it is added to the right of the last one: a chain of 100 nodes. The search for 100 follows all of them. Sorted input, the most natural data there is, is the worst case.' },
        `<table class="growth-table"><thead><tr><th></th><th>Search</th><th>Insert</th><th>Keys in order</th></tr></thead><tbody>
<tr><td>Sorted array</td><td>O(log n)</td><td>O(n): shift</td><td>O(n)</td></tr>
<tr><td>Linked list</td><td>O(n)</td><td>O(1) at the front, O(n) to keep it sorted</td><td>O(n) if kept sorted</td></tr>
<tr><td>Search tree, balanced (height about log n)</td><td>O(log n)</td><td>O(log n)</td><td>O(n)</td></tr>
<tr><td>Search tree, worst case (a chain)</td><td>O(n)</td><td>O(n)</td><td>O(n)</td></tr>
</tbody></table>
<p>A balanced search tree is the first structure in this course to be good at everything in the table at once. The cost is the word <em>balanced</em>, and a plain tree cannot promise it.</p>
<h2>Deleting a key</h2>
<p>Deleting is the hard one, because removing a node must leave the rule true. First find the node (a search). Then there are three cases.</p>
<div class="stmt"><p><span class="kind">Delete a node.</span> <b>A leaf:</b> replace the link to it by <code>null</code>. <b>One child:</b> replace the link to it by that child's subtree; the child takes its place. <b>Two children:</b> you cannot hand two subtrees to one link. Instead find the node's <b>in-order successor</b>, the smallest key in its right subtree (go right once, then left as far as you can). Copy that key into the node, then delete the successor from the right subtree, which is one of the first two cases, because the successor has no left child.</p></div>
<p>Why does the successor work? It is larger than everything in the left subtree and no larger than anything else in the right subtree, so it can sit in the node's place without breaking the rule. Predict which key will be at the root after the last removal below.</p>`,
        { long: true, predict: true, play: `class Node {
    int key;
    Node left, right;
    Node(int key) { this.key = key; }
}

public class Main {
    static Node insert(Node t, int key) {
        if (t == null) return new Node(key);
        if (key < t.key) t.left = insert(t.left, key);
        else if (key > t.key) t.right = insert(t.right, key);
        return t;
    }

    static String shape(Node t) {
        if (t == null) return ".";
        return "(" + t.key + " " + shape(t.left) + " " + shape(t.right) + ")";
    }

    static Node remove(Node t, int key) {
        if (t == null) return null;                        // not there: nothing to do
        if (key < t.key) t.left = remove(t.left, key);
        else if (key > t.key) t.right = remove(t.right, key);
        else {
            if (t.left == null) return t.right;            // a leaf, or only a right child
            if (t.right == null) return t.left;            // only a left child
            Node s = t.right;                              // two children: the in-order successor
            while (s.left != null) s = s.left;
            t.key = s.key;                                 // copy its key here...
            t.right = remove(t.right, s.key);              // ...and delete it from the right subtree
        }
        return t;
    }

    public static void main(String[] args) {
        Node root = null;
        for (int k : new int[] {8, 3, 10, 1, 6, 14, 4, 7, 13}) root = insert(root, k);
        System.out.println(shape(root));
        root = remove(root, 1);                            // a leaf
        System.out.println(shape(root));
        root = remove(root, 14);                           // one child (13)
        System.out.println(shape(root));
        root = remove(root, 8);                            // two children: the root
        System.out.println(shape(root));
    }
}`, caption: 'Removing 1 (a leaf) leaves 3 with only a right child. Removing 14 puts its only child, 13, in its place. Removing the root, 8, which has two children, takes the smallest key of its right subtree, 10, and puts it at the root; the old node for 10 had no left child, so deleting it just lifts its right subtree (13) into its place. The last line is <code>(10 (3 . (6 (4 . .) (7 . .))) (13 . .))</code>, and the keys still read in order. Change the last removal to 3 (two children) and predict the new key in its place.' },
        `<h2>Staying balanced</h2>
<p>Back to the opening question. A plain search tree has no defence against a bad order: all its cost is in its height and nothing keeps the height down. The fix, which Adelson-Velsky and Landis found in 1962, is for the tree to repair itself. After each insertion or deletion it checks the heights along the path it came down, and if two subtrees of a node differ by more than one level it applies a <b>rotation</b>: a few link changes that lift one node and lower another, keeping the search rule true while evening out the heights. An <b>AVL tree</b> keeps every node's two subtrees within one level of each other, which guarantees a height of at most about 1.44 · log₂ n. A <b>red-black tree</b> uses a looser rule, colouring nodes red or black to limit how lopsided it can get, for a height of at most 2 · log₂(n + 1) but fewer rotations. Either way search, insert and delete are all O(log n), <em>whatever the order of arrival</em>, with the same <code>Node</code> and the same search rule plus a little bookkeeping.</p>
<p>You do not have to write one. Java's <code>TreeMap</code> is a red-black tree, and <code>TreeSet</code> is built on a <code>TreeMap</code>: the structure behind the sorted collections you met in SC 106. That is why they print in order and can answer "the largest key at or below 5" in O(log n), which a hash table cannot do.</p>`,
        { predict: true, play: `import java.util.TreeSet;

public class Main {
    public static void main(String[] args) {
        TreeSet<Integer> set = new TreeSet<>();
        for (int k : new int[] {8, 3, 10, 1, 6, 14, 4, 7, 13}) set.add(k);
        System.out.println(set);
        System.out.println(set.first() + " " + set.last());
        System.out.println(set.floor(5) + " " + set.ceiling(5));
        System.out.println(set.contains(7) + " " + set.contains(9));
    }
}`, caption: 'The same nine keys as before. <code>[1, 3, 4, 6, 7, 8, 10, 13, 14]</code> is the in-order walk; <code>1 14</code> are the leftmost and rightmost nodes; <code>floor(5)</code> is the largest key at or below 5, which is 4, and <code>ceiling(5)</code> the smallest at or above, which is 6, so <code>4 6</code>; then <code>true false</code> from two searches. Every call walks one path down a balanced tree.' },
        { aside: `<p><b>Common mistakes in this lesson.</b> Believing that "binary search tree" means "balanced": it means only the rule, and a tree built from sorted data obeys it perfectly as a chain. Checking only a node's two children when testing the rule: every key in the whole left subtree must be smaller, not only the child. Forgetting the <code>null</code> case at the top of a recursion, so that an empty subtree throws a <code>NullPointerException</code>. In <code>insert</code>, writing <code>insert(t.left, key)</code> without assigning the result to <code>t.left</code>, so the new node is made and lost. In delete, handling the two-children case but forgetting that the successor must then be removed from the right subtree, which leaves its key in the tree twice.</p>` },
        { ex: {
            id: 'ds-9-1', skill: 'bst-search', title: 'insert and contains',
            prompt: `<p>Complete <code>IntBST</code>, a set of <code>int</code> keys held in a search tree. <code>Node</code> and the printing are finished. Write <code>boolean insert(int key)</code>, which adds the key as a new leaf in the right place, increases the size and returns <code>true</code>, or, if the key is already in the tree, changes nothing and returns <code>false</code>; and <code>boolean contains(int key)</code>. Write only the classes; the checker supplies its own <code>main</code>.</p>`,
            classes: true,
            starter: `class Node {\n    int key;\n    Node left, right;\n    Node(int key) { this.key = key; }\n}\n\nclass IntBST {\n    private Node root;\n    private int size;\n\n    int size() { return size; }\n\n    boolean insert(int key) {\n        // empty tree: the new node is the root\n        // otherwise walk down, going left or right, until the link you need is null\n        return false;\n    }\n\n    boolean contains(int key) {\n        return false;\n    }\n\n    public String toString() {                      // the keys in order, like [1, 3, 8]\n        StringBuilder sb = new StringBuilder("[");\n        inOrder(root, sb);\n        if (sb.length() > 1) sb.setLength(sb.length() - 2);\n        return sb.append("]").toString();\n    }\n\n    private void inOrder(Node t, StringBuilder sb) {\n        if (t == null) return;\n        inOrder(t.left, sb);\n        sb.append(t.key).append(", ");\n        inOrder(t.right, sb);\n    }\n}`,
            solution: `class Node {\n    int key;\n    Node left, right;\n    Node(int key) { this.key = key; }\n}\n\nclass IntBST {\n    private Node root;\n    private int size;\n\n    int size() { return size; }\n\n    boolean insert(int key) {\n        if (root == null) { root = new Node(key); size++; return true; }\n        Node cur = root;\n        while (true) {\n            if (key == cur.key) return false;\n            if (key < cur.key) {\n                if (cur.left == null) { cur.left = new Node(key); size++; return true; }\n                cur = cur.left;\n            } else {\n                if (cur.right == null) { cur.right = new Node(key); size++; return true; }\n                cur = cur.right;\n            }\n        }\n    }\n\n    boolean contains(int key) {\n        Node cur = root;\n        while (cur != null) {\n            if (key == cur.key) return true;\n            cur = key < cur.key ? cur.left : cur.right;\n        }\n        return false;\n    }\n\n    public String toString() {\n        StringBuilder sb = new StringBuilder("[");\n        inOrder(root, sb);\n        if (sb.length() > 1) sb.setLength(sb.length() - 2);\n        return sb.append("]").toString();\n    }\n\n    private void inOrder(Node t, StringBuilder sb) {\n        if (t == null) return;\n        inOrder(t.left, sb);\n        sb.append(t.key).append(", ");\n        inOrder(t.right, sb);\n    }\n}`,
            mustNotContain: [{ re: /java\.util|ArrayList|TreeSet|TreeMap|HashSet|int\s*\[\s*\]/, msg: 'Build the tree from Node objects only: no arrays and no library collections.' }],
            hints: ['contains: start with Node cur = root; while (cur != null) { if the key equals cur.key, return true; otherwise move cur to cur.left when the key is smaller, to cur.right when it is larger }. If the loop ends, the key is absent.', 'insert: if root is null, make it the root. Otherwise walk the same way, and stop at the node whose link on the correct side is null: put the new Node there. Return false the moment the key equals a key on the way.', 'size++ in every branch that adds a node, and nowhere else. A recursive version also works: root = insert(root, key) on a helper that returns the subtree, but then you must find out whether a node was added.'],
            tests: [
              { name: 'keys come out in order', main: '        IntBST t = new IntBST();\n        for (int k : new int[] {8, 3, 10, 1, 6, 14, 4, 7, 13}) t.insert(k);\n        System.out.println(t + " " + t.size());', expect: '[1, 3, 4, 6, 7, 8, 10, 13, 14] 9' },
              { name: 'insert reports whether it added', main: '        IntBST t = new IntBST();\n        System.out.println(t.insert(5) + " " + t.insert(5) + " " + t.insert(2) + " " + t.size());', expect: 'true false true 2' },
              { name: 'duplicates change nothing', main: '        IntBST t = new IntBST();\n        for (int k : new int[] {4, 4, 2, 4, 2}) t.insert(k);\n        System.out.println(t + " " + t.size());', expect: '[2, 4] 2' },
              { name: 'contains', main: '        IntBST t = new IntBST();\n        for (int k : new int[] {8, 3, 10, 1, 6, 14}) t.insert(k);\n        System.out.println(t.contains(6) + " " + t.contains(7) + " " + t.contains(14) + " " + t.contains(1) + " " + t.contains(0) + " " + t.contains(99));', expect: 'true false true true false false' },
              { name: 'the empty tree', main: '        IntBST t = new IntBST();\n        System.out.println(t + " " + t.size() + " " + t.contains(1));', expect: '[] 0 false' },
              { name: 'sorted input, a chain of sixty', main: '        IntBST t = new IntBST();\n        for (int k = 1; k <= 60; k++) t.insert(k);\n        for (int k = 60; k >= 1; k--) t.insert(k);\n        System.out.println(t.size() + " " + t.contains(60) + " " + t.contains(61));', expect: '60 true false' }
            ],
            failTip: 'If the tree prints with keys missing, insert probably made a new node but never linked it (cur.left = new Node(key), not just new Node(key)). If a duplicate is counted twice, the equal case is not checked before going left or right.',
            followup: 'Add int minKey() and int maxKey() (throw IllegalStateException on the empty tree), then int depthOf(int key), the number of comparisons a search for the key makes, or -1 if the key is absent. Insert 1 to 8 in order, and then in the order 4 2 6 1 3 5 7 8, and compare the deepest depthOf.'
          }
        },
        { ex: {
            id: 'ds-9-2', skill: 'bst-balance', title: 'Height and range',
            prompt: `<p>The class below has <code>insert</code> finished. Add <code>int height()</code>, the number of nodes on the longest path from the root down (the empty tree is 0, a single node is 1), and <code>int countRange(int lo, int hi)</code>, the number of keys <code>k</code> with <code>lo &lt;= k &lt;= hi</code>. Both are naturally recursive: write a private helper that takes a <code>Node</code>. For <code>countRange</code>, do not visit a subtree that cannot hold a key in the range: if a node's key is below <code>lo</code>, nothing in its left subtree can count. Write only the classes.</p>`,
            classes: true,
            starter: `class Node {\n    int key;\n    Node left, right;\n    Node(int key) { this.key = key; }\n}\n\nclass IntBST {\n    private Node root;\n\n    void insert(int key) {\n        if (root == null) { root = new Node(key); return; }\n        Node cur = root;\n        while (true) {\n            if (key == cur.key) return;\n            if (key < cur.key) {\n                if (cur.left == null) { cur.left = new Node(key); return; }\n                cur = cur.left;\n            } else {\n                if (cur.right == null) { cur.right = new Node(key); return; }\n                cur = cur.right;\n            }\n        }\n    }\n\n    int height() {\n        // 0 for an empty tree; otherwise 1 + the taller of the two subtrees\n        return 0;\n    }\n\n    int countRange(int lo, int hi) {\n        // keys k with lo <= k <= hi; skip a subtree that cannot contain one\n        return 0;\n    }\n}`,
            solution: `class Node {\n    int key;\n    Node left, right;\n    Node(int key) { this.key = key; }\n}\n\nclass IntBST {\n    private Node root;\n\n    void insert(int key) {\n        if (root == null) { root = new Node(key); return; }\n        Node cur = root;\n        while (true) {\n            if (key == cur.key) return;\n            if (key < cur.key) {\n                if (cur.left == null) { cur.left = new Node(key); return; }\n                cur = cur.left;\n            } else {\n                if (cur.right == null) { cur.right = new Node(key); return; }\n                cur = cur.right;\n            }\n        }\n    }\n\n    int height() { return heightOf(root); }\n\n    private int heightOf(Node t) {\n        if (t == null) return 0;\n        return 1 + Math.max(heightOf(t.left), heightOf(t.right));\n    }\n\n    int countRange(int lo, int hi) { return countIn(root, lo, hi); }\n\n    private int countIn(Node t, int lo, int hi) {\n        if (t == null) return 0;\n        if (t.key < lo) return countIn(t.right, lo, hi);\n        if (t.key > hi) return countIn(t.left, lo, hi);\n        return 1 + countIn(t.left, lo, hi) + countIn(t.right, lo, hi);\n    }\n}`,
            mustNotContain: [{ re: /java\.util|ArrayList|TreeSet|TreeMap|HashSet|int\s*\[\s*\]/, msg: 'Work on the nodes: no arrays and no library collections.' }],
            hints: ['height: the base case is the empty tree, 0. Otherwise it is 1 + Math.max(height of the left subtree, height of the right subtree). You need a private method that takes a Node, and height() just calls it with root.', 'countRange: for a node t, three cases. t.key < lo: nothing on the left can be in range, so the answer is the count in t.right. t.key > hi: the count in t.left. Otherwise t itself counts, and so may both sides: 1 + left + right.', 'Do not forget that both bounds are inclusive, and that lo > hi must give 0 (no key can satisfy it; your cases already cover this).'],
            tests: [
              { name: 'the empty tree', main: '        IntBST t = new IntBST();\n        System.out.println(t.height() + " " + t.countRange(0, 100));', expect: '0 0' },
              { name: 'one node', main: '        IntBST t = new IntBST();\n        t.insert(7);\n        System.out.println(t.height() + " " + t.countRange(7, 7) + " " + t.countRange(8, 9));', expect: '1 1 0' },
              { name: 'a small tree', main: '        IntBST t = new IntBST();\n        for (int k : new int[] {8, 3, 10, 1, 6, 14, 4, 7, 13}) t.insert(k);\n        System.out.println(t.height());', expect: '4' },
              { name: 'ranges are inclusive', main: '        IntBST t = new IntBST();\n        for (int k : new int[] {8, 3, 10, 1, 6, 14, 4, 7, 13}) t.insert(k);\n        System.out.println(t.countRange(4, 10) + " " + t.countRange(0, 100) + " " + t.countRange(5, 5) + " " + t.countRange(6, 6) + " " + t.countRange(10, 3));', expect: '5 9 0 1 0' },
              { name: 'a balanced tree', main: '        IntBST t = new IntBST();\n        for (int k : new int[] {4, 2, 6, 1, 3, 5, 7}) t.insert(k);\n        System.out.println(t.height() + " " + t.countRange(2, 6));', expect: '3 5' },
              { name: 'a chain of eighty, both ways', main: '        IntBST up = new IntBST(), down = new IntBST();\n        for (int k = 1; k <= 80; k++) { up.insert(k); down.insert(81 - k); }\n        System.out.println(up.height() + " " + down.height() + " " + up.countRange(10, 19) + " " + down.countRange(70, 90));', expect: '80 80 10 11' }
            ],
            failTip: 'If height is off by one, the base case is wrong: the empty tree is 0 (not -1, not 1). If countRange is too large, check that a key above hi is not counted and that both bounds are tested; if it is too small, a node inside the range still needs both of its subtrees searched.',
            followup: 'Make a counter field that goes up each time your countRange looks at a node, and compare it with the number of keys in the range on a tree of 63 balanced keys. A range with m keys in it should cost about m + the height. Why is the height there?'
          }
        },
        { ex: {
            id: 'ds-9-3', skill: 'bst-search', kind: 'answer', title: 'Read the tree',
            prompt: `<p>Insert these keys, in this order, into an empty binary search tree, with no balancing: <code>41, 20, 65, 11, 29, 50, 91, 32, 72, 99</code>. Draw the tree on paper first. Give whole numbers or keys as digits.</p>`,
            parts: [
              { label: '(a) What is the height of the tree (nodes on the longest path)?', answer: '4', width: '6rem', wrong: [{ match: '3', msg: 'That is the number of links on the longest path. This lesson counts nodes: 41, 20, 29, 32 is four.' }, { match: '10', msg: 'Ten is the number of keys. The height is the number of levels.' }] },
              { label: '(b) How many keys does a search for 32 compare it with, counting 32 itself?', answer: '4', width: '6rem', wrong: [{ match: '3', msg: 'The path is 41, 20, 29, 32, and the comparison that finds 32 is the fourth.' }] },
              { label: '(c) You now insert 70. Which key becomes its parent?', answer: '72', width: '6rem', wrong: [{ match: ['65', '91'], msg: 'Follow it down: 70 > 41 right, 70 > 65 right, 70 < 91 left, 70 < 72 left, and 72 has no left child. The last key on the path is the parent.' }] },
              { label: '(d) Which key comes immediately after 41 in an in-order walk (its in-order successor)?', answer: '50', width: '6rem', wrong: [{ match: ['65', '29'], msg: 'Go right once, to 65, then left as far as you can: 65 has a left child, 50, which has none. The successor is the leftmost key of the right subtree.' }] },
              { label: '(e) Insert 10, 20, 30, 40, 50, 60, 70 in that order into a different, empty tree. What is its height?', answer: '7', width: '6rem', wrong: [{ match: ['3', '4'], msg: 'That would be a balanced tree. Each key here is larger than all before it, so each goes right of the last: a chain of seven.' }] },
              { label: '(f) In that tree, how many keys is 70 compared with when it is inserted (not counting itself)?', answer: '6', width: '6rem', wrong: [{ match: '7', msg: '70 is not compared with itself: it is compared with 10, 20, 30, 40, 50 and 60, six keys, and then found a null link.' }] }
            ],
            hints: ['Insert one key at a time on paper: at each node go left if the new key is smaller and right if larger, and stop at the empty link. Write down the path of each insertion.', 'The tree has 41 at the root, 20 and 65 below it; 11 and 29 under 20; 50 and 91 under 65; 32 under 29; 72 and 99 under 91.', 'The in-order successor of a node with a right subtree: take one step right, then step left until you cannot.'],
            solution: `<p>The tree: 41 at the root; 20 (left) with children 11 and 29, where 29 has right child 32; 65 (right) with children 50 and 91, where 91 has children 72 and 99. (a) <b>4</b>: 41, 20, 29, 32 or 41, 65, 91, 72. (b) <b>4</b>. (c) <b>72</b>: 70 goes right, right, left, left, and becomes the left child of 72. (d) <b>50</b>: right to 65, then left to 50. (e) <b>7</b>, a chain. (f) <b>6</b>.</p>`,
            followup: 'Which of the ten keys, if it had arrived first, would have given the shortest tree for this set? (Think of the middle of the sorted list.) What would the height be?'
          }
        },
        { ex: {
            id: 'ds-9-4', skill: 'bst-search', title: 'remove',
            prompt: `<p>The class below has a working <code>insert</code>, <code>contains</code>, <code>size</code> and <code>shape</code> (which prints the tree as <code>(key left right)</code>, with <code>.</code> for an empty link). Write <code>boolean remove(int key)</code>: if the key is not in the tree it returns <code>false</code> and changes nothing; otherwise it removes the key, reduces the size and returns <code>true</code>. Use the three cases from the lesson, and for a node with two children use its <b>in-order successor</b> (the smallest key in its right subtree), so that the shapes come out as expected. Write only the classes.</p>`,
            classes: true,
            starter: `class Node {\n    int key;\n    Node left, right;\n    Node(int key) { this.key = key; }\n}\n\nclass IntBST {\n    private Node root;\n    private int size;\n\n    int size() { return size; }\n\n    boolean contains(int key) {\n        Node cur = root;\n        while (cur != null) {\n            if (key == cur.key) return true;\n            cur = key < cur.key ? cur.left : cur.right;\n        }\n        return false;\n    }\n\n    void insert(int key) { if (contains(key)) return; root = insert(root, key); size++; }\n\n    private Node insert(Node t, int key) {\n        if (t == null) return new Node(key);\n        if (key < t.key) t.left = insert(t.left, key);\n        else if (key > t.key) t.right = insert(t.right, key);\n        return t;\n    }\n\n    boolean remove(int key) {\n        // false if the key is absent; otherwise root = remove(root, key), size--, true\n        return false;\n    }\n\n    private Node remove(Node t, int key) {\n        // returns the subtree that should now hang where t hung\n        return t;\n    }\n\n    String shape() { return shape(root); }\n\n    private String shape(Node t) {\n        if (t == null) return ".";\n        return "(" + t.key + " " + shape(t.left) + " " + shape(t.right) + ")";\n    }\n}`,
            solution: `class Node {\n    int key;\n    Node left, right;\n    Node(int key) { this.key = key; }\n}\n\nclass IntBST {\n    private Node root;\n    private int size;\n\n    int size() { return size; }\n\n    boolean contains(int key) {\n        Node cur = root;\n        while (cur != null) {\n            if (key == cur.key) return true;\n            cur = key < cur.key ? cur.left : cur.right;\n        }\n        return false;\n    }\n\n    void insert(int key) { if (contains(key)) return; root = insert(root, key); size++; }\n\n    private Node insert(Node t, int key) {\n        if (t == null) return new Node(key);\n        if (key < t.key) t.left = insert(t.left, key);\n        else if (key > t.key) t.right = insert(t.right, key);\n        return t;\n    }\n\n    boolean remove(int key) {\n        if (!contains(key)) return false;\n        root = remove(root, key);\n        size--;\n        return true;\n    }\n\n    private Node remove(Node t, int key) {\n        if (t == null) return null;\n        if (key < t.key) t.left = remove(t.left, key);\n        else if (key > t.key) t.right = remove(t.right, key);\n        else {\n            if (t.left == null) return t.right;\n            if (t.right == null) return t.left;\n            Node s = t.right;\n            while (s.left != null) s = s.left;\n            t.key = s.key;\n            t.right = remove(t.right, s.key);\n        }\n        return t;\n    }\n\n    String shape() { return shape(root); }\n\n    private String shape(Node t) {\n        if (t == null) return ".";\n        return "(" + t.key + " " + shape(t.left) + " " + shape(t.right) + ")";\n    }\n}`,
            mustNotContain: [{ re: /java\.util|ArrayList|TreeSet|TreeMap|HashSet|int\s*\[\s*\]/, msg: 'Work on the nodes: no arrays and no library collections.' }],
            hints: ['Write the recursive helper first. It goes down like a search: key < t.key, assign t.left = remove(t.left, key); key > t.key, assign t.right = remove(t.right, key). The case where the keys are equal is where the three cases live. Return t at the end.', 'Equal keys: if t.left == null, return t.right (this covers a leaf, since t.right is then null too). Else if t.right == null, return t.left. Both present: find the successor, Node s = t.right; while (s.left != null) s = s.left.', 'Two children: copy the successor key up with t.key = s.key; then delete the successor from the right subtree with t.right = remove(t.right, s.key). The public remove(int) checks contains first, so it can reduce size once and return true.'],
            tests: [
              { name: 'remove a leaf', main: '        IntBST t = new IntBST();\n        for (int k : new int[] {8, 3, 10, 1, 6, 14, 4, 7, 13}) t.insert(k);\n        System.out.println(t.remove(1) + " " + t.shape() + " " + t.size());', expect: 'true (8 (3 . (6 (4 . .) (7 . .))) (10 . (14 (13 . .) .))) 8' },
              { name: 'remove a node with one child', main: '        IntBST t = new IntBST();\n        for (int k : new int[] {8, 3, 10, 1, 6, 14, 4, 7, 13}) t.insert(k);\n        System.out.println(t.remove(14) + " " + t.shape() + " " + t.size());', expect: 'true (8 (3 (1 . .) (6 (4 . .) (7 . .))) (10 . (13 . .))) 8' },
              { name: 'two children, below the root', main: '        IntBST t = new IntBST();\n        for (int k : new int[] {8, 3, 10, 1, 6, 14, 4, 7, 13}) t.insert(k);\n        System.out.println(t.remove(3) + " " + t.shape() + " " + t.size());', expect: 'true (8 (4 (1 . .) (6 . (7 . .))) (10 . (14 (13 . .) .))) 8' },
              { name: 'two children, the root', main: '        IntBST t = new IntBST();\n        for (int k : new int[] {8, 3, 10, 1, 6, 14, 4, 7, 13}) t.insert(k);\n        System.out.println(t.remove(8) + " " + t.shape() + " " + t.size());', expect: 'true (10 (3 (1 . .) (6 (4 . .) (7 . .))) (14 (13 . .) .)) 8' },
              { name: 'an absent key', main: '        IntBST t = new IntBST();\n        for (int k : new int[] {5, 2, 9}) t.insert(k);\n        System.out.println(t.remove(7) + " " + t.shape() + " " + t.size());\n        IntBST e = new IntBST();\n        System.out.println(e.remove(1) + " " + e.shape() + " " + e.size());', expect: 'false (5 (2 . .) (9 . .)) 3\nfalse . 0' },
              { name: 'remove everything', main: '        IntBST t = new IntBST();\n        int[] keys = {8, 3, 10, 1, 6, 14, 4, 7, 13};\n        for (int k : keys) t.insert(k);\n        for (int k : keys) t.remove(k);\n        System.out.println(t.shape() + " " + t.size());\n        t.insert(5);\n        System.out.println(t.shape() + " " + t.size());', expect: '. 0\n(5 . .) 1' },
              { name: 'a chain of seventy', main: '        IntBST t = new IntBST();\n        for (int k = 1; k <= 70; k++) t.insert(k);\n        t.remove(1); t.remove(70); t.remove(35);\n        System.out.println(t.size() + " " + t.contains(2) + " " + t.contains(35) + " " + t.contains(36));', expect: '67 true false true' }
            ],
            failTip: 'If a key is still found after remove, or appears twice, the two-children case copied the successor up but did not delete the successor node from the right subtree. If the whole tree vanishes, a recursive call is not assigned back (t.left = remove(t.left, key), not just remove(t.left, key)).',
            followup: 'Write int removeMin(), which removes the smallest key and returns it (it is a special case of remove: go left until the node has no left child, and let its right subtree take its place). Then use it, in a loop, to print all the keys in order while emptying the tree. Is that faster or slower than an in-order walk on a tree that is a chain?'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A <b>binary search tree</b> is nodes with a key and two links, <code>left</code> and <code>right</code>, obeying one rule at every node: everything in the left subtree is smaller, everything in the right is larger.</li>
<li><b>Search</b> and <b>insert</b> follow one path down from the root, going left or right at each node; a new key always becomes a new leaf at the <code>null</code> link where the search fell off. An <b>in-order</b> walk reads the keys sorted. Min and max are the leftmost and rightmost nodes.</li>
<li><b>Delete</b> has three cases: a leaf (drop it), one child (the child takes its place), two children (copy the in-order successor up and delete that node from the right subtree).</li>
<li>Every one of those costs <b>O(height)</b>. Height is about log n when the keys arrive in a mixed order and n when they arrive sorted, because then the tree is a linked list leaning to one side. That is the answer to the opening question: <em>the order of arrival decides the shape, and the shape is the whole cost</em>; you can see the danger in advance by computing the height.</li>
<li>Self-balancing trees (AVL, 1962; red-black) repair the shape with rotations after every change and keep search, insert and delete at O(log n) whatever the order. Java's <code>TreeMap</code> and <code>TreeSet</code> are red-black trees. Heaps, later in the course, are trees too, with a different rule.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standard: 1,
      standards: ['3B-AP-12', '3B-AP-11', '3B-AP-10'],
      title: 'Heaps and priority queues', summary: 'A queue that always serves the smallest item first; why neither a sorted nor an unsorted array can do it cheaply; the binary heap, a tree stored flat in an array; sift up and sift down in O(log n); heapsort; Java’s PriorityQueue; and the k-largest pattern.',
      blocks: [
        `<p>In 1964 J. W. J. Williams published a short paper in <em>Communications of the ACM</em> called &ldquo;Algorithm 232: Heapsort&rdquo;. Sorting was already well studied, but his method had a property that its rivals lacked. Merge sort needs a second array. Quicksort can slow to n&sup2; on an unlucky input. Williams&rsquo;s method needed no spare array and took n log n steps whatever the input. To do it he described a new way to arrange numbers, the <em>heap</em>: a tree with no pointers at all, stored flat in an ordinary array, with the smallest (or the largest) value always in the first cell.</p>
<p>The heap turned out to be more useful than the sort it was invented for. Any program that must always deal with the most urgent thing next, while new things keep arriving, wants one. So how can a tree live in an array, and why does that make the smallest item both easy to find and cheap to take out?</p>
<h2>Smallest first</h2>
<div class="stmt"><p><span class="kind">Priority queue.</span> A collection with three operations: <code>add(x)</code> puts an item in; <code>peek()</code> shows the <em>smallest</em> item without removing it; <code>poll()</code> removes and returns the smallest. Unlike a queue, the order of arrival does not matter: what comes out next is decided by size (the &ldquo;priority&rdquo;), and the item that has waited longest is not necessarily next.</p></div>
<p>It is an abstract data type, like the stack and the queue of lesson 7: a promise about behaviour, with the cost left open. Two arrays keep the promise, and both are slow somewhere.</p>
<table class="growth-table"><thead><tr><th>Structure with n items</th><th><code>add</code></th><th><code>peek</code></th><th><code>poll</code></th></tr></thead><tbody>
<tr><td>Unsorted array</td><td>O(1): append</td><td>O(n): look at every cell</td><td>O(n): find the smallest, then fill the hole</td></tr>
<tr><td>Sorted array, smallest last</td><td>O(n): shift to make room</td><td>O(1)</td><td>O(1)</td></tr>
<tr><td>Binary heap</td><td>O(log n)</td><td>O(1)</td><td>O(log n)</td></tr>
</tbody></table>
<p>For n adds followed by n polls, either array costs about n&sup2; steps, which is the n&sup2; of the simple sorts. The heap costs about n log n. It does not keep everything in order, only enough order to know the smallest. Java already has one, <code>PriorityQueue</code>, and this lesson builds it. First see what it does.</p>`,
        { play: `import java.util.PriorityQueue;

public class Main {
    public static void main(String[] args) {
        PriorityQueue<Integer> waiting = new PriorityQueue<>();   // the smallest comes out first
        waiting.add(40); waiting.add(10); waiting.add(30); waiting.add(20);
        System.out.println("next: " + waiting.peek() + ", waiting: " + waiting.size());
        while (!waiting.isEmpty()) System.out.print(waiting.poll() + " ");
        System.out.println();
    }
}`, predict: true, caption: 'It prints <code>next: 10, waiting: 4</code> and then <code>10 20 30 40</code>. The numbers went in as 40, 10, 30, 20 and came out by size. <code>peek</code> looked at the front and left it; each <code>poll</code> took it away. Add a fifth number smaller than all the others before the loop and watch it jump the queue.' },
        `<h2>A tree in an array</h2>
<p>A <em>binary tree</em> is made of nodes that each have at most two children. Trees are often built from nodes with a pointer to each child. A heap needs no pointers, because it is always a <em>complete</em> tree: every level is full except possibly the last, and the last is filled from the left with no gaps. Number the nodes level by level, from left to right, starting at 0, and put each in the array cell with its own number. Then the tree&rsquo;s shape is the array&rsquo;s length, and a node&rsquo;s neighbours are found by arithmetic.</p>
<div class="stmt"><p><span class="kind">Index arithmetic.</span> The node at index <code>i</code> has its <em>left child</em> at <code>2i + 1</code>, its <em>right child</em> at <code>2i + 2</code>, and its <em>parent</em> at <code>(i − 1) / 2</code> (integer division). The root is index 0 and has no parent; a node has a child only if that index is less than the number of items.</p>
<p><span class="kind">The heap rule.</span> In a <em>min-heap</em> every parent is less than or equal to each of its children. So the root is the smallest item of all. Nothing is promised about the two children of a node, or about cousins: a heap is much less ordered than a sorted array.</p></div>
<p>Height is why this matters. A complete tree with n nodes has about log₂ n levels, so a walk from a leaf up to the root, or from the root down to a leaf, takes at most about log₂ n steps: a million items need only 20 levels.</p>`,
        { play: `public class Main {
    static boolean isHeap(int[] a) {
        for (int i = 1; i < a.length; i++) {
            int parent = (i - 1) / 2;
            if (a[parent] > a[i]) return false;      // a parent larger than its child breaks the rule
        }
        return true;
    }

    public static void main(String[] args) {
        int[] yes = {2, 5, 3, 9, 6, 4, 8};
        int[] no  = {2, 5, 3, 9, 6, 1, 8};
        System.out.println(isHeap(yes) + " " + isHeap(no));
        for (int i = 0; i < 3; i++)
            System.out.println("node " + i + " has children " + (2 * i + 1) + " and " + (2 * i + 2));
        System.out.println("node 5 has parent " + (5 - 1) / 2);
    }
}`, predict: true, caption: 'It prints <code>true false</code>, then the children of nodes 0, 1 and 2 (<code>1 and 2</code>, <code>3 and 4</code>, <code>5 and 6</code>) and <code>node 5 has parent 2</code>. In the second array the 1 at index 5 sits under the 3 at index (5 − 1) / 2 = 2: a parent larger than its child. The loop asks only that question, once per item except the root, and that is all the heap rule is. Change a value in <code>yes</code> to break it.' },
        { check: 'A heap is stored in a Java array. Where are the children of the item at index 3?', skill: 'heap-sift', options: ['Indexes 6 and 7', 'Indexes 7 and 8', 'Indexes 4 and 5'], answer: 1, wrong: ['2i is the formula when counting starts at 1. Java arrays start at 0, so the children are at 2i + 1 and 2i + 2.', null, 'Those are only the cells next to 3. A whole level is stored before the next level begins, so the children of 3 are further along: 2·3 + 1 = 7 and 2·3 + 2 = 8.'], why: 'The left child of i is 2i + 1 = 7 and the right child is 2i + 2 = 8. Going the other way, the parent of 7 or 8 is (7 − 1) / 2 = 3 or (8 − 1) / 2 = 3: integer division gives the same parent for both.' },
        `<h2>Insert: sift up</h2>
<div class="stmt"><p><span class="kind">Insert.</span> Put the new item in the first free cell, at index <code>size</code>, so the tree stays complete. That may break the rule between it and its parent, and only there. While the item is smaller than its parent, swap them and move up. Stop at the root or when the parent is no larger. This is <em>sift up</em>.</p>
<p><span class="kind">Cost.</span> Each swap moves the item up one level, so at most about log₂ n swaps: O(log n). Often fewer: a random new item usually stays near the bottom.</p></div>`,
        { fig: 'heap', start: [2, 5, 3, 9, 6, 4, 8], caption: 'The heap from the last example, as a tree and as an array: the same cells are lit in both. Insert 1 and step: it is compared with its parent, swaps, and climbs three levels to the root. Then insert 7: it is no smaller than its parent, so nothing moves. Try a number larger than everything.' },
        { play: `import java.util.Arrays;

public class Main {
    static int[] heap = new int[16];
    static int size = 0;

    static void insert(int x) {
        int i = size++;
        heap[i] = x;                                     // the first free cell
        while (i > 0 && heap[(i - 1) / 2] > heap[i]) {   // sift up
            int p = (i - 1) / 2;
            int t = heap[p]; heap[p] = heap[i]; heap[i] = t;
            i = p;
        }
    }

    public static void main(String[] args) {
        for (int x : new int[] {5, 3, 8, 1, 9, 2}) {
            insert(x);
            System.out.println("insert " + x + ": " + Arrays.toString(Arrays.copyOf(heap, size)));
        }
    }
}`, predict: true, caption: 'It prints <code>[5]</code>, <code>[3, 5]</code>, <code>[3, 5, 8]</code>, <code>[1, 3, 8, 5]</code>, <code>[1, 3, 8, 5, 9]</code> and <code>[1, 3, 2, 5, 9, 8]</code>. Inserting 1 needed two swaps (index 3 → 1 → 0), and inserting 2 needed one (index 5 → 2, then the root 1 is smaller, so it stops). The array is never sorted, only a heap: 8 sits before 5. Remember this array, it comes back at the end of the lesson.' },
        `<h2>Remove: sift down</h2>
<div class="stmt"><p><span class="kind">Remove the smallest.</span> The smallest is the root, <code>heap[0]</code>. Removing it leaves a hole at the top and the array one cell too long. Fix both at once: move the <em>last</em> item into the root and shrink the size by one. The tree is complete again, but the rule may be broken at the root. While the item is larger than a child, swap it with its <em>smaller</em> child and move down. Stop at a leaf or when it is no larger than both children. This is <em>sift down</em>.</p>
<p><span class="kind">Why the smaller child?</span> After the swap that child becomes the parent of the other one. If it were the larger, it would sit above a smaller sibling and break the rule.</p>
<p><span class="kind">Cost.</span> One swap per level: at most about log₂ n, so O(log n). Reading the smallest, <code>peek</code>, is O(1).</p></div>`,
        { fig: 'heap', start: [1, 3, 2, 5, 9, 8, 4, 7, 6, 10], caption: 'Remove min and step: the 1 leaves, the last item (10) takes the root, and it sinks, each time past the smaller of its two children (the other child is drawn with a dashed ring). Two swaps for ten items. Remove again and again to see the items leave in order.' },
        { play: `import java.util.Arrays;

public class Main {
    static int[] heap = {1, 3, 2, 5, 9, 8, 4};
    static int size = 7;
    static int removeMin() {
        int min = heap[0];
        heap[0] = heap[--size];                      // the last item takes the root
        int i = 0;
        while (2 * i + 1 < size) {                   // sift down while i has a child
            int c = 2 * i + 1;                       // the left child ...
            if (c + 1 < size && heap[c + 1] < heap[c]) c++;   // ... or the right, if smaller
            if (heap[i] <= heap[c]) break;           // the rule holds: stop
            int t = heap[i]; heap[i] = heap[c]; heap[c] = t;
            i = c;
        }
        return min;
    }
    public static void main(String[] args) {
        for (int k = 0; k < 3; k++) {
            int m = removeMin();
            System.out.println("removed " + m + ": " + Arrays.toString(Arrays.copyOf(heap, size)));
        }
    }
}`, predict: true, caption: 'It prints <code>removed 1: [2, 3, 4, 5, 9, 8]</code>, <code>removed 2: [3, 5, 4, 8, 9]</code> and <code>removed 3: [4, 5, 9, 8]</code>. The first removal moves 4 to the root, and 4 swaps with the 2, the smaller of 3 and 2. The items come out 1, 2, 3 in order, and each removal repaired the heap with at most a few swaps instead of re-sorting. The <code>c + 1 &lt; size</code> test is there because a node may have only a left child.' },
        { check: 'Sifting down, an item <code>9</code> has two children, <code>7</code> (left) and <code>5</code> (right). Which does it swap with?', skill: 'heap-sift', options: ['The left child, 7: always go left', 'The right child, 5: the smaller child', 'The left child, 7: the larger, so the big values stay near the top'], answer: 1, wrong: ['Left or right does not matter; the values do. After swapping with 7 the 7 would sit above the 5, a parent larger than its child, and the heap rule would break.', null, 'That is the rule for a <em>max</em>-heap, where the larger child goes up. In a min-heap the smaller child must go up, or it ends up under a larger parent.'], why: 'The smaller child, 5, moves up and becomes the parent of 7, which is larger than 5, so the rule holds there. Then the 9 carries on down from where the 5 was.' },
        `<h2>Heapsort</h2>
<p>A priority queue sorts for free: add everything, then poll until empty, and the items come out in order. That is n adds and n polls, O(n log n), but it uses a second array. Williams&rsquo;s trick was to do it in the <em>same</em> array. Use a <em>max</em>-heap (parent ≥ children, the largest at the root) and two phases.</p>
<div class="stmt"><p><span class="kind">Heapsort.</span> <b>Build:</b> turn the array into a max-heap by sifting down every node that has a child, from the last of them, index <code>n/2 − 1</code>, back to 0. <b>Sort:</b> repeat n − 1 times: swap the root with the last cell of the heap, shrink the heap by one (that cell now holds its final value, the largest left), and sift the new root down.</p>
<p><span class="kind">Cost.</span> The sort phase is n sift-downs of at most log n: O(n log n), whatever the input, and it needs only a few variables beyond the array. Building looks like another n log n but is only O(n): half the nodes are leaves and never move, a quarter move at most one level, and so on. The sort is not stable. In practice quicksort and merge sort usually run faster, which is why heapsort is mostly used as a guarantee: the fallback of lesson 4&rsquo;s introsort.</p></div>`,
        { play: `import java.util.Arrays;

public class Main {
    static void siftDown(int[] a, int i, int n) {         // a MAX-heap: parent >= children
        while (2 * i + 1 < n) {
            int c = 2 * i + 1;
            if (c + 1 < n && a[c + 1] > a[c]) c++;        // the larger child
            if (a[i] >= a[c]) break;
            int t = a[i]; a[i] = a[c]; a[c] = t;
            i = c;
        }
    }

    public static void main(String[] args) {
        int[] a = {5, 3, 8, 1, 9, 2};
        for (int i = a.length / 2 - 1; i >= 0; i--) siftDown(a, i, a.length);   // build the heap
        System.out.println("max-heap: " + Arrays.toString(a));
        for (int end = a.length - 1; end > 0; end--) {
            int t = a[0]; a[0] = a[end]; a[end] = t;      // the largest goes to its final cell
            siftDown(a, 0, end);                          // the heap is now a[0..end-1]
        }
        System.out.println("sorted:   " + Arrays.toString(a));
    }
}`, predict: true, caption: 'It prints <code>max-heap: [9, 5, 8, 1, 3, 2]</code> and <code>sorted:   [1, 2, 3, 5, 8, 9]</code>. Building made 9 the root. Each pass of the second loop then moved the biggest remaining value to the end, where the sorted part grows from the right while the heap shrinks on the left, all in one array. Add a <code>System.out.println</code> inside the loop to watch it.' },
        `<h2>Java&rsquo;s PriorityQueue</h2>
<p>You will not write a heap every time you need one. <code>java.util.PriorityQueue</code> is a binary heap in an array, as built above (a min-heap by default). <code>add</code> and <code>poll</code> are O(log n) and <code>peek</code> is O(1); <code>size</code> and <code>isEmpty</code> are O(1); <code>contains</code> and <code>remove(x)</code> must search, O(n). Printing one shows the heap&rsquo;s array, <em>not</em> the sorted order: the only promise is that the front is the smallest.</p>`,
        { play: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        for (int x : new int[] {5, 3, 8, 1, 9, 2}) pq.add(x);
        System.out.println(pq);                       // the heap's array, not sorted order
        System.out.println(pq.poll() + " " + pq);
        PriorityQueue<Integer> big = new PriorityQueue<>(Collections.reverseOrder());
        big.addAll(pq);                               // a max-heap: the largest first
        System.out.println(big.peek() + " " + big);
    }
}`, predict: true, caption: 'It prints <code>[1, 3, 2, 5, 9, 8]</code>, then <code>1 [2, 3, 8, 5, 9]</code>, then <code>9 [9, 8, 3, 2, 5]</code>. The first line is exactly the array of the insert example, because Java&rsquo;s own heap uses the same sift up; the second is the sift down of the remove example. <code>Collections.reverseOrder()</code> turns the min-heap into a max-heap, and the array order changes with it.' },
        { check: '<code>PriorityQueue&lt;Integer&gt; pq</code> receives <code>add(5)</code>, <code>add(8)</code>, <code>add(3)</code>, in that order. What does <code>System.out.println(pq)</code> print?', skill: 'priority-queue', options: ['<code>[3, 5, 8]</code>: it keeps its items sorted', '<code>[3, 8, 5]</code>: the heap’s array', '<code>[5, 8, 3]</code>: the order they were added'], answer: 1, wrong: ['A heap is only ordered enough to know the smallest. Printing shows the array: 5, 8, then 3 arrives at index 2 and swaps with its parent 5, giving [3, 8, 5].', null, 'The new 3 does not stay at the end: it is smaller than its parent 5 (index 0), so it climbs to the root.'], why: 'The array grows [5], [5, 8], and then 3 is added at index 2, smaller than its parent 5, so it swaps: [3, 8, 5]. The front is the smallest, but the rest is not in order. To get sorted order, poll repeatedly.' },
        `<p>A priority queue needs to compare its items. <code>Integer</code> and <code>String</code> already know how. For your own class, implement <code>Comparable</code> (its <code>compareTo</code> returns a negative number when <em>this</em> item should come out first), or pass a <code>Comparator</code> object to the constructor: <code>new PriorityQueue&lt;&gt;(new ByUrgency())</code> for a class <code>ByUrgency</code> that implements <code>Comparator&lt;Task&gt;</code>. Two items that compare as equal come out in no promised order: a heap is not stable.</p>`,
        { play: `import java.util.*;

class Task implements Comparable<Task> {
    String name; int urgency;
    Task(String name, int urgency) { this.name = name; this.urgency = urgency; }
    public int compareTo(Task other) { return Integer.compare(urgency, other.urgency); }   // smaller first
}

public class Main {
    public static void main(String[] args) {
        PriorityQueue<Task> todo = new PriorityQueue<>();
        todo.add(new Task("homework", 3));
        todo.add(new Task("feed the cat", 1));
        todo.add(new Task("laundry", 5));
        todo.add(new Task("exam notes", 2));
        while (!todo.isEmpty()) { Task t = todo.poll(); System.out.println(t.urgency + " " + t.name); }
    }
}`, predict: true, caption: 'It prints <code>1 feed the cat</code>, <code>2 exam notes</code>, <code>3 homework</code>, <code>5 laundry</code>. The queue calls <code>compareTo</code> inside its sift up and sift down; nothing else about the class matters. Change <code>compareTo</code> to <code>Integer.compare(other.urgency, urgency)</code> and the most urgent number comes last-first.' },
        `<p><span class="kind">The k largest.</span> A common job: of a million numbers, find the ten largest. Sorting them all costs n log n. Instead keep a <em>min</em>-heap of at most k items. Add each number; when the heap holds k + 1 items, poll, which throws away the smallest of them. What is left is the k largest seen so far.</p>
<pre class="code"><code>PriorityQueue&lt;Integer&gt; best = new PriorityQueue&lt;&gt;();   // holds the k largest so far
for (int x : data) {
    best.add(x);
    if (best.size() &gt; k) best.poll();                      // drop the smallest of k + 1
}</code></pre>
<p>Each number costs O(log k), so n numbers cost O(n log k), and memory is k, not n. It works on a stream you can only read once. A min-heap to find the largest looks backwards, but the item at risk of being thrown out is the smallest of the k, and that is what a min-heap has at its front.</p>
<p><span class="kind">In real systems.</span> Schedulers that pick the next job by priority and simulations that always process the earliest event are usually built on a priority queue. The next lesson uses one for Dijkstra&rsquo;s shortest-path algorithm, and lesson 4&rsquo;s introsort falls back to heapsort.</p>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Using <code>2i</code> and <code>2i + 1</code> for the children (that counts from 1; arrays count from 0). Reading <code>(i − 1) / 2</code> as a fraction: it is integer division, so 5 and 6 both have parent 2. Swapping with the larger child in a min-heap, or with the left child without comparing. Forgetting <code>c + 1 &lt; size</code>, so the right child reads past the end. Sifting up from the wrong index after a swap (set <code>i = p</code>). Expecting <code>println(pq)</code> or iteration over a PriorityQueue to be sorted. Calling <code>remove()</code> or <code>element()</code> on an empty queue, which throws <code>NoSuchElementException</code>; <code>poll()</code> and <code>peek()</code> return <code>null</code> instead.</p>` },
        {
          ex: {
            id: 'ds-10-1', skill: 'heap-sift', title: 'A min-heap of ints',
            prompt: `<p>Complete the class <code>MinHeap</code>: a binary min-heap of <code>int</code> in an array that starts with 4 cells and doubles when full. <code>insert(x)</code> adds by sift up; <code>extractMin()</code> removes and returns the smallest by sift down; <code>peek()</code> returns it without removing it; <code>size()</code> is the number of items. <code>peek</code> and <code>extractMin</code> on an empty heap throw <code>IllegalStateException</code> with the message <code>empty heap</code>. Use loops, not recursion, and the layout of this lesson, so that <code>toString</code> (given) shows the same array as the examples. Write only the class.</p>`,
            classes: true,
            prelude: 'import java.util.Arrays;',
            starter: `class MinHeap {
    private int[] a = new int[4];
    private int size = 0;

    int size() { return size; }

    public String toString() { return Arrays.toString(Arrays.copyOf(a, size)); }

    int peek() {
        // throw if empty; the smallest is at index 0
        return 0;
    }

    void insert(int x) {
        // double the array if full; write x at index size; sift up while the parent is larger
    }

    int extractMin() {
        // throw if empty; save a[0]; move the last item to index 0; shrink; sift down by the smaller child
        return 0;
    }
}`,
            solution: `class MinHeap {
    private int[] a = new int[4];
    private int size = 0;

    int size() { return size; }

    public String toString() { return Arrays.toString(Arrays.copyOf(a, size)); }

    int peek() {
        if (size == 0) throw new IllegalStateException("empty heap");
        return a[0];
    }

    void insert(int x) {
        if (size == a.length) a = Arrays.copyOf(a, a.length * 2);
        int i = size++;
        a[i] = x;
        while (i > 0 && a[(i - 1) / 2] > a[i]) {
            int p = (i - 1) / 2;
            int t = a[p]; a[p] = a[i]; a[i] = t;
            i = p;
        }
    }

    int extractMin() {
        if (size == 0) throw new IllegalStateException("empty heap");
        int min = a[0];
        a[0] = a[--size];
        int i = 0;
        while (2 * i + 1 < size) {
            int c = 2 * i + 1;
            if (c + 1 < size && a[c + 1] < a[c]) c++;
            if (a[i] <= a[c]) break;
            int t = a[i]; a[i] = a[c]; a[c] = t;
            i = c;
        }
        return min;
    }
}`,
            mustNotContain: [{ re: /PriorityQueue|ArrayList|LinkedList|Arrays\.sort|Collections\.sort/, msg: 'Build the heap on a plain int array; the library classes are what you are learning to write.' }],
            hints: ['insert: grow with Arrays.copyOf if size == a.length, then int i = size++; a[i] = x; and loop while i > 0 and a[(i - 1) / 2] > a[i]: swap them and set i to the parent.', 'extractMin: save a[0], then a[0] = a[--size] to move the last item to the root and shrink in one step, and sift it down.', 'Sift down: while (2 * i + 1 < size) pick c = 2 * i + 1, and c + 1 if it exists and is smaller; if a[i] <= a[c] stop; otherwise swap a[i] and a[c] and set i = c.'],
            tests: [
              { name: 'inserts make the array of the lesson', main: '        MinHeap h = new MinHeap();\n        for (int x : new int[] {5, 3, 8, 1, 9, 2}) h.insert(x);\n        System.out.println(h + " " + h.size() + " " + h.peek());', expect: '[1, 3, 2, 5, 9, 8] 6 1' },
              { name: 'extractMin repairs the array', main: '        MinHeap h = new MinHeap();\n        for (int x : new int[] {5, 3, 8, 1, 9, 2}) h.insert(x);\n        System.out.println(h.extractMin() + " " + h + " " + h.extractMin() + " " + h);', expect: '1 [2, 3, 8, 5, 9] 2 [3, 5, 8, 9]' },
              { name: 'a thousand in, a thousand out in order', main: '        MinHeap h = new MinHeap();\n        for (int i = 0; i < 1000; i++) h.insert((i * 37) % 1000);\n        int prev = -1, n = 0; boolean ok = true;\n        while (h.size() > 0) { int v = h.extractMin(); if (v < prev) ok = false; prev = v; n++; }\n        System.out.println(ok + " " + n + " " + prev);', expect: 'true 1000 999' },
              { name: 'duplicates and negatives', main: '        MinHeap h = new MinHeap();\n        for (int x : new int[] {4, 4, 4, -2, 4, 0}) h.insert(x);\n        StringBuilder sb = new StringBuilder();\n        while (h.size() > 0) sb.append(h.extractMin()).append(" ");\n        System.out.println(sb.toString().trim());', expect: '-2 0 4 4 4 4' },
              { name: 'peek does not remove', main: '        MinHeap h = new MinHeap();\n        h.insert(7); h.insert(3);\n        System.out.println(h.peek() + " " + h.peek() + " " + h.size());', expect: '3 3 2' },
              { name: 'interleaved inserts and removals', main: '        MinHeap h = new MinHeap();\n        h.insert(5); h.insert(2); int a = h.extractMin(); h.insert(1); h.insert(9);\n        int b = h.extractMin(), c = h.extractMin(), d = h.extractMin();\n        System.out.println(a + " " + b + " " + c + " " + d + " " + h.size());', expect: '2 1 5 9 0' },
              { name: 'an empty heap throws', main: '        MinHeap h = new MinHeap();\n        try { h.extractMin(); } catch (IllegalStateException e) { System.out.println("extractMin: " + e.getMessage()); }\n        try { h.peek(); } catch (IllegalStateException e) { System.out.println("peek: " + e.getMessage()); }\n        h.insert(1); h.extractMin();\n        try { h.extractMin(); } catch (IllegalStateException e) { System.out.println("again: " + e.getMessage()); }', expect: 'extractMin: empty heap\npeek: empty heap\nagain: empty heap' }
            ],
            failTip: 'If the first test shows [1, 3, 2, 5, 9, 8] wrong, insert is not sifting up from index size. If extractMin gives a right answer but the array is wrong, the sift down chose the left child instead of the smaller one. An ArrayIndexOutOfBounds error usually means c + 1 < size was not tested before reading a[c + 1].',
            followup: 'Add a method that builds a heap from an int array in O(n): copy the array in, then sift down every index from size / 2 − 1 back to 0, the build phase of heapsort.'
          }
        },
        {
          ex: {
            id: 'ds-10-2', skill: 'heap-sift', title: 'Heapsort',
            prompt: `<p>Write</p><pre class="code">static void heapSort(int[] a)</pre><p>that sorts <code>a</code> into increasing order <em>in place</em>, by heapsort: build a max-heap by sifting down every node with a child, from index <code>n / 2 − 1</code> back to 0; then n − 1 times, swap the root with the last cell of the heap, shrink the heap, and sift the root down. The method <code>siftDown(a, i, n)</code> is given: it sifts <code>a[i]</code> down inside the first <code>n</code> cells of a max-heap. Do not use the library&rsquo;s sort or a second array.</p>`,
            prelude: 'import java.util.Arrays;',
            starter: `static void siftDown(int[] a, int i, int n) {
    while (2 * i + 1 < n) {
        int c = 2 * i + 1;
        if (c + 1 < n && a[c + 1] > a[c]) c++;
        if (a[i] >= a[c]) break;
        int t = a[i]; a[i] = a[c]; a[c] = t;
        i = c;
    }
}

static void heapSort(int[] a) {
    int n = a.length;
    // build: sift down from n / 2 - 1 back to 0
    // sort: swap a[0] with a[end], then sift down within the first end cells
}`,
            solution: `static void siftDown(int[] a, int i, int n) {
    while (2 * i + 1 < n) {
        int c = 2 * i + 1;
        if (c + 1 < n && a[c + 1] > a[c]) c++;
        if (a[i] >= a[c]) break;
        int t = a[i]; a[i] = a[c]; a[c] = t;
        i = c;
    }
}

static void heapSort(int[] a) {
    int n = a.length;
    for (int i = n / 2 - 1; i >= 0; i--) siftDown(a, i, n);
    for (int end = n - 1; end > 0; end--) {
        int t = a[0]; a[0] = a[end]; a[end] = t;
        siftDown(a, 0, end);
    }
}`,
            mustNotContain: [{ re: /Arrays\.sort|Collections\.sort|\.sort\s*\(|PriorityQueue|new int\s*\[/, msg: 'Sort in place with the given siftDown: no library sort, no priority queue and no second array.' }],
            hints: ['Build: for (int i = n / 2 - 1; i >= 0; i--) siftDown(a, i, n); this makes a[0] the largest.', 'Sort: for (int end = n - 1; end > 0; end--) swap a[0] with a[end], then siftDown(a, 0, end). The heap is now only the first end cells; a[end] is final.'],
            tests: [
              { setup: '        int[] a = {5, 2, 9, 1, 5, 6, 0}; heapSort(a);', call: 'Arrays.toString(a)', expect: '[0, 1, 2, 5, 5, 6, 9]', name: 'with a repeated value' },
              { setup: '        int[] a = {1, 2, 3, 4, 5}; heapSort(a);', call: 'Arrays.toString(a)', expect: '[1, 2, 3, 4, 5]', name: 'already sorted' },
              { setup: '        int[] a = {9, 7, 5, 3, 1, 0}; heapSort(a);', call: 'Arrays.toString(a)', expect: '[0, 1, 3, 5, 7, 9]', name: 'reversed' },
              { setup: '        int[] a = {4}; heapSort(a); int[] b = {}; heapSort(b); int[] c = {2, 1}; heapSort(c);', call: 'Arrays.toString(a) + " " + Arrays.toString(b) + " " + Arrays.toString(c)', expect: '[4] [] [1, 2]', name: 'one value, none, two' },
              { setup: '        int[] a = {-3, 10, -3, 0, 7, -8}; heapSort(a);', call: 'Arrays.toString(a)', expect: '[-8, -3, -3, 0, 7, 10]', name: 'negative values' },
              { setup: '        int[] a = new int[3000]; for (int i = 0; i < a.length; i++) a[i] = (i * 7919) % 1000; heapSort(a); boolean ok = true; for (int i = 1; i < a.length; i++) if (a[i - 1] > a[i]) ok = false;', call: 'ok + " " + a[0] + " " + a[2999]', expect: 'true 0 999', name: 'three thousand values' }
            ],
            failTip: 'If the result is almost sorted with the largest values out of place, the build loop starts at n − 1 instead of n / 2 − 1, or the sort loop sifts down within n cells instead of end cells.',
            followup: 'Count the comparisons siftDown makes on 1,000 random values, then on 1,000 already-sorted values. Unlike insertion sort, heapsort does about the same work for both.'
          }
        },
        {
          ex: {
            id: 'ds-10-3', skill: 'priority-queue', title: 'The k largest',
            prompt: `<p>Write</p><pre class="code">static int[] kLargest(int[] a, int k)</pre><p>that returns the <code>k</code> largest values of <code>a</code>, in <em>decreasing</em> order, using a <code>PriorityQueue</code> that never holds more than <code>k</code> items. If <code>a</code> has fewer than <code>k</code> values, return all of them; if <code>k</code> is 0, return an empty array. Do not sort <code>a</code> or copy it.</p>`,
            prelude: 'import java.util.*;',
            starter: `static int[] kLargest(int[] a, int k) {
    PriorityQueue<Integer> best = new PriorityQueue<>();   // a min-heap of the k largest so far
    for (int x : a) {
        // add x; if the heap now holds more than k items, poll the smallest
    }
    int[] out = new int[best.size()];
    // fill out from the END, polling the heap: the smallest comes out first
    return out;
}`,
            solution: `static int[] kLargest(int[] a, int k) {
    PriorityQueue<Integer> best = new PriorityQueue<>();
    for (int x : a) {
        best.add(x);
        if (best.size() > k) best.poll();
    }
    int[] out = new int[best.size()];
    for (int i = out.length - 1; i >= 0; i--) out[i] = best.poll();
    return out;
}`,
            mustNotContain: [{ re: /Arrays\.sort|Collections\.sort|\.sort\s*\(|reverseOrder/, msg: 'Keep a min-heap of size k instead of sorting; the smallest of the k is the one to throw away.' }],
            hints: ['Inside the loop: best.add(x); then if (best.size() > k) best.poll(); the poll removes the smallest of k + 1, so the k largest stay.', 'The heap is a min-heap, so polling gives increasing order. Fill out from the last index to the first: for (int i = out.length - 1; i >= 0; i--) out[i] = best.poll();'],
            tests: [
              { call: 'Arrays.toString(kLargest(new int[] {5, 1, 9, 3, 7, 9}, 3))', expect: '[9, 9, 7]', name: 'with a repeated largest' },
              { call: 'Arrays.toString(kLargest(new int[] {5, 1, 9, 3, 7}, 1))', expect: '[9]', name: 'just the largest' },
              { call: 'Arrays.toString(kLargest(new int[] {4, 2, 8}, 5))', expect: '[8, 4, 2]', name: 'k larger than the array' },
              { call: 'Arrays.toString(kLargest(new int[] {4, 2, 8}, 0)) + " " + Arrays.toString(kLargest(new int[] {}, 3))', expect: '[] []', name: 'k = 0, and no values' },
              { call: 'Arrays.toString(kLargest(new int[] {-5, -1, -9, -3}, 2))', expect: '[-1, -3]', name: 'negative values' },
              { setup: '        int[] a = new int[3000]; for (int i = 0; i < a.length; i++) a[i] = (i * 7919) % 1000; int[] top = kLargest(a, 5);', call: 'Arrays.toString(top)', expect: '[999, 999, 999, 998, 998]', name: 'three thousand values' }
            ],
            failTip: 'If you get the right values in increasing order, you filled out from index 0; a min-heap polls the smallest first, so fill from the end. If the answer is the k smallest, the poll was done on the wrong side: poll when the heap has too many items, never when it has few.',
            followup: 'Change it to return the k smallest in increasing order. Which kind of heap do you keep now, and which end of it do you throw away?'
          }
        },
        {
          ex: {
            id: 'ds-10-4', skill: 'heap-sift', kind: 'answer', title: 'Work the heap by hand',
            prompt: `<p>Use the min-heap exactly as in this lesson: sift up swaps with the parent while the parent is larger; sift down swaps with the smaller child while the item is larger than it. Give numbers separated by single spaces.</p>`,
            parts: [
              { label: '(a) Insert 7, 4, 9, 2, 6, in that order, into an empty min-heap. What is the array? (five numbers)', answer: '2 4 9 7 6', width: '10rem', wrong: [{ match: '2 4 6 7 9', msg: 'That is the sorted order, which a heap does not keep. Insert them one at a time: 7; 4 swaps over 7; 9 stays; 2 climbs two levels to the root; 6 stays under 4.' }, { match: '7 4 9 2 6', msg: 'That is the order of arrival. Each new item climbs while its parent is larger: 4 swaps with 7, and 2 climbs past 7 and 4.' }] },
              { label: '(b) How many swaps did those five inserts make in total?', answer: '3', width: '6rem', wrong: [{ match: '5', msg: 'Not every insert swaps. 9 and 6 stay where they are. Count: 4 swaps once, 2 swaps twice.' }] },
              { label: '(c) Now remove the minimum from that heap. What is the array afterwards? (four numbers)', answer: '4 6 9 7', width: '10rem', wrong: [{ match: '4 7 9 6', msg: 'After 6 takes the root, its children are 4 and 9. It swaps with the smaller, 4, and then its new children are 7 alone, and 6 ≤ 7, so it stops.' }, { match: '6 4 9 7', msg: 'That is the moment before sifting down: 6 has moved to the root but the heap rule is broken. 6 must sink past the smaller child, 4.' }] },
              { label: '(d) How many swaps did that removal make?', answer: '1', width: '6rem' },
              { label: '(e) In a heap stored in an array, which indexes are the children of the node at index 11? (two numbers)', answer: '23 24', width: '8rem', wrong: [{ match: '22 23', msg: '2i is the formula for arrays that start at 1. With index 0 as the root, the children are 2i + 1 and 2i + 2.' }] },
              { label: '(f) Which index is the parent of the node at index 100?', answer: '49', width: '6rem', wrong: [{ match: ['50', '49.5'], msg: 'Integer division: (100 − 1) / 2 = 99 / 2 = 49, and the children of 49 are 99 and 100.' }] },
              { label: '(g) A heap holds 1,000,000 items. At most how many swaps can one insert make? (The tree has levels 0, 1, 2, …; 2¹⁹ = 524,288 and 2²⁰ = 1,048,576. A new item is added at index 1,000,000.)', answer: '19', width: '6rem', wrong: [{ match: ['20', '21'], msg: 'Count levels from 0 for the root: the new item is on level 19 (levels 0 to 19 hold 1,048,575 cells), and it can climb to level 0 in 19 swaps.' }] },
              { label: '(h) A Java <code>PriorityQueue&lt;Integer&gt;</code> gets <code>add(3)</code>, <code>add(1)</code>, <code>add(2)</code>. What does <code>println</code> of it show? (three numbers, without the brackets and commas)', answer: '1 3 2', width: '8rem', wrong: [{ match: '1 2 3', msg: 'That is the sorted order. 3 is added first; 1 swaps with it and takes the root; 2 goes at index 2 under the 1 and stays.' }] }
            ],
            hints: ['Draw the array after every insert and mark which index the new item climbs from. Sift up compares only with the parent, at (i − 1) / 2.', 'For (g), the new item sits at index 1,000,000. Each swap moves it to (i − 1) / 2, about half the index. How many times can you halve a million before reaching 0?'],
            solution: `<p>(a) <b>2 4 9 7 6</b>: [7]; [4, 7]; [4, 7, 9]; 2 enters at index 3, swaps with 7 and then 4: [2, 4, 9, 7]; 6 enters at index 4 under 4 and stays. (b) <b>3</b> swaps: 1 for the 4 and 2 for the 2. (c) the 6 goes to the root of [6, 4, 9, 7], swaps with the smaller child 4, then 6 ≤ 7: <b>4 6 9 7</b>. (d) <b>1</b>. (e) <b>23 24</b>. (f) <b>49</b>. (g) <b>19</b>: the new item is on level 19, and each swap moves it up one level. (h) <b>1 3 2</b>.</p>`,
            followup: 'For (g), what is the most swaps one removeMin can make in the same heap? Is it the same as for an insert? Say why, using the height of the tree.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A priority queue gives back the smallest item first: <code>add</code>, <code>peek</code>, <code>poll</code>. An unsorted array makes poll O(n); a sorted array makes add O(n). A binary heap makes add and poll O(log n) and peek O(1).</li>
<li>So how does a tree live in an array? Because a heap is always a <em>complete</em> tree, an item&rsquo;s place is its index, and its neighbours are arithmetic: children at <code>2i + 1</code> and <code>2i + 2</code>, parent at <code>(i − 1) / 2</code>. No pointers. And the rule, each parent no larger than its children, puts the smallest at index 0.</li>
<li>Insert at the end and <em>sift up</em>; remove by moving the last item to the root and <em>sift down</em> past the smaller child. The tree has about log₂ n levels, so each takes at most about log₂ n swaps.</li>
<li>Heapsort builds a max-heap in the array in O(n), then moves the largest to the end n − 1 times: O(n log n), in place, not stable.</li>
<li>Java&rsquo;s <code>PriorityQueue</code> is a min-heap (<code>Collections.reverseOrder()</code> for a max-heap; <code>Comparable</code> or a <code>Comparator</code> for your own classes). Printing it shows the heap&rsquo;s array, not sorted order. To keep the k largest, keep a min-heap of size k.</li>
<li>Next: graphs, and Dijkstra&rsquo;s algorithm, which asks a priority queue for the nearest unvisited place again and again.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standard: 1,
      standards: ['3B-AP-12', '3B-AP-10', '3B-AP-11'],
      title: 'Graphs', summary: 'Dots and lines as the model of maps, networks and dependencies; the two ways to store a graph and what each costs; breadth-first search and the shortest route counted in edges; depth-first search and connected components; and Dijkstra’s algorithm for the shortest route when the edges have lengths.',
      blocks: [
        `<p>In the 1950s the Dutch computer scientist Edsger Dijkstra was working on a question that sounds easy: what is the shortest way to travel from Rotterdam to Groningen? Looking back, late in his life, he said that he found the answer in about twenty minutes, one morning while shopping in Amsterdam with his fiancée. They had sat down on a café terrace to drink coffee, and he worked it out in his head, without pencil and paper. He published it in 1959, in a short note in the journal <i>Numerische Mathematik</i>. Today a version of the idea sits behind the route that a map app finds for you.</p>
<p>The map of the Netherlands is a graph: the towns are the dots, the roads are the lines, and the length of each road is a number written on its line. You can see the answer by looking at a map. A program cannot look. It holds lists of numbers and can read one town at a time. In lesson 5 of the mathematics course (SC 104) you met graphs as mathematics: degrees, walks, Euler's bridges, and one breadth-first search in Python. This lesson is about the program. So how does a program that sees only one town at a time find the shortest route, and what must it remember so that it never goes round in circles?</p>
<h2>What a graph models</h2>
<div class="stmt"><p><span class="kind">Graph.</span> A set of <em>vertices</em> (the dots) and a set of <em>edges</em> (the lines, each joining two vertices). In this lesson <code>V</code> is the number of vertices and <code>E</code> the number of edges; every cost below is written with them.</p>
<p><span class="kind">Three kinds.</span> <em>Undirected</em>: an edge works both ways (a friendship, a two-way road). <em>Directed</em>: an edge has a direction (a one-way street, "follows" on a social network, "this task must come before that one"). <em>Weighted</em>: every edge carries a number (kilometres, minutes, a price).</p></div>
<p>Road maps, the links between web pages, the courses you must take before other courses, the moves of a puzzle, the computers of a network: once you see that each is dots and lines, one set of algorithms solves all of them. That is why graphs are the structure that the rest of computer science keeps coming back to. A tree is just a connected graph with no cycles, so what you learn here applies to trees too.</p>
<details class="reveal"><summary>Guess first: at most how many edges can an undirected graph with 1,000 vertices have, if no two vertices are joined twice?</summary><p>Every pair of vertices may be joined once, and there are 1,000 × 999 ÷ 2 = <b>499,500</b> pairs. So <code>E</code> can be as large as about <code>V²/2</code>, and as small as 0. A graph with nearly all its edges is <em>dense</em>; one with few is <em>sparse</em>. Road maps and friendships are sparse: each town has a handful of roads, not a million. Which way you store a graph depends on which kind you have.</p></details>
<h2>Two ways to store a graph</h2>
<div class="stmt"><p><span class="kind">Adjacency matrix.</span> A <code>V × V</code> table: cell <code>[a][b]</code> says whether there is an edge from <code>a</code> to <code>b</code> (or, for a weighted graph, holds its weight). <span class="kind">Adjacency list.</span> An array with one list per vertex: the list of <code>a</code> holds the neighbours of <code>a</code> (for a weighted graph, the neighbour and the weight).</p>
<table class="growth-table"><thead><tr><th></th><th>Matrix</th><th>List</th></tr></thead><tbody>
<tr><td>Space</td><td>O(V²)</td><td>O(V + E)</td></tr>
<tr><td>Is there an edge a–b?</td><td>O(1)</td><td>O(degree of a)</td></tr>
<tr><td>All neighbours of a</td><td>O(V): scan a row</td><td>O(degree of a): just the list</td></tr>
<tr><td>Add an edge</td><td>O(1)</td><td>O(1)</td></tr>
</tbody></table></div>
<p>The matrix wins at one thing, the instant test for one edge. The list wins at what almost every graph algorithm does all day: <em>going through the neighbours of a vertex</em>. And for a sparse graph the matrix wastes nearly all its cells. So the list is the usual choice, and the rest of this lesson uses it. For an undirected graph, store each edge twice, once in each endpoint's list; for a directed graph, once.</p>
<p>In Java the list is <code>List&lt;List&lt;Integer&gt;&gt;</code>, or, when the graph is fixed, a ragged <code>int[][]</code> where row <code>v</code> is the array of the neighbours of <code>v</code>. In the code below the vertices <code>A</code> to <code>H</code> are the numbers 0 to 7, which is how a program names them: a vertex is an index.</p>`,
        { play: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        int n = 8;                                   // vertices A..H are numbered 0..7
        int[][] edges = {{0,1},{0,2},{1,3},{2,3},{2,4},{3,5},{4,5},{4,6},{5,7},{6,7}};

        boolean[][] matrix = new boolean[n][n];      // matrix[a][b]: is there an edge a-b?
        List<List<Integer>> list = new ArrayList<>(); // list.get(a): the neighbours of a
        for (int v = 0; v < n; v++) list.add(new ArrayList<>());

        for (int[] e : edges) {
            matrix[e[0]][e[1]] = true;  matrix[e[1]][e[0]] = true;   // undirected: both ways
            list.get(e[0]).add(e[1]);   list.get(e[1]).add(e[0]);
        }
        System.out.println("matrix says C-E is an edge: " + matrix[2][4]);
        System.out.println("neighbours of C (vertex 2): " + list.get(2));
        System.out.println("matrix cells: " + n * n + "   list entries: " + (2 * edges.length));
    }
}`, predict: true, caption: 'The matrix answers "is C–E an edge?" by looking in one cell. The list gives C’s three neighbours, A, D and E (0, 3 and 4), straight away. The last line is the cost of space: 64 cells against 20 entries. For 8 vertices that hardly matters. For a road map of a million junctions, each with three or four roads, the matrix would need a million million cells (a terabyte even at one byte each) and the lists about four million entries. Try adding the edge <code>{0,7}</code> and see which numbers change.' },
        { check: "A social network has a million people, and each knows about 200 others. Which way should the program store who knows whom?", skill: 'graph-storage', options: ["An adjacency matrix: testing whether two people know each other is O(1)", "Adjacency lists: about 200 million entries, not a million million cells", "Either: both hold the same information, so they cost the same"], answer: 1, wrong: ["The O(1) test is real, but the matrix has a cell for every pair of people, a million times a million of them, almost all empty. Speed in one operation does not pay for impossible space.", null, "They hold the same information at very different cost: the matrix keeps a cell for every pair, connected or not, and the list keeps only the connections."], why: "Space is O(V²) for the matrix and O(V + E) for the lists. With E about 100 million edges and V a million, the lists are thousands of times smaller, and listing a person's friends is the operation the algorithms need." },
        `<h2>Breadth first: rings outwards</h2>
<p>Take a vertex, look at its neighbours, then at <em>their</em> neighbours, and so on: the search spreads outwards in rings, like a stone dropped in a pond. All the vertices one edge away come first, then all those two edges away. To do this the program must remember the vertices it has found but not yet explored. They have to be explored in the order in which they were found, which is exactly what a queue (lesson 7) does.</p>
<div class="stmt"><p><span class="kind">Breadth-first search (BFS).</span> Mark the start with distance 0 and put it in a queue. Repeat until the queue is empty: take the vertex <code>v</code> from the front; for each neighbour <code>w</code> that has not been seen, set <code>dist[w] = dist[v] + 1</code>, remember <code>parent[w] = v</code>, and put <code>w</code> at the back.</p>
<p><span class="kind">What it gives.</span> <code>dist[v]</code> is the fewest <em>edges</em> on any route from the start to <code>v</code>, and following <code>parent</code> back from <code>v</code> gives one such route. <span class="kind">Cost.</span> O(V + E): each vertex enters the queue once, and each list is read once.</p></div>
<p>The array <code>dist</code> does two jobs. It records the answer, and its entries that are still -1 are the "not seen" marks. Without those marks the search would find A from B, then B from A, then A from B again, for ever. That one check is what makes a graph search stop.</p>`,
        { fig: 'graph', mode: 'bfs', caption: 'Breadth-first search from A. Step through and watch the queue: B and C (distance 1) go in first, then D and E (distance 2), and so on. The heavy lines are the parent links; the route to H is the chain of them back to A.' },
        { play: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        int n = 8;
        int[][] edges = {{0,1},{0,2},{1,3},{2,3},{2,4},{3,5},{4,5},{4,6},{5,7},{6,7}};
        List<List<Integer>> adj = new ArrayList<>();
        for (int v = 0; v < n; v++) adj.add(new ArrayList<>());
        for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }
        int[] dist = new int[n], parent = new int[n];
        Arrays.fill(dist, -1);                       // -1 means "not seen yet"
        ArrayDeque<Integer> queue = new ArrayDeque<>();
        dist[0] = 0; parent[0] = -1; queue.add(0);
        while (!queue.isEmpty()) {
            int v = queue.poll();
            for (int w : adj.get(v)) {
                if (dist[w] == -1) { dist[w] = dist[v] + 1; parent[w] = v; queue.add(w); }
            }
        }
        System.out.println("distances from A: " + Arrays.toString(dist));
        String route = "";
        for (int v = 7; v != -1; v = parent[v]) route = "ABCDEFGH".charAt(v) + " " + route;
        System.out.println("shortest route to H: " + route.trim());
    }
}`, predict: true, caption: 'The distances are 0, 1, 1, 2, 2, 3, 3, 4: B and C are one edge from A, D and E two, F and G three, and H four. The route is found backwards: H’s parent is F, F’s is D, D’s is B, B’s is A, and each step puts the vertex in front of the string. Change the target to G (vertex 6) and the route changes; change <code>queue.add</code> to <code>queue.push</code>, which adds at the front, and watch the distances stop being right.' },
        { check: "You need the route with the fewest roads from A to H in the graph above, and every road counts the same. Which search should you use?", skill: 'bfs-queue', options: ["Breadth-first: it reaches every vertex one edge away before any vertex two edges away", "Depth-first: it heads straight for the far end of the graph, so it finds H quickly", "Either: both visit every vertex, so both find the same route"], answer: 0, wrong: [null, "Depth-first dives down whichever neighbour comes first and finds <em>a</em> route, not the shortest one. In the figure of the next section its route to H passes through seven vertices (six edges); the shortest has four.", "Both do visit every vertex, but in a different order, and the order is the whole point. Breadth-first order is by distance, so the first route it finds to a vertex is a shortest one; depth-first order is not."], why: "Because the queue is first in, first out, every vertex at distance k is taken out before any vertex at distance k + 1, so the first time BFS reaches a vertex is by a shortest route." },
        `<h2>Depth first, and the pieces of a graph</h2>
<p>Swap the queue for a stack and the search changes character. A stack takes out the vertex put in <em>last</em>, so the search follows one road as far as it can, and only when it is stuck backs up to the last place where there was a choice. That is <em>depth-first search</em>. A recursive method does this for free, because the call stack of lesson 8 is the stack: each call is a vertex on the way down, and a return is backing up.</p>
<div class="stmt"><p><span class="kind">Depth-first search (DFS).</span> To visit <code>v</code>: mark it seen; then for each neighbour <code>w</code> that is not yet seen, visit <code>w</code>.</p>
<p><span class="kind">Cost.</span> O(V + E), the same as BFS. <span class="kind">What it is good for.</span> Not shortest routes, but <em>what is connected to what</em>: finding every vertex reachable from a start, finding the pieces of a graph, finding cycles, and ordering tasks by their dependencies.</p></div>`,
        { fig: 'graph', mode: 'dfs', caption: 'Depth-first search from A. The stack is the chain of calls that have not returned yet. Watch it grow to seven, then shrink as the calls return. The numbers are the order of visiting: A, B, D, C, E, F, H, G.' },
        { play: `import java.util.*;

public class Main {
    static List<List<Integer>> adj = new ArrayList<>();
    static boolean[] seen = new boolean[8];
    static String order = "";

    static void dfs(int v) {
        seen[v] = true;
        order += "ABCDEFGH".charAt(v);
        for (int w : adj.get(v)) {
            if (!seen[w]) dfs(w);                    // go deep before looking at the next neighbour
        }
    }

    public static void main(String[] args) {
        int[][] edges = {{0,1},{0,2},{1,3},{2,3},{2,4},{3,5},{4,5},{4,6},{5,7},{6,7}};
        for (int v = 0; v < 8; v++) adj.add(new ArrayList<>());
        for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }
        dfs(0);
        System.out.println("depth first from A: " + order);
    }
}`, predict: true, caption: 'ABDCEFHG. From A the search goes to B, from B to D, from D to C (D’s first neighbour that is new is C, since B is seen), and so on, always taking the first unseen neighbour. Compare it with the breadth-first order ABCDEFGH: the same vertices, a different order. Try listing the edges in a different order, which changes each neighbour list, and see the order change.' },
        `<p>A recursive search goes as deep as the longest road it follows. On a graph that is one long chain of a hundred thousand vertices, that is a hundred thousand calls, and Java's call stack gives out long before that. For big graphs, write DFS with an <code>ArrayDeque</code> as the stack: <code>push</code> the start; then repeat <code>pop</code> a vertex and, if it is unseen, mark it and <code>push</code> its neighbours. The set of vertices reached is the same; only the visiting order differs a little.</p>
<p><span class="kind">Connected components.</span> A graph may fall into separate pieces, as the towns of the mathematics lesson did, with no road between one piece and the next. Either search from a vertex reaches exactly its own piece and nothing else, so counting the pieces is a loop around a search:</p>
<pre class="code">int count = 0;
for (int v = 0; v &lt; n; v++) {
    if (!seen[v]) {          // v is in a piece we have not met yet
        count++;
        search(v);           // BFS or DFS: marks the whole piece as seen
    }
}</pre>
<p>Each vertex is marked once and each list is read once, so the whole count is still O(V + E). You will write this in the exercises.</p>
<h2>Shortest routes when roads have lengths</h2>
<p>Breadth first counts <em>edges</em>. A route of three roads might be 300 kilometres, and one of five roads 50. When each edge has a weight, the shortest route is the one with the smallest <em>total weight</em>, and BFS is no longer enough. Dijkstra's idea is to keep BFS's shape but replace the queue with one that always serves the <em>closest</em> vertex first.</p>
<div class="stmt"><p><span class="kind">Dijkstra's algorithm.</span> Give the start distance 0 and every other vertex ∞. Put the start in a <em>priority queue</em> (a queue that always hands out the smallest distance first; Java's <code>PriorityQueue</code> is a heap). Repeat: take the vertex <code>v</code> with the smallest distance. Its distance is now <em>final</em>. For each edge <code>v–w</code> with weight <code>wt</code>, if <code>dist[v] + wt &lt; dist[w]</code>, update <code>dist[w]</code> and put <code>w</code> in the queue (this step is called <em>relaxing</em> the edge).</p>
<p><span class="kind">Why it works.</span> The closest unfinished vertex cannot be reached more cheaply by any other route, because every other route leaves through some unfinished vertex that is at least as far away, and the rest of the route only <em>adds</em> to the length.</p>
<p><span class="kind">Cost.</span> Each edge can add one entry to the priority queue, and each queue operation costs O(log V), so the total is O((V + E) log V).</p></div>`,
        { fig: 'graph', mode: 'dijkstra', caption: 'Dijkstra from A, with the road lengths on the edges. Watch E: it first gets 9 (through C), then a better route through F brings it down to 7. The old entry E:9 is still in the queue; when it comes out it is stale, and is skipped.' },
        { long: true, play: `import java.util.*;

class Edge {
    int to, weight;
    Edge(int to, int weight) { this.to = to; this.weight = weight; }
}

class Candidate implements Comparable<Candidate> {
    int vertex, dist;
    Candidate(int vertex, int dist) { this.vertex = vertex; this.dist = dist; }
    public int compareTo(Candidate other) { return Integer.compare(dist, other.dist); }
}

public class Main {
    public static void main(String[] args) {
        int n = 8;
        int[][] edges = {{0,1,4},{0,2,1},{1,3,5},{2,3,2},{2,4,8},{3,5,3},{4,5,1},{4,6,4},{5,7,6},{6,7,2}};
        List<List<Edge>> adj = new ArrayList<>();
        for (int v = 0; v < n; v++) adj.add(new ArrayList<>());
        for (int[] e : edges) { adj.get(e[0]).add(new Edge(e[1], e[2])); adj.get(e[1]).add(new Edge(e[0], e[2])); }

        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE);        // "no route known yet"
        PriorityQueue<Candidate> pq = new PriorityQueue<>();   // a heap: smallest distance first
        dist[0] = 0;
        pq.add(new Candidate(0, 0));
        while (!pq.isEmpty()) {
            Candidate top = pq.poll();
            if (top.dist > dist[top.vertex]) continue;          // stale: a better route was found since
            for (Edge e : adj.get(top.vertex)) {
                int through = top.dist + e.weight;
                if (through < dist[e.to]) {                     // relax the edge
                    dist[e.to] = through;
                    pq.add(new Candidate(e.to, through));
                }
            }
        }
        System.out.println(Arrays.toString(dist));
    }
}`, predict: true, caption: '[0, 4, 1, 3, 7, 6, 11, 12]: the cheapest cost from A to each of A to H. H costs 12, by A, C, D, F, H (1 + 2 + 3 + 6); the route with the fewest roads that BFS found, A, B, D, F, H, costs 4 + 5 + 3 + 6 = 18. A priority queue of a class needs a way to order its objects, which is what <code>compareTo</code> is for (a <code>Comparable</code> class). The <code>if</code> with <code>continue</code> throws away stale entries instead of removing them, which a heap cannot do cheaply.' },
        { check: "Dijkstra's algorithm treats a vertex's distance as final the moment it comes out of the priority queue. Which fact makes that safe?", skill: 'dijkstra', options: ["No edge has a negative weight, so any other route to the vertex can only get longer", "The priority queue is a heap, so it is always sorted", "The graph has no cycles, so no vertex can be reached twice"], answer: 0, wrong: [null, "The heap only makes finding the smallest entry fast. A slow sorted list would give the same answers; correctness comes from the weights, not from the data structure.", "Dijkstra works on graphs with cycles (the one in the figure has several). A vertex can be reached by many routes; the point is that a route found later cannot be shorter."], why: "Every other route to the vertex leaves through some vertex that is still waiting, which is at least as far away, and the remaining edges only add. That argument fails the moment an edge can have a negative weight." },
        `<p>Here is the smallest graph that breaks it. Three vertices; roads <code>A → B</code> of weight 3, <code>A → C</code> of weight 4, and <code>C → B</code> of weight −2. The cheapest way to B is through C: 4 − 2 = 2. But the textbook version of Dijkstra takes B out of the queue first, at 3, declares it final, and never looks at it again, so it reports 3. (The code above, which queues a vertex again whenever it finds a better route, would repair this tiny case, but it can then redo work over and over, and on a negative cycle it may never finish: it is no longer Dijkstra's algorithm.) Negative edges (a refund, an energy gain) need a different method, <em>Bellman–Ford</em>; if there is a negative <em>cycle</em>, a route can be made shorter for ever, and no shortest route exists. Dijkstra's algorithm is for the case that covers roads, flights and delays: lengths of zero or more.</p>
<p>So the whole lesson is one idea in three costumes: keep a frontier of places found but not yet explored, always <code>take</code> the next one from it, and never explore the same vertex twice. A queue gives rings, a stack gives depth, and a priority queue gives distance.</p>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Forgetting the "seen" check, so the search loops for ever on any cycle (including every undirected edge, which is a two-vertex cycle: A to B and back). Storing an undirected edge in only one direction. Using BFS on a weighted graph and calling the answer the shortest route. Starting <code>dist</code> at <code>Integer.MAX_VALUE</code> and then adding a weight to it, which overflows to a huge negative number: only add to distances that are final. Using <code>queue.remove()</code> where <code>poll()</code> is meant: on an empty queue the first throws an exception and the second returns <code>null</code>. Writing a recursive DFS for a graph with a very long chain.</p>` },
        {
          ex: {
            id: 'ds-11-1', skill: 'graph-storage', title: 'How many roads?',
            prompt: `<p>Write</p><pre class="code">static int distance(int[][] adj, int start, int target)</pre><p>that returns the fewest edges on any route from <code>start</code> to <code>target</code>, or <code>-1</code> if there is no route. The graph is undirected and is given as an adjacency list: <code>adj[v]</code> is the array of the neighbours of vertex <code>v</code>. For example, in <code>{{1, 2}, {0, 3}, {0, 3}, {1, 2}}</code> (a square: 0 and 3 are opposite corners) the distance from 0 to 3 is 2, and from a vertex to itself it is 0. Use breadth-first search with an <code>ArrayDeque</code>.</p>`,
            prelude: 'import java.util.*;\n',
            starter: `static int distance(int[][] adj, int start, int target) {
    int[] dist = new int[adj.length];
    Arrays.fill(dist, -1);                           // -1: not seen yet
    ArrayDeque<Integer> queue = new ArrayDeque<>();
    // dist[start] = 0 and put start in the queue
    // while the queue is not empty: take v; for each w in adj[v]: if w is not seen,
    //     set dist[w] = dist[v] + 1 and put w in the queue
    return -1;
}`,
            solution: `static int distance(int[][] adj, int start, int target) {
    int[] dist = new int[adj.length];
    Arrays.fill(dist, -1);
    ArrayDeque<Integer> queue = new ArrayDeque<>();
    dist[start] = 0;
    queue.add(start);
    while (!queue.isEmpty()) {
        int v = queue.poll();
        if (v == target) return dist[v];
        for (int w : adj[v]) {
            if (dist[w] == -1) {
                dist[w] = dist[v] + 1;
                queue.add(w);
            }
        }
    }
    return -1;
}`,
            hints: ['Start with dist[start] = 0 and queue.add(start). Then loop while (!queue.isEmpty()) and take v with queue.poll().', 'For each neighbour w of v (for (int w : adj[v])), do something only if dist[w] == -1: set dist[w] = dist[v] + 1 and queue.add(w). That test is what stops the search going round in circles.', 'You can return dist[target] after the loop (it is -1 if the target was never reached), or return early when you take the target from the queue.'],
            tests: [
              { call: 'distance(new int[][]{{1, 2}, {0, 3}, {0, 3}, {1, 2}}, 0, 3)', expect: '2', name: 'across a square' },
              { call: 'distance(new int[][]{{1}, {0, 2}, {1, 3}, {2}}, 0, 3)', expect: '3', name: 'along a path' },
              { call: 'distance(new int[][]{{1}, {0, 2}, {1}}, 1, 1)', expect: '0', name: 'a vertex to itself' },
              { call: 'distance(new int[][]{{1}, {0}, {3}, {2}}, 0, 3)', expect: '-1', name: 'two separate pieces' },
              { call: 'distance(new int[][]{{1, 5}, {0, 2}, {1, 3}, {2, 4}, {3, 5}, {4, 0}}, 0, 4)', expect: '2', name: 'round a ring, the short way' },
              { call: 'distance(new int[][]{{1, 2}, {0, 3}, {0, 3, 4}, {1, 2, 5}, {2, 5, 6}, {3, 4, 7}, {4, 7}, {5, 6}}, 0, 7)', expect: '4', name: 'the eight-vertex graph of the lesson' },
              { call: 'distance(new int[][]{{1, 2, 3}, {0, 2, 3}, {0, 1, 3}, {0, 1, 2}}, 0, 3)', expect: '1', name: 'every vertex joined to every other (loops without a seen check)' }
            ],
            failTip: 'If the program never finishes, it is going round a cycle: a vertex must be marked (dist set) at the moment it is put in the queue, not when it is taken out. If you get an answer that is too large, check that you set dist[w] = dist[v] + 1 and not dist[w] + 1.',
            followup: 'Return the route itself as an int[] from start to target, or null if there is none, by keeping a parent array and walking back from the target.'
          }
        },
        {
          ex: {
            id: 'ds-11-2', skill: 'bfs-queue', kind: 'answer', title: 'Run the searches by hand',
            prompt: `<p>Here is a graph of six vertices, 0 to 5. Its edges, with their lengths: <b>0–1 (7)</b>, <b>0–3 (2)</b>, <b>1–4 (2)</b>, <b>3–4 (6)</b>, <b>3–2 (3)</b>, <b>4–5 (1)</b>, <b>2–5 (9)</b>. In every search, start at 0 and look at the neighbours of a vertex in increasing numerical order. Parts (a) to (c) ignore the lengths; parts (d) and (e) use them. Draw the graph first.</p>`,
            parts: [
              { label: '(a) Breadth-first search: in what order are the vertices taken out of the queue? (six numbers, separated by spaces)', answer: '0 1 3 4 2 5', width: '10rem', wrong: [{ match: '0 1 2 3 4 5', msg: 'That is numerical order. The queue order is: 0, then its neighbours 1 and 3, then the new vertex 1 finds (4), and only then the new vertex 3 finds (2). So 4 comes before 2.' }, { match: '0 1 4 3 2 5', msg: 'That is a depth-first order (it is part (c)). Breadth first takes out 0, 1 and 3 before going further from any of them.' }] },
              { label: '(b) How many edges are on a shortest route from 0 to 5?', answer: '3', width: '5rem', wrong: [{ match: '2', msg: 'No route has two edges: 5 is joined only to 4 and 2, and neither of those is a neighbour of 0. Count 0, 1, 4, 5.' }] },
              { label: '(c) Depth-first search (recursive, ascending neighbours): in what order are the vertices visited?', answer: '0 1 4 3 2 5', width: '10rem', wrong: [{ match: '0 1 3 4 2 5', msg: 'That is the breadth-first order. Depth first from 0 goes to 1, then from 1 to 4 at once, before it ever looks at 3.' }] },
              { label: '(d) Dijkstra: what is the length of the shortest route from 0 to 5?', answer: '9', width: '5rem', wrong: [{ match: '10', msg: 'That is the route 0, 1, 4, 5 (7 + 2 + 1). The route 0, 3, 4, 5 is 2 + 6 + 1 = 9, which is shorter even though it has the same number of edges.' }, { match: '3', msg: 'That is the number of edges. The question asks for the total length of the roads.' }] },
              { label: '(e) Dijkstra: in what order are the vertices finalised (taken out of the priority queue as non-stale entries)? (six numbers)', answer: '0 3 2 1 4 5', width: '10rem', wrong: [{ match: '0 1 3 4 2 5', msg: 'That is the breadth-first order. Dijkstra goes by distance: 0 (0), 3 (2), 2 (5), 1 (7), 4 (8), 5 (9).' }] }
            ],
            hints: ['For (a), keep a queue on paper. Write who is in it after every step: take 0 and add 1 and 3, then take 1 and add what is new, and so on.', 'For (c), at each vertex take the smallest unseen neighbour and go there at once; when there is none, step back.', 'For (d) and (e), write each vertex’s best distance so far, starting 0, ∞, ∞, ∞, ∞, ∞, and finalise the smallest unfinished one each time. After 0: 1 has 7 and 3 has 2.'],
            solution: `<p>(a) <b>0 1 3 4 2 5</b>: queue [0]; take 0, add 1 and 3; take 1, add 4; take 3, add 2; take 4, add 5; take 2; take 5. (b) <b>3</b>: 0, 1, 4, 5 (or 0, 3, 4, 5). (c) <b>0 1 4 3 2 5</b>: 0 to 1 to 4 (4's first neighbour 1 is seen, then 3) to 3, then from 3 to 2, from 2 to 5. (d) <b>9</b>: 0 to 3 (2), to 4 (6 more, 8), to 5 (1 more). (e) <b>0 3 2 1 4 5</b>: distances 0, 2, 5, 7, 8, 9. Vertex 5 first gets 14 (through 2) and then the better 9 (through 4); the entry with 14 is stale.</p>`,
            followup: 'Change the length of 3–4 from 6 to 4. Now which route to 5 is shortest, and how does the order in (e) change?'
          }
        },
        {
          ex: {
            id: 'ds-11-3', skill: 'bfs-queue', title: 'How many pieces?',
            prompt: `<p>Write</p><pre class="code">static int components(int[][] adj)</pre><p>that returns the number of connected components of an undirected graph given as an adjacency list: <code>adj[v]</code> is the array of the neighbours of vertex <code>v</code>. A graph with no vertices has 0 components; a vertex with no neighbours is a component of its own. For example, <code>{{1}, {0}, {3}, {2}, {}}</code> has 3: <code>{0, 1}</code>, <code>{2, 3}</code> and <code>{4}</code>. Search from each vertex that has not been seen yet, and mark everything the search reaches. Write the search with an <code>ArrayDeque</code> (as a queue or as a stack), not with recursion.</p>`,
            prelude: 'import java.util.*;\n',
            starter: `static int components(int[][] adj) {
    boolean[] seen = new boolean[adj.length];
    int count = 0;
    // for each vertex s: if it has not been seen, count++ and search from s,
    // marking every vertex the search reaches as seen
    return count;
}`,
            solution: `static int components(int[][] adj) {
    boolean[] seen = new boolean[adj.length];
    int count = 0;
    for (int s = 0; s < adj.length; s++) {
        if (seen[s]) continue;
        count++;
        ArrayDeque<Integer> stack = new ArrayDeque<>();
        stack.push(s);
        seen[s] = true;
        while (!stack.isEmpty()) {
            int v = stack.pop();
            for (int w : adj[v]) {
                if (!seen[w]) { seen[w] = true; stack.push(w); }
            }
        }
    }
    return count;
}`,
            hints: ['The outer loop is over every vertex s from 0 to adj.length - 1. When seen[s] is false, you have found a new piece: count++.', 'Then run a search from s: put s in an ArrayDeque and mark it seen; while the deque is not empty, take a vertex v and, for each neighbour w in adj[v] that is not seen, mark it and add it.', 'Use stack.push(w) and stack.pop(), or queue.add(w) and queue.poll(): either order reaches the same vertices. Mark seen when you add, not when you take out.'],
            tests: [
              { call: 'components(new int[][]{})', expect: '0', name: 'no vertices' },
              { call: 'components(new int[][]{{}})', expect: '1', name: 'one lonely vertex' },
              { call: 'components(new int[][]{{1}, {0}, {3}, {2}, {}})', expect: '3', name: 'two pairs and a single' },
              { call: 'components(new int[][]{{1, 2}, {0, 2}, {0, 1}})', expect: '1', name: 'a triangle' },
              { call: 'components(new int[10][0])', expect: '10', name: 'ten vertices and no edges' },
              { call: 'components(new int[][]{{1, 2}, {0, 2}, {0, 1}, {4, 5}, {3, 5}, {3, 4}, {7}, {6}})', expect: '3', name: 'two triangles and a pair' },
              { call: 'components(new int[][]{{3}, {2}, {1, 4}, {0, 5}, {2}, {3}})', expect: '2', name: 'pieces whose numbers are interleaved' }
            ],
            failTip: 'If the count is too big, you are counting a vertex that an earlier search already reached: mark every vertex the search reaches, including the ones found from other vertices. If it is 0 for a graph with edges, the count++ is never reached.',
            followup: 'Also return the size of the largest component. (In a social network, that is the biggest group of people who can all reach one another through friends.)'
          }
        },
        {
          ex: {
            id: 'ds-11-4', skill: 'dijkstra', title: 'The cheapest route',
            prompt: `<p>Complete the class <code>Roads</code>. Its method <code>cheapest(int n, int[][] edges, int from, int to)</code> takes <code>n</code> vertices numbered 0 to <code>n - 1</code> and a list of undirected roads, each <code>{a, b, length}</code> with a length of 0 or more, and returns the length of the shortest route from <code>from</code> to <code>to</code>, or <code>-1</code> if there is none. Use Dijkstra's algorithm with a <code>PriorityQueue</code>. The classes <code>Edge</code> and <code>Candidate</code> (a vertex with a distance, ordered by distance) are written for you. Write only the classes; the checker supplies <code>main</code>.</p>`,
            classes: true,
            prelude: 'import java.util.*;\n',
            starter: `class Edge {
    int to, weight;
    Edge(int to, int weight) { this.to = to; this.weight = weight; }
}

class Candidate implements Comparable<Candidate> {
    int vertex, dist;
    Candidate(int vertex, int dist) { this.vertex = vertex; this.dist = dist; }
    public int compareTo(Candidate other) { return Integer.compare(dist, other.dist); }
}

class Roads {
    static int cheapest(int n, int[][] edges, int from, int to) {
        // 1. build an adjacency list of Edge objects, each road in both directions
        // 2. dist[] starts at Integer.MAX_VALUE, except dist[from] = 0
        // 3. a PriorityQueue<Candidate>; take the smallest, skip it if stale, relax its edges
        return -1;
    }
}`,
            solution: `class Edge {
    int to, weight;
    Edge(int to, int weight) { this.to = to; this.weight = weight; }
}

class Candidate implements Comparable<Candidate> {
    int vertex, dist;
    Candidate(int vertex, int dist) { this.vertex = vertex; this.dist = dist; }
    public int compareTo(Candidate other) { return Integer.compare(dist, other.dist); }
}

class Roads {
    static int cheapest(int n, int[][] edges, int from, int to) {
        List<List<Edge>> adj = new ArrayList<>();
        for (int v = 0; v < n; v++) adj.add(new ArrayList<>());
        for (int[] e : edges) {
            adj.get(e[0]).add(new Edge(e[1], e[2]));
            adj.get(e[1]).add(new Edge(e[0], e[2]));
        }
        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[from] = 0;
        PriorityQueue<Candidate> pq = new PriorityQueue<>();
        pq.add(new Candidate(from, 0));
        while (!pq.isEmpty()) {
            Candidate top = pq.poll();
            if (top.dist > dist[top.vertex]) continue;
            for (Edge e : adj.get(top.vertex)) {
                int through = top.dist + e.weight;
                if (through < dist[e.to]) {
                    dist[e.to] = through;
                    pq.add(new Candidate(e.to, through));
                }
            }
        }
        return dist[to] == Integer.MAX_VALUE ? -1 : dist[to];
    }
}`,
            hints: ['Build the adjacency list first: for each road {a, b, w}, add new Edge(b, w) to the list of a and new Edge(a, w) to the list of b.', 'Start with dist[from] = 0 and pq.add(new Candidate(from, 0)). In the loop: Candidate top = pq.poll(); if (top.dist > dist[top.vertex]) continue; then for each Edge e in the list of top.vertex, compute int through = top.dist + e.weight.', 'If through < dist[e.to], set dist[e.to] = through and pq.add(new Candidate(e.to, through)). At the end, if dist[to] is still Integer.MAX_VALUE there is no route: return -1.'],
            tests: [
              { name: 'the lesson’s graph, to H', main: '        int[][] roads = {{0,1,4},{0,2,1},{1,3,5},{2,3,2},{2,4,8},{3,5,3},{4,5,1},{4,6,4},{5,7,6},{6,7,2}};\n        System.out.println(Roads.cheapest(8, roads, 0, 7));', expect: '12' },
              { name: 'a better route found later (to E)', main: '        int[][] roads = {{0,1,4},{0,2,1},{1,3,5},{2,3,2},{2,4,8},{3,5,3},{4,5,1},{4,6,4},{5,7,6},{6,7,2}};\n        System.out.println(Roads.cheapest(8, roads, 0, 4) + " " + Roads.cheapest(8, roads, 7, 0));', expect: '7 12' },
              { name: 'fewest roads is not cheapest', main: '        int[][] roads = {{0,2,10},{0,1,1},{1,2,1}};\n        System.out.println(Roads.cheapest(3, roads, 0, 2));', expect: '2' },
              { name: 'no route', main: '        int[][] roads = {{0,1,5},{2,3,1}};\n        System.out.println(Roads.cheapest(4, roads, 0, 3));', expect: '-1' },
              { name: 'a vertex to itself, and a road of length 0', main: '        int[][] roads = {{0,1,0},{1,2,4}};\n        System.out.println(Roads.cheapest(3, roads, 1, 1) + " " + Roads.cheapest(3, roads, 0, 2));', expect: '0 4' },
              { name: 'a ring of a hundred towns', main: '        int n = 100;\n        int[][] roads = new int[n][];\n        for (int i = 0; i < n; i++) roads[i] = new int[]{i, (i + 1) % n, 3};\n        System.out.println(Roads.cheapest(n, roads, 0, 50) + " " + Roads.cheapest(n, roads, 0, 99) + " " + Roads.cheapest(n, roads, 0, 70));', expect: '150 3 90' }
            ],
            failTip: 'If the answer is too large, you may be forgetting to add the road in both directions, or taking the first route found instead of the smallest. If you get a huge negative number, you added a weight to Integer.MAX_VALUE: only add to the distance of a vertex taken from the queue, which is finite.',
            followup: 'Return the route as well: keep a parent array that is updated each time you relax an edge, and print the towns from `from` to `to`.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A graph is vertices and edges: undirected, directed or weighted. It models maps, networks, dependencies and puzzles, and <code>V</code> and <code>E</code> are the sizes in every cost.</li>
<li>An adjacency matrix has O(1) edge tests and O(V²) space; an adjacency list has O(V + E) space and gives the neighbours of a vertex at once. Most graphs are sparse, so the list is the usual choice.</li>
<li>Breadth-first search uses a queue and a <code>dist</code> array that also marks "seen". It spreads in rings and finds the route with the fewest edges, in O(V + E). Depth-first search uses a stack (or recursion) and finds what is connected to what; counting components is a search from every unseen vertex.</li>
<li>Dijkstra's algorithm uses a priority queue to take the closest vertex first, and finds the cheapest route when edges have lengths of zero or more, in O((V + E) log V). A negative edge breaks the argument that a taken vertex is final.</li>
<li><b>So how does a program that sees one town at a time find the shortest route?</b> It keeps a frontier of the towns it has found but not yet explored, takes the most promising one (the oldest for edges, the closest for lengths), and marks every town it has seen so that it never explores one twice. The marks are what stop the circles.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-10', '3B-AP-11', '3B-AP-12', '3B-AP-13'],
      title: 'Checkpoint: trees, heaps, graphs', checkpoint: true, summary: 'No new ideas: mixed questions on search trees, heaps and priority queues, and graph searches. Tree or heap? Queue or stack? Breadth first or Dijkstra? Then a choice of structure and a program that checks a heap.',
      blocks: [
        `<p>This lesson teaches nothing new. It mixes questions from the last three lessons, because a search tree and a heap are both trees in which every node has at most two children, and breadth-first search and depth-first search are the same program with a different frontier. They are only told apart by being asked about together. Answer each question before you look back. If one surprises you, the lesson it came from is linked on the Review page, and the question will come back there in a day.</p>
<p>Ready? Here is the first: where would you look for the smallest key in a search tree, and where in a heap?</p>
<h2>Mixed questions</h2>`,
        { check: 'Where is the <em>smallest</em> key in a binary search tree?', skill: 'bst-search', options: ['At the root', 'At the leftmost node: follow left links from the root until there are none', 'At the last leaf that was inserted'], answer: 1, wrong: ['The root is only the first key inserted. Everything smaller is in its left subtree. (In a min-heap the smallest is at the root, but a search tree is a different structure.)', null, 'The order of insertion decides the shape of the tree, not where the smallest key is. Keys smaller than a node always hang to its left.'], why: 'Everything smaller than a node is in its left subtree, so the smallest key is the end of the left chain. The largest is the end of the right chain. This is why a search tree can answer "smallest" and "next smaller" quickly.' },
        { check: 'The keys 1 to 7 are put into two empty search trees without balancing: one in the order 1, 2, 3, 4, 5, 6, 7, and one in the order 4, 2, 6, 1, 3, 5, 7. How many nodes does a search for 7 visit in each?', skill: 'bst-balance', options: ['7 in both', '7 in the first tree and 3 in the second', '3 in the first tree and 7 in the second'], answer: 1, wrong: ['The same keys can make different trees. The shape depends on the order of insertion.', null, 'It is the other way round: sorted input makes every key go right, so the first tree is a chain.'], why: 'Sorted input makes a chain, which is a linked list in disguise: 7 visits. The second order makes a full tree of height 3: 3 visits. The speed of a search tree is decided by its height, and balancing exists to keep it small.' },
        { check: 'You need to read words in alphabetical order, and also to ask for "the largest word that comes before <em>mango</em>". Which map do you choose?', skill: 'bst-search', options: ['<code>HashMap</code>: it is the fastest map', '<code>TreeMap</code>: a search tree keeps its keys in order', 'Either one: they differ only in speed'], answer: 1, wrong: ['A hash table scatters keys over buckets, so it has no order to read and cannot find a neighbour in the order. It is faster for plain lookups, but this job needs the order.', null, 'They answer different questions. A hash table can only find a key it is given; a search tree can also walk the keys in order.'], why: 'A balanced search tree does get, put and "the next key below" in O(log n) and prints in order. A hash table is O(1) on average for get and put and has no order at all.' },
        { check: 'The min-heap <code>[2, 5, 3, 9, 6, 4]</code> receives the value 1, which is put at the end and sifted up. What is the array afterwards?', skill: 'heap-sift', options: ['<code>[2, 5, 3, 9, 6, 4, 1]</code>', '<code>[1, 5, 2, 9, 6, 4, 3]</code>', '<code>[1, 2, 3, 4, 5, 6, 9]</code>'], answer: 1, wrong: ['That is the value just added at the end, before sifting. A parent must not be larger than its child, and 1 is smaller than its parent.', null, 'A heap is only partly ordered: each parent is at most its children. Sift up does not sort the array.'], why: '1 goes to index 6; its parent is index (6 − 1) / 2 = 2, which holds 3: swap. Now it is at index 2 and its parent, index 0, holds 2: swap. It is now at the root and stops. Only the values on one path moved: O(log n).' },
        { check: 'A program adds a number to a collection and removes the smallest, a million times each. Which structure keeps <em>every</em> operation at O(log n) or better?', skill: 'priority-queue', options: ['A sorted array', 'A min-heap', 'An unsorted array'], answer: 1, wrong: ['Keeping the array sorted makes each add shift about half of it: O(n). Taking the smallest is cheap, but the adds are not.', null, 'An add is O(1), but finding the smallest means scanning everything: O(n) for each removal.'], why: 'A heap does both in O(log n): an add sifts up along one path, and removing the smallest moves the last value to the root and sifts it down. That is what a priority queue is.' },
        { check: 'You keep the 10 <em>largest</em> numbers seen so far in a heap of size 10. Which kind of heap, and why?', skill: 'priority-queue', options: ['A min-heap: its root is the smallest of the ten, the one to throw out', 'A max-heap: its root is the largest, the one to keep', 'Either: the root does not matter'], answer: 0, wrong: [null, 'The largest is the one you want to keep. The value you need to find quickly is the one that must be thrown out when a bigger number arrives: the smallest.', 'The root is exactly what you look at for each new number, so it matters.'], why: 'A new number is compared with the root, the smallest of the ten kept. If it is bigger, it replaces the root. Each number costs O(log 10), so the whole job is O(n log k).' },
        { check: 'A road network has 10,000 junctions and about 25,000 roads, each usable both ways. How many cells does an adjacency <em>matrix</em> need, and how many entries do the neighbour <em>lists</em> hold in all (each road is listed from both ends)?', skill: 'graph-storage', options: ['10,000 cells and 25,000 entries', '100,000,000 cells and 50,000 entries', '25,000 cells and 25,000 entries'], answer: 1, wrong: ['The matrix has a row and a column for every junction: n × n cells, not n.', null, 'The matrix is not sized by the number of roads: it has one cell for every pair of junctions, whether a road joins them or not.'], why: 'A matrix has n × n cells whatever the graph looks like: 100 million. Lists hold two entries per road: 50,000. A graph with few roads for its size is sparse, and lists are the right choice.' },
        { check: 'Breadth-first search keeps its frontier in a queue. If you swap the queue for a stack and change nothing else, what do you get?', skill: 'bfs-queue', options: ['Depth-first search', 'Dijkstra\'s algorithm', 'The same breadth-first search'], answer: 0, wrong: [null, 'Dijkstra\'s algorithm needs a priority queue ordered by distance, not a stack.', 'A stack hands back the newest vertex first, so the search runs deep before it runs wide. The order of visiting is different.'], why: 'The queue explores the oldest-found vertex first, so it spreads out level by level. A stack explores the newest-found first, so it plunges down one path and backs up. The recursion of depth-first search uses the call stack for the same job.' },
        { check: 'From A there are two routes to D: A, B, D has 2 roads of length 5 each (total 10), and A, C, E, D has 3 roads of total length 6. Which route does each search report as best?', skill: 'dijkstra', options: ['Breadth-first search reports A, B, D; Dijkstra reports A, C, E, D', 'Both report A, B, D', 'Both report A, C, E, D'], answer: 0, wrong: [null, 'Breadth-first search counts roads, so it does choose A, B, D. Dijkstra adds up lengths, and 6 is less than 10.', 'Breadth-first search counts roads, not lengths: it prefers the route with fewer roads, here A, B, D.'], why: 'Breadth-first search finds the fewest roads, which is the shortest route only when every road counts the same. When roads have lengths, Dijkstra\'s priority queue always settles the nearest vertex next.' },
        `<p>Two jobs to finish the unit. The first needs no code: choose the structure. The second checks that an array really is a heap.</p>`,
        {
          ex: {
            id: 'ds-15-1', kind: 'choice', skill: 'priority-queue', title: 'Which structure?',
            prompt: `<p>An emergency room treats the most urgent patient first. Patients arrive all the time with an urgency from 1 (most urgent) to 100, and each time a doctor is free the program must find and remove the most urgent waiting patient. With about a million patients waiting, which structure serves both jobs fastest?</p>`,
            options: [
              { text: 'A hash set of patients: adding is O(1).', why: 'Adding is fast, but a hash set has no order, so finding the most urgent patient means looking at every one: O(n).' },
              { text: 'An array kept sorted by urgency: the most urgent is at one end.', why: 'Finding the most urgent is O(1), but every arrival shifts about half the array: O(n).' },
              { text: 'A min-heap ordered by urgency: the most urgent is at the root.', ok: true },
              { text: 'A stack: new patients are pushed, and the doctor pops.', why: 'A stack gives back the newest patient, whatever the urgency.' }
            ],
            hints: ['The two jobs are "add one" and "remove the most urgent". Work out the cost of each for each structure.', 'You want both to be O(log n) or better. Only one of the structures keeps the smallest value at a fixed place and fixes itself in O(log n) after each change.'],
            solution: '<p>A min-heap (a priority queue): the smallest urgency number is at the root, which is O(1) to read. Adding sifts up and removing sifts down, each along one path of about log₂ 1,000,000 = 20 steps. The hash set and the sorted array each have one slow job, and the stack serves the wrong patient.</p>',
            followup: 'A balanced search tree (<code>TreeSet</code>) can do both jobs in O(log n) too. What can it do that a heap cannot, and why might you still choose the heap?'
          }
        },
        {
          ex: {
            id: 'ds-15-2', skill: 'heap-sift', title: 'Is it a heap?',
            prompt: `<p>Write a method</p><pre class="code">static boolean isMinHeap(int[] a, int n)</pre><p>that says whether the first <code>n</code> cells of <code>a</code> form a min-heap stored the usual way: the children of cell <code>i</code> are cells <code>2i + 1</code> and <code>2i + 2</code>, and no value may be larger than either of its children. Cells from <code>n</code> on are ignored. An empty heap (<code>n</code> is 0) is a heap, and equal values are allowed.</p><p><code>{2, 5, 3, 9, 6, 4}</code> is a heap. <code>{2, 5, 3, 9, 1, 4}</code> is not: the 1 is smaller than its parent, 5.</p>`,
            starter: `static boolean isMinHeap(int[] a, int n) {\n    // check every cell except the root against its parent\n    return false;\n}`,
            solution: `static boolean isMinHeap(int[] a, int n) {\n    for (int i = 1; i < n; i++) {\n        if (a[(i - 1) / 2] > a[i]) {\n            return false;\n        }\n    }\n    return true;\n}`,
            hints: ['Look at each cell from index 1 up to n - 1 and compare it with its parent. The parent of cell i is cell (i - 1) / 2.', 'If a parent is larger than its child, return false at once. If the loop ends without that, return true. Do not look at cells from n on.'],
            tests: [
              { call: 'isMinHeap(new int[] {2, 5, 3, 9, 6, 4}, 6)', expect: 'true', name: 'a heap' },
              { call: 'isMinHeap(new int[] {2, 5, 3, 9, 1, 4}, 6)', expect: 'false', name: 'a value smaller than its parent' },
              { call: 'isMinHeap(new int[] {4}, 1) + " " + isMinHeap(new int[0], 0)', expect: 'true true', name: 'one value and none' },
              { call: 'isMinHeap(new int[] {1, 2, 3, 0, 0}, 3) + " " + isMinHeap(new int[] {1, 2, 3, 0, 0}, 5)', expect: 'true false', name: 'only the first n cells count' },
              { call: 'isMinHeap(new int[] {1, 1, 1}, 3)', expect: 'true', name: 'equal values are allowed' },
              { call: 'isMinHeap(new int[] {5, 3, 4}, 3)', expect: 'false', name: 'the root must be the smallest' },
              { call: 'isMinHeap(new int[] {1, 5, 2, 6, 7, 3, 4}, 7) + " " + isMinHeap(new int[] {1, 5, 2, 6, 7, 3, 0}, 7)', expect: 'true false', name: 'a violation in the last cell' }
            ],
            failTip: 'If {5, 3, 4} says true, the loop probably starts at 0 or tests the wrong direction: a parent must be at most its child, so the test for failure is parent > child. If the cells beyond n matter, the loop bound should be n, not a.length.',
            followup: 'A sorted array, smallest first, is always a min-heap. Check that with your method on {1, 2, 3, 4, 5, 6, 7}, then find a heap that is not sorted. What does that tell you about how much order a heap keeps?'
          }
        },
        `<div class="recap"><h3>Unit three in a few lines</h3><ul>
<li>A binary search tree keeps smaller keys to the left and larger to the right: search, insert and delete cost its height, about log₂ n if it is balanced and n if the keys arrived sorted. An in-order walk reads the keys in order; the smallest key is the end of the left chain.</li>
<li>A heap is stored in an array (children of i at 2i + 1 and 2i + 2) and only keeps each parent at most its children. Sift up and sift down are O(log n), so a priority queue adds and removes the smallest in O(log n). A min-heap of size k finds the k largest.</li>
<li>A graph is stored as neighbour lists when it is sparse, and as a matrix when it is dense. Breadth-first search uses a queue and finds the fewest roads; a stack gives depth-first search; Dijkstra uses a priority queue and finds the shortest total length when no road is negative.</li>
<li>Next: a project that uses a hash table, a sort and a heap on one problem, the busiest words in a text.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standard: 1,
      standards: ['3B-AP-12', '3B-AP-11', '3A-DA-10'],
      title: 'Project: the busiest words', summary: 'A small project that uses the whole course: count the words of a text three ways (a hash table, sorting, a heap of the k best), compare what each costs, and write the top-k function a real tool would use.',
      blocks: [
        `<p>In 1986 Jon Bentley, who wrote the &ldquo;Programming Pearls&rdquo; column in <em>Communications of the ACM</em>, asked Donald Knuth to write a program that reads a text and prints its most frequent words. Knuth wrote one in a style he called literate programming, with a purpose-built hash structure, and it ran to several pages. Doug McIlroy, who invented the Unix pipe, answered with a pipeline of six standard commands that did the same job: split the text into words, sort them, count the repeats, sort by count, print the top. Both were right. The two answers use different structures, and the structure decided what each could do cheaply.</p>
<p>You have now met every tool they used. So which way costs less, and what would you pick if the text had a billion words and you needed only the top ten?</p>
<h2>Plan one: a hash table</h2>
<div class="stmt"><p><span class="kind">The job.</span> Given an array of words, find how many times each different word occurs, then report the <em>k</em> most frequent, most frequent first, and for equal counts the alphabetically earlier word first. Three plans do it. They differ in where the work goes.</p></div>
<p>The first plan is the one from lesson 9: a <code>HashMap</code> from word to count. Each word costs one lookup and one store, O(1) on average, so n words cost O(n). Predict what this prints before you run it.</p>`,
        { play: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        String text = "the cat and the dog and the bird saw the cat";
        String[] words = text.split(" ");
        Map<String, Integer> count = new HashMap<>();
        for (String w : words) count.put(w, count.getOrDefault(w, 0) + 1);
        System.out.println(words.length + " words, " + count.size() + " different");
        System.out.println("the: " + count.get("the") + ", cat: " + count.get("cat"));
    }
}`, predict: true, caption: `There are 11 words and 6 different ones: the, cat, and, dog, bird, saw. <code>getOrDefault(w, 0) + 1</code> reads the count so far (0 if the word is new) and stores one more. &ldquo;the&rdquo; occurs 4 times and &ldquo;cat&rdquo; twice. The table holds one entry per <em>different</em> word, so its size is the number of different words, not the number of words.` },
        { check: 'A text has 1,000,000 words but only 20,000 different ones. About how many entries does the <code>HashMap</code> of counts hold at the end?', skill: 'map-counting', options: ['1,000,000', '20,000', '1,000', '20'], answer: 1, why: 'One entry per different word. The table grows with the number of different words, not with the length of the text. That is why counting a huge text with few different words needs little memory.', wrong: ['That would be one entry per word. Repeats update the existing entry; they add no new one.', , 'There are 20,000 different words, so 20,000 keys must be stored.', 'Twenty is the number of thousands, not the number of keys.'] },
        `<h2>Plan two: sort, then count runs</h2>
<p>McIlroy's plan needs no hash table. Sort the words, and equal words end up side by side. Then one pass over the sorted array counts each <em>run</em> of equal neighbours. Sorting costs O(n log n) (lesson 4), the pass costs O(n).</p>`,
        { play: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        String[] w = "the cat and the dog and the bird saw the cat".split(" ");
        Arrays.sort(w);
        System.out.println(Arrays.toString(w));
        int run = 1;
        for (int i = 1; i <= w.length; i++) {
            if (i < w.length && w[i].equals(w[i - 1])) run++;
            else { System.out.println(w[i - 1] + " " + run); run = 1; }
        }
    }
}`, predict: true, caption: `After sorting, the four &ldquo;the&rdquo; are one run, the two &ldquo;and&rdquo; another, and so on. The loop goes one past the end (<code>i &lt;= w.length</code>) so that the last run is printed too; the test <code>i &lt; w.length</code> stops it reading outside the array. The words come out in alphabetical order, which the hash table did not give you.` },
        `<p>Plan two has two advantages. It uses only an array, and it gives the words in alphabetical order for free. It has one cost: O(n log n) against the table's O(n), so for a text of a million words it does about twenty times more comparing. Neither plan has yet said anything about which words are the <em>busiest</em>.</p>
<h2>Plan three: keep only the best k</h2>
<p>Lesson 12's pattern fits exactly. Count with a hash table, then walk the table's entries and keep a min-heap of the best k so far. Whenever the heap holds more than k, throw away its worst entry. A <code>Word</code> that implements <code>Comparable</code> says what &ldquo;worse&rdquo; means: fewer occurrences, or the same number and a later place in the alphabet.</p>`,
        { play: `import java.util.*;

class Word implements Comparable<Word> {
    String text; int count;
    Word(String text, int count) { this.text = text; this.count = count; }
    public int compareTo(Word o) {
        if (count != o.count) return Integer.compare(count, o.count);
        return o.text.compareTo(text);          // later in the alphabet is worse
    }
}

public class Main {
    public static void main(String[] args) {
        String[] words = "the cat and the dog and the bird saw the cat".split(" ");
        Map<String, Integer> count = new HashMap<>();
        for (String w : words) count.put(w, count.getOrDefault(w, 0) + 1);
        PriorityQueue<Word> best = new PriorityQueue<>();
        for (Map.Entry<String, Integer> e : count.entrySet()) {
            best.add(new Word(e.getKey(), e.getValue()));
            if (best.size() > 3) best.poll();
        }
        String[] top = new String[best.size()];
        for (int i = top.length - 1; i >= 0; i--) { Word w = best.poll(); top[i] = w.text + " " + w.count; }
        System.out.println(Arrays.toString(top));
    }
}`, predict: true, long: true, caption: `The heap never holds more than 3 words. &ldquo;the&rdquo; has 4. &ldquo;and&rdquo; and &ldquo;cat&rdquo; have 2 each, and &ldquo;and&rdquo; is earlier in the alphabet, so it ranks first of the two. The three words with 1 (bird, dog, saw) are thrown away one at a time as better ones arrive. The heap gives the worst first, so the answer is filled from the end of the array backwards.` },
        { check: 'You have d different words and want the top k. What does the heap plan cost after the counting?', skill: 'top-k', options: ['O(d log k)', 'O(d log d)', 'O(k²)', 'O(d)'], answer: 0, why: 'Each of the d entries is added to a heap that never holds more than k + 1 items, so each add and each poll costs O(log k). Sorting all d entries instead would cost O(d log d), which is more when k is small.', wrong: [, 'That is the cost of sorting every entry. The heap is only ever k items deep, so its operations cost log k, not log d.', 'k is the size of the answer, not the number of operations. Every one of the d entries has to be looked at.', 'Looking at d entries is O(d), but each one also touches the heap, which costs O(log k) each.'] },
        `<h2>Choosing</h2>
<table class="growth-table"><thead><tr><th>Plan</th><th>Time to count</th><th>Gives</th><th>Memory</th></tr></thead><tbody>
<tr><td>Hash table, then sort the entries</td><td>O(n + d log d)</td><td>everything, by count</td><td>d entries</td></tr>
<tr><td>Sort the words, count runs</td><td>O(n log n)</td><td>everything, alphabetical</td><td>the array</td></tr>
<tr><td>Hash table, heap of the best k</td><td>O(n + d log k)</td><td>only the top k</td><td>d entries and k in the heap</td></tr>
</tbody></table>
<p>For the billion-word question: if the text has fewer than a few million different words, the hash table fits in memory and the heap picks the top ten almost for free. If it does not fit, sorting the text in pieces on disk and merging them (lesson 4's merge) is how McIlroy's pipeline scales, which is why it has lasted. The right answer depends on which resource you lack, and you can now say which one each plan spends.</p>
<p><b>Common mistakes in this project.</b> Using <code>==</code> to compare words; use <code>equals</code>. Forgetting the last run in the sorted-array count. Making the heap hold <em>all</em> the entries, which is a slow sort. Reversing the comparison so the heap throws away the best word. Forgetting a rule for ties: without one, two runs can print the same words in a different order.</p>`,
        { check: 'In the <code>Word</code> class of the heap plan, <code>compareTo</code> says a word with a smaller count is &ldquo;less&rdquo;. Why does a min-heap of these keep the <em>best</em> k?', skill: 'top-k', options: ['It polls the smallest, which is the worst of the k + 1 held, so the best k stay', 'It sorts the words by count in the end', 'It keeps the k smallest counts', 'It only works if all the counts differ'], answer: 0, why: 'A min-heap gives up its smallest item first. After each add, the smallest of the k + 1 items is the one that cannot be in the top k, so polling it leaves the k best.', wrong: [, 'The heap is never sorted. It only knows its smallest item, which is all it needs.', 'The smallest is thrown away, so the largest counts are the ones that survive.', 'Ties are handled by the second line of compareTo, the alphabet.'] },
        { ex: {
            id: 'ds-12-1', skill: 'map-counting', title: 'The most common word',
            prompt: `<p>Write</p><pre class="code">static String mostCommon(String[] words)</pre><p>that returns the word that occurs most often in <code>words</code>. If several words share the highest count, return the alphabetically first of them. For an empty array return the empty string <code>""</code>. Use a <code>HashMap</code>: the tests include a text of thousands of words.</p>`,
            prelude: 'import java.util.*;',
            starter: `static String mostCommon(String[] words) {
    Map<String, Integer> count = new HashMap<>();
    // count every word
    String best = "";
    // look at every entry; keep the word with the highest count (earlier word on a tie)
    return best;
}`,
            solution: `static String mostCommon(String[] words) {
    Map<String, Integer> count = new HashMap<>();
    for (String w : words) count.put(w, count.getOrDefault(w, 0) + 1);
    String best = "";
    int bestCount = 0;
    for (Map.Entry<String, Integer> e : count.entrySet()) {
        int c = e.getValue();
        if (c > bestCount || (c == bestCount && e.getKey().compareTo(best) < 0)) {
            best = e.getKey();
            bestCount = c;
        }
    }
    return best;
}`,
            mustNotContain: [{ re: /Arrays\.sort|Collections\.sort|\.sort\s*\(/, msg: 'Use the hash table: sorting all the words is the plan this exercise is not about.' }],
            hints: ['Count first: for each word, put(word, getOrDefault(word, 0) + 1). Then a second loop over count.entrySet().', 'Keep the best word and its count. An entry wins if its count is larger, or equal with an alphabetically earlier key: key.compareTo(best) < 0.', 'Start with bestCount = 0, so that the first entry always wins, and the empty array leaves best as "".'],
            tests: [
              { call: 'mostCommon("the cat and the dog and the bird saw the cat".split(" "))', expect: 'the', name: 'one clear winner' },
              { call: 'mostCommon(new String[] {"b", "a", "b", "a"})', expect: 'a', name: 'a tie: the earlier word' },
              { call: 'mostCommon(new String[] {"solo"})', expect: 'solo', name: 'one word' },
              { call: 'mostCommon(new String[] {})', expect: '', name: 'no words' },
              { setup: '        String[] w = new String[3000]; for (int i = 0; i < w.length; i++) w[i] = "w" + ((i * i) % 50);', call: 'mostCommon(w)', expect: 'w0', name: 'three thousand words, a tie at the top' }
            ],
            failTip: 'If a tie gives the wrong word, the order the table hands you its entries in is not alphabetical, so you must compare the keys yourself. If the empty array fails, check what best starts as.',
            followup: 'Return the count of the winner too, as "the 4". Then change the tie rule to prefer the word that appeared first in the text. What does the hash table not remember that you now need?'
          }
        },
        { ex: {
            id: 'ds-12-2', skill: 'top-k', title: 'The top k words',
            prompt: `<p>Complete <code>TopWords.top(words, k)</code>. It returns an array of at most <code>k</code> strings of the form <code>"word count"</code>, the most frequent word first; for equal counts the alphabetically earlier word comes first. <code>Word</code> is given, and its <code>compareTo</code> already makes the <em>worse</em> word the smaller. Count with a <code>HashMap</code> and keep only the best <code>k</code> in a <code>PriorityQueue&lt;Word&gt;</code>. Do not sort.</p>`,
            classes: true,
            prelude: 'import java.util.*;\n',
            starter: `class Word implements Comparable<Word> {
    String text; int count;
    Word(String text, int count) { this.text = text; this.count = count; }
    public int compareTo(Word o) {
        if (count != o.count) return Integer.compare(count, o.count);
        return o.text.compareTo(text);
    }
}

class TopWords {
    static String[] top(String[] words, int k) {
        // 1. count the words in a HashMap
        // 2. add a Word for every entry to a PriorityQueue; poll when it holds more than k
        // 3. fill the answer from the END, polling the worst first
        return new String[0];
    }
}`,
            solution: `class Word implements Comparable<Word> {
    String text; int count;
    Word(String text, int count) { this.text = text; this.count = count; }
    public int compareTo(Word o) {
        if (count != o.count) return Integer.compare(count, o.count);
        return o.text.compareTo(text);
    }
}

class TopWords {
    static String[] top(String[] words, int k) {
        Map<String, Integer> count = new HashMap<>();
        for (String w : words) count.put(w, count.getOrDefault(w, 0) + 1);
        PriorityQueue<Word> best = new PriorityQueue<>();
        for (Map.Entry<String, Integer> e : count.entrySet()) {
            best.add(new Word(e.getKey(), e.getValue()));
            if (best.size() > k) best.poll();
        }
        String[] out = new String[best.size()];
        for (int i = out.length - 1; i >= 0; i--) {
            Word w = best.poll();
            out[i] = w.text + " " + w.count;
        }
        return out;
    }
}`,
            mustNotContain: [{ re: /Arrays\.sort|Collections\.sort|\.sort\s*\(/, msg: 'Keep a heap of size k instead of sorting.' }],
            hints: ['The loop over count.entrySet() is the one from the lesson: add a new Word, then poll when best.size() > k.', 'poll() returns the worst remaining word, so the first word you poll belongs at the LAST index of the answer. Count down from out.length - 1.', 'Make the array as long as the heap is at the end, best.size(), so a k bigger than the number of different words works.'],
            tests: [
              { name: 'the lesson text, top 3', main: '        System.out.println(Arrays.toString(TopWords.top("the cat and the dog and the bird saw the cat".split(" "), 3)));', expect: '[the 4, and 2, cat 2]' },
              { name: 'only the top word', main: '        System.out.println(Arrays.toString(TopWords.top("the cat and the dog and the bird saw the cat".split(" "), 1)));', expect: '[the 4]' },
              { name: 'k bigger than the number of different words', main: '        System.out.println(Arrays.toString(TopWords.top("the cat and the dog and the bird saw the cat".split(" "), 10)));', expect: '[the 4, and 2, cat 2, bird 1, dog 1, saw 1]' },
              { name: 'no words, and k = 0', main: '        System.out.println(Arrays.toString(TopWords.top(new String[] {}, 3)) + " " + Arrays.toString(TopWords.top(new String[] {"a"}, 0)));', expect: '[] []' },
              { name: 'three thousand words', main: '        String[] w = new String[3000]; for (int i = 0; i < w.length; i++) w[i] = "w" + ((i * i) % 50);\n        System.out.println(Arrays.toString(TopWords.top(w, 3)));', expect: '[w0 300, w25 300, w1 120]' }
            ],
            failTip: 'If the order is reversed you filled the answer from index 0: the heap hands you the worst first. If equal counts come out in the wrong order, the tie rule lives in Word.compareTo, which was given; check you are polling, not removing from the wrong end.',
            followup: 'Change TopWords to take a minimum count and report only words that reach it. Then say which plan of the lesson would be cheapest if you also wanted every word in alphabetical order.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li><b>Which way costs less?</b> Counting with a hash table is O(n); sorting is O(n log n) but gives alphabetical order and needs no table; keeping the best k in a heap costs O(d log k) after the counting. What you need to produce, and what memory you have, decides.</li>
<li>One problem, three structures from this course: a <code>HashMap</code>, a sorted array and a <code>PriorityQueue</code>. Each is the best answer to a different question.</li>
<li>A tie rule has to be part of the specification. Write it into <code>compareTo</code> so the answer is the same on every run.</li>
<li>For the top ten of a billion words, a hash table plus a heap of ten does it if the different words fit in memory; if not, sorting pieces and merging is what scales.</li>
</ul></div>`
      ]
    }
  ]
});
