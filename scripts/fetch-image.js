// Fetch a picture for a lesson from Wikimedia Commons, check that its licence allows it, and store it in img/ with its credits.
//
//   node scripts/fetch-image.js <id> "File:Name on Commons.jpg" "alt text" ["short title"]
//   node scripts/fetch-image.js --search "words"      lists Commons files that match, with licence, size and description
//
// Writes img/<id>.jpg (at most 960 px wide, progressive JPEG, metadata stripped) and img/<id>.json:
//   { id, file, title, alt, author, license, licenseUrl, source, credit, width, height, fetched }
// Only public domain, CC0, CC BY and CC BY-SA pictures are accepted (no fair use, no NC or ND): the site's lessons are CC BY-SA 4.0.
// Requests go through curl (it uses the environment's proxy), one at a time, with a User-Agent and the waits Wikimedia asks for.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const UA = 'ShortExplorationsCS/1.0 (free CS lessons for schools; https://github.com/msayers01/Short-Explorations-in-Computer-Science)';
const DIR = path.join(__dirname, '..', 'img');
const ALLOWED = (lic) => /^(public domain|pd\b|pd-|cc0|cc[ -]by(-sa)?[ -]\d(\.\d)?|cc[ -]by(-sa)?$)/i.test(lic.trim()) && !/\b(nc|nd)\b/i.test(lic);
const dedupe = (t) => { const h = t.length / 2; return t.length % 2 === 0 && t.slice(0, h) === t.slice(h) ? t.slice(0, h) : t; };   // Commons HTML can repeat a name in a hidden span
// HTML from Commons to plain text: tags are removed until none are left (one pass can leave "<scr<b>ipt>" behind), any stray < or >
// is dropped, and entities are decoded in one pass (decoding &amp; first would turn &amp;quot; into a quote). The result is only ever
// shown as text, but it should be text.
const ENTITIES = { amp: '&', quot: '"', '#39': "'", '#039': "'", apos: "'", nbsp: ' ' };
const strip = (h) => {
  let t = String(h || ''), prev;
  do { prev = t; t = t.replace(/<[^<>]*>/g, ''); } while (t !== prev);
  return t.replace(/[<>]/g, '').replace(/&(amp|quot|#0?39|apos|nbsp);/g, (m, e) => ENTITIES[e]).replace(/\s+/g, ' ').trim();
};

function curl(url, out) {
  for (let attempt = 1; attempt <= 8; attempt++) {
    const args = ['-sS', '-m', '60', '-A', UA, '-D', '-', '-o', out || '-', url];
    const r = cp.spawnSync('curl', args, { encoding: out ? 'utf8' : 'utf8', maxBuffer: 1 << 26 });
    const headers = r.stdout || '';
    const code = +((headers.match(/^HTTP\/[\d.]+ (\d+)/gm) || []).pop() || ' 0').split(' ')[1];
    if (code === 200) return out ? true : headers.slice(headers.lastIndexOf('\r\n\r\n') + 4);
    const wait = Math.min(120, +((headers.match(/^retry-after: *(\d+)/im) || [])[1] || 0) || 10 * attempt);
    if (code !== 429 && code < 500) throw new Error('HTTP ' + code + ' for ' + url);
    process.stderr.write('  HTTP ' + code + ', waiting ' + wait + ' s\n');
    cp.spawnSync('sleep', [String(wait)]);
  }
  throw new Error('gave up on ' + url);
}

function search(q) {
  const api = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=15&gsrsearch=' + encodeURIComponent(q) +
    '&prop=imageinfo&iiprop=size|extmetadata&iiextmetadatafilter=LicenseShortName|ImageDescription|DateTimeOriginal|Artist';
  const data = JSON.parse(curl(api));
  const pages = Object.values((data.query || {}).pages || {}).sort((a, b) => a.index - b.index);
  if (!pages.length) { console.log('nothing found for ' + q); return; }
  for (const p of pages) {
    const ii = (p.imageinfo || [])[0] || {}, m = ii.extmetadata || {}, lic = strip((m.LicenseShortName || {}).value);
    console.log((ALLOWED(lic || '-') ? 'OK  ' : 'NO  ') + p.title + '  [' + ii.width + 'x' + ii.height + ', ' + (lic || 'no licence') + ']');
    console.log('    ' + strip((m.ImageDescription || {}).value).slice(0, 220) + (m.DateTimeOriginal ? ' {' + strip(m.DateTimeOriginal.value).replace(/date QS:\S+/g, '').slice(0, 40) + '}' : ''));
  }
}

function main() {
  if (process.argv[2] === '--search') return search(process.argv.slice(3).join(' '));
  const [id, file, alt, short] = process.argv.slice(2);
  if (!id || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id) || !file || !/^File:/.test(file) || !alt) {
    console.error('usage: node scripts/fetch-image.js <id: lower-case-with-dashes> "File:Name.jpg" "alt text" ["short title"]'); process.exit(2);
  }
  const api = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=1200&titles=' + encodeURIComponent(file);
  const data = JSON.parse(curl(api));
  const page = Object.values(data.query.pages)[0];
  if (!page.imageinfo) throw new Error(file + ' is not on Commons');
  const ii = page.imageinfo[0], m = ii.extmetadata || {};
  const license = strip((m.LicenseShortName || {}).value), usage = strip((m.UsageTerms || {}).value);
  if (!license || !ALLOWED(license)) throw new Error(file + ': licence "' + license + '" is not public domain, CC0, CC BY or CC BY-SA; not used');
  if (/fair use|non-free/i.test(usage + ' ' + strip((m.Restrictions || {}).value))) throw new Error(file + ': restricted (' + usage + ')');
  const author = dedupe(strip((m.Artist || {}).value)) || 'Unknown', credit = dedupe(strip((m.Credit || {}).value)), description = strip((m.ImageDescription || {}).value), date = strip((m.DateTimeOriginal || {}).value).replace(/date QS:\S+/g, '').replace(/\s+/g, ' ').trim();
  fs.mkdirSync(DIR, { recursive: true });
  const tmp = path.join(DIR, '.' + id + '.download');
  curl(ii.thumburl || ii.url, tmp);
  const out = path.join(DIR, id + '.jpg');
  const r = cp.spawnSync('convert', [tmp + '[0]', '-auto-orient', '-resize', '960x960>', '-strip', '-interlace', 'Plane', '-sampling-factor', '4:2:0', '-quality', '78', '-colorspace', 'sRGB', out], { encoding: 'utf8' });
  fs.rmSync(tmp, { force: true });
  if (r.status) throw new Error('convert failed: ' + r.stderr);
  const [w, h] = cp.spawnSync('identify', ['-format', '%w %h', out], { encoding: 'utf8' }).stdout.split(' ').map(Number);
  const meta = { id, file: id + '.jpg', title: short || strip((m.ObjectName || {}).value) || file.replace(/^File:|\.\w+$/g, ''), alt,
    author: author.slice(0, 200), license, licenseUrl: strip((m.LicenseUrl || {}).value) || null,
    source: 'https://commons.wikimedia.org/wiki/' + encodeURIComponent(file.replace(/ /g, '_')).replace(/%3A/g, ':'),
    credit: credit.slice(0, 300), description: description.slice(0, 600), date: date.slice(0, 60), width: w, height: h, fetched: new Date().toISOString().slice(0, 10) };
  fs.writeFileSync(path.join(DIR, id + '.json'), JSON.stringify(meta, null, 2) + '\n');
  console.log('ok ' + id + ': ' + w + 'x' + h + ', ' + Math.round(fs.statSync(out).size / 1024) + ' KB, ' + license + ', ' + meta.author);
  console.log('   Commons says: ' + (description || '(no description)') + (date ? ' [' + date + ']' : ''));
  console.log('   Look at img/' + id + '.jpg and check the alt text against the picture and this description before using it.');
}
try { main(); } catch (e) { console.error('FAILED: ' + e.message); process.exit(1); }
