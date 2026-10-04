// The files each sandbox worker is built from, in order (build.js joins them into the inert <script type="text/plain"> blocks that src/runner.js
// makes workers from; test_arena.js builds the same text and runs it in node's worker_threads, so the persistent-bot code is tested as it ships).
module.exports = {
  py: ['node_modules/skulpt/dist/skulpt.min.js', 'node_modules/skulpt/dist/skulpt-stdlib.js', 'src/lockdown.js', 'src/sandbox.js', 'src/botio.js', 'src/pyworker.js'],   // lockdown after Skulpt: it reads importScripts while loading
  cpp: ['src/lockdown.js', 'vendor/jscpp.min.js', 'src/cpputil.js', 'src/cppstep.js', 'src/botio.js', 'src/cppworker.js'],
  java: ['src/lockdown.js', 'src/java.js', 'src/botio.js', 'src/javaworker.js'],   // the site's own Java interpreter
  scheme: ['src/lockdown.js', 'src/scheme.js', 'src/botio.js', 'src/schemeworker.js']   // only for Bot Arena bots that stay running (persistent mode)
};
