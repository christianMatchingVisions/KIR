/**
 * dead-affiliates.ts — affiliate destinations that no longer work.
 *
 * WHY: a "Pelaa heti" button that lands on a DNS error or a 404 is worse than
 * no button — the reader bounces, and the click earns nothing. Until the owner
 * supplies replacement tracking links, these casinos keep their listing, their
 * review link and their licence badge, but render the same inert CTA the site
 * already shows for casinos with no affiliate link at all.
 *
 * EVIDENCE (checked 2026-09-30, every promoted /go/ destination tested):
 *   - 25 slugs: the tracking domain no longer resolves (NXDOMAIN). DNS is not
 *     geo-blocked, so this is conclusive from anywhere.
 *   - 3 slugs: the destination answers but is broken — hejgo (404),
 *     mobilebet-2 (404 promo page), locowin (TLS/origin error 526).
 * Slugs that merely refused OUR connection (403 "Country Blocked", timeouts)
 * are NOT listed: operators geo-block non-Finnish traffic, so those can only be
 * judged from Finland (see the closure-check notes in closed-casinos.ts).
 *
 * REVERSIBLE: delete a slug here the moment a working link is back in
 * data/go-redirects.json and the button returns automatically.
 */
export const DEAD_AFFILIATE_SLUGS: ReadonlySet<string> = new Set([
  // Tracking domain gone (NXDOMAIN).
  "amunra",
  "barz",
  "biamobet",
  "blackjack-city",
  "casilime",
  "casinofest",
  "dreamvegas-3",
  "huikee",
  "jupi-casino",
  "lumi-casino",
  "millonaria",
  "nitro-casino",
  "one-step-casino",
  "playouwin",
  "pronto",
  "slothino",
  "supernopea",
  "svenplay",
  "ultracasino",
  "vegadream",
  "vesper-casino",
  "vipscasino",
  "wallacebet",
  "wikibet",
  "wunderwins",
  // Same ivyaffsolutions.com network as barz / casilime / huikee / lumi-casino
  // above; its remaining links died after the 2026-09-30 sweep (re-checked
  // 2026-10-08: still NXDOMAIN). Igni matters most — its review is the site's
  // biggest by impressions, so a dead button there is the costliest of the set.
  "igni",
  "reload-casino",
  // Destination reachable but broken.
  "hejgo", // 404
  "locowin", // 526 (origin/TLS error)
  "mobilebet-2", // 404 — the promo landing page was removed
]);

/** Is this /go/ slug a known-dead affiliate destination? */
export function isDeadAffiliate(slug: string | null | undefined): boolean {
  if (!slug) return false;
  return DEAD_AFFILIATE_SLUGS.has(slug.replace(/^\/?go\//, "").replace(/\/$/, "").toLowerCase());
}
