/* The Python sandbox. Skulpt ships native modules that reach out of the interpreter into the page and the network, and
   programs on this site are written by students and arrive inside links, so they must not have them:

     document     the DOM itself: a program can set innerHTML (which runs script in this page, with access to everything in
                  localStorage: progress, every assignment's hidden tests, the grade book) or create <script> elements
     urllib, urllib2   network requests (a way to send what it read somewhere else)
     webbrowser   opens windows and tabs
     image, processing, webgl   canvas, DOM and image loads from any URL
     socket, httplib, ftplib, smtplib, ...  network clients (inert in a browser build, removed so they stay that way)

   lockDown() deletes those files from the standard library Skulpt imports from, so `import document` fails with
   "No module named document". It runs once when this file loads, after Skulpt and before any program can run.
   Exposed as window.SANDBOX (browser) or module.exports (node tests). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SANDBOX = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const BLOCKED = new Set(['document', 'image', 'processing', 'webgl', 'webbrowser', 'urllib', 'urllib2', 'socket', 'httplib', 'ftplib', 'smtplib',
    'poplib', 'imaplib', 'telnetlib', 'nntplib', 'ssl', 'subprocess', 'multiprocessing', 'xmlrpclib', 'SimpleXMLRPCServer', 'BaseHTTPServer',
    'CGIHTTPServer', 'SimpleHTTPServer', 'SocketServer', 'asyncore', 'asynchat', 'cookielib', 'Cookie']);
  function lockDown(Sk) {
    Sk = Sk || (typeof globalThis !== 'undefined' ? globalThis.Sk : undefined);
    if (!Sk || !Sk.builtinFiles || !Sk.builtinFiles.files) return 0;
    let n = 0;
    for (const k of Object.keys(Sk.builtinFiles.files)) {
      const m = /^src\/lib\/([^/.]+)/.exec(k);   // src/lib/document.js, src/lib/urllib/request/__init__.js, src/lib/urllib2.py ...
      if (m && BLOCKED.has(m[1])) { delete Sk.builtinFiles.files[k]; n++; }
    }
    return n;
  }
  const removed = lockDown();
  return { lockDown, BLOCKED, removed };
});
