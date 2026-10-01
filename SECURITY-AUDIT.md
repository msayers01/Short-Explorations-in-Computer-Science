# Security audit: Short Explorations in Computer Science

Audit date: 2026-10-01. Code audited: `main` at the merge of pull request 1 (`6849a76`), plus the fixes in the pull request that
accompanies this report. Method: reading every place data enters or leaves the page, then testing the built site in a real
browser (Chromium via Playwright) with hostile input. The probe scripts are in `tools/security/` so the audit can be repeated.

## Summary

**Cross-site scripting through the page's HTML: none found.** Every place that puts text from a link, from storage or from a
program into the page does so through `textContent`/text nodes or through an escape function. The test: script payloads
(`<img onerror>`, `<svg onload>`, `</script><script>`, quote-breaking strings, `javascript:` links) were sent through
every link route, about 150 figure and exercise inputs, program output and error text, every stepper, and tampered `localStorage`.
None ran. (A positive control confirmed the detector sees an injected handler when one is injected.)

**What was found instead** is a different way to get script running: the Python runtime itself. Five other defects were
found in how links are handled. All are fixed. A Content Security Policy now stops injected inline script and handlers
as a second line of defence.

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| 1 | High | Python programs could drive the page's DOM and network (script execution with access to `localStorage`) | Fixed |
| 2 | High | Prototype pollution of the whole page through a crafted submission link | Fixed |
| 3 | Medium | Links changed teacher data, and ran a stranger's program, with no confirmation | Fixed |
| 4 | Medium | One crafted Code Lab link broke the Code Lab permanently on that device | Fixed |
| 5 | Medium | Decompression bomb: a small link could freeze or crash the tab | Fixed |
| 6 | Medium | No Content Security Policy or security headers (defence in depth) | Fixed |
| 7 | Low | Malformed links crashed pages with type errors | Fixed |
| 8 | Low | The saved portfolio web page had no Content Security Policy | Fixed |
| 9 | Low | Class roster names travel inside the assignment link | Mitigated (warning) |
| 10 | Low | Build tool `esbuild` was unpinned (`*`) | Fixed |
| 11 | Low | CSV export could carry spreadsheet formulas from student names | Fixed earlier (PR 1) |
| 12 to 17 | Info | Residual risks and design limits | Documented below |

## Findings

### 1. High: Python programs could reach the page and the network

**What.** Skulpt, the Python interpreter, ships native modules that reach out of the interpreter: `document` (the DOM),
`urllib`/`urllib2` (network requests), `webbrowser`, `image`, `processing` and `webgl`. All were importable. A student program
could write `document.getElementById('app').innerHTML = '<img src=x onerror=...>'`, which runs script in the site's origin. That script can read
everything in `localStorage`: the student's progress, and on a teacher's device every assignment's hidden tests and the whole grade book.

**Proof.** In the Code Lab, `import document` followed by setting `innerHTML` to an `<img onerror>` that reads a value from `localStorage` returned the stored value.

**How a hostile program reaches a victim.** Any link that carries code is a delivery route: a submission link (the teacher's
page runs the assignment's tests on it as soon as it is opened), a shared Code Lab link (runs when the victim presses Run), and a portfolio link
("Check every exercise on this computer" runs the student's code). The submission route needs no click from the victim beyond opening the link.

**Fix.** `src/sandbox.js` removes those modules (and the inert network clients) from the standard library Skulpt imports from,
before any program can run. `import document` now fails with "No module named document". `turtle`, `math`, `random`, `re`,
`time`, `string`, `collections` and the rest still work. Tests: `test_security.js` (node) and `tools/security/runtimes.js` (browser).

**Not affected.** The C++ interpreter (JSCPP) and the Scheme interpreter have no way to name a JavaScript object, so a program in either cannot reach the page.

### 2. High: Prototype pollution through a submission link

**What.** The grade book was stored as plain objects keyed by values taken from the link (`T.book[sub.a][sub.name] = entry`).
A submission with assignment id `__proto__` made that line write to `Object.prototype`, so any name and a value chosen
by the link's author became a property of every object in the page. An id of `constructor` reaches the global `Object` function by the same mechanism (only the `__proto__` case was run end to end).

**Proof.** After opening `#/review?s=<link with a="__proto__", name="polluted">`, `({}).polluted` was set and `for (k in {})` listed it.

**Fix.** Every dictionary keyed by data from a link (`assignments`, `received`, `book` and each student's entry list) now has no
prototype (`Object.create(null)`), and incoming ids must be 1 to 40 characters of `A-Z a-z 0-9 _ -`. Imports, assignment links and submissions pass through
`normalize`/`cleanSub`, which also coerce every field to the expected type and cap lengths. The exercise index
and language lookups use own-property checks.

### 3. Medium: Links changed teacher data without asking

**What.** Opening `#/lab?b=<back-up>` replaced the teacher's assignments with the same ids, hidden tests included, and switched teacher mode on.
Opening `#/review?s=<submission>` overwrote a student's earlier submission of the same name and ran the submitted program. Neither asked.
Anyone who could get a link in front of a teacher could sabotage an assignment's tests or forge or replace a submission.

**Fix.** Both links now show a confirmation first, stating who submitted what, whether it replaces an existing entry (back-up links say
**would REPLACE** when ids clash), and that the program will run on this device. Nothing is stored and nothing runs until the teacher clicks.
The normal student flow (opening an assignment link) is unchanged.

**Residual.** Submissions are not authenticated: anyone can type any name. That is inherent in a site with no accounts. The confirmation now makes the claim visible. Verify a surprising submission out of band.

### 4. Medium: One link could break the Code Lab for good

**What.** `#/lab?l=constructor` (or `l=__proto__`) passed the language check (`LANG_INFO['constructor']` is truthy), was saved as the
active language, and crashed the Code Lab on every later visit until the user cleared site data.

**Fix.** Language names are checked with an own-property test everywhere (`hasLang`, `langOf`), and the stored Code Lab state
is validated and repaired when loaded. A corrupted state now recovers instead of crashing.

### 5. Medium: Decompression bomb

**What.** Links are compressed with deflate. A link of about 80 KB inflated to 60 MB, and larger ratios are easy. Opening one makes the browser inflate all of it, and nothing stopped a link that expands to gigabytes.

**Fix.** Links over 4 MB are refused, and inflation stops with a clear error past 8 MB, reading the stream in chunks. Real
assignments, submissions and portfolios are far below both limits. A 60 MB bomb link now opens as an error page in about a second.

### 6. Medium (defence in depth): no Content Security Policy

**What.** There was no CSP, so any future HTML-injection mistake would have been fully exploitable.

**Fix.** `build.js` now puts a policy in every page (meta tag) and writes `dist/_headers` (response headers on Cloudflare), with:
`default-src 'none'`; `script-src` allowing only the page's own inline scripts **by SHA-256 hash**; `connect-src 'none'`, `img-src data: blob:`,
`form-action 'none'`, `base-uri 'none'`, `object-src 'none'`, `frame-src 'none'`. Plus `X-Content-Type-Options: nosniff`,
`Referrer-Policy: no-referrer`, and a restrictive `Permissions-Policy`.

**Tested.** With the policy on, an injected `<img onerror>`, `<svg onload>` and `<script>` all refused to run; every feature of the site
(courses, all three languages, the turtle canvas, steppers, Code Lab, teacher tools with QR codes, downloads) ran with zero violations.

**Residual.** `script-src` needs `'unsafe-eval'` because Skulpt compiles Python to JavaScript with `new Function` (C++ and Scheme do not need it).
`style-src` needs `'unsafe-inline'` because the page sets inline styles. The Google Fonts stylesheet and font files are allowed. None of this weakens the
main protection: injected markup cannot run script. The deployed response headers could not be fetched from here; check them once after deploying
(see "Verifying after deploy").

### 7. Low: malformed links crashed pages

An assignment link missing `hints`, `roster` or `tests`, or with the wrong types, raised errors in several panels. All incoming assignments, submissions and back-ups are now validated and coerced as in finding 2. A received student link can no longer claim hidden tests.

### 8. Low: the saved portfolio page had no CSP

The portfolio can be saved as a standalone web page built from data that may have come from a link. The page now carries a policy that forbids all script, and it contains no script (checked). Its content is text, escaped.

### 9. Low: roster names in assignment links

An assignment's class roster is part of the link students open, so anyone who has the link can read the names. The Roster field now says so. The fix for good is to leave the roster empty (students type their name).

### 10. Low: unpinned build tool

`devDependencies` had `"esbuild": "*"`. It is now pinned to the locked version, `0.28.2`. `npm audit` reports no vulnerabilities. Bundled libraries are pinned (Skulpt 1.2.0, JSCPP 2.0.9) and `vendor/jscpp.min.js` was verified to rebuild byte-for-byte from `node_modules`.

### 11. Low: spreadsheet formula injection

A student name beginning with `=`, `+`, `-` or `@` would have become a formula when the grade book CSV was opened in a spreadsheet. Fixed in the earlier pull request (the cell is prefixed with an apostrophe).

## Informational: residual risks and design limits

12. **Framing / clickjacking.** The site can be framed on purpose: teachers embed it in learning-management systems. Actions with side effects need a click and the destructive ones a second click. To forbid framing, add `frame-ancestors 'none'` to the policy in `build.js`.
13. **Google Fonts.** Loading the font stylesheet tells Google a visitor's IP address and browser. The stylesheet comes from a third party with no integrity hash, so Google could in principle change what it sends (the CSP limits what styles can load, but not what they contain). Self-hosting the fonts removes both. Not done, because it adds several hundred KB to the page and could not be fetched from here.
14. **Local data is not encrypted.** Progress, files, assignments with hidden tests and the grade book sit in `localStorage`. Anyone using the same browser profile can read them. Teachers should use their own profile or clear the data (the "Reset" links do).
15. **Content spoofing.** An assignment link shows its author's text under the site's name. Someone could write misleading instructions. The text is always rendered as plain text with simple formatting, never HTML.
16. **Resource use by programs.** A student program can still use a lot of memory or time (limits: Python 6 s in a run, C++ 4 s, Scheme step and recursion limits). Python tests run without yielding, so a slow program can briefly freeze the page. Finding 3's confirmation means this no longer happens by simply opening a link.
17. **JSCPP quirk.** In C++, declaring a variable named `__proto__` reports "already defined". It does not pollute anything (checked); it is a harmless quirk of the library.

## What was checked and found sound

- All 117 HTML-insertion points (`innerHTML` and the `html:` option of the DOM helper) outside the lesson text. Each takes trusted course
  content, a constant, or text passed through an escape function. The few that concatenate values (figures) concatenate numbers.
- No `eval`, `new Function`, `document.write`, `postMessage`, cookies, `fetch`, `XMLHttpRequest`, WebSocket or beacon in the site's own code. The only network use is the font stylesheet.
- Every external link uses `rel="noopener"`. No link target comes from user data except `#` anchors.
- Highlighting and the editor insert program text only through escaped HTML.
- The saved portfolio page contains no script; payload text in it is shown as text.
- The three link types round-trip, and the hidden tests of an assignment never appear in a student link (`studentCopy`).
- Dependencies: `npm audit` clean.

## Verifying after deploy

1. Open the site, then in the browser's developer tools Network panel check the page response for `Content-Security-Policy`, `X-Content-Type-Options` and `Referrer-Policy`. They come from `dist/_headers`; the same CSP is also in the page's meta tag, so protection does not depend on the host.
2. Run the Python line `import document`: it must say "No module named document".

## Repeating the audit

    npm test                                   # includes test_security.js (sandbox, size limit)
    npm run build
    node tools/security/links.js               # every link route with payloads
    node tools/security/inputs-and-output.js   # inputs, program output, tampered storage
    node tools/security/runtimes.js            # what Python, C++ and Scheme can reach
    node tools/security/consent-and-limits.js  # confirmations, bomb link, bad language value

The browser probes need Playwright with Chromium (`CHROMIUM_PATH` can point to a browser).
