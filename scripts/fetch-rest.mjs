// Fetch all content from the live WordPress REST API into data/rest/.
// The WP REST API is read-only for us (writes 401), reads work fine.
// Also generates vercel.json /go/ affiliate redirects from ThirstyAffiliates data.
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://kasinotilmanrekisteroitymista.com/wp-json/wp/v2';
const OUT = path.join(ROOT, 'data', 'rest');

const TYPES = [
  { rest: 'posts', file: 'posts.json' },
  { rest: 'pages', file: 'pages.json' },
  { rest: 'casino', file: 'casino.json' },
  { rest: 'ht-faq', file: 'ht-faq.json' },
  { rest: 'thirstylink', file: 'thirstylink.json' },
  { rest: 'categories', file: 'categories.json' },
  { rest: 'tags', file: 'tags.json' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchAll(restBase) {
  const items = [];
  for (let page = 1; ; page++) {
    const url = `${API}/${restBase}?per_page=100&page=${page}&_embed=0`;
    const res = await fetch(url, { headers: { 'User-Agent': 'KIR-migration/1.0' } });
    if (res.status === 400) break; // past last page
    if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    items.push(...batch);
    const totalPages = Number(res.headers.get('x-wp-totalpages') || 1);
    if (page >= totalPages) break;
    await sleep(250);
  }
  return items;
}

await mkdir(OUT, { recursive: true });

for (const { rest, file } of TYPES) {
  process.stdout.write(`Fetching ${rest}... `);
  const items = await fetchAll(rest);
  await writeFile(path.join(OUT, file), JSON.stringify(items, null, 1));
  console.log(`${items.length} items`);
}

// --- Generate /go/ redirects from ThirstyAffiliates links ---
const links = JSON.parse(await readFile(path.join(OUT, 'thirstylink.json'), 'utf8'));
const redirects = [];
for (const l of links) {
  const dest = l._ta_destination_url;
  if (!dest || l.status !== 'publish') continue;
  // ThirstyAffiliates serves 302s; keep them temporary (affiliate URLs change).
  redirects.push({ source: `/go/${l.slug}`, destination: dest, permanent: false });
  redirects.push({ source: `/go/${l.slug}/`, destination: dest, permanent: false });
}

const vercelPath = path.join(ROOT, 'vercel.json');
const vercel = existsSync(vercelPath)
  ? JSON.parse(await readFile(vercelPath, 'utf8'))
  : {};
vercel.redirects = redirects;
await writeFile(vercelPath, JSON.stringify(vercel, null, 2));
console.log(`Wrote ${redirects.length} redirect rules (${links.length} /go/ links) to vercel.json`);
