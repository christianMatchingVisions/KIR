/**
 * Centralized NOINDEX policy for the KIR rebuild
 * (kasinotilmanrekisteroitymista.com).
 *
 * WHY (penalty recovery + thin-content findings H7/L7):
 * The live corpus contains a tail of THIN casino-review pages that should not be
 * fed to Google as indexable content during penalty recovery:
 *   - 61 "Suljettu" (closed) casinos, and
 *   - 25 empty stub reviews (no prose, no ratings, no sub-ratings).
 * Both are already detected by the data layer as `showNoReview === true` on the
 * parsed CasinoReview (closedByTitle OR empty stub AND no engine data). We reuse
 * that single source of truth here so the noindex set can never drift from what
 * the review template actually renders as "no review".
 *
 * This module is the ONE place that decides "should this path be noindexed?".
 * Two consumers:
 *   1. BaseLayout.astro — emits exactly one <meta name="robots" content=
 *      "noindex,follow"> for these paths and SUPPRESSES any preserved index
 *      robots meta (no duplicate robots tags).
 *   2. astro.config.mjs @astrojs/sitemap `filter` — drops these paths from
 *      sitemap-0.xml so closed/stub pages are not advertised.
 *
 * PURE + SYNC + cwd-anchored, exactly like casino-data.ts / seo-head.ts: it only
 * reads the already-synced fragments via getCasino(). Real pages (the 582
 * indexable URLs) are unaffected — their byte-faithful preserved head is emitted
 * untouched and they stay in the sitemap.
 *
 * Additive + reversible: emptying NOINDEX_PATHS and having every casino report
 * showNoReview === false would restore today's behaviour exactly.
 */
import { getCasino } from "./casino-data";

/**
 * Explicit extra noindex paths for any KNOWN-THIN net-new (non-casino) page.
 * Kept empty by default — the casino showNoReview rule covers the known thin
 * tail. Add normalized "/path/" entries here only for deliberate exclusions.
 * (Normalized = single leading + trailing slash; see normalizePath below.)
 */
const NOINDEX_PATHS: ReadonlySet<string> = new Set<string>([
  // e.g. "/some-known-thin-page/"
]);

/**
 * Normalize a URL path to a single leading AND trailing slash, query/hash
 * stripped — mirrors seo-head.ts normalizePath so lookups agree.
 *   ""                 -> "/"
 *   "casino/foo"       -> "/casino/foo/"
 *   "/casino/foo?x=1"  -> "/casino/foo/"
 */
function normalizePath(p: string): string {
  if (!p) return "/";
  let s = p.split(/[?#]/)[0];
  if (!s.startsWith("/")) s = "/" + s;
  if (!s.endsWith("/")) s = s + "/";
  return s.replace(/\/{2,}/g, "/");
}

/**
 * Extract the casino slug from a normalized "/casino/<slug>/" path, else null.
 * Only single-segment casino review paths qualify (the [slug].astro route);
 * deeper paths (none exist today) are intentionally ignored.
 */
function casinoSlugFromPath(normalized: string): string | null {
  const m = /^\/casino\/([^/]+)\/$/.exec(normalized);
  return m ? m[1] : null;
}

/**
 * Should the given URL path be served as noindex (and excluded from sitemap)?
 *
 * Returns true when:
 *   (a) the path is a closed/stub casino review — i.e. getCasino(slug) exists
 *       and has showNoReview === true (covers the 61 Suljettu + 25 empty stubs),
 *       OR
 *   (b) the path is in the explicit NOINDEX_PATHS allowlist.
 *
 * Pure + synchronous: safe to call from Astro frontmatter (BaseLayout) and from
 * the node-evaluated astro.config.mjs sitemap filter. Never throws — an unknown
 * or unparsable casino slug simply yields false (page stays indexable).
 */
export function shouldNoindex(path: string): boolean {
  const normalized = normalizePath(path);

  if (NOINDEX_PATHS.has(normalized)) return true;

  const slug = casinoSlugFromPath(normalized);
  if (slug) {
    const casino = getCasino(slug);
    if (casino && casino.showNoReview === true) return true;
  }

  return false;
}
