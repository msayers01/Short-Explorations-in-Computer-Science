// Lesson content, (c) 2026 Michael Sayers, licensed CC BY-SA 4.0 (see LICENSE-CONTENT.md).
// This course runs on the Full C++ engine (a real compiler; see src/runner.js, CLANGRUN), not on the small interpreter the other C++ course uses.
window.COURSES = window.COURSES || [];
window.COURSES.push({
  id: 'modern', code: 'SC 105', short: 'Modern C++', lang: 'cpp', runtime: 'full', status: 'developing',
  title: 'Modern C++', standard: 1,
  grades: 'Grades 11–12 · after Introduction to C++',
  audience: `<p><b>Grades 11–12</b>, after <em>Introduction to C++</em> (SC 103), or after any course where you have met types, loops, functions and pointers. This is the C++ that working programmers write today: strings and lists that look after themselves, references instead of most pointers, your own types, and the algorithms and lookups of the standard library. If SC 103 showed you what the machine is doing, this course shows you how to stop doing it by hand.</p><p>Each lesson has two graded exercises. Lessons 5 and 9 are <b>checkpoints</b>: no new ideas, just mixed questions on the lessons before them. The last lesson is a larger project that uses everything.</p>`,
  tagline: 'Strings, vectors, references, classes, algorithms and maps: the parts of C++ that working programmers use every day.',
  description: `<p>The first C++ course on this site ran on a small interpreter, which was enough for types, memory and pointers but could not do what real C++ programs do all day: hold text in a <code>std::string</code>, keep a growing list in a <code>std::vector</code>, hand a big object to a function without copying it, or count words with a <code>std::map</code>. This course uses a <b>real compiler</b> (Clang, the compiler behind Apple's developer tools and Android's native code), running inside your browser.</p>
<p>The first time you run a program here your browser downloads that compiler: about 28 MB, once. After that it is kept on your device, and nothing you write ever leaves it. Only this course and the <b>Full C++</b> choice in the Code Lab need the download; everything else on the site works without it, even offline.</p>`,
  outcomes: [
    'Use std::string to read, build, search and compare text',
    'Keep collections in a std::vector and walk them with a range-based for loop',
    'Explain the difference between a copy and a reference, and choose between passing by value, by reference and by const reference',
    'Define a struct, and a class whose data is private and whose constructor and functions keep it valid',
    'Use sort, find, count and lambdas from <algorithm>, and map and set for lookups and counting',
    'Read the messages a real compiler gives, including its warnings',
    'Break a larger task into steps, and build and check a program a piece at a time'
  ],
  howItWorks: `<h3>How to use these pages</h3><p>Press <b>Run</b> on any example. The first time, you are asked to let your browser download the compiler (about 28 MB, kept after that). Real compilers take a moment: expect a second or two between pressing Run and seeing output. If the compiler has something to say about your program, its warnings and errors appear above the output, exactly as a professional would see them.</p><p>Exercises are checked by compiling your program once and running it on hidden inputs. Where an exercise asks for a function, write only the function: the checker supplies its own <code>main</code> to call it. Your work is saved in this browser.</p><p>Quick checks ask how sure you are before they mark you, and they come back on the Review page after a day, then after longer gaps. Lessons 5 and 9 are <b>checkpoints</b>: mixed questions on the four lessons before them (three, for the second), because telling apart ideas that look alike, such as a copy and a reference, is a skill of its own.</p>`,
  // The named skills of the course (LESSON_STANDARD.md §4). Each quick check and exercise names the skill it practises; the skills map on
  // the course page and on #/today shows each as not started, practising or secure. Lessons 5 and 9 are checkpoints (no new material).
  skills: [
    { id: 'string-find', name: 'Search a string with find and string::npos' },
    { id: 'unsigned-size', name: 'Beware that size() is unsigned' },
    { id: 'read-lines', name: 'Read a word or a whole line with cin and getline' },
    { id: 'string-compare', name: 'Compare and index the characters of a string' },
    { id: 'range-for', name: 'Visit every item with a range-based for loop' },
    { id: 'vector-grow', name: 'Grow a vector with push_back' },
    { id: 'vector-index', name: 'Index a vector from 0 to size() - 1' },
    { id: 'read-until-end', name: 'Read values until the input ends' },
    { id: 'checked-access', name: 'Choose at(i) when an index might be wrong' },
    { id: 'reference-alias', name: 'Use a reference as another name for a variable' },
    { id: 'pass-mode', name: 'Pass by value, by reference or by const reference' },
    { id: 'dangling-reference', name: 'Never return a reference to a local variable' },
    { id: 'struct-define', name: 'Define a struct and build values of it' },
    { id: 'struct-member', name: 'Reach the members of a struct and keep structs in a vector' },
    { id: 'struct-copy', name: 'Know that a struct is copied, and has no ==' },
    { id: 'constructor', name: 'Write a constructor with an initialiser list' },
    { id: 'class-private', name: 'Keep data private and offer public functions' },
    { id: 'const-member', name: 'Mark member functions that only look as const' },
    { id: 'invariant', name: 'Keep an invariant true in every public function' },
    { id: 'algo-range', name: 'Give an algorithm a range and read its result' },
    { id: 'lambda', name: 'Write a lambda and choose what it captures' },
    { id: 'strict-compare', name: 'Write strict comparisons; use stable_sort for ties' },
    { id: 'map-count', name: 'Count and look up with a map' },
    { id: 'map-missing-key', name: 'Know that m[key] adds a missing key' },
    { id: 'set-distinct', name: 'Keep distinct items in order with a set' },
    { id: 'unordered-order', name: 'Know that unordered containers have no order' },
    { id: 'choose-container', name: 'Choose the container that fits the task' },
    { id: 'format-decimals', name: 'Print a fixed number of decimal places' },
    { id: 'plan-program', name: 'Plan a bigger program before typing it' }
  ],
  lessons: [
    /* ================================================================== */
    {
      standards: ['3B-AP-12', '3B-AP-16'], standard: 1,
      title: 'Text that looks after itself', summary: 'std::string: reading, building, searching and comparing text, and why it replaced the character arrays of the first C++ course.',
      blocks: [
        `<p>On the evening of 2 November 1988, a graduate student at Cornell named Robert Tappan Morris released a small program onto the Internet, which then connected only about sixty thousand computers. Within a day it had, by common estimates, infected roughly one in ten of them and forced many to be taken offline. One of the ways it got in was through a program called <code>fingerd</code>, which read a line of text sent over the network into a fixed-size array of characters, without checking that the line fit. Morris sent a line that was too long. The extra characters spilled past the end of the array and overwrote whatever lay next to it in memory, and the overwritten memory held instructions that Morris's program had chosen.</p>`,
        { photo: 'morris-worm-disk', caption: 'A floppy disk holding the source code of the Morris worm, shown at the Museum of Science in Boston in 2006.' },
        `<p>That is the bug you met in the first C++ course as "an array index went past the end". With a <code>char</code> array you decide the size in advance, you must keep track of how much of it is used, and nothing stops you writing past the end. For three decades this kind of mistake has been among the most common causes of security holes in C and C++ programs. The standard library's answer is a type that owns its characters and grows when it needs to: <code>std::string</code>. So what does it take to hold text of any length without ever writing past its end?</p>
<h2>A string you do not have to manage</h2>
<p>To use it, include <code>&lt;string&gt;</code>. A <code>string</code> is created like any other variable, can be built up with <code>+</code> and <code>+=</code>, and always knows its own length.</p>`,
        { play: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string greeting = "Hello";
    string name = "world";
    string message = greeting + ", " + name + "!";
    message += " Welcome to modern C++.";
    cout << message << endl;
    cout << "It has " << message.size() << " characters." << endl;
    cout << "The first is " << message[0] << " and the last is " << message[message.size() - 1] << endl;
    return 0;
}`, predict: true, caption: 'It prints the whole message, then <code>It has 36 characters.</code>, then <code>The first is H and the last is .</code>: the last character is the full stop. Strings grow as you add to them; there is no size to choose and nothing to overflow. Change the message and run it again, and check that the count follows.' },
        `<p>Compare that with the character arrays of SC 103, where <code>char word[] = "hello"</code> was exactly six bytes for ever. The table lists what you will use most. Here <code>s</code> is a <code>string</code>.</p>
<div class="tbl-wrap"><table>
<tr><th>write</th><th>meaning</th></tr>
<tr><td><code>s.size()</code></td><td>the number of characters (also written <code>s.length()</code>)</td></tr>
<tr><td><code>s.empty()</code></td><td><code>true</code> if there are no characters</td></tr>
<tr><td><code>s[i]</code></td><td>the character at position <code>i</code>, counting from 0. Not checked: a position that is too big is a bug the compiler cannot see.</td></tr>
<tr><td><code>s.at(i)</code></td><td>the same, but a position that is too big stops the program with an error instead of silently reading garbage</td></tr>
<tr><td><code>s + t</code>, <code>s += t</code></td><td>join two strings; add to the end. One side may be a <code>"quoted literal"</code> or a single <code>'c'</code>, but not both sides.</td></tr>
<tr><td><code>s == t</code>, <code>s &lt; t</code></td><td>compare whole strings. <code>==</code> compares the characters, which is what you want. <code>&lt;</code> is dictionary order.</td></tr>
<tr><td><code>s.substr(start, count)</code></td><td>a new string of <code>count</code> characters beginning at <code>start</code></td></tr>
<tr><td><code>s.find(t)</code></td><td>the position where <code>t</code> first occurs, or <code>string::npos</code> if it does not</td></tr>
<tr><td><code>s.push_back(c)</code>, <code>s.pop_back()</code></td><td>add one character to the end; remove the last one</td></tr>
</table></div>
<div class="stmt"><p><span class="kind">Rule (comparing).</span> With <code>string</code> the operator <code>==</code> does what it looks like. In SC 103, comparing two <code>char</code> arrays with <code>==</code> compared their <em>addresses</em>, and you needed <code>strcmp</code>. That trap is gone.</p></div>
<h2>Searching and slicing</h2>
<p><code>find</code> returns a number, the position of the first match. When there is no match it cannot return a position, so it returns a special value named <code>string::npos</code>. Always compare against it, never against a number you made up.</p>`,
        { play: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string line = "name=Ada Lovelace";
    size_t eq = line.find('=');
    if (eq == string::npos) {
        cout << "no equals sign" << endl;
    } else {
        string key = line.substr(0, eq);
        string value = line.substr(eq + 1);
        cout << "key:   " << key << endl;
        cout << "value: " << value << endl;
    }
    cout << "position of 'zz': " << (line.find("zz") == string::npos ? "not found" : "found") << endl;
    return 0;
}`, predict: true, caption: 'It prints <code>key:   name</code>, <code>value: Ada Lovelace</code> and <code>position of \'zz\': not found</code>. <code>find(\'=\')</code> gave 4, so <code>substr(0, 4)</code> is the four characters before the sign and <code>substr(5)</code> with one argument takes everything from position 5 to the end. Try a line with no = in it.' },
        { check: "What does <code>s.find(\"x\")</code> give when there is no x in s?", skill: 'string-find', options: ["−1", "<code>string::npos</code>", "0"], answer: 1, wrong: ["That is what Python's <code>find</code> returns. In C++ <code>find</code> returns an unsigned <code>size_t</code>, which cannot be negative. The \"not found\" value has its own name, <code>string::npos</code> (it happens to be the largest <code>size_t</code>): compare with the name, not a number.", null, "0 is a real answer: it is where a match at the very start would be found. If \"not found\" were 0 you could not tell the two cases apart."], why: "find returns the position, or the special value string::npos for \"not found\". Compare against npos, not −1." },
        `<p>The type of <code>eq</code> is worth a second look. <code>size_t</code> is an <em>unsigned</em> whole number: it cannot be negative. Every <code>size()</code> and <code>find()</code> in the library returns one. That is almost always fine, with one famous trap.</p>
<div class="stmt"><p><span class="kind">Trap.</span> If <code>s</code> is empty, <code>s.size() - 1</code> is not −1. An unsigned number cannot go below 0, so it wraps round to the largest number there is: about four billion in the compiler used on this site, and far more on a modern computer. A loop that runs "to the last character" with <code>i &lt;= s.size() - 1</code> then runs past the end of an empty string. Write <code>i + 1 &lt; s.size()</code>, or convert first with <code>(int)s.size() - 1</code>.</p></div>
<p>The compiler can warn you about some comparisons between signed and unsigned numbers. Compiler output on this site includes warnings, so read them: in a real project, a clean build with no warnings is the normal standard.</p>
<h2>Reading text</h2>
<p><code>cin &gt;&gt; word</code> reads one <em>word</em>: it skips spaces and stops at the next one. To read a whole line, spaces included, use <code>getline</code>.</p>`,
        { check: "For an empty string s, what is <code>s.size() - 1</code>?", skill: 'unsigned-size', options: ["−1", "An enormous number: size() is unsigned and wraps round", "0"], answer: 1, wrong: ["That is what a signed <code>int</code> would give, and it is why <code>i &lt;= s.size() - 1</code> looks safe. But <code>size()</code> is unsigned: it cannot go below 0, so taking 1 off 0 wraps round to the top.", null, "0 is <code>s.size()</code> itself. Subtracting 1 from an unsigned 0 does not stop at 0; it wraps round to the largest value."], why: "An unsigned number cannot go below 0, so it wraps to the largest value. Write i + 1 < s.size(), or cast to int first." },
        { play: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string first;
    cin >> first;            // one word
    string rest;
    getline(cin, rest);      // the rest of that line, starting with the space after the word
    cout << "first word: [" << first << "]" << endl;
    cout << "the rest:   [" << rest << "]" << endl;
    return 0;
}`, stdin: 'Margaret Heafield Hamilton', predict: true, caption: 'It prints <code>first word: [Margaret]</code> and <code>the rest:   [ Heafield Hamilton]</code>. Notice the space at the start of the rest: <code>cin &gt;&gt;</code> stopped just before it, so <code>getline</code> began there.' },
        { check: "After <code>cin &gt;&gt; n</code>, a <code>getline</code> reads what?", skill: 'read-lines', options: ["The next line the user typed", "The empty rest of the current line, because the newline is still waiting", "Nothing: it waits"], answer: 1, wrong: ["That is what you hoped for. But <code>cin &gt;&gt; n</code> stops right after the digits and leaves the newline in the stream, and <code>getline</code> finds that first.", null, "<code>getline</code> only waits when there is nothing to read. Here a character (the leftover newline) is already waiting, so it returns at once with an empty string."], why: "The end-of-line after the number is still in the stream. Skip it with cin >> ws, or read lines and convert." },
        `<div class="stmt"><p><span class="kind">Trap.</span> After <code>cin &gt;&gt; n</code> reads a number, the end-of-line character the student typed is still waiting. A <code>getline</code> straight afterwards reads <em>that</em>, an empty line. To skip the leftover, read with <code>cin &gt;&gt; ws</code> first, which discards white space, or start with <code>getline</code> and convert.</p></div>
<h2>Going through the characters</h2>
<p>A string is a sequence of characters, and C++ lets you walk through one directly. The loop below is called a <em>range-based for</em>; read it as "for each character <code>c</code> in <code>text</code>". The functions <code>isalpha</code>, <code>isdigit</code>, <code>toupper</code> and <code>tolower</code> live in <code>&lt;cctype&gt;</code>.</p>`,
        { play: `#include <iostream>
#include <string>
#include <cctype>
using namespace std;

int main() {
    string text = "Room 101 opens at 9am.";
    int letters = 0, digits = 0;
    string shouted;
    for (char c : text) {
        if (isalpha(static_cast<unsigned char>(c))) letters++;
        if (isdigit(static_cast<unsigned char>(c))) digits++;
        shouted += static_cast<char>(toupper(static_cast<unsigned char>(c)));
    }
    cout << letters << " letters, " << digits << " digits" << endl;
    cout << shouted << endl;
    return 0;
}`, predict: true, caption: 'It prints <code>13 letters, 4 digits</code> (Room, opens, at and am make 13 letters; 101 and 9 make 4 digits), then the text in capitals. The casts to unsigned char are the careful way to call the cctype functions; for plain English text you will see them written without.' },
        { aside: `<p><b>Common mistakes in this lesson.</b> Adding two string literals: <code>"a" + "b"</code> does not compile, because neither side is a <code>string</code>; make one a <code>string</code> first. Forgetting <code>#include &lt;string&gt;</code>, which sometimes works by accident and then fails on another computer. Mixing up <code>'x'</code> (one character) and <code>"x"</code> (a string). Using <code>s[i]</code> with an <code>i</code> that is too large: no error, just wrong answers.</p>` },
        {
          ex: {
            id: 'mc-1-1', skill: ['read-lines', 'range-for'], title: 'Initials',
            prompt: `<p>Read one line holding a person's name, with any number of words, and print the first letter of each word in capitals, with nothing between them. For <code>grace brewster hopper</code> print <code>GBH</code>.</p><p>Use <code>getline</code> to read the whole line. Words are separated by spaces; there may be extra spaces, including at the start of the line.</p>`,
            starter: `#include <iostream>\n#include <string>\n#include <cctype>\nusing namespace std;\n\nint main() {\n    string name;\n    getline(cin, name);\n    string initials;\n    // your code here\n    cout << initials << endl;\n    return 0;\n}`,
            solution: `#include <iostream>\n#include <string>\n#include <cctype>\nusing namespace std;\n\nint main() {\n    string name;\n    getline(cin, name);\n    string initials;\n    bool atStart = true;\n    for (char c : name) {\n        if (c == ' ') {\n            atStart = true;\n        } else {\n            if (atStart) initials += static_cast<char>(toupper(static_cast<unsigned char>(c)));\n            atStart = false;\n        }\n    }\n    cout << initials << endl;\n    return 0;\n}`,
            sampleStdin: 'grace brewster hopper',
            hints: ['Keep a bool, say atStart, that is true when the next letter you see begins a word. It starts true.', 'Go through the line with for (char c : name). A space sets atStart to true. Any other character: if atStart is true, add its capital to initials, then set atStart to false.', 'To make a capital use toupper(c) from <cctype>; to add a character to the end of a string use initials += ...'],
            tests: [{ stdin: 'grace brewster hopper', expect: 'GBH' }, { stdin: 'alan turing', expect: 'AT' }, { stdin: 'ada', expect: 'A' }, { stdin: '  margaret   hamilton ', expect: 'MH' }, { stdin: 'Katherine Johnson', expect: 'KJ' }],
            failTip: 'Check the extra spaces: a space before or between words must not produce a letter, and each word must give exactly one.',
            followup: 'Stretch: put a full stop after each initial, so that grace brewster hopper gives G.B.H. Then make the program read lines until the input ends and print the initials of each line.'
          }
        },
        {
          ex: {
            id: 'mc-1-2', skill: 'string-compare', title: 'Palindromes',
            prompt: `<p>A <em>palindrome</em> reads the same backwards as forwards: <code>racecar</code>, <code>level</code>, <code>noon</code>. Write a function</p><pre class="code">bool isPalindrome(string s)</pre><p>that returns <code>true</code> if <code>s</code> is a palindrome and <code>false</code> if it is not. The empty string and a single character both count as palindromes. Treat capital and small letters as different, so <code>Noon</code> is not one. Write only the function; the checker supplies <code>main</code>.</p>`,
            prelude: '#include <iostream>\n#include <string>\nusing namespace std;\n',
            starter: `bool isPalindrome(string s) {\n    // compare the character at one end with the one at the other\n    return false;\n}`,
            solution: `bool isPalindrome(string s) {\n    int i = 0;\n    int j = (int)s.size() - 1;\n    while (i < j) {\n        if (s[i] != s[j]) return false;\n        i++;\n        j--;\n    }\n    return true;\n}`,
            hints: ['Keep two positions: i at the first character and j at the last. Compare s[i] with s[j].', 'If they ever differ, return false straight away. Otherwise move i up and j down, and stop when they meet in the middle (while i < j).', 'Beware the trap from this lesson: for an empty string, s.size() - 1 is a huge number. Write (int)s.size() - 1.'],
            tests: [
              { name: 'isPalindrome("racecar")', main: '        cout << (isPalindrome("racecar") ? "yes" : "no") << endl;', expect: 'yes' },
              { name: 'isPalindrome("level")', main: '        cout << (isPalindrome("level") ? "yes" : "no") << endl;', expect: 'yes' },
              { name: 'isPalindrome("abba")', main: '        cout << (isPalindrome("abba") ? "yes" : "no") << endl;', expect: 'yes' },
              { name: 'isPalindrome("abca")', main: '        cout << (isPalindrome("abca") ? "yes" : "no") << endl;', expect: 'no' },
              { name: 'isPalindrome("Noon")', main: '        cout << (isPalindrome("Noon") ? "yes" : "no") << endl;', expect: 'no' },
              { name: 'isPalindrome("x")', main: '        cout << (isPalindrome("x") ? "yes" : "no") << endl;', expect: 'yes' },
              { name: 'isPalindrome("")', main: '        cout << (isPalindrome("") ? "yes" : "no") << endl;', expect: 'yes' }
            ],
            failTip: 'Check the two odd cases, the empty string and a one-letter string: both are palindromes.',
            followup: 'Stretch: make a second version that ignores capital letters, so that Noon counts. Build a lower-case copy first with tolower, then compare that.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><p>The opening question: a <code>std::string</code> holds text of any length by owning its characters and growing as you add to it, so there is no fixed size to write past.</p><ul>
<li><code>std::string</code> (from <code>&lt;string&gt;</code>) owns its characters and grows as needed, so the overflow bugs of fixed character arrays do not arise. <code>==</code> compares the text.</li>
<li><code>size()</code>, <code>s[i]</code>, <code>substr(start, count)</code> and <code>find(t)</code> do most of the work; <code>find</code> says "not found" with <code>string::npos</code>.</li>
<li><code>size()</code> is unsigned: <code>s.size() - 1</code> on an empty string is enormous, not −1.</li>
<li><code>cin &gt;&gt; word</code> reads one word; <code>getline(cin, line)</code> reads a whole line. <code>for (char c : s)</code> goes through every character.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3A-AP-14', '3B-AP-12', '3B-AP-16'], standard: 1,
      title: 'Lists that grow', summary: 'std::vector: a sequence that can grow and shrink, the range-based for loop, and what happens when an index is out of range.',
      blocks: [
        `<p>In the early 1990s Alexander Stepanov, a mathematician turned programmer working at Hewlett-Packard, had an unfashionable idea: that the tools for sorting, searching and storing data should be written once, for every kind of data, and be as fast as hand-written code. With his colleague Meng Lee he built a library on that idea. The C++ standards committee accepted it in 1994, it became part of the first C++ standard in 1998, and it is still called, after its origin, the Standard Template Library. Its most-used part is the <code>vector</code>.</p>`,
        `<p>In SC 103 you stored a list in an array, <code>int scores[5]</code>, whose size was fixed when you wrote the program. Real programs rarely know in advance how much data there will be: how many lines a file has, how many students are in a class, how many numbers a user will type. A <code>vector</code> is an array that remembers its own size and can grow. So how does a list grow while the program runs, and what happens if you reach for an item that is not there?</p>
<h2>A vector of anything</h2>
<p>Include <code>&lt;vector&gt;</code>. The type in angle brackets says what the vector holds: <code>vector&lt;int&gt;</code> is a list of whole numbers, <code>vector&lt;string&gt;</code> a list of strings. (The same idea, a type that takes another type as a parameter, is called a <em>template</em>.)</p>`,
        { play: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> scores = {70, 85, 92};      // start with three values
    scores.push_back(60);                    // add to the end
    scores.push_back(78);
    cout << "There are " << scores.size() << " scores." << endl;
    cout << "The first is " << scores[0] << " and the last is " << scores.back() << endl;
    int total = 0;
    for (int i = 0; i < scores.size(); i++) {
        total += scores[i];
    }
    cout << "The average is " << total / scores.size() << endl;
    return 0;
}`, predict: true, caption: 'It prints <code>There are 5 scores.</code>, then <code>The first is 70 and the last is 78</code>, then <code>The average is 77</code> (the total is 385, and 385 / 5 is exactly 77). push_back adds to the end and the vector makes room. Some compilers warn about comparing i with scores.size(), a signed with an unsigned number: that is the point from the last lesson.' },
        `<div class="tbl-wrap"><table>
<tr><th>write</th><th>meaning</th></tr>
<tr><td><code>vector&lt;int&gt; v;</code></td><td>an empty vector of ints</td></tr>
<tr><td><code>vector&lt;int&gt; v(5, 0);</code></td><td>five ints, all 0</td></tr>
<tr><td><code>vector&lt;int&gt; v = {4, 8, 15};</code></td><td>a vector starting with these values</td></tr>
<tr><td><code>v.push_back(x)</code>, <code>v.pop_back()</code></td><td>add to the end; remove the last one</td></tr>
<tr><td><code>v.size()</code>, <code>v.empty()</code></td><td>how many; are there none</td></tr>
<tr><td><code>v[i]</code>, <code>v.at(i)</code></td><td>the item at position <code>i</code> from 0; <code>at</code> checks the position</td></tr>
<tr><td><code>v.front()</code>, <code>v.back()</code></td><td>the first item; the last item (the vector must not be empty)</td></tr>
<tr><td><code>v.clear()</code></td><td>remove everything</td></tr>
</table></div>
<h2>Visiting every item</h2>
<p>The <code>for</code> loop with an index works, but most of the time you want "every item" and do not care about its position. The <em>range-based for</em> says exactly that:</p>`,
        { play: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    vector<string> languages = {"Python", "Scheme", "C++"};
    languages.push_back("Rust");
    for (string name : languages) {
        cout << name << " has " << name.size() << " letters" << endl;
    }
    for (auto name : languages) {      // auto: let the compiler work out the type
        cout << name << " ";
    }
    cout << endl;
    return 0;
}`, predict: true, caption: 'It prints one line for each language (<code>Python has 6 letters</code>, <code>Scheme has 6 letters</code>, <code>C++ has 3 letters</code>, <code>Rust has 4 letters</code>), then the four names on a single line. Read "for (string name : languages)" as "for each name in languages". The word auto asks the compiler to fill in the type it can already see: the variable is still a <code>string</code>, fixed when the program is compiled, not a variable that can change type as in Python.' },
        { check: "What is the last valid index of a vector with <code>v.size()</code> items?", skill: 'vector-index', options: ["<code>v.size()</code>", "<code>v.size() - 1</code>", "<code>v.size() + 1</code>"], answer: 1, wrong: ["That is the first index that is <em>not</em> valid: one past the end. Counting starts at 0, so 5 items sit at positions 0 to 4.", null, "That is even further past the end. Nothing lives at <code>size() + 1</code>, and the compiler will not warn you."], why: "Indexes start at 0, so the last one is size() − 1. v[v.size()] is one past the end." },
        `<h2>Reading until the end</h2>
<p>Reading numbers until there are no more is the other everyday job. <code>cin &gt;&gt; x</code> is itself a yes-or-no question: it is true if it managed to read a value, and false when the input has run out or holds something that is not a number, so it can be the condition of a <code>while</code>.</p>`,
        { play: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> numbers;
    int x;
    while (cin >> x) {
        numbers.push_back(x);
    }
    int biggest = numbers[0];
    for (int n : numbers) {
        if (n > biggest) biggest = n;
    }
    cout << numbers.size() << " numbers, biggest " << biggest << endl;
    return 0;
}`, stdin: '12 7 31 5 19', predict: true, caption: 'It prints <code>5 numbers, biggest 31</code>. The program does not need to be told how many numbers there are: it keeps reading until the input ends. What happens if there are none? Then <code>numbers[0]</code> asks for an item of an empty vector, which is undefined behaviour: the next section explains why that is dangerous.' },
        { check: "What does <code>while (cin &gt;&gt; x)</code> do?", skill: 'read-until-end', options: ["Reads one value", "Reads values until the input ends or a value cannot be read", "Loops forever"], answer: 1, wrong: ["A <code>while</code> repeats. The condition <code>cin &gt;&gt; x</code> is asked again each time round, and each time it reads a fresh value, so it reads many.", null, "It stops: once the input runs out (or holds something that is not a number), <code>cin &gt;&gt; x</code> is false and the loop ends. It would run for ever only if the input never ended."], why: "cin >> x is true while a value could be read. The loop runs until the input runs out." },
        `<h2>Going out of range</h2>
<p>An array in SC 103 had a fixed size and the interpreter told you when an index was too big. A real compiler does not check <code>v[i]</code>: if <code>i</code> is out of range the program carries on, reading or overwriting whatever memory happens to be there. That is called <em>undefined behaviour</em>: the language promises nothing about what happens, and a program that does it may seem fine on Tuesday and crash on Wednesday. The Morris worm got in through exactly this kind of mistake.</p>
<p>The checked version is <code>v.at(i)</code>. Run the program below.</p>`,
        { play: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> v = {10, 20, 30};
    cout << "v.at(2) is " << v.at(2) << endl;
    cout << "now trying v.at(3)..." << endl;
    cout << v.at(3) << endl;
    cout << "this line is never reached" << endl;
    return 0;
}`, expectError: true, caption: 'The program stops at the bad access and says why. On a normal computer, at() throws an exception that the program may catch; this site’s compiler has exceptions switched off, so the program simply ends.' },
        { check: "What is the difference between <code>v[i]</code> and <code>v.at(i)</code>?", skill: 'checked-access', options: ["None", "v[i] is unchecked (undefined behaviour out of range); at(i) checks and stops with an error", "at(i) is faster"], answer: 1, wrong: ["For a valid index they give the same item. Out of range is where they part: <code>v[i]</code> carries on into memory that is not the vector's, and <code>at(i)</code> stops the program.", null, "The check costs a little time, so <code>at</code> is if anything slower. You pay that for safety."], why: "v[i] trusts you. at(i) checks the index and throws (here: ends the program) when it is out of range." },
        { aside: `<p><b>Common mistakes in this lesson.</b> Taking <code>back()</code> or <code>numbers[0]</code> of an empty vector. Using <code>v[i]</code> where <code>i == v.size()</code>: the last valid position is <code>size() - 1</code>. Changing a vector while a range-based for loop is going through it (adding or removing items): the loop can end up looking at memory that has moved. Forgetting <code>#include &lt;vector&gt;</code>.</p>` },
        {
          ex: {
            id: 'mc-2-3', kind: 'parsons', skill: 'range-for', title: 'Put it in order: sum the positives',
            prompt: `<p>Build the function <code>sumPositive</code>. It adds up the numbers of a vector that are greater than 0 and ignores the rest: for <code>{3, -1, 4, -1, 5}</code> it returns <code>12</code>. Put the lines in order; the braces show how deep each line goes. Not every block belongs.</p>`,
            prelude: '#include <iostream>\n#include <vector>\nusing namespace std;\n',
            lines: ['int sumPositive(const vector<int>& v) {', '    int total = 0;', '    for (int x : v) {', '        if (x > 0) {', '            total += x;', '        }', '    }', '    return total;', '}'],
            distractors: ['int total;', 'total = x;'],
            tests: [
              { name: 'sumPositive({3, -1, 4, -1, 5})', main: '        cout << sumPositive({3, -1, 4, -1, 5}) << endl;', expect: '12' },
              { name: 'sumPositive({})', main: '        cout << sumPositive({}) << endl;', expect: '0' },
              { name: 'sumPositive({-2, -3})', main: '        cout << sumPositive({-2, -3}) << endl;', expect: '0' },
              { name: 'sumPositive({7})', main: '        cout << sumPositive({7}) << endl;', expect: '7' }
            ],
            hints: ['The total is made once, before the loop, and starts at 0. A variable with no value, int total;, holds whatever was in memory.', 'The if goes inside the loop, so that it looks at one number at a time, and the adding goes inside the if. total = x would forget the earlier numbers: total += x keeps them.'],
            followup: 'Change the function so that it returns the sum of the numbers that are greater than a limit given as a second parameter. Which line changes?'
          }
        },
        {
          ex: {
            id: 'mc-2-1', skill: ['vector-grow', 'vector-index'], title: 'Backwards',
            prompt: `<p>The first line of input is a whole number <code>n</code>. The next <code>n</code> numbers follow, separated by spaces or line breaks. Read them into a vector and print them in reverse order, on one line, separated by single spaces. For the input <code>4</code> then <code>10 20 30 40</code> print <code>40 30 20 10</code>.</p>`,
            starter: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> v;\n    // read n numbers into v, then print them in reverse\n    return 0;\n}`,
            solution: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> v;\n    for (int i = 0; i < n; i++) {\n        int x;\n        cin >> x;\n        v.push_back(x);\n    }\n    for (int i = (int)v.size() - 1; i >= 0; i--) {\n        cout << v[i];\n        if (i > 0) cout << " ";\n    }\n    cout << endl;\n    return 0;\n}`,
            sampleStdin: '4\n10 20 30 40',
            hints: ['A for loop that runs n times, reading one int into x and calling v.push_back(x), fills the vector.', 'To go backwards, start at the last position and count down: for (int i = (int)v.size() - 1; i >= 0; i--).', 'Print a space after every number except the last, or simply print one after each: spaces at the end of a line do not matter to the checker.'],
            tests: [{ stdin: '4\n10 20 30 40', expect: '40 30 20 10' }, { stdin: '1\n7', expect: '7' }, { stdin: '5\n5 4 3 2 1', expect: '1 2 3 4 5' }, { stdin: '3\n-1 0 1', expect: '1 0 -1' }],
            failTip: 'Check a one-number input, and that nothing is printed for the numbers before reversing.',
            followup: 'Stretch: after the reversed line, print the largest number and the position it had in the input (counting from 0).'
          }
        },
        {
          ex: {
            id: 'mc-2-2', skill: ['vector-grow', 'range-for'], title: 'Keep the evens',
            prompt: `<p>Write a function</p><pre class="code">vector&lt;int&gt; keepEvens(vector&lt;int&gt; v)</pre><p>that returns a new vector holding only the even numbers of <code>v</code>, in their original order. For <code>{1, 2, 3, 4, 5, 6}</code> it returns <code>{2, 4, 6}</code>. If there are none, it returns an empty vector. Write only the function; the checker supplies <code>main</code>.</p>`,
            prelude: '#include <iostream>\n#include <vector>\nusing namespace std;\n',
            starter: `vector<int> keepEvens(vector<int> v) {\n    vector<int> result;\n    // go through v and add the even ones to result\n    return result;\n}`,
            solution: `vector<int> keepEvens(vector<int> v) {\n    vector<int> result;\n    for (int x : v) {\n        if (x % 2 == 0) result.push_back(x);\n    }\n    return result;\n}`,
            hints: ['Start with an empty vector, result, and go through v with a range-based for.', 'A number x is even when x % 2 == 0. For each even one, call result.push_back(x).', 'Return result at the end. If nothing was even it is simply empty.'],
            tests: [
              { name: 'keepEvens({1, 2, 3, 4, 5, 6})', main: '        vector<int> r = keepEvens({1, 2, 3, 4, 5, 6});\n        for (int x : r) cout << x << " ";\n        cout << endl;', expect: '2 4 6' },
              { name: 'keepEvens({7, 9, 11})', main: '        vector<int> r = keepEvens({7, 9, 11});\n        cout << r.size() << endl;', expect: '0' },
              { name: 'keepEvens({})', main: '        vector<int> r = keepEvens({});\n        cout << r.size() << endl;', expect: '0' },
              { name: 'keepEvens({-2, -3, 0, 8})', main: '        vector<int> r = keepEvens({-2, -3, 0, 8});\n        for (int x : r) cout << x << " ";\n        cout << endl;', expect: '-2 0 8' },
              { name: 'keepEvens({4})', main: '        vector<int> r = keepEvens({4});\n        cout << r.size() << " " << r[0] << endl;', expect: '1 4' }
            ],
            failTip: 'Check that the order is kept, that zero and negative even numbers count, and that an empty input gives an empty result.',
            followup: 'Stretch: write keepOdds as well. The two functions differ in one condition. Lesson 7 shows how to pass that condition in as a lambda.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><p>The opening question: a vector grows by itself when you <code>push_back</code>, but an index that is out of range is not stopped: <code>v[i]</code> is undefined behaviour, and only <code>v.at(i)</code> checks.</p><ul>
<li><code>vector&lt;T&gt;</code> (from <code>&lt;vector&gt;</code>) is a list of <code>T</code>s that remembers its size and grows with <code>push_back</code>.</li>
<li><code>for (auto item : v)</code> visits every item; use an index loop only when you need the position.</li>
<li><code>cin &gt;&gt; x</code> is true while it can still read a value, so <code>while (cin &gt;&gt; x)</code> reads until the input ends.</li>
<li><code>v[i]</code> is not checked: an index out of range is undefined behaviour. <code>v.at(i)</code> is checked and stops the program with an error.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3A-AP-17', '3A-CS-01'], standard: 1,
      title: 'Another name for a variable', summary: 'References: how a function can change its caller’s variable, and how to pass a big object without copying it.',
      blocks: [
        `<p>Here is a function that tries to swap two numbers. It looks right. What do you think the program prints?</p>`,
        { play: `#include <iostream>
using namespace std;

void swapInts(int a, int b) {
    int temp = a;
    a = b;
    b = temp;
}

int main() {
    int x = 3, y = 8;
    swapInts(x, y);
    cout << "x = " << x << ", y = " << y << endl;
    return 0;
}`, predict: true, caption: 'It prints <code>x = 3, y = 8</code>: nothing was swapped. Why? The next paragraph explains, and the rest of the lesson fixes it.' },
        `<p>You met this problem in SC 103. When a function is called, each argument is <em>copied</em> into the function's parameter. <code>swapInts</code> swapped its two private copies and then threw them away; <code>x</code> and <code>y</code> were never touched. The solution there was to pass pointers. C++ has a second, simpler way: the <em>reference</em>.</p>
<h2>A reference is another name</h2>
<div class="stmt"><p><span class="kind">Rule (reference).</span> Putting <code>&amp;</code> after a type makes a <em>reference</em>: <code>int&amp; r = x;</code> makes <code>r</code> another name for the very same variable <code>x</code>. There is only one <code>int</code>; it has two names. Whatever you do through <code>r</code> happens to <code>x</code>.</p></div>`,
        { play: `#include <iostream>
using namespace std;

int main() {
    int x = 5;
    int& r = x;          // r is another name for x
    r = 99;
    cout << "x is now " << x << endl;
    x = 7;
    cout << "r is now " << r << endl;
    cout << "same address? " << (&x == &r ? "yes" : "no") << endl;
    return 0;
}`, predict: true, caption: 'It prints <code>x is now 99</code>, <code>r is now 7</code> and <code>same address? yes</code>. One variable, two names: a change through either name is a change to both. The last line asks whether the two names are at the same address in memory, and they are.' },
        { check: "<code>int x = 3; int&amp; r = x; r = 10;</code>. What is x?", skill: 'reference-alias', options: ["3", "10: r is another name for x", "An error"], answer: 1, wrong: ["That would be right if <code>r</code> were a copy, as in <code>int r = x;</code>. With the <code>&amp;</code> there is only one <code>int</code> with two names, so writing through <code>r</code> changes <code>x</code>.", null, "There is nothing wrong with the code: a reference to a variable that exists is the normal case, and it is what the <code>&amp;</code> is for."], why: "A reference is not a copy. There is one int with two names, so writing through r changes x." },
        `<p>A reference is simpler than a pointer: it is always bound to something, from the moment it is made, and never needs <code>*</code> to get at the value. It cannot be changed to refer to something else later, and it cannot be "null". In return it can do less. (Pointers are still needed when "no object" is a possible answer, or when something must be re-pointed.)</p>
<h2>References as parameters</h2>
<p>Put the <code>&amp;</code> on a parameter and the function works on the caller's own variable instead of a copy. That is the whole fix for <code>swapInts</code>:</p>`,
        { play: `#include <iostream>
using namespace std;

void swapInts(int& a, int& b) {
    int temp = a;
    a = b;
    b = temp;
}

int main() {
    int x = 3, y = 8;
    swapInts(x, y);
    cout << "x = " << x << ", y = " << y << endl;
    return 0;
}`, caption: 'It prints <code>x = 8, y = 3</code>. One character added to each parameter, and the swap now reaches the caller. The call itself, swapInts(x, y), looks exactly the same.' },
        `<p>There is a second reason to use references, and it matters even when the function changes nothing. Copying a <code>vector</code> or a <code>string</code> copies every element, which is slow if there are a million of them. A reference passes the object without copying it.</p>
<div class="stmt"><p><span class="kind">Rule (which way to pass).</span>
<br><b>Small value, function only reads it</b> (<code>int</code>, <code>double</code>, <code>char</code>, <code>bool</code>): pass by value, <code>int n</code>.
<br><b>Big object, function only reads it</b> (<code>string</code>, <code>vector</code>): pass by <em>const reference</em>, <code>const vector&lt;int&gt;&amp; v</code>. No copy, and the compiler refuses any attempt to change it.
<br><b>Function must change the caller's variable</b>: pass by reference, <code>vector&lt;int&gt;&amp; v</code>.</p></div>`,
        { check: "A function only reads a big vector. How should it take it?", skill: 'pass-mode', options: ["By value: <code>vector&lt;int&gt; v</code>", "By const reference: <code>const vector&lt;int&gt;&amp; v</code>", "By pointer"], answer: 1, wrong: ["Passing by value copies every element each time the function is called, and the copy is thrown away. Value is for small things such as <code>int</code> and <code>double</code>.", null, "A pointer would work, but it needs <code>&amp;</code> and <code>*</code> everywhere and can be null. A const reference does the same job more simply, and it is what C++ programmers write."], why: "No copy is made, and the compiler refuses any change. Pass by value copies the whole vector; plain & allows changes." },
        { play: `#include <iostream>
#include <vector>
using namespace std;

int sum(const vector<int>& v) {          // reads only: no copy
    int total = 0;
    for (int x : v) total += x;
    return total;
}

void addTen(vector<int>& v) {            // changes the caller's vector
    for (int& x : v) x += 10;            // int& so each x is the item itself, not a copy
}

int main() {
    vector<int> data = {1, 2, 3};
    cout << "sum before: " << sum(data) << endl;
    addTen(data);
    cout << "sum after:  " << sum(data) << endl;
    return 0;
}`, predict: true, caption: 'It prints <code>sum before: 6</code> and <code>sum after:  36</code>: each of the three numbers grew by 10. Look at the loop in addTen. Without the & on x, each x is a copy and the vector would not change (the sum would stay 6). Try removing it.' },
        `<p>That last loop is the same idea once more: <code>for (int&amp; x : v)</code> makes <code>x</code> a name for each item in turn, so assigning to <code>x</code> assigns to the item. Use <code>for (const auto&amp; x : v)</code> to look at big items (such as strings) without copying them.</p>
<h2>A reference to something that has gone</h2>
<p>A reference must always name something that still exists. The compiler catches the plainest mistakes. Try this program, which hands back a reference to a variable that dies when the function ends:</p>`,
        { play: `#include <iostream>
using namespace std;

int& brokenCounter() {
    int count = 0;
    count++;
    return count;      // count is destroyed when the function ends
}

int main() {
    int& c = brokenCounter();
    cout << "c is " << c << endl;
    return 0;
}`, expectError: true, caption: 'Read what the compiler says: it warns about this, but a warning does not stop the program. It runs and uses memory that no longer belongs to it, which is undefined behaviour, so it may print the right-looking answer today and something else tomorrow.' },
        { check: "A function returns a reference to one of its local variables. What is wrong?", skill: 'dangling-reference', options: ["Nothing, if the caller uses it quickly", "The local no longer exists when the function ends: undefined behaviour", "It does not compile"], answer: 1, wrong: ["Quick or slow, the local variable is gone the moment the function ends. Whether the stale memory still looks right is luck, and that is what undefined behaviour means.", null, "It does compile: the compiler only warns, as you saw. That is what makes it dangerous, because nothing stops the program running."], why: "The compiler warns but does not stop you. The reference names memory that has been given back." },
        { aside: `<p><b>Common mistakes in this lesson.</b> Forgetting the <code>&amp;</code> and wondering why the caller's variable did not change. Writing <code>&amp;</code> but then passing a plain number such as <code>swapInts(3, 4)</code>: a reference needs a variable to name. Returning a reference to a local variable. Passing a huge <code>vector</code> by value in a function that is called in a loop.</p>` },
        {
          ex: {
            id: 'mc-3-3', kind: 'trace', skill: 'pass-mode', title: 'Trace the two kinds of parameter',
            prompt: `<p>The function <code>bump</code> has one parameter by value and one by reference. Fill in the table: each row is the moment after one of the lines 8 to 11 has run, with the values of <code>x</code> and <code>y</code> then. The first row is done for you. Work out which of the two names each call changes.</p>`,
            code: `#include <iostream>\nusing namespace std;\nvoid bump(int a, int& b) {\n    a = a + 1;\n    b = b + 1;\n}\nint main() {\n    int x = 5, y = 5;\n    bump(x, y);\n    bump(y, x);\n    bump(x, x);\n    cout << x << " " << y << endl;\n}`,
            vars: ['x', 'y'],
            steps: [
              { line: 8, values: { x: '5', y: '5' }, show: true },
              { line: 9, values: { x: '5', y: '6' }, why: { x: { '6': 'In bump(x, y) the first parameter, a, is a copy of x. Adding 1 to the copy does not change x.' }, y: { '5': 'The second parameter, b, is a reference: it is another name for y, so y goes up by 1.' } } },
              { line: 10, values: { x: '6', y: '6' }, why: { x: { '5': 'This time x is the second argument, so b is another name for x, and x goes up by 1.' }, y: { '7': 'Now y is the first argument, passed by value. Only the copy goes up.' } } },
              { line: 11, values: { x: '7', y: '6' }, why: { x: { '8': 'bump(x, x) gives the function a copy and a reference. Only the reference changes x, so x goes up by 1 and not by 2.' } } }
            ],
            hints: ['Look at each call: the first argument goes into a (a copy), the second into b (a reference). Only the variable that goes in as the second argument changes.', 'x is 5 and y is 5. bump(x, y) changes y only, to 6. bump(y, x) changes x only, to 6. bump(x, x) changes x only once more.'],
            solution: '<p>x: 5, 5, 6, 7. y: 5, 6, 6, 6. The program prints <code>7 6</code>. Each call raises only the variable that is its <em>second</em> argument, because only <code>b</code> is a reference.</p>',
            followup: 'Change the parameter list to bump(int& a, int b) and trace it again, row by row. It prints the same two numbers, 7 and 6: is each row the same too?'
          }
        },
        {
          ex: {
            id: 'mc-3-1', skill: 'reference-alias', title: 'A swap that works',
            prompt: `<p>Write a function <code>void swapInts(int&amp; a, int&amp; b)</code> that swaps the values of the two variables it is given. After <code>int x = 3, y = 8; swapInts(x, y);</code>, <code>x</code> is 8 and <code>y</code> is 3. Write only the function; the checker supplies <code>main</code>.</p>`,
            prelude: '#include <iostream>\nusing namespace std;\n',
            starter: `void swapInts(int a, int b) {\n    int temp = a;\n    a = b;\n    b = temp;\n}`,
            solution: `void swapInts(int& a, int& b) {\n    int temp = a;\n    a = b;\n    b = temp;\n}`,
            hints: ['The starter swaps correctly, but on copies. What one character, added in two places, makes a and b names for the caller’s variables?', 'Put & after int in both parameters: int& a, int& b.'],
            tests: [
              { name: 'swapInts(x, y) with x = 3, y = 8', main: '        int x = 3, y = 8;\n        swapInts(x, y);\n        cout << x << " " << y << endl;', expect: '8 3' },
              { name: 'swapInts(x, y) with x = -1, y = 1', main: '        int x = -1, y = 1;\n        swapInts(x, y);\n        cout << x << " " << y << endl;', expect: '1 -1' },
              { name: 'swapInts(x, x): the same variable twice', main: '        int x = 5;\n        swapInts(x, x);\n        cout << x << endl;', expect: '5' },
              { name: 'swapInts on two items of an array', main: '        int v[3] = {10, 20, 30};\n        swapInts(v[0], v[2]);\n        cout << v[0] << " " << v[1] << " " << v[2] << endl;', expect: '30 20 10' }
            ],
            failTip: 'If the numbers come out unchanged, the function is still working on copies.',
            followup: 'Stretch: write void rotate3(int& a, int& b, int& c) that moves the value of a into b, b into c and c into a.'
          }
        },
        {
          ex: {
            id: 'mc-3-2', skill: ['pass-mode', 'range-for'], title: 'Double them in place',
            prompt: `<p>Write a function <code>void doubleAll(vector&lt;int&gt;&amp; v)</code> that doubles every number in the caller's vector, in place: after the call, <code>{1, 2, 3}</code> holds <code>{2, 4, 6}</code>. The function returns nothing; it changes the vector it is given. Write only the function; the checker supplies <code>main</code>.</p>`,
            prelude: '#include <iostream>\n#include <vector>\nusing namespace std;\n',
            starter: `void doubleAll(vector<int>& v) {\n    for (int x : v) {\n        x = x * 2;\n    }\n}`,
            solution: `void doubleAll(vector<int>& v) {\n    for (int& x : v) {\n        x = x * 2;\n    }\n}`,
            mustContain: [{ re: /int\s*&\s*\w+\s*:\s*v|auto\s*&\s*\w+\s*:\s*v|v\s*\[/, msg: 'To change the items themselves, the loop variable must be a reference (for (int& x : v)), or you must assign to v[i].' }],
            hints: ['The starter looks right and changes nothing. In for (int x : v) each x is a copy of an item.', 'Make x a reference: for (int& x : v). Now x is another name for each item in turn, so x = x * 2 changes the vector.', 'An index loop also works: v[i] = v[i] * 2.'],
            tests: [
              { name: 'doubleAll({1, 2, 3})', main: '        vector<int> v = {1, 2, 3};\n        doubleAll(v);\n        for (int x : v) cout << x << " ";\n        cout << endl;', expect: '2 4 6' },
              { name: 'doubleAll({})', main: '        vector<int> v;\n        doubleAll(v);\n        cout << v.size() << endl;', expect: '0' },
              { name: 'doubleAll({-5, 0, 7})', main: '        vector<int> v = {-5, 0, 7};\n        doubleAll(v);\n        for (int x : v) cout << x << " ";\n        cout << endl;', expect: '-10 0 14' }
            ],
            failTip: 'If the numbers are unchanged, the loop is changing copies of the items.',
            followup: 'Stretch: write int biggest(const vector<int>& v) that returns the largest number without copying the vector, and say why const& is the right way to take it.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><p>The opening question: the first <code>swapInts</code> swapped its own copies, which were thrown away. With <code>int&amp;</code> parameters the function works on the caller's variables, so the swap shows.</p><ul>
<li>Arguments are copied into parameters. A function that changes its own copy changes nothing for the caller.</li>
<li><code>int&amp; r = x;</code> makes <code>r</code> another name for <code>x</code>. A reference is always bound, cannot be re-bound and is never null.</li>
<li>Pass small values by value, big objects you only read by <code>const&amp;</code>, and anything the function must change by <code>&amp;</code>.</li>
<li><code>for (int&amp; x : v)</code> lets a loop change the items; <code>for (const auto&amp; x : v)</code> avoids copying big ones.</li>
<li>Never return a reference to a local variable: it no longer exists when the function ends.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3A-AP-17', '3A-AP-18', '3B-AP-14'], standard: 1,
      title: 'Your own types', summary: 'struct: bundling several values into one type, and keeping collections of them.',
      blocks: [
        `<p>In September 1999 NASA lost the Mars Climate Orbiter, a spacecraft that had cost about 125 million dollars, as it arrived at Mars. It passed far too close to the planet and was destroyed. The investigation found that two teams had written software that exchanged numbers describing how hard the spacecraft’s thruster firings had pushed it. One team's program produced the number in pound-force seconds; the other's expected newton-seconds. Both sides handled a plain number, and nothing in their code knew that the two meant different units.</p>`,
        { photo: 'mars-climate-orbiter', caption: 'The Mars Climate Orbiter in 1998, during tests that imitate the noise of a launch. A year later it was lost at Mars, because two programs disagreed about what one number meant.' },
        `<p>That story is about <em>types that carry meaning</em>. A <code>double</code> says almost nothing; a type called <code>Thrust</code> or <code>Distance</code> says what the number is for. This lesson starts down that road with the simplest tool C++ gives you for making a type of your own: the <code>struct</code>. So how can a program give a few numbers that belong together a name, and a meaning, of their own?</p>
<h2>Several values, one name</h2>
<p>Suppose a program keeps a class list. Each student has a name, a year and a score. With what you know so far you would keep three vectors side by side, and every change (adding a student, removing one, sorting) would have to be made three times, in step. A <code>struct</code> bundles the three into one thing.</p>
<div class="stmt"><p><span class="kind">Rule (struct).</span> <code>struct Name { type member; type member; ... };</code> defines a new type. Note the semicolon after the closing brace. A variable of that type holds one value for each <em>member</em>, and <code>variable.member</code> reaches one of them.</p></div>`,
        { play: `#include <iostream>
#include <string>
#include <cmath>
using namespace std;

struct Point {
    double x;
    double y;
};

int main() {
    Point a = {0, 0};
    Point b = {3, 4};
    cout << "a is (" << a.x << ", " << a.y << ")" << endl;
    double dx = b.x - a.x;
    double dy = b.y - a.y;
    cout << "distance " << sqrt(dx * dx + dy * dy) << endl;
    Point c = b;          // copies both members
    c.x = 10;
    cout << "b.x is still " << b.x << ", c.x is " << c.x << endl;
    return 0;
}`, predict: true, caption: 'It prints <code>a is (0, 0)</code>, <code>distance 5</code> (a 3-4-5 triangle) and <code>b.x is still 3, c.x is 10</code>. A Point is two doubles with names. Assigning one struct to another copies every member, so c is a separate point from b.' },
        { check: "What is missing from <code>struct Point { double x; double y; }</code>?", skill: 'struct-define', options: ["Nothing", "The semicolon after the closing brace", "A return type"], answer: 1, wrong: ["Something is missing: unlike a function body, a struct definition ends with a semicolon after the closing brace. The compiler usually complains about the line after it, which is confusing.", null, "A struct is a type, not a function, so it has no return type. Only functions return things."], why: "A struct definition ends with a semicolon. Without it the error appears on the next line." },
        `<h2>Structs in vectors, and in functions</h2>
<p>A struct is a type like any other, so you can make a <code>vector</code> of them, pass them to functions and return them. The rules of the last lesson apply: a struct you only read goes in as a <code>const&amp;</code>, so that it is not copied.</p>`,
        { play: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

struct Student { string name; int year; double score; };

void print(const Student& s) { cout << s.name << " (year " << s.year << "): " << s.score << endl; }

int main() {
    vector<Student> roster;
    roster.push_back({"Ada", 11, 93.5});
    roster.push_back({"Grace", 12, 88});
    roster.push_back({"Alan", 10, 71.25});

    double total = 0;
    for (const Student& s : roster) {
        print(s);
        total += s.score;
    }
    cout << "average " << total / roster.size() << endl;
    return 0;
}`, predict: true, caption: 'It prints one line for each student (<code>Ada (year 11): 93.5</code>, <code>Grace (year 12): 88</code>, <code>Alan (year 10): 71.25</code>), then <code>average 84.25</code>. push_back({...}) builds a Student from its members in order. const Student& in the loop reads each one without copying it.' },
        { check: "How do you reach the <code>name</code> member of a variable <code>s</code> of type Student?", skill: 'struct-member', options: ["<code>Student.name</code>", "<code>s.name</code>", "<code>s-&gt;name</code>"], answer: 1, wrong: ["<code>Student</code> is the type: a recipe for what any student holds, with no name of its own. You reach a member through a variable, a particular student.", null, "<code>-&gt;</code> is for a <em>pointer</em> to a struct. Here <code>s</code> is the struct itself, so you use a dot."], why: "variable.member. Student.name names the type, not a value." },
        `<p>A function can also hand back a struct, which is the tidy way to return two values at once.</p>`,
        { play: `#include <iostream>
using namespace std;

struct Point {
    double x, y;
};

Point midpoint(Point a, Point b) {
    return {(a.x + b.x) / 2, (a.y + b.y) / 2};
}

int main() {
    Point m = midpoint({0, 0}, {4, 6});
    cout << "(" << m.x << ", " << m.y << ")" << endl;
    return 0;
}`, caption: 'Members of the same type can share a line (double x, y;). The braces after return build the Point to hand back.' },
        { check: "Two Points hold the same x and y. What does <code>a == b</code> do?", skill: 'struct-copy', options: ["Gives true", "Does not compile until you define == for Point", "Compares their addresses"], answer: 1, wrong: ["Assignment (<code>b = a</code>) copies every member, which tempts you to think <code>==</code> compares every member. It does not: a struct has no <code>==</code> until you write one.", null, "That was the trap with <code>char</code> arrays in SC 103. A struct has no <code>==</code> at all, so there is nothing to compare addresses."], why: "A struct has no == until you write one. Assignment copies members; comparison must be taught." },
        `<h2>Giving members a starting value</h2>
<p>A member can have a default written beside it. A struct made with no values then starts in a known state instead of holding garbage:</p><pre class="code"><code>struct Settings {
    int volume = 5;
    bool muted = false;
};
Settings s;          // volume 5, muted false</code></pre>
<p>Without defaults, a struct made as <code>Point p;</code> has members that were never set, just like an <code>int</code> that was never given a value: reading them is a bug, and the compiler's warnings may tell you so.</p>
<p>What a struct cannot do is protect itself. Anyone can write <code>s.score = -500;</code>. Lesson 6 adds rules to a type.</p>`,
        { aside: `<p><b>Common mistakes in this lesson.</b> Forgetting the semicolon after the closing brace of a struct: the error appears at the next line. Writing <code>Student.name</code> (the type) instead of <code>s.name</code> (a variable). Expecting <code>s1 == s2</code> to compare two structs: it does not compile until you teach it how. Passing a big struct by value in a loop.</p>` },
        {
          ex: {
            id: 'mc-4-1', skill: 'struct-member', title: 'Best score',
            prompt: `<p>The first line of input is a number <code>n</code>. Each of the next <code>n</code> lines holds a student's name (one word) and an integer score. Print the name and score of the student with the highest score, as <code>name score</code>. If two students tie, print the one who came first. For</p><pre class="code">3\nada 90\nbo 85\ncy 95</pre><p>print <code>cy 95</code>. Keep each student in a <code>struct</code>.</p>`,
            starter: `#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\nstruct Student {\n    string name;\n    int score;\n};\n\nint main() {\n    int n;\n    cin >> n;\n    vector<Student> students;\n    // read the n students, then find and print the best one\n    return 0;\n}`,
            solution: `#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\nstruct Student {\n    string name;\n    int score;\n};\n\nint main() {\n    int n;\n    cin >> n;\n    vector<Student> students;\n    for (int i = 0; i < n; i++) {\n        Student s;\n        cin >> s.name >> s.score;\n        students.push_back(s);\n    }\n    Student best = students[0];\n    for (const Student& s : students) {\n        if (s.score > best.score) best = s;\n    }\n    cout << best.name << " " << best.score << endl;\n    return 0;\n}`,
            sampleStdin: '3\nada 90\nbo 85\ncy 95',
            hints: ['Make a Student s, read into its members with cin >> s.name >> s.score, and push_back(s). Repeat n times.', 'Start with best = the first student, then go through all of them; replace best when a student’s score is greater.', 'Use > rather than >= so that on a tie the earlier student stays.'],
            tests: [{ stdin: '3\nada 90\nbo 85\ncy 95', expect: 'cy 95' }, { stdin: '2\nx 5\ny 5', expect: 'x 5' }, { stdin: '1\nz 0', expect: 'z 0' }, { stdin: '4\na -3\nb -1\nc -2\nd -9', expect: 'b -1' }],
            failTip: 'Check a tie (the first one wins), a single student, and negative scores.',
            followup: 'Stretch: after the best student, print the average score of the whole class (with a decimal point), and how many students scored above it.'
          }
        },
        {
          ex: {
            id: 'mc-4-2', skill: 'struct-define', title: 'Midpoint',
            prompt: `<p>This struct is already defined for you:</p><pre class="code">struct Point {\n    double x;\n    double y;\n};</pre><p>Write a function <code>Point midpoint(Point a, Point b)</code> that returns the point halfway between <code>a</code> and <code>b</code>. For <code>(0, 0)</code> and <code>(4, 6)</code> it returns <code>(2, 3)</code>. Write only the function; the checker supplies the struct and <code>main</code>.</p>`,
            prelude: '#include <iostream>\nusing namespace std;\nstruct Point {\n    double x;\n    double y;\n};\n',
            starter: `Point midpoint(Point a, Point b) {\n    return a;\n}`,
            solution: `Point midpoint(Point a, Point b) {\n    Point m;\n    m.x = (a.x + b.x) / 2;\n    m.y = (a.y + b.y) / 2;\n    return m;\n}`,
            hints: ['The x of the midpoint is the average of the two x values; the same for y.', 'Make a Point m, set m.x and m.y, and return m. Or return {(a.x + b.x) / 2, (a.y + b.y) / 2};'],
            tests: [
              { name: 'midpoint((0, 0), (4, 6))', main: '        Point m = midpoint({0, 0}, {4, 6});\n        cout << m.x << " " << m.y << endl;', expect: '2 3' },
              { name: 'midpoint((1, 1), (2, 2))', main: '        Point m = midpoint({1, 1}, {2, 2});\n        cout << m.x << " " << m.y << endl;', expect: '1.5 1.5' },
              { name: 'midpoint((-2, 5), (2, -5))', main: '        Point m = midpoint({-2, 5}, {2, -5});\n        cout << m.x << " " << m.y << endl;', expect: '0 0' },
              { name: 'midpoint of a point with itself', main: '        Point p = {7, -3};\n        Point m = midpoint(p, p);\n        cout << m.x << " " << m.y << endl;', expect: '7 -3' }
            ],
            failTip: 'Remember to divide by 2 (a double, so 1.5 stays 1.5).',
            followup: 'Stretch: write double distance(Point a, Point b) with sqrt from <cmath>, then check that the distance from a to the midpoint is half the distance from a to b.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><p>The opening question: a <code>struct</code> gives values that belong together one name and one type, so a <code>Point</code> or a <code>Student</code> says what it is for.</p><ul>
<li>A <code>struct</code> bundles named members into one type; <code>s.member</code> reaches one. The definition ends with a semicolon.</li>
<li>Assigning a struct copies all of its members; <code>==</code> does not work on one until you define it.</li>
<li>Structs go in vectors, are passed by <code>const&amp;</code> when only read, and can be returned, which gives a function more than one answer.</li>
<li>A member may have a default value; without one it is uninitialised.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3A-AP-14', '3A-AP-17', '3B-AP-12', '3B-AP-16'],
      title: 'Checkpoint one', checkpoint: true, summary: 'No new ideas: mixed questions on strings, vectors, references and structs, then two programs that use all four. Copy or reference? Checked or unchecked? Which construct fits?',
      blocks: [
        `<p>This lesson teaches nothing new. It mixes questions on the last four lessons, because telling apart ideas that look alike, such as a copy and a reference, <code>v[i]</code> and <code>v.at(i)</code>, or <code>==</code> on a string and on a character array, is a skill of its own, and it only grows when the questions are mixed. Answer each one before looking back. If one surprises you, the lesson it came from is linked on the Review page, and the question will come back there in a day.</p>
<p>Ready? Here is the first: when you hand something to a function or put it in a loop variable, do you get the thing itself, or a copy of it?</p>
<h2>Mixed questions</h2>`,
        { check: `<code>string a = "cat"; string b = "cat";</code> What does <code>a == b</code> give?`, skill: 'string-compare', options: ['<code>true</code>: it compares the characters', '<code>false</code>: the two strings are stored in different places', 'It does not compile: strings need <code>strcmp</code>'], answer: 0, wrong: [null, 'That was the trap of the character arrays in SC 103, where <code>==</code> compared addresses. A <code>std::string</code> owns its characters and <code>==</code> compares them.', '<code>strcmp</code> is for character arrays. <code>string</code> has its own <code>==</code> and <code>&lt;</code>, which compare the text.'], why: 'With <code>std::string</code>, <code>==</code> does what it looks like: it is true when the two strings hold the same characters, wherever they are stored.' },
        { check: `<code>vector&lt;int&gt; v;</code> is empty. What does <code>v[0] = 5;</code> do?`, skill: 'vector-grow', options: ['It adds 5 as the first item, like <code>push_back(5)</code>', 'It adds nothing: it writes to a place that is not part of the vector, which is undefined behaviour', 'It stops the program with a clear error message'], answer: 1, wrong: ['<code>[]</code> only reaches items that already exist. Making the vector longer is the job of <code>push_back</code>.', null, 'That is <code>at(i)</code>, which checks. <code>[]</code> does not check anything, so the program carries on, writing where it should not.'], why: 'The vector has no item 0, so <code>v[0]</code> is a bug the compiler cannot see. To add an item use <code>v.push_back(5)</code>; to start with items, build the vector with a size or with <code>{...}</code>.' },
        { check: `<code>vector&lt;int&gt; v = {1, 2, 3};</code> then <code>for (auto x : v) { x = x * 2; }</code>. What is <code>v</code> afterwards?`, skill: 'range-for', options: ['<code>{1, 2, 3}</code>: <code>auto</code> only picks the type, <code>int</code>, and this <code>x</code> is a copy of each item', '<code>{2, 4, 6}</code>: <code>auto</code> makes <code>x</code> refer to the items', 'It cannot be said: <code>auto</code> means the type is decided while the program runs'], answer: 0, wrong: [null, 'A reference needs the <code>&amp;</code>: <code>for (auto&amp; x : v)</code> would double the items. <code>auto</code> leaves out the type, not the <code>&amp;</code>.', 'C++ is not dynamically typed. <code>auto</code> asks the <em>compiler</em> to work the type out, once, from the right-hand side. <code>x</code> is an <code>int</code> for ever.'], why: 'The loop doubled its copies and threw them away, so <code>v</code> is still <code>{1, 2, 3}</code>. With <code>auto&amp; x</code> (or <code>int&amp; x</code>) the loop variable is another name for each item and <code>v</code> becomes <code>{2, 4, 6}</code>.' },
        { check: `<code>void show(const string&amp; s) { s += "!"; }</code> What does the compiler say?`, skill: 'pass-mode', options: ['Nothing: it adds <code>!</code> to the caller\'s string', 'Nothing: it adds <code>!</code> to a copy', 'An error: <code>s</code> is <code>const</code>, so the function may not change it'], answer: 2, wrong: ['That would be <code>string&amp; s</code> without the <code>const</code>. Here the <code>const</code> is a promise not to change the caller\'s string, and the compiler holds the function to it.', 'A copy is what you get with <code>string s</code>, no <code>&amp;</code>. The <code>&amp;</code> means there is no copy, and the <code>const</code> means no changes.', null], why: '<code>const&amp;</code> is for reading a big object without copying it, and the compiler refuses any change to it. To change the caller\'s string, drop the <code>const</code>: <code>string&amp; s</code>.' },
        { check: `<code>Point a = {1, 2}; Point b = a; b.x = 9;</code> What is <code>a.x</code>?`, skill: 'struct-copy', options: ['9: <code>b</code> is another name for <code>a</code>', '1: assigning a struct copies every member, so <code>b</code> is a separate point', 'It does not compile: structs cannot be assigned'], answer: 1, wrong: ['That would be right for <code>Point&amp; b = a;</code>. Without the <code>&amp;</code>, <code>b</code> is a new variable that starts as a copy of <code>a</code>.', null, 'Assigning a struct is fine: it copies all the members. What a struct does not have until you write it is <code>==</code>.'], why: 'Struct assignment copies every member, so changing <code>b</code> leaves <code>a</code> alone: <code>a.x</code> is 1 and <code>b.x</code> is 9. A reference is the way to get two names for one point.' },
        { check: `A program must read the line <code>Ada Lovelace</code>, spaces included, into one string <code>name</code>. Which line does it?`, skill: 'read-lines', options: ['<code>cin &gt;&gt; ws;</code>', '<code>cin &gt;&gt; name;</code>', '<code>getline(cin, name);</code>'], answer: 2, wrong: ['<code>cin &gt;&gt; ws</code> skips white space and reads nothing into <code>name</code>. It is the cure for a leftover newline, not a way to read a line.', '<code>cin &gt;&gt;</code> reads one word: it stops at the first space, so <code>name</code> would be <code>Ada</code> and <code>Lovelace</code> would still be waiting.', null], why: '<code>getline(cin, name)</code> reads up to the end of the line, spaces and all.' },
        { check: `A loop reads <code>v[i]</code> with an <code>i</code> that is one too big. You want that mistake to stop the program with an error instead of carrying on quietly. What do you write instead?`, skill: 'checked-access', options: ['<code>v.at(i)</code>', '<code>v.back()</code>', '<code>v.size() - 1</code>'], answer: 0, wrong: [null, '<code>back()</code> is the last item, whatever <code>i</code> is. It does no checking, and on an empty vector it is undefined behaviour too.', 'That is a number, the last valid position, not a way of reading an item. It does not check <code>i</code> either.'], why: '<code>at(i)</code> checks the position and stops the program when it is out of range. <code>v[i]</code> is faster and unchecked, so a wrong <code>i</code> silently reads or writes the wrong memory.' },
        { check: `<code>int x = 1; int&amp; r = x; int y = r; y = 50;</code> What is <code>x</code>?`, skill: 'reference-alias', options: ['50: <code>r</code> and <code>y</code> both name <code>x</code>', '1: <code>y</code> is a new variable that holds a copy of the value', 'It does not compile'], answer: 1, wrong: ['Only <code>r</code> is a reference. <code>int y = r;</code> has no <code>&amp;</code>, so <code>y</code> is a new variable that starts with the value 1.', null, 'It compiles. Reading through a reference, even into a new variable, is allowed.'], why: '<code>int y = r;</code> copies the value that <code>r</code> names. Only the <code>&amp;</code> makes a second name for the same variable: <code>int&amp; y = r;</code> would have made <code>x</code> 50.' },
        { check: `A program keeps many students, each with a name, a year and a score. Which layout keeps one student's three values together?`, skill: 'struct-define', options: ['A <code>struct Student</code> with three members, and one <code>vector&lt;Student&gt;</code>', 'Three vectors side by side: names, years and scores', 'One <code>vector&lt;string&gt;</code> with the three values joined into a single string'], answer: 0, wrong: [null, 'It works until you add, remove or sort: then all three vectors must be changed in step, and one slip pairs a name with the wrong score. A struct keeps the three values together.', 'You would have to pull the string apart every time you needed the score as a number. A struct gives each value its own name and type.'], why: 'Values that belong together go in a <code>struct</code>; many of them go in a <code>vector</code> of that struct, and one student is one item.' },
        { check: `Which function returns a reference that is safe to use after the call?`, skill: 'dangling-reference', options: ['<code>int&amp; make() { int n = 5; return n; }</code>', '<code>const string&amp; greet() { string s = "hi"; return s; }</code>', '<code>int&amp; first(vector&lt;int&gt;&amp; v) { return v[0]; }</code>'], answer: 2, wrong: ['<code>n</code> is a local variable and is destroyed when the function ends: the reference names something that is gone.', 'Same mistake: <code>s</code> is local, so the reference is left naming a string that no longer exists.', null], why: 'A reference is safe when what it names outlives the call. The item <code>v[0]</code> belongs to the caller\'s vector, so it is still there afterwards. A local variable is not.' },
        `<p>Two programs to finish the unit. The first needs no code: choose the right way to pass. The second puts all four lessons together.</p>`,
        {
          ex: {
            id: 'mc-9-1', kind: 'choice', skill: ['pass-mode', 'reference-alias'], title: 'Make it shout',
            prompt: `<p>A program has <code>string word = "hello";</code>. Each version below has the same body, which changes every letter to a capital: <code>for (char&amp; c : s) c = toupper(c);</code>. Only the parameter differs. After <code>shout(word);</code> the program must print <code>HELLO</code> for <code>word</code>. Which parameter list does that?</p>`,
            options: [
              { text: 'void shout(string s)', why: 'The function capitalises its own copy of the string and then throws it away: <code>word</code> is still <code>hello</code>.' },
              { text: 'void shout(const string& s)', why: 'The <code>&amp;</code> is right, but <code>const</code> forbids changing the string, so the compiler refuses the loop. <code>const&amp;</code> is for reading.' },
              { text: 'void shout(string& s)', ok: true },
              { text: 'void shout(string* s)', why: 'A pointer would need <code>*s</code> in the body and <code>&amp;word</code> in the call. In this course a reference does the same job more simply.' }
            ],
            hints: ['The function must change the caller\'s own string. Which parameters give the function the caller\'s variable rather than a copy?', 'Of those, one promises not to change it. That one is for reading, not for this job.'],
            solution: '<p><code>void shout(string&amp; s)</code>. The reference makes <code>s</code> another name for <code>word</code>, so the capitals reach the caller. By value changes a copy; <code>const&amp;</code> refuses to change anything.</p>',
            followup: 'Write the version that does not change the caller\'s string but returns a new capitalised one instead. Which parameter list is best for it, and why?'
          }
        },
        {
          ex: {
            id: 'mc-9-2', skill: ['struct-member', 'pass-mode', 'string-compare'], title: 'A pet\'s birthday',
            prompt: `<p>This struct is already defined for you:</p><pre class="code">struct Pet {\n    string name;\n    int age;\n};</pre><p>Write a function <code>bool birthday(vector&lt;Pet&gt;&amp; pets, const string&amp; name)</code> that adds 1 to the age of the first pet in <code>pets</code> whose name is exactly <code>name</code>, and returns <code>true</code>. If there is no such pet it changes nothing and returns <code>false</code>. Names are case-sensitive. Write only the function; the checker supplies <code>main</code>.</p><p>The starter finds the right pet and returns <code>true</code>, but it does not pass. Find out why.</p>`,
            prelude: '#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\nstruct Pet {\n    string name;\n    int age;\n};\n',
            starter: `bool birthday(vector<Pet>& pets, const string& name) {\n    for (Pet p : pets) {\n        if (p.name == name) {\n            p.age++;\n            return true;\n        }\n    }\n    return false;\n}`,
            solution: `bool birthday(vector<Pet>& pets, const string& name) {\n    for (Pet& p : pets) {\n        if (p.name == name) {\n            p.age++;\n            return true;\n        }\n    }\n    return false;\n}`,
            hints: ['The starter returns the right answers, but the ages in the caller\'s vector do not change. What is p in for (Pet p : pets)?', 'Make p a reference to each pet, so that p.age++ changes the pet inside the vector: for (Pet& p : pets).', 'An index loop also works: pets[i].age++.'],
            tests: [
              { name: 'birthday(pets, "Tom")', main: '        vector<Pet> pets = {{"Rex", 3}, {"Tom", 5}};\n        bool found = birthday(pets, "Tom");\n        cout << found << " " << pets[0].age << " " << pets[1].age << endl;', expect: '1 3 6' },
              { name: 'no pet with that name', main: '        vector<Pet> pets = {{"Rex", 3}, {"Tom", 5}};\n        bool found = birthday(pets, "Max");\n        cout << found << " " << pets[0].age << " " << pets[1].age << endl;', expect: '0 3 5' },
              { name: 'only the first pet with the name', main: '        vector<Pet> pets = {{"Al", 1}, {"Al", 10}};\n        bool found = birthday(pets, "Al");\n        cout << found << " " << pets[0].age << " " << pets[1].age << endl;', expect: '1 2 10' },
              { name: 'names are case-sensitive', main: '        vector<Pet> pets = {{"Rex", 3}};\n        bool found = birthday(pets, "rex");\n        cout << found << " " << pets[0].age << endl;', expect: '0 3' },
              { name: 'no pets at all', main: '        vector<Pet> pets;\n        cout << birthday(pets, "Rex") << " " << pets.size() << endl;', expect: '0 0' }
            ],
            failTip: 'If the function returns the right true or false but the ages stay the same, the loop is changing a copy of each pet.',
            followup: 'Stretch: write int oldest(const vector<Pet>& pets) that returns the highest age, or -1 for an empty vector. Why is const& the right way to take the vector?'
          }
        },
        `<div class="recap"><h3>Unit one in a few lines</h3><p>The opening question: you get the thing itself only when you ask for it with <code>&amp;</code>. Without it, a parameter or a loop variable holds a copy.</p><ul>
<li><code>std::string</code> owns its text: <code>==</code> compares the characters, <code>find</code> says "not found" with <code>string::npos</code>, and <code>size()</code> is unsigned.</li>
<li><code>vector</code> grows with <code>push_back</code>; <code>v[i]</code> is unchecked, <code>v.at(i)</code> stops the program, and <code>auto</code> picks a type at compile time, not while the program runs.</li>
<li>A reference is another name for the same variable. Pass by value to work on a copy, by <code>const&amp;</code> to read something big, by <code>&amp;</code> to change the caller's variable. Never return a reference to a local.</li>
<li>A <code>struct</code> bundles members into one type. Assigning one copies every member, and <code>==</code> is not built in.</li>
<li>Next: types that guard their own data, and the algorithms and lookups of the standard library.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3A-AP-17', '3B-AP-14', '3A-CS-01'], standard: 1,
      title: 'Types with rules', summary: 'class: private data, constructors and member functions, so that a value can never be put into a state the program forbids.',
      blocks: [
        `<p>In 1962 Kristen Nygaard and Ole-Johan Dahl, two Norwegian computer scientists, began work on a language for simulating real systems. They found that the natural way to describe such things was as <em>objects</em>, each with its own data and its own behaviour, and in 1967 their language Simula 67 introduced the word <em>class</em>. A young Dane named Bjarne Stroustrup, who had learned Simula as a student in Aarhus, used it for his doctoral research at Cambridge in the late 1970s. Years later, at Bell Labs, he wanted its classes in a language that ran at the speed of C. That was the beginning of "C with Classes", and so of C++.</p>`,
        { photo: 'house-blueprint', caption: 'A plan of a house and its grounds, drawn in 1910. A class is a plan of this kind: it says what every object built from it has and what it can do, and a program builds as many objects from one class as it needs, each with its own data.' },
        `<p>Lesson 4 ended with a complaint: a <code>struct</code> cannot protect itself. Look at this one. What will it print, and what in the language could have stopped it?</p>`,
        { play: `#include <iostream>
using namespace std;

struct Account {
    int balance;
};

int main() {
    Account a = {100};
    a.balance = a.balance - 500;      // nothing stops this
    cout << "balance: " << a.balance << endl;
    return 0;
}`, predict: true, caption: 'It prints <code>balance: -400</code>: the account is 400 in debt, and nothing complained. Any line of the program can do this, anywhere. In a large program, which line did it?' },
        `<h2>A class guards its data</h2>
<p>The fix is to make the data <em>private</em>, so that only a small number of functions, which belong to the type and which you write carefully, can touch it. Those functions are the type's <em>member functions</em> and together they are its interface.</p>
<div class="stmt"><p><span class="kind">Rule (class).</span> In a <code>class</code>, members are private unless a <code>public:</code> label says otherwise. (In a <code>struct</code> it is the other way round.) A <em>constructor</em> is a member function with the same name as the class and no return type; it runs when a variable of the class is made and sets the starting state. A member function that does not change the object is marked <code>const</code>.</p></div>`,
        { play: `#include <iostream>
using namespace std;

class Account {
public:
    Account(int opening) : balance(opening) {}       // constructor: sets balance

    bool withdraw(int amount) {
        if (amount <= 0 || amount > balance) {
            return false;                            // refused: the balance is untouched
        }
        balance -= amount;
        return true;
    }
    void deposit(int amount) { if (amount > 0) balance += amount; }
    int getBalance() const { return balance; }       // const: only looks

private:
    int balance;
};

int main() {
    Account a(100);
    cout << "withdraw 500: " << (a.withdraw(500) ? "ok" : "refused") << endl;
    cout << "withdraw 30:  " << (a.withdraw(30) ? "ok" : "refused") << endl;
    a.deposit(5);
    cout << "balance: " << a.getBalance() << endl;
    return 0;
}`, predict: true, long: true, caption: 'It prints <code>withdraw 500: refused</code>, <code>withdraw 30:  ok</code> and <code>balance: 75</code> (100 - 30 + 5). Whatever else the program does, this balance can never go below zero, because no line outside the class can change it except through withdraw and deposit.' },
        { check: "What is a constructor?", skill: 'constructor', options: ["A member function with the class's name and no return type, run when an object is made", "A function that deletes an object", "Any public function"], answer: 0, wrong: [null, "That is a <em>destructor</em>, a different member function whose name starts with <code>~</code>. A constructor is for the opposite moment: it runs when an object is made.", "Public functions are the ones outsiders may call. A constructor is special: it has the class's name, no return type, and runs by itself when an object is made."], why: "It sets the starting state, usually with an initialiser list, so the invariant holds from the first moment." },
        `<p>Read the constructor's header, <code>Account(int opening) : balance(opening) {}</code>. The part after the colon is an <em>initialiser list</em>: it sets each member as the object is created. Prefer it to assigning in the body.</p>
<p>The compiler enforces the privacy. Try to do what the struct allowed:</p>`,
        { play: `#include <iostream>
using namespace std;

class Account {
public:
    Account(int opening) : balance(opening) {}
    int getBalance() const { return balance; }
private:
    int balance;
};

int main() {
    Account a(100);
    a.balance = a.balance - 500;
    cout << a.getBalance() << endl;
    return 0;
}`, expectError: true, caption: 'This does not compile: balance is private. Read the message, then delete the bad line and run again.' },
        { check: "In a class, members with no label are…", skill: 'class-private', options: ["public", "private", "protected"], answer: 1, wrong: ["That is the rule for a <code>struct</code>. A class takes the safe default: private. If members were public here, the balance could be changed from anywhere, as in the struct.", null, "<code>protected</code> is a real label, used with inheritance, but it is never the default. For a class the default is private."], why: "Private unless a public: label says otherwise. In a struct it is the other way round." },
        `<h2>An invariant</h2>
<p>The idea behind all this is an <em>invariant</em>: a statement that is true of every object of the type, at every moment outside its own member functions. For <code>Account</code> it is "the balance is never negative". The constructor makes it true, and every public function keeps it true. A reader of the program need only check those functions, not every line, to know it holds. That is what protecting data buys.</p>
<h2>Several objects, and a default</h2>`,
        { play: `#include <iostream>
#include <string>
using namespace std;

class Counter {
public:
    Counter(string label = "counter") : name(label), count(0) {}
    void tick() { count++; }
    void show() const { cout << name << ": " << count << endl; }
private:
    string name;
    int count;
};

int main() {
    Counter a;
    Counter b("visitors");
    a.tick();
    b.tick(); b.tick(); b.tick();
    a.show();
    b.show();
    return 0;
}`, predict: true, caption: 'It prints <code>counter: 1</code> and <code>visitors: 3</code>. Each object has its own copy of the data, so a ticked once and b three times. A constructor parameter can have a default (label = "counter"), so Counter a; works as well as Counter b("visitors");.' },
        { check: "Why mark a member function <code>const</code>?", skill: 'const-member', options: ["To make it faster", "To promise it does not change the object, so it can be called on a const object", "To make it private"], answer: 1, wrong: ["<code>const</code> is a promise the compiler checks, not a speed-up. The program runs the same; it simply refuses to compile a <code>const</code> function that changes the object.", null, "Who may call a function is decided by <code>public:</code> and <code>private:</code>. <code>const</code> says nothing about that: it is about whether the object is changed."], why: "A reader function marked const can be used through const references and objects; without the mark, it cannot." },
        { aside: `<p><b>Common mistakes in this lesson.</b> Forgetting the semicolon after the closing brace of a class. Writing <code>Account a();</code>, which declares a function, rather than making an object. Forgetting <code>public:</code> and then finding that nothing can be called. Forgetting <code>const</code> on a function that only reads: it then cannot be called on a <code>const</code> object. Giving a getter for every private member: if everything can be read and set, you have a struct with extra typing.</p>` },
        {
          ex: {
            id: 'mc-5-1', skill: 'constructor', title: 'A counter',
            prompt: `<p>Write a class <code>Counter</code> that counts. It must have:</p><ul><li>a constructor <code>Counter(int start = 0)</code>, so that <code>Counter c;</code> starts at 0 and <code>Counter c(10);</code> starts at 10;</li><li><code>void increment()</code>, which adds 1;</li><li><code>void reset()</code>, which sets the count back to 0;</li><li><code>int value() const</code>, which returns the count.</li></ul><p>Keep the count private. Write only the class; the checker supplies <code>main</code>.</p>`,
            prelude: '#include <iostream>\nusing namespace std;\n',
            starter: `class Counter {\npublic:\n    // the constructor and three functions\nprivate:\n    // the count\n};`,
            solution: `class Counter {\npublic:\n    Counter(int start = 0) : count(start) {}\n    void increment() { count++; }\n    void reset() { count = 0; }\n    int value() const { return count; }\nprivate:\n    int count;\n};`,
            mustContain: [{ re: /private\s*:/, msg: 'Keep the count private: add a private: section for it.' }],
            hints: ['One private member: int count;. The constructor sets it from its parameter: Counter(int start = 0) : count(start) {}', 'increment adds one to count; reset sets it to 0; value returns it. Mark value const.'],
            tests: [
              { name: 'Counter c; c.value()', main: '        Counter c;\n        cout << c.value() << endl;', expect: '0' },
              { name: 'two increments', main: '        Counter c;\n        c.increment();\n        c.increment();\n        cout << c.value() << endl;', expect: '2' },
              { name: 'Counter c(10); one increment', main: '        Counter c(10);\n        c.increment();\n        cout << c.value() << endl;', expect: '11' },
              { name: 'reset', main: '        Counter c(5);\n        c.increment();\n        c.reset();\n        cout << c.value() << endl;', expect: '0' },
              { name: 'value() on a const Counter', main: '        const Counter c(7);\n        cout << c.value() << endl;', expect: '7' }
            ],
            failTip: 'If one test fails to compile, check the constructor’s default value and that value() is const.',
            followup: 'Stretch: add void decrement() that never takes the count below zero. Then write down, in one sentence, the invariant your Counter keeps.'
          }
        },
        {
          ex: {
            id: 'mc-5-2', skill: 'invariant', title: 'A careful account',
            prompt: `<p>Write a class <code>Account</code> that never lets its balance go below zero. It must have:</p><ul><li>a constructor <code>Account(int opening)</code> that sets the balance;</li><li><code>bool deposit(int amount)</code>: adds <code>amount</code> and returns <code>true</code>, but if <code>amount</code> is not positive does nothing and returns <code>false</code>;</li><li><code>bool withdraw(int amount)</code>: subtracts <code>amount</code> and returns <code>true</code>, but if <code>amount</code> is not positive, or is more than the balance, does nothing and returns <code>false</code>;</li><li><code>int balance() const</code>: the current balance.</li></ul><p>The balance itself must be private (name it anything except <code>balance</code>, which is the name of the function). Write only the class.</p>`,
            prelude: '#include <iostream>\nusing namespace std;\n',
            starter: `class Account {\npublic:\n    // constructor, deposit, withdraw, balance\nprivate:\n    // the data\n};`,
            solution: `class Account {\npublic:\n    Account(int opening) : money(opening) {}\n    bool deposit(int amount) {\n        if (amount <= 0) return false;\n        money += amount;\n        return true;\n    }\n    bool withdraw(int amount) {\n        if (amount <= 0 || amount > money) return false;\n        money -= amount;\n        return true;\n    }\n    int balance() const { return money; }\nprivate:\n    int money;\n};`,
            mustContain: [{ re: /private\s*:/, msg: 'Keep the data private: add a private: section.' }],
            hints: ['Store the money in a private member with a different name, say money; balance() returns it.', 'Both functions begin by refusing bad amounts: if (amount <= 0) return false; withdraw also refuses amount > money.', 'Only after the checks, change money and return true.'],
            tests: [
              { name: 'opening balance', main: '        Account a(100);\n        cout << a.balance() << endl;', expect: '100' },
              { name: 'deposit 50', main: '        Account a(100);\n        cout << a.deposit(50) << " " << a.balance() << endl;', expect: '1 150' },
              { name: 'deposit -5 is refused', main: '        Account a(100);\n        cout << a.deposit(-5) << " " << a.balance() << endl;', expect: '0 100' },
              { name: 'withdraw 30', main: '        Account a(100);\n        cout << a.withdraw(30) << " " << a.balance() << endl;', expect: '1 70' },
              { name: 'withdraw more than the balance is refused', main: '        Account a(100);\n        cout << a.withdraw(101) << " " << a.balance() << endl;', expect: '0 100' },
              { name: 'withdraw exactly the balance', main: '        Account a(100);\n        cout << a.withdraw(100) << " " << a.balance() << endl;', expect: '1 0' },
              { name: 'withdraw 0 is refused', main: '        Account a(10);\n        cout << a.withdraw(0) << " " << a.balance() << endl;', expect: '0 10' }
            ],
            failTip: 'A refused call must leave the balance exactly as it was and return false.',
            followup: 'Stretch: add bool transferTo(Account& other, int amount) that moves money from this account to another, and refuses (changing neither) when the withdrawal would be refused.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><p>The opening question: make the data private and let only member functions change it, and the type can refuse any state the program forbids.</p><ul>
<li>A <code>class</code> keeps its data <code>private</code> and offers <code>public</code> member functions, so every change goes through code that can check it.</li>
<li>A constructor has the class's name and no return type; it sets the starting state, usually with an initialiser list: <code>Account(int n) : balance(n) {}</code>.</li>
<li>Mark a member function <code>const</code> if it does not change the object.</li>
<li>An invariant (such as "never negative") is established by the constructor and kept by every public function. That is the point of the design.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-10', '3B-AP-16'], standard: 1,
      title: 'Algorithms without the loops', summary: 'sort, find, count and friends from <algorithm>, and the small anonymous functions (lambdas) that tell them what you mean.',
      blocks: [
        `<p>In 1959 a twenty-five-year-old British student named Tony Hoare was in Moscow studying machine translation. To look words up quickly in a dictionary stored on magnetic tape, he needed to sort lists of words, and he thought of a method: pick one item, move everything smaller to its left and everything larger to its right, then do the same to each side. He called it Quicksort. You wrote a slower sort of your own, selection sort, in SC 103. The <code>sort</code> in the common C++ libraries is a refined descendant of Hoare's idea, and you are not expected to write another.</p>`,
        `<p>The header <code>&lt;algorithm&gt;</code> holds dozens of such ready-made, carefully tested operations. Using them makes a program shorter and, more importantly, makes it say <em>what</em> it does instead of <em>how</em>. They all work on a <em>range</em> of a container, given by two positions: <code>v.begin()</code> is the position of the first item and <code>v.end()</code> is the position just past the last one. (These positions are called iterators. For now, think of them as bookmarks into the vector.) So how do you tell a ready-made sort what "smaller" should mean for your own data?</p>`,
        { play: `#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
using namespace std;

int main() {
    vector<int> v = {40, 10, 30, 20, 10};
    sort(v.begin(), v.end());                         // 10 10 20 30 40
    for (int x : v) cout << x << " ";
    cout << endl;
    reverse(v.begin(), v.end());                      // 40 30 20 10 10
    cout << "first after reverse: " << v[0] << endl;
    cout << "how many 10s: " << count(v.begin(), v.end(), 10) << endl;
    cout << "biggest: " << *max_element(v.begin(), v.end()) << endl;
    cout << "sum: " << accumulate(v.begin(), v.end(), 0) << endl;
    auto where = find(v.begin(), v.end(), 30);
    if (where != v.end()) {
        cout << "30 is at position " << (where - v.begin()) << endl;
    }
    return 0;
}`, predict: true, caption: 'It prints <code>10 10 20 30 40</code>, then <code>first after reverse: 40</code>, <code>how many 10s: 2</code>, <code>biggest: 40</code>, <code>sum: 110</code> and <code>30 is at position 1</code> (after the reverse the vector is 40 30 20 10 10). find and max_element hand back a position, not a value. The star in *max_element(...) means "the item at that position". find says "not found" by returning v.end(). accumulate lives in &lt;numeric&gt;.' },
        { check: "What does <code>*max_element(v.begin(), v.end())</code> give?", skill: 'algo-range', options: ["The position of the largest item", "The largest item itself", "The number of items"], answer: 1, wrong: ["That is what <code>max_element(...)</code> gives without the star. The <code>*</code> in front is what turns the position into the item that sits there.", null, "Counting is the job of <code>count</code> or <code>size()</code>. <code>max_element</code> looks for the largest item."], why: "max_element returns a position; the star gives the item at that position. On an empty vector there is nothing to point at." },
        `<h2>Telling an algorithm what you mean: lambdas</h2>
<p><code>sort</code> puts numbers in increasing order unless told otherwise. To sort differently (biggest first, shortest word first) you give it a third argument: a function that says which of two items should come first. Writing a whole named function for that is heavy, so C++ lets you write the function right where it is needed, with no name. It is called a <em>lambda</em>.</p>
<div class="stmt"><p><span class="kind">Rule (lambda).</span> <code>[captures](parameters) { body }</code>. It works like a function with the given parameters and body. The square brackets name outside variables the body may use: <code>[limit]</code> copies <code>limit</code> in, <code>[&amp;total]</code> lets the body change <code>total</code>. A sorting comparison takes two items and returns <code>true</code> if the first must come <em>before</em> the second.</p></div>`,
        { play: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> v = {5, 3, 9, 1};
    sort(v.begin(), v.end(), [](int a, int b) { return a > b; });      // biggest first
    for (int x : v) cout << x << " ";
    cout << endl;
    vector<string> words = {"pear", "fig", "banana", "kiwi"};
    sort(words.begin(), words.end(), [](const string& a, const string& b) {
        return a.size() < b.size();                                    // shortest first
    });
    for (const string& w : words) cout << w << " ";
    cout << endl;
    int limit = 4;
    int longer = count_if(words.begin(), words.end(), [limit](const string& w) {
        return (int)w.size() > limit;                                  // uses limit from outside
    });
    cout << longer << " words are longer than " << limit << endl;
    return 0;
}`, predict: true, caption: 'It prints <code>9 5 3 1</code>, then <code>fig pear kiwi banana</code>, then <code>1 words are longer than 4</code> (only banana). The lambda in the first sort says "a comes first if it is bigger". count_if counts the items for which its lambda says true; [limit] is how the lambda sees the variable limit. Because pear and kiwi are the same length, plain sort does not promise which comes first: that is what the rule below is about.' },
        { check: "In <code>[limit](int x) { return x &gt; limit; }</code>, what are the square brackets for?", skill: 'lambda', options: ["The parameters", "The outside variables the lambda may use", "The return type"], answer: 1, wrong: ["The parameters are in the round brackets, <code>(int x)</code>. The square brackets come first and hold the captures.", null, "The return type is worked out from the <code>return</code> statement, so you rarely write it. The square brackets are for variables from outside."], why: "Captures: [limit] copies limit in; [&total] lets the body change total." },
        `<div class="stmt"><p><span class="kind">Rule (a comparison must be strict).</span> The function you give <code>sort</code> must say <code>&lt;</code>, never <code>&lt;=</code>: for two equal items it must say <code>false</code> both ways. A comparison that says <code>true</code> for equal items breaks the algorithm's assumptions, and the program may misbehave or crash. Also, <code>sort</code> does not promise to keep equal items in their original order. If that matters, use <code>stable_sort</code>, which has the same form.</p></div>
<h2>Sorting your own types</h2>
<p>Lessons 4 and 6 gave you types of your own; a lambda says how to order them.</p>`,
        { play: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

struct Student {
    string name;
    double score;
};

int main() {
    vector<Student> roster = {{"Ada", 93.5}, {"Grace", 88}, {"Alan", 71.25}, {"Edsger", 93.5}};
    stable_sort(roster.begin(), roster.end(), [](const Student& a, const Student& b) {
        return a.score > b.score;       // highest score first; equal scores keep their order
    });
    for (const Student& s : roster) cout << s.name << " " << s.score << endl;
    return 0;
}`, predict: true, caption: 'It prints <code>Ada 93.5</code>, <code>Edsger 93.5</code>, <code>Grace 88</code>, <code>Alan 71.25</code>. Ada and Edsger tie. Because stable_sort is used, Ada stays ahead of Edsger. Try sort in its place and a larger roster.' },
        { check: "Your sort comparison uses <code>&lt;=</code>. What can happen?", skill: 'strict-compare', options: ["Nothing: it sorts the same way", "The algorithm's assumptions break; it may misbehave or crash", "It sorts in reverse"], answer: 1, wrong: ["It looks harmless, but for two equal items <code>&lt;=</code> says each comes before the other, which is impossible. <code>sort</code> relies on that never happening and can run past the end of the data.", null, "Biggest first needs <code>&gt;</code>. <code>&lt;=</code> is not a reversed order: it is a broken one, because it says <code>true</code> for equal items."], why: "A comparison must say false for equal items both ways. Use <, and stable_sort if equal items must keep their order." },
        { aside: `<p><b>Common mistakes in this lesson.</b> Passing <code>v.begin()</code> and <code>w.end()</code> from two different containers. Using <code>*max_element(...)</code> on an empty vector (there is nothing to point at). Writing <code>&lt;=</code> in a comparison. Forgetting <code>#include &lt;algorithm&gt;</code> (and <code>&lt;numeric&gt;</code> for <code>accumulate</code>). Comparing the result of <code>find</code> with a value instead of with <code>v.end()</code>.</p>` },
        {
          ex: {
            id: 'mc-6-1', skill: ['lambda', 'strict-compare'], title: 'Shortest first',
            prompt: `<p>Write a function <code>vector&lt;string&gt; byLength(vector&lt;string&gt; words)</code> that returns the words ordered by length, shortest first. Words of the same length must stay in the order they were given. For <code>{"pear", "fig", "banana", "kiwi"}</code> the result is <code>fig pear kiwi banana</code>. Add <code>#include &lt;algorithm&gt;</code> above your function. Write only the function and the include; the checker supplies <code>main</code>.</p>`,
            prelude: '#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n',
            starter: `#include <algorithm>\n\nvector<string> byLength(vector<string> words) {\n    // sort words, using a lambda that compares their sizes\n    return words;\n}`,
            solution: `#include <algorithm>\n\nvector<string> byLength(vector<string> words) {\n    stable_sort(words.begin(), words.end(), [](const string& a, const string& b) {\n        return a.size() < b.size();\n    });\n    return words;\n}`,
            hints: ['Call stable_sort(words.begin(), words.end(), comparison). The comparison is a lambda taking two const string& and returning true if the first is shorter.', 'a.size() < b.size(), strictly less, never <=.', 'stable_sort keeps equal-length words in their original order; plain sort does not promise to.'],
            tests: [
              { name: 'byLength({"pear", "fig", "banana", "kiwi"})', main: '        for (const string& w : byLength({"pear", "fig", "banana", "kiwi"})) cout << w << " ";\n        cout << endl;', expect: 'fig pear kiwi banana' },
              { name: 'ties keep their order: {"bb", "aa", "c", "dd"}', main: '        for (const string& w : byLength({"bb", "aa", "c", "dd"})) cout << w << " ";\n        cout << endl;', expect: 'c bb aa dd' },
              { name: 'twenty words of one length', main: '        vector<string> in;\n        for (char c = \'a\'; c < \'a\' + 20; c++) in.push_back(string(2, c));\n        for (const string& w : byLength(in)) cout << w[0];\n        cout << endl;', expect: 'abcdefghijklmnopqrst' },
              { name: 'byLength({})', main: '        cout << byLength({}).size() << endl;', expect: '0' },
              { name: 'one word', main: '        cout << byLength({"solo"})[0] << endl;', expect: 'solo' }
            ],
            failTip: 'Words of equal length must keep the order they came in: use stable_sort.',
            followup: 'Stretch: when two words have the same length, put the one that comes first in the dictionary first. In the lambda, return a.size() < b.size() unless the sizes are equal, then return a < b.'
          }
        },
        {
          ex: {
            id: 'mc-6-2', skill: 'lambda', title: 'The top three',
            prompt: `<p>Write a function <code>vector&lt;int&gt; topThree(vector&lt;int&gt; v)</code> that returns the three largest numbers of <code>v</code>, biggest first. If <code>v</code> has fewer than three numbers, return all of them, biggest first. For <code>{5, 1, 9, 7, 3}</code> it returns <code>{9, 7, 5}</code>. Duplicates count separately: for <code>{4, 4, 4, 1}</code> it returns <code>{4, 4, 4}</code>. Write only the function and any includes.</p>`,
            prelude: '#include <iostream>\n#include <vector>\nusing namespace std;\n',
            starter: `#include <algorithm>\n\nvector<int> topThree(vector<int> v) {\n    // sort biggest first, then keep only the first three\n    return v;\n}`,
            solution: `#include <algorithm>\n\nvector<int> topThree(vector<int> v) {\n    sort(v.begin(), v.end(), [](int a, int b) { return a > b; });\n    if (v.size() > 3) v.resize(3);\n    return v;\n}`,
            hints: ['Sort with a comparison that puts the bigger number first: [](int a, int b) { return a > b; }', 'v.resize(3) cuts the vector down to its first three items. Only do it when v.size() > 3; resizing a smaller vector would add zeros.'],
            tests: [
              { name: 'topThree({5, 1, 9, 7, 3})', main: '        for (int x : topThree({5, 1, 9, 7, 3})) cout << x << " ";\n        cout << endl;', expect: '9 7 5' },
              { name: 'topThree({4, 4, 4, 1})', main: '        for (int x : topThree({4, 4, 4, 1})) cout << x << " ";\n        cout << endl;', expect: '4 4 4' },
              { name: 'topThree({2, 8})', main: '        for (int x : topThree({2, 8})) cout << x << " ";\n        cout << endl;', expect: '8 2' },
              { name: 'topThree({})', main: '        cout << topThree({}).size() << endl;', expect: '0' },
              { name: 'negative numbers', main: '        for (int x : topThree({-5, -1, -9, -7})) cout << x << " ";\n        cout << endl;', expect: '-1 -5 -7' }
            ],
            failTip: 'Check short inputs: fewer than three numbers must not be padded with zeros.',
            followup: 'Stretch: write int nthLargest(vector<int> v, int n) with the same idea, and decide what it should return when v has fewer than n numbers.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><p>The opening question: you tell a ready-made algorithm what "smaller" means by giving it a lambda that compares two of your items.</p><ul>
<li><code>&lt;algorithm&gt;</code> works on a range given by two positions, <code>v.begin()</code> and <code>v.end()</code> (one past the last item).</li>
<li><code>sort</code>, <code>reverse</code>, <code>count</code>, <code>count_if</code>, <code>find</code>, <code>max_element</code> and <code>accumulate</code> (in <code>&lt;numeric&gt;</code>) replace most hand-written loops. <code>find</code> and <code>max_element</code> return positions; <code>*</code> gives the item.</li>
<li>A lambda <code>[captures](parameters) { body }</code> is a function written where it is used. Comparisons for <code>sort</code> must be strict (<code>&lt;</code>, not <code>&lt;=</code>); use <code>stable_sort</code> to keep equal items in order.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3A-DA-10', '3B-AP-12'], standard: 1,
      title: 'Looking things up', summary: 'map and set: collections found by name instead of by position, and counting with them.',
      blocks: [
        `<p>In 1986 the magazine <em>Communications of the ACM</em> ran a column by Jon Bentley on a simple task: read a text file and print its most frequent words. For the column he invited Donald Knuth, the author of <em>The Art of Computer Programming</em>, to write a program, and Knuth produced several pages of carefully explained code, with a purpose-built data structure for the words. Then Bentley asked Doug McIlroy, who had helped invent the Unix pipeline, to comment. McIlroy's answer was one line of six standard commands joined together, which did the same job. Neither answer was foolish: Knuth was demonstrating a style of writing programs, and McIlroy was demonstrating the value of good tools.</p>`,
        { photo: 'hose-connectors', caption: 'Garden hose parts that click together. In 1964 McIlroy wrote that programs should be coupled "like garden hose": small pieces, each doing one job, joined end to end. His one-line answer is six such pieces. This lesson takes the same approach in C++: ready-made pieces from the standard library instead of code written from scratch.' },
        `<p>The C++ standard library is a good-tools answer. The data structure Knuth built by hand is, here, one word: <code>map</code>. So how would you count words in C++ without building anything yourself?</p>
<h2>A map: look up by key</h2>
<p>A <code>vector</code> finds an item by its position, 0, 1, 2. A <code>map&lt;K, V&gt;</code> finds a <em>value</em> of type <code>V</code> by a <em>key</em> of type <code>K</code>: a name to a phone number, a word to a count. Include <code>&lt;map&gt;</code>.</p>`,
        { play: `#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    map<string, int> age;
    age["Ada"] = 36;
    age["Alan"] = 41;
    age["Grace"] = 85;

    cout << "Alan is " << age["Alan"] << endl;
    age["Ada"] = 37;                       // set it again: replaced
    cout << "size: " << age.size() << endl;

    for (const auto& entry : age) {        // in order of the keys
        cout << entry.first << " -> " << entry.second << endl;
    }
    return 0;
}`, predict: true, caption: 'It prints <code>Alan is 41</code>, <code>size: 3</code> (setting Ada again replaced her age, it did not add a fourth entry), then <code>Ada -> 37</code>, <code>Alan -> 41</code>, <code>Grace -> 85</code>. Each entry is a pair: entry.first is the key and entry.second the value. A map keeps its keys in order, so the loop prints alphabetically.' },
        { check: "In a loop over a map, what are <code>entry.first</code> and <code>entry.second</code>?", skill: 'map-count', options: ["The first and second entries", "The key and the value of one entry", "The smallest and largest keys"], answer: 1, wrong: ["They have nothing to do with the order of visiting. One entry is a pair holding a key and its value, and <code>.first</code> and <code>.second</code> are the two halves of that one pair.", null, "The smallest and largest keys would be the first and last entries of the map. <code>.first</code> and <code>.second</code> belong to a single entry: its key and its value."], why: "Each entry is a pair: key first, value second, visited in key order." },
        `<h2>Counting</h2>
<p>The everyday use of a map is counting. When you write <code>m[key]</code> for a key that is not there yet, the map creates it with a value of zero (for numbers), so <code>m[word]++</code> is the whole counting loop.</p>`,
        { play: `#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    map<string, int> counts;
    string word;
    while (cin >> word) {
        counts[word]++;
    }
    for (const auto& entry : counts) {
        cout << entry.first << ": " << entry.second << endl;
    }
    return 0;
}`, stdin: 'the cat and the hat and the bat', predict: true, caption: 'It prints <code>and: 2</code>, <code>bat: 1</code>, <code>cat: 1</code>, <code>hat: 1</code>, <code>the: 3</code>, in alphabetical order. This is Bentley’s word-frequency task, minus the sorting by count. It is six lines of real work.' },
        `<div class="stmt"><p><span class="kind">Trap.</span> Reading with <code>m[key]</code> <em>adds</em> the key if it was missing. To ask whether a key is present without changing the map, use <code>m.count(key)</code> (0 or 1) or <code>m.find(key)</code> (which returns <code>m.end()</code> when it is absent). A program that tests <code>if (m["x"] == 0)</code> has just added an "x".</p></div>`,
        { check: "What does <code>if (m[\"x\"] == 0)</code> do to the map when \"x\" is absent?", skill: 'map-missing-key', options: ["Nothing", "Adds \"x\" with value 0", "Throws an error"], answer: 1, wrong: ["It looks like a pure question, but <code>[]</code> on a map is not read-only: a missing key is created. Merely looking has changed your counts.", null, "There is no error at all. <code>[]</code> quietly inserts the key with a default value (0 for an <code>int</code>), which is exactly why the mistake is hard to see."], why: "Reading with [] inserts a missing key. Ask with m.count(key) or m.find(key) instead." },
        `<h2>A set: only keys</h2>
<p>A <code>set&lt;T&gt;</code> holds items with no duplicates and keeps them in order. It answers "have I seen this before?" and "what are the different ones?" Include <code>&lt;set&gt;</code>.</p>`,
        { play: `#include <iostream>
#include <set>
#include <vector>
using namespace std;

int main() {
    vector<int> rolls = {3, 6, 3, 1, 6, 6, 2};
    set<int> distinct;
    for (int r : rolls) distinct.insert(r);       // inserting a duplicate does nothing

    cout << distinct.size() << " different numbers: ";
    for (int d : distinct) cout << d << " ";
    cout << endl;
    cout << "was 4 rolled? " << (distinct.count(4) ? "yes" : "no") << endl;
    cout << "was 6 rolled? " << (distinct.count(6) ? "yes" : "no") << endl;
    return 0;
}`, predict: true, caption: 'It prints <code>4 different numbers: 1 2 3 6</code>, <code>was 4 rolled? no</code> and <code>was 6 rolled? yes</code>. Seven rolls went in, but the repeats were ignored and the set is in order. count(x) on a set is 1 if x is there and 0 if not, so it works as a yes-or-no question.' },
        `<h2>The faster, unordered cousins</h2>
<p><code>map</code> and <code>set</code> keep their keys in order, which costs a little time. <code>unordered_map</code> and <code>unordered_set</code> (from <code>&lt;unordered_map&gt;</code> and <code>&lt;unordered_set&gt;</code>) have the same everyday functions (<code>insert</code>, <code>count</code>, <code>find</code>, <code>[]</code>) but give up the ordering for speed; looping over one visits the keys in an order you must not depend on. Reach for the ordered ones when you want sorted output, and the unordered ones when you are only counting or checking membership of very large collections.</p>`,
        { check: "What does <code>unordered_map</code> give up compared with <code>map</code>?", skill: 'unordered-order', options: ["Speed", "The ordering of keys", "Lookup by key"], answer: 1, wrong: ["That is backwards: the unordered ones are the <em>faster</em> choice for big collections. What they give up is the order of the keys.", null, "You still look things up by key, with the same functions as <code>map</code>. They just do not keep the keys in sorted order."], why: "Same functions, no order, and faster for large collections." },
        { aside: `<p><b>Common mistakes in this lesson.</b> Using <code>m[key]</code> to test for presence. Forgetting that a <code>map</code> has one value per key: assigning again replaces the old one. Expecting <code>unordered_map</code> to print in any particular order. Changing the map while looping over it. Using a type as a key that cannot be compared (your own struct needs a comparison first).</p>` },
        {
          ex: {
            id: 'mc-7-3', kind: 'parsons', skill: 'map-count', title: 'Put it in order: count the first letters',
            prompt: `<p>Build the function <code>firstLetters</code>. It counts how many words begin with each letter: for <code>{"apple", "avocado", "banana"}</code> the map says <code>a</code> twice and <code>b</code> once. An empty word has no first letter and is skipped. Put the lines in order; the braces show how deep each line goes. Not every block belongs.</p>`,
            prelude: '#include <iostream>\n#include <map>\n#include <string>\n#include <vector>\nusing namespace std;\n',
            lines: ['map<char, int> firstLetters(const vector<string>& words) {', '    map<char, int> counts;', '    for (const string& w : words) {', '        if (!w.empty()) {', '            counts[w[0]]++;', '        }', '    }', '    return counts;', '}'],
            distractors: ['counts[w[0]] = 1;', 'map<string, int> counts;'],
            tests: [
              { name: 'firstLetters({"apple", "avocado", "banana"})', main: '        for (const auto& e : firstLetters({"apple", "avocado", "banana"})) cout << e.first << e.second << " ";\n        cout << endl;', expect: 'a2 b1' },
              { name: 'an empty word is skipped', main: '        for (const auto& e : firstLetters({"", "x", ""})) cout << e.first << e.second << " ";\n        cout << endl;', expect: 'x1' },
              { name: 'no words', main: '        cout << firstLetters({}).size() << endl;', expect: '0' },
              { name: 'letters come out in order', main: '        for (const auto& e : firstLetters({"zoo", "cat", "zebra", "cow", "cub"})) cout << e.first << e.second << " ";\n        cout << endl;', expect: 'c3 z2' }
            ],
            hints: ['The map is made once, before the loop, and its keys are single characters: map<char, int>. The if skips empty words, so that w[0] always exists.', 'counts[w[0]]++ starts a new letter at 0 and adds 1. Setting it to 1 would forget the earlier words that began with the same letter.'],
            followup: 'Change the function so that capital and small letters count together: Apple and apple both count for a. Which function from <cctype> helps?'
          }
        },
        {
          ex: {
            id: 'mc-7-1', skill: 'map-count', title: 'Word counts',
            prompt: `<p>Read words from the input until it ends. Print each different word once, in alphabetical order, followed by a colon, a space and how many times it appeared. For the input <code>the cat and the hat</code> print</p><pre class="code">and: 1\ncat: 1\nhat: 1\nthe: 2</pre><p>Words are lower case and separated by spaces or new lines.</p>`,
            starter: `#include <iostream>\n#include <map>\n#include <string>\nusing namespace std;\n\nint main() {\n    // read words until the input ends, counting each\n    return 0;\n}`,
            solution: `#include <iostream>\n#include <map>\n#include <string>\nusing namespace std;\n\nint main() {\n    map<string, int> counts;\n    string word;\n    while (cin >> word) {\n        counts[word]++;\n    }\n    for (const auto& entry : counts) {\n        cout << entry.first << ": " << entry.second << endl;\n    }\n    return 0;\n}`,
            sampleStdin: 'the cat and the hat',
            hints: ['A map<string, int> from each word to its count. while (cin >> word) reads until the input ends.', 'counts[word]++ adds a missing word with 0 first, then adds 1.', 'A map goes through its keys in order, so just print each entry.first and entry.second.'],
            tests: [{ stdin: 'the cat and the hat', expect: 'and: 1\ncat: 1\nhat: 1\nthe: 2' }, { stdin: 'a a a\na', expect: 'a: 4' }, { stdin: 'b\na\nc\nb', expect: 'a: 1\nb: 2\nc: 1' }, { stdin: '', expect: '' }],
            failTip: 'Check an empty input (print nothing) and words spread over several lines.',
            followup: 'Stretch: print the words from most frequent to least frequent, with ties in alphabetical order. Copy the entries into a vector of structs (lesson 4) and sort it with a lambda (lesson 7).'
          }
        },
        {
          ex: {
            id: 'mc-7-2', skill: 'set-distinct', title: 'The first repeat',
            prompt: `<p>Write a function <code>string firstRepeat(const vector&lt;string&gt;&amp; words)</code> that goes through the words from left to right and returns the first word that has already appeared earlier in the list. If no word repeats, return the empty string. For <code>{"a", "b", "c", "b", "a"}</code> it returns <code>b</code>, because the second <code>b</code> is reached before the second <code>a</code>. Write only the function and any includes.</p>`,
            prelude: '#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n',
            starter: `#include <set>\n\nstring firstRepeat(const vector<string>& words) {\n    // keep a set of the words seen so far\n    return "";\n}`,
            solution: `#include <set>\n\nstring firstRepeat(const vector<string>& words) {\n    set<string> seen;\n    for (const string& w : words) {\n        if (seen.count(w)) return w;\n        seen.insert(w);\n    }\n    return "";\n}`,
            hints: ['A set<string> called seen. Go through the words in order.', 'For each word: if seen.count(w) is 1, you have found the first repeat, so return it. Otherwise seen.insert(w).', 'If the loop finishes, nothing repeated: return "".'],
            tests: [
              { name: 'firstRepeat({"a", "b", "c", "b", "a"})', main: '        cout << "[" << firstRepeat({"a", "b", "c", "b", "a"}) << "]" << endl;', expect: '[b]' },
              { name: 'firstRepeat({"x", "y", "z"})', main: '        cout << "[" << firstRepeat({"x", "y", "z"}) << "]" << endl;', expect: '[]' },
              { name: 'firstRepeat({})', main: '        cout << "[" << firstRepeat({}) << "]" << endl;', expect: '[]' },
              { name: 'firstRepeat({"go", "go"})', main: '        cout << "[" << firstRepeat({"go", "go"}) << "]" << endl;', expect: '[go]' },
              { name: 'firstRepeat({"p", "q", "q", "p"})', main: '        cout << "[" << firstRepeat({"p", "q", "q", "p"}) << "]" << endl;', expect: '[q]' }
            ],
            failTip: 'It is the first word whose second copy comes soonest, found by scanning left to right, not the word with the earliest first copy.',
            followup: 'Stretch: write a function that returns the first word that appears three times (the one whose third copy comes first). A map<string, int> of counts fits better than a set.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><p>The opening question: count words with a <code>map&lt;string, int&gt;</code> and <code>counts[word]++</code>; the library already holds the data structure Knuth wrote by hand.</p><ul>
<li><code>map&lt;K, V&gt;</code> finds a value by key; <code>m[key]++</code> counts. Entries are pairs (<code>.first</code>, <code>.second</code>) visited in key order.</li>
<li><code>m[key]</code> adds a missing key. Use <code>count</code> or <code>find</code> to ask without adding.</li>
<li><code>set&lt;T&gt;</code> keeps distinct items in order: <code>insert</code>, <code>count</code>, <code>size</code>.</li>
<li><code>unordered_map</code> and <code>unordered_set</code> have the same everyday functions, no order, and are usually faster for large collections.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3A-AP-17', '3B-AP-10', '3B-AP-14', '3A-DA-10'],
      title: 'Checkpoint two', checkpoint: true, summary: 'No new ideas: mixed questions on classes, algorithms and lambdas, and maps and sets, then a choice and a program that uses all three. Struct or class? sort or stable_sort? count or []?',
      blocks: [
        `<p>This lesson teaches nothing new. It mixes questions on the last three lessons before the project: types with rules, algorithms with lambdas, and maps and sets. Here the confusable pairs are <code>struct</code> and <code>class</code>, <code>sort</code> and <code>stable_sort</code>, <code>count</code> and <code>[]</code>, and the question that matters most in the project: which tool fits this job? Answer each one before looking back. A question that surprises you will come back on the Review page.</p>
<p>Ready? Here is the first: if a function only looks at an object, how does the compiler know it did not change it?</p>
<h2>Mixed questions</h2>`,
        { check: `<code>struct S { int a = 1; };</code> and <code>class C { int a = 2; };</code> In <code>main</code> you make <code>S s;</code> and <code>C c;</code>. Which of <code>s.a</code> and <code>c.a</code> compiles?`, skill: 'class-private', options: ['Both of them', '<code>s.a</code> only: struct members are public unless said otherwise, class members private', '<code>c.a</code> only'], answer: 1, wrong: ['They are the same except for the default: a <code>class</code> starts private, so <code>c.a</code> is refused unless a <code>public:</code> label comes first.', null, 'It is the other way round. The struct is the one with the open default; the class keeps its data private.'], why: 'A <code>struct</code> starts public and a <code>class</code> starts private. That default is essentially the only difference between the two.' },
        { check: `<code>class Account</code> has one constructor, <code>Account(int opening)</code>. What does <code>Account a;</code> do?`, skill: 'constructor', options: ['It makes an account holding a garbage balance', 'It makes an account with balance 0', 'It does not compile: no constructor takes no arguments'], answer: 2, wrong: ['An object is never made without a constructor running, and here none of them can run without an argument.', 'Nothing sets the balance to 0 unless you write that. Once a class has a constructor of its own, the compiler no longer makes an empty one.', null], why: 'Once you write a constructor that needs an argument, every object must be given one: <code>Account a(100);</code>. A default value, <code>Account(int opening = 0)</code>, would allow <code>Account a;</code>.' },
        { check: `Which statement is an <em>invariant</em> of an <code>Account</code> that refuses a withdrawal larger than the balance?`, skill: 'invariant', options: ['<code>withdraw</code> returns a <code>bool</code>', 'The balance is never negative, whenever no member function is running', 'The balance starts at 100'], answer: 1, wrong: ['That is a fact about one function, not a statement about every account at every moment.', null, 'That is the starting state, which holds only until the first deposit or withdrawal. An invariant stays true for the whole life of the object.'], why: 'The constructor makes the invariant true and every public function keeps it true, so nothing outside the class can break it.' },
        { check: `<code>Counter</code> has <code>int value() const</code> and <code>void increment()</code>. With <code>const Counter k(3);</code>, which call does the compiler refuse?`, skill: 'const-member', options: ['<code>k.value()</code>', '<code>k.increment()</code>', 'Both of them'], answer: 1, wrong: ['<code>value()</code> is marked <code>const</code>: it promises not to change the object, so a <code>const</code> object may call it.', null, 'Only the function that is not marked <code>const</code> is refused. That is why you mark every member function that only looks.'], why: 'A <code>const</code> object may call only <code>const</code> member functions. <code>increment()</code> might change it, so the compiler says no.' },
        { check: `A lambda must add every item of <code>v</code> into a <code>total</code> declared outside it. Which capture list?`, skill: 'lambda', options: ['<code>[total]</code>', '<code>[&amp;total]</code>', '<code>[]</code>'], answer: 1, wrong: ['That copies <code>total</code> into the lambda, and the compiler refuses to change the copy: "cannot assign to a variable captured by copy". The copy would be thrown away anyway.', null, 'An empty list lets the lambda use nothing from outside, so <code>total</code> is not available inside it.'], why: '<code>[&amp;total]</code> captures <code>total</code> by reference, so the lambda works on the outside variable itself. It is the same <code>&amp;</code> as in lesson 3.' },
        { check: `<code>auto it = find(v.begin(), v.end(), 99);</code> and 99 is not in <code>v</code>. What is <code>it</code>?`, skill: 'algo-range', options: ['<code>v.end()</code>: one past the last item', '<code>v.begin()</code>', '<code>-1</code>'], answer: 0, wrong: [null, '<code>v.begin()</code> would mean "found at the first position". A found item and a missing one must be told apart.', 'It is a position, not a number, so there is no <code>-1</code>. "Not found" is the end position, which you compare with <code>v.end()</code>.'], why: 'Algorithms report "not found" with the end of the range. Test <code>it != v.end()</code> before you use <code>*it</code>.' },
        { check: `Several students have the same score. You sort them highest first and want equal scores to stay in their original order. Which sort is right?`, skill: 'strict-compare', options: ['<code>sort</code> with <code>a.score &gt;= b.score</code>', '<code>sort</code> with <code>a.score &gt; b.score</code>', '<code>stable_sort</code> with <code>a.score &gt; b.score</code>'], answer: 2, wrong: ['<code>&gt;=</code> says "first" for two equal items, both ways round. The algorithm assumes a strict comparison, and may misbehave or crash.', 'The comparison is right, but <code>sort</code> does not promise to keep equal items in their original order.', null], why: 'Compare strictly (<code>&gt;</code> or <code>&lt;</code>) and use <code>stable_sort</code> when equal items must keep their order.' },
        { check: `<code>map&lt;string, int&gt; m;</code> is empty. After <code>int a = m.count("x");</code> and then <code>int b = m["x"];</code>, what is <code>m.size()</code>?`, skill: 'map-missing-key', options: ['0', '2', '1'], answer: 2, wrong: ['<code>count</code> only asks and adds nothing, but <code>m["x"]</code> does add the missing key, with the value 0.', 'There is one key, <code>"x"</code>. Looking it up again would not make a second entry.', null], why: '<code>m.count(key)</code> and <code>m.find(key)</code> ask without changing the map. <code>m[key]</code> creates a missing key, so use it to count or to set, not to ask.' },
        { check: `You want every <em>different</em> word of a text once, in alphabetical order, with no counting. Which container fits?`, skill: 'set-distinct', options: ['<code>vector&lt;string&gt;</code> with <code>push_back</code>', '<code>unordered_set&lt;string&gt;</code>', '<code>set&lt;string&gt;</code>'], answer: 2, wrong: ['A vector keeps every copy of a word, in the order it arrived. You would have to remove the repeats and sort it yourself.', 'It drops the repeats but promises no order, and looping over it can visit the words in any order.', null], why: 'A <code>set</code> keeps distinct items and keeps them in order, so inserting every word does the whole job.' },
        { check: `You want to know how many times each word appears. Which container fits?`, skill: 'map-count', options: ['<code>map&lt;string, int&gt;</code>, with <code>counts[word]++</code>', '<code>set&lt;string&gt;</code>', '<code>vector&lt;string&gt;</code>, searched with <code>find</code> for each word'], answer: 0, wrong: [null, 'A set records that a word was seen, once. It has no place to keep a number.', 'It could work, but you would search the whole vector for every word and still have to keep the counts somewhere. A map finds a word and holds its count together.'], why: 'A map from word to count looks a word up by key, and <code>counts[word]++</code> starts a new word at 0 before adding 1.' },
        `<p>Two programs to finish the unit. In the first, a short class goes wrong in a way you can now explain. The second builds the class.</p>`,
        {
          ex: {
            id: 'mc-10-1', kind: 'choice', skill: ['const-member', 'map-missing-key'], title: 'The scoreboard that will not compile',
            prompt: `<p>A class keeps points for players in a private <code>map&lt;string, int&gt; totals</code>. A student adds this member function:</p><pre class="code">int total(const string&amp; name) const {\n    return totals[name];\n}</pre><p>What happens, and what is the reason?</p>`,
            options: [
              { text: 'It works, and gives 0 for a name that was never added.', why: 'It would be nice, but <code>[]</code> on a map can add a key, so it is not available on a map that is <code>const</code>.' },
              { text: 'It works, and also adds the name to the map with the value 0.', why: 'A <code>const</code> member function promises not to change the object, so the compiler cannot let it add anything: it refuses the code.' },
              { text: 'It does not compile: inside a const member function the map is const, and <code>[]</code> might add a key.', ok: true },
              { text: 'It compiles, and stops the program with an error when the name is missing.', why: 'That is how <code>at</code> behaves for a missing key, not <code>[]</code>. And this code does not get as far as running.' }
            ],
            hints: ['Look at the word after the closing bracket of the parameter list. What does it promise, and what might <code>totals[name]</code> do to the map?', 'To look something up without changing the map you can use <code>totals.count(name)</code> to ask, then <code>totals.at(name)</code> to read.'],
            solution: '<p>It does not compile. <code>const</code> promises that the function does not change the scoreboard, and <code>totals[name]</code> would add the name if it were missing, so the compiler refuses <code>[]</code> on a <code>const</code> map. Ask with <code>count</code> or <code>find</code>, and read with <code>at</code>.</p>',
            followup: 'Write the body of total() so that it compiles: it must return 0 for a name that is not in the map and must not add the name.'
          }
        },
        {
          ex: {
            id: 'mc-10-2', skill: ['class-private', 'lambda', 'map-count'], title: 'A scoreboard',
            prompt: `<p>Write a class <code>Scoreboard</code> that keeps a total of points for each player name. It must have:</p><ul><li><code>void add(const string&amp; name, int points)</code>: adds <code>points</code> to that player's total (a new player starts at 0);</li><li><code>int total(const string&amp; name) const</code>: the player's total, or 0 for a name that was never added. It must <em>not</em> add the name;</li><li><code>int players() const</code>: how many different names have been added;</li><li><code>vector&lt;string&gt; ranking() const</code>: the names ordered by total, highest first, with equal totals in alphabetical order.</li></ul><p>For <code>add("bo", 5)</code>, <code>add("al", 9)</code> and <code>add("cy", 9)</code> the ranking is <code>al cy bo</code>. Keep the data private. Write only the class; the checker supplies <code>main</code>.</p>`,
            prelude: '#include <iostream>\n#include <string>\n#include <vector>\n#include <map>\n#include <algorithm>\nusing namespace std;\n',
            starter: `class Scoreboard {\npublic:\n    // add, total, players and ranking\nprivate:\n    // the data\n};`,
            solution: `class Scoreboard {\npublic:\n    void add(const string& name, int points) {\n        totals[name] += points;\n    }\n    int total(const string& name) const {\n        if (totals.count(name) == 0) return 0;\n        return totals.at(name);\n    }\n    int players() const {\n        return (int)totals.size();\n    }\n    vector<string> ranking() const {\n        vector<pair<string, int>> all;\n        for (const auto& entry : totals) all.push_back(entry);\n        stable_sort(all.begin(), all.end(), [](const pair<string, int>& a, const pair<string, int>& b) {\n            return a.second > b.second;\n        });\n        vector<string> names;\n        for (const auto& entry : all) names.push_back(entry.first);\n        return names;\n    }\nprivate:\n    map<string, int> totals;\n};`,
            mustContain: [{ re: /private\s*:/, msg: 'Keep the data private: add a private: section.' }],
            hints: ['One private member: map<string, int> totals;. add is totals[name] += points; because [] starts a new name at 0.', 'total() is const, so it cannot use []. Ask first with totals.count(name), and read with totals.at(name) (the checked lookup, which works on a const map).', 'A map visits its names in alphabetical order. Copy the entries into a vector<pair<string, int>>, then stable_sort it with a lambda that is true when a.second > b.second: equal totals stay in alphabetical order.'],
            tests: [
              { name: 'add twice, then total', main: '        Scoreboard s;\n        s.add("ada", 5);\n        s.add("ada", 7);\n        cout << s.total("ada") << endl;', expect: '12' },
              { name: 'a name never added: total 0, and not a player', main: '        Scoreboard s;\n        s.add("ada", 1);\n        cout << s.total("zed") << " " << s.players() << endl;', expect: '0 1' },
              { name: 'players counts different names', main: '        Scoreboard s;\n        s.add("a", 1);\n        s.add("b", 2);\n        s.add("a", 3);\n        cout << s.players() << endl;', expect: '2' },
              { name: 'ranking: highest first, ties alphabetical', main: '        Scoreboard s;\n        s.add("bo", 5);\n        s.add("al", 9);\n        s.add("cy", 9);\n        for (const string& n : s.ranking()) cout << n << " ";\n        cout << endl;', expect: 'al cy bo' },
              { name: 'total() on a const scoreboard', main: '        Scoreboard s;\n        s.add("al", 4);\n        const Scoreboard& r = s;\n        cout << r.total("al") << " " << r.total("bo") << endl;', expect: '4 0' },
              { name: 'an empty scoreboard', main: '        Scoreboard s;\n        cout << s.players() << " " << s.ranking().size() << endl;', expect: '0 0' }
            ],
            failTip: 'If one test does not compile, check that total(), players() and ranking() are marked const, and that total() does not use []. If total("zed") changes players(), something is adding names that were never added.',
            followup: 'Stretch: add string leader() const that returns the name with the highest total (the alphabetically first when there is a tie), or an empty string when there are no players. Can you write it without sorting?'
          }
        },
        `<div class="recap"><h3>Unit two in a few lines</h3><p>The opening question: a <code>const</code> member function promises not to change the object, and the compiler holds it to that promise: it refuses anything that might, such as <code>[]</code> on a map.</p><ul>
<li>A <code>class</code> is private by default and a <code>struct</code> public; a constructor that needs an argument means every object must be given one; an invariant is kept true by every public function; <code>const</code> marks the functions that only look.</li>
<li>Algorithms take a range and report "not found" with the end position. A lambda captures what it needs: <code>[&amp;total]</code> to change an outside variable. Compare strictly, and use <code>stable_sort</code> when ties must keep their order.</li>
<li><code>m[key]</code> adds a missing key; <code>count</code> and <code>find</code> ask without adding. A <code>map</code> counts, a <code>set</code> keeps distinct items, and the unordered versions give up the order for speed.</li>
<li>Next: the project, where you choose the tool for each piece: a struct, a map, a reference.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3A-AP-13', '3B-AP-14'], standard: 1,
      title: 'Project: a gradebook report', summary: 'Putting the course together: a program that reads scores, keeps a record for each student, and prints a report.',
      blocks: [
        `<p>Every lesson so far has been one idea and two small exercises. Real programs are made of many ideas working together, and the skill that matters then is not knowing one more library function but <em>breaking a task into pieces</em>, each of which you can write and check on its own. This lesson is one larger exercise, with the steps laid out. The standard library does the heavy lifting; your job is to choose the right tools and join them. So where do you begin when a task is bigger than any one idea?</p>
<h2>The task</h2>
<p>A teacher types in scores, one per line, as a name and a number. A student can appear several times. The program prints, for each student in alphabetical order, how many scores they have, their average and their best score; then the class average over every score; then the student with the highest average.</p>
<p>The first line of input is the number of scores, <code>n</code>. For this input:</p><pre class="code">5
bo 80
ada 90
bo 70
cy 100
ada 95</pre><p>the report is:</p><pre class="code">ada: n=2 average=92.5 best=95
bo: n=2 average=75.0 best=80
cy: n=1 average=100.0 best=100
Class average: 87.0
Top student: cy</pre>
<h2>Plan before you type</h2>
<p>Professionals sketch before they code. Here are the questions to ask, with the answers this course has given you.</p>
<div class="tbl-wrap"><table>
<tr><th>question</th><th>answer</th></tr>
<tr><td>What do I need to remember about each student?</td><td>how many scores, their total (for the average), their best. Three numbers that belong together: a <code>struct</code> (lesson 4).</td></tr>
<tr><td>How do I find a student's record from a name?</td><td>a <code>map&lt;string, Record&gt;</code> (lesson 8). It also keeps the names in alphabetical order, which the report needs.</td></tr>
<tr><td>How do I update a record without copying it?</td><td>a reference: <code>Record&amp; r = records[name];</code> (lesson 3).</td></tr>
<tr><td>How do I print one decimal place?</td><td><code>cout &lt;&lt; fixed &lt;&lt; setprecision(1);</code> (<code>setprecision</code> needs <code>&lt;iomanip&gt;</code>). Without <code>fixed</code>, <code>setprecision(1)</code> means one significant digit, and 75.0 prints as 8e+01.</td></tr>
<tr><td>How do I avoid integer division in an average?</td><td>convert one side first: <code>(double)total / count</code> (SC 103, lesson 1).</td></tr>
</table></div>
<p>Build it in three small steps, running after each: first read the scores and print only each student's count (this proves the map and the reference work); then add the total and best; last, the averages and the top student. A program that is correct in small steps is far easier to fix than one written all at once.</p>
<p>Here is the first step to start from.</p>`,
        { play: `#include <iostream>
#include <map>
#include <string>
using namespace std;

struct Record { int count = 0; int total = 0; int best = 0; };

int main() {
    int n;
    cin >> n;
    map<string, Record> records;
    for (int i = 0; i < n; i++) {
        string name;
        int score;
        cin >> name >> score;
        Record& r = records[name];       // a new student starts with the defaults above
        r.count++;
    }
    for (const auto& entry : records) {
        cout << entry.first << ": n=" << entry.second.count << endl;
    }
    return 0;
}`, stdin: '5\nbo 80\nada 90\nbo 70\ncy 100\nada 95', predict: true, caption: 'It prints <code>ada: n=2</code>, <code>bo: n=2</code> and <code>cy: n=1</code>: the map keeps the names in alphabetical order, although bo came first in the input. <code>records[name]</code> makes a fresh Record (with the defaults above) the first time a name is seen, and the reference <code>r</code> lets the loop update it in place. This is step one: extend it in the exercise below.' },
        { check: "Which tool fits \"find a student's record by name\"?", skill: 'choose-container', options: ["A vector searched with a loop", "A map from name to record", "A struct"], answer: 1, wrong: ["That would work, but the loop looks at every record on every score, and you would still have to sort the names yourself. A map finds by key in one step and keeps the names in order, which the report needs.", null, "A struct bundles the three numbers about <em>one</em> student; it cannot find anything by name. Finding by name is the map's job, and the struct is what the map holds."], why: "A map looks up by key in one step. A struct holds what belongs together; a vector is for a sequence." },
        { check: "What do <code>fixed</code> and <code>setprecision(2)</code> do together?", skill: 'format-decimals', options: ["Round to 2 significant figures", "Print exactly 2 digits after the decimal point", "Limit the width to 2 characters"], answer: 1, wrong: ["That is what <code>setprecision(2)</code> does on its own, without <code>fixed</code>: 75.0 prints as <code>75</code> and 1234.5 as <code>1.2e+03</code>. <code>fixed</code> changes what the number counts.", null, "The width of a field is set by <code>setw(n)</code>, a different tool that pads rather than rounds. <code>setprecision</code> counts digits."], why: "fixed switches to fixed-point notation; setprecision then counts digits after the point. setprecision needs &lt;iomanip&gt;; fixed comes with &lt;iostream&gt;." },
        { check: "What should you decide before typing a bigger program?", skill: 'plan-program', options: ["What must be remembered, how it will be found, and what each answer should look like", "Which compiler flags to use", "How many lines it will be"], answer: 0, wrong: [null, "Flags can be changed at any time and do not shape the program. What must be remembered and how it is found decides the data structures, and those are hard to change later.", "Length is a result, not a plan. A shorter program is no better if it remembers the wrong things."], why: "Those three questions pick the data structures and the output format; the code follows from them." },
        {
          ex: {
            id: 'mc-8-1', skill: ['choose-container', 'format-decimals'], title: 'The gradebook report',
            prompt: `<p>Write the program described above. Read <code>n</code>, then <code>n</code> lines of <code>name score</code> (names are one word, scores whole numbers from 0 to 100). Print, for each student in alphabetical order, a line</p><pre class="code">name: n=COUNT average=AVERAGE best=BEST</pre><p>then <code>Class average: X</code> (the average of every score) and <code>Top student: name</code> (the highest average; on a tie, the name that comes first alphabetically). Print every average with exactly one digit after the decimal point.</p>`,
            starter: `#include <iostream>\n#include <iomanip>\n#include <map>\n#include <string>\nusing namespace std;\n\nstruct Record {\n    int count = 0;\n    int total = 0;\n    int best = 0;\n};\n\nint main() {\n    int n;\n    cin >> n;\n    map<string, Record> records;\n    // read the scores into records\n    // print the report\n    return 0;\n}`,
            solution: `#include <iostream>\n#include <iomanip>\n#include <map>\n#include <string>\nusing namespace std;\n\nstruct Record {\n    int count = 0;\n    int total = 0;\n    int best = 0;\n};\n\nint main() {\n    int n;\n    cin >> n;\n    map<string, Record> records;\n    int grandTotal = 0;\n    for (int i = 0; i < n; i++) {\n        string name;\n        int score;\n        cin >> name >> score;\n        Record& r = records[name];\n        if (r.count == 0 || score > r.best) r.best = score;\n        r.count++;\n        r.total += score;\n        grandTotal += score;\n    }\n    cout << fixed << setprecision(1);\n    string top;\n    double topAverage = -1;\n    for (const auto& entry : records) {\n        const Record& r = entry.second;\n        double average = (double)r.total / r.count;\n        cout << entry.first << ": n=" << r.count << " average=" << average << " best=" << r.best << endl;\n        if (average > topAverage) {\n            topAverage = average;\n            top = entry.first;\n        }\n    }\n    cout << "Class average: " << (double)grandTotal / n << endl;\n    cout << "Top student: " << top << endl;\n    return 0;\n}`,
            sampleStdin: '5\nbo 80\nada 90\nbo 70\ncy 100\nada 95',
            hints: ['Work in the three steps from the lesson. First make sure the count per student is right.', 'In the reading loop: Record& r = records[name]; then update r.count, r.total and r.best (the first score of a student is their best so far), and keep a running grand total for the class average.', 'To find the top student, loop over the map once, computing each average as (double)r.total / r.count, and remember the name when the average is strictly greater than the best so far. Strictly greater means the alphabetically first name wins a tie.', 'Put cout << fixed << setprecision(1); before printing the averages.'],
            tests: [
              { name: 'the example', stdin: '5\nbo 80\nada 90\nbo 70\ncy 100\nada 95', expect: 'ada: n=2 average=92.5 best=95\nbo: n=2 average=75.0 best=80\ncy: n=1 average=100.0 best=100\nClass average: 87.0\nTop student: cy' },
              { name: 'one student', stdin: '3\nzed 50\nzed 70\nzed 60', expect: 'zed: n=3 average=60.0 best=70\nClass average: 60.0\nTop student: zed' },
              { name: 'a tie for the top average goes to the earlier name', stdin: '4\nmo 80\nal 90\nmo 90\nal 80', expect: 'al: n=2 average=85.0 best=90\nmo: n=2 average=85.0 best=90\nClass average: 85.0\nTop student: al' },
              { name: 'scores that are not whole averages', stdin: '3\nx 1\nx 2\ny 2', expect: 'x: n=2 average=1.5 best=2\ny: n=1 average=2.0 best=2\nClass average: 1.7\nTop student: y' },
              { name: 'a score of 0 is a real score', stdin: '2\nq 0\nq 0', expect: 'q: n=2 average=0.0 best=0\nClass average: 0.0\nTop student: q' }
            ],
            failTip: 'Check the tie, the integer division (1.5 and 1.7 need doubles) and a student whose only scores are 0.',
            followup: 'Stretch: also print the lowest score in the class and whose it is, or print the students ordered by average, highest first (copy the entries into a vector and sort it with a lambda, lesson 7).'
          }
        },
        {
          ex: {
            id: 'mc-8-2', skill: 'set-distinct', title: 'The honour roll',
            prompt: `<p>The input has the same form as the project: <code>n</code>, then <code>n</code> lines of <code>name score</code>. Print the name of every student who has at least one score of 90 or more, once each, in alphabetical order, one name to a line. If nobody does, print nothing. For</p><pre class="code">5\nbo 80\nada 90\nbo 70\ncy 100\nada 95</pre><p>print</p><pre class="code">ada\ncy</pre>`,
            starter: `#include <iostream>\n#include <set>\n#include <string>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    set<string> honour;\n    // read the scores, keep the names that reach 90, then print them\n    return 0;\n}`,
            solution: `#include <iostream>\n#include <set>\n#include <string>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    set<string> honour;\n    for (int i = 0; i < n; i++) {\n        string name;\n        int score;\n        cin >> name >> score;\n        if (score >= 90) honour.insert(name);\n    }\n    for (const string& name : honour) {\n        cout << name << endl;\n    }\n    return 0;\n}`,
            sampleStdin: '5\nbo 80\nada 90\nbo 70\ncy 100\nada 95',
            hints: ['A name may reach 90 more than once, but must be printed once, and in alphabetical order. Which container from lesson 8 does both for free?', 'In the reading loop, read name and score, and when score >= 90 call honour.insert(name). Inserting a name that is already there does nothing.', 'After the loop, go through the set with for (const string& name : honour) and print each one.'],
            tests: [
              { name: 'the example', stdin: '5\nbo 80\nada 90\nbo 70\ncy 100\nada 95', expect: 'ada\ncy' },
              { name: 'nobody reaches 90', stdin: '3\nx 89\ny 89\nz 0', expect: '' },
              { name: 'a name with two high scores is printed once', stdin: '4\nb 90\nb 95\na 91\nc 10', expect: 'a\nb' },
              { name: 'one student', stdin: '1\nq 90', expect: 'q' },
              { name: 'a high score and a low one for the same name', stdin: '3\nmo 95\nmo 10\nal 100', expect: 'al\nmo' }
            ],
            failTip: 'Check that 90 itself counts, that nobody means no output at all, and that a name appears once however many high scores it has.',
            followup: 'Stretch: print each honour-roll name with their best score, as name: score. A map<string, int> that keeps the highest score seen for each name does it.'
          }
        },
        `<h2>Where to go from here</h2>
<p>You now have the working core of modern C++: text, lists, references, your own types, algorithms, and lookups. The rest of the language is mostly more of the same ideas, in more places. Things worth exploring next, on your own or with a real compiler on your computer: <em>templates</em> (writing a function once for every type, which is how <code>vector&lt;T&gt;</code> itself is made); <em>smart pointers</em> (<code>unique_ptr</code>, which frees memory for you, so that the hand-managed pointers of SC 103 are rarely needed); <em>reading and writing files</em> with <code>&lt;fstream&gt;</code>; <em>exceptions</em>, which this site's compiler does not have but every desktop one does; and the newer features of C++20, <em>ranges</em> and <em>concepts</em>.</p>
<p>The best next step is to take a program you have already written, in any of this site's courses, and rewrite it in this style. Where you wrote a loop to find a maximum, call <code>max_element</code>. Where you kept three parallel lists, write a <code>struct</code>. Where a function copied a big vector, put a <code>const&amp;</code> on it. That is exactly what the next generation of programmers does to the code of the last.</p>
<div class="recap"><h3>In this lesson</h3><p>The opening question: begin by asking what must be remembered, how it will be found and what the answer should look like, then build and run it in small steps.</p><ul>
<li>A bigger program is built from small steps you can run and check, and from choosing the right tool for each piece: a <code>struct</code> for what belongs together, a <code>map</code> for lookup by name, a reference to update in place.</li>
<li><code>fixed</code> and <code>setprecision(n)</code> (the second from <code>&lt;iomanip&gt;</code>) control how many digits are printed after the decimal point.</li>
<li>Ask first, then type: what must be remembered, how it will be found, and what each answer needs to look like.</li>
</ul></div>`
      ]
    }
  ]
});
