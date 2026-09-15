/**
 * retired-brands.ts — build-time removal of brands we no longer carry.
 *
 * WHY: when an affiliate deal ends (or a brand is pulled for any other
 * commercial reason) it is not enough to delete the review fragment and add a
 * 301. The brand also survives in scraped WordPress prose on OTHER pages:
 * index-page list items, WP oEmbed cards, and outbound links to the operator's
 * own domain. That prose lives in `data/rest/*.json`, which the daily WP-sync
 * REGENERATES — so editing the dump (or only the fragment body) is not durable:
 * the next sync brings the brand back.
 *
 * So we strip it at BUILD TIME on every render, exactly like the existing
 * normalizeInternalHtmlLinks() / ensureSponsored() / scrubFirstHandClaims()
 * passes (see html-links.ts for the same reasoning).
 *
 * DELIBERATELY NARROW. This module acts ONLY on the explicit brand list below
 * — it is not driven by isRetiredPath(), because most retired paths come from
 * doorway CONSOLIDATION, where the correct behaviour is the opposite: keep the
 * link and rewrite it to the survivor (html-links.ts does that). Removing a
 * brand is a different, rarer decision and stays opt-in per brand.
 *
 * Run BEFORE normalizeInternalHtmlLinks() so the original
 * `/casino/<slug>/` hrefs are still visible to match on.
 *
 * Idempotent: a no-op on prose that never mentioned these brands.
 */

/** One brand we have removed from the site. */
export interface RetiredBrand {
  /** Retired review paths, normalized with leading + trailing slash. */
  paths: readonly string[];
  /**
   * The operator's own domains. Outbound links to these are unlinked (the
   * anchor TEXT is kept, so prose stays grammatical — the anchors in question
   * read as ordinary sentence fragments, not brand names).
   */
  domains: readonly string[];
}

/**
 * Brands removed for commercial reasons, newest first.
 *
 * 2026-09-15 — affiliate deals ended for the Berriez/Speedz/Flamez and
 * Wildz/Spinz/Chipz sister brands. /casino/spinz/ is listed alongside
 * /casino/spinz-casino/ because the A-Z index still links the short legacy
 * form, and this pass runs before html-links.ts resolves it.
 *
 * 2026-09-11 — affiliate deals ended (see docs/consolidation-log-2026-07.md).
 * Pottila has no review page on this site, only an outbound link.
 */
export const RETIRED_BRANDS: readonly RetiredBrand[] = [
  { paths: ["/casino/berriez-casino/"], domains: [] },
  { paths: ["/casino/speedz-casino/"], domains: [] },
  { paths: ["/casino/flamez-kasino/"], domains: [] },
  { paths: ["/casino/wildz-casino/"], domains: [] },
  { paths: ["/casino/spinz-casino/", "/casino/spinz/"], domains: [] },
  { paths: ["/casino/chipz-casino/"], domains: [] },
  { paths: ["/casino/pelikaani-kasino/"], domains: ["pelikaanicasino-online.com"] },
  { paths: ["/casino/pelikioski/"], domains: [] },
  { paths: [], domains: ["pottilakasino.fi"] },
];

/** Escape a string for safe use inside a RegExp. */
function esc(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const RETIRED_PATHS: readonly string[] = RETIRED_BRANDS.flatMap((b) => [...b.paths]);
const RETIRED_DOMAINS: readonly string[] = RETIRED_BRANDS.flatMap((b) => [...b.domains]);

/**
 * Path alternation that tolerates the trailing slash being absent, and any
 * deeper WP sub-route (notably the `/embed/` oEmbed endpoint).
 */
function pathPattern(): string {
  return RETIRED_PATHS.map((p) => esc(p.replace(/\/$/, "")) + "(?:/[^\"']*)?").join("|");
}

/**
 * Strip every trace of a retired brand from one block of rendered HTML.
 *
 * Three rules, all scoped to the brand list above:
 *   1. `<li>` whose link targets a retired review path → the whole item goes
 *      (an A-Z index entry for a brand we no longer carry, which would
 *      otherwise render as a live-looking link to the 301 target).
 *   2. WP oEmbed card for a retired review path → removed. These are a
 *      `<blockquote class="wp-embedded-content">` plus a hidden
 *      `<iframe … src="/casino/<slug>/embed/…">`; the iframe would request a
 *      URL that no longer exists.
 *   3. Outbound `<a>` to the operator's own domain → unlinked, anchor text
 *      kept.
 */
export function stripRetiredBrands(html: string | null | undefined): string {
  if (!html) return "";
  let out = html;

  if (RETIRED_PATHS.length > 0) {
    const p = pathPattern();

    // 1. list items linking to a retired review page
    out = out.replace(
      new RegExp(`<li\\b[^>]*>\\s*(?:<[^>]+>\\s*)*<a\\b[^>]*href=["'](?:${p})["'][^>]*>[\\s\\S]*?</li>\\s*`, "gi"),
      "",
    );

    // 1b. any REMAINING in-prose link to a retired review page → unlinked,
    // anchor text kept. Editorial prose about a brand we no longer carry is
    // still factual and stays (the deal ending does not unwrite the article);
    // what must go is the LINK, which html-links.ts would otherwise rewrite to
    // the 301 target — leaving an anchor that reads "<Brand> Casino" but lands
    // on a generic list page. Runs after rule 1 so index <li> items are already
    // gone and only genuine prose links reach here.
    out = out.replace(
      new RegExp(`<a\\b[^>]*href=["'](?:${p})["'][^>]*>([\\s\\S]*?)</a>`, "gi"),
      "$1",
    );

    // 2. WP oEmbed blockquote + its hidden iframe
    out = out.replace(
      new RegExp(`<blockquote\\b[^>]*class=["'][^"']*wp-embedded-content[^"']*["'][^>]*>[\\s\\S]*?</blockquote>\\s*(?:<p>\\s*)?<iframe\\b[^>]*src=["'](?:${p})[^"']*["'][^>]*>\\s*</iframe>\\s*(?:</p>\\s*)?`, "gi"),
      "",
    );
    // …and either half on its own, in case the pair was split by the scrape.
    out = out.replace(
      new RegExp(`<iframe\\b[^>]*src=["'](?:${p})[^"']*["'][^>]*>\\s*</iframe>\\s*`, "gi"),
      "",
    );
  }

  // 3. outbound links to the operator's own domain → keep the text, drop the link
  for (const domain of RETIRED_DOMAINS) {
    out = out.replace(
      new RegExp(`<a\\b[^>]*href=["']https?://(?:www\\.)?${esc(domain)}[^"']*["'][^>]*>([\\s\\S]*?)</a>`, "gi"),
      "$1",
    );
  }

  return out;
}
