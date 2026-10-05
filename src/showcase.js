/* Student Showcase: the #/showcase page (a gallery) and #/showcase/<id> (one project). (c) 2026 Michael Sayers, licensed MIT.
   The projects are folders under showcase/ that scripts/showcase.js checked and build.js put in window.BUILD.showcase:
   [{ id, title, name, grade, note, date, lang, main, stdin, files: [{ name, code }] }]. Everything here is text from the build, shown as
   text (el() children, highlight() for code, which escapes), never as markup. A project's code runs the way a lesson's example does,
   in the same sandboxes (runCell), and nothing is stored or sent. */
(function () {
  const LANG_NAMES = { python: 'Python', java: 'Java', cpp: 'C++', c: 'C', scheme: 'Scheme' };
  const RUNNABLE = ['python', 'java', 'cpp', 'scheme'];   // C runs in the Code Lab (it needs the downloaded compiler), so a C project offers the Lab only
  const projects = () => (window.BUILD && Array.isArray(window.BUILD.showcase) ? window.BUILD.showcase : []);
  const I = () => window.__app.internal;
  const gradeText = (g) => (g ? 'Grade' + (g.includes('-') ? 's ' : ' ') + g.replace('-', '–') : '');
  const dateText = (d) => { if (!d) return ''; const [y, m] = d.split('-'); return m ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][+m - 1] + ' ' + y : y; };
  const byline = (p) => ['by ' + p.name, gradeText(p.grade), LANG_NAMES[p.lang] || p.lang, dateText(p.date)].filter(Boolean).join(' · ');
  const extOf = (n) => (n.match(/\.(\w+)$/) || [, ''])[1].toLowerCase();
  const isCode = (f, p) => !['txt', 'md'].includes(extOf(f.name));

  function gallery(el) {
    const list = projects();
    return el('main', { class: 'home showcase' },
      el('h1', {}, 'Student Showcase'),
      list.length ? el('p', { class: 'showcase-lede' }, 'Projects made by students who learned with these courses, shared with their permission. Each one is real code: read it, run it, and open a copy in the Code Lab to change it.') : null,
      list.length
        ? el('ul', { class: 'showcase-grid' }, list.map((p) => el('li', {}, el('a', { class: 'showcase-card', href: '#/showcase/' + p.id },
          el('span', { class: 'sc-lang' }, LANG_NAMES[p.lang] || p.lang),
          el('span', { class: 'sc-title' }, p.title),
          el('span', { class: 'sc-by' }, 'by ' + p.name + (p.grade ? ' \u00b7 ' + gradeText(p.grade) : '')),
          p.note ? el('span', { class: 'sc-note' }, p.note.length > 150 ? p.note.slice(0, 147).replace(/\s+\S*$/, '') + '\u2026' : p.note) : null))))
        : el('p', { class: 'showcase-empty' }, 'Nothing here yet.'));
  }

  function project(el, p) {
    const { highlight, outputPanel } = I();
    let cur = 0;
    const out = outputPanel();
    const code = el('code', {});
    const view = el('pre', { class: 'code showcase-code', tabindex: '0', 'aria-label': 'Project code' }, code);
    const tabs = el('div', { class: 'showcase-tabs', role: 'tablist', 'aria-label': 'Files' });
    const show = (i) => {
      cur = i;
      const f = p.files[i];
      if (isCode(f, p)) code.innerHTML = highlight(f.code, { py: 'python', java: 'java', cpp: 'cpp', cc: 'cpp', cxx: 'cpp', hpp: 'cpp', h: 'cpp', c: 'c', scm: 'scheme', ss: 'scheme', lisp: 'scheme' }[extOf(f.name)] || p.lang);
      else code.textContent = f.code;
      [...tabs.children].forEach((b, k) => { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); b.classList.toggle('on', k === i); });
    };
    p.files.forEach((f, i) => tabs.append(el('button', { class: 'showcase-tab', type: 'button', role: 'tab', onclick: () => show(i) }, f.name)));
    const turtleMount = p.lang === 'python' && p.files.some((f) => /\b(import\s+turtle|from\s+turtle\s+import)\b/.test(f.code)) ? el('div', { class: 'play-turtle', hidden: '' }) : null;
    // the program that runs: the main file, or for Java every .java file joined (the main file first), as the Code Lab does
    const source = () => {
      const main = p.files.find((f) => f.name === p.main) || p.files[0];
      if (p.lang === 'java' && window.JPROJ) {
        const js = p.files.filter((f) => /\.java$/.test(f.name));
        if (js.length > 1) { const j = window.JPROJ.join(js.map((f) => ({ name: f.name.replace(/^.*\//, ''), code: f.code })), { dedupe: true }); if (j.src) return j.src; }
      }
      return main.code;
    };
    const runBtn = RUNNABLE.includes(p.lang) && window.__app.runCell
      ? el('button', { class: 'btn primary', type: 'button', onclick: () => window.__app.runCell(p.lang, source(), out, { stdin: p.stdin == null ? undefined : p.stdin, turtleMount }) }, 'Run')
      : null;
    const labBtn = window.LAB
      ? el('button', { class: 'btn quiet', type: 'button', title: 'Put a copy of the main file in the Code Lab', onclick: () => window.LAB.openCode({ lang: p.lang, code: (p.files.find((f) => f.name === p.main) || p.files[0]).code, name: p.id }) }, 'Open a copy in the Code Lab')
      : null;
    show(0);
    return el('main', { class: 'home showcase' },
      el('p', { class: 'showcase-back' }, el('a', { href: '#/showcase' }, '← Student Showcase')),
      el('h1', {}, p.title),
      el('p', { class: 'showcase-by' }, byline(p)),
      p.note ? el('p', { class: 'showcase-note' }, p.note) : null,
      p.files.length > 1 ? tabs : null,
      view,
      el('div', { class: 'toolbar' }, runBtn, labBtn, p.stdin != null ? el('span', { class: 'stdin-note' }, 'input provided: ', el('code', {}, JSON.stringify(p.stdin))) : null,
        p.lang === 'c' ? el('span', { class: 'stdin-note' }, 'C programs run in the Code Lab.') : null),
      turtleMount, out.el);
  }

  function page(id) {
    const el = I().el;
    const p = id ? projects().find((x) => x.id === id) : null;
    if (id && !p) document.title = 'Student Showcase — ' + SITE.name;
    else document.title = (p ? p.title + ' — ' : '') + 'Student Showcase — ' + SITE.name;
    return p ? project(el, p) : gallery(el);
  }

  window.SHOWCASE = { page, count: () => projects().length };
})();
