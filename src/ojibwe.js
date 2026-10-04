/* Ojibwe words in the interface, the clock on the home page, and the page that lists every word with its source
   (#/ojibwe).

   Rules for editing this file:
   1. Never make up, adapt, inflect or machine-translate an Ojibwe word. Every word is copied exactly from the
      Ojibwe People's Dictionary (ojibwe.lib.umn.edu), which records the Central Southwestern Ojibwe of Minnesota
      and Wisconsin in the double-vowel spelling, and the entry's address is kept beside it. Only citation forms
      and forms an entry itself lists (a plural, an imperative) are used. Spelling is copied letter for letter; the
      glottal stop is the plain apostrophe ', never a curly quote. The only change is a capital first letter when
      the word starts a label or a sentence.
   2. A word is shown only where the dictionary's meaning matches what the interface means, always with its
      English beside it. Every other label stays in English; a label is never half-translated.
   3. Words supplied by a fluent speaker or an Ojibwe language program replace entries here; set srcName to who
      supplied the word, with the date.
   4. Dictionary entries are copyrighted by The Ojibwe People's Dictionary and licensed CC BY-NC-SA 3.0
      (https://ojibwe.lib.umn.edu/content/copyright-usage-restrictions). The attribution on #/ojibwe must stay,
      the use must stay non-commercial, and this file, an adaptation of their entries, is shared under the same
      licence.

   Exposed as window.OJIBWE { label(key, suffix), text(key), page(), clock(opts), timeWords(date),
   clockProgram(day, hour), WORDS, LESSON_WORDS, CANDIDATES, DAYS, HOURS, PARTS }. */
(function () {
  'use strict';
  const OPD = 'https://ojibwe.lib.umn.edu';
  const OPD_NAME = 'Ojibwe People\u2019s Dictionary';

  // Words shown on the site. en = the English the interface shows in the same place.
  const WORDS = {
    greeting: { oj: 'Boozhoo', en: 'Hello', pos: 'pc interj (particle, interjection)', gloss: 'hello!; greetings!',
      src: OPD + '/main-entry/boozhoo-pc-interj', srcName: OPD_NAME, where: 'Home page, above the site name.' },
    language: { oj: 'Ojibwemowin', en: 'the Ojibwe language', pos: 'ni (inanimate noun)', gloss: 'the Ojibwe language',
      src: OPD + '/main-entry/ojibwemowin-ni', srcName: OPD_NAME, where: 'Title of the page that lists the Ojibwe words and their sources.' },
    lesson: { oj: 'Gikinoo\'amaagoowin', en: 'Lesson', pos: 'ni (inanimate noun), singular', gloss: 'education or teaching (that one receives); a lesson',
      src: OPD + '/main-entry/gikinoo-amaagoowin-ni', srcName: OPD_NAME, where: 'Above each lesson title (\u201cLesson 3\u201d) and in the lesson menu on phones.' },
    lessons: { oj: 'Gikinoo\'amaagoowinan', en: 'Lessons', pos: 'ni (inanimate noun), plural as listed in the entry', gloss: 'education or teaching (that one receives); a lesson',
      src: OPD + '/main-entry/gikinoo-amaagoowin-ni', srcName: OPD_NAME, where: 'Heading of the list of lessons on each course page.' },
    tryIt: { oj: 'Gojitoon', en: 'Try it', pos: 'vti2 (verb), the imperative listed in the entry (said to one person)', gloss: 'try to do or make it, try it out',
      src: OPD + '/main-entry/gojitoon', srcName: OPD_NAME, where: 'Label of every runnable example in the lessons.' },
    check: { oj: 'Gojibizotoon', en: 'Check answer', pos: 'vti2 (verb), the imperative listed in the entry (said to one person)', gloss: 'run a test on it (machine), test drive it',
      src: OPD + '/main-entry/gojibizotoon-vti2', srcName: OPD_NAME, where: 'The button on every exercise that runs the tests on the student\u2019s answer.' },
    thanks: { oj: 'Miigwech', en: 'Thank you', pos: 'pc disc (particle, discourse)', gloss: 'thanks!',
      src: OPD + '/main-entry/miigwech-pc-disc', srcName: OPD_NAME, where: 'Heading of the credits on the About page.' }
  };

  /* ---------- the day and the hour ----------
     Each entry is an intransitive verb the dictionary lists whole, meaning "it is ...": niizho-giizhigad is
     "it is Tuesday", ningo-diba'iganed "it is one o'clock". The clock shows them as separate sentences and never
     joins or changes them. Where the dictionary gives more than one form, `oj` is the one used and `alt` lists
     the others (shown on #/ojibwe). Hours use the [S] (southern) forms. The dictionary has no "twelve o'clock"
     in these forms, so twelve is naawakwe (noon) or aabitaa-dibikad (midnight); it has no pattern for minutes,
     which stay as digits. */
  const E = (slug) => OPD + '/main-entry/' + slug;
  const DAYS = [   // index = Date.getDay(): 0 is Sunday
    { oj: 'Anama\'e-giizhigad', en: 'It is Sunday', src: E('anama-e-giizhigad-vii') },
    { oj: 'Ishkwaa-anama\'e-giizhigad', en: 'It is Monday', src: E('ishkwaa-anama-e-giizhigad-vii') },
    { oj: 'Niizho-giizhigad', en: 'It is Tuesday', src: E('niizho-giizhigad-vii') },
    { oj: 'Aabitoose', en: 'It is Wednesday', src: E('aabitoose-vii'), alt: [{ oj: 'aabitawise', src: E('aabitawise-vii') }] },
    { oj: 'Niiyo-giizhigad', en: 'It is Thursday', src: E('niiyo-giizhigad-vii'), alt: [{ oj: 'niiwo-giizhigad', src: E('niiwo-giizhigad-vii') }] },
    { oj: 'Naano-giizhigad', en: 'It is Friday', src: E('naano-giizhigad-vii') },
    { oj: 'Giziibiigisaginige-giizhigad', en: 'It is Saturday', src: E('giziibiigisaginige-giizhigad-vii'), alt: [{ oj: 'giziibiigisaginigewi-giizhigad', note: '[C]', src: E('giziibiigisaginigewi-giizhigad-vii') }, { oj: 'ishkwaajanokii-giizhigad', src: E('ishkwaajanokii-giizhigad-vii') }] }
  ];
  const HOURS = [null,   // index = hour on a 12-hour clock
    { oj: 'Ningo-diba\'iganed', en: 'It is one o\u2019clock', src: E('ningo-diba-iganed-vii'), alt: [{ oj: 'ingo-diba\'iganed', src: E('ingo-diba-iganed-vii') }] },
    { oj: 'Niizho-diba\'iganed', en: 'It is two o\u2019clock', src: E('niizho-diba-iganed-vii') },
    { oj: 'Niso-diba\'iganed', en: 'It is three o\u2019clock', src: E('niso-diba-iganed-vii') },
    { oj: 'Niiyo-diba\'iganed', en: 'It is four o\u2019clock', src: E('niiyo-diba-iganed-vii'), alt: [{ oj: 'niiwo-diba\'iganed', src: E('niiwo-diba-iganed-vii') }] },
    { oj: 'Naano-diba\'iganed', en: 'It is five o\u2019clock', src: E('naano-diba-iganed-vii') },
    { oj: 'Ningodwaaso-diba\'iganed', en: 'It is six o\u2019clock', src: E('ningodwaaso-diba-iganed-vii'), alt: [{ oj: 'ingodwaaso-diba\'iganed', src: E('ingodwaaso-diba-iganed-vii') }] },
    { oj: 'Niizhwaaso-diba\'iganed', en: 'It is seven o\u2019clock', src: E('niizhwaaso-diba-iganed-vii') },
    { oj: 'Nishwaaso-diba\'iganed', en: 'It is eight o\u2019clock', src: E('nishwaaso-diba-iganed-vii'), alt: [{ oj: 'ishwaaso-diba\'iganed', src: E('ishwaaso-diba-iganed-vii') }] },
    { oj: 'Zhaangaso-diba\'iganed', en: 'It is nine o\u2019clock', src: E('zhaangaso-diba-iganed-vii') },
    { oj: 'Midaaso-diba\'iganed', en: 'It is ten o\u2019clock', src: E('midaaso-diba-iganed-vii') },
    { oj: 'Ashi-bezhigo-diba\'iganed', en: 'It is eleven o\u2019clock', src: E('ashi-bezhigo-diba-iganed-vii') }
  ];
  const PARTS = {
    afterMidnight: { oj: 'Ishkwaa-aabitaa-dibikad', en: 'It is after midnight', hours: '1 to 5 a.m.', src: OPD + '/search?commit=Search&q=dibikad&type=ojibwe&utf8=%E2%9C%93' },
    morning: { oj: 'Gigizhebaawagad', en: 'It is morning', hours: '5 a.m. to noon', src: OPD + '/browse/ojibwe/g?page=14' },
    noon: { oj: 'Naawakwe', en: 'It is noon', hours: '12 noon to 1 p.m.', src: OPD + '/browse/ojibwe/n?page=9' },
    afternoon: { oj: 'Ishkwaa-naawakwe', en: 'It is afternoon', hours: '1 to 6 p.m.', src: OPD + '/browse/english' },
    evening: { oj: 'Onaagoshin', en: 'It is evening', hours: '6 to 10 p.m.', src: E('onaagoshin-vii') },
    night: { oj: 'Dibikad', en: 'It is night', hours: '10 p.m. to midnight', src: OPD + '/search?commit=Search&q=dibikad&type=ojibwe&utf8=%E2%9C%93' },
    midnight: { oj: 'Aabitaa-dibikad', en: 'It is midnight', hours: 'midnight to 1 a.m.', src: E('aabitaa-dibikad-vii') }
  };
  // The sentences for a moment: the day, then the part of the day, then the hour that has begun
  // (at 1:17 the hour is "one o'clock"; the digits beside it give the minutes).
  function timeWords(d) {
    const H = d.getHours(), out = [DAYS[d.getDay()]];
    if (H === 0) out.push(PARTS.midnight);
    else if (H === 12) out.push(PARTS.noon);
    else out.push(H < 5 ? PARTS.afterMidnight : H < 12 ? PARTS.morning : H < 18 ? PARTS.afternoon : H < 22 ? PARTS.evening : PARTS.night, HOURS[H % 12]);
    return out;
  }
  // The same logic as a Python program, for the Code Lab (built from the lists above, so the words always match).
  function clockProgram(day, hour) {
    const pad = (s, n) => s + ' '.repeat(Math.max(1, n - s.length));
    const line = (k, w) => '    ' + pad(k + ': "' + w.oj + '",', 38) + '# ' + w.en;
    return '# The day and the hour in Ojibwe, as on the home page of this site.\n'
      + '# Every word comes from the Ojibwe People\'s Dictionary (ojibwe.lib.umn.edu),\n'
      + '# used under the Creative Commons BY-NC-SA 3.0 licence.\n'
      + '# Each word is a whole sentence: "Niizho-giizhigad" means "It is Tuesday".\n\n'
      + 'days = {\n' + DAYS.map((w, i) => line(String(i), w)).join('\n') + '\n}\n\n'
      + 'hours = {\n' + HOURS.slice(1).map((w, i) => line(String(i + 1), w)).join('\n') + '\n}\n\n'
      + 'day = ' + day + '      # 0 is Sunday, 1 is Monday, 2 is Tuesday ... try 0 to 6\n'
      + 'hour = ' + hour + '    # a 24-hour clock: 0 is midnight, 13 is one in the afternoon\n\n'
      + 'print(days[day])\n'
      + 'if hour == 0:\n    print("' + PARTS.midnight.oj + '")' + ' '.repeat(10) + '# ' + PARTS.midnight.en + '\n'
      + 'elif hour == 12:\n    print("' + PARTS.noon.oj + '")' + ' '.repeat(17) + '# ' + PARTS.noon.en + '\n'
      + 'else:\n    print(hours[hour % 12])      # % 12 turns 13 into 1, 14 into 2 ...\n';
  }
  if (window.LAB && window.LAB.TEMPLATES && window.LAB.TEMPLATES.python) window.LAB.TEMPLATES.python.push({ name: 'Ojibwe clock', code: clockProgram(2, 13) });

  // Ojibwe words used as data in the lessons' examples (not interface labels).
  const LESSON_WORDS = [
    { oj: 'boozhoo', en: 'hello', src: E('boozhoo-pc-interj') },
    { oj: 'miigwech', en: 'thank you', src: E('miigwech-pc-disc') },
    { oj: 'makwa', en: 'bear', src: E('makwa-na') },
    { oj: 'nibi', en: 'water', src: E('nibi-ni') },
    { oj: 'mitig', en: 'tree (the animate noun; the inanimate mitig is wood, a stick)', src: E('mitig-na') }
  ];
  const LESSON_WHERE = 'Python lesson 11 (Dictionaries) and Lisp lesson 12 (Symbols, quotation, and code as data)';

  // Interface words with no Ojibwe yet. `found` lists dictionary entries that may fit, for a speaker to accept,
  // change or reject; none of them is shown on the site.
  const CANDIDATES = [
    { en: 'Student', found: [{ oj: 'gikinoo\'amaagan', pos: 'na', gloss: 'a student', src: OPD + '/browse/ojibwe/g?page=16' }, { oj: 'gikinoo\'amawaagan', pos: 'na [BL]', gloss: 'a student (marked as a Border Lakes word)', src: OPD + '/main-entry/gikinoo-amawaagan-na' }] },
    { en: 'For teachers', found: [{ oj: 'gikinoo\'amaagewikwe', pos: 'na', gloss: 'a teacher (female)', src: OPD + '/main-entry/gikinoo-amaagewikwe-na' }, { oj: 'gikinoo\'amaagewinini', pos: 'na', gloss: 'a teacher (male)', src: OPD + '/main-entry/gikinoo-amaagewinini-na' }], note: 'The dictionary gives a female and a male word; the heading needs one for all teachers.' },
    { en: 'School', found: [{ oj: 'gikinoo\'amaadiiwigamig', pos: 'ni', gloss: 'a school', src: OPD + '/browse/ojibwe/g?page=16' }] },
    { en: 'Completed (an exercise)', found: [{ oj: 'giizhitoon', pos: 'vti2', gloss: 'finish, finish making it', src: OPD + '/main-entry/giizhitoon-vti2' }, { oj: 'giizhichigaade', pos: 'vii', gloss: 'it is finished (by someone), \u201cthey\u201d finish it', src: OPD + '/main-entry/giizhitoon-vti2' }] },
    { en: 'Computer', found: [{ oj: 'mazinaabikiwebinigan', pos: 'ni', gloss: 'a typewriter, a computer', src: OPD + '/main-entry/mazinaabikiwebinigan-ni' }] },
    { en: 'Read (the guide, the task)', found: [{ oj: 'agindan', pos: 'vti', gloss: 'count it; read it', src: OPD + '/main-entry/agindan-vti' }] },
    { en: 'Run' }, { en: 'Stop' }, { en: 'Reset' }, { en: 'Hint' }, { en: 'Solution' }, { en: 'Exercise' },
    { en: 'Next' }, { en: 'Previous' }, { en: 'Code Lab' }, { en: 'Your portfolio' }, { en: 'Classroom mode' },
    { en: 'Print' }, { en: 'Copy link' }, { en: 'Light / dark' }
  ];

  const h = (...a) => window.__app.internal.el(...a);
  // A label for the interface: the Ojibwe word with the English beside it (plain English for a key with no word).
  function label(key, suffix) {
    const w = WORDS[key]; suffix = suffix || '';
    if (!w) return document.createTextNode(key + suffix);
    return h('span', { class: 'oj-pair' }, h('span', { class: 'oj', lang: 'ciw' }, w.oj + suffix), ' ', h('span', { class: 'oj-en' }, w.en + suffix));
  }
  const text = (key) => (WORDS[key] ? WORDS[key].oj : key);

  // The clock: each sentence in Ojibwe with its English under it, then the time in digits. It redraws at the start of
  // every minute, and at once when the tab becomes visible again (browsers pause timers in background tabs and on
  // sleeping computers). It stops itself once it has left the page. opts.links adds links to the word list and to
  // the same logic as a Python program.
  function clock(opts) {
    opts = opts || {};
    const box = h('div', { class: 'oj-clock' });
    let timer = 0, last = '', seen = false; const born = Date.now();
    function draw() {
      const d = new Date(), words = timeWords(d);
      const digits = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      const key = words.map(w => w.oj).join('|') + digits; if (key === last) return; last = key;
      box.replaceChildren(...[
        h('div', { class: 'oj-clock-row' },
          words.map(w => h('span', { class: 'oj-clock-item' }, h('span', { class: 'oj', lang: 'ciw' }, w.oj + '.'), h('span', { class: 'oj-en' }, w.en + '.'))),
          h('span', { class: 'oj-clock-digits', title: d.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }, digits)),
        opts.links ? h('p', { class: 'oj-clock-links' },
          h('a', { href: '#/ojibwe', onclick: () => { try { sessionStorage.setItem('oj-jump', 'oj-time'); } catch (e) { } } }, 'Where the words come from'),
          window.LAB ? [' \u00b7 ', h('a', { href: '#/lab', onclick: (e) => { e.preventDefault(); const n = new Date(); window.LAB.openCode({ lang: 'python', name: 'ojibwe_clock.py', code: clockProgram(n.getDay(), n.getHours()) }); } }, 'See it as a Python program')] : null) : null].filter(Boolean));
    }
    function stop() { clearTimeout(timer); timer = 0; document.removeEventListener('visibilitychange', onVisible); }
    function schedule() { clearTimeout(timer); timer = setTimeout(tick, 60000 - Date.now() % 60000 + 50); }
    function tick() {
      if (!box.isConnected) { if (seen || Date.now() - born > 2000) stop(); else schedule(); return; }   // not yet on the page: wait a moment, then give up
      seen = true; draw(); schedule();
    }
    function onVisible() { if (!document.hidden) tick(); }
    draw(); schedule(); document.addEventListener('visibilitychange', onVisible);
    return box;
  }

  // ---------- the review page (#/ojibwe) ----------
  function srcLink(url, name) { return h('a', { href: url, target: '_blank', rel: 'noopener' }, name || url.replace(/^https?:\/\//, '')); }
  function timeRow(w, when) {
    return h('tr', {},
      h('td', { class: 'oj-word', lang: 'ciw' }, w.oj),
      h('td', {}, w.en),
      h('td', {}, when),
      h('td', {}, h('span', { class: 'oj-meta' }, 'vii. ', srcLink(w.src, OPD_NAME))),
      h('td', {}, w.alt ? w.alt.map((a, i) => [i ? ', ' : null, h('span', { lang: 'ciw' }, a.oj), a.note ? ' ' + a.note : null, ' (', srcLink(a.src, 'entry'), ')']) : h('span', { class: 'muted' }, '\u2014')));
  }
  document.addEventListener('routed', () => {   // arriving from the clock's link: scroll to the time section
    let id = null; try { id = sessionStorage.getItem('oj-jump'); sessionStorage.removeItem('oj-jump'); } catch (e) { }
    const t = id && document.getElementById(id); if (t && t.scrollIntoView) t.scrollIntoView();
  });
  function page() {
    const main = h('main', { class: 'oj-page' });
    const rows = Object.keys(WORDS).map(k => {
      const w = WORDS[k];
      return h('tr', {},
        h('td', { class: 'oj-word', lang: 'ciw' }, w.oj),
        h('td', {}, w.en),
        h('td', {}, h('div', { class: 'oj-gloss' }, w.gloss), h('div', { class: 'oj-meta' }, w.pos, '. ', srcLink(w.src, w.srcName))),
        h('td', {}, w.where),
        h('td', { class: 'oj-blank' }));
    });
    const cand = CANDIDATES.map(c => h('tr', {},
      h('td', {}, c.en),
      h('td', {}, c.found ? h('ul', { class: 'oj-found' }, c.found.map(f => h('li', {}, h('span', { lang: 'ciw', class: 'oj-word' }, f.oj), ' ', h('span', { class: 'oj-meta' }, f.pos), ': ', f.gloss, '. ', srcLink(f.src, 'entry')))) : h('span', { class: 'muted' }, 'Not looked up yet'), c.note ? h('p', { class: 'oj-meta' }, c.note) : null),
      h('td', { class: 'oj-blank' })));
    main.append(
      h('header', { class: 'pf-intro' },
        h('h1', {}, h('span', { lang: 'ciw' }, 'Ojibwemowin'), ' on this site'),
        h('p', { class: 'lead' }, 'This page lists every Ojibwe word the site can show, where each one comes from, and the interface words that still need one, so that a speaker can check them.')),
      h('section', { class: 'pf-controls oj-status' },
        h('p', {}, h('b', {}, 'Shown on the site. '), 'The words appear for everyone, each beside its English. Corrections and new words from Ojibwe speakers and language teachers are welcome: the two tables below are laid out for them.'),
        h('p', {}, 'How the words were chosen: each is copied exactly from the Ojibwe People\u2019s Dictionary (which records the Southwestern Ojibwe of Minnesota and Wisconsin, in the double-vowel spelling), in the form the entry lists. None was made up, changed or machine-translated. A word is used only where the dictionary\u2019s meaning matches what the label means; every other label stays in English. Each one appears with its English beside it.'),
        h('div', { class: 'toolbar' },
          h('button', { class: 'btn', onclick: () => window.print() }, 'Print this list for review'))),
      h('h2', {}, 'Words on the site'),
      h('div', { class: 'table-wrap' }, h('table', { class: 'oj-table' },
        h('thead', {}, h('tr', {}, h('th', {}, 'Ojibwe'), h('th', {}, 'English label'), h('th', {}, 'Source entry'), h('th', {}, 'Where it appears'), h('th', {}, 'Reviewer\u2019s notes'))),
        h('tbody', {}, rows))),
      h('h2', { id: 'oj-time' }, 'Days and hours'),
      h('p', {}, 'The clock on the home page says the day, the part of the day and the hour. Each is one word the dictionary lists whole, meaning \u201cit is \u2026\u201d; the clock shows them as separate sentences and never joins or changes them. The hour is the one that has begun (at 1:17 it says one o\u2019clock), and the minutes stay as digits, because the dictionary has no word pattern for them. The dictionary has no \u201ctwelve o\u2019clock\u201d in these forms, so the twelve o\u2019clock hours are noon and midnight. Hours use the forms marked [S] (southern). Where the dictionary gives other forms, they are listed so a speaker can choose.'),
      clock(),
      h('div', { class: 'table-wrap' }, h('table', { class: 'oj-table' },
        h('thead', {}, h('tr', {}, h('th', {}, 'Ojibwe used'), h('th', {}, 'English'), h('th', {}, 'When'), h('th', {}, 'Source'), h('th', {}, 'Other forms in the dictionary'))),
        h('tbody', {},
          DAYS.map((w, i) => timeRow(w, ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i])),
          Object.keys(PARTS).map(k => timeRow(PARTS[k], PARTS[k].hours)),
          HOURS.slice(1).map((w, i) => timeRow(w, (i + 1) + ':00 to ' + (i + 1) + ':59 (a.m. or p.m.)'))))),
      h('h2', {}, 'Words in the lessons'),
      h('p', {}, 'These words are examples of data in ' + LESSON_WHERE + '.'),
      h('p', {}, 'Mathematics lesson 7 (Patterns, and the double vowel system) uses words already listed on this page as examples of spelling: the interface words, and the clock\u2019s day and hour words. It adds no new words.'),
      h('div', { class: 'table-wrap' }, h('table', { class: 'oj-table' },
        h('thead', {}, h('tr', {}, h('th', {}, 'Ojibwe'), h('th', {}, 'English'), h('th', {}, 'Source'))),
        h('tbody', {}, LESSON_WORDS.map(w => h('tr', {}, h('td', { class: 'oj-word', lang: 'ciw' }, w.oj), h('td', {}, w.en), h('td', {}, h('span', { class: 'oj-meta' }, srcLink(w.src, OPD_NAME)))))))),
      h('h2', {}, 'Interface words without Ojibwe yet'),
      h('p', {}, 'For speakers and language teachers: the labels students see most, with any dictionary entries that might be relevant. None of these is on the site. Write the word you would use, or leave it blank to keep the English.'),
      h('div', { class: 'table-wrap' }, h('table', { class: 'oj-table' },
        h('thead', {}, h('tr', {}, h('th', {}, 'English label'), h('th', {}, 'Dictionary entries found'), h('th', {}, 'Ojibwe to use'))),
        h('tbody', {}, cand))),
      h('footer', { class: 'oj-credit' },
        h('p', {}, 'Dictionary entries are copyrighted by ', srcLink(OPD, 'The Ojibwe People\u2019s Dictionary'), ' (University of Minnesota, Department of American Indian Studies) and used under the ', srcLink('https://creativecommons.org/licenses/by-nc-sa/3.0/', 'Creative Commons BY-NC-SA 3.0 licence'), '. The dictionary does not endorse this site.'),
        window.ABOUT ? h('p', {}, 'Credits for the rest of the site are on the ', h('a', { href: '#/about' }, 'About page'), '.') : null));
    return main;
  }

  window.OJIBWE = { label, text, page, clock, timeWords, clockProgram, WORDS, LESSON_WORDS, CANDIDATES, DAYS, HOURS, PARTS };
})();
