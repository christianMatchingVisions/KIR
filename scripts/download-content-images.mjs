// Download the INLINE / GALLERY images referenced by editorial content and
// casino reviews — the numbered review screenshots and post/page images that
// the generic asset scraper (download-assets.mjs) and the logo scraper
// (download-casino-logos.mjs) both miss.
//
// WHY THEY ARE MISSED
//   - download-assets.mjs scans the raw fragment HTML for *plain* /wp-content
//     and /wp-includes refs. The inline images are NOT plain <img src> there:
//     they are ShortPixel (SPAI) lazy-load placeholders whose src is a base64
//     data: SVG, with the REAL url URL-encoded in a `data-u` attribute inside
//     that SVG. So the scanner sees only the placeholder, never the real path.
//   - download-casino-logos.mjs decodes the SPAI placeholders too, but filters
//     to /logo|casino|kasino/ paths — by design it grabs ONLY the logos and
//     skips the numbered gallery screenshots (1clickwin2.png, 21red4.jpg, …).
//   - The REST posts/pages content.rendered ALSO uses SPAI placeholders, whose
//     data-u decodes to /wp-content/uploads/... images that nothing fetched.
//
// WHAT THIS SCRIPT DOES
//   Collects /wp-content/... image paths from:
//     (a) data/rest/posts.json + pages.json content.rendered
//         — SPAI base64 data-u, plain <img src>/srcset, self-origin absolutes
//     (b) the casino reviewHtml — read from the SAME source casino-data.ts uses
//         (src/fragments/casino__*/body.html), decoding SPAI data-u placeholders
//         AND any plain <img src> in the prose
//   Normalizes every reference to a root-relative /wp-content/... path, then
//   downloads any that are missing from public/<path> (preserving paths so URLs
//   stay 1:1 after the domain takeover). Concurrency 10, skips existing files,
//   reports downloaded/cached/failed, and writes 404s/errors to
//   data/content-image-failures.json (some legacy gallery shots are genuinely
//   gone on the live site — those degrade gracefully via the <img> onerror
//   fallbacks already in the templates).
//
// Re-run as part of sync:content (wired after download-casino-logos). Idempotent.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://kasinotilmanrekisteroitymista.com';
const PUBLIC = path.join(ROOT, 'public');
const REST = path.join(ROOT, 'data', 'rest');
const FRAGMENTS = path.join(ROOT, 'src', 'fragments');
const CONCURRENCY = 10;

// Only fetch real image files; ignore scripts/styles/fonts that may also live
// under /wp-content (those are handled by download-assets.mjs).
const IMG_EXT = /\.(?:png|jpe?g|webp|gif|svg|avif)$/i;

/**
 * Normalize any image reference to a clean, root-relative /wp-content/... path.
 * Strips the SPAI CDN prefix, the self-origin, query strings and fragments.
 * Returns null when the ref is not a self-hosted /wp-content image.
 */
function toLocalPath(url) {
  if (!url) return null;
  let u = url;
  // SPAI CDN-wrapped url: https://cdn.shortpixel.ai/spai/<opts>/<realhost>/...
  u = u.replace(/^https?:\/\/cdn\.shortpixel\.ai\/spai\/[^/]+\//, 'https://');
  try { u = decodeURIComponent(u); } catch { /* keep raw */ }
  u = u.replace(/&(?:amp|#0?38);/g, '&').replace(/\\\//g, '/');
  const m = u.match(/\/wp-content\/[^"'\s?#)<>]+/);
  if (!m) return null;
  const p = m[0].split('?')[0].split('#')[0];
  return IMG_EXT.test(p) ? p : null;
}

/** Decode a single SPAI base64 SVG payload to its real (decoded) url, or null. */
function realUrlFromSpaiBase64(b64) {
  try {
    const svg = Buffer.from(b64, 'base64').toString('utf8');
    const dataU = svg.match(/data-u="([^"]+)"/)?.[1];
    return dataU ? decodeURIComponent(dataU) : null;
  } catch {
    return null;
  }
}

/** Pull every image path out of an HTML blob into `set`. */
function collectFromHtml(html, set) {
  if (!html) return;
  // 1) SPAI lazy-load placeholders: real url hides in the base64 SVG's data-u.
  for (const m of html.matchAll(/data:image\/svg\+xml;base64,([A-Za-z0-9+/=]+)/g)) {
    const real = realUrlFromSpaiBase64(m[1]);
    const p = toLocalPath(real);
    if (p) set.add(p);
  }
  // 2) Plain <img src="..."> (already-eager images, rare in this corpus).
  for (const m of html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/gi)) {
    if (m[1].startsWith('data:')) continue;
    const p = toLocalPath(m[1]);
    if (p) set.add(p);
  }
  // 3) srcset candidates (responsive variants).
  for (const m of html.matchAll(/\bsrcset="([^"]+)"/gi)) {
    for (const cand of m[1].split(',')) {
      const url = cand.trim().split(/\s+/)[0];
      const p = toLocalPath(url);
      if (p) set.add(p);
    }
  }
  // 4) Any remaining bare /wp-content (or self-origin) image url in the markup.
  for (const m of html.matchAll(
    /(?:https?:\/\/(?:www\.)?kasinotilmanrekisteroitymista\.com)?\/wp-content\/[^"'\s?#)<>]+/gi,
  )) {
    const p = toLocalPath(m[0]);
    if (p) set.add(p);
  }
}

/** (a) Editorial REST content: posts.json + pages.json content.rendered. */
function collectFromRest(set) {
  for (const name of ['posts.json', 'pages.json']) {
    const file = path.join(REST, name);
    if (!fs.existsSync(file)) continue;
    let arr;
    try {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
      arr = Array.isArray(parsed) ? parsed : [];
    } catch {
      continue;
    }
    for (const item of arr) {
      collectFromHtml(item?.content?.rendered, set);
      collectFromHtml(item?.excerpt?.rendered, set);
    }
  }
}

/** (b) Casino reviews: the SAME body.html fragments casino-data.ts reads. */
function collectFromCasinoFragments(set) {
  if (!fs.existsSync(FRAGMENTS)) return;
  for (const name of fs.readdirSync(FRAGMENTS)) {
    if (!name.startsWith('casino__')) continue;
    const body = path.join(FRAGMENTS, name, 'body.html');
    if (!fs.existsSync(body)) continue;
    collectFromHtml(fs.readFileSync(body, 'utf8'), set);
  }
}

const paths = new Set();
collectFromRest(paths);
collectFromCasinoFragments(paths);
console.log(`${paths.size} unique content-image paths collected (posts/pages + casino reviews)`);

const queue = [...paths];
let downloaded = 0;
let cached = 0;
const failures = [];

async function worker() {
  while (queue.length) {
    const p = queue.shift();
    const dest = path.join(
      PUBLIC,
      ...p.split('/').filter(Boolean).map((s) => {
        try { return decodeURIComponent(s); } catch { return s; }
      }),
    );
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
  fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
  fs.writeFileSync(
    path.join(ROOT, 'data', 'content-image-failures.json'),
    JSON.stringify(failures, null, 2),
  );
  console.log(
    'Failures in data/content-image-failures.json — legacy gallery shots removed on the live site; they degrade gracefully via <img> onerror fallbacks.',
  );
}
