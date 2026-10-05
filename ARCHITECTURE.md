# Architecture — Short Explorations in Computer Science

Keep this file current: when a feature changes a module's interface, a storage key,
a route, or a block format, update the matching section here in the same change.

## 1. What the project is, in one paragraph

A single self-contained `index.html` (about 2.6 MB) containing four interactive short courses (Python, Scheme,
C++, mathematics of computing) with autograded exercises, a full sandbox editor ("Code Lab"), and a
serverless assignment system for teachers. Three language runtimes run in the browser: Skulpt (Python),
JSCPP (C++), and a Scheme interpreter written for the site; a fourth, optional one, real C++ (Clang compiled to
WebAssembly), is downloaded on demand from the same site (section "Full C++" below). There is no backend, no account, and
no network dependency except that optional download (the typefaces are embedded); everything the user creates lives in `localStorage`, and everything that
must move between people travels inside a URL.

## 2. Design constraints (do not break these)

1. **One file, works from disk.** `node build.js` inlines every script and style into `dist/index.html`.
   Nothing may fetch from the network at runtime: the typefaces are embedded as data: URIs by `build.js`. No CDN scripts.
2. **No server, ever.** Sharing = data in the URL hash (`#/route?key=<packed>`). Persistence = `localStorage`.
   Anything "sent to the teacher" is a link the student copies themselves.
3. **The teacher's copy is authoritative.** Hidden tests and grading always run from the teacher's stored
   assignment, never from data a student sent.
4. **Every exercise is testable in node.** `node test_course.js <course>` must pass before publishing.
5. **Accessible prose first.** Courses are written for students and teachers with no CS background:
   definitions before examples, one idea per code block, predict-then-reveal, "Common mistakes", recap.
6. **Everything that arrives in a link or from storage is hostile.** Links are written by strangers and are opened by teachers
   and students. Rules, with `test_security.js` as their regression test:
   - Never put such text in the page with `innerHTML`/`html:` unless it went through `esc()`; use `textContent` or the `el()` helper's children.
   - Ids, names and language names from links are only used as keys of dictionaries without a prototype (`Object.create(null)`), checked with
     `hasLang`/`ID_RE`, and incoming assignments, submissions and back-ups pass through `normalize`/`cleanSub` (teach.js).
   - A link that stores something or runs a stranger's program asks the teacher first (`confirmLink`).
   - Packed links are size-limited (`MAX_LINK`, `MAX_UNPACKED`).
   - Python and C++ programs never run in the page. Each runs in a Web Worker that holds only its interpreter (`runner.js`,
     `pyworker.js`, `cppworker.js`): no DOM, no localStorage, nothing sent anywhere (the policy lets a worker ask only this site for its public files, and `lockdown.js` removes `fetch`, `XMLHttpRequest`, `WebSocket` and `Worker` from the interpreters' workers anyway), and the page can end it at any moment (Stop, a watchdog).
     Python that draws with turtle runs in a sandboxed iframe without `allow-same-origin`. `sandbox.js` also removes Skulpt's
     `document`, `urllib` and other modules that reach out; do not add one back. Nothing the sandboxes send back is trusted: it is
     checked and shown as text. Scheme runs in the page: it is our own interpreter, with no way to name a host object, a step limit and
     no `eval`.
   - `build.js` writes a Content Security Policy (script hashes; `connect-src 'self'`, which exists only for the Full C++ download; `img-src 'self'` for the lessons' pictures, §9h) into every page and into `dist/_headers`. A new inline
     script needs no change (its hash is computed); a new external resource must be added to the policy deliberately.

The site's own scripts are concatenated into one inline `<script>` (joined with `;`), so the policy carries one hash for them, one for the
build-info script and one for the sandboxed frame's boot script. One hash per file once pushed the policy line of `dist/_headers` past the
2000 characters Cloudflare allows for a line of that file and the deploy failed; `build.js` now throws if any line would exceed it.

## 3. Repository layout

```
site/
  LICENSE                MIT, for the program code
  LICENSE-CONTENT.md     CC BY-SA 4.0 for the lessons and guide; CC BY-NC-SA 3.0 for src/ojibwe.js; SICP note
  THIRD-PARTY-NOTICES.md written by build.js: licence texts of the bundled libraries
  build.js               concatenates head (style.css) + window.BUILD (build date, third-party licences read from
                         node_modules) + scripts (in order) → dist/index.html
  test_course.js         node harness: solutions pass, starters fail, playgrounds run (per course)
  test_cppstep.js        node tests for the C++ memory stepper, including stepping every C++ course program
  test_javatrace.js      node tests for the Java step-through recorder, including tracing every Java course program
  test_subst.js          node tests for the substitution stepper: every Lisp playground steps without error and ends at the interpreter's value
  test_diff.js           differential tests: src/java.js against javac/java 21, src/shell.js against bash (§11); difftest/ holds the probe
                         programs, the program generator (javagen.js), the shell cases (shell.txt) and the accepted differences (known.json)
  test_lessons.js        the lesson linter (§11); lint/exercise-ids.txt lists every exercise id ever published
  package.json           npm test runs all five courses and the node tests; npm run test:browser the browser tests; deps: skulpt, JSCPP,
                         esbuild, the typefaces, playwright-core (tests)
  .github/workflows/ci.yml   runs npm test, the build and the browser tests on every push to main and every pull request
  patches/jscpp-iostream.patch, patches/jscpp-unsigned.patch   applied to node_modules/JSCPP by scripts/patch-jscpp.js
                         (run automatically before `npm test`) and baked into vendor/jscpp.min.js
  vendor/jscpp.min.js    JSCPP bundled by esbuild (see README for the command)
  stubs/                 stream/util shims for the JSCPP bundle
  dist/index.html        the built site (the only deployed file)
  src/
    site.js              SITE: name, role, contact, home-page text, footer; about (html), licence (code and content
                         licences) and sourceUrl (the repository) for #/about
    course_python.js     SC 101 (13 lessons)   ─┐
    course_lisp.js       SC 102 (11 lessons)    │ each pushes one course object onto window.COURSES
    course_cpp.js        SC 103 (11 lessons)    │
    course_math.js       SC 104 (13 lessons)   ─┤
    course_modern.js     SC 105 (runtime: 'full') ─┘
    style.css            design tokens, layout, course accents, every component's styles
    cppstep.js           C++ memory stepper → window.CPPSTEP { trace, render, describe } (uses JSCPP's debugger)
    javastep.js          Java step-through, the page side → window.JAVASTEP { clean, render, describe } (the trace is JAVA.trace in the worker)
    clangworker.js       the Full C++ worker (Clang for WebAssembly); cppfull.js builds the programs that grade a Full C++ exercise
    backup.js            save my work to a file / restore it (home page, "Your work") → window.BACKUP { collect, parse, apply, panel }
    runner.js            the page's side of the program sandboxes → window.PYRUN, window.CPPRUN (run, trace, cancel; queue, watchdog, limits)
    pyworker.js          the Python runtime that runs inside a worker/iframe: Skulpt, run + step-through protocol (messages in its header)
    cppworker.js         the C++ runtime inside a worker: JSCPP, program runs and memory-stepper traces
    pyboot.js            the few lines inside the turtle iframe that receive the interpreter by message (its hash is in the CSP)
    cpputil.js           ensureMainReturns, cppErrorText: used by cppworker.js and the node tests
    sandbox.js           removes Skulpt's page- and network-reaching modules (document, urllib, webbrowser, image, ...) → SANDBOX
    scheme.js            Scheme interpreter (MIT/SICP dialect) → window.Scheme / module.exports
                         (all c[ad]r up to 4 deep; eval with system-global-environment, always global)
    subst.js             substitution-model stepper over scheme.js ASTs → window.SUBST
    mathgrade.js         grader for non-code exercise kinds → window.MATHGRADE (shared with tests)
    app.js               router, pages, course editor, runners, grader, progress, widgets glue
    lab.js               Code Lab page → window.LAB
    labhistory.js        the Code Lab's file history, line diff and find in all files (pure) → window.LABHIST; node: test_labhistory.js (§9)
    shell.js             the practice shell and its file system → window.SHELL (also required by node tests and backup.js) (§9f)
    shellgit.js          the practice git, registered into the shell with SHELL.register → window.SHELLGIT; node: test_git.js (§9f)
    terminal.js          the terminals in front of shell.js: the Code Lab panel, lesson examples and shell exercises → window.TERMINAL (§9f)
    shellgrade.js        the shell course's setups (file trees) and grader → window.SHELLGRADE; node: test_course.js shell (§9f)
    course_shell.js      SC 108 The Command Line (lang 'shell': examples and exercises are terminals)
    course_ml.js         SC 109 How Machines Learn (Python; the first course written to LESSON_STANDARD.md: named skills, checkpoints; figures knn, perceptron, descent, dtree)
    course_computer.js   SC 099 What Is a Computer? (lang 'none': no runnable code; 11 lessons, 2 checkpoints; answer/choice/table exercises; figures parts, cpu, bits, codes, pixels, colour, sampling, gates, adder, packets, passwords, robot)
    guide.js             the teacher guide (one HTML string) → window.GUIDE; build.js also writes dist/teacher-guide.html
    qr.js                QR encoder → window.QR
    teach.js             assignments / submissions / grade book → window.TEACH
    widgets.js           interactive SVG figures → window.WIDGETS[name](mount, block, course)
    review.js            spaced review (#/today) and the skills map → window.REVIEW (node: test_review.js)
    portfolio.js         student portfolio page (#/portfolio) → window.PORTFOLIO
    classroom.js         classroom (projector) mode → window.CLASSROOM
    tour.js              the guided tour (the Tour button in the top bar) → window.TOUR (§9a)
    ojibwe.js            Ojibwe interface words, their sources, the review page (#/ojibwe) → window.OJIBWE
    about.js             About and credits page (#/about) → window.ABOUT
    algos.js             the #/algorithms page (§9g): demo registry, index and demo pages, shared player and canvas → window.ALGOS
    algo_search.js, algo_sort.js, algo_paths.js, algo_games.js, algo_puzzles.js   the demos (§9g); each also exports selfTest() for test_algos.js
    applied.js           the #/real-world page (§9g): topics, where each is used, jobs, lesson links → window.APPLIED
    standards.js         the #/standards page and the standards box under each lesson's summary (§9k) → window.STANDARDS
```

**Script order in `build.js` matters:** (window.BUILD) → cppstep → scheme → subst → site →
courses → mathgrade → runner → app → lab → guide → qr → teach → backup → widgets → portfolio → classroom → ojibwe → about. `app.js` runs `route()` on
`DOMContentLoaded`, by which time every module has registered its global. `route()` renders the page and then
dispatches a `routed` event on `document`; classroom.js listens for it to rebuild its bar and steps.

## 4. Runtime layering

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │ Pages (app.js): home · course · lesson · Code Lab (lab.js + teach.js)  │
 ├────────────────────────────────────────────────────────────────────────┤
 │ Shared UI: el() · highlight()/toLines() · makeEditor() · outputPanel() │
 │            exerciseBlock()/mathExerciseBlock() · renderVerdict()       │
 ├────────────────────────────────────────────────────────────────────────┤
 │ Grading: grade(ex, code) [code kinds]  ·  MATHGRADE.grade(ex, answers) │
 ├────────────────────────────────────────────────────────────────────────┤
 │ Runners: .python / .cpp / .java (sandboxed workers) · Scheme (in page) │
 ├────────────────────────────────────────────────────────────────────────┤
 │ Storage (localStorage): progress · lab files · teacher data · theme    │
 └────────────────────────────────────────────────────────────────────────┘
```

`app.js` exposes what other modules need on `window.__app.internal`:
`{ el, esc, highlight, toLines, LANGS, Runners, outputPanel, tipFor, armConfirm, grade, renderVerdict, Progress, courseById }`.
`lab.js` reads it through `A()`. Nothing else reaches into app.js internals.

## 5. Routing (`app.js: route()`)

Hash routes; a `?query` after the path is split off first.

| Route | Page |
|---|---|
| `#/` | home (greeting, Ojibwe clock, course catalog in groups, Code Lab card, portfolio and teacher links, footer with About and "Reset my progress") |
| `#/courses` | every course in groups (`COURSE_GROUPS` in app.js; a course in no group is listed under "More courses"), with a search box |
| `#/algorithms`, `#/algorithms/<demo-id>` | Algorithms in motion: the index of demos, or one demo (§9g) |
| `#/arena`, `#/arena/tournament`, `#/arena?bot=` / `?replay=` | Bot Arena: write a bot that plays Tron; the teacher's tournament; a shared bot or replay (§9j) |
| `#/real-world`, `#/real-world/<topic-id>` | where the ideas of the courses are used, scrolled to a topic (§9g) |
| `#/standards`, `#/standards/<code>` | the CSTA and Minnesota standards with the lessons that address them, scrolled to one standard (§9k) |
| `#/<course>` | course page (audience, outcomes, "Your skills" once started (§9i), lesson list with progress) |
| `#/<course>/<n>` | lesson n (1-based) |
| `#/<course>/<n>/<exercise-id>` | lesson n, scrolled to that exercise |
| `#/guide` | the teacher guide (printable; `dist/teacher-guide.html` is the standalone copy) |
| `#/lab` | Code Lab; `?l=&n=&c=` opens a shared file; `?b=` restores a teacher back-up |
| `#/assign?a=` | Code Lab, student side: stores the assignment, opens its file |
| `#/review?s=` | Code Lab, teacher side: reviews the submission, opens the grade book |
| `#/ojibwe` | every Ojibwe word with its source, the days and hours of the clock, and words still needed; printable |
| `#/about` | About and credits: who made it, what it keeps about a visitor, the licence, credits and full third-party licence texts |
| `#/today` | Today's review: due quick checks, one at a time, and the skills map of every started course (§9i) |
| `#/portfolio` | the student's portfolio (settings, print, download, make a link) |
| `#/portfolio?p=` | a received portfolio, read-only, with "Check every exercise on this computer" |

`document.documentElement[data-course]` is set to the course id (or the Lab's current language) and
drives the accent colour through CSS tokens.

## 6. Content model (courses)

Course: `{ id, code, short, lang, title, grades, audience, tagline, description, outcomes[], lessons[], readingWpm?,
howItWorks?, textbook?, status?, standard?, readingGrade?, skills? }`. `standard: 1` (on a course or a lesson) makes `test_lessons.js` enforce
LESSON_STANDARD.md; `skills: [{ id, name }]` names the course's skills, and each quick check and exercise names its own with
`skill: 'id'` or `skill: ['id', ...]` (the skills map lists them, §9i); `readingGrade` caps the Flesch-Kincaid grade of a standard lesson's prose. `status: 'developing'` marks a course still being written: app.js shows an "Under development"
tag on the catalog card, the course page and every lesson's crumb (`devTag`), and the guide says what the tag means.
Lesson: `{ title, summary, blocks[], standard?, checkpoint? }`. A checkpoint lesson (`checkpoint: true`) ends a unit: no rule boxes,
at least six quick checks tagged with skills of the unit's lessons, then exercises and a recap (LESSON_STANDARD.md §4). Blocks, rendered by `renderBlocks()`, which also wraps each block in a `.blk` card with a coloured rail
and a labelled pill, one colour per kind (Example n in the course accent, Interactive teal, Quick check n green, Watch out amber, Quiz purple,
Exercise n; tokens `--k-fig`, `--k-warn`, `--k-quiz`, `--k-ink` in style.css), numbers every `<h2>` with a CSS counter and gives it an id, and collects the lesson's parts (Story, each section,
Quiz, Exercises, Recap) for the map under the title (`lessonMap`) and the "On this page" list in the side column, which follows the
reader with an IntersectionObserver (`watchParts`):

| Block | Renders |
|---|---|
| `"<p>…</p>"` (string) | prose; may contain `<details class="reveal">`, `<div class="recap">`, `<div class="stmt">`, `<div class="proof [annotated]">`, `<table class="small">` |
| `{ play, caption, stdin, expectError, testStdin, lang, predict?, long? }` | runnable playground with "Open in Code Lab". `long: true` excuses an example over 25 lines from the standard's length rule. `predict: true` (or a question string) asks for the expected output before the first run, compares it line by line after, and holds the caption back until then (it becomes the "Why"); not stored; skipped in classroom mode |
| `{ code, caption, lang }` | static listing |
| `{ fig, caption, ...params }` | `WIDGETS[fig]` figure |
| `{ aside }` | "Common mistakes" aside |
| `{ check, options[], answer, why, wrong[]? }` | a quick check: one multiple-choice question, nothing saved (every lesson has three, after an idea has been stated). Choosing selects; Sure / Think so / Guessing then checks, and the message differs for a confident miss and a lucky guess. Later attempts, and every attempt in classroom mode, check at once |
| `{ ex: {...} }` | exercise (code kind or math kind, see below) |

Code exercise: `{ id, title, prompt, starter, solution, hints[], tests[], mustContain[], mustNotContain[], followup, failTip, sampleStdin, prelude }`.
A course may carry `affirm: [...]`, its own words for the title of a passed exercise (From Scratch to Python does); otherwise app.js's list is used.
Tests: Python `{call, expect}` (repr) or `{stdin, expect}`; Scheme `{call, expect}`; C++ and Java `{stdin, expect}`,
`{setup, call, expect}` (checker supplies main) or `{name, main, expect}`; Java also `ex.classes: true` (see §9e).

Math exercise (`kind`): `'answer'` (`parts[{label, answer, re, wrong[{match,msg}], exact}]`; `exact: true` compares as text, for digit strings such as `01`; table blank cells accept `exact` too), `'choice'`
(`options[{text, ok, why}]`, `multi`), `'table'` (`head`, `rows` with `{a, why}` blank cells), `'trace'` (`code`, `vars[]`,
`steps[{line, values: {var: value or [accepted]}, show?: true | [vars], why?: {var: {wrong: msg}}}]`: a trace table, one row per time
execution passes a watched line, `'-'` for a variable that does not exist; graded as the table `MATHGRADE.traceTable` builds; the program
is shown with numbered lines and the line a blank asks about is lit; `test_course.js` runs the program with a capture after every watched
line and fails if a value, a step or a `'-'` is not what really happens); `solution` is HTML.

Parsons problem (`kind: 'parsons'`, `src/parsons.js` shared with `test_course.js`, `app.js: parsonsBlock`): `{ lines[] (the solution,
indented 4 spaces a level), distractors[]?, tests[]?, indent? (default: Python only), sampleStdin?, hints[], followup }`. Blocks are
shuffled by the exercise id (never into the solution order); the student adds them by click or Enter and moves, indents and removes them
with buttons or keys (Alt+↑/↓, ←/→, Delete), never only by dragging. With `tests`, the built program is graded like a code exercise (any
order that works passes; a distractor in a failing program gets its own message); without, order and indent must equal the solution and
the lines in place are marked. In brace languages the braces set the indentation, and unbalanced braces are reported before running.
Saved as `{ p: [[block, indent]] }` until passed, then as the program (`markDone`); the portfolio shows and re-checks the program.
Hints and followup are plain text, as in code exercises.

**Lesson length.** `lessonMinutes(course, lesson)` (app.js) estimates a lesson's time from its content: reading at
`course.readingWpm` words a minute (default 130; the mathematics course sets 60), 2.5 minutes per playground, 2 per
figure, 1 per predict-then-reveal box, 10 per code exercise and 12 per non-code exercise. Lessons over `LONG_LESSON`
(65) get "Longer than an hour: about N minutes" (rounded to 5) in the course's lesson list and a planning note under the
lesson's title. The programming lessons come out at 40–70 minutes (only Lisp lesson 2 is marked), the mathematics
lessons at 55–90 (eight of thirteen marked). Adjust the rates here, not per lesson.

Exercise ids are `<sp|py|ls|cp|ma|mc|jv|ds>-<n>-<k>` and are permanent: they are the keys for progress, portfolio links and Lab
files, and nothing reads a lesson number out of them (the Lab, the portfolio and the router find an exercise by id and
work out its lesson from where it is now). A lesson inserted mid-course takes the next unused `<n>` and later lessons
keep their ids, so `<n>` matches the lesson's position only up to the first insertion. In the mathematics course,
lesson 7 has `ma-13-1/2`, and lessons 8–13 have `ma-7-*` … `ma-12-*`.

## 7. Storage keys

| Key | Owner | Contents |
|---|---|---|
| `shortcourses.progress.v1` | app.js `Progress` | `{ done: {exId: timestamp}, code: {exId: savedCode or JSON answers}, pass: {exId: the code/answers that passed} }`; `markDone(id, code)` fills `pass` (for records without `pass`, the portfolio falls back to `code`, then to a Lab copy). A math exercise's answers are saved as `JSON.stringify` of one entry per input; a choice exercise therefore saves `[[indices]]` |
| `shortcourses.theme` | app.js | `'light'` / `'dark'` |
| `shortcourses.lab.v1` | lab.js | `{ lang, files: {python:[…], cpp:[…], java:[…], scheme:[…]}, active: {lang: idx}, fontSize, wrap, panels }`; a file is `{ name, code, ex?: {id, course, lesson}, asg?: assignmentId, asgSeen?, lastCheck? }` |
| `shortcourses.labhistory.v1` | lab.js via `labhistory.js` | `{ v: 1, files: { lang: { fileName: [{ t, why, code }] oldest first } } }`; `why` is a key of `LABHIST.WHY` (run, edit, opened, restore, replace, reset, terminal). Caps: 30 versions a file, 400 000 characters of code in all (the oldest version anywhere goes first), 100 000 a version, 400 files; a text is stored once per file. Read through `LABHIST.clean` (null-prototype maps, names and languages checked). **Not in backups**: it is a cache of earlier versions of files whose current text is in the file already, it would add up to 400 KB to every backup, and merging two histories has no clear rule; "Reset the Code Lab" clears it |
| `shortcourses.portfolio.v1` | portfolio.js | `{ name, note, unfinished, tasks, lab: ["<lang>/<file name>", …] }` (name starts as teach's `studentName` if set) |
| `shortcourses.classroom.v1` | classroom.js | `{ on, scale: index into [1.1, 1.25, 1.4, 1.6, 1.8], spot }` |
| `shortcourses.review.v1` | review.js | `{ v: 1, items: { id: { box 0-4, due, n, miss, last } } }`; id = `<course id>:<FNV-1a hash of the question and options, base 36>`; in the backup file (merge: the copy answered last wins) |
| `shortcourses.tour.v1` | tour.js | `'1'` once the tour has been opened (stops the Tour button's first-visit pulse); not in backups |
| `shortcourses.teach.v1` | teach.js | `{ teacher, name, studentName, assignments: {id: A}, book: {id: {studentName: entry}}, received: {id: studentCopy} }` |
| `shortcourses.shell.v1` | terminal.js | `{ v: 1, fs: { v: 1, cwd, root }, history: [lines] }`; `root` holds only `/home` and `/tmp` (`shell.js: fs.toJSON`); the system part (`/bin`, `/etc`, `/dev`) is rebuilt on load. A file is `{ t:'f', d, x?, m, bin? }`, a directory `{ t:'d', m, c: [[name, node], …] }` |

Bumping a `.vN` suffix is how a breaking layout change is handled (old data is simply ignored).

**The backup file** (`backup.js`) is JSON: `{ app: 'short-explorations-backup', v: 1, saved: ISO date, data: { progress, lab, portfolio, teach, shell } }`,
each part in the shape of its storage key, but rebuilt through strict checks (types, lengths, ids that are not members of
`Object.prototype`, dictionaries without a prototype) because a file is untrusted input like a link. `teach` holds only the student side
(`studentName`, `received`, never with hidden tests) unless the teacher ticks the box, which adds `assignments` (hidden tests included), `book`,
`teacher` and `name`. Restoring either replaces what is stored or adds what is missing (the device wins when the two differ; the newer
submission wins in the grade book), and then reloads the page, because the modules keep their state in memory.
**A new storage key that holds the student's work must be added to `backup.js`** (a `clean…` function that rebuilds it from untrusted
input, `collect`, `apply`, and a merge rule) and to `test_backup.js`, or it is silently left out of "Save my work to a file". Display
preferences (`theme`, `classroom`) are deliberately not in the file.

`shortcourses.ojibwe.v1` belonged to an earlier on/off switch for the Ojibwe words; do not reuse the name.

## 8. Data that travels in links (`teach.js: pack/unpack`)

`pack(obj)` = JSON → deflate-raw via `CompressionStream` (prefix `z`) or plain (prefix `p`) → base64url.
Assignment `A`: `{ id, v, title, lang, runtime?, text, starter, tests[{k:'stdin'|'call', in, expect, hidden}], hints[], roster[], author, due, created }`. `runtime` is `'full'` (C++ only) when the teacher chose Full C++; it is absent for the teaching interpreter, and `normalize` drops any other value. `toEx` passes it on, so `grade` uses the real compiler, and the Lab fixes the engine for a file of such an assignment.
Student copy = `A` minus hidden tests. Submission: `{ v, a: id, t: title, name, code, at, check }`.
Back-up: `{ v, assignments }`. Portfolio (`#/portfolio?p=`, same `pack`): `{ v, name, note, made, tasks,
items: [{ id, done: timestamp or 0, code }], lab: [{ lang, name, code }] }` — exercise titles, prompts and tests are
never in the link; they come from the viewer's copy of the courses, so re-checking cannot be forged. Lab share: `?l=<lang>&n=<name>&c=<base64url code>` (uncompressed).

## 9. The Code Lab (`lab.js`)

`LAB.page(query, kind)` builds the page; `LAB.openCode({lang, code, name, ex, step, subst, stdin})` is the entry point
used by the courses (`step: true` opens a C++ file straight into the memory stepper, `subst: true` a
Scheme file straight into the Substitution panel; every C++ playground has a "Step through memory"
button and every Scheme playground not marked `expectError` a "Show the substitution" button). Internals worth knowing:

- `LabEditor(opts)` — its own editor (not `makeEditor`): history, auto-indent/close, bracket match,
  find marks, autocomplete, current/trace line, `setLang`, `setFind`, `setTrace`, `goToLine`, `pos`.
  Marks are applied to the highlighted DOM by character offset (`markRanges`).
- Runners: Python and C++ run in sandboxes (see constraint 6). `build.js` does not run Skulpt or JSCPP in the page: it puts each
  interpreter's source, with its worker script, in an inert `<script type="text/plain" id="py-src">` (and `cpp-src`) block, and
  `runner.js` turns that text into a Blob worker. `PYRUN.run(code, {stdin, execLimit, onOutput, onInput, turtle})` and
  `CPPRUN.run` return `{out, err}`; `PYRUN.trace` drives the step-through (`next`, `finish`, `stop`); `cancel()` ends the sandbox.
  The page keeps time itself: a run is ended after `execLimit + 1.5 s` of busy time (waiting for `input()` or a step-through pause
  does not count) or 8 s of silence, and past 2 MB of output. A run in progress is `active`; runs queue one at a time. The worker is
  made again after it is ended (turtle runs get 90 s, since a drawing takes as long as its animation, and the browser pauses the
  animation of a frame that is off screen, so the Lab scrolls the canvas into view). Turtle needs a canvas, so those programs get a fresh sandboxed iframe in the turtle box; the iframe
  holds only `pyboot.js`, and the interpreter arrives by `postMessage` and is run with `eval` (the CSP allows script by hash, and
  `'unsafe-eval'` for Skulpt). If a browser cannot make a worker, the same interpreter goes in a hidden sandboxed iframe.
  **`killableWhile/killableFor` must stay off — they hang.** The tracer runs with `debugging: true` and `Sk.debug` suspensions
  (`$loc` at module level, `$tmps` inside functions) inside the sandbox and sends each pause as a `step` message.
  **Typed input for Java and the teaching C++** (`runner.js: typedRunner`, `typedInput` in `javaworker.js` and `cppworker.js`, `test_typed.js`):
  with no stdin and an `onInput`, a program that wants a line nobody has typed yet ends its run (`needInput`); the page asks in the output
  panel (or the terminal's command line), and runs it again from the start with every line so far. A worker cannot wait for the page without
  shared memory, which a copy opened from a file does not have, so replay works everywhere. The replay prints what the last run printed
  because it gets the same random numbers (Java: a seeded `Math.random`, `shuffle` and unseeded `Random`; JSCPP's `rand` starts the same each
  run) and a clock that jumps to each line's arrival time when the line is read (`currentTimeMillis`/`nanoTime`; C++ `time()`), so
  `srand(time(0))` keeps its secret number. Output already shown is skipped by the worker (`skip`). A Java `catch`/`finally` never sees the
  stop (`java.js: NEED_INPUT`). JSCPP's cin waits as a console does: `>>` until there is a word, `getline`/`get` until there is anything.
  Ctrl+D (null) is end of input. The Program input box (the Lab's **Input** button) gives stdin all at once instead; Full C++ and
  `scanf`/`getchar` read only from it. In `java.js`, System.in is one stream shared by every `Scanner` on it, handed out a line at a time, so a
  method that makes a new Scanner per call reads the next line, as on a console.
  Scheme: `makeRepl()` keeps one evaluator; `loadProgram` runs the file into it; each REPL entry resets the step budget.
  The evaluator (scheme.js) keeps its own stack of continuation frames on the heap, so non-tail recursion is limited
  by `MAX_STACK` (200 000 frames, then "maximum recursion depth exceeded"), not by the JS call stack; `do`, named-let
  inits, `letrec` and quasiquote still recurse into `evaluate`. Integers beyond 2^53 are BigInts (`isInt`, `norm`,
  `arith` in scheme.js keep arithmetic exact and fold results back to plain numbers when they fit).
- Memory stepper (C++): `CPPSTEP.trace(code, stdin, {prepare, errorText, maxSteps, maxMs})` runs in the C++ sandbox (`CPPRUN.trace`; the
  result is plain data and comes back by message, `CPPSTEP.render` draws it in the page) and runs the program
  under JSCPP's debugger (`debug: true`), stopping whenever the line changes, and records every snapshot:
  `{ steps: [{ line, frames: [{ name, global, vars: [{ id, name, type, kind: value|array|pointer, addr,
  bytes, value, cells?, text?, target?: {id, label, addr, gone?}, changed, fresh, unset? }] }], outLen,
  done? }], output, error, errorLine, truncated, finished }`. Addresses are synthetic: frames laid out
  from 1000 (globals from 100, string literals from 400), each variable aligned to its size, so an int
  then a pointer sit at 1000 and 1008 as in C++ lesson 5. Array vs pointer is decided from the
  declaring line (`name[` vs `*name`); array parameters are pointers. Because the run is recorded,
  the panel steps backwards too. A one-line loop body runs in one step (the debugger stops on line
  changes); stepping stops after 1500 lines or 5 s. Editing the file closes the panel.
- Substitution panel: `SUBST.create({maxSteps, onOutput}).traceProgram(code)`; applying a closure (a procedure
  made inside another call, e.g. `(define add5 (make-adder 5))`) also substitutes the values it remembers
  from its defining environment, and the note says so. → items (defines and
  per-expression step lists with `<mark class="redex|new">`).
- **Multi-file Java** (`src/javaproject.js`, `JPROJ`, pure, tested by `test_javaproject.js`): Run in Java joins every Java tab (the current one first,
  so its `main` runs if it has one) into one source text for the interpreter: leading `import` lines hoisted and de-duplicated, `package` lines
  dropped, a marker line `//@file Name.java` before each file. `mapError` turns `X.java:N:` and `(X.java:N)` of the joined text back into each
  file's own line (compile errors name the file as given, stack frames its base name, as javac/java do); `where` finds the first place an error
  names, for the go-to link (which opens that tab) and the editor marker. The Lab leaves out non-`.java` and empty tabs, exercise/assignment
  files (they run alone, as they are graded), and (`dedupe`) a tab that declares a class an earlier one has, because tabs are often separate
  programs each with its own `Main`; the public-class rule (`class Dog is public, should be declared in a file named Dog.java`) applies when two
  or more files are joined (`rule: 'multi'`), so a lone `from-course.java` keeps working. The terminal's `javac A.java B.java` / `javac *.java`
  uses `rule: 'always'`, writes a `.class` per top-level class whose `bin.src` is the joined text (markers included, so `JPROJ.fromJoined` maps
  a later run), and `java Name` passes `mainClass` to `java.js` (`Error: Main method not found in class X` when it has none). One file is
  compiled as it is. The interpreter does not know static imports.
- **Error markers**: `LabEditor.setMarks([{line, msg}])` tints the line (`.line.err`), puts a button pin in the gutter (title and aria-label carry
  the message; the highlighted copy under the textarea cannot take the pointer) and describes the textarea for screen readers. `lab.js` keeps one
  `errMark` (file, line, the file's code when marked): set by `showError` (Run, step-through, memory stepper) and by an exercise check's
  whole-program error; dropped by any change to that file (editor or terminal) and at the next run. Lines come from `labutil.js: errorLine`
  (Python "line N", C++ `main.cpp:N`), and for Java from `JPROJ.where`. Scheme errors have no line.
- **Program arguments** (`S.args`, per language, Python and Java only; sanitized by `labutil.js: cleanArgs` in `load()` and in backups): the
  Arguments box is split like a shell would (`splitArgs`: quotes, backslashes, at most 100 words) and reaches `sys.argv` (Skulpt's `sysargv`,
  always set because Skulpt keeps the previous run's) and `main(String[] args)` (`opts.args` in `java.js`). The terminal passes the words after
  the program's name. JSCPP calls `main` with no parameters, so C++ has none. The output panel's title bar (opt-in `outputPanel({tools})`) has
  Copy, Wrap (kept as `S.outWrap`) and Clear; Ctrl+G opens a go-to-line bar; the Shortcuts button under the editor lists every key (`KEYS_HTML`,
  kept in step with the keydown handlers).
- **File history** (the **History** button under the editor; `src/labhistory.js`, pure, `test_labhistory.js`): versions of each file under
  their own key (§7), keyed by language and file name: `rename` moves them with the file (the Lab's Rename), closing a tab or `rm` in the
  terminal's `~/lab` drops them (a terminal `mv` is a remove and an add, so it loses the history). Lab.js `snapshot(l, f, why)` is called on Run,
  after 30 s without typing (`histEdit`/`histFlush`; typing in another file keeps the first at once), at a file's first change in a visit
  (`opened`: the text as it was), and before Restore, Replace all (one file or all), the teacher tools' Reset to starter / Put the starter
  in the editor (`ctx.setCode`) and a terminal write-back. Templates, Open and share links make new tabs, so they replace nothing. The panel
  lists the versions newest first and draws `LABHIST.diff` (an LCS line diff after trimming the common start and end; a middle larger than
  4 million line pairs is shown as all removed then all added; lines compare with their newline, so a missing final newline is a change and
  says so) folded by `hunks` to three lines of context, as text nodes. Restore goes through `editor.replaceRange`, so Ctrl+Z undoes it and the
  usual change handling runs. **Compare files** in the same panel diffs any two tabs of the language.
- **Find in all files** (Ctrl+Shift+F in the editor or anywhere on the page, the **Search files** button, or **In all files** in the find bar):
  `LABHIST.search` over every tab of the language or of all (match case, whole word: no word character beside an end that is one; at most
  1000 matches); a result opens its tab (switching language if needed) with the match selected, or at its line if the text has changed
  since. Replace all is armed (`armConfirm`, with the count), keeps each changed file's text in its history first, and goes through the
  editor for the current file (undoable) and straight into the others.
- **Side by side** (`S.split`, a display choice of this device: `backup.js: cleanLab` leaves it out): `.lab-work` holds the editor area and
  `.lab-outcol` (verdict, arguments, input, output, terminal, step-throughs, turtle, REPL); `.split` makes them two grid columns. `applySplit`
  (a `ResizeObserver` on the main column) adds it only while that column is at least 860 px wide, so a narrow window or an open side panel
  puts the panels back under the editor without changing the setting.
- Bars above the editor: exercise bar (file has `ex`), assignment bar (file has `asg`), teacher panel.
- `teach.js` is mounted with a `ctx` object: `{ el, S, save, editor, armConfirm, isTouch, grade,
  renderVerdict, status, renderToolbar, openAssignmentFile, openReviewFile }` and returns
  `{ teacherSwitch, toolbarButton(), panel, assignmentBar(file), handleQuery(kind, query) }`.

## 9a. Portfolio and classroom mode

**Portfolio (`portfolio.js`).** `collect(settings)` builds the object above from `Progress` (completed exercises, plus
started ones when `unfinished`), and picked Lab files (files carrying `ex` are excluded: they are copies of exercises).
`renderDoc(P, {own})` draws the document: header, the student's note, a summary table (every course, "n of total"),
then course → lesson → item, math answers drawn per kind (`answer` as label/value rows, `choice` as the chosen
options, `table` filled in). Ids not in the current courses go under "Other work". The own page re-renders on every
settings change; buttons are Print (print rules hide the controls and start each course on a new page), Download
(the rendered document plus every inline `<style>`, no scripts) and Make a link. `checkAll` (received page) runs
`grade()` or `MATHGRADE.grade()` on each item in turn and writes a line under it; the headline counts only items
marked completed.

**Classroom mode (`classroom.js`).** Toggled by `CLASSROOM.button()` in the top bar (hidden below 700px unless on).
`html.classroom` sets `font-size: calc(16px * var(--cls-scale))`, darker `--ink-2/3` and `--rule`, a one-column lesson,
and scales the Lab editor. On a lesson page the steps are built from `.lesson-body`: each child of a `.prose` block is a
step, other blocks (playground, figure, listing, aside, exercise) are one step each, and a heading or a paragraph ending
in a colon joins the step after it. Step elements get `.cls-item`; the current ones `.cls-cur`; `html.cls-spot` dims the
rest. One absolutely-positioned `.cls-cursor` in the left margin is moved to the current step (ResizeObserver keeps it
in place when outputs grow). The action for a step: `<details>` → toggle, `.play` → click its Run button. Keys are
handled on `document` only when classroom mode is on, never inside input/textarea/select/contenteditable, and never when
another handler already called `preventDefault` (the Lab's steppers use N/B/arrows). Next past the last step follows
`.lesson-foot .pager.next`. A link with an exercise id starts the marker at that exercise.

**The tour (`tour.js`).** `TOUR.button()` is the Tour button app.js puts in the top bar (`.top-tools`, with the classroom and
theme buttons); it pulses until the tour has been opened once. `TOUR.start()` appends three fixed elements to `body`: a
full-screen `.tour-block` that swallows clicks, a `.tour-spot` whose huge box-shadow dims everything but the target, and the
`.tour-card` (title, text, dots, Back/Skip/Next). `STEPS` is a list of `{ route, target, title, text, place?, optional? }`:
`go(i)` sets `location.hash` when the step's route differs from the current one, then `waitFor(target, 4000)` polls for the
selector (the router renders asynchronously), scrolls it into view (`reveal`: not at all if visible, to the top edge for top-bar
targets and tall ones, else centred) and places the card below it, above when `place: 'top'` or there is no room, as a
bottom sheet under 640 px. An `optional` step whose target is missing (the backup section before PORTFOLIO loads, the teacher
switch) is skipped; any other missing target shows a one-line notice instead of its text. Esc, Skip, ×, Finish or a
`hashchange` the tour did not cause (`state.navigating` is set around its own) call `end()`, which removes the three elements
and the listeners. Arrow keys and Enter step. Nothing is saved but the "seen" flag.

## 9b. Ojibwe words and the clock (`ojibwe.js`)

The site carries no school's name and no place names or community-specific sources; keep it that way.

**Interface words.** `OJIBWE.WORDS` maps a key to `{ oj, en, pos, gloss, src, srcName, where }`; every `oj` is copied
letter for letter (plain `'` for the glottal stop; capital first letter only) from the Ojibwe People's Dictionary
(Central Southwestern Ojibwe, double-vowel spelling), and `src` is the entry it came from. **Never add a word that is
not copied from the dictionary (or supplied by a speaker), and never inflect one**: only forms the entry itself lists
(plural, imperative). The words are always shown, each beside its English: Boozhoo (home greeting), Ojibwemowin
(title of `#/ojibwe`), Gikinoo'amaagoowin / Gikinoo'amaagoowinan ("Lesson n" in the crumb and phone menu, "Lessons"
on course pages), Gojitoon (the "Try it" label of playgrounds, a `.play-label` span), Gojibizotoon (the Check answer
button of both exercise kinds; the code-exercise button restores it with `replaceChildren(lbl('check'))` after
"Checking…") and Miigwech ("Thank you", the About page credits heading). app.js reaches them through `lbl(key)`.
`OJIBWE.LESSON_WORDS` lists the Ojibwe words the lessons use as example data (boozhoo, miigwech, makwa, nibi, mitig
in Python lesson 9 and Lisp lesson 10), each with its dictionary entry; `#/ojibwe` shows them. Mathematics lesson 7
uses words already on the site (the interface, day and hour words) as spelling examples, and `#/ojibwe` says so. A lesson that adds
Ojibwe words must use dictionary forms and add them here.
`OJIBWE.CANDIDATES` lists interface words without Ojibwe yet, with dictionary entries that might fit, for a speaker to
review on `#/ojibwe`; they are not shown on the site.

`OJIBWE.label(key, suffix)` returns `<span class="oj-pair"><span class="oj" lang="ciw">…</span> <span
class="oj-en">English</span></span>`; `text(key)` returns the Ojibwe alone.

**The clock.** `OJIBWE.DAYS` (index = `Date.getDay()`), `OJIBWE.HOURS` (index 1–11) and `OJIBWE.PARTS` (afterMidnight,
morning, noon, afternoon, evening, night, midnight) hold "it is …" verbs (vii) copied whole from the dictionary, each
`{ oj, en, src, alt? }`; `alt` lists the other forms the dictionary gives (shown on `#/ojibwe`). `timeWords(date)` returns
the sentences: the day; then midnight (0h) or noon (12h) alone, else the part of the day (1–4 after midnight, 5–11
morning, 13–17 afternoon, 18–21 evening, 22–23 night) and the hour that has begun (`HOURS[h % 12]`). Minutes stay as
digits (the dictionary has no pattern for them) and there is no "twelve o'clock" form, hence noon and midnight.
**Never join, inflect or extend these words** (no "today", no minute phrases) unless a speaker supplies the form.
`clock({links})` returns a self-updating element: it redraws at the start of every minute (a timeout aimed at the next
minute boundary), and at once on `visibilitychange` when the tab is shown again, because browsers pause timers in
background tabs and on sleeping computers; it stops its timer and listener once it has left the page used in the home hero, with links to
the `#oj-time` section of `#/ojibwe` (through a sessionStorage jump) and to the Code Lab, and on `#/ojibwe` itself.
`clockProgram(day, hour)` writes the same logic as a Python program from the same lists; it is added to
`LAB.TEMPLATES.python` as "Ojibwe clock" (ojibwe.js loads after lab.js) and opened with the current day and hour
from the clock's link.

API: `{ label, text, page, clock, timeWords, clockProgram, WORDS, LESSON_WORDS, CANDIDATES, DAYS, HOURS, PARTS }`.

Licence: dictionary entries are © The Ojibwe People's Dictionary, CC BY-NC-SA 3.0. The attribution on `#/ojibwe`
must stay; the site must stay non-commercial; and ojibwe.js (an adaptation of their entries)
is under the same licence. The rest of the site can take
any licence, but ojibwe.js carries BY-NC-SA.

## 9c. About and credits (`about.js`)

`ABOUT.page()` renders `#/about`: `SITE.about` (the author's own words), `SITE.contact` if any, "What the site keeps
about you" (plain-language privacy: localStorage only, links carry their contents, the page makes no outside request), "Using and sharing" (the licence), "Credits" (Ojibwe sources, SICP, software, typefaces, trademarks) and a
footer with `SITE.footer`, the build date and `SITE.sourceUrl` when set. Linked from the home footer, the `#/ojibwe`
credit, and the guide (sections 1 and 10).

Licence: `SITE.licence` is `{ code: MIT, content: CC BY-SA 4.0 }`, so the page shows a three-row table (lessons and
guide, program code, and `ojibwe.js` under CC BY-NC-SA 3.0) with the SICP and Ojibwe notes under it. (If it were
`null`, the page would say the site is free for learning and teaching and ask people to get in touch before
republishing.) The repository states the same in `LICENSE` and `LICENSE-CONTENT.md`, and each course file and
guide.js opens with a one-line licence comment; keep the three in step.

Third-party software: `build.js` writes `window.BUILD = { date, thirdParty: [{ name, version, licence, url, role,
changes, text }] }` before any script, reading each package's version from its `package.json` and its full licence
text from its LICENSE file (pegjs-util: the "License" section of its README). The page lists them and prints every
text in a `<details>`, which is how the bundled MIT code carries its notice; build.js also writes the same texts to
`THIRD-PARTY-NOTICES.md` at the repository root. **When a bundled library is added,
upgraded or patched, update the `THIRD_PARTY` list in `build.js`** (the build fails loudly if a licence text is missing).
Current list: Skulpt (with its Python Software Foundation note), JSCPP (with a line describing the site's patches), and inside
the JSCPP bundle Lodash, printf, pegjs-util and PEG.js (which generated JSCPP's parser). esbuild is a build tool only
and is not shipped.

Other credits on the page: the Lisp course adapts examples, exercises (2.33, 2.38, 2.54–2.56) and the
symbolic-differentiation project from SICP, which is CC BY-SA 4.0. The licence requires credit, a link to the licence,
a note that changes were made, and the same licence for the adaptation, so the Lisp course's `textbook` block and the
About page say all four, and the About licence section always states it (like the Ojibwe note). Each lesson names the
SICP section it draws on; keep doing that. Also credited: Bentley's *Programming Pearls* (C++ lesson 10's binary-search
story) and the trademarks Hour of Code (Code.org), Python (PSF) and QR Code (DENSO WAVE, which asks for that line
wherever the term is used).

## 9d. Full C++ (real Clang in the browser)

C++ has two engines. The *teaching engine* is JSCPP (SC 103): small, always in the page bundle, works offline, and is the only one the
memory stepper understands. *Full C++* is Clang 22 compiled to WebAssembly (`@live-codes/clang-wasm`, pinned in `package.json`): all of the
language and the standard library, wasm32 (`long` and pointers are 4 bytes), no exceptions or threads (the sysroot has none), no checking of
out-of-range indexes (an out-of-range `.at()` aborts the program). It is used by the Code Lab's "Engine" button and by every course
with `runtime: 'full'` (SC 105); an exercise inherits `runtime` from its course (`renderBlocks`, `findExercise`).

- **Files, not in the page.** `build.js` copies the compiler's files (about 28 MB: `bin/*.wasm.gz`, the sysroot, the manifest, and the
  toolchain script as `toolchain.js`) to `dist/clang/<package version>/` (git-ignored; Cloudflare's build command makes them), writes
  `BUILD.clang = {path, mb}` into the page, and gives that directory `Cache-Control: immutable` in `_headers`. The directory name carries the
  version, so a new version never meets an old cached file. A copy of the site opened from `file://`, or built without the files, shows
  "not available" and nothing else changes.
- **Loading.** `runner.js` (`CLANGRUN`) fetches `toolchain.js`, puts `self.CLANG_BASE` and it in front of `clangworker.js` (a data block,
  `clang-src`) and starts a blob Web Worker from the lot. No iframe fallback: if the worker cannot start, it says so. The worker downloads
  the rest from `CLANG_BASE` (progress messages feed the "Getting the C++ compiler… 34%" line). This is why the policy has
  `connect-src 'self'`; it is the only reason, and it also lets the Python and JSCPP workers ask for this site's own (public) files.
- **Consent.** Nothing is fetched until the student agrees (`CLANGRUN.allow()`, remembered in localStorage under `se.realcpp`); the box
  is shown in the output panel or the verdict (`fullCpp()` in app.js).
- **The output panel is drawn as a terminal** (`outputPanel()` in app.js, `.out.term` in style.css): dark in both themes, a title bar with a
  status pill, a prompt line with the command that "ran" (`COMMANDS` per language), stderr in red, notes dimmed, a blinking cursor while
  the program runs, and `input()` answered on an inline prompt. `start(cmd)` opens a run and `finish({exit, stopped})` closes it with the
  status and the elapsed time; `runCell` and the Lab call both. Everything written into it is a text node: sandbox output is never HTML.
- **Running.** One worker, kept alive: the program is compiled once (about 1–4 s) and executed once per input (milliseconds). Warnings of a
  successful compile come back as a `note`. A run is limited by the page's watchdog (`10 s + 2 s per input`, compile included); a program that
  does not finish ends the worker, and the next run loads the compiler again from the browser's cache (about 2–3 s). Output is capped at 2 MB.
- **Grading.** `grade(ex, code, host)` uses `CPPFULL.harness` (`src/cppfull.js`): tests that call a function share one `main()`
  that reads the test's number from the first line of stdin (so a whole exercise is one compile); compile errors are moved back by the
  lines the harness put before the student's code. Exercises of a full course do not mix call tests with whole-program tests.
- **Standard.** With Full C++ the Lab shows a C++17 / 20 / 23 picker (`S.cppStd`, default `gnu++20`, saved in the Lab state and in back-ups); the worker accepts only `gnu++11`…`gnu++23`. Checks of exercises and assignments always use the default, so a student's choice cannot change a result.
- **C.** The Code Lab's fifth language (`LANG_INFO.c`, first file `main.c`) is the same compiler run as C: the worker's `run` message takes
  `lang: 'c'` (compiled as `main.c` with `language: 'C'`), the same download and the same agreement (`fullCpp()` in app.js words the box for
  C; `Runners.c`). There is no teaching engine and no stepper for C. Standards: the Lab's picker offers C99 / C11 / C17 / C23 as the GNU
  dialects `gnu99`…`gnu23` (`S.cStd`, default `gnu17`, saved and backed up as `cStd`), because strict `-std=c17` hides POSIX names students use
  (`M_PI`, `strdup`); the terminal's `gcc -std=c99` passes the strict one, as gcc would (`stdFor` in the worker accepts `c|gnu` with 89…23 and
  nothing else). The worker appends three lines AFTER the student's code (`C_TAIL`, so no line number moves): a constructor that makes
  stdout unbuffered, as a terminal shows it (otherwise `printf("Name? ")` would still be in the buffer when `scanf` reads, and typed input
  would ask before the question is on screen), and a `clock()`, which wasi-libc leaves out (no process clock in WASI), counting from the
  program's start. A student's own function named `clock` or `setvbuf` would clash with it; nothing in the courses does that. `argv` is
  passed (`args`, `argv0`: the Arguments box, or the words after `./prog` in the terminal); the worker sends what is printed in pieces of at
  most 4 KB or 50 ms, and all of it before each read, since unbuffered output would otherwise be one message per `putchar`.
- **Typed input for C** (`clangTyped` in runner.js; `typedInput` and `replayed` in clangworker.js). The compiler's worker cannot wait for the
  page either, so C uses the replay of Java and the teaching C++: a read past the lines typed so far throws out of the stdin callback, the run
  ends with `needInput`, the page asks, and the program runs again from the start with one more line; the first `skip` characters of output
  are not sent again. It works because the build is cached by source (`lastGood`), so a replay costs milliseconds, and because a replay can be
  made to see what the run before it saw: `rand()` starts from the same seed in every run, and while a typed run goes on the program's WASI
  `clock_time_get` and `random_get` are wrapped (the only module instantiated with WASI imports then is the student's), so `time()` follows a
  clock that reaches each line's time as it is read (`srand(time(0))` picks the same numbers in every replay) and `getentropy` gets bytes from
  the run's seed. Compiler warnings are shown once, from the first run. Full C++ keeps reading its input before it starts (the Input box).
- **Errors in C.** `LABUTIL.errorLine('c', …)` takes the first `main.c:N:C: error` line (a warning may come first), so the editor marks and
  "go to line" work for the current tab whatever its name; the terminal's `gcc` rewrites `main.c:` to the file's own name, as gcc prints it.
  `TIPS.c` in app.js explains the common clang C errors (a missing `#include`, a function used before it is declared, `.` for `->`, `=` on an
  array, a missing `&` in `scanf`, undefined symbols) and the run-time crashes. C does not check array indexes, so an out-of-range write may
  go on silently; only a wild pointer or `abort()` stops the program.
- **The terminal's C.** `gcc`, `cc` and `clang` compile a `.c` as C (`bin.lang 'c'`, with the standard it was built with); `g++` and
  `clang++` compile any file as C++, as the real drivers do, so `g++` on a `.cpp` is unchanged. `./prog` runs the source again through
  `Runners.c` (compiled once: the worker still has that build), with typed input from the keyboard or the pipe or file it is given.
  `test_c.js` runs the real worker in node's `worker_threads` with the node build of the toolchain (output, argv, exit status, compile
  errors, C99 refusing C23, typed replay with `srand(time(0))`), and drives the shell's `gcc` with stub hooks.
- **Security of Full C++** (reviewed once; `test_browser.js` §7b and `test_security.js` §5 keep these true):
  - *What a program can reach.* It is WebAssembly with only WASI imports on a private in-memory file system that is new for every run (nothing is
    written from one run, or one program, to the next; there is no host file, socket or environment). It runs in a blob worker, so no DOM,
    storage or page. Its memory is capped at 256 MB by rewriting the memory section of the module before it runs (`limitMemory` in
    `clangworker.js`); output is capped at 2 MB in the worker and again in the page; the page's watchdog ends the worker; `std` is checked against
    a list. Compiler warnings and errors are shown as text.
  - *The compiler as a target.* Source that makes clang exhaust memory or crash used to leave the build with the PREVIOUS program's object file and
    run it (found in review: in a teacher's review, one student's crashing source would have been graded as the program compiled before it).
    Now both output files are emptied before each compile of different source, clang's own `error:` lines count as failure whatever the exit
    code, and a failed build returns no results. Compiler memory is capped at 1 GB (modules over 1 MB are patched as they are compiled).
  - *The download.* Only after the student agrees, only from this site. `toolchain.js` is checked against the SHA-256 in `BUILD.clang.sha256`
    before it is run; the toolchain checks every compiler file it fetches against hashes it carries (so it needs `crypto.subtle`: https or
    localhost, which `CLANGRUN.unavailable()` says). The compiler packages are pinned, have no install scripts, and `npm audit` is clean;
    their binaries are third-party builds, trusted as far as those hashes and the lockfile's integrity values go.
  - *What `connect-src 'self'` allows.* A taken-over sandbox could ask for this site's own public files. The interpreters' workers
    (`lockdown.js`, run before any program) have `fetch`, `XMLHttpRequest`, `WebSocket`, `Worker`, `indexedDB`, `caches` and the like removed
    from the global object and its prototypes. Skulpt reads `importScripts` while loading, so for Python the lockdown follows Skulpt.
  - *Accepted.* A hostile source can still use up to about 1 GB of compiler memory for the 10 or so seconds before the watchdog ends it. A
    student's program sees the stdin of every test it is run on (it must), and the harness's `main()` is in the same file as the student's
    code, so a student can read or fake what the checker prints; the checker is not designed against a determined cheat.
- **Testing.** `node test_course.js modern` uses the same toolchain in node; it takes about a minute (every compile is real). The browser
  test serves `dist/` from a local web server (the compiler cannot load from `file://`).
- Updating the compiler: bump `@live-codes/clang-wasm` (exact version), rebuild, run `npm test` and the browser test. Its notices are
  appended to `THIRD-PARTY-NOTICES.md` by `build.js`.

## 9e. Java (the site's own interpreter)

Java has no compiler small enough to put in the page and no JVM that runs in a browser without another origin or tens of megabytes
of class files, so the site has its own: `src/java.js`, a lexer, parser, type checker and tree-walking interpreter for the part of Java an
introductory course uses. It runs in a Web Worker like JSCPP (`src/javaworker.js`, data block `java-src`, behind `lockdown.js`), is reached
through `JAVARUN.run(code, {stdin, onOutput})` in `runner.js`, and is also loaded by node for the tests. `src/javautil.js` (in the page and
in the tests) wraps method-writing exercises in a class with a `main`.

- **What it checks.** The checker resolves every name, types every expression, picks overloads (JLS 15.12 phases: no boxing, boxing,
  varargs), inserts the conversions Java applies (widening, boxing, int→long as BigInt), checks access (`private`), static context,
  abstract-method implementation, overriding, missing `return` (JLS 14.22, simplified) and definite assignment (JLS 16, simplified), and
  reports errors **in javac's words** (`Main.java:4: error: ';' expected`, `incompatible types: possible lossy conversion from double to
  int`, `cannot find symbol` with symbol/location lines, `variable x might not have been initialized`), sometimes with a hint line in
  parentheses that javac does not give. The file name in the message is the public class's (`Hello.java`), as javac would require.
- **What it runs like.** `int` arithmetic is 32-bit (`|0`, `Math.imul`), `long` is a BigInt wrapped with `asIntN(64)`, `double` prints as
  `Double.toString` does (`1.0E7`, `0.1 + 0.2`), `float` is rounded with `Math.fround`, `char` is a number whose static type decides how it
  prints, strings hash as `String.hashCode`. `HashMap`/`HashSet` iterate in the real bucket order (hash spread, table of 16 doubling at
  3/4), so a printed map matches real Java; `TreeMap`/`TreeSet` sort. `Random` is Java's 48-bit LCG bit for bit (`new Random(42).nextInt()`
  is -1170105035). `Integer == Integer` is true only for -128..127, as in Java. Uncaught exceptions print `Exception in thread "main"
  java.lang.ArithmeticException: / by zero` with a stack trace of `at Main.divide(Main.java:2)` lines; `NullPointerException` carries the
  helpful message (`Cannot invoke "String.length()" because "name" is null`). A for-each that modifies its `ArrayList` throws
  `ConcurrentModificationException` with Java's exact quirk (removing the second-to-last element ends the loop silently).
- **Values.** Primitives are JS numbers/booleans/BigInt; a `double`, `float` or `char` stored in a reference-typed slot (`Object`, a type
  parameter) is boxed in a `JBox` so it still prints as what it was; objects are `JObj {cls, f}` (a field that hides a parent's field gets
  its own key), arrays `JArr {et, a}`, lists `JList`, maps `JMap` (bucket model), sets `JSet`, `StringBuilder` `JSB`.
- **Library.** Defined in a table (`def(name, {ctors, methods, statics, fields})`) with javac-style signatures (`'substring(int,int)'`,
  `'add(E)'`, `'sort(List<T>)'`): String, StringBuilder, the boxed types, Math, System (`out`, `err`, `in`, `exit`, `arraycopy`),
  PrintStream (`print`/`println` overloads, `printf`/`format` with `%d %s %f %e %x %c %b %n`, flags, width, precision, grouping, and
  `IllegalFormatConversionException` when the types disagree), Scanner (on `System.in` or a String; the `nextInt`/`nextLine` trap behaves as
  in Java), Random, Arrays, Collections, Objects, ArrayList/LinkedList/List, Queue/Deque/ArrayDeque (own method tables, no index
  methods: `remove(x)` removes a value, as in Java), HashMap/TreeMap/Map/Map.Entry, HashSet/TreeSet/Set (TreeSet/TreeMap navigation:
  `floor`, `higher`, `firstEntry`, `headMap`, ... returning copies, not views), Iterable/Iterator (with `remove`), Comparable, Comparator (a
  user class implementing `compare`; `reversed`, `Collections.reverseOrder`), Object, Class (`getSimpleName`), and the exception hierarchy
  as real classes a program can extend. `%f %e %g` round the shortest decimal half-up, as `java.util.Formatter` does (not `toFixed`).
  Exception messages use JDK 21's wording (`Index 5 out of bounds for length 3`, `Range [2, 1) out of bounds for length 3`).
- **Not covered** (the parser says so in plain words): generics in user classes, lambdas and method references, nested/anonymous/local
  classes, enums, records, interfaces with default-method bodies on user classes are fine but `switch` patterns are not, try-with-resources,
  streams, threads, files, checked-exception analysis beyond what is written in the source (`throws` is enforced for `throw new X` and for calls of the program's own methods and constructors: `checkedExceptions` in java.js). `==` between two Strings compares the text (Java
  compares references), so lesson 2 shows that trap as a listing, not a runnable example. Recursion deeper than `MAX_DEPTH` (1200) calls is a
  `StackOverflowError`, and in a browser the worker's JS stack gives out sooner, at about 270 calls (real Java allows about ten thousand).
- **Limits and safety.** The worker's watchdog is 8 s and the interpreter's own `maxMs` 5 s (checked every 1024 steps); output is capped
  at 2 MB in the interpreter and the page; arrays over 50 million elements are an `OutOfMemoryError`. The interpreter never evaluates
  JavaScript text and is behind `lockdown.js` like the others. Speed: about 2 million simple loop iterations a second in Chromium
  (a sieve to 10^6 takes about 2 s), much faster than JSCPP and far slower than the JVM.
- **Grading.** `grade(ex, code)` runs each test through `JAVARUN`; a compile error ends the check at once with the error (as javac would),
  a runtime exception is one test's failure. Tests are `{stdin, expect}` for whole programs, `{call, expect}` / `{setup, call, expect}` /
  `{name, main, expect}` for method exercises (`javautil.js` supplies `public class Main` and `main`; `ex.prelude` for imports), and with
  `ex.classes: true` the student's whole classes are tested by a `class Check` put in front of them. Line numbers in messages are shifted
  back to the student's lines.
- **Testing.** `node test_java.js` checks the interpreter against outputs of real javac/java; `node test_course.js java` grades the course;
  the browser test runs Java in the worker, checks the lockdown and the Lab. `node test_diff.js java` (§11) runs every lesson example and
  exercise of SC 106 and SC 107, the probe programs and generated programs on both the interpreter and a real JDK 21 and compares them.
- **Step-through** (the Lab's "Step through" for Java, and a "Step through" button on every Java lesson example). The interpreter cannot pause,
  so `JAVA.trace(code, stdin, {maxSteps, maxMs})` runs the program once in the worker (`{t:'trace'}` → `{t:'result', trace}`, `JAVARUN.trace`)
  and records, before each statement (and at a loop's header each time round), `{ line, frames: [{cls, name, line, vars: [[name, type, value,
  param]]}], statics, heap: [{id, k: obj|array|list|set|map|sb, cls, len, cells | entries | fields | text}], outLen, done?, error?, skipped?,
  more? }`. A value is the text Java would print (`"hi"`, `'x'`, `3.0`, `null`) or the number of a heap object; numbers are given in the order
  objects are first seen and never change, so two variables showing `→ #3` share one object. Names come from the checker: `stmt()` puts on each
  statement, under symbol keys (the checker's walkers enumerate every ordinary key), the scope it was checked in and how many slots had been handed
  out; a local is visible when it is in that scope chain with a smaller slot, so a loop variable is gone after its loop. The hot path pays one
  `R.tr !== null` test per statement (and per loop turn); nothing is added to `ev()`, and a frame's JS stack size is unchanged (checked in
  node with a small `--stack-size`). Cost control: a frame below the top cannot change its locals, so its snapshot is made once and shared;
  an object whose record is unchanged reuses the previous record (shared again by the structured clone of the message); 40 cells per
  container, 60 objects and 24 frames (main and the innermost 23) per step, strings cut at 60 characters, 2000 steps, after which the program is
  stopped and the page says so. The recorder never runs the program's code: a `TreeMap`/`TreeSet` of the program's objects is drawn in insertion
  order rather than calling `compareTo`. An uncaught exception ends the record with a step drawn from the frames saved in the exception (its
  line is the throw). A Scanner program takes the Program input box (as Run does; the run is recorded in one go, so it cannot stop to ask).
  `src/javastep.js` (in the page) checks the record (`clean`) and draws it with `el()`: call stack beside the objects, changed values
  highlighted, pointing at a reference lights up its object. `test_javatrace.js` checks the record and traces every lesson example, exercise
  solution and probe, which must print exactly what a plain run prints. Not shown: return values, the expression being evaluated within a
  statement, and a constructor's frame while a field initializer runs (it has no statement).
- **Floating point.** Arithmetic, `Math.sqrt/floor/ceil/rint/abs` and `pow` with small integer exponents are exact (IEEE rounding is the
  same in both); `Math.sin/log/exp/pow/hypot/atan2...` use JavaScript's math library, which can differ from the JVM's in the last binary
  digit (so the printed value can differ in its last decimal). The generated tests compare those to 12 significant digits.

## 9f. The practice terminal (`shell.js`, `terminal.js`)

A command line for learning the Unix shell, in the Code Lab (the **Terminal** button; a course on it is planned). Design notes:

- **It is a shell, not an emulator.** `shell.js` has its own tokenizer and parser (words with `' " \` quoting, `$VAR ${VAR} $? $# $@ $1` and the `${…}` forms (default `:-` `:=` `:+`, length, slices with negative offsets, `#` `##` `%` `%%` pattern removal, `/` `//` `/#` `/%` substitution, `^` `,` case; others are "bad substitution"),
  `$(…)`, `$((…))` (with `?:`, `a[i]` and `$(…)` inside), `{a,b}` and `{1..5}`, `~`, `* ? […]`, `> >> < 2> 2>&1 | ; && || !`, `if/elif/else/fi`,
  `for/in/do/done`, `for ((;;))`, `while`, `until`, `case/esac` (with `|`, `;;`, `;&`, `;;&`), `(( ))`, `break`/`continue [n]`, `time [-p]`,
  `{ }` and `( )`), an executor that runs pipelines stage by stage (each stage's output buffered into the next: nothing runs concurrently),
  and about ninety commands (130 names) written here with GNU's wording for their errors (`ls: cannot access 'x': No such file or directory`,
  `bash: x: command not found`, exit 127, and so on). `help` lists them, `man NAME` prints a page from the same table (`COMMANDS`).
  No `eval`, no `new Function`; the module has no DOM and runs in node (`test_shell.js`).
- **Read a line at a time.** `parser(src, { aliases }).next()` returns the commands up to the next newline, and `exec`/`runScript` run each
  before reading the next, as bash does: an alias defined on one line works from the next one, and a syntax error further down a script
  stops it there (the lines before it have run). An expansion error (`$((1/0))`, a bad `${…}`, a bad array subscript on assignment, a
  function nested too deep) drops the rest of its line only. `parse(src)` still reads everything at once.
- **Functions** (`name() { …; }`, `function name { …; }`, any compound command as the body, redirections on it) are kept in `sh.funcs`
  (a null-prototype dictionary) and found before builtins and commands (`command name` skips them). They run in the same shell with their own
  `$1…`, `$#`, `$@` (`$0` stays); `local` saves what a name held and puts it back on return (dynamic scope, as in bash); `return [n]`
  (also ends a `source`d script). Nesting stops at `FUNCNEST` or `LIMITS.funcDepth` (500) with bash's message, `f: maximum function nesting
  level exceeded (500)`; the step limit still bounds the work. `type f` and `declare -f` print the body in bash's own layout (`printFunc`:
  four spaces a level, `;` after each command inside `if`/`for`/`while`, `elif` as `else` + `if`), from the words as typed (tokens keep `raw`).
- **Arrays**: `sh.arrays[name] = { v: sparse JS array, n, bytes }`; a name is a variable or an array, not both (`$a` is
  `${a[0]}`, `a[1]=x` turns a variable into an array). `a=(…)`, `a=([3]=x y)`, `a+=(…)`, `a[i]=x`, `${a[i]}` (i is arithmetic, negative counts from the end),
  `${a[@]}`/`"${a[@]}"`/`${a[*]}`, `${#a[@]}`, `${#a[i]}`, `${!a[@]}`, `${a[@]:from:len}`, `unset 'a[i]'`, `declare -a`/`-p`, `local -a`,
  `read -a`, `mapfile`/`readarray` (-t -n -s -O -d). Capped at `LIMITS.array` (10 000) values and 4 × `LIMITS.vars` characters each (keys
  included): past that the line stops with a message. **Associative** ones (`declare -A`, `local -A`): `{ assoc: true, v: null-prototype
  dictionary, b: buckets, nb }`, so `__proto__` or a key with spaces is an ordinary key; the key of `m[key]=v`, `${m[key]}` and `(( m[$w]++ ))`
  is text, not arithmetic (`arith`'s `assocP`), and may not be empty (`bad array subscript`, with the subscript as typed). Keys come out
  (`${!m[@]}`, `"${m[@]}"`, `declare -p m`) in **bash's own order**: `fnv` is bash's hash (FNV-1 over the key's UTF-8 bytes as signed chars),
  1024 buckets, the newest key first in its bucket, four times the buckets once there are twice as many keys (hashlib.c), so the differential
  tests compare the order itself (3000 keys included). `declare -A m=(a 1 b 2)` takes pairs; plain words among `[k]=v` ones get bash's "must
  use subscript" message; converting between the two kinds is refused with bash's message; `declare -p` writes `declare -A m=([k]="v" )`
  (keys quoted only when the shell would read them otherwise; values with control characters as `$'…'`, as bash does for any variable).
  `unset 'm[@]'` removes the key `@` (bash 5.2). Not here: `m[a b]=x` without quotes (bash reads the brackets of an assignment as one word;
  here quote the key), `${!m[@]:0:2}`.
- **Here-documents** (`tokenize`: `pending`, `readBodies`): `<<WORD` (and `<<-WORD`, leading tabs removed) waits for the end of its line; the
  lines after it, up to a line that is exactly WORD, are its text, so several on one line take their texts in order, and they work in functions
  (`declare -f` prints the text after the command, as bash does), loops, `$(…)` and scripts. A quoted WORD (any of `' " \`) keeps the text as it
  is; otherwise `hereParts` reads it like the inside of `"…"` (a `"` is only a character; `\` before a newline joins lines). The redirection
  carries the record (`r.hd`); stdin is the text, expanded each time the command runs. With no line holding WORD the text runs to the end
  with bash's "warning: here-document at line N delimited by end-of-file (wanted \`WORD')", given through the parser's `warn` as the command is
  read (in a script: `name: line LAST:`). **At the prompt** (`io.tty` with `io.ask`), `sh.exec` asks for more lines with `> ` while the
  tokenizer says a here-document is still open (`toks.open`; the terminal shows a hint in the placeholder: `ask(prompt, hint)`), Ctrl+D ends
  it (the warning), Ctrl+C cancels (`^C`, 130), at most 10 000 lines and 256 KB; the history keeps the first line only (the command line
  cannot hold the others). `<<< word`: the word expanded (not split, no wildcards) and a newline. A lesson example's terminal runs its lines one
  by one, so a here-document there would wait for the student: write such an example as a script file. Not here: a here-document inside
  `$(…)` whose text has an unmatched `'` or `)` (the `$(…)` reader does not know about here-documents).
- **`[[ … ]]`** (`condExpr` in the parser, `condEval`): `== = !=` with a pattern on the right (quoted parts literal, `~` expanded), `< >` on
  text, `=~` with a POSIX extended expression (`posixRegex`; quoted parts literal; the tokenizer reads the expression as one word, `( ) |` and
  spaces inside brackets included) setting `BASH_REMATCH`, `-eq -ne -lt -le -gt -ge` on arithmetic (`[[ x+1 -eq 2 ]]`; an error says
  `bash: [[: …` and that test is false), `-nt -ot -ef`, the unary tests of `test` plus `-v name`/`-v a[i]`, `&& || ! ( )`, newlines after `&&`
  and `||`, no splitting or globbing. A regular expression that does not compile gives status 2. Syntax errors are bash's own, line by line:
  what was wrong ("conditional binary operator expected", "unexpected argument ]] to conditional unary operator", …), then "syntax error near
  X", where X is the word at fault or the operator after it (bash's reader has looked one token ahead), an operator showing its last
  character. Leftmost-longest matching (POSIX) is not copied: `a|ab` matches as JavaScript does.
- **Syntax errors in a script** (`synText`): run as a script (not typed at the prompt), bash follows a "near" error with the line itself
  (bash: \`[[ a b ]]'); so does this shell now. An error token at the end of the text is `newline`, as in bash.
- **Smaller pieces** (October 2026): `read` splits by `IFS` as bash does (whitespace runs, one other separator, the last name takes the rest
  unless it is one word), handles backslashes unless `-r` (and joins a line ending in one), returns 1 at the end of the input with the partial
  line assigned (`while read -r l || [[ -n $l ]]`), `-d C`, `-n N`; `printf -v NAME` (also `NAME[i]`, `m[key]`); `$'…'` (escapes) and `$"…"`;
  `${x@Q} @E @U @L @u @a` (also on `${a[@]}`); `$RANDOM` is bash 5.2's generator (Park-Miller, halves XORed, no repeat), so `RANDOM=42`
  gives bash's numbers (difftest checks it); unseeded it starts from the clock; `$SECONDS` (and `SECONDS=n`); `shopt -s nullglob`,
  `failglob` (`no match: …`, the line stops), `dotglob`, `-p`, `-q`; a script's `shopt` changes end with it.
  Assignments are no longer split or globbed (`x=*`, `x=$(ls)` keep their text, as in bash); `local`/`declare`/`export` arguments neither.
- **Aliases** (`alias`, `unalias [-a]`, `type`): expanded when a line is parsed, at the start of a command, not again inside their own text,
  a text ending in a space making the next word a candidate too; capped at 100 aliases of 1000 characters and 10 000 tokens of expansion
  per line. As in bash they work at the prompt (`io.tty`) and in a script only after `shopt -s expand_aliases`, so the grader and the
  differential tests (`tty: false`) see none. The Code Lab terminal saves them with its history (`aliases` in
  `shortcourses.shell.v1`, and in backups), checked on load by `SHELL.cleanAliases` (the alias builtin's name rule and caps; null prototype).
- **History expansion** (`!!`, `!n`, `!-n`, `!prefix`, `!?text?`, `!$`, `!^`, `!*`, `:n`, `^old^new`) only for a line typed at the terminal
  (`io.tty`), never in scripts: the expanded line is echoed and kept; a failed one says `event not found` and is neither run nor kept. As in
  bash nothing happens in `'…'`, before a space, `=` or `(`, or in `[!…]`, `${!…}`, `$!`. Modifiers (`:s/a/b/`, `:h`) are refused.
- **The file system** is a tree in memory (`makeFS`): `/home/student` (the home, `~`), `/tmp`, and a read-only system (`/bin` with a stub
  per command, `/etc/passwd`, `/etc/hostname`, `/etc/motd`, `/dev/null`). Caps (`LIMITS`): 500 files, 2 MB in all, 256 KB a file, 32 levels,
  100-character names; names may not contain `/` or control characters. Children live in null-prototype dictionaries, so `__proto__` is
  an ordinary file name. Only the exec bit is a real permission (`chmod +x`, `./script.sh` → `Permission denied` without it);
  writes outside `/home` and `/tmp` are `Permission denied`. Saving (`fs.toJSON`) keeps `/home` and `/tmp` only; loading checks every
  node (names, shapes, sizes, the caps) and rebuilds the system part, so a hostile saved copy or backup cannot plant a `/bin/ls` or an
  oversized tree. `backup.js` uses the same loader as its sanitizer (`cleanShell`), and `mergeShell` adds a backup's missing files.
- **Programs.** `g++`/`clang++` compile through a hook (`CPPRUN.check`: JSCPP in debug mode parses without running; or
  `CLANGRUN.compile`/`Runners.cppFull.compile` when the Lab's engine is Full C++ or `-std=` is given, behind the usual download gate) and
  write a file with `bin: { lang, src, std }` and ELF-looking bytes; `./name` runs the source through the same sandbox as the Run button.
  `javac` checks with `JAVARUN.check` (`java.js: run(..., {checkOnly})`) and writes `Name.class`; `java Name` runs it; `java Name.java`
  compiles and runs. `python file.py` and `scheme file.scm` run the file. stdin: a pipe or `<` gives the text; otherwise Python's `input()`
  asks on the command line, and so do a Java `Scanner` and the teaching C++'s `cin` (typed input, above; Ctrl+D ends it). Full C++, and `scanf`
  or `getchar`, are given their lines first (an empty line ends them).
  stdout can go to a file or pipe. Exit status: the program's, or 1 on an error.
- **Interactive shells** (`src/repl.js`, `test_repl.js`): `python` and `scheme` with no file and the keyboard as input start a REPL on the
  command line. Scheme keeps one evaluator. Python replays: each entry runs after the accepted ones (seeded `random`, their `input()` answers
  given again, their output skipped); an entry is tried as `__repl_v = (entry)` first, since Skulpt has no `eval`, and printed with `repr`;
  an entry that errors is dropped. Errors are shown as Python's REPL shows them (`File "<stdin>", line n`). `jshell` does the same for Java:
  the kept snippets are rebuilt into one class `JShell` each time (top-level variables become static fields so methods see them, methods become
  static, classes stay top-level classes, imports go first); an expression is tried as `var __vN = (expr)` and shown as `$N ==> value`
  (strings quoted, arrays as `int[3] { 1, 2, 3 }`), a statement otherwise. /list /vars /methods /reset /help /exit. No Scanner input in jshell.
- **Line editing** (`terminal.js`): Ctrl+R reverse-i-search (again for older, Enter runs, Esc keeps, Ctrl+G cancels), Ctrl+A/E/K/W/U/Y as in
  readline, and a Taller button.
- **Limits that stop runaway lines.** 20 000 simple commands per line typed (`while true; do :; done` ends with a message), 2 MB of output
  into a pipe or capture, 256 KB into a file, 10 000 keyboard lines for a command reading stdin at the terminal, Ctrl+C cancels (`^C`,
  status 130) and also cancels the running sandbox.
- **The panel** (`terminal.js`) reuses the output panel's look. One `<input>` is the command line; while a program asks for input the
  same line answers it. Arrow keys recall history, Ctrl+L clears. Tab completes (`sh.complete`: commands at the start of a line and after
  `sudo`/`man`/`xargs`, otherwise paths, directories only after `cd`/`rmdir`, quotes and escaped spaces understood, names escaped on the
  way back): one fit is filled in; several fill in the common start and open a list under the line (arrows, Enter or Tab, Esc, click;
  typing narrows it); touch screens get a ⇥ button. `nano file` opens a textarea with nano's bottom bar inside the panel: Ctrl+S or
  Ctrl+O save (the file is written at once, through the command's `write` callback, and ends with a newline as nano's do), Ctrl+X leaves,
  and with unsaved changes asks "Save modified buffer?" (Y, N, Ctrl+C or Esc, or the buttons); the keys are handled on the document
  while nano is open and the buttons do not take the focus, so they work wherever the focus is. `edit file.py` opens the file in the
  Lab editor above (a file in `~/lab` directly, anything else as a copy in `~/lab`). Output is batched into text nodes; the scrollback
  is trimmed at 300 K characters.
  Everything shown is text: a class name on a span for colour (directories, programs, headings), never HTML.
- **`~/lab` mirrors the Code Lab's files.** Before each command the Lab's files are written into `~/lab` (the Lab wins); after it, a
  file there that changed is written back, a new file with a known extension (`.py .cpp .java .scm`) becomes a Lab file, and a mirrored
  file that was `rm`ed is removed from the Lab (said in a note). Removing the whole folder removes nothing from the Lab. The Lab's
  "Reset the Code Lab" also clears the terminal; "Reset files" in the terminal bar clears only the terminal.
- **The course (SC 108, `course_shell.js`, `lang: 'shell'`).** A lesson example `{ play: 'one command per line', setup, caption, expectError? }`
  is a listing plus a live terminal (`terminal.js: playBlock`): Run types the lines in one at a time, then the student types; each example has
  its own file system, built by `shellgrade.js: makeFS` from `setup`, a name in `course.setups` (a tree: keys are paths from the home
  directory, values the file's text, `null` or a trailing `/` for a directory, a trailing `!` for an executable) or a tree given inline.
  Examples whose commands fail on purpose say `expectError: true` (test_course.js runs the others and reports a non-zero exit).
  An exercise `{ kind: 'shell', setup, tests, hints, solution, followup }` is graded by `shellgrade.js: grade(ex, sh)` on the state
  afterwards: `{exists|file|dir|missing|exec: path}`, `{content: path, expect}`, `{contains: path, text}`, `{cmd, expect}` (run in the
  home directory, its line dropped from the history), `{ran: /re/, name}` (a typed command), `{cwd}`. The solution is a list of commands;
  `test_course.js shell` runs it through a fresh shell and the empty history must fail. Progress saves the history as the exercise's
  "code". `answer`-kind exercises work in a shell lesson too (mathgrade). The `fstree` figure draws a setup's tree with paths.
  `setup NAME` in the Code Lab's terminal writes a lesson's tree into the home directory (`terminal.js: mount`).
- **More commands** (October 2026): `basename`, `dirname`, `realpath` (walks the path as the real one does), `du [-s -h -a -c]` (sizes as an
  ext4 disk gives them: whole 4 KB blocks, a directory one block), `expr` (GNU's grammar and exit statuses, BigInt numbers), `yes` (into a
  pipe it stops by itself after 1 MB; elsewhere the output cap stops it), `fold`, `paste`, `comm` (with the unsorted-input warnings),
  `column -t` (util-linux is not on the test machine, so not differential-tested), `sha256sum`/`md5sum` (plain JavaScript, checked against
  node's crypto in `test_shell.js`), `time` (a keyword: `real` is measured, `user` shown as the same, `sys` as 0). **awk** (`awkLex`,
  `awkParse`, `awkRun`): patterns, ranges, BEGIN/END, print/printf (C formats, ties rounded to even), `> file`, all the control statements,
  fields and NF assignment, associative arrays with SUBSEP, strnum comparisons, the string and maths builtins; output follows mawk, the awk
  `test_diff.js` runs. Refused with "… not available in this practice awk": functions of your own, `getline`, `print | cmd`, `system()`.
  Its own caps: `LIMITS.awk` (1 000 000) steps, strings of 4 × `LIMITS.vars`, 100 000 array elements, the usual output cap. Known
  differences from mawk: `substr` with a start below 1 or not whole follows POSIX (mawk differs), `printf` with too few arguments prints
  empty values (mawk stops), `rand()` is another sequence.
- **git** (`shellgit.js`, added to the shell's command table by `SHELL.register`, which must run before the first `makeFS` so `/bin/git`
  exists). A local git for learning version control: init, status (-s -b), add (-A -u -f), rm, mv, restore (--staged --source), commit
  (-m -a --amend --allow-empty), log (--oneline -n --all -p --stat --format --decorate, paths), diff (worktree, --staged, commits, --stat,
  --name-only, `diff --cc` during a conflict), show (commit, tag, `rev:path`), branch (-d -D -m -v), switch / checkout (-b, --detach,
  `-- paths`, --ours/--theirs/-m), merge (fast-forward, --no-ff, --ff-only, three-way with diff3 "zealous" conflicts, add/add and
  modify/delete, --abort, --continue, --quit), reset (--soft --mixed --hard, paths), tag (lightweight and -a), stash (push -m -u/-a, save,
  list, show -p -u, pop, apply, drop, clear; `stash@{n}` and `stash` as revisions), revert and cherry-pick (one commit; -x, -e/--no-edit,
  conflicts, --continue --abort --skip --quit, "Reapply" for a revert of a revert), log --graph (with --oneline, --format, --all, -n),
  blame (-s -e, a revision, the working tree's uncommitted lines as `00000000 Not Committed Yet`), clean (-n -f -d -x -X, pathspecs,
  `clean.requireForce`), config (--global in `~/.gitconfig`), reflog, ls-files, cat-file, rev-parse, gc, help. Messages, exit statuses and
  formats are git 2.43's, checked against the real one (`node test_git.js --real`, which also draws eight random histories with
  `--graph` both ways); ids are real SHA-1s of git's serialization, so with the same name, email and time a commit (or a stash) has the
  same id as in real git. Dates come from the shell's clock (`now`), in the browser's time zone.
  - **The editor.** Where git would start `$EDITOR`, the practice git calls the shell's `sh.hooks.nano(title, text, write)` (the terminal's
    nano, `terminal.js`) on `.git/COMMIT_EDITMSG` (`MERGE_MSG` for a merge, `TAG_EDITMSG` for a tag) with git's template: the message so
    far, "It looks like you may be committing a merge/cherry-pick", the "# Please enter the commit message..." lines, `# Author:` and
    `# Date:` when git shows them (amend, cherry-pick), and the status without its hints as `#` lines (`commitTemplate`). When the student
    leaves, the file is read back and cleaned as git's `--cleanup=strip`; empty aborts with git's words. Used by `git commit` without -m
    (and `--amend`, the conclusion of a merge or a pick), `git merge` when it makes a merge commit (unless -m or --no-edit; an empty
    message leaves MERGE_HEAD for `git commit`, as git), `git revert` (unless --no-edit: git opens it at a terminal), `git cherry-pick -e`,
    `git tag -a` without -m. A hook may answer the text instead of saving through `write` (the node tests' fake editor does). Without the
    hook (node, a shell built without it) everything behaves as before: commit says to use -m, merge and revert take their message as is.
  - **Stash, revert, cherry-pick** share the merge's three-way code (`threeWay`, `mergeWrites`, `writeMerge`): a stash's changes merge into
    the index as it is now ("Updated upstream" / "Stashed changes"; then the index goes back to what it was, plus the new files), a
    cherry-pick merges the commit into HEAD with its parent as the base, a revert the parent with the commit as the base. A stash entry is
    git's three commits (the working tree, with HEAD, the index and, with -u, the untracked files as parents); `refs/stash` names the newest
    and `logs/refs/stash` lists them all. An interrupted pick writes `CHERRY_PICK_HEAD` / `REVERT_HEAD` and `MERGE_MSG` as git does (one
    commit at a time, so no `.git/sequencer`); `git status`, `git commit` (the picked commit's author is kept) and `git switch` (which
    refuses during a merge, cherry-pick or revert, as git) know about them.
  - **log --graph** is git's `graph.c` ported state for state (padding, skip, pre-commit, commit, post-merge, collapsing; no colours), over
    git's `--topo-order` in "graph order" (a LIFO of ready commits, so a merge's second parent is drawn first). Not with paths, -p or --stat.
  - The repository is a `.git` directory in the virtual file system (so `ls -a`, `cat .git/HEAD` and `rm -rf .git` work as in real life):
    HEAD, config, description, refs/heads/…, refs/tags/…, logs/HEAD (the last 100 moves), MERGE_HEAD, MERGE_MSG, ORIG_HEAD as text like
    git's; the objects in **one JSON file**, `.git/objects.json` (`{"v":1,"objects":{id: ["blob", text] | ["tree", [[mode, name, id]…]] |
    ["commit"|"tag", raw text]}}`, one object a line), and the index as JSON in `.git/index` (entries `[path, mode, blob]`, and a merge's
    conflicts as `[path, base, ours, theirs]`). Files are text, as everywhere in the shell; modes are 100644 and 100755 (`chmod +x`).
  - **Caps.** Everything goes through the file system's own writes, so its caps hold: objects.json is one file, so a repository's whole
    history must fit in 256 KB (and in the 2 MB of the whole terminal). When a write would not fit, objects nothing reaches are dropped
    (as `git gc`) and it is tried once more; then the command stops with "fatal: the repository is too big for this practice terminal..."
    before changing any ref, and checkouts check the space for the files they will write before writing any.
  - **Untrusted on every read.** objects.json: every id is checked against its contents (so an edited object is "damaged", not believed),
    shapes and links are checked (a commit's tree and parents, a tree's entries), tree entry names must be file names here and never `.git`,
    `..` or contain `/`; a tree that names more than 1000 files (a self-repeating tree could name 2^25) stops. index: paths checked the
    same way, every blob must exist, no path both a file and a directory. HEAD, refs, MERGE_HEAD and ORIG_HEAD must hold commit ids; a
    broken branch ref is skipped in lists. Config lines git would refuse stop every command, as in git. Dictionaries are null-prototype, so
    `__proto__` is an ordinary file or branch name. Damage gives `fatal: .git/<file> is damaged: <why>` with the hint that `rm -rf .git`
    starts again (test_git.js has a hostile case for each). The stash's files are checked the same way: every line of `logs/refs/stash`
    must be `old new who<TAB>message` (at most 100 lines, which is also the most `git stash` keeps) naming a commit of a stash's shape, and
    `refs/stash` must name the newest; `CHERRY_PICK_HEAD` and `REVERT_HEAD`, like `MERGE_HEAD`, count only when they hold a commit's id.
    `git gc` keeps every stash entry and an interrupted pick's commit.
  - **Not here:** remotes (clone, push, pull, fetch, remote say there is no network), rebase, bisect; revert or cherry-pick of several
    commits, of a merge (-m) or without committing (-n); `git stash` with paths, -p, --index, --keep-index, `stash branch`; `git clean -i`;
    `git restore -p` and the other interactive modes; `--graph` with paths, -p or --stat; `diff --word-diff`; blame following renames
    (a line is the commit's where the file first has its name), `-L`, `--porcelain`; naming files on `git commit`; rename detection other
    than exact (100%) renames; a merge commit's combined diff in `git show`; submodules (a nested repository's files are just files).
    Known small differences from git: `blame`'s "Not Committed Yet" time is the shell's clock (git's is the moment you run it), and the
    line diff is Myers' (git's xdiff can pick a different but equally short diff when lines repeat).
- **Not there (yet):** job control (`&`), `select`, `eval`, `let`, `trap`, `getopts`, process substitution (`<(…)`), `>&2` and other fd
  redirections, extended globs (`@(a|b)`, `shopt -s extglob`), `**` (`globstar`), `nocasematch`, `${!prefix*}` and namerefs, `ln` (the file system
  has no links), `tar`, `ssh` and anything needing a network (those names answer with a sentence saying so), a Windows `cmd`/PowerShell dialect
  (planned with the course). In a pipeline every part runs in this shell, so `… | read x` and `… | mapfile a` set the variable (bash runs them
  in a subshell; a known difference).

## 9g. Algorithms in motion and Where it is used (`algos.js`, `algo_*.js`, `applied.js`)

- **The top bar** has four links: Courses (`#/courses`, marked on every course page too), Algorithms, Real world, Code Lab. A link per course
  crowded it once there were ten courses; the courses page groups them instead (start here; programming languages; computer science).
- **Algorithms in motion.** `algos.js` is the frame: `ALGOS.register({ id, title, group, blurb, mount(host, api) → cleanup, about, taught })`,
  the index (demos by `ALGOS.GROUPS`, in registration order) and one page per demo (crumbs, the demo, its `about`, "Taught in" links, previous
  and next). `api.player` gives every demo the same Play / Pause / Step / Reset and a log-scale speed slider over a generator of steps (many
  steps per animation frame; it pauses when the tab is hidden and stops when its host leaves the page); `api.canvas` is a canvas as wide as its
  container, sharp on high-density screens, redrawn on resize and theme change; `api.rng` is seeded. Leaving the page calls the demo's
  cleanup. The pages use a teal accent (`data-course="algorithms"`).
- **The demos** (17): searching (linear against binary, guess my number, interpolation), sorting (eleven sorts in four views with optional
  sound, and a race of up to four), paths and graphs (grid path-finding with BFS, DFS, Dijkstra, A*, greedy best-first, walls, mud and
  diagonals; graph traversal with the queue or stack shown; untangle the tour: draw a travelling-salesman tour, then nearest neighbour and
  2-opt race it), mazes (seven generators, six solvers; a maze race of four solvers on one maze), games (minimax and alpha-beta on a tree,
  unbeatable tic-tac-toe, Connect Four with depth-limited alpha-beta run in time slices, Nim by the XOR rule), puzzles and simulations
  (`algo_puzzles.js`: Towers of Hanoi to play or watch, Conway's Game of Life with a glider gun, raindrops for π). The two races do not
  start by themselves: the reader bets on a lane first ("Who will win?") and the result says how the bet did. Each file keeps the algorithms
  as pure generators apart from the drawing, injects its own `<style id="algo-…-css">` with the site's variables, and exports `selfTest()`.
- **Adding a demo:** register it from an `algo_*.js` file listed in `build.js` after `algos.js` (and in `test_algos.js`), keep the algorithm
  pure and test it in `selfTest()`, use `api.player` and `api.canvas`, link the lessons in `taught` (`#/<course>/<n>`; `test_algos.js`
  checks the form, `test_browser.js` checks every demo opens and plays at 1280 and 390 px wide with no sideways scrolling).
- **Where it is used** (`#/real-world`): `APPLIED.TOPICS`, each `{ id, title, idea, uses: [{ f: field, t: text }], jobs, learn: [href],
  teach }`, rendered with a filter by field (software engineering, cybersecurity, engineering & science, data & AI, games & graphics, web &
  mobile), a search box, contents, and a by-course index for teachers. Lesson links are labelled from `window.COURSES` at page time and a
  link to a missing lesson is left out; `test_browser.js` checks every link resolves. Every example names a real system or event: check it
  before adding one, and keep the two that describe this site true when the site changes.

## 9k. Standards alignment (`standards.js`, `scripts/standards-map.js`, `test_standards.js`)

- Each lesson in `src/course_*.js` has `standards: ['2-AP-11', '3A-AP-17', '9.2.4.5', ...]`: CSTA K-12 CS Standards (2017) codes and Minnesota 2022
  Mathematics CS-integrated benchmark codes, which look different (a CSTA code has letters and dashes, a Minnesota code is four dot-separated numbers).
  An empty list means no standard applies (SC 104 lessons 8-10, theory beyond the standards). It is the only place the mapping is written.
- `src/standards.js` holds the standards (`CSTA` code → short paraphrase, `MN` rows `[code, text, fit, note]` where fit is `'yes'`, `'partial'` or empty when
  no lesson is tagged), the non-course pages that practise a standard (`SUPPORT`) and the code that draws the `#/standards` page (framework, grade band,
  "with a lesson / no lesson yet", search) and the `<details class="lesson-stds">` box that `lessonPage` puts under a lesson's summary. A code in the address
  (`#/standards/9.2.4.5`) opens the right list and scrolls to the standard. The standards' text is ours (paraphrased, not the official wording) and the page
  says the mapping is the author's and not endorsed by CSTA or the Minnesota Department of Education: keep that wording if the page is changed.
- `node scripts/standards-map.js` writes `STANDARDS_ALIGNMENT.md` (by course, by standard, gaps, the teacher-standards table) from the lessons and
  `standards.js`; commit it with any change to a tag. `test_standards.js` (part of `npm test`) fails on an unknown code, a duplicate, an untagged lesson, a
  Minnesota fit that disagrees with the tags, or an out-of-date `STANDARDS_ALIGNMENT.md`.
- Adding a lesson: give it `standards`. Adding a standard (a new Minnesota subject, the 2026 CSTA revision): add it to `CSTA` or `MN` and tag lessons.
  Tags were assigned from each lesson's title, summary and a search of its text, not a full re-read: when a lesson changes a lot, re-check its tags.

## 9i. Spaced review and the skills map (`review.js`)

Every quick check a student answers in a lesson (`app.js: renderBlocks` passes `onFirstAnswer` to `checkBlock`) joins the review with
its first answer only, so re-reading a lesson does not reset it; classroom mode records nothing. The schedule is a Leitner box: after an
answer the item comes back in `GAPS = [1, 3, 10, 30, 90]` days, one box further for a right answer marked Sure or Think so, the same box
for a right Guessing, box 0 for a miss (a meta-analysis found expanding gaps no better than equal ones, so the exact gaps matter less
than that reviews happen). `#/today` shows at most `PER_DAY = 10` items due by the end of today, the most overdue first, then shuffled
so lessons and courses mix, each with its options in a new order (`wrong[]` and `answer` follow). An item whose question no longer exists
(edited text gives a new id) is ignored. The skills map is per lesson: *secure* = every exercise done and every quick check at box 2 or
higher (right at the 1- and 3-day reviews), *practising* = something done, else *not started*. A course with named skills
(`course.skills`) also lists them under the lessons (`skillParts`, `skillStatus`): a skill is first taught where it is first tagged, and is
*secure* when its exercises are done and every quick check of it the student has met is at box 2 or higher. It is on the course page (only once the
course is started) and on `#/today`. The top bar shows **Review** with the number due once there is anything to review. Lesson recaps say
when their checks come back. Pure parts (`next`, `itemId`, `clean`, `merge`, `dueIds`) are tested in node by `test_review.js`, which
also checks that all quick checks on the site have distinct ids; `test_backup.js` covers the backup file; `test_browser.js` the loop.

## 9j. Bot Arena (`tron.js`, `arena_bots.js`, `arena_run.js`, `arena_view.js`, `arena.js`)

Students write a bot (Python, Java, C++ or Scheme) that plays Tron against built-in bots or each other, entirely in the browser.

- **`tron.js`** (no DOM, also loaded by `test_arena.js`): the rules (`create`, `step`), the protocol text (`serialize`, `parseObs`, `parseMove`, `splitOutput`),
  a seeded RNG, the three built-in bots (Random, Wall Hugger, Flood Fill, as JavaScript), the **referee** `playMatch` (async; asks every bot for a move each turn,
  applies them together, returns a replay and one snapshot per turn), `botDriver` (any program, given a `run(source, stdin, limitMs)`), replays and bot files
  (`cleanReplay`, `cleanBot`: every field from a link or file is clamped), `runTournament`/`standings`/`standingsCsv`, and a stored-method `zip`.
- **Protocol.** A bot is run afresh every turn ("restart mode"): stdin is `width height / you alive / x y player per live player / the rows` (`.` `#` and head digits);
  stdout is one line `UP|DOWN|LEFT|RIGHT`. Fixed starts (two in from the corners; 3 and 4 players use further corners); simultaneous moves; head-on and head-swap
  both crash; turn cap width x height is a draw. An invalid move (bad text, timeout, crash) is moved `UP`, or the bot forfeits if the match says so (replay letter `X`).
  A bot that fails its dry run on the empty board (syntax or compile error) forfeits before turn 1. The sandboxes have **no stderr**, so a stdout line starting `LOG`
  is the bot's log line (shown in its tab, ignored by the referee). A replay is `{format:'tronreplay', settings, seed, players, moves:['UD',...], result}`; the file is
  re-simulated, so it stays small; `result.crashes[].reason` carries the words (including why a bot forfeited).
- **Time.** `settings.timeMs` 0 means by language: 500 ms, 2 s for C++ (JSCPP is the slow engine; the JVM-startup reason in the spec does not apply, our Java is an interpreter).
- **`arena_run.js`**: `run(lang)` over the existing runners (`PYRUN`, `CPPRUN`, `JAVARUN` take `maxMs`/`execLimit`; Scheme takes `stdin` and `stepLimit` and runs in the page,
  stopped by steps, since the page cannot interrupt it; `BOTRUN.open` starts a bot that stays running). Bots of a language take turns (one worker each), a new worker is warmed up outside the clock, a bot past its limit
  has its worker ended. Saved bots: `shortcourses.arena.v1` (sanitised on load; the bots, not the match setup, are in the backup file: `backup.js: cleanArena`/`mergeArena`). Links: `#/arena?bot=` / `?replay=` via `TEACH.pack` (deflate,
  size-capped inflate; fragments never reach a server; a warning past 8 KB).
- **`arena_view.js`**: canvas viewer driven only by frames (live match and loaded replay take the same path); heads carry their number; hover shows coordinates.
- **`arena.js`**: `#/arena` (editor, My bots, templates, setup bar, Play / Play 10 / Test my bot once, logs with "Show input", import/export/links) and
  `#/arena/tournament` (bot files by pick, drop or pasted links, round robin with swapped starts, sortable table, head-to-head grid, CSV, zip, projector mode).
- **Persistent mode** (`settings.mode: 'persistent'`, the "Run bots" selector): a bot is started once and kept running; the first turn it is sent starts with the line
  `TRON 1`, every turn ends with `END`, and `GAMEOVER` is sent when the match is over (so a variable outside the loop remembers the last turn). The starters and solutions are
  loops that understand the framing and also stop at end of input, so one program works in both modes. How it works: the page and a worker share a `SharedArrayBuffer`
  (`botio.js` in the worker, `botsession.js` in the page and in node); the worker blocks in `Atomics.wait` when the program asks for input (`input()` in Skulpt, JSCPP's `cin`,
  the Java `Scanner` through a `more()` hook in `java.js`, Scheme's `read`/`read-line` through `moreInput` in `scheme.js`) and posts `{t:'idle'}` first, which is how the
  page knows a turn is answered (what was printed since the turn was sent is the reply, so two lines are still one invalid reply). Output is flushed at idle. Each language's worker
  has a `{t:'bot'}` message (`pyworker.js`, `cppworker.js`, `javaworker.js`) and Scheme has its own worker (`schemeworker.js`, data block `scheme-src`; in restart mode Scheme still
  runs in the page). `scripts/worker-sources.js` lists the files of each worker for `build.js` and for `test_arena.js`, which runs the very same source in node's `worker_threads`.
  A turn that takes longer than the limit ends the worker; the next turn starts a new program (it has forgotten everything). A program that fails before its first read (syntax or
  compile error, a loop before it reads) forfeits before turn 1; one that prints its move and ends is simply started again next turn. Needs `crossOriginIsolated`:
  `build.js` writes `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` for `/` and `/index.html` in `dist/_headers` (the page loads nothing
  from another origin, so COEP costs it nothing, and `test_browser.js` serves the page with exactly those headers and checks turtle graphics still work). A copy opened from a file,
  or shown inside another site's frame, is not isolated: the selector says so and persistent mode is off (restart mode is unchanged).
- **Not built:** a worker pool for tournaments (student bots of one language share one worker in restart mode, so matches run one at a time; built-in matches take milliseconds).
- Tests: `test_arena.js` (rules, determinism, hostile replays, every starter and solution on the real runtimes, timeouts, forfeits, zip checked with Python's unzipper, a 132-match
  tournament) and the Arena section of `test_browser.js`. The Flood Fill solutions in all four languages choose identical moves on every board of a game (tested).

## 9h. Pictures in lessons (`img/`, `scripts/fetch-image.js`, `app.js: photoBlock`)

- **Where they come from.** Wikimedia Commons only, through `node scripts/fetch-image.js` (`--search "words"` lists candidates with
  their licence; `<id> "File:Name.jpg" "alt" "title"` fetches one). It accepts public domain, CC0, CC BY and CC BY-SA and nothing else
  (no fair use, no NC or ND: the lessons are CC BY-SA 4.0), resizes to at most 960 px (progressive JPEG, quality 78, metadata
  stripped) and writes `img/<id>.jpg` with `img/<id>.json` (`title, alt, author, license, licenseUrl, source, credit, description,
  date, width, height`). Wikimedia rate-limits shared machines: the script sends a User-Agent, goes one request at a time and waits as
  told. **Look at every picture** and write its alt text from what is visible and from the Commons description, never from a guess.
- **How they are served.** `build.js` copies them to `dist/img/<id>.<hash>.jpg` (content-hashed, so `_headers` caches `/img/*` forever)
  and puts the credits in `BUILD.images`. They are files beside the page, not data in it, so a lesson's pictures download only when read
  (`loading="lazy"`, with width and height so nothing jumps). The policy's `img-src` is `'self' data: blob:`: pictures come from this
  site only. A copy opened from a file still shows them in Chrome; where a picture cannot load, a box with its title and alt text
  replaces it. `dist/img/` is not committed (the build makes it); `img/` is.
- **In a lesson:** `{ photo: 'id', caption }` or up to three ids side by side; the caption says what it shows and why it is there; the
  credit line (author or credit, licence, source link) is added under it, and tapping opens it larger (Esc closes). About lists every
  picture's credit. `test_lessons.js` checks each picture's json (licence, alt text, Commons source, size, under 250 KB), that every
  picture a lesson names exists and every stored picture is used; `test_browser.js` checks one loads, enlarges and falls back.

## 10. Adding things — recipes

- **A lesson:** write it to LESSON_STANDARD.md and give it `standard: 1`, so that `test_lessons.js` holds it to the standard
  (`--standard` lists the gaps of every lesson). Add a lesson object in `course_X.js` with new ids `xx-<n>-1/2`, `<n>` being the next number
  the course has not used; run `node build.js && node test_course.js X`. If inserting mid-course, keep the later
  lessons' ids as they are (see §6) and update the "Lesson N" cross-references, including "the next lesson" in the
  lesson before, the course tagline, and the lesson count in `guide.js`.
- **A math exercise kind:** extend `mathgrade.js` (`grade`, `reference`, `empty`), the renderer in
  `app.js: mathExerciseBlock`, and the README table.
- **A widget:** `window.WIDGETS.name = (mount, block, course) => {…}` in `widgets.js`; use `{ fig: 'name' }`.
  Current widgets: names, trace, indexer, search (param `items`), sort, caesar, evaltree, subst, venn (params `a`, `b`:
  arrays of elements; math lesson 2), boxptr, hof, pipeline (param `lang: 'java'`), memory, array, sieve, fibtree, graphbfs, dfa, tape (machines: increment, flip, beaver), letters (splits double vowel spelling into letters by longest
  or shortest match; param `sample`; math lesson 7), and for the DSA course: growth (orders of growth, params `show`, `n`), arrayops (get/insert/remove with every
  move shown, param `items`), dynarray (capacity doubling with copy counts), sortlab (algorithm, input shape and size, counters, and a doubling
  experiment timed in the page; param `algo`), mergeviz (bottom-up merge sort, every merge step and the comparison count), partition (Lomuto
  partition with its invariant), linkedlist (nodes and arrows; get, insert, add first/last, remove first, with hop counts; all three take `items`),
  stackqueue (`kind: 'stack' | 'queue'`: eight cells, push/pop or enqueue/dequeue with wrap-round, one operation at a time), callstack
  (`fn: 'sum' | 'fact' | 'fib'`, `n`: frames pushed and popped step by step, with the call count); hashtable (a chained table: hash arithmetic, collisions, load factor, doubling, a bad-hash switch; lesson 8), bst (insert, search, walk in order, presets; lesson 9), heap (min-heap as tree and array, sift up and down, step by step; lesson 10), graph (`mode: 'bfs' | 'dfs' | 'dijkstra'` on one fixed eight-vertex graph; lesson 11); and blocks (From Scratch to Python: a stack of Scratch-style blocks drawn with the palette
  colours beside highlighted Python; `stack: [[category, text, children?, elseChildren?]]`, `python`, in text `[words]` is a text input, `(10)`
  a number, `<cond>` a boolean), and blockquiz (the same blocks as a quiz: `items: [{stack, answer | [answers], hint}]`; the typed line is
  compared with spaces outside quotes removed and single quotes read as double; capitals and colons are not forgiven; two-line answers are
  typed one after the other).
- **Turtle in a lesson:** a Python playground whose code imports turtle gets a `.play-turtle` mount and runs with a canvas in the
  sandboxed frame, as the Lab does (`runCell`, `usesTurtle` in app.js). `test_course.js` skips those examples in node (no canvas); the
  browser test runs one.
- **A Lab feature:** put UI in `lab.js: page()`; if it needs app internals, add them to
  `window.__app.internal`; if it is teacher-facing, put it in `teach.js` behind `T.teacher`.
- **The teacher guide:** edit the HTML string in `guide.js`; sections are `<section id="g-n">`; styles are the `.g-*` rules in style.css (print rules at the end). Rebuild to refresh both copies.
- **A new kind of lesson block:** classroom mode treats any unknown top-level block as one step; if it should be
  split or needs an Enter action, extend `buildSteps()`/`actionFor()` in classroom.js. The portfolio needs nothing
  unless it is a new exercise kind (then add a case to `mathAnswers()`).
- **An Ojibwe word:** only after finding it in the Ojibwe People's Dictionary, or after a fluent speaker or an Ojibwe
  language program supplies it. Add it to `WORDS` with its source, use `lbl(key)` where the
  English label was, and check the review page lists it. A supplied word gets `srcName` = who supplied it, and a date.
- **A bundled library:** add it to `scripts` and to `THIRD_PARTY` in `build.js` (name, package, LICENSE file, url,
  role, and `changes` if patched); check it appears on `#/about` with its full licence text.
- **A new route:** handle it in `renderRoute()` and, if it opens the Lab, pass `kind` to `LAB.page`.
- **A Java library method:** add a signature and a function to the class's table in `src/java.js` (`def(...)`): `'name(paramTypes)': [returnType, (receiver, args, R, m) => ...]`; `E`, `K`, `V` are the class's type parameters, `T` is inferred from the arguments, `R` is the runtime (`throwJ(R, 'IllegalArgumentException', msg)`, `dstr(v, R)` for Java's string of a value). Add a line to `test_java.js`.
- **A runtime change (JSCPP):** edit node_modules, rebuild `vendor/jscpp.min.js` with the esbuild
  command in the README, and record the diff in a file under `patches/` (add it to `PATCHES` in
  `scripts/patch-jscpp.js` with a marker line that only the patched file contains).

## 11. Testing and release

1. `npm install`. `npm test` applies the JSCPP patches itself (`scripts/patch-jscpp.js`, idempotent).
2. `node build.js`, then `npm test`: `test_course.js` for each course (every solution passes, every starter fails,
   every playground runs), `test_cppstep.js`, `test_javatrace.js`, `test_subst.js`, `test_app.js`, `test_scheme.js`, `test_security.js` and `test_backup.js`. C++ in both test scripts goes through the site's own
   `ensureMainReturns` (`src/cpputil.js`), so programs are graded exactly as on the site.
   `npm run test:browser` (needs a built site and Chromium: `npx playwright-core install chromium`) checks what node cannot: the interpreters
   are not in the page, programs cannot reach it (hostile code is sent into a worker and into a sandboxed iframe), an infinite loop cannot
   freeze the page and Stop ends it, the Lab's input, turtle, step-through and memory view work, graded exercises pass in the sandbox,
   and there is not one Content Security Policy violation. CI runs both on every push and pull request.
   `npm test` ends with `test_lessons.js`, the lesson linter: every lesson opens with a story, has three quick checks (answer in range, a
   why), graded exercises and a recap (or stretch goals); every HTML field is well formed and uses only real HTML elements (a C++ header
   written as `<ctime>` in a caption is swallowed by the browser: write `&lt;ctime&gt;`); code-exercise hints are plain text; a Java or C++
   example has no newline inside a string; exercise ids are unique, well formed, and none ever published has gone (`lint/exercise-ids.txt`;
   `node test_lessons.js --update` records new ones); the Scratch course reads at grade 3-4 (Flesch-Kincaid, measured per lesson) and ends
   each lesson with a block quiz. Two examples in a row and long headings are warnings.
   `npm run test:diff` (`test_diff.js`, in CI with JDK 21) compares the site's own implementations with the real ones. Java: every lesson
   example and exercise test of the Java courses (and each exercise's expected answer against what the JVM prints), the probe programs in
   `difftest/java/`, and programs generated from a seed by `difftest/javagen.js` (typed expressions of every kind, printf formats, string
   and collection operations, each statement in try/catch so exception messages are compared too), all compiled by one javac and run on
   the JVM in parallel; output, stderr and exit code must agree. Shell: the command lines in `difftest/shell.txt` run on the same files in
   the practice shell and in bash with GNU coreutils. Deliberate differences are listed with their reason in `difftest/known.json` (a listed
   case that starts agreeing is reported, to be removed). `SEED=n COUNT=n node test_diff.js java` searches further: run a few seeds after
   changing the interpreter. A part whose real tool is missing is skipped locally and fails in CI (`REQUIRE_DIFF=1`).
   A linter (ESLint, installed outside the project) with `no-undef`, `no-unused-vars` and the usual correctness rules
   should report nothing.
3. Check in a browser, or headless with jsdom (installed outside the project so it stays out of the repository):
   - Code Lab: run each language, step the Python tracer and the C++ memory stepper, show a substitution, open a
     course exercise in the Lab and check it there.
   - Assignments: create, share, submit and review one; the QR code decodes to the link.
   - Portfolio: with progress seeded from the course solutions and `MATHGRADE.reference`, make a link, open it with
     empty storage and check every exercise (genuine solutions pass; a completed item with broken code is flagged).
   - Classroom mode: step a lesson with the keys, Enter reveals or runs, End then next goes to the next lesson, keys
     are ignored inside editors.
   - Ojibwe: the words show beside their English (home greeting, course pages, lesson crumbs, playground labels,
     Check answer buttons, About credits heading) and every word on `#/ojibwe` links to its dictionary entry. With the
     Date faked, the clock gives the right sentences for all 168 day/hour pairs, noon and midnight hours show two
     sentences, and the "Ojibwe clock" program prints the same words in Skulpt.
   - Letters widget (math lesson 7): Boozhoo gives 4 letters by longest match and 7 by shortest; Miigwech 6;
     Gikinoo'amaagoowin 15; a c without h, or a character outside the system, stops with a message.
   - No stray text: render every lesson, check each exercise twice with empty or starter answers, open hints and
     solutions, and look for text nodes ending in `null`, `undefined` or `NaN` (there should be none).
   - Lesson length: the lessons marked "Longer than an hour" are exactly those `lessonMinutes` puts over `LONG_LESSON`.
   - Every route and lesson in a real browser at 1280 and 390 px wide: no script errors, no page wider than the
     screen, no duplicate ids, no unnamed buttons or unlabelled inputs, `rel="noopener"` on every new-tab link.
   - Every `#/...` link in the source resolves to a real course, lesson and exercise.
   - The clock: with the browser's clock controlled, the new minute appears within a second of the change, and after a
     jump in time (sleep) the right time appears as soon as the tab is visible.
   - About: all three sections render; every `THIRD_PARTY` entry is listed with its full licence text; the licence
     wording follows `SITE.licence`; the source link shows only when `SITE.sourceUrl` is set.
4. Deploy `dist/index.html` (any static host; it also works opened from disk). For Cloudflare Workers, `wrangler.jsonc` serves `dist/` as static assets: set the build command to `npm run build` and the deploy command to `npx wrangler deploy` (`npx wrangler preview` for non-production branches).

## 12. Known limits and sharp edges

- Full C++ needs the site to be served over http(s) and ~28 MB once; it has no exceptions, no threads, no checked indexes, and a program that
  runs forever costs a compiler reload (see §9d). Programs written for the teaching engine mostly run unchanged on it, not the other way round.
- Skulpt prints floats to 15 digits; `(/ 1 3)` in Scheme prints `.333333333333` (12 significant digits; whole numbers are exact at any size, as BigInts); JSCPP lacks
  `std::string`, `vector`, classes, references. Write examples that avoid these.
- Downloads (Save, CSV, the portfolio web page) do nothing inside sandboxed frames that block them; they work
  when the page is opened directly.
- Inside the site the URL hash is the route, so a plain in-page anchor (`href="#section"`) navigates away (to the home
  page). Links within a page must call `preventDefault()` and `scrollIntoView()`, as the guide's contents links do
  (they stay plain anchors so the printable `dist/teacher-guide.html` works), and as the portfolio's links do.
- SVG ids are global to the page: a widget that can appear twice in one lesson must make its ids unique (the automaton
  figure numbers its arrow markers).
- Tables in lesson prose (`.prose table`) are `display: block` with `overflow-x: auto`, so a wide one scrolls inside
  itself on a phone instead of pushing the page sideways.
- The DOM's own `append`, `prepend`, `replaceChildren`, `before`, `after` and `replaceWith` print `null`, `undefined` and `false` as text (and an array as
  `[object HTMLElement]`): a bare `parent.append(a, cond ? b : null)` once put the word null on the Life demo and on a machine-learning figure. `src/domsafe.js` (the
  first file of the page's script) now makes those methods skip them and flatten arrays, so the mistake cannot reach a student; `test_browser.js` checks it. Still build
  nodes with `el()`, and do not rely on the net in code that also runs in node. (The sandboxes' frames are separate documents and have no such net.)
- Assignment/back-up links are compressed; browsers without `DecompressionStream` (pre-2023 Safari)
  cannot open them, and the code says so.
- QR codes hold ~2.9 KB; longer links show a note instead of a code.
- Changing an exercise id orphans saved progress under the old id, and puts work in old portfolio links under
  "Other work" (it is still shown, but cannot be re-checked). This is why ids are never renumbered (§6).
- Long unbreakable code in lesson prose (a regular expression, say) pushes a phone's page sideways; put it in
  `<p class="pattern"><code>…</code></p>`, which centres it and lets it wrap.
- Portfolio links grow with the amount of work (about 1 KB per 5 exercises compressed); they are too long for QR codes,
  so the portfolio offers no QR.

## 13. Open items

1. More Ojibwe labels, from words a speaker supplies for the labels listed on `#/ojibwe`.
