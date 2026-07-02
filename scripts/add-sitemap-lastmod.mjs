/**
 * add-sitemap-lastmod.mjs — post-build "stamp <lastmod> into the sitemap" step.
 *
 * @astrojs/sitemap emits the URL set but NO <lastmod> dates. For a freshly
 * re-submitted, news-publishing, penalty-recovering site, lastmod is the single
 * highest-leverage freshness/recrawl signal for both Googlebot and AI crawlers.
 *
 * SOURCE OF TRUTH = the page's OWN emitted structured data. For every <loc> in
 * the generated sitemap, we open the built dist HTML and read the FIRST
 * "dateModified" from its JSON-LD (engine /uutiset/ + /oppaat/ articles set this
 * from the feed's updatedAt; legacy pages carry the preserved Yoast dateModified;
 * a few fall back to <meta property="article:modified_time"/> or og:updated_time).
 * Whatever date the page already publishes is what we stamp — so lastmod can
 * never contradict the page, and we never fabricate freshness. Pages with no
 * machine-readable modified date simply get no <lastmod> (Google tolerates that).
 *
 * Strict no-op safety: if the sitemap is missing or unreadable we warn and exit
 * 0 — the build must never fail because of this enrichment step.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(repoRoot, "dist");

function log(msg) {
  console.log(`[lastmod] ${msg}`);
}
function warn(msg) {
  console.warn(`[lastmod] WARN: ${msg}`);
}

/** Map a sitemap <loc> URL to its built dist HTML file (trailingSlash: always). */
function distFileForLoc(loc) {
  let pathname;
  try {
    pathname = new URL(loc).pathname;
  } catch {
    return null;
  }
  // "/" -> dist/index.html ; "/foo/" -> dist/foo/index.html
  const rel = pathname.replace(/^\//, "").replace(/\/$/, "");
  return rel
    ? path.join(distDir, rel, "index.html")
    : path.join(distDir, "index.html");
}

/** Pull the first modified date a page publishes, as YYYY-MM-DD, or null. */
function modifiedDateFromHtml(html) {
  const candidates = [
    /"dateModified"\s*:\s*"([^"]+)"/i,
    /<meta[^>]*\bproperty=["']article:modified_time["'][^>]*\bcontent=["']([^"']+)["']/i,
    /<meta[^>]*\bproperty=["']og:updated_time["'][^>]*\bcontent=["']([^"']+)["']/i,
    /"datePublished"\s*:\s*"([^"]+)"/i,
  ];
  for (const re of candidates) {
    const m = re.exec(html);
    if (m) {
      // ISO-8601 source (the WP/Yoast norm): take the LOCAL calendar date
      // straight from the string. Round-tripping through Date/toISOString()
      // re-expresses the instant in UTC, which shifts any timestamp in the
      // first hours of a +02:00/+03:00 (Finland) day to the PREVIOUS date —
      // and the whole point of this script is that lastmod may never
      // contradict the page's own visible dates.
      const iso = /^(\d{4}-\d{2}-\d{2})([T ]|$)/.exec(m[1]);
      if (iso) return iso[1];
      // Non-ISO fallback (rare): best-effort parse.
      const d = new Date(m[1]);
      if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    }
  }
  return null;
}

function processSitemapFile(file) {
  let xml = fs.readFileSync(file, "utf8");
  let stamped = 0;
  let already = 0;
  let nodate = 0;

  xml = xml.replace(/<url>([\s\S]*?)<\/url>/g, (full, inner) => {
    if (/<lastmod>/i.test(inner)) {
      already++;
      return full;
    }
    const locMatch = /<loc>([^<]+)<\/loc>/i.exec(inner);
    if (!locMatch) return full;
    const distFile = distFileForLoc(locMatch[1].trim());
    if (!distFile || !fs.existsSync(distFile)) {
      nodate++;
      return full;
    }
    const date = modifiedDateFromHtml(fs.readFileSync(distFile, "utf8"));
    if (!date) {
      nodate++;
      return full;
    }
    stamped++;
    // Insert <lastmod> immediately after </loc>, mirroring sitemap key order.
    const newInner = inner.replace(
      /(<loc>[^<]+<\/loc>)/i,
      `$1<lastmod>${date}</lastmod>`,
    );
    return `<url>${newInner}</url>`;
  });

  fs.writeFileSync(file, xml);
  log(
    `${path.basename(file)}: stamped ${stamped}, already had ${already}, no date ${nodate}`,
  );
}

function main() {
  if (!fs.existsSync(distDir)) {
    warn(`dist/ not found at ${distDir} — skipping (no-op).`);
    return;
  }
  // @astrojs/sitemap emits sitemap-0.xml (+ sitemap-N.xml for large sites) and
  // the sitemap-index.xml wrapper. Stamp the child url-set files only.
  const files = fs
    .readdirSync(distDir)
    .filter((f) => /^sitemap-\d+\.xml$/i.test(f))
    .map((f) => path.join(distDir, f));

  if (files.length === 0) {
    warn("no sitemap-N.xml files in dist/ — skipping (no-op).");
    return;
  }
  for (const file of files) processSitemapFile(file);
}

try {
  main();
} catch (err) {
  warn(`unexpected error (continuing): ${err?.message ?? err}`);
}
