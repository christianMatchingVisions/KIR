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
  /* --------------------------------------------------------------------
   * OFF-NICHE TOPICAL DILUTION — 2026-07 recovery plan, item K4.
   * Added 2026-07-04.
   *
   * These pages are off the site's casino/payments topic (crypto price
   * analysis, esports history, a recipe-site listicle, streamer profiles,
   * gaming-trend commentary, football tournament stats/news). During the
   * penalty recovery we stop feeding them to Google so the indexed corpus
   * stays topically tight. noindex,follow is deliberately REVERSIBLE (no
   * deletion, no 301): remove an entry here and the page's original
   * preserved head + sitemap entry come back exactly as before.
   *
   * Every path below was verified against its source of truth on
   * 2026-07-04: the five fragment paths against src/fragments/<dir>/
   * meta.json "path", the two football routes against their dedicated
   * page dirs under src/pages/ (mm-kisat renders a clean head and gates
   * its own robots meta on shouldNoindex — see its index.astro;
   * huuhkajien forwards seoPath through ArticlePage → BaseLayout, which
   * strips the preserved robots meta and emits the noindex).
   * ------------------------------------------------------------------ */
  "/bitcoin-hintaromahdus-syyt-analyysi/",
  "/esportsin-ja-nettikasinoiden-historia-ja-kasvu-kasi-kadessa/",
  "/atjkitchen-com-vaihtoehdot-6/",
  "/parhaat-suomalaiset-nettikasinostriimaajat/",
  "/pelitrendit-fortnitesta-peliautomaatteihin-mika-vetaa-pelaajia-puoleensa/",
  "/mm-kisat-2026-tilastot/",
  "/huuhkajien-jatko-em-jalkapalloturnauksessa-riippuu-tuurista/",

  /* --------------------------------------------------------------------
   * OFF-ARCHITECTURE SLOT PAGES — batch A.5 cluster C (GSC audit §8).
   * Added 2026-07-06.
   *
   * The four /pragmatic-play/<game>/ slot reviews sit outside the site's
   * casino/payments architecture and Google already refuses them (GSC
   * "Crawled – currently not indexed", report of 2026-06-30 — listed there
   * under their legacy WP slugs great-rhino-megaways-arvostelu /
   * sweet-bonanza-2 / wolf-gold-2; the paths below are the live routes the
   * static build actually emits, per each fragment's meta.json). NOT
   * deleted: noindex,follow keeps them reversible if a slots strategy
   * emerges. The /pragmatic-play/ hub itself stays indexable.
   * ------------------------------------------------------------------ */
  "/pragmatic-play/great-rhino-megaways/",
  "/pragmatic-play/sweet-bonanza-arvostelu/",
  "/pragmatic-play/wolf-gold-arvostelu/",
  "/pragmatic-play/john-hunter-and-the-tomb-of-the-scarab-queen/",
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
