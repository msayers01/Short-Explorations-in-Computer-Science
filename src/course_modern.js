// Lesson content, (c) 2026 Michael Sayers, licensed CC BY-SA 4.0 (see LICENSE-CONTENT.md).
// This course runs on the Full C++ engine (a real compiler; see src/runner.js, CLANGRUN), not on the small interpreter the other C++ course uses.
window.COURSES = window.COURSES || [];
window.COURSES.push({
  id: 'modern', code: 'SC 105', short: 'Modern C++', lang: 'cpp', runtime: 'full',
  title: 'Modern C++',
  grades: 'Grades 11–12 · after Introduction to C++',
  audience: `<p><b>Grades 11–12</b>, after <em>Introduction to C++</em> (SC 103), or after any course where you have met types, loops, functions and pointers. This is the C++ that working programmers write today: strings and lists that look after themselves, references instead of most pointers, and your own types. If SC 103 showed you what the machine is doing, this course shows you how to stop doing it by hand.</p><p>Each lesson stands on its own and has two graded exercises.</p>`,
  tagline: 'Strings, vectors and references: the parts of the standard library that make C++ pleasant to use.',
  description: `<p>The first C++ course on this site ran on a small interpreter, which was enough for types, memory and pointers but could not do what real C++ programs do all day: hold text in a <code>std::string</code>, keep a growing list in a <code>std::vector</code>, hand a big object to a function without copying it. This course uses a <b>real compiler</b> (Clang, the compiler behind Apple's developer tools and Android's native code), running inside your browser.</p>
<p>The first time you run a program here your browser downloads that compiler: about 28 MB, once. After that it is kept on your device, and nothing you write ever leaves it. Only this course and the <b>Full C++</b> choice in the Code Lab need the download; everything else on the site works without it, even offline.</p>`,
  outcomes: [
    'Use std::string to read, build, search and compare text',
    'Keep collections in a std::vector and walk them with a range-based for loop',
    'Explain the difference between a copy and a reference, and choose between passing by value, by reference and by const reference',
    'Read the messages a real compiler gives, including its warnings'
  ],
  howItWorks: `<h3>How to use these pages</h3><p>Press <b>Run</b> on any example. The first time, you are asked to let your browser download the compiler (about 28 MB, kept after that). Real compilers take a moment: expect a second or two between pressing Run and seeing output. If the compiler has something to say about your program, its warnings and errors appear above the output, exactly as a professional would see them.</p><p>Exercises are checked by compiling your program once and running it on hidden inputs. Where an exercise asks for a function, write only the function: the checker supplies its own <code>main</code> to call it. Your work is saved in this browser.</p>`,
  lessons: [
    /* ================================================================== */
    {
      title: 'Text that looks after itself', summary: 'std::string: reading, building, searching and comparing text, and why it replaced the character arrays of the first C++ course.',
      blocks: [
        `<p>On the evening of 2 November 1988, a graduate student at Cornell named Robert Tappan Morris released a small program onto the Internet, which then connected only about sixty thousand computers. Within a day it had infected roughly one in ten of them and forced many to be taken offline. One of the ways it got in was through a program called <code>fingerd</code>, which read a line of text sent over the network into a fixed-size array of characters, without checking that the line fit. Morris sent a line that was too long. The extra characters spilled past the end of the array and overwrote whatever lay next to it in memory, and the overwritten memory held instructions that Morris's program had chosen.</p>
<p>That is the bug you met in the first C++ course as "an array index went past the end". With a <code>char</code> array you decide the size in advance, you must keep track of how much of it is used, and nothing stops you writing past the end. For three decades this kind of mistake has been among the most common causes of security holes in C and C++ programs. The standard library's answer is a type that owns its characters and grows when it needs to: <code>std::string</code>.</p>
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
}`, caption: 'Strings grow as you add to them; there is no size to choose and nothing to overflow. Change the message and run it again.' },
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
}`, caption: 'substr(start) with one argument takes everything from start to the end. Try a line with no = in it.' },
        `<p>The type of <code>eq</code> is worth a second look. <code>size_t</code> is an <em>unsigned</em> whole number: it cannot be negative. Every <code>size()</code> and <code>find()</code> in the library returns one. That is almost always fine, with one famous trap.</p>
<div class="stmt"><p><span class="kind">Trap.</span> If <code>s</code> is empty, <code>s.size() - 1</code> is not −1. An unsigned number cannot go below 0, so it wraps round to the largest number there is: about four billion in the compiler used on this site, and far more on a modern computer. A loop that runs "to the last character" with <code>i &lt;= s.size() - 1</code> then runs past the end of an empty string. Write <code>i + 1 &lt; s.size()</code>, or convert first with <code>(int)s.size() - 1</code>.</p></div>
<p>The compiler can warn you about some comparisons between signed and unsigned numbers. Compiler output on this site includes warnings, so read them: in a real project, a clean build with no warnings is the normal standard.</p>
<h2>Reading text</h2>
<p><code>cin &gt;&gt; word</code> reads one <em>word</em>: it skips spaces and stops at the next one. To read a whole line, spaces included, use <code>getline</code>.</p>`,
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
}`, stdin: 'Margaret Heafield Hamilton', caption: 'Notice the space at the start of the rest: cin stopped just before it, so getline began there.' },
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
}`, caption: 'The casts to unsigned char are the careful way to call the cctype functions; for plain English text you will see them written without.' },
        { aside: `<p><b>Common mistakes in this lesson.</b> Adding two string literals: <code>"a" + "b"</code> does not compile, because neither side is a <code>string</code>; make one a <code>string</code> first. Forgetting <code>#include &lt;string&gt;</code>, which sometimes works by accident and then fails on another computer. Mixing up <code>'x'</code> (one character) and <code>"x"</code> (a string). Using <code>s[i]</code> with an <code>i</code> that is too large: no error, just wrong answers.</p>` },
        {
          ex: {
            id: 'mc-1-1', title: 'Initials',
            prompt: `<p>Read one line holding a person's name, with any number of words, and print the first letter of each word in capitals, with nothing between them. For <code>grace brewster hopper</code> print <code>GBH</code>.</p><p>Use <code>getline</code> to read the whole line. Words are separated by spaces; there may be extra spaces, including at the start of the line.</p>`,
            starter: `#include <iostream>\n#include <string>\n#include <cctype>\nusing namespace std;\n\nint main() {\n    string name;\n    getline(cin, name);\n    string initials;\n    // your code here\n    cout << initials << endl;\n    return 0;\n}`,
            solution: `#include <iostream>\n#include <string>\n#include <cctype>\nusing namespace std;\n\nint main() {\n    string name;\n    getline(cin, name);\n    string initials;\n    bool atStart = true;\n    for (char c : name) {\n        if (c == ' ') {\n            atStart = true;\n        } else {\n            if (atStart) initials += static_cast<char>(toupper(static_cast<unsigned char>(c)));\n            atStart = false;\n        }\n    }\n    cout << initials << endl;\n    return 0;\n}`,
            sampleStdin: 'grace brewster hopper',
            hints: ['Keep a bool, say atStart, that is true when the next letter you see begins a word. It starts true.', 'Go through the line with for (char c : name). A space sets atStart to true. Any other character: if atStart is true, add its capital to initials, then set atStart to false.', 'To make a capital use toupper(c) from <cctype>; to add a character to the end of a string use initials += ...'],
            tests: [{ stdin: 'grace brewster hopper', expect: 'GBH' }, { stdin: 'alan turing', expect: 'AT' }, { stdin: 'ada', expect: 'A' }, { stdin: '  margaret   hamilton ', expect: 'MH' }, { stdin: 'Katherine Johnson', expect: 'KJ' }],
            failTip: 'Check the extra spaces: a space before or between words must not produce a letter, and each word must give exactly one.'
          }
        },
        {
          ex: {
            id: 'mc-1-2', title: 'Palindromes',
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
            failTip: 'Check the two odd cases, the empty string and a one-letter string: both are palindromes.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li><code>std::string</code> (from <code>&lt;string&gt;</code>) owns its characters and grows as needed, so the overflow bugs of fixed character arrays do not arise. <code>==</code> compares the text.</li>
<li><code>size()</code>, <code>s[i]</code>, <code>substr(start, count)</code> and <code>find(t)</code> do most of the work; <code>find</code> says "not found" with <code>string::npos</code>.</li>
<li><code>size()</code> is unsigned: <code>s.size() - 1</code> on an empty string is enormous, not −1.</li>
<li><code>cin &gt;&gt; word</code> reads one word; <code>getline(cin, line)</code> reads a whole line. <code>for (char c : s)</code> goes through every character.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Lists that grow', summary: 'std::vector: a sequence that can grow and shrink, the range-based for loop, and what happens when an index is out of range.',
      blocks: [
        `<p>In the early 1990s Alexander Stepanov, a mathematician turned programmer working at Hewlett-Packard, had an unfashionable idea: that the tools for sorting, searching and storing data should be written once, for every kind of data, and be as fast as hand-written code. With his colleague Meng Lee he built a library on that idea. It was adopted into the C++ standard in 1998 and is still called, after its origin, the Standard Template Library. Its most-used part is the <code>vector</code>.</p>
<p>In SC 103 you stored a list in an array, <code>int scores[5]</code>, whose size was fixed when you wrote the program. Real programs rarely know in advance how much data there will be: how many lines a file has, how many students are in a class, how many numbers a user will type. A <code>vector</code> is an array that remembers its own size and can grow.</p>
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
}`, caption: 'push_back adds to the end and the vector makes room. Some compilers warn about comparing i with scores.size(), a signed with an unsigned number: that is the point from the last lesson.' },
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
}`, caption: 'Read "for (string name : languages)" as "for each name in languages". The word auto asks the compiler to fill in the type it can already see.' },
        `<p>Reading numbers until there are no more is the other everyday job. <code>cin &gt;&gt; x</code> is itself a yes-or-no question: it is true if it managed to read a value, and false when the input has run out or holds something that is not a number, so it can be the condition of a <code>while</code>.</p>`,
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
}`, stdin: '12 7 31 5 19', caption: 'The program does not need to be told how many numbers there are: it keeps reading until the input ends. What happens if there are none?' },
        `<h2>Going out of range</h2>
<p>An array in SC 103 had a fixed size and the interpreter told you when an index was too big. A real compiler does not check <code>v[i]</code>: if <code>i</code> is out of range the program carries on, reading or overwriting whatever memory happens to be there. That is called <em>undefined behaviour</em>: the language promises nothing about what happens, and a program that does it may seem fine on Tuesday and crash on Wednesday. This is exactly what happened in the Morris worm.</p>
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
        { aside: `<p><b>Common mistakes in this lesson.</b> Taking <code>back()</code> or <code>numbers[0]</code> of an empty vector. Using <code>v[i]</code> where <code>i == v.size()</code>: the last valid position is <code>size() - 1</code>. Changing a vector while a range-based for loop is going through it (adding or removing items): the loop can end up looking at memory that has moved. Forgetting <code>#include &lt;vector&gt;</code>.</p>` },
        {
          ex: {
            id: 'mc-2-1', title: 'Backwards',
            prompt: `<p>The first line of input is a whole number <code>n</code>. The next <code>n</code> numbers follow, separated by spaces or line breaks. Read them into a vector and print them in reverse order, on one line, separated by single spaces. For the input <code>4</code> then <code>10 20 30 40</code> print <code>40 30 20 10</code>.</p>`,
            starter: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> v;\n    // read n numbers into v, then print them in reverse\n    return 0;\n}`,
            solution: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> v;\n    for (int i = 0; i < n; i++) {\n        int x;\n        cin >> x;\n        v.push_back(x);\n    }\n    for (int i = (int)v.size() - 1; i >= 0; i--) {\n        cout << v[i];\n        if (i > 0) cout << " ";\n    }\n    cout << endl;\n    return 0;\n}`,
            sampleStdin: '4\n10 20 30 40',
            hints: ['A for loop that runs n times, reading one int into x and calling v.push_back(x), fills the vector.', 'To go backwards, start at the last position and count down: for (int i = (int)v.size() - 1; i >= 0; i--).', 'Print a space after every number except the last, or simply print one after each: spaces at the end of a line do not matter to the checker.'],
            tests: [{ stdin: '4\n10 20 30 40', expect: '40 30 20 10' }, { stdin: '1\n7', expect: '7' }, { stdin: '5\n5 4 3 2 1', expect: '1 2 3 4 5' }, { stdin: '3\n-1 0 1', expect: '1 0 -1' }],
            failTip: 'Check a one-number input, and that nothing is printed for the numbers before reversing.'
          }
        },
        {
          ex: {
            id: 'mc-2-2', title: 'Keep the evens',
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
            failTip: 'Check that the order is kept, that zero and negative even numbers count, and that an empty input gives an empty result.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li><code>vector&lt;T&gt;</code> (from <code>&lt;vector&gt;</code>) is a list of <code>T</code>s that remembers its size and grows with <code>push_back</code>.</li>
<li><code>for (auto item : v)</code> visits every item; use an index loop only when you need the position.</li>
<li><code>cin &gt;&gt; x</code> is true while it can still read a value, so <code>while (cin &gt;&gt; x)</code> reads until the input ends.</li>
<li><code>v[i]</code> is not checked: an index out of range is undefined behaviour. <code>v.at(i)</code> is checked and stops the program with an error.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      title: 'Another name for a variable', summary: 'References: how a function can change its caller’s variable, and how to pass a big object without copying it.',
      blocks: [
        `<p>Here is a function that tries to swap two numbers. It looks right. Run it.</p>`,
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
}`, caption: 'It prints 3 and 8: nothing was swapped. Why?' },
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
}`, caption: 'One variable, two names. The last line asks whether the two names are at the same address in memory.' },
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
}`, caption: 'One character added to each parameter, and the swap now reaches the caller. The call itself, swapInts(x, y), looks exactly the same.' },
        `<p>There is a second reason to use references, and it matters even when the function changes nothing. Copying a <code>vector</code> or a <code>string</code> copies every element, which is slow if there are a million of them. A reference passes the object without copying it.</p>
<div class="stmt"><p><span class="kind">Rule (which way to pass).</span>
<br><b>Small value, function only reads it</b> (<code>int</code>, <code>double</code>, <code>char</code>, <code>bool</code>): pass by value, <code>int n</code>.
<br><b>Big object, function only reads it</b> (<code>string</code>, <code>vector</code>): pass by <em>const reference</em>, <code>const vector&lt;int&gt;&amp; v</code>. No copy, and the compiler refuses any attempt to change it.
<br><b>Function must change the caller's variable</b>: pass by reference, <code>vector&lt;int&gt;&amp; v</code>.</p></div>`,
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
}`, caption: 'Look at the loop in addTen. Without the & on x, each x is a copy and the vector would not change. Try removing it.' },
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
        { aside: `<p><b>Common mistakes in this lesson.</b> Forgetting the <code>&amp;</code> and wondering why the caller's variable did not change. Writing <code>&amp;</code> but then passing a plain number such as <code>swapInts(3, 4)</code>: a reference needs a variable to name. Returning a reference to a local variable. Passing a huge <code>vector</code> by value in a function that is called in a loop.</p>` },
        {
          ex: {
            id: 'mc-3-1', title: 'A swap that works',
            prompt: `<p>Write a function <code>void swapInts(int&amp; a, int&amp; b)</code> that swaps the values of the two variables it is given. After <code>int x = 3, y = 8; swapInts(x, y);</code>, <code>x</code> is 8 and <code>y</code> is 3. Write only the function; the checker supplies <code>main</code>.</p>`,
            prelude: '#include <iostream>\nusing namespace std;\n',
            starter: `void swapInts(int a, int b) {\n    int temp = a;\n    a = b;\n    b = temp;\n}`,
            solution: `void swapInts(int& a, int& b) {\n    int temp = a;\n    a = b;\n    b = temp;\n}`,
            hints: ['The starter swaps correctly, but on copies. What one character, added in two places, makes a and b names for the caller’s variables?', 'Put & after int in both parameters: int& a, int& b.'],
            tests: [
              { name: 'swapInts(x, y) with x = 3, y = 8', main: '        int x = 3, y = 8;\n        swapInts(x, y);\n        cout << x << " " << y << endl;', expect: '8 3' },
              { name: 'swapInts(x, y) with x = -1, y = 1', main: '        int x = -1, y = 1;\n        swapInts(x, y);\n        cout << x << " " << y << endl;', expect: '1 -1' },
              { name: 'swapInts(x, x): the same variable twice', main: '        int x = 5;\n        swapInts(x, x);\n        cout << x << endl;', expect: '5' },
              { name: 'swapInts on two items of a vector', main: '        int v[3] = {10, 20, 30};\n        swapInts(v[0], v[2]);\n        cout << v[0] << " " << v[1] << " " << v[2] << endl;', expect: '30 20 10' }
            ],
            failTip: 'If the numbers come out unchanged, the function is still working on copies.'
          }
        },
        {
          ex: {
            id: 'mc-3-2', title: 'Double them in place',
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
            failTip: 'If the numbers are unchanged, the loop is changing copies of the items.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>Arguments are copied into parameters. A function that changes its own copy changes nothing for the caller.</li>
<li><code>int&amp; r = x;</code> makes <code>r</code> another name for <code>x</code>. A reference is always bound, cannot be re-bound and is never null.</li>
<li>Pass small values by value, big objects you only read by <code>const&amp;</code>, and anything the function must change by <code>&amp;</code>.</li>
<li><code>for (int&amp; x : v)</code> lets a loop change the items; <code>for (const auto&amp; x : v)</code> avoids copying big ones.</li>
<li>Never return a reference to a local variable: it no longer exists when the function ends.</li>
</ul></div>`
      ]
    }
  ]
});
