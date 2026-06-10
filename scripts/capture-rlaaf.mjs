// The affiliateKIR theme renders its casino toplists CLIENT-SIDE via the
// RL-Advanced-Ajax-Filter plugin: main.js fetches a settings JSON, then POSTs
// it to /wp-json/rlaaf/search/run and Mustache-renders the response. That
// endpoint doesn't exist on the static build, so we capture every (settings,
// page) response from the live WP API into public/rlaaf-data/<name>/page-N.json.
// The local rlaaf.js is patched to GET these files instead of POSTing.
//
// Re-run as part of sync:content so toplists stay current while WP is live.
import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://kasinotilmanrekisteroitymista.com';
const API = `${ORIGIN}/wp-json/rlaaf/search/run`;
const FRAGMENTS = path.join(ROOT, 'src', 'fragments');
const OUT = path.join(ROOT, 'public', 'rlaaf-data');
const ITEMS_PER_PAGE = 20; // every page on the site uses 20

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// jQuery $.param (traditional=false): objects -> key[sub], arrays of
// scalars -> key[], arrays of objects/arrays -> key[i].
function jqParam(obj, prefix, out = []) {
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => {
      const key = typeof v === 'object' && v !== null ? `${prefix}[${i}]` : `${prefix}[]`;
      jqParam(v, key, out);
    });
  } else if (typeof obj === 'object' && obj !== null) {
    for (const [k, v] of Object.entries(obj)) {
      jqParam(v, prefix ? `${prefix}[${k}]` : k, out);
    }
  } else {
    out.push(`${encodeURIComponent(prefix)}=${encodeURIComponent(obj ?? '')}`);
  }
  return out;
}

async function collectSettingsUrls() {
  const urls = new Set();
  for (const d of await readdir(FRAGMENTS)) {
    for (const f of ['body.html']) {
      const file = path.join(FRAGMENTS, d, f);
      if (!existsSync(file)) continue;
      const text = await readFile(file, 'utf8');
      for (const m of text.matchAll(/data-settings-url="([^"]+)"/g)) {
        urls.add(m[1].trim());
      }
    }
  }
  return [...urls];
}

async function runSearch(settings, page) {
  const body = jqParam({
    ...settings,
    pagination: { items_per_page: ITEMS_PER_PAGE, page },
  }).join('&');
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'User-Agent': 'KIR-migration/1.0',
    },
    body,
  });
  if (!res.ok) throw new Error(`page ${page}: HTTP ${res.status}`);
  return res.json();
}

const settingsUrls = await collectSettingsUrls();
console.log(`${settingsUrls.length} unique RLAAF settings files`);

for (const url of settingsUrls) {
  const name = url.split('/').pop().replace(/\.json$/i, '');
  const localSettings = path.join(ROOT, 'public', ...url.split('/').filter(Boolean));
  const settings = JSON.parse(await readFile(localSettings, 'utf8'));
  const dir = path.join(OUT, name);
  await mkdir(dir, { recursive: true });

  const first = await runSearch(settings, 1);
  await writeFile(path.join(dir, 'page-1.json'), JSON.stringify(first));
  const maxPages = Math.min(Number(first.pagination?.max_pages ?? 1), 50);
  for (let p = 2; p <= maxPages; p++) {
    const data = await runSearch(settings, p);
    await writeFile(path.join(dir, `page-${p}.json`), JSON.stringify(data));
    await sleep(200);
  }
  console.log(`${name}: ${maxPages} page(s)`);
  await sleep(200);
}
console.log('Done.');
