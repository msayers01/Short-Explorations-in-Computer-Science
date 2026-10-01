/* The teacher guide, (c) 2026 Michael Sayers, licensed CC BY-SA 4.0 (see LICENSE-CONTENT.md).
   One HTML string, rendered at #/guide inside the site and written by build.js as dist/teacher-guide.html for
   printing. Keep it in plain language; its readers are teachers who have never programmed. */
window.GUIDE = (function () {
  const html = `
<header class="g-hero">
  <p class="g-kicker">Short Explorations in Computer Science</p>
  <h1>A guide for teachers</h1>
  <p class="g-lede">How to run a class with this site. You do not need to know how to program: every lesson explains itself, checks answers itself, and gives hints. Your job is the one you already do.</p>
  <nav class="g-toc" aria-label="Contents">
    <a href="#g-0">Start here</a>
    <a href="#g-1">1. How the site works</a>
    <a href="#g-2">2. The courses</a>
    <a href="#g-3">3. Inside a lesson</a>
    <a href="#g-4">4. An hour of coding</a>
    <a href="#g-5">5. Projecting a lesson</a>
    <a href="#g-6">6. The Code Lab</a>
    <a href="#g-7">7. Assignments</a>
    <a href="#g-8">8. Portfolios</a>
    <a href="#g-9">9. Saving and moving work</a>
    <a href="#g-10">10. When something goes wrong</a>
    <a href="#g-11">11. Quick reference</a>
  </nav>
</header>

<section id="g-0">
  <h2>Start here</h2>
  <div class="g-steps">
    <div class="g-step"><span class="g-num">1</span><div><b>Open the site on a student computer and press Run on any "Try it" box.</b><p>If something prints, everything works. The first load takes a few seconds; after that it is fast.</p></div></div>
    <div class="g-step"><span class="g-num">2</span><div><b>Do Python lesson 1 yourself.</b><p>About forty minutes. You will meet everything a student meets: a runnable example, a prediction box, a graded exercise, a hint, a solution.</p></div></div>
    <div class="g-step"><span class="g-num">3</span><div><b>Give students the address.</b><p>On the board, in Google Classroom, or as a QR code. Then run the hour-of-coding plan in section 4.</p></div></div>
  </div>
  <p>That is enough for a first class. The rest of this guide covers the tools you may want later: projecting a lesson, the Code Lab, setting your own assignments, and collecting students' work.</p>
</section>

<section id="g-1">
  <h2>1. How the site works</h2>
  <p>The site is one web page. It runs entirely inside the browser: nothing is installed, nobody signs in, and nothing about a student is sent anywhere. Three things follow from that.</p>
  <ul class="g-list">
    <li><b>It works wherever a browser works.</b> A school laptop, a Chromebook, a phone, a computer that lost its internet after the page loaded, even a copy on a USB stick. (One exception: <em>Modern C++</em> and the <em>Full C++</em> choice in the Code Lab download a real compiler once, about 28 MB, and need the site opened from a web address.)</li>
    <li><b>Work is saved on the device, not in an account.</b> A student who uses the same computer sees their progress next time. A student who switches computers starts fresh there, unless they take their work along (section 9).</li>
    <li><b>Work moves between people as links.</b> Your assignment is a link. A student's submission is a link. Share them the way your class already shares things.</li>
  </ul>
  <p>If a parent or administrator asks what the site keeps about students, the <a href="#/about">About page</a> answers in plain language.</p>
  <aside class="g-callout"><b>Shared computers.</b> Students who share a machine see each other's progress. Give each student a Code Lab file named after them (section 6), and use "Reset my progress" (bottom of the home page) only when the whole class has finished.</aside>
</section>

<section id="g-2">
  <h2>2. The courses</h2>
  <p>Every lesson is self-contained and sized for one class period. Lessons build on each other, so go in order when you can.</p>
  <table class="g-table">
    <thead><tr><th>Course</th><th>Who it is for</th><th>What students do</th></tr></thead>
    <tbody>
      <tr><td><b>SC 100 From Scratch to Python</b><br><span class="g-muted">3 lessons so far</span></td><td>Grades 5–8, after Scratch. For a class moving from blocks to text.</td><td>See every block they know beside the Python line that does the same; make the sprite a turtle; say, ask, variables, repeat and forever, all with short programs that draw and talk.</td></tr>
      <tr><td><b>SC 101 Introduction to Python</b><br><span class="g-muted">13 lessons</span></td><td>Grades 8–12. No experience needed. Start here.</td><td>Write programs that decide, repeat and keep lists; find and fix bugs; run a random simulation; build a working cipher.</td></tr>
      <tr><td><b>SC 102 Introduction to Lisp</b><br><span class="g-muted">11 lessons</span></td><td>Grades 11–12, or a strong 10th grader, after Python.</td><td>Think in expressions and recursion, watch a language evaluate code step by step, and build a program that differentiates algebra.</td></tr>
      <tr><td><b>SC 103 Introduction to C++</b><br><span class="g-muted">11 lessons</span></td><td>Grades 10–12, after Python or with some experience.</td><td>Meet types, pointers and arrays; see what happens under the hood; finish with a prime-number sieve.</td></tr>
      <tr><td><b>SC 104 The Mathematics of Computing</b><br><span class="g-muted">13 lessons</span></td><td>Grades 10–12, or a strong 9th grader, after Python. Algebra only.</td><td>Logic, sets, proof, number theory, graphs, machines with finite memory, what no program can compute, and how codes work. Most of its exercises are written answers, not programs.</td></tr>
      <tr><td><b>SC 105 Modern C++</b><br><span class="g-muted">8 lessons</span></td><td>Grades 11–12, after SC 103.</td><td>Strings, vectors, classes, algorithms and maps with a real compiler. Needs the one-time download and a web address.</td></tr>
      <tr><td><b>SC 106 Introduction to Java</b><br><span class="g-muted">4 lessons so far</span></td><td>Grades 10–12, after Python or with some experience. The language of AP Computer Science A.</td><td>Read the compiler’s messages, declare typed variables, make decisions, read input, write loops and methods. Checked with the real compiler’s own error messages, in the browser.</td></tr>
      <tr><td><b>SC 107 Data Structures and Algorithms</b><br><span class="g-muted">3 lessons so far</span></td><td>Grades 11–12, after Java or C++. The second course of every computer science degree.</td><td>Count the cost of code and name its order of growth; arrays and growing arrays; binary search; selection and insertion sort. Every structure as a figure to step through, code to write and a count to predict.</td></tr>
    </tbody>
  </table>
  <p>Courses marked <b>Under development</b> on the site (From Scratch to Python, Modern C++, Java, Data Structures and Algorithms) are being written: their lessons are complete and checked, but more are coming and details may change.</p>
  <p><b>Suggested paths.</b> A one-semester elective: Python, then the mathematics course. A two-year sequence adds C++, Java and Lisp. A single Hour of Code event: Python lesson 1 alone.</p>
  <p><b>Lesson length.</b> Programming lessons take 45–60 minutes. Mathematics lessons take 60–90, because proofs are read slowly. Any lesson likely to run past an hour is marked "Longer than an hour" in its course list, with an estimate; split it over two periods.</p>
</section>

<section id="g-3">
  <h2>3. Inside a lesson</h2>
  <p>Every lesson has the same parts in the same order, so students learn the routine once.</p>
  <dl class="g-parts">
    <dt>Explanation</dt><dd>Short paragraphs that state each rule before showing it.</dd>
    <dt>Try it</dt><dd>A small program with a caption saying what to look for and what to change. Press Run, change something, run again. <em>Open in Code Lab</em> is there for students who want to keep going.</dd>
    <dt>Predict, then reveal</dt><dd>A question with a hidden answer. Ask students to commit to a prediction before they open it.</dd>
    <dt>Common mistakes</dt><dd>A box near the end listing the errors students make in this lesson. Read it before class: it is the list of things you will be asked about.</dd>
    <dt>Exercises</dt><dd>Two graded tasks. <em>Check answer</em> runs tests and says which passed. <em>Hint</em> gives hints one at a time. <em>Solution</em> shows a worked answer after two attempts. A green checkmark marks completion.</dd>
    <dt>In this lesson</dt><dd>A recap box. It doubles as an exit ticket: ask students to say one line of it back in their own words.</dd>
  </dl>
</section>

<section id="g-4">
  <h2>4. An hour of coding</h2>
  <p>A plan that works for any lesson.</p>
  <table class="g-table g-plan">
    <tbody>
      <tr><td class="g-time">0–5</td><td><b>Open the lesson together.</b> Read the summary line under the title aloud.</td></tr>
      <tr><td class="g-time">5–20</td><td><b>Do the explanation and the first two "Try it" boxes as a class</b>, projected (section 5). Have a student read the caption, predict, run, change one thing. Ask "what do you think this line does?" and let the Run button settle it.</td></tr>
      <tr><td class="g-time">20–40</td><td><b>Students continue alone or in pairs.</b> In a pair, one types and one reads the caption and the error messages; they swap at each "Try it". When a student is stuck, ask them to read the failed test aloud and to press Hint before asking you.</td></tr>
      <tr><td class="g-time">40–55</td><td><b>Exercises.</b> Most students finish the first; strong students finish both and can extend it in the Code Lab or help a neighbour.</td></tr>
      <tr><td class="g-time">55–60</td><td><b>Recap.</b> Read the "In this lesson" box. Ask for the mistake they made and how they found it.</td></tr>
    </tbody>
  </table>
  <ul class="g-list">
    <li>Error messages are the lesson, not an interruption. Python lesson 2 teaches how to read them.</li>
    <li>When a program does nothing, ask "what did you expect?" and then "which line should have done that?"</li>
    <li>The Solution button is not cheating. Comparing a worked answer with your own attempt teaches more than staring at a blank box.</li>
    <li>You do not need to know the answer. "Let's read the hint together" and "let's run it and see" are complete responses.</li>
  </ul>
</section>

<section id="g-5">
  <h2>5. Projecting a lesson: classroom mode</h2>
  <p>The button with a small screen on it, next to the light/dark switch, turns on <em>classroom mode</em>: large type, darker grey text, and the lesson list hidden so the lesson fills the screen. A bar at the bottom moves through the lesson one step at a time, with a coloured line in the margin showing where the class is.</p>
  <dl class="g-parts">
    <dt>Moving</dt><dd><em>Next</em> and <em>Back</em>, or the arrow keys, Page Up/Down, Space. A presentation clicker works. Click any paragraph to move the marker there.</dd>
    <dt>Reveal and Run</dt><dd>When the marker is on a "Predict" box or a "Try it" box, Enter reveals the answer or runs the program.</dd>
    <dt>Spotlight</dt><dd>Dims everything but the current step, so nobody reads ahead to the answer.</dd>
    <dt>Timer and Blank</dt><dd>A thinking timer of 1 to 5 minutes; B blanks the screen when you want everyone looking at you.</dd>
    <dt>A−, A+</dt><dd>Smaller or larger type for your room.</dd>
  </dl>
</section>

<section id="g-6">
  <h2>6. The Code Lab</h2>
  <p>The Code Lab (top bar, or the card on the home page) is where students write their own programs in Python, C++, Java or Scheme. It has files with names, an editor with completion and search, and tools the lesson boxes do not have.</p>
  <dl class="g-parts">
    <dt>Files</dt><dd>Each language keeps its own files as tabs. <em>+ New</em> makes one; <em>Rename</em> is under the editor. Files are saved on the device automatically.</dd>
    <dt>Run and Stop</dt><dd><em>Run</em> (or Ctrl+Enter) runs the current file. Programs that ask for input show a box. <em>Stop</em> ends a stuck program; one that runs too long stops itself after a few seconds.</dd>
    <dt>Step through (Python)</dt><dd>Runs the program one line at a time, showing every variable. The most useful tool for a student who cannot see why a loop does what it does.</dd>
    <dt>Step through memory (C++)</dt><dd>Runs the program one line at a time and draws its memory: every variable with its address and value, arrays cell by cell, and which variable a pointer points at. Students can step backwards too. Every C++ example has a button that opens it here.</dd>
    <dt>Turtle (Python), REPL and Substitution (Scheme)</dt><dd>A program that begins with <code>import turtle</code> gets a drawing canvas. For Scheme, the REPL lets students try one expression at a time, and <em>Substitution</em> shows an expression being rewritten step by step.</dd>
    <dt>Templates and Reference</dt><dd>Small starting programs, and a one-page cheat sheet for the current language.</dd>
    <dt>Share, Open, Save</dt><dd><em>Share link</em> copies a link that carries the program. <em>Save</em> downloads the file; <em>Open</em> loads one.</dd>
    <dt>From a lesson</dt><dd>Every exercise has <em>Open in Code Lab</em>. A file opened that way keeps a <em>Check against the exercise</em> button, and passing there counts in the course.</dd>
  </dl>
  <aside class="g-callout"><b>Phones and tablets.</b> Everything works on a touch screen. <em>Indent</em> and <em>Outdent</em> buttons stand in for the Tab key, and <em>Wrap</em> keeps long lines on screen.</aside>
</section>

<section id="g-7">
  <h2>7. Assignments</h2>
  <p>You can set your own tasks, with tests that check students' programs, and collect their work, all without a server. Tick <em>Teacher tools</em> at the top of the Code Lab. There is no password; the switch only keeps the teacher's buttons out of students' way.</p>
  <h3>Make one</h3>
  <div class="g-steps">
    <div class="g-step"><span class="g-num">1</span><div><b>Assignments, then + New assignment.</b><p>Title, language, instructions in plain text. (Blank lines make paragraphs, lines starting with "- " make a list, backticks make code.)</p></div></div>
    <div class="g-step"><span class="g-num">2</span><div><b>Starter code.</b><p>Type it, or write it in the editor and press "Use the editor code as the starter".</p></div></div>
    <div class="g-step"><span class="g-num">3</span><div><b>Tests.</b><p><em>Input → output</em>: the program is run with the input you give and must print exactly what you give. <em>Call → value</em>: for a task where students write a function, give a call such as <code>is_leap(2024)</code> and the value it should return. Tick <em>Hidden</em> for tests students should not see.</p></div></div>
    <div class="g-step"><span class="g-num">4</span><div><b>Check your tests.</b><p>Write a correct solution in the editor and press "Run tests on the editor code". If it does not pass, a test is wrong; fix it now rather than in front of the class.</p></div></div>
    <div class="g-step"><span class="g-num">5</span><div><b>Save.</b><p>You get a link and a QR code. Post the link, or show the code on the projector. Hints and a class roster (one name per line) are optional; with a roster, the grade book shows who has not submitted.</p></div></div>
  </div>
  <h3>Collect and review</h3>
  <div class="g-steps">
    <div class="g-step"><span class="g-num">1</span><div><b>Students open your link.</b><p>It puts the task in their Code Lab with a <em>Check</em> button for the visible tests and a <em>Submit</em> button. Submit asks their name and gives them a <em>submission link</em>, which they send you.</p></div></div>
    <div class="g-step"><span class="g-num">2</span><div><b>Open the submission link</b>, or paste several into the box on the Assignments screen and press Review.<p>All tests, hidden ones included, run on your computer. You see which passed and the student's code, with the lines they changed marked.</p></div></div>
    <div class="g-step"><span class="g-num">3</span><div><b>Grade book.</b><p>Every student, when they submitted, how many tests passed, who is missing. <em>Export CSV</em> opens in any spreadsheet.</p></div></div>
  </div>
  <aside class="g-callout g-warn"><b>Back up your assignments.</b> They live only in the browser you made them in. After making one, press <em>Back up all</em> and keep the link it gives you (email it to yourself), or use "Save my work to a file" on the home page with the teacher box ticked.</aside>
  <p><b>Can a student fake a result?</b> No: the result is computed on your machine from your copy of the tests. They can submit someone else's program, as with any homework; the view of what changed from the starter and a short conversation usually settle it.</p>
</section>

<section id="g-8">
  <h2>8. Portfolios</h2>
  <p>A <em>portfolio</em> is one document with every exercise a student has completed, their code or answers, and the date. The link is on the home page under "Your work" and on every course page.</p>
  <div class="g-steps">
    <div class="g-step"><span class="g-num">1</span><div><b>The student types their name</b> and chooses what to include: unfinished exercises, the task text, Code Lab programs.</div></div>
    <div class="g-step"><span class="g-num">2</span><div><b>They hand it in</b> as a printout or PDF, as a saved web page, or as a link for you.</div></div>
    <div class="g-step"><span class="g-num">3</span><div><b>You open the link</b> and press <em>Check every exercise on this computer</em>. Each exercise's own tests run on your machine, so a checkmark never has to be taken on trust.</div></div>
  </div>
</section>

<section id="g-9">
  <h2>9. Saving and moving work</h2>
  <p>Because work is saved on the device, students sometimes need to carry it elsewhere. There are three ways, all on the home page or in the Code Lab.</p>
  <ul class="g-list">
    <li><b>Save my work to a file</b> (home page, under "Your work") saves everything on the device to one file; <b>Restore from a file</b> loads it on another computer. Teachers can tick the box that adds assignments and the grade book. The file holds code and names, so keep it private.</li>
    <li><b>A portfolio</b> (section 8) keeps a record of completed work.</li>
    <li><b>Share link</b> in the Code Lab carries one program.</li>
  </ul>
  <p><b>Reset my progress</b>, at the bottom of the home page, clears everything on that device. Save to a file first.</p>
</section>

<section id="g-10">
  <h2>10. When something goes wrong</h2>
  <dl class="g-faq">
    <dt>"My progress disappeared."</dt><dd>Progress is saved per device and per browser. The student is on a different computer or browser, or in a private window, or someone pressed Reset. There is no server to recover from. Have students save their work to a file (section 9) before changing computers.</dd>
    <dt>"It stops with a red message."</dt><dd>That is an error message, and it names the line. In the Code Lab every message has a plain explanation under it and a "go to line" link. Python lesson 2 and Java lesson 1 teach how to read them.</dd>
    <dt>"Time limit exceeded."</dt><dd>The program ran too long, almost always a loop that never ends. Look at the loop's condition.</dd>
    <dt>"The answer is right but the checker says no."</dt><dd>The output differs in a small way: a missing space, a full stop, a capital, or <code>5</code> where <code>5.0</code> was expected. Compare expected and actual character by character.</dd>
    <dt>"Save does nothing."</dt><dd>Some managed browsers block downloads. Use Share link instead.</dd>
    <dt>"The link is too long for a QR code."</dt><dd>QR codes hold about 3,000 characters. Shorten the instructions or starter code, or share the link itself.</dd>
    <dt>"A link won't open."</dt><dd>Very old browsers (Safari before 2023) cannot read the compressed links. Use a current browser.</dd>
    <dt>"C++ or Java says something is not supported."</dt><dd>The interpreters inside the browser cover what the courses teach: C++ without <code>std::string</code>, <code>vector</code> or classes (Full C++ has them), Java without lambdas or your own generic classes. Students who read ahead sometimes wander out of the subset; the Reference panel in the Code Lab lists what works.</dd>
    <dt>"Can I change a lesson?"</dt><dd>Yes. The README and ARCHITECTURE files in the project explain where each lesson lives and how to rebuild the page.</dd>
  </dl>
</section>

<section id="g-11">
  <h2>11. Quick reference</h2>
  <div class="g-cols">
    <div>
      <h3>Addresses</h3>
      <table class="g-table g-compact"><tbody>
        <tr><td><code>#/</code></td><td>home</td></tr>
        <tr><td><code>#/python</code> <code>#/lisp</code> <code>#/cpp</code> <code>#/math</code> <code>#/modern</code> <code>#/java</code></td><td>a course</td></tr>
        <tr><td><code>#/python/3</code></td><td>lesson 3 of Python</td></tr>
        <tr><td><code>#/lab</code></td><td>the Code Lab</td></tr>
        <tr><td><code>#/portfolio</code></td><td>the student's portfolio</td></tr>
        <tr><td><code>#/guide</code></td><td>this guide</td></tr>
        <tr><td><code>#/ojibwe</code></td><td>the Ojibwe words on the site and their sources</td></tr>
        <tr><td><code>#/about</code></td><td>what the site keeps, licence, credits</td></tr>
      </tbody></table>
    </div>
    <div>
      <h3>Code Lab keys</h3>
      <table class="g-table g-compact"><tbody>
        <tr><td>Ctrl/Cmd + Enter</td><td>run</td></tr>
        <tr><td>Ctrl/Cmd + Z, Y</td><td>undo, redo</td></tr>
        <tr><td>Ctrl/Cmd + F, H</td><td>find, replace</td></tr>
        <tr><td>Ctrl/Cmd + /</td><td>comment lines</td></tr>
        <tr><td>Tab, Shift + Tab</td><td>indent, outdent</td></tr>
        <tr><td>Alt + ↑ ↓</td><td>move line</td></tr>
        <tr><td>Ctrl/Cmd + S</td><td>download file</td></tr>
        <tr><td>Enter (in Step through)</td><td>next line</td></tr>
      </tbody></table>
      <h3>Classroom mode keys</h3>
      <table class="g-table g-compact"><tbody>
        <tr><td>→, Page Down, Space</td><td>next step</td></tr>
        <tr><td>←, Page Up</td><td>previous step</td></tr>
        <tr><td>Enter</td><td>reveal, or run the example</td></tr>
        <tr><td>S</td><td>spotlight on or off</td></tr>
        <tr><td>+ −</td><td>larger, smaller type</td></tr>
        <tr><td>B</td><td>blank the screen</td></tr>
        <tr><td>?</td><td>list the keys</td></tr>
      </tbody></table>
    </div>
  </div>
</section>

<footer class="g-foot">
  <p>Courses, site and this guide written and built by Michael Sayers. Shared under the Creative Commons Attribution-ShareAlike 4.0 licence (CC BY-SA 4.0): use, adapt and share them, crediting the author and sharing changes the same way.</p>
</footer>
`;
  function page() {
    const el = (t, a, ...k) => window.__app.internal.el(t, a, ...k);
    const main = el('main', { class: 'guide' });
    main.innerHTML = html;
    main.prepend(el('div', { class: 'g-tools' }, el('button', { class: 'btn quiet tiny', onclick: () => window.print() }, 'Print or save as PDF')));
    // The contents links (#g-1 ...) are plain anchors, which work in the printable copy; inside the site the hash is
    // the route, so scroll to the section instead of letting the link change it.
    main.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#g-"]'); if (!a) return;
      e.preventDefault();
      const t = document.getElementById(a.getAttribute('href').slice(1)); if (t) { t.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    });
    return main;
  }
  return { html, page };
})();
