/* Runs in every sandbox that runs a student's program (the Python and C++ interpreters, in a Web Worker or a sandboxed frame), before any
   program does.
   The page's Content Security Policy allows requests to this site itself (for the optional real-C++ compiler), so a sandbox that
   was somehow taken over could still ask this site for files, or start another worker that has its own copy of these functions.
   This removes every way of making a request, starting a worker or reaching stored data, before any interpreter is loaded, from the
   global object and from everything it inherits from. The interpreters need none of them. It is a second wall, behind the
   sandbox itself, not a replacement for it. The real-C++ worker is not locked down this way: it needs fetch to download the
   compiler, and the programs it runs are WebAssembly with no imports but a private in-memory file system. */
(function (g) {
  'use strict';
  var names = ['fetch', 'XMLHttpRequest', 'WebSocket', 'WebTransport', 'EventSource', 'importScripts', 'Worker', 'SharedWorker',
    'BroadcastChannel', 'indexedDB', 'IDBFactory', 'caches', 'CacheStorage', 'RTCPeerConnection'];
  for (var o = g; o; o = Object.getPrototypeOf(o)) {
    for (var i = 0; i < names.length; i++) {
      var n = names[i];
      if (!Object.prototype.hasOwnProperty.call(o, n)) continue;
      try { delete o[n]; } catch (e) { /* not removable */ }
      if (Object.prototype.hasOwnProperty.call(o, n)) { try { Object.defineProperty(o, n, { value: undefined, writable: false, configurable: false }); } catch (e) { /* nothing more can be done */ } }
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : self);
