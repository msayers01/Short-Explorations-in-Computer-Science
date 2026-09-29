/* The teacher guide, (c) 2026 Michael Sayers, licensed CC BY-SA 4.0 (see LICENSE-CONTENT.md).
   One HTML string, rendered at #/guide inside the site and written by build.js as dist/teacher-guide.html for
   printing. Keep it in plain language; its readers are teachers who have never programmed. */
window.GUIDE = (function () {
  const html = `
<header class="g-hero">
  <p class="g-kicker">Short Explorations in Computer Science</p>
  <h1>A guide for teachers</h1>
  <p class="g-lede">Everything you need to run a class with this site: how the courses are built, how to lead an hour of coding, how the Code Lab works, and how to set assignments and collect students' work without any accounts, installations or servers.</p>
  <nav class="g-toc" aria-label="Contents">
    <a href="#g-1">1. What the site is</a>
    <a href="#g-2">2. Before the first class</a>
    <a href="#g-3">3. The four courses</a>
    <a href="#g-4">4. Inside a lesson</a>
    <a href="#g-5">5. Leading an hour of coding</a>
    <a href="#g-6">6. The Code Lab</a>
    <a href="#g-7">7. Assignments and submissions</a>
    <a href="#g-8">8. Portfolios</a>
    <a href="#g-9">9. When something goes wrong</a>
    <a href="#g-10">10. Quick reference</a>
  </nav>
</header>

<section id="g-1">
  <h2>1. What the site is</h2>
  <p>This is a single web page that contains four short courses, a code editor, and a set of teacher tools. It runs entirely inside the browser. Nothing is installed on the computer, nobody signs in, and no information about a student is ever sent anywhere. That is a deliberate design choice, and it has three consequences worth knowing from the start.</p>
  <ul class="g-list">
    <li><b>It works anywhere a browser works.</b> A school laptop, a Chromebook, a phone, a computer with no internet after the page has loaded, even a copy on a USB stick.</li>
    <li><b>Progress is saved on the device, not in an account.</b> A student who uses the same computer sees their completed exercises and saved code next time. A student who switches computers starts fresh there. Section 9 explains how to live with this, and section 8 how a student takes their work with them.</li>
    <li><b>Work moves between people as links.</b> A student's submission is a link that contains their program. Your assignment is a link that contains the task. You share these the way your class already shares things: Google Classroom, email, a message, a QR code on the projector.</li>
  </ul>
  <p>If a parent or an administrator asks what the site stores about students, the <a href="#/about">About page</a> answers in plain language, and lists the licence and credits.</p>
  <p>You do not need to know how to program to use this guide or to run a lesson. Every lesson explains its own material, checks students' answers itself, and gives hints and a worked solution when a student is stuck. Your job is the one you already do: set the pace, notice who is stuck, ask good questions.</p>
</section>

<section id="g-2">
  <h2>2. Before the first class</h2>
  <div class="g-steps">
    <div class="g-step"><span class="g-num">1</span><div><b>Open the site on a student machine and press Run on a "Try it" box.</b><p>If a program runs and prints something, everything works. The first load takes a few seconds because the page carries three programming languages inside it; after that it is fast.</p></div></div>
    <div class="g-step"><span class="g-num">2</span><div><b>Decide how students will find the site.</b><p>Put the address on the board, in Google Classroom, or make a QR code (the Code Lab's teacher tools can make one for any link). Bookmarks on shared machines help.</p></div></div>
    <div class="g-step"><span class="g-num">3</span><div><b>Try the light/dark button at the top right.</b><p>Some students read more easily on a dark screen, some on a light one. The choice is remembered per device.</p></div></div>
    <div class="g-step"><span class="g-num">4</span><div><b>Do lesson 1 of Python yourself.</b><p>It takes about forty minutes and shows you every kind of thing a student will meet: a runnable example, a prediction box, a graded exercise, a hint, a solution. You will then recognise what students are looking at when they call you over.</p></div></div>
    <div class="g-step"><span class="g-num">5</span><div><b>Know where "Reset my progress" is.</b><p>It is at the bottom of the home page. It clears everything saved on that device. Use it on a shared machine at the end of a course, not in the middle of one.</p></div></div>
  </div>
  <aside class="g-callout"><b>Shared computers.</b> If several students use one machine in different periods, they will see each other's progress. The simplest arrangement is one Code Lab file per student, named after them (section 6), and a fresh "Reset" only when the whole class has finished.</aside>
  <aside class="g-callout"><b>Ojibwemowin on the site.</b> The site shows a few interface words in Ojibwe (the greeting on the home page, "Lesson", "Lessons", "Try it", "Check answer", and "Thank you" over the credits), each beside its English. The home page also tells the day, the part of the day and the hour in Ojibwe, with the English under each sentence: a good way to open a class on the projector. Every word is copied from the Ojibwe People's Dictionary. <a href="#/ojibwe">The Ojibwemowin page</a> lists every word with its source, and the labels that have no Ojibwe yet; print it if an Ojibwe speaker or language teacher would like to suggest words.</aside>
</section>

<section id="g-3">
  <h2>3. The four courses</h2>
  <p>Each course is a sequence of self-contained lessons; a lesson is designed to fill one class period of 45–60 minutes and can be used on its own. The three programming courses teach the same core ideas in three different languages; the fourth course uses Python as a laboratory for mathematics.</p>
  <table class="g-table">
    <thead><tr><th>Course</th><th>Who it is for</th><th>What students do</th></tr></thead>
    <tbody>
      <tr><td><b>SC 101 Introduction to Python</b><br><span class="g-muted">13 lessons</span></td><td>Grades 8–12. No experience needed. Start here.</td><td>Write programs that make decisions, repeat, and keep lists; find and fix bugs; run a random simulation; build a working cipher.</td></tr>
      <tr><td><b>SC 102 Introduction to Lisp</b><br><span class="g-muted">11 lessons</span></td><td>Grades 11–12 or a strong 10th grader, after Python.</td><td>Think in expressions and recursion, see how a language evaluates code step by step, and build a program that differentiates algebra.</td></tr>
      <tr><td><b>SC 103 Introduction to C++</b><br><span class="g-muted">11 lessons</span></td><td>Grades 10–12, after Python or with some experience.</td><td>Meet types, pointers and arrays; learn what happens under the hood; finish with a prime-number sieve.</td></tr>
      <tr><td><b>SC 104 The Mathematics of Computing</b><br><span class="g-muted">13 lessons</span></td><td>Grades 10–12 or a strong 9th grader, after Python. Algebra only, no calculus.</td><td>Logic, sets, proof and induction, number theory, graphs, machines with finite memory, patterns and the double vowel spelling of Ojibwe, what no program can compute, and how hard problems and codes work.</td></tr>
    </tbody>
  </table>
  <p>Suggested paths: a one-semester elective is Python followed by the mathematics course; a two-year sequence adds C++ and Lisp; a single Hour of Code event uses Python lesson 1 alone.</p>
  <p>Lesson length: the programming lessons are sized for an hour (45–60 minutes). The mathematics lessons are longer, most of them 60 to 90 minutes, because proofs are read slowly and the exercises ask for reasoning. Any lesson likely to run past an hour is marked \u201cLonger than an hour\u201d in its course\u2019s list, with an estimate, and again at the top of the lesson. The estimate comes from how much the lesson asks students to read, run and solve, so treat it as a guide.</p>
</section>

<section id="g-4">
  <h2>4. Inside a lesson</h2>
  <p>Every lesson has the same parts, in the same order, so students learn the routine once.</p>
  <dl class="g-parts">
    <dt>Explanation</dt><dd>Short paragraphs that state each rule before showing it. New words are defined where they first appear.</dd>
    <dt>Try it</dt><dd>A small runnable program with a caption saying what to look for and what to change. Students should press Run, then change something and run again. Every "Try it" has an <em>Open in Code Lab</em> button for students who want to keep experimenting.</dd>
    <dt>Predict, then reveal</dt><dd>A question with a hidden answer. Ask students to commit to a prediction before they open it; the learning is in the commitment.</dd>
    <dt>Common mistakes</dt><dd>A short box near the end listing the errors students make in this lesson. Read it before class: it is the list of things you will be asked about.</dd>
    <dt>Exercises</dt><dd>Two graded tasks. <em>Check answer</em> runs tests and says exactly which passed. <em>Hint</em> gives hints one at a time. <em>Solution</em> shows a worked answer (after two attempts, or with a second click). A green checkmark marks completion and the course page keeps count.</dd>
    <dt>In this lesson</dt><dd>A recap box. It doubles as an exit ticket: ask students to say one of its lines back to you in their own words.</dd>
  </dl>
  <aside class="g-callout"><b>The mathematics course is different in one way.</b> Most of its exercises are not programs. Students type an answer, choose an option, or fill a table, and the checker gives specific feedback for the common wrong answers. Solutions there show the reasoning, not just the value.</aside>
</section>

<section id="g-5">
  <h2>5. Leading an hour of coding</h2>
  <p>A plan that works for any lesson, with the minutes that experience suggests.</p>
  <table class="g-table g-plan">
    <tbody>
      <tr><td class="g-time">0–5</td><td><b>Open the lesson together.</b> Read the summary line under the title aloud. Ask what students think one of the words means.</td></tr>
      <tr><td class="g-time">5–20</td><td><b>Work through the explanation and the first two "Try it" boxes as a class.</b> Project the page in classroom mode (below). Have a student read the caption, predict, run, and change one thing. Resist explaining the code yourself; ask "what do you think this line does?" and let the Run button settle it.</td></tr>
      <tr><td class="g-time">20–40</td><td><b>Students continue on their own or in pairs.</b> Pairs work well: one types, one reads the caption and the error messages, and they swap at each "Try it". Walk the room. When a student is stuck on an exercise, ask them to read the test that failed out loud, and to press Hint before they ask you.</td></tr>
      <tr><td class="g-time">40–55</td><td><b>Exercises.</b> Most students finish the first; strong students finish both. A student who has both checkmarks can open the exercise in the Code Lab and extend it, or help a neighbour.</td></tr>
      <tr><td class="g-time">55–60</td><td><b>Recap.</b> Read the "In this lesson" box. Ask for the common mistake they made and how they found it.</td></tr>
    </tbody>
  </table>
  <h3>Lessons longer than an hour</h3>
  <p>For a lesson marked \u201cLonger than an hour\u201d (most of the mathematics course), split it across two class periods: the explanation and the examples in the first, the exercises and the recap in the second. The lesson page remembers each student\u2019s code and answers, so nothing is lost in between.</p>
  <h3>Projecting a lesson: classroom mode</h3>
  <p>The button with a small screen on it, in the top bar next to the light/dark switch, turns on <em>classroom mode</em>. The type becomes large enough to read from the back of the room, grey text becomes darker, and the list of lessons is hidden so the lesson fills the screen. The browser remembers the setting until you turn it off.</p>
  <p>On a lesson page a bar appears at the bottom, and you can move through the lesson one step at a time: a paragraph, a "Try it" box, a figure, an exercise. A coloured line in the left margin marks where the class is, and <em>Spotlight</em> dims everything else, so nobody reads ahead to the answer.</p>
  <dl class="g-parts">
    <dt>Moving</dt><dd><em>Next</em> and <em>Back</em> on the bar, or the arrow keys, Page Down and Page Up, or Space. A presentation clicker works, because its buttons send those keys. After the last step, Next opens the next lesson. Clicking any paragraph moves the marker there.</dd>
    <dt>Predict, then reveal</dt><dd>When the marker is on a "Predict" box, the bar shows <em>Reveal</em> (or press Enter). Ask for predictions first, then reveal.</dd>
    <dt>Running an example</dt><dd>When the marker is on a "Try it" box, the bar shows <em>Run</em> (or press Enter). To change the code, click into it and type as usual; the keys above are ignored while you type.</dd>
    <dt>Timer</dt><dd>A thinking timer of 1, 2, 3 or 5 minutes, counting down on the bar. Click it again to stop it.</dd>
    <dt>Blank</dt><dd>Turns the screen black when you want everyone looking at you (or press B, which is also the blank button on most clickers). Any key or click brings the lesson back.</dd>
    <dt>A−, A+</dt><dd>Smaller or larger type, for the size of your room and projector.</dd>
  </dl>
  <h3>Things that help</h3>
  <ul class="g-list">
    <li>Error messages are the lesson, not an interruption. The Python course spends a whole lesson (lesson 2) on how to read them; refer back to it whenever a student says "it doesn't work".</li>
    <li>When a student's program does nothing, the first question is always "what did you expect to happen?" The second is "which line should have done that?"</li>
    <li>The Solution button is not cheating. A student who has tried twice and then reads a worked solution, comparing it with their own attempt, learns more than one who stares at a blank box.</li>
    <li>You do not need to know the answer. "Let's read the hint together" and "let's run it and see" are complete responses.</li>
  </ul>
</section>

<section id="g-6">
  <h2>6. The Code Lab</h2>
  <p>The Code Lab (top bar, or the card on the home page) is a place for students' own programs in any of the three languages. It is deliberately more capable than the boxes inside lessons: files with names, an editor with completion and search, a way to run a program one line at a time, a drawing canvas, and sharing.</p>
  <dl class="g-parts">
    <dt>Languages and files</dt><dd>The three buttons at the top right switch language. Each language keeps its own files as tabs; <em>+ New</em> makes a file and asks for a name, <em>Rename</em> is under the editor. Files are saved on the device automatically.</dd>
    <dt>Run and Stop</dt><dd><em>Run</em> (or Ctrl+Enter) runs the current file. Programs that ask for input show a box in the output. A Python program stuck in a loop can be stopped with <em>Stop</em>; C++ and Scheme programs stop themselves after a few seconds.</dd>
    <dt>Step through (Python)</dt><dd>Runs the program one line at a time, highlighting the line about to run and showing every variable's value. This is the single most useful tool for a student who cannot see why a loop or a function does what it does. Press Enter to advance.</dd>
    <dt>Step through memory (C++)</dt><dd>Runs a C++ program one line at a time and draws its memory: one box per function call, and inside it every variable with its type, an address and its value. Arrays appear cell by cell, character arrays also as text, and a pointer shows the address it holds and which variable lives there (pointing at it lights that variable up). Values that just changed are highlighted, variables that were never given a value show a question mark, and a pointer to a variable whose function has returned is flagged. Because the whole run is recorded, students can step <em>backwards</em> as well as forwards, or drag the slider. Every C++ example in the course has a <em>Step through memory</em> button that opens it here. It is the tool to reach for in the lessons on functions, pointers and arrays. Addresses are invented but consistent: they are laid out the way a compiler would, and they match the tables in the lessons.</dd>
    <dt>Turtle drawing (Python)</dt><dd>A program that begins with <code>import turtle</code> opens a canvas. The <em>Templates</em> panel has a starting example.</dd>
    <dt>REPL and Substitution (Scheme)</dt><dd>After Run, the REPL below the output lets students try one expression at a time. <em>Substitution</em> shows an expression being rewritten step by step, exactly as the Lisp course draws it, including procedures that remember values from where they were made (closures). Every Scheme example in the course has a <em>Show the substitution</em> button that opens it here with the panel already running.</dd>
    <dt>Templates and Reference</dt><dd><em>Templates</em> opens a set of small starting programs in a new tab. <em>Reference</em> is a one-page cheat sheet for the current language, written to match what actually works on this site.</dd>
    <dt>Share, Open, Save</dt><dd><em>Share link</em> copies a link that carries the program; anyone who opens it gets a copy in their own Code Lab. <em>Save</em> downloads the file; <em>Open</em> loads a file from the device.</dd>
    <dt>From a lesson to the Lab</dt><dd>Every exercise has <em>Open in Code Lab</em>. A file opened that way keeps a bar above the editor with <em>Check against the exercise</em>; passing there counts as completing the exercise in the course.</dd>
  </dl>
  <aside class="g-callout"><b>Phones and tablets.</b> Everything works on a touch screen. Because phone keyboards have no Tab key, the <em>Indent</em> and <em>Outdent</em> buttons under the editor take its place, and <em>Wrap</em> keeps long lines on screen.</aside>
</section>

<section id="g-7">
  <h2>7. Assignments and submissions</h2>
  <p>You can set your own tasks, with tests that check students' programs, and collect their work, all without a server. Turn on <em>Teacher tools</em> at the top of the Code Lab. The switch has no password; it only keeps the teacher's buttons out of students' way.</p>
  <h3>Creating an assignment</h3>
  <div class="g-steps">
    <div class="g-step"><span class="g-num">1</span><div><b>Press Assignments, then + New assignment.</b><p>Give it a title, choose the language, and write the instructions in plain text. Blank lines make paragraphs; lines beginning with "- " make a list; text in backticks becomes code.</p></div></div>
    <div class="g-step"><span class="g-num">2</span><div><b>Write the starter code</b>, or write it in the editor and press "Use the editor code as the starter".</div></div>
    <div class="g-step"><span class="g-num">3</span><div><b>Add tests.</b><p>Two kinds. <em>Input → output</em>: the program is run with the input you give (one value per line) and must print exactly the output you give. <em>Call → value</em>: for a task where students write a function, give a call such as <code>is_leap(2024)</code> and the value it should return, such as <code>True</code>. Tick <em>Hidden</em> for tests students should not see; hidden tests stay on your computer and run only when you review.</p></div></div>
    <div class="g-step"><span class="g-num">4</span><div><b>Check your own tests.</b><p>Write a correct solution in the editor and press "Run tests on the editor code". If your solution does not pass, a test is wrong; fix it now rather than in front of the class.</p></div></div>
    <div class="g-step"><span class="g-num">5</span><div><b>Optionally add hints and a class roster</b> (one name per line). With a roster, students pick their name from a list when they submit, and the grade book shows who has not submitted yet.</div></div>
    <div class="g-step"><span class="g-num">6</span><div><b>Save.</b><p>You get the assignment link and a QR code. Post the link in Google Classroom or show the QR code on the projector; students scan it with a phone camera.</p></div></div>
  </div>
  <h3>What students see</h3>
  <p>Opening the link puts the assignment in their Code Lab: the task, your starter code, a <em>Check</em> button that runs the visible tests, hints in order, and <em>Submit</em>. Submit asks for their name and makes a <em>submission link</em>. They send you that link the way the class shares work. The link contains their program exactly as it was when they pressed the button; if they change it afterwards they must submit again.</p>
  <h3>Reviewing</h3>
  <div class="g-steps">
    <div class="g-step"><span class="g-num">1</span><div><b>Open a submission link</b>, or paste several links at once into the box on the Assignments screen and press Review.</div></div>
    <div class="g-step"><span class="g-num">2</span><div><b>Read the result.</b><p>The tests, including hidden ones, run on your computer from your own copy of the assignment. You see which passed, the student's code with the lines they changed marked, and buttons to open it in the editor or re-check it.</p></div></div>
    <div class="g-step"><span class="g-num">3</span><div><b>Open the Grade book</b> for the assignment: every student, when they submitted, how many tests passed, and who is missing. <em>Export CSV</em> gives a file that opens in any spreadsheet.</div></div>
  </div>
  <aside class="g-callout g-warn"><b>Back up your assignments.</b> They live only in the browser you made them in. Press <em>Back up all</em> and keep the link it gives you (email it to yourself). Opening that link on any computer restores everything, hidden tests included. Do this after making each new assignment.</aside>
  <aside class="g-callout"><b>Can a student cheat the result?</b> The result you see is computed on your machine from your copy of the tests, so a student cannot change it. They can, of course, submit a program written by someone else; that is the same problem as any homework, and the diff view (which shows what changed from the starter) plus a two-minute conversation usually settle it.</aside>
</section>

<section id="g-8">
  <h2>8. Portfolios</h2>
  <p>A student's work lives in the browser they used. A <em>portfolio</em> is how they take it somewhere else: one document with every exercise they have completed, their code or answers, and the date. The link is on the home page ("Your work") and on every course page.</p>
  <div class="g-steps">
    <div class="g-step"><span class="g-num">1</span><div><b>The student opens the portfolio</b> and types their name. They can add a short note (what they are proudest of, what was hard) and choose whether to include exercises they started but have not finished, the task for each exercise, and programs from their Code Lab.</div></div>
    <div class="g-step"><span class="g-num">2</span><div><b>They choose how to hand it in.</b><p><em>Print or save as PDF</em> gives a clean printout, one course per page. <em>Download as a web page</em> saves one file that opens in any browser. <em>Make a link for my teacher</em> gives a link, like a submission link, that they send you the way the class shares work.</p></div></div>
    <div class="g-step"><span class="g-num">3</span><div><b>You open the link.</b><p>You see the portfolio exactly as the student made it; nothing is saved on your computer. Press <em>Check every exercise on this computer</em> to run each exercise's own tests on the work shown. Anything marked completed that does not pass is listed at the top.</p></div></div>
  </div>
  <aside class="g-callout"><b>Why check?</b> The ✓ marks are recorded on the student's device, and a determined student could fake one. The check uses the site's own tests, on your computer, so its result does not depend on anything the student sent. A portfolio shows the version of each program that passed, even if the student changed it afterwards.</aside>
  <p>Portfolios are also the answer to "I'm moving to a different computer" and to the end of the year: a student who saves one keeps a record of everything they did.</p>
</section>

<section id="g-9">
  <h2>9. When something goes wrong</h2>
  <dl class="g-faq">
    <dt>"My progress disappeared."</dt><dd>Progress is saved per device and per browser. The student is probably on a different computer, a different browser, or a private window; or someone pressed Reset. There is nothing to recover from a server because there is no server. Ask students to use the same machine, or to keep their programs in the Code Lab and save or share them. Before a student changes computers, have them make a portfolio (section 8) so their record of completed work goes with them.</dd>
    <dt>"The program just stops with a red message."</dt><dd>That is an error message, and it says which line. Python lesson 2 teaches how to read them. In the Code Lab, every message has a plain-English explanation under it and a "go to line" link.</dd>
    <dt>"It says Time limit exceeded."</dt><dd>The program ran for too long, almost always a loop that never ends. Look at the loop's condition. In the Code Lab, Stop ends a stuck Python program.</dd>
    <dt>"The answer is right but the checker says no."</dt><dd>Nearly always the output differs in a small way: a missing space, a full stop, a capital letter, or <code>5</code> where <code>5.0</code> was expected. The checker shows expected and actual side by side; compare them character by character.</dd>
    <dt>"Save does nothing."</dt><dd>Some managed browsers block downloads. Use Share link instead, or copy the code.</dd>
    <dt>"The assignment link is too long for a QR code."</dt><dd>QR codes hold about 3,000 characters. Shorten the instructions or the starter code, or share the link itself.</dd>
    <dt>"A student's link won't open."</dt><dd>Links are compressed; very old browsers (Safari before 2023) cannot read them. Use a current Chrome, Firefox, Edge or Safari.</dd>
    <dt>"C++ says something is not supported."</dt><dd>The C++ inside the browser is a teaching subset: no <code>std::string</code>, no <code>vector</code>, no classes. The course stays inside the subset; students who read ahead sometimes wander out of it.</dd>
    <dt>"Can I change a lesson?"</dt><dd>Yes, the site is a project you own. The README and ARCHITECTURE files in the project explain where each lesson lives and how to rebuild the page.</dd>
  </dl>
</section>

<section id="g-10">
  <h2>10. Quick reference</h2>
  <div class="g-cols">
    <div>
      <h3>Addresses</h3>
      <table class="g-table g-compact"><tbody>
        <tr><td><code>#/</code></td><td>home</td></tr>
        <tr><td><code>#/python</code> <code>#/lisp</code> <code>#/cpp</code> <code>#/math</code></td><td>a course</td></tr>
        <tr><td><code>#/python/3</code></td><td>lesson 3 of Python</td></tr>
        <tr><td><code>#/lab</code></td><td>the Code Lab</td></tr>
        <tr><td><code>#/portfolio</code></td><td>the student's portfolio</td></tr>
        <tr><td><code>#/ojibwe</code></td><td>the Ojibwe words and their sources</td></tr>
        <tr><td><code>#/guide</code></td><td>this guide</td></tr>
        <tr><td><code>#/about</code></td><td>about the site: what it keeps, licence, credits</td></tr>
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
        <tr><td>N or → / B or ← (in Step through memory)</td><td>next line / previous line</td></tr>
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
  <h3>The one-minute version for a colleague</h3>
  <p>Open the site. Pick a course. Each lesson is about an hour (longer ones are marked): read, press Run, predict, do two exercises, read the recap. Students' work is saved on the computer they used. The Code Lab is for their own programs. Teacher tools make assignments that travel as links and come back as links. A portfolio collects a student's finished work into one printout or link. Project lessons in classroom mode. Back up your assignments.</p>
</section>

<footer class="g-foot">
  <p>Courses, site and this guide written and built by Michael Sayers. This guide and the courses are shared under the Creative Commons Attribution-ShareAlike 4.0 licence (CC BY-SA 4.0): use, adapt and share them, crediting the author and sharing changes the same way.</p>
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
      const t = document.getElementById(a.getAttribute('href').slice(1)); if (t) t.scrollIntoView({ behavior: 'smooth' });
    });
    return main;
  }
  return { html, page };
})();
