# Short Explorations in Computer Science

Eight free, self-paced courses (From Scratch to Python, Introduction to Python, Introduction to Lisp, Introduction to C++,
Introduction to the Mathematics of Computing, Modern C++, Introduction to Java, and Data Structures and Algorithms) with runnable examples and autograded exercises, a Code Lab
sandbox, and tools for teachers: assignments and submissions shared as links, a grade book, student
portfolios and a classroom (projector) mode. Python, C++, Java and Scheme all run in the browser, so there is no
server and no account. Java runs in an interpreter written for this site that checks programs the way javac does. For C++ there are two engines: a small teaching interpreter that is part of the page, and a real
compiler (Clang built for WebAssembly) that the browser downloads once, on request, for the Modern C++ course and the
Code Lab's Full C++ option. The build produces one self-contained `index.html` that can be hosted anywhere or
opened from disk.

Source and releases: <https://github.com/msayers01/Short-Explorations-in-Computer-Science>.

## Using it

You do not need to build anything to use or host the site. Download `index.html` from the latest
[release](https://github.com/msayers01/Short-Explorations-in-Computer-Science/releases) (or from `dist/`), open it in a browser, or put it on any static web host: it
is one file with no server behind it, and students' work stays in their own browsers. The teacher guide
is inside the site at `#/guide`; `dist/teacher-guide.html` is a printable copy.

ARCHITECTURE.md describes the design in detail: constraints, routes, storage keys, link formats and how to
add lessons, figures and exercise types. LESSON_STANDARD.md is how a lesson is written, and why (the research behind each part);
`node test_lessons.js --standard` shows which lessons meet it.

## Layout

    src/site.js            site name, home and About page text, contact links, licence, source link
    src/course_computer.js SC 099 What Is a Computer?: the parts, the CPU, memory and storage, bits and bytes, software (no code)
    src/course_scratch.js  SC 100 From Scratch to Python: the blocks beside the lines, for students coming from Scratch
    src/course_python.js   SC 101 Introduction to Python: lessons, examples, exercises and their tests
    src/course_lisp.js     SC 102 Introduction to Lisp
    src/course_cpp.js      SC 103 Introduction to C++
    src/course_math.js     SC 104 Introduction to the Mathematics of Computing (uses Python)
    src/course_modern.js   SC 105 Modern C++ (runs on the real compiler)
    src/course_java.js     SC 106 Introduction to Java (the first lessons; runs on the site's own Java interpreter)
    src/course_dsa.js      SC 107 Data Structures and Algorithms (the first lessons; Java, with interactive figures)
    src/course_shell.js    SC 108 The Command Line (the first lessons; taught in the practice terminal)
    src/course_ml.js       SC 109 How Machines Learn (units one and two; Python, written to LESSON_STANDARD.md)
    src/style.css          design tokens, layout and every component's styles
    src/app.js             router, pages, code editor, runners, grader, saved progress
    src/lab.js             the Code Lab (#/lab): files, editor, Python tracer and turtle, Scheme REPL,
                           templates, quick reference, share links, open and save, the Terminal panel
    src/shell.js           the practice shell: a Unix-style command line with its own file system (no eval, no DOM)
    src/terminal.js        the terminals in front of it: the Code Lab panel (history, Tab completion, nano, the ~/lab mirror)
                           and the lesson terminals of the shell course (examples and graded exercises)
    src/shellgrade.js      the shell course's file setups and its grader (file-system state and command output)
    src/teach.js           assignments, submissions and grade book, carried in links
    src/portfolio.js       the student portfolio (#/portfolio)
    src/classroom.js       classroom (projector) mode
    src/review.js          spaced review (#/today) and the skills map
    src/parsons.js         Parsons problems: blocks, order and program (shared with test_course.js)
    src/tour.js            the guided tour behind the Tour button in the top bar
    src/guide.js           the guide for teachers (#/guide; also built to dist/teacher-guide.html)
    src/about.js           About and credits (#/about)
    src/ojibwe.js          Ojibwe words in the interface, the Ojibwe clock, and the word list (#/ojibwe)
    src/widgets.js         interactive figures used in the lessons
    src/mathgrade.js       grader for the non-code exercise kinds (answer, choice, table)
    src/scheme.js          Scheme interpreter (MIT Scheme / SICP dialect)
    src/subst.js           substitution-model stepper for Scheme
    src/cppstep.js         C++ memory stepper (frames, addresses, arrays and pointers)
    src/java.js            the Java interpreter: lexer, parser, javac-style checker, library, interpreter
    src/javaworker.js      the Java sandbox (a Web Worker); src/javautil.js wraps method exercises for grading
    src/clangworker.js     the Full C++ worker (real Clang, downloaded on demand); src/cppfull.js grades its exercises
    src/qr.js              QR code encoder for sharing links
    vendor/jscpp.min.js    the JSCPP C++ interpreter, bundled for the browser (see below)
    stubs/                 shims used when bundling JSCPP
    patches/               changes to JSCPP: C++-style printing of decimals, truncating integer division,
                           a clear division-by-zero error, a repeatable srand, a correct strcmp, and
                           correct wrap-around of unsigned integers
    scripts/patch-jscpp.js applies those patches to node_modules (run automatically before npm test)
    build.js               inlines everything into dist/index.html and writes dist/teacher-guide.html
    test_course.js         checks every exercise and example of a course
    test_cppstep.js        checks the C++ memory stepper
    test_java.js           checks the Java interpreter against what javac and java print
    test_subst.js          checks the substitution stepper
    test_security.js       checks the Python sandbox and the size limit on links
    test_backup.js         checks saving and restoring work to a file, including hostile files
    test_shell.js          checks the practice shell: file system, parser, every command, limits, hostile saved copies
    test_browser.js        browser tests (npm run test:browser): sandboxes, Stop, the Code Lab and the Content Security Policy
    dist/                  the built site

## Building

    npm install
    node build.js                               # writes dist/index.html and dist/teacher-guide.html,
                                                # and copies the real-C++ compiler (28 MB) to dist/clang/<version>/

The site is `dist/index.html` plus, for the Modern C++ course and Full C++ in the Code Lab, the `dist/clang/` folder next
to it (it is not in git; the build makes it). Host both; the page fetches the compiler only when asked. `index.html` alone
still works, without those two features. They also need the site to be served over http(s), not opened as a file.

The patched JSCPP is already bundled in `vendor/jscpp.min.js`; the patch also has to be applied to
`node_modules` for the C++ tests; `npm test` does that for you (`scripts/patch-jscpp.js`). To rebuild the bundle after changing JSCPP:

    npx esbuild node_modules/JSCPP/lib/commonjs.js --bundle --minify --format=iife \
      --global-name=JSCPP --platform=browser \
      --alias:stream=./stubs/stream.js --alias:util=./stubs/util.js \
      --outfile=vendor/jscpp.min.js

## Testing

    npm test          # all of the below
    node test_course.js python      # or lisp, cpp, math, modern (real compiler: about a minute)
    node test_cppstep.js
    node test_subst.js
    node test_shell.js

Each course test prints one line per exercise: the reference solution must pass and the
starter code must fail. It also runs every playground and reports errors.
`test_cppstep.js` checks the C++ memory stepper, and steps through every C++
playground and solution to make sure stepping prints what a normal run prints.
`test_subst.js` steps every Lisp playground with the substitution model and checks
that each expression ends at the value the interpreter prints.

## Design

White paper, Newsreader / Source Sans 3 / IBM Plex Mono, with an accent colour per course. Light and dark
modes follow the system preference and can be switched in the top bar. Design tokens are the `--` variables
at the top of `src/style.css`.

## Writing content

A lesson is `{ title, summary, blocks: [...] }`. The site estimates each lesson's length from its content and marks
lessons likely to take more than an hour (see `lessonMinutes` in app.js; a course can set `readingWpm`). Block types:

- a string of HTML — prose
- `{ play: code, caption, stdin, expectError, testStdin }` — runnable editor (`expectError: true` when the code is meant to raise, so the test script does not flag it; `testStdin` is input used only by the test script, when the page should still prompt interactively)
- `{ code: code, caption }` — static listing
- `{ fig: 'name', caption, ...params }` — a widget from `src/widgets.js`
- prose may use `<details class="reveal"><summary>…</summary>…</details>` for predict-then-reveal, and `<div class="recap"><h3>In this lesson</h3><ul>…</ul></div>` for an end-of-lesson recap
- `{ aside: html }`
- `{ ex: { id, title, prompt, starter, solution, hints[], tests[], ... } }`

Tests: Python `{ call: 'f(1)', expect: '2' }` (compared to `repr`) or
`{ stdin, expect }`; Scheme `{ call: '(f 1)', expect: '2' }`; C++ `{ stdin, expect }`,
`{ call, expect, setup }` (checker supplies main) or `{ name, main, expect }`.
Optional `mustContain` / `mustNotContain: [{ re, msg }]`, `followup`, `failTip`,
`sampleStdin`, `prelude` (C++).

Non-code exercises (used by the mathematics course; graded by `src/mathgrade.js`, which
`app.js` and `test_course.js` share). Set `kind` and give `solution` as HTML reasoning
instead of code; `hints`, `followup` and `failTip` work as before:

- `kind: 'answer'` — one text field per part: `parts: [{ label, answer: '40' | ['40', 'forty'],
  re: /regex/, wrong: [{ match: '41' | [...], msg }], placeholder, width, unit }]`.
  Comparison ignores case, spacing, unicode minus/×/², trailing full stop; numeric strings
  compare as numbers; T/F/1/0/true/false are interchangeable. Add `exact: true` to a part to compare as text only
  (for answers that are strings of digits, such as a binary string `01`, which must not equal the number 1).
- `kind: 'choice'` — `options: [{ text, ok: true, why }]`; `why` is shown when that wrong
  option is picked. `multi: true` allows several correct options (checkboxes).
- `kind: 'table'` — `head: [...]`, `rows: [[ 'p', 'q', { a: 'F', why: { 'T': msg }, width } ]]`;
  object cells are blanks the student fills.

The test script checks that the reference answers pass, empty answers fail, and no
`wrong` key is itself an accepted answer.

Mathematical prose in the math course uses `<div class="stmt"><p><span class="kind">Definition.</span> …</p></div>`
for definitions and theorems, `<div class="proof">…<span class="qed">∎</span></div>` for proofs
(`class="proof annotated"` with `<p class="why">` paragraphs for a step-by-step commentary), and
`<table class="small">` for small hand-computed tables.

## Interpreter limits

- C++ (JSCPP): no `std::string`, `vector`, classes, references (`int&`); no
  single-element array initialisers; elements of a char array filled by
  `cin >>` cannot be assigned to (initialise the array instead).
- Scheme: floating-point numbers only (`(/ 1 3)` prints `.333333333333`).
- Python (Skulpt): Python 3 core; no third-party modules.

## The Code Lab

`#/lab` is a sandbox with its own editor (src/lab.js). It reuses the highlighter, runners and
output panel from app.js through `window.__app.internal`. Files are kept in localStorage under
`shortcourses.lab.v1`, one list per language. A share link is `#/lab?l=<lang>&n=<name>&c=<base64url code>`;
opening one adds the file to the visitor's Code Lab. The **Terminal** button opens a practice command line
(src/terminal.js, src/shell.js): a Unix-style shell with its own file system in localStorage (`shortcourses.shell.v1`),
where `~/lab` mirrors the Code Lab's files both ways and `python`, `javac`/`java`, `g++` and `scheme` run programs
through the same sandboxes as the Run button. Starter programs live in `TEMPLATES` and the
cheatsheets in `REFERENCE` at the top of lab.js. The Python tracer uses Skulpt's debugging
suspensions (`Sk.debug`): module-level variables come from `$loc`, function locals from `$tmps`.
Stop works through `yieldLimit` suspensions; `killableWhile/killableFor` must stay off (they hang).

Courses and the Lab are linked: every playground and code exercise has an "Open in Code Lab"
button (`window.LAB.openCode({lang, code, name, ex})`). A Lab file that carries `ex: {id, course, lesson}`
shows an exercise bar with "Check against the exercise" (same grader; passing marks it done in the course)
and a link to `#/<course>/<lesson>/<exercise-id>`, which the router scrolls to. The Substitution button
(Scheme) runs `SUBST.create().traceProgram(code)`: defines are registered, every other top-level
expression is rewritten one redex at a time (applicative order; `let` becomes a lambda application;
internal defines are substituted into and registered; higher-order primitives such as map fall back
to the interpreter with a note).

## Assignments without a server (src/teach.js)

Switch on "Teacher tools" in the Code Lab. An assignment (title, instructions, starter, tests in the
course formats, hints, optional roster) is stored under `shortcourses.teach.v1` and shared as
`#/assign?a=<packed>`; `pack` is JSON -> deflate-raw (CompressionStream, when available; a `z`/`p` prefix
says which) -> base64url. The student link carries only visible tests. A student's Submit makes
`#/review?s=<packed>` carrying name + code; the teacher opens it (or pastes several) and the tests
run from the teacher's stored copy (hidden tests included), so results cannot be forged. Results live in a
grade book with CSV export. "Back up all" makes `#/lab?b=<packed>` that restores every assignment on
another device. QR codes are generated in the browser (src/qr.js).

## Portfolios and classroom mode

`#/portfolio` collects every exercise completed on this device (the code or answers that passed, kept in
`pass` in the progress record) into one document, with the student's name, a note, and optionally unfinished
work, each task, and chosen Code Lab files. It prints (one course per page), downloads as a standalone web
page, or packs into `#/portfolio?p=<packed>` (same packing as assignments). Opening that link shows the
portfolio read-only, and "Check every exercise on this computer" re-runs each exercise's tests from the site.

Classroom mode (projector button in the top bar) enlarges type and steps through a lesson one block at a time:
→ / Page Down / Space next, ← / Page Up back, Enter reveals or runs, S spotlight, + and − size, B blank, ? keys.
Settings: `shortcourses.portfolio.v1`, `shortcourses.classroom.v1`. Details in ARCHITECTURE.md §9a.

## Ojibwe words in the interface

`src/ojibwe.js` holds the Ojibwe words the site can show (a greeting, "Lesson", "Lessons", "Try it", "Check answer",
"Thank you", and the name of the language), and the day, part of the day and hour for the home-page clock, each
copied from the Ojibwe People's Dictionary, with the address of its source. They are always shown beside the
English, never instead of it, and `#/ojibwe` lists them with their sources. Do not add words that are not
copied from the dictionary or supplied by a fluent speaker or an Ojibwe language program; the rules are at the
top of `src/ojibwe.js`.
Dictionary entries are © The Ojibwe People's Dictionary, CC BY-NC-SA 3.0; keep the attribution.

## Licence

The program code is under the MIT License (`LICENSE`). The lessons, examples, exercises and the guide for teachers
are under CC BY-SA 4.0, the Ojibwe word list (`src/ojibwe.js`) is under CC BY-NC-SA 3.0 as the Ojibwe People's
Dictionary requires, and the Lisp course's material adapted from *Structure and Interpretation of Computer Programs*
keeps that book's CC BY-SA 4.0: see `LICENSE-CONTENT.md`. Bundled third-party software is listed with its licences
in `THIRD-PARTY-NOTICES.md`, which `node build.js` regenerates.
