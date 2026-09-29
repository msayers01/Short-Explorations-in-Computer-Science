# Architecture — Short Explorations in Computer Science

Keep this file current: when a feature changes a module's interface, a storage key,
a route, or a block format, update the matching section here in the same change.

## 1. What the project is, in one paragraph

A single self-contained `index.html` (about 2.6 MB) containing four interactive short courses (Python, Scheme,
C++, mathematics of computing) with autograded exercises, a full sandbox editor ("Code Lab"), and a
serverless assignment system for teachers. Three language runtimes run in the browser: Skulpt (Python),
JSCPP (C++), and a Scheme interpreter written for the site. There is no backend, no account, no network
dependency beyond Google Fonts; everything the user creates lives in `localStorage`, and everything that
must move between people travels inside a URL.

## 2. Design constraints (do not break these)

1. **One file, works from disk.** `node build.js` inlines every script and style into `dist/index.html`.
   Nothing may fetch from the network at runtime except the font stylesheet. No CDN scripts.
2. **No server, ever.** Sharing = data in the URL hash (`#/route?key=<packed>`). Persistence = `localStorage`.
   Anything "sent to the teacher" is a link the student copies themselves.
3. **The teacher's copy is authoritative.** Hidden tests and grading always run from the teacher's stored
   assignment, never from data a student sent.
4. **Every exercise is testable in node.** `node test_course.js <course>` must pass before publishing.
5. **Accessible prose first.** Courses are written for students and teachers with no CS background:
   definitions before examples, one idea per code block, predict-then-reveal, "Common mistakes", recap.

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
  test_subst.js          node tests for the substitution stepper: every Lisp playground steps without error and ends at the interpreter's value
  package.json           npm test runs all four courses; deps: skulpt, JSCPP, esbuild
  patches/jscpp-iostream.patch   applied to node_modules/JSCPP and baked into vendor/jscpp.min.js
  vendor/jscpp.min.js    JSCPP bundled by esbuild (see README for the command)
  stubs/                 stream/util shims for the JSCPP bundle
  dist/index.html        the built site (the only deployed file)
  src/
    site.js              SITE: name, role, contact, home-page text, footer; about (html), licence (code and content
                         licences) and sourceUrl (the repository) for #/about
    course_python.js     SC 101 (13 lessons)   ─┐
    course_lisp.js       SC 102 (11 lessons)    │ each pushes one course object onto window.COURSES
    course_cpp.js        SC 103 (11 lessons)    │
    course_math.js       SC 104 (13 lessons)   ─┘
    style.css            design tokens, layout, course accents, every component's styles
    cppstep.js           C++ memory stepper → window.CPPSTEP { trace, render, describe } (uses JSCPP's debugger)
    scheme.js            Scheme interpreter (MIT/SICP dialect) → window.Scheme / module.exports
                         (all c[ad]r up to 4 deep; eval with system-global-environment, always global)
    subst.js             substitution-model stepper over scheme.js ASTs → window.SUBST
    mathgrade.js         grader for non-code exercise kinds → window.MATHGRADE (shared with tests)
    app.js               router, pages, course editor, runners, grader, progress, widgets glue
    lab.js               Code Lab page → window.LAB
    guide.js             the teacher guide (one HTML string) → window.GUIDE; build.js also writes dist/teacher-guide.html
    qr.js                QR encoder → window.QR
    teach.js             assignments / submissions / grade book → window.TEACH
    widgets.js           interactive SVG figures → window.WIDGETS[name](mount, block, course)
    portfolio.js         student portfolio page (#/portfolio) → window.PORTFOLIO
    classroom.js         classroom (projector) mode → window.CLASSROOM
    ojibwe.js            Ojibwe interface words, their sources, the review page (#/ojibwe) → window.OJIBWE
    about.js             About and credits page (#/about) → window.ABOUT
```

**Script order in `build.js` matters:** (window.BUILD) → skulpt → skulpt-stdlib → jscpp → cppstep → scheme → subst → site →
courses → mathgrade → app → lab → guide → qr → teach → widgets → portfolio → classroom → ojibwe → about. `app.js` runs `route()` on
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
 │ Runners: Runners.python (Skulpt) · Runners.cpp (JSCPP) · Scheme        │
 ├────────────────────────────────────────────────────────────────────────┤
 │ Storage (localStorage): progress · lab files · teacher data · theme    │
 └────────────────────────────────────────────────────────────────────────┘
```

`app.js` exposes what other modules need on `window.__app.internal`:
`{ el, esc, highlight, toLines, LANGS, Runners, outputPanel, tipFor, armConfirm, grade, renderVerdict, Progress, courseById, ensureMainReturns, cppErrorText }`.
`lab.js` reads it through `A()`. Nothing else reaches into app.js internals.

## 5. Routing (`app.js: route()`)

Hash routes; a `?query` after the path is split off first.

| Route | Page |
|---|---|
| `#/` | home (greeting, Ojibwe clock, course catalog, Code Lab card, portfolio and teacher links, footer with About and "Reset my progress") |
| `#/<course>` | course page (audience, outcomes, lesson list with progress) |
| `#/<course>/<n>` | lesson n (1-based) |
| `#/<course>/<n>/<exercise-id>` | lesson n, scrolled to that exercise |
| `#/guide` | the teacher guide (printable; `dist/teacher-guide.html` is the standalone copy) |
| `#/lab` | Code Lab; `?l=&n=&c=` opens a shared file; `?b=` restores a teacher back-up |
| `#/assign?a=` | Code Lab, student side: stores the assignment, opens its file |
| `#/review?s=` | Code Lab, teacher side: reviews the submission, opens the grade book |
| `#/ojibwe` | every Ojibwe word with its source, the days and hours of the clock, and words still needed; printable |
| `#/about` | About and credits: who made it, what it keeps about a visitor, the licence, credits and full third-party licence texts |
| `#/portfolio` | the student's portfolio (settings, print, download, make a link) |
| `#/portfolio?p=` | a received portfolio, read-only, with "Check every exercise on this computer" |

`document.documentElement[data-course]` is set to the course id (or the Lab's current language) and
drives the accent colour through CSS tokens.

## 6. Content model (courses)

Course: `{ id, code, short, lang, title, grades, audience, tagline, description, outcomes[], lessons[], readingWpm?,
howItWorks?, textbook? }`.
Lesson: `{ title, summary, blocks[] }`. Blocks, rendered by `renderBlocks()`:

| Block | Renders |
|---|---|
| `"<p>…</p>"` (string) | prose; may contain `<details class="reveal">`, `<div class="recap">`, `<div class="stmt">`, `<div class="proof [annotated]">`, `<table class="small">` |
| `{ play, caption, stdin, expectError, testStdin, lang }` | runnable playground with "Open in Code Lab" |
| `{ code, caption, lang }` | static listing |
| `{ fig, caption, ...params }` | `WIDGETS[fig]` figure |
| `{ aside }` | "Common mistakes" aside |
| `{ ex: {...} }` | exercise (code kind or math kind, see below) |

Code exercise: `{ id, title, prompt, starter, solution, hints[], tests[], mustContain[], mustNotContain[], followup, failTip, sampleStdin, prelude }`.
Tests: Python `{call, expect}` (repr) or `{stdin, expect}`; Scheme `{call, expect}`; C++ `{stdin, expect}`,
`{setup, call, expect}` (checker supplies main) or `{name, main, expect}`.

Math exercise (`kind`): `'answer'` (`parts[{label, answer, re, wrong[{match,msg}], exact}]`; `exact: true` compares as text, for digit strings such as `01`; table blank cells accept `exact` too), `'choice'`
(`options[{text, ok, why}]`, `multi`), `'table'` (`head`, `rows` with `{a, why}` blank cells); `solution` is HTML.

**Lesson length.** `lessonMinutes(course, lesson)` (app.js) estimates a lesson's time from its content: reading at
`course.readingWpm` words a minute (default 130; the mathematics course sets 60), 2.5 minutes per playground, 2 per
figure, 1 per predict-then-reveal box, 10 per code exercise and 12 per non-code exercise. Lessons over `LONG_LESSON`
(65) get "Longer than an hour: about N minutes" (rounded to 5) in the course's lesson list and a planning note under the
lesson's title. The programming lessons come out at 40–70 minutes (only Lisp lesson 2 is marked), the mathematics
lessons at 55–90 (eight of thirteen marked). Adjust the rates here, not per lesson.

Exercise ids are `<py|ls|cp|ma>-<n>-<k>` and are permanent: they are the keys for progress, portfolio links and Lab
files, and nothing reads a lesson number out of them (the Lab, the portfolio and the router find an exercise by id and
work out its lesson from where it is now). A lesson inserted mid-course takes the next unused `<n>` and later lessons
keep their ids, so `<n>` matches the lesson's position only up to the first insertion. In the mathematics course,
lesson 7 has `ma-13-1/2`, and lessons 8–13 have `ma-7-*` … `ma-12-*`.

## 7. Storage keys

| Key | Owner | Contents |
|---|---|---|
| `shortcourses.progress.v1` | app.js `Progress` | `{ done: {exId: timestamp}, code: {exId: savedCode or JSON answers}, pass: {exId: the code/answers that passed} }`; `markDone(id, code)` fills `pass` (for records without `pass`, the portfolio falls back to `code`, then to a Lab copy). A math exercise's answers are saved as `JSON.stringify` of one entry per input; a choice exercise therefore saves `[[indices]]` |
| `shortcourses.theme` | app.js | `'light'` / `'dark'` |
| `shortcourses.lab.v1` | lab.js | `{ lang, files: {python:[…], cpp:[…], scheme:[…]}, active: {lang: idx}, fontSize, wrap, panels }`; a file is `{ name, code, ex?: {id, course, lesson}, asg?: assignmentId, asgSeen?, lastCheck? }` |
| `shortcourses.portfolio.v1` | portfolio.js | `{ name, note, unfinished, tasks, lab: ["<lang>/<file name>", …] }` (name starts as teach's `studentName` if set) |
| `shortcourses.classroom.v1` | classroom.js | `{ on, scale: index into [1.1, 1.25, 1.4, 1.6, 1.8], spot }` |
| `shortcourses.teach.v1` | teach.js | `{ teacher, name, studentName, assignments: {id: A}, book: {id: {studentName: entry}}, received: {id: studentCopy} }` |

Bumping a `.vN` suffix is how a breaking layout change is handled (old data is simply ignored).
`shortcourses.ojibwe.v1` belonged to an earlier on/off switch for the Ojibwe words; do not reuse the name.

## 8. Data that travels in links (`teach.js: pack/unpack`)

`pack(obj)` = JSON → deflate-raw via `CompressionStream` (prefix `z`) or plain (prefix `p`) → base64url.
Assignment `A`: `{ id, v, title, lang, text, starter, tests[{k:'stdin'|'call', in, expect, hidden}], hints[], roster[], author, due, created }`.
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
- Runners: Python via `runPython()` with `yieldLimit` (Stop works through `Sk.yield` handlers;
  **`killableWhile/killableFor` must stay off — they hang**). Tracer uses `debugging: true` and
  `Sk.debug` suspensions (`$loc` at module level, `$tmps` inside functions). Turtle sets
  `Sk.TurtleGraphics.target = 'lab-turtle'`. C++ takes stdin from the Program input box.
  Scheme: `makeRepl()` keeps one evaluator; `loadProgram` runs the file into it.
- Memory stepper (C++): `CPPSTEP.trace(code, stdin, {prepare, errorText, maxSteps, maxMs})` runs the program
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
about you" (plain-language privacy: localStorage only, links carry their contents, Google Fonts is the one outside
request), "Using and sharing" (the licence), "Credits" (Ojibwe sources, SICP, software, typefaces, trademarks) and a
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

## 10. Adding things — recipes

- **A lesson:** add a lesson object in `course_X.js` with new ids `xx-<n>-1/2`, `<n>` being the next number
  the course has not used; run `node build.js && node test_course.js X`. If inserting mid-course, keep the later
  lessons' ids as they are (see §6) and update the "Lesson N" cross-references, including "the next lesson" in the
  lesson before, the course tagline, and the lesson count in `guide.js`.
- **A math exercise kind:** extend `mathgrade.js` (`grade`, `reference`, `empty`), the renderer in
  `app.js: mathExerciseBlock`, and the README table.
- **A widget:** `window.WIDGETS.name = (mount, block, course) => {…}` in `widgets.js`; use `{ fig: 'name' }`.
  Current widgets: names, trace, indexer, search, sort, caesar, evaltree, subst, venn (params `a`, `b`:
  arrays of elements; math lesson 2), boxptr, hof, pipeline, memory, array, sieve, fibtree, graphbfs, dfa, tape (machines: increment, flip, beaver), letters (splits double vowel spelling into letters by longest
  or shortest match; param `sample`; math lesson 7).
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
- **A runtime change (JSCPP):** edit node_modules, rebuild `vendor/jscpp.min.js` with the esbuild
  command in the README, append the diff to `patches/jscpp-iostream.patch`.

## 11. Testing and release

1. `npm install`, then `patch -p0 < patches/jscpp-iostream.patch` (once).
2. `node build.js`, then `npm test`: `test_course.js` for each course (every solution passes, every starter fails,
   every playground runs), `test_cppstep.js` and `test_subst.js`. C++ in both test scripts goes through the site's own
   `ensureMainReturns`, read out of `src/app.js`, so programs are graded exactly as on the site.
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
4. Deploy `dist/index.html` (any static host; it also works opened from disk).

## 12. Known limits and sharp edges

- Skulpt prints floats to 15 digits; `(/ 1 3)` in Scheme prints `.333333333333`; JSCPP lacks
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
- The DOM's own `append`, `prepend`, `replaceChildren`, `before` and `after` print `null` (and `false`) as text. Build
  nodes with `el()` (which skips `null`, `undefined` and `false`), or pass `[...].filter(Boolean)`; never hand a
  possibly-empty value straight to those methods.
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
