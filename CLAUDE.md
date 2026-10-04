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
    node test_course.js python|lisp|cpp|math|modern|java|ml   # one course; "modern" compiles with the real compiler, about 1.5 minutes
    node test_java.js      # the Java interpreter against what javac/java print (a few seconds)
    node test_typed.js     # typed input (Scanner, cin answered as the program asks), in the real worker sources (a few seconds)
    node test_shell.js     # the practice shell: file system, parser, every command, limits, hostile saved copies (a second)
    node test_lessons.js   # the lesson linter (part of npm test); --update records new exercise ids in lint/exercise-ids.txt
    npm run test:diff      # java.js against a real JDK 21, shell.js against bash (about 35 s; SEED=n COUNT=n searches further)
    npm run test:browser   # needs a built dist and Chromium (playwright-core); serves dist over a local http server; about 1.5 minutes

CI (`.github/workflows/ci.yml`) runs install, `npm test`, `npm run test:diff` (with JDK 21), build, `npm run test:browser` on every PR and push to main. CodeQL also runs.
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
  `connect-src 'self'` (only for the Full C++ download), `img-src 'self' data: blob:` (the lessons' pictures), `worker-src blob:`, no other origin. A new inline script needs nothing (its hash is
  computed); a new external resource must be added deliberately. Fonts are embedded as data URIs.
- **Student code never runs in the page.** Python (Skulpt) and C++ (JSCPP) run in Web Workers built from inert `<script type="text/plain">`
  blocks (`src/runner.js`); turtle graphics in a sandboxed iframe without `allow-same-origin`. Scheme runs in the page (own interpreter,
  no `eval`). Everything coming back from a sandbox is untrusted: shown as text only.
- **Everything from a link or a file is checked** before use: `TEACH.normalize/cleanSub`, `BACKUP` sanitizers, `ID_RE`, `hasLang`,
  null-prototype dictionaries (a key may be `__proto__`), size-capped `unpack`. Add a hostile-input test with each new field (see
  `test_backup.js`).
- Ids of exercises are never renumbered (progress and portfolios are keyed by them); `lint/exercise-ids.txt` and `test_lessons.js` enforce it.
- Build nodes with `el()` (the DOM's own `append` prints `null`/`false` as text; `src/domsafe.js` is a net under that, not a licence).
- JSCPP is patched (`patches/*.patch`, applied to node_modules by `scripts/patch-jscpp.js`, baked into `vendor/jscpp.min.js`).

## Java (ARCHITECTURE §9e)

- The site's own interpreter, `src/java.js` (lexer, parser, javac-style checker, library table, interpreter), in a worker like JSCPP
  (`src/javaworker.js`, data block `java-src`), `JAVARUN` in `runner.js`, harness for method exercises in `src/javautil.js`.
- Error messages are javac's words; outputs match real Java (number formatting, HashMap order, Random sequence, stack traces). When adding
  a lesson example, make sure its expected output is what a real JVM would print, not what seems reasonable.
- Not covered: user generics, lambdas, nested classes, enums, records, streams, files, threads; `==` on Strings compares text (so that trap is taught with a listing, not a runnable example).
- Queue/Deque/ArrayDeque have their own method tables (no index methods; `remove(x)` removes a value, `remove()` the head), as in Java.
  Comparator works only as a user class implementing `compare` (no lambdas), or `Collections.reverseOrder()`; `TreeSet`/`TreeMap` take one and then treat keys as the same when it says 0, as Java does. `%f %e %g` round the shortest decimal half-up, like
  `java.util.Formatter`. Exception messages follow JDK 21's wording. `test_java.js` expectations were produced by a real JDK: keep it so.
- After changing `java.js` or `shell.js`, run `npm run test:diff` and a few extra seeds (`SEED=2 COUNT=40 node test_diff.js java`). A new
  difference is a bug to fix; only a deliberate one goes in `difftest/known.json`, with its reason.
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

- Merged: everything below through PR #35 (`main` = `aea174b`), except SC 109, which is on the working branch. PRs #21-#26: the practice terminal, SC 108 lessons 1-4, the one-inline-script
  build, SC 099, Scratch lessons 8-9, the tour. PR #27 was a bug sweep (four reviews: shell against bash, Java against javac/java 21, the
  app and Scheme, course text): see its commit messages. Bugs it found but left: Scheme character literals. (Java switch expressions and `yield` were added in October 2026, with javac's errors for a missing `default`, `yield` outside a switch expression, `break`/`return` out of one, and unreachable statements: `difftest/java/probe-sw*.java`, `probe-e*.java`, `probe-u*.java`. Pattern matching in `case` is still not covered.) (Java `%1$s` / `%<s`
  and `new TreeSet<>(comparator)` / `new TreeMap<>(comparator)` were fixed in October 2026: `difftest/java/probe-tc.java`.) (Shell `${s/a/b}`, `${f%.txt}`, `${p##*/}`, `${s^^}` and negative slices were added in October 2026 and are checked against bash in `difftest/shell.txt`; `${x@Q}`-style transforms and arrays still report "bad substitution".)
- SC 105 Modern C++ has 8 lessons (string, vector, references, struct, class, algorithms/lambdas, map/set, gradebook project), 15 exercises.
- SC 107 Data Structures and Algorithms (Java, `src/course_dsa.js`, finished October 2026): 12 lessons (cost and arrays; searching; simple sorts; merge sort and
  quicksort; linked lists; stacks and queues; recursion; hash tables; binary search trees; heaps and priority queues; graphs; a project, the busiest words),
  about 50 exercises (`ds-<n>-<k>`; code and `answer` kinds), every lesson `standard: 1` at lesson level. Figures growth, arrayops, dynarray, search, sortlab,
  mergeviz, partition, linkedlist, stackqueue, callstack, hashtable, bst, heap, graph (modes bfs, dfs, dijkstra). Lessons 8-11 were written by parallel
  agents and checked against a real JDK 21 (`test_diff.js java` runs every example and exercise solution). The interpreter has no `java.util.Stack` (taught as legacy,
  not run); `ArrayDeque` works as stack, queue and deque; `PriorityQueue` is OpenJDK's heap, so printing it shows the heap array. A `\n` inside a Java string in a
  lesson must be written `\\n` in the template literal. Linked-list, tree and heap exercises use `classes: true` with top-level classes (no nested classes in the
  interpreter). Graph exercises take a ragged `int[][]` adjacency list because a `{call}` test cannot build a `List<List<Integer>>`. The interpreter's recursion
  limit is `MAX_DEPTH` = 1200 frames in node, but in Chromium's worker the JS stack runs out at about 270 Java frames (measured October 2026): keep recursion demos and
  exercise tests under about 200 deep, and check examples in a browser, since node-based tests cannot see this. Fixing it properly means fewer JS frames per Java call
  in `java.js`. Not done: course-level skills and checkpoints (they would renumber lessons), AVL/red-black rotations as code, minimum spanning trees, union-find, dynamic programming.
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
- Courses still being written carry `status: 'developing'` (Scratch to Python, Modern C++, The Command Line, How Machines Learn): an "Under development" tag (app.js `devTag`).
- SC 106 Introduction to Java (finished October 2026): the interpreter and 12 content lessons (now 15 with the checkpoints) (Hello Java and types; decisions and Scanner; loops; methods;
  arrays; Strings; ArrayList; classes and objects; 9 inheritance and interfaces; 10 exceptions; 11 HashMap and HashSet; 12 project, a text-mode
  Minecraft crafting table), 22 exercises (`jv-<n>-<k>`). Every lesson has `standard: 1` (lesson level: no course-level skills or checkpoints, so no
  renumbering). Lessons 1, 4, 7, 8, 9, 10, 12 use Minecraft. The interpreter lacks `String.chars()`, `codePointCount`, `"".formatted(...)`, and infers
  `List<Object>` for `new ArrayList<>(Arrays.asList(..))` used directly as an argument (fine when assigned to a typed variable). Exercises that use
  `classes: true` get their imports from `ex.prelude` (the harness puts a `Check` class before the student's code, so the student must not write imports).
  **Checked exceptions** (added October 2026): `throws` is now parsed and enforced like javac does for what can be seen in the source: `throw new X`
  where X is checked, and calls of the program's own methods and constructors that declare `throws`; plus "exception X is never thrown in body of
  corresponding try statement". Not checked: `throw e` of a variable (precise rethrow), overriding rules for `throws`, initializer blocks. The lessons
  teach custom exceptions as `extends RuntimeException` and show `extends Exception` once, with `throws`. `LinkedHashMap`, `LinkedHashSet` and `PriorityQueue` exist (the queue is OpenJDK's binary heap, so `System.out.println(pq)` shows the heap's array order as Java does; `difftest/java/probe-pq.java`).
  Probes: `difftest/java/probe-x1..x8.java`, `probe-lh.java`.
- SC 101 Introduction to Python (`src/course_python.js`, 13 lessons, `py-<n>-<k>`): every lesson has `standard: 1` at lesson level (October 2026: stories end on a question, `predict: true` or a "Guess first" reveal in every section, `wrong` reasons on all quick checks, followups, and new trace exercises `py-5-3`, `py-6-3`, `py-7-3`, `py-8-3`, `py-9-3`, `py-11-3`; lesson 4 already had a trace and a Parsons problem). Not done: course-level skills and checkpoint lessons (they would renumber lessons). Skulpt prints `4/3` as `1.333333333333333` (CPython: `1.3333333333333333`) and `round(x, n)` can differ: do not state such values in captions. Examples that read `input()` use reveals, not `predict`.
- **Every lesson on the site now has `standard: 1`** (October 2026, lesson level; `node test_lessons.js --standard` shows OK for all). Retrofits of SC 100, 101, 104, 105 and 108 added stories that end on a question, predictions or "Guess first" reveals, `wrong` reasons on every quick check, followups and `failTip`s; new exercises: `py-5-3 py-6-3 py-7-3 py-8-3 py-9-3 py-11-3` (traces) and `mc-8-2`. SC 108 examples are terminals, which ignore `predict`: they use reveals. SC 100 lesson 7's assembled game is `long: true` at 52 lines. Course-level skills and checkpoint lessons now exist in EVERY course (SC 099-109). Retrofit agents ran Python examples in CPython as well as Skulpt: check any printed float in Skulpt.
- **Course-level architecture** (October 2026): SC 100 Scratch (11 lessons: checkpoints 5 and 10; 21 skills; sp-10-*, sp-11-* checkpoints, Parsons sp-12-1, sp-12-2; the planned dictionaries and what-next lessons will need their own unit and checkpoint), SC 104 Math (16 lessons: checkpoints 5, 10, 15, the RSA project is 16; 29 skills; ma-14-* .. ma-16-* checkpoints, traces ma-17-1..3), SC 105 Modern C++ (10 lessons: checkpoints 5 and 9, the project is 10; 29 skills; mc-9-*, mc-10-* checkpoints, trace mc-3-3, Parsons mc-2-3, mc-7-3; `test_course.js` `verifyTrace` now handles Full C++ too, with `std::cout`), SC 108 Command Line (5 lessons: lesson 5 is the checkpoint, 12 skills, sh-9-* its exercises; the planned lessons are now 6 running programs, 7 Windows, 8 a first script, 9 the tidy-a-folder project) and SC 101 Python (16 lessons, checkpoints 5, 10, 15, the project is 16; 29 skills; ids py-14-* .. py-16-* are the checkpoints', py-17-*, py-18-* new Parsons/traces), SC 102 Lisp (13 lessons, checkpoints 5, 10; 29 skills; ls-12-*, ls-13-* checkpoints, Parsons ls-4-3 ls-7-3 ls-8-3; no Scheme traces because `verifyTrace` handles Python, Java and C++ only) and SC 107 DSA (15 lessons, checkpoints 5, 10, 14, project 15; 29 skills; ds-13-* .. ds-15-* checkpoints, traces ds-2-4 ds-3-4, Parsons ds-5-4; `difftest/known.json` is keyed by lesson number: `dsa/8/play2`), besides SC 106 Java (15 lessons: checkpoints at 5, 10, 14, the project is 15; 25 skills; new exercises jv-13-* .. jv-15-* are the checkpoints' and jv-4-3, jv-7-3, jv-11-3 are a trace and two Parsons problems) and SC 103 C++ (13 lessons: checkpoints at 5 and 10, the project is 13; 28 skills; cp-12-*, cp-13-* are the checkpoints'; traces cp-3-3, cp-5-3, cp-10-3, Parsons cp-6-3) have `standard: 1` on the course. Exercise ids must match `^jv-\d+-\d+$` / `cp-\d+-\d+`, so checkpoint ids borrow unused numbers and are not lesson numbers. Progress and review are keyed by exercise id and a hash of the question, so lesson renumbering is safe for saved data, but links like `#/java/9` and the lists in `applied.js` had to be remapped by hand: do the same whenever lessons are inserted. `test_course.js` now checks C++ trace tables.
- SC 102 Introduction to Lisp (`src/course_lisp.js`, 11 lessons after SICP 1.1-2.3 plus the symbolic-differentiation project, 22 exercises `ls-<n>-<k>`):
  every lesson has `standard: 1` (lesson level, October 2026: stories end on a question, `predict: true` on the key example of each section with the
  caption rewritten as the explanation, `wrong` reasons on all 33 quick checks, followups on every exercise). Not done: course-level skills and
  checkpoint lessons (they would renumber lessons that other pages link to as `lisp/N`), a networks of ideas beyond SICP (vectors, `set!` and
  state, streams), and Scheme character literals. The captions' computed values were checked by running the examples.
- SC 103 Introduction to C++ (`src/course_cpp.js`, 11 lessons on JSCPP, 22 exercises `cp-<n>-<k>`): every lesson has `standard: 1` at lesson level (October 2026, same
  treatment as SC 102: stories end on a question, predictions, `wrong` reasons, followups). Lesson 9 (random numbers) has no `predict: true`, only "Guess first"
  reveals about properties, because its output varies. Examples were trimmed to 25 lines rather than marked `long`. Not done: course-level skills and
  checkpoints (they would renumber lessons). Structs, classes, references and `std::` containers are deliberately left to SC 105.
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
- SC 099 What Is a Computer? (`src/course_computer.js`, `lang: 'none'`, `standard: 1`, first in the catalogue; finished October 2026): 11 lessons in
  three units. Unit one, the machine: 1 the parts; 2 the processor and memory; 3 storage, input and output; 4 software; 5 Checkpoint one.
  Unit two, inside the bytes: 6 everything is numbers (ASCII/Unicode, pixels and colour, sound samples, compression); 7 switches that think
  (transistors, NOT/AND/OR/XOR, an adder); 8 computers talking (IP, DNS, packets, routers, a trip to a web page); 9 Checkpoint two. Unit three:
  10 staying safe (passwords as counting guesses, phishing, malware, https, privacy); 11 giving instructions (algorithms, a robot, and three
  listings of Python to READ, never run). 22 exercises (`cs-<n>-<k>`, answer/choice/table kinds only), 26 named skills. Figures `parts`, `cpu`, `bits`,
  `pipeline` and, new, `codes`, `pixels`, `colour`, `sampling`, `gates`, `adder`, `packets`, `passwords`, `robot` (all in widgets.js, no code runs).
  The owner's rule for this course: the most introductory one, so no coding beyond a tiny read-only taste at the end. Lessons 1-4 keep their
  numbers (urls, exercise ids, review items); new lessons are appended. `test_course.js computer` grades the exercises; test_browser.js drives every figure.
- **The tour** (`src/tour.js`, ARCHITECTURE §9a): the Tour button in the top bar (`.top-tools`, beside the classroom and theme buttons;
  it pulses until opened once, `shortcourses.tour.v1`) spotlights twelve real elements across `#/`, `#/python/1` and `#/lab`. Steps are
  `{route, target, title, text, place?, optional?}`; a target that moves or is renamed breaks its step silently (the card says the part is
  not on the page), so keep the browser check in `test_browser.js` passing. The step texts describe the UI: update them when it changes.
- **Standards** (ARCHITECTURE §9k): every lesson has `standards: [...]` (CSTA 2017 codes and Minnesota 2022 math benchmark codes); `src/standards.js` draws `#/standards` and the box under a lesson's summary; `node scripts/standards-map.js` rewrites `STANDARDS_ALIGNMENT.md` (commit it; `test_standards.js` fails if stale). Give a new lesson its `standards`. The mapping is the author's, from titles, summaries and keyword search, and the CSTA texts are paraphrases: say so, do not call a lesson "meets".
- **Courses, Algorithms, Real world** (ARCHITECTURE §9g): the top bar is Courses / Algorithms / Real world / Arena / Code Lab. `#/courses` groups the
  courses (`COURSE_GROUPS` in app.js: add a new course to a group). `#/algorithms` has 17 interactive demos (`src/algos.js` frame,
  `src/algo_{search,sort,paths,games,puzzles}.js`, each with `selfTest()` run by `test_algos.js`). The owner reports that students loved
  the sorting race: races with a bet first (sorting, maze), things to play against the computer (Hanoi, the tour) and long-running
  simulations (Life, raindrops) are what to add more of. Redraw counters once a frame (`onceAFrame` in algo_puzzles.js), never per step. `#/real-world` (`src/applied.js`) has 30 topics,
  147 examples tagged by field, and links to the lessons. The tour's top-bar step describes these pages: update it when they change.
- **Pictures** (ARCHITECTURE §9h): `{ photo: 'id' | ['a','b'], caption }` in a lesson; `img/<id>.jpg` + `img/<id>.json` made only by
  `node scripts/fetch-image.js` (Wikimedia Commons; public domain, CC0, CC BY, CC BY-SA only; `--search` first). Look at each picture
  before writing its alt text. Served from `dist/img/` (content-hashed, lazy); credits on About. Wikimedia rate-limits this machine: one
  request at a time, and the script waits.
- **Pictures show things and ideas, not people** (the owner's rule, October 2026): no portraits. The one exception the owner asked to keep
  is Ada Lovelace in SC 101. A machine with someone standing beside it is fine; a person as the subject is not. Prefer a picture
  that explains the concept (dice for Monte Carlo, a sieve for the Sieve of Eratosthenes, a plan for a class).
- The DOM's own `append`/`replaceChildren` used to print `null`/`false` and arrays as text: `src/domsafe.js` (first in the script) now makes them skip those and flatten arrays (the stray "null" in the Life demo, the bits and knn figures and the shell lesson's tree came from this). Still prefer `el()`.
- Ideas not started: C in the Code Lab (same compiler); lessons 9-10 of SC 105
  (templates, `unique_ptr`, file streams; exceptions are impossible here); a service worker so the compiler stays cached offline (adds a file
  beside the single-page design and needs a policy change); splitting CI (about 4 minutes now); a Java step-through debugger like the C++ memory stepper.
- Not verified: Full C++ on low-end devices (needs about 84 MB plus the program), and on the production URL since the security-review merge.

- **Bot Arena** (ARCHITECTURE §9j, `src/tron.js`, `arena*.js`, `test_arena.js`): Tron bots in Python/Java/C++/Scheme at `#/arena` and `#/arena/tournament` (PR #40, merged).
  All four phases of the owner's spec are built. **Persistent mode** needs cross-origin isolation: `dist/_headers` sends COOP `same-origin` and COEP `require-corp` on a `/*` rule (a rule for `/` or `/index.html` does not reach the document on Cloudflare: `/index.html` only answers with a redirect; checked with curl on a PR preview, October 2026; the page's own `/` also gets none of the CSP *headers*, only the `<meta>` policy, which predates this and is left alone because a `/*` CSP rule would break the teacher guide's script hash). The page loads nothing from another origin, so persistent mode should be on in production and previews and is off for a file or a framed copy (not yet seen working on a deployed URL: this sandbox's Chromium cannot trust the proxy certificate); the worker side is `botio.js` (SharedArrayBuffer + `Atomics.wait`), the page side `botsession.js`, and `test_arena.js` runs the real worker source in node's `worker_threads`. Arena bots are in the backup file (not the match setup). Known gaps: no stderr in the sandboxes (so `LOG ` lines);
  the teaching C++ has no `string`/`vector` (the C++ bots use char arrays); Scheme has no vectors, so its Flood Fill uses lists; the first-legal-move starter beats Random only about
  55-65% of the time (the spec's 90 of 100 holds for the Flood Fill solutions). Scheme gained `read`, `read-line`, `eof-object` (stdin option).

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
  `test_lessons.js` checks the structure, the HTML of every field (a C++ header in a caption must be `&lt;ctime&gt;`) and the Scratch reading level.
- **New lessons follow LESSON_STANDARD.md** (built from a literature review in October 2026): a question before teaching, `predict: true`
  on the key example of each section (the caption then shows after the run, as the explanation), a `wrong` reason for every wrong option of
  a quick check, at most 450 words without something to do, examples of at most 25 lines (`long: true` for a whole class), two exercises
  with two or more hints and a `followup`. Put `standard: 1` on a new lesson (or course) and the linter enforces it; `node test_lessons.js
  --standard` reports the gaps of every lesson (SC 106 lessons 5-8 are the first to meet it). Quick checks ask Sure / Think so / Guessing
  before marking. **Spaced review** (`src/review.js`, ARCHITECTURE §9i): every quick check answered in a lesson comes back on `#/today`
  after 1, 3, 10, 30, 90 days (key `shortcourses.review.v1`, in backups); the skills map shows each lesson as not started / practising /
  secure on the course page and `#/today`. `#/review` was already the Lab's teacher route, hence `#/today`. **Trace and Parsons exercises** (ARCHITECTURE §6): `kind: 'trace'`
  (graded by mathgrade.js; `test_course.js` runs the program and checks every value) and `kind: 'parsons'` (`src/parsons.js`; with
  `tests` the built program is run). First uses: py-4-3, py-4-4, jv-3-3, jv-5-3. Still to build from the same
  review, in order: diagnostic feedback (whitespace-visible diffs, hand-written notes for common errors); exit codes and a class table for teachers;
  a display panel and read-aloud.
- **SC 109 How Machines Learn** (`src/course_ml.js`, Python, grades 9-12 after SC 101 up to Dictionaries, `standard: 1`): the first course
  written to LESSON_STANDARD.md from lesson 1. Unit one: 1 rules or examples (Paul Graham's *A Plan for Spam*, 2002: a hand-written rule,
  word counts, scoring), 2 nearest neighbours (Fix and Hodges, 1951: distance, 1-NN, k-NN), 3 is it any good? (Google Flu Trends, 2013:
  test sets, accuracy, the confusion table, overfitting), 4 Checkpoint one (`checkpoint: true`: eight mixed checks, a choice and a code
  exercise). Unit two: 5 a line that learns (Rosenblatt's perceptron, 1958; XOR and Minsky-Papert 1969), 6 walking downhill (Cauchy 1847:
  mean squared error, slope, gradient descent, learning rate), 7 twenty questions (Quinlan's ID3, 1986, on his 14 Saturday mornings:
  entropy, information gain), 8 Checkpoint two. 22 exercises `ml-<n>-<k>` (Parsons in 1, 3, 7; traces in 2, 5, 6), 21 named skills
  (`course.skills`; every check and exercise has `skill`), figures `knn` (drag the new fruit, choose k; `test: true` adds test fruit and
  scores), `perceptron` (step through every mistake on the fruit), `descent` (the error valley, a learning-rate picker), `dtree` (build
  Quinlan's tree by choosing questions, gains shown). Data stay tiny (Skulpt is slow); never print a dict in a predict example or a test
  (Skulpt's key order may differ): print values or `sorted(d.items())`. Skulpt's `round(x, n)` can print 0.9399999999999999 where Python
  prints 0.94 (it rounds 0.9403 wrong to 3 places): check every printed float in Skulpt (test_course.js does for tests; run the examples).
  Planned, units of three plus a checkpoint (S-units): unit three (9 words as numbers and Shannon's 1948 text generator; 10 a next-character
  model and temperature; 11 who does it fail? Gender Shades, 2018; 12 Checkpoint three), then 13 project: your own model and a model card.
  Lesson 8's recap promises that unit three is about words.
- **Checkpoints and named skills** (LESSON_STANDARD.md §2 and §4, `test_lessons.js`: S-checkpoint, S-skills, S-units; `review.js`:
  `skillParts`, `skillStatus`): a checkpoint has no rule box and at least six checks tagged with skills from every lesson of its unit; a
  course with `skills` must tag every check and exercise of its standard lessons.
- A function-writing exercise in a Full C++ course: use `prelude` for includes, `main` (or `call`) tests, and `name` on each test.
