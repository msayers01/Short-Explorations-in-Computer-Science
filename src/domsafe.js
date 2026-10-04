/* A safety net for building pages. The DOM's own append, prepend, replaceChildren, before, after and replaceWith turn null, undefined and false into the
   text "null", "undefined" and "false", and an array into "[object HTMLElement]": so a bare  parent.append(a, cond ? b : null)  put the word null on the page
   (it did, in the Life demo and in a figure of the machine-learning course). el() in app.js has always skipped them; this makes the DOM's own methods do the same,
   everywhere, so one forgotten check cannot show a student a stray "null". Strings, numbers (0 prints as 0) and nodes behave as before. Loaded first. */
(function () {
  'use strict';
  if (typeof Element === 'undefined' || typeof DocumentFragment === 'undefined') return;
  const clean = (args) => {
    const out = [];
    (function walk(list) { for (const x of list) { if (Array.isArray(x)) walk(x); else if (x !== null && x !== undefined && x !== false) out.push(x); } })(args);
    return out;
  };
  const wrap = (proto, names) => {
    for (const name of names) {
      const own = Object.getOwnPropertyDescriptor(proto, name);
      if (!own || typeof own.value !== 'function') continue;
      const original = own.value;
      Object.defineProperty(proto, name, Object.assign({}, own, { value: { [name](...args) { return original.apply(this, clean(args)); } }[name] }));
    }
  };
  wrap(Element.prototype, ['append', 'prepend', 'replaceChildren', 'before', 'after', 'replaceWith']);
  wrap(DocumentFragment.prototype, ['append', 'prepend', 'replaceChildren']);
  if (typeof Document !== 'undefined') wrap(Document.prototype, ['append', 'prepend', 'replaceChildren']);
  if (typeof CharacterData !== 'undefined') wrap(CharacterData.prototype, ['before', 'after', 'replaceWith']);
})();
