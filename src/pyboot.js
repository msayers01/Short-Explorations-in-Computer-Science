(function () {
  // Runs inside the sandboxed iframe (runner.js). The page cannot put the interpreter's source in the iframe's HTML: the
  // page's Content Security Policy allows only scripts it knows by hash. So the iframe holds only this short script, whose hash is
  // known, and the page sends the interpreter as a message; it is run with eval, which the policy allows for Skulpt.
  addEventListener('message', function boot(e) {
    if (e.source !== parent || !e.data || e.data.t !== 'init' || typeof e.data.src !== 'string') return;
    removeEventListener('message', boot);
    (0, eval)(e.data.src);
  });
  parent.postMessage({ t: 'booted' }, '*');
})();
