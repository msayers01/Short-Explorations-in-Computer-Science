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
    node test_shell.js     # the practice shell: file system, parser, every command, limits, hostile saved copies (a second)
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

- **Content Security Policy** is written by `build.js` into every page and `dist/_headers`: inline scripts allowed by hash only (all of
  `src/*.js` is ONE inline script, so the policy is three hashes; Cloudflare refuses a `_headers` line over 2000 characters, and build.js
  now fails rather than write one),
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
- Not covered: user generics, lambdas, nested classes, enums, records, streams, files, threads, checked-exception analysis, switch
  expressions (`yield`); `==` on Strings compares text (so that trap is taught with a listing, not a runnable example).
- Queue/Deque/ArrayDeque have their own method tables (no index methods; `remove(x)` removes a value, `remove()` the head), as in Java.
  Comparator works only as a user class implementing `compare` (no lambdas). `%f %e %g` round the shortest decimal half-up, like
  `java.util.Formatter`. Exception messages follow JDK 21's wording. `test_java.js` expectations were produced by a real JDK: keep it so.
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

- Merged: everything below through PR #27. `main` = `361036a`. PRs #21-#26: the practice terminal, SC 108 lessons 1-4, the one-inline-script
  build, SC 099, Scratch lessons 8-9, the tour. PR #27 was a bug sweep (four reviews: shell against bash, Java against javac/java 21, the
  app and Scheme, course text): see its commit messages. Bugs it found but left: Java `switch` with `yield`, `%1$s`, TreeSet/TreeMap with
  a comparator; shell `${s/a/b}` and other unlisted `${...}` forms (they report "bad substitution"); Scheme character literals.
- SC 105 Modern C++ has 8 lessons (string, vector, references, struct, class, algorithms/lambdas, map/set, gradebook project), 15 exercises.
- SC 107 Data Structures and Algorithms (Java, `src/course_dsa.js`): lessons 1-7 (cost and arrays; searching; simple sorts; merge sort and
  quicksort; linked lists; stacks and queues; recursion), 24 exercises (code and `answer` kinds), figures growth, arrayops, dynarray, sortlab,
  mergeviz, partition, linkedlist, stackqueue, callstack. The interpreter has no `java.util.Stack` (taught as legacy, not run); `ArrayDeque`
  works as stack, queue and deque. A `\n` inside a Java string in a lesson must be written `\\n` in the template literal.
  Linked-list exercises use `classes: true` with two top-level classes (no nested classes in the interpreter). The interpreter's recursion
  limit is 1200 frames (`MAX_DEPTH`): keep worst-case quicksort demos at n <= 1000 and recursion demos shallower than that. Planned next:
  hash tables; binary search trees; heaps and priority queues; graphs; a project. (Lesson text already points at hash tables as lesson 8,
  trees as 9, heaps as 10, graphs as 11.)
- SC 100 From Scratch to Python (`src/course_scratch.js`, grades 5-8): lessons 1-9 (say and ask; variables; repeat, forever and the turtle;
  if/elif/else; lists; functions; a text-adventure project; turtle art: shapes as functions, colour, fill, spirals, a flower, random stars;
  words and letters: + len [] slices, for letter in word, upper/lower/replace/count/split), 18 exercises, the `blocks` figure (Scratch blocks beside Python; C-blocks take an else child list) and
  turtle drawing inside lesson playgrounds. Ids `sp-<n>-<k>`. Lesson 6 exercises are `{call, expect}` (repr of the value). Written for
  ages 10-13: prose at Flesch-Kincaid grade 3-4 (measure with a script before adding a lesson; stories under 12 words a sentence), every
  lesson ends with a `blockquiz` figure (translate five blocks) before the exercises, every example that matters has a "Guess first" reveal,
  every exercise has a `followup` stretch challenge, and `course.affirm` gives the pass messages. A scripted `stdin` for a game example must
  end the game, or the loop runs on empty input until the time limit. Skulpt's turtle supports color (named colours), pensize, begin_fill/
  end_fill, penup/pendown, goto, speed. Planned next: a dictionaries lesson (a Scratch list of pairs → dict) and a final "what next" lesson
  handing over to SC 101.
- Courses still being written carry `status: 'developing'` (Scratch to Python, Modern C++, Java, DSA): an "Under development" tag (app.js `devTag`).
- SC 106 Introduction to Java: the interpreter and the first 4 lessons (Hello Java and types; decisions and Scanner; loops; methods), 8 exercises.
  Planned next: arrays; Strings; ArrayList; classes and objects; inheritance and interfaces; exceptions; HashMap; a project.
- **The practice terminal** (ARCHITECTURE §9f): `src/shell.js` (a real shell: parser, pipelines, redirections, variables, loops, ~70 commands,
  virtual file system with caps, saved under `shortcourses.shell.v1`, in backups) and `src/terminal.js` (the Terminal panel in the Code Lab:
  history, Tab completion, nano, `edit`, the `~/lab` mirror). `g++`/`javac` compile through check-only modes of the sandboxes; `./prog`,
  `java`, `python`, `scheme` run through the usual runners. Planned next: SC 108 The Command Line (grades 7-12, 8 lessons: paths and `cd`;
  making and moving things; looking inside files; pipes and redirection; running your programs; Windows cmd and PowerShell as a dialect
  switch over the same file system; a first script; a tidy-a-messy-folder project), terminal exercises graded on file-system state plus
  output, `setup lessonN` through the shell's `setup` hook, terminal tasks in teacher assignments.
- SC 108 The Command Line (`src/course_shell.js`, grades 7-12): lessons 1-4 (where am I: prompt, tree, paths, cd; making and moving things:
  mkdir, touch, echo >, cp, mv, rm, wildcards; looking inside files: cat, head, tail, wc, grep, find, diff, file; pipes and redirection:
  > >> < | 2> /dev/null $?, sort, uniq -c, cut, tr, McIlroy's word-count pipeline), 8 exercises (`sh-<n>-<k>`; kind `shell` graded by
  `src/shellgrade.js`, plus `answer`), the `fstree` figure, `course.setups` trees `lesson1`..`lesson4`. Lesson examples are terminals (`terminal.js: playBlock`); each has its own
  files, so an example must not depend on an earlier one; mark examples whose commands fail on purpose with `expectError: true`.
  Planned next (two lessons per PR): 5 running your programs (python, javac/java, g++, < input, > output, exit status; needs the
  sandboxes, so test_course.js shell will need a Python runner for its exercises); 6 Windows cmd and PowerShell (a dialect switch over the
  same file system); 7 a first script (variables, for, if, chmod +x, #!); 8 a project (tidy a messy folder). Lesson 3 promises lesson 7
  says more about regular expressions.
- SC 099 What Is a Computer? (`src/course_computer.js`, `lang: 'none'`, first in the catalogue): 4 lessons (the parts; the processor and
  memory; storage, input and output; software), 8 exercises (`cs-<n>-<k>`, all answer/choice/table kinds), figures `parts` (clickable
  diagram), `cpu` (fetch-decode-execute stepper over a 4-instruction program), `bits` (a byte of switches) and the existing `pipeline`.
  No code runs; `test_course.js computer` grades the math-kind exercises only.
- **The tour** (`src/tour.js`, ARCHITECTURE §9a): the Tour button in the top bar (`.top-tools`, beside the classroom and theme buttons;
  it pulses until opened once, `shortcourses.tour.v1`) spotlights twelve real elements across `#/`, `#/python/1` and `#/lab`. Steps are
  `{route, target, title, text, place?, optional?}`; a target that moves or is renamed breaks its step silently (the card says the part is
  not on the page), so keep the browser check in `test_browser.js` passing. The step texts describe the UI: update them when it changes.
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
- Lesson text style: each lesson opens with a short true story, then rules in `stmt` boxes, runnable examples (`play`), three quick
  checks (`{ check, options, answer, why }`, one after each main idea, never two examples in a row without something between them),
  two graded exercises (`ex`) with hints and tests, then a `recap`. Check facts in the stories; do not invent. The renderer labels every
  block and builds a map of the lesson from the `<h2>` headings, so headings should be short and the lesson's parts in the usual order.
- A function-writing exercise in a Full C++ course: use `prelude` for includes, `main` (or `call`) tests, and `name` on each test.
