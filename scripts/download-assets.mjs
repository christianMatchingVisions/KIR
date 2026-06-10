// Download every wp-content / wp-includes asset referenced by the scraped
// fragments into public/, preserving paths so asset URLs stay identical after
// the domain takeover. Also follows url(...) references inside downloaded CSS.
import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://kasinotilmanrekisteroitymista.com';
const FRAGMENTS = path.join(ROOT, 'src', 'fragments');
const PUBLIC = path.join(ROOT, 'public');
const CONCURRENCY = 8;

const ASSET_RE = /(?:https?:\/\/kasinotilmanrekisteroitymista\.com)?(\/(?:wp-content|wp-includes)\/[^\s"'<>()\\]+)/g;

const decode = (s) =>
  s.replaceAll('&amp;', '&').replaceAll('&#038;', '&').replaceAll('&#39;', "'").replaceAll('\\/', '/');

function normalize(ref) {
  let p = decode(ref);
  p = p.split('#')[0];
  const q = p.indexOf('?');
  if (q !== -1) p = p.slice(0, q); // static hosts ignore ?ver= query strings
  if (!/\.[a-z0-9]{2,5}$/i.test(p)) return null; // skip non-file refs
  return p;
}

async function collectRefs() {
  const refs = new Set();
  const dirs = await readdir(FRAGMENTS);
  for (const d of dirs) {
    for (const f of ['head.html', 'body.html']) {
      const file = path.join(FRAGMENTS, d, f);
      if (!existsSync(file)) continue;
      const text = await readFile(file, 'utf8');
      for (const m of text.matchAll(ASSET_RE)) {
        const p = normalize(m[1]);
        if (p) refs.add(p);
      }
    }
  }
  return refs;
}

const downloaded = new Set();
const failures = [];

async function download(p) {
  if (downloaded.has(p)) return null;
  downloaded.add(p);
  const dest = path.join(PUBLIC, ...p.split('/').filter(Boolean).map(decodeURIComponent));
  if (existsSync(dest)) return dest;
  const res = await fetch(ORIGIN + p, { headers: { 'User-Agent': 'KIR-migration/1.0' } });
  if (!res.ok) {
    failures.push({ path: p, status: res.status });
    return null;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, buf);
  return dest;
}

// CSS url(...) refs can be relative to the CSS file's location.
async function cssRefs(cssPath, cssUrlPath) {
  const css = await readFile(cssPath, 'utf8');
  const out = new Set();
  for (const m of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
    let ref = m[1].trim();
    if (ref.startsWith('data:') || ref.startsWith('#')) continue;
    if (ref.startsWith(ORIGIN)) ref = ref.slice(ORIGIN.length);
    if (!ref.startsWith('/')) {
      ref = new URL(ref, ORIGIN + cssUrlPath).pathname;
    }
    const p = normalize(ref);
    if (p && /^\/(wp-content|wp-includes)\//.test(p)) out.add(p);
  }
  return out;
}

const refs = await collectRefs();
console.log(`${refs.size} unique assets referenced in fragments`);

let queue = [...refs];
const cssQueue = [];
let count = 0;

while (queue.length) {
  const batch = queue;
  queue = [];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (batch.length) {
        const p = batch.shift();
        const dest = await download(p);
        count++;
        if (count % 100 === 0) console.log(`${count} processed...`);
        if (dest && p.endsWith('.css')) cssQueue.push([dest, p]);
      }
    }),
  );
  // second wave: assets referenced from CSS
  while (cssQueue.length) {
    const [dest, p] = cssQueue.shift();
    for (const ref of await cssRefs(dest, p)) {
      if (!downloaded.has(ref)) queue.push(ref);
    }
  }
}

console.log(`Done. ${downloaded.size - failures.length} downloaded/cached, ${failures.length} failed`);
if (failures.length) {
  await writeFile(path.join(ROOT, 'data', 'asset-failures.json'), JSON.stringify(failures, null, 2));
  console.log('Failures in data/asset-failures.json (404s on legacy refs are expected, e.g. the dead inbanner pxpCx asset)');
}
