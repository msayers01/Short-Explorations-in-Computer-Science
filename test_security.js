// Security regression tests that run in node: the Python sandbox, and the size limit on packed links.
global.window = global;
let bad = 0;
const check = (name, ok, detail) => { if (!ok) { bad++; console.log('BAD  ' + name + (detail ? '\n  ' + detail : '')); } };

// --- 1. Skulpt must not be able to import modules that reach the page or the network
require('./node_modules/skulpt/dist/skulpt.min.js'); require('./node_modules/skulpt/dist/skulpt-stdlib.js');
const SANDBOX = require('./src/sandbox.js');
check('sandbox removed something', SANDBOX.removed > 0, 'removed ' + SANDBOX.removed);
const py = async (code) => {
  let out = '';
  Sk.configure({ output: t => out += t, read: f => { if (Sk.builtinFiles.files[f] === undefined) throw "File not found: '" + f + "'"; return Sk.builtinFiles.files[f]; }, __future__: Sk.python3, execLimit: 5000 });
  try { await Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('<stdin>', false, code, true)); return { out, err: null }; } catch (e) { return { out, err: String(e) }; }
};
(async () => {
  for (const mod of ['document', 'urllib', 'urllib.request', 'urllib2', 'webbrowser', 'image', 'processing', 'webgl', 'socket', 'subprocess']) {
    const r = await py('import ' + mod + '\nprint("IMPORTED")');
    check('import ' + mod + ' is refused', r.err && !r.out.includes('IMPORTED'), JSON.stringify(r));
  }
  const viaImport = await py("d = __import__('document')\nprint('IMPORTED')");
  check("__import__('document') is refused", !viaImport.out.includes('IMPORTED'), JSON.stringify(viaImport));
  const fromImport = await py('from urllib.request import urlopen\nprint("IMPORTED")');
  check('from urllib.request import is refused', !fromImport.out.includes('IMPORTED'), JSON.stringify(fromImport));
  for (const [mod, line] of [['math', 'print(math.sqrt(16))'], ['random', 'print(random.randint(1, 1))'], ['time', 'print(time.time() > 0)'], ['re', 'print(re.match("a", "a") is not None)'], ['collections', 'print(collections.OrderedDict())'], ['string', 'print(string.ascii_lowercase[:3])']]) {
    const r = await py('import ' + mod + '\n' + line);
    check('import ' + mod + ' still works', !r.err, JSON.stringify(r));
  }

  check('turtle is still in the standard library', Sk.builtinFiles.files['src/lib/turtle.js'] !== undefined);
  const js = await py("print(jseval('1+1'))");
  check('jseval is gone', js.err && /jseval/.test(js.err) && !js.out, JSON.stringify(js));

  // --- 2. packed links: a tiny link that inflates to a huge document must be refused, and ordinary ones must round-trip
  require('./src/teach.js');
  const TEACH = window.TEACH;
  const small = { v: 1, title: 'héllo ✓', items: [1, 2, 3] };
  check('round trip', JSON.stringify(await TEACH.unpack(await TEACH.pack(small))) === JSON.stringify(small));
  const big = { v: 1, junk: '0'.repeat(60 * 1024 * 1024) };
  const link = await TEACH.pack(big);
  check('bomb link is tiny', link.length < 200000, 'link is ' + link.length + ' chars');
  let refused = false; try { await TEACH.unpack(link); } catch (e) { refused = /more data|too large|too big/i.test(e.message); }
  check('decompression bomb is refused', refused);
  let junk = false; try { await TEACH.unpack('zAAAA'); } catch (e) { junk = true; }
  check('garbage link is an error, not a hang', junk);

  // --- 3. the built pages are self-contained: no outside origin in the policy, no <link>, no remote URL in a stylesheet
  const fs = require('fs');
  for (const f of ['dist/index.html', 'dist/teacher-guide.html', 'dist/_headers']) {
    if (!fs.existsSync(f)) continue;
    const html = fs.readFileSync(f, 'utf8');
    const policy = (html.match(/Content-Security-Policy[^\n>]*/g) || []).join(' ');
    check(f + ' has a Content-Security-Policy', /default-src 'none'/.test(policy));
    check(f + ' policy names no other site', !/https?:\/\//.test(policy), policy.match(/https?:\/\/[^\s;"']+/));
    check(f + ' loads no stylesheet or font from another site', !/<link[^>]+(stylesheet|preconnect)/i.test(html) && !/fonts\.(googleapis|gstatic)/.test(html));
  }

  // --- 4. a name put into a regular expression is escaped completely (CodeQL: incomplete escaping), not just for one character
  for (const f of fs.readdirSync('src').filter((n) => n.endsWith('.js'))) {
    check('src/' + f + ' escapes names for a RegExp completely', !/\.replace\(\/\[\$\]\/g/.test(fs.readFileSync('src/' + f, 'utf8')));
  }

  // --- 5. Full C++: a program's memory is capped before it runs. (Whether the browser then enforces it is checked by test_browser.js; node runs
  //        programs differently.) Here: the patch is well formed, adds a maximum, and does not touch anything else.
  {
    const { limitMemory, MAX_PAGES } = require('./src/clangworker.js');
    const T = await import('@live-codes/clang-wasm/toolchain');
    const tc = await T.createToolchain({});
    const art = (await tc.lock(() => tc.captureCompilerOutput(() => tc.runtime.compileArtifact('#include <iostream>\nint main() { std::cout << "hi"; }', { language: 'CPP', fileName: 'main.cpp', compileArgs: [...T.CLANG_DRIVER_DEFAULT_ARGS, '-std=gnu++20'] })))).result;
    const patched = limitMemory(art.bytes, MAX_PAGES);
    check('memory cap: a real program\'s module can be patched, and the result is valid wasm', patched instanceof Uint8Array && WebAssembly.validate(patched));
    check('memory cap: patching adds a maximum and nothing else changes size by more than a few bytes', patched.length - art.bytes.length >= 1 && patched.length - art.bytes.length <= 4, patched.length - art.bytes.length);
    check('memory cap: patching twice changes nothing more', Buffer.compare(Buffer.from(limitMemory(patched, MAX_PAGES)), Buffer.from(patched)) === 0);
    check('memory cap: a smaller maximum already in the module is kept', limitMemory(patched, 1e5).length === patched.length);
    check('memory cap: bytes that are not wasm are refused', limitMemory(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]), MAX_PAGES) === null && limitMemory(new Uint8Array(3), MAX_PAGES) === null);
  }

  if (bad) { console.log(bad + ' problems'); process.exit(1); }
  console.log('security OK');
})();
