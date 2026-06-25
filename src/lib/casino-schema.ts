/**
 * casino-schema.ts — restore the per-casino structured data (JSON-LD) that the
 * live WordPress pages carried in their <body>, plus an additive E-E-A-T
 * publisher/editorial-author layer.
 *
 * WHY THIS EXISTS (penalty recovery + findings B2/H7):
 * Every casino's Organization (+ a Review on ~265 of them) JSON-LD lives in
 *   src/fragments/casino__<slug>/body.html
 * as <script type="application/ld+json"> blocks. The rebuilt light-theme review
 * route renders the CLEANED prose only — it does NOT re-emit those body scripts,
 * and the SEO-head registry (seo-head.ts) reads head.html ONLY. So the live
 * Organization/Review schema was being DROPPED from the rebuilt pages. This
 * module reads body.html and returns those blocks VERBATIM (raw strings — never
 * JSON.parse/restringify, which would re-order keys + change escaping that
 * Google has indexed) so the route can re-emit them byte-faithfully.
 *
 * E-E-A-T (additive, finding H7): we also attach, once per page, a publisher
 * Organization + an editorial author byline. The publisher is the existing
 * site Organization ("Kasinot ilman rekisteröitymistä", @id .../#organization).
 * The editorial author is an Organization "KIR-toimitus" (NOT a fabricated
 * Person — this is a read-only penalty-recovery site with no named reviewer).
 * To avoid duplicate-entity CONFLICTS we never mutate or reserialize the
 * verbatim body Review (its author/publisher already reference the site org by
 * @id on all 265 live Review blocks). Instead we emit ONE extra block that
 * DEFINES the editorial author Organization and links it to the review via an
 * Organization node carrying `subOrganization` — a valid, conflict-free graph
 * addition. When a casino's body has NO Review at all we still publish the
 * editorial-author + publisher definition so the page gains the E-E-A-T signal.
 *
 * Pure node:fs + regex. No new dependencies. Build-time only — never shipped to
 * the client. Mirrors the fragments-dir resolution used by casino-data.ts /
 * seo-head.ts (anchor on process.cwd(); fall back to import.meta.url).
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/** Site origin (matches casino-data.ts / astro.config site). */
const SITE_URL = "https://kasinotilmanrekisteroitymista.com";

/** Stable @id of the site publisher Organization (as used in the live blocks). */
const PUBLISHER_ID = `${SITE_URL}/#organization`;
/** Stable @id of the editorial-author Organization we add for E-E-A-T. */
const EDITORIAL_ID = `${SITE_URL}/#editorial-team`;

/**
 * Resolve src/fragments from the project root (stable in `astro dev` and
 * `astro build`). Vite bundles this into dist/pages/*.astro.mjs, so an
 * import.meta.url `../fragments` hop would miss src/fragments at build time —
 * anchor on process.cwd() first, keep the module-relative path as a fallback.
 */
function resolveFragmentsDir(): string {
  const fromCwd = join(process.cwd(), "src", "fragments");
  if (existsSync(fromCwd)) return fromCwd;
  return join(dirname(fileURLToPath(import.meta.url)), "..", "fragments");
}
const FRAGMENTS_DIR = resolveFragmentsDir();

/** Matches a whole <script type="application/ld+json">…</script> block. */
const LD_JSON_RE =
  /<script[^>]*\btype=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi;

/** Does a verbatim block contain a Review node? (cheap, no JSON.parse). */
function blockHasReview(block: string): boolean {
  return /"@type"\s*:\s*"Review"/.test(block);
}

/**
 * Sanitize a verbatim casino Review JSON-LD block WITHOUT JSON.parse/stringify
 * (byte-faithful for everything else — mirrors sanitizePreservedJsonLd in
 * seo-head.ts). Clears the schema.org validation error on ~265 casino pages:
 *   1. The scrape produced a DEGENERATE reviewRating where ratingValue,
 *      bestRating and worstRating are all the SAME value (e.g. all "4.7"). The
 *      \1 backreference matches ONLY that all-equal case, so a correct rating
 *      (best 5 / worst 1) is never touched. Rewrite best/worst to the real
 *      5/1 scale, preserving the original ratingValue verbatim.
 *   2. dateCreated carried a leading space + trailing "=" (" 2025-10-30=") —
 *      strip them to a clean ISO date. Optional tokens make this idempotent.
 */
function sanitizeCasinoReviewBlock(block: string): string {
  return block
    .replace(
      /"reviewRating":\{"@type":"Rating","ratingValue":"([0-9.]+)","bestRating":"\1","worstRating":"\1"\}/g,
      '"reviewRating":{"@type":"Rating","ratingValue":"$1","bestRating":"5","worstRating":"1"}',
    )
    .replace(/"dateCreated":" ?(\d{4}-\d{2}-\d{2})=?"/g, '"dateCreated":"$1"');
}

/**
 * Read a casino fragment's body.html and return EVERY
 * <script type="application/ld+json"> block VERBATIM (raw strings, byte-faithful
 * — no parsing/reformatting), in document order. Returns [] when the fragment or
 * its body.html is missing, or when it carries no JSON-LD (e.g. a bare stub).
 */
export function getCasinoBodyJsonLd(slug: string): string[] {
  const bodyPath = join(FRAGMENTS_DIR, `casino__${slug}`, "body.html");
  if (!existsSync(bodyPath)) return [];
  let body: string;
  try {
    body = readFileSync(bodyPath, "utf8");
  } catch {
    return [];
  }
  return (body.match(LD_JSON_RE) ?? []).map(sanitizeCasinoReviewBlock);
}

/**
 * Build the additive E-E-A-T block: a graph defining the editorial author
 * Organization "KIR-toimitus" and the publisher Organization (the site org).
 *
 * This is emitted ONCE per page and is intentionally separate from the verbatim
 * body Review so we never reserialize / conflict with the live, indexed Review
 * markup. The editorial Organization is linked as a subOrganization of the
 * publisher, giving Google an explicit author→publisher relationship without
 * inventing a Person. Newly authored (not from the scrape) so it is safe to
 * emit as clean, key-stable JSON.
 *
 * @param casinoName display name of the casino (for a human-readable label).
 */
function buildEeatBlock(casinoName: string): string {
  const safeName = casinoName && casinoName.trim().length > 0 ? casinoName.trim() : null;
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": PUBLISHER_ID,
        name: "Kasinot ilman rekisteröitymistä",
        url: `${SITE_URL}/`,
        subOrganization: { "@id": EDITORIAL_ID },
      },
      {
        "@type": "Organization",
        "@id": EDITORIAL_ID,
        name: "KIR-toimitus",
        url: `${SITE_URL}/`,
        parentOrganization: { "@id": PUBLISHER_ID },
        description: safeName
          ? `Kasinot ilman rekisteröitymistä -sivuston toimitus, joka laatii ja ylläpitää kasinoarvostelut, mukaan lukien ${safeName}.`
          : "Kasinot ilman rekisteröitymistä -sivuston toimitus, joka laatii ja ylläpitää kasinoarvostelut.",
      },
    ],
  };
  return `<script type="application/ld+json">${JSON.stringify(graph)}</script>`;
}

/**
 * The full set of JSON-LD blocks the casino route should emit into the page
 * body, in order:
 *   1. every VERBATIM body.html block (Organization, and Review when present)
 *   2. ONE additive E-E-A-T block (editorial author + publisher Organizations)
 *
 * Double-emission guard: any body block byte-identical to a block ALREADY in the
 * preserved <head> (passed via `headJsonLd` from seo-head.ts) is skipped, so we
 * never duplicate a script the head registry already emitted. (In the current
 * corpus casino head.html files carry no ld+json, so nothing is skipped — but
 * the guard makes this correct if that ever changes.)
 *
 * @param slug         casino fragment slug (the part after `casino__`).
 * @param casinoName   display name (for the editorial block's description).
 * @param headJsonLd   raw ld+json strings already emitted in <head> (dedup set).
 */
export function getCasinoSchemaBlocks(
  slug: string,
  casinoName: string,
  headJsonLd: readonly string[] = [],
): string[] {
  const headSet = new Set(headJsonLd.map((s) => s.trim()));
  const body = getCasinoBodyJsonLd(slug).filter((b) => !headSet.has(b.trim()));

  const blocks: string[] = [...body];

  // Only add the E-E-A-T block if the head hasn't already emitted an identical
  // editorial definition (keeps the guard honest under future head changes).
  const eeat = buildEeatBlock(casinoName);
  if (!headSet.has(eeat.trim())) blocks.push(eeat);

  return blocks;
}

/** Re-export the constants for tests / debugging. */
export { PUBLISHER_ID, EDITORIAL_ID };

/** True when this casino's body carries a Review JSON-LD block. */
export function casinoHasReviewSchema(slug: string): boolean {
  return getCasinoBodyJsonLd(slug).some(blockHasReview);
}
