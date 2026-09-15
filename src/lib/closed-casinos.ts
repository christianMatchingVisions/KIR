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
 *
 *   Closure-check batch — found by testing every promoted /go/ destination
 *   and the brand's own domain (2026-09-15), confirmed closed by the site
 *   owner the same day:
 *     nubet-casino       nubet.com titled "Nubet.com – Closed"
 *     icebet-casino      site + affiliate landing both "404 Not Found"
 *     kingpalace-casino  domain now a casino-review site
 *     rapid-casino       rapidcasino.com redirects to Muhkee.com
 *     bingobonga         domain redirects to another brand
 *     twicedice          "There is no website configured at this address"
 *     gamblii            domain no longer resolves
 *     playclub           domain no longer resolves
 *     premier-casino     site shows an error notice; link lands on another brand
 *     millionpot-casino  domain now a UK bonus portal
 *     casiplay           domain now a UK casino portal
 *     slotsnplay         domain now a UK casino portal
 */
export const MANUALLY_CLOSED_SLUGS: ReadonlySet<string> = new Set([
  "simplecasino",
  "vasy-casino",
  "nubet-casino",
  "icebet-casino",
  "kingpalace-casino",
  "rapid-casino",
  "bingobonga",
  "twicedice",
  "gamblii",
  "playclub",
  "premier-casino",
  "millionpot-casino",
  "casiplay",
  "slotsnplay",
]);
