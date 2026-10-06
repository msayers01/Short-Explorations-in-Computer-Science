/* Standards alignment: the #/standards page and the "Standards" box on every lesson, (c) 2026 Michael Sayers, licensed CC BY-SA 4.0 (see LICENSE-CONTENT.md).
   The data is of two kinds. This file holds the standards themselves (CSTA, MN) and the pages of the site that are not courses.
   Which lessons address which standard is written on the lessons: each lesson in src/course_*.js has `standards: ['2-AP-11', ...]`.
   - CSTA: the CSTA K-12 CS Standards (2017), grades 6-12, as short paraphrases of each standard (not the official wording).
   - MN: the CS-integrated benchmarks of the 2022 Minnesota Academic Standards in Mathematics, grades 6-12, from the Minnesota Department of
     Education's "Computer Science Learning Progressions" document. fit says whether lessons teach the benchmark in full or only in part.
   - Not endorsed by CSTA or the Minnesota Department of Education. The lessons were mapped by the site's author from what each one teaches.
   Every string here is our own constant text and is inserted as text (no html). test_standards.js checks the codes on the lessons.
   scripts/standards-map.js writes STANDARDS_ALIGNMENT.md from this file and the lessons. */
(function () {
  'use strict';
  // Short labels (paraphrased). The official list is at https://csteachers.org/k12standards/
  const CSTA = {
    '2-CS-01': 'Recommend improvements to device design from how users interact',
    '2-CS-02': 'Design projects combining hardware and software to collect and exchange data',
    '2-CS-03': 'Systematically identify and fix problems with computing devices',
    '2-NI-04': 'Model the role of protocols in sending data across networks',
    '2-NI-05': 'Explain how physical and digital security protect information',
    '2-NI-06': 'Apply several methods of information protection and model how well each works',
    '2-DA-07': 'Represent data using multiple encoding schemes',
    '2-DA-08': 'Collect data with computational tools and transform it',
    '2-DA-09': 'Refine computational models based on the data they generate',
    '2-AP-10': 'Use flowcharts or pseudocode to express algorithms',
    '2-AP-11': 'Create clearly named variables of different data types and operate on them',
    '2-AP-12': 'Design programs combining control structures (nested loops, compound conditionals)',
    '2-AP-13': 'Decompose problems into parts',
    '2-AP-14': 'Create procedures with parameters to organize and reuse code',
    '2-AP-15': 'Seek and use feedback from teammates and users',
    '2-AP-16': 'Incorporate existing code, media and libraries, with attribution',
    '2-AP-17': 'Systematically test and refine programs with a range of test cases',
    '2-AP-18': 'Distribute tasks and keep a timeline when collaborating',
    '2-AP-19': 'Document programs so they are easier to follow, test and debug',
    '2-IC-20': 'Compare tradeoffs of computing technologies in everyday life and careers',
    '2-IC-21': 'Discuss bias and accessibility in the design of technologies',
    '2-IC-22': 'Collaborate with many contributors on a computational artifact',
    '2-IC-23': 'Describe tradeoffs between public and private/secure information',
    '3A-CS-01': 'Explain how abstractions hide implementation details of computing systems',
    '3A-CS-02': 'Compare levels of abstraction: application software, system software, hardware',
    '3A-CS-03': 'Develop guidelines for systematic troubleshooting',
    '3A-NI-04': 'Evaluate scalability and reliability of networks (routers, switches, servers, topology, addressing)',
    '3A-NI-05': 'Give examples of how malware and attacks affect sensitive data',
    '3A-NI-06': 'Recommend security measures for scenarios (efficiency, feasibility, ethics)',
    '3A-NI-07': 'Compare security measures and the usability/security tradeoff',
    '3A-NI-08': 'Explain tradeoffs in selecting cybersecurity recommendations',
    '3A-DA-09': 'Translate between bit representations of characters, numbers, images',
    '3A-DA-10': 'Evaluate tradeoffs in how data is organized and where it is stored',
    '3A-DA-11': 'Create interactive data visualizations',
    '3A-DA-12': 'Create computational models of relationships among data elements',
    '3A-AP-13': 'Create prototypes that use algorithms to solve problems',
    '3A-AP-14': 'Use lists to simplify solutions instead of many simple variables',
    '3A-AP-15': 'Justify the choice of control structures and discuss tradeoffs',
    '3A-AP-16': 'Develop artifacts that use events to start instructions',
    '3A-AP-17': 'Decompose problems using procedures, modules and/or objects',
    '3A-AP-18': 'Build artifacts from procedures, data+procedures, or interrelated programs',
    '3A-AP-19': 'Design and develop programs for broad audiences using user feedback',
    '3A-AP-20': 'Evaluate licenses that limit use of computational artifacts',
    '3A-AP-21': 'Evaluate and refine artifacts to make them more usable and accessible',
    '3A-AP-22': 'Work in team roles using collaborative tools',
    '3A-AP-23': 'Document design decisions in text, graphics, presentations or demonstrations',
    '3A-IC-24': 'Evaluate how computing affects personal, ethical, social, economic, cultural practices',
    '3A-IC-25': 'Test and refine artifacts to reduce bias and equity deficits',
    '3A-IC-26': 'Show how an algorithm applies to problems across disciplines',
    '3A-IC-27': 'Use collaboration tools to connect people across cultures and fields',
    '3A-IC-28': 'Explain effects of intellectual property laws on innovation',
    '3A-IC-29': 'Explain privacy concerns of automated data collection',
    '3B-CS-01': 'Categorize the roles of operating system software',
    '3B-CS-02': 'Illustrate how hardware implements logic, input and output',
    '3B-NI-03': 'Describe issues that affect network functionality',
    '3B-NI-04': 'Compare ways developers protect devices and information from unauthorized access',
    '3B-DA-05': 'Use data analysis tools to find patterns in data from complex systems',
    '3B-DA-06': 'Select data collection tools to build data sets that support a claim',
    '3B-DA-07': 'Evaluate how well models and simulations test and refine hypotheses',
    '3B-AP-08': 'Describe how artificial intelligence drives software and physical systems',
    '3B-AP-09': 'Implement an AI algorithm to play a game or solve a problem',
    '3B-AP-10': 'Use and adapt classic algorithms',
    '3B-AP-11': 'Evaluate algorithms for efficiency, correctness and clarity',
    '3B-AP-12': 'Compare and contrast fundamental data structures and their uses',
    '3B-AP-13': 'Illustrate the flow of execution of a recursive algorithm',
    '3B-AP-14': 'Construct solutions from student-created procedures, modules, objects',
    '3B-AP-15': 'Analyze a large problem and find generalizable patterns',
    '3B-AP-16': 'Demonstrate code reuse with libraries and APIs',
    '3B-AP-17': 'Plan and develop programs for broad audiences with a software development process',
    '3B-AP-18': 'Explain security issues that can compromise programs',
    '3B-AP-20': 'Use version control, IDEs and collaborative tools in a group project',
    '3B-AP-21': 'Develop test cases to verify a program meets its specification',
    '3B-AP-22': 'Modify an existing program to add functionality and discuss implications',
    '3B-AP-23': 'Evaluate key qualities of a program through code review',
  };

  // Minnesota 2022 Mathematics, CS-integrated benchmarks, grades 6-12: [code, short text, fit, note]. fit is 'yes' or 'partial' when a lesson
  // is tagged with the code and says how well; '' when no lesson is. (Codes read grade.strand.standard.benchmark; 9 is high school.)
  const MN = [
    ['6.1.1.2', 'Design and conduct investigations to gather data', '', ''],
    ['6.1.1.4', 'Create a visualization of a data set to answer a question', '', ''],
    ['6.1.2.3', 'Experimental probability from experiments where the theoretical probability is known; make predictions', 'yes', 'Simulations compared with the exact probability (dice, the birthday problem).'],
    ['6.2.3.1', 'Surface area of prisms, with justification by decomposition', '', ''],
    ['6.2.3.2', 'Volume of prisms, with justification by decomposition', '', ''],
    ['6.2.4.2', 'Decompose polygons into triangles to find the sum of interior angles', '', ''],
    ['7.1.1.5', 'Create a visualization of a data set that tells a story', '', ''],
    ['7.1.2.2', 'Approximate a probability from long-run frequency', 'yes', 'The lessons try it thousands of times and watch the share settle.'],
    ['7.1.2.4', 'Sample spaces for compound events by decomposing them', 'yes', 'Sample spaces of compound events (two dice, repeated throws, rooms of birthdays) built with the product rule.'],
    ['7.1.2.5', 'Design and use a simulation for compound events', 'yes', 'Simulations of dice, and of rooms of 23 birthdays (a compound event) checked against the exact answer.'],
    ['7.1.2.6', 'Probabilities of compound events by lists, tables, trees or simulation', 'partial', 'Simulation, and organized lists (a program lists all 36 outcomes of two dice); no tree diagrams.'],
    ['7.3.6.3', 'Evaluate algebraic expressions applying the order of operations', 'partial', 'Arithmetic expressions and precedence; not algebraic expressions with exponents and absolute value as such.'],
    ['8.1.1.4', 'Use the equation of a linear model; interpret the slope and intercepts', 'partial', 'Fits y = w x by minimizing squared error and reads the slope; no intercept, no bivariate data in context.'],
    ['8.1.1.5', 'Create data visualizations (tables, scatter plots) that support a claim', '', ''],
    ['8.1.1.6', 'Compare competing explanations for data trends; correlation versus causation', '', ''],
    ['8.3.6.9', 'Systems of linear equations in two variables', '', ''],
    ['8.3.7.2', 'Linear and non-linear visual patterns; the nth term', '', ''],
    ['8.3.7.5', 'How changing m or b changes the graph of f(x) = mx + b', '', ''],
    ['9.1.1.8', 'Inferences about a population from random samples, with simulated samples', '', ''],
    ['9.1.1.11', 'Statistical models with linear and exponential functions, including regression; judge fit', 'partial', 'Fitting a line and measuring its error; no residuals or correlation coefficient.'],
    ['9.1.1.15', 'Identify and explain misleading uses of data', 'partial', 'Accuracy misleads when labels are rare; not about distorted displays.'],
    ['9.1.2.2', 'Events as subsets; Venn diagrams; unions, intersections and complements', 'yes', 'Sets and Venn diagrams, then events as subsets of a sample space, with "or", "and" and "not" as union, intersection and complement.'],
    ['9.1.2.3', 'Conditional probability and independence', 'partial', 'Both defined and used with dice, with independence told apart from mutual exclusion; no two-way tables of data.'],
    ['9.2.3.4', 'Decomposition to find surface area and volume of solids', '', ''],
    ['9.2.4.5', 'if-then statements: inverse, converse and contrapositive', 'yes', 'Taught as implication, converse and contrapositive, with the theorem that an implication equals its contrapositive.'],
    ['9.2.4.6', 'Validity of a logical argument; counterexamples', 'yes', 'Counterexamples, and why checking cases is not proving.'],
    ['9.2.4.7', 'Construct logical arguments from definitions and theorems', 'yes', 'Proofs, including induction and a proof that Euclid’s algorithm is right.'],
    ['9.2.4.14', 'Sequences of transformations of geometric figures', '', ''],
    ['9.3.5.4', 'Matrices to represent and manipulate data', '', ''],
    ['9.3.7.1', 'Systems of equations and inequalities, exponential and quadratic functions', '', ''],
    ['9.3.7.4', 'Sequences expressed recursively and by an explicit formula', 'yes', 'Recursive definitions (Fibonacci, factorial, the costs of recursive programs) and arithmetic and geometric sequences with explicit formulas for their sums.'],
    ['9.3.7.8', 'Compound interest as a recursive formula', '', ''],
  ];

  // Pages of the site that are not courses and practise a standard without a lesson teaching it.
  const SUPPORT = [
    { name: 'Algorithms in motion', href: '#/algorithms', note: '31 demos: sorting, searching, paths, games, puzzles, emergence, geometry, backtracking, compression', codes: ['3B-AP-10', '3B-AP-11', '3A-IC-26'] },
    { name: 'Bot Arena', href: '#/arena', note: 'Tron bots in Python, Java, C++ and Scheme', codes: ['3B-AP-09', '3A-AP-13'] },
    { name: 'Where it is used', href: '#/real-world', note: '30 topics, 147 examples by field', codes: ['3A-IC-24', '3A-IC-26'] },
    { name: 'Code Lab', href: '#/lab', note: 'write, run and test code in four languages', codes: ['2-AP-17', '3A-AP-21'] },
  ];

  const CONCEPTS = { CS: 'Computing systems', NI: 'Networks and the Internet', DA: 'Data and analysis', AP: 'Algorithms and programming', IC: 'Impacts of computing' };
  const BANDS = { '2': 'Grades 6–8', '3A': 'Grades 9–10', '3B': 'Grades 11–12' };
  const CSTA_RE = /^(2|3A|3B)-(CS|NI|DA|AP|IC)-\d\d$/;
  const MN_RE = /^\d\.\d\.\d\.\d{1,2}$/;
  const kind = (code) => (CSTA_RE.test(code) ? 'csta' : MN_RE.test(code) ? 'mn' : '');
  const band = (code) => BANDS[code.split('-')[0]];
  const concept = (code) => CONCEPTS[code.split('-')[1]];
  const mnRow = (code) => MN.find((b) => b[0] === code);
  const textOf = (code) => (kind(code) === 'csta' ? CSTA[code] : (mnRow(code) || [])[1]);
  const known = (code) => (kind(code) === 'csta' ? !!CSTA[code] : kind(code) === 'mn' ? !!mnRow(code) : false);
  const framework = (code) => (kind(code) === 'csta' ? 'CSTA' : 'Minnesota math');

  // ---- from the lessons ---------------------------------------------------------------------------------------------------------------
  function lessonsOf(code, courses) {
    const out = [];
    for (const c of courses || window.COURSES || []) (c.lessons || []).forEach((l, i) => { if ((l.standards || []).includes(code)) out.push({ course: c, n: i + 1, lesson: l }); });
    return out;
  }
  const el = (...a) => window.__app.internal.el(...a);
  const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const lessonHref = (h) => '#/' + h.course.id + '/' + h.n;
  const lessonLabel = (h) => h.course.code + ' L' + h.n + ' ' + h.lesson.title;

  // The box under a lesson's summary: which standards the lesson addresses, as links to the standards page.
  function lessonBox(course, idx) {
    const codes = ((course.lessons[idx] || {}).standards || []).filter(known);
    if (!codes.length) return null;
    injectCSS();
    const csta = codes.filter((c) => kind(c) === 'csta'), mn = codes.filter((c) => kind(c) === 'mn');
    const count = [csta.length ? csta.length + ' CSTA' : '', mn.length ? mn.length + ' Minnesota' : ''].filter(Boolean).join(', ');
    const item = (c) => el('li', {}, el('a', { href: '#/standards/' + c }, el('b', {}, c)), ' ' + textOf(c), kind(c) === 'mn' && mnRow(c)[2] === 'partial' ? el('span', { class: 'std-partial' }, ' (in part)') : null);
    const group = (title, list) => (list.length ? [el('h3', {}, title), el('ul', {}, list.map(item))] : null);
    return el('details', { class: 'lesson-stds' },
      el('summary', {}, 'Standards: ' + count),
      group('CSTA K-12 CS Standards (2017)', csta),
      group('Minnesota mathematics standards (2022)', mn),
      el('p', { class: 'std-note' }, 'Aligned by the author from what this lesson teaches; not endorsed by the standards’ owners. ', el('a', { href: '#/standards' }, 'All standards')));
  }

  // ---- the page ------------------------------------------------------------------------------------------------------------------------
  const CSS = `
.std [hidden] { display: none !important; }
.std { max-width: 60rem; margin: 0 auto; padding: 2.5rem 1.5rem 4rem; }
.std h1 { font-size: 2.4rem; font-weight: 400; }
.std-intro { margin-top: 1rem; }
.std-intro p { margin: 0 0 0.8rem; }
.std-tools { margin: 1.8rem 0 0.5rem; padding: 1rem 0; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); font-family: var(--sans); }
.std-search { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 0.8rem; margin-bottom: 0.8rem; }
.std-search label { font-weight: 600; font-size: 0.95rem; }
.std-search input { flex: 1 1 14rem; min-width: 0; font: inherit; font-size: 1rem; padding: 0.4rem 0.6rem; border: 1px solid var(--rule); border-radius: 3px; background: var(--paper); color: var(--ink); }
.std-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0 0 0.7rem; padding: 0; border: 0; }
.std-chips legend { font-weight: 600; font-size: 0.95rem; margin-bottom: 0.4rem; padding: 0; }
.std-chip { font-family: var(--sans); font-size: 0.88rem; padding: 0.3rem 0.75rem; border: 1px solid var(--rule); border-radius: 999px; background: var(--paper); color: var(--ink-2); cursor: pointer; line-height: 1.3; }
.std-chip:hover { color: var(--ink); border-color: var(--ink-2); }
.std-chip[aria-pressed="true"] { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }
.std-status { margin: 0.4rem 0 0; font-size: 0.9rem; color: var(--ink-3); font-family: var(--sans); }
.std-group { margin-top: 2.2rem; }
.std-group h2 { font-size: 1.5rem; margin-bottom: 0.6rem; }
.std-list { list-style: none; margin: 0; padding: 0; }
.std-item { border-top: 1px solid var(--rule-2); padding: 0.7rem 0; scroll-margin-top: 1rem; display: grid; grid-template-columns: 6.5rem 1fr; gap: 0.2rem 1rem; }
.std-item:target { background: var(--paper-2); }
.std-code { font-family: var(--mono, monospace); font-weight: 600; font-size: 0.95rem; padding-top: 0.15rem; }
.std-text { margin: 0; }
.std-meta { font-family: var(--sans); font-size: 0.85rem; color: var(--ink-3); margin: 0.15rem 0 0; }
.std-lessons { list-style: none; margin: 0.4rem 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0.35rem 0.5rem; font-family: var(--sans); font-size: 0.9rem; grid-column: 2; }
.std-lessons a { display: inline-block; padding: 0.15rem 0.5rem; border: 1px solid var(--rule); border-radius: 3px; text-decoration: none; color: var(--link); background: var(--paper-2); }
.std-lessons a:hover { border-color: var(--link); }
.std-none { font-family: var(--sans); font-size: 0.9rem; color: var(--ink-3); grid-column: 2; margin: 0.3rem 0 0; }
.std-fit { font-family: var(--sans); font-size: 0.88rem; color: var(--ink-2); grid-column: 2; margin: 0.3rem 0 0; }
.std-partial { font-family: var(--sans); font-size: 0.85rem; color: var(--ink-3); }
.std-empty { font-family: var(--sans); color: var(--ink-2); margin-top: 2rem; }
.lesson-stds { font-family: var(--sans); font-size: 0.92rem; margin: 0.9rem 0 0; color: var(--ink-2); }
.lesson-stds summary { cursor: pointer; font-weight: 600; }
.lesson-stds h3 { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-3); margin: 0.8rem 0 0.3rem; }
.lesson-stds ul { margin: 0; padding-left: 1.2rem; }
.lesson-stds li { margin-bottom: 0.2rem; }
.lesson-stds .std-note { color: var(--ink-3); font-size: 0.85rem; margin: 0.7rem 0 0; }
@media (max-width: 40rem) {
  .std { padding: 1.5rem 1rem 3rem; }
  .std h1 { font-size: 1.9rem; }
  .std-item { grid-template-columns: 1fr; }
  .std-lessons, .std-none, .std-fit { grid-column: 1; }
}`;
  function injectCSS() {
    if (document.getElementById('standards-css')) return;
    const s = document.createElement('style'); s.id = 'standards-css'; s.textContent = CSS; document.head.appendChild(s);
  }

  function page(sub) {
    injectCSS();
    const courses = window.COURSES || [];
    const state = { fw: kind(sub || '') === 'mn' ? 'mn' : 'csta', band: '', show: '', q: '' };
    const main = el('main', { class: 'std' });
    const status = el('p', { class: 'std-status', role: 'status', 'aria-live': 'polite' });
    const empty = el('p', { class: 'std-empty', hidden: 'hidden' }, 'Nothing matches. Try fewer words, or choose All.');

    const entry = (code, extra) => {
      const hits = lessonsOf(code, courses);
      const sup = SUPPORT.filter((s) => s.codes.includes(code));
      const li = el('li', { class: 'std-item', id: 'std-' + code });
      li.append(el('span', { class: 'std-code' }, code), el('p', { class: 'std-text' }, textOf(code)));
      if (extra) li.append(el('p', { class: 'std-fit' }, extra));
      if (hits.length) li.append(el('ul', { class: 'std-lessons', 'aria-label': 'Lessons' }, hits.map((h) => el('li', {}, el('a', { href: lessonHref(h), title: h.course.title }, lessonLabel(h))))));
      if (sup.length) li.append(el('ul', { class: 'std-lessons', 'aria-label': 'Also practised on' }, sup.map((s) => el('li', {}, el('a', { href: s.href, title: s.note }, 'Also: ' + s.name)))));
      if (!hits.length && !sup.length) li.append(el('p', { class: 'std-none' }, 'No lesson addresses this yet.'));
      li.dataset.covered = hits.length ? 'yes' : sup.length ? 'support' : 'no';
      li.dataset.text = norm(code + ' ' + textOf(code) + ' ' + (extra || '') + ' ' + hits.map(lessonLabel).join(' '));
      li.dataset.band = kind(code) === 'csta' ? code.split('-')[0] : '';
      return li;
    };

    const groups = [];   // { fw, sec, items }
    for (const key of Object.keys(CONCEPTS)) {
      const codes = Object.keys(CSTA).filter((c) => c.split('-')[1] === key);
      const items = codes.map((c) => entry(c));
      const sec = el('section', { class: 'std-group', 'aria-labelledby': 'std-g-' + key }, el('h2', { id: 'std-g-' + key }, CONCEPTS[key]), el('ol', { class: 'std-list' }, items));
      groups.push({ fw: 'csta', sec, items });
    }
    const mnItems = MN.map((b) => entry(b[0], b[2] ? (b[2] === 'yes' ? 'Taught: ' : 'In part: ') + b[3] : ''));
    groups.push({ fw: 'mn', sec: el('section', { class: 'std-group', 'aria-labelledby': 'std-g-mn' }, el('h2', { id: 'std-g-mn' }, 'Minnesota mathematics benchmarks that are marked as computer science'), el('ol', { class: 'std-list' }, mnItems)), items: mnItems });

    const chip = (label, on, fn) => el('button', { type: 'button', class: 'std-chip', 'aria-pressed': on() ? 'true' : 'false', onclick: () => { fn(); apply(); } }, label);
    const chipRows = [];
    const row = (legend, opts, get, set, only) => {
      const btns = opts.map(([key, label]) => { const b = chip(label, () => get() === key, () => set(key)); b.dataset.key = key; return b; });
      const fs = el('fieldset', { class: 'std-chips' }, el('legend', {}, legend), btns);
      chipRows.push({ btns, get, only }); return fs;
    };
    const fwRow = row('Standards', [['csta', 'CSTA K-12 CS Standards'], ['mn', 'Minnesota mathematics']], () => state.fw, (k) => { state.fw = k; }, null);
    const bandRow = row('Grades', [['', 'All'], ['2', '6–8'], ['3A', '9–10'], ['3B', '11–12']], () => state.band, (k) => { state.band = k; }, 'csta');
    const showRow = row('Show', [['', 'All'], ['yes', 'With a lesson'], ['no', 'No lesson yet']], () => state.show, (k) => { state.show = k; }, null);
    const input = el('input', { type: 'search', id: 'std-q', autocomplete: 'off', spellcheck: 'false', placeholder: 'e.g. recursion, loops, probability, 3A-AP-17' });

    function apply() {
      const words = norm(state.q).split(/\s+/).filter(Boolean);
      for (const r of chipRows) { for (const b of r.btns) b.setAttribute('aria-pressed', b.dataset.key === r.get() ? 'true' : 'false'); if (r.only) r.btns[0].parentElement.hidden = r.only !== state.fw; }
      let shown = 0, total = 0;
      for (const g of groups) {
        let n = 0;
        for (const it of g.items) {
          const ok = g.fw === state.fw && (!state.band || it.dataset.band === state.band) && words.every((w) => it.dataset.text.includes(w)) &&
            (!state.show || (state.show === 'yes' ? it.dataset.covered !== 'no' : it.dataset.covered === 'no'));
          it.hidden = !ok; if (ok) n++;
        }
        g.sec.hidden = n === 0; if (g.fw === state.fw) { shown += n; total += g.items.length; }
      }
      empty.hidden = shown > 0;
      status.textContent = 'Showing ' + shown + ' of ' + total + ' standards.';
    }
    input.addEventListener('input', () => { state.q = input.value; apply(); });

    main.append(
      el('header', {},
        el('h1', {}, 'Standards'),
        el('p', { class: 'tagline' }, 'Which lessons address which learning standards.'),
        el('div', { class: 'prose std-intro' },
          el('p', {}, 'Two sets of standards are listed: the CSTA K-12 Computer Science Standards (2017), which many states and districts use, and the computer-science-integrated benchmarks in the 2022 Minnesota Academic Standards in Mathematics. Each lesson shows its standards under its summary; here you can start from a standard and find the lessons.'),
          el('p', {}, 'The author matched lessons to standards by what each lesson teaches. A lesson is listed when it teaches or practises the standard, not when it only mentions it; where a lesson covers only part of a benchmark, the entry says so. These are not endorsed by CSTA or the Minnesota Department of Education, and the standards below are short paraphrases. Check the exact wording at ',
            el('a', { href: 'https://csteachers.org/k12standards/', rel: 'noopener noreferrer' }, 'csteachers.org'), ' and at the ',
            el('a', { href: 'https://education.mn.gov/MDE/dse/stds/ComputerScience/', rel: 'noopener noreferrer' }, 'Minnesota Department of Education'), '.'))),
      el('div', { class: 'std-tools' }, el('div', { class: 'std-search' }, el('label', { for: 'std-q' }, 'Search'), input), fwRow, bandRow, showRow, status),
      empty, ...groups.map((g) => g.sec));
    apply();
    return main;
  }

  const STANDARDS = { page, lessonBox, lessonsOf, kind, known, textOf, framework, CSTA, MN, SUPPORT, CONCEPTS, band, concept };
  if (typeof window !== 'undefined') window.STANDARDS = STANDARDS;
  if (typeof module !== 'undefined') module.exports = { CSTA, MN, SUPPORT, CONCEPTS, kind, known, textOf, band, concept, CSTA_RE, MN_RE };
})();
