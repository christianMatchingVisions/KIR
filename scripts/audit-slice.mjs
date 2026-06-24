/**
 * audit-slice.mjs — deep content-completeness check for a slice of WP items.
 *
 * For each published item in data/rest/<file>[start..start+count], fetch the
 * LIVE Astro page and verify:
 *   - the page exists (not 4xx),
 *   - for posts/pages: the rendered article text isn't far shorter than the
 *     WordPress source content (catches truncation/clamping),
 *   - images on the page actually load (catches media that never migrated).
 * Prints ONE compact JSON line of problems (empty = all good).
 *
 *   node scripts/audit-slice.mjs <file.json> <start> <count>
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [, , file, startS, countS] = process.argv;
const start = Number(startS) || 0;
const count = Number(countS) || 9999;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://kasinotilmanrekisteroitymista.com";
const COMPARE_CONTENT = file === "posts.json" || file === "pages.json";

const strip = (h) =>
  (h || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const all = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "rest", file), "utf8"));
const items = all.filter((x) => x.status === "publish" && x.link).slice(start, start + count);

const problems = [];
for (const it of items) {
  const wpChars = COMPARE_CONTENT ? strip(it.content?.rendered).length : 0;
  let html;
  try {
    const r = await fetch(it.link, { redirect: "follow" });
    if (r.status >= 400) {
      problems.push({ url: it.link, issue: "PAGE_" + r.status });
      continue;
    }
    html = await r.text();
  } catch (e) {
    problems.push({ url: it.link, issue: "FETCH_ERR:" + e.message.slice(0, 30) });
    continue;
  }

  if (COMPARE_CONTENT && wpChars > 500) {
    const astroChars = strip(html).length;
    const ratio = astroChars / wpChars;
    if (ratio < 0.6) problems.push({ url: it.link, issue: "CONTENT_SHORT", astroChars, wpChars, ratio: +ratio.toFixed(2) });
  }

  const imgs = [...html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)]
    .map((m) => m[1])
    .filter((s) => s && !s.startsWith("data:"));
  const broken = [];
  for (const src of imgs.slice(0, 15)) {
    const u = src.startsWith("http") ? src : SITE + (src.startsWith("/") ? "" : "/") + src;
    try {
      const ir = await fetch(u, { method: "HEAD", redirect: "follow" });
      if (ir.status >= 400) broken.push(src);
    } catch {
      broken.push(src);
    }
  }
  if (broken.length) problems.push({ url: it.link, issue: "BROKEN_IMG", count: broken.length, sample: broken.slice(0, 3) });
}

console.log(JSON.stringify({ file, start, checked: items.length, problems }));
