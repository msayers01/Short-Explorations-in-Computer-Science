/* About and credits (#/about).

   Who made the site, what it keeps about a visitor, what people may do with it (the licence), and credit for
   everything in it that someone else made: the Ojibwe words and their sources, the book the Lisp course follows,
   the software that runs inside the page (with each package's full licence text, which MIT asks every copy to
   carry), and the typefaces.

   What only the author can decide lives in src/site.js: SITE.about (his own words), SITE.licence (the code and content
   licences) and SITE.sourceUrl (the repository). The third-party list and licence
   texts are written into window.BUILD by build.js from the installed packages, so they cannot drift from what
   is actually bundled. Exposed as window.ABOUT { page() }. */
(function () {
  'use strict';
  const h = (...a) => window.__app.internal.el(...a);
  const SITE = window.SITE;
  const ext = (href, text) => h('a', { href, target: '_blank', rel: 'noopener' }, text);

  const OPD = 'https://ojibwe.lib.umn.edu';
  const SICP = 'https://mitp-content-server.mit.edu/books/content/sectbyfn/books_pres_0/6515/sicp.zip/index.html';
  const CC_BY_SA_4 = 'https://creativecommons.org/licenses/by-sa/4.0/';
  const CC_BY_NC_SA_3 = 'https://creativecommons.org/licenses/by-nc-sa/3.0/';
  const OFL = 'https://openfontlicense.org/';

  function section(id, title, ...body) { return h('section', { class: 'ab-sec', id }, h('h2', {}, title), ...body); }

  function licenceSection() {
    const L = SITE.licence;
    const ojNote = h('p', {}, 'One part always has its own terms: the Ojibwe words and their notes (', h('code', {}, 'src/ojibwe.js'),
      ') are adapted from the Ojibwe People\u2019s Dictionary and are shared under ', ext(CC_BY_NC_SA_3, 'CC BY-NC-SA 3.0'),
      ', as the dictionary requires: credit the dictionary, do not use them commercially, and share any changes under the same licence.');
    const sicpNote = h('p', {}, 'The examples, exercises and project that the Lisp course adapts from ', ext(SICP, h('em', {}, 'Structure and Interpretation of Computer Programs')),
      ' are shared under ', ext(CC_BY_SA_4, 'CC BY-SA 4.0'), ', as the book\u2019s licence requires for adaptations: credit the book and share any changes under the same licence.');
    if (!L || !L.code || !L.content) {
      return section('ab-licence', 'Using and sharing these courses',
        h('p', {}, 'The site is free to use for learning and teaching, in any classroom or at home, with nothing to sign up for. Teachers are welcome to use every lesson, exercise and tool with their students.'),
        h('p', {}, 'Terms for copying, changing and republishing the courses themselves have not been set yet. Until they are, please ask Michael Sayers before putting a copy or an adapted version online.'),
        ojNote, sicpNote);
    }
    return section('ab-licence', 'Using and sharing these courses',
      h('p', {}, 'The site is free to use for learning and teaching. You may also copy it, change it and share it, on these terms:'),
      h('div', { class: 'table-wrap' }, h('table', { class: 'ab-table' },
        h('thead', {}, h('tr', {}, h('th', {}, 'Part of the site'), h('th', {}, 'Licence'))),
        h('tbody', {},
          h('tr', {}, h('td', {}, 'The lessons, exercises and the guide for teachers'), h('td', {}, ext(L.content.url, L.content.name))),
          h('tr', {}, h('td', {}, 'The program code (the Code Lab, interactive figures, teacher tools, Scheme interpreter and the rest)'), h('td', {}, ext(L.code.url, L.code.name))),
          h('tr', {}, h('td', {}, 'The Ojibwe words and their notes'), h('td', {}, ext(CC_BY_NC_SA_3, 'CC BY-NC-SA 3.0')))))),
      L.note ? h('p', {}, L.note) : null,
      h('p', {}, 'Credit as: \u201c', SITE.name, ', by Michael Sayers\u201d, with a link to the site or its source.'),
      ojNote, sicpNote);
  }

  function softwareList() {
    const tp = (window.BUILD && window.BUILD.thirdParty) || [];
    return [
      h('p', {}, 'Programming languages run inside this one page, with nothing installed. These are the parts other people wrote; each is used under the licence named beside it, whose full text is below, as it asks.'),
      h('ul', { class: 'ab-list' }, tp.map(t => h('li', {},
        ext(t.url, t.name), ' ', h('span', { class: 'ab-meta' }, t.version + ' \u00b7 ' + t.licence), ': ', t.role, '.',
        t.changes ? h('span', { class: 'ab-meta ab-changes' }, ' ' + t.changes) : null))),
      h('p', {}, 'Written for this site: the Scheme interpreter, the substitution-model stepper, the C++ memory stepper, the QR code encoder, the code editor, the Code Lab, the teacher tools, the portfolio, classroom mode and the interactive figures.'),
      tp.length ? h('details', { class: 'ab-licences' },
        h('summary', {}, 'Full licence texts of the software above'),
        tp.map(t => h('div', { class: 'ab-lic' }, h('h4', {}, t.name + ' ' + t.version), h('pre', {}, t.text)))) : null
    ];
  }

  // Every picture in the lessons, with who made it, its licence and where it came from (build.js reads img/*.json into BUILD.images).
  function pictureList() {
    const imgs = Object.values((window.BUILD && window.BUILD.images) || {}).sort((a, b) => a.title.localeCompare(b.title));
    if (!imgs.length) return [];
    return [h('h3', { id: 'ab-pictures' }, 'Pictures'),
      h('p', {}, 'The photographs and drawings in the lessons are in the public domain or shared under Creative Commons licences that allow reuse with credit. They were resized for the web and otherwise not changed. Each one links to its page on Wikimedia Commons, which has its full description and licence.'),
      h('details', { class: 'ab-licences' }, h('summary', {}, imgs.length + ' pictures and their credits'),
        h('ul', { class: 'ab-list' }, imgs.map((m) => h('li', {}, ext(m.source, m.title), m.date ? ' (' + m.date + ')' : '', ': ',
          (m.author && !/^unknown/i.test(m.author) ? m.author : m.credit || 'unknown author'), ' \u00b7 ', m.licenseUrl ? ext(m.licenseUrl, m.license) : m.license)))),
      ...logoList()];
  }
  // The languages' logos beside the courses and in the Code Lab: each is its owner's trademark, used only to name the language.
  function logoList() {
    const icons = Object.values((window.BUILD && window.BUILD.icons) || {});
    if (!icons.length) return [];
    return [h('p', {}, 'The logos beside the courses and in the Code Lab name the languages; each is a trademark of its owner, and none of them endorses this site. ',
      icons.map((m, i) => [i ? '; ' : '', ext(m.source, m.title), ': ', (m.author && !/^unknown/i.test(m.author) ? m.author : m.credit || 'unknown'), ', ', m.licenseUrl ? ext(m.licenseUrl, m.license) : m.license]), '.')];
  }

  function page() {
    const main = h('main', { class: 'about' });
    const B = window.BUILD || {};
    main.append(...[
      h('header', { class: 'ab-hero' },
        h('p', { class: 'g-kicker' }, SITE.name),
        h('h1', {}, 'About this site'),
        h('nav', { class: 'g-toc', 'aria-label': 'Contents' },
          h('a', { href: '#/about', onclick: jump('ab-privacy') }, 'What it keeps about you'),
          h('a', { href: '#/about', onclick: jump('ab-licence') }, 'Using and sharing'),
          h('a', { href: '#/about', onclick: jump('ab-credits') }, 'Thank you: credits'))),
      SITE.about ? h('div', { class: 'ab-intro prose', html: SITE.about }) : null,
      SITE.contact && SITE.contact.length ? h('p', { class: 'contact' }, SITE.contact.map((c, i) => [i ? ' \u00b7 ' : null, c.href ? h('a', { href: c.href }, c.label) : h('span', {}, c.label)])) : null,

      section('ab-privacy', 'What the site keeps about you',
        h('p', {}, 'Nothing you do leaves your computer unless you send it yourself. There are no accounts, no tracking and no advertising. The web host sees that the page was downloaded, as with any website, but the page itself never sends anything back.'),
        h('p', {}, 'What you do is saved in this browser only: your progress and your code in the lessons, which quick checks you answered and when they come back for review, your Code Lab files, your portfolio settings, a teacher\u2019s assignments and grade book, and display choices such as light or dark. Another computer, or another browser on this one, starts empty, unless you use \u201cSave my work to a file\u201d on the home page and restore the file there (the file holds your code and your name, so keep it private). \u201cReset my progress\u201d on the home page clears the lessons; clearing the browser\u2019s site data clears everything.'),
        h('p', {}, 'The links the site makes (a shared program, an assignment, a submission, a portfolio) carry their contents inside the link itself. Anyone who has a link can read what is in it, so share them the way you would share the work itself.'),
        h('p', {}, 'The page makes no requests to any other site: the typefaces are part of the page itself, so no one else, not even a font provider, learns that you opened it. The one thing the page ever fetches is the real C++ compiler (about ' + ((window.BUILD && window.BUILD.clang && window.BUILD.clang.mb) || 28) + ' MB), and only from this same site, only after you agree, and only when you choose Full C++ or the Modern C++ course. It is stored by your browser so it is downloaded once. The pictures in the lessons also come from this same site, one at a time as you scroll to them; the people and archives credited below do not see that you looked.')),

      licenceSection(),

      section('ab-credits', window.OJIBWE ? window.OJIBWE.label('thanks') : 'Thank you',
        h('p', {}, 'Credit for the work of others that this site is built on.'),
        h('h3', {}, 'Ojibwemowin'),
        h('p', {}, 'The Ojibwe words on the site, in the interface, the clock and the lessons\u2019 examples, are copied exactly from the ', ext(OPD, 'Ojibwe People\u2019s Dictionary'),
          ' (University of Minnesota, Department of American Indian Studies; ', ext(CC_BY_NC_SA_3, 'CC BY-NC-SA 3.0'),
          '). ',
          h('a', { href: '#/ojibwe' }, 'Every word and its source'), ' is listed on its own page. The dictionary does not endorse this site.'),
        h('h3', {}, 'Books'),
        h('p', {}, 'The Lisp course follows parts of Harold Abelson and Gerald Jay Sussman with Julie Sussman, ', ext(SICP, h('em', {}, 'Structure and Interpretation of Computer Programs')),
          ', 2nd edition (MIT Press, 1996), and adapts several of its examples, exercises and puzzles, and the symbolic-differentiation project; each is marked in the lesson with the section of the book it comes from. The book is licensed under ', ext(CC_BY_SA_4, 'CC BY-SA 4.0'), ' by the MIT Press, and the adapted material is shared under the same licence. The lessons rewrite the book\u2019s material for high-school students, with new explanations, examples and exercises around it.'),
        h('p', {}, 'The C++ course\u2019s account of how often professional programmers get binary search wrong is from Jon Bentley\u2019s ', h('em', {}, 'Programming Pearls'), ' (Addison-Wesley).'),
        ...pictureList(),
        h('h3', {}, 'Software'),
        ...softwareList(),
        h('h3', {}, 'Typefaces'),
        h('p', {}, 'Newsreader (Production Type), Source Sans 3 (Adobe) and IBM Plex Mono (IBM), built into the page under the ', ext(OFL, 'SIL Open Font License'), '.'),
        h('h3', {}, 'Names'),
        h('p', {}, 'Hour of Code is a trademark of Code.org, and Python of the Python Software Foundation. QR Code is a registered trademark of DENSO WAVE INCORPORATED. None of these organisations is connected with this site.')),

      h('footer', { class: 'ab-foot' },
        h('p', {}, SITE.footer),
        h('p', { class: 'ab-meta' },
          B.date ? 'This copy was built on ' + B.date + '. ' : '',
          SITE.sourceUrl ? ['The source code is at ', ext(SITE.sourceUrl, SITE.sourceUrl.replace(/^https?:\/\//, '')), '. '] : null,
          'The whole site is a single file, index.html, which also works opened from a computer\u2019s disk or a USB stick.'))
    ].filter(Boolean));
    return main;
  }
  // In-page links without touching the hash (the hash is the route).
  function jump(id) { return (e) => { e.preventDefault(); const t = document.getElementById(id); if (t && t.scrollIntoView) { t.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); } }; }

  window.ABOUT = { page };
})();
