/**
 * Casinos confirmed closed but not (yet) marked "Suljettu" in the source data
 * — the scraped review H1 and the captured toplist rows still look open, and
 * the daily WP re-sync would bring the open state back if we hand-edited them.
 *
 * ONE list, two consumers, so a closure can never be half-applied:
 *   - toplist.ts   → appends " - Suljettu" to the toplist name, so every
 *                    isOpen() filter (homepage, hubs, sidebars) drops the row;
 *   - casino-data.ts → sets showNoReview, so the review page renders the
 *                    closed template (no CTA buttons, no bonus box), is
 *                    noindexed + sitemap-excluded via noindex.ts, and leaves
 *                    the /casino/ hub and related-review links.
 *
 * Keyed by slug (toplist post_name === casino fragment slug for these).
 *
 *   simplecasino — confirmed closed 2026-07-22; no live affiliate destination.
 *   vasy-casino  — confirmed closed by the site owner 2026-09-15 (lcb.org also
 *                  lists it as closed; vasycasino.com and the affiliate
 *                  destination no longer load).
 */
export const MANUALLY_CLOSED_SLUGS: ReadonlySet<string> = new Set([
  "simplecasino",
  "vasy-casino",
]);
