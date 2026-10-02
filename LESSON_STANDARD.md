# The lesson standard

How a lesson on this site is built, and why. Every new lesson follows it; old lessons are brought up to it one at a time. The rules come
from research on how programming is learned and how memory works (the evidence is summarised at the end). Where a program can check a
rule, `test_lessons.js` does.

- A course or a single lesson opts in with `standard: 1`. From then on every gap below is an **error** for it.
- `node test_lessons.js --standard` lists, for every lesson on the site, which rules it does not meet yet. Use it to plan a retrofit.
- SC 106 lessons 5-8 were the first lessons brought up to the standard; SC 109 How Machines Learn is the first course written to it from
  lesson 1, with named skills and checkpoints. Read one of its lessons before writing a new one.

## 1. The shape of a lesson

A lesson is one sitting of 45 to 60 minutes (an Hour of Code). Its parts always come in this order, so a student learns the routine
once and always knows where they are.

| # | Part | What it is | Why |
|---|---|---|---|
| 1 | **Story and question** | A short true story that ends on a question the lesson answers. | Curiosity comes from noticing a gap in what you know; a question asked before teaching helps the answer stick (the prequestion effect). |
| 2 | **Warm-up review** *(not built yet)* | Three items due from earlier lessons, mixed. | Spaced, mixed retrieval is the best-supported way to make learning last. Arrives with the review queue. |
| 3 | **For each main idea** (two or three per lesson) | See the next table. | |
| 4 | **Trace and put in order** | A trace table (`kind: 'trace'`) on the lesson's main loop or method, and a Parsons problem (`kind: 'parsons'`), before the writing exercises. | Tracing predicts writing; Parsons problems give the same learning as writing code, in less time: the ramp anxious students need. |
| 5 | **Make** | Two graded exercises on today's ideas. | Practising one idea at a time while it is new. |
| 6 | **Explain it back** *(not built yet)* | One sentence explaining the student's own passing code, compared with a model answer. | Self-explanation; a third of students who write a working program cannot explain it. |
| 7 | **Recap** | The rules again in general terms, and the answer to the opening question. | Moving from the examples back to the general rule. |

Each main idea:

| Step | What it is | Block |
|---|---|---|
| Rule | One `stmt` box: the rule, stated plainly. Where memory or control flow matters, a figure beside the code it explains. | HTML string, `{ fig }` |
| Example | A short program that shows the rule. The key example of the idea asks for a **prediction** first. | `{ play, predict: true, caption }` |
| Investigate | The caption, shown after the run, explains what happened and what to change. A "Guess first" reveal can stand in for a prediction where typing the output would be tedious. | `caption`, `<details class="reveal">` |
| Quick check | One question, answered with a confidence rating. Every wrong option says which belief it reveals. | `{ check, options, answer, why, wrong }` |

## 2. The rules the linter checks

| Rule | The lesson must | How to meet it |
|---|---|---|
| **S-question** | ask a question before the first section | End the story on the question the lesson answers, or open with a prediction or a reveal. |
| **S-predict** | ask for a prediction in every section that has a runnable example | `predict: true` on the key example of the section (or `predict: 'a question'`), or a `<details class="reveal">` "Guess first" in the same section. Not for examples that fail on purpose. |
| **S-do** | never have more than 450 words of reading without something to do | Something to do means an example, a quick check, a figure, an exercise or a reveal. 450 words is about three minutes. |
| **S-checks** | have three quick checks, each with a `wrong` reason for every wrong option | `wrong` is aligned with `options`, with `null` for the right answer. |
| **S-spacing** | never put two examples in a row | Put prose, a check or a figure between them. |
| **S-short** | keep examples to 25 lines | Split the example, show part of it as a `{ code }` listing, or, when a whole class with its `main` needs the room, mark it `long: true`. |
| **S-make** | have at least two graded exercises, each with two or more hints and a `followup` | Hints go from a nudge to the near-solution; the followup is a stretch task. |
| **S-recap** | end with the recap (or, in a project lesson, stretch goals) | The last block is the `<div class="recap">`. |
| **S-level** | keep the prose at or below the course's `readingGrade` | Set `readingGrade` on any course for grades 5-8 (Scratch to Python is checked at grade 4.5 by its own rule). |
| **S-checkpoint** | (a checkpoint lesson) teach nothing new and ask about the whole unit | No `stmt` box; at least six quick checks, each with `wrong` reasons and a `skill` taught earlier, together covering every lesson since the last checkpoint; two exercises; a recap. The other rules do not apply to it. |
| **S-skills** | (the course) name its skills and tag everything with them | Every quick check and exercise of a standard lesson names a skill of `course.skills`; every skill used has at least one quick check, so it comes back in the review; 15 to 30 skills once the course is no longer `developing`. |
| **S-units** | (the course) end each unit with a checkpoint | At most four lessons in a row without a `checkpoint: true` lesson. |

## 3. Writing each part

**The story.** True, checked, short: one or two paragraphs. It ends on a question: *"So what happens when a program reaches for a slot
that is not there?"*. The recap answers it. Stories are not decoration: an interesting but irrelevant detail pulls attention away from the
point, so the story must lead to the idea.

**Pictures.** Things and ideas, never portraits (Ada Lovelace in SC 101 is the one exception the owner chose to keep). A machine with a
person beside it is fine; a person as the subject is not. Prefer the picture that explains the concept: dice for Monte Carlo, a sieve for the
Sieve of Eratosthenes, a house plan for a class. See ARCHITECTURE §9h for how pictures are fetched.

**Examples.** One new idea per example, under 15 lines for beginners where possible. Choose the key example of each idea for
`predict: true`. A good prediction example has:
- short output (1 to 6 lines);
- output that is the same on every run (no `random`, no hash codes, no timing);
- an answer that depends on the idea being taught, not on a detail.

With `predict`, the caption is held back until after the first run and appears under **Why**. So write it as the explanation: give the
output, say why, and suggest what to change. Captions on other examples say what to look for before running.

**Quick checks.** After the idea, never before. Build the wrong options from the misconceptions novices really hold (Qian & Lehman 2017),
for example:
- `=` read as an equation;
- `print` mistaken for `return`;
- off-by-one;
- two names for one list or array (aliasing);
- the belief that a method can change the caller's `int`;
- the belief that the computer "knows" what was meant.

Each `wrong` reason names the belief and corrects it in a sentence. Students rate how sure they are before seeing the result. A confident
miss and a lucky guess each get their own message, so the reason must teach on its own.

**Trace tables.** Pick the loop or method the lesson is about, 5 to 9 lines, and 4 to 6 steps; show the first row as the example. Watch a
line inside the loop body, or the loop header (a header line is captured as its body starts). Use `'-'` for a variable that does not exist
yet or any more, and add `why` messages for the two mistakes you expect (not adding yet; resetting an accumulator). The values must be
what really happens: `test_course.js` runs the program and fails the build otherwise.

**Parsons problems.** 5 to 9 lines. Give `tests` whenever the program can run, so any order that works is accepted. Add one or two
distractors that encode a misconception (`range(2, n)` for "up to and including n"; `int best = 0` for the largest of negative numbers),
and say in the prompt that not every block belongs.

**Exercises.** Two per lesson, on today's ideas only.
- **Prompt:** literal, with the exact expected output shown.
- **Hints:** at least two, from a nudge ("deal with the easy case first") to a near-solution. Hints and followups of code exercises are plain
  text, not HTML.
- **`failTip`:** names the most common way to fail the tests.
- **`followup`:** a stretch task for students who finish.

**Prose.** Short paragraphs, one rule per `stmt` box, short `<h2>` headings (they become the lesson map). Literal instructions, exact
expected output, no timers on thinking, and nothing that animates without a pause. The same order of parts in every lesson.

## 4. A course

Each course is built from:
- **Units** of three or four lessons, each ending with a **checkpoint**: no new material, mixed questions on the confusable pairs of the
  unit (`for`/`while`, `=`/`==`, array/`ArrayList`, `cp`/`mv`), and "which construct fits this problem?". Mark it `checkpoint: true`.
  SC 109 lesson 4 is the first.
- **A project lesson** every two units, where students choose the theme.
- **Named skills**, 15 to 30 per course: `skills: [{ id, name }]` on the course, and `skill: 'id'` (or a list) on every quick check and
  exercise. The skills map on the course page and on the Review page shows each as not started, practising or secure.
- **A teacher note for every lesson** in the teacher guide, giving:
  - the model solution;
  - the three most common wrong answers and the misconception behind each;
  - another way to explain it;
  - a peer-instruction question for class.

## 5. The evidence, briefly

| Finding | Source |
|---|---|
| Classroom quizzing raises achievement, g = 0.50 over 222 studies; more with feedback and repetition. | Yang et al. 2021, *Psychological Bulletin* |
| Spaced retrieval beats massed, g = 0.74; expanding gaps are no better than equal ones. | Latimier, Peyre & Ramus 2021, *Educational Psychology Review* |
| Asking before teaching helps learn the asked-about content, g ≈ 0.54. | St. Hilaire, Chan & Ahn 2024, *Psychonomic Bulletin & Review* |
| Errors made with confidence and then corrected are remembered especially well. | Metcalfe 2017, *Annual Review of Psychology* |
| PRIMM (predict, run, investigate, modify, make): 493 pupils aged 11-14 scored higher than comparison classes. | Sentance, Waite & Kallia 2019, *Computer Science Education* |
| Tracing and explaining code predict the ability to write it; tracing-first teaching gave about 60% more gain than Codecademy. | Lopez et al. 2008, ICER; Nelson, Xie & Ko 2017, ICER |
| Worked examples beat unaided problem-solving for novices, g = 0.48; subgoal labels cut CS1 failure. | Barbieri et al. 2023; Margulieux, Morrison & Decker 2020 |
| Parsons problems: same learning as writing code, in less time. | Ericson, Margulieux & Rick 2017, Koli Calling |
| Self-explanation prompts, g = 0.55. | Bisra et al. 2018, *Educational Psychology Review* |
| Visualisations help only when learners act on them (predict, answer), not when they watch. | Hundhausen, Douglas & Stasko 2002 |
| Hand-written error explanations beat both compiler messages and GPT-4's. | Santos & Becker 2024, UKICER |
| Points and badges alone do little; narrative and meaningful challenge help; a broken streak demotivates. | Sailer & Homner 2020; Silverman & Barasch 2023 |
| No evidence for teaching to "learning styles"; dyslexia fonts have no effect (g = −0.04). | Pashler et al. 2008; Azzarello et al. 2026, *Annals of Dyslexia* |

Most of this research was done with university students or in short lab tasks. Classroom studies with teenagers are fewer, so treat the
standard as a well-founded default, not a proven formula. The full review, with the student and teacher features it leads to, was written
for the owner in October 2026.
