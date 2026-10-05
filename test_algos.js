// Node tests for the algorithms behind the #/algorithms demos: each src/algo_*.js exports selfTest(), which checks its algorithms
// (that a sort sorts, a path is shortest, a maze is perfect, minimax plays perfectly...) apart from the drawing. Also checks the
// registry: every demo has an id, a title, a known group, a blurb and a mount function, and ids are unique.
global.window = global;
const ALGOS = require('./src/algos.js');
let bad = 0;
const files = ['algo_search', 'algo_sort', 'algo_paths', 'algo_games', 'algo_puzzles', 'algo_nature', 'algo_geometry', 'algo_logic', 'algo_play'];
for (const f of files) {
  let mod;
  try { mod = require('./src/' + f + '.js'); } catch (e) { bad++; console.log('BAD  ' + f + ' does not load: ' + e.message); continue; }
  if (!mod || typeof mod.selfTest !== 'function') { bad++; console.log('BAD  ' + f + ' exports no selfTest()'); continue; }
  let fails;
  try { fails = mod.selfTest() || []; } catch (e) { fails = ['threw: ' + (e && e.stack || e)]; }
  for (const m of fails) { bad++; console.log('BAD  ' + f + ': ' + m); }
  if (!fails.length) console.log('ok   ' + f);
}
const ids = new Set();
for (const d of ALGOS.demos) {
  const where = 'demo ' + (d.id || '?');
  if (!d.id || !/^[a-z0-9-]+$/.test(d.id)) { bad++; console.log('BAD  ' + where + ': id must be lower-case letters, digits and -'); }
  if (ids.has(d.id)) { bad++; console.log('BAD  ' + where + ': id used twice'); } ids.add(d.id);
  if (!d.title || !d.blurb) { bad++; console.log('BAD  ' + where + ': needs a title and a blurb'); }
  if (!ALGOS.GROUPS.includes(d.group)) { bad++; console.log('BAD  ' + where + ': group ' + JSON.stringify(d.group) + ' is not one of ' + ALGOS.GROUPS.join(', ')); }
  if (typeof d.mount !== 'function') { bad++; console.log('BAD  ' + where + ': no mount function'); }
  for (const t of d.taught || []) if (!/^#\/[a-z]+\/\d+(\/[\w-]+)?$/.test(t.href)) { bad++; console.log('BAD  ' + where + ': taught link ' + t.href + ' is not #/<course>/<lesson>'); }
}
console.log(ALGOS.demos.length + ' demos registered');
if (bad) { console.log(bad + ' problems'); process.exit(1); }
console.log('algorithms OK');
