/* Site-wide settings and text. Fields marked (html) may contain HTML. */
window.SITE = {
  /* Shown in the top bar, the page title and the home page. */
  name: 'Short Explorations in Computer Science',

  /* One line under the name on the home page. */
  role: 'Free, self-paced courses in Python, Lisp, C++, Java and the mathematics of computing',

  /* Contact links, shown on the home page and the About page: { label, href } (href: null for plain text). */
  contact: [
  ],

  /* Introduction to the course catalogue on the home page. (html) */
  coursesIntro: `<p>Free, self-paced and not for credit. Each course is a handful of lessons with code you run and change on the page, and exercises that check your answer as you go.</p>
<p><b>New to programming? Start with Python.</b> Then <b>C++</b> shows what the machine is doing underneath, <b>Lisp</b> looks at programs the way a mathematician does, and <b>Java</b> is the language of AP Computer Science A and of Android. <b>Modern C++</b> continues C++ with a real compiler, and <b>Data Structures and Algorithms</b> is the course every degree puts second. <b>Mathematics of Computing</b> asks what a computer can and cannot do, with Python as its laboratory.</p>
<p>A programming lesson is one <b>Hour of Code</b>: 45–60 minutes, nothing to install. Mathematics lessons run longer and say so in their list.</p>`,

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
