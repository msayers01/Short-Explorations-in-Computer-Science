# Context for working on this repository

Short Explorations in Computer Science: free, self-paced courses (Python, Lisp, C++, the mathematics of computing, Modern C++, Java), a Code Lab,
and tools for teachers. **No backend, no accounts**: the built site is one `dist/index.html` (plus `dist/clang/<version>/`, see below).
Everything a user makes lives in `localStorage`; anything that moves between people travels inside a URL. Hosted on Cloudflare Workers static
assets. The owner is Michael Sayers; this repository is, in practice, used by the owner and Claude only.

Read `ARCHITECTURE.md` (508 lines, numbered sections) for the details; `README.md` for the layout. This file is the short version, plus what is
not written down there.

## Commands

    npm install
    npm run build          # dist/index.html, dist/teacher-guide.html, dist/_headers, dist/clang/<ver>/ (28 MB, git-ignored)
    npm test               # all node tests (pretest applies the JSCPP patches); about 2 minutes
    node test_course.js python|lisp|cpp|math|modern|java   # one course; "modern" compiles with the real compiler, about 1.5 minutes
    node test_java.js      # the Java interpreter against what javac/java print (a few seconds)
    npm run test:browser   # needs a built dist and Chromium (playwright-core); serves dist over a local http server; about 1.5 minutes

CI (`.github/workflows/ci.yml`) runs install, `npm test`, build, `npm run test:browser` on every PR and push to main. CodeQL also runs.
Cloudflare Workers Builds builds every PR (build command `npm run build`) and posts a preview URL. `dist/index.html`, `dist/_headers` and
`dist/teacher-guide.html` ARE committed: rebuild and commit them with any change to `src/`. `dist/clang/` is not committed.

## How the owner likes to work

- **Open a PR only when asked.** The pattern so far: "PR and merge" or "merge it once green". Then: open the PR, subscribe to it, wait for
  all checks (test, CodeQL x3, Cloudflare), merge with a merge commit, unsubscribe, reset the working branch to `origin/main`
  (`git checkout -B <branch> origin/main`, push). Never merge on red.
- Develop on the branch named in the session instructions (`claude/...`). After a merge, restart it from `origin/main`.
- **No security-audit report in the repository** (they asked for it to be removed and history rewritten). Findings go in the chat; what a
  future reader needs goes in ARCHITECTURE.md as design notes.
- Commit messages end with the attribution lines given in the session's system reminder.
- Say plainly what was and was not tested. Do not claim a live-site check you did not make.

## Design constraints (the ones that bite)

- **Content Security Policy** is written by `build.js` into every page and `dist/_headers`: inline scripts allowed by hash only,
  `connect-src 'self'` (only for the Full C++ download), `worker-src blob:`, no other origin. A new inline script needs nothing (its hash is
  computed); a new external resource must be added deliberately. Fonts are embedded as data URIs.
- **Student code never runs in the page.** Python (Skulpt) and C++ (JSCPP) run in Web Workers built from inert `<script type="text/plain">`
  blocks (`src/runner.js`); turtle graphics in a sandboxed iframe without `allow-same-origin`. Scheme runs in the page (own interpreter,
  no `eval`). Everything coming back from a sandbox is untrusted: shown as text only.
- **Everything from a link or a file is checked** before use: `TEACH.normalize/cleanSub`, `BACKUP` sanitizers, `ID_RE`, `hasLang`,
  null-prototype dictionaries (a key may be `__proto__`), size-capped `unpack`. Add a hostile-input test with each new field (see
  `test_backup.js`).
- Ids of exercises are never renumbered (progress and portfolios are keyed by them).
- Build nodes with `el()`; the DOM's `append` prints `null`/`false` as text.
- JSCPP is patched (`patches/*.patch`, applied to node_modules by `scripts/patch-jscpp.js`, baked into `vendor/jscpp.min.js`).

## Java (ARCHITECTURE §9e)

- The site's own interpreter, `src/java.js` (lexer, parser, javac-style checker, library table, interpreter), in a worker like JSCPP
  (`src/javaworker.js`, data block `java-src`), `JAVARUN` in `runner.js`, harness for method exercises in `src/javautil.js`.
- Error messages are javac's words; outputs match real Java (number formatting, HashMap order, Random sequence, stack traces). When adding
  a lesson example, make sure its expected output is what a real JVM would print, not what seems reasonable.
- Not covered: user generics, lambdas, nested classes, enums, records, streams, files, threads, checked-exception analysis; `==` on
  Strings compares text (so that trap is taught with a listing, not a runnable example).
- Exercises: whole programs with `{stdin, expect}`; methods with `{call, expect}` (the student writes only the `static` method; `prelude`
  for imports); whole classes with `ex.classes: true` and `{main, expect}`. Ids are `jv-<n>-<k>`.

## Two C++ engines (ARCHITECTURE §9d)

- **Teaching**: JSCPP, in the bundle, offline, the only one the memory stepper understands (SC 103).
- **Full C++**: Clang 22 as WebAssembly (`@live-codes/clang-wasm`, pinned), downloaded on demand after the student agrees, kept by the browser.
  Used by the Lab's Engine button, a C++17/20/23 picker, assignments that ask for it (`runtime: 'full'`) and every course with
  `runtime: 'full'` (SC 105). wasm32 (`long` is 4 bytes), no exceptions, no threads. Needs https or localhost (`crypto.subtle`).
  Files: `src/runner.js` (`CLANGRUN`), `src/clangworker.js`, `src/cppfull.js` (grading harness shared with the tests),
  `src/lockdown.js` (strips network/worker APIs from the interpreter workers).
- Hard-won facts: compile is 1-4 s, run is native speed; a program is compiled once and run once per input (`runMany`); **a crashed compile
  used to run the previous program** (fixed: output files are emptied, clang `error:` lines count as failure); program memory capped at
  256 MB, compiler at 1 GB; node's `execute` differs from the browser's, so test memory behaviour in the browser.

## Current state (October 2026)

- Merged and live: everything above through PR #14 (DSA lessons 1-3, Scratch lessons 1-3, Under development tags). `main` = `a3b8765`.
- SC 105 Modern C++ has 8 lessons (string, vector, references, struct, class, algorithms/lambdas, map/set, gradebook project), 15 exercises.
- SC 107 Data Structures and Algorithms (Java, `src/course_dsa.js`): lessons 1-5 (cost and arrays; searching; simple sorts; merge sort and
  quicksort; linked lists), 16 exercises (code and `answer` kinds), figures growth, arrayops, dynarray, sortlab, mergeviz, partition, linkedlist.
  Linked-list exercises use `classes: true` with two top-level classes (no nested classes in the interpreter). The interpreter's recursion
  limit is 1200 frames (`MAX_DEPTH`): keep worst-case quicksort demos at n <= 1000. Planned next: stacks and queues; recursion; hash tables;
  binary search trees; heaps and priority queues; graphs; a project.
- SC 100 From Scratch to Python (`src/course_scratch.js`, grades 5-8): lessons 1-6 (say and ask; variables; repeat, forever and the turtle;
  if/elif/else; lists; functions), 12 exercises, the `blocks` figure (Scratch blocks beside Python; C-blocks take an else child list) and
  turtle drawing inside lesson playgrounds. Ids `sp-<n>-<k>`. Lesson 6 exercises are `{call, expect}` (repr of the value). Written for
  ages 10-13: prose at Flesch-Kincaid grade 3-4 (measure with a script before adding a lesson; stories under 12 words a sentence), every
  lesson ends with a `blockquiz` figure (translate five blocks) before the exercises, every example that matters has a "Guess first" reveal,
  every exercise has a `followup` stretch challenge, and `course.affirm` gives the pass messages. Planned next: a drawing project; a text
  game; then hand over to SC 101.
- Courses still being written carry `status: 'developing'` (Scratch to Python, Modern C++, Java, DSA): an "Under development" tag (app.js `devTag`).
- SC 106 Introduction to Java: the interpreter and the first 4 lessons (Hello Java and types; decisions and Scanner; loops; methods), 8 exercises.
  Planned next: arrays; Strings; ArrayList; classes and objects; inheritance and interfaces; exceptions; HashMap; a project.
- Ideas not started: C in the Code Lab (same compiler); lessons 9-10 of SC 105
  (templates, `unique_ptr`, file streams; exceptions are impossible here); a service worker so the compiler stays cached offline (adds a file
  beside the single-page design and needs a policy change); splitting CI (about 4 minutes now); a Java step-through debugger like the C++ memory stepper.
- Not verified: Full C++ on low-end devices (needs about 84 MB plus the program), and on the production URL since the security-review merge.

## Gotchas

- The sandbox this session ran in sends Chromium through a proxy: the first request for a large uncached file sometimes fails with
  `ERR_TOO_MANY_RETRIES`; curl never does. `runner.js` retries the compiler start once.
- Skulpt reads `importScripts` while loading, so `lockdown.js` must come after Skulpt in the Python source (and before JSCPP).
- `test_browser.js` uses `file://` for most checks and a local http server for Full C++. A copy of the site opened from a file cannot use
  Full C++ (by design: it says so).
- Lesson text style: each lesson opens with a short true story, then rules in `stmt` boxes, runnable examples (`play`), two graded
  exercises (`ex`) with hints and tests, then a `recap`. Check facts in the stories; do not invent.
- A function-writing exercise in a Full C++ course: use `prelude` for includes, `main` (or `call`) tests, and `name` on each test.
