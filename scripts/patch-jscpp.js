// Applies the patches in patches/ to node_modules/JSCPP so the C++ tests run the same JSCPP as the browser bundle
// (vendor/jscpp.min.js). Safe to run any number of times: a patch whose marker text is already in the file is skipped,
// and a problem is reported as a warning rather than failing the install or the test run.
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const root = path.join(__dirname, '..');
const PATCHES = [
  { file: 'patches/jscpp-iostream.patch', target: 'node_modules/JSCPP/lib/defaults.js', marker: 'integer division by zero' },
  { file: 'patches/jscpp-unsigned.patch', target: 'node_modules/JSCPP/lib/rt.js', marker: 'the number of values' }
];
if (!fs.existsSync(path.join(root, 'node_modules/JSCPP/lib/defaults.js'))) { console.log('patch-jscpp: node_modules/JSCPP is not installed; run npm ci first'); process.exit(0); }
for (const p of PATCHES) {
  if (fs.readFileSync(path.join(root, p.target), 'utf8').includes(p.marker)) continue;   // already applied
  const r = spawnSync('patch', ['-p0', '-i', path.join(root, p.file)], { cwd: root, encoding: 'utf8' });
  if (r.error || r.status !== 0) console.log('patch-jscpp: could not apply ' + p.file + ' (' + (r.error ? r.error.message : (r.stdout + r.stderr).trim()) + '); the C++ tests may differ from the browser bundle');
  else console.log('patch-jscpp: applied ' + p.file);
}
