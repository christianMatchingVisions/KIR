/**
 * internal-routes.ts — the authoritative set of valid internal page routes plus
 * a deterministic, SELF-VALIDATING repair resolver for broken in-prose links.
 *
 * WHY (SEO audit Phase 3): the rendered build carried 65 distinct internal links
 * that 404, almost all in three systematic shapes left over from the WordPress
 * corpus:
 *   - `/blog/<slug>`            → the site has no /blog/ prefix; pages live at root
 *   - `/new-faq-question[-N]`   → FAQ pages live under /ht-faq/<slug>/
 *   - `/casino/<slug>/`         → the review slug differs (…-kasino vs …-casino)
 * plus a handful of renamed-guide one-offs (handled explicitly in html-links.ts).
 *
 * Rather than hand-map 65 links (fragile, and re-broken by the daily WP re-sync),
 * we repair them at BUILD TIME against the REAL route set. The set is derived
 * from the same data the router uses — `listSeoPaths()` (every fragment-backed
 * URL) ∪ the casino review slugs ∪ the brand-new hub routes — so a repair is
 * only ever emitted when the destination is proven to exist. Unresolvable links
 * fall back to the most relevant LIVE hub (never a guessed/dead URL). This is the
 * runbook's prescription: "update the link to the live canonical URL … else
 * replace with a relevant live guide."
 *
 * Pure build-time + memoized. Consumed by src/lib/html-links.ts.
 */
import { listSeoPaths } from "./seo-head";
import { listCasinoSlugs } from "./casino-data";

/** Routes that exist WITHOUT a scraped fragment (brand-new hubs/sections). */
const EXTRA_ROUTES: readonly string[] = [
  "/",
  "/casino/",
  "/oppaat/",
  "/uutiset/",
  "/toimitus/",
  "/ht-faq/",
];

let _valid: Set<string> | null = null;
let _casinoSlugs: Set<string> | null = null;

function validPaths(): Set<string> {
  if (_valid === null) {
    const s = new Set<string>();
    for (const p of listSeoPaths()) s.add(p); // every fragment-backed URL
    for (const slug of listCasinoSlugs()) s.add(`/casino/${slug}/`);
    for (const r of EXTRA_ROUTES) s.add(r);
    _valid = s;
  }
  return _valid;
}

function casinoSlugs(): Set<string> {
  if (_casinoSlugs === null) _casinoSlugs = new Set(listCasinoSlugs());
  return _casinoSlugs;
}

/** Is `normalized` ("/path/") a real internal page route in this build? */
export function isKnownRoute(normalized: string): boolean {
  return validPaths().has(normalized);
}

/**
 * Resolve a root-relative internal page path to a VALID route.
 *   - already valid → returned with a single trailing slash,
 *   - /blog/<x>      → /<x>/ (else /oppaat/),
 *   - /new-faq-…     → /ht-faq/<slug>/ (else /ht-faq/),
 *   - /casino/<slug> → canonical review (…-kasino/…-casino variants) else
 *                      /kaikki-kasinot/,
 *   - no rule + not valid → returned slash-normalised unchanged (an explicit
 *     html-links fix, or the audit, handles any residue).
 * Input must be a path only (no query/hash); caller re-appends those.
 */
export function resolveInternalPath(pathPart: string): string {
  let slashed = pathPart.startsWith("/") ? pathPart : "/" + pathPart;
  if (!slashed.endsWith("/")) slashed += "/";
  slashed = slashed.replace(/\/{2,}/g, "/");

  const valid = validPaths();
  if (valid.has(slashed)) return slashed;

  // 1) /blog/<rest>/ → /<rest>/
  const blog = /^\/blog\/(.+\/)$/.exec(slashed);
  if (blog) {
    const cand = "/" + blog[1];
    return valid.has(cand) ? cand : "/oppaat/";
  }

  // 2) root /new-faq-question*/ → /ht-faq/<slug>/
  const faq = /^\/(new-faq-question[a-z0-9-]*)\/$/i.exec(slashed);
  if (faq) {
    const cand = `/ht-faq/${faq[1]}/`;
    return valid.has(cand) ? cand : "/ht-faq/";
  }

  // 3) /casino/<slug>/ → canonical review slug, else the all-casinos hub
  const cas = /^\/casino\/([^/]+)\/$/.exec(slashed);
  if (cas) {
    const base = cas[1];
    const slugs = casinoSlugs();
    const stems = new Set<string>([base]);
    if (base.endsWith("-casino") || base.endsWith("-kasino")) {
      stems.add(base.slice(0, -7));
    }
    for (const stem of stems) {
      for (const cand of [stem, `${stem}-kasino`, `${stem}-casino`]) {
        if (slugs.has(cand)) return `/casino/${cand}/`;
      }
    }
    return "/kaikki-kasinot/";
  }

  // No deterministic repair — leave it slash-normalised.
  return slashed;
}
