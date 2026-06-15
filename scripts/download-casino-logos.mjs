// Download all casino logos referenced by the toplist JSON (public/rlaaf-data)
// and the scraped casino fragments. These logos are NOT plain <img src> in the
// fragment HTML — they're encoded inside base64 ShortPixel (SPAI) placeholders
// and inside the captured rlaaf-data card_image.url — so the generic
// download-assets.mjs scanner misses them. This script collects both sources,
// normalizes to /wp-content/... paths, and downloads any missing files into
// public/ preserving paths (so URLs stay 1:1 after the domain takeover).
//
// Re-run as part of sync:content. Idempotent (skips files already present).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://kasinotilmanrekisteroitymista.com';
const PUBLIC = path.join(ROOT, 'public');
const CONCURRENCY = 10;

function toLocalPath(url) {
  if (!url) return null;
  let u = url;
  try { u = decodeURIComponent(url); } catch { /* keep raw */ }
  const m = u.match(/\/wp-content\/[^"'\s?#]+/);
  return m ? m[0] : null;
}

// 1) URLs from the captured toplist JSON (meta.card_image.url)
function collectFromToplist(set) {
  const rd = path.join(PUBLIC, 'rlaaf-data');
  if (!fs.existsSync(rd)) return;
  for (const cfg of fs.readdirSync(rd)) {
    const dir = path.join(rd, cfg);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.json')) continue;
      const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      for (const it of j.results || []) {
        const p = toLocalPath(it?.meta?.card_image?.url);
        if (p) set.add(p);
      }
    }
  }
}

// 2) Logo URLs decoded from the scraped casino fragments (SPAI placeholders).
//    The data-u attr inside the base64 SVG carries the real URL.
function collectFromFragments(set) {
  const fragDir = path.join(ROOT, 'src', 'fragments');
  for (const name of fs.readdirSync(fragDir)) {
    if (!name.startsWith('casino__')) continue;
    const body = path.join(fragDir, name, 'body.html');
    if (!fs.existsSync(body)) continue;
    const html = fs.readFileSync(body, 'utf8');
    // decode each base64 SVG placeholder and pull its data-u
    for (const m of html.matchAll(/src="data:image\/svg\+xml;base64,([^"]+)"/g)) {
      try {
        const svg = Buffer.from(m[1], 'base64').toString('utf8');
        const du = svg.match(/data-u="([^"]+)"/);
        if (du) {
          const p = toLocalPath(du[1]);
          if (p && /logo|casino|kasino/i.test(p)) set.add(p);
        }
      } catch { /* skip */ }
    }
    // also any plain /wp-content logo refs
    for (const m of html.matchAll(/\/wp-content\/uploads\/[^"'\s?#]+\.(?:png|jpg|jpeg|webp|svg)/gi)) {
      if (/logo/i.test(m[0])) set.add(m[0]);
    }
  }
}

const paths = new Set();
collectFromToplist(paths);
collectFromFragments(paths);
console.log(`${paths.size} unique logo paths collected`);

const queue = [...paths];
let downloaded = 0, cached = 0;
const failures = [];

async function worker() {
  while (queue.length) {
    const p = queue.shift();
    const dest = path.join(PUBLIC, ...p.split('/').filter(Boolean).map((s) => decodeURIComponent(s)));
    if (fs.existsSync(dest)) { cached++; continue; }
    try {
      const res = await fetch(ORIGIN + p, { headers: { 'User-Agent': 'KIR-migration/1.0' } });
      if (!res.ok) { failures.push({ path: p, status: res.status }); continue; }
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
      downloaded++;
      if (downloaded % 50 === 0) console.log(`  ${downloaded} downloaded...`);
    } catch (e) {
      failures.push({ path: p, error: String(e) });
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(`Done. downloaded ${downloaded}, cached ${cached}, failed ${failures.length}`);
if (failures.length) {
  fs.writeFileSync(path.join(ROOT, 'data', 'logo-failures.json'), JSON.stringify(failures, null, 2));
  console.log('Failures (likely renamed/removed on live, e.g. buusti.png vs buusti-1.png) in data/logo-failures.json');
}
