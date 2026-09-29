/* Site-wide settings and text. Fields marked (html) may contain HTML. */
window.SITE = {
  /* Shown in the top bar, the page title and the home page. */
  name: 'Short Explorations in Computer Science',

  /* One line under the name on the home page. */
  role: 'Free, self-paced courses in Python, Lisp, C++ and the mathematics of computing',

  /* Contact links, shown on the home page and the About page: { label, href } (href: null for plain text). */
  contact: [
  ],

  /* Introduction to the course catalogue on the home page. (html) */
  coursesIntro: `<p>The short courses below are free, self-paced and not for credit. Each one is a handful of lessons with code you can run and change directly on the page, and exercises that check your answer as you go. They are meant to build interest and a solid footing, not to replace a full course; if one of them catches you, talk to your teacher about what to take next.</p>
<p>The three programming courses teach the same core ideas: values and names, decisions, repetition, functions, lists, and a first look at algorithms. What differs is the flavour. <b>Python</b> is the friendliest place to start and is where most people should begin. <b>Lisp</b> takes the same ideas and looks at them through a mathematician's eyes, which changes how you think about the programs you already know how to write. <b>C++</b> pulls back the curtain and shows what the machine is doing underneath. The fourth course, <b>Mathematics of Computing</b>, steps back from any one language and asks what a computer is, what it can and cannot do, and how to prove it; it uses Python as its laboratory and suits anyone who has finished the Python course. Each lesson of the three programming courses is sized to be a single <b>Hour of Code</b> activity: about 45–60 minutes including the exercises, with no setup and nothing to install. The mathematics lessons are longer, most of them 60 to 90 minutes, and any lesson likely to take more than an hour is marked in its course\u2019s list.</p>`,

  /* Shown on every course page. (html) */
  howItWorks: `<h3>How these pages work</h3><p>Every code block has a <b>Run</b> button. Change the code and run it again — that is the whole method. Exercises have a <b>Check answer</b> button that runs your code against hidden tests and tells you exactly what it expected. Hints are progressive, and a solution is available once you have had two tries. Your progress and code are saved in this browser only; nothing is sent anywhere.</p><p>Each lesson stands on its own: read, run, predict, and finish the two exercises. Most take 45–60 minutes, one <b>Hour of Code</b>; a lesson likely to take longer is marked in the list below and at the top of the lesson. Lessons build on each other, so go in order if you can.</p>`,

  /* Who made the site and why, shown at the top of #/about. (html) */
  about: `<p>These courses were written and built by Michael Sayers, for anyone who wants to learn to program. They are free, need no account and nothing installed, and keep every student's work on the student's own device.</p>`,

  /* Licences, shown on #/about (the repository states the same in LICENSE and LICENSE-CONTENT.md). "code" covers the
     program files; "content" covers the lessons, exercises and the teacher guide. Two parts keep the licences of
     their sources: src/ojibwe.js is CC BY-NC-SA 3.0 (the Ojibwe People's Dictionary), and the Lisp course's material
     adapted from SICP is CC BY-SA 4.0, which is why the content licence is CC BY-SA 4.0. */
  licence: {
    code: { name: 'MIT License', url: 'https://opensource.org/license/mit' },
    content: { name: 'CC BY-SA 4.0', url: 'https://creativecommons.org/licenses/by-sa/4.0/' }
  },

  /* Where the source code can be downloaded (e.g. the repository). Empty hides it. */
  sourceUrl: 'https://github.com/msayers01/Short-Explorations-in-Computer-Science',

  /* Bottom of the home page. */
  footer: '© 2026 Michael Sayers. Free to use, adapt and share under open licences.'
};
